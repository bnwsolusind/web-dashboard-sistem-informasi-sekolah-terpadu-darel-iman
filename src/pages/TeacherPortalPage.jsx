import React, { useEffect, useState } from 'react'
import {
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  FileText,
  HeartHandshake,
  Layers,
  MessageSquare,
  Sparkles,
  UserCheck,
  Users
} from 'lucide-react'
import {
  Link
} from 'react-router-dom'
import api from '../services/api'

const kpiToneStyles = {
  emerald: {
    card: '!bg-emerald-100/90 hover:!bg-emerald-200/70 dark:!bg-emerald-950/50 dark:hover:!bg-emerald-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    icon: '!bg-emerald-600 !text-white shadow-sm dark:!bg-emerald-600 dark:!text-white',
    label: 'text-emerald-800 dark:text-emerald-300',
    val: 'text-emerald-800 dark:text-emerald-200',
    hint: 'text-emerald-700/90 dark:text-emerald-300/80',
  },
  blue: {
    card: '!bg-sky-100/90 hover:!bg-sky-200/70 dark:!bg-sky-950/50 dark:hover:!bg-sky-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    icon: 'bg-emerald-600 text-white shadow-sm dark:!bg-sky-600 dark:!text-white',
    label: 'text-sky-800 dark:text-sky-300',
    val: 'text-sky-800 dark:text-sky-200',
    hint: 'text-sky-700/90 dark:text-sky-300/80',
  },
  amber: {
    card: '!bg-amber-100/90 hover:!bg-amber-200/70 dark:!bg-amber-950/50 dark:hover:!bg-amber-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    icon: '!bg-amber-600 !text-white shadow-sm dark:!bg-amber-600 dark:!text-white',
    label: 'text-amber-800 dark:text-amber-300',
    val: 'text-amber-800 dark:text-amber-200',
    hint: 'text-amber-700/90 dark:text-amber-300/80',
  },
  violet: {
    card: '!bg-purple-100/90 hover:!bg-purple-200/70 dark:!bg-purple-950/50 dark:hover:!bg-purple-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    icon: '!bg-purple-600 !text-white shadow-sm dark:!bg-purple-600 dark:!text-white',
    label: 'text-purple-800 dark:text-purple-300',
    val: 'text-purple-800 dark:text-purple-200',
    hint: 'text-purple-700/90 dark:text-purple-300/80',
  },
  rose: {
    card: '!bg-rose-100/90 hover:!bg-rose-200/70 dark:!bg-rose-950/50 dark:hover:!bg-rose-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700/80',
    icon: '!bg-rose-600 !text-white shadow-sm dark:!bg-rose-600 dark:!text-white',
    label: 'text-rose-800 dark:text-rose-300',
    val: 'text-rose-800 dark:text-rose-200',
    hint: 'text-rose-700/90 dark:text-rose-300/80',
  },
  slate: {
    card: '!bg-slate-100/90 hover:!bg-slate-200/70 dark:!bg-slate-900/60 dark:hover:!bg-slate-900/80 border-emerald-200/80 dark:border-emerald-800/60 hover:border-slate-400 dark:hover:border-emerald-700/80/50',
    icon: '!bg-slate-600 !text-white shadow-sm dark:!bg-slate-600 dark:!text-white',
    label: 'text-slate-800 dark:text-slate-300',
    val: 'text-slate-800 dark:text-slate-200',
    hint: 'text-slate-600 dark:text-slate-400',
  },
}

const quickActionStyles = {
 emerald: 'bg-emerald-50/90 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/50',
 blue: 'bg-sky-50/90 text-sky-700 hover:bg-sky-100 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/50',
 violet: 'bg-violet-50/90 text-violet-700 hover:bg-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:hover:bg-violet-900/50',
 amber: 'bg-amber-50/90 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:hover:bg-amber-900/50',
 teal: 'bg-teal-50/90 text-teal-700 hover:bg-teal-100 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/50',
 rose: 'bg-rose-50/90 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50'
}

export default function TeacherPortalPage() {
 const [data, setData] = useState(null)
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)

 useEffect(() => {
 fetchDashboard()
 }, [])

 const fetchDashboard = async () => {
 setLoading(true)
 setError(null)
 try {
 const res = await api.get('/teacher/dashboard')
 if (res?.data?.success) {
 setData(res.data.data)
 } else {
 setError('Gagal memuat data portal guru')
 }
 } catch (err) {
 console.error(err)
 setError('Terjadi kesalahan saat menghubungkan ke server.')
 } finally {
 setLoading(false)
 }
 }

 if (loading) {
 return (
 <div className="p-6 space-y-6 animate-pulse">
 <div className="h-28 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl" />
 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
 {[...Array(6)].map((_, i) => (
 <div key={i} className="h-24 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl" />
 ))}
 </div>
 <div className="h-64 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl" />
 </div>
 )
 }

 if (error) {
 return (
 <div className="p-6">
 <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 p-6 rounded-xl text-center">
 <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
 <button
 onClick={fetchDashboard}
 className="mt-4 px-4 py-2 bg-[#059669] text-white rounded-xl text-sm font-semibold hover:bg-[#1E8E5A] transition"
 >
 Coba Lagi
 </button>
 </div>
 </div>
 )
 }

 const { teacher, academic_context, kpi, schedules_today, announcements } = data || {}

 const kpiItems = [
 {
 label: 'Jadwal Hari Ini',
 value: kpi?.schedules_today_count || 0,
 hint: 'Sesi Mengajar',
 icon: Clock,
 tone: 'emerald'
 },
 {
 label: 'Total Siswa',
 value: kpi?.total_students || 0,
 hint: `${kpi?.total_classes || 0} Rombel`,
 icon: Users,
 tone: 'blue'
 },
 {
 label: 'Belum Dinilai',
 value: kpi?.pending_grading_count || 0,
 hint: 'Pengumpulan Tugas',
 icon: FileText,
 tone: 'amber'
 },
 {
 label: 'Setoran Tahfizh',
 value: kpi?.tahfizh_today_count || 0,
 hint: 'Setoran Hari Ini',
 icon: BookOpen,
 tone: 'violet'
 },
 {
 label: 'Mutabaah Draft',
 value: kpi?.unverified_mutabaah_count || 0,
 hint: 'Perlu Verifikasi',
 icon: HeartHandshake,
 tone: 'rose'
 },
 {
 label: 'Notifikasi',
 value: kpi?.unread_notifications || 0,
 hint: 'Pesan Belum Dibaca',
 icon: MessageSquare,
 tone: 'slate'
 }
 ]

 const quickActions = [
 { to: '/portal-guru/workspace?tab=presensi', label: 'Input Presensi', icon: UserCheck, tone: 'emerald' },
 { to: '/portal-guru/workspace?tab=materi', label: 'Buat Materi', icon: BookOpen, tone: 'blue' },
 { to: '/portal-guru/workspace?tab=penugasan', label: 'Buat Tugas', icon: FileText, tone: 'violet' },
 { to: '/portal-guru/workspace?tab=penilaian', label: 'Input Nilai', icon: Layers, tone: 'amber' },
 { to: '/portal-guru/workspace?tab=tahfizh', label: 'Input Tahfizh', icon: CheckCircle, tone: 'teal' },
 { to: '/portal-guru/workspace?tab=catatan', label: 'Catatan Siswa', icon: MessageSquare, tone: 'rose' }
 ]

 return (
 <div className="min-h-screen bg-[#F2FBF7] px-4 py-5 text-slate-800 dark:bg-[#0F172A] dark:text-slate-100 sm:px-6 lg:px-8">
 <div className="mx-auto flex max-w-7xl flex-col gap-5">
        <section className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">
          <div className="relative z-10 flex flex-col gap-3">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 items-start gap-3.5 sm:gap-4 min-w-0">
              <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
                <BookOpen className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
                    <Sparkles className="size-3.5 shrink-0 text-white" />
                    <span>{teacher?.education_unit || 'Portal Guru Terpadu'}</span>
                  </span>
                </div>
                <h1 className="mt-1 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Assalamu&apos;alaikum, {teacher?.name || 'Ustadz/Ustadzah'}
                </h1>
              </div>
            </div>

            <Link
              to="/portal-guru/workspace"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition shrink-0"
            >
              <BookOpen className="size-4 text-white" />
              Workspace Mengajar
            </Link>
          </div>

          {/* Row 2: Deskripsi Full Width */}
          <div className="w-full pt-2 border-t border-emerald-500/20 dark:border-emerald-500/30">
            <p className="w-full text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
              Selamat mengajar hari ini. {academic_context?.date} | Tahun Ajaran {academic_context?.academic_year} ({academic_context?.semester})
            </p>
          </div>
        </div>
        </section>

 <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
 {kpiItems.map(({ label, value, hint, icon: Icon, tone }) => {
          const st = kpiToneStyles[tone] || kpiToneStyles.emerald
          return (
            <div key={label} className={`rounded-xl border p-4 transition-all duration-200 ${st.card}`}>
              <div className={`mb-3 inline-flex size-10 items-center justify-center rounded-xl ${st.icon}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className={`text-xs font-semibold ${st.label}`}>{label}</p>
              <p className={`mt-1 text-2xl font-bold ${st.val}`}>{value}</p>
              <p className={`mt-0.5 text-xs ${st.hint}`}>{hint}</p>
            </div>
          )
        })}
 </section>

 <section className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] sm:p-5">
 <div className="mb-4 flex items-center justify-between gap-3">
 <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
 Quick Actions Guru
 </h2>
 <span className="text-xs text-slate-400">Akses utama untuk hari ini</span>
 </div>
 <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
 {quickActions.map(({ to, label, icon: Icon, tone }) => (
 <Link
 key={label}
 to={to}
 className={`flex items-center justify-between rounded-xl border border-emerald-200/80 px-4 py-3 text-sm font-semibold shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-700/80 ${quickActionStyles[tone]}`}
 >
 <span className="flex items-center gap-2">
 <Icon className="h-4 w-4" />
 {label}
 </span>
 <span className="text-base">→</span>
 </Link>
 ))}
 </div>
 </section>

 <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_0.9fr]">
 <div className="rounded-xl border border-emerald-200/80 bg-white p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
 <div>
 <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Jadwal Mengajar Hari Ini</h2>
 <p className="text-sm text-slate-500 dark:text-slate-400">Ringkasan agenda mengajar yang siap dikerjakan.</p>
 </div>
 <Link to="/portal-guru/workspace?tab=jadwal" className="text-sm font-semibold text-[#059669] hover:underline">
 Lihat Semua Jadwal →
 </Link>
 </div>

 {(!schedules_today || schedules_today.length === 0) ? (
 <div className="rounded-xl border border-dashed border-emerald-200/80 px-6 py-10 text-center dark:border-emerald-700/80">
 <Calendar className="mx-auto mb-3 h-9 w-10 text-slate-300" />
 <p className="font-semibold text-slate-600 dark:text-slate-300">Tidak ada jadwal mengajar hari ini.</p>
 <p className="mt-1 text-sm text-slate-400">Manfaatkan waktu untuk merancang materi dan merekap nilai.</p>
 </div>
 ) : (
 <div className="space-y-3">
 {schedules_today.map((sch) => (
 <div
 key={sch.id}
 className="flex flex-col gap-3 rounded-xl border border-emerald-200/80 bg-slate-50/70 p-4 transition hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-slate-900/50 dark:hover:border-emerald-700/80 dark:hover:bg-emerald-950/20 md:flex-row md:items-center md:justify-between"
 >
 <div className="flex items-start gap-3">
 <div className="min-w-[96px] rounded-[12px] bg-[#059669] px-3 py-2 text-center text-xs font-bold text-white">
 {sch.start_time || '07:30'} - {sch.end_time || '09:00'}
 </div>
 <div>
 <h3 className="font-semibold text-slate-900 dark:text-white">{sch.subject?.name || 'Mata Pelajaran'}</h3>
 <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
 Kelas <span className="font-medium text-slate-700 dark:text-slate-300">{sch.kelas?.name || 'Rombel'}</span> • Ruangan {sch.room_name || 'R. Kelas'}
 </p>
 </div>
 </div>

 <Link
 to={`/portal-guru/workspace?tab=presensi&schedule_id=${sch.id}`}
 className="inline-flex items-center justify-center rounded-[12px] bg-[#059669] px-3 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-[#1E8E5A]"
 >
 Presensi Siswa
 </Link>
 </div>
 ))}
 </div>
 )}
 </div>

 <div className="rounded-xl border border-emerald-200/80 bg-white p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="mb-4 flex items-center gap-2">
 <Sparkles className="h-5 w-5 text-amber-500" />
 <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Pengumuman Sekolah</h2>
 </div>

 {(!announcements || announcements.length === 0) ? (
 <div className="rounded-xl border border-dashed border-emerald-200/80 px-4 py-8 text-center text-sm text-slate-400 dark:border-emerald-700/80">
 Belum ada pengumuman terbaru.
 </div>
 ) : (
 <div className="space-y-3">
 {announcements.map((anc) => (
 <div key={anc.id} className="rounded-[14px] border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/60 p-3 dark:border-emerald-800/60 dark:bg-amber-950/20">
 <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300">{anc.title || anc.judul}</h4>
 <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{anc.content || anc.isi}</p>
 </div>
 ))}
 </div>
 )}
 </div>
 </section>
 </div>
 </div>
 )
}
