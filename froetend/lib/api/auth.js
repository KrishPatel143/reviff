import Cookies from "js-cookie";
import apiClient from "../apiClient";

export const loginUser = async (email, password) => {
    try {
      const response = await apiClient.post('/login', {
        email,
        password
      });

      if (response.data.token) {
        Cookies.set('token', response.data.token, { 
          expires: 1, 
          sameSite: 'strict' // Helps prevent CSRF attacks
        });
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error', error);
      throw error;
    }
  };
export const registerUser = async (data) => {
    try {
      const response = await apiClient.post('/register', 
        data
        );
      return response.data;
    } catch (error) {
      console.error('register error', error);
      throw error;
    }
  };
  
  // Get User Profile API call
  export const checkUser = async () => {
    try {
      const response = await apiClient.get('/verify-token');
        console.log( response.data);
      return response.data;
    } catch (error) {
      console.error('Get profile error', error);
      throw error;
    }
  };

  // Mock API function - Replace with your actual API call
  export const updateSellerProfile = async (sellerData) => {
  // This would be your actual API call
    try {
      const response = await apiClient.put('/profile', 
        sellerData
        );
      return response.data;
    } catch (error) {
      console.error('register error', error);
      throw error;
    }
  };
// GET /profile
export const getSellerProfile = async () => {
  try {
    const response = await apiClient.get('/profile');
    return response.data;
  } catch (error) {
    console.error('Get seller profile error', error);
    throw error;
  }
};
  