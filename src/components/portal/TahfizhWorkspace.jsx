import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { BookOpenCheck, Target, Award, Calendar, Sparkles } from 'lucide-react'

const cardStyle = 'rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'

const formatDate = (val) => val ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(val)) : '-'

export default function TahfizhWorkspace({ logs = [], target = null, achievement = null, loading = false }) {
  const safeLogs = useMemo(() => {
    if (Array.isArray(logs)) return logs
    if (logs && Array.isArray(logs.data)) return logs.data
    if (logs && logs.data && Array.isArray(logs.data.data)) return logs.data.data
    return []
  }, [logs])

  const totalAyatFromLogs = useMemo(() => {
    return safeLogs.reduce((acc, curr) => {
      if (curr.jumlah_ayat !== undefined && curr.jumlah_ayat !== null && Number(curr.jumlah_ayat) > 0) {
        return acc + Number(curr.jumlah_ayat)
      }
      const start = Number(curr.hafalan_ayah_start ?? curr.ayat_start ?? curr.ayat_mulai)
      const end = Number(curr.hafalan_ayah_end ?? curr.ayat_end ?? curr.ayat_selesai)
      if (start > 0 && end >= start) {
        return acc + (end - start + 1)
      }
      return acc + (Number(curr.hafalan_baris) || 0)
    }, 0)
  }, [safeLogs])
  const totalAyat = achievement?.validated_unique_ayah ?? totalAyatFromLogs

  // Cari log setoran terbaru yang memiliki nama surah / rentang ayat
  const latestLog = useMemo(() => {
    return (
      safeLogs.find((l) => (l.hafalan_surah_name || l.surah || l.nama_surah) && (l.hafalan_ayah_start || l.ayat_start || l.ayat_mulai)) ||
      safeLogs.find((l) => l.hafalan_surah_name || l.surah || l.nama_surah || l.tilawah_text) ||
      safeLogs[0] ||
      null
    )
  }, [safeLogs])

  const latestSurah = latestLog?.hafalan_surah_name || latestLog?.surah || latestLog?.nama_surah || (latestLog?.tilawah_text ? latestLog.tilawah_text : '')
  const latestAyatStart = latestLog?.hafalan_ayah_start ?? latestLog?.ayat_start ?? latestLog?.ayat_mulai
  const latestAyatEnd = latestLog?.hafalan_ayah_end ?? latestLog?.ayat_end ?? latestLog?.ayat_selesai
  const latestDate = latestLog?.record_date || latestLog?.date || latestLog?.tanggal || latestLog?.created_at
  const latestTeacher = latestLog?.teacher?.full_name || latestLog?.teacher?.nama_lengkap || latestLog?.teacher?.name || latestLog?.pengampu || latestLog?.signature_teacher || 'Guru Tahfizh'

  const thisMonthLogs = useMemo(() => {
    const now = new Date()
    const currentMonthLogs = safeLogs.filter((log) => {
      const rawDate = log.record_date || log.date || log.tanggal || log.created_at
      if (!rawDate) return false
      const logDate = new Date(rawDate)
      return !isNaN(logDate.getTime()) &&
        logDate.getMonth() === now.getMonth() &&
        logDate.getFullYear() === now.getFullYear()
    })
    if (currentMonthLogs.length > 0) return currentMonthLogs

    // Fallback: Jika awal bulan kalender belum ada setoran baru, hitung frekuensi setoran bulan aktif terakhir
    const latestRawDate = safeLogs[0]?.record_date || safeLogs[0]?.date || safeLogs[0]?.tanggal
    if (latestRawDate) {
      const d = new Date(latestRawDate)
      if (!isNaN(d.getTime())) {
        const lastMonth = d.getMonth()
        const lastYear = d.getFullYear()
        return safeLogs.filter((log) => {
          const dt = new Date(log.record_date || log.date || log.tanggal)
          return dt.getMonth() === lastMonth && dt.getFullYear() === lastYear
        })
      }
    }
    return []
  }, [safeLogs])

  const targetProgress = useMemo(() => {
    if (achievement?.achievement_percentage !== null && achievement?.achievement_percentage !== undefined) return achievement.achievement_percentage
    const targetAyat = target?.target_ayat
    return targetAyat ? Math.min(100, Math.round((totalAyat / targetAyat) * 100)) : null
  }, [achievement, totalAyat, target])

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <BookOpenCheck className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{totalAyat}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Total Hafalan (Ayat)</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Ayat unik yang telah tervalidasi</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Target className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{achievement?.completed_surah_count ?? '—'}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Surah Selesai</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Seluruh ayat sudah tervalidasi</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <Award className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{targetProgress === null ? '—' : `${targetProgress}%`}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Progress Hafalan</p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full rounded-full bg-amber-500" style={{ width: `${targetProgress || 0}%` }} />
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <Calendar className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{achievement?.completed_juz_count ?? '—'}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Juz Selesai</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Tidak dihitung sebelum terbukti lengkap</p>
        </motion.div>
      </div>

      {/* Target Active Card */}
      <div className={`${cardStyle} bg-gradient-to-r from-emerald-900 to-teal-800 text-white dark:from-slate-900 dark:to-slate-900`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
              <Sparkles className="h-3 w-3" /> Hafalan Terakhir
            </span>
            <h3 className="mt-2 text-xl font-black">
              {latestSurah
                ? (latestAyatStart && latestAyatEnd
                    ? `${latestSurah} (Ayat ${latestAyatStart}-${latestAyatEnd})`
                    : latestSurah)
                : 'Belum Ada Setoran'}
            </h3>
            <p className="mt-1 text-xs text-emerald-100">
              {latestLog
                ? `Tanggal: ${formatDate(latestDate)} · Pengampu: ${latestTeacher}`
                : 'Segera lakukan setoran hafalan kepada guru tahfizh.'}
            </p>
          </div>
        </div>
      </div>

      {/* Riwayat Setoran */}
      <div className={cardStyle}>
        <div className="border-b border-slate-100 pb-4 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Riwayat Setoran Tahfizh</h3>
          <p className="mt-0.5 text-xs text-slate-500">Catatan setoran hafalan harian siswa.</p>
        </div>

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {safeLogs.map((item, idx) => {
            const surahTitle = item.hafalan_surah_name || item.surah || item.nama_surah || item.tilawah_text || 'Setoran Tahfizh'
            const aStart = item.hafalan_ayah_start ?? item.ayat_start ?? item.ayat_mulai
            const aEnd = item.hafalan_ayah_end ?? item.ayat_end ?? item.ayat_selesai
            const itemDate = item.record_date || item.date || item.tanggal || item.created_at
            const teacherName = item.teacher?.full_name || item.teacher?.nama_lengkap || item.teacher?.name || item.penguji || item.pengampu || item.signature_teacher || 'Belum tersedia'
            const itemNote = item.notes_teacher || item.catatan || item.notes_parent

            return (
              <div key={item.id || idx} className="flex flex-wrap items-center justify-between gap-4 py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{surahTitle}</span>
                    {aStart && aEnd ? (
                      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                        Ayat {aStart} - {aEnd}
                      </span>
                    ) : (
                      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        {item.murajaah_text ? 'Murajaah' : (item.tilawah_text ? 'Tilawah' : 'Tadarus')}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {formatDate(itemDate)} · Penguji: {teacherName}
                  </p>
                  {itemNote ? (
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic font-medium">"{itemNote}"</p>
                  ) : null}
                </div>
                <span className={`rounded-xl px-3 py-1 text-xs font-bold ${item.nilai === 'A' || item.nilai === 'Lancar' || item.nilai === 'Mumtaz' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'}`}>
                  {item.nilai || item.predikat || 'Lancar'}
                </span>
              </div>
            )
          })}

          {!safeLogs.length && (
            <div className="py-16 text-center text-xs text-slate-400">
              <BookOpenCheck className="mx-auto mb-3 h-10 w-10 text-slate-300" />
              Belum ada riwayat setoran tahfizh.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
