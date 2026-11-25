import React, { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

const normalizeMaxWidth = (w) => {
  if (!w) return 'max-w-5xl'
  if (w.includes('max-w-sm')) return 'max-w-md'
  if (w.includes('max-w-md')) return 'max-w-2xl'
  if (w.includes('max-w-lg') || w.includes('max-w-xl')) return 'max-w-4xl'
  if (w.includes('max-w-2xl') || w.includes('max-w-3xl') || w.includes('max-w-4xl')) return 'max-w-5xl'
  if (w.includes('max-w-5xl') || w.includes('max-w-6xl')) return 'max-w-6xl'
  if (w.includes('max-w-7xl')) return 'max-w-7xl'
  if (w.includes('max-w-full')) return 'max-w-full'
  return w
}

const VARIANT_THEMES = {
  emerald: {
    border: 'border-[#b6f6d9] dark:border-emerald-700/80',
    shadow: 'shadow-emerald-950/20',
    topBar: 'from-emerald-500 via-teal-400 to-emerald-600',
    headerBg: 'from-emerald-600 via-teal-600 to-emerald-700',
    glowOrb: 'bg-teal-400/20',
    subtitleText: 'text-emerald-100 dark:text-emerald-200',
    closeHover: 'hover:bg-rose-500 hover:text-white',
    footerBorder: 'border-emerald-200/80 dark:border-emerald-800/60',
  },
  danger: {
    border: 'border-rose-300 dark:border-rose-800/80',
    shadow: 'shadow-rose-950/20',
    topBar: 'from-rose-500 via-rose-600 to-red-700',
    headerBg: 'from-rose-600 via-rose-700 to-red-700',
    glowOrb: 'bg-rose-400/20',
    subtitleText: 'text-rose-100 dark:text-rose-200',
    closeHover: 'hover:bg-rose-800 hover:text-white',
    footerBorder: 'border-rose-200/80 dark:border-rose-900/60',
  },
  warning: {
    border: 'border-amber-300 dark:border-amber-700/80',
    shadow: 'shadow-amber-950/20',
    topBar: 'from-amber-400 via-orange-400 to-amber-600',
    headerBg: 'from-emerald-600 via-teal-600 to-emerald-700',
    glowOrb: 'bg-amber-400/20',
    subtitleText: 'text-emerald-100 dark:text-emerald-200',
    closeHover: 'hover:bg-rose-500 hover:text-white',
    footerBorder: 'border-emerald-200/80 dark:border-emerald-800/60',
  },
}

const Z_INDEX_MAP = {
  50: 'z-50',
  60: 'z-[60]',
  70: 'z-[70]',
  80: 'z-[80]',
  90: 'z-[90]',
  100: 'z-[100]',
}

/**
 * AppModal - canonical modal dialog based on HeroUI standards.
 * Standardized across all modules with emerald/danger/warning styling and accessibility.
 */
export default function AppModal({
  isOpen,
  onClose,
  title,
  badge,
  description,
  subtitle,
  icon: Icon,
  headerActions,
  subHeader,
  children,
  footer,
  maxWidth = 'max-w-5xl',
  variant = 'emerald',
  zIndex = 60,
  className = '',
  bodyClassName = '',
  hideCloseButton = false,
  disableBackdropClose = false,
}) {
  useEffect(() => {
    if (!isOpen || !onClose || disableBackdropClose) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, disableBackdropClose])

  if (!isOpen) return null
  const modalDescription = description || subtitle
  const resolvedMaxWidth = normalizeMaxWidth(maxWidth)
  const theme = VARIANT_THEMES[variant] || VARIANT_THEMES.emerald
  const zClass = Z_INDEX_MAP[zIndex] || 'z-[60]'

  return (
    <AnimatePresence>
      <div
        role="dialog"
        aria-modal="true"
        className={cn('fixed inset-0 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto', zClass)}
        onMouseDown={(e) => {
          if (!disableBackdropClose && e.target === e.currentTarget && onClose) onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={cn('w-full font-sans my-auto', resolvedMaxWidth)}
        >
          <div className={cn('relative w-full overflow-hidden rounded-3xl border-2 bg-white shadow-2xl dark:bg-[#1B2433] max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col', theme.border, theme.shadow, className)}>
            {/* Top accent gradient line */}
            <div className={cn('h-1.5 w-full bg-gradient-to-r shrink-0', theme.topBar)} />

            {title && (
              <div className={cn('relative overflow-hidden sticky top-0 z-10 bg-gradient-to-r text-white px-6 py-4.5 shrink-0', theme.headerBg)}>
                <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <div className={cn('pointer-events-none absolute right-24 -bottom-6 h-20 w-20 rounded-full blur-xl', theme.glowOrb)} />
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0 pr-2">
                    {Icon && (
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-sm">
                        {React.isValidElement(Icon) ? Icon : <Icon className="size-5.5 text-white" strokeWidth={2.2} />}
                      </span>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2 truncate">
                        <span className="truncate">{title}</span>
                        {badge && (
                          <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black bg-white/20 text-white border border-white/30 backdrop-blur-xs shrink-0">
                            <Sparkles className="size-3 text-amber-300" />
                            {badge}
                          </span>
                        )}
                      </h3>
                      {modalDescription && (
                        <p className={cn('mt-0.5 truncate text-xs sm:text-sm font-medium', theme.subtitleText)}>
                          {modalDescription}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {headerActions}
                    {!hideCloseButton && onClose && (
                      <button
                        type="button"
                        disabled={disableBackdropClose}
                        onClick={onClose}
                        aria-label="Tutup modal"
                        className={cn('size-9 flex items-center justify-center rounded-xl bg-white/20 text-white border border-white/25 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0 disabled:opacity-50', theme.closeHover)}
                      >
                        <X className="size-4.5" strokeWidth={2.2} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {subHeader}

            <div className={cn('overflow-y-auto min-h-0 flex-1 max-h-[calc(85vh-8rem)] scrollbar-thin p-6 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200', bodyClassName)}>
              {children}
            </div>

            {footer && (
              <div className={cn('sticky bottom-0 z-10 border-t px-6 py-4 shrink-0 bg-slate-100/90 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-end gap-2.5 rounded-b-3xl', theme.footerBorder)}>
                {footer}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
