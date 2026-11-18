import React from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { RefreshCw } from 'lucide-react'
import { AppButton, AppFilterBar } from '../app'

export default function DashboardFilter({
  units = [],
  selectedUnit = 'all',
  onUnitChange,
  academicYears = [],
  selectedAcademicYear = '',
  onAcademicYearChange,
  semesters = [],
  selectedSemester = '',
  onSemesterChange,
  onReset,
  extraFilters
}) {
  const hasFilters = units.length > 0 || academicYears.length > 0 || semesters.length > 0 || Boolean(extraFilters)

  if (!hasFilters) return null

  return (
    <AppFilterBar label="Filter Data" className="justify-between">
      <div className="flex flex-wrap items-center gap-3">

        {units.length > 0 && (
          <CustomSelect
            value={selectedUnit}
            onChange={(e) => onUnitChange?.(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-medium text-slate-700 outline-hidden focus:border-[#0E5C44] focus:ring-1 focus:ring-[#0E5C44] dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="all">Semua Unit Pendidikan</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.nama}
              </option>
            ))}
          </CustomSelect>
        )}

        {academicYears.length > 0 && (
          <CustomSelect
            value={selectedAcademicYear}
            onChange={(e) => onAcademicYearChange?.(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-medium text-slate-700 outline-hidden focus:border-[#0E5C44] focus:ring-1 focus:ring-[#0E5C44] dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">Tahun Ajaran Aktif</option>
            {academicYears.map((ay) => (
              <option key={ay.id} value={ay.id}>
                {ay.year_name || ay.nama || ay.tahun}
              </option>
            ))}
          </CustomSelect>
        )}

        {semesters.length > 0 && (
          <CustomSelect
            value={selectedSemester}
            onChange={(e) => onSemesterChange?.(e.target.value)}
            className="h-9 rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-xs font-medium text-slate-700 outline-hidden focus:border-[#0E5C44] focus:ring-1 focus:ring-[#0E5C44] dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">Semester Aktif</option>
            {semesters.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.nama}
              </option>
            ))}
          </CustomSelect>
        )}

        {extraFilters}
      </div>

      {onReset && (
        <AppButton
          type="button"
          variant="ghost"
          size="sm"
          icon={RefreshCw}
          onClick={onReset}
          className="shrink-0"
        >
          Reset Filter
        </AppButton>
      )}
    </AppFilterBar>
  )
}
