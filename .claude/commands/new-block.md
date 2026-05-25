---
description: Create, update, or add a variation to an AEM EDS block — smart lifecycle detection
argument-hint: <blockname> [variation-name]
---

Manage an AEM Edge Delivery Services block named `$ARGUMENTS`.

> **`fragment` block exception:** The `fragment` block has no UI — it has no `.css`, no `styles/` directory, no `CONTENT_MODEL`, and no `component-models.json` entry. Its `fragment.model.js` is documentation-only. Do not apply this command to the `fragment` block.

## Step 0 — Detect mode

Before writing anything, check whether the block already exists:

```sh
ls blocks/$ARGUMENTS/ 2>/dev/null && echo EXISTS || echo NEW
```

Route based on the result:

| Result                                                        | Action                                                                                                                                     |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `NEW` — directory does not exist                              | **→ CREATE mode** (Step 1)                                                                                                                 |
| `EXISTS` and user provided a second argument (variation name) | **→ ADD_VARIATION mode** (Step 3)                                                                                                          |
| `EXISTS` and no second argument                               | **→ Ask** "Block `$ARGUMENTS` already exists. Do you want to (U)pdate existing files or (A)dd a variation?" then route to Step 2 or Step 3 |

---

## Step 1 — CREATE mode

Scaffold all required files from scratch. Create every file below; do not skip any.

### `blocks/$ARGUMENTS/$ARGUMENTS.js`

```js
import html from '../../scripts/config/html.js';
import { $ARGUMENTS_MARKUP, CONTENT_MODEL } from './$ARGUMENTS.model.js';

/**
 * Loads and decorates the $ARGUMENTS block.
 * @param {Element} block The block element
 * @returns {Promise<void>}
 */
export default async function decorate(block) {
  try {
    // 1. Load dependencies (dynamic imports if needed)
    // 2. Extract configuration from block children
    const rows = [...block.children];
    if (!rows.length) return;

    // 3. Transform DOM
    const wrapper = $ARGUMENTS_MARKUP.cloneNode(true);
    block.replaceChildren(wrapper);

    // 4. Add event listeners
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(`$ARGUMENTS block failed to decorate:`, err);
    block.dataset.blockStatus = 'failed';
  }
}
```

### `blocks/$ARGUMENTS/$ARGUMENTS.css`

```css
/* $ARGUMENTS block — all selectors scoped to .$ARGUMENTS */
@import url('./styles/default.css');
@import url('./styles/sm.css');
@import url('./styles/md.css');
@import url('./styles/lg.css');
@import url('./styles/xl.css');
@import url('./styles/xxl.css');
```

### `blocks/$ARGUMENTS/styles/default.css`

```css
/* $ARGUMENTS — mobile-first base (< 632px) */
.$ARGUMENTS {
  /* base styles */
}
```

### `blocks/$ARGUMENTS/styles/sm.css`

```css
/* $ARGUMENTS — width >= 632px */
@media (width >= 632px) {
  .$ARGUMENTS {
  }
}
```

### `blocks/$ARGUMENTS/styles/md.css`

```css
/* $ARGUMENTS — width >= 760px */
@media (width >= 760px) {
  .$ARGUMENTS {
  }
}
```

### `blocks/$ARGUMENTS/styles/lg.css`

```css
/* $ARGUMENTS — width >= 992px */
@media (width >= 992px) {
  .$ARGUMENTS {
  }
}
```

### `blocks/$ARGUMENTS/styles/xl.css`

```css
/* $ARGUMENTS — width >= 1272px */
@media (width >= 1272px) {
  .$ARGUMENTS {
  }
}
```

### `blocks/$ARGUMENTS/styles/xxl.css`

```css
/* $ARGUMENTS — width >= 1432px */
@media (width >= 1432px) {
  .$ARGUMENTS {
  }
}
```

### `blocks/$ARGUMENTS/$ARGUMENTS.model.js`

```js
import html from '../../scripts/config/html.js';

/**
 * da.live content model definition for the $ARGUMENTS block.
 * Keep in sync with component-models.json and blocks/$ARGUMENTS/$ARGUMENTS.md.
 *
 * Rules:
 *  - Every field must set required: true or required: false — never omit this key.
 *  - Every named variation must be listed in the variations array with its da.live authoring syntax.
 *  - fragment block is the only exception: it has no CONTENT_MODEL (no CSS, no UI).
 */
export const CONTENT_MODEL = {
  id: '$ARGUMENTS',
  fields: [
    {
      component: 'text-input',
      valueType: 'string',
      name: 'title',
      label: 'Title',
      required: true,
      multi: false,
      description: 'Main heading — required',
    },
    // Add optional fields below with required: false
    // {
    //   component: 'text-input',
    //   valueType: 'string',
    //   name: 'subtitle',
    //   label: 'Subtitle',
    //   required: false,
    //   multi: false,
    //   description: 'Optional supporting text',
    // },
  ],
  variations: [
    { name: 'default', description: 'Standard layout — author as "$ARGUMENTS"' },
    // Add named variants below as they are implemented:
    // { name: 'dark', description: 'Dark background — author as "$ARGUMENTS dark"' },
  ],
};

/** Base markup template for the $ARGUMENTS block. */
export const $ARGUMENTS_MARKUP = html`<div class="$ARGUMENTS-inner">
  <p class="$ARGUMENTS-title"></p>
</div>`;

// Add one named export per variation when markup differs significantly:
// export const $ARGUMENTS_DARK_MARKUP = html`...`;

export default $ARGUMENTS_MARKUP;
```

> **Note:** `html` is the tagged-template from `scripts/config/html.js`. Never use `innerHTML` or `/* html */` strings.

### `blocks/$ARGUMENTS/$ARGUMENTS.test.js`

```js
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

vi.mock('../../scripts/config/html.js', () => ({
  default: (s, ...v) => s.reduce((a, c, i) => a + c + (v[i] ?? ''), ''),
}));

const { default: decorate, CONTENT_MODEL } = await import('./$ARGUMENTS.js');

describe('$ARGUMENTS block', () => {
  let block;

  beforeEach(() => {
    block = document.createElement('div');
    block.className = '$ARGUMENTS';
    document.body.append(block);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  it('exports a default decorate function', () => {
    expect(typeof decorate).toBe('function');
  });

  it('exports CONTENT_MODEL with correct id', () => {
    expect(CONTENT_MODEL.id).toBe('$ARGUMENTS');
  });

  it('does not throw when called with an empty block', async () => {
    await expect(decorate(block)).resolves.not.toThrow();
  });

  it('sets data-block-status="failed" on decorate error', async () => {
    block.replaceChildren = () => {
      throw new Error('test');
    };
    await decorate(block);
    expect(block.dataset.blockStatus).toBe('failed');
  });

  // TODO: add assertions specific to this block's behaviour
});
```

### `blocks/$ARGUMENTS/$ARGUMENTS.spec.js`

```js
import { test, expect } from '@playwright/test';

test.describe('$ARGUMENTS block', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/*.plain.html', (route) => route.fulfill({ body: '<p>stub</p>' }));
    await page.goto('/drafts/$ARGUMENTS.html');
    await page.waitForLoadState('domcontentloaded');
  });

  test('renders block without JS errors', async ({ page }) => {
    const errors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await expect(page.locator('.$ARGUMENTS')).toBeVisible();
    expect(errors).toHaveLength(0);
  });

  test('renders with empty block without throwing', async ({ page }) => {
    await page.goto('/drafts/$ARGUMENTS-empty.html');
    await expect(page.locator('.$ARGUMENTS')).toBeAttached();
  });

  // TODO: add keyboard nav, axe-core, and visual regression tests
});
```

### `blocks/$ARGUMENTS/$ARGUMENTS.md`

```markdown
# $ARGUMENTS Block

## Overview

TODO: describe what this block does, when to use it, and its key behaviour.
This is the author-developer contract — update it before changing the JS or CSS.

## Content Model

Authors create the `$ARGUMENTS` block as a table in da.live:

| $ARGUMENTS                      |
| ------------------------------- |
| Title _(required)_              |
| The heading text for this block |

For a named variation, the block name includes the variant:

| $ARGUMENTS dark               |
| ----------------------------- |
| Title _(required)_            |
| Same fields — dark background |

## Field Definitions

| Field      | Component  | Required | Multi | Description                              |
| ---------- | ---------- | -------- | ----- | ---------------------------------------- |
| `title`    | text-input | **Yes**  | No    | Main heading for the block               |
| `subtitle` | text-input | No       | No    | Optional supporting text below the title |

> Image fields: include recommended dimensions (e.g. "1200×675 recommended, webp preferred").

## Variations

List every named variant with its da.live authoring syntax and field differences.

### Default

| $ARGUMENTS         |
| ------------------ |
| Title _(required)_ |

Standard layout. Author the block as `$ARGUMENTS`.

### Dark _(example — replace or remove)_

| $ARGUMENTS dark    |
| ------------------ |
| Title _(required)_ |

Dark background with light text. Author as `$ARGUMENTS dark`.
CSS: `.$ARGUMENTS--dark` applied automatically by the block decorator.

## Authoring Guidelines

Step-by-step instructions for content authors:

1. Open da.live and navigate to the target page.
2. Insert a table — first cell is the block name (e.g. `$ARGUMENTS` or `$ARGUMENTS dark`).
3. Fill in each row according to the Field Definitions table above.
4. For images: upload to the media library before inserting; recommended dimensions are listed in Field Definitions.
5. Click **Preview** and verify the block renders correctly.
6. Click **Publish** when ready.

**Do not:**

- Leave required fields empty — the block may fail silently.
- Use raw HTML in table cells — authoring is plain text and media only.
- Mix variation names (e.g. do not write `$ARGUMENTS Dark` — casing matters).

## CSS Classes Generated

| Class               | Applied To        | Purpose                           |
| ------------------- | ----------------- | --------------------------------- |
| `.$ARGUMENTS`       | Block root        | Primary scoping selector          |
| `.$ARGUMENTS-inner` | Inner wrapper     | Content container                 |
| `.$ARGUMENTS--dark` | Block root (dark) | Dark variant — added by decorator |

## Performance Notes

TODO: document lazy loading (`loading="lazy"` on non-LCP images), image optimisation (placehold.co sizing, webp), and whether the block is above or below fold.

## Accessibility

TODO: document ARIA usage (`aria-label`, `aria-expanded`, roles), keyboard navigation (Tab order, Enter/Space/Escape), and alt text requirements for images.
```

### `component-models.json` — add entry

Open `component-models.json` and append inside the top-level array:

```json
{
  "id": "$ARGUMENTS",
  "fields": [
    {
      "component": "text-input",
      "valueType": "string",
      "name": "title",
      "label": "Title",
      "required": true,
      "multi": false
    }
  ]
}
```

### `drafts/$ARGUMENTS.html` — local test page

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>$ARGUMENTS block test</title>
    <script type="module" src="/scripts/aem.js"></script>
    <script type="module" src="/scripts/scripts.js"></script>
    <link rel="stylesheet" href="/styles/styles.css" />
    <link rel="stylesheet" href="/blocks/$ARGUMENTS/$ARGUMENTS.css" />
  </head>
  <body>
    <header></header>
    <main>
      <div>
        <div class="$ARGUMENTS block" data-block-name="$ARGUMENTS" data-block-status="initialized">
          <div>
            <div>Sample title for $ARGUMENTS</div>
          </div>
        </div>
      </div>
    </main>
    <footer></footer>
  </body>
</html>
```

Also create `drafts/$ARGUMENTS-empty.html` — identical but with an empty block body:

```html
<div class="$ARGUMENTS block" data-block-name="$ARGUMENTS" data-block-status="initialized"></div>
```

### Step 1 summary

After creating all files, print this table:

| File                                     | Status     |
| ---------------------------------------- | ---------- |
| `blocks/$ARGUMENTS/$ARGUMENTS.js`        | ✅ Created |
| `blocks/$ARGUMENTS/$ARGUMENTS.css`       | ✅ Created |
| `blocks/$ARGUMENTS/$ARGUMENTS.model.js`  | ✅ Created |
| `blocks/$ARGUMENTS/$ARGUMENTS.test.js`   | ✅ Created |
| `blocks/$ARGUMENTS/$ARGUMENTS.spec.js`   | ✅ Created |
| `blocks/$ARGUMENTS/$ARGUMENTS.md`        | ✅ Created |
| `blocks/$ARGUMENTS/styles/` (6 partials) | ✅ Created |
| `component-models.json` entry            | ✅ Added   |
| `drafts/$ARGUMENTS.html`                 | ✅ Created |

Then remind the developer:

1. **Define the content structure** in `$ARGUMENTS.md` before writing JavaScript
2. **Start the dev server**: `npx -y @adobe/aem-cli up --no-open --html-folder drafts`
3. **Inspect authored HTML**: `curl http://localhost:3000/drafts/$ARGUMENTS.plain.html`
4. **Run unit tests**: `npm run test:unit`
5. **Run linting**: `npm run lint`
6. **Run `/block-check $ARGUMENTS`** when done to validate all conventions
7. **Create da.live showcase page**: `/__blocks/$ARGUMENTS` — author all variations, link from `/__blocks/index`

---

## Step 2 — UPDATE mode

Only modify the files relevant to the requested change. Do NOT overwrite existing test files unless the content model changed.

| What changed                     | Files to update                                                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Content model (add/remove field) | `{name}.model.js` + `{name}.md` + `component-models.json` + `{name}.test.js` (add tests, do not delete existing) |
| Visual CSS change only           | `styles/{breakpoint}.css` only                                                                                   |
| JS decoration logic              | `{name}.js` only; run `npm run test:unit` after                                                                  |
| Documentation                    | `{name}.md` only                                                                                                 |

After updating, run:

```sh
npm run lint
npm run test:unit
```

---

## Step 3 — ADD_VARIATION mode

A variation is a named visual or behavioural variant of the same block. It uses a BEM modifier class (`.{name}--{variant}`) added in da.live as `block-name variant-name` in the first row.

### Files to add/modify

1. **`blocks/{name}/styles/default.css`** — add `.{name}--{variant}` scoped rules:

```css
/* Variation: {variant} */
.$ARGUMENTS--{variant} {
  /* variant-specific overrides */
}
```

2. **`blocks/{name}/{name}.model.js`** — add markup export if structure differs:

```js
export const $ARGUMENTS_{VARIANT}_MARKUP = html`<div class="$ARGUMENTS-inner $ARGUMENTS-inner--{variant}">
  ...
</div>`;
```

3. **`blocks/{name}/{name}.md`** — append a variation table:

```markdown
## {Variant Name} Variation

| $ARGUMENTS ({variant-name}) |
| --------------------------- |
| Field A _(required)_        |
| Description of field A      |
```

4. **`blocks/{name}/{name}.js`** — handle the variant in `decorate()` if needed:

```js
const isVariant = block.classList.contains('$ARGUMENTS--{variant}');
```

### da.live showcase update

Add a new section to `/__blocks/$ARGUMENTS` in da.live showing the variant. Do **not** create `/__blocks/$ARGUMENTS-{variant}` as a separate page.

After adding the variation, run `/block-check $ARGUMENTS` to confirm all conventions are met.
