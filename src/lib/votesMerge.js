/**
 * Merge a vote row into the list (backfill + realtime + insert response).
 * Dedupes by id, or by (session_id, restaurant_id, user_slot).
 * @param {Array<Record<string, unknown>>} prev
 * @param {Record<string, unknown>} incoming
 */
export function mergeVoteRow(prev, incoming) {
  if (!incoming || typeof incoming !== 'object') return prev

  const sid = incoming.session_id
  const rid = incoming.restaurant_id
  const slot = incoming.user_slot
  const id = incoming.id

  const next = [...prev]

  if (id) {
    const byId = next.findIndex((r) => r.id === id)
    if (byId >= 0) {
      next[byId] = { ...next[byId], ...incoming }
      return next
    }
  }

  const byKey = next.findIndex(
    (r) =>
      r.session_id === sid &&
      r.restaurant_id === rid &&
      r.user_slot === slot,
  )
  if (byKey >= 0) {
    next[byKey] = { ...next[byKey], ...incoming }
    return next
  }

  next.push(incoming)
  return next
}

/**
 * @param {Array<Record<string, unknown>>} prev
 * @param {Array<Record<string, unknown>>} incoming
 */
export function mergeVoteList(prev, incoming) {
  let acc = prev
  for (const row of incoming) {
    acc = mergeVoteRow(acc, row)
  }
  return acc
}
