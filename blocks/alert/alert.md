# Alert

Inline contextual notification. Renders a styled banner on the page without requiring user interaction.

## Variations

| Class name                  | Appearance                             |
| --------------------------- | -------------------------------------- |
| `alert`                     | Default — info style (sky/blue)        |
| `alert success`             | Success — green                        |
| `alert warning`             | Warning — amber/yellow                 |
| `alert error`               | Error/danger — red                     |
| `alert dismissible`         | Adds a close ✕ button                  |
| `alert dismissible success` | Dismissible success (variants combine) |

## Content Model

Two-row form (title + body):

| alert                                          |
| ---------------------------------------------- |
| Title (optional)                               |
| This is an informational message for the user. |

Or single-row (body only, no title):

| alert                          |
| ------------------------------ |
| This is a short alert message. |

- **Row 1 of 2**: Title text — rendered as `<strong class="alert-title">` in uppercase
- **Last row**: Body message — rendered as `<p class="alert-body">`
- If only one row is present it becomes the body with no title

## CSS Custom Properties

Each variant overrides three block-scoped custom properties:

| Property              | Role                        |
| --------------------- | --------------------------- |
| `--alert-bg`          | Subtle background fill      |
| `--alert-border`      | Border and focus-ring color |
| `--alert-title-color` | Title text color            |

## CSS Classes

| Class            | Element    | Purpose                                                          |
| ---------------- | ---------- | ---------------------------------------------------------------- |
| `.alert`         | Root block | Main container; receives `role="alert"` and `aria-live="polite"` |
| `.alert-content` | `div`      | Wraps title and body                                             |
| `.alert-title`   | `strong`   | Optional bold title, visually uppercase                          |
| `.alert-body`    | `p`        | Main message text                                                |
| `.alert-close`   | `button`   | Dismiss button (dismissible variant only)                        |

## Accessibility

- `role="alert"` and `aria-live="polite"` are set on the block root so screen readers announce it
- Close button carries `aria-label="Close"` and `type="button"`
- Focus ring on the close button meets WCAG 2.4.11 non-text contrast

## Testing

| File            | Purpose                                                          |
| --------------- | ---------------------------------------------------------------- |
| `alert.test.js` | Vitest unit tests — DOM structure, variants, dismiss interaction |
| `alert.spec.js` | Playwright e2e tests — visual rendering, close button behavior   |

Draft page: `drafts/alert.html`
