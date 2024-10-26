// api/chat.ts
interface StreamMessageOptions {
  message: string;
  onToken: (token: string) => void;
  onError: (error: Error) => void;
  onComplete: () => void;
}

const API_URL = 'http://localhost:8000';

export const streamMessage = async ({
  message,
  onToken,
  onError,
  onComplete
}: StreamMessageOptions): Promise<void> => {
  const controller = new AbortController();
  
  try {
    const response = await fetch(
      `${API_URL}/chat/?message=${encodeURIComponent(message)}`,
      {
        signal: controller.signal,
        headers: {
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    while (reader) {
      const { done, value } = await reader.read();
      
      if (done) {
        onComplete();
        break;
      }

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          
          if (data === '[DONE]') {
            onComplete();
            return;
          }

          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              onError(new Error(parsed.error));
              return;
            }
            if (parsed.token) {
              onToken(parsed.token);
            }
          } catch (e) {
            console.warn('Failed to parse streaming data:', e);
          }
        }
      }
    }
  } catch (error) {
    onError(error instanceof Error ? error : new Error('Unknown error occurred'));
    throw error;
  }
};