import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarCheck, Clock, FileText, AlertCircle, Plus, CheckCircle2, X, Send, Loader2 } from 'lucide-react'

const cardStyle = 'rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'

const formatDate = (val) => val ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(val)) : '-'

export default function AttendanceWorkspace({ attendanceLogs = [], permissionsHistory = [], onSubmitPermission, canSubmitPermission = false, isParent = false, loading = false }) {
  const [activeTab, setActiveTab] = useState('school')
  const [modalOpen, setModalOpen] = useState(false)
  const [type, setType] = useState('Sakit')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10))
  const [reason, setReason] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const safeAttendanceLogs = useMemo(() => {
    if (Array.isArray(attendanceLogs)) return attendanceLogs
    if (attendanceLogs && Array.isArray(attendanceLogs.data)) return attendanceLogs.data
    return []
  }, [attendanceLogs])

  const safePermissionsHistory = useMemo(() => {
    if (Array.isArray(permissionsHistory)) return permissionsHistory
    if (permissionsHistory && Array.isArray(permissionsHistory.data)) return permissionsHistory.data
    return []
  }, [permissionsHistory])

  const stats = useMemo(() => {
    let hadir = 0, terlambat = 0, izin = 0, sakit = 0, alpha = 0

    safeAttendanceLogs.forEach((item) => {
      const st = (item.status_hadir || item.status_label || item.status || '').toLowerCase()
      if (st.includes('hadir')) hadir++
      else if (st.includes('terlambat')) terlambat++
      else if (st.includes('izin')) izin++
      else if (st.includes('sakit')) sakit++
      else if (st.includes('alpha') || st.includes('alpa')) alpha++
    })

    return { hadir, terlambat, izin, sakit, alpha }
  }, [safeAttendanceLogs])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!onSubmitPermission) return
    setSubmitting(true)
    setMessage('')
    try {
      await onSubmitPermission({ type, start_date: startDate, end_date: endDate, reason, attachment })
      setMessage('Pengajuan izin/sakit berhasil dikirim!')
      setTimeout(() => {
        setModalOpen(false)
        setReason('')
        setAttachment(null)
        setMessage('')
      }, 1200)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Gagal mengirim pengajuan.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">Hadir</p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.hadir}</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Terlambat</p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.terlambat}</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Izin</p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.izin}</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-violet-600">Sakit</p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.sakit}</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-600">Alpha</p>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{stats.alpha}</p>
        </motion.div>
      </div>

      {/* Main Workspace Card */}
      <div className={cardStyle}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('school')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${activeTab === 'school' ? 'bg-[#0E5C44] text-white shadow' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'}`}
            >
              Presensi Pembelajaran
            </button>
            <button
              onClick={() => setActiveTab('permissions')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${activeTab === 'permissions' ? 'bg-[#0E5C44] text-white shadow' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'}`}
            >
              Riwayat Izin / Sakit
            </button>
          </div>

          {canSubmitPermission && (
            <button
              onClick={() => setModalOpen(true)}
              className="flex h-9 items-center gap-2 rounded-xl bg-[#0E5C44] px-4 text-xs font-bold text-white transition hover:bg-[#157255]"
            >
              <Plus className="h-4 w-4" />
              Ajukan Izin / Sakit
            </button>
          )}
        </div>

        {/* Content Presensi */}
        {activeTab === 'school' && (
          <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
            {safeAttendanceLogs.map((item, idx) => (
              <div key={item.id || idx} className="flex flex-wrap items-center justify-between gap-4 py-4 text-xs">
                <div>
                  <b className="text-sm font-bold text-slate-900 dark:text-white">{item.jadwal_pelajaran?.subject?.name || item.jadwalPelajaran?.subject?.name || item.session?.subject?.name || item.session?.schedule?.subject?.name || item.subject_name || 'Presensi Pembelajaran'}</b>
                  <p className="mt-1 text-slate-500">{formatDate(item.tanggal || item.created_at || item.date)} · Waktu: {item.arrival_time || item.waktu_presensi || 'Tepat Waktu'}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${/hadir/i.test(item.status_hadir || item.status_label || item.status || '') ? 'bg-emerald-100 text-emerald-700' : /sakit|izin/i.test(item.status_hadir || item.status_label || item.status || '') ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                  {item.status_label || (item.status_hadir ? item.status_hadir.charAt(0).toUpperCase() + item.status_hadir.slice(1) : (item.status || 'Hadir'))}
                </span>
              </div>
            ))}

            {!safeAttendanceLogs.length && (
              <div className="py-16 text-center text-xs text-slate-400">
                <CalendarCheck className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                Belum ada riwayat presensi yang dicatat.
              </div>
            )}
          </div>
        )}

        {/* Content Permissions */}
        {activeTab === 'permissions' && (
          <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
            {safePermissionsHistory.map((item, idx) => (
              <div key={item.id || idx} className="flex flex-wrap items-center justify-between gap-4 py-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white">{item.type}</span>
                    <span className="text-slate-400">({formatDate(item.start_date)} - {formatDate(item.end_date)})</span>
                  </div>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">Alasan: {item.reason}</p>
                  {item.attachment_path && (
                    <a
                      href={`/storage/${item.attachment_path}`}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 font-bold text-emerald-700 hover:underline"
                    >
                      <FileText className="h-3.5 w-3.5" /> lihat bukti lampiran
                    </a>
                  )}
                </div>
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold ${item.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : item.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                  {item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : 'Menunggu Verifikasi'}
                </span>
              </div>
            ))}

            {!permissionsHistory.length && (
              <div className="py-16 text-center text-xs text-slate-400">
                <FileText className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                Belum ada pengajuan izin/sakit.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Submit Permission */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-md rounded-[18px] bg-white p-6 shadow-2xl dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Pengajuan Izin / Sakit</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {message && (
              <div className="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {message}
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Jenis Pengajuan</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
              >
                <option value="Sakit">Sakit</option>
                <option value="Izin">Izin</option>
                <option value="Keperluan keluarga">Keperluan keluarga</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Tanggal Mulai</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Tanggal Selesai</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Alasan</label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Tuliskan keterangan/alasan izin..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Bukti Lampiran (Surat Dokter / Foto)</label>
              <input
                type="file"
                onChange={(e) => setAttachment(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-emerald-700"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold dark:border-slate-700"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex h-10 items-center gap-2 rounded-xl bg-[#0E5C44] px-5 text-xs font-bold text-white transition hover:bg-[#157255] disabled:opacity-50"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Kirim Pengajuan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
