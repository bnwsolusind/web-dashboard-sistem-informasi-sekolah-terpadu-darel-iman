import React, { useState, useRef, useEffect, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check, Search } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * CustomSelect - Standar tunggal pengganti <select> native HTML di seluruh aplikasi.
 * Menghilangkan pop-up hitam bawaan browser / macOS dan menggunakan design token:
 * Container: rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-1.5 shadow-lg
 * Item: px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-emerald-50/40
 * Kompatibel 100% dengan onChange({ target: { value, name } }) bawaan <select>.
 */
export const CustomSelect = React.forwardRef(function CustomSelect({
    value,
    defaultValue,
    onChange,
    options: directOptions,
    children,
    placeholder = 'Pilih opsi...',
    disabled = false,
    className = '',
    name,
    id,
    required,
    isError = false,
    searchable = false,
    popoverWidth,
    ...props
}, ref) {
    const [isOpen, setIsOpen] = useState(false)
    const [internalValue, setInternalValue] = useState(defaultValue ?? '')
    const [search, setSearch] = useState('')
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 200, openTop: false })
    const triggerRef = useRef(null)
    const popoverRef = useRef(null)

    const currentValue = value !== undefined ? value : internalValue

    // Ekstrak opsi dari directOptions atau dari children (<option>)
    const parsedOptions = useMemo(() => {
        if (Array.isArray(directOptions)) {
            return directOptions.map((opt) => {
                if (typeof opt === 'string' || typeof opt === 'number') {
                    return { value: String(opt), label: String(opt) }
                }
                return {
                    value: String(opt.value ?? opt.id ?? ''),
                    label: String(opt.label ?? opt.name ?? opt.value ?? ''),
                    disabled: Boolean(opt.disabled),
                }
            })
        }

        const items = []
        React.Children.forEach(children, (child) => {
            if (!child) return
            if (child.type === 'option') {
                items.push({
                    value: String(child.props.value ?? child.props.children ?? ''),
                    label: String(child.props.children ?? child.props.value ?? ''),
                    disabled: Boolean(child.props.disabled),
                })
            } else if (child.type === 'optgroup') {
                React.Children.forEach(child.props.children, (optChild) => {
                    if (optChild && optChild.type === 'option') {
                        items.push({
                            value: String(optChild.props.value ?? optChild.props.children ?? ''),
                            label: String(optChild.props.children ?? optChild.props.value ?? ''),
                            disabled: Boolean(optChild.props.disabled),
                            group: child.props.label,
                        })
                    }
                })
            }
        })
        return items
    }, [directOptions, children])

    const selectedOption = useMemo(() => {
        return parsedOptions.find((opt) => String(opt.value) === String(currentValue))
    }, [parsedOptions, currentValue])

    const filteredOptions = useMemo(() => {
        if (!searchable || !search.trim()) return parsedOptions
        const q = search.toLowerCase()
        return parsedOptions.filter((opt) => opt.label.toLowerCase().includes(q))
    }, [parsedOptions, search, searchable])

    const updatePosition = () => {
        if (!triggerRef.current) return
        const rect = triggerRef.current.getBoundingClientRect()
        const spaceBelow = window.innerHeight - rect.bottom
        const openTop = spaceBelow < 220 && rect.top > 220

        setCoords({
            top: openTop ? rect.top - 6 : rect.bottom + 6,
            left: Math.max(8, Math.min(rect.left, window.innerWidth - rect.width - 8)),
            width: Math.max(rect.width, 180),
            openTop,
        })
    }

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                triggerRef.current &&
                !triggerRef.current.contains(e.target) &&
                popoverRef.current &&
                !popoverRef.current.contains(e.target)
            ) {
                setIsOpen(false)
            }
        }
        const handleScrollResize = () => {
            if (isOpen) updatePosition()
        }

        if (isOpen) {
            updatePosition()
            document.addEventListener('mousedown', handleClickOutside)
            window.addEventListener('scroll', handleScrollResize, true)
            window.addEventListener('resize', handleScrollResize)
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            window.removeEventListener('scroll', handleScrollResize, true)
            window.removeEventListener('resize', handleScrollResize)
        }
    }, [isOpen])

    const handleSelect = (optValue) => {
        setInternalValue(optValue)
        setIsOpen(false)
        setSearch('')

        if (onChange) {
            // Buat synthetic event yang identik dengan onChange <select>
            const syntheticEvent = {
                target: {
                    name: name || '',
                    value: optValue,
                },
                currentTarget: {
                    name: name || '',
                    value: optValue,
                },
                stopPropagation: () => { },
                preventDefault: () => { },
            }
            onChange(syntheticEvent)
        }
    }

    return (
        <div className="relative inline-block w-full">
            {/* Hidden input agar form submit native tetap menangkap value */}
            <input type="hidden" name={name} value={currentValue ?? ''} required={required} />

            <button
                ref={(node) => {
                    triggerRef.current = node
                    if (typeof ref === 'function') {
                        ref(node)
                    } else if (ref) {
                        ref.current = node
                    }
                }}
                type="button"
                id={id}
                disabled={disabled}
                onClick={() => {
                    if (!disabled) {
                        setIsOpen((prev) => !prev)
                        setSearch('')
                    }
                }}
                className={cn(
                    'flex h-10 w-full items-center justify-between gap-2 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white px-3.5 py-2 text-sm font-medium text-slate-800 shadow-2xs transition-all duration-150 hover:border-emerald-400 hover:bg-emerald-50/30 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-card-dark dark:text-slate-100 dark:hover:border-emerald-600 cursor-pointer text-left',
                    isError && 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-500',
                    isOpen && 'border-emerald-500 ring-2 ring-emerald-500/20 dark:border-emerald-500',
                    className
                )}
            >
                <span className="truncate">
                    {selectedOption ? selectedOption.label : (parsedOptions[0]?.label || placeholder)}
                </span>
                <ChevronDown
                    className={cn(
                        'size-4 shrink-0 text-emerald-600 dark:text-emerald-400 transition-transform duration-200',
                        isOpen && 'rotate-180 text-emerald-600 dark:text-emerald-400'
                    )}
                />
            </button>

            {isOpen && typeof document !== 'undefined' && createPortal(
                <div
                    ref={popoverRef}
                    style={{
                        position: 'fixed',
                        top: coords.openTop ? 'auto' : `${coords.top}px`,
                        bottom: coords.openTop ? `${window.innerHeight - coords.top}px` : 'auto',
                        left: `${coords.left}px`,
                        width: popoverWidth || `${coords.width}px`,
                        maxHeight: '260px',
                        zIndex: 99999,
                    }}
                    className="flex flex-col overflow-hidden rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-1.5 shadow-lg dark:bg-card-dark dark:shadow-black/60 animate-in fade-in zoom-in-95 duration-100"
                >
                    {searchable && parsedOptions.length > 6 && (
                        <div className="p-1.5 border-b border-emerald-100 dark:border-emerald-800/60 mb-1">
                            <div className="relative">
                                <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari opsi..."
                                    className="w-full rounded-xl border-2 border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/30 pl-8 pr-2.5 py-1 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-emerald-600 focus:outline-none dark:border-emerald-700/80 dark:bg-surface-dark-inner dark:text-slate-100"
                                    autoFocus
                                />
                            </div>
                        </div>
                    )}

                    <div className="overflow-y-auto max-h-[220px] space-y-0.5 custom-scrollbar">
                        {filteredOptions.length === 0 ? (
                            <div className="px-3 py-3 text-center text-xs text-slate-400">
                                Tidak ada opsi tersedia
                            </div>
                        ) : (
                            filteredOptions.map((opt, idx) => {
                                const isSelected = String(opt.value) === String(currentValue)
                                return (
                                    <button
                                        key={`${opt.value}-${idx}`}
                                        type="button"
                                        disabled={opt.disabled}
                                        onClick={() => handleSelect(opt.value)}
                                        className={cn(
                                            'flex w-full cursor-pointer items-center justify-between gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors text-left',
                                            isSelected
                                                ? 'bg-emerald-50 text-emerald-900 font-semibold dark:bg-emerald-950/50 dark:text-emerald-200'
                                                : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 dark:text-slate-200 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-200',
                                            opt.disabled && 'opacity-40 cursor-not-allowed'
                                        )}
                                    >
                                        <span className="truncate">{opt.label}</span>
                                        {isSelected && (
                                            <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                        )}
                                    </button>
                                )
                            })
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
})

CustomSelect.displayName = 'CustomSelect'

export default CustomSelect

