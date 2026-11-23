import React, { useState, useRef, useEffect, useId } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, X, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export const TimePicker = React.forwardRef(function TimePicker(
 {
 value,
 defaultValue,
 onChange,
 name,
 id,
 placeholder = '00:00',
 disabled = false,
 readOnly = false,
 required = false,
 isClearable = true,
 isError = false,
 className = '',
 inputClassName = '',
 popoverClassName = '',
 ...props
 },
 ref
) {
 const generatedId = useId()
 const inputId = id || generatedId

 const [internalValue, setInternalValue] = useState(value !== undefined ? (value || '') : (defaultValue || ''))
 useEffect(() => {
 if (value !== undefined) {
 setInternalValue(value || '')
 }
 }, [value])

 const [isOpen, setIsOpen] = useState(false)
 const containerRef = useRef(null)

 // Parse hours & minutes
 const parsedParts = (internalValue || '').split(':')
 const initialHour = parsedParts[0] ? parseInt(parsedParts[0], 10) : 7
 const initialMinute = parsedParts[1] ? parseInt(parsedParts[1], 10) : 0

 const [hour, setHour] = useState(!isNaN(initialHour) ? initialHour : 7)
 const [minute, setMinute] = useState(!isNaN(initialMinute) ? initialMinute : 0)

 useEffect(() => {
 if (internalValue) {
 const parts = internalValue.split(':')
 const h = parseInt(parts[0], 10)
 const m = parseInt(parts[1], 10)
 if (!isNaN(h)) setHour(h)
 if (!isNaN(m)) setMinute(m)
 }
 }, [internalValue])

 // Click outside listener
 useEffect(() => {
 if (!isOpen) return
 function handleClickOutside(e) {
 if (containerRef.current && !containerRef.current.contains(e.target)) {
 setIsOpen(false)
 }
 }
 document.addEventListener('mousedown', handleClickOutside, true)
 return () => document.removeEventListener('mousedown', handleClickOutside, true)
 }, [isOpen])

 const applyTime = (h, m) => {
 const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
 setInternalValue(formatted)

 if (onChange) {
 const syntheticEvent = {
 target: { name, id: inputId, value: formatted },
 currentTarget: { name, id: inputId, value: formatted },
 preventDefault: () => {},
 stopPropagation: () => {},
 }
 onChange(syntheticEvent)
 }
 }

 const handleHourChange = (newHour) => {
 const clamped = (newHour + 24) % 24
 setHour(clamped)
 applyTime(clamped, minute)
 }

 const handleMinuteChange = (newMin) => {
 const clamped = (newMin + 60) % 60
 setMinute(clamped)
 applyTime(hour, clamped)
 }

 const handleClear = (e) => {
 e.stopPropagation()
 setInternalValue('')
 if (onChange) {
 const syntheticEvent = {
 target: { name, id: inputId, value: '' },
 currentTarget: { name, id: inputId, value: '' },
 preventDefault: () => {},
 stopPropagation: () => {},
 }
 onChange(syntheticEvent)
 }
 }

 const handleNow = (e) => {
 e.stopPropagation()
 const now = new Date()
 const h = now.getHours()
 const m = now.getMinutes()
 setHour(h)
 setMinute(m)
 applyTime(h, m)
 setIsOpen(false)
 }

 const QUICK_TIMES = [
 { label: '07:00 (Masuk)', h: 7, m: 0 },
 { label: '12:00 (Dzuhur)', h: 12, m: 0 },
 { label: '15:30 (Ashar)', h: 15, m: 30 },
 { label: '17:00 (Pulang)', h: 17, m: 0 },
 ]

 return (
 <div ref={containerRef} className={cn('relative inline-block w-full', className)}>
 <input
 type="hidden"
 name={name}
 id={inputId}
 value={internalValue}
 required={required}
 ref={ref}
 />

 {/* Trigger Button */}
 <button
 type="button"
 disabled={disabled}
 onClick={() => {
 if (!disabled && !readOnly) setIsOpen(!isOpen)
 }}
 className={cn(
 'group flex h-10 w-full items-center justify-between rounded-xl border bg-white px-3.5 text-left text-sm font-medium transition-all duration-200 outline-none',
 'dark:bg-[#111827] dark:text-slate-100',
 isError
 ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
 : 'border-emerald-300 dark:border-emerald-700/80 hover:border-emerald-300 dark:hover:border-emerald-700 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:hover:border-emerald-700 dark:focus:border-emerald-500',
 disabled && 'cursor-not-allowed opacity-50 bg-slate-50 dark:bg-slate-900',
 inputClassName
 )}
 {...props}
 >
 <div className="flex items-center gap-2.5 truncate">
 <Clock
 className={cn(
 'h-4 w-4 shrink-0 transition-colors',
 internalValue ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-emerald-600'
 )}
 />
 <span className={cn('truncate font-mono', !internalValue && 'text-slate-400 dark:text-slate-500')}>
 {internalValue || placeholder}
 </span>
 </div>

 <div className="flex items-center gap-1 shrink-0">
 {internalValue && isClearable && !disabled && !readOnly && (
 <span
 role="button"
 tabIndex={0}
 onClick={handleClear}
 onKeyDown={(e) => {
 if (e.key === 'Enter' || e.key === ' ') handleClear(e)
 }}
 className="rounded-md p-0.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 hover:text-slate-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 dark:hover:text-slate-200"
 title="Hapus waktu"
 >
 <X className="h-3.5 w-3.5" />
 </span>
 )}
 </div>
 </button>

 {/* Popover */}
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, y: 6, scale: 0.98 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: 4, scale: 0.98 }}
 transition={{ duration: 0.15, ease: 'easeOut' }}
 className={cn(
 'absolute left-0 z-50 mt-1.5 w-64 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xl shadow-emerald-950/15 bg-white p-4 shadow-2xl shadow-sm backdrop-blur-md',
 'dark:border-emerald-800/60 dark:bg-[#131D2E] dark:shadow-black/40',
 popoverClassName
 )}
 >
 {/* Header / Wheel Picker */}
 <div className="flex items-center justify-center gap-4 py-2">
 {/* Hour Column */}
 <div className="flex flex-col items-center">
 <button
 type="button"
 onClick={() => handleHourChange(hour + 1)}
 className="rounded-lg p-1 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
 >
 <ChevronUp className="h-4 w-4" />
 </button>
 <span className="my-1 rounded-xl bg-emerald-50 px-3 py-1.5 font-mono text-xl font-bold text-slate-900 dark:bg-emerald-950/40 dark:text-white">
 {String(hour).padStart(2, '0')}
 </span>
 <button
 type="button"
 onClick={() => handleHourChange(hour - 1)}
 className="rounded-lg p-1 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
 >
 <ChevronDown className="h-4 w-4" />
 </button>
 <span className="text-[10px] font-bold text-slate-400">Jam</span>
 </div>

 <span className="font-mono text-2xl font-bold text-emerald-600 dark:text-emerald-400 -mt-4">:</span>

 {/* Minute Column */}
 <div className="flex flex-col items-center">
 <button
 type="button"
 onClick={() => handleMinuteChange(minute + 5)}
 className="rounded-lg p-1 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
 >
 <ChevronUp className="h-4 w-4" />
 </button>
 <span className="my-1 rounded-xl bg-emerald-50 px-3 py-1.5 font-mono text-xl font-bold text-slate-900 dark:bg-emerald-950/40 dark:text-white">
 {String(minute).padStart(2, '0')}
 </span>
 <button
 type="button"
 onClick={() => handleMinuteChange(minute - 5)}
 className="rounded-lg p-1 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
 >
 <ChevronDown className="h-4 w-4" />
 </button>
 <span className="text-[10px] font-bold text-slate-400">Menit</span>
 </div>
 </div>

 {/* Quick Presets */}
 <div className="mt-3 grid grid-cols-2 gap-1.5 border-t border-emerald-100/80 pt-3 dark:border-emerald-800/60">
 {QUICK_TIMES.map((preset) => (
 <button
 key={preset.label}
 type="button"
 onClick={() => {
 setHour(preset.h)
 setMinute(preset.m)
 applyTime(preset.h, preset.m)
 }}
 className="rounded-lg border border-emerald-300 dark:border-emerald-700/80 dark:border-emerald-800/60 bg-slate-50 px-2 py-1 text-[10px] font-semibold text-slate-600 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
 >
 {preset.label}
 </button>
 ))}
 </div>

 {/* Bottom Controls */}
 <div className="mt-3 flex items-center justify-between border-t border-emerald-100/80 pt-2 dark:border-emerald-800/60">
 <button
 type="button"
 onClick={handleNow}
 className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
 >
 Sekarang
 </button>
 <button
 type="button"
 onClick={() => setIsOpen(false)}
 className="rounded-lg bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow hover:bg-emerald-700 transition-colors"
 >
 Selesai
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 )
})

TimePicker.propTypes = {
 value: PropTypes.string,
 defaultValue: PropTypes.string,
 onChange: PropTypes.func,
 name: PropTypes.string,
 id: PropTypes.string,
 placeholder: PropTypes.string,
 disabled: PropTypes.bool,
 readOnly: PropTypes.bool,
 required: PropTypes.bool,
 isClearable: PropTypes.bool,
 isError: PropTypes.bool,
 className: PropTypes.string,
 inputClassName: PropTypes.string,
 popoverClassName: PropTypes.string,
}

export default TimePicker
