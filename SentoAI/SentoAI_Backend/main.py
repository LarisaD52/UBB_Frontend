from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
import json, re, os, io
import speech_recognition as sr
from pydub import AudioSegment

app = FastAPI()

# Permitem conexiunea de la iPhone/Simulator către MacBook
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

def find_contact(name):
    db = get_db()
    for c in db.get("contacts", []):
        if name.lower() in c["nume"].lower():
            return c
    return None

def process_logic(transcript):
    transcript = transcript.lower().strip()
    user_id = "maria_default"
    db = get_db()
    
    # Inițializare stare dacă nu există
    if user_id not in user_states:
        user_states[user_id] = {"step": "IDLE", "data": {"nume": "", "iban": "", "suma": ""}}

    # 0. COMANDA: ANULARE (Resetare totală)
    if any(x in transcript for x in ["anulează", "oprește", "acasă", "renunță"]):
        user_states[user_id] = {"step": "IDLE", "data": {"nume": "", "iban": "", "suma": ""}}
        return {"action": "NAVIGATE_WITH_DATA", "target": "/", "speech": "Am anulat operațiunea."}

    # 1. COMANDA: NOTIFICĂRI
    if any(x in transcript for x in ["notificare", "mesaj", "ce am primit", "citește"]):
        notifications = db.get("notifications", [])
        unread = [n for n in notifications if n.get("read") == False]
        if unread:
            target_notif = unread[-1]
            for n in db["notifications"]:
                if n.get("id") == target_notif.get("id"):
                    n["read"] = True
            save_db(db)
            return {
                "action": "NAVIGATE_WITH_DATA",
                "target": "/notifications",
                "speech": f"Maria, ultima notificare spune: {target_notif.get('text')}.",
                "data": {"highlightId": target_notif.get("id")}
            }
        return {"action": "SPEAK_ONLY", "speech": "Nu ai mesaje noi."}

    # 2. COMANDA: SOLD
    if any(x in transcript for x in ["sold", "balanță", "câți bani", "cont"]):
        balance = db["user_profile"]["balance"]
        return {"action": "SPEAK_ONLY", "speech": f"Maria, în contul tău sunt {balance} lei."}

    # 3. COMANDA: SETĂRI
    if any(x in transcript for x in ["setări", "contacte", "încredere"]):
        contacts = db.get("contacts", [])
        nume_contacte = ", ".join([c["nume"] for c in contacts])
        return {
            "action": "NAVIGATE_WITH_DATA",
            "target": "/settings",
            "speech": f"Iată setările tale. Contactele de încredere sunt: {nume_contacte}.",
            "data": {}
        }

    # 4. LOGICĂ TRANSFER (FLUX PAS CU PAS)
    state = user_states[user_id]

    # PAS: Start
    if "transfer" in transcript and state["step"] == "IDLE":
        state["step"] = "ASK_TYPE"
        return {"action": "SPEAK_ONLY", "speech": "Maria, vrei o persoană nouă sau din listă?"}

    # PAS: Tip Beneficiar
    if state["step"] == "ASK_TYPE":
        if "nou" in transcript:
            state["step"] = "COLLECT_NAME_NEW"
            return {"action": "UPDATE_UI", "speech": "Spune-mi numele persoanei noi.", "data": {"nume": "", "iban": "", "suma": ""}}
        else:
            state["step"] = "COLLECT_NAME_EXISTING"
            return {"action": "SPEAK_ONLY", "speech": "Spune-mi numele din contacte."}

    # PAS: Colectare Nume (Persoană Nouă) -> Update UI instant
    if state["step"] == "COLLECT_NAME_NEW":
        name = transcript.title()
        state["data"]["nume"] = name
        state["step"] = "COLLECT_IBAN"
        return {"action": "UPDATE_UI", "speech": f"Am notat numele {name}. Acum spune-mi codul IBAN.", "data": state["data"]}
    
    # PAS: Colectare Nume (Existent)
    if state["step"] == "COLLECT_NAME_EXISTING":
        contact = find_contact(transcript)
        if contact:
            state["data"] = {"nume": contact["nume"], "iban": contact["iban"], "suma": ""}
            state["step"] = "COLLECT_SUM"
            return {"action": "UPDATE_UI", "speech": f"L-am găsit pe {contact['nume']}. Ce sumă trimitem?", "data": state["data"]}
        return {"action": "SPEAK_ONLY", "speech": "Nu l-am găsit. Repetă numele."}

    # PAS: Colectare IBAN -> Update UI instant
    if state["step"] == "COLLECT_IBAN":
        iban = transcript.upper().replace(" ", "")
        state["data"]["iban"] = iban
        state["step"] = "COLLECT_SUM"
        return {"action": "UPDATE_UI", "speech": "IBAN salvat. Ce sumă trimiți?", "data": state["data"]}

    # PAS: Colectare Sumă -> Finalizare și Navigare
    if state["step"] == "COLLECT_SUM":
        amounts = re.findall(r'\d+', transcript)
        if amounts:
            suma = amounts[0]
            state["data"]["suma"] = f"{suma} lei"
            final_payload = dict(state["data"])
            # Resetăm starea pentru următoarea utilizare
            user_states[user_id] = {"step": "IDLE", "data": {"nume": "", "iban": "", "suma": ""}}
            
            return {
                "action": "NAVIGATE_WITH_DATA",
                "target": "/transfer-confirm",
                "speech": f"Am completat datele. Confirmi transferul de {suma} lei către {final_payload['nume']}?",
                "data": final_payload
            }

    return {"action": "SPEAK_ONLY", "speech": "Te ascult, Maria."}

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
    