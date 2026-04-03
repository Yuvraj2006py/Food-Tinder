import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from './lib/supabase.js'
import { useSession } from './hooks/useSession.js'
import { useRestaurants } from './hooks/useRestaurants.js'
import { useVotes } from './hooks/useVotes.js'
import { useMatch } from './hooks/useMatch.js'
import { SetupScreen } from './components/SetupScreen.jsx'
import { WaitingRoom } from './components/WaitingRoom.jsx'
import { SwipeSessionPanel } from './components/SwipeSessionPanel.jsx'
import { MatchModal } from './components/MatchModal.jsx'
import { Spinner } from './components/Spinner.jsx'

const MotionDiv = motion.div

function App() {
  const [dbStatus, setDbStatus] = useState({
    state: 'loading',
    message: '',
    sessionCount: null,
  })

  const {
    phase,
    session,
    userSlot,
    error,
    createSession,
    joinSession,
    rehydrate,
    leaveSession,
    clearError,
  } = useSession()

  const {
    restaurants: deck,
    loading: deckLoading,
    error: deckError,
  } = useRestaurants(session?.id)

  const {
    votes,
    loading: votesLoading,
    error: votesError,
    castVote,
  } = useVotes(session?.id, userSlot)

  const { matchedRestaurant, dismissMatch } = useMatch(votes, deck, session?.id)

  const [hostName, setHostName] = useState('')
  const [city, setCity] = useState('')
  const [cuisine, setCuisine] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [guestName, setGuestName] = useState('')

  useEffect(() => {
    let cancelled = false

    async function probeSessions() {
      const { error: supaError, count } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })

      if (cancelled) return

      if (supaError) {
        setDbStatus({
          state: 'error',
          message: supaError.message,
          sessionCount: null,
        })
        return
      }

      setDbStatus({
        state: 'ok',
        message: 'Can read public.sessions with the anon key (RLS allows it).',
        sessionCount: count ?? 0,
      })
    }

    probeSessions()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (phase === 'creating' || phase === 'joining') return
    clearError()
    await createSession({ user1Name: hostName, city, cuisine })
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (phase === 'creating' || phase === 'joining') return
    clearError()
    await joinSession({ code: joinCode, user2Name: guestName })
  }

  const showLobby = phase === 'idle'
  const wideLayout =
    session && (phase === 'waiting_host' || phase === 'active')

  return (
    <div className="min-h-dvh bg-slate-950 px-4 py-10 text-slate-200 sm:px-6">
      <MatchModal restaurant={matchedRestaurant} onDismiss={dismissMatch} />
      <main className={`mx-auto ${wideLayout ? 'max-w-xl' : 'max-w-lg'}`}>
        <MotionDiv
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <header className="text-center">
            <p className="text-sm font-medium uppercase tracking-widest text-amber-400/90">Decide together</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Food Tinder
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Create a room, share the code, swipe until you match on a place to try.
            </p>
          </header>

          <div
            className={`rounded-lg border px-4 py-3 text-left text-sm ${
              dbStatus.state === 'loading'
                ? 'border-slate-600 bg-slate-900/80 text-slate-300'
                : dbStatus.state === 'ok'
                  ? 'border-emerald-700/60 bg-emerald-950/40 text-emerald-100/95'
                  : 'border-red-800/70 bg-red-950/40 text-red-100/95'
            }`}
          >
            {dbStatus.state === 'loading' && (
              <div className="flex items-center gap-2">
                <Spinner size="sm" label="Checking database connection" />
                <span>Checking database…</span>
              </div>
            )}
            {dbStatus.state === 'ok' && (
              <>
                <p className="font-medium text-emerald-200">Supabase connected</p>
                <p className="mt-2 font-mono text-xs text-emerald-200/80">
                  sessions in DB: {dbStatus.sessionCount}
                </p>
              </>
            )}
            {dbStatus.state === 'error' && (
              <>
                <p className="font-medium text-red-200">Database check failed</p>
                <p className="mt-1 text-red-100/85">{dbStatus.message}</p>
              </>
            )}
          </div>

          {error && (
            <div className="rounded-lg border border-red-800/70 bg-red-950/40 px-4 py-3 text-left text-sm text-red-100/95">
              {error}
            </div>
          )}

          {deckError && session && (
            <div className="rounded-lg border border-red-800/70 bg-red-950/40 px-4 py-3 text-left text-sm text-red-100/95">
              {deckError}
            </div>
          )}

          {votesError && session && (
            <div className="rounded-lg border border-red-800/70 bg-red-950/40 px-4 py-3 text-left text-sm text-red-100/95">
              {votesError}
            </div>
          )}

          {phase === 'loading' && !session && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 py-10">
              <Spinner size="md" label="Restoring your room" />
              <p className="text-sm text-slate-400">Restoring your room…</p>
            </div>
          )}

          {phase === 'waiting_host' && session && (
            <WaitingRoom
              session={session}
              deckLoading={deckLoading}
              deckLength={deck.length}
              onCheckPartner={() => {
                clearError()
                rehydrate()
              }}
              onLeave={leaveSession}
            />
          )}

          {phase === 'active' && session && (
            <SwipeSessionPanel
              session={session}
              userSlot={userSlot}
              deck={deck}
              votes={votes}
              deckLoading={deckLoading}
              votesLoading={votesLoading}
              onLeave={leaveSession}
              onSwipe={async (vote, item) => {
                await castVote(item.id, vote)
              }}
            />
          )}

          {showLobby && (
            <SetupScreen
              hostName={hostName}
              onHostNameChange={setHostName}
              city={city}
              onCityChange={setCity}
              cuisine={cuisine}
              onCuisineChange={setCuisine}
              joinCode={joinCode}
              onJoinCodeChange={setJoinCode}
              guestName={guestName}
              onGuestNameChange={setGuestName}
              onCreate={handleCreate}
              onJoin={handleJoin}
              creating={phase === 'creating'}
              joining={phase === 'joining'}
            />
          )}
        </MotionDiv>
      </main>
    </div>
  )
}

export default App
