import { test, expect } from "@playwright/test";

test.describe("Smoke – key pages load", () => {
  test("assessments login page loads", async ({ page }) => {
    await page.goto("/assessments/login");
    await expect(page).toHaveTitle(/SudAssess|Welcome|Sign in/i);
    await expect(page.getByRole("heading", { name: /welcome|sign in/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("assessments admin models redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/assessments/admin/models");
    await expect(page).toHaveURL(/\/(assessments\/)?login/);
  });

  test("assessments take page redirects to login when unauthenticated", async ({ page }) => {
    await page.goto("/assessments/take/non-existent-id");
    await expect(page).toHaveURL(/\/(assessments\/)?login/);
  });
});
