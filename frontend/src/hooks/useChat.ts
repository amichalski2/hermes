import { useState, useCallback, useRef } from 'react';
import { Message } from '../types/chat';
import { streamMessage } from '../api/chat';

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref do przechowywania aktualnej wiadomości podczas streamingu
  const currentMessageRef = useRef<string>('');
  
  const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const addMessage = useCallback((content: string, isUser: boolean, status: Message['status'] = 'complete') => {
    const newMessage: Message = {
      id: generateMessageId(),
      content,
      isUser,
      timestamp: new Date(),
      status
    };
    
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages(prev => 
      prev.map(message => 
        message.id === id 
          ? { ...message, ...updates }
          : message
      )
    );
  }, []);

  const handleStreamToken = useCallback((token: string, messageId: string) => {
    currentMessageRef.current += token;
    updateMessage(messageId, {
      content: currentMessageRef.current
    });
  }, [updateMessage]);

  const sendChatMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    setError(null);
    currentMessageRef.current = ''; // Reset current message content

    // Dodaj wiadomość użytkownika
    addMessage(content, true);

    // Dodaj pustą wiadomość AI ze statusem 'streaming'
    const aiMessageId = addMessage('', false, 'streaming');

    try {
      await streamMessage({
        message: content,
        onToken: (token) => handleStreamToken(token, aiMessageId),
        onError: (error) => {
          const errorMessage = "Przepraszam, wystąpił problem z połączeniem. Spróbuj ponownie za chwilę.";
          updateMessage(aiMessageId, {
            content: errorMessage,
            status: 'error'
          });
          setError(errorMessage);
          console.error('Streaming error:', error);
        },
        onComplete: () => {
          updateMessage(aiMessageId, { status: 'complete' });
        }
      });
    } catch (error) {
      const errorMessage = "Wystąpił nieoczekiwany błąd. Spróbuj ponownie za chwilę.";
      setError(errorMessage);
      updateMessage(aiMessageId, {
        content: errorMessage,
        status: 'error'
      });
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  }, [addMessage, updateMessage, handleStreamToken]);

  return {
    messages,
    isLoading,
    error,
    sendChatMessage,
  };
};