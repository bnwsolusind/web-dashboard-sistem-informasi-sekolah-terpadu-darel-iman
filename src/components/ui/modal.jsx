import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

const normalizeMaxWidth = (w) => {
  if (!w) return 'max-w-5xl'
  if (w.includes('xs') || w.includes('sm')) return 'max-w-2xl'
  if (w.includes('md') || w.includes('lg')) return 'max-w-4xl'
  if (w.includes('2xl') || w.includes('3xl') || w.includes('4xl')) return 'max-w-5xl'
  if (w.includes('5xl') || w.includes('6xl') || w.includes('7xl')) return 'max-w-6xl'
  return 'max-w-5xl'
}

export function Modal({ isOpen, onClose, title, description, children, maxWidth = 'max-w-5xl', footer, className = '', zIndex = 80 }) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onClose) {
        onClose()
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const resolvedMaxWidth = normalizeMaxWidth(maxWidth)

  return (
    <AnimatePresence>
      <div
        className={cn(
          'fixed inset-0 flex items-center justify-center p-3 sm:p-5 overflow-y-auto',
          zIndex === 90 ? 'z-[90]' : zIndex === 100 ? 'z-[100]' : 'z-[80]'
        )}
      >
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md cursor-pointer"
        />

        {/* Dialog Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 35 }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          onClick={(e) => e.stopPropagation()}
          className={cn(
            'relative z-10 w-full overflow-hidden rounded-modal border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-surface-dark-inner dark:shadow-black/60 max-h-[90vh] flex flex-col font-sans my-auto',
            resolvedMaxWidth,
            className
          )}
        >
          {/* Top Accent Gradient Bar - Standar Modal Tambah Siswa */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

          {/* Modal Header */}
          {title && (
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-emerald-200/80 bg-white/95 backdrop-blur-md px-5 py-4 sm:px-6 sm:py-5 shrink-0 dark:border-emerald-800/60 dark:bg-surface-dark-inner/95">
              <div className="min-w-0 pr-3 flex-1">
                {typeof title === 'string' ? (
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/25 shrink-0">
                      <Sparkles className="size-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                          {title}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-2xs shrink-0">
                          <Sparkles className="size-3" /> Terpadu
                        </span>
                      </div>
                      {description && (
                        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    {title}
                    {description && (
                      <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {description}
                      </p>
                    )}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup modal"
                className="size-9 flex items-center justify-center rounded-xl bg-emerald-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 hover:border-rose-200 dark:bg-emerald-950/40 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 cursor-pointer transition-all active:scale-95 shrink-0 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs"
              >
                <X className="size-4" strokeWidth={2.2} />
              </button>
            </div>
          )}

          {/* Modal Body */}
          <div className="overflow-y-auto p-5 sm:p-6 space-y-4 text-sm text-slate-700 dark:text-slate-200 flex-1 max-h-[calc(85vh-8rem)] scrollbar-thin bg-white dark:bg-surface-dark-inner">
            {children}
          </div>

          {/* Modal Footer */}
          {footer && (
            <div className="sticky bottom-0 z-20 border-t border-emerald-200/80 dark:border-emerald-800/60 px-6 py-4 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 dark:from-emerald-950/90 dark:via-slate-900/95 dark:to-slate-900/95 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 rounded-b-3xl">
              {footer}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  description: PropTypes.node,
  children: PropTypes.node,
  maxWidth: PropTypes.string,
  footer: PropTypes.node,
  className: PropTypes.string,
}

export default Modal
