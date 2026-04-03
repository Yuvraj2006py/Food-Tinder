import { useCallback, useEffect, useRef, useState, startTransition } from 'react'
import { findMutualYesRestaurantIds } from '../lib/matchFromVotes.js'

/**
 * Phase 10: when both slots have vote === 'yes' for the same restaurant, surface one modal per id.
 * @param {Array<Record<string, unknown>>} votes
 * @param {Array<{ id: string, name?: string, address?: string | null, cuisine?: string | null }>} deck
 * @param {string | null | undefined} sessionId — resets celebration set when room changes
 */
export function useMatch(votes, deck, sessionId) {
  const celebratedRef = useRef(new Set())
  const [matchedRestaurant, setMatchedRestaurant] = useState(null)

  useEffect(() => {
    celebratedRef.current = new Set()
    startTransition(() => {
      setMatchedRestaurant(null)
    })
  }, [sessionId])

  useEffect(() => {
    if (!Array.isArray(deck) || deck.length === 0) return
    if (matchedRestaurant) return

    const mutualIds = findMutualYesRestaurantIds(votes)
    for (const rid of mutualIds) {
      if (celebratedRef.current.has(rid)) continue
      const row = deck.find((r) => r.id === rid)
      if (!row) continue

      celebratedRef.current.add(rid)
      startTransition(() => {
        setMatchedRestaurant({
          id: row.id,
          name: row.name ?? 'Restaurant',
          address: row.address ?? null,
          cuisine: row.cuisine ?? null,
        })
      })
      return
    }
  }, [votes, deck, matchedRestaurant])

  const dismissMatch = useCallback(() => {
    setMatchedRestaurant(null)
  }, [])

  return { matchedRestaurant, dismissMatch }
}
