from sqlalchemy.orm import Session
from models.pydantic import ReminderCreate
from models.models import ReminderModel
from fastapi import HTTPException

class ReminderCRUD:
    @staticmethod
    def get_reminders(db: Session, skip: int = 0, limit: int = 100):
        return db.query(models.ReminderModel).offset(skip).limit(limit).all()

    @staticmethod
    def create_reminder(db: Session, reminder: ReminderCreate):
        db_reminder = models.ReminderModel(**reminder.dict())
        db.add(db_reminder)
        db.commit()
        db.refresh(db_reminder)
        return db_reminder

    @staticmethod
    def delete_reminder(db: Session, reminder_id: int):
        reminder = db.query(models.ReminderModel).filter(models.ReminderModel.id == reminder_id).first()
        if reminder is None:
            raise HTTPException(status_code=404, detail="Reminder not found")
        db.delete(reminder)
        db.commit()
        return {"message": "Reminder deleted successfully"}

    @staticmethod
    def update_reminder(db: Session, reminder_id: int, reminder: ReminderCreate):
        db_reminder = db.query(models.ReminderModel).filter(models.ReminderModel.id == reminder_id).first()
        if db_reminder is None:
            raise HTTPException(status_code=404, detail="Reminder not found")
        for key, value in reminder.dict().items():
            setattr(db_reminder, key, value)
        db.commit()
        db.refresh(db_reminder)
        return db_reminder
