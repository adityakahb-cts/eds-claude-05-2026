# Header Block

## Overview

The Header block renders the site-wide navigation. It loads the nav content from the `/nav`
fragment page (or the path specified in the `nav` page metadata), decorates it into a responsive
navigation bar with a hamburger menu on mobile, and injects it into the `<header>` element.

The header is auto-blocked by AEM on every page — it does not need to be authored into individual
pages.

## Content Structure

The header content is authored on the `/nav` page as a document with three sections:

| Section  | Purpose                                         |
| -------- | ----------------------------------------------- |
| Brand    | Logo link (first section of /nav page)          |
| Sections | Top-level navigation links (second section)     |
| Tools    | Utility links, search, language (third section) |

Navigation items with nested lists automatically become dropdowns (`nav-drop`).

## Field Definitions

The Header block itself has no authored fields — it is a structural block. All content comes
from the `/nav` fragment.

## CSS Classes Generated

| Class                 | Applied To               | Purpose                                 |
| --------------------- | ------------------------ | --------------------------------------- |
| `.nav-wrapper`        | Outer wrapper `div`      | Contains the full `<nav>` element       |
| `nav#nav`             | `<nav>` element          | Main nav, with `aria-expanded` state    |
| `.nav-brand`          | First nav section        | Logo / site name link                   |
| `.nav-sections`       | Second nav section       | Primary navigation links                |
| `.nav-tools`          | Third nav section        | Utility tools (search, language, etc.)  |
| `.nav-drop`           | Nav items with sub-menus | Items that have dropdown sub-navigation |
| `.nav-hamburger`      | Mobile toggle wrapper    | Contains the hamburger `<button>`       |
| `.nav-hamburger-icon` | `<span>` inside button   | Visual icon for the hamburger           |

## Behavior

- **Desktop** (`min-width: 900px`): Nav sections are shown inline; dropdowns expand on click.
- **Mobile** (`< 900px`): Nav is hidden behind a hamburger button; opens as overlay.
- **Keyboard**: Escape closes open dropdowns; Enter/Space opens nav-drop items.
- **Focus management**: Nav collapses when focus leaves it (`focusout`).

## Performance Notes

- Header is loaded in the **lazy phase** so it does not block LCP.
- The `/nav` fragment is fetched as `.plain.html` — keep the nav page lightweight.
- Avoid placing images or heavy media in the nav.

## Accessibility

- `aria-expanded` tracks open/close state on the `<nav>` element and each dropdown item.
- `aria-controls="nav"` is set on the hamburger button.
- `aria-label` on the hamburger button is updated dynamically ("Open navigation" / "Close navigation").
- All nav links must have visible text.
