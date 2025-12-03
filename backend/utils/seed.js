const mongoose = require('mongoose');
require('dotenv').config();
const User = require('../models/User');

const seedMontaser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const existingMontaser = await User.findOne({ role: 'montaser' });
    
    if (existingMontaser) {
      console.log('Montaser already exists. Skipping seed.');
      await mongoose.connection.close();
      return;
    }

    const defaultPassword = 'montaser123';
    
    const montaser = new User({
      username: 'Montaser',
      email: 'montaser@pingm.com',
      role: 'montaser',
      password: defaultPassword
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
    console.error('Error seeding Montaser:', error.message);
    if (error.message.includes('IP') || error.message.includes('whitelist') || error.message.includes('not authorized')) {
      console.error('\n⚠️  MongoDB Atlas Connection Issue Detected');
      console.error('To fix: Go to MongoDB Atlas → Network Access → IP Access List');
      console.error('Add your IP or use 0.0.0.0/0 for development (wait 1-2 min for changes)');
      console.error('Also check: MONGODB_URI, credentials, and cluster status');
    }
    process.exit(1);
  }
};

seedMontaser();

