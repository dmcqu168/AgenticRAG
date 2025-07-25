# NYC Construction Fire Safety Assistant

> **Note**: This project is based on the [Agentic RAG Template](https://github.com/your-username/agentic-rag-template) repository, which provides the foundational architecture for building RAG applications.

An agentic RAG application designed to help construction fire safety managers maintain compliance and safety on construction sites. This intelligent assistant combines Retrieval-Augmented Generation (RAG) with AI agents using the ReAct method to provide expert fire safety guidance.

## 🚀 Core Purpose

This application was specifically developed to address the unique fire safety challenges in New York City construction sites. It helps construction managers ensure fire safety compliance by:
- Retrieving information from a comprehensive database of fire safety documents including NYC Fire Code, Building Code, and OSHA regulations
- Generating intelligent, context-aware responses using AI with specialized construction fire safety expertise
- Providing real-time access to critical safety information directly on construction sites via mobile devices

## 🔑 Key Capabilities

### 📋 Compliance Management
- Code lookup for NYC Fire Code and OSHA fire safety regulations
- Daily safety checklists with compliance tracking
- Fire safety inspection reports and audits

### 🤖 AI-Powered Assistance
- Q&A functionality for fire safety code questions
- Photo upload with AI feedback and code references
- Expert-level guidance on construction fire safety compliance

### 🛠️ Technical Features
- **Semantic Search**: Advanced search across NYC Fire Code and OSHA regulations
- **Document Intelligence**: analysis of safety documents with specialized agents
- **Vector Database**: ChromaDB for efficient document retrieval
- **Cross-Platform**: React Native app for iOS and Android

## 🏗️ Technical Architecture

### Retrieval System
- ChromaDB vector database for document storage
- Semantic search with metadata preservation
- Document chunking for efficient retrieval

### AI Generation
- AI service with fire safety expertise prompts
- Construction-specific context and reasoning
- Accurate citations and code references

### Agent System
- Implements ReAct method for intelligent responses
- Specialized agents for different document types
- Continuous learning and improvement

## Project Structure

```
AgenticRAG/
├── AgenticRAGApp/         # React Native mobile app
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── screens/       # App screens
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── App.tsx            # Main app component
├── backend/               # FastAPI backend server
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Core functionality
│   │   ├── db/            # Database models and setup
│   │   └── services/      # Business logic
│   ├── migrations/        # Database migrations
│   ├── tests/             # Test files
│   └── main.py            # FastAPI application entry point
├── .gitignore            # Git ignore file
└── README.md             # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Python 3.10+
- iOS/Android development environment (for mobile app)
- ChromaDB for vector storage
- SQLite (for metadata storage)

### Installation

1. **Clone the repository**
   ```bash
   # Clone this repository
   git clone https://github.com/dmcqu168/AgenticRAG.git
   cd AgenticRAG
   
   # Or if you want to start from the original template:
   # git clone https://github.com/your-username/agentic-rag-template.git AgenticRAG
   # cd AgenticRAG
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   
   # Install dependencies
   pip install -r requirements.txt
   pip install -r requirements-docs.txt  # For development
   
   # Set up the database
   alembic upgrade head
   
   # Initialize the vector database
   python -c "from app.services.rag_service import RAGService; RAGService()"
   ```

3. **Set up the mobile app**
   ```bash
   cd ../AgenticRAGApp
   
   # Install dependencies
   npm install
   
   # For iOS
   cd ios && pod install && cd ..
   
   # For Android
   # No additional setup required for Android
   ```

## Running the Application

### Backend Server
```bash
cd backend
uvicorn main:app --reload
```

### Mobile App
```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

## API Documentation

Once the backend server is running, access the interactive API documentation at:
- http://localhost:8000/docs

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
