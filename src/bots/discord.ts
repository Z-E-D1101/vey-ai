import { Client, GatewayIntentBits, Events } from 'discord.js';
import { Agent } from '../agent.js';
import { config } from '../config.js';

if (!config.discord.token) {
  console.error('DISCORD_BOT_TOKEN not set');
  process.exit(1);
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const agents = new Map<string, Agent>();

function getAgent(channelId: string): Agent {
  if (!agents.has(channelId)) {
    agents.set(channelId, new Agent(`discord-${channelId}`));
  }
  return agents.get(channelId)!;
}

client.once(Events.ClientReady, (readyClient) => {
  console.log(`Discord bot logged in as ${readyClient.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  const channelId = message.channel.id;
  const agent = getAgent(channelId);

  try {
    const response = await agent.sendMessage(message.content);
    await message.reply(response.content);
  } catch (err) {
    console.error('Discord error:', err);
    await message.reply('Sorry, I encountered an error processing your message.');
  }
});

client.login(config.discord.token);
