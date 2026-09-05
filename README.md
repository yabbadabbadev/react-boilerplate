# React + TypeScript + Vite

Minimal boilerplate for React with TypeScript, Vite, Oxlint, and Vitest browser-mode testing with pepito.

## Stack

- **React 19** + **TypeScript 7** + **Vite 8**
- **Oxlint** for linting, **Prettier** for formatting
- **Vitest 4** (browser mode via Playwright) + **pepito** for testing
- **MSW** for network mocking

## Scripts

| Command          | Description                         |
| ---------------- | ----------------------------------- |
| `npm run dev`    | Start dev server with HMR           |
| `npm run build`  | Type-check and build for production |
| `npm run lint`   | Run Oxlint                          |
| `npm test`       | Run tests in browser mode           |
| `npm run preview`| Preview production build            |

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
import { handlers } from './src/mocks/handlers'

setupNetwork(handlers)
```

Write tests with `mount`:

```tsx
import { mount } from '@yabbadabbadev/pepito/react'
import { App } from './App'

describe('App', () => {
  it('renders', async () => {
    const screen = await mount(<App />)
    await expect.element(screen.getByRole('heading')).toBeVisible()
  })
})
```