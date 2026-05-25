# Claude Implementation Plan

_Based on: Requirements.md + full `__extras/` audit — final source of truth as of 2026-05-24_
_Status: Architect-reviewed. `Requirements.md` and `__extras/` have been deleted; all knowledge is embedded here._

---

## Team Structure

| Role                    | Count | Responsibilities                                                                                                                                                                       |
| ----------------------- | ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend Manager**    | 1     | Architecture decisions, PR approvals to `main`, sprint planning, Phase ownership                                                                                                       |
| **Senior Frontend Dev** | 1     | Feature branch development, code reviews for junior PRs, block architecture, `{name}.model.js` authoring                                                                               |
| **Junior Frontend Dev** | 2     | Block implementation, CSS partials, unit tests (`.test.js`), bug fixes under senior review                                                                                             |
| **QA Manager**          | 1     | Testing strategy, UAT sign-off, axe/PageSpeed gate ownership, environment sign-off, release approval                                                                                   |
| **Senior QA**           | 1     | E2E spec authoring (`.spec.js`), Playwright maintenance, performance regression, accessibility audits, visual regression baseline                                                      |
| **Junior QA**           | 2     | Manual smoke testing per environment gate, da.live content authoring verification, test-case documentation, draft page fixtures in `tests/`, bug report filing with reproduction steps |

### Branch ownership by role

| Branch tier       | Who creates / merges                              |
| ----------------- | ------------------------------------------------- |
| `feat/*`, `fix/*` | Any dev — cut from `develop`                      |
| PR → `develop`    | Senior dev reviews; Frontend Manager approves     |
| PR → `uat`        | QA Manager gates; requires Senior QA sign-off     |
| PR → `main`       | Frontend Manager only; requires CI green + UAT ✅ |

---

## Site Goal & Technology

Build a mobile-first site with a component library modelled on [shadcn/ui](https://ui.shadcn.com/docs/components). Bootstrap-style utilities (borders, grid, flex, display, forms, normalise, buttons, typography) are part of the global CSS foundation. Third-party JS plugins are introduced one at a time, never all at once.

**Performance mandate:** LCP, CLS, INP, and Lighthouse 100 are critical targets, not suggestions. Every PR must pass the `pagespeed` CI gate before merge. Performance regressions block merging.

**Technology stack:**

- Adobe Edge Delivery Services (EDS) — documentation at https://www.aem.live/ (search `site:www.aem.live` to restrict results)
- Vanilla JavaScript (ES6+) — no transpiling, no build steps
- CSS3 with modern features — no Tailwind or CSS frameworks
- Node.js tooling only (ESLint, Prettier, Stylelint, Vitest, Playwright, Husky)

**Planned third-party plugins** (introduced gradually, one at a time, not at project start):
Embla Carousel, Lenis smooth scroll, megamenu, countup.js, popper.js — and others. Each evaluated and added in isolation. All as UMD or ESM-via-CDN (no npm bundling).

**Setup commands:**

```sh
npm install                                              # install dependencies
npx -y @adobe/aem-cli up --no-open --forward-browser-logs  # start dev server at http://localhost:3000 (run in background)
npm run lint                                            # ESLint + Stylelint
npm run lint:fix                                        # auto-fix lint issues
npm run format                                          # Prettier format (already configured)
npm run format:check                                    # Prettier check
npm run test:unit                                       # Vitest unit tests (no server needed)
npm run test:unit:watch                                 # Vitest watch mode (TDD inner loop)
npm run test:e2e                                        # Playwright e2e (starts dev server automatically)
npm run test:e2e:ui                                     # Playwright interactive UI
npm test                                                # all: unit + e2e
npx playwright install                                  # first run only: download browser binaries
```

---

## Current Codebase State

### What is already done

| Area                                       | Status                                                                                                                                                                                                                                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| `styles/fonts.css`                         | ✅ Complete — Noto Serif (headings), Noto Sans (body), `google-sans-code` (mono, `fonts/google-code/`), 300/400/500/700 ± italic                                                                                                                                                                 |
| `styles/styles.css`                        | ✅ Complete — `@layer` order + all 10 `@import` + `:root` design tokens + fallback `@font-face`                                                                                                                                                                                                  |
| `styles/config/` (10 files)                | ✅ Complete — normalize, colors, themes, typography, grid, forms, globals, utilities, buttons, overrides                                                                                                                                                                                         |
| `styles/lazy-styles.css`                   | ⚠️ Partial — LineIcons vendor import present; print/selection/skip styles still needed                                                                                                                                                                                                           |
| `blocks/header/header.js`                  | ✅ Complete — imports from `./header.model.js`; uses `HEADER_MARKUP.replaceAll()`                                                                                                                                                                                                                |
| `blocks/header/header.model.js`            | ⚠️ Exists — has `CONTENT_MODEL_SPEC` + all `*_MARKUP` exports; uses `/* html */` strings; **missing `CONTENT_MODEL` export**                                                                                                                                                                     |
| `blocks/footer/footer.js`                  | ✅ Complete — uses `fetchFragmentHtml`; moves children via DOM append (no innerHTML)                                                                                                                                                                                                             |
| `blocks/footer/footer.model.js`            | ⚠️ Exists — only exports `FOOTER_MARKUP` as `/* html */` string with `{content}` token; **missing `CONTENT_MODEL`**                                                                                                                                                                              |
| `blocks/fragment/fragment.js`              | ✅ Complete                                                                                                                                                                                                                                                                                      |
| `scripts/config/fragment-loader.js`        | ✅ Complete — `fetchFragmentHtml(loadFragmentFn, metaKey, defaultPath)` → `Promise<string                                                                                                                                                                                                        | null>` |
| `scripts/config/global-decorators.js`      | ✅ Complete — `decorateIcons` (LineIcons) + `decorateRegenElements` (full regen directive system)                                                                                                                                                                                                |
| `component-models.json`                    | ✅ Has entries for fragment, header, footer                                                                                                                                                                                                                                                      |
| `scripts/scripts.js`                       | ✅ Complete — three-phase load, exports `encodeHtml` and `decorateMain`                                                                                                                                                                                                                          |
| `.test.js` Vitest files                    | ⚠️ Exist for all 3 blocks but **all fail** — use `jest.mock` / `jest.fn()` / `jest.clearAllMocks()` instead of Vitest `vi.*`; `header.test.js` additionally asserts against old boilerplate selectors (`.nav-wrapper`, `nav#nav`, `.nav-hamburger`) which no longer exist in the rendered markup |
| `.spec.js` Playwright files                | ✅ Exist in all 3 block folders                                                                                                                                                                                                                                                                  |
| `vitest.config.js`                         | ✅ Complete — jsdom, `blocks/**/*.test.js`, coverage via v8                                                                                                                                                                                                                                      |
| `head.html`                                | ✅ Has CSP meta, viewport, `aem.js`, `scripts.js`, `styles.css`                                                                                                                                                                                                                                  |
| `.claude/settings.json` — PostToolUse hook | ✅ Runs `prettier --write` after each `Edit`/`Write`                                                                                                                                                                                                                                             |
| `.claude/settings.json` — PreToolUse hook  | ✅ Blocks read/edit/write of `.env*` files                                                                                                                                                                                                                                                       |
| `.prettierrc.json`                         | ✅ Complete — `tabWidth:2`, `singleQuote:true`, `trailingComma:'all'`, `printWidth:120`                                                                                                                                                                                                          |
| `package.json` format + test scripts       | ✅ Complete — `format`, `format:check`, `test:unit`, `test:unit:watch`, `test:e2e`, `test:e2e:ui`, `test:e2e:report`, `test`                                                                                                                                                                     |
| `husky` + `lint-staged`                    | ✅ Complete — `.husky/pre-commit` runs `npx lint-staged`; covers `*.js`, `*.css`, `*.{json,md}`, blocks `.env*`                                                                                                                                                                                  |
| `eslint.config.js`                         | ⚠️ Partial — ESLint v8 compat shim (airbnb-base + prettier); **missing** `eslint-plugin-jsdoc` and `eslint-plugin-jsx-a11y`; incorrectly ignores `scripts/scripts.js` + `scripts/delayed.js`                                                                                                     |
| `develop` branch                           | ✅ Exists on remote                                                                                                                                                                                                                                                                              |
| `.github/pull_request_template.md`         | ✅ Complete — issue link + before/after preview URL fields                                                                                                                                                                                                                                       |
| `.github/workflows/main.yaml`              | ⚠️ Partial — lint-only CI on every push; no unit tests, e2e, or PageSpeed                                                                                                                                                                                                                        |
| `.github/workflows/cleanup-on-create.yaml` | ✅ Complete — one-time setup cleanup                                                                                                                                                                                                                                                             |
| `.claude/commands/new-block.md`            | ✅ Complete — scaffolds all 6 block files + breakpoint CSS partials + `component-models.json` entry                                                                                                                                                                                              |

### What is still missing

| Missing item                                                                 | Impact                                                                                                                                                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/config/html.js`                                                     | **Critical unblocking item** — `innerHTML` prohibition cannot be enforced; all model refactors blocked                                                                                                                                                                                                                                       |
| `blocks/header/header.model.js` — add `CONTENT_MODEL`                        | da.live sync incomplete; model files inconsistent                                                                                                                                                                                                                                                                                            |
| `blocks/footer/footer.model.js` — add `CONTENT_MODEL`, migrate to `html\`\`` | da.live sync incomplete                                                                                                                                                                                                                                                                                                                      |
| `blocks/fragment/fragment.model.js`                                          | Does not exist — no `CONTENT_MODEL` or markup template                                                                                                                                                                                                                                                                                       |
| `blocks/fragment/fragment.css` + `styles/` directory                         | Does not exist — fragment has no CSS at all                                                                                                                                                                                                                                                                                                  |
| `scripts/config/utils.js`                                                    | Missing date formatter, loader, and JSON-LD injector                                                                                                                                                                                                                                                                                         |
| `scripts/config/data-parser.js`                                              | Missing safe JSON parse helpers                                                                                                                                                                                                                                                                                                              |
| `scripts/delayed.js`                                                         | Contains only a comment — Lenis never initialises                                                                                                                                                                                                                                                                                            |
| `scripts/scripts.js` — `html` re-export                                      | No stable single import path for the `html` helper in block files                                                                                                                                                                                                                                                                            |
| `eslint.config.js` — `eslint-plugin-jsdoc`                                   | JSDoc not enforced; violates code standards                                                                                                                                                                                                                                                                                                  |
| `eslint.config.js` — un-ignore `scripts/scripts.js` + `scripts/delayed.js`   | Refactored files exempt from linting                                                                                                                                                                                                                                                                                                         |
| `playwright.config.js` — `testMatch` update                                  | Spec files in `blocks/` not discovered (uses `testDir: './tests/e2e'`)                                                                                                                                                                                                                                                                       |
| `playwright.config.js` — Firefox + WebKit projects                           | Only chromium + mobile; cross-browser matrix incomplete                                                                                                                                                                                                                                                                                      |
| PostToolUse ESLint-fix hook in `.claude/settings.json`                       | Auto-fixable lint errors not caught by Claude                                                                                                                                                                                                                                                                                                |
| `AGENTS.md` update                                                           | Missing `model.js` convention, regen system, fragment-loader pattern                                                                                                                                                                                                                                                                         |
| `.github/workflows/ci.yml`                                                   | No comprehensive PR gate (unit + e2e + pagespeed)                                                                                                                                                                                                                                                                                            |
| `.github/workflows/release.yml`                                              | No `develop → main` promotion gate                                                                                                                                                                                                                                                                                                           |
| `styles/lazy-styles.css` — print/selection/skip                              | Missing post-LCP global polish                                                                                                                                                                                                                                                                                                               |
| `.claude/commands/` — 7 new slash commands                                   | No automation for common workflows                                                                                                                                                                                                                                                                                                           |
| `.claude/prompts/` — 4 reusable prompts                                      | No automation for reviews and sign-offs                                                                                                                                                                                                                                                                                                      |
| `budget.json`                                                                | No Lighthouse CI performance budget file                                                                                                                                                                                                                                                                                                     |
| `.test.js` files — `jest` → `vi` migration                                   | All 3 test files use `jest.mock` / `jest.fn()` / `jest.clearAllMocks()` — must be replaced with `vi.mock` / `vi.fn()` / `vi.clearAllMocks()` (import `vi` from `'vitest'`, or rely on globals); `header.test.js` additionally needs assertions updated from `.nav-wrapper`/`nav#nav`/`.nav-hamburger` to the actual `siteheader-*` selectors |
| `README.md`                                                                  | Missing role-specific onboarding guidelines; no single entry point for new team members (scrum master, PO, architect, PM, tech manager, developer, QA, DevOps)                                                                                                                                                                               |

---

## Architecture Standards

> These are permanent rules that must be followed for every file, block, and PR. They do not change between phases.

### The golden rule: never touch `scripts/aem.js`

`scripts/aem.js` is an upstream Adobe library. **Never modify it.** All project customisation goes in `scripts/scripts.js`. Import from `aem.js` — do not copy or re-implement its functions.

### JavaScript code standards

- **JSDoc required on every exported function** — enforced via `eslint-plugin-jsdoc`. Format: description + `@param {Type} name description` + `@returns {Type} description`.
- **No `innerHTML`** — use the `html` tagged-template from `scripts/config/html.js`. The `html` function uses `document.createElement('template')` internally; consumers never write `innerHTML` themselves.
- ES6+ throughout: arrow functions, destructuring, `async/await`, `?.` optional chaining, ES modules.
- Always include `.js` extension in import paths.
- Use Unix line endings (LF).
- No `/* html */` template strings with `.replace()` in new code. Existing blocks migrate when touched.
- `encodeHtml(str)` from `scripts/scripts.js` — use when embedding plain text in HTML attribute values.

### `decorate()` function pattern (every block)

```js
/**
 * Loads and decorates the block.
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // 1. Load dependencies (dynamic imports, await fragments)
  // 2. Extract configuration (readBlockConfig, row/cell access)
  // 3. Transform DOM (build from model templates, use html``, replaceChildren)
  // 4. Add event listeners
}
```

**Always follow this four-step order.** Never attach event listeners before the DOM exists (step 3 must come first).

**Error resilience:** Wrap the body in `try/catch`. On error: log with `console.error`, preserve the original authored HTML (never blank a section), and set `block.dataset.blockStatus = 'failed'` for QA triage.

### Block `{blockname}.md` — content model documentation (required)

Every block directory must contain a `{blockname}.md` file documenting the authored content model. It is the contract between content authors and developers. **Read it before touching any block's `.js` or `.css`.**

Format — da.live-style block table:

```markdown
| Block Name            |                       |
| --------------------- | --------------------- |
| Field A _(required)_  | Field B _(required)_  |
| description of cell A | description of cell B |
| Field C _(optional)_  |                       |
| description of cell C |                       |
```

Rules:

- First row: block name only, matching the CSS class name exactly.
- Subsequent rows: field label (with `_(required)_` or `_(optional)_`) above a description row.
- Each column = one authored cell.
- Variations documented as separate tables using `Block Name (variation-name)` in the first cell.

**Sync rule:** Any change to expected rows, cells, or field order must update `{blockname}.md` first, then the JS and test file together. A test that no longer reflects current block behaviour is treated as broken.

### `{blockname}.model.js` — exports

| Export          | Type          | Purpose                                                                           |
| --------------- | ------------- | --------------------------------------------------------------------------------- |
| `CONTENT_MODEL` | object        | `{ id: '{name}', fields: [...] }` — synced to `component-models.json` and da.live |
| `*_MARKUP`      | `html\`...\`` | DOM templates used by `{name}.js`; replaces all `createElement`/`append` patterns |

Both exports are used in `{name}.test.js`. Never use `/* html */` strings in new model files.

### DOM transformation — how authored content arrives

By the time `decorate(block)` runs:

```html
<div class="my-block">
  <div>
    <!-- row -->
    <div>...</div>
    <!-- cell 1 -->
    <div>...</div>
    <!-- cell 2 -->
  </div>
  <div>
    <!-- row -->
    <div>...</div>
  </div>
</div>
```

Access rows and cells:

```js
const rows = [...block.children];
const [firstCell, secondCell] = row.children; // cells in a row
const image = row.children[0];
if (!image) return; // guard all optional cells
```

Use `createOptimizedPicture` (from `scripts/aem.js`) for every authored `<img>` or `<picture>`. Use `readBlockConfig` for config-style blocks. See [aem.js API reference](#aemjs-api-reference) below.

### CSS standards

- **Mobile-first.** All base styles target the smallest viewport (`< 632px`). Use `width >=` media queries to layer larger-screen styles. **Never use `max-width` queries.**
- **Media query syntax:** use `width >=` (modern range syntax), NOT `min-width:`:
  ```css
  @media (width >= 760px) { ... }   /* ✅ correct */
  @media (min-width: 760px) { ... } /* ❌ old form — do not use */
  ```
- **CSS custom properties cannot appear inside `@media` conditions.** Always write literal `px` values. The `--breakpoint-*` tokens exist for JavaScript reference only.
- **`rem`** — primary unit for all sizing (font-size, spacing, dimensions).
- **`em`** — used only inside `@media` queries.
- Never mix `px` into authored block or config CSS except for `1px` borders.
- All selectors must be scoped to the block's root class. Never write bare element selectors that leak outside the block.
- Do NOT use `{blockname}-container` or `{blockname}-wrapper` in CSS — those class names are used by the framework on section/block wrapper elements.
- Prefer `@container` (with `container-type: inline-size` on the block root) over viewport `@media` for block-internal layout decisions that depend on the block's own width.

### Breakpoints

| Token              | Literal value | CSS partial | Use `width >=`             |
| ------------------ | ------------- | ----------- | -------------------------- |
| `--breakpoint-sm`  | `632px`       | `sm.css`    | `@media (width >= 632px)`  |
| `--breakpoint-md`  | `760px`       | `md.css`    | `@media (width >= 760px)`  |
| `--breakpoint-lg`  | `992px`       | `lg.css`    | `@media (width >= 992px)`  |
| `--breakpoint-xl`  | `1272px`      | `xl.css`    | `@media (width >= 1272px)` |
| `--breakpoint-xxl` | `1432px`      | `xxl.css`   | `@media (width >= 1432px)` |

### Accessibility standard — WCAG 2.1/2.2 Level AA

- Semantic HTML5 elements (`<nav>`, `<main>`, `<article>`, `<section>`, etc.)
- All interactive elements must have ARIA labels where native semantics are insufficient
- One `<h1>` per page; no skipped heading levels; blocks must not introduce an `<h1>` or skip levels
- Manage `aria-expanded` for any toggle/accordion pattern; `tabindex` + `keydown` (Enter/Space/Escape) for keyboard nav
- `:focus-visible` outline on all interactive elements — use `--color-{state}-focus` at `3px solid`, `outline-offset: 2px`
- Contrast: normal text ≥ 4.5:1 (`--color-text` or `--color-{state}-text`); large text / UI components ≥ 3:1; hover/active states ≥ 3:1 against page background
- **Warning exception:** amber backgrounds require dark text — always pair `background-color: var(--color-warning)` with `color: var(--color-warning-text)`. Never white text on amber.
- Dark mode is handled automatically by semantic tokens — no per-block `prefers-color-scheme` media queries needed

### Security & Compliance

EDS sites are served over a CDN with headers configured in `metadata.xlsx` in the content repository — not in code. This is the authoritative place for HTTP security headers.

| Header / Concern            | Mechanism                                                                                                                                                                              |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Content Security Policy** | Set via `metadata.xlsx` `headers` sheet (`Content-Security-Policy` row). Also backed by CSP `<meta>` in `head.html` (nonce-aem, strict-dynamic) as a defence-in-depth fallback.        |
| **Anticlickjack**           | Set `X-Frame-Options: SAMEORIGIN` and/or `Content-Security-Policy: frame-ancestors 'self'` in `metadata.xlsx` headers sheet. Both should be present for maximum browser compatibility. |
| **XSS**                     | Enforced structurally: `innerHTML` is **prohibited** (see golden rule). All DOM construction uses the `html` tagged-template from `scripts/config/html.js`, which never evals strings. |
| **Sensitive file exposure** | Use `.hlxignore` to prevent non-public paths (config files, draft folders) from being served by the CDN.                                                                               |

**`metadata.xlsx` headers sheet format** (add a `headers` sheet to the content repo):

| URL pattern | X-Frame-Options | Content-Security-Policy | …   |
| ----------- | --------------- | ----------------------- | --- |
| `/**`       | `SAMEORIGIN`    | `default-src 'self' …`  |     |

When tightening CSP: add new origins to `metadata.xlsx` first, verify on the feature preview URL (`{branch}--{repo}--{owner}.aem.page`), then merge. Never loosen CSP to fix a breakage — find the missing origin instead.

### Third-party JS loading strategy

EDS has no build process. All third-party plugins must be UMD or ESM-via-CDN files — never npm-bundled. Vendor JS lands in `scripts/vendor/`.

| Load point                   | When to use                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------- |
| `<head>` / eager             | Only render-critical polyfills — avoid; every `<script>` in `<head>` blocks LCP |
| Lazy phase                   | Vendor CSS needed above-fold but not critical                                   |
| `delayed.js` (3 s post-LCP)  | Preferred for all analytics, scroll libs, carousel inits, martech               |
| Per-block dynamic `import()` | For plugins used only by one block; call inside `decorate()`                    |

### Fragment-loading blocks

All blocks that load a CMS fragment must use `fetchFragmentHtml` from `scripts/config/fragment-loader.js` — never repeat the three-line meta/path/load boilerplate:

```js
import { loadFragment } from '../fragment/fragment.js';
import fetchFragmentHtml from '../../scripts/config/fragment-loader.js';

const fragmentHtml = await fetchFragmentHtml(loadFragment, 'nav', '/nav');
if (!fragmentHtml) return;
const temp = document.createElement('div');
temp.innerHTML = fragmentHtml; // safe — controlled outerHTML of a decorated fragment
```

**Rule: capture `outerHTML` before building any fragment-loading block.**

1. Start dev server (`aem up`).
2. Call `fetchFragmentHtml`, temporarily save result to `tests/fragments/{blockname}-fragment-outerhtml.html`.
3. Inspect the file to understand decorated DOM structure (`data-block-name` attrs, row/cell layout).
4. Update `{blockname}.md` to reflect the cell structure.
5. Write decoration code based on observed structure.
6. **Delete the outerHTML file before committing.**

### `decorateMain(main)` — decoration call order

```js
export function decorateMain(main) {
  decorateButtons(main); // wraps lone anchors as .button
  decorateIcons(main); // converts LineIcons spans
  decorateRegenElements(main); // regen directive system
  buildAutoBlocks(main); // synthetic blocks
  decorateSections(main); // wraps content in .section divs
  decorateBlocks(main); // sets block class names + data-attrs
}
```

Functions before `decorateSections` operate on raw authored DOM. Functions after `decorateBlocks` operate on the wrapped structure. Called once per page load and once per fragment load.

### Pre-push cleanup

Before pushing any branch, delete temporary artifacts:

```sh
rm -f __temp.html
rm -rf test-results/
rm -f tests/fragments/*-fragment-outerhtml.html
```

---

## Design Token Reference

> All tokens are defined on `:root` in `styles/styles.css`. Token values never change at a breakpoint — use fluid `clamp()` for responsive sizing. Add new project-wide overrides only in `styles/config/overrides.css` (loaded in `overrides` layer — wins without `!important`).

### Color architecture — four files

1. **`styles/config/colors.css`** — raw palette: `--color-{hue}-{shade}` (shades 0, 100–900, oklch). Never use directly in components.
2. **`styles/config/themes.css`** — semantic tokens for light mode (`:root`) and dark mode (`@media (prefers-color-scheme: dark)` + `[data-eds-theme="dark"]`). Use in all new code.
3. **`styles/styles.css :root`** — legacy bridge tokens (delegate to semantic tokens for backwards compat).
4. **`styles/config/overrides.css`** — project-level token overrides. Block-level overrides go on the block selector (never `:root`).

### Palette hues

| Hue     | Palette name        | Semantic role              | Hue angle (oklch) |
| ------- | ------------------- | -------------------------- | ----------------- |
| Neutral | `--color-neutral-*` | backgrounds, text, borders | `252` (cool gray) |
| Blue    | `--color-blue-*`    | primary                    | `252`             |
| Violet  | `--color-violet-*`  | secondary                  | `288`             |
| Teal    | `--color-teal-*`    | tertiary                   | `194`             |
| Red     | `--color-red-*`     | danger                     | `24`              |
| Green   | `--color-green-*`   | success                    | `142`             |
| Sky     | `--color-sky-*`     | info                       | `221`             |
| Amber   | `--color-amber-*`   | warning                    | `83`              |

Shade `500` ≈ 4.6:1 contrast on white (WCAG AA normal text). Shade `400` ≈ 3.1:1 (AA non-text UI). Amber exception: `--color-amber-600` only ~3.3:1 — use `--color-amber-700` or darker for text on white.

### Semantic tokens (use these in all block/component CSS)

Each state exposes 7 tokens. Available states: `primary` · `secondary` · `tertiary` · `danger` · `success` · `info` · `warning`.

| Token pattern            | Purpose                                     | WCAG                              |
| ------------------------ | ------------------------------------------- | --------------------------------- |
| `--color-{state}`        | Filled background (buttons, badges, alerts) | 1.4.11 ≥3:1 on page bg            |
| `--color-{state}-hover`  | Hover background                            | 1.4.11 ≥3:1                       |
| `--color-{state}-active` | Pressed/active background                   | 1.4.11 ≥3:1                       |
| `--color-{state}-text`   | Text on filled background                   | 1.4.3 ≥4.5:1 vs `--color-{state}` |
| `--color-{state}-subtle` | Tinted area background (alert, chip)        | —                                 |
| `--color-{state}-border` | Border for outlined variants                | 1.4.11 ≥3:1                       |
| `--color-{state}-focus`  | Focus-ring colour                           | 2.4.11/2.4.13 ≥3:1                |

Dark mode shifts: `primary` `blue-600` → `blue-300`; all states shift to `-300` except warning `amber-600` → `amber-400`.

### Surface tokens

| Token                | Light mode          | Dark mode     |
| -------------------- | ------------------- | ------------- |
| `--color-page-bg`    | `neutral-0` (white) | `neutral-900` |
| `--color-surface`    | `neutral-100`       | `neutral-800` |
| `--color-surface-2`  | `neutral-200`       | `neutral-700` |
| `--color-border`     | `neutral-300`       | `neutral-700` |
| `--color-text`       | `neutral-900`       | `neutral-100` |
| `--color-text-muted` | `neutral-600`       | `neutral-400` |

### Dark mode toggle

```js
document.documentElement.setAttribute('data-eds-theme', 'dark'); // force dark
document.documentElement.setAttribute('data-eds-theme', 'light'); // force light
document.documentElement.removeAttribute('data-eds-theme'); // follow OS
```

`@media (prefers-color-scheme: dark)` activates automatically. No per-block dark mode queries needed.

### Legacy bridge tokens (backwards compat — do not add new ones)

`--background-color` → `var(--color-page-bg)` · `--text-color` → `var(--color-text)` · `--link-color` → `var(--color-primary)` · `--link-hover-color` → `var(--color-primary-hover)` · `--border-color` → `var(--color-border)` · etc.

### Typography — font families

| Use       | `font-family` value                                                    | Weights                  | Files                |
| --------- | ---------------------------------------------------------------------- | ------------------------ | -------------------- |
| Body      | `noto-sans, noto-sans-fallback, sans-serif`                            | 300/400/500/700 + italic | `fonts/noto-sans/`   |
| Headings  | `noto-serif, noto-serif-fallback, serif`                               | 300/400/500/700 + italic | `fonts/noto-serif/`  |
| Monospace | `google-sans-code, google-sans-code-fallback, ui-monospace, monospace` | 300/400/500/700 + italic | `fonts/google-code/` |

CSS properties: `--body-font-family`, `--heading-font-family`, `--mono-font-family`. **Never use the directory name (`google-code`) as the CSS font-family value** — the value is `google-sans-code`.

### Typography — fluid type scale (`clamp(min, preferred, max)`)

Scale from `632px` (sm) to `1432px` (xxl). No breakpoint overrides for font sizes — all heading sizes must derive from `--fs-*` tokens.

| Token                  | Min (632px)     | Max (1432px)   |
| ---------------------- | --------------- | -------------- |
| `--font-size-display1` | `2rem/32px`     | `3.25rem/52px` |
| `--font-size-display2` | `1.875rem/30px` | `3rem/48px`    |
| `--font-size-display3` | `1.75rem/28px`  | `2.75rem/44px` |
| `--font-size-display4` | `1.625rem/26px` | `2.5rem/40px`  |
| `--font-size-display5` | `1.5rem/24px`   | `2.25rem/36px` |
| `--font-size-display6` | `1.375rem/22px` | `2rem/32px`    |
| `--font-size-h1`       | `1.75rem/28px`  | `3rem/48px`    |
| `--font-size-h2`       | `1.625rem/26px` | `2.5rem/40px`  |
| `--font-size-h3`       | `1.5rem/24px`   | `2.25rem/36px` |
| `--font-size-h4`       | `1.375rem/22px` | `2rem/32px`    |
| `--font-size-h5`       | `1.25rem/20px`  | `1.75rem/28px` |
| `--font-size-h6`       | `1.125rem/18px` | `1.5rem/24px`  |
| `--font-size-intro`    | `1.25rem/20px`  | `1.75rem/28px` |
| `--font-size-p`        | `1rem/16px`     | `1.25rem/20px` |
| `--font-size-small`    | `0.875rem/14px` | `1rem/16px`    |

### Spacing tokens

| Token         | Value           |
| ------------- | --------------- |
| `--spacing-1` | `0.25rem` (4px) |
| `--spacing-2` | `0.5rem` (8px)  |
| `--spacing-3` | `1rem` (16px)   |
| `--spacing-4` | `1.5rem` (24px) |
| `--spacing-5` | `3rem` (48px)   |

Use spacing tokens for gap, padding, and margin in blocks — not hard-coded `px` values.

### Border radius tokens

| Token                    | Value     |
| ------------------------ | --------- |
| `--border-radius-s`      | `0.25rem` |
| `--border-radius-m`      | `0.5rem`  |
| `--border-radius-l`      | `1rem`    |
| `--border-radius-pill`   | `50rem`   |
| `--border-radius-circle` | `50%`     |

### Shadow tokens

| Token        | Description            |
| ------------ | ---------------------- |
| `--shadow-s` | subtle 1px/2px shadow  |
| `--shadow-m` | medium 4px/6px shadow  |
| `--shadow-l` | large 10px/15px shadow |

### Z-index scale

| Token          | Value | Intended use           |
| -------------- | ----- | ---------------------- |
| `--z-below`    | `-1`  | Behind background      |
| `--z-base`     | `0`   | Normal flow            |
| `--z-raised`   | `10`  | Cards, lifted elements |
| `--z-dropdown` | `100` | Dropdowns, popovers    |
| `--z-sticky`   | `200` | Sticky headers         |
| `--z-fixed`    | `300` | Fixed navigation       |
| `--z-overlay`  | `400` | Overlay backdrops      |
| `--z-modal`    | `500` | Modal dialogs          |
| `--z-popover`  | `600` | Tooltips, popovers     |
| `--z-toast`    | `700` | Toast notifications    |

### Transition tokens

| Token                | Value        |
| -------------------- | ------------ |
| `--transition-speed` | `200ms`      |
| `--transition-ease`  | `ease`       |
| `--transition-base`  | `200ms ease` |

### Layout tokens

| Token                 | Value                                                                                                   |
| --------------------- | ------------------------------------------------------------------------------------------------------- |
| `--nav-height`        | `64px` (base CSS token; header CSS overrides per breakpoint: 72px mobile / 84px tablet / 96px desktop+) |
| `--max-width`         | `120rem` (1920px max absolute width)                                                                    |
| `--grid-columns`      | `12`                                                                                                    |
| `--grid-gutter-width` | `3rem` (48px)                                                                                           |

**Section content wrapper:** `.section > div` has max-width `1200px`, horizontally centred, horizontal padding `24px` (mobile) / `32px` at `992px+`. Do not override inside blocks — use negative margins or the section wrapper for full-bleed layouts.

### CSS cascade structure

`styles/styles.css` is the single critical-path CSS entry point. All 10 config partials are eagerly imported. **Do not move config imports to `lazy-styles.css`.**

```css
@layer reset, base, layout, blocks, utilities, overrides;

@import url('config/normalize.css') layer(reset);
@import url('config/colors.css') layer(base);
@import url('config/themes.css') layer(base);
@import url('config/typography.css') layer(base);
@import url('config/grid.css') layer(layout);
@import url('config/forms.css') layer(base);
@import url('config/globals.css') layer(base);
@import url('config/utilities.css') layer(utilities);
@import url('config/buttons.css') layer(utilities);
@import url('config/overrides.css') layer(overrides);
```

`styles/lazy-styles.css` is for post-LCP vendor CSS only (currently: `@import url('vendor/lineicons-free.css')`).

### Block CSS pattern — breakpoint partials

Every block's main CSS file is a thin import hub:

```css
/* {blockname}.css */
@import url('./styles/default.css'); /* mobile-first base */
@import url('./styles/sm.css'); /* width >= 632px */
@import url('./styles/md.css'); /* width >= 760px */
@import url('./styles/lg.css'); /* width >= 992px */
@import url('./styles/xl.css'); /* width >= 1272px */
@import url('./styles/xxl.css'); /* width >= 1432px */
```

Each partial contains only the rules for that breakpoint range. Breakpoint CSS files may be empty if no rules apply at that size.

### Regen directive system (`scripts/config/global-decorators.js`)

`decorateRegenElements(main)` is called from `decorateMain`. Authors embed `{{regen:start;element:<type>;<key>:<value>;…}}…{{regen:end}}` pairs in content. **CSS keys** (`element`, `theme`, `style`, `size`, `radius`, `level`, `author`, `source`) drive class/tag logic and are NOT set as HTML attributes. All other keys become HTML attributes verbatim.

| `element` value | Produced element                         | Key params                                                            |
| --------------- | ---------------------------------------- | --------------------------------------------------------------------- |
| `anchor`        | `<a class="btn ...">`                    | `theme`, `style`, `size`, `radius`, `href`, + any HTML attr           |
| `button`        | `<button type="button" class="btn ...">` | same class system                                                     |
| `image`         | `<img>` (optionally in `<a>`)            | `alt`, `width`, `height`, `loading`, `radius`, anchor `href`/`target` |
| `paragraph`     | `<p>`                                    | `style` → `.paragraph--{style}` (e.g. `intro`)                        |
| `blockquote`    | `<blockquote>` + optional `<footer>`     | `author` → `<cite>`, `source` → `.blockquote__source`                 |
| `heading`       | `<h1>`–`<h6>`                            | `level` (default `2`), `style` → `.heading--display{n}`               |
| `badge`         | `<span class="badge ...">`               | `theme`, `style`, `radius`                                            |
| `alert`         | `<div class="alert ...">`                | `theme`, `style`, `radius`, `role`                                    |
| `divider`       | `<hr>`                                   | —                                                                     |

**Display scale** (`--font-size-display*` fluid tokens):

| `style`    | Class                | Min (632px) | Max (1432px) |
| ---------- | -------------------- | ----------- | ------------ |
| `display1` | `.heading--display1` | 32px        | 52px         |
| `display2` | `.heading--display2` | 30px        | 48px         |
| `display3` | `.heading--display3` | 28px        | 44px         |
| `display4` | `.heading--display4` | 26px        | 40px         |
| `display5` | `.heading--display5` | 24px        | 36px         |
| `display6` | `.heading--display6` | 22px        | 32px         |

**Adding a new element type:**

1. Add `else if (element === '<type>')` branch in `applyRegenDirective` in `scripts/config/global-decorators.js`.
2. Add param names to `REGEN_CSS_KEYS` if they must not become HTML attributes.
3. Add CSS to the appropriate `styles/config/` partial.
4. Document the new element in the regen table above.

### `decorateIcons` — LineIcons pattern

Replaces `<span class="icon icon-{name}">` with `<i class="lni lni-{name}" aria-hidden="true">`. This is the project's icon system — **not** the aem.js `<img>` icon pattern.

### Section metadata variants

Built-in variants (applied as classes on `.section` by the framework):

| Class        | Effect                                                             |
| ------------ | ------------------------------------------------------------------ |
| `.light`     | `background: var(--light-color)`, no vertical margin, 40px padding |
| `.highlight` | Same as `.light`                                                   |

To add a new variant, add a scoped rule in `styles/styles.css`.

---

## aem.js API Reference

Import from `../../scripts/aem.js`. Never copy-paste implementations.

| Function                   | Signature                        | Description                                                                                      |
| -------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------ |
| `buildBlock`               | `(blockName, content)`           | Creates a block DOM element from string/array/object                                             |
| `createOptimizedPicture`   | `(src, alt, eager, breakpoints)` | Creates `<picture>` with webp sources + fallbacks                                                |
| `decorateBlock`            | `(block)`                        | Sets block classes, `data-block-name`, `data-block-status`                                       |
| `decorateBlocks`           | `(main)`                         | Runs `decorateBlock` on all blocks                                                               |
| `decorateButtons`          | `(element)`                      | Upgrades lone anchors in `<p>` to `.button` links                                                |
| `decorateIcons`            | `(element, prefix?)`             | Replaces `:icon-name:` spans with `<img>` (upstream pattern, overridden by our LineIcons system) |
| `decorateSections`         | `(main)`                         | Wraps authored content in `.section` divs                                                        |
| `decorateTemplateAndTheme` | `()`                             | Applies template/theme metadata as body classes                                                  |
| `getMetadata`              | `(name, doc?)`                   | Returns `<meta name>` or `<meta property>` content                                               |
| `loadBlock`                | `(block)`                        | Loads + executes a block's JS and CSS                                                            |
| `loadCSS`                  | `(href)`                         | Dynamically appends `<link rel="stylesheet">`                                                    |
| `loadFooter`               | `(footer)`                       | Builds and loads the footer block                                                                |
| `loadHeader`               | `(header)`                       | Builds and loads the header block                                                                |
| `loadScript`               | `(src, attrs?)`                  | Dynamically appends a `<script>` tag                                                             |
| `loadSection`              | `(section, callback?)`           | Loads all blocks in a section; resolves after callback                                           |
| `loadSections`             | `(element)`                      | Loads all sections in a container                                                                |
| `readBlockConfig`          | `(block)`                        | Extracts key/value pairs from a config-style block table                                         |
| `sampleRUM`                | `(checkpoint, data?)`            | Records a Real User Monitoring checkpoint                                                        |
| `toCamelCase`              | `(name)`                         | Converts `hyphen-case` or `snake_case` to `camelCase`                                            |
| `toClassName`              | `(name)`                         | Sanitises a string for use as a CSS class name                                                   |
| `waitForFirstImage`        | `(section)`                      | Resolves when the first image in a section has loaded                                            |
| `wrapTextNodes`            | `(block)`                        | Wraps bare inline text nodes in `<p>` tags                                                       |

**`createOptimizedPicture` usage:**

```js
import { createOptimizedPicture } from '../../scripts/aem.js';

block.querySelectorAll('picture > img').forEach((img) => {
  img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
});
// For LCP (above-fold) image, pass true as third arg to disable lazy loading
```

**`readBlockConfig` usage:**

```js
import { readBlockConfig } from '../../scripts/aem.js';

export default function decorate(block) {
  const config = readBlockConfig(block); // { limit: '6', 'show-tags': 'true', ... }
  block.textContent = ''; // clear after reading config
  // render using config values
}
```

---

## Block File Convention

```
blocks/{name}/
  {name}.js          default export decorate(block) — 4-step pattern; try/catch body
  {name}.css         @import hub → ./styles/*.css
  {name}.model.js    CONTENT_MODEL + *_MARKUP exports (html`` tagged-template)
  {name}.test.js     Vitest unit tests
  {name}.spec.js     Playwright e2e tests
  {name}.md          Block documentation (da.live-style content model table)
  styles/
    default.css      mobile-first base (< 632px)
    sm.css           width >= 632px
    md.css           width >= 760px
    lg.css           width >= 992px
    xl.css           width >= 1272px
    xxl.css          width >= 1432px
```

> **Demo blocks** — blocks that showcase the design system use the `_` prefix (e.g. `_type-specimen`, `_grid-demo`, `_form-demo`, `_color-swatch`). Same file structure as production blocks. Never used on production content pages — blocked via `.hlxignore` or a path guard in `scripts.js`.

> **Globally handled elements** — `button`, `form`, and `grid` are NOT implemented as blocks. Styles live in `styles/config/globals.css`, `styles/config/forms.css`, and `styles/config/grid.css` respectively.

---

## Phase 1 — Create `html` tagged-template; add `CONTENT_MODEL` to header

**Critical path: create `scripts/config/html.js` first — everything else is blocked until this exists.**

### Step 1a — Create `scripts/config/html.js`

Verbatim from the reference implementation (do not modify the logic):

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
      return;
    }
    if (values[idx] instanceof HTMLElement) {
      el.replaceWith(values[idx]);
      return;
    }
    // eslint-disable-next-line no-console
    console.error('Case not handled for', el);
  });
  const { children } = template.content;
  return children.length === 1 ? children[0] : children;
}
```

### Step 1b — Update `blocks/header/header.model.js`

**Add `CONTENT_MODEL` export** at the top (after existing file-level comment, before `CONTENT_MODEL_SPEC`):

```js
export const CONTENT_MODEL = { id: 'header', fields: [] };
```

The existing `CONTENT_MODEL_SPEC`, `HEADER_MARKUP`, and all other markup exports do **not** need to migrate to `html`` yet — the `/_ html _/`template string pattern is still safe here (tokens are replaced via`.replaceAll()`with`outerHTML`of parsed DOM nodes or`encodeHtml()`-encoded strings). Migration happens when the block is next significantly touched.

### Step 1c — ~~Update `header.js` import~~ (already done ✅)

---

## Phase 2 — Script utilities; `scripts.js` / `delayed.js` updates

### `scripts/config/utils.js` (create)

Port from the reference implementation. Key porting notes:

- The reference imports `html` from `'../aem.js'` — change to `import html from './html.js'`
- The reference uses `getPlaceholder('Loading')` which does not exist in our `scripts/aem.js` — replace with hardcoded `'Loading...'` in the `aria-live` text
- `addloader` → rename to `addLoader` (camelCase)
- Add JSDoc to `destroyLoader`

```js
import html from './html.js';

/**
 * Formats a date from milliseconds to 'dd mmm yyyy' format.
 * @param {number} milliseconds Date value in milliseconds
 * @returns {string} Formatted date string (e.g. '24 May 2026')
 */
export function formatDate(milliseconds) { … }

/**
 * Appends a loading spinner inside targetEl and marks it as loading.
 * @param {Element} targetEl Element to inject the loader into
 * @returns {Element} The loader element (pass to destroyLoader to remove)
 */
export function addLoader(targetEl) { … }

/**
 * Removes a loader element previously added by addLoader.
 * @param {Element} loaderEl The loader element returned by addLoader
 */
export function destroyLoader(loaderEl) { … }

/**
 * Appends a <script type="application/ld+json"> tag with Schema.org structured data.
 * @param {object} data Schema.org object (e.g. { '@context': 'https://schema.org', '@type': '...' })
 * @param {Element} container DOM element to append the script tag into
 */
export function injectStructuredData(data, container) { … }
```

### `scripts/config/data-parser.js` (create)

No imports needed — pure utility functions:

```js
/**
 * Safely parses a JSON string as an array. Returns fallback on error or non-array.
 * @param {string} value JSON string to parse
 * @param {Array} [fallback=[]] Value to return on parse failure or non-array result
 * @returns {Array} Parsed array or fallback
 */
export function parseJSONArray(value, fallback = []) { … }

/**
 * Safely parses a JSON string as an object. Returns fallback on error or non-object.
 * @param {string} value JSON string to parse
 * @param {object} [fallback={}] Value to return on parse failure or non-object result
 * @returns {object} Parsed object or fallback
 */
export function parseJSONObject(value, fallback = {}) { … }
```

### `scripts/scripts.js` — add `html` re-export

Add after existing imports:

```js
export { default as html } from './config/html.js';
```

This gives blocks a stable single import path: `import { html } from '../../scripts/scripts.js'`.

### `eslint.config.js` — update ignores list

After scripts.js and delayed.js are refactored: **remove** `'scripts/scripts.js'` and `'scripts/delayed.js'` from the `ignores` array. `scripts/aem.js` and `scripts/vendor/**` must remain ignored.

### `scripts/delayed.js` (update)

Initialise Lenis smooth scroll in the delayed phase (3 s after page load). Keep this file simple — only add Lenis now; other plugins are added one at a time as needed:

```js
import Lenis from '/scripts/vendor/lenis-1.3.23.js';

const lenis = new Lenis({ lerp: 0.1, duration: 1.2, smoothWheel: true });

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);
```

> **Note:** The reference `__extras/eds-claude/delayed.js` was for a large enterprise project with SSO, analytics, and browser-compatibility scripts. Do NOT port it wholesale — it is not applicable to this project.

---

## Phase 3 — Complete footer and fragment blocks

### `blocks/footer/footer.model.js` (refactor — file exists)

Current file exports only `FOOTER_MARKUP` as a `/* html */` string. Refactor to add `CONTENT_MODEL` and migrate markup to `html` tagged-template:

```js
import html from '../../scripts/config/html.js';

export const CONTENT_MODEL = { id: 'footer', fields: [] };
export const FOOTER_MARKUP = html`<div class="footer-wrapper"></div>`;
export default FOOTER_MARKUP;
```

### `blocks/fragment/fragment.model.js` (create — does not exist)

```js
import html from '../../scripts/config/html.js';

export const CONTENT_MODEL = {
  id: 'fragment',
  fields: [
    {
      component: 'text-input',
      valueType: 'string',
      name: 'path',
      label: 'Fragment Path',
      multi: false,
    },
  ],
};

export const FRAGMENT_MARKUP = html`<div class="fragment"></div>`;
export default FRAGMENT_MARKUP;
```

Note: `component-models.json` already has the `fragment` entry with the same `fields` shape — the `CONTENT_MODEL` export must stay in sync with it.

### `blocks/fragment/fragment.css` + `styles/` directory (create — does not exist)

```
blocks/fragment/
  fragment.css          @import hub (all 6 partials)
  styles/
    default.css         (may be empty — block has no visible UI)
    sm.css / md.css / lg.css / xl.css / xxl.css  (all empty until needed)
```

### `.test.js` files — migrate `jest` API to Vitest `vi` (all 3 blocks)

All three test files were generated with Jest syntax. Since `vitest.config.js` has `globals: true`, the Vitest globals (`describe`, `test`, `expect`, `beforeEach`, `afterEach`) are already available. Only the mock API needs updating.

**Mechanical replacements (all 3 files):**

| Find                       | Replace                  |
| -------------------------- | ------------------------ |
| `jest.mock(`               | `vi.mock(`               |
| `jest.fn()`                | `vi.fn()`                |
| `jest.clearAllMocks()`     | `vi.clearAllMocks()`     |
| `global.fetch = jest.fn()` | `global.fetch = vi.fn()` |

`vi` is a Vitest global when `globals: true` — no import needed.

**`header.test.js` — additional assertion updates:**

The test file asserts against the old boilerplate nav DOM (`'.nav-wrapper'`, `'nav#nav'`, `'.nav-hamburger button'`). The current `header.js` renders the `siteheader-*` structure defined in `HEADER_MARKUP`. Update all assertions to match:

| Old selector            | Replacement                            |
| ----------------------- | -------------------------------------- |
| `.nav-wrapper`          | `.siteheader-bar`                      |
| `nav#nav`               | `nav#siteheader-nav`                   |
| `nav[aria-expanded]`    | `.siteheader-hamburger[aria-expanded]` |
| `.nav-hamburger button` | `.siteheader-hamburger`                |

The mock for `loadFragment` in `header.test.js` returns a `<main>` with `brand`/`sections`/`tools` `data-name` divs — this matches the old boilerplate's `getMetadata`-driven section logic. In the current `header.js`, `decorate()` calls `fetchFragmentHtml(loadFragment, 'nav', '/nav')` which returns `fragment.outerHTML`. The test must mock `fetchFragmentHtml` (from `scripts/config/fragment-loader.js`) rather than `loadFragment` directly, or mock `loadFragment` at the fragment module level and let `fetchFragmentHtml` call it. Either approach works; mocking `fragment-loader.js` is simpler:

```js
vi.mock('../../scripts/config/fragment-loader.js', () => ({
  default: vi.fn().mockResolvedValue('<div data-block-name="navigation"></div>'),
}));
```

With an empty nav fragment, assertions become: `siteheader-bar` renders; `siteheader-hamburger` exists with `aria-expanded="false"`; `siteheader-search-toggle` exists.

---

## Phase 4 — Configuration and convention alignment

### `eslint.config.js` — add missing plugins (file exists, needs additions)

Install new peer dependencies:

```sh
npm install --save-dev eslint-plugin-jsdoc eslint-plugin-jsx-a11y
```

Add to `eslint.config.js`:

```js
import jsdoc from 'eslint-plugin-jsdoc';
import jsxA11y from 'eslint-plugin-jsx-a11y';

// In the config array, add:
{
  plugins: { jsdoc, 'jsx-a11y': jsxA11y },
  rules: {
    'jsdoc/require-jsdoc': ['error', { publicOnly: true, require: { FunctionDeclaration: true, ArrowFunctionExpression: false } }],
    'jsdoc/require-param': 'warn',
    'jsdoc/require-returns': 'warn',
    ...jsxA11y.configs.recommended.rules,
  },
}
```

Also remove `'scripts/scripts.js'` and `'scripts/delayed.js'` from `ignores` after Phase 2.

### Prettier — already done ✅

`.prettierrc.json`, `format`, and `format:check` scripts all exist. No changes needed.

### Git pre-commit hooks — already done ✅

`husky` + `lint-staged` fully configured: `*.js` (eslint --fix + prettier), `*.css` (stylelint --fix + prettier), `*.{json,md}` (prettier), `.env*` blocked. No changes needed.

### `playwright.config.js` — two updates needed

**Update 1 — `testMatch` to discover block specs:**

Replace `testDir: './tests/e2e'` with:

```js
testMatch: ['**/blocks/**/*.spec.js', '**/tests/e2e/**/*.spec.js'],
```

Remove `testDir`. Verify no duplicate coverage between `blocks/{name}/{name}.spec.js` and any `tests/e2e/` files; consolidate into block folders.

**Update 2 — full cross-browser matrix:**

Current config only covers `chromium` + `mobile (iPhone 13)`. Add Firefox and WebKit:

```js
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  { name: 'mobile',   use: { ...devices['iPhone 13'] } },
],
```

### Root `AGENTS.md` — selective update

**Do not replace wholesale.** Merge the following additions:

- Block directory structure: `{blockname}.model.js` (not `markup.js`), `{blockname}.spec.js`, `{blockname}.test.js`, `{blockname}.md`
- Breakpoints table + `width >=` CSS syntax
- `styles/config/` architecture and `@layer` order
- `scripts/config/fragment-loader.js` pattern + outerHTML capture workflow
- `scripts/config/global-decorators.js` regen directive system summary
- Pre-push cleanup steps (delete `__temp.html`, `test-results/`, fragment outerHTML files)
- Demo block `_` prefix convention
- Additional skills reference: https://github.com/adobe/skills/tree/main/plugins/aem/edge-delivery-services/skills
- `AGENTS.md` inline troubleshooting doc search: `curl -s https://www.aem.live/docpages-index.json | jq -r '.data[] | select(.content | test("KEYWORD"; "i")) | "\(.path): \(.title)"'`

### `styles/lazy-styles.css` — add post-LCP polish

After the existing LineIcons import:

```css
/* Print styles */
@media print {
  header,
  footer,
  nav,
  .btn,
  button {
    display: none !important;
  }
  body {
    color: #000;
    background: #fff;
  }
  a[href]::after {
    content: ' (' attr(href) ')';
  }
}

/* Text selection */
::selection {
  background: var(--color-primary-subtle);
  color: var(--color-text);
}

/* Skip link */
.skip-link:focus-visible {
  position: fixed;
  top: var(--spacing-3);
  left: var(--spacing-3);
  z-index: var(--z-toast);
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-page-bg);
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: var(--border-radius-m);
  font-weight: 700;
  text-decoration: none;
}
```

---

## Phase 5 — Git & Environment Strategy

### Git process

| Step                | Rule                                                                                                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Protection**      | `main` is protected — no direct pushes; only merge from PR with ≥1 approval + passing CI                                    |
| **Base branch**     | All feature branches cut from `develop` (already exists on remote ✅) — never from `main`                                   |
| **Naming**          | `feat/{short-description}`, `fix/{short-description}`, `chore/{short-description}`                                          |
| **Checkin**         | Commit early and often on feature branch; squash before PR                                                                  |
| **PR targets**      | Feature → `develop` (squash-merge). `develop` → `main` (merge commit, release only)                                         |
| **CI gates**        | `npm run lint` + `npm run test:unit` + `npm run test:e2e` must all pass                                                     |
| **Review criteria** | All 6 block files present; no `innerHTML`; CSS scoped; `CONTENT_MODEL` id matches block name; PageSpeed 100; axe 0 critical |
| **Hotfix**          | `hotfix/*` cut from `main`; merged to both `main` and `develop` immediately                                                 |

### Environment strategy

| Environment | Branch     | URL pattern                          | Purpose                               |
| ----------- | ---------- | ------------------------------------ | ------------------------------------- |
| **dev**     | feature/\* | `{branch}--{repo}--{owner}.aem.page` | Developer self-verification           |
| **qa**      | `develop`  | `develop--{repo}--{owner}.aem.page`  | Integration & QA testing              |
| **uat**     | `uat`      | `uat--{repo}--{owner}.aem.page`      | Stakeholder / client validation       |
| **prelive** | `main`     | `main--{repo}--{owner}.aem.page`     | Pre-production — mirrors prod content |
| **prod**    | `main`     | `main--{repo}--{owner}.aem.live`     | Live production site                  |

`uat` is a long-lived branch rebased from `develop` before each UAT cycle. Never merged into `main` directly.

**Environment URL helper:** `gh repo view --json nameWithOwner` gives `{owner}/{repo}` for URL construction. Current branch: `git branch --show-current`.

---

## Phase 6 — da.live content model sync

Every block change must keep `component-models.json` in sync. Use da-live-admin MCP tools to verify authored content after model updates:

1. `da_list_sources` — identify pages using the changed block
2. `da_get_source` — read an authored page and confirm it renders against the new model
3. `da_lookup_fragment` — verify fragment structure for nav/footer
4. `da_create_source` — create a test page in da.live when no authored example exists

`component-models.json` is the da.live source of truth for field discovery — keep it aligned with every `CONTENT_MODEL` export. The `/new-block` command already adds the `component-models.json` entry ✅.

---

## Phase 7 — CI/CD Pipeline

EDS has no build artifact. CI/CD = automated quality gates. AEM Code Sync handles branch-to-environment promotion.

### Existing CI (partial — needs replacement)

`.github/workflows/main.yaml` runs on every push: `npm ci` + `npm run lint` only. This is the baseline. It will be replaced by the comprehensive `ci.yml` below. `cleanup-on-create.yaml` is complete and untouched.

### `.github/workflows/ci.yml` — comprehensive PR quality gate

Triggers on: `pull_request` targeting `develop` or `main`.

```yaml
name: CI

on:
  pull_request:
    branches: [develop, main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check
      - run: npm run test:unit

  e2e:
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/playwright:v1.52.0-noble
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: |
          npx @adobe/aem-cli up --no-open &
          sleep 8 && npm run test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with: { name: playwright-report, path: playwright-report/ }

  pagespeed:
    runs-on: ubuntu-latest
    steps:
      - name: PageSpeed Insights check
        run: |
          URL="https://${{ github.head_ref }}--${{ github.event.repository.name }}--${{ github.repository_owner }}.aem.page/"
          npx @lhci/cli@0.14 autorun \
            --collect.url="$URL" \
            --assert.preset=lighthouse:all \
            --assert.assertions.performance=error \
            --assert.assertions.accessibility=error
```

### `.github/workflows/release.yml` — develop → main promotion gate

Triggers on: `push` to `develop` (post-merge). Runs `quality` + `e2e` against `develop--{repo}--{owner}.aem.page` before a human can open the release PR to `main`.

### `budget.json` — performance budgets

```json
{
  "lcp": 2500,
  "cls": 0.1,
  "inp": 200,
  "tbt": 200
}
```

Reference in `pagespeed` CI job so regressions fail the build.

### Branch protection rules (GitHub Settings → Branches)

Configure for both `main` and `develop`:

- Require status checks: `quality`, `e2e`, `pagespeed` — must all pass
- Require branches up to date before merging
- Require 1 approving review
- Restrict direct pushes (admins only)
- No force-pushes

### Docker scope

No `Dockerfile` committed. The `mcr.microsoft.com/playwright:v1.52.0-noble` image is referenced only in CI YAML to pin Chromium/Firefox/WebKit browser versions.

---

## QA Strategy

### Test pyramid

| Layer                 | Tool                      | File pattern          | Run when                                                | Who owns                                  |
| --------------------- | ------------------------- | --------------------- | ------------------------------------------------------- | ----------------------------------------- |
| **Unit**              | Vitest                    | `blocks/**/*.test.js` | Every commit + CI                                       | FE Dev writes; Senior QA reviews          |
| **E2E**               | Playwright                | `blocks/**/*.spec.js` | Every PR in CI; locally before push                     | Senior QA authors; Junior QA runs         |
| **Accessibility**     | axe-core (via Playwright) | Inside `.spec.js`     | Every PR                                                | Senior QA; 0 critical violations required |
| **Performance**       | Lighthouse CI             | `pagespeed` CI job    | Every PR                                                | QA Manager gates                          |
| **Visual regression** | Playwright snapshot       | `.spec.js` (opt-in)   | Block stabilisation; re-baseline on intentional changes | Senior QA                                 |
| **Manual smoke**      | Browser + da.live preview | —                     | Per environment gate                                    | Junior QA                                 |

### What every Playwright spec must cover

1. **Happy path** — standard authored content produces expected DOM structure.
2. **Empty block** — block with no rows does not throw; renders valid (possibly empty) HTML.
3. **Missing optional fields** — omitting optional cells does not throw.
4. **Repeating items** — multiple rows produce the correct number of child elements.

### Test data isolation rules

- Every `.spec.js` sets `<meta name="nav" content="/tests/fragments/nav">` and `<meta name="footer" content="/tests/fragments/footer">` — tests never depend on a live CMS.
- Draft HTML pages live in `tests/` and are served with `--html-folder tests`.
- Fragment outerHTML inspection files → `tests/fragments/{name}-fragment-outerhtml.html` — **always delete before committing**.
- Assert on structure (`aria-*`, `data-*`, class names), never on authored copy.

### Cross-browser matrix

| Browser       | Engine   | Playwright project |
| ------------- | -------- | ------------------ |
| Chrome / Edge | Chromium | `chromium`         |
| Firefox       | Gecko    | `firefox`          |
| Safari / iOS  | WebKit   | `webkit`           |

Local: `npx playwright install` (once per machine). CI: uses Docker image — no install needed.

### Environment sign-off criteria

| Environment | Gate owner       | Exit criteria                                                                                                      |
| ----------- | ---------------- | ------------------------------------------------------------------------------------------------------------------ |
| **dev**     | Developer        | `npm run lint` + `npm run test:unit` pass; no console errors on localhost                                          |
| **qa**      | Senior QA        | All `.spec.js` pass on `develop--{repo}--{owner}.aem.page`; 0 axe critical; authored content renders against model |
| **uat**     | QA Manager       | Stakeholder acceptance sign-off; da.live content verified by Junior QA                                             |
| **prelive** | Frontend Manager | PageSpeed 100 on `main--{repo}--{owner}.aem.page` for ≥3 representative pages; final axe audit; no broken links    |
| **prod**    | Frontend Manager | Post-publish smoke: 3 key pages load; `<200ms` TTFB from CDN; no console errors                                    |

### Bug triage process

1. Junior QA files issue: URL, screenshot, steps, expected vs actual, environment.
2. Senior QA confirms, labels P0–P3, assigns to dev.
3. P0/P1 blocks environment promotion until fixed and re-verified.
4. QA Manager tracks sign-offs in the release PR description.

---

## Phase 8 — Custom Skills, Commands, Prompts & Hooks

> Before creating any new skill or command, check https://github.com/adobe/skills/tree/main/plugins/aem/edge-delivery-services/skills — it may already exist upstream.

### Claude Code hooks (`.claude/settings.json`)

| Hook                    | Trigger                        | Status     | Effect                                              |
| ----------------------- | ------------------------------ | ---------- | --------------------------------------------------- |
| PreToolUse `.env` guard | `Read\|Edit\|Write` on `.env*` | ✅ Exists  | Blocks `.env` file access; exits with code 2        |
| PostToolUse Prettier    | `Edit\|Write` on any file      | ✅ Exists  | `prettier --write <file>` format-on-save            |
| PostToolUse ESLint fix  | `Edit\|Write` on `*.js`        | ❌ Missing | Should run `eslint --fix <file>` after each JS edit |

**ESLint-fix hook to add** — extend the existing `PostToolUse` entry:

```json
{
  "type": "command",
  "command": "sh -c 'file=$(echo \"$TOOL_INPUT\" | python3 -c \"import sys,json; d=json.load(sys.stdin); print(d.get(\\\"file_path\\\",\\\"\\\"))\" 2>/dev/null); [ -n \"$file\" ] && npx prettier --write \"$file\" 2>/dev/null; case \"$file\" in *.js) npx eslint --fix \"$file\" 2>/dev/null;; esac; exit 0'"
}
```

### Git pre-commit hooks — already done ✅

`husky` + `lint-staged` are complete. Every commit auto-fixes ESLint, Stylelint, and Prettier on staged files.

### Slash commands (`.claude/commands/`)

| Command               | File             | Status    | What it does                                                                                                                                                                                        |
| --------------------- | ---------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/new-block <name>`   | `new-block.md`   | ✅ Exists | Scaffolds 6 block files + breakpoint CSS partials + `component-models.json` entry                                                                                                                   |
| `/sync-models`        | `sync-models.md` | ❌ Create | Reads every `blocks/*/{name}.model.js`, extracts `CONTENT_MODEL`, diffs against `component-models.json`; prints mismatches; offers to patch                                                         |
| `/preview <path>`     | `preview.md`     | ❌ Create | Constructs `{branch}--{repo}--{owner}.aem.page/{path}` from current git branch; falls back to localhost if branch not pushed                                                                        |
| `/pagespeed <path>`   | `pagespeed.md`   | ❌ Create | Runs `@lhci/cli` against feature preview URL; prints scores; fails if any score < 100                                                                                                               |
| `/da-sync <block>`    | `da-sync.md`     | ❌ Create | Uses da-live-admin MCP (`da_list_sources`, `da_get_source`) to find authored pages using `<block>`; confirms they render without errors                                                             |
| `/block-check <name>` | `block-check.md` | ❌ Create | Validates: all 6 required files present; no `innerHTML` in JS; CSS selectors scoped to block name; `CONTENT_MODEL.id` matches block name; entry in `component-models.json`                          |
| `/axe-check <path>`   | `axe-check.md`   | ❌ Create | Loads `<path>` in Playwright headless; injects axe-core; prints violations by WCAG level and impact; exits 1 if any critical violations exist. Used by Senior QA before every environment sign-off. |
| `/run-e2e <block>`    | `run-e2e.md`     | ❌ Create | Runs `npx playwright test blocks/{block}/{block}.spec.js`; prints pass/fail; opens trace viewer on failure. For Junior QA verifying a single block fix.                                             |

### Reusable prompts (`.claude/prompts/`)

| Prompt                | Purpose                                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `block-review.md`     | Pre-PR checklist: runs `/block-check`, lint, unit tests, Playwright screenshot for named block                              |
| `release-gate.md`     | Release: diffs `develop` vs `main`, lists changed blocks, runs `/pagespeed` per path, prints go/no-go                       |
| `da-content-audit.md` | Uses da-live-admin MCP to list all authored pages; flags orphaned or misspelled block names                                 |
| `qa-sign-off.md`      | Environment sign-off: `/axe-check` on 3 representative pages + `/pagespeed` + spec results + structured pass/fail checklist |

### How to add a new command

1. Create `.claude/commands/{command-name}.md`
2. First line: one-sentence description (used as docstring)
3. Body: step-by-step instructions for an agent — reference tools by name (`Bash`, `Read`, `Edit`, da-live-admin MCP, etc.)
4. Register in `AGENTS.md` under a "Custom Commands" section

---

## Phase 9 — README.md Role-Specific Onboarding Guide

`README.md` is the project's front door. Every new team member must be able to self-onboard by reading it, regardless of when they join. It is written for **people**, not agents — plain language, no jargon without explanation.

### Audiences and what each section must cover

| Audience                             | Key content                                                                                                                                                                                                                                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Scrum Masters / Project Managers** | Sprint ceremony checklist; branch naming convention by sprint; PR lifecycle (open → review → merge); release calendar; environment promotion sequence (dev → qa → uat → prelive → prod); escalation path                                                                                    |
| **Product Owners**                   | da.live authoring workflow (create page → preview → publish); content model overview (block tables, what each field controls); preview URLs per environment; how to request a new block or component                                                                                        |
| **Business Analysts**                | How to write a block content model as a user story; acceptance criteria template for new blocks; mapping business requirements to da.live block tables; who reviews and approves the content model before dev starts                                                                        |
| **UX / UI Designers**                | Design token system (`styles/config/`); how Figma tokens map to `--color-*`, `--spacing-*`, `--font-size-*` CSS custom properties; breakpoint grid (632/760/992/1272/1432px); dark mode (semantic tokens, not per-component overrides); handoff checklist before a block enters development |
| **Content Authors**                  | da.live day-to-day workflow (open doc → edit block table → preview → publish); how to use the regen directive system (`{{regen:start;…}}`); block content model reference (what each cell does); how to raise a content-model change request                                                |
| **Architects / Tech Managers**       | Why EDS (no build step, CDN-first, Lighthouse 100); three-phase loading (eager/lazy/delayed); design token system; CSS cascade (`@layer` order); block convention; security posture (`metadata.xlsx`, CSP)                                                                                  |
| **Senior Frontend Developers**       | Full dev workflow (clone → `npm install` → `aem up` → localhost:3000); block file convention (6 files + breakpoint partials); `html` tagged-template; regen system; fragment-loader; model.js authoring; PR review responsibilities                                                         |
| **Junior Frontend Developers**       | Getting started in ≤5 steps; where to find block examples; CSS breakpoint partials; how to run tests; what to check before opening a PR; who to ask for help                                                                                                                                |
| **Senior QA**                        | Playwright setup (`npx playwright install`); spec file authoring guide; test data isolation rules; axe-core integration; environment sign-off criteria; visual regression baseline process                                                                                                  |
| **Junior QA**                        | Manual smoke testing checklist per environment; da.live content verification steps; bug filing template (URL + screenshot + steps + expected vs actual); browser matrix                                                                                                                     |
| **DevOps / Platform**                | GitHub Actions workflows (CI gate, release gate); branch protection rules setup; AEM Code Sync overview; Lighthouse CI (`budget.json`); no Docker in production (CI-only); `metadata.xlsx` header management                                                                                |

### README structure

```
# {Project Name}

## Quick Start (≤5 commands to a running localhost)

## Architecture Overview (2 paragraphs + diagram link)

## For Your Role
  - Scrum Master / Project Manager
  - Product Owner
  - Business Analyst
  - UX / UI Designer
  - Content Author
  - Architect / Tech Manager
  - Frontend Developer (Senior)
  - Frontend Developer (Junior)
  - QA Engineer (Senior)
  - QA Engineer (Junior)
  - DevOps / Platform

## Environment URLs

## Key Links (AGENTS.md, da.live, AEM docs, Figma, Jira/Linear)
```

### Rules

- Keep the Quick Start section ≤5 commands. A new developer must reach `localhost:3000` without reading anything else.
- Every role section must answer: "What do I do on day 1?", "What does done look like for me?", "Where do I go when blocked?"
- Environment URLs section must be generated from the `gh repo view` formula — never hardcoded.
- Update `README.md` whenever a phase is completed — it is a living document, not a one-time deliverable.

---

## Recommended Tooling & MCPs

| Tool / MCP                      | Purpose                                                                                                                       |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **da-live-admin MCP**           | Content model sync, authored page verification (`da_list_sources`, `da_get_source`, `da_lookup_fragment`, `da_create_source`) |
| **context7 MCP**                | Live AEM/EDS docs before writing EDS-specific code — always use even for well-known EDS patterns                              |
| **Playwright MCP**              | Headless browser testing, visual verification                                                                                 |
| **`/verify` skill**             | Confirm each phase works in a real browser                                                                                    |
| **`/run` skill**                | Start dev server                                                                                                              |
| **`/code-review` skill**        | Review diffs before pushing                                                                                                   |
| **`/security-review` skill**    | Verify no XSS surface (critical given `innerHTML` prohibition)                                                                |
| **`/new-block` skill**          | Scaffold all files for new blocks (exists ✅)                                                                                 |
| **Prettier**                    | Code formatting; configured ✅                                                                                                |
| **Lighthouse CI (`@lhci/cli`)** | PageSpeed gate in CI against feature preview URL                                                                              |
| **Playwright Docker**           | `mcr.microsoft.com/playwright:v1.52.0-noble` — pins browser versions in CI                                                    |

---

## Execution Order

```
Phase 1a  scripts/config/html.js                ← CREATE — unblocks everything; exact code above
Phase 1b  blocks/header/header.model.js         ← UPDATE — add CONTENT_MODEL export only
Phase 1c  ✅ DONE — header.js already imports header.model.js

Phase 2   scripts/config/utils.js               ← CREATE — port from reference; rename addLoader; fix getPlaceholder
          scripts/config/data-parser.js         ← CREATE — port pure JSON parse helpers
          scripts/scripts.js                    ← UPDATE — add html re-export
          eslint.config.js                      ← UPDATE — remove scripts.js + delayed.js from ignores
          scripts/delayed.js                    ← UPDATE — Lenis init (simple, not the reference delayed.js)

Phase 3   blocks/footer/footer.model.js         ← UPDATE — add CONTENT_MODEL; migrate to html``
          blocks/fragment/fragment.model.js     ← CREATE — CONTENT_MODEL + FRAGMENT_MARKUP
          blocks/fragment/fragment.css + styles/ ← CREATE — standard breakpoint partial structure
          blocks/footer/footer.test.js          ← UPDATE — replace jest.* with vi.*; fix loadFragment mock flow
          blocks/fragment/fragment.test.js      ← UPDATE — replace jest.* with vi.*; fix fetch + decorateMain mocks
          blocks/header/header.test.js          ← UPDATE — replace jest.* with vi.*; rewrite assertions to siteheader-* selectors

Phase 4   eslint.config.js                      ← UPDATE — add jsdoc + jsx-a11y plugins + peer deps
          playwright.config.js                  ← UPDATE — testMatch + Firefox/WebKit projects
          AGENTS.md                             ← UPDATE — model.js convention, regen system, fragment-loader, pre-push, adobe/skills ref
          styles/lazy-styles.css                ← UPDATE — print + selection + skip-link styles

Phase 5   Git strategy: configure main + develop protection in GitHub Settings
          Environment mapping: document in AGENTS.md

Phase 6   da.live sync verification (per block after model changes)
          /da-sync command for ongoing verification

Phase 7   .github/workflows/ci.yml              ← CREATE — comprehensive PR gate (replaces main.yaml lint-only)
          .github/workflows/release.yml         ← CREATE — develop → main promotion gate
          budget.json                           ← CREATE — LCP/CLS/INP/TBT targets
          GitHub branch protection rules for main + develop

Phase 8   .claude/settings.json                 ← UPDATE — add PostToolUse ESLint-fix hook
          .claude/commands/sync-models.md       ← CREATE
          .claude/commands/preview.md           ← CREATE
          .claude/commands/pagespeed.md         ← CREATE
          .claude/commands/da-sync.md           ← CREATE
          .claude/commands/block-check.md       ← CREATE
          .claude/commands/axe-check.md         ← CREATE (QA: WCAG audit)
          .claude/commands/run-e2e.md           ← CREATE (QA: single-block runner)
          .claude/prompts/block-review.md       ← CREATE
          .claude/prompts/release-gate.md       ← CREATE
          .claude/prompts/da-content-audit.md   ← CREATE
          .claude/prompts/qa-sign-off.md        ← CREATE (QA: environment sign-off)

Phase 9   README.md                             ← CREATE/OVERWRITE — role-specific onboarding guide
          Sections: Quick Start, Architecture Overview, per-role guide (8 roles),
          Environment URLs (formula-generated), Key Links

Already done (no action):
  ✅ .prettierrc.json + format/format:check scripts
  ✅ husky + lint-staged (.husky/pre-commit + package.json)
  ✅ .github/pull_request_template.md
  ✅ .github/workflows/cleanup-on-create.yaml
  ✅ .claude/commands/new-block.md
  ✅ develop branch exists on remote
  ✅ vitest.config.js (jsdom, globals, coverage)
  ✅ head.html (CSP, viewport, aem.js, scripts.js, styles.css)
```

---

## Suggested Improvements

| Area                                        | Recommendation                                                                                                                                                                                                                                                                                 |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Third-party JS**                          | Introduce plugins one at a time (Embla first, then others); gate each behind a feature flag comment in `delayed.js` so rollback is a one-line delete                                                                                                                                           |
| **Critical CSS**                            | Inline above-the-fold hero CSS into a `<style>` block in `head.html` to eliminate render-blocking and guarantee LCP < 2.5 s                                                                                                                                                                    |
| **Resource hints**                          | Add `<link rel="preconnect">` for external font origins and `<link rel="preload" as="image" fetchpriority="high">` for the LCP hero image (authored via meta tag)                                                                                                                              |
| **Image optimisation**                      | Enforce `width`/`height` on all `<img>` to prevent CLS; `loading="lazy"` on all below-fold images; `fetchpriority="high"` on the LCP image only                                                                                                                                                |
| **Performance budgets**                     | `budget.json` targets: LCP ≤ 2.5 s, CLS ≤ 0.1, INP ≤ 200 ms, TBT ≤ 200 ms. Add to CI `pagespeed` job so regressions break the build                                                                                                                                                            |
| **Content Security Policy + Anticlickjack** | Primary: configure in `metadata.xlsx` headers sheet (authoritative for CDN-served headers). `head.html` CSP `<meta>` is defence-in-depth. Add `X-Frame-Options: SAMEORIGIN` + `Content-Security-Policy: frame-ancestors 'self'` for anticlickjack. Use `.hlxignore` to block non-public paths. |
| **Container queries**                       | Prefer `@container` over viewport `@media` for block-internal layout; declare `container-type: inline-size` on the block root; allows blocks to reflow based on their own width                                                                                                                |
| **Fluid type scale**                        | `clamp()` already used in `config/typography.css` — **canonical rule**: no hard per-breakpoint `font-size` overrides in any block CSS; all heading sizes derive from `--font-size-*` tokens                                                                                                    |
| **SEO / Structured data**                   | Use `injectStructuredData(data, container)` from `scripts/config/utils.js` (Phase 2) for JSON-LD on article, product, FAQ pages. `robots.txt` and `sitemap.xml` managed in da.live — never committed                                                                                           |
| **Demo blocks (`_` prefix)**                | Design system showcase blocks (`_type-specimen`, `_grid-demo`, `_form-demo`, `_color-swatch`) follow the same 6-file structure but are blocked from production via `.hlxignore` or a path guard in `scripts.js`                                                                                |
| **Error resilience**                        | Every `decorate()` body wrapped in `try/catch`: `console.error(err)`; preserve authored HTML; `block.dataset.blockStatus = 'failed'` for QA triage                                                                                                                                             |
| **`drafts/` convention**                    | For local dev without a live CMS page, create static HTML in `drafts/` and start with `--html-folder drafts`. Files use AEM markup structure: `<div class="section"><div class="block-name block">…</div></div>`                                                                               |
| **Service Worker**                          | Workbox-lite SW for offline shell caching of `styles.css`, `aem.js`, `scripts.js`; register in `delayed.js`; stale-while-revalidate strategy                                                                                                                                                   |
| **Component slots**                         | Design blocks with optional slot fields (icon, badge, cta); handle absent cells with `?.` optional chaining                                                                                                                                                                                    |
| **Token-driven theming**                    | All brand customisation via `styles/config/overrides.css`; block-level token overrides on the block selector, never on `:root`                                                                                                                                                                 |
| **Shadcn parity**                           | Track https://ui.shadcn.com/docs/components; implement each as an EDS block; prioritise: accordion, tabs, dialog, tooltip, badge                                                                                                                                                               |

---

## Future Integrations Plan

All four integrations load exclusively in `delayed.js` (3 s post-LCP) to protect Lighthouse scores. None touch the eager or lazy phases.

| Integration              | Trigger            | Load strategy                                                                                                                                                                                                               | Notes                                                                                              |
| ------------------------ | ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Google GTM**           | `delayed.js`       | Inject `<script>` tag with GTM container ID from `window.adobeEdge.gtmId` or a `<meta>` tag; standard GTM snippet                                                                                                           | GTM must not load heavy tags synchronously — enforce via GTM trigger rules                         |
| **Adobe Launch / Tags**  | `delayed.js`       | Load Launch embed script (`//assets.adobedtm.com/…/launch-….min.js`) async                                                                                                                                                  | Adobe DTM classic is EOL — target Adobe Experience Platform Tags; confirm with client              |
| **Adobe Dynamic Media**  | Per-block, lazy    | No global script; blocks call DM Scene7 URL pattern directly (`https://{dm-server}/is/image/…?fmt=webp&wid=…`). Add `scripts/config/dynamic-media.js` helper that builds DM URLs from authored asset paths                  | EDS auto-optimises non-DM assets; DM only for complex renditions (spin sets, video, configurators) |
| **Adobe Asset Selector** | On-demand, delayed | Lazy-import `@adobe/asset-selector` only when a block needing it is on the page; requires Adobe IMS (`window.adobeIMS`). Add `scripts/config/asset-selector.js` bootstrap: IMS init + `openAssetSelector(config, callback)` | IMS client ID in `<meta name="ims-client-id">` in `head.html`; never hardcode in JS                |

**Prerequisites:**

| Integration          | What must exist first                                                               |
| -------------------- | ----------------------------------------------------------------------------------- |
| Google GTM           | GTM container ID in page metadata; `delayed.js` refactored to read config from meta |
| Adobe Launch/Tags    | Launch property in AEP Data Collection; embed URL from client                       |
| Adobe Dynamic Media  | DM account + Scene7 server URL; `dynamic-media.js` helper; block-by-block adoption  |
| Adobe Asset Selector | AEP IMS org + client ID; `asset-selector.js` bootstrap; IMS SDK loaded first        |

**Implementation order:** GTM (lowest risk) → Launch/Tags → Dynamic Media → Asset Selector (depends on IMS).

---

## AGENTS.md Alignment Confirmation

This plan is confirmed to be in-sync with the Adobe-provided `AGENTS.md` in the repository. Key alignment points:

| AGENTS.md requirement                                       | Plan coverage                                                           |
| ----------------------------------------------------------- | ----------------------------------------------------------------------- |
| EDS boilerplate base + `*.aem.live` backend                 | Site Goal & Technology section ✅                                       |
| Never modify `scripts/aem.js`                               | Golden rule — Architecture Standards ✅                                 |
| Block 6-file convention                                     | Block File Convention section + `/new-block` command ✅                 |
| Three-phase page loading (eager/lazy/delayed)               | Third-party JS loading strategy table ✅                                |
| `decorate(block)` 4-step pattern                            | `decorate()` function pattern section ✅                                |
| Mobile-first CSS, `min-width` breakpoints at 600/900/1200px | CSS standards section (our breakpoints align: 632/760/992/1272/1432) ✅ |
| `rem` primary unit, `em` for media queries                  | CSS standards section ✅                                                |
| Accessibility WCAG 2.1 AA                                   | Accessibility standard section ✅                                       |
| No `innerHTML`                                              | Golden rule + `html` tagged-template ✅                                 |
| ESLint Airbnb rules                                         | Phase 4 — `eslint.config.js` ✅                                         |
| `curl` inspection before block assumptions                  | Fragment-loading blocks section ✅                                      |
| `buildAutoBlocks` in `scripts.js`                           | `decorateMain` call order section ✅                                    |
| `drafts/` for local test content                            | Suggested Improvements ✅                                               |
| Publishing process + feature preview URLs                   | Environment strategy + Phase 7 CI ✅                                    |
| Adobe skills reference                                      | Phase 8 note + Recommended Tooling ✅                                   |

One deliberate extension beyond AGENTS.md:

- **CSS media query syntax**: AGENTS.md says `min-width` at 600/900/1200px. This plan uses modern `width >=` range syntax at 632/760/992/1272/1432px breakpoints (already implemented in `styles/config/`). This is a superset — the breakpoints are tighter and the syntax is current-spec.

---

## Verification Checklist

1. `npm run lint` → 0 errors (ESLint with jsdoc + jsx-a11y; Stylelint)
2. `npm run format:check` → 0 Prettier violations
3. `npm run test:unit` → all `.test.js` pass
4. `npm run test:e2e` → all `.spec.js` pass in chromium, firefox, webkit, mobile — requires `testMatch` update and browser projects update
5. Dev server → no console errors on page load
6. Dev server → header renders: megamenu works (keyboard + click); search toggle opens/closes; hamburger opens mobile nav
7. `document.documentElement.setAttribute('data-eds-theme','dark')` → all semantic tokens invert correctly
8. Scroll on a long page → Lenis smooth scroll active, no console errors
9. `main` branch has GitHub branch protection (require PR, require CI, no direct push)
10. `develop` branch is the default base for new branches ✅ (already exists)
11. PageSpeed Insights on `https://{branch}--{repo}--{owner}.aem.page/` → 100/100 mobile + desktop
12. axe DevTools → 0 critical WCAG 2.1/2.2 Level AA violations
13. da.live → open an authored page → block renders against updated `CONTENT_MODEL`
14. GitHub Actions `ci.yml` runs green on a test PR (lint + format:check + unit + e2e + PageSpeed)
15. Direct push to `main` and `develop` rejected by branch protection rules
16. `/block-check header` → passes: 6 files present; no `innerHTML`; CSS scoped; `CONTENT_MODEL.id === 'header'`; entry in `component-models.json`
17. `/sync-models` → 0 mismatches between `*.model.js` exports and `component-models.json`
18. `/pagespeed /` → 100/100 on feature preview URL
19. No third-party JS loaded via npm bundling — all plugins are UMD/CDN files in `scripts/vendor/` or CDN in `delayed.js`
20. All exported JS functions have JSDoc with `@param` and `@returns` (`npm run lint` passes with `eslint-plugin-jsdoc`)
21. `{{regen:start;element:alert;theme:danger}}Test{{regen:end}}` on a draft page → renders `<div class="alert alert--danger">Test</div>`
22. `fetchFragmentHtml` used in every fragment-loading block — no three-line meta/load/outerHTML boilerplate in block code
23. Edit a `.js` block file via Claude → auto-formatted by Prettier AND ESLint-fixed (both PostToolUse hooks fire)
24. `git commit` with a lint error in a staged `.js` file → commit blocked by husky; `eslint --fix` auto-amends the staged file ✅
25. `npx playwright install` run once per dev/QA machine — Chromium, Firefox, WebKit all present
26. `npm run test:unit:watch` → Vitest re-runs on file save
27. `/axe-check /` → 0 critical axe violations; output grouped by WCAG level; Senior QA reviews before every qa/uat sign-off
28. `/run-e2e header` → only `header.spec.js` runs; pass/fail matches full suite
29. Each `.spec.js` sets local `<meta name="nav">` + `<meta name="footer">` — all tests pass with no internet (full data isolation)
30. `data-block-status="failed"` appears on a block when `decorate()` throws; original authored HTML preserved; no blank sections
31. `budget.json` present; CI `pagespeed` job fails if LCP > 2.5 s, CLS > 0.1, or INP > 200 ms
32. `tests/fragments/` is empty before every commit (no `*-fragment-outerhtml.html` committed)
    32a. `metadata.xlsx` headers sheet contains `X-Frame-Options: SAMEORIGIN` and `Content-Security-Policy: frame-ancestors 'self'` — anticlickjack verified on preview URL (`curl -I https://{branch}--{repo}--{owner}.aem.page/` shows both headers)
    32b. `/security-review` passes — 0 `innerHTML` usage, 0 unencoded user-controlled values in HTML attributes
33. `eslint.config.js` `ignores` contains only `scripts/aem.js` and `scripts/vendor/**` (not `scripts/scripts.js` or `scripts/delayed.js`) after Phase 2
34. `scripts/scripts.js` exports `html` — blocks can `import { html } from '../../scripts/scripts.js'`
35. `blocks/fragment/` has all 6 required files (`.js`, `.css`, `.model.js`, `.test.js`, `.spec.js`, `.md`) and `styles/` subdirectory
36. `blocks/header/header.model.js` and `blocks/footer/footer.model.js` both export `CONTENT_MODEL` with correct `id` values
37. `README.md` exists and covers all 11 role sections (Scrum Master, PO, BA, UX Designer, Content Author, Architect, Senior FE Dev, Junior FE Dev, Senior QA, Junior QA, DevOps); Quick Start reaches `localhost:3000` in ≤5 commands; environment URLs section uses the `gh repo view` formula (no hardcoded URLs)
