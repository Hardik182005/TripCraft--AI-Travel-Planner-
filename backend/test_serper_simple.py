import requests
import json
from config import SERPER_API_KEY

def test_serper():
    url = "https://google.serper.dev/search"
    payload = json.dumps({"q": "apple"})
    headers = {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    print(f"Status: {response.status_code}")
    print(response.text)

if __name__ == "__main__":
    test_serper()
