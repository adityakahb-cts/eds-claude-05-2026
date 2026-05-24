import { html, getPlaceholder } from '../aem.js';

/**
 * Formats date from milliseconds to dd mmm yyyy format
 * @param {number} milliseconds | date in milliseconds
 * @returns | date in dd mmm yyyy format
 */
export function formatDate(milliseconds) {
  const date = new Date(milliseconds);
  const day = date.getDate();
  const month = date.toLocaleString('en-US', { month: 'short' });
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Add loader inside an element
 * @param {*} targetEl | Element inside which loader should come
 * @returns loader element
 */
export function addloader(targetEl) {
  const loaderEl = html`<div class="generic-loader">
    <div class="generic-loader__spinner"></div>
    <div class="sr-only" aria-live="polite">${getPlaceholder('Loading')}</div>
  </div>`;
  targetEl.appendChild(loaderEl);
  targetEl.classList.add('loading-indicator');
  setTimeout(() => {
    targetEl.style.opacity = '1';
  }, 30);
  return loaderEl;
}

export function destroyLoader(loaderEl) {
  if (loaderEl) {
    loaderEl.parentElement.classList.remove('loading-indicator');
    loaderEl.remove();
  }
}

/**
 * Appends a <script type="application/ld+json"> tag containing Schema.org structured data.
 * @param {object} data - Schema.org object (e.g. { '@context': 'https://schema.org', '@type': '...' })
 * @param {Element} container - DOM element to append the script tag into
 */
export function injectStructuredData(data, container) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data, null, 2);
  container.appendChild(script);
}
