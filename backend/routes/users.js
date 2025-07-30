import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

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

// Get user's organized trips
router.get('/:id/trips/organized', authenticate, async (req, res) => {
  try {
    const Trip = (await import('../models/Trip.js')).default;

    const trips = await Trip.find({ organizer: req.params.id })
      .populate('organizer', 'name photo city travelPersona')
      .populate('participants', 'name photo')
      .sort({ createdAt: -1 });

    res.json({ trips });
  } catch (error) {
    console.error('Get organized trips error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's joined trips
router.get('/:id/trips/joined', authenticate, async (req, res) => {
  try {
    const Trip = (await import('../models/Trip.js')).default;

    const trips = await Trip.find({
      participants: req.params.id,
      organizer: { $ne: req.params.id }
    })
      .populate('organizer', 'name photo city travelPersona')
      .populate('participants', 'name photo')
      .sort({ createdAt: -1 });

    res.json({ trips });
  } catch (error) {
    console.error('Get joined trips error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Upload profile image
router.post('/upload-profile-image', authenticate, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: 'travel-mate/profiles',
          transformation: [
            { width: 400, height: 400, crop: 'fill', gravity: 'face' },
            { quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    res.json({
      message: 'Profile image uploaded successfully',
      imageUrl: result.secure_url
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ message: 'Failed to upload profile image' });
  }
});

export default router;