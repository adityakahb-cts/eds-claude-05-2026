Pre-PR checklist for a block before opening a pull request.

Run the following checks for the block named in the user's message:

1. Run `/block-check {blockname}` — verify all 6 files, no innerHTML, scoped CSS, CONTENT_MODEL.id, component-models entry
2. Run `npm run lint` — verify 0 ESLint and Stylelint errors
3. Run `npm run test:unit` — verify all unit tests pass
4. Run `/run-e2e {blockname}` — verify Playwright spec passes in Chromium
5. Run `/axe-check /{path}` on a page that uses this block — verify 0 critical violations
6. Run `/pagespeed /{path}` — verify Lighthouse score is 100/100
7. Summarize: PASS/FAIL per check; list any failures with remediation steps
