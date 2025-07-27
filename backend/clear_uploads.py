import os
import shutil
from pathlib import Path

def clear_uploads(uploads_dir: str = "./uploads"):
    """Remove all files in the uploads directory but keep the directory structure"""
    try:
        uploads_path = Path(uploads_dir)
        if not uploads_path.exists():
            print(f"ℹ️ Uploads directory not found at {uploads_path}")
            return False
            
        # Remove all files in the directory
        for item in uploads_path.glob('*'):
            if item.is_file():
                item.unlink()
                print(f"🗑️ Removed file: {item}")
            elif item.is_dir():
                shutil.rmtree(item)
                print(f"🗑️ Removed directory: {item}")
                
        print(f"✅ Successfully cleared {uploads_path}")
        return True
        
    except Exception as e:
        print(f"❌ Error clearing uploads directory: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting uploads cleanup...")
    success = clear_uploads()
    if success:
        print("✅ Uploads cleanup completed successfully!")
    else:
        print("⚠️ There were issues during the cleanup. Please check the logs above.")
