import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FileCheck2, Clock, CircleHelp, TimerReset, ShieldCheck, Play, LockKeyhole, Loader2 } from 'lucide-react'

const cardStyle = 'rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'

const formatDate = (val) => val ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(val)) : 'Tanpa batas'

export default function CbtExamsWorkspace({ lmsData = null, onStartExam, isParent = false, startingId = null, loading = false }) {
  const [instructionModal, setInstructionModal] = useState(null)

  const exams = useMemo(() => Array.isArray(lmsData?.exams) ? lmsData.exams : [], [lmsData])

  const stats = useMemo(() => {
    const total = exams.length
    const available = exams.filter((e) => ['available', 'resume'].includes(e.availability)).length
    const upcoming = exams.filter((e) => e.availability === 'upcoming').length
    const completed = exams.filter((e) => e.latest_result).length

    return { total, available, upcoming, completed }
  }, [exams])

  const handleConfirmStart = (exam) => {
    setInstructionModal(null)
    if (onStartExam) {
      onStartExam(exam)
    }
  }

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <FileCheck2 className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.total}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Total Ujian</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Total paket CBT semester ini</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Play className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.available}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Siap Dikerjakan</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Ujian aktif & dapat dimulai</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <Clock className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.upcoming}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Akan Datang</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Sesuai jadwal mendatang</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{stats.completed}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Telah Selesai</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Ujian telah dikumpulkan</p>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className={cardStyle}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Ujian CBT (Computer Based Test)</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              {isParent ? 'Monitoring jadwal dan status pengerjaan ujian CBT siswa.' : 'Pilih ujian yang siap dikerjakan. Pastikan koneksi internet stabil.'}
            </p>
          </div>

          {isParent && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-[10px] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
              Orang tua tidak dapat memulai CBT
            </span>
          )}
        </div>

        {/* List Cards */}
        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {exams.map((exam) => {
            const canStart = !isParent && ['available', 'resume'].includes(exam.availability)
            const busy = startingId === exam.id

            return (
              <article
                key={exam.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                      {exam.mata_pelajaran || 'Mapel'}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${exam.availability === 'available' ? 'bg-emerald-100 text-emerald-700' : exam.availability === 'resume' ? 'bg-blue-100 text-blue-700' : exam.availability === 'upcoming' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'}`}>
                      {exam.availability === 'available' ? 'Tersedia' : exam.availability === 'resume' ? 'Lanjutkan' : exam.availability === 'upcoming' ? 'Akan Datang' : 'Ditutup'}
                    </span>
                  </div>

                  <h4 className="mt-2 text-base font-bold text-slate-900 dark:text-white">{exam.judul_ujian}</h4>
                  <p className="mt-1 text-xs text-slate-500">{exam.kelas || 'Kelas'} · {exam.guru || 'Guru pengampu'}</p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <span className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800">
                      <Clock className="mb-1 h-3.5 w-3.5 text-blue-500" />
                      {exam.durasi_menit} menit
                    </span>
                    <span className="rounded-xl bg-slate-50 p-2 dark:bg-slate-800">
                      <CircleHelp className="mb-1 h-3.5 w-3.5 text-violet-500" />
                      {exam.kisi_kisi?.jumlah_soal || 0} soal
                    </span>
                  </div>

                  <div className="mt-3 text-[11px] text-slate-400 space-y-1">
                    <p>Mulai: {formatDate(exam.waktu_mulai)}</p>
                    <p>Selesai: {formatDate(exam.waktu_selesai)}</p>
                  </div>
                </div>

                {!isParent && (
                  <button
                    disabled={!canStart || busy}
                    onClick={() => setInstructionModal(exam)}
                    className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#0E5C44] text-xs font-bold text-white transition hover:bg-[#157255] disabled:cursor-not-allowed disabled:bg-slate-300 dark:disabled:bg-slate-700"
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : canStart ? <Play className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
                    {exam.availability === 'resume' ? 'Lanjutkan Ujian' : exam.availability === 'available' ? 'Mulai Ujian' : 'Belum Dapat Dikerjakan'}
                  </button>
                )}
              </article>
            )
          })}

          {!exams.length && (
            <div className="col-span-full py-16 text-center text-xs text-slate-400">
              <FileCheck2 className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              Belum ada jadwal ujian CBT untuk kelas Anda.
            </div>
          )}
        </div>
      </div>

      {/* Modal Petunjuk Ujian */}
      {instructionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-md rounded-[18px] bg-white p-6 shadow-2xl dark:bg-slate-900 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-white">Instruksi Pengerjaan Ujian</h3>
              <button onClick={() => setInstructionModal(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-2 text-xs leading-5 text-slate-700 dark:text-slate-300">
              <p><b>Judul:</b> {instructionModal.judul_ujian}</p>
              <p><b>Mata Pelajaran:</b> {instructionModal.mata_pelajaran}</p>
              <p><b>Durasi:</b> {instructionModal.durasi_menit} menit</p>
              <p><b>Jumlah Soal:</b> {instructionModal.kisi_kisi?.jumlah_soal || 0} soal</p>
              <div className="rounded-xl bg-amber-50 p-3 text-[11px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Peringatan: Setelah menekan tombol Mulai, waktu ujian akan berjalan secara langsung dan jawaban Anda disimpan secara otomatis.
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                onClick={() => setInstructionModal(null)}
                className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold dark:border-slate-700"
              >
                Batal
              </button>
              <button
                onClick={() => handleConfirmStart(instructionModal)}
                className="flex h-10 items-center gap-2 rounded-xl bg-[#0E5C44] px-5 text-xs font-bold text-white"
              >
                <Play className="h-4 w-4" />
                Mulai Ujian Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
