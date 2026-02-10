import requests
import json

# Test the API endpoint
try:
    response = requests.get("http://127.0.0.1:8000/api/hotels/?city=Sapa")
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Success! Got {len(data)} hotels")
    else:
        print(f"Error Response:")
        print(response.text)
except Exception as e:
    print(f"Exception: {e}")
