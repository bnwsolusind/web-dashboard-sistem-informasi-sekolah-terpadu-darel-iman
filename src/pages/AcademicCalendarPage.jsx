import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HeroUiHeader } from '../components/ui/HeroUiHeader'
import { cn } from '../lib/utils'
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Plus,
  RefreshCw,
  Clock,
  Tag,
  Search,
  Edit2,
  Trash2,
  Building,
  Users,
  Palette,
  ExternalLink,
  Filter,
  Sparkles,
  X
} from 'lucide-react'

import PageContainer from '../components/app/PageContainer'
import AppModal from '../components/app/AppModal'
import { PageToolbarActions } from '../components/app'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  Button
} from '@/components/ui/button'
import {
  DatePicker
} from '@/components/ui/date-picker'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import {
  useAuthStore
} from '../stores/authStore'
import {
  academicCalendarService
} from '../services/academicCalendarService'
import {
  tahunAjaranService
} from '../services/tahunAjaranService'
import {
  usePengaturanStore,
  resolveFoundationName
} from '../stores/pengaturanStore'
import {
  PRESET_CATEGORIES,
  COLOR_PALETTE,
  MODULE_LINK_OPTIONS,
  AUDIENCE_OPTIONS
} from '../components/calendar/calendarConstants'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  useToast
} from '../components/app/ToastProvider'

// Helper format tanggal lokal (WIB/Local) tanpa offset UTC
const formatLocalDate = (dateObj = new Date()) => {
 if (!dateObj) return ''
 const d = typeof dateObj === 'string' ? new Date(dateObj) : dateObj
 if (isNaN(d.getTime())) return ''
 const year = d.getFullYear()
 const month = String(d.getMonth() + 1).padStart(2, '0')
 const day = String(d.getDate()).padStart(2, '0')
 return `${year}-${month}-${day}`
}

// Format rentang tanggal ramah pengguna (misal: 10 Juli 2026 atau 10 - 15 Juli 2026)
const formatDateRange = (startStr, endStr) => {
 if (!startStr) return '-'
 try {
 const start = new Date(startStr)
 const startFmt = new Intl.DateTimeFormat('id-ID', {
 day: 'numeric',
 month: 'short',
 year: 'numeric',
 }).format(start)

 if (!endStr || endStr === startStr) return startFmt

 const end = new Date(endStr)
 const endFmt = new Intl.DateTimeFormat('id-ID', {
 day: 'numeric',
 month: 'short',
 year: 'numeric',
 }).format(end)

 return `${startFmt} s/d ${endFmt}`
 } catch {
 return startStr
 }
}

export default function AcademicCalendarPage() {
 const toast = useToast()
 const user = useAuthStore((state) => state.user)
 const pengaturan = usePengaturanStore((state) => state.pengaturan)
 const foundationName = resolveFoundationName(pengaturan)
 const permissions = useAuthStore((state) => state.user?.permissions || [])
 const canManage =
 permissions.includes('*') ||
 permissions.includes('academic.calendar.manage') ||
 permissions.includes('academic.manage') ||
 permissions.includes('sistem.master_data')

 const [currentDate, setCurrentDate] = useState(new Date())
 const [events, setEvents] = useState([])
 const [loading, setLoading] = useState(false)
 const [units, setUnits] = useState([])
 const [activeAcademicYear, setActiveAcademicYear] = useState('')
 const [selectedUnit, setSelectedUnit] = useState('ALL')
 const [selectedCategory, setSelectedCategory] = useState('ALL')
 const [searchTerm, setSearchTerm] = useState('')
 const debouncedSearch = useDebounce(searchTerm, 350)
 const [selectedDateEvents, setSelectedDateEvents] = useState(null)

 // Event Form Modal State
 const [isFormOpen, setIsFormOpen] = useState(false)
 const [editingEvent, setEditingEvent] = useState(null)
 const [deleteEventItem, setDeleteEventItem] = useState(null)
 const [isDeleting, setIsDeleting] = useState(false)
 const [isSubmitting, setIsSubmitting] = useState(false)

 const [formData, setFormData] = useState({
 title: '',
 notes: '',
 category: 'mulai_kbm',
 customCategoryLabel: '',
 unit: 'Semua Unit',
 startDate: formatLocalDate(new Date()),
 endDate: formatLocalDate(new Date()),
 color: 'emerald',
 audience: 'Semua Civitas',
 targetModule: '',
 })

 const currentYear = currentDate.getFullYear()
 const currentMonth = currentDate.getMonth()

 // Nama Bulan Dinamis Lokal
 const currentMonthLabel = useMemo(() => {
 return new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(
 new Date(currentYear, currentMonth, 1)
 )
 }, [currentYear, currentMonth])

 // Muat Tahun Ajaran Aktif Secara Dinamis
 useEffect(() => {
 let isMounted = true
 tahunAjaranService
 .getDaftar()
 .then((res) => {
 if (!isMounted) return
 const list = res?.data?.data || res?.data || []
 if (Array.isArray(list) && list.length > 0) {
 const active = list.find((y) => y.is_active || y.status === 'Aktif') || list[0]
 const yearName = active.nama || active.name || active.tahun_ajaran
 if (yearName) {
 setActiveAcademicYear(yearName)
 return
 }
 }
 // Fallback dinamis berdasarkan kalender berjalan jika API belum ada
 const dynamicFallback =
 currentMonth >= 6
 ? `${currentYear}/${currentYear + 1}`
 : `${currentYear - 1}/${currentYear}`
 setActiveAcademicYear(dynamicFallback)
 })
 .catch(() => {
 if (!isMounted) return
 const dynamicFallback =
 currentMonth >= 6
 ? `${currentYear}/${currentYear + 1}`
 : `${currentYear - 1}/${currentYear}`
 setActiveAcademicYear(dynamicFallback)
 })

 return () => {
 isMounted = false
 }
 }, [currentYear, currentMonth])

 // Muat Unit Pendidikan Resmi dari Database
 useEffect(() => {
 let isMounted = true
 academicCalendarService
 .getEducationUnits()
 .then((res) => {
 if (isMounted && Array.isArray(res)) {
 setUnits(res)
 }
 })
 .catch(() => {
 if (isMounted) {
 setUnits([{ value: 'Semua Unit', label: `Semua Unit (${foundationName})` }])
 }
 })

 return () => {
 isMounted = false
 }
 }, [])

 // Muat Agenda Kalender Akademik & Normalisasi Kontrak Data
 const loadEvents = useCallback(async () => {
 setLoading(true)
 try {
 const data = await academicCalendarService.getEvents({
 year: currentYear,
 month: currentMonth + 1,
 })

 const rawList = Array.isArray(data) ? data : data?.data || []
 const normalized = rawList.map((item) => {
 const cat = item.category || 'mulai_kbm'
 const defColor = PRESET_CATEGORIES[cat]?.defaultColor || 'emerald'
 const start =
 item.startDate ||
 item.start_date ||
 (item.calendar_date ? String(item.calendar_date).split('T')[0] : '')
 const end = item.endDate || item.end_date || start

 return {
 id: item.id || `evt-${Date.now()}-${Math.random()}`,
 title: item.title || 'Agenda Tanpa Judul',
 notes: item.notes || item.description || item.content || '',
 category: cat,
 customCategoryLabel: item.customCategoryLabel || item.custom_category || '',
 unit: item.unit || item.education_unit || 'Semua Unit',
 startDate: start ? String(start).split('T')[0] : '',
 endDate: end ? String(end).split('T')[0] : '',
 color: item.color || defColor,
 audience: item.audience || 'Semua Civitas',
 targetModule:
 item.targetModule ||
 item.target_url ||
 PRESET_CATEGORIES[cat]?.defaultModule ||
 '',
 }
 })

 setEvents(normalized)
 } catch {
 toast.error('Gagal memuat agenda kalender akademik.')
 } finally {
 setLoading(false)
 }
 }, [currentYear, currentMonth])

 useEffect(() => {
 loadEvents()
 }, [loadEvents])

 const handlePrevMonth = () => {
 setCurrentDate(new Date(currentYear, currentMonth - 1, 1))
 setSelectedDateEvents(null)
 }

 const handleNextMonth = () => {
 setCurrentDate(new Date(currentYear, currentMonth + 1, 1))
 setSelectedDateEvents(null)
 }

 const handleToday = () => {
 setCurrentDate(new Date())
 setSelectedDateEvents(null)
 }

 // Filter Agenda Berdasarkan Kategori, Satuan Pendidikan, dan Pencarian Ter-debounce
 const filteredEvents = useMemo(() => {
 return events.filter((ev) => {
 const matchCat = selectedCategory === 'ALL' || ev.category === selectedCategory
 const matchUnit =
 selectedUnit === 'ALL' || ev.unit === 'Semua Unit' || ev.unit === selectedUnit
 const matchSearch =
 !debouncedSearch ||
 (ev.title && ev.title.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
 (ev.notes && ev.notes.toLowerCase().includes(debouncedSearch.toLowerCase())) ||
 (ev.customCategoryLabel &&
 ev.customCategoryLabel.toLowerCase().includes(debouncedSearch.toLowerCase()))
 return matchCat && matchUnit && matchSearch
 })
 }, [events, selectedCategory, selectedUnit, debouncedSearch])

 // Perhitungan Kotak Hari Kalender
 const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
 const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay() // 0 = Ahad

 const daysArray = useMemo(() => {
 const arr = []
 for (let i = 0; i < firstDayIndex; i++) {
 arr.push({ empty: true, day: null })
 }
 for (let d = 1; d <= daysInMonth; d++) {
 const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(
 d
 ).padStart(2, '0')}`
 const dayEvents = filteredEvents.filter((e) => {
 const start = e.startDate
 const end = e.endDate || start
 return dateStr >= start && dateStr <= end
 })
 arr.push({ empty: false, day: d, dateStr, events: dayEvents })
 }
 return arr
 }, [currentYear, currentMonth, daysInMonth, firstDayIndex, filteredEvents])

 const handleOpenCreate = (prefilledDate = null) => {
 const targetDate = prefilledDate || formatLocalDate(new Date())
 setEditingEvent(null)
 setFormData({
 title: '',
 notes: '',
 category: 'mulai_kbm',
 customCategoryLabel: '',
 unit: selectedUnit !== 'ALL' ? selectedUnit : 'Semua Unit',
 startDate: targetDate,
 endDate: targetDate,
 color: PRESET_CATEGORIES.mulai_kbm?.defaultColor || 'emerald',
 audience: 'Semua Civitas',
 targetModule: PRESET_CATEGORIES.mulai_kbm?.defaultModule || '',
 })
 setIsFormOpen(true)
 }

 const handleOpenEdit = (event) => {
 setEditingEvent(event)
 setFormData({
 title: event.title || '',
 notes: event.notes || '',
 category: event.category || 'mulai_kbm',
 customCategoryLabel: event.customCategoryLabel || '',
 unit: event.unit || 'Semua Unit',
 startDate: event.startDate || formatLocalDate(new Date()),
 endDate: event.endDate || event.startDate || formatLocalDate(new Date()),
 color: event.color || PRESET_CATEGORIES[event.category]?.defaultColor || 'emerald',
 audience: event.audience || 'Semua Civitas',
 targetModule: event.targetModule || '',
 })
 setIsFormOpen(true)
 }

 const handleCategoryChange = (newCat) => {
 const preset = PRESET_CATEGORIES[newCat]
 setFormData((prev) => ({
 ...prev,
 category: newCat,
 color: preset?.defaultColor || prev.color,
 targetModule: preset?.defaultModule ?? prev.targetModule,
 }))
 }

 const handleDeleteEvent = (event) => {
 setDeleteEventItem(event)
 }

 const confirmDeleteEvent = async () => {
 if (!deleteEventItem) return
 setIsDeleting(true)
 try {
 await academicCalendarService.hapusEvent(deleteEventItem.id)
 toast.success('Agenda kalender berhasil dihapus.')
 loadEvents()
 if (selectedDateEvents) {
 setSelectedDateEvents((prev) =>
 prev
 ? { ...prev, events: prev.events.filter((e) => e.id !== deleteEventItem.id) }
 : null
 )
 }
 setDeleteEventItem(null)
 } catch {
 toast.error('Gagal menghapus agenda kalender.')
 } finally {
 setIsDeleting(false)
 }
 }

 const handleSubmit = async (e) => {
 e.preventDefault()
 if (!formData.title.trim()) {
 toast.error('Judul agenda wajib diisi.')
 return
 }

 if (formData.endDate < formData.startDate) {
 toast.error('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.')
 return
 }

 setIsSubmitting(true)
 try {
 const payload = {
 ...(editingEvent ? { id: editingEvent.id } : {}),
 title: formData.title.trim(),
 notes: formData.notes.trim(),
 category: formData.category,
 customCategoryLabel:
 formData.category === 'custom' ? formData.customCategoryLabel.trim() : '',
 unit: formData.unit,
 startDate: formData.startDate,
 endDate: formData.endDate,
 color: formData.color,
 audience: formData.audience,
 targetModule: formData.targetModule,
 }

 await academicCalendarService.simpanEvent(payload)
 toast.success(
 editingEvent
 ? 'Agenda kalender berhasil diperbarui.'
 : 'Agenda kalender baru berhasil ditambahkan.'
 )
 setIsFormOpen(false)
 loadEvents()
 } catch {
 toast.error('Gagal menyimpan agenda kalender.')
 } finally {
 setIsSubmitting(false)
 }
 }

 const todayStr = formatLocalDate(new Date())

 return (
 <PageContainer>
 <div className="space-y-6 pb-12">
 {/* Breadcrumb Terintegrasi */}
 <AppBreadcrumb
 items={[
 { label: 'Dashboard', href: '/dashboard' },
 { label: 'Master Akademik', href: '/dashboard/master-tahun-ajaran' },
 { label: 'Kalender Akademik' },
 ]}
 />

 {/* HeroUI Modern Hero Header dengan Tahun Ajaran Dinamis */}
      <HeroUiHeader
        title="Kalender Akademik Terpadu"
        subtitle="Jadwal KBM, Ujian, Libur Nasional, Pembagian Rapor, dan Kegiatan Satuan Pendidikan"
        icon={CalendarDays}
        roleTag={activeAcademicYear ? `Tahun Ajaran ${activeAcademicYear}` : 'Kalender Terpadu'}
        theme="emerald"
        actions={
          <PageToolbarActions
            onRefresh={loadEvents}
            refreshLabel="Segarkan Agenda Kalender"
            onAdd={canManage ? () => handleOpenCreate() : undefined}
            addLabel="Tambah Agenda Baru"
          />
        }
      />

      {/* Toolbar & Filters (Navigator Bulan, Filter Satuan Pendidikan, Kategori, Search) */}
 <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-sm">
 {/* Month / Year Navigator */}
 <div className="flex items-center gap-2">
 <Button
 variant="ghost"
 size="sm"
 iconOnly
 onClick={handlePrevMonth}
 aria-label="Bulan Sebelumnya"
 >
 <ChevronLeft className="h-4 w-4" />
 </Button>
 <div className="px-3 py-1 font-black text-base text-slate-800 dark:text-white min-w-[170px] text-center">
 {currentMonthLabel} {currentYear}
 </div>
 <Button
 variant="ghost"
 size="sm"
 iconOnly
 onClick={handleNextMonth}
 aria-label="Bulan Selanjutnya"
 >
 <ChevronRight className="h-4 w-4" />
 </Button>
 <Button
 variant="ghost"
 size="xs"
 onClick={handleToday}
 className="ml-1 font-bold text-emerald-600 hover:text-emerald-700"
 >
 Hari Ini
 </Button>
 </div>

 {/* Filters: Satuan Pendidikan, Kategori, & Search Ter-debounce */}
 <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-wrap">
 {/* Filter Satuan Pendidikan */}
 <HeroUiFilterSelect
 value={selectedUnit}
 onChange={(val) => setSelectedUnit(val)}
 options={[
 { value: 'ALL', label: 'Semua Satuan Unit' },
 ...units.map((u) => ({ value: u.value, label: u.label })),
 ]}
 placeholder="Pilih Satuan Unit"
 icon={Building}
 ariaLabel="Pilih Satuan Pendidikan"
 size="sm"
 searchable
 className="w-full sm:w-auto min-w-[170px]"
 />

 {/* Filter Kategori */}
 <HeroUiFilterSelect
 value={selectedCategory}
 onChange={(val) => setSelectedCategory(val)}
 options={[
 { value: 'ALL', label: 'Semua Kategori' },
 ...Object.entries(PRESET_CATEGORIES).map(([catKey, catVal]) => ({
 value: catKey,
 label: catVal.label,
 })),
 ]}
 placeholder="Pilih Kategori Agenda"
 icon={Filter}
 ariaLabel="Pilih Kategori Agenda"
 size="sm"
 searchable
 className="w-full sm:w-auto min-w-[160px]"
 />

 {/* Search Input Ter-debounce */}
 <div className="relative w-full sm:w-52">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 placeholder="Cari agenda kegiatan..."
 value={searchTerm}
 onChange={(e) => setSearchTerm(e.target.value)}
 className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>
 </div>
 </div>

 {/* Main Calendar View & Sidebar Detail */}
 <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
 {/* Calendar Grid (3 Kolom Utama) */}
 <div className="lg:col-span-3 bg-white dark:bg-[#1B2433] rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-md p-4 sm:p-5 overflow-hidden">
 {/* Header Nama Hari */}
 <div className="grid grid-cols-7 gap-2 text-center pb-3 border-b border-emerald-200/80 dark:border-emerald-700/80">
 {['Ahad', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((d, i) => (
 <div
 key={d}
 className={`text-xs font-black uppercase tracking-wider ${i === 0 || i === 5 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-400'
 }`}
 >
 {d}
 </div>
 ))}
 </div>

 {/* Grid Kotak Tanggal */}
 <div className="grid grid-cols-7 gap-2 pt-3 auto-rows-fr">
 {daysArray.map((cell, idx) => {
 if (cell.empty) {
 return (
 <div
 key={`empty-${idx}`}
 className="min-h-[92px] rounded-xl bg-slate-50/50 dark:bg-slate-900/30"
 />
 )
 }

 const isToday = cell.dateStr === todayStr
 const isSelected = selectedDateEvents?.dateStr === cell.dateStr

 return (
 <div
 key={cell.dateStr}
 onClick={() => setSelectedDateEvents(cell)}
 className={`min-h-[92px] p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${isSelected
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/40 shadow-sm'
 : isToday
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/20 dark:border-emerald-800/60'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900/50 hover:border-emerald-300 dark:hover:border-emerald-700/80'
 }`}
 >
 <div className="flex items-center justify-between">
 <span
 className={`text-xs font-extrabold ${isToday
 ? 'px-1.5 py-0.5 rounded-md bg-emerald-600 text-white'
 : 'text-slate-700 dark:text-slate-300'
 }`}
 >
 {cell.day}
 </span>
 {canManage && (
 <button
 onClick={(e) => {
 e.stopPropagation()
 handleOpenCreate(cell.dateStr)
 }}
 className="opacity-0 hover:opacity-100 p-0.5 rounded text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-950 transition-opacity"
 title="Tambah agenda pada tanggal ini"
 >
 <Plus className="h-3.5 w-3.5" />
 </button>
 )}
 </div>

 {/* Chip Agenda dengan Warna Dinamis Berbasis Palette */}
 <div className="mt-1 space-y-1 overflow-y-auto max-h-16">
 {cell.events.slice(0, 2).map((ev) => {
 const palette =
 COLOR_PALETTE[ev.color] ||
 COLOR_PALETTE[PRESET_CATEGORIES[ev.category]?.defaultColor] ||
 COLOR_PALETTE.emerald

 return (
 <div
 key={ev.id}
 className={`truncate text-[10px] font-bold px-1.5 py-0.5 rounded border ${palette.badgeBg}`}
 title={`${ev.title} (${ev.unit})`}
 >
 {ev.title}
 </div>
 )
 })}
 {cell.events.length > 2 && (
 <div className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 pl-1">
 +{cell.events.length - 2} agenda lagi
 </div>
 )}
 </div>
 </div>
 )
 })}
 </div>
 </div>

 {/* Agenda & Date Detail Sidebar (1 Kolom Samping) */}
 <div className="space-y-4">
 <div className="bg-white dark:bg-[#1B2433] rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 shadow-md p-5">
 <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80 dark:border-emerald-700/80">
 <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
 <Clock className="h-4 w-4 text-emerald-600" />
 {selectedDateEvents
 ? `Agenda ${formatDateRange(selectedDateEvents.dateStr)}`
 : 'Agenda Terdekat'}
 </h2>
 {selectedDateEvents && (
 <button
 onClick={() => setSelectedDateEvents(null)}
 className="text-xs font-bold text-slate-400 hover:text-emerald-600 transition-colors"
 >
 Tampilkan Semua
 </button>
 )}
 </div>

 <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto pr-1">
 {(selectedDateEvents ? selectedDateEvents.events : filteredEvents).length === 0 ? (
 <div className="py-8 text-center text-xs text-slate-400 font-medium">
 Tidak ada agenda kegiatan pada periode yang dipilih.
 </div>
 ) : (
 (selectedDateEvents ? selectedDateEvents.events : filteredEvents).map((ev) => {
 const palette =
 COLOR_PALETTE[ev.color] ||
 COLOR_PALETTE[PRESET_CATEGORIES[ev.category]?.defaultColor] ||
 COLOR_PALETTE.emerald
 const catLabel =
 ev.category === 'custom' && ev.customCategoryLabel
 ? ev.customCategoryLabel
 : PRESET_CATEGORIES[ev.category]?.label || ev.category

 return (
 <div
 key={ev.id}
 className={`p-3 rounded-xl border ${palette.cardBg} space-y-2 transition-all`}
 >
 <div className="flex items-start justify-between gap-2">
 <span className="text-xs font-black leading-snug">{ev.title}</span>
 {!String(ev.id).startsWith('evt-') ? (
 <span className="shrink-0 rounded-md bg-white/70 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
 Sistem
 </span>
 ) : (
 canManage && (
 <div className="flex items-center gap-1 shrink-0">
 <button
 onClick={() => handleOpenEdit(ev)}
 className="p-1 rounded text-slate-500 hover:text-emerald-700 hover:bg-white/60 dark:hover:bg-slate-800"
 title="Edit Agenda"
 >
 <Edit2 className="h-3 w-3" />
 </button>
 <button
 onClick={() => handleDeleteEvent(ev)}
 className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-white/60 dark:hover:bg-slate-800"
 title="Hapus Agenda"
 >
 <Trash2 className="h-3 w-3" />
 </button>
 </div>
 )
 )}
 </div>

 {/* Tag Kategori & Satuan Pendidikan */}
 <div className="flex items-center gap-1.5 flex-wrap text-xs font-bold">
 <span className="inline-flex items-center gap-1">
 <Tag className="h-3 w-3 opacity-70" />
 {catLabel}
 </span>
 <span className="opacity-50">•</span>
 <span className="inline-flex items-center gap-1 opacity-90">
 <Building className="h-3 w-3 opacity-70" />
 {ev.unit}
 </span>
 </div>

 {/* Catatan / Keterangan */}
 {ev.notes && (
 <p className="text-xs opacity-80 line-clamp-2 leading-relaxed">
 {ev.notes}
 </p>
 )}

 {/* Rentang Tanggal & Tautan Modul */}
 <div className="flex items-center justify-between text-[10px] font-semibold pt-1 border-t border-black/5 dark:border-emerald-200/5">
 <span className="opacity-75">
 {formatDateRange(ev.startDate, ev.endDate)}
 </span>
 {ev.targetModule && (
 <Link
 to={ev.targetModule}
 className="inline-flex items-center gap-1 hover:underline text-emerald-700 dark:text-emerald-300 font-bold"
 >
 Buka Modul <ExternalLink className="h-2.5 w-2.5" />
 </Link>
 )}
 </div>
 </div>
 )
 })
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Modal Tambah / Edit Agenda Kalender Terpadu (HeroUI Harmonized Modal) */}
      <AppModal
        isOpen={isFormOpen}
        onClose={() => { if (!isSubmitting) setIsFormOpen(false) }}
        disableBackdropClose={isSubmitting}
        hideCloseButton={isSubmitting}
        variant={editingEvent ? 'warning' : 'emerald'}
        badge={editingEvent ? 'Update Agenda' : 'Agenda Baru'}
        title={editingEvent ? 'Ubah Agenda Akademik' : 'Tambah Agenda Akademik'}
        icon={CalendarDays}
        maxWidth="max-w-xl"
        footer={
          <div className="flex w-full items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              disabled={isSubmitting}
              className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              form="academic-calendar-form"
              disabled={isSubmitting}
              className="inline-flex h-9.5 items-center gap-2 rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting && <RefreshCw className="size-3.5 animate-spin" />}
              Simpan Agenda
            </button>
          </div>
        }
      >
        {/* Form body */}
        <form id="academic-calendar-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3.5">
 {/* Judul Kegiatan */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Judul Kegiatan *
 </label>
 <input
 type="text"
 required
 value={formData.title}
 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
 placeholder="Misal: Penilaian Akhir Semester (PAS) Ganjil"
 className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
 />
 </div>

 {/* Tanggal Mulai & Selesai */}
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Tanggal Mulai *
 </label>
 <DatePicker
 required
 value={formData.startDate}
 onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
 inputClassName="px-3 py-2 text-xs"
 />
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Tanggal Selesai *
 </label>
 <DatePicker
 required
 value={formData.endDate}
 onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
 inputClassName="px-3 py-2 text-xs"
 />
 </div>
 </div>

 {/* Kategori Agenda & Satuan Pendidikan */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Kategori Agenda *
 </label>
 <HeroUiFilterSelect
 value={formData.category}
 onChange={(val) => handleCategoryChange(val)}
 options={Object.entries(PRESET_CATEGORIES).map(([k, v]) => ({
 value: k,
 label: v.label,
 }))}
 placeholder="Pilih Kategori"
 icon={Tag}
 ariaLabel="Kategori Agenda"
 size="md"
 searchable
 className="w-full"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Satuan Pendidikan *
 </label>
 <HeroUiFilterSelect
 value={formData.unit}
 onChange={(val) => setFormData((prev) => ({ ...prev, unit: val }))}
 options={units.map((u) => ({ value: u.value, label: u.label }))}
 placeholder="Pilih Satuan Pendidikan"
 icon={Building}
 ariaLabel="Satuan Pendidikan"
 size="md"
 searchable
 className="w-full"
 />
 </div>
 </div>

 {/* Input Kategori Kustom jika Kategori Custom dipilih */}
 {formData.category === 'custom' && (
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Nama Kategori Bebas / Custom *
 </label>
 <input
 type="text"
 required
 value={formData.customCategoryLabel}
 onChange={(e) =>
 setFormData({ ...formData, customCategoryLabel: e.target.value })
 }
 placeholder="Misal: Perkemahan Akbar Santri, Study Tour"
 className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
 />
 </div>
 )}

 {/* Warna Tema & Sasaran Audiens */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Warna Tema Kalender
 </label>
 <HeroUiFilterSelect
 value={formData.color}
 onChange={(val) => setFormData((prev) => ({ ...prev, color: val }))}
 options={Object.entries(COLOR_PALETTE).map(([cKey, cVal]) => ({
 value: cKey,
 label: cVal.label,
 }))}
 placeholder="Pilih Warna Tema"
 icon={Palette}
 ariaLabel="Warna Tema Kalender"
 size="md"
 className="w-full"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Sasaran Audiens
 </label>
 <HeroUiFilterSelect
 value={formData.audience}
 onChange={(val) => setFormData((prev) => ({ ...prev, audience: val }))}
 options={AUDIENCE_OPTIONS.map((aud) => ({ value: aud.value, label: aud.label }))}
 placeholder="Pilih Sasaran Audiens"
 icon={Users}
 ariaLabel="Sasaran Audiens"
 size="md"
 className="w-full"
 />
 </div>
 </div>

 {/* Tautan Pintas Modul */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Tautan Modul Aplikasi (Opsional)
 </label>
 <HeroUiFilterSelect
 value={formData.targetModule || ''}
 onChange={(val) => setFormData((prev) => ({ ...prev, targetModule: val }))}
 options={MODULE_LINK_OPTIONS.map((m) => ({ value: m.value, label: m.label }))}
 placeholder="Pilih Tautan Modul"
 icon={ExternalLink}
 ariaLabel="Tautan Modul Aplikasi"
 size="md"
 searchable
 className="w-full"
 />
 </div>

 {/* Keterangan / Catatan Tambahan */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Deskripsi / Catatan Tambahan
 </label>
 <textarea
 rows={3}
 value={formData.notes}
 onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
 placeholder="Keterangan pelaksanaan, ketentuan santri/siswa, dresscode, dll."
 className="w-full px-3 py-2 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
 />
 </div>
 </div>

                </form>
       </AppModal>

       {/* HeroUI Harmonized Delete Confirmation Modal */}
       <AppModal
         isOpen={Boolean(deleteEventItem)}
         onClose={() => !isDeleting && setDeleteEventItem(null)}
         disableBackdropClose={isDeleting}
         hideCloseButton={isDeleting}
         variant="danger"
         badge="Hapus Permanen"
         title="Hapus Agenda Kalender?"
         description="Apakah Anda yakin ingin menghapus agenda ini?"
         icon={Trash2}
         maxWidth="max-w-md"
         zIndex={70}
         footer={
           <div className="flex w-full items-center justify-end gap-3">
             <button
               type="button"
               onClick={() => setDeleteEventItem(null)}
               disabled={isDeleting}
               className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
             >
               Batal
             </button>
             <button
               type="button"
               onClick={confirmDeleteEvent}
               disabled={isDeleting}
               className="inline-flex h-9.5 items-center gap-1.5 rounded-xl border-2 border-rose-600 bg-rose-600 px-5 text-xs font-black text-white shadow-md shadow-rose-600/20 transition-all hover:bg-rose-700 active:scale-95 disabled:opacity-50 cursor-pointer"
             >
               {isDeleting && <RefreshCw className="size-3.5 animate-spin" />}
               Hapus Agenda
             </button>
           </div>
         }
       >
         <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
           Tindakan ini akan menghapus jadwal kegiatan dari kalender akademik secara permanen.
         </p>
         <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3.5 dark:border-rose-900/60 dark:bg-rose-950/20">
           <p className="text-xs font-black text-rose-950 dark:text-rose-100">
             {deleteEventItem?.title || 'Agenda'}
           </p>
           <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-0.5">
             Kategori:{' '}
             {deleteEventItem?.category
               ? PRESET_CATEGORIES[deleteEventItem.category]?.label || deleteEventItem.category
               : '-'}{' '}
             • Tanggal: {deleteEventItem?.startDate || '-'} • Unit:{' '}
             {deleteEventItem?.unit || 'Semua Unit'}
           </p>
         </div>
       </AppModal>
      </div>
    </PageContainer>
  )
}
