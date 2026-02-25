import json
import os

def load_database():
    base_path = os.path.dirname(__file__)
    db_path = os.path.join(base_path, 'database.json')
    
    try:
        with open(db_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        return {
            "user_profile": {"typical_spending_limit": 1000},
            "history_60_days": []
        }

def analyze_transaction_risk(recipient_name, amount):
    db = load_database()
    
    user_limit = db.get("user_profile", {}).get("typical_spending_limit", 1000)
    
    # FIX: folosim "nume" nu "recipient"
    recent_recipients = [
        t.get("nume", "").lower() 
        for t in db.get("history_60_days", [])
    ]
    
    name_to_check = recipient_name.strip().lower()

    # Beneficiar necunoscut
    if name_to_check not in recent_recipients:
        return {
            "is_suspicious": True,
            "reason": "UNKNOWN_RECIPIENT",
            "message": f"Atenție! Beneficiarul {recipient_name} nu apare în istoricul recent. Am blocat plata pentru siguranță."
        }

    # Sumă prea mare
    if float(amount) > float(user_limit):
        return {
            "is_suspicious": True,
            "reason": "LIMIT_EXCEEDED",
            "message": f"Suma de {amount} lei depășește limita obișnuită. Este necesară confirmare suplimentară."
        }

    return {
        "is_suspicious": False,
        "message": "Tranzacție verificată și aprobată de Sento AI."
    }