import os
import shutil
import sqlite3
from pathlib import Path

def clear_chroma_db(db_path: str):
    """Clear ChromaDB vector database"""
    try:
        if os.path.exists(db_path):
            shutil.rmtree(db_path)
            print(f"✅ ChromaDB cleared at {db_path}")
        else:
            print(f"ℹ️ ChromaDB not found at {db_path}")
        return True
    except Exception as e:
        print(f"❌ Error clearing ChromaDB: {str(e)}")
        return False

def clear_sqlite_db(db_path: str):
    """Clear SQLite database used for document metadata"""
    try:
        if os.path.exists(db_path):
            # First, delete the database file
            os.remove(db_path)
            # Create a new empty database
            open(db_path, 'a').close()
            print(f"✅ SQLite database recreated at {db_path}")
        else:
            print(f"ℹ️ SQLite database not found at {db_path}")
        return True
    except Exception as e:
        print(f"❌ Error clearing SQLite database: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting database cleanup...")
    
    # Clear ChromaDB
    chroma_path = "./chroma_db"
    chroma_success = clear_chroma_db(chroma_path)
    
    # Clear SQLite databases
    sqlite_dbs = [
        "./sql_app.db",
        "./test.db"
    ]
    
    sqlite_success = all(clear_sqlite_db(db) for db in sqlite_dbs)
    
    if chroma_success and sqlite_success:
        print("\n✅ Database cleanup completed successfully!")
    else:
        print("\n⚠️ Some operations may have failed. Please check the logs above.")
