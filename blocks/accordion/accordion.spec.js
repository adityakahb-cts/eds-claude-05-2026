import { test, expect } from '@playwright/test';

test.describe('accordion block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/drafts/accordion.html');
  });

  test('renders details elements for the default accordion', async ({ page }) => {
    const details = page.locator('.accordion:not(.allow-multiple) details');
    await expect(details).toHaveCount(3);
  });

  test('first panel is open by default', async ({ page }) => {
    const firstDetails = page.locator('.accordion:not(.allow-multiple) details').first();
    await expect(firstDetails).toHaveAttribute('open', '');
  });

  test('second and third panels are closed by default', async ({ page }) => {
    const details = page.locator('.accordion:not(.allow-multiple) details');
    await expect(details.nth(1)).not.toHaveAttribute('open');
    await expect(details.nth(2)).not.toHaveAttribute('open');
  });

  test('clicking a closed summary opens that panel', async ({ page }) => {
    const secondSummary = page.locator('.accordion:not(.allow-multiple) summary').nth(1);
    const secondDetails = page.locator('.accordion:not(.allow-multiple) details').nth(1);
    await secondSummary.click();
    await expect(secondDetails).toHaveAttribute('open', '');
  });

  test('default: opening second panel closes the first', async ({ page }) => {
    const firstDetails = page.locator('.accordion:not(.allow-multiple) details').first();
    const secondSummary = page.locator('.accordion:not(.allow-multiple) summary').nth(1);
    await secondSummary.click();
    await expect(firstDetails).not.toHaveAttribute('open');
  });

  test('allow-multiple: opening second panel keeps first open', async ({ page }) => {
    const firstDetails = page.locator('.accordion.allow-multiple details').first();
    const secondSummary = page.locator('.accordion.allow-multiple summary').nth(1);
    await secondSummary.click();
    await expect(firstDetails).toHaveAttribute('open', '');
  });

  test('panel content is visible when open', async ({ page }) => {
    const firstContent = page.locator('.accordion:not(.allow-multiple) .accordion-content').first();
    await expect(firstContent).toBeVisible();
  });

  test('summary elements exist with correct labels', async ({ page }) => {
    const summaries = page.locator('.accordion:not(.allow-multiple) summary');
    await expect(summaries.nth(0)).toHaveText('What is Edge Delivery Services?');
    await expect(summaries.nth(1)).toHaveText('How do blocks work?');
    await expect(summaries.nth(2)).toHaveText('What is da.live?');
  });
});
