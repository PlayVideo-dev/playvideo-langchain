import { StructuredTool } from "@langchain/core/tools";
import {
  UploadVideoTool,
  ListVideosTool,
  GetVideoTool,
  DeleteVideoTool,
  CreateCollectionTool,
  ListCollectionsTool,
  EstimateCostTool,
  GetUsageTool,
  CreateWebhookTool,
} from "./tools.js";

export interface PlayVideoConfig {
  /** PlayVideo API key (play_live_xxx) */
  apiKey: string;
  /** API base URL (default: https://api.playvideo.dev) */
  baseUrl?: string;
}

/**
 * PlayVideoToolkit — provides all PlayVideo tools for a LangChain agent.
 *
 * ```typescript
 * const toolkit = new PlayVideoToolkit({ apiKey: "play_live_xxx" });
 * const tools = toolkit.getTools();
 * // Pass tools to createReactAgent, createOpenAIFunctionsAgent, etc.
 * ```
 */
export class PlayVideoToolkit {
  private config: Required<PlayVideoConfig>;

  constructor(config: PlayVideoConfig) {
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || "https://api.playvideo.dev",
    };
  }

  getTools(): StructuredTool[] {
    const { apiKey, baseUrl } = this.config;
    return [
      new EstimateCostTool(apiKey, baseUrl),
      new ListCollectionsTool(apiKey, baseUrl),
      new CreateCollectionTool(apiKey, baseUrl),
      new UploadVideoTool(apiKey, baseUrl),
      new ListVideosTool(apiKey, baseUrl),
      new GetVideoTool(apiKey, baseUrl),
      new DeleteVideoTool(apiKey, baseUrl),
      new GetUsageTool(apiKey, baseUrl),
      new CreateWebhookTool(apiKey, baseUrl),
    ];
  }
}
