# This file makes the services directory a Python package
from .rag_service import RAGService

# Import all services here to make them available when importing from app.services
__all__ = ["RAGService"]
