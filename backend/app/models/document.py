from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, func, Index, event
from sqlalchemy.types import TypeDecorator, VARCHAR
import json
from .base import Base

class Document(Base):
    """
    Model for storing document information in the database.
    
    This model represents documents that have been processed and stored in the system.
    The actual content is stored in the vector database, while metadata is kept here.
    """
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Core document information
    title = Column(String(512), index=True, nullable=False)
    content = Column(Text, comment="Summary or preview of the document content")
    document_type = Column(
        String(50),
        index=True,
        nullable=True,  # Make nullable for existing records
        default='other',
        server_default='other',  # Ensure default at database level
        comment="Type of document (e.g., 'code', 'regulation', 'safety_manual')"
    )
    source = Column(
        String(100),
        index=True,
        nullable=False,
        default='upload',
        comment="Source of the document (e.g., 'upload', 'nyc_gov', 'osha')"
    )
    
    # Metadata and timestamps
    doc_metadata = Column(
        "metadata",
        JSON,
        default=dict,
        comment="Additional metadata in JSON format"
    )
    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )
    updated_at = Column(
        DateTime(timezone=True),
        onupdate=func.now(),
        comment="Last update timestamp"
    )
    processed_at = Column(
        DateTime(timezone=True),
        nullable=True,
        comment="When the document was processed by the vector store"
    )
    
    # Full-text search support (using Text for SQLite compatibility)
    search_vector = Column(
        Text,
        nullable=True,
        comment="Search vector for full-text search (JSON-encoded)"
    )
    
    # Indexes
    __table_args__ = (
        # Composite index for common query patterns
        Index('idx_document_type_source', 'document_type', 'source'),
        # Index for processed documents
        Index('idx_processed_docs', 'processed_at'),
    )
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert the document to a dictionary representation"""
        return {
            'id': self.id,
            'title': self.title,
            'document_type': self.document_type,
            'source': self.source,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'processed_at': self.processed_at.isoformat() if self.processed_at else None,
            'metadata': self.doc_metadata or {}
        }
    
    @classmethod
    def from_upload(
        cls,
        title: str,
        content: str,
        document_type: str = 'other',
        source: str = 'upload',
        metadata: Optional[Dict[str, Any]] = None
    ) -> 'Document':
        """Create a new Document instance from an upload"""
        return cls(
            title=title,
            content=content,
            document_type=document_type,
            source=source,
            doc_metadata=metadata or {},
            processed_at=None
        )
