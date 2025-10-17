import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import connectDB from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import tripRoutes from './routes/trips.js';
import chatRoutes from './routes/chat.js';
import notificationRoutes from './routes/notifications.js';
import { authenticateSocket } from './middleware/auth.js';

// Fix for ES modules __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables with explicit path
dotenv.config({ path: path.join(__dirname, '.env') });

// Debug environment variables loading
console.log(' Environment Variables Debug:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('CLOUDINARY_CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('CLOUDINARY_API_KEY:', process.env.CLOUDINARY_API_KEY);
console.log('CLOUDINARY_API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '***HIDDEN***' : 'MISSING');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'TourMates API is running!', timestamp: new Date().toISOString() });
});

// 404 handler
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

// Socket.io connection handling
io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  socket.join(`user_${socket.userId}`);

  socket.on('join-trip', (tripId) => {
    socket.join(`trip_${tripId}`);
    console.log(`User ${socket.userId} joined trip ${tripId}`);
  });

  socket.on('leave-trip', (tripId) => {
    socket.leave(`trip_${tripId}`);
    console.log(`User ${socket.userId} left trip ${tripId}`);
  });

  socket.on('send-message', (data) => {
    socket.to(`trip_${data.tripId}`).emit('new-message', data.message);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}`);
  console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
});
