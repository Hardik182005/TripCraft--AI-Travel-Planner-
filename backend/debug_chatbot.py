import google.generativeai as genai
import traceback
from config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

def debug_chat():
    model_name = 'gemini-2.5-flash'
    print(f"Debugging chatbot with {model_name}...")
    try:
        model = genai.GenerativeModel(model_name)
        # Try a simple chat-like request
        chat = model.start_chat()
        response = chat.send_message("Hello, how are you?")
        print(f"Response success: {response.text[:50]}...")
    except Exception as e:
        print("--- ERROR CAUGHT ---")
        print(f"Error Type: {type(e).__name__}")
        print(f"Error Message: {str(e)}")
        print("--- TRACEBACK ---")
        traceback.print_exc()

if __name__ == "__main__":
    debug_chat()
