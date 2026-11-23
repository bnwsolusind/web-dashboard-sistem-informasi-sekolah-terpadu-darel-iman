import CustomSelect from "../components/ui/CustomSelect"
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'
import {
  useNavigate
} from 'react-router-dom'
import {
  motion
} from 'framer-motion'
import {
  AlertCircle,
  Award,
  BookOpen,
  BookOpenCheck,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock3,
  CreditCard,
  FileCheck2,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  Loader2,
  Megaphone,
  MessageCircle,
  RefreshCw,
  Save,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserRound,
  X
} from 'lucide-react'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import api from '../services/api'
import {
  studentLmsService
} from '../services/studentLmsService'
import StudentProfileWorkspace from '../components/portal/StudentProfileWorkspace'
import SchoolInformationWorkspace from '../components/portal/SchoolInformationWorkspace'
import ClassScheduleWorkspace from '../components/portal/ClassScheduleWorkspace'
import MaterialsWorkspace from '../components/portal/MaterialsWorkspace'
import AssignmentsWorkspace from '../components/portal/AssignmentsWorkspace'
import TahfizhWorkspace from '../components/portal/TahfizhWorkspace'
import GradesWorkspace from '../components/portal/GradesWorkspace'
import TeacherCommentsWorkspace from '../components/portal/TeacherCommentsWorkspace'
import DisciplineSummaryWorkspace from '../components/portal/DisciplineSummaryWorkspace'
import MutabaahWorkspace from '../components/portal/MutabaahWorkspace'
import AttendanceWorkspace from '../components/portal/AttendanceWorkspace'
import ExamGridsWorkspace from '../components/portal/ExamGridsWorkspace'
import CbtExamsWorkspace from '../components/portal/CbtExamsWorkspace'
import ExamResultsWorkspace from '../components/portal/ExamResultsWorkspace'
import ParentBillsWorkspace from '../components/portal/ParentBillsWorkspace'
import {
  Button
} from '../components/ui/button'
import {
  Badge
} from '../components/ui/badge'
import {
  Card,
  CardContent
} from '../components/ui/card'
import {
  useAuthStore
} from '../stores/authStore'
import {
  isParentRole
} from '../auth/portalResolver'

const tabs = [
 { id: 'ringkasan', label: 'Ringkasan', icon: LayoutDashboard, pastelColor: 'bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 hover:shadow-md hover:shadow-sm' },
 { id: 'profile', label: 'Profil & Biodata', icon: UserRound, pastelColor: 'bg-sky-100/90 text-sky-700 hover:bg-sky-500 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-500 hover:shadow-md hover:shadow-sky-500/20' },
 { id: 'announcements', label: 'Informasi Sekolah', icon: Megaphone, pastelColor: 'bg-blue-100/90 text-blue-700 hover:bg-blue-600 hover:text-white dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-600 hover:shadow-md hover:shadow-sm' },
 { id: 'schedules', label: 'Jadwal', icon: CalendarDays, pastelColor: 'bg-purple-100/90 text-purple-700 hover:bg-purple-600 hover:text-white dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-600 hover:shadow-md hover:shadow-sm' },
 { id: 'materials', label: 'Materi', icon: BookOpen, pastelColor: 'bg-amber-100/90 text-amber-700 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 hover:shadow-md hover:shadow-sm' },
 { id: 'assignments', label: 'Tugas', icon: ClipboardList, pastelColor: 'bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-600 hover:shadow-md hover:shadow-sm' },
 { id: 'tahfizh', label: 'Tahfizh', icon: BookOpenCheck, pastelColor: 'bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 hover:shadow-md hover:shadow-sm' },
 { id: 'grades', label: 'Nilai', icon: Award, pastelColor: 'bg-cyan-100/90 text-cyan-700 hover:bg-cyan-600 hover:text-white dark:bg-cyan-950/60 dark:text-cyan-300 dark:hover:bg-cyan-600 hover:shadow-md hover:shadow-cyan-500/20' },
 { id: 'student-notes', label: 'Buku Penghubung', icon: MessageCircle, pastelColor: 'bg-indigo-100/90 text-indigo-700 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 hover:shadow-md hover:shadow-sm' },
 { id: 'discipline', label: 'Tata Tertib & Poin', icon: ShieldAlert, pastelColor: 'bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-600 hover:shadow-md hover:shadow-sm' },
 { id: 'mutabaah', label: 'Mutabaah', icon: HeartHandshake, pastelColor: 'bg-amber-100/90 text-amber-700 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 hover:shadow-md hover:shadow-sm' },
 { id: 'attendance', label: 'Absensi', icon: CalendarCheck, pastelColor: 'bg-teal-100/90 text-teal-700 hover:bg-teal-600 hover:text-white dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-600 hover:shadow-md hover:shadow-sm' },
 { id: 'kisi', label: 'Kisi-kisi', icon: BookOpenCheck, pastelColor: 'bg-violet-100/90 text-violet-700 hover:bg-violet-600 hover:text-white dark:bg-violet-950/60 dark:text-violet-300 dark:hover:bg-violet-600 hover:shadow-md hover:shadow-violet-500/20' },
 { id: 'ujian', label: 'Ujian CBT', icon: FileCheck2, pastelColor: 'bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300 dark:hover:bg-rose-600 hover:shadow-md hover:shadow-sm' },
 { id: 'hasil', label: 'Hasil', icon: Award, pastelColor: 'bg-cyan-100/90 text-cyan-700 hover:bg-cyan-600 hover:text-white dark:bg-cyan-950/60 dark:text-cyan-300 dark:hover:bg-cyan-600 hover:shadow-md hover:shadow-cyan-500/20' },
 { id: 'bills', label: 'Tagihan & SPP', icon: CreditCard, pastelColor: 'bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 hover:shadow-md hover:shadow-sm' },
]

const studentPortalPaths = {
 ringkasan: '/portal-siswa', profile: '/portal-siswa/profil', announcements: '/portal-siswa/informasi-sekolah',
 schedules: '/portal-siswa/jadwal', materials: '/portal-siswa/materi', assignments: '/portal-siswa/tugas',
 tahfizh: '/portal-siswa/tahfizh', grades: '/portal-siswa/nilai', 'student-notes': '/portal-siswa/komentar-guru',
 discipline: '/portal-siswa/tata-tertib',
 mutabaah: '/portal-siswa/mutabaah', attendance: '/portal-siswa/absensi', kisi: '/portal-siswa/kisi-kisi',
 ujian: '/portal-siswa/ujian-cbt', hasil: '/portal-siswa/hasil', bills: '/portal-siswa/tagihan',
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

 const [showSubmitModal, setShowSubmitModal] = useState(false)
 const [showCloseModal, setShowCloseModal] = useState(false)

 const handleExecuteFinish = useCallback(async () => {
 if (finishLock.current) return
 finishLock.current = true
 setSubmitting(true)
 setShowSubmitModal(false)
 try {
 const response = await studentLmsService.finishExam(session.sesi_id, answerPayload(answersRef.current))
 onFinished(response.data)
 } catch (err) {
 finishLock.current = false
 setError(err.response?.data?.message || 'Ujian belum berhasil dikumpulkan.')
 setSubmitting(false)
 }
 }, [onFinished, session.sesi_id])

 const finish = useCallback((automatic = false) => {
 if (automatic) {
 handleExecuteFinish()
 } else {
 setShowSubmitModal(true)
 }
 }, [handleExecuteFinish])

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
 const doubtfulCount = Object.values(doubtful).filter(Boolean).length
 const selectAnswer = (value) => setAnswers((current) => ({ ...current, [question.id]: { type: question.tipe_soal, value } }))

 return (
 <div className="fixed inset-0 z-[100] flex flex-col bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-white">
 <header className="flex min-h-16 items-center justify-between gap-3 bg-[#059669] px-4 py-3 text-white shadow-lg sm:px-6">
 <div className="min-w-0"><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200">Ruang Ujian CBT</p><h1 className=" text-sm font-semibold sm:text-base">{session.ujian.judul_ujian}</h1></div>
 <div className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 font-mono text-sm font-black ${remaining < 300 ? 'bg-rose-500' : 'bg-white/15'}`}><Clock3 className="h-4 w-4" />{formatTimer(remaining)}</div>
 </header>
 {error && <div className="px-4 pt-3 sm:px-6"><Notice>{error}</Notice></div>}
 <main className="grid min-h-0 flex-1 gap-4 overflow-hidden p-4 lg:grid-cols-[250px_1fr] lg:p-6">
 <aside className="hidden overflow-y-auto rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-4 shadow-md shadow-emerald-500/10 dark:border-emerald-800/60 dark:bg-slate-900 lg:block">
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
 <section className="min-h-0 overflow-y-auto rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 shadow-md shadow-emerald-500/10 dark:border-emerald-800/60 dark:bg-slate-900 sm:p-7">
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4 dark:border-emerald-800/60">
 <div className="flex items-center gap-2">
 <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Soal {index + 1} dari {session.soal.length}</span>
 <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-bold dark:bg-slate-800">{question?.poin} poin</span>
 </div>
 {question && (
 <button
 type="button"
 onClick={() => toggleDoubtful(question.id)}
 className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1 text-xs font-bold transition ${
 doubtful[question.id]
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
 {question.tipe_soal === 'esai' && <textarea rows={8} value={answers[question.id]?.value || ''} onChange={(event) => selectAnswer(event.target.value)} placeholder="Tuliskan jawaban Anda dengan jelas..." className="mt-6 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 p-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-emerald-700/80 dark:bg-slate-800" />}
 {question.tipe_soal === 'isian' && <input value={answers[question.id]?.value || ''} onChange={(event) => selectAnswer(event.target.value)} placeholder="Tuliskan jawaban singkat..." className="mt-6 h-9 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 px-4 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:border-emerald-700/80 dark:bg-slate-800" />}
 {question.tipe_soal === 'menjodohkan' && <MatchingAnswer items={question.pasangan_menjodohkan} value={answers[question.id]?.value || ''} onChange={selectAnswer} />}
 </div> : <Notice>Soal tidak tersedia. Hubungi pengawas ujian.</Notice>}
 </section>
 </main>
 <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-emerald-200/80 bg-white px-4 py-3 dark:border-emerald-800/60 dark:bg-slate-900 sm:px-6">
 <div className="flex items-center gap-2 text-xs text-slate-500">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 text-emerald-600" />}{saving ? 'Menyimpan...' : savedAt ? `Tersimpan ${new Date(savedAt).toLocaleTimeString('id-ID')}` : 'Penyimpanan otomatis aktif'}</div>
 <div className="flex gap-2">
 <Button variant="ghost" appearance="outline" onClick={() => setIndex((value) => Math.max(0, value - 1))} disabled={index === 0} className="border-emerald-200/80 dark:border-emerald-700/80 font-bold gap-1"><ChevronLeft className="h-4 w-4" />Sebelumnya</Button>
 {index < session.soal.length - 1 ? <Button onClick={() => setIndex((value) => value + 1)} className="bg-slate-900 dark:bg-white dark:text-slate-900 font-bold gap-1">Berikutnya<ChevronRight className="h-4 w-4" /></Button> : <Button onClick={() => finish(false)} disabled={submitting} pending={submitting} className="bg-[#059669] text-white font-bold gap-2">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Kumpulkan</Button>}
 </div>
 </footer>
 <Button variant="ghost" appearance="outline" iconOnly onClick={() => setShowCloseModal(true)} className="absolute right-2 top-[70px] rounded-full bg-white text-slate-600 shadow-md border-emerald-200/80 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-emerald-700/80 lg:right-5" title="Tutup ruang ujian"><X className="h-4 w-4" /></Button>

 {/* Modal Konfirmasi Kumpulkan Ujian */}
 {showSubmitModal && (
 <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
 <div className="w-full max-w-md rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-6 shadow-2xl shadow-emerald-950/20 dark:bg-[#182232]">
 <h3 className="text-base font-black text-slate-900 dark:text-white">
 Konfirmasi Kumpulkan Ujian
 </h3>
 <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
 Apakah Anda yakin ingin mengumpulkan ujian sekarang? Jawaban tidak dapat diubah lagi setelah dikumpulkan.
 </p>
 {doubtfulCount > 0 && (
 <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50 p-3 text-xs font-semibold text-amber-800 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-300">
 <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
 <span>Perhatian: Masih ada <strong>{doubtfulCount}</strong> soal yang Anda tandai ragu-ragu.</span>
 </div>
 )}
 <div className="mt-6 flex justify-end gap-2.5">
 <Button
 variant="ghost"
 appearance="outline"
 onClick={() => setShowSubmitModal(false)}
 disabled={submitting}
 className="font-bold text-xs"
 >
 Batal
 </Button>
 <Button
 onClick={handleExecuteFinish}
 pending={submitting}
 disabled={submitting}
 className="bg-[#059669] hover:bg-[#047857] text-white font-bold text-xs"
 >
 Ya, Kumpulkan Ujian
 </Button>
 </div>
 </div>
 </div>
 )}

 {/* Modal Konfirmasi Keluar Ruang Ujian */}
 {showCloseModal && (
 <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
 <div className="w-full max-w-md rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-6 shadow-2xl shadow-emerald-950/20 dark:bg-[#182232]">
 <h3 className="text-base font-black text-slate-900 dark:text-white">
 Keluar dari Ruang Ujian?
 </h3>
 <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
 Sesi ujian dan timer tetap berjalan di sistem. Anda dapat kembali melanjutkan ujian selama batas waktu pengerjaan belum berakhir.
 </p>
 <div className="mt-6 flex justify-end gap-2.5">
 <Button
 variant="ghost"
 appearance="outline"
 onClick={() => setShowCloseModal(false)}
 className="font-bold text-xs"
 >
 Tetap di Ujian
 </Button>
 <Button
 variant="danger"
 onClick={() => { setShowCloseModal(false); onClose() }}
 className="bg-rose-600 text-white font-bold text-xs"
 >
 Keluar
 </Button>
 </div>
 </div>
 </div>
 )}
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
 const resources = ['profile', 'announcements', 'schedules', 'materials', 'assignments', 'student-notes', 'tahfizh', 'grades', 'mutabaah', 'attendance', 'bills']
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
 const link = payload.url_link || payload.link
 if (link) {
 formData.append('url_link', link)
 formData.append('link', link)
 }
 if (payload.metadata) {
 formData.append('metadata', typeof payload.metadata === 'object' ? JSON.stringify(payload.metadata) : payload.metadata)
 }

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

 if (loading) return <div className="portal-page animate-pulse space-y-5"><div className="h-36 rounded-xl bg-slate-200 dark:bg-slate-800" /><div className="h-9 rounded-xl bg-slate-200 dark:bg-slate-800" /></div>

const KpiCardPastelStyles = {
  emerald: {
    card: '!bg-emerald-100/90 hover:!bg-emerald-200/70 dark:!bg-emerald-950/50 dark:hover:!bg-emerald-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    iconBg: '!bg-emerald-600 !text-white shadow-sm dark:!bg-emerald-600 dark:!text-white',
    title: 'text-emerald-800 dark:text-emerald-300',
    val: 'text-emerald-800 dark:text-emerald-200',
    sub: 'text-emerald-700/90 dark:text-emerald-300/80',
    btn: 'text-emerald-700 hover:text-emerald-800 dark:text-emerald-400',
  },
  blue: {
    card: '!bg-sky-100/90 hover:!bg-sky-200/70 dark:!bg-sky-950/50 dark:hover:!bg-sky-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    iconBg: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-2xl',
    title: 'text-sky-800 dark:text-sky-300',
    val: 'text-sky-800 dark:text-sky-200',
    sub: 'text-sky-700/90 dark:text-sky-300/80',
    btn: 'text-sky-700 hover:text-sky-800 dark:text-sky-400',
  },
  amber: {
    card: '!bg-amber-100/90 hover:!bg-amber-200/70 dark:!bg-amber-950/50 dark:hover:!bg-amber-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    iconBg: '!bg-amber-600 !text-white shadow-sm dark:!bg-amber-600 dark:!text-white',
    title: 'text-amber-800 dark:text-amber-300',
    val: 'text-amber-800 dark:text-amber-200',
    sub: 'text-amber-700/90 dark:text-amber-300/80',
    btn: 'text-amber-700 hover:text-amber-800 dark:text-amber-400',
  },
  violet: {
    card: '!bg-purple-100/90 hover:!bg-purple-200/70 dark:!bg-purple-950/50 dark:hover:!bg-purple-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    iconBg: '!bg-purple-600 !text-white shadow-sm dark:!bg-purple-600 dark:!text-white',
    title: 'text-purple-800 dark:text-purple-300',
    val: 'text-purple-800 dark:text-purple-200',
    sub: 'text-purple-700/90 dark:text-purple-300/80',
    btn: 'text-purple-700 hover:text-purple-800 dark:text-purple-400',
  },
  rose: {
    card: '!bg-rose-100/90 hover:!bg-rose-200/70 dark:!bg-rose-950/50 dark:hover:!bg-rose-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    iconBg: '!bg-rose-600 !text-white shadow-sm dark:!bg-rose-600 dark:!text-white',
    title: 'text-rose-800 dark:text-rose-300',
    val: 'text-rose-800 dark:text-rose-200',
    sub: 'text-rose-700/90 dark:text-rose-300/80',
    btn: 'text-rose-700 hover:text-rose-800 dark:text-rose-400',
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
 ['student-notes', 'Buku Penghubung', dashboardModules['student-notes']?.length || 0, 'catatan tersedia', MessageCircle, 'blue'],
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
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">

 <div className="relative z-10 flex flex-col gap-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
                <GraduationCap className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
                    <Sparkles className="size-3 animate-pulse text-white" />
                    Portal Peserta Didik Terpadu
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    Siswa: {student?.full_name || student?.name || user?.name || 'Siswa'} ({student?.kelas?.nama_kelas || student?.unit?.name || 'Sekolah Terpadu'})
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  {activeTab === 'ringkasan' ? 'Portal Siswa / Peserta Didik' : tabs.find((t) => t.id === activeTab)?.label || 'Portal Siswa'}
                </h1>
              </div>
            </div>
          </div>

          {/* Row 2: Deskripsi Full Width */}
          <div className="w-full pt-2 border-t border-emerald-500/20 dark:border-emerald-500/30">
            <p className="w-full text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
              Akses jadwal, tugas, materi, CBT, nilai, Tahfizh, dan Mutaba'ah dalam satu ruang belajar terpadu.
            </p>
          </div>
        </div>
 </div>
 </motion.div>

 {/* CARD NAVIGASI MENU PORTAL SISWA */}
 <Card className="overflow-hidden border border-emerald-200/80 bg-white shadow-sm dark:border-emerald-800/60 dark:bg-slate-900 rounded-xl">
 <CardContent className="p-5 sm:p-6 space-y-4">
 <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3 dark:border-emerald-800/60">
 <div className="flex items-center gap-2.5">
 <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 shadow-xs">
 <LayoutDashboard className="h-4 w-4" />
 </span>
 <div>
 <h2 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100">
 Navigasi Menu Portal Siswa
 </h2>
 <p className="text-xs text-slate-400">
 Pemanggilan menu modul via tombol di bawah ini:
 </p>
 </div>
 </div>
 <Badge color="primary" size="sm" className="hidden sm:inline-flex font-bold uppercase tracking-wider text-[10px]">
 {tabs.length} Menu Modul
 </Badge>
 </div>
 {/* TOMBOL BUTTON GRID WITH HEROUI PASTEL ACCENTS */}
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
 ? '!bg-white dark:bg-[#1B2433] !from-emerald-600 !to-teal-600 ! shadow-sm ring-2 ring-emerald-500/40 scale-[1.02]'
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
 <div className="flex items-center gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 p-4 text-xs font-bold text-rose-700 dark:border-emerald-800/60 dark:bg-rose-950/30">
 <AlertCircle className="h-5 w-5" />
 <span className="flex-1">{error}</span>
 <Button
 type="button"
 variant="ghost"
 size="xs"
 iconOnly
 onClick={load}
 aria-label="Muat ulang data portal siswa"
 className="rounded-lg p-1 text-rose-700 hover:bg-rose-100 dark:text-rose-300 dark:hover:bg-rose-900"
 >
 <RefreshCw className="h-4 w-4" />
 </Button>
 </div>
 )}

 {panelLoading && activeTab === 'profile' && (
 <div className="animate-pulse space-y-5">
 <div className="h-56 rounded-xl bg-emerald-50 dark:bg-emerald-950/40" />
 <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
 {[1,2,3,4].map((item) => <div key={item} className="h-32 rounded-xl bg-emerald-50 dark:bg-emerald-950/40" />)}
 </div>
 <div className="h-96 rounded-xl bg-emerald-50 dark:bg-emerald-950/40" />
 </div>
 )}

 {activeTab === 'ringkasan' && (
 <section className="space-y-5">
 <Card className="p-5 border border-emerald-200/80 bg-white shadow-xs dark:border-emerald-800/60 dark:bg-slate-900 rounded-xl">
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
 className={`flex min-h-44 flex-col rounded-xl border p-5 shadow-xs transition-all duration-200 hover:shadow-md cursor-pointer ${pastel.card}`}
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
 <p className={`mt-1 text-xs ${pastel.sub}`}>{description}</p>
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
 <Card className="p-5 border border-emerald-200/80 bg-white shadow-xs dark:border-emerald-800/60 dark:bg-slate-900 rounded-xl lg:col-span-2">
 <h3 className="text-sm font-bold text-slate-900 dark:text-white">Tugas Terdekat</h3>
 <div className="mt-3 divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {(dashboard?.active_assignments || []).slice(0, 4).map((item) => (
 <div key={item.id} className="flex items-center justify-between gap-3 py-3">
 <div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.judul}</p>
 <p className="mt-1 text-xs text-slate-500">{item.subject?.name || 'Mata pelajaran'}</p>
 </div>
 <Badge color="warning" size="sm" className="font-bold">
 {formatDate(item.deadline)}
 </Badge>
 </div>
 ))}
 {!dashboard?.active_assignments?.length && <p className="py-8 text-center text-xs text-slate-400">Tidak ada tugas aktif.</p>}
 </div>
 </Card>

 <Card className="p-5 bg-white dark:bg-[#1B2433] dark:from-emerald-950 dark:to-slate-900 border border-emerald-800/60 rounded-xl shadow-sm">
 <div className="flex items-center justify-between">
 <p className="text-xs text-slate-300">Kelas Aktif</p>
 <Badge color="success" size="sm" className="font-bold uppercase">
 Aktif
 </Badge>
 </div>
 <p className="mt-1.5 text-lg font-black text-white">{student?.kelas?.nama_kelas || student?.kelas?.name || 'Belum ditentukan'}</p>
 <p className="mt-2 text-xs text-emerald-200/80 font-mono">NIS: {student?.nis || '-'}</p>
 <p className="mt-4 text-xs leading-relaxed text-slate-300/90 border-t border-emerald-800/80 pt-3">
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

 {!panelLoading && activeTab === 'discipline' && (
 <DisciplineSummaryWorkspace childId={student?.id} />
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

 {!panelLoading && activeTab === 'bills' && (
 <ParentBillsWorkspace
 bills={portalRecords}
 loading={panelLoading}
 student={student}
 onRefresh={() => {
 api.get('/portal/bills').then((res) => {
 const list = res.data?.data?.data ?? res.data?.data ?? []
 setPortalRecords(Array.isArray(list) ? list : [])
 })
 }}
 />
 )}
 </div>
 )
}
