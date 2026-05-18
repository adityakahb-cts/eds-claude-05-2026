---
description: Scaffold a new AEM EDS block with all required files
argument-hint: <blockname>
---

Create a new AEM Edge Delivery Services block named `$ARGUMENTS`.

Follow these steps exactly, in order:

## 1. Create block directory and core files

**`blocks/$ARGUMENTS/$ARGUMENTS.js`**

```js
/**
 * Loads and decorates the $ARGUMENTS block.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  // TODO: implement block decoration
  // 1. Extract configuration from block children
  // 2. Transform the DOM structure
  // 3. Add event listeners if needed
}
```

**`blocks/$ARGUMENTS/$ARGUMENTS.css`**

```css
/* $ARGUMENTS block styles — all selectors must be scoped to .$ARGUMENTS */

.$ARGUMENTS {
  /* mobile-first base styles */
}

@media (width >= 600px) {
  .$ARGUMENTS {
    /* tablet styles */
  }
}

@media (width >= 900px) {
  .$ARGUMENTS {
    /* desktop styles */
  }
}
```

## 2. Create unit test

**`blocks/$ARGUMENTS/$ARGUMENTS.test.js`**

```js
import { describe, it, expect, afterEach } from 'vitest';
import { createBlockFixture } from '../../tests/unit/dom-helpers.js';

const { default: decorate } = await import('./$ARGUMENTS.js');

describe('$ARGUMENTS block', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('exports a default decorate function', () => {
    expect(typeof decorate).toBe('function');
  });

  it('does not throw when called with an empty block', () => {
    const block = document.createElement('div');
    block.className = '$ARGUMENTS';
    document.body.append(block);
    expect(() => decorate(block)).not.toThrow();
  });

  // TODO: add tests specific to this block's behavior
});
```

## 3. Create E2E test

**`tests/e2e/$ARGUMENTS.spec.js`**

```js
import { test, expect } from '@playwright/test';

test.describe('$ARGUMENTS block', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/drafts/$ARGUMENTS-test');
    await page.waitForLoadState('domcontentloaded');
  });

  test('$ARGUMENTS block is visible', async ({ page }) => {
    await expect(page.locator('.$ARGUMENTS')).toBeVisible();
  });

  // TODO: add assertions specific to this block
});
```

## 4. Create block documentation

**`blocks/$ARGUMENTS/block.md`**

```markdown
# $ARGUMENTS Block

## Overview

TODO: describe what this block does, when to use it, and key behavior.

## Content Structure

Authors create the $ARGUMENTS block as a table in the document editor:

| $ARGUMENTS |         |
| ---------- | ------- |
| Field 1    | Field 2 |

TODO: define the actual table structure with column meanings.

## Field Definitions

| Field  | Component  | Required | Multi | Description    |
| ------ | ---------- | -------- | ----- | -------------- |
| field1 | text-input | Yes      | No    | TODO: describe |

## CSS Classes Generated

| Class             | Applied To | Purpose        |
| ----------------- | ---------- | -------------- |
| `.$ARGUMENTS-...` | TODO       | TODO: describe |

## Usage Examples

### Minimal example

| $ARGUMENTS |
| ---------- |
| Content    |

## Performance Notes

TODO: document any image optimization, lazy loading, or async loading behavior.

## Accessibility

TODO: document ARIA usage, keyboard navigation, and alt text requirements.
```

## 5. Add to component-models.json

Open `component-models.json` and add an entry for the new block:

```json
{
  "id": "$ARGUMENTS",
  "fields": [
    {
      "component": "text-input",
      "valueType": "string",
      "name": "field1",
      "label": "Field 1",
      "multi": false
    }
  ]
}
```

## 6. Create a draft test page

**`drafts/$ARGUMENTS-test.html`**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>$ARGUMENTS Test</title>
  </head>
  <body>
    <header></header>
    <main>
      <div>
        <div class="$ARGUMENTS">
          <div>
            <div>TODO: add block content here</div>
          </div>
        </div>
      </div>
    </main>
    <footer></footer>
  </body>
</html>
```

## 7. Summary

After creating all files, print a summary table of files created, then remind the developer to:

1. **Define the content structure** (the document table shape) in `block.md` before writing JavaScript
2. **Start the dev server**: `aem up --html-folder drafts`
3. **Run unit tests**: `npm run test:unit`
4. **Run linting**: `npm run lint`
5. **Ask for help with content** in da.live if needed via the `da-live-admin` MCP
