/**
 * Tabs Block
 * Builds an accessible tablist with keyboard navigation.
 * Variations: tabs (pills), tabs (vertical)
 */

let blockIndex = 0;

/**
 * Activates a tab and shows its associated panel while deactivating all others.
 * @param {HTMLElement} tabEl The tab button to activate
 * @param {HTMLElement} tablist The tablist container element
 * @param {HTMLElement[]} panels Array of all panel elements
 */
function activateTab(tabEl, tablist, panels) {
  tablist.querySelectorAll('[role="tab"]').forEach((t) => {
    t.setAttribute('aria-selected', 'false');
    t.setAttribute('tabindex', '-1');
  });
  panels.forEach((p) => p.setAttribute('hidden', ''));

  tabEl.setAttribute('aria-selected', 'true');
  tabEl.setAttribute('tabindex', '0');
  const panelId = tabEl.getAttribute('aria-controls');
  const panel = panels.find((p) => p.id === panelId);
  if (panel) panel.removeAttribute('hidden');
}

/**
 * Loads and decorates the tabs block.
 * @param {Element} block The tabs block element
 */
export default async function decorate(block) {
  const currentIndex = blockIndex;
  blockIndex += 1;

  const rows = [...block.querySelectorAll(':scope > div')];

  const tablist = document.createElement('div');
  tablist.setAttribute('role', 'tablist');
  tablist.className = 'tabs-list';

  const panels = [];
  const tabs = [];

  rows.forEach((row, tabIdx) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    const labelCell = cells[0];
    const contentCell = cells[1];

    if (!labelCell) return;

    const tabId = `tab-${currentIndex}-${tabIdx}`;
    const panelId = `tabpanel-${currentIndex}-${tabIdx}`;

    const tab = document.createElement('button');
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', tabIdx === 0 ? 'true' : 'false');
    tab.setAttribute('aria-controls', panelId);
    tab.id = tabId;
    tab.setAttribute('tabindex', tabIdx === 0 ? '0' : '-1');
    tab.className = 'tabs-tab';
    tab.textContent = labelCell.textContent.trim();
    tablist.append(tab);
    tabs.push(tab);

    const panel = document.createElement('div');
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    panel.id = panelId;
    panel.className = 'tabs-panel';
    if (tabIdx !== 0) panel.setAttribute('hidden', '');
    if (contentCell) {
      panel.append(...contentCell.childNodes);
    }
    panels.push(panel);
  });

  block.replaceChildren(tablist, ...panels);

  tablist.addEventListener('click', (e) => {
    const tab = e.target.closest('[role="tab"]');
    if (!tab) return;
    activateTab(tab, tablist, panels);
    tab.focus();
  });

  tablist.addEventListener('keydown', (e) => {
    const currentTab = e.target.closest('[role="tab"]');
    if (!currentTab) return;

    const currentIdx = tabs.indexOf(currentTab);
    let nextIdx = currentIdx;

    const isVertical = block.classList.contains('vertical');

    if ((!isVertical && e.key === 'ArrowRight') || (isVertical && e.key === 'ArrowDown')) {
      nextIdx = (currentIdx + 1) % tabs.length;
    } else if ((!isVertical && e.key === 'ArrowLeft') || (isVertical && e.key === 'ArrowUp')) {
      nextIdx = (currentIdx - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      nextIdx = 0;
    } else if (e.key === 'End') {
      nextIdx = tabs.length - 1;
    } else {
      return;
    }

    e.preventDefault();
    activateTab(tabs[nextIdx], tablist, panels);
    tabs[nextIdx].focus();
  });
}
