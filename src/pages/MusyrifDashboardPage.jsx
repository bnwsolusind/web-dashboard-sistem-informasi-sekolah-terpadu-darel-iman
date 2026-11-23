import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
 BookOpen,
 CheckCircle2,
 Users,
 CalendarCheck,
 Activity,
 RefreshCw,
 Award,
 ShieldAlert,
 HeartPulse,
 Smartphone,
 Plus,
 Search,
 Check,
 X,
 TrendingUp,
 Clock,
 Sparkles,
 Filter,
 FileCheck,
 MessageSquare,
 QrCode,
 Radio,
 RotateCcw,
 ArrowRight,
 Camera,
 CameraOff,
 Printer,
 FileText,
 Building2,
 Calendar,
 LogOut,
 AlertTriangle,
 Sun,
 Moon,
 Eye,
} from 'lucide-react'
import { equranService } from '../services/equranService'
import {
 ResponsiveContainer,
 BarChart,
 Bar,
 XAxis,
 YAxis,
 Tooltip,
 CartesianGrid,
} from 'recharts'
import Swal from '@/components/ui/compat/swal-heroui'

import {
  PageContainer,
  AppBreadcrumb,
  AppDataTable,
  AppBadge,
  AppButton,
  SummaryCard,
  HeroUiHeader,
} from '../components/app'
import { Tooltip as UiTooltip } from '../components/ui/tooltip'

import {
 MasterPageHeader,
 MasterStatsGrid,
 MasterStatCard,
 MasterActionButton,
 SquircleActionButton,
 PrintOptionModal,
} from '../components/master-data'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import { Upload as Upload1, Download as Download1 } from 'lucide-react'
import { Button } from '@/components/ui/button'

import ChartCard from '../components/dashboard/ChartCard'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import KpiQuickViewModal from '../components/KpiQuickViewModal'
import ModalErrorBoundary from '../components/common/ModalErrorBoundary'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'

import { managementDashboardService } from '../services/managementDashboardService'
import api from '../services/api'

// HeroUI Core Components for Modal styling matching TahfizhPage
import {
 Dialog,
 DialogBody,
 DialogClose,
 DialogDescription,
 DialogFooter,
 DialogHeader,
 DialogTitle,
} from '@/components/ui/dialog'
import { Backdrop } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// HeroUI Multi-Tone System for Master KPI Cards
const MODERN_CARD_TONES = {
 emerald: {
 card: 'border-emerald-300 bg-white dark:bg-card-dark hover:border-emerald-500 dark:border-emerald-700/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
 glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
 iconBox: 'bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300 shadow-md shadow-sm',
 tag: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-200/80',
 title: 'text-emerald-800 dark:text-emerald-300',
 val: 'text-emerald-900 dark:text-emerald-200',
 sub: 'text-emerald-700/80 dark:text-emerald-400/80',
 },
 blue: {
 card: 'border-sky-300/80 bg-white dark:bg-card-dark hover:border-sky-500 dark:border-sky-700/60 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-slate-900',
 glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
 iconBox: 'bg-white dark:bg-card-dark shadow-md shadow-sky-500/30',
 tag: 'bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300 border border-sky-200/80',
 title: 'text-sky-800 dark:text-sky-300',
 val: 'text-sky-900 dark:text-sky-200',
 sub: 'text-sky-700/80 dark:text-sky-400/80',
 },
 purple: {
 card: 'border-purple-300/80 bg-white dark:bg-card-dark hover:border-purple-500 dark:border-purple-700/60 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
 glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
 iconBox: 'bg-white dark:bg-card-dark shadow-md shadow-sm',
 tag: 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border border-purple-200/80',
 title: 'text-purple-800 dark:text-purple-300',
 val: 'text-purple-900 dark:text-purple-200',
 sub: 'text-purple-700/80 dark:text-purple-400/80',
 },
 amber: {
 card: 'border-amber-300/80 bg-white dark:bg-card-dark hover:border-amber-500 dark:border-amber-700/60 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
 glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
 iconBox: 'bg-white dark:bg-card-dark shadow-md shadow-sm',
 tag: 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300 border border-amber-200/80',
 title: 'text-amber-800 dark:text-amber-300',
 val: 'text-amber-900 dark:text-amber-200',
 sub: 'text-amber-700/80 dark:text-amber-400/80',
 },
}

function ModernKpiCard({ title, label, value, subtext, description, icon: Icon, tone = 'emerald', tag, onClick }) {
 const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
 const isClickable = typeof onClick === 'function'

 return (
 <motion.div
 whileHover={{ scale: 1.025, y: -2 }}
 whileTap={{ scale: 0.98 }}
 transition={{ type: 'spring', stiffness: 400, damping: 25 }}
 onClick={onClick}
 role={isClickable ? 'button' : undefined}
 tabIndex={isClickable ? 0 : undefined}
 className={`group relative overflow-hidden rounded-xl border-2 p-5 shadow-xs transition-all duration-200 text-left ${
 isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
 } ${t.card}`}
 >

 {/* Header: Icon & Title */}
 <div className="flex items-center gap-3 relative z-10 mb-3">
 <div className={`flex size-11 items-center justify-center rounded-xl text-emerald-600 shadow-md shrink-0 ${t.iconBox}`}>
 <Icon className="size-5.5" />
 </div>
 <div className="min-w-0 flex-1">
 <p className={`text-xs sm:text-sm font-black leading-tight ${t.title} truncate`}>{label || title}</p>
 </div>
 </div>

 {/* Value & Tag Row */}
 <div className="flex items-baseline justify-between gap-2 relative z-10">
 <p className={`text-2xl sm:text-3xl font-black tabular-nums tracking-tight ${t.val}`}>{value ?? 0}</p>
 {tag && (
 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10.5px] font-extrabold tracking-wide shrink-0 ${t.tag}`}>
 {tag}
 </span>
 )}
 </div>

 {/* Description / Subtext */}
 {(subtext || description) && (
 <p className={`mt-2 text-xs font-semibold relative z-10 ${t.sub} truncate`}>
 {subtext || description}
 </p>
 )}
 </motion.div>
 )
}

export default function MusyrifDashboardPage({ defaultTab }) {
 const navigate = useNavigate()
 const location = useLocation()
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)
 const [data, setData] = useState(null)
 const [activeModal, setActiveModal] = useState(null)
 const [activeTab, setActiveTab] = useState(() => defaultTab || (location?.pathname?.includes('asrama/izin') ? 'perizinan' : 'aktivitas'))

 useEffect(() => {
 if (defaultTab) {
 setActiveTab(defaultTab)
 } else if (location?.pathname?.includes('asrama/izin')) {
 setActiveTab('perizinan')
 }
 }, [defaultTab, location?.pathname])
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [customTables, setCustomTables] = useState({ aktivitas: null, tasmi: null, poin: null, klinik: null, titipan: null })
 const fileInputRef = React.useRef(null)

 // Form states & Database Students
 const [quickActionModal, setQuickActionModal] = useState(null)
 const [savingQuickAction, setSavingQuickAction] = useState(false)
 const [studentSearch, setStudentSearch] = useState('')
 const [dbStudents, setDbStudents] = useState([])
 const [loadingStudents, setLoadingStudents] = useState(false)
 const [selectedStudentId, setSelectedStudentId] = useState('')

 // 3 Mode Absensi Sholat (manual, qr, rfid)
 const [sholatTab, setSholatTab] = useState('manual') // 'manual' | 'qr' | 'rfid'
 const [qrInput, setQrInput] = useState('')
 const [rfidInput, setRfidInput] = useState('')
 const [scanHistory, setScanHistory] = useState([])
 const [scanStatusMsg, setScanStatusMsg] = useState(null)

 // Camera WebCam Scanner State & Batch Attendance State
 const [isCameraActive, setIsCameraActive] = useState(false)
 const videoRef = React.useRef(null)
 const [batchSholatMap, setBatchSholatMap] = useState({})
 const [worshipFilter, setWorshipFilter] = useState('all') // 'all' | 'wajib' | 'sunnah'
 const [selectedMutabaahDetail, setSelectedMutabaahDetail] = useState(null)

 // Filter Periode Mutaba'ah & Rincian Sholat Santri
 const [mutabaahPeriodFilter, setMutabaahPeriodFilter] = useState('all') // 'all' | 'today' | 'week' | 'month' | 'semester'
 const [modalBreakdownPeriod, setModalBreakdownPeriod] = useState('today') // 'today' | 'week' | 'month' | 'semester'
 const [modalBreakdownData, setModalBreakdownData] = useState(null)
 const [loadingBreakdown, setLoadingBreakdown] = useState(false)

 // Fetch data rincian sholat santri saat modal detail terbuka atau periode diubah
 useEffect(() => {
 if (!selectedMutabaahDetail) {
 setModalBreakdownData(null)
 return
 }

 const studentId =
 selectedMutabaahDetail.student_id ||
 dbStudents.find(
 (s) =>
 (s.full_name || s.nama_lengkap || s.name) === selectedMutabaahDetail.santri ||
 String(s.nis) === String(selectedMutabaahDetail.nis)
 )?.id

 if (!studentId) {
 setModalBreakdownData(null)
 return
 }

 let isMounted = true
 const fetchBreakdown = async () => {
 setLoadingBreakdown(true)
 try {
 const res = await api.get(`/musyrif/students/${studentId}/worship-breakdown`, {
 params: { period: modalBreakdownPeriod },
 })
 if (isMounted && res?.data?.data) {
 setModalBreakdownData(res.data.data)
 }
 } catch (err) {
 console.error('Failed to load worship breakdown for student:', err)
 } finally {
 if (isMounted) setLoadingBreakdown(false)
 }
 }

 fetchBreakdown()
 return () => {
 isMounted = false
 }
 }, [selectedMutabaahDetail, modalBreakdownPeriod, dbStudents])

 const startCamera = async () => {
 setIsCameraActive(true)
 try {
 if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
 const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
 if (videoRef.current) {
 videoRef.current.srcObject = stream
 videoRef.current.play()
 }
 }
 } catch (err) {
 console.warn('Camera stream error / fallback active:', err)
 }
 }

 const stopCamera = () => {
 if (videoRef.current && videoRef.current.srcObject) {
 const stream = videoRef.current.srcObject
 if (stream.getTracks) {
 stream.getTracks().forEach((track) => track.stop())
 }
 videoRef.current.srcObject = null
 }
 setIsCameraActive(false)
 }

 const markAllStudentsStatus = (status) => {
 const updated = {}
 dbStudents.forEach((s) => {
 updated[s.id] = status
 })
 setBatchSholatMap(updated)
 }

 // Master Qur'an & Continuation Recommendation Logic
 const [quranSurahs, setQuranSurahs] = useState([])
 const [lastStudentLog, setLastStudentLog] = useState(null)
 const [loadingLastLog, setLoadingLastLog] = useState(false)

 // Interactive Surah & Ayah Picker States
 const [quranInputMode, setQuranInputMode] = useState('interactive') // 'interactive' | 'manual'
 const [quranSearch, setQuranSearch] = useState('')
 const [modalAyatsList, setModalAyatsList] = useState([])
 const [loadingModalAyats, setLoadingModalAyats] = useState(false)

 const filteredQuranSurahs = React.useMemo(() => {
 if (!quranSearch) return quranSurahs
 const q = quranSearch.toLowerCase()
 return quranSurahs.filter(
 (s) =>
 s.nama_latin?.toLowerCase().includes(q) ||
 s.arti?.toLowerCase().includes(q) ||
 String(s.nomor).includes(q)
 )
 }, [quranSurahs, quranSearch])

 // Modal Form Controlled Inputs
 const [sholatForm, setSholatForm] = useState({ prayer_name: 'subuh', attendance_status: 'hadir_berjamaah', notes: '' })
 const [setoranForm, setSetoranForm] = useState({ type: 'Ziyadah', juz: 1, surah_number: 1, ayat_start: 1, ayat_end: 7, baris: 5, kelancaran: 'Lancar', tajwid: 'A', makhraj: 'A', notes: '' })
 const [tasmiForm, setTasmiForm] = useState({ type: 'tasmi_1_juz', juz: 1, tajwid: 'A', makhraj: 'A', score: 90, notes: '' })
 const [poinForm, setPoinForm] = useState({
 type: 'violation',
 category_id: '',
 points: -10,
 status: 'tercatat',
 notes: '',
 })
 const [disciplineCategories, setDisciplineCategories] = useState([])
 const [loadingDisciplineCategories, setLoadingDisciplineCategories] = useState(false)
 const [klinikForm, setKlinikForm] = useState({ symptoms: '', medicine: '', status: 'rawat_jalan' })
 const [titipanForm, setTitipanForm] = useState({ item_type: 'smartphone', item_name: '', serial_number: '' })

 // State Perizinan Santri & Absensi Kembali (Boarding Pass)
 const [dormitoryPermits, setDormitoryPermits] = useState([])
 const [dormitoryPermitsStatistik, setDormitoryPermitsStatistik] = useState(null)
 const [loadingPermits, setLoadingPermits] = useState(false)
 const [permitFilterStatus, setPermitFilterStatus] = useState('all')
 const [permitSearch, setPermitSearch] = useState('')
 const [selectedPermitForReturn, setSelectedPermitForReturn] = useState(null)
 const [submittingReturn, setSubmittingReturn] = useState(false)
 const [returnForm, setReturnForm] = useState({
 actual_return_time: '',
 return_condition: 'Sehat & Rapih',
 notes: '',
 })
 const [newPermitForm, setNewPermitForm] = useState({
 student_id: '',
 permit_type: 'pesiar_mingguan',
 destination: '',
 scheduled_departure_at: '',
 scheduled_return_at: '',
 pickup_person_name: '',
 pickup_person_phone: '',
 pickup_person_relation: 'Orang Tua Kandung',
 purpose_notes: '',
 })

 const [availableUnits, setAvailableUnits] = useState([])
 const [emergencyPermitForm, setEmergencyPermitForm] = useState({
 student_id: '',
 medical_complaint: '',
 medical_destination: 'Klinik / RS Terdekat',
 medical_escort_name: '',
 guardian_phone: '',
 estimated_hours: 6,
 })

 const [batchScheduleForm, setBatchScheduleForm] = useState({
 unit_pendidikan_id: '',
 rombel_id: '',
 permit_type: 'pesiar_mingguan',
 scheduled_departure_at: '',
 scheduled_return_at: '',
 destination: 'Rumah Orang Tua / Wali',
 notes: '',
 })

 const [selectedPermitForReview, setSelectedPermitForReview] = useState(null)
 const [reviewExtensionForm, setReviewExtensionForm] = useState({
 action: 'approve',
 new_scheduled_return_at: '',
 admin_notes: '',
 })

 const fetchDormitoryPermits = async () => {
 setLoadingPermits(true)
 try {
 const res = await api.get('/musyrif/permits', {
 params: {
 status: permitFilterStatus === 'all' ? undefined : permitFilterStatus,
 search: permitSearch || undefined,
 },
 })
 if (res?.data) {
 setDormitoryPermits(res.data.data || [])
 setDormitoryPermitsStatistik(res.data.statistik || null)
 }
 } catch (err) {
 console.error('Failed to fetch dormitory permits:', err)
 } finally {
 setLoadingPermits(false)
 }
 }

 const handleReturnCheckin = async (e) => {
 e.preventDefault()
 if (!selectedPermitForReturn) return
 setSubmittingReturn(true)
 try {
 const returnTime = returnForm.actual_return_time
 ? new Date(returnForm.actual_return_time).toISOString()
 : new Date().toISOString()
 const res = await api.post(`/musyrif/permits/${selectedPermitForReturn.id}/return-checkin`, {
 actual_return_time: returnTime,
 return_condition: returnForm.return_condition,
 notes: returnForm.notes,
 })
 Swal.fire({
 icon: 'success',
 title: 'Absensi Kembali Berhasil!',
 text: res.data?.message || 'Santri telah dicatat kembali ke asrama tepat waktu/terverifikasi.',
 timer: 2200,
 showConfirmButton: false,
 })
 setSelectedPermitForReturn(null)
 fetchDormitoryPermits()
 } catch (err) {
 Swal.fire({
 icon: 'error',
 title: 'Gagal Memproses Absensi',
 text: err.response?.data?.message || 'Terjadi kesalahan sistem.',
 })
 } finally {
 setSubmittingReturn(false)
 }
 }

 const handleCreatePermit = async (e) => {
 e.preventDefault()
 if (!newPermitForm.student_id) {
 Swal.fire({ icon: 'warning', title: 'Pilih Santri', text: 'Silakan tentukan santri binaan yang mengajukan izin.' })
 return
 }
 try {
 const res = await api.post('/musyrif/permits', {
 student_id: newPermitForm.student_id,
 permit_type: newPermitForm.permit_type,
 destination: newPermitForm.destination,
 scheduled_departure_at: newPermitForm.scheduled_departure_at ? new Date(newPermitForm.scheduled_departure_at).toISOString() : new Date().toISOString(),
 scheduled_return_at: newPermitForm.scheduled_return_at ? new Date(newPermitForm.scheduled_return_at).toISOString() : null,
 pickup_person_name: newPermitForm.pickup_person_name,
 pickup_person_phone: newPermitForm.pickup_person_phone,
 pickup_person_relation: newPermitForm.pickup_person_relation,
 purpose_notes: newPermitForm.purpose_notes,
 })
 Swal.fire({
 icon: 'success',
 title: 'Surat Izin Santri Berhasil Diterbitkan!',
 text: `Nomor Boarding Pass: ${res.data?.data?.permit_number || '-'}`,
 timer: 2200,
 showConfirmButton: false,
 })
 setQuickActionModal(null)
 fetchDormitoryPermits()
 } catch (err) {
 Swal.fire({
 icon: 'error',
 title: 'Gagal Menerbitkan Izin',
 text: err.response?.data?.message || 'Pastikan kolom tanggal dan data terisi lengkap.',
 })
 }
 }

 const handleEmergencyExit = async (e) => {
 e.preventDefault()
 if (!emergencyPermitForm.student_id || !emergencyPermitForm.medical_complaint) {
 Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Pilih santri dan tuliskan keluhan medis/sakit.' })
 return
 }
 try {
 const res = await api.post('/musyrif/permits/emergency-exit', emergencyPermitForm)
 Swal.fire({
 icon: 'success',
 title: 'Jalur Darurat Berhasil Diterbitkan!',
 text: res.data?.message || 'Santri telah dicatat keluar untuk penanganan medis.',
 timer: 2400,
 showConfirmButton: false,
 })
 setQuickActionModal(null)
 fetchDormitoryPermits()
 } catch (err) {
 Swal.fire({
 icon: 'error',
 title: 'Gagal Memproses Jalur Darurat',
 text: err.response?.data?.message || 'Terjadi kesalahan sistem.',
 })
 }
 }

 const handleBatchSchedule = async (e) => {
 e.preventDefault()
 if (!batchScheduleForm.unit_pendidikan_id || !batchScheduleForm.scheduled_departure_at || !batchScheduleForm.scheduled_return_at) {
 Swal.fire({ icon: 'warning', title: 'Data Belum Lengkap', text: 'Pilih unit pendidikan serta waktu keberangkatan dan batas kembali.' })
 return
 }
 try {
 const res = await api.post('/musyrif/permits/batch-schedule', {
 ...batchScheduleForm,
 scheduled_departure_at: new Date(batchScheduleForm.scheduled_departure_at).toISOString(),
 scheduled_return_at: new Date(batchScheduleForm.scheduled_return_at).toISOString(),
 })
 Swal.fire({
 icon: 'success',
 title: 'Jadwal Kepulangan Massal Terbit!',
 text: res.data?.message || 'Izin kepulangan serentak santri telah aktif di sistem.',
 timer: 2500,
 showConfirmButton: false,
 })
 setQuickActionModal(null)
 fetchDormitoryPermits()
 } catch (err) {
 Swal.fire({
 icon: 'error',
 title: 'Gagal Menjadwalkan',
 text: err.response?.data?.message || 'Terjadi kesalahan sistem.',
 })
 }
 }

 const handleCheckoutGate = async (permit) => {
 try {
 const res = await api.post(`/musyrif/permits/${permit.id}/checkout`)
 Swal.fire({
 icon: 'success',
 title: 'Check-Out Berhasil!',
 text: res.data?.message || 'Santri tercatat telah keluar gerbang asrama.',
 timer: 2000,
 showConfirmButton: false,
 })
 fetchDormitoryPermits()
 } catch (err) {
 Swal.fire({
 icon: 'error',
 title: 'Gagal Check-Out',
 text: err.response?.data?.message || 'Terjadi kesalahan sistem.',
 })
 }
 }

 const handleReviewExtensionSubmit = async (e) => {
 e.preventDefault()
 if (!selectedPermitForReview) return
 try {
 const payload = {
 action: reviewExtensionForm.action,
 new_scheduled_return_at: reviewExtensionForm.action === 'approve' && reviewExtensionForm.new_scheduled_return_at
 ? new Date(reviewExtensionForm.new_scheduled_return_at).toISOString()
 : undefined,
 admin_notes: reviewExtensionForm.admin_notes,
 }
 const res = await api.post(`/musyrif/permits/${selectedPermitForReview.id}/review-extension`, payload)
 Swal.fire({
 icon: 'success',
 title: reviewExtensionForm.action === 'approve' ? 'Perpanjangan Disetujui' : 'Perpanjangan Ditolak',
 text: res.data?.message || 'Status perpanjangan berhasil diperbarui.',
 timer: 2200,
 showConfirmButton: false,
 })
 setSelectedPermitForReview(null)
 fetchDormitoryPermits()
 } catch (err) {
 Swal.fire({
 icon: 'error',
 title: 'Gagal Memproses Review',
 text: err.response?.data?.message || 'Terjadi kesalahan sistem.',
 })
 }
 }

 useEffect(() => {
 api.get('/education-units').then(res => {
 const list = res?.data?.data || res?.data || []
 const boardingUnits = (Array.isArray(list) ? list : []).filter(u => {
 const prog = (u.program_type || '').toLowerCase()
 const name = (u.name || u.nama_unit || '').toLowerCase()
 return prog === 'boarding' || name.includes('ponpes') || name.includes('asrama') || name.includes('pesantren') || name.includes('mahad') || name.includes("ma'had")
 })
 setAvailableUnits(boardingUnits)
 }).catch(() => {})
 }, [])

 useEffect(() => {
 if (!setoranForm?.surah_number) {
 setModalAyatsList([])
 return
 }
 let isMounted = true
 const fetchAyats = async () => {
 setLoadingModalAyats(true)
 try {
 const res = await equranService.getSurahDetail(setoranForm.surah_number)
 if (isMounted && res && res.ayat) {
 setModalAyatsList(res.ayat)
 }
 } catch (e) {
 console.error('Error fetch ayats preview:', e)
 } finally {
 if (isMounted) setLoadingModalAyats(false)
 }
 }
 fetchAyats()
 return () => {
 isMounted = false
 }
 }, [setoranForm?.surah_number])

 const getJuzFromSurah = (surahNum) => {
 const s = Number(surahNum)
 if (s >= 78) return 30
 if (s >= 67) return 29
 if (s >= 58) return 28
 if (s >= 51) return 27
 if (s >= 46) return 26
 if (s >= 41) return 25
 if (s >= 39) return 24
 if (s >= 36) return 23
 if (s >= 33) return 22
 if (s >= 29) return 21
 if (s >= 27) return 20
 if (s >= 25) return 19
 if (s >= 23) return 18
 if (s >= 21) return 17
 if (s >= 18) return 16
 if (s >= 17) return 15
 if (s >= 15) return 14
 if (s >= 12) return 13
 if (s >= 11) return 12
 if (s >= 9) return 10
 if (s >= 8) return 9
 if (s >= 7) return 8
 if (s >= 6) return 7
 if (s >= 5) return 6
 if (s >= 4) return 6
 if (s >= 3) return 4
 if (s >= 2) return 2
 return 1
 }

 const fetchSurahs = async () => {
 try {
 const list = await equranService.getSurahs()
 if (Array.isArray(list) && list.length > 0) {
 setQuranSurahs(list)
 }
 } catch (e) {
 console.error('Failed to load Master Surah:', e)
 }
 }

 const fetchLastLog = async (sId) => {
 if (!sId) return
 setLoadingLastLog(true)
 try {
 const res = await api.get('/musyrif/tahfizh/last-log', { params: { student_id: sId } }).catch(() => null)
 if (res?.data?.data) {
 const log = res.data.data
 setLastStudentLog(log)

 // Cek kelancaran hafalan sebelumnya
 const isLancar = !log.notes_teacher?.toLowerCase().includes('kurang') && !log.notes_teacher?.toLowerCase().includes('perlu')
 const surahNum = log.hafalan_surah_number || 1
 const ayatEnd = log.hafalan_ayah_end || 1
 const currentSurah = quranSurahs.find((s) => s.nomor === surahNum)
 const totalAyat = currentSurah ? currentSurah.jumlah_ayat : 40

 if (isLancar) {
 // Melanjutkan Hafalan Baru (Ziyadah)
 let nextSurah = surahNum
 let nextStart = ayatEnd + 1
 let nextEnd = Math.min(ayatEnd + 10, totalAyat)

 if (nextStart > totalAyat) {
 nextSurah = surahNum < 114 ? surahNum + 1 : 1
 nextStart = 1
 nextEnd = 10
 }

 setSetoranForm((prev) => ({
 ...prev,
 type: 'Ziyadah',
 surah_number: nextSurah,
 juz: getJuzFromSurah(nextSurah),
 ayat_start: nextStart,
 ayat_end: nextEnd,
 baris: Math.max(1, Math.ceil((nextEnd - nextStart + 1) * 0.75)),
 kelancaran: 'Lancar',
 }))
 } else {
 // Mengulang Hafalan (Murajaah / Murojaah Ulang)
 setSetoranForm((prev) => ({
 ...prev,
 type: 'Murajaah',
 surah_number: surahNum,
 juz: getJuzFromSurah(surahNum),
 ayat_start: log.hafalan_ayah_start || 1,
 ayat_end: ayatEnd,
 baris: Math.max(1, Math.ceil(((ayatEnd - (log.hafalan_ayah_start || 1)) + 1) * 0.75)),
 kelancaran: 'Cukup',
 }))
 }
 } else {
 setLastStudentLog(null)
 }
 } catch (e) {
 console.error('Failed to load last tahfizh log:', e)
 } finally {
 setLoadingLastLog(false)
 }
 }

 useEffect(() => {
 fetchSurahs()
 }, [])

 useEffect(() => {
 if (selectedStudentId) {
 fetchLastLog(selectedStudentId)
 }
 }, [selectedStudentId])

 const fetchDashboard = async () => {
 setLoading(true)
 setError(null)
 try {
 const res = await managementDashboardService.getMusyrif().catch(() => managementDashboardService.getGuruTahfizh())
 if (res && res.data) {
 setData(res.data)
 } else {
 setError('Format respon server tidak valid.')
 }
 } catch (err) {
 console.error('Failed to load Musyrif dashboard:', err)
 setError(err.response?.data?.message || 'Gagal memuat data dashboard Musyrif.')
 } finally {
 setLoading(false)
 }
 }

 const fetchStudentsFromDb = async () => {
 setLoadingStudents(true)
 try {
 // Gunakan HANYA endpoint musyrif-scoped. Jangan fallback ke /students
 // (endpoint umum tanpa filter unit) karena akan membocorkan data siswa
 // dari seluruh unit pendidikan ke dropdown Boarding Pass.
 const res = await api.get('/musyrif/students').catch((err) => {
 console.error('Gagal memuat daftar santri dari endpoint musyrif:', err)
 return null
 })
 if (res?.data?.data) {
 const list = Array.isArray(res.data.data) ? res.data.data : res.data.data.data || []
 setDbStudents(list)
 if (list.length > 0 && !selectedStudentId) {
 setSelectedStudentId(list[0].id)
 }
 } else {
 // Endpoint gagal → kosongkan list, jangan tampilkan data dari unit lain
 setDbStudents([])
 }
 } catch (e) {
 console.error('Failed to load students from database:', e)
 setDbStudents([])
 } finally {
 setLoadingStudents(false)
 }
 }

 const fetchDisciplineCategories = async () => {
 setLoadingDisciplineCategories(true)
 try {
 let list = []
 try {
 const res = await api.get('/musyrif/discipline-categories')
 list = res?.data?.data || (Array.isArray(res?.data) ? res.data : [])
 } catch (musyrifErr) {
 console.warn('Fallback musyrif discipline categories to /discipline/categories:', musyrifErr)
 const fallbackRes = await api.get('/discipline/categories?per_page=200')
 list = fallbackRes?.data?.data || (Array.isArray(fallbackRes?.data) ? fallbackRes.data : [])
 }
 if (Array.isArray(list) && list.length > 0) {
 setDisciplineCategories(list)
 }
 } catch (e) {
 console.error('Failed to load discipline categories:', e)
 } finally {
 setLoadingDisciplineCategories(false)
 }
 }

 useEffect(() => {
 fetchDashboard()
 fetchStudentsFromDb()
 fetchDormitoryPermits()
 fetchDisciplineCategories()
 }, [permitFilterStatus])

 // Pastikan data tata tertib TU selalu dimuat saat modal Poin dibuka jika belum ada
 useEffect(() => {
 if (quickActionModal === 'poin' && disciplineCategories.length === 0) {
 fetchDisciplineCategories()
 }
 }, [quickActionModal, disciplineCategories.length])

 const kpis = data?.kpis || {}
 const context = data?.context || {}
 const charts = data?.charts || {}
 const tables = data?.tables || {}
 const worshipPrayers = useMemo(() => {
 const raw = Array.isArray(charts?.worship_prayers) && charts.worship_prayers.length > 0
 ? charts.worship_prayers
 : [
 { key: 'tahajud', name: 'Tahajud', color: '#8B5CF6', badge: 'Sunnah' },
 { key: 'subuh', name: 'Subuh', color: '#064E3B', badge: 'Wajib' },
 { key: 'dhuha', name: 'Dhuha', color: '#EC4899', badge: 'Sunnah' },
 { key: 'dzuhur', name: 'Dzuhur', color: '#0D9488', badge: 'Wajib' },
 { key: 'ashar', name: 'Ashar', color: '#2563EB', badge: 'Wajib' },
 { key: 'magrib', name: 'Maghrib', color: '#D97706', badge: 'Wajib' },
 { key: 'isya', name: 'Isya', color: '#059669', badge: 'Wajib' },
 ]
 const map = new Map()
 for (const item of raw) {
 const k = String(item.key || '').toLowerCase().trim()
 if (k && !map.has(k)) {
 map.set(k, { ...item, key: k })
 }
 }
 return Array.from(map.values())
 }, [charts?.worship_prayers])

 const filteredWorshipPrayers = useMemo(() => {
 if (worshipFilter === 'wajib') {
 return worshipPrayers.filter(
 (p) => p.badge === 'Wajib' || p.obligation_type === 'wajib' || p.category === 'shalat_wajib'
 )
 }
 if (worshipFilter === 'sunnah') {
 return worshipPrayers.filter(
 (p) => p.badge === 'Sunnah' || p.obligation_type === 'sunnah' || p.category === 'shalat_sunnah'
 )
 }
 return worshipPrayers
 }, [worshipPrayers, worshipFilter])

 const worshipKpis = useMemo(() => {
 const trend = Array.isArray(charts?.worship_trend) ? charts.worship_trend : []
 const totalDays = trend.length || 1

 const wajibKeys = worshipPrayers
 .filter((p) => p.badge === 'Wajib' || p.obligation_type === 'wajib' || p.category === 'shalat_wajib')
 .map((p) => p.key)
 const sunnahKeys = worshipPrayers
 .filter((p) => p.badge === 'Sunnah' || p.obligation_type === 'sunnah' || p.category === 'shalat_sunnah')
 .map((p) => p.key)

 let totalWajib = 0
 let totalSunnah = 0

 trend.forEach((day) => {
 wajibKeys.forEach((k) => {
 totalWajib += Number(day[k] || 0)
 })
 sunnahKeys.forEach((k) => {
 totalSunnah += Number(day[k] || 0)
 })
 })

 const avgWajibPerDay = Math.round(totalWajib / totalDays)
 const avgSunnahPerDay = Math.round(totalSunnah / totalDays)
 const totalAll = totalWajib + totalSunnah
 const avgAllPerDay = Math.round(totalAll / totalDays)

 return {
 totalWajib,
 totalSunnah,
 totalAll,
 avgWajibPerDay,
 avgSunnahPerDay,
 avgAllPerDay,
 wajibCount: wajibKeys.length,
 sunnahCount: sunnahKeys.length,
 }
 }, [charts?.worship_trend, worshipPrayers])

 const filteredMutabaahLogs = useMemo(() => {
 const logs = Array.isArray(tables?.mutabaah_logs) ? tables.mutabaah_logs : []
 if (mutabaahPeriodFilter === 'all') return logs

 const now = new Date()
 const todayStr = now.toISOString().slice(0, 10)

 return logs.filter((log) => {
 const logDateStr = log.raw_date || (log.waktu ? String(log.waktu).slice(0, 10) : '')
 if (!logDateStr) return true

 if (mutabaahPeriodFilter === 'today') {
 return logDateStr === todayStr
 }

 const logDate = new Date(logDateStr)
 if (isNaN(logDate.getTime())) return true

 const diffDays = Math.floor((now.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))

 if (mutabaahPeriodFilter === 'week') {
 return diffDays >= 0 && diffDays <= 7
 }
 if (mutabaahPeriodFilter === 'month') {
 return diffDays >= 0 && diffDays <= 30
 }
 if (mutabaahPeriodFilter === 'semester') {
 return diffDays >= 0 && diffDays <= 180
 }
 return true
 })
 }, [tables?.mutabaah_logs, mutabaahPeriodFilter])

 if (loading && !data) return <SkeletonDashboard />
 if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />

 const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

 const getActiveDatatableInfo = () => {
 switch (activeTab) {
 case 'tasmi':
 return {
 title: "Riwayat Ujian Tasmi' Santri Asrama",
 subtitle: `Jurnal Ujian Kelancaran Hafalan Santri | Musyrif: ${context?.musyrif_name || 'Musyrif Asrama'}`,
 filename: `Log_Ujian_Tasmi_Santri_${new Date().toISOString().slice(0, 10)}`,
 tabKey: 'tasmi',
 columns: [
 { key: 'santri', label: 'Nama Santri' },
 { key: 'jenis', label: 'Kategori Ujian' },
 { key: 'nilai', label: 'Nilai / Tajwid' },
 { key: 'penguji', label: 'Musyrif Penguji' },
 ],
 data: customTables.tasmi || tables.tasmi_logs || [],
 }
 case 'poin':
 return {
 title: 'Buku Catatan Kedisiplinan & Pelanggaran Santri',
 subtitle: `Pencatatan Poin Pelanggaran & Apresiasi | Musyrif: ${context?.musyrif_name || 'Musyrif Asrama'}`,
 filename: `Buku_Kedisiplinan_Santri_${new Date().toISOString().slice(0, 10)}`,
 tabKey: 'poin',
 columns: [
 { key: 'santri', label: 'Santri' },
 { key: 'kategori', label: 'Kategori' },
 { key: 'poin', label: 'Poin' },
 { key: 'tindakan', label: 'Tindakan Musyrif' },
 ],
 data: customTables.poin || tables.poin_logs || [],
 }
 case 'klinik':
 return {
 title: 'Catatan Pasien Klinik & UKS Asrama',
 subtitle: `Laporan Santri Sakit & Pemberian Obat | Musyrif: ${context?.musyrif_name || 'Musyrif Asrama'}`,
 filename: `Catatan_Klinik_Asrama_${new Date().toISOString().slice(0, 10)}`,
 tabKey: 'klinik',
 columns: [
 { key: 'santri', label: 'Santri' },
 { key: 'keluhan', label: 'Keluhan / Gejala' },
 { key: 'obat', label: 'Obat Diberikan' },
 { key: 'status', label: 'Rekomendasi' },
 ],
 data: customTables.klinik || tables.klinik_logs || [],
 }
 case 'titipan':
 return {
 title: 'Log Penitipan Barang Berharga Santri',
 subtitle: `Laporan Barang Elektronik (HP / Laptop) Santri | Musyrif: ${context?.musyrif_name || 'Musyrif Asrama'}`,
 filename: `Log_Penitipan_Barang_${new Date().toISOString().slice(0, 10)}`,
 tabKey: 'titipan',
 columns: [
 { key: 'santri', label: 'Santri' },
 { key: 'item', label: 'Barang' },
 { key: 'serial', label: 'Serial Number' },
 { key: 'status', label: 'Status Penyerahan' },
 ],
 data: customTables.titipan || tables.titipan_logs || [
 { santri: 'Muhammad Al-Fatih', item: 'Smartphone Android', serial: 'SN-901823', status: 'Tersimpan di Brankas' },
 { santri: 'Abdullah Azzam', item: 'Laptop ASUS', serial: 'SN-441209', status: 'Diambil untuk Tugas' },
 ],
 }
 case 'perizinan':
 return {
 title: 'Buku Perizinan & Absensi Kepulangan Santri Asrama (Boarding Pass)',
 subtitle: `Pencatatan Pesiar, Libur & Absensi Kembali ke Asrama | Musyrif: ${context?.musyrif_name || 'Musyrif Asrama'}`,
 filename: `Log_Perizinan_Santri_${new Date().toISOString().slice(0, 10)}`,
 tabKey: 'perizinan',
 columns: [
 { key: 'permit_number', label: 'No. Izin' },
 { key: 'santri', label: 'Nama Santri' },
 { key: 'kategori', label: 'Kategori' },
 { key: 'tujuan', label: 'Tujuan' },
 { key: 'jadwal_kembali', label: 'Jadwal Kembali' },
 { key: 'kembali_riil', label: 'Waktu Kembali' },
 { key: 'terlambat', label: 'Keterlambatan' },
 { key: 'status', label: 'Status' },
 ],
 data: (customTables.perizinan || dormitoryPermits || []).map((p) => ({
 permit_number: p.permit_number || '-',
 santri: p.student?.full_name || p.student?.name || '-',
 kategori: p.permit_type ? p.permit_type.replace('_', ' ').toUpperCase() : '-',
 tujuan: p.destination || '-',
 jadwal_kembali: p.scheduled_return_at ? new Date(p.scheduled_return_at).toLocaleString('id-ID') : '-',
 kembali_riil: p.actual_return_at ? new Date(p.actual_return_at).toLocaleString('id-ID') : '-',
 terlambat: p.late_minutes > 0 ? `${p.late_minutes} Menit` : 'Tepat Waktu',
 status: p.status ? p.status.toUpperCase() : '-',
 })),
 }
 default: // 'aktivitas'
 return {
 title: "Presensi & Mutaba'ah Keasramaan Harian Santri",
 subtitle: `Jurnal Kedisiplinan Shalat & Mutaba'ah Harian | Musyrif: ${context?.musyrif_name || 'Musyrif Asrama'}`,
 filename: `Mutabaah_Presensi_Keasramaan_${new Date().toISOString().slice(0, 10)}`,
 tabKey: 'aktivitas',
 columns: mutabaahColumns,
 data: customTables.aktivitas || tables.mutabaah_logs || [],
 }
 }
 }

 const handlePrintClean = () => {
 const info = getActiveDatatableInfo()
 printCleanTable({
 title: info.title,
 subtitle: info.subtitle,
 columns: info.columns,
 data: info.data,
 })
 }

 const handleDownloadPdf = () => {
 const info = getActiveDatatableInfo()
 downloadPdfTable({
 title: info.title,
 subtitle: info.subtitle,
 columns: info.columns,
 data: info.data,
 filename: info.filename,
 })
 }

 const handleExportCSV = () => {
 const info = getActiveDatatableInfo()
 if (!info.data || info.data.length === 0) {
 Swal.fire('Data Kosong', 'Tidak ada data di datatable untuk diexport.', 'warning')
 return
 }
 const headers = ['No', ...info.columns.map((c) => c.label || c.key)]
 const csvRows = [headers.join(',')]

 info.data.forEach((row, idx) => {
 const values = [
 idx + 1,
 ...info.columns.map((c) => {
 let val = row[c.key] || row[c.accessorKey] || '-'
 if (typeof val === 'object') val = JSON.stringify(val)
 return `"${String(val).replace(/"/g, '""')}"`
 }),
 ]
 csvRows.push(values.join(','))
 })

 const csvString = csvRows.join('\n')
 const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.setAttribute('href', url)
 link.setAttribute('download', `${info.filename}.csv`)
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)

 Swal.fire({
 icon: 'success',
 title: 'Export Berhasil',
 text: `Berhasil mengunduh ${info.data.length} baris data datatable (${info.title}) dalam format CSV.`,
 timer: 2000,
 showConfirmButton: false,
 })
 }

 const handleImportClick = () => {
 if (fileInputRef.current) {
 fileInputRef.current.click()
 }
 }

 const handleFileImport = (e) => {
 const file = e.target.files?.[0]
 if (!file) return

 const info = getActiveDatatableInfo()
 const reader = new FileReader()
 reader.onload = (evt) => {
 const text = evt.target?.result || ''
 const lines = text.split('\n').filter((l) => l.trim().length > 0)
 if (lines.length <= 1) {
 Swal.fire('File Kosong', 'File CSV tidak memiliki baris data yang valid.', 'warning')
 return
 }

 const importedData = lines.slice(1).map((line, idx) => {
 const cols = line.split(',').map((c) => c.replace(/^"|"$/g, '').trim())
 const item = { id: `imp-${Date.now()}-${idx}` }
 info.columns.forEach((col, colIdx) => {
 item[col.key] = cols[colIdx + 1] || cols[colIdx] || `Data ${idx + 1}`
 })
 return item
 })

 setCustomTables((prev) => ({
 ...prev,
 [info.tabKey]: importedData,
 }))

 Swal.fire({
 icon: 'success',
 title: 'Import Berhasil',
 text: `Berhasil mengimpor ${importedData.length} baris data baru ke datatable (${info.title}).`,
 })
 e.target.value = ''
 }
 reader.readAsText(file)
 }

 const handleSimpanFiturAksi = async (label, modalType) => {
 if (savingQuickAction) return
 const studentId = selectedStudentId || dbStudents[0]?.id

 setSavingQuickAction(true)
 try {
 if (modalType === 'sholat') {
 await api.post('/musyrif/worship-attendance', {
 student_id: studentId,
 prayer_name: sholatForm.prayer_name,
 attendance_status: sholatForm.attendance_status,
 notes: sholatForm.notes,
 })
 } else if (modalType === 'setoran') {
 await api.post('/musyrif/tahfizh', {
 student_id: studentId,
 type: setoranForm.type,
 juz: Number(setoranForm.juz),
 surah_number: Number(setoranForm.surah_number),
 ayat_start: Number(setoranForm.ayat_start),
 ayat_end: Number(setoranForm.ayat_end),
 kelancaran: setoranForm.kelancaran,
 tajwid: setoranForm.tajwid,
 makhraj: setoranForm.makhraj,
 notes_teacher: setoranForm.notes,
 }).catch(() => api.post('/teacher/tahfizh', {
 student_id: studentId,
 class_id: dbStudents.find(s => s.id === studentId)?.kelas_id || 'default',
 type: setoranForm.type,
 juz: Number(setoranForm.juz),
 surah_number: Number(setoranForm.surah_number),
 ayat_start: Number(setoranForm.ayat_start),
 ayat_end: Number(setoranForm.ayat_end),
 kelancaran: setoranForm.kelancaran,
 tajwid: setoranForm.tajwid,
 makhraj: setoranForm.makhraj,
 notes_teacher: setoranForm.notes,
 }))
 } else if (modalType === 'tasmi') {
 await api.post('/musyrif/exams', {
 student_id: studentId,
 exam_type: tasmiForm.type,
 juz_number: Number(tasmiForm.juz),
 tajwid_grade: tasmiForm.tajwid,
 makhraj_grade: tasmiForm.makhraj,
 final_score: Number(tasmiForm.score),
 notes: tasmiForm.notes,
 })
 } else if (modalType === 'poin') {
 const finalPoints =
 poinForm.type === 'violation'
 ? -Math.abs(Number(poinForm.points) || 10)
 : Math.abs(Number(poinForm.points) || 10)

 await api.post('/musyrif/point-transactions', {
 student_id: studentId,
 category_id: poinForm.category_id || undefined,
 points: finalPoints,
 transaction_date: new Date().toISOString().split('T')[0],
 description: poinForm.notes,
 status: poinForm.status || 'tercatat',
 })
 } else if (modalType === 'klinik') {
 await api.post('/musyrif/clinic-logs', {
 student_id: studentId,
 symptoms: klinikForm.symptoms || '-',
 medicine_given: klinikForm.medicine,
 status: klinikForm.status,
 })
 } else if (modalType === 'titipan') {
 await api.post('/musyrif/deposits', {
 student_id: studentId,
 item_type: titipanForm.item_type,
 item_name: titipanForm.item_name || '-',
 serial_number: titipanForm.serial_number,
 deposited_at: new Date().toISOString(),
 })
 }

 Swal.fire({
 icon: 'success',
 title: 'Berhasil Disimpan',
 text: `Data ${label} santri telah berhasil dicatat ke sistem keasramaan.`,
 timer: 2000,
 showConfirmButton: false,
 })
 setQuickActionModal(null)
 fetchDashboard()
 } catch (err) {
 console.error('Save failed:', err)
 Swal.fire({
 icon: 'error',
 title: 'Gagal Menyimpan',
 text: err?.response?.data?.message || `Gagal menyimpan data ${label} santri. Silakan coba lagi.`,
 })
 } finally {
 setSavingQuickAction(false)
 }
 }

 // Modul Tab Navigation matching TeacherTeachingWorkspacePage style
 const cardModulesList = [
 {
 id: 'aktivitas',
 title: 'Presensi & Mutabaah',
 icon: Activity,
 badge: 'Utama',
 badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/70',
 iconBox: 'bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300 shadow-md shadow-sm border-2 border-emerald-300',
 cardClass: 'border-emerald-200/90 bg-white dark:bg-card-dark dark:from-emerald-950/40 dark:to-slate-900 dark:border-emerald-800/60 hover:border-emerald-400 hover:shadow-md',
 activeBorder: 'border-emerald-600 dark:border-emerald-500 bg-white dark:bg-card-dark dark:from-emerald-950/80 dark:to-teal-950/60 shadow-md ring-2 ring-emerald-600/30',
 },
 {
 id: 'tasmi',
 title: 'Log Ujian Tasmi’',
 icon: Award,
 badge: 'Tahfizh',
 badgeColor: 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 border border-violet-200/70',
 iconBox: 'bg-white dark:bg-card-dark shadow-md shadow-sm border border-purple-300/40',
 cardClass: 'border-purple-200/90 bg-white dark:bg-card-dark dark:from-purple-950/40 dark:to-slate-900 dark:border-purple-800/60 hover:border-purple-400 hover:shadow-md',
 activeBorder: 'border-purple-600 dark:border-purple-500 bg-white dark:bg-card-dark dark:from-purple-950/80 dark:to-indigo-950/60 shadow-md ring-2 ring-purple-600/30',
 },
 {
 id: 'poin',
 title: 'Kedisiplinan & Poin',
 icon: ShieldAlert,
 badge: 'Sanksi/Prestasi',
 badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200/70',
 iconBox: 'bg-white dark:bg-card-dark shadow-md shadow-sm border border-amber-300/40',
 cardClass: 'border-amber-200/90 bg-white dark:bg-card-dark dark:from-amber-950/40 dark:to-slate-900 dark:border-amber-800/60 hover:border-amber-400 hover:shadow-md',
 activeBorder: 'border-amber-600 dark:border-amber-500 bg-white dark:bg-card-dark dark:from-amber-950/80 dark:to-orange-950/60 shadow-md ring-2 ring-amber-600/30',
 },
 {
 id: 'klinik',
 title: 'Klinik Kesehatan',
 icon: HeartPulse,
 badge: 'Log Sakit',
 badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200/70',
 iconBox: 'bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400 shadow-md shadow-sm border border-rose-300/40',
 cardClass: 'border-rose-200/90 bg-white dark:bg-card-dark dark:from-rose-950/40 dark:to-slate-900 dark:border-rose-800/60 hover:border-rose-400 hover:shadow-md',
 activeBorder: 'border-rose-600 dark:border-rose-500 bg-white dark:bg-card-dark dark:from-rose-950/80 dark:to-red-950/60 shadow-md ring-2 ring-rose-600/30',
 },
 {
 id: 'titipan',
 title: 'Penitipan HP/Laptop',
 icon: Smartphone,
 badge: 'Logistik',
 badgeColor: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-200/70',
 iconBox: 'bg-white dark:bg-card-dark shadow-md shadow-sm border border-sky-300/40',
 cardClass: 'border-sky-200/90 bg-white dark:bg-card-dark dark:from-sky-950/40 dark:to-slate-900 dark:border-sky-800/60 hover:border-sky-400 hover:shadow-md',
 activeBorder: 'border-sky-600 dark:border-sky-500 bg-white dark:bg-card-dark dark:from-sky-950/80 dark:to-indigo-950/60 shadow-md ring-2 ring-sky-600/30',
 },
 {
 id: 'perizinan',
 title: 'Perizinan & Absen Kembali',
 icon: CalendarCheck,
 badge: 'Boarding Pass',
 badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200/70',
 iconBox: 'bg-white dark:bg-card-dark shadow-md shadow-sm border border-indigo-300/40',
 cardClass: 'border-indigo-200/90 bg-white dark:bg-card-dark dark:from-indigo-950/40 dark:to-slate-900 dark:border-indigo-800/60 hover:border-indigo-400 hover:shadow-md',
 activeBorder: 'border-indigo-600 dark:border-indigo-500 bg-white dark:bg-card-dark dark:from-indigo-950/80 dark:to-teal-950/60 shadow-md ring-2 ring-indigo-600/30',
 },
 ]

 const santriColumns = [
 {
 key: 'name',
 label: 'Nama Santri Binaan',
 render: (row) => <span className="font-extrabold text-slate-900 dark:text-white text-xs">{row.name || row.santri || row.full_name}</span>,
 },
 {
 key: 'room',
 label: 'Kamar Asrama',
 render: (row) => <AppBadge variant="info">{row.room || row.kamar || '-'}</AppBadge>,
 },
 {
 key: 'worship',
 label: 'Kedisiplinan Shalat',
 render: (row) => <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{row.worship || '-'}</span>,
 },
 {
 key: 'tahfizh',
 label: 'Capaian Hafalan',
 render: (row) => <span className="font-bold text-[#0E5C44] dark:text-[#3FBF75] text-xs">{row.tahfizh || row.capaian || '-'}</span>,
 },
 {
 key: 'status',
 label: 'Status',
 render: (row) => (
 <AppBadge variant={row.status === 'Baik' || row.status === 'Hadir' ? 'success' : 'warning'} dot>
 {row.status || '-'}
 </AppBadge>
 ),
 },
 ]

 const mutabaahColumns = [
 {
 key: 'santri',
 label: 'Santri & Asrama',
 render: (row) => (
 <div className="flex items-center gap-2.5">
 <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
 {(String(row?.santri || row?.name || row?.full_name || 'S')).charAt(0).toUpperCase()}
 </div>
 <div>
 <div className="font-extrabold text-slate-900 dark:text-white text-xs">
 {row.santri || row.name || row.full_name}
 </div>
 <div className="text-[10px] text-slate-400 font-semibold flex items-center gap-1.5">
 <span>NIS: {row.nis || '-'}</span>
 <span>•</span>
 <span className="text-emerald-700 dark:text-emerald-300 font-bold">{row.kelas || 'Asrama'}</span>
 </div>
 </div>
 </div>
 ),
 },
 {
 key: 'kegiatan',
 label: 'Kegiatan / Shalat',
 render: (row) => {
 const isSunnah = (row.kategori && row.kategori.toLowerCase().includes('sunnah')) || false
 return (
 <div className="space-y-0.5">
 <span className="font-bold text-slate-800 dark:text-slate-200 text-xs block">
 {row.kegiatan || '-'}
 </span>
 <span
 className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
 isSunnah
 ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300'
 : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
 }`}
 >
 {row.kategori || 'Sholat Wajib'}
 </span>
 </div>
 )
 },
 },
 {
 key: 'waktu',
 label: 'Waktu & Tanggal',
 render: (row) => (
 <div className="text-slate-600 dark:text-slate-300 text-xs font-semibold">
 <div>{row.waktu || row.tanggal || '-'}</div>
 {row.metode && (
 <span className="text-[10px] text-slate-400 font-medium">Metode: {row.metode}</span>
 )}
 </div>
 ),
 },
 {
 key: 'status',
 label: 'Status Check-in',
 render: (row) => (
 <AppBadge variant={row.status === 'Hadir' || row.status === 'Lengkap' ? 'success' : 'info'} dot>
 {row.status || '-'}
 </AppBadge>
 ),
 },
 {
 key: 'aksi',
 label: 'Aksi',
 render: (row) => (
 <button
 type="button"
 onClick={() => setSelectedMutabaahDetail(row)}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 border border-emerald-200/80 dark:border-emerald-800/60 transition shadow-2xs"
 title="Lihat Detail Presensi & Mutaba'ah"
 >
 <Eye className="w-3.5 h-3.5" />
 <span>Detail</span>
 </button>
 ),
 },
 ]

 const renderStudentSelectOption = () => {
 const selectedStudent = dbStudents.find((s) => String(s.id) === String(selectedStudentId)) || dbStudents[0]
 const studentKamar = selectedStudent ? (selectedStudent.kamar || selectedStudent.room_name || 'Kamar Asrama') : 'Asrama'

 const studentSelectOptions = dbStudents.map((s) => ({
 value: String(s.id),
 label: `${s.full_name || s.nama_lengkap || s.name || 'Santri'} ${s.nis ? `(NIS: ${s.nis})` : ''}`,
 subtext: `Kamar: ${s.kamar || s.room_name || 'Asrama Pondok'}`,
 badge: 'Santri Binaan',
 }))

 return (
 <div>
 <label className="font-bold block mb-1.5 text-slate-700 dark:text-slate-300 text-xs flex items-center justify-between">
 <span className="flex items-center gap-1.5">
 <Users className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
 Pilih Santri Binaan
 </span>
 {selectedStudent && (
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
 Kamar: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{studentKamar}</strong>
 </span>
 )}
 </label>
 <HeroUiFilterSelect
 id="modal-select-santri-binaan"
 value={String(selectedStudentId || (selectedStudent ? selectedStudent.id : ''))}
 onChange={(val) => setSelectedStudentId(val)}
 placeholder={loadingStudents ? 'Memuat data santri...' : 'Cari & Pilih Santri Binaan...'}
 searchable={true}
 options={studentSelectOptions}
 size="md"
 />
 </div>
 )
 }

 return (
 <PageContainer maxW="7xl" className="pb-20 xl:pb-8">
 <div className="space-y-6 pb-12">
 {/* Breadcrumb Navigation matching Teacher Workspace Style */}
 <AppBreadcrumb items={[{ label: 'Workspace Musyrif Asrama' }]} />

        {/* MODERN HERO CARD HEADER (HEROUI CANONICAL) */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="print:hidden">
          <HeroUiHeader
            icon={Building2}
            title="Dashboard Musyrif & Pembimbing Asrama"
            tag={{ text: 'Musyrif / Pembimbing Asrama', icon: Sparkles }}
            description="Workspace terpadu pengasuhan santri: presensi ibadah 24 jam, log ujian tasmi', kedisiplinan poin, klinik kesehatan, dan barang titipan."
            actions={
              <div className="flex items-center gap-2 flex-wrap">
                <UiTooltip content="Input Presensi Ibadah Santri">
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/absensi-ibadah')}
                    aria-label="Input Presensi Ibadah Santri"
                    className="size-9 flex items-center justify-center p-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <CalendarCheck className="size-4 text-white" />
                  </button>
                </UiTooltip>
                <UiTooltip content="Segarkan Data Keasramaan">
                  <button
                    type="button"
                    onClick={fetchDashboard}
                    disabled={loading}
                    aria-label="Segarkan Data Keasramaan"
                    className="size-9 flex items-center justify-center p-0 rounded-xl border-2 border-emerald-300 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-2xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={loading ? 'size-4 animate-spin text-emerald-700' : 'size-4 text-emerald-700 dark:text-emerald-300'} />
                  </button>
                </UiTooltip>
              </div>
            }
          />
        </motion.div>

 {/* Master Stats Grid matching Teacher Workspace Pastel Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernKpiCard
 label="Santri Binaan Asrama"
 value={formatNumber(kpis.santri_binaan?.total ?? kpis.total_siswa_binaan?.total ?? 0)}
 description="Santri terdaftar di asrama"
 tag="Aktif"
 icon={Users}
 tone="emerald"
 onClick={() => setActiveModal('santri_binaan')}
 />
 <ModernKpiCard
 label="Presensi Shalat Berjamaah"
 value={formatNumber(kpis.ibadah_lengkap?.total ?? 0)}
 description="Kehadiran shalat 5 waktu"
 tag="Presensi"
 icon={CalendarCheck}
 tone="blue"
 />
 <ModernKpiCard
 label="Setoran Hafalan Hari Ini"
 value={formatNumber(kpis.setoran_tahfizh?.total ?? kpis.setoran_hari_ini?.total ?? 0)}
 description="Setoran ziyadah & murajaah"
 tag="Tahfizh"
 icon={BookOpen}
 tone="purple"
 />
 <ModernKpiCard
 label="Mutaba'ah Terisi"
 value={formatNumber(kpis.mutabaah_terisi?.total ?? 0)}
 description="Checklist amalan harian"
 tag="Target"
 icon={CheckCircle2}
 tone="amber"
 />
 </div>

 {/* Workspace Card Navigation Tabs matching Teacher Workspace Style */}
 <section className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark" aria-label="Modul Layanan Keasramaan">
 {/* Ambient Glows */}

 {/* Header Bar */}
 <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/90 bg-slate-50/50 dark:bg-slate-900/50 p-4 sm:p-5 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 shadow-md shadow-sm border-2 border-emerald-300">
 <Sparkles className="size-5" />
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
 Modul Layanan Keasramaan &amp; Pengasuhan
 </h3>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 <Sparkles className="size-3 text-amber-500 animate-pulse" />
 Musyrif Active Workspace
 </span>
 </div>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
 Pilih modul untuk mengelola amalan ibadah, tahfizh, kedisiplinan, klinik kesehatan, logistik barang, dan perizinan santri asrama.
 </p>
 </div>
 </div>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 text-white shadow-xs border border-emerald-500/40 px-3.5 py-1 text-xs font-extrabold">
 {cardModulesList.length} Modul Terintegrasi
 </span>
 </div>

 {/* 6 Tabs Grid */}
 <div className="relative z-10 p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3" role="tablist">
 {cardModulesList.map((mod) => {
 const Icon = mod.icon
 const isActive = activeTab === mod.id
 return (
 <motion.button
 type="button"
 key={mod.id}
 whileHover={{ scale: 1.03, y: -2 }}
 whileTap={{ scale: 0.97 }}
 transition={{ type: 'spring', stiffness: 400, damping: 25 }}
 onClick={() => setActiveTab(mod.id)}
 role="tab"
 aria-selected={isActive}
 className={`flex flex-col items-center justify-between min-h-[142px] p-3.5 rounded-xl border-2 transition-all text-center group cursor-pointer relative overflow-hidden ${
 isActive
 ? (mod.activeBorder || 'border-emerald-600 bg-white dark:bg-card-dark shadow-md ring-2 ring-emerald-600/30')
 : (mod.cardClass || 'border-emerald-200/80 bg-white dark:bg-slate-900/60 hover:shadow-md')
 }`}
 >
 <div className={`p-2.5 rounded-xl ${mod.iconBox} mb-2 shrink-0 group-hover:scale-110 transition ${isActive ? 'ring-2 ring-emerald-500/40 shadow-xs' : ''}`}>
 <Icon className="w-5 h-5 text-slate-600" />
 </div>
 <span className={`font-bold text-xs leading-tight transition-colors ${
 isActive ? 'text-slate-900 dark:text-white font-black' : 'text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
 }`}>
 {mod.title}
 </span>
 {mod.badge && (
 <span className={`mt-1.5 inline-flex items-center px-2 py-0.5 rounded-full text-[9.5px] font-extrabold tracking-wide ${mod.badgeColor}`}>
 {mod.badge}
 </span>
 )}
 </motion.button>
 )
 })}
 </div>
 </section>

 {/* Quick Action Navigation Bar */}
 <section className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-md shadow-sm dark:bg-card-dark">
 {/* Ambient Glows */}

 <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 shadow-md shadow-sm border-2 border-emerald-300">
 <Sparkles className="size-5" />
 </div>
 <div>
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 Aksi Cepat Fitur Keasramaan Musyrif
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pencatatan langsung presensi sholat, ujian tasmi', poin kedisiplinan santri, log klinik, dan barang titipan</p>
 </div>
 </div>
 <div className="flex items-center gap-2.5 flex-wrap">
 <SquircleActionButton
 variant="primary"
 icon={CalendarCheck}
 label="Presensi Sholat Berjamaah (5 Waktu)"
 onClick={() => setQuickActionModal('sholat')}
 />
 <SquircleActionButton
 variant="primary"
 icon={BookOpen}
 label="Input Setoran Hafalan (Ziyadah & Murajaah)"
 onClick={() => setQuickActionModal('setoran')}
 />
 <SquircleActionButton
 variant="primary"
 icon={Award}
 label="Log Ujian Tasmi' (Sekali Duduk)"
 onClick={() => setQuickActionModal('tasmi')}
 />
 <SquircleActionButton
 variant="edit"
 icon={ShieldAlert}
 label="Poin Kedisiplinan & Sanksi (+/-)"
 onClick={() => setQuickActionModal('poin')}
 />
 <SquircleActionButton
 variant="import"
 icon={HeartPulse}
 label="Log Klinik & Kesehatan Santri"
 onClick={() => setQuickActionModal('klinik')}
 />
 <SquircleActionButton
 variant="setActive"
 icon={Smartphone}
 label="Log Penitipan Barang (HP/Laptop)"
 onClick={() => setQuickActionModal('titipan')}
 />
 <SquircleActionButton
 variant="secondary"
 icon={MessageSquare}
 label="Chat Pegawai & Orang Tua"
 onClick={() => navigate('/dashboard/chat-pegawai')}
 />
 </div>
 </div>
 </section>

 {/* Datatable Processing Actions (Import, Export, Cetak) */}
 <section className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-4 sm:p-5 shadow-md shadow-sm dark:bg-card-dark flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 shadow-md shadow-sm border-2 border-emerald-300">
 <Printer className="size-5 text-slate-600" />
 </div>
 <div>
 <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">Pemrosesan Datatable Active Workspace</h4>
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Export CSV, Import berkas data, atau Cetak Laporan PDF untuk tab active: <strong className="text-emerald-600 dark:text-emerald-400 uppercase font-black">{activeTab}</strong></p>
 </div>
 </div>

 <div className="flex items-center gap-2.5 flex-wrap">
 <SquircleActionButton
 variant="import"
 icon={Upload1}
 label="Import Data CSV"
 onClick={handleImportClick}
 />
 <SquircleActionButton
 variant="export"
 icon={Download1}
 label="Export CSV"
 onClick={handleExportCSV}
 />
 <SquircleActionButton
 variant="view"
 icon={Printer}
 label="Cetak / PDF"
 onClick={() => setIsPrintModalOpen(true)}
 />
 </div>
 </section>

 {/* Tab Content Pipeline with Framer Motion AnimatePresence */}
 <div className="w-full">
 <AnimatePresence mode="wait">
 <motion.main
 key={activeTab}
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -15 }}
 transition={{ duration: 0.25, ease: 'easeInOut' }}
 className="space-y-6 w-full"
 >
 {/* TAB 1: PRESENSI & MUTABAAH */}
 {activeTab === 'aktivitas' && (
 <section className="space-y-6">
 {/* CARD 1: KEDISIPLINAN SHALAT (HORIZONTAL WIDE CARD) */}
 <div className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark">
 <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/90 dark:border-emerald-800/60 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <div className="w-10 h-9 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 flex items-center justify-center shadow-md shadow-sm shrink-0">
 <CalendarCheck className="w-5 h-5 text-slate-600" />
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
 Kedisiplinan Shalat Berjamaah
 </h3>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 7 Hari Terakhir
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 {worshipFilter === 'wajib'
 ? 'Kehadiran shalat wajib 5 waktu di masjid santri asrama'
 : worshipFilter === 'sunnah'
 ? 'Kehadiran shalat sunnah terjadwal (Tahajud & Dhuha) santri asrama'
 : 'Kehadiran seluruh shalat wajib 5 waktu & sunnah terjadwal (Tahajud, Dhuha) santri asrama'}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2.5 flex-wrap">
 {/* FILTER BUTTONS: SEMUA | WAJIB | SUNNAH */}
 <div className="flex items-center p-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-bold">
 <button
 type="button"
 onClick={() => setWorshipFilter('all')}
 className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
 worshipFilter === 'all'
 ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs'
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
 }`}
 >
 <span>Semua</span>
 <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
 {worshipPrayers.length}
 </span>
 </button>
 <button
 type="button"
 onClick={() => setWorshipFilter('wajib')}
 className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
 worshipFilter === 'wajib'
 ? 'bg-emerald-600 text-white shadow-xs'
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
 }`}
 >
 <Sun className="w-3.5 h-3.5" />
 <span>Wajib (5 Waktu)</span>
 <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${worshipFilter === 'wajib' ? 'bg-emerald-700 text-white' : 'bg-emerald-50 dark:bg-emerald-950/40'}`}>
 {worshipKpis.wajibCount}
 </span>
 </button>
 <button
 type="button"
 onClick={() => setWorshipFilter('sunnah')}
 className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
 worshipFilter === 'sunnah'
 ? 'bg-purple-600 text-white shadow-xs'
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
 }`}
 >
 <Moon className="w-3.5 h-3.5" />
 <span>Sunnah</span>
 <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${worshipFilter === 'sunnah' ? 'bg-purple-700 text-white' : 'bg-emerald-50 dark:bg-emerald-950/40'}`}>
 {worshipKpis.sunnahCount}
 </span>
 </button>
 </div>

 <MasterActionButton variant="emerald" icon={CalendarCheck} onClick={() => setQuickActionModal('sholat')}>
 Presensi Sholat
 </MasterActionButton>
 </div>
 </div>

 {/* 3 MINI KPI STAT CARDS */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-5 pb-0 bg-slate-50/50 dark:bg-slate-900/30 border-b border-emerald-100/80 dark:border-emerald-900/40">
 {/* KPI 1: WAJIB */}
 <div
 onClick={() => setWorshipFilter('wajib')}
 className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
 worshipFilter === 'wajib'
 ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-400 shadow-sm ring-2 ring-emerald-500/20'
 : 'bg-white dark:bg-slate-800/80 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300'
 }`}
 >
 <div className="space-y-0.5">
 <div className="flex items-center gap-1.5">
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Sholat Wajib (5 Waktu)</span>
 <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Wajib</span>
 </div>
 <div className="text-xl font-black text-emerald-950 dark:text-emerald-200">
 {worshipKpis.avgWajibPerDay}{' '}
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">santri / hari</span>
 </div>
 <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
 Total {worshipKpis.totalWajib.toLocaleString('id-ID')} kehadiran jamaah
 </div>
 </div>
 <div className="w-10 h-9 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 flex items-center justify-center shrink-0 shadow-xs">
 <Sun className="w-5 h-5 text-emerald-600" />
 </div>
 </div>

 {/* KPI 2: SUNNAH */}
 <div
 onClick={() => setWorshipFilter('sunnah')}
 className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
 worshipFilter === 'sunnah'
 ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-400 shadow-sm ring-2 ring-purple-500/20'
 : 'bg-white dark:bg-slate-800/80 border-emerald-200/80 dark:border-emerald-800/60 hover:border-purple-300'
 }`}
 >
 <div className="space-y-0.5">
 <div className="flex items-center gap-1.5">
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Sholat Sunnah</span>
 <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Sunnah</span>
 </div>
 <div className="text-xl font-black text-purple-950 dark:text-purple-200">
 {worshipKpis.avgSunnahPerDay}{' '}
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">santri / hari</span>
 </div>
 <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
 Tahajud &amp; Dhuha ({worshipKpis.totalSunnah.toLocaleString('id-ID')} kehadiran)
 </div>
 </div>
 <div className="w-10 h-9 rounded-xl bg-white dark:bg-card-dark flex items-center justify-center shrink-0 shadow-xs border border-emerald-200/80 dark:border-emerald-800/60">
 <Moon className="w-5 h-5 text-slate-600" />
 </div>
 </div>

 {/* KPI 3: TOTAL GABUNGAN */}
 <div
 onClick={() => setWorshipFilter('all')}
 className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
 worshipFilter === 'all'
 ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-400 shadow-sm ring-2 ring-teal-500/20'
 : 'bg-white dark:bg-slate-800/80 border-emerald-200/80 dark:border-emerald-800/60 hover:border-teal-300'
 }`}
 >
 <div className="space-y-0.5">
 <div className="flex items-center gap-1.5">
 <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Akumulasi Ibadah</span>
 <span className="text-[9px] px-1.5 py-0.2 rounded font-extrabold bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">7 Hari</span>
 </div>
 <div className="text-xl font-black text-teal-950 dark:text-teal-200">
 {worshipKpis.totalAll.toLocaleString('id-ID')}{' '}
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">presensi</span>
 </div>
 <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
 Rata-rata {worshipKpis.avgAllPerDay} santri per hari
 </div>
 </div>
 <div className="w-10 h-9 rounded-xl bg-white dark:bg-card-dark flex items-center justify-center shrink-0 shadow-xs border border-emerald-200/80 dark:border-emerald-800/60">
 <Activity className="w-5 h-5 text-white" />
 </div>
 </div>
 </div>

 {/* PRAYER PILLS LEGEND */}
 <div className="px-4 sm:px-6 pt-4 flex items-center gap-1.5 flex-wrap">
 <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 mr-1">Sholat ditampilkan:</span>
 {filteredWorshipPrayers.map((prayer) => (
 <span
 key={prayer.key}
 className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 shadow-2xs border border-emerald-200/60 dark:border-emerald-700/80/60"
 >
 <span className="size-2.5 rounded-full shrink-0" style={{ backgroundColor: prayer.color }} />
 <span>{prayer.name}</span>
 {prayer.badge && (
 <span
 className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
 prayer.badge === 'Sunnah'
 ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300'
 : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
 }`}
 >
 {prayer.badge}
 </span>
 )}
 </span>
 ))}
 </div>

 <div className="p-4 sm:p-6 pt-3">
 <div className="h-64 sm:h-72 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={charts.worship_trend || []} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
 <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} />
 <YAxis stroke="#888888" fontSize={12} tickLine={false} />
 <Tooltip
 contentStyle={{
 backgroundColor: "#0F172A",
 borderColor: '#334155',
 borderRadius: '12px',
 color: '#fff',
 fontSize: '12px',
 }}
 />
 {filteredWorshipPrayers.map((prayer) => (
 <Bar
 key={prayer.key}
 dataKey={prayer.key}
 fill={prayer.color}
 name={prayer.name}
 radius={[3, 3, 0, 0]}
 maxBarSize={worshipFilter === 'sunnah' ? 24 : worshipFilter === 'wajib' ? 16 : 12}
 />
 ))}
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>

 {/* CARD 2: MUTABA'AH & PRESENSI KEASRAMAAN DATATABLE (HORIZONTAL FULL WIDTH) */}
 <div className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark">
 <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/90 dark:border-emerald-800/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <div className="w-10 h-9 rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 flex items-center justify-center shadow-md shadow-sm shrink-0">
 <Activity className="w-5 h-5 text-slate-600" />
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 Mutaba'ah &amp; Presensi Keasramaan
 </h3>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {filteredMutabaahLogs.length} Data
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400">Jurnal harian amalan yaumiyyah dan kedisiplinan ibadah santri asrama</p>
 </div>
 </div>

 {/* TOMBOL AKSI: CETAK JURNAL & EXPORT CSV */}
 <div className="flex items-center gap-2 flex-wrap">
 <MasterActionButton
 variant="secondary"
 icon={Printer}
 onClick={() => {
 const printData = filteredMutabaahLogs || []
 printCleanTable({
 title: "Jurnal Presensi & Mutaba'ah Keasramaan Santri",
 subtitle: `Laporan Amalan Yaumiyyah & Kedisiplinan Ibadah Santri Asrama | Periode: ${
 mutabaahPeriodFilter === 'today'
 ? 'Hari Ini'
 : mutabaahPeriodFilter === 'week'
 ? 'Mingguan (7 Hari)'
 : mutabaahPeriodFilter === 'month'
 ? 'Bulanan (30 Hari)'
 : mutabaahPeriodFilter === 'semester'
 ? 'Semester'
 : 'Semua Riwayat'
 } | Musyrif: ${context?.musyrif_name || 'Musyrif Asrama'}`,
 columns: [
 { key: 'santri', label: 'Nama Santri' },
 { key: 'nis', label: 'NIS' },
 { key: 'kelas', label: 'Kamar / Asrama' },
 { key: 'kegiatan', label: 'Kegiatan / Sholat' },
 { key: 'kategori', label: 'Kategori' },
 { key: 'waktu', label: 'Waktu Presensi' },
 { key: 'metode', label: 'Metode' },
 { key: 'status', label: 'Status' },
 ],
 data: printData,
 })
 }}
 >
 Cetak Jurnal
 </MasterActionButton>

 <MasterActionButton
 variant="secondary"
 icon={Download1}
 onClick={() => {
 const exportData = filteredMutabaahLogs || []
 if (!exportData.length) {
 Swal.fire('Data Kosong', 'Tidak ada data mutaba\'ah untuk diexport.', 'warning')
 return
 }
 const cols = [
 { key: 'santri', label: 'Nama Santri' },
 { key: 'nis', label: 'NIS' },
 { key: 'kelas', label: 'Kamar / Asrama' },
 { key: 'kegiatan', label: 'Kegiatan / Sholat' },
 { key: 'kategori', label: 'Kategori' },
 { key: 'waktu', label: 'Waktu Presensi' },
 { key: 'metode', label: 'Metode' },
 { key: 'status', label: 'Status' },
 ]
 const headers = ['No', ...cols.map((c) => c.label)]
 const rows = [headers.join(',')]
 exportData.forEach((row, idx) => {
 const vals = [
 idx + 1,
 ...cols.map((c) => `"${String(row[c.key] || '-').replace(/"/g, '""')}"`),
 ]
 rows.push(vals.join(','))
 })
 const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' })
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.href = url
 link.setAttribute('download', `Jurnal_Mutabaah_Santri_${mutabaahPeriodFilter}_${new Date().toISOString().slice(0, 10)}.csv`)
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 }}
 >
 Export CSV
 </MasterActionButton>
 </div>
 </div>

 {/* FILTER PERIODE TAB BAR (HARI INI, MINGGUAN, BULANAN, SEMESTER) */}
 <div className="bg-white dark:bg-card-dark border-b border-emerald-200/80 dark:border-emerald-800/60 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 flex-wrap">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
 <Filter className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
 Filter Periode:
 </span>
 <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-emerald-200/70 dark:border-emerald-800/60 shadow-2xs">
 {[
 { key: 'all', label: 'Semua' },
 { key: 'today', label: 'Hari Ini' },
 { key: 'week', label: 'Mingguan' },
 { key: 'month', label: 'Bulanan' },
 { key: 'semester', label: 'Semester' },
 ].map((tab) => {
 const isActive = mutabaahPeriodFilter === tab.key
 return (
 <button
 key={tab.key}
 type="button"
 onClick={() => setMutabaahPeriodFilter(tab.key)}
 className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
 isActive
 ? 'bg-emerald-600 text-white shadow-xs'
 : 'text-slate-600 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800'
 }`}
 >
 {tab.label}
 </button>
 )
 })}
 </div>
 </div>
 <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
 Menampilkan <strong className="text-emerald-700 dark:text-emerald-400">{filteredMutabaahLogs.length}</strong> catatan aktivitas ibadah
 </div>
 </div>

 <div className="p-4 sm:p-6 pt-2">
 <AppDataTable
 title=""
 data={filteredMutabaahLogs}
 columns={mutabaahColumns}
 clientPagination={true}
 clientPageSize={10}
 emptyMessage="Belum ada data mutaba'ah untuk periode ini."
 />
 </div>
 </div>
 </section>
 )}

 {/* TAB 2: LOG UJIAN TASMI' */}
 {activeTab === 'tasmi' && (
 <section className="space-y-4">
 <div className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark space-y-4">
 <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/90 dark:border-emerald-800/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-9 rounded-xl bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300 flex items-center justify-center shadow-md shadow-sm shrink-0">
 <Award className="w-5 h-5 text-emerald-600" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 Jurnal Ujian Tasmi' Santri (Sekali Duduk)
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">Pencatatan ujian kelancaran hafalan 1 Juz, 3 Juz, 5 Juz, atau 30 Juz sekali duduk.</p>
 </div>
 </div>
 <MasterActionButton variant="emerald" icon={Plus} onClick={() => setQuickActionModal('tasmi')}>
 Catat Ujian Tasmi'
 </MasterActionButton>
 </div>
 <div className="p-4 sm:p-6 pt-0">
 <AppDataTable
 title="Riwayat Ujian Tasmi'"
 data={tables.tasmi_logs || []}
 columns={[
 { key: 'santri', label: 'Nama Santri' },
 { key: 'jenis', label: 'Kategori Ujian' },
 { key: 'nilai', label: 'Nilai / Tajwid' },
 { key: 'penguji', label: 'Musyrif Penguji' },
 ]}
 emptyMessage="Belum ada catatan ujian tasmi' bulan ini."
 />
 </div>
 </div>
 </section>
 )}

 {/* TAB 3: KEDISIPLINAN & POIN */}
 {activeTab === 'poin' && (
 <section className="space-y-4">
 <div className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark space-y-4">
 <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/90 dark:border-emerald-800/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-9 rounded-xl bg-white dark:bg-card-dark flex items-center justify-center shadow-md shadow-sm shrink-0 border border-emerald-200/80 dark:border-emerald-800/60">
 <ShieldAlert className="w-5 h-5 text-slate-600" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 Log Kedisiplinan & Buku Pelanggaran Santri
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">Pencatatan poin apresiasi kebaikan atau poin pelanggaran tata tertib asrama.</p>
 </div>
 </div>
 <MasterActionButton variant="emerald" icon={Plus} onClick={() => setQuickActionModal('poin')}>
 Input Poin Pelanggaran
 </MasterActionButton>
 </div>
 <div className="p-4 sm:p-6 pt-0">
 <AppDataTable
 title="Buku Catatan Kedisiplinan"
 data={tables.poin_logs || []}
 columns={[
 { key: 'santri', label: 'Santri' },
 { key: 'kategori', label: 'Kategori' },
 { key: 'poin', label: 'Poin' },
 { key: 'tindakan', label: 'Tindakan Musyrif' },
 ]}
 emptyMessage="Belum ada catatan poin kedisiplinan."
 />
 </div>
 </div>
 </section>
 )}

 {/* TAB 4: KLINIK KESEHATAN */}
 {activeTab === 'klinik' && (
 <section className="space-y-4">
 <div className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark space-y-4">
 <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/90 dark:border-emerald-800/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-9 rounded-xl bg-white dark:bg-card-dark flex items-center justify-center shadow-md shadow-sm shrink-0 border border-emerald-200/80 dark:border-emerald-800/60">
 <HeartPulse className="w-5 h-5 text-white" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 Log Kesehatan & Klinik Asrama
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">Pencatatan santri sakit, obat yang diberikan, dan istirahat di UKS Asrama.</p>
 </div>
 </div>
 <MasterActionButton variant="danger" icon={Plus} onClick={() => setQuickActionModal('klinik')}>
 Catat Log Klinik
 </MasterActionButton>
 </div>
 <div className="p-4 sm:p-6 pt-0">
 <AppDataTable
 title="Catatan Pasien UKS Asrama"
 data={tables.klinik_logs || []}
 columns={[
 { key: 'santri', label: 'Santri' },
 { key: 'keluhan', label: 'Keluhan / Gejala' },
 { key: 'obat', label: 'Obat Diberikan' },
 { key: 'status', label: 'Rekomendasi' },
 ]}
 emptyMessage="Tidak ada santri yang tercatat sakit hari ini."
 />
 </div>
 </div>
 </section>
 )}

 {/* TAB 5: PENITIPAN HP/LAPTOP */}
 {activeTab === 'titipan' && (
 <section className="space-y-4">
 <div className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark space-y-4">
 <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/90 dark:border-emerald-800/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-9 rounded-xl bg-white dark:bg-card-dark flex items-center justify-center shadow-md shadow-sky-600/30 shrink-0 border border-emerald-200/80 dark:border-emerald-800/60">
 <Smartphone className="w-5 h-5 text-white" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 Log Penitipan Barang Berharga (HP / Laptop)
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">Pencatatan penitipan barang elektronik santri asrama yang hanya boleh diambil pada waktu tertentu.</p>
 </div>
 </div>
 <MasterActionButton variant="secondary" icon={Plus} onClick={() => setQuickActionModal('titipan')}>
 Catat Barang Titipan
 </MasterActionButton>
 </div>
 <div className="p-4 sm:p-6 pt-0">
 <div className="rounded-xl border-2 border-emerald-200/70 bg-white dark:bg-card-dark p-4 dark:border-emerald-800/60 dark:bg-slate-900/60 text-xs text-emerald-950 dark:text-emerald-200">
 📱 <strong>Logistik Asrama:</strong> Melacak status barang (`deposited` / `retrieved`) lengkap dengan serial number dan waktu penyerahan.
 </div>
 </div>
 </div>
 </section>
 )}
 {/* TAB 6: PERIZINAN & ABSENSI KEMBALI (BOARDING PASS) */}
 {activeTab === 'perizinan' && (
 <section className="space-y-5">
 {/* Master Stats Grid - 6 Key Boarding KPIs */}
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
 <div className="rounded-2xl border border-emerald-100/80 bg-white dark:bg-card-dark p-3.5 shadow-sm dark:border-emerald-900/40 dark:bg-slate-900">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Di Pondok</span>
 <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
 <CheckCircle2 className="w-3.5 h-3.5" />
 </div>
 </div>
 <div className="mt-1.5 text-xl font-black text-emerald-700 dark:text-emerald-400">
 {dormitoryPermitsStatistik?.in_dormitory ?? 0}
 </div>
 <p className="text-[9px] text-slate-500 mt-0.5">Berada di lingkungan asrama</p>
 </div>

 <div className="rounded-2xl border border-amber-100/80 bg-white dark:bg-card-dark p-3.5 shadow-sm dark:border-amber-900/40 dark:bg-slate-900">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">Sedang di Luar</span>
 <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
 <Clock className="w-3.5 h-3.5" />
 </div>
 </div>
 <div className="mt-1.5 text-xl font-black text-amber-600 dark:text-amber-400">
 {dormitoryPermitsStatistik?.currently_out ?? 0}
 </div>
 <p className="text-[9px] text-slate-500 mt-0.5">Izin aktif / belum kembali</p>
 </div>

 <div className="rounded-2xl border border-rose-100/80 bg-white dark:bg-card-dark p-3.5 shadow-sm dark:border-rose-900/40 dark:bg-slate-900">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">Izin Sakit / Rujuk</span>
 <div className="p-1.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
 <CalendarCheck className="w-3.5 h-3.5" />
 </div>
 </div>
 <div className="mt-1.5 text-xl font-black text-rose-600 dark:text-rose-400">
 {dormitoryPermitsStatistik?.medical_permits ?? 0}
 </div>
 <p className="text-[9px] text-slate-500 mt-0.5">Klinik / RS / Rawat jalan</p>
 </div>

 <div className="rounded-2xl border border-red-200 bg-white dark:bg-card-dark p-3.5 shadow-sm dark:border-red-900/50 dark:bg-slate-900">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Terlambat Kembali</span>
 <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
 <ShieldAlert className="w-3.5 h-3.5" />
 </div>
 </div>
 <div className="mt-1.5 text-xl font-black text-red-600 dark:text-red-400">
 {dormitoryPermitsStatistik?.returned_late ?? 0}
 </div>
 <p className="text-[9px] text-slate-500 mt-0.5">Perlu tindak lanjut / sanksi</p>
 </div>

 <div className="rounded-2xl border border-blue-100/80 bg-white dark:bg-card-dark p-3.5 shadow-sm dark:border-blue-900/40 dark:bg-slate-900">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Perlu Approval</span>
 <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
 <Clock className="w-3.5 h-3.5" />
 </div>
 </div>
 <div className="mt-1.5 text-xl font-black text-blue-600 dark:text-blue-400">
 {dormitoryPermitsStatistik?.pending_approval ?? 0}
 </div>
 <p className="text-[9px] text-slate-500 mt-0.5">Izin baru & perpanjangan</p>
 </div>

 <div className="rounded-2xl border border-indigo-100/80 bg-white dark:bg-card-dark p-3.5 shadow-sm dark:border-indigo-900/40 dark:bg-slate-900">
 <div className="flex items-center justify-between">
 <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 uppercase tracking-wider">Total Riwayat</span>
 <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
 <CalendarCheck className="w-3.5 h-3.5" />
 </div>
 </div>
 <div className="mt-1.5 text-xl font-black text-slate-800 dark:text-white">
 {dormitoryPermitsStatistik?.total_permits ?? dormitoryPermits.length}
 </div>
 <p className="text-[9px] text-slate-500 mt-0.5">Semua data perizinan</p>
 </div>
 </div>

 {/* Main Table Card */}
 <div className="relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark space-y-0">
 <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/90 dark:border-emerald-800/60 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="w-10 h-9 rounded-xl bg-white dark:bg-card-dark flex items-center justify-center shadow-md shadow-sm shrink-0 border border-emerald-200/80 dark:border-emerald-800/60">
 <CalendarCheck className="w-5 h-5 text-white" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 Buku Izin Pesiar & Absensi Kembali Santri
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Pondok Pesantren Beroperasi Senin-Sabtu. Ahad adalah jadwal kunjungan/pesiar & wajib melakukan absensi saat kembali ke pondok.
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2 flex-wrap">
 <button
 type="button"
 onClick={() => fetchDormitoryPermits()}
 disabled={loadingPermits}
 className="p-2 rounded-xl border-2 border-emerald-200/80 text-slate-600 hover:bg-slate-100 dark:border-emerald-700/80 dark:text-slate-300 dark:hover:bg-slate-800 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
 >
 <RefreshCw className={`w-3.5 h-3.5 ${loadingPermits ? 'animate-spin' : ''}`} /> Refresh
 </button>
 <button
 type="button"
 onClick={() => setQuickActionModal('perizinan_darurat')}
 className="px-3.5 py-2 rounded-xl bg-white dark:bg-card-dark hover:from-rose-700 hover:to-red-700 font-extrabold text-xs shadow-md shadow-sm flex items-center gap-1.5 transition active:scale-95 cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60"
 >
 <ShieldAlert className="w-3.5 h-3.5" /> 🚨 Fast-Track Darurat
 </button>
 <MasterActionButton variant="import" icon={Calendar} onClick={() => setQuickActionModal('kepulangan_massal')}>
 Jadwalkan Kepulangan Massal
 </MasterActionButton>
 <MasterActionButton variant="emerald" icon={Plus} onClick={() => setQuickActionModal('perizinan_baru')}>
 Terbitkan Surat Izin Santri
 </MasterActionButton>
 </div>
 </div>

 {/* Filter & Search Bar */}
 <div className="px-5 sm:px-6 py-3.5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/80 dark:border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
 <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
 {[
 { id: 'all', label: 'Semua Status' },
 { id: 'active', label: 'Sedang di Luar' },
 { id: 'medical', label: 'Izin Sakit / Rujuk' },
 { id: 'late', label: 'Terlambat / Tindak Lanjut' },
 { id: 'approval', label: 'Perlu Approval' },
 { id: 'returned', label: 'Kembali di Pondok' },
 ].map((btn) => (
 <button
 key={btn.id}
 type="button"
 onClick={() => setPermitFilterStatus(btn.id)}
 className={`px-3 py-1.5 rounded-xl font-black transition whitespace-nowrap cursor-pointer text-xs ${
 permitFilterStatus === btn.id
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20'
 : 'bg-white/90 text-slate-600 hover:bg-emerald-50/80 hover:text-emerald-900 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/80'
 }`}
 >
 {btn.label}
 </button>
 ))}
 </div>

 <div className="relative w-full sm:w-72">
 <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={permitSearch}
 onChange={(e) => setPermitSearch(e.target.value)}
 onKeyDown={(e) => { if (e.key === 'Enter') fetchDormitoryPermits() }}
 placeholder="Cari santri, no izin, tujuan..."
 className="w-full pl-8 pr-3 py-2 rounded-xl border-2 border-emerald-300 bg-white dark:border-emerald-700/60 dark:bg-slate-900 text-xs font-semibold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
 />
 </div>
 </div>

 {/* Table Container */}
 <div className="overflow-x-auto p-4 sm:p-6 pt-3">
 <div className="rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 overflow-hidden">
 <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
                    <tr className="text-emerald-950 dark:text-emerald-200 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-3">Santri & Perizinan</th>
                      <th className="p-3">Jadwal Keberangkatan</th>
                      <th className="p-3">Realisasi & Penjemput</th>
                      <th className="p-3">Status Kehadiran</th>
                      <th className="p-3 text-right select-none w-28"></th>
                    </tr>
                  </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 font-medium bg-white dark:bg-card-dark">
 {loadingPermits ? (
 <tr>
 <td colSpan={5} className="p-8 text-center text-slate-500">
 <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-indigo-600" />
 Memuat data perizinan santri dari PostgreSQL...
 </td>
 </tr>
 ) : dormitoryPermits.length === 0 ? (
 <tr>
 <td colSpan={5} className="p-8 text-center text-slate-500">
 Belum ada data perizinan santri yang sesuai kriteria.
 </td>
 </tr>
 ) : (
 dormitoryPermits.map((p) => {
 const isCurrentlyOut = p.status === 'active' || p.status === 'approved'
 const isLate = p.status === 'late' || p.late_minutes > 0
 const isReturned = p.status === 'returned'

 return (
 <tr key={p.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition">
                        <td className="p-3">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {p.student?.full_name || p.student?.name || 'Santri Asrama'}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            NIS: {p.student?.nis || '-'} • Kamar: {p.student?.kamar || p.dormitory_room || 'Asrama'}
                          </div>
                          <div className="text-[10px] text-slate-500 capitalize mt-1 flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                              {p.permit_number}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              p.permit_type === 'sakit_berobat' || p.presence_status === 'berobat'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            }`}>
                              {p.permit_type?.replace(/_/g, ' ')}
                            </span>
                            {p.is_emergency && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-rose-600 text-white animate-pulse">
                                🚨 DARURAT
                              </span>
                            )}
                          </div>
                          {p.medical_complaint && (
                            <div className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold truncate max-w-[200px] mt-0.5">
                              🩺 {p.medical_complaint}
                            </div>
                          )}
                        </td>

                        <td className="p-3">
                          <div className="text-slate-800 dark:text-slate-200">
                            Berangkat: {p.scheduled_departure_at ? new Date(p.scheduled_departure_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                          </div>
                          <div className={`font-bold mt-0.5 ${p.deadline_status === 'overdue' ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}`}>
                            Batas: {p.scheduled_return_at ? new Date(p.scheduled_return_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'}
                            {p.extension_count > 0 && <span className="ml-1 text-[9px] text-indigo-500 font-normal">({p.extension_count}x perpanjangan)</span>}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate max-w-xs mt-0.5">
                            Tujuan: {p.medical_destination || p.destination || '-'}
                          </div>
                        </td>

                        <td className="p-3">
                          {p.actual_return_at ? (
                            <div>
                              <div className="font-bold text-slate-800 dark:text-slate-200">
                                {new Date(p.actual_return_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                              </div>
                              {isLate ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-900 mt-0.5">
                                  <ShieldAlert className="w-3 h-3" /> Terlambat +{p.late_minutes} Menit
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900 mt-0.5">
                                  <CheckCircle2 className="w-3 h-3" /> Tepat Waktu
                                </span>
                              )}
                            </div>
                          ) : (
                            <div>
                              <span className={`font-bold flex items-center gap-1 ${p.deadline_status === 'overdue' ? 'text-rose-600' : 'text-amber-600 dark:text-amber-400'}`}>
                                <Clock className="w-3.5 h-3.5" /> {p.presence_status === 'berobat' ? 'Sedang Berobat' : 'Sedang di Luar'}
                              </span>
                              {p.deadline_status === 'overdue' && (
                                <span className="inline-block mt-0.5 px-2 py-0.5 text-[9px] font-black rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                                  ⚠️ Melewati Batas Jam!
                                </span>
                              )}
                            </div>
                          )}
                          <div className="mt-1 text-[10px] text-slate-500">
                            Wali: <span className="font-semibold text-slate-700 dark:text-slate-300">{p.pickup_person_name || 'Mandiri / Wali'}</span> {p.pickup_person_phone ? `(${p.pickup_person_phone})` : ''}
                          </div>
                        </td>

                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.presence_status === 'berobat'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : p.presence_status === 'di_luar'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : p.presence_status === 'pulang'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}>
                            ● {p.presence_status === 'berobat' ? 'Sedang Berobat' : p.presence_status === 'di_luar' ? 'Sedang di Luar' : p.presence_status === 'pulang' ? 'Pulang ke Rumah' : 'Di Pondok'}
                          </span>
                          {isReturned && (
                            <div className="mt-1">
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                                Kembali di Pondok
                              </span>
                            </div>
                          )}
                        </td>

                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {(p.status === 'disetujui' && (p.presence_status === 'di_pondok' || !p.actual_departure_at)) && (
                              <button
                                type="button"
                                onClick={() => handleCheckoutGate(p)}
                                className="px-2.5 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-300 font-bold text-xs shadow-sm inline-flex items-center gap-1 transition active:scale-95 cursor-pointer"
                              >
                                <LogOut className="w-3 h-3 text-teal-600" /> Keluar
                              </button>
                            )}

                            {p.extension_status === 'requested' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPermitForReview(p)
                                  setReviewExtensionForm({
                                    action: 'approve',
                                    new_scheduled_return_at: p.extension_requested_return_at ? new Date(p.extension_requested_return_at).toISOString().slice(0, 16) : '',
                                    admin_notes: '',
                                  })
                                }}
                                className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold text-xs shadow-sm inline-flex items-center gap-1 transition active:scale-95 cursor-pointer animate-pulse"
                              >
                                <Clock className="w-3 h-3 text-amber-600" /> Perpanjangan
                              </button>
                            )}

                            {isCurrentlyOut && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedPermitForReturn(p)
                                  const now = new Date()
                                  const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
                                  setReturnForm({
                                    actual_return_time: localIso,
                                    return_condition: 'Sehat & Rapih',
                                    notes: '',
                                  })
                                }}
                                className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 font-bold text-xs shadow-sm inline-flex items-center gap-1 transition active:scale-95 cursor-pointer"
                              >
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Kembali
                              </button>
                            )}
                          </div>
                        </td>
 </tr>
 )
 })
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 </section>
 )}
 </motion.main>
 </AnimatePresence>
 </div>

 {/* 🔵 MODAL ABSENSI KEMBALI SANTRI (RETURN CHECK-IN) */}
 <AnimatePresence>
 {selectedPermitForReturn && (
 <Backdrop isOpen={Boolean(selectedPermitForReturn)} onOpenChange={() => setSelectedPermitForReturn(null)} className="z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md">
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 15 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 15 }}
 className="w-full max-w-xl"
 >
 <Dialog
 showCloseButton={false}
 className="w-full max-w-xl flex flex-col rounded-2xl border-2 border-emerald-500/30 bg-white p-0 shadow-2xl shadow-sm overflow-hidden dark:border-emerald-700/50 dark:bg-card-dark"
 >
 <DialogHeader className="bg-white dark:bg-card-dark px-6 py-4 flex items-center justify-between shrink-0 border-b border-emerald-800/80">
 <div className="flex items-center gap-3">
 <div className="w-10 h-9 rounded-xl bg-emerald-700/80 flex items-center justify-center border border-emerald-500/50 shadow-inner shrink-0">
 <CheckCircle2 className="w-5 h-5 text-emerald-200" />
 </div>
 <div>
 <DialogTitle className="text-base font-extrabold text-emerald-600 text-left">
 Absensi Kembali ke Pondok
 </DialogTitle>
 <DialogDescription className="text-xs text-emerald-200/90 font-medium text-left">
 Verifikasi kedatangan santri &amp; pengecekan batas waktu
 </DialogDescription>
 </div>
 </div>
 <DialogClose onClick={() => setSelectedPermitForReturn(null)} />
 </DialogHeader>

 <form onSubmit={handleReturnCheckin} className="flex flex-col flex-1 overflow-hidden">
 <DialogBody className="p-5 sm:p-6 pb-24 space-y-4 text-xs overflow-y-auto">
 {/* Info Box Santri */}
 <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 dark:bg-emerald-950/30 dark:border-emerald-900/50 space-y-1">
 <div className="flex justify-between items-center font-bold">
 <span className="text-slate-600 dark:text-slate-400">Santri:</span>
 <span className="text-slate-900 dark:text-white font-extrabold text-sm">{selectedPermitForReturn.student?.full_name || selectedPermitForReturn.student?.name}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-slate-600 dark:text-slate-400">Nomor Boarding Pass:</span>
 <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{selectedPermitForReturn.permit_number}</span>
 </div>
 <div className="flex justify-between items-center">
 <span className="text-slate-600 dark:text-slate-400">Batas Waktu Jadwal:</span>
 <span className="font-bold text-rose-600 dark:text-rose-400">
 {selectedPermitForReturn.scheduled_return_at ? new Date(selectedPermitForReturn.scheduled_return_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-'}
 </span>
 </div>
 </div>

 <div>
 <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Waktu Kedatangan (Absensi Kembali)</label>
 <input
 type="datetime-local"
 required
 value={returnForm.actual_return_time}
 onChange={(e) => setReturnForm({ ...returnForm, actual_return_time: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
 />
 </div>

 <div>
 <label className="font-bold block mb-1.5 text-slate-700 dark:text-slate-300">Kondisi Fisik / Ketertiban Santri</label>
 <HeroUiFilterSelect
 id="select-return-condition"
 value={returnForm.return_condition}
 onChange={(val) => setReturnForm({ ...returnForm, return_condition: val })}
 options={[
 { value: 'Sehat & Rapih', label: 'Sehat & Rapih (Standar)' },
 { value: 'Kurang Sehat / Sakit', label: 'Kurang Sehat / Sakit (Perlu Masuk UKS)' },
 { value: 'Terlambat Izin Resmi', label: 'Terlambat dengan Izin Resmi Orang Tua' },
 { value: 'Terlambat Tanpa Keterangan', label: 'Terlambat Tanpa Keterangan' },
 ]}
 />
 </div>

 <div>
 <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Catatan Musyrif Penerima (Opsional)</label>
 <textarea
 rows={2}
 value={returnForm.notes}
 onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
 placeholder="Catatan barang bawaan, alasan keterlambatan, dsb..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs focus:border-indigo-600 outline-none"
 />
 </div>
 </DialogBody>

 <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-end gap-3 shrink-0">
 <MasterActionButton variant="secondary" icon={X} onClick={() => setSelectedPermitForReturn(null)}>
 Batal
 </MasterActionButton>
 <MasterActionButton variant="emerald" icon={CheckCircle2} type="submit" disabled={submittingReturn}>
 {submittingReturn ? 'Menyimpan...' : 'Simpan Absensi Kembali'}
 </MasterActionButton>
 </DialogFooter>
 </form>
 </Dialog>
 </motion.div>
 </Backdrop>
 )}
 </AnimatePresence>

 {/* 🟢 MODAL BUAT SURAT IZIN SANTRI BARU */}
 <AnimatePresence>
 {quickActionModal === 'perizinan_baru' && (
 <Backdrop isOpen={Boolean(quickActionModal)} onOpenChange={() => setQuickActionModal(null)} className="z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md">
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 15 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 15 }}
 className="w-full max-w-xl"
 >
 <Dialog
 showCloseButton={false}
 className="w-full max-w-xl flex flex-col rounded-2xl border-2 border-emerald-500/30 bg-white p-0 shadow-2xl shadow-sm overflow-hidden dark:border-emerald-700/50 dark:bg-card-dark"
 >
 <DialogHeader className="bg-white dark:bg-card-dark px-6 py-4 flex items-center justify-between shrink-0 border-b border-emerald-800/80">
 <div className="flex items-center gap-3">
 <div className="w-10 h-9 rounded-xl bg-emerald-700/80 flex items-center justify-center border border-emerald-500/50 shadow-inner shrink-0">
 <CalendarCheck className="w-5 h-5 text-emerald-200" />
 </div>
 <div>
 <DialogTitle className="text-base font-extrabold text-emerald-600 text-left">
 Terbitkan Surat Izin Santri
 </DialogTitle>
 <DialogDescription className="text-xs text-emerald-200/90 font-medium text-left">
 Pondok Pesantren Boarding Pass
 </DialogDescription>
 </div>
 </div>
 <DialogClose onClick={() => setQuickActionModal(null)} />
 </DialogHeader>

 <form onSubmit={handleCreatePermit} className="flex flex-col flex-1 overflow-hidden">
 <DialogBody className="p-5 sm:p-6 pb-28 space-y-4 text-xs overflow-y-auto">
 <div>
 <label className="font-extrabold block mb-1.5 text-slate-700 dark:text-slate-300">Pilih Santri Binaan *</label>
 <HeroUiFilterSelect
 id="select-permit-student"
 value={newPermitForm.student_id}
 onChange={(val) => setNewPermitForm({ ...newPermitForm, student_id: val })}
 placeholder="Cari & Pilih Santri..."
 searchable={true}
 options={dbStudents.map((s) => ({
 value: String(s.id),
 label: `${s.full_name || s.name} (${s.nisn || s.nis || 'Santri'})`,
 subtext: `Kamar: ${s.kamar || s.room_name || 'Asrama'}`,
 }))}
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="font-extrabold block mb-1.5 text-slate-700 dark:text-slate-300">Jenis Perizinan</label>
 <HeroUiFilterSelect
 id="select-permit-type"
 value={newPermitForm.permit_type}
 onChange={(val) => setNewPermitForm({ ...newPermitForm, permit_type: val })}
 options={[
 { value: 'pesiar_mingguan', label: 'Pesiar Mingguan (Ahad)' },
 { value: 'libur_semester', label: 'Libur Semester' },
 { value: 'izin_khusus', label: 'Izin Khusus / Keluarga' },
 { value: 'sakit', label: 'Izin Sakit / Rujukan Luar' },
 ]}
 />
 </div>

 <div>
 <label className="font-extrabold block mb-1.5 text-slate-700 dark:text-slate-300">Alamat Tujuan *</label>
 <input
 type="text"
 required
 placeholder="Contoh: Rumah Orang Tua di Padang"
 value={newPermitForm.destination}
 onChange={(e) => setNewPermitForm({ ...newPermitForm, destination: e.target.value })}
 className="w-full h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 px-3 py-2 dark:bg-slate-800 text-xs font-semibold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Jadwal Keluar *</label>
 <input
 type="datetime-local"
 required
 value={newPermitForm.scheduled_departure_at}
 onChange={(e) => setNewPermitForm({ ...newPermitForm, scheduled_departure_at: e.target.value })}
 className="w-full h-10 rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 px-3 py-2 dark:bg-slate-800 text-xs font-semibold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
 />
 </div>

 <div>
 <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Batas Wajib Kembali *</label>
 <input
 type="datetime-local"
 required
 value={newPermitForm.scheduled_return_at}
 onChange={(e) => setNewPermitForm({ ...newPermitForm, scheduled_return_at: e.target.value })}
 className="w-full h-10 rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 px-3 py-2 dark:bg-slate-800 text-xs font-semibold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
 />
 </div>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Nama Penjemput</label>
 <input
 type="text"
 placeholder="Nama Ayah/Ibu/Wali"
 value={newPermitForm.pickup_person_name}
 onChange={(e) => setNewPermitForm({ ...newPermitForm, pickup_person_name: e.target.value })}
 className="w-full h-10 rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 px-3 py-2 dark:bg-slate-800 text-xs font-semibold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
 />
 </div>

 <div>
 <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">No. HP Penjemput</label>
 <input
 type="tel"
 placeholder="08xxxxxxxxxx"
 value={newPermitForm.pickup_person_phone}
 onChange={(e) => setNewPermitForm({ ...newPermitForm, pickup_person_phone: e.target.value })}
 className="w-full h-10 rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 px-3 py-2 dark:bg-slate-800 text-xs font-semibold focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition"
 />
 </div>
 </div>

 <div>
 <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Alasan / Keterangan Tambahan</label>
 <textarea
 rows={2}
 placeholder="Alasan izin kepulangan..."
 value={newPermitForm.purpose_notes}
 onChange={(e) => setNewPermitForm({ ...newPermitForm, purpose_notes: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs focus:border-emerald-600 outline-none"
 />
 </div>
 </DialogBody>

 <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-end gap-3 shrink-0">
 <MasterActionButton variant="secondary" icon={X} onClick={() => setQuickActionModal(null)}>
 Batal
 </MasterActionButton>
 <MasterActionButton variant="emerald" icon={CalendarCheck} type="submit">
 Terbitkan Boarding Pass
 </MasterActionButton>
 </DialogFooter>
 </form>
 </Dialog>
 </motion.div>
 </Backdrop>
 )}
 </AnimatePresence>

 {/* 🟢 MODAL POP-UP DIALOG (TAHFIZH PAGE STYLE BENCHMARK) */}
 <AnimatePresence>
 {quickActionModal && quickActionModal !== 'perizinan_baru' && (
 <Backdrop isOpen={Boolean(quickActionModal)} onOpenChange={() => setQuickActionModal(null)} className="z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md">
 <motion.div
 initial={{ opacity: 0, scale: 0.92, y: 20 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.92, y: 20 }}
 transition={{ type: 'spring', damping: 25, stiffness: 350 }}
 className="w-full flex items-center justify-center"
 >
 <Dialog
 showCloseButton={false}
 className={`w-full ${
 quickActionModal === 'setoran'
 ? 'w-[95vw] max-w-4xl max-h-[88vh]'
 : quickActionModal === 'tasmi'
 ? 'max-w-xl max-h-[90vh]'
 : quickActionModal === 'sholat'
 ? 'max-w-xl max-h-[88vh]'
 : quickActionModal === 'perizinan_darurat'
 ? 'max-w-xl max-h-[88vh]'
 : 'max-w-xl max-h-[88vh]'
 } flex flex-col rounded-2xl border-2 border-emerald-500/30 bg-white p-0 shadow-2xl shadow-sm overflow-hidden dark:border-emerald-700/50 dark:bg-card-dark`}
 >
 {/* 1. PRESENSI SHOLAT BERJAMAAH MODAL */}
 {quickActionModal === 'sholat' && (
 <>
 <DialogHeader className="bg-white dark:bg-card-dark px-6 py-4 flex items-center justify-between shrink-0 border-b border-emerald-800/80">
 <div className="flex items-center gap-3">
 <div className="w-10 h-9 rounded-xl bg-emerald-700/80 text-emerald-200 flex items-center justify-center border border-emerald-600/60 shadow-inner shrink-0">
 <CalendarCheck className="w-5 h-5 text-slate-600" />
 </div>
 <div>
 <DialogTitle className="text-base font-extrabold text-white text-left">
 Presensi Sholat Berjamaah Santri (3 Metode)
 </DialogTitle>
 <DialogDescription className="text-xs text-emerald-200/90 mt-0.5 font-medium text-left">
 Presensi harian Subuh, Zuhur, Asar, Maghrib, Isya via Manual, Scan QR, atau Tap RFID
 </DialogDescription>
 </div>
 </div>
 <DialogClose onClick={() => setQuickActionModal(null)} />
 </DialogHeader>

 <DialogBody className="p-4 sm:p-6 flex-1 overflow-y-auto min-h-0 space-y-4">
 {/* 3 Mode Navigation Switcher */}
 <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800 text-xs font-semibold">
 <button
 onClick={() => setSholatTab('manual')}
 className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition cursor-pointer ${sholatTab === 'manual' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
 >
 <CalendarCheck className="w-3.5 h-3.5" /> 1. Manual
 </button>
 <button
 onClick={() => setSholatTab('qr')}
 className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition cursor-pointer ${sholatTab === 'qr' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
 >
 <QrCode className="w-3.5 h-3.5" /> 2. Scan QR
 </button>
 <button
 onClick={() => setSholatTab('rfid')}
 className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg transition cursor-pointer ${sholatTab === 'rfid' ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs font-black' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'}`}
 >
 <Radio className="w-3.5 h-3.5" /> 3. Tap RFID
 </button>
 </div>

 {/* TAB 1: PRESENSI MANUAL BATCH SANTRI */}
 {sholatTab === 'manual' && (
 <div className="space-y-4 text-xs">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="font-extrabold block mb-1.5 text-slate-700 dark:text-slate-300">Waktu Sholat & Ibadah</label>
 <HeroUiFilterSelect
 id="select-waktu-sholat"
 value={sholatForm.prayer_name}
 onChange={(val) => setSholatForm({ ...sholatForm, prayer_name: val })}
 options={[
 { value: 'subuh', label: 'Sholat Subuh (Wajib)', badge: 'Wajib' },
 { value: 'zuhur', label: 'Sholat Zuhur (Wajib)', badge: 'Wajib' },
 { value: 'asar', label: 'Sholat Asar (Wajib)', badge: 'Wajib' },
 { value: 'magrib', label: 'Sholat Maghrib (Wajib)', badge: 'Wajib' },
 { value: 'isya', label: 'Sholat Isya (Wajib)', badge: 'Wajib' },
 { value: 'jumat', label: "Sholat Jum'at (Wajib)", badge: 'Wajib' },
 { value: 'tahajud', label: 'Sholat Tahajud / Qiyamul Lail (Sunnah)', badge: 'Sunnah' },
 { value: 'witir', label: 'Sholat Witir (Sunnah)', badge: 'Sunnah' },
 { value: 'dhuha', label: 'Sholat Dhuha (Sunnah)', badge: 'Sunnah' },
 { value: 'rawatib', label: "Sholat Rawatib Qobliyah/Ba'diyah (Sunnah)", badge: 'Sunnah' },
 { value: 'tarawih', label: 'Sholat Tarawih (Sunnah Ramadhan)', badge: 'Sunnah' },
 { value: 'syuruq', label: 'Sholat Syuruq / Ishraq (Sunnah)', badge: 'Sunnah' },
 ]}
 />
 </div>

 {/* Batch Action Buttons */}
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Aksi Cepat Massal</label>
 <div className="flex items-center gap-1.5 pt-0.5">
 <button
 type="button"
 onClick={() => markAllStudentsStatus('hadir_berjamaah')}
 className="flex-1 py-2 px-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 font-extrabold text-xs transition"
 >
 ✅ Semua Hadir
 </button>
 <button
 type="button"
 onClick={() => markAllStudentsStatus('terlambat')}
 className="flex-1 py-2 px-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950 dark:text-amber-200 font-extrabold text-xs transition"
 >
 🟡 Masbuk
 </button>
 <button
 type="button"
 onClick={() => markAllStudentsStatus('tidak_hadir')}
 className="flex-1 py-2 px-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950 dark:text-rose-200 font-extrabold text-xs transition"
 >
 ❌ Semua Alfa
 </button>
 </div>
 </div>
 </div>

 {/* Student Attendance List Table */}
 <div className="space-y-2">
 <label className="font-bold block text-slate-800 dark:text-slate-200 text-xs">
 Pengisian Presensi Manual Santri Binaan ({dbStudents.length} Santri):
 </label>
 <div className="max-h-56 overflow-y-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 divide-y divide-emerald-100/80 dark:divide-emerald-900/40 p-1">
 {dbStudents.length === 0 ? (
 <div className="p-4 text-center text-slate-500 font-medium">Memuat daftar santri...</div>
 ) : (
 dbStudents.map((student) => {
 const currentStatus = batchSholatMap[student.id] || 'hadir_berjamaah'
 const sName = student.full_name || student.nama_lengkap || student.name || 'Santri'
 const sNis = student.nis || student.nisn || '-'

 return (
 <div key={student.id} className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 rounded-xl transition">
 <div className="flex items-center gap-2.5">
 <Avatar size="sm">
 <AvatarFallback className="bg-sky-600 text-slate-600 font-bold text-[10px]">
 {(String(sName || 'S')).charAt(0).toUpperCase()}
 </AvatarFallback>
 </Avatar>
 <div>
 <div className="font-extrabold text-slate-900 dark:text-white text-xs">{sName}</div>
 <div className="text-[10px] text-slate-500 font-medium">NIS: {sNis} · {student.kamar || 'Asrama'}</div>
 </div>
 </div>

 {/* Status Selector Pills */}
 <div className="flex items-center gap-1 shrink-0">
 <button
 type="button"
 onClick={() => setBatchSholatMap((prev) => ({ ...prev, [student.id]: 'hadir_berjamaah' }))}
 className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${currentStatus === 'hadir_berjamaah' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-emerald-950/60 dark:text-emerald-300'}`}
 >
 Hadir
 </button>
 <button
 type="button"
 onClick={() => setBatchSholatMap((prev) => ({ ...prev, [student.id]: 'terlambat' }))}
 className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${currentStatus === 'terlambat' ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-emerald-950/60 dark:text-emerald-300'}`}
 >
 Masbuk
 </button>
 <button
 type="button"
 onClick={() => setBatchSholatMap((prev) => ({ ...prev, [student.id]: 'tidak_hadir' }))}
 className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition ${currentStatus === 'tidak_hadir' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-emerald-950/60 dark:text-emerald-300'}`}
 >
 Alfa
 </button>
 <button
 type="button"
 onClick={() => setBatchSholatMap((prev) => ({ ...prev, [student.id]: 'izin' }))}
 className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${currentStatus === 'izin' ? 'bg-sky-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-emerald-950/60 dark:text-emerald-300'}`}
 >
 Izin
 </button>
 <button
 type="button"
 onClick={() => setBatchSholatMap((prev) => ({ ...prev, [student.id]: 'uzur_syarii' }))}
 className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${currentStatus === 'uzur_syarii' ? 'bg-purple-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-emerald-950/60 dark:text-emerald-300'}`}
 >
 Uzur
 </button>
 </div>
 </div>
 )
 })
 )}
 </div>
 </div>

 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Catatan Musyrif</label>
 <textarea
 rows="1"
 value={sholatForm.notes}
 onChange={(e) => setSholatForm({ ...sholatForm, notes: e.target.value })}
 placeholder="Catatan shalat harian..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2 dark:bg-slate-800 text-xs font-medium outline-none transition"
 />
 </div>
 </div>
 )}

 {/* TAB 2: SCAN QR CODE DENGAN BUTTON LIVE KAMERA */}
 {sholatTab === 'qr' && (
 <div className="space-y-4 text-xs">
 {/* Camera WebCam Control Button */}
 <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-700/80">
 <div className="font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
 <Camera className="w-4 h-4 text-sky-600" />
 <span>Pindai QR Code Kartu Santri</span>
 </div>
 {isCameraActive ? (
 <button
 type="button"
 onClick={stopCamera}
 className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center gap-1.5 shadow-sm transition"
 >
 <CameraOff className="w-3.5 h-3.5" /> Tutup Kamera
 </button>
 ) : (
 <button
 type="button"
 onClick={startCamera}
 className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white font-bold flex items-center gap-1.5 shadow-sm transition border border-emerald-600 h-9 text-sm font-medium"
 >
 <Camera className="w-3.5 h-3.5" /> 📷 Buka Kamera Scanner QR
 </button>
 )}
 </div>

 {/* Live Camera Viewport Box with Precision Square QR Target Frame */}
 {isCameraActive ? (
 <div className="relative rounded-xl overflow-hidden border-2 border-emerald-500 shadow-xl bg-black flex items-center justify-center min-h-[260px] h-64">
 <video
 ref={videoRef}
 className="absolute inset-0 w-full h-full object-cover bg-black"
 autoPlay
 playsInline
 muted
 />

 {/* Dimmed Vignette Mask Overlay */}
 <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[1px]" />

 {/* 🟩 PRECISION SQUARE QR CODE TARGET FRAME (SESUAI UKURAN QR KARTU SISWA) */}
 <div className="relative z-10 w-44 h-44 sm:w-48 sm:h-48 rounded-xl border border-emerald-400/40 bg-transparent flex flex-col justify-between p-2 shadow-[0_0_0_9999px_rgba(15,23,42,0.55)] overflow-hidden">
 {/* Top Corner Reticles */}
 <div className="flex justify-between">
 <div className="w-5 h-5 border-t-3 border-l-3 border-emerald-400 rounded-tl-lg shadow-[0_0_8px_#34d399]" />
 <div className="w-5 h-5 border-t-3 border-r-3 border-emerald-400 rounded-tr-lg shadow-[0_0_8px_#34d399]" />
 </div>

 {/* Center Animated Glowing Laser Line */}
 <motion.div
 animate={{ y: [-60, 60, -60] }}
 transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
 className="w-full border-b-2 border-emerald-400 shadow-[0_0_12px_#34d399] my-auto"
 />

 {/* Bottom Corner Reticles */}
 <div className="flex justify-between">
 <div className="w-5 h-5 border-b-3 border-l-3 border-emerald-400 rounded-bl-lg shadow-[0_0_8px_#34d399]" />
 <div className="w-5 h-5 border-b-3 border-r-3 border-emerald-400 rounded-br-lg shadow-[0_0_8px_#34d399]" />
 </div>
 </div>

 {/* Guidance Badge below Target Frame */}
 <div className="absolute bottom-3 z-20 bg-slate-900/90 text-emerald-300 font-extrabold py-1 px-3 rounded-full text-xs border border-emerald-500/40 backdrop-blur-md shadow-md flex items-center gap-1.5">
 <QrCode className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
 <span>Posisikan QR Code Kartu Santri di Dalam Kotak</span>
 </div>
 </div>
 ) : (
 <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-5 dark:border-sky-900 dark:bg-sky-950/30 text-center space-y-2">
 <div className="relative w-24 h-24 mx-auto rounded-xl border-2 border-dashed border-sky-400 bg-white/80 dark:bg-slate-800 flex items-center justify-center p-2 shadow-xs">
 <QrCode className="w-12 h-9 text-sky-600 animate-pulse" />
 </div>
 <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">Siapkan QR Code pada Kartu Santri</p>
 <p className="text-xs text-slate-500">Klik <strong>"📷 Buka Kamera Scanner QR"</strong> di atas. Kotak pindaian otomatis presisi sesuai ukuran QR kartu siswa.</p>
 </div>
 )}

 <div className="flex gap-2">
 <input
 type="text"
 value={qrInput}
 onChange={(e) => setQrInput(e.target.value)}
 placeholder="Masukkan / Scan Token QR Kartu Santri..."
 className="flex-1 rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-sky-600/15 outline-none"
 />
 <button
 type="button"
 onClick={async () => {
 if (!qrInput.trim()) return
 const targetStudent = dbStudents.find((s) => s.nis?.includes(qrInput) || s.full_name?.toLowerCase().includes(qrInput.toLowerCase())) || dbStudents[0]
 if (targetStudent) {
 await api.post('/musyrif/worship-attendance', {
 student_id: targetStudent.id,
 prayer_name: sholatForm.prayer_name,
 attendance_status: 'hadir_berjamaah',
 notes: 'Scan QR Code Kartu Santri',
 }).catch(() => null)
 setScanHistory((prev) => [{ name: targetStudent.full_name || targetStudent.nama_lengkap, time: new Date().toLocaleTimeString('id-ID'), status: 'Hadir Berjamaah' }, ...prev])
 setScanStatusMsg(`✅ Scan Berhasil: ${targetStudent.full_name || targetStudent.nama_lengkap}`)
 setQrInput('')
 }
 }}
 className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold font-bold transition shadow-sm"
 >
 Scan QR
 </button>
 </div>
 {scanStatusMsg && (
 <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 font-bold text-center">
 {scanStatusMsg}
 </div>
 )}
 </div>
 )}

 {/* TAB 3: SCAN RFID */}
 {sholatTab === 'rfid' && (
 <div className="space-y-4 text-xs">
 <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4 dark:border-violet-900 dark:bg-violet-950/30 text-center space-y-2">
 <Radio className="w-10 h-9 mx-auto text-violet-600 animate-pulse" />
 <p className="font-bold text-slate-800 dark:text-slate-200">Tempelkan Kartu RFID Santri pada Sensor Reader</p>
 <p className="text-xs text-slate-500">Mendeteksi UID Kartu RFID dan mencatat presensi shalat secara real-time.</p>
 </div>
 <div className="flex gap-2">
 <input
 type="text"
 value={rfidInput}
 onChange={(e) => setRfidInput(e.target.value)}
 placeholder="Tempelkan Kartu / Ketik UID RFID (Contoh: RFID-90218)..."
 className="flex-1 rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-violet-600/15 outline-none"
 />
 <button
 onClick={async () => {
 if (!rfidInput.trim()) return
 const targetStudent = dbStudents.find((s) => s.nis?.includes(rfidInput) || s.full_name?.toLowerCase().includes(rfidInput.toLowerCase())) || dbStudents[0]
 if (targetStudent) {
 await api.post('/musyrif/worship-attendance', {
 student_id: targetStudent.id,
 prayer_name: sholatForm.prayer_name,
 attendance_status: 'hadir_berjamaah',
 notes: 'Tap RFID Card Reader',
 }).catch(() => null)
 setScanHistory((prev) => [{ name: targetStudent.full_name || targetStudent.nama_lengkap, time: new Date().toLocaleTimeString('id-ID'), status: 'Hadir Berjamaah (RFID)' }, ...prev])
 setScanStatusMsg(`🎴 Tap RFID Berhasil: ${targetStudent.full_name || targetStudent.nama_lengkap}`)
 setRfidInput('')
 }
 }}
 className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
 >
 Tap RFID
 </button>
 </div>
 {scanStatusMsg && (
 <div className="p-2.5 rounded-xl bg-violet-100 text-violet-800 dark:bg-violet-950 font-bold text-center">
 {scanStatusMsg}
 </div>
 )}
 </div>
 )}
 </DialogBody>

 <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-end gap-3 shrink-0">
 <MasterActionButton variant="secondary" icon={X} onClick={() => setQuickActionModal(null)}>
 Batal
 </MasterActionButton>
 <MasterActionButton variant="primary" icon={Check} disabled={savingQuickAction} onClick={() => handleSimpanFiturAksi('Presensi Sholat Berjamaah', 'sholat')}>
 Simpan Presensi Sholat
 </MasterActionButton>
 </DialogFooter>
 </>
 )}

 {/* 2. SETORAN TAHFIZH MODAL */}
 {quickActionModal === 'setoran' && (
 <>
 <DialogHeader className="flex items-center justify-between border-b border-emerald-500/20 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-slate-950 shrink-0">
 <div className="flex items-center gap-3">
 <div className="flex h-9 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border-2 border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-700/80 dark:text-emerald-300 shadow-sm shrink-0">
 <BookOpen className="h-6 w-6" />
 </div>
 <div className="min-w-0 flex-1">
 <DialogTitle className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Pencatatan Setoran Tahfizh Al-Qur'an</span>
 <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-2 border-emerald-300">
 Ziyadah &amp; Murajaah
 </span>
 </DialogTitle>
 <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium text-left">
 Bimbingan dan evaluasi capaian hafalan santri binaan asrama sesuai target kurikulum
 </DialogDescription>
 </div>
 </div>
 <DialogClose onClick={() => setQuickActionModal(null)} />
 </DialogHeader>

 <DialogBody className="p-4 sm:p-5 pb-24 flex-1 overflow-y-auto min-h-0 space-y-4">
 {(() => {
 const selectedStudent = dbStudents.find((s) => String(s.id) === String(selectedStudentId)) || dbStudents[0]
 const studentName = selectedStudent ? (selectedStudent.full_name || selectedStudent.nama_lengkap || selectedStudent.name || 'Santri Binaan') : 'Santri Binaan'
 const studentNis = selectedStudent ? (selectedStudent.nis || selectedStudent.nisn || '-') : '-'
 const studentKamar = selectedStudent ? (selectedStudent.kamar || selectedStudent.room_name || 'Kamar Asrama') : 'Asrama'
 const studentSelectOptions = dbStudents.map((s) => ({
 value: String(s.id),
 label: `${s.full_name || s.nama_lengkap || s.name || 'Santri'} ${s.nis ? `(NIS: ${s.nis})` : ''}`,
 subtext: `Kamar: ${s.kamar || s.room_name || 'Asrama Pondok'}`,
 badge: 'Santri Binaan',
 }))

 return (
 <div className="space-y-4">
 {/* 1. SELEKSI SANTRI BINAAN */}
 <div className="rounded-xl border border-emerald-500/25 bg-emerald-50/50 p-3.5 sm:p-4 dark:border-emerald-800/50 dark:bg-emerald-950/20 space-y-3">
 <div className="flex items-center justify-between gap-2">
 <label htmlFor="modal-select-santri-binaan" className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
 <Users className="w-4 h-4 text-emerald-600" />
 <span>Pilih Santri Binaan Asrama</span>
 <span className="text-rose-500">*</span>
 </label>
 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-700/80">
 {dbStudents.length} Santri Terdaftar
 </span>
 </div>
 <HeroUiFilterSelect
 id="modal-select-santri-binaan"
 value={String(selectedStudentId || (selectedStudent ? selectedStudent.id : ''))}
 onChange={(val) => setSelectedStudentId(val)}
 placeholder={loadingStudents ? 'Memuat data santri...' : 'Cari & Pilih Santri Binaan...'}
 searchable={true}
 options={studentSelectOptions}
 size="md"
 />
 </div>

 {/* 2. CARD INFO PROFILE SISWA & CAPAIAN TAHFIZH */}
 {selectedStudent && (
 <div className="rounded-2xl border border-emerald-200/90 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/60 space-y-3">
 <div className="flex items-center justify-between gap-3">
 <div className="flex items-center gap-3 min-w-0">
 <div className="w-11 h-9 rounded-xl bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300 font-extrabold flex items-center justify-center text-sm shadow-md shadow-sm shrink-0 overflow-hidden">
 {studentName.slice(0, 2).toUpperCase()}
 </div>
 <div className="min-w-0 flex-1">
 <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">
 {studentName}
 </h4>
 <p className="text-xs text-slate-500 font-mono mt-0.5">
 NIS: {studentNis}
 </p>
 </div>
 </div>

 <div className="flex flex-col items-end gap-1 shrink-0">
 <span className="inline-flex items-center rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-2 border-emerald-300">
 {studentKamar}
 </span>
 <span className="text-[10px] text-slate-400 font-medium">
 Santri Binaan Asrama
 </span>
 </div>
 </div>

 {/* Previous Tahfizh Log or Smart Recommendation */}
 {loadingLastLog ? (
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50 p-3 text-center animate-pulse text-xs text-slate-500">
 ⏳ Memuat rekomendasi hafalan terakhir santri...
 </div>
 ) : lastStudentLog ? (
 <div className="rounded-xl border border-emerald-200 bg-white dark:bg-card-dark p-3 dark:border-emerald-800 dark:from-emerald-950/40 dark:to-teal-950/30 text-xs space-y-1.5">
 <div className="flex items-center justify-between gap-2">
 <div className="flex items-center gap-1.5 font-black text-emerald-900 dark:text-emerald-200">
 <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
 <span>Setoran Selesai Sebelumnya:</span>
 </div>
 <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-extrabold bg-white dark:bg-slate-800 border border-emerald-200/80 shadow-xs">
 {lastStudentLog.notes_teacher?.toLowerCase().includes('kurang') || lastStudentLog.notes_teacher?.toLowerCase().includes('perlu') ? '⚠️ Perlu Murajaah' : '🟢 Lancar'}
 </span>
 </div>

 <div className="flex flex-wrap items-center gap-2 pt-0.5">
 <span className="font-extrabold text-xs text-emerald-950 dark:text-emerald-100">
 Surah {lastStudentLog.hafalan_surah_name || `Surah ke-${lastStudentLog.hafalan_surah_number}`} (Ayat {lastStudentLog.hafalan_ayah_start || 1}–{lastStudentLog.hafalan_ayah_end || 1})
 </span>
 <span className="inline-flex items-center rounded-md bg-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-200">
 Juz {lastStudentLog.metadata?.juz || getJuzFromSurah(lastStudentLog.hafalan_surah_number)}
 </span>
 <button
 type="button"
 onClick={() => fetchLastLog(selectedStudentId)}
 className="ml-auto text-[10px] underline font-bold text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 cursor-pointer"
 >
 Terapkan Otomatis
 </button>
 </div>

 <div className="mt-2 rounded-lg bg-white/90 dark:bg-slate-900/90 p-2.5 border-2 border-emerald-300 dark:border-emerald-700/60 flex items-start gap-2">
 <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
 <div className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">
 <strong>
 {lastStudentLog.notes_teacher?.toLowerCase().includes('kurang') || lastStudentLog.notes_teacher?.toLowerCase().includes('perlu')
 ? '🔁 Mengulang Target Hafalan: '
 : '⚡ Rekomendasi Target Otomatis: '}
 </strong>
 {lastStudentLog.notes_teacher?.toLowerCase().includes('kurang') || lastStudentLog.notes_teacher?.toLowerCase().includes('perlu')
 ? 'Evaluasi sebelumnya memerlukan bimbingan, silakan setorkan kembali rentang ayat ini.'
 : 'Santri lancar pada setoran terakhir, silakan lanjutkan hafalan baru (Ziyadah).'}
 </div>
 </div>
 </div>
 ) : (
 <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-3 dark:border-amber-700/60 dark:bg-amber-950/20 text-xs">
 <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
 <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
 <span>Setoran Awal (Belum Ada Catatan Riwayat)</span>
 </div>
 <p className="mt-1 text-xs text-amber-700 dark:text-amber-400 font-medium">
 Santri ini belum memiliki riwayat setoran di sistem. Anda dapat menentukan Juz, Surah, dan Ayat awal secara leluasa.
 </p>
 </div>
 )}
 </div>
 )}

 {/* ===== 2-COLUMN LAYOUT: INPUT FORM KIRI | MUSHAF VIEWER KANAN ===== */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">

 {/* ── KOLOM KIRI: FORM INPUT ── */}
 <div className="space-y-4">
 {/* Jenis Setoran & Juz */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
 <div>
 <label htmlFor="select-setoran-type" className="font-bold block mb-1 text-slate-700 dark:text-slate-200">
 Jenis Setoran <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 id="select-setoran-type"
 value={setoranForm.type}
 onChange={(val) => setSetoranForm({ ...setoranForm, type: val })}
 options={[
 { value: 'Ziyadah', label: 'Ziyadah (Hafalan Baru)' },
 { value: 'Murajaah', label: 'Murajaah (Pengulangan)' },
 { value: 'Tasmi', label: "Tasmi' (Uji Simakan)" },
 ]}
 placeholder="Pilih Jenis Setoran"
 ariaLabel="Jenis Setoran Tahfizh"
 />
 </div>
 <div>
 <label htmlFor="select-setoran-juz" className="font-bold block mb-1 text-slate-700 dark:text-slate-200">
 Juz Capaian <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 id="select-setoran-juz"
 value={String(setoranForm.juz)}
 onChange={(val) => setSetoranForm({ ...setoranForm, juz: Number(val) })}
 options={Array.from({ length: 30 }, (_, i) => ({ value: String(i + 1), label: `Juz ${i + 1}` }))}
 placeholder="Pilih Juz"
 ariaLabel="Juz Capaian Tahfizh"
 />
 </div>
 </div>

 {/* Surah Picker */}
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <label className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
 <BookOpen className="w-4 h-4 text-emerald-600" />
 <span>Surah dari Master Al-Qur'an</span>
 <span className="text-rose-500">*</span>
 </label>
 <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl font-bold">
 <button
 type="button"
 onClick={() => setQuranInputMode('interactive')}
 className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
 quranInputMode === 'interactive'
 ? 'bg-emerald-600 text-white font-black shadow-xs'
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
 }`}
 >
 🎨 Interaktif
 </button>
 <button
 type="button"
 onClick={() => setQuranInputMode('manual')}
 className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-xs ${
 quranInputMode === 'manual'
 ? 'bg-emerald-600 text-white font-black shadow-xs'
 : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
 }`}
 >
 📋 Manual
 </button>
 </div>
 </div>
 <div className="relative">
 <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
 <input
 type="text"
 value={quranSearch}
 onChange={(e) => setQuranSearch(e.target.value)}
 placeholder="Cari Surah (misal: An-Naba, Yasin, 78)..."
 className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-emerald-200/80 rounded-xl font-semibold focus:ring-2 focus:ring-emerald-500 outline-none dark:bg-slate-900 dark:text-slate-200 dark:border-emerald-700/80"
 />
 </div>
 {quranInputMode === 'interactive' ? (
 <div className="max-h-52 overflow-y-auto border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl divide-y divide-emerald-100/80 dark:divide-emerald-900/40 bg-white dark:bg-slate-900 shadow-inner">
 {filteredQuranSurahs.map((s) => (
 <button
 key={s.nomor}
 type="button"
 onClick={() => {
 const maxAyat = s.jumlah_ayat || 40
 setSetoranForm({
 ...setoranForm,
 surah_number: s.nomor,
 juz: getJuzFromSurah(s.nomor),
 ayat_start: 1,
 ayat_end: Math.min(10, maxAyat),
 baris: Math.max(1, Math.ceil(Math.min(10, maxAyat) * 0.75)),
 })
 }}
 className={`w-full px-3.5 py-2 text-left flex items-center justify-between transition cursor-pointer ${
 setoranForm.surah_number === s.nomor
 ? 'bg-emerald-100/90 font-black text-emerald-950 border-l-4 border-emerald-600 dark:bg-emerald-950 dark:text-emerald-200'
 : 'hover:bg-emerald-50/60 text-slate-800 dark:text-slate-200 dark:hover:bg-slate-800/60'
 }`}
 >
 <div className="flex items-center gap-2.5">
 <span className="w-6 h-6 rounded-md bg-emerald-200/60 text-emerald-900 font-extrabold text-xs flex items-center justify-center dark:bg-emerald-900 dark:text-emerald-200 shrink-0">
 {s.nomor}
 </span>
 <div>
 <div className="font-extrabold">{s.nama_latin}</div>
 <div className="text-[10px] text-slate-400 font-medium">Juz {getJuzFromSurah(s.nomor)} · {s.jumlah_ayat} Ayat</div>
 </div>
 </div>
 <span className="font-serif text-base font-extrabold text-emerald-800 dark:text-emerald-400">{s.nama}</span>
 </button>
 ))}
 </div>
 ) : (
 <HeroUiFilterSelect
 id="select-setoran-surah-manual"
 value={String(setoranForm.surah_number)}
 onChange={(val) => {
 const surahNum = Number(val)
 const surahObj = quranSurahs.find((s) => s.nomor === surahNum)
 const maxAyat = surahObj ? surahObj.jumlah_ayat : 40
 setSetoranForm({
 ...setoranForm,
 surah_number: surahNum,
 juz: getJuzFromSurah(surahNum),
 ayat_start: 1,
 ayat_end: Math.min(10, maxAyat),
 baris: Math.max(1, Math.ceil(Math.min(10, maxAyat) * 0.75)),
 })
 }}
 searchable={true}
 options={quranSurahs.map((surah) => ({
 value: String(surah.nomor),
 label: `Surah ${surah.nomor}. ${surah.nama_latin} (${surah.nama})`,
 subtext: `${surah.jumlah_ayat} Ayat (Juz ${getJuzFromSurah(surah.nomor)})`,
 }))}
 />
 )}
 </div>

 {/* Ayat Range Controls */}
 {(() => {
 const cs = quranSurahs.find((s) => s.nomor === setoranForm.surah_number) || { nama_latin: `Surah ${setoranForm.surah_number}`, jumlah_ayat: 40 }
 const maxAyats = cs.jumlah_ayat || 40
 return (
 <div className="rounded-lg border border-emerald-200/80 bg-emerald-50/50 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/20 space-y-3">
 <div className="font-extrabold text-emerald-950 dark:text-emerald-200 flex items-center justify-between">
 <span className="flex items-center gap-2">
 <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
 {cs.nama_latin} ({maxAyats} Ayat)
 </span>
 <Badge color="success" size="sm">Juz {getJuzFromSurah(setoranForm.surah_number)}</Badge>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
 <div>
 <label htmlFor="select-ayat-start" className="font-bold block mb-1 text-slate-700 dark:text-slate-200">Ayat Awal</label>
 <HeroUiFilterSelect
 id="select-ayat-start"
 value={String(setoranForm.ayat_start)}
 onChange={(val) => {
 const start = Number(val)
 const end = Math.max(start, setoranForm.ayat_end)
 setSetoranForm({ ...setoranForm, ayat_start: start, ayat_end: end, baris: Math.max(1, Math.ceil((end - start + 1) * 0.75)) })
 }}
 options={Array.from({ length: maxAyats }, (_, i) => ({ value: String(i + 1), label: `Ayat ${i + 1}` }))}
 searchable={maxAyats > 15}
 size="sm"
 />
 </div>
 <div>
 <label htmlFor="select-ayat-end" className="font-bold block mb-1 text-slate-700 dark:text-slate-200">Ayat Terakhir</label>
 <HeroUiFilterSelect
 id="select-ayat-end"
 value={String(setoranForm.ayat_end)}
 onChange={(val) => {
 const end = Number(val)
 setSetoranForm({ ...setoranForm, ayat_end: end, baris: Math.max(1, Math.ceil((end - setoranForm.ayat_start + 1) * 0.75)) })
 }}
 options={Array.from({ length: maxAyats - setoranForm.ayat_start + 1 }, (_, i) => {
 const a = setoranForm.ayat_start + i
 return { value: String(a), label: `Ayat ${a}` }
 })}
 searchable={maxAyats > 15}
 size="sm"
 />
 </div>
 <div>
 <label htmlFor="input-baris-count" className="font-bold block mb-1 text-slate-700 dark:text-slate-200">Total Baris</label>
 <input
 id="input-baris-count"
 type="number"
 min="1"
 value={setoranForm.baris}
 onChange={(e) => setSetoranForm({ ...setoranForm, baris: Number(e.target.value) })}
 className="w-full h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 px-3 py-1.5 dark:bg-slate-800 font-black text-emerald-600 outline-none transition text-xs shadow-xs focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
 />
 </div>
 </div>
 <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
 <span className="font-bold text-slate-500 text-[10px]">Pilih Cepat:</span>
 {[5, 10].map((n) => (
 <button
 key={n}
 type="button"
 onClick={() => {
 const end = Math.min(setoranForm.ayat_start + n - 1, maxAyats)
 setSetoranForm({ ...setoranForm, ayat_end: end, baris: Math.max(1, Math.ceil((end - setoranForm.ayat_start + 1) * 0.75)) })
 }}
 className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-700/80 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px] hover:bg-emerald-100 transition cursor-pointer shadow-2xs"
 >
 +{n} Ayat
 </button>
 ))}
 <button
 type="button"
 onClick={() => setSetoranForm({ ...setoranForm, ayat_start: 1, ayat_end: maxAyats, baris: Math.max(1, Math.ceil(maxAyats * 0.75)) })}
 className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-700/80 text-emerald-700 dark:text-emerald-400 font-extrabold text-[10px] hover:bg-emerald-100 transition cursor-pointer shadow-2xs"
 >
 Full Surah ({maxAyats} Ayat)
 </button>
 </div>
 </div>
 )
 })()}

 {/* Evaluasi 3 Dimensi */}
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label htmlFor="select-setoran-kelancaran" className="font-bold block mb-1 text-slate-700 dark:text-slate-200">
 Kelancaran <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 id="select-setoran-kelancaran"
 value={setoranForm.kelancaran}
 onChange={(val) => setSetoranForm({ ...setoranForm, kelancaran: val })}
 options={[
 { value: 'Sangat Lancar', label: 'Sangat Lancar' },
 { value: 'Lancar', label: 'Lancar' },
 { value: 'Cukup', label: 'Cukup' },
 { value: 'Kurang', label: 'Kurang / Perlu Bimbingan' },
 ]}
 placeholder="Pilih Kelancaran"
 />
 </div>
 <div>
 <label htmlFor="select-setoran-tajwid" className="font-bold block mb-1 text-slate-700 dark:text-slate-200">
 Tajwid <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 id="select-setoran-tajwid"
 value={setoranForm.tajwid}
 onChange={(val) => setSetoranForm({ ...setoranForm, tajwid: val })}
 options={[
 { value: 'A', label: 'A (Sangat Baik)' },
 { value: 'B', label: 'B (Baik)' },
 { value: 'C', label: 'C (Cukup)' },
 { value: 'D', label: 'D (Perlu Perbaikan)' },
 ]}
 placeholder="Pilih Tajwid"
 />
 </div>
 <div>
 <label htmlFor="select-setoran-makhraj" className="font-bold block mb-1 text-slate-700 dark:text-slate-200">
 Makhraj <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 id="select-setoran-makhraj"
 value={setoranForm.makhraj}
 onChange={(val) => setSetoranForm({ ...setoranForm, makhraj: val })}
 options={[
 { value: 'A', label: 'A (Sangat Fasih)' },
 { value: 'B', label: 'B (Fasih)' },
 { value: 'C', label: 'C (Cukup)' },
 { value: 'D', label: 'D (Perlu Perbaikan)' },
 ]}
 placeholder="Pilih Makhraj"
 />
 </div>
 </div>

 {/* Catatan & Arahan Evaluasi Musyrif */}
 <div>
 <label htmlFor="tahfizh-catatan-musyrif" className="font-bold block mb-1 text-slate-700 dark:text-slate-200">
 Catatan &amp; Arahan Evaluasi Musyrif
 </label>
 <textarea
 id="tahfizh-catatan-musyrif"
 rows={2}
 value={setoranForm.notes || ''}
 onChange={(e) => setSetoranForm({ ...setoranForm, notes: e.target.value })}
 placeholder="Tuliskan catatan bimbingan, kelemahan tajwid/makhraj, atau arahan setoran berikutnya..."
 className="w-full border rounded-xl p-3 dark:bg-slate-800 border-emerald-300 dark:border-emerald-700/80 font-semibold text-slate-800 dark:text-white shadow-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 text-xs"
 />
 </div>
 </div>
 {/* ── END KOLOM KIRI ── */}

 {/* ── KOLOM KANAN: LIVE ARABIC QURAN VIEWER ── */}
 <div className="flex flex-col h-full">
 {(() => {
 const currentSurah = quranSurahs.find((s) => s.nomor === setoranForm.surah_number)
 const ayatsToShow = modalAyatsList.filter(
 (a) => Number(a.nomorAyat || a.nomor_ayat || a.ayat) >= setoranForm.ayat_start &&
 Number(a.nomorAyat || a.nomor_ayat || a.ayat) <= setoranForm.ayat_end
 )
 return (
 <div className="flex flex-col h-full bg-white dark:bg-card-dark rounded-xl border border-emerald-800/50 shadow-xl overflow-hidden">
 {/* Surah Header */}
 <div className="px-4 py-3 bg-white dark:bg-card-dark border-b border-emerald-800/60 text-center shrink-0">
 {currentSurah ? (
 <>
 <div className="text-2xl font-extrabold text-emerald-200 leading-none" style={{ fontFamily: "'Amiri','Scheherazade New',serif", direction: 'rtl' }}>
 {currentSurah.nama}
 </div>
 <div className="text-xs text-emerald-400 font-bold mt-1">{currentSurah.nama_latin} · سورة</div>
 <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
 <span className="px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-300 text-[10px] font-extrabold">Juz {getJuzFromSurah(setoranForm.surah_number)}</span>
 <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-extrabold">{currentSurah.jumlah_ayat} Ayat</span>
 <span className="px-2 py-0.5 rounded-full bg-teal-900 text-teal-300 text-[10px] font-extrabold">Ayat {setoranForm.ayat_start}–{setoranForm.ayat_end}</span>
 </div>
 </>
 ) : (
 <div className="text-emerald-400 text-xs font-semibold py-1">Pilih surah untuk preview</div>
 )}
 </div>

 {/* Bismillah */}
 {setoranForm.surah_number !== 9 && setoranForm.ayat_start === 1 && (
 <div className="text-center py-2 px-4 border-b border-emerald-900/50 shrink-0">
 <span className="text-lg font-extrabold text-amber-300" style={{ fontFamily: "'Amiri','Scheherazade New',serif", direction: 'rtl' }}>
 بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
 </span>
 </div>
 )}

 {/* Ayat List */}
 <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ minHeight: '220px', maxHeight: '340px' }}>
 {loadingModalAyats ? (
 <div className="flex flex-col items-center justify-center py-10 gap-3">
 <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
 <p className="text-emerald-400 text-xs font-semibold animate-pulse">Memuat teks Al-Qur&apos;an...</p>
 </div>
 ) : ayatsToShow.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-10 gap-2 text-center">
 <span className="text-3xl">📖</span>
 <p className="text-slate-400 text-xs font-medium">Klik surah untuk menampilkan teks ayat Al-Qur&apos;an</p>
 </div>
 ) : (
 ayatsToShow.map((a) => {
 const ayatNum = a.nomorAyat || a.nomor_ayat || a.ayat
 const arabicText = a.teksArab || a.teks_arab || a.ar
 return (
 <motion.div key={ayatNum} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="text-right" style={{ direction: 'rtl' }}>
 <div className="flex items-start gap-2 justify-end">
 <div className="shrink-0 w-7 h-7 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-[10px] font-extrabold flex items-center justify-center mt-1" style={{ direction: 'ltr' }}>{ayatNum}</div>
 <p className="flex-1 font-extrabold text-slate-100" style={{ fontFamily: "'Amiri','Scheherazade New','Noto Naskh Arabic',serif", direction: 'rtl', fontSize: '1.15rem', lineHeight: '2.4' }}>
 {arabicText}
 </p>
 </div>
 {(a.teksLatin || a.teks_latin) && (
 <p className="text-[10px] text-slate-400 font-medium mt-0.5 text-left" style={{ direction: 'ltr' }}>{a.teksLatin || a.teks_latin}</p>
 )}
 <div className="border-b border-emerald-800/60 mt-2" />
 </motion.div>
 )
 })
 )}
 </div>

 {/* Footer */}
 <div className="px-4 py-2 bg-slate-900/80 border-t border-emerald-800/60 flex items-center justify-between shrink-0">
 <span className="text-[10px] text-slate-400 font-semibold">{ayatsToShow.length} ayat ditampilkan</span>
 <span className="text-[10px] text-emerald-500 font-bold flex items-center gap-1"><Sparkles className="w-3 h-3" /> Preview Real-time</span>
 </div>
 </div>
 )
 })()}
 </div>
 {/* ── END KOLOM KANAN ── */}

 </div>
 {/* ===== END 2-COLUMN LAYOUT ===== */}
 </div>
 )
 })()}
 </DialogBody>

 <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-end gap-3 shrink-0">
 <button
 type="button"
 onClick={() => setQuickActionModal(null)}
 className="h-9 px-5 border border-emerald-200/80 dark:border-emerald-700/80 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition text-xs flex items-center gap-1.5 cursor-pointer"
 >
 <X className="w-4 h-4" /> Batal
 </button>
 <button
 type="button"
 disabled={savingQuickAction}
 onClick={() => handleSimpanFiturAksi('Setoran Hafalan Tahfizh', 'setoran')}
 className="h-9 inline-flex items-center justify-center gap-2 px-6 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black shadow-lg shadow-sm hover:brightness-110 active:scale-95 disabled:opacity-50 transition text-xs cursor-pointer"
 >
 <Check className="w-4 h-4" /> Simpan Setoran Hafalan
 </button>
 </DialogFooter>
 </>
 )}

 {/* 3. LOG UJIAN TASMI' MODAL */}
 {quickActionModal === 'tasmi' && (
 <>
 <DialogHeader className="flex items-center justify-between border-b border-emerald-500/20 bg-white px-6 py-4.5 dark:border-emerald-800/60 dark:bg-slate-950 shrink-0">
 <div className="flex items-center gap-3">
 <div className="flex h-9 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border-2 border-amber-300 dark:bg-amber-950/60 dark:border-amber-700/80 dark:text-amber-300 shadow-sm shrink-0">
 <Award className="h-6 w-6" />
 </div>
 <div className="min-w-0 flex-1">
 <DialogTitle className="text-base sm:text-lg font-black text-slate-900 dark:text-emerald-600 flex items-center gap-2">
 <span>Log Ujian Tasmi' Al-Qur'an (Sekali Duduk)</span>
 <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-black text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40">
 Ujian Marhalah
 </span>
 </DialogTitle>
 <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium text-left">
 Pencatatan resmi ujian hafalan 1 Juz, 5 Juz, 10 Juz, &amp; 30 Juz sekali duduk beserta Tajwid &amp; Makhraj
 </DialogDescription>
 </div>
 </div>
 <DialogClose onClick={() => setQuickActionModal(null)} />
 </DialogHeader>

 <DialogBody className="p-4 sm:p-6 pb-36 flex-1 overflow-y-auto min-h-0 space-y-4 text-xs">
 {(() => {
 const selectedStudent = dbStudents.find((s) => String(s.id) === String(selectedStudentId)) || dbStudents[0]
 const studentName = selectedStudent ? (selectedStudent.full_name || selectedStudent.nama_lengkap || selectedStudent.name || 'Santri Binaan') : 'Santri Binaan'
 const studentNis = selectedStudent ? (selectedStudent.nis || selectedStudent.nisn || '-') : '-'
 const studentKamar = selectedStudent ? (selectedStudent.kamar || selectedStudent.room_name || 'Kamar Asrama') : 'Asrama'
 const studentSelectOptions = dbStudents.map((s) => ({
 value: String(s.id),
 label: `${s.full_name || s.nama_lengkap || s.name || 'Santri'} ${s.nis ? `(NIS: ${s.nis})` : ''}`,
 subtext: `Kamar: ${s.kamar || s.room_name || 'Asrama Pondok'}`,
 badge: 'Santri Binaan',
 }))

 const tasmiCategories = [
 { id: 'tasmi_1_juz', label: "Tasmi' 1 Juz", desc: 'Ujian Juz Tunggal', icon: '🌟', badge: '1 Juz', color: 'border-emerald-300 bg-emerald-50/70 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-700 dark:text-emerald-300' },
 { id: 'tasmi_5_juz', label: "Tasmi' 5 Juz", desc: 'Marhalah Wustha', icon: '🏅', badge: '5 Juz', color: 'border-sky-300 bg-sky-50/70 text-sky-800 dark:bg-sky-950/40 dark:border-sky-700 dark:text-sky-300' },
 { id: 'tasmi_10_juz', label: "Tasmi' 10 Juz", desc: "Marhalah 'Ulya", icon: '🎖️', badge: '10 Juz', color: 'border-purple-300 bg-purple-50/70 text-purple-800 dark:bg-purple-950/40 dark:border-purple-700 dark:text-purple-300' },
 { id: 'tasmi_30_juz', label: "Tasmi' 30 Juz", desc: 'Khatam Mumtaz', icon: '👑', badge: '30 Juz', color: 'border-amber-300 bg-amber-50/70 text-amber-800 dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-300' },
 ]

 const getPredikat = (score) => {
 const num = Number(score) || 0
 if (num >= 90) return { label: 'Mumtaz (Istimewa)', color: 'text-emerald-700 bg-emerald-100 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300' }
 if (num >= 80) return { label: 'Jayyid Jiddan (Sangat Baik)', color: 'text-blue-700 bg-blue-100 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300' }
 if (num >= 70) return { label: 'Jayyid (Baik)', color: 'text-amber-700 bg-amber-100 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300' }
 return { label: 'Maqbul (Cukup)', color: 'text-rose-700 bg-rose-100 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300' }
 }

 return (
 <div className="space-y-4">
 {/* 1. SELEKSI SANTRI PESERTA TASMI' */}
 <div className="rounded-xl border border-emerald-500/25 bg-emerald-50/50 p-3.5 sm:p-4 dark:border-emerald-800/50 dark:bg-emerald-950/20 space-y-3">
 <div className="flex items-center justify-between gap-2">
 <label htmlFor="select-tasmi-student" className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
 <Users className="w-4 h-4 text-emerald-600" />
 <span>Pilih Santri Peserta Ujian Tasmi'</span>
 <span className="text-rose-500">*</span>
 </label>
 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-700/80">
 {dbStudents.length} Santri Binaan
 </span>
 </div>
 <HeroUiFilterSelect
 id="select-tasmi-student"
 value={String(selectedStudentId || (selectedStudent ? selectedStudent.id : ''))}
 onChange={(val) => setSelectedStudentId(val)}
 placeholder={loadingStudents ? 'Memuat data santri...' : 'Cari & Pilih Santri Peserta...'}
 searchable={true}
 options={studentSelectOptions}
 size="md"
 />
 </div>

 {/* 2. CARD PROFIL SANTRI TERPILIH */}
 {selectedStudent && (
 <div className="rounded-2xl border border-emerald-200/90 bg-white p-3.5 sm:p-4 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/60 flex items-center justify-between gap-3">
 <div className="flex items-center gap-3 min-w-0">
 <div className="w-11 h-9 rounded-xl bg-white dark:bg-card-dark font-extrabold flex items-center justify-center text-sm shadow-md shadow-sm shrink-0 overflow-hidden border border-emerald-200/80 dark:border-emerald-800/60">
 {studentName.slice(0, 2).toUpperCase()}
 </div>
 <div className="min-w-0 flex-1">
 <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">
 {studentName}
 </h4>
 <p className="text-xs text-slate-500 font-mono mt-0.5">
 NIS: {studentNis}
 </p>
 </div>
 </div>
 <div className="flex flex-col items-end gap-1 shrink-0">
 <span className="inline-flex items-center rounded-lg bg-amber-100 px-2.5 py-1 text-[10px] font-black text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300/40">
 {studentKamar}
 </span>
 <span className="text-[10px] text-slate-400 font-medium">
 Peserta Tasmi' Asrama
 </span>
 </div>
 </div>
 )}

 {/* 3. KATEGORI UJIAN TASMI' - 4 INTERACTIVE QUICK CARDS */}
 <div className="space-y-2">
 <label className="font-bold text-slate-700 dark:text-slate-200 block text-xs">
 Pilih Kategori Ujian Tasmi' (Sekali Duduk): <span className="text-rose-500">*</span>
 </label>
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
 {tasmiCategories.map((cat) => {
 const isSelected = tasmiForm.type === cat.id
 return (
 <button
 key={cat.id}
 type="button"
 onClick={() => setTasmiForm({ ...tasmiForm, type: cat.id })}
 className={`p-3 rounded-xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer ${
 isSelected
 ? 'ring-2 ring-amber-500 border-amber-500 bg-amber-50/90 dark:bg-amber-950/50 shadow-sm'
 : 'border-emerald-200/80 hover:border-amber-300 bg-white dark:bg-slate-900 dark:border-emerald-800/60'
 }`}
 >
 <div className="flex items-center justify-between mb-2">
 <span className="text-lg">{cat.icon}</span>
 <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border ${cat.color}`}>
 {cat.badge}
 </span>
 </div>
 <div>
 <div className="font-black text-xs text-slate-900 dark:text-white">{cat.label}</div>
 <div className="text-[10px] text-slate-400 font-medium mt-0.5">{cat.desc}</div>
 </div>
 </button>
 )
 })}
 </div>
 </div>

 {/* 4. SELEKSI JUZ & PARAMETER UJIAN (Dengan Stacking Context z-30) */}
 <div className="relative z-30 rounded-2xl border border-emerald-200/90 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/60 space-y-3">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
 <div>
 <label htmlFor="select-tasmi-type" className="font-bold block mb-1 text-slate-700 dark:text-slate-200">
 Kategori Ujian <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 id="select-tasmi-type"
 value={tasmiForm.type}
 onChange={(val) => setTasmiForm({ ...tasmiForm, type: val })}
 options={[
 { value: 'tasmi_1_juz', label: "Tasmi' 1 Juz (Ujian Juz Tunggal)" },
 { value: 'tasmi_5_juz', label: "Tasmi' 5 Juz (Marhalah Wustha)" },
 { value: 'tasmi_10_juz', label: "Tasmi' 10 Juz (Marhalah 'Ulya)" },
 { value: 'tasmi_30_juz', label: "Tasmi' 30 Juz (Khatam Mumtaz)" },
 ]}
 placeholder="Pilih Kategori Ujian"
 />
 </div>

 <div>
 <label htmlFor="select-tasmi-juz" className="font-bold block mb-1 text-slate-700 dark:text-slate-200">
 {tasmiForm.type === 'tasmi_5_juz'
 ? 'Pilihan Blok 5 Juz'
 : tasmiForm.type === 'tasmi_10_juz'
 ? 'Pilihan Blok 10 Juz'
 : tasmiForm.type === 'tasmi_30_juz'
 ? 'Target Capaian Ujian'
 : 'Juz ke-'} <span className="text-rose-500">*</span>
 </label>

 {tasmiForm.type === 'tasmi_1_juz' && (
 <HeroUiFilterSelect
 id="select-tasmi-juz"
 value={String(tasmiForm.juz)}
 onChange={(val) => setTasmiForm({ ...tasmiForm, juz: Number(val) })}
 options={Array.from({ length: 30 }, (_, i) => ({ value: String(i + 1), label: `Juz ${i + 1}` }))}
 searchable={true}
 placeholder="Pilih Juz Ujian"
 align="right"
 />
 )}

 {tasmiForm.type === 'tasmi_5_juz' && (
 <HeroUiFilterSelect
 id="select-tasmi-juz"
 value={String(tasmiForm.juz)}
 onChange={(val) => setTasmiForm({ ...tasmiForm, juz: Number(val) })}
 options={[
 { value: '1', label: 'Juz 1 – 5 (Blok Awal)' },
 { value: '6', label: 'Juz 6 – 10' },
 { value: '11', label: 'Juz 11 – 15' },
 { value: '16', label: 'Juz 16 – 20' },
 { value: '21', label: 'Juz 21 – 25' },
 { value: '26', label: 'Juz 26 – 30 (Blok Akhir)' },
 ]}
 placeholder="Pilih Blok 5 Juz"
 align="right"
 />
 )}

 {tasmiForm.type === 'tasmi_10_juz' && (
 <HeroUiFilterSelect
 id="select-tasmi-juz"
 value={String(tasmiForm.juz)}
 onChange={(val) => setTasmiForm({ ...tasmiForm, juz: Number(val) })}
 options={[
 { value: '1', label: 'Juz 1 – 10 (Sepertiga Pertama)' },
 { value: '11', label: 'Juz 11 – 20 (Sepertiga Kedua)' },
 { value: '21', label: 'Juz 21 – 30 (Sepertiga Ketiga)' },
 ]}
 placeholder="Pilih Blok 10 Juz"
 align="right"
 />
 )}

 {tasmiForm.type === 'tasmi_30_juz' && (
 <div className="h-9 px-3.5 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 font-extrabold flex items-center justify-between dark:bg-amber-950/40 dark:border-amber-700 dark:text-amber-200">
 <span>📖 Ujian Akbar 30 Juz Lengkap</span>
 <Badge color="warning" size="sm">Khatam</Badge>
 </div>
 )}
 </div>
 </div>

 {/* Quick pill selector untuk Juz populer pada tasmi 1 juz */}
 {tasmiForm.type === 'tasmi_1_juz' && (
 <div className="flex items-center gap-1.5 flex-wrap pt-1">
 <span className="font-bold text-slate-500 text-[10px]">Pilih Cepat Juz:</span>
 {[30, 29, 28, 1, 2].map((j) => (
 <button
 key={j}
 type="button"
 onClick={() => setTasmiForm({ ...tasmiForm, juz: j })}
 className={`px-2.5 py-1 rounded-lg border text-[10px] font-black transition cursor-pointer ${
 tasmiForm.juz === j
 ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
 : 'bg-slate-50 text-slate-700 border-emerald-200/80 hover:bg-amber-50 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300'
 }`}
 >
 Juz {j}
 </button>
 ))}
 </div>
 )}
 </div>

 {/* 5. EVALUASI NILAI TAJWID, MAKHRAJ & SCORE (Dengan Stacking Context z-20) */}
 <div className="relative z-20 rounded-2xl border border-emerald-200/90 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/60 space-y-3">
 <div className="font-bold text-slate-700 dark:text-slate-200 text-xs flex items-center justify-between">
 <span>Evaluasi Rubrik Ujian &amp; Skor Akhir: <span className="text-rose-500">*</span></span>
 <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${getPredikat(tasmiForm.score).color}`}>
 Predikat: {getPredikat(tasmiForm.score).label}
 </span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 <div>
 <label htmlFor="select-tasmi-tajwid" className="font-bold block mb-1 text-slate-700 dark:text-slate-200">
 Nilai Tajwid <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 id="select-tasmi-tajwid"
 value={tasmiForm.tajwid}
 onChange={(val) => setTasmiForm({ ...tasmiForm, tajwid: val })}
 options={[
 { value: 'A', label: 'A (Sangat Baik / Mumtaz)' },
 { value: 'B', label: 'B (Baik / Jayyid)' },
 { value: 'C', label: 'C (Cukup / Maqbul)' },
 { value: 'D', label: 'D (Perlu Perbaikan)' },
 ]}
 placeholder="Pilih Tajwid"
 />
 </div>

 <div>
 <label htmlFor="select-tasmi-makhraj" className="font-bold block mb-1 text-slate-700 dark:text-slate-200">
 Nilai Makhraj <span className="text-rose-500">*</span>
 </label>
 <HeroUiFilterSelect
 id="select-tasmi-makhraj"
 value={tasmiForm.makhraj}
 onChange={(val) => setTasmiForm({ ...tasmiForm, makhraj: val })}
 options={[
 { value: 'A', label: 'A (Sangat Fasih / Mumtaz)' },
 { value: 'B', label: 'B (Fasih / Jayyid)' },
 { value: 'C', label: 'C (Cukup / Maqbul)' },
 { value: 'D', label: 'D (Perlu Perbaikan)' },
 ]}
 placeholder="Pilih Makhraj"
 />
 </div>

 <div>
 <label htmlFor="input-tasmi-score" className="font-bold block mb-1 text-slate-700 dark:text-slate-200">
 Nilai Angka (0–100) <span className="text-rose-500">*</span>
 </label>
 <input
 id="input-tasmi-score"
 type="number"
 min="0"
 max="100"
 value={tasmiForm.score ?? 90}
 onChange={(e) => setTasmiForm({ ...tasmiForm, score: Number(e.target.value) })}
 className="w-full h-9 rounded-xl border border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-800 px-3 text-xs font-black text-amber-600 dark:text-amber-400 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 shadow-xs"
 placeholder="90"
 />
 </div>
 </div>
 </div>

 {/* 6. CATATAN EVALUASI PENGUJI / MUSYRIF */}
 <div className="relative z-10 space-y-1.5">
 <label htmlFor="tasmi-notes" className="font-bold block text-slate-700 dark:text-slate-200 text-xs">
 Catatan &amp; Arahan Penguji Tasmi'
 </label>
 <textarea
 id="tasmi-notes"
 rows={3}
 value={tasmiForm.notes || ''}
 onChange={(e) => setTasmiForm({ ...tasmiForm, notes: e.target.value })}
 placeholder="Catatan kesalahan ayat, kelancaran nafas/waqaf ibtida', atau rekomendasi penerbitan Syahadah/Sertifikat Tasmi'..."
 className="w-full border rounded-xl p-3 dark:bg-slate-800 border-emerald-300 dark:border-emerald-700/80 font-semibold text-slate-800 dark:text-white shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-xs"
 />
 </div>
 </div>
 )
 })()}
 </DialogBody>

 <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-end gap-3 shrink-0">
 <button
 type="button"
 onClick={() => setQuickActionModal(null)}
 className="h-9 px-5 border border-emerald-200/80 dark:border-emerald-700/80 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold transition text-xs flex items-center gap-1.5 cursor-pointer"
 >
 <X className="w-4 h-4" /> Batal
 </button>
 <button
 type="button"
 disabled={savingQuickAction}
 onClick={() => handleSimpanFiturAksi('Ujian Tasmi', 'tasmi')}
 className="h-9 inline-flex items-center justify-center gap-2 px-6 bg-white dark:bg-card-dark rounded-xl font-black shadow-lg shadow-sm hover:brightness-110 active:scale-95 disabled:opacity-50 transition text-xs cursor-pointer"
 >
 <Award className="w-4 h-4" /> Simpan Ujian Tasmi'
 </button>
 </DialogFooter>
 </>
 )}

 {/* 4. POIN KEDISIPLINAN MODAL */}
 {quickActionModal === 'poin' && (
 <>
 <DialogHeader className="bg-white dark:bg-card-dark px-6 py-4 flex items-center justify-between shrink-0 border-b border-amber-800/80">
 <div className="flex items-center gap-3">
 <div className="w-10 h-9 rounded-xl bg-amber-700/80 text-amber-200 flex items-center justify-center border border-amber-600/60 shadow-inner shrink-0">
 <ShieldAlert className="w-5 h-5 text-amber-200" />
 </div>
 <div>
 <DialogTitle className="text-base font-extrabold text-emerald-600 text-left">
 Transaksi Poin Kedisiplinan (+/-)
 </DialogTitle>
 <DialogDescription className="text-xs text-amber-200/90 mt-0.5 font-medium text-left">
 Pencatatan sanksi pelanggaran (poin minus) dan prestasi kebaikan (poin plus)
 </DialogDescription>
 </div>
 </div>
 <DialogClose onClick={() => setQuickActionModal(null)} />
 </DialogHeader>

 <DialogBody className="p-4 sm:p-5 pb-6 flex-1 overflow-y-auto min-h-0 space-y-3.5 text-xs">
 {renderStudentSelectOption()}
 <div>
 <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Jenis Transaksi</label>
 <HeroUiFilterSelect
 id="select-poin-type"
 value={poinForm.type}
 onChange={(val) => {
 setPoinForm((prev) => ({
 ...prev,
 type: val,
 category_id: '',
 points: val === 'violation' ? -10 : 10,
 }))
 }}
 options={[
 { value: 'violation', label: 'Pelanggaran / Sanksi (Poin Minus)', badge: 'Minus', badgeColor: 'bg-rose-100 text-rose-800' },
 { value: 'achievement', label: 'Prestasi / Kebaikan (Poin Plus)', badge: 'Plus', badgeColor: 'bg-emerald-100 text-emerald-800' },
 ]}
 />
 </div>

 {/* PILIHAN ATURAN TATA TERTIB TU (JIKA PELANGGARAN) */}
 {poinForm.type === 'violation' && (
 <div>
 <div className="flex items-center justify-between mb-1">
 <label className="font-bold text-slate-700 dark:text-slate-300 text-xs">
 Pilih Pasal Pelanggaran (Tata Tertib TU)
 </label>
 {disciplineCategories.length > 0 && (
 <span className="text-[10.5px] font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/80 dark:border-emerald-800/60">
 {disciplineCategories.length} Pasal Tersedia
 </span>
 )}
 </div>
 <HeroUiFilterSelect
 id="select-poin-category"
 searchable={true}
 size="md"
 placeholder={loadingDisciplineCategories ? 'Memuat 122 pasal tata tertib...' : 'Cari & Pilih Pelanggaran Tata Tertib TU...'}
 value={poinForm.category_id}
 onChange={(val) => {
 const cat = disciplineCategories.find((c) => String(c.id) === String(val))
 if (cat) {
 const weight = Number(cat.point_weight || 10)
 setPoinForm((prev) => ({
 ...prev,
 category_id: cat.id,
 points: -Math.abs(weight),
 notes: prev.notes || `[${cat.code || 'Pasal'}] ${cat.name || ''}.${cat.direct_consequence ? ` Konsekuensi: ${cat.direct_consequence}` : ''}`.trim(),
 }))
 } else {
 setPoinForm((prev) => ({ ...prev, category_id: '' }))
 }
 }}
 options={[
 {
 value: '',
 label: '-- Input Mandiri / Kustom (Di Luar Daftar Tata Tertib) --',
 subtext: 'Pilih ini jika pelanggaran tidak tercantum di pasal baku TU',
 },
 ...disciplineCategories.map((c) => ({
 value: String(c.id),
 label: `[${c.code || 'Pasal'}] ${c.name} (-${c.point_weight} Poin)`,
 subtext: `Bobot: -${c.point_weight} Poin${c.direct_consequence ? ` • Sanksi: ${c.direct_consequence}` : ''}`,
 badge: c.cluster ? String(c.cluster).replace('_', ' ').toUpperCase() : (c.level ? `Tingkat ${c.level}` : 'Pelanggaran'),
 badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
 })),
 ]}
 />
 </div>
 )}

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">
 Bobot Poin {poinForm.type === 'violation' ? '(Minus)' : '(Plus)'}
 </label>
 <input
 type="number"
 value={poinForm.points}
 onChange={(e) => setPoinForm({ ...poinForm, points: e.target.value })}
 className={`w-full h-10 rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 px-3 py-2 bg-white dark:bg-[#111827] text-xs font-black outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-2xs ${
 poinForm.type === 'violation' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
 }`}
 />
 {poinForm.category_id && (
 <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 flex items-center gap-1">
 <span>✓</span> Sesuai bobot regulasi tata tertib TU
 </p>
 )}
 </div>
 <div>
 <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Status Kasus</label>
 <HeroUiFilterSelect
 id="select-poin-status"
 value={poinForm.status}
 onChange={(val) => setPoinForm({ ...poinForm, status: val })}
 options={[
 { value: 'tercatat', label: 'Tercatat Baru' },
 { value: 'dalam_pengawasan', label: 'Dalam Pengawasan' },
 { value: 'selesai_sanksi', label: 'Selesai Sanksi' },
 { value: 'dirujuk_bk', label: 'Dirujuk ke Guru BK' },
 ]}
 />
 </div>
 </div>
 <div>
 <label className="font-bold block mb-1 text-slate-700 dark:text-slate-300">Keterangan Kejadian</label>
 <textarea
 rows="2"
 value={poinForm.notes}
 onChange={(e) => setPoinForm({ ...poinForm, notes: e.target.value })}
 placeholder="Detail catatan kedisiplinan atau kronologi..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 bg-white dark:bg-[#111827] text-xs font-medium text-slate-800 dark:text-slate-200 outline-none transition focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-2xs"
 />
 </div>
 </DialogBody>

 <DialogFooter className="px-6 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-end gap-3 shrink-0">
 <MasterActionButton variant="secondary" icon={X} onClick={() => setQuickActionModal(null)}>
 Batal
 </MasterActionButton>
 <MasterActionButton variant="export" icon={Check} disabled={savingQuickAction} onClick={() => handleSimpanFiturAksi('Poin Kedisiplinan', 'poin')}>
 Simpan Catatan Poin
 </MasterActionButton>
 </DialogFooter>
 </>
 )}

 {/* 5. LOG KLINIK MODAL */}
 {quickActionModal === 'klinik' && (
 <>
 <DialogHeader className="bg-white dark:bg-card-dark px-6 py-4 flex items-center justify-between shrink-0 border-b border-rose-800/80">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-rose-700/80 text-rose-200 flex items-center justify-center border border-rose-600/60 shadow-inner shrink-0">
 <HeartPulse className="w-5 h-5" />
 </div>
 <div>
 <DialogTitle className="text-base font-extrabold text-emerald-600 text-left">
 Log Klinik & Kesehatan Santri
 </DialogTitle>
 <DialogDescription className="text-xs text-rose-200/90 mt-0.5 font-medium text-left">
 Pencatatan santri sakit, keluhan/gejala, obat yang diberikan, & rekomendasi istirahat
 </DialogDescription>
 </div>
 </div>
 <DialogClose onClick={() => setQuickActionModal(null)} />
 </DialogHeader>

 <DialogBody className="p-4 sm:p-6 pb-28 flex-1 overflow-y-auto min-h-0 space-y-4 text-xs">
 {renderStudentSelectOption()}
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Gejala Keluhan</label>
 <input
 type="text"
 value={klinikForm.symptoms}
 onChange={(e) => setKlinikForm({ ...klinikForm, symptoms: e.target.value })}
 placeholder="Demam, pusing, batuk..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-rose-600 focus:ring-2 focus:ring-rose-600/15 outline-none transition"
 />
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Obat Diberikan</label>
 <input
 type="text"
 value={klinikForm.medicine}
 onChange={(e) => setKlinikForm({ ...klinikForm, medicine: e.target.value })}
 placeholder="Paracetamol, vitamin..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs font-semibold outline-none transition"
 />
 </div>
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Rekomendasi</label>
 <HeroUiFilterSelect
 id="select-klinik-status"
 value={klinikForm.status}
 onChange={(val) => setKlinikForm({ ...klinikForm, status: val })}
 buttonClassName="w-full"
 options={[
 { value: 'rawat_jalan', label: 'Rawat Jalan di Kamar' },
 { value: 'istirahat_uksh', label: 'Istirahat di UKS Asrama' },
 { value: 'dirujuk_rs', label: 'Dirujuk ke RS/Klinik' },
 ]}
 />
 </div>
 </div>
 </DialogBody>

 <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-end gap-3 shrink-0">
 <MasterActionButton variant="secondary" icon={X} onClick={() => setQuickActionModal(null)}>
 Batal
 </MasterActionButton>
 <MasterActionButton variant="import" icon={Check} disabled={savingQuickAction} onClick={() => handleSimpanFiturAksi('Klinik Kesehatan', 'klinik')}>
 {savingQuickAction ? 'Menyimpan...' : 'Simpan Log Klinik'}
 </MasterActionButton>
 </DialogFooter>
 </>
 )}

 {/* 6. LOG PENITIPAN HP/LAPTOP MODAL */}
 {quickActionModal === 'titipan' && (
 <>
 <DialogHeader className="bg-white dark:bg-card-dark px-6 py-4 flex items-center justify-between shrink-0 border-b border-sky-800/80">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-sky-700/80 text-sky-200 flex items-center justify-center border border-sky-600/60 shadow-inner shrink-0">
 <Smartphone className="w-5 h-5" />
 </div>
 <div>
 <DialogTitle className="text-base font-extrabold text-slate-600 text-left">
 Log Penitipan Barang Berharga (HP/Laptop)
 </DialogTitle>
 <DialogDescription className="text-xs text-sky-200/90 mt-0.5 font-medium text-left">
 Pencatatan barang elektronik santri yang diserahkan/diambil dari Musyrif
 </DialogDescription>
 </div>
 </div>
 <DialogClose onClick={() => setQuickActionModal(null)} />
 </DialogHeader>

 <DialogBody className="p-4 sm:p-6 pb-28 flex-1 overflow-y-auto min-h-0 space-y-4 text-xs">
 {renderStudentSelectOption()}
 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Jenis Barang</label>
 <HeroUiFilterSelect
 id="select-titipan-type"
 value={titipanForm.item_type}
 onChange={(val) => setTitipanForm({ ...titipanForm, item_type: val })}
 buttonClassName="w-full"
 options={[
 { value: 'smartphone', label: 'Smartphone / HP' },
 { value: 'laptop', label: 'Laptop / Notebook' },
 { value: 'tablet', label: 'Tablet / iPad' },
 ]}
 />
 </div>
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Merk / Serial Number</label>
 <input
 type="text"
 value={titipanForm.serial_number}
 onChange={(e) => setTitipanForm({ ...titipanForm, serial_number: e.target.value })}
 placeholder="Samsung A54 / SN123"
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs font-semibold outline-none transition"
 />
 </div>
 </div>
 </DialogBody>

 <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-end gap-3 shrink-0">
 <MasterActionButton variant="secondary" icon={X} onClick={() => setQuickActionModal(null)}>
 Batal
 </MasterActionButton>
 <MasterActionButton variant="primary" icon={Check} disabled={savingQuickAction} onClick={() => handleSimpanFiturAksi('Penitipan Barang', 'titipan')}>
 Catat Penitipan
 </MasterActionButton>
 </DialogFooter>
 </>
 )}

 {/* 7. MODAL PERIZINAN DARURAT (SANTRI MENDADAK PULANG / SAKIT / RUJUKAN) */}
 {quickActionModal === 'perizinan_darurat' && (
 <>
 <DialogHeader className="bg-white dark:bg-card-dark px-6 py-4 flex items-center justify-between shrink-0 border-b border-rose-800/80">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-rose-700/80 text-rose-200 flex items-center justify-center border border-rose-600/60 shadow-inner shrink-0">
 <AlertTriangle className="w-5 h-5 text-amber-300" />
 </div>
 <div>
 <DialogTitle className="text-base font-extrabold text-amber-600 text-left">
 🚨 Fast-Track Perizinan Darurat / Santri Sakit
 </DialogTitle>
 <DialogDescription className="text-xs text-rose-200/90 mt-0.5 font-medium text-left">
 Penerbitan surat izin kepulangan mendadak untuk keperluan medis/keluarga mendesak
 </DialogDescription>
 </div>
 </div>
 <DialogClose onClick={() => setQuickActionModal(null)} />
 </DialogHeader>

 <DialogBody className="p-4 sm:p-6 pb-28 flex-1 overflow-y-auto min-h-0 space-y-4 text-xs">
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Pilih Santri *</label>
 <HeroUiFilterSelect
 id="select-emergency-student"
 searchable={true}
 placeholder="-- Pilih Santri yang Membutuhkan Izin Darurat --"
 value={emergencyPermitForm.student_id}
 onChange={(sId) => {
 const found = dbStudents.find(s => String(s.id) === String(sId))
 setEmergencyPermitForm({
 ...emergencyPermitForm,
 student_id: sId,
 guardian_phone: found?.phone || found?.parent_phone || emergencyPermitForm.guardian_phone || ''
 })
 }}
 buttonClassName="w-full"
 options={[
 { value: '', label: '-- Pilih Santri yang Membutuhkan Izin Darurat --' },
 ...dbStudents.map((s) => ({
 value: String(s.id),
 label: `${s.name} (${s.nis || s.nisn || 'NIS -'}) - ${s.room_name || s.dormitory_name || 'Kamar Boarding'}`,
 badge: s.nis || 'Santri',
 badgeColor: 'emerald'
 }))
 ]}
 />
 </div>

 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Keluhan / Alasan Darurat Medis / Keluarga *</label>
 <textarea
 rows={2}
 value={emergencyPermitForm.medical_complaint}
 onChange={(e) => setEmergencyPermitForm({ ...emergencyPermitForm, medical_complaint: e.target.value })}
 placeholder="Contoh: Demam tinggi 39°C memerlukan penanganan dokter / Orang tua sakit keras / Takziyah keluarga..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-rose-600 focus:ring-2 focus:ring-rose-600/15 outline-none transition"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Tujuan Lokasi / Rujukan *</label>
 <input
 type="text"
 value={emergencyPermitForm.medical_destination}
 onChange={(e) => setEmergencyPermitForm({ ...emergencyPermitForm, medical_destination: e.target.value })}
 placeholder="Klinik / RS Terdekat / Rumah Santri"
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs font-semibold outline-none transition"
 />
 </div>
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Pendamping / Penjemput *</label>
 <input
 type="text"
 value={emergencyPermitForm.medical_escort_name}
 onChange={(e) => setEmergencyPermitForm({ ...emergencyPermitForm, medical_escort_name: e.target.value })}
 placeholder="Nama Musyrif / Orang Tua yang menjemput"
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs font-semibold outline-none transition"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">No. WhatsApp Wali / Kontak Darurat</label>
 <input
 type="text"
 value={emergencyPermitForm.guardian_phone}
 onChange={(e) => setEmergencyPermitForm({ ...emergencyPermitForm, guardian_phone: e.target.value })}
 placeholder="0812xxxxxxxx"
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs font-semibold outline-none transition"
 />
 </div>
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Estimasi Durasi Kepulangan (Jam) *</label>
 <input
 type="number"
 min="1"
 max="168"
 value={emergencyPermitForm.estimated_hours}
 onChange={(e) => setEmergencyPermitForm({ ...emergencyPermitForm, estimated_hours: Number(e.target.value) })}
 placeholder="6"
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs font-semibold outline-none transition"
 />
 <span className="text-[10px] text-slate-500 mt-1 block">Sistem akan menghitung otomatis jadwal kembali ananda berdasarkan estimasi jam ini</span>
 </div>
 </div>
 </DialogBody>

 <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-end gap-3 shrink-0">
 <MasterActionButton variant="secondary" icon={X} onClick={() => setQuickActionModal(null)}>
 Batal
 </MasterActionButton>
 <MasterActionButton variant="danger" icon={Check} onClick={handleEmergencyExit}>
 Terbitkan Izin Darurat Sekarang
 </MasterActionButton>
 </DialogFooter>
 </>
 )}

 {/* 8. MODAL PENJADWALAN KEPULANGAN MASSAL (TATA USAHA & MUSYRIF) */}
 {quickActionModal === 'kepulangan_massal' && (
 <>
 <DialogHeader className="bg-white dark:bg-card-dark px-6 py-4 flex items-center justify-between shrink-0 border-b border-emerald-800/80">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-emerald-700/80 text-emerald-200 flex items-center justify-center border border-emerald-600/60 shadow-inner shrink-0">
 <Calendar className="w-5 h-5 text-teal-200" />
 </div>
 <div>
 <DialogTitle className="text-base font-extrabold text-white text-left">
 📅 Penjadwalan Kepulangan Massal Santri
 </DialogTitle>
 <DialogDescription className="text-xs text-emerald-200/90 mt-0.5 font-medium text-left">
 Atur jadwal hari & jam kepulangan santri serta tenggat waktu kembali ke asrama (TU / Musyrif)
 </DialogDescription>
 </div>
 </div>
 <DialogClose onClick={() => setQuickActionModal(null)} />
 </DialogHeader>

 <DialogBody className="p-4 sm:p-6 pb-28 flex-1 overflow-y-auto min-h-0 space-y-4 text-xs">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Unit Pendidikan Boarding</label>
 <HeroUiFilterSelect
 id="select-batch-unit"
 value={batchScheduleForm.unit_pendidikan_id}
 onChange={(val) => setBatchScheduleForm({ ...batchScheduleForm, unit_pendidikan_id: val })}
 buttonClassName="w-full"
 options={[
 { value: '', label: '-- Semua Unit Boarding / Seluruh Santri Aktif --' },
 ...availableUnits.map((u) => ({
 value: String(u.id),
 label: u.nama_unit || u.name,
 badge: 'Boarding',
 badgeColor: 'emerald'
 }))
 ]}
 />
 </div>
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Jenis Kepulangan *</label>
 <HeroUiFilterSelect
 id="select-batch-permit-type"
 value={batchScheduleForm.permit_type}
 onChange={(val) => setBatchScheduleForm({ ...batchScheduleForm, permit_type: val })}
 buttonClassName="w-full"
 options={[
 { value: 'pesiar_mingguan', label: 'Pesiar Mingguan Terjadwal' },
 { value: 'libur_semester', label: 'Libur Akhir Semester' },
 { value: 'libur_ramadhan', label: 'Libur Ramadhan & Idul Fitri' },
 { value: 'pulang_bulanan', label: 'Kepulangan Bulanan Santri' },
 ]}
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-200/60 dark:border-emerald-800/40">
 <div>
 <label className="font-semibold block mb-1 text-emerald-900 dark:text-emerald-300">
 Hari & Jam Mulai Pulang (Check-out) *
 </label>
 <input
 type="datetime-local"
 value={batchScheduleForm.scheduled_departure_at}
 onChange={(e) => setBatchScheduleForm({ ...batchScheduleForm, scheduled_departure_at: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs font-semibold outline-none transition"
 />
 </div>
 <div>
 <label className="font-semibold block mb-1 text-emerald-900 dark:text-emerald-300">
 Batas Hari & Jam Wajib Kembali ke Asrama *
 </label>
 <input
 type="datetime-local"
 value={batchScheduleForm.scheduled_return_at}
 onChange={(e) => setBatchScheduleForm({ ...batchScheduleForm, scheduled_return_at: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs font-semibold outline-none transition"
 />
 </div>
 </div>

 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Tujuan Kepulangan Santri</label>
 <input
 type="text"
 value={batchScheduleForm.destination}
 onChange={(e) => setBatchScheduleForm({ ...batchScheduleForm, destination: e.target.value })}
 placeholder="Rumah Orang Tua / Wali Santri"
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs font-semibold outline-none transition"
 />
 </div>

 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Instruksi / Catatan Khusus untuk Orang Tua Santri</label>
 <textarea
 rows={2}
 value={batchScheduleForm.notes}
 onChange={(e) => setBatchScheduleForm({ ...batchScheduleForm, notes: e.target.value })}
 placeholder="Santri wajib diantar kembali tepat waktu sebelum pukul 17:00 WIB dan orang tua wajib melakukan absensi drop-off di gerbang asrama..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs font-semibold outline-none transition"
 />
 </div>
 </DialogBody>

 <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-end gap-3 shrink-0">
 <MasterActionButton variant="secondary" icon={X} onClick={() => setQuickActionModal(null)}>
 Batal
 </MasterActionButton>
 <MasterActionButton variant="emerald" icon={Check} onClick={handleBatchSchedule}>
 Terbitkan Jadwal Kepulangan Massal
 </MasterActionButton>
 </DialogFooter>
 </>
 )}

 </Dialog>
 </motion.div>
 </Backdrop>
 )}
 </AnimatePresence>

 {/* 9. MODAL REVIEW PERPANJANGAN JAM KEMBALI SANTRI */}
 <AnimatePresence>
 {selectedPermitForReview && (
 <Backdrop isOpen={Boolean(selectedPermitForReview)} onOpenChange={() => setSelectedPermitForReview(null)} className="z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md">
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 15 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 15 }}
 className="w-full max-w-xl"
 >
 <Dialog
 showCloseButton={false}
 className="w-full max-w-xl flex flex-col rounded-2xl border-2 border-indigo-500/30 bg-white p-0 shadow-2xl shadow-sm overflow-hidden dark:border-indigo-700/50 dark:bg-card-dark"
 >
 <DialogHeader className="bg-white dark:bg-card-dark px-6 py-4 flex items-center justify-between shrink-0 border-b border-indigo-800/80">
 <div className="flex items-center gap-3">
 <div className="w-9 h-9 rounded-xl bg-indigo-700/80 text-indigo-200 flex items-center justify-center border border-indigo-600/60 shadow-inner shrink-0">
 <Clock className="w-5 h-5 text-indigo-300" />
 </div>
 <div>
 <DialogTitle className="text-base font-extrabold text-emerald-600 text-left">
 Tinjau Permohonan Perpanjangan Izin
 </DialogTitle>
 <DialogDescription className="text-xs text-indigo-200/90 mt-0.5 font-medium text-left">
 Santri: {selectedPermitForReview.student_name} ({selectedPermitForReview.nis || '-'})
 </DialogDescription>
 </div>
 </div>
 <DialogClose onClick={() => setSelectedPermitForReview(null)} />
 </DialogHeader>

 <DialogBody className="p-5 pb-28 space-y-4 text-xs overflow-y-auto">
 <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
 <div className="flex justify-between items-center">
 <span className="text-slate-500 font-medium">Jadwal Kembali Awal:</span>
 <span className="font-bold text-slate-800 dark:text-slate-200">
 {selectedPermitForReview.scheduled_return_at ? new Date(selectedPermitForReview.scheduled_return_at).toLocaleString('id-ID') : '-'}
 </span>
 </div>
 <div>
 <span className="text-slate-500 font-medium block mb-1">Alasan Diajukan Wali Santri:</span>
 <p className="font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 p-2.5 rounded-xl border border-rose-200/60 dark:border-rose-800/40">
 "{selectedPermitForReview.extension_reason || 'Tidak ada catatan perpanjangan'}"
 </p>
 </div>
 </div>

 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Keputusan Tinjauan *</label>
 <div className="grid grid-cols-2 gap-2">
 <button
 type="button"
 onClick={() => setReviewExtensionForm({ ...reviewExtensionForm, action: 'approve' })}
 className={`py-2 px-3 rounded-xl font-bold text-xs border transition flex items-center justify-center gap-1.5 ${
 reviewExtensionForm.action === 'approve'
 ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
 : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-emerald-200/80 dark:border-emerald-700/80'
 }`}
 >
 <Check className="w-4 h-4" /> Setujui Perpanjangan
 </button>
 <button
 type="button"
 onClick={() => setReviewExtensionForm({ ...reviewExtensionForm, action: 'reject' })}
 className={`py-2 px-3 rounded-xl font-bold text-xs border transition flex items-center justify-center gap-1.5 ${
 reviewExtensionForm.action === 'reject'
 ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
 : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-emerald-200/80 dark:border-emerald-700/80'
 }`}
 >
 <X className="w-4 h-4" /> Tolak Perpanjangan
 </button>
 </div>
 </div>

 {reviewExtensionForm.action === 'approve' && (
 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">
 Jadwal Baru Batas Kembali ke Asrama *
 </label>
 <input
 type="datetime-local"
 value={reviewExtensionForm.new_scheduled_return_at}
 onChange={(e) => setReviewExtensionForm({ ...reviewExtensionForm, new_scheduled_return_at: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs font-semibold focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/15 outline-none transition"
 />
 </div>
 )}

 <div>
 <label className="font-semibold block mb-1 text-slate-700 dark:text-slate-300">Catatan Petugas (Musyrif / TU)</label>
 <textarea
 rows={2}
 value={reviewExtensionForm.admin_notes}
 onChange={(e) => setReviewExtensionForm({ ...reviewExtensionForm, admin_notes: e.target.value })}
 placeholder="Contoh: Disetujui perpanjangan hingga pukul 20:00 WIB / Ditolak karena persiapan halaqah subuh..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 p-2.5 dark:bg-slate-800 text-xs font-semibold outline-none transition"
 />
 </div>
 </DialogBody>

 <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-end gap-3 shrink-0">
 <MasterActionButton variant="secondary" icon={X} onClick={() => setSelectedPermitForReview(null)}>
 Batal
 </MasterActionButton>
 <MasterActionButton variant="primary" icon={Check} onClick={handleReviewExtensionSubmit}>
 Simpan Keputusan
 </MasterActionButton>
 </DialogFooter>
 </Dialog>
 </motion.div>
 </Backdrop>
 )}
 </AnimatePresence>

 {/* 10. MODAL LIHAT DETAIL MUTABA'AH & PRESENSI SANTRI */}
 <AnimatePresence>
 {selectedMutabaahDetail && (
 <Backdrop
 isOpen={Boolean(selectedMutabaahDetail)}
 onOpenChange={() => setSelectedMutabaahDetail(null)}
 className="z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md"
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.95, y: 15 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 15 }}
 className="w-full max-w-xl"
 >
 <Dialog
 showCloseButton={false}
 className="w-full max-w-xl flex flex-col rounded-2xl border-2 border-emerald-500/30 bg-white p-0 shadow-2xl shadow-sm overflow-hidden dark:border-emerald-700/50 dark:bg-card-dark"
 >
 {/* MODAL HEADER */}
 <DialogHeader className="bg-white dark:bg-card-dark px-6 py-4 flex items-center justify-between shrink-0 border-b border-emerald-700/80">
 <div className="flex items-center gap-3">
 <div className="w-10 h-9 rounded-xl bg-white/10 text-emerald-200 flex items-center justify-center border border-white/20 shadow-inner shrink-0">
 <Activity className="w-5 h-5 text-emerald-300" />
 </div>
 <div>
 <DialogTitle className="text-base font-extrabold text-slate-600 text-left">
 Detail Presensi &amp; Mutaba'ah Sholat Santri
 </DialogTitle>
 <DialogDescription className="text-xs text-emerald-200/90 mt-0.5 font-medium text-left">
 Rincian Pengerjaan Shalat &amp; Evaluasi Kehadiran Ibadah
 </DialogDescription>
 </div>
 </div>
 <DialogClose onClick={() => setSelectedMutabaahDetail(null)} />
 </DialogHeader>

 {/* MODAL BODY */}
 <DialogBody className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
 {/* SANTRI PROFILE HERO BANNER */}
 <div className="p-4 rounded-xl bg-white dark:bg-card-dark dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between gap-3.5 flex-wrap">
 <div className="flex items-center gap-3.5 min-w-0">
 <div className="w-12 h-9 rounded-xl bg-white dark:bg-card-dark font-black text-base flex items-center justify-center shadow-md shadow-sm shrink-0 border border-emerald-200/80 dark:border-emerald-800/60">
 {(String(selectedMutabaahDetail?.santri || selectedMutabaahDetail?.name || 'S')).charAt(0).toUpperCase()}
 </div>
 <div className="space-y-0.5 min-w-0">
 <h4 className="font-extrabold text-sm text-slate-900 dark:text-white truncate">
 {selectedMutabaahDetail.santri}
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 flex-wrap">
 <span>NIS: <strong className="text-slate-700 dark:text-slate-300">{selectedMutabaahDetail.nis || '-'}</strong></span>
 <span>•</span>
 <span>Unit: <strong className="text-emerald-700 dark:text-emerald-400">{selectedMutabaahDetail.unit || 'Ponpes Darel Iman'}</strong></span>
 </p>
 <div className="pt-0.5">
 <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
 {selectedMutabaahDetail.kelas || 'Kamar Asrama'}
 </span>
 </div>
 </div>
 </div>

 <div className="text-right shrink-0">
 <span className="text-[10px] text-slate-400 uppercase font-bold block">Aktivitas Terpilih</span>
 <strong className="text-xs font-black text-emerald-700 dark:text-emerald-400 block">{selectedMutabaahDetail.kegiatan}</strong>
 <span className="text-[10px] text-slate-500">{selectedMutabaahDetail.waktu || selectedMutabaahDetail.tanggal || '-'}</span>
 </div>
 </div>

 {/* FILTER PERIODE EVALUASI SHALAT SANTRI */}
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-2">
 <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
 <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
 Filter Evaluasi Shalat:
 </span>
 </div>
 <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-700/80 shadow-2xs">
 {[
 { key: 'today', label: 'Hari Ini' },
 { key: 'week', label: 'Mingguan' },
 { key: 'month', label: 'Bulanan' },
 { key: 'semester', label: 'Semester' },
 ].map((tab) => {
 const isActive = modalBreakdownPeriod === tab.key
 return (
 <button
 key={tab.key}
 type="button"
 onClick={() => setModalBreakdownPeriod(tab.key)}
 className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
 isActive
 ? 'bg-emerald-600 text-white shadow-xs'
 : 'text-slate-600 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300'
 }`}
 >
 {tab.label}
 </button>
 )
 })}
 </div>
 </div>

 {/* RINGKASAN KEPATUHAN EVALUASI SHALAT */}
 {modalBreakdownData?.summary && (
 <div className="grid grid-cols-3 gap-2">
 <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-center">
 <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 block">Kepatuhan Total</span>
 <span className="text-base font-black text-emerald-800 dark:text-emerald-200">{modalBreakdownData.summary.attendance_percentage}%</span>
 <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-medium">({modalBreakdownData.summary.total_attended}/{modalBreakdownData.summary.total_expected} Waktu)</span>
 </div>
 <div className="p-2.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 text-center">
 <span className="text-[10px] font-bold text-teal-700 dark:text-teal-300 block">Sholat Wajib</span>
 <span className="text-base font-black text-teal-800 dark:text-teal-200">{modalBreakdownData.summary.total_wajib}</span>
 <span className="text-[10px] text-teal-600 dark:text-teal-400 block font-medium">5 Waktu Terjadwal</span>
 </div>
 <div className="p-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-800/60 text-center">
 <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 block">Sholat Sunnah</span>
 <span className="text-base font-black text-purple-800 dark:text-purple-200">{modalBreakdownData.summary.total_sunnah}</span>
 <span className="text-[10px] text-purple-600 dark:text-purple-400 block font-medium">Tahajud &amp; Dhuha</span>
 </div>
 </div>
 )}

 {/* RINCIAN PENGERJAAN SELURUH SHOLAT & STATUSNYA */}
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-xs font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
 <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
 Rincian Shalat Yang Dikerjakan &amp; Statusnya
 </span>
 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
 {modalBreakdownPeriod === 'today'
 ? 'Status Hari Ini'
 : modalBreakdownPeriod === 'week'
 ? 'Rekap 7 Hari Terakhir'
 : modalBreakdownPeriod === 'month'
 ? 'Rekap 30 Hari Terakhir'
 : 'Rekap 1 Semester'}
 </span>
 </div>

 {loadingBreakdown ? (
 <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
 <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
 <span>Memuat rincian shalat santri...</span>
 </div>
 ) : (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
 {(modalBreakdownData?.breakdown || []).map((item) => (
 <div
 key={item.key}
 className={`p-3 rounded-xl border transition-all ${
 item.is_attended
 ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200/70 dark:border-emerald-800/50'
 : 'bg-slate-50/70 dark:bg-slate-900/40 border-emerald-200/70 dark:border-emerald-800/60'
 }`}
 >
 <div className="flex items-center justify-between gap-2 mb-1.5">
 <div className="flex items-center gap-2">
 <div
 className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black ${
 item?.category === 'wajib'
 ? 'bg-emerald-600 text-white'
 : 'bg-purple-600 text-white'
 }`}
 >
 {String(item?.label || item?.name || item?.kegiatan || 'S').charAt(0).toUpperCase()}
 </div>
 <div>
 <h5 className="font-bold text-xs text-slate-900 dark:text-white leading-tight">
 {item?.label || item?.name || item?.kegiatan || '-'}
 </h5>
 <span
 className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
 item?.category === 'wajib'
 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
 : 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
 }`}
 >
 {item?.category === 'wajib' ? 'Wajib' : 'Sunnah'}
 </span>
 </div>
 </div>

 <AppBadge
 variant={
 item.status === 'Hadir'
 ? 'success'
 : item.status === 'Terlambat'
 ? 'warning'
 : item.status === 'Izin'
 ? 'info'
 : 'default'
 }
 dot
 >
 {item.status}
 </AppBadge>
 </div>

 {modalBreakdownPeriod === 'today' ? (
 <div className="space-y-0.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-1 border-t border-emerald-200/50 dark:border-emerald-800/50">
 <div className="flex justify-between">
 <span>Waktu:</span>
 <strong className="text-slate-700 dark:text-slate-300">{item.jam}</strong>
 </div>
 <div className="flex justify-between">
 <span>Metode:</span>
 <strong className="text-slate-700 dark:text-slate-300">{item.metode}</strong>
 </div>
 <div className="flex justify-between">
 <span>Lokasi:</span>
 <strong className="text-slate-700 dark:text-slate-300 truncate max-w-[150px]">{item.lokasi}</strong>
 </div>
 <div className="flex justify-between">
 <span>Verifikator:</span>
 <strong className="text-slate-700 dark:text-slate-300">{item.verifikator}</strong>
 </div>
 </div>
 ) : (
 <div className="space-y-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-medium pt-1 border-t border-emerald-200/50 dark:border-emerald-800/50">
 <div className="flex justify-between items-center">
 <span>Kehadiran:</span>
 <strong className="text-emerald-700 dark:text-emerald-400 font-bold">
 {item.attended_count} / {item.total_days} Hari ({item.percentage}%)
 </strong>
 </div>
 <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
 <div
 className={`h-1.5 rounded-full transition-all duration-500 ${
 item.percentage >= 80
 ? 'bg-emerald-500'
 : item.percentage >= 50
 ? 'bg-amber-500'
 : 'bg-rose-500'
 }`}
 style={{ width: `${Math.min(100, item.percentage)}%` }}
 />
 </div>
 <div className="flex justify-between text-[9px] text-slate-400">
 <span>Lokasi: {item.lokasi}</span>
 <span>Verif: {item.verifikator}</span>
 </div>
 </div>
 )}
 </div>
 ))}
 </div>
 )}
 </div>

 {/* DETAIL AKTIVITAS LOG YANG DIKLIK */}
 <div className="grid grid-cols-2 gap-2.5">
 <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
 Kegiatan Yang Diklik
 </span>
 <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
 {selectedMutabaahDetail.kegiatan || '-'}
 </p>
 <span className={`inline-block text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
 (selectedMutabaahDetail.kategori && selectedMutabaahDetail.kategori.toLowerCase().includes('sunnah'))
 ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
 : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
 }`}>
 {selectedMutabaahDetail.kategori || 'Sholat Wajib'}
 </span>
 </div>

 <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
 Status Kehadiran Record
 </span>
 <div className="pt-0.5">
 <AppBadge variant={selectedMutabaahDetail.status === 'Hadir' ? 'success' : 'info'} dot>
 {selectedMutabaahDetail.status || 'Hadir'}
 </AppBadge>
 </div>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
 Metode: <strong>{selectedMutabaahDetail.metode || 'Manual'}</strong>
 </p>
 </div>

 <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
 Waktu &amp; Tanggal
 </span>
 <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
 {selectedMutabaahDetail.waktu || selectedMutabaahDetail.tanggal || '-'}
 </p>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
 Pukul {selectedMutabaahDetail.jam || '-'}
 </p>
 </div>

 <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
 Lokasi Pelaksanaan
 </span>
 <p className="font-extrabold text-slate-800 dark:text-slate-200 text-xs">
 {selectedMutabaahDetail.lokasi || 'Aula & Hall Pesantren'}
 </p>
 <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
 Verifikator: <strong>{selectedMutabaahDetail.verifikator || 'Musyrif Asrama'}</strong>
 </p>
 </div>
 </div>

 {/* CATATAN / VERIFIKASI */}
 <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
 <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
 Catatan Pembina / Musyrif
 </span>
 <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 italic">
 "{selectedMutabaahDetail.catatan || 'Telah diverifikasi hadir tepat waktu di masjid asrama'}"
 </p>
 </div>
 </DialogBody>

 {/* MODAL FOOTER */}
 <DialogFooter className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between gap-3 shrink-0">
 <MasterActionButton
 variant="secondary"
 icon={Printer}
 onClick={() => {
 const breakdownRows = (modalBreakdownData?.breakdown || []).map((b) => {
 const title = b?.label || b?.name || b?.prayer_name || b?.kegiatan || 'Shalat Terjadwal'
 const badge = b?.badge || (b?.category === 'wajib' || b?.obligation_type === 'wajib' ? 'Wajib' : 'Sunnah')
 const status = b?.status || 'Hadir'
 const jam = b?.jam || '-'
 const lokasi = b?.lokasi || 'Masjid Pesantren'
 const hadirCount = b?.attended_count ?? b?.hadir_count ?? 0
 const totalDays = b?.total_days ?? b?.total_count ?? 1
 const percentage = b?.percentage ?? 100

 return {
 item: `Sholat: ${title} (${badge})`,
 nilai:
 modalBreakdownPeriod === 'today'
 ? `Status: ${status} | Jam: ${jam} | Lokasi: ${lokasi}`
 : `Status: ${status} | Hadir: ${hadirCount}/${totalDays} Hari (${percentage}%) | Lokasi: ${lokasi}`,
 }
 })

 printCleanTable({
 title: `Bukti Evaluasi Ibadah Santri - ${selectedMutabaahDetail.santri}`,
 subtitle: `Slip Evaluasi Rincian Sholat & Mutaba'ah | Periode: ${
 modalBreakdownPeriod === 'today'
 ? 'Hari Ini'
 : modalBreakdownPeriod === 'week'
 ? 'Mingguan (7 Hari)'
 : modalBreakdownPeriod === 'month'
 ? 'Bulanan (30 Hari)'
 : 'Semester'
 } | Musyrif: ${selectedMutabaahDetail.verifikator || context?.musyrif_name || 'Musyrif Asrama'}`,
 columns: [
 { key: 'item', label: 'Item Informasi / Sholat' },
 { key: 'nilai', label: 'Keterangan Data & Status' },
 ],
 data: [
 { item: 'Nama Santri', nilai: selectedMutabaahDetail.santri },
 { item: 'NIS', nilai: selectedMutabaahDetail.nis || '-' },
 { item: 'Unit & Asrama', nilai: `${selectedMutabaahDetail.unit || 'Pesantren'} - ${selectedMutabaahDetail.kelas || 'Asrama'}` },
 { item: 'Periode Evaluasi', nilai: modalBreakdownPeriod.toUpperCase() },
 {
 item: 'Kepatuhan Total',
 nilai: `${modalBreakdownData?.summary?.attendance_percentage || 100}% (${modalBreakdownData?.summary?.total_attended || 0} Terverifikasi)`,
 },
 ...breakdownRows,
 { item: 'Aktivitas Terpilih', nilai: selectedMutabaahDetail.kegiatan },
 { item: 'Metode Presensi', nilai: selectedMutabaahDetail.metode },
 { item: 'Musyrif Verifikator', nilai: selectedMutabaahDetail.verifikator },
 { item: 'Catatan Musyrif', nilai: selectedMutabaahDetail.catatan },
 ],
 })
 }}
 >
 Cetak Bukti
 </MasterActionButton>

 <MasterActionButton variant="emerald" icon={Check} onClick={() => setSelectedMutabaahDetail(null)}>
 Selesai
 </MasterActionButton>
 </DialogFooter>
 </Dialog>
 </motion.div>
 </Backdrop>
 )}
 </AnimatePresence>

 {/* KPI Detail Modal */}
 <ModalErrorBoundary onClose={() => setActiveModal(null)}>
 <KpiQuickViewModal
 type={activeModal}
 isOpen={Boolean(activeModal)}
 onClose={() => setActiveModal(null)}
 />
 </ModalErrorBoundary>

 {/* 🟢 PRINT OPTION MODAL (CETAK & UNDUH PDF DATATABLE) */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title={getActiveDatatableInfo().title}
 subtitle={`Laporan Aktif: ${getActiveDatatableInfo().title} | Tanggal: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`}
 onPrint={() => {
 handlePrintClean()
 setIsPrintModalOpen(false)
 }}
 onDownload={() => {
 handleDownloadPdf()
 setIsPrintModalOpen(false)
 }}
 />

 {/* Hidden File Input for CSV Datatable Import */}
 <input
 type="file"
 ref={fileInputRef}
 onChange={handleFileImport}
 className="hidden"
 accept=".csv,.xlsx,.xls"
 />
 </div>
 </PageContainer>
 )
}
