// client/src/api/axiosConfig.js
import axios from 'axios';

const api = axios.create({
  // Use the env variable or fallback to local port 5000
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;