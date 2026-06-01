// src/routes/research.ts

import { Router, Request, Response } from "express";
import { z } from "zod";
import { getConfig } from "../config/config";

const router = Router();

const ResearchRequestSchema = z.object({
  query: z.string().min(1, "Query is required").max(2000),
});

interface OllamaChatMessage {
  role: string;
  content: string;
}

interface OllamaChatResponse {
  message: OllamaChatMessage;
  done: boolean;
}

/**
 * Sends a chat message to the Ollama API and returns the assistant's reply.
 */
async function callOllama(query: string): Promise<string> {
  const config = await getConfig();
  const url = `${config.OLLAMA_BASE_URL}/api/chat`;

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (config.OLLAMA_API_KEY) {
    headers["Authorization"] = `Bearer ${config.OLLAMA_API_KEY}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: config.OLLAMA_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a helpful research assistant. Provide clear, concise, and accurate research summaries.",
        },
        { role: "user", content: query },
      ],
      stream: false,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Ollama API error ${response.status}: ${body}`);
  }

  const data = (await response.json()) as OllamaChatResponse;
  return data.message.content;
}

/**
 * POST /api/research
 * Accepts a research query and returns an Ollama-powered response.
 */
router.post("/", async (req: Request, res: Response) => {
  const parsed = ResearchRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues.map((i) => i.message).join(", "),
    });
    return;
  }

  const { query } = parsed.data;

  try {
    const result = await callOllama(query);
    res.json({ query, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: `LLM request failed: ${message}` });
  }
});

export default router;
