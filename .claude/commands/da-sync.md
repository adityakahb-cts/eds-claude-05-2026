Verify authored pages using a block render correctly against its content model.

Uses da-live-admin MCP tools to verify authored content.

1. Use `da_list_sources` to find all pages in the content repository
2. Filter pages that reference the block named $ARGUMENTS
3. For each matching page (up to 5):
   a. Use `da_get_source` to read the authored page content
   b. Check that the block table structure matches the block's `{blockname}.md` content model
   c. Report: page path, block found (yes/no), structure match (yes/no), any field mismatches
4. If no authored pages exist, suggest creating a test page with `da_create_source`
5. Use `da_lookup_fragment` to verify nav/footer fragments if the block is header or footer

The argument $ARGUMENTS is the block name to check (e.g. `header`, `footer`, `fragment`).
