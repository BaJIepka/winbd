import { type ReactNode, useEffect, useState } from 'react'
import axios from 'axios'

import { AuthPage } from '@/widgets/auth-modal'

import { useAuthStore } from '@/entities/user'

import { API_URL } from '@/shared/config/env'

interface AuthTokens {
  accessToken: string
  refreshToken: string
  refreshTokenExpiresAt: number
}

interface ProtectedRouteProps {
  children: ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { accessToken, setTokens, clearAuth, getStoredRefresh } = useAuthStore()

  // Synchronously determine if we can skip async initialization.
  // Returns true when no refresh attempt is needed (either already authed or no valid refresh token).
  const [isInitialized, setIsInitialized] = useState(() => {
    if (accessToken) return true
    const { refreshToken, refreshTokenExpiresAt } = getStoredRefresh()
    return !refreshToken || refreshTokenExpiresAt === null || Date.now() >= refreshTokenExpiresAt
  })

  useEffect(() => {
    if (isInitialized) return

    const { refreshToken } = getStoredRefresh()
    axios
      .post<AuthTokens>(`${API_URL}/api/auth/refresh`, { refreshToken })
      .then(({ data }) => {
        setTokens(data.accessToken, data.refreshToken, data.refreshTokenExpiresAt)
      })
      .catch(() => {
        clearAuth()
      })
      // setIsInitialized only in async callback — never synchronously in the effect body
      .finally(() => {
        setIsInitialized(true)
      })
    // Run once on mount only — re-running on store changes would create a refresh loop.
    // isInitialized is read inside but intentionally not a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!accessToken) return <AuthPage />

  return <>{children}</>
}
