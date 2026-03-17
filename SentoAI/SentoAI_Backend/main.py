from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
import json, re, os, io
import speech_recognition as sr
from pydub import AudioSegment
from datetime import datetime
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request
from fastapi import Body, HTTPException

from ai_engine import analyze_transaction_risk 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Stocăm starea sesiunii pentru Maria (nume, iban, suma)
user_states = {}

def get_db():
    base_path = os.path.dirname(__file__)
    db_path = os.path.join(base_path, 'database.json')
    try:
        with open(db_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return {
            "contacts": [{"nume": "Adrian", "iban": "RO123456789"}], 
            "notifications": [{"id": "1", "text": "Ai primit pensia în cont.", "read": False}],
            "user_profile": {"balance": 2500}
        }

def save_db(db):
    base_path = os.path.dirname(__file__)
    db_path = os.path.join(base_path, 'database.json')
    try:
        with open(db_path, "w", encoding="utf-8") as f:
            json.dump(db, f, indent=2, ensure_ascii=False)
            return True
    except:
        return False

def save_db(db):
    base_path = os.path.dirname(__file__)
    db_path = os.path.join(base_path, 'database.json')
    with open(db_path, "w", encoding="utf-8") as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
        f.flush()
        os.fsync(f.fileno())

def normalize(text):
    return text.lower().strip()

def find_contact(name):
    db = get_db()
    for c in db.get("contacts", []):
        if name.lower() in c["nume"].lower():
            return c
    return None

# --- LOGICA DE PROCESARE COMPLEXA ---
def process_logic(transcript):
    transcript = transcript.lower().strip()
    user_id = "maria_default"
    db = get_db()
    
    if user_id not in user_states:
        user_states[user_id] = {"step": "IDLE", "data": {"nume": "", "iban": "", "suma": ""}}

    state = user_states[user_id]

    # --- COMANDA GLOBALĂ: ANULARE ---
    if any(x in transcript for x in ["anulează", "oprește", "acasă", "renunță", "nu"]):
        user_states[user_id] = {"step": "IDLE", "data": {"nume": "", "iban": "", "suma": ""}}
        return {"action": "NAVIGATE_WITH_DATA", "target": "/", "speech": "Am anulat operațiunea."}

    # --- LOGICĂ CONFIRMARE FINALĂ (Hands-free) ---
    # Dacă suntem la pasul de confirmare și Maria zice DA
    if state["step"] == "CONFIRM_TRANSFER":
        if any(x in transcript for x in ["da", "confirm", "trimite", "e bine", "este bine"]):
            # Resetăm starea după succes
            user_states[user_id] = {"step": "IDLE", "data": {"nume": "", "iban": "", "suma": ""}}
            return {
                "action": "NAVIGATE_WITH_DATA",
                "target": "/", 
                "speech": "Transfer reușit! Banii au fost trimiși. Te-am întors în ecranul principal."
            }

    # --- COMENZI SIMPLE ---
    if any(x in transcript for x in ["notificare", "mesaj", "ce am primit"]):
        # ... (codul tău pentru notificări rămâne neschimbat)
        pass

    if any(x in transcript for x in ["sold", "balanță", "câți bani"]):
        balance = db["user_profile"]["balance"]
        return {"action": "SPEAK_ONLY", "speech": f"Maria, în contul tău sunt {balance} lei."}

    # --- FLUX TRANSFER (PAS CU PAS) ---
    
    # 1. Inițiere
    if "transfer" in transcript and state["step"] == "IDLE":
        state["step"] = "ASK_TYPE"
        return {"action": "SPEAK_ONLY", "speech": "Maria, vrei o persoană nouă sau din listă?"}

    # 2. Tip beneficiar
    if state["step"] == "ASK_TYPE":
        if "nou" in transcript:
            state["step"] = "COLLECT_NAME_NEW"
            return {"action": "UPDATE_UI", "speech": "Spune-mi numele persoanei noi."}
        else:
            state["step"] = "COLLECT_NAME_EXISTING"
            return {"action": "SPEAK_ONLY", "speech": "Spune-mi numele din contacte."}

    # 3. Colectare Nume
    if state["step"] == "COLLECT_NAME_NEW":
        state["data"]["nume"] = transcript.title()
        state["step"] = "COLLECT_IBAN"
        return {"action": "UPDATE_UI", "speech": f"Am notat {state['data']['nume']}. Spune-mi codul IBAN.", "data": state["data"]}
    
    if state["step"] == "COLLECT_NAME_EXISTING":
        contact = find_contact(transcript)
        if contact:
            state["data"] = {"nume": contact["nume"], "iban": contact["iban"], "suma": ""}
            state["step"] = "COLLECT_SUM"
            return {"action": "UPDATE_UI", "speech": f"L-am găsit pe {contact['nume']}. Ce sumă trimitem?", "data": state["data"]}

    # 4. Colectare IBAN
    if state["step"] == "COLLECT_IBAN":
        state["data"]["iban"] = transcript.upper().replace(" ", "")
        state["step"] = "COLLECT_SUM"
        return {"action": "UPDATE_UI", "speech": "IBAN salvat. Ce sumă trimiți?", "data": state["data"]}

    # 5. Colectare Sumă & Trecere la Confirmare
    if state["step"] == "COLLECT_SUM":
        amounts = re.findall(r'\d+', transcript)
        if amounts:
            state["data"]["suma"] = f"{amounts[0]} lei"
            state["step"] = "CONFIRM_TRANSFER" # SCHIMBARE: Nu resetăm, trecem la confirmare
            
            return {
                "action": "NAVIGATE_WITH_DATA",
                "target": "/transfer-confirm",
                "speech": f"Maria, confirmăm transferul de {state['data']['suma']} către {state['data']['nume']}? Spune DA pentru a trimite.",
                "data": state["data"]
            }

    return {"action": "SPEAK_ONLY", "speech": "Te ascult, Maria. Spune DA dacă vrei să trimiți banii."}

@app.post("/process-voice")
async def process_voice(data: dict):
    return process_logic(data.get("transcript", ""))

@app.post("/process-audio")
async def process_audio(audio: UploadFile = File(...)):
    try:
        contents = await audio.read()
        audio_segment = AudioSegment.from_file(io.BytesIO(contents), format="m4a")
        wav_io = io.BytesIO()
        audio_segment.export(wav_io, format="wav")
        wav_io.seek(0)
        
        r = sr.Recognizer()
        with sr.AudioFile(wav_io) as source:
            recorded = r.record(source)
            
        transcript = r.recognize_google(recorded, language="ro-RO")
        return process_logic(transcript)
    except:
        return {"action": "SPEAK_ONLY", "speech": "Eroare audio, Maria."}
    
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


# Endpoint pentru a obține lista de contacte
@app.get("/contacts")
def get_contacts():
    db = get_db()
    return db.get("contacts", [])


# Endpoint pentru a adăuga un contact nou
@app.post("/contacts")
def add_contact(contact: dict = Body(...)):
    db = get_db()
    contacts = db.get("contacts", [])
    # Simplu: adăugăm obiectul primit în listă și salvăm
    contacts.append(contact)
    db["contacts"] = contacts
    save_db(db)
    return {"status": "ok", "contact": contact}


# Endpoint pentru a șterge un contact (după nume)
@app.delete("/contacts")
def delete_contact(payload: dict = Body(...)):
    name = payload.get("nume") or payload.get("name")
    if not name:
        raise HTTPException(status_code=400, detail="Missing 'nume' in payload")
    db = get_db()
    contacts = db.get("contacts", [])
    new_contacts = [c for c in contacts if (c.get("nume") or c.get("name")) != name]
    deleted_count = len(contacts) - len(new_contacts)
    db["contacts"] = new_contacts
    save_db(db)
    return {"status": "ok", "deleted": deleted_count}

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

    current_balance = float(db["user_profile"].get("balance", 0))
    db["user_profile"]["balance"] = f"{current_balance - amount_value:.2f}"

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
    
@app.get("/me")
async def get_balance(request: Request):
    return get_db().get("user_profile", {})
    
