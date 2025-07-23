import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';
import { useApp } from '../context/AppContext';

const DocumentUploadScreen = () => {
  const { uploadDocument, isLoading } = useApp();
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigation = useNavigation();

  const handleUploadProgress = useCallback((progressEvent) => {
    const progress = Math.round(
      (progressEvent.loaded / progressEvent.total) * 100
    );
    setUploadProgress(progress);
  }, []);

  const pickDocument = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (result.type === 'success') {
        await uploadDocument(
          {
            uri: result.uri,
            name: result.name,
            type: result.mimeType || 'application/octet-stream',
          },
          handleUploadProgress
        );
        
        Alert.alert('Success', 'Document uploaded successfully!');
        navigation.goBack();
      }
    } catch (err) {
      console.log('Error picking document:', err);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  }, [uploadDocument, handleUploadProgress, navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.uploadContainer}>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={pickDocument}
          disabled={isUploading}
        >
          <Icon name="cloud-upload" size={50} color="#3498db" />
          <Text style={styles.uploadButtonText}>
            {isLoading ? 'Uploading...' : 'Select Document'}
          </Text>
          <Text style={styles.uploadSubtext}>
            {isLoading ? `${uploadProgress}%` : 'PDF, DOCX, TXT files are supported'}
          </Text>
        </TouchableOpacity>

        {isLoading && (
          <View style={styles.progressContainer}>
            <View 
              style={[
                styles.progressBar, 
                { width: `${uploadProgress}%` }
              ]} 
            />
          </View>
        )}
      </View>

      <View style={styles.recentContainer}>
        <Text style={styles.sectionTitle}>Recent Uploads</Text>
        <View style={styles.emptyState}>
          <Icon name="folder-open" size={50} color="#bdc3c7" />
          <Text style={styles.emptyStateText}>No recent uploads</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  uploadContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  uploadButton: {
    alignItems: 'center',
    padding: 20,
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 10,
  },
  uploadSubtext: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 5,
  },
  progressContainer: {
    height: 5,
    width: '100%',
    backgroundColor: '#ecf0f1',
    borderRadius: 5,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3498db',
  },
  recentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  emptyStateText: {
    marginTop: 10,
    color: '#95a5a6',
  },
});

export default DocumentUploadScreen;
