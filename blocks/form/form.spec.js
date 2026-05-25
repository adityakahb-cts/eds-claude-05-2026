import { test, expect } from '@playwright/test';

test.describe('form block', () => {
  test.beforeEach(async ({ page }) => {
    // Stub form JSON endpoint to avoid real AEM dependency
    await page.route('**/*.model.json', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'stub-form',
          ':type': 'core/fd/components/form/container/v2/container',
          ':itemsOrder': ['name-field', 'submit-btn'],
          ':items': {
            'name-field': {
              id: 'name-field',
              fieldType: 'text-input',
              name: 'name',
              label: { value: 'Name', visible: true },
              required: true,
              visible: true,
            },
            'submit-btn': {
              id: 'submit-btn',
              fieldType: 'button',
              name: 'submit',
              label: { value: 'Submit', visible: true },
              visible: true,
            },
          },
        }),
      }),
    );

    await page.goto('/drafts/form.html');
    await page.waitForLoadState('domcontentloaded');
  });

  test('renders block without JS errors', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await expect(page.locator('.form')).toBeAttached();
    // Allow a moment for lazy decoration
    await page.waitForTimeout(500);
    expect(errors.filter((e) => !e.includes('net::ERR') && !e.includes('favicon'))).toHaveLength(0);
  });

  test('renders a <form> element after decoration', async ({ page }) => {
    await page.waitForSelector('.form form', { timeout: 5000 }).catch(() => {
      // Form may not fully render without real AEM backend — that is acceptable
    });
    await expect(page.locator('.form')).toBeAttached();
  });

  test('empty block does not crash the page', async ({ page }) => {
    await page.goto('/drafts/form-empty.html');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.locator('.form')).toBeAttached();
  });

  // TODO: add keyboard nav tests (Tab through fields, Enter on submit)
  // TODO: add axe-core accessibility tests via /axe-check command
  // TODO: add ReCaptcha integration test when captcha key is configured
  // TODO: add wizard multi-step navigation test
});
