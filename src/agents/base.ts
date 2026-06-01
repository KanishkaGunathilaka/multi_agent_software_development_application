// src/agents/base.ts

import { getConfig } from "../config/config";

export interface AgentMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OllamaChatResponse {
  message: { role: string; content: string };
  done: boolean;
}

interface OllamaStreamChunk {
  message: { content: string };
  done: boolean;
}

/**
 * BaseAgent provides Ollama chat completion for all SDLC role agents.
 * Each concrete agent supplies its own system prompt and role name.
 */
export abstract class BaseAgent {
  abstract readonly role: string;
  abstract readonly systemPrompt: string;

  /**
   * Run the agent with the given user message (non-streaming).
   * Returns the model's full reply as a string.
   */
  async run(userMessage: string, history: AgentMessage[] = []): Promise<string> {
    const config = await getConfig();
    const url = `${config.OLLAMA_BASE_URL}/api/chat`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (config.OLLAMA_API_KEY) {
      headers["Authorization"] = `Bearer ${config.OLLAMA_API_KEY}`;
    }

    const messages: AgentMessage[] = [
      { role: "system", content: this.systemPrompt },
      ...history,
      { role: "user", content: userMessage },
    ];

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: config.OLLAMA_MODEL,
        messages,
        stream: false,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`[${this.role}] Ollama API error ${response.status}: ${body}`);
    }

    const data = (await response.json()) as OllamaChatResponse;
    return data.message.content.trim();
  }

  /**
   * Run the agent in streaming mode.
   * Calls `onToken` for each token chunk as it arrives, and returns the
   * complete concatenated response when done.
   */
  async runStream(
    userMessage: string,
    onToken: (token: string) => void,
    history: AgentMessage[] = []
  ): Promise<string> {
    const config = await getConfig();
    const url = `${config.OLLAMA_BASE_URL}/api/chat`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (config.OLLAMA_API_KEY) {
      headers["Authorization"] = `Bearer ${config.OLLAMA_API_KEY}`;
    }

    const messages: AgentMessage[] = [
      { role: "system", content: this.systemPrompt },
      ...history,
      { role: "user", content: userMessage },
    ];

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: config.OLLAMA_MODEL,
        messages,
        stream: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`[${this.role}] Ollama API error ${response.status}: ${body}`);
    }
    if (!response.body) {
      throw new Error(`[${this.role}] No response body from Ollama`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let full = "";
    let buf = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      // Ollama streams NDJSON – one JSON object per line
      const lines = buf.split("\n");
      buf = lines.pop() ?? ""; // last line may be incomplete
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        try {
          const chunk = JSON.parse(trimmed) as OllamaStreamChunk;
          const token = chunk.message?.content ?? "";
          if (token) {
            full += token;
            onToken(token);
          }
        } catch {
          // malformed/partial line – skip
        }
      }
    }

    return full.trim();
  }
}
