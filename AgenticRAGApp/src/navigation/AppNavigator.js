import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from '../screens/HomeScreen';
import DocumentUploadScreen from '../screens/DocumentUploadScreen';
import QueryScreen from '../screens/QueryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';

// Context
import { useApp } from '../context/AppContext';

const Stack = createNativeStackNavigator();

// Stack for authenticated users
const AppStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{ 
        title: 'Agentic RAG',
        headerShown: false
      }} 
    />
    <Stack.Screen 
      name="DocumentUpload" 
      component={DocumentUploadScreen} 
      options={{ 
        title: 'Upload Document',
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#2c3e50',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }} 
    />
    <Stack.Screen 
      name="Query" 
      component={QueryScreen} 
      options={{ 
        title: 'Ask a Question',
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#2c3e50',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }} 
    />
    <Stack.Screen 
      name="Settings" 
      component={SettingsScreen} 
      options={{ 
        title: 'Settings',
        headerStyle: {
          backgroundColor: '#fff',
        },
        headerTintColor: '#2c3e50',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }} 
    />
  </Stack.Navigator>
);

// Stack for unauthenticated users
const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen 
      name="SignUp" 
      component={SignUpScreen} 
      options={{
        headerShown: true,
        title: '',
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#2c3e50',
      }}
    />
    <Stack.Screen 
      name="ForgotPassword" 
      component={ForgotPasswordScreen} 
      options={{
        headerShown: true,
        title: '',
        headerStyle: {
          backgroundColor: '#fff',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#2c3e50',
      }}
    />
  </Stack.Navigator>
);

const AppNavigator = () => {
  const { user, isLoading } = useApp();

  // Show a loading screen while checking auth state
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

export default AppNavigator;
