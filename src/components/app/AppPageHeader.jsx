import React from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * AppPageHeader - Master canonical page header component matching the Modern Hero Card design on /dashboard.
 *
 * Variants:
 * - 'brand' / 'card' : Modern Vivid Hero Card (rounded-xl, dual ambient glow, vibrant emerald gradient badge)
 * - 'default': Minimal inline header without card wrapper
 */
export default function AppPageHeader({
  variant = 'brand',
  icon: Icon,
  title,
  description,
  actions,
  chips = [],
  className = '',
  eyebrow,
  welcomeName,
}) {
  if (variant === 'default') {
    return (
      <header className={cn('flex flex-col justify-between gap-3 sm:flex-row sm:items-center', className)}>
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
              
            <Icon className="size-6 sm:size-7 text-white" />
            </div>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50 mb-1">
                <Sparkles className="size-3.5 shrink-0 text-white" />
                {eyebrow}
              </span>
            )}
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              {title}
            </h1>
            {description && <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-normal">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
    )
  }

  // Modern Vivid Hero Card (brand / card) - Identik dengan /dashboard
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden transition-all duration-200',
        className
      )}
    >
      <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-start gap-3.5 sm:gap-4 min-w-0">
          {Icon && (
            <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
              
            <Icon className="size-6 sm:size-7 text-white" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                {title}
              </h1>
              {eyebrow && (
                <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
                  
                  <Sparkles className="size-3.5 shrink-0 text-white" />
                  {eyebrow}
                </span>
              )}
            </div>
            {welcomeName && (
              <p className="mt-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">Selamat datang, {welcomeName}</p>
            )}
            {description && (
              <p className="mt-1 w-full text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                {description}
              </p>
            )}
            {chips.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                {chips.map((chip, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-full border-2 border-emerald-300 dark:border-emerald-700 bg-white/70 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/70 dark:text-emerald-200"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 pt-1 lg:pt-0">{actions}</div>}
      </div>
    </div>
  )
}
