# Offcanvas

A panel that slides in from the edge of the viewport. Useful for mobile menus, filter panels, and bottom sheets. Each offcanvas block renders a trigger button inline and appends the panel + backdrop directly to `<body>`.

---

## Variations

| Variation | Block name           | Direction                    |
| --------- | -------------------- | ---------------------------- |
| Default   | `offcanvas`          | Slides from the left (start) |
| End       | `offcanvas (end)`    | Slides from the right        |
| Top       | `offcanvas (top)`    | Slides down from the top     |
| Bottom    | `offcanvas (bottom)` | Slides up from the bottom    |

---

## Content model

| offcanvas       |           |
| --------------- | --------- |
| Trigger         | Open Menu |
| (panel content) |           |

**Row 1** — Trigger row. Column 1: the literal text "Trigger" (a convention for the author). Column 2: the visible button label.

**Rows 2+** — Panel content. All child nodes from the first cell of each row are moved into the `offcanvas-content` div. Supports any rich text, links, headings, etc.

---

## CSS class reference

| Class                     | Element     | Purpose                                                                                |
| ------------------------- | ----------- | -------------------------------------------------------------------------------------- |
| `.offcanvas-trigger`      | `<button>`  | Visible trigger button rendered inline inside the block                                |
| `.offcanvas-panel`        | `<div>`     | The sliding panel; appended to `<body>`; `role="dialog"`                               |
| `.offcanvas-panel-start`  | modifier    | Slides in from the left                                                                |
| `.offcanvas-panel-end`    | modifier    | Slides in from the right                                                               |
| `.offcanvas-panel-top`    | modifier    | Slides down from the top                                                               |
| `.offcanvas-panel-bottom` | modifier    | Slides up from the bottom                                                              |
| `.offcanvas-close`        | `<button>`  | Close button inside the panel; `aria-label="Close"`                                    |
| `.offcanvas-content`      | `<div>`     | Scrollable content area inside the panel                                               |
| `.offcanvas-backdrop`     | `<div>`     | Semi-transparent overlay; appended to `<body>`                                         |
| `.is-open`                | state class | Applied to both `.offcanvas-panel` and `.offcanvas-backdrop` when the panel is visible |

---

## Accessibility

- Panel has `role="dialog"`, `aria-modal="true"`, and `aria-label` set to the trigger text.
- Focus is moved into the panel on open and trapped inside until close.
- Focus returns to the trigger button when the panel closes.
- Closing: close button, backdrop click, or `Escape` key.
- Trigger button: `aria-controls` points to the panel `id`; `aria-expanded` tracks state.

---

## Breakpoint partials

| File          | Breakpoint              | Contains                                                                                |
| ------------- | ----------------------- | --------------------------------------------------------------------------------------- |
| `default.css` | all (mobile-first base) | Trigger button, backdrop, all four panel direction variants, close button, content area |
| `md.css`      | `≥ 760px`               | Wider start/end panels (`min(400px, 50vw)`), more generous content padding              |

---

## Testing

| File                | Purpose                                                                                      |
| ------------------- | -------------------------------------------------------------------------------------------- |
| `offcanvas.test.js` | Vitest unit tests — panel creation, aria attributes, open/close state, direction variants    |
| `offcanvas.spec.js` | Playwright e2e tests — trigger click, close button, Escape key, backdrop, direction variants |

Draft page: `drafts/offcanvas.html`
