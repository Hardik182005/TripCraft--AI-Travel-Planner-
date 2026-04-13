import requests
import json
from config import SERPER_API_KEY

def test_serper():
    url = "https://google.serper.dev/search"
    payload = json.dumps({
        "q": "trending travel destinations 2026 reddit",
        "num": 10
    })
    headers = {
        'X-API-KEY': SERPER_API_KEY,
        'Content-Type': 'application/json'
    }
    response = requests.request("POST", url, headers=headers, data=payload)
    print("SERPER GENERAL SEARCH (REDDIT):")
    print(json.dumps(response.json(), indent=2)[:500])

    # Test YouTube specialized search
    url_yt = "https://google.serper.dev/videos"
    payload_yt = json.dumps({
        "q": "best travel destinations 2026 travel vlog",
        "num": 5
    })
    response_yt = requests.request("POST", url_yt, headers=headers, data=payload_yt)
    print("\nSERPER VIDEO SEARCH (YOUTUBE):")
    print(json.dumps(response_yt.json(), indent=2)[:1000])

if __name__ == "__main__":
    test_serper()
