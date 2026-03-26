import { StructuredTool } from "@langchain/core/tools";
import { z } from "zod";

// ─── Helper ─────────────────────────────────────────────────────

async function apiCall(
  method: string,
  url: string,
  apiKey: string,
  body?: unknown
): Promise<unknown> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
  };
  if (body) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

// ─── Tools ──────────────────────────────────────────────────────

export class EstimateCostTool extends StructuredTool {
  name = "playvideo_estimate_cost";
  description = "Estimate the dollar cost of a PlayVideo operation before committing. Use this to check prices for transcoding, storage, or bandwidth. No API key needed.";
  schema = z.object({
    action: z.enum(["TRANSCODE", "STORAGE", "BANDWIDTH"]).describe("Type of operation"),
    durationSeconds: z.number().optional().describe("Video duration in seconds (for TRANSCODE)"),
    resolutionCount: z.number().optional().describe("Number of resolutions to encode (default 4)"),
    bytes: z.number().optional().describe("Bytes of data (for STORAGE or BANDWIDTH)"),
  });

  constructor(private apiKey: string, private baseUrl: string) { super(); }

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    const res = await fetch(`${this.baseUrl}/api/v1/estimate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    return JSON.stringify(await res.json());
  }
}

export class ListCollectionsTool extends StructuredTool {
  name = "playvideo_list_collections";
  description = "List all video collections. Collections organize videos by project.";
  schema = z.object({});

  constructor(private apiKey: string, private baseUrl: string) { super(); }

  async _call(): Promise<string> {
    return JSON.stringify(await apiCall("GET", `${this.baseUrl}/api/v1/collections`, this.apiKey));
  }
}

export class CreateCollectionTool extends StructuredTool {
  name = "playvideo_create_collection";
  description = "Create a new video collection. Collections organize videos by project or topic.";
  schema = z.object({
    name: z.string().describe("Collection name (1-100 characters)"),
    description: z.string().optional().describe("Optional description"),
  });

  constructor(private apiKey: string, private baseUrl: string) { super(); }

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    return JSON.stringify(await apiCall("POST", `${this.baseUrl}/api/v1/collections`, this.apiKey, input));
  }
}

export class UploadVideoTool extends StructuredTool {
  name = "playvideo_upload_video";
  description = "Get instructions for uploading a video to PlayVideo. Returns cURL command and SDK code. The actual file upload must be done via HTTP multipart — this tool provides the commands.";
  schema = z.object({
    collection: z.string().describe("Collection slug to upload to"),
    filename: z.string().optional().describe("Video filename for the cURL command"),
  });

  constructor(private apiKey: string, private baseUrl: string) { super(); }

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    const fname = input.filename || "video.mp4";
    return JSON.stringify({
      message: "Use one of these methods to upload:",
      curl: `curl -X POST ${this.baseUrl}/api/v1/videos -H "Authorization: Bearer ${this.apiKey}" -F "file=@${fname}" -F "collection=${input.collection}"`,
      sdk: `const client = new PlayVideo('${this.apiKey}');\nconst video = await client.videos.upload({ file: './${fname}', collection: '${input.collection}' });`,
      pricing: "Transcode: $0.008/min per resolution. Free: 100 min/month.",
    });
  }
}

export class ListVideosTool extends StructuredTool {
  name = "playvideo_list_videos";
  description = "List videos. Optionally filter by collection slug or processing status.";
  schema = z.object({
    collection: z.string().optional().describe("Filter by collection slug"),
    status: z.enum(["PENDING", "PROCESSING", "COMPLETED", "FAILED"]).optional().describe("Filter by status"),
    limit: z.number().optional().describe("Max results (default 50)"),
  });

  constructor(private apiKey: string, private baseUrl: string) { super(); }

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    const params = new URLSearchParams();
    if (input.collection) params.set("collection", input.collection);
    if (input.status) params.set("status", input.status);
    if (input.limit) params.set("limit", String(input.limit));
    const qs = params.toString();
    return JSON.stringify(await apiCall("GET", `${this.baseUrl}/api/v1/videos${qs ? `?${qs}` : ""}`, this.apiKey));
  }
}

export class GetVideoTool extends StructuredTool {
  name = "playvideo_get_video";
  description = "Get details for a specific video including streaming URLs, thumbnail, duration, and processing status.";
  schema = z.object({
    videoId: z.string().describe("Video ID"),
  });

  constructor(private apiKey: string, private baseUrl: string) { super(); }

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    return JSON.stringify(await apiCall("GET", `${this.baseUrl}/api/v1/videos/${input.videoId}`, this.apiKey));
  }
}

export class DeleteVideoTool extends StructuredTool {
  name = "playvideo_delete_video";
  description = "Delete a video and its storage.";
  schema = z.object({
    videoId: z.string().describe("Video ID to delete"),
  });

  constructor(private apiKey: string, private baseUrl: string) { super(); }

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    return JSON.stringify(await apiCall("DELETE", `${this.baseUrl}/api/v1/videos/${input.videoId}`, this.apiKey));
  }
}

export class GetUsageTool extends StructuredTool {
  name = "playvideo_get_usage";
  description = "Get current monthly spend, cost breakdown by action, volume discount, and spending limit.";
  schema = z.object({});

  constructor(private apiKey: string, private baseUrl: string) { super(); }

  async _call(): Promise<string> {
    return JSON.stringify(await apiCall("GET", `${this.baseUrl}/api/v1/usage`, this.apiKey));
  }
}

export class CreateWebhookTool extends StructuredTool {
  name = "playvideo_create_webhook";
  description = "Create a webhook to receive real-time notifications when videos finish processing. Store the returned secret securely.";
  schema = z.object({
    url: z.string().url().describe("HTTPS URL to receive webhook POST requests"),
    events: z.array(z.enum([
      "video.uploaded", "video.processing", "video.completed", "video.failed",
      "collection.created", "collection.deleted",
    ])).describe("Events to subscribe to"),
  });

  constructor(private apiKey: string, private baseUrl: string) { super(); }

  async _call(input: z.infer<typeof this.schema>): Promise<string> {
    return JSON.stringify(await apiCall("POST", `${this.baseUrl}/api/v1/webhooks`, this.apiKey, input));
  }
}
