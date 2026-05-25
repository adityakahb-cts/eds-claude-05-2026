Run axe-core accessibility audit on a page using Playwright.

1. Start a Playwright browser (headless Chromium)
2. Navigate to `http://localhost:3000{path}` where `{path}` is $ARGUMENTS (default: `/`)
3. Inject axe-core from CDN: `https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.9.1/axe.min.js`
4. Run `axe.run()` and collect violations
5. Group violations by WCAG level and impact (critical → serious → moderate → minor)
6. Print each violation: impact, WCAG criteria, description, affected elements
7. Exit 1 if any critical violations exist; exit 0 otherwise
8. Print a summary: total violations, critical count, serious count

Use the Playwright MCP tools (browser_navigate, browser_evaluate, browser_snapshot) to perform the audit.
