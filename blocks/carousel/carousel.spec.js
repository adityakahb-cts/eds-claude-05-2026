import { test, expect } from '@playwright/test';

test.describe('carousel block', () => {
  test('renders track with slides', async ({ page }) => {
    await page.goto('/drafts/carousel.html');
    const track = page.locator('.carousel .carousel-track').first();
    await expect(track).toBeVisible();
    const slides = track.locator('.carousel-slide');
    await expect(slides).toHaveCount(3);
  });

  test('renders prev and next buttons', async ({ page }) => {
    await page.goto('/drafts/carousel.html');
    await expect(page.locator('.carousel .carousel-prev').first()).toBeVisible();
    await expect(page.locator('.carousel .carousel-next').first()).toBeVisible();
  });

  test('dot count matches slide count', async ({ page }) => {
    await page.goto('/drafts/carousel.html');
    const dots = page.locator('.carousel .carousel-dot');
    await expect(dots).toHaveCount(3);
  });

  test('clicking next advances active dot', async ({ page }) => {
    await page.goto('/drafts/carousel.html');
    const nextBtn = page.locator('.carousel .carousel-next').first();
    const dots = page.locator('.carousel .carousel-dot');
    await nextBtn.click();
    await expect(dots.nth(1)).toHaveAttribute('aria-selected', 'true');
  });

  test('autoplay carousel is present on page', async ({ page }) => {
    await page.goto('/drafts/carousel.html');
    const autoplay = page.locator('.carousel.autoplay');
    await expect(autoplay).toBeVisible();
  });
});
