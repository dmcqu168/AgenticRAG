import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

const useApiError = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleError = useCallback((error) => {
    console.error('API Error:', error);
    
    // Default error message
    let errorMessage = 'An unexpected error occurred. Please try again.';
    
    // Handle different types of errors
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const { status, data } = error.response;
      
      if (status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        // You might want to trigger logout here
      } else if (status === 403) {
        errorMessage = 'You do not have permission to perform this action.';
      } else if (status === 404) {
        errorMessage = 'The requested resource was not found.';
      } else if (status >= 500) {
        errorMessage = 'A server error occurred. Please try again later.';
      } else if (data?.message) {
        // Use server-provided error message if available
        errorMessage = data.message;
      }
    } else if (error.request) {
      // The request was made but no response was received
      errorMessage = 'Unable to connect to the server. Please check your internet connection.';
    } else if (error.message) {
      // Something happened in setting up the request
      errorMessage = error.message;
    }
    
    setError(errorMessage);
    return errorMessage;
  }, []);

  const showErrorAlert = useCallback((error) => {
    const message = typeof error === 'string' ? error : handleError(error);
    Alert.alert('Error', message, [
      { text: 'OK', style: 'default' },
    ]);
  }, [handleError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const withErrorHandling = useCallback(async (apiCall, showAlert = true) => {
    setIsLoading(true);
    clearError();
    
    try {
      const result = await apiCall();
      return result;
    } catch (error) {
      const errorMessage = handleError(error);
      if (showAlert) {
        Alert.alert('Error', errorMessage);
      }
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  return {
    error,
    isLoading,
    setError,
    clearError,
    handleError,
    showErrorAlert,
    withErrorHandling,
  };
};

export default useApiError;
