import { useMutation } from '@tanstack/react-query'

import { authApi } from '@/features/auth/api/authApi'

import { useAuthStore } from '@/entities/user/model/authStore'

export function useRegisterMutation() {
  const setTokens = useAuthStore((s) => s.setTokens)

  return useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.register(email, password),
    onSuccess: ({ accessToken, refreshToken, refreshTokenExpiresAt }) => {
      setTokens(accessToken, refreshToken, refreshTokenExpiresAt)
    },
  })
}
