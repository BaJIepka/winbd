import { type ComponentType, lazy, Suspense } from 'react'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'

import { ProtectedRoute } from './ProtectedRoute'

// Wraps a lazy-loaded page in its <Component/> element so a route's path, loader, and
// element all live on one line — no jumping between top-of-file imports and the route list.
function page(loader: () => Promise<{ default: ComponentType }>) {
  const Component = lazy(loader)
  return <Component />
}

const router = createBrowserRouter([
  {
    element: (
      <ProtectedRoute>
        <Suspense>
          <Outlet />
        </Suspense>
      </ProtectedRoute>
    ),
    children: [
      { path: '/', element: page(() => import('@/pages/news-list')) },
      { path: '/news/new', element: page(() => import('@/pages/news-editor')) },
      { path: '/news/:id/edit', element: page(() => import('@/pages/news-editor')) },
      { path: '/news/:id', element: page(() => import('@/pages/news-view')) },
    ],
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
