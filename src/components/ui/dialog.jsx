import * as React from 'react'
import PropTypes from 'prop-types'
import {
  Modal as HeroModal,
  Button as HeroButton,
} from '@heroui/react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

import { OverlayContext } from './overlay'

function normalizeDialogWidth(className) {
  if (!className) return 'max-w-5xl'
  let resolved = className
  if (resolved.includes('max-w-sm') || resolved.includes('max-w-md')) {
    resolved = resolved.replace(/max-w-(sm|md)\b/g, 'max-w-xl')
  } else if (resolved.includes('max-w-lg') || resolved.includes('max-w-xl')) {
    resolved = resolved.replace(/max-w-(lg|xl)\b/g, 'max-w-4xl')
  } else if (resolved.includes('max-w-2xl') || resolved.includes('max-w-3xl')) {
    resolved = resolved.replace(/max-w-(2xl|3xl)\b/g, 'max-w-5xl')
  } else if (resolved.includes('max-w-4xl')) {
    resolved = resolved.replace(/max-w-4xl\b/g, 'max-w-5xl')
  } else if (!resolved.includes('max-w-')) {
    resolved = `max-w-5xl ${resolved}`
  }
  return resolved
}

export function Dialog({
  isOpen: directIsOpen,
  onClose: directOnClose,
  onOpenChange,
  showCloseButton = true,
  children,
  className,
}) {
  const overlayCtx = React.useContext(OverlayContext)

  const resolvedIsOpen = directIsOpen !== undefined
    ? Boolean(directIsOpen)
    : (overlayCtx?.isOpen !== undefined ? Boolean(overlayCtx.isOpen) : false)

  const resolvedOnClose = directOnClose
    || (onOpenChange ? (open) => !open && onOpenChange(false) : null)
    || overlayCtx?.onClose
    || null

  if (!resolvedIsOpen) return null

  const resolvedWidthClass = normalizeDialogWidth(className)

  return (
    <OverlayContext.Provider value={{ isOpen: resolvedIsOpen, onClose: resolvedOnClose }}>
      <HeroModal
        isOpen={Boolean(resolvedIsOpen)}
        onOpenChange={(open) => {
          if (!open && resolvedOnClose) resolvedOnClose()
        }}
      >
        <HeroModal.Backdrop className="bg-slate-950/70 backdrop-blur-md fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <HeroModal.Container className="w-full flex items-center justify-center min-h-full my-auto">
            <HeroModal.Dialog
              className={cn(
                'relative w-full overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 text-slate-800 dark:bg-surface-dark-inner dark:text-slate-100 dark:shadow-black/60 max-h-[calc(100dvh-2.5rem)] flex flex-col',
                resolvedWidthClass
              )}
            >
              {/* Top Accent Gradient Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
              <div className={cn('relative flex flex-col flex-1 min-h-0 overflow-hidden', className?.includes('p-0') ? 'p-0' : '')}>
                {resolvedOnClose && showCloseButton && (
                  <HeroButton
                    isIconOnly
                    size="sm"
                    onPress={resolvedOnClose}
                    aria-label="Tutup dialog"
                    className="absolute right-4 top-4 rounded-xl size-9 flex items-center justify-center bg-emerald-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 hover:border-rose-200 dark:bg-emerald-950/40 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-all cursor-pointer active:scale-95 z-20 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs"
                  >
                    <X className="size-4" strokeWidth={2.2} />
                  </HeroButton>
                )}
                {children}
              </div>
            </HeroModal.Dialog>
          </HeroModal.Container>
        </HeroModal.Backdrop>
      </HeroModal>
    </OverlayContext.Provider>
  )
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn('sticky top-0 z-10 px-6 py-4.5 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-white/95 dark:bg-surface-dark-inner/95 backdrop-blur-sm flex flex-col space-y-1.5 text-center sm:text-left shrink-0', className)} {...props} />
}

export function DialogTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-bold text-slate-900 dark:text-white tracking-tight', className)} {...props} />
}

export function DialogDescription({ className, ...props }) {
  return <p className={cn('text-sm font-normal text-slate-500 dark:text-slate-400 mt-0.5', className)} {...props} />
}

export function DialogBody({ className, ...props }) {
  return <div className={cn('p-6 space-y-4 text-sm text-slate-700 dark:text-slate-200 flex-1 min-h-0 overflow-y-auto max-h-[calc(85vh-8rem)] scrollbar-thin', className)} {...props} />
}

export function DialogFooter({ className, ...props }) {
  return <div className={cn('sticky bottom-0 z-10 px-6 py-4 border-t border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-50/90 via-teal-50/70 to-emerald-50/90 dark:from-emerald-950/90 dark:via-slate-900/95 dark:to-slate-900/95 backdrop-blur-sm flex items-center justify-end gap-2.5 shrink-0 rounded-b-3xl', className)} {...props} />
}

export function DialogClose({
  children,
  onClick,
  onPress,
  asChild = false,
  variant = 'outline',
  appearance,
  size = 'sm',
  disabled = false,
  type = 'button',
  className,
  ...props
}) {
  const overlayCtx = React.useContext(OverlayContext)

  const handleClose = (e) => {
    if (onClick) onClick(e)
    if (onPress) onPress(e)
    if (overlayCtx?.onClose) overlayCtx.onClose()
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: (e) => {
        if (children.props?.onClick) children.props.onClick(e)
        handleClose(e)
      },
      onPress: (e) => {
        if (children.props?.onPress) children.props.onPress(e)
        handleClose(e)
      },
    })
  }

  if (!children) {
    return (
      <HeroButton
        type={type}
        isIconOnly
        size="sm"
        isDisabled={Boolean(disabled)}
        onPress={handleClose}
        aria-label="Tutup dialog"
        className={cn(
          'rounded-xl size-9 flex items-center justify-center bg-emerald-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 hover:border-rose-200 dark:bg-emerald-950/40 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-all cursor-pointer active:scale-95 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs',
          className
        )}
        {...props}
      >
        <X className="size-4" strokeWidth={2.2} />
      </HeroButton>
    )
  }

  const resolvedVariant =
    appearance === 'outline' || variant === 'outline'
      ? 'outline'
      : variant === 'ghost'
        ? 'ghost'
        : 'outline'

  return (
    <HeroButton
      type={type}
      variant={resolvedVariant}
      size={size === 'lg' ? 'lg' : size === 'md' ? 'md' : 'sm'}
      isDisabled={Boolean(disabled)}
      onPress={handleClose}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300/80 dark:border-slate-700 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all cursor-pointer active:scale-95 disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </HeroButton>
  )
}

export function OverlayWrapper({ isOpen, onOpenChange, children }) {
  const handleClose = () => {
    if (onOpenChange) onOpenChange(false)
  }
  if (isOpen === false) return null
  return (
    <OverlayContext.Provider value={{ isOpen: isOpen !== undefined ? Boolean(isOpen) : undefined, onClose: handleClose }}>
      {children}
    </OverlayContext.Provider>
  )
}

export function Backdrop({
  isOpen,
  onOpenChange,
  isDismissable,
  className,
  children,
  ...props
}) {
  const overlayCtx = React.useContext(OverlayContext)

  const resolvedIsOpen = isOpen !== undefined
    ? Boolean(isOpen)
    : (overlayCtx?.isOpen !== undefined ? Boolean(overlayCtx.isOpen) : false)

  if (!resolvedIsOpen) return null

  const handleClose = () => {
    if (onOpenChange) onOpenChange(false)
    if (overlayCtx?.onClose) overlayCtx.onClose()
  }

  return (
    <OverlayContext.Provider value={{ isOpen: resolvedIsOpen, onClose: handleClose }}>
      {children}
    </OverlayContext.Provider>
  )
}

Dialog.propTypes = {
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  children: PropTypes.node,
  className: PropTypes.string,
}

DialogHeader.propTypes = { className: PropTypes.string }
DialogTitle.propTypes = { className: PropTypes.string }
DialogDescription.propTypes = { className: PropTypes.string }
DialogFooter.propTypes = { className: PropTypes.string }


