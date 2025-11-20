const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const seedMontaser = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if Montaser already exists
    const existingMontaser = await User.findOne({ role: 'montaser' });
    
    if (existingMontaser) {
      console.log('Montaser already exists. Skipping seed.');
      await mongoose.connection.close();
      return;
    }

    // Create Montaser user with a default password
    // Note: For production, change this password after first login
    const defaultPassword = 'montaser123'; // Change this in production!
    
    const montaser = new User({
      username: 'Montaser',
      email: 'montaser@pingm.com',
      role: 'montaser',
      password: defaultPassword // Will be hashed by User model's pre-save hook
    });

    await montaser.save();
    console.log('Montaser user created successfully!');
    console.log('Username: Montaser');
    console.log('Email: montaser@pingm.com');
    console.log('Role: montaser');
    console.log('Default Password: montaser123');
    console.log('⚠️  IMPORTANT: Change this password in production!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding Montaser:', error);
    process.exit(1);
  }
};

seedMontaser();
