// The header block builds its DOM from a nav fragment.
// CONTENT_MODEL_SPEC describes the authored fields the nav fragment must supply.
// The MARKUP constants below define the final rendered structure.

/**
 * Describes every authored field the nav fragment is expected to supply to the header block.
 * Each top-level key maps to a block (or logical group) on the /nav page.
 *
 * Shape:
 *   type        – JS type of the authored value ('url' | 'icon' | 'string' | 'picture' | 'link' | 'array' | 'object')
 *   required    – whether the block cannot render without this field
 *   description – where the value comes from and how it is used
 *   itemShape   – (array only) shape descriptor for each element
 *   shape       – (object only) shape descriptor for nested properties
 */
export const CONTENT_MODEL_SPEC = {
  /** logo block – row 1, cell 1 */
  logoLight: {
    type: 'url',
    required: true,
    description: 'URL for the logo image displayed in light mode (logo block, row 1, cell 1).',
  },

  /** logo block – row 1, cell 2 */
  logoDark: {
    type: 'url',
    required: true,
    description: 'URL for the logo image displayed in dark mode (logo block, row 1, cell 2).',
  },

  /**
   * navigation block – one authored row per nav item.
   * Each row has three cells: main link | megamenu image | megamenu content.
   * Rows with empty cells 2 and 3 render as plain links.
   */
  navItems: {
    type: 'array',
    required: true,
    description: 'Navigation items. One navigation-block row per item.',
    itemShape: {
      /** Cell 1 – heading element containing the top-level nav anchor. */
      mainLink: {
        type: 'link',
        required: true,
        description: 'Top-level nav link. Authored as a heading (h2/h3) wrapping an anchor in cell 1.',
      },

      /** Cells 2 + 3 together form an optional megamenu panel. */
      megamenu: {
        type: 'object',
        required: false,
        description: 'Megamenu subnav panel shown on hover/focus. Omit cells 2 and 3 to render a plain link.',
        shape: {
          /** Cell 2 – representative image for the panel. */
          image: {
            type: 'picture',
            required: false,
            description: 'Related representation image shown inside the megamenu panel (cell 2).',
          },

          /** Cell 3, first heading anchor – primary landing-page link. */
          landingLink: {
            type: 'link',
            required: true,
            description: 'Primary landing-page link for the section; bold heading anchor at the top of cell 3.',
          },

          /**
           * Cell 3, ul elements – up to two sub-navigation link lists.
           */
          subnavs: {
            type: 'array',
            required: false,
            maxItems: 2,
            description: 'Up to 2 sub-navigation link groups (ul > li > a) within cell 3.',
            itemShape: {
              type: 'link',
              description: 'Individual sub-navigation anchor inside a list item.',
            },
          },
        },
      },
    },
  },

  /**
   * navbuttons block – row 2 (search toggle): four cells:
   *   open-icon | open-label | close-icon | close-label
   */
  search: {
    type: 'object',
    required: false,
    description: 'Search toggle configuration — navbuttons block, row 2.',
    shape: {
      /** Cell 1 – icon shown when search is closed (open state). */
      icon: {
        type: 'icon',
        required: true,
        description: 'Icon displayed on the search toggle when the panel is closed (navbuttons row 2, cell 1).',
      },

      /** Cell 2 – aria-label used when search panel is closed. */
      openLabel: {
        type: 'string',
        required: true,
        description: 'aria-label for the search toggle when the panel is closed, e.g. "Open Search" (cell 2).',
      },

      /** Cell 3 – icon shown when search is open (close state). */
      closeIcon: {
        type: 'icon',
        required: false,
        description:
          'Icon displayed on the search toggle when the panel is open, e.g. an X mark (cell 3). Falls back to the open icon.',
      },

      /** Cell 4 – aria-label used when search panel is open. */
      closeLabel: {
        type: 'string',
        required: false,
        description:
          'aria-label for the search toggle when the panel is open, e.g. "Close Search" (cell 4). Falls back to openLabel.',
      },
    },
  },

  /**
   * navbuttons block – row 1 (hamburger toggle): four cells:
   *   open-icon | open-label | close-icon | close-label
   */
  hamburger: {
    type: 'object',
    required: true,
    description: 'Hamburger menu button configuration — navbuttons block, row 1.',
    shape: {
      /** Cell 1 – icon shown when mobile nav is closed (open state). */
      icon: {
        type: 'icon',
        required: true,
        description: 'Icon displayed on the hamburger button when the nav is closed (navbuttons row 1, cell 1).',
      },

      /** Cell 2 – aria-label used when mobile nav is closed. */
      openLabel: {
        type: 'string',
        required: true,
        description: 'aria-label for the hamburger button when the nav is closed, e.g. "Open Menu" (cell 2).',
      },

      /** Cell 3 – icon shown when mobile nav is open (close state). */
      closeIcon: {
        type: 'icon',
        required: false,
        description:
          'Icon displayed on the hamburger button when the nav is open, e.g. an X mark (cell 3). Falls back to the open icon.',
      },

      /** Cell 4 – aria-label used when mobile nav is open. */
      closeLabel: {
        type: 'string',
        required: false,
        description:
          'aria-label for the hamburger button when the nav is open, e.g. "Close Menu" (cell 4). Falls back to openLabel.',
      },
    },
  },
};

// ─── Markup templates ────────────────────────────────────────────────────────

/**
 * Root header shell rendered into block.innerHTML.
 *
 * Tokens:
 *   {logoLight}          – src for the light-mode logo img
 *   {logoDark}           – src for the dark-mode logo img
 *   {navItems}           – rendered NAV_ITEM_MARKUP instances joined as a string
 *   {mobileNavItems}     – rendered mobile accordion items joined as a string
 *   {searchIcon}         – innerHTML for the search toggle open-state icon
 *   {searchCloseIcon}    – innerHTML for the search toggle close-state icon
 *   {searchOpenLabel}    – aria-label when the search panel is closed
 *   {searchCloseLabel}   – aria-label when the search panel is open
 *   {searchPlaceholder}  – placeholder text for the search input
 *   {searchSubmitText}   – label for the search form submit button
 *   {hamburgerIcon}      – innerHTML for the hamburger open-state icon
 *   {hamburgerCloseIcon} – innerHTML for the hamburger close-state icon
 *   {hamburgerOpenLabel} – aria-label when the mobile nav is closed
 *   {hamburgerCloseLabel}– aria-label when the mobile nav is open
 */
export const HEADER_MARKUP = /* html */ `
<div class="siteheader-bar w-100 position-fixed top-0 start-0 z-4">
  <div class="siteheader-inner d-flex align-items-center justify-content-between">
    <a href="/" class="siteheader-logo flex-shrink-0 d-flex align-items-center"
       aria-label="Go to home">
      <img
        class="siteheader-logo-light"
        src="{logoLight}"
        alt=""
        loading="eager"
        decoding="async"
      />
      <img
        class="siteheader-logo-dark"
        src="{logoDark}"
        alt=""
        loading="eager"
        decoding="async"
      />
    </a>
    <nav class="siteheader-nav d-none d-xl-flex" id="siteheader-nav"
         aria-label="Main navigation">
      <ul class="list-unstyled d-flex m-0 p-0 align-items-center" role="list">
        {navItems}
      </ul>
    </nav>
    <div class="siteheader-tools d-flex align-items-center gap-2 flex-shrink-0">
      <button
        class="siteheader-search-toggle"
        type="button"
        aria-label="{searchOpenLabel}"
        aria-expanded="false"
        aria-controls="siteheader-search"
      >
        <span class="siteheader-icon-open" aria-hidden="true">{searchIcon}</span>
        <span class="siteheader-icon-close" aria-hidden="true">{searchCloseIcon}</span>
      </button>
      <button
        class="siteheader-hamburger d-xl-none"
        type="button"
        aria-label="{hamburgerOpenLabel}"
        aria-expanded="false"
        aria-controls="siteheader-mobilenav"
      >
        <span class="siteheader-icon-open" aria-hidden="true">{hamburgerIcon}</span>
        <span class="siteheader-icon-close" aria-hidden="true">{hamburgerCloseIcon}</span>
      </button>
    </div>
  </div>
</div>
<div class="siteheader-backdrop" aria-hidden="true"></div>
<div class="siteheader-search" id="siteheader-search" hidden aria-hidden="true">
  <form class="siteheader-search-inner" role="search" action="/search">
    <label class="visually-hidden" for="siteheader-q">{searchOpenLabel}</label>
    <input
      id="siteheader-q"
      class="siteheader-search-input flex-grow-1"
      type="search"
      name="q"
      placeholder="{searchPlaceholder}"
      autocomplete="off"
    />
    <button type="submit" class="siteheader-search-submit" aria-label="{searchSubmitText}">{searchIcon}</button>
  </form>
</div>
<nav
  class="siteheader-mobilenav d-xl-none"
  id="siteheader-mobilenav"
  aria-label="Mobile navigation"
  aria-hidden="true"
  hidden
>
  <ul class="list-unstyled m-0 p-0" role="list">
    {mobileNavItems}
  </ul>
</nav>
`;

/**
 * A single desktop top-level nav item with optional megamenu panel.
 *
 * Tokens:
 *   {mainLinkHref}  – href for the top-level anchor
 *   {mainLinkText}  – display text for the top-level anchor
 *   {megamenuAttrs} – aria-haspopup/aria-expanded/aria-controls when megamenu is present,
 *                     otherwise empty string
 *   {dropIcon}      – chevron icon span for megamenu items, otherwise empty string
 *   {megamenu}      – rendered MEGAMENU_MARKUP, or empty string for plain links
 */
export const NAV_ITEM_MARKUP = /* html */ `
<li class="siteheader-nav-item">
  <a
    href="{mainLinkHref}"
    class="siteheader-navlink d-flex align-items-center gap-1 fw-medium"
    {megamenuAttrs}
  ><span>{mainLinkText}</span>{dropIcon}</a>
  {megamenu}
</li>
`;

/**
 * Full-width megamenu panel. The panel spans the full header bar width; content is
 * centred at max-width via .siteheader-megamenu-inner.
 *
 * Tokens:
 *   {megamenuId}     – id attribute value (matched by aria-controls on the trigger)
 *   {megamenuLabel}  – aria-label for the panel region (= nav item text)
 *   {image}          – img outerHTML for the panel image, or empty string
 *   {landingContent} – landing heading outerHTML + optional description paragraphs
 *   {subnavs}        – rendered SUBNAV_MARKUP instances joined as a string
 */
export const MEGAMENU_MARKUP = /* html */ `
<div
  class="siteheader-megamenu position-absolute start-0 w-100"
  id="{megamenuId}"
  role="region"
  aria-label="{megamenuLabel}"
>
  <div class="siteheader-megamenu-inner">
    <div class="row g-4">
      <div class="col-3 siteheader-megamenu-image">{image}</div>
      <div class="col-4 siteheader-megamenu-landing">{landingContent}</div>
      <div class="col-5 siteheader-megamenu-subnavs d-flex gap-4">{subnavs}</div>
    </div>
  </div>
</div>
`;

/**
 * One sub-navigation link group inside a megamenu panel.
 *
 * Tokens:
 *   {items} – rendered SUBNAV_ITEM_MARKUP instances joined as a string
 */
export const SUBNAV_MARKUP = /* html */ `
<ul class="list-unstyled m-0 p-0 d-block">
  {items}
</ul>
`;

/**
 * One sub-navigation link item.
 *
 * Tokens:
 *   {link} – outerHTML of the authored anchor element
 */
export const SUBNAV_ITEM_MARKUP = /* html */ `
<li>{link}</li>
`;

export default HEADER_MARKUP;
