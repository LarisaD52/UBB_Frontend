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

from ai_engine import analyze_transaction_risk 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

user_states = {}

def get_db():
    """Citește baza de date direct de pe disc pentru a evita datele vechi."""
    base_path = os.path.dirname(__file__)
    db_path = os.path.join(base_path, 'database.json')
    try:
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
        f.flush()
        os.fsync(f.fileno())

def normalize(text):
    return text.lower().strip()

async def handle_logic_for_transcript(transcript: str):
    text = normalize(transcript)
    db = get_db()
    user_id = "maria_default"
    
    if any(x in text for x in ["anulează", "oprește", "renunță", "acasă"]):
        user_states[user_id] = {"step": "IDLE"}
        return {
            "action": "NAVIGATE_WITH_DATA",
            "target": "/",
            "speech": "Am anulat operațiunea. Cu ce te mai pot ajuta?"
        }

    if any(x in text for x in ["sold", "cât am", "câți bani", "balanță", "în cont"]):
        balance = db["user_profile"]["balance"]
        return {"action": "SPEAK_ONLY", "speech": f"Maria, în contul tău sunt {balance} lei."}

    if any(x in text for x in ["notificare", "notificări", "mesaj", "mesaje"]):
        unread_notifications = [n for n in db["notifications"] if n.get("read") is False]
        
        if unread_notifications:
            combined_text = " ".join(n["text"] for n in unread_notifications)
            
            for n in db["notifications"]:
                if n.get("read") is False:
                    n["read"] = True
            
            save_db(db)
            
            return {
                "action": "NAVIGATE_WITH_DATA",
                "target": "/notifications",
                "speech": f"Ai mesaje noi: {combined_text}",
                "data": {"autoRead": True}
            }
        
        return {"action": "SPEAK_ONLY", "speech": "Maria, nu ai nicio notificare nouă în acest moment."}

    if any(x in text for x in ["transfer", "trimite", "dă-i", "plătește"]):
        for contact in db["contacts"]:
            if contact["nume"].lower() in text:
                user_states[user_id] = {"step": "AWAITING_AMOUNT", "contact": contact}
                return {"action": "SPEAK_ONLY", "speech": f"Cât vrei să îi trimiți lui {contact['nume']}?"}
        return {"action": "SPEAK_ONLY", "speech": "Spune-mi numele persoanei căreia vrei să îi trimiți bani."}

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

@app.get("/transactions")
async def get_transactions():
    return get_db().get("transactions", [])

@app.post("/make-transaction")
async def make_transaction(request: Request):
    payload = await request.json()
    db = get_db()

    if "transactions" not in db or not isinstance(db["transactions"], list):
        db["transactions"] = []

    tx = payload.get("transaction") if isinstance(payload, dict) and "transaction" in payload else payload
    if not isinstance(tx, dict):
        return {"status": "error", "message": "Invalid payload. Expected a JSON object."}

    # Accept both old/new input keys
    raw_amount = tx.get("amount")
    if raw_amount is None:
        return {"status": "error", "message": "Missing field: amount"}

    try:
        amount_value = float(str(raw_amount).replace(",", "."))
    except ValueError:
        return {"status": "error", "message": "Invalid amount"}

    title = tx.get("title") or tx.get("name")
    if not title:
        return {"status": "error", "message": "Missing field: title/name"}

    sub = tx.get("sub") or tx.get("category") or "Transfer"
    tx_type = tx.get("type", "out")
    currency = tx.get("currency", "RON")

    # next numeric id based on existing format
    max_id = 0
    for t in db["transactions"]:
        try:
            max_id = max(max_id, int(str(t.get("id", "0"))))
        except ValueError:
            pass
    next_id = str(max_id + 1)

    new_transaction = {
        "id": next_id,
        "title": title,
        "sub": sub,
        "amount": _format_amount_ro(amount_value, tx_type, currency),
        "type": tx_type,
        "date": tx.get("date", _format_date_ro_short(datetime.now())),
        "icon": tx.get("icon", _pick_icon(sub, title))
    }

    db["transactions"].insert(0, new_transaction)  # newest first
    save_db(db)

    return {"status": "ok", "transaction": new_transaction}

def _format_date_ro_short(dt: datetime) -> str:
    months = ["Ian", "Feb", "Mar", "Apr", "Mai", "Iun", "Iul", "Aug", "Sep", "Oct", "Noi", "Dec"]
    return f"{dt.day:02d} {months[dt.month - 1]}"

def _format_amount_ro(amount: float, tx_type: str = "out", currency: str = "RON") -> str:
    sign = "+" if tx_type == "in" else "-"
    s = f"{abs(amount):,.2f}"  # 1,234.50
    s = s.replace(",", "X").replace(".", ",").replace("X", ".")  # 1.234,50
    return f"{sign}{s} {currency}"

def _pick_icon(sub: str, title: str) -> str:
    text = f"{sub} {title}".lower()
    if "utilit" in text or "enel" in text:
        return "flash-outline"
    if "farmac" in text or "sănăt" in text:
        return "medical-outline"
    if "transfer" in text or "familie" in text or "persoan" in text:
        return "person-outline"
    if "abonament" in text or "digi" in text:
        return "tv-outline"
    if "întreținere" in text or "bloc" in text:
        return "home-outline"
    return "cart-outline"

@app.get("/ai-controls")
def get_ai_controls():
    return get_db().get("ai_controls", {})

@app.post("/ai-controls")
async def set_ai_controls(request: Request):
    ai_controls = await request.json()
    db = get_db()
    db["ai_controls"] = ai_controls
    save_db(db)
    return {"status": "ok"}
 