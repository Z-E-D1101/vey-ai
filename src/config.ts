import dotenv from 'dotenv';
import { LLMConfig } from './types.js';

dotenv.config();

function getLLMConfig(): LLMConfig {
  const provider = (process.env.LLM_PROVIDER as LLMConfig['provider']) || 'openai';
  
  switch (provider) {
    case 'anthropic':
      return {
        provider,
        model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
        maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '4096', 10),
      };
    case 'openrouter':
      return {
        provider,
        model: process.env.OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet',
        apiKey: process.env.OPENROUTER_API_KEY || '',
        temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
        maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '4096', 10),
      };
    default:
      return {
        provider,
        model: process.env.OPENAI_MODEL || 'gpt-4o',
        apiKey: process.env.OPENAI_API_KEY || '',
        temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
        maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '4096', 10),
      };
  }
}

export const config = {
  llm: getLLMConfig(),
  supabase: {
    url: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  },
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || '',
  },
  discord: {
    token: process.env.DISCORD_BOT_TOKEN || '',
  },
  gateway: {
    port: parseInt(process.env.GATEWAY_PORT || '3000', 10),
  },
};
