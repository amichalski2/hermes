import { useState } from 'react';
import './App.css';
import NavigationPanel from './components/NavigationPanel';
import NotesScroll from './components/NotesScroll';
import Reminders from './components/Reminders';
import { NoteCreate } from './types/note';
import { Reminder } from './types/reminder';

const App: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [newNote, setNewNote] = useState<NoteCreate | null>(null);

  const addReminder = (reminder: { text: string; date: string }) => {
    setReminders([...reminders, { ...reminder, id: Date.now() }]);
  };

  const addNote = (note: NoteCreate) => {
    setNewNote(note);
  };

  const updateReminder = (id: number, updatedReminder: { text: string; date: string }) => {
    setReminders(reminders.map(reminder => 
      reminder.id === id ? { ...reminder, ...updatedReminder } : reminder
    ));
  };

  const deleteReminder = (id: number) => {
    setReminders(reminders.filter(reminder => reminder.id !== id));
  };

  return (
    <div className="App">
      <NavigationPanel addReminder={addReminder} addNote={addNote} />
      <NotesScroll newNote={newNote} />
      <Reminders 
        reminders={reminders} 
        updateReminder={updateReminder} 
        deleteReminder={deleteReminder}
      />
    </div>
  );
}

export default App;
