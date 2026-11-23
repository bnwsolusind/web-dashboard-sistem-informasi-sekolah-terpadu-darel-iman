import React, { createContext, useContext } from 'react'

export const OverlayContext = createContext(null)

export function OverlayWrapper({ isOpen, onOpenChange, children, ...props }) {
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
 className,
 isDismissable = true,
 isOpen,
 onDismiss,
 onOpenChange,
 children,
 ...props
}) {
 const overlayCtx = useContext(OverlayContext)

 const resolvedIsOpen = isOpen !== undefined
 ? Boolean(isOpen)
 : (overlayCtx?.isOpen !== undefined ? Boolean(overlayCtx.isOpen) : false)

 if (!resolvedIsOpen) return null

 const handleClose = () => {
 if (onOpenChange) onOpenChange(false)
 if (onDismiss) onDismiss()
 if (overlayCtx?.onClose) overlayCtx.onClose()
 }

 return (
 <OverlayContext.Provider value={{ isOpen: resolvedIsOpen, onClose: handleClose }}>
 {children}
 </OverlayContext.Provider>
 )
}

export default { OverlayWrapper, Backdrop, OverlayContext }
