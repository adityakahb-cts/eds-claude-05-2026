import { test, expect } from '@playwright/test';

test.describe('card block', () => {
  test('renders card-body with title and description', async ({ page }) => {
    await page.goto('/drafts/card.html');
    const body = page.locator('.card .card-body').first();
    await expect(body).toBeVisible();
    await expect(body.locator('.card-title')).toBeVisible();
    await expect(body.locator('.card-description')).toBeVisible();
  });

  test('renders CTA link inside card-body', async ({ page }) => {
    await page.goto('/drafts/card.html');
    const cta = page.locator('.card .card-cta').first();
    await expect(cta).toBeVisible();
  });

  test('horizontal variation has horizontal class', async ({ page }) => {
    await page.goto('/drafts/card.html');
    const horizontal = page.locator('.card.horizontal');
    await expect(horizontal).toBeVisible();
  });

  test('multiple cards render in the same section', async ({ page }) => {
    await page.goto('/drafts/card.html');
    const cards = page.locator('.card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });
});
