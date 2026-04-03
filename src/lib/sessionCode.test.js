import { describe, it, expect, vi, afterEach } from 'vitest'
import { generateSessionCandidate } from './sessionCode.js'

describe('generateSessionCandidate', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('produces a 6-character code from the alphabet (deterministic when crypto is fixed)', () => {
    vi.stubGlobal('crypto', {
      getRandomValues: (arr) => {
        arr.fill(0)
        return arr
      },
    })
    expect(generateSessionCandidate()).toBe('222222')
  })
})
