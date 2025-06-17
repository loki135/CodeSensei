import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codesensei';
    
    // Set mongoose options with optimized timeouts
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Increased to 10s for better reliability
      socketTimeoutMS: 30000, // Reduced to 30s to match API timeout
      connectTimeoutMS: 10000, // Connection timeout
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 2, // Minimum number of connections in the pool
      maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
      retryWrites: true,
      retryReads: true,
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

    // Monitor connection events
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', 'MongoDB connection error:', err.message);
    // Always exit on connection failure
    process.exit(1);
  }
};

export default connectDB; 