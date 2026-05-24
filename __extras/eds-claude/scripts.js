/* script js file */

import {
  init,
  loadHeader,
  loadFooter,
  decorateButtons,
  decorateLabel,
  decorateSections,
  decorateBlocks,
  decorateTemplateAndTheme,
  waitForLCPMedia,
  loadSection,
  loadSections,
  loadCSS,
  getLinkFallback,
  getLocaleAgnosticPath,
  initSSO,
  checkSSO,
  login,
  registration,
  logout,
  getMetadata,
  loadEnvConfig,
  getCookie,
  html,
  fetchIndex,
  isCDN,
  loadScript,
  pushToDataLayer,
  prepareGetAssetPath,
  isLoggedIn,
  setCookie,
  getLocale,
  getUserInfo,
  refreshUserInfo,
} from './aem.js';

init();

function getLoginEvent() {
  window.addEventListener('user:Login', () => {
    const userInfo = getUserInfo();
    const xdmData = {
      event: 'login-success',
      eventInfo: {
        type: 'agilent.login.success',
      },
      xdm: {
        user: {
          loginStatus: true,
          userID: getCookie('userId'),
          userType: userInfo?.customerType || '',
          sapECCID: userInfo?.sapCustomerId || '',
        },
      },
    };
    pushToDataLayer(xdmData);
  });
}
getLoginEvent();

async function loadLaunchLibrary() {
  const config = await loadEnvConfig();
  if (!config || !config.adobeLaunchUrl) {
    // eslint-disable-next-line no-console
    console.debug('Invalid config object passed to loadLaunchLibrary:', config);
    return;
  }

  await loadScript(config.adobeLaunchUrl, { async: true });
}

async function loadGoogleAnalytics() {
  const config = await loadEnvConfig();
  if (!config || !config.googleTagManagerId) {
    // eslint-disable-next-line no-console
    console.debug('Invalid config object passed to loadGoogleAnalytics:', config);
    return;
  }
  ((w, d, s, l, i) => {
    w[l] = w[l] || [];
    w[l].push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    });
    const f = d.getElementsByTagName(s)[0];
    const j = d.createElement(s);
    const dl = l !== 'dataLayer' ? `&l=${l}` : '';
    j.async = true;
    j.src = `https://www.googletagmanager.com/gtm.js?id=${i}${dl}`;
    f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', config.googleTagManagerId);

  const bodyTemplate = `<!-- Google Tag Manager (noscript) -->

    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${config.googleTagManagerId}"

    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>

    <!-- End Google Tag Manager (noscript) -->`;

  document.body.insertAdjacentHTML('afterbegin', bodyTemplate);
}

async function loadOneTrustAutoBlock() {
  if (!isCDN()) {
    return;
  }

  const config = await loadEnvConfig();
  if (config.oneTrustAutoBlock) {
    await loadScript(config.oneTrustAutoBlock, { async: true });
  }
}

async function loadOneTrust() {
  if (!isCDN()) {
    return;
  }
  const config = await loadEnvConfig();
  if (config.oneTrustUrl && config.oneTrustDomainScript) {
    await loadScript(config.oneTrustUrl, {
      id: 'onetrust-script',
      'data-domain-script': config.oneTrustDomainScript,
      charset: 'UTF-8',
      'data-dLayer-name': 'gtagDataLayer',
      async: true,
    });
    if (window.OneTrust && typeof window.OneTrust.OnConsentChanged === 'function') {
      // eslint-disable-next-line no-use-before-define
      window.OneTrust.OnConsentChanged(() => loadAlreadyTriggeredExternalScripts());
    }

    if ('requestIdleCallback' in window) {
      // eslint-disable-next-line no-use-before-define
      window.requestIdleCallback(() => loadAlreadyTriggeredExternalScripts());
    } else if (document.readyState === 'complete') {
      // eslint-disable-next-line no-use-before-define
      loadAlreadyTriggeredExternalScripts();
    } else {
      // eslint-disable-next-line no-use-before-define
      window.addEventListener('load', () => loadAlreadyTriggeredExternalScripts());
    }
    if (config.oneTrustBannerUrl) {
      await loadScript(config.oneTrustBannerUrl, { async: true });
    }
  }
}

function toCssSelector(selector) {
  return selector.replace(
    /(\.\S+)?:eq\((\d+)\)/g,
    (_, clss, i) => `:nth-child(${Number(i) + 1}${clss ? ` of ${clss})` : ''}`,
  );
}

function getElementForProposition(proposition) {
  const selector = proposition.data.prehidingSelector || toCssSelector(proposition.data.selector);
  return document.querySelector(selector);
}

const executeAlloyCommand = (...args) =>
  new Promise((resolve, reject) => {
    window.setTimeout(() => {
      window.alloy.q.push([resolve, reject, args]);
    });
  });

const isValidPropositionItem = (i) =>
  i.schema !== 'https://ns.adobe.com/personalization/dom-action' || !getElementForProposition(i);

async function loadAdobeTargetLibrary() {
  const aemConfig = await loadEnvConfig();
  if (!aemConfig.targetDataStreamId || !aemConfig.targetOrgId) {
    console.error('Invalid config object passed to loadAdobeTargetLibrary:', aemConfig);
    return;
  }

  if (getMetadata('target') === 'disabled') {
    console.error('Target is disabled for this page', getMetadata('target'));
    return;
  }

  function initWebSDK(path, config) {
    if (!window.alloy) {
      // eslint-disable-next-line no-underscore-dangle
      (window.__alloyNS ||= []).push('alloy');
      window.alloy = executeAlloyCommand;
      window.alloy.q = [];
    }
    // Loading and configuring the websdk
    return new Promise((resolve) => {
      import(path).then(() => window.alloy('configure', config)).then(resolve);
    });
  }

  function onDecoratedElement(fn) {
    // Apply propositions to all already decorated blocks/sections
    if (document.querySelector('[data-block-status="loaded"],[data-section-status="loaded"]')) {
      fn();
    }

    const observer = new MutationObserver((mutations) => {
      if (
        mutations.some(
          (m) =>
            m.target.tagName === 'BODY' ||
            m.target.dataset.sectionStatus === 'loaded' ||
            m.target.dataset.blockStatus === 'loaded',
        )
      ) {
        fn();
      }
    });
    // Watch sections and blocks being decorated async
    observer.observe(document.querySelector('main'), {
      subtree: true,
      attributes: true,
      attributeFilter: ['data-block-status', 'data-section-status'],
    });
    // Watch anything else added to the body
    observer.observe(document.querySelector('body'), { childList: true });
  }

  async function getAndApplyRenderDecisions() {
    // Get the decisions, but don't render them automatically
    // so we can hook up into the AEM EDS page load sequence
    const response = await window.alloy('sendEvent', { renderDecisions: false });
    const { propositions } = response;
    onDecoratedElement(async () => {
      await window.alloy('applyPropositions', { propositions });
      // keep track of propositions that were applied
      propositions.forEach((p) => {
        p.items = p.items.filter(isValidPropositionItem);
      });
    });

    // Reporting is deferred to avoid long tasks
    window.setTimeout(() => {
      // Report shown decisions
      window.alloy('sendEvent', {
        xdm: {
          eventType: 'decisioning.propositionDisplay',
          _experience: {
            decisioning: { propositions },
          },
        },
      });
    });
  }

  await initWebSDK('./analytics/lib/alloy.min.js', {
    datastreamId: aemConfig.targetDataStreamId,
    orgId: aemConfig.targetOrgId,
  }).then(() => getAndApplyRenderDecisions());
}

// external script modes:
// allDeactivated - no external scripts will be loaded
// allEager - all external scripts will be loaded in eager phase
// allLazy - all external scripts will be loaded in lazy phase
// allDelayed - all external scripts will be loaded in delayed phase
// --
// individual script can be deactivated or loaded in eager, lazy or delayed
// by setting ?externalScripts=scriptName:mode[,scriptName:mode]
const isDesktop = window.matchMedia('(min-width: 1025px)').matches;
const isHomepage = window.location.pathname.match(/^\/[a-z]{2}(-[a-z]{2})?\/?$/);
const queryParameters = new URLSearchParams(window.location.search);
const externalScriptLoadingStrategy = queryParameters.get('externalScriptLoadingStrategy');
// option 01 strategy is to enable it for homepage and desktop only.
const externalScriptOption01Strategy =
  isDesktop && getMetadata('target') !== 'disabled' && isHomepage && externalScriptLoadingStrategy === 'option01';
const externalScriptConfig = {
  onetrustautoblock: {
    load: loadOneTrustAutoBlock,
    default: 'eager',
  },
  onetrust: {
    load: loadOneTrust,
    default: externalScriptOption01Strategy ? 'lazy' : 'delayed',
  },
  adobe: {
    load: loadLaunchLibrary,
    default: externalScriptOption01Strategy ? 'lazy' : 'delayed',
    cookieDelayed: false,
  },
  google: {
    load: loadGoogleAnalytics,
    default: 'delayed',
    cookieDelayed: false,
  },
  target: {
    load: loadAdobeTargetLibrary,
    default: externalScriptLoadingStrategy !== 'option01' ? 'deactivated' : 'eager', // dont load for option01 strategy
  },
};
(() => {
  const param = (new URLSearchParams(window.location.search).get('externalScripts') || 'default').toLowerCase();
  const validModes = ['deactivated', 'eager', 'lazy', 'delayed'];
  if (validModes.includes(param)) {
    Object.keys(externalScriptConfig).forEach((script) => {
      externalScriptConfig[script].default = param;
    });
  } else {
    const entries = param.split(',');
    entries.forEach((entry) => {
      const [scriptName, mode] = entry.split(':');
      if (externalScriptConfig[scriptName] && validModes.includes(mode)) {
        externalScriptConfig[scriptName].default = mode;
      }
    });
  }
})();

const triggeredPhases = [];
async function loadExternalScript(phase) {
  triggeredPhases.push(phase);
  return Promise.all(
    Object.entries(externalScriptConfig).map(([, config]) => {
      if (!config.loaded && config.default === phase) {
        if (
          !config.cookieDelayed ||
          (typeof window.OptanonActiveGroups !== 'undefined' &&
            (window.OptanonActiveGroups.includes('C0002') || window.OptanonActiveGroups.includes('C0004')))
        ) {
          config.loaded = true;
          return config.load();
        }
      }
      return Promise.resolve();
    }),
  );
}

async function loadAlreadyTriggeredExternalScripts() {
  await Promise.all(triggeredPhases.map((phase) => loadExternalScript(phase)));
}

function buildSectionHeader(main) {
  // Updated selector to support multiple headings with optional links
  const sectionHeaders = main.querySelectorAll(
    '.section > .default-content-wrapper:first-child:has(:is(h1, h2, h3, h4, h5, h6))',
  );

  sectionHeaders.forEach((sectionHeader) => {
    sectionHeader.classList.add('section__header');

    const children = Array.from(sectionHeader.children);
    const rows = [];
    let currentRow = null;

    children.forEach((child) => {
      if (child.matches('h1, h2, h3, h4, h5, h6')) {
        currentRow = document.createElement('div');
        currentRow.classList.add('section__header-row');
        child.classList.add('section__title');
        currentRow.appendChild(child);
        rows.push(currentRow);
      } else if (child.matches('p') && child.querySelector('a') && currentRow) {
        child.classList.add('section__link');
        currentRow.appendChild(child);
      } else if (child.matches('p') && child.querySelector('picture') && !child.querySelector('a') && currentRow) {
        child.classList.add('section__link--picture-paragraph');
        currentRow.appendChild(child);
      } else if (child.matches('p')) {
        currentRow = document.createElement('div');
        currentRow.classList.add('section__description-row');
        currentRow.appendChild(child);
        rows.push(currentRow);
      }
    });

    sectionHeader.innerHTML = '';
    rows.forEach((row) => sectionHeader.appendChild(row));

    const paragraphs = sectionHeader.querySelectorAll('.section__link');
    paragraphs.forEach((paragraph) => {
      const iconQrCode = paragraph.querySelector('.icon.icon-qr-code');
      let pictureTag = paragraph.querySelector('picture');
      const parentRow = paragraph.parentElement;
      const siblingPicturePara =
        !pictureTag && parentRow ? parentRow.querySelector('.section__link--picture-paragraph picture') : null;
      if (!pictureTag && siblingPicturePara) {
        pictureTag = siblingPicturePara;
      }
      if (iconQrCode && pictureTag) {
        const parentParagraph = pictureTag.closest('p');

        const pictureWrapper = document.createElement('p');
        pictureWrapper.classList.add('section__link--picture', 'hidden');
        pictureWrapper.appendChild(pictureTag);

        const pictureWrapperCnt = document.createElement('p');
        pictureWrapperCnt.classList.add('section__link--picture-wrapper');
        pictureWrapperCnt.append(iconQrCode, pictureWrapper);
        paragraph.prepend(pictureWrapperCnt);
        if (parentParagraph) {
          parentParagraph.remove();
        }

        iconQrCode.addEventListener('click', (event) => {
          event.stopPropagation();
          event.preventDefault();
          document.querySelectorAll('.icon.icon-qr-code').forEach((otherIcon) => {
            if (otherIcon !== iconQrCode) {
              const otherWrapper = otherIcon.closest('.section__link--picture-wrapper');
              if (otherWrapper) {
                const otherPictureWrapper = otherWrapper.querySelector('.section__link--picture');
                if (otherPictureWrapper && !otherPictureWrapper.classList.contains('hidden')) {
                  otherPictureWrapper.classList.add('hidden');
                }
              }
            }
          });
          pictureWrapper.classList.toggle('hidden');
        });

        iconQrCode.addEventListener('mouseenter', () => {
          if (!window.matchMedia('(pointer: fine)').matches) return;
          if (pictureWrapper.classList.contains('hidden')) {
            pictureWrapper.classList.remove('hidden');
          }
        });

        iconQrCode.addEventListener('mouseleave', () => {
          if (!window.matchMedia('(pointer: fine)').matches) return;
          if (!pictureWrapper.classList.contains('hidden')) {
            pictureWrapper.classList.add('hidden');
          }
        });

        document.addEventListener('click', ({ target }) => {
          if (!iconQrCode.contains(target) && !pictureWrapper.contains(target)) {
            pictureWrapper.classList.add('hidden');
          }
        });
      }
    });
  });
}

function buildImageWithLinks(main) {
  const imageLinks = main.querySelectorAll('p:has(> picture) + p.button-container:has(a)');
  [...imageLinks].forEach((linkWrapper) => {
    const picture = linkWrapper.previousElementSibling.querySelector('picture');
    const targetLink = linkWrapper.querySelector('a');
    targetLink.innerHTML = `<span class="text-link">${targetLink.innerHTML}</span>`;
    targetLink.prepend(picture);
    targetLink.classList.add('image-link');
    linkWrapper.previousElementSibling.remove();
  });
}

function buildSectionLinkMobile(main) {
  const sectionLinks = main.querySelectorAll('.section-ctamobile');
  sectionLinks.forEach((section) => {
    const blocks = section.querySelectorAll('.default-content-wrapper + div > .block');
    blocks.forEach((block) => {
      const seeAllLink = block.parentElement.previousElementSibling.querySelector('a');
      if (seeAllLink) {
        seeAllLink.classList.add('columns-cta');
        const ctaClone = seeAllLink.cloneNode(true);
        ctaClone.className = 'agt-button agt-button--secondary button-ctamobile';
        const wrapperButton = document.createElement('div');
        wrapperButton.className = 'button-ctamobile-wrapper';
        wrapperButton.appendChild(ctaClone);
        block.after(wrapperButton);
        const isMobile = window.matchMedia('(max-width: 768px)');
        isMobile.addEventListener('change', () => {
          ctaClone.setAttribute('aria-hidden', !isMobile.matches);
        });
      }
    });
  });
}

/**
 * Builds all synthetic blocks in a container element.
 * @param {Element} main The container element
 */
function buildAutoBlocks(main) {
  try {
    buildSectionHeader(main);
    buildSectionLinkMobile(main);
    buildImageWithLinks(main);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auto Blocking failed', error);
  }
}

/**
 * set language attribute on html tag
 * @returns {void}
 */
function setHtmlLang() {
  document.documentElement.lang = window.location.pathname.split('/')[1] || 'en';
}

/**
 * fix trailing slash in canonical link
 * @returns {void}
 */
function fixCanonicalTrailingSlash() {
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    let { href } = canonicalLink;
    if (href.endsWith('/') && href.length > 1) {
      href = href.slice(0, -1);
      canonicalLink.href = href;
    }
  }
}

/**
 * get all entries from the index
 * create alternate language links for each entry
 */
async function buildAlternateHeaders() {
  const link = ({ hreflang, href }) => {
    let cleanHref;
    if (href) {
      cleanHref = href.endsWith('/') ? href.slice(0, -1) : href;
    }
    return html`<link rel="alternate" hreflang="${hreflang}" href="${cleanHref}" />`;
  };

  const { path: currentPath } = getLocaleAgnosticPath(window.location.pathname);
  const entries = await fetchIndex();
  const links = Object.keys(entries).reduce((accumulator, key) => {
    const { path: pageAgnosticPath } = getLocaleAgnosticPath(key);
    if (currentPath === pageAgnosticPath) {
      const altPathArray = key.split('/');
      const hreflang = altPathArray[1];
      let origin = window.location.origin.replace(/\.cn$/, '');
      const alternatePath = key;
      if (altPathArray[1] === 'en') {
        accumulator.push(link({ hreflang: 'x-default', href: `${origin}${alternatePath}` }));
      }
      if (hreflang === 'zh-cn') {
        origin += '.cn';
      }
      accumulator.push(link({ hreflang, href: `${origin}${alternatePath}` }));
    }
    return accumulator;
  }, []);

  if (links.length > 0) {
    const head = document.querySelector('head');
    head.append(...links);
  }
}

async function decorateLinks(main) {
  const referrerUrl = document.referrer && new URL(document.referrer);
  if (
    !referrerUrl ||
    (referrerUrl.origin === window.location.origin &&
      getLocaleAgnosticPath(referrerUrl.pathname) !== getLocaleAgnosticPath(window.location.pathname))
  ) {
    const locationFallback = await getLinkFallback(window.location.href);
    if (locationFallback.rewrite) {
      const fallbackUrl = new URL(locationFallback.link, window.location.origin);
      // Only redirect to trusted Agilent domains to prevent open redirect vulnerabilities
      if (isCDN(fallbackUrl.hostname, true) || fallbackUrl.origin === window.location.origin) {
        // hint for EW to not redirect again to this URL
        setCookie(
          'languageRedirectHint',
          JSON.stringify({ from: window.location.pathname, to: fallbackUrl.pathname }),
          0.00069444,
        ); // 1min TTL
        window.location.replace(fallbackUrl.href);
        return;
      }
    }
  }

  await Promise.all(
    [...main.querySelectorAll('a[href]')].map(async (a) => {
      const { href } = a;
      if (!href) {
        return;
      }

      const originalUrl = new URL(href, window.location.href);

      if (originalUrl.hash === '#login' || originalUrl.pathname === '/login') {
        a.href = '#login';
        a.customAction = (e) => {
          e.preventDefault();
          login();
        };
        a.addEventListener('click', a.customAction);
        return;
      }
      if (originalUrl.hash === '#logout' || originalUrl.pathname === '/logout') {
        a.href = '#logout';
        a.customAction = (e) => {
          e.preventDefault();
          logout();
        };
        a.addEventListener('click', a.customAction);
        return;
      }
      if (originalUrl.hash === '#registration' || originalUrl.pathname === '/registration') {
        a.href = '#registration';
        a.customAction = (e) => {
          e.preventDefault();
          registration();
        };
        a.addEventListener('click', a.customAction);
        return;
      }

      const linkFallback = await getLinkFallback(a.href);
      if (linkFallback.rewrite) {
        a.href = linkFallback.link;
      }

      const url = new URL(a.href, window.location.href);

      if (!isCDN(url.hostname, true)) {
        a.setAttribute('rel', 'noopener noreferrer');
        a.setAttribute('target', '_blank');
      }
    }),
  );
}

function decorateVideoLinks(main) {
  main.querySelectorAll('[href$=".mp4"]').forEach((videoLinkEl) => {
    let { href } = videoLinkEl;

    const [, capturedUrn] =
      href.match(/(urn:aaid:aem:[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/) || [];
    const updateVideoElement = (videoHref) => {
      const videoEl = html`
        <video preload="metadata" playsinline="" muted loop autoplay data-asset-id="${capturedUrn || ''}">
          <source src="${videoHref}" type="video/mp4" />
        </video>
      `;

      videoLinkEl.replaceWith(videoEl);
    };

    if (capturedUrn) {
      const fileName = href.split('/').pop();
      href = `/media/${capturedUrn}/original/as/${fileName}`;

      prepareGetAssetPath().then((getFullPath) => {
        updateVideoElement(getFullPath(href));
      });
    } else {
      updateVideoElement(href);
    }
  });
}

function loadFonts() {
  if (getLocale().languageCountry === 'zh-CN') {
    document.body.classList.add('page-china');
    loadCSS(`${window.hlx.codeBasePath}/styles/fonts-china.css`);
  }
  if (getLocale().languageCountry === 'ja-JP') {
    document.body.classList.add('page-japan');
    loadCSS(`${window.hlx.codeBasePath}/styles/fonts-japan.css`);
  }
  if (getLocale().languageCountry === 'ko-KR') {
    document.body.classList.add('page-korea');
    loadCSS(`${window.hlx.codeBasePath}/styles/fonts-korea.css`);
  } else {
    loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  }
}

/**
 * Hides Blocks based on some condition
 * @param {Element} main The main Element
 */
function hideBlocks(main) {
  const hideableBlockEls = main.querySelectorAll('.hide');
  hideableBlockEls.forEach((blockEl) => {
    if (blockEl.classList.contains('logged-in')) {
      if (isLoggedIn()) {
        blockEl.style.display = 'none';
      }
    }
  });
}

/**
 * Decorates the main element.
 * @param {Element} main The main element
 */
// eslint-disable-next-line import/prefer-default-export
export function decorateMain(main) {
  decorateLinks(main);
  decorateVideoLinks(main);
  decorateSections(main);
  decorateButtons(main);
  decorateLabel(main);
  decorateBlocks(main);
  buildAutoBlocks(main);
}

/**
 * Decorates all SEO related activites.
 */
function decorateSEO() {
  setHtmlLang();

  const isPDP = getMetadata('template') === 'product-details';
  const hasServerHreflang = !!document.querySelector('link[rel="alternate"][hreflang]');
  if (!isPDP && !hasServerHreflang) {
    buildAlternateHeaders();
  }

  fixCanonicalTrailingSlash();
}

/**
 * Loads everything needed to get to LCP.
 * @param {Element} doc The container element
 */
async function loadEager(doc) {
  decorateSEO();

  await Promise.all([initSSO(), decorateTemplateAndTheme()]);

  const main = doc.querySelector('main');
  if (main) {
    decorateMain(main);
    await loadExternalScript('eager');
    ((theme) => theme && (document.body.classList.remove(theme), document.body.classList.add(`page-${theme}`)))(
      getMetadata('theme'),
    );
    const lcpCandidate =
      main.querySelector('.section:nth-of-type(-n+3) .hero, .section:nth-of-type(-n+3) .search-results') ||
      main.querySelector('.section:nth-of-type(-n+3) .img, .section:nth-of-type(-n+3) .video') ||
      main.querySelector('.section:first-child > div:first-child');

    if (lcpCandidate) {
      const lcpSection = lcpCandidate.closest('.section');
      const prevSiblings = [];
      let current = lcpSection.previousElementSibling;
      while (current) {
        prevSiblings.unshift(current); // unshift to keep original order
        current = current.previousElementSibling;
      }
      await Promise.all([
        ...prevSiblings.map((sibling) => loadSection(sibling)),
        loadSection(lcpSection, waitForLCPMedia),
      ]);
    }
  }

  if (window.sessionStorage.getItem('fonts-loaded') === 'true') {
    loadFonts();
  }

  document.body.classList.add('appear');
}

/**
 * Loads everything that doesn't need to be delayed.
 * @param {Element} doc The container element
 */
async function loadLazy(doc) {
  checkSSO();

  loadHeader(doc.querySelector('header'));

  const main = doc.querySelector('main');
  await loadSections(main);

  const { hash } = window.location;
  const element = hash ? doc.getElementById(hash.substring(1)) : false;
  if (hash && element) element.scrollIntoView();

  loadFooter(doc.querySelector('footer'));
  hideBlocks(main);

  if (window.sessionStorage.getItem('fonts-loaded') !== 'true') {
    loadFonts();
    window.sessionStorage.setItem('fonts-loaded', 'true');
  }
  loadCSS(`${window.hlx.codeBasePath}/styles/lazy-styles.css`);

  loadExternalScript('lazy');
}
/**
 * Loads everything that happens a lot later,
 * without impacting the user experience.
 */
function loadDelayed() {
  // eslint-disable-next-line import/no-cycle
  window.setTimeout(async () => {
    window.addEventListener('user:Login', async () => {
      try {
        const { getCartData } = await import('./services/atg.api.js');
        const cartData = await getCartData();
        if (cartData) {
          window.dispatchEvent(
            new CustomEvent('cart:Update', {
              detail: cartData,
            }),
          );
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('error fetch cart data: ', e);
      }
    });
    window.dispatchEvent(new CustomEvent('load:Delayed'));
    // delay loading Adobe Launch and Google Analytics on search results page.
    if (getMetadata('template') === 'searchresults') {
      const config = await loadEnvConfig();
      const loadTimeDelay = config.adobeLaunchLoadDelaySearchResults
        ? parseInt(config.adobeLaunchLoadDelaySearchResults, 10)
        : 3000;
      window.setTimeout(async () => {
        loadExternalScript('delayed');
      }, loadTimeDelay);
    } else {
      loadExternalScript('delayed');
    }
    refreshUserInfo();
    import('./delayed.js');
  }, 3000);
  // load anything that can be postponed to the latest here
}

async function loadPage() {
  await loadEager(document);
  await loadLazy(document);
  loadDelayed();
}

loadPage();

(async function loadDa() {
  if (!new URL(window.location.href).searchParams.get('dapreview')) return;
  // eslint-disable-next-line import/no-unresolved
  import('https://da.live/scripts/dapreview.js').then(({ default: daPreview }) => daPreview(loadPage));
})();

const restoreScrollPositionOnBack = () => {
  window.addEventListener('pageshow', (event) => {
    const entries = performance.getEntriesByType && performance.getEntriesByType('navigation');
    const type = entries && entries[0] ? entries[0].type : '';
    const isBackOrBFCache = event.persisted || type === 'back_forward';

    if (isBackOrBFCache) {
      const scroll = window.history.state && window.history.state.scroll;
      if (scroll && typeof scroll.y === 'number') {
        sessionStorage.setItem('restoreScrollPosition', JSON.stringify(scroll));

        requestAnimationFrame(() => {
          window.scrollTo(scroll.x || 0, scroll.y || 0);
        });
      }
    }
  });

  window.addEventListener('pagehide', () => {
    const lastScroll = {
      x: window.scrollX,
      y: window.scrollY,
    };
    window.history.replaceState({ ...window.history.state, scroll: lastScroll }, '');
  });

  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
};

restoreScrollPositionOnBack();
