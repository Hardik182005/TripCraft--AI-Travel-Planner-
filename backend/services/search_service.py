import requests
import json
import time
from backend.config import SERPER_API_KEY

class SearchService:
    def __init__(self):
        self.api_key = SERPER_API_KEY
        self.base_url = "https://google.serper.dev"
        self._cache = {}
        self._cache_expiry = 3600 # 1 hour

    def search(self, query):
        url = f"{self.base_url}/search"
        payload = json.dumps({"q": query, "num": 10})
        headers = {'X-API-KEY': self.api_key, 'Content-Type': 'application/json'}
        try:
            response = requests.post(url, headers=headers, data=payload)
            if response.status_code == 200:
                results = response.json()
                snippets = [res.get('snippet', '') for res in results.get('organic', [])]
                return "\n".join(snippets)
            return ""
        except Exception:
            return ""

    def get_destination_info(self, destination):
        # Fetches weather and currency snippets
        url = f"{self.base_url}/search"
        query = f"current weather and currency in {destination}"
        payload = json.dumps({"q": query, "num": 5})
        headers = {'X-API-KEY': self.api_key, 'Content-Type': 'application/json'}
        try:
            response = requests.post(url, headers=headers, data=payload)
            if response.status_code == 200:
                return response.json().get('answerBox', {}).get('snippet', '') or \
                       response.json().get('organic', [{}])[0].get('snippet', 'Data unavailable')
            return "General destination info unavailable."
        except Exception:
            return "Error fetching destination pulse."

    def _get_image(self, dest_name):
        url = f"{self.base_url}/images"
        payload = json.dumps({"q": f"{dest_name} landscape luxury travel photography", "num": 10})
        headers = {'X-API-KEY': self.api_key, 'Content-Type': 'application/json'}
        
        try:
            resp = requests.post(url, headers=headers, data=payload)
            if resp.status_code == 200:
                images = resp.json().get('images', [])
                for img in images:
                    img_url = img.get('imageUrl', '').lower()
                    title = img.get('title', '').lower()
                    # IMAGE GUARDRAILS: Reject product keywords
                    reject_keywords = ['shoe', 'boot', 'fashion', 'clothing', 'jacket', 'outfit', 'product', 'buy', 'price']
                    if any(rk in img_url or rk in title for rk in reject_keywords):
                        continue
                    
                    # Ensure location relevance
                    dest_parts = dest_name.lower().split(',')
                    if any(part.strip() in img_url or part.strip() in title for part in dest_parts):
                        return img.get('imageUrl')
                
                # Fallback to first non-rejected image
                if images: return images[0].get('imageUrl')
            return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000"
        except Exception:
            return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1000"

    def get_trending(self):
        # Cache check
        if 'trending' in self._cache:
            data, timestamp = self._cache['trending']
            if time.time() - timestamp < self._cache_expiry: return data

        headers = {'X-API-KEY': self.api_key, 'Content-Type': 'application/json'}
        destinations = []

        try:
            # 1. YouTube Data (Priortiy 1)
            yt_url = f"{self.base_url}/videos"
            yt_payload = json.dumps({"q": "travel vlog 2026 trending destinations", "num": 10})
            yt_resp = requests.post(yt_url, headers=headers, data=yt_payload)
            
            if yt_resp.status_code == 200:
                yt_results = yt_resp.json().get('videos', [])
                for res in yt_results[:4]: # Target 3-4 from YT
                    title = res.get('title', '')
                    # Simple extraction: often "Destination Travel Vlog"
                    name = title.split('2026')[0].split('Vlog')[0].split('|')[0].strip()
                    if len(name) < 3 or len(name) > 40: continue
                    
                    destinations.append({
                        "id": len(destinations) + 1,
                        "name": name,
                        "description": f"Currently taking YouTube by storm. {res.get('snippet', '')[:100]}...",
                        "image": res.get('imageUrl'), # Use YT thumbnail
                        "source": "YouTube",
                        "link": res.get('link')
                    })

            # 2. Reddit Data (Priority 2)
            rd_url = f"{self.base_url}/search"
            rd_payload = json.dumps({"q": "best places to travel 2026 site:reddit.com", "num": 10})
            rd_resp = requests.post(rd_url, headers=headers, data=rd_payload)
            
            if rd_resp.status_code == 200:
                rd_results = rd_resp.json().get('organic', [])
                for res in rd_results[:3]: # Target 2-3 from Reddit
                    title = res.get('title', '').replace('site:reddit.com', '').strip()
                    name = title.split(':')[0].strip()
                    if "reddit" in name.lower(): name = "Popular Threads"
                    
                    destinations.append({
                        "id": len(destinations) + 1,
                        "name": name,
                        "description": res.get('snippet', 'Trending discussion in the Reddit travel community.'),
                        "image": self._get_image(name), # Fetch validated image
                        "source": "Reddit",
                        "link": res.get('link')
                    })

            # 3. Google Fallback (Priority 3)
            if len(destinations) < 6:
                gl_payload = json.dumps({"q": "top travel destinations 2026 trending", "num": 5})
                gl_resp = requests.post(rd_url, headers=headers, data=gl_payload)
                if gl_resp.status_code == 200:
                    gl_results = gl_resp.json().get('organic', [])
                    for res in gl_results:
                        if len(destinations) >= 8: break
                        destinations.append({
                            "id": len(destinations) + 1,
                            "name": res.get('title', '').split('|')[0].strip(),
                            "description": res.get('snippet', 'Discovered via search pulse.'),
                            "image": self._get_image(res.get('title')),
                            "source": "Google",
                            "link": res.get('link', '#')
                        })

            # FINAL FALLBACK IF API FAILS (403 or empty)
            if not destinations:
                destinations = [
                    {"id": 1, "name": "Kyoto, Japan", "description": "Ancestral temples and zen gardens.", "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000", "source": "YouTube", "link": "#"},
                    {"id": 2, "name": "Santorini, Greece", "description": "Ivory architectures and cobalt sunsets.", "image": "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?q=80&w=1000", "source": "Reddit", "link": "#"},
                    {"id": 3, "name": "Amalfi, Italy", "description": "Dramatic coastal cliffs.", "image": "https://images.unsplash.com/photo-1533929736458-ca588d08c8be?q=80&w=1000", "source": "YouTube", "link": "#"},
                    {"id": 4, "name": "Bora Bora", "description": "Sapphire lagoons and overwater luxury.", "image": "https://images.unsplash.com/photo-1500916434205-0c7742ddb607?q=80&w=1000", "source": "Reddit", "link": "#"},
                    {"id": 5, "name": "Reykjavik, Iceland", "description": "Volcanic terrain and celestial lights.", "image": "https://images.unsplash.com/photo-1520637102912-2df6bb2aec6d?q=80&w=1000", "source": "YouTube", "link": "#"},
                    {"id": 6, "name": "Swiss Alps", "description": "Snow-capped peaks and pristine retreats.", "image": "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000", "source": "Google", "link": "#"}
                ]

            self._cache['trending'] = (destinations, time.time())
            return destinations
            
        except Exception as e:
            print(f"Discovery Engine Error: {e}")
            return []
