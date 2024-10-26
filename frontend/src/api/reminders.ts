import axios from 'axios';
import { Reminder, ReminderCreate } from '../types/reminder';

const API_URL = 'http://localhost:8000';

export const getReminders = async (): Promise<Reminder[]> => {
  const response = await axios.get(`${API_URL}/reminders/`);
  return response.data;
};

export const createReminder = async (reminder: { text: string; date: string }): Promise<void> => {
  await axios.post(`${API_URL}/reminders/`, reminder);
};

export const updateReminder = async (id: number, reminder: ReminderCreate): Promise<Reminder> => {
  const response = await axios.put(`${API_URL}/reminders/${id}`, reminder);
  return response.data;
};

export const deleteReminder = async (id: number): Promise<void> => {
  await axios.delete(`${API_URL}/reminders/${id}`);
};
