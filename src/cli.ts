import { Command } from 'commander';
import { Agent } from './agent.js';
import * as db from './db.js';
import { createInterface } from 'readline';

const program = new Command();

program
  .name('ai')
  .description('Personal AI Assistant CLI')
  .version('1.0.0');

program
  .command('chat')
  .description('Start an interactive chat session')
  .option('-c, --conversation <id>', 'Conversation ID', 'default')
  .action(async (options: { conversation: string }) => {
    const agent = new Agent(options.conversation);
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log('AI Assistant ready. Type "exit" to quit, "history" to see past messages.\n');

    const ask = () => {
      rl.question('You: ', async (input) => {
        const trimmed = input.trim();
        if (trimmed.toLowerCase() === 'exit') {
          console.log('Goodbye!');
          rl.close();
          process.exit(0);
        }

        if (trimmed.toLowerCase() === 'history') {
          const history = await agent.getHistory();
          console.log('\n--- History ---');
          for (const msg of history) {
            console.log(`${msg.role}: ${msg.content}`);
          }
          console.log('--- End ---\n');
          ask();
          return;
        }

        if (!trimmed) {
          ask();
          return;
        }

        try {
          const response = await agent.sendMessage(trimmed);
          console.log(`\nAI: ${response.content}\n`);
          if (response.skillUsed) {
            console.log(`(used skill: ${response.skillUsed})\n`);
          }
        } catch (err) {
          console.error('Error:', err instanceof Error ? err.message : String(err));
        }

        ask();
      });
    };

    ask();
  });

program
  .command('send <message>')
  .description('Send a single message and get a response')
  .option('-c, --conversation <id>', 'Conversation ID', 'default')
  .action(async (message: string, options: { conversation: string }) => {
    const agent = new Agent(options.conversation);
    try {
      const response = await agent.sendMessage(message);
      console.log(response.content);
      if (response.skillUsed) {
        console.error(`(used skill: ${response.skillUsed})`);
      }
    } catch (err) {
      console.error('Error:', err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  });

program
  .command('conversations')
  .description('List recent conversations')
  .action(async () => {
    const conversations = await db.listConversations();
    if (conversations.length === 0) {
      console.log('No conversations yet.');
      return;
    }
    for (const conv of conversations) {
      console.log(`${conv.id}: ${conv.title} (${conv.messages.length} messages, last active ${conv.updated_at})`);
    }
  });

program
  .command('profile')
  .description('Show user profile')
  .action(async () => {
    const profile = await db.getUserProfile();
    if (!profile) {
      console.log('No profile yet.');
      return;
    }
    console.log(`Name: ${profile.name}`);
    console.log(`Facts: ${profile.facts.join(', ') || 'None'}`);
    console.log(`Preferences: ${JSON.stringify(profile.preferences, null, 2)}`);
  });

program
  .command('skills')
  .description('List learned skills')
  .action(async () => {
    const skills = await db.getSkills();
    if (skills.length === 0) {
      console.log('No skills learned yet.');
      return;
    }
    for (const skill of skills) {
      console.log(`- ${skill.name}: ${skill.description} (used ${skill.usage_count}x, triggers: ${skill.trigger_phrases.join(', ')})`);
    }
  });

program
  .command('schedule')
  .description('List scheduled tasks')
  .action(async () => {
    const tasks = await db.getScheduledTasks();
    if (tasks.length === 0) {
      console.log('No scheduled tasks.');
      return;
    }
    for (const task of tasks) {
      console.log(`- ${task.name}: "${task.prompt}" (${task.cron_expression}, channel: ${task.channel})`);
    }
  });

program.parse();
