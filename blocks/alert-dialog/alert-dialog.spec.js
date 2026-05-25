import { test, expect } from '@playwright/test';

test.describe('alert-dialog block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/drafts/alert-dialog.html');
    await page.waitForSelector('.alert-dialog .alert-dialog-trigger');
  });

  test('renders a trigger button for each block instance', async ({ page }) => {
    const triggers = page.locator('.alert-dialog .alert-dialog-trigger');
    await expect(triggers).toHaveCount(3);
  });

  test('dialog is not visible before trigger is clicked', async ({ page }) => {
    const dialog = page.locator('.alert-dialog').first().locator('dialog');
    await expect(dialog).not.toHaveAttribute('open');
  });

  test('clicking trigger opens the dialog', async ({ page }) => {
    await page.locator('.alert-dialog').first().locator('.alert-dialog-trigger').click();
    const dialog = page.locator('.alert-dialog').first().locator('dialog');
    await expect(dialog).toHaveAttribute('open');
  });

  test('dialog title is visible when open', async ({ page }) => {
    await page.locator('.alert-dialog').first().locator('.alert-dialog-trigger').click();
    const title = page.locator('.alert-dialog').first().locator('.alert-dialog-title');
    await expect(title).toBeVisible();
    await expect(title).toContainText('Information');
  });

  test('dialog body message is visible when open', async ({ page }) => {
    await page.locator('.alert-dialog').first().locator('.alert-dialog-trigger').click();
    const body = page.locator('.alert-dialog').first().locator('.alert-dialog-body p');
    await expect(body).toBeVisible();
  });

  test('close X button is present in dialog', async ({ page }) => {
    await page.locator('.alert-dialog').first().locator('.alert-dialog-trigger').click();
    const closeBtn = page.locator('.alert-dialog').first().locator('.alert-dialog-close');
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toHaveAttribute('aria-label', 'Close dialog');
  });

  test('clicking close X button closes the dialog', async ({ page }) => {
    const first = page.locator('.alert-dialog').first();
    await first.locator('.alert-dialog-trigger').click();
    await expect(first.locator('dialog')).toHaveAttribute('open');
    await first.locator('.alert-dialog-close').click();
    await expect(first.locator('dialog')).not.toHaveAttribute('open');
  });

  test('default dialog has OK button', async ({ page }) => {
    await page.locator('.alert-dialog').first().locator('.alert-dialog-trigger').click();
    await expect(page.locator('.alert-dialog').first().locator('.alert-dialog-ok')).toBeVisible();
  });

  test('clicking OK button closes the dialog', async ({ page }) => {
    const first = page.locator('.alert-dialog').first();
    await first.locator('.alert-dialog-trigger').click();
    await first.locator('.alert-dialog-ok').click();
    await expect(first.locator('dialog')).not.toHaveAttribute('open');
  });

  test('success variant trigger is visible', async ({ page }) => {
    const success = page.locator('.alert-dialog.success');
    await expect(success.locator('.alert-dialog-trigger')).toBeVisible();
  });

  test('confirm variant renders Confirm and Cancel buttons', async ({ page }) => {
    const confirm = page.locator('.alert-dialog.confirm');
    await confirm.locator('.alert-dialog-trigger').click();
    await expect(confirm.locator('.alert-dialog-confirm')).toBeVisible();
    await expect(confirm.locator('.alert-dialog-cancel')).toBeVisible();
  });

  test('confirm variant uses custom confirm button text', async ({ page }) => {
    const confirm = page.locator('.alert-dialog.confirm');
    await confirm.locator('.alert-dialog-trigger').click();
    await expect(confirm.locator('.alert-dialog-confirm')).toContainText('Yes, Delete');
  });

  test('pressing Escape closes the dialog', async ({ page }) => {
    const first = page.locator('.alert-dialog').first();
    await first.locator('.alert-dialog-trigger').click();
    await expect(first.locator('dialog')).toHaveAttribute('open');
    await page.keyboard.press('Escape');
    await expect(first.locator('dialog')).not.toHaveAttribute('open');
  });

  test('confirm button emits alert-dialog:confirm custom event', async ({ page }) => {
    const confirm = page.locator('.alert-dialog.confirm');
    await confirm.locator('.alert-dialog-trigger').click();

    const eventPromise = page.evaluate(
      () =>
        new Promise((resolve) => {
          document.addEventListener('alert-dialog:confirm', () => resolve(true), { once: true });
        }),
    );

    await confirm.locator('.alert-dialog-confirm').click();
    expect(await eventPromise).toBe(true);
  });
});
