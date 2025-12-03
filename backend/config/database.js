const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    if (error.message.includes('IP') || error.message.includes('whitelist') || error.message.includes('not authorized')) {
      console.error('\n⚠️  MongoDB Atlas Connection Issue Detected');
      console.error('To fix: Go to MongoDB Atlas → Network Access → IP Access List');
      console.error('Add your IP or use 0.0.0.0/0 for development (wait 1-2 min for changes)');
      console.error('Also check: MONGODB_URI, credentials, and cluster status');
    }
    process.exit(1);
  }
};

module.exports = connectDB;

