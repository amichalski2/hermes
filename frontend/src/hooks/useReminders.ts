import { useState, useEffect } from 'react';
import { Reminder, ReminderCreate } from '../types/reminder';
import * as reminderApi from '../api/reminders';

export const useReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const data = await reminderApi.getReminders();
      setReminders(data);
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  };

  const addReminder = async (reminder: ReminderCreate) => {
    try {
      const newReminder = reminder as Reminder;
      setReminders([...reminders, newReminder]);
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  };

  const updateReminder = async (id: number, reminder: ReminderCreate) => {
    try {
      const updatedReminder = await reminderApi.updateReminder(id, reminder);
      setReminders(reminders.map(r => r.id === id ? updatedReminder : r));
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const deleteReminder = async (id: number) => {
    try {
      await reminderApi.deleteReminder(id);
      setReminders(reminders.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting reminder:', error);
    }
  };

  return { reminders, addReminder, updateReminder, deleteReminder };
};
