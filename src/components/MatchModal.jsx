import { useEffect } from 'react'
import { motion } from 'framer-motion'

const MotionDiv = motion.div

export function MatchModal({ restaurant, onDismiss }) {
  useEffect(() => {
    if (!restaurant) return undefined
    function onKey(ev) {
      if (ev.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [restaurant, onDismiss])

  if (!restaurant) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="match-modal-title"
    >
      <MotionDiv
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-md"
        onClick={onDismiss}
        aria-hidden
      />
      <MotionDiv
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="relative z-10 w-full max-w-sm rounded-3xl border border-amber-500/30 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/40 px-8 py-10 text-center shadow-2xl shadow-amber-900/25"
      >
        <MotionDiv
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.15 }}
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/15"
        >
          <span className="text-3xl" role="img" aria-label="celebration">🎉</span>
        </MotionDiv>

        <p className="font-[family-name:var(--font-card-meta)] text-xs font-semibold uppercase tracking-[0.35em] text-amber-400">
          It&rsquo;s a match!
        </p>
        <h2
          id="match-modal-title"
          className="font-[family-name:var(--font-card-display)] mt-3 text-2xl tracking-tight text-white sm:text-3xl"
        >
          {restaurant.name}
        </h2>
        {restaurant.cuisine ? (
          <p className="font-[family-name:var(--font-card-meta)] mt-2 text-sm text-amber-200/80">
            {restaurant.cuisine}
          </p>
        ) : null}
        {restaurant.address ? (
          <p className="font-[family-name:var(--font-card-meta)] mt-4 text-sm leading-relaxed text-slate-400">
            {restaurant.address}
          </p>
        ) : null}
        <p className="mt-5 text-xs text-slate-500">
          You both said yes — time to eat!
        </p>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 w-full rounded-xl bg-amber-500 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-amber-500/15 transition hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
        >
          Keep swiping
        </button>
      </MotionDiv>
    </div>
  )
}
