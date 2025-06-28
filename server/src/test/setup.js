const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Set required environment variables for testing
process.env.JWT_SECRET = 'test_jwt_secret_for_testing_only_32_chars_long';
process.env.NODE_ENV = 'test';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Connect to test database
beforeAll(async () => {
  const testDbUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/codesensei_test';
  await mongoose.connect(testDbUri);
});

// Clean up database after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
});

// Disconnect from database after all tests
afterAll(async () => {
  await mongoose.connection.close();
});

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
}; 