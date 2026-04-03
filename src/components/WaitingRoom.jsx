import { useState } from 'react'
import { Spinner } from './Spinner.jsx'

/**
 * Host waits for partner — room code, copy, deck status.
 */
export function WaitingRoom({
  session,
  deckLoading,
  deckLength,
  onCheckPartner,
  onLeave,
}) {
  const [copyState, setCopyState] = useState('idle')

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(session.id)
      setCopyState('copied')
      setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      setCopyState('failed')
      setTimeout(() => setCopyState('idle'), 2000)
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-amber-700/40 bg-amber-950/20 p-4 text-left">
      <p className="text-xs font-medium uppercase tracking-wide text-amber-500/90">Waiting for partner</p>
      <p className="text-sm text-slate-300">
        Share this code:{' '}
        <span className="font-mono text-xl font-semibold tracking-wider text-amber-200">{session.id}</span>
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={copyCode}
          className="rounded-lg border border-amber-600/60 bg-amber-950/40 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-900/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
        >
          {copyState === 'copied' ? 'Copied!' : copyState === 'failed' ? 'Copy failed' : 'Copy code'}
        </button>
      </div>
      <p className="text-xs text-slate-500">
        You are <span className="text-slate-400">{session.user1_name}</span> · Host (user1). When your friend
        joins, this screen updates automatically.
      </p>
      <p className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        {deckLoading ? (
          <>
            <Spinner size="sm" label="Loading deck" />
            <span>Loading deck…</span>
          </>
        ) : (
          <span>
            Deck seeded:{' '}
            <span className="font-medium text-slate-400">{deckLength}</span> restaurant
            {deckLength === 1 ? '' : 's'}
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onCheckPartner}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
        >
          Refresh status
        </button>
        <button
          type="button"
          onClick={onLeave}
          className="rounded-lg border border-slate-600 px-4 py-2 text-sm text-slate-400 hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/50"
        >
          Leave room
        </button>
      </div>
    </section>
  )
}
