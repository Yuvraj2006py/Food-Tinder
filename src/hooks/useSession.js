import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { reserveUniqueSessionId } from '../lib/sessionCode.js'
import { searchRestaurantsByCity } from '../lib/overpass.js'
import { clearSession, loadSession, saveSession } from '../lib/sessionStorage.js'
import { toUserFacingError } from '../lib/userFacingError.js'

function normalizeCode(code) {
  return String(code ?? '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
}

async function fetchSessionRow(sessionId) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * Create/join/rehydrate swipe rooms: seeds `sessions` + `restaurants` from OSM on create.
 */
export function useSession() {
  const [phase, setPhase] = useState('loading')
  const [session, setSession] = useState(null)
  const [userSlot, setUserSlot] = useState(null)
  const [error, setError] = useState(null)

  const rehydrate = useCallback(async () => {
    setError(null)
    const saved = loadSession()
    if (!saved) {
      setPhase('idle')
      setSession(null)
      setUserSlot(null)
      return
    }

    setPhase('loading')
    try {
      const row = await fetchSessionRow(saved.sessionId)
      if (!row) {
        clearSession()
        setPhase('idle')
        setSession(null)
        setUserSlot(null)
        return
      }

      setSession(row)
      setUserSlot(saved.userSlot)

      if (saved.userSlot === 'user1') {
        if (row.user2_name && row.status === 'active') {
          setPhase('active')
        } else {
          setPhase('waiting_host')
        }
      } else {
        setPhase('active')
      }
    } catch (e) {
      setError(toUserFacingError(e, 'Failed to restore session.'))
      setPhase('idle')
      setSession(null)
      setUserSlot(null)
    }
  }, [])

  useEffect(() => {
    rehydrate()
  }, [rehydrate])

  /** Phase 11: host leaves waiting room when guest joins (Realtime UPDATE on `sessions`). */
  useEffect(() => {
    if (phase !== 'waiting_host' || !session?.id) return undefined

    const sid = session.id
    const filter = `id=eq.${sid}`
    const channel = supabase
      .channel(`session:${sid}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sessions',
          filter,
        },
        (payload) => {
          const row = payload.new
          if (row?.user2_name && row.status === 'active') {
            setSession(row)
            setPhase('active')
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [phase, session?.id])

  const createSession = useCallback(
    async ({ user1Name, city, cuisine = '' }) => {
      const name = user1Name?.trim()
      if (!name) {
        setError('Enter your name.')
        return
      }
      const cityTrim = city?.trim()
      if (!cityTrim) {
        setError('Enter a city or area.')
        return
      }

      setPhase('creating')
      setError(null)
      let sessionId = null

      try {
        const { restaurants: osmRows } = await searchRestaurantsByCity(cityTrim, {
          cuisine,
          radius: 2000,
          maxResults: 20,
        })
        if (!osmRows.length) {
          throw new Error(
            'No named restaurants found in that area. Try a larger city or clear the cuisine filter.',
          )
        }

        sessionId = await reserveUniqueSessionId(supabase)

        const { error: insErr } = await supabase.from('sessions').insert({
          id: sessionId,
          city: cityTrim,
          cuisine: cuisine.trim() || null,
          user1_name: name,
          status: 'waiting',
        })
        if (insErr) throw insErr

        const rows = osmRows.map((r) => ({
          session_id: sessionId,
          osm_id: r.osm_id,
          name: r.name,
          cuisine: r.cuisine,
          address: r.address,
          lat: r.lat,
          lng: r.lng,
          card_order: r.card_order,
        }))

        const { error: restErr } = await supabase.from('restaurants').insert(rows)
        if (restErr) {
          await supabase.from('sessions').delete().eq('id', sessionId)
          throw restErr
        }

        saveSession(sessionId, 'user1')
        const row = await fetchSessionRow(sessionId)
        setSession(row)
        setUserSlot('user1')
        setPhase('waiting_host')
      } catch (e) {
        setError(toUserFacingError(e, 'Could not create room.'))
        setPhase('idle')
        setSession(null)
        setUserSlot(null)
      }
    },
    [],
  )

  const joinSession = useCallback(async ({ code, user2Name }) => {
    const norm = normalizeCode(code)
    if (norm.length !== 6) {
      setError('Enter a 6-character session code.')
      return
    }
    const name = user2Name?.trim()
    if (!name) {
      setError('Enter your name.')
      return
    }

    setPhase('joining')
    setError(null)

    try {
      const existing = await fetchSessionRow(norm)
      if (!existing) {
        throw new Error('No room with that code. Check with your friend and try again.')
      }
      if (existing.user2_name) {
        throw new Error('That room is already full.')
      }

      const { data, error: updErr } = await supabase
        .from('sessions')
        .update({ user2_name: name, status: 'active' })
        .eq('id', norm)
        .is('user2_name', null)
        .select()

      if (updErr) throw updErr
      if (!data?.length) {
        throw new Error('Someone else joined just before you. Try again or ask for a new code.')
      }

      saveSession(norm, 'user2')
      const updated = await fetchSessionRow(norm)
      setSession(updated)
      setUserSlot('user2')
      setPhase('active')
    } catch (e) {
      setError(toUserFacingError(e, 'Could not join.'))
      setPhase('idle')
    }
  }, [])

  const leaveSession = useCallback(() => {
    clearSession()
    setSession(null)
    setUserSlot(null)
    setPhase('idle')
    setError(null)
  }, [])

  return {
    phase,
    session,
    userSlot,
    error,
    createSession,
    joinSession,
    rehydrate,
    leaveSession,
    clearError: () => setError(null),
  }
}
