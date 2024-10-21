from pydantic import BaseModel
from datetime import date
from typing import List, Optional

class ReminderCreate(BaseModel):
    text: str
    date: date

class Reminder(BaseModel):
    id: int
    text: str
    date: date

    class Config:
        orm_mode = True

class NoteCreate(BaseModel):
    title: str
    content: str

class Note(BaseModel):
    id: int
    title: str
    content: str
    date: date

    class Config:
        orm_mode = True
