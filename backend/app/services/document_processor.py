import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Union
import logging
from datetime import datetime

# Document processing libraries
try:
    import PyPDF2
    from docx import Document as DocxDocument
    import docx2txt
    import pandas as pd
except ImportError:
    pass  # Will be checked in the process method

logger = logging.getLogger(__name__)

class DocumentProcessor:
    """Handles processing of different document types for the RAG system"""
    
    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """Initialize the document processor
        
        Args:
            chunk_size: Number of characters per chunk
            chunk_overlap: Number of overlapping characters between chunks
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.supported_formats = {
            '.pdf': self._process_pdf,
            '.docx': self._process_docx,
            '.doc': self._process_docx,
            '.txt': self._process_text,
            '.csv': self._process_csv,
        }
    
    async def process(self, file_path: Union[str, Path], metadata: Optional[Dict] = None) -> List[Dict]:
        """Process a document and return chunks with metadata
        
        Args:
            file_path: Path to the document file
            metadata: Additional metadata to include with each chunk
            
        Returns:
            List of document chunks with metadata
        """
        file_path = Path(file_path)
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
            
        file_extension = file_path.suffix.lower()
        
        if file_extension not in self.supported_formats:
            raise ValueError(f"Unsupported file format: {file_extension}")
        
        # Extract text from the document
        try:
            text = await self.supported_formats[file_extension](file_path)
        except Exception as e:
            logger.error(f"Error processing {file_path}: {str(e)}")
            raise ValueError(f"Failed to process document: {str(e)}")
        
        # Clean and chunk the text
        chunks = self._chunk_text(text)
        
        # Prepare metadata for each chunk
        base_metadata = {
            'source': str(file_path.name),
            'file_type': file_extension[1:],  # Remove the dot
            'processing_date': datetime.utcnow().isoformat(),
            **(metadata or {})
        }
        
        # Add chunk-specific metadata
        result = []
        for i, chunk in enumerate(chunks):
            chunk_metadata = {
                **base_metadata,
                'chunk_id': f"{file_path.stem}_{i}",
                'chunk_index': i,
                'total_chunks': len(chunks)
            }
            result.append({
                'content': chunk,
                'metadata': chunk_metadata
            })
            
        return result
    
    def _chunk_text(self, text: str) -> List[str]:
        """Split text into overlapping chunks"""
        if not text:
            return []
            
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            end = min(start + self.chunk_size, text_length)
            chunks.append(text[start:end])
            
            if end == text_length:
                break
                
            # Move back by overlap amount, but not past the start of the last chunk
            start = end - min(self.chunk_overlap, self.chunk_size // 2)
            
        return chunks
    
    async def _process_pdf(self, file_path: Path) -> str:
        """Extract text from a PDF file"""
        try:
            text = ""
            with open(file_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                for page in reader.pages:
                    text += page.extract_text() or ""
            return text
        except Exception as e:
            logger.error(f"Error extracting text from PDF {file_path}: {str(e)}")
            raise
    
    async def _process_docx(self, file_path: Path) -> str:
        """Extract text from a DOCX file"""
        try:
            return docx2txt.process(file_path)
        except Exception as e:
            logger.error(f"Error extracting text from DOCX {file_path}: {str(e)}")
            # Fallback to python-docx if docx2txt fails
            try:
                doc = DocxDocument(file_path)
                return "\n".join([para.text for para in doc.paragraphs if para.text])
            except Exception as e2:
                logger.error(f"Fallback DOCX extraction also failed: {str(e2)}")
                raise e
    
    async def _process_text(self, file_path: Path) -> str:
        """Read text from a plain text file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                return file.read()
        except Exception as e:
            logger.error(f"Error reading text file {file_path}: {str(e)}")
            raise
    
    async def _process_csv(self, file_path: Path) -> str:
        """Convert CSV to formatted text"""
        try:
            df = pd.read_csv(file_path)
            return df.to_string(index=False)
        except Exception as e:
            logger.error(f"Error processing CSV {file_path}: {str(e)}")
            raise
