import { clerk } from "@clerk/testing/playwright";
import { test, expect } from "@playwright/test";

test("a signed in user sees their dashboard", async ({ page, context }) => {
  await page.goto("/");

  await clerk.signIn({ page, emailAddress: process.env.E2E_CLERK_USER_EMAIL! });
  await context.addCookies([
    { name: "onboarded", value: "true", url: "http://localhost:3000" },
  ]);

  await context.storageState({ path: "e2e/.auth/user.json" });

  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/dashboard/);
  //picking one part in the DBoard
  await expect(page.getByRole("button", { name: "Scan now" })).toBeVisible();
  await expect(page.getByText("jordan buffet")).toBeVisible();
});
