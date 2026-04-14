import requests
import base64
from backend.config import ELEVENLABS_API_KEY

class VoiceService:
    def __init__(self):
        self.api_key = ELEVENLABS_API_KEY
        self.base_url = "https://api.elevenlabs.io/v1"

    def tts(self, text, voice_id="JBFqnCBsd6RMkjVDRZzb"):
        # Default is 'George' (Elite Concierge)
        # Other options: 'EXAVITQu4vr4xnSDxMaL' (Bella - Soft Elegance)
        # 'pMs7uSoxq6IG76ZMo7vW' (Alfie - British Gentleman)
        url = f"{self.base_url}/text-to-speech/{voice_id}"
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.api_key
        }
        data = {
            "text": text,
            "model_id": "eleven_multilingual_v2",
            "voice_settings": {"stability": 0.5, "similarity_boost": 0.5}
        }
        try:
            response = requests.post(url, json=data, headers=headers)
            if response.status_code == 200:
                return base64.b64encode(response.content).decode('utf-8')
        except Exception as e:
            print(f"TTS Error: {e}")
        return None

    def stt(self, audio_data_b64):
        # ElevenLabs Scribe STT
        url = f"{self.base_url}/speech-to-text"
        headers = {"xi-api-key": self.api_key}
        
        try:
            audio_bytes = base64.b64decode(audio_data_b64)
            files = {'file': ('audio.wav', audio_bytes, 'audio/wav')}
            data = {'model_id': 'scribe_v1'}
            
            response = requests.post(url, headers=headers, files=files, data=data)
            if response.status_code == 200:
                return response.json().get('text', '')
        except Exception as e:
            print(f"STT Error: {e}")
        return None
