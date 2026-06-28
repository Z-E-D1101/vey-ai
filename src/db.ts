import { createClient } from '@supabase/supabase-js';
import { config } from './config.js';
import { Conversation, UserProfile, Skill, ScheduledTask } from './types.js';

const supabase = createClient(config.supabase.url, config.supabase.serviceRoleKey);

export async function getConversation(id: string): Promise<Conversation | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Conversation | null;
}

export async function getOrCreateConversation(id: string, title = 'New Conversation'): Promise<Conversation> {
  const existing = await getConversation(id);
  if (existing) return existing;
  
  const { data, error } = await supabase
    .from('conversations')
    .insert({ id, title, messages: [] })
    .select()
    .single();
  if (error) throw error;
  return data as Conversation;
}

export async function appendMessage(conversationId: string, message: { role: string; content: string; timestamp: string }): Promise<void> {
  const conv = await getConversation(conversationId);
  if (!conv) throw new Error(`Conversation ${conversationId} not found`);
  
  const messages = [...conv.messages, message];
  const { error } = await supabase
    .from('conversations')
    .update({ messages, updated_at: new Date().toISOString() })
    .eq('id', conversationId);
  if (error) throw error;
}

export async function listConversations(limit = 50): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data as Conversation[]) || [];
}

export async function getUserProfile(): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .maybeSingle();
  if (error) throw error;
  return data as UserProfile | null;
}

export async function updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
  const profile = await getUserProfile();
  if (profile) {
    const { error } = await supabase
      .from('user_profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', profile.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('user_profiles')
      .insert({ name: 'User', preferences: {}, facts: [], ...updates });
    if (error) throw error;
  }
}

export async function addUserFact(fact: string): Promise<void> {
  const profile = await getUserProfile();
  const facts = profile ? [...profile.facts, fact] : [fact];
  await updateUserProfile({ facts });
}

export async function getSkills(): Promise<Skill[]> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .order('usage_count', { ascending: false });
  if (error) throw error;
  return (data as Skill[]) || [];
}

export async function getSkillByTrigger(phrase: string): Promise<Skill | null> {
  const skills = await getSkills();
  return skills.find(s => s.trigger_phrases.some(t => phrase.toLowerCase().includes(t.toLowerCase()))) || null;
}

export async function createSkill(skill: Omit<Skill, 'id' | 'created_at' | 'updated_at' | 'usage_count'>): Promise<Skill> {
  const { data, error } = await supabase
    .from('skills')
    .insert({ ...skill, usage_count: 0 })
    .select()
    .single();
  if (error) throw error;
  return data as Skill;
}

export async function incrementSkillUsage(skillId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_skill_usage', { skill_id: skillId });
  if (error) {
    const { error: updateError } = await supabase
      .from('skills')
      .update({ usage_count: supabase.rpc('increment', { x: 1 }) as unknown as number })
      .eq('id', skillId);
    if (updateError) throw updateError;
  }
}

export async function getScheduledTasks(): Promise<ScheduledTask[]> {
  const { data, error } = await supabase
    .from('scheduled_tasks')
    .select('*')
    .eq('is_active', true);
  if (error) throw error;
  return (data as ScheduledTask[]) || [];
}

export async function createScheduledTask(task: Omit<ScheduledTask, 'id' | 'created_at' | 'last_run' | 'next_run'>): Promise<ScheduledTask> {
  const { data, error } = await supabase
    .from('scheduled_tasks')
    .insert(task)
    .select()
    .single();
  if (error) throw error;
  return data as ScheduledTask;
}

export async function updateTaskLastRun(taskId: string, lastRun: string, nextRun: string | undefined): Promise<void> {
  const { error } = await supabase
    .from('scheduled_tasks')
    .update({ last_run: lastRun, next_run: nextRun })
    .eq('id', taskId);
  if (error) throw error;
}

export { supabase };
