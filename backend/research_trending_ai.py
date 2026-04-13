import requests
import json
from config import SERPER_API_KEY

def research():
    headers = {'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json'}
    
    # 1. YouTube Research
    yt_payload = json.dumps({"q": "travel vlog 2026 trending destinations", "num": 10})
    yt_resp = requests.post("https://google.serper.dev/videos", headers=headers, data=yt_payload)
    print("YOUTUBE RESULTS SNIPPET:")
    print(json.dumps(yt_resp.json().get('videos', [])[:3], indent=2))

    # 2. Reddit Research
    rd_payload = json.dumps({"q": "best places to travel 2026 site:reddit.com", "num": 10})
    rd_resp = requests.post("https://google.serper.dev/search", headers=headers, data=rd_payload)
    print("\nREDDIT RESULTS SNIPPET:")
    print(json.dumps(rd_resp.json().get('organic', [])[:3], indent=2))

research()
