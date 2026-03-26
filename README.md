# @playvideo/langchain

LangChain tools for the PlayVideo video API. Enables AI agents to upload, transcode, and manage videos.

## Installation

```bash
npm install @playvideo/langchain @langchain/core
```

## Quick Start

```typescript
import { PlayVideoToolkit } from "@playvideo/langchain";
import { ChatOpenAI } from "@langchain/openai";
import { createReactAgent } from "@langchain/langgraph/prebuilt";

const toolkit = new PlayVideoToolkit({ apiKey: "play_live_xxx" });
const llm = new ChatOpenAI({ model: "gpt-4o" });

const agent = createReactAgent({ llm, tools: toolkit.getTools() });

// The agent can now manage videos autonomously
const result = await agent.invoke({
  messages: [{ role: "user", content: "Create a collection called 'tutorials' and show me the upload command" }],
});
```

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

## Usage with Different Agents

### ReAct Agent (LangGraph)

```typescript
import { createReactAgent } from "@langchain/langgraph/prebuilt";
const agent = createReactAgent({ llm, tools: toolkit.getTools() });
```

### OpenAI Functions Agent

```typescript
import { createOpenAIFunctionsAgent } from "langchain/agents";
const agent = await createOpenAIFunctionsAgent({ llm, tools: toolkit.getTools(), prompt });
```

### Tool Calling Agent

```typescript
import { createToolCallingAgent } from "langchain/agents";
const agent = await createToolCallingAgent({ llm, tools: toolkit.getTools(), prompt });
```

## Configuration

```typescript
const toolkit = new PlayVideoToolkit({
  apiKey: "play_live_xxx",        // Required
  baseUrl: "https://custom.api",  // Optional (default: https://api.playvideo.dev)
});
```

## How It Works

1. **Agent receives a video task** (e.g., "upload this video for streaming")
2. **Agent calls `playvideo_estimate_cost`** to check the price
3. **Agent calls `playvideo_create_collection`** if needed
4. **Agent calls `playvideo_upload_video`** to get upload instructions
5. **Agent executes the upload** (via cURL or SDK)
6. **Agent calls `playvideo_get_video`** to check processing status
7. **Agent returns streaming URLs** to the user

The agent handles the full workflow autonomously — from cost estimation to delivering playback URLs.

## License

MIT
