import { useEffect } from 'react'
import { motion } from 'framer-motion'

const MotionDiv = motion.div

/**
 * @param {{
 *   restaurant: { id: string, name: string, address?: string | null, cuisine?: string | null } | null,
 *   onDismiss: () => void,
 * }} props
 */
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
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm"
        aria-hidden
      />
      <MotionDiv
        initial={{ opacity: 0, scale: 0.94, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 420, damping: 32 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-amber-500/35 bg-gradient-to-b from-slate-900 to-amber-950/50 px-6 py-8 text-center shadow-2xl shadow-amber-900/20"
      >
        <p className="font-[family-name:var(--font-card-meta)] text-xs font-semibold uppercase tracking-[0.35em] text-amber-400/90">
          It’s a match
        </p>
        <h2
          id="match-modal-title"
          className="font-[family-name:var(--font-card-display)] mt-3 text-2xl tracking-tight text-white sm:text-3xl"
        >
          {restaurant.name}
        </h2>
        {restaurant.cuisine ? (
          <p className="font-[family-name:var(--font-card-meta)] mt-2 text-sm text-amber-100/90">
            {restaurant.cuisine}
          </p>
        ) : null}
        {restaurant.address ? (
          <p className="font-[family-name:var(--font-card-meta)] mt-4 text-sm leading-relaxed text-slate-400">
            {restaurant.address}
          </p>
        ) : null}
        <button
          type="button"
          onClick={onDismiss}
          className="mt-8 w-full rounded-xl bg-amber-500 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/80"
        >
          Keep swiping
        </button>
      </MotionDiv>
    </div>
  )
}
