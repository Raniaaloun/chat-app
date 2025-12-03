const express = require('express');
const Message = require('../models/Message');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Get messages between current user and another user
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Check if user exists
    const otherUser = await User.findById(userId);
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Permission check: normal users can only chat with Montaser
    if (req.user.role === 'normal' && otherUser.role !== 'montaser') {
      return res.status(403).json({ error: 'You can only chat with Montaser' });
    }

    // Get messages where current user is sender or receiver
    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
      .populate('sender', 'username role')
      .populate('receiver', 'username role')
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Send a message
router.post('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, content, thumbnail } = req.body;
    const currentUserId = req.user._id;

    // Check if user exists
    const receiver = await User.findById(userId);
    if (!receiver) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Permission check: normal users can only send messages to Montaser
    if (req.user.role === 'normal' && receiver.role !== 'montaser') {
      return res.status(403).json({ error: 'You can only chat with Montaser' });
    }

    const message = new Message({
      sender: currentUserId,
      receiver: userId,
      type: type || 'text',
      content,
      thumbnail: thumbnail || null
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate('sender', 'username role')
      .populate('receiver', 'username role');

    res.status(201).json({ message: populatedMessage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark messages as read
router.patch('/:userId/read', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false
      },
      {
        read: true
      }
    );

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
