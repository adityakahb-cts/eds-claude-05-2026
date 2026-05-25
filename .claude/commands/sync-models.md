---
description: Sync per-block {name}.model.json files → component-models.json and cross-validate with CONTENT_MODEL JS exports
---

Sync block content models across the three layers that define them.

## Architecture

There are three places that define a block's content model:

| Layer                      | File                                              | Consumer                                                 |
| -------------------------- | ------------------------------------------------- | -------------------------------------------------------- |
| **JSON (source of truth)** | `blocks/{name}/{name}.model.json`                 | `/sync-models` merges these into `component-models.json` |
| **Aggregated JSON**        | `component-models.json` (root)                    | AEM Universal Editor / da.live authoring UI              |
| **JS export**              | `blocks/{name}/{name}.model.js` → `CONTENT_MODEL` | Block JavaScript, `/block-check`, unit tests             |

`fragment` is the only exception — it has no `.model.json`, no `CONTENT_MODEL`, and no `component-models.json` entry.

---

## Step 1 — Collect per-block model JSON files

```sh
find blocks -name "*.model.json" | sort
```

Read each file. Build an in-memory array of all block model objects (each has `id` and `fields`).

---

## Step 2 — Regenerate component-models.json

Sort the collected entries alphabetically by `id` and write them to `component-models.json` as a
JSON array. Do not add extra keys, comments, or metadata — the file must be valid JSON that
da.live can parse.

Report which entries were added, updated, or unchanged.

---

## Step 3 — Cross-validate JS CONTENT_MODEL exports

```sh
find blocks -name "*.model.js" | sort
```

For each `.model.js` that exports `CONTENT_MODEL`:

1. Compare `CONTENT_MODEL.id` against the matching `.model.json` `id`.
2. Compare `CONTENT_MODEL.fields` length and each field's `name` against the JSON.
3. Check that every field has `required: true` or `required: false` (never omitted).
4. Check that `CONTENT_MODEL.variations` array is present.

Report mismatches as warnings. Do **not** auto-patch `.model.js` files — JS exports can contain
richer metadata (e.g. `variations`, `description`) than the JSON. Prompt the developer to fix
discrepancies manually.

---

## Step 4 — Report

Print a summary table:

| Block  | `.model.json` | `component-models.json` | `CONTENT_MODEL` (JS)                     | Status |
| ------ | ------------- | ----------------------- | ---------------------------------------- | ------ |
| form   | ✅            | ✅ updated              | ⚠️ no CONTENT_MODEL (upstream exception) | OK     |
| header | ✅            | ✅ unchanged            | ✅ in sync                               | OK     |
| footer | ✅            | ✅ unchanged            | ✅ in sync                               | OK     |

Exit with a non-zero status if any block has a `.model.json` entry that differs from
`component-models.json` after the write step (sanity check).

---

## Notes

- **Adding a new block:** Run `/new-block <name>` — it creates the `.model.json` automatically.
  Then run `/sync-models` to update `component-models.json`.
- **Removing a block:** Delete `blocks/{name}/` and its `.model.json`, then run `/sync-models`.
- **`fragment` block:** Never add a `.model.json` for `fragment` — it has no da.live content model.
