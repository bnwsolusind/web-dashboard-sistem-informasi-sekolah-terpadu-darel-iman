import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  ChevronDown,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  GraduationCap,
  Printer,
  RefreshCw,
  Search,
  UserCheck,
  UserMinus,
  Users,
  UserX,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import {
  ArrowBothDirectionHorizontal2,
  Download1,
  Upload1,
} from '@tailgrids/icons'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { exportCsv } from '../components/reports/ReportKit'
import { studentService } from '../services/studentService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { PersonIdentityCell } from '../components/ui/PersonIdentityCell'
import ActionDropdown from '../components/app/ActionDropdown'
import {
  MasterStatsGrid,
  MasterStatCard,
  MasterStatusBadge,
  MasterErrorState,
  MasterEmptyState,
  PrintOptionModal,
  MasterFilterSelect,
  SquircleActionButton,
} from '../components/master-data'
import { printCleanTable, downloadPdfTable, printWeeklyStudentEvaluation } from '../utils/printHelper'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/tailgrids/core/card'
import { Button } from '@/components/tailgrids/core/button'
import { Badge } from '@/components/tailgrids/core/badge'
import {
  TableRoot,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/tailgrids/core/table'
import { Pagination } from '@/components/tailgrids/core/pagination'
import { Input } from '@/components/tailgrids/core/input'
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/tailgrids/core/hover-card'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/tailgrids/core/dialog'
import { Backdrop } from '@/components/tailgrids/core/overlay'

const angka = (nilai) => new Intl.NumberFormat('id-ID').format(Number(nilai || 0))
const warnaPie = ['#059669', '#2563eb', '#d97706', '#7c3aed', '#db2777', '#0891b2']

export default function LaporanSiswaPage() {
  const [memuat, setMemuat] = useState(true)
  const [gagal, setGagal] = useState('')
  const [dashboard, setDashboard] = useState(null)
  const [pencarian, setPencarian] = useState('')
  const [status, setStatus] = useState('semua')
  const [unit, setUnit] = useState('semua')
  const [kelas, setKelas] = useState('semua')
  const [period, setPeriod] = useState('semua')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [jenisKelamin, setJenisKelamin] = useState('semua')
  const [halaman, setHalaman] = useState(1)
  const [perHalaman, setPerHalaman] = useState(10)
  const [sortKey, setSortKey] = useState('nama')
  const [sortOrder, setSortOrder] = useState('asc')
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [selectedStudentModal, setSelectedStudentModal] = useState(null)
  const [printTargetStudent, setPrintTargetStudent] = useState(null)

  const getPeriodDateRange = (periodKey) => {
    const now = new Date()
    const iso = (d) => d.toISOString().slice(0, 10)
    const todayStr = iso(now)

    if (periodKey === 'hari') {
      return { from: todayStr, to: todayStr }
    }
    if (periodKey === 'minggu') {
      const past = new Date(now)
      past.setDate(now.getDate() - 6)
      return { from: iso(past), to: todayStr }
    }
    if (periodKey === 'bulan') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: iso(firstDay), to: todayStr }
    }
    if (periodKey === 'semester') {
      const past = new Date(now.getFullYear(), now.getMonth() - 5, 1)
      return { from: iso(past), to: todayStr }
    }
    if (periodKey === 'tahun') {
      const firstDay = new Date(now.getFullYear(), 0, 1)
      return { from: iso(firstDay), to: todayStr }
    }
    return { from: '', to: '' }
  }

  const muatData = async () => {
    try {
      setMemuat(true)
      setGagal('')
      const res = await studentService.getDashboard()
      setDashboard(res)
    } catch (error) {
      setGagal(error?.response?.data?.message || 'Gagal memuat laporan data siswa.')
    } finally {
      setMemuat(false)
    }
  }

  useEffect(() => {
    muatData()
  }, [])

  const siswa = useMemo(() => dashboard?.daftar_siswa || [], [dashboard])
  const statistik = dashboard?.statistik || {}
  const laporan = dashboard?.laporan_siswa || {}
  const total = Number(statistik.total_siswa || 0)
  const aktif = Number(statistik.siswa_aktif ?? siswa.filter((item) => item.aktif).length)
  const nonaktif = Number(statistik.siswa_nonaktif ?? Math.max(total - aktif, 0))
  const alumni = Number(statistik.alumni || 0)
  const mutasi = Number(statistik.mutasi_keluar || 0)

  const daftarKelas = useMemo(
    () => [...new Set(siswa.map((item) => item.kelas).filter(Boolean))],
    [siswa]
  )
  const daftarUnit = useMemo(
    () => [...new Set(siswa.map((item) => item.unit).filter((item) => item && item !== '-'))],
    [siswa]
  )

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const hasilFilter = useMemo(() => {
    const filtered = siswa.filter((item) => {
      const cocokCari = `${item.nis || ''} ${item.nama || ''} ${item.kelas || ''} ${item.unit || ''}`
        .toLowerCase()
        .includes(pencarian.toLowerCase())

      // Gender Filter (L / P / semua)
      const jkVal = String(item.jenis_kelamin || item.jk || '').toUpperCase()
      const cocokJK =
        jenisKelamin === 'semua' ||
        (jenisKelamin === 'L' && (jkVal.startsWith('L') || jkVal.includes('LAKI'))) ||
        (jenisKelamin === 'P' && (jkVal.startsWith('P') || jkVal.includes('PEREMPUAN')))

      // Status Filter (Aktif, Alumni, Mutasi Keluar, Non-aktif)
      const statusRaw = String(item.status || (item.aktif ? 'aktif' : 'nonaktif')).toLowerCase()
      let cocokStatus = true

      if (status === 'aktif') {
        cocokStatus = item.aktif === true && !statusRaw.includes('alumni') && !statusRaw.includes('mutasi')
      } else if (status === 'alumni') {
        cocokStatus = statusRaw.includes('alumni') || item.is_alumni === true
      } else if (status === 'mutasi_keluar') {
        cocokStatus = statusRaw.includes('mutasi') || statusRaw.includes('keluar')
      } else if (status === 'nonaktif') {
        cocokStatus = item.aktif === false || statusRaw.includes('nonaktif') || statusRaw.includes('non-aktif')
      }

      // Filter Periode Tanggal
      const tglItem = item.tanggal_masuk || item.tgl_masuk || item.created_at?.slice(0, 10) || item.date || item.tanggal
      let cocokPeriode = true
      if (dateFrom && tglItem) {
        cocokPeriode = tglItem >= dateFrom
      }
      if (dateTo && tglItem && cocokPeriode) {
        cocokPeriode = tglItem <= dateTo
      }

      return (
        cocokCari &&
        cocokJK &&
        cocokStatus &&
        cocokPeriode &&
        (unit === 'semua' || item.unit === unit) &&
        (kelas === 'semua' || item.kelas === kelas)
      )
    })

    if (sortKey) {
      filtered.sort((a, b) => {
        let valA = a[sortKey] ?? ''
        let valB = b[sortKey] ?? ''
        if (typeof valA === 'string') valA = valA.toLowerCase()
        if (typeof valB === 'string') valB = valB.toLowerCase()
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1
        return 0
      })
    }
    return filtered
  }, [siswa, pencarian, jenisKelamin, status, unit, kelas, dateFrom, dateTo, sortKey, sortOrder])

  const totalHalaman = Math.max(Math.ceil(hasilFilter.length / perHalaman), 1)
  const baris = hasilFilter.slice((halaman - 1) * perHalaman, halaman * perHalaman)

  useEffect(() => {
    setHalaman(1)
  }, [pencarian, status, unit, kelas, jenisKelamin, period, dateFrom, dateTo, perHalaman])

  const dataKelas = useMemo(
    () =>
      (dashboard?.kelas_rombel || [])
        .map((item) => ({
          nama: item.level || item.nama,
          jumlah: Number(item.jumlah_siswa || 0),
        }))
        .reduce((acc, item) => {
          const ada = acc.find((x) => x.nama === item.nama)
          if (ada) ada.jumlah += item.jumlah
          else acc.push(item)
          return acc
        }, []),
    [dashboard]
  )

  const dataUnit = useMemo(() => {
    const map = new Map()
    siswa.forEach((item) => {
      const nama = item.unit || item.kelas || 'Belum ditentukan'
      map.set(nama, (map.get(nama) || 0) + 1)
    })
    return [...map].map(([nama, jumlah]) => ({ nama, jumlah }))
  }, [siswa])

  const gender = dashboard?.komposisi_gender || {
    laki_laki: siswa.filter((item) => ['L', 'Laki-laki'].includes(item.jenis_kelamin)).length,
    perempuan: siswa.filter((item) => ['P', 'Perempuan'].includes(item.jenis_kelamin)).length,
  }
  const totalGender = Number(gender.laki_laki || 0) + Number(gender.perempuan || 0)
  const tren = laporan.grafik_tahunan || []

  const kolomCsv = [
    { key: 'nis', label: 'NIS' },
    { key: 'nama', label: 'Nama Siswa' },
    { key: 'unit', label: 'Unit Pendidikan' },
    { key: 'kelas', label: 'Kelas/Rombel' },
    { key: 'jenis_kelamin', label: 'Jenis Kelamin' },
    { key: 'aktif', label: 'Status', export: (row) => (row.aktif ? 'Aktif' : 'Nonaktif') },
  ]

  const getFilterRingkasan = () => {
    const parts = []
    if (unit !== 'semua') parts.push(`Unit: ${unit}`)
    if (kelas !== 'semua') parts.push(`Kelas/Rombel: ${kelas}`)
    if (jenisKelamin !== 'semua') parts.push(`JK: ${jenisKelamin === 'L' ? 'Laki-laki (L)' : 'Perempuan (P)'}`)
    if (status !== 'semua') {
      const mapStatus = {
        aktif: 'Siswa Aktif',
        alumni: 'Siswa Alumni',
        mutasi_keluar: 'Mutasi Keluar',
        nonaktif: 'Siswa Non-aktif',
      }
      parts.push(`Status: ${mapStatus[status] || status}`)
    }
    if (period !== 'semua') parts.push(`Periode: ${period}`)
    return parts.length > 0 ? parts.join(' | ') : 'Semua Data Siswa'
  }

  const handlePrintClean = () => {
    const listToPrint = printTargetStudent ? [printTargetStudent] : hasilFilter
    const title = printTargetStudent
      ? `Laporan Detail Siswa: ${printTargetStudent.nama || ''}`
      : 'Rekap Laporan Data Siswa Terpadu'
    const subtitle = printTargetStudent
      ? `NIS: ${printTargetStudent.nis || '-'} | Unit: ${printTargetStudent.unit || '-'} | Kelas: ${printTargetStudent.kelas || '-'}`
      : `Filter Terpasang: [ ${getFilterRingkasan()} ] — Total: ${listToPrint.length} Siswa`

    printCleanTable({
      title,
      subtitle,
      headers: ['NO', 'NIS', 'NAMA SISWA', 'UNIT PENDIDIKAN', 'KELAS / ROMBEL', 'JK', 'STATUS'],
      rows: listToPrint.map((item, index) => {
        const itemStatus = item.status || (item.aktif ? 'Aktif' : 'Non-aktif')
        return [
          index + 1,
          item.nis || '-',
          item.nama || '-',
          item.unit || '-',
          item.kelas || '-',
          item.jenis_kelamin || item.jk || '-',
          itemStatus,
        ]
      }),
    })
  }

  const handleDownloadPdf = () => {
    const listToPrint = printTargetStudent ? [printTargetStudent] : hasilFilter
    const title = printTargetStudent
      ? `Laporan Detail Siswa: ${printTargetStudent.nama || ''}`
      : 'Rekap Laporan Data Siswa Terpadu'
    const filename = printTargetStudent
      ? `laporan-siswa-${printTargetStudent.nis || printTargetStudent.id || 'detail'}.pdf`
      : `rekap-laporan-siswa-${new Date().toISOString().slice(0, 10)}.pdf`

    downloadPdfTable({
      title,
      filename,
      headers: ['NO', 'NIS', 'NAMA SISWA', 'UNIT PENDIDIKAN', 'KELAS / ROMBEL', 'JK', 'STATUS'],
      rows: listToPrint.map((item, index) => {
        const itemStatus = item.status || (item.aktif ? 'Aktif' : 'Non-aktif')
        return [
          index + 1,
          item.nis || '-',
          item.nama || '-',
          item.unit || '-',
          item.kelas || '-',
          item.jenis_kelamin || item.jk || '-',
          itemStatus,
        ]
      }),
    })
  }

  const handlePrintWeekly = (st) => {
    const eduUnit = st?.raw?.education_unit || st?.education_unit || (typeof st?.unit === 'object' ? st?.unit : null)
    printWeeklyStudentEvaluation({
      student: {
        ...st,
        name: st?.nama || st?.full_name || st?.name || 'Shezakia Mufidah Alfirdausi',
        nis: st?.nis || st?.nisn || '-',
        className: st?.kelas || '10 Madinah 1',
        unitName: eduUnit?.name || st?.unit || 'Sekolah Menengah Atas Islam Terpadu',
        education_unit: eduUnit,
      },
      period: {
        title: 'Senin, 10 Agustus 2026 s.d. Jumat, 14 Agustus 2026',
        academicYear: '2026/2027',
      },
      homeroomTeacher: {
        name: 'Ustadzah Elsa Putri Utami',
      },
      guruWali: {
        name: 'Ilma Emilia Widyastuti',
      },
      schoolCity: eduUnit?.metadata?.city || 'Padang',
    })
  }

  const resetFilter = () => {
    setUnit('semua')
    setKelas('semua')
    setJenisKelamin('semua')
    setStatus('semua')
    setPeriod('semua')
    setDateFrom('')
    setDateTo('')
    setPencarian('')
    setSortKey('nama')
    setSortOrder('asc')
    setHalaman(1)
  }

  if (memuat) {
    return (
      <PageContainer maxW="7xl">
        <MasterEmptyState loading message="Memuat laporan data siswa..." />
      </PageContainer>
    )
  }

  if (gagal) {
    return (
      <PageContainer maxW="7xl">
        <MasterErrorState message={gagal} onRetry={muatData} />
      </PageContainer>
    )
  }

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* ── Breadcrumb ── */}
      <AppBreadcrumb
        items={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Rekap Data' },
          { label: 'Siswa' },
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
                <Users className="size-6 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                    <Sparkles className="size-3 text-amber-300 animate-pulse" />
                    Laporan Kesiswaan & Kelulusan
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    {total} Total Siswa Terdaftar
                  </span>
                </div>
                <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Laporan Rekap Data Siswa & Kelulusan
                </h1>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                  Pusat rekapitulasi data kesiswaan terpadu: statistik status aktif/alumni/mutasi, breakdown per jenjang & unit pendidikan.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 z-10">
              <Button
                type="button"
                variant="primary"
                appearance="fill"
                size="sm"
                onClick={muatData}
                disabled={memuat}
                prefixIcon={<RefreshCw className={`h-4 w-4 ${memuat ? 'animate-spin' : ''}`} />}
                className="!bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white font-bold shadow-md shadow-emerald-600/25 cursor-pointer"
              >
                Segarkan Data
              </Button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Print Modal Integration ─────────────────────────────────────────── */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false)
          setPrintTargetStudent(null)
        }}
        title={printTargetStudent ? `Cetak Laporan: ${printTargetStudent.nama}` : 'Laporan Data Siswa'}
        onPrint={handlePrintClean}
        onDownloadPdf={handleDownloadPdf}
      />

      {/* ── Detail Student Dialog Modal ────────────────────────────────────── */}
      {selectedStudentModal && (
        <Backdrop
          isOpen={Boolean(selectedStudentModal)}
          onOpenChange={(open) => !open && setSelectedStudentModal(null)}
        >
          <Dialog className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl dark:bg-[#1B2433]">
            <DialogHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-emerald-600" />
                  <span>Detail Data Siswa</span>
                </DialogTitle>
                <MasterStatusBadge status={selectedStudentModal.aktif ? 'aktif' : 'nonaktif'} />
              </div>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Informasi profil lengkap dan status keaktifan siswa.
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-4 py-4 text-xs">
              {/* Profile Summary Card */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="size-14 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold flex items-center justify-center text-sm shrink-0 overflow-hidden shadow-2xs">
                  {selectedStudentModal.foto_url ? (
                    <img
                      src={selectedStudentModal.foto_url}
                      alt={selectedStudentModal.nama}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    (selectedStudentModal.nama || 'S').slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                    {selectedStudentModal.nama}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    NIS: {selectedStudentModal.nis || '-'}
                  </p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-0.5">
                    {selectedStudentModal.unit || '-'} — {selectedStudentModal.kelas || '-'}
                  </p>
                </div>
              </div>

              {/* Detail Items Grid */}
              <div className="grid grid-cols-2 gap-3.5 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/40">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    NIS
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-xs">
                    {selectedStudentModal.nis || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Nama Siswa
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    {selectedStudentModal.nama || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Unit Pendidikan
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    {selectedStudentModal.unit || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Kelas / Rombel
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    {selectedStudentModal.kelas || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Jenis Kelamin
                  </span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                    {selectedStudentModal.jenis_kelamin || '-'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">
                    Status Siswa
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                    {selectedStudentModal.aktif ? 'Aktif' : 'Non-aktif'}
                  </span>
                </div>
              </div>
            </DialogBody>

            <DialogFooter className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-amber-100/90 text-amber-600 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 font-semibold"
                  onClick={() =>
                    exportCsv(
                      `siswa-${selectedStudentModal.nis || selectedStudentModal.id}.csv`,
                      kolomCsv,
                      [selectedStudentModal]
                    )
                  }
                >
                  <FileSpreadsheet className="h-4 w-4 mr-1.5" />
                  Export Excel
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-indigo-100/90 text-indigo-600 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold"
                  onClick={() => {
                    setPrintTargetStudent(selectedStudentModal)
                    setIsPrintModalOpen(true)
                  }}
                >
                  <Printer className="h-4 w-4 mr-1.5" />
                  Cetak Laporan
                </Button>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelectedStudentModal(null)}>
                Tutup
              </Button>
            </DialogFooter>
          </Dialog>
        </Backdrop>
      )}

      {/* ── KPI Stat Cards Grid ─────────────────────────────────────────────── */}
      <MasterStatsGrid columns={5}>
        <MasterStatCard
          icon={Users}
          label="Total Siswa"
          value={angka(total)}
          subtitle="Total terdaftar"
          variant="success"
          delay={0}
        />
        <MasterStatCard
          icon={GraduationCap}
          label="Siswa Aktif"
          value={angka(aktif)}
          subtitle={`${total ? ((aktif / total) * 100).toFixed(1) : 0}% dari total`}
          variant="info"
          delay={50}
        />
        <MasterStatCard
          icon={UserCheck}
          label="Siswa Alumni"
          value={angka(alumni)}
          subtitle={`${total ? ((alumni / total) * 100).toFixed(1) : 0}% dari total`}
          variant="warning"
          delay={100}
        />
        <MasterStatCard
          icon={UserMinus}
          label="Mutasi Keluar"
          value={angka(mutasi)}
          subtitle={`${total ? ((mutasi / total) * 100).toFixed(1) : 0}% dari total`}
          variant="neutral"
          delay={150}
        />
        <MasterStatCard
          icon={UserX}
          label="Siswa Non-Aktif"
          value={angka(nonaktif)}
          subtitle={`${total ? ((nonaktif / total) * 100).toFixed(1) : 0}% dari total`}
          variant="danger"
          delay={200}
        />
      </MasterStatsGrid>

      {/* ── 3-Column Equal Grid: Filter Laporan, Grafik Siswa per Jenjang, & Distribusi Unit (Style persis LaporanAbsensiPage) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {/* Col 1: Panel Filter Laporan (Sama seperti LaporanAbsensiPage) */}
        <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Filter Laporan Siswa</h2>
              <button
                type="button"
                onClick={resetFilter}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                Reset Filter
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Unit Pendidikan
                </label>
                <select
                  value={unit}
                  onChange={(e) => {
                    setUnit(e.target.value)
                    setHalaman(1)
                  }}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="semua">Semua Unit Pendidikan</option>
                  {daftarUnit.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Kelas / Rombel
                </label>
                <select
                  value={kelas}
                  onChange={(e) => {
                    setKelas(e.target.value)
                    setHalaman(1)
                  }}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="semua">Semua Kelas & Rombel</option>
                  {daftarKelas.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Jenis Kelamin
                </label>
                <select
                  value={jenisKelamin}
                  onChange={(e) => {
                    setJenisKelamin(e.target.value)
                    setHalaman(1)
                  }}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="semua">Semua Gender</option>
                  <option value="L">Laki-laki (L)</option>
                  <option value="P">Perempuan (P)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Status Siswa
                </label>
                <select
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value)
                    setHalaman(1)
                  }}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="semua">Semua Status</option>
                  <option value="aktif">Siswa Aktif</option>
                  <option value="alumni">Siswa Alumni</option>
                  <option value="mutasi_keluar">Mutasi Keluar</option>
                  <option value="nonaktif">Siswa Non-aktif</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Periode Waktu
                </label>
                <select
                  value={period}
                  onChange={(e) => {
                    const nextPeriod = e.target.value
                    setPeriod(nextPeriod)
                    if (nextPeriod !== 'custom' && nextPeriod !== 'semua') {
                      const { from, to } = getPeriodDateRange(nextPeriod)
                      setDateFrom(from)
                      setDateTo(to)
                    } else if (nextPeriod === 'semua') {
                      setDateFrom('')
                      setDateTo('')
                    }
                    setHalaman(1)
                  }}
                  className="w-full h-9 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="semua">Semua Periode Data</option>
                  <option value="hari">Hari Ini (Per Hari)</option>
                  <option value="minggu">7 Hari Terakhir (Per Minggu)</option>
                  <option value="bulan">Bulan Ini (Per Bulan)</option>
                  <option value="semester">6 Bulan Terakhir (Per Semester)</option>
                  <option value="tahun">Tahun Ini (Per Tahun)</option>
                  <option value="custom">Rentang Tanggal Kustom</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => {
                      setDateFrom(e.target.value)
                      setPeriod('custom')
                      setHalaman(1)
                    }}
                    className="w-full h-8 px-2 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Tanggal Selesai</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => {
                      setDateTo(e.target.value)
                      setPeriod('custom')
                      setHalaman(1)
                    }}
                    className="w-full h-8 px-2 text-[11px] rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Col 2: Siswa per Jenjang / Level */}
        <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Siswa per Jenjang</h2>
            <span className="text-xs font-semibold text-slate-400">Level Breakdown</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataKelas} margin={{ top: 15, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="nama" tick={{ fontSize: 10 }} stroke="#888888" />
                <YAxis tick={{ fontSize: 10 }} stroke="#888888" />
                <Tooltip formatter={(v) => [angka(v), 'Siswa']} />
                <Bar dataKey="jumlah" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={44} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        {/* Col 3: Distribusi Siswa per Unit */}
        <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Distribusi Unit Sekolah</h2>
            <span className="text-xs font-bold text-slate-500">{angka(total)} Total</span>
          </div>
          <div className="flex flex-col items-center justify-center flex-1">
            <div className="relative w-40 h-40 mb-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dataUnit}
                    dataKey="jumlah"
                    nameKey="nama"
                    innerRadius="62%"
                    outerRadius="88%"
                    paddingAngle={2}
                  >
                    {dataUnit.map((_, i) => (
                      <Cell key={i} fill={warnaPie[i % warnaPie.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => [angka(v), 'Jumlah Siswa']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <strong className="text-xl font-black text-slate-900 dark:text-white">{angka(total)}</strong>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Siswa</span>
              </div>
            </div>

            <div className="w-full grid grid-cols-2 gap-2 text-xs">
              {dataUnit.slice(0, 4).map((item, i) => (
                <div key={item.nama} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900/60">
                  <span className="size-2.5 rounded-full shrink-0" style={{ background: warnaPie[i % warnaPie.length] }} />
                  <div className="flex items-center justify-between w-full min-w-0">
                    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate">{item.nama}</span>
                    <span className="text-[11px] font-bold text-slate-900 dark:text-white ml-1">{angka(item.jumlah)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </div>

      {/* ── Main Master Datatable Card ─────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        {/* ── Toolbar Header Terstruktur 3-Baris ───────────────────────────── */}
        <div className="p-4 sm:p-6 space-y-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-500/20">
          {/* Baris 1: Title & Toolbar Squircle Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Rincian Data Siswa
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Daftar rincian data siswa berdasarkan unit, kelas, status, dan pencarian.
              </p>
            </div>

            <div className="flex items-center gap-2 flex-nowrap shrink-0 py-1">
              {/* Soft Pastel Squircle Action Buttons */}
              <SquircleActionButton
                variant="export"
                label="Export CSV"
                onClick={() => exportCsv('rekap-siswa.csv', kolomCsv, hasilFilter)}
              />
              <SquircleActionButton
                variant="view"
                icon={Printer}
                label="Cetak Data"
                onClick={() => {
                  setPrintTargetStudent(null)
                  setIsPrintModalOpen(true)
                }}
              />
            </div>
          </div>

          {/* Baris 2: Input Pencarian Memanjang Full Width */}
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={pencarian}
              onChange={(e) => setPencarian(e.target.value)}
              placeholder="Cari NIS, Nama Siswa, Kelas, atau Unit Pendidikan..."
              className="w-full pl-10 pr-9 h-10 text-xs rounded-xl bg-slate-50/70 dark:bg-slate-900/60"
            />
            {pencarian && (
              <button
                type="button"
                onClick={() => setPencarian('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Baris 3: Per-Page Control & Summary Badges */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 text-xs">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
              <span>Menampilkan <strong>{hasilFilter.length}</strong> siswa terfilter</span>
            </div>

            {/* Per Page Select */}
            <div className="relative flex items-center gap-1.5">
              <span className="text-xs font-medium text-slate-500">Per Halaman:</span>
              <div className="relative">
                <select
                  value={perHalaman}
                  onChange={(e) => {
                    setPerHalaman(Number(e.target.value))
                    setHalaman(1)
                  }}
                  className="h-9 cursor-pointer appearance-none rounded-xl border border-slate-200 bg-white pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-2xs transition-all hover:border-slate-300 focus:border-emerald-600 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* ── Datatable Viewport dengan Horizontal Padding ───────────────────── */}
        <div className="px-4 sm:px-6 md:px-8 overflow-x-auto">
          {hasilFilter.length === 0 ? (
            <div className="py-8">
              <MasterEmptyState
                message="Tidak ada data siswa yang cocok dengan filter atau pencarian Anda."
              />
            </div>
          ) : (
            <TableRoot fullBleed={false}>
              <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                <TableRow>
                  <TableHead className="w-12 text-center">#</TableHead>

                  <TableHead
                    className="cursor-pointer select-none hover:text-emerald-600 transition-colors"
                    onClick={() => handleSort('nama')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Nama Siswa</span>
                      <ArrowBothDirectionHorizontal2 className="size-3.5 text-slate-400" />
                    </div>
                  </TableHead>

                  <TableHead
                    className="text-center cursor-pointer select-none hover:text-emerald-600 transition-colors"
                    onClick={() => handleSort('nis')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>NIS</span>
                      <ArrowBothDirectionHorizontal2 className="size-3.5 text-slate-400" />
                    </div>
                  </TableHead>

                  <TableHead
                    className="text-center cursor-pointer select-none hover:text-emerald-600 transition-colors"
                    onClick={() => handleSort('unit')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Unit Pendidikan</span>
                      <ArrowBothDirectionHorizontal2 className="size-3.5 text-slate-400" />
                    </div>
                  </TableHead>

                  <TableHead
                    className="text-center cursor-pointer select-none hover:text-emerald-600 transition-colors"
                    onClick={() => handleSort('kelas')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>Kelas / Rombel</span>
                      <ArrowBothDirectionHorizontal2 className="size-3.5 text-slate-400" />
                    </div>
                  </TableHead>

                  <TableHead className="text-center">Gender</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {baris.map((item, index) => {
                  const itemStatus = item.status || (item.aktif ? 'aktif' : 'nonaktif')

                  return (
                    <TableRow
                      key={item.id || item.nis || index}
                      className="hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                    >
                      <TableCell className="text-center font-bold text-slate-400 text-xs">
                        {(halaman - 1) * perHalaman + index + 1}
                      </TableCell>

                      {/* Cell Identitas Siswa dengan HoverCard */}
                      <TableCell>
                        <HoverCard>
                          <HoverCardTrigger
                            onClick={(e) => {
                              e.preventDefault()
                              setSelectedStudentModal(item)
                            }}
                            className="font-extrabold text-slate-900 dark:text-white text-sm border-b border-dashed border-slate-400/60 hover:border-[#0E5C44] transition-colors cursor-pointer inline-block"
                          >
                            <PersonIdentityCell
                              src={item.foto_url}
                              name={item.nama}
                              subtitle={item.nis ? `NIS: ${item.nis}` : null}
                            />
                          </HoverCardTrigger>

                          <HoverCardContent className="w-72 p-0 overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1B2433] shadow-xl rounded-2xl z-50">
                            <div className="relative h-20 w-full bg-gradient-to-r from-emerald-800 to-teal-900 p-3.5 flex items-center justify-between text-white">
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                                  {item.kelas || 'SISWA'}
                                </span>
                                <h4 className="text-sm font-extrabold mt-1 text-white truncate max-w-[170px]">
                                  {item.nama}
                                </h4>
                              </div>
                              <div className="size-10 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center font-black text-xs text-white border border-white/20 shrink-0 overflow-hidden">
                                {item.foto_url ? (
                                  <img src={item.foto_url} alt={item.nama} className="h-full w-full object-cover" />
                                ) : (
                                  (item.nama || 'S').slice(0, 2).toUpperCase()
                                )}
                              </div>
                            </div>

                            <div className="p-3.5 space-y-2.5">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-slate-400 block text-[10px] font-semibold">NIS</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono truncate block">{item.nis || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px] font-semibold">Unit</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{item.unit || '-'}</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => setSelectedStudentModal(item)}
                                className="w-full py-2 bg-[#0E5C44] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all hover:bg-[#1E8E5A] active:scale-98 shadow-xs cursor-pointer"
                              >
                                Lihat Detail Profil Siswa
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePrintWeekly(item)}
                                className="w-full mt-1.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all hover:from-emerald-700 hover:to-teal-700 active:scale-98 shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Printer className="size-3.5" />
                                Cetak Evaluasi Pekanan
                              </button>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </TableCell>

                      <TableCell className="text-center font-mono font-semibold text-slate-600 dark:text-slate-400 text-xs">
                        {item.nis || '-'}
                      </TableCell>

                      <TableCell className="text-center font-medium text-slate-700 dark:text-slate-300">
                        {item.unit || '-'}
                      </TableCell>

                      <TableCell className="text-center font-semibold text-slate-800 dark:text-slate-200">
                        {item.kelas || '-'}
                      </TableCell>

                      <TableCell className="text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {item.jenis_kelamin || item.jk || '-'}
                      </TableCell>

                      <TableCell className="text-center">
                        <MasterStatusBadge
                          status={itemStatus}
                          className="hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => setSelectedStudentModal(item)}
                        />
                      </TableCell>

                      <TableCell className="text-right">
                        <button
                          type="button"
                          title="Cetak Laporan Perkembangan Pekanan"
                          onClick={() => handlePrintWeekly(item)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:scale-105 active:scale-95 transition-all dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-2xs"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </TableRoot>
          )}
        </div>

        {/* ── Footer Pagination ────────────────────────────────────────────── */}
        <div className="w-full border-t border-slate-100 px-4 py-3.5 sm:px-6 md:px-8 dark:border-slate-800">
          <Pagination
            currentPage={halaman}
            totalPages={totalHalaman}
            onPageChange={(page) => setHalaman(page)}
            sideLayout="full"
          />
        </div>
      </div>
    </PageContainer>
  )
}
