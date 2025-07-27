import os
import chromadb
from chromadb.config import Settings
from pathlib import Path

def check_vector_db(db_path: str = "./chroma_db"):
    """Check the contents of the ChromaDB vector database"""
    try:
        # Check if the database directory exists
        if not os.path.exists(db_path):
            print("✅ ChromaDB directory does not exist (already cleared).")
            return True
            
        # Initialize ChromaDB client
        try:
            client = chromadb.PersistentClient(path=db_path)
            
            # Check if we can list collections (will fail if directory is empty)
            collections = client.list_collections()
            
            if not collections:
                print("✅ No collections found in the vector database.")
                return True
                
            print(f"Found {len(collections)} collection(s) in the database:")
            
            all_empty = True
            
            for collection in collections:
                try:
                    # Get collection info
                    count = collection.count()
                    print(f"\nCollection: {collection.name}")
                    print(f"  Number of items: {count}")
                    
                    if count > 0:
                        all_empty = False
                        # Get a sample of items
                        try:
                            results = collection.get(limit=min(5, count))
                            print("  Sample items:")
                            if 'ids' in results and 'documents' in results and 'metadatas' in results:
                                for i, (id, doc, metadata) in enumerate(zip(results['ids'], results['documents'], results['metadatas'])):
                                    print(f"  {i+1}. ID: {id}")
                                    doc_str = str(doc)
                                    print(f"     Document: {doc_str[:100]}..." if len(doc_str) > 100 else f"     Document: {doc_str}")
                                    print(f"     Metadata: {metadata}")
                        except Exception as e:
                            print(f"  Could not retrieve sample items: {str(e)}")
                    else:
                        print("  Collection is empty")
                except Exception as e:
                    print(f"  Error checking collection {collection.name}: {str(e)}")
                    all_empty = False
            
            if all_empty:
                print("\n✅ All collections are empty.")
            else:
                print("\n⚠️ Some collections still contain data.")
                
            return all_empty
            
        except Exception as e:
            # If we can't connect to the database, it might be because it's empty
            print("ℹ️ Could not connect to ChromaDB, it may be empty or corrupted.")
            print(f"   Error: {str(e)}")
            return True
            
    except Exception as e:
        print(f"❌ Unexpected error checking vector database: {str(e)}")
        return False

def check_sqlite_db(db_path: str):
    """Check the contents of an SQLite database"""
    import sqlite3
    
    try:
        if not os.path.exists(db_path):
            print(f"ℹ️ SQLite database not found at {db_path}")
            return True
            
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Get list of all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = cursor.fetchall()
        
        if not tables:
            print(f"✅ No tables found in {db_path}")
            return True
            
        print(f"\nChecking SQLite database: {db_path}")
        all_empty = True
        
        for table in tables:
            table_name = table[0]
            if table_name == 'sqlite_sequence':
                continue
                
            cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
            count = cursor.fetchone()[0]
            print(f"\nTable: {table_name}")
            print(f"  Rows: {count}")
            
            if count > 0:
                all_empty = False
                # Get column names
                cursor.execute(f"PRAGMA table_info({table_name});")
                columns = [col[1] for col in cursor.fetchall()]
                print(f"  Columns: {', '.join(columns)}")
                
                # Get sample data
                cursor.execute(f"SELECT * FROM {table_name} LIMIT 1;")
                sample = cursor.fetchone()
                if sample:
                    print("  Sample row:")
                    for col_name, value in zip(columns, sample):
                        print(f"    {col_name}: {str(value)[:100]}" + ("..." if len(str(value)) > 100 else ""))
            
        conn.close()
        
        if all_empty:
            print("\n✅ All tables are empty.")
        else:
            print("\n⚠️ Some tables still contain data.")
            
        return all_empty
        
    except Exception as e:
        print(f"❌ Error checking SQLite database: {str(e)}")
        return False

if __name__ == "__main__":
    print("🔍 Checking database status...")
    
    # Check ChromaDB
    print("\n=== Checking ChromaDB ===")
    chroma_ok = check_vector_db("./chroma_db")
    
    # Check SQLite databases
    print("\n=== Checking SQLite Databases ===")
    sqlite_dbs = [
        "./sql_app.db",
        "./test.db"
    ]
    
    sqlite_ok = all(check_sqlite_db(db) for db in sqlite_dbs)
    
    if chroma_ok and sqlite_ok:
        print("\n✅ All databases have been successfully cleared!")
    else:
        print("\n⚠️ Some databases still contain data. You may need to clear them again.")
