# EDS Site

> Built with Adobe Edge Delivery Services · No build steps · Lighthouse 100 target

This is a mobile-first website built on [Adobe Edge Delivery Services (EDS)](https://www.aem.live/docs/). Content is authored in da.live (or SharePoint / Google Drive), delivered via Adobe's CDN, and decorated by vanilla JavaScript blocks — no bundler, no framework, no build step.

---

## Quick Start

```sh
git clone https://github.com/adityakahb-cts/eds-claude-05-2026.git
cd eds-claude-05-2026
npm install
npx -y @adobe/aem-cli up --no-open --forward-browser-logs &
```

Then open **http://localhost:3000** in your browser.

> The dev server auto-reloads when you save files. Stop it with `fg` then `Ctrl+C` (macOS/Linux).

---

## Architecture Overview

Adobe Edge Delivery Services is a CDN-first publishing platform with no build step. Authors create content in da.live. That content is converted to clean HTML by Adobe's backend and served from the edge. Your JavaScript and CSS live in this repository and are applied on top. Because there is no bundler, every script is a native ES module and every network request is a plain HTTP fetch — which is why Lighthouse 100 is achievable by default.

Pages are loaded in three phases to keep the site fast. The **eager phase** runs immediately: it decorates the DOM into sections and blocks, then loads only the first section so the Largest Contentful Paint (LCP) image or heading appears as quickly as possible. The **lazy phase** follows after LCP is done: it loads the header, footer, and all below-the-fold content. The **delayed phase** (triggered 3 seconds after page load) handles analytics, scroll libraries like Lenis, and anything else that is safe to defer. Every block is a self-contained folder inside `blocks/` containing a JavaScript decorator, a CSS file, a content model document, a model file for da.live, and test files — the "6-file convention". Design tokens (colors, typography, spacing, breakpoints) live in `styles/config/` as CSS custom properties and are the single source of truth for the visual language.

Content in da.live is organized across four structural folders: **`__authorables/`** (reference pages for every spawn element type — buttons, images, alerts, etc., with all variations), **`__experience-fragments/`** (nav and footer shared by all pages), **`__content-fragments/`** (reusable sections imported via the `fragment` block), and **`__blocks/`** (one showcase page per block). Site pages — home, detail, landing — live in the root and compose blocks from all four folders. Every spawn type and every block has its own dedicated page; nothing is bundled into a single index.

---

## For Your Role

### Scrum Master / Project Manager

**Day 1:** Clone the repo, read this README and `AGENTS.md`, then open the [GitHub project board](https://github.com/adityakahb-cts/eds-claude-05-2026) to see the current sprint. Confirm you have access to da.live for content previews and to GitHub for PR oversight. Run `git branch -a` to see the branch structure (`main`, `develop`, `uat`, plus active `feat/*` branches).

**Done means:** Sprints are time-boxed (recommended two weeks). A sprint is "done" when all `feat/*` branches for that sprint have merged to `develop`, the `develop` branch has passed QA sign-off, been promoted to `uat`, validated by stakeholders, and the release PR from `uat` to `main` has been approved and merged. The live site at `https://main--eds-claude-05-2026--adityakahb-cts.aem.live/` reflects the latest sprint work.

**When blocked:** If a PR is stuck in review, tag the Frontend Manager. If a CI check is failing and no developer is available, check GitHub Actions logs under the **Actions** tab. For process questions, the escalation path is: Senior Dev → Frontend Manager → stakeholder. Never merge to `main` without the Frontend Manager's explicit approval.

**Branch and release lifecycle:**

| Branch    | Created by      | Merged to    | Gate                            |
| --------- | --------------- | ------------ | ------------------------------- |
| `feat/*`  | Any developer   | `develop`    | Senior Dev review + CI green    |
| `fix/*`   | Any developer   | `develop`    | Senior Dev review + CI green    |
| `develop` | Standing branch | `uat`        | QA Manager sign-off             |
| `uat`     | Standing branch | `main`       | Stakeholder sign-off + CI green |
| `main`    | Standing branch | (production) | Frontend Manager only           |

Sprint ceremonies: daily standup, sprint planning at the start of each sprint, backlog refinement mid-sprint, retrospective and demo at the end.

---

### Product Owner

**Day 1:** Get access to [da.live](https://da.live/#/adityakahb-cts/eds-claude-05-2026) using your Adobe ID. Open the preview URL for the current branch: `https://main--eds-claude-05-2026--adityakahb-cts.aem.page/`. Browse the site to understand what has been built. Open `/__blocks/index` in da.live to see the block catalog and available content models.

**Done means:** Content you have authored in da.live has been previewed (click "Preview" in da.live), reviewed on the preview URL, and published (click "Publish" in da.live). Published content appears on the live site within seconds. New feature requests have been written as user stories, reviewed by the BA and Frontend Manager, and added to the backlog.

**When blocked:** If a page preview looks wrong, check whether the right block name was used in the content table. If a block does not exist yet, file a request as a GitHub Issue describing what the block should do, attaching a screenshot or sketch. If da.live is not responding, check [Adobe Status](https://status.adobe.com/).

**Content folder overview:**

| Folder                    | What it contains                                         |
| ------------------------- | -------------------------------------------------------- |
| `__authorables/`          | Design-system reference: all spawn element variations    |
| `__experience-fragments/` | Nav and footer shared across all pages                   |
| `__content-fragments/`    | Reusable page sections included via the `fragment` block |
| `__blocks/`               | Block showcase: one page per available block             |

**Content workflow:**

1. Open [da.live](https://da.live/#/adityakahb-cts/eds-claude-05-2026) and navigate to the page you want to edit.
2. Edit the document — use block tables to structure content (e.g., a `hero` table for a hero block).
3. For placeholder images, use `https://placehold.co/{width}x{height}` until real assets are ready.
4. Click **Preview** — da.live generates a preview URL: `https://main--eds-claude-05-2026--adityakahb-cts.aem.page/your-page`.
5. Review the preview in your browser.
6. Click **Publish** to push to the live site.

---

### Business Analyst

**Day 1:** Read `AGENTS.md` (project coding rules), then open `component-models.json` to see the current block definitions. For each block, open its `blocks/{blockname}/{blockname}.md` file to understand the authored content model — the table format shows exactly what each cell in the block table does. Talk to the Product Owner about which business requirements map to which blocks.

**Done means:** Every new block request has an acceptance criteria document written in this format:

- **Given** a content author creates a `[block name]` table in da.live with `[specific fields]`
- **When** the page is previewed
- **Then** the rendered output shows `[specific behavior]` and passes Lighthouse 100

Requirements have been mapped to block names and cell structures in `component-models.json`. The content model has been reviewed by the Senior Frontend Developer and signed off before any code is written.

**When blocked:** If a business requirement cannot be mapped to an existing block, file a GitHub Issue describing the requirement in plain language and tag the Frontend Manager. If the content model is ambiguous, arrange a three-way review between the PO, BA, and Senior Dev.

**Block content model as user story example:**

```
As a content author,
I want to create a "cards" block with a title and up to 6 card items (image + heading + description + link),
So that I can display a grid of product highlights on the homepage.

Acceptance criteria:
- Block name in da.live: "cards"
- Each card row: image (col 1) | heading text (col 2) | description text (col 3) | CTA link (col 4)
- Title row: single cell spanning all columns
- Renders as responsive grid: 1 col mobile, 2 col tablet (≥600px), 3 col desktop (≥900px)
- Lighthouse 100 on feature preview URL
- axe-core reports zero violations
```

---

### UX / UI Designer

**Day 1:** Open `styles/config/colors.css` to see the full color token system, `styles/config/typography.css` for type scale, and `styles/config/grid.css` for the breakpoint grid. These are the CSS custom properties your designs must map to. Review `styles/config/themes.css` to see how light and dark mode are handled with semantic tokens.

**Done means:** Every design deliverable includes a token mapping table showing which `--color-*`, `--font-size-*`, and `--spacing-*` CSS custom properties correspond to which design elements. New tokens needed by a design have been proposed to the Senior Dev and added to the appropriate `styles/config/` file before the design is handed off. The handoff checklist below is complete.

**When blocked:** If a required design token does not exist yet, open a GitHub Issue with the token name, value, and intended usage. If a design uses a third-party font not already in `styles/fonts.css`, confirm licensing and check font file size with the Frontend Manager before proceeding.

**Design token system:**

| Token category | File                           | Example variables                                           |
| -------------- | ------------------------------ | ----------------------------------------------------------- |
| Colors         | `styles/config/colors.css`     | `--color-primary`, `--color-neutral-900`                    |
| Themes         | `styles/config/themes.css`     | `--color-background`, `--color-text` (semantic)             |
| Typography     | `styles/config/typography.css` | `--font-size-m`, `--font-weight-bold`, `--line-height-body` |
| Spacing        | `styles/config/globals.css`    | `--spacing-xs`, `--spacing-m`, `--spacing-xl`               |
| Grid           | `styles/config/grid.css`       | `--grid-columns`, `--grid-gap`                              |
| Buttons        | `styles/config/buttons.css`    | `--button-border-radius`, `--button-padding`                |

**Breakpoints (mobile-first, `width >=` range syntax):**

| Token | Value  | CSS partial | Typical usage                 |
| ----- | ------ | ----------- | ----------------------------- |
| `sm`  | 632px  | `sm.css`    | Tablet portrait               |
| `md`  | 760px  | `md.css`    | Tablet landscape              |
| `lg`  | 992px  | `lg.css`    | Small desktop                 |
| `xl`  | 1272px | `xl.css`    | Standard desktop              |
| `xxl` | 1432px | `xxl.css`   | Wide desktop / large monitors |

**Dark mode:** Use semantic tokens from `themes.css` (e.g., `--color-background`, `--color-text`) rather than raw color values. The `@media (prefers-color-scheme: dark)` block in `themes.css` automatically maps these to the dark palette.

**Handoff checklist:**

- [ ] All colors reference `--color-*` tokens, no raw hex values
- [ ] Typography uses `--font-size-*` and `--font-weight-*` tokens
- [ ] Spacing uses `--spacing-*` tokens
- [ ] Designs shown at 375px, 600px, 900px, and 1200px widths
- [ ] Dark mode variant included for any new semantic color tokens
- [ ] Accessibility: contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text

---

### Content Author

**Day 1:** Get access to [da.live](https://da.live/#/adityakahb-cts/eds-claude-05-2026) using your Adobe ID. Open the `__blocks/index` page to see what blocks are available and how they are authored. Notice that content is organized as a Google-Docs-style document where you insert tables to add structured blocks (carousels, cards, heroes, etc.). Review the block catalog in `component-models.json` to learn what each cell does.

**Done means:** Pages you author in da.live look correct when previewed at `https://main--eds-claude-05-2026--adityakahb-cts.aem.page/your-page`. Text, images, links, and interactive blocks all render as expected. You have clicked **Publish** to push content live, and verified it on `https://main--eds-claude-05-2026--adityakahb-cts.aem.live/your-page`.

**When blocked:** If a preview does not match your expectation, check that the block table name exactly matches the block catalog. Block names are case-sensitive and hyphenated (e.g., `cards`, `hero`, `accordion`). If a block is missing entirely, file a request via the BA. For da.live access issues, contact your Adobe admin.

**da.live folder structure:**

| Folder                    | What lives here                                                                                                | You can edit?                |
| ------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `__authorables/`          | Reference pages: all button, image, link, paragraph, badge, alert, heading, blockquote, and divider variations | View only                    |
| `__experience-fragments/` | Nav and footer fragments                                                                                       | Yes — with Senior Dev review |
| `__content-fragments/`    | Shared content imported into pages via the `fragment` block                                                    | Yes                          |
| `__blocks/`               | Block showcase pages (one page per block)                                                                      | View + new pages             |
| Root / other folders      | Actual site pages (home, detail, landing, etc.)                                                                | Yes                          |

**Separation rule — what gets its own page vs what shares a page:**

| These are on **separate pages**          | These are on the **same page**                           |
| ---------------------------------------- | -------------------------------------------------------- |
| Anchor vs Button (different spawn types) | All anchor variations (primary, outline, sm, lg, pill…)  |
| Hero block vs Teaser block               | All hero variations (default, dark, full-bleed, compact) |
| `/home` vs `/detail` vs `/landing`       | —                                                        |

Every spawn element type has one page in `__authorables/` with all its variations. Every block has one page in `__blocks/` with all its variations. Separate page types are separate pages.

**Day-to-day workflow:**

1. Open da.live → navigate to your page.
2. Insert a block table: the first cell is the block name, rows below are the content fields.
3. For images you do not have yet, use a placeholder from [placehold.co](https://placehold.co/) — e.g., `https://placehold.co/800x450/1e40af/ffffff` (width × height, background hex, text hex). Size to the block's documented slot dimensions.
4. Click **Preview** to see your changes at the `.aem.page` URL.
5. Click **Publish** to push live.

**Spawn directives** — inline styled elements can be authored directly in the document body using spawn markers. Example for a primary button:

```
{{spawn:start;element:anchor;theme:primary;href:/contact}}Get in touch{{spawn:end}}
```

The full list of spawn element types and supported parameters is documented in `/__authorables/` on da.live (one page per element type). Do not delete or move spawn markers — they are processed by the page decoration script.

**Placeholder images:** Use [placehold.co](https://placehold.co/) during authoring until production assets are ready:

```
https://placehold.co/800x450        — landscape 16:9
https://placehold.co/400x400        — square thumbnail
https://placehold.co/1200x400       — wide banner
https://placehold.co/400x400/7c3aed/ffffff — custom colour
```

**Content model reference:** Each block's expected table structure is documented in `blocks/{blockname}/{blockname}.md`. If you need a content model changed (e.g., add a new optional field to a block), open a GitHub Issue describing what you need and tag the BA and Frontend Manager.

---

### Architect / Tech Manager

**Day 1:** Read `AGENTS.md` (the authoritative coding rules for this project) and `claude-plan.md` (the detailed implementation plan and current codebase status). Run `npm install && npx -y @adobe/aem-cli up --no-open &` and open `http://localhost:3000`. Run `npm run lint` and `npm test` to see the current test baseline.

**Done means:** The architecture supports Lighthouse 100 on every page in production. All `feat/*` PRs pass the CI gate (lint + unit tests + E2E + PageSpeed). The CSS `@layer` cascade is clean, the block convention (6 files) is followed consistently, and no block uses `innerHTML`. Security headers are managed via `metadata.xlsx` rather than server config.

**When blocked:** Check the [AEM Edge Delivery documentation](https://www.aem.live/docs/) for platform constraints. For questions about Adobe's CDN or code sync pipeline, reach out via the Adobe Partner program. For architectural decisions that affect more than one block, call a design review with the Senior Dev and QA Manager before coding begins.

**Why EDS:**

- **No build step** — code is served as-is from this repo via AEM Code Sync. No webpack, no Vite, no Babel. Instant deployments.
- **CDN-first** — every asset is served from Adobe's global CDN. Time-to-first-byte is typically under 100ms.
- **Lighthouse 100 by default** — the platform is designed for perfect scores. Performance regressions are caught by the `budget.json` gate: LCP ≤ 2500ms, CLS ≤ 0.1, INP ≤ 200ms, TBT ≤ 200ms.

**Three-phase loading:**

| Phase   | Trigger                   | What loads                            |
| ------- | ------------------------- | ------------------------------------- |
| Eager   | Page load starts          | First section (LCP content), core CSS |
| Lazy    | After LCP paint           | Header, footer, remaining sections    |
| Delayed | 3 seconds after page load | Analytics, Lenis, third-party scripts |

**CSS `@layer` order** (from `styles/styles.css`):

```
reset → base → layout → blocks → utilities → overrides
```

Lower layers cannot override higher layers. `overrides` is intentionally last for one-off fixes.

**Block convention (6 files per block):**

```
blocks/{name}/
├── {name}.js         # decorate(block) function
├── {name}.css        # scoped styles
├── {name}.model.js   # CONTENT_MODEL + *_MARKUP templates
├── {name}.md         # authored content model (author-developer contract)
├── {name}.test.js    # Vitest unit tests
└── {name}.spec.js    # Playwright E2E tests
```

**Security posture:** CSP and anti-clickjack headers are set via `metadata.xlsx` (the EDS way — no `.htaccess` or server config). No `innerHTML` — all HTML construction uses the `html` tagged-template from `scripts/config/html.js`. No secrets in the repo; `.env` files are blocked by Husky pre-commit hook.

---

### Frontend Developer (Senior)

**Day 1:** Clone, `npm install`, start the dev server, open `http://localhost:3000`. Read `AGENTS.md` thoroughly — it is the coding contract. Run `npm run lint` and `npm test` to understand the current baseline. Review the open PRs on GitHub and assign yourself to the most critical unblocked one.

**Done means:** Every block you build or review follows the 6-file convention, passes `npm run lint`, all tests pass (`npm test`), and the feature preview URL scores Lighthouse 100 via `npm run pagespeed` (or the `/pagespeed` slash command). Junior dev PRs you have reviewed have clear, actionable feedback. New blocks are scaffolded with `/new-block <name>` so no convention files are missing.

**When blocked:** Check `claude-plan.md` for architecture context. For EDS platform behavior questions, search `site:www.aem.live`. For questions about block content models, consult the BA and PO before writing code.

**Full dev workflow:**

```sh
git checkout develop
git pull
git checkout -b feat/my-feature
# ... code ...
npm run lint:fix
npm test
git push -u origin feat/my-feature
# open PR to develop on GitHub
```

**Block authoring (`model.js`):** Use the `html` tagged-template from `scripts/config/html.js` for all markup templates — never `innerHTML` or `/* html */` strings. Export `CONTENT_MODEL` and `*_MARKUP` (DOM templates). Every `CONTENT_MODEL` field must include `required: true/false`. All named variations must be listed in a `variations` array with their da.live authoring syntax. The `fragment` block is the only exception — no `CONTENT_MODEL`, no CSS.

**Block documentation (`.md`):** Each block's `.md` must contain 8 sections: Overview, Content Model table, Field Definitions table, Variations (one table per variant), Authoring Guidelines, CSS Classes Generated, Performance Notes, Accessibility. Use `/new-block` to scaffold the correct template.

**Smart block lifecycle — always check before writing:**

| Situation                                 | Command / Action                                                                                                           |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Block does not exist                      | `/new-block {name}` → CREATE mode (all 6 files + `styles/` + draft HTML)                                                   |
| Block exists, need to change JS/CSS/model | `/new-block {name}` → UPDATE mode (edit specific files only; never overwrite tests)                                        |
| Block exists, need a new visual variant   | `/new-block {name} {variant}` → ADD_VARIATION mode (BEM modifier `.{name}--{variant}`, CSS, `.md` table, da.live instance) |

Block variations (`.hero--dark`, `.hero--full-bleed`) belong on the **same** `/__blocks/hero` da.live page — never as a separate block directory or separate da.live page.

**Fragment-loader pattern:** Use `fetchFragmentHtml(loadFragmentFn, metaKey, defaultPath)` from `scripts/config/fragment-loader.js` to load header and footer content from da.live fragments. Do not hardcode fragment paths.

**Spawn system:** `decorateSpawnElements` in `scripts/config/global-decorators.js` handles `{{spawn:start;element:…}}` directives. Do not reimplement this logic in blocks.

**PR review responsibilities:** All `feat/*` → `develop` PRs require one Senior Dev review plus Frontend Manager approval. Check: lint passes, tests pass, Lighthouse 100, no `innerHTML`, JSDoc on all exported functions, block `.md` updated if content model changed.

**Slash commands available:**

| Command        | What it does                                               |
| -------------- | ---------------------------------------------------------- |
| `/new-block`   | Scaffold all 6 block files + `component-models.json` entry |
| `/block-check` | Validate a block against all project conventions           |
| `/pagespeed`   | Run Lighthouse CI against the current branch preview URL   |
| `/axe-check`   | Run axe-core accessibility audit via Playwright            |
| `/sync-models` | Sync `CONTENT_MODEL` exports to `component-models.json`    |
| `/da-sync`     | Verify authored pages render correctly against model       |
| `/qa-sign-off` | Run full QA sign-off checklist for environment promotion   |

---

### Frontend Developer (Junior)

**Day 1:** Clone the repo and get running in 5 steps:

1. `git clone https://github.com/adityakahb-cts/eds-claude-05-2026.git && cd eds-claude-05-2026`
2. `npm install`
3. `npx -y @adobe/aem-cli up --no-open &`
4. Open `http://localhost:3000`
5. Open `blocks/header/header.js` to see how a block is structured.

Then read `AGENTS.md` — especially the JavaScript code standards and the `decorate()` function pattern. Every new block you write must follow those rules.

**Done means:** The block or fix you built renders correctly at `http://localhost:3000` on your local machine. `npm run lint` reports zero errors. `npm run test:unit` passes for your block's `.test.js`. You have opened a PR to `develop` using the PR template (fill in the before/after preview URL). Your PR has been reviewed by the Senior Dev with no blocking comments.

**When blocked:** First, check the existing blocks in `blocks/` for examples — `header` and `footer` show real-world patterns. If you are unsure about a CSS approach, look at the files in `styles/config/`. If you are stuck after 30 minutes, ask the Senior Dev — do not spin your wheels alone.

**Where to find examples:**

- Block JS: `blocks/header/header.js`, `blocks/footer/footer.js`
- CSS breakpoint partials: look at `styles/config/grid.css` — use `min-width` at `600px`, `900px`, `1200px`
- Test structure: `blocks/header/header.test.js`
- E2E test structure: `tests/e2e/header.spec.js`

**CSS rule:** All selectors in a block's `.css` file must be scoped to the block. Write `.hero .title`, not just `.title`. Never use classes ending in `-container` or `-wrapper` on the block root.

**Smart block lifecycle for junior devs — always check first:**

```sh
ls blocks/my-block/ 2>/dev/null && echo "EXISTS — use UPDATE or ADD_VARIATION" || echo "NEW — use CREATE"
```

- `NEW`: run `/new-block my-block` in Claude Code — it scaffolds all 6 files automatically
- `EXISTS` + change needed: run `/new-block my-block` and choose UPDATE — edit only the relevant files
- `EXISTS` + new variant: run `/new-block my-block dark` — adds BEM modifier, CSS rules, and `.md` variation table

**Before opening a PR, check:**

- [ ] `npm run lint` — zero errors
- [ ] `npm run test:unit` — all tests pass
- [ ] Block renders at `http://localhost:3000` without console errors
- [ ] Run `/block-check {blockname}` in Claude Code to validate all 6 files, no `innerHTML`, scoped CSS
- [ ] PR description includes the feature preview URL for your branch

---

### QA Engineer (Senior)

**Day 1:** Install Playwright browser binaries: `npx playwright install`. Run the existing E2E suite: `npm run test:e2e`. Review the spec files in `tests/e2e/` and the block-level specs (`blocks/**/*.spec.js`). Understand the test data isolation pattern: each spec sets its own meta tags for nav and footer paths so tests do not depend on live content.

**Done means:** Every new block has a corresponding Playwright spec covering: renders without JS errors, is keyboard navigable, passes axe-core (`/axe-check` command), and meets the Lighthouse budget (LCP ≤ 2500ms, CLS ≤ 0.1, INP ≤ 200ms, TBT ≤ 200ms). Environment sign-off requires: all Playwright specs green, PageSpeed 100 on 3 representative pages, zero axe violations, and visual regression baseline captured.

**When blocked:** If a test is flaky due to timing, add `await page.waitForSelector()` rather than arbitrary `sleep`. For EDS-specific rendering questions (e.g., why a block does not appear in the DOM), use `curl http://localhost:3000/path.plain.html` to inspect the raw decorated HTML. For Playwright API questions, check the [Playwright docs](https://playwright.dev/docs/intro).

**Spec authoring guide:**

```js
// tests/e2e/my-block.spec.js
import { test, expect } from '@playwright/test';

test.describe('my-block', () => {
  test.beforeEach(async ({ page }) => {
    // Set meta tags for test isolation — override nav/footer with lightweight stubs
    await page.route('**/nav.plain.html', (route) => route.fulfill({ body: '<p>nav</p>' }));
    await page.route('**/footer.plain.html', (route) => route.fulfill({ body: '<p>footer</p>' }));
    await page.goto('/drafts/my-block.html');
  });

  test('renders block without errors', async ({ page }) => {
    await expect(page.locator('.my-block')).toBeVisible();
  });
});
```

**Axe-core integration:** Use the `/axe-check` slash command in Claude Code, or integrate `@axe-core/playwright` in your spec:

```js
import AxeBuilder from '@axe-core/playwright';
const results = await new AxeBuilder({ page }).analyze();
expect(results.violations).toHaveLength(0);
```

**Visual regression baseline process:** After a new block lands on `develop`, run `npm run test:e2e` with `--update-snapshots` to capture the baseline. Commit the snapshots. Future runs will diff against this baseline. Run `/qa-sign-off` before promoting `develop → uat`.

**Environment sign-off criteria:**

| Gate          | Tool                      | Pass condition                       |
| ------------- | ------------------------- | ------------------------------------ |
| Unit tests    | `npm run test:unit`       | All green                            |
| E2E tests     | `npm run test:e2e`        | All green                            |
| Accessibility | axe-core via `/axe-check` | Zero violations                      |
| Performance   | `/pagespeed`              | LCP ≤ 2500ms, CLS ≤ 0.1, INP ≤ 200ms |
| Visual        | Playwright snapshots      | No unexpected diffs                  |

---

### QA Engineer (Junior)

**Day 1:** Get access to the QA environment: `https://develop--eds-claude-05-2026--adityakahb-cts.aem.page/`. Open every page linked from the homepage and run the manual smoke checklist below. Install the browsers you need for the browser matrix: Chrome, Firefox, Safari (macOS only), and check a mobile viewport in Chrome DevTools.

**Done means:** Every page in the release scope has been smoke-tested across the full browser matrix. All bugs found have been filed as GitHub Issues using the bug template below. The QA Manager has reviewed your issue list and confirmed there are no open blockers before sign-off.

**When blocked:** If a page will not load, check whether the AEM Code Sync app has processed the latest push (look at GitHub Actions → "AEM Code Sync" status). If a block looks broken only in one browser, capture a screenshot and note the browser version in your bug report. For test environment access issues, contact the DevOps engineer.

**Manual smoke testing checklist (per page, per environment):**

- [ ] Page loads with no console errors (open DevTools → Console)
- [ ] LCP element is visible without scrolling
- [ ] All images display (no broken image icons)
- [ ] All links are clickable and go to the correct destination
- [ ] Navigation menu opens and closes correctly
- [ ] Footer links are present and correct
- [ ] Page is readable and functional on mobile viewport (375px wide)
- [ ] No horizontal scrollbar on mobile
- [ ] Forms (if present) submit without errors

**da.live content verification steps:**

1. Open da.live and find the page you want to verify.
2. Click **Preview** to generate a `.aem.page` preview URL.
3. Compare the preview against the content in da.live — verify text, images, and block structure.
4. If preview does not match, check the block table structure against `component-models.json`.

**Bug filing template (use for every GitHub Issue you file):**

```
**URL:** https://develop--eds-claude-05-2026--adityakahb-cts.aem.page/path-to-page
**Environment:** QA / UAT / Production
**Browser:** Chrome 124 / Firefox 125 / Safari 17.4 / Mobile Chrome on iOS 17
**Screenshot:** [attach screenshot]

**Steps to reproduce:**
1. Open the URL above
2. ...

**Expected:** [What should happen]
**Actual:** [What actually happens]
```

**Browser matrix:**

| Browser       | Versions to test        |
| ------------- | ----------------------- |
| Chrome        | Latest stable           |
| Firefox       | Latest stable           |
| Safari        | Latest (macOS)          |
| Mobile Chrome | Latest (375px viewport) |

---

### DevOps / Platform

**Day 1:** Confirm the [AEM Code Sync GitHub App](https://github.com/apps/aem-code-sync) is installed on this repository (it enables the `aem.page` / `aem.live` pipeline). Check GitHub Actions → **Actions** tab to verify the `main.yaml` workflow is running on pushes. Review `budget.json` for the Lighthouse CI performance budget. Confirm branch protection rules are in place on `main` and `develop`.

**Done means:** Every PR to `develop` and `main` must pass all required status checks before merging: lint, unit tests, E2E tests, and PageSpeed. No direct pushes to `main` are possible. The `develop → uat → main` promotion path is gated by CI. Lighthouse scores are captured on every PR and regressions block merging.

**When blocked:** For AEM Code Sync pipeline failures, check the [AEM Status page](https://status.adobe.com/) and the Code Sync app's GitHub installation logs. For GitHub Actions quota or runner issues, check the organization's billing settings. For Lighthouse CI failures, run `/pagespeed` locally to reproduce before investigating CI configuration.

**GitHub Actions workflows:**

| Workflow                | File                                       | Triggers                  | What it does                               |
| ----------------------- | ------------------------------------------ | ------------------------- | ------------------------------------------ |
| Main CI                 | `.github/workflows/main.yaml`              | Push to any branch, PR    | Lint (ESLint + Stylelint)                  |
| Full PR gate (`ci.yml`) | `.github/workflows/ci.yml`                 | PR to `develop` or `main` | Lint + unit tests + E2E + PageSpeed        |
| Release gate            | `.github/workflows/release.yml`            | PR `develop → main`       | Promote gate: all CI + UAT sign-off status |
| Code Sync cleanup       | `.github/workflows/cleanup-on-create.yaml` | Repo creation (one-time)  | Removes boilerplate placeholder files      |

**Branch protection rules (set these in GitHub → Settings → Branches):**

For `main`:

- Require pull request before merging
- Require status checks: `quality`, `e2e`, `pagespeed`
- Require branches to be up to date before merging
- Do not allow direct pushes — Frontend Manager merges only

For `develop`:

- Require pull request before merging
- Require status checks: `quality`, `e2e`
- Require branches to be up to date before merging

**AEM Code Sync overview:** When a branch is pushed to this repo, AEM Code Sync automatically makes it available at `https://{branch}--eds-claude-05-2026--adityakahb-cts.aem.page/`. No deployment step needed — the CDN serves code directly from the GitHub branch. For `main`, the live site at `https://main--eds-claude-05-2026--adityakahb-cts.aem.live/` is updated automatically.

**Lighthouse CI budget (`budget.json`):**

```json
{ "lcp": 2500, "cls": 0.1, "inp": 200, "tbt": 200 }
```

These are hard limits. PRs that regress any metric must be fixed before merge.

**No Docker in production:** The AEM EDS platform serves code from GitHub via its own CDN — there is no container runtime, no server, and no Docker. Docker (if used) is CI-only for running Playwright browser tests in a consistent environment.

**Security headers:** CSP and anti-clickjack headers are configured via `metadata.xlsx` in the content repository (the EDS standard approach). There is no `.htaccess` or Nginx config. To add or modify headers, update the appropriate row in `metadata.xlsx` in da.live, preview, and publish.

---

## Environment URLs

Owner: `adityakahb-cts` · Repo: `eds-claude-05-2026`

| Environment | Branch    | URL                                                              | Purpose                     |
| ----------- | --------- | ---------------------------------------------------------------- | --------------------------- |
| Dev         | `feat/*`  | `https://{branch}--eds-claude-05-2026--adityakahb-cts.aem.page/` | Developer self-verification |
| QA          | `develop` | https://develop--eds-claude-05-2026--adityakahb-cts.aem.page/    | Integration & QA testing    |
| UAT         | `uat`     | https://uat--eds-claude-05-2026--adityakahb-cts.aem.page/        | Stakeholder validation      |
| Pre-live    | `main`    | https://main--eds-claude-05-2026--adityakahb-cts.aem.page/       | Pre-production              |
| Production  | `main`    | https://main--eds-claude-05-2026--adityakahb-cts.aem.live/       | Live site                   |

To construct a URL for any branch, use the pattern:
`https://{branch}--eds-claude-05-2026--adityakahb-cts.aem.page/`

---

## Key Links

| Resource                              | URL                                                                                 |
| ------------------------------------- | ----------------------------------------------------------------------------------- |
| This repository                       | https://github.com/adityakahb-cts/eds-claude-05-2026                                |
| AGENTS.md (coding agent instructions) | [AGENTS.md](./AGENTS.md)                                                            |
| Implementation plan                   | [claude-plan.md](./claude-plan.md)                                                  |
| da.live (CMS authoring)               | https://da.live/                                                                    |
| AEM Edge Delivery documentation       | https://www.aem.live/docs/                                                          |
| Developer tutorial                    | https://www.aem.live/developer/tutorial                                             |
| Markup, sections, blocks reference    | https://www.aem.live/developer/markup-sections-blocks                               |
| Web performance guide                 | https://www.aem.live/developer/keeping-it-100                                       |
| Adobe EDS skills (all)                | https://github.com/adobe/skills/tree/main/plugins/aem/edge-delivery-services/skills |
| `content-driven-development` skill    | Use before writing block JS — confirms authored structure drives implementation     |
| `content-modeling` skill              | Interactive CONTENT_MODEL builder with required/optional/variation annotations      |
| `code-review` skill                   | Automated block diff review — innerHTML, JSDoc, CSS scope, CONTENT_MODEL sync       |
| `authoring-analysis` skill            | Audits authored da.live pages for missing fields and model drift                    |
| AEM Code Sync GitHub App              | https://github.com/apps/aem-code-sync                                               |
| Adobe Status                          | https://status.adobe.com/                                                           |
| AI coding agents tips                 | https://www.aem.live/developer/ai-coding-agents                                     |

---

_Last updated: 2026-05-25 · `fragment` block exception applied (no CSS, no CONTENT_MODEL, removed from component-models.json); `model.js` standard now requires explicit `required` on every field and a `variations` array; `.md` standard now requires 8 sections including Authoring Guidelines and Variations; four Adobe EDS skills added (content-driven-development, content-modeling, code-review, authoring-analysis). Update this file whenever a new phase is completed or a new block, workflow, or team role is added._
