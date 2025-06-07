export const validateEnv = () => {
  const requiredEnvVars = [
    'MONGODB_URI',
    'JWT_SECRET',
    'OPENAI_API_KEY',
    'NODE_ENV',
    'PORT'
  ];

  const optionalEnvVars = {
    NODE_ENV: 'development',
    PORT: '5000',
    FRONTEND_URL: 'http://localhost:5173'
  };

  // Set default values for optional variables
  Object.entries(optionalEnvVars).forEach(([key, value]) => {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });

  // Check required variables
  const missingEnvVars = requiredEnvVars
    .filter(envVar => !process.env[envVar] && !optionalEnvVars[envVar]);

  if (missingEnvVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  }

  // Validate specific values
  if (!['development', 'production', 'test'].includes(process.env.NODE_ENV)) {
    throw new Error('NODE_ENV must be either development, production, or test');
  }

  if (process.env.PORT && isNaN(process.env.PORT)) {
    throw new Error('PORT must be a number');
  }
}; 