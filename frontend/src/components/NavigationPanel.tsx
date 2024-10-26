import React from 'react';
import './NavigationPanel.css';
import Chatbot from './Chatbot';
import { NoteCreate } from '../types/note';

interface NavigationPanelProps {
  addReminder: (reminder: { text: string, date: string }) => void;
  addNote: (note: NoteCreate) => void;
}

const NavigationPanel: React.FC<NavigationPanelProps> = ({ addReminder, addNote }) => {
  return (
    <nav className="navigation-panel">
      <Chatbot addReminder={addReminder} addNote={addNote} />
    </nav>
  );
};

export default NavigationPanel;
