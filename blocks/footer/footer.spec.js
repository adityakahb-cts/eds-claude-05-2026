import { test, expect } from '@playwright/test';

test.describe('footer block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/footer-test.html');
    // Wait for the footer wrapper div to be injected before each assertion.
    await page.waitForSelector('footer > div');
  });

  test('renders a wrapper div inside the footer element', async ({ page }) => {
    await expect(page.locator('footer > div')).toBeVisible();
  });

  test('footer content from fragment is visible', async ({ page }) => {
    await expect(page.locator('footer')).toContainText('Example Site');
  });

  test('footer element is present in the DOM', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible();
  });

  test('footer does not retain original empty state after decoration', async ({ page }) => {
    // After decoration the footer must have at least one child element.
    const childCount = await page.locator('footer').evaluate((el) => el.children.length);
    expect(childCount).toBeGreaterThan(0);
  });
});
