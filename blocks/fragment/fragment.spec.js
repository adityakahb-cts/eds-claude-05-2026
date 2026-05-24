import { test, expect } from '@playwright/test';

test.describe('fragment block', () => {
  test('renders fragment content in place of the authored link', async ({ page }) => {
    await page.goto('/tests/fragment-test.html');
    // Fragment content replaces the block — paragraph from fragment-content.plain.html is visible
    await expect(page.locator('p.fragment-paragraph')).toBeVisible();
    await expect(page.locator('p.fragment-paragraph')).toHaveText('Hello from fragment');
  });

  test('original authored link is no longer in the DOM after decoration', async ({ page }) => {
    await page.goto('/tests/fragment-test.html');
    // The fragment block replaces its children with the fetched content,
    // so the original <a> pointing to /tests/fragments/fragment-content should be gone.
    await page.waitForFunction(() => !document.querySelector('.fragment a[href*="fragment-content"]'));
    const link = page.locator('.fragment a[href*="fragment-content"]');
    await expect(link).toHaveCount(0);
  });

  test('does not crash when block has no link', async ({ page }) => {
    // Navigate to a page that has no fragment block at all — scripts should still run cleanly.
    await page.goto('/tests/header-test.html');
    await expect(page.locator('h1')).toHaveText('Header Test Page');
  });
});
