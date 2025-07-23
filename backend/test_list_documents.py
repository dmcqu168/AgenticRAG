import requests
import json

# Configuration
BASE_URL = "http://localhost:8000"
LIST_ENDPOINT = f"{BASE_URL}/documents/"

def list_documents(limit: int = 10, offset: int = 0):
    """List documents from the API."""
    params = {"limit": limit, "offset": offset}
    response = requests.get(LIST_ENDPOINT, params=params)
    
    print(f"\nListing documents (limit={limit}, offset={offset}):")
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        documents = response.json()
        print(f"Found {len(documents)} documents:")
        for doc in documents:
            print(f"\nDocument ID: {doc.get('id', 'N/A')}")
            print(f"Content: {doc.get('content', 'N/A')}")
            metadata = doc.get('metadata', {})
            if metadata:
                print("Metadata:")
                for k, v in metadata.items():
                    print(f"  {k}: {v}")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    list_documents(limit=10)
