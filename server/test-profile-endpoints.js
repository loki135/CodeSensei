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

let authToken = null;

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
      data: error.response?.data
    });
    return null;
  }
}

async function testProfileEndpoint(token) {
  console.log('🔍 Testing /auth/profile endpoint...');
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
    
    console.log(`✅ Profile endpoint successful (${duration}ms):`, {
      status: response.status,
      hasUser: !!response.data?.data,
      userData: response.data?.data ? {
        username: response.data.data.username,
        email: response.data.data.email,
        name: response.data.data.name
      } : null
    });
    return true;
  } catch (error) {
    console.error('❌ Profile endpoint failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    return false;
  }
}

async function testProfileStatsEndpoint(token) {
  console.log('🔍 Testing /auth/profile/stats endpoint...');
  try {
    const start = Date.now();
    const response = await axios.get(`${API_BASE_URL}/auth/profile/stats`, {
      ...testConfig,
      headers: {
        ...testConfig.headers,
        'Authorization': `Bearer ${token}`
      }
    });
    const duration = Date.now() - start;
    
    console.log(`✅ Profile stats endpoint successful (${duration}ms):`, {
      status: response.status,
      totalReviews: response.data?.data?.totalReviews,
      hasLastReviewDate: !!response.data?.data?.lastReviewDate,
      reviewsByType: response.data?.data?.reviewsByType,
      reviewsByLanguage: response.data?.data?.reviewsByLanguage
    });
    return true;
  } catch (error) {
    console.error('❌ Profile stats endpoint failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers
    });
    return false;
  }
}

async function testCORSHeaders() {
  console.log('🔍 Testing CORS headers...');
  try {
    const response = await axios.options(`${API_BASE_URL}/auth/profile`, {
      ...testConfig,
      headers: {
        'Origin': 'https://codesensei135.netlify.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Authorization'
      }
    });
    
    console.log('✅ CORS preflight response:', {
      status: response.status,
      headers: {
        'access-control-allow-origin': response.headers['access-control-allow-origin'],
        'access-control-allow-credentials': response.headers['access-control-allow-credentials'],
        'access-control-allow-methods': response.headers['access-control-allow-methods'],
        'access-control-allow-headers': response.headers['access-control-allow-headers']
      }
    });
    return true;
  } catch (error) {
    console.error('❌ CORS preflight failed:', {
      message: error.message,
      status: error.response?.status,
      headers: error.response?.headers
    });
    return false;
  }
}

async function runProfileTests() {
  console.log('🚀 Starting profile endpoint tests...');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log(`⏱️  Timeout: ${testConfig.timeout}ms`);
  console.log('---');
  
  // Test CORS headers first
  await testCORSHeaders();
  
  console.log('---');
  
  // Test registration
  const token = await testRegistration();
  if (!token) {
    console.log('❌ Registration failed, stopping tests');
    return;
  }
  
  authToken = token;
  console.log('---');
  
  // Test profile endpoint
  await testProfileEndpoint(authToken);
  
  console.log('---');
  
  // Test profile stats endpoint
  await testProfileStatsEndpoint(authToken);
  
  console.log('---');
  console.log('🏁 Profile endpoint tests completed');
}

// Run the tests
runProfileTests().catch(console.error); 