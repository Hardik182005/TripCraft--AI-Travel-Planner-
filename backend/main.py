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
        # Pre-process message (Clean voice artifacts like '[noise] H-hi' -> 'hi')
        import re
        # Remove anything in brackets [noise] or parentheses (ubersprechen)
        clean_msg = re.sub(r'\[.*?\]|\(.*?\)|\*.*?\*', '', req.message).strip()
        # Remove punctuation like H-hi -> hi
        clean_msg = re.sub(r'[^\w\s]', '', clean_msg).lower()
        
        # Generate response via LLM - Smart Routing
        is_greeting = any(greet in clean_msg for greet in ['hi', 'hello', 'hey', 'greetings', 'yo']) and len(clean_msg.split()) < 4
        
        if is_greeting:
            response = llm.chat(req.message, req.history) # Use original message for context but handled as chat
            return {"response": response, "image": None, "pulse": None, "destination": None}
        else:
            # Smart Destination Extraction for Pulse & Maps
            target_dest = req.message
            # Simple regex to find destination after "to " or "in "
            dest_match = re.search(r'(?:to|in|at|visit|about|planning)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', req.message)
            if dest_match:
                target_dest = dest_match.group(1)
            elif len(req.message.split()) < 4:
                target_dest = clean_msg # Use the single word as destination
            
            # Only search for context if it's a real query
            search_results = ""
            dest_image = None
            dest_pulse = None
            try:
                # 1. Image Discovery
                dest_image = search._get_image(target_dest)
                # 2. Live Pulse (Weather/Currency)
                dest_pulse = search.get_destination_info(target_dest)
                
                search_query = f"{target_dest} travel tips best places {req.preferences.get('interest', 'culture')}"
                search_results = search.search(search_query)
                # Inject pulse into search results for LLM context
                search_results = f"LIVE PULSE FOR {target_dest}: {dest_pulse}\n\n{search_results}"
            except Exception as search_err:
                print(f"Non-critical Search Error: {search_err}")
                
            response = llm.generate_itinerary(req.message, req.preferences, search_results, req.history)
            return {
                "response": response, 
                "image": dest_image, 
                "pulse": dest_pulse,
                "destination": target_dest
            }
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
    pdf.cell(100, 15, "TripCraft AI: Bespoke Journey".encode('latin-1', 'ignore').decode('latin-1'), 0, 1, 'L')
    pdf.set_font("Arial", 'I', 10)
    pdf.cell(100, 10, "Curated by Atlas AI Assistant".encode('latin-1', 'ignore').decode('latin-1'), 0, 1, 'L')
    pdf.ln(10)
    pdf.line(20, pdf.get_y(), 190, pdf.get_y())
    pdf.ln(10)
    
    # Body
    pdf.set_font("Arial", size=11)
    for line in text.split('\n'):
        # Clean line of non-latin-1 characters to prevent crashes
        clean_line = line.encode('latin-1', 'ignore').decode('latin-1')
        if line.startswith('###'):
            pdf.ln(5)
            pdf.set_font("Arial", 'B', 14)
            pdf.multi_cell(0, 10, clean_line.replace('###', '').strip())
            pdf.set_font("Arial", size=11)
        elif line.startswith('---'):
            pdf.ln(5)
            pdf.line(20, pdf.get_y(), 190, pdf.get_y())
            pdf.ln(5)
        else:
            pdf.multi_cell(0, 8, clean_line)
        
    pdf_bytes = pdf.output(dest='S')
    if isinstance(pdf_bytes, str):
        pdf_bytes = pdf_bytes.encode('latin-1', 'ignore')
    return {"pdf": base64.b64encode(pdf_bytes).decode('utf-8')}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
