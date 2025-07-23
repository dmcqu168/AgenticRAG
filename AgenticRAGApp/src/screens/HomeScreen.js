import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useApp } from '../context/AppContext';

const HomeScreen = () => {
  const navigation = useNavigation();
  const { documents, fetchDocuments, isLoading } = useApp();
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      await fetchDocuments();
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  const menuItems = [
    { 
      title: 'Upload Document', 
      icon: 'cloud-upload',
      screen: 'DocumentUpload',
      color: '#3498db'
    },
    { 
      title: 'Ask a Question', 
      icon: 'question-answer',
      screen: 'Query',
      color: '#2ecc71'
    },
    { 
      title: 'Settings', 
      icon: 'settings',
      screen: 'Settings',
      color: '#9b59b6'
    },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#3498db']}
          tintColor="#3498db"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Agentic RAG</Text>
        <Text style={styles.headerSubtitle}>Retrieval-Augmented Generation System</Text>
      </View>
      
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity 
            key={index}
            style={[styles.menuItem, { borderLeftColor: item.color }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={[styles.menuIcon, { backgroundColor: `${item.color}20` }]}>
              <Icon name={item.icon} size={24} color={item.color} />
            </View>
            <Text style={styles.menuText}>{item.title}</Text>
            <Icon name="chevron-right" size={24} color="#95a5a6" />
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Quick Stats</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{documents?.length || 0}</Text>
            <Text style={styles.statLabel}>Documents</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Queries</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {documents?.reduce((total, doc) => total + (doc.size || 0), 0).toFixed(1)} MB
            </Text>
            <Text style={styles.statLabel}>Storage</Text>
          </View>
        </View>
      </View>

      {documents?.length > 0 && (
        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Recent Documents</Text>
          {documents.slice(0, 3).map((doc, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.documentItem}
              onPress={() => navigation.navigate('DocumentDetail', { documentId: doc.id })}
            >
              <View style={styles.documentIcon}>
                <Icon name="description" size={24} color="#3498db" />
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle} numberOfLines={1}>
                  {doc.title || 'Untitled Document'}
                </Text>
                <Text style={styles.documentDate}>
                  {new Date(doc.created_at).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
          {documents.length > 3 && (
            <TouchableOpacity 
              style={styles.viewAllButton}
              onPress={() => navigation.navigate('DocumentList')}
            >
              <Text style={styles.viewAllText}>View All Documents</Text>
              <Icon name="chevron-right" size={20} color="#3498db" />
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
  menuContainer: {
    margin: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 4,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: '#2c3e50',
  },
  statsContainer: {
    margin: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
  },
  documentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 4,
  },
  documentDate: {
    fontSize: 12,
    color: '#95a5a6',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  viewAllText: {
    color: '#3498db',
    fontWeight: '500',
    marginRight: 5,
  },
  recentContainer: {
    margin: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 15,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3498db',
  },
  statLabel: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 5,
  },
});

export default HomeScreen;
