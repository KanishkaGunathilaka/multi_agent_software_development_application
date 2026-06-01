// src/routes/chat.ts

import { Router, Request, Response } from "express";
import { z } from "zod";
import { getConfig } from "../config/config";
import { SdlcOrchestrator, ProgressEvent } from "../agents/orchestrator";

const router = Router();

const ChatRequestSchema = z.object({
  message: z.string().min(1, "Message is required").max(10_000),
  projectName: z.string().max(80).optional(),
});

const orchestrator = new SdlcOrchestrator();

/**
 * Detects whether the user message is requesting to build / generate an application.
 *
 * Strategy:
 *  1. Bail out immediately if the message looks like a question or explanation request.
 *  2. Match explicit imperative build phrases: verb + article/pronoun ("build a", "create an", …).
 *  3. Allow well-known tech-specific signals that almost always imply a build request.
 */
function isBuildIntent(message: string): boolean {
  const lower = message.toLowerCase().trimStart();

  // Questions / explanations are never build requests
  const questionPattern =
    /^(what|how|why|when|where|who|which|explain|describe|tell me|is |are |does |do |can you tell|could you explain|define)/;
  if (questionPattern.test(lower)) return false;
  // Short messages ending with '?' are almost always questions
  if (lower.endsWith('?') && lower.split(' ').length < 20) return false;

  // Explicit imperative build intent: verb immediately followed by article / pronoun
  const buildVerbs = ['build', 'create', 'generate', 'develop', 'make', 'implement', 'write', 'scaffold'];
  const follows    = [' a ', ' an ', ' the ', ' me ', ' us '];
  if (buildVerbs.some((v) => follows.some((f) => lower.includes(v + f)))) return true;

  // Strong tech-specific signals that almost always mean "build something"
  const techSignals = [
    'rest api', 'spring boot', 'fastapi', 'microservice',
    'node.js app', 'express app', 'react app', 'new project', 'new application',
    'i need a ', 'i need an ', 'i want a ', 'i want an ',
    'please build', 'please create', 'please make', 'please generate', 'please implement',
  ];
  return techSignals.some((s) => lower.includes(s));
}

/**
 * Write a single SSE event to the response.
 * @param res   Express response (with SSE headers already set)
 * @param event Event name
 * @param data  Any JSON-serialisable payload
 */
function sendSse(res: Response, event: string, data: unknown): void {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  // Flush if the underlying socket supports it (Node.js http)
  if (typeof (res as unknown as { flush?: () => void }).flush === "function") {
    (res as unknown as { flush: () => void }).flush();
  }
}

/**
 * POST /api/chat
 *
 * Unified chat endpoint that streams Server-Sent Events (SSE).
 *
 * • If the message requests building/generating something → runs the full
 *   SDLC multi-agent pipeline and emits `progress` events for each stage.
 * • Otherwise → calls Ollama directly and emits a single `message` event.
 *
 * Response stream event types:
 *   event: start      — pipeline started (build mode) or request received
 *   event: progress   — one per SDLC stage with status "running" | "done"
 *   event: message    — plain Ollama reply (non-build mode)
 *   event: done       — pipeline complete with projectDir + allFilesWritten
 *   event: error      — error message
 */
router.post("/", async (req: Request, res: Response) => {
  const parsed = ChatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues.map((i) => i.message).join(", ") });
    return;
  }

  const { message, projectName } = parsed.data;

  // Set SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  if (isBuildIntent(message)) {
    // ── SDLC pipeline mode ─────────────────────────────────────────────────
    sendSse(res, "start", {
      mode: "sdlc",
      message: "Build intent detected — starting SDLC pipeline…",
      steps: [
        { step: 1, stage: "Requirements Analysis", agent: "ProductOwner" },
        { step: 2, stage: "Architecture Design",   agent: "Architect"    },
        { step: 3, stage: "Implementation",         agent: "Developer"   },
        { step: 4, stage: "Code Review",            agent: "CodeReviewer"},
        { step: 5, stage: "Test Suite",             agent: "Tester"      },
      ],
    });

    try {
      const result = await orchestrator.run(
        message,
        undefined,
        projectName,
        (event: ProgressEvent) => sendSse(res, "progress", event)
      );

      sendSse(res, "done", {
        projectDir: result.projectDir,
        allFilesWritten: result.allFilesWritten,
        summary: `Project generated in ${result.projectDir} with ${result.allFilesWritten.length} file(s).`,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      sendSse(res, "error", { message: `SDLC pipeline failed: ${msg}` });
    }
  } else {
    // ── Plain chat / research mode ─────────────────────────────────────────
    sendSse(res, "start", { mode: "chat", message: "Thinking…" });

    try {
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
              content: "You are a helpful research and software development assistant. Provide clear, concise, and accurate responses.",
            },
            { role: "user", content: message },
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama API error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json() as { message: { content: string } };
      sendSse(res, "message", { content: data.message.content.trim() });
      sendSse(res, "done", { mode: "chat" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      sendSse(res, "error", { message: msg });
    }
  }

  res.end();
});

export default router;
