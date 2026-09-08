import { useEffect, useMemo, useState } from 'react'
import { Calculator, CheckCircle2, Plus, RefreshCw, Save, ShieldCheck } from 'lucide-react'
import { assessmentFormulaService } from '../services/assessmentFormulaService'
import { useAuthStore } from '../stores/authStore'

const EMPTY_OPTIONS = { units: [], classes: [], academic_years: [], semesters: [], component_catalog: {} }
const tone = { draft: 'bg-slate-100 text-slate-700', submitted: 'bg-amber-100 text-amber-800', approved: 'bg-blue-100 text-blue-800', active: 'bg-emerald-100 text-emerald-800', archived: 'bg-rose-100 text-rose-800' }

export default function AssessmentFormulaPage({ embedded = false }) {
  const user = useAuthStore((state) => state.user)
  const permissions = useMemo(() => new Set((user?.permissions || []).map((p) => typeof p === 'string' ? p : p.name)), [user])
  const can = (name) => permissions.has(name) || permissions.has('*')
  const [items, setItems] = useState([])
  const [options, setOptions] = useState(EMPTY_OPTIONS)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'academic', scope: 'unit', education_unit_id: '', class_id: '', academic_year_id: '', semester_id: '', minimum_score: 75, rounding_precision: 2, components: [] })

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [listRes, optionRes] = await Promise.all([assessmentFormulaService.list({ per_page: 50 }), assessmentFormulaService.options()])
      setItems(listRes?.data?.data || [])
      const next = optionRes?.data || EMPTY_OPTIONS
      setOptions(next)
      setForm((old) => ({ ...old, education_unit_id: old.education_unit_id || next.units?.[0]?.id || '', academic_year_id: old.academic_year_id || next.academic_years?.find((x) => x.is_active)?.id || next.academic_years?.[0]?.id || '', semester_id: old.semester_id || next.semesters?.find((x) => x.is_active)?.id || '' }))
    } catch (e) { setError(e.response?.data?.message || 'Pengaturan rumus belum berhasil dimuat.') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const selectType = (type) => {
    const catalog = options.component_catalog?.[type] || []
    const equal = catalog.length ? Math.floor(100 / catalog.length) : 0
    setForm((old) => ({ ...old, type, components: catalog.map((c, i) => ({ ...c, weight: i === catalog.length - 1 ? 100 - equal * (catalog.length - 1) : equal, aggregation: 'average' })) }))
  }
  const total = form.components.reduce((sum, item) => sum + Number(item.weight || 0), 0)
  const availableClasses = options.classes.filter((item) => !form.education_unit_id || item.unit_pendidikan_id === form.education_unit_id)

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(''); setMessage('')
    try {
      await assessmentFormulaService.create({ ...form, class_id: form.scope === 'class' ? form.class_id : null, education_unit_id: form.scope === 'global' ? null : form.education_unit_id, semester_id: form.semester_id || null })
      setMessage('Draft rumus berhasil dibuat dan tercatat di database.'); setShowForm(false); await load()
    } catch (e) { setError(e.response?.data?.message || Object.values(e.response?.data?.errors || {})?.[0]?.[0] || 'Rumus gagal disimpan.') }
    finally { setBusy(false) }
  }

  const transition = async (id, action) => {
    setBusy(true); setError(''); setMessage('')
    try { await assessmentFormulaService.transition(id, action); setMessage('Status rumus berhasil diperbarui.'); await load() }
    catch (e) { setError(e.response?.data?.message || 'Status rumus gagal diperbarui.') }
    finally { setBusy(false) }
  }

  return <div className={embedded ? 'space-y-5' : 'mx-auto max-w-7xl space-y-5 p-5'}>
    <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-white p-5 shadow-md dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white"><Calculator className="h-5 w-5" /></span><div><h2 className="text-xl font-black text-slate-900 dark:text-white">Pengaturan Rumus Penilaian</h2><p className="text-xs text-slate-600 dark:text-slate-300">Akademik, Tahfizh, dan Mutabaah dengan scope serta persetujuan terkontrol.</p></div></div>
        {can('assessment_formula.create') && <button onClick={() => { setShowForm(true); if (!form.components.length) selectType(form.type) }} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-black text-white"><Plus className="h-4 w-4" />Buat Draft</button>}
      </div>
    </div>

    {(message || error) && <div className={`rounded-xl border p-3 text-xs font-bold ${error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>{error || message}</div>}

    {showForm && <form onSubmit={submit} className="space-y-4 rounded-[22px] border-2 border-emerald-500/20 bg-white p-5 shadow-sm dark:bg-slate-900">
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-xs font-bold">Nama Rumus<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5 font-normal dark:bg-slate-800" /></label>
        <label className="text-xs font-bold">Jenis<select value={form.type} onChange={(e) => selectType(e.target.value)} className="mt-1 w-full rounded-xl border p-2.5 dark:bg-slate-800"><option value="academic">Akademik</option><option value="tahfizh">Tahfizh</option><option value="mutabaah">Mutabaah</option></select></label>
        <label className="text-xs font-bold">Cakupan<select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5 dark:bg-slate-800"><option value="unit">Unit</option><option value="class">Kelas</option>{can('assessment_formula.activate') && <option value="global">Global Yayasan</option>}</select></label>
        {form.scope !== 'global' && <label className="text-xs font-bold">Unit<select required value={form.education_unit_id} onChange={(e) => setForm({ ...form, education_unit_id: e.target.value, class_id: '' })} className="mt-1 w-full rounded-xl border p-2.5 dark:bg-slate-800">{options.units.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>}
        {form.scope === 'class' && <label className="text-xs font-bold">Kelas<select required value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5 dark:bg-slate-800"><option value="">Pilih kelas</option>{availableClasses.map((x) => <option key={x.id} value={x.id}>{x.nama_kelas}</option>)}</select></label>}
        <label className="text-xs font-bold">Tahun Ajaran<select required value={form.academic_year_id} onChange={(e) => setForm({ ...form, academic_year_id: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5 dark:bg-slate-800">{options.academic_years.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
        <label className="text-xs font-bold">Semester<select value={form.semester_id} onChange={(e) => setForm({ ...form, semester_id: e.target.value })} className="mt-1 w-full rounded-xl border p-2.5 dark:bg-slate-800"><option value="">Semua semester</option>{options.semesters.filter((x) => !form.academic_year_id || x.academic_year_id === form.academic_year_id).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
        <label className="text-xs font-bold">Nilai Minimum<input type="number" min="0" max="100" value={form.minimum_score} onChange={(e) => setForm({ ...form, minimum_score: Number(e.target.value) })} className="mt-1 w-full rounded-xl border p-2.5 dark:bg-slate-800" /></label>
      </div>
      <div><div className="mb-2 flex items-center justify-between"><h3 className="text-sm font-black">Bobot Komponen</h3><span className={`rounded-full px-3 py-1 text-xs font-black ${total === 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>Total {total}%</span></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{form.components.map((item, index) => <label key={item.key} className="rounded-xl border bg-slate-50 p-3 text-xs font-bold dark:bg-slate-800">{item.label}<input type="number" min="0" max="100" value={item.weight} onChange={(e) => { const components = [...form.components]; components[index] = { ...item, weight: Number(e.target.value) }; setForm({ ...form, components }) }} className="mt-2 w-full rounded-lg border bg-white p-2 dark:bg-slate-900" /></label>)}</div></div>
      <div className="flex justify-end gap-2"><button type="button" onClick={() => setShowForm(false)} className="rounded-xl border px-4 py-2 text-xs font-bold">Batal</button><button disabled={busy || total !== 100} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white disabled:opacity-50"><Save className="h-4 w-4" />Simpan Draft</button></div>
    </form>}

    <div className="overflow-hidden rounded-[22px] border-2 border-emerald-500/20 bg-white shadow-sm dark:bg-slate-900"><div className="flex items-center justify-between border-b p-4"><h3 className="font-black">Daftar Versi Rumus</h3><button onClick={load} className="rounded-lg p-2 text-emerald-700"><RefreshCw className="h-4 w-4" /></button></div>
      {loading ? <div className="p-10 text-center text-sm text-slate-500">Memuat konfigurasi…</div> : !items.length ? <div className="p-10 text-center text-sm text-slate-500">Belum ada rumus. Buat draft pertama untuk memulai.</div> : <div className="divide-y">{items.map((item) => <div key={item.id} className="flex flex-wrap items-center justify-between gap-4 p-4"><div><div className="flex items-center gap-2"><h4 className="text-sm font-black">{item.name}</h4><span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${tone[item.status] || tone.draft}`}>{item.status}</span></div><p className="mt-1 text-xs text-slate-500">{item.type.toUpperCase()} · {item.scope} · {item.education_unit?.name || 'Semua unit'} · {item.academic_year?.name} {item.semester?.name || ''}</p><p className="mt-1 text-[11px] text-slate-400">{item.components.map((c) => `${c.label} ${c.weight}%`).join(' + ')} · Minimum {item.minimum_score ?? '-'}</p></div><div className="flex gap-2">{item.status === 'draft' && can('assessment_formula.submit') && <button disabled={busy} onClick={() => transition(item.id, 'submit')} className="rounded-lg bg-amber-100 px-3 py-2 text-xs font-bold text-amber-800">Ajukan</button>}{item.status === 'submitted' && can('assessment_formula.approve') && <button disabled={busy} onClick={() => transition(item.id, 'approve')} className="rounded-lg bg-blue-100 px-3 py-2 text-xs font-bold text-blue-800"><ShieldCheck className="mr-1 inline h-3.5 w-3.5" />Setujui</button>}{item.status === 'approved' && can('assessment_formula.activate') && <button disabled={busy} onClick={() => transition(item.id, 'activate')} className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-bold text-white"><CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />Aktifkan</button>}{item.status === 'active' && can('assessment_formula.archive') && <button disabled={busy} onClick={() => transition(item.id, 'archive')} className="rounded-lg bg-rose-100 px-3 py-2 text-xs font-bold text-rose-700">Arsipkan</button>}</div></div>)}</div>}
    </div>
  </div>
}
