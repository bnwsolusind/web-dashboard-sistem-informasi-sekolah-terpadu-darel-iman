import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  motion
} from 'framer-motion'
import {
  useSearchParams
} from 'react-router-dom'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppTabs from '../components/app/AppTabs'
import PortalGateLockBanner from '../components/portal/PortalGateLockBanner'
import {
  AlertCircle,
  Award,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  FileCheck2,
  FileText,
  HeartHandshake,
  Home,
  Info,
  Languages,
  Loader2,
  Megaphone,
  MessageCircle,
  Moon,
  Receipt,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Sun,
  TrendingUp,
  UserCheck,
  UserRound,
  Users
} from 'lucide-react'

import {
  familyPortalService
} from '../services/familyPortalService'
import api from '../services/api'
import { KpiStatCard } from '../components/app'
import StudentProfileWorkspace from '../components/portal/StudentProfileWorkspace'
import SchoolInformationWorkspace from '../components/portal/SchoolInformationWorkspace'
import ClassScheduleWorkspace from '../components/portal/ClassScheduleWorkspace'
import MaterialsWorkspace from '../components/portal/MaterialsWorkspace'
import AssignmentsWorkspace from '../components/portal/AssignmentsWorkspace'
import TahfizhWorkspace from '../components/portal/TahfizhWorkspace'
import BahasaWorkspace from '../components/portal/BahasaWorkspace'
import GradesWorkspace from '../components/portal/GradesWorkspace'
import TeacherCommentsWorkspace from '../components/portal/TeacherCommentsWorkspace'
import DisciplineSummaryWorkspace from '../components/portal/DisciplineSummaryWorkspace'
import MutabaahWorkspace from '../components/portal/MutabaahWorkspace'
import AttendanceWorkspace from '../components/portal/AttendanceWorkspace'
import ExamGridsWorkspace from '../components/portal/ExamGridsWorkspace'
import CbtExamsWorkspace from '../components/portal/CbtExamsWorkspace'
import ExamResultsWorkspace from '../components/portal/ExamResultsWorkspace'
import ParentBillsWorkspace from '../components/portal/ParentBillsWorkspace'
import ChatGuruWorkspace from '../components/portal/ChatGuruWorkspace'
import AcademicCalendarModal from '../components/calendar/AcademicCalendarModal'

// HeroUI Core Components
import {
  Avatar,
  AvatarFallback
} from '@/components/ui/avatar'
import {
  Badge
} from '@/components/ui/badge'
import {
  Button
} from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'


const menu = [
 ['ringkasan', 'Dashboard', Sparkles, 'bg-sky-100/90 text-sky-600 border-emerald-200/80 hover:bg-sky-200'],
 ['profile', 'Profil & Biodata', UserRound, 'bg-blue-100/90 text-blue-600 border-emerald-200/80 hover:bg-blue-200'],
 ['calendar', 'Kalender Akademik', CalendarDays, 'bg-cyan-100/90 text-cyan-600 border-emerald-200/80 hover:bg-cyan-200'],
 ['announcements', 'Informasi Sekolah', Megaphone, 'bg-indigo-100/90 text-indigo-600 border-emerald-200/80 hover:bg-indigo-200'],
 ['schedules', 'Jadwal', CalendarDays, 'bg-violet-100/90 text-violet-600 border-emerald-200/80 hover:bg-violet-200'],
 ['materials', 'Materi', BookOpen, 'bg-purple-100/90 text-purple-600 border-emerald-200/80 hover:bg-purple-200'],
 ['assignments', 'Tugas', ClipboardList, 'bg-fuchsia-100/90 text-fuchsia-600 border-emerald-200/80 hover:bg-fuchsia-200'],
 ['tahfizh', 'Tahfizh', BookOpenCheck, 'bg-emerald-100/90 text-emerald-600 border-emerald-200/90 hover:bg-emerald-200'],
 ['bahasa', 'Pembiasaan Bahasa', Languages, 'bg-teal-100/90 text-teal-700 border-emerald-200/80 hover:bg-teal-200'],
 ['grades', 'Nilai', Award, 'bg-teal-100/90 text-teal-600 border-emerald-200/80 hover:bg-teal-200'],
 ['student-notes', 'Buku Penghubung', BookOpenCheck, 'bg-cyan-100/90 text-cyan-600 border-emerald-200/80 hover:bg-cyan-200'],
 ['discipline', 'Tata Tertib & Poin', ShieldAlert, 'bg-rose-100/90 text-rose-600 border-emerald-200/80 hover:bg-rose-200'],
 ['bills', 'Tagihan & SPP', Receipt, 'bg-emerald-100/90 text-emerald-600 border-emerald-200/90 hover:bg-emerald-200'],
 ['mutabaah', 'Mutabaah', HeartHandshake, 'bg-amber-100/90 text-amber-600 border-emerald-200/80 hover:bg-amber-200'],
 ['attendance', 'Absensi', CalendarCheck, 'bg-orange-100/90 text-orange-600 border-emerald-200/90 hover:bg-orange-200'],
 ['kisi', 'Kisi-kisi', FileText, 'bg-yellow-100/90 text-yellow-700 border-emerald-200/80 hover:bg-yellow-200'],
 ['ujian', 'Ujian CBT', FileCheck2, 'bg-lime-100/90 text-lime-700 border-emerald-200/80 hover:bg-lime-200'],
 ['hasil', 'Hasil & Rapor', Award, 'bg-rose-100/90 text-rose-600 border-emerald-200/80 hover:bg-rose-200'],
 ['chat', 'Chat Guru / Musyrif', MessageCircle, 'bg-pink-100/90 text-pink-600 border-emerald-200/80 hover:bg-pink-200'],
]

const unwrap = (response) => {
 if (Array.isArray(response?.data?.data?.data)) return response.data.data.data
 if (Array.isArray(response?.data?.data)) return response.data.data
 if (Array.isArray(response?.data?.all_schedules)) return response.data.all_schedules
 if (Array.isArray(response?.data?.weekly_schedules)) return response.data.weekly_schedules
 if (Array.isArray(response?.data?.today_schedules)) return response.data.today_schedules
 if (Array.isArray(response?.data)) return response.data
 if (Array.isArray(response?.all_schedules)) return response.all_schedules
 if (Array.isArray(response?.weekly_schedules)) return response.weekly_schedules
 if (Array.isArray(response?.today_schedules)) return response.today_schedules
 if (Array.isArray(response)) return response
 return []
}

export default function ParentPortalPage() {
 const [searchParams, setSearchParams] = useSearchParams()
 const requestedTab = searchParams.get('tab')
 const requestedChild = searchParams.get('child') || ''

 const [children, setChildren] = useState([])
 const [childId, setChildId] = useState('')
 const [viewAllChildren, setViewAllChildren] = useState(false)
 const [dashboard, setDashboard] = useState(null)
 const [todayTimeline, setTodayTimeline] = useState({ activities: [], loading: false, error: null })
 const [todaySchedulesData, setTodaySchedulesData] = useState({ items: [], dateFormatted: '', loading: false, error: null })
 const [active, setActive] = useState(() => (menu.some(([id]) => id === requestedTab) ? requestedTab : 'ringkasan'))

 const [records, setRecords] = useState([])
 const [billsMeta, setBillsMeta] = useState(null)
 const [childGate, setChildGate] = useState(null)
 const [tahfizhAchievement, setTahfizhAchievement] = useState(null)
 const [permissionsRecords, setPermissionsRecords] = useState([])
 const [examGridsRecords, setExamGridsRecords] = useState([])
 const [resultsData, setResultsData] = useState(null)
 const [cbtOverview, setCbtOverview] = useState(null)
 const [reportsRecords, setReportsRecords] = useState([])

 const [loading, setLoading] = useState(true)
 const [error, setError] = useState('')
 const [ringkasanSubTab, setRingkasanSubTab] = useState('mutabaah')
 const [monitoringPeriod, setMonitoringPeriod] = useState('harian')
 const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)

 // Multi-Child List Fetching & Merging
 useEffect(() => {
 familyPortalService
 .children()
 .then((r) => {
 const apiChildren = r.data || []
 if (apiChildren.length > 0) {
 setChildren(apiChildren)
 const persisted = apiChildren.find((c) => String(c.id) === String(requestedChild))
 setChildId(persisted?.id || apiChildren[0]?.id || '')
 } else {
 setChildren([])
 setChildId('')
 setLoading(false)
 }
 })
 .catch(() => {
 setChildren([])
 setChildId('')
 setLoading(false)
 })
 }, [requestedChild])

 const selectChild = (id) => {
 setViewAllChildren(false)
 setChildId(id)
 setRecords([])
 setDashboard(null)
 setTodayTimeline({ activities: [], loading: true, error: null })
 setTodaySchedulesData({ items: [], dateFormatted: '', loading: true, error: null })
 setResultsData(null)
 setCbtOverview(null)
 setExamGridsRecords([])
 setReportsRecords([])
 setPermissionsRecords([])
 setTahfizhAchievement(null)
 setSearchParams(
 (params) => {
 const next = new URLSearchParams(params)
 next.set('child', id)
 return next
 },
 { replace: true }
 )
 }

 const load = useCallback(async () => {
 if (!childId || viewAllChildren) {
 setLoading(false)
 return
 }
 setLoading(true)
 setError('')
 try {
 if (active === 'ringkasan') {
 const todayStr = new Intl.DateTimeFormat('en-CA').format(new Date())
 setTodayTimeline((prev) => ({ ...prev, loading: true, error: null }))
 setTodaySchedulesData((prev) => ({ ...prev, loading: true, error: null }))
 const [res, tlRes, schRes] = await Promise.allSettled([
 familyPortalService.dashboard(childId),
 api.get('/portal/today-live-timeline', { headers: { 'X-Child-Id': childId }, params: { date: todayStr } }),
 api.get('/portal/schedules', { headers: { 'X-Child-Id': childId }, params: { date: todayStr } }),
 ])
 const dashPayload = res.status === 'fulfilled' ? (res.value?.data || res.value || null) : null
 setDashboard(dashPayload)

 if (tlRes.status === 'fulfilled') {
 const tlData = tlRes.value?.data?.data || {}
 setTodayTimeline({
 activities: Array.isArray(tlData.activities) ? tlData.activities : [],
 loading: false,
 error: null,
 })
 } else {
 const errStatus = tlRes.reason?.response?.status
 setTodayTimeline({
 activities: [],
 loading: false,
 error: errStatus === 403 ? 'Terkunci oleh status pembayaran SPP.' : 'Gagal memuat aktivitas hari ini.',
 })
 }

 if (schRes.status === 'fulfilled') {
 const schData = schRes.value?.data?.data || {}
 const schList = Array.isArray(schData.today_schedules)
 ? schData.today_schedules
 : (Array.isArray(dashPayload?.schedules_today) ? dashPayload.schedules_today : [])
 setTodaySchedulesData({
 items: schList,
 dateFormatted: schData.selected_date_formatted || new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
 loading: false,
 error: null,
 })
 } else {
 const errStatus = schRes.reason?.response?.status
 const fallbackDashSched = Array.isArray(dashPayload?.schedules_today) ? dashPayload.schedules_today : []
 setTodaySchedulesData({
 items: errStatus === 403 ? [] : fallbackDashSched,
 dateFormatted: new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date()),
 loading: false,
 error: errStatus === 403 ? 'Terkunci oleh status pembayaran SPP.' : (fallbackDashSched.length === 0 ? 'Gagal memuat jadwal hari ini.' : null),
 })
 }
 setRecords([])
 } else if (active === 'profile') {
 const [profileResponse, dashboardResponse] = await Promise.all([
 familyPortalService.list('profile', childId).catch(() => ({ data: {} })),
 familyPortalService.dashboard(childId).catch(() => ({ data: null })),
 ])
 setRecords(profileResponse?.data || {})
 setDashboard(dashboardResponse?.data || dashboardResponse || null)
 } else if (active === 'chat') {
 setRecords([])
 } else if (active === 'attendance') {
 setRecords([])
 const [attRes, permRes] = await Promise.all([
 familyPortalService.list('attendance', childId).catch(() => ({ data: [] })),
 api.get('/portal/permissions', { headers: { 'X-Child-Id': childId } }).catch(() => ({ data: { data: [] } })),
 ])
 setRecords(unwrap(attRes))
 setPermissionsRecords(permRes.data?.data?.data ?? permRes.data?.data ?? [])
 } else if (active === 'kisi') {
 setRecords([])
 const r = await api.get('/portal/exam-grids', { headers: { 'X-Child-Id': childId } }).catch(() => ({ data: [] }))
 setExamGridsRecords(r.data?.data?.data ?? r.data?.data ?? [])
 } else if (active === 'ujian') {
 setRecords([])
 const r = await api.get('/portal/lms/exams', { headers: { 'X-Child-Id': childId } }).catch(() => ({ data: null }))
 setCbtOverview(r.data?.data ?? null)
 } else if (active === 'hasil') {
 setRecords([])
 const [resRes, repRes] = await Promise.all([
 api.get('/portal/results', { headers: { 'X-Child-Id': childId } }).catch(() => ({ data: null })),
 api.get('/portal/reports', { headers: { 'X-Child-Id': childId } }).catch(() => ({ data: [] })),
 ])
 setResultsData(resRes.data?.data ?? null)
 setReportsRecords(repRes.data?.data ?? [])
 } else if (active === 'grades') {
 setRecords([])
 const res = await familyPortalService.list('grades', childId).catch(() => ({ data: null }))
 setRecords(res?.data || null)
 } else if (active === 'tahfizh') {
 const [logsResponse, achievementResponse, dashboardResponse] = await Promise.all([
 familyPortalService.list('tahfizh', childId).catch(() => ({ data: [] })),
 api.get(`/portal/children/${childId}/tahfizh-achievement`).catch(() => ({ data: { data: null } })),
 familyPortalService.dashboard(childId).catch(() => ({ data: null })),
 ])
 setRecords(unwrap(logsResponse))
 setTahfizhAchievement(achievementResponse.data?.data || null)
 const dData = dashboardResponse?.data || dashboardResponse || null
 if (dData) {
 setDashboard(dData)
 } else if (logsResponse?.tahfizh_target) {
 setDashboard((prev) => ({ ...(prev || {}), tahfizh_target: logsResponse.tahfizh_target }))
 }
 } else if (active === 'mutabaah') {
 const res = await api.get(`/parent/mutabaah/${childId}`)
 setRecords(res.data?.data || null)
 } else if (active === 'bills') {
 setRecords([])
 try {
 const res = await api.get('/portal/bills', { headers: { 'X-Child-Id': childId } })
 const data = res.data || {}
 const list = data?.data?.data ?? data?.data ?? []
 setRecords(Array.isArray(list) ? list : [])
 setBillsMeta({
 sipdeiStatus: data?.sipdei_status || (Array.isArray(list) && list.length > 0 ? 'OK' : 'NO_BILLS'),
 message: data?.message || '',
 studentContext: data?.student_context || null,
 sipdeiMeta: data?.sipdei_meta || null,
 })
 if (data?.portal_gate) setChildGate(data.portal_gate)
 } catch (err) {
 const errData = err?.response?.data || {}
 setRecords([])
 setBillsMeta({
 sipdeiStatus: errData?.sipdei_status || 'SERVICE_UNAVAILABLE',
 message: errData?.message || 'Layanan SIPDEI sedang terganggu atau tidak dapat dijangkau.',
 studentContext: errData?.student_context || null,
 sipdeiMeta: errData?.sipdei_meta || null,
 })
 if (errData?.portal_gate) setChildGate(errData.portal_gate)
 }
 } else if (active === 'schedules') {
 setRecords([])
 try {
 const res = await api.get('/portal/schedules', { headers: { 'X-Child-Id': childId } })
 setRecords(res.data?.data ?? res.data ?? [])
 setChildGate(null)
 } catch (err) {
 if (err?.response?.data?.gate_blocked) setChildGate({ allowed: false, ...err.response.data })
 setRecords([])
 }
 } else if (active === 'calendar') {
 setRecords([])
 const res = await api.get('/portal/academic-calendar', { params: childId ? { child_id: childId } : {} }).catch(() => ({ data: { data: [] } }))
 setRecords(unwrap(res))
 } else if (active === 'bahasa') {
 // BahasaWorkspace memuat /vocabulary/submissions dan /vocabulary/banks secara mandiri
 setRecords([])
 } else {
 setRecords([])
 const res = await familyPortalService.list(active, childId).catch(() => ({ data: [] }))
 setRecords(unwrap(res))
 if (res?.tahfizh_target) {
 setDashboard((prev) => ({ ...(prev || {}), tahfizh_target: res.tahfizh_target }))
 }
 }
 } catch (e) {
 setError(e.response?.data?.message || 'Data portal belum berhasil dimuat dari server.')
 } finally {
 setLoading(false)
 }
 }, [active, childId, viewAllChildren])

  useEffect(() => {
    if (!childId) {
      setChildGate(null)
      return
    }
    let mounted = true
    setChildGate(null)
    api.get('/portal/access-status', { headers: { 'X-Child-Id': childId } })
      .then((res) => {
        if (mounted && res.data?.data) setChildGate(res.data.data)
      })
      .catch(() => {})
    return () => { mounted = false }
  }, [childId])

  useEffect(() => {
    load()
  }, [load])

 useEffect(() => {
 if (requestedTab && menu.some(([id]) => id === requestedTab)) setActive(requestedTab)
 }, [requestedTab])

 const selectTab = (id) => {
 setActive(id)
 setSearchParams(
 (params) => {
 const next = new URLSearchParams(params)
 next.set('tab', id)
 if (childId) next.set('child', childId)
 return next
 },
 { replace: true }
 )
 }

 const handlePhotoUpdated = (newPhotoUrl, updatedChildId) => {
 setChildren((prev) =>
 prev.map((c) =>
 String(c.id) === String(updatedChildId)
 ? { ...c, photo: newPhotoUrl, photo_url: newPhotoUrl, avatar_url: newPhotoUrl }
 : c
 )
 )
 setRecords((prev) =>
 typeof prev === 'object' && prev
 ? { ...prev, photo: newPhotoUrl, photo_url: newPhotoUrl, avatar_url: newPhotoUrl }
 : prev
 )
 }

 const activeChild = useMemo(() => {
 return children.find((c) => String(c.id) === String(childId)) || children[0] || null
 }, [children, childId])

 const childUnitName = useMemo(() => {
 return (
 activeChild?.unit_name ||
 activeChild?.education_unit?.name ||
 activeChild?.educationUnit?.name ||
 activeChild?.kelas?.unit_pendidikan?.name ||
 activeChild?.kelas?.unitPendidikan?.name ||
 ''
 )
 }, [activeChild])

 useEffect(() => {
 if (childUnitName) {
 try {
 localStorage.setItem('portal_active_child_unit', childUnitName)
 } catch {}
 }
 }, [childUnitName])

 const isChildSD = useMemo(() => {
 if (!activeChild) return false
 const unitName = (childUnitName || "").toLowerCase()
 const jenjang = (activeChild.jenjang || activeChild.kelas?.jenjang || activeChild.education_unit?.level || "").toLowerCase()
 return jenjang.includes("sd") || jenjang.includes("mi") || jenjang.includes("tk") || jenjang.includes("paud") || unitName.includes("sd") || unitName.includes("mi") || unitName.includes("tk") || unitName.includes("paud") || unitName.includes("sekolah dasar") || unitName.includes("ibtidaiyah")
 }, [activeChild, childUnitName])

 const handleAssignmentSubmit = async (assignmentId, payload) => {
 const formData = new FormData()
 if (payload.jawaban_teks) formData.append("jawaban_teks", payload.jawaban_teks)
 if (payload.file_lampiran) formData.append("file_lampiran", payload.file_lampiran)
 if (childId) formData.append("child_id", childId)

 await api.post("/portal/assignments/" + assignmentId + "/submit", formData, {
 headers: { "X-Child-Id": childId },
 })
 await load()
 }

 const activeChildAnnouncements = useMemo(() => {
 const raw = dashboard?.announcements || []
 return raw.filter((a) => {
 const unit = a.data_tambahan?.unit_name || a.education_unit || a.unit_name || a.unit || ''
 if (!unit || unit.includes('Seluruh') || unit.includes('Semua') || unit.toLowerCase() === 'yayasan') return true
 const activeUnit = childUnitName || ''
 if (activeUnit && (unit.toLowerCase().includes(activeUnit.toLowerCase()) || activeUnit.toLowerCase().includes(unit.toLowerCase()))) return true
 const activeCode = activeChild?.unit_code || activeChild?.education_unit?.code || ''
 if (activeCode && unit.toLowerCase().includes(activeCode.toLowerCase())) return true
 return false
 })
 }, [dashboard?.announcements, childUnitName, activeChild?.unit_code, activeChild?.education_unit?.code])

 const handleSubmitPermissionFromWorkspace = async (payload) => {
 await familyPortalService.submitPermission({ ...payload, child_id: childId })
 load()
 }

 const handleSaveMutabaahFromWorkspace = async (homeItemsPayload) => {
 const todayDate =
 records?.today?.date ||
 records?.today?.record_date ||
 new Intl.DateTimeFormat('en-CA').format(new Date())
 if (Array.isArray(homeItemsPayload) && homeItemsPayload.length > 0) {
 await api.post(`/portal/children/${childId}/worship-input`, {
 date: todayDate,
 items: homeItemsPayload,
 })
 }
 load()
 }

 return (
 <div className="portal-page min-w-0 space-y-6 pb-12 text-slate-800 dark:text-slate-100">
 {/* BREADCRUMB NAV */}
 <AppBreadcrumb
 items={[
 { label: 'Dashboard', href: '/dashboard' },
 { label: 'Portal Orang Tua' },
 ]}
 />

 {/* MODERN HERO CARD HEADER */}
 <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">

 <div className="relative z-10 flex flex-col gap-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
                <HeartHandshake className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
                    <Sparkles className="size-3 animate-pulse text-white" />
                    Portal Wali Murid Terpadu
                  </span>
                  {activeChild && (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                      Anak Aktif: {activeChild.full_name}{activeChild.unit_name ? ` (${activeChild.unit_name})` : ''}
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Portal Orang Tua / Wali Murid
                </h1>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCalendarModalOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/95 px-3.5 py-2.5 text-xs font-black text-cyan-900 shadow-sm transition hover:bg-cyan-50 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-cyan-200 cursor-pointer"
              >
                <CalendarDays className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <span>Kalender Akademik</span>
                {activeChild?.unit_name ? (
                  <span className="rounded-md bg-cyan-100 px-1.5 py-0.5 text-[10px] text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 font-extrabold">
                    {activeChild.unit_name}
                  </span>
                ) : null}
              </button>
            </div>
          </div>

          {/* Row 2: Deskripsi Full Width */}
          <div className="w-full pt-2 border-t border-emerald-500/20 dark:border-emerald-500/30">
            <p className="w-full text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
              Pantau perkembangan nilai akademik, progres tahfizh Al-Qur'an, mutabaah harian, presensi, jadwal, serta pengumuman sekolah terpadu.
            </p>
          </div>
        </div>
 </div>
 </motion.div>

 {/* ───────────────────────────────────────────────────────────────────────────── */}
 {/* 1. CARDS PILIHAN ANAK LINTAS UNIT (DI ATAS AKSI CEPAT & UKURAN COMPACT) */}
 {/* ───────────────────────────────────────────────────────────────────────────── */}
 <section className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433] p-5">
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3 dark:border-emerald-800/60">
 <div className="flex items-center gap-2">
 <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
 Pilih Anak ({children.length} Anak Lintas Unit)
 </h2>
 </div>

 {/* Toggle Pilih Anak vs Ringkasan Semua */}
 <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 p-1 dark:bg-emerald-950/40">
 <button
 type="button"
 onClick={() => setViewAllChildren(false)}
 className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
 !viewAllChildren
 ? 'bg-emerald-700 text-white shadow-xs dark:bg-emerald-600'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
 }`}
 >
 <UserCheck className="h-3.5 w-3.5" />
 <span>Pilih Anak</span>
 </button>
 <button
 type="button"
 onClick={() => setViewAllChildren(true)}
 className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
 viewAllChildren
 ? 'bg-emerald-700 text-white shadow-xs dark:bg-emerald-600'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
 }`}
 >
 <Users className="h-3.5 w-3.5" />
 <span>Ringkasan Semua ({children.length})</span>
 </button>
 </div>
 </div>

 {/* CARDS ANAK: UKURAN COMPACT RINGKAS */}
 <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
 {children.map((c) => {
 const isSelected = !viewAllChildren && String(c.id) === String(childId)
 const isPonpes = c.is_pesantren || c.unit_name?.toLowerCase().includes('pesantren') || c.unit_code === 'PONPES'
 return (
 <div
 key={c.id}
 onClick={() => selectChild(c.id)}
 className={`group relative cursor-pointer overflow-hidden rounded-xl p-2.5 transition-all duration-200 border ${
 isSelected
 ? 'bg-emerald-50/90 text-slate-900 shadow-md border-emerald-500 ring-2 ring-emerald-500/30 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-100'
 : 'bg-slate-50/70 text-slate-700 border-emerald-200/80 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 dark:bg-slate-800/60 dark:border-emerald-700/80 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
 }`}
 >
 <div className="flex items-center gap-2">
 <Avatar className={`h-8 w-8 shrink-0 border ${isSelected ? 'border-emerald-600' : 'border-emerald-300 dark:border-emerald-600'}`}>
 <AvatarFallback className={`${isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300'} font-black text-xs`}>
 {c.full_name?.charAt(0) || c.name?.charAt(0) || '-'}
 </AvatarFallback>
 </Avatar>

 <div className="min-w-0 flex-1">
 <div className="flex items-center justify-between gap-1">
 <h3 className={`truncate text-xs font-extrabold ${isSelected ? 'text-emerald-950 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'}`}>
 {c.full_name}
 </h3>
 </div>

 <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
 {c.unit_name ? `${c.unit_name} · ` : ''}{c.kelas?.nama_kelas || '-'}
 </p>
 </div>
 </div>

 <div className="mt-2 flex items-center justify-between border-t border-emerald-200/60 pt-1.5 dark:border-emerald-700/80/60 text-[9px] font-bold">
 <span className="text-emerald-700 dark:text-emerald-400 truncate">
 Tahfizh: {c.tahfizh_summary || (c.tahfizh_target_pct != null ? `${c.tahfizh_target_pct}%` : '-')}
 </span>
 <span className="text-sky-700 dark:text-sky-400 shrink-0">
 Rapor: {c.gpa != null ? c.gpa : '-'}
 </span>
 </div>

 {isPonpes && (
 <span className="absolute top-1 right-1 rounded-md bg-amber-100 px-1 py-0.2 text-[8px] font-black uppercase text-amber-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300 dark:border-emerald-800/60">
 Ponpes
 </span>
 )}
 </div>
 )
 })}
 </div>
 </section>

 {/* ───────────────────────────────────────────────────────────────────────────── */}
 {/* 2. CARD AKSI CEPAT: 16 MODUL (TAMPIL DI BAWAH KETIKA CARD ANAK DIKLIK/AKTIF) */}
 {/* ───────────────────────────────────────────────────────────────────────────── */}
 {!viewAllChildren && activeChild && (
 <section className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433] p-5 transition-all">
 <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4 dark:border-emerald-800/60">
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 <Sparkles className="h-5 w-5" />
 </div>
 <div>
 <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
 Aksi Cepat & Navigasi Modul Orang Tua ({menu.length} Modul)
 </h2>
 <p className="text-xs text-slate-400">
 Anak Aktif: <b className="text-emerald-700 dark:text-emerald-400">{activeChild?.full_name}</b>{activeChild?.unit_name ? ` (${activeChild.unit_name})` : ''}
 </p>
 </div>
 </div>
 </div>

 {/* 16 SOFT PASTEL SQUIRCLE ICON BUTTONS GRID */}
 <div className="mt-4 flex flex-wrap items-center gap-3">
 {menu.map(([id, label, Icon, colorClass]) => {
 const isActive = active === id
 return (
 <button
 key={id}
 type="button"
 onClick={() => selectTab(id)}
 className={`group relative flex h-11 w-11 items-center justify-center rounded-xl border shadow-xs transition-all duration-200 cursor-pointer ${
 isActive
 ? 'ring-2 ring-emerald-500 scale-105 shadow-md ' + colorClass
 : colorClass + ' hover:scale-105 hover:shadow-md'
 }`}
 title={label}
 >
 <Icon className="h-5 w-5 transition-transform duration-200 group-hover:rotate-6" />
 {/* Floating Hover Tooltip */}
 <span className="absolute bottom-full mb-2 hidden group-hover:flex items-center rounded-lg bg-slate-900 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg whitespace-nowrap z-30 pointer-events-none">
 {label}
 </span>
 </button>
 )
 })}
 </div>
 </section>
 )}

 {error && (
 <div className="flex items-center gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 p-4 text-xs font-bold text-rose-700 dark:border-emerald-800/60 dark:bg-rose-950/30">
 <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
 <span className="flex-1">{error}</span>
 <Button
 type="button"
 variant="ghost"
 size="xs"
 iconOnly
 onClick={load}
 aria-label="Muat ulang data portal"
 className="rounded-lg p-1 text-rose-700 hover:bg-rose-100 dark:text-rose-300 dark:hover:bg-rose-900"
 >
 <RefreshCw className="h-4 w-4" />
 </Button>
 </div>
 )}

 {/* ───────────────────────────────────────────────────────────────────────────── */}
 {/* MAIN RENDER: ALL-CHILDREN IKHTISAR OR SINGLE CHILD DETAILED DASHBOARD */}
 {/* ───────────────────────────────────────────────────────────────────────────── */}
 {viewAllChildren ? (
 <section className="space-y-6">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 p-5 dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <div className="flex items-center gap-3">
 <Users className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
 <div>
 <h2 className="text-base font-black text-emerald-950 dark:text-emerald-200">
 Ikhtisar Semua Anak Lintas Unit ({children.length} Anak)
 </h2>
 <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
 Perbandingan langsung performa nilai akademik, tahfizh Al-Qur'an, mutabaah, dan status asrama pesantren.
 </p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
 {children.map((c) => {
 const isPonpes = c.is_pesantren || c.unit_name?.toLowerCase().includes('pesantren') || c.unit_code === 'PONPES'
 return (
 <div key={c.id} className="overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 hover:shadow-lg transition-all">
 <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-5 dark:border-emerald-800/60">
 <div className="flex items-center justify-between gap-2">
 <Badge color="emerald" className="font-extrabold">
 {c.unit_name || '-'}
 </Badge>
 {isPonpes && (
 <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[9px] font-black text-slate-900 uppercase">
 Santri Asrama
 </span>
 )}
 </div>
 <h3 className="mt-3 text-lg font-black text-slate-900 dark:text-white">{c.full_name}</h3>
 <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
 {c.kelas?.nama_kelas || '-'} · NISN: {c.nisn || '-'}
 </p>
 </div>

 <div className="p-5 space-y-4 text-xs">
 {/* Nilai Rapor */}
 <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
 <span className="font-bold text-slate-600 dark:text-slate-400">Rata-rata Nilai Rapor</span>
 <b className="text-sm font-black text-blue-600 dark:text-blue-400">{c.gpa != null ? c.gpa : '-'}</b>
 </div>

 {/* Hafalan Tahfizh */}
 <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/40">
 <span className="font-bold text-emerald-800 dark:text-emerald-300">Capaian Tahfizh</span>
 <b className="text-xs font-black text-emerald-700 dark:text-emerald-400">
 {c.tahfizh_summary || (c.tahfizh_target_pct != null ? `${c.tahfizh_target_pct}% Target` : '-')}
 </b>
 </div>

 {/* Mutabaah Yaumiyah */}
 <div className="flex items-center justify-between rounded-xl bg-purple-50 p-3 dark:bg-purple-950/40">
 <span className="font-bold text-purple-800 dark:text-purple-300">Skor Mutabaah Yaumiyah</span>
 <b className="text-xs font-black text-purple-700 dark:text-purple-400">{c.mutabaah_score != null ? `${c.mutabaah_score}/100` : '-'}</b>
 </div>

 {/* Rincian Asrama jika Pesantren */}
 {isPonpes && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/60 p-3.5 space-y-2 dark:border-emerald-800/60 dark:bg-amber-950/30">
 <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-xs">
 <Building2 className="h-4 w-4 text-amber-600" />
 <span>Data Pesantren / Asrama</span>
 </div>
 <p className="text-xs text-amber-800 dark:text-amber-200">
 {c.asrama || '-'}
 </p>
 <p className="text-[10px] text-amber-700 dark:text-amber-400">
 Musyrif: {c.musyrif || '-'}
 </p>
 {c.pesantren_details && (
 <div className="mt-2 border-t border-emerald-200/80 dark:border-emerald-800/80 pt-2 text-[10px] space-y-1 text-slate-700 dark:text-slate-300">
 <p><b>Presensi Malam:</b> {c.pesantren_details.presensi_malam || '-'}</p>
 <p><b>Kebersihan Kamar:</b> {c.pesantren_details.kebersihan_kamar || '-'}</p>
 </div>
 )}
 </div>
 )}
 </div>

 <div className="bg-slate-50 p-4 border-t border-emerald-200/80 flex items-center justify-between dark:bg-slate-800/40 dark:border-emerald-800/60">
 <span className="text-xs font-bold text-slate-500">Wali Kelas: {c.wali_kelas || '-'}</span>
 <Button
 size="sm"
 variant="primary"
 onClick={() => selectChild(c.id)}
 className="rounded-xl text-xs font-bold"
 >
 Buka Rincian Anak →
 </Button>
 </div>
 </div>
 )
 })}
 </div>
 </section>
 ) : loading ? (
 <div className="flex min-h-64 items-center justify-center">
 <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
 </div>
 ) : (
 <section className="space-y-6">
 {/* TAB RINGKASAN DASHBOARD ANAK AKTIF */}
 {active === 'ringkasan' && (
 <div className="space-y-6">
 {/* Stat Grid Anak */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <KpiStatCard
              icon={UserCheck}
              title="Kehadiran Hari Ini"
              value={dashboard?.attendance_today || activeChild?.attendance_status || '-'}
              description="Status presensi harian ananda"
              tone="emerald"
              onClick={() => selectTab('attendance')}
              ctaText="Lihat Presensi"
            />
            <KpiStatCard
              icon={Award}
              title="Rata-rata Rapor"
              value={activeChild?.gpa || '-'}
              description="Capaian nilai akademik"
              tone="indigo"
              onClick={() => selectTab('grades')}
              ctaText="Lihat Nilai"
            />
            <KpiStatCard
              icon={BookOpenCheck}
              title="Capaian Tahfizh"
              value={activeChild?.tahfizh_summary || (dashboard?.kpi?.total_tahfizh_ayat ? `${dashboard.kpi.total_tahfizh_ayat} Ayat` : '-')}
              description="Akumulasi setoran hafalan"
              tone="teal"
              onClick={() => selectTab('tahfizh')}
              ctaText="Lihat Tahfizh"
            />
            <KpiStatCard
              icon={HeartHandshake}
              title="Mutabaah Yaumiyah"
              value={activeChild?.mutabaah_score ? `${activeChild.mutabaah_score}% Tertib` : '-'}
              description="Indeks amalan harian"
              tone="purple"
              onClick={() => selectTab('mutabaah')}
              ctaText="Lihat Mutabaah"
            />
          </div>

          {/* ───────────────────────────────────────────────────────────────────────────── */}
          {/* 5 MODUL MONITORING INTEGRASI: MUTABA'AH, TAHFIZH, TARGET, ORTU & NON-PONPES */}
 {/* ───────────────────────────────────────────────────────────────────────────── */}
 <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-5 space-y-5">
 <div className="space-y-4 -mx-5 -mt-5 px-5 pt-4 pb-4 border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-500/10 dark:bg-emerald-950/40">
 <div className="flex items-center gap-3">
 <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
 <HeartHandshake className="h-4.5 w-4.5 text-white" strokeWidth={2.2} />
 </div>
 <div>
 <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-200 leading-tight">
 Pemantauan Terpadu Mutaba’ah &amp; Tahfizh — {activeChild?.full_name}
 </h3>
 <p className="text-xs font-semibold text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
 Monitoring amalan yaumiyah, setoran hafalan, target &amp; evaluasi, serta log wali murid.
 </p>
 </div>
 </div>

 {/* Sub-Tab Switcher 4 Modul */}
 <AppTabs
 tabs={[
 { id: 'mutabaah', label: 'Dashboard Mutaba’ah', icon: HeartHandshake },
 { id: 'setoran', label: 'Setoran Tahfizh Siswa', icon: BookOpenCheck },
 { id: 'target', label: 'Target & Evaluasi', icon: Award },
 { id: 'ortu', label: 'Monitoring Orang Tua', icon: Users },
 ]}
 activeTab={ringkasanSubTab}
 onChange={setRingkasanSubTab}
 ariaLabel="Sub-modul pemantauan"
 />

 {/* Filter Periode Evaluasi Terpadu: Harian, Mingguan, Bulanan, Semester */}
 <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1.5">
 <div className="flex items-center gap-1 p-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-700/80/80">
 {[
 { id: 'harian', label: 'Harian', icon: Calendar, desc: 'Catatan Terakhir' },
 { id: 'mingguan', label: 'Mingguan', icon: CalendarDays, desc: '7 Hari Terakhir' },
 { id: 'bulanan', label: 'Bulanan', icon: BarChart3, desc: '30 Hari Terakhir' },
 { id: 'semester', label: 'Semester', icon: Award, desc: 'Semester 1' },
 ].map((p) => {
 const isSel = monitoringPeriod === p.id
 const IconComponent = p.icon
 return (
 <button
 key={p.id}
 type="button"
 onClick={() => setMonitoringPeriod(p.id)}
 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
 isSel
 ? 'bg-emerald-600 text-white shadow-xs shadow-sm ring-2 ring-emerald-500/20'
 : 'text-slate-600 hover:text-slate-900 hover:bg-white/80 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700/60'
 }`}
 >
 <IconComponent className="h-3.5 w-3.5" />
 <span>{p.label}</span>
 <span className={`text-[10px] font-medium hidden sm:inline ${isSel ? 'text-emerald-100' : 'text-slate-400'}`}>
 ({p.desc})
 </span>
 </button>
 )
 })}
 </div>

 <div className="flex items-center gap-2">
 <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 px-3 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-700/80/60 flex items-center gap-1.5">
 <Clock className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
 <span>Filter:</span>
 <b className="text-emerald-600 dark:text-emerald-400 font-black">
 {dashboard?.mutabaah_monitoring?.periods?.[monitoringPeriod]?.sub_label ||
 (monitoringPeriod === 'harian' ? 'Catatan Harian Terakhir' : monitoringPeriod)}
 </b>
 </span>
 </div>
 </div>
 </div>

 {/* CONTENT MODUL 1: DASHBOARD MUTABA'AH - ADAPTIF PERIODE */}
 {ringkasanSubTab === 'mutabaah' && (() => {
 const activePeriod = dashboard?.mutabaah_monitoring?.periods?.[monitoringPeriod] || dashboard?.mutabaah_monitoring
 const scoreVal = activePeriod?.score != null ? Math.round(Number(activePeriod.score)) : null
 const isHarian = monitoringPeriod === 'harian'

 return (
 <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
 {/* Header info tanggal/rentang & kepatuhan */}
 <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white dark:bg-[#1B2433] p-4 border border-emerald-200/80 dark:border-emerald-800/80 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-emerald-950/30">
 <div className="flex items-center gap-3">
 <div className="flex h-9 w-11 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm font-black text-sm shrink-0">
 {scoreVal != null ? `${scoreVal}%` : '-'}
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-xs font-black text-slate-800 dark:text-slate-100">
 {isHarian
 ? 'Kepatuhan Ibadah & Amalan Harian'
 : monitoringPeriod === 'mingguan'
 ? 'Rata-rata Kepatuhan Mingguan (7 Hari)'
 : monitoringPeriod === 'bulanan'
 ? 'Rata-rata Kepatuhan Bulanan (30 Hari)'
 : 'Indeks Kepatuhan Kumulatif Semester'}
 </span>
 {scoreVal != null ? (
 <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200">
 {scoreVal >= 90 ? 'Sangat Tertib & Istiqamah' : scoreVal >= 75 ? 'Tertib Terlaksana' : 'Perlu Peningkatan'}
 </span>
 ) : (
 <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
 Belum Ada Evaluasi
 </span>
 )}
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 {isHarian ? (
 <>Data Terakhir Terverifikasi: <b>{activePeriod?.date_display || activePeriod?.activity_date || 'Hari Ini'}</b></>
 ) : (
 <>Rentang Evaluasi: <b>{activePeriod?.date_range || activePeriod?.sub_label || '-'}</b> · <b>{activePeriod?.days_active || 0} Hari Aktif Tercatat</b></>
 )}
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => selectTab('mutabaah')}
 className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition-all cursor-pointer"
 >
 <span>Buka Buku Mutaba'ah Lengkap</span>
 <ChevronRight className="h-3.5 w-3.5" />
 </button>
 </div>

 {/* Tren Skor Harian Khusus Periode Mingguan */}
 {monitoringPeriod === 'mingguan' && Array.isArray(activePeriod?.daily_trend) && activePeriod.daily_trend.length > 0 && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3.5 dark:border-emerald-800/60 dark:bg-slate-900 shadow-2xs space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
 <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />
 Tren Kepatuhan Ibadah Harian Santri (Pekan Ini)
 </span>
 <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400">
 Rata-rata: {scoreVal != null ? `${scoreVal}%` : '-'}
 </span>
 </div>
 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
 {activePeriod.daily_trend.map((d, idx) => (
 <div
 key={idx}
 className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-2 text-center dark:border-emerald-800/60 dark:bg-slate-800/60"
 >
 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block">
 {d.day}, {d.date}
 </span>
 <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 block mt-0.5">
 {d.score != null ? `${Math.round(d.score)}%` : '-'}
 </span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* JIKA HARIAN: Tampilkan 4 Pilar Rincian Kegiatan Individual */}
 {isHarian ? (
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* 1. Shalat 5 Waktu (Fardhu) */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-900 shadow-2xs space-y-3">
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 pb-2.5">
 <div className="flex items-center gap-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
 1
 </span>
 <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
 Shalat 5 Waktu (Fardhu)
 </h4>
 </div>
 <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400">
 {activePeriod?.shalat_fardhu?.length ?? 0} Waktu
 </span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {Array.isArray(activePeriod?.shalat_fardhu) && activePeriod.shalat_fardhu.length > 0 ? (
 activePeriod.shalat_fardhu.map((it, idx) => (
 <div
 key={it.code || idx}
 className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-emerald-200/60 dark:border-emerald-700/80/60"
 >
 <div className="flex items-center gap-2 min-w-0 pr-1">
 <span className={`h-2 w-2 rounded-full shrink-0 ${it.status_value === 'good' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
 <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
 {it.name}
 </span>
 </div>
 <span className="shrink-0 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9.5px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 {it.status_value === 'good' ? 'Terlaksana' : (it.status_value === 'less' ? 'Kurang' : (it.status_value || 'Belum'))}
 </span>
 </div>
 ))
 ) : (
 <div className="col-span-full py-4 text-center text-xs text-slate-400 italic">
 Belum ada catatan shalat fardhu untuk tanggal ini.
 </div>
 )}
 </div>
 </div>

 {/* 2. Shalat Sunnah & Qiyamul Lail */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-900 shadow-2xs space-y-3">
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 pb-2.5">
 <div className="flex items-center gap-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold text-xs">
 2
 </span>
 <h4 className="text-xs font-black uppercase tracking-wider text-purple-950 dark:text-purple-200">
 Shalat Sunnah & Qiyamul Lail
 </h4>
 </div>
 <span className="text-[10px] font-extrabold text-purple-700 dark:text-purple-400">
 {activePeriod?.shalat_sunnah?.length ?? 0} Amalan
 </span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {Array.isArray(activePeriod?.shalat_sunnah) && activePeriod.shalat_sunnah.length > 0 ? (
 activePeriod.shalat_sunnah.map((it, idx) => (
 <div
 key={it.code || idx}
 className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-emerald-200/60 dark:border-emerald-700/80/60"
 >
 <div className="flex items-center gap-2 min-w-0 pr-1">
 <span className={`h-2 w-2 rounded-full shrink-0 ${it.status_value === 'good' ? 'bg-purple-500' : 'bg-amber-500'}`} />
 <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
 {it.name}
 </span>
 </div>
 <span className="shrink-0 rounded-md bg-purple-100 px-1.5 py-0.5 text-[9.5px] font-extrabold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
 {it.status_value === 'good' ? 'Rutin' : (it.status_value === 'less' ? 'Kurang' : (it.status_value || 'Belum'))}
 </span>
 </div>
 ))
 ) : (
 <div className="col-span-full py-4 text-center text-xs text-slate-400 italic">
 Belum ada catatan shalat sunnah untuk tanggal ini.
 </div>
 )}
 </div>
 </div>

 {/* 3. Tilawah, Zikir & Penguatan */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-900 shadow-2xs space-y-3">
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 pb-2.5">
 <div className="flex items-center gap-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs">
 3
 </span>
 <h4 className="text-xs font-black uppercase tracking-wider text-blue-950 dark:text-blue-200">
 Tilawah, Zikir & Penguatan
 </h4>
 </div>
 <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-400">
 {activePeriod?.tilawah_dzikir?.length ?? 0} Kegiatan
 </span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {Array.isArray(activePeriod?.tilawah_dzikir) && activePeriod.tilawah_dzikir.length > 0 ? (
 activePeriod.tilawah_dzikir.map((it, idx) => (
 <div
 key={it.code || idx}
 className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-emerald-200/60 dark:border-emerald-700/80/60"
 >
 <div className="flex items-center gap-2 min-w-0 pr-1">
 <span className={`h-2 w-2 rounded-full shrink-0 ${it.status_value === 'good' ? 'bg-blue-500' : 'bg-amber-500'}`} />
 <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
 {it.name}
 </span>
 </div>
 <span className="shrink-0 rounded-md bg-blue-100 px-1.5 py-0.5 text-[9.5px] font-extrabold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
 {it.status_value === 'good' ? 'Aktif' : (it.status_value === 'less' ? 'Kurang' : (it.status_value || 'Belum'))}
 </span>
 </div>
 ))
 ) : (
 <div className="col-span-full py-4 text-center text-xs text-slate-400 italic">
 Belum ada catatan tilawah/zikir untuk tanggal ini.
 </div>
 )}
 </div>
 </div>

 {/* 4. Adab & Karakter Terpuji */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-900 shadow-2xs space-y-3">
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 pb-2.5">
 <div className="flex items-center gap-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold text-xs">
 4
 </span>
 <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 dark:text-amber-200">
 Adab & Karakter Terpuji
 </h4>
 </div>
 <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400">
 {activePeriod?.adab_karakter?.length ?? 0} Pembiasaan
 </span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {Array.isArray(activePeriod?.adab_karakter) && activePeriod.adab_karakter.length > 0 ? (
 activePeriod.adab_karakter.map((it, idx) => (
 <div
 key={it.code || idx}
 className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-emerald-200/60 dark:border-emerald-700/80/60"
 >
 <div className="flex items-center gap-2 min-w-0 pr-1">
 <span className={`h-2 w-2 rounded-full shrink-0 ${it.status_value === 'good' ? 'bg-amber-500' : 'bg-slate-400'}`} />
 <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
 {it.name}
 </span>
 </div>
 <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[9.5px] font-extrabold ${
 it.status_value === 'good' 
 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' 
 : 'bg-slate-200 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}>
 {it.status_value === 'good' ? 'Baik' : (it.status_value === 'less' ? 'Kurang' : (it.status_value || 'Belum'))}
 </span>
 </div>
 ))
 ) : (
 <div className="col-span-full py-4 text-center text-xs text-slate-400 italic">
 Belum ada catatan adab/karakter untuk tanggal ini.
 </div>
 )}
 </div>
 </div>
 </div>
 ) : (
 /* JIKA MINGGUAN / BULANAN / SEMESTER: Tampilkan 4 Kartu Rekap Kategori Kumulatif */
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                      {/* Kartu 1: Shalat Fardhu */}
                      <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-emerald-100/90 hover:!bg-emerald-200/70 p-4 dark:border-emerald-800/60 dark:!bg-emerald-950/50 shadow-sm space-y-2.5 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                            1. Shalat Fardhu
                          </span>
                          <span className="inline-flex items-center rounded-lg bg-emerald-200/80 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                            {activePeriod?.category_stats?.fardhu?.label || '-'}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-emerald-800 dark:text-emerald-200">
                            {activePeriod?.category_stats?.fardhu?.rate ?? 0}%
                          </span>
                          {activePeriod?.category_stats?.fardhu?.total ? (
                            <span className="text-xs font-bold text-emerald-700/80 dark:text-emerald-400/80">
                              {activePeriod.category_stats.fardhu.good}/{activePeriod.category_stats.fardhu.total} Waktu
                            </span>
                          ) : null}
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-emerald-200/80 dark:bg-emerald-900/60">
                          <div
                            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                            style={{ width: `${activePeriod?.category_stats?.fardhu?.rate ?? 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Kartu 2: Shalat Sunnah */}
                      <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-purple-100/90 hover:!bg-purple-200/70 p-4 dark:border-emerald-800/60 dark:!bg-purple-950/50 shadow-sm space-y-2.5 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-purple-800 dark:text-purple-300">
                            2. Shalat Sunnah
                          </span>
                          <span className="inline-flex items-center rounded-lg bg-purple-200/80 px-2 py-0.5 text-[11px] font-bold text-purple-800 dark:bg-purple-900/60 dark:text-purple-200">
                            {activePeriod?.category_stats?.sunnah?.label || '-'}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-purple-800 dark:text-purple-200">
                            {activePeriod?.category_stats?.sunnah?.rate ?? 0}%
                          </span>
                          {activePeriod?.category_stats?.sunnah?.total ? (
                            <span className="text-xs font-bold text-purple-700/80 dark:text-purple-400/80">
                              {activePeriod.category_stats.sunnah.good}/{activePeriod.category_stats.sunnah.total} Amalan
                            </span>
                          ) : null}
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-purple-200/80 dark:bg-purple-900/60">
                          <div
                            className="h-full bg-purple-600 rounded-full transition-all duration-500"
                            style={{ width: `${activePeriod?.category_stats?.sunnah?.rate ?? 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Kartu 3: Tilawah & Zikir */}
                      <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-blue-100/90 hover:!bg-blue-200/70 p-4 dark:border-emerald-800/60 dark:!bg-blue-950/50 shadow-sm space-y-2.5 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-blue-800 dark:text-blue-300">
                            3. Tilawah & Zikir
                          </span>
                          <span className="inline-flex items-center rounded-lg bg-blue-200/80 px-2 py-0.5 text-[11px] font-bold text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                            {activePeriod?.category_stats?.tilawah?.label || '-'}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-blue-800 dark:text-blue-200">
                            {activePeriod?.category_stats?.tilawah?.rate ?? 0}%
                          </span>
                          {activePeriod?.category_stats?.tilawah?.total ? (
                            <span className="text-xs font-bold text-blue-700/80 dark:text-blue-400/80">
                              {activePeriod.category_stats.tilawah.good}/{activePeriod.category_stats.tilawah.total} Kegiatan
                            </span>
                          ) : null}
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-blue-200/80 dark:bg-blue-900/60">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${activePeriod?.category_stats?.tilawah?.rate ?? 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Kartu 4: Adab & Karakter */}
                      <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 !bg-amber-100/90 hover:!bg-amber-200/70 p-4 dark:border-emerald-800/60 dark:!bg-amber-950/50 shadow-sm space-y-2.5 transition-all duration-300">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                            4. Adab & Karakter
                          </span>
                          <span className="inline-flex items-center rounded-lg bg-amber-200/80 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
                            {activePeriod?.category_stats?.adab?.label || '-'}
                          </span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-2xl font-black text-amber-800 dark:text-amber-200">
                            {activePeriod?.category_stats?.adab?.rate ?? 0}%
                          </span>
                          {activePeriod?.category_stats?.adab?.total ? (
                            <span className="text-xs font-bold text-amber-700/80 dark:text-amber-400/80">
                              {activePeriod.category_stats.adab.good}/{activePeriod.category_stats.adab.total} Pembiasaan
                            </span>
                          ) : null}
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-amber-200/80 dark:bg-amber-900/60">
                          <div
                            className="h-full bg-amber-600 rounded-full transition-all duration-500"
                            style={{ width: `${activePeriod?.category_stats?.adab?.rate ?? 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Rincian Terpadu Per Amalan & Pembiasaan Khusus Periode */}
 <div className="space-y-3 pt-2">
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-2">
 <div className="flex items-center gap-2">
 <Sparkles className="h-4 w-4 text-emerald-600" />
 <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
 Rincian Frekuensi & Konsistensi Per Kegiatan ({activePeriod?.label || monitoringPeriod})
 </h4>
 </div>
 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
 Total {((activePeriod?.shalat_fardhu?.length || 0) + (activePeriod?.shalat_sunnah?.length || 0) + (activePeriod?.tilawah_dzikir?.length || 0) + (activePeriod?.adab_karakter?.length || 0))} Agenda Amalan Terpantau
 </span>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {/* 1. Shalat 5 Waktu (Fardhu) */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-900 shadow-2xs space-y-3">
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 pb-2.5">
 <div className="flex items-center gap-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-xs">
 1
 </span>
 <h4 className="text-xs font-black uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
 Shalat 5 Waktu (Fardhu)
 </h4>
 </div>
 <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400">
 {activePeriod?.shalat_fardhu?.length ?? 0} Waktu
 </span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {Array.isArray(activePeriod?.shalat_fardhu) && activePeriod.shalat_fardhu.length > 0 ? (
 activePeriod.shalat_fardhu.map((it, idx) => (
 <div
 key={it.code || idx}
 className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-emerald-200/60 dark:border-emerald-700/80/60"
 >
 <div className="min-w-0 pr-1">
 <div className="flex items-center gap-2">
 <span className="h-2 w-2 rounded-full shrink-0 bg-emerald-500" />
 <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
 {it.name}
 </span>
 </div>
 <span className="text-[10px] text-slate-500 dark:text-slate-400 pl-4 block">
 {it.good_count}/{it.total_days} Hari ({it.rate}%)
 </span>
 </div>
 <span className="shrink-0 rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9.5px] font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 {it.status_label || '-'}
 </span>
 </div>
 ))
 ) : (
 <p className="col-span-full py-3 text-center text-xs text-slate-500 dark:text-slate-400 italic">
 Belum ada agenda shalat fardhu tercatat untuk periode ini.
 </p>
 )}
 </div>
 </div>

 {/* 2. Shalat Sunnah & Qiyamul Lail */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-900 shadow-2xs space-y-3">
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 pb-2.5">
 <div className="flex items-center gap-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold text-xs">
 2
 </span>
 <h4 className="text-xs font-black uppercase tracking-wider text-purple-950 dark:text-purple-200">
 Shalat Sunnah & Qiyamul Lail
 </h4>
 </div>
 <span className="text-[10px] font-extrabold text-purple-700 dark:text-purple-400">
 {activePeriod?.shalat_sunnah?.length ?? 0} Amalan
 </span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {Array.isArray(activePeriod?.shalat_sunnah) && activePeriod.shalat_sunnah.length > 0 ? (
 activePeriod.shalat_sunnah.map((it, idx) => (
 <div
 key={it.code || idx}
 className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-emerald-200/60 dark:border-emerald-700/80/60"
 >
 <div className="min-w-0 pr-1">
 <div className="flex items-center gap-2">
 <span className={`h-2 w-2 rounded-full shrink-0 ${it.rate >= 80 ? 'bg-purple-500' : 'bg-amber-500'}`} />
 <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
 {it.name}
 </span>
 </div>
 <span className="text-[10px] text-slate-500 dark:text-slate-400 pl-4 block">
 {it.good_count}/{it.total_days} Hari ({it.rate}%)
 </span>
 </div>
 <span className="shrink-0 rounded-md bg-purple-100 px-1.5 py-0.5 text-[9.5px] font-extrabold text-purple-800 dark:bg-purple-950 dark:text-purple-300">
 {it.status_label || '-'}
 </span>
 </div>
 ))
 ) : (
 <p className="col-span-full py-3 text-center text-xs text-slate-500 dark:text-slate-400 italic">
 Belum ada agenda shalat sunnah tercatat untuk periode ini.
 </p>
 )}
 </div>
 </div>

 {/* 3. Tilawah, Zikir & Penguatan */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-900 shadow-2xs space-y-3">
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 pb-2.5">
 <div className="flex items-center gap-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-xs">
 3
 </span>
 <h4 className="text-xs font-black uppercase tracking-wider text-blue-950 dark:text-blue-200">
 Tilawah, Zikir & Penguatan
 </h4>
 </div>
 <span className="text-[10px] font-extrabold text-blue-700 dark:text-blue-400">
 {activePeriod?.tilawah_dzikir?.length ?? 0} Kegiatan
 </span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {Array.isArray(activePeriod?.tilawah_dzikir) && activePeriod.tilawah_dzikir.length > 0 ? (
 activePeriod.tilawah_dzikir.map((it, idx) => (
 <div
 key={it.code || idx}
 className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-emerald-200/60 dark:border-emerald-700/80/60"
 >
 <div className="min-w-0 pr-1">
 <div className="flex items-center gap-2">
 <span className={`h-2 w-2 rounded-full shrink-0 ${it.rate >= 80 ? 'bg-blue-500' : 'bg-amber-500'}`} />
 <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
 {it.name}
 </span>
 </div>
 <span className="text-[10px] text-slate-500 dark:text-slate-400 pl-4 block">
 {it.good_count}/{it.total_days} Hari ({it.rate}%)
 </span>
 </div>
 <span className="shrink-0 rounded-md bg-blue-100 px-1.5 py-0.5 text-[9.5px] font-extrabold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
 {it.status_label || '-'}
 </span>
 </div>
 ))
 ) : (
 <p className="col-span-full py-3 text-center text-xs text-slate-500 dark:text-slate-400 italic">
 Belum ada agenda tilawah & zikir tercatat untuk periode ini.
 </p>
 )}
 </div>
 </div>

 {/* 4. Adab & Karakter Terpuji */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-900 shadow-2xs space-y-3">
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 pb-2.5">
 <div className="flex items-center gap-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold text-xs">
 4
 </span>
 <h4 className="text-xs font-black uppercase tracking-wider text-amber-950 dark:text-amber-200">
 Adab & Karakter Terpuji
 </h4>
 </div>
 <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400">
 {activePeriod?.adab_karakter?.length ?? 0} Pembiasaan
 </span>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
 {Array.isArray(activePeriod?.adab_karakter) && activePeriod.adab_karakter.length > 0 ? (
 activePeriod.adab_karakter.map((it, idx) => (
 <div
 key={it.code || idx}
 className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60 border border-emerald-200/60 dark:border-emerald-700/80/60"
 >
 <div className="min-w-0 pr-1">
 <div className="flex items-center gap-2">
 <span className={`h-2 w-2 rounded-full shrink-0 ${it.rate >= 80 ? 'bg-amber-500' : 'bg-slate-400'}`} />
 <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
 {it.name}
 </span>
 </div>
 <span className="text-[10px] text-slate-500 dark:text-slate-400 pl-4 block">
 {it.good_count}/{it.total_days} Hari ({it.rate}%)
 </span>
 </div>
 <span className="shrink-0 rounded-md bg-amber-100 px-1.5 py-0.5 text-[9.5px] font-extrabold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
 {it.status_label || '-'}
 </span>
 </div>
 ))
 ) : (
 <p className="col-span-full py-3 text-center text-xs text-slate-500 dark:text-slate-400 italic">
 Belum ada agenda adab & karakter tercatat untuk periode ini.
 </p>
 )}
 </div>
 </div>
 </div>
 </div>

 {/* Ringkasan & Riwayat Setoran Tahfizh Periode Ini */}
 <div className="space-y-3">
 {activePeriod?.tahfizh_summary && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-4 dark:border-emerald-800/60 dark:bg-slate-900 dark:from-teal-950/20 dark:to-slate-900 flex flex-wrap items-center justify-between gap-3">
 <div className="space-y-1">
 <span className="text-[10px] font-black uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
 <BookOpenCheck className="h-3.5 w-3.5" />
 Aktivitas Tahfizh & Setoran Hafalan pada Periode Ini
 </span>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
 Total Setoran Terverifikasi:{' '}
 <b className="text-teal-700 dark:text-teal-300">
 {activePeriod.tahfizh_summary.total_logs || 0} Kali Setoran
 </b>
 {activePeriod.tahfizh_summary.latest_surah ? (
 <> · Surah Terakhir: <b>{activePeriod.tahfizh_summary.latest_surah}</b></>
 ) : null}
 </p>
 </div>
 <button
 type="button"
 onClick={() => setRingkasanSubTab('setoran')}
 className="inline-flex items-center gap-1 rounded-xl bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition-all cursor-pointer"
 >
 <span>Lihat Rincian Setoran</span>
 <ChevronRight className="h-3.5 w-3.5" />
 </button>
 </div>
 )}

 {/* Rincian Catatan Setoran Tahfizh pada Periode Ini */}
 {Array.isArray(activePeriod?.tahfizh_logs) && activePeriod.tahfizh_logs.length > 0 && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-900 shadow-2xs space-y-3">
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 pb-2.5">
 <div className="flex items-center gap-2">
 <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-300 font-bold text-xs">
 <BookOpenCheck className="h-3.5 w-3.5" />
 </div>
 <h4 className="text-xs font-black uppercase tracking-wider text-teal-950 dark:text-teal-200">
 Riwayat Rincian Setoran Hafalan ({activePeriod?.label || monitoringPeriod})
 </h4>
 </div>
 <span className="text-[10px] font-extrabold text-teal-700 dark:text-teal-400">
 {activePeriod.tahfizh_logs.length} Setoran Tercatat
 </span>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
 {activePeriod.tahfizh_logs.map((log) => (
 <div
 key={log.id}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-teal-50/25 p-3 dark:border-emerald-800/60 dark:bg-teal-950/20 flex items-start justify-between gap-3"
 >
 <div className="min-w-0 space-y-1">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="text-xs font-black text-slate-800 dark:text-slate-100">
 {log.surah}
 </span>
 <span className="rounded-md bg-teal-100 px-1.5 py-0.5 text-[9.5px] font-extrabold text-teal-800 dark:bg-teal-900/80 dark:text-teal-200">
 {log.ayah_range}
 </span>
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
 {log.notes}
 </p>
 <p className="text-[10px] text-slate-400 dark:text-slate-500">
 Penguji: <b className="text-slate-600 dark:text-slate-300">{log.teacher_name}</b> · {log.date}
 </p>
 </div>
 <div className="shrink-0 text-right">
 <span className="rounded-lg bg-emerald-600 px-2 py-0.5 text-[10px] font-black text-white shadow-2xs block">
 Nilai {log.score}
 </span>
 <span className="text-[9.5px] font-extrabold text-teal-700 dark:text-teal-400 block mt-1">
 {log.quality}
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>
 )}
 </div>
 )
 })()}

 {/* CONTENT MODUL 2: SETORAN TAHFIZH SISWA */}
 {ringkasanSubTab === 'setoran' && (
 <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
 {dashboard?.latest_tahfizh ? (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/30 flex flex-wrap items-center justify-between gap-3">
 <div>
 <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Setoran Terakhir Aktif</span>
 <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-100 mt-0.5">
 {dashboard.latest_tahfizh.surah_name || 'Hafalan Al-Qur\'an'}
 {dashboard.latest_tahfizh.ayah_start ? `: Ayat ${dashboard.latest_tahfizh.ayah_start}-${dashboard.latest_tahfizh.ayah_end}` : ''}
 {dashboard.latest_tahfizh.quality ? ` (${dashboard.latest_tahfizh.quality})` : ''}
 </h4>
 <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
 Penguji: {dashboard.latest_tahfizh.teacher_name || 'Guru Tahfizh'} · Tanggal: {dashboard.latest_tahfizh.record_date || '-'}
 </p>
 </div>
 <Badge color="emerald" className="bg-emerald-700 text-emerald-600 font-extrabold">
 {dashboard.latest_tahfizh.score ? `Nilai ${dashboard.latest_tahfizh.score}` : (dashboard.latest_tahfizh.status || 'Tuntas')}
 </Badge>
 </div>
 ) : (
 <div className="rounded-xl border border-dashed border-emerald-200/80 bg-slate-50/50 p-6 text-center dark:border-emerald-800/60 dark:bg-slate-900/50">
 <p className="text-xs text-slate-500 dark:text-slate-400">Belum ada riwayat setoran tahfizh terbaru untuk ananda.</p>
 </div>
 )}
 </div>
 )}

 {/* CONTENT MODUL 3: TARGET & EVALUASI TAHFIZH - RINCIAN AKTUAL */}
 {ringkasanSubTab === 'target' && (
 <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
 {/* Ringkasan Progress Target Semester */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-4.5 dark:border-emerald-800/60 dark:bg-slate-900 shadow-2xs space-y-3">
 <div className="flex flex-wrap items-center justify-between gap-2">
 <div>
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-800 dark:text-blue-300">
 Pencapaian Target Hafalan Semester
 </span>
 <h4 className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
 {dashboard?.tahfizh_evaluation_details?.total_ayat_tercapai || 0} Ayat Tercapai
 {dashboard?.tahfizh_evaluation_details?.target_ayat ? (
 <span className="text-xs font-medium text-slate-500 dark:text-slate-400"> / Target {dashboard.tahfizh_evaluation_details.target_ayat} Ayat</span>
 ) : null}
 </h4>
 </div>
 <div className="flex items-center gap-2">
 <span className="rounded-xl bg-emerald-600 px-3 py-1 text-xs font-black text-white shadow-xs">
 {dashboard?.tahfizh_evaluation_details?.persentase != null ? `${dashboard.tahfizh_evaluation_details.persentase}% Tercapai` : '-'}
 </span>
 </div>
 </div>

 {/* Progress Bar Dinamis */}
 <div className="h-3 w-full overflow-hidden rounded-full bg-blue-100 dark:bg-blue-950/80 p-0.5">
 <div
 className="h-full bg-white dark:bg-[#1B2433] rounded-full transition-all duration-500"
 style={{ width: `${Math.min(100, Math.max(0, dashboard?.tahfizh_evaluation_details?.persentase || 0))}%` }}
 />
 </div>

 {/* Rincian Surah yang Tuntas Mutqin */}
 {Array.isArray(dashboard?.tahfizh_evaluation_details?.surah_tuntas) && dashboard.tahfizh_evaluation_details.surah_tuntas.length > 0 && (
 <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60">
 <span className="text-[10.5px] font-bold text-slate-600 dark:text-slate-300 block mb-1.5">
 Surah yang Telah Tuntas & Mutqin:
 </span>
 <div className="flex flex-wrap gap-1.5">
 {dashboard.tahfizh_evaluation_details.surah_tuntas.map((s, idx) => (
 <span
 key={s.number || idx}
 className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-1 text-xs font-extrabold"
 >
 <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
 <span>QS. {s.name} ({s.number})</span>
 </span>
 ))}
 </div>
 </div>
 )}

 {/* Catatan Riil Pembimbing Tahfizh */}
 <div className="rounded-xl bg-blue-50/80 p-3.5 dark:bg-blue-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center justify-between mb-1">
 <span className="text-xs font-bold text-blue-900 dark:text-blue-200">
 Catatan & Rekomendasi Asatidz Pembimbing:
 </span>
 <span className="text-[10px] text-blue-700/80 dark:text-blue-300/80 font-medium">
 {dashboard?.tahfizh_evaluation_details?.guru_pembimbing || '-'} · {dashboard?.tahfizh_evaluation_details?.tanggal_evaluasi || '-'}
 </span>
 </div>
 <p className="text-xs text-blue-950 dark:text-blue-100 italic leading-relaxed">
 {dashboard?.tahfizh_evaluation_details?.catatan_pembimbing ? `"${dashboard.tahfizh_evaluation_details.catatan_pembimbing}"` : 'Belum ada catatan evaluasi tertulis dari pembimbing.'}
 </p>
 </div>
 </div>

 {/* Riwayat Setoran Ziyadah Terkini */}
 {Array.isArray(dashboard?.tahfizh_evaluation_details?.recent_logs) && dashboard.tahfizh_evaluation_details.recent_logs.length > 0 && (
 <div className="space-y-2">
 <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
 Riwayat Setoran Ziyadah & Muroja'ah Terakhir
 </h5>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
 {dashboard.tahfizh_evaluation_details.recent_logs.map((log, idx) => (
 <div
 key={log.id || idx}
 className="rounded-xl border border-emerald-200/80 bg-slate-50/80 p-3 dark:border-emerald-800/60 dark:bg-slate-900 space-y-1.5"
 >
 <div className="flex items-center justify-between">
 <span className="font-extrabold text-xs text-slate-800 dark:text-slate-100">
 {log.surah} ({log.ayah_range})
 </span>
 <span className="rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-black">
 Tajwid {log.quality}
 </span>
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 italic">
 "{log.notes}"
 </p>
 <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-emerald-200/50 dark:border-emerald-800/60">
 <span>{log.teacher_name}</span>
 <span>{log.date}</span>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 )}

 {/* CONTENT MODUL 4: MONITORING ORANG TUA */}
 {ringkasanSubTab === 'ortu' && (
 <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-purple-50/60 p-4 dark:border-emerald-800/60 dark:bg-purple-950/30 flex flex-wrap items-center justify-between gap-3">
 <div>
 <h4 className="text-xs font-black text-purple-950 dark:text-purple-200">Konfirmasi Pendampingan Wali Murid Harian</h4>
 <p className="text-xs text-purple-800/80 dark:text-purple-300/80 mt-0.5">
 {dashboard?.mutabaah_monitoring?.supervisor_notes
 ? `Catatan Pembimbing: "${dashboard.mutabaah_monitoring.supervisor_notes}"`
 : (dashboard?.mutabaah_monitoring?.status === 'verified' || dashboard?.mutabaah_monitoring?.status === 'finalized'
 ? 'Telah diverifikasi oleh Wali Kelas: Shalat jamaah & tilawah rumah telah divalidasi.'
 : (dashboard?.mutabaah_monitoring ? 'Menunggu konfirmasi dan verifikasi catatan ibadah harian santri oleh Wali Kelas/Musyrif.' : 'Belum ada catatan mutabaah harian yang terekam.'))}
 </p>
 </div>
 <Badge color="purple" className="bg-purple-700 text-emerald-600 font-bold">
 {dashboard?.mutabaah_monitoring?.status === 'verified' || dashboard?.mutabaah_monitoring?.status === 'finalized'
 ? 'Terverifikasi Wali Kelas'
 : (dashboard?.mutabaah_monitoring?.status ? `Status: ${dashboard.mutabaah_monitoring.status}` : 'Belum Ada Data')}
 </Badge>
 </div>
 </div>
 )}
 </section>

 {/* DATA KHUSUS PESANTREN/ASRAMA (TAMPIL JIKA ANAK DI UNIT PESANTREN) */}
 {(activeChild?.is_pesantren || activeChild?.unit_name?.toLowerCase().includes('pesantren') || activeChild?.unit_code === 'PONPES') && (
 <div className="overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-6 shadow-md dark:border-emerald-800/60 dark:bg-amber-950/40">
 <div className="flex flex-wrap items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="flex h-9 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
 <Building2 className="h-6 w-6" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <Badge color="warning" className="bg-amber-600 text-slate-600 font-extrabold">
 Pondok Pesantren / Asrama Santri
 </Badge>
 <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
 {activeChild?.asrama || '-'}
 </span>
 </div>
 <h3 className="mt-1 text-base font-black text-amber-950 dark:text-amber-100">
 Data & Pengawasan Santri Asrama — {activeChild?.full_name}
 </h3>
 </div>
 </div>

 <div className="text-right text-xs text-amber-900 dark:text-amber-200">
 <p>Musyrif Pendamping: <b>{activeChild?.musyrif || activeChild?.mentor_name || '-'}</b></p>
 <p className="text-[10px] text-amber-700 dark:text-amber-400">Pembimbing Asrama Putra/Putri</p>
 </div>
 </div>

 <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3.5 shadow-2xs dark:border-emerald-800/60 dark:bg-slate-900">
 <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase">
 <Moon className="h-4 w-4 text-purple-600" />
 <span>Presensi Qiyamul Lail</span>
 </div>
 <p className="mt-1.5 font-black text-slate-900 dark:text-white">
 {activeChild?.pesantren_details?.presensi_malam || '-'}
 </p>
 </div>

 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3.5 shadow-2xs dark:border-emerald-800/60 dark:bg-slate-900">
 <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase">
 <Sun className="h-4 w-4 text-amber-500" />
 <span>Shalat Subuh Jamaah</span>
 </div>
 <p className="mt-1.5 font-black text-slate-900 dark:text-white">
 {activeChild?.pesantren_details?.shalat_subuh || '-'}
 </p>
 </div>

 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3.5 shadow-2xs dark:border-emerald-800/60 dark:bg-slate-900">
 <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase">
 <Home className="h-4 w-4 text-emerald-600" />
 <span>Kebersihan Kamar</span>
 </div>
 <p className="mt-1.5 font-black text-slate-900 dark:text-white">
 {activeChild?.pesantren_details?.kebersihan_kamar || '-'}
 </p>
 </div>

 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3.5 shadow-2xs dark:border-emerald-800/60 dark:bg-slate-900">
 <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase">
 <Info className="h-4 w-4 text-blue-600" />
 <span>Kesehatan Santri</span>
 </div>
 <p className="mt-1.5 font-black text-slate-900 dark:text-white">
 {activeChild?.pesantren_details?.kesehatan || '-'}
 </p>
 </div>
 </div>
 </div>
 )}

 {/* JADWAL & AKTIVITAS HARI INI (TERINTEGRASI FULLDAY & BOARDING) */}
 <section className="grid gap-6 lg:grid-cols-2 items-stretch">
 {/* A. JADWAL HARI INI */}
 <div className="flex flex-col rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 overflow-hidden">
 <div className="border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-500/10 dark:bg-emerald-950/40 px-5 py-4 flex items-center justify-between gap-3">
 <div className="flex items-center gap-2.5 min-w-0">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
 <CalendarDays className="h-4 w-4 text-white" />
 </div>
 <div className="min-w-0">
 <h3 className="text-xs font-black text-emerald-950 dark:text-emerald-200 leading-tight">
 Jadwal Hari Ini — {activeChild?.full_name || 'Ananda'}
 </h3>
 <p className="text-[10px] font-semibold text-emerald-700/80 dark:text-emerald-400/80 truncate">
 {todaySchedulesData.dateFormatted || 'Hari Ini'} • {activeChild?.unit_name || ''}
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => selectTab('schedules')}
 className="inline-flex items-center gap-1 shrink-0 rounded-xl bg-white/80 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100/80 transition-all dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer"
 >
 <span>Lihat Semua</span>
 <ChevronRight className="h-3 w-3" />
 </button>
 </div>

 <div className="flex-1 p-5 space-y-3">
 {/* Ringkasan Jadwal */}
 {!todaySchedulesData.loading && !todaySchedulesData.error && (
 <div className="grid grid-cols-3 gap-2 text-center">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-2">
 <span className="text-[10px] font-bold text-slate-500 uppercase block">Terjadwal</span>
 <span className="text-sm font-black text-emerald-800 dark:text-emerald-300">{todaySchedulesData.items.length}</span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/60 dark:bg-sky-950/30 p-2">
 <span className="text-[10px] font-bold text-slate-500 uppercase block">Selesai</span>
 <span className="text-sm font-black text-sky-800 dark:text-sky-300">{todaySchedulesData.items.filter((s) => s.status === 'selesai' || s.is_past).length}</span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/60 dark:bg-amber-950/30 p-2">
 <span className="text-[10px] font-bold text-slate-500 uppercase block">Akan Datang</span>
 <span className="text-sm font-black text-amber-800 dark:text-amber-300">{todaySchedulesData.items.filter((s) => s.status !== 'selesai' && !s.is_past).length}</span>
 </div>
 </div>
 )}

 {todaySchedulesData.loading ? (
 <div className="py-8 text-center text-xs text-slate-500">Memuat jadwal hari ini...</div>
 ) : todaySchedulesData.error ? (
 <div className="py-6 text-center text-xs text-rose-600 dark:text-rose-400 border border-dashed border-rose-200 dark:border-rose-800/60 rounded-xl px-4">
 {todaySchedulesData.error}
 </div>
 ) : todaySchedulesData.items.length > 0 ? (
 <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
 {todaySchedulesData.items.map((sch, idx) => {
 const title = sch.activity_name || sch.subject?.name || 'Kegiatan Sekolah'
 const timeLabel = sch.time_display || (sch.time_start && sch.time_end ? `${String(sch.time_start).slice(0, 5)} - ${String(sch.time_end).slice(0, 5)}` : '-')
 const teacherName = sch.teacher?.name || sch.teacher_name || sch.employee?.nama_lengkap || null
 const roomName = sch.room?.name || sch.room_name || null
 const isOngoing = sch.status === 'berlangsung' || sch.is_ongoing
 const isDone = sch.status === 'selesai' || sch.is_past
 return (
 <div key={sch.id || idx} className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 dark:bg-slate-800/40 p-3 text-xs">
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-2">
 <span className="font-mono text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded">{timeLabel}</span>
 <span className="font-bold text-slate-900 dark:text-white truncate">{title}</span>
 </div>
 <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
 {[teacherName ? `PJ: ${teacherName}` : null, roomName ? `Ruang: ${roomName}` : null].filter(Boolean).join(' • ') || 'Sesuai jadwal unit'}
 </p>
 </div>
 <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${
 isOngoing
 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
 : isDone
 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
 : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
 }`}>
 {sch.status_label || (isOngoing ? 'Berlangsung' : (isDone ? 'Selesai' : 'Akan Datang'))}
 </span>
 </div>
 )
 })}
 </div>
 ) : (
 <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-emerald-200/80 dark:border-emerald-800/60 rounded-xl">
 {!activeChild?.class_name && !activeChild?.kelas_id
 ? 'Anak belum memiliki penempatan kelas/jadwal.'
 : 'Belum ada jadwal operasional untuk hari ini.'}
 </div>
 )}
 </div>
 </div>

 {/* B. AKTIVITAS HARI INI (LIVE TIMELINE) */}
 <div className="flex flex-col rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 overflow-hidden">
 <div className="border-b border-emerald-500/20 dark:border-emerald-800/40 bg-teal-500/10 dark:bg-teal-950/40 px-5 py-4 flex items-center justify-between gap-3">
 <div className="flex items-center gap-2.5 min-w-0">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
 <Clock className="h-4 w-4 text-white" />
 </div>
 <div className="min-w-0">
 <h3 className="text-xs font-black text-teal-950 dark:text-teal-200 leading-tight">
 Aktivitas Hari Ini (Live)
 </h3>
 <p className="text-[10px] font-semibold text-teal-700/80 dark:text-teal-400/80 truncate">
 Interaksi Guru, Wali Kelas, Musyrif & Siswa
 </p>
 </div>
 </div>
 <Badge color="success" size="xs">Real-Time</Badge>
 </div>

 <div className="flex-1 p-5 space-y-3">
 {!todayTimeline.loading && !todayTimeline.error && (
 <div className="grid grid-cols-3 gap-2 text-center">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-teal-50/60 dark:bg-teal-950/30 p-2">
 <span className="text-[10px] font-bold text-slate-500 uppercase block">Tercatat</span>
 <span className="text-sm font-black text-teal-800 dark:text-teal-300">{todayTimeline.activities.length}</span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/30 p-2">
 <span className="text-[10px] font-bold text-slate-500 uppercase block">Presensi</span>
 <span className="text-xs font-black text-emerald-800 dark:text-emerald-300 truncate block mt-0.5">
 {dashboard?.attendance_today?.status_label || 'Belum Check-in'}
 </span>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/60 dark:bg-amber-950/30 p-2">
 <span className="text-[10px] font-bold text-slate-500 uppercase block">Mutabaah</span>
 <span className="text-xs font-black text-amber-800 dark:text-amber-300 truncate block mt-0.5">
 {dashboard?.kpi?.mutabaah_status || 'Belum diisi'}
 </span>
 </div>
 </div>
 )}

 {todayTimeline.loading ? (
 <div className="py-8 text-center text-xs text-slate-500">Memuat aktivitas hari ini...</div>
 ) : todayTimeline.error ? (
 <div className="py-6 text-center text-xs text-rose-600 dark:text-rose-400 border border-dashed border-rose-200 dark:border-rose-800/60 rounded-xl px-4">
 {todayTimeline.error}
 </div>
 ) : todayTimeline.activities.length > 0 ? (
 <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
 {todayTimeline.activities.map((act, idx) => (
 <div key={act.id || idx} className="flex items-start gap-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 dark:bg-slate-800/40 p-3 text-xs">
 <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 <CheckCircle2 className="h-3.5 w-3.5" />
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-center justify-between gap-2">
 <span className="font-bold text-slate-900 dark:text-white truncate">{act.title}</span>
 <span className="font-mono text-[10px] text-slate-400 shrink-0">{act.time_label || act.time || '-'}</span>
 </div>
 <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{act.subtitle || act.description || '-'}</p>
 {(act.notes || act.keterangan) && (
 <p className="mt-1 rounded bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] text-amber-800 dark:text-amber-300">
 Catatan: {act.notes || act.keterangan}
 </p>
 )}
 </div>
 {act.badge_label && (
 <span className="shrink-0 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-extrabold">
 {act.badge_label}
 </span>
 )}
 </div>
 ))}
 </div>
 ) : (
 <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-emerald-200/80 dark:border-emerald-800/60 rounded-xl">
 Belum ada aktivitas tercatat hari ini. Interaksi Guru, Wali Kelas, Musyrif, dan Siswa akan tampil di sini.
 </div>
 )}
 </div>
 </div>
 </section>

 {/* Grid Nilai, Kalender Akademik & Pengumuman Terbaru */}
 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-stretch">
 {/* 1. KARTU NILAI RAPOR TERBARU */}
 <div className="flex flex-col rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 overflow-hidden transition-all duration-200">
 <div className="border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-500/10 dark:bg-emerald-950/40 px-5 py-4">
 <div className="flex items-center justify-between gap-2">
 <div className="flex items-center gap-2.5 min-w-0">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
 <Award className="h-4 w-4 text-white" />
 </div>
 <div className="min-w-0">
 <h3 className="text-xs font-black text-emerald-900 dark:text-emerald-200 leading-tight">
 Nilai Rapor Terbaru
 </h3>
 <p className="text-[10px] font-semibold text-emerald-700/80 dark:text-emerald-400/80 truncate max-w-[140px]">
 {activeChild?.full_name}
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => selectTab('grades')}
 className="inline-flex items-center gap-1 shrink-0 rounded-xl bg-white/80 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-emerald-100/80 transition-all dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer"
 >
 <span>Semua</span>
 <ChevronRight className="h-3 w-3" />
 </button>
 </div>
 </div>

 <div className="flex-1 p-5 flex flex-col justify-between space-y-4">
 {Array.isArray(dashboard?.latest_grades) && dashboard.latest_grades.length > 0 ? (
 <div className="space-y-2.5">
 {dashboard.latest_grades.slice(0, 4).map((g, idx) => {
 const score = g.final_score != null ? g.final_score : (g.nilai_akhir != null ? g.nilai_akhir : (g.score != null ? g.score : null))
 const predikat = g.predikat || g.predicate || g.grade_letter || null
 const periodLabel = [g.semester || dashboard?.academic_context?.semester, g.academic_year || dashboard?.academic_context?.academic_year].filter(Boolean).join(' ')
 return (
 <div
 key={g.id || idx}
 className="group flex items-center justify-between rounded-xl bg-slate-50/90 p-3 dark:bg-slate-800/60 border border-emerald-200/80 dark:border-emerald-700/80/60 hover:border-emerald-300 dark:hover:border-emerald-700/80 transition-all"
 >
 <div className="flex items-center gap-2.5 min-w-0 pr-2">
 <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 font-black text-xs border border-emerald-200/80 dark:border-emerald-800/60">
 {idx + 1}
 </div>
 <div className="min-w-0">
 <span className="block font-bold text-slate-800 dark:text-slate-100 text-xs truncate">
 {g.subject_name || g.subject?.name || g.nama_mapel || '-'}
 </span>
 <span className="text-[10px] text-slate-400 font-medium">
 {[periodLabel, predikat ? `Predikat ${predikat}` : null].filter(Boolean).join(' · ') || '-'}
 </span>
 </div>
 </div>
 <div className="shrink-0 flex items-center gap-1.5">
 <span className="inline-flex items-center justify-center rounded-xl bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white px-3 py-1 text-xs font-black shadow-xs">
 {score !== null && score !== undefined ? score : '-'}
 </span>
 </div>
 </div>
 )
 })}
 </div>
 ) : (
 <div className="py-8 text-center space-y-2">
 <Award className="mx-auto h-9 w-9 text-emerald-300 dark:text-emerald-700" />
 <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
 Belum ada rekapitulasi nilai rapor terbaru untuk ananda <b>{activeChild?.full_name}</b>.
 </p>
 <p className="text-xs text-slate-400 max-w-xs mx-auto">
 Penilaian capaian kompetensi {dashboard?.academic_context?.semester ? dashboard.academic_context.semester.toLowerCase() : 'periode ini'} {dashboard?.academic_context?.academic_year ? `TA ${dashboard.academic_context.academic_year}` : ''} sedang berlangsung oleh dewan guru/asatidz.
 </p>
 </div>
 )}

 <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-between text-xs text-slate-500 font-medium">
 <span>Mata Pelajaran: <b>{dashboard?.latest_grades?.length || 0} Mapel</b></span>
 <button
 type="button"
 onClick={() => selectTab('grades')}
 className="text-emerald-700 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
 >
 Buka Rapor Lengkap →
 </button>
 </div>
 </div>
 </div>

 {/* 2. KARTU KALENDER AKADEMIK UNIT SISWA */}
 <div className="flex flex-col rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 overflow-hidden transition-all duration-200">
 <div className="border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-500/10 dark:bg-emerald-950/40 px-5 py-4">
 <div className="flex items-center justify-between gap-2">
 <div className="flex items-center gap-2.5 min-w-0">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-xs">
 <CalendarDays className="h-4 w-4 text-white" />
 </div>
 <div className="min-w-0">
 <h3 className="text-xs font-black text-emerald-900 dark:text-emerald-200 leading-tight">
 Kalender Akademik
 </h3>
 {childUnitName ? (
 <p className="text-[10px] font-semibold text-emerald-700/80 dark:text-emerald-400/80 truncate max-w-[140px]">
 {childUnitName}
 </p>
 ) : null}
 </div>
 </div>
 <button
 type="button"
 onClick={() => setIsCalendarModalOpen(true)}
 className="inline-flex items-center gap-1 shrink-0 rounded-xl bg-white/80 px-2.5 py-1 text-xs font-bold text-cyan-700 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-cyan-100/80 transition-all dark:bg-cyan-950/60 dark:text-cyan-300 cursor-pointer"
 >
 <span>Lihat</span>
 <ChevronRight className="h-3 w-3" />
 </button>
 </div>
 </div>

 <div className="flex-1 p-5 flex flex-col justify-between space-y-3.5 text-xs">
 <div className="space-y-3">
 <div className="rounded-xl bg-cyan-50/80 p-3 text-xs text-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-200 border border-emerald-200/80 dark:border-emerald-800/60 leading-relaxed">
 <div className="flex items-center gap-1.5 font-bold mb-1">
 <Info className="h-3.5 w-3.5 text-cyan-700 dark:text-cyan-400 shrink-0" />
 <span>Agenda Resmi {[dashboard?.academic_context?.semester, dashboard?.academic_context?.academic_year].filter(Boolean).join(' ') || (childUnitName || '-')}</span>
 </div>
 <p className="text-[10.5px] text-cyan-800/90 dark:text-cyan-300/90">
 Menampilkan jadwal resmi pembelajaran, penilaian, dan libur akademik{childUnitName ? <> khusus <b>{childUnitName}</b></> : ''}.
 </p>
 </div>

 {/* Preview Agenda Penting Mendatang dari Database */}
 <div className="space-y-2">
 {Array.isArray(dashboard?.upcoming_calendar_events) && dashboard.upcoming_calendar_events.length > 0 ? (
 dashboard.upcoming_calendar_events.map((ev, idx) => {
 const colorKey = ev.color || (ev.category === 'ujian' ? 'purple' : ev.category === 'mulai_kbm' ? 'emerald' : ev.category === 'libur_sekolah' ? 'rose' : ev.category === 'libur_semester' ? 'amber' : ev.category === 'terima_rapor' ? 'indigo' : 'cyan')
 const dotColor = colorKey === 'purple' ? 'bg-purple-500' : colorKey === 'emerald' ? 'bg-emerald-500' : colorKey === 'rose' ? 'bg-rose-500' : colorKey === 'amber' ? 'bg-amber-500' : colorKey === 'indigo' ? 'bg-indigo-500' : 'bg-cyan-500'
 const badgeColor = colorKey === 'purple'
 ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
 : colorKey === 'emerald'
 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
 : colorKey === 'rose'
 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
 : colorKey === 'amber'
 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
 : colorKey === 'indigo'
 ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
 : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300'
 return (
 <div
 key={ev.id || idx}
 onClick={() => setIsCalendarModalOpen(true)}
 className="group cursor-pointer flex items-center justify-between rounded-xl bg-slate-50/90 p-2.5 dark:bg-slate-800/60 border border-emerald-200/80 dark:border-emerald-700/80/60 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-all"
 >
 <div className="flex items-center gap-2 min-w-0 pr-2">
 <span className={`h-2 w-2 rounded-full shrink-0 ${dotColor}`} />
 <div className="truncate">
 <p className="font-bold text-slate-800 dark:text-slate-100 text-xs truncate group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
 {ev.title}
 </p>
 <p className="text-[10px] text-slate-400 truncate">
 {ev.notes || ev.category || '-'}
 </p>
 </div>
 </div>
 <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[9px] font-black ${badgeColor}`}>
 {ev.date_label}
 </span>
 </div>
 )
 })
 ) : (
 <div className="py-4 text-center text-slate-400 text-xs">
 Belum ada jadwal agenda mendatang.
 </div>
 )}
 </div>
 </div>

 <button
 type="button"
 onClick={() => setIsCalendarModalOpen(true)}
 className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 text-white border-2 border-cyan-500 font-black text-xs py-2.5 px-4 shadow-md shadow-cyan-600/20 transition-all active:scale-95 cursor-pointer mt-2"
 >
 <CalendarDays className="h-4 w-4" />
 <span>Buka Kalender Akademik{childUnitName ? ` ${childUnitName}` : ''}</span>
 </button>
 </div>
 </div>

 {/* 3. KARTU PENGUMUMAN TERBARU UNIT */}
 <div className="flex flex-col rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 overflow-hidden transition-all duration-200">
 <div className="border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-500/10 dark:bg-emerald-950/40 px-5 py-4">
 <div className="flex items-center justify-between gap-2">
 <div className="flex items-center gap-2.5 min-w-0">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-600 text-white shadow-xs">
 <Megaphone className="h-4 w-4 text-white" />
 </div>
 <div className="min-w-0">
 <h3 className="text-xs font-black text-emerald-900 dark:text-emerald-200 leading-tight">
 Pengumuman Unit
 </h3>
 {childUnitName ? (
 <p className="text-[10px] font-semibold text-emerald-700/80 dark:text-emerald-400/80 truncate max-w-[140px]">
 {childUnitName}
 </p>
 ) : null}
 </div>
 </div>
 <button
 type="button"
 onClick={() => selectTab('announcements')}
 className="inline-flex items-center gap-1 shrink-0 rounded-xl bg-white/80 px-2.5 py-1 text-xs font-bold text-teal-700 border border-emerald-200/80 dark:border-emerald-800/60 hover:bg-teal-100/80 transition-all dark:bg-teal-950/60 dark:text-teal-300 cursor-pointer"
 >
 <span>Semua</span>
 <ChevronRight className="h-3 w-3" />
 </button>
 </div>
 </div>

 <div className="flex-1 p-5 flex flex-col justify-between space-y-3.5 text-xs">
 <div className="space-y-2.5">
 {activeChildAnnouncements.slice(0, 3).map((a) => {
 const targetUnit = a.education_unit || a.unit_name || a.data_tambahan?.unit_name || (childUnitName || null)
 const category = a.category || a.data_tambahan?.kategori || a.kategori || 'Pengumuman'
 const title = a.title || a.judul_pengumuman || '-'
 const summary = a.summary || a.content || a.data_tambahan?.ringkasan || a.isi_pengumuman || ''
 return (
 <div
 key={a.id}
 onClick={() => selectTab('announcements')}
 className="group cursor-pointer rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-teal-50/40 p-3 dark:border-emerald-800/60 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/80 transition-all"
 >
 <div className="flex items-center justify-between gap-2 mb-1">
 <span className="shrink-0 rounded-md bg-teal-100 px-2 py-0.5 text-[9px] font-black text-teal-800 dark:bg-teal-950 dark:text-teal-300">
 {category}
 </span>
 {targetUnit ? (
 <span className="shrink-0 rounded-md bg-emerald-100/80 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 truncate max-w-[170px]">
 {targetUnit}
 </span>
 ) : null}
 </div>
 <b className="block text-slate-900 dark:text-white font-extrabold text-xs leading-snug group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors line-clamp-1">
 {title}
 </b>
 <p className="mt-1 line-clamp-2 text-slate-500 dark:text-slate-400 text-[10.5px] leading-relaxed">
 {summary}
 </p>
 </div>
 )
 })}

 {!activeChildAnnouncements.length && (
 <div className="py-8 text-center space-y-2">
 <Megaphone className="mx-auto h-9 w-9 text-teal-300 dark:text-teal-700" />
 <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
 Belum ada pengumuman khusus{childUnitName ? ` untuk unit ${childUnitName}` : ''}.
 </p>
 <p className="text-xs text-slate-400">
 Pengumuman resmi dari madrasah/sekolah akan tampil secara otomatis di sini.
 </p>
 </div>
 )}
 </div>

 <button
 type="button"
 onClick={() => selectTab('announcements')}
 className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white border-2 border-emerald-500 font-black text-xs py-2.5 px-4 shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer mt-2"
 >
 <Megaphone className="h-4 w-4" />
 <span>Buka Pusat Informasi{childUnitName ? ` ${childUnitName}` : ''}</span>
 </button>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* OTHER WORKSPACE TAB RENDERS */}
 {active === 'profile' && (
 <StudentProfileWorkspace
 student={{ ...(activeChild || {}), ...(typeof records === 'object' && !Array.isArray(records) ? records : {}) }}
 dashboard={dashboard || {}}
 onNavigate={selectTab}
 readOnly={false}
 onPhotoUpdated={handlePhotoUpdated}
 />
 )}

 {active === 'calendar' && (
 <div className="space-y-4">
 <div className="rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] shadow-md shadow-emerald-500/10 overflow-hidden">
 <div className="border-b border-emerald-500/20 dark:border-emerald-800/40 bg-emerald-500/10 dark:bg-emerald-950/40 px-5 py-4 flex flex-wrap items-center justify-between gap-4">
 <div className="flex items-center gap-3">
 <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-xs">
 <CalendarDays className="h-5 w-5 text-white" />
 </div>
 <div>
 <h2 className="text-base font-bold text-emerald-900 dark:text-emerald-200 leading-tight">
 Kalender Akademik{childUnitName ? ` Unit: ${childUnitName}` : ''}
 </h2>
 <p className="mt-0.5 text-xs font-semibold text-emerald-700/80 dark:text-emerald-400/80">
 Jadwal resmi kegiatan belajar mengajar, penilaian, libur semester, dan agenda penting khusus ananda {activeChild?.full_name}.
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setIsCalendarModalOpen(true)}
 className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-black shadow-xs transition hover:scale-[1.02] cursor-pointer"
 >
 <CalendarDays className="h-4 w-4" />
 <span>Buka Kalender Interaktif</span>
 </button>
 </div>

 {/* Kalender Embed Preview */}
 <div className="p-6 text-center py-10">
 <CalendarDays className="mx-auto h-9 w-12 text-cyan-600 dark:text-cyan-400" />
 <h3 className="mt-3 text-base font-black text-slate-900 dark:text-white">
 Kalender Akademik & Agenda Kegiatan{childUnitName ? ` ${childUnitName}` : ''}
 </h3>
 <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
 Data kalender telah difilter khusus{childUnitName ? ` untuk unit ${childUnitName}` : ''}. Anda dapat melihat tampilan bulanan, mingguan, serta daftar agenda lengkap dengan membuka kalender interaktif.
 </p>
 <button
 type="button"
 onClick={() => setIsCalendarModalOpen(true)}
 className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-black text-white shadow-md transition hover:bg-emerald-700 cursor-pointer"
 >
 <CalendarDays className="h-4 w-4" />
 Buka Kalender Akademik{childUnitName ? ` ${childUnitName}` : ''}
 </button>
 </div>
 </div>
 </div>
 )}

 {active === 'announcements' && (
 <SchoolInformationWorkspace studentId={childId} student={activeChild} embedded />
 )}

 {!(activeChild?.portal_gate?.allowed === false || childGate?.allowed === false || childGate?.gate_blocked) && (
 <>
 {active === 'schedules' && (
 <ClassScheduleWorkspace schedules={records} loading={loading} activeChild={activeChild} />
 )}

 {active === 'materials' && (
 <MaterialsWorkspace materials={records} loading={loading} student={activeChild} />
 )}

 {active === 'assignments' && (
 <AssignmentsWorkspace
 assignments={records}
 isParent={true}
 canSubmit={Boolean(isChildSD)}
 onSubmitAssignment={handleAssignmentSubmit}
 loading={loading}
 student={activeChild}
 />
 )}

 {active === 'tahfizh' && (
 <TahfizhWorkspace
 logs={records}
 target={dashboard?.tahfizh_target}
 achievement={tahfizhAchievement}
 pendingHomeMurajaah={dashboard?.pending_home_murajaah}
 loading={loading}
 student={activeChild}
 onMurajaahSubmitted={load}
 />
 )}

 {active === 'bahasa' && (
 <BahasaWorkspace student={activeChild} loading={loading} />
 )}

 {active === 'grades' && (
 <GradesWorkspace grades={records} loading={loading} student={activeChild} />
 )}

 {active === 'student-notes' && (
 <TeacherCommentsWorkspace
 comments={records}
 loading={loading}
 childId={childId}
 isParent
 onSigned={load}
 student={activeChild}
 />
 )}

 {active === 'discipline' && (
 <DisciplineSummaryWorkspace childId={childId} />
 )}

 {active === 'mutabaah' && (
 <MutabaahWorkspace
 studentId={childId}
 student={activeChild}
 mutabaah={records?.today || null}
 recapData={records || null}
 isParent={true}
 loading={loading}
 onReload={load}
 />
 )}

 {active === 'attendance' && (
 <AttendanceWorkspace
 attendanceLogs={records}
 permissionsHistory={permissionsRecords}
 onSubmitPermission={handleSubmitPermissionFromWorkspace}
 canSubmitPermission={true}
 isParent={true}
 loading={loading}
 student={activeChild}
 childId={childId}
 onReload={load}
 />
 )}

 {active === 'kisi' && (
 <ExamGridsWorkspace grids={examGridsRecords} loading={loading} student={activeChild} isParent={true} />
 )}

 {active === 'ujian' && (
 <CbtExamsWorkspace lmsData={cbtOverview} isParent={true} loading={loading} student={activeChild} />
 )}

 {active === 'hasil' && (
 <ExamResultsWorkspace resultsData={resultsData} reports={reportsRecords} loading={loading} student={activeChild} />
 )}
 </>
 )}

 {active === 'bills' && (
 <ParentBillsWorkspace
 bills={records}
 loading={loading}
 student={activeChild}
 onRefresh={load}
 sipdeiStatus={billsMeta?.sipdeiStatus}
 sipdeiMessage={billsMeta?.message}
 studentContext={billsMeta?.studentContext}
 sipdeiMeta={billsMeta?.sipdeiMeta}
 />
 )}

 {(activeChild?.portal_gate?.allowed === false || childGate?.allowed === false || childGate?.gate_blocked) && ['schedules', 'materials', 'assignments', 'tahfizh', 'bahasa', 'grades', 'student-notes', 'discipline', 'mutabaah', 'attendance', 'kisi', 'ujian', 'hasil'].includes(active) && (
 <PortalGateLockBanner
 gate={childGate || activeChild?.portal_gate}
 onOpenBills={() => selectTab('bills')}
 onOpenChat={() => selectTab('chat')}
 onRefresh={() => {
 api.get('/portal/access-status', { headers: { 'X-Child-Id': childId } })
 .then((res) => { if (res.data?.data) setChildGate(res.data.data) })
 .catch(() => {})
 load()
 }}
 />
 )}

 {/* CHAT GURU & MUSYRIF WORKSPACE (INTEGRATED FOR ACTIVE CHILD'UNIT) */}
 {active === 'chat' && (
 <ChatGuruWorkspace
 mode="parent"
 childId={childId}
 childrenList={children}
 onSelectChild={selectChild}
 />
 )}
 </section>
 )}

 {/* MODAL KALENDER AKADEMIK (TERKUNCI KE UNIT SISWA ORANG TUA) */}
 <AcademicCalendarModal
 isOpen={isCalendarModalOpen}
 onClose={() => setIsCalendarModalOpen(false)}
 lockedUnit={childUnitName || activeChild?.unit_name || ''}
 />
 </div>
 )
}
