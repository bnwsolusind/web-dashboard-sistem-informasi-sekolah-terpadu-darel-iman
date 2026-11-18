import React, { useState, useRef, useEffect, useId } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Clock } from 'lucide-react'
import { cn } from '../../lib/utils'

const MONTH_NAMES_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const DAY_NAMES_ID = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const FULL_DAY_NAMES_ID = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

function formatDisplayDate(dateStr, withDay = false) {
  if (!dateStr) return ''
  try {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10)
      const month = parseInt(parts[1], 10) - 1
      const day = parseInt(parts[2], 10)
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        if (withDay) {
          const dObj = new Date(year, month, day)
          const dayName = !isNaN(dObj.getTime()) ? FULL_DAY_NAMES_ID[dObj.getDay()] : ''
          return `${dayName ? `${dayName}, ` : ''}${day} ${MONTH_NAMES_ID[month]} ${year}`
        }
        return `${day} ${MONTH_NAMES_ID[month]} ${year}`
      }
    }
  } catch {
    // fallback
  }
  return dateStr
}

function toIsoDate(year, month, day) {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

export const DatePicker = React.forwardRef(function DatePicker(
  {
    value,
    defaultValue,
    onChange,
    name,
    id,
    placeholder = 'Pilih tanggal...',
    min,
    max,
    disabled = false,
    readOnly = false,
    required = false,
    isClearable = true,
    isError = false,
    showDayName = false,
    className = '',
    inputClassName = '',
    popoverClassName = '',
    ...props
  },
  ref
) {
  const generatedId = useId()
  const inputId = id || generatedId

  // Internal value management
  const [internalValue, setInternalValue] = useState(value !== undefined ? (value || '') : (defaultValue || ''))
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value || '')
    }
  }, [value])

  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Current view date in picker
  const initialDate = internalValue ? new Date(internalValue) : new Date()
  const [viewYear, setViewYear] = useState(!isNaN(initialDate.getTime()) ? initialDate.getFullYear() : new Date().getFullYear())
  const [viewMonth, setViewMonth] = useState(!isNaN(initialDate.getTime()) ? initialDate.getMonth() : new Date().getMonth())

  // Keep view sync when internalValue changes externally
  useEffect(() => {
    if (internalValue) {
      const d = new Date(internalValue)
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear())
        setViewMonth(d.getMonth())
      }
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

  const handleSelectDate = (year, month, day) => {
    const isoString = toIsoDate(year, month, day)
    setInternalValue(isoString)
    setIsOpen(false)

    if (onChange) {
      // Simulate standard event object for React forms
      const syntheticEvent = {
        target: { name, id: inputId, value: isoString },
        currentTarget: { name, id: inputId, value: isoString },
        preventDefault: () => {},
        stopPropagation: () => {},
      }
      onChange(syntheticEvent)
    }
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

  const handlePrevMonth = (e) => {
    e.stopPropagation()
    if (viewMonth === 0) {
      setViewMonth(11)
      setViewYear((y) => y - 1)
    } else {
      setViewMonth((m) => m - 1)
    }
  }

  const handleNextMonth = (e) => {
    e.stopPropagation()
    if (viewMonth === 11) {
      setViewMonth(0)
      setViewYear((y) => y + 1)
    } else {
      setViewMonth((m) => m + 1)
    }
  }

  const handleToday = (e) => {
    e.stopPropagation()
    const today = new Date()
    handleSelectDate(today.getFullYear(), today.getMonth(), today.getDate())
  }

  // Calculate calendar days for viewMonth and viewYear
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay() // 0 = Sun

  const days = []
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i)
  }

  // Parse min/max
  const minDate = min ? new Date(min) : null
  const maxDate = max ? new Date(max) : null

  return (
    <div ref={containerRef} className={cn('relative inline-block w-full', className)}>
      {/* Hidden input for form submission compatibility */}
      <input
        type="hidden"
        name={name}
        id={inputId}
        value={internalValue}
        required={required}
        ref={ref}
      />

      {/* Visual Interactive Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled && !readOnly) setIsOpen(!isOpen)
        }}
        className={cn(
          'group flex min-h-[42px] w-full items-center justify-between rounded-xl border bg-white px-3.5 text-left text-xs sm:text-sm font-semibold transition-all duration-200 outline-none',
          'dark:bg-[#111827] dark:text-slate-100',
          isError
            ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            : 'border-slate-200/80 hover:border-emerald-500/60 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 dark:border-slate-800 dark:hover:border-emerald-500/50 dark:focus:border-emerald-500',
          disabled && 'cursor-not-allowed opacity-50 bg-slate-50 dark:bg-slate-900',
          inputClassName
        )}
        {...props}
      >
        <div className="flex flex-1 min-w-0 items-center gap-2.5">
          <CalendarIcon
            className={cn(
              'h-4 w-4 shrink-0 transition-colors',
              internalValue ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 group-hover:text-emerald-600'
            )}
          />
          <span className={cn('truncate select-none font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100', !internalValue && 'text-slate-400 dark:text-slate-500 font-normal')}>
            {internalValue ? formatDisplayDate(internalValue, showDayName) : placeholder}
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
              className="rounded-md p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              title="Hapus tanggal"
            >
              <X className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
      </button>

      {/* Floating Popover Calendar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={cn(
              'absolute left-0 z-[100] mt-1.5 w-72 rounded-xl border border-emerald-500/30 bg-white p-3.5 shadow-2xl shadow-emerald-950/15 backdrop-blur-md',
              'dark:border-emerald-800/60 dark:bg-[#131D2E] dark:shadow-black/40',
              popoverClassName
            )}
          >
            {/* Calendar Header */}
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                title="Bulan sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <div className="text-center font-bold text-xs text-slate-900 dark:text-white">
                <span>{MONTH_NAMES_ID[viewMonth]}</span>{' '}
                <span className="text-emerald-600 dark:text-emerald-400">{viewYear}</span>
              </div>

              <button
                type="button"
                onClick={handleNextMonth}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors dark:border-slate-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-400"
                title="Bulan berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {DAY_NAMES_ID.map((day, idx) => (
                <span
                  key={day}
                  className={cn(
                    'text-[10px] font-bold uppercase tracking-wider',
                    idx === 0 ? 'text-rose-500 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'
                  )}
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Empty leading slots */}
              {Array.from({ length: firstDayIndex }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-8 w-8" />
              ))}

              {/* Month days */}
              {days.map((day) => {
                const dayDate = new Date(viewYear, viewMonth, day)
                const isSelected = internalValue === toIsoDate(viewYear, viewMonth, day)
                const isToday =
                  day === new Date().getDate() &&
                  viewMonth === new Date().getMonth() &&
                  viewYear === new Date().getFullYear()

                let isDisabled = false
                if (minDate && dayDate < new Date(minDate.setHours(0, 0, 0, 0))) isDisabled = true
                if (maxDate && dayDate > new Date(maxDate.setHours(23, 59, 59, 999))) isDisabled = true

                return (
                  <button
                    key={day}
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleSelectDate(viewYear, viewMonth, day)}
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-xl text-xs font-semibold transition-all',
                      isSelected
                        ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white font-bold shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50'
                        : isToday
                        ? 'border border-emerald-500 text-emerald-600 font-bold dark:text-emerald-400'
                        : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300',
                      isDisabled && 'opacity-25 cursor-not-allowed hover:bg-transparent hover:text-inherit'
                    )}
                  >
                    {day}
                  </button>
                )
              })}
            </div>

            {/* Footer quick action buttons */}
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
              <button
                type="button"
                onClick={handleToday}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                Tutup
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

DatePicker.propTypes = {
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  onChange: PropTypes.func,
  name: PropTypes.string,
  id: PropTypes.string,
  placeholder: PropTypes.string,
  min: PropTypes.string,
  max: PropTypes.string,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  required: PropTypes.bool,
  isClearable: PropTypes.bool,
  isError: PropTypes.bool,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  popoverClassName: PropTypes.string,
}

export default DatePicker
