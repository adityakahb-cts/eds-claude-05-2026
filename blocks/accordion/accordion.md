# Accordion Block

## Overview

The `accordion` block renders collapsible panels using native HTML `<details>` and `<summary>`
elements. Because it relies on the browser's built-in disclosure widget, keyboard navigation and
screen-reader support come for free with no extra ARIA wiring.

**When to use:**

- FAQs, help content, or any set of questions and answers.
- Progressive disclosure of detailed information without leaving the page.
- Reducing cognitive load by hiding non-essential content behind clickable headings.

**Key behaviour:**

- **Default** (`accordion`): clicking a heading opens that panel and closes all others — one panel
  open at a time.
- **allow-multiple** (`accordion (allow-multiple)`): each panel toggles independently; any number
  may be open simultaneously.
- The first panel is open by default.
- Open/close animates via a CSS `grid-template-rows` transition — no JavaScript height
  calculation required.

## Content Model

Each row in the da.live table becomes one accordion panel. Two cells per row:

| accordion       |                                                                          |
| --------------- | ------------------------------------------------------------------------ |
| Panel Heading 1 | Panel content goes here. Rich text, links, and images are all supported. |
| Panel Heading 2 | More content for the second panel.                                       |
| Panel Heading 3 | Additional content.                                                      |

- **Cell 1** — the summary / clickable heading (plain text).
- **Cell 2** — the panel body (rich text; paragraphs, lists, links, images).

## Field Definitions

The accordion block has no extra authored fields. Content comes entirely from the row structure above.

| Field    | Component | Required | Multi | Description                        |
| -------- | --------- | -------- | ----- | ---------------------------------- |
| _(none)_ | —         | —        | —     | Content defined by table rows only |

## Variations

### Default — single open

```
| accordion |  |
|---|---|
| Heading | Body content |
```

Clicking any heading opens it and collapses the previously open panel. Use for traditional FAQ
accordions where only one answer is shown at a time.

### allow-multiple

```
| accordion (allow-multiple) |  |
|---|---|
| Heading | Body content |
```

Any number of panels may be open simultaneously. Use when readers benefit from comparing content
across multiple panels.

## Authoring Guidelines

1. Open da.live and navigate to the target page.
2. Insert a table — first cell is `accordion` (or `accordion (allow-multiple)`).
3. Add one row per panel. First cell = heading, second cell = body content.
4. Rich text in the body cell is fully supported (bold, links, lists, images).
5. Preview and verify the first panel expands and the animation is smooth.
6. Publish when satisfied.

**Do not:**

- Nest one accordion inside another accordion panel — assistive technologies handle this poorly.
- Use heading elements (`<h2>`, `<h3>`) inside the first cell — the summary element already serves
  that semantic role.
- Leave the body cell empty — panels with no body look broken.

## CSS Classes Generated

| Class / Selector                | Applied To        | Purpose                                     |
| ------------------------------- | ----------------- | ------------------------------------------- |
| `.accordion`                    | Block root        | Primary scoping selector                    |
| `.accordion details`            | Panel wrapper     | Native disclosure element                   |
| `.accordion .accordion-summary` | Clickable heading | `<summary>` styled as heading row           |
| `.accordion .accordion-content` | Panel body        | Animated wrapper using `grid-template-rows` |

### CSS Custom Properties

Override in `styles/styles.css` or `styles/lazy-styles.css`:

```css
:root {
  --color-border: #e0e0e0; /* divider line colour */
  --body-font-size-m: 1rem; /* panel heading / body font size */
  --body-font-size-l: 1.125rem; /* larger heading at md breakpoint */
}
```

## Accessibility

- Uses native `<details>` / `<summary>` — keyboard accessible without any extra ARIA.
- Tab focuses each `<summary>`; Space or Enter toggles open/close.
- Screen readers announce "button, collapsed / expanded" automatically.
- No `role`, `aria-expanded`, or `aria-controls` needed — the browser handles these semantics.
- Run `/axe-check /drafts/accordion.html` before publishing.

## Performance Notes

- Zero JavaScript dependencies — no external imports.
- CSS animation uses `grid-template-rows` which is GPU-compositable and avoids layout thrash.
- Block loads in the lazy phase (below the fold in most layouts).
