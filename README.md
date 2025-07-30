# Travel-Mate 🌍

A social travel platform designed for solo and budget-conscious travelers in India. Connect with like-minded travelers, plan amazing trips together, and explore India with confidence.

## 🚀 Features

### Core Features
- **Trip Creation & Management**: Create detailed trip plans with itineraries, dates, and participant limits
- **Smart Matching**: Find travel companions based on destination, dates, and travel preferences
- **Real-time Chat**: Communicate with trip participants through integrated messaging
- **User Profiles**: Comprehensive profiles with travel personas, interests, and photos
- **Join Requests**: Secure system for requesting to join trips with organizer approval

### Recent Updates ✨
- **Profile Image Upload**: Upload, edit, and manage profile photos with Cloudinary integration
- **Trip Status System**: Automatic status tracking (Not Started, In Journey, Ended)
- **Review & Rating System**: 5-star rating system for completed trips
- **Enhanced Filters**: Improved search and filtering in trip discovery
- **Auto Itinerary Generator**: AI-powered trip planning assistance

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT Authentication** with bcrypt for security
- **Socket.io** for real-time chat functionality
- **Cloudinary** for image storage and optimization
- **Express Validator** for input validation

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for modern, responsive styling
- **React Router** for navigation
- **Socket.io Client** for real-time features
- **React Hook Form** for form handling
- **Date-fns** for date utilities
- **React Hot Toast** for notifications

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Cloudinary account for image storage

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd travel-mate/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/travel-mate
   JWT_SECRET=your-super-secret-jwt-key
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   
   # Auto Itinerary API
   ITINERARY_API_URL=https://tourmate-agent.onrender.com/plan-trip
   ```

4. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 🎯 Usage Guide

### Getting Started

1. **Register/Login**: Create an account or sign in to access the platform
2. **Complete Profile**: Add your travel preferences, interests, and profile photo
3. **Discover Trips**: Browse available trips or use filters to find perfect matches
4. **Create Trips**: Plan your own trips with detailed itineraries and requirements

### Trip Management

#### Creating a Trip
- Set destination, dates, and travel mode
- Define participant limits (2-20 people)
- Add detailed itinerary or use auto-generation
- Set trip rules and requirements
- Upload cover photos

#### Trip Status System
- **Not Started**: Upcoming trips (gray badge)
- **In Journey**: Currently active trips (blue badge)
- **Ended**: Completed trips (green badge)

#### Joining Trips
- Send join requests to trip organizers
- Receive approval/rejection notifications
- Access trip chat once approved

### Review System

#### Leaving Reviews
- Only available for ended trips
- Participants (not organizers) can review
- 1-5 star rating with detailed description
- One review per user per trip

#### Viewing Reviews
- Average ratings displayed on trip cards
- Review count and individual reviews visible
- Helps users make informed decisions

### Communication

#### Real-time Chat
- Dedicated chat rooms for each trip
- Message history and participant list
- Clean, focused messaging interface

#### Profile Features
- Upload and edit profile photos
- Drag-and-drop image support
- Automatic image optimization
- Real-time updates across the platform

## 🏗️ Project Structure

```
travel-mate/
├── backend/
│   ├── config/
│   │   └── cloudinary.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Trip.js
│   │   └── Message.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── trips.js
│   │   └── chat.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TripCard.tsx
│   │   │   ├── ProfileImageUpload.tsx
│   │   │   ├── TripStatusBadge.tsx
│   │   │   ├── StarRating.tsx
│   │   │   ├── ReviewModal.tsx
│   │   │   └── ImageUpload.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Trips.tsx
│   │   │   ├── CreateTrip.tsx
│   │   │   ├── TripDetails.tsx
│   │   │   ├── Chat.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── context/
│   │   │   ├── AuthContext.tsx
│   │   │   └── SocketContext.tsx
│   │   ├── App.tsx
│   │   └── main.tsx
│   └── package.json
└── README.md
```

## 🔧 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `GET /auth/me` - Get current user

### Users
- `GET /users/:id/profile` - Get user profile
- `PUT /users/:id/profile` - Update user profile
- `POST /users/upload-profile-image` - Upload profile image
- `GET /users/:id/trips/organized` - Get organized trips
- `GET /users/:id/trips/joined` - Get joined trips

### Trips
- `GET /trips` - Get all trips (with filters)
- `POST /trips` - Create new trip
- `GET /trips/:id` - Get trip details
- `PUT /trips/:id` - Update trip
- `DELETE /trips/:id` - Delete trip
- `POST /trips/:id/join` - Send join request
- `POST /trips/:tripId/join-requests/:requestId/:action` - Handle join request
- `POST /trips/:id/reviews` - Add trip review
- `GET /trips/:id/reviews` - Get trip reviews
- `PUT /trips/:id/status` - Update trip status
- `POST /trips/upload-image` - Upload trip cover image

### Chat
- `GET /chat/:tripId/messages` - Get trip messages
- `POST /chat/:tripId/messages` - Send message

## 🌟 Key Features Explained

### Auto Itinerary Generator
Integrates with external AI service to generate day-by-day trip itineraries based on:
- Destination
- User interests
- Trip duration
- Local attractions and activities

### Smart Trip Status
Automatically updates trip status based on dates:
- Pre-trip: Planning and preparation phase
- During trip: Active travel period
- Post-trip: Review and rating phase

### Review System
Builds trust and community through:
- Verified participant reviews
- Aggregate rating system
- Detailed feedback mechanism
- Prevention of fake reviews

### Real-time Features
- Live chat during trips
- Instant notifications
- Real-time status updates
- Socket.io powered communication

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- File upload restrictions
- Rate limiting on API endpoints
- CORS configuration

## 🎨 UI/UX Features

- Responsive design for all devices
- Modern, clean interface
- Intuitive navigation
- Loading states and error handling
- Toast notifications
- Drag-and-drop file uploads
- Interactive rating system

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or cloud database
2. Configure environment variables
3. Deploy to platforms like Heroku, Railway, or DigitalOcean
4. Set up Cloudinary for production

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or similar platforms
3. Configure environment variables for production API

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

## 🎯 Future Enhancements

- Mobile app development
- Payment integration for trip costs
- Advanced trip recommendations
- Social media integration
- Multi-language support
- Offline trip guides
- Weather integration
- Transportation booking

---

**Travel-Mate** - Connecting travelers, creating memories! 🌍✈️
