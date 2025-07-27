import os
import sqlite3
from pathlib import Path
from typing import List, Dict, Tuple

def get_uploaded_files(uploads_dir: str) -> List[Path]:
    """Get list of all files in the uploads directory"""
    uploads_path = Path(uploads_dir)
    if not uploads_path.exists():
        return []
    return [f for f in uploads_path.glob('*') if f.is_file()]

def get_processed_documents(db_path: str) -> List[Dict]:
    """Get list of all processed documents from the database"""
    if not os.path.exists(db_path):
        return []
        
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if documents table exists
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='documents';
        """)
        
        if not cursor.fetchone():
            return []
            
        # Get all processed documents
        cursor.execute("""
            SELECT id, file_name, status, created_at, updated_at 
            FROM documents;
        """)
        
        columns = [column[0] for column in cursor.description]
        documents = [dict(zip(columns, row)) for row in cursor.fetchall()]
        return documents
        
    except sqlite3.Error as e:
        print(f"Error querying database: {e}")
        return []
    finally:
        conn.close()

def check_chroma_db(chroma_path: str) -> Tuple[bool, int]:
    """Check if ChromaDB has any vectors stored"""
    try:
        import chromadb
        from chromadb.config import Settings
        
        if not os.path.exists(chroma_path):
            return False, 0
            
        client = chromadb.PersistentClient(path=chroma_path)
        
        try:
            collections = client.list_collections()
            total_vectors = 0
            
            for collection in collections:
                try:
                    count = collection.count()
                    total_vectors += count
                    print(f"Found {count} vectors in collection: {collection.name}")
                except Exception as e:
                    print(f"Error counting vectors in {collection.name}: {e}")
            
            return total_vectors > 0, total_vectors
            
        except Exception as e:
            print(f"Error listing collections: {e}")
            return False, 0
            
    except ImportError:
        print("ChromaDB not installed, skipping vector database check")
        return False, 0
    except Exception as e:
        print(f"Error checking ChromaDB: {e}")
        return False, 0

def main():
    # Configuration
    uploads_dir = "./uploads"
    sqlite_db_path = "./sql_app.db"
    chroma_db_path = "./chroma_db"
    
    print("🔍 Checking document processing status...\n")
    
    # Check uploaded files
    print("=== Uploaded Files ===")
    uploaded_files = get_uploaded_files(uploads_dir)
    print(f"Found {len(uploaded_files)} files in uploads directory")
    for i, file in enumerate(uploaded_files, 1):
        print(f"  {i}. {file.name} ({file.stat().st_size / 1024:.1f} KB)")
    
    # Check processed documents in SQLite
    print("\n=== Processed Documents (SQLite) ===")
    processed_docs = get_processed_documents(sqlite_db_path)
    print(f"Found {len(processed_docs)} processed documents in database")
    
    # Check for processing status
    status_counts = {}
    for doc in processed_docs:
        status = doc.get('status', 'unknown')
        status_counts[status] = status_counts.get(status, 0) + 1
    
    for status, count in status_counts.items():
        print(f"  - {status}: {count} documents")
    
    # Check ChromaDB for vectors
    print("\n=== Vector Database (ChromaDB) ===")
    has_vectors, vector_count = check_chroma_db(chroma_db_path)
    if has_vectors:
        print(f"Found {vector_count} vectors in the vector database")
    else:
        print("No vectors found in the vector database")
    
    # Compare uploads with processed documents
    print("\n=== Processing Status ===")
    if not uploaded_files and not processed_docs:
        print("No files found in uploads directory and no documents in database")
    elif not processed_docs:
        print("⚠️  Files are uploaded but not yet processed")
    else:
        # Check for unprocessed files
        processed_filenames = {doc['file_name'] for doc in processed_docs}
        unprocessed = [f for f in uploaded_files if f.name not in processed_filenames]
        
        if unprocessed:
            print(f"⚠️  Found {len(unprocessed)} unprocessed files:")
            for file in unprocessed:
                print(f"  - {file.name}")
        else:
            print("✅ All uploaded files have been processed")
    
    # Check for processing errors
    if processed_docs:
        errors = [doc for doc in processed_docs if doc.get('status') == 'error']
        if errors:
            print(f"\n⚠️  Found {len(errors)} documents with processing errors:")
            for doc in errors[:3]:  # Show first 3 errors
                print(f"  - {doc['file_name']}: {doc.get('error', 'Unknown error')}")
                if len(errors) > 3:
                    print(f"  ... and {len(errors) - 3} more")
                    break

if __name__ == "__main__":
    main()
