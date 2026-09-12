import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  BookOpen,
  CalendarCheck,
  Award,
  CreditCard,
  MessageSquare,
  Clock,
  Sparkles,
  ChevronRight,
  RefreshCw,
  HeartHandshake,
  CheckCircle2,
  AlertCircle,
  CalendarDays,
  ExternalLink,
  BookOpenCheck,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  UserCheck,
  ClipboardList,
  CheckSquare,
  FileText,
  Building2,
  Printer,
  ChevronDown,
  X,
} from 'lucide-react'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import api from '../services/api'
import { useAuthStore } from '../stores/authStore'
import { Card } from '../components/tailgrids/core/card'
import { Badge } from '../components/tailgrids/core/badge'
import { Button } from '../components/tailgrids/core/button'
import { Avatar, AvatarFallback } from '../components/tailgrids/core/avatar'

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(
    Number(val || 0)
  )

const formatDate = (val) => {
  if (!val) return '-'
  try {
    return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(val))
  } catch {
    return val
  }
}

export default function ParentDashboardPage() {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)

  const [children, setChildren] = useState([])
  const [selectedChildId, setSelectedChildId] = useState(null)
  const [loadingChildren, setLoadingChildren] = useState(true)
  const [activeModal, setActiveModal] = useState(null)

  // Data per anak santri
  const [dashboardData, setDashboardData] = useState(null)
  const [todayTimeline, setTodayTimeline] = useState([])
  const [schedules, setSchedules] = useState([])
  const [studentNotes, setStudentNotes] = useState([])
  const [bills, setBills] = useState([])
  const [tahfizhData, setTahfizhData] = useState(null)
  const [gradesData, setGradesData] = useState(null)
  const [mutabaahData, setMutabaahData] = useState(null)
  const [loadingDetails, setLoadingDetails] = useState(true)

  // 1. Ambil daftar anak santri milik orang tua yang login
  const loadChildren = useCallback(async () => {
    setLoadingChildren(true)
    try {
      const res = await api.get('/portal/children')
      const list = res.data?.data || []
      setChildren(list)
      if (list.length > 0 && !selectedChildId) {
        setSelectedChildId(list[0].id)
      }
    } catch (e) {
      // fallback
    } finally {
      setLoadingChildren(false)
    }
  }, [selectedChildId])

  useEffect(() => {
    loadChildren()
  }, [loadChildren])

  // 2. Ambil seluruh data dinamis santri (Nilai, Hafalan, Presensi, Mutabaah, Tugas, Buku Penghubung, SPP)
  const loadChildData = useCallback(async (childId) => {
    if (!childId) return
    setLoadingDetails(true)
    try {
      const todayStr = new Date().toISOString().split('T')[0]
      const headers = { 'X-Child-Id': childId }

      const [
        dashRes,
        timelineRes,
        schedulesRes,
        notesRes,
        billsRes,
        tahfizhRes,
        gradesRes,
        mutabaahRes,
      ] = await Promise.all([
        api.get('/portal/dashboard', { headers, params: { child_id: childId } }).catch(() => ({ data: { data: null } })),
        api.get('/portal/today-live-timeline', { headers, params: { child_id: childId, date: todayStr } }).catch(() => ({ data: { data: { activities: [] } } })),
        api.get('/portal/schedules', { headers, params: { child_id: childId, date: todayStr } }).catch(() => ({ data: { data: [] } })),
        api.get('/portal/student-notes', { headers, params: { child_id: childId, per_page: 5 } }).catch(() => ({ data: { data: [] } })),
        api.get('/portal/bills', { headers, params: { child_id: childId } }).catch(() => ({ data: { data: { data: [] } } })),
        api.get(`/portal/children/${childId}/tahfizh-achievement`).catch(() => ({ data: { data: null } })),
        api.get('/portal/grades', { headers, params: { child_id: childId } }).catch(() => ({ data: { data: null } })),
        api.get(`/parent/mutabaah/${childId}`).catch(() => ({ data: { data: null } })),
      ])

      setDashboardData(dashRes.data?.data || null)

      const acts = timelineRes.data?.data?.activities || []
      setTodayTimeline(Array.isArray(acts) ? acts : [])

      const schs = schedulesRes.data?.data || dashRes.data?.data?.schedules_today || []
      setSchedules(Array.isArray(schs) ? schs : [])

      const nts = notesRes.data?.data?.data || notesRes.data?.data || []
      setStudentNotes(Array.isArray(nts) ? nts : [])

      const bls = billsRes.data?.data?.data || billsRes.data?.data || []
      setBills(Array.isArray(bls) ? bls : [])

      setTahfizhData(tahfizhRes.data?.data || dashRes.data?.data?.tahfizh_target || null)
      setGradesData(gradesRes.data?.data || null)
      setMutabaahData(mutabaahRes.data?.data || null)
    } catch (err) {
      // ignore
    } finally {
      setLoadingDetails(false)
    }
  }, [])

  useEffect(() => {
    if (selectedChildId) {
      loadChildData(selectedChildId)
    }
  }, [selectedChildId, loadChildData])

  const activeChild = useMemo(() => {
    return children.find((c) => c.id === selectedChildId) || children[0] || null
  }, [children, selectedChildId])

  // Ringkasan Tagihan SPP
  const billSummary = useMemo(() => {
    let totalUnpaid = 0
    let hasOverdue = false
    bills.forEach((b) => {
      if (String(b.status).toUpperCase() !== 'PAID') {
        totalUnpaid += Number(b.amount || 0)
        if (b.due_date && new Date(b.due_date) < new Date()) {
          hasOverdue = true
        }
      }
    })
    return { totalUnpaid, hasOverdue, count: bills.length }
  }, [bills])

  // Nilai Akademik
  const gradesSummary = useMemo(() => {
    const s = gradesData?.summary
    const items = gradesData?.items || []
    return {
      average: s?.average_score != null ? Number(s.average_score).toFixed(1) : '-',
      highest: s?.highest_score != null ? Number(s.highest_score).toFixed(1) : '-',
      passed: s?.passed_subjects ?? 0,
      total: s?.total_subjects ?? items.length,
      items: items.slice(0, 4),
    }
  }, [gradesData])

  // Tugas Aktif LMS
  const activeAssignments = useMemo(() => {
    const list = dashboardData?.active_assignments || []
    return Array.isArray(list) ? list.slice(0, 4) : []
  }, [dashboardData])

  return (
    <div className="space-y-6 pb-12">
      {/* BREADCRUMB */}
      <AppBreadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Wali Murid' },
          { label: activeChild?.name ? activeChild.name : 'Ringkasan Santri' },
        ]}
      />

      {/* 1. TAILGRIDS MODERN HERO CARD (VIVID EMERALD GRADIENT STANDARD) */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
        {/* Ambient Glow Background Accent (Vibrant Dual Emerald-Teal Blobs) */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4 min-w-0">
            <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
              <HeartHandshake className="h-6 w-6 sm:h-7 sm:w-7" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Ahlan wa Sahlan, {user?.name || 'Bapak/Ibu Wali Murid'}
                </h1>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-sm shadow-emerald-600/25 border border-emerald-300/40">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  PORTAL WALI MURID
                </span>
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  {dashboardData?.academic_context?.academic_year ? `T.A. ${dashboardData.academic_context.academic_year}` : 'Yayasan Dar El-Iman'}
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                Memantau data terpadu: Presensi, Hafalan Tahfizh, Nilai, Tugas LMS, Mutaba'ah, dan SPP santri secara real-time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => loadChildData(selectedChildId)}
              className="cursor-pointer gap-1.5 border border-emerald-500/30 bg-white/80 dark:bg-slate-800 text-xs font-bold text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-emerald-700 dark:text-emerald-300 ${loadingDetails ? 'animate-spin' : ''}`} />
              Segarkan Data
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => navigate('/portal-orangtua')}
              className="cursor-pointer gap-1.5 !bg-[#0E5C44] !text-white text-xs font-bold shadow-md shadow-emerald-950/20"
            >
              Lembar Kerja Penuh
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 2. MULTI-CHILD SELECTOR (ISOLASI DATA SANTRI WALI MURID) */}
      {children.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Pilih Putra/Putri Anda:</span>
            <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              {children.length} Santri Terdaftar Dalam Akun Ini
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {children.map((child) => {
              const isSelected = child.id === selectedChildId
              return (
                <div
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`cursor-pointer rounded-2xl border-2 p-3.5 transition-all ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 shadow-sm dark:border-emerald-500 dark:bg-emerald-950/30'
                      : 'border-slate-200/80 bg-white hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar size="md">
                      <AvatarFallback className={isSelected ? 'bg-[#0E5C44] text-white font-bold' : 'bg-slate-100 text-slate-700'}>
                        {child.name?.[0] || 'S'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="truncate text-xs font-bold text-slate-900 dark:text-white">
                          {child.name}
                        </h4>
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                        {child.class_name || '-'} • NIS: {child.nis || '-'}
                      </p>
                      <span className="mt-1 inline-block rounded-md bg-emerald-100/80 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                        {child.unit_name || 'Unit Pendidikan'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* 3. MASTER STATS GRID (5 KPI CARDS - SESUAI TAILGRIDS_REPORT_PAGE_STYLE.MD) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {/* KPI 1: KEHADIRAN (EMERALD TONE) */}
        <motion.article
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => setActiveModal('attendance')}
          role="button"
          tabIndex={0}
          className="group flex flex-col justify-between h-full p-4 rounded-[18px] border border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/25 dark:to-[#1B2433] dark:border-emerald-800/60 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="size-10 sm:size-11 rounded-xl flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
              <CalendarCheck className="size-5 sm:size-6" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
              {dashboardData?.kpi?.attendance_rate != null ? `${dashboardData.kpi.attendance_rate}%` : '100%'}
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">Presensi Hari Ini</span>
            <strong className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white block">
              {todayTimeline.length > 0 ? 'Tercatat Hadir' : (dashboardData?.kpi?.attendance_summary?.latest_status ? `${dashboardData.kpi.attendance_summary.latest_status}` : 'Menunggu Sesi')}
            </strong>
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-400 transition-colors pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/80">
            <span>
              {todayTimeline.length > 0
                ? `${todayTimeline.length} aktivitas hari ini`
                : (dashboardData?.kpi?.attendance_summary?.latest_date
                    ? `Terakhir: ${dashboardData.kpi.attendance_summary.latest_date}`
                    : `${dashboardData?.kpi?.attendance_summary?.total_days || 0} hari terekam`)}
            </span>
            <span className="inline-flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400 font-bold group-hover:translate-x-0.5 transition-transform">
              Detail &rarr;
            </span>
          </div>
        </motion.article>

        {/* KPI 2: PROGRES TAHFIZH (SKY TONE) */}
        <motion.article
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => setActiveModal('tahfizh')}
          role="button"
          tabIndex={0}
          className="group flex flex-col justify-between h-full p-4 rounded-[18px] border border-sky-200/80 bg-gradient-to-b from-sky-50/50 to-white dark:from-sky-950/25 dark:to-[#1B2433] dark:border-sky-800/60 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="size-10 sm:size-11 rounded-xl flex items-center justify-center shrink-0 bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
              <BookOpen className="size-5 sm:size-6" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
              {dashboardData?.latest_tahfizh?.juz ? `Juz ${dashboardData.latest_tahfizh.juz}` : (tahfizhData?.target_juz ? `Juz ${tahfizhData.target_juz}` : (dashboardData?.kpi?.total_tahfizh_ayat > 0 ? `${dashboardData.kpi.total_tahfizh_ayat} Ayat` : 'Tahfizh'))}
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">Hafalan Al-Qur'an</span>
            <strong className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white block">
              {dashboardData?.latest_tahfizh?.surah_name ? `${dashboardData.latest_tahfizh.surah_name}` : (dashboardData?.kpi?.latest_tahfizh_surah && dashboardData.kpi.latest_tahfizh_surah !== 'Belum Ada' ? dashboardData.kpi.latest_tahfizh_surah : (tahfizhData?.target_juz ? `Juz ${tahfizhData.target_juz}` : 'Tahfizh Aktif'))}
            </strong>
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-sky-700 dark:text-slate-400 dark:hover:text-sky-400 transition-colors pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/80">
            <span>
              {dashboardData?.latest_tahfizh?.ayah_start
                ? `Ayat ${dashboardData.latest_tahfizh.ayah_start}-${dashboardData.latest_tahfizh.ayah_end} • Skor ${dashboardData.latest_tahfizh.score ?? 80}`
                : (dashboardData?.kpi?.total_tahfizh_ayat > 0
                    ? `${dashboardData.kpi.total_tahfizh_ayat} total ayat terhafal`
                    : (tahfizhData?.target_status || 'Target semester'))}
            </span>
            <span className="inline-flex items-center gap-0.5 text-sky-700 dark:text-sky-400 font-bold group-hover:translate-x-0.5 transition-transform">
              Detail &rarr;
            </span>
          </div>
        </motion.article>

        {/* KPI 3: NILAI AKADEMIK (TEAL TONE) */}
        <motion.article
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => setActiveModal('grades')}
          role="button"
          tabIndex={0}
          className="group flex flex-col justify-between h-full p-4 rounded-[18px] border border-teal-200/80 bg-gradient-to-b from-teal-50/50 to-white dark:from-teal-950/25 dark:to-[#1B2433] dark:border-teal-800/60 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="size-10 sm:size-11 rounded-xl flex items-center justify-center shrink-0 bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
              <Award className="size-5 sm:size-6" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-100 text-teal-800 dark:bg-teal-900/60 dark:text-teal-300">
              {gradesSummary.passed > 0 ? `${gradesSummary.passed} Mapel Tuntas` : (gradesSummary.total > 0 ? `${gradesSummary.total} Mapel` : 'Penilaian')}
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">Rata-Rata Nilai</span>
            <strong className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white block">
              {gradesSummary.average !== '-' ? `${gradesSummary.average}` : 'Evaluasi Aktif'}
            </strong>
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-teal-700 dark:text-slate-400 dark:hover:text-teal-400 transition-colors pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/80">
            <span>{gradesSummary.highest !== '-' ? `Tertinggi: ${gradesSummary.highest}` : (gradesSummary.total > 0 ? `${gradesSummary.total} mata pelajaran` : 'Penilaian semester')}</span>
            <span className="inline-flex items-center gap-0.5 text-teal-700 dark:text-teal-400 font-bold group-hover:translate-x-0.5 transition-transform">
              Detail &rarr;
            </span>
          </div>
        </motion.article>

        {/* KPI 4: BUKU PENGHUBUNG (VIOLET TONE) */}
        <motion.article
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => setActiveModal('notes')}
          role="button"
          tabIndex={0}
          className="group flex flex-col justify-between h-full p-4 rounded-[18px] border border-violet-200/80 bg-gradient-to-b from-violet-50/50 to-white dark:from-violet-950/25 dark:to-[#1B2433] dark:border-violet-800/60 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="size-10 sm:size-11 rounded-xl flex items-center justify-center shrink-0 bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-300">
              <BookOpenCheck className="size-5 sm:size-6" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-900/60 dark:text-violet-300">
              {studentNotes.length} Catatan
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">Buku Penghubung</span>
            <strong className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white block">
              {studentNotes.length > 0 ? `${studentNotes.length} Catatan Guru` : 'Buku Penghubung'}
            </strong>
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-violet-700 dark:text-slate-400 dark:hover:text-violet-400 transition-colors pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/80">
            <span>
              {studentNotes[0]?.category
                ? `${studentNotes[0].category} • ${formatDate(studentNotes[0].date || studentNotes[0].created_at)}`
                : 'Komunikasi resmi wali kelas'}
            </span>
            <span className="inline-flex items-center gap-0.5 text-violet-700 dark:text-violet-400 font-bold group-hover:translate-x-0.5 transition-transform">
              Detail &rarr;
            </span>
          </div>
        </motion.article>

        {/* KPI 5: TAGIHAN SPP (AMBER TONE) */}
        <motion.article
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          onClick={() => setActiveModal('bills')}
          role="button"
          tabIndex={0}
          className="group flex flex-col justify-between h-full p-4 rounded-[18px] border border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white dark:from-amber-950/25 dark:to-[#1B2433] dark:border-amber-800/60 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="size-10 sm:size-11 rounded-xl flex items-center justify-center shrink-0 bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
              <CreditCard className="size-5 sm:size-6" />
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
              {billSummary.totalUnpaid > 0 ? 'Tertunggak' : 'Lunas'}
            </span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-0.5">Tagihan & SPP</span>
            <strong className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white block">
              {billSummary.totalUnpaid > 0 ? formatRupiah(billSummary.totalUnpaid) : 'Lunas'}
            </strong>
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 group-hover:text-amber-700 dark:text-slate-400 dark:hover:text-amber-400 transition-colors pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/80">
            <span>
              {billSummary.hasOverdue ? (
                <span className="text-rose-600 font-bold">Ada tagihan lewat tempo</span>
              ) : billSummary.totalUnpaid > 0 ? (
                'Menunggu pembayaran'
              ) : billSummary.count > 0 ? (
                'Semua tagihan lunas'
              ) : (
                'Bebas tunggakan'
              )}
            </span>
            <span className="inline-flex items-center gap-0.5 text-amber-700 dark:text-amber-400 font-bold group-hover:translate-x-0.5 transition-transform">
              Detail &rarr;
            </span>
          </div>
        </motion.article>
      </div>

      {/* 4. BALANCED 3-COLUMN DETAIL GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* ==================================================== */}
        {/* KOLOM 1: AKADEMIK, NILAI & TUGAS LMS                 */}
        {/* ==================================================== */}
        <div className="space-y-6">
          {/* NILAI HASIL BELAJAR */}
          <div className="rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] overflow-hidden">
            <div className="flex items-center justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                  <Award className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Nilai Hasil Belajar</h3>
                  <p className="text-[11px] text-slate-400">Evaluasi formatif & sumatif semester berjalan</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => navigate('/portal-orangtua')}
                className="cursor-pointer text-[11px] text-emerald-700 dark:text-emerald-300"
              >
                Rapor Lengkap
              </Button>
            </div>

            <div className="p-4 sm:p-5 space-y-3">
              {gradesSummary.items.length > 0 ? (
                gradesSummary.items.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{item.subject_name || item.subject?.name || item.mapel || 'Mata Pelajaran'}</p>
                      <p className="text-[10px] text-slate-400">Guru: {item.teacher_name || '-'}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                        {item.final_score ?? item.score ?? '-'}
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold">Predikat {item.predicate || item.grade_letter || 'B'}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <Award className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                  Belum ada publikasi nilai mata pelajaran.
                </div>
              )}
            </div>
          </div>

          {/* TUGAS AKTIF LMS */}
          <div className="rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] overflow-hidden">
            <div className="flex items-center justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  <ClipboardList className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Tugas Pembelajaran Aktif</h3>
                  <p className="text-[11px] text-slate-400">Tenggat pengumpulan tugas LMS sekolah</p>
                </div>
              </div>
              <Badge color="warning" size="xs">
                {activeAssignments.length} Tugas
              </Badge>
            </div>

            <div className="p-4 sm:p-5 space-y-2.5">
              {activeAssignments.length > 0 ? (
                activeAssignments.map((task, idx) => (
                  <div key={task.id || idx} className="rounded-xl border border-slate-100 p-3 text-xs dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <div className="flex items-center justify-between">
                      <Badge color="primary" size="xs">
                        {task.subject_name || 'Mapel'}
                      </Badge>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Batas: {formatDate(task.due_date)}
                      </span>
                    </div>
                    <p className="mt-1.5 font-bold text-slate-900 dark:text-white">{task.title}</p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      Status: {task.submitted ? (
                        <span className="text-emerald-600 font-bold">Sudah Mengumpulkan</span>
                      ) : (
                        <span className="text-amber-600 font-bold">Belum Dikumpulkan</span>
                      )}
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <ClipboardList className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                  Semua tugas telah diselesaikan santri Anda.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* KOLOM 2: TAHFIZH & MUTABA'AH YAUMIYYAH               */}
        {/* ==================================================== */}
        <div className="space-y-6">
          {/* PROGRESS TAHFIZH & SETORAN */}
          <div className="rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] overflow-hidden">
            <div className="flex items-center justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <BookOpen className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Tahfizh & Hafalan Qur'an</h3>
                  <p className="text-[11px] text-slate-400">Target juz & setoran harian santri</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => navigate('/portal-orangtua')}
                className="cursor-pointer text-[11px] text-blue-600 dark:text-blue-400"
              >
                Log Setoran
              </Button>
            </div>

            <div className="p-4 sm:p-5 space-y-3">
              <div className="rounded-xl bg-blue-50/70 p-3.5 text-xs dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-950 dark:text-blue-200">Target Kurikulum:</span>
                  <span className="font-black text-blue-800 dark:text-blue-300">
                    {tahfizhData?.target_juz ? `Juz ${tahfizhData.target_juz}` : 'Target Semester Aktif'}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-blue-800/80 dark:text-blue-300/80">
                  Status Kelulusan: <span className="font-bold">{tahfizhData?.target_status || 'Dalam Proses Bimbingan'}</span>
                </p>
              </div>

              {(dashboardData?.latest_tahfizh || tahfizhData?.last_record) ? (
                (() => {
                  const r = dashboardData?.latest_tahfizh || tahfizhData?.last_record
                  return (
                    <div className="rounded-xl border border-slate-100 p-3 text-xs dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Setoran Terakhir:</span>
                      <p className="mt-1 font-bold text-slate-900 dark:text-white">
                        {r.surah_name || 'Surat Al-Qur’an'} ({r.ayah_start ? `Ayat ${r.ayah_start}-${r.ayah_end}` : (r.ayat_range || 'Ayat Lengkap')})
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">Tanggal: {formatDate(r.record_date || r.date)}</span>
                        <Badge color="success" size="xs">
                          {r.quality || r.status || 'Mumtaz'}
                        </Badge>
                      </div>
                    </div>
                  )
                })()
              ) : (
                <div className="py-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  Belum ada riwayat setoran pekan ini.
                </div>
              )}
            </div>
          </div>

          {/* MUTABA'AH YAUMIYYAH IBADAH HARIAN */}
          <div className="rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] overflow-hidden">
            <div className="flex items-center justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <CheckSquare className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Mutaba'ah Amalan Harian</h3>
                  <p className="text-[11px] text-slate-400">Sholat fardhu, sunnah, dan tilawah</p>
                </div>
              </div>
              <Badge color="primary" size="xs">
                {mutabaahData?.date ? formatDate(mutabaahData.date) : 'Hari Ini'}
              </Badge>
            </div>

            <div className="p-4 sm:p-5 space-y-2.5">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400">Kepatuhan Ibadah:</span>
                  <p className="mt-1 font-black text-emerald-700 dark:text-emerald-400">
                    {mutabaahData?.monthly?.score ? `${mutabaahData.monthly.score}%` : 'Tercatat Teratur'}
                  </p>
                </div>
                <div className="rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400">Hari Terisi:</span>
                  <p className="mt-1 font-black text-slate-800 dark:text-slate-200">
                    {mutabaahData?.monthly?.days ? `${mutabaahData.monthly.days} Hari` : 'Bulan Berjalan'}
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 p-3 text-xs dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30">
                <p className="font-bold text-slate-800 dark:text-slate-200">Sholat Fardhu 5 Waktu & Sunnah</p>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  Pantau pelaksanaan sholat Subuh, Dzuhur, Ashar, Maghrib, Isya, dan Tilawah Al-Qur'an santri.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="xs"
                  onClick={() => navigate('/portal-orangtua')}
                  className="mt-2.5 w-full cursor-pointer text-[11px] text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300"
                >
                  Buka Lembar Mutaba'ah & Tanda Tangan
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* KOLOM 3: PRESENSI, BUKU PENGHUBUNG & SPP            */}
        {/* ==================================================== */}
        <div className="space-y-6">
          {/* LIVE ACTIVITY TIMELINE HARI INI */}
          <div className="rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] overflow-hidden">
            <div className="flex items-center justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Aktivitas Hari Ini (Live)</h3>
                  <p className="text-[11px] text-slate-400">Presensi gerbang, kelas, dan ibadah</p>
                </div>
              </div>
              <Badge color="success" size="xs">
                Real-Time
              </Badge>
            </div>

            <div className="p-4 sm:p-5 space-y-2.5">
              {todayTimeline.length > 0 ? (
                todayTimeline.slice(0, 4).map((act, idx) => (
                  <div key={act.id || idx} className="flex items-start gap-2.5 rounded-xl border border-slate-100 p-2.5 text-xs dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 dark:text-white truncate">{act.title}</span>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0">{act.time || '-'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate">{act.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  <CalendarCheck className="mx-auto mb-2 h-7 w-7 text-slate-300" />
                  Belum ada aktivitas baru hari ini.
                </div>
              )}
            </div>
          </div>

          {/* BUKU PENGHUBUNG GURU */}
          <div className="rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] overflow-hidden">
            <div className="flex items-center justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                  <BookOpenCheck className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">Buku Penghubung Guru</h3>
                  <p className="text-[11px] text-slate-400">Catatan perkembangan wali kelas</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                onClick={() => navigate('/portal-orangtua')}
                className="cursor-pointer text-[11px] text-purple-600 dark:text-purple-400"
              >
                Semua Catatan
              </Button>
            </div>

            <div className="p-4 sm:p-5 space-y-3">
              {studentNotes.slice(0, 2).map((note) => (
                <div key={note.id} className="rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <Badge color="cyan" size="xs">
                      {note.category || 'Catatan'}
                    </Badge>
                    <span className="text-[10px] text-slate-400">{formatDate(note.created_at)}</span>
                  </div>
                  <p className="mt-1.5 font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                    {note.content || note.note}
                  </p>
                  <p className="mt-1.5 text-[10px] text-slate-400">Oleh: {note.teacher?.name || 'Guru'}</p>
                </div>
              ))}

              {!studentNotes.length && (
                <div className="py-4 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                  Belum ada catatan baru dari guru.
                </div>
              )}
            </div>
          </div>

          {/* KARTU SPP & KUITANSI */}
          <div className="rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] overflow-hidden">
            <div className="flex items-center justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 sm:p-5">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white">Tagihan SPP</h4>
                  <p className="text-[11px] text-slate-400">Iuran biaya pendidikan bulanan</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                {billSummary.totalUnpaid > 0 ? formatRupiah(billSummary.totalUnpaid) : 'LUNAS'}
              </span>
            </div>

            <div className="p-4 sm:p-5">
              <p className="text-[11px] text-slate-600 dark:text-slate-300">
                BSI Syariah: <span className="font-mono font-bold text-emerald-800 dark:text-emerald-200">777-1234-567</span> a.n. Yayasan Dar El-Iman
              </p>
              <Button
                type="button"
                variant="primary"
                size="xs"
                onClick={() => navigate('/portal-orangtua')}
                className="mt-3 w-full cursor-pointer !bg-[#0E5C44] !text-white text-xs font-bold"
              >
                Lihat Tagihan & Kuitansi
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* 5. MODAL POPUP DIALOGS UNTUK 5 KARTU STATS GRID     */}
      {/* ==================================================== */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm overflow-hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-2xl max-h-[85vh] sm:max-h-[88vh] overflow-hidden rounded-[24px] border-2 border-emerald-500/30 bg-white shadow-2xl flex flex-col dark:border-emerald-600/40 dark:bg-[#1B2433]"
            >
              {/* MODAL 1: RINCIAN PRESENSI HARI INI */}
              {activeModal === 'attendance' && (
                <>
                  <div className="flex items-center justify-between border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                        <CalendarCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">Rincian Presensi & Kehadiran Hari Ini</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Santri: <span className="font-bold text-emerald-700 dark:text-emerald-400">{activeChild?.name}</span> ({activeChild?.class_name || '-'})
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* KPI Presensi Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      <div className="rounded-xl bg-emerald-50/70 p-3 dark:bg-emerald-950/30">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Tingkat Kehadiran:</span>
                        <p className="mt-1 text-base font-black text-emerald-800 dark:text-emerald-300">
                          {dashboardData?.kpi?.attendance_rate != null ? `${dashboardData.kpi.attendance_rate}%` : 'Aktif 100%'}
                        </p>
                      </div>
                      <div className="rounded-xl bg-teal-50/70 p-3 dark:bg-teal-950/30">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Aktivitas Hari Ini:</span>
                        <p className="mt-1 text-base font-black text-teal-800 dark:text-teal-300">
                          {todayTimeline.length} Sesi
                        </p>
                      </div>
                      <div className="col-span-2 sm:col-span-1 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50">
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">Status Gerbang:</span>
                        <p className="mt-1 text-base font-black text-slate-800 dark:text-slate-200">
                          {todayTimeline.some((t) => t.category === 'gate' || t.title?.includes('Gerbang')) ? 'Tercatat' : 'Belum Ada'}
                        </p>
                      </div>
                    </div>

                    {/* Timeline List */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Log Kronologis Sesi Hari Ini:</h4>
                      <div className="space-y-2">
                        {todayTimeline.length > 0 ? (
                          todayTimeline.map((act, idx) => (
                            <div key={act.id || idx} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3 text-xs dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                <CheckCircle2 className="h-4 w-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900 dark:text-white">{act.title}</span>
                                  <span className="font-mono text-[10px] text-slate-400">{act.time || '-'}</span>
                                </div>
                                <p className="mt-0.5 text-[11px] text-slate-600 dark:text-slate-300">{act.description}</p>
                                {act.status && (
                                  <span className="mt-1.5 inline-block rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                                    {act.status}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                            Belum ada catatan aktivitas presensi untuk tanggal hari ini.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveModal(null)}
                      className="cursor-pointer"
                    >
                      Tutup
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setActiveModal(null)
                        navigate('/portal-orangtua')
                      }}
                      className="cursor-pointer !bg-[#0E5C44] !text-white text-xs font-bold"
                    >
                      Buka Kalender Presensi Lengkap
                    </Button>
                  </div>
                </>
              )}

              {/* MODAL 2: RINCIAN HAFALAN AL-QUR'AN (TAHFIZH) */}
              {activeModal === 'tahfizh' && (
                <>
                  <div className="flex items-center justify-between border-b border-blue-500/20 bg-gradient-to-r from-blue-500/10 via-sky-500/5 to-transparent p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">Rincian Hafalan Al-Qur'an (Tahfizh)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Santri: <span className="font-bold text-blue-700 dark:text-blue-400">{activeChild?.name}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Ringkasan Target */}
                    <div className="rounded-2xl bg-blue-50/70 p-4 border border-blue-100 dark:bg-blue-950/30 dark:border-blue-900/40">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-blue-800/70 dark:text-blue-300/70">Target Semester:</span>
                          <h4 className="text-lg font-black text-blue-900 dark:text-blue-100">
                            {tahfizhData?.target_juz ? `Juz ${tahfizhData.target_juz}` : 'Target Semester Terpadu'}
                          </h4>
                        </div>
                        <Badge color="blue" size="sm" className="font-bold">
                          {tahfizhData?.target_status || 'Dalam Bimbingan'}
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-blue-800 dark:text-blue-300">
                        Total lembar mutaba'ah hafalan: <span className="font-bold">{dashboardData?.kpi?.memorization_pages || 0} Halaman</span>
                      </p>
                    </div>

                    {/* Setoran Terakhir */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Setoran Hafalan Terakhir:</h4>
                      {(dashboardData?.latest_tahfizh || tahfizhData?.last_record) ? (
                        (() => {
                          const r = dashboardData?.latest_tahfizh || tahfizhData?.last_record
                          return (
                            <div className="rounded-xl border border-slate-200 p-4 bg-white dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-black text-slate-900 dark:text-white">
                                  {r.surah_name || 'Surat Al-Qur’an'}
                                </span>
                                <Badge color="success" size="xs">
                                  {r.quality || r.status || 'Mumtaz'}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-600 dark:text-slate-300">
                                Rentang Ayat: <span className="font-mono font-bold">{r.ayah_start ? `Ayat ${r.ayah_start}-${r.ayah_end}` : (r.ayat_range || 'Ayat Lengkap')}</span>
                              </p>
                              <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100 pt-2 dark:border-slate-700">
                                <span>Tanggal: {formatDate(r.record_date || r.date)}</span>
                                <span>{r.teacher_name || 'Ustadz/Musyrif Pengampu'}</span>
                              </div>
                            </div>
                          )
                        })()
                      ) : (
                        <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                          Belum ada catatan setoran baru pada periode ini.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveModal(null)}
                      className="cursor-pointer"
                    >
                      Tutup
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setActiveModal(null)
                        navigate('/portal-orangtua')
                      }}
                      className="cursor-pointer !bg-blue-600 !text-white text-xs font-bold"
                    >
                      Buka Log Tahfizh Penuh
                    </Button>
                  </div>
                </>
              )}

              {/* MODAL 3: RINCIAN RATA-RATA NILAI */}
              {activeModal === 'grades' && (
                <>
                  <div className="flex items-center justify-between border-b border-teal-500/20 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-transparent p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400">
                        <Award className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">Rincian Nilai Hasil Belajar Santri</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Santri: <span className="font-bold text-teal-700 dark:text-teal-400">{activeChild?.name}</span> ({activeChild?.class_name || '-'})
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Summary Bar */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-xl bg-teal-50 p-3 dark:bg-teal-950/30 text-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Rata-Rata:</span>
                        <p className="text-lg font-black text-teal-700 dark:text-teal-300">{gradesSummary.average}</p>
                      </div>
                      <div className="rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30 text-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Tertinggi:</span>
                        <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{gradesSummary.highest}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 text-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Mapel Terdaftar:</span>
                        <p className="text-lg font-black text-slate-800 dark:text-slate-200">{gradesSummary.total} Mapel</p>
                      </div>
                    </div>

                    {/* Table Nilai */}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">Nilai Evaluasi & Mata Pelajaran:</h4>
                      <div className="space-y-2">
                        {gradesData?.items && gradesData.items.length > 0 ? (
                          gradesData.items.map((it, idx) => (
                            <div key={it.id || idx} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 text-xs dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white">{it.subject_name || it.subject?.name || it.mapel || 'Mata Pelajaran'}</p>
                                <p className="text-[11px] text-slate-400">Guru: {it.teacher_name || '-'}</p>
                              </div>
                              <div className="text-right">
                                <span className="text-base font-black text-teal-700 dark:text-teal-400">
                                  {it.final_score ?? it.score ?? '-'}
                                </span>
                                <p className="text-[10px] font-bold text-slate-500">Predikat {it.predicate || it.grade_letter || 'B'}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                            Belum ada entri nilai yang dipublikasikan guru pengampu.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveModal(null)}
                      className="cursor-pointer"
                    >
                      Tutup
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setActiveModal(null)
                        navigate('/portal-orangtua')
                      }}
                      className="cursor-pointer !bg-teal-700 !text-white text-xs font-bold"
                    >
                      Buka Rapor Lengkap
                    </Button>
                  </div>
                </>
              )}

              {/* MODAL 4: RINCIAN BUKU PENGHUBUNG */}
              {activeModal === 'notes' && (
                <>
                  <div className="flex items-center justify-between border-b border-purple-500/20 bg-gradient-to-r from-purple-500/10 via-fuchsia-500/5 to-transparent p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400">
                        <BookOpenCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">Buku Penghubung & Catatan Guru</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Santri: <span className="font-bold text-purple-700 dark:text-purple-400">{activeChild?.name}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-3">
                    {studentNotes.length > 0 ? (
                      studentNotes.map((note) => (
                        <div key={note.id} className="rounded-2xl border border-slate-200/80 bg-slate-50/60 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <Badge color="cyan" size="sm" className="font-bold">
                              {note.category || 'Catatan Bimbingan'}
                            </Badge>
                            <span className="text-[11px] text-slate-400">{formatDate(note.created_at)}</span>
                          </div>
                          <p className="text-xs font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                            {note.content || note.note}
                          </p>
                          <div className="flex items-center justify-between border-t border-slate-200/60 pt-2 text-[11px] text-slate-500 dark:border-slate-700">
                            <span>Guru: <span className="font-bold text-slate-700 dark:text-slate-300">{note.teacher?.name || 'Wali Kelas'}</span></span>
                            <span className="text-emerald-600 font-bold">Terverifikasi Sekolah</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                        Belum ada catatan buku penghubung baru dari guru.
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveModal(null)}
                      className="cursor-pointer"
                    >
                      Tutup
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setActiveModal(null)
                        navigate('/portal-orangtua')
                      }}
                      className="cursor-pointer !bg-purple-700 !text-white text-xs font-bold"
                    >
                      Buka Buku Penghubung Penuh
                    </Button>
                  </div>
                </>
              )}

              {/* MODAL 5: RINCIAN TAGIHAN & SPP */}
              {activeModal === 'bills' && (
                <>
                  <div className="flex items-center justify-between border-b border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                        <CreditCard className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">Rincian Tagihan & Histori Pembayaran SPP</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Santri: <span className="font-bold text-amber-700 dark:text-amber-400">{activeChild?.name}</span>
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-5 space-y-4">
                    {/* Rekening Card */}
                    <div className="rounded-xl border border-amber-300/60 bg-amber-50/70 p-3 text-xs dark:bg-amber-950/30 dark:border-amber-800/40">
                      <p className="font-bold text-amber-950 dark:text-amber-200">Rekening Resmi Pembayaran Pendidikan Yayasan:</p>
                      <p className="text-slate-600 dark:text-slate-300 mt-0.5">
                        Bank Syariah Indonesia (BSI) — No. Rekening: <span className="font-mono font-bold text-amber-900 dark:text-amber-200">777-1234-567</span> a.n. Yayasan Dar El-Iman Padang
                      </p>
                    </div>

                    {/* List Tagihan */}
                    <div className="space-y-3">
                      {bills.length > 0 ? (
                        bills.map((b) => {
                          const isPaid = String(b.status).toUpperCase() === 'PAID'
                          const payments = Array.isArray(b.payments) ? b.payments : []
                          return (
                            <div key={b.id} className="rounded-xl border border-slate-200 p-3.5 bg-white text-xs dark:border-slate-800 dark:bg-slate-800/50 space-y-2">
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">{b.fee_category?.name || 'SPP'}</span>
                                  <h4 className="font-bold text-slate-900 dark:text-white mt-0.5">{b.title}</h4>
                                  <p className="text-[11px] text-slate-500">Jatuh Tempo: {formatDate(b.due_date)}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-black text-slate-900 dark:text-white">{formatRupiah(b.amount)}</span>
                                  <div className="mt-1">
                                    <Badge color={isPaid ? 'success' : 'warning'} size="xs" className="font-bold">
                                      {isPaid ? 'LUNAS' : 'BELUM LUNAS'}
                                    </Badge>
                                  </div>
                                </div>
                              </div>

                              {payments.length > 0 && (
                                <div className="rounded-lg bg-slate-50 p-2 text-[11px] border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                                  <span className="font-bold text-slate-600 dark:text-slate-300">Kuitansi Resmi: </span>
                                  <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">{payments[0]?.invoice_number}</span>
                                  <span className="ml-2 text-slate-400">({payments[0]?.payment_method} • {formatDate(payments[0]?.paid_at)})</span>
                                </div>
                              )}
                            </div>
                          )
                        })
                      ) : (
                        <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-xl">
                          Tidak ada data tagihan terdaftar untuk santri ini.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 p-4 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setActiveModal(null)}
                      className="cursor-pointer"
                    >
                      Tutup
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setActiveModal(null)
                        navigate('/portal-orangtua')
                      }}
                      className="cursor-pointer !bg-[#0E5C44] !text-white text-xs font-bold"
                    >
                      Buka Lembar Keuangan Penuh
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

