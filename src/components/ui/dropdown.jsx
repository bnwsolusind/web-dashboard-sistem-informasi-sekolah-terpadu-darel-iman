import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import {
  Dropdown as HeroDropdown,
  Header as HeroHeader,
  Separator as HeroSeparator,
} from '@heroui/react'
import { cn } from '../../lib/utils'

export function DropdownMenu(props) {
  return <HeroDropdown.Root {...props} />
}

export function DropdownMenuTrigger({ className, ...props }) {
  return <HeroDropdown.Trigger className={cn('outline-none cursor-pointer', className)} {...props} />
}

export function DropdownMenuContent({ children, className, placement = 'bottom-end', ...props }) {
  return (
    <HeroDropdown.Popover
      placement={placement}
      className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900 overflow-hidden"
    >
      <HeroDropdown.Menu
        {...props}
        className={cn(
          'outline-none min-w-44 bg-white dark:bg-slate-900 p-0 text-slate-800 dark:text-slate-100',
          className
        )}
      >
        {children}
      </HeroDropdown.Menu>
    </HeroDropdown.Popover>
  )
}

export function DropdownMenuItem({ className, onAction, onClick, onPress, ...props }) {
  const handleSelect = onAction || onClick || onPress
  return (
    <HeroDropdown.Item
      {...props}
      onAction={handleSelect}
      className={cn(
        'group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus:bg-slate-50 focus:text-slate-900 outline-none transition-colors data-[disabled]:opacity-50 data-[disabled]:pointer-events-none dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:bg-slate-800 dark:focus:text-white [&_*]:text-inherit',
        className
      )}
    />
  )
}

export function DropdownMenuSection({ className, ...props }) {
  return <HeroDropdown.Section {...props} className={cn('py-1', className)} />
}

export function DropdownMenuHeader({ className, ...props }) {
  return (
    <HeroHeader
      {...props}
      className={cn('px-3 py-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider', className)}
    />
  )
}

export function DropdownMenuSeparator({ className, ...props }) {
  return (
    <HeroSeparator
      className={cn('h-px my-1 bg-slate-100 dark:bg-slate-800 border-none', className)}
      {...props}
    />
  )
}

/**
 * Convenience higher-level Dropdown component
 */
export function Dropdown({ trigger, items, align = 'right', className }) {
  const [isOpen, setIsOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0, right: 0, bottom: 0 })
  const triggerRef = useRef(null)

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect()
      setCoords({
        top: rect.bottom,
        bottom: rect.top,
        left: rect.left,
        right: rect.right,
      })
    }
  }

  useEffect(() => {
    if (isOpen) {
      updateCoords()
      const handleScrollOrResize = () => {
        setIsOpen(false)
      }
      window.addEventListener('scroll', handleScrollOrResize, true)
      window.addEventListener('resize', handleScrollOrResize)
      return () => {
        window.removeEventListener('scroll', handleScrollOrResize, true)
        window.removeEventListener('resize', handleScrollOrResize)
      }
    }
  }, [isOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        triggerRef.current &&
        !triggerRef.current.contains(event.target) &&
        !event.target.closest('.app-dropdown-portal')
      ) {
        setIsOpen(false)
      }
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const toggleDropdown = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isOpen) {
      updateCoords()
    }
    setIsOpen((prev) => !prev)
  }

  const getPanelStyle = () => {
    const offset = 6
    let top = coords.top + offset
    const right = Math.max(8, window.innerWidth - coords.right)
    const left = Math.max(8, coords.left)

    if (top + 220 > window.innerHeight) {
      top = Math.max(8, coords.bottom - 220 - offset)
    }

    return {
      position: 'fixed',
      top: `${top}px`,
      right: align === 'left' ? 'auto' : `${right}px`,
      left: align === 'left' ? `${left}px` : 'auto',
      zIndex: 99999,
    }
  }

  const portalContent = isOpen && (
    <div
      role="menu"
      aria-orientation="vertical"
      onClick={(e) => e.stopPropagation()}
      style={getPanelStyle()}
      className={cn(
        'app-dropdown-portal min-w-[180px] rounded-xl bg-white dark:bg-slate-900 p-1.5 shadow-lg border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 opacity-100 pointer-events-auto isolation-auto animate-in fade-in zoom-in-95 duration-150',
        className
      )}
    >
      {items.map((item, idx) => {
        if (item.divider) {
          return <div key={idx} className="my-1 border-t border-slate-100 dark:border-slate-800" />
        }
        return (
          <button
            key={idx}
            type="button"
            role="menuitem"
            onClick={(e) => {
              e.stopPropagation()
              if (item.onClick) item.onClick()
              setIsOpen(false)
            }}
            disabled={item.disabled}
            className={cn(
              'group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left cursor-pointer focus:outline-none focus-visible:ring-2 [&_*]:text-inherit',
              item.danger
                ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700 focus-visible:ring-rose-600/30 focus-visible:bg-rose-50 focus-visible:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 dark:focus-visible:bg-rose-950/60 dark:focus-visible:text-rose-300'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-slate-400/30 focus-visible:bg-slate-50 focus-visible:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:bg-slate-800 dark:focus-visible:text-white',
              item.disabled && 'opacity-50 pointer-events-none'
            )}
          >
            {item.icon && (
              <span
                className={cn(
                  'flex h-4 w-4 shrink-0 items-center justify-center text-sm transition-colors',
                  item.danger
                    ? 'text-rose-500 group-hover:text-rose-700 dark:text-rose-400 dark:group-hover:text-rose-300 [&>svg]:transition-colors [&>svg]:group-hover:text-rose-700 dark:[&>svg]:group-hover:text-rose-300'
                    : 'text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white [&>svg]:transition-colors [&>svg]:group-hover:text-slate-900 dark:[&>svg]:group-hover:text-white'
                )}
              >
                {item.icon}
              </span>
            )}
            <span className="truncate">{item.label}</span>
          </button>
        )
      })}
    </div>
  )

  return (
    <div className="relative inline-block text-left" ref={triggerRef}>
      <div
        onClick={toggleDropdown}
        className="inline-flex cursor-pointer items-center justify-center focus:outline-none"
      >
        {trigger}
      </div>
      {typeof document !== 'undefined' && createPortal(portalContent, document.body)}
    </div>
  )
}

Dropdown.propTypes = {
  trigger: PropTypes.node.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.node,
      icon: PropTypes.node,
      onClick: PropTypes.func,
      danger: PropTypes.bool,
      disabled: PropTypes.bool,
      divider: PropTypes.bool,
    })
  ).isRequired,
  align: PropTypes.oneOf(['right', 'left', 'center']),
  className: PropTypes.string,
}

export default Dropdown
