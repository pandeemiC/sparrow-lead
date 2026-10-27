import { test, expect } from "@playwright/test";
import { neon } from "@neondatabase/serverless";

// a direct database connection, used to set up and clean up test data.
// DATABASE_URL comes from .env.local (playwright.config.ts loads it)
const sql = neon(process.env.DATABASE_URL!);

// a unique name for every test, so tests never clash with real keywords or
// with leftovers from an earlier run
let keyword: string;
test.beforeEach(() => {
  keyword = `e2e keyword ${Date.now()}`;
});

// test cleanup, not app behaviour: deleting the test's own keyword directly
// (its signals go with it) leaves the test user's account exactly as it was
test.afterEach(async () => {
  await sql`
    DELETE FROM keywords
    WHERE keyword = ${keyword}
      AND user_id = (SELECT user_id FROM users WHERE email = ${process.env.E2E_CLERK_USER_EMAIL!})
  `;
});

// adds a keyword through the keywords page, the way a user would
async function addKeyword(page: import("@playwright/test").Page) {
  await page.goto("/dashboard/keywords");
  const input = page.getByRole("textbox", {
    name: "Add a phrase buyers would",
  });
  await input.fill(keyword);
  await input.press("Enter");
  await expect(page.getByText(`Tracking “${keyword}”`)).toBeVisible();
}

// starts signed in as the test user (saved session from auth.setup.ts)
test("adding a keyword shows it in the list and keeps it after a reload", async ({
  page,
}) => {
  await addKeyword(page);

  // exact: true matches the list item, not the toast that only contains the text
  await expect(page.getByText(keyword, { exact: true })).toBeVisible();

  // the real proof: still there after a reload means it was saved to the database
  await page.reload();
  await expect(page.getByText(keyword, { exact: true })).toBeVisible();
});

test("a paused keyword can be deleted for good", async ({ page }) => {
  await addKeyword(page);

  // only this keyword's row, so the buttons below can't match another keyword
  const row = page.locator("[data-row]").filter({ hasText: keyword });

  // removing a keyword is a pause first, by design
  await row.getByRole("button", { name: "Pause" }).click();
  await expect(
    page.getByText("Paused — no new signals; existing ones are kept"),
  ).toBeVisible();

  // the delete button only shows on paused keywords, and asks before deleting
  await row.getByRole("button", { name: "Delete" }).click();
  await row.getByRole("button", { name: "Delete" }).click();

  await expect(page.getByText(`Deleted “${keyword}”`)).toBeVisible();
  await expect(page.getByText(keyword, { exact: true })).toBeHidden();

  // gone from the database too, not just from the page
  await page.reload();
  await expect(page.getByText(keyword, { exact: true })).toBeHidden();
});

// the rule that protects user data, checked on the server directly: a keyword
// with leads on the hunt board can't be deleted, because its signals would go with it
test("the server refuses to delete a keyword with hunt board leads", async ({
  page,
}) => {
  // a paused keyword with one lead on the hunt board, created straight in the database
  const [kw] = await sql`
    INSERT INTO keywords (user_id, keyword, platforms, active)
    SELECT user_id, ${keyword}, ${["reddit"]}, false
    FROM users WHERE email = ${process.env.E2E_CLERK_USER_EMAIL!}
    RETURNING id
  `;
  await sql`
    INSERT INTO mentions (keyword_id, platform, post_url, post_title, status)
    VALUES (${kw.id}, 'reddit', 'https://reddit.com/r/test/comments/e2e', 'e2e lead', 'hunting')
  `;

  // load a page first so clerk refreshes the signed-in session, then call the api
  // with the same cookies, like the delete button would
  await page.goto("/dashboard/keywords");
  const res = await page.request.delete(`/api/keywords/${kw.id}`);

  expect(res.status()).toBe(409);
  expect((await res.json()).error).toContain("on your Hunt Board");

  // and the keyword is still there
  const [still] = await sql`SELECT id FROM keywords WHERE id = ${kw.id}`;
  expect(still).toBeDefined();
});
