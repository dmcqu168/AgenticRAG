import axios from 'axios';
import apiConfig from '../config/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: apiConfig.API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for API calls
api.interceptors.request.use(
  async (config) => {
    // You can add auth token here if needed
    // const token = await AsyncStorage.getItem('userToken');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle 401 Unauthorized errors (token expired, etc.)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Handle token refresh logic here if needed
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const uploadDocument = async (file, onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', file.name || 'Untitled Document');
  formData.append('source', 'mobile-app');

  return api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress,
  });
};

export const queryDocuments = async (query) => {
  return api.post('/query', { query });
};

export const getDocuments = async () => {
  return api.get('/documents');
};

export default {
  uploadDocument,
  queryDocuments,
  getDocuments,
};
