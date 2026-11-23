import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import CustomSelect from "../components/ui/CustomSelect"
import {
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'
import {
  BookOpenCheck,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCopy,
  Download,
  Loader2,
  Printer,
  RotateCcw,
  Save,
  Search,
  Send,
  Users,
  X,
  XCircle
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
import {
  DatePicker
} from '@/components/ui'
import {
  mutabaahService
} from '../services/mutabaahService'
import {
  printCleanTable
} from '../utils/printHelper'
import './MutabaahDailySpreadsheet.css'

const today = () => new Date().toLocaleDateString('en-CA')
const states = [
 { value: 'good', label: 'Baik', short: 'B', className: 'good' },
 { value: 'less', label: 'Kurang', short: 'K', className: 'less' },
 { value: 'not_done', label: 'Belum', short: 'X', className: 'missing' },
 { value: 'na', label: 'N/A', short: '—', className: 'na' },
]

export default function MutabaahDailySpreadsheet() {
 const [date, setDate] = useState(today)
 const [context, setContext] = useState(null)
 const [assignmentId, setAssignmentId] = useState('')
 const [students, setStudents] = useState([])
 const [template, setTemplate] = useState(null)
 const [values, setValues] = useState({})
 const [cellMeta, setCellMeta] = useState({})
 const [scopeFilter, setScopeFilter] = useState('all')
 const [selected, setSelected] = useState(new Set())
 const [search, setSearch] = useState('')
 const [loading, setLoading] = useState(true)
 const [saveState, setSaveState] = useState({})
 const [drawer, setDrawer] = useState(null)
 const [history, setHistory] = useState([])
 const [undo, setUndo] = useState(null)
 const [scrollTop, setScrollTop] = useState(0)
 const timers = useRef({})

 const loadContext = useCallback(async () => {
 setLoading(true)
 try {
 const result = await mutabaahService.dailyContext({ date, supervisor_assignment_id: assignmentId || undefined })
 setContext(result)
 setAssignmentId((current) => current || result.selected_assignment_id || '')
 } catch (error) { showError(error) } finally { setLoading(false) }
 }, [date, assignmentId])

 const loadStudents = useCallback(async () => {
 if (!assignmentId) { setStudents([]); return }
 setLoading(true)
 try {
 const result = await mutabaahService.dailyStudents({ date, supervisor_assignment_id: assignmentId, search })
 setStudents(result.students || [])
 setTemplate(result.template)
 const details = await Promise.all((result.students || []).map((student) =>
 student.header_id ? mutabaahService.dailyStudent(student.id, { date, supervisor_assignment_id: assignmentId }) : Promise.resolve(null)))
 const nextValues = {}
 const nextMeta = {}
 details.forEach((detail, index) => detail?.values && Object.entries(detail.values).forEach(([itemId, val]) => {
 const key = `${result.students[index].id}:${itemId}`
 nextValues[key] = val.status_value
 nextMeta[key] = {
 input_source: val.input_source,
 verification_status: val.verification_status,
 input_at: val.input_at,
 }
 }))
 setValues(nextValues)
 setCellMeta(nextMeta)
 } catch (error) { showError(error) } finally { setLoading(false) }
 }, [assignmentId, date, search])

 useEffect(() => { loadContext() }, [loadContext])
 useEffect(() => {
 const id = setTimeout(loadStudents, 300)
 return () => clearTimeout(id)
 }, [loadStudents])
 useEffect(() => () => Object.values(timers.current).forEach(clearTimeout), [])

 const editable = (student) => student.status === 'draft'
 const updateCell = (student, item, value) => {
 if (!editable(student)) return
 const key = `${student.id}:${item.id}`
 const previous = values[key]
 setUndo({ student, item, previous })
 setValues((old) => ({ ...old, [key]: value }))
 setSaveState((old) => ({ ...old, [key]: 'saving' }))
 clearTimeout(timers.current[key])
 timers.current[key] = setTimeout(async () => {
 try {
 await mutabaahService.saveCell({ student_id: student.id, activity_date: date, supervisor_assignment_id: assignmentId, template_item_id: item.id, status_value: value })
 setSaveState((old) => ({ ...old, [key]: 'saved' }))
 } catch {
 setValues((old) => ({ ...old, [key]: previous }))
 setSaveState((old) => ({ ...old, [key]: 'failed' }))
 }
 }, 550)
 }

 const bulkStatus = async (item, value, ids = [...selected]) => {
 const targets = ids.length ? ids : students.filter(editable).map((s) => s.id)
 if (!targets.length) return
 await mutabaahService.bulkSave({ student_ids: targets, activity_date: date, supervisor_assignment_id: assignmentId, template_item_id: item.id, value: { status_value: value } })
 setValues((old) => ({ ...old, ...Object.fromEntries(targets.map((id) => [`${id}:${item.id}`, value])) }))
 }

 const finalize = async (ids) => {
 const target = ids.filter((id) => students.find((s) => s.id === id)?.status === 'draft')
 if (!target.length) return
 const confirm = await Swal.fire({ icon: 'question', title: 'Finalisasi data?', text: 'Data tidak dapat diedit setelah finalisasi.', showCancelButton: true, confirmButtonColor: '#059669', confirmButtonText: 'Finalisasi' })
 if (!confirm.isConfirmed) return
 await mutabaahService.finalizeBulk({ student_ids: target, activity_date: date, supervisor_assignment_id: assignmentId })
 await loadStudents()
 }

 const copyPrevious = async () => {
 const ids = selected.size ? [...selected] : students.filter(editable).map((s) => s.id)
 const result = await mutabaahService.copyPreviousDay({ student_ids: ids, activity_date: date, supervisor_assignment_id: assignmentId })
 await loadStudents()
 Swal.fire({ icon: 'success', title: 'Berhasil disalin', text: `${result.data.copied} siswa diperbarui.`, timer: 1400, showConfirmButton: false })
 }

 const openDrawer = async (student) => {
 setDrawer(student); setHistory([])
 try {
 const result = await mutabaahService.dailyStudent(student.id, { date, supervisor_assignment_id: assignmentId })
 setHistory(result.history || [])
 } catch (error) { showError(error) }
 }

 const handleVerifyHome = async () => {
 if (!assignmentId) return
 try {
 const targetIds = selected.size ? [...selected] : students.map((s) => s.id)
 const res = await mutabaahService.verifyHome({
 activity_date: date,
 supervisor_assignment_id: assignmentId,
 student_ids: targetIds,
 })
 Swal.fire({
 icon: 'success',
 title: 'Verifikasi Berhasil',
 text: `${res.data?.verified_count ?? 0} catatan ibadah rumah berhasil diverifikasi.`,
 timer: 1600,
 showConfirmButton: false,
 })
 await loadStudents()
 } catch (err) {
 showError(err)
 }
 }

 const progress = (student) => {
 const total = template?.items?.length || 0
 const filled = template?.items?.filter((item) => values[`${student.id}:${item.id}`])?.length || 0
 return total ? Math.round((filled / total) * 100) : 0
 }
 const assignment = context?.assignments?.find((a) => a.id === assignmentId)
 const rowHeight = 61
 const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - 5)
 const visibleStudents = students.slice(startRow, startRow + 35)
 const displayedItems = (template?.items || []).filter((item) => {
 if (scopeFilter === 'all') return true
 return item.scope === scopeFilter
 })
 const virtualColspan = (displayedItems.length || 0) + 7

 const handlePrintSheet = () => {
 const itemHeaders = displayedItems.map((it) => it.name)
 const headers = ['No', 'NIS', 'Nama Siswa', 'Kelas', ...itemHeaders, 'Progress', 'Status']
 const rows = students.map((std, idx) => {
 const itemValues = displayedItems.map((it) => {
 const val = values[`${std.id}:${it.id}`]
 const stateObj = states.find((s) => s.value === val)
 return stateObj ? stateObj.label : '-'
 })
 return [
 idx + 1,
 std.nis || '-',
 std.name || '-',
 std.class_name || '-',
 ...itemValues,
 `${progress(std)}%`,
 std.status === 'draft' ? 'Draft' : 'Final',
 ]
 })

 printCleanTable({
 title: 'LEMBAR MUTABA’AH HARIAN SISWA',
 subtitle: `${assignment?.unit_name || 'Sekolah Islam Terpadu'} · ${assignment?.kelas_name || assignment?.rombel_name || 'Seluruh Siswa'}`,
 period: `Tanggal: ${new Date(date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`,
 unit: assignment?.unit_name || null,
 headers,
 rows,
 orientation: 'landscape',
 })
 }

 return <div className="daily-sheet-page">
 <div className="mb-6">
      <HeroUiHeader
        title="Input Mutaba’ah Harian (Spreadsheet)"
        subtitle="Spreadsheet pembinaan siswa sesuai assignment pembimbing dan template aktif terpadu."
        badge="Autosave Aktif"
        roleTag="Mutaba'ah Yaumiyyah"
        icon={BookOpenCheck}
      />
    </div>

 <section className="daily-toolbar">
 <div className="w-52">
 <span className="block text-xs font-semibold text-slate-500 mb-1">Tanggal</span>
 <DatePicker value={date} onChange={(e) => { setAssignmentId(''); setDate(e.target.value) }} />
 </div>
 <label className="assignment-select"><span>Scope Pembimbing</span><CustomSelect value={assignmentId} onChange={(e) => setAssignmentId(e.target.value)}><option value="">Pilih assignment</option>{context?.assignments?.map((a) => <option key={a.id} value={a.id}>{a.unit_name} · {a.kelas_name || a.rombel_name || a.mentoring_group || a.type}</option>)}</CustomSelect></label>
 <label className="search-student"><span>Cari siswa</span><div><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nama atau NIS..." /></div></label>
 <button className="outline" onClick={copyPrevious} disabled={!students.length}><ClipboardCopy size={17} /> Salin Kemarin</button>
 <button className="outline" onClick={() => Swal.fire({ icon: 'success', title: 'Draft tersimpan', text: 'Seluruh perubahan sel telah disimpan otomatis.', timer: 1200, showConfirmButton: false })} disabled={!students.length}><Save size={17} /> Simpan</button>
 <button className="outline" onClick={handlePrintSheet} disabled={!students.length}><Printer size={17} /> Cetak Lembar</button>
 <button className="primary" onClick={() => finalize([...selected])} disabled={!selected.size}><Send size={17} /> Finalisasi Massal</button>
 </section>

 {assignment && <div className="scope-strip"><Users size={16} /><b>{assignment.unit_name}</b><span>{assignment.kelas_name || assignment.rombel_name || assignment.mentoring_group || 'Semua siswa dalam unit'}</span><em>{template?.name || 'Template belum tersedia'}</em></div>}

 <section className="sheet-card relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 <div className="sheet-actions">
 {template?.program_type === 'fullday' && (
 <div className="item-scope-tabs">
 <button
 type="button"
 className={`item-scope-tab ${scopeFilter === 'all' ? 'active' : ''}`}
 onClick={() => setScopeFilter('all')}
 >
 Semua ({template?.items?.length || 0})
 </button>
 <button
 type="button"
 className={`item-scope-tab ${scopeFilter === 'home' ? 'active' : ''}`}
 onClick={() => setScopeFilter('home')}
 >
 🏠 Rumah ({template?.items?.filter((it) => it.scope === 'home').length || 0})
 </button>
 <button
 type="button"
 className={`item-scope-tab ${scopeFilter === 'school' ? 'active' : ''}`}
 onClick={() => setScopeFilter('school')}
 >
 🏫 Sekolah ({template?.items?.filter((it) => it.scope === 'school').length || 0})
 </button>
 </div>
 )}
 <span>{selected.size} siswa dipilih</span>
 {template?.items?.some((it) => it.scope === 'home') && (
 <button type="button" className="verify-home-btn" onClick={handleVerifyHome} title="Verifikasi amalan rumah yang diisi orang tua">
 <CheckCircle2 size={15} /> Verifikasi Catatan Ortu
 </button>
 )}
 {displayedItems[0] && <button onClick={() => bulkStatus(displayedItems[0], 'good')}>Tandai Baik pada kolom pertama</button>}
 <button disabled={!undo} onClick={() => undo && updateCell(undo.student, undo.item, undo.previous)}><RotateCcw size={15} /> Undo</button>
 </div>
 <div className="sheet-scroll" role="region" aria-label="Spreadsheet input mutabaah" onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}>
 <table>
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300"><tr><th className="select-col"><input type="checkbox" aria-label="Pilih semua siswa" checked={students.length > 0 && selected.size === students.length} onChange={(e) => setSelected(e.target.checked ? new Set(students.map((s) => s.id)) : new Set())} /></th><th>No</th><th className="student-col">Nama Siswa</th>{displayedItems.map((item) => <th key={item.id} title={item.name}><span className={`scope-badge scope-${item.scope || 'school'}`}>{item.scope === 'home' ? '🏠 Rumah' : item.scope === 'boarding' ? '🕌 Asrama' : '🏫 Sekolah'}</span><span>{item.name}</span><button onClick={() => bulkStatus(item, 'good')}>Semua Baik</button></th>)}<th>Progress</th><th>Status</th><th>Aksi</th></tr></thead>
 <tbody>
 {loading && Array.from({ length: 7 }).map((_, i) => <tr className="skeleton-row" key={i}><td colSpan={virtualColspan}><i /></td></tr>)}
 {!loading && startRow > 0 && <tr className="virtual-spacer"><td colSpan={virtualColspan} style={{ height: startRow * rowHeight }} /></tr>}
 {!loading && visibleStudents.map((student, visibleIndex) => { const index = startRow + visibleIndex; return <tr key={student.id}>
 <td><input type="checkbox" checked={selected.has(student.id)} onChange={(e) => setSelected((old) => { const next = new Set(old); if (e.target.checked) next.add(student.id); else next.delete(student.id); return next })} /></td>
 <td>{index + 1}</td><td className="student-col"><button onClick={() => openDrawer(student)}><b>{student.name}</b><small>{student.nis} · {student.class_name || '-'}</small></button></td>
 {displayedItems.map((item) => {
 const key = `${student.id}:${item.id}`;
 const current = values[key];
 const meta = cellMeta[key];
 const isParent = meta?.input_source === 'parent';
 const isVerified = meta?.verification_status === 'verified';
 return <td key={item.id}><div className={`cell-editor ${!editable(student) ? 'locked' : ''}`}>{isParent && <span className={`parent-source-dot ${isVerified ? 'verified' : 'pending'}`} title={isVerified ? 'Diisi oleh Orang Tua (Terverifikasi)' : 'Diisi oleh Orang Tua (Menunggu Verifikasi)'} />}{states.map((state) => <button title={state.label} aria-label={`${student.name} ${item.name}: ${state.label}`} className={current === state.value ? state.className : ''} key={state.value} onClick={() => updateCell(student, item, state.value)}>{state.short}</button>)}<SaveMark state={saveState[key]} /></div></td>
 })}
 <td><div className="progress"><i style={{ width: `${progress(student)}%` }} /><span>{progress(student)}%</span></div></td>
 <td><span className={`status-badge ${student.status}`}>{student.status === 'draft' ? 'Draft' : 'Final'}</span></td>
 <td><button className="detail-action" onClick={() => openDrawer(student)}>Detail <ChevronRight size={15} /></button></td>
 </tr>})}
 {!loading && startRow + visibleStudents.length < students.length && <tr className="virtual-spacer"><td colSpan={virtualColspan} style={{ height: (students.length - startRow - visibleStudents.length) * rowHeight }} /></tr>}
 {!loading && !students.length && <tr><td colSpan={virtualColspan}><div className="sheet-empty"><BookOpenCheck /><h3>Belum ada siswa</h3><p>Pilih assignment aktif atau periksa scope pembimbing pada tanggal ini.</p></div></td></tr>}
 </tbody>
 </table>
 </div>
 </section>

 {drawer && <div className="drawer-layer" onMouseDown={(e) => e.target === e.currentTarget && setDrawer(null)}><aside className="student-drawer">
 <header><div><span>Detail Mutaba’ah</span><h2>{drawer.name}</h2><p>{drawer.nis} · {drawer.class_name || '-'}</p></div><button onClick={() => setDrawer(null)}><X /></button></header>
 <div className="drawer-body"><div className="drawer-progress"><b>{progress(drawer)}%</b><span>Progress hari ini</span></div>
 <h3>Seluruh Agenda</h3>{template?.items?.map((item) => <div className="drawer-agenda" key={item.id}><span>{item.name}</span><b>{states.find((s) => s.value === values[`${drawer.id}:${item.id}`])?.label || 'Belum diisi'}</b></div>)}
 <h3>Catatan Pembimbing</h3><textarea placeholder="Catatan evaluasi siswa..." defaultValue={drawer.notes || ''} disabled={!editable(drawer)} />
 <h3>Riwayat 7 Hari</h3><div className="history-list">{history.map((row) => <div key={row.activity_date}><span>{new Date(row.activity_date).toLocaleDateString('id-ID')}</span><b>{row.score ?? 0}</b><em>{row.status}</em></div>)}{!history.length && <p>Belum ada riwayat.</p>}</div>
 </div>
 <footer><button className="outline" onClick={() => setDrawer(null)}><Save size={17} /> Simpan Draft</button><button className="primary" disabled={!editable(drawer)} onClick={() => finalize([drawer.id])}><Check size={17} /> Finalisasi</button></footer>
 </aside></div>}
 </div>
}

function SaveMark({ state }) {
 if (state === 'saving') return <Loader2 className="spin save-mark" />
 if (state === 'failed') return <XCircle className="save-mark failed" />
 if (state === 'saved') return <CheckCircle2 className="save-mark saved" />
 return null
}

function showError(error) {
 Swal.fire({ icon: 'error', title: 'Tidak dapat memuat data', text: error?.response?.data?.message || error.message || 'Terjadi kesalahan.', confirmButtonColor: '#059669' })
}
