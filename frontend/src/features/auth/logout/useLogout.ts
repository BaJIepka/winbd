import { useCallback } from 'react'

import { authApi } from '@/features/auth/api/authApi'

import { useAuthStore } from '@/entities/user/model/authStore'

export function useLogout() {
  const { clearAuth, getStoredRefresh } = useAuthStore()

  return useCallback(async () => {
    const { refreshToken } = getStoredRefresh()
    clearAuth()
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => {
        /* ignore */
      })
    }
  }, [clearAuth, getStoredRefresh])
}
