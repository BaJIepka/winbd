interface JwtPayload {
  exp?: number
  userId?: string
  email?: string
  [key: string]: unknown
}

export function decodeJwt(token: string): JwtPayload {
  const parts = token.split('.')
  if (parts.length !== 3) return {}
  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64)) as JwtPayload
  } catch {
    return {}
  }
}

export function getTokenExp(token: string): number | undefined {
  return decodeJwt(token).exp
}
