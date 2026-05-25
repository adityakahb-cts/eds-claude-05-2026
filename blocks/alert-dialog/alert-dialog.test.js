import { describe, test, expect, beforeEach, vi } from 'vitest';
import decorate from './alert-dialog.js';

function makeBlock(rows, classes = []) {
  const block = document.createElement('div');
  block.classList.add('alert-dialog', 'block', ...classes);

  rows.forEach((cells) => {
    const row = document.createElement('div');
    const cellArray = Array.isArray(cells) ? cells : [cells];
    cellArray.forEach((text) => {
      const cell = document.createElement('div');
      cell.textContent = text;
      row.append(cell);
    });
    block.append(row);
  });

  return block;
}

function makeLabeledBlock(classes = []) {
  return makeBlock(
    [
      ['Title', 'Dialog Title'],
      ['Message', 'Dialog message body.'],
      ['Trigger', 'Open Dialog'],
    ],
    classes,
  );
}

HTMLDialogElement.prototype.showModal = vi.fn(function showModal() {
  this.setAttribute('open', '');
});

HTMLDialogElement.prototype.close = vi.fn(function close() {
  this.removeAttribute('open');
  this.dispatchEvent(new Event('close'));
});

describe('alert-dialog block', () => {
  let block;

  beforeEach(() => {
    block = makeLabeledBlock();
    vi.clearAllMocks();
  });

  test('renders a trigger button', async () => {
    await decorate(block);
    const btn = block.querySelector('.alert-dialog-trigger');
    expect(btn).toBeTruthy();
    expect(btn.tagName).toBe('BUTTON');
    expect(btn.getAttribute('type')).toBe('button');
  });

  test('trigger button text matches Trigger row', async () => {
    await decorate(block);
    expect(block.querySelector('.alert-dialog-trigger').textContent).toBe('Open Dialog');
  });

  test('renders a dialog element', async () => {
    await decorate(block);
    expect(block.querySelector('dialog.alert-dialog-modal')).toBeTruthy();
  });

  test('dialog contains header, body, and footer', async () => {
    await decorate(block);
    const dialog = block.querySelector('dialog');
    expect(dialog.querySelector('.alert-dialog-header')).toBeTruthy();
    expect(dialog.querySelector('.alert-dialog-body')).toBeTruthy();
    expect(dialog.querySelector('.alert-dialog-footer')).toBeTruthy();
  });

  test('dialog title matches Title row', async () => {
    await decorate(block);
    const title = block.querySelector('.alert-dialog-title');
    expect(title.textContent).toBe('Dialog Title');
  });

  test('dialog body message matches Message row', async () => {
    await decorate(block);
    const body = block.querySelector('.alert-dialog-body p');
    expect(body.textContent).toBe('Dialog message body.');
  });

  test('dialog has a close X button', async () => {
    await decorate(block);
    const closeBtn = block.querySelector('.alert-dialog-close');
    expect(closeBtn).toBeTruthy();
    expect(closeBtn.getAttribute('aria-label')).toBe('Close dialog');
  });

  test('default variant renders OK button, not confirm/cancel', async () => {
    await decorate(block);
    expect(block.querySelector('.alert-dialog-ok')).toBeTruthy();
    expect(block.querySelector('.alert-dialog-confirm')).toBeNull();
    expect(block.querySelector('.alert-dialog-cancel')).toBeNull();
  });

  test('clicking trigger calls showModal()', async () => {
    await decorate(block);
    block.querySelector('.alert-dialog-trigger').click();
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledTimes(1);
  });

  test('clicking close button calls dialog.close()', async () => {
    await decorate(block);
    block.querySelector('.alert-dialog-trigger').click();
    block.querySelector('.alert-dialog-close').click();
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
  });

  test('clicking OK button closes dialog', async () => {
    await decorate(block);
    block.querySelector('.alert-dialog-trigger').click();
    block.querySelector('.alert-dialog-ok').click();
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
  });

  test('backdrop click closes dialog', async () => {
    await decorate(block);
    const dialog = block.querySelector('dialog');
    block.querySelector('.alert-dialog-trigger').click();
    dialog.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
  });

  test('confirm variant renders confirm and cancel buttons', async () => {
    const confirmBlock = makeLabeledBlock(['confirm']);
    await decorate(confirmBlock);
    expect(confirmBlock.querySelector('.alert-dialog-confirm')).toBeTruthy();
    expect(confirmBlock.querySelector('.alert-dialog-cancel')).toBeTruthy();
    expect(confirmBlock.querySelector('.alert-dialog-ok')).toBeNull();
  });

  test('confirm button emits alert-dialog:confirm custom event', async () => {
    const confirmBlock = makeLabeledBlock(['confirm']);
    document.body.append(confirmBlock);
    await decorate(confirmBlock);

    const eventSpy = vi.fn();
    confirmBlock.addEventListener('alert-dialog:confirm', eventSpy);

    confirmBlock.querySelector('.alert-dialog-trigger').click();
    confirmBlock.querySelector('.alert-dialog-confirm').click();

    expect(eventSpy).toHaveBeenCalledTimes(1);
    confirmBlock.remove();
  });

  test('confirm button closes dialog after emitting event', async () => {
    const confirmBlock = makeLabeledBlock(['confirm']);
    await decorate(confirmBlock);
    confirmBlock.querySelector('.alert-dialog-trigger').click();
    confirmBlock.querySelector('.alert-dialog-confirm').click();
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
  });

  test('cancel button closes dialog without emitting confirm event', async () => {
    const confirmBlock = makeLabeledBlock(['confirm']);
    await decorate(confirmBlock);
    const eventSpy = vi.fn();
    confirmBlock.addEventListener('alert-dialog:confirm', eventSpy);
    confirmBlock.querySelector('.alert-dialog-trigger').click();
    confirmBlock.querySelector('.alert-dialog-cancel').click();
    expect(eventSpy).not.toHaveBeenCalled();
    expect(HTMLDialogElement.prototype.close).toHaveBeenCalledTimes(1);
  });

  test('positional row detection works when no labels present', async () => {
    const positional = makeBlock(['Pos Title', 'Pos Message', 'Open Now']);
    await decorate(positional);
    expect(positional.querySelector('.alert-dialog-title').textContent).toBe('Pos Title');
    expect(positional.querySelector('.alert-dialog-body p').textContent).toBe('Pos Message');
    expect(positional.querySelector('.alert-dialog-trigger').textContent).toBe('Open Now');
  });

  test('clears original block content before rendering', async () => {
    const childrenBefore = block.children.length;
    expect(childrenBefore).toBeGreaterThan(0);
    await decorate(block);
    const trigger = block.querySelector('.alert-dialog-trigger');
    const dialog = block.querySelector('dialog');
    expect(block.children.length).toBe(2);
    expect(trigger).toBeTruthy();
    expect(dialog).toBeTruthy();
  });

  test('confirm variant uses custom confirm/cancel text from rows', async () => {
    const custom = makeBlock(
      [
        ['Title', 'Delete?'],
        ['Message', 'This cannot be undone.'],
        ['Trigger', 'Delete'],
        ['Confirm', 'Yes, delete'],
        ['Cancel', 'No, keep it'],
      ],
      ['confirm'],
    );
    await decorate(custom);
    expect(custom.querySelector('.alert-dialog-confirm').textContent).toBe('Yes, delete');
    expect(custom.querySelector('.alert-dialog-cancel').textContent).toBe('No, keep it');
  });
});
