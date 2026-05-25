import { test, expect } from '@playwright/test';

test.describe('offcanvas block', () => {
  test('renders trigger buttons on page', async ({ page }) => {
    await page.goto('/drafts/offcanvas.html');
    const triggers = page.locator('.offcanvas .offcanvas-trigger');
    const count = await triggers.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('clicking trigger opens the panel', async ({ page }) => {
    await page.goto('/drafts/offcanvas.html');
    const trigger = page.locator('.offcanvas .offcanvas-trigger').first();
    await trigger.click();
    const panel = page.locator('.offcanvas-panel.is-open');
    await expect(panel).toBeVisible();
  });

  test('close button is visible inside open panel', async ({ page }) => {
    await page.goto('/drafts/offcanvas.html');
    await page.locator('.offcanvas .offcanvas-trigger').first().click();
    const closeBtn = page.locator('.offcanvas-panel.is-open .offcanvas-close');
    await expect(closeBtn).toBeVisible();
  });

  test('clicking close button closes the panel', async ({ page }) => {
    await page.goto('/drafts/offcanvas.html');
    await page.locator('.offcanvas .offcanvas-trigger').first().click();
    await page.locator('.offcanvas-panel.is-open .offcanvas-close').click();
    await expect(page.locator('.offcanvas-panel.is-open')).toHaveCount(0);
  });

  test('pressing Escape closes the panel', async ({ page }) => {
    await page.goto('/drafts/offcanvas.html');
    await page.locator('.offcanvas .offcanvas-trigger').first().click();
    await page.keyboard.press('Escape');
    await expect(page.locator('.offcanvas-panel.is-open')).toHaveCount(0);
  });

  test('backdrop is visible when panel is open', async ({ page }) => {
    await page.goto('/drafts/offcanvas.html');
    await page.locator('.offcanvas .offcanvas-trigger').first().click();
    const backdrop = page.locator('.offcanvas-backdrop.is-open');
    await expect(backdrop).toBeVisible();
  });

  test('end variation panel has offcanvas-panel-end class', async ({ page }) => {
    await page.goto('/drafts/offcanvas.html');
    const endTrigger = page.locator('.offcanvas.end .offcanvas-trigger');
    await endTrigger.click();
    const endPanel = page.locator('.offcanvas-panel-end.is-open');
    await expect(endPanel).toBeVisible();
  });
});
