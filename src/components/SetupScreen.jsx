import { useState } from 'react'
import { motion } from 'framer-motion'
import { Spinner } from './Spinner.jsx'

const MotionDiv = motion.div

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
  const [mode, setMode] = useState('create')

  const inputClass =
    'mt-1.5 w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 py-3 text-[15px] text-white placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30 transition-colors'

  return (
    <div className="space-y-6">
      <div className="flex overflow-hidden rounded-xl border border-slate-700/60 bg-slate-900/50">
        <button
          type="button"
          onClick={() => setMode('create')}
          className={`flex-1 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 ${
            mode === 'create'
              ? 'bg-amber-500/10 text-amber-300'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Start a room
        </button>
        <div className="w-px bg-slate-700/60" />
        <button
          type="button"
          onClick={() => setMode('join')}
          className={`flex-1 py-3 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 ${
            mode === 'join'
              ? 'bg-amber-500/10 text-amber-300'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Join a friend
        </button>
      </div>

      {mode === 'create' ? (
        <MotionDiv
          key="create-form"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <form onSubmit={onCreate} aria-busy={creating} className="space-y-4">
            <label className="block text-left">
              <span className="text-sm font-medium text-slate-300">Your name</span>
              <input
                required
                value={hostName}
                onChange={(ev) => onHostNameChange(ev.target.value)}
                className={inputClass}
                placeholder="Alex"
                autoComplete="name"
              />
            </label>
            <label className="block text-left">
              <span className="text-sm font-medium text-slate-300">City or neighborhood</span>
              <input
                required
                value={city}
                onChange={(ev) => onCityChange(ev.target.value)}
                className={inputClass}
                placeholder="Toronto, ON"
              />
            </label>
            <label className="block text-left">
              <span className="text-sm font-medium text-slate-300">
                Cuisine <span className="font-normal text-slate-500">(optional)</span>
              </span>
              <input
                value={cuisine}
                onChange={(ev) => onCuisineChange(ev.target.value)}
                className={inputClass}
                placeholder="Italian, Thai, Sushi…"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-amber-500 py-3.5 text-[15px] font-semibold text-slate-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 disabled:pointer-events-none disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Spinner tone="on-amber" size="sm" label="Finding restaurants" />
                  <span>Finding restaurants…</span>
                </>
              ) : (
                'Start swiping'
              )}
            </button>
          </form>
        </MotionDiv>
      ) : (
        <MotionDiv
          key="join-form"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.2 }}
        >
          <form onSubmit={onJoin} aria-busy={joining} className="space-y-4">
            <label className="block text-left">
              <span className="text-sm font-medium text-slate-300">Room code</span>
              <input
                required
                value={joinCode}
                onChange={(ev) => onJoinCodeChange(ev.target.value)}
                className={`${inputClass} text-center font-mono text-lg tracking-[0.25em]`}
                placeholder="ABC123"
                maxLength={8}
                autoCapitalize="characters"
                autoCorrect="off"
              />
            </label>
            <label className="block text-left">
              <span className="text-sm font-medium text-slate-300">Your name</span>
              <input
                required
                value={guestName}
                onChange={(ev) => onGuestNameChange(ev.target.value)}
                className={inputClass}
                placeholder="Sam"
                autoComplete="name"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-amber-500 py-3.5 text-[15px] font-semibold text-slate-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80 disabled:pointer-events-none disabled:opacity-50"
            >
              {joining ? (
                <>
                  <Spinner tone="on-amber" size="sm" label="Joining" />
                  <span>Joining…</span>
                </>
              ) : (
                'Join room'
              )}
            </button>
          </form>
        </MotionDiv>
      )}
    </div>
  )
}
