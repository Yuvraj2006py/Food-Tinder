import { describe, expect, it } from 'vitest'
import { toUserFacingError } from './userFacingError.js'

describe('toUserFacingError', () => {
  it('maps Failed to fetch', () => {
    expect(toUserFacingError(new Error('Failed to fetch'))).toMatch(/Network error/)
  })

  it('passes through known app messages', () => {
    expect(toUserFacingError(new Error('No room with that code.'))).toBe('No room with that code.')
  })

  it('uses fallback for non-Error', () => {
    expect(toUserFacingError(null, 'oops')).toBe('oops')
  })
})
