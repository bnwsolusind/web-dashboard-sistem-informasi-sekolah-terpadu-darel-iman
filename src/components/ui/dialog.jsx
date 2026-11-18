import * as React from 'react'
import PropTypes from 'prop-types'
import {
  Modal as HeroModal,
  Button as HeroButton,
} from '@heroui/react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

import { OverlayContext } from './overlay'

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

  return (
    <OverlayContext.Provider value={{ isOpen: resolvedIsOpen, onClose: resolvedOnClose }}>
      <HeroModal
        isOpen={Boolean(resolvedIsOpen)}
        onOpenChange={(open) => {
          if (!open && resolvedOnClose) resolvedOnClose()
        }}
      >
        <HeroModal.Backdrop className="bg-slate-950/70 backdrop-blur-md fixed inset-0 z-[80] flex items-center justify-center p-4">
          <HeroModal.Container className="w-full flex items-center justify-center min-h-full">
            <HeroModal.Dialog
              className={cn(
                'relative w-full max-w-lg overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl text-slate-800 dark:border-slate-800 dark:bg-[#1B2433] dark:text-slate-100',
                className
              )}
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
              <div className={cn('relative', className?.includes('p-0') ? 'p-0 flex flex-col flex-1 min-h-0' : '')}>
                {resolvedOnClose && showCloseButton && (
                  <HeroButton
                    isIconOnly
                    size="sm"
                    onPress={resolvedOnClose}
                    aria-label="Tutup dialog"
                    className="absolute right-4 top-4 rounded-lg size-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 transition-all cursor-pointer active:scale-95 z-20"
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
  return <div className={cn('px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col space-y-1.5 text-center sm:text-left', className)} {...props} />
}

export function DialogTitle({ className, ...props }) {
  return <h2 className={cn('text-lg font-semibold text-slate-900 dark:text-white tracking-tight', className)} {...props} />
}

export function DialogDescription({ className, ...props }) {
  return <p className={cn('text-sm text-slate-500 dark:text-slate-400 mt-1', className)} {...props} />
}

export function DialogBody({ className, ...props }) {
  return <div className={cn('p-6 space-y-4 text-sm text-slate-700 dark:text-slate-200', className)} {...props} />
}

export function DialogFooter({ className, ...props }) {
  return <div className={cn('px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-2 dark:border-slate-800 dark:bg-slate-900/50', className)} {...props} />
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
          'rounded-xl size-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 transition-all cursor-pointer active:scale-95',
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
        'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer active:scale-95 disabled:opacity-50',
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

