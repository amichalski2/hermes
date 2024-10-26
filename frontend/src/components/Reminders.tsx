import React, { useState } from 'react';
import { BiSolidEditAlt, BiSolidTrashAlt, BiCheck, BiX } from "react-icons/bi";
import './Reminders.css';
import { Reminder } from '../types/reminder';

interface RemindersProps {
  reminders: Reminder[];
  updateReminder: (id: number, reminder: { text: string, date: string }) => void;
  deleteReminder: (id: number) => void;
}

const Reminders: React.FC<RemindersProps> = ({ reminders, updateReminder, deleteReminder }) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');

  const handleDelete = (id: number) => {
    deleteReminder(id);
  };

  const handleEdit = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setEditText(reminder.text);
  };

  const handleSave = (id: number) => {
    updateReminder(id, { text: editText, date: new Date().toISOString().split('T')[0] });
    setEditingId(null);

  };

  const handleCancel = () => {
    setEditingId(null);
    setEditText('');
  };

  if (!reminders) {
    return <div>Loading reminders...</div>;
  }

  return (
    <div className="reminders">
      <ul className="reminders-list">
        {reminders.map(reminder => (
          <li key={reminder.id} className="reminder-item">
            {editingId === reminder.id ? (
              <div className="reminder-edit">
                <input 
                  type="text" 
                  value={editText} 
                  onChange={(e) => setEditText(e.target.value)}
                />
                <div className="reminder-edit-actions">
                  <button onClick={() => handleSave(reminder.id)} aria-label="Zapisz">
                    <BiCheck />
                  </button>
                  <button onClick={handleCancel} aria-label="Anuluj">
                    <BiX />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="reminder-text">{reminder.text}</span>
                <span className="reminder-date">{reminder.date}</span>
                <div className="reminder-actions">
                  <button onClick={() => handleEdit(reminder)} aria-label="Edytuj">
                    <BiSolidEditAlt />
                  </button>
                  <button onClick={() => handleDelete(reminder.id)} aria-label="Usuń">
                    <BiSolidTrashAlt />
                  </button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Reminders;
