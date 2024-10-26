export interface Message {
    id: string;
    content: string;
    isUser: boolean;
    timestamp: Date;
    status: 'pending' | 'streaming' | 'complete' | 'error';
  }