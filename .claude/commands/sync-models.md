Sync CONTENT_MODEL exports with component-models.json.

1. Find all files matching `blocks/*/*.model.js`
2. For each file, read it and extract the `CONTENT_MODEL` export (the `id` and `fields` values)
3. Read `component-models.json`
4. For each block's CONTENT_MODEL, find the matching entry in component-models.json (matched by `id`)
5. Report any mismatches:
   - Missing entry in component-models.json
   - `id` mismatch
   - `fields` array length or field `name` mismatch
6. Ask the user if they want to patch component-models.json to match the model.js exports
7. If yes, update component-models.json to add or update the mismatched entries
