// add delayed functionality here
import { initializeDataLayer } from './analytics/adobe-data-layer.js';
import { loadEnvConfig, loadBlock, html, isCDN } from './aem.js';

async function loadDelayedBlocks(blockName) {
  try {
    const main = document.querySelector('main');
    const block = html`<div class="${blockName}" data-block-name="${blockName}" data-block-status="initialized"></div>`;
    main.appendChild(block);
    await loadBlock(block);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(`Error loading ${blockName} block:`, error);
  }
}

async function loadAllDelayedBlocks() {
  await loadDelayedBlocks('wechat-floatingbar');
  await loadDelayedBlocks('back-to-top');
}

async function checkBrowserIncompatibility() {
  if (!isCDN()) {
    return;
  }
  const { browserIncompatibilityScriptPath } = await loadEnvConfig();
  const fullUrl = browserIncompatibilityScriptPath || '/cs/agilent_scripts/check-browser-compatibility.js';
  const loadedFlagName = '__ibc_LOADED__';

  if (!window[loadedFlagName]) {
    const scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.src = fullUrl;
    scriptTag.async = false;
    scriptTag.onload = () => {
      window[loadedFlagName] = true;
    };
    scriptTag.onerror = (event) =>
      console.error(
        `[Browser Compatibility JS] Failed to load browser compatibility check script from [${fullUrl}]`,
        event,
      );
    document.head.appendChild(scriptTag);
  }
}

const checkForScrollPosition = () => {
  const lastScrolledPosition = sessionStorage.getItem('restoreScrollPosition');
  if (lastScrolledPosition) {
    sessionStorage.removeItem('restoreScrollPosition');
    try {
      const { x, y } = JSON.parse(lastScrolledPosition);
      window.scroll(x, y);
    } catch (e) {
      console.log('Invalid value in state.');
    }
  }
};

function addCardLinkActivation(wrapper = null) {
  const container = wrapper || document;
  container.querySelectorAll('div[data-card-click]').forEach((card) => {
    const link = card.querySelector('a[data-card-target]') || card.querySelector('a, button');
    if (!link) return;
    card.addEventListener('click', (e) => {
      if (e.target.closest('a, button')) return;
      link.click();
    });
    card.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      if (document.activeElement === link || link.contains(document.activeElement)) {
        return;
      }
      e.preventDefault();
      link.click();
    });
  });
}
// Hide Qualtrics on mobile viewport to examine performance.
// TODO: Remove this function after performance issue is resolved.
const hideQualtricsVisuallyforPerformanceMobile = async () => {
  const config = await loadEnvConfig();
  if (config.showQualtricsForMobile) {
    return;
  }
  const style = document.createElement('style');
  style.innerHTML = `
    @media (max-width: 767px) {
      div.QSIPopOver {
        display: none !important;
      }
    }
  `;
  document.head.appendChild(style);
};

loadAllDelayedBlocks();
// Initialize Adobe Data Layer in the delayed script
initializeDataLayer();
checkBrowserIncompatibility();
checkForScrollPosition();
addCardLinkActivation();
hideQualtricsVisuallyforPerformanceMobile();
