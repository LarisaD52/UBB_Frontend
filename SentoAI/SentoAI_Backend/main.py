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

user_states = {}

# --- FUNCTII BAZA DE DATE ---

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
    try:
        with open(db_path, "w", encoding="utf-8") as f:
            json.dump(db, f, indent=2, ensure_ascii=False)
            return True
    except Exception as e:
        print(f"Eroare salvare DB: {e}")
        return False

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