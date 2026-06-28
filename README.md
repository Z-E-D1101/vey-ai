# Personal AI Assistant

A self-improving AI assistant that learns from conversations, remembers context across sessions, and creates reusable skills. Accessible via CLI, web API, Telegram, and Discord.

## Features

- **Multi-Provider LLM Support**: Switch between OpenAI, Anthropic, and OpenRouter by setting the provider and API key
- **Persistent Memory**: Conversations and user facts stored in Supabase
- **Skill Learning**: Automatically creates reusable skills from completed complex tasks
- **Multiple Interfaces**: CLI, REST API, Telegram bot, Discord bot
- **Scheduled Tasks**: Cron-based automation for recurring reports and prompts

## Quick Start

1. Copy `.env.example` to `.env` and fill in your API keys
2. Install dependencies: `npm install`
3. Run the gateway: `npm run gateway`

## Configuration

Set `LLM_PROVIDER` to `openai`, `anthropic`, or `openrouter`, then provide the corresponding API key:

- `OPENAI_API_KEY` + optional `OPENAI_MODEL`
- `ANTHROPIC_API_KEY` + optional `ANTHROPIC_MODEL`
- `OPENROUTER_API_KEY` + optional `OPENROUTER_MODEL`

## CLI Usage

```bash
npm run cli -- chat                    # Interactive chat
npm run cli -- send "Hello"            # Single message
npm run cli -- conversations           # List conversations
npm run cli -- profile                 # Show user profile
npm run cli -- skills                  # List learned skills
npm run cli -- schedule                # List scheduled tasks
```

## API Endpoints

- `POST /chat/:conversationId` - Send a message
- `GET /conversations` - List conversations
- `GET /conversations/:id` - Get conversation
- `GET /profile` - Get user profile
- `GET /skills` - List skills
- `GET /health` - Health check

## Deployment

Build and run with Docker Compose:

```bash
docker-compose up -d gateway scheduler
```

Or deploy to any cloud server that supports Node.js.
