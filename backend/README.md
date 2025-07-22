# Agentic RAG Backend

This is the backend service for the Agentic RAG (Retrieval-Augmented Generation) application. It provides APIs for document management, querying, and generating responses using RAG.

## Features

- Document upload and management
- Vector-based semantic search using ChromaDB
- Integration with LLMs for response generation
- RESTful API with OpenAPI documentation
- SQLite database for document metadata storage

## Prerequisites

- Python 3.8+
- pip (Python package manager)
- SQLite (included with Python)

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd AgenticRAG/backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements-core.txt
   ```

4. Set up environment variables:
   Create a `.env` file in the backend directory with the following content:
   ```
   # API Settings
   DEBUG=True
   HOST=0.0.0.0
   PORT=8000
   
   # Database
   DATABASE_URL=sqlite:///./sql_app.db
   CHROMA_DB_PATH=./chroma_db
   
   # LLM Settings (optional)
   # OPENAI_API_KEY=your-openai-api-key
   ```

## Running the Application

1. Initialize the database:
   ```bash
   python init_db.py
   ```

2. Start the FastAPI server:
   ```bash
   uvicorn main:app --reload
   ```

3. Access the API documentation:
   - Open your browser and go to: http://localhost:8000/docs

## API Endpoints

- `GET /` - Health check and API information
- `POST /documents/upload` - Upload a document
- `POST /query` - Query the RAG system
- `GET /documents` - List all documents

## Project Structure

```
backend/
├── app/
│   ├── models/          # Database models
│   │   ├── __init__.py
│   │   ├── base.py      # Base model and database session
│   │   └── document.py  # Document model
│   │
│   └── services/        # Business logic
│       └── rag_service.py  # RAG service implementation
│
├── config.py           # Application configuration
├── main.py            # FastAPI application
├── requirements.txt    # Python dependencies
└── README.md          # This file
```

## Development

To run the application in development mode with auto-reload:

```bash
uvicorn main:app --reload
```

## Deployment

For production deployment, consider using:

1. A production-grade ASGI server like Gunicorn with Uvicorn workers
2. Environment variables for configuration
3. A proper database like PostgreSQL
4. Reverse proxy (Nginx, Caddy, etc.)

Example with Gunicorn:
```bash
gunicorn -k uvicorn.workers.UvicornWorker -w 4 -b 0.0.0.0:8000 main:app
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
