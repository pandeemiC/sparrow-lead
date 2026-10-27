import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { test as setup, expect } from "@playwright/test";

// where the signed-in session is saved. the chromium project in
// playwright.config.ts loads it, so every test starts logged in
export const authFile = "e2e/.auth/user.json";

// runs once before all tests. signs in as the test user a single time,
// instead of every test signing in on its own
setup("sign in as the test user", async ({ page }) => {
  // fail early with a clear message instead of confusing errors later
  expect(
    process.env.E2E_CLERK_USER_EMAIL,
    "E2E_CLERK_USER_EMAIL is missing from .env.local",
  ).toBeTruthy();

  // gets a testing token from clerk so the sign-in gets past bot protection
  await clerkSetup();

  // clerk has to be loaded on the page before signing in
  await page.goto("/");
  await clerk.signIn({ page, emailAddress: process.env.E2E_CLERK_USER_EMAIL! });

  // going to the dashboard also lets the app set its own onboarded cookie
  // (the test user is onboarded in the database)
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard/);

  // save cookies + local storage, so tests and codegen can reuse this login
  await page.context().storageState({ path: authFile });
});
