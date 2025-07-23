import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Switch, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  Linking
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ActivityIndicator, Switch, TouchableOpacity } from 'react-native';
import { useApp } from '../context/AppContext';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const navigation = useNavigation();
  const { user, logout, isLoading } = useApp();

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      Alert.alert('Success', 'You have been successfully logged out.');
      // Reset navigation to prevent going back to authenticated screens
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  }, [logout, navigation]);

  const handleClearCache = useCallback(async () => {
    try {
      // Clear specific cached data, preserving auth tokens
      const keys = await AsyncStorage.getAllKeys();
      const filteredKeys = keys.filter(key => !['user', 'auth_token'].includes(key));
      
      if (filteredKeys.length > 0) {
        await AsyncStorage.multiRemove(filteredKeys);
      }
      
      Alert.alert('Success', 'Cache cleared successfully');
    } catch (error) {
      console.error('Clear cache error:', error);
      Alert.alert('Error', 'Failed to clear cache');
    }
  }, []);

  const openPrivacyPolicy = () => {
    // Replace with your privacy policy URL
    Linking.openURL('https://example.com/privacy');
  };

  const openTermsOfService = () => {
    // Replace with your terms of service URL
    Linking.openURL('https://example.com/terms');
  };

  const renderSettingItem = (icon, title, onPress, rightComponent) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={styles.iconContainer}>
          <Icon name={icon} size={24} color="#3498db" />
        </View>
        <Text style={styles.settingTitle}>{title}</Text>
      </View>
      {rightComponent || <Icon name="chevron-right" size={24} color="#95a5a6" />}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {user && (
        <View style={styles.userInfoContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{user.name || 'User'}</Text>
            <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.sectionContent}>
          {user ? (
            <>
              {renderSettingItem('person', 'Edit Profile', () => navigation.navigate('EditProfile'))}
              {renderSettingItem('lock', 'Change Password', () => navigation.navigate('ChangePassword'))}
              {renderSettingItem('notifications', 'Notifications', null, (
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#bdc3c7', true: '#3498db' }}
                  thumbColor="#fff"
                  disabled={isLoading}
                />
              ))}
            </>
          ) : (
            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
              disabled={isLoading}
            >
              <Text style={styles.loginButtonText}>Sign In</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.sectionContent}>
          {renderSettingItem('brightness-4', 'Dark Mode', null, (
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: '#bdc3c7', true: '#3498db' }}
              thumbColor="#fff"
            />
          ))}
          {renderSettingItem('text-fields', 'Font Size', () => navigation.navigate('FontSize'))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.sectionContent}>
          {renderSettingItem('help', 'Help & Support', () => navigation.navigate('Help'))}
          {renderSettingItem('info', 'About', () => navigation.navigate('About'))}
          {renderSettingItem('privacy-tip', 'Privacy Policy', openPrivacyPolicy)}
          {renderSettingItem('description', 'Terms of Service', openTermsOfService)}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data</Text>
        <View style={styles.sectionContent}>
          {renderSettingItem('storage', 'Clear Cache', handleClearCache)}
          {renderSettingItem('cloud-download', 'Export Data', () => navigation.navigate('ExportData'))}
        </View>
      </View>

      {user && (
        <TouchableOpacity 
          style={[styles.logoutButton, isLoading && styles.logoutButtonDisabled]} 
          onPress={handleLogout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.logoutButtonText}>Log Out</Text>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.versionContainer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  userInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 3,
  },
  userEmail: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  loginButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    margin: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    padding: 15,
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: '#ecf0f1',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 30,
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    color: '#2c3e50',
    marginLeft: 15,
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonDisabled: {
    backgroundColor: '#f5b7b1',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  versionContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#95a5a6',
  },
});

export default SettingsScreen;
