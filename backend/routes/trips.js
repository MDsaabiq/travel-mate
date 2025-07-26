import express from 'express';
import { body, validationResult } from 'express-validator';
import Trip from '../models/Trip.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

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

    const { title, destination, coverPhoto, dates, travelMode, itinerary, rules, maxParticipants } = req.body;

    // Validate dates
    if (new Date(dates.start) < new Date()) {
      return res.status(400).json({ message: 'Start date cannot be in the past' });
    }

    if (new Date(dates.end) <= new Date(dates.start)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const trip = new Trip({
      title,
      destination,
      coverPhoto,
      dates,
      travelMode,
      itinerary: itinerary || [],
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
      trip
    });
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all trips
router.get('/', async (req, res) => {
  try {
    const { search, destination, startDate, endDate, city, travelPersona, page = 1, limit = 12 } = req.query;
    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
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

    const trips = await Trip.find(query)
      .populate('organizer', 'name photo city travelPersona')
      .populate('participants', 'name photo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Trip.countDocuments(query);

    res.json({
      trips,
      pagination: {
        currentPage: page,
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

// Get trip details
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('organizer', 'name photo city age travelPersona bio')
      .populate('participants', 'name photo city age travelPersona')
      .populate('joinRequests.user', 'name photo city age travelPersona bio');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

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

    // Check if user is already a participant
    if (trip.participants.includes(req.user._id)) {
      return res.status(400).json({ message: 'You are already a participant in this trip' });
    }

    // Check if user is the organizer
    if (trip.organizer.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot join your own trip' });
    }

    // Check if user has already sent a join request
    const existingRequest = trip.joinRequests.find(
      request => request.user.toString() === req.user._id.toString()
    );

    if (existingRequest) {
      return res.status(400).json({ message: 'You have already sent a join request for this trip' });
    }

    // Check if trip is full
    if (trip.participants.length >= trip.maxParticipants) {
      return res.status(400).json({ message: 'This trip is already full' });
    }

    trip.joinRequests.push({
      user: req.user._id,
      status: 'pending'
    });

    await trip.save();

    res.json({ message: 'Join request sent successfully' });
  } catch (error) {
    console.error('Send join request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Handle join request (accept/decline)
router.put('/:tripId/requests/:requestId', authenticate, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
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
    joinRequest.status = status;

    if (status === 'accepted') {
      // Check if trip is full
      if (trip.participants.length >= trip.maxParticipants) {
        return res.status(400).json({ message: 'Trip is already full' });
      }

      // Add user to participants
      trip.participants.push(joinRequest.user);
    }

    await trip.save();

    res.json({
      message: `Join request ${status} successfully`,
      trip
    });
  } catch (error) {
    console.error('Handle join request error:', error);
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

    const trips = await Trip.find(query)
      .populate('organizer', 'name photo')
      .populate('participants', 'name photo')
      .sort({ createdAt: -1 });

    res.json({ trips });
  } catch (error) {
    console.error('Get user trips error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;