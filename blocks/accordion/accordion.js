/**
 * Accordion Block
 * Renders collapsible panels using native <details>/<summary> elements.
 * Variation: accordion (allow-multiple) — multiple panels open simultaneously.
 */

/**
 * Loads and decorates the accordion block.
 * @param {Element} block The accordion block element
 */
export default async function decorate(block) {
  const allowMultiple = block.classList.contains('allow-multiple');
  const rows = [...block.querySelectorAll(':scope > div')];

  const details = rows
    .map((row, index) => {
      const cells = [...row.querySelectorAll(':scope > div')];
      const headingCell = cells[0];
      const bodyCell = cells[1];

      if (!headingCell) return null;

      const detailsEl = document.createElement('details');
      if (index === 0) detailsEl.setAttribute('open', '');

      const summary = document.createElement('summary');
      summary.className = 'accordion-summary';
      const headingText = headingCell.textContent.trim();
      summary.textContent = headingText;
      detailsEl.append(summary);

      const contentDiv = document.createElement('div');
      contentDiv.className = 'accordion-content';
      if (bodyCell) {
        contentDiv.append(...bodyCell.childNodes);
      }
      detailsEl.append(contentDiv);

      return detailsEl;
    })
    .filter(Boolean);

  block.replaceChildren(...details);

  if (!allowMultiple) {
    block.addEventListener(
      'toggle',
      (e) => {
        if (!e.target.open) return;
        details.forEach((d) => {
          if (d !== e.target) d.removeAttribute('open');
        });
      },
      true,
    );
  }
}
