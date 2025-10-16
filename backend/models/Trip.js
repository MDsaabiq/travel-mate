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
}, {
  timestamps: true
});

const itinerarySchema = new mongoose.Schema({
  day: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
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
  status: {
    type: String,
    enum: ['not_started', 'in_journey', 'ended'],
    default: 'not_started'
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to automatically calculate status based on dates
tripSchema.pre('save', function(next) {
  const now = new Date();
  const startDate = new Date(this.dates.start);
  const endDate = new Date(this.dates.end);
  
  // Set time to start of day for accurate comparison
  now.setHours(0, 0, 0, 0);
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  
  // Debug logging
  console.log('Status calculation debug:', {
    now: now.toISOString(),
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    nowTime: now.getTime(),
    startTime: startDate.getTime(),
    endTime: endDate.getTime()
  });
  
  if (now < startDate) {
    this.status = 'not_started';
    console.log('Setting status to not_started');
  } else if (now >= startDate && now <= endDate) {
    this.status = 'in_journey';
    console.log('Setting status to in_journey');
  } else {
    this.status = 'ended';
    console.log('Setting status to ended');
  }
  
  console.log('Final status:', this.status);
  
  next();
});

// Virtual field to check if trip is at max capacity
tripSchema.virtual('isMaxJoined').get(function() {
  // Handle case where participants might not be populated
  if (!this.participants || !Array.isArray(this.participants)) {
    return false;
  }
  return this.participants.length >= this.maxParticipants;
});

// Ensure virtual fields are serialized
tripSchema.set('toJSON', { virtuals: true });
tripSchema.set('toObject', { virtuals: true });

// Index for search functionality
tripSchema.index({ destination: 'text', title: 'text' });
tripSchema.index({ 'dates.start': 1, 'dates.end': 1 });
tripSchema.index({ status: 1 });
tripSchema.index({ averageRating: 1 });

export default mongoose.model('Trip', tripSchema);