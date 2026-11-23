import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * Standardized Education Unit Category Colors matching the Master Design System
 * TKIT: Deep Pine Green (#065f46)
 * TAUD: Dark Forest Green (#047857)
 * SDIT: Electric Blue (#2563eb)
 * MIT: Vivid Amber/Orange (#f59e0b)
 * SMPIT: Vivid Cyan/Sky Blue (#0284c7)
 * SMAIT: Vibrant Purple (#9333ea)
 * PONPES: Deep Hunter Green (#064e3b)
 * MAHAD: Dark Slate/Navy (#334155)
 */
export const UNIT_CATEGORY_MAP = {
  TKIT: { bg: 'bg-[#065f46]', text: 'text-white', border: 'border-[#065f46]', label: 'TKIT' },
  TAUD: { bg: 'bg-[#047857]', text: 'text-white', border: 'border-[#047857]', label: 'TAUD' },
  SDIT: { bg: 'bg-[#2563eb]', text: 'text-white', border: 'border-[#2563eb]', label: 'SDIT' },
  MIT: { bg: 'bg-[#f59e0b]', text: 'text-white', border: 'border-[#f59e0b]', label: 'MIT' },
  SMPIT: { bg: 'bg-[#0284c7]', text: 'text-white', border: 'border-[#0284c7]', label: 'SMPIT' },
  SMAIT: { bg: 'bg-[#9333ea]', text: 'text-white', border: 'border-[#9333ea]', label: 'SMAIT' },
  PONPES: { bg: 'bg-[#064e3b]', text: 'text-white', border: 'border-[#064e3b]', label: 'PONPES' },
  PESANTREN: { bg: 'bg-[#064e3b]', text: 'text-white', border: 'border-[#064e3b]', label: 'PONPES' },
  MAHAD: { bg: 'bg-[#334155]', text: 'text-white', border: 'border-[#334155]', label: 'MAHAD' },
  Mahad: { bg: 'bg-[#334155]', text: 'text-white', border: 'border-[#334155]', label: 'MAHAD' },
}

export function getEducationUnitCategoryStyle(unitType) {
  if (!unitType) return { bg: 'bg-slate-700', text: 'text-white', border: 'border-slate-800', label: '—' }
  const clean = String(unitType).trim().toUpperCase()
  for (const key of Object.keys(UNIT_CATEGORY_MAP)) {
    if (clean.includes(key.toUpperCase())) {
      return UNIT_CATEGORY_MAP[key]
    }
  }
  return { bg: 'bg-emerald-800', text: 'text-white', border: 'border-emerald-900', label: unitType }
}

/**
 * EducationUnitBadge - Canonical badge for school levels/categories
 */
export function EducationUnitBadge({ unitType, className = '' }) {
  const style = getEducationUnitCategoryStyle(unitType)
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-3 py-1 text-xs font-black shadow-2xs tracking-wider uppercase select-none transition-transform active:scale-95',
        style.bg,
        style.text,
        className
      )}
    >
      {style.label || unitType || '—'}
    </span>
  )
}

/**
 * ProgramTypeBadge - Canonical badge for Fullday (16:00) / Boarding (21:00)
 */
export function ProgramTypeBadge({ programType, jamPulang, className = '' }) {
  const isBoarding = String(programType || '').trim().toLowerCase() === 'boarding'
  const timeStr = isBoarding ? '(21:00)' : jamPulang ? `(${jamPulang})` : '(16:00)'

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-700 bg-emerald-50/90 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-2xs select-none',
        className
      )}
    >
      {isBoarding ? (
        <Moon className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.2} />
      ) : (
        <Sun className="size-3 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={2.2} />
      )}
      <span>{isBoarding ? 'Boarding' : 'Fullday'}</span>
      <span className="opacity-80 font-semibold">{timeStr}</span>
    </span>
  )
}

/**
 * EducationUnitWithProgramCell - Combined column cell for datatables
 */
export default function EducationUnitWithProgramCell({ unitType, programType, jamPulang, className = '' }) {
  return (
    <div className={cn('flex flex-col gap-1 items-start', className)}>
      <EducationUnitBadge unitType={unitType} />
      <ProgramTypeBadge programType={programType} jamPulang={jamPulang} />
    </div>
  )
}

