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
      data: error.response?.data
    });
    return null;
  }
}

async function testProfileStats(token) {
  console.log('🔍 Testing profile statistics...');
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
    
    console.log(`✅ Profile stats successful (${duration}ms):`, {
      status: response.status,
      totalReviews: response.data?.data?.totalReviews,
      hasLastReviewDate: !!response.data?.data?.lastReviewDate,
      reviewsByType: response.data?.data?.reviewsByType,
      reviewsByLanguage: response.data?.data?.reviewsByLanguage
    });
    return true;
  } catch (error) {
    console.error('❌ Profile stats failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return false;
  }
}

async function testReviewSubmission(token) {
  console.log('🔍 Testing review submission...');
  try {
    const start = Date.now();
    const response = await axios.post(`${API_BASE_URL}/review`, {
      code: 'function hello() { console.log("Hello World"); }',
      type: 'readability',
      language: 'javascript'
    }, {
      ...testConfig,
      headers: {
        ...testConfig.headers,
        'Authorization': `Bearer ${token}`
      }
    });
    const duration = Date.now() - start;
    
    console.log(`✅ Review submission successful (${duration}ms):`, {
      status: response.status,
      hasSuggestions: !!response.data?.data?.suggestions,
      hasReviewId: !!response.data?.data?.reviewId
    });
    return true;
  } catch (error) {
    console.error('❌ Review submission failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return false;
  }
}

async function testProfileStatsAfterReview(token) {
  console.log('🔍 Testing profile statistics after review...');
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
    
    console.log(`✅ Profile stats after review successful (${duration}ms):`, {
      status: response.status,
      totalReviews: response.data?.data?.totalReviews,
      hasLastReviewDate: !!response.data?.data?.lastReviewDate,
      reviewsByType: response.data?.data?.reviewsByType,
      reviewsByLanguage: response.data?.data?.reviewsByLanguage
    });
    return true;
  } catch (error) {
    console.error('❌ Profile stats after review failed:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    return false;
  }
}

async function runComprehensiveTests() {
  console.log('🚀 Starting comprehensive API tests...');
  console.log(`📍 API Base URL: ${API_BASE_URL}`);
  console.log(`⏱️  Timeout: ${testConfig.timeout}ms`);
  console.log('---');
  
  // Test registration
  const token = await testRegistration();
  if (!token) {
    console.log('❌ Registration failed, stopping tests');
    return;
  }
  
  console.log('---');
  
  // Test login
  const loginToken = await testLogin();
  if (!loginToken) {
    console.log('❌ Login failed, stopping tests');
    return;
  }
  
  authToken = loginToken;
  console.log('---');
  
  // Test initial profile stats (should be 0 reviews)
  await testProfileStats(authToken);
  
  console.log('---');
  
  // Test review submission
  const reviewSuccess = await testReviewSubmission(authToken);
  if (!reviewSuccess) {
    console.log('❌ Review submission failed');
    return;
  }
  
  console.log('---');
  
  // Wait a moment for the review to be processed
  console.log('⏳ Waiting 3 seconds for review to be processed...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log('---');
  
  // Test profile stats after review (should show 1 review)
  await testProfileStatsAfterReview(authToken);
  
  console.log('---');
  console.log('🏁 Comprehensive tests completed');
}

// Run the tests
runComprehensiveTests().catch(console.error); 