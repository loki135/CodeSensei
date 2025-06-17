const requiredEnvVars = [
  'JWT_SECRET',
  'MONGODB_URI',
  'COHERE_API_KEY'
];

export function validateEnv() {
  const missing = [];

  // Only check for essential variables
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  });

  // Set default values for development
  if (process.env.NODE_ENV === 'development') {
    if (!process.env.MONGODB_URI) {
      process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/codesensei';
      console.log('\x1b[33m%s\x1b[0m', 'Using default MongoDB URI for development');
    }
    
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'development_secret_key_please_change_in_production';
      console.log('\x1b[33m%s\x1b[0m', 'Using default JWT secret for development');
    }

    if (!process.env.COHERE_API_KEY) {
      process.env.COHERE_API_KEY = 'TZYeYpbNB2YUG28oACQGPxZQWKACZKZ8WmNusqss';
      console.log('\x1b[33m%s\x1b[0m', 'Using default Cohere API key for development');
    }

    // Clear missing array since we've set defaults
    missing.length = 0;
  }

  if (missing.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: Missing required environment variables:');
    missing.forEach(varName => {
      console.error('\x1b[33m%s\x1b[0m', `- ${varName}`);
    });
    
    if (missing.includes('JWT_SECRET')) {
      console.log('\n\x1b[36m%s\x1b[0m', 'To generate a secure JWT_SECRET, run:');
      console.log('\x1b[36m%s\x1b[0m', 'npm run generate-secret');
    }
    
    process.exit(1);
  }

  // Only validate JWT_SECRET strength in production
  if (process.env.NODE_ENV === 'production' && 
      process.env.JWT_SECRET && 
      process.env.JWT_SECRET.length < 32) {
    console.error('\x1b[31m%s\x1b[0m', 'Error: JWT_SECRET is too weak. It should be at least 32 characters long.');
    console.log('\n\x1b[36m%s\x1b[0m', 'To generate a secure JWT_SECRET, run:');
    console.log('\x1b[36m%s\x1b[0m', 'npm run generate-secret');
    process.exit(1);
  }

  // Log environment status
  console.log('\x1b[32m%s\x1b[0m', 'Environment validation passed');
  console.log('\x1b[36m%s\x1b[0m', `Running in ${process.env.NODE_ENV} mode`);
} 