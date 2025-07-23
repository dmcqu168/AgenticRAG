import logging
from datetime import datetime
from fastapi import FastAPI, HTTPException, Depends, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
import os
import uuid
from pathlib import Path
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import services and models
from app.services.rag_service import RAGService
from app.models import Document, get_db, Base, engine
from config import settings

# Load environment variables
load_dotenv()

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title="Agentic RAG API",
    description="API for Agentic RAG Application",
    version="0.1.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
rag_service = RAGService()

# Models
class DocumentMetadata(BaseModel):
    title: Optional[str] = None
    source: Optional[str] = None
    custom_metadata: Dict[str, Any] = Field(default_factory=dict)

class DocumentUpload(BaseModel):
    content: str
    metadata: DocumentMetadata

class QueryRequest(BaseModel):
    query: str
    context: Optional[Dict[str, Any]] = None

class DocumentResponse(BaseModel):
    id: str
    content: str
    metadata: Dict[str, Any]
    score: Optional[float] = None

class QueryResponse(BaseModel):
    answer: str
    documents: List[DocumentResponse]

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Routes
@app.get("/")
async def root():
    return {
        "message": "Agentic RAG API is running",
        "version": "0.1.0",
        "documentation": "/docs"
    }

@app.post("/documents/upload", response_model=Dict[str, Any])
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(None),
    source: str = Form("upload"),
    document_type: str = Form("other")
):
    """
    Upload and process a document for the RAG system.
    
    Supports various document types including PDF, DOCX, and plain text.
    The document will be processed, chunked, and added to the vector store.
    """
    try:
        # Validate file type
        file_extension = Path(file.filename).suffix.lower()
        supported_extensions = ['.pdf', '.docx', '.doc', '.txt', '.csv']
        
        if file_extension not in supported_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Unsupported file type. Supported types: {', '.join(supported_extensions)}"
            )
        
        # Save the uploaded file
        file_id = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, file_id)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Prepare metadata
        metadata = {
            "title": title or file.filename,
            "source": source,
            "document_type": document_type,
            "original_filename": file.filename,
            "content_type": file.content_type,
            "upload_timestamp": datetime.utcnow().isoformat()
        }
        
        # Process and add document to the vector store
        chunks = await rag_service.add_document(file_path, metadata)
        
        if not chunks:
            raise HTTPException(
                status_code=400,
                detail="Failed to process document or extract meaningful content"
            )
        
        # Save document metadata to database
        db = next(get_db())
        db_doc = Document(
            title=title or file.filename,
            content=f"Processed document with {len(chunks)} chunks",
            doc_metadata=metadata,
            source=source,
            document_type=document_type
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)
        
        return {
            "message": "Document processed and added to vector store",
            "document_id": str(db_doc.id),
            "chunks_processed": len(chunks),
            "metadata": metadata
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing document: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process document: {str(e)}"
        )

@app.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """
    Handle a query and return a response with relevant documents
    """
    try:
        # Retrieve relevant documents
        documents = await rag_service.query(request.query)
        
        # Generate response using the query and retrieved documents
        response = await rag_service.generate_response(request.query, documents)
        
        # Format response
        formatted_docs = [
            DocumentResponse(
                id=doc['id'],
                content=doc['content'],
                metadata=doc['metadata'],
                score=doc.get('score')
            )
            for doc in documents
        ]
        
        # Extract the answer from the response
        answer = response.get('answer', "I couldn't generate a response for that query.")
        
        return QueryResponse(answer=answer, documents=formatted_docs)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/documents", response_model=List[DocumentResponse])
async def list_documents(limit: int = 10, offset: int = 0):
    """List all documents in the system"""
    try:
        # This is a simplified example - in a real app, you'd paginate properly
        db = next(get_db())
        documents = db.query(Document).offset(offset).limit(limit).all()
        
        return [
            DocumentResponse(
                id=str(doc.id),
                content=doc.content,
                metadata=doc.doc_metadata or {}
            )
            for doc in documents
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # Create uploads directory if it doesn't exist
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    # Run the application
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG
    )
