import { test, expect } from '@playwright/test';

test.describe('Header block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('header element is visible', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible();
  });

  test('nav element is rendered', async ({ page }) => {
    await expect(page.locator('header nav#nav')).toBeVisible();
  });

  test('brand / logo link is present', async ({ page }) => {
    await expect(page.locator('header .nav-brand a')).toBeVisible();
  });

  test('hamburger button is visible on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.nav-hamburger button')).toBeVisible();
  });

  test('hamburger button toggles nav on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const nav = page.locator('nav#nav');
    const initialExpanded = await nav.getAttribute('aria-expanded');
    await page.locator('.nav-hamburger button').click();
    const afterExpanded = await nav.getAttribute('aria-expanded');
    expect(afterExpanded).not.toBe(initialExpanded);
  });
});
