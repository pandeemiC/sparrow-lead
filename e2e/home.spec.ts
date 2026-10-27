import { test, expect } from "@playwright/test";

// the homepage is for visitors, so these tests start logged out:
// an empty browser instead of the saved session
test.use({ storageState: { cookies: [], origins: [] } });

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

test("test", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("banner")
    .getByRole("link", { name: "Start free" })
    .click();

  await expect(page).toHaveURL(/\/sign-up/);
});
