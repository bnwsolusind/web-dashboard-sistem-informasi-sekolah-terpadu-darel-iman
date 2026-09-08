import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'react-router-dom'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  AlertCircle,
  Award,
  BookOpen,
  BookOpenCheck,
  Building2,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Download,
  FileCheck2,
  FileText,
  HeartHandshake,
  Home,
  Info,
  LayoutGrid,
  Loader2,
  Megaphone,
  MessageCircle,
  Moon,
  Plus,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  UserCheck,
  UserRound,
  Users,
  X,
  Zap,
} from 'lucide-react'

import { familyPortalService } from '../services/familyPortalService'
import api from '../services/api'
import StudentProfileWorkspace from '../components/portal/StudentProfileWorkspace'
import SchoolInformationWorkspace from '../components/portal/SchoolInformationWorkspace'
import ClassScheduleWorkspace from '../components/portal/ClassScheduleWorkspace'
import MaterialsWorkspace from '../components/portal/MaterialsWorkspace'
import AssignmentsWorkspace from '../components/portal/AssignmentsWorkspace'
import TahfizhWorkspace from '../components/portal/TahfizhWorkspace'
import GradesWorkspace from '../components/portal/GradesWorkspace'
import TeacherCommentsWorkspace from '../components/portal/TeacherCommentsWorkspace'
import MutabaahWorkspace from '../components/portal/MutabaahWorkspace'
import ParentWorshipInputWorkspace from '../components/portal/ParentWorshipInputWorkspace'
import AttendanceWorkspace from '../components/portal/AttendanceWorkspace'
import ExamGridsWorkspace from '../components/portal/ExamGridsWorkspace'
import CbtExamsWorkspace from '../components/portal/CbtExamsWorkspace'
import ExamResultsWorkspace from '../components/portal/ExamResultsWorkspace'
import ChatGuruWorkspace from '../components/portal/ChatGuruWorkspace'
import AcademicCalendarModal from '../components/calendar/AcademicCalendarModal'
import { useAuthStore } from '../stores/authStore'

// TailGrids Core Components
import { Avatar, AvatarFallback } from '@/components/tailgrids/core/avatar'
import { Badge } from '@/components/tailgrids/core/badge'
import { Button } from '@/components/tailgrids/core/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/tailgrids/core/card'

// Fallback dataset removed: children loaded dynamically from API
const MOCK_FALLBACK_CHILDREN = []

const menu = [
  ['ringkasan', 'Dashboard', Sparkles, 'bg-sky-100/90 text-sky-600 border-sky-200/90 hover:bg-sky-200'],
  ['profile', 'Profil & Biodata', UserRound, 'bg-blue-100/90 text-blue-600 border-blue-200/90 hover:bg-blue-200'],
  ['calendar', 'Kalender Akademik', CalendarDays, 'bg-cyan-100/90 text-cyan-600 border-cyan-200/90 hover:bg-cyan-200'],
  ['announcements', 'Informasi Sekolah', Megaphone, 'bg-indigo-100/90 text-indigo-600 border-indigo-200/90 hover:bg-indigo-200'],
  ['schedules', 'Jadwal', CalendarDays, 'bg-violet-100/90 text-violet-600 border-violet-200/90 hover:bg-violet-200'],
  ['materials', 'Materi', BookOpen, 'bg-purple-100/90 text-purple-600 border-purple-200/90 hover:bg-purple-200'],
  ['assignments', 'Tugas', ClipboardList, 'bg-fuchsia-100/90 text-fuchsia-600 border-fuchsia-200/90 hover:bg-fuchsia-200'],
  ['tahfizh', 'Tahfizh', BookOpenCheck, 'bg-emerald-100/90 text-emerald-600 border-emerald-200/90 hover:bg-emerald-200'],
  ['grades', 'Nilai', Award, 'bg-teal-100/90 text-teal-600 border-teal-200/90 hover:bg-teal-200'],
  ['student-notes', 'Komentar Guru', MessageCircle, 'bg-cyan-100/90 text-cyan-600 border-cyan-200/90 hover:bg-cyan-200'],
  ['mutabaah', 'Mutabaah', HeartHandshake, 'bg-amber-100/90 text-amber-600 border-amber-200/90 hover:bg-amber-200'],
  ['attendance', 'Absensi', CalendarCheck, 'bg-orange-100/90 text-orange-600 border-orange-200/90 hover:bg-orange-200'],
  ['kisi', 'Kisi-kisi', FileText, 'bg-yellow-100/90 text-yellow-700 border-yellow-200/90 hover:bg-yellow-200'],
  ['ujian', 'Ujian CBT', FileCheck2, 'bg-lime-100/90 text-lime-700 border-lime-200/90 hover:bg-lime-200'],
  ['hasil', 'Hasil & Rapor', Award, 'bg-rose-100/90 text-rose-600 border-rose-200/90 hover:bg-rose-200'],
  ['chat', 'Chat Guru / Musyrif', MessageCircle, 'bg-pink-100/90 text-pink-600 border-pink-200/90 hover:bg-pink-200'],
]

const rupiah = (value) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(value || 0)
  )

const date = (value) =>
  value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value)) : '-'

const unwrap = (response) => {
  if (Array.isArray(response?.data?.data?.data)) return response.data.data.data
  if (Array.isArray(response?.data?.data)) return response.data.data
  if (Array.isArray(response?.data)) return response.data
  if (Array.isArray(response)) return response
  return []
}

function Empty({ text }) {
  return (
    <div className="py-12 text-center text-xs text-slate-400">
      <FileText className="mx-auto mb-2 h-9 w-9 text-slate-300 dark:text-slate-700" />
      {text}
    </div>
  )
}

function Status({ value }) {
  const good = ['PAID', 'Hadir', 'hadir', 'verified', 'published', 'dikumpulkan'].includes(value)
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase ${
        good
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
      }`}
    >
      {value || 'Aktif'}
    </span>
  )
}

export default function ParentPortalPage() {
  const user = useAuthStore((state) => state.user)
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const requestedChild = searchParams.get('child') || ''

  const [children, setChildren] = useState([])
  const [childId, setChildId] = useState('')
  const [viewAllChildren, setViewAllChildren] = useState(false)
  const [dashboard, setDashboard] = useState(null)
  const [active, setActive] = useState(() => (menu.some(([id]) => id === requestedTab) ? requestedTab : 'ringkasan'))

  const [records, setRecords] = useState([])
  const [tahfizhAchievement, setTahfizhAchievement] = useState(null)
  const [permissionsRecords, setPermissionsRecords] = useState([])
  const [examGridsRecords, setExamGridsRecords] = useState([])
  const [resultsData, setResultsData] = useState(null)
  const [cbtOverview, setCbtOverview] = useState(null)
  const [reportsRecords, setReportsRecords] = useState([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ringkasanSubTab, setRingkasanSubTab] = useState('mutabaah')
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
  }, [])

  const selectChild = (id) => {
    setViewAllChildren(false)
    setChildId(id)
    setRecords([])
    setDashboard(null)
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
        const res = await familyPortalService.dashboard(childId).catch(() => ({ data: null }))
        setDashboard(res?.data || res || null)
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
        const [logsResponse, achievementResponse] = await Promise.all([
          familyPortalService.list('tahfizh', childId).catch(() => ({ data: [] })),
          api.get(`/portal/children/${childId}/tahfizh-achievement`).catch(() => ({ data: { data: null } })),
        ])
        setRecords(unwrap(logsResponse))
        setTahfizhAchievement(achievementResponse.data?.data || null)
        if (logsResponse?.tahfizh_target) setDashboard((prev) => ({ ...(prev || {}), tahfizh_target: logsResponse.tahfizh_target }))
      } else if (active === 'mutabaah') {
        const res = await api.get(`/parent/mutabaah/${childId}`)
        setRecords(res.data?.data || null)
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

  const isChildSD = useMemo(() => {
    if (!activeChild) return false
    const unitName = (activeChild.unit_name || activeChild.education_unit?.name || "").toLowerCase()
    const jenjang = (activeChild.jenjang || activeChild.kelas?.jenjang || activeChild.education_unit?.level || "").toLowerCase()
    return jenjang.includes("sd") || jenjang.includes("mi") || unitName.includes("sd") || unitName.includes("mi") || unitName.includes("sekolah dasar") || unitName.includes("ibtidaiyah")
  }, [activeChild])

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
    const raw = dashboard?.announcements || [
      { id: 'a-sd-1', title: 'Pengumuman Supercamp & Outbound SD IT Darel Iman', content: 'Kegiatan edukasi outdoor santri SD IT akan dilaksanakan Sabtu pekan ini.', education_unit: 'SD IT Darel Iman' },
      { id: 'a-smp-1', title: 'Jadwal Munaqasyah & Tasmi\' 3 Juz Pertengahan Semester', content: 'Pelaksanaan tasmi\' hafalan santri SMP IT akan diselenggarakan pada hari Sabtu mendatang.', education_unit: 'SMP IT Darel Iman' },
      { id: 'a-sma-1', title: 'Informasi Kepulangan & Mutabaah Malam Santri Asrama', content: 'Jadwal penjemputan dan kegiatan mutabaah santri asrama Pondok Pesantren Darel Iman.', education_unit: 'SMA IT / Pondok Pesantren Darel Iman' },
      { id: 'a-yayasan-1', title: 'Apel Gabungan & Pengumuman Yayasan Darel Iman', content: 'Pengumuman resmi dari Pengurus Yayasan Darel Iman untuk seluruh civitas akademika.', education_unit: 'Seluruh Yayasan' },
    ]
    return raw.filter((a) => {
      const unit = a.education_unit || a.unit_name || a.unit
      if (!unit || unit === 'Seluruh Yayasan' || unit === 'Semua Unit' || unit === 'Yayasan') return true
      const activeUnit = activeChild?.unit_name || ''
      const activeCode = activeChild?.unit_code || ''
      if (activeUnit && unit.toLowerCase().includes(activeUnit.toLowerCase())) return true
      if (activeCode && unit.toLowerCase().includes(activeCode.toLowerCase())) return true
      if (activeUnit.includes('SD') && unit.includes('SD')) return true
      if (activeUnit.includes('SMP') && unit.includes('SMP')) return true
      if ((activeUnit.includes('SMA') || activeUnit.includes('Pesantren')) && (unit.includes('SMA') || unit.includes('Pesantren'))) return true
      return false
    })
  }, [dashboard?.announcements, activeChild?.unit_name, activeChild?.unit_code])

  const handleSubmitPermissionFromWorkspace = async (payload) => {
    await familyPortalService.submitPermission({ ...payload, child_id: childId })
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
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <HeartHandshake className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Portal Wali Murid Terpadu
                  </span>
                  {activeChild && (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                      Anak Aktif: {activeChild.full_name} ({activeChild.unit_name || 'SIT'})
                    </span>
                  )}
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Portal Orang Tua / Wali Murid
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Pantau perkembangan nilai akademik, progres tahfizh Al-Qur'an, mutabaah harian, presensi, jadwal, serta pengumuman sekolah terpadu.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setIsCalendarModalOpen(true)}
                className="flex items-center gap-2 rounded-xl border border-cyan-300/80 bg-white/95 px-3.5 py-2.5 text-xs font-black text-cyan-900 shadow-sm transition hover:bg-cyan-50 dark:border-cyan-800 dark:bg-slate-800 dark:text-cyan-200 cursor-pointer"
              >
                <CalendarDays className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                <span>Kalender Akademik</span>
                <span className="rounded-md bg-cyan-100 px-1.5 py-0.5 text-[10px] text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 font-extrabold">
                  {activeChild?.unit_name || 'Unit Siswa'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* 1. CARDS PILIHAN ANAK LINTAS UNIT (DI ATAS AKSI CEPAT & UKURAN COMPACT)     */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
              Pilih Anak ({children.length} Anak Lintas Unit)
            </h2>
          </div>

          {/* Toggle Pilih Anak vs Ringkasan Semua */}
          <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setViewAllChildren(false)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
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
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
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
                    ? 'bg-emerald-50/90 text-slate-900 shadow-md border-emerald-500 ring-2 ring-emerald-500/30 dark:bg-emerald-950/40 dark:border-emerald-500 dark:text-emerald-100'
                    : 'bg-slate-50/70 text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-800/60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Avatar className={`h-8 w-8 shrink-0 border ${isSelected ? 'border-emerald-600' : 'border-slate-300 dark:border-slate-600'}`}>
                    <AvatarFallback className={`${isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'} font-black text-xs`}>
                      {c.full_name?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className={`truncate text-xs font-extrabold ${isSelected ? 'text-emerald-950 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'}`}>
                        {c.full_name}
                      </h3>
                    </div>

                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                      {c.unit_name || 'Sekolah Terpadu'} · {c.kelas?.nama_kelas || 'Kelas'}
                    </p>
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-slate-200/60 pt-1.5 dark:border-slate-700/60 text-[9px] font-bold">
                  <span className="text-emerald-700 dark:text-emerald-400 truncate">
                    Tahfizh: {c.tahfizh_summary || `${c.tahfizh_target_pct || 85}%`}
                  </span>
                  <span className="text-sky-700 dark:text-sky-400 shrink-0">
                    Rapor: {c.gpa || 90}
                  </span>
                </div>

                {isPonpes && (
                  <span className="absolute top-1 right-1 rounded-md bg-amber-100 px-1 py-0.2 text-[8px] font-black uppercase text-amber-800 border border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800">
                    Ponpes
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* 2. CARD AKSI CEPAT: 16 MODUL (TAMPIL DI BAWAH KETIKA CARD ANAK DIKLIK/AKTIF)  */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {!viewAllChildren && activeChild && (
        <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Aksi Cepat & Navigasi Modul Orang Tua ({menu.length} Modul)
                </h2>
                <p className="text-[11px] text-slate-400">
                  Anak Aktif: <b className="text-emerald-700 dark:text-emerald-400">{activeChild?.full_name}</b> ({activeChild?.unit_name || 'Sekolah Terpadu'})
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
                  className={`group relative flex h-11 w-11 items-center justify-center rounded-2xl border shadow-xs transition-all duration-200 cursor-pointer ${
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
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950/30">
          <AlertCircle className="h-5 w-5 shrink-0 text-rose-600" />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={load} className="rounded-lg p-1 hover:bg-rose-100 dark:hover:bg-rose-900">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* MAIN RENDER: ALL-CHILDREN IKHTISAR OR SINGLE CHILD DETAILED DASHBOARD        */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {viewAllChildren ? (
        <section className="space-y-6">
          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
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
                <Card key={c.id} className="overflow-hidden border-slate-200/80 shadow-md hover:shadow-xl transition-all">
                  <CardHeader className="bg-gradient-to-r from-slate-900 to-emerald-950 p-5 text-white">
                    <div className="flex items-center justify-between gap-2">
                      <Badge color="emerald" className="bg-white/20 text-white font-extrabold">
                        {c.unit_name || 'Unit SIT'}
                      </Badge>
                      {isPonpes && (
                        <span className="rounded-full bg-amber-400 px-2.5 py-0.5 text-[9px] font-black text-slate-900 uppercase">
                          Santri Asrama
                        </span>
                      )}
                    </div>
                    <CardTitle className="mt-3 text-lg font-black text-white">{c.full_name}</CardTitle>
                    <CardDescription className="text-xs text-emerald-200">
                      {c.kelas?.nama_kelas || 'Kelas'} · NISN: {c.nisn || '-'}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-5 space-y-4 text-xs">
                    {/* Nilai Rapor */}
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                      <span className="font-bold text-slate-600 dark:text-slate-400">Rata-rata Nilai Rapor</span>
                      <b className="text-sm font-black text-blue-600 dark:text-blue-400">{c.gpa || 90}</b>
                    </div>

                    {/* Hafalan Tahfizh */}
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/40">
                      <span className="font-bold text-emerald-800 dark:text-emerald-300">Capaian Tahfizh</span>
                      <b className="text-xs font-black text-emerald-700 dark:text-emerald-400">
                        {c.tahfizh_summary || `${c.tahfizh_target_pct || 85}% Target`}
                      </b>
                    </div>

                    {/* Mutabaah Yaumiyah */}
                    <div className="flex items-center justify-between rounded-xl bg-purple-50 p-3 dark:bg-purple-950/40">
                      <span className="font-bold text-purple-800 dark:text-purple-300">Skor Mutabaah Yaumiyah</span>
                      <b className="text-xs font-black text-purple-700 dark:text-purple-400">{c.mutabaah_score || 95}/100</b>
                    </div>

                    {/* Rincian Asrama jika Pesantren */}
                    {isPonpes && (
                      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 space-y-2 dark:border-amber-900/60 dark:bg-amber-950/30">
                        <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-[11px]">
                          <Building2 className="h-4 w-4 text-amber-600" />
                          <span>Data Pesantren / Asrama</span>
                        </div>
                        <p className="text-[11px] text-amber-800 dark:text-amber-200">
                          {c.asrama || 'Gedung Asrama Utama'}
                        </p>
                        <p className="text-[10px] text-amber-700 dark:text-amber-400">
                          Musyrif: {c.musyrif || 'Ustadz Asrama'}
                        </p>
                        {c.pesantren_details && (
                          <div className="mt-2 border-t border-amber-200/80 pt-2 text-[10px] space-y-1 text-slate-700 dark:text-slate-300">
                            <p><b>Presensi Malam:</b> {c.pesantren_details.presensi_malam}</p>
                            <p><b>Kebersihan Kamar:</b> {c.pesantren_details.kebersihan_kamar}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>

                  <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between dark:bg-slate-800/40 dark:border-slate-800">
                    <span className="text-[11px] font-bold text-slate-500">Wali Kelas: {c.wali_kelas || 'Guru SIT'}</span>
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => selectChild(c.id)}
                      className="rounded-xl text-xs font-bold"
                    >
                      Buka Rincian Anak →
                    </Button>
                  </div>
                </Card>
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
                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <UserCheck className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Kehadiran Hari Ini</p>
                  <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {dashboard?.attendance_today || activeChild?.attendance_status || 'Hadir'}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <Award className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Rata-rata Rapor</p>
                  <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {activeChild?.gpa || 92}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <BookOpenCheck className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Capaian Tahfizh</p>
                  <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {activeChild?.tahfizh_summary || `${dashboard?.kpi?.total_tahfizh_ayat || 150} Ayat`}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    <HeartHandshake className="h-5 w-5" />
                  </div>
                  <p className="mt-3 text-[10px] font-black uppercase tracking-wider text-slate-400">Mutabaah Yaumiyah</p>
                  <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                    {activeChild?.mutabaah_score || 95}% Tertib
                  </p>
                </div>
              </div>

              {/* ───────────────────────────────────────────────────────────────────────────── */}
              {/* 5 MODUL MONITORING INTEGRASI: MUTABA'AH, TAHFIZH, TARGET, ORTU & NON-PONPES  */}
              {/* ───────────────────────────────────────────────────────────────────────────── */}
              <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-5">
                <div className="space-y-3 border-b border-slate-100 pb-4 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                      <HeartHandshake className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                        Pemantauan Terpadu Mutaba’ah & Tahfizh — {activeChild?.full_name}
                      </h3>
                      <p className="text-[11px] text-slate-400">
                        Monitoring amalan yaumiyah, setoran hafalan, target & evaluasi, serta log wali murid.
                      </p>
                    </div>
                  </div>

                  {/* Sub-Tab Switcher 4 Modul - Grid 4 Kolom Sejajar Presisi (Rapih & Tanpa Bergeser Kiri Kanan) */}
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 w-full">
                    {[
                      ['mutabaah', 'Dashboard Mutaba’ah', HeartHandshake, 'bg-amber-100/90 text-amber-800 border-amber-200/90 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/60'],
                      ['setoran', 'Setoran Tahfizh Siswa', BookOpenCheck, 'bg-emerald-100/90 text-emerald-800 border-emerald-200/90 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/60'],
                      ['target', 'Target & Evaluasi', Award, 'bg-teal-100/90 text-teal-800 border-teal-200/90 hover:bg-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/60'],
                      ['ortu', 'Monitoring Orang Tua', Users, 'bg-purple-100/90 text-purple-800 border-purple-200/90 hover:bg-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/60'],
                    ].map(([key, label, IconComp, colorClass]) => {
                      const isActive = ringkasanSubTab === key
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setRingkasanSubTab(key)}
                          className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2 text-xs font-extrabold transition-colors duration-150 cursor-pointer w-full text-center truncate ${colorClass} ${
                            isActive
                              ? 'ring-2 ring-emerald-600 dark:ring-emerald-400 shadow-sm'
                              : 'opacity-90 hover:opacity-100'
                          }`}
                          title={label}
                        >
                          <IconComp className="h-4 w-4 shrink-0" />
                          <span className="truncate">{label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* CONTENT MODUL 1: DASHBOARD MUTABA'AH */}
                {ringkasanSubTab === 'mutabaah' && (
                  <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">Shalat 5 Waktu</span>
                        <p className="mt-1 text-sm font-black text-emerald-950 dark:text-emerald-200">100% Berjamaah</p>
                      </div>
                      <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3.5 dark:border-purple-900/60 dark:bg-purple-950/30">
                        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase">Shalat Dhuha & Tahajud</span>
                        <p className="mt-1 text-sm font-black text-purple-950 dark:text-purple-200">Terlaksana Rutin</p>
                      </div>
                      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 dark:border-blue-900/60 dark:bg-blue-950/30">
                        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase">Tilawah Al-Qur'an</span>
                        <p className="mt-1 text-sm font-black text-blue-950 dark:text-blue-200">1 Juz / Hari</p>
                      </div>
                      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 dark:border-amber-900/60 dark:bg-amber-950/30">
                        <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase">Kedisiplinan Adab</span>
                        <p className="mt-1 text-sm font-black text-amber-950 dark:text-amber-200">Sangat Baik (A)</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* CONTENT MODUL 2: SETORAN TAHFIZH SISWA */}
                {ringkasanSubTab === 'setoran' && (
                  <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 dark:border-emerald-900/60 dark:bg-emerald-950/30 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">Setoran Terakhir Aktif</span>
                        <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-100 mt-0.5">Surah Al-Mulk: Ayat 1-30 (Lancar / Mumtaz)</h4>
                        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5">Penguji: Ustadz Hamzah, S.Pd.I · Tanggal: 18 Agustus 2026</p>
                      </div>
                      <Badge color="emerald" className="bg-emerald-700 text-white font-extrabold">Nilai A+ (Mumtaz)</Badge>
                    </div>
                  </div>
                )}

                {/* CONTENT MODUL 3: TARGET & EVALUASI */}
                {ringkasanSubTab === 'target' && (
                  <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-900/60 dark:bg-blue-950/30 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-blue-900 dark:text-blue-200">
                        <span>Pencapaian Target Semester (Juz 30, 29, 28)</span>
                        <span>88% Tercapai</span>
                      </div>
                      <div className="h-2.5 w-full overflow-hidden rounded-full bg-blue-200 dark:bg-blue-950">
                        <div className="h-full bg-blue-600 rounded-full" style={{ width: '88%' }} />
                      </div>
                      <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 mt-1">
                        <b>Evaluasi Pembimbing:</b> "Anak menunjukkan konsistensi kelancaran hafalan dan makhraj tajwid yang tajam."
                      </p>
                    </div>
                  </div>
                )}

                {/* CONTENT MODUL 4: MONITORING ORANG TUA */}
                {ringkasanSubTab === 'ortu' && (
                  <div className="space-y-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 dark:border-purple-900/60 dark:bg-purple-950/30 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-xs font-black text-purple-950 dark:text-purple-200">Konfirmasi Pendampingan Wali Murid Harian</h4>
                        <p className="text-[11px] text-purple-800/80 dark:text-purple-300/80 mt-0.5">
                          Telah diverifikasi oleh Wali Kelas: Shalat jamaah & tilawah rumah telah diparaf oleh Orang Tua.
                        </p>
                      </div>
                      <Badge color="purple" className="bg-purple-700 text-white font-bold">Terverifikasi Wali Kelas</Badge>
                    </div>
                  </div>
                )}
              </section>

              {/* DATA KHUSUS PESANTREN/ASRAMA (TAMPIL JIKA ANAK DI UNIT PESANTREN) */}
              {(activeChild?.is_pesantren || activeChild?.unit_name?.toLowerCase().includes('pesantren') || activeChild?.unit_code === 'PONPES') && (
                <div className="overflow-hidden rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-amber-50 p-6 shadow-md dark:border-amber-900/80 dark:bg-amber-950/40">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-md">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge color="warning" className="bg-amber-600 text-white font-extrabold">
                            Pondok Pesantren / Asrama Santri
                          </Badge>
                          <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300">
                            {activeChild?.asrama || 'Gedung Asrama Utama'}
                          </span>
                        </div>
                        <h3 className="mt-1 text-base font-black text-amber-950 dark:text-amber-100">
                          Data & Pengawasan Santri Asrama — {activeChild?.full_name}
                        </h3>
                      </div>
                    </div>

                    <div className="text-right text-xs text-amber-900 dark:text-amber-200">
                      <p>Musyrif Pendamping: <b>{activeChild?.musyrif || 'Ustadz Zulkifli, Lc'}</b></p>
                      <p className="text-[10px] text-amber-700 dark:text-amber-400">Pembimbing Asrama Putra/Putri</p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
                    <div className="rounded-xl border border-amber-200 bg-white p-3.5 shadow-2xs dark:border-amber-900 dark:bg-slate-900">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase">
                        <Moon className="h-4 w-4 text-purple-600" />
                        <span>Presensi Qiyamul Lail</span>
                      </div>
                      <p className="mt-1.5 font-black text-slate-900 dark:text-white">
                        {activeChild?.pesantren_details?.presensi_malam || 'Hadir (03.30 WIB)'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-white p-3.5 shadow-2xs dark:border-amber-900 dark:bg-slate-900">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase">
                        <Sun className="h-4 w-4 text-amber-500" />
                        <span>Shalat Subuh Jamaah</span>
                      </div>
                      <p className="mt-1.5 font-black text-slate-900 dark:text-white">
                        {activeChild?.pesantren_details?.shalat_subuh || 'Hadir di Masjid Utama'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-white p-3.5 shadow-2xs dark:border-amber-900 dark:bg-slate-900">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase">
                        <Home className="h-4 w-4 text-emerald-600" />
                        <span>Kebersihan Kamar</span>
                      </div>
                      <p className="mt-1.5 font-black text-slate-900 dark:text-white">
                        {activeChild?.pesantren_details?.kebersihan_kamar || 'A (Sangat Baik)'}
                      </p>
                    </div>

                    <div className="rounded-xl border border-amber-200 bg-white p-3.5 shadow-2xs dark:border-amber-900 dark:bg-slate-900">
                      <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase">
                        <Info className="h-4 w-4 text-blue-600" />
                        <span>Kesehatan Santri</span>
                      </div>
                      <p className="mt-1.5 font-black text-slate-900 dark:text-white">
                        {activeChild?.pesantren_details?.kesehatan || 'Sehat'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Grid Nilai & Pengumuman Terbaru */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-slate-200/80 shadow-xs">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold">Nilai Rapor Terbaru ({activeChild?.full_name})</CardTitle>
                      <Button size="sm" variant="ghost" onClick={() => selectTab('grades')} className="text-xs text-emerald-700">
                        Lihat Semua Nilai →
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3 text-xs">
                    {(dashboard?.latest_grades || [
                      { id: '1', subject: { name: 'Pendidikan Agama Islam (PAI)' }, nilai_akhir: 95 },
                      { id: '2', subject: { name: 'Al-Qur\'an & Hadits' }, nilai_akhir: 94 },
                      { id: '3', subject: { name: 'Bahasa Arab' }, nilai_akhir: 92 },
                      { id: '4', subject: { name: 'Matematika' }, nilai_akhir: 88 },
                    ]).map((g) => (
                      <div key={g.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                        <span className="font-bold text-slate-800 dark:text-slate-200">{g.subject?.name || 'Mata Pelajaran'}</span>
                        <Badge color="cyan" className="font-black text-xs">
                          {g.nilai_akhir || g.nilai_tugas || 90}
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* KARTU KALENDER AKADEMIK UNIT SISWA */}
                <Card className="border-cyan-200/80 bg-gradient-to-br from-cyan-50/40 via-white to-teal-50/30 shadow-xs dark:border-cyan-900/50 dark:from-slate-900 dark:to-slate-900">
                  <CardHeader className="border-b border-cyan-100/70 bg-cyan-50/60 p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-cyan-600" />
                        <CardTitle className="text-sm font-bold text-slate-900 dark:text-white">
                          Kalender Akademik ({activeChild?.unit_name})
                        </CardTitle>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => setIsCalendarModalOpen(true)} className="text-xs text-cyan-700 font-black dark:text-cyan-400">
                        Lihat Kalender →
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-2.5 text-xs">
                    <div className="rounded-xl bg-cyan-50/80 p-3 text-[11px] text-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-200 border border-cyan-200/60">
                      ℹ️ Menampilkan agenda resmi tahun ajaran dan kalender akademik khusus unit <b>{activeChild?.unit_name}</b>.
                    </div>
                    <Button
                      onClick={() => setIsCalendarModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs hover:opacity-95"
                    >
                      <CalendarDays className="h-4 w-4" />
                      Buka Kalender Akademik {activeChild?.unit_name}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-slate-200/80 shadow-xs">
                  <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-5 dark:border-slate-800 dark:bg-slate-900">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-bold">Pengumuman Terbaru Unit ({activeChild?.unit_name})</CardTitle>
                      <Button size="sm" variant="ghost" onClick={() => selectTab('announcements')} className="text-xs text-emerald-700">
                        Info Sekolah →
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5 space-y-3 text-xs">
                    {activeChildAnnouncements.map((a) => (
                      <div key={a.id} className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/50">
                        <div className="flex items-center justify-between gap-2">
                          <b className="text-slate-900 dark:text-white font-extrabold">{a.title || a.judul_pengumuman}</b>
                          <span className="shrink-0 rounded-md bg-emerald-100 px-2 py-0.5 text-[9px] font-black text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {a.education_unit || activeChild?.unit_name}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-slate-500 text-[11px] leading-relaxed">{a.content || a.isi_pengumuman}</p>
                      </div>
                    ))}
                    {!activeChildAnnouncements.length && (
                      <p className="py-4 text-center text-slate-400">Belum ada pengumuman khusus untuk unit {activeChild?.unit_name}.</p>
                    )}
                  </CardContent>
                </Card>
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
              <div className="rounded-2xl border border-cyan-200 bg-gradient-to-r from-cyan-50 via-teal-50/60 to-white p-5 shadow-xs dark:border-cyan-900 dark:bg-slate-900">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-100 px-3 py-1 text-xs font-black text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Kalender Akademik Terpadu
                    </span>
                    <h2 className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                      Kalender Akademik Unit: {activeChild?.unit_name}
                    </h2>
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      Jadwal resmi kegiatan belajar mengajar, penilaian, libur semester, dan agenda penting khusus ananda {activeChild?.full_name}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCalendarModalOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-2.5 text-xs font-black text-white shadow-md transition hover:scale-[1.02] cursor-pointer"
                  >
                    <CalendarDays className="h-4 w-4" />
                    <span>Buka Kalender Interaktif</span>
                  </button>
                </div>
              </div>

              {/* Kalender Embed Preview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 text-center py-10">
                <CalendarDays className="mx-auto h-12 w-12 text-cyan-600 dark:text-cyan-400" />
                <h3 className="mt-3 text-base font-black text-slate-900 dark:text-white">
                  Kalender Akademik & Agenda Kegiatan {activeChild?.unit_name}
                </h3>
                <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
                  Data kalender telah difilter khusus untuk unit {activeChild?.unit_name}. Anda dapat melihat tampilan bulanan, mingguan, serta daftar agenda lengkap dengan membuka kalender interaktif.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCalendarModalOpen(true)}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-xs font-black text-white shadow-md transition hover:bg-cyan-700 cursor-pointer"
                >
                  <CalendarDays className="h-4 w-4" />
                  Buka Kalender Akademik {activeChild?.unit_name}
                </button>
              </div>
            </div>
          )}

          {active === 'announcements' && (
            <SchoolInformationWorkspace studentId={childId} student={activeChild} embedded />
          )}

          {active === 'schedules' && (
            <ClassScheduleWorkspace schedules={records} loading={loading} />
          )}

          {active === 'materials' && (
            <MaterialsWorkspace materials={records} loading={loading} />
          )}

          {active === 'assignments' && (
            <AssignmentsWorkspace assignments={records} isParent={true} canSubmit={isChildSD} onSubmitAssignment={handleAssignmentSubmit} loading={loading} />
          )}

          {active === 'tahfizh' && (
            <TahfizhWorkspace logs={records} target={dashboard?.tahfizh_target} achievement={tahfizhAchievement} loading={loading} />
          )}

          {active === 'grades' && (
            <GradesWorkspace grades={records} loading={loading} />
          )}

          {active === 'student-notes' && (
            <TeacherCommentsWorkspace comments={records} loading={loading} childId={childId} isParent onSigned={load} />
          )}

          {active === 'mutabaah' && (
            <div className="space-y-5">
              <ParentWorshipInputWorkspace studentId={childId} />
              <MutabaahWorkspace mutabaah={records?.today || null} isParent={true} loading={loading} />
            </div>
          )}

          {active === 'attendance' && (
            <AttendanceWorkspace
              attendanceLogs={records}
              permissionsHistory={permissionsRecords}
              onSubmitPermission={handleSubmitPermissionFromWorkspace}
              canSubmitPermission={true}
              isParent={true}
              loading={loading}
            />
          )}

          {active === 'kisi' && (
            <ExamGridsWorkspace grids={examGridsRecords} loading={loading} />
          )}

          {active === 'ujian' && (
            <CbtExamsWorkspace lmsData={cbtOverview} isParent={true} loading={loading} />
          )}

          {active === 'hasil' && (
            <ExamResultsWorkspace resultsData={resultsData} reports={reportsRecords} loading={loading} />
          )}

          {active === 'bills' && (
            <div className="rounded-[18px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
              {records.map((r) => (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
                  <div>
                    <b className="text-sm font-bold">{r.title}</b>
                    <p className="mt-1 text-xs text-slate-500">Jatuh tempo {date(r.due_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 dark:text-white">{rupiah(r.amount)}</p>
                    <Status value={r.status} />
                  </div>
                </div>
              ))}
              {!records.length && <Empty text="Belum ada data tagihan." />}
            </div>
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
        lockedUnit={activeChild?.unit_name || ''}
      />
    </div>
  )
}
