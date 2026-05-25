Validate a block meets all project conventions.

Checks for the block named $ARGUMENTS in `blocks/{name}/`:

1. **File presence** — verify all 6 required files exist:
   - `{name}.js`
   - `{name}.css`
   - `{name}.model.js`
   - `{name}.test.js`
   - `{name}.spec.js`
   - `{name}.md`
   - `styles/` directory with `default.css`, `sm.css`, `md.css`, `lg.css`, `xl.css`, `xxl.css`

2. **No innerHTML** — grep `{name}.js` for `innerHTML` assignments (`.innerHTML =`). Report any found (comments from fragment-loader are acceptable; direct assignments are not).

3. **CSS scoping** — check `{name}.css` and all `styles/*.css` files; verify selectors are scoped to `.{name}` and not bare element selectors.

4. **CONTENT_MODEL.id** — read `{name}.model.js`, extract `CONTENT_MODEL.id`, verify it equals `{name}`.

5. **component-models.json** — read the file, verify an entry with `"id": "{name}"` exists.

Report a PASS/FAIL for each check with details on failures.
