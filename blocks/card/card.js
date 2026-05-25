/**
 * Loads and decorates the card block.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  const isFeatured = block.classList.contains('featured');

  let pictureEl = null;
  let titleText = null;
  const descParagraphs = [];
  let ctaLink = null;

  rows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    const cell = cells[0];
    if (!cell) return;

    const pic = cell.querySelector('picture');
    if (pic && !pictureEl) {
      pictureEl = pic;
      return;
    }

    const anchor = cell.querySelector('a');
    if (anchor && !ctaLink) {
      ctaLink = anchor;
      return;
    }

    const text = cell.textContent.trim();
    if (!text) return;

    if (!titleText) {
      titleText = text;
    } else {
      const ps = [...cell.querySelectorAll('p')];
      if (ps.length) {
        ps.forEach((p) => descParagraphs.push(p.textContent.trim()));
      } else {
        descParagraphs.push(text);
      }
    }
  });

  block.textContent = '';

  if (pictureEl) {
    const imageDiv = document.createElement('div');
    imageDiv.className = isFeatured ? 'card-background' : 'card-image';
    imageDiv.append(pictureEl);
    block.append(imageDiv);
  }

  const bodyDiv = document.createElement('div');
  bodyDiv.className = 'card-body';

  if (titleText) {
    const h3 = document.createElement('h3');
    h3.className = 'card-title';
    h3.textContent = titleText;
    bodyDiv.append(h3);
  }

  descParagraphs.forEach((text) => {
    const p = document.createElement('p');
    p.className = 'card-description';
    p.textContent = text;
    bodyDiv.append(p);
  });

  if (ctaLink) {
    const a = document.createElement('a');
    a.className = 'card-cta button';
    a.href = ctaLink.href;
    a.textContent = ctaLink.textContent.trim();
    bodyDiv.append(a);
  }

  block.append(bodyDiv);
}
