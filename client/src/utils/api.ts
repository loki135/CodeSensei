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

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError<ApiResponse>) => {
    if (error.response?.status === 401) {
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