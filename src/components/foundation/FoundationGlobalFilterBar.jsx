import React, { useState, useEffect } from 'react'
import { Filter, RotateCcw, Check, ChevronDown, Calendar, Building2, MapPin, Tag } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'
import { educationUnitService } from '../../services/educationUnitService'
import { tahunAjaranService } from '../../services/tahunAjaranService'
import HeroUiFilterSelect from '../ui/HeroUiFilterSelect'

export function FoundationGlobalFilterBar({ onFilterChange }) {
 const [searchParams, setSearchParams] = useSearchParams()

 const [academicYear, setAcademicYear] = useState(searchParams.get('academic_year_id') || 'all')
 const [semester, setSemester] = useState(searchParams.get('semester') || 'Ganjil')
 const [unit, setUnit] = useState(searchParams.get('unit_id') || 'all')
 const [jenisUnit, setJenisUnit] = useState(searchParams.get('jenis_unit') || 'all')
 const [lokasi, setLokasi] = useState(searchParams.get('lokasi') || 'all')
 const [period, setPeriod] = useState(searchParams.get('period') || 'year')

 const [unitOptions, setUnitOptions] = useState([])
 const [academicYearOptions, setAcademicYearOptions] = useState([])

 useEffect(() => {
 educationUnitService.getDaftar().then((res) => {
 const data = res?.data?.data || res?.data || []
 setUnitOptions(Array.isArray(data) ? data : [])
 }).catch(() => {})

 tahunAjaranService.getDaftar().then((res) => {
 const data = res?.data?.data || res?.data || []
 setAcademicYearOptions(Array.isArray(data) ? data : [])
 }).catch(() => {})
 }, [])

 const handleApply = () => {
 const params = new URLSearchParams()
 if (academicYear !== 'all') params.set('academic_year_id', academicYear)
 if (semester !== 'Ganjil') params.set('semester', semester)
 if (unit !== 'all') params.set('unit_id', unit)
 if (jenisUnit !== 'all') params.set('jenis_unit', jenisUnit)
 if (lokasi !== 'all') params.set('lokasi', lokasi)
 if (period !== 'year') params.set('period', period)

 setSearchParams(params)
 if (onFilterChange) {
 onFilterChange({ academicYear, semester, unit, jenisUnit, lokasi, period })
 }
 }

 const handleReset = () => {
 setAcademicYear('all')
 setSemester('Ganjil')
 setUnit('all')
 setJenisUnit('all')
 setLokasi('all')
 setPeriod('year')
 setSearchParams(new URLSearchParams())
 if (onFilterChange) {
 onFilterChange({
 academicYear: 'all',
 semester: 'Ganjil',
 unit: 'all',
 jenisUnit: 'all',
 lokasi: 'all',
 period: 'year',
 })
 }
 }

 return (
 <div className="rounded-xl rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-4 shadow-md shadow-emerald-500/10 dark:bg-card-dark">
 <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-emerald-500/20 dark:border-emerald-800/40">
 <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-white">
 <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <span>Filter Global Dashboard</span>
 </div>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={handleApply}
 className="flex items-center gap-1 rounded-xl bg-[#059669] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#0a4533]"
 >
 <Check className="h-3.5 w-3.5" />
 Terapkan
 </button>
 <button
 type="button"
 onClick={handleReset}
 className="flex items-center gap-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 px-3 py-1.5 text-xs font-semibold text-emerald-800 transition hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-300"
 >
 <RotateCcw className="h-3.5 w-3.5" />
 Reset
 </button>
 </div>
 </div>

 <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
 <div>
 <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Tahun Ajaran</label>
 <HeroUiFilterSelect
 size="sm"
 value={String(academicYear)}
 onChange={setAcademicYear}
 ariaLabel="Tahun Ajaran"
 options={[
 { value: 'all', label: 'Semua Tahun' },
 ...academicYearOptions.map((ay) => ({
 value: String(ay.id),
 label: ay.nama || ay.tahun_ajaran,
 })),
 ]}
 />
 </div>

 <div>
 <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Semester</label>
 <HeroUiFilterSelect
 size="sm"
 value={semester}
 onChange={setSemester}
 ariaLabel="Semester"
 options={[
 { value: 'Ganjil', label: 'Ganjil' },
 { value: 'Genap', label: 'Genap' },
 ]}
 />
 </div>

 <div>
 <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Unit Pendidikan</label>
 <HeroUiFilterSelect
 size="sm"
 value={String(unit)}
 onChange={setUnit}
 ariaLabel="Unit Pendidikan"
 options={[
 { value: 'all', label: 'Semua Unit' },
 ...unitOptions.map((u) => ({
 value: String(u.id),
 label: u.nama || u.nama_unit,
 })),
 ]}
 />
 </div>

 <div>
 <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Jenis Unit</label>
 <HeroUiFilterSelect
 size="sm"
 value={jenisUnit}
 onChange={setJenisUnit}
 ariaLabel="Jenis Unit"
 options={[{ value: 'all', label: 'Semua Jenjang' }]}
 />
 </div>

 <div>
 <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Lokasi</label>
 <HeroUiFilterSelect
 size="sm"
 value={lokasi}
 onChange={setLokasi}
 ariaLabel="Lokasi"
 options={[{ value: 'all', label: 'Semua Lokasi' }]}
 />
 </div>

 <div>
 <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Periode</label>
 <HeroUiFilterSelect
 size="sm"
 value={period}
 onChange={setPeriod}
 ariaLabel="Periode"
 options={[
 { value: 'year', label: 'Tahun Ini' },
 { value: 'semester', label: 'Semester Ini' },
 { value: 'month', label: 'Bulan Ini' },
 ]}
 />
 </div>
 </div>

 <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-emerald-500/20 dark:border-emerald-800/40 text-xs">
 <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
 <Calendar className="h-3 w-3" /> TA {academicYear} ({semester})
 </span>
 <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 <Building2 className="h-3 w-3" /> {unit === 'all' ? 'Semua Unit' : unit}
 </span>
 <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 <Tag className="h-3 w-3" /> {jenisUnit === 'all' ? 'Semua Jenjang' : jenisUnit}
 </span>
 <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 <MapPin className="h-3 w-3" /> {lokasi === 'all' ? 'Semua Lokasi' : lokasi}
 </span>
 </div>
 </div>
 )
}
