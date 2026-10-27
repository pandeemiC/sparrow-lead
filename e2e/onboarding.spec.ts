import { clerk } from "@clerk/testing/playwright";
import { test, expect } from "@playwright/test";

test("an onboarded user without the cookie goes to the dashboard, not onboarding", async ({
  page,
  context,
}) => {
  await page.goto("/");
  await clerk.signIn({ page, emailAddress: process.env.E2E_CLERK_USER_EMAIL! });

  await context.clearCookies({ name: "onboarded" });

  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("button", { name: "Scan now" })).toBeVisible();
});
