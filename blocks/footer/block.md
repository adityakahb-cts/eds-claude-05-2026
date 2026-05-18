# Footer Block

## Overview

The Footer block renders the site-wide footer. It loads content from the `/footer` fragment page
(or the path specified in the `footer` page metadata), decorates it, and injects it into the
`<footer>` element.

The footer is auto-blocked by AEM on every page — it does not need to be authored into individual
pages.

## Content Structure

Footer content is authored on the `/footer` page as a standard AEM document. Typical sections
include:

| Section        | Purpose                                            |
| -------------- | -------------------------------------------------- |
| Links          | Site navigation links grouped by category          |
| Legal          | Copyright notice, privacy policy, terms of service |
| Social / Brand | Social media links, brand logo                     |

Any block can be used inside the footer page (e.g., Columns for link groups).

## Field Definitions

The Footer block itself has no authored fields — it is a structural block. All content comes
from the `/footer` fragment.

## CSS Classes Generated

| Class     | Applied To    | Purpose                              |
| --------- | ------------- | ------------------------------------ |
| `.footer` | Block wrapper | Root class on the `<footer>` element |

No additional classes are added by the footer JS — all structure comes from the `/footer` fragment
and its own blocks.

## Behavior

- The footer content is fetched, decorated (blocks, links, etc.), and injected as-is.
- The block clears its own inner content (`block.textContent = ''`) before injecting the fragment.

## Performance Notes

- Footer is loaded in the **lazy phase** — it does not affect LCP.
- Keep the `/footer` fragment page lightweight; avoid large images or heavy scripts.
- Link groups in the footer should use the Columns block for multi-column layouts.

## Accessibility

- Footer links must have descriptive visible text.
- Include a copyright notice as plain text.
- Use a `<nav aria-label="Footer navigation">` landmark inside the footer fragment for link groups.
- Ensure sufficient color contrast for footer text on the background color.
