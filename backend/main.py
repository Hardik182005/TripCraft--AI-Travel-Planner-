from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from backend.services.llm_service import LLMService
from backend.services.search_service import SearchService
from backend.services.voice_service import VoiceService

app = FastAPI(title="TripCraft AI API")

# CORS Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Services
llm = LLMService()
search = SearchService()
voice = VoiceService()

# Models
class ChatRequest(BaseModel):
    message: str
    preferences: dict
    history: Optional[List[dict]] = []

class VoiceRequest(BaseModel):
    audio: str # Base64 encoded

@app.get("/trending")
async def get_trending_destinations():
    return search.get_trending()

@app.post("/chat")
async def chat_with_agent(req: ChatRequest):
    try:
        # Search for context - with Fail-Safe
        search_results = ""
        try:
            search_query = f"{req.message} travel tips best places {req.preferences.get('interest', 'culture')}"
            search_results = search.search(search_query)
        except Exception as search_err:
            print(f"Non-critical Search Error: {search_err}")
            # Continue without search results
        
        # Generate response via LLM
        response = llm.generate_itinerary(req.message, req.preferences, search_results, req.history)
        
        return {"response": response}
    except Exception as e:
        print(f"Chat API Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/voice/stt")
async def speech_to_text(req: VoiceRequest):
    text = voice.stt(req.audio)
    if text:
        return {"text": text}
    raise HTTPException(status_code=400, detail="Could not transcribe audio")

@app.post("/voice/tts")
async def text_to_speech(req: dict):
    audio_b64 = voice.tts(req.get("text", ""))
    if audio_b64:
        return {"audio": audio_b64}
    raise HTTPException(status_code=400, detail="Could not generate audio")

# New PDF Itinerary Download Endpoint
@app.post("/download")
async def download_itinerary(req: dict):
    from fpdf import FPDF
    import base64
    import io
    
    text = req.get("itinerary", "")
    pdf = FPDF()
    pdf.add_page()
    pdf.set_margins(20, 20, 20)
    pdf.set_auto_page_break(auto=True, margin=15)
    
    # Title
    pdf.set_font("Arial", 'B', 20)
    pdf.cell(100, 15, "TripCraft AI: Bespoke Journey", 0, 1, 'L')
    pdf.set_font("Arial", 'I', 10)
    pdf.cell(100, 10, "Curated by Atlas AI Assistant", 0, 1, 'L')
    pdf.ln(10)
    pdf.line(20, pdf.get_y(), 190, pdf.get_y())
    pdf.ln(10)
    
    # Body
    pdf.set_font("Arial", size=11)
    for line in text.split('\n'):
        if line.startswith('###'):
            pdf.ln(5)
            pdf.set_font("Arial", 'B', 14)
            pdf.multi_cell(0, 10, line.replace('###', '').strip().encode('latin-1', 'ignore').decode('latin-1'))
            pdf.set_font("Arial", size=11)
        elif line.startswith('---'):
            pdf.ln(5)
            pdf.line(20, pdf.get_y(), 190, pdf.get_y())
            pdf.ln(5)
        else:
            pdf.multi_cell(0, 8, line.encode('latin-1', 'ignore').decode('latin-1'))
        
    pdf_out = pdf.output(dest='S').encode('latin-1')
    return {"pdf": base64.b64encode(pdf_out).decode('utf-8')}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
