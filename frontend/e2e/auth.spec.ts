import { expect,test } from '@playwright/test'

import { loginAs,registerAndLogin, uniqueEmail } from './helpers'

test.describe('Auth flow', () => {
  test('shows auth form when not logged in', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible()
  })

  test('switches between login and register forms', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Зарегистрироваться' }).click()
    await expect(page.getByRole('heading', { name: 'Регистрация' })).toBeVisible()
    await page.getByRole('button', { name: 'Войти' }).click()
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible()
  })

  test('register → see news list → logout → see auth form', async ({ page }) => {
    const email = uniqueEmail('reg')
    await registerAndLogin(page, email, 'password123')

    await expect(page.getByText(email)).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Статьи' })).toBeVisible()

    await page.getByRole('button', { name: 'Выйти' }).click()
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible()
  })

  test('login with existing credentials', async ({ page }) => {
    const email = uniqueEmail('login')
    const password = 'password123'

    await registerAndLogin(page, email, password)
    await page.getByRole('button', { name: 'Выйти' }).click()
    await expect(page.getByRole('heading', { name: 'Вход' })).toBeVisible()

    await loginAs(page, email, password)
    await expect(page.getByText(email)).toBeVisible()
  })

  test('shows auth form again after page reload when session is restored', async ({ page }) => {
    const email = uniqueEmail('reload')
    await registerAndLogin(page, email, 'password123')

    await page.reload()
    await expect(page.getByText(email)).toBeVisible({ timeout: 8_000 })
  })
})
