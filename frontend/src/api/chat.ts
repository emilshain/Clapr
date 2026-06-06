export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type ChatResponse = {
  reply: string;
};

const baseUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:8000';

export async function sendChat(messages: ChatMessage[]): Promise<string> {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || 'Failed to reach the backend.');
  }

  const data = (await response.json()) as ChatResponse;
  return data.reply;
}
