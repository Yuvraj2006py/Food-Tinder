import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SwipeCard } from './SwipeCard.jsx'

const MotionDiv = motion.div

/**
 * @param {{
 *   items: Array<{ id?: string, name: string, cuisine?: string | null, address?: string | null }>,
 *   onSwipe?: (vote: 'yes' | 'no', item: object, index: number) => void | Promise<void>,
 * }} props
 */
export function CardStack({ items, onSwipe }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  if (!items.length) {
    return (
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/40 px-4 py-10 text-center">
        <p className="text-sm text-slate-300">Nothing left to swipe here.</p>
        <p className="mt-2 text-xs text-slate-500">Try a larger city or different cuisine when you start your next room.</p>
      </div>
    )
  }

  async function handleCommit(vote) {
    const item = items[currentIndex]
    if (!item) return
    await onSwipe?.(vote, item, currentIndex)
    setCurrentIndex((i) => i + 1)
  }

  const current = items[currentIndex]
  const next = items[currentIndex + 1]
  const finished = currentIndex >= items.length

  return (
    <div className="w-full">
      <div className="relative mx-auto h-[min(420px,72dvh)] w-full max-w-md">
        {!finished ? (
          <>
            <div className="absolute inset-0 flex items-stretch justify-center">
              {next ? (
                <div className="absolute inset-x-0 top-2 z-0 h-full w-[94%] max-w-md self-start justify-self-center opacity-90">
                  <SwipeCard item={next} onCommit={() => {}} stackPosition="peek" />
                </div>
              ) : null}

              <div className="relative z-10 h-full w-full max-w-md">
                <AnimatePresence mode="wait">
                  {current ? (
                    <MotionDiv
                      key={current.id ?? currentIndex}
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="h-full"
                    >
                      <SwipeCard item={current} onCommit={handleCommit} stackPosition="top" />
                    </MotionDiv>
                  ) : null}
                </AnimatePresence>
              </div>
            </div>
          </>
        ) : (
          <MotionDiv
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-900/50 px-6 text-center"
          >
            <p className="font-[family-name:var(--font-card-display)] text-xl text-white">
              You’re through the stack
            </p>
            <p className="mt-2 max-w-xs text-sm text-slate-400">
              All caught up — open a new room for more places.
            </p>
          </MotionDiv>
        )}
      </div>

      {!finished && (
        <p className="mt-4 text-center text-xs text-slate-500">
          {items.length - currentIndex} left · drag or use buttons
        </p>
      )}
    </div>
  )
}
