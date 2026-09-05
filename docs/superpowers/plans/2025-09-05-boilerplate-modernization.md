# React Boilerplate Modernization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize the React + TypeScript + Vite boilerplate across four workstreams: ESLint→Oxlint, TypeScript upgrade to 7.0.2, vite-tsconfig-paths removal, and Testing Library→pepito browser-mode testing.

**Architecture:** Four independent workstreams executed sequentially (each unblocks the next). First strip ESLint + install Oxlint, then upgrade TypeScript (unblocked after ESLint removal), then remove vite-tsconfig-paths, finally migrate testing to pepito with Vitest browser mode. Each workstream leaves the project in a working state.

**Tech Stack:** React 19.2.8, TypeScript 7.0.2, Vite 8.2.2, Vitest 5.0.0, Oxlint 1.81.0, Pepito 0.2.0, Playwright 1.63.0, MSW 2.15.0

**Spec:** `docs/superpowers/specs/2025-09-05-boilerplate-modernization-design.md`

## Global Constraints

- Node.js v24.20.0 (from `.nvmrc`)
- Prettier stays as formatter (oxlint does not format)
- MSW stays for network mocking
- All tests must pass after each workstream
- TypeScript compilation (`tsc -b`) must pass after each workstream

---

### Task 1: Strip ESLint dependencies and config

**Files:**
- Modify: `package.json:17-37` (devDependencies)
- Delete: `eslint.config.js`

**Interfaces:**
- Produces: Clean `package.json` without ESLint packages, no eslint.config.js

- [ ] **Step 1: Remove ESLint packages from package.json**

```bash
npm uninstall @eslint/js eslint eslint-plugin-react-hooks eslint-plugin-react-refresh typescript-eslint globals
```

- [ ] **Step 2: Remove eslint.config.js**

```bash
rm eslint.config.js
```

- [ ] **Step 3: Verify npm scripts still valid**

```bash
cat package.json
```

Expected: `"lint": "eslint ."` still present (will be updated in next task).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git rm eslint.config.js
git commit -m "build: remove ESLint and related dependencies"
```

---

### Task 2: Install and configure Oxlint

**Files:**
- Create: `.oxlintrc.json`
- Modify: `package.json:10` (lint script)

**Interfaces:**
- Consumes: Clean package.json from Task 1
- Produces: Oxlint installed, lint script pointing to oxlint, `.oxlintrc.json` config

- [ ] **Step 1: Install oxlint**

```bash
npm install -D oxlint@^1.81.0
```

- [ ] **Step 2: Create .oxlintrc.json**

```json
{
  "plugins": ["react", "typescript", "import"],
  "categories": {
    "correctness": "error",
    "suspicious": "warn"
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/exhaustive-deps": "warn"
  }
}
```

- [ ] **Step 3: Update lint script in package.json**

Change `"lint": "eslint ."` to `"lint": "oxlint ."`.

- [ ] **Step 4: Run oxlint to verify it works**

```bash
npm run lint
```

Expected: Lint runs without crashing. May show warnings for existing code — that's fine.

- [ ] **Step 5: Commit**

```bash
git add .oxlintrc.json package.json package-lock.json
git commit -m "build: add oxlint as ESLint replacement"
```

---

### Task 3: Update Dependabot for Oxlint

**Files:**
- Modify: `.github/dependabot.yml:22-26` (eslint group)

**Interfaces:**
- Consumes: Oxlint installed from Task 2
- Produces: Dependabot config with oxlint group replacing eslint group

- [ ] **Step 1: Replace eslint group with oxlint group in dependabot.yml**

Remove the `eslint` group block:

```yaml
      eslint:
        patterns:
          - "eslint*"
          - "@typescript-eslint/*"
          - "prettier"
```

Add the `oxlint` group block:

```yaml
      oxlint:
        patterns:
          - "oxlint*"
      prettier:
        patterns:
          - "prettier"
```

- [ ] **Step 2: Verify dependabot.yml is valid YAML**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/dependabot.yml'))" && echo "Valid YAML"
```

- [ ] **Step 3: Commit**

```bash
git add .github/dependabot.yml
git commit -m "build: update dependabot groups for oxlint"
```

---

### Task 4: Upgrade TypeScript to 7.0.2

**Files:**
- Modify: `package.json:33` (typescript version)

**Interfaces:**
- Consumes: ESLint removed from Task 1
- Produces: TypeScript 7.0.2 installed, `tsc -b` passes

- [ ] **Step 1: Install latest TypeScript**

```bash
npm install -D typescript@~7.0.2
```

- [ ] **Step 2: Run TypeScript compilation**

```bash
npx tsc -b
```

Expected: Compilation passes without errors.

- [ ] **Step 3: If tsc -b fails, review and fix tsconfig options**

Check for deprecated options in TS 7:
- `erasableSyntaxOnly` — verify it still exists in TS 7 (introduced in TS 5.8)
- `moduleDetection: "force"` — verify still valid
- `verbatimModuleSyntax` — verify still valid

If any option is deprecated, remove or replace it.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "build: upgrade TypeScript to 7.0.2"
```

---

### Task 5: Remove vite-tsconfig-paths

**Files:**
- Modify: `package.json:36` (vite-tsconfig-paths dependency)
- Modify: `vite.config.ts:3,7` (import and plugin usage)

**Interfaces:**
- Consumes: Working build from Task 4
- Produces: vite-tsconfig-paths removed, vite.config.ts cleaned, `npm run build` still passes

- [ ] **Step 1: Uninstall vite-tsconfig-paths**

```bash
npm uninstall vite-tsconfig-paths
```

- [ ] **Step 2: Update vite.config.ts — remove import and plugin**

Remove line 3: `import tsConfigPaths from 'vite-tsconfig-paths'`

Change line 7 from:
```ts
  plugins: [react(), tsConfigPaths()],
```
To:
```ts
  plugins: [react()],
```

- [ ] **Step 3: Verify build still works**

```bash
npm run build
```

Expected: Build succeeds. Note: `baseUrl: "./src"` in `tsconfig.app.json` stays — it's needed for TS path resolution, not Vite.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json vite.config.ts
git commit -m "build: remove vite-tsconfig-paths (now built into vite)"
```

---

### Task 6: Install pepito and Vitest browser mode dependencies

**Files:**
- Modify: `package.json:19-37` (devDependencies)

**Interfaces:**
- Consumes: Clean build from Task 5
- Produces: Pepito test stack installed, old testing-library deps removed

- [ ] **Step 1: Remove testing-library and jsdom packages**

```bash
npm uninstall @testing-library/dom @testing-library/jest-dom @testing-library/react @testing-library/user-event jsdom
```

- [ ] **Step 2: Install pepito and Vitest browser mode packages**

```bash
npm install -D @yabbadabbadev/pepito@^0.2.0 @vitest/browser@^5.0.0 @vitest/browser-playwright@^5.0.0 vitest-browser-react@^2.3.0 playwright@^1.63.0
```

- [ ] **Step 3: Install Playwright browsers**

```bash
npx playwright install chromium
```

- [ ] **Step 4: Initialize MSW service worker in public directory**

```bash
npx msw init public --save
```

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json public/mockServiceWorker.js
git commit -m "build: add pepito and vitest browser mode test stack"
```

---

### Task 7: Configure Vitest for browser mode with pepito

**Files:**
- Create: `vitest.setup.ts`
- Delete: `setupTests.ts`
- Modify: `vite.config.ts:8-14` (test section)
- Modify: `tsconfig.app.json:28-28` (types array)

**Interfaces:**
- Consumes: Pepito installed from Task 6, MSW handlers at `src/mocks/handlers.ts`
- Produces: Vitest configured for browser mode, pepito network setup in place

- [ ] **Step 1: Create vitest.setup.ts**

```ts
import { setupNetwork } from '@yabbadabbadev/pepito'
import { handlers } from './src/mocks/handlers'

setupNetwork(handlers)
```

- [ ] **Step 2: Delete setupTests.ts**

```bash
rm setupTests.ts
```

- [ ] **Step 3: Update vite.config.ts test section**

Replace the current `test` block:

```ts
  test: {
    environment: 'jsdom',
    setupFiles: ['./setupTests.ts'],
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    globals: true,
    css: true,
  },
```

With:

```ts
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      name: 'chromium',
      headless: true,
    },
    setupFiles: ['./vitest.setup.ts'],
    css: true,
  },
```

- [ ] **Step 4: Update tsconfig.app.json — remove @testing-library/jest-dom from types**

Change:
```json
"types": ["vitest/globals", "vite/client", "@testing-library/jest-dom"],
```
To:
```json
"types": ["vite/client"],
```

- [ ] **Step 5: Verify TypeScript compilation still passes**

```bash
npx tsc -b
```

Expected: Passes. If errors about `vitest/globals` references in test files, remove any `/// <reference types="vitest/globals" />` or similar.

- [ ] **Step 6: Commit**

```bash
git add vitest.setup.ts vite.config.ts tsconfig.app.json
git rm setupTests.ts
git commit -m "test: configure vitest browser mode with pepito"
```

---

### Task 8: Rewrite App test with pepito

**Files:**
- Modify: `src/__tests__/App.test.tsx` (full rewrite)

**Interfaces:**
- Consumes: Vitest browser mode configured from Task 7
- Produces: Working test using pepito `mount` and `expect.element` matchers

- [ ] **Step 1: Rewrite src/__tests__/App.test.tsx**

```tsx
import { mount } from '@yabbadabbadev/pepito/react'
import { App } from '../App'

describe('App', () => {
  it('renders the App component', async () => {
    const screen = await mount(<App />)

    await expect
      .element(screen.getByRole('heading', { name: 'Hello World!', level: 1 }))
      .toBeVisible()
  })
})
```

- [ ] **Step 2: Run tests**

```bash
npx vitest run
```

Expected: Tests pass in browser mode with Playwright.

- [ ] **Step 3: Commit**

```bash
git add src/__tests__/App.test.tsx
git commit -m "test: rewrite App test with pepito browser mode"
```

---

### Task 9: Update Dependabot testing group and CI workflow

**Files:**
- Modify: `.github/dependabot.yml:27-31` (testing group)
- Modify: `.github/workflows/pr.yml:23-27` (install + test steps)

**Interfaces:**
- Consumes: Pepito test stack from Task 8
- Produces: Dependabot tracking new testing deps, CI ready for browser tests

- [ ] **Step 1: Update testing group in dependabot.yml**

Replace:
```yaml
      testing:
        patterns:
          - "@testing-library/*"
          - "vitest"
          - "jsdom"
```

With:
```yaml
      testing:
        patterns:
          - "@yabbadabbadev/pepito"
          - "vitest-browser-react"
          - "@vitest/browser*"
          - "playwright"
          - "msw"
```

- [ ] **Step 2: Update CI workflow to install Playwright browsers before tests**

In `.github/workflows/pr.yml`, after the `npm install` step, add:

```yaml
            - name: Install Playwright browsers
              run: npx playwright install chromium
```

- [ ] **Step 3: Commit**

```bash
git add .github/dependabot.yml .github/workflows/pr.yml
git commit -m "ci: update dependabot and CI for pepito browser tests"
```

---

### Task 10: Update README.md

**Files:**
- Modify: `README.md` (full rewrite of outdated ESLint and testing sections)

**Interfaces:**
- Consumes: All previous tasks complete
- Produces: Accurate README reflecting current stack

- [ ] **Step 1: Rewrite README.md**

```md
# React + TypeScript + Vite

Minimal boilerplate for React with TypeScript, Vite, Oxlint, and Vitest browser-mode testing with pepito.

## Stack

- **React 19** + **TypeScript 7** + **Vite 8**
- **Oxlint** for linting, **Prettier** for formatting
- **Vitest 5** (browser mode via Playwright) + **pepito** for testing
- **MSW** for network mocking

## Scripts

| Command          | Description                       |
| ---------------- | --------------------------------- |
| `npm run dev`    | Start dev server with HMR         |
| `npm run build`  | Type-check and build for production |
| `npm run lint`   | Run Oxlint                        |
| `npm test`       | Run tests in browser mode         |
| `npm run preview`| Preview production build          |

## Testing

Tests run in a real browser via Vitest browser mode with Playwright.
Pepito provides `mount` for React components and network matchers on
top of MSW.

Declare MSW handlers as usual:

```ts
import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('https://api.example.com/users', () => {
    return HttpResponse.json([{ id: 1, name: 'John' }])
  }),
]
```

Set up pepito in `vitest.setup.ts`:

```ts
import { setupNetwork } from '@yabbadabbadev/pepito'
import { handlers } from 'src/mocks/handlers'

setupNetwork(handlers)
```

Write tests with `mount`:

```tsx
import { mount } from '@yabbadabbadev/pepito/react'
import { App } from 'src/App'

describe('App', () => {
  it('renders', async () => {
    const screen = await mount(<App />)
    await expect.element(screen.getByRole('heading')).toBeVisible()
  })
})
```
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: update README for modernized stack"
```

---

### Task 11: Final verification

**Files:**
- None (verification only)

**Interfaces:**
- Consumes: All previous tasks complete
- Produces: Confirmation that everything works end-to-end

- [ ] **Step 1: Run full TypeScript compilation**

```bash
npx tsc -b
```

Expected: No errors.

- [ ] **Step 2: Run oxlint**

```bash
npm run lint
```

Expected: No errors (or only acceptable warnings).

- [ ] **Step 3: Run tests**

```bash
npx vitest run
```

Expected: All tests pass.

- [ ] **Step 4: Run build**

```bash
npm run build
```

Expected: Build succeeds, `dist/` created.

- [ ] **Step 5: Check git status is clean**

```bash
git status
```

Expected: Only intentional changes staged.

- [ ] **Step 6: Final commit if any fixes needed**

```bash
git add -A
git commit -m "chore: final verification fixes"
```