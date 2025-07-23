/**
 * Text processing utilities for document chunking and preparation
 */

/**
 * Splits text into chunks with specified size and overlap
 * @param {string} text - The text to be chunked
 * @param {number} chunkSize - Size of each chunk in characters
 * @param {number} chunkOverlap - Overlap between chunks in characters
 * @returns {Array<{text: string, start: number, end: number}>} Array of chunks with positions
 */
export const chunkText = (text, chunkSize = 1000, chunkOverlap = 200) => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Ensure valid chunk size and overlap
  const size = Math.max(1, Math.floor(chunkSize));
  const overlap = Math.max(0, Math.min(Math.floor(chunkOverlap), size - 1));
  
  const chunks = [];
  let start = 0;
  
  while (start < text.length) {
    let end = start + size;
    
    // Ensure we don't go past the end of the text
    end = Math.min(end, text.length);
    
    // Try to end at a sentence boundary if possible
    const chunk = text.slice(start, end);
    const lastPunctuation = Math.max(
      chunk.lastIndexOf('. '),
      chunk.lastIndexOf('! '),
      chunk.lastIndexOf('? '),
      chunk.lastIndexOf('\n\n')
    );
    
    if (lastPunctuation > size / 2 && end < text.length) {
      end = start + lastPunctuation + 1;
    }
    
    chunks.push({
      text: text.slice(start, end).trim(),
      start,
      end: end - 1
    });
    
    // Move the start position, accounting for overlap
    start = end - overlap;
    
    // Prevent infinite loops with very small chunks
    if (start >= text.length - 1) break;
  }
  
  return chunks;
};

/**
 * Cleans and normalizes text for processing
 * @param {string} text - The text to clean
 * @returns {string} Cleaned text
 */
export const cleanText = (text) => {
  if (!text) return '';
  
  return text
    // Replace multiple spaces with single space
    .replace(/\s+/g, ' ')
    // Remove non-printable characters except basic punctuation and newlines
    .replace(/[^\x20-\x7E\n\r\t]/g, '')
    // Normalize line endings
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Trim whitespace
    .trim();
};

/**
 * Extracts text from common document formats
 * @param {Object} file - File object with type and content
 * @returns {Promise<string>} Extracted text
 */
export const extractText = async (file) => {
  try {
    let text = '';
    
    switch (file.type) {
      case 'text/plain':
        text = file.content;
        break;
        
      case 'application/pdf':
        // For React Native, you'll need a library like rn-fetch-blob
        // and a PDF parsing library
        const pdf = await PDFJS.getDocument({ data: file.content }).promise;
        const pages = [];
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          const strings = content.items.map(item => item.str);
          pages.push(strings.join(' '));
        }
        
        text = pages.join('\n\n');
        break;
        
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        // For DOCX files in React Native
        const result = await DocumentPicker.getDocumentAsync({
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          copyToCacheDirectory: true,
        });
        
        if (result.type === 'success') {
          const response = await FileSystem.readAsStringAsync(result.uri, {
            encoding: FileSystem.EncodingType.UTF8,
          });
          
          // Simple text extraction - for better results, use a proper DOCX parser
          text = response.replace(/<[^>]+>/g, ' ');
        }
        break;
        
      default:
        throw new Error(`Unsupported file type: ${file.type}`);
    }
    
    return cleanText(text);
  } catch (error) {
    console.error('Error extracting text:', error);
    throw new Error(`Failed to extract text: ${error.message}`);
  }
};

/**
 * Processes a document file into chunks
 * @param {Object} file - The file to process
 * @param {Object} options - Processing options
 * @returns {Promise<Array>} Processed chunks with metadata
 */
export const processDocument = async (file, options = {}) => {
  const {
    chunkSize = 1000,
    chunkOverlap = 200,
    maxChunks = 1000, // Prevent processing extremely large documents
  } = options;
  
  try {
    // Extract text from the file
    const text = await extractText(file);
    
    // Split into chunks
    let chunks = chunkText(text, chunkSize, chunkOverlap);
    
    // Limit number of chunks
    if (chunks.length > maxChunks) {
      console.warn(`Document truncated to ${maxChunks} chunks`);
      chunks = chunks.slice(0, maxChunks);
    }
    
    // Add metadata to each chunk
    const timestamp = new Date().toISOString();
    return chunks.map((chunk, index) => ({
      id: `${file.name}-${index}-${Date.now()}`,
      text: chunk.text,
      metadata: {
        documentId: file.name,
        documentType: file.type,
        chunkIndex: index,
        totalChunks: chunks.length,
        startPos: chunk.start,
        endPos: chunk.end,
        timestamp,
        ...file.metadata,
      },
      embeddings: null, // Will be populated later
    }));
    
  } catch (error) {
    console.error('Document processing failed:', error);
    throw new Error(`Document processing failed: ${error.message}`);
  }
};

export default {
  chunkText,
  cleanText,
  extractText,
  processDocument,
};
