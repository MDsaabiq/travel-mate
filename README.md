# Travel-Mate 🌍✈️

A comprehensive social travel platform designed for solo and budget-conscious travelers in India. Connect with like-minded travelers, plan amazing trips together, and explore India with confidence. Features AI-powered itinerary generation, real-time communication, and intelligent trip matching.

**Status**: Active Development | **Version**: 1.0.0

---

## 📋 Table of Contents

- [🚀 Core Features](#-core-features)
- [✨ Key Features in Detail](#-key-features-in-detail)
- [🤖 AI Itinerary Generation System](#-ai-itinerary-generation-system)
- [🛠️ Tech Stack](#-tech-stack)
- [📦 Installation & Setup](#-installation--setup)
- [🎯 Usage Guide](#-usage-guide)
- [🔧 API Endpoints](#-api-endpoints)
- [🏗️ Project Architecture](#-project-architecture)
- [🔒 Security Features](#-security-features)
- [🎨 UI/UX Features](#-uiux-features)
- [🚀 Deployment Guide](#-deployment-guide)
- [🤝 Contributing](#-contributing)
- [📝 License](#-license)

---

## 🚀 Core Features

### 🌐 Trip Management
- **Trip Creation & Planning**: Create detailed trips with custom itineraries, dates, participant limits (2-20 people)
- **Trip Status Tracking**: Automatic status management (Not Started, In Journey, Ended)
- **Trip Discovery**: Browse, search, and filter trips by destination, dates, interests, and travel mode
- **Trip Customization**: Add cover photos, set requirements, define travel rules

### 👥 Social Connectivity
- **Smart Companion Matching**: Find travel companions based on destination, dates, interests, and travel preferences
- **Join Request System**: Secure request-approval workflow for trip participation
- **User Profiles**: Comprehensive profiles with travel personas, interests, verified information, and photos
- **Real-time Notifications**: Instant updates on join requests, trip status, and messages

### 💬 Communication
- **Real-time Chat**: Dedicated chat rooms for each trip with Socket.io integration
- **Message History**: Complete message archives for trip planning and coordination
- **Participant Management**: View all trip participants and their profiles
- **Instant Notifications**: Toast notifications for all important events

### ⭐ Reviews & Ratings
- **5-Star Rating System**: Rate trips and fellow travelers after journey completion
- **Verified Reviews**: Only trip participants can leave reviews (organizers excluded from voting)
- **Review Aggregation**: Average ratings and review counts displayed on trip cards
- **Detailed Feedback**: Written reviews to help future travelers make informed decisions
- **One Review Per User**: Prevents duplicate reviews and maintains integrity

### 🖼️ Media Management
- **Profile Image Upload**: Upload and edit profile photos with drag-and-drop support
- **Trip Cover Photos**: Add beautiful cover images to trip listings
- **Cloudinary Integration**: Automatic image optimization and cloud storage
- **Real-time Updates**: Images update instantly across the platform

### 🔐 Authentication & Authorization
- **Secure Registration**: Email-based registration with password hashing
- **JWT Authentication**: Token-based session management
- **Role-Based Access**: Different permissions for trip organizers vs. participants
- **Protected Routes**: Secure endpoints with authentication middleware

---

## ✨ Key Features in Detail

### 🤖 AI-Powered Itinerary Generation

The platform features a sophisticated AI itinerary generation system powered by:

#### **Technology Stack**
- **Framework**: FastAPI (Python)
- **Orchestration**: LangGraph for agentic workflow management
- **AI Model**: Google Generative AI (Gemini 2.5 Flash)
- **LLM Chain**: LangChain for prompt management and response parsing

#### **Itinerary Generation Features**

**Input Parameters**:
- **Destination City**: The target city for trip planning
- **User Interests**: Comma-separated list of interests (e.g., "museums, hiking, local food")
- **Trip Duration**: Number of days for the itinerary (1-30 days)
- **User Request**: Natural language trip planning request

**Output Format**:
Each day includes:
- **Day Number**: Sequential numbering (Day 1, Day 2, etc.)
- **Title**: Catchy title with area name and experience theme
- **Description**: Hour-by-hour schedule from 8:00 AM to 8:00 PM+
- **Location**: Specific neighborhood/district name (not just the city)

**Example Output**:
```json
{
  "day": 1,
  "title": "Day 1 - Downtown Historic District - A Journey Through Time",
  "description": "8:00 AM - Start at Central Museum\n10:00 AM - Visit Art Gallery...\n12:30 PM - Lunch at Local Restaurant...",
  "location": "Downtown Historic District"
}
```

#### **Key Itinerary Characteristics**

1. **Unique Daily Experiences**
   - Each day covers a completely different neighborhood/district
   - No repeated locations, restaurants, or activities across days
   - Varied activity types (museums, parks, restaurants, markets, etc.)

2. **Time-Based Scheduling**
   - Realistic AM/PM time slots (8:00 AM - 10:00 PM+)
   - Balanced activity distribution throughout the day
   - Practical meal times and activity duration
   - Not exhausting or overly packed

3. **Location Intelligence**
   - Specific, real place names for each attraction
   - Research-backed recommendations based on city geography
   - Mix of famous landmarks and hidden local gems
   - Cultural and authentic experiences

4. **Interest Alignment**
   - Activities customized to user interests
   - Varied activity types per interest category
   - Progressive experience building across days
   - Culturally appropriate recommendations

#### **Error Handling & Fallback**

- **JSON Parsing**: Regex-based extraction of JSON from LLM responses
- **Fallback Mechanism**: Generic day-by-day itinerary if AI generation fails
- **Timeout Protection**: 30-second timeout to prevent hanging requests
- **Validation**: Ensures proper structure for all itinerary items

#### **Integration with Backend**

```javascript
// Backend integration example
const generateItinerary = async (destination, interests, duration) => {
  const response = await fetch(ITINERARY_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      request: "Plan my trip for each with time specific things to do in day",
      city: destination,
      interests: interests,
      duration: duration
    }),
    timeout: 30000
  });
  
  return response.json();
};
```

### 🔄 Trip Status System

Automatically manages trip lifecycle:

| Status | Condition | Badge Color |
|--------|-----------|-------------|
| **Not Started** | Current date < Start date | Gray |
| **In Journey** | Start date ≤ Current date ≤ End date | Blue |
| **Ended** | Current date > End date | Green |

- Timezone-aware (IST - Indian Standard Time)
- Automatic status updates without user intervention
- Status affects review availability and trip interactions

### 🎯 Smart Trip Matching

Intelligently matches travelers based on:
- Destination preference
- Travel dates and duration
- Travel style (budget, comfort level, pace)
- Interests and activity preferences
- Group size preferences
- Local knowledge and experience

### 🏙️ Search & Filter System

Advanced filtering capabilities:
- Filter by city/destination
- Date range selection
- Interest-based filtering
- Travel mode selection (solo, small group, large group)
- Budget range filtering
- Participant count filters

---

## 🤖 AI Itinerary Generation System

### Architecture Overview

```
User Request
    ↓
FastAPI Endpoint (/plan-trip)
    ↓
LangGraph Workflow
    ├─ Node 1: Set City
    ├─ Node 2: Set Interests
    └─ Node 3: Create Itinerary
        ↓
    Google Generative AI (Gemini)
        ↓
    JSON Response Processing
        ↓
    Validation & Formatting
        ↓
    Return to Backend
```

### Workflow Nodes

**1. Set City Node**
- Adds city information to conversation state
- Prepares context for itinerary generation

**2. Set Interests Node**
- Processes and structures user interests
- Formats interests for AI consumption

**3. Create Itinerary Node**
- Invokes Gemini API with formatted prompt
- Handles JSON parsing and validation
- Applies fallback logic if needed

### Example Request/Response

**Request**:
```bash
POST /plan-trip
Content-Type: application/json

{
  "request": "Plan my trip for each with time specific things to do in day",
  "city": "Paris",
  "interests": "museums,art,local food,architecture",
  "duration": 3
}
```

**Response**:
```json
{
  "message": "Trip planning completed",
  "itinerary": [
    {
      "day": 1,
      "title": "Day 1 - Marais District - Hidden Gems & Local Flavors",
      "description": "8:00 AM - Start at Place des Vosges...",
      "location": "Marais District"
    },
    {
      "day": 2,
      "title": "Day 2 - Latin Quarter - Academic Heritage & Culinary Delights",
      "description": "8:00 AM - Begin at Sorbonne University...",
      "location": "Latin Quarter"
    },
    {
      "day": 3,
      "title": "Day 3 - Montmartre - Artistic Soul & Bohemian Vibes",
      "description": "8:00 AM - Explore Sacré-Cœur Basilica...",
      "location": "Montmartre"
    }
  ]
}
```

### Configuration Requirements

**Environment Variables**:
```env
# AI Service
GOOGLE_API_KEY=your_google_api_key_here
ITINERARY_API_URL=https://your-itinerary-service.com/plan-trip

# Model Selection
MODEL=gemini-2.5-flash
TEMPERATURE=0  # For deterministic results
```

### Performance Characteristics

- **Response Time**: 15-30 seconds (depends on network and AI service)
- **Timeout**: 30 seconds (configurable)
- **Retry Logic**: Automatic fallback to generic itinerary
- **Caching**: Potential for caching generated itineraries

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (v16+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with bcryptjs
- **Real-time Communication**: Socket.io
- **File Storage**: Cloudinary
- **Validation**: Express Validator
- **Image Upload**: Multer with Cloudinary storage

### AI/ML Service
- **Language**: Python
- **Framework**: FastAPI
- **Orchestration**: LangGraph
- **LLM Framework**: LangChain
- **AI Model**: Google Generative AI (Gemini 2.5 Flash)
- **Environment**: python-dotenv

### Frontend
- **UI Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + PostCSS
- **Routing**: React Router v7
- **Real-time**: Socket.io Client
- **Form Management**: React Hook Form
- **Date Utilities**: date-fns
- **UI Notifications**: React Hot Toast
- **Icons**: Lucide React
- **HTTP Client**: Axios

### DevTools
- **Backend Dev**: Nodemon
- **Frontend Type Checking**: TypeScript
- **Linting**: ESLint
- **Code Formatting**: Autoprefixer

---

## 📦 Installation & Setup

### Prerequisites

- **Node.js** v16 or higher
- **Python** 3.8+ (for itinerary service)
- **MongoDB** (local or Atlas)
- **Cloudinary Account** (free tier available)
- **Google API Key** (for Generative AI)
- **npm** or **yarn**

### Backend Setup

1. **Clone & Navigate**
   ```bash
   git clone <repository-url>
   cd travel-mate/backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create Environment File** (`.env`)
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/travel-mate
   
   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-min-32-characters
   
   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # AI Itinerary Service
   ITINERARY_API_URL=https://your-itinerary-service.onrender.com/plan-trip
   
   # Client URL (for CORS)
   CLIENT_URL=http://localhost:5173
   
   # Optional: Session Storage
   REDIS_URL=optional-redis-connection
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Server runs on: `http://localhost:5000`

### Frontend Setup

1. **Navigate to Frontend**
   ```bash
   cd ../frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create Environment File** (`.env`)
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SOCKET_URL=http://localhost:5000
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Application runs on: `http://localhost:5173`

### AI Itinerary Service Setup

1. **Create Python Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install Python Dependencies**
   ```bash
   pip install fastapi uvicorn python-dotenv langchain langchain-google-genai langgraph
   ```

3. **Create `.env` File**
   ```env
   GOOGLE_API_KEY=your_google_api_key
   PORT=8881
   ```

4. **Run Service** (using the provided code)
   ```bash
   python main.py
   ```
   Service runs on: `http://localhost:8881`

### Docker Compose (Optional - Coming Soon)

```bash
docker-compose up -d
```

---

## 🎯 Usage Guide

### User Workflows

#### 1. **Getting Started**
- Register with email and password
- Create user profile with interests and preferences
- Upload profile photo (optional but recommended)
- Browse available trips or create your own

#### 2. **Creating a Trip**
- Click "Create Trip" button
- Fill in trip details:
  - **Destination**: Where you're traveling
  - **Dates**: Start and end dates
  - **Duration**: Number of days
  - **Participants**: Min and max limit (2-20)
  - **Travel Mode**: Solo, small group, large group, etc.
  - **Budget Range**: Budget per person
  - **Description**: Trip overview and rules
  - **Interests**: Select multiple interests
- **Generate Itinerary** (AI-powered):
  - Choose auto-generation to let AI create itinerary
  - AI generates hour-by-hour schedule for each day
  - Review and edit if needed
  - Add/remove activities as desired
- Upload cover photo
- Publish trip

#### 3. **Finding Travel Companions**
- Browse trips dashboard
- Use filters (city, dates, interests, budget)
- View trip details and participant profiles
- Send join request with personalized message
- Wait for organizer approval

#### 4. **Trip Participation**
- Once approved, access trip chat room
- View all participants and their profiles
- Check complete itinerary with timings
- Coordinate logistics with group
- Share tips and experiences

#### 5. **Leaving Reviews**
- Available after trip ends (current date > end date)
- Rate out of 5 stars
- Write detailed review (optional)
- Submit anonymously or with name
- Cannot edit review once submitted

#### 6. **Real-time Communication**
- Join trip chat room
- Send messages in real-time
- Share links, attachments, or coordinates
- View message history
- Get notifications for new messages

### Trip Management

#### Trip Status Lifecycle

```
Created (Upcoming)
    ↓
Not Started (Gray Badge) - Before start date
    ↓
In Journey (Blue Badge) - During trip dates
    ↓
Ended (Green Badge) - After end date → Reviews enabled
```

#### Trip Operations
- **Edit Trip**: Update details before start date
- **Delete Trip**: Remove trip (organizer only)
- **View Participants**: See all joined members
- **Manage Requests**: Approve/reject join requests
- **Pin Message**: In chat for important info
- **Export Itinerary**: Download as PDF (planned)

---

## 🔧 API Endpoints

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| GET | `/api/auth/me` | Get current user (requires auth) |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh-token` | Refresh JWT token |

**Request Examples**:
```bash
# Register
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123",
  "interests": ["hiking", "food", "culture"]
}

# Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### User Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/:id/profile` | Get user profile |
| PUT | `/api/users/:id/profile` | Update user profile |
| POST | `/api/users/upload-profile-image` | Upload profile photo |
| GET | `/api/users/:id/trips/organized` | Get user's organized trips |
| GET | `/api/users/:id/trips/joined` | Get user's joined trips |
| GET | `/api/users/:id/public-profile` | Get public profile (no auth needed) |

**Profile Update Example**:
```bash
PUT /api/users/user_id/profile
{
  "bio": "Solo traveler exploring India",
  "travelStyle": "budget",
  "interests": ["hiking", "photography", "local food"],
  "favoriteDestinations": ["Kerala", "Goa", "Rajasthan"]
}
```

### Trip Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | Get all trips (with filters) |
| POST | `/api/trips` | Create new trip |
| GET | `/api/trips/:id` | Get trip details |
| PUT | `/api/trips/:id` | Update trip |
| DELETE | `/api/trips/:id` | Delete trip (organizer only) |
| POST | `/api/trips/:id/join` | Send join request |
| POST | `/api/trips/:tripId/join-requests/:requestId/:action` | Approve/reject request |
| PUT | `/api/trips/:id/status` | Update trip status manually |
| POST | `/api/trips/:id/upload-image` | Upload trip cover photo |
| POST | `/api/trips/:id/generate-itinerary` | Generate AI itinerary |

**Create Trip Example**:
```bash
POST /api/trips
{
  "title": "Goa Beach Adventure",
  "destination": "Goa",
  "description": "A relaxing beach trip for 5 days",
  "dates": {
    "start": "2024-02-01",
    "end": "2024-02-05"
  },
  "participants": {
    "min": 2,
    "max": 8
  },
  "interests": ["beach", "food", "nightlife"],
  "travelMode": "budget",
  "itinerary": [...]
}
```

**Generate Itinerary Example**:
```bash
POST /api/trips/:tripId/generate-itinerary
{
  "interests": "beach,food,culture",
  "duration": 5
}

Response:
{
  "success": true,
  "itinerary": [
    {
      "day": 1,
      "title": "Day 1 - North Goa Beach - Welcome to Paradise",
      "description": "8:00 AM - Arrive and check in...",
      "location": "North Goa"
    },
    ...
  ]
}
```

### Trip Review Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/trips/:id/reviews` | Add review for trip |
| GET | `/api/trips/:id/reviews` | Get all reviews for trip |
| GET | `/api/trips/:id/reviews/stats` | Get review statistics |
| PUT | `/api/reviews/:reviewId` | Update review (within 24h) |
| DELETE | `/api/reviews/:reviewId` | Delete review (within 24h) |

**Add Review Example**:
```bash
POST /api/trips/trip_id/reviews
{
  "rating": 5,
  "title": "Amazing experience!",
  "comment": "Great group, well-organized trip. Highly recommended!",
  "aspectRatings": {
    "organization": 5,
    "communication": 4,
    "groupDynamics": 5,
    "valueForMoney": 4
  }
}
```

### Chat Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/:tripId/messages` | Get trip messages |
| POST | `/api/chat/:tripId/messages` | Send message |
| GET | `/api/chat/:tripId/messages/:limit/:skip` | Paginated messages |
| DELETE | `/api/chat/messages/:messageId` | Delete message |
| PUT | `/api/chat/messages/:messageId/pin` | Pin important message |

**Send Message Example**:
```bash
POST /api/chat/trip_id/messages
{
  "content": "Let's meet at 8 AM tomorrow at the hotel lobby",
  "messageType": "text",  // text, location, attachment, image
  "attachmentUrl": "optional_url"
}
```

### Notification Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get user notifications |
| POST | `/api/notifications/:id/read` | Mark notification as read |
| DELETE | `/api/notifications/:id` | Delete notification |
| GET | `/api/notifications/unread/count` | Get unread count |

---

## 🏗️ Project Architecture

### Directory Structure

```
travel-mate/
├── backend/
│   ├── config/
│   │   ├── database.js          # MongoDB connection
│   │   └── cloudinary.js        # Image upload config
│   ├── middleware/
│   │   └── auth.js              # JWT validation, Socket auth
│   ├── models/
│   │   ├── User.js              # User schema & methods
│   │   ├── Trip.js              # Trip schema & methods
│   │   ├── Message.js           # Chat message schema
│   │   ├── Notification.js      # Notification schema
│   │   └── Review.js            # Review schema
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── users.js             # User management routes
│   │   ├── trips.js             # Trip management routes
│   │   ├── chat.js              # Chat routes
│   │   └── notifications.js     # Notification routes
│   ├── server.js                # Express app setup
│   ├── package.json
│   ├── .env                     # Environment variables
│   └── test-register.js         # Testing utility
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── TripCard.tsx          # Trip listing card
│   │   │   ├── ProfileImageUpload.tsx # Profile photo upload
│   │   │   ├── TripStatusBadge.tsx   # Status indicator
│   │   │   ├── StarRating.tsx        # Rating component
│   │   │   ├── ReviewModal.tsx       # Review submission modal
│   │   │   ├── ImageUpload.tsx       # Generic image upload
│   │   │   ├── ChatBox.tsx           # Chat interface
│   │   │   ├── ParticipantsList.tsx  # Participants display
│   │   │   └── ItineraryDisplay.tsx  # Itinerary viewer
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx         # Home/dashboard
│   │   │   ├── Profile.tsx           # User profile
│   │   │   ├── Trips.tsx             # Trips listing & discovery
│   │   │   ├── CreateTrip.tsx        # Trip creation
│   │   │   ├── TripDetails.tsx       # Trip detail view
│   │   │   ├── Chat.tsx              # Chat page
│   │   │   ├── LandingPage.tsx       # Welcome page
│   │   │   ├── Login.tsx             # Login form
│   │   │   └── Register.tsx          # Registration form
│   │   ├── context/
│   │   │   ├── AuthContext.tsx       # Auth state management
│   │   │   └── SocketContext.tsx     # Socket.io context
│   │   ├── services/
│   │   │   ├── api.ts               # API calls
│   │   │   ├── socket.ts            # Socket initialization
│   │   │   └── auth.ts              # Auth utilities
│   │   ├── App.tsx                  # Main app component
│   │   ├── main.tsx                 # React entry point
│   │   ├── index.css                # Global styles
│   │   └── vite-env.d.ts            # Vite types
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── logo.svg
│   │   └── _redirects
│   ├── index.html
│   ├── tailwind.config.js
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── ai-service/
│   ├── main.py                  # FastAPI app with LangGraph
│   ├── requirements.txt         # Python dependencies
│   ├── .env                     # AI service config
│   └── Dockerfile               # Docker configuration
│
├── docs/
│   ├── ARCHITECTURE_DIAGRAM.md
│   ├── API_DOCUMENTATION.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── CONTRIBUTING.md
│
├── .gitignore
├── README.md
└── package.json (root)
```

### Data Models

#### User Schema
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  profileImage: String (Cloudinary URL),
  bio: String,
  travelStyle: String,
  interests: [String],
  favoriteDestinations: [String],
  tripsOrganized: [ObjectId] → Trip,
  tripsJoined: [ObjectId] → Trip,
  reviews: [ObjectId] → Review,
  ratings: {
    average: Number,
    count: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Trip Schema
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  destination: String,
  status: String (not_started | in_journey | ended),
  dates: {
    start: Date,
    end: Date
  },
  organizer: ObjectId → User,
  participants: [ObjectId] → User,
  joinRequests: [{
    userId: ObjectId → User,
    status: String,
    message: String,
    createdAt: Date
  }],
  itinerary: [{
    day: Number,
    title: String,
    description: String,
    location: String
  }],
  participants: {
    min: Number,
    max: Number
  },
  interests: [String],
  travelMode: String,
  coverImage: String (Cloudinary URL),
  budget: {
    min: Number,
    max: Number
  },
  reviews: [ObjectId] → Review,
  ratings: {
    average: Number,
    count: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Message Schema
```javascript
{
  _id: ObjectId,
  tripId: ObjectId → Trip,
  sender: ObjectId → User,
  content: String,
  messageType: String (text | image | location | file),
  attachmentUrl: String,
  pinned: Boolean,
  reactions: [{
    emoji: String,
    userId: ObjectId → User
  }],
  createdAt: Date,
  updatedAt: Date
}
```

#### Review Schema
```javascript
{
  _id: ObjectId,
  trip: ObjectId → Trip,
  reviewer: ObjectId → User,
  rating: Number (1-5),
  title: String,
  comment: String,
  aspectRatings: {
    organization: Number,
    communication: Number,
    groupDynamics: Number,
    valueForMoney: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔒 Security Features

### Authentication & Authorization
- **JWT Tokens**: Secure token-based authentication with expiration
- **Password Hashing**: bcryptjs with salt rounds for secure password storage
- **Protected Routes**: All sensitive endpoints require valid JWT
- **Role-Based Access**: Different permissions for organizers vs. participants
- **Refresh Tokens**: Automatic token refresh mechanism

### Data Protection
- **Input Validation**: Express Validator on all inputs
- **XSS Protection**: Helmet.js middleware (recommended)
- **CORS Configuration**: Strict origin checking
- **Rate Limiting**: Prevent brute force attacks (planned)
- **SQL Injection Prevention**: MongoDB parameterized queries via Mongoose

### File Security
- **File Type Validation**: Only image uploads allowed
- **File Size Limits**: 10MB limit for requests
- **Cloudinary Security**: Server-side signature verification
- **URL Sanitization**: Safe Cloudinary transformation URLs

### Communication Security
- **Socket.io Authentication**: JWT verification on socket connections
- **Message Encryption**: TLS/SSL for transport layer security
- **Private Chat Rooms**: Only trip participants can access

---

## 🎨 UI/UX Features

### Responsive Design
- **Mobile-First Approach**: Fully responsive on all devices (320px - 4K)
- **Tailwind CSS**: Utility-first styling for consistency
- **Breakpoints**: xs (320px), sm (640px), md (768px), lg (1024px), xl (1280px)

### User Experience
- **Loading States**: Skeleton screens and spinners for better perception
- **Error Handling**: Detailed error messages and recovery options
- **Toast Notifications**: Non-intrusive notifications for feedback
- **Dark Mode Support**: Optional dark theme (planned)
- **Accessibility**: WCAG 2.1 AA standards compliance

### Components & Features
- **Drag-and-Drop Upload**: Easy file uploads with preview
- **Interactive Rating System**: Visual star rating component
- **Real-time Chat**: Smooth messaging with typing indicators
- **Trip Cards**: Beautiful trip previews with images and info
- **Filter Bar**: Advanced filtering with multiple criteria
- **Modal Dialogs**: Clean modals for reviews and confirmations
- **Date Picker**: Easy date selection for trip dates
- **Search**: Global search with autocomplete (planned)

### Visual Hierarchy
- **Color Scheme**: Professional travel-themed colors
- **Typography**: Clear hierarchy with font weights and sizes
- **Spacing**: Consistent margin and padding throughout
- **Icons**: Lucide React icons for visual clarity
- **Status Badges**: Color-coded trip status indicators

---

## 🚀 Deployment Guide

### Backend Deployment (Node.js)

#### Option 1: Render
```yaml
# render.yaml
services:
  - type: web
    name: travel-mate-backend
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: MONGODB_URI
        scope: build
      - key: JWT_SECRET
        scope: build
```

#### Option 2: Heroku
```bash
heroku create travel-mate-api
heroku config:set MONGODB_URI=<your-mongodb-url>
heroku config:set JWT_SECRET=<your-secret>
git push heroku main
```

#### Option 3: DigitalOcean App Platform
- Connect GitHub repository
- Auto-deploy on push to main branch
- Set environment variables in dashboard

### Frontend Deployment (React)

#### Option 1: Vercel
```bash
npm install -g vercel
vercel
# Follow prompts and set environment variables
```

#### Option 2: Netlify
```bash
npm run build
# Drag and drop `dist` folder to Netlify
# Or connect GitHub for auto-deploy
```

#### Option 3: AWS S3 + CloudFront
```bash
npm run build
aws s3 sync dist/ s3://your-bucket-name
# Create CloudFront distribution
```

### AI Service Deployment (Python/FastAPI)

#### Option 1: Render
```bash
# Create render.yaml
services:
  - type: web
    name: tourmate-ai
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

#### Option 2: Railway
```bash
railway init
# Connect to GitHub and auto-deploy
```

### Production Checklist

- [ ] Set up MongoDB Atlas with backup
- [ ] Configure Cloudinary production account
- [ ] Set strong JWT_SECRET (min 32 characters)
- [ ] Enable HTTPS everywhere
- [ ] Configure CORS for production URLs only
- [ ] Set up error monitoring (Sentry)
- [ ] Enable request logging
- [ ] Configure rate limiting
- [ ] Set up automated backups
- [ ] Create monitoring alerts
- [ ] Test all API endpoints
- [ ] Verify image uploads work
- [ ] Test real-time features (chat)
- [ ] Load testing before launch

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

### How to Contribute

1. **Fork the Repository**
   ```bash
   git clone https://github.com/yourusername/travel-mate.git
   cd travel-mate
   ```

2. **Create Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```

3. **Make Changes**
   - Follow project code style
   - Add comments for complex logic
   - Update relevant documentation

4. **Commit Changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```

5. **Push to Branch**
   ```bash
   git push origin feature/amazing-feature
   ```

6. **Open Pull Request**
   - Describe your changes
   - Link related issues
   - Request reviewers

### Code Standards

- **JavaScript/TypeScript**: Use ESLint configuration
- **Comments**: Document non-obvious code
- **Variable Names**: Use descriptive, camelCase names
- **Functions**: Keep functions small and focused
- **Testing**: Write tests for new features

### Reporting Issues

- Use GitHub Issues
- Provide detailed description
- Include error messages
- Share steps to reproduce
- Mention your environment

---

## 🌟 Key Highlights

### Innovation
- **AI-Powered Planning**: Gemini-based intelligent itinerary generation
- **Smart Matching**: LangGraph-powered trip matching algorithm
- **Real-time Sync**: Socket.io for live updates across devices

### Scalability
- **Microservices Ready**: Separate AI service can scale independently
- **Database Optimization**: Indexed MongoDB queries for fast retrieval
- **Caching Layer**: Redis support for session caching

### User Experience
- **Intuitive Interface**: Clean, modern design with Tailwind CSS
- **Accessibility**: WCAG compliant for all users
- **Performance**: Optimized images and fast loading times

### Community
- **Trust System**: Reviews and ratings build community trust
- **Safety**: Verified participants and secure communication
- **Support**: Active community and detailed documentation

---

## 📞 Support & Resources

### Documentation
- **API Docs**: See `/docs/API_DOCUMENTATION.md`
- **Architecture**: See `/docs/ARCHITECTURE_DIAGRAM.md`
- **Deployment**: See `/docs/DEPLOYMENT_GUIDE.md`

### Getting Help
- **Issues**: Create GitHub issue for bugs/features
- **Discussions**: Use GitHub Discussions for questions
- **Email**: support@travel-mate.com (planned)
- **Discord**: Join community server (coming soon)

### Learning Resources
- **Blog**: Technical articles on our blog
- **Video Tutorials**: Step-by-step setup videos
- **Code Examples**: Sample implementations
- **FAQ**: Common questions and answers

---

## 🎯 Roadmap

### Current (v1.0.0)
- ✅ Trip creation and management
- ✅ Real-time chat
- ✅ AI itinerary generation
- ✅ Review system
- ✅ Profile management

### Upcoming (v1.1.0)
- 🔄 Mobile app (React Native)
- 🔄 Payment integration (Stripe)
- 🔄 Advanced analytics dashboard
- 🔄 Social media sharing
- 🔄 Weather integration

### Future (v2.0.0)
- 📅 Transportation booking
- 📅 Hotel recommendations
- 📅 Multi-language support
- 📅 Offline trip guides
- 📅 AR travel experience
- 📅 Video call integration
- 📅 Trip insurance options

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

Permission is granted to:
- ✅ Use the software commercially
- ✅ Modify the source code
- ✅ Distribute the software
- ✅ Use the software privately

With the condition that:
- ⚠️ License and copyright notice are included

---

## 🙏 Acknowledgments

- **Google Generative AI** for powerful LLM capabilities
- **LangChain** for excellent LLM abstractions
- **LangGraph** for workflow orchestration
- **FastAPI** for modern Python web framework
- **React** for UI framework
- **Tailwind CSS** for styling
- **MongoDB** for database
- **Cloudinary** for image management
- **Socket.io** for real-time features

---

## 📊 Statistics

- **Tech Stack**: 15+ technologies
- **API Endpoints**: 25+ routes
- **Database Models**: 5 main schemas
- **Frontend Pages**: 8 main pages
- **Real-time Features**: Chat + Notifications
- **AI Integration**: LangGraph + Gemini

---

**Travel-Mate** - Connecting travelers, creating memories! 🌍✈️🎒

**Status**: Actively Developed | **Last Updated**: 2024 | **Version**: 1.0.0

---

## Quick Links

- [GitHub Repository](https://github.com/yourusername/travel-mate)
- [Live Demo](https://travel-mate.vercel.app) (Coming Soon)
- [API Documentation](./docs/API_DOCUMENTATION.md)
- [Architecture Guide](./docs/ARCHITECTURE_DIAGRAM.md)
- [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)

---

**Happy Travels! 🌎**