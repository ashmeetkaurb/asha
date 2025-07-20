import json
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# --- Pydantic Models: Define the shape of our data ---
class JournalEntry(BaseModel):
    id: str
    date: str
    time: str
    transcript: str
    response: str
    sentiment: str
    mood: int
    feedback: Optional[dict] = None

# --- FastAPI App Setup ---
app = FastAPI()

# Allow your React frontend (running on port 5173) to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = "journal_db.json"

# --- Helper Function to Read/Write to our JSON "Database" ---
def read_db() -> List[dict]:
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return []

def write_db(entries: List[dict]):
    with open(DB_FILE, "w") as f:
        json.dump(entries, f, indent=4)

# --- API Endpoints ---
@app.get("/api/journal", response_model=List[JournalEntry])
async def get_journal_entries():
    """This endpoint retrieves all saved journal entries."""
    return read_db()

@app.post("/api/journal")
async def save_journal_entry(entry: JournalEntry):
    """This endpoint saves a new journal entry."""
    entries = read_db()
    entries.insert(0, entry.dict()) # Add new entry to the top of the list
    write_db(entries)
    return {"message": "Entry saved successfully"}

# Add these imports to the top of main.py
import os
from dotenv import load_dotenv
import google.generativeai as genai

# --- AI Setup ---
load_dotenv()
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

SYSTEM_PROMPT = (
    "You are ASHA-Sphere, a compassionate AI companion for healthcare workers. "
    "Your role is to listen to their spoken thoughts and provide a short, empathetic, and encouraging response in 2-3 sentences. "
    "Acknowledge their feelings and offer gentle encouragement. Do not give medical advice."
)

# Add this new endpoint inside your main.py
@app.post("/api/get-response")
async def analyze_transcript(request: Request):
    data = await request.json()
    transcript = data.get("transcript")

    if not transcript:
        return {"error": "No transcript provided"}

    full_prompt = f"{SYSTEM_PROMPT}\n\nUser's thoughts: \"{transcript}\""

    try:
        response = await model.generate_content_async(full_prompt)
        return {"response": response.text.strip()}
    except Exception as e:
        return {"error": str(e)}