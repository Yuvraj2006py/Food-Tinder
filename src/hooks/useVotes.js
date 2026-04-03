import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { mergeVoteRow } from '../lib/votesMerge.js'
import { toUserFacingError } from '../lib/userFacingError.js'

/** Postgres unique_violation — duplicate (session_id, restaurant_id, user_slot). */
export function isUniqueViolation(error) {
  return error != null && (error.code === '23505' || String(error.code) === '23505')
}

/**
 * Phase 9: load votes, subscribe to inserts, castVote with user_slot from session.
 * @param {string | null | undefined} sessionId
 * @param {'user1' | 'user2' | null | undefined} userSlot
 */
export function useVotes(sessionId, userSlot) {
  const [votes, setVotes] = useState([])
  const [loading, setLoading] = useState(() => Boolean(sessionId))
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!sessionId) {
      setVotes([])
      setLoading(false)
      setError(null)
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { data, error: qErr } = await supabase
        .from('votes')
        .select('*')
        .eq('session_id', sessionId)

      if (qErr) throw qErr
      setVotes(data ?? [])
    } catch (e) {
      setError(toUserFacingError(e, 'Could not load votes.'))
      setVotes([])
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => {
    refetch()
  }, [refetch])

  useEffect(() => {
    if (!sessionId) return undefined

    const filter = `session_id=eq.${sessionId}`
    const channel = supabase
      .channel(`votes:${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'votes',
          filter,
        },
        (payload) => {
          const row = payload.new
          if (!row) return
          setVotes((prev) => mergeVoteRow(prev, row))
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [sessionId])

  const castVote = useCallback(
    async (restaurantId, vote) => {
      if (!sessionId) {
        throw new Error('No active session.')
      }
      if (userSlot !== 'user1' && userSlot !== 'user2') {
        throw new Error('Missing user slot — rejoin the room.')
      }
      if (vote !== 'yes' && vote !== 'no') {
        throw new Error('Invalid vote.')
      }

      const { data, error: insErr } = await supabase
        .from('votes')
        .insert({
          session_id: sessionId,
          restaurant_id: restaurantId,
          user_slot: userSlot,
          vote,
        })
        .select()
        .single()

      if (insErr) {
        if (isUniqueViolation(insErr)) {
          return
        }
        throw new Error(insErr.message ?? 'Could not save vote.')
      }

      if (data) {
        setVotes((prev) => mergeVoteRow(prev, data))
      }
    },
    [sessionId, userSlot],
  )

  return { votes, loading, error, castVote, refetch }
}
