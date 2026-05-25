# Alert Dialog

A modal dialog that appears over page content. The block renders a trigger button inline; clicking it opens a native `<dialog>` element with a title, message, and action button(s).

Focus is automatically trapped inside the dialog when open (native `<dialog>` behaviour). The dialog closes on Escape key, on the close ✕ button, on the backdrop, or on an action button click.

## Variations

| Class name             | Appearance                                                                         |
| ---------------------- | ---------------------------------------------------------------------------------- |
| `alert-dialog`         | Default — info accent (sky/blue)                                                   |
| `alert-dialog success` | Success — green accent                                                             |
| `alert-dialog warning` | Warning — amber accent                                                             |
| `alert-dialog danger`  | Danger — red accent                                                                |
| `alert-dialog confirm` | Confirm — shows Confirm + Cancel buttons instead of OK; trigger uses danger colour |

## Content Model

### Default / info / success / warning / danger

| alert-dialog |                                    |
| ------------ | ---------------------------------- |
| Title        | Dialog title text                  |
| Message      | The dialog body message goes here. |
| Trigger      | Open Dialog                        |

### Confirm variant

| alert-dialog confirm |                                   |
| -------------------- | --------------------------------- |
| Title                | Confirm Action                    |
| Message              | Are you sure you want to proceed? |
| Trigger              | Delete Item                       |
| Confirm              | Yes, delete                       |
| Cancel               | No, keep it                       |

Row detection uses **labeled rows** (first cell = key, second cell = value). If no labeled rows are found it falls back to **positional** order: row 1 = title, row 2 = message, row 3 = trigger.

Supported label keys (case-insensitive): `title`, `message`, `trigger`, `confirm`, `cancel`.

## Events

| Event                  | Fires on                 | When                                                    |
| ---------------------- | ------------------------ | ------------------------------------------------------- |
| `alert-dialog:confirm` | dialog element (bubbles) | User clicks the Confirm button in the `confirm` variant |

```js
document.addEventListener('alert-dialog:confirm', (e) => {
  console.log('User confirmed the action', e.target);
});
```

## CSS Custom Properties

The `<dialog>` element uses these block-scoped custom properties, set per variant:

| Property                 | Role                                  |
| ------------------------ | ------------------------------------- |
| `--dialog-accent`        | Header title colour and accent border |
| `--dialog-accent-subtle` | Header background fill                |
| `--dialog-accent-border` | Header bottom border                  |
| `--dialog-confirm-bg`    | Confirm button background             |
| `--dialog-confirm-text`  | Confirm button text colour            |
| `--dialog-confirm-hover` | Confirm button hover background       |

## CSS Classes

| Class                   | Element  | Purpose                                             |
| ----------------------- | -------- | --------------------------------------------------- |
| `.alert-dialog-trigger` | `button` | Inline trigger rendered in the page flow            |
| `.alert-dialog-modal`   | `dialog` | Native dialog element                               |
| `.alert-dialog-header`  | `div`    | Contains title and close button; tinted by variant  |
| `.alert-dialog-title`   | `h2`     | Dialog heading                                      |
| `.alert-dialog-close`   | `button` | Dismiss (✕) in header                               |
| `.alert-dialog-body`    | `div`    | Message area                                        |
| `.alert-dialog-footer`  | `div`    | Action buttons row                                  |
| `.alert-dialog-ok`      | `button` | Single action button (default/non-confirm variants) |
| `.alert-dialog-confirm` | `button` | Primary confirm action (confirm variant)            |
| `.alert-dialog-cancel`  | `button` | Secondary dismiss action (confirm variant)          |

## Accessibility

- Native `<dialog>` provides automatic focus trapping and Escape-key dismissal
- Close button has `aria-label="Close dialog"`
- All interactive elements have visible `:focus-visible` outlines meeting WCAG 2.4.13
- Dialog title is an `<h2>` — authors should ensure page heading hierarchy is maintained

## Testing

| File                   | Purpose                                                              |
| ---------------------- | -------------------------------------------------------------------- |
| `alert-dialog.test.js` | Vitest unit tests — config extraction, DOM structure, event handling |
| `alert-dialog.spec.js` | Playwright e2e tests — open/close, Escape, confirm event, backdrop   |

Draft page: `drafts/alert-dialog.html`
