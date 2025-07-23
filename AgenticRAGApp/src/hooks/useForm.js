import { useState, useCallback } from 'react';

const useForm = (initialState, validate) => {
  const [values, setValues] = useState(initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input change
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  }, [errors]);

  // Handle input blur
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));

    // Validate on blur if validation function is provided
    if (validate) {
      const validationErrors = validate(values);
      setErrors(prev => ({
        ...prev,
        [name]: validationErrors[name] || ''
      }));
    }
  }, [validate, values]);

  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true);
    
    // Validate all fields
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      
      // Check if there are any errors
      const hasErrors = Object.values(validationErrors).some(error => error);
      
      if (hasErrors) {
        setIsSubmitting(false);
        return { success: false, errors: validationErrors };
      }
    }
    
    try {
      const result = await onSubmit(values);
      return { success: true, data: result };
    } catch (error) {
      // Handle API errors
      let formErrors = {};
      
      if (error.response?.data?.errors) {
        // Handle validation errors from the server
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          formErrors[field] = Array.isArray(messages) ? messages[0] : messages;
        });
        setErrors(formErrors);
      } else if (error.response?.data?.message) {
        // Handle general API errors
        formErrors._form = error.response.data.message;
      } else {
        formErrors._form = error.message || 'An error occurred. Please try again.';
      }
      
      setErrors(prev => ({ ...prev, ...formErrors }));
      return { success: false, errors: formErrors };
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, values]);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialState);
    setErrors({});
    setTouched({});
  }, [initialState]);

  // Set field value manually
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Set field error manually
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  // Set field touched manually
  const setFieldTouched = useCallback((name, isTouched = true) => {
    setTouched(prev => ({
      ...prev,
      [name]: isTouched
    }));
  }, []);

  // Get field props for TextInput components
  const getFieldProps = useCallback((name) => ({
    value: values[name] || '',
    onChangeText: (text) => handleChange(name, text),
    onBlur: () => handleBlur(name),
    error: errors[name],
    touched: !!touched[name],
  }), [values, errors, touched, handleChange, handleBlur]);

  return {
    // Form state
    values,
    errors,
    touched,
    isSubmitting,
    
    // Form actions
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    
    // Field manipulation
    setFieldValue,
    setFieldError,
    setFieldTouched,
    
    // Helpers
    getFieldProps,
    
    // State setters
    setValues,
    setErrors,
    setTouched,
  };
};

export default useForm;
