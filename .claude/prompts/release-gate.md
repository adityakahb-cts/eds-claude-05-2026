Release gate checklist: verify develop branch is ready to merge to main.

1. Run `git diff develop...main --name-only` to list all files changed since last release
2. Identify all blocks changed (any file under `blocks/{name}/`)
3. For each changed block, run `/block-check {blockname}`
4. Run `npm run lint` and `npm run test:unit` on the develop branch
5. Run `/pagespeed /` and `/pagespeed /{representative-path}` (at least 2 pages)
6. Run `/axe-check /` on the homepage
7. Check CI status: `gh run list --branch develop --limit 5`
8. Produce a go/no-go report:
   - List: changed blocks, all checks passed/failed
   - State: READY TO MERGE or BLOCKED (with reasons)
