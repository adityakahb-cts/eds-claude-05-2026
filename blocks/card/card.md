# Card

Displays content in a card layout. Commonly used for blog teasers, feature highlights, and team member profiles. Multiple card blocks within the same section appear side-by-side in a responsive grid.

---

## Variations

| Variation  | Block name          | Description                                            |
| ---------- | ------------------- | ------------------------------------------------------ |
| Default    | `card`              | Vertical card: image on top, text below                |
| Horizontal | `card (horizontal)` | Image on left, text on right (50/50 split at ≥ 632 px) |
| Featured   | `card (featured)`   | Image used as full-bleed background with overlaid text |
| No image   | `card (no-image)`   | Text-only card, no image slot rendered                 |

---

## Content model

| card        |                                        |
| ----------- | -------------------------------------- |
| (image)     | Alt text                               |
| Title       | Card heading                           |
| Description | Body text goes here with more details. |
| (link)      | Read more                              |

**Row 1** — `<picture>` element (optional). Omit for the `no-image` variation.
**Row 2** — Card title text. Rendered as `<h3 class="card-title">`.
**Row 3** — Description / body text. May contain multiple paragraphs.
**Row 4** (optional) — CTA anchor. Rendered as `<a class="card-cta button">`.

Rows are detected by content type: the first `<picture>` found becomes the image, the first anchor found becomes the CTA, and remaining text rows become title then description in order.

---

## CSS class reference

| Class               | Element | Purpose                                                                                  |
| ------------------- | ------- | ---------------------------------------------------------------------------------------- |
| `.card-image`       | `<div>` | Image container (default / horizontal / no-image variations)                             |
| `.card-background`  | `<div>` | Full-bleed image container for the `featured` variation (`position: absolute; inset: 0`) |
| `.card-body`        | `<div>` | Content area: title, description, CTA                                                    |
| `.card-title`       | `<h3>`  | Card heading                                                                             |
| `.card-description` | `<p>`   | Body copy (one element per paragraph)                                                    |
| `.card-cta`         | `<a>`   | Call-to-action link                                                                      |

---

## Breakpoint partials

| File          | Breakpoint              | Contains                                                  |
| ------------- | ----------------------- | --------------------------------------------------------- |
| `default.css` | all (mobile-first base) | Card shell, image, body, CTA, featured overlay            |
| `sm.css`      | `≥ 632px`               | Horizontal layout: `flex-direction: row`, image 50% width |
| `md.css`      | `≥ 760px`               | Larger body padding, larger title font size               |
| `lg.css`      | `≥ 992px`               | Minimum height for featured cards                         |

---

## Testing

| File           | Purpose                                                           |
| -------------- | ----------------------------------------------------------------- |
| `card.test.js` | Vitest unit tests — DOM structure, variations, graceful fallbacks |
| `card.spec.js` | Playwright e2e tests — visual presence on draft page              |

Draft page: `drafts/card.html`
