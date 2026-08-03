import { Toaster } from 'sonner'

import { QueryProvider } from '@/app/providers/QueryProvider'
import { SocketProvider } from '@/app/providers/SocketProvider'
import { AppRouter } from '@/app/router/routes'

import { ErrorBoundary } from '@/shared/ui/ErrorBoundary'

export default function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <SocketProvider>
          <AppRouter />
          <Toaster richColors position="top-right" />
        </SocketProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}
