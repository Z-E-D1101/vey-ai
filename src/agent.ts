import { LLMProvider } from './llm.js';
import * as db from './db.js';
import { Message, AgentResponse, Skill, Conversation, UserProfile } from './types.js';
import { config } from './config.js';

const SYSTEM_PROMPT = `You are a personal AI assistant that learns and grows with your user over time.

Key behaviors:
1. Remember past conversations and reference them when relevant
2. Build a model of the user from their stated preferences, habits, and facts
3. Use learned skills when appropriate — they represent reusable capabilities you've developed
4. Be proactive: suggest helpful actions based on what you know about the user
5. Keep responses concise but informative

When you learn something new about the user, explicitly state: "LEARNED: [fact]"
When you believe a new skill should be created from a completed task, state: "SKILL: [name] | [description] | [trigger phrases comma-separated] | [prompt template]"

Current user facts will be injected below. Use them to personalize your responses.`;

export class Agent {
  private llm: LLMProvider;
  private conversationId: string;

  constructor(conversationId = 'default') {
    this.llm = new LLMProvider(config.llm);
    this.conversationId = conversationId;
  }

  async sendMessage(content: string): Promise<AgentResponse> {
    const conversation = await db.getOrCreateConversation(this.conversationId);
    const profile = await db.getUserProfile();
    const skills = await db.getSkills();

    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    await db.appendMessage(this.conversationId, userMessage);

    const skill = await db.getSkillByTrigger(content);
    const messages = await this.buildMessages(conversation, profile, skills, skill);

    const response = await this.llm.chat(messages);

    await this.processResponse(response.content);

    const assistantMessage: Message = {
      role: 'assistant',
      content: response.content,
      timestamp: new Date().toISOString(),
    };
    await db.appendMessage(this.conversationId, assistantMessage);

    return { ...response, skillUsed: skill?.name };
  }

  private async buildMessages(
    conversation: Conversation,
    profile: UserProfile | null,
    skills: Skill[],
    matchedSkill: Skill | null
  ): Promise<Message[]> {
    const contextParts: string[] = [];

    if (profile) {
      contextParts.push(`User name: ${profile.name}`);
      if (profile.facts.length > 0) {
        contextParts.push(`Known facts: ${profile.facts.join('; ')}`);
      }
      if (Object.keys(profile.preferences).length > 0) {
        contextParts.push(`Preferences: ${JSON.stringify(profile.preferences)}`);
      }
    }

    if (skills.length > 0) {
      contextParts.push(`Available skills: ${skills.map(s => `${s.name} (${s.trigger_phrases.join(', ')})`).join('; ')}`);
    }

    if (matchedSkill) {
      contextParts.push(`Active skill "${matchedSkill.name}": ${matchedSkill.prompt_template}`);
    }

    const systemContent = contextParts.length > 0
      ? `${SYSTEM_PROMPT}\n\n--- USER CONTEXT ---\n${contextParts.join('\n')}`
      : SYSTEM_PROMPT;

    const recentMessages = conversation.messages.slice(-20);

    return [
      { role: 'system', content: systemContent, timestamp: new Date().toISOString() },
      ...recentMessages.map(m => ({ role: m.role, content: m.content, timestamp: m.timestamp })),
    ];
  }

  private async processResponse(content: string): Promise<void> {
    const learnMatches = content.match(/LEARNED:\s*(.+?)(?=\n|$)/g);
    if (learnMatches) {
      for (const match of learnMatches) {
        const fact = match.replace(/LEARNED:\s*/, '').trim();
        if (fact) await db.addUserFact(fact);
      }
    }

    const skillMatch = content.match(/SKILL:\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)(?=\n|$)/);
    if (skillMatch) {
      const [, name, description, triggers, template] = skillMatch;
      await db.createSkill({
        name: name.trim(),
        description: description.trim(),
        trigger_phrases: triggers.split(',').map(t => t.trim()),
        prompt_template: template.trim(),
      });
    }
  }

  async getHistory(): Promise<Message[]> {
    const conversation = await db.getConversation(this.conversationId);
    return conversation?.messages || [];
  }

  setConversationId(id: string): void {
    this.conversationId = id;
  }
}
