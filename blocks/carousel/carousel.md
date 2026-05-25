# Carousel

Displays a sequence of slides (image + optional caption) with prev/next navigation and dot indicators. Each row in the block represents one slide.

---

## Variations

| Variation   | Block name               | Description                                                 |
| ----------- | ------------------------ | ----------------------------------------------------------- |
| Default     | `carousel`               | Manual navigation with prev/next buttons and dot indicators |
| Autoplay    | `carousel (autoplay)`    | Auto-advances every 5 s; pauses on hover or focus           |
| No controls | `carousel (no-controls)` | Dot indicators only; no prev/next buttons                   |

---

## Content model

| carousel |                 |
| -------- | --------------- |
| (image)  | Slide 1 caption |
| (image)  | Slide 2 caption |
| (image)  |                 |

Each row is one slide. The first cell contains the slide media (`<picture>` element). The second cell (optional) contains caption text.

---

## CSS class reference

| Class                 | Element    | Purpose                                                             |
| --------------------- | ---------- | ------------------------------------------------------------------- |
| `.carousel-announcer` | `<div>`    | Visually hidden `aria-live="polite"` region for slide announcements |
| `.carousel-track`     | `<div>`    | Flex container that slides via `transform: translateX`              |
| `.carousel-slide`     | `<div>`    | Individual slide; `role="group"`, `aria-label="Slide N of N"`       |
| `.carousel-media`     | `<div>`    | Contains the `<picture>` / image                                    |
| `.carousel-caption`   | `<div>`    | Optional caption text below the image                               |
| `.carousel-controls`  | `<div>`    | Container for prev button, dots, and next button                    |
| `.carousel-prev`      | `<button>` | Previous slide button; `aria-label="Previous slide"`                |
| `.carousel-next`      | `<button>` | Next slide button; `aria-label="Next slide"`                        |
| `.carousel-dots`      | `<div>`    | `role="tablist"` container for dot buttons                          |
| `.carousel-dot`       | `<button>` | One dot per slide; `aria-selected="true"` on active                 |

---

## Accessibility

- Active dot uses `aria-selected="true"` and `aria-current="true"`.
- Slide changes are announced via `aria-live="polite"` region.
- Keyboard: `ArrowLeft` / `ArrowRight` navigate slides when focus is inside the carousel.
- Autoplay pauses on `mouseenter` and `focusin`; resumes on `mouseleave` and when focus leaves the block.

---

## Breakpoint partials

| File          | Breakpoint              | Contains                                                                        |
| ------------- | ----------------------- | ------------------------------------------------------------------------------- |
| `default.css` | all (mobile-first base) | Track, slides, caption, controls row below the image                            |
| `md.css`      | `≥ 760px`               | Larger button and dot sizes, larger caption font                                |
| `lg.css`      | `≥ 992px`               | Prev/next buttons absolutely positioned over the image; dots overlaid at bottom |

---

## Testing

| File               | Purpose                                                                 |
| ------------------ | ----------------------------------------------------------------------- |
| `carousel.test.js` | Vitest unit tests — slides, navigation, dot state, autoplay, edge cases |
| `carousel.spec.js` | Playwright e2e tests — visual presence and interaction on draft page    |

Draft page: `drafts/carousel.html`
