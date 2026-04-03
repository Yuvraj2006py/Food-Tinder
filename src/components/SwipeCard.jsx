import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

const MotionArticle = motion.article
const MotionDiv = motion.div

const SWIPE_THRESHOLD_PX = 100
const EXIT_DISTANCE = 420

/**
 * @param {{
 *   item: { name: string, cuisine?: string | null, address?: string | null },
 *   onCommit: (vote: 'yes' | 'no') => void | Promise<void>,
 *   stackPosition: 'top' | 'peek',
 * }} props
 */
export function SwipeCard({ item, onCommit, stackPosition }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-14, 14])
  const passOpacity = useTransform(x, [-140, -40, 0], [1, 0.35, 0])
  const likeOpacity = useTransform(x, [0, 40, 140], [0, 0.35, 1])

  const isTop = stackPosition === 'top'

  const springBack = { type: 'spring', stiffness: 420, damping: 32, mass: 0.85 }

  async function handleDragEnd(_, info) {
    if (!isTop) return
    const ox = info.offset.x
    if (ox > SWIPE_THRESHOLD_PX) {
      await animate(x, EXIT_DISTANCE, { type: 'tween', duration: 0.28, ease: [0.22, 1, 0.36, 1] })
      try {
        await Promise.resolve(onCommit('yes'))
      } catch {
        await animate(x, 0, springBack)
      }
      return
    }
    if (ox < -SWIPE_THRESHOLD_PX) {
      await animate(x, -EXIT_DISTANCE, { type: 'tween', duration: 0.28, ease: [0.22, 1, 0.36, 1] })
      try {
        await Promise.resolve(onCommit('no'))
      } catch {
        await animate(x, 0, springBack)
      }
      return
    }
    animate(x, 0, springBack)
  }

  async function nudge(dir) {
    if (!isTop) return
    const target = dir === 'yes' ? EXIT_DISTANCE : -EXIT_DISTANCE
    await animate(x, target, { type: 'tween', duration: 0.28, ease: [0.22, 1, 0.36, 1] })
    try {
      await Promise.resolve(onCommit(dir === 'yes' ? 'yes' : 'no'))
    } catch {
      await animate(x, 0, springBack)
    }
  }

  const base =
    'relative overflow-hidden rounded-2xl border shadow-2xl backdrop-blur-sm select-none touch-pan-y'

  const topStyles =
    'border-amber-500/25 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 cursor-grab active:cursor-grabbing'

  const peekStyles = 'border-slate-700/50 bg-slate-900/90 pointer-events-none scale-[0.94] translate-y-3'

  return (
    <div className="relative h-full w-full">
      <MotionArticle
        style={{ x: isTop ? x : 0, rotate: isTop ? rotate : 0 }}
        drag={isTop ? 'x' : false}
        dragConstraints={{ left: -280, right: 280 }}
        dragElastic={0.72}
        dragMomentum={false}
        onDragEnd={handleDragEnd}
        className={`${base} ${isTop ? topStyles : peekStyles} h-full min-h-[360px] w-full px-6 pb-6 pt-7`}
        aria-label={`${item.name}, ${item.cuisine ?? 'Restaurant'}. Swipe right to save, left to pass.`}
      >
        {isTop && (
          <>
            <MotionDiv
              className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 rounded-md border-2 border-rose-400/90 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-rose-100 shadow-lg shadow-rose-900/30"
              style={{ opacity: passOpacity }}
            >
              Pass
            </MotionDiv>
            <MotionDiv
              className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 rounded-md border-2 border-emerald-400/90 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-50 shadow-lg shadow-emerald-900/30"
              style={{ opacity: likeOpacity }}
            >
              Save
            </MotionDiv>
          </>
        )}

        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(251,191,36,0.12),transparent_55%)]" />

        <div className="relative flex h-full flex-col">
          <p className="font-[family-name:var(--font-card-meta)] text-[11px] font-medium uppercase tracking-[0.28em] text-amber-200/75">
            How about
          </p>
          <h2 className="font-[family-name:var(--font-card-display)] mt-3 text-[1.65rem] leading-tight tracking-tight text-white sm:text-[1.85rem]">
            {item.name}
          </h2>
          {item.cuisine ? (
            <p className="font-[family-name:var(--font-card-meta)] mt-2 text-sm font-medium text-amber-100/85">
              {item.cuisine}
            </p>
          ) : null}
          {item.address ? (
            <p className="font-[family-name:var(--font-card-meta)] mt-auto pt-8 text-sm leading-relaxed text-slate-400">
              {item.address}
            </p>
          ) : (
            <div className="mt-auto pt-8" />
          )}
        </div>

        {isTop && (
          <div className="relative mt-6 flex gap-3 border-t border-white/5 pt-5">
            <button
              type="button"
              onClick={() => nudge('no')}
              className="flex-1 rounded-xl border border-rose-500/35 bg-rose-950/35 py-3 text-sm font-semibold text-rose-100/95 transition hover:bg-rose-950/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60"
            >
              Pass
            </button>
            <button
              type="button"
              onClick={() => nudge('yes')}
              className="flex-1 rounded-xl border border-emerald-500/40 bg-emerald-950/40 py-3 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-950/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
            >
              Save
            </button>
          </div>
        )}
      </MotionArticle>
    </div>
  )
}
