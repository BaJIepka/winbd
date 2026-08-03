import { MemoryRouter } from 'react-router-dom'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { News } from '../model/types'
import { NewsCard } from './NewsCard'

vi.mock('@/features/news/publish', () => ({
  usePublishNews: () => ({ mutate: vi.fn(), isPending: false }),
}))
vi.mock('@/features/news/delete', () => ({
  DeleteButton: ({ title }: { id: string; title: string }) => (
    <button type="button">Удалить {title}</button>
  ),
}))
vi.mock('@/features/news/schedule', () => ({
  ScheduleDialog: () => <button type="button">Запланировать</button>,
}))

const draftNews: News = {
  _id: 'n1',
  title: 'Тестовая статья',
  content: '<p>Текст</p>',
  author: { _id: 'a1', email: 'author@test.com' },
  status: 'draft',
  imageUrl: null,
  attachments: [],
  publishAt: null,
  publishedAt: null,
  createdAt: '2024-06-01T10:00:00.000Z',
  updatedAt: '2024-06-01T10:00:00.000Z',
}

const publishedNews: News = {
  ...draftNews,
  _id: 'n2',
  status: 'published',
  publishedAt: '2024-06-02T12:00:00.000Z',
}

function renderCard(news: News) {
  return render(
    <MemoryRouter>
      <NewsCard news={news} />
    </MemoryRouter>,
  )
}

describe('NewsCard', () => {
  it('renders article title', () => {
    renderCard(draftNews)
    expect(screen.getByText('Тестовая статья')).toBeInTheDocument()
  })

  it('renders author email', () => {
    renderCard(draftNews)
    expect(screen.getByText(/author@test\.com/)).toBeInTheDocument()
  })

  it('shows "Черновик" badge for draft', () => {
    renderCard(draftNews)
    expect(screen.getByText('Черновик')).toBeInTheDocument()
  })

  it('shows "Опубликовано" badge for published', () => {
    renderCard(publishedNews)
    expect(screen.getByText('Опубликовано')).toBeInTheDocument()
  })

  it('shows Опубликовать and Запланировать buttons for draft', () => {
    renderCard(draftNews)
    expect(screen.getByRole('button', { name: 'Опубликовать' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Запланировать' })).toBeInTheDocument()
  })

  it('does not show Опубликовать button for published article', () => {
    renderCard(publishedNews)
    expect(screen.queryByRole('button', { name: 'Опубликовать' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Запланировать' })).not.toBeInTheDocument()
  })

  it('shows Редактировать link', () => {
    renderCard(draftNews)
    const link = screen.getByRole('link', { name: /Редактировать/ })
    expect(link).toHaveAttribute('href', '/news/n1/edit')
  })

  it('shows creation date', () => {
    renderCard(draftNews)
    expect(screen.getByText(/Создана:/)).toBeInTheDocument()
  })

  it('shows published date for published news', () => {
    renderCard(publishedNews)
    expect(screen.getByText(/Опубликована:/)).toBeInTheDocument()
  })

  it('does not render cover image when imageUrl is null', () => {
    const { container } = renderCard(draftNews)
    expect(container.querySelector('img')).not.toBeInTheDocument()
  })

  it('renders cover image when imageUrl is set', () => {
    const { container } = renderCard({ ...draftNews, imageUrl: '/uploads/cover.jpg' })
    expect(container.querySelector('img')).toHaveAttribute('src', '/uploads/cover.jpg')
  })
})
