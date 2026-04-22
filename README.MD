# ✈️ TripCraft: Next-Gen AI Travel Architect

TripCraft is an elite, production-grade AI travel concierge that architect's personalized journeys using a multi-agent orchestration of professional travel intelligence. It features a stunning glassmorphism interface and a natural **Speech-to-Speech (S2S)** interaction model.

---

## 🚀 NEW: Premium Upgrade Features
- **🎙️ Speech-to-Speech (S2S)**: Natural, sales-agent style voice interaction using **ElevenLabs (George)** and **Groq (Llama 3.3)** for near-zero latency audio.
- **🖼️ Hero Visual Discovery**: Atlas automatically finds high-resolution "Journey Visuals" for every itinerary generated.
- **🛰️ Live Destination Pulse**: Integrated real-time **Weather** and **Currency** data for minden destinations.
- **📍 Interactive Maps**: 1-click exploration for every planned trip.
- **🧠 Intelligent Routing**: Advanced message cleaning and intent detection (distinguishes casual "Hi" from travel requests).
- **🛡️ Resilience Engine**: Automatic proactive fallback from Gemini to **Groq (Llama-3.3-70b)** if quota limits are hit.

---

## 🧠 Core Intelligence
TripCraft leverages a state-of-the-art AI stack:
- **Gemini 2.5 Flash**: The primary elite LLM engine.
- **Groq (Llama 3.3 70B)**: Ultra-fast fallback engine for high availability.
- **Serper API**: Real-time discovery of global events and travel data.
- **ElevenLabs API**: High-fidelity AI voice synthesis (Multilingual v2).

---

## ✨ Features
- **Multi-Agent Orchestration**: Parallel processing of search, insight gathering, and itinerary design.
- **🌍 Real-Time Trending**: Live discovery from **YouTube**, **Reddit**, and **Google Pulse**.
- **📄 Bespoke PDF Export**: Pro-formatted itineraries ready for offline use (stripped of emojis for system compatibility).
- **🎨 Elite UI/UX**: Exquisite glassmorphism design with Framer Motion animations and "Playfair Display" typography.
- **🎤 Immersive Voice**: Integrated STT and TTS for a hands-free planning experience.

---

## 🛠️ Tech Stack
### Frontend
- **React (Vite)** + **Tailwind CSS v4**
- **Framer Motion** (Animations)
- **Lucide React** (Iconography)

### Backend
- **FastAPI** (Python)
- **ElevenLabs** (Speech Synthesis)
- **FPDF** (Document Architecture)

---

## 🚀 How to Run

### Backend Setup
1. Navigate to `backend/`
2. Install dependencies: `pip install -r ../requirements.txt`
3. Launch: `python -m backend.main`

### Frontend Setup
1. Navigate to `frontend/`
2. Install: `npm install`
3. Launch: `npm run dev`

---

## 🔑 Environment Variables
Required in `.env`:
```env
GEMINI_API_KEY=...
GROQ_API_KEY=...
SERPER_API_KEY=...
ELEVENLABS_API_KEY=...
```

---

## 📄 License
MIT License - Developed for elite travel planning.
