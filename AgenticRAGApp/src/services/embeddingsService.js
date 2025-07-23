import api from './api';

/**
 * Service for handling text embeddings and vector operations
 */

/**
 * Generates embeddings for the given text
 * @param {string|Array<string>} text - Text or array of texts to generate embeddings for
 * @param {Object} options - Options for embedding generation
 * @returns {Promise<Array<number>|Array<Array<number>>>} Embedding(s)
 */
export const generateEmbeddings = async (text, options = {}) => {
  try {
    const response = await api.post('/embeddings/generate', {
      text,
      ...options,
    });
    
    return response.data.embeddings;
  } catch (error) {
    console.error('Failed to generate embeddings:', error);
    throw error;
  }
};

/**
 * Searches for similar vectors in the vector database
 * @param {Array<number>} vector - Query vector
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Search results
 */
export const searchVectors = async (vector, options = {}) => {
  try {
    const response = await api.post('/vectors/search', {
      vector,
      ...options,
    });
    
    return response.data.results;
  } catch (error) {
    console.error('Vector search failed:', error);
    throw error;
  }
};

/**
 * Indexes a document's chunks in the vector database
 * @param {string} documentId - ID of the document
 * @param {Array<Object>} chunks - Document chunks with text and metadata
 * @returns {Promise<Object>} Indexing result
 */
export const indexDocumentChunks = async (documentId, chunks) => {
  try {
    // First generate embeddings for all chunks
    const texts = chunks.map(chunk => chunk.text);
    const embeddings = await generateEmbeddings(texts);
    
    // Add embeddings to chunks
    const chunksWithEmbeddings = chunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index],
    }));
    
    // Send to server for indexing
    const response = await api.post('/vectors/index', {
      documentId,
      chunks: chunksWithEmbeddings,
    });
    
    return response.data;
  } catch (error) {
    console.error('Failed to index document chunks:', error);
    throw error;
  }
};

/**
 * Searches for documents using RAG (Retrieval-Augmented Generation)
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Array>} Search results with context
 */
export const searchWithRAG = async (query, options = {}) => {
  try {
    const response = await api.post('/search/rag', {
      query,
      ...options,
    });
    
    return response.data.results;
  } catch (error) {
    console.error('RAG search failed:', error);
    throw error;
  }
};

/**
 * Gets the vector database statistics
 * @returns {Promise<Object>} Database statistics
 */
export const getVectorDBStats = async () => {
  try {
    const response = await api.get('/vectors/stats');
    return response.data.stats;
  } catch (error) {
    console.error('Failed to get vector DB stats:', error);
    throw error;
  }
};

export default {
  generateEmbeddings,
  searchVectors,
  indexDocumentChunks,
  searchWithRAG,
  getVectorDBStats,
};
