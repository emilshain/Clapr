export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type ChatResponse = {
  reply: string;
};

export type ScriptParseRequest = {
  script: string;
  project_name?: string;
  time_limit?: string;
  platforms?: string[];
  reference_map?: Record<string, string>;
  notes?: string;
};

export type ParsedBeat = {
  id: number;
  title: string;
  frame: string;
  mood: string;
  duration: string;
};

export type ParsedScene = {
  id: number;
  title: string;
  location: string;
  time: string;
  description: string;
  shots: number;
  duration: string;
};

export type ParsedShot = {
  id: number;
  scene: string;
  size: string;
  motion: string;
  duration: string;
  model: string;
  refs: string;
  firstFrame: string;
  lastFrame?: string;
  prompt: string;
  status: string;
  note: string;
};

export type ScriptParseResponse = {
  beats: ParsedBeat[];
  scenes: ParsedScene[];
  shots: ParsedShot[];
  reference_map?: Record<string, string>;
};

const baseUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:8000';

export async function sendChat(messages: ChatMessage[], systemPrompt?: string): Promise<string> {
  const response = await fetch(`${baseUrl}/api/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ messages, system_prompt: systemPrompt }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || 'Failed to reach the backend.');
  }

  const data = (await response.json()) as ChatResponse;
  return data.reply;
}

export async function parseScript(request: ScriptParseRequest): Promise<ScriptParseResponse> {
  const response = await fetch(`${baseUrl}/api/script/parse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || 'Script parsing failed.');
  }

  return (await response.json()) as ScriptParseResponse;
}
