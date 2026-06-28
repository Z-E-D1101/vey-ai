export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  preferences: Record<string, unknown>;
  facts: string[];
  created_at: string;
  updated_at: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  trigger_phrases: string[];
  prompt_template: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface ScheduledTask {
  id: string;
  name: string;
  cron_expression: string;
  prompt: string;
  channel: 'cli' | 'telegram' | 'discord';
  destination_id: string | null;
  is_active: boolean;
  last_run: string | null;
  next_run: string | null;
  created_at: string;
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'openrouter';
  model: string;
  apiKey: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AgentResponse {
  content: string;
  skillUsed?: string;
  model: string;
}
