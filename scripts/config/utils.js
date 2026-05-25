import html from './html.js';

/**
 * Formats a date from milliseconds to 'dd mmm yyyy' format.
 * @param {number} milliseconds Date value in milliseconds
 * @returns {string} Formatted date string (e.g. '24 May 2026')
 */
export function formatDate(milliseconds) {
  const date = new Date(milliseconds);
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Appends a loading spinner inside targetEl and marks it as loading.
 * @param {Element} targetEl Element to inject the loader into
 * @returns {Element} The loader element (pass to destroyLoader to remove)
 */
export function addLoader(targetEl) {
  const loader = html`<div class="loader" role="status" aria-live="polite" aria-label="Loading...">
    <span class="loader-spinner" aria-hidden="true"></span>
  </div>`;
  targetEl.dataset.loading = 'true';
  targetEl.append(loader);
  return loader;
}

/**
 * Removes a loader element previously added by addLoader.
 * @param {Element} loaderEl The loader element returned by addLoader
 */
export function destroyLoader(loaderEl) {
  if (!loaderEl) return;
  const parent = loaderEl.parentElement;
  if (parent) delete parent.dataset.loading;
  loaderEl.remove();
}

/**
 * Appends a <script type="application/ld+json"> tag with Schema.org structured data.
 * @param {object} data Schema.org object (e.g. { '@context': 'https://schema.org', '@type': '...' })
 * @param {Element} container DOM element to append the script tag into
 */
export function injectStructuredData(data, container) {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  container.append(script);
}
