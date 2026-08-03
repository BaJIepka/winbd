import type { Page } from '@playwright/test'

export function uniqueEmail(prefix = 'test'): string {
  return `${prefix}+${Date.now()}@example.com`
}

export async function registerAndLogin(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/')
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click()
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Пароль').fill(password)
  await page.getByLabel('Подтвердите пароль').fill(password)
  await page.getByRole('button', { name: 'Зарегистрироваться' }).click()
  await page.waitForSelector(`text=${email}`, { timeout: 10_000 })
}

export async function loginAs(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Пароль').fill(password)
  await page.getByRole('button', { name: 'Войти' }).click()
  await page.waitForSelector(`text=${email}`, { timeout: 10_000 })
}
