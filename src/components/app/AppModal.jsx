import React from 'react'
import {
  Modal as HeroModal,
  Button as HeroButton,
} from '@heroui/react'
import { X } from 'lucide-react'
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

/**
 * AppModal - canonical modal dialog based on HeroUI Modal.
 * Standardized across all modules with emerald styling and accessibility.
 */
export default function AppModal({
  isOpen,
  onClose,
  title,
  description,
  subtitle,
  icon: Icon,
  children,
  footer,
  maxWidth = 'max-w-5xl',
  className = '',
  hideCloseButton = false,
}) {
  if (!isOpen) return null
  const modalDescription = description || subtitle
  const resolvedMaxWidth = normalizeMaxWidth(maxWidth)

  return (
    <HeroModal
      isOpen={Boolean(isOpen)}
      onOpenChange={(open) => {
        if (!open && onClose) onClose()
      }}
    >
      <HeroModal.Backdrop className="bg-slate-950/70 backdrop-blur-md fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <HeroModal.Container className="w-full flex items-center justify-center min-h-full my-auto">
          <HeroModal.Dialog className={cn('relative w-full overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-card-dark max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col', resolvedMaxWidth, className)}>
            {/* Top accent gradient line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

            {/* Close Button X (Pojok Kanan Atas) */}
            {!hideCloseButton && onClose && (
              <HeroButton
                isIconOnly
                size="sm"
                onPress={onClose}
                aria-label="Tutup modal"
                className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 size-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 cursor-pointer transition-all active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 z-20 shadow-xs"
              >
                <X className="size-4" strokeWidth={2.2} />
              </HeroButton>
            )}

            {title && (
              <HeroModal.Header className="sticky top-0 z-10 flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 bg-white/95 backdrop-blur-md px-6 py-4.5 pr-14 shrink-0 dark:bg-surface-dark-inner/95">
                <div className="flex items-center gap-3 min-w-0">
                  {Icon && (
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20">
                      {React.isValidElement(Icon) ? Icon : <Icon className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />}
                    </span>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                      {title}
                    </h3>
                    {modalDescription && (
                      <p className="mt-0.5 truncate text-xs font-normal text-slate-500 dark:text-slate-400">
                        {modalDescription}
                      </p>
                    )}
                  </div>
                </div>
              </HeroModal.Header>
            )}

            <HeroModal.Body className="overflow-y-auto min-h-0 flex-1 max-h-[calc(85vh-8rem)] scrollbar-thin p-6 space-y-4 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
              {children}
            </HeroModal.Body>

            {footer && (
              <HeroModal.Footer className="sticky bottom-0 z-10 border-t border-emerald-200/80 px-6 py-4 dark:border-emerald-800/60 shrink-0 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 dark:from-emerald-950/90 dark:via-slate-900/95 dark:to-slate-900/95 backdrop-blur-md flex items-center justify-end gap-2 rounded-b-3xl">
                {footer}
              </HeroModal.Footer>
            )}
          </HeroModal.Dialog>
        </HeroModal.Container>
      </HeroModal.Backdrop>
    </HeroModal>
  )
}
