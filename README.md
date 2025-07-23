# Construction Fire Safety Assistant

An agentic RAG application designed to help construction fire safety managers maintain compliance and safety on construction sites. This intelligent assistant combines Retrieval-Augmented Generation (RAG) with AI agents using the ReAct method to provide expert fire safety guidance.

## 🚀 Core Purpose

The app helps construction managers ensure fire safety compliance by:
- Retrieving information from a comprehensive database of fire safety documents
- Generating intelligent responses using AI with construction fire safety expertise
- Providing real-time access to critical safety information on construction sites

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
├── app/                    # React Native mobile app
├── backend/                # FastAPI backend server
│   ├── app/               
│   │   ├── models/        # Database models
│   │   └── services/      # Business logic
│   ├── config.py          # Configuration settings
│   └── main.py            # FastAPI application
└── README.md              # This file
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Python 3.8+
- iOS/Android development environment (for mobile app)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AgenticRAG
   ```

2. **Set up the backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements-core.txt
   python init_db.py
   ```

3. **Set up the mobile app**
   ```bash
   cd ../app
   npm install
   # For iOS
   cd ios && pod install && cd ..
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
