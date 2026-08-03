import { expect,test } from '@playwright/test'

import { registerAndLogin,uniqueEmail } from './helpers'

test.describe('Real-time notifications', () => {
  test('user B receives notification when user A creates an article', async ({ browser }) => {
    const contextA = await browser.newContext()
    const contextB = await browser.newContext()
    const pageA = await contextA.newPage()
    const pageB = await contextB.newPage()

    const emailA = uniqueEmail('userA')
    const emailB = uniqueEmail('userB')

    await registerAndLogin(pageA, emailA, 'password123')
    await registerAndLogin(pageB, emailB, 'password123')

    // User A creates an article
    await pageA.getByRole('link', { name: 'Создать' }).click()
    await pageA.getByLabel('Заголовок').fill('Статья для уведомления')
    await pageA.locator('.ProseMirror').click()
    await pageA.keyboard.type('Контент')
    await pageA.getByRole('button', { name: 'Сохранить' }).click()
    await pageA.waitForURL('/')

    // User B sees a badge on the notification bell
    const bellB = pageB.getByRole('button', { name: 'Уведомления' })
    await expect(bellB).toBeVisible()

    // Open notifications dropdown
    await bellB.click()
    await expect(pageB.getByText('Статья создана')).toBeVisible({ timeout: 8_000 })
    await expect(pageB.getByText('Статья для уведомления')).toBeVisible()

    await contextA.close()
    await contextB.close()
  })

  test('notifications dropdown shows "Нет уведомлений" when empty', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail('notif-empty'), 'password123')
    await page.getByRole('button', { name: 'Уведомления' }).click()
    await expect(page.getByText('Нет уведомлений')).toBeVisible()
  })

  test('clearAll removes notifications from dropdown', async ({ browser }) => {
    const contextA = await browser.newContext()
    const contextB = await browser.newContext()
    const pageA = await contextA.newPage()
    const pageB = await contextB.newPage()

    await registerAndLogin(pageA, uniqueEmail('clearA'), 'password123')
    await registerAndLogin(pageB, uniqueEmail('clearB'), 'password123')

    // User A creates an article so B gets a notification
    await pageA.getByRole('link', { name: 'Создать' }).click()
    await pageA.getByLabel('Заголовок').fill('Для очистки')
    await pageA.locator('.ProseMirror').click()
    await pageA.keyboard.type('x')
    await pageA.getByRole('button', { name: 'Сохранить' }).click()
    await pageA.waitForURL('/')

    // User B: open dropdown and see the notification
    await pageB.getByRole('button', { name: 'Уведомления' }).click()
    await expect(pageB.getByText('Статья создана')).toBeVisible({ timeout: 8_000 })

    // Clear all
    await pageB.getByRole('button', { name: 'Очистить' }).click()
    await expect(pageB.getByText('Нет уведомлений')).toBeVisible()

    await contextA.close()
    await contextB.close()
  })
})
