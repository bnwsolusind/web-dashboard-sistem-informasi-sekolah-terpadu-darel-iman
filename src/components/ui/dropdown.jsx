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

export function DropdownMenuContent({ children, className, placement = 'bottom end', ...props }) {
 // Normalize React Aria placement: convert hyphens to spaces (e.g. 'bottom-end' -> 'bottom end')
 const normalizedPlacement = typeof placement === 'string'
 ? placement.replace('-', ' ')
 : 'bottom end'

 return (
 <HeroDropdown.Popover
			placement={normalizedPlacement}
			className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xl shadow-emerald-950/15 bg-white p-1.5 dark:border-emerald-800/60 dark:bg-[#182232] outline-none"
		>
			<HeroDropdown.Menu
				{...props}
				className={cn(
					'outline-none min-w-44 p-0 text-slate-800 dark:text-slate-100 border-none shadow-none bg-transparent',
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
 'group flex w-full cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 focus:bg-emerald-50 focus:text-emerald-700 outline-none transition-colors data-[disabled]:opacity-50 data-[disabled]:pointer-events-none dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white dark:focus:bg-slate-800 dark:focus:text-white',
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
 className={cn('h-px my-1 bg-emerald-50 dark:bg-emerald-950/40 border-none', className)}
 {...props}
 />
 )
}

function getDropdownIconBadgeTone(label, isDanger) {
  if (isDanger) {
    return 'bg-rose-50 text-rose-600 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60'
  }
  const l = typeof label === 'string' ? label.toLowerCase() : ''
  if (l.includes('lihat') || l.includes('detail') || l.includes('preview') || l.includes('view') || l.includes('mata')) {
    return 'bg-sky-50 text-sky-600 border-sky-200/80 dark:bg-sky-950/60 dark:text-sky-300 dark:border-sky-800/60'
  }
  if (l.includes('edit') || l.includes('ubah') || l.includes('perbarui') || l.includes('update')) {
    return 'bg-amber-50 text-amber-600 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'
  }
  if (l.includes('chat') || l.includes('pesan') || l.includes('wa') || l.includes('kontak') || l.includes('ortu') || l.includes('hubungi')) {
    return 'bg-emerald-50 text-emerald-600 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'
  }
  if (l.includes('cetak') || l.includes('print') || l.includes('kartu') || l.includes('pdf') || l.includes('download') || l.includes('unduh')) {
    return 'bg-indigo-50 text-indigo-600 border-indigo-200/80 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800/60'
  }
  if (l.includes('pindah') || l.includes('mutasi') || l.includes('sync') || l.includes('riwayat') || l.includes('log') || l.includes('jadwal')) {
    return 'bg-purple-50 text-purple-600 border-purple-200/80 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60'
  }
  if (l.includes('hapus') || l.includes('delete') || l.includes('batal') || l.includes('keluar')) {
    return 'bg-rose-50 text-rose-600 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/60'
  }
  return 'bg-teal-50 text-teal-600 border-teal-200/80 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60'
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
 const right = Math.max(8, Math.min(window.innerWidth - 190, window.innerWidth - coords.right))
 const left = Math.max(8, Math.min(window.innerWidth - 190, coords.left))

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
 'app-dropdown-portal min-w-[180px] rounded-xl bg-white dark:bg-slate-900 p-1.5 shadow-lg border border-emerald-200/80 dark:border-emerald-800/60 text-slate-800 dark:text-slate-100 opacity-100 pointer-events-auto isolation-auto animate-in fade-in zoom-in-95 duration-150',
 className
 )}
 >
 {items.map((item, idx) => {
 if (item.divider) {
 return <div key={idx} className="my-1 border-t border-emerald-100/80 dark:border-emerald-800/60" />
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
 'group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors text-left cursor-pointer focus:outline-none focus-visible:ring-2',
 item.danger
 ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700 focus-visible:ring-rose-600/30 focus-visible:bg-rose-50 focus-visible:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/60 dark:hover:text-rose-300 dark:focus-visible:bg-rose-950/60 dark:focus-visible:text-rose-300'
 : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:ring-emerald-400/30 focus-visible:bg-emerald-50 focus-visible:text-emerald-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white dark:focus-visible:bg-slate-800 dark:focus-visible:text-white',
 item.disabled && 'opacity-50 pointer-events-none'
 )}
 >
 {item.icon && (
                  <span
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-lg border shadow-2xs transition-transform group-hover:scale-105 [&>svg]:size-3.5',
                      getDropdownIconBadgeTone(item.label, item.danger)
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
