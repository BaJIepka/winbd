import axios from 'axios'

import { useAuthStore } from '@/entities/user/model/authStore'

import { API_URL } from '@/shared/config/env'
import { getTokenExp } from '@/shared/lib/decodeJwt'

const api = axios.create({ baseURL: API_URL })

interface AuthTokens {
  accessToken: string
  refreshToken: string
  refreshTokenExpiresAt: number
}

let pendingRefresh: Promise<string | null> | null = null

async function performRefresh(): Promise<string | null> {
  const { getStoredRefresh, setTokens, clearAuth } = useAuthStore.getState()
  const { refreshToken, refreshTokenExpiresAt } = getStoredRefresh()

  if (!refreshToken || refreshTokenExpiresAt === null || Date.now() >= refreshTokenExpiresAt) {
    clearAuth()
    return null
  }

  try {
    const res = await axios.post<AuthTokens>(`${API_URL}/api/auth/refresh`, { refreshToken })
    const { accessToken, refreshToken: newRefresh, refreshTokenExpiresAt: newExp } = res.data
    setTokens(accessToken, newRefresh, newExp)
    return accessToken
  } catch {
    clearAuth()
    return null
  }
}

api.interceptors.request.use(async (config) => {
  let { accessToken } = useAuthStore.getState()

  if (accessToken) {
    const exp = getTokenExp(accessToken)
    const isExpiringSoon = exp !== undefined && Date.now() >= (exp - 30) * 1000

    if (isExpiringSoon) {
      if (!pendingRefresh) {
        pendingRefresh = performRefresh().finally(() => {
          pendingRefresh = null
        })
      }
      accessToken = (await pendingRefresh) ?? null
    }
  }

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }

  return config
})

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().clearAuth()
    }
    return Promise.reject(error)
  },
)

export default api
