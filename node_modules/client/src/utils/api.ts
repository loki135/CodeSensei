import axios, { AxiosError } from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
  name?: string;
  role: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface ReviewResponse {
  suggestions: string;
  reviewId: string;
}

interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  details?: string;
}

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');

// Log the API base URL for debugging
console.log('API Base URL:', API_BASE_URL);
console.log('Current origin:', window.location.origin);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    // Add timeout based on endpoint - reduced timeouts for better UX
    if (config.url?.includes('/auth/login') || config.url?.includes('/auth/register')) {
      config.timeout = 20000; // Reduced to 20 seconds for auth endpoints
    } else if (config.url?.includes('/review')) {
      config.timeout = 60000; // 60 seconds for review endpoints
    } else {
      config.timeout = 15000; // 15 seconds for other endpoints
    }

    // Remove manual CORS headers - let the browser handle them
    delete config.headers['Access-Control-Allow-Origin'];
    delete config.headers['Access-Control-Allow-Credentials'];

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log the request for debugging
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      timeout: config.timeout,
      origin: window.location.origin
    });
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log('API Response:', {
      status: response.status,
      data: response.data,
      headers: response.headers,
      time: response.headers['x-response-time']
    });
    // Return the full response object instead of just the data
    return response;
  },
  (error: AxiosError<ApiResponse>) => {
    // Enhanced error logging
    console.error('API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        timeout: error.config?.timeout,
        headers: error.config?.headers
      }
    });

    // Handle CORS errors specifically
    if (error.message === 'Network Error' && !error.response) {
      return Promise.reject({
        message: 'CORS error: Unable to connect to the server. Please check if the server is running and accessible.',
        status: 0,
        isCorsError: true
      });
    }

    if (error.code === 'ECONNABORTED') {
      const endpoint = error.config?.url || '';
      let message = 'Request timed out. Please try again.';
      
      if (endpoint.includes('/auth/login') || endpoint.includes('/auth/register')) {
        message = 'Authentication request timed out. The server may be experiencing high load. Please try again in a few moments.';
      } else if (endpoint.includes('/review')) {
        message = 'Review request is taking longer than expected. Please try again.';
      }
      
      return Promise.reject({
        message,
        status: 408,
        isTimeout: true
      });
    }

    if (!error.response) {
      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        status: 0
      });
    }

    if (error.response.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Return a more user-friendly error
    return Promise.reject({
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

// Auth API calls
export const authAPI = {
  register: async (data: { username: string; email: string; password: string; name?: string }) => {
    return api.post<never, ApiResponse<AuthResponse>>('/auth/register', data);
  },
  login: async (data: { username: string; password: string }) => {
    return api.post<never, ApiResponse<AuthResponse>>('/auth/login', data);
  },
  checkAccount: async (data: { username?: string; email?: string }) => {
    return api.post<never, ApiResponse<{
      exists: boolean;
      isDeleted: boolean;
      deletedAt?: Date;
      createdAt: Date;
      username: string;
      email: string;
      name?: string;
      role: string;
    }>>('/auth/check-account', data);
  }
};

// Review API calls
export const reviewAPI = {
  submitCode: async (data: { code: string; type: string; language: string }) => {
    console.log('Submitting code review:', {
      type: data.type,
      language: data.language,
      codeLength: data.code.length
    });
    try {
      const response = await api.post<never, ApiResponse<ReviewResponse>>('/review', data);
      console.log('Review API response:', response);
      if (response.status === 'success' && response.data) {
        return response.data;
      }
      throw new Error(response.message || 'Failed to get review');
    } catch (error) {
      console.error('Review API error:', error);
      throw error;
    }
  },
};

export default api; 