import { describe, test, expect, beforeEach } from 'vitest';
import decorate from './accordion.js';

function makeBlock(rows, variation = '') {
  const block = document.createElement('div');
  block.className = `accordion block${variation ? ` ${variation}` : ''}`;
  rows.forEach(([heading, body]) => {
    const row = document.createElement('div');
    const headingCell = document.createElement('div');
    headingCell.textContent = heading;
    const bodyCell = document.createElement('div');
    const p = document.createElement('p');
    p.textContent = body;
    bodyCell.append(p);
    row.append(headingCell, bodyCell);
    block.append(row);
  });
  return block;
}

describe('accordion — decorate', () => {
  let block;

  beforeEach(() => {
    block = makeBlock([
      ['Question one', 'Answer one'],
      ['Question two', 'Answer two'],
      ['Question three', 'Answer three'],
    ]);
  });

  test('renders one <details> element per row', async () => {
    await decorate(block);
    expect(block.querySelectorAll('details').length).toBe(3);
  });

  test('first panel has open attribute by default', async () => {
    await decorate(block);
    const details = block.querySelectorAll('details');
    expect(details[0].hasAttribute('open')).toBe(true);
    expect(details[1].hasAttribute('open')).toBe(false);
    expect(details[2].hasAttribute('open')).toBe(false);
  });

  test('summary text matches heading cell content', async () => {
    await decorate(block);
    const summaries = block.querySelectorAll('summary');
    expect(summaries[0].textContent).toBe('Question one');
    expect(summaries[1].textContent).toBe('Question two');
    expect(summaries[2].textContent).toBe('Question three');
  });

  test('body content is placed inside accordion-content div', async () => {
    await decorate(block);
    const contentDivs = block.querySelectorAll('.accordion-content');
    expect(contentDivs.length).toBe(3);
    expect(contentDivs[0].querySelector('p').textContent).toBe('Answer one');
  });

  test('default variation closes others when a panel is toggled open', async () => {
    await decorate(block);
    const [first, second] = block.querySelectorAll('details');

    second.setAttribute('open', '');
    second.dispatchEvent(new Event('toggle', { bubbles: true }));

    expect(first.hasAttribute('open')).toBe(false);
    expect(second.hasAttribute('open')).toBe(true);
  });

  test('allow-multiple variation keeps other panels open', async () => {
    const multiBlock = makeBlock(
      [
        ['Item one', 'Content one'],
        ['Item two', 'Content two'],
      ],
      'allow-multiple',
    );

    await decorate(multiBlock);
    const [first, second] = multiBlock.querySelectorAll('details');

    second.setAttribute('open', '');
    second.dispatchEvent(new Event('toggle', { bubbles: true }));

    expect(first.hasAttribute('open')).toBe(true);
    expect(second.hasAttribute('open')).toBe(true);
  });

  test('handles rows with missing body cell gracefully', async () => {
    const sparseBlock = document.createElement('div');
    sparseBlock.className = 'accordion block';
    const row = document.createElement('div');
    const headingCell = document.createElement('div');
    headingCell.textContent = 'Only heading';
    row.append(headingCell);
    sparseBlock.append(row);

    await expect(decorate(sparseBlock)).resolves.not.toThrow();
    expect(sparseBlock.querySelectorAll('details').length).toBe(1);
  });

  test('handles empty block gracefully', async () => {
    const emptyBlock = document.createElement('div');
    emptyBlock.className = 'accordion block';
    await expect(decorate(emptyBlock)).resolves.not.toThrow();
    expect(emptyBlock.querySelectorAll('details').length).toBe(0);
  });
});
