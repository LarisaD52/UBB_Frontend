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

user_states = {}

def get_db():
    base_path = os.path.dirname(__file__)
    db_path = os.path.join(base_path, 'database.json')
    try:
        with open(db_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        # Fallback structura in caz de eroare
        return {"contacts": [], "notifications": [], "user_profile": {"balance": 2500}}

def save_db(db):
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
    for c in db.get("contacts", []):
        if name.lower() in c["nume"].lower():
            return c
    return None

# --- LOGICA DE PROCESARE COMPLEXA ---

def process_logic(transcript):
    transcript = transcript.lower().strip()
    user_id = "maria_default"
    db = get_db()
    
    # 0. COMANDA GLOBALĂ: ANULARE
    if any(x in transcript for x in ["anulează", "oprește", "acasă", "renunță"]):
        user_states[user_id] = {"step": "IDLE"}
        return {"action": "NAVIGATE_WITH_DATA", "target": "/", "speech": "Am anulat operațiunea. Cu ce te mai pot ajuta?"}

    # 1. LOGICĂ NOTIFICĂRI (Citire ultima necitită + Navigare)
    if any(x in transcript for x in ["notificare", "mesaj", "notificarea", "ce am primit"]):
        # Căutăm notificările care au "read": false sau lipsă
        # Presupunem că punctul albastru din UI se bazează pe proprietatea "read"
        notifications = db.get("notifications", [])
        unread = [n for n in notifications if n.get("read") == False]
        
        if unread:
            # Luăm cea mai recentă notificare necitită (ultima din listă)
            target_notif = unread[-1]
            mesaj_text = target_notif.get("text", "Mesaj fără conținut")
            
            # Marcăm notificarea ca citită în baza de date
            for idx, n in enumerate(db["notifications"]):
                if n.get("id") == target_notif.get("id"):
                    db["notifications"][idx]["read"] = True
            
            # Salvăm modificarea pentru ca punctul albastru să dispară
            save_db(db)
            
            return {
                "action": "NAVIGATE_WITH_DATA", 
                "target": "/notifications", 
                "speech": f"Maria, ai o notificare necitită care spune: {mesaj_text}. Te duc acum să vezi toate mesajele.",
                "data": {"highlightId": target_notif.get("id")}
            }
        else:
            return {"action": "SPEAK_ONLY", "speech": "Maria, nu ai nicio notificare necitită nouă."}

    # 2. LOGICĂ TRANSFER (Mașina de stări)
    state = user_states.get(user_id, {"step": "IDLE", "data": {"nume": "", "iban": "", "suma": ""}})

    # PAS 1: Declanșare Transfer
    if "transfer" in transcript and state["step"] == "IDLE":
        user_states[user_id] = {"step": "ASK_TYPE"}
        return {"action": "SPEAK_ONLY", "speech": "Maria, vrei să trimiți bani unei persoane noi sau cuiva din listă?"}

    # PAS 2: Tip Beneficiar
    if state["step"] == "ASK_TYPE":
        if "nou" in transcript:
            user_states[user_id] = {"step": "COLLECT_NAME_NEW", "data": {"nume": "", "iban": "", "suma": ""}}
            return {"action": "UPDATE_UI", "speech": "Am înțeles. Spune-mi numele persoanei noi.", "data": {"nume": ""}}
        else:
            user_states[user_id] = {"step": "COLLECT_NAME_EXISTING"}
            return {"action": "SPEAK_ONLY", "speech": "Spune-mi numele persoanei din lista ta de contacte."}

    # PAS 3: Colectare Nume
    if state["step"] == "COLLECT_NAME_NEW":
        name = transcript.title()
        user_states[user_id]["data"]["nume"] = name
        user_states[user_id]["step"] = "COLLECT_IBAN"
        return {"action": "UPDATE_UI", "speech": f"Am notat numele {name}. Te rog să-mi spui codul IBAN.", "data": {"nume": name}}
    
    if state["step"] == "COLLECT_NAME_EXISTING":
        contact = find_contact(transcript)
        if contact:
            user_states[user_id] = {"step": "COLLECT_SUM", "data": contact}
            return {"action": "UPDATE_UI", "speech": f"L-am găsit pe {contact['nume']} în contacte. Ce sumă trimitem?", "data": contact}
        return {"action": "SPEAK_ONLY", "speech": "Maria, nu am găsit acest nume. Încearcă din nou sau zi 'persoană nouă'."}

    # PAS 4: Colectare IBAN
    if state["step"] == "COLLECT_IBAN":
        iban = transcript.upper().replace(" ", "")
        user_states[user_id]["data"]["iban"] = iban
        user_states[user_id]["step"] = "COLLECT_SUM"
        return {"action": "UPDATE_UI", "speech": "Am introdus IBAN-ul. Ce sumă dorești să trimiți?", "data": {"iban": iban}}

    # PAS 5: Colectare Sumă & Finalizare
    if state["step"] == "COLLECT_SUM":
        amounts = re.findall(r'\d+', transcript)
        if amounts:
            suma = amounts[0]
            final_data = user_states[user_id]["data"]
            user_states[user_id] = {"step": "IDLE"} # Reset state la final
            return {
                "action": "NAVIGATE_WITH_DATA",
                "target": "/transfer-confirm",
                "speech": f"Am pregătit transferul de {suma} lei către {final_data['nume']}. Confirmi?",
                "data": {**final_data, "suma": f"{suma} lei"}
            }

    # 3. INTEROGARE SOLD
    if any(x in transcript for x in ["sold", "balanță", "câți bani", "cont"]):
        balance = db["user_profile"]["balance"]
        return {"action": "SPEAK_ONLY", "speech": f"Maria, în contul tău sunt {balance} lei."}

    return {"action": "SPEAK_ONLY", "speech": "Te ascult, Maria. Spune-mi ce dorești să facem: un transfer, citirea mesajelor sau verificarea soldului?"}

# --- RUTE API ---

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
    except Exception as e:
        print(f"Eroare Audio: {e}")
        return {"action": "SPEAK_ONLY", "speech": "Maria, te rog să repeți, nu am putut procesa vocea."}

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
 