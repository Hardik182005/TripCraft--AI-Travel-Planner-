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
    try:
        response = requests.request("POST", url, headers=headers, data=payload)
        results = response.json().get('images', [])
        for i, res in enumerate(results[:3]):
            print(f"Image {i+1}: {res.get('imageUrl')}")
    except Exception as e:
        print(f"Error: {e}")

test_serper_images("Reykjavik Iceland landscape")
test_serper_images("Swiss Alps landscape")
