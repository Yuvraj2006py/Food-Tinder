import { Spinner } from './Spinner.jsx'

/**
 * Lobby — create room (host) or join with code (guest).
 */
export function SetupScreen({
  hostName,
  onHostNameChange,
  city,
  onCityChange,
  cuisine,
  onCuisineChange,
  joinCode,
  onJoinCodeChange,
  guestName,
  onGuestNameChange,
  onCreate,
  onJoin,
  creating,
  joining,
}) {
  const busy = creating || joining

  return (
    <div className="space-y-4">
      <form
        onSubmit={onCreate}
        aria-busy={creating}
        className="space-y-3 rounded-xl border border-slate-700/80 bg-slate-900/60 p-4"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Host — create room</p>
        <label className="block text-left text-sm">
          <span className="text-slate-400">Your name</span>
          <input
            required
            value={hostName}
            onChange={(ev) => onHostNameChange(ev.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            placeholder="Alex"
            autoComplete="name"
          />
        </label>
        <label className="block text-left text-sm">
          <span className="text-slate-400">City / area</span>
          <input
            required
            value={city}
            onChange={(ev) => onCityChange(ev.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            placeholder="Toronto, ON"
          />
        </label>
        <label className="block text-left text-sm">
          <span className="text-slate-400">Cuisine filter (optional)</span>
          <input
            value={cuisine}
            onChange={(ev) => onCuisineChange(ev.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            placeholder="italian"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 py-2.5 text-sm font-medium text-slate-950 hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 disabled:pointer-events-none disabled:opacity-50"
        >
          {creating ? (
            <>
              <Spinner tone="on-amber" size="sm" label="Creating room and loading places" />
              <span>Creating room &amp; fetching places…</span>
            </>
          ) : (
            'Create room'
          )}
        </button>
      </form>

      <form
        onSubmit={onJoin}
        aria-busy={joining}
        className="space-y-3 rounded-xl border border-slate-700/80 bg-slate-900/60 p-4"
      >
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Guest — join with code</p>
        <label className="block text-left text-sm">
          <span className="text-slate-400">Session code</span>
          <input
            required
            value={joinCode}
            onChange={(ev) => onJoinCodeChange(ev.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 font-mono tracking-wider text-white focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            placeholder="ABC123"
            maxLength={8}
            autoCapitalize="characters"
            autoCorrect="off"
          />
        </label>
        <label className="block text-left text-sm">
          <span className="text-slate-400">Your name</span>
          <input
            required
            value={guestName}
            onChange={(ev) => onGuestNameChange(ev.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-600 bg-slate-950 px-3 py-2 text-white focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            placeholder="Sam"
            autoComplete="name"
          />
        </label>
        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-emerald-700/60 bg-emerald-950/40 py-2.5 text-sm font-medium text-emerald-100 hover:bg-emerald-900/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 disabled:pointer-events-none disabled:opacity-50"
        >
          {joining ? (
            <>
              <Spinner tone="on-emerald" size="sm" label="Joining room" />
              <span>Joining…</span>
            </>
          ) : (
            'Join room'
          )}
        </button>
      </form>
    </div>
  )
}
