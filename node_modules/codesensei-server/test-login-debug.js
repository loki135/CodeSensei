import axios from 'axios';

const API_BASE_URL = 'https://codesensei-g9id.onrender.com/api';

// Test configuration
const testConfig = {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
};

// Test data - using the same user from registration test
const testUser = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'testpassword123',
  name: 'Test User'
};

async function testRegistration() {
  console.log('🔍 Testing registration endpoint...');
  try {
    const start = Date.now();
    const response = await axios.post(`${API_BASE_URL}/auth/register`, testUser, testConfig);
    const duration = Date.now() - start;
    
    console.log(`✅ Registration successful (${duration}ms):`, {
      status: response.status,
      hasToken: !!response.data?.data?.token,
      hasUser: !!response.data?.data?.user
    });
    return response.data?.data?.token;
  } catch (error) {
    console.error('❌ Registration failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      isTimeout: error.code === 'ECONNABORTED'
    });
    return null;
  }
}

async function testLogin() {
  console.log('🔍 Testing login endpoint...');
  try {
    const start = Date.now();
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: testUser.username,
      password: testUser.password
    }, testConfig);
    const duration = Date.now() - start;
    
    console.log(`✅ Login successful (${duration}ms):`, {
      status: response.status,
      hasToken: !!response.data?.data?.token,
      hasUser: !!response.data?.data?.user
    });
    return response.data?.data?.token;
  } catch (error) {
    console.error('❌ Login failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      isTimeout: error.code === 'ECONNABORTED',
      fullError: error.response?.data
    });
    return null;
  }
}

async function testLoginWithEmail() {
  console.log('🔍 Testing login with email...');
  try {
    const start = Date.now();
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      username: testUser.email, // Try with email instead of username
      password: testUser.password
    }, testConfig);
    const duration = Date.now() - start;
    
    console.log(`✅ Login with email successful (${duration}ms):`, {
      status: response.status,
      hasToken: !!response.data?.data?.token,
      hasUser: !!response.data?.data?.user
    });
    return response.data?.data?.token;
  } catch (error) {
    console.error('❌ Login with email failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      isTimeout: error.code === 'ECONNABORTED'
    });
    return null;
  }
}

async function testHealthCheck() {
  console.log('🔍 Testing health check endpoint...');
  try {
    const start = Date.now();
    const response = await axios.get(`${API_BASE_URL}/health`, testConfig);
    const duration = Date.now() - start;
    
    console.log(`✅ Health check successful (${duration}ms):`, {
      status: response.status,
      data: response.data
    });
    return true;
  } catch (error) {
    console.error('❌ Health check failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return false;
  }
}

async function runDebugTests() {
  console.log('🚀 Starting login debug tests...');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log(`⏱️  Timeout: ${testConfig.timeout}ms`);
  console.log('---');
  
  // Test health check first
  const healthOk = await testHealthCheck();
  if (!healthOk) {
    console.log('❌ Server appears to be down or unreachable');
    return;
  }
  
  console.log('---');
  
  // Test registration
  const token = await testRegistration();
  
  console.log('---');
  
  // Wait a moment for the registration to be processed
  console.log('⏳ Waiting 2 seconds for registration to be processed...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log('---');
  
  // Test login with username
  const loginToken = await testLogin();
  
  console.log('---');
  
  // Test login with email
  const emailLoginToken = await testLoginWithEmail();
  
  console.log('---');
  console.log('🏁 Debug tests completed');
}

// Run the tests
runDebugTests().catch(console.error); 