// src/routes/sdlc.ts

import { Router, Request, Response } from "express";
import { z } from "zod";
import { SdlcOrchestrator } from "../agents/orchestrator";

const router = Router();

const SdlcRequestSchema = z.object({
  requirements: z
    .string()
    .min(10, "Requirements must be at least 10 characters")
    .max(10_000, "Requirements must be 10,000 characters or fewer"),
  projectName: z
    .string()
    .min(1)
    .max(80)
    .optional()
    .describe("Optional slug for the output directory, e.g. 'springboot-todo-api'"),
});

const orchestrator = new SdlcOrchestrator();

/**
 * POST /api/sdlc
 *
 * Accepts software requirements and runs them through the full SDLC
 * multi-agent pipeline:
 *   1. Product Owner  – user stories + acceptance criteria
 *   2. Architect      – technical design
 *   3. Developer      – implementation code
 *   4. Code Reviewer  – review report
 *   5. Tester         – test suite
 *
 * Request body:
 *   {
 *     "requirements": "Build a Spring Boot REST API that …",
 *     "projectName": "springboot-todo-api"   // optional
 *   }
 *
 * Response includes:
 *   - projectDir    – absolute path where the project was written
 *   - allFilesWritten – list of every file created on disk
 *   - stages        – per-agent output
 *   - deliverable   – full text artefacts (stories, design, code, review, tests)
 */
router.post("/", async (req: Request, res: Response) => {
  const parsed = SdlcRequestSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      error: parsed.error.issues.map((i) => i.message).join(", "),
    });
    return;
  }

  const { requirements, projectName } = parsed.data;

  try {
    const result = await orchestrator.run(requirements, undefined, projectName);
    res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    res.status(502).json({ error: `SDLC pipeline failed: ${message}` });
  }
});

/**
 * GET /api/sdlc/agents
 *
 * Returns a description of the available SDLC agents and their roles.
 */
router.get("/agents", (_req: Request, res: Response) => {
  res.json({
    pipeline: [
      {
        step: 1,
        agent: "ProductOwner",
        role: "Transforms requirements into user stories with acceptance criteria",
      },
      {
        step: 2,
        agent: "Architect",
        role: "Designs component breakdown, data models, APIs, and key flows",
      },
      {
        step: 3,
        agent: "Developer",
        role: "Writes production-quality TypeScript implementation code",
      },
      {
        step: 4,
        agent: "CodeReviewer",
        role: "Reviews code for correctness, security, and best practices",
      },
      {
        step: 5,
        agent: "Tester",
        role: "Writes Jest test suites covering unit, edge, and error cases",
      },
    ],
  });
});

export default router;
