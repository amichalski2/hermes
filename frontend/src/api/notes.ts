import axios from 'axios';
import { Note, NoteCreate } from '../types/note';

const API_URL = 'http://localhost:8000';

export const getNotes = async (): Promise<Note[]> => {
  const response = await axios.get(`${API_URL}/notes/`);
  return response.data;
};

export const createNote = async (note: NoteCreate): Promise<Note> => {
  const response = await axios.post(`${API_URL}/notes/`, note);
  return response.data;
};

export const createRawNote = async (note: NoteCreate): Promise<Note> => {
  const response = await axios.post(`${API_URL}/notes/raw/`, note);
  return response.data;
};

export const deleteNote = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/notes/${id}`);
};

export const updateNote = async (id: number, note: NoteCreate): Promise<Note> => {
  const response = await axios.put(`${API_URL}/notes/${id}`, note);
  return response.data;
};
