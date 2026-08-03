import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { ProtectedRoute } from './ProtectedRoute'

const NewsListPage = lazy(() =>
  import('@/pages/news-list').then((m) => ({ default: m.NewsListPage })),
)
const NewsEditorPage = lazy(() =>
  import('@/pages/news-editor').then((m) => ({ default: m.NewsEditorPage })),
)

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Suspense>
          <NewsListPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/news/new',
    element: (
      <ProtectedRoute>
        <Suspense>
          <NewsEditorPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: '/news/:id/edit',
    element: (
      <ProtectedRoute>
        <Suspense>
          <NewsEditorPage />
        </Suspense>
      </ProtectedRoute>
    ),
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
