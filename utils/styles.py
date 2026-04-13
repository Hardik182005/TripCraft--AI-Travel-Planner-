import streamlit as st

def apply_styles():
    st.markdown("""
        <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        
        html, body, [class*="css"] {
            font-family: 'Inter', sans-serif;
        }

        .main {
            background-color: #0f172a;
            color: #f8fafc;
        }

        .stButton>button {
            border-radius: 12px;
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            border: none;
            padding: 10px 24px;
            font-weight: 600;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .stButton>button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.5);
            background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
        }

        .glass-card {
            background: rgba(30, 41, 59, 0.7);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .chat-user {
            background: #1e293b;
            padding: 15px;
            border-radius: 15px 15px 0 15px;
            margin-bottom: 15px;
            border-left: 4px solid #3b82f6;
        }

        .chat-assistant {
            background: #334155;
            padding: 15px;
            border-radius: 15px 15px 15px 0;
            margin-bottom: 15px;
            border-left: 4px solid #10b981;
        }

        .trending-card {
            border-radius: 20px;
            overflow: hidden;
            background: #1e293b;
            transition: all 0.3s ease;
            cursor: pointer;
            border: 1px solid rgba(255,255,255,0.05);
        }

        .trending-card:hover {
            transform: scale(1.02);
            border-color: #3b82f6;
        }

        h1, h2, h3 {
            color: #f8fafc !important;
        }
        
        /* Sidebar styling */
        .sidebar .sidebar-content {
            background-color: #1e293b;
        }
        
        /* Status animation */
        @keyframes shimmer {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
        }
        .status-pulse {
            animation: shimmer 2s infinite;
            color: #60a5fa;
            font-weight: 500;
        }
        </style>
    """, unsafe_allow_html=True)

def header():
    st.markdown("<h1 style='text-align: center; color: white;'>TripCraft - AI Travel Planner ✈️</h1>", unsafe_allow_html=True)
    st.markdown("<p style='text-align: center; color: #94a3b8;'>Your personalized journey, orchestrated by intelligence.</p>", unsafe_allow_html=True)
    st.markdown("---")
