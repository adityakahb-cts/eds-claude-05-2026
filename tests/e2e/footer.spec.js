import { test, expect } from '@playwright/test';

test.describe('Footer block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('footer element is visible', async ({ page }) => {
    await expect(page.locator('footer')).toBeVisible();
  });

  test('footer contains at least one link', async ({ page }) => {
    const links = page.locator('footer a');
    expect(await links.count()).toBeGreaterThan(0);
  });

  test('footer links have visible text or aria-label', async ({ page }) => {
    const links = page.locator('footer a');
    const count = await links.count();
    const results = await Promise.all(
      Array.from({ length: count }, async (_, i) => {
        const link = links.nth(i);
        const text = (await link.textContent()).trim();
        const ariaLabel = await link.getAttribute('aria-label');
        return { text, ariaLabel };
      }),
    );
    results.forEach(({ text, ariaLabel }) => expect(text.length > 0 || ariaLabel !== null).toBe(true));
  });
});
