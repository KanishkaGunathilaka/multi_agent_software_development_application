// src/agents/orchestrator.ts

import { resolve } from "node:path";
import { writeFile, mkdir } from "node:fs/promises";
import { ProductOwnerAgent } from "./productOwner";
import { ArchitectAgent } from "./architect";
import { DeveloperAgent } from "./developer";
import { ReviewerAgent } from "./reviewer";
import { TesterAgent } from "./tester";
import { parseCodeBlocks, writeFiles } from "./fileWriter";

/** Progress event emitted by the orchestrator during a pipeline run */
export interface ProgressEvent {
  step: number;
  totalSteps: number;
  stage: string;
  agent: string;
  status: "running" | "streaming" | "done" | "error";
  /** Incremental token chunk (only present when status === "streaming") */
  token?: string;
  output?: string;
  filesWritten?: string[];
  error?: string;
}

/** Callback invoked after each status change in the pipeline */
export type ProgressCallback = (event: ProgressEvent) => void;

/** Outcome of a single SDLC agent stage */
export interface StageResult {
  stage: string;
  agent: string;
  output: string;
  /** Files written to disk during this stage (if any) */
  filesWritten?: string[];
}

/** Full result of an SDLC pipeline run */
export interface SdlcResult {
  requirements: string;
  projectDir: string;
  stages: StageResult[];
  deliverable: {
    userStories: string;
    architecture: string;
    implementation: string;
    reviewReport: string;
    testSuite: string;
  };
  /** All files written to disk across all stages */
  allFilesWritten: string[];
}

/**
 * SdlcOrchestrator runs user requirements through a sequential pipeline of
 * specialised agents and writes the resulting code to disk.
 *
 * Pipeline order:
 *  1. Product Owner   – requirements  → user stories + acceptance criteria
 *  2. Architect       – user stories  → technical design
 *  3. Developer       – design        → implementation code  (written to disk)
 *  4. Code Reviewer   – code          → review report
 *  5. Tester          – all artefacts → test suite           (written to disk)
 *
 * All artefacts are also saved as markdown docs in <projectDir>/docs/.
 */
export class SdlcOrchestrator {
  private readonly productOwner = new ProductOwnerAgent();
  private readonly architect = new ArchitectAgent();
  private readonly developer = new DeveloperAgent();
  private readonly reviewer = new ReviewerAgent();
  private readonly tester = new TesterAgent();

  /**
   * @param requirements  Natural-language requirements from the user.
   * @param outputBaseDir Base directory under which the project folder is created.
   *                      Defaults to <cwd>/generated.
   * @param projectName   Sub-folder name for the generated project.
   *                      Defaults to a timestamp-based name.
   */
  async run(
    requirements: string,
    outputBaseDir: string = resolve(process.cwd(), "generated"),
    projectName?: string,
    onProgress?: ProgressCallback
  ): Promise<SdlcResult> {
    const TOTAL = 5;
    const emit = (event: ProgressEvent) => onProgress?.(event);

    const slug = (projectName ?? `project_${Date.now()}`)
      .toLowerCase()
      .replace(/[^a-z0-9_-]/g, "_");
    const projectDir = resolve(outputBaseDir, slug);

    await mkdir(resolve(projectDir, "docs"), { recursive: true });

    const stages: StageResult[] = [];
    const allFilesWritten: string[] = [];

    // ── Stage 1: Product Owner ──────────────────────────────────────────────
    emit({ step: 1, totalSteps: TOTAL, stage: "Requirements Analysis", agent: this.productOwner.role, status: "running" });
    const userStories = await this.productOwner.runStream(
      `Here are the raw requirements:\n\n${requirements}\n\nPlease produce user stories and acceptance criteria.`,
      (token) => emit({ step: 1, totalSteps: TOTAL, stage: "Requirements Analysis", agent: this.productOwner.role, status: "streaming", token })
    );
    stages.push({ stage: "1 – Requirements Analysis", agent: this.productOwner.role, output: userStories });
    const storiesDoc = resolve(projectDir, "docs", "user-stories.md");
    await writeFile(storiesDoc, `# User Stories\n\n${userStories}`, "utf8");
    allFilesWritten.push(storiesDoc);
    emit({ step: 1, totalSteps: TOTAL, stage: "Requirements Analysis", agent: this.productOwner.role, status: "done", output: userStories });

    // ── Stage 2: Architect ──────────────────────────────────────────────────
    emit({ step: 2, totalSteps: TOTAL, stage: "Architecture Design", agent: this.architect.role, status: "running" });
    const architecture = await this.architect.runStream(
      `User stories:\n\n${userStories}\n\nPlease produce a technical design.`,
      (token) => emit({ step: 2, totalSteps: TOTAL, stage: "Architecture Design", agent: this.architect.role, status: "streaming", token })
    );
    stages.push({ stage: "2 – Architecture Design", agent: this.architect.role, output: architecture });
    const archDoc = resolve(projectDir, "docs", "architecture.md");
    await writeFile(archDoc, `# Architecture Design\n\n${architecture}`, "utf8");
    allFilesWritten.push(archDoc);
    emit({ step: 2, totalSteps: TOTAL, stage: "Architecture Design", agent: this.architect.role, status: "done", output: architecture });

    // ── Stage 3: Developer ──────────────────────────────────────────────────
    emit({ step: 3, totalSteps: TOTAL, stage: "Implementation", agent: this.developer.role, status: "running" });
    const implementation = await this.developer.runStream(
      `User stories:\n\n${userStories}\n\nTechnical design:\n\n${architecture}\n\nPlease implement the code.\n\nIMPORTANT: Prefix every code block with a comment containing the relative file path, e.g.:\n// src/main/java/com/example/App.java\n\`\`\`java\n...\n\`\`\``,
      (token) => emit({ step: 3, totalSteps: TOTAL, stage: "Implementation", agent: this.developer.role, status: "streaming", token })
    );
    const implFiles = await writeFiles(parseCodeBlocks(implementation), projectDir);
    allFilesWritten.push(...implFiles);
    stages.push({ stage: "3 – Implementation", agent: this.developer.role, output: implementation, filesWritten: implFiles });
    emit({ step: 3, totalSteps: TOTAL, stage: "Implementation", agent: this.developer.role, status: "done", output: implementation, filesWritten: implFiles });

    // ── Stage 4: Code Reviewer ──────────────────────────────────────────────
    emit({ step: 4, totalSteps: TOTAL, stage: "Code Review", agent: this.reviewer.role, status: "running" });
    const reviewReport = await this.reviewer.runStream(
      `User stories:\n\n${userStories}\n\nImplementation code:\n\n${implementation}\n\nPlease review the code.`,
      (token) => emit({ step: 4, totalSteps: TOTAL, stage: "Code Review", agent: this.reviewer.role, status: "streaming", token })
    );
    stages.push({ stage: "4 – Code Review", agent: this.reviewer.role, output: reviewReport });
    const reviewDoc = resolve(projectDir, "docs", "code-review.md");
    await writeFile(reviewDoc, `# Code Review Report\n\n${reviewReport}`, "utf8");
    allFilesWritten.push(reviewDoc);
    emit({ step: 4, totalSteps: TOTAL, stage: "Code Review", agent: this.reviewer.role, status: "done", output: reviewReport });

    // ── Stage 5: Tester ─────────────────────────────────────────────────────
    emit({ step: 5, totalSteps: TOTAL, stage: "Test Suite", agent: this.tester.role, status: "running" });
    const testSuite = await this.tester.runStream(
      `User stories:\n\n${userStories}\n\nArchitecture:\n\n${architecture}\n\nImplementation:\n\n${implementation}\n\nCode review:\n\n${reviewReport}\n\nPlease write the test suite.\n\nIMPORTANT: Prefix every code block with a comment containing the relative file path, e.g.:\n// src/test/java/com/example/AppTest.java\n\`\`\`java\n...\n\`\`\``,
      (token) => emit({ step: 5, totalSteps: TOTAL, stage: "Test Suite", agent: this.tester.role, status: "streaming", token })
    );
    const testFiles = await writeFiles(parseCodeBlocks(testSuite), projectDir);
    allFilesWritten.push(...testFiles);
    stages.push({ stage: "5 – Test Suite", agent: this.tester.role, output: testSuite, filesWritten: testFiles });
    emit({ step: 5, totalSteps: TOTAL, stage: "Test Suite", agent: this.tester.role, status: "done", output: testSuite, filesWritten: testFiles });

    // ── Write README ────────────────────────────────────────────────────────
    const readme = buildReadme(slug, requirements, userStories, architecture, allFilesWritten);
    const readmePath = resolve(projectDir, "README.md");
    await writeFile(readmePath, readme, "utf8");
    allFilesWritten.push(readmePath);

    return {
      requirements,
      projectDir,
      stages,
      deliverable: { userStories, architecture, implementation, reviewReport, testSuite },
      allFilesWritten,
    };
  }
}

function buildReadme(
  projectName: string,
  requirements: string,
  userStories: string,
  architecture: string,
  filesWritten: string[]
): string {
  return [
    `# ${projectName}`,
    "",
    "Generated by the SDLC multi-agent pipeline.",
    "",
    "## Original Requirements",
    "",
    requirements,
    "",
    "## User Stories",
    "",
    userStories,
    "",
    "## Architecture",
    "",
    architecture,
    "",
    "## Generated Files",
    "",
    filesWritten.map((f) => `- \`${f}\``).join("\n"),
  ].join("\n");
}
