import express from 'express';
import { body, validationResult } from 'express-validator';
import Message from '../models/Message.js';
import Trip from '../models/Trip.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get chat messages for a trip
router.get('/:tripId/messages', authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const tripId = req.params.tripId;

    // Check if user is a participant or organizer of the trip
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const isOrganizer = trip.organizer.toString() === req.user._id.toString();
    const isParticipant = trip.participants.includes(req.user._id);

    if (!isOrganizer && !isParticipant) {
      return res.status(403).json({ message: 'You are not authorized to access this chat' });
    }

    const messages = await Message.find({ tripId })
      .populate('sender', 'name photo')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments({ tripId });

    res.json({
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalMessages: total,
        hasMore: page * limit < total
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a message
router.post('/:tripId/messages', authenticate, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Message content is required and must be less than 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const tripId = req.params.tripId;
    const { content } = req.body;

    // Check if user is a participant or organizer of the trip
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const isOrganizer = trip.organizer.toString() === req.user._id.toString();
    const isParticipant = trip.participants.includes(req.user._id);

    if (!isOrganizer && !isParticipant) {
      return res.status(403).json({ message: 'You are not authorized to send messages in this chat' });
    }

    const message = new Message({
      tripId,
      sender: req.user._id,
      content,
      timestamp: new Date()
    });

    await message.save();
    await message.populate('sender', 'name photo');

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get trip participants for chat
router.get('/:tripId/participants', authenticate, async (req, res) => {
  try {
    const tripId = req.params.tripId;

    const trip = await Trip.findById(tripId)
      .populate('participants', 'name photo city travelPersona')
      .populate('organizer', 'name photo city travelPersona');

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    const isOrganizer = trip.organizer._id.toString() === req.user._id.toString();
    const isParticipant = trip.participants.some(p => p._id.toString() === req.user._id.toString());

    if (!isOrganizer && !isParticipant) {
      return res.status(403).json({ message: 'You are not authorized to access this chat' });
    }

    res.json({
      participants: trip.participants,
      organizer: trip.organizer,
      tripInfo: {
        title: trip.title,
        destination: trip.destination,
        dates: trip.dates
      }
    });
  } catch (error) {
    console.error('Get participants error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;