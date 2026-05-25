import { describe, test, expect, beforeEach } from 'vitest';
import decorate from './alert.js';

function makeBlock(rows, classes = []) {
  const block = document.createElement('div');
  block.classList.add('alert', 'block', ...classes);
  rows.forEach((text) => {
    const row = document.createElement('div');
    const cell = document.createElement('div');
    cell.textContent = text;
    row.append(cell);
    block.append(row);
  });
  return block;
}

describe('alert block', () => {
  let block;

  beforeEach(() => {
    block = makeBlock(['Information', 'This is an informational alert.']);
  });

  test('adds role="alert" to block element', async () => {
    await decorate(block);
    expect(block.getAttribute('role')).toBe('alert');
  });

  test('adds aria-live="polite" to block element', async () => {
    await decorate(block);
    expect(block.getAttribute('aria-live')).toBe('polite');
  });

  test('renders alert-content wrapper', async () => {
    await decorate(block);
    expect(block.querySelector('.alert-content')).toBeTruthy();
  });

  test('renders title from first row when two rows provided', async () => {
    await decorate(block);
    const title = block.querySelector('.alert-title');
    expect(title).toBeTruthy();
    expect(title.textContent).toBe('Information');
  });

  test('renders body text from last row', async () => {
    await decorate(block);
    const body = block.querySelector('.alert-body');
    expect(body).toBeTruthy();
    expect(body.textContent).toBe('This is an informational alert.');
  });

  test('renders only body when single row provided (no title)', async () => {
    const singleBlock = makeBlock(['Just a message.']);
    await decorate(singleBlock);
    expect(singleBlock.querySelector('.alert-title')).toBeNull();
    const body = singleBlock.querySelector('.alert-body');
    expect(body).toBeTruthy();
    expect(body.textContent).toBe('Just a message.');
  });

  test('removes original authored rows from DOM', async () => {
    await decorate(block);
    const originalRow = block.querySelector('div > div > div');
    expect(originalRow).toBeNull();
  });

  test('does not render close button when not dismissible', async () => {
    await decorate(block);
    expect(block.querySelector('.alert-close')).toBeNull();
  });

  test('renders close button when dismissible class is present', async () => {
    const dismissible = makeBlock(['Title', 'Message.'], ['dismissible']);
    await decorate(dismissible);
    const btn = dismissible.querySelector('.alert-close');
    expect(btn).toBeTruthy();
    expect(btn.getAttribute('aria-label')).toBe('Close');
    expect(btn.getAttribute('type')).toBe('button');
  });

  test('close button removes block from DOM on click', async () => {
    const parent = document.createElement('div');
    const dismissible = makeBlock(['Title', 'Message.'], ['dismissible']);
    parent.append(dismissible);
    document.body.append(parent);

    await decorate(dismissible);
    const btn = dismissible.querySelector('.alert-close');
    btn.click();

    expect(parent.contains(dismissible)).toBe(false);

    parent.remove();
  });

  test('applies success class variant without error', async () => {
    const success = makeBlock(['Success', 'Saved!'], ['success']);
    await expect(decorate(success)).resolves.toBeUndefined();
    expect(success.querySelector('.alert-content')).toBeTruthy();
  });

  test('applies warning class variant without error', async () => {
    const warning = makeBlock(['Warning', 'Check input.'], ['warning']);
    await expect(decorate(warning)).resolves.toBeUndefined();
    expect(warning.querySelector('.alert-content')).toBeTruthy();
  });

  test('applies error class variant without error', async () => {
    const error = makeBlock(['Error', 'Something failed.'], ['error']);
    await expect(decorate(error)).resolves.toBeUndefined();
    expect(error.querySelector('.alert-content')).toBeTruthy();
  });

  test('handles empty block gracefully', async () => {
    const empty = document.createElement('div');
    empty.classList.add('alert', 'block');
    await expect(decorate(empty)).resolves.toBeUndefined();
    expect(empty.getAttribute('role')).toBe('alert');
  });

  test('handles extra rows by using first as title and last as body', async () => {
    const extra = makeBlock(['Title', 'Middle row', 'Body message']);
    await decorate(extra);
    const title = extra.querySelector('.alert-title');
    const body = extra.querySelector('.alert-body');
    expect(title.textContent).toBe('Title');
    expect(body.textContent).toBe('Body message');
  });
});
