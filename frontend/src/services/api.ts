import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://travel-mate-yxib.onrender.com';

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token'); // Or however you store your token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default api;