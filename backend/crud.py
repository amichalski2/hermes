from sqlalchemy.orm import Session
import models
import schemas
from fastapi import HTTPException
from services import process_note, process_raw_note
from sqlalchemy.exc import SQLAlchemyError
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_reminders(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ReminderModel).offset(skip).limit(limit).all()

def create_reminder(db: Session, reminder: schemas.ReminderCreate):
    db_reminder = models.ReminderModel(**reminder.dict())
    db.add(db_reminder)
    db.commit()
    db.refresh(db_reminder)
    return db_reminder

def delete_reminder(db: Session, reminder_id: int):
    reminder = db.query(models.ReminderModel).filter(models.ReminderModel.id == reminder_id).first()
    if reminder is None:
        raise HTTPException(status_code=404, detail="Reminder not found")
    db.delete(reminder)
    db.commit()
    return {"message": "Reminder deleted successfully"}

def update_reminder(db: Session, reminder_id: int, reminder: schemas.ReminderCreate):
    db_reminder = db.query(models.ReminderModel).filter(models.ReminderModel.id == reminder_id).first()
    if db_reminder is None:
        raise HTTPException(status_code=404, detail="Reminder not found")
    for key, value in reminder.dict().items():
        setattr(db_reminder, key, value)
    db.commit()
    db.refresh(db_reminder)
    return db_reminder

def get_notes(db: Session, skip: int = 0, limit: int = 100):
    logger.info(f"Fetching notes. Skip: {skip}, Limit: {limit}")
    notes = db.query(models.NoteModel).offset(skip).limit(limit).all()
    logger.info(f"Fetched {len(notes)} notes")
    return notes

def create_note(db: Session, note: schemas.NoteCreate, raw: bool = False):
    logger.info(f"Creating note. Raw: {raw}")
    if raw:
        content, title, current_date = process_raw_note(note.content)
    else:
        content, title, current_date = process_note(note.content)
    
    logger.info(f"Processed note. Title: {title}, Date: {current_date}")
    
    db_note = models.NoteModel(
        content=content,
        title=title,
        date=current_date
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    logger.info(f"Note created with ID: {db_note.id}")
    return db_note

def delete_note(db: Session, note_id: int):
    note = db.query(models.NoteModel).filter(models.NoteModel.id == note_id).first()
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(note)
    db.commit()
    return {"message": "Note deleted successfully"}

def update_note(db: Session, note_id: int, note: schemas.NoteCreate):
    db_note = db.query(models.NoteModel).filter(models.NoteModel.id == note_id).first()
    if db_note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    for key, value in note.dict().items():
        setattr(db_note, key, value)
    db.commit()
    db.refresh(db_note)
    return db_note
