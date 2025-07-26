import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Get user profile
router.get('/:id/profile', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user profile
router.put('/:id/profile', authenticate, [
  body('name').optional().trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio must be less than 500 characters'),
  body('city').optional().notEmpty().withMessage('City cannot be empty'),
  body('age').optional().isInt({ min: 18, max: 100 }).withMessage('Age must be between 18 and 100'),
  body('gender').optional().isIn(['male', 'female', 'other', '']).withMessage('Invalid gender'),
  body('travelPersona').optional().isIn(['solo', 'planner', 'adventurer']).withMessage('Invalid travel persona')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is updating their own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ message: 'Unauthorized to update this profile' });
    }

    const { name, bio, city, age, gender, travelPersona, interests, photo } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(city && { city }),
        ...(age && { age }),
        ...(gender !== undefined && { gender }),
        ...(travelPersona && { travelPersona }),
        ...(interests && { interests }),
        ...(photo && { photo })
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (for discovery)
router.get('/', authenticate, async (req, res) => {
  try {
    const { search, city, travelPersona } = req.query;
    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { interests: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (travelPersona) {
      query.travelPersona = travelPersona;
    }

    const users = await User.find(query).select('-password').limit(20);

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;