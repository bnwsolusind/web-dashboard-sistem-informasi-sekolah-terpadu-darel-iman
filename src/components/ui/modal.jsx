import React from 'react'
import PropTypes from 'prop-types'
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

export function Modal({ isOpen, onClose, title, description, children, maxWidth = 'max-w-xl', footer, className = '' }) {
  if (!isOpen) return null

  const resolvedMaxWidth = normalizeMaxWidth(maxWidth)

  return (
    <HeroModal
      isOpen={Boolean(isOpen)}
      onOpenChange={(open) => {
        if (!open && onClose) onClose()
      }}
    >
      <HeroModal.Backdrop className="bg-slate-950/70 backdrop-blur-md fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5">
        <HeroModal.Container className="w-full flex items-center justify-center min-h-full">
          <HeroModal.Dialog className={cn('relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#1B2433] max-h-[90vh] flex flex-col', resolvedMaxWidth, className)}>
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
            
            {title && (
              <HeroModal.Header className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0 dark:border-slate-800">
                <div className="min-w-0 pr-2">
                  <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-white">
                    {title}
                  </h3>
                  {description && (
                    <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                      {description}
                    </p>
                  )}
                </div>
                <HeroButton
                  isIconOnly
                  size="sm"
                  onPress={onClose}
                  aria-label="Tutup modal"
                  className="size-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 cursor-pointer transition-all active:scale-95 shrink-0"
                >
                  <X className="size-4" strokeWidth={2.2} />
                </HeroButton>
              </HeroModal.Header>
            )}

            <HeroModal.Body className="overflow-y-auto p-6 space-y-4 text-sm text-slate-700 dark:text-slate-200 flex-1">
              {children}
            </HeroModal.Body>

            {footer && (
              <HeroModal.Footer className="border-t border-slate-100 px-6 py-4 bg-slate-50/50 flex items-center justify-end gap-2 dark:border-slate-800 dark:bg-slate-900/50 shrink-0">
                {footer}
              </HeroModal.Footer>
            )}
          </HeroModal.Dialog>
        </HeroModal.Container>
      </HeroModal.Backdrop>
    </HeroModal>
  )
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  description: PropTypes.node,
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.string,
  footer: PropTypes.node,
  className: PropTypes.string,
}

export default Modal
