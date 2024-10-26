from sqlalchemy import Column, Integer, String, Date, Text, ARRAY
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class ReminderModel(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    text = Column(String, index=True)
    date = Column(Date)

class NoteModel(Base):
    __tablename__ = "notes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    content = Column(Text)
    date = Column(Date)