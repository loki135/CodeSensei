import axios from 'axios';

const API_BASE_URL = 'https://codesensei-g9id.onrender.com/api';

// Test configuration
const testConfig = {
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
};

// Test data
const testUser = {
  username: `testuser_${Date.now()}`,
  email: `test_${Date.now()}@example.com`,
  password: 'testpassword123',
  name: 'Test User'
};

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
      isTimeout: error.code === 'ECONNABORTED'
    });
    return null;
  }
}

async function testWithToken(token) {
  if (!token) {
    console.log('⚠️  Skipping authenticated tests - no token available');
    return;
  }
  
  console.log('🔍 Testing authenticated endpoint...');
  try {
    const start = Date.now();
    const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
      ...testConfig,
      headers: {
        ...testConfig.headers,
        'Authorization': `Bearer ${token}`
      }
    });
    const duration = Date.now() - start;
    
    console.log(`✅ Profile fetch successful (${duration}ms):`, {
      status: response.status,
      hasUser: !!response.data?.data
    });
  } catch (error) {
    console.error('❌ Profile fetch failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      isTimeout: error.code === 'ECONNABORTED'
    });
  }
}

async function runTests() {
  console.log('🚀 Starting API timeout tests...');
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
  
  // Test login
  const loginToken = await testLogin();
  
  console.log('---');
  
  // Test authenticated endpoint
  await testWithToken(token || loginToken);
  
  console.log('---');
  console.log('🏁 Tests completed');
}

// Run the tests
runTests().catch(console.error); 