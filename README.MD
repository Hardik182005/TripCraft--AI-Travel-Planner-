# TripCraft - AI Travel Planner ✈️

TripCraft is a production-level AI travel assistant that transforms your travel dreams into detailed, actionable itineraries. Built with **Streamlit**, **Gemini 1.5 Pro**, **Serper**, and **ElevenLabs**, it offers a premium, modern, and voice-enabled experience.

## ✨ Features

- **🚀 Advanced Agent Logic**: Powered by Google Gemini 1.5 Pro for intelligent itinerary generation.
- **🌐 Real-time Web Search**: Uses Serper API to fetch the latest travel trends, prices, and locations.
- **🔊 Voice Interface**: 
  - **Text-to-Speech (TTS)**: Agent responds with a natural voice using ElevenLabs.
  - **Speech-to-Text (STT)**: Speak your travel plans instead of typing.
- **💎 Premium UI/UX**: 
  - Modern Glassmorphism design.
  - Real-time agent transparency (step-by-step thinking).
  - Trending destinations section with auto-planning.
- **🧳 Personalization**: Structured preference collection (Budget, Transport, Interests, etc.).
- **📄 Export to PDF**: Download your professionally formatted itinerary instantly.
- **📍 Map Visualization**: Interactive map overview of your destination.

## 🛠️ Tech Stack

- **Frontend**: Streamlit
- **LLM**: Google Gemini 1.5 Pro/Flash
- **Search**: Serper.dev
- **Voice**: ElevenLabs (TTS) + Gemini (STT)
- **PDF**: FPDF

## 🚀 Getting Started

### 1. Installation

```bash
pip install -r requirements.txt
```

### 2. Configuration

API Keys are currently nested in the code for easy demonstration as requested. In production, move these to `st.secrets` or `.env`.

- **Gemini Key**: [Redacted]
- **Serper Key**: [Redacted]
- **ElevenLabs Key**: [Redacted]

### 3. Run the App

```bash
streamlit run app.py
```

## 📂 Project Structure

- `app.py`: Main entry point.
- `agents/`: AI logic and prompt engineering.
- `tools/`: Search, PDF generation, and mapping tools.
- `voice/`: TTS and STT services.
- `utils/`: UI styling and helper functions.

---
Created with ❤️ for modern travelers.