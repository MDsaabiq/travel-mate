# 🎯 TRAVEL-MATE TECH STACK - QUICK REFERENCE GUIDE

## 📊 PROJECT AT A GLANCE

```
┌─────────────────────────────────────────────────────────┐
│  TRAVEL-MATE: Social Travel Platform for India         │
├─────────────────────────────────────────────────────────┤
│  Type: Full-Stack Web Application                       │
│  Status: Active Development                             │
│  Deployment: Cloud-Native (Render + MongoDB Atlas)      │
│  Users: Solo & Budget-Conscious Travelers              │
│  Core Feature: AI-Powered Itinerary + Real-Time Chat    │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ ARCHITECTURE AT A GLANCE

```
                    FRONTEND
                  (React 18)
                     │
        ┌────────────┼────────────┐
        │            │            │
    HTTP/REST    WebSocket    Static
    (Axios)     (Socket.io)    Assets
        │            │            │
        ├────────────┴────────────┤
                     │
              EXPRESS BACKEND
              (Node.js Server)
                     │
        ┌────────────┼────────────┬──────────┐
        │            │            │          │
      Auth       Routes       Socket.io    AI Service
     (JWT)      (5 files)    (Real-time)  (FastAPI)
        │            │            │          │
        └────────────┼────────────┴──────────┘
                     │
              MONGODB DATABASE
              (4 Collections)
                     │
              CLOUDINARY CDN
              (Image Storage)
```

---

## 🎨 FRONTEND TECHNOLOGY BREAKDOWN

### Core Framework (React)
```
React 18.2.0
├─ Functional Components (Hooks-based)
├─ Context API (AuthContext, SocketContext)
├─ React Router v7 (Client-side routing)
│  └─ 7 Main Routes: /dashboard, /trips, /chat, etc.
└─ React Hot Toast (Notifications)
```

### Build & Tooling
```
Build System: Vite 4.4.5
├─ Ultra-fast HMR (Hot Module Replacement)
├─ TypeScript 5.0.2 support
├─ Optimized production build
└─ ~120ms build time

Build Command: npm run build
├─ Type checking: tsc
├─ Bundling: vite build
└─ Output: dist/ (optimized files)
```

### Styling
```
Tailwind CSS 3.3.0
├─ Utility-first CSS framework
├─ Responsive breakpoints (sm, md, lg)
├─ PostCSS 8.4.24 processing
├─ Autoprefixer 10.4.14 (vendor prefixes)
└─ Custom color palette (Teal primary)
```

### Form Handling
```
React Hook Form 7.61.1
├─ Minimal re-renders
├─ Efficient validation (onBlur mode)
├─ Smaller bundle size (~9kb)
├─ Easy Tailwind integration
└─ Used in: Login, Register, Create Trip, Profile
```

### HTTP & Real-Time
```
Axios 1.11.0 (HTTP Client)
├─ Request interceptor for JWT token
├─ Centralized error handling
├─ Automatic header configuration
└─ Request/response transformation

Socket.io Client 4.8.1 (WebSocket)
├─ Real-time bidirectional communication
├─ Automatic reconnection
├─ Event-based messaging
└─ Trip-based room management
```

### Utilities
```
date-fns 4.1.0    → Date formatting & calculations
Lucide React 0.525.0 → 200+ SVG icons
```

---

## ⚙️ BACKEND TECHNOLOGY BREAKDOWN

### Server & Framework
```
Node.js Runtime (v16+ recommended v18+)
├─ ES Modules support
├─ Built-in fetch API (v18+)
└─ Non-blocking I/O

Express.js 4.18.2 (Framework)
├─ Middleware system
├─ Routing
├─ Request/Response handling
└─ CORS support
```

### Database & ORM
```
MongoDB (Cloud: Atlas)
├─ NoSQL document database
├─ Flexible schema
├─ Horizontal scalability
└─ Built-in replication

Mongoose 8.0.3 (ODM)
├─ Schema definition
├─ Pre/post hooks
├─ Middleware support
├─ Validation
├─ Indexes & optimization
└─ Population (JOIN equivalent)
```

### Authentication & Security
```
JWT (jsonwebtoken) 9.0.2
├─ Token generation: 7-day expiry
├─ Token verification on every request
├─ Payload: userId + timestamps
└─ Signature: HMACSHA256 with JWT_SECRET

Bcryptjs 2.4.3 (Password Hashing)
├─ Salt rounds: 10
├─ One-way hashing
├─ Automatic re-hashing on password change
├─ Secure comparison (timing-attack safe)
└─ comparePassword() method
```

### Real-Time Communication
```
Socket.io 4.7.4
├─ WebSocket library
├─ Fallback protocols (polling, etc.)
├─ Event-based messaging
├─ Room management (trip channels)
├─ User authentication via middleware
└─ Broadcasting capabilities
```

### File Upload & Storage
```
Multer 2.0.2 (Upload Middleware)
├─ Multipart form data parsing
├─ File size limits (10MB)
├─ Temporary storage

Cloudinary 1.41.1 (Cloud Storage)
├─ Image hosting & CDN
├─ Automatic optimization
├─ Transformation (resize, crop, quality)
└─ URL-based access

multer-storage-cloudinary 4.0.0
└─ Integration layer between Multer & Cloudinary
```

### Validation & Middleware
```
express-validator 7.0.1
├─ Input validation
├─ Sanitization
├─ Error collection & reporting
└─ Used in: register, login, trip creation

CORS 2.8.5 (Cross-Origin Resource Sharing)
├─ Allow requests from CLIENT_URL
├─ Credentials handling
└─ Method restrictions (GET, POST, PUT, DELETE)
```

### Development Tools
```
nodemon 3.0.2
├─ Auto-restart on file changes
├─ Development server
└─ Used with: npm run dev
```

### Environment & Config
```
dotenv 16.3.1
├─ Load .env file
├─ Process.env variables
├─ Local development
└─ Variables:
   ├─ PORT, NODE_ENV
   ├─ MONGODB_URI
   ├─ JWT_SECRET
   ├─ CLOUDINARY_*
   ├─ ITINERARY_API_URL
   ├─ CLIENT_URL
```

---

## 🤖 AI SERVICE (Python FastAPI)

### Framework & Orchestration
```
FastAPI (Web Framework)
├─ Async/await support
├─ Built-in OpenAPI documentation
├─ Uvicorn ASGI server
└─ Endpoint: POST /plan-trip

LangGraph (Workflow Orchestrator)
├─ Node 1: Set City
├─ Node 2: Set Interests
├─ Node 3: Create Itinerary
└─ State machine pattern

LangChain (LLM Framework)
├─ Prompt templates
├─ Response parsing
├─ JSON extraction
└─ Fallback chains
```

### AI Model
```
Google Generative AI (Gemini 2.5 Flash)
├─ Model: gemini-2.5-flash
├─ Temperature: 0 (deterministic)
├─ Max output tokens: ~8000
├─ Context window: 100k tokens
├─ Input: {city, interests, duration}
└─ Output: Itinerary JSON array

Google AI Python SDK
└─ google-generativeai package
```

### Response Processing
```
1. API Response (Gemini)
   └─ Raw text with JSON

2. JSON Extraction (Regex)
   └─ Extract JSON from text

3. Validation
   ├─ Check structure
   ├─ Verify day count
   └─ Validate required fields

4. Error Handling
   ├─ Timeout: 30 seconds
   ├─ Fallback: Generic itinerary
   └─ Logging: Debug info
```

---

## 💾 DATABASE SCHEMA OVERVIEW

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,                // "John Doe"
  email: String,               // unique, indexed
  password: String,            // bcrypt hashed
  photo: String,               // Cloudinary URL
  bio: String,                 // max 500 chars
  city: String,                // "Mumbai"
  age: Number,                 // 18-100
  gender: String,              // male/female/other
  travelPersona: String,       // solo/planner/adventurer
  interests: [String],         // ["hiking", "food", "culture"]
  createdAt: Date,
  updatedAt: Date
}
```

### Trip Collection
```javascript
{
  _id: ObjectId,
  title: String,               // "Paris Adventure 2024"
  destination: String,         // "Paris"
  coverPhoto: String,          // Cloudinary URL
  dates: {
    start: Date,               // "2024-06-01"
    end: Date                  // "2024-06-10"
  },
  travelMode: String,          // flight/train/bus/car
  itinerary: [                 // AI-generated
    {
      day: Number,
      title: String,
      description: String,     // Hour-by-hour schedule
      location: String
    }
  ],
  rules: String,               // Trip rules & requirements
  organizer: ObjectId (ref),   // Trip creator
  participants: [ObjectId],    // Joined users
  joinRequests: [              // Pending requests
    {
      user: ObjectId,
      status: String,          // pending/accepted/declined
      requestedAt: Date
    }
  ],
  maxParticipants: Number,     // 2-20 range
  status: String,              // not_started/in_journey/ended
  reviews: [                   // After trip ends
    {
      user: ObjectId,
      rating: Number,          // 1-5 stars
      description: String,     // 10-500 chars
      createdAt: Date
    }
  ],
  averageRating: Number,       // Calculated
  isActive: Boolean,           // true/false
  createdAt: Date,
  updatedAt: Date
}
```

### Message Collection
```javascript
{
  _id: ObjectId,
  trip: ObjectId (ref),        // Which trip
  sender: ObjectId (ref),      // Who sent
  content: String,             // Message text
  createdAt: Date,
  updatedAt: Date
}
```

### Notification Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref),        // Recipient
  sender: ObjectId (ref),      // Sender
  trip: ObjectId (ref),        // Related trip
  type: String,                // join-request-pending, etc
  message: String,             // Notification text
  isRead: Boolean,             // Default: false
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔌 API ENDPOINTS QUICK REFERENCE

### Auth Endpoints
```
POST   /api/auth/register       → Create account
       Body: {email, password, name, city, travelPersona}
       Return: {token, user}

POST   /api/auth/login          → User login
       Body: {email, password}
       Return: {token, user}

GET    /api/auth/me             → Get current user
       Headers: Authorization: Bearer {token}
       Return: {user}
```

### Trips Endpoints
```
GET    /api/trips               → Get all trips (filterable)
       Query: ?destination=Paris&skip=0&limit=10

POST   /api/trips               → Create trip
       Body: {title, destination, dates, itinerary, rules}

GET    /api/trips/:id           → Get trip details
POST   /api/trips/:id/join      → Send join request
POST   /api/trips/:id/reviews   → Add review & rating
```

### Chat Endpoints
```
GET    /api/chat/messages/:tripId  → Chat history

Socket Events:
├─ join-trip(tripId)           → Join chat room
├─ send-message(data)          → Send message
└─ new-message (listen)         → Receive message
```

### Notifications Endpoints
```
GET    /api/notifications       → Get all notifications
PUT    /api/notifications/:id/read  → Mark as read
DELETE /api/notifications/:id   → Delete notification
```

---

## 🔐 SECURITY FEATURES

### Authentication Flow
```
User Registration
├─ Password → bcryptjs → Hash → Store
└─ Return JWT token

User Login
├─ Input password → bcryptjs.compare() → Verify
├─ Generate JWT: {userId, iat, exp}
└─ Return token (localStorage on frontend)

Protected Route
├─ Extract token from header
├─ Verify JWT signature
├─ Get user from database
└─ Attach to request
```

### JWT Configuration
```
Header: {alg: 'HS256', typ: 'JWT'}
Payload: {userId: ObjectId, iat: timestamp, exp: timestamp}
Secret: process.env.JWT_SECRET
Expiry: 7 days
Algorithm: HMACSHA256
```

### Password Security
```
Hashing Algorithm: bcrypt
Salt Rounds: 10
Cost Factor: ~100ms per hash
Timing Attack Safe: Yes (crypto.timingSafeEqual)
Re-hash on Change: Yes (pre-save hook)
```

### CORS Configuration
```
Allowed Origin: process.env.CLIENT_URL
Allowed Methods: GET, POST, PUT, DELETE
Credentials: true (for cookies/auth)
Headers: Authorization, Content-Type
```

---

## 📡 REAL-TIME COMMUNICATION

### Socket.io Events

**Server Events**:
```
io.on('connection')              → User connects
socket.on('join-trip')           → Join trip room
socket.on('send-message')        → Broadcast message
socket.on('leave-trip')          → Leave room
socket.on('disconnect')          → User disconnects
```

**Client Events**:
```
socket.emit('join-trip', tripId)
socket.emit('send-message', {tripId, message})
socket.on('new-message', message)
socket.on('connect/disconnect')
```

### Room Management
```
User joins Socket.io connection
├─ socket.join(`user_${userId}`)     → Private channel
└─ socket.join(`trip_${tripId}`)     → Trip group

Message sending
└─ socket.to(`trip_${tripId}`)
   .emit('new-message', message)
   → Broadcasts to all in trip
```

---

## 🚀 DEPLOYMENT STACK

### Frontend Deployment
```
Build Process:
├─ npm run build
│  ├─ tsc (Type checking)
│  └─ vite build (Bundling)
├─ Output: dist/ folder
└─ Deploy to: Netlify/Vercel

Environment:
└─ VITE_API_URL=https://api.domain.com
```

### Backend Deployment
```
Host Platform: Render/Heroku
├─ Runtime: Node.js v18+
├─ Start Command: npm start (node server.js)
├─ Port: 5000 (configurable)
└─ Environment:
   ├─ NODE_ENV=production
   ├─ MONGODB_URI=mongodb+srv://...
   ├─ JWT_SECRET=...
   ├─ CLOUDINARY_*=...
   └─ ITINERARY_API_URL=...
```

### Database
```
MongoDB Atlas (Cloud)
├─ Connection: mongodb+srv://user:pass@cluster...
├─ Replication: 3+ nodes
├─ Backups: Automated daily
├─ Indexes: Optimized
└─ Collections: Sharded if needed
```

### AI Service
```
Host: Render/AWS Lambda/GCP Cloud Run
├─ Runtime: Python 3.9+
├─ Framework: FastAPI + Uvicorn
├─ Endpoint: https://api.domain.com/plan-trip
└─ Environment:
   └─ GOOGLE_API_KEY=...
```

### CDN & Storage
```
Cloudinary
├─ Profile Images: travel-mate/profiles
├─ Trip Cover Photos: travel-mate/covers
├─ Auto-optimization: Quality + Size
└─ Transforms: Resize, crop, format conversion
```

---

## 📊 PERFORMANCE METRICS

### Response Times
```
API Endpoint: < 200ms typical
└─ Database queries with indexes
└─ Small JSON responses

AI Itinerary: 15-30 seconds
├─ Depends on AI model speed
├─ Timeout: 30 seconds
└─ Fallback available

Socket.io Connection: < 100ms
Image Upload: 2-5 seconds
```

### Scalability Considerations
```
Frontend: CDN distribution
Backend: Horizontal scaling (multiple instances)
Database: Connection pooling (MongoDB Atlas)
File Storage: Cloudinary handles scaling
AI Service: Async processing, queue if needed
```

---

## 🎓 KEY CONCEPTS

### Authentication Strategy
**JWT Tokens**: Stateless, scalable, client-stores token
**Bcryptjs**: One-way hashing, salt-based, slow (15-100ms)
**Middleware**: Automatic token verification on protected routes

### Real-Time Strategy
**Socket.io Rooms**: Trip-based, not database-dependent
**Event Emission**: Fast, in-memory, no polling
**Scalability**: Namespace support for multiple services

### Database Strategy
**Embedded Documents**: Reviews in Trip (denormalized)
**References**: Participants, join requests (normalized)
**Indexes**: On frequently queried fields (destination, status)
**TTL**: Message cleanup can be automated if needed

### Error Handling
**Try-Catch Blocks**: Wrapped all async operations
**Validation**: express-validator on input
**Graceful Degradation**: Fallback itinerary if AI fails
**Logging**: Console logs for debugging

---

## 🎯 DEVELOPMENT WORKFLOW

### Local Development
```
Frontend:
├─ npm install
├─ npm run dev (Vite dev server on :5173)
└─ Watch for changes (HMR)

Backend:
├─ npm install
├─ Create .env file
├─ npm run dev (nodemon on :5000)
└─ Auto-restart on file changes

AI Service:
├─ pip install -r requirements.txt
├─ Create .env file
└─ uvicorn main:app --reload (dev server)
```

### Testing
```
Frontend: Manual testing + browser DevTools
Backend: Postman/Insomnia for API testing
Integration: End-to-end testing via UI

Code Quality:
├─ TypeScript: Type checking (frontend)
├─ ESLint: Code linting
└─ Manual code review before merge
```

### Deployment
```
Frontend:
├─ Push to GitHub
├─ Vercel/Netlify auto-deploys
└─ Preview URLs generated

Backend:
├─ Push to GitHub
├─ Render detects changes
├─ Auto-rebuilds & deploys
└─ No downtime with blue-green deployment

Database:
├─ MongoDB Atlas backups
├─ Manual exports if needed
└─ Point-in-time restore available
```

---

## 📚 DOCUMENTATION

### Code Files
- `frontend/package.json` - Frontend dependencies
- `backend/package.json` - Backend dependencies
- `backend/server.js` - Entry point
- `frontend/src/App.tsx` - Frontend root component
- `backend/models/` - Database schemas
- `backend/routes/` - API endpoints

### Configuration Files
- `.env` - Environment variables
- `tailwind.config.js` - Tailwind configuration
- `vite.config.ts` - Vite build configuration
- `tsconfig.json` - TypeScript configuration
- `eslint.config.js` - Linting rules

---

## ✨ PROJECT HIGHLIGHTS

✅ **Full-Stack**: Frontend + Backend + AI Service  
✅ **Production-Ready**: Security, validation, error handling  
✅ **Scalable**: Cloud deployment, database optimization  
✅ **Real-Time**: Socket.io for instant updates  
✅ **AI-Powered**: Google Gemini integration  
✅ **Mobile-Responsive**: Tailwind CSS breakpoints  
✅ **Type-Safe**: TypeScript throughout  
✅ **Well-Structured**: Modular architecture  

---

**Last Updated**: 2024  
**Version**: 1.0.0  
**Project**: Travel-Mate (TourMates)