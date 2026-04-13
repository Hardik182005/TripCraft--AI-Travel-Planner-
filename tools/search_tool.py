import requests
import json

class SearchTool:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://google.serper.dev/search"

    def search(self, query):
        payload = json.dumps({"q": query})
        headers = {
            'X-API-KEY': self.api_key,
            'Content-Type': 'application/json'
        }
        response = requests.post(self.base_url, headers=headers, data=payload)
        return response.json()

    def get_trending_destinations(self):
        # Dynamically fetch trending destinations for the current month
        query = "trending travel destinations April 2026"
        results = self.search(query)
        
        destinations = []
        if 'organic' in results:
            for item in results['organic'][:5]:
                destinations.append({
                    "name": item.get('title', 'Unknown'),
                    "description": item.get('snippet', 'Explore the world'),
                    "link": item.get('link', '#'),
                    "image": "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop" # Placeholder
                })
        return destinations
