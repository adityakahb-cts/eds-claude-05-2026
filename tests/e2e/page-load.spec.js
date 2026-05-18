import { test, expect } from '@playwright/test';

test.describe('Page load & LCP', () => {
  test('home page loads and main element is visible', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('main')).toBeVisible();
  });

  test('page title is set', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/.+/);
  });

  test('no JavaScript errors on load', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    expect(errors).toHaveLength(0);
  });

  test('skip-to-content / main landmark is accessible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();
    // Verify there is at least one heading in main
    const headingCount = await page.locator('main h1, main h2').count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test('header and footer are rendered', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });
});
