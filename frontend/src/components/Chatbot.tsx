import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import './Chatbot.css';
import { NoteCreate } from '../types/note';
import { createNote, createRawNote } from '../api/notes';
import { useChat } from '../hooks/useChat';

interface ChatbotProps {
  addReminder: (reminder: { text: string; date: string }) => void;
  addNote: (note: NoteCreate) => void;
}

const commands = [
  { name: 'add', description: 'Dodaj nową notatkę' },
  { name: 'add_raw', description: 'Dodaj nową notatkę bez przetwarzania' },
  { name: 'remind', description: 'Ustaw przypomnienie' },
];

const Chatbot: React.FC<ChatbotProps> = ({ addReminder, addNote }) => {
  const [inputValue, setInputValue] = useState('');
  const [showCommands, setShowCommands] = useState(false);
  const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
  const [activeCommand, setActiveCommand] = useState('');
  const [isCommandSelected, setIsCommandSelected] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const commandPlaceholderRef = useRef<HTMLDivElement>(null);
  const commandListRef = useRef<HTMLDivElement>(null);
  const [filteredCommands, setFilteredCommands] = useState(commands);
  const { messages, sendChatMessage } = useChat();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node) &&
        commandListRef.current &&
        !commandListRef.current.contains(event.target as Node) &&
        commandPlaceholderRef.current &&
        !commandPlaceholderRef.current.contains(event.target as Node)
      ) {
        setShowCommands(false);
        setIsCommandSelected(false);
      }
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (value.startsWith('/')) {
      const commandPart = value.slice(1).toLowerCase();
      const filtered = commands.filter(cmd => cmd.name.toLowerCase().startsWith(commandPart));
      setFilteredCommands(filtered);
      setShowCommands(filtered.length > 0);
      setSelectedCommandIndex(0);
      setActiveCommand(commandPart);
    } else {
      setShowCommands(false);
      setFilteredCommands(commands);
    }
    setIsCommandSelected(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (showCommands) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedCommandIndex((prevIndex) => (prevIndex + 1) % filteredCommands.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedCommandIndex((prevIndex) => (prevIndex - 1 + filteredCommands.length) % filteredCommands.length);
          break;
        case 'Enter':
          e.preventDefault();
          handleCommandSelect(filteredCommands[selectedCommandIndex].name);
          break;
        case 'Escape':
          e.preventDefault();
          setShowCommands(false);
          break;
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Backspace') {
      const textarea = textareaRef.current;
      if (textarea && activeCommand && (textarea.selectionStart === 0 || isCommandSelected)) {
        e.preventDefault();
        if (isCommandSelected) {
          cancelCommand();
        } else {
          setIsCommandSelected(true);
        }
      } else {
        setIsCommandSelected(false);
      }
    } else {
      setIsCommandSelected(false);
    }
  };

  const handleCommandSelect = (commandName: string) => {
    setActiveCommand(commandName);
    setInputValue('');
    setShowCommands(false);
    setIsCommandSelected(false);
    textareaRef.current?.focus();
  };

  const cancelCommand = () => {
    setActiveCommand('');
    setInputValue('');
    setShowCommands(false);
    setIsCommandSelected(false);
    textareaRef.current?.focus();
  };

  const handleSubmit = async () => {
    const content = inputValue.trim();
    console.log(`Submitting content: "${content}" with active command: "${activeCommand}"`);

    if (content === '') return;

    setInputValue('');
    const commandToExecute = activeCommand;
    setActiveCommand('');
    setIsCommandSelected(false);

    switch (commandToExecute) {
      case 'remind':
        console.log('Adding reminder');
        addReminder({ text: content, date: new Date().toISOString().split('T')[0] });
        break;
        
      case 'add_raw':
        console.log('Adding raw note');
        try {
          const newNote: NoteCreate = {
            title: content.split('\n')[0] || 'Nowa notatka',
            content,
          };
          const createdNote = await createRawNote(newNote);
          addNote(createdNote);
        } catch (error) {
          console.error('Error creating raw note:', error);
        }
        break;
        
      case 'add':
        console.log('Adding processed note');
        try {
          const newNote: NoteCreate = {
            title: 'Nowa notatka',
            content,
          };
          const createdNote = await createNote(newNote);
          addNote(createdNote);
        } catch (error) {
          console.error('Error creating processed note:', error);
        }
        break;
        
      default:
        console.log("Sending message to AI:", content);
        await sendChatMessage(content);
    }
};

  const handleCommandClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCommandSelected(true);
    textareaRef.current?.focus();
  };

  return (
    <div className="chatbot-area">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.isUser ? 'user' : 'ai'}`}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        ))}
      </div>
      <div className="chat-input-container">
        <div className="chat-input">
          {activeCommand && (
            <div 
              ref={commandPlaceholderRef}
              className={`command-placeholder ${isCommandSelected ? 'selected' : ''}`}
              onClick={handleCommandClick}
            >
              /{activeCommand}
            </div>
          )}
          <textarea 
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={activeCommand ? "" : "Wpisz / aby użyć komendy"}
            rows={1}
          />
          <button aria-label="Wyślij" onClick={handleSubmit}>
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
        {showCommands && (
          <div className="command-list" ref={commandListRef}>
            {filteredCommands.map((command, index) => (
              <div 
                key={command.name} 
                className={`command-item ${index === selectedCommandIndex ? 'selected' : ''}`}
                onClick={() => handleCommandSelect(command.name)}
              >
                <span className="command-name">/{command.name}</span>
                <span className="command-description">{command.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
