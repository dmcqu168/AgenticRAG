import os
import uuid
from typing import List, Dict, Any, Optional, Union
from pathlib import Path
import chromadb
from chromadb.utils import embedding_functions
from config import settings
import logging
from .document_processor import DocumentProcessor

logger = logging.getLogger(__name__)

class RAGService:
    """Service for handling RAG (Retrieval-Augmented Generation) operations"""
    
    def __init__(self):
        # Initialize ChromaDB client
        self.client = chromadb.PersistentClient(path=settings.CHROMA_DB_PATH)
        
        # Create or get collection
        self.collection = self.client.get_or_create_collection(
            name="fire_safety_documents",
            embedding_function=embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name="all-MiniLM-L6-v2"
            ),
            metadata={"hnsw:space": "cosine"}  # Better for semantic search
        )
        
        # Initialize document processor
        self.document_processor = DocumentProcessor(
            chunk_size=1000,
            chunk_overlap=200
        )
        
        logger.info(f"Initialized RAG service with collection: {self.collection.name}")
    
    async def add_document(self, file_path: Union[str, Path], metadata: Optional[Dict] = None) -> List[Dict]:
        """Process and add a document to the vector store
        
        Args:
            file_path: Path to the document file
            metadata: Additional metadata to include with the document
            
        Returns:
            List of document chunks with their IDs and metadata
        """
        if not metadata:
            metadata = {}
            
        # Process the document into chunks
        chunks = await self.document_processor.process(file_path, metadata)
        
        if not chunks:
            logger.warning(f"No content extracted from {file_path}")
            return []
        
        # Prepare data for ChromaDB
        documents = []
        metadatas = []
        ids = []
        
        for chunk in chunks:
            chunk_id = str(uuid.uuid4())
            documents.append(chunk['content'])
            metadatas.append(chunk['metadata'])
            ids.append(chunk_id)
        
        # Add to ChromaDB in batches to handle large documents
        batch_size = 100
        for i in range(0, len(ids), batch_size):
            batch_ids = ids[i:i + batch_size]
            batch_docs = documents[i:i + batch_size]
            batch_metadatas = metadatas[i:i + batch_size]
            
            self.collection.add(
                documents=batch_docs,
                metadatas=batch_metadatas,
                ids=batch_ids
            )
        
        logger.info(f"Added {len(ids)} chunks from {file_path} to the vector store")
        return [{"id": id_, "metadata": meta} for id_, meta in zip(ids, metadatas)]
    
    async def query(
        self, 
        query: str, 
        n_results: int = 5,
        filter_metadata: Optional[Dict] = None,
        include: List[str] = ["documents", "metadatas", "distances"]
    ) -> List[Dict[str, Any]]:
        """Query the vector store for relevant documents
        
        Args:
            query: The search query
            n_results: Number of results to return
            filter_metadata: Optional metadata filters
            include: What to include in results (documents, metadatas, distances, etc.)
            
        Returns:
            List of document chunks with metadata and scores
        """
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                where=filter_metadata,
                include=include
            )
            
            # Format results
            documents = []
            for i in range(len(results['ids'][0])):
                doc = {
                    'id': results['ids'][0][i],
                    'content': results['documents'][0][i],
                    'metadata': results['metadatas'][0][i],
                }
                
                # Add score if available
                if 'distances' in results and results['distances']:
                    doc['score'] = results['distances'][0][i]
                
                documents.append(doc)
            
            logger.debug(f"Found {len(documents)} results for query: {query[:50]}...")
            return documents
            
        except Exception as e:
            logger.error(f"Error querying vector store: {str(e)}")
            raise
    
    async def generate_response(self, query: str, context: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate a response using the query and retrieved context
        
        Args:
            query: The user's query
            context: List of relevant document chunks
            
        Returns:
            Dictionary containing the response and source documents
        """
        try:
            # Format the context for the LLM
            context_text = "\n\n".join(
                f"Document {i+1} (Relevance: {doc.get('score', 0):.2f}):\n"
                f"Source: {doc['metadata'].get('source', 'Unknown')}\n"
                f"Content: {doc['content']}"
                for i, doc in enumerate(context)
            )
            
            # TODO: Integrate with actual LLM
            # For now, return a structured response with context
            return {
                "answer": f"I found {len(context)} relevant documents regarding your question about '{query}'.",
                "sources": [doc['metadata'] for doc in context],
                "context": context_text
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return {
                "answer": "I'm sorry, I encountered an error processing your request.",
                "sources": [],
                "error": str(e)
            }
    
    async def delete_document(self, document_id: str) -> bool:
        """Delete a document and all its chunks from the vector store
        
        Args:
            document_id: The ID of the document to delete
            
        Returns:
            True if deletion was successful, False otherwise
        """
        try:
            # Get all chunks for this document
            results = self.collection.get(
                where={"document_id": document_id},
                include=[]
            )
            
            if results['ids']:
                self.collection.delete(ids=results['ids'])
                logger.info(f"Deleted {len(results['ids'])} chunks for document {document_id}")
                return True
                
            logger.warning(f"No chunks found for document {document_id}")
            return False
            
        except Exception as e:
            logger.error(f"Error deleting document {document_id}: {str(e)}")
            return False
