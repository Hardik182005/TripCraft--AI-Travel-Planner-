import requests
import json
from config import SERPER_API_KEY

def test_serper_images(query):
    url = "https://google.serper.dev/images"
    payload = json.dumps({"q": query, "num": 5})
    headers = {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
    }
    print(f"Testing Images for: {query}")
    response = requests.request("POST", url, headers=headers, data=payload)
    print(f"Status: {response.status_code}")
    print(f"Body: {response.text[:200]}")

test_serper_images("Reykjavik Iceland landscape")
