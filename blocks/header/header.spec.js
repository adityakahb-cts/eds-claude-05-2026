import { test, expect } from '@playwright/test';

test.describe('header block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/header-test.html');
    // Wait for the header bar to be fully decorated before each assertion.
    await page.waitForSelector('header .siteheader-bar');
  });

  test('renders fixed siteheader-bar', async ({ page }) => {
    await expect(page.locator('header .siteheader-bar')).toBeVisible();
  });

  test('renders logo link', async ({ page }) => {
    const logo = page.locator('header .siteheader-logo');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('href', '/');
    await expect(logo).toHaveAttribute('aria-label', /go to home/i);
  });

  test('desktop nav is present', async ({ page }) => {
    await expect(page.locator('header #siteheader-nav')).toBeAttached();
  });

  test('search toggle button is present and has accessible label', async ({ page }) => {
    const btn = page.locator('header .siteheader-search-toggle');
    await expect(btn).toBeVisible();
    await expect(btn).toHaveAttribute('aria-label', /.+/);
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  test('hamburger button is present and has accessible label', async ({ page }) => {
    const btn = page.locator('header .siteheader-hamburger');
    await expect(btn).toBeAttached();
    await expect(btn).toHaveAttribute('aria-label', /.+/);
    await expect(btn).toHaveAttribute('aria-expanded', 'false');
  });

  test('mobile nav is hidden initially', async ({ page }) => {
    const nav = page.locator('header #siteheader-mobilenav');
    await expect(nav).toBeAttached();
    await expect(nav).toHaveAttribute('aria-hidden', 'true');
    await expect(nav).not.toBeVisible();
  });

  test('search panel is hidden initially', async ({ page }) => {
    const panel = page.locator('header #siteheader-search');
    await expect(panel).toBeAttached();
    await expect(panel).not.toBeVisible();
  });

  test('clicking hamburger opens mobile nav and sets aria-expanded', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/tests/header-test.html');
    await page.waitForSelector('header .siteheader-bar');

    const hamburger = page.locator('header .siteheader-hamburger');
    const mobileNav = page.locator('header #siteheader-mobilenav');

    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
    await hamburger.click();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'true');
    await expect(mobileNav).toBeVisible();
    await expect(mobileNav).toHaveAttribute('aria-hidden', 'false');
  });

  test('clicking hamburger twice closes mobile nav', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/tests/header-test.html');
    await page.waitForSelector('header .siteheader-bar');

    const hamburger = page.locator('header .siteheader-hamburger');
    const mobileNav = page.locator('header #siteheader-mobilenav');

    await hamburger.click();
    await expect(mobileNav).toBeVisible();
    await hamburger.click();
    await expect(mobileNav).not.toBeVisible();
    await expect(hamburger).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking search toggle opens search panel', async ({ page }) => {
    const toggle = page.locator('header .siteheader-search-toggle');
    const panel = page.locator('header #siteheader-search');

    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(panel).toBeVisible();
  });

  test('pressing Escape closes search panel and returns focus to toggle', async ({ page }) => {
    const toggle = page.locator('header .siteheader-search-toggle');
    const panel = page.locator('header #siteheader-search');
    const input = page.locator('header #siteheader-q');

    await toggle.click();
    await expect(panel).toBeVisible();
    await input.press('Escape');
    await expect(panel).not.toBeVisible();
    await expect(toggle).toBeFocused();
  });
});
