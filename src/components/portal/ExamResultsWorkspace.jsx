import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Award, CheckCircle2, FileText, BarChart3, Lock, Printer } from 'lucide-react'
import { Button } from '../tailgrids/core/button'
import { Badge } from '../tailgrids/core/badge'
import { Card } from '../tailgrids/core/card'
import { printWeeklyStudentEvaluation } from '../../utils/printHelper'

const formatDate = (val) => val ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(val)) : '-'

const KpiCardPastelStyles = {
  emerald: {
    card: 'border-emerald-200/80 bg-emerald-50/40 hover:border-emerald-300 dark:border-emerald-950/60 dark:bg-emerald-950/20',
    iconBg: 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    title: 'text-emerald-800 dark:text-emerald-300',
    val: 'text-emerald-950 dark:text-white',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
  },
  blue: {
    card: 'border-blue-200/80 bg-blue-50/40 hover:border-blue-300 dark:border-blue-950/60 dark:bg-blue-950/20',
    iconBg: 'bg-blue-100/80 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
    title: 'text-blue-800 dark:text-blue-300',
    val: 'text-blue-950 dark:text-white',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
  },
  amber: {
    card: 'border-amber-200/80 bg-amber-50/40 hover:border-amber-300 dark:border-amber-950/60 dark:bg-amber-950/20',
    iconBg: 'bg-amber-100/80 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
    title: 'text-amber-800 dark:text-amber-300',
    val: 'text-amber-950 dark:text-white',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
  },
  purple: {
    card: 'border-purple-200/80 bg-purple-50/40 hover:border-purple-300 dark:border-purple-950/60 dark:bg-purple-950/20',
    iconBg: 'bg-purple-100/80 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    title: 'text-purple-800 dark:text-purple-300',
    val: 'text-purple-950 dark:text-white',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
  },
}

const TAB_PASTEL_MAP = [
  { id: 'all', label: 'Semua Hasil', pastelColor: 'bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300' },
  { id: 'evaluasi', label: 'Evaluasi Mingguan', pastelColor: 'bg-orange-100/90 text-orange-700 hover:bg-orange-600 hover:text-white dark:bg-orange-950/60 dark:text-orange-300' },
  { id: 'ujian', label: 'Ujian CBT', pastelColor: 'bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300' },
  { id: 'tugas', label: 'Tugas', pastelColor: 'bg-amber-100/90 text-amber-700 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300' },
  { id: 'rapor', label: 'Rapor', pastelColor: 'bg-cyan-100/90 text-cyan-700 hover:bg-cyan-600 hover:text-white dark:bg-cyan-950/60 dark:text-cyan-300' },
]

export default function ExamResultsWorkspace({ resultsData = null, reports = [], loading = false, student = null }) {
  const [activeTab, setActiveTab] = useState('all')

  const cbtResults = useMemo(() => resultsData?.cbt_results || [], [resultsData])
  const assignmentResults = useMemo(() => resultsData?.assignment_results || [], [resultsData])
  const grades = useMemo(() => resultsData?.grades || [], [resultsData])

  const stats = useMemo(() => {
    const totalCompleted = (resultsData?.summary?.total_completed ?? (cbtResults.length + assignmentResults.length))
    const avgScore = resultsData?.summary?.average_score ? Math.round(resultsData.summary.average_score) : '-'

    const tuntasCount = [...cbtResults, ...assignmentResults].filter((r) => r.status_tuntas === 'Tuntas').length

    return { totalCompleted, avgScore, tuntasCount }
  }, [resultsData, cbtResults, assignmentResults])

  const allList = useMemo(() => {
    const combined = [
      ...cbtResults.map((c) => ({ ...c, itemType: 'ujian' })),
      ...assignmentResults.map((a) => ({ ...a, itemType: 'tugas' })),
      ...grades.map((g) => ({ ...g, itemType: 'rapor_komponen' })),
    ]

    if (activeTab === 'ujian') return combined.filter((i) => i.itemType === 'ujian')
    if (activeTab === 'tugas') return combined.filter((i) => i.itemType === 'tugas')
    if (activeTab === 'rapor') return reports.map((r) => ({ ...r, itemType: 'rapor' }))
    return combined
  }, [cbtResults, assignmentResults, grades, reports, activeTab])

  const weeklyAttendance = useMemo(() => [
    { dayDate: 'Senin, 10 Agustus 2026', time: '07:30 - 08:50', subject: 'Ekonomi', status: 'Hadir' },
    { dayDate: 'Senin, 10 Agustus 2026', time: '09:05 - 10:25', subject: 'Kimia', status: 'Hadir' },
    { dayDate: 'Senin, 10 Agustus 2026', time: '10:40 - 12:00', subject: 'PKN', status: 'Hadir' },
    { dayDate: 'Senin, 10 Agustus 2026', time: '13:00 - 14:30', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },

    { dayDate: 'Selasa, 11 Agustus 2026', time: '07:30 - 08:50', subject: 'Informatika', status: 'Hadir' },
    { dayDate: 'Selasa, 11 Agustus 2026', time: '09:05 - 10:25', subject: 'Matematika', status: 'Hadir' },
    { dayDate: 'Selasa, 11 Agustus 2026', time: '10:40 - 12:00', subject: 'Pendidikan Agama Islam', status: 'Hadir' },
    { dayDate: 'Selasa, 11 Agustus 2026', time: '13:00 - 14:30', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },

    { dayDate: 'Rabu, 12 Agustus 2026', time: '07:30 - 08:30', subject: 'Biologi', status: 'Hadir' },
    { dayDate: 'Rabu, 12 Agustus 2026', time: '08:30 - 09:30', subject: 'Fisika', status: 'Hadir' },
    { dayDate: 'Rabu, 12 Agustus 2026', time: '09:45 - 10:45', subject: 'PJOK', status: 'Hadir' },
    { dayDate: 'Rabu, 12 Agustus 2026', time: '11:00 - 12:00', subject: 'Sosiologi', status: 'Hadir' },
    { dayDate: 'Rabu, 12 Agustus 2026', time: '13:00 - 14:30', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },

    { dayDate: 'Kamis, 13 Agustus 2026', time: '07:30 - 08:50', subject: 'Bahasa Indonesia', status: 'Hadir' },
    { dayDate: 'Kamis, 13 Agustus 2026', time: '09:05 - 10:25', subject: 'Bahasa Inggris', status: 'Hadir' },
    { dayDate: 'Kamis, 13 Agustus 2026', time: '10:40 - 12:00', subject: 'Sejarah', status: 'Hadir' },
    { dayDate: 'Kamis, 13 Agustus 2026', time: '13:00 - 14:30', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },

    { dayDate: 'Jumat, 14 Agustus 2026', time: '07:30 - 08:50', subject: 'Bahasa Arab (Fiqh)', status: 'Hadir' },
    { dayDate: 'Jumat, 14 Agustus 2026', time: '09:05 - 10:25', subject: 'Geografi', status: 'Hadir' },
    { dayDate: 'Jumat, 14 Agustus 2026', time: '10:40 - 11:45', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },
  ], [])

  const handlePrintEvaluation = () => {
    const eduUnit = student?.education_unit || (typeof student?.unit === 'object' ? student.unit : null)
    printWeeklyStudentEvaluation({
      student: {
        ...student,
        name: student?.name || student?.full_name || student?.nama_lengkap || 'Shezakia Mufidah Alfirdausi',
        nis: student?.nis || student?.nisn || student?.student_id || '-',
        className: student?.kelas?.nama_kelas || student?.className || '10 Madinah 1',
        unitName: eduUnit?.name || student?.unit_name || student?.unit || 'Sekolah Menengah Atas Islam Terpadu',
        education_unit: eduUnit,
      },
      period: {
        title: 'Senin, 10 Agustus 2026 s.d. Jumat, 14 Agustus 2026',
        academicYear: '2026/2027',
      },
      tahfizh: {
        lastSurah: "Ali 'Imran ayat 135-137",
        lastDepositDate: 'Jumat, 14 Agustus 2026',
        totalLines: 34,
        targetLines: 15,
        status: 'TERCAPAI',
      },
      attendance: weeklyAttendance,
      teacherNotes: "Tidak ada catatan guru pada periode ini.",
      homeroomTeacher: {
        name: 'Ustadzah Elsa Putri Utami',
      },
      guruWali: {
        name: 'Ilma Emilia Widyastuti',
      },
      schoolCity: eduUnit?.metadata?.city || 'Padang',
    })
  }

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <motion.div whileHover={{ y: -2 }}>
          <Card className={`p-5 rounded-[20px] border shadow-xs transition-all duration-200 hover:shadow-md ${KpiCardPastelStyles.blue.card}`}>
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${KpiCardPastelStyles.blue.iconBg}`}>
                <Award className="h-5 w-5" />
              </span>
              <span className={`text-xl font-black ${KpiCardPastelStyles.blue.val}`}>{stats.avgScore}</span>
            </div>
            <p className={`mt-3 text-xs font-extrabold ${KpiCardPastelStyles.blue.title}`}>Rata-rata Hasil</p>
            <p className={`mt-0.5 text-[11px] ${KpiCardPastelStyles.blue.sub}`}>Rata-rata skor evaluasi</p>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -2 }}>
          <Card className={`p-5 rounded-[20px] border shadow-xs transition-all duration-200 hover:shadow-md ${KpiCardPastelStyles.emerald.card}`}>
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${KpiCardPastelStyles.emerald.iconBg}`}>
                <CheckCircle2 className="h-5 w-5" />
              </span>
              <span className={`text-xl font-black ${KpiCardPastelStyles.emerald.val}`}>{cbtResults.length}</span>
            </div>
            <p className={`mt-3 text-xs font-extrabold ${KpiCardPastelStyles.emerald.title}`}>Ujian CBT Selesai</p>
            <p className={`mt-0.5 text-[11px] ${KpiCardPastelStyles.emerald.sub}`}>Total sesi dikumpulkan</p>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -2 }}>
          <Card className={`p-5 rounded-[20px] border shadow-xs transition-all duration-200 hover:shadow-md ${KpiCardPastelStyles.amber.card}`}>
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${KpiCardPastelStyles.amber.iconBg}`}>
                <FileText className="h-5 w-5" />
              </span>
              <span className={`text-xl font-black ${KpiCardPastelStyles.amber.val}`}>{assignmentResults.length}</span>
            </div>
            <p className={`mt-3 text-xs font-extrabold ${KpiCardPastelStyles.amber.title}`}>Tugas Terkumpul</p>
            <p className={`mt-0.5 text-[11px] ${KpiCardPastelStyles.amber.sub}`}>Dari tugas yang diberikan</p>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -2 }}>
          <Card className={`p-5 rounded-[20px] border shadow-xs transition-all duration-200 hover:shadow-md ${KpiCardPastelStyles.purple.card}`}>
            <div className="flex items-center justify-between">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${KpiCardPastelStyles.purple.iconBg}`}>
                <BarChart3 className="h-5 w-5" />
              </span>
              <span className={`text-xl font-black ${KpiCardPastelStyles.purple.val}`}>{stats.tuntasCount}</span>
            </div>
            <p className={`mt-3 text-xs font-extrabold ${KpiCardPastelStyles.purple.title}`}>Status Tuntas</p>
            <p className={`mt-0.5 text-[11px] ${KpiCardPastelStyles.purple.sub}`}>Mencapai KKM/Tuntas</p>
          </Card>
        </motion.div>
      </div>

      {/* Main Card */}
      <Card className="rounded-[22px] border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Rekapitulasi Evaluasi & Rapor Belajar</h3>
            <p className="mt-0.5 text-xs text-slate-400">Pantau hasil penilaian ujian, tugas, lembar evaluasi mingguan, dan buku rapor resmi</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {TAB_PASTEL_MAP.map(({ id, label, pastelColor }) => {
              const isActive = activeTab === id
              return (
                <Button
                  key={id}
                  variant={isActive ? 'primary' : 'ghost'}
                  appearance={isActive ? 'fill' : 'outline'}
                  size="xs"
                  onClick={() => setActiveTab(id)}
                  className={`cursor-pointer transition-all duration-200 font-bold shrink-0 ${
                    isActive
                      ? '!bg-[#0E5C44] !text-white shadow-md shadow-emerald-900/20 ring-2 ring-emerald-500/40 scale-[1.02]'
                      : `${pastelColor} border-transparent`
                  }`}
                >
                  {label}
                </Button>
              )
            })}
          </div>
        </div>

        {/* JIKA TAB EVALUASI MINGGUAN DIPILIH */}
        {activeTab === 'evaluasi' ? (
          <div className="mt-6 space-y-6">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/40 rounded-2xl">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-orange-700 dark:text-orange-400">
                  Laporan Perkembangan Santri Terpadu
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Lembar Evaluasi Mingguan (Pekan ke-6 · 10 - 14 Agustus 2026)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Santri: <strong className="text-slate-800 dark:text-slate-200">{student?.name || student?.full_name || 'Ananda'}</strong> • Kelas: {student?.kelas?.nama_kelas || student?.className || 'Kelas X SMA Terpadu'}
                </p>
              </div>
              <button
                type="button"
                onClick={handlePrintEvaluation}
                className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
              >
                <Printer className="w-4 h-4" /> Cetak Lembar Evaluasi / PDF
              </button>
            </div>

            {/* 3. CAPAIAN TAHSIN & TAHFIZH */}
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="bg-[#EA580C] text-white px-4 py-2.5 font-extrabold text-xs uppercase tracking-wide">
                3. CAPAIAN TAHSIN & TAHFIZH
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs bg-white dark:bg-[#1B2433]">
                <div className="grid grid-cols-1 md:grid-cols-2 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Hafalan Terakhir</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Ali 'Imran ayat 135-137</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Tanggal Setoran Terakhir</span>
                  <span className="font-semibold text-slate-900 dark:text-white">Jumat, 14 Agustus 2026</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Total Baris (Periode Ini)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">34</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Target Baris Pekan Ini</span>
                  <span className="font-semibold text-slate-900 dark:text-white">15</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Status Pencapaian</span>
                  <span className="inline-flex items-center gap-2 font-black text-emerald-600 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    TERCAPAI
                  </span>
                </div>
              </div>
            </div>

            {/* 4. KEHADIRAN PER MATA PELAJARAN (AKADEMIK) */}
            <div className="space-y-2">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wide">
                4. KEHADIRAN PER MATA PELAJARAN (AKADEMIK)
              </h4>
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className="bg-emerald-50/70 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="p-3 w-44">Hari, Tanggal</th>
                      <th className="p-3 w-32">Waktu / Jam</th>
                      <th className="p-3">Mata Pelajaran</th>
                      <th className="p-3 text-center w-28">Status Kehadiran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {weeklyAttendance.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{item.dayDate}</td>
                        <td className="p-3 text-slate-500 font-mono text-[11px]">{item.time}</td>
                        <td className="p-3 font-semibold text-slate-900 dark:text-white">{item.subject}</td>
                        <td className="p-3 text-center">
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. CATATAN GURU */}
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="bg-[#EA580C] text-white px-4 py-2.5 font-extrabold text-xs uppercase tracking-wide">
                5. CATATAN GURU
              </div>
              <div className="p-4 bg-white dark:bg-[#1B2433] text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                Alhamdulillah ananda menunjukkan kedisiplinan belajar yang sangat baik dan capaian hafalan Al-Qur'an melampaui target pekanan (34 dari target 15 baris). Mohon Ayah/Bunda senantiasa memantau dan mendampingi muraja'ah di rumah.
              </div>
            </div>

            {/* PESAN KEMITRAAN & DOA */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-3">
              <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                🤝 <strong>Kami meyakini</strong> bahwa keberhasilan pendidikan Ananda merupakan hasil sinergi antara sekolah dan keluarga. Oleh karena itu, kami sangat mengharapkan kerja sama Ayah/Bunda dalam mendampingi, mengarahkan, serta mendoakan Ananda agar terus bertumbuh menjadi pribadi yang berilmu, berakhlak mulia, dan bertakwa kepada Allah ﷻ.
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                💬 <strong>Apabila Ayah/Bunda ingin berdiskusi</strong> mengenai perkembangan Ananda, silakan menghubungi wali kelas atau guru terkait.
              </p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                Semoga Allah ﷻ senantiasa menjaga, membimbing, dan memberkahi langkah Ananda dalam menuntut ilmu, serta menjadikannya anak yang saleh, penyejuk hati bagi kedua orang tuanya, dan bermanfaat bagi umat.
              </p>
              <p className="text-center font-bold text-sm text-[#0E5C44] dark:text-emerald-400 pt-2 font-serif">
                جَزَاكُمُ اللَّهُ خَيْرًا وَبَارَكَ اللَّهُ فِيكُمْ
              </p>
            </div>
          </div>
        ) : (
          /* List Hasil Standard */
          <div className="mt-5 divide-y divide-slate-100 dark:divide-slate-800">
            {allList.map((item, idx) => (
              <div key={item.id || idx} className="flex flex-wrap items-center justify-between gap-4 py-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {item.subject || item.semester?.name || 'Evaluasi'}
                    </span>
                    <Badge color="gray" size="sm" className="font-bold uppercase text-[10px]">
                      {item.itemType === 'ujian' ? 'Ujian CBT' : item.itemType === 'tugas' ? 'Tugas' : item.itemType === 'rapor' ? 'Rapor' : 'Komponen'}
                    </Badge>
                  </div>
                  <h4 className="mt-1 text-sm font-bold text-slate-900 dark:text-white">{item.title || `Rapor ${item.semester?.name || ''}`}</h4>
                  <p className="mt-0.5 text-slate-500">Selesai/Terbit: {formatDate(item.date || item.tanggal_terbit || item.created_at)}</p>

                  {item.notes && <p className="mt-1 italic text-slate-600 dark:text-slate-400">"{item.notes}"</p>}
                </div>

                <div className="text-right">
                  {item.is_published !== false && item.score != null ? (
                    <>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{item.score}</p>
                      {item.correct != null && (
                        <p className="text-[10px] text-slate-400">
                          Benar: {item.correct} · Salah: {item.wrong} · Kosong: {item.empty}
                        </p>
                      )}
                      <Badge color={item.status_tuntas === 'Tuntas' ? 'success' : 'warning'} size="sm" className="font-bold mt-1">
                        {item.status_tuntas || 'Tuntas'}
                      </Badge>
                    </>
                  ) : (
                    <Badge color="warning" size="sm" className="font-bold inline-flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5" />
                      Menunggu Publikasi
                    </Badge>
                  )}
                </div>
              </div>
            ))}

            {!allList.length && (
              <div className="py-16 text-center text-xs text-slate-400">
                <Award className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                Belum ada hasil evaluasi pada kategori ini.
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
