import React, { useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useApp } from '../context/AppContext';

const QueryScreen = () => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [relatedDocuments, setRelatedDocuments] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigation = useNavigation();
  const { searchDocuments, isLoading, error } = useApp();

  const handleSubmit = useCallback(async () => {
    if (!query.trim()) {
      Alert.alert('Error', 'Please enter a question');
      return;
    }

    try {
      const result = await searchDocuments(query);
      setResponse(result.answer || 'No answer found.');
      setRelatedDocuments(result.documents || []);
    } catch (err) {
      console.error('Error querying:', err);
      Alert.alert('Error', 'Failed to get response. Please try again.');
    }
  }, [query, searchDocuments]);

  const onRefresh = useCallback(async () => {
    if (query.trim()) {
      setIsRefreshing(true);
      await handleSubmit();
      setIsRefreshing(false);
    }
  }, [handleSubmit, query]);

  // Display error alerts if any
  useEffect(() => {
    if (error) {
      Alert.alert('Error', error);
    }
  }, [error]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={['#3498db']}
            tintColor="#3498db"
          />
        }
      >
        {!response ? (
          <View style={styles.placeholderContainer}>
            <Icon name="help-outline" size={60} color="#bdc3c7" />
            <Text style={styles.placeholderText}>
              {isLoading ? 'Searching for answers...' : 'Ask a question about your documents'}
            </Text>
          </View>
        ) : (
          <View style={styles.responseContainer}>
            <Text style={styles.responseText}>{response}</Text>
            
            {relatedDocuments.length > 0 && (
              <View style={styles.documentsContainer}>
                <Text style={styles.sectionTitle}>Source Documents</Text>
                {relatedDocuments.map((doc, index) => (
                  <View key={index} style={styles.documentCard}>
                    <Text style={styles.documentTitle} numberOfLines={1}>
                      {doc.metadata?.title || `Document ${index + 1}`}
                    </Text>
                    <Text style={styles.documentContent} numberOfLines={3}>
                      {doc.content}
                    </Text>
                    {doc.score && (
                      <Text style={styles.documentScore}>
                        Relevance: {Math.round(doc.score * 100)}%
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Ask a question about your documents..."
          value={query}
          onChangeText={setQuery}
          multiline
          editable={!isLoading}
        />
        <TouchableOpacity 
          style={[
            styles.sendButton, 
            (isLoading || !query.trim()) && styles.sendButtonDisabled
          ]}
          onPress={handleSubmit}
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Icon name="send" size={24} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 100,
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    opacity: 0.5,
  },
  placeholderText: {
    fontSize: 16,
    color: '#95a5a6',
    marginTop: 15,
    textAlign: 'center',
  },
  responseContainer: {
    paddingBottom: 20,
  },
  responseText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2c3e50',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 20,
    marginBottom: 10,
  },
  documentsContainer: {
    marginTop: 10,
  },
  documentCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3498db',
    marginBottom: 5,
  },
  documentContent: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  documentScore: {
    fontSize: 12,
    color: '#95a5a6',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 120,
    marginRight: 10,
  },
  sendButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#bdc3c7',
  },
});

export default QueryScreen;
