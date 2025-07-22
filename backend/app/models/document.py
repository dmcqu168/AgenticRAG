from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, func
from .base import Base

class Document(Base):
    """Model for storing document information"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    doc_metadata = Column("metadata", JSON, default={})  # Renamed to avoid conflict with SQLAlchemy's metadata
    source = Column(String)  # e.g., "upload", "api", etc.
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
