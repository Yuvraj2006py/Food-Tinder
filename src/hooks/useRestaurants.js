import { useCallback, useEffect, useState } from 'react'
import { fetchRestaurantsForSession } from '../lib/restaurantsDb.js'
import { toUserFacingError } from '../lib/userFacingError.js'

/**
 * Phase 7: read the shared deck from Supabase for a session (`card_order` ascending).
 * @param {string | null | undefined} sessionId
 */
export function useRestaurants(sessionId) {
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!sessionId) {
      setRestaurants([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const list = await fetchRestaurantsForSession(sessionId)
      setRestaurants(list)
    } catch (e) {
      setError(toUserFacingError(e, 'Could not load restaurants.'))
      setRestaurants([])
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { restaurants, loading, error, refetch }
}
