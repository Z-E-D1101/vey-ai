import { Telegraf } from 'telegraf';
import { Agent } from '../agent.js';
import { config } from '../config.js';

if (!config.telegram.token) {
  console.error('TELEGRAM_BOT_TOKEN not set');
  process.exit(1);
}

const bot = new Telegraf(config.telegram.token);
const agents = new Map<string, Agent>();

function getAgent(chatId: string): Agent {
  if (!agents.has(chatId)) {
    agents.set(chatId, new Agent(`telegram-${chatId}`));
  }
  return agents.get(chatId)!;
}

bot.start((ctx) => {
  ctx.reply('Hello! I am your personal AI assistant. I remember our conversations and learn from them. How can I help you today?');
});

bot.on('text', async (ctx) => {
  const chatId = String(ctx.chat.id);
  const agent = getAgent(chatId);
  
  try {
    const response = await agent.sendMessage(ctx.message.text);
    await ctx.reply(response.content);
  } catch (err) {
    console.error('Telegram error:', err);
    await ctx.reply('Sorry, I encountered an error processing your message.');
  }
});

bot.launch(() => {
  console.log('Telegram bot started');
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
