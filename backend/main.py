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

@app.post("/documents/upload", response_model=Dict[str, str])
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(None),
    source: str = Form("upload")
):
    """Upload a document to the RAG system"""
    try:
        # Save the uploaded file
        file_extension = Path(file.filename).suffix
        file_id = f"{uuid.uuid4()}{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, file_id)
        
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        # Extract text from the file (simplified example)
        # In a real app, you'd use PyPDF2, docx2txt, etc. based on file type
        text_content = f"Content from {file.filename}"  # Replace with actual extraction
        
        # Add to RAG system
        metadata = {
            "title": title or file.filename,
            "source": source,
            "file_path": file_path,
            "file_name": file.filename,
            "content_type": file.content_type
        }
        
        doc_id = await rag_service.add_document(text_content, metadata)
        
        # Save to database (simplified)
        db = next(get_db())
        db_doc = Document(
            title=title or file.filename,
            content=text_content[:1000],  # Store first 1000 chars in DB
            doc_metadata=metadata,
            source=source
        )
        db.add(db_doc)
        db.commit()
        db.refresh(db_doc)
        
        return {"message": "Document uploaded successfully", "document_id": doc_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/query", response_model=QueryResponse)
async def query_documents(request: QueryRequest):
    """
    Handle a query and return a response with relevant documents
    """
    try:
        # Retrieve relevant documents
        documents = await rag_service.query(request.query)
        
        # Generate response using the query and retrieved documents
        answer = await rag_service.generate_response(request.query, documents)
        
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
                metadata=doc.metadata or {}
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
