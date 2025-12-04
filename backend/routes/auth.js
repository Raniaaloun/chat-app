const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Message = require('../models/Message');
const auth = require('../middleware/auth');

const router = express.Router();

// Register (only for normal users)
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create normal user
    const user = new User({
      username,
      email,
      password,
      role: 'normal'
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login (only for normal users)
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Get all users for chat (normal users can only see Montaser, Montaser can see everyone)
router.get('/users', auth, async (req, res) => {
  try {
    // Normal users: only see Montaser (no special ordering needed)
    if (req.user.role === 'normal') {
      const users = await User.find({ role: 'montaser' }).select('username role createdAt');
      return res.json({ users });
    }

    // Montaser (admin): see everyone else, ordered by most recent conversation first
    const currentUserId = req.user._id;

    // Get all users except current admin
    const users = await User.find({ _id: { $ne: currentUserId } }).select('username role createdAt');

    // Build a map of userId -> lastMessageAt based on messages with Montaser
    const lastMessages = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ]
        }
      },
      {
        $project: {
          createdAt: 1,
          otherUser: {
            $cond: [
              { $eq: ['$sender', currentUserId] },
              '$receiver',
              '$sender'
            ]
          }
        }
      },
      {
        $group: {
          _id: '$otherUser',
          lastMessageAt: { $max: '$createdAt' }
        }
      }
    ]);

    const lastMessageMap = {};
    lastMessages.forEach((entry) => {
      lastMessageMap[String(entry._id)] = entry.lastMessageAt;
    });

    // Sort users so that the ones with the most recent conversations appear first.
    // Users with no conversation yet will appear at the bottom.
    const sortedUsers = users.sort((a, b) => {
      const aLast = lastMessageMap[String(a._id)];
      const bLast = lastMessageMap[String(b._id)];

      if (aLast && bLast) {
        return bLast - aLast;
      }
      if (aLast) return -1;
      if (bLast) return 1;
      return 0;
    });

    res.json({ users: sortedUsers });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
