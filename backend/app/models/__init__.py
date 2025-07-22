# This file makes the models directory a Python package
from .base import Base, engine, get_db
from .document import Document

# Import all models here to make them available when importing from app.models
__all__ = ["Base", "engine", "get_db", "Document"]
