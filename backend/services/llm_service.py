import google.generativeai as genai
from groq import Groq
from backend.config import GEMINI_API_KEY, GROQ_API_KEY

class LLMService:
    def __init__(self):
        # Initialize Gemini with a quick Health Check
        try:
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-flash-latest')
            # Fast health check to avoid hangs later
            self.model.generate_content("Health check", generation_config={"max_output_tokens": 1})
            print("Gemini initialized and verified.")
        except Exception as e:
            print(f"Gemini verification failed (likely quota): {e}")
            self.model = None

        # Initialize Groq as Fallback
        try:
            self.groq_client = Groq(api_key=GROQ_API_KEY) if GROQ_API_KEY else None
            if self.groq_client:
                 print("Groq fallback engine ready.")
        except Exception as e:
            print(f"Failed to initialize Groq: {e}")
            self.groq_client = None

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

        prompt = f"""
        You are 'Atlas', an elite world-class travel agent. Your mission is to design a breathtaking, high-end travel itinerary for {destination}.
        
        CONTEXT FROM CONVERSATION:
        {context}
        
        USER PROFILE & PREFERENCES:
        - Budget: {preferences.get('budget', 'Luxury')}
        - Group Type: {preferences.get('group', 'Solo')}
        - Stay Type: {preferences.get('stay', 'Hotel')}
        - Duration: {duration} days
        - Food Preference: {preferences.get('food', 'Local')}
        - Activity Intensity: {preferences.get('intensity', 'Moderate')}
        - Primary Interest: {preferences.get('interest', 'Culture')}
        
        RESEARCH DATA & LIVE PULSE (IMPORTANT):
        {search_results or "Real-time research temporarily unavailable."}
        
        REQUIREMENTS:
        1. Professional Tone: Use elegant, sophisticated language.
        2. INTEGRATE LIVE PULSE: You MUST use the weather and currency info from the 'LIVE PULSE' section above to give real-time, ground-level advice.
        3. Daily Breakdown: Morning, Afternoon, and Evening activities.
        4. Real Recommendations: Mention specific hotels/restaurants from the research.
        5. Format: Clean Markdown with ### Day X and **Venue Name**. STRICTLY NO Emojis.
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

