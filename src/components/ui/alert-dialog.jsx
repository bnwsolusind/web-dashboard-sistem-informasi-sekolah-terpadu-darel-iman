import * as React from 'react'
import PropTypes from 'prop-types'
import { Modal as HeroModal } from '@heroui/react'
import { cn } from '../../lib/utils'

export function AlertDialog({
  children,
  isOpen,
  defaultOpen,
  onOpenChange,
  className,
  isDismissable = true,
  ...props
}) {
  return (
    <HeroModal
      isOpen={isOpen !== undefined ? Boolean(isOpen) : defaultOpen}
      onOpenChange={(open) => {
        if (onOpenChange) onOpenChange(open)
      }}
      {...props}
    >
      <HeroModal.Backdrop className="bg-slate-950/70 backdrop-blur-md fixed inset-0 z-[80] flex items-center justify-center p-4">
        <HeroModal.Container className="w-full flex items-center justify-center min-h-full">
          <HeroModal.Dialog
            className={cn(
              'relative w-full max-w-xl overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-6 sm:p-7 shadow-2xl shadow-emerald-950/20 text-slate-800 dark:bg-[#182232] dark:text-slate-100 dark:shadow-black/60',
              className
            )}
          >
            {/* Top Accent Gradient Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0 absolute top-0 left-0 right-0" />
            <div className="pt-2">
              {children}
            </div>
          </HeroModal.Dialog>
        </HeroModal.Container>
      </HeroModal.Backdrop>
    </HeroModal>
  )
}

AlertDialog.propTypes = {
  children: PropTypes.node,
  isOpen: PropTypes.bool,
  defaultOpen: PropTypes.bool,
  onOpenChange: PropTypes.func,
  className: PropTypes.string,
  isDismissable: PropTypes.bool,
}

export default AlertDialog
