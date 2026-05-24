import { loadFragment } from '../fragment/fragment.js';
import fetchFragmentHtml from '../../scripts/config/fragment-loader.js';

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment
  const fragmentHtml = await fetchFragmentHtml(loadFragment, 'footer', '/footer');
  if (!fragmentHtml) return;

  // Parse and move fragment children into the block
  const temp = document.createElement('div');
  temp.innerHTML = fragmentHtml;
  block.textContent = '';
  const footer = document.createElement('div');
  while (temp.firstElementChild) footer.append(temp.firstElementChild);
  block.append(footer);
}
