import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Clock, CheckCircle2, AlertTriangle, FileUp, Send, Loader2, Award, User, BookOpen, ExternalLink, Paperclip } from 'lucide-react'

const cardStyle = 'rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'

const formatDate = (val) => val ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(val)) : '-'

export default function AssignmentsWorkspace({ assignments = [], onSubmitAssignment, isParent = false, canSubmit = true, loading = false }) {
  const [activeTab, setActiveTab] = useState('all')
  const [activeModal, setActiveModal] = useState(null)
  const [textAnswer, setTextAnswer] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const now = new Date()

  const safeAssignments = useMemo(() => {
    if (Array.isArray(assignments)) return assignments
    if (assignments && Array.isArray(assignments.data)) return assignments.data
    if (assignments && Array.isArray(assignments.data?.data)) return assignments.data.data
    return []
  }, [assignments])

  const stats = useMemo(() => {
    let activeCount = 0
    let pendingCount = 0
    let lateCount = 0
    let gradedCount = 0

    safeAssignments.forEach((item) => {
      const submission = item.pengumpulan_tugas?.[0]
      const isPastDeadline = item.deadline && new Date(item.deadline) < now

      if (!submission) {
        activeCount++
        if (isPastDeadline) lateCount++
        else pendingCount++
      } else {
        if (submission.nilai_guru != null) gradedCount++
        if (submission.status === 'terlambat') lateCount++
      }
    })

    return { activeCount, pendingCount, lateCount, gradedCount }
  }, [safeAssignments, now])

  const filteredAssignments = useMemo(() => {
    return safeAssignments.filter((item) => {
      const submission = item.pengumpulan_tugas?.[0]
      const isPastDeadline = item.deadline && new Date(item.deadline) < now

      if (activeTab === 'pending') return !submission && !isPastDeadline
      if (activeTab === 'submitted') return submission && submission.nilai_guru == null
      if (activeTab === 'late') return (submission && submission.status === 'terlambat') || (!submission && isPastDeadline)
      if (activeTab === 'graded') return submission && submission.nilai_guru != null
      return true
    })
  }, [safeAssignments, activeTab, now])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!activeModal) return
    setSubmitting(true)
    setMessage('')
    try {
      if (onSubmitAssignment) {
        await onSubmitAssignment(activeModal.id, { jawaban_teks: textAnswer, file_lampiran: selectedFile })
      }
      setMessage('Tugas berhasil dikumpulkan!')
      setTimeout(() => {
        setActiveModal(null)
        setTextAnswer('')
        setSelectedFile(null)
        setMessage('')
      }, 1200)
    } catch (err) {
      setMessage(err.response?.data?.message || 'Pengumpulan tugas gagal.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* KPI Section */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <ClipboardList className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.activeCount}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Tugas Aktif</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Penugasan yang diterbitkan</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Clock className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.pendingCount}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Belum Dikumpulkan</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Menunggu pengerjaan</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.lateCount}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Terlambat</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Melewati tenggat waktu</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.gradedCount}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Sudah Dinilai</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Nilai & umpan balik guru</p>
        </motion.div>
      </div>

      {/* Main Content Card */}
      <div className={cardStyle}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex flex-wrap gap-1.5 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'pending', label: 'Belum Dikerjakan' },
              { id: 'submitted', label: 'Sudah Dikumpulkan' },
              { id: 'late', label: 'Terlambat' },
              { id: 'graded', label: 'Dinilai' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${activeTab === tab.id ? 'bg-[#0E5C44] text-white shadow' : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isParent && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {canSubmit ? "Mode Orang Tua (Unit SD — Kumpul Tugas Aktif)" : "Mode Monitoring Orang Tua (SMP/SMA)"}
            </span>
          )}
        </div>

        {/* List Tugas */}
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredAssignments.map((item) => {
            const submission = item.pengumpulan_tugas?.[0]
            const isLate = item.deadline && new Date(item.deadline) < now

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-100 bg-slate-50 p-5 transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-800/40"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-emerald-600">{item.subject?.name || 'Mata Pelajaran'}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${submission?.nilai_guru != null ? 'bg-emerald-100 text-emerald-700' : submission ? 'bg-blue-100 text-blue-700' : isLate ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                      {submission?.nilai_guru != null ? 'Dinilai' : submission ? 'Dikumpulkan' : isLate ? 'Terlambat' : 'Aktif'}
                    </span>
                  </div>

                  <h3 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{item.judul}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{item.deskripsi || item.instruksi || 'Tugas pembelajaran'}</p>

                  {item.materi && (
                    <div className="mt-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-2.5 dark:border-emerald-600/30 dark:bg-emerald-950/30">
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          <BookOpen className="h-3.5 w-3.5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                          <span className="line-clamp-1">{item.materi.judul}</span>
                        </span>
                        {item.materi.link && (
                          <a
                            href={item.materi.link}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex flex-shrink-0 items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline dark:text-emerald-400"
                          >
                            <ExternalLink className="h-3 w-3" /> Buka Materi
                          </a>
                        )}
                      </div>
                      {item.materi.ringkasan && (
                        <p className="mt-1 line-clamp-1 text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                          {item.materi.ringkasan}
                        </p>
                      )}
                    </div>
                  )}

                  {item.file_lampiran_url && (
                    <div className="mt-2">
                      <a
                        href={item.file_lampiran_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                      >
                        <FileUp className="h-3.5 w-3.5" /> Buka Lembar Berkas Soal
                      </a>
                    </div>
                  )}

                  <div className="mt-4 space-y-1 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>Deadline: <b>{formatDate(item.deadline)}</b></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span>Guru: {item.teacher?.nama_lengkap || item.teacher?.name || 'Guru'}</span>
                    </div>
                  </div>

                  {submission?.nilai_guru != null && (
                    <div className="mt-3 rounded-xl bg-emerald-50 p-3 text-xs dark:bg-emerald-950/40">
                      <div className="flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300">
                        <span>Nilai</span>
                        <span className="text-base font-black">{submission.nilai_guru}</span>
                      </div>
                      {submission.catatan_guru && (
                        <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400">
                          Catatan: {submission.catatan_guru}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {(!isParent || canSubmit) && !submission && (
                  <button
                    onClick={() => setActiveModal(item)}
                    className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0E5C44] text-xs font-bold text-white transition hover:bg-[#157255]"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {isParent ? "Kumpulkan Tugas (Ananda)" : "Kumpulkan Tugas"}
                  </button>
                )}
                {isParent && !canSubmit && !submission && (
                  <div className="mt-4 rounded-xl bg-amber-50 p-2.5 text-center text-[11px] font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
                    Tugas jenjang SMP/SMA dikerjakan langsung oleh ananda di portal siswa.
                  </div>
                )}
              </div>
            )
          })}

          {!filteredAssignments.length && (
            <div className="col-span-full py-16 text-center text-xs text-slate-400">
              <ClipboardList className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              Tidak ada tugas pada kategori ini.
            </div>
          )}
        </div>
      </div>

      {/* Modal Submit Tugas */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-[18px] bg-white p-6 shadow-2xl dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Kirim Tugas: {activeModal.judul}</h3>
              <button type="button" onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {message && (
              <div className="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {message}
              </div>
            )}

            {activeModal.deskripsi && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 dark:border-slate-800 dark:bg-slate-800/60">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                  <ClipboardList className="h-4 w-4 text-emerald-600" />
                  <span>Lembar Soal / Instruksi dari Guru:</span>
                </div>
                <p className="whitespace-pre-line text-xs font-mono text-slate-700 dark:text-slate-300 max-h-40 overflow-y-auto">
                  {activeModal.deskripsi}
                </p>
              </div>
            )}

            {activeModal.materi && (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/30">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <BookOpen className="h-4 w-4 flex-shrink-0" />
                  <div>
                    <span className="font-bold">Materi Belajar:</span> {activeModal.materi.judul}
                    {activeModal.materi.ringkasan && (
                      <p className="mt-0.5 line-clamp-1 text-[11px] font-normal text-emerald-700/90 dark:text-emerald-400/90">
                        {activeModal.materi.ringkasan}
                      </p>
                    )}
                  </div>
                </div>
                {activeModal.materi.link && (
                  <a
                    href={activeModal.materi.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex flex-shrink-0 items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700"
                  >
                    <ExternalLink className="h-3.5 w-3.5" /> Buka Materi
                  </a>
                )}
              </div>
            )}

            {activeModal.file_lampiran_url && (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/30">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  <FileUp className="h-4 w-4" />
                  <span>Berkas Soal Lampiran Guru</span>
                </div>
                <a
                  href={activeModal.file_lampiran_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-[#0E5C44] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#157255]"
                >
                  Unduh / Buka Soal
                </a>
              </div>
            )}

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Jawaban Teks</label>
              <textarea
                rows={4}
                value={textAnswer}
                onChange={(e) => setTextAnswer(e.target.value)}
                placeholder="Tuliskan jawaban Anda..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">Upload Lampiran (PDF / Gambar / Doc)</label>
              <input
                type="file"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="w-full text-xs text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-xs file:font-bold file:text-emerald-700 hover:file:bg-emerald-100"
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
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
                Kirim Sekarang
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
