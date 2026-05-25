# Tabs Block

## Overview

The `tabs` block renders a fully accessible tab interface with keyboard navigation. It uses
`role="tablist"`, `role="tab"`, and `role="tabpanel"` with the required ARIA attributes so that
assistive technologies can navigate the component correctly without any additional configuration.

**When to use:**

- Displaying multiple categories of content in the same visual space.
- Reducing page length by grouping related content behind labeled tabs.
- Documentation pages with Overview / Features / Getting Started sections.
- Product pages with Design / Development / Content tabs.

**Key behaviour:**

- First tab is active by default.
- Clicking any tab shows its panel and hides all others.
- Arrow keys navigate between tabs; Home / End jump to first / last.
- Three visual variations: default underline, pills, vertical sidebar.

## Content Model

Each row in the da.live table becomes one tab. Two cells per row:

| tabs      |                                                                        |
| --------- | ---------------------------------------------------------------------- |
| Tab One   | Content for the first tab. Rich text, links, and images are supported. |
| Tab Two   | Content for the second tab.                                            |
| Tab Three | Content for the third tab.                                             |

- **Cell 1** — the tab label (plain text, kept short).
- **Cell 2** — the tab panel body (rich text).

## Field Definitions

The tabs block has no extra authored fields. Content comes entirely from the row structure above.

| Field    | Component | Required | Multi | Description                        |
| -------- | --------- | -------- | ----- | ---------------------------------- |
| _(none)_ | —         | —        | —     | Content defined by table rows only |

## Variations

### Default — underline indicator

```
| tabs |  |
|---|---|
| Overview | Overview content |
| Features | Feature list |
```

Horizontal tab bar with an underline active indicator. The active tab and indicator colour follow
the `--link-color` CSS custom property.

### pills

```
| tabs (pills) |  |
|---|---|
| Design | Design guidelines |
| Development | Dev docs |
```

Each tab is rendered as a bordered pill button. The active pill is filled with `--link-color`.
Use when the tab labels are short and the pill shape suits the page design.

### vertical

```
| tabs (vertical) |  |
|---|---|
| Overview | Overview content |
| Details | Detail content |
```

On mobile and tablet the tabs display as a horizontal scrollable bar (same as default). At the
`lg` breakpoint (992 px) the tablist moves to a sidebar on the left with a vertical right-border
indicator.

## Authoring Guidelines

1. Open da.live and navigate to the target page.
2. Insert a table — first cell is `tabs`, `tabs (pills)`, or `tabs (vertical)`.
3. Add one row per tab. First cell = tab label, second cell = panel content.
4. Keep tab labels short (1–3 words) so they fit comfortably in the tab bar on mobile.
5. Rich text in the panel cell is fully supported (bold, links, lists, images).
6. Preview and verify all tabs switch correctly and keyboard navigation works.
7. Publish when satisfied.

**Do not:**

- Nest tabs inside another tabs block — this breaks keyboard navigation.
- Use more than 6–7 tabs — consider breaking the content into separate sections instead.
- Use heading elements as tab labels — the tab button already provides the interactive role.

## CSS Classes Generated

| Class / Selector    | Applied To            | Purpose                                   |
| ------------------- | --------------------- | ----------------------------------------- |
| `.tabs`             | Block root            | Primary scoping selector                  |
| `.tabs .tabs-list`  | `[role="tablist"]`    | Horizontal flex container for tab buttons |
| `.tabs .tabs-tab`   | `[role="tab"]`        | Individual tab button                     |
| `.tabs .tabs-panel` | `[role="tabpanel"]`   | Panel content area                        |
| `.tabs.pills`       | Block root (pills)    | Pill button variation modifier            |
| `.tabs.vertical`    | Block root (vertical) | Vertical sidebar variation modifier       |

### CSS Custom Properties

Override in `styles/styles.css` or `styles/lazy-styles.css`:

```css
:root {
  --color-border: #e0e0e0; /* tab bar underline + pill border colour */
  --link-color: #035fe6; /* active tab indicator + pill fill colour */
  --body-font-size-m: 1rem; /* tab label and panel body font size */
  --body-font-size-l: 1.125rem; /* larger font at md breakpoint */
  --text-color: #333; /* inactive tab label colour */
  --highlight-background-color: #f0f4ff; /* pill hover background */
}
```

## Accessibility

- `role="tablist"` wraps all tab buttons.
- Each `<button>` carries `role="tab"`, `aria-selected`, `aria-controls`, and `tabindex`.
- Each panel carries `role="tabpanel"`, `aria-labelledby`, and `hidden` (toggled in JS).
- Keyboard: Tab enters the tablist; Arrow keys cycle through tabs; Home/End jump to first/last.
- Only the active tab button is in the natural tab order (`tabindex="0"`); others use
  `tabindex="-1"` (roving tabindex pattern).
- Run `/axe-check /drafts/tabs.html` before publishing.

## Performance Notes

- Zero external dependencies.
- Panel visibility is toggled via the `hidden` attribute — no CSS `display` toggling needed.
- Block loads in the lazy phase.
- Unique tab/panel IDs are generated per-block-index to avoid collisions when multiple tabs
  blocks appear on the same page.
