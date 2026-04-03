import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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

const pageTransition = { duration: 0.32, ease: [0.22, 1, 0.36, 1] }

function App() {
  const {
    phase,
    session,
    userSlot,
    error,
    createSession,
    joinSession,
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
  const inRoom = session && (phase === 'waiting_host' || phase === 'active')

  const allErrors = [error, deckError && session ? deckError : null, votesError && session ? votesError : null].filter(Boolean)

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950 text-slate-200">
      <MatchModal restaurant={matchedRestaurant} onDismiss={dismissMatch} />

      <main className={`mx-auto w-full flex-1 px-4 sm:px-6 ${inRoom ? 'max-w-xl' : 'max-w-md'}`}>
        <AnimatePresence mode="wait">
          {phase === 'loading' && !session && (
            <MotionDiv
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={pageTransition}
              className="flex min-h-dvh flex-col items-center justify-center gap-4"
            >
              <Spinner size="lg" label="Loading" />
              <p className="text-sm text-slate-400">One sec…</p>
            </MotionDiv>
          )}

          {showLobby && (
            <MotionDiv
              key="lobby"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={pageTransition}
              className="flex min-h-dvh flex-col justify-center py-12"
            >
              <header className="mb-10 text-center">
                <h1 className="font-[family-name:var(--font-card-display)] text-4xl tracking-tight text-white sm:text-5xl">
                  Food Tinder
                </h1>
                <p className="font-[family-name:var(--font-card-meta)] mt-3 text-base text-slate-400">
                  Swipe on restaurants together. Match on where to eat.
                </p>
              </header>

              {allErrors.length > 0 && (
                <div className="mb-6 space-y-2">
                  {allErrors.map((msg, i) => (
                    <div
                      key={i}
                      className="rounded-xl bg-red-950/50 px-4 py-3 text-sm text-red-200"
                      role="alert"
                    >
                      {msg}
                    </div>
                  ))}
                </div>
              )}

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
            </MotionDiv>
          )}

          {phase === 'waiting_host' && session && (
            <MotionDiv
              key="waiting"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={pageTransition}
              className="flex min-h-dvh flex-col items-center justify-center py-12"
            >
              {allErrors.length > 0 && (
                <div className="mb-6 w-full max-w-md space-y-2">
                  {allErrors.map((msg, i) => (
                    <div key={i} className="rounded-xl bg-red-950/50 px-4 py-3 text-sm text-red-200" role="alert">
                      {msg}
                    </div>
                  ))}
                </div>
              )}
              <WaitingRoom session={session} onLeave={leaveSession} />
            </MotionDiv>
          )}

          {phase === 'active' && session && (
            <MotionDiv
              key="active"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={pageTransition}
              className="flex min-h-dvh flex-col py-6"
            >
              {allErrors.length > 0 && (
                <div className="mb-4 space-y-2">
                  {allErrors.map((msg, i) => (
                    <div key={i} className="rounded-xl bg-red-950/50 px-4 py-3 text-sm text-red-200" role="alert">
                      {msg}
                    </div>
                  ))}
                </div>
              )}
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
            </MotionDiv>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}

export default App
