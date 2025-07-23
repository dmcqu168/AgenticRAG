import api from './api';

/**
 * Document service for interacting with the backend document API
 */

/**
 * Searches documents using natural language query
 * @param {string} query - The search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Search results
 */
export const searchDocuments = async (query, options = {}) => {
  const response = await api.post('/search', {
    query,
    ...options,
  });
  return response.data;
};

/**
 * Gets a list of available documents
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>} List of document metadata
 */
export const getDocumentList = async (filters = {}) => {
  const response = await api.get('/documents', { params: filters });
  return response.data;
};

/**
 * Gets details for a specific document
 * @param {string} documentId - Document ID
 * @returns {Promise<Object>} Document details
 */
export const getDocument = async (documentId) => {
  const response = await api.get(`/documents/${documentId}`);
  return response.data;
};

/**
 * Gets document chunks with context
 * @param {string} documentId - Document ID
 * @param {Object} options - Options for retrieval
 * @returns {Promise<Array>} Document chunks with context
 */
export const getDocumentContext = async (documentId, options = {}) => {
  const response = await api.get(`/documents/${documentId}/context`, {
    params: options,
  });
  return response.data;
};

/**
 * Gets document statistics
 * @returns {Promise<Object>} Document statistics
 */
export const getDocumentStats = async () => {
  const response = await api.get('/documents/stats');
  return response.data;
};

export default {
  searchDocuments,
  getDocumentList,
  getDocument,
  getDocumentContext,
  getDocumentStats,
};
