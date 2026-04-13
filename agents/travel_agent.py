import google.generativeai as genai
import streamlit as st

class TripCraftAgent:
    def __init__(self, gemini_key, serper_key):
        self.gemini_key = gemini_key
        self.serper_key = serper_key
        genai.configure(api_key=self.gemini_key)
        self.model = genai.GenerativeModel('gemini-1.5-pro')

    def generate_itinerary(self, destination, preferences, search_results):
        prompt = f"""
        You are an expert travel planner. Create a highly detailed, luxurious, and practical travel itinerary for {destination}.
        
        USER PREFERENCES:
        - Budget: {preferences.get('budget')}
        - Transport: {preferences.get('transport')}
        - Accommodation: {preferences.get('hotel')}
        - Duration: {preferences.get('duration')} days
        - Interests: {preferences.get('interests')}
        
        RESEARCH DATA (Use this for real locations and prices):
        {search_results}
        
        STRUCTURE:
        1. Overview of the trip.
        2. Daily breakdown (Day 1, Day 2, etc.) with Morning, Afternoon, and Evening activities.
        3. Specific restaurant recommendations.
        4. Transporation tips within the city.
        5. Estimated budget breakdown.
        
        FORMAT: Use Markdown with clear headings and bullet points. Use emojis to make it engaging.
        """
        
        response = self.model.generate_content(prompt)
        return response.text

    def get_search_query(self, destination, preferences):
        return f"best places to visit in {destination} for {preferences.get('interests')} with {preferences.get('budget')} budget"
