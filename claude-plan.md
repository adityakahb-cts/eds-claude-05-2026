# Claude Implementation Plan

_Based on: Requirements.md (rev. 2026-05-24)_

---

## Context

A full audit of the codebase shows the CSS foundation is **already complete**. The remaining work is entirely in JavaScript utilities, block model files, and configuration alignment.

### What is already done

| Area                          | Status                                                                                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `styles/fonts.css`            | ✅ Complete — Noto Sans/Serif, Google Sans Code, 300/400/500/700 ± italic                                                                    |
| `styles/styles.css`           | ✅ Complete — `@layer reset,base,layout,blocks,utilities,overrides` + all 10 `@import` + `:root` tokens + fallback fonts                     |
| `styles/config/` (10 files)   | ✅ Complete — normalize, colors, themes, typography, grid, forms, globals, utilities, buttons, overrides — all fully implemented, zero TODOs |
| `styles/lazy-styles.css`      | ✅ Partial — LineIcons vendor import present; print/selection/skip styles still needed                                                       |
| Block CSS pattern             | ✅ Established — each block splits styles into `{name}/styles/default.css` + `sm/md/lg/xl/xxl.css` breakpoint partials                       |
| `blocks/header/header.js`     | ✅ Complete logic (517 lines) — **but imports missing `./markup.js`** (live bug, see Phase 1)                                                |
| `blocks/footer/footer.js`     | ✅ Complete                                                                                                                                  |
| `blocks/fragment/fragment.js` | ✅ Complete                                                                                                                                  |
| `component-models.json`       | ✅ Has entries for fragment, header, footer                                                                                                  |
| `scripts/scripts.js`          | ✅ Complete — three-phase load, `encodeHtml` export, `decorateMain`                                                                          |
| `.test.js` Vitest files       | ✅ Exist for all 3 blocks                                                                                                                    |
| `.spec.js` Playwright files   | ✅ Exist in block folders; need playwright config update to discover them                                                                    |

### What is missing (all remaining work)

| Missing item                                              | Impact                                                                             |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `blocks/header/markup.js` (must become `header.model.js`) | **Live import error** — header block breaks at runtime                             |
| `blocks/footer/footer.model.js`                           | Block incomplete per Requirements.md                                               |
| `blocks/fragment/fragment.model.js`                       | Block incomplete per Requirements.md                                               |
| `scripts/config/html.js`                                  | `innerHTML` prohibition cannot be enforced; `header.model.js` markup depends on it |
| `scripts/config/utils.js`                                 | Missing utility helpers                                                            |
| `scripts/config/data-parser.js`                           | Missing safe JSON parse helpers                                                    |
| `scripts/delayed.js`                                      | Empty — Lenis never initialises                                                    |
| `playwright.config.js` `testMatch` update                 | `blocks/**/*.spec.js` files never run                                              |
| Root `AGENTS.md` update                                   | Out-of-date vs `__extras/AGENTS.md` conventions                                    |

---

## Established Architecture (must be followed)

### CSS cascade structure

`styles/styles.css` is the single CSS entry point. It defines the `@layer` order and eagerly imports **all** 10 config partials. **Do not move config imports to `lazy-styles.css`.**

```
@layer reset, base, layout, blocks, utilities, overrides;

@import url('config/normalize.css')  layer(reset);
@import url('config/colors.css')     layer(base);
@import url('config/themes.css')     layer(base);
@import url('config/typography.css') layer(base);
@import url('config/grid.css')       layer(layout);
@import url('config/forms.css')      layer(base);
@import url('config/globals.css')    layer(base);
@import url('config/utilities.css')  layer(utilities);
@import url('config/buttons.css')    layer(utilities);
@import url('config/overrides.css')  layer(overrides);
```

`styles/lazy-styles.css` is for post-LCP vendor CSS only (currently `@import url('vendor/lineicons-free.css')`).

### Block CSS pattern

Every block splits its styles into breakpoint partials. The block's main CSS file is a thin import hub:

```css
/* {blockname}.css */
@import url('./styles/default.css');
@import url('./styles/sm.css'); /* 632px */
@import url('./styles/md.css'); /* 760px */
@import url('./styles/lg.css'); /* 992px */
@import url('./styles/xl.css'); /* 1272px */
@import url('./styles/xxl.css'); /* 1432px */
```

Each partial contains only the rules for that breakpoint. Base (mobile-first) rules go in `default.css`.

### Block file convention

```
blocks/{name}/
  {name}.js          default export decorate(block)
  {name}.css         @import hub → ./styles/*.css
  {name}.model.js    CONTENT_MODEL + markup template exports
  {name}.test.js     Vitest unit tests
  {name}.spec.js     Playwright e2e tests
  {name}.md          Block documentation + content model table
  styles/
    default.css      Mobile-first base rules
    sm.css           min-width: 39.5em (632px)
    md.css           min-width: 47.5em (760px)
    lg.css           min-width: 62em  (992px)
    xl.css           min-width: 79.5em (1272px)
    xxl.css          min-width: 89.5em (1432px)
```

---

## Phase 1 — Fix live bug: create `blocks/header/header.model.js`

**Priority: highest** — `header.js` line 10 imports 5 named exports from the non-existent `./markup.js`. The header block fails at runtime.

### Step 1a — Create `scripts/config/html.js` first

`header.model.js` markup templates must use the `html` tagged-template function (no `innerHTML`). This utility must exist before the model file is written.

Extract verbatim from `__extras/eds-claude/aem.js` lines 1612–1642:

```js
/**
 * Tagged template literal for safe DOM construction without innerHTML.
 * String values are interpolated directly; HTMLElement, Array, and NodeList
 * values are inserted as real DOM nodes via placeholder markers.
 * @param {TemplateStringsArray} strings Template string parts
 * @param {...(string|number|HTMLElement|Element[]|NodeList)} values Interpolated values
 * @returns {Element|HTMLCollection} The constructed DOM element(s)
 */
export default function html(strings, ...values) {
  const template = document.createElement('template');
  template.innerHTML = strings.reduce((acc, str, i) => {
    if (values[i] instanceof HTMLElement || values[i] instanceof Array || values[i] instanceof NodeList) {
      return `${acc}${str}<template data-html-id="value-${i}"></template>`;
    }
    return acc + str + (values[i] ?? '');
  }, '');
  template.content.querySelectorAll('[data-html-id]').forEach((el) => {
    const idx = el.dataset.htmlId.split('-')[1];
    if (values[idx] instanceof Array || values[idx] instanceof NodeList) {
      el.replaceWith(...values[idx]);
    } else if (values[idx] instanceof HTMLElement) {
      el.replaceWith(values[idx]);
    }
  });
  const { children } = template.content;
  return children.length === 1 ? children[0] : children;
}
```

### Step 1b — Create `blocks/header/header.model.js`

Exports the `CONTENT_MODEL` (matches `component-models.json`) and the 5 markup template constants that `header.js` already expects:

| Export               | Type        | Purpose                                                         |
| -------------------- | ----------- | --------------------------------------------------------------- |
| `CONTENT_MODEL`      | object      | `{ id: 'header', fields: [] }` — auto-block, no authored fields |
| `HEADER_MARKUP`      | `html\`…\`` | Outer `<header>` + `.nav-wrapper` skeleton                      |
| `NAV_ITEM_MARKUP`    | `html\`…\`` | Single nav link `<li>` with optional drop indicator             |
| `MEGAMENU_MARKUP`    | `html\`…\`` | Megamenu panel `<div>` wrapper                                  |
| `SUBNAV_MARKUP`      | `html\`…\`` | Subnav `<ul>` list wrapper                                      |
| `SUBNAV_ITEM_MARKUP` | `html\`…\`` | Single subnav `<li>` link                                       |

All templates use `html` from `scripts/config/html.js`. No string concatenation, no `innerHTML`.

### Step 1c — Update `blocks/header/header.js` import

Change line 4–10 from:

```js
import { HEADER_MARKUP, NAV_ITEM_MARKUP, MEGAMENU_MARKUP, SUBNAV_MARKUP, SUBNAV_ITEM_MARKUP } from './markup.js';
```

to:

```js
import { HEADER_MARKUP, NAV_ITEM_MARKUP, MEGAMENU_MARKUP, SUBNAV_MARKUP, SUBNAV_ITEM_MARKUP } from './header.model.js';
```

No other changes to `header.js`.

---

## Phase 2 — Remaining script utilities

### `scripts/config/utils.js` (create)

Port from `__extras/eds-claude/common/utils.js`. Uses `html` from `./html.js` — no `innerHTML`.

```js
// Exports:
export function formatDate(ms) { … }        // ms → 'dd mmm yyyy'
export function addLoader(targetEl) { … }   // appends spinner, returns it
export function destroyLoader(loaderEl) { … }
export function injectStructuredData(data, container) { … }  // JSON-LD <script>
```

### `scripts/config/data-parser.js` (create)

Port from `__extras/eds-claude/common/data.parser.js`.

```js
// Exports:
export function parseJSONArray(value, fallback = []) { … }
export function parseJSONObject(value, fallback = {}) { … }
```

### `scripts/scripts.js` (minor update)

Add a re-export of `html` so blocks have a stable single import path:

```js
export { default as html } from './config/html.js';
```

### `scripts/delayed.js` (update)

Initialise Lenis smooth scroll in the delayed phase (3 s after page load):

```js
import Lenis from '/scripts/vendor/lenis-1.3.23.js';

const lenis = new Lenis({ lerp: 0.1, duration: 1.2, smoothWheel: true });

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
```

---

## Phase 3 — Block model files for footer and fragment

### `blocks/footer/footer.model.js` (create)

```js
// Exports:
export const CONTENT_MODEL = { id: 'footer', fields: [] };
export const FOOTER_MARKUP = html`<div class="footer-wrapper"></div>`;
```

### `blocks/fragment/fragment.model.js` (create)

```js
// Exports:
export const CONTENT_MODEL = {
  id: 'fragment',
  fields: [{ component: 'text-input', valueType: 'string', name: 'path', label: 'Fragment Path' }],
};
export const FRAGMENT_MARKUP = html`<div class="fragment"></div>`;
```

Both files import `html` from `../../scripts/config/html.js`.

---

## Phase 4 — Configuration and convention alignment

### `playwright.config.js` (update)

Replace `testDir: './tests/e2e'` with `testMatch` so Playwright discovers both block-level and non-block e2e tests:

```js
testMatch: ['**/blocks/**/*.spec.js', '**/tests/e2e/**/*.spec.js'],
```

Remove `testDir`. Verify no duplicate coverage between `blocks/{name}/{name}.spec.js` and any residual `tests/e2e/{name}.spec.js` files — consolidate into block folders and delete e2e duplicates.

### Root `AGENTS.md` (update)

Replace with content from `__extras/AGENTS.md` which documents:

- Updated block directory structure (`{blockname}.model.js`, `{blockname}.spec.js` Playwright, `{blockname}.test.js` Vitest)
- Breakpoints (sm/md/lg/xl/xxl) and breakpoint-partial CSS pattern
- `styles/config/` architecture
- Fragment-loader pattern (`fetchFragmentHtml`)
- Fragment outerHTML capture workflow
- Pre-push cleanup steps

### `styles/lazy-styles.css` (minor update)

Add after the existing LineIcons import:

- `@media print` — hide nav/footer/buttons, force black text
- `::selection` — `background: var(--color-primary-subtle)`
- `.skip-link` focus styles (if not already in `globals.css`)

---

## Phase 5 — da.live sync

Every block change must keep `component-models.json` in sync. Use the **da-live-admin MCP** tools to verify authored content after model updates:

1. `da_list_sources` — identify pages using the changed block
2. `da_get_source` — read an authored page to confirm it renders correctly against the new model
3. `da_lookup_fragment` — verify fragment structure for nav/footer
4. `da_create_source` — create a test page in da.live when no authored example exists

`component-models.json` is the source of truth for da.live field discovery — keep it aligned with every `CONTENT_MODEL` export.

---

## Recommended Tooling

| Tool                         | Purpose                                                        |
| ---------------------------- | -------------------------------------------------------------- |
| **da-live-admin MCP**        | Content model sync, authored page verification                 |
| **context7 MCP**             | Live AEM/EDS docs before writing EDS-specific code             |
| **Playwright MCP**           | Headless browser testing, visual verification                  |
| **`/verify` skill**          | Confirm each phase works in a real browser                     |
| **`/run` skill**             | Start dev server                                               |
| **`/code-review` skill**     | Review diffs before pushing                                    |
| **`/security-review` skill** | Verify no XSS surface (critical given `innerHTML` prohibition) |
| **`/new-block` skill**       | Scaffold all files for new blocks                              |
| **PageSpeed Insights**       | Lighthouse 100 gate before every PR                            |

---

## Execution Order

```
Phase 1a  scripts/config/html.js                ← unblocks everything
Phase 1b  blocks/header/header.model.js         ← fixes live bug
Phase 1c  blocks/header/header.js (import fix)  ← fixes live bug
Phase 2   scripts/config/utils.js
          scripts/config/data-parser.js
          scripts/scripts.js (re-export html)
          scripts/delayed.js (Lenis)
Phase 3   blocks/footer/footer.model.js
          blocks/fragment/fragment.model.js
Phase 4   playwright.config.js
          AGENTS.md
          styles/lazy-styles.css (print/selection)
Phase 5   da.live sync verification (per block)
```

---

## Verification Checklist

1. `npm run lint` → 0 errors
2. `npm run test:unit` → all `.test.js` pass
3. `npm run test:e2e` → all `.spec.js` pass (blocks + `tests/e2e/`)
4. Dev server → no console errors on page load (confirms markup.js import is resolved)
5. Dev server → header renders with megamenu and mobile hamburger working
6. Toggle `document.documentElement.setAttribute('data-eds-theme','dark')` → colours invert
7. Scroll on a long page → Lenis smooth scroll active (no console errors)
8. PageSpeed Insights on `https://{branch}--{repo}--{owner}.aem.page/` → 100/100
9. axe DevTools → 0 critical WCAG AA violations
10. da.live → open an authored page → block renders against updated content model
