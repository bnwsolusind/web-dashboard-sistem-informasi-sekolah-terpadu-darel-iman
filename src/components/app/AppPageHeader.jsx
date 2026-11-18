import React from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * AppPageHeader - Master canonical page header component.
 *
 * Variants:
 *  - 'brand'  : Gradient hijau Islami modern (#083A2A -> #0E5C44 -> #1E8E5A)
 *  - 'card'   : Modern white/dark card with radius 18px & soft shadow
 *  - 'default': Light header inline without background card
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
  if (variant === 'card') {
    return (
      <header
        className={cn(
          'relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-white p-4 sm:p-5 md:p-6 shadow-md shadow-emerald-500/10 transition-all duration-200 dark:border-emerald-700/40 dark:bg-gradient-to-r dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
          className
        )}
      >
        {/* Subtle Ambient Glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-emerald-400/15 blur-2xl dark:bg-emerald-500/10" />

        <div className="relative z-10 flex flex-col justify-between gap-3.5 md:flex-row md:items-center">
          <div className="flex min-w-0 items-start gap-3.5 sm:gap-4">
            {Icon && (
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/30 border border-emerald-300/40">
                <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              {eyebrow && (
                <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300 mb-0.5">
                  {eyebrow}
                </p>
              )}
              <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
                {title}
              </h1>
              {description && (
                <p className="mt-1 w-full text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  {description}
                </p>
              )}
              {chips.length > 0 && (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5 sm:gap-2">
                  {chips.map((chip, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-full border border-emerald-300/60 bg-emerald-50/80 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:border-emerald-700/60 dark:bg-emerald-950/60 dark:text-emerald-200"
                    >
                      {chip}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2 pt-1 md:pt-0">{actions}</div>}
        </div>
      </header>
    )
  }

  if (variant === 'default') {
    return (
      <header className={cn('flex flex-col justify-between gap-3 sm:flex-row sm:items-center', className)}>
        <div className="flex min-w-0 items-center gap-3">
          {Icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-[#0E5C44]/10 text-[#0E5C44] dark:bg-[#3FBF75]/20 dark:text-[#3FBF75]">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#0E5C44] dark:text-[#3FBF75]">
                {eyebrow}
              </p>
            )}
            <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900 dark:text-white leading-tight">
              {title}
            </h1>
            {description && <p className="mt-0.5 truncate text-sm text-slate-500 dark:text-slate-400">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
      </header>
    )
  }

  // brand variant (default)
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[22px] bg-gradient-to-r from-[#083A2A] via-[#0E5C44] to-[#1E8E5A] p-4 sm:p-5 md:p-6 text-white shadow-md shadow-[#0E5C44]/15 dark:shadow-none border border-emerald-400/30',
        className
      )}
    >
      {/* Pattern Overlay Islami Modern */}
      <div className="pointer-events-none absolute inset-0 opacity-15">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="appPageHeaderPattern" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 30,0 L 60,30 L 30,60 L 0,30 Z" fill="none" stroke="#FFFFFF" strokeWidth="1" />
              <circle cx="30" cy="30" r="12" fill="none" stroke="#FFFFFF" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#appPageHeaderPattern)" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 space-y-1">
          {eyebrow && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-100 backdrop-blur-xs">
              <Sparkles className="h-3 w-3 text-emerald-300" />
              {eyebrow}
            </span>
          )}
          {welcomeName && (
            <p className="text-[10px] sm:text-[11px] font-semibold text-emerald-100/90">Selamat datang, {welcomeName}</p>
          )}
          <h1 className="text-xl font-semibold tracking-tight text-white leading-tight">{title}</h1>
          {description && (
            <p className="w-full text-sm leading-relaxed text-emerald-100/95">{description}</p>
          )}
          {chips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {chips.map((chip, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs"
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>
        {actions && <div className="shrink-0 pt-1 md:pt-0">{actions}</div>}
      </div>
    </div>
  )
}
