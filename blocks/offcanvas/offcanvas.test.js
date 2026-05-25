import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import decorate from './offcanvas.js';

function makeBlock(variation = '') {
  const block = document.createElement('div');
  block.className = `offcanvas block${variation ? ` ${variation}` : ''}`;

  const triggerRow = document.createElement('div');
  const triggerLabel = document.createElement('div');
  triggerLabel.textContent = 'Trigger';
  const triggerText = document.createElement('div');
  triggerText.textContent = 'Open Panel';
  triggerRow.append(triggerLabel, triggerText);
  block.append(triggerRow);

  const contentRow = document.createElement('div');
  const contentCell = document.createElement('div');
  const p = document.createElement('p');
  p.textContent = 'Panel content here.';
  const a = document.createElement('a');
  a.href = '/link';
  a.textContent = 'A link';
  contentCell.append(p, a);
  contentRow.append(contentCell);
  block.append(contentRow);

  return block;
}

describe('offcanvas — decorate', () => {
  let block;
  let appendedEls = [];

  const origAppend = document.body.append.bind(document.body);
  beforeEach(() => {
    appendedEls = [];
    document.body.append = (...nodes) => {
      nodes.forEach((n) => appendedEls.push(n));
      origAppend(...nodes);
    };
    block = makeBlock();
  });

  afterEach(() => {
    document.body.append = origAppend;
    appendedEls.forEach((el) => el.remove?.());
  });

  test('renders trigger button with correct text', async () => {
    await decorate(block);
    const btn = block.querySelector('.offcanvas-trigger');
    expect(btn).not.toBeNull();
    expect(btn.textContent).toBe('Open Panel');
  });

  test('appends panel and backdrop to body', async () => {
    await decorate(block);
    expect(document.body.querySelector('.offcanvas-panel')).not.toBeNull();
    expect(document.body.querySelector('.offcanvas-backdrop')).not.toBeNull();
  });

  test('panel has role="dialog" and aria-modal="true"', async () => {
    await decorate(block);
    const panel = document.body.querySelector('.offcanvas-panel');
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('true');
  });

  test('panel is hidden by default', async () => {
    await decorate(block);
    const panel = document.body.querySelector('.offcanvas-panel');
    expect(panel.hasAttribute('hidden')).toBe(true);
  });

  test('clicking trigger opens panel (adds is-open class)', async () => {
    await decorate(block);
    const btn = block.querySelector('.offcanvas-trigger');
    const panel = document.body.querySelector('.offcanvas-panel');
    panel.removeAttribute('hidden');
    btn.click();
    await new Promise((r) => {
      requestAnimationFrame(r);
    });
    expect(panel.classList.contains('is-open')).toBe(true);
  });

  test('trigger aria-expanded is "false" initially', async () => {
    await decorate(block);
    const btn = block.querySelector('.offcanvas-trigger');
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  test('trigger aria-expanded becomes "true" after open', async () => {
    await decorate(block);
    const btn = block.querySelector('.offcanvas-trigger');
    btn.click();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
  });

  test('close button is inside panel', async () => {
    await decorate(block);
    const panel = document.body.querySelector('.offcanvas-panel');
    const closeBtn = panel.querySelector('.offcanvas-close');
    expect(closeBtn).not.toBeNull();
    expect(closeBtn.getAttribute('aria-label')).toBe('Close');
  });

  test('panel content contains authored text', async () => {
    await decorate(block);
    const panel = document.body.querySelector('.offcanvas-panel');
    const content = panel.querySelector('.offcanvas-content');
    expect(content).not.toBeNull();
    expect(content.textContent).toContain('Panel content here.');
  });

  test('default variation gets offcanvas-panel-start class', async () => {
    await decorate(block);
    const panel = document.body.querySelector('.offcanvas-panel');
    expect(panel.classList.contains('offcanvas-panel-start')).toBe(true);
  });

  test('end variation gets offcanvas-panel-end class', async () => {
    const endBlock = makeBlock('end');
    await decorate(endBlock);
    const panel = document.body.querySelector('.offcanvas-panel-end');
    expect(panel).not.toBeNull();
  });

  test('bottom variation gets offcanvas-panel-bottom class', async () => {
    const bottomBlock = makeBlock('bottom');
    await decorate(bottomBlock);
    const panel = document.body.querySelector('.offcanvas-panel-bottom');
    expect(panel).not.toBeNull();
  });

  test('escape key closes the panel', async () => {
    await decorate(block);
    const btn = block.querySelector('.offcanvas-trigger');
    const panel = document.body.querySelector('.offcanvas-panel');
    btn.click();
    expect(btn.getAttribute('aria-expanded')).toBe('true');
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(btn.getAttribute('aria-expanded')).toBe('false');
  });

  test('handles empty block gracefully', async () => {
    const emptyBlock = document.createElement('div');
    emptyBlock.className = 'offcanvas block';
    await expect(decorate(emptyBlock)).resolves.not.toThrow();
  });
});
