import { describe, expect, it } from 'vitest'

import { parseEnv } from '@/lib/env'

const valid = {
  DATABASE_URL: 'postgres://user:pass@localhost:5432/db',
  PAYLOAD_SECRET: 'a-long-enough-secret-value',
}

describe('parseEnv', () => {
  it('accepts the minimal required variables and applies defaults', () => {
    const env = parseEnv(valid)
    expect(env.NEXT_PUBLIC_SITE_URL).toBe('http://localhost:3000')
    expect(env.SMTP_PORT).toBeUndefined()
  })

  it('treats blank optional values as unset and coerces numbers', () => {
    const env = parseEnv({ ...valid, SMTP_HOST: '', SMTP_PORT: '587' })
    expect(env.SMTP_HOST).toBeUndefined()
    expect(env.SMTP_PORT).toBe(587)
  })

  it('fails with a readable message naming the variable but not its value', () => {
    expect(() => parseEnv({ ...valid, DATABASE_URL: 'mongodb://secret-host/x' })).toThrow(
      /DATABASE_URL: must start with postgres/,
    )
    expect(() => parseEnv({ ...valid, DATABASE_URL: 'mongodb://secret-host/x' })).not.toThrow(
      /secret-host/,
    )
  })

  it('rejects missing, short and placeholder secrets', () => {
    expect(() => parseEnv({ DATABASE_URL: valid.DATABASE_URL })).toThrow(/PAYLOAD_SECRET/)
    expect(() => parseEnv({ ...valid, PAYLOAD_SECRET: 'short' })).toThrow(/at least 16/)
    expect(() => parseEnv({ ...valid, PAYLOAD_SECRET: 'YOUR_SECRET_HERE' })).toThrow(/placeholder/)
  })
})
