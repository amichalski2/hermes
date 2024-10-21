import React from 'react';
import './NavigationPanel.css';
import logo from '../assets/hermes_logo.png';
import Chatbot from './Chatbot';
import { NoteCreate } from '../types/note';

interface NavigationPanelProps {
  addReminder: (reminder: { text: string, date: string }) => void;
  addNote: (note: NoteCreate) => void;
}

const NavigationPanel: React.FC<NavigationPanelProps> = ({ addReminder, addNote }) => {
  return (
    <nav className="navigation-panel">
      <div className="logo">
        <img src={logo} alt="Logo" />
      </div>
      <Chatbot addReminder={addReminder} addNote={addNote} />
    </nav>
  );
};

export default NavigationPanel;
