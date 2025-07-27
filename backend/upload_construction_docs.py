import os
import requests
from pathlib import Path
from typing import List, Optional
import time

# Configuration
BASE_URL = "http://localhost:8000"
UPLOAD_ENDPOINT = f"{BASE_URL}/documents/upload"
DOCS_DIR = "construction_docs"

# Supported document extensions
SUPPORTED_EXTENSIONS = {
    '.pdf': 'application/pdf',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc': 'application/msword',
    '.txt': 'text/plain',
    '.csv': 'text/csv',
    '.md': 'text/markdown'
}

def get_file_mimetype(filename: str) -> Optional[str]:
    """Get the MIME type based on file extension."""
    ext = os.path.splitext(filename.lower())[1]
    return SUPPORTED_EXTENSIONS.get(ext)

def upload_document(file_path: str, title: Optional[str] = None, 
                   source: str = "construction_safety", 
                   doc_type: str = "safety_manual") -> dict:
    """Upload a single document to the RAG system."""
    mimetype = get_file_mimetype(file_path)
    if not mimetype:
        return {"status": "skipped", "reason": f"Unsupported file type: {file_path}"}
    
    with open(file_path, 'rb') as f:
        files = {'file': (os.path.basename(file_path), f, mimetype)}
        data = {
            'title': title or os.path.basename(file_path),
            'source': source,
            'document_type': doc_type
        }
        
        try:
            response = requests.post(UPLOAD_ENDPOINT, files=files, data=data)
            response.raise_for_status()
            return {"status": "success", "data": response.json()}
        except requests.exceptions.RequestException as e:
            return {"status": "error", "error": str(e)}

def upload_all_documents(directory: str = DOCS_DIR) -> None:
    """Upload all supported documents from the specified directory."""
    if not os.path.exists(directory):
        print(f"Directory not found: {directory}")
        return
    
    print(f"\n🔍 Scanning for documents in: {os.path.abspath(directory)}")
    
    # Get all files in directory
    files = []
    for root, _, filenames in os.walk(directory):
        for filename in filenames:
            if get_file_mimetype(filename):
                filepath = os.path.join(root, filename)
                filesize = os.path.getsize(filepath) / (1024 * 1024)  # in MB
                files.append((filepath, filesize))
    
    if not files:
        print("❌ No supported documents found.")
        print("Supported formats:", ", ".join(ext for ext in SUPPORTED_EXTENSIONS.keys()))
        return
    
    # Sort files by size (smallest first to process quicker ones first)
    files.sort(key=lambda x: x[1])
    
    total_size = sum(size for _, size in files)
    print(f"\n📄 Found {len(files)} documents (total: {total_size:.2f} MB):")
    for i, (filepath, size) in enumerate(files, 1):
        print(f"  {i:2d}. {os.path.basename(filepath)} ({size:.1f} MB)")
    
    # Ask for confirmation
    print("\n⚠️  This will process and upload all documents to the RAG system.")
    response = input("Proceed? (y/n): ").strip().lower()
    if response != 'y':
        print("\nUpload cancelled.")
        return
    
    # Process each file
    success_count = 0
    start_time = time.time()
    
    print("\n🚀 Starting document processing...")
    for i, (file_path, size) in enumerate(files, 1):
        filename = os.path.basename(file_path)
        print(f"\n📤 Processing {i}/{len(files)}: {filename} ({size:.1f} MB)")
        print("-" * 60)
        
        # Create a title from filename (remove extension and replace _ with spaces)
        title = os.path.splitext(filename)[0].replace('_', ' ').title()
        
        try:
            # Upload the document
            upload_start = time.time()
            result = upload_document(file_path, title=title, source="construction_safety", doc_type="safety_manual")
            
            if result["status"] == "success":
                success_count += 1
                chunks = result["data"].get("chunks_processed", 0)
                doc_id = result["data"].get("document_id", "N/A")
                duration = time.time() - upload_start
                print(f"✅ Uploaded successfully in {duration:.1f}s")
                print(f"   • Document ID: {doc_id}")
                print(f"   • Chunks created: {chunks}")
                if "metadata" in result["data"]:
                    print(f"   • Type: {result['data']['metadata'].get('document_type', 'N/A')}")
            else:
                print(f"❌ Error: {result.get('error', 'Unknown error')}")
                
        except Exception as e:
            print(f"❌ Unexpected error processing {filename}: {str(e)}")
        
        # Small delay to avoid overwhelming the server
        time.sleep(0.5)
    
    # Print summary
    total_time = time.time() - start_time
    print("\n" + "=" * 60)
    print("📊 Upload Summary:")
    print(f"   • Total documents: {len(files)}")
    print(f"   • Successfully processed: {success_count}")
    print(f"   • Failed: {len(files) - success_count}")
    print(f"   • Total time: {total_time:.1f} seconds")
    print("=" * 60)
    
    if success_count > 0:
        print("\n🎉 Documents are now ready for querying!")
    else:
        print("\n❌ No documents were processed successfully. Please check the error messages above.")

if __name__ == "__main__":
    print("🚀 Starting document upload process...")
    upload_all_documents()
