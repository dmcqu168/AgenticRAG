import json
import requests

def test_query():
    url = "http://localhost:8000/query"
    headers = {"Content-Type": "application/json"}
    
    # Test query about fire safety requirements
    query = "What are the fire safety requirements for construction sites?"
    
    # Prepare the request data
    data = {
        "query": query,
        "context": {}
    }
    
    try:
        # Send the POST request
        response = requests.post(url, headers=headers, data=json.dumps(data))
        
        if response.status_code == 200:
            result = response.json()
            print("\n=== Query Response ===")
            print(f"Query: {query}")
            print("\nAnswer:")
            print(result.get('answer', 'No answer found'))
            
            # Print document sources
            print("\nSources:")
            for i, doc in enumerate(result.get('documents', [])[:3]):  # Show top 3 sources
                print(f"\nSource {i+1}:")
                print(f"Content: {doc.get('content', '')[:200]}...")  # First 200 chars
                print(f"Source: {doc.get('metadata', {}).get('source', 'Unknown')}")
                print(f"Document ID: {doc.get('id', 'N/A')}")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
            
    except Exception as e:
        print(f"An error occurred: {str(e)}")

if __name__ == "__main__":
    test_query()
