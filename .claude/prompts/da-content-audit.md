Audit all authored pages in da.live for content model compliance.

1. Use `da_list_sources` to list all pages in the content repository
2. For each page:
   a. Use `da_get_source` to read the page content
   b. Parse block tables — extract block names from the first cell of each table
   c. For each block name found: verify it exists in `component-models.json`
   d. Flag: orphaned block names (not in component-models.json), misspelled block names (edit distance 1–2 from a known block)
3. Produce a report:
   - Total pages scanned
   - Pages with unknown block names (list page + block name)
   - Suggested corrections for misspelled block names
