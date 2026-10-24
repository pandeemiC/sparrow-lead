import { test, expect } from "@playwright/test";

test("homepage shows the headline", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/Sparrow/);

  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "already looking for you",
  );
});

test("sign in link opens the sign in page", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("link", { name: "Sign in" }).first().click();

  await expect(page).toHaveURL(/\/sign-in/);
});
