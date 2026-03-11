// client/src/api/axiosConfig.js
import axios from 'axios';

// This check ensures we don't use an empty string by mistake
const getBaseURL = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim() !== "") {
    return envUrl;
  }
  return 'http://localhost:5000';
};

const api = axios.create({
  baseURL: getBaseURL(), 
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

export default api;