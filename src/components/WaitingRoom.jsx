import { useState } from 'react'
import { motion } from 'framer-motion'

const MotionDiv = motion.div

function PulsingDots() {
  return (
    <span className="inline-flex items-center gap-1" aria-hidden>
      {[0, 1, 2].map((i) => (
        <MotionDiv
          key={i}
          className="h-2 w-2 rounded-full bg-amber-400/80"
          animate={{ opacity: [0.3, 1, 0.3], scale: [0.85, 1.15, 0.85] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </span>
  )
}

export function WaitingRoom({ session, onLeave }) {
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
    <section className="w-full max-w-md space-y-8 text-center">
      <div>
        <p className="font-[family-name:var(--font-card-meta)] text-sm font-medium text-slate-400">
          Share this code with your friend
        </p>

        <button
          type="button"
          onClick={copyCode}
          className="group mt-4 inline-flex items-center gap-3 rounded-2xl border border-amber-500/25 bg-amber-950/20 px-8 py-5 transition hover:border-amber-500/40 hover:bg-amber-950/35 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
          aria-label={`Copy room code ${session.id}`}
        >
          <span className="font-mono text-4xl font-bold tracking-[0.2em] text-amber-200 sm:text-5xl">
            {session.id}
          </span>
          <span className="rounded-lg bg-amber-500/15 px-2.5 py-1.5 text-xs font-medium text-amber-300 transition group-hover:bg-amber-500/25">
            {copyState === 'copied' ? 'Copied!' : copyState === 'failed' ? 'Failed' : 'Copy'}
          </span>
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-center gap-3">
          <PulsingDots />
          <p className="text-sm text-slate-400">Waiting for your friend to join</p>
          <PulsingDots />
        </div>
        <p className="text-xs text-slate-500">
          This page will update automatically when they enter the code.
        </p>
      </div>

      <button
        type="button"
        onClick={onLeave}
        className="text-sm text-slate-500 underline decoration-slate-700 underline-offset-4 transition hover:text-slate-300 hover:decoration-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500/50"
      >
        Cancel and leave
      </button>
    </section>
  )
}
