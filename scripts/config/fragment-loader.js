import { getMetadata } from '../aem.js';

/**
 * Resolves a fragment path from page metadata, fetches the decorated fragment,
 * and returns its outerHTML as a string ready for inspection or insertion.
 *
 * This centralises the three-line boilerplate that each fragment-loading block
 * previously repeated:
 *   1. Read the metadata key to get an optional author-override URL.
 *   2. Normalise it to a same-origin pathname.
 *   3. Call loadFragment and return the root element's outerHTML.
 *
 * @param {Function} loadFragmentFn - The loadFragment function from fragment.js
 * @param {string} metaKey - Page-level <meta name="…"> key that can override the default path
 * @param {string} defaultPath - Fallback path used when the metadata key is absent
 * @returns {Promise<string|null>} The fragment's outerHTML string, or null if the fetch failed
 */
export default async function fetchFragmentHtml(loadFragmentFn, metaKey, defaultPath) {
  const meta = getMetadata(metaKey);
  const path = meta ? new URL(meta, window.location).pathname : defaultPath;
  const fragment = await loadFragmentFn(path);
  return fragment ? fragment.outerHTML : null;
}
