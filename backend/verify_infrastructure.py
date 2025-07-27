import os
import sys
import sqlite3
import chromadb
from pathlib import Path

def check_directory_structure():
    print("🔍 Checking directory structure...")
    required_dirs = ['uploads', 'chroma_db']
    all_ok = True
    
    for dir_name in required_dirs:
        path = Path(dir_name)
        if not path.exists():
            print(f"  ⚠️  Directory missing: {dir_name}")
            all_ok = False
        else:
            print(f"  ✅ {dir_name} exists")
            
        if dir_name == 'uploads' and not os.access(dir_name, os.W_OK):
            print(f"  ⚠️  Cannot write to {dir_name}")
            all_ok = False
    
    return all_ok

def check_sqlite_db():
    print("\n🔍 Checking SQLite database...")
    db_path = 'sql_app.db'
    
    try:
        # Try to create and query the database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check if tables exist
        cursor.execute("""
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name='documents';
        """)
        
        if not cursor.fetchone():
            print("  ℹ️  Documents table doesn't exist (this is normal for a fresh install)")
        else:
            print("  ✅ Documents table exists")
            
        # Test write access
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS test_table (id INTEGER PRIMARY KEY, test TEXT);
        """)
        cursor.execute("INSERT INTO test_table (test) VALUES ('test_value')")
        conn.commit()
        print("  ✅ Can write to database")
        
        cursor.execute("DROP TABLE IF EXISTS test_table")
        conn.close()
        return True
        
    except Exception as e:
        print(f"  ❌ Database error: {str(e)}")
        return False

def check_chromadb():
    print("\n🔍 Checking ChromaDB...")
    try:
        client = chromadb.PersistentClient(path='./chroma_db')
        
        # Test creating a collection
        test_collection = client.create_collection("test_collection")
        test_collection.add(
            documents=["This is a test document"],
            metadatas=[{"source": "test"}],
            ids=["test_id"]
        )
        
        # Test querying
        results = test_collection.query(
            query_texts=["test document"],
            n_results=1
        )
        
        # Clean up
        client.delete_collection("test_collection")
        
        if results and 'documents' in results and len(results['documents']) > 0:
            print("  ✅ ChromaDB is working correctly")
            return True
        else:
            print("  ⚠️  ChromaDB query returned no results")
            return False
            
    except Exception as e:
        print(f"  ❌ ChromaDB error: {str(e)}")
        return False

async def check_document_processor():
    print("\n🔍 Checking document processor...")
    try:
        from app.services.document_processor import DocumentProcessor
        from pathlib import Path
        import asyncio
        
        # Create a test text file
        test_file = Path("test_document.txt")
        with open(test_file, "w") as f:
            f.write("This is a test document for infrastructure verification." * 50)  # Make sure it's long enough to chunk
        
        try:
            # Test the processor
            processor = DocumentProcessor()
            result = await processor.process(str(test_file))
            
            if result and "chunks" in result and len(result["chunks"]) > 0:
                print(f"  ✅ Document processor is working (created {len(result['chunks'])} chunks)")
                return True
            else:
                print("  ⚠️  Document processor returned no chunks")
                return False
                
        except Exception as e:
            print(f"  ❌ Document processor error: {str(e)}")
            return False
            
        finally:
            # Clean up
            if test_file.exists():
                test_file.unlink()
                
    except Exception as e:
        print(f"  ❌ Error setting up document processor test: {str(e)}")
        return False

def check_rag_service():
    print("\n🔍 Checking RAG service...")
    try:
        from app.services.rag_service import RAGService
        
        rag = RAGService()
        print("  ✅ RAG service initialized successfully")
        return True
        
    except Exception as e:
        print(f"  ❌ RAG service error: {str(e)}")
        return False

async def main():
    print("🚀 Starting infrastructure verification...\n")
    
    # Run sync checks first
    checks = {
        "Directory Structure": check_directory_structure(),
        "SQLite Database": check_sqlite_db(),
        "ChromaDB": check_chromadb(),
        "RAG Service": check_rag_service()
    }
    
    # Run async checks
    checks["Document Processor"] = await check_document_processor()
    
    print("\n📊 Verification Summary:")
    print("=" * 50)
    
    all_passed = True
    for check_name, passed in checks.items():
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status} - {check_name}")
        if not passed:
            all_passed = False
    
    print("\n" + "=" * 50)
    if all_passed:
        print("🎉 All systems are go! You can start uploading documents.")
    else:
        print("⚠️  Some checks failed. Please review the output above.")
    
    return 0 if all_passed else 1

if __name__ == "__main__":
    import asyncio
    sys.exit(asyncio.run(main()))
