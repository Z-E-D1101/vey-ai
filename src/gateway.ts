import express from 'express';
import cors from 'cors';
import { Agent } from './agent.js';
import * as db from './db.js';
import { config } from './config.js';

const app = express();
app.use(cors());
app.use(express.json());

const agents = new Map<string, Agent>();

function getAgent(conversationId: string): Agent {
  if (!agents.has(conversationId)) {
    agents.set(conversationId, new Agent(conversationId));
  }
  return agents.get(conversationId)!;
}

app.post('/chat/:conversationId?', async (req, res) => {
  try {
    const conversationId = (req.params as { conversationId?: string }).conversationId ?? 'default';
    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'message is required' });
      return;
    }
    const agent = getAgent(conversationId);
    const response = await agent.sendMessage(message);
    res.json({
      conversationId,
      response: response.content,
      skillUsed: response.skillUsed,
      model: response.model,
    });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get('/conversations', async (_req, res) => {
  try {
    const conversations = await db.listConversations();
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get('/conversations/:id', async (req, res) => {
  try {
    const conversation = await db.getConversation(req.params.id);
    if (!conversation) {
      res.status(404).json({ error: 'Conversation not found' });
      return;
    }
    res.json(conversation);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get('/profile', async (_req, res) => {
  try {
    const profile = await db.getUserProfile();
    res.json(profile || { name: 'User', facts: [], preferences: {} });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get('/skills', async (_req, res) => {
  try {
    const skills = await db.getSkills();
    res.json(skills);
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : String(err) });
  }
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(config.gateway.port, () => {
  console.log(`AI Assistant Gateway listening on port ${config.gateway.port}`);
});
