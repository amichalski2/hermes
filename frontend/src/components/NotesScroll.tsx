import React, { useEffect, useState } from 'react';
import { BiSolidEditAlt, BiSolidTrashAlt } from "react-icons/bi";
import './NotesScroll.css';
import { Note } from '../types/note';
import { getNotes, deleteNote, updateNote } from '../api/notes';
import { NoteCreate } from '../types/note';

interface NotesScrollProps {
  newNote: NoteCreate | null;
}

const NotesScroll: React.FC<NotesScrollProps> = ({ newNote }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    if (newNote) {
      setNotes(prevNotes => [newNote as Note, ...prevNotes]);
    }
  }, [newNote]);

  const fetchNotes = async () => {
    try {
      const fetchedNotes = await getNotes();
      setNotes(fetchedNotes);
    } catch (error) {
      console.error("Error fetching notes:", error);
    }
  };

  const handleDeleteNote = async (id: number) => {
    await deleteNote(id);
    setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
  };

  const handleUpdateNote = async (id: number, updatedNote: Note) => {
    const updated = await updateNote(id, updatedNote);
    setNotes(prevNotes => prevNotes.map(note => note.id === id ? updated : note));
    setEditingNote(null);
  };

  const handleCancelEdit = () => {
    setEditingNote(null);
  };

  return (
    <div className="notes-scroll">
      {notes.map((note) => (
        <div key={note.id} className="note-item">
          {editingNote && editingNote.id === note.id ? (
            <div className="note-edit">
              <input
                type="text"
                value={editingNote.title}
                onChange={(e) => setEditingNote({...editingNote, title: e.target.value})}
              />
              <textarea
                value={editingNote.content}
                onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
              />
              <button onClick={() => handleUpdateNote(note.id, editingNote)}>Zapisz</button>
              <button onClick={handleCancelEdit}>Anuluj</button>
            </div>
          ) : (
            <>
              <div className="note-header">
                <h3>{note.title}</h3>
                <p className="note-date">Data: {note.date}</p>
              </div>
              <div className="note-actions">
                <button 
                  className="icon-button edit-button" 
                  aria-label="Edytuj"
                  onClick={() => handleEditNote(note)}
                >
                  <BiSolidEditAlt />
                </button>
                <button 
                  className="icon-button delete-button" 
                  aria-label="Usuń"
                  onClick={() => handleDeleteNote(note.id)}
                >
                  <BiSolidTrashAlt />
                </button>
              </div>
              <p className="note-content">{note.content}</p>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default NotesScroll;
