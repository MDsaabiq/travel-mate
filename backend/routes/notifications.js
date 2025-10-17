import express from 'express';
import { authenticate } from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// Get all notifications for the logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    // First, clean up any invalid notifications (with wrong enum values)
    await Notification.deleteMany({ 
      user: req.user._id,
      type: { $nin: ['join-request-accepted', 'join-request-rejected', 'new-message'] }
    });

    const notifications = await Notification.find({ user: req.user._id })
      .populate('sender', 'name photo')
      .sort({ createdAt: -1 });

    const unreadCount = await Notification.countDocuments({ user: req.user._id, isRead: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark a notification as read
router.put('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this notification' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cleanup endpoint to remove invalid notifications (for maintenance)
router.delete('/cleanup/invalid', authenticate, async (req, res) => {
  try {
    const result = await Notification.deleteMany({ 
      type: { $nin: ['join-request-accepted', 'join-request-rejected', 'new-message'] }
    });

    res.json({ 
      message: 'Invalid notifications cleaned up successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Cleanup notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;