import { beforeEach, describe, expect, it } from 'vitest'

import { useAuthStore } from './authStore'

function makeJwt(payload: object): string {
  const b64url = btoa(JSON.stringify(payload))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
  return `eyJhbGciOiJIUzI1NiJ9.${b64url}.fakesig`
}

const fakeAccessToken = makeJwt({ userId: 'u1', email: 'user@test.com', exp: 9999999999 })

beforeEach(() => {
  localStorage.clear()
  useAuthStore.setState({ accessToken: null, user: null })
})

describe('useAuthStore', () => {
  it('initial state is empty', () => {
    const { accessToken, user } = useAuthStore.getState()
    expect(accessToken).toBeNull()
    expect(user).toBeNull()
  })

  it('setTokens stores accessToken and user in memory', () => {
    useAuthStore.getState().setTokens(fakeAccessToken, 'refresh-token', Date.now() + 100_000)
    const { accessToken, user } = useAuthStore.getState()
    expect(accessToken).toBe(fakeAccessToken)
    expect(user).toEqual({ userId: 'u1', email: 'user@test.com' })
  })

  it('setTokens persists refreshToken and expiresAt in localStorage', () => {
    const expiresAt = Date.now() + 100_000
    useAuthStore.getState().setTokens(fakeAccessToken, 'rt-value', expiresAt)
    expect(localStorage.getItem('refreshToken')).toBe('rt-value')
    expect(localStorage.getItem('refreshTokenExpiresAt')).toBe(String(expiresAt))
  })

  it('clearAuth removes tokens from memory and localStorage', () => {
    useAuthStore.getState().setTokens(fakeAccessToken, 'rt-value', Date.now() + 100_000)
    useAuthStore.getState().clearAuth()
    const { accessToken, user } = useAuthStore.getState()
    expect(accessToken).toBeNull()
    expect(user).toBeNull()
    expect(localStorage.getItem('refreshToken')).toBeNull()
    expect(localStorage.getItem('refreshTokenExpiresAt')).toBeNull()
  })

  it('getStoredRefresh returns values from localStorage', () => {
    localStorage.setItem('refreshToken', 'stored-rt')
    localStorage.setItem('refreshTokenExpiresAt', '1234567890000')
    const { refreshToken, refreshTokenExpiresAt } = useAuthStore.getState().getStoredRefresh()
    expect(refreshToken).toBe('stored-rt')
    expect(refreshTokenExpiresAt).toBe(1234567890000)
  })

  it('getStoredRefresh returns nulls when localStorage is empty', () => {
    const { refreshToken, refreshTokenExpiresAt } = useAuthStore.getState().getStoredRefresh()
    expect(refreshToken).toBeNull()
    expect(refreshTokenExpiresAt).toBeNull()
  })

  it('setTokens with invalid JWT sets user to null', () => {
    useAuthStore.getState().setTokens('invalid.token.here', 'rt', Date.now() + 100_000)
    expect(useAuthStore.getState().user).toBeNull()
  })
})
