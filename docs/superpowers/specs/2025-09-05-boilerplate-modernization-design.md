# React Boilerplate Modernization — 2025-09-05

## Overview

Four independent but interrelated workstreams to modernize the React + TypeScript + Vite boilerplate: linter migration (ESLint → Oxlint), TypeScript upgrade, vite-tsconfig-paths removal, and testing stack migration (Testing Library → pepito/Vitest browser mode).

## 1. ESLint → Oxlint

**Rationale**: Oxlint provides faster linting with near drop-in compatibility for TypeScript + React projects. Prettier is kept for formatting since Oxlint does not format.

### Changes

| Action | Details |
|--------|---------|
| Remove packages | `eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `typescript-eslint`, `globals` |
| Add package | `oxlint` |
| Delete file | `eslint.config.js` |
| Create file | `.oxlintrc.json` with react, typescript, import plugins; `correctness` + `suspicious` rules |
| Update script | `"lint": "eslint ."` → `"lint": "oxlint ."` |
| Update dependabot | Remove `eslint` group; add `oxlint` group with pattern `oxlint*` |

### .oxlintrc.json configuration

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

## 2. TypeScript Upgrade

**Rationale**: Unblock Dependabot PR stuck on ESLint compatibility. Upgrade to latest stable TypeScript and review compiler options.

### Changes

| Action | Details |
|--------|---------|
| Upgrade | `typescript` from `~5.8.3` to latest stable |
| Review tsconfig | Check for deprecated options, adopt new ones if applicable |
| tsconfig.app.json | Update `types` array (remove `@testing-library/jest-dom`) |
| tsconfig.node.json | Review for compatibility with new TS version |

## 3. Remove vite-tsconfig-paths

**Rationale**: Vite 5+ includes path resolution natively, making `vite-tsconfig-paths` redundant.

### Changes

| Action | Details |
|--------|---------|
| Remove package | `vite-tsconfig-paths` |
| Update vite.config.ts | Remove `tsConfigPaths` import and usage |
| Review tsconfig.app.json | `baseUrl: "./src"` is still needed for TS path resolution; Vite resolves paths natively via `resolve.alias` if needed |

## 4. Testing: Testing Library → Pepito

**Rationale**: Pepito (`@yabbadabbadev/pepito`) provides Vitest browser-mode testing with MSW network matchers, replacing Testing Library's jsdom-based approach. Uses Vitest browser mode with Playwright provider.

### Changes

| Action | Details |
|--------|---------|
| Remove packages | `@testing-library/dom`, `@testing-library/jest-dom`, `@testing-library/react`, `@testing-library/user-event`, `jsdom` |
| Add packages | `@yabbadabbadev/pepito`, `@vitest/browser`, `@vitest/browser-playwright`, `vitest-browser-react`, `playwright` |
| Create file | `vitest.setup.ts` — calls `setupNetwork()` from pepito with MSW handlers |
| Delete file | `setupTests.ts` |
| Update vite.config.ts | Switch from `environment: 'jsdom'` to `browser` config with playwright; remove `globals: true` and old `setupFiles` |
| Rewrite test | `src/__tests__/App.test.tsx` — use `mount` from `@yabbadabbadev/pepito/react` |
| Update tsconfig | Remove `@testing-library/jest-dom` from `tsconfig.app.json` types |
| Update CI | Add `npx playwright install chromium` step in `pr.yml` |
| MSW public | `public/mockServiceWorker.js` already present from `msw init` |
| Update dependabot | Replace testing group patterns with pepito, vitest browser, playwright |

### vitest.config changes

```ts
// vite.config.ts — test section changes:
test: {
  browser: {
    enabled: true,
    provider: 'playwright',
    name: 'chromium',
    headless: true,
  },
  setupFiles: ['./vitest.setup.ts'],
  css: true,
}
```

### pepito setup (vitest.setup.ts)

```ts
import { setupNetwork } from '@yabbadabbadev/pepito'
import { handlers } from 'src/mocks/handlers'

setupNetwork(handlers)
```

### Test migration pattern

```ts
// Before (Testing Library)
import { render, screen } from '@testing-library/react'
render(<App />)
expect(screen.getByRole('heading', { name: 'Hello World!' }))

// After (pepito)
import { mount } from '@yabbadabbadev/pepito/react'
const screen = await mount(<App />)
await expect.element(screen.getByRole('heading', { name: 'Hello World!' })).toBeVisible()
```

## Dependabot Configuration (Final State)

```yaml
groups:
  react:
    patterns: ["react", "react-dom", "@types/react*"]
  vite:
    patterns: ["vite", "@vitejs/*"]
  oxlint:
    patterns: ["oxlint*"]
  testing:
    patterns:
      - "@yabbadabbadev/pepito"
      - "vitest-browser-react"
      - "@vitest/browser*"
      - "playwright"
      - "msw"
```