import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["src/test-utils/setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text"],
      include: ["src/**"],
      exclude: ["src/test-utils/**"],
    },
  },
});
