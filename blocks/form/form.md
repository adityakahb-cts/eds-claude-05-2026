# Form Block

## Overview

The `form` block renders an AEM Adaptive Form inline on any page. It is sourced from
[adobe-rnd/aem-boilerplate-forms](https://github.com/adobe-rnd/aem-boilerplate-forms) and
**must not be heavily modified** — pull upstream changes instead of rewriting.

**When to use:**

- Embedding a contact, registration, or survey form on a page.
- When form logic (validation, conditional visibility, rules engine) is managed in AEM Forms.
- When form fields and submission endpoints are controlled by the Forms team, not the FE developer.

**Key behaviour:**

- The block fetches the form's JSON definition from an AEM endpoint (`*.model.json`) or uses
  embedded JSON authored directly in the block.
- Field layout, validation rules, and submit logic all come from the remote JSON — not from
  page authoring.
- Supports wizard (multi-step), accordion, panel, and repeatable field layouts.
- Integrates Google ReCaptcha (configured via form JSON, not da.live).
- Supports Universal Editor (AUE) authoring mode via `scripts/config/form-editor-support.js`.

## Content Model

Authors create the `form` block with a single link pointing to the form JSON definition:

| form                                                             |
| ---------------------------------------------------------------- |
| https://author-p12345.adobeaemcloud.com/content/forms/af/my-form |

Or using an inline JSON definition (advanced, rarely used in authoring):

| form |
| (pre block containing raw JSON) |

> **Note:** The block does **not** use da.live table rows to define form fields. Fields,
> validation, and conditional logic all live in the AEM Forms JSON definition referenced above.

## Field Definitions

The form block has one authored field:

| Field            | Component  | Required | Multi | Description                                                   |
| ---------------- | ---------- | -------- | ----- | ------------------------------------------------------------- |
| `formRef` (link) | link / URL | **Yes**  | No    | URL to the AEM Adaptive Form JSON definition (`*.model.json`) |

All other form fields (text inputs, dropdowns, checkboxes, file uploads, etc.) are defined in
the AEM Forms JSON schema — not in this table.

### Supported AEM Form field types (driven by JSON)

| Field Type       | Description                               |
| ---------------- | ----------------------------------------- |
| `text-input`     | Single-line text field                    |
| `multiline`      | Textarea                                  |
| `drop-down`      | `<select>` element                        |
| `checkbox`       | Single checkbox                           |
| `checkbox-group` | Multiple checkboxes                       |
| `radio`          | Single radio button                       |
| `radio-group`    | Radio button group                        |
| `file-input`     | File upload with drag-and-drop            |
| `image`          | Image field                               |
| `plain-text`     | Read-only rich text paragraph             |
| `heading`        | Section heading                           |
| `button`         | Action button (submit, reset, next, prev) |
| `panel`          | Container / fieldset                      |

## Variations

The form block has no named visual variations via da.live authoring. Layout variations (wizard,
accordion, horizontal/vertical card groups) are controlled by the AEM Forms JSON definition.

### Default

| form                                          |
| --------------------------------------------- |
| https://path/to/adaptive-form-definition.json |

Standard single-page form layout. Author the block as `form`.

### Wizard (multi-step)

Wizard layout is triggered when the form JSON defines a `wizard` panel as the root container.
The block name in da.live stays `form` — the layout is determined server-side.

## Authoring Guidelines

1. Open da.live and navigate to the target page.
2. Insert a table — first cell is `form`.
3. In the second row, paste the full URL to the AEM Adaptive Form (ask the Forms team for the URL).
4. Click **Preview** and verify the form renders all fields correctly.
5. Test form submission on the preview URL before publishing.
6. Click **Publish** when ready.

**Do not:**

- Author form field labels or values in the da.live table — they come from AEM Forms.
- Modify `blocks/form/form.js` directly — pull upstream changes from `adobe-rnd/aem-boilerplate-forms`.
- Hard-code ReCaptcha keys in source — they are configured in the form JSON / AEM environment.

**To update form fields:**

- Edit the Adaptive Form in AEM as a Cloud Service (Forms console) and re-publish.
- No da.live or code changes are needed unless the form URL itself changes.

## CSS Classes Generated

The form block uses CSS custom properties for full design-token theming. Override them in
`styles/styles.css` or `styles/lazy-styles.css` as needed.

| Class / Selector                      | Applied To             | Purpose                                     |
| ------------------------------------- | ---------------------- | ------------------------------------------- |
| `.form`                               | Block root             | Primary scoping selector                    |
| `.form-container`                     | Inner wrapper          | Background + padding container              |
| `form`                                | `<form>` element       | 12-column CSS Grid layout                   |
| `.field-wrapper`                      | Per-field wrapper      | Grid column span + margin                   |
| `.field-wrapper.col-{1–12}`           | Field wrapper          | Explicit column span from JSON `fieldSpan`  |
| `.field-invalid`                      | Field wrapper (error)  | Red border + error message styling          |
| `.checkbox-wrapper`, `.radio-wrapper` | Option wrappers        | Flex layout for label + input               |
| `.panel-wrapper`                      | Panel / fieldset       | Nested 12-column grid                       |
| `.repeat-wrapper`                     | Repeatable panel       | Clone-able grid container                   |
| `.wizard`                             | Wizard root            | Multi-step layout with step counter         |
| `.wizard-menu-items`                  | Step navigation        | Numbered wizard step list                   |
| `fieldset.cards`                      | Card-style radio/check | Flex card layout with hover/selected states |
| `.form-message.success-message`       | Post-submit success    | Green success banner                        |
| `.form-message.error-message`         | Post-submit error      | Red error banner                            |
| `.captcha-wrapper`                    | ReCaptcha widget       | Hidden in non-edit mode                     |

### CSS Custom Properties (override in `styles/styles.css`)

```css
:root {
  --form-columns: 12; /* grid column count */
  --form-field-horz-gap: 40px; /* horizontal gap between fields */
  --form-field-vert-gap: 20px; /* vertical gap between rows */
  --form-input-border-color: #818a91; /* field border colour */
  --form-button-background-color: #5f8dda; /* primary button colour */
  --form-button-background-hover-color: #035fe6;
  --form-label-font-size: 18px;
  --form-input-font-size: 1rem;
  --form-submit-width: 100%;
  --form-width: 100%;
}
```

## Performance Notes

- The form block is **below-the-fold** in most layouts — it loads in the lazy phase.
- The form JSON definition is fetched on block decoration (one HTTP request per form).
- Component JS files (wizard, accordion, file, etc.) are loaded on demand via dynamic `import()`.
- `scripts/config/form-editor-support.js` is loaded only when form blocks exist on the page;
  its effects are gated on the `adobe-ue-edit` HTML class (Universal Editor only).
- Non-LCP: use `loading="lazy"` for any images embedded within form panels.
- ReCaptcha script (if configured) is loaded lazily by the block — no upfront penalty.

## Accessibility

- All form inputs are associated with `<label>` elements via `for`/`id`.
- Required fields are marked with `aria-required="true"` and a visible `*` indicator.
- Validation errors are placed adjacent to the invalid field with ARIA live region updates.
- Wizard steps use `<fieldset>` + `<legend>` for screen reader step grouping.
- Keyboard navigation: Tab through fields; Enter/Space on buttons; wizard Next/Prev via buttons.
- Card-style radio/checkbox groups use visually hidden inputs with keyboard-focusable `<label>`.
- File upload drag region has accessible button fallback.
- ReCaptcha widget: ensure the form JSON sets an appropriate `aria-label` on the captcha field.
- Run `/axe-check /path/to/form-page` before publishing to verify WCAG 2.1 AA compliance.
