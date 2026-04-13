from fpdf import FPDF
import io

def generate_itinerary_pdf(itinerary_text):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    
    # Title
    pdf.set_font("Arial", 'B', 16)
    pdf.cell(200, 10, txt="TripCraft - Your Travel Itinerary", ln=True, align='C')
    pdf.ln(10)
    
    # Content
    pdf.set_font("Arial", size=12)
    pdf.multi_cell(0, 10, txt=itinerary_text)
    
    # Output to bytes
    pdf_output = pdf.output(dest='S')
    return pdf_output
