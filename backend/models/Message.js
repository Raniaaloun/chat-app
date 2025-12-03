const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'voice'],
    required: true,
    default: 'text'
  },
  content: {
    type: String,
    required: true // For text messages, this is the text. For media, this is the URL
  },
  thumbnail: {
    type: String, // For videos, we can store a thumbnail URL
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  read: {
    type: Boolean,
    default: false
  }
});

// Index for efficient querying
messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
