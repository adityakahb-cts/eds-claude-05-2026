import { describe, test, expect, beforeEach, vi } from 'vitest';
import decorate from './carousel.js';

function makeBlock(slides, variation = '') {
  const block = document.createElement('div');
  block.className = `carousel block${variation ? ` ${variation}` : ''}`;
  slides.forEach(([media, caption]) => {
    const row = document.createElement('div');
    const mediaCell = document.createElement('div');
    mediaCell.textContent = media;
    const captionCell = document.createElement('div');
    captionCell.textContent = caption || '';
    row.append(mediaCell, captionCell);
    block.append(row);
  });
  return block;
}

describe('carousel — decorate', () => {
  let block;

  beforeEach(() => {
    block = makeBlock([
      ['Slide 1 content', 'Caption one'],
      ['Slide 2 content', 'Caption two'],
      ['Slide 3 content', 'Caption three'],
    ]);
  });

  test('renders carousel-track with one slide per row', async () => {
    await decorate(block);
    expect(block.querySelectorAll('.carousel-slide').length).toBe(3);
  });

  test('renders carousel-controls with prev, next, and dots', async () => {
    await decorate(block);
    expect(block.querySelector('.carousel-controls')).not.toBeNull();
    expect(block.querySelector('.carousel-prev')).not.toBeNull();
    expect(block.querySelector('.carousel-next')).not.toBeNull();
    expect(block.querySelectorAll('.carousel-dot').length).toBe(3);
  });

  test('first dot has aria-selected="true"', async () => {
    await decorate(block);
    const dots = block.querySelectorAll('.carousel-dot');
    expect(dots[0].getAttribute('aria-selected')).toBe('true');
    expect(dots[1].getAttribute('aria-selected')).toBe('false');
  });

  test('caption text is rendered inside carousel-caption', async () => {
    await decorate(block);
    const captions = block.querySelectorAll('.carousel-caption');
    expect(captions.length).toBe(3);
    expect(captions[0].textContent).toBe('Caption one');
  });

  test('clicking next button advances to slide 2', async () => {
    await decorate(block);
    const nextBtn = block.querySelector('.carousel-next');
    nextBtn.click();
    const dots = block.querySelectorAll('.carousel-dot');
    expect(dots[1].getAttribute('aria-selected')).toBe('true');
    expect(dots[0].getAttribute('aria-selected')).toBe('false');
  });

  test('clicking prev from first slide wraps to last slide', async () => {
    await decorate(block);
    const prevBtn = block.querySelector('.carousel-prev');
    prevBtn.click();
    const dots = block.querySelectorAll('.carousel-dot');
    expect(dots[2].getAttribute('aria-selected')).toBe('true');
  });

  test('clicking a dot navigates to that slide', async () => {
    await decorate(block);
    const dots = block.querySelectorAll('.carousel-dot');
    dots[2].click();
    expect(dots[2].getAttribute('aria-selected')).toBe('true');
    expect(dots[0].getAttribute('aria-selected')).toBe('false');
  });

  test('no-controls variation omits prev/next buttons', async () => {
    const noCtrl = makeBlock(
      [
        ['Slide 1', 'Cap 1'],
        ['Slide 2', 'Cap 2'],
      ],
      'no-controls',
    );
    await decorate(noCtrl);
    expect(noCtrl.querySelector('.carousel-prev')).toBeNull();
    expect(noCtrl.querySelector('.carousel-next')).toBeNull();
    expect(noCtrl.querySelectorAll('.carousel-dot').length).toBe(2);
  });

  test('aria-live announcer region exists', async () => {
    await decorate(block);
    const announcer = block.querySelector('.carousel-announcer');
    expect(announcer).not.toBeNull();
    expect(announcer.getAttribute('aria-live')).toBe('polite');
  });

  test('each slide has role="group" and aria-label', async () => {
    await decorate(block);
    const slides = block.querySelectorAll('.carousel-slide');
    slides.forEach((slide, i) => {
      expect(slide.getAttribute('role')).toBe('group');
      expect(slide.getAttribute('aria-label')).toContain(`${i + 1}`);
    });
  });

  test('autoplay variation calls setInterval', async () => {
    vi.useFakeTimers();
    const spy = vi.spyOn(global, 'setInterval');
    const autoBlock = makeBlock(
      [
        ['Auto 1', 'Cap 1'],
        ['Auto 2', 'Cap 2'],
      ],
      'autoplay',
    );
    await decorate(autoBlock);
    expect(spy).toHaveBeenCalledWith(expect.any(Function), 5000);
    vi.useRealTimers();
    spy.mockRestore();
  });

  test('single-slide carousel renders no controls', async () => {
    const singleBlock = makeBlock([['Only slide', 'Only caption']]);
    await decorate(singleBlock);
    expect(singleBlock.querySelector('.carousel-controls')).toBeNull();
  });

  test('handles empty block gracefully', async () => {
    const emptyBlock = document.createElement('div');
    emptyBlock.className = 'carousel block';
    await expect(decorate(emptyBlock)).resolves.not.toThrow();
  });
});
