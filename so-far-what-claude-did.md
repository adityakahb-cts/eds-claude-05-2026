# What Claude Code Did

## Session: 2026-05-16

### 1. ESLint Configuration Audit

Analysed ESLint config discrepancies across all three branches:

| Branch               | Config File      | Parser                 | Prettier |
| -------------------- | ---------------- | ---------------------- | -------- |
| `main`               | `.eslintrc.js`   | `@babel/eslint-parser` | No       |
| `develop`            | `.eslintrc.js`   | `@babel/eslint-parser` | No       |
| `ab-code-2026-05-14` | `.eslintrc.json` | Default                | Yes      |

Findings:

- `main` and `develop` used the legacy `.eslintrc.js` format with Babel parser
- `ab-code-2026-05-14` had a commit titled "Migrate to flat ESLint config" but had only switched to `.eslintrc.json` — still legacy format, not the actual flat config standard
- No branch had `eslint.config.js` (the true flat config format)

---

### 2. Migration to ESLint Flat Config

Completed the migration on `ab-code-2026-05-14` from `.eslintrc.json` to `eslint.config.js`.

**Files changed:**

| File                | Action                               |
| ------------------- | ------------------------------------ |
| `.eslintrc.json`    | Deleted                              |
| `eslint.config.js`  | Created                              |
| `package.json`      | Added 3 new explicit devDependencies |
| `package-lock.json` | Updated accordingly                  |

**New `eslint.config.js` approach:**

- Uses `FlatCompat` from `@eslint/eslintrc` to wrap `eslint-config-airbnb-base` and `eslint-config-prettier` (neither natively supports flat config yet)
- Migrated `ignorePatterns` → `ignores` array
- Migrated `env.browser` → `globals.browser` from the `globals` package
- Added a `files: ['eslint.config.js']` override to allow devDependency imports inside the config file itself (airbnb's `import/no-extraneous-dependencies` pattern list covers `.eslintrc.js` but not `eslint.config.js`)

**New explicit devDependencies added to `package.json`:**

- `@eslint/eslintrc` ^2.1.4 — provides `FlatCompat` for wrapping legacy configs
- `@eslint/js` ^8.57.0 — ships with ESLint 8.57 but made explicit
- `globals` ^13.24.0 — provides browser/node global variable sets

**Verified:**

- `npm run lint` passes with zero errors (JS + CSS + Prettier format check)
- Deliberate lint error (`var x = 1`) confirmed caught by the new config

---

### 3. Pull Requests Raised

| PR                                                                | From                 | To        | Status |
| ----------------------------------------------------------------- | -------------------- | --------- | ------ |
| [#1](https://github.com/adityakahb-cts/eds-claude-05-2026/pull/1) | `ab-code-2026-05-14` | `develop` | Merged |
| [#2](https://github.com/adityakahb-cts/eds-claude-05-2026/pull/2) | `develop`            | `main`    | Open   |

---

## Session: 2026-05-16 (Tooling & Testing Setup)

### 4. Project Tooling Enhancement

Full tooling setup added to the project based on a planned architecture covering unit testing,
E2E testing, git hooks, Claude Code automation, block content models, and MCP configuration.

#### 4.1 Unit Testing — Vitest

Chose **Vitest** over Jest because the project uses `"type": "module"` (native ESM) — Jest requires
`--experimental-vm-modules` and breaks `import.meta.*`. Vitest is ESM-native with the same
`describe/it/expect/vi` API.

**Installed:** `vitest`, `@vitest/coverage-v8`, `jsdom`

**Files created:**

| File                               | Purpose                                                                        |
| ---------------------------------- | ------------------------------------------------------------------------------ |
| `vitest.config.js`                 | jsdom environment, globals, coverage via v8                                    |
| `tests/unit/setup.js`              | Mocks for `matchMedia`, `IntersectionObserver`, `performance.getEntriesByType` |
| `tests/unit/dom-helpers.js`        | `createBlockFixture()` and `createPicture()` shared test utilities             |
| `blocks/fragment/fragment.test.js` | Tests `loadFragment()`: path validation, `.plain.html` fetch, null on failure  |
| `blocks/header/header.test.js`     | Mocks `loadFragment`, asserts nav-wrapper, nav-brand/sections/tools, hamburger |
| `blocks/footer/footer.test.js`     | Mocks `loadFragment`, asserts content injected, old content cleared            |

**Result:** 3 test files, 15 tests, all passing.

**Scripts added to `package.json`:**

```
npm run test:unit           # Vitest single run
npm run test:unit:watch     # Vitest watch mode
npm run test:unit:coverage  # Coverage report
```

#### 4.2 E2E Testing — Playwright

**Installed:** `@playwright/test`, Chromium browser via `npx playwright install`

**Files created:**

| File                          | Purpose                                                          |
| ----------------------------- | ---------------------------------------------------------------- |
| `playwright.config.js`        | Targets `http://localhost:3000`, Desktop Chrome + iPhone 13      |
| `tests/e2e/page-load.spec.js` | Page title, `<main>` present, header/footer render, no JS errors |
| `tests/e2e/header.spec.js`    | Nav renders, logo link, hamburger toggle on mobile               |
| `tests/e2e/footer.spec.js`    | Footer visible, links have text or aria-label                    |

**Scripts added to `package.json`:**

```
npm run test:e2e        # Playwright run
npm run test:e2e:ui     # Playwright interactive UI
npm run test:e2e:report # Show last HTML report
npm test                # unit + e2e together
```

#### 4.3 Git Hooks — Husky + lint-staged

**Installed:** `husky`, `lint-staged`

**Files created/modified:**

| File                             | Purpose                                                                        |
| -------------------------------- | ------------------------------------------------------------------------------ |
| `.husky/pre-commit`              | Runs `lint-staged` on staged files before every commit                         |
| `.husky/commit-msg`              | Enforces Conventional Commits format (`type(scope): subject`)                  |
| `package.json` `lint-staged` key | Auto-fix JS/CSS, format JSON/MD, block `.env*` files from being staged         |
| `.gitignore`                     | Added `.env`, `.env.*`, `!.env.example`, `playwright-report/`, `test-results/` |

#### 4.4 Claude Code Hooks — `.claude/settings.json`

**Files created:**

| File                    | Purpose                                       |
| ----------------------- | --------------------------------------------- |
| `.claude/settings.json` | Two hooks: format-on-save and .env protection |

**Hook: Format on save**
`PostToolUse` on `Edit\|Write` — runs `npx prettier --write` on the modified file path
automatically after every Claude Code edit. Silent, never blocks.

**Hook: `.env` access protection**
`PreToolUse` on `Read\|Edit\|Write` — exits with code `2` (blocks) if the file path matches
`.env*` or `*/.env*`. Prints `BLOCKED: Access to .env files is restricted.` to stderr.

#### 4.5 Custom Slash Command — `/new-block`

**File created:** `.claude/commands/new-block.md`

Running `/new-block <name>` scaffolds all 7 files for a new block:

- `blocks/{name}/{name}.js` — decorate stub
- `blocks/{name}/{name}.css` — mobile-first scoped styles
- `blocks/{name}/{name}.test.js` — Vitest smoke test
- `tests/e2e/{name}.spec.js` — Playwright stub
- `blocks/{name}/block.md` — documentation template
- `drafts/{name}-test.html` — draft HTML test page
- Entry added to `component-models.json`

#### 4.6 Block Content Models — `component-models.json`

**File created:** `component-models.json` (project root)

Defines da.live authoring dialog fields for each block. Active blocks:

| Block      | Fields                      |
| ---------- | --------------------------- |
| `fragment` | `path` (text-input)         |
| `header`   | _(none — structural block)_ |
| `footer`   | _(none — structural block)_ |

#### 4.7 Block Documentation — `block.md` files

**Files created:** one per block in `blocks/{name}/block.md`

Each file covers: Overview, Content Structure (author table), Field Definitions, CSS Classes
Generated, DOM Structure, Usage Examples, Performance Notes, Accessibility.

| Block      | File                       |
| ---------- | -------------------------- |
| `header`   | `blocks/header/block.md`   |
| `footer`   | `blocks/footer/block.md`   |
| `fragment` | `blocks/fragment/block.md` |

#### 4.8 MCP Servers — `.mcp.json`

Added two MCP servers alongside the existing `da-live-admin`:

| Server       | Package                        | Purpose                                        |
| ------------ | ------------------------------ | ---------------------------------------------- |
| `playwright` | `@playwright/mcp@latest`       | Drive a real browser for visual verification   |
| `context7`   | `@upstash/context7-mcp@latest` | Live docs lookup (Playwright, Vitest, AEM EDS) |

#### 4.9 AGENTS.md Updates

Updated `AGENTS.md` to reflect the new project state:

- **Project Structure** tree expanded with `tests/`, `drafts/`, `.claude/`, `component-models.json`,
  `vitest.config.js`, `playwright.config.js`, and per-block `block.md` / `{name}.test.js`
- **Current Blocks** table added listing header, footer, fragment
- **Setup Commands** updated with `test:unit`, `test:unit:watch`, `test:e2e`, and `test` scripts

#### 4.10 `.hlxignore` Updates

Added CDN-serve protection for test infrastructure files:

```
tests/*
vitest.config.js
playwright.config.js
playwright-report/*
test-results/*
```

---

### 5. Block Cleanup

Removed `cards`, `columns`, and `hero` blocks and all associated files, keeping only `header`,
`footer`, and `fragment`.

**Deleted:**

| Path                        | Type                                      |
| --------------------------- | ----------------------------------------- |
| `blocks/cards/`             | Block directory (js, css, test, block.md) |
| `blocks/columns/`           | Block directory (js, css, test, block.md) |
| `blocks/hero/`              | Block directory (js, css, test, block.md) |
| `tests/e2e/cards.spec.js`   | E2E test                                  |
| `tests/e2e/columns.spec.js` | E2E test                                  |
| `tests/e2e/hero.spec.js`    | E2E test                                  |
| `drafts/cards-test.html`    | Draft page                                |
| `drafts/columns-test.html`  | Draft page                                |
| `drafts/hero-test.html`     | Draft page                                |

**Updated after cleanup:**

| File                                             | Change                                        |
| ------------------------------------------------ | --------------------------------------------- |
| `component-models.json`                          | Removed hero, cards, columns entries          |
| `AGENTS.md`                                      | Current Blocks table updated to 3 blocks only |
| `.claude/plans/i-want-you-inputs-fancy-toast.md` | Pruned deleted block references               |

**Verified:** `npm run lint` clean, `npm run test:unit` 15/15 passing after cleanup.
