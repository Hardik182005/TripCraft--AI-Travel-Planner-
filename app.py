import streamlit as st
import time
import os
from dotenv import load_dotenv
from utils.styles import apply_styles, header
from agents.travel_agent import TripCraftAgent
from tools.search_tool import SearchTool
from tools.pdf_generator import generate_itinerary_pdf
from voice.elevenlabs_service import VoiceService
from streamlit_mic_recorder import mic_recorder
import json

# Load environment variables
load_dotenv()

# API KEYS
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SERPER_API_KEY = os.getenv("SERPER_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# Initialize Services
agent = TripCraftAgent(GEMINI_API_KEY, SERPER_API_KEY)
search_tool = SearchTool(SERPER_API_KEY)
voice_service = VoiceService(ELEVENLABS_API_KEY)

# Session State Initialization
if "messages" not in st.session_state:
    st.session_state.messages = []
if "sidebar_state" not in st.session_state:
    st.session_state.sidebar_state = "expanded"
if "itinerary" not in st.session_state:
    st.session_state.itinerary = None

st.set_page_config(page_title="TripCraft - AI Travel Planner", page_icon="✈️", layout="wide")
apply_styles()
header()

# Sidebar - Preferences & Trending
with st.sidebar:
    st.image("https://img.icons8.com/color/96/airport.png", width=80)
    st.title("Settings & Preferences")
    
    with st.expander("🌍 User Preferences", expanded=True):
        budget = st.selectbox("Budget", ["Low", "Medium", "Luxury"], index=1)
        transport = st.multiselect("Transport Mode", ["Flight", "Train", "Bus", "Car Rental"], default=["Flight"])
        hotel = st.selectbox("Accommodation", ["3-star", "4-star", "5-star", "Airbnb"], index=1)
        duration = st.slider("Trip Duration (Days)", 1, 30, 5)
        interests = st.multiselect("Interests", ["Beach", "Adventure", "Food", "Culture", "Nightlife", "History"], default=["Food", "Culture"])
        
    st.markdown("---")
    st.markdown("### 🔥 Trending Destinations")
    
    # Try to fetch trending, fallback to static if takes too long
    try:
        trending = search_tool.get_trending_destinations()
    except:
        trending = [
            {"name": "Kyoto, Japan", "description": "Cherry blossoms and temples", "image": "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000&auto=format&fit=crop"},
            {"name": "Santorini, Greece", "description": "Blue domes and sunsets", "image": "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1000&auto=format&fit=crop"},
            {"name": "Amalfi Coast, Italy", "description": "Stunning coastlines", "image": "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1000&auto=format&fit=crop"}
        ]
        
    for dest in trending:
        with st.container():
            st.markdown(f"""
                <div class='trending-card' style='padding: 10px; margin-bottom: 15px;'>
                    <img src="{dest['image']}" style="width: 100%; border-radius: 10px;">
                    <h4 style="margin: 10px 0 5px 0;">{dest['name']}</h4>
                    <p style="font-size: 0.8em; color: #94a3b8;">{dest['description']}</p>
                </div>
            """, unsafe_allow_html=True)
            if st.button(f"Plan {dest['name']}", key=dest['name']):
                st.session_state.prompt = f"Plan a trip to {dest['name']}"

# Main Planning Area
col1, col2 = st.columns([2, 1])

with col1:
    st.markdown("### 🗺️ Your Travel Assistant")
    
    # Chat History
    chat_container = st.container(height=500)
    for message in st.session_state.messages:
        with chat_container:
            div_class = "chat-user" if message["role"] == "user" else "chat-assistant"
            st.markdown(f"<div class='{div_class}'>{message['content']}</div>", unsafe_allow_html=True)

    # Input Area
    prompt = st.chat_input("Where do you want to go?")
    
    # Voice Input
    st.markdown("Alternatively, use voice:")
    audio = mic_recorder(start_prompt="🎤 Start Recording", stop_prompt="🛑 Stop", key='recorder')
    
    if audio:
        with st.status("🔊 Transcribing Voice...", expanded=False):
            # audio['bytes'] contains the raw audio data
            transcribed_text = voice_service.stt(audio['bytes'])
            if transcribed_text:
                prompt = transcribed_text
                st.write(f"Voice recognized: '{prompt}'")
            else:
                st.error("Could not transcribe voice. Please try typing.")

    if prompt or "prompt" in st.session_state:
        if "prompt" in st.session_state:
            prompt = st.session_state.prompt
            del st.session_state.prompt

        st.session_state.messages.append({"role": "user", "content": prompt})
        with chat_container:
            st.markdown(f"<div class='chat-user'>{prompt}</div>", unsafe_allow_html=True)

        with st.status("🧠 Agent Thinking...", expanded=True) as status:
            st.write("🔍 Searching for destinations...")
            search_query = agent.get_search_query(prompt, {"budget": budget, "interests": interests})
            search_data = search_tool.search(search_query)
            
            st.write("🌐 Scraping travel data and prices...")
            time.sleep(1)
            
            st.write("📊 Optimizing itinerary...")
            prefs = {
                "budget": budget,
                "transport": transport,
                "hotel": hotel,
                "duration": duration,
                "interests": interests
            }
            itinerary = agent.generate_itinerary(prompt, prefs, search_data)
            st.session_state.itinerary = itinerary
            
            st.write("🔊 Generating voice summary...")
            audio_content = voice_service.tts(f"I have created your itinerary for {prompt}. You can view the details on the screen.")
            
            status.update(label="✅ Itinerary Ready!", state="complete", expanded=False)

        st.session_state.messages.append({"role": "assistant", "content": itinerary})
        with chat_container:
            st.markdown(f"<div class='chat-assistant'>{itinerary}</div>", unsafe_allow_html=True)
            if audio_content:
                voice_service.play_audio(audio_content)

with col2:
    st.markdown("### 📁 Downloads & Maps")
    if st.session_state.itinerary:
        pdf_data = generate_itinerary_pdf(st.session_state.itinerary)
        st.download_button(
            label="📄 Download PDF Itinerary",
            data=pdf_data,
            file_name="itinerary.pdf",
            mime="application/pdf"
        )
        
        # Map Visualization (Simplified)
        st.markdown("#### 📍 Map Overview")
        # For a professional map, we'd use lat/lon from search results
        # Here we'll show a placeholder map
        st.map() 

    else:
        st.info("Start planning to see downloads and maps!")

# Add a floating "Top" button or footer
st.markdown("---")
st.markdown("<p style='text-align: center; color: #64748b;'>© 2026 TripCraft AI. Designed for explorers.</p>", unsafe_allow_html=True)
