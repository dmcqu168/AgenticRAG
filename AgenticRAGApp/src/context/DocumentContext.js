import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import * as documentService from '../services/documentService';
import { useApp } from './AppContext';

const DocumentContext = createContext();

/**
 * Document Provider component
 * Manages document-related state for search and retrieval
 */
export const DocumentProvider = ({ children }) => {
  const { isAuthenticated } = useApp();
  
  // State
  const [documents, setDocuments] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Load document statistics
  const loadStats = useCallback(async () => {
    try {
      const statsData = await documentService.getDocumentStats();
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load document stats:', err);
      setError('Failed to load document statistics');
    }
  }, []);
  
  // Load available documents
  const loadDocuments = useCallback(async (filters = {}) => {
    if (!isAuthenticated) return;
    
    try {
      setIsLoading(true);
      const docs = await documentService.getDocumentList(filters);
      setDocuments(docs);
      return docs;
    } catch (err) {
      console.error('Failed to load documents:', err);
      setError('Failed to load documents');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);
  
  // Search documents
  const searchDocuments = useCallback(async (query, options = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const results = await documentService.searchDocuments(query, options);
      setSearchResults(results);
      return results;
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Get document with context
  const getDocumentWithContext = useCallback(async (documentId, options = {}) => {
    try {
      setIsLoading(true);
      const doc = await documentService.getDocumentContext(documentId, options);
      setCurrentDocument(doc);
      return doc;
    } catch (err) {
      console.error(`Failed to fetch document ${documentId}:`, err);
      setError('Failed to load document');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Clear search results
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);
  
  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, [loadStats]);
  
  return (
    <DocumentContext.Provider
      value={{
        // State
        documents,
        searchResults,
        currentDocument,
        isLoading,
        error,
        stats,
        
        // Actions
        loadDocuments,
        searchDocuments,
        getDocument: getDocumentWithContext,
        clearSearchResults,
        clearError,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
};

/**
 * Hook to use the document context
 * @returns {Object} Document context
 */
export const useDocuments = () => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};

export default DocumentContext;
