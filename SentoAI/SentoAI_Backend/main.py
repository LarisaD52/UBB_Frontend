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

def get_db():
    base_path = os.path.dirname(__file__)
    db_path = os.path.join(base_path, 'database.json')
    try:
        with open(db_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except:
        return {"contacts": [], "user_profile": {"balance": 2500}}

def find_contact(name):
    db = get_db()
    for c in db.get("contacts", []):
        if name.lower() in c["nume"].lower():
            return c
    return None

def process_logic(transcript):
    transcript = transcript.lower().strip()
    user_id = "maria_default"
    
    if any(x in transcript for x in ["anulează", "oprește", "acasă"]):
        user_states[user_id] = {"step": "IDLE"}
        return {"action": "NAVIGATE_WITH_DATA", "target": "/", "speech": "Am anulat."}

    state = user_states.get(user_id, {"step": "IDLE", "data": {"nume": "", "iban": "", "suma": ""}})

    # PAS 1: Start
    if "transfer" in transcript and state["step"] == "IDLE":
        user_states[user_id] = {"step": "ASK_TYPE"}
        return {"action": "SPEAK_ONLY", "speech": "Maria, vrei o persoană nouă sau din listă?"}

    # PAS 2: Tip
    if state["step"] == "ASK_TYPE":
        if "nou" in transcript:
            user_states[user_id] = {"step": "COLLECT_NAME_NEW", "data": {"nume": "", "iban": "", "suma": ""}}
            return {"action": "UPDATE_UI", "speech": "Spune-mi numele persoanei noi.", "data": {"nume": ""}}
        else:
            user_states[user_id] = {"step": "COLLECT_NAME_EXISTING"}
            return {"action": "SPEAK_ONLY", "speech": "Spune-mi numele din contacte."}

    # PAS 3: Nume
    if state["step"] == "COLLECT_NAME_NEW":
        name = transcript.title()
        user_states[user_id]["data"]["nume"] = name
        user_states[user_id]["step"] = "COLLECT_IBAN"
        return {"action": "UPDATE_UI", "speech": f"Am notat {name}. Spune-mi IBAN-ul.", "data": {"nume": name}}
    
    if state["step"] == "COLLECT_NAME_EXISTING":
        contact = find_contact(transcript)
        if contact:
            user_states[user_id] = {"step": "COLLECT_SUM", "data": contact}
            return {"action": "UPDATE_UI", "speech": f"L-am găsit pe {contact['nume']}. Ce sumă trimitem?", "data": contact}
        return {"action": "SPEAK_ONLY", "speech": "Nu l-am găsit. Repetă numele sau zi 'persoană nouă'."}

    # PAS 4: IBAN
    if state["step"] == "COLLECT_IBAN":
        iban = transcript.upper().replace(" ", "")
        user_states[user_id]["data"]["iban"] = iban
        user_states[user_id]["step"] = "COLLECT_SUM"
        return {"action": "UPDATE_UI", "speech": "IBAN salvat. Ce sumă trimiți?", "data": {"iban": iban}}

    # PAS 5: Sumă
    if state["step"] == "COLLECT_SUM":
        amounts = re.findall(r'\d+', transcript)
        if amounts:
            suma = amounts[0]
            final = user_states[user_id]["data"]
            user_states[user_id] = {"step": "IDLE"}
            return {
                "action": "NAVIGATE_WITH_DATA",
                "target": "/transfer-confirm",
                "speech": f"Confirmi {suma} lei către {final['nume']}?",
                "data": {**final, "suma": f"{suma} lei"}
            }

    return {"action": "SPEAK_ONLY", "speech": "Nu am înțeles, Maria."}

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
        return {"action": "SPEAK_ONLY", "speech": "Eroare audio."}