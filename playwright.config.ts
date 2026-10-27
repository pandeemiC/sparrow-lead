import { defineConfig, devices } from "@playwright/test";

// playwright doesn't read .env.local on its own. ci has no .env.local, it gets the
// keys from github secrets instead
if (!process.env.CI) process.loadEnvFile(".env.local");

export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  projects: [
    // signs in once and saves the session (e2e/auth.setup.ts)
    { name: "setup", testMatch: /.*\.setup\.ts/ },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // every test starts with the saved, signed-in browser session
        storageState: "e2e/.auth/user.json",
      },
      // don't start the tests until the setup has signed in
      dependencies: ["setup"],
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
