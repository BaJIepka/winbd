import { expect,test } from '@playwright/test'

import { registerAndLogin,uniqueEmail } from './helpers'

test.describe('News editor', () => {
  test('create article and see it in the list', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail('create'), 'password123')

    await page.getByRole('link', { name: 'Создать' }).click()
    await page.waitForURL('**/news/new')

    await page.getByLabel('Заголовок').fill('Моя тестовая статья')
    await page.locator('.ProseMirror').click()
    await page.keyboard.type('Содержимое статьи для теста')

    await page.getByRole('button', { name: 'Сохранить' }).click()
    await page.waitForURL('/')

    await expect(page.getByText('Моя тестовая статья')).toBeVisible()
    await expect(page.getByText('Черновик')).toBeVisible()
  })

  test('preview modal shows current editor state before saving', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail('preview'), 'password123')

    await page.getByRole('link', { name: 'Создать' }).click()
    await page.getByLabel('Заголовок').fill('Статья в предпросмотре')
    await page.locator('.ProseMirror').click()
    await page.keyboard.type('Текст который должен быть в предпросмотре')

    await page.getByRole('button', { name: 'Предпросмотр' }).click()

    await expect(page.getByRole('heading', { name: 'Предпросмотр' })).toBeVisible()
    await expect(page.getByRole('heading', { name: 'Статья в предпросмотре' })).toBeVisible()
    await expect(page.getByText('Текст который должен быть в предпросмотре')).toBeVisible()

    await page.keyboard.press('Escape')
    await expect(page.getByRole('heading', { name: 'Предпросмотр' })).not.toBeVisible()
  })

  test('publish article from list changes status to Опубликовано', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail('publish'), 'password123')

    await page.getByRole('link', { name: 'Создать' }).click()
    await page.getByLabel('Заголовок').fill('Статья для публикации')
    await page.locator('.ProseMirror').click()
    await page.keyboard.type('Контент')
    await page.getByRole('button', { name: 'Сохранить' }).click()
    await page.waitForURL('/')

    await page.getByRole('button', { name: 'Опубликовать' }).first().click()

    await expect(page.getByText('Опубликовано')).toBeVisible({ timeout: 8_000 })
  })

  test('edit article updates its title in the list', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail('edit'), 'password123')

    await page.getByRole('link', { name: 'Создать' }).click()
    await page.getByLabel('Заголовок').fill('Оригинальный заголовок')
    await page.locator('.ProseMirror').click()
    await page.keyboard.type('Контент')
    await page.getByRole('button', { name: 'Сохранить' }).click()
    await page.waitForURL('/')

    await page.getByRole('link', { name: 'Редактировать' }).first().click()
    await page.waitForURL('**\/edit')

    await page.getByLabel('Заголовок').fill('Обновлённый заголовок')
    await page.getByRole('button', { name: 'Сохранить' }).click()
    await page.waitForURL('/')

    await expect(page.getByText('Обновлённый заголовок')).toBeVisible()
    await expect(page.getByText('Оригинальный заголовок')).not.toBeVisible()
  })

  test('delete article removes it from the list', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail('delete'), 'password123')

    await page.getByRole('link', { name: 'Создать' }).click()
    await page.getByLabel('Заголовок').fill('Статья для удаления')
    await page.locator('.ProseMirror').click()
    await page.keyboard.type('Контент')
    await page.getByRole('button', { name: 'Сохранить' }).click()
    await page.waitForURL('/')

    await expect(page.getByText('Статья для удаления')).toBeVisible()

    await page.getByRole('button', { name: 'Удалить' }).first().click()
    await page.getByRole('button', { name: 'Удалить' }).last().click()

    await expect(page.getByText('Статья для удаления')).not.toBeVisible({ timeout: 8_000 })
  })

  test('pagination shows when there are more than 5 articles', async ({ page }) => {
    await registerAndLogin(page, uniqueEmail('paging'), 'password123')

    for (let i = 1; i <= 6; i++) {
      await page.getByRole('link', { name: 'Создать' }).click()
      await page.getByLabel('Заголовок').fill(`Статья номер ${i}`)
      await page.locator('.ProseMirror').click()
      await page.keyboard.type(`Контент ${i}`)
      await page.getByRole('button', { name: 'Сохранить' }).click()
      await page.waitForURL('/')
    }

    await expect(page.getByText('1 / 2')).toBeVisible()
    await page.getByRole('button', { name: 'Вперёд →' }).click()
    await expect(page.getByText('2 / 2')).toBeVisible()
  })
})
