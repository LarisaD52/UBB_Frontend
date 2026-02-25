from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
import json
import re
import os
import io
import speech_recognition as sr
from pydub import AudioSegment
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request

# Importăm logica de analiză a riscului din ai_engine.py
from ai_engine import analyze_transaction_risk 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend URL(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# State-ul utilizatorului pentru fluxuri complexe
user_states = {}

# ---------------- DATABASE ----------------

def get_db():
    """Citește baza de date direct de pe disc pentru a evita datele vechi."""
    base_path = os.path.dirname(__file__)
    db_path = os.path.join(base_path, 'database.json')
    try:
        # Deschidem și închidem fișierul la fiecare citire pentru prospețime
        with open(db_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {"user_profile": {"balance": 0}, "notifications": [], "contacts": []}

def save_db(db):
    """Salvează starea actualizată în database.json și forțează scrierea pe disc."""
    base_path = os.path.dirname(__file__)
    db_path = os.path.join(base_path, 'database.json')
    with open(db_path, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
        f.flush() # Forțează sistemul de operare să scrie datele imediat
        os.fsync(f.fileno())

def normalize(text):
    return text.lower().strip()

# ---------------- LOGICĂ DE PROCESARE TRANSCRIPT ----------------

async def handle_logic_for_transcript(transcript: str):
    text = normalize(transcript)
    # Citim versiunea proaspătă a bazei de date
    db = get_db()
    user_id = "maria_default"
    
    # 1. CANCEL
    if any(x in text for x in ["anulează", "oprește", "renunță", "acasă"]):
        user_states[user_id] = {"step": "IDLE"}
        return {
            "action": "NAVIGATE_WITH_DATA",
            "target": "/",
            "speech": "Am anulat operațiunea. Cu ce te mai pot ajuta?"
        }

    # 2. SOLD
    if any(x in text for x in ["sold", "cât am", "câți bani", "balanță", "în cont"]):
        balance = db["user_profile"]["balance"]
        return {"action": "SPEAK_ONLY", "speech": f"Maria, în contul tău sunt {balance} lei."}

    # 3. NOTIFICĂRI (Detectare strictă și marcare imediată)
    if any(x in text for x in ["notificare", "notificări", "mesaj", "mesaje"]):
        # Căutăm DOAR ce are "read": False (folosim explicit False pentru siguranță)
        unread_notifications = [n for n in db["notifications"] if n.get("read") is False]
        
        if unread_notifications:
            combined_text = " ".join(n["text"] for n in unread_notifications)
            
            # Marcăm ca citit în obiectul din memorie
            for n in db["notifications"]:
                if n.get("read") is False:
                    n["read"] = True
            
            # SALVĂM IMEDIAT pe disc
            save_db(db)
            
            return {
                "action": "NAVIGATE_WITH_DATA",
                "target": "/notifications",
                "speech": f"Ai mesaje noi: {combined_text}",
                "data": {"autoRead": True}
            }
        
        # Dacă ajunge aici, înseamnă că toate au read: True în fișier
        return {"action": "SPEAK_ONLY", "speech": "Maria, nu ai nicio notificare nouă în acest moment."}

    # 4. TRANSFER
    if any(x in text for x in ["transfer", "trimite", "dă-i", "plătește"]):
        for contact in db["contacts"]:
            if contact["nume"].lower() in text:
                user_states[user_id] = {"step": "AWAITING_AMOUNT", "contact": contact}
                return {"action": "SPEAK_ONLY", "speech": f"Cât vrei să îi trimiți lui {contact['nume']}?"}
        return {"action": "SPEAK_ONLY", "speech": "Spune-mi numele persoanei căreia vrei să îi trimiți bani."}

    # 5. COLECTARE SUMĂ
    state = user_states.get(user_id, {"step": "IDLE"})
    if state["step"] == "AWAITING_AMOUNT":
        amounts = re.findall(r'\d+', text)
        if amounts:
            suma = amounts[0]
            contact = state["contact"]
            user_states[user_id] = {"step": "IDLE"}
            risk = analyze_transaction_risk(contact["nume"], suma)
            if risk["is_suspicious"]:
                return {
                    "action": "NAVIGATE_WITH_DATA",
                    "target": "/transaction-alert",
                    "speech": f"Atenție, Maria! {risk['message']}",
                    "data": {"merchant": contact["nume"], "amount": f"{suma} lei", "reason": risk["reason"]}
                }
            return {
                "action": "NAVIGATE_WITH_DATA",
                "target": "/transfer-confirm",
                "data": {"nume": contact["nume"], "iban": contact["iban"], "suma": f"{suma} lei"},
                "speech": f"Vrei să trimiți {suma} lei către {contact['nume']}. Confirmi?"
            }

    return {"action": "SPEAK_ONLY", "speech": "Nu am înțeles exact. Poți să mă întrebi de sold, mesaje sau un transfer."}

# ---------------- RUTE API ----------------

@app.post("/process-audio")
async def process_audio(audio: UploadFile = File(...)):
    try:
        audio_content = await audio.read()
        audio_segment = AudioSegment.from_file(io.BytesIO(audio_content))
        wav_io = io.BytesIO()
        audio_segment.export(wav_io, format="wav")
        wav_io.seek(0)
        r = sr.Recognizer()
        with sr.AudioFile(wav_io) as source:
            recorded_audio = r.record(source)
        transcript = r.recognize_google(recorded_audio, language="ro-RO")
        print(f"Sento a auzit: {transcript}")
        return await handle_logic_for_transcript(transcript)
    except sr.UnknownValueError:
        return {"action": "SPEAK_ONLY", "speech": "Nu am înțeles, poți repeta?"}
    except Exception as e:
        print(f"Eroare: {e}")
        return {"action": "SPEAK_ONLY", "speech": "Eroare tehnică la procesarea vocii."}

@app.post("/process-voice")
async def process_voice(data: dict):
    return await handle_logic_for_transcript(data.get("transcript", ""))

@app.get("/restrictions")
async def get_restrictions():
    return get_db().get("restrictions", [])

@app.put("/restrictions")
async def update_restrictions(request: Request):
    restrictions = await request.json()
    db = get_db()
    db["restrictions"] = restrictions
    save_db(db)
    return {"status": "ok"}