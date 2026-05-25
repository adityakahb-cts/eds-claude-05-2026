Environment sign-off checklist for QA Manager.

Run this before promoting an environment (dev → qa, qa → uat, uat → prelive, prelive → prod).

1. Determine target environment from user message (qa/uat/prelive/prod)
2. Construct the base URL for that environment:
   - qa: `develop--{repo}--{owner}.aem.page`
   - uat: `uat--{repo}--{owner}.aem.page`
   - prelive/prod: `main--{repo}--{owner}.aem.page`
3. Run `/axe-check /` on the homepage
4. Run `/axe-check /` on 2 more representative pages (ask user which pages)
5. Run `/pagespeed /` on the homepage
6. Run `/pagespeed /` on 2 more representative pages
7. Run `npm run test:unit` (for qa/uat) or confirm CI green (for prelive/prod)
8. Produce a structured sign-off checklist:
   - [ ] axe-check homepage: PASS/FAIL
   - [ ] axe-check page 2: PASS/FAIL
   - [ ] axe-check page 3: PASS/FAIL
   - [ ] PageSpeed homepage: score/100
   - [ ] PageSpeed page 2: score/100
   - [ ] PageSpeed page 3: score/100
   - [ ] Unit tests: PASS/FAIL
   - [ ] Manual smoke: (filled by QA)
   - Overall: APPROVED / BLOCKED
