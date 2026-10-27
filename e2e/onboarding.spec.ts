import { test, expect } from "@playwright/test";

// the bug: the onboarded cookie lives in one browser, so a new device or cleared
// cookies sent already onboarded users back through onboarding
test("an onboarded user without the cookie goes to the dashboard, not onboarding", async ({
  context,
  page,
}) => {
  // signed in from the saved session, but with the onboarded cookie removed,
  // like the same user on a new device
  await context.clearCookies({ name: "onboarded" });

  await page.goto("/dashboard");

  // the database says they're onboarded, so they end up on the dashboard
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole("button", { name: "Scan now" })).toBeVisible();
});
