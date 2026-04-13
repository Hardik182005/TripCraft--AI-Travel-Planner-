import google.generativeai as genai
from backend.config import GEMINI_API_KEY

class LLMService:
    def __init__(self):
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-2.5-flash')

    def generate_itinerary(self, destination, preferences, search_results, history=None):
        context = ""
        if history:
            for msg in history[-5:]:
                context += f"{msg['role'].upper()}: {msg['content']}\n"

        # Handle custom duration vs preset duration
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
        
        RESEARCH DATA (Use for specific venues and current pricing):
        {search_results or "Real-time research temporarily unavailable. Rely on your internal elite knowledge to provide accurate suggestions."}
        
        REQUIREMENTS:
        1. Professional Tone: Use elegant, sophisticated language.
        2. Daily Breakdown: Morning, Afternoon, and Evening activities with a logical flow.
        3. Real Recommendations: Mention specific hotels, restaurants, and tours from the research data.
        4. Budget Context: Ensure recommendations align with the '{preferences.get('budget')}' budget.
        5. Smart Follow-up: End with a thoughtful question (e.g., 'Would you like me to book a table at the suggested restaurant for Night 2?').
        
        FORMAT:
        Use clean, exquisite Markdown. 
        - Use '### Day X: [Name]' for daily headers.
        - Use '**[Venue Name]**' for specific locations and restaurants.
        - Use '---' to separate major sections.
        - Sprinkle emojis thoughtfully to maintain a high-end travel concierge feel.
        - End with a unique 'Atlas Insight' tip or question.
        """
        
        response = self.model.generate_content(prompt)
        return response.text

    def chat(self, user_input, history=None):
        chat_history = []
        if history:
            for msg in history:
                role = "user" if msg['role'] == 'user' else "model"
                chat_history.append({"role": role, "parts": [msg['content']]})
        
        chat_session = self.model.start_chat(history=chat_history)
        response = chat_session.send_message(user_input)
        return response.text
