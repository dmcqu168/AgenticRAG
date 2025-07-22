# Agentic RAG Mobile Application

A mobile application that implements an agentic Retrieval-Augmented Generation (RAG) system using React Native and FastAPI.

## Features

- **Mobile-First Design**: Built with React Native for cross-platform compatibility (iOS/Android)
- **Agentic RAG Backend**: FastAPI server with ChromaDB for vector storage
- **Document Processing**: Handles various document types with text extraction
- **Semantic Search**: Advanced search capabilities using vector embeddings
- **Self-Improving**: Implements the ReAct method for agent self-improvement

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
