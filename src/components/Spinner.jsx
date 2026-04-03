/**
 * Inline loading indicator — matches app accents (Module C: same system as existing UI).
 * @param {{ className?: string, label?: string, size?: 'sm' | 'md' | 'lg', tone?: 'default' | 'on-amber' | 'on-emerald' }} props
 */
export function Spinner({ className = '', label = 'Loading', size = 'sm', tone = 'default' }) {
  const sizeClass =
    size === 'lg' ? 'h-10 w-10 border-[3px]' : size === 'md' ? 'h-5 w-5 border-2' : 'h-4 w-4 border-2'

  const toneClass =
    tone === 'on-amber'
      ? 'border-slate-900/25 border-t-slate-950'
      : tone === 'on-emerald'
        ? 'border-emerald-200/20 border-t-emerald-100'
        : 'border-amber-400/25 border-t-amber-400'

  return (
    <span
      role="status"
      aria-live="polite"
      aria-label={label}
      className={`inline-block shrink-0 animate-spin rounded-full ${toneClass} ${sizeClass} ${className}`}
    />
  )
}

/**
 * Centered block: spinner + caption for section loading states.
 */
export function LoadingBlock({ title = 'Loading…', detail, size = 'md' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <Spinner size={size} label={title} />
      <div>
        <p className="text-sm font-medium text-slate-300">{title}</p>
        {detail ? <p className="mt-1 max-w-xs text-xs text-slate-500">{detail}</p> : null}
      </div>
    </div>
  )
}
