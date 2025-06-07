import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codesensei';
    
    // Set mongoose options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    // Connect to MongoDB
    await mongoose.connect(mongoURI, options);
    console.log('\x1b[32m%s\x1b[0m', 'MongoDB Connected...');

    // Log connection status
    console.log('MongoDB connection status:', {
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    });

  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', 'MongoDB connection error:', err.message);
    // Always exit on connection failure
    process.exit(1);
  }
};

export default connectDB; 