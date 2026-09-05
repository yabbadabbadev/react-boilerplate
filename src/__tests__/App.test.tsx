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