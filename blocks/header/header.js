import { loadFragment } from '../fragment/fragment.js';
import { encodeHtml } from '../../scripts/scripts.js';
import fetchFragmentHtml from '../../scripts/config/fragment-loader.js';
import { HEADER_MARKUP, NAV_ITEM_MARKUP, MEGAMENU_MARKUP, SUBNAV_MARKUP, SUBNAV_ITEM_MARKUP } from './header.model.js';

/** Counter used to generate unique megamenu panel IDs within a single decorate call. */
let megamenuCounter = 0;

/**
 * Returns the trimmed text content of an element, or '' if the element is falsy.
 * @param {Element|null} el The element to read
 * @returns {string} Trimmed text content
 */
function getText(el) {
  return el ? el.textContent.trim() : '';
}

/**
 * Returns the outerHTML of the first icon element found in a cell — checking
 * for a Line Icons `<i>` element first, then an AEM `<span class="icon">`,
 * and falling back to the full innerHTML if neither is present.
 * @param {Element|null} el The cell element to inspect
 * @returns {string} Icon HTML string
 */
function getIconHtml(el) {
  if (!el) return '';
  const i = el.querySelector('i[class]');
  if (i) return i.outerHTML;
  const span = el.querySelector('span.icon');
  return span ? span.outerHTML : el.innerHTML.trim();
}

/**
 * Renders SUBNAV_MARKUP instances from an array of <ul> elements.
 * @param {Element[]} lists Array of <ul> elements from the megamenu content cell
 * @returns {string} Rendered subnav HTML string
 */
function renderSubnavs(lists) {
  return lists
    .map((ul) => {
      const items = [...ul.children]
        .map((li) => {
          const link = li.querySelector('a');
          return SUBNAV_ITEM_MARKUP.replace('{link}', link ? link.outerHTML : li.innerHTML);
        })
        .join('');
      return SUBNAV_MARKUP.replace('{items}', items);
    })
    .join('');
}

/**
 * Renders desktop NAV_ITEM_MARKUP entries from the navigation block.
 * Rows with content in cell 2 or cell 3 get a MEGAMENU_MARKUP panel;
 * rows with only cell 1 render as plain links.
 * @param {Element|null} navBlock The navigation block element
 * @returns {string} Rendered desktop nav items HTML string
 */
function renderNavItems(navBlock) {
  if (!navBlock) return '';
  return [...navBlock.children]
    .map((row) => {
      const [cell1, cell2, cell3] = row.children;

      const heading = cell1 ? cell1.querySelector('h2, h3') : null;
      const mainLinkText = getText(heading || cell1);

      // Prefer the landing anchor in cell 3 (megamenu items); fall back to cell 1 (plain links)
      const cell1Link = cell1 ? cell1.querySelector('a') : null;
      const landingAnchor = cell3 ? cell3.querySelector('a') : null;
      const mainLinkHref = (landingAnchor || cell1Link)?.getAttribute('href') || '#';

      const hasMegamenu = (cell2 && cell2.innerHTML.trim()) || (cell3 && cell3.innerHTML.trim());
      let megamenu = '';
      let megamenuAttrs = '';
      let dropIcon = '';

      if (hasMegamenu) {
        megamenuCounter += 1;
        const megamenuId = `siteheader-megamenu-${megamenuCounter}`;

        // Image: prefer authored <img> from cell 2
        const imageEl = cell2 ? cell2.querySelector('img') : null;
        const image = imageEl ? imageEl.outerHTML : '';

        // Landing content: heading + any description paragraphs from cell 3
        const landingEl = cell3 ? cell3.querySelector('h2, h3') : null;
        const landingLink = landingEl ? landingEl.outerHTML : '';
        const descHtml = cell3 ? [...cell3.querySelectorAll('p')].map((p) => p.outerHTML).join('') : '';
        const landingContent = landingLink + descHtml;

        // Subnavs: direct <ul> children of cell 3
        const subnavs = renderSubnavs(cell3 ? [...cell3.querySelectorAll(':scope > ul')] : []);

        megamenu = MEGAMENU_MARKUP.replaceAll('{megamenuId}', megamenuId)
          .replaceAll('{megamenuLabel}', encodeHtml(mainLinkText))
          .replaceAll('{image}', image)
          .replaceAll('{landingContent}', landingContent)
          .replaceAll('{subnavs}', subnavs);

        megamenuAttrs = `aria-haspopup="true" aria-expanded="false" aria-controls="${megamenuId}"`;

        // Drop indicator: use the <i class="lni ..."> authored in the cell-1 heading when present
        const iEl = heading ? heading.querySelector('i') : null;
        const iHtml = iEl ? iEl.outerHTML : '';
        dropIcon = `<span class="siteheader-nav-arrow" aria-hidden="true">${iHtml}</span>`;
      }

      return NAV_ITEM_MARKUP.replaceAll('{mainLinkHref}', encodeHtml(mainLinkHref))
        .replaceAll('{mainLinkText}', mainLinkText)
        .replaceAll('{megamenuAttrs}', megamenuAttrs)
        .replaceAll('{dropIcon}', dropIcon)
        .replaceAll('{megamenu}', megamenu);
    })
    .join('');
}

/**
 * Renders mobile accordion nav items for the offcanvas panel.
 * Items with megamenu content render as accordion toggles;
 * plain links render as direct anchors.
 * @param {Element|null} navBlock The navigation block element
 * @returns {string} Rendered mobile nav items HTML string
 */
function renderMobileNavItems(navBlock) {
  if (!navBlock) return '';
  let counter = 0;

  return [...navBlock.children]
    .map((row) => {
      const [cell1, cell2, cell3] = row.children;

      const heading = cell1 ? cell1.querySelector('h2, h3') : null;
      const mainLinkText = getText(heading || cell1);
      const cell1Link = cell1 ? cell1.querySelector('a') : null;
      const landingAnchor = cell3 ? cell3.querySelector('a') : null;
      const mainLinkHref = (landingAnchor || cell1Link)?.getAttribute('href') || '#';

      const hasMegamenu = (cell2 && cell2.innerHTML.trim()) || (cell3 && cell3.innerHTML.trim());

      if (!hasMegamenu) {
        return `<li class="siteheader-mobile-item">
        <a href="${encodeHtml(mainLinkHref)}" class="siteheader-mobile-link d-block fw-medium">
          ${mainLinkText}
        </a>
      </li>`;
      }

      counter += 1;
      const submenuId = `siteheader-mobile-submenu-${counter}`;

      const subnavLists = cell3 ? [...cell3.querySelectorAll(':scope > ul')] : [];
      const subnavLinks = subnavLists
        .flatMap((ul) =>
          [...ul.children].map((li) => {
            const link = li.querySelector('a');
            return link ? `<li class="siteheader-mobile-sublink">${link.outerHTML}</li>` : '';
          }),
        )
        .join('');

      // Mobile drop indicator: reuse the <i class="lni ..."> from the cell-1 heading
      const iElMobile = heading ? heading.querySelector('i') : null;
      const iHtmlMobile = iElMobile ? iElMobile.outerHTML : '';

      return `<li class="siteheader-mobile-item">
      <button
        class="siteheader-mobile-toggle w-100 d-flex justify-content-between align-items-center fw-medium"
        type="button"
        aria-expanded="false"
        aria-controls="${submenuId}"
      >
        <span>${mainLinkText}</span>
        <span class="siteheader-mobile-arrow" aria-hidden="true">${iHtmlMobile}</span>
      </button>
      <div class="siteheader-mobile-submenu" id="${submenuId}" hidden>
        <ul class="list-unstyled m-0 p-0">
          <li class="siteheader-mobile-landing">
            <a href="${encodeHtml(mainLinkHref)}" class="fw-semibold d-block">${mainLinkText}</a>
          </li>
          ${subnavLinks}
        </ul>
      </div>
    </li>`;
    })
    .join('');
}

/**
 * Initialises desktop megamenu keyboard and click interactions.
 * Opens/closes on click-toggle; closes on focusout from the nav item or on Escape.
 * @param {Element} nav The desktop #siteheader-nav element
 * @param {Function} onOpen Callback fired with the trigger element when a megamenu opens
 * @param {Function} onClose Callback fired when a megamenu closes
 */
function initMegamenuInteractions(nav, onOpen, onClose) {
  nav.querySelectorAll('.siteheader-nav-item').forEach((item) => {
    const trigger = item.querySelector('.siteheader-navlink[aria-haspopup]');
    if (!trigger) return;

    const isOpen = () => trigger.getAttribute('aria-expanded') === 'true';

    const open = () => {
      trigger.setAttribute('aria-expanded', 'true');
      if (onOpen) onOpen(trigger);
    };

    const close = () => {
      trigger.setAttribute('aria-expanded', 'false');
      if (onClose) onClose();
    };

    // Toggle megamenu on click
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      if (isOpen()) {
        close();
      } else {
        // Close any other open megamenus first
        nav.querySelectorAll('.siteheader-navlink[aria-expanded="true"]').forEach((other) => {
          if (other !== trigger) other.setAttribute('aria-expanded', 'false');
        });
        open();
      }
    });

    // Close when focus leaves the entire nav item (trigger + megamenu)
    item.addEventListener('focusout', (e) => {
      if (!item.contains(e.relatedTarget)) close();
    });

    // Close on Escape and return focus to trigger
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        close();
        trigger.focus();
      }
    });
  });
}

/**
 * Initialises mobile accordion expand/collapse for nav items with submenus.
 * @param {Element} mobileNav The #siteheader-mobilenav element
 */
function initMobileAccordion(mobileNav) {
  mobileNav.querySelectorAll('.siteheader-mobile-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const opening = btn.getAttribute('aria-expanded') !== 'true';
      const submenu = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(opening));
      if (submenu) submenu.hidden = !opening;
    });
  });
}

/**
 * Loads and decorates the header block.
 * Fetches the nav fragment, extracts content from the logo, navigation,
 * search, and hamburger sub-blocks, then interpolates everything into the
 * HEADER_MARKUP template from markup.js and wires interaction handlers.
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  megamenuCounter = 0;

  // ── Load nav fragment ─────────────────────────────────────────────────────
  const fragmentHtml = await fetchFragmentHtml(loadFragment, 'nav', '/nav');

  // TODO: DO NOT DELETE THE FOLLOWING LINE — used for testing and debugging the header independently of the nav fragment
  // TODO: IF REQUIRED, JUST COMMENT THE FOLLOWING LINE OUT, BUT DO NOT DELETE IT
  // console.log('Loaded nav fragment outerHTML:', fragmentHtml);

  if (!fragmentHtml) return;
  const fragment = document.createElement('div');
  fragment.innerHTML = fragmentHtml;

  // ── Extract logo ──────────────────────────────────────────────────────────
  const logoBlock = fragment.querySelector('[data-block-name="logo"]');
  const logoRow = logoBlock ? logoBlock.querySelector(':scope > div') : null;
  const logoCells = logoRow ? [...logoRow.children] : [];
  const logoLight = logoCells[0] ? logoCells[0].textContent.trim() : '';
  // Fall back to light URL when no dark URL is authored
  const logoDark = (logoCells[1] ? logoCells[1].textContent.trim() : '') || logoLight;

  // ── Extract navigation ────────────────────────────────────────────────────
  const navBlock = fragment.querySelector('[data-block-name="navigation"]');
  const navItems = renderNavItems(navBlock);
  const mobileNavItems = renderMobileNavItems(navBlock);

  // ── Extract navbuttons (row 1 = hamburger toggle, row 2 = search toggle) ──
  const navbuttonsBlock = fragment.querySelector('[data-block-name="navbuttons"]');
  const navbuttonsRows = navbuttonsBlock ? [...navbuttonsBlock.querySelectorAll(':scope > div')] : [];
  const hamburgerCells = navbuttonsRows[0] ? [...navbuttonsRows[0].children] : [];
  const hamburgerIcon = getIconHtml(hamburgerCells[0]);
  const hamburgerOpenLabel = getText(hamburgerCells[1]) || 'Open navigation';
  const hamburgerCloseIcon = getIconHtml(hamburgerCells[2]) || hamburgerIcon;
  const hamburgerCloseLabel = getText(hamburgerCells[3]) || hamburgerOpenLabel;

  const searchBtnCells = navbuttonsRows[1] ? [...navbuttonsRows[1].children] : [];
  const searchIcon = getIconHtml(searchBtnCells[0]);
  const searchOpenLabel = getText(searchBtnCells[1]) || 'Search';
  const searchCloseIcon = getIconHtml(searchBtnCells[2]) || searchIcon;
  const searchCloseLabel = getText(searchBtnCells[3]) || searchOpenLabel;

  // ── Extract navsearch (label | placeholder | submit) ─────────────────────
  const navsearchBlock = fragment.querySelector('[data-block-name="navsearch"]');
  const navsearchRow = navsearchBlock ? navsearchBlock.querySelector(':scope > div') : null;
  const navsearchCells = navsearchRow ? [...navsearchRow.children] : [];
  const searchPlaceholder = getText(navsearchCells[1]) || 'Search…';
  const searchSubmitText = getText(navsearchCells[2]) || 'Search';

  // ── Render markup ─────────────────────────────────────────────────────────
  block.innerHTML = HEADER_MARKUP.replaceAll('{logoLight}', encodeHtml(logoLight))
    .replaceAll('{logoDark}', encodeHtml(logoDark))
    .replaceAll('{navItems}', navItems)
    .replaceAll('{mobileNavItems}', mobileNavItems)
    .replaceAll('{searchIcon}', searchIcon)
    .replaceAll('{searchCloseIcon}', searchCloseIcon)
    .replaceAll('{searchOpenLabel}', encodeHtml(searchOpenLabel))
    .replaceAll('{searchCloseLabel}', encodeHtml(searchCloseLabel))
    .replaceAll('{searchPlaceholder}', encodeHtml(searchPlaceholder))
    .replaceAll('{searchSubmitText}', searchSubmitText)
    .replaceAll('{hamburgerIcon}', hamburgerIcon)
    .replaceAll('{hamburgerCloseIcon}', hamburgerCloseIcon)
    .replaceAll('{hamburgerOpenLabel}', encodeHtml(hamburgerOpenLabel))
    .replaceAll('{hamburgerCloseLabel}', encodeHtml(hamburgerCloseLabel));

  // ── Wire interactions ─────────────────────────────────────────────────────
  const hamburgerBtn = block.querySelector('.siteheader-hamburger');
  const mobileNav = block.querySelector('#siteheader-mobilenav');
  const searchToggle = block.querySelector('.siteheader-search-toggle');
  const searchPanel = block.querySelector('#siteheader-search');
  const searchInput = block.querySelector('#siteheader-q');
  const desktopNav = block.querySelector('#siteheader-nav');
  const backdrop = block.querySelector('.siteheader-backdrop');

  /**
   * Shows the backdrop overlay.
   */
  function showBackdrop() {
    if (backdrop) backdrop.classList.add('is-active');
  }

  /**
   * Hides the backdrop overlay.
   */
  function hideBackdrop() {
    if (backdrop) backdrop.classList.remove('is-active');
  }

  /**
   * Closes all open panels (search, mobile nav, megamenus) and hides the backdrop.
   */
  function closeAll() {
    if (searchPanel && !searchPanel.hidden) {
      searchPanel.classList.remove('is-open');
      searchToggle.setAttribute('aria-expanded', 'false');
      // Re-apply hidden after transition so the element is inaccessible while off-screen
      searchPanel.addEventListener(
        'transitionend',
        () => {
          searchPanel.hidden = true;
          searchPanel.setAttribute('aria-hidden', 'true');
        },
        { once: true },
      );
    }
    if (mobileNav && !mobileNav.hidden) {
      mobileNav.classList.remove('is-open');
      hamburgerBtn.setAttribute('aria-expanded', 'false');
      mobileNav.addEventListener(
        'transitionend',
        () => {
          mobileNav.hidden = true;
          mobileNav.setAttribute('aria-hidden', 'true');
        },
        { once: true },
      );
    }
    if (desktopNav) {
      desktopNav.querySelectorAll('.siteheader-navlink[aria-expanded="true"]').forEach((link) => {
        link.setAttribute('aria-expanded', 'false');
      });
    }
    hideBackdrop();
  }

  /**
   * Opens the search panel with a CSS transition.
   */
  function openSearch() {
    // Remove hidden first so the element is in the DOM, then rAF to trigger transition
    searchPanel.hidden = false;
    searchPanel.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      searchPanel.classList.add('is-open');
    });
    searchToggle.setAttribute('aria-expanded', 'true');
    searchToggle.setAttribute('aria-label', searchCloseLabel);
    showBackdrop();
    if (searchInput) searchInput.focus();
  }

  /**
   * Closes the search panel with a CSS transition.
   */
  function closeSearch() {
    searchPanel.classList.remove('is-open');
    searchToggle.setAttribute('aria-expanded', 'false');
    searchToggle.setAttribute('aria-label', searchOpenLabel);
    searchPanel.addEventListener(
      'transitionend',
      () => {
        searchPanel.hidden = true;
        searchPanel.setAttribute('aria-hidden', 'true');
      },
      { once: true },
    );
    hideBackdrop();
  }

  /**
   * Opens the mobile offcanvas nav with a CSS transition.
   */
  function openMobileNav() {
    mobileNav.hidden = false;
    mobileNav.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      mobileNav.classList.add('is-open');
    });
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    hamburgerBtn.setAttribute('aria-label', hamburgerCloseLabel);
    showBackdrop();
    const firstFocusable = mobileNav.querySelector('a, button');
    if (firstFocusable) firstFocusable.focus();
  }

  /**
   * Closes the mobile offcanvas nav with a CSS transition.
   */
  function closeMobileNav() {
    mobileNav.classList.remove('is-open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    hamburgerBtn.setAttribute('aria-label', hamburgerOpenLabel);
    mobileNav.addEventListener(
      'transitionend',
      () => {
        mobileNav.hidden = true;
        mobileNav.setAttribute('aria-hidden', 'true');
      },
      { once: true },
    );
    hideBackdrop();
  }

  // Hamburger: toggle mobile offcanvas nav
  if (hamburgerBtn && mobileNav) {
    hamburgerBtn.addEventListener('click', () => {
      if (hamburgerBtn.getAttribute('aria-expanded') === 'true') {
        closeMobileNav();
      } else {
        openMobileNav();
      }
    });

    // Close mobile nav on Escape; return focus to hamburger
    mobileNav.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeMobileNav();
        hamburgerBtn.focus();
      }
    });
  }

  // Search toggle: show / hide search panel
  if (searchToggle && searchPanel) {
    searchToggle.addEventListener('click', () => {
      if (searchToggle.getAttribute('aria-expanded') === 'true') {
        closeSearch();
      } else {
        openSearch();
      }
    });

    // Close search panel on Escape; return focus to toggle
    searchPanel.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeSearch();
        searchToggle.focus();
      }
    });
  }

  // Desktop megamenu: click-toggle with backdrop
  if (desktopNav) {
    initMegamenuInteractions(
      desktopNav,
      () => showBackdrop(),
      () => {
        // Only hide backdrop if no other megamenu is open
        const anyOpen = desktopNav.querySelector('.siteheader-navlink[aria-expanded="true"]');
        if (!anyOpen) hideBackdrop();
      },
    );
  }

  // Mobile accordion
  if (mobileNav) initMobileAccordion(mobileNav);

  // Backdrop click: close everything
  if (backdrop) {
    backdrop.addEventListener('click', closeAll);
  }

  // Click outside header: close any open desktop megamenu and backdrop
  document.addEventListener(
    'click',
    (e) => {
      if (!block.contains(e.target)) {
        const anyMegaOpen = desktopNav && desktopNav.querySelector('.siteheader-navlink[aria-expanded="true"]');
        if (anyMegaOpen) {
          desktopNav.querySelectorAll('.siteheader-navlink[aria-expanded="true"]').forEach((link) => {
            link.setAttribute('aria-expanded', 'false');
          });
          hideBackdrop();
        }
      }
    },
    true,
  );
}
