// src/agents/fileWriter.ts

import { mkdir, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";

/** A parsed code block extracted from agent output */
export interface ParsedFile {
  path: string;
  language: string;
  content: string;
}

/**
 * Extracts all fenced code blocks that are preceded by a file-path comment.
 *
 * Expected format (produced by the Developer and Tester agents):
 *
 *   // relative/path/to/file.ext
 *   ```language
 *   ...code...
 *   ```
 *
 * Both `// path` and `# path` comment styles are accepted to handle
 * TypeScript, Java, Python, YAML, etc.
 */
export function parseCodeBlocks(agentOutput: string): ParsedFile[] {
  const results: ParsedFile[] = [];

  // Match: optional comment line with path, then a fenced code block
  const pattern =
    /(?:\/\/|#)\s*([\w./-][^\n]*?)\s*\n```(\w*)\n([\s\S]*?)```/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(agentOutput)) !== null) {
    const [, filePath, language, content] = match;
    // Ignore obviously non-path comment lines (e.g. "// NOTE: ...")
    if (filePath && filePath.includes(".") && !filePath.includes(" ")) {
      results.push({
        path: filePath.trim(),
        language: language.trim(),
        content: content,
      });
    }
  }

  return results;
}

/**
 * Writes all parsed files under `outputDir`, creating directories as needed.
 *
 * @returns List of absolute file paths that were written.
 */
export async function writeFiles(
  files: ParsedFile[],
  outputDir: string
): Promise<string[]> {
  const written: string[] = [];

  for (const file of files) {
    // Strip any leading "./" or "/" to make the path relative
    const relativePath = file.path.replace(/^\.?\//, "");
    const absolutePath = resolve(outputDir, relativePath);

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, file.content, "utf8");

    written.push(absolutePath);
  }

  return written;
}
