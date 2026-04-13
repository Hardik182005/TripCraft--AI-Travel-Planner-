import requests
import json
from config import SERPER_API_KEY

def research():
    headers = {'X-API-KEY': SERPER_API_KEY, 'Content-Type': 'application/json'}
    
    # 1. Generic Search
    resp = requests.post("https://google.serper.dev/search", headers=headers, data=json.dumps({"q": "test"}))
    print(f"Generic Search Status: {resp.status_code}")
    print(resp.text[:100])

    # 2. Images Search
    img_resp = requests.post("https://google.serper.dev/images", headers=headers, data=json.dumps({"q": "test"}))
    print(f"Images Search Status: {img_resp.status_code}")
    
    # 3. Videos Search
    vid_resp = requests.post("https://google.serper.dev/videos", headers=headers, data=json.dumps({"q": "test"}))
    print(f"Videos Search Status: {vid_resp.status_code}")

research()
