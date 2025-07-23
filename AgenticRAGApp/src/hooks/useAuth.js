import { useState, useEffect, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useApp } from '../context/AppContext';
import useApiError from './useApiError';

const useAuth = () => {
  const navigation = useNavigation();
  const { login: contextLogin, logout: contextLogout, user, isAuthenticated } = useApp();
  const { handleError, showErrorAlert } = useApiError();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Clear any authentication errors
  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  // Handle user login
  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      clearAuthError();
      
      await contextLogin(credentials);
      
      // Navigate to home after successful login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
      
      return true;
    } catch (error) {
      const errorMessage = handleError(error);
      setAuthError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [contextLogin, navigation, handleError, clearAuthError]);

  // Handle user registration
  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      clearAuthError();
      
      // In a real app, you would call your registration API here
      // For now, we'll simulate a successful registration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Automatically log in after registration
      await login({
        email: userData.email,
        password: userData.password,
      });
      
      return true;
    } catch (error) {
      const errorMessage = handleError(error);
      setAuthError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [login, handleError, clearAuthError]);

  // Handle user logout
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      
      await contextLogout();
      
      // Navigate to login screen after logout
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      
      return true;
    } catch (error) {
      showErrorAlert('Failed to log out. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [contextLogout, navigation, showErrorAlert]);

  // Check if user is authenticated
  const checkAuth = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      return !!token;
    } catch (error) {
      console.error('Failed to check authentication status', error);
      return false;
    }
  }, []);

  // Redirect to login if not authenticated
  const requireAuth = useCallback((redirectTo = 'Login') => {
    if (!isAuthenticated) {
      navigation.navigate(redirectTo, {
        screen: 'Login',
        params: { redirect: redirectTo },
      });
      return false;
    }
    return true;
  }, [isAuthenticated, navigation]);

  // Redirect to home if already authenticated
  const redirectIfAuthenticated = useCallback((redirectTo = 'Home') => {
    if (isAuthenticated) {
      navigation.navigate(redirectTo);
      return true;
    }
    return false;
  }, [isAuthenticated, navigation]);

  return {
    // State
    user,
    isLoading,
    error: authError,
    isAuthenticated,
    
    // Actions
    login,
    logout,
    register,
    checkAuth,
    requireAuth,
    redirectIfAuthenticated,
    clearError: clearAuthError,
  };
};

export default useAuth;
