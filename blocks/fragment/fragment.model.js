/**
 * Fragment block — content model exception.
 *
 * The fragment block has no UI of its own. It fetches a CMS path and injects
 * the rendered content inline. Per project requirements it therefore has:
 *   - No CSS file  (no fragment.css, no styles/ directory)
 *   - No CONTENT_MODEL export  (da.live field discovery not needed)
 *   - No component-models.json entry
 *
 * The block is authored as a plain link or text path in a single-cell table:
 *
 *   | fragment                        |
 *   | /path/to/__content-fragments/x  |
 *
 * loadFragment() in fragment.js is re-exported for use by header and footer blocks.
 */
