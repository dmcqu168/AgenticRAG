import os
import sys
import requests
from pathlib import Path

# Add the current directory to the path so we can import app modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configuration
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), 'uploads')
API_BASE_URL = "http://localhost:8000"

def process_uploaded_files():
    """Process all PDF files in the uploads directory."""
    print(f"Looking for PDFs in: {UPLOAD_DIR}")
    
    # Get all PDF files in the uploads directory
    pdf_files = list(Path(UPLOAD_DIR).glob('*.pdf'))
    
    if not pdf_files:
        print("No PDF files found in the uploads directory.")
        return
    
    print(f"Found {len(pdf_files)} PDF(s) to process...")
    
    for pdf_path in pdf_files:
        try:
            print(f"\nProcessing: {pdf_path.name}")
            
            # Prepare the file for upload
            with open(pdf_path, 'rb') as f:
                files = {'file': (pdf_path.name, f, 'application/pdf')}
                
                # Send the file to the upload endpoint
                response = requests.post(
                    f"{API_BASE_URL}/documents/upload",
                    files=files,
                    data={"document_type": "safety_guidelines"}
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ Successfully processed: {pdf_path.name}")
                    print(f"   Document ID: {result.get('id')}")
                else:
                    print(f"❌ Failed to process {pdf_path.name}")
                    print(f"   Status code: {response.status_code}")
                    print(f"   Response: {response.text}")
                    
        except Exception as e:
            print(f"❌ Error processing {pdf_path.name}: {str(e)}")

if __name__ == "__main__":
    print("Starting document processing...")
    process_uploaded_files()
    print("\nDocument processing complete!")
