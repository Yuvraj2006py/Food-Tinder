/**
 * Restaurant IDs where both players voted yes (Phase 10).
 * @param {Array<{ restaurant_id: string, user_slot: string, vote: string }>} votes
 * @returns {string[]}
 */
export function findMutualYesRestaurantIds(votes) {
  const byRest = new Map()

  for (const v of votes) {
    if (v.vote !== 'yes') continue
    const rid = v.restaurant_id
    if (!byRest.has(rid)) {
      byRest.set(rid, { user1: false, user2: false })
    }
    const slot = byRest.get(rid)
    if (v.user_slot === 'user1') slot.user1 = true
    if (v.user_slot === 'user2') slot.user2 = true
  }

  const out = []
  for (const [rid, { user1, user2 }] of byRest) {
    if (user1 && user2) out.push(rid)
  }
  return out
}
