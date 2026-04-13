import google.generativeai as genai
from config import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

def test_model(model_name):
    print(f"Testing {model_name}...")
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Say hello")
        print(f"Success! Response: {response.text}")
        return True
    except Exception as e:
        print(f"Failed {model_name}: {e}")
        return False

test_model('gemini-2.5-flash')
