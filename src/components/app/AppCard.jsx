import React from 'react'
import { cn } from '../../lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

/**
 * AppCard - canonical card (surface konten standar).
 * Satu-satunya card wrapper yang dipakai seluruh halaman.
 *
 * variant:
 * - 'default' : kartu putih standar
 * - 'section' : kartu bagian halaman (dengan header + actions)
 * - 'gold'    : kartu standar HeroUI Emerald Gold (rounded-[22px], border-2 emerald-300, flush header strip)
 */
export default function AppCard({
  variant = 'default',
  icon: Icon,
  title,
  description,
  badge,
  actions,
  noPadding = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
  id,
  children,
  ...props
}) {
  if (variant === 'gold') {
    return (
      <div
        id={id}
        className={cn(
          'relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10',
          className
        )}
        {...props}
      >
        {(title || actions || Icon || badge) && (
          <div
            className={cn(
              'flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 bg-emerald-500/10 px-5 py-4 sm:px-6 dark:border-emerald-800/60',
              headerClassName
            )}
          >
            <div className="flex min-w-0 items-center gap-3">
              {Icon && (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <Icon className="h-5 w-5" />
                </div>
              )}
              <div className="min-w-0">
                {title && (
                  <h3 className="text-base font-extrabold tracking-tight text-emerald-900 dark:text-emerald-200">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                    {description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {badge && (
                <span className="inline-flex items-center rounded-full bg-emerald-100/90 px-3 py-1 text-xs font-extrabold text-emerald-800 border border-emerald-300/80 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700/80">
                  {badge}
                </span>
              )}
              {actions}
            </div>
          </div>
        )}
        <div className={cn(!noPadding && 'p-5 sm:p-6', noPadding && 'p-0', contentClassName)}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <Card id={id} className={cn('shadow-xs dark:bg-card-dark', className)} {...props}>
      {(title || actions || Icon) && (
        <CardHeader className="flex flex-row items-center justify-between gap-3 p-4 md:p-5">
          <div className="flex min-w-0 items-center gap-3">
            {Icon && (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#059669]/10 text-[#059669] dark:bg-[#10B981]/20 dark:text-[#10B981]">
                <Icon className="h-5 w-5" />
              </div>
            )}
            <div className="min-w-0">
              {title && (
                <CardTitle className={cn(variant === 'section' ? 'text-base font-semibold' : 'text-lg font-semibold')}>
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {description}
                </CardDescription>
              )}
            </div>
          </div>
          {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className="p-0">
        <div className={cn(!noPadding && 'p-4 md:p-5', noPadding && 'p-0', contentClassName)}>{children}</div>
      </CardContent>
    </Card>
  )
}

/**
 * SectionCard - alias semantic untuk AppCard bagian halaman.
 */
export function SectionCard(props) {
  return <AppCard {...props} variant="section" />
}

/**
 * GoldCard - kontainer kartu standar HeroUI Emerald Gold terpusat.
 */
export function GoldCard(props) {
  return <AppCard {...props} variant="gold" />
}

/**
 * GoldBannerCard - hero header banner standar bernuansa gradasi mint-zamrud terpusat.
 */
export function GoldBannerCard({ className = '', children, ...props }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-br from-[#E6F8F3] via-white to-[#F0FDF9] dark:from-emerald-950/40 dark:via-[#1B2433] dark:to-teal-950/30 p-5 sm:p-6 shadow-md shadow-emerald-500/10',
        className
      )}
      {...props}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/20 dark:bg-emerald-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-teal-400/20 dark:bg-teal-500/15 blur-3xl"
      />
      <div className="relative">{children}</div>
    </div>
  )
}

/**
 * GoldPill - pill badge standar (menggantikan HeroChip v2 yang jatuh ke warna abu-abu).
 */
export function GoldPill({ tone = 'emerald', className = '', children, ...props }) {
  const tones = {
    emerald: 'bg-emerald-100/90 text-emerald-800 border-emerald-300/80 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-700/80',
    solid: 'bg-emerald-600 text-white border-emerald-600 shadow-xs',
    teal: 'bg-teal-100/90 text-teal-800 border-teal-300/80 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-700/80',
    indigo: 'bg-indigo-100/90 text-indigo-800 border-indigo-300/80 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-700/80',
    amber: 'bg-amber-100/90 text-amber-800 border-amber-300/80 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-700/80',
    rose: 'bg-rose-100/90 text-rose-800 border-rose-300/80 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-700/80',
    sky: 'bg-sky-100/90 text-sky-800 border-sky-300/80 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-700/80',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-extrabold',
        tones[tone] || tones.emerald,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
