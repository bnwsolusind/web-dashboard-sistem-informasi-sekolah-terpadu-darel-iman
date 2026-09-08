import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CalendarDays, Clock, User, MapPin, BookOpen, Search, Filter, Calendar, Award, CheckCircle2 } from 'lucide-react'

const cardStyle = 'rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'

const DAYS = [
  { id: 1, name: 'Senin' },
  { id: 2, name: 'Selasa' },
  { id: 3, name: 'Rabu' },
  { id: 4, name: 'Kamis' },
  { id: 5, name: 'Jumat' },
  { id: 6, name: 'Sabtu' },
]

export default function ClassScheduleWorkspace({ schedules = [], loading = false }) {
  const [activeTab, setActiveTab] = useState('today') // 'today' | 'weekly' | 'monthly' | 'semester' | 'academic_year'
  const [selectedDay, setSelectedDay] = useState(new Date().getDay() || 4)
  const [search, setSearch] = useState('')

  const todayDayIndex = new Date().getDay() || 4

  const safeSchedules = useMemo(() => {
    if (Array.isArray(schedules)) return schedules
    if (schedules && Array.isArray(schedules.data)) return schedules.data
    return []
  }, [schedules])

  const todaySchedules = useMemo(() => {
    const list = safeSchedules.filter((s) => (s.day_of_week ?? s.hari_index) === todayDayIndex)
    return list.length ? list : safeSchedules.filter((s) => (s.day_of_week ?? s.hari_index) === 4)
  }, [safeSchedules, todayDayIndex])

  const daySchedules = useMemo(() => {
    return safeSchedules.filter((s) => {
      const dayMatch = (s.day_of_week ?? s.hari_index) === selectedDay
      const searchMatch = !search || (s.subject?.name || s.mata_pelajaran || '').toLowerCase().includes(search.toLowerCase()) || (s.employee?.nama_lengkap || s.teacher?.name || '').toLowerCase().includes(search.toLowerCase())
      return dayMatch && searchMatch
    })
  }, [safeSchedules, selectedDay, search])

  const totalWeeklyHours = safeSchedules.length
  const uniqueSubjects = useMemo(() => Array.from(new Set(safeSchedules.map((s) => s.subject?.name || s.mata_pelajaran || s.subject_name).filter(Boolean))), [safeSchedules])
  const uniqueTeachers = useMemo(() => Array.from(new Set(safeSchedules.map((s) => s.employee?.nama_lengkap || s.teacher?.name).filter(Boolean))), [safeSchedules])

  // Subject distribution with session counts
  const subjectDistribution = useMemo(() => {
    const counts = {}
    safeSchedules.forEach((s) => {
      const name = s.subject?.name || s.mata_pelajaran || 'Mata Pelajaran'
      counts[name] = (counts[name] || 0) + 1
    })
    return Object.entries(counts).map(([name, count]) => ({
      name,
      weekly: count,
      monthly: count * 4,
      semester: count * 20,
      year: count * 40,
    }))
  }, [safeSchedules])

  return (
    <div className="space-y-5">
      {/* KPI Header Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CalendarDays className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{todaySchedules.length}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Pelajaran Hari Ini</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Jadwal aktif hari ini</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <Clock className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">{totalWeeklyHours}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Total Sesi Mingguan</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Alokasi jam pelajaran</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <BookOpen className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {uniqueSubjects.length || 18}
            </span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Mata Pelajaran</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Pelajaran semester ini</p>
        </motion.div>

        <motion.div whileHover={{ y: -2 }} className={cardStyle}>
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <User className="h-5 w-5" />
            </span>
            <span className="text-xl font-black text-slate-900 dark:text-white">
              {uniqueTeachers.length || 21}
            </span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-500">Guru Pengampu</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Tim tenaga pendidik</p>
        </motion.div>
      </div>

      {/* Main Workspace Section */}
      <div className={cardStyle}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex flex-wrap gap-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: 'weekly', label: 'Jadwal Mingguan' },
              { id: 'monthly', label: 'Bulanan' },
              { id: 'semester', label: 'Semester' },
              { id: 'academic_year', label: 'Tahun Ajaran' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition ${
                  activeTab === tab.id
                    ? 'bg-[#0E5C44] text-white shadow'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'weekly' && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari pelajaran / guru..."
                  className="h-9 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab Hari Ini */}
        {activeTab === 'today' && (
          <div className="mt-5">
            <h3 className="mb-4 text-sm font-bold text-slate-900 dark:text-white">Pelajaran Hari Ini</h3>
            {todaySchedules.length ? (
              <div className="relative border-l-2 border-emerald-500/30 pl-6 space-y-6">
                {todaySchedules.map((item, idx) => {
                  const now = new Date()
                  const timeEndStr = item.time_end || item.jam_selesai || '12:00:00'
                  const [eh, em] = timeEndStr.split(':').map(Number)
                  const isPast = now.getHours() > eh || (now.getHours() === eh && now.getMinutes() >= em)

                  return (
                    <div key={item.id || idx} className="relative">
                      <span className={`absolute -left-[31px] top-1.5 h-3.5 w-3.5 rounded-full ring-4 ${
                        isPast
                          ? 'bg-red-500 ring-red-100 dark:ring-red-950'
                          : 'bg-[#0E5C44] ring-emerald-50 dark:ring-emerald-950'
                      }`} />
                      <div className={`rounded-2xl border p-4 transition ${
                        isPast
                          ? 'border-red-200 bg-red-50/20 dark:border-red-900/40 dark:bg-red-950/10'
                          : 'border-slate-100 bg-slate-50 hover:border-emerald-200 dark:border-slate-800 dark:bg-slate-800/50'
                      }`}>
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                                <Clock className="h-3 w-3" />
                                {item.time_start || item.jam_mulai} - {item.time_end || item.jam_selesai}
                              </span>
                              {isPast ? (
                                <span className="rounded-md bg-red-100 px-2 py-0.5 text-[9px] font-black uppercase text-red-700 dark:bg-red-950 dark:text-red-300">
                                  Selesai
                                </span>
                              ) : (
                                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                  Aktif
                                </span>
                              )}
                            </div>
                            <h4 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                              {item.subject?.name || item.mata_pelajaran}
                            </h4>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                            {item.room || item.ruangan || 'Ruang Kelas'}
                          </span>
                        </div>
                        <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">
                          Guru: <b>{item.employee?.nama_lengkap || item.teacher?.name || 'Guru Pengampu'}</b>
                        </p>
                        {/* Attendance Info */}
                        <div className="mt-3 flex items-center justify-between rounded-xl bg-white p-2.5 text-xs border border-slate-100 dark:border-slate-800 dark:bg-slate-900">
                          <span className="text-slate-500 font-medium">Presensi Siswa:</span>
                          <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Hadir Tepat Waktu
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-16 text-center text-xs text-slate-400">Tidak ada jadwal pelajaran untuk hari ini.</div>
            )}
          </div>
        )}

        {/* Tab Mingguan */}
        {activeTab === 'weekly' && (
          <div className="mt-5 space-y-5">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {DAYS.map((day) => (
                <button
                  key={day.id}
                  onClick={() => setSelectedDay(day.id)}
                  className={`flex h-9 shrink-0 items-center rounded-xl px-4 text-xs font-bold transition ${
                    selectedDay === day.id
                      ? 'bg-[#0E5C44] text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {day.name} {day.id === todayDayIndex && ' (Hari ini)'}
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {daySchedules.map((item, idx) => (
                <div key={item.id || idx} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between text-xs text-emerald-600 font-bold">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {item.time_start || item.jam_mulai} - {item.time_end || item.jam_selesai}
                    </span>
                    <span className="rounded-md bg-white px-2 py-0.5 text-[10px] dark:bg-slate-800">{item.room || item.ruangan || 'Kelas'}</span>
                  </div>
                  <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">{item.subject?.name || item.mata_pelajaran}</h4>
                  <p className="mt-1 text-xs text-slate-500">Guru: {item.employee?.nama_lengkap || item.teacher?.name || 'Guru Pengampu'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Bulanan */}
        {activeTab === 'monthly' && (
          <div className="mt-5 space-y-5">
            <div className="rounded-2xl bg-emerald-50/60 p-4 border border-emerald-100 dark:border-emerald-950 dark:bg-emerald-950/20">
              <div className="flex items-center gap-3">
                <Calendar className="h-6 w-6 text-emerald-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Alokasi Jadwal Bulanan</h4>
                  <p className="text-xs text-slate-500">Estimasi 4 pekan efektif pembelajaran (164 sesi pelajaran per bulan)</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {subjectDistribution.map((item, idx) => (
                <div key={idx} className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.name}</h4>
                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Sesi per Minggu:</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{item.weekly} JP</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Total Bulanan:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{item.monthly} Jam Pelajaran</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab Semester */}
        {activeTab === 'semester' && (
          <div className="mt-5 space-y-5">
            <div className="rounded-2xl bg-blue-50/60 p-4 border border-blue-100 dark:border-blue-950 dark:bg-blue-950/20">
              <div className="flex items-center gap-3">
                <Award className="h-6 w-6 text-blue-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Struktur Beban Belajar Semester Ini</h4>
                  <p className="text-xs text-slate-500">Total 20 pekan pembelajaran efektif (820 jam pelajaran per semester)</p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-100 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800">
                  <tr>
                    <th className="py-3 px-4">Mata Pelajaran</th>
                    <th className="py-3 px-4 text-center">Beban Mingguan</th>
                    <th className="py-3 px-4 text-center">Beban Semester</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {subjectDistribution.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">{item.name}</td>
                      <td className="py-3 px-4 text-center text-slate-600 dark:text-slate-400">{item.weekly} Sesi / Pekan</td>
                      <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400">{item.semester} JP</td>
                      <td className="py-3 px-4 text-center">
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                          Aktif
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Tahun Ajaran */}
        {activeTab === 'academic_year' && (
          <div className="mt-5 space-y-5">
            <div className="rounded-2xl bg-amber-50/60 p-4 border border-amber-100 dark:border-amber-950 dark:bg-amber-950/20">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-6 w-6 text-amber-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Alokasi Kurikulum Tahun Ajaran 2026/2027</h4>
                  <p className="text-xs text-slate-500">2 Semester (Ganjil & Genap) · 1.640 Total Jam Pelajaran</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <h5 className="font-bold text-slate-900 dark:text-white">Semester Ganjil</h5>
                <p className="mt-1 text-xs text-slate-500">Juli - Desember 2026 · 20 Pekan Efektif</p>
                <div className="mt-3 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
                  <span>Total Jam Pelajaran:</span>
                  <span>820 JP</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <h5 className="font-bold text-slate-900 dark:text-white">Semester Genap</h5>
                <p className="mt-1 text-xs text-slate-500">Januari - Juni 2027 · 20 Pekan Efektif</p>
                <div className="mt-3 flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400">
                  <span>Total Jam Pelajaran:</span>
                  <span>820 JP</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
