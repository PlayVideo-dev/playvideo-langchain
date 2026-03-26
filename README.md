# PlayVideo LangChain Tools

[![npm version](https://img.shields.io/npm/v/@playvideo/langchain.svg)](https://www.npmjs.com/package/@playvideo/langchain)
[![npm downloads](https://img.shields.io/npm/dm/@playvideo/langchain.svg)](https://www.npmjs.com/package/@playvideo/langchain)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

LangChain tools for PlayVideo API. Enables AI agents to upload, transcode, and manage videos autonomously.

## What is LangChain?

[LangChain](https://js.langchain.com) is the most popular framework for building AI agent applications. This package provides a toolkit of tools that any LangChain agent can use to work with videos — from cost estimation to upload to embedding.

## Features

- **Cost Estimation** - Check prices before committing (budget-aware agents)
- **Collections** - Create and list video collections
- **Videos** - Upload, list, get details, delete
- **Webhooks** - Create webhooks for processing notifications
- **Usage** - Monitor spend and cost breakdown
- **Upload Instructions** - Get cURL/SDK commands for uploading

## Installation

```bash
npm install @playvideo/langchain @langchain/core
```

## Quick Start

```typescript
import { PlayVideoToolkit } from "@playvideo/langchain";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

// Create the toolkit with your API key
const toolkit = new PlayVideoToolkit({ apiKey: "play_live_xxx" });

// Create a LangChain agent with PlayVideo tools
const llm = new ChatOpenAI({ model: "gpt-4o" });
const agent = createReactAgent({ llm, tools: toolkit.getTools() });

// The agent can now manage videos autonomously
const result = await agent.invoke({
  messages: [{ 
    role: "user", 
    content: "Create a collection called 'tutorials' and tell me how to upload a video to it" 
  }],
});
```

## Usage Examples

Once your agent has the PlayVideo tools, it can handle requests like:

- "How much would it cost to transcode a 10-minute video?"
- "Create a collection called 'product-demos'"
- "List all my completed videos"
- "Get the streaming URL for video abc123"
- "Set up a webhook to notify me when videos finish processing"
- "What's my current usage this month?"
- "Delete the video xyz789"
- "Show me how to upload a video to the 'tutorials' collection"

## Available Tools

| Tool | Description |
|------|-------------|
| `playvideo_estimate_cost` | Estimate cost of an operation (no API key needed) |
| `playvideo_list_collections` | List all video collections |
| `playvideo_create_collection` | Create a new collection |
| `playvideo_upload_video` | Get upload instructions (cURL + SDK) |
| `playvideo_list_videos` | List videos (filter by collection/status) |
| `playvideo_get_video` | Get video details and streaming URLs |
| `playvideo_delete_video` | Delete a video |
| `playvideo_get_usage` | Get monthly spend and cost breakdown |
| `playvideo_create_webhook` | Create a webhook for processing events |

## Agent Frameworks

### ReAct Agent (LangGraph)

```typescript
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const toolkit = new PlayVideoToolkit({ apiKey: "play_live_xxx" });
const agent = createReactAgent({ llm, tools: toolkit.getTools() });
```

### OpenAI Functions Agent

```typescript
import { createOpenAIFunctionsAgent } from "langchain/agents";

const toolkit = new PlayVideoToolkit({ apiKey: "play_live_xxx" });
const agent = await createOpenAIFunctionsAgent({ 
  llm, 
  tools: toolkit.getTools(), 
  prompt 
});
```

### Tool Calling Agent

```typescript
import { createToolCallingAgent } from "langchain/agents";

const toolkit = new PlayVideoToolkit({ apiKey: "play_live_xxx" });
const agent = await createToolCallingAgent({ 
  llm, 
  tools: toolkit.getTools(), 
  prompt 
});
```

## How It Works

A typical agent workflow:

1. **Agent receives a video task** (e.g., "upload this video for streaming")
2. **Agent calls `playvideo_estimate_cost`** to check the price
3. **Agent calls `playvideo_create_collection`** if needed
4. **Agent calls `playvideo_upload_video`** to get upload instructions
5. **Agent executes the upload** (via cURL or SDK)
6. **Agent calls `playvideo_get_video`** to check processing status
7. **Agent returns streaming URLs** to the user

The agent handles the full workflow autonomously — from cost estimation to delivering playback URLs.

## Configuration

```typescript
const toolkit = new PlayVideoToolkit({
  apiKey: "play_live_xxx",                   // Required
  baseUrl: "https://api.playvideo.dev",      // Optional (default shown)
});
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PLAYVIDEO_API_KEY` | Yes | Your PlayVideo API key |

You can pass the key directly or read from environment:

```typescript
const toolkit = new PlayVideoToolkit({ 
  apiKey: process.env.PLAYVIDEO_API_KEY! 
});
```

## Custom API URL

If you're self-hosting PlayVideo or using a custom endpoint:

```typescript
const toolkit = new PlayVideoToolkit({
  apiKey: "play_live_xxx",
  baseUrl: "https://your-playvideo-instance.com",
});
```

## Pricing

PlayVideo uses usage-based pricing — no tiers, no subscriptions:

| Action | Price |
|--------|-------|
| Transcode | $0.008/min per resolution |
| Storage | $0.005/GB/month |
| Bandwidth | $0.005/GB |
| Webhooks | Free |
| API calls | Free |

Free monthly allowance: 100 min transcode, 5 GB storage, 10 GB bandwidth. No credit card required.

## Security

- API keys are only sent to PlayVideo servers via HTTPS
- Keys are never logged or exposed in tool outputs
- Each tool validates inputs with Zod schemas

## License

MIT
