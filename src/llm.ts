import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { LLMConfig, Message, AgentResponse } from './types.js';

export class LLMProvider {
  private config: LLMConfig;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  async chat(messages: Message[]): Promise<AgentResponse> {
    switch (this.config.provider) {
      case 'anthropic':
        return this.chatAnthropic(messages);
      case 'openrouter':
        return this.chatOpenRouter(messages);
      default:
        return this.chatOpenAI(messages);
    }
  }

  private async chatOpenAI(messages: Message[]): Promise<AgentResponse> {
    const client = new OpenAI({ apiKey: this.config.apiKey });
    const response = await client.chat.completions.create({
      model: this.config.model,
      messages: messages.map(m => ({ role: m.role as 'system' | 'user' | 'assistant', content: m.content })),
      temperature: this.config.temperature,
      max_tokens: this.config.maxTokens,
    });
    return {
      content: response.choices[0]?.message?.content || '',
      model: this.config.model,
    };
  }

  private async chatAnthropic(messages: Message[]): Promise<AgentResponse> {
    const client = new Anthropic({ apiKey: this.config.apiKey });
    const systemMsg = messages.find(m => m.role === 'system');
    const chatMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
    
    const response = await client.messages.create({
      model: this.config.model,
      max_tokens: this.config.maxTokens || 4096,
      temperature: this.config.temperature,
      system: systemMsg?.content || undefined,
      messages: chatMessages,
    });
    const content = response.content[0];
    return {
      content: content.type === 'text' ? content.text : '',
      model: this.config.model,
    };
  }

  private async chatOpenRouter(messages: Message[]): Promise<AgentResponse> {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://personal-ai-assistant.local',
        'X-Title': 'Personal AI Assistant',
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
    return {
      content: data.choices?.[0]?.message?.content || '',
      model: this.config.model,
    };
  }
}
