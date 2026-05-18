# Fragment Block

## Overview

The Fragment block includes the content of another page as an inline fragment. It is used for
shared content such as promotional banners, calls-to-action, disclaimers, or any content that
appears on multiple pages and should be managed in one place.

The block fetches the `.plain.html` version of the target path, decorates it, and injects it
into the current page's DOM.

## Content Structure

Authors create the Fragment block with a single cell containing the path to the fragment page:

| Fragment             |
| -------------------- |
| /fragments/my-banner |

Or as a linked path (both forms are supported):

| Fragment                                     |
| -------------------------------------------- |
| [/fragments/my-banner](/fragments/my-banner) |

The path must be an absolute path starting with `/` (not a full URL).

## Field Definitions

| Field | Component  | Required | Multi | Description                                                  |
| ----- | ---------- | -------- | ----- | ------------------------------------------------------------ |
| path  | text-input | Yes      | No    | Absolute path to the fragment page (e.g. `/fragments/promo`) |

## Exported Functions

| Function       | Signature                                      | Description                                                                 |
| -------------- | ---------------------------------------------- | --------------------------------------------------------------------------- |
| `loadFragment` | `(path: string) => Promise<HTMLElement\|null>` | Fetches and decorates a fragment. Returns `null` for invalid/missing paths. |
| `decorate`     | `(block: Element) => Promise<void>`            | Default export — reads path from block, loads and injects fragment.         |

## Usage Notes

- Fragment pages are regular AEM pages in a `/fragments/` directory by convention.
- The fragment is fully decorated (blocks, sections, buttons) before injection.
- Media paths (images, sources) inside fragments are automatically rebased to the fragment origin.
- If the path is invalid or the page returns a non-200 response, the block renders nothing.

## Performance Notes

- Fragments are loaded during the **lazy phase** so they do not block LCP.
- Avoid using fragments for above-the-fold content — prefer authored content instead.
- Each fragment fetch is a network request; minimize the number of fragments per page.

## Accessibility

- Fragment content is injected into the main DOM flow and inherits page accessibility context.
- Ensure fragment pages follow the same heading hierarchy as the parent page.
- Do not use fragments as the sole carrier of critical landmark elements (nav, main, footer).
