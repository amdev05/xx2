import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

// Request interceptor - attach JWT token
apiClient.interceptors.request.use(
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

// Response interceptor - handle responses and errors
apiClient.interceptors.response.use(
  (response) => {
    // Backend returns data in format: { success, message, data, statusCode }
    // We'll return the whole response but can access response.data.data for actual data
    return response.data;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const { status } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Only redirect if not already on login page
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      // Return error response from backend
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // Request made but no response
      return Promise.reject({
        success: false,
        message: 'No response from server. Please check your connection.',
      });
    } else {
      // Something else happened
      return Promise.reject({
        success: false,
        message: error.message || 'An error occurred',
      });
    }
  }
);

export default apiClient;
