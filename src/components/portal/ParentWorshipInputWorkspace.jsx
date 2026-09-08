import { useEffect, useState } from 'react'
import { CheckCircle2, Home, Save, Calendar, Info } from 'lucide-react'
import api from '../../services/api'

export default function ParentWorshipInputWorkspace({ studentId }) {
  const [context, setContext] = useState(null)
  const [values, setValues] = useState({})
  const [notes, setNotes] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [date, setDate] = useState(() => new Intl.DateTimeFormat('en-CA').format(new Date()))

  const load = async () => {
    setError('')
    try {
      const r = await api.get(`/portal/children/${studentId}/worship-input`, { params: { date } })
      const data = r.data?.data || null
      setContext(data)
      if (data?.items && Array.isArray(data.items)) {
        const initialVals = {}
        const initialNotes = {}
        data.items.forEach((item) => {
          if (item.status_value) initialVals[item.agenda_item_id] = item.status_value
          if (item.notes) initialNotes[item.agenda_item_id] = item.notes
        })
        setValues(initialVals)
        setNotes(initialNotes)
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Agenda ibadah rumah belum dapat dimuat.')
    }
  }

  useEffect(() => {
    if (studentId) load()
  }, [studentId, date])

  const save = async () => {
    const items = Object.entries(values).map(([agenda_item_id, status_value]) => ({
      agenda_item_id,
      status_value,
      notes: notes[agenda_item_id] || null,
    }))
    if (!items.length) return
    setSaving(true)
    setError('')
    setMessage('')
    try {
      await api.post(`/portal/children/${studentId}/worship-input`, { date, items })
      setMessage('Mutabaah ibadah rumah berhasil disimpan.')
      await load()
    } catch (e) {
      setError(e.response?.data?.message || 'Mutabaah gagal disimpan.')
    } finally {
      setSaving(false)
    }
  }

  const isEditable = context?.can_parent_input !== false && context?.can_edit !== false

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400">
              <Home className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Input Mutaba'ah di Rumah</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {context?.period?.name || 'Periode Reguler'} · Program {context?.program === 'boarding' ? 'Boarding / Asrama' : 'Fullday'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
        </div>

        {(message || error) && (
          <div className={`mt-4 rounded-xl p-3 text-xs font-semibold ${error ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400' : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'}`}>
            {error || message}
          </div>
        )}

        {!isEditable && (
          <div className="mt-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            <Info className="h-4 w-4 shrink-0" />
            <span>
              {context?.header_status && context.header_status !== 'draft'
                ? 'Agenda hari ini telah difinalisasi oleh pembimbing dan tidak dapat diubah lagi.'
                : 'Mode saat ini adalah pemantauan laporan (bukan input orang tua).'}
            </span>
          </div>
        )}

        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {(context?.items || []).map((item) => (
            <div key={item.agenda_item_id} className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{item.name}</p>
                  <p className="text-[10px] text-slate-400">
                    Lokasi: {item.location || 'rumah'} {item.requires_verification ? '· Perlu verifikasi pembimbing' : ''}
                  </p>
                </div>
                {item.verification_status && (
                  <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[9px] font-semibold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                    {item.verification_status === 'verified' ? 'Terverifikasi' : 'Menunggu'}
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {[
                  ['good', 'Terlaksana', 'bg-emerald-600 text-white', 'hover:bg-emerald-50'],
                  ['less', 'Kurang', 'bg-amber-500 text-white', 'hover:bg-amber-50'],
                  ['not_done', 'Belum', 'bg-rose-500 text-white', 'hover:bg-rose-50'],
                  ['na', 'Uzur / N/A', 'bg-slate-500 text-white', 'hover:bg-slate-100'],
                ].map(([val, label, activeStyle, hoverStyle]) => (
                  <button
                    type="button"
                    key={val}
                    disabled={!isEditable}
                    onClick={() => setValues({ ...values, [item.agenda_item_id]: val })}
                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition ${
                      values[item.agenda_item_id] === val
                        ? activeStyle
                        : `border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 ${hoverStyle}`
                    } disabled:opacity-50`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {context && (!context.items || context.items.length === 0) && (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
            Belum ada aktivitas rumah yang ditugaskan kepada orang tua untuk tanggal ini.
          </div>
        )}

        {context?.items?.length > 0 && isEditable && (
          <div className="mt-5">
            <button
              disabled={saving || !Object.keys(values).length}
              onClick={save}
              className="inline-flex items-center rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? <CheckCircle2 className="mr-1.5 h-4 w-4 animate-pulse" /> : <Save className="mr-1.5 h-4 w-4" />}
              Simpan Ibadah Rumah
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
