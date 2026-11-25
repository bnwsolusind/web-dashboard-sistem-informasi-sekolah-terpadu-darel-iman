import React, { useState, useEffect, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import { MapPin, ChevronDown, X, Check } from 'lucide-react'

export function SearchableRegionInput({
 label,
 value,
 onChange,
 onSelectOption,
 options = [],
 placeholder = 'Cari...',
 isLoading = false,
 disabled = false,
}) {
 const [isOpen, setIsOpen] = useState(false)
 const [query, setQuery] = useState(value || '')
 const containerRef = useRef(null)

 useEffect(() => {
 setQuery(value || '')
 }, [value])

 const filtered = useMemo(() => {
 if (!options || !Array.isArray(options)) return []
 const q = query.trim().toLowerCase()
 if (!q) return options
 return options.filter((item) => {
 if (typeof item === 'object' && item !== null) {
 const text = `${item.label || ''} ${item.value || ''} ${item.postalCode || ''}`.toLowerCase()
 return text.includes(q)
 }
 return String(item).toLowerCase().includes(q)
 })
 }, [options, query])

 useEffect(() => {
 function handleOutside(e) {
 if (containerRef.current && !containerRef.current.contains(e.target)) {
 setIsOpen(false)
 }
 }
 document.addEventListener('mousedown', handleOutside)
 return () => document.removeEventListener('mousedown', handleOutside)
 }, [])

 const handleInputChange = (e) => {
 const val = e.target.value
 setQuery(val)
 onChange(val)
 if (!isOpen) setIsOpen(true)
 }

 const handleSelect = (item) => {
 const val = typeof item === 'object' && item !== null ? item.value : item
 setQuery(val)
 onChange(val)
 if (onSelectOption) {
 onSelectOption(item)
 }
 setIsOpen(false)
 }

 const handleClear = (e) => {
 e.stopPropagation()
 setQuery('')
 onChange('')
 }

 return (
 <div className="relative" ref={containerRef}>
 {label && (
 <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-200">
 {label}
 </label>
 )}
 <div className="relative flex items-center">
 <MapPin className="pointer-events-none absolute left-3.5 h-4 w-4 text-slate-400" />
 <input
 type="text"
 disabled={disabled}
 placeholder={placeholder}
 value={query}
 onFocus={() => setIsOpen(true)}
 onChange={handleInputChange}
 className="h-10 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 pl-10 pr-14 text-xs font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 shadow-xs focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all disabled:opacity-50"
 />
 <div className="absolute right-3 flex items-center gap-1">
 {isLoading ? (
 <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#059669] border-t-transparent" />
 ) : (
 <>
 {query && (
 <button
 type="button"
 onClick={handleClear}
 className="rounded-full p-0.5 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 hover:text-slate-600 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300"
 aria-label="Hapus input"
 >
 <X className="h-3.5 w-3.5" />
 </button>
 )}
 <button
 type="button"
 onClick={() => setIsOpen((p) => !p)}
 className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
 >
 <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
 </button>
 </>
 )}
 </div>
 </div>

 {isOpen && (
 <div className="absolute left-0 right-0 z-50 mt-1.5 max-h-52 overflow-y-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-1.5 shadow-xl dark:border-emerald-700/80 dark:bg-[#1B2433]">
 {isLoading ? (
 <div className="px-3 py-2.5 text-center text-xs text-slate-400">Memuat data wilayah...</div>
 ) : filtered.length > 0 ? (
 filtered.map((item, idx) => {
 const val = typeof item === 'object' && item !== null ? item.value : item
 const displayLabel = typeof item === 'object' && item !== null ? item.label || item.value : item
 const postalBadge = typeof item === 'object' && item !== null ? item.postalCode : null
 const isSelected = String(val).toLowerCase() === String(value).toLowerCase()
 return (
 <button
 key={idx}
 type="button"
 onClick={() => handleSelect(item)}
 className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${
 isSelected
 ? 'bg-emerald-50 text-[#059669] dark:bg-emerald-950/60 dark:text-emerald-300'
 : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
 }`}
 >
 <span className="truncate">{displayLabel}</span>
 <div className="flex items-center gap-1.5 shrink-0 ml-2">
 {postalBadge && (
 <span className="rounded-md bg-emerald-50 text-[#059669] border border-emerald-200/80 dark:border-emerald-800/60 px-1.5 py-0.5 text-[10px] font-mono font-bold dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60">
 {postalBadge}
 </span>
 )}
 {isSelected && <Check className="h-3.5 w-3.5 shrink-0 text-[#059669] dark:text-emerald-400" />}
 </div>
 </button>
 )
 })
 ) : (
 <div className="px-3 py-2.5 text-center text-xs text-slate-400">
 Tidak ada pilihan persis. Teks di atas akan disimpan secara langsung.
 </div>
 )}
 </div>
 )}
 </div>
 )
}

SearchableRegionInput.propTypes = {
 label: PropTypes.string,
 value: PropTypes.string,
 onChange: PropTypes.func.isRequired,
 onSelectOption: PropTypes.func,
 options: PropTypes.array,
 placeholder: PropTypes.string,
 isLoading: PropTypes.bool,
 disabled: PropTypes.bool,
}

export default SearchableRegionInput

