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
    image_data: Optional[str] = None # Base64 Vision input

class VoiceRequest(BaseModel):
    audio: str # Base64 encoded

@app.get("/trending")
async def get_trending_destinations():
    return search.get_trending()

@app.post("/chat")
async def chat_with_agent(req: ChatRequest):
    try:
        # Vision Intelligence: Identify location/photo
        vision_dest = None
        if req.image_data:
            vision_dest = llm.identify_location_from_image(req.image_data)
            if vision_dest:
                print(f"Vision Identified Location: {vision_dest}")

        # Pre-process message (Clean voice artifacts like '[noise] H-hi' -> 'hi')
        import re
        # Remove anything in brackets [noise] or parentheses (ubersprechen)
        clean_msg = re.sub(r'\[.*?\]|\(.*?\)|\*.*?\*', '', req.message).strip()
        # Remove punctuation like H-hi -> hi
        clean_msg = re.sub(r'[^\w\s]', '', clean_msg).lower()
        
        is_chat = any(greet in clean_msg for greet in ['hi', 'hello', 'hey', 'how are you', 'what is', 'who are', 'thank']) and len(clean_msg.split()) < 5
        
        if is_chat:
            response = llm.chat(req.message, req.history)
            return {
                "response": response, 
                "image": None, 
                "pulse": None, 
                "video": None,
                "crowd": None,
                "phrases": None,
                "heatmap": None,
                "destination": None,
                "safety": None,
                "events": None,
                "aesthetic": None
            }
        else:
            # Smart Destination Extraction for Pulse & Maps
            target_dest = req.message
            if vision_dest:
                 target_dest = vision_dest # Use the vision-identified destination
            else:
                 # Simple regex to find destination after "to " or "in "
                 dest_match = re.search(r'(?:to|in|at|visit|about|planning)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)', req.message)
                 if dest_match:
                     target_dest = dest_match.group(1)
                 elif len(req.message.split()) < 4:
                     target_dest = clean_msg # Use the single word as destination
            
            search_results = ""
            dest_image = None
            video_url = None
            crowd_status = "Bespoke Crowd Optimization Active"
            local_phrases = []
            heatmap_data = None
            res_data = "Weather and Currency pulse active."
            safety_info = "Atlas Safety monitoring active."
            events_info = "Local discovery pulse active."
            aesthetic_info = "Photography hotspots identified."
            
            try:
                # 1. Image Discovery
                dest_image = search.get_image(target_dest)
                video_url = search.get_destination_video(target_dest)
                crowd_status = search.get_crowd_sentiment(target_dest)
                local_phrases = search.get_local_phrases(target_dest)
                heatmap_data = search.get_safety_heatmap_data(target_dest)

                # Build detailed research context for the LLM
                res_data = search.get_destination_info(target_dest)
                safety_info = search.get_safety_info(target_dest)
                events_info = search.get_local_events(target_dest)
                aesthetic_info = search.get_aesthetic_spots(target_dest)
                
                search_query = f"{target_dest} travel tips best places {req.preferences.get('interest', 'culture')}"
                search_results = search.search(search_query)
                
                # Composite Research Context
                research_context = [
                    f"LIVE PULSE: {res_data}",
                    f"SAFETY ADVISORY: {safety_info}",
                    f"LOCAL EVENTS: {events_info}",
                    f"AESTHETIC SPOTS: {aesthetic_info}",
                    f"CROWD PULSE: {crowd_status}",
                    f"GENERAL RESEARCH: {search_results}"
                ]
                final_search_data = "\n\n".join(research_context)
            except Exception as search_err:
                print(f"Non-critical Search Error: {search_err}")
                final_search_data = "Real-time research temporarily unavailable."
                
            itinerary = llm.generate_itinerary(req.message, req.preferences, final_search_data, req.history)
            return {
                "response": itinerary,
                "image": dest_image,
                "pulse": res_data,
                "video": video_url,
                "crowd": crowd_status,
                "phrases": local_phrases,
                "heatmap": heatmap_data,
                "destination": target_dest,
                "safety": safety_info,
                "events": events_info,
                "aesthetic": aesthetic_info,
                "shield": search.get_safety_shield_data(target_dest),
                "currency": search.get_currency_rate(target_dest),
                "moodboard": search.get_moodboard(target_dest)
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
    audio_b64 = voice.tts(req.get("text", ""), req.get("voice_id", "JBFqnCBsd6RMkjVDRZzb"))
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
