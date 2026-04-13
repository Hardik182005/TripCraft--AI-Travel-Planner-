import streamlit as st

def apply_styles():
    st.markdown("""
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap');
        
        /* Hide Streamlit elements */
        #MainMenu {visibility: hidden;}
        footer {visibility: hidden;}
        header {visibility: hidden;}
        .stAppDeployButton {display:none;}
        [data-testid="stStatusWidget"] {display: none;}

        html, body, [class*="css"] {
            font-family: 'Outfit', sans-serif;
            background-color: #050505 !important;
            color: #ffffff !important;
        }

        .stApp {
            background-color: #050505 !important;
        }

        .stButton>button {
            border-radius: 50px;
            background: linear-gradient(90deg, #6366f1 0%, #a855f7 100%);
            color: white !important;
            border: none;
            padding: 12px 32px;
            font-weight: 700;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            font-size: 0.8rem;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            box-shadow: 0 10px 20px -5px rgba(99, 102, 241, 0.4);
        }

        .stButton>button:hover {
            transform: translateY(-3px) scale(1.05);
            box-shadow: 0 20px 30px -10px rgba(168, 85, 247, 0.6);
            color: white !important;
            border: none;
        }

        .glass-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 24px;
            margin-bottom: 24px;
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
        }

        .chat-user {
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            padding: 20px;
            border-radius: 20px 20px 4px 20px;
            margin-bottom: 20px;
            border: 1px solid rgba(255, 255, 255, 0.05);
            color: #e2e8f0;
        }

        .chat-assistant {
            background: rgba(99, 102, 241, 0.1);
            padding: 20px;
            border-radius: 20px 20px 20px 4px;
            margin-bottom: 20px;
            border: 1px solid rgba(99, 102, 241, 0.2);
            color: #ffffff;
            box-shadow: inset 0 0 20px rgba(99, 102, 241, 0.05);
        }

        .trending-card {
            border-radius: 24px;
            overflow: hidden;
            background: #111111;
            transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            border: 1px solid rgba(255,255,255,0.03);
            position: relative;
        }

        .trending-card:hover {
            transform: translateY(-10px);
            border-color: #6366f1;
            box-shadow: 0 15px 45px -10px rgba(0, 0, 0, 0.8);
        }

        h1, h2, h3, h4, span, p {
            color: #ffffff !important;
        }
        
        .stTextInput>div>div>input {
            background-color: rgba(255, 255, 255, 0.05) !important;
            border: 1px solid rgba(255, 255, 255, 0.1) !important;
            border-radius: 12px !important;
            color: white !important;
            padding: 12px !important;
        }

        /* Sidebar enhancement */
        [data-testid="stSidebar"] {
            background-color: #0a0a0a !important;
            border-right: 1px solid rgba(255, 255, 255, 0.05);
        }
        </style>
    """,StartLine:5,TargetContent:
    """, unsafe_allow_html=True)

def header():
    st.markdown("<h1 style='text-align: center; color: white;'>TripCraft - AI Travel Planner ✈️</h1>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: #94a3b8;'>Your personalized journey, orchestrated by intelligence.</p>", unsafe_allow_html=True)
    st.markdown("---")
