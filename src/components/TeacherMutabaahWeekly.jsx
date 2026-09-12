import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Heart, Loader2, Printer, Save, Users } from 'lucide-react'
import { mutabaahService } from '../services/mutabaahService'

const statusOptions = [
  { value: 'good', label: 'Baik', short: 'B', active: 'bg-emerald-700 text-white' },
  { value: 'less', label: 'Kurang', short: 'K', active: 'bg-amber-500 text-white' },
  { value: 'not_done', label: 'Belum', short: 'X', active: 'bg-rose-600 text-white' },
  { value: 'na', label: 'N/A', short: '—', active: 'bg-slate-500 text-white' },
]

const isoDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const startOfWeek = (value = new Date()) => {
  const date = new Date(`${typeof value === 'string' ? value : isoDate(value)}T12:00:00`)
  const offset = date.getDay() === 0 ? -6 : 1 - date.getDay()
  date.setDate(date.getDate() + offset)
  return date
}

const weekDays = (monday) => Array.from({ length: 7 }, (_, index) => {
  const date = new Date(monday)
  date.setDate(monday.getDate() + index)
  return {
    date: isoDate(date),
    day: new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(date),
    label: new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(date),
  }
})

export default function TeacherMutabaahWeekly({ selectedClassId = '' }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek())
  const [context, setContext] = useState(null)
  const [assignmentId, setAssignmentId] = useState('')
  const [students, setStudents] = useState([])
  const [studentId, setStudentId] = useState('')
  const [template, setTemplate] = useState(null)
  const [values, setValues] = useState({})
  const [headers, setHeaders] = useState({})
  const [saving, setSaving] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const days = useMemo(() => weekDays(weekStart), [weekStart])

  const loadContext = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const result = await mutabaahService.dailyContext({ date: days[0].date })
      setContext(result)
      const matchesClass = result.assignments?.filter((item) => !selectedClassId || selectedClassId === 'all' || item.kelas_id === selectedClassId || item.rombel_id === selectedClassId) || []
      const available = matchesClass.length ? matchesClass : (result.assignments || [])
      setAssignmentId((current) => available.some((item) => item.id === current) ? current : (available[0]?.id || ''))
    } catch (requestError) {
      setContext(null)
      setAssignmentId('')
      setError(requestError?.response?.data?.message || 'Konteks Mutabaah belum dapat dimuat.')
    } finally {
      setLoading(false)
    }
  }, [days, selectedClassId])

  useEffect(() => { loadContext() }, [loadContext])

  useEffect(() => {
    if (!assignmentId) {
      setStudents([]); setStudentId(''); setTemplate(null); return
    }
    let active = true
    setLoading(true)
    mutabaahService.dailyStudents({ date: days[0].date, supervisor_assignment_id: assignmentId })
      .then((result) => {
        if (!active) return
        setStudents(result.students || [])
        setTemplate(result.template || null)
        setStudentId((current) => result.students?.some((student) => student.id === current) ? current : (result.students?.[0]?.id || ''))
      })
      .catch((requestError) => active && setError(requestError?.response?.data?.message || 'Daftar siswa belum dapat dimuat.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [assignmentId, days])

  useEffect(() => {
    if (!assignmentId || !studentId || !template) { setValues({}); setHeaders({}); return }
    let active = true
    setLoading(true)
    Promise.all(days.map(async (day) => {
      try {
        const list = await mutabaahService.dailyStudents({ date: day.date, supervisor_assignment_id: assignmentId })
        const student = list.students?.find((item) => item.id === studentId)
        if (!student?.header_id) return { date: day.date, student }
        const detail = await mutabaahService.dailyStudent(studentId, { date: day.date, supervisor_assignment_id: assignmentId })
        return { date: day.date, student, detail }
      } catch { return { date: day.date, unavailable: true } }
    })).then((results) => {
      if (!active) return
      const nextValues = {}
      const nextHeaders = {}
      results.forEach(({ date, student, detail, unavailable }) => {
        nextHeaders[date] = { id: student?.header_id, status: student?.status || 'draft', unavailable }
        Object.entries(detail?.values || {}).forEach(([itemId, value]) => { nextValues[`${date}:${itemId}`] = value.status_value?.value || value.status_value })
      })
      setValues(nextValues); setHeaders(nextHeaders)
    }).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [assignmentId, studentId, template, days])

  const updateCell = async (day, item, value) => {
    const key = `${day.date}:${item.id}`
    const previous = values[key]
    setValues((current) => ({ ...current, [key]: value }))
    setSaving((current) => ({ ...current, [key]: true }))
    try {
      await mutabaahService.saveCell({ student_id: studentId, activity_date: day.date, supervisor_assignment_id: assignmentId, template_item_id: item.id, status_value: value })
      setHeaders((current) => ({ ...current, [day.date]: { ...current[day.date], status: 'draft' } }))
    } catch (requestError) {
      setValues((current) => ({ ...current, [key]: previous }))
      setError(requestError?.response?.data?.message || 'Perubahan belum dapat disimpan.')
    } finally {
      setSaving((current) => ({ ...current, [key]: false }))
    }
  }

  const allAssignments = context?.assignments || []
  const classAssignments = allAssignments.filter((item) => !selectedClassId || selectedClassId === 'all' || item.kelas_id === selectedClassId || item.rombel_id === selectedClassId)
  const assignments = classAssignments.length ? classAssignments : allAssignments
  const selectedStudent = students.find((item) => item.id === studentId)
  const filled = Object.values(values).filter(Boolean).length
  const total = (template?.items?.length || 0) * 7
  const progress = total ? Math.round((filled / total) * 100) : 0
  const shiftWeek = (amount) => setWeekStart((current) => { const next = new Date(current); next.setDate(next.getDate() + amount * 7); return next })

  if (!loading && !assignments.length) return <EmptyState title="Belum ada assignment Mutabaah" text="Guru belum ditugaskan sebagai pembimbing Mutabaah pada rombel atau kelompok ini." />
  if (!loading && assignmentId && !template) return <EmptyState title="Template belum tersedia" text="Unit atau rombel ini belum memiliki template Mutabaah aktif untuk minggu yang dipilih." />

  return <section className="overflow-hidden rounded-[20px] border border-slate-200/80 bg-white shadow-[var(--shadow-soft-xl)] dark:border-slate-700/80 dark:bg-[#1B2433]">
    <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
      <div><h3 className="flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white"><Heart className="h-5 w-5 text-pink-600" /> Mutabaah Yaumiyyah Siswa</h3><p className="mt-1 text-xs text-slate-500">Agenda otomatis mengikuti template unit dan scope pembimbing guru.</p></div>
      <div className="flex items-center gap-2"><button type="button" onClick={() => shiftWeek(-1)} className="rounded-xl border border-slate-200 p-2.5 dark:border-slate-700"><ChevronLeft className="h-4 w-4" /></button><div className="min-w-48 text-center text-xs font-bold"><CalendarDays className="mr-2 inline h-4 w-4" />{days[0].label} – {days[6].label}</div><button type="button" onClick={() => shiftWeek(1)} className="rounded-xl border border-slate-200 p-2.5 dark:border-slate-700"><ChevronRight className="h-4 w-4" /></button><button type="button" onClick={() => window.print()} className="rounded-xl border border-slate-200 p-2.5 dark:border-slate-700" title="Cetak"><Printer className="h-4 w-4" /></button></div>
    </div>
    <div className="grid gap-3 bg-slate-50/70 p-4 dark:bg-slate-900/30 md:grid-cols-3">
      <label className="text-[11px] font-bold text-slate-500">Scope pembimbing<select value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)} className="mt-1 block h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white">{assignments.map((item) => <option key={item.id} value={item.id}>{item.unit_name} · {item.kelas_name || item.rombel_name || item.mentoring_group || item.type}</option>)}</select></label>
      <label className="text-[11px] font-bold text-slate-500">Nama siswa<select value={studentId} onChange={(e) => setStudentId(e.target.value)} className="mt-1 block h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-white"><option value="">Pilih siswa</option>{students.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.nis || '-'}</option>)}</select></label>
      <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs dark:border-emerald-900 dark:bg-emerald-950/30"><p className="font-bold text-emerald-800 dark:text-emerald-300">{template?.name || 'Memuat template...'}</p><p className="mt-1 text-emerald-700">{selectedStudent?.name || 'Pilih siswa'} · {progress}% terisi</p></div>
    </div>
    {error && <div className="mx-4 mt-4 rounded-xl bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700">{error}</div>}
    <div className="overflow-x-auto p-4">
      <table className="min-w-[980px] w-full border-collapse text-xs">
        <thead><tr className="bg-sky-50 text-slate-700 dark:bg-slate-800 dark:text-slate-200"><th className="border border-slate-200 p-2 text-center dark:border-slate-700">No</th><th className="border border-slate-200 p-2 text-left dark:border-slate-700">Agenda</th><th className="border border-slate-200 p-2 text-left dark:border-slate-700">Rincian Agenda</th>{days.map((day) => <th key={day.date} className="border border-slate-200 p-2 text-center dark:border-slate-700"><span className="block font-extrabold">{day.day}</span><span className="text-[10px] font-normal text-slate-500">{day.label}</span></th>)}</tr></thead>
        <tbody>{template?.items?.map((item, index) => <tr key={item.id} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10"><td className="border border-slate-200 p-2 text-center font-mono dark:border-slate-700">{index + 1}</td><td className="border border-slate-200 p-2 font-bold text-emerald-800 dark:border-slate-700 dark:text-emerald-300">{item.category}</td><td className="border border-slate-200 p-2 font-semibold dark:border-slate-700">{item.name}</td>{days.map((day) => { const key = `${day.date}:${item.id}`; const locked = headers[day.date]?.status && headers[day.date].status !== 'draft'; return <td key={day.date} className="border border-slate-200 p-1.5 dark:border-slate-700"><div className="flex justify-center gap-1">{headers[day.date]?.unavailable ? <span className="text-slate-400">N/A</span> : statusOptions.map((status) => <button type="button" key={status.value} disabled={!studentId || locked || saving[key]} onClick={() => updateCell(day, item, status.value)} title={status.label} className={`h-7 min-w-7 rounded-md text-[10px] font-black transition ${values[key] === status.value ? status.active : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800'} disabled:cursor-not-allowed disabled:opacity-50`}>{saving[key] && values[key] === status.value ? <Loader2 className="mx-auto h-3 w-3 animate-spin" /> : status.short}</button>)}</div></td> })}</tr>)}</tbody>
      </table>
      {!loading && !students.length && <div className="p-10 text-center text-xs text-slate-500"><Users className="mx-auto mb-2 h-8 w-8 text-slate-300" />Belum ada siswa dalam scope assignment ini.</div>}
      {loading && <div className="flex items-center justify-center gap-2 p-8 text-xs font-bold text-slate-500"><Loader2 className="h-4 w-4 animate-spin" /> Memuat form Mutabaah...</div>}
    </div>
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-[11px] text-slate-500 dark:border-slate-800"><span>B = Baik · K = Kurang · X = Belum · — = N/A</span><span className="flex items-center gap-1"><Save className="h-3.5 w-3.5" /> Perubahan tersimpan otomatis</span></div>
  </section>
}

function EmptyState({ title, text }) {
  return <div className="rounded-[20px] border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-[#1B2433]"><Heart className="mx-auto h-10 w-10 text-slate-300" /><h3 className="mt-3 font-extrabold text-slate-800 dark:text-white">{title}</h3><p className="mx-auto mt-1 max-w-lg text-xs text-slate-500">{text}</p></div>
}
