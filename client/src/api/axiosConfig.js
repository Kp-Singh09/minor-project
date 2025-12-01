// client/src/api/axiosConfig.js
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create a configured instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Uses your .env variable
});

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 1. Get the error message
    const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
    
    // 2. Display it using React Hot Toast
    toast.error(errorMessage);

    return Promise.reject(error);
  }
);

export default api;