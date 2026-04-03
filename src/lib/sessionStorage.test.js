import { describe, it, expect, beforeEach } from 'vitest'
import {
  SESSION_STORAGE_KEYS,
  saveSession,
  loadSession,
} from './sessionStorage.js'

beforeEach(() => {
  localStorage.clear()
})

describe('saveSession', () => {
  it('throws when userSlot is not user1 or user2', () => {
    expect(() => saveSession('ABC123', 'user3')).toThrow(/userSlot/)
  })
})

describe('loadSession', () => {
  it('returns null and clears storage when userSlot is corrupted', () => {
    localStorage.setItem(SESSION_STORAGE_KEYS.sessionId, 'XYZ789')
    localStorage.setItem(SESSION_STORAGE_KEYS.userSlot, 'invalid')
    expect(loadSession()).toBeNull()
    expect(localStorage.getItem(SESSION_STORAGE_KEYS.sessionId)).toBeNull()
  })
})
