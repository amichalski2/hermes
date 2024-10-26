from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from models.pydantic import ReminderCreate, Reminder, NoteCreate, Note
from crud.notes import NoteCRUD
from crud.reminders import ReminderCRUD
from database import engine, get_db
from services.chat_service import chat_service
from models import models
from fastapi.responses import StreamingResponse


models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/reminders/", response_model=Reminder)
def create_reminder(reminder: ReminderCreate, db: Session = Depends(get_db)):
    return ReminderCRUD.create_reminder(db=db, reminder=reminder)

@app.get("/reminders/", response_model=list[Reminder])
def read_reminders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    reminders = ReminderCRUD.get_reminders(db, skip=skip, limit=limit)
    return reminders

@app.delete("/reminders/{reminder_id}")
def delete_reminder(reminder_id: int, db: Session = Depends(get_db)):
    return ReminderCRUD.delete_reminder(db=db, reminder_id=reminder_id)

@app.put("/reminders/{reminder_id}", response_model=Reminder)
def update_reminder(reminder_id: int, reminder: ReminderCreate, db: Session = Depends(get_db)):
    return ReminderCRUD.update_reminder(db=db, reminder_id=reminder_id, reminder=reminder)

@app.post("/notes/", response_model=Note)
async def create_note(note: NoteCreate, db: Session = Depends(get_db)):
    return await NoteCRUD.create_note(db=db, note=note, raw=False)

@app.post("/notes/raw/", response_model=Note)
async def create_raw_note(note: NoteCreate, db: Session = Depends(get_db)):
    return await NoteCRUD.create_note(db=db, note=note, raw=True)

@app.get("/notes/", response_model=list[Note])
def read_notes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    notes = NoteCRUD.get_notes(db, skip=skip, limit=limit)
    return notes

@app.delete("/notes/{note_id}")
async def delete_note(note_id: int, db: Session = Depends(get_db)):
    return await NoteCRUD.delete_note(db=db, note_id=note_id)

@app.put("/notes/{note_id}", response_model=Note)
async def update_note(note_id: int, note: NoteCreate, db: Session = Depends(get_db)):
    return await NoteCRUD.update_note(db=db, note_id=note_id, note=note)

@app.get("/chat")
async def chat_endpoint(
    request: Request,
    message: str,
    session_id: str = "default"
):
    return StreamingResponse(
        chat_service.generate_response(message, session_id),
        media_type="text/event-stream"
    )
