/**
 * Form block — upstream content model exception.
 *
 * The form block is sourced directly from:
 *   https://github.com/adobe-rnd/aem-boilerplate-forms
 *
 * It has no traditional da.live CONTENT_MODEL because:
 *   - Its field definitions come from an AEM Forms JSON endpoint, not authored table rows.
 *   - The block is authored with a single link pointing to the form JSON definition.
 *   - Field layout, validation, and logic are all driven by the remote JSON schema.
 *
 * Authoring pattern in da.live:
 *
 *   | form                                           |
 *   | https://path/to/adaptive-form-definition.json  |
 *
 * OR with embedded JSON (advanced use, not typical):
 *
 *   | form |
 *   | (pre/code block containing raw JSON)           |
 *
 * The block supports:
 *   - AEM Adaptive Forms (doc-based and form-model-based)
 *   - Google ReCaptcha integration (configured via form JSON)
 *   - Wizard, accordion, panel, and repeatable field layouts
 *   - Universal Editor (AUE) authoring via scripts/config/form-editor-support.js
 *
 * Do NOT add a CONTENT_MODEL export here — da.live field discovery is not used.
 * Do NOT add a component-models.json entry with field definitions beyond the link ref.
 *
 * To update form field definitions, edit the AEM Forms JSON endpoint or the
 * corresponding Adaptive Form in AEM as a Cloud Service.
 */
