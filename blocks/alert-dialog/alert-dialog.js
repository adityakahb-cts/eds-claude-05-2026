/**
 * Extracts keyed config from labeled rows (e.g. "Title" | "My Title")
 * or falls back to positional assignment.
 * @param {Element[]} rows
 * @returns {{ title: string, message: string, trigger: string, confirm: string, cancel: string }}
 */
function extractConfig(rows) {
  const keys = ['title', 'message', 'trigger', 'confirm', 'cancel'];
  const config = { title: '', message: '', trigger: 'Open Dialog', confirm: 'OK', cancel: 'Cancel' };

  const labeledRows = rows.filter((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    if (cells.length < 2) return false;
    const label = cells[0].textContent.trim().toLowerCase();
    return keys.includes(label);
  });

  if (labeledRows.length > 0) {
    labeledRows.forEach((row) => {
      const cells = [...row.querySelectorAll(':scope > div')];
      const key = cells[0].textContent.trim().toLowerCase();
      config[key] = cells[1].textContent.trim();
    });
  } else {
    const positional = ['title', 'message', 'trigger', 'confirm', 'cancel'];
    rows.forEach((row, i) => {
      if (i < positional.length) {
        const cell = row.querySelector(':scope > div') || row;
        config[positional[i]] = cell.textContent.trim();
      }
    });
  }

  return config;
}

/**
 * Builds and returns the <dialog> element.
 * @param {object} config
 * @param {boolean} isConfirm
 * @returns {HTMLDialogElement}
 */
function buildDialog(config, isConfirm) {
  const dialog = document.createElement('dialog');
  dialog.className = 'alert-dialog-modal';

  const header = document.createElement('div');
  header.className = 'alert-dialog-header';

  const titleEl = document.createElement('h2');
  titleEl.className = 'alert-dialog-title';
  titleEl.textContent = config.title;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'alert-dialog-close';
  closeBtn.setAttribute('aria-label', 'Close dialog');
  closeBtn.setAttribute('type', 'button');
  closeBtn.textContent = '✕';

  header.append(titleEl, closeBtn);

  const body = document.createElement('div');
  body.className = 'alert-dialog-body';
  const messageEl = document.createElement('p');
  messageEl.textContent = config.message;
  body.append(messageEl);

  const footer = document.createElement('div');
  footer.className = 'alert-dialog-footer';

  if (isConfirm) {
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'alert-dialog-confirm';
    confirmBtn.setAttribute('type', 'button');
    confirmBtn.textContent = config.confirm;

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'alert-dialog-cancel';
    cancelBtn.setAttribute('type', 'button');
    cancelBtn.textContent = config.cancel;

    footer.append(confirmBtn, cancelBtn);
  } else {
    const okBtn = document.createElement('button');
    okBtn.className = 'alert-dialog-ok';
    okBtn.setAttribute('type', 'button');
    okBtn.textContent = config.confirm !== 'Cancel' ? config.confirm : 'OK';
    footer.append(okBtn);
  }

  dialog.append(header, body, footer);
  return dialog;
}

/**
 * Loads and decorates the alert-dialog block.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = [...block.children];
  const isConfirm = block.classList.contains('confirm');

  const config = extractConfig(rows);

  block.textContent = '';

  const triggerBtn = document.createElement('button');
  triggerBtn.className = 'alert-dialog-trigger';
  triggerBtn.setAttribute('type', 'button');
  triggerBtn.textContent = config.trigger;

  const dialog = buildDialog(config, isConfirm);
  block.append(triggerBtn, dialog);

  triggerBtn.addEventListener('click', () => {
    dialog.showModal();
  });

  dialog.querySelector('.alert-dialog-close').addEventListener('click', () => {
    dialog.close();
  });

  if (isConfirm) {
    dialog.querySelector('.alert-dialog-confirm').addEventListener('click', () => {
      dialog.dispatchEvent(new CustomEvent('alert-dialog:confirm', { bubbles: true }));
      dialog.close();
    });
    dialog.querySelector('.alert-dialog-cancel').addEventListener('click', () => {
      dialog.close();
    });
  } else {
    dialog.querySelector('.alert-dialog-ok').addEventListener('click', () => {
      dialog.close();
    });
  }

  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) {
      dialog.close();
    }
  });
}
