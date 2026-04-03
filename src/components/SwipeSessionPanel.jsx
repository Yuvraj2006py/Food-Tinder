import { CardStack } from './CardStack.jsx'
import { LoadingBlock } from './Spinner.jsx'

export function SwipeSessionPanel({
  session,
  deck,
  deckLoading,
  votesLoading,
  onLeave,
  onSwipe,
}) {
  const loading = deckLoading || votesLoading

  return (
    <section className="flex flex-1 flex-col">
      <nav className="mb-4 flex items-center justify-between">
        <p className="font-[family-name:var(--font-card-meta)] text-sm font-medium text-slate-300">
          {session.user1_name}
          <span className="mx-1.5 text-slate-600">&</span>
          {session.user2_name}
        </p>
        <button
          type="button"
          onClick={onLeave}
          className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-800 hover:text-slate-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/50"
        >
          Leave
        </button>
      </nav>

      <div className="flex flex-1 flex-col">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <LoadingBlock
              title="Loading your deck"
              detail="Grabbing the restaurants for this room."
              size="lg"
            />
          </div>
        ) : deck.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="font-[family-name:var(--font-card-display)] text-xl text-white">
              No restaurants found
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-slate-400">
              This area came up empty. Start a new room with a bigger city or a different cuisine.
            </p>
            <button
              type="button"
              onClick={onLeave}
              className="mt-4 rounded-xl bg-amber-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
            >
              Start over
            </button>
          </div>
        ) : (
          <CardStack items={deck} onSwipe={onSwipe} />
        )}
      </div>
    </section>
  )
}
