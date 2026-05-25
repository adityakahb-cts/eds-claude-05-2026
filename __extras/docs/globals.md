# Global Scripts and Styles Guide

Reference for extending `scripts/scripts.js`, `styles/styles.css`, `styles/lazy-styles.css`, `styles/fonts.css`, and `scripts/delayed.js`.

## The Golden Rule: Never Touch aem.js

`scripts/aem.js` is an upstream library managed by Adobe. **Do not modify it.** All project customization goes in `scripts/scripts.js`. When `aem.js` exports a function you need, import it — do not copy or re-implement it.

---

## scripts/scripts.js

This is the main entry point for all page decoration. It imports utilities from `aem.js`, defines project-specific decoration logic, and orchestrates the three-phase load sequence.

Every function added to `scripts.js` must be documented with a JSDoc block. Exported functions require `@param` and `@returns` tags; internal helpers require at minimum a description. Follow the same standard described in `docs/blocks.md` → _Comments and JSDoc_.

### Extension Points

#### `buildAutoBlocks(main)`

Add new auto-blocking patterns here. Auto-blocking converts implicit content patterns into explicit blocks without requiring authors to use the block table syntax.

The existing patterns are:

1. **Fragment links** — any `<a href*="/fragments/">` not already inside a `.fragment` block is loaded as a fragment.
2. **Hero block** — an `<h1>` preceded by a `<picture>` at the top of the page is wrapped into a `hero` block.

To add a new auto-block pattern:

```js
function buildAutoBlocks(main) {
  try {
    // existing patterns ...

    // new pattern: wrap every standalone <video> in a video block
    main.querySelectorAll('p > video:only-child').forEach((video) => {
      const section = video.closest('div');
      section.replaceWith(buildBlock('video', { elems: [video] }));
    });

    buildHeroBlock(main);
  } catch (error) {
    console.error('Auto Blocking failed', error);
  }
}
```

Always wrap new patterns in the existing try/catch — a broken auto-block must not crash the whole page.

#### `decorateMain(main)`

Called once per page load (and once per fragment load). Runs the full decoration pass in order:

```js
export function decorateMain(main) {
  decorateButtons(main); // wraps lonely links as .button
  decorateIcons(main); // converts :icon-name: spans to <img>
  buildAutoBlocks(main); // builds synthetic blocks
  decorateSections(main); // wraps content in .section divs
  decorateBlocks(main); // sets block class names and data-attrs
}
```

To add a new global decoration pass, insert a function call here. Functions added before `decorateSections` operate on the raw authored DOM; functions after `decorateBlocks` operate on the fully wrapped structure.

### Three-Phase Load Order

The load sequence is optimized for Core Web Vitals. Placing code in the wrong phase will hurt performance scores.

#### Phase 1 — `loadEager(doc)`

**Goal:** reach Largest Contentful Paint (LCP) as fast as possible.

What runs here:

- `decorateTemplateAndTheme()` — applies template/theme body classes from metadata
- `decorateMain(main)` — full decoration pass
- `loadSection(firstSection, waitForFirstImage)` — loads only the first section (LCP content)
- Font pre-loading on desktop (fast connection proxy)

**Only add code here if it is required to render the above-the-fold content.** Every millisecond in this phase delays LCP.

#### Phase 2 — `loadLazy(doc)`

**Goal:** load everything else without blocking the initial render.

What runs here:

- `loadHeader` and `loadFooter` — nav and footer fragments
- `loadSections(main)` — all remaining sections and their blocks
- Deep-link scroll (`window.location.hash`)
- `lazy-styles.css` — post-LCP global styles
- Font loading (for mobile, which skipped eager fonts)

Add non-critical features, supplementary blocks, and post-LCP CSS here.

#### Phase 3 — `loadDelayed()`

**Goal:** load martech, analytics, and anything that would hurt performance if loaded earlier.

```js
function loadDelayed() {
  window.setTimeout(() => import('./delayed.js'), 3000);
}
```

Runs 3 seconds after `loadLazy` completes. Add third-party scripts, A/B testing, chat widgets, and similar to `scripts/delayed.js`.

### `loadFonts()`

Loads `styles/fonts.css` and sets a `fonts-loaded` flag in `sessionStorage` so subsequent page views on the same session can load fonts eagerly without a layout shift:

```js
async function loadFonts() {
  await loadCSS(`${window.hlx.codeBasePath}/styles/fonts.css`);
  try {
    if (!window.location.hostname.includes('localhost')) {
      sessionStorage.setItem('fonts-loaded', 'true');
    }
  } catch (e) {
    /* storage unavailable */
  }
}
```

Do not load fonts anywhere else. The `localhost` guard prevents sessionStorage from masking flash-of-unstyled-text during development.

---

## Spawn Directives (`scripts/config/global-decorators.js`)

Spawn directives let authors embed declarative markup instructions directly in page content. `decorateSpawnElements(main)` — called from `decorateMain` — finds every `{{spawn:start;...}} … {{spawn:end}}` pair and replaces the enclosed content with the specified element.

### Syntax

```
{{spawn:start;element:<type>;<key>:<value>;…}}
  [authored content between markers]
{{spawn:end}}
```

**CSS keys** (`element`, `theme`, `style`, `size`, `radius`, `level`, `author`, `source`) drive class/tag logic and are never set as HTML attributes. All other keys are applied as HTML attributes verbatim (`href`, `alt`, `width`, `target`, `aria-label`, etc.).

### Supported elements

#### `element:anchor`

Enhances an existing `<a>` in place, or creates a new one if none is found. Receives the full `.btn` class system.

```
{{spawn:start;element:anchor;theme:primary;style:solid;size:large;target:blank;title:"Go"}}
Link Text
{{spawn:end}}
```

| Param      | Values                                                                           | Effect                              |
| ---------- | -------------------------------------------------------------------------------- | ----------------------------------- |
| `theme`    | `primary` · `secondary` · `tertiary` · `danger` · `success` · `info` · `warning` | Adds `.btn--{theme}`                |
| `style`    | `solid` (default, no class) · `outlined`                                         | Adds `.btn--outlined`               |
| `size`     | `small`/`sm` · `medium`/`md` (default) · `large`/`lg` · `extra-large`/`xl`       | Adds `.btn--{size}`                 |
| `radius`   | `normal` (default) · `pilled`                                                    | Adds `.btn--pilled` (capsule shape) |
| All others | any string                                                                       | Set as HTML attribute               |

#### `element:button`

Always produces a `<button type="button">`. Same `theme`/`style`/`size`/`radius` class system as `anchor`.

```
{{spawn:start;element:button;theme:danger;style:outlined;radius:pilled;aria-label:"Remove item"}}
Delete
{{spawn:end}}
```

#### `element:image`

Produces an `<img>`. Place an `<a>` between the markers — its `href` becomes the `img src`. If the anchor has a `target` the image is wrapped in a link.

```
{{spawn:start;element:image;alt:"Hero image";width:1200;height:600;loading:lazy}}
<a href="/media/hero.jpg" target="_blank">Hero</a>
{{spawn:end}}
```

| Param                                  | Effect                                                                   |
| -------------------------------------- | ------------------------------------------------------------------------ |
| `alt`, `width`, `height`, `loading`, … | Set as `<img>` attributes                                                |
| Anchor `href`                          | Becomes `img.src` (and `a.href` when target is present)                  |
| Anchor `target`                        | Wraps the image in `<a href target>`                                     |
| `radius`                               | `normal` (default) · `pilled` → adds `.img--pilled` (pill border-radius) |

#### `element:paragraph`

Produces a `<p>`. `style` generates a BEM modifier class.

```
{{spawn:start;element:paragraph;style:intro}}
Introductory copy that renders larger than body text.
{{spawn:end}}
```

| `style` value | Class added         | Visual result                                    |
| ------------- | ------------------- | ------------------------------------------------ |
| `intro`       | `.paragraph--intro` | `--font-size-intro`, weight 300, line-height 1.5 |
| _(absent)_    | —                   | Default `<p>` styling                            |

#### `element:blockquote`

Produces a `<blockquote>`. `author` and `source` generate a `<footer>` with `<cite>` and `.blockquote__source`.

```
{{spawn:start;element:blockquote;author:"Jane Austen";source:"Pride and Prejudice"}}
<p>It is a truth universally acknowledged…</p>
{{spawn:end}}
```

Output:

```html
<blockquote>
  <p>It is a truth universally acknowledged…</p>
  <footer>— <cite>Jane Austen</cite>, <span class="blockquote__source">Pride and Prejudice</span></footer>
</blockquote>
```

| Param    | Effect                                           |
| -------- | ------------------------------------------------ |
| `author` | Creates `<cite>` in `<footer>`                   |
| `source` | Creates `.blockquote__source` span in `<footer>` |

Both `author` and `source` are optional. Omitting both suppresses the `<footer>` entirely.

#### `element:heading`

Produces `<h1>`–`<h6>` via `level` (default `h2`). `style` adds a display-scale class for oversized hero headings.

```
{{spawn:start;element:heading;level:1;style:display1}}Page Title{{spawn:end}}

{{spawn:start;element:heading;level:2}}Section Title{{spawn:end}}
```

| Param      | Values                | Effect                                                     |
| ---------- | --------------------- | ---------------------------------------------------------- |
| `level`    | `1`–`6` (default `2`) | Determines the tag (`h1`–`h6`)                             |
| `style`    | `display1`–`display6` | Adds `.heading--display{n}` for fluid display-scale sizing |
| All others | any string            | Set as HTML attribute                                      |

Display scale (fluid, matches `--font-size-display*` tokens):

| `style`    | Class                | Min (632 px) | Max (1432 px) |
| ---------- | -------------------- | ------------ | ------------- |
| `display1` | `.heading--display1` | 32 px        | 52 px         |
| `display2` | `.heading--display2` | 30 px        | 48 px         |
| `display3` | `.heading--display3` | 28 px        | 44 px         |
| `display4` | `.heading--display4` | 26 px        | 40 px         |
| `display5` | `.heading--display5` | 24 px        | 36 px         |
| `display6` | `.heading--display6` | 22 px        | 32 px         |

#### `element:badge`

Produces an inline `<span class="badge">`. Follows the same `theme`/`style` pattern as `.btn`.

```
{{spawn:start;element:badge;theme:success}}New{{spawn:end}}

{{spawn:start;element:badge;theme:warning;style:outlined}}Beta{{spawn:end}}
```

| Param      | Values                                                                           | Effect                                       |
| ---------- | -------------------------------------------------------------------------------- | -------------------------------------------- |
| `theme`    | `primary` · `secondary` · `tertiary` · `danger` · `success` · `info` · `warning` | Adds `.badge--{theme}`                       |
| `style`    | `solid` (default) · `outlined`                                                   | Adds `.badge--outlined`                      |
| `radius`   | `normal` (default, `border-radius-m`) · `pilled`                                 | Adds `.badge--pilled` (`border-radius-pill`) |
| All others | any string                                                                       | Set as HTML attribute                        |

#### `element:alert`

Produces a `<div class="alert">` with a coloured left border and subtle tinted background. Add `role:alert` for live-region announcements.

```
{{spawn:start;element:alert;theme:warning;role:alert}}
<p>Your session will expire in 5 minutes.</p>
{{spawn:end}}

{{spawn:start;element:alert;theme:success}}Changes saved.{{spawn:end}}
```

| Param      | Values                                                                           | Effect                                                             |
| ---------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `theme`    | `primary` · `secondary` · `tertiary` · `danger` · `success` · `info` · `warning` | Sets border and background colour                                  |
| `radius`   | `normal` (default, `border-radius-m`) · `pilled`                                 | Adds `.alert--pilled`; collapses the accent border to uniform 1 px |
| `role`     | `alert` · `status`                                                               | Set as HTML attribute for ARIA live region                         |
| All others | any string                                                                       | Set as HTML attribute                                              |

#### `element:divider`

Produces an `<hr>`. No content between the markers is required.

```
{{spawn:start;element:divider}}{{spawn:end}}
```

### Adding a new element type

1. Add a new `else if (element === '<type>')` branch in `applySpawnDirective` in `scripts/config/global-decorators.js`.
2. If the element uses special params that must not become HTML attributes, add those key names to `SPAWN_CSS_KEYS`.
3. Add supporting CSS to `styles/config/typography.css` (text/layout elements), `styles/config/buttons.css` (inline components), or `styles/config/globals.css` (block components).
4. Document the new element in this section.

---

## styles/styles.css

Loaded in the `<head>` — part of the critical path. Keep it minimal. Only styles required before LCP belong here.

`styles.css` contains three things only:

1. A `@layer` order declaration.
2. `@import` statements loading the six config partials from `styles/config/`.
3. The `:root` block with all design tokens.

### Mobile-First Architecture

This is a **mobile-first** project. All base styles target the smallest viewport (`< 632px`). Larger-screen styles are layered on top using `min-width` (`width >=`) media queries at the project's five breakpoints. Never use `max-width` queries.

### Breakpoints

| Token              | Literal value | Alias |
| ------------------ | ------------- | ----- |
| `--breakpoint-sm`  | `632px`       | sm    |
| `--breakpoint-md`  | `760px`       | md    |
| `--breakpoint-lg`  | `992px`       | lg    |
| `--breakpoint-xl`  | `1272px`      | xl    |
| `--breakpoint-xxl` | `1432px`      | xxl   |

CSS custom properties cannot appear inside `@media` conditions. Always write the literal `px` value. The `--breakpoint-*` tokens exist for JavaScript use only.

### Config Partials

| File                           | Layer       | Contents                                                                                                    |
| ------------------------------ | ----------- | ----------------------------------------------------------------------------------------------------------- |
| `styles/config/normalize.css`  | `reset`     | Modern CSS reset, `box-sizing`, `interpolate-size`                                                          |
| `styles/config/colors.css`     | `base`      | Raw color palette — `--color-{hue}-{0…900}` for all eight hues                                              |
| `styles/config/themes.css`     | `base`      | Semantic tokens for light and dark mode (`--color-primary`, `--color-danger`, …)                            |
| `styles/config/typography.css` | `base`      | Links, headings, body text, code, blockquote, tables                                                        |
| `styles/config/grid.css`       | `layout`    | `.container`, `.row`/`.col` flex grid, `.grid` CSS Grid, responsive column classes                          |
| `styles/config/forms.css`      | `base`      | Input, textarea, select, checkbox, radio, validation states                                                 |
| `styles/config/globals.css`    | `base`      | `body`, header/footer chrome, images, icons, `.button`, sections                                            |
| `styles/config/utilities.css`  | `utilities` | Display, flexbox, gap, spacing, text, position, z-index, border, animation                                  |
| `styles/config/buttons.css`    | `utilities` | `.btn` component system + semantic border-colour, per-side radius, and focus-ring utilities                 |
| `styles/config/overrides.css`  | `overrides` | **Project-level token overrides** — the correct place to customise any `:root` design token for the project |

### CSS Custom Properties

All design tokens are defined on `:root` in `styles.css`. Tokens never change at a breakpoint — responsive sizing is achieved with fluid `clamp()` values.

#### Color Architecture

The color system is split across four files:

1. **`styles/config/colors.css`** — raw palette: `--color-{hue}-{shade}` for 10 shades (0, 100–900) across eight hues. Never use these directly in components.
2. **`styles/config/themes.css`** — semantic tokens: maps palette shades to purpose-based names for light mode (`:root`) and dark mode (`@media (prefers-color-scheme: dark)` + `[data-eds-theme]` attribute). Use these in all new code.
3. **`styles/styles.css` `:root`** — legacy bridge tokens (e.g. `--link-color`, `--background-color`) now delegate to the semantic tokens for backwards compatibility.
4. **`styles/config/overrides.css`** — the single place for project-level token overrides. Because it is imported into the `overrides` cascade layer (the last layer declared in `styles.css`), any property defined here wins over all other layers without needing `!important`. New developers should start here when customising the project's design tokens.

#### Palette — `--color-{hue}-{shade}`

Eight hues, each with eleven shades. All values use `oklch()` for perceptual uniformity. Contrast ratios noted are against white (`--color-neutral-0`).

| Hue     | Palette name        | Semantic role                   | Hue angle         |
| ------- | ------------------- | ------------------------------- | ----------------- |
| Neutral | `--color-neutral-*` | page backgrounds, text, borders | `252` (cool gray) |
| Blue    | `--color-blue-*`    | primary                         | `252`             |
| Violet  | `--color-violet-*`  | secondary                       | `288`             |
| Teal    | `--color-teal-*`    | tertiary                        | `194`             |
| Red     | `--color-red-*`     | danger                          | `24`              |
| Green   | `--color-green-*`   | success                         | `142`             |
| Sky     | `--color-sky-*`     | info                            | `221`             |
| Amber   | `--color-amber-*`   | warning                         | `83`              |

Shade thresholds (against white):

| Shade | Approx. contrast on white | WCAG threshold met                    |
| ----- | ------------------------- | ------------------------------------- |
| `0`   | 1.0:1                     | —                                     |
| `100` | ~1.1:1                    | —                                     |
| `200` | ~1.4:1                    | —                                     |
| `300` | ~2.2:1                    | —                                     |
| `400` | ~3.1:1                    | ✓ AA non-text (UI components, 1.4.11) |
| `500` | ~4.6:1                    | ✓ AA normal text (1.4.3)              |
| `600` | ~6.9:1                    | ✓ AA normal text                      |
| `700` | ~10.9:1                   | ✓ AA + AAA normal text                |
| `800` | ~18:1                     | ✓ AAA                                 |
| `900` | ≥19:1                     | ✓ AAA                                 |

> **Amber exception.** Yellow is inherently high-luminance. `--color-amber-600` reaches only ~3.3:1 against white (non-text AA). Use `--color-amber-700` or darker for text on a white background. Filled warning UI must use `--color-neutral-900` (dark) text on amber backgrounds.

#### Semantic Tokens — Light Mode (default)

Each semantic state exposes seven tokens. Use these in all component and block styles.

| Token pattern            | Purpose                                     | WCAG criterion                         |
| ------------------------ | ------------------------------------------- | -------------------------------------- |
| `--color-{state}`        | Filled background (buttons, badges, alerts) | 1.4.11 ≥3:1 on page bg                 |
| `--color-{state}-hover`  | Hover background                            | 1.4.11 ≥3:1 on page bg                 |
| `--color-{state}-active` | Pressed/active background                   | 1.4.11 ≥3:1 on page bg                 |
| `--color-{state}-text`   | Text on filled background                   | 1.4.3 ≥4.5:1 against `--color-{state}` |
| `--color-{state}-subtle` | Tinted page-area background (alert, chip)   | —                                      |
| `--color-{state}-border` | Border for outlined / ghost variants        | 1.4.11 ≥3:1 on page bg                 |
| `--color-{state}-focus`  | Focus-ring colour                           | 2.4.11 / 2.4.13 ≥3:1 on page bg        |

Available states: `primary` · `secondary` · `tertiary` · `danger` · `success` · `info` · `warning`

Surface tokens:

| Token                | Light mode          | Dark mode     |
| -------------------- | ------------------- | ------------- |
| `--color-page-bg`    | `neutral-0` (white) | `neutral-900` |
| `--color-surface`    | `neutral-100`       | `neutral-800` |
| `--color-surface-2`  | `neutral-200`       | `neutral-700` |
| `--color-border`     | `neutral-300`       | `neutral-700` |
| `--color-text`       | `neutral-900`       | `neutral-100` |
| `--color-text-muted` | `neutral-600`       | `neutral-400` |

#### Dark Mode

Dark mode activates automatically via `@media (prefers-color-scheme: dark)`. Use the `data-eds-theme` attribute on `<html>` to override the OS preference programmatically:

```js
// Force dark mode
document.documentElement.setAttribute('data-eds-theme', 'dark');

// Force light mode (even when OS prefers dark)
document.documentElement.setAttribute('data-eds-theme', 'light');

// Follow OS preference
document.documentElement.removeAttribute('data-eds-theme');
```

| `data-eds-theme` value | Effect                                         |
| ---------------------- | ---------------------------------------------- |
| `"dark"`               | Forces dark tokens regardless of OS preference |
| `"light"`              | Forces light tokens even when OS prefers dark  |
| _(absent)_             | Follows `prefers-color-scheme` automatically   |

In dark mode, semantic tokens shift to lighter palette shades so interactive elements remain legible against the dark page background:

| State     | Light `--color-{state}` | Dark `--color-{state}` |
| --------- | ----------------------- | ---------------------- |
| primary   | `blue-600`              | `blue-300`             |
| secondary | `violet-600`            | `violet-300`           |
| tertiary  | `teal-600`              | `teal-300`             |
| danger    | `red-600`               | `red-300`              |
| success   | `green-600`             | `green-300`            |
| info      | `sky-600`               | `sky-300`              |
| warning   | `amber-600`             | `amber-400`            |

#### Legacy Bridge Tokens

These exist in `styles/styles.css` `:root` for backwards compatibility with existing blocks. They delegate to the semantic tokens and automatically adapt to dark mode.

| Legacy token           | Resolves to                  |
| ---------------------- | ---------------------------- |
| `--background-color`   | `var(--color-page-bg)`       |
| `--surface-color`      | `var(--color-surface)`       |
| `--light-color`        | `var(--color-surface)`       |
| `--dark-color`         | `var(--color-neutral-700)`   |
| `--text-color`         | `var(--color-text)`          |
| `--muted-color`        | `var(--color-text-muted)`    |
| `--border-color`       | `var(--color-border)`        |
| `--link-color`         | `var(--color-primary)`       |
| `--link-hover-color`   | `var(--color-primary-hover)` |
| `--accent-color`       | `var(--color-primary)`       |
| `--accent-hover-color` | `var(--color-primary-hover)` |

**Do not add new properties to the legacy bridge.** New code should use `--color-{state}` tokens directly.

#### Adding or Extending Colors

- **New palette shade** — add a `--color-{hue}-{shade}` property to `styles/config/colors.css`.
- **New semantic state** — add a full set of seven tokens to both the `:root` (light) block and both dark-mode blocks in `styles/config/themes.css`.
- **Project-wide token override** — put it in `styles/config/overrides.css`, which sits in the `overrides` cascade layer and wins over everything else. Always update both the light `:root` block and the two dark-mode blocks (`@media` + `[data-eds-theme="dark"]`) when overriding semantic color tokens:

```css
/* styles/config/overrides.css — intentional project-wide brand change */
:root {
  --color-primary: var(--color-violet-600);
  --color-primary-hover: var(--color-violet-700);
  --color-primary-active: var(--color-violet-800);
  --color-primary-text: var(--color-neutral-0);
  --color-primary-subtle: var(--color-violet-100);
  --color-primary-border: var(--color-violet-400);
  --color-primary-focus: var(--color-violet-700);
}
```

- **Block-level token override** — scope the override to the block selector, not to `:root`. This keeps the change isolated to that one component:

```css
/* Good — scoped to one block */
.my-block {
  --color-primary: var(--color-teal-600);
}

/* Bad — putting a block-specific value in :root leaks it everywhere */
:root {
  --color-primary: var(--color-teal-600);
}
```

#### Typography — Families

| Property                | Value                                                                  | Weights available             |
| ----------------------- | ---------------------------------------------------------------------- | ----------------------------- |
| `--body-font-family`    | `noto-sans, noto-sans-fallback, sans-serif`                            | 300, 400, 500, 700 (+ italic) |
| `--heading-font-family` | `noto-serif, noto-serif-fallback, serif`                               | 300, 400, 500, 700 (+ italic) |
| `--mono-font-family`    | `google-sans-code, google-sans-code-fallback, ui-monospace, monospace` | 300, 400, 500, 700 (+ italic) |

Font files live in `fonts/{noto-sans,noto-serif,google-code}/`. Fallback `@font-face` declarations (with `size-adjust` to minimise CLS) are defined at the bottom of `styles/styles.css` and use `local('Arial')`, `local('Georgia')`, and `local('Courier New')` respectively. The full `@font-face` rules (with `font-display: swap`) live in `styles/fonts.css`, loaded by `loadFonts()` in `scripts/scripts.js`.

#### Typography — Fluid Type Scale

All size tokens use `clamp(min, preferred, max)`. The minimum applies at `632px` (sm) and the maximum at `1432px` (xxl). Values scale linearly between those two points — no breakpoint overrides needed.

| Token                  | Min (632px)       | Max (1432px)     |
| ---------------------- | ----------------- | ---------------- |
| `--font-size-display1` | `2rem / 32px`     | `3.25rem / 52px` |
| `--font-size-display2` | `1.875rem / 30px` | `3rem / 48px`    |
| `--font-size-display3` | `1.75rem / 28px`  | `2.75rem / 44px` |
| `--font-size-display4` | `1.625rem / 26px` | `2.5rem / 40px`  |
| `--font-size-display5` | `1.5rem / 24px`   | `2.25rem / 36px` |
| `--font-size-display6` | `1.375rem / 22px` | `2rem / 32px`    |
| `--font-size-h1`       | `1.75rem / 28px`  | `3rem / 48px`    |
| `--font-size-h2`       | `1.625rem / 26px` | `2.5rem / 40px`  |
| `--font-size-h3`       | `1.5rem / 24px`   | `2.25rem / 36px` |
| `--font-size-h4`       | `1.375rem / 22px` | `2rem / 32px`    |
| `--font-size-h5`       | `1.25rem / 20px`  | `1.75rem / 28px` |
| `--font-size-h6`       | `1.125rem / 18px` | `1.5rem / 24px`  |
| `--font-size-intro`    | `1.25rem / 20px`  | `1.75rem / 28px` |
| `--font-size-p`        | `1rem / 16px`     | `1.25rem / 20px` |
| `--font-size-small`    | `0.875rem / 14px` | `1rem / 16px`    |

#### Spacing

| Token         | Value           |
| ------------- | --------------- |
| `--spacing-1` | `0.25rem` (4px) |
| `--spacing-2` | `0.5rem` (8px)  |
| `--spacing-3` | `1rem` (16px)   |
| `--spacing-4` | `1.5rem` (24px) |
| `--spacing-5` | `3rem` (48px)   |

#### Border Radius

| Token                    | Value     |
| ------------------------ | --------- |
| `--border-radius-s`      | `0.25rem` |
| `--border-radius-m`      | `0.5rem`  |
| `--border-radius-l`      | `1rem`    |
| `--border-radius-pill`   | `50rem`   |
| `--border-radius-circle` | `50%`     |

#### Shadows

| Token        | Value                  |
| ------------ | ---------------------- |
| `--shadow-s` | subtle 1px/2px shadow  |
| `--shadow-m` | medium 4px/6px shadow  |
| `--shadow-l` | large 10px/15px shadow |

#### Z-index Scale

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

#### Transitions

| Token                | Value        |
| -------------------- | ------------ |
| `--transition-speed` | `200ms`      |
| `--transition-ease`  | `ease`       |
| `--transition-base`  | `200ms ease` |

#### Layout

| Token                 | Value             |
| --------------------- | ----------------- |
| `--nav-height`        | `64px`            |
| `--max-width`         | `120rem` (1920px) |
| `--grid-columns`      | `12`              |
| `--grid-gutter-width` | `3rem` (48px)     |

### Adding New Custom Properties

Add new tokens to the `:root` block in `styles.css`. Follow the naming convention `--{category}-{qualifier}` (e.g. `--spacing-xl`, `--border-radius-m`).

**Do not add breakpoint-specific overrides.** The design token system uses fluid `clamp()` values for type sizes and static values for everything else. If a value must differ across viewports, use a fluid expression directly in the token value rather than repeating the token at each breakpoint.

### Section System

The framework wraps each section of authored content in nested divs:

```html
<main>
  <div class="section">
    <!-- section wrapper -->
    <div>
      <!-- content wrapper (max-width container) -->
      <!-- authored content, blocks -->
    </div>
  </div>
</main>
```

The content wrapper (`main > .section > div`) has a maximum width of `1200px`, is horizontally centered, and has horizontal padding (`24px` mobile, `32px` at `992px` and up). Do not override these rules inside blocks — blocks that need full-bleed layouts should use negative margins or the section wrapper instead.

### Section Metadata Styles

Authors can apply visual variants to sections by adding a section metadata table at the bottom of the section. The framework adds the metadata value as a class on the `.section` element.

Built-in section variants:

| Class        | Effect                                                                             |
| ------------ | ---------------------------------------------------------------------------------- |
| `.light`     | `background-color: var(--light-color)`, removes vertical margin, adds 40px padding |
| `.highlight` | Same as `.light` — alias for the same treatment                                    |

To add a new section variant, add a rule in `styles.css`:

```css
main .section.dark {
  background-color: var(--dark-color);
  color: var(--background-color);
  margin: 0;
  padding: 40px 0;
}
```

---

## styles/lazy-styles.css

Loaded during `loadLazy` — after the page is visually complete. Safe for:

- Below-the-fold layout styles
- Animation and transition definitions
- Non-critical typographic refinements
- Print styles

Do **not** put anything here that affects above-the-fold content. A style added here that shifts the layout after LCP will hurt Cumulative Layout Shift (CLS).

---

## styles/fonts.css

Loaded by `loadFonts()` — at most once per session after the session flag is set. Defines `@font-face` rules and fallback metrics.

### Adding a New Font

1. Place the font file (woff2 preferred) in the `fonts/` directory.
2. Add an `@font-face` rule in `fonts.css`:

```css
@font-face {
  font-family: my-font;
  font-weight: 400;
  font-style: normal;
  font-display: swap;
  src: url('../fonts/my-font-400.woff2') format('woff2');
}
```

3. Add a fallback `@font-face` with `size-adjust` to minimize layout shift during font swap:

```css
@font-face {
  font-family: my-font-fallback;
  size-adjust: 100%; /* tune until layout shift is minimal */
  src: local('Arial');
}
```

4. Override the relevant token in `styles/config/overrides.css` (the `overrides` layer wins without `!important`):

```css
:root {
  --body-font-family: my-font, my-font-fallback, sans-serif;
}
```

The `size-adjust` value should be calibrated so the fallback font occupies the same line widths as the web font, eliminating reflow when the font loads. Tune it by comparing the layout with and without the web font loaded.

---

## scripts/delayed.js

Runs 3 seconds after the page loads. Import and initialize third-party scripts here:

```js
// scripts/delayed.js

// analytics
import('./vendor/analytics.js').then(({ default: init }) => init());

// cookie consent
if (!document.cookie.includes('consent=accepted')) {
  import('./vendor/consent.js');
}
```

Keep this file focused. Do not load anything here that is required for the page to function correctly — it may never run if the user navigates away within 3 seconds.

---

## aem.js API Reference

These are the utilities exported from `scripts/aem.js` available for use in `scripts/scripts.js` and blocks:

| Function                   | Signature                        | Description                                                                 |
| -------------------------- | -------------------------------- | --------------------------------------------------------------------------- |
| `buildBlock`               | `(blockName, content)`           | Creates a block DOM element from string/array/object content                |
| `createOptimizedPicture`   | `(src, alt, eager, breakpoints)` | Creates a `<picture>` with webp sources                                     |
| `decorateBlock`            | `(block)`                        | Sets block classes and `data-block-name` / `data-block-status`              |
| `decorateBlocks`           | `(main)`                         | Runs `decorateBlock` on all blocks in the container                         |
| `decorateButtons`          | `(element)`                      | Upgrades lone anchor tags in paragraphs to `.button` links                  |
| `decorateIcons`            | `(element, prefix?)`             | Replaces `:icon-name:` spans with `<img>` tags from `icons/`                |
| `decorateSections`         | `(main)`                         | Wraps authored content in `.section` divs, processes section metadata       |
| `decorateTemplateAndTheme` | `()`                             | Applies template/theme metadata values as body classes                      |
| `getMetadata`              | `(name, doc?)`                   | Returns the content of a `<meta name="...">` or `<meta property="...">` tag |
| `loadBlock`                | `(block)`                        | Loads and executes a block's JS and CSS                                     |
| `loadCSS`                  | `(href)`                         | Dynamically appends a `<link rel="stylesheet">`                             |
| `loadFooter`               | `(footer)`                       | Builds and loads the footer block                                           |
| `loadHeader`               | `(header)`                       | Builds and loads the header block                                           |
| `loadScript`               | `(src, attrs?)`                  | Dynamically appends a `<script>` tag                                        |
| `loadSection`              | `(section, callback?)`           | Loads all blocks in a section; resolves after `callback`                    |
| `loadSections`             | `(element)`                      | Loads all sections in a container                                           |
| `readBlockConfig`          | `(block)`                        | Extracts key/value pairs from a config-style block table                    |
| `sampleRUM`                | `(checkpoint, data?)`            | Records a RUM (Real User Monitoring) checkpoint                             |
| `toCamelCase`              | `(name)`                         | Converts `hyphen-case` or `snake_case` to `camelCase`                       |
| `toClassName`              | `(name)`                         | Sanitizes a string for use as a CSS class name                              |
| `waitForFirstImage`        | `(section)`                      | Resolves when the first image in a section has loaded                       |
| `wrapTextNodes`            | `(block)`                        | Wraps bare inline text nodes in `<p>` tags                                  |
