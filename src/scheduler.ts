import cron from 'node-cron';
import { Agent } from './agent.js';
import * as db from './db.js';
import { ScheduledTask } from './types.js';

function getNextRun(cronExpression: string): Date | null {
  try {
    const parts = cronExpression.split(' ');
    if (parts.length !== 5) return null;
    const now = new Date();
    const next = new Date(now);
    next.setMinutes(next.getMinutes() + 1);
    return next;
  } catch {
    return null;
  }
}

async function executeTask(task: ScheduledTask): Promise<void> {
  console.log(`Executing scheduled task: ${task.name}`);
  const agent = new Agent(`scheduled-${task.id}`);
  try {
    const response = await agent.sendMessage(task.prompt);
    console.log(`Task ${task.name} result: ${response.content}`);
    if (task.channel === 'telegram' && task.destination_id) {
      console.log(`Would send to Telegram ${task.destination_id}: ${response.content}`);
    }
    if (task.channel === 'discord' && task.destination_id) {
      console.log(`Would send to Discord ${task.destination_id}: ${response.content}`);
    }
  } catch (err) {
    console.error(`Task ${task.name} failed:`, err);
  }
}

async function loadTasks(): Promise<void> {
  const tasks = await db.getScheduledTasks();
  for (const task of tasks) {
    if (!task.is_active) continue;
    if (!cron.validate(task.cron_expression)) {
      console.error(`Invalid cron expression for task ${task.name}: ${task.cron_expression}`);
      continue;
    }
    cron.schedule(task.cron_expression, async () => {
      await executeTask(task);
      const now = new Date().toISOString();
      const next = getNextRun(task.cron_expression);
      await db.updateTaskLastRun(task.id, now, next ? next.toISOString() : undefined);
    });
    console.log(`Scheduled: ${task.name} (${task.cron_expression})`);
  }
}

loadTasks().catch(console.error);

console.log('Scheduler started. Waiting for tasks...');
