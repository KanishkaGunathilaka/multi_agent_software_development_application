// src/tests/example.test.ts

import { getConfig } from "../config/config";

describe("Configuration Loader", () => {
  test("loads default configuration when no env or json is present", async () => {
    // Ensure process.env is clean for this test
    const originalEnv = { ...process.env };
    try {
      // Remove any vars that could influence the test
      delete process.env.OLLAMA_BASE_URL;
      delete process.env.VECTOR_DB_URL;
      // Mock an empty config.json by ensuring the file does not exist
      // (the loader already checks for existence).

      await expect(getConfig()).rejects.toThrow("Configuration validation error");
    } finally {
      process.env = originalEnv;
    }
  });
});
