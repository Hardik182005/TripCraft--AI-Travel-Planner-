# ✈️ TripCraft: AI-Powered Travel Architect

TripCraft is a production-level AI travel assistant that generates personalized itineraries using a multi-agent orchestration of professional travel intelligence. It combines real-time data from across the web with a premium, minimalist UX.

---

## 🧠 Core Intelligence

TripCraft leverages a state-of-the-art AI stack to deliver breathtaking journeys:
- **Gemini 2.5 Flash**: The elite LLM engine behind the Atlas AI Assistant.
- **Serper API**: Real-time discovery of global events and travel data.
- **Multi-Source Discovery**: Trends curated from **YouTube** vlogs, **Reddit** discussions, and **Google Search**.
- **ElevenLabs API**: High-fidelity AI voice synthesis for a true concierge experience.

---

## ✨ Features

- **Multi-Agent Travel Planning**: Atlas orchestrates search, design, and insight gathering in real-time.
- **🌍 Real-Time Trending Destinations**: Dynamic discovery sourced from social pulses (YouTube + Reddit + Google).
- **🎤 Voice Assistant**: Integrated STT (Speech-to-Text) and TTS (Text-to-Speech) for immersive planning.
- **📄 Bespoke PDF Export**: Download your curated itinerary as a professionally formatted PDF.
- **🎨 Premium UI**: Exquisite glassmorphism design with Framer Motion animations and "Playfair Display" typography.
- **🧳 Custom Preferences**: Tailor trips by budget, duration, travel mode, and activity levels.
- **⚡ 1-Click Planning**: Instantly move from a trending destination card to a full AI-generated itinerary.

---

## 🛠️ Tech Stack

### Frontend
- **React (Vite)**
- **Tailwind CSS v4**
- **Framer Motion** (Animations)
- **Lucide React** (Iconography)

### Backend
- **FastAPI** (Python)
- **Generative AI** (Gemini 2.5 Flash)
- **FPDF** (Document Generation)

---

## 🚀 How to Run

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r ../requirements.txt
   ```
3. Run the server:
   ```bash
   python main.py
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Launch the portal:
   ```bash
   npm run dev
   ```

---

## 🔑 Environment Variables

Create a `.env` file in the root or backend directory using `.env.example` as a template:

```env
GEMINI_API_KEY=your_key
SERPER_API_KEY=your_key
ELEVENLABS_API_KEY=your_key
```

---

## 📸 Interface Preview

*(Add your high-resolution screenshots here to showcase the glassmorphism UI)*

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.