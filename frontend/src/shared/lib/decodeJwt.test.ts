import { describe, expect, it } from 'vitest'

import { decodeJwt, getTokenExp } from './decodeJwt'

function makeJwt(payload: object): string {
  const json = JSON.stringify(payload)
  const b64url = btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
  return `eyJhbGciOiJIUzI1NiJ9.${b64url}.fakesig`
}

describe('decodeJwt', () => {
  it('decodes a valid JWT payload', () => {
    const payload = { userId: 'u123', email: 'test@test.com', exp: 9999999999 }
    const result = decodeJwt(makeJwt(payload))
    expect(result.userId).toBe('u123')
    expect(result.email).toBe('test@test.com')
    expect(result.exp).toBe(9999999999)
  })

  it('returns empty object for token with wrong number of parts', () => {
    expect(decodeJwt('only.two')).toEqual({})
    expect(decodeJwt('a.b.c.d')).toEqual({})
  })

  it('returns empty object for invalid base64 payload', () => {
    expect(decodeJwt('header.!!!invalid!!!.sig')).toEqual({})
  })

  it('returns empty object for empty string', () => {
    expect(decodeJwt('')).toEqual({})
  })
})

describe('getTokenExp', () => {
  it('extracts exp from a valid JWT', () => {
    const token = makeJwt({ exp: 1234567890 })
    expect(getTokenExp(token)).toBe(1234567890)
  })

  it('returns undefined for invalid token', () => {
    expect(getTokenExp('not.a.token.at.all')).toBeUndefined()
  })

  it('returns undefined when exp is absent', () => {
    const token = makeJwt({ userId: 'u1' })
    expect(getTokenExp(token)).toBeUndefined()
  })
})
