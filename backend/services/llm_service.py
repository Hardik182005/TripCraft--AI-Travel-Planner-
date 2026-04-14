import google.generativeai as genai
from groq import Groq
from backend.config import GEMINI_API_KEY, GROQ_API_KEY

class LLMService:
    def __init__(self):
        # Initialize Gemini 2.0 Flash with a quick Health Check
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-2.0-flash')
            # Fast health check to avoid hangs later
            self.model.generate_content("Health check", generation_config={"max_output_tokens": 1})
            print("Gemini 2.0 Flash initialized and verified.")
        except Exception as e:
            print(f"Gemini verification failed (likely quota or model name): {e}")
            self.model = genai.GenerativeModel('gemini-1.5-flash') # Fallback to 1.5
            print("Falling back to Gemini 1.5 Flash.")

        # Initialize Groq as Fallback
        try:
            self.groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
            if self.groq_client:
                 print("Groq fallback engine ready.")
        except Exception as e:
            print(f"Failed to initialize Groq: {e}")
            self.groq_client = None

    def identify_location_from_image(self, base64_image):
        """Uses Gemini Vision to identify a location from a photo."""
        if not self.model: return None
        import base64
        import io
        from PIL import Image

        try:
            # Prepare image for Gemini
            img_data = base64.b64decode(base64_image)
            img = Image.open(io.BytesIO(img_data))
            
            prompt = "Precisely identify this travel location, hotel, or landmark. Return only the name and city/country. If it's a general scene, describe it as a travel destination."
            response = self.model.generate_content([prompt, img])
            return response.text.strip()
        except Exception as e:
            print(f"Vision Error: {e}")
            return None

    def _generate_with_groq(self, prompt, context=""):
        if not self.groq_client: return None
        try:
            print("Gemini failed/unavailable. Falling back to Groq (Llama-3.3)...")
            completion = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are 'Atlas', an elite world-class travel agent."},
                    {"role": "user", "content": prompt}
                ]
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Groq Fallback Error: {e}")
            return None

    def generate_itinerary(self, destination, preferences, search_results, history=None):
        if not self.model and not self.groq_client:
            return "AI Engine is not initialized. Please check your API keys."

        context = ""
        if history:
            for msg in history[-5:]:
                context += f"{msg['role'].upper()}: {msg['content']}\n"

        duration = preferences.get('duration', 5)
        if preferences.get('useCustomDuration') and preferences.get('customDuration'):
            duration = preferences.get('customDuration')

        personality_guide = {
            "Minimalist": "Be extremely brief, high-end, and efficient. Use bullet points and focus on exclusivity.",
            "Storyteller": "Be descriptive, poetic, and immersive. Paint a vivid picture of the culture and smells of the destination.",
            "Professional": "Be ultra-polished, data-driven, and formal like a high-end private concierge."
        }.get(preferences.get('personality', 'Professional'), "Be an elite travel architect.")

        # EXPERT DEBATE: Simulated internal reasoning
        expert_debate = f"""
        - (Culinary Critic): "For {destination}, I'm prioritizing Michelin-level {preferences.get('food', 'local')} spots that match a {preferences.get('budget', 'Luxury')} lifestyle."
        - (Adventure Lead): "Focusing on {preferences.get('intensity', 'Moderate')} activities with high {preferences.get('interest', 'Culture')} value."
        - (Logistics Architect): "Optimizing for {preferences.get('group', 'Solo')} safety and seamless {preferences.get('transport', 'Flight')} connectivity."
        """

        prompt = f"""
        You are 'Atlas', {personality_guide}
        Your mission is to design a breathtaking, high-end travel itinerary for {destination}.
        
        INTERNAL EXPERT DEBATE (Insights):
        {expert_debate}
        
        CONTEXT FROM CONVERSATION:
        {context}
        
        USER PROFILE & PREFERENCES:
        - Budget: {preferences.get('budget', 'Luxury')}
        - Group Type: {preferences.get('group', 'Solo')}
        - Stay Type: {preferences.get('stay', 'Hotel')}
        - Duration: {duration} days
         - Primary Interest: {preferences.get('interest', 'Culture')}
         - HERITAGE DIETARY ARCHITECT: {preferences.get('dietary', 'non-veg')} (IMPORTANT: If Jain, strictly exclude onions, garlic, and root vegetables. If Vegetarian, strictly exclude meat/fish. If Eggitarian, allow vegetables and eggs only.)
        
        RESEARCH DATA & LIVE PULSE:
        {search_results or "Real-time research temporarily unavailable."}
        
        REQUIREMENTS:
        1. Professional Tone: Use elegant, sophisticated language.
        2. INTEGRATE LIVE PULSE: You MUST use the weather, currency, safety, and crowd levels from the 'RESEARCH DATA' section.
        3. Daily Breakdown: Morning, Afternoon, and Evening activities.
        4. OUTFIT ARCHITECT: Include a '### 🧥 Bespoke Dress Code' section for each day (e.g., 'Layered lightweight cashmere for a 16°C afternoon').
        5. Smart AI Packing Architect: At the end, add '### 🎒 Bespoke Packing Architect' based on the weather.
        6. AI Budget Realism Explorer: At the end, add '### 💰 Budget Realism Explorer' breakdown.
        7. Instagrammable Moments: Sprinkle the 'AESTHETIC SPOTS' throughout.
        8. Format: Clean Markdown with ### Day X. NO Emojis (except in the section headers I specified).
        """
        
        # Primary Attempt: Gemini
        if self.model:
            try:
                # Add a protective timeout or check if possible
                response = self.model.generate_content(prompt)
                if response and response.text:
                    return response.text
            except Exception as e:
                print(f"Gemini Generation Error: {e}")
                if "leaked" in str(e).lower():
                     return "CRITICAL ERROR: Your API key has been reported as leaked."
        
        # Fallback Attempt: Groq (Logic reaches here if Gemini failed or was skipped)
        fallback_res = self._generate_with_groq(prompt)
        if fallback_res: return fallback_res
        
        return "AI Engine failure. All providers (Gemini/Groq) rejected the request."

    def chat(self, user_input, history=None):
        if not self.model and not self.groq_client:
            return "AI Engine is not initialized."
            
        # Primary Attempt: Gemini
        if self.model:
            chat_history = []
            if history:
                for msg in history:
                    role = "user" if msg['role'] == 'user' else "model"
                    chat_history.append({"role": role, "parts": [msg['content']]})
            
            try:
                chat_session = self.model.start_chat(history=chat_history)
                response = chat_session.send_message(user_input)
                return response.text
            except Exception as e:
                print(f"Gemini Chat Error: {e}")
                if "leaked" in str(e).lower():
                     return "CRITICAL ERROR: Your API key has been reported as leaked."

        # Fallback Attempt: Groq
        try:
            messages = [{"role": "system", "content": "You are 'Atlas', an elite world-class travel agent."}]
            if history:
                for msg in history[-5:]:
                    messages.append({"role": msg['role'], "content": msg['content']})
            messages.append({"role": "user", "content": user_input})
            
            completion = self.groq_client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=messages
            )
            return completion.choices[0].message.content
        except Exception as e:
            print(f"Groq Chat Fallback Error: {e}")
            return "AI Chat failed on all providers."

