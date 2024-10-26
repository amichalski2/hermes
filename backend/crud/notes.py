import logging
from sqlalchemy.orm import Session
from models.pydantic import NoteCreate
from models.models import NoteModel
from fastapi import HTTPException
from services.note_service import process_note, process_raw_note, add_note_to_vector_store, delete_note_from_vector_store

class NoteCRUD:
    @staticmethod
    def get_notes(db: Session, skip: int = 0, limit: int = 100):
        notes = db.query(NoteModel).offset(skip).limit(limit).all()
        return notes

    @staticmethod
    async def create_note(db: Session, note: NoteCreate, raw: bool = False):
        print(f"Creating new {'raw' if raw else 'processed'} note")
        try:
            if raw:
                content, title, current_date = await process_raw_note(note.content)
            else:
                content, title, current_date = await process_note(note.content)
            
            db_note = NoteModel(
                content=content,
                title=title,
                date=current_date
            )
            db.add(db_note)
            db.commit()
            db.refresh(db_note)

            await add_note_to_vector_store(
                content=content,
                note_id=db_note.id,
                title=title,
                date=current_date
            )
            
            return db_note
            
        except Exception as e:
            db.rollback()
            raise

    @staticmethod
    async def delete_note(db: Session, note_id: int):
        
        note = db.query(NoteModel).filter(NoteModel.id == note_id).first()
        if note is None:
            raise HTTPException(status_code=404, detail="Note not found")
        
        try:
            await delete_note_from_vector_store(note_id)
            
            db.delete(note)
            db.commit()

            return {"message": "Note deleted successfully"}
            
        except Exception as e:
            db.rollback()
            raise

    @staticmethod
    def update_note(db: Session, note_id: int, note: NoteCreate):
        
        db_note = db.query(NoteModel).filter(NoteModel.id == note_id).first()
        if db_note is None:
            raise HTTPException(status_code=404, detail="Note not found")
        
        try:
            for key, value in note.dict().items():
                setattr(db_note, key, value)
            db.commit()
            db.refresh(db_note)
            return db_note
            
        except Exception as e:
            db.rollback()
            raise