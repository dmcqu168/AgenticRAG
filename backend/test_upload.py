import requests
import os
from pathlib import Path
from typing import Optional

# Configuration
BASE_URL = "http://localhost:8000"
UPLOAD_ENDPOINT = f"{BASE_URL}/documents/upload"
TEST_DOCS_DIR = "test_docs"

# Create test_docs directory if it doesn't exist
os.makedirs(TEST_DOCS_DIR, exist_ok=True)

def create_test_file(filename: str, content: str) -> str:
    """Create a test file with the given content."""
    filepath = os.path.join(TEST_DOCS_DIR, filename)
    with open(filepath, 'w') as f:
        f.write(content)
    return filepath

def test_upload_document(file_path: str, title: Optional[str] = None, 
                        source: str = "test", doc_type: str = "test"):
    """Test document upload endpoint."""
    with open(file_path, 'rb') as f:
        files = {'file': (os.path.basename(file_path), f, 'application/octet-stream')}
        data = {
            'title': title or os.path.basename(file_path),
            'source': source,
            'document_type': doc_type
        }
        response = requests.post(UPLOAD_ENDPOINT, files=files, data=data)
        
    print(f"\nTesting upload of: {os.path.basename(file_path)}")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("Upload Successful!")
        print("Response:", response.json())
    else:
        print("Upload Failed!")
        print("Error:", response.text)
    
    return response

def create_test_csv():
    """Create a sample CSV file for testing."""
    import csv
    filename = "test_data.csv"
    filepath = os.path.join(TEST_DOCS_DIR, filename)
    
    data = [
        ["Name", "Age", "Department"],
        ["John Doe", "30", "Engineering"],
        ["Jane Smith", "28", "Marketing"],
        ["Bob Johnson", "35", "Sales"]
    ]
    
    with open(filepath, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(data)
    
    return filepath

def main():
    print("Starting document upload tests...")
    
    # Create test files
    test_files = [
        ("test.txt", "This is a test text file. It contains some sample text for testing the document upload functionality."),
        ("test_long.txt", "This is a longer test text file. " * 100),  # Will be split into multiple chunks
    ]
    
    # Create and upload text files
    for filename, content in test_files:
        file_path = create_test_file(filename, content)
        test_upload_document(file_path, doc_type="test_data")
    
    # Create and upload a CSV file
    try:
        csv_path = create_test_csv()
        test_upload_document(csv_path, doc_type="test_data")
    except Exception as e:
        print(f"Error creating/uploading CSV: {e}")
    
    print("\nAll tests completed!")

if __name__ == "__main__":
    main()
