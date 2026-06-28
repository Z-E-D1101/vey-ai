import { config } from './config.js';

console.log('Personal AI Assistant');
console.log('=====================');
console.log('');
console.log('Available commands:');
console.log('  npm run cli -- chat          Start interactive chat');
console.log('  npm run cli -- send "msg"    Send a single message');
console.log('  npm run cli -- conversations List conversations');
console.log('  npm run cli -- profile       Show user profile');
console.log('  npm run cli -- skills        List learned skills');
console.log('  npm run cli -- schedule      List scheduled tasks');
console.log('  npm run gateway              Start API gateway');
console.log('  npm run scheduler            Start task scheduler');
console.log('  npm run bot:telegram         Start Telegram bot');
console.log('  npm run bot:discord          Start Discord bot');
console.log('');
console.log(`Current LLM provider: ${config.llm.provider} (${config.llm.model})`);
