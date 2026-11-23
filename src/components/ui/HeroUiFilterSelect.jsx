import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { createPortal } from 'react-dom'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Search, Check, X } from 'lucide-react'

/**
 * HeroUiFilterSelect - Canonical Hero UI dropdown filter component.
 * Provides custom interactive select styling matching HeroUI & Hero UI standards.
 */
export default function HeroUiFilterSelect({
 id = undefined,
 value,
 onChange,
 options = [],
 placeholder = 'Pilih...',
 icon: IconComponent = null,
 className = '',
 popoverWidth = 'w-full',
 searchable = false,
 allowClear = false,
 ariaLabel = '',
 disabled = false,
 size = 'sm', // 'sm' (h-9), 'md' (h-9), 'lg' (h-10)
 placement = 'bottom-start', // 'bottom-start' | 'bottom' | 'top'
 align = 'start', // 'start' | 'left' | 'right'
 popoverProps = {},
}) {
 const [isOpen, setIsOpen] = useState(false)
 const [search, setSearch] = useState('')
 const [coords, setCoords] = useState({ top: 0, bottom: null, left: 0, width: 220, openTop: false })
 const containerRef = useRef(null)
 const triggerRef = useRef(null)
 const popoverRef = useRef(null)

 const effectivePlacement = popoverProps?.placement || placement
 const effectiveAlign = popoverProps?.align || align

 const updatePosition = useCallback(() => {
 if (!triggerRef.current) return
 const rect = triggerRef.current.getBoundingClientRect()
 const spaceBelow = window.innerHeight - rect.bottom
 const estimatedHeight = 280
 const openTop = effectivePlacement.startsWith('top') || (spaceBelow < estimatedHeight && rect.top > spaceBelow)
 const maxViewportW = Math.max(200, window.innerWidth - 16)
 const minW = Math.min(Math.max(rect.width, 220), maxViewportW)
 const leftPos = effectiveAlign === 'right' || effectiveAlign === 'end'
 ? Math.max(8, rect.right - minW)
 : Math.min(Math.max(8, rect.left), Math.max(8, window.innerWidth - minW - 8))

 setCoords({
 top: openTop ? null : rect.bottom + 6,
 bottom: openTop ? window.innerHeight - rect.top + 6 : null,
 left: leftPos,
 width: Math.min(rect.width, maxViewportW),
 openTop,
 })
 }, [effectiveAlign, effectivePlacement])

 useEffect(() => {
 function handleClickOutside(event) {
 const insideTrigger = containerRef.current && containerRef.current.contains(event.target)
 const insidePopover = popoverRef.current && popoverRef.current.contains(event.target)
 if (!insideTrigger && !insidePopover) {
 setIsOpen(false)
 }
 }
 if (isOpen) {
 updatePosition()
 document.addEventListener('mousedown', handleClickOutside)
 window.addEventListener('scroll', updatePosition, true)
 window.addEventListener('resize', updatePosition)
 }
 return () => {
 document.removeEventListener('mousedown', handleClickOutside)
 window.removeEventListener('scroll', updatePosition, true)
 window.removeEventListener('resize', updatePosition)
 }
 }, [isOpen, updatePosition])

 const normalizedOptions = useMemo(() => {
 return options.map((opt) => {
 if (typeof opt === 'string' || typeof opt === 'number') {
 return { value: String(opt), label: String(opt) }
 }
 return {
 value: String(opt.value ?? opt.id ?? ''),
 label: String(opt.label ?? opt.name ?? opt.nama_kelas ?? opt.nama_lengkap ?? opt.value ?? ''),
 subtext: opt.subtext,
 badge: opt.badge,
 badgeColor: opt.badgeColor,
 }
 })
 }, [options])

 const selectedOption = useMemo(() => {
 return normalizedOptions.find((opt) => String(opt.value) === String(value))
 }, [normalizedOptions, value])

 const filteredOptions = useMemo(() => {
 if (!searchable || !search.trim()) return normalizedOptions
 const q = search.toLowerCase()
 return normalizedOptions.filter((opt) =>
 (opt.label && opt.label.toLowerCase().includes(q)) ||
 (opt.subtext && opt.subtext.toLowerCase().includes(q)) ||
 (opt.badge && opt.badge.toLowerCase().includes(q))
 )
 }, [normalizedOptions, search, searchable])

 const hasValue = value !== '' && value !== 'semua' && value !== 'all' && value !== undefined && value !== null

 const sizeClasses = {
 sm: 'h-9 text-sm',
 md: 'h-9 text-sm',
 lg: 'h-10 text-sm',
 }

 const handleClear = (e) => {
 e.stopPropagation()
 onChange('')
 setIsOpen(false)
 setSearch('')
 }

 return (
 <div className={`relative ${isOpen ? 'z-50' : 'z-10'} ${className}`} ref={containerRef} id={id ? `${id}-container` : undefined}>
 <button
 ref={triggerRef}
 type="button"
 id={id}
 aria-label={ariaLabel || placeholder}
 disabled={disabled}
 onClick={() => {
 if (!disabled) {
 setIsOpen((prev) => !prev)
 setSearch('')
 }
 }}
 className={`${sizeClasses[size] || sizeClasses.sm} w-full flex items-center justify-between gap-2 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 px-3 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 shadow-xs ${
 isOpen
					? 'border-emerald-500 bg-white ring-2 ring-emerald-500/20 dark:border-emerald-500 dark:bg-card-dark dark:ring-emerald-400 text-slate-900 dark:text-white'
 : hasValue
					? 'border-emerald-400 dark:border-emerald-600 bg-emerald-50/40 dark:bg-card-dark text-slate-900 dark:text-white font-semibold'
					: 'border-emerald-300 dark:border-emerald-700/80 bg-white text-slate-700 hover:border-emerald-400 hover:bg-emerald-50/40 dark:bg-card-dark dark:text-slate-200 dark:hover:bg-emerald-950/30'
 }`}
 >
 <div className="flex items-center gap-2 truncate">
 {IconComponent && (
 <IconComponent className={`size-3.5 shrink-0 ${hasValue ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
 )}
 <span className="truncate">
 {selectedOption ? selectedOption.label : placeholder}
 </span>
 {selectedOption?.badge && (
 <span className="shrink-0 text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-100/90 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {selectedOption.badge}
 </span>
 )}
 </div>

 <div className="flex items-center gap-1 shrink-0">
 {allowClear && hasValue && (
 <span
 role="button"
 tabIndex={0}
 onClick={handleClear}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') handleClear(e)
 }}
 title="Reset Filter Ini"
 className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors cursor-pointer"
 >
 <X className="size-3" />
 </span>
 )}
 <ChevronDown
					className={`size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 transition-transform duration-200 ${
						isOpen ? 'rotate-180' : ''
 }`}
 />
 </div>
 </button>

 {typeof document !== 'undefined' && createPortal(
 <AnimatePresence>
 {isOpen && (
 <motion.div
 ref={popoverRef}
 initial={{ opacity: 0, scale: 0.96, y: coords.openTop ? 4 : -4 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.96, y: coords.openTop ? 4 : -4 }}
 transition={{ duration: 0.15, ease: 'easeOut' }}
 style={{
 position: 'fixed',
 top: coords.top !== null ? `${coords.top}px` : undefined,
 bottom: coords.bottom !== null ? `${coords.bottom}px` : undefined,
 left: `${coords.left}px`,
 minWidth: `${Math.min(Math.max(coords.width, 200), typeof window !== 'undefined' ? window.innerWidth - 16 : 200)}px`,
 maxWidth: 'calc(100vw - 16px)',
 }}
 className={`z-[9999] ${popoverWidth !== 'w-full' ? popoverWidth : ''} overflow-hidden rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-card-dark shadow-xl shadow-emerald-950/15 p-1.5 shadow-lg dark:shadow-black/60`}
 >
 {searchable && normalizedOptions.length > 5 && (
 <div className="p-1.5 border-b border-emerald-100 dark:border-emerald-800/60 mb-1">
 <div className="relative">
 <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Ketik untuk mencari..."
 className="w-full rounded-xl border border-emerald-300 dark:border-emerald-700/80 bg-emerald-50/30 dark:bg-slate-800 pl-8 pr-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none focus:ring-1 focus:ring-emerald-600 shadow-2xs"
 autoFocus
 />
 </div>
 </div>
 )}

 <div className="max-h-60 overflow-y-auto space-y-0.5 pr-0.5">
 {filteredOptions.length === 0 ? (
 <div className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
 Tidak ada opsi yang cocok
 </div>
 ) : (
 filteredOptions.map((opt, idx) => {
 const isSelected = String(opt.value) === String(value)
 return (
 <button
 key={`${String(opt.value)}-${idx}`}
 type="button"
 onClick={() => {
 onChange(opt.value)
 setIsOpen(false)
 setSearch('')
 }}
 className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors text-left cursor-pointer ${
 isSelected
 ? 'bg-emerald-100/90 text-emerald-950 font-bold dark:bg-emerald-950/80 dark:text-emerald-200'
 : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 dark:text-slate-200 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-200'
 }`}
 >
 <div className="truncate pr-2 flex-1">
 <div className="truncate flex items-center gap-1.5">
 <span className="truncate">{opt.label}</span>
 {opt.badge && (
 <span className="shrink-0 text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {opt.badge}
 </span>
 )}
 </div>
 {opt.subtext && (
 <div className="text-[10.5px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
 {opt.subtext}
 </div>
 )}
 </div>
 {isSelected && (
 <div className="size-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
 <Check className="size-3.5" strokeWidth={3} />
 </div>
 )}
 </button>
 )
 })
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>,
 document.body
 )}
 </div>
 )
}

HeroUiFilterSelect.propTypes = {
 id: PropTypes.string,
 value: PropTypes.any,
 onChange: PropTypes.func.isRequired,
 options: PropTypes.array,
 placeholder: PropTypes.string,
 icon: PropTypes.elementType,
 className: PropTypes.string,
 popoverWidth: PropTypes.string,
 searchable: PropTypes.bool,
 allowClear: PropTypes.bool,
 ariaLabel: PropTypes.string,
 disabled: PropTypes.bool,
 size: PropTypes.oneOf(['sm', 'md', 'lg']),
 placement: PropTypes.oneOf(['bottom', 'top']),
 align: PropTypes.oneOf(['left', 'right']),
}
