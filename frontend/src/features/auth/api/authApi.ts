import api from '@/shared/api/axiosInstance'

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  refreshTokenExpiresAt: number
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthTokens>('/api/auth/login', { email, password }).then((r) => r.data),
  register: (email: string, password: string) =>
    api.post<AuthTokens>('/api/auth/register', { email, password }).then((r) => r.data),
  logout: (refreshToken: string) =>
    api.post('/api/auth/logout', { refreshToken }).then(() => undefined),
}
