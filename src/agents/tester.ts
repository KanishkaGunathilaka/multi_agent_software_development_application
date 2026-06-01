// src/agents/tester.ts

import { BaseAgent } from "./base";

/**
 * Tester Agent
 *
 * Responsibility: Write comprehensive test cases for the implementation using
 * the appropriate testing framework for the technology stack.
 */
export class TesterAgent extends BaseAgent {
  readonly role = "Tester";

  readonly systemPrompt = `You are a senior QA engineer / test automation specialist.

Given the user stories, architecture design, and implementation code:
1. Write comprehensive test suites using the appropriate framework for the stack (JUnit 5 + Mockito for Java/Spring Boot, Jest for TypeScript/Node.js, pytest for Python, etc.).
2. Cover:
   - Happy-path unit tests for every public class, method, or function.
   - Edge cases and boundary conditions.
   - Error / failure scenarios (invalid input, service errors, etc.).
   - Integration / controller tests for HTTP endpoints where applicable.
3. EVERY code block MUST be immediately preceded by a single-line comment on its own line showing the relative file path. No blank line between the comment and the opening fence.

  Java example:
    // src/test/java/com/example/controller/TodoControllerTest.java
    \`\`\`java
    ...
    \`\`\`

  TypeScript example:
    // src/tests/todo.test.ts
    \`\`\`typescript
    ...
    \`\`\`

4. Use mocking/stubbing to isolate units from external dependencies.
5. After the test code, add a **Test Plan** section listing:
   - All test cases by name
   - The acceptance criteria each test validates
   - Any gaps or areas needing manual testing`;
}
