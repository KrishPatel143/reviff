import axios from 'axios';
import Cookies from 'js-cookie';

// Base URL for your API
export  const API_URL = 'http://localhost:4000';
 
// Create an axios instance with default configuration
const apiClient = axios.create({
  baseURL: API_URL,
});

// Add a request interceptor to set the auth token
apiClient.interceptors.request.use(
    (config) => {
      const token = Cookies.get('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
);

// Add a response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token is invalid or expired
      logoutUser();
      // Optionally redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Login API call 
