Run Lighthouse CI against the AEM feature preview URL and report scores.

1. Run `git branch --show-current` to get the current branch name
2. Run `gh repo view --json nameWithOwner` to get `{owner}/{repo}`
3. Construct the preview URL: `https://{branch}--{repo}--{owner}.aem.page{path}`
   where `{path}` is the argument (default: `/`)
4. Run: `npx @lhci/cli@0.14 autorun --collect.url="{URL}" --assert.preset=lighthouse:all --assert.assertions.performance=error --assert.assertions.accessibility=error`
5. Report: performance, accessibility, best-practices, and SEO scores
6. If any score is below 100, list the failing audits with their descriptions
7. Exit with a clear PASS or FAIL summary

The argument $ARGUMENTS is the path to check (e.g. `/`, `/about`).
