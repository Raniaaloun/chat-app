const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const messageRoutes = require('./routes/messages');
const uploadRoutes = require('./routes/upload');
const Message = require('./models/Message');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Socket.io authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return next(new Error('Authentication error'));
    }

    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.user.username} (${socket.user.role})`);

  // Join user's personal room
  socket.join(`user_${socket.userId}`);

  // Handle sending messages
  socket.on('send_message', async (data) => {
    try {
      const { receiverId, type, content, thumbnail } = data;

      // Verify receiver exists
      const receiver = await User.findById(receiverId);
      if (!receiver) {
        socket.emit('error', { message: 'Receiver not found' });
        return;
      }

      // Permission check
      if (socket.user.role === 'normal' && receiver.role !== 'montaser') {
        socket.emit('error', { message: 'You can only chat with Montaser' });
        return;
      }

      // Create message
      const message = new Message({
        sender: socket.userId,
        receiver: receiverId,
        type: type || 'text',
        content,
        thumbnail: thumbnail || null
      });

      await message.save();

      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username role')
        .populate('receiver', 'username role');

      // Check if receiver is online (in their room)
      const receiverSockets = await io.in(`user_${receiverId}`).fetchSockets();
      if (receiverSockets.length > 0) {
        // Receiver is online, mark as delivered
        message.delivered = true;
        await message.save();
        
        // Re-populate message with updated delivered status
        const updatedMessage = await Message.findById(message._id)
          .populate('sender', 'username role')
          .populate('receiver', 'username role');
        
        // Emit to receiver
        io.to(`user_${receiverId}`).emit('receive_message', updatedMessage);
        
        // Emit delivery status to sender
        socket.emit('message_delivered', {
          messageId: message._id,
          delivered: true
        });
        
        // Emit back to sender for confirmation with updated status
        socket.emit('message_sent', updatedMessage);
      } else {
        // Receiver is offline, emit without delivered status
        io.to(`user_${receiverId}`).emit('receive_message', populatedMessage);
        socket.emit('message_sent', populatedMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle typing indicator
  socket.on('typing', (data) => {
    const { receiverId, isTyping } = data;
    socket.to(`user_${receiverId}`).emit('user_typing', {
      userId: socket.userId,
      username: socket.user.username,
      isTyping
    });
  });

  // Handle marking messages as read
  socket.on('mark_as_read', async (data) => {
    try {
      const { senderId } = data;
      const currentUserId = socket.userId;

      // Mark all unread messages from sender as read
      const result = await Message.updateMany(
        {
          sender: senderId,
          receiver: currentUserId,
          read: false
        },
        {
          read: true,
          readAt: new Date()
        }
      );

      if (result.modifiedCount > 0) {
        // Get the updated messages to send back
        const updatedMessages = await Message.find({
          sender: senderId,
          receiver: currentUserId,
          read: true
        }).select('_id');

        // Emit read status to sender
        io.to(`user_${senderId}`).emit('messages_read', {
          messageIds: updatedMessages.map(m => m._id),
          readBy: currentUserId
        });
      }
    } catch (error) {
      console.error('Error marking messages as read:', error);
      socket.emit('error', { message: 'Failed to mark messages as read' });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.user.username}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
