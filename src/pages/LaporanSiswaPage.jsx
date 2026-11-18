import { useEffect, useMemo, useRef, useState } from 'react'
import { DatePicker } from '@/components/ui/date-picker'
import { useDebounce } from '../hooks/useDebounce'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Building2,
  CalendarCheck,
  CalendarDays,
  Check,
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
  Trophy,
  ArrowRightLeft,
  Award,
  Compass,
  School,
} from 'lucide-react'
import {
  ArrowRightLeft as ArrowBothDirectionHorizontal2,
  Download as Download1,
  Upload as Upload1,
} from 'lucide-react'
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
import { alumniService } from '../services/alumniService'
import { dashboardPemantauanService } from '../services/dashboardPemantauanService'
import { studentMutationService } from '../services/studentMutationService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { ReportSkeleton } from '../components/reports/ReportSkeleton'
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
import { handleApiExport } from '../utils/exportUtils'

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  TableRoot,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { Input } from '@/components/ui/input'
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Backdrop } from '@/components/ui/dialog'

const angka = (nilai) => new Intl.NumberFormat('id-ID').format(Number(nilai || 0))
const warnaPie = ['#059669', '#0D9488', '#10B981', '#34D399', '#F59E0B', '#F43F5E']

const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600 dark:text-emerald-400',
  },
  sky: {
    card: 'border-sky-300/70 bg-gradient-to-br from-sky-50 via-blue-50/60 to-white hover:border-sky-400 dark:border-sky-700/50 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-slate-900',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sky-500/30',
    tag: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
    title: 'text-sky-700 dark:text-sky-400',
    val: 'text-sky-700 dark:text-sky-300',
    sub: 'text-sky-600/80 dark:text-sky-400/80',
    cta: 'text-sky-600 dark:text-sky-400',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
    cta: 'text-amber-600 dark:text-amber-400',
  },
  violet: {
    card: 'border-violet-300/70 bg-gradient-to-br from-violet-50 via-purple-50/60 to-white hover:border-violet-400 dark:border-violet-700/50 dark:from-violet-950/40 dark:via-purple-950/20 dark:to-slate-900',
    glow: 'bg-violet-400/20 group-hover:bg-violet-400/30',
    iconBox: 'bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-violet-500/30',
    tag: 'bg-violet-100 text-violet-700 dark:bg-violet-900/60 dark:text-violet-300',
    title: 'text-violet-700 dark:text-violet-400',
    val: 'text-violet-700 dark:text-violet-300',
    sub: 'text-violet-600/80 dark:text-violet-400/80',
    cta: 'text-violet-600 dark:text-violet-400',
  },
  rose: {
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-rose-500/30',
    tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-rose-700 dark:text-rose-300',
    sub: 'text-rose-600/80 dark:text-rose-400/80',
    cta: 'text-rose-600 dark:text-rose-400',
  },
}

// ── HEROUI FILTER BAR SELECT DROPDOWN COMPONENT ──
function HeroUiFilterSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Pilih...',
  icon: IconComponent = null,
  className = '',
  popoverWidth = 'w-full',
  searchable = false,
  ariaLabel = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [openUpwards, setOpenUpwards] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleToggle = () => {
    if (disabled) return
    if (!isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      const spaceAbove = rect.top
      setOpenUpwards(spaceBelow < 240 && spaceAbove > spaceBelow)
      setSearch('')
    }
    setIsOpen((prev) => !prev)
  }

  const selectedOption = useMemo(() => {
    return options.find((opt) => String(opt.value) === String(value))
  }, [options, value])

  const filteredOptions = useMemo(() => {
    if (!searchable || !search.trim()) return options
    const q = search.toLowerCase()
    return options.filter((opt) =>
      (opt.label && String(opt.label).toLowerCase().includes(q)) ||
      (opt.subtext && String(opt.subtext).toLowerCase().includes(q))
    )
  }, [options, search, searchable])

  const hasValue = value !== '' && value !== 'semua' && value !== 'all' && value !== undefined && value !== null

  return (
    <div className={`relative ${isOpen ? 'z-[60]' : 'z-10'} ${className}`} ref={containerRef}>
      <button
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={handleToggle}
        className={`h-9 w-full flex items-center justify-between gap-2 rounded-xl border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
          isOpen
            ? 'border-emerald-600 bg-white ring-2 ring-emerald-500/20 dark:border-emerald-400 dark:bg-slate-800 dark:ring-emerald-400/20 text-slate-900 dark:text-white shadow-xs'
            : hasValue
            ? 'border-emerald-400/80 bg-emerald-50/80 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200 font-bold'
            : 'border-slate-300 dark:border-slate-700 bg-white text-slate-700 hover:border-emerald-400 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600'
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          {IconComponent && (
            <IconComponent className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={`size-3.5 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: openUpwards ? 6 : -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: openUpwards ? 6 : -6 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute left-0 ${
              openUpwards ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
            } z-[100] ${popoverWidth} min-w-[200px] overflow-hidden rounded-xl border-2 border-emerald-500/30 bg-white/95 dark:bg-[#182232]/95 backdrop-blur-md p-1.5 shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/60 dark:shadow-black/60`}
          >
            {(searchable || options.length > 5) && (
              <div className="p-1.5 border-b border-slate-100 dark:border-slate-700/60 mb-1">
                <div className="relative">
                  <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari..."
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 pl-8 pr-2.5 py-1 text-xs text-slate-700 dark:text-slate-200 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    autoFocus
                  />
                </div>
              </div>
            )}

            <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-slate-400 dark:text-slate-500">
                  Tidak ada data
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = String(opt.value) === String(value)
                  return (
                    <button
                      key={String(opt.value)}
                      type="button"
                      onClick={() => {
                        onChange(opt.value)
                        setIsOpen(false)
                        setSearch('')
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors text-left cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate">{opt.label}</div>
                        {opt.subtext && (
                          <div className="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate mt-0.5">
                            {opt.subtext}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <Check className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </button>
                  )
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function LaporanSiswaPage() {
  const [memuat, setMemuat] = useState(true)
  const [gagal, setGagal] = useState('')
  const [dashboard, setDashboard] = useState(null)
  const [pencarian, setPencarian] = useState('')
  const debouncedPencarian = useDebounce(pencarian, 350)
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
  const [printModalDefaultPreview, setPrintModalDefaultPreview] = useState(false)

  // ── 4 Sub-Tabs Kesiswaan Terpadu ──
  const [activeSubTab, setActiveSubTab] = useState('demografi') // 'demografi' | 'prestasi' | 'kelulusan' | 'mutasi'

  // Alumni & Kelulusan state
  const [alumniList, setAlumniList] = useState([])
  const [alumniStats, setAlumniStats] = useState(null)
  const [alumniSearch, setAlumniSearch] = useState('')
  const [alumniYearFilter, setAlumniYearFilter] = useState('semua')
  const [alumniUnitFilter, setAlumniUnitFilter] = useState('semua')
  const [alumniCategoryFilter, setAlumniCategoryFilter] = useState('semua')

  // Prestasi state
  const [prestasiList, setPrestasiList] = useState([])
  const [prestasiTotalCount, setPrestasiTotalCount] = useState(null)
  const [prestasiSearch, setPrestasiSearch] = useState('')
  const [prestasiTingkatFilter, setPrestasiTingkatFilter] = useState('semua')

  // Mutasi state
  const [mutasiList, setMutasiList] = useState([])
  const [mutasiSearch, setMutasiSearch] = useState('')
  const [mutasiTypeFilter, setMutasiTypeFilter] = useState('semua')

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

  const [subTabMemuat, setSubTabMemuat] = useState(false)
  const [loadedTabs, setLoadedTabs] = useState({ demografi: true })

  const mapPrestasiItem = (item) => {
    const student = item.siswa || item.student || {}
    return {
      ...item,
      id: item.id,
      nama_siswa: student.full_name || student.name || item.nama_siswa || item.student_name || 'Santri Mahad',
      nis: student.nis || item.nis || '-',
      kelas: student.kelas?.nama_kelas || student.kelas?.name || item.class_name || '-',
      unit: student.education_unit?.name || student.education_unit?.code || item.unit_name || user?.unit_name || user?.unit?.name || 'Unit Pendidikan',
      nama_prestasi: item.nama_prestasi || item.judul || item.prestasi || 'Prestasi Siswa',
      tingkat_prestasi: item.tingkat_prestasi || item.tingkat || 'Internal Sekolah',
      jenis_prestasi: item.jenis_prestasi || item.bidang || item.kategori || 'santri',
      peringkat: item.peringkat || item.juara || (item.nilai_prestasi ? `Skor: ${item.nilai_prestasi}` : 'Juara'),
      tahun: item.tahun || (item.tanggal_prestasi ? new Date(item.tanggal_prestasi).getFullYear() : '2026'),
      avatar_url: student.avatar_url || null,
    }
  }

  const muatData = async () => {
    try {
      setMemuat(true)
      setGagal('')
      const [resDashboard, resPrestasi] = await Promise.allSettled([
        studentService.getDashboard(),
        dashboardPemantauanService.getDaftarRekapPrestasiSiswa({ per_page: 50 }),
      ])
      if (resDashboard.status === 'fulfilled') {
        setDashboard(resDashboard.value)
      }
      if (resPrestasi.status === 'fulfilled') {
        const pRes = resPrestasi.value
        const pVal = pRes?.data || pRes || []
        const list = Array.isArray(pVal) ? pVal : []
        setPrestasiList(list.map(mapPrestasiItem))
        if (pRes?.total != null) {
          setPrestasiTotalCount(pRes.total)
        }
      }
    } catch (error) {
      const status = error?.response?.status
      if (status === 401) {
        setGagal('Sesi Anda telah berakhir. Silakan masuk kembali.')
      } else if (status === 403) {
        setGagal('Akses ditolak: Anda tidak memiliki wewenang pada unit ini.')
      } else if (status === 404) {
        setGagal('Endpoint data siswa tidak ditemukan.')
      } else if (status === 500) {
        setGagal('Terjadi kesalahan internal server saat memuat data siswa.')
      } else if (error?.code === 'ERR_NETWORK') {
        setGagal('Gagal terhubung ke server. Periksa koneksi internet Anda.')
      } else {
        setGagal(error?.response?.data?.message || 'Gagal memuat laporan data siswa.')
      }
    } finally {
      setMemuat(false)
    }
  }

  useEffect(() => {
    muatData()
  }, [])

  useEffect(() => {
    if (loadedTabs[activeSubTab]) return

    const muatSubTabData = async () => {
      setSubTabMemuat(true)
      try {
        if (activeSubTab === 'prestasi') {
          const res = await dashboardPemantauanService.getDaftarRekapPrestasiSiswa({ per_page: 100 })
          const pVal = res?.data || res || []
          const list = Array.isArray(pVal) ? pVal : []
          setPrestasiList(list.map(mapPrestasiItem))
          if (res?.total != null) {
            setPrestasiTotalCount(res.total)
          }
        } else if (activeSubTab === 'kelulusan') {
          const [resAlumni, resAlumniStats] = await Promise.allSettled([
            alumniService.getAlumniList({ per_page: 50 }),
            alumniService.getAlumniStats(),
          ])
          if (resAlumni.status === 'fulfilled') {
            const aVal = resAlumni.value?.data || resAlumni.value || []
            setAlumniList(Array.isArray(aVal) ? aVal : [])
          }
          if (resAlumniStats.status === 'fulfilled') {
            setAlumniStats(resAlumniStats.value)
          }
        } else if (activeSubTab === 'mutasi') {
          const res = await studentMutationService.getMutasiList({ per_page: 50 })
          const mVal = res?.data || res || []
          setMutasiList(Array.isArray(mVal) ? mVal : [])
        }
        setLoadedTabs((prev) => ({ ...prev, [activeSubTab]: true }))
      } catch (err) {
        console.error(`Gagal memuat data sub-tab ${activeSubTab}:`, err)
      } finally {
        setSubTabMemuat(false)
      }
    }

    muatSubTabData()
  }, [activeSubTab, loadedTabs])

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

  const unitOptions = useMemo(() => [
    { value: 'semua', label: 'Semua Unit Pendidikan' },
    ...daftarUnit.map((item) => ({ value: item, label: item })),
  ], [daftarUnit])

  const kelasOptions = useMemo(() => [
    { value: 'semua', label: 'Semua Kelas & Rombel' },
    ...daftarKelas.map((item) => ({ value: item, label: item })),
  ], [daftarKelas])

  const genderOptions = useMemo(() => [
    { value: 'semua', label: 'Semua Gender' },
    { value: 'L', label: 'Laki-laki (L)' },
    { value: 'P', label: 'Perempuan (P)' },
  ], [])

  const statusOptions = useMemo(() => [
    { value: 'semua', label: 'Semua Status' },
    { value: 'aktif', label: 'Siswa Aktif' },
    { value: 'alumni', label: 'Siswa Alumni' },
    { value: 'mutasi_keluar', label: 'Mutasi Keluar' },
    { value: 'nonaktif', label: 'Siswa Non-aktif' },
  ], [])

  const periodOptions = useMemo(() => [
    { value: 'semua', label: 'Semua Periode Data' },
    { value: 'hari', label: 'Hari Ini (Per Hari)' },
    { value: 'minggu', label: '7 Hari Terakhir (Per Minggu)' },
    { value: 'bulan', label: 'Bulan Ini (Per Bulan)' },
    { value: 'semester', label: '6 Bulan Terakhir (Per Semester)' },
    { value: 'tahun', label: 'Tahun Ini (Per Tahun)' },
    { value: 'custom', label: 'Rentang Tanggal Kustom' },
  ], [])

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
        .includes(debouncedPencarian.toLowerCase())

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
  }, [siswa, debouncedPencarian, jenisKelamin, status, unit, kelas, dateFrom, dateTo, sortKey, sortOrder])

  const totalHalaman = Math.max(Math.ceil(hasilFilter.length / perHalaman), 1)
  const baris = hasilFilter.slice((halaman - 1) * perHalaman, halaman * perHalaman)

  // ── Kelulusan & Alumni Computed ──
  const alumniYears = useMemo(() => {
    const years = new Set()
    alumniList.forEach((a) => {
      const yr = a.metadata?.tahun_lulus || a.tahun_lulus || a.tahun_masuk
      if (yr) years.add(String(yr))
    })
    if (years.size === 0) {
      years.add('2026')
      years.add('2025')
      years.add('2024')
    }
    return Array.from(years).sort().reverse()
  }, [alumniList])

  const hasilFilterAlumni = useMemo(() => {
    return alumniList.filter((item) => {
      if (alumniSearch) {
        const q = alumniSearch.toLowerCase()
        const nama = String(item.full_name || item.name || item.nama || '').toLowerCase()
        const nis = String(item.nis || item.nisn || '').toLowerCase()
        const tujuan = String(item.metadata?.tujuan_kelulusan || item.metadata?.perguruan_tinggi || item.metadata?.status_lanjutan || '').toLowerCase()
        if (!nama.includes(q) && !nis.includes(q) && !tujuan.includes(q)) return false
      }
      if (alumniYearFilter !== 'semua') {
        const yr = String(item.metadata?.tahun_lulus || item.tahun_lulus || '')
        if (yr !== alumniYearFilter) return false
      }
      if (alumniUnitFilter !== 'semua') {
        const u = item.education_unit?.name || item.unit || ''
        if (u !== alumniUnitFilter) return false
      }
      if (alumniCategoryFilter !== 'semua') {
        const kat = String(item.metadata?.status_lanjutan || item.metadata?.kategori_tujuan || '').toLowerCase()
        if (!kat.includes(alumniCategoryFilter.toLowerCase())) return false
      }
      return true
    })
  }, [alumniList, alumniSearch, alumniYearFilter, alumniUnitFilter, alumniCategoryFilter])

  const kelulusanKpi = useMemo(() => {
    const totalAlumni = Number(alumniStats?.total_alumni || alumniList.length || 0)
    const currentYear = new Date().getFullYear()
    const lulusTahunIni = Number(
      alumniStats?.lulus_tahun_ini ||
      alumniList.filter((a) => String(a.metadata?.tahun_lulus || a.tahun_lulus || '') === String(currentYear)).length ||
      0
    )
    const unitCount = daftarUnit.length || 1
    const lanjutStudi = Number(
      alumniStats?.lanjut_studi ||
      alumniList.filter((a) => Boolean(a.metadata?.tujuan_kelulusan || a.metadata?.perguruan_tinggi || a.metadata?.status_lanjutan)).length ||
      0
    )
    return {
      total: totalAlumni,
      tahunIni: lulusTahunIni,
      unitCount,
      lanjutStudi,
    }
  }, [alumniStats, alumniList, daftarUnit])

  // Grafik Tren Kelulusan Tahunan
  const trenKelulusanTahunan = useMemo(() => {
    const yearMap = {}
    alumniYears.forEach((y) => {
      yearMap[y] = 0
    })
    alumniList.forEach((a) => {
      const yr = String(a.metadata?.tahun_lulus || a.tahun_lulus || '2026')
      if (yearMap[yr] !== undefined) {
        yearMap[yr]++
      } else {
        yearMap[yr] = 1
      }
    })
    return Object.entries(yearMap)
      .map(([tahun, jumlah]) => ({ tahun: `Tahun ${tahun}`, jumlah }))
      .reverse()
  }, [alumniYears, alumniList])

  // Donut Komposisi Tujuan Alumni
  const komposisiTujuanAlumni = useMemo(() => {
    let ptn = 0
    let pts = 0
    let mahad = 0
    let karir = 0
    alumniList.forEach((a) => {
      const kat = String(a.metadata?.status_lanjutan || a.metadata?.kategori_tujuan || a.metadata?.tujuan_kelulusan || '').toLowerCase()
      if (kat.includes('ptn') || kat.includes('negeri')) ptn++
      else if (kat.includes('pts') || kat.includes('swasta')) pts++
      else if (kat.includes('mahad') || kat.includes('pesantren') || kat.includes('ponpes')) mahad++
      else karir++
    })
    return [
      { name: 'PTN (Negeri)', value: ptn },
      { name: 'PTS (Swasta)', value: pts },
      { name: "Ma'had / Ponpes", value: mahad },
      { name: 'Karir / Wirausaha', value: karir },
    ]
  }, [alumniList])

  // ── Prestasi Computed ──
  const hasilFilterPrestasi = useMemo(() => {
    return prestasiList.filter((item) => {
      if (prestasiSearch) {
        const q = prestasiSearch.toLowerCase()
        const nama = String(item.nama_siswa || '').toLowerCase()
        const nis = String(item.nis || '').toLowerCase()
        const judul = String(item.nama_prestasi || '').toLowerCase()
        const bidang = String(item.jenis_prestasi || item.bidang || item.kategori || '').toLowerCase()
        const kelas = String(item.kelas || '').toLowerCase()
        if (!nama.includes(q) && !nis.includes(q) && !judul.includes(q) && !bidang.includes(q) && !kelas.includes(q)) return false
      }
      if (prestasiTingkatFilter !== 'semua') {
        const tingkat = String(item.tingkat_prestasi || item.tingkat || '').toLowerCase()
        if (!tingkat.includes(prestasiTingkatFilter.toLowerCase())) return false
      }
      return true
    })
  }, [prestasiList, prestasiSearch, prestasiTingkatFilter])

  const displayedPrestasiCount = useMemo(() => {
    if (prestasiTotalCount !== undefined && prestasiTotalCount !== null) return Number(prestasiTotalCount)
    if (statistik.total_prestasi_unit !== undefined && statistik.total_prestasi_unit !== null) return Number(statistik.total_prestasi_unit)
    return prestasiList.length
  }, [prestasiTotalCount, statistik.total_prestasi_unit, prestasiList.length])

  const prestasiKpi = useMemo(() => {
    let nasional = 0
    let provinsi = 0
    let kota = 0
    prestasiList.forEach((p) => {
      const t = String(p.tingkat_prestasi || p.tingkat || '').toLowerCase()
      if (t.includes('nasional') || t.includes('internasional')) nasional++
      else if (t.includes('provinsi')) provinsi++
      else kota++
    })
    return {
      total: displayedPrestasiCount,
      nasional,
      provinsi,
      kota,
    }
  }, [prestasiList, displayedPrestasiCount])

  const komposisiBidangPrestasi = useMemo(() => {
    let akademik = 0
    let keagamaan = 0
    let olahragaSeni = 0
    let teknologi = 0
    prestasiList.forEach((p) => {
      const b = String(p.jenis_prestasi || p.bidang || p.kategori || '').toLowerCase()
      if (b.includes('tahfizh') || b.includes('agama') || b.includes('diniyah') || b.includes('quran')) keagamaan++
      else if (b.includes('olahraga') || b.includes('seni') || b.includes('futsal') || b.includes('panahan')) olahragaSeni++
      else if (b.includes('robotik') || b.includes('teknologi') || b.includes('it') || b.includes('komputer')) teknologi++
      else akademik++
    })
    return [
      { name: 'Akademik', value: akademik },
      { name: 'Keagamaan (Tahfizh)', value: keagamaan },
      { name: 'Olahraga & Seni', value: olahragaSeni },
      { name: 'Teknologi & Robotik', value: teknologi },
    ]
  }, [prestasiList])

  // ── Mutasi Computed ──
  const hasilFilterMutasi = useMemo(() => {
    return mutasiList.filter((item) => {
      if (mutasiSearch) {
        const q = mutasiSearch.toLowerCase()
        const nama = String(item.student?.name || item.name || '').toLowerCase()
        const nis = String(item.student?.nis || item.nis || '').toLowerCase()
        const tujuan = String(item.metadata?.sekolah_tujuan || item.metadata?.unit_tujuan || item.to_unit?.name || '').toLowerCase()
        if (!nama.includes(q) && !nis.includes(q) && !tujuan.includes(q)) return false
      }
      if (mutasiTypeFilter === 'unit') {
        if (!item.to_unit_id && !item.metadata?.unit_tujuan) return false
      } else if (mutasiTypeFilter === 'keluar') {
        if (!item.metadata?.sekolah_tujuan && item.to_unit_id) return false
      }
      return true
    })
  }, [mutasiList, mutasiSearch, mutasiTypeFilter])

  const mutasiKpi = useMemo(() => {
    let pindahUnit = 0
    let pindahKeluar = 0
    mutasiList.forEach((m) => {
      if (m.to_unit_id || m.metadata?.unit_tujuan) pindahUnit++
      else pindahKeluar++
    })
    return {
      total: mutasiList.length,
      pindahUnit,
      pindahKeluar,
    }
  }, [mutasiList])

  useEffect(() => {
    setHalaman(1)
  }, [debouncedPencarian, status, unit, kelas, jenisKelamin, period, dateFrom, dateTo, perHalaman])

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

  const handleExportData = async () => {
    const params = {}
    if (search) params.search = search
    if (unit && unit !== 'semua') params.unit_id = unit
    if (kelas && kelas !== 'semua') params.kelas_id = kelas

    await handleApiExport({
      endpoint: '/students/export',
      params,
      title: 'Ekspor Laporan Siswa',
      defaultFilename: `Laporan_Data_Siswa_${new Date().toISOString().slice(0, 10)}`,
    })
  }

  const handlePrintClean = (orientation = 'portrait') => {
    const listToPrint = printTargetStudent ? [printTargetStudent] : hasilFilter
    const activeUnitTarget = printTargetStudent
      ? printTargetStudent.unit
      : (unit !== 'semua' ? unit : (daftarUnit.length === 1 ? daftarUnit[0] : (siswa[0]?.unit || null)))

    const title = printTargetStudent
      ? `Laporan Detail Siswa: ${printTargetStudent.nama || ''}`
      : 'Rekap Laporan Data Siswa Terpadu'
    const subtitle = printTargetStudent
      ? `NIS: ${printTargetStudent.nis || '-'} | Unit: ${printTargetStudent.unit || '-'} | Kelas: ${printTargetStudent.kelas || '-'}`
      : `Filter Terpasang: [ ${getFilterRingkasan()} ] — Total: ${listToPrint.length} Siswa`

    printCleanTable({
      title,
      subtitle,
      unit: activeUnitTarget,
      orientation,
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

  const handleDownloadPdf = (orientation = 'portrait') => {
    const listToPrint = printTargetStudent ? [printTargetStudent] : hasilFilter
    const activeUnitTarget = printTargetStudent
      ? printTargetStudent.unit
      : (unit !== 'semua' ? unit : (daftarUnit.length === 1 ? daftarUnit[0] : (siswa[0]?.unit || null)))

    const title = printTargetStudent
      ? `Laporan Detail Siswa: ${printTargetStudent.nama || ''}`
      : 'Rekap Laporan Data Siswa Terpadu'
    const filename = printTargetStudent
      ? `laporan-siswa-${printTargetStudent.nis || printTargetStudent.id || 'detail'}.pdf`
      : `rekap-laporan-siswa-${new Date().toISOString().slice(0, 10)}.pdf`

    downloadPdfTable({
      title,
      filename,
      unit: activeUnitTarget,
      orientation,
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
    const rawUnitName = eduUnit?.name || (typeof st?.unit === 'string' ? st?.unit : '') || st?.unit_name || (unit !== 'semua' ? unit : '') || ''
    const finalUnitObj = eduUnit || (rawUnitName ? { name: rawUnitName, code: rawUnitName } : null)

    printWeeklyStudentEvaluation({
      student: {
        ...st,
        name: st?.nama || st?.full_name || st?.name || 'Siswa',
        nis: st?.nis || st?.nisn || '-',
        className: st?.kelas || '-',
        unit: rawUnitName,
        unitName: rawUnitName,
        education_unit: finalUnitObj,
      },
      period: {
        title: 'Pekan Berjalan',
        academicYear: '2026/2027',
      },
      homeroomTeacher: {
        name: st?.wali_kelas || 'Wali Kelas',
      },
      guruWali: {
        name: st?.guru_wali || 'Guru Wali',
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
      <PageContainer className="space-y-6 pb-12">
        <ReportSkeleton />
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
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full">
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
          setPrintModalDefaultPreview(false)
        }}
        title={printTargetStudent ? `Cetak Laporan: ${printTargetStudent.nama}` : 'Laporan Data Siswa Terpadu'}
        subtitle={
          printTargetStudent
            ? `NIS: ${printTargetStudent.nis || '-'} | Unit: ${printTargetStudent.unit || '-'} | Kelas: ${printTargetStudent.kelas || '-'}`
            : `Filter Terpasang: [ ${getFilterRingkasan()} ] — Total: ${hasilFilter.length} Siswa`
        }
        activeUnit={printTargetStudent ? printTargetStudent.unit : (unit !== 'semua' ? unit : (daftarUnit.length === 1 ? daftarUnit[0] : (siswa[0]?.unit || null)))}
        onPrint={handlePrintClean}
        onDownloadPdf={handleDownloadPdf}
        defaultPreview={printModalDefaultPreview}
        previewHeaders={['NO', 'NIS', 'NAMA SISWA', 'UNIT PENDIDIKAN', 'KELAS / ROMBEL', 'JK', 'STATUS']}
        previewRows={(printTargetStudent ? [printTargetStudent] : hasilFilter).map((item, index) => [
          index + 1,
          item.nis || '-',
          item.nama || '-',
          item.unit || '-',
          item.kelas || '-',
          item.jenis_kelamin || item.jk || '-',
          item.status || (item.aktif ? 'Aktif' : 'Non-aktif'),
        ])}
      />

      {/* ── Detail Student Dialog Modal ────────────────────────────────────── */}
      {selectedStudentModal && (
        <Backdrop
          isOpen={Boolean(selectedStudentModal)}
          onOpenChange={(open) => !open && setSelectedStudentModal(null)}
          className="z-[70] bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
        >
          <Dialog className="w-full max-w-lg rounded-3xl overflow-hidden bg-white p-0 shadow-2xl dark:bg-[#1B2433] border border-slate-200 dark:border-slate-800">
            <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
            <div className="p-6">
              <DialogHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20">
                      <Eye className="h-5 w-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-base font-black text-slate-900 dark:text-white">
                        Detail Data Siswa
                      </DialogTitle>
                      <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Informasi profil lengkap dan status keaktifan siswa.
                      </DialogDescription>
                    </div>
                  </div>
                  <MasterStatusBadge status={selectedStudentModal.aktif ? 'aktif' : 'nonaktif'} />
                </div>
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
          </div>
        </Dialog>
      </Backdrop>
    )}

      {/* ── Sub-Tabs Navigasi Kesiswaan Terpadu ──────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
        {[
          { key: 'demografi', label: 'Demografi & Buku Induk', icon: Users, count: total },
          { key: 'prestasi', label: 'Rekap Prestasi Siswa', icon: Trophy, count: displayedPrestasiCount },
          { key: 'kelulusan', label: 'Kelulusan & Tracer Study', icon: GraduationCap, count: Number(statistik.alumni ?? kelulusanKpi.total) },
          { key: 'mutasi', label: 'Mutasi Masuk & Keluar', icon: ArrowRightLeft, count: Number((statistik.mutasi_keluar != null ? (Number(statistik.mutasi_keluar) + Number(statistik.mutasi_masuk || 0)) : null) ?? mutasiKpi.total) },
        ].map((tab) => {
          const isActive = activeSubTab === tab.key
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveSubTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700/60'
              }`}
            >
              <Icon className="size-4 shrink-0" />
              <span>{tab.label}</span>
              <span
                className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {angka(tab.count)}
              </span>
            </button>
          )
        })}
      </div>

      {/* ── KONTEN SUB-TAB 1: DEMOGRAFI & BUKU INDUK ──────────────────────── */}
      {activeSubTab === 'demografi' && (
        <>
          {/* ── KPI Stat Cards Grid (5 Equal & Colored Modern Cards Sesuai Standar Laporan) ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {[
              {
                label: 'Total Siswa',
                statusFilter: 'semua',
                value: angka(total),
                subtitle: total > 0 ? `${total} siswa terdaftar` : 'Belum ada data siswa',
                icon: Users,
                tone: 'emerald',
                percent: total > 0 ? '100%' : '—',
              },
              {
                label: 'Siswa Aktif',
                statusFilter: 'aktif',
                value: angka(aktif),
                subtitle: total > 0 ? `${aktif} dari ${total} siswa (${((aktif / total) * 100).toFixed(1)}%)` : 'Belum ada data',
                icon: GraduationCap,
                tone: 'sky',
                percent: total > 0 ? `${((aktif / total) * 100).toFixed(1)}%` : '—',
              },
              {
                label: 'Siswa Alumni',
                statusFilter: 'alumni',
                value: angka(alumni),
                subtitle: total > 0 ? `${alumni} dari ${total} siswa (${((alumni / total) * 100).toFixed(1)}%)` : 'Belum ada data',
                icon: UserCheck,
                tone: 'amber',
                percent: total > 0 ? `${((alumni / total) * 100).toFixed(1)}%` : '—',
              },
              {
                label: 'Mutasi Keluar',
                statusFilter: 'mutasi_keluar',
                value: angka(mutasi),
                subtitle: total > 0 ? `${mutasi} dari ${total} siswa (${((mutasi / total) * 100).toFixed(1)}%)` : 'Belum ada data',
                icon: UserMinus,
                tone: 'violet',
                percent: total > 0 ? `${((mutasi / total) * 100).toFixed(1)}%` : '—',
              },
              {
                label: 'Siswa Non-Aktif',
                statusFilter: 'nonaktif',
                value: angka(nonaktif),
                subtitle: total > 0 ? `${nonaktif} dari ${total} siswa (${((nonaktif / total) * 100).toFixed(1)}%)` : 'Belum ada data',
                icon: UserX,
                tone: 'rose',
                percent: total > 0 ? `${((nonaktif / total) * 100).toFixed(1)}%` : '—',
              },
            ].map(({ label, statusFilter, value, subtitle, icon: Icon, tone, percent }) => {
              const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
              const isSelected = status === statusFilter
              return (
                <article
                  key={label}
                  onClick={() => {
                    setStatus(statusFilter)
                    setHalaman(1)
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setStatus(statusFilter)
                      setHalaman(1)
                    }
                  }}
                  className={`group relative overflow-hidden rounded-[20px] border-2 p-4 sm:p-4.5 shadow-sm transition-all duration-200 cursor-pointer hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between h-full ${t.card} ${
                    isSelected ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900' : ''
                  }`}
                  title={`Klik untuk memfilter data ${label}`}
                >
                  {/* Ambient Glow */}
                  <div className={`pointer-events-none absolute -top-8 -right-8 h-24 w-24 rounded-full blur-2xl transition-all ${t.glow}`} />

                  {/* Header with 3D Gradient Icon Box & Pill Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className={`size-10 sm:size-10.5 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${t.iconBox}`}>
                      <Icon className="size-5" />
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-extrabold shadow-2xs ${t.tag}`}>
                      {percent}
                    </span>
                  </div>

                  {/* Metric Label & Value */}
                  <div>
                    <span className={`text-[10.5px] font-bold uppercase tracking-wider block mb-0.5 ${t.title}`}>{label}</span>
                    <strong className={`text-2xl sm:text-3xl font-black tracking-tight tabular-nums block ${t.val}`}>
                      {value}
                    </strong>
                  </div>

                  {/* Click Affordance Footer */}
                  <div className="flex items-center justify-between text-[10px] font-bold pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-800/80">
                    <span className="text-slate-500 dark:text-slate-400">{subtitle}</span>
                    <span className={`inline-flex items-center gap-0.5 font-bold group-hover:translate-x-0.5 transition-transform ${t.cta}`}>
                      <Eye className="h-3 w-3" /> Filter &rarr;
                    </span>
                  </div>
                </article>
              )
            })}
          </div>

      {/* ── 3-Column Equal Grid: Filter Laporan, Grafik Siswa per Jenjang, & Distribusi Unit (Style persis LaporanAbsensiPage) ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
        {/* Col 1: Panel Filter Laporan (Sama seperti LaporanAbsensiPage) */}
        <article className="relative rounded-[22px] border-2 border-emerald-500/25 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 flex flex-col justify-between h-full">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-500/15">
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
                {daftarUnit.length === 1 ? (
                  <div className="p-3 rounded-xl border-2 border-emerald-500/25 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-white dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-sm shadow-emerald-500/30">
                      <Building2 className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Unit Pendidikan</span>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{daftarUnit[0]}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
                      Terpilih
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Unit Pendidikan
                    </label>
                    <HeroUiFilterSelect
                      value={unit}
                      onChange={(val) => {
                        setUnit(val)
                        setHalaman(1)
                      }}
                      options={unitOptions}
                      placeholder="Semua Unit Pendidikan"
                      icon={Building2}
                      ariaLabel="Unit Pendidikan"
                      searchable
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Kelas / Rombel
                  </label>
                  <HeroUiFilterSelect
                    value={kelas}
                    onChange={(val) => {
                      setKelas(val)
                      setHalaman(1)
                    }}
                    options={kelasOptions}
                    placeholder="Semua Kelas & Rombel"
                    icon={GraduationCap}
                    ariaLabel="Kelas & Rombel"
                    searchable
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Jenis Kelamin
                  </label>
                  <HeroUiFilterSelect
                    value={jenisKelamin}
                    onChange={(val) => {
                      setJenisKelamin(val)
                      setHalaman(1)
                    }}
                    options={genderOptions}
                    placeholder="Semua Gender"
                    icon={Users}
                    ariaLabel="Jenis Kelamin"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Status Siswa
                  </label>
                  <HeroUiFilterSelect
                    value={status}
                    onChange={(val) => {
                      setStatus(val)
                      setHalaman(1)
                    }}
                    options={statusOptions}
                    placeholder="Semua Status"
                    icon={UserCheck}
                    ariaLabel="Status Siswa"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Periode Waktu
                  </label>
                  <HeroUiFilterSelect
                    value={period}
                    onChange={(nextPeriod) => {
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
                    options={periodOptions}
                    placeholder="Semua Periode Data"
                    icon={CalendarDays}
                    ariaLabel="Periode Waktu"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Tanggal Mulai</label>
                    <DatePicker
                      value={dateFrom}
                      onChange={(e) => {
                        setDateFrom(e.target.value)
                        setPeriod('custom')
                        setHalaman(1)
                      }}
                      placeholder="Mulai..."
                      inputClassName="h-8 text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-500 mb-0.5">Tanggal Selesai</label>
                    <DatePicker
                      value={dateTo}
                      onChange={(e) => {
                        setDateTo(e.target.value)
                        setPeriod('custom')
                        setHalaman(1)
                      }}
                      placeholder="Selesai..."
                      inputClassName="h-8 text-[11px]"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Col 2: Siswa per Jenjang / Level */}
        <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 flex flex-col justify-between h-full">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-500/15">
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
            </div>
          </div>
        </article>

        {/* Col 3: Distribusi Siswa per Unit */}
        <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 flex flex-col justify-between h-full">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-500/15">
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
                label="Export Data"
                onClick={handleExportData}
              />
              <SquircleActionButton
                variant="view"
                icon={Eye}
                label="Pratinjau"
                onClick={() => {
                  setPrintTargetStudent(null)
                  setPrintModalDefaultPreview(true)
                  setIsPrintModalOpen(true)
                }}
              />
              <SquircleActionButton
                variant="view"
                icon={Printer}
                label="Cetak Data"
                onClick={() => {
                  setPrintTargetStudent(null)
                  setPrintModalDefaultPreview(false)
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
              <HeroUiFilterSelect
                value={perHalaman}
                onChange={(val) => {
                  setPerHalaman(Number(val))
                  setHalaman(1)
                }}
                options={[
                  { value: 5, label: '5' },
                  { value: 10, label: '10' },
                  { value: 15, label: '15' },
                  { value: 25, label: '25' },
                  { value: 50, label: '50' },
                  { value: 100, label: '100' },
                ]}
                placeholder="10"
                popoverWidth="w-24"
                className="w-20"
                ariaLabel="Jumlah baris per halaman"
              />
            </div>
          </div>
        </div>

        {/* ── Datatable Viewport ─────────────────────────────────────────────── */}
        <div className="overflow-x-auto">
          {hasilFilter.length === 0 ? (
            <div className="py-8">
              <MasterEmptyState
                message="Tidak ada data siswa yang cocok dengan filter atau pencarian Anda."
              />
            </div>
          ) : (
            <TableRoot className="w-full text-left border-collapse text-xs min-w-[940px]">
              <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                <TableRow className="border-b-2 border-emerald-200/90 dark:border-emerald-800/80 bg-transparent text-emerald-950 dark:text-emerald-200 font-bold tracking-wider uppercase text-[11px]">
                  <TableHead className="py-3.5 px-3 w-12 text-center bg-transparent">NO</TableHead>

                  <TableHead
                    className="py-3.5 px-3 cursor-pointer select-none hover:text-emerald-700 transition-colors"
                    onClick={() => handleSort('nama')}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>NAMA SISWA</span>
                      <ArrowBothDirectionHorizontal2 className="size-3.5 text-slate-400" />
                    </div>
                  </TableHead>

                  <TableHead
                    className="py-3.5 px-3 text-center cursor-pointer select-none hover:text-emerald-700 transition-colors"
                    onClick={() => handleSort('nis')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>NIS</span>
                      <ArrowBothDirectionHorizontal2 className="size-3.5 text-slate-400" />
                    </div>
                  </TableHead>

                  <TableHead
                    className="py-3.5 px-3 text-center cursor-pointer select-none hover:text-emerald-700 transition-colors"
                    onClick={() => handleSort('unit')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>UNIT PENDIDIKAN</span>
                      <ArrowBothDirectionHorizontal2 className="size-3.5 text-slate-400" />
                    </div>
                  </TableHead>

                  <TableHead
                    className="py-3.5 px-3 text-center cursor-pointer select-none hover:text-emerald-700 transition-colors"
                    onClick={() => handleSort('kelas')}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <span>KELAS / ROMBEL</span>
                      <ArrowBothDirectionHorizontal2 className="size-3.5 text-slate-400" />
                    </div>
                  </TableHead>

                  <TableHead className="py-3.5 px-3 text-center">GENDER</TableHead>
                  <TableHead className="py-3.5 px-3 text-center">STATUS</TableHead>
                  <TableHead className="py-3.5 px-3 text-right pr-4">AKSI</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs">
                {baris.map((item, index) => {
                  const itemStatus = item.status || (item.aktif ? 'aktif' : 'nonaktif')

                  return (
                    <TableRow
                      key={item.id || item.nis || index}
                      className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors"
                    >
                      <TableCell className="py-3.5 px-3 text-center font-bold text-slate-500 text-xs">
                        {(halaman - 1) * perHalaman + index + 1}
                      </TableCell>

                      {/* Cell Identitas Siswa dengan HoverCard */}
                      <TableCell className="py-3.5 px-3">
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

                      <TableCell className="py-3.5 px-3 text-center font-mono font-semibold text-slate-600 dark:text-slate-400 text-xs">
                        {item.nis || '-'}
                      </TableCell>

                      <TableCell className="py-3.5 px-3 text-center font-medium text-slate-700 dark:text-slate-300">
                        {item.unit || '-'}
                      </TableCell>

                      <TableCell className="py-3.5 px-3 text-center font-semibold text-slate-800 dark:text-slate-200">
                        {item.kelas || '-'}
                      </TableCell>

                      <TableCell className="py-3.5 px-3 text-center text-xs font-semibold text-slate-600 dark:text-slate-400">
                        {item.jenis_kelamin || item.jk || '-'}
                      </TableCell>

                      <TableCell className="py-3.5 px-3 text-center">
                        <MasterStatusBadge
                          status={itemStatus}
                          className="hover:scale-105 transition-transform cursor-pointer"
                          onClick={() => setSelectedStudentModal(item)}
                        />
                      </TableCell>

                      <TableCell className="py-3.5 px-3 text-right pr-4">
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
        <div className="w-full border-t border-emerald-100/80 px-4 py-3.5 sm:px-6 md:px-8 dark:border-emerald-900/40 bg-slate-50/50 dark:bg-slate-900/30">
          <Pagination
            currentPage={halaman}
            totalPages={totalHalaman}
            onPageChange={(page) => setHalaman(page)}
            sideLayout="full"
          />
        </div>
      </div>
    </>
  )}

      {/* ── KONTEN SUB-TAB 2: REKAP PRESTASI SISWA ──────────────────────────── */}
      {activeSubTab === 'prestasi' && (
        <div className="space-y-6">
          {/* 4 KPI Cards Prestasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative overflow-hidden rounded-[20px] border-2 border-blue-300/80 dark:border-blue-700/60 bg-gradient-to-br from-blue-50/70 via-indigo-50/30 to-white dark:from-blue-950/40 dark:via-indigo-950/20 dark:to-slate-900 p-5 shadow-sm shadow-blue-500/10">
              <div className="flex items-center justify-between mb-3">
                <div className="size-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
                  <Trophy className="size-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                  Total
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{angka(prestasiKpi.total)}</p>
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mt-0.5">Total Prestasi Siswa</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Capaian kejuaraan & penghargaan</p>
            </div>

            <div className="relative overflow-hidden rounded-[20px] border-2 border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-white dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900 p-5 shadow-sm shadow-amber-500/10">
              <div className="flex items-center justify-between mb-3">
                <div className="size-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
                  <Award className="size-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                  Nasional
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{angka(prestasiKpi.nasional)}</p>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">Tingkat Nasional</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Kompetisi nasional bergengsi</p>
            </div>

            <div className="relative overflow-hidden rounded-[20px] border-2 border-emerald-300/80 dark:border-emerald-700/60 bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 p-5 shadow-sm shadow-emerald-500/10">
              <div className="flex items-center justify-between mb-3">
                <div className="size-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                  <Sparkles className="size-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  Provinsi
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{angka(prestasiKpi.provinsi)}</p>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">Tingkat Provinsi</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Kompetisi tingkat wilayah</p>
            </div>

            <div className="relative overflow-hidden rounded-[20px] border-2 border-purple-300/80 dark:border-purple-700/60 bg-gradient-to-br from-purple-50/70 via-violet-50/30 to-white dark:from-purple-950/40 dark:via-violet-950/20 dark:to-slate-900 p-5 shadow-sm shadow-purple-500/10">
              <div className="flex items-center justify-between mb-3">
                <div className="size-11 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25">
                  <Building2 className="size-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                  Kota / Kab
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{angka(prestasiKpi.kota)}</p>
              <p className="text-xs font-bold text-purple-700 dark:text-purple-400 mt-0.5">Tingkat Kota / Kab</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Ajang lomba daerah & yayasan</p>
            </div>
          </div>

          {/* 3-Column Equal Grid Prestasi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {/* Filter Panel */}
            <article className="relative rounded-[22px] border-2 border-emerald-500/25 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 flex flex-col justify-between h-full">
              <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-500/15">
                    <h2 className="text-base font-bold text-slate-900 dark:text-white">Filter Rekap Prestasi</h2>
                    <button
                      type="button"
                      onClick={() => {
                        setPrestasiSearch('')
                        setPrestasiTingkatFilter('semua')
                      }}
                      className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Pencarian Cepat
                      </label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          value={prestasiSearch}
                          onChange={(e) => setPrestasiSearch(e.target.value)}
                          placeholder="Nama siswa, judul lomba, bidang..."
                          className="w-full h-9 pl-8 pr-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Tingkat Kompetisi
                      </label>
                      <HeroUiFilterSelect
                        value={prestasiTingkatFilter}
                        onChange={(val) => setPrestasiTingkatFilter(val)}
                        options={[
                          { value: 'semua', label: 'Semua Tingkat' },
                          { value: 'nasional', label: 'Tingkat Nasional' },
                          { value: 'provinsi', label: 'Tingkat Provinsi' },
                          { value: 'kota', label: 'Tingkat Kota / Kabupaten' },
                        ]}
                        placeholder="Semua Tingkat"
                        icon={Trophy}
                        ariaLabel="Tingkat Kompetisi"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-500/15 text-xs text-slate-500 dark:text-slate-400">
                  Menampilkan <span className="font-bold text-slate-800 dark:text-slate-200">{hasilFilterPrestasi.length}</span> prestasi siswa
                </div>
              </div>
            </article>

            {/* Grafik Capaian Tingkat */}
            <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 flex flex-col justify-between h-full">
              <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-500/15">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Capaian Tingkat Prestasi</h3>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Distribusi</span>
                  </div>
                  <div className="h-52 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { tingkat: 'Nasional', jumlah: prestasiKpi.nasional },
                        { tingkat: 'Provinsi', jumlah: prestasiKpi.provinsi },
                        { tingkat: 'Kota/Kab', jumlah: prestasiKpi.kota },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                        <XAxis dataKey="tingkat" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="jumlah" fill="#059669" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </article>

            {/* Donut Chart Bidang */}
            <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 flex flex-col justify-between h-full">
              <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-500/15">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Bidang Prestasi</h3>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Kategori</span>
                  </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={komposisiBidangPrestasi}
                      innerRadius={45}
                      outerRadius={75}
                      dataKey="value"
                      paddingAngle={4}
                    >
                      {warnaPie.map((warna, i) => (
                        <Cell key={`cell-prestasi-${i}`} fill={warna} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
                </div>
              </div>
            </div>
          </article>
        </div>

          {/* Datatable Prestasi */}
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
            <div className="flex flex-col gap-3 p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/90 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Trophy className="size-4 text-emerald-600" />
                  Daftar Rekapitulasi Prestasi Siswa
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Daftar siswa & santri berprestasi tingkat Kota, Provinsi, hingga Nasional.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {hasilFilterPrestasi.length} Prestasi Terdaftar
              </span>
            </div>

            <div className="overflow-x-auto">
              <TableRoot className="w-full">
                <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                  <TableRow>
                    <TableHead className="w-12 text-center text-xs font-black text-emerald-950 dark:text-emerald-200">NO</TableHead>
                    <TableHead className="text-xs font-black text-emerald-950 dark:text-emerald-200">SANTRI / SISWA</TableHead>
                    <TableHead className="text-xs font-black text-emerald-950 dark:text-emerald-200">NAMA PRESTASI & KEJUARAAN</TableHead>
                    <TableHead className="text-center text-xs font-black text-emerald-950 dark:text-emerald-200">TINGKAT</TableHead>
                    <TableHead className="text-center text-xs font-black text-emerald-950 dark:text-emerald-200">BIDANG</TableHead>
                    <TableHead className="text-center text-xs font-black text-emerald-950 dark:text-emerald-200">PERINGKAT</TableHead>
                    <TableHead className="text-center text-xs font-black text-emerald-950 dark:text-emerald-200">TAHUN</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs">
                  {hasilFilterPrestasi.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                        Tidak ada data prestasi yang cocok dengan pencarian.
                      </TableCell>
                    </TableRow>
                  ) : (
                    hasilFilterPrestasi.map((item, idx) => {
                      const initials = item.nama_siswa
                        ? item.nama_siswa.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
                        : 'SW'
                      const tingkatRaw = String(item.tingkat_prestasi || item.tingkat || '').toLowerCase()
                      const badgeTingkat = tingkatRaw.includes('nasional')
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : tingkatRaw.includes('provinsi')
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        : tingkatRaw.includes('kota') || tingkatRaw.includes('kab')
                        ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'

                      const bidangRaw = String(item.jenis_prestasi || item.bidang || item.kategori || '').toLowerCase()
                      const badgeBidang = bidangRaw.includes('tahfizh')
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : bidangRaw.includes('santri')
                        ? 'bg-cyan-50 text-cyan-700 border border-cyan-200 dark:bg-cyan-950/60 dark:text-cyan-300'
                        : bidangRaw.includes('olahraga')
                        ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300'
                        : bidangRaw.includes('lomba')
                        ? 'bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/60 dark:text-purple-300'
                        : 'bg-pink-50 text-pink-700 border border-pink-200 dark:bg-pink-950/60 dark:text-pink-300'

                      return (
                        <TableRow key={item.id || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                          <TableCell className="text-center font-bold text-slate-600">{idx + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2.5">
                              <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 font-extrabold text-[11px] text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 shadow-2xs">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <span className="block font-extrabold text-slate-900 dark:text-white truncate">
                                  {item.nama_siswa}
                                </span>
                                <span className="block text-[11px] text-slate-500 font-mono">
                                  NIS: {item.nis} {item.kelas && item.kelas !== '-' ? `• ${item.kelas}` : ''}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.nama_prestasi}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${badgeTingkat}`}>
                              {item.tingkat_prestasi || item.tingkat || 'Internal Sekolah'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${badgeBidang}`}>
                              {item.jenis_prestasi || item.bidang || item.kategori || 'Akademik'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-bold text-emerald-600 dark:text-emerald-400">
                            {item.peringkat || (item.nilai_prestasi ? `Skor: ${item.nilai_prestasi}` : 'Juara')}
                          </TableCell>
                          <TableCell className="text-center font-mono text-slate-500">
                            {item.tahun || (item.tanggal_prestasi ? new Date(item.tanggal_prestasi).getFullYear() : '2026')}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </TableRoot>
            </div>
          </div>
        </div>
      )}

      {/* ── KONTEN SUB-TAB 3: KELULUSAN & ALUMNI (Gaya Card Mutasi dengan Warna Khusus) ── */}
      {activeSubTab === 'kelulusan' && (
        <div className="space-y-6">
          {/* ── 4 KPI Stat Cards for Kelulusan (Harmonized with HEROUI_ALUMNI_MUTASI_CARDS & MutasiSiswaScreen) ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Total Kelulusan (Emerald) */}
            <div className="relative overflow-hidden rounded-[20px] border-2 border-emerald-300/80 dark:border-emerald-700/60 bg-gradient-to-br from-emerald-50/70 via-teal-50/30 to-white dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 p-5 shadow-sm shadow-emerald-500/10">
              <div className="flex items-center justify-between mb-3">
                <div className="size-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25">
                  <School className="size-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  Total Alumni
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{angka(kelulusanKpi.total)}</p>
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">Total Kelulusan Siswa</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Akumulasi siswa & santri tamat</p>
            </div>

            {/* Card 2: Kelulusan per Tahun (Sky Blue) */}
            <div className="relative overflow-hidden rounded-[20px] border-2 border-sky-300/80 dark:border-sky-700/60 bg-gradient-to-br from-sky-50/70 via-blue-50/30 to-white dark:from-sky-950/40 dark:via-blue-950/20 dark:to-slate-900 p-5 shadow-sm shadow-sky-500/10">
              <div className="flex items-center justify-between mb-3">
                <div className="size-11 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/25">
                  <CalendarCheck className="size-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-300">
                  Angkatan 2026
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{angka(kelulusanKpi.tahunIni)}</p>
              <p className="text-xs font-bold text-sky-700 dark:text-sky-400 mt-0.5">Kelulusan per Tahun</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Lulusan aktif periode tahun ini</p>
            </div>

            {/* Card 3: Kelulusan per Unit (Amber) */}
            <div className="relative overflow-hidden rounded-[20px] border-2 border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-white dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900 p-5 shadow-sm shadow-amber-500/10">
              <div className="flex items-center justify-between mb-3">
                <div className="size-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
                  <Building2 className="size-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                  {kelulusanKpi.unitCount} Unit
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{angka(kelulusanKpi.unitCount)}</p>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">Kelulusan per Unit</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Distribusi kelulusan satuan pendidikan</p>
            </div>

            {/* Card 4: Tujuan Alumni (Royal Purple) */}
            <div className="relative overflow-hidden rounded-[20px] border-2 border-purple-300/80 dark:border-purple-700/60 bg-gradient-to-br from-purple-50/70 via-violet-50/30 to-white dark:from-purple-950/40 dark:via-violet-950/20 dark:to-slate-900 p-5 shadow-sm shadow-purple-500/10">
              <div className="flex items-center justify-between mb-3">
                <div className="size-11 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25">
                  <Compass className="size-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                  Tracer Study
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{angka(kelulusanKpi.lanjutStudi)}</p>
              <p className="text-xs font-bold text-purple-700 dark:text-purple-400 mt-0.5">Tujuan Alumni (Studi Lanjut)</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">PTN, Ma'had, PTS, & Karir</p>
            </div>
          </div>

          {/* 3-Column Equal Grid for Kelulusan */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
            {/* Filter Panel Kelulusan */}
            <article className="relative rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">Filter Kelulusan & Alumni</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setAlumniSearch('')
                      setAlumniYearFilter('semua')
                      setAlumniUnitFilter('semua')
                      setAlumniCategoryFilter('semua')
                    }}
                    className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Pencarian Alumni
                    </label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        value={alumniSearch}
                        onChange={(e) => setAlumniSearch(e.target.value)}
                        placeholder="Nama alumni, NIS, perguruan tinggi..."
                        className="w-full h-9 pl-8 pr-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Tahun Kelulusan
                    </label>
                    <HeroUiFilterSelect
                      value={alumniYearFilter}
                      onChange={(val) => setAlumniYearFilter(val)}
                      options={[
                        { value: 'semua', label: 'Semua Angkatan Kelulusan' },
                        ...alumniYears.map((yr) => ({ value: yr, label: `Angkatan Lulus ${yr}` })),
                      ]}
                      placeholder="Semua Angkatan Kelulusan"
                      icon={CalendarDays}
                      ariaLabel="Tahun Kelulusan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Kategori Tracer Study
                    </label>
                    <HeroUiFilterSelect
                      value={alumniCategoryFilter}
                      onChange={(val) => setAlumniCategoryFilter(val)}
                      options={[
                        { value: 'semua', label: 'Semua Kategori Tujuan' },
                        { value: 'ptn', label: 'PTN (Kampus Negeri)' },
                        { value: 'pts', label: 'PTS (Perguruan Tinggi Swasta)' },
                        { value: 'mahad', label: "Ma'had / Pondok Pesantren" },
                        { value: 'karir', label: 'Bekerja / Wirausaha' },
                      ]}
                      placeholder="Semua Kategori Tujuan"
                      icon={GraduationCap}
                      ariaLabel="Kategori Tracer Study"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                Menampilkan <span className="font-bold text-slate-800 dark:text-slate-200">{hasilFilterAlumni.length}</span> alumni terdata
              </div>
            </article>

            {/* Col 2: Tren Kelulusan Tahunan */}
            <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Tren Kelulusan Tahunan</h3>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Periode</span>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trenKelulusanTahunan}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
                    <XAxis dataKey="tahun" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="jumlah" fill="#059669" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </article>

            {/* Col 3: Komposisi Tujuan Alumni */}
            <article className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:bg-[#1B2433] p-5 sm:p-6 shadow-xs flex flex-col justify-between h-full">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Komposisi Tujuan Alumni</h3>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">Tracer</span>
              </div>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={komposisiTujuanAlumni}
                      innerRadius={45}
                      outerRadius={75}
                      dataKey="value"
                      paddingAngle={4}
                    >
                      {warnaPie.map((warna, i) => (
                        <Cell key={`cell-alumni-${i}`} fill={warna} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </article>
          </div>

          {/* Emerald Datatable Kelulusan & Alumni (Matching Mutasi Callout Box Style) */}
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
            <div className="flex flex-col gap-3 p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/90 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="size-4 text-emerald-600" />
                  Rincian Kelulusan & Tracer Study Alumni
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Rekapitulasi santri yang telah lulus beserta tujuan studi lanjut, ma'had, dan perguruan tinggi.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  {hasilFilterAlumni.length} Santri Lulus
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold"
                  onClick={() =>
                    exportCsv(
                      `rekap-kelulusan-alumni-${new Date().toISOString().slice(0, 10)}.csv`,
                      [
                        { key: 'full_name', label: 'Nama Santri' },
                        { key: 'nis', label: 'NIS' },
                        { key: 'unit', label: 'Unit' },
                        { key: 'tahun_lulus', label: 'Tahun Lulus' },
                        { key: 'tujuan', label: 'Tujuan Lanjutan' },
                      ],
                      hasilFilterAlumni.map((a) => ({
                        full_name: a.full_name || a.name || a.nama,
                        nis: a.nis || a.nisn || '-',
                        unit: a.education_unit?.name || a.unit || '-',
                        tahun_lulus: a.metadata?.tahun_lulus || a.tahun_lulus || '2026',
                        tujuan: a.metadata?.tujuan_kelulusan || a.metadata?.perguruan_tinggi || a.metadata?.status_lanjutan || '-',
                      }))
                    )
                  }
                >
                  <FileSpreadsheet className="h-4 w-4 mr-1.5" />
                  Ekspor Excel
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <TableRoot className="w-full">
                <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                  <TableRow>
                    <TableHead className="w-12 text-center text-xs font-black text-emerald-950 dark:text-emerald-200">NO</TableHead>
                    <TableHead className="text-xs font-black text-emerald-950 dark:text-emerald-200">SANTRI LULUSAN</TableHead>
                    <TableHead className="text-center text-xs font-black text-emerald-950 dark:text-emerald-200">NIS / NISN</TableHead>
                    <TableHead className="text-center text-xs font-black text-emerald-950 dark:text-emerald-200">UNIT ASAL</TableHead>
                    <TableHead className="text-center text-xs font-black text-emerald-950 dark:text-emerald-200">TAHUN LULUS</TableHead>
                    <TableHead className="text-xs font-black text-emerald-950 dark:text-emerald-200">TUJUAN LANJUTAN & TRACER STUDY</TableHead>
                    <TableHead className="text-center text-xs font-black text-emerald-950 dark:text-emerald-200">STATUS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs">
                  {hasilFilterAlumni.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10 text-slate-500">
                        Tidak ada data kelulusan yang sesuai dengan filter.
                      </TableCell>
                    </TableRow>
                  ) : (
                    hasilFilterAlumni.map((item, idx) => {
                      const nama = item.full_name || item.name || item.nama || 'Santri Lulusan'
                      const nis = item.nis || item.nisn || '-'
                      const unitName = item.education_unit?.name || item.unit || 'Unit Asal'
                      const meta = item.metadata || {}
                      const tahunLulus = meta.tahun_lulus || item.tahun_lulus || '2026'
                      const tujuanLanjutan = meta.tujuan_kelulusan || meta.perguruan_tinggi || meta.status_lanjutan || 'Perguruan Tinggi Negeri / Ma\'had Lanjutan'
                      const kategoriTujuan = meta.kategori_tujuan || meta.status_lanjutan || 'Studi Lanjut'

                      return (
                        <TableRow key={item.id || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                          <TableCell className="text-center font-bold text-slate-600">{idx + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-black text-xs shrink-0 border border-emerald-300/40">
                                {nama.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="font-extrabold text-slate-900 dark:text-white">{nama}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center font-mono font-semibold text-slate-600 dark:text-slate-400">
                            {nis}
                          </TableCell>
                          <TableCell className="text-center font-medium text-slate-700 dark:text-slate-300">
                            {unitName}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300/40">
                              Lulus {tahunLulus}
                            </span>
                          </TableCell>
                          <TableCell>
                            {/* Callout Detail Box matching MutasiSiswaScreen format */}
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 w-14">Tujuan:</span>
                                <span className="font-bold text-slate-800 dark:text-slate-100">{tujuanLanjutan}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 w-14">Kategori:</span>
                                <span className="text-purple-600 dark:text-purple-400 font-semibold">{kategoriTujuan}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                              Alumni Resmi
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </TableRoot>
            </div>
          </div>
        </div>
      )}

      {/* ── KONTEN SUB-TAB 4: MUTASI MASUK & KELUAR ──────────────────────────── */}
      {activeSubTab === 'mutasi' && (
        <div className="space-y-6">
          {/* 3 KPI Cards Mutasi */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="relative overflow-hidden rounded-[20px] border-2 border-amber-300/80 dark:border-amber-700/60 bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-white dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900 p-5 shadow-sm shadow-amber-500/10">
              <div className="flex items-center justify-between mb-3">
                <div className="size-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
                  <ArrowRightLeft className="size-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300">
                  Internal
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{angka(mutasiKpi.pindahUnit)}</p>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">Pindah Unit Internal</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Antar satuan pendidikan yayasan</p>
            </div>

            <div className="relative overflow-hidden rounded-[20px] border-2 border-rose-300/80 dark:border-rose-700/60 bg-gradient-to-br from-rose-50/70 via-pink-50/30 to-white dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900 p-5 shadow-sm shadow-rose-500/10">
              <div className="flex items-center justify-between mb-3">
                <div className="size-11 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-md shadow-rose-500/25">
                  <UserMinus className="size-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300">
                  Eksternal
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{angka(mutasiKpi.pindahKeluar)}</p>
              <p className="text-xs font-bold text-rose-700 dark:text-rose-400 mt-0.5">Pindah Keluar Sekolah</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Santri pindah ke luar yayasan</p>
            </div>

            <div className="relative overflow-hidden rounded-[20px] border-2 border-purple-300/80 dark:border-purple-700/60 bg-gradient-to-br from-purple-50/70 via-violet-50/30 to-white dark:from-purple-950/40 dark:via-violet-950/20 dark:to-slate-900 p-5 shadow-sm shadow-purple-500/10">
              <div className="flex items-center justify-between mb-3">
                <div className="size-11 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25">
                  <Users className="size-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300">
                  Arus Santri
                </span>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{angka(mutasiKpi.total)}</p>
              <p className="text-xs font-bold text-purple-700 dark:text-purple-400 mt-0.5">Total Mutasi Siswa</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Akumulasi permohonan mutasi</p>
            </div>
          </div>

          {/* Datatable Mutasi */}
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
            <div className="flex flex-col gap-3 p-4 sm:p-5 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-200/90 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <ArrowRightLeft className="size-4 text-emerald-600" />
                  Daftar Rekapitulasi Mutasi Santri
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Arus perpindahan siswa baik pindah unit internal maupun ke luar yayasan.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {hasilFilterMutasi.length} Santri Mutasi
              </span>
            </div>

            <div className="overflow-x-auto">
              <TableRoot className="w-full">
                <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90">
                  <TableRow>
                    <TableHead className="w-12 text-center text-xs font-black text-emerald-950 dark:text-emerald-200">NO</TableHead>
                    <TableHead className="text-xs font-black text-emerald-950 dark:text-emerald-200">SANTRI / SISWA</TableHead>
                    <TableHead className="text-center text-xs font-black text-emerald-950 dark:text-emerald-200">JENIS MUTASI</TableHead>
                    <TableHead className="text-xs font-black text-emerald-950 dark:text-emerald-200">TUJUAN PINDAH</TableHead>
                    <TableHead className="text-xs font-black text-emerald-950 dark:text-emerald-200">ALASAN</TableHead>
                    <TableHead className="text-center text-xs font-black text-emerald-950 dark:text-emerald-200">TANGGAL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs">
                  {hasilFilterMutasi.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-slate-500">
                        Tidak ada data mutasi yang cocok.
                      </TableCell>
                    </TableRow>
                  ) : (
                    hasilFilterMutasi.map((item, idx) => {
                      const studentName = item.student?.name || item.name || 'Santri'
                      const isUnit = Boolean(item.to_unit_id || item.metadata?.unit_tujuan)
                      const tujuan = item.metadata?.sekolah_tujuan || item.metadata?.unit_tujuan || item.to_unit?.name || 'Sekolah Lain'
                      const alasan = item.metadata?.alasan || item.alasan || 'Pindah domisili orang tua'
                      const tgl = item.metadata?.tgl_mutasi || (item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '2026')

                      return (
                        <TableRow key={item.id || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20">
                          <TableCell className="text-center font-bold text-slate-600">{idx + 1}</TableCell>
                          <TableCell className="font-extrabold text-slate-900 dark:text-white">
                            {studentName}
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                                isUnit
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {isUnit ? 'Pindah Unit' : 'Pindah Keluar'}
                            </span>
                          </TableCell>
                          <TableCell className="font-bold text-slate-800 dark:text-slate-200">{tujuan}</TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400">{alasan}</TableCell>
                          <TableCell className="text-center font-mono text-slate-500">{tgl}</TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </TableRoot>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
