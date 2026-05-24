# Header

Renders the site-wide navigation bar including the logo, megamenu, search form, and mobile hamburger toggle. Navigation content is loaded automatically from the `/nav` page (or the URL specified in the `nav` metadata tag on the page).

The header block itself has no authored fields. All content is maintained on the `/nav` page as a collection of discrete blocks described below.

---

## Nav Fragment Content Model

The `/nav` page must contain the following blocks, in order, all within a single section.

---

### Logo block

Supplies the light-mode and dark-mode logo image URLs.

| Logo                                                                          |                                                                              |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Light logo URL _(required)_                                                   | Dark logo URL _(required)_                                                   |
| Path or URL to the SVG/PNG logo image rendered when the site is in light mode | Path or URL to the SVG/PNG logo image rendered when the site is in dark mode |

---

### Navigation block

Defines the megamenu items. Each authored row produces one top-level navigation item. A row with content in cells 2 and 3 renders a full megamenu panel; a row with only cell 1 renders a plain link.

| Navigation                                                                                                                                     |                                                                                                 |                                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Main nav link _(required)_                                                                                                                     | Megamenu image _(optional)_                                                                     | Megamenu content _(optional)_                                                                                          |
| Heading element (`h2`/`h3`) with the label text and an optional `<i class="lni lni-icon-chevron-down" aria-hidden="true">` drop indicator icon | `<img>` or `<picture>` element used as a related representation image inside the megamenu panel | Landing link (bold heading anchor) followed by optional description `<p>` and up to 2 `<ul>` sub-navigation link lists |

#### Megamenu content cell (cell 3) structure

- **Landing link** — a heading (`h2`/`h3`) containing a bold anchor; this is the primary link for the section.
- **Description** _(optional)_ — one or more `<p>` elements appearing after the heading.
- **Subnav 1** _(optional)_ — a `<ul>` whose `<li>` elements each contain an anchor.
- **Subnav 2** _(optional)_ — a second `<ul>` in the same cell; maximum of 2 sub-navigation groups per item.

#### Drop indicator icon

For items that open a megamenu, authors include a Line Icons `<i>` element inside the cell-1 heading. The block extracts this element and places it inside the rendered `.siteheader-nav-arrow` / `.siteheader-mobile-arrow` wrapper so the CSS rotation transition still applies on open/close.

```html
<h2><strong>About Us</strong><i class="lni lni-icon-chevron-down" aria-hidden="true"></i></h2>
```

Plain-link rows (no megamenu): omit cells 2 and 3 entirely, or leave them empty. The href comes from the heading anchor in cell 1 or the landing anchor in cell 3.

---

### Navbuttons block

Supplies icons and accessible labels for the hamburger and search toggle buttons. **Row 1** is the hamburger; **row 2** is the search toggle. Each row has four cells: open icon, open label, close icon, close label. The block swaps the visible icon and `aria-label` automatically when the panel opens or closes.

| Navbuttons (row 1 — hamburger)                                                                                   |                                                            |                                                                                                     |                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Open icon _(required)_                                                                                           | Open label _(required)_                                    | Close icon _(optional)_                                                                             | Close label _(optional)_                                                                            |
| `<i class="lni lni-icon-menu-hamburger-1" aria-hidden="true">` wrapped in a `<p>` — shown when nav is **closed** | `aria-label` text when nav is **closed**, e.g. `Open Menu` | `<i class="lni lni-icon-xmark" aria-hidden="true">` wrapped in a `<p>` — shown when nav is **open** | `aria-label` text when nav is **open**, e.g. `Close Menu`. Falls back to the open label if omitted. |

| Navbuttons (row 2 — search toggle)                                                                          |                                                                 |                                                                                                        |                                                                                                          |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Open icon _(required)_                                                                                      | Open label _(required)_                                         | Close icon _(optional)_                                                                                | Close label _(optional)_                                                                                 |
| `<i class="lni lni-icon-search-1" aria-hidden="true">` wrapped in a `<p>` — shown when search is **closed** | `aria-label` text when search is **closed**, e.g. `Open Search` | `<i class="lni lni-icon-xmark" aria-hidden="true">` wrapped in a `<p>` — shown when search is **open** | `aria-label` text when search is **open**, e.g. `Close Search`. Falls back to the open label if omitted. |

---

### Navsearch block

Supplies text content for the inline search form (no icon — the icon comes from navbuttons row 2, which is also reused as the submit button icon).

| Navsearch                                       |                                                |                                                                                                                   |
| ----------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Search label _(required)_                       | Placeholder text _(required)_                  | Submit button text _(required)_                                                                                   |
| Accessible label for the search `<input>` field | Placeholder text shown inside the search input | `aria-label` text for the icon-only search submit button (the icon is the same search icon from navbuttons row 2) |

---

## Header block (no authored fields)

| Header                 |
| ---------------------- |
| _(no authored fields)_ |

The block fetches the navigation fragment automatically — no fields are authored directly in this block. All navigation content is maintained on the `/nav` page using the blocks documented above.

---

## Rendered markup and CSS

The block renders into a fixed-position bar using global utility classes plus the following block-scoped classes. Add styles to the matching breakpoint partial in `./styles/` — never directly to `header.css`.

### Heights

| Breakpoint           | Height |
| -------------------- | ------ |
| Mobile (base)        | 72 px  |
| Tablet (`≥ 760px`)   | 84 px  |
| Desktop (`≥ 1272px`) | 96 px  |

Heights are driven by the `--nav-height` CSS custom property, which is also used by the global `header { height: var(--nav-height) }` rule in `globals.css` for the layout spacer.

### CSS class reference

| Class                          | Element    | Purpose                                                                                                                                                                |
| ------------------------------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.siteheader-bar`              | `<div>`    | Fixed-position header bar (`position: fixed; top: 0; left: 0; width: 100%`). Contains `.siteheader-inner`.                                                             |
| `.siteheader-inner`            | `<div>`    | Flex row inside the bar; centred at max-width; holds logo, nav, and tools.                                                                                             |
| `.siteheader-logo`             | `<a>`      | Logo anchor wrapping both `<img>` elements                                                                                                                             |
| `.siteheader-logo-light`       | `<img>`    | Logo shown in light mode                                                                                                                                               |
| `.siteheader-logo-dark`        | `<img>`    | Logo shown in dark mode (hidden by default; revealed by `[data-eds-theme='dark']` or `prefers-color-scheme: dark`)                                                     |
| `.siteheader-nav`              | `<nav>`    | Desktop navigation (`d-none d-xl-flex`; visible only at `≥ 1272px`)                                                                                                    |
| `.siteheader-nav-item`         | `<li>`     | One top-level nav item                                                                                                                                                 |
| `.siteheader-navlink`          | `<a>`      | Top-level nav anchor; receives `aria-haspopup`, `aria-expanded`, `aria-controls` when a megamenu is present                                                            |
| `.siteheader-nav-arrow`        | `<span>`   | Icon wrapper for the megamenu drop indicator; contains the `<i class="lni ...">` element extracted from the authored heading. Rotates 180° when `aria-expanded="true"` |
| `.siteheader-tools`            | `<div>`    | Right-side tools container (search toggle + hamburger)                                                                                                                 |
| `.siteheader-search-toggle`    | `<button>` | Toggles the search panel; `aria-expanded` tracks state                                                                                                                 |
| `.siteheader-hamburger`        | `<button>` | Toggles the mobile nav; hidden at `≥ 1272px` via `d-xl-none`; `aria-expanded` tracks state                                                                             |
| `.siteheader-megamenu`         | `<div>`    | Megamenu panel — hidden by default (`visibility: hidden; opacity: 0`) and revealed at `≥ 1272px` on hover or when the trigger has `aria-expanded="true"`               |
| `.siteheader-megamenu-inner`   | `<div>`    | Inner content wrapper; centred at `max-width: 1200px`                                                                                                                  |
| `.siteheader-megamenu-image`   | `<div>`    | Left column of the megamenu panel; contains the representative image                                                                                                   |
| `.siteheader-megamenu-landing` | `<div>`    | Centre column; contains the section's primary landing-page link and optional description                                                                               |
| `.siteheader-megamenu-subnavs` | `<div>`    | Right column; contains up to two `<ul>` sub-navigation link groups                                                                                                     |
| `.siteheader-search`           | `<div>`    | Search panel (`position: fixed; top: var(--nav-height)`); hidden by default via `hidden` attribute                                                                     |
| `.siteheader-search-inner`     | `<form>`   | Centred search form inside the panel                                                                                                                                   |
| `.siteheader-search-input`     | `<input>`  | Search text input                                                                                                                                                      |
| `.siteheader-mobilenav`        | `<nav>`    | Mobile offcanvas nav panel (`position: fixed; top: var(--nav-height); d-xl-none`); hidden by default                                                                   |
| `.siteheader-mobile-item`      | `<li>`     | One mobile nav item                                                                                                                                                    |
| `.siteheader-mobile-link`      | `<a>`      | Plain link for nav items with no megamenu                                                                                                                              |
| `.siteheader-mobile-toggle`    | `<button>` | Accordion trigger for mobile nav items that have a megamenu                                                                                                            |
| `.siteheader-mobile-arrow`     | `<span>`   | Icon wrapper on mobile accordion toggles; contains the same authored `<i class="lni ...">` element. Rotates 180° when the accordion is open                            |
| `.siteheader-mobile-submenu`   | `<div>`    | Collapsible accordion panel; hidden via `hidden` attribute                                                                                                             |
| `.siteheader-mobile-landing`   | `<li>`     | Landing page link row inside a mobile submenu                                                                                                                          |
| `.siteheader-mobile-sublink`   | `<li>`     | Sub-navigation link row inside a mobile submenu                                                                                                                        |

### Breakpoint partials

Styles are split across `./styles/` partials imported by `header.css`. Each partial targets a single breakpoint:

| File          | Breakpoint              | Contains                                                                                                                                                                                                                                                            |
| ------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default.css` | all (mobile-first base) | `--nav-height: 72px`, logo light/dark swap, bar background, nav-link colours and focus rings, icon wrapper sizing (`.siteheader-nav-arrow`, `.siteheader-mobile-arrow`), megamenu hidden state and content styles, search panel styles, mobile nav offcanvas styles |
| `sm.css`      | `≥ 632px`               | _(reserved — add overrides here)_                                                                                                                                                                                                                                   |
| `md.css`      | `≥ 760px`               | `--nav-height: 84px`                                                                                                                                                                                                                                                |
| `lg.css`      | `≥ 992px`               | _(reserved — add overrides here)_                                                                                                                                                                                                                                   |
| `xl.css`      | `≥ 1272px`              | `--nav-height: 96px`, megamenu show on hover / `aria-expanded="true"`, active nav-link highlight                                                                                                                                                                    |
| `xxl.css`     | `≥ 1432px`              | _(reserved — add overrides here)_                                                                                                                                                                                                                                   |

### Megamenu open/close (desktop, `≥ 1272px`)

The megamenu uses CSS `visibility` + `opacity` transitions so the fade animation plays on both open and close. Activated by **click only** (hover is intentionally disabled for keyboard accessibility):

1. **Click** — JS toggles `aria-expanded` on `.siteheader-navlink`; `li:has(.siteheader-navlink[aria-expanded='true']) .siteheader-megamenu` reveals the panel. Clicking the same trigger again closes it.
2. **Escape** — closes the open megamenu and returns focus to the trigger.
3. **Outside click / backdrop click** — closes any open megamenu.
4. **Focus leaves nav item** (`focusout`) — closes the megamenu when keyboard focus moves away from the entire nav item.

A `.siteheader-backdrop` overlay becomes visible whenever a megamenu, the search panel, or the mobile nav is open.

The hover CSS rule (`li:hover .siteheader-megamenu`) is **not present** — open/close is driven entirely by `aria-expanded` state set by JS.

Rules live in `styles/xl.css` and only take effect at `width ≥ 1272px`.

### Mobile nav (below `1272px`)

The hamburger button (`aria-controls="siteheader-mobilenav"`) toggles the `.siteheader-mobilenav` panel by removing/setting the `hidden` attribute and updating `aria-expanded` / `aria-hidden`. Nav items with a megamenu render as accordion toggles (`.siteheader-mobile-toggle`) that expand/collapse `.siteheader-mobile-submenu` panels. Pressing `Escape` inside the mobile nav closes it and returns focus to the hamburger button.

### Search panel

The search toggle button (`aria-controls="siteheader-search"`) opens/closes `#siteheader-search` with a CSS slide+fade transition (`.is-open` class) and updates `aria-expanded` / `aria-hidden`. The `hidden` attribute is set after the close transition ends so the element is inaccessible while off-screen. Pressing `Escape` inside the search panel closes it and returns focus to the toggle button. The backdrop becomes visible while the search panel is open.

The submit button renders the same search icon as the search toggle (from navbuttons row 2) with the submit button text as its `aria-label`.

---

## Testing

| File             | Purpose                                                                                                                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `header.spec.js` | Playwright e2e tests — siteheader-bar, desktop nav, hamburger button, logo, search toggle, mobile nav toggle interaction |

Draft page: `tests/header-test.html` (uses `<meta name="nav" content="/tests/fragments/nav">` to load `tests/fragments/nav.plain.html` instead of the live CMS nav).
