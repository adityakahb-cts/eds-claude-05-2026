/**
 * Returns all keyboard-focusable elements within a container.
 * @param {Element} container
 * @returns {Element[]}
 */
function getFocusableElements(container) {
  return [
    ...container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ];
}

/**
 * Adds a keydown handler that traps Tab focus within the panel.
 * @param {Element} panel
 * @returns {Function|undefined} The keydown handler, or undefined if no focusable elements exist
 */
function trapFocus(panel) {
  const focusable = getFocusableElements(panel);
  if (!focusable.length) return undefined;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  function handler(e) {
    if (e.key !== 'Tab') return;
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else if (document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  panel.addEventListener('keydown', handler);
  return handler;
}

/**
 * Loads and decorates the offcanvas block.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return;

  const triggerRow = rows[0];
  const triggerCells = [...triggerRow.querySelectorAll(':scope > div')];
  const triggerText = (triggerCells[1] || triggerCells[0])?.textContent.trim() || 'Open';

  const contentRows = rows.slice(1);

  const isEnd = block.classList.contains('end');
  const isTop = block.classList.contains('top');
  const isBottom = block.classList.contains('bottom');

  let direction = 'start';
  if (isEnd) direction = 'end';
  else if (isTop) direction = 'top';
  else if (isBottom) direction = 'bottom';

  block.textContent = '';

  const trigger = document.createElement('button');
  trigger.className = 'offcanvas-trigger';
  trigger.setAttribute('type', 'button');
  trigger.textContent = triggerText;
  block.append(trigger);

  const panelId = `offcanvas-panel-${Math.random().toString(36).slice(2, 8)}`;

  const panel = document.createElement('div');
  panel.className = `offcanvas-panel offcanvas-panel-${direction}`;
  panel.setAttribute('id', panelId);
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  panel.setAttribute('aria-label', triggerText);
  panel.setAttribute('hidden', '');

  const closeBtn = document.createElement('button');
  closeBtn.className = 'offcanvas-close';
  closeBtn.setAttribute('type', 'button');
  closeBtn.setAttribute('aria-label', 'Close');
  closeBtn.textContent = '✕';
  panel.append(closeBtn);

  const contentDiv = document.createElement('div');
  contentDiv.className = 'offcanvas-content';
  contentRows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    const cell = cells[0] || row;
    contentDiv.append(...cell.childNodes);
  });
  panel.append(contentDiv);

  const backdrop = document.createElement('div');
  backdrop.className = 'offcanvas-backdrop';

  document.body.append(panel, backdrop);

  trigger.setAttribute('aria-controls', panelId);
  trigger.setAttribute('aria-expanded', 'false');

  let focusTrapHandler = null;
  let previouslyFocused = null;

  function openPanel() {
    panel.removeAttribute('hidden');
    backdrop.removeAttribute('hidden');
    requestAnimationFrame(() => {
      panel.classList.add('is-open');
      backdrop.classList.add('is-open');
    });
    trigger.setAttribute('aria-expanded', 'true');
    previouslyFocused = document.activeElement;
    focusTrapHandler = trapFocus(panel);
    const firstFocusable = getFocusableElements(panel)[0];
    if (firstFocusable) firstFocusable.focus();
  }

  function closePanel() {
    panel.classList.remove('is-open');
    backdrop.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
    if (focusTrapHandler) {
      panel.removeEventListener('keydown', focusTrapHandler);
      focusTrapHandler = null;
    }
    const onTransitionEnd = () => {
      panel.setAttribute('hidden', '');
      backdrop.setAttribute('hidden', '');
      panel.removeEventListener('transitionend', onTransitionEnd);
    };
    panel.addEventListener('transitionend', onTransitionEnd);
    if (previouslyFocused) previouslyFocused.focus();
  }

  trigger.addEventListener('click', openPanel);
  closeBtn.addEventListener('click', closePanel);
  backdrop.addEventListener('click', closePanel);

  panel.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePanel();
  });
}
