import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 HeartHandshake,
 CheckCircle2,
 Circle,
 Clock,
 Save,
 Loader2,
 Award,
 Sparkles,
 ListChecks,
 ShieldCheck,
 AlertCircle,
 Info,
 X,
 Home,
 School,
 Building2,
 Lock,
 Calendar,
 BarChart3,
 CalendarDays,
 CalendarRange,
 ArrowRight,
 TrendingUp,
 FileText,
} from 'lucide-react'
import {
 Card as HeroCard,
 Chip as HeroChip,
 Button as HeroButton,
} from '@heroui/react'
import { cn } from '../../lib/utils'
import api from '../../services/api'
import Swal from '@/components/ui/compat/swal-heroui'
import { DatePicker } from '@/components/ui/date-picker'

const formatDateLong = (val) => {
 if (!val) return '-'
 try {
 return new Intl.DateTimeFormat('id-ID', {
 weekday: 'long',
 day: 'numeric',
 month: 'long',
 year: 'numeric',
 }).format(new Date(val))
 } catch {
 return String(val)
 }
}

const formatDateShort = (val) => {
 if (!val) return '-'
 try {
 return new Intl.DateTimeFormat('id-ID', {
 day: 'numeric',
 month: 'short',
 year: 'numeric',
 }).format(new Date(val))
 } catch {
 return String(val)
 }
}

const formatDayName = (val) => {
 if (!val) return ''
 try {
 return new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(
 new Date(val)
 )
 } catch {
 return ''
 }
}

const isHomeActivity = (item, isBoardingProgram = false) => {
 // Jika santri berada di program boarding / asrama, ATAU item berscope boarding, ATAU dinilai musyrif:
 // Seluruh kegiatan 24 jam adalah tanggung jawab asrama / pesantren!
 if (isBoardingProgram || item.scope === 'boarding' || item.responsible_role === 'musyrif') {
 return false
 }
 // Jika item eksplisit berscope sekolah atau dinilai guru:
 if (item.scope === 'school' || item.responsible_role === 'teacher') {
 return false
 }
 if (item.scope === 'home' || item.responsible_role === 'parent' || item.input_location === 'home') {
 return true
 }
 return Boolean(item.can_parent_edit)
}

const isSchoolOrBoarding = (item, isBoardingProgram = false) => {
 if (isBoardingProgram || item.scope === 'boarding' || item.scope === 'school') return true
 if (item.responsible_role === 'teacher' || item.responsible_role === 'musyrif') return true
 return !isHomeActivity(item, isBoardingProgram)
}

const STATUS_PILLS = [
 { value: 'good', label: 'Terlaksana', activeClass: 'bg-emerald-600 text-white shadow-xs' },
 { value: 'less', label: 'Kurang', activeClass: 'bg-amber-600 text-white shadow-xs' },
 { value: 'not_done', label: 'Belum', activeClass: 'bg-rose-600 text-white shadow-xs' },
 { value: 'na', label: 'Uzur / N/A', activeClass: 'bg-slate-600 text-white shadow-xs' },
]

const RECAP_PERIOD_OPTIONS = [
 { id: 'daily', label: 'Harian', icon: CalendarDays },
 { id: 'weekly', label: 'Mingguan', icon: CalendarRange },
 { id: 'monthly', label: 'Bulanan', icon: BarChart3 },
 { id: 'semester', label: 'Semester', icon: TrendingUp },
]

const getDateRangeForPeriod = (period, refDateStr, recapData = null) => {
 if (period === 'semester' && recapData?.semester?.from && recapData?.semester?.until) {
 return { from: recapData.semester.from, until: recapData.semester.until }
 }
 if (period === 'weekly' && recapData?.weekly?.from && recapData?.weekly?.until) {
 return { from: recapData.weekly.from, until: recapData.weekly.until }
 }
 if (period === 'monthly' && recapData?.monthly?.from && recapData?.monthly?.until) {
 return { from: recapData.monthly.from, until: recapData.monthly.until }
 }

 const ref = refDateStr ? new Date(refDateStr) : new Date()
 const safeRef = isNaN(ref.getTime()) ? new Date() : ref

 let until = new Date(safeRef)
 let from = new Date(safeRef)

 if (period === 'weekly') {
 const day = safeRef.getDay() || 7 // 1 is Monday, 7 is Sunday
 from.setDate(safeRef.getDate() - (day - 1))
 until.setDate(from.getDate() + 6)
 } else if (period === 'monthly') {
 from = new Date(safeRef.getFullYear(), safeRef.getMonth(), 1)
 until = new Date(safeRef.getFullYear(), safeRef.getMonth() + 1, 0)
 } else if (period === 'semester') {
 const isOdd = safeRef.getMonth() >= 6 // Jul - Dec
 if (isOdd) {
 from = new Date(safeRef.getFullYear(), 6, 1)
 until = new Date(safeRef.getFullYear(), 11, 31)
 } else {
 from = new Date(safeRef.getFullYear(), 0, 1)
 until = new Date(safeRef.getFullYear(), 5, 30)
 }
 }

 const formatYMD = (d) => {
 const y = d.getFullYear()
 const m = String(d.getMonth() + 1).padStart(2, '0')
 const day = String(d.getDate()).padStart(2, '0')
 return `${y}-${m}-${day}`
 }

 return { from: formatYMD(from), until: formatYMD(until) }
}

export default function MutabaahWorkspace({
 mutabaah = null,
 records = null,
 recapData = null,
 studentId = null,
 student = null,
 onSaveMutabaah = null,
 onReload = null,
 isParent = false,
 readOnly = false,
 loading = false,
}) {
 const effectiveRecap = recapData || records || mutabaah || null
 const effectiveData = mutabaah?.today || mutabaah || records?.today || records || null

 const [data, setData] = useState(effectiveData)
 const [selectedDate, setSelectedDate] = useState(() => {
 return (
 effectiveData?.date ||
 effectiveData?.record_date ||
 effectiveRecap?.date ||
 new Intl.DateTimeFormat('en-CA').format(new Date())
 )
 })

 // Filter Rekapitulasi: Harian, Mingguan, Bulanan, Semester
 const [recapPeriod, setRecapPeriod] = useState('daily')
 const [historyRows, setHistoryRows] = useState([])
 const [loadingHistory, setLoadingHistory] = useState(false)

 const [fetchingDate, setFetchingDate] = useState(false)
 const [itemValues, setItemValues] = useState({})
 const [notes, setNotes] = useState({})
 const [activeTab, setActiveTab] = useState('all') // 'all', 'home', 'school'
 const [saving, setSaving] = useState(false)
 const [submitFeedback, setSubmitFeedback] = useState(null)
 const [schoolNotice, setSchoolNotice] = useState(null)

 // Sinkronisasi data saat prop mutabaah berubah
 useEffect(() => {
 if (mutabaah) {
 setData(mutabaah)
 }
 }, [mutabaah])

 // Inisialisasi status nilai per aktivitas
 useEffect(() => {
 const list = data?.details || []
 const initialVals = {}
 const initialNotes = {}
 list.forEach((item) => {
 const id = item.agenda_item_id || item.activity_id || item.id || item.activity_name
 if (id) {
 if (item.status_value) {
 initialVals[id] = item.status_value
 } else if (item.is_completed || item.completed) {
 initialVals[id] = 'good'
 }
 if (item.notes) {
 initialNotes[id] = item.notes
 }
 }
 })
 setItemValues(initialVals)
 setNotes(initialNotes)
 }, [data])

 // Handler ganti tanggal pemantauan
 const handleDateChange = async (newDate) => {
 setSelectedDate(newDate)
 if (!studentId) return
 setFetchingDate(true)
 try {
 const res = await api.get(`/parent/mutabaah/${studentId}`, {
 params: { date: newDate },
 })
 const todayData = res.data?.data?.today || res.data?.data || null
 if (todayData) {
 setData(todayData)
 }
 if (recapPeriod !== 'daily') {
 loadHistoryForPeriod(recapPeriod, newDate)
 }
 } catch {
 // Abaikan jika tanggal belum ada data
 } finally {
 setFetchingDate(false)
 }
 }

 // Load riwayat rekap jika memilih Mingguan, Bulanan, atau Semester
 const loadHistoryForPeriod = async (period, refDate) => {
 if (!studentId || period === 'daily') return
 setLoadingHistory(true)
 try {
 const { from, until } = getDateRangeForPeriod(period, refDate, effectiveRecap)
 const res = await api.get(`/parent/mutabaah/${studentId}/history`, {
 params: { from, until, per_page: 60 },
 })
 const rows = res.data?.data?.rows?.data || res.data?.data?.rows || []
 setHistoryRows(Array.isArray(rows) ? rows : [])
 } catch {
 setHistoryRows([])
 } finally {
 setLoadingHistory(false)
 }
 }

 const handlePeriodChange = (periodId) => {
 setRecapPeriod(periodId)
 if (periodId !== 'daily') {
 loadHistoryForPeriod(periodId, selectedDate)
 }
 }

 const isBoarding = useMemo(() => {
 if (data?.program) return data.program === 'boarding'
 if (data?.care_location) return data.care_location === 'boarding'
 if (recapData?.program) return recapData.program === 'boarding'
 if (recapData?.care_location) return recapData.care_location === 'boarding'
 if (student?.program) return student.program === 'boarding'
 return false
 }, [data, recapData, student])

 const detailsList = useMemo(() => data?.details || [], [data])

 const homeActivities = useMemo(
 () => detailsList.filter((item) => isHomeActivity(item, isBoarding)),
 [detailsList, isBoarding]
 )

 const schoolActivities = useMemo(
 () => detailsList.filter((item) => isSchoolOrBoarding(item, isBoarding)),
 [detailsList, isBoarding]
 )

 const displayedList = useMemo(() => {
 if (activeTab === 'home') return homeActivities
 if (activeTab === 'school') return schoolActivities
 return detailsList
 }, [activeTab, detailsList, homeActivities, schoolActivities])

 // Statistik Harian
 const dailyStats = useMemo(() => {
 const total = Number(data?.total_items ?? detailsList.length)
 if (total === 0) return { total: 0, achieved: 0, pending: 0, percentage: null }

 const achieved = detailsList.filter((item) => {
 const id = item.agenda_item_id || item.activity_id || item.id || item.activity_name
 const val = itemValues[id] ?? item.status_value
 return val === 'good'
 }).length

 const pending = total - achieved
 const percentage = total > 0 ? Math.round((achieved / total) * 100) : 0
 return { total, achieved, pending, percentage }
 }, [data, detailsList, itemValues])

 // Metrik periodik: Mingguan, Bulanan, Semester
 const periodicMetrics = useMemo(() => {
 if (recapPeriod === 'weekly') {
 const w = recapData?.weekly
 return {
 label: 'Pekan Ini',
 days: w?.days || 0,
 good: w?.good || 0,
 pending: (w?.not_done || 0) + (w?.less || 0),
 score: w?.score != null ? Math.round(Number(w.score)) : 0,
 }
 }
 if (recapPeriod === 'monthly') {
 const m = recapData?.monthly
 return {
 label: 'Bulan Ini',
 days: m?.days || 0,
 good: m?.good || 0,
 pending: (m?.not_done || 0) + (m?.less || 0),
 score: m?.score != null ? Math.round(Number(m.score)) : 0,
 }
 }
 if (recapPeriod === 'semester') {
 const s = recapData?.semester
 return {
 label: 'Semester Ini',
 days: s?.days || 0,
 good: s?.good || 0,
 pending: (s?.not_done || 0) + (s?.less || 0),
 score: s?.score != null ? Math.round(Number(s.score)) : 0,
 }
 }
 return null
 }, [recapPeriod, recapData])

 // Toggle cepat status amalan (good vs not_done)
 const toggleQuickCheck = (item) => {
 if (readOnly) return
 const id = item.agenda_item_id || item.activity_id || item.id || item.activity_name
 const isHome = isHomeActivity(item, isBoarding)

 if (isParent && !isHome) {
 setSchoolNotice(
 isBoarding
 ? `Aktivitas "${item.activity_name || item.name}" dibimbing dan dinilai langsung oleh Musyrif di asrama/pondok.`
 : `Aktivitas "${item.activity_name || item.name}" dilaksanakan di sekolah dan dinilai langsung oleh Guru.`
 )
 setTimeout(() => setSchoolNotice(null), 4000)
 return
 }

 const currentVal = itemValues[id] ?? item.status_value
 const nextVal = currentVal === 'good' ? 'not_done' : 'good'
 setItemValues((prev) => ({ ...prev, [id]: nextVal }))
 }

 // Set nilai status spesifik (good, less, not_done, na)
 const setSpecificStatus = (item, status) => {
 if (readOnly) return
 const id = item.agenda_item_id || item.activity_id || item.id || item.activity_name
 const isHome = isHomeActivity(item, isBoarding)

 if (isParent && !isHome) {
 setSchoolNotice(
 isBoarding
 ? `Aktivitas "${item.activity_name || item.name}" dibimbing dan dinilai langsung oleh Musyrif di asrama/pondok.`
 : `Aktivitas "${item.activity_name || item.name}" dilaksanakan di sekolah dan dinilai langsung oleh Guru.`
 )
 setTimeout(() => setSchoolNotice(null), 4000)
 return
 }

 setItemValues((prev) => ({ ...prev, [id]: status }))
 }

 // Handler Simpan Mutabaah Rumah
 const handleSave = async () => {
 if (readOnly) return
 setSaving(true)
 setSubmitFeedback(null)
 try {
 const homePayload = homeActivities
 .map((item) => {
 const id =
 item.agenda_item_id || item.activity_id || item.id || item.activity_name
 const currentVal = itemValues[id] ?? item.status_value ?? 'not_done'
 return {
 agenda_item_id: item.agenda_item_id || item.id,
 status_value: currentVal,
 notes: notes[id] || null,
 }
 })
 .filter((i) => Boolean(i.agenda_item_id))

 if (studentId) {
 await api.post(`/portal/children/${studentId}/worship-input`, {
 date: selectedDate,
 items: homePayload,
 })
 } else if (onSaveMutabaah) {
 await onSaveMutabaah(homePayload)
 }

 setSubmitFeedback({
 type: 'success',
 message: 'Alhamdulillah, mutabaah ibadah rumah berhasil disimpan.',
 })
 setTimeout(() => setSubmitFeedback(null), 4000)

 // Segarkan data mutabaah
 if (studentId) {
 const res = await api.get(`/parent/mutabaah/${studentId}`, {
 params: { date: selectedDate },
 })
 const updated = res.data?.data?.today || res.data?.data || null
 if (updated) setData(updated)
 }
 onReload?.()
 } catch (err) {
 setSubmitFeedback({
 type: 'error',
 message:
 err.response?.data?.message ||
 'Gagal menyimpan mutabaah. Silakan coba kembali.',
 })
 } finally {
 setSaving(false)
 }
 }

 const [downloadingPdf, setDownloadingPdf] = useState(false)

 const handleExportWeeklyPdf = async () => {
 const sId = studentId || student?.id || data?.student_id || effectiveRecap?.student_id
 if (!sId) {
 Swal.fire({
 title: 'ID Siswa Tidak Ditemukan',
 text: 'Data identitas santri/siswa tidak ditemukan untuk cetak laporan.',
 icon: 'warning',
 confirmButtonColor: '#059669',
 })
 return
 }
 setDownloadingPdf(true)
 try {
 const response = await api.get(`/parent/mutabaah/${sId}/weekly-pdf`, {
 params: { date: selectedDate },
 responseType: 'blob',
 })
 const blob = new Blob([response.data], { type: 'application/pdf' })
 const url = window.URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.href = url
 link.download = `mutabaah-pekanan-${selectedDate}.pdf`
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 window.URL.revokeObjectURL(url)
 } catch (err) {
 Swal.fire({
 title: 'Gagal Mengunduh Laporan',
 text: err.response?.data?.message || 'Gagal mengunduh dokumen PDF mutabaah pekanan.',
 icon: 'error',
 confirmButtonColor: '#059669',
 })
 } finally {
 setDownloadingPdf(false)
 }
 }

 const openDailyForDate = (dateStr) => {
 handleDateChange(dateStr)
 setRecapPeriod('daily')
 }

 const statusLabel = data?.status
 ? data.status === 'verified' || data.status === 'finalized'
 ? 'Terverifikasi'
 : data.status === 'draft'
 ? 'Draf'
 : data.status.charAt(0).toUpperCase() +
 data.status.slice(1).replace(/_/g, ' ')
 : null

 const isEditable = !readOnly && !isBoarding && (!data?.status || data.status === 'draft')

 return (
 <div className="space-y-6">
 {/* 1. HERO HEADER CONTAINER TERPADU */}
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-5 sm:p-7 shadow-lg shadow-violet-500/10 dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white dark:bg-[#1B2433] blur-3xl"
 />
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-white dark:bg-[#1B2433] blur-3xl"
 />
 <div
 aria-hidden="true"
 className="absolute inset-0 opacity-[.06] [background-image:radial-gradient(circle_at_2px_2px,#7c3aed_1.5px,transparent_0)] [background-size:24px_24px]"
 />

 <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
 <div className="flex items-start gap-4">
 <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-xl shadow-violet-600/20">
 <HeartHandshake className="h-7 w-7" />
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <HeroChip
 size="sm"
 variant="flat"
 className="font-extrabold text-[10.5px] bg-violet-500/20 border border-emerald-200/80 dark:border-emerald-800/60 text-violet-800 dark:text-violet-300"
 >
 <Sparkles className="h-3 w-3 text-violet-600 mr-1 inline" />
 Mutaba'ah Yaumiyyah
 </HeroChip>

 <HeroChip
 size="sm"
 variant="flat"
 className={cn(
 'font-black text-[10px]',
 isBoarding
 ? 'bg-sky-100 text-sky-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950 dark:text-sky-300 dark:border-emerald-800/60'
 : 'bg-purple-100 text-purple-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-purple-950 dark:text-purple-300 dark:border-emerald-800/60'
 )}
 >
 {isBoarding ? 'Boarding / Pesantren' : 'Full Day'}
 </HeroChip>

 {statusLabel && recapPeriod === 'daily' && (
 <HeroChip
 size="sm"
 variant="flat"
 className={cn(
 'font-black text-[10px]',
 data?.status === 'verified' || data?.status === 'finalized'
 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60'
 : 'bg-amber-100 text-amber-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300 dark:border-emerald-800/60'
 )}
 >
 {statusLabel}
 </HeroChip>
 )}

 <HeroChip
 size="sm"
 variant="flat"
 className="font-extrabold text-[10px] bg-white/80 text-violet-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-violet-300 dark:border-emerald-700/80"
 >
 Rekap {RECAP_PERIOD_OPTIONS.find((p) => p.id === recapPeriod)?.label}
 </HeroChip>
 </div>

 <h1 className="mt-1.5 text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
 Mutaba'ah & Ibadah Santri
 </h1>
 <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
 {isBoarding
 ? 'Pemantauan komprehensif amalan ibadah 24 jam santri pondok pesantren oleh musyrif dan pembimbing.'
 : 'Pantau ketercapaian ibadah santri di rumah dan di sekolah secara harian, mingguan, bulanan, dan semester.'}
 </p>
 </div>
 </div>

 {/* Action Tools: Date Picker (untuk mode Harian) & Save Button */}
 <div className="flex flex-wrap items-center gap-3 shrink-0">
 {recapPeriod === 'daily' && (
 <div className="flex items-center gap-2">
 <DatePicker
 value={selectedDate}
 onChange={(e) => handleDateChange(e.target.value)}
 className="w-40"
 inputClassName="py-2 text-xs font-bold"
 placeholder="Pilih tanggal..."
 />
 {fetchingDate && (
 <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-600" />
 )}
 </div>
 )}

 {recapPeriod === 'daily' && isEditable && (
 <HeroButton
 size="md"
 isDisabled={saving}
 onPress={handleSave}
 className={cn(
 'inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-lg transition-all cursor-pointer',
 saving
 ? 'bg-slate-400 opacity-70 cursor-not-allowed'
 : 'bg-white dark:bg-[#1B2433] shadow-violet-600/30 hover:scale-[1.02]'
 )}
 >
 {saving ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
 </>
 ) : (
 <>
 <Save className="h-4 w-4" /> Simpan Ibadah Rumah
 </>
 )}
 </HeroButton>
 )}
 <HeroButton
 size="md"
 isDisabled={downloadingPdf}
 onPress={handleExportWeeklyPdf}
 className="inline-flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:text-white px-4 py-2.5 text-xs sm:text-sm font-black shadow-sm hover:scale-[1.02] transition-all cursor-pointer"
 >
 {downloadingPdf ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" /> Menyiapkan PDF...
 </>
 ) : (
 <>
 <FileText className="h-4 w-4" /> Unduh PDF Pekanan
 </>
 )}
 </HeroButton>
 </div>
 </div>

 {/* Tanggal / Periode Aktif Terpilih */}
 <p className="relative mt-3 text-xs font-semibold text-violet-700/80 dark:text-violet-400/80">
 {recapPeriod === 'daily' ? (
 <>
 Tanggal Terpilih: <b>{formatDateLong(selectedDate)}</b>
 </>
 ) : (
 <>
 Rentang Analisis:{' '}
 <b>
 {formatDateShort(getDateRangeForPeriod(recapPeriod, selectedDate, effectiveRecap).from)}
 {' s/d '}
 {formatDateShort(getDateRangeForPeriod(recapPeriod, selectedDate, effectiveRecap).until)}
 </b>
 </>
 )}
 </p>
 </HeroCard>

 {/* 2. FILTER RENTANG REKAPITULASI (HARIAN, MINGGUAN, BULANAN, SEMESTER) */}
 <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3 sm:p-4 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900">
 <div className="flex items-center gap-2.5">
 <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/80 dark:text-violet-300">
 <BarChart3 className="h-4 w-4" />
 </div>
 <div>
 <h4 className="text-xs font-black text-slate-800 dark:text-slate-100">
 Filter Rentang Rekapitulasi Data
 </h4>
 <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
 Pilih periode evaluasi capaian mutaba'ah santri
 </p>
 </div>
 </div>

 {/* Segmented Filter Period */}
 <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-700/80/60">
 {RECAP_PERIOD_OPTIONS.map(({ id, label, icon: Icon }) => {
 const isActive = recapPeriod === id
 return (
 <button
 key={id}
 type="button"
 onClick={() => handlePeriodChange(id)}
 className={cn(
 'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer',
 isActive
 ? 'bg-white dark:bg-[#1B2433] shadow-xs'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100'
 )}
 >
 <Icon className="h-3.5 w-3.5" />
 {label}
 </button>
 )
 })}
 </div>
 </div>

 {/* Feedback Alert Banner */}
 <AnimatePresence>
 {submitFeedback && (
 <motion.div
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 transition={{ duration: 0.2 }}
 >
 <div
 className={cn(
 'flex items-start gap-2.5 rounded-xl p-3.5 text-xs font-semibold',
 submitFeedback.type === 'success'
 ? 'bg-emerald-50 text-emerald-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/80 dark:text-emerald-200 dark:border-emerald-800/60'
 : 'bg-rose-50 text-rose-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/80 dark:text-rose-200 dark:border-emerald-800/60'
 )}
 >
 {submitFeedback.type === 'success' ? (
 <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
 ) : (
 <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
 )}
 <span className="flex-1">{submitFeedback.message}</span>
 <button
 type="button"
 onClick={() => setSubmitFeedback(null)}
 className="shrink-0 cursor-pointer"
 >
 <X className="h-3.5 w-3.5 text-slate-400 hover:text-slate-600" />
 </button>
 </div>
 </motion.div>
 )}

 {schoolNotice && (
 <motion.div
 initial={{ opacity: 0, y: -8 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -8 }}
 transition={{ duration: 0.2 }}
 >
 <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/90 p-3.5 text-xs font-semibold text-sky-900 dark:border-emerald-800/60 dark:bg-sky-950/80 dark:text-sky-200">
 <Lock className="h-4 w-4 text-sky-600 shrink-0 mt-0.5" />
 <span className="flex-1">{schoolNotice}</span>
 <button
 type="button"
 onClick={() => setSchoolNotice(null)}
 className="shrink-0 cursor-pointer"
 >
 <X className="h-3.5 w-3.5 text-sky-400 hover:text-sky-600" />
 </button>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* 3. DYNAMIC 4 KPI CARDS (MENYESUAIKAN FILTER HARIAN / MINGGUAN / BULANAN / SEMESTER) */}
 <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
 {/* Card 1: Target / Hari Terdata */}
 <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4.5 sm:p-5 shadow-xs transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900">
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white dark:bg-[#1B2433] blur-xl"
 />
 <div className="relative flex items-center justify-between gap-3">
 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-md shadow-violet-500/20">
 <HeartHandshake className="h-5 w-5" />
 </div>
 <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
 {recapPeriod === 'daily'
 ? dailyStats.total
 : `${periodicMetrics?.days ?? 0} Hari`}
 </span>
 </div>
 <p className="relative mt-3.5 text-xs font-bold text-slate-700 dark:text-slate-200">
 {recapPeriod === 'daily'
 ? 'Aktivitas Target'
 : `Hari Terdata (${periodicMetrics?.label})`}
 </p>
 <p className="relative mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-500">
 {recapPeriod === 'daily'
 ? 'Agenda ibadah hari ini'
 : 'Hari dengan catatan mutabaah'}
 </p>
 </HeroCard>
 </motion.div>

 {/* Card 2: Tercapai */}
 <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4.5 sm:p-5 shadow-xs transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900">
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white dark:bg-[#1B2433] blur-xl"
 />
 <div className="relative flex items-center justify-between gap-3">
 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm">
 <CheckCircle2 className="h-5 w-5" />
 </div>
 <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
 {recapPeriod === 'daily'
 ? dailyStats.achieved
 : periodicMetrics?.good ?? 0}
 </span>
 </div>
 <p className="relative mt-3.5 text-xs font-bold text-slate-700 dark:text-slate-200">
 {recapPeriod === 'daily' ? 'Tercapai Hari Ini' : 'Amalan Terlaksana'}
 </p>
 <p className="relative mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-500">
 {recapPeriod === 'daily'
 ? 'Ibadah terlaksana'
 : `Akumulasi ${periodicMetrics?.label}`}
 </p>
 </HeroCard>
 </motion.div>

 {/* Card 3: Belum Terlaksana / Perlu Ditingkatkan */}
 <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4.5 sm:p-5 shadow-xs transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900">
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white dark:bg-[#1B2433] blur-xl"
 />
 <div className="relative flex items-center justify-between gap-3">
 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm">
 <Clock className="h-5 w-5" />
 </div>
 <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
 {recapPeriod === 'daily'
 ? dailyStats.pending
 : periodicMetrics?.pending ?? 0}
 </span>
 </div>
 <p className="relative mt-3.5 text-xs font-bold text-slate-700 dark:text-slate-200">
 {recapPeriod === 'daily' ? 'Belum Terlaksana' : 'Belum / Kurang'}
 </p>
 <p className="relative mt-0.5 text-xs font-medium text-slate-400 dark:text-slate-500">
 {recapPeriod === 'daily'
 ? 'Aktivitas tersisa hari ini'
 : 'Perlu bimbingan & peningkatan'}
 </p>
 </HeroCard>
 </motion.div>

 {/* Card 4: Persentase / Rata-rata Skor */}
 <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4.5 sm:p-5 shadow-xs transition-all hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900">
 <div
 aria-hidden="true"
 className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white dark:bg-[#1B2433] blur-xl"
 />
 <div className="relative flex items-center justify-between gap-3">
 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-sm">
 <Award className="h-5 w-5" />
 </div>
 <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
 {recapPeriod === 'daily'
 ? dailyStats.percentage == null
 ? '-'
 : `${dailyStats.percentage}%`
 : `${periodicMetrics?.score ?? 0}%`}
 </span>
 </div>
 <p className="relative mt-3.5 text-xs font-bold text-slate-700 dark:text-slate-200">
 {recapPeriod === 'daily'
 ? 'Persentase Capaian'
 : `Rata-rata Skor (${periodicMetrics?.label})`}
 </p>
 <div className="relative mt-2 h-1.5 overflow-hidden rounded-full bg-emerald-50 dark:bg-emerald-950/40">
 <div
 className="h-full rounded-full bg-white dark:bg-[#1B2433] transition-all duration-500"
 style={{
 width: `${Math.max(
 0,
 Math.min(
 100,
 Number(
 recapPeriod === 'daily'
 ? dailyStats.percentage || 0
 : periodicMetrics?.score || 0
 )
 )
 )}%`,
 }}
 />
 </div>
 </HeroCard>
 </motion.div>
 </div>

 {/* 4. MAIN CONTENT AREA: CHECKLIST HARIAN ATAU TABEL REKAPITULASI PERIODIK */}
 {recapPeriod === 'daily' ? (
 /* ================= TAMPILAN CHECKLIST HARIAN ================= */
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900">
 {/* Info Box: Penjelasan Tanggung Jawab */}
 <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-violet-50/60 p-3.5 text-xs text-violet-950 dark:border-emerald-800/60 dark:bg-violet-950/30 dark:text-violet-200">
 <Info className="h-4.5 w-4.5 text-violet-600 dark:text-violet-400 shrink-0 mt-0.5" />
 <div className="space-y-0.5 leading-relaxed">
 <p className="font-extrabold text-xs">
 {isBoarding
 ? 'Panduan Mutaba\'ah Santri Pesantren (Boarding)'
 : 'Panduan Mutaba\'ah Siswa Full Day'}
 </p>
 <p className="text-[11.5px] text-violet-800/90 dark:text-violet-300/80">
 {isBoarding ? (
 <>
 Santri mengikuti program <b>Boarding / Pesantren</b>. Seluruh kegiatan ibadah harian santri (24 jam) dibimbing dan dinilai langsung oleh <b>Musyrif Asrama dan Guru di Pesantren</b>. Orang tua memantau rekam jejak ibadah secara terpadu.
 </>
 ) : (
 <>
 Santri mengikuti program <b>Full Day</b>. Orang tua mengisi <b>Ibadah di Rumah</b> (Subuh, Maghrib, Isya, Tahajud, doa/adab). Sedangkan <b>Ibadah di Sekolah</b> (Dzuhur, Ashar, Dhuha) dipantau dan dinilai langsung oleh Guru di sekolah.
 </>
 )}
 </p>
 </div>
 </div>

 {/* Toolbar Header & Segmented Filter Buttons */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-md shadow-violet-500/15">
 <ListChecks className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
 Daftar Mutaba'ah Yaumiyyah
 </h3>
 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
 {isBoarding
 ? 'Evaluasi ibadah santri yang dibimbing oleh musyrif asrama.'
 : 'Pilih status pelaksanaan ibadah santri secara jujur dan konsisten.'}
 </p>
 </div>
 </div>

              {/* Segmented Filter Buttons: Semua, Di Rumah (khusus Full Day), Di Sekolah / Asrama */}
              <div
                role="tablist"
                aria-label="Filter Lingkup Aktivitas"
                className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700/80"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'all'}
                  onClick={() => setActiveTab('all')}
                  className={cn(
                    'rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer select-none',
                    activeTab === 'all'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold opacity-100'
                      : 'text-slate-600 dark:text-slate-300 opacity-70 hover:opacity-100 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 hover:text-emerald-900 dark:hover:text-emerald-200'
                  )}
                >
                  Semua ({detailsList.length})
                </button>

                {!isBoarding && (
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeTab === 'home'}
                    onClick={() => setActiveTab('home')}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer select-none',
                      activeTab === 'home'
                        ? 'bg-emerald-600 text-white shadow-sm font-bold opacity-100'
                        : 'text-slate-600 dark:text-slate-300 opacity-70 hover:opacity-100 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 hover:text-emerald-900 dark:hover:text-emerald-200'
                    )}
                  >
                    <Home className="h-3.5 w-3.5" />
                    <span>Di Rumah ({homeActivities.length})</span>
                  </button>
                )}

                <button
                  type="button"
                  role="tab"
                  aria-selected={activeTab === 'school'}
                  onClick={() => setActiveTab('school')}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer select-none',
                    activeTab === 'school'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold opacity-100'
                      : 'text-slate-600 dark:text-slate-300 opacity-70 hover:opacity-100 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 hover:text-emerald-900 dark:hover:text-emerald-200'
                  )}
                >
                  {isBoarding ? <Building2 className="h-3.5 w-3.5" /> : <School className="h-3.5 w-3.5" />}
                  <span>
                    {isBoarding
                      ? `Asrama & Sekolah (${schoolActivities.length})`
                      : `Di Sekolah (${schoolActivities.length})`}
                  </span>
                </button>
              </div>
            </div>

 {/* Grid Aktivitas Harian */}
 <div className="mt-5 grid gap-3.5 md:grid-cols-2">
 {displayedList.map((item, idx) => {
 const id =
 item.agenda_item_id ||
 item.activity_id ||
 item.id ||
 item.activity_name ||
 `act-${idx}`
 const currentVal = itemValues[id] ?? item.status_value ?? 'not_done'
 const isGood = currentVal === 'good'
 const isHome = isHomeActivity(item, isBoarding)
 const isBoardingItem = isBoarding || item.scope === 'boarding' || item.responsible_role === 'musyrif'
 const canEdit = isEditable && (!isParent || isHome)

 return (
 <motion.div
 key={id}
 whileHover={{ scale: canEdit ? 1.008 : 1 }}
 transition={{ duration: 0.15 }}
 className={cn(
 'rounded-xl border-2 p-4 transition-all',
 isGood
 ? isHome
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433]'
 : isBoardingItem
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433]'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433]'
 : 'border-emerald-200/80 bg-white hover:border-emerald-300 dark:hover:border-emerald-700 dark:border-emerald-800/60 dark:bg-slate-800/40 dark:hover:border-emerald-700'
 )}
 >
 <div className="flex items-start gap-3">
 {/* Quick Toggle Circle Icon */}
 <button
 type="button"
 disabled={!canEdit}
 onClick={() => toggleQuickCheck(item)}
 className={cn(
 'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all mt-0.5',
 canEdit ? 'cursor-pointer hover:scale-105' : 'cursor-default',
 isGood
 ? isHome
 ? 'bg-white dark:bg-[#1B2433] shadow-sm shadow-violet-500/20'
 : isBoardingItem
 ? 'bg-white dark:bg-[#1B2433] shadow-sm shadow-sky-500/20'
 : 'bg-slate-100 border border-emerald-200/80 text-slate-700 shadow-xs dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300 shadow-sm'
 : 'border-2 border-emerald-300 bg-white text-slate-300 hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-violet-500 dark:border-emerald-700/80 dark:bg-slate-800'
 )}
 >
 {isGood ? (
 <CheckCircle2 className="h-4.5 w-4.5" />
 ) : canEdit ? (
 <Circle className="h-4.5 w-4.5" />
 ) : (
 <Lock className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />
 )}
 </button>

 {/* Content Header & Badges */}
 <div className="min-w-0 flex-1">
 <div className="flex items-center justify-between gap-2">
 <p
 className={cn(
 'text-xs font-bold leading-tight',
 isGood
 ? isHome
 ? 'text-violet-950 dark:text-violet-200'
 : isBoardingItem
 ? 'text-sky-950 dark:text-sky-200'
 : 'text-emerald-950 dark:text-emerald-200'
 : 'text-slate-800 dark:text-slate-200'
 )}
 >
 {item.activity_name || item.name || item.title}
 </p>

 {/* Status Terlaksana / Oleh Guru / Musyrif Chip */}
 {isGood ? (
 <HeroChip
 size="sm"
 variant="flat"
 className={cn(
 'shrink-0 font-extrabold text-[9px] border',
 isHome
 ? 'bg-violet-100 text-violet-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-violet-950 dark:text-violet-300 dark:border-emerald-800/60'
 : isBoardingItem
 ? 'bg-sky-100 text-sky-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950 dark:text-sky-300 dark:border-emerald-800/60'
 : 'bg-emerald-100 text-emerald-700 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60'
 )}
 >
 <ShieldCheck className="h-2.5 w-2.5 mr-0.5 inline" />
 Terlaksana
 </HeroChip>
 ) : !canEdit ? (
 <HeroChip
 size="sm"
 variant="flat"
 className="shrink-0 font-bold text-[9px] bg-slate-100 text-slate-500 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300 dark:border-emerald-700/80"
 >
 <Lock className="h-2.5 w-2.5 mr-0.5 inline text-slate-400" />
 {isBoardingItem ? 'Dipantau Musyrif' : 'Dipantau Guru'}
 </HeroChip>
 ) : null}
 </div>

 {/* Metadata & Location Tag */}
 <div className="mt-1 flex flex-wrap items-center gap-1.5">
 {isHome ? (
 <span className="inline-flex items-center gap-1 text-[10px] font-bold text-violet-700 dark:text-violet-300 bg-violet-100/70 dark:bg-violet-950/60 px-2 py-0.5 rounded-md">
 <Home className="h-2.5 w-2.5" />
 Rumah · Ortu
 </span>
 ) : isBoardingItem ? (
 <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 dark:text-sky-300 bg-sky-100/70 dark:bg-sky-950/60 px-2 py-0.5 rounded-md">
 <Building2 className="h-2.5 w-2.5" />
 Asrama · Musyrif
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
 <School className="h-2.5 w-2.5" />
 Sekolah · Guru
 </span>
 )}

 {(item.category || item.time_label) && (
 <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
 {item.category}
 {item.time_label ? ` · ${item.time_label}` : ''}
 </span>
 )}
 </div>

 {/* Status Options Pills untuk Kegiatan Rumah */}
 {canEdit ? (
 <div className="mt-3 flex flex-wrap items-center gap-1.5">
 {STATUS_PILLS.map(({ value, label, activeClass }) => {
 const isActive = currentVal === value
 return (
 <button
 type="button"
 key={value}
 onClick={() => setSpecificStatus(item, value)}
 className={cn(
 'rounded-xl px-2.5 py-1 text-[10.5px] font-bold transition-all cursor-pointer',
 isActive
 ? activeClass
 : 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white text-slate-600 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-violet-50/40 dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:border-emerald-700'
 )}
 >
 {label}
 </button>
 )
 })}
 </div>
 ) : (
 <p className="mt-2.5 text-[10.5px] font-medium text-slate-400 dark:text-slate-500 italic">
 {item.status_value === 'good'
 ? isBoardingItem
 ? 'Dinilai terlaksana oleh Musyrif di pondok / asrama.'
 : 'Dinilai terlaksana oleh Guru di sekolah.'
 : isBoardingItem
 ? 'Aktivitas santri dinilai langsung oleh Musyrif asrama.'
 : 'Aktivitas sekolah dinilai langsung oleh Guru.'}
 </p>
 )}
 </div>
 </div>
 </motion.div>
 )
 })}
 </div>

 {/* Empty State Harian */}
 {displayedList.length === 0 && (
 <div className="py-16 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
 <HeartHandshake className="mx-auto h-10 w-10 text-violet-300 dark:text-violet-700" />
 <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
 Belum Ada Agenda Mutabaah
 </p>
 <p className="text-xs text-slate-400 max-w-sm mx-auto">
 {loading
 ? 'Memuat data mutabaah harian...'
 : 'Tidak ada aktivitas mutabaah pada tanggal dan kategori yang dipilih.'}
 </p>
 </div>
 )}

 {/* Bottom Save Bar */}
 {isEditable && displayedList.length > 0 && (
 <div className="mt-7 flex items-center justify-between border-t border-emerald-200/80 pt-5 dark:border-emerald-800/60">
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Pastikan seluruh amalan rumah terisi sebelum menyimpan.
 </p>
 <HeroButton
 size="md"
 isDisabled={saving}
 onPress={handleSave}
 className={cn(
 'inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs sm:text-sm font-black text-white shadow-lg transition-all cursor-pointer',
 saving
 ? 'bg-slate-400 opacity-70 cursor-not-allowed'
 : 'bg-white dark:bg-[#1B2433] shadow-violet-600/30 hover:scale-[1.02]'
 )}
 >
 {saving ? (
 <>
 <Loader2 className="h-4 w-4 animate-spin" /> Menyimpan...
 </>
 ) : (
 <>
 <Save className="h-4 w-4" /> Simpan Ibadah Rumah
 </>
 )}
 </HeroButton>
 </div>
 )}
 </HeroCard>
 ) : (
 /* ================= TAMPILAN REKAPITULASI PERIODIK (MINGGUAN / BULANAN / SEMESTER) ================= */
 <HeroCard className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-md shadow-violet-500/15">
 <FileText className="h-5 w-5" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
 Riwayat Mutaba'ah {RECAP_PERIOD_OPTIONS.find((p) => p.id === recapPeriod)?.label}
 </h3>
 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
 Daftar rekam jejak pelaksanaan amalan ibadah santri per hari pada periode ini.
 </p>
 </div>
 </div>

 <HeroChip
 size="sm"
 variant="flat"
 className="font-extrabold text-xs bg-violet-100 text-violet-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-violet-950 dark:text-violet-300 dark:border-emerald-800/60"
 >
 {historyRows.length} Hari Terekam
 </HeroChip>
 </div>

 {/* Loading Indicator Riwayat */}
 {loadingHistory ? (
 <div className="py-20 text-center space-y-3">
 <Loader2 className="mx-auto h-8 w-8 animate-spin text-violet-600" />
 <p className="text-xs font-bold text-slate-500">
 Memuat riwayat rekap {recapPeriod}...
 </p>
 </div>
 ) : historyRows.length === 0 ? (
 <div className="py-16 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
 <Calendar className="mx-auto h-10 w-10 text-violet-300 dark:text-violet-700" />
 <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
 Belum Ada Riwayat pada Periode Ini
 </p>
 <p className="text-xs text-slate-400 max-w-sm mx-auto">
 Catatan mutabaah harian santri akan otomatis terakumulasi dalam rekap{' '}
 {recapPeriod} saat aktivitas mulai diisi.
 </p>
 </div>
 ) : (
 /* Daftar Riwayat Harian dalam Periode */
 <div className="mt-5 space-y-3">
 {historyRows.map((row) => {
 const score = row.score != null ? Math.round(Number(row.score)) : 0
 const goodCount = row.good_count || 0
 const lessCount = row.less_count || 0
 const notDoneCount = row.not_done_count || 0

 return (
 <motion.div
 key={row.id || row.activity_date}
 whileHover={{ scale: 1.005 }}
 transition={{ duration: 0.15 }}
 className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border-2 border-emerald-200/80 bg-white p-4 transition-all hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-xs dark:border-emerald-800/60 dark:bg-slate-800/40 dark:hover:border-emerald-700"
 >
 <div className="flex items-center gap-3.5">
 <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-xl bg-violet-50 text-violet-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-violet-950/60 dark:text-violet-300 dark:border-emerald-800/60">
 <span className="text-[9px] font-black uppercase">
 {formatDayName(row.activity_date).slice(0, 3)}
 </span>
 <span className="text-xs font-black">
 {new Date(row.activity_date).getDate() || '-'}
 </span>
 </div>
 <div>
 <div className="flex items-center gap-2">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
 {formatDateShort(row.activity_date)}
 </p>
 <HeroChip
 size="sm"
 variant="flat"
 className={cn(
 'font-black text-[9.5px]',
 row.status === 'verified' || row.status === 'finalized' || row.status === 'parent_signed'
 ? 'bg-emerald-100 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60'
 : 'bg-amber-100 text-amber-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300 dark:border-emerald-800/60'
 )}
 >
 {row.status === 'verified' || row.status === 'finalized'
 ? 'Terverifikasi'
 : row.status === 'parent_signed'
 ? 'Diparaf Ortu'
 : 'Draf'}
 </HeroChip>
 </div>
 <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
 <span className="text-emerald-600 dark:text-emerald-400 font-bold">
 ✓ {goodCount} Terlaksana
 </span>
 {(lessCount > 0 || notDoneCount > 0) && (
 <span className="text-amber-600 dark:text-amber-400">
 · {lessCount + notDoneCount} Belum/Kurang
 </span>
 )}
 {row.supervisor_notes && (
 <span className="italic text-slate-400 dark:text-slate-500 truncate max-w-xs">
 · "{row.supervisor_notes}"
 </span>
 )}
 </div>
 </div>
 </div>

 <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
 <div className="text-right">
 <span
 className={cn(
 'text-base font-black',
 score >= 80
 ? 'text-emerald-600 dark:text-emerald-400'
 : score >= 60
 ? 'text-amber-600 dark:text-amber-400'
 : 'text-rose-600 dark:text-rose-400'
 )}
 >
 {score}%
 </span>
 <p className="text-[10px] font-medium text-slate-400">
 Capaian
 </p>
 </div>

 <button
 type="button"
 onClick={() => openDailyForDate(row.activity_date)}
 className="inline-flex items-center gap-1 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-800 px-3 py-2 text-xs font-bold transition-all border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-violet-950/60 dark:hover:bg-violet-900/60 dark:text-violet-300 dark:border-emerald-800/60 cursor-pointer"
 >
 Buka Harian
 <ArrowRight className="h-3.5 w-3.5" />
 </button>
 </div>
 </motion.div>
 )
 })}
 </div>
 )}
 </HeroCard>
 )}
 </div>
 )
}
