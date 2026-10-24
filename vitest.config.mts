import { defineConfig } from "vitest/config";

export default defineConfig({
  // lets tests understand imports like "@/lib/score", same as next does
  resolve: { tsconfigPaths: true },
  test: {
    include: ["lib/**/*.test.ts"],
    coverage: {
      include: ["lib/**"],
    },
    // "node" because we're testing plain functions, not things in a browser
    environment: "node",
  },
});
