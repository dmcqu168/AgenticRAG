import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';

export const AppContext = createContext({});

// Custom hook to use the app context
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [documents, setDocuments] = useState([]);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start with true to show loading state
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  // Load user from storage on app start
  const loadUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem('user'),
        AsyncStorage.getItem('token'),
      ]);
      
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        // Set auth header for all requests
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
    } catch (error) {
      console.error('Failed to load user from storage', error);
      setError('Failed to load user session');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the login API
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password,
      });

      const { user: userData, token: authToken } = response.data;
      
      // Save user data and token to storage
      await Promise.all([
        AsyncStorage.setItem('user', JSON.stringify(userData)),
        AsyncStorage.setItem('token', authToken),
      ]);
      
      // Update state
      setUser(userData);
      setToken(authToken);
      
      // Set auth header for all requests
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the register API
      const response = await api.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
      });

      const { user: newUser, token: authToken } = response.data;
      
      // Save user data and token to storage
      await Promise.all([
        AsyncStorage.setItem('user', JSON.stringify(newUser)),
        AsyncStorage.setItem('token', authToken),
      ]);
      
      // Update state
      setUser(newUser);
      setToken(authToken);
      
      // Set auth header for all requests
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
      
      return newUser;
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Call the logout API if needed
      try {
        await api.post('/auth/logout');
      } catch (apiError) {
        console.error('Logout API error (non-critical):', apiError);
      }
      
      // Clear storage
      await AsyncStorage.multiRemove(['user', 'token']);
      
      // Reset state
      setUser(null);
      setToken(null);
      setDocuments([]);
      setError(null);
      
      // Clear auth header
      delete api.defaults.headers.common['Authorization'];
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      setError('Failed to log out. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (document) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', {
        uri: document.uri,
        name: document.name || 'document.pdf',
        type: document.type || 'application/octet-stream',
      });
      
      // Upload document to the API
      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload Progress: ${progress}%`);
          // You can update UI with progress if needed
        },
      });
      
      // Update documents list
      setDocuments(prev => [response.data, ...prev]);
      
      return response.data;
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to upload document. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const queryDocuments = useCallback(async (query) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Query the API
      const response = await api.post('/query', { query });
      
      return response.data;
    } catch (error) {
      console.error('Query error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to process your query. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch documents from the API
      const response = await api.get('/documents');
      
      setDocuments(response.data);
      return response.data;
    } catch (error) {
      console.error('Fetch documents error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load documents. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteDocument = useCallback(async (documentId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Delete document from the API
      await api.delete(`/documents/${documentId}`);
      
      // Update documents list
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      
      return true;
    } catch (error) {
      console.error('Delete document error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete document. Please try again.';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AppContext.Provider 
      value={{
        // State
        documents,
        user,
        isLoading,
        error,
        token,
        isAuthenticated: !!user,
        
        // Actions
        login,
        register,
        logout,
        uploadDocument,
        queryDocuments,
        fetchDocuments,
        deleteDocument,
        resetError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export default AppContext;
