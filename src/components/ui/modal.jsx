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
            'relative z-10 w-full overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#1B2433] dark:shadow-black/60 max-h-[90vh] flex flex-col font-sans my-auto',
            resolvedMaxWidth,
            className
          )}
        >
          {/* Top Accent Gradient Bar - Standar Modal Tambah */}
          <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

          {/* Modal Header */}
          {title && (
            <div className="sticky top-0 z-20 flex items-center justify-between bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-5 py-4 sm:px-6 sm:py-4.5 shrink-0">
              <div className="min-w-0 pr-3 flex-1">
                {typeof title === 'string' ? (
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-sm shrink-0">
                      <Sparkles className="size-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                          {title}
                        </h3>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/20 text-white border border-white/30 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0">
                          <Sparkles className="size-3" /> Terpadu
                        </span>
                      </div>
                      {description && (
                        <p className="mt-0.5 truncate text-xs sm:text-sm text-emerald-100 font-medium">
                          {description}
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    {title}
                    {description && (
                      <p className="mt-1 truncate text-xs sm:text-sm text-emerald-100 font-medium">
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
                className="size-9 flex items-center justify-center rounded-xl bg-white/20 hover:bg-rose-500 hover:text-white text-white border border-white/25 shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
              >
                <X className="size-4.5" strokeWidth={2.2} />
              </button>
            </div>
          )}

          {/* Modal Body */}
          <div className="overflow-y-auto p-5 sm:p-6 space-y-4 text-sm text-slate-700 dark:text-slate-200 flex-1 max-h-[calc(85vh-8rem)] scrollbar-thin bg-white dark:bg-[#1B2433]">
            {children}
          </div>

          {/* Modal Footer */}
          {footer && (
            <div className="sticky bottom-0 z-20 border-t border-emerald-200/80 dark:border-emerald-800/60 px-5 sm:px-6 py-4 bg-slate-100/90 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between gap-3 shrink-0 rounded-b-3xl">
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
