import * as React from 'react'
import PropTypes from 'prop-types'
import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  safePolygon
} from '@floating-ui/react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '../../lib/utils'

const HoverCardContext = React.createContext(null)

export function HoverCard({
  children,
  openDelay = 150,
  closeDelay = 200,
  placement = 'top',
  ...props
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  const { refs, floatingStyles, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(8),
      flip({ fallbackAxisSideDirection: 'end', padding: 8 }),
      shift({ padding: 8 })
    ]
  })

  const hover = useHover(context, {
    move: false,
    delay: {
      open: openDelay,
      close: closeDelay
    },
    handleClose: safePolygon({
      buffer: 2
    })
  })
  const focus = useFocus(context)
  const dismiss = useDismiss(context)
  const role = useRole(context, { role: 'tooltip' })

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role
  ])

  const contextValue = React.useMemo(() => ({
    isOpen,
    setIsOpen,
    refs,
    floatingStyles,
    getReferenceProps,
    getFloatingProps
  }), [isOpen, refs, floatingStyles, getReferenceProps, getFloatingProps])

  return (
    <HoverCardContext.Provider value={contextValue}>
      {children}
    </HoverCardContext.Provider>
  )
}

export function HoverCardTrigger({
  children,
  asChild = true,
  className,
  onClick,
  onMouseEnter,
  onMouseLeave,
  ...props
}) {
  const ctx = React.useContext(HoverCardContext)
  if (!ctx) return children

  const handleClick = (e) => {
    ctx.setIsOpen(false)
    if (React.isValidElement(children) && children.props.onClick) {
      children.props.onClick(e)
    }
    onClick?.(e)
  }

  const handleMouseEnter = (e) => {
    if (React.isValidElement(children) && children.props.onMouseEnter) {
      children.props.onMouseEnter(e)
    }
    onMouseEnter?.(e)
  }

  const handleMouseLeave = (e) => {
    if (React.isValidElement(children) && children.props.onMouseLeave) {
      children.props.onMouseLeave(e)
    }
    onMouseLeave?.(e)
  }

  const refProps = ctx.getReferenceProps({
    ref: ctx.refs.setReference,
    onClick: handleClick,
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
    className: cn('inline-flex', className),
    ...props
  })

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...refProps,
      ...children.props,
      ref: (node) => {
        ctx.refs.setReference(node)
        const childRef = children.ref
        if (typeof childRef === 'function') childRef(node)
        else if (childRef && 'current' in childRef) childRef.current = node
      },
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      className: cn(children.props.className, className)
    })
  }

  return (
    <div {...refProps}>
      {children}
    </div>
  )
}

export function HoverCardContent({
  className,
  children,
  side,
  align,
  ...props
}) {
  const ctx = React.useContext(HoverCardContext)
  if (!ctx) return null

  return (
    <FloatingPortal>
      <AnimatePresence>
        {ctx.isOpen && (
          <div
            ref={ctx.refs.setFloating}
            style={ctx.floatingStyles}
            {...ctx.getFloatingProps()}
            className="z-[9999]"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 4 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className={cn(
                'overflow-hidden rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-800 dark:bg-slate-900 pointer-events-auto',
                className
              )}
              {...props}
            >
              {children}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </FloatingPortal>
  )
}

HoverCard.propTypes = {
  children: PropTypes.node,
  openDelay: PropTypes.number,
  closeDelay: PropTypes.number,
  placement: PropTypes.string,
}

HoverCardTrigger.propTypes = {
  children: PropTypes.node,
  asChild: PropTypes.bool,
  className: PropTypes.string,
  onClick: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
}

HoverCardContent.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  side: PropTypes.string,
  align: PropTypes.string,
}

export default HoverCard
