Run the Playwright e2e spec for a single block.

1. Verify `blocks/$ARGUMENTS/$ARGUMENTS.spec.js` exists
2. Run: `npx playwright test blocks/$ARGUMENTS/$ARGUMENTS.spec.js --reporter=list`
3. Stream the output
4. On failure: print the path to the trace file and run `npx playwright show-trace` command for the user to inspect

The argument $ARGUMENTS is the block name (e.g. `header`, `footer`, `fragment`).
