import { useCallback, useEffect, useMemo, useState } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { motion } from 'framer-motion'
import {
  BookOpen,
  CalendarRange,
  CheckCircle2,
  Clock3,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { attendanceDashboardService } from '../../services/attendance/attendanceDashboardService'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import { MasterEmptyState, MasterErrorState } from '../../components/master-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'

const unwrap = (response) => response?.data?.data || response?.data || []
const formatDate = (value) =>
  value ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(value)) : '-'

const containerVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, staggerChildren: 0.08 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

function KpiTintedCard({ icon: Icon, label, value, subtext, tone = 'emerald' }) {
  const tones = {
    blue: {
      card: 'border-blue-200/80 bg-blue-50/50 hover:border-blue-300 dark:border-blue-900/40 dark:bg-blue-950/30',
      title: 'text-blue-700 dark:text-blue-400',
      icon: 'text-blue-600 dark:text-blue-400',
      val: 'text-blue-800 dark:text-blue-300',
      sub: 'text-blue-600/80 dark:text-blue-400/80',
    },
    emerald: {
      card: 'border-emerald-200/80 bg-emerald-50/50 hover:border-emerald-300 dark:border-emerald-900/40 dark:bg-emerald-950/30',
      title: 'text-emerald-700 dark:text-emerald-400',
      icon: 'text-emerald-600 dark:text-emerald-400',
      val: 'text-emerald-800 dark:text-emerald-300',
      sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    },
    amber: {
      card: 'border-amber-200/80 bg-amber-50/50 hover:border-amber-300 dark:border-amber-900/40 dark:bg-amber-950/30',
      title: 'text-amber-700 dark:text-amber-400',
      icon: 'text-amber-600 dark:text-amber-400',
      val: 'text-amber-800 dark:text-amber-300',
      sub: 'text-amber-600/80 dark:text-amber-400/80',
    },
    rose: {
      card: 'border-rose-200/80 bg-rose-50/50 hover:border-rose-300 dark:border-rose-900/40 dark:bg-rose-950/30',
      title: 'text-rose-700 dark:text-rose-400',
      icon: 'text-rose-600 dark:text-rose-400',
      val: 'text-rose-800 dark:text-rose-300',
      sub: 'text-rose-600/80 dark:text-rose-400/80',
    },
  }
  const t = tones[tone] || tones.emerald

  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`rounded-2xl border ${t.card} p-4 shadow-xs transition-all hover:shadow-md cursor-default group min-w-0`}
    >
      <div className="flex items-center justify-between gap-2 min-w-0">
        <p className={`text-xs font-bold ${t.title} truncate`}>{label}</p>
        <Icon className={`h-4 w-4 shrink-0 ${t.icon} opacity-80 group-hover:opacity-100 transition-opacity`} />
      </div>
      <p className={`mt-2 text-2xl font-black tracking-tight ${t.val}`}>{value ?? 0}</p>
      {subtext && (
        <p className={`mt-1 text-[11px] font-bold ${t.sub} flex items-center gap-0.5 truncate`}>
          {subtext}
        </p>
      )}
    </motion.div>
  )
}

function StatusBadge({ status }) {
  const normalized = String(status || '').toLowerCase()
  switch (normalized) {
    case 'hadir':
      return <Badge color="success" size="md">Hadir</Badge>
    case 'terlambat':
      return <Badge color="warning" size="md">Terlambat</Badge>
    case 'izin':
      return <Badge color="blue" size="md">Izin</Badge>
    case 'sakit':
      return <Badge color="purple" size="md">Sakit</Badge>
    case 'alpa':
      return <Badge color="error" size="md">Alpa</Badge>
    default:
      return <Badge color="gray" size="md">{status || 'Belum diverifikasi'}</Badge>
  }
}

export default function StudentAttendanceHistoryPage() {
  const now = new Date()
  const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  const [filters, setFilters] = useState({
    date_from: first,
    date_to: now.toISOString().slice(0, 10),
    status: '',
  })
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    setError('')
    attendanceDashboardService
      .getStudentAttendance({ ...filters, per_page: 100 })
      .then((r) => setRecords(unwrap(r)))
      .catch((e) => setError(e.response?.data?.message || 'Riwayat belum dapat dimuat.'))
      .finally(() => setLoading(false))
  }, [filters])

  useEffect(load, [load])

  const filtered = useMemo(
    () =>
      records.filter((item) => {
        const d = String(item.tanggal || item.created_at || '').slice(0, 10)
        const s = String(item.status_hadir || item.status || '').toLowerCase()
        return (
          (!filters.date_from || d >= filters.date_from) &&
          (!filters.date_to || d <= filters.date_to) &&
          (!filters.status || s === filters.status)
        )
      }),
    [records, filters]
  )

  const counts = useMemo(
    () =>
      Object.fromEntries(
        ['hadir', 'terlambat', 'izin', 'sakit', 'alpa'].map((s) => [
          s,
          filtered.filter((i) => String(i.status_hadir || i.status).toLowerCase() === s).length,
        ])
      ),
    [filtered]
  )

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
      {/* BREADCRUMB NAV */}
      <AppBreadcrumb
        items={[
          { label: 'Absensi', href: '/absensi/rekap-kehadiran' },
          { label: 'Kehadiran Saya', href: '/absensi/kehadiran-saya' },
          { label: 'Riwayat Kehadiran' },
        ]}
      />

      {/* MODERN HERO CARD HEADER (MATCHING PORTAL ORANG TUA / SISWA STYLE) */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
          <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <CalendarRange className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Arsip Presensi Siswa
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    {filtered.length} Record Terpilih
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Riwayat & Historis Kehadiran
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full">
                  Arsip lengkap riwayat presensi harian siswa berdasarkan rentang tanggal, status kehadiran (Hadir, Sakit, Izin, Alpa, Terlambat), dan mata pelajaran.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                type="button"
                variant="primary"
                appearance="fill"
                size="sm"
                onClick={load}
                disabled={loading}
                prefixIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
                className="!bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white font-bold shadow-md shadow-emerald-600/25 cursor-pointer"
              >
                Segarkan
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* HeroUI Card KPI Metric Grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        <KpiTintedCard
          icon={CalendarRange}
          label="Total Catatan"
          value={filtered.length}
          subtext="Sesuai Filter Aktif"
          tone="blue"
        />
        <KpiTintedCard
          icon={CheckCircle2}
          label="Hadir"
          value={counts.hadir}
          subtext="Kehadiran Tepat Waktu"
          tone="emerald"
        />
        <KpiTintedCard
          icon={Clock3}
          label="Terlambat"
          value={counts.terlambat}
          subtext="Tercatat Terlambat"
          tone="amber"
        />
        <KpiTintedCard
          icon={ShieldAlert}
          label="Tidak Hadir"
          value={counts.izin + counts.sakit + counts.alpa}
          subtext="Izin, Sakit, & Alpa"
          tone="rose"
        />
      </motion.div>

      {/* Filter Section */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-4 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]"
        aria-label="Filter riwayat kehadiran"
      >
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
            <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Filter Data:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-slate-500" htmlFor="attendance-from">
                Dari:
              </label>
              <DatePicker
                id="attendance-from"
                value={filters.date_from}
                onChange={(e) => setFilters({ ...filters, date_from: e.target.value })}
                className="w-36"
                inputClassName="h-10 text-xs font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <label className="text-xs font-semibold text-slate-500" htmlFor="attendance-to">
                Sampai:
              </label>
              <DatePicker
                id="attendance-to"
                value={filters.date_to}
                onChange={(e) => setFilters({ ...filters, date_to: e.target.value })}
                className="w-36"
                inputClassName="h-10 text-xs font-medium"
              />
            </div>

            <CustomSelect
              aria-label="Filter status kehadiran"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="h-10 rounded-xl border border-emerald-500/30 bg-white px-3 text-xs font-medium text-slate-900 outline-none transition focus:border-emerald-500 dark:border-emerald-600/40 dark:bg-slate-900 dark:text-white"
            >
              <option value="">Semua Status</option>
              {['hadir', 'terlambat', 'izin', 'sakit', 'alpa'].map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </CustomSelect>

            <Button
              variant="ghost"
              appearance="outline"
              size="sm"
              onClick={load}
              disabled={loading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Muat Ulang</span>
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Datatable / History List */}
      <motion.section
        variants={itemVariants}
        className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-500/20 px-5 py-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Daftar Riwayat Kehadiran</h2>
            <p className="mt-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              Data presensi sesuai periode dan status yang dipilih.
            </p>
          </div>
          <Badge color="emerald" size="md">
            {filtered.length} Catatan
          </Badge>
        </div>

        {error ? (
          <div className="p-6">
            <MasterErrorState description={error} onRetry={load} />
          </div>
        ) : loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800/60" />
            ))}
          </div>
        ) : filtered.length ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filtered.map((item) => {
              const subjectName =
                item.jadwal_pelajaran?.subject?.name || item.session?.subject?.name || 'Mata Pelajaran'
              const status = item.status_hadir || item.status
              const dateStr = formatDate(item.tanggal || item.created_at)

              return (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5 transition hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                      <BookOpen className="size-5" />
                    </div>
                    <div className="min-w-0">
                      <b className="text-sm font-bold text-slate-900 dark:text-white truncate block">
                        {subjectName}
                      </b>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {dateStr} · {item.arrival_time || item.jam_masuk || 'Presensi Kelas'}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <StatusBadge status={status} />
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-6">
            <MasterEmptyState
              title="Riwayat Tidak Ditemukan"
              description="Ubah periode atau status filter untuk melihat data presensi lainnya."
            />
          </div>
        )}
      </motion.section>
    </motion.div>
  )
}

