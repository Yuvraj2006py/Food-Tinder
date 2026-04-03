function isNetworkMessage(m) {
  return (
    m === 'Failed to fetch' ||
    m.includes('NetworkError') ||
    m.includes('Load failed') ||
    /network/i.test(m) ||
    m === 'The user aborted a request.'
  )
}

/**
 * Map thrown values to short, user-safe copy (network, Supabase, etc.).
 * @param {unknown} e
 * @param {string} [fallback]
 */
export function toUserFacingError(e, fallback = 'Something went wrong. Try again.') {
  let m = ''
  if (e instanceof Error) {
    m = e.message
  } else if (e && typeof e === 'object' && 'message' in e && typeof e.message === 'string') {
    m = e.message
  }

  if (m) {
    if (isNetworkMessage(m)) {
      return 'Network error — check your connection and try again.'
    }
    return m
  }

  return fallback
}
