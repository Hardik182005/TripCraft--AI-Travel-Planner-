import requests
import streamlit as st
import base64

class VoiceService:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.elevenlabs.io/v1"

    def tts(self, text, voice_id="pNInz6obpgH9GO04R66R"): # Adam voice
        url = f"{self.base_url}/text-to-speech/{voice_id}"
        headers = {
            "Accept": "audio/mpeg",
            "Content-Type": "application/json",
            "xi-api-key": self.api_key
        }
        data = {
            "text": text,
            "model_id": "eleven_monolingual_v1",
            "voice_settings": {
                "stability": 0.5,
                "similarity_boost": 0.5
            }
        }
        response = requests.post(url, json=data, headers=headers)
        if response.status_code == 200:
            return response.content
        return None

    def play_audio(self, audio_content):
        b64 = base64.b64encode(audio_content).decode()
        md = f"""
            <audio autoplay="true">
            <source src="data:audio/mp3;base64,{b64}" type="audio/mp3">
            </audio>
            """
        st.markdown(md, unsafe_allow_html=True)

    def stt(self, audio_bytes):
        """Transcribe audio using Gemini 1.5 Pro."""
        try:
            import google.generativeai as genai
            import os
            api_key = st.secrets.get("GEMINI_API_KEY") or os.getenv("GEMINI_API_KEY")
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-1.5-flash')
            
            # Create a temporary file for the audio
            import tempfile
            with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
                tmp.write(audio_bytes)
                tmp_path = tmp.name
                
            # Upload to Gemini
            audio_file = genai.upload_file(path=tmp_path)
            response = model.generate_content([
                "Transcribe this audio. Return only the transcription text.",
                audio_file
            ])
            return response.text
        except Exception as e:
            st.error(f"STT Error: {e}")
            return None
