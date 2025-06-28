export const validateEnv = () => {
  const required = [
    'JWT_SECRET',
    'COHERE_API_KEY',
    'MONGODB_URI'
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }

  // Validate MongoDB URI format
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.startsWith('mongodb://') && !process.env.MONGODB_URI.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must be a valid MongoDB connection string');
  }

  // Validate COHERE_API_KEY format
  if (process.env.COHERE_API_KEY && process.env.COHERE_API_KEY.length < 20) {
    throw new Error('COHERE_API_KEY appears to be invalid');
  }

  // Set default values for optional variables
  if (!process.env.PORT) {
    process.env.PORT = '5000';
  }

  if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = 'development';
  }

  // Validate NODE_ENV
  const validEnvironments = ['development', 'production', 'test'];
  if (!validEnvironments.includes(process.env.NODE_ENV)) {
    throw new Error(`NODE_ENV must be one of: ${validEnvironments.join(', ')}`);
  }

  console.log('Environment validation passed');
}; 