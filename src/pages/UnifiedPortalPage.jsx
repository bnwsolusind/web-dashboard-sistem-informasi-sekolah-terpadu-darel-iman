import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import {
  motion
} from 'framer-motion'
import {
  useSearchParams,
  useNavigate
} from 'react-router-dom'
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
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Clock,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  GraduationCap,
  HeartHandshake,
  Home,
  Info,
  LayoutDashboard,
  LayoutGrid,
  Loader2,
  LockKeyhole,
  Megaphone,
  MessageCircle,
  Moon,
  Play,
  Plus,
  Receipt,
  RefreshCw,
  Save,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  TimerReset,
  UserCheck,
  UserRound,
  Users,
  X,
  Zap
} from 'lucide-react'

import Swal from '@/components/ui/compat/swal-heroui'
import {
  familyPortalService
} from '../services/familyPortalService'
import {
  studentLmsService
} from '../services/studentLmsService'
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
import ParentBillsWorkspace from '../components/portal/ParentBillsWorkspace'
import ChatGuruWorkspace from '../components/portal/ChatGuruWorkspace'
import AcademicCalendarModal from '../components/calendar/AcademicCalendarModal'
import {
  useAuthStore
} from '../stores/authStore'

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

const baseMenuItems = [
  ['ringkasan', 'Dashboard', Sparkles, 'bg-sky-100/90 text-sky-600 border-emerald-200/80 hover:bg-sky-200'],
  ['profile', 'Profil & Biodata', UserRound, 'bg-blue-100/90 text-blue-600 border-emerald-200/80 hover:bg-blue-200'],
  ['calendar', 'Kalender Akademik', CalendarDays, 'bg-cyan-100/90 text-cyan-600 border-emerald-200/80 hover:bg-cyan-200'],
  ['announcements', 'Informasi Sekolah', Megaphone, 'bg-indigo-100/90 text-indigo-600 border-emerald-200/80 hover:bg-indigo-200'],
  ['schedules', 'Jadwal', CalendarDays, 'bg-violet-100/90 text-violet-600 border-emerald-200/80 hover:bg-violet-200'],
  ['materials', 'Materi', BookOpen, 'bg-purple-100/90 text-purple-600 border-emerald-200/80 hover:bg-purple-200'],
  ['assignments', 'Tugas', ClipboardList, 'bg-fuchsia-100/90 text-fuchsia-600 border-emerald-200/80 hover:bg-fuchsia-200'],
  ['tahfizh', 'Tahfizh', BookOpenCheck, 'bg-emerald-100/90 text-emerald-600 border-emerald-200/90 hover:bg-emerald-200'],
  ['grades', 'Nilai', Award, 'bg-teal-100/90 text-teal-600 border-emerald-200/80 hover:bg-teal-200'],
  ['student-notes', 'Buku Penghubung', BookOpenCheck, 'bg-cyan-100/90 text-cyan-600 border-emerald-200/80 hover:bg-cyan-200'],
  ['bills', 'Tagihan & SPP', Receipt, 'bg-emerald-100/90 text-emerald-600 border-emerald-200/90 hover:bg-emerald-200'],
  ['mutabaah', 'Mutabaah', HeartHandshake, 'bg-amber-100/90 text-amber-600 border-emerald-200/80 hover:bg-amber-200'],
  ['attendance', 'Absensi', CalendarCheck, 'bg-orange-100/90 text-orange-600 border-emerald-200/90 hover:bg-orange-200'],
  ['kisi', 'Kisi-kisi', FileText, 'bg-yellow-100/90 text-yellow-700 border-emerald-200/80 hover:bg-yellow-200'],
  ['ujian', 'Ujian CBT', FileCheck2, 'bg-lime-100/90 text-lime-700 border-emerald-200/80 hover:bg-lime-200'],
  ['hasil', 'Hasil & Rapor', Award, 'bg-rose-100/90 text-rose-600 border-emerald-200/80 hover:bg-rose-200'],
  ['chat', 'Chat Guru / Musyrif', MessageCircle, 'bg-pink-100/90 text-pink-600 border-emerald-200/80 hover:bg-pink-200'],
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
    <div className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${type === 'success' ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-200' : 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 text-rose-800 dark:border-emerald-800/60 dark:bg-rose-950/30 dark:text-rose-200'}`}>
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
    return <div key={left} className="grid items-center gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 p-4 dark:border-emerald-700/80 sm:grid-cols-[1fr_auto_1fr]">
      <span className="text-sm font-semibold">{itemIndex + 1}. {left}</span><ChevronRight className="hidden h-4 w-4 text-slate-400 sm:block" />
      <CustomSelect value={current} onChange={(event) => update(left, event.target.value)} className="h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 px-3 text-sm outline-none focus:border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 dark:bg-slate-800">
        <option value="">-- Pilih pasangan --</option>{rightItems.map((right) => <option key={right} value={right} disabled={usedByOthers.includes(right)}>{right}</option>)}
      </CustomSelect>
    </div>
  })}</div>
}

function ExamWorkspace({ session, onClose, onFinished }) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState(() => Object.fromEntries((session.jawaban_tersimpan || []).map((item) => [item.soal_id, {
    type: session.soal.find((question) => question.id === item.soal_id)?.tipe_soal || (item.jawaban_esai != null ? 'esai' : 'pg'), value: item.jawaban_esai ?? item.jawaban_dipilih ?? '',
  }])))
  const [doubtful, setDoubtful] = useState({})
  const [remaining, setRemaining] = useState(session.ujian.sisa_waktu_detik)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const finishLock = useRef(false)
  const answersRef = useRef(answers)
  answersRef.current = answers

  const toggleDoubtful = useCallback((qId) => {
    setDoubtful((prev) => ({ ...prev, [qId]: !prev[qId] }))
  }, [])

  const save = useCallback(async (silent = false) => {
    if (!silent) setSaving(true)
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
    const doubtCount = Object.values(doubtful).filter(Boolean).length
    const doubtMsg = doubtCount > 0 ? `\nPerhatian: Ada ${doubtCount} soal yang masih ditandai ragu-ragu.` : ''
    if (!automatic) {
      const confirmResult = await Swal.fire({
        title: 'Kumpulkan Ujian?',
        text: `Jawaban tidak dapat diubah setelah dikumpulkan.${doubtMsg}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Kumpulkan Ujian',
        cancelButtonText: 'Kembali Periksa',
        confirmButtonColor: '#059669',
      })
      if (!confirmResult.isConfirmed) return
    }
    finishLock.current = true
    setSubmitting(true)
    try {
      const response = await studentLmsService.finishExam(session.sesi_id, answerPayload(answersRef.current))
      onFinished(response.data)
    } catch (err) {
      finishLock.current = false
      setError(err.response?.data?.message || 'Ujian belum berhasil dikumpulkan.')
      setSubmitting(false)
    }
  }, [doubtful, onFinished, session.sesi_id])

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
      <header className="flex min-h-16 items-center justify-between gap-3 bg-[#059669] px-4 py-3 text-white shadow-lg sm:px-6">
        <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">Ruang Ujian CBT</p><h1 className=" text-sm font-semibold sm:text-base">{session.ujian.judul_ujian}</h1></div>
        <div className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 font-mono text-sm font-black ${remaining < 300 ? 'bg-rose-500' : 'bg-white/15'}`}><Clock3 className="h-4 w-4" />{formatTimer(remaining)}</div>
      </header>
      {error && <div className="px-4 pt-3 sm:px-6"><Notice>{error}</Notice></div>}
      <main className="grid min-h-0 flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[250px_1fr] lg:p-6">
        <aside className="hidden overflow-y-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 dark:border-emerald-800/60 dark:bg-slate-900 lg:block">
          <div className="mb-3 flex items-center justify-between text-xs"><b>Navigasi soal</b><span>{answered}/{session.soal.length}</span></div>
          <div className="grid grid-cols-5 gap-2">
            {session.soal.map((item, itemIndex) => {
              const isCurrent = itemIndex === index
              const isDoubt = Boolean(doubtful[item.id])
              const isDone = Boolean(answers[item.id]?.value)

              let colorClasses = 'bg-slate-100 text-slate-500 dark:bg-slate-800'
              if (isCurrent) {
                colorClasses = isDoubt
                  ? 'bg-amber-500 text-white ring-2 ring-amber-300'
                  : 'bg-[#059669] text-white ring-2 ring-emerald-200'
              } else if (isDoubt) {
                colorClasses = 'bg-amber-100 text-amber-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/80 dark:text-amber-200 dark:border-emerald-800/60 font-black'
              } else if (isDone) {
                colorClasses = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
              }

              return (
                <button
                  key={item.id}
                  onClick={() => setIndex(itemIndex)}
                  className={`relative flex aspect-square items-center justify-center rounded-lg text-xs font-bold transition ${colorClasses}`}
                >
                  {itemIndex + 1}
                  {isDoubt && (
                    <span className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>
              )
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2.5 border-t border-emerald-200/80 pt-3 text-[10px] font-semibold text-slate-500 dark:border-emerald-800/60">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Terjawab</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-500" />Ragu-ragu</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-slate-300 dark:bg-slate-700" />Belum</span>
          </div>
          <div className="mt-4 border-t border-emerald-200/80 pt-4 text-xs text-slate-500 dark:border-emerald-800/60"><ShieldCheck className="mb-2 h-5 w-5 text-emerald-600" />Jawaban disimpan otomatis setiap kali berubah.</div>
        </aside>
        <section className="min-h-0 overflow-y-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4 dark:border-emerald-800/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Soal {index + 1} dari {session.soal.length}</span>
              <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold dark:bg-slate-800">{question?.poin} poin</span>
            </div>
            {question && (
              <button
                type="button"
                onClick={() => toggleDoubtful(question.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition ${doubtful[question.id]
                  ? 'border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-500 text-white shadow-xs'
                  : 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white text-slate-600 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:text-amber-700 dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300'
                  }`}
              >
                <AlertCircle className="h-3.5 w-3.5" />
                {doubtful[question.id] ? 'Ragu-ragu (Ditandai)' : 'Tandai Ragu-ragu'}
              </button>
            )}
          </div>
          {question ? <div className="mx-auto max-w-3xl py-6">
            <p className="whitespace-pre-wrap text-sm font-semibold leading-7 sm:text-base">{question.pertanyaan}</p>
            {question.tipe_soal === 'pg' && <div className="mt-6 space-y-3">{question.opsi.filter((option) => option.text).map((option) => <button key={option.key} onClick={() => selectAnswer(option.key)} className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left text-sm transition ${answers[question.id]?.value === option.key ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 ring-2 ring-emerald-100 dark:bg-emerald-950/40' : 'border-emerald-200/80 hover:border-emerald-300 dark:hover:border-emerald-700/80 dark:border-emerald-700/80'}`}><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-50 font-bold dark:bg-emerald-950/40">{option.key}</span><span className="pt-1">{option.text}</span></button>)}</div>}
            {question.tipe_soal === 'benar_salah' && <div className="mt-6 grid gap-3 sm:grid-cols-2">{['Benar', 'Salah'].map((value) => <button key={value} onClick={() => selectAnswer(value.toLowerCase())} className={`h-14 rounded-xl border font-bold ${answers[question.id]?.value === value.toLowerCase() ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 text-emerald-700 dark:bg-emerald-950' : 'border-emerald-200/80 dark:border-emerald-700/80'}`}>{value}</button>)}</div>}
            {question.tipe_soal === 'esai' && <textarea rows={8} value={answers[question.id]?.value || ''} onChange={(event) => selectAnswer(event.target.value)} placeholder="Tuliskan jawaban Anda dengan jelas..." className="mt-6 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-slate-50 p-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-emerald-700/80 dark:bg-slate-800" />}
            {question.tipe_soal === 'isian' && <input value={answers[question.id]?.value || ''} onChange={(event) => selectAnswer(event.target.value)} placeholder="Tuliskan jawaban singkat..." className="mt-6 h-9 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-emerald-700/80 dark:bg-slate-800" />}
            {question.tipe_soal === 'menjodohkan' && <MatchingAnswer items={question.pasangan_menjodohkan} value={answers[question.id]?.value || ''} onChange={selectAnswer} />}
          </div> : <Notice>Soal tidak tersedia. Hubungi pengawas ujian.</Notice>}
        </section>
      </main>
      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200/80 bg-white px-4 py-3 dark:border-emerald-800/60 dark:bg-slate-900 sm:px-6">
        <div className="flex items-center gap-2 text-xs text-slate-500">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-emerald-600" />}{saving ? 'Menyimpan...' : savedAt ? `Tersimpan ${new Date(savedAt).toLocaleTimeString('id-ID')}` : 'Penyimpanan otomatis aktif'}</div>
        <div className="flex gap-2">
          <button onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0} className="flex h-9 items-center gap-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-3 text-xs font-bold disabled:opacity-40 dark:border-emerald-700/80"><ChevronLeft className="h-4 w-4" />Sebelumnya</button>
          {index < session.soal.length - 1 ? <button onClick={() => setIndex((value) => value + 1)} className="flex h-9 items-center gap-1 rounded-xl bg-slate-900 px-4 text-xs font-bold dark:bg-white dark:text-slate-900">Berikutnya<ChevronRight className="h-4 w-4" /></button> : <button onClick={() => finish(false)} disabled={submitting} className="flex h-9 items-center gap-2 rounded-xl bg-[#059669] px-4 text-xs font-bold text-white disabled:opacity-60">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Kumpulkan</button>}
        </div>
      </footer>
      <button
        onClick={async () => {
          const res = await Swal.fire({
            title: 'Tutup Ruang Ujian?',
            text: 'Keluar dari tampilan ujian? Sesi dan sisa waktu tetap berjalan di server.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Ya, Keluar Sementara',
            cancelButtonText: 'Lanjutkan Ujian',
            confirmButtonColor: '#e11d48',
          })
          if (res.isConfirmed) onClose()
        }}
        className="absolute right-2 top-[70px] rounded-full bg-white p-2 text-slate-500 shadow lg:right-5 cursor-pointer hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
        title="Tutup ruang ujian"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default function UnifiedPortalPage() {
  const user = useAuthStore((state) => state.user)
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedTab = searchParams.get('tab')
  const requestedChild = searchParams.get('child') || ''

  // Determine user mode: parent vs student
  const isParent = useMemo(() => {
    const roles = (user?.roles || []).map((r) => (typeof r === 'string' ? r : r.name || '')).map((r) => r.toLowerCase())
    if (roles.some((r) => r.includes('orang tua') || r.includes('wali') || r.includes('parent'))) return true
    if (Boolean(user?.is_parent || user?.guardian_id) && !Boolean(user?.employee_id || user?.student_id)) return true
    return false
  }, [user])

  // Filter menu items: students do not see bills
  const menu = useMemo(() => {
    if (isParent) return baseMenuItems
    return baseMenuItems.filter(([id]) => !['bills'].includes(id))
  }, [isParent])

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

  // Student CBT Exam Session State
  const [examSession, setExamSession] = useState(null)
  const [startingExamId, setStartingExamId] = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [ringkasanSubTab, setRingkasanSubTab] = useState('mutabaah')
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)

  // Fetch Children / Student Context
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
        const res = await api.get(`/parent/mutabaah/${childId}`).catch(() => ({ data: { data: null } }))
        setRecords(res.data?.data || null)
      } else if (active === 'bills') {
        setRecords([])
      } else {
        const res = await familyPortalService.list(active, childId).catch(() => ({ data: [] }))
        setRecords(unwrap(res))
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
  }, [requestedTab, menu])

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

  const handleStartExam = async (exam) => {
    if (isParent) return
    setStartingExamId(exam.id)
    try {
      const res = await studentLmsService.startExam(exam.id)
      setExamSession(res.data)
    } catch (err) {
      Swal.fire({
        title: 'Ujian Belum Dapat Dimulai',
        text: err.response?.data?.message || 'Gagal memulai ujian CBT. Pastikan jadwal ujian telah dibuka oleh pengawas.',
        icon: 'warning',
        confirmButtonText: 'Mengerti',
        confirmButtonColor: '#059669',
      })
    } finally {
      setStartingExamId(null)
    }
  }

  const activeChild = useMemo(() => {
    return children.find((c) => String(c.id) === String(childId)) || children[0] || null
  }, [children, childId])

  const isChildSD = useMemo(() => {
    if (!activeChild) return false
    const unitName = (activeChild.unit_name || activeChild.education_unit?.name || '').toLowerCase()
    const jenjang = (activeChild.jenjang || activeChild.kelas?.jenjang || activeChild.education_unit?.level || '').toLowerCase()
    return jenjang.includes('sd') || jenjang.includes('mi') || unitName.includes('sd') || unitName.includes('mi') || unitName.includes('sekolah dasar') || unitName.includes('ibtidaiyah')
  }, [activeChild])

  const handleAssignmentSubmit = async (assignmentId, payload) => {
    const formData = new FormData()
    if (payload.jawaban_teks) formData.append('jawaban_teks', payload.jawaban_teks)
    if (payload.file_lampiran) formData.append('file_lampiran', payload.file_lampiran)
    if (childId) formData.append('child_id', childId)

    await api.post('/portal/assignments/' + assignmentId + '/submit', formData, {
      headers: { 'X-Child-Id': childId },
    })
    await load()
  }

  const activeChildAnnouncements = useMemo(() => {
    const raw = dashboard?.announcements || []
    return raw.filter((a) => {
      const unit = a.education_unit || a.unit_name || a.unit
      if (!unit || unit === 'Seluruh Yayasan' || unit === 'Semua Unit' || unit === 'Yayasan') return true
      const activeUnit = activeChild?.unit_name || ''
      const activeCode = activeChild?.unit_code || ''
      if (activeUnit && unit.toLowerCase().includes(activeUnit.toLowerCase())) return true
      if (activeCode && unit.toLowerCase().includes(activeCode.toLowerCase())) return true
      return false
    })
  }, [dashboard?.announcements, activeChild?.unit_name, activeChild?.unit_code])

  const handleSubmitPermissionFromWorkspace = async (payload) => {
    await familyPortalService.submitPermission({ ...payload, child_id: childId })
    load()
  }

  return (
    <div className="portal-page min-w-0 space-y-6 pb-12 text-slate-800 dark:text-slate-100">
      {/* CBT Exam Fullscreen Workspace for Students */}
      {examSession && (
        <ExamWorkspace
          session={examSession}
          onClose={() => {
            setExamSession(null)
            load()
          }}
          onFinished={() => {
            setExamSession(null)
            load()
            selectTab('hasil')
          }}
        />
      )}

      {/* BREADCRUMB NAV */}
      <AppBreadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: isParent ? 'Portal Orang Tua & Siswa' : 'Portal Siswa' },
        ]}
      />

      {/* MODERN HERO CARD HEADER */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">

          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
                  {isParent ? <HeartHandshake className="size-6 sm:size-7 text-white" /> : <GraduationCap className="size-6 sm:size-7 text-white" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
                      <Sparkles className="size-3 animate-pulse text-white" />
                      {isParent ? 'Portal Wali Murid & Siswa' : 'Ruang Belajar Siswa'}
                    </span>
                    {activeChild && (
                      <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                        {isParent ? `Anak Aktif: ${activeChild.full_name}` : `Siswa: ${activeChild.full_name}`} ({activeChild.unit_name || 'SIT'})
                      </span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    {isParent ? 'Portal Siswa & Wali Murid' : 'Portal Pembelajaran & Prestasi Siswa'}
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
                Pantau perkembangan akademik, setoran tahfizh, mutabaah yaumiyyah, jadwal KBM, tugas LMS, presensi digital, dan pengumuman sekolah.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* 1. CARDS PILIHAN ANAK LINTAS UNIT (HANYA MUNCUL DI MODE ORANG TUA / MULTI-CHILD) */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {isParent && children.length > 0 && (
        <section className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3 dark:border-emerald-800/60">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                Pilih Anak Santri ({children.length} Anak Terdaftar)
              </h2>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 p-1 dark:bg-emerald-950/40">
              <button
                type="button"
                onClick={() => setViewAllChildren(false)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${!viewAllChildren
                  ? 'bg-emerald-700 text-white shadow-xs dark:bg-emerald-600'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span>Pilih Anak</span>
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {children.map((child) => {
              const isSelected = !viewAllChildren && String(child.id) === String(childId)
              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => selectChild(child.id)}
                  className={`group flex items-center gap-3 rounded-xl border p-2.5 text-left transition-all cursor-pointer ${isSelected
                    ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-emerald-950/30'
                    : 'border-emerald-200/80 bg-white hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-slate-800/60 dark:hover:bg-emerald-950/30'
                    }`}
                >
                  <Avatar size="sm" className="ring-2 ring-white dark:ring-slate-800">
                    <AvatarFallback className="bg-emerald-600 text-white font-black text-xs">
                      {(child.full_name || 'S').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-black text-slate-800 dark:text-slate-100">
                      {child.full_name}
                    </p>
                    <p className="truncate text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      {child.unit_name || child.unit || 'SIT'} • {child.class_name || child.kelas || 'Kelas'}
                    </p>
                  </div>
                  {isSelected && (
                    <span className="flex size-2 rounded-full bg-emerald-600 shadow-xs" />
                  )}
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* 2. NAVIGATION PILLS TABS */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      <section className="sticky top-16 z-20 -mx-1 overflow-x-auto px-1 py-1 no-scrollbar backdrop-blur-md">
        <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200/80 bg-white/90 p-1.5 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900/90">
          {menu.map(([id, label, Icon, colorClass]) => {
            const isActive = active === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => selectTab(id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all cursor-pointer ${isActive
                  ? 'bg-emerald-700 text-white shadow-sm dark:bg-emerald-600'
                  : 'text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 dark:hover:text-slate-100'
                  }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {/* 3. KONTEN TAB */}
      {/* ───────────────────────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-slate-900">
          <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
            <span>Memuat informasi portal...</span>
          </div>
        </div>
      ) : error ? (
        <Notice>{error}</Notice>
      ) : (
        <div className="space-y-6">
          {/* TAB 1: RINGKASAN DASHBOARD */}
          {active === 'ringkasan' && (
            <div className="space-y-6">
              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
                <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <CalendarCheck className="h-4 w-4 text-emerald-600" />
                    <span>Kehadiran</span>
                  </div>
                  <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                    {dashboard?.kpi?.attendance_rate !== undefined
                      ? `${dashboard.kpi.attendance_rate}%`
                      : (dashboard?.attendance_summary?.percentage || dashboard?.attendance_today?.status_label || '-')}
                  </p>
                  <p className="text-[10px] font-bold text-emerald-600">Presensi Bulan Ini</p>
                </div>

                <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <BookOpenCheck className="h-4 w-4 text-sky-600" />
                    <span>Tahfizh</span>
                  </div>
                  <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                    {dashboard?.tahfizh_summary?.total_juz ?? dashboard?.tahfizh_summary?.juz_count ?? (dashboard?.kpi?.total_tahfizh_ayat ? (dashboard.kpi.total_tahfizh_ayat / 200).toFixed(1) : '0')} <span className="text-xs font-semibold">Juz</span>
                  </p>
                  <p className="text-[10px] font-bold text-sky-600">Capaian Hafalan</p>
                </div>

                <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Award className="h-4 w-4 text-amber-600" />
                    <span>Rata-Rata Nilai</span>
                  </div>
                  <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                    {dashboard?.academic_summary?.gpa ?? dashboard?.gpa ?? (Array.isArray(dashboard?.latest_grades) && dashboard.latest_grades.length > 0 ? (dashboard.latest_grades.reduce((acc, g) => acc + Number(g.final_score || g.score || 0), 0) / dashboard.latest_grades.length).toFixed(1) : '-')}
                  </p>
                  <p className="text-[10px] font-bold text-amber-600">Rapor Semester</p>
                </div>

                <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <ClipboardList className="h-4 w-4 text-rose-600" />
                    <span>Tugas LMS</span>
                  </div>
                  <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                    {dashboard?.kpi?.active_assignments_count ?? dashboard?.assignment_summary?.pending ?? 0} <span className="text-xs font-semibold">Pending</span>
                  </p>
                  <p className="text-[10px] font-bold text-rose-600">Perlu Dikerjakan</p>
                </div>

                <div className="col-span-2 sm:col-span-4 lg:col-span-1 rounded-xl border border-emerald-200/80 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <HeartHandshake className="h-4 w-4 text-purple-600" />
                    <span>Mutabaah</span>
                  </div>
                  <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                    {dashboard?.mutabaah_summary?.score !== undefined ? `${dashboard.mutabaah_summary.score}%` : (dashboard?.kpi?.mutabaah_status ? 'Aktif' : '-')}
                  </p>
                  <p className="text-[10px] font-bold text-purple-600">Kepatuhan Ibadah</p>
                </div>
              </div>

              {/* Announcements Banner */}
              {activeChildAnnouncements.length > 0 && (
                <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-indigo-50/50 p-4 dark:border-emerald-800/60 dark:bg-indigo-950/20">
                  <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-700 dark:text-indigo-300">
                    <Megaphone className="h-4 w-4" />
                    <span>Pengumuman Terkini</span>
                  </div>
                  <div className="mt-2 divide-y divide-indigo-100 dark:divide-indigo-950">
                    {activeChildAnnouncements.slice(0, 3).map((a) => (
                      <div key={a.id} className="py-2 first:pt-0 last:pb-0">
                        <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200">{a.title}</p>
                        <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">{a.content}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-Tabs: Mutabaah vs Informasi Ringkas */}
              <div className="rounded-xl border border-emerald-200/80 bg-white p-5 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3 dark:border-emerald-800/60">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Aktivitas & Pemantauan Terkini
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => selectTab('mutabaah')}
                      className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                    >
                      Buka Mutabaah Penuh →
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  {isParent ? (
                    <ParentWorshipInputWorkspace childId={childId} />
                  ) : (
                    <MutabaahWorkspace records={records} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PROFIL & BIODATA */}
          {active === 'profile' && (
            <StudentProfileWorkspace
              records={records}
              dashboard={dashboard}
              childId={childId}
              isChildSD={isChildSD}
              onPhotoUpdated={() => load()}
            />
          )}

          {/* TAB 3: KALENDER AKADEMIK */}
          {active === 'calendar' && (
            <div className="rounded-xl border border-emerald-200/80 bg-white p-6 shadow-sm dark:border-emerald-800/60 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 dark:text-white">Kalender Akademik Sekolah</h2>
                  <p className="text-xs text-slate-500">Jadwal KBM, ujian semester, libur sekolah, dan agenda yayasan.</p>
                </div>
                <Button variant="primary" size="sm" onClick={() => setIsCalendarModalOpen(true)}>
                  Buka Tampilan Penuh
                </Button>
              </div>
            </div>
          )}

          {/* TAB 4: INFORMASI SEKOLAH */}
          {active === 'announcements' && (
            <SchoolInformationWorkspace announcements={activeChildAnnouncements} />
          )}

          {/* TAB 5: JADWAL PELAJARAN */}
          {active === 'schedules' && (
            <ClassScheduleWorkspace schedules={records} />
          )}

          {/* TAB 6: MATERI BELAJAR */}
          {active === 'materials' && (
            <MaterialsWorkspace materials={records} />
          )}

          {/* TAB 7: TUGAS LMS */}
          {active === 'assignments' && (
            <AssignmentsWorkspace
              assignments={records}
              onSubmit={handleAssignmentSubmit}
              isParent={isParent}
            />
          )}

          {/* TAB 8: TAHFIZH AL-QUR'AN */}
          {active === 'tahfizh' && (
            <TahfizhWorkspace
              records={records}
              achievement={tahfizhAchievement}
              target={dashboard?.tahfizh_target}
            />
          )}

          {/* TAB 9: NILAI AKADEMIK */}
          {active === 'grades' && (
            <GradesWorkspace grades={records} />
          )}

          {/* TAB 10: BUKU PENGHUBUNG / CATATAN GURU */}
          {active === 'student-notes' && (
            <TeacherCommentsWorkspace comments={records} />
          )}

          {/* TAB 11: TAGIHAN & SPP (KHUSUS ORANG TUA) */}
          {active === 'bills' && isParent && (
            <ParentBillsWorkspace childId={childId} />
          )}

          {/* TAB 12: MUTABAAH YAUMIYYAH */}
          {active === 'mutabaah' && (
            <div className="space-y-6">
              {isParent && <ParentWorshipInputWorkspace childId={childId} />}
              <MutabaahWorkspace records={records} />
            </div>
          )}

          {/* TAB 13: PRESENSI / ABSENSI */}
          {active === 'attendance' && (
            <AttendanceWorkspace
              records={records}
              permissions={permissionsRecords}
              onSubmitPermission={handleSubmitPermissionFromWorkspace}
            />
          )}

          {/* TAB 14: KISI-KISI UJIAN */}
          {active === 'kisi' && (
            <ExamGridsWorkspace grids={examGridsRecords} />
          )}

          {/* TAB 15: UJIAN CBT */}
          {active === 'ujian' && (
            <CbtExamsWorkspace
              lmsData={cbtOverview}
              onStartExam={handleStartExam}
              isParent={isParent}
              startingId={startingExamId}
            />
          )}

          {/* TAB 16: HASIL & RAPOR */}
          {active === 'hasil' && (
            <ExamResultsWorkspace
              results={resultsData}
              reports={reportsRecords}
            />
          )}

          {/* TAB 17: CHAT GURU / MUSYRIF (KHUSUS ORANG TUA) */}
          {active === 'chat' && isParent && (
            <ChatGuruWorkspace childId={childId} />
          )}
        </div>
      )}

      {/* MODAL KALENDER AKADEMIK */}
      <AcademicCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        unitFilter={activeChild?.unit_id || ''}
      />
    </div>
  )
}
