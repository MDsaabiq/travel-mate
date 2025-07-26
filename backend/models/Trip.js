import mongoose from 'mongoose';

const joinRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  }
});

const itinerarySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true
  },
  activities: {
    type: String,
    required: true
  }
});

const tripSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  coverPhoto: {
    type: String,
    default: ''
  },
  dates: {
    start: {
      type: Date,
      required: true
    },
    end: {
      type: Date,
      required: true
    }
  },
  travelMode: {
    type: String,
    enum: ['flight', 'train', 'bus', 'car', 'other'],
    required: true
  },
  itinerary: [itinerarySchema],
  rules: {
    type: String,
    required: true
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  joinRequests: [joinRequestSchema],
  maxParticipants: {
    type: Number,
    default: 10,
    min: 2,
    max: 20
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for search functionality
tripSchema.index({ destination: 'text', title: 'text' });
tripSchema.index({ 'dates.start': 1, 'dates.end': 1 });

export default mongoose.model('Trip', tripSchema);