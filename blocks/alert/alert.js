/**
 * Loads and decorates the alert block.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = [...block.children];

  const title = rows.length >= 2 ? rows[0].querySelector('div, p, h1, h2, h3, h4, h5, h6') : null;
  const bodyRow = rows.length >= 2 ? rows[rows.length - 1] : rows[0];
  const body = bodyRow ? bodyRow.querySelector('div, p') : null;

  const isDismissible = block.classList.contains('dismissible');

  block.setAttribute('role', 'alert');
  block.setAttribute('aria-live', 'polite');

  block.textContent = '';

  const content = document.createElement('div');
  content.className = 'alert-content';

  if (title) {
    const strong = document.createElement('strong');
    strong.className = 'alert-title';
    strong.textContent = title.textContent.trim();
    content.append(strong);
  }

  if (body) {
    const p = document.createElement('p');
    p.className = 'alert-body';
    p.textContent = body.textContent.trim();
    content.append(p);
  }

  block.append(content);

  if (isDismissible) {
    const closeBtn = document.createElement('button');
    closeBtn.className = 'alert-close';
    closeBtn.setAttribute('aria-label', 'Close');
    closeBtn.setAttribute('type', 'button');
    closeBtn.textContent = '✕';
    block.append(closeBtn);

    closeBtn.addEventListener('click', () => {
      block.remove();
    });
  }
}
