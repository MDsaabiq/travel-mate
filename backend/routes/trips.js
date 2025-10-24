import express from 'express';
import { body, validationResult } from 'express-validator';
import Trip from '../models/Trip.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';
import { upload } from '../config/cloudinary.js';
import { Server as IOServer } from 'socket.io';

// Import fetch for older Node.js versions
let fetch;
try {
  fetch = globalThis.fetch;
} catch (error) {
  // Fallback for older Node.js versions
  const { default: nodeFetch } = await import('node-fetch');
  fetch = nodeFetch;
}

const router = express.Router();

// Helper function to get current date in IST
function getCurrentDateIST() {
  const now = new Date();
  // Convert to IST (UTC+5:30)
  const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  utcDate.setHours(0, 0, 0, 0);
  return utcDate;
}

// Helper function to convert date to IST start of day
function getDateStartOfDayIST(date) {
  const dateStr = date.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  const istDate = new Date(dateStr);
  istDate.setHours(0, 0, 0, 0);
  return istDate;
}

// Helper function to calculate trip status based on IST
function calculateTripStatus(trip) {
  const now = getCurrentDateIST();
  const startDate = getDateStartOfDayIST(trip.dates.start);
  const endDate = getDateStartOfDayIST(trip.dates.end);
  
  if (now < startDate) {
    return 'not_started';
  } else if (now >= startDate && now <= endDate) {
    return 'in_journey';
  } else {
    return 'ended';
  }
}

// Helper function to update trip status if needed
async function updateTripStatusIfNeeded(trip) {
  const currentStatus = calculateTripStatus(trip);
  if (trip.status !== currentStatus) {
    trip.status = currentStatus;
    await trip.save();
  }
  return trip;
}

// Helper function to generate itinerary using external API
const generateItinerary = async (destination, interests, duration) => {
  try {
    console.log('Generating itinerary for:', { destination, interests, duration });

    const response = await fetch(process.env.ITINERARY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        request: "Plan my trip for each with time specific things to do in day",
        city: destination,
        interests: interests,
        duration: duration
      }),
      timeout: 30000 // 30 second timeout
    });

    if (!response.ok) {
      console.error(`API response error: ${response.status} ${response.statusText}`);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API response:', data);

    if (data.itinerary && Array.isArray(data.itinerary)) {
      return data.itinerary;
    } else {
      console.error('Invalid itinerary format received:', data);
      return [];
    }
  } catch (error) {
    console.error('Itinerary generation error:', error);
    return [];
  }
};

// Create trip
router.post('/', authenticate, [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('destination').trim().isLength({ min: 2 }).withMessage('Destination is required'),
  body('dates.start').isISO8601().withMessage('Start date is required'),
  body('dates.end').isISO8601().withMessage('End date is required'),
  body('travelMode').isIn(['flight', 'train', 'bus', 'car', 'other']).withMessage('Invalid travel mode'),
  body('rules').trim().isLength({ min: 10 }).withMessage('Rules must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      title, 
      destination, 
      coverPhoto, 
      dates, 
      travelMode, 
      itinerary, 
      rules, 
      maxParticipants,
      generateItineraryAuto,
      interests
    } = req.body;

    // Validate dates
    if (new Date(dates.start) < new Date()) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (new Date(dates.end) <= new Date(dates.start)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    let finalItinerary = itinerary || [];

    // Generate itinerary automatically if requested
    if (generateItineraryAuto && interests) {
      const duration = Math.floor((new Date(dates.end) - new Date(dates.start)) / (1000 * 60 * 60 * 24)) + 1;
      const generatedItinerary = await generateItinerary(destination, interests, duration);
      
      if (generatedItinerary.length > 0) {
        finalItinerary = generatedItinerary;
      }
    }

    const trip = new Trip({
      title,
      destination,
      coverPhoto,
      dates,
      travelMode,
      itinerary: finalItinerary,
      rules,
      organizer: req.user._id,
      participants: [req.user._id],
      maxParticipants: maxParticipants || 10
    });

    await trip.save();
    await trip.populate('organizer', 'name photo city');
    await trip.populate('participants', 'name photo city');

    res.status(201).json({
      message: 'Trip created successfully',
      trip,
      itineraryGenerated: generateItineraryAuto && finalItinerary.length > 0
    });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all trips
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, destination, startDate, endDate, travelMode, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    // Exclude user's own trips from the listing - users should only see trips they can join
    if (req.user) {
      query.organizer = { $ne: req.user._id };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } }
      ];
    }

    if (destination) {
      query.destination = { $regex: destination, $options: 'i' };
    }

    if (startDate) {
      query['dates.start'] = { $gte: new Date(startDate) };
    }

    if (endDate) {
      query['dates.end'] = { $lte: new Date(endDate) };
    }

    if (travelMode) {
      query.travelMode = travelMode;
    }

    let trips = await Trip.find(query)
      .populate('organizer', 'name photo city travelPersona')
      .populate('participants', 'name photo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Recalculate and update trip status for each trip
    trips = await Promise.all(trips.map(trip => updateTripStatusIfNeeded(trip)));

    const total = await Trip.countDocuments(query);

    res.json({
      trips,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalTrips: total,
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's trips
router.get('/user/my-trips', authenticate, async (req, res) => {
  try {
    const { type = 'all' } = req.query;
    let query = {};

    switch (type) {
      case 'organized':
        query.organizer = req.user._id;
        break;
      case 'joined':
        query.participants = req.user._id;
        query.organizer = { $ne: req.user._id };
        break;
      default:
        query.$or = [
          { organizer: req.user._id },
          { participants: req.user._id }
        ];
    }

    let trips = await Trip.find(query)
      .populate('organizer', 'name photo')
      .populate('participants', 'name photo')
      .sort({ createdAt: -1 });

    // Recalculate and update trip status for each trip
    trips = await Promise.all(trips.map(trip => updateTripStatusIfNeeded(trip)));

    res.json({ trips });
  } catch (error) {
    console.error('Get user trips error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Generate itinerary endpoint
router.post('/generate-itinerary', authenticate, async (req, res) => {
  try {
    const { destination, interests, duration } = req.body;

    if (!destination || !interests || !duration) {
      return res.status(400).json({ 
        message: 'Destination, interests, and duration are required' 
      });
    }

    const generatedItinerary = await generateItinerary(destination, interests, duration);
    
    if (generatedItinerary.length === 0) {
      return res.status(500).json({ 
        message: 'Failed to generate itinerary. Please try again.' 
      });
    }

    res.json({
      message: 'Itinerary generated successfully',
      itinerary: generatedItinerary
    });
  } catch (error) {
    console.error('Generate itinerary endpoint error:', error);
    res.status(500).json({ 
      message: 'Failed to generate itinerary. Please try again.' 
    });
  }
});

// Upload trip cover photo
router.post('/upload-image', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    res.json({
      message: 'Image uploaded successfully',
      imageUrl: req.file.path,
      publicId: req.file.filename
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ message: 'Failed to upload image' });
  }
});

// Bulk update trip statuses (for system maintenance)
router.put('/bulk/update-status', authenticate, async (req, res) => {
  try {
    // Only allow admin users to perform bulk updates (you can add admin check here)
    const trips = await Trip.find({});
    let updatedCount = 0;

    for (const trip of trips) {
      const originalStatus = trip.status;
      await trip.save(); // This will trigger the pre-save middleware to recalculate status
      if (trip.status !== originalStatus) {
        updatedCount++;
      }
    }

    res.json({
      message: `Bulk status update completed. \${updatedCount} trips updated.`,
      updatedCount
    });
  } catch (error) {
    console.error('Bulk status update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trip gender demographics (MUST be before /:id route)
router.get('/:id/demographics', async (req, res) => {
  try {
    const { id } = req.params;

    let trip = await Trip.findById(id)
      .populate('participants', 'gender');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const demographics = await trip.getGenderDemographics();

    res.json({ 
      demographics,
      status: trip.status
    });
  } catch (error) {
    console.error('Get demographics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single trip by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || typeof id !== 'string' || id === '[object Object]') {
      return res.status(400).json({ message: 'Invalid trip ID format' });
    }

    let trip = await Trip.findById(id)
      .populate('organizer', 'name photo city age travelPersona bio gender')
      .populate('participants', 'name photo city age travelPersona gender')
      .populate('joinRequests.user', 'name photo city age travelPersona bio gender')
      .populate('reviews.user', 'name photo')
      .populate('previousReviews.user', 'name photo');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Recalculate and update trip status
    trip = await updateTripStatusIfNeeded(trip);

    res.json({ trip });
  } catch (error) {
    console.error('Get trip details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update trip
router.put('/:id', authenticate, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is the organizer
    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the organizer can update this trip' });
    }

    const { title, destination, coverPhoto, dates, travelMode, itinerary, rules, maxParticipants } = req.body;

    const updatedTrip = await Trip.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(destination && { destination }),
        ...(coverPhoto !== undefined && { coverPhoto }),
        ...(dates && { dates }),
        ...(travelMode && { travelMode }),
        ...(itinerary && { itinerary }),
        ...(rules && { rules }),
        ...(maxParticipants && { maxParticipants })
      },
      { new: true, runValidators: true }
    ).populate('organizer', 'name photo city')
     .populate('participants', 'name photo city');

    res.json({
      message: 'Trip updated successfully',
      trip: updatedTrip
    });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete trip
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is the organizer
    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the organizer can delete this trip' });
    }

    await Trip.findByIdAndUpdate(req.params.id, { isActive: false });

    res.json({ message: 'Trip cancelled successfully' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send join request
router.post('/:id/join', authenticate, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if trip is at max capacity
    if (trip.participants.length >= trip.maxParticipants) {
      return res.status(400).json({ message: 'Trip is at maximum capacity' });
    }

    // Check if user is the organizer
    if (trip.organizer.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot join your own trip' });
    }

    // Check if user is already a participant
    if (trip.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already a participant in this trip' });
    }

    // Check if user already has a pending request
    const existingRequest = trip.joinRequests.find(
      request => request.user.toString() === req.user._id.toString() && request.status === 'pending'
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'You already have a pending join request for this trip' });
    }

    // Add join request
    trip.joinRequests.push({
      user: req.user._id,
      status: 'pending'
    });

    await trip.save();

    // Create a notification for the trip organizer about the new join request
    const requestUser = await User.findById(req.user._id);
    const notification = new Notification({
      user: trip.organizer,
      sender: req.user._id,
      type: 'join-request-pending',
      message: `${requestUser.name} requested to join your trip "${trip.title}".`,
      trip: trip._id
    });
    await notification.save();

    res.json({ message: 'Join request sent successfully' });
  } catch (error) {
    console.error('Send join request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Handle join request (accept/decline)
router.post('/:tripId/join-requests/:requestId/:action', authenticate, async (req, res) => {
  try {
    const { action } = req.params;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ message: 'Invalid action' });
    }

    const trip = await Trip.findById(req.params.tripId);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is the organizer
    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the organizer can manage join requests' });
    }

    const requestIndex = trip.joinRequests.findIndex(
      request => request._id.toString() === req.params.requestId
    );

    if (requestIndex === -1) {
      return res.status(404).json({ message: 'Join request not found' });
    }

    const joinRequest = trip.joinRequests[requestIndex];

    // Check if request has already been processed
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Join request has already been processed' });
    }

    if (action === 'approve') {
      // Check if trip is at max capacity before approving
      if (trip.participants.length >= trip.maxParticipants) {
        return res.status(400).json({ message: 'Trip is at maximum capacity' });
      }

      // Check if user is already a participant
      if (trip.participants.includes(joinRequest.user)) {
        return res.status(400).json({ message: 'User is already a participant' });
      }

      // Add user to participants
      trip.participants.push(joinRequest.user);
    }

    // Create a notification for the user
    const notification = new Notification({
      user: joinRequest.user,
      sender: req.user._id,
      type: action === 'approve' ? 'join-request-accepted' : 'join-request-rejected',
      message: `Your request to join the trip "${trip.title}" has been ${action === 'approve' ? 'accepted' : 'rejected'}.`,
      trip: trip._id
    });
    await notification.save();

    // Remove the join request after processing
    trip.joinRequests.splice(requestIndex, 1);

    await trip.save();

    // Populate the trip data before sending response
    await trip.populate('organizer', 'name photo city age travelPersona bio');
    await trip.populate('participants', 'name photo city age travelPersona');
    await trip.populate('joinRequests.user', 'name photo city age travelPersona bio');

    res.json({
      message: `Join request ${action}d successfully`,
      trip
    });
  } catch (error) {
    console.error('Handle join request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Leave trip
router.post('/:id/leave', authenticate, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is a participant
    if (!trip.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are not a participant in this trip' });
    }

    // Check if user is the organizer
    if (trip.organizer.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Organizer cannot leave their own trip' });
    }

    // Remove user from participants
    trip.participants = trip.participants.filter(
      participant => participant.toString() !== req.user._id.toString()
    );

    await trip.save();

    res.json({ message: 'Left trip successfully' });
  } catch (error) {
    console.error('Leave trip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update trip status manually (for organizers)
router.put('/:id/status', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['not_started', 'in_journey', 'ended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is the organizer
    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the organizer can update trip status' });
    }

    trip.status = status;
    await trip.save();

    await trip.populate('organizer', 'name photo city');
    await trip.populate('participants', 'name photo city');

    res.json({
      message: 'Trip status updated successfully',
      trip
    });
  } catch (error) {
    console.error('Update trip status error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Restart a completed trip with new dates
router.post('/:id/restart', authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || typeof id !== 'string' || id === '[object Object]') {
      return res.status(400).json({ message: 'Invalid trip ID format' });
    }

    const { dates } = req.body;

    if (!dates || !dates.start || !dates.end) {
      return res.status(400).json({ message: 'Start and end dates are required' });
    }

    const trip = await Trip.findById(id);

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if user is the organizer
    if (trip.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only the organizer can restart this trip' });
    }

    // Validate dates
    if (new Date(dates.start) < new Date()) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (new Date(dates.end) <= new Date(dates.start)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Move current reviews to previousReviews
    trip.previousReviews = trip.previousReviews.concat(trip.reviews);
    trip.reviews = [];
    trip.averageRating = 0;

    // Update dates and reset status
    trip.dates = dates;
    trip.status = 'not_started'; // Will be recalculated by pre-save middleware
    trip.isActive = true; // Re-activate the trip when restarting

    await trip.save();

    await trip.populate('organizer', 'name photo city');
    await trip.populate('participants', 'name photo city');

    res.json({
      message: 'Trip restarted successfully',
      trip
    });
  } catch (error) {
    console.error('Restart trip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit a review for a trip
router.post('/:id/reviews', authenticate, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Review must be between 10 and 500 characters')
], async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || typeof id !== 'string' || id === '[object Object]') {
      return res.status(400).json({ message: 'Invalid trip ID format' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const trip = await Trip.findById(id).populate('organizer', 'name photo');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    // Check if trip has ended
    if (trip.status !== 'ended') {
      return res.status(400).json({ message: 'Can only review completed trips' });
    }

    // Check if user is a participant (but not organizer)
    if (!trip.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Only trip participants can review' });
    }

    if (trip.organizer._id.toString() === req.user._id.toString()) {
      return res.status(403).json({ message: 'Organizers cannot review their own trips' });
    }

    // Check if user already reviewed
    const alreadyReviewed = trip.reviews.some(review => review.user.toString() === req.user._id.toString());
    if (alreadyReviewed) {
      return res.status(400).json({ message: 'You have already reviewed this trip' });
    }

    // Add review
    const review = {
      user: req.user._id,
      rating: req.body.rating,
      description: req.body.description,
      createdAt: new Date()
    };

    trip.reviews.push(review);

    // Recalculate average rating
    const totalRating = trip.reviews.reduce((sum, r) => sum + r.rating, 0);
    trip.averageRating = (totalRating / trip.reviews.length).toFixed(2);

    await trip.save();

    // Populate user data for the review
    await trip.populate('reviews.user', 'name photo');

    res.status(201).json({
      message: 'Review added successfully',
      trip
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;