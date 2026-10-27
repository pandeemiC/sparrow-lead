import { test, expect } from "@playwright/test";

// starts already signed in as the test user, see e2e/auth.setup.ts
test("a signed in user sees their dashboard", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page).toHaveURL(/\/dashboard/);
  // the main action is there and it knows who's signed in
  await expect(page.getByRole("button", { name: "Scan now" })).toBeVisible();
  await expect(page.getByText("jordan buffet")).toBeVisible();
});
