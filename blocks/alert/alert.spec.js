import { test, expect } from '@playwright/test';

test.describe('alert block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/drafts/alert.html');
    await page.waitForSelector('.alert .alert-content');
  });

  test('renders alert-content inside each alert block', async ({ page }) => {
    const alerts = page.locator('.alert .alert-content');
    await expect(alerts.first()).toBeVisible();
  });

  test('default alert has role="alert" attribute', async ({ page }) => {
    const first = page.locator('.alert').first();
    await expect(first).toHaveAttribute('role', 'alert');
  });

  test('default alert has aria-live="polite" attribute', async ({ page }) => {
    const first = page.locator('.alert').first();
    await expect(first).toHaveAttribute('aria-live', 'polite');
  });

  test('renders alert title', async ({ page }) => {
    const title = page.locator('.alert .alert-title').first();
    await expect(title).toBeVisible();
    await expect(title).toContainText('Information');
  });

  test('renders alert body text', async ({ page }) => {
    const body = page.locator('.alert .alert-body').first();
    await expect(body).toBeVisible();
  });

  test('success variant is visible', async ({ page }) => {
    const success = page.locator('.alert.success');
    await expect(success).toBeVisible();
    await expect(success.locator('.alert-title')).toContainText('Success');
  });

  test('warning variant is visible', async ({ page }) => {
    const warning = page.locator('.alert.warning');
    await expect(warning).toBeVisible();
    await expect(warning.locator('.alert-title')).toContainText('Warning');
  });

  test('error variant is visible', async ({ page }) => {
    const error = page.locator('.alert.error');
    await expect(error).toBeVisible();
    await expect(error.locator('.alert-title')).toContainText('Error');
  });

  test('dismissible alert has close button', async ({ page }) => {
    const closeBtn = page.locator('.alert.dismissible .alert-close');
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toHaveAttribute('aria-label', 'Close');
  });

  test('clicking close button removes the alert from DOM', async ({ page }) => {
    const dismissible = page.locator('.alert.dismissible');
    await expect(dismissible).toBeVisible();
    await dismissible.locator('.alert-close').click();
    await expect(dismissible).not.toBeAttached();
  });
});
