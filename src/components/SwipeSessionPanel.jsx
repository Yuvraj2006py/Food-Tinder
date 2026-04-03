import { CardStack } from './CardStack.jsx'
import { LoadingBlock } from './Spinner.jsx'

/**
 * Active room — deck + votes (parent supplies data and handlers).
 */
export function SwipeSessionPanel({
  session,
  userSlot,
  deck,
  votes,
  deckLoading,
  votesLoading,
  onLeave,
  onSwipe,
}) {
  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-emerald-800/50 bg-emerald-950/25 p-4 text-left">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-400/90">Room ready</p>
        <p className="text-sm text-slate-300">
          Code <span className="font-mono font-semibold text-emerald-200">{session.id}</span> ·{' '}
          {session.user1_name} &amp; {session.user2_name}
        </p>
        <p className="mt-1 text-xs text-slate-500">
          You are <span className="text-slate-400">{userSlot}</span>
          {deckLoading || votesLoading
            ? ' · loading deck & votes…'
            : ` · ${deck.length} places · ${votes.length} vote${votes.length === 1 ? '' : 's'} loaded`}
        </p>
        <button
          type="button"
          onClick={onLeave}
          className="mt-3 rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50"
        >
          Leave room
        </button>
      </div>

      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-4 sm:p-5">
        <p className="mb-4 text-center text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
          Swipe the room deck
        </p>
        {deckLoading || votesLoading ? (
          <LoadingBlock
            title="Loading deck & votes"
            detail="Syncing places and your saved swipes from the room."
            size="lg"
          />
        ) : deck.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-amber-800/35 bg-slate-900/50 px-6 py-14 text-center">
            <p className="font-[family-name:var(--font-card-display)] text-lg text-white">No places in this deck</p>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              This room has no restaurants yet. Try a larger city or a different cuisine next time you create a room.
            </p>
          </div>
        ) : (
          <CardStack items={deck} onSwipe={onSwipe} />
        )}
      </div>
    </section>
  )
}
