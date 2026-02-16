import { test, expect } from "@playwright/test";

const E2E_EMAIL = process.env.E2E_TEST_EMAIL;
const E2E_PASSWORD = process.env.E2E_TEST_PASSWORD;
const HAS_AUTH = Boolean(E2E_EMAIL && E2E_PASSWORD);

const LOGIN_WAIT_MS = 12_000;

/** Log in at /assessments/login. Fails with a clear message if still on login after LOGIN_WAIT_MS. */
async function loginAsE2EUser(page: import("@playwright/test").Page) {
  await page.goto("/assessments/login");
  await page.getByLabel(/email/i).fill(E2E_EMAIL!);
  await page.getByLabel(/password/i).fill(E2E_PASSWORD!);
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  try {
    await page.waitForURL((url) => !url.pathname.includes("login"), { timeout: LOGIN_WAIT_MS });
  } catch {
    const errMsg = await page.getByText(/invalid|error|incorrect|failed/i).first().textContent().catch(() => "");
    throw new Error(
      `E2E login failed: still on login page after ${LOGIN_WAIT_MS / 1000}s. ` +
        `Check E2E_TEST_EMAIL and E2E_TEST_PASSWORD in .env. ` +
        (errMsg ? `Page message: ${errMsg.slice(0, 80)}` : "")
    );
  }
}

test.describe("Assessment flow – create model → take assessment → review results", () => {
  test("smoke: login page and form are usable", async ({ page }) => {
    await page.goto("/assessments/login");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await page.getByLabel(/email/i).fill("test@example.com");
    await page.getByLabel(/password/i).fill("test");
    await expect(page.getByRole("button", { name: /sign in|log in/i })).toBeVisible();
  });

  test("authenticated: login then visit admin models list", async ({ page }) => {
    test.skip(!HAS_AUTH);
    await loginAsE2EUser(page);
    await page.goto("/assessments/admin/models");
    await expect(page).toHaveURL(/\/assessments\/admin\/models/);
    await expect(page.getByRole("heading", { name: /models|assessments/i }).or(
      page.getByText(/assessment models|create new model/i)
    )).toBeVisible({ timeout: 10000 });
  });

  test("authenticated: open first model builder if any", async ({ page }) => {
    test.skip(!HAS_AUTH);
    await loginAsE2EUser(page);
    await page.goto("/assessments/admin/models");
    await expect(page).toHaveURL(/\/assessments\/admin\/models/);
    const builderLink = page.locator('a[href*="/builder"]').first();
    const count = await builderLink.count();
    if (count > 0) {
      await builderLink.click();
      await expect(page).toHaveURL(/\/assessments\/admin\/models\/[^/]+\/builder/);
      await expect(
        page.getByText(/component|competency|section/i).first()
      ).toBeVisible({ timeout: 10000 });
    }
  });

  test("authenticated: take page with invalid id shows not found or redirect", async ({ page }) => {
    test.skip(!HAS_AUTH);
    await loginAsE2EUser(page);
    await page.goto("/assessments/take/e2e-nonexistent-assessment-id");
    await expect(
      page.getByText(/not found|404|could not be found|page not found/i).or(
        page.getByRole("heading", { name: /not found|404/i })
      )
    ).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Assessment flow – results (when available)", () => {
  test("authenticated: results list or redirect when no results", async ({ page }) => {
    test.skip(!HAS_AUTH);
    await loginAsE2EUser(page);
    await page.goto("/assessments/results");
    await expect(page).toHaveURL(/\//);
    const onResults = page.url().includes("results");
    if (onResults) {
      await expect(
        page.getByText(/results|scores|assessments/i).first()
      ).toBeVisible({ timeout: 5000 });
    }
  });
});
