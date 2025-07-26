import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import tripRoutes from './routes/trips.js';
import chatRoutes from './routes/chat.js';
import { authenticateSocket } from './middleware/auth.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? process.env.CLIENT_URL : "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/chat', chatRoutes);

// Socket.IO for real-time chat
io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  socket.on('join-trip', (tripId) => {
    socket.join(tripId);
    console.log(`User ${socket.userId} joined trip ${tripId}`);
  });

  socket.on('leave-trip', (tripId) => {
    socket.leave(tripId);
    console.log(`User ${socket.userId} left trip ${tripId}`);
  });

  socket.on('send-message', async (data) => {
    try {
      const { tripId, content } = data;
      
      // Save message to database
      const Message = (await import('./models/Message.js')).default;
      const message = new Message({
        tripId,
        sender: socket.userId,
        content,
        timestamp: new Date()
      });
      
      await message.save();
      await message.populate('sender', 'name photo');

      // Emit to all users in the trip
      io.to(tripId).emit('new-message', {
        _id: message._id,
        tripId: message.tripId,
        sender: message.sender,
        content: message.content,
        timestamp: message.timestamp
      });
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('message-error', { error: 'Failed to send message' });
    }
  });

  socket.on('typing', (data) => {
    socket.to(data.tripId).emit('user-typing', {
      userId: socket.userId,
      tripId: data.tripId
    });
  });

  socket.on('stop-typing', (data) => {
    socket.to(data.tripId).emit('user-stop-typing', {
      userId: socket.userId,
      tripId: data.tripId
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});