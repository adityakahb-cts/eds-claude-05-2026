import { describe, test, expect, beforeEach } from 'vitest';
import decorate from './card.js';

function makeBlock(rows, variation = '') {
  const block = document.createElement('div');
  block.className = `card block${variation ? ` ${variation}` : ''}`;
  rows.forEach((cells) => {
    const row = document.createElement('div');
    cells.forEach((content) => {
      const cell = document.createElement('div');
      if (typeof content === 'string') {
        cell.textContent = content;
      } else if (content instanceof Node) {
        cell.append(content);
      }
      row.append(cell);
    });
    block.append(row);
  });
  return block;
}

function makePicture() {
  const pic = document.createElement('picture');
  const img = document.createElement('img');
  img.src = '/test.jpg';
  img.alt = 'Test image';
  pic.append(img);
  return pic;
}

function makeLink(text, href = '/test') {
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  return a;
}

describe('card — decorate', () => {
  let block;

  beforeEach(() => {
    block = makeBlock([
      [makePicture()],
      ['Card Title'],
      ['This is the description text.'],
      [makeLink('Read more', '/page')],
    ]);
  });

  test('renders card-image and card-body', async () => {
    await decorate(block);
    expect(block.querySelector('.card-image')).not.toBeNull();
    expect(block.querySelector('.card-body')).not.toBeNull();
  });

  test('places picture inside card-image', async () => {
    await decorate(block);
    const img = block.querySelector('.card-image picture');
    expect(img).not.toBeNull();
  });

  test('renders title as h3.card-title', async () => {
    await decorate(block);
    const h3 = block.querySelector('h3.card-title');
    expect(h3).not.toBeNull();
    expect(h3.textContent).toBe('Card Title');
  });

  test('renders description as p.card-description', async () => {
    await decorate(block);
    const p = block.querySelector('p.card-description');
    expect(p).not.toBeNull();
    expect(p.textContent).toBe('This is the description text.');
  });

  test('renders CTA link with card-cta class', async () => {
    await decorate(block);
    const cta = block.querySelector('a.card-cta');
    expect(cta).not.toBeNull();
    expect(cta.textContent).toBe('Read more');
    expect(cta.getAttribute('href')).toContain('/page');
  });

  test('featured variation uses card-background instead of card-image', async () => {
    const featuredBlock = makeBlock([[makePicture()], ['Featured Title'], ['Featured description.']], 'featured');
    await decorate(featuredBlock);
    expect(featuredBlock.querySelector('.card-background')).not.toBeNull();
    expect(featuredBlock.querySelector('.card-image')).toBeNull();
  });

  test('handles missing image gracefully', async () => {
    const noImgBlock = makeBlock([['Title without image'], ['Description without image.']]);
    await decorate(noImgBlock);
    expect(noImgBlock.querySelector('.card-image')).toBeNull();
    expect(noImgBlock.querySelector('.card-title').textContent).toBe('Title without image');
  });

  test('handles missing CTA gracefully', async () => {
    const noCta = makeBlock([['Title'], ['Description']]);
    await decorate(noCta);
    await expect(decorate(noCta)).resolves.not.toThrow();
    expect(noCta.querySelector('.card-cta')).toBeNull();
  });

  test('handles empty block gracefully', async () => {
    const emptyBlock = document.createElement('div');
    emptyBlock.className = 'card block';
    await expect(decorate(emptyBlock)).resolves.not.toThrow();
  });

  test('clears original block children before building', async () => {
    await decorate(block);
    const rowDivs = [...block.children].filter((el) => !el.className);
    expect(rowDivs.length).toBe(0);
  });
});
