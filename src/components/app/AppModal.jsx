import React from 'react'
import {
  Modal as HeroModal,
  Button as HeroButton,
} from '@heroui/react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

const normalizeMaxWidth = (w) => {
  if (!w) return 'max-w-xl'
  if (w.includes('sm') || w.includes('md')) return 'max-w-md'
  if (w.includes('lg') || w.includes('xl') || w.includes('2xl')) return 'max-w-xl'
  return 'max-w-4xl'
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
  maxWidth = 'max-w-xl',
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
          <HeroModal.Dialog className={cn('relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#1B2433] max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex flex-col', resolvedMaxWidth, className)}>
            {/* Top accent gradient line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

            {/* Close Button X (Pojok Kanan Atas) */}
            {!hideCloseButton && onClose && (
              <HeroButton
                isIconOnly
                size="sm"
                onPress={onClose}
                aria-label="Tutup modal"
                className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 size-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 cursor-pointer transition-all active:scale-95 z-20 shadow-xs"
              >
                <X className="size-4" strokeWidth={2.2} />
              </HeroButton>
            )}

            {title && (
              <HeroModal.Header className="flex items-center justify-between border-b border-slate-100 px-6 py-4 pr-14 shrink-0 dark:border-slate-800">
                <div className="flex items-center gap-2.5 min-w-0">
                  {Icon && (
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                      {React.isValidElement(Icon) ? Icon : <Icon className="h-4 w-4" />}
                    </span>
                  )}
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-white">
                      {title}
                    </h3>
                    {modalDescription && (
                      <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                        {modalDescription}
                      </p>
                    )}
                  </div>
                </div>
              </HeroModal.Header>
            )}

            <HeroModal.Body className="overflow-y-auto min-h-0 flex-1 max-h-[65vh] p-6 space-y-4 text-sm text-slate-700 dark:text-slate-200">
              {children}
            </HeroModal.Body>

            {footer && (
              <HeroModal.Footer className="border-t border-slate-100 px-6 py-4 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-end gap-2">
                {footer}
              </HeroModal.Footer>
            )}
          </HeroModal.Dialog>
        </HeroModal.Container>
      </HeroModal.Backdrop>
    </HeroModal>
  )
}

