import { supabase } from './supabase.js'

/**
 * Load the swipe deck for a room from Postgres (single source of truth for card order).
 * @param {string | null | undefined} sessionId
 * @returns {Promise<Array<Record<string, unknown>>>}
 */
export async function fetchRestaurantsForSession(sessionId) {
  if (!sessionId) return []

  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('session_id', sessionId)
    .order('card_order', { ascending: true })

  if (error) throw error
  return data ?? []
}
