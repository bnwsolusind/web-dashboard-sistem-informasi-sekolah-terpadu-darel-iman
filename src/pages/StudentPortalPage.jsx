import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  AlertCircle, Award, BookOpen, BookOpenCheck, CalendarCheck, CalendarDays, CheckCircle2, ChevronLeft, ChevronRight,
  CircleHelp, ClipboardList, Clock3, FileCheck2, GraduationCap, HeartHandshake, LayoutDashboard, Loader2, LockKeyhole,
  Megaphone, MessageCircle, Play, RefreshCw, Save, Send, ShieldCheck, Sparkles, TimerReset, UserRound, X,
} from 'lucide-react'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import api from '../services/api'
import { studentLmsService } from '../services/studentLmsService'
import StudentProfileWorkspace from '../components/portal/StudentProfileWorkspace'
import SchoolInformationWorkspace from '../components/portal/SchoolInformationWorkspace'
import ClassScheduleWorkspace from '../components/portal/ClassScheduleWorkspace'
import MaterialsWorkspace from '../components/portal/MaterialsWorkspace'
import AssignmentsWorkspace from '../components/portal/AssignmentsWorkspace'
import TahfizhWorkspace from '../components/portal/TahfizhWorkspace'
import GradesWorkspace from '../components/portal/GradesWorkspace'
import TeacherCommentsWorkspace from '../components/portal/TeacherCommentsWorkspace'
import MutabaahWorkspace from '../components/portal/MutabaahWorkspace'
import AttendanceWorkspace from '../components/portal/AttendanceWorkspace'
import ExamGridsWorkspace from '../components/portal/ExamGridsWorkspace'
import CbtExamsWorkspace from '../components/portal/CbtExamsWorkspace'
import ExamResultsWorkspace from '../components/portal/ExamResultsWorkspace'
import DashboardHeader from '../components/dashboard/DashboardHeader'
import { Button } from '../components/tailgrids/core/button'
import { Badge } from '../components/tailgrids/core/badge'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/tailgrids/core/card'
import { Alert, AlertContent, AlertDescription, AlertIndicator, AlertTitle } from '../components/tailgrids/core/alert'
import { useAuthStore } from '../stores/authStore'
import { isParentRole } from '../auth/portalResolver'

const tabs = [
  { id: 'ringkasan', label: 'Ringkasan', icon: LayoutDashboard, pastelColor: 'bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 hover:shadow-md hover:shadow-emerald-500/20' },
  { id: 'profile', label: 'Profil & Biodata', icon: UserRound, pastelColor: 'bg-sky-100/90 text-sky-700 hover:bg-sky-500 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-500 hover:shadow-md hover:shadow-sky-500/20' },
  { id: 'announcements', label: 'Informasi Sekolah', icon: Megaphone, pastelColor: 'bg-blue-100/90 text-blue-700 hover:bg-blue-600 hover:text-white dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-600 hover:shadow-md hover:shadow-blue-500/20' },
  { id: 'schedules', label: 'Jadwal', icon: CalendarDays, pastelColor: 'bg-purple-100/90 text-purple-700 hover:bg-purple-600 hover:text-white dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-600 hover:shadow-md hover:shadow-purple-500/20' },
  { id: 'materials', label: 'Materi', icon: BookOpen, pastelColor: 'bg-amber-100/90 text-amber-700 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 hover:shadow-md hover:shadow-amber-500/20' },
  { id: 'assignments', label: 'Tugas', icon: ClipboardList, pastelColor: 'bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-600 hover:shadow-md hover:shadow-rose-500/20' },
  { id: 'tahfizh', label: 'Tahfizh', icon: BookOpenCheck, pastelColor: 'bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 hover:shadow-md hover:shadow-emerald-500/20' },
  { id: 'grades', label: 'Nilai', icon: Award, pastelColor: 'bg-cyan-100/90 text-cyan-700 hover:bg-cyan-600 hover:text-white dark:bg-cyan-950/60 dark:text-cyan-300 dark:hover:bg-cyan-600 hover:shadow-md hover:shadow-cyan-500/20' },
  { id: 'student-notes', label: 'Komentar Guru', icon: MessageCircle, pastelColor: 'bg-indigo-100/90 text-indigo-700 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 hover:shadow-md hover:shadow-indigo-500/20' },
  { id: 'mutabaah', label: 'Mutabaah', icon: HeartHandshake, pastelColor: 'bg-amber-100/90 text-amber-700 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 hover:shadow-md hover:shadow-amber-500/20' },
  { id: 'attendance', label: 'Absensi', icon: CalendarCheck, pastelColor: 'bg-teal-100/90 text-teal-700 hover:bg-teal-600 hover:text-white dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-600 hover:shadow-md hover:shadow-teal-500/20' },
  { id: 'kisi', label: 'Kisi-kisi', icon: BookOpenCheck, pastelColor: 'bg-violet-100/90 text-violet-700 hover:bg-violet-600 hover:text-white dark:bg-violet-950/60 dark:text-violet-300 dark:hover:bg-violet-600 hover:shadow-md hover:shadow-violet-500/20' },
  { id: 'ujian', label: 'Ujian CBT', icon: FileCheck2, pastelColor: 'bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-600 hover:shadow-md hover:shadow-rose-500/20' },
  { id: 'hasil', label: 'Hasil', icon: Award, pastelColor: 'bg-cyan-100/90 text-cyan-700 hover:bg-cyan-600 hover:text-white dark:bg-cyan-950/60 dark:text-cyan-300 dark:hover:bg-cyan-600 hover:shadow-md hover:shadow-cyan-500/20' },
]

const studentPortalPaths = {
  ringkasan: '/portal-siswa', profile: '/portal-siswa/profil', announcements: '/portal-siswa/informasi-sekolah',
  schedules: '/portal-siswa/jadwal', materials: '/portal-siswa/materi', assignments: '/portal-siswa/tugas',
  tahfizh: '/portal-siswa/tahfizh', grades: '/portal-siswa/nilai', 'student-notes': '/portal-siswa/komentar-guru',
  mutabaah: '/portal-siswa/mutabaah', attendance: '/portal-siswa/absensi', kisi: '/portal-siswa/kisi-kisi',
  ujian: '/portal-siswa/ujian-cbt', hasil: '/portal-siswa/hasil',
}

const formatDate = (value) => value
  ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
  : 'Tanpa batas waktu'

const formatTimer = (seconds) => {
  const safe = Math.max(0, seconds || 0)
  return `${String(Math.floor(safe / 3600)).padStart(2, '0')}:${String(Math.floor((safe % 3600) / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}

const answerPayload = (answers) => Object.entries(answers).map(([soalId, answer]) => ({
  soal_id: soalId,
  jawaban_dipilih: answer.type === 'pg' || answer.type === 'benar_salah' ? answer.value : null,
  jawaban_esai: ['esai', 'isian', 'menjodohkan'].includes(answer.type) ? answer.value : null,
}))


function Notice({ type = 'error', children, action }) {
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle
  return (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200' : 'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-200'}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="flex-1">{children}</div>{action}
    </div>
  )
}

function MatchingAnswer({ items, value, onChange }) {
  const leftItems = items?.kiri || []
  const rightItems = items?.kanan || []
  let selected = []
  try { selected = JSON.parse(value || '[]') } catch { selected = [] }
  const update = (left, right) => {
    const next = leftItems.map((item) => ({
      kiri: item,
      kanan: item === left ? right : (selected.find((pair) => pair.kiri === item)?.kanan || ''),
    }))
    onChange(JSON.stringify(next))
  }
  return <div className="mt-6 space-y-3">{leftItems.map((left, itemIndex) => {
    const current = selected.find((pair) => pair.kiri === left)?.kanan || ''
    const usedByOthers = selected.filter((pair) => pair.kiri !== left).map((pair) => pair.kanan)
    return <div key={left} className="grid items-center gap-3 rounded-2xl border border-slate-200 p-4 dark:border-slate-700 sm:grid-cols-[1fr_auto_1fr]">
      <span className="text-sm font-semibold">{itemIndex + 1}. {left}</span><ChevronRight className="hidden h-4 w-4 text-slate-400 sm:block" />
      <select value={current} onChange={(event) => update(left, event.target.value)} className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800">
        <option value="">-- Pilih pasangan --</option>{rightItems.map((right) => <option key={right} value={right} disabled={usedByOthers.includes(right)}>{right}</option>)}
      </select>
    </div>
  })}</div>
}

function ExamWorkspace({ session, onClose, onFinished }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(() => Object.fromEntries((session.jawaban_tersimpan || []).map((item) => [item.soal_id, {
    type: session.soal.find((question) => question.id === item.soal_id)?.tipe_soal || (item.jawaban_esai != null ? 'esai' : 'pg'), value: item.jawaban_esai ?? item.jawaban_dipilih ?? '',
  }])))
  const [remaining, setRemaining] = useState(session.ujian.sisa_waktu_detik)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const finishLock = useRef(false)
  const answersRef = useRef(answers)
  answersRef.current = answers

  const save = useCallback(async (silent = false) => {
    if (!silent) setSaving(true)
    if (String(session.sesi_id).startsWith('mock-session-')) {
      setSavedAt(new Date().toISOString())
      if (!silent) setSaving(false)
      return
    }
    try {
      const response = await studentLmsService.saveAnswers(session.sesi_id, answerPayload(answersRef.current))
      setSavedAt(response.data?.saved_at || new Date().toISOString())
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Jawaban belum berhasil disimpan. Periksa koneksi Anda.')
    } finally {
      if (!silent) setSaving(false)
    }
  }, [session.sesi_id])

  const finish = useCallback(async (automatic = false) => {
    if (finishLock.current) return
    if (!automatic && !window.confirm('Yakin ingin mengumpulkan ujian? Jawaban tidak dapat diubah setelah dikumpulkan.')) return
    finishLock.current = true
    setSubmitting(true)
    if (String(session.sesi_id).startsWith('mock-session-')) {
      onFinished({
        sesi_id: session.sesi_id,
        nilai_final: 85,
        status: 'selesai',
        message: 'Ujian simulasi berhasil dikumpulkan.',
      })
      return
    }
    try {
      const response = await studentLmsService.finishExam(session.sesi_id, answerPayload(answersRef.current))
      onFinished(response.data)
    } catch (err) {
      finishLock.current = false
      setError(err.response?.data?.message || 'Ujian belum berhasil dikumpulkan.')
      setSubmitting(false)
    }
  }, [onFinished, session.sesi_id])

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining((value) => {
      if (value <= 1) {
        window.clearInterval(timer)
        finish(true)
        return 0
      }
      return value - 1
    }), 1000)
    return () => window.clearInterval(timer)
  }, [finish])

  useEffect(() => {
    const timer = window.setTimeout(() => save(true), 900)
    return () => window.clearTimeout(timer)
  }, [answers, save])

  useEffect(() => {
    const guard = (event) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', guard)
    return () => window.removeEventListener('beforeunload', guard)
  }, [])

  const question = session.soal[index]
  const answered = Object.values(answers).filter((answer) => {
    if (answer.type !== 'menjodohkan') return String(answer.value || '').trim()
    try { return JSON.parse(answer.value || '[]').some((pair) => pair.kanan) } catch { return false }
  }).length
  const selectAnswer = (value) => setAnswers((current) => ({ ...current, [question.id]: { type: question.tipe_soal, value } }))

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white">
      <header className="flex min-h-16 items-center justify-between gap-3 bg-[#0E5C44] px-4 py-3 text-white shadow-lg sm:px-6">
        <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">Ruang Ujian CBT</p><h1 className="truncate text-sm font-bold sm:text-base">{session.ujian.judul_ujian}</h1></div>
        <div className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 font-mono text-sm font-black ${remaining < 300 ? 'bg-rose-500' : 'bg-white/15'}`}><Clock3 className="h-4 w-4" />{formatTimer(remaining)}</div>
      </header>
      {error && <div className="px-4 pt-3 sm:px-6"><Notice>{error}</Notice></div>}
      <main className="grid min-h-0 flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[250px_1fr] lg:p-6">
        <aside className="hidden overflow-y-auto rounded-[18px] border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 lg:block">
          <div className="mb-3 flex items-center justify-between text-xs"><b>Navigasi soal</b><span>{answered}/{session.soal.length}</span></div>
          <div className="grid grid-cols-5 gap-2">{session.soal.map((item, itemIndex) => <button key={item.id} onClick={() => setIndex(itemIndex)} className={`aspect-square rounded-lg text-xs font-bold ${itemIndex === index ? 'bg-[#0E5C44] text-white ring-2 ring-emerald-200' : answers[item.id]?.value ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>{itemIndex + 1}</button>)}</div>
          <div className="mt-5 border-t border-slate-100 pt-4 text-[11px] text-slate-500 dark:border-slate-800"><ShieldCheck className="mb-2 h-5 w-5 text-emerald-600" />Jawaban disimpan otomatis setiap kali berubah.</div>
        </aside>
        <section className="min-h-0 overflow-y-auto rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-slate-800"><span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Soal {index + 1} dari {session.soal.length}</span><span className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-bold dark:bg-slate-800">{question?.poin} poin</span></div>
          {question ? <div className="mx-auto max-w-3xl py-6">
            <p className="whitespace-pre-wrap text-sm font-semibold leading-7 sm:text-base">{question.pertanyaan}</p>
            {question.tipe_soal === 'pg' && <div className="mt-6 space-y-3">{question.opsi.filter((option) => option.text).map((option) => <button key={option.key} onClick={() => selectAnswer(option.key)} className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left text-sm transition ${answers[question.id]?.value === option.key ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-100 dark:bg-emerald-950/40' : 'border-slate-200 hover:border-emerald-300 dark:border-slate-700'}`}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-bold dark:bg-slate-800">{option.key}</span><span className="pt-1">{option.text}</span></button>)}</div>}
            {question.tipe_soal === 'benar_salah' && <div className="mt-6 grid gap-3 sm:grid-cols-2">{['Benar', 'Salah'].map((value) => <button key={value} onClick={() => selectAnswer(value.toLowerCase())} className={`h-14 rounded-2xl border font-bold ${answers[question.id]?.value === value.toLowerCase() ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950' : 'border-slate-200 dark:border-slate-700'}`}>{value}</button>)}</div>}
            {question.tipe_soal === 'esai' && <textarea rows={8} value={answers[question.id]?.value || ''} onChange={(event) => selectAnswer(event.target.value)} placeholder="Tuliskan jawaban Anda dengan jelas..." className="mt-6 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800" />}
            {question.tipe_soal === 'isian' && <input value={answers[question.id]?.value || ''} onChange={(event) => selectAnswer(event.target.value)} placeholder="Tuliskan jawaban singkat..." className="mt-6 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-800" />}
            {question.tipe_soal === 'menjodohkan' && <MatchingAnswer items={question.pasangan_menjodohkan} value={answers[question.id]?.value || ''} onChange={selectAnswer} />}
          </div> : <Notice>Soal tidak tersedia. Hubungi pengawas ujian.</Notice>}
        </section>
      </main>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
        <div className="flex items-center gap-2 text-[11px] text-slate-500">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-emerald-600" />}{saving ? 'Menyimpan...' : savedAt ? `Tersimpan ${new Date(savedAt).toLocaleTimeString('id-ID')}` : 'Penyimpanan otomatis aktif'}</div>
        <div className="flex gap-2">
          <button onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0} className="flex h-10 items-center gap-1 rounded-xl border border-slate-200 px-3 text-xs font-bold disabled:opacity-40 dark:border-slate-700"><ChevronLeft className="h-4 w-4" />Sebelumnya</button>
          {index < session.soal.length - 1 ? <button onClick={() => setIndex((value) => value + 1)} className="flex h-10 items-center gap-1 rounded-xl bg-slate-900 px-4 text-xs font-bold text-white dark:bg-white dark:text-slate-900">Berikutnya<ChevronRight className="h-4 w-4" /></button> : <button onClick={() => finish(false)} disabled={submitting} className="flex h-10 items-center gap-2 rounded-xl bg-[#0E5C44] px-4 text-xs font-bold text-white disabled:opacity-60">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Kumpulkan</button>}
        </div>
      </footer>
      <button onClick={() => { if (window.confirm('Keluar dari tampilan ujian? Sesi dan waktu tetap berjalan.')) onClose() }} className="absolute right-2 top-[70px] rounded-full bg-white p-2 text-slate-500 shadow lg:right-5" title="Tutup ruang ujian"><X className="h-4 w-4" /></button>
    </div>
  )
}

export default function StudentPortalPage({ section = 'ringkasan' }) {
  const navigate = useNavigate()
  const user = useAuthStore((state) => state.user)
  const roles = Array.isArray(user?.roles) ? user.roles : []
  const isParent = isParentRole(roles)
  const activeTab = tabs.some(({ id }) => id === section) ? section : 'ringkasan'
  const [dashboard, setDashboard] = useState(null)
  const [lms, setLms] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [startingId, setStartingId] = useState(null)
  const [session, setSession] = useState(null)
  const [result, setResult] = useState(null)
  const [portalRecords, setPortalRecords] = useState([])
  const [permissionsRecords, setPermissionsRecords] = useState([])
  const [examGridsRecords, setExamGridsRecords] = useState([])
  const [resultsData, setResultsData] = useState(null)
  const [reportsRecords, setReportsRecords] = useState([])
  const [panelLoading, setPanelLoading] = useState(false)
  const [dashboardModules, setDashboardModules] = useState({})

  const load = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const [dashboardResponse, lmsResponse] = await Promise.all([api.get('/portal/dashboard'), studentLmsService.overview()])
      setDashboard(dashboardResponse.data.data); setLms(lmsResponse.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Portal LMS belum berhasil dimuat.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { load() }, [load])

  const selectTab = (id) => navigate(studentPortalPaths[id])

  useEffect(() => {
    const resources = ['profile', 'announcements', 'schedules', 'materials', 'assignments', 'student-notes', 'tahfizh', 'grades', 'mutabaah', 'attendance']
    if (activeTab === 'attendance') {
      setPanelLoading(true)
      Promise.all([api.get('/portal/attendance'), api.get('/portal/permissions')])
        .then(([attRes, permRes]) => {
          setPortalRecords(attRes.data?.data?.data ?? attRes.data?.data ?? [])
          setPermissionsRecords(permRes.data?.data?.data ?? permRes.data?.data ?? [])
        })
        .catch((err) => setError(err.response?.data?.message || 'Data belum berhasil dimuat.'))
        .finally(() => setPanelLoading(false))
      return
    }

    if (activeTab === 'kisi') {
      setPanelLoading(true)
      api.get('/portal/exam-grids')
        .then((res) => setExamGridsRecords(res.data?.data?.data ?? res.data?.data ?? []))
        .catch(() => setExamGridsRecords([]))
        .finally(() => setPanelLoading(false))
      return
    }

    if (activeTab === 'hasil') {
      setPanelLoading(true)
      Promise.all([api.get('/portal/results'), api.get('/portal/reports')])
        .then(([resRes, repRes]) => {
          setResultsData(resRes.data?.data ?? null)
          setReportsRecords(repRes.data?.data ?? [])
        })
        .catch(() => setResultsData(null))
        .finally(() => setPanelLoading(false))
      return
    }

    if (!resources.includes(activeTab)) return

    const unwrapList = (res) => {
      if (Array.isArray(res?.data?.data?.data)) return res.data.data.data
      if (Array.isArray(res?.data?.data)) return res.data.data
      if (Array.isArray(res?.data)) return res.data
      if (Array.isArray(res)) return res
      return []
    }

    setPanelLoading(true)
    setPortalRecords([])
    api.get(`/portal/${activeTab}`).then((response) => {
      setPortalRecords(activeTab === 'grades' ? (response.data?.data || null) : unwrapList(response))
    }).catch((err) => setError(err.response?.data?.message || 'Data belum berhasil dimuat.')).finally(() => setPanelLoading(false))
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'ringkasan') return
    let cancelled = false
    const resources = ['materials', 'student-notes', 'tahfizh', 'grades', 'attendance']
    const unwrapList = (res) => {
      if (Array.isArray(res?.data?.data?.data)) return res.data.data.data
      if (Array.isArray(res?.data?.data)) return res.data.data
      if (Array.isArray(res?.data)) return res.data
      if (Array.isArray(res)) return res
      return []
    }
    Promise.all(resources.map((resource) => api.get(`/portal/${resource}`)))
      .then((responses) => {
        if (cancelled) return
        setDashboardModules(Object.fromEntries(resources.map((resource, index) => [
          resource,
          unwrapList(responses[index]),
        ])))
      })
      .catch(() => { if (!cancelled) setDashboardModules({}) })
    return () => { cancelled = true }
  }, [activeTab])

  const handleAssignmentSubmit = async (assignmentId, payload) => {
    const formData = new FormData()
    if (payload.jawaban_teks) formData.append('jawaban_teks', payload.jawaban_teks)
    if (payload.file_lampiran) formData.append('file_lampiran', payload.file_lampiran)

    await api.post(`/portal/assignments/${assignmentId}/submit`, formData)
    const response = await api.get('/portal/assignments')
    const unwrapList = (res) => {
      if (Array.isArray(res?.data?.data?.data)) return res.data.data.data
      if (Array.isArray(res?.data?.data)) return res.data.data
      if (Array.isArray(res?.data)) return res.data
      if (Array.isArray(res)) return res
      return []
    }
    setPortalRecords(unwrapList(response))
  }

  const handleSaveMutabaah = async (activityIds) => {
    await api.post('/portal/mutabaah', { activity_ids: activityIds })
    const response = await api.get('/portal/mutabaah')
    setPortalRecords(response.data?.data ?? null)
  }

  const handleSubmitPermission = async (payload) => {
    const formData = new FormData()
    formData.append('type', payload.type)
    formData.append('start_date', payload.start_date)
    formData.append('end_date', payload.end_date)
    formData.append('reason', payload.reason)
    if (payload.attachment) formData.append('attachment', payload.attachment)

    await api.post('/portal/permissions', formData)
    const [attRes, permRes] = await Promise.all([api.get('/portal/attendance'), api.get('/portal/permissions')])
    setPortalRecords(attRes.data?.data?.data ?? attRes.data?.data ?? [])
    setPermissionsRecords(permRes.data?.data?.data ?? permRes.data?.data ?? [])
  }

  const exams = useMemo(() => lms?.exams || [], [lms?.exams])
  const blueprints = useMemo(() => exams.filter((exam) => exam.kisi_kisi), [exams])

  const start = async (exam) => {
    setStartingId(exam.id); setError('')
// Always fetch real exam session from backend
    try { const response = await studentLmsService.startExam(exam.id); setSession(response.data) }
    catch (err) { setError(err.response?.data?.message || 'Ujian tidak dapat dimulai.') }
    finally { setStartingId(null) }
  }

  const finish = async (examResult) => { setSession(null); setResult(examResult); navigate(studentPortalPaths.hasil); await load() }

  if (loading) return <div className="portal-page animate-pulse space-y-5"><div className="h-36 rounded-[18px] bg-slate-200 dark:bg-slate-800" /><div className="h-12 rounded-2xl bg-slate-200 dark:bg-slate-800" /></div>

const KpiCardPastelStyles = {
  emerald: {
    card: 'border-emerald-200/80 bg-emerald-50/40 hover:border-emerald-300 dark:border-emerald-950/60 dark:bg-emerald-950/20',
    iconBg: 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    title: 'text-emerald-800 dark:text-emerald-300',
    val: 'text-emerald-950 dark:text-white',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    btn: 'text-emerald-700 hover:text-emerald-800 dark:text-emerald-400',
  },
  blue: {
    card: 'border-blue-200/80 bg-blue-50/40 hover:border-blue-300 dark:border-blue-950/60 dark:bg-blue-950/20',
    iconBg: 'bg-blue-100/80 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    title: 'text-blue-800 dark:text-blue-300',
    val: 'text-blue-950 dark:text-white',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
    btn: 'text-blue-700 hover:text-blue-800 dark:text-blue-400',
  },
  amber: {
    card: 'border-amber-200/80 bg-amber-50/40 hover:border-amber-300 dark:border-amber-950/60 dark:bg-amber-950/20',
    iconBg: 'bg-amber-100/80 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    title: 'text-amber-800 dark:text-amber-300',
    val: 'text-amber-950 dark:text-white',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
    btn: 'text-amber-700 hover:text-amber-800 dark:text-amber-400',
  },
  purple: {
    card: 'border-purple-200/80 bg-purple-50/40 hover:border-purple-300 dark:border-purple-950/60 dark:bg-purple-950/20',
    iconBg: 'bg-purple-100/80 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    title: 'text-purple-800 dark:text-purple-300',
    val: 'text-purple-950 dark:text-white',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
    btn: 'text-purple-700 hover:text-purple-800 dark:text-purple-400',
  },
  rose: {
    card: 'border-rose-200/80 bg-rose-50/40 hover:border-rose-300 dark:border-rose-950/60 dark:bg-rose-950/20',
    iconBg: 'bg-rose-100/80 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    title: 'text-rose-800 dark:text-rose-300',
    val: 'text-rose-950 dark:text-white',
    sub: 'text-rose-600/80 dark:text-rose-400/80',
    btn: 'text-rose-700 hover:text-rose-800 dark:text-rose-400',
  },
  cyan: {
    card: 'border-cyan-200/80 bg-cyan-50/40 hover:border-cyan-300 dark:border-cyan-950/60 dark:bg-cyan-950/20',
    iconBg: 'bg-cyan-100/80 text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300',
    title: 'text-cyan-800 dark:text-cyan-300',
    val: 'text-cyan-950 dark:text-white',
    sub: 'text-cyan-600/80 dark:text-cyan-400/80',
    btn: 'text-cyan-700 hover:text-cyan-800 dark:text-cyan-400',
  },
}

  const student = lms?.student || dashboard?.student
  const dashboardCards = [
    ['profile', 'Profil & Biodata', student?.full_name || 'Profil siswa', 'Data identitas dan kelas aktif', UserRound, 'emerald'],
    ['announcements', 'Informasi Sekolah', dashboard?.announcements?.length || 0, 'informasi terbaru', Megaphone, 'blue'],
    ['schedules', 'Jadwal', dashboard?.schedules_today?.length || 0, 'pelajaran hari ini', CalendarDays, 'purple'],
    ['materials', 'Materi', dashboardModules.materials?.length || 0, 'materi dipublikasikan', BookOpen, 'amber'],
    ['assignments', 'Tugas', dashboard?.active_assignments?.length || 0, 'tugas aktif', ClipboardList, 'rose'],
    ['tahfizh', 'Tahfizh', dashboard?.kpi?.total_tahfizh_ayat || 0, 'total ayat tercatat', BookOpenCheck, 'emerald'],
    ['grades', 'Nilai', dashboard?.latest_grades?.length || dashboardModules.grades?.length || 0, 'nilai terbaru', Award, 'cyan'],
    ['student-notes', 'Komentar Guru', dashboardModules['student-notes']?.length || 0, 'komentar tersedia', MessageCircle, 'blue'],
    ['mutabaah', 'Mutabaah', dashboard?.kpi?.mutabaah_status || 'Belum diisi', 'status hari ini', HeartHandshake, 'amber'],
    ['attendance', 'Absensi', dashboard?.attendance_today || 'Belum diinput', 'kehadiran hari ini', CalendarCheck, 'emerald'],
    ['kisi', 'Kisi-kisi', blueprints.length, 'kisi-kisi tersedia', BookOpenCheck, 'purple'],
    ['ujian', 'Ujian CBT', lms?.summary?.available || 0, 'siap dikerjakan', FileCheck2, 'rose'],
    ['hasil', 'Hasil', exams.filter((exam) => exam.latest_result).length, 'hasil ujian tersedia', Award, 'cyan'],
  ]

  return (
    <div className="portal-page min-w-0 space-y-6 pb-12 text-slate-800 dark:text-slate-100">
      {session && <ExamWorkspace session={session} onClose={() => setSession(null)} onFinished={finish} />}

      {/* BREADCRUMB NAV */}
      <AppBreadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Portal Siswa', href: '/portal-siswa' },
          ...(activeTab !== 'ringkasan' ? [{ label: tabs.find((t) => t.id === activeTab)?.label || activeTab }] : []),
        ]}
      />

      {/* MODERN HERO CARD HEADER (MATCHING PORTAL ORANG TUA STYLE) */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <GraduationCap className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Portal Peserta Didik Terpadu
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    Siswa: {student?.full_name || 'Ahmad Zaky'} ({student?.kelas?.nama_kelas || student?.unit?.name || 'Sekolah Terpadu'})
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {activeTab === 'ringkasan' ? 'Portal Siswa / Peserta Didik' : tabs.find((t) => t.id === activeTab)?.label || 'Portal Siswa'}
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Akses jadwal, tugas, materi, CBT, nilai, Tahfizh, dan Mutaba'ah dalam satu ruang belajar terpadu.
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* CARD NAVIGASI MENU PORTAL SISWA */}
      <Card className="overflow-hidden border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 rounded-[22px]">
        <CardContent className="p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shadow-xs">
                <LayoutDashboard className="h-4 w-4" />
              </span>
              <div>
                <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">
                  Navigasi Menu Portal Siswa
                </h2>
                <p className="text-[11px] text-slate-400">
                  Pemanggilan menu modul via tombol di bawah ini:
                </p>
              </div>
            </div>
            <Badge color="primary" size="sm" className="hidden sm:inline-flex font-bold uppercase tracking-wider text-[10px]">
              {tabs.length} Menu Modul
            </Badge>
          </div>
          {/* TOMBOL BUTTON GRID WITH TAILGRIDS PASTEL ACCENTS */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            {tabs.map(({ id, label, icon: Icon, pastelColor }) => {
              const isActive = activeTab === id
              return (
                <div key={id} className="group relative inline-flex">
                  <Button
                    type="button"
                    variant={isActive ? 'primary' : 'ghost'}
                    appearance={isActive ? 'fill' : 'outline'}
                    size="xs"
                    onClick={() => selectTab(id)}
                    prefixIcon={<Icon className="h-4 w-4 shrink-0 transition-transform duration-200" />}
                    className={`cursor-pointer transition-all duration-200 font-bold ${
                      isActive
                        ? '!bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/40 scale-[1.02]'
                        : `${pastelColor} border-transparent`
                    }`}
                  >
                    {label}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-bold text-rose-700 dark:border-rose-900 dark:bg-rose-950/30">
            <AlertCircle className="h-5 w-5" />
            <span className="flex-1">{error}</span>
            <button onClick={load}><RefreshCw className="h-4 w-4" /></button>
          </div>
        )}

        {panelLoading && activeTab === 'profile' && (
          <div className="animate-pulse space-y-5">
            <div className="h-56 rounded-[18px] bg-slate-200 dark:bg-slate-800" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[1,2,3,4].map((item) => <div key={item} className="h-32 rounded-[18px] bg-slate-200 dark:bg-slate-800" />)}
            </div>
            <div className="h-96 rounded-[18px] bg-slate-200 dark:bg-slate-800" />
          </div>
        )}

        {activeTab === 'ringkasan' && (
          <section className="space-y-5">
            <Card className="p-5 border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 rounded-[20px]">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Dashboard Siswa</h2>
                  <p className="mt-1 text-xs text-slate-500">Ringkasan baca-saja dari seluruh layanan portal. Pengelolaan data dilakukan oleh modul utama.</p>
                </div>
                <Badge color="sky" size="sm" className="font-extrabold uppercase">
                  PORTAL SISWA AKTIF
                </Badge>
              </div>
            </Card>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {dashboardCards.map(([id, label, value, description, Icon, tone = 'emerald']) => {
                const pastel = KpiCardPastelStyles[tone] || KpiCardPastelStyles.emerald
                return (
                  <Card
                    key={id}
                    className={`flex min-h-44 flex-col rounded-[20px] border p-5 shadow-xs transition-all duration-200 hover:shadow-md cursor-pointer ${pastel.card}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${pastel.iconBg}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        appearance="outline"
                        size="xs"
                        onClick={() => selectTab(id)}
                        className="!px-2.5 !py-1 text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:text-emerald-700"
                      >
                        Buka
                      </Button>
                    </div>
                    <p className={`mt-4 text-xs font-extrabold ${pastel.title}`}>{label}</p>
                    <p className={`mt-1 line-clamp-1 text-xl font-black ${pastel.val}`}>{value}</p>
                    <p className={`mt-1 text-[11px] ${pastel.sub}`}>{description}</p>
                    <Button
                      type="button"
                      variant="ghost"
                      appearance="outline"
                      size="xs"
                      onClick={() => selectTab(id)}
                      className={`mt-auto pt-3 text-left text-xs font-bold !border-none !px-0 !justify-start ${pastel.btn}`}
                    >
                      Buka menu {label} →
                    </Button>
                  </Card>
                )
              })}
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="p-5 border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 rounded-[20px] lg:col-span-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tugas Terdekat</h3>
                <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                  {(dashboard?.active_assignments || []).slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-3 py-3">
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.judul}</p>
                        <p className="mt-1 text-[11px] text-slate-500">{item.subject?.name || 'Mata pelajaran'}</p>
                      </div>
                      <Badge color="warning" size="sm" className="font-bold">
                        {formatDate(item.deadline)}
                      </Badge>
                    </div>
                  ))}
                  {!dashboard?.active_assignments?.length && <p className="py-8 text-center text-xs text-slate-400">Tidak ada tugas aktif.</p>}
                </div>
              </Card>

              <Card className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white dark:from-emerald-950 dark:to-slate-900 border border-slate-800 rounded-[20px] shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-300">Kelas Aktif</p>
                  <Badge color="success" size="sm" className="font-bold uppercase">
                    Aktif
                  </Badge>
                </div>
                <p className="mt-1.5 text-lg font-black text-white">{student?.kelas?.nama_kelas || student?.kelas?.name || 'Belum ditentukan'}</p>
                <p className="mt-2 text-xs text-emerald-200/80 font-mono">NIS: {student?.nis || '-'}</p>
                <p className="mt-4 text-xs leading-relaxed text-slate-300/90 border-t border-slate-800/80 pt-3">
                  Portal Siswa memantau progres akademik, ibadah, tugas, dan ujian CBT secara terpadu.
                </p>
              </Card>
            </div>
          </section>
        )}

        {!panelLoading && activeTab === 'profile' && (
          <StudentProfileWorkspace student={portalRecords} dashboard={dashboard || {}} onNavigate={selectTab} readOnly />
        )}

        {activeTab === 'announcements' && (
          <SchoolInformationWorkspace student={student} embedded />
        )}

        {panelLoading && ['schedules','materials','assignments','tahfizh','grades','mutabaah','attendance','kisi','ujian','hasil'].includes(activeTab) && (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        )}

        {!panelLoading && activeTab === 'schedules' && (
          <ClassScheduleWorkspace schedules={portalRecords} loading={panelLoading} />
        )}

        {!panelLoading && activeTab === 'materials' && (
          <MaterialsWorkspace materials={portalRecords} loading={panelLoading} />
        )}

        {!panelLoading && activeTab === 'assignments' && (
          <AssignmentsWorkspace
            assignments={portalRecords}
            onSubmitAssignment={handleAssignmentSubmit}
            isParent={isParent}
            loading={panelLoading}
          />
        )}

        {!panelLoading && activeTab === 'tahfizh' && (
          <TahfizhWorkspace logs={portalRecords} target={dashboard?.tahfizh_target} loading={panelLoading} />
        )}

        {!panelLoading && activeTab === 'grades' && (
          <GradesWorkspace grades={portalRecords} loading={panelLoading} />
        )}

        {!panelLoading && activeTab === 'student-notes' && (
          <TeacherCommentsWorkspace comments={portalRecords} loading={panelLoading} />
        )}

        {!panelLoading && activeTab === 'mutabaah' && (
          <MutabaahWorkspace
            mutabaah={portalRecords}
            onSaveMutabaah={handleSaveMutabaah}
            isParent={isParent}
            readOnly
            loading={panelLoading}
          />
        )}

        {!panelLoading && activeTab === 'attendance' && (
          <AttendanceWorkspace
            attendanceLogs={portalRecords}
            permissionsHistory={permissionsRecords}
            onSubmitPermission={handleSubmitPermission}
            isParent={isParent}
            loading={panelLoading}
          />
        )}

        {!panelLoading && activeTab === 'kisi' && (
          <ExamGridsWorkspace grids={examGridsRecords.length ? examGridsRecords : blueprints} loading={panelLoading} />
        )}

        {!panelLoading && activeTab === 'ujian' && (
          <CbtExamsWorkspace
            lmsData={lms}
            onStartExam={start}
            isParent={isParent}
            startingId={startingId}
            loading={panelLoading}
          />
        )}

        {!panelLoading && activeTab === 'hasil' && (
          <ExamResultsWorkspace resultsData={resultsData} reports={reportsRecords} loading={panelLoading} />
        )}
    </div>
  )
}
