/** localStorage keys for rejoin after refresh / app switch */
export const SESSION_STORAGE_KEYS = {
  sessionId: 'food_tinder_session_id',
  userSlot: 'food_tinder_user_slot',
}

/**
 * @param {string} sessionId
 * @param {'user1' | 'user2'} userSlot
 */
export function saveSession(sessionId, userSlot) {
  if (userSlot !== 'user1' && userSlot !== 'user2') {
    throw new Error('userSlot must be "user1" or "user2".')
  }
  localStorage.setItem(SESSION_STORAGE_KEYS.sessionId, sessionId)
  localStorage.setItem(SESSION_STORAGE_KEYS.userSlot, userSlot)
}

/**
 * @returns {{ sessionId: string, userSlot: 'user1' | 'user2' } | null}
 */
export function loadSession() {
  const sessionId = localStorage.getItem(SESSION_STORAGE_KEYS.sessionId)
  const userSlot = localStorage.getItem(SESSION_STORAGE_KEYS.userSlot)
  if (!sessionId || !userSlot) return null
  if (userSlot !== 'user1' && userSlot !== 'user2') {
    clearSession()
    return null
  }
  return { sessionId, userSlot }
}

export function clearSession() {
  localStorage.removeItem(SESSION_STORAGE_KEYS.sessionId)
  localStorage.removeItem(SESSION_STORAGE_KEYS.userSlot)
}
