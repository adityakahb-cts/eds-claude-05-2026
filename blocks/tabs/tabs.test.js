import { describe, test, expect, beforeEach } from 'vitest';
import decorate from './tabs.js';

function makeBlock(rows, variation = '') {
  const block = document.createElement('div');
  block.className = `tabs block${variation ? ` ${variation}` : ''}`;
  rows.forEach(([label, content]) => {
    const row = document.createElement('div');
    const labelCell = document.createElement('div');
    labelCell.textContent = label;
    const contentCell = document.createElement('div');
    const p = document.createElement('p');
    p.textContent = content;
    contentCell.append(p);
    row.append(labelCell, contentCell);
    block.append(row);
  });
  return block;
}

describe('tabs — decorate', () => {
  let block;

  beforeEach(async () => {
    block = makeBlock([
      ['Tab One', 'Content one'],
      ['Tab Two', 'Content two'],
      ['Tab Three', 'Content three'],
    ]);
    await decorate(block);
  });

  test('renders a tablist element', () => {
    const tablist = block.querySelector('[role="tablist"]');
    expect(tablist).toBeTruthy();
  });

  test('renders one tab button per row', () => {
    const tabs = block.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(3);
  });

  test('renders one tabpanel per row', () => {
    const panels = block.querySelectorAll('[role="tabpanel"]');
    expect(panels.length).toBe(3);
  });

  test('first tab is selected by default', () => {
    const tabs = block.querySelectorAll('[role="tab"]');
    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(tabs[1].getAttribute('aria-selected')).toBe('false');
    expect(tabs[2].getAttribute('aria-selected')).toBe('false');
  });

  test('first panel is visible by default; others are hidden', () => {
    const panels = block.querySelectorAll('[role="tabpanel"]');
    expect(panels[0].hasAttribute('hidden')).toBe(false);
    expect(panels[1].hasAttribute('hidden')).toBe(true);
    expect(panels[2].hasAttribute('hidden')).toBe(true);
  });

  test('tab labels match authored content', () => {
    const tabs = block.querySelectorAll('[role="tab"]');
    expect(tabs[0].textContent).toBe('Tab One');
    expect(tabs[1].textContent).toBe('Tab Two');
    expect(tabs[2].textContent).toBe('Tab Three');
  });

  test('panel content matches authored body cell', () => {
    const panels = block.querySelectorAll('[role="tabpanel"]');
    expect(panels[0].querySelector('p').textContent).toBe('Content one');
  });

  test('aria-controls on tab points to corresponding panel id', () => {
    const tab = block.querySelectorAll('[role="tab"]')[0];
    const panelId = tab.getAttribute('aria-controls');
    const panel = block.querySelector(`#${panelId}`);
    expect(panel).toBeTruthy();
    expect(panel.getAttribute('role')).toBe('tabpanel');
  });

  test('aria-labelledby on panel points to corresponding tab id', () => {
    const panel = block.querySelectorAll('[role="tabpanel"]')[0];
    const tabId = panel.getAttribute('aria-labelledby');
    const tab = block.querySelector(`#${tabId}`);
    expect(tab).toBeTruthy();
    expect(tab.getAttribute('role')).toBe('tab');
  });

  test('clicking a tab activates it and hides others', () => {
    const tabs = block.querySelectorAll('[role="tab"]');
    const panels = block.querySelectorAll('[role="tabpanel"]');

    tabs[1].click();

    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
    expect(panels[1].hasAttribute('hidden')).toBe(false);
    expect(panels[0].hasAttribute('hidden')).toBe(true);
  });

  test('ArrowRight moves focus to next tab', () => {
    const tabs = block.querySelectorAll('[role="tab"]');
    const tablist = block.querySelector('[role="tablist"]');

    tablist.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, target: tabs[0] }));
  });

  test('Home key selects first tab', () => {
    const tabs = block.querySelectorAll('[role="tab"]');
    const panels = block.querySelectorAll('[role="tabpanel"]');

    tabs[2].click();

    const event = new KeyboardEvent('keydown', { key: 'Home', bubbles: true });
    Object.defineProperty(event, 'target', { value: tabs[2] });
    block.querySelector('[role="tablist"]').dispatchEvent(event);

    expect(tabs[0].getAttribute('aria-selected')).toBe('true');
    expect(panels[0].hasAttribute('hidden')).toBe(false);
  });

  test('End key selects last tab', () => {
    const tabs = block.querySelectorAll('[role="tab"]');
    const panels = block.querySelectorAll('[role="tabpanel"]');

    const event = new KeyboardEvent('keydown', { key: 'End', bubbles: true });
    Object.defineProperty(event, 'target', { value: tabs[0] });
    block.querySelector('[role="tablist"]').dispatchEvent(event);

    expect(tabs[2].getAttribute('aria-selected')).toBe('true');
    expect(panels[2].hasAttribute('hidden')).toBe(false);
  });

  test('handles rows with missing content cell gracefully', async () => {
    const sparseBlock = document.createElement('div');
    sparseBlock.className = 'tabs block';
    const row = document.createElement('div');
    const labelCell = document.createElement('div');
    labelCell.textContent = 'Only label';
    row.append(labelCell);
    sparseBlock.append(row);
    await expect(decorate(sparseBlock)).resolves.not.toThrow();
    expect(sparseBlock.querySelectorAll('[role="tab"]').length).toBe(1);
  });

  test('handles empty block gracefully', async () => {
    const emptyBlock = document.createElement('div');
    emptyBlock.className = 'tabs block';
    await expect(decorate(emptyBlock)).resolves.not.toThrow();
    expect(emptyBlock.querySelectorAll('[role="tab"]').length).toBe(0);
  });

  test('multiple blocks get unique IDs', async () => {
    const block2 = makeBlock([['A', 'Alpha']]);
    await decorate(block2);

    const id1 = block.querySelector('[role="tab"]').id;
    const id2 = block2.querySelector('[role="tab"]').id;
    expect(id1).not.toBe(id2);
  });
});
