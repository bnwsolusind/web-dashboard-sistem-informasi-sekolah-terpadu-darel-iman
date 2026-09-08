import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { HeartHandshake, CheckCircle2, Circle, Clock, Save, Loader2, Calendar, Award } from 'lucide-react'

const cardStyle = 'rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'

export default function MutabaahWorkspace({ mutabaah = null, onSaveMutabaah, isParent = false, readOnly = false, loading = false }) {
  const isReadOnly = isParent || readOnly
  const [checkedIds, setCheckedIds] = useState(() => {
    const existing = mutabaah?.details || []
    return new Set(existing.map((d) => d.activity_id || d.id || d.activity_name))
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const existing = mutabaah?.details || []
    setCheckedIds(new Set(existing.filter((item) => item.status_value === 'good').map((d) => d.activity_id || d.id || d.activity_name)))
  }, [mutabaah])

  const detailsList = useMemo(() => mutabaah?.details || [], [mutabaah])

  const stats = useMemo(() => {
    const total = Number(mutabaah?.total_items ?? detailsList.length)
    const achieved = Number(mutabaah?.good_count ?? detailsList.filter((item) => item.status_value === 'good').length)
    const pending = Number(mutabaah?.not_done_count ?? detailsList.filter((item) => item.status_value === 'not_done').length)
    const percentage = mutabaah?.score == null ? null : Math.round(Number(mutabaah.score))
    return { total, achieved, pending, percentage }
  }, [detailsList, mutabaah])

  const toggleCheck = (id) => {
    if (isReadOnly) return
    setCheckedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSave = async () => {
    if (isReadOnly || !onSaveMutabaah) return
    setSaving(true)
    setMessage('')
    try {
      await onSaveMutabaah(Array.from(checkedIds))
      setMessage('Mutabaah hari ini berhasil diperbarui!')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Gagal menyimpan mutabaah.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <HeartHandshake className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.total}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Aktivitas Target</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Total mutabaah harian</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.achieved}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Tercapai Hari Ini</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Aktivitas terlaksana</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <Clock className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.pending}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Belum Dicentang</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Aktivitas tersisa</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <Award className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.percentage == null ? '-' : `${stats.percentage}%`}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Persentase Capaian</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-violet-500" style={{ width: `${stats.percentage || 0}%` }} />
          </div>
        </motion.div>
      </div>

      {/* Main Checklist Card */}
      <div className={cardStyle}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Checklist Mutabaah Yaumi</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {isReadOnly ? 'Monitoring ketercapaian mutabaah harian.' : 'Isi checklist ibadah harian secara jujur dan konsisten.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase ${mutabaah?.status === 'verified' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              Status: {mutabaah?.status || 'Menunggu Validasi'}
            </span>

            {!isReadOnly && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex h-9 items-center gap-2 rounded-xl bg-[#0E5C44] px-4 text-xs font-bold text-white transition hover:bg-[#157255] disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Simpan Mutabaah
              </button>
            )}
          </div>
        </div>

        {message && (
          <div className="mt-4 rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {message}
          </div>
        )}

        {/* List Checklist */}
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {detailsList.map((item, idx) => {
            const id = item.activity_id || item.id || item.activity_name || `act-${idx}`
            const isChecked = item.status_value === 'good' || checkedIds.has(id) || item.is_completed || item.completed

            return (
              <div
                key={id}
                onClick={() => toggleCheck(id)}
                className={`flex items-center gap-3 rounded-2xl border p-4 transition ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} ${isChecked ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20' : 'border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/40'}`}
              >
                {isChecked ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Circle className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-600" />
                )}
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-bold ${isChecked ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'}`}>
                    {item.activity_name || item.name || item.title}
                  </p>
                  <p className="text-[10px] text-slate-400">{item.category || 'Aktivitas Harian'}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
