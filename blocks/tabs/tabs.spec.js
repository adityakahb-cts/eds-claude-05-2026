import { test, expect } from '@playwright/test';

test.describe('tabs block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/drafts/tabs.html');
  });

  test('renders a tablist in the default tabs block', async ({ page }) => {
    const tablist = page.locator('.tabs:not(.pills):not(.vertical) [role="tablist"]').first();
    await expect(tablist).toBeVisible();
  });

  test('renders correct number of tabs in default block', async ({ page }) => {
    const tabs = page.locator('.tabs:not(.pills):not(.vertical) [role="tab"]');
    await expect(tabs).toHaveCount(3);
  });

  test('first tab is selected by default', async ({ page }) => {
    const firstTab = page.locator('.tabs:not(.pills):not(.vertical) [role="tab"]').first();
    await expect(firstTab).toHaveAttribute('aria-selected', 'true');
  });

  test('first panel is visible by default', async ({ page }) => {
    const firstPanel = page.locator('.tabs:not(.pills):not(.vertical) [role="tabpanel"]').first();
    await expect(firstPanel).toBeVisible();
  });

  test('second and third panels are hidden by default', async ({ page }) => {
    const panels = page.locator('.tabs:not(.pills):not(.vertical) [role="tabpanel"]');
    await expect(panels.nth(1)).toBeHidden();
    await expect(panels.nth(2)).toBeHidden();
  });

  test('clicking second tab shows its panel', async ({ page }) => {
    const secondTab = page.locator('.tabs:not(.pills):not(.vertical) [role="tab"]').nth(1);
    const secondPanel = page.locator('.tabs:not(.pills):not(.vertical) [role="tabpanel"]').nth(1);
    await secondTab.click();
    await expect(secondPanel).toBeVisible();
  });

  test('clicking second tab hides the first panel', async ({ page }) => {
    const secondTab = page.locator('.tabs:not(.pills):not(.vertical) [role="tab"]').nth(1);
    const firstPanel = page.locator('.tabs:not(.pills):not(.vertical) [role="tabpanel"]').first();
    await secondTab.click();
    await expect(firstPanel).toBeHidden();
  });

  test('tab labels match authored content', async ({ page }) => {
    const tabs = page.locator('.tabs:not(.pills):not(.vertical) [role="tab"]');
    await expect(tabs.nth(0)).toHaveText('Overview');
    await expect(tabs.nth(1)).toHaveText('Features');
    await expect(tabs.nth(2)).toHaveText('Getting Started');
  });

  test('pills variation renders correct number of tabs', async ({ page }) => {
    const pillsTabs = page.locator('.tabs.pills [role="tab"]');
    await expect(pillsTabs).toHaveCount(3);
  });

  test('pills variation first tab is selected', async ({ page }) => {
    const firstPillsTab = page.locator('.tabs.pills [role="tab"]').first();
    await expect(firstPillsTab).toHaveAttribute('aria-selected', 'true');
  });

  test('keyboard: ArrowRight moves to next tab', async ({ page }) => {
    const firstTab = page.locator('.tabs:not(.pills):not(.vertical) [role="tab"]').first();
    const secondTab = page.locator('.tabs:not(.pills):not(.vertical) [role="tab"]').nth(1);
    await firstTab.focus();
    await page.keyboard.press('ArrowRight');
    await expect(secondTab).toHaveAttribute('aria-selected', 'true');
  });

  test('keyboard: ArrowLeft wraps to last tab', async ({ page }) => {
    const firstTab = page.locator('.tabs:not(.pills):not(.vertical) [role="tab"]').first();
    const lastTab = page.locator('.tabs:not(.pills):not(.vertical) [role="tab"]').last();
    await firstTab.focus();
    await page.keyboard.press('ArrowLeft');
    await expect(lastTab).toHaveAttribute('aria-selected', 'true');
  });
});
