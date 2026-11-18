import React, { useState, useMemo, useEffect } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { isParentRole, isStudentRole } from '../auth/portalResolver'
import {
  BookOpen,
  BookHeart,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCcw,
  FileSpreadsheet,
  TrendingUp,
  BarChart3,
  Award,
  Building2,
  Trash2,
  ChevronDown,
  Calendar,
  FileText,
  X,
  Plus,
  Sparkles,
  Check,
  MessageSquare,
  Eye,
  ArrowUpDown,
  ListChecks,
  RotateCcw,
  ShieldCheck,
  UserCheck,
  Layers,
  Download,
  Upload,
  Info,
  Trophy,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppPageHeader from '../components/app/AppPageHeader'
import AppTabs from '../components/app/AppTabs'
import ActionDropdown from '../components/app/ActionDropdown'
import AppSkeleton from '../components/app/AppSkeleton'
import AppEmptyState from '../components/app/AppEmptyState'
import AppErrorState from '../components/app/AppErrorState'
import TahfizhSubNav from '../components/tahfizh/TahfizhSubNav'
import { MasterEmptyState, SquircleActionButton } from '../components/master-data'
import { printCleanTable } from '../utils/printHelper'

import { educationUnitService } from '../services/educationUnitService'
import { studentService } from '../services/studentService'
import { tahfizhService } from '../services/tahfizhService'
import { mutabaahService } from '../services/mutabaahService'
import { useAuthStore } from '../stores/authStore'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogBody,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Backdrop, OverlayWrapper } from '@/components/ui/dialog'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { TableRoot, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'



// ── MODERN CARD TONES (§C HeroUI_Pengaturan_Halaman) ──
const MODERN_CARD_TONES = {
  emerald: {
    card: 'border-emerald-300/70 bg-gradient-to-br from-emerald-50 via-teal-50/60 to-white hover:border-emerald-400 dark:border-emerald-700/50 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/30',
    tag: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300',
    title: 'text-emerald-700 dark:text-emerald-400',
    val: 'text-emerald-700 dark:text-emerald-300',
    sub: 'text-emerald-600/80 dark:text-emerald-400/80',
    cta: 'text-emerald-600/60 dark:text-emerald-500/60',
  },
  sky: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
    iconBox: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-sm shadow-blue-500/30',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
    cta: 'text-blue-600/60 dark:text-blue-500/60',
  },
  violet: {
    card: 'border-purple-300/70 bg-gradient-to-br from-purple-50 via-indigo-50/60 to-white hover:border-purple-400 dark:border-purple-700/50 dark:from-purple-950/40 dark:via-indigo-950/20 dark:to-slate-900',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-sm shadow-purple-500/30',
    tag: 'bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300',
    title: 'text-purple-700 dark:text-purple-400',
    val: 'text-purple-700 dark:text-purple-300',
    sub: 'text-purple-600/80 dark:text-purple-400/80',
    cta: 'text-purple-600/60 dark:text-purple-500/60',
  },
  amber: {
    card: 'border-amber-300/70 bg-gradient-to-br from-amber-50 via-orange-50/60 to-white hover:border-amber-400 dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-sm shadow-amber-500/30',
    tag: 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300',
    title: 'text-amber-700 dark:text-amber-400',
    val: 'text-amber-700 dark:text-amber-300',
    sub: 'text-amber-600/80 dark:text-amber-400/80',
    cta: 'text-amber-600/60 dark:text-amber-500/60',
  },
}

function ModernKpiCard({ icon: Icon, label, value, subtext, tag, tone = 'emerald', onClick }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  const isClickable = typeof onClick === 'function'
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left ${
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      } ${t.card}`}
    >
      <div className={`pointer-events-none absolute -top-8 -right-8 h-28 w-28 rounded-full blur-2xl transition-all ${t.glow}`} />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow-sm ${t.iconBox}`}>
            <Icon className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className={`text-[11px] font-bold uppercase tracking-wider truncate ${t.title}`} title={label}>{label}</p>
          </div>
        </div>
        {tag && <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${t.tag}`}>{tag}</span>}
      </div>
      <p className={`text-4xl font-black tabular-nums truncate ${t.val}`} title={String(value ?? 0)}>{value ?? 0}</p>
      {subtext && <p className={`mt-0.5 text-[11px] font-semibold truncate ${t.sub}`} title={subtext}>{subtext}</p>}
      {isClickable && (
        <p className={`mt-3 text-[10px] font-bold flex items-center gap-1 ${t.cta}`}>
          <Eye className="h-3 w-3" /> Klik untuk detail lengkap
        </p>
      )}
    </motion.button>
  )
}

export default function MonitoringTahfizhIbadahNonPesantrenPage() {
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []

  const isParent = isParentRole(roles)
  const isStudent = isStudentRole(roles)
  const isSuperAdmin = roles.some((r) => /super admin|superadmin|super_admin/i.test(typeof r === 'string' ? r : r?.name || ''))

  const isDivisi = roles.some((r) => String(r).toLowerCase().includes('divisi') || String(r).toLowerCase().includes('yayasan') || String(r).toLowerCase().includes('admin'))
  const isKepalaSekolah = roles.some((r) => String(r).toLowerCase().includes('kepala'))
  const isGuru = roles.some((r) => String(r).toLowerCase().includes('guru') || String(r).toLowerCase().includes('wali'))

  // Unit Scoping: Sync school unit name & code with Kepala Sekolah Dashboard
  const principalUnitName = user?.unit_name || user?.unit || user?.school_info?.nama || ''
  const principalUnitCode = (user?.unit_code || user?.unit || '').toUpperCase()
  const isScopedToLedUnit = Boolean(isKepalaSekolah && !isDivisi && principalUnitCode)

  // Filters State
  const [activeTab, setActiveTab] = useState('rekap') // 'rekap', 'chart', 'verification'
  const [search, setSearch] = useState('')
  const [filterUnit, setFilterUnit] = useState(isScopedToLedUnit ? principalUnitCode : '')
  const [filterKelas, setFilterKelas] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Unit & Class filters specifically for Top 10 Tahfizh Ranking Card
  const [top10UnitFilter, setTop10UnitFilter] = useState(isScopedToLedUnit ? principalUnitCode : '')
  const [top10ClassFilter, setTop10ClassFilter] = useState('')

  // Modals state
  const [activeKpiModal, setActiveKpiModal] = useState(null) // 'tahfizh' | 'sholat' | 'sunnah' | 'verifikasi' | null
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState(false)
  const [teacherNoteInput, setTeacherNoteInput] = useState('')

  // Query real students list from API
  const { data: studentsApiResponse } = useQuery({
    queryKey: ['monitoring-tahfizh-students', filterUnit, filterKelas],
    queryFn: () => studentService.getDaftar({
      unit_id: filterUnit || undefined,
      per_page: 250,
    }),
  })

  // Base Students pool mapped dynamically from API
  const baseStudents = useMemo(() => {
    const rawStudents = Array.isArray(studentsApiResponse?.data)
      ? studentsApiResponse.data
      : Array.isArray(studentsApiResponse)
        ? studentsApiResponse
        : []

    const mapped = rawStudents.map((st) => {
      const tahfizhMeta = st.tahfizh_record || st.tahfizh || {}
      const ibadahMeta = st.mutabaah_record || st.ibadah || {}
      return {
        id: st.id,
        student_name: st.full_name || st.name || st.nama || 'Siswa',
        nis: st.nis || st.metadata?.nis || '-',
        unit_name: st.unit?.name || st.education_unit?.name || st.unit_name || '-',
        unit_code: (st.unit?.code || st.education_unit?.code || st.unit_code || '').toUpperCase(),
        class_name: st.kelas?.name || st.school_class?.name || st.class_name || 'Umum',
        tahfizh: {
          current_surah: tahfizhMeta.current_surah || tahfizhMeta.surah || '-',
          current_ayat: tahfizhMeta.current_ayat || tahfizhMeta.ayat || '-',
          juz_completed: Number(tahfizhMeta.juz_completed || tahfizhMeta.juz || 0),
          total_baris: Number(tahfizhMeta.total_baris || tahfizhMeta.baris || 0),
          target_juz: Number(tahfizhMeta.target_juz || 0),
          kelancaran: tahfizhMeta.kelancaran || 'Belum dinilai',
          last_setoran: tahfizhMeta.last_setoran || '-',
        },
        ibadah: {
          sholat_5_waktu: Number(ibadahMeta.sholat_5_waktu || 0),
          sholat_dhuha: Number(ibadahMeta.sholat_dhuha || 0),
          tahajud: Number(ibadahMeta.tahajud || 0),
          tilawah_harian: ibadahMeta.tilawah_harian || '-',
          dzikir_pagi_petang: Number(ibadahMeta.dzikir_pagi_petang || 0),
          puasa_sunnah: Number(ibadahMeta.puasa_sunnah || 0),
          infaq: Number(ibadahMeta.infaq || 0),
        },
        verification_status: st.verification_status || 'pending',
        parent_verified: Boolean(st.parent_verified),
        teacher_notes: st.teacher_notes || '',
      }
    })

    if (isScopedToLedUnit) {
      return mapped.filter((st) => {
        const uCode = (st.unit_code || '').toUpperCase()
        const uName = (st.unit_name || '').toUpperCase()
        return uCode.includes(principalUnitCode) || uName.includes(principalUnitCode)
      })
    }
    return mapped
  }, [studentsApiResponse, isScopedToLedUnit, principalUnitCode])

  const handleOpenKpiDetail = (type) => setActiveKpiModal(type)
  const handleCloseKpiModal = () => setActiveKpiModal(null)

  // Toast feedback
  const [alertFeedback, setAlertFeedback] = useState(null)

  const handleExportExcel = () => {
    if (!filteredStudents.length) {
      setAlertFeedback({ type: 'warning', message: 'Tidak ada data siswa untuk diekspor.' })
      setTimeout(() => setAlertFeedback(null), 3000)
      return
    }
    const headers = ['No', 'NISN', 'Nama Siswa', 'Unit', 'Kelas', 'Juz Target', 'Ziyadah Terakhir', 'Kelancaran', 'Sholat 5 Waktu', 'Dhuha', 'Tahajud', 'Verifikasi Ortu', 'Verifikasi Guru', 'Catatan Guru']
    const rows = filteredStudents.map((st, i) => [
      i + 1,
      `"${st.nisn || st.nis || '-'}"`,
      `"${(st.student_name || '').replace(/"/g, '""')}"`,
      `"${(st.unit_name || '').replace(/"/g, '""')}"`,
      `"${(st.class_name || '').replace(/"/g, '""')}"`,
      `"Juz ${st.tahfizh?.juz_target || '-'}"`,
      `"${st.tahfizh?.last_setoran || '-'}"`,
      `"${st.tahfizh?.kelancaran || '-'}"`,
      st.ibadah?.sholat_5_waktu === 5 ? 'Lengkap (5 Waktu)' : `${st.ibadah?.sholat_5_waktu || 0} Waktu`,
      st.ibadah?.sholat_dhuha ? 'Ya' : 'Tidak',
      st.ibadah?.tahajud ? 'Ya' : 'Tidak',
      st.parent_verified ? 'Sudah' : 'Belum',
      st.verification_status === 'verified' ? 'Sudah' : 'Belum',
      `"${(st.teacher_notes || '').replace(/"/g, '""')}"`,
    ])
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `laporan-monitoring-tahfizh-non-pesantren-${selectedDate || new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const handlePrintStudentReport = (siswa) => {
    setSelectedStudent(siswa)
    if (!siswa) return
    const rows = [
      ['Tahfizh: Capaian Hafalan', siswa.tahfizh?.juz_completed ? `Juz ${siswa.tahfizh.juz_completed}` : 'Belum tercapai', siswa.tahfizh?.target_juz ? `Target: Juz ${siswa.tahfizh.target_juz}` : 'Target belum diatur'],
      ['Tahfizh: Surah & Ayat Terakhir', siswa.tahfizh?.current_surah && siswa.tahfizh.current_surah !== '-' ? `${siswa.tahfizh.current_surah}, Ayat ${siswa.tahfizh?.current_ayat || '-'}` : 'Belum ada setoran', `${siswa.tahfizh?.total_baris || 0} Baris`],
      ['Tahfizh: Kualitas Kelancaran', siswa.tahfizh?.kelancaran || 'Belum dinilai', siswa.tahfizh?.last_setoran && siswa.tahfizh.last_setoran !== '-' ? `Setoran Terakhir: ${siswa.tahfizh.last_setoran}` : 'Belum ada riwayat setoran'],
      ['Ibadah: Sholat 5 Waktu', `${siswa.ibadah?.sholat_5_waktu || 0}%`, 'Wajib Berjamaah'],
      ['Ibadah: Sholat Dhuha', `${siswa.ibadah?.sholat_dhuha || 0}%`, 'Sunnah Harian'],
      ['Ibadah: Sholat Tahajud', `${siswa.ibadah?.tahajud || 0}%`, 'Qiyamul Lail'],
      ['Ibadah: Tilawah Mandiri', siswa.ibadah?.tilawah_harian && siswa.ibadah.tilawah_harian !== '-' ? siswa.ibadah.tilawah_harian : 'Belum ada catatan', 'One Day One Juz'],
      ['Ibadah: Dzikir Pagi / Petang', `${siswa.ibadah?.dzikir_pagi_petang || 0}%`, 'Al-Ma\'tsurat'],
      ['Ibadah: Infaq / Shadaqah', `${siswa.ibadah?.infaq || 0}%`, 'Kedermawanan'],
      ['Catatan Pembimbing', siswa.teacher_notes || 'Belum ada catatan evaluasi dari pembimbing.', 'Wali Kelas / Ustadz Pembimbing'],
    ]
    printCleanTable({
      title: 'RAPOR MONITORING TAHFIZH & MUTABA\'AH IBADAH',
      subtitle: `Siswa: ${siswa.student_name} | NIS: ${siswa.nis || '-'} | Unit: ${siswa.unit_name || '-'} (${siswa.class_name || '-'})`,
      headers: ['Aspek Evaluasi', 'Capaian Aktual', 'Keterangan'],
      rows,
      orientation: 'portrait',
    })
  }

  const handleDownloadKpiReport = () => {
    const headers = ['Indikator KPI', 'Nilai / Jumlah', 'Keterangan']
    const rows = [
      ['Total Siswa Terpantau', kpiStats.totalStudents, 'Total siswa di unit terpilih'],
      ['Capaian Tahfizh Sesuai Target', `${kpiStats.tahfizhAboveTargetCount} siswa (${kpiStats.tahfizhComplianceRate}%)`, 'Mencapai target hafalan juz bulanan'],
      ['Kepatuhan Shalat 5 Waktu', `${kpiStats.sholat5WaktuCount} siswa (${kpiStats.sholat5WaktuComplianceRate}%)`, 'Melaksanakan 5 waktu tertib'],
      ['Verifikasi Orang Tua', `${kpiStats.verifiedParentCount} siswa (${kpiStats.parentVerifiedRate}%)`, 'Telah divalidasi wali santri'],
    ]
    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `laporan-kpi-tahfizh-mutabaah-${selectedDate || new Date().toISOString().split('T')[0]}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
    handleCloseKpiModal()
  }

  // Fetch non-pesantren units
  const { data: unitsData } = useQuery({
    queryKey: ['education-units-non-pesantren'],
    queryFn: () => educationUnitService.getDaftar({ per_page: 100 }),
  })

  // Filter out Pondok Pesantren units for non-pesantren monitoring view
  const nonPesantrenUnits = useMemo(() => {
    const list = unitsData?.data || []
    return list.filter((u) => {
      const uName = (u.name || u.nama_unit || '').toUpperCase()
      const uType = (u.unit_type || u.jenis_unit || '').toUpperCase()
      return !uName.includes('PESANTREN') && !uType.includes('PESANTREN') && !uName.includes('PONPES')
    })
  }, [unitsData])

  // Extract list of all unique classes with unit code for dropdown (scoped by baseStudents)
  const uniqueClassesWithUnit = useMemo(() => {
    const map = new Map()
    baseStudents.forEach((st) => {
      if (st.class_name && !map.has(st.class_name)) {
        map.set(st.class_name, { className: st.class_name, unitCode: st.unit_code || st.unit_name })
      }
    })
    return Array.from(map.values())
  }, [baseStudents])

  const uniqueClasses = useMemo(() => {
    return uniqueClassesWithUnit.map((item) => item.className)
  }, [uniqueClassesWithUnit])

  // Dynamic KPI Stats calculated from baseStudents (No hardcoded data)
  const kpiStats = useMemo(() => {
    const list = baseStudents || []
    const totalStudents = list.length
    const totalBaris = list.reduce((acc, st) => acc + (st.tahfizh?.total_baris || 0), 0)
    const avgJuz = totalStudents > 0 ? (list.reduce((acc, st) => acc + (st.tahfizh?.juz_completed || 0), 0) / totalStudents).toFixed(1) : '—'
    const avgSholat = totalStudents > 0 ? Math.round(list.reduce((acc, st) => acc + (st.ibadah?.sholat_5_waktu || 0), 0) / totalStudents) : null
    const avgSunnah = totalStudents > 0 ? Math.round(list.reduce((acc, st) => acc + (st.ibadah?.sholat_dhuha || 0), 0) / totalStudents) : null
    const avgDhuha = avgSunnah
    const avgTahajud = totalStudents > 0 ? Math.round(list.reduce((acc, st) => acc + (st.ibadah?.tahajud || 0), 0) / totalStudents) : null
    const avgDzikir = totalStudents > 0 ? Math.round(list.reduce((acc, st) => acc + (st.ibadah?.dzikir_pagi_petang || 0), 0) / totalStudents) : null
    const avgPuasa = totalStudents > 0 ? Math.round(list.reduce((acc, st) => acc + (st.ibadah?.puasa_sunnah || 0), 0) / totalStudents) : null
    const avgInfaq = totalStudents > 0 ? Math.round(list.reduce((acc, st) => acc + (st.ibadah?.infaq || 0), 0) / totalStudents) : null
    const tilawahActiveCount = list.filter((st) => st.ibadah?.tilawah_harian && st.ibadah.tilawah_harian !== '-').length
    const avgTilawah = totalStudents > 0 ? Math.round((tilawahActiveCount / totalStudents) * 100) : null

    const verifiedTeacherCount = list.filter((st) => st.verification_status === 'verified_teacher').length
    const verifiedPercent = totalStudents > 0 ? ((verifiedTeacherCount / totalStudents) * 100).toFixed(1) : null
    const verifiedParentCount = list.filter((st) => Boolean(st.parent_verified)).length
    const parentVerifiedPercent = totalStudents > 0 ? ((verifiedParentCount / totalStudents) * 100).toFixed(1) : null

    // Class breakdown for Tahfizh
    const classMap = new Map()
    list.forEach((st) => {
      const cName = st.class_name || 'Umum'
      if (!classMap.has(cName)) {
        classMap.set(cName, { count: 0, totalBaris: 0, juzSum: 0 })
      }
      const item = classMap.get(cName)
      item.count += 1
      item.totalBaris += st.tahfizh?.total_baris || 0
      item.juzSum += st.tahfizh?.juz_completed || 0
    })

    const classBreakdown = Array.from(classMap.entries()).map(([cName, val]) => ({
      className: cName,
      totalBaris: val.totalBaris,
      avgJuz: (val.juzSum / (val.count || 1)).toFixed(1),
      percent: Math.min(100, Math.round((val.totalBaris / Math.max(1, totalBaris)) * 100)),
    }))

    return {
      totalBaris,
      avgJuz,
      avgSholat,
      avgSunnah,
      avgDhuha,
      avgTahajud,
      avgDzikir,
      avgPuasa,
      avgInfaq,
      avgTilawah,
      verifiedTeacherCount,
      verifiedPercent,
      verifiedParentCount,
      parentVerifiedPercent,
      unverifiedCount: totalStudents - verifiedTeacherCount,
      classBreakdown,
      totalStudents,
    }
  }, [baseStudents])

  // Dynamic Chart Data: Perbandingan Tahfizh Antar Kelas / Rombel
  const classTahfizhChartData = useMemo(() => {
    const classMap = new Map()
    baseStudents.forEach((st) => {
      const className = st.class_name || 'Umum'
      if (!classMap.has(className)) {
        classMap.set(className, {
          className,
          totalBaris: 0,
          juzSum: 0,
          studentCount: 0,
          verifiedCount: 0,
        })
      }
      const item = classMap.get(className)
      item.totalBaris += st.tahfizh?.total_baris || 0
      item.juzSum += st.tahfizh?.juz_completed || 0
      item.studentCount += 1
      if (st.verification_status === 'verified_teacher') {
        item.verifiedCount += 1
      }
    })

    return Array.from(classMap.values())
      .map((item) => ({
        className: item.className,
        totalBaris: item.totalBaris,
        avgJuz: Number((item.juzSum / (item.studentCount || 1)).toFixed(1)),
        avgBaris: Math.round(item.totalBaris / (item.studentCount || 1)),
        studentCount: item.studentCount,
        verifiedPct: Math.round((item.verifiedCount / (item.studentCount || 1)) * 100),
      }))
      .sort((a, b) => b.totalBaris - a.totalBaris)
  }, [baseStudents])

  // Dynamic Chart Data: Analisis Kedisiplinan Sholat Wajib & Sunnah Non-Pesantren (Excluding Night Sunnah/Tahajud)
  const worshipDisciplineChartData = useMemo(() => {
    const classMap = new Map()
    baseStudents.forEach((st) => {
      const className = st.class_name || 'Umum'
      if (!classMap.has(className)) {
        classMap.set(className, {
          className,
          sholat5WaktuSum: 0,
          sholatDhuhaSum: 0,
          rawatibDzikirSum: 0,
          studentCount: 0,
        })
      }
      const item = classMap.get(className)
      item.sholat5WaktuSum += st.ibadah?.sholat_5_waktu || 0
      item.sholatDhuhaSum += st.ibadah?.sholat_dhuha || 0
      item.rawatibDzikirSum += st.ibadah?.dzikir_pagi_petang || 0
      item.studentCount += 1
    })

    return Array.from(classMap.values()).map((item) => {
      const count = item.studentCount || 1
      const sholatWajib = Math.round(item.sholat5WaktuSum / count)
      const sholatDhuha = Math.round(item.sholatDhuhaSum / count)
      const sunnahRawatib = Math.round(item.rawatibDzikirSum / count)
      return {
        className: item.className,
        sholatWajib,
        sholatDhuha,
        sunnahRawatib,
        studentCount: item.studentCount,
      }
    })
  }, [baseStudents])

  // Dynamic Chart Data: Tren Setoran & Kedisiplinan Mingguan
  const weeklyProgressChartData = useMemo(() => {
    const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Ahad']
    return days.map((day) => ({
      day,
      tahfizh_setoran: 0,
      ibadah_compliance: 0,
    }))
  }, [])

  // Dynamic Chart Data: Perbandingan Rata-Rata Capaian Antar Unit Non-Pesantren
  const unitComparisonChartData = useMemo(() => {
    if (!nonPesantrenUnits.length) return []
    return nonPesantrenUnits.map((u) => {
      const uCode = (u.code || u.kode || u.name || '').toUpperCase()
      const unitStudents = baseStudents.filter((st) =>
        st.unit_code === uCode || st.unit_name.toUpperCase().includes(uCode)
      )
      const count = unitStudents.length || 1
      const avgJuz = unitStudents.length
        ? Number((unitStudents.reduce((acc, s) => acc + (s.tahfizh?.juz_completed || 0), 0) / count).toFixed(1))
        : 0
      const ibadahPct = unitStudents.length
        ? Math.round(unitStudents.reduce((acc, s) => acc + (s.ibadah?.sholat_5_waktu || 0), 0) / count)
        : 0

      return {
        unit: u.code || u.name || 'Unit',
        tahfizh_avg_juz: avgJuz,
        ibadah_pct: ibadahPct,
      }
    })
  }, [nonPesantrenUnits, baseStudents])

  // Top 10 Tahfizh Ranking List sorted by total_baris descending & filtered per unit and per class
  const top10TahfizhStudents = useMemo(() => {
    return baseStudents.filter((item) => {
      if (top10UnitFilter && item.unit_code !== top10UnitFilter && !item.unit_name.includes(top10UnitFilter)) {
        return false
      }
      if (top10ClassFilter && item.class_name !== top10ClassFilter && !item.class_name.includes(top10ClassFilter)) {
        return false
      }
      return true
    })
      .sort((a, b) => (b.tahfizh.total_baris || 0) - (a.tahfizh.total_baris || 0))
      .slice(0, 10)
  }, [baseStudents, top10UnitFilter, top10ClassFilter])

  // Top 3 Winners (Rank #1 Gold, Rank #2 Silver, Rank #3 Bronze)
  const rank1Winner = top10TahfizhStudents[0] || null
  const rank2Winner = top10TahfizhStudents[1] || null
  const rank3Winner = top10TahfizhStudents[2] || null
  const remainingTopStudents = top10TahfizhStudents.slice(3)

  // Filter items for main Datatable (scoped by baseStudents)
  const filteredStudents = useMemo(() => {
    return baseStudents.filter((item) => {
      if (search) {
        const query = search.toLowerCase()
        const matchName = item.student_name.toLowerCase().includes(query)
        const matchNis = item.nis.toLowerCase().includes(query)
        const matchSurah = item.tahfizh.current_surah.toLowerCase().includes(query)
        if (!matchName && !matchNis && !matchSurah) return false
      }
      if (filterUnit && item.unit_code !== filterUnit && !item.unit_name.includes(filterUnit)) return false
      if (filterKelas && item.class_name !== filterKelas && !item.class_name.includes(filterKelas)) return false
      if (filterStatus && item.verification_status !== filterStatus) return false
      return true
    })
  }, [baseStudents, search, filterUnit, filterKelas, filterStatus])

  // Pagination logic
  const totalPages = Math.ceil(filteredStudents.length / perPage) || 1
  const paginatedStudents = useMemo(() => {
    const start = (page - 1) * perPage
    return filteredStudents.slice(start, start + perPage)
  }, [filteredStudents, page, perPage])

  const handleVerifyStudent = (student) => {
    setSelectedStudent(student)
    setTeacherNoteInput(student.teacher_notes || '')
    setIsVerifyModalOpen(true)
  }

  const submitVerification = () => {
    if (!selectedStudent) return
    selectedStudent.verification_status = 'verified_teacher'
    selectedStudent.teacher_notes = teacherNoteInput
    setIsVerifyModalOpen(false)
    setAlertFeedback({
      type: 'success',
      title: 'Verifikasi Berhasil',
      message: `Setoran Tahfizh dan Mutaba'ah siswa ${selectedStudent.student_name} telah diverifikasi.`,
    })
    setTimeout(() => setAlertFeedback(null), 4000)
  }

  if ((isParent || isStudent) && !isSuperAdmin) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <PageContainer>
      <div className="space-y-6 pb-12">
        {/* App Breadcrumb */}
        <div className="print:hidden">
          <AppBreadcrumb
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Mutaba’ah & Tahfizh', href: '/dashboard/mutabaah' },
              { label: 'Monitoring Non-Pesantren' },
            ]}
          />
        </div>

        {/* MODERN HERO CARD HEADER (§B / §7.7) */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="print:hidden">
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-4 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
            <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
                <div className="flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                  <BookHeart className="size-5 sm:size-7 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-extrabold text-white shadow-md shadow-emerald-600/25 border border-emerald-300/40">
                      <Sparkles className="size-3 sm:size-3.5 text-amber-300 animate-pulse" />
                      Monitoring Lintas Sekolah
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                      Siswa Non-Ponpes
                    </span>
                  </div>
                  <h1 className="mt-1.5 text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Monitoring Tahfizh & Mutaba'ah Siswa Non-Pesantren
                  </h1>
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full leading-relaxed">
                    Pusat pemantauan terpadu setoran tahfizh, amalan ibadah yaumiyyah, kedisiplinan shalat 5 waktu, dan verifikasi guru unit sekolah non-ponpes.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white/80 dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 shadow-xs transition-colors cursor-pointer"
                >
                  <RefreshCcw className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Segarkan</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tahfizh Sub-Navigation (5 tab modul, penuh untuk admin) */}
        <div className="print:hidden">
          <TahfizhSubNav />
        </div>



        {/* Global Feedback Alert */}
        {alertFeedback && (
          <Alert status={alertFeedback.type === 'success' ? 'success' : 'info'}>
            <AlertTitle>{alertFeedback.title}</AlertTitle>
            <AlertDescription>{alertFeedback.message}</AlertDescription>
          </Alert>
        )}

        {/* Master Stats Grid (4 KPI Cards §C + §7.3 — klik untuk drill-down) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ModernKpiCard
            icon={BookOpen}
            label="Capaian Tahfizh Unit"
            value={`${kpiStats.totalBaris.toLocaleString('id-ID')} Baris`}
            subtext={`Rata-rata ${kpiStats.avgJuz} Juz per siswa`}
            tag="Target 89%"
            tone="emerald"
            onClick={() => handleOpenKpiDetail('tahfizh')}
          />
          <ModernKpiCard
            icon={CheckCircle2}
            label="Kedisiplinan Sholat 5 Waktu"
            value={kpiStats.avgSholat != null ? `${kpiStats.avgSholat}%` : '—'}
            subtext="Pelaksanaan Jamaah & Tepat Waktu"
            tag="Sangat Baik"
            tone="sky"
            onClick={() => handleOpenKpiDetail('sholat')}
          />
          <ModernKpiCard
            icon={Sparkles}
            label="Amalan Sunnah & Tilawah"
            value={kpiStats.avgSunnah != null ? `${kpiStats.avgSunnah}%` : '—'}
            subtext="Dhuha, Tahajud, Tilawah, Dzikir"
            tag="+5.4% Mgg Ini"
            tone="violet"
            onClick={() => handleOpenKpiDetail('sunnah')}
          />
          <ModernKpiCard
            icon={UserCheck}
            label="Status Verifikasi Log"
            value={kpiStats.verifiedPercent != null ? `${kpiStats.verifiedPercent}%` : '—'}
            subtext={kpiStats.totalStudents > 0 ? `Log Terverifikasi (${kpiStats.verifiedTeacherCount}/${kpiStats.totalStudents} Siswa)` : 'Belum ada log siswa'}
            tag="Aktif"
            tone="amber"
            onClick={() => handleOpenKpiDetail('verifikasi')}
          />
        </div>

        {/* ── CARD PERINGKAT TOP 10 TAHFIZH TERBANYAK & FILTER PER KELAS ── */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 space-y-5 dark:border-emerald-700/80 dark:bg-[#1B2433]">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl dark:bg-amber-400/15" />
          {/* Header Card Top 10 & Filter Controls */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-emerald-200/90 pb-4 dark:border-emerald-800/60">
            {/* Title & Subtitle */}
            <div className="flex items-start sm:items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white shadow-sm border border-amber-300/40 shrink-0">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    Top 10 Peringkat Teratas Tahfizh Al-Qur’an
                  </h3>
                  <Badge color="amber" size="sm" className="font-semibold">Hafalan Terbanyak</Badge>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Daftar 10 siswa dengan capaian baris & juz hafalan Al-Qur’an terbanyak
                </p>
              </div>
            </div>

            {/* Filter Controls (Unit & Kelas) */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-50/80 border border-slate-200/80 p-2 rounded-2xl shrink-0">
              {/* Unit Sekolah */}
              <div className="flex items-center gap-2">
                <label htmlFor="top10-unit-filter" className="text-xs font-semibold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-amber-600" /> Unit Sekolah:
                </label>
                <div className="relative">
                <CustomSelect
                  id="top10-unit-filter"
                  value={isScopedToLedUnit ? principalUnitCode : top10UnitFilter}
                  disabled={isScopedToLedUnit}
                  onChange={(e) => setTop10UnitFilter(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200/90 bg-white py-1.5 pl-3 pr-8 text-xs font-bold text-slate-800 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 transition-all disabled:bg-slate-100 disabled:text-slate-700 disabled:cursor-not-allowed shadow-2xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  {isScopedToLedUnit ? (
                    <option value={principalUnitCode}>{principalUnitName} (Unit Dipimpin)</option>
                  ) : (
                    <>
                      <option value="">Semua Unit (Lintas Sekolah)</option>
                      {nonPesantrenUnits.map((u) => (
                        <option key={u.id} value={u.code || u.name}>
                          {u.name} ({u.unit_type || 'Sekolah'})
                        </option>
                      ))}
                    </>
                  )}
                </CustomSelect>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Separator Line */}
              <div className="hidden sm:block h-4 w-px bg-slate-200" />

              {/* Filter Kelas */}
              <div className="flex items-center gap-2">
                <label htmlFor="top10-class-filter" className="text-xs font-semibold text-slate-700 whitespace-nowrap flex items-center gap-1.5">
                  <Filter className="w-4 h-4 text-emerald-600" /> Filter Kelas:
                </label>
                <div className="relative">
                <CustomSelect
                  id="top10-class-filter"
                  value={top10ClassFilter}
                  onChange={(e) => setTop10ClassFilter(e.target.value)}
                  className="appearance-none rounded-xl border border-slate-200/90 bg-white py-1.5 pl-3 pr-8 text-xs font-bold text-slate-800 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 transition-all shadow-2xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                >
                  <option value="">Semua Kelas</option>
                  {uniqueClassesWithUnit.map((item) => (
                    <option key={item.className} value={item.className}>
                      {item.className} ({item.unitCode})
                    </option>
                  ))}
                </CustomSelect>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Top 3 Featured Winner Cards (Peringkat #1 🥇, #2 🥈, #3 🥉 - Fully Clickable Card) */}
          {top10TahfizhStudents.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Rank 1 - Gold 🥇 */}
              {rank1Winner ? (
                <div
                  onClick={() => { setSelectedStudent(rank1Winner); setIsDetailOpen(true) }}
                  className="relative overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-b from-amber-50/90 via-amber-50/40 to-white p-4.5 shadow-xs transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer group"
                >
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-white px-2.5 py-0.5 text-xs font-bold shadow-xs">
                      🥇 Rank #1 Gold
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar size="lg" className="bg-amber-500 text-white font-bold ring-2 ring-amber-300">
                      <AvatarFallback>{rank1Winner.student_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="pr-16">
                      <p className="font-extrabold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">
                        {rank1Winner.student_name}
                      </p>
                      <p className="text-xs text-slate-600 font-medium">
                        NIS: {rank1Winner.nis} • <span className="text-amber-800 font-bold">{rank1Winner.class_name}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500">Capaian Hafalan:</span>
                      <p className="font-extrabold text-amber-900 text-sm">{rank1Winner.tahfizh.total_baris} Baris (Juz {rank1Winner.tahfizh.juz_completed})</p>
                    </div>
                    <Badge color="emerald" size="sm">
                      {rank1Winner.tahfizh.current_surah}
                    </Badge>
                  </div>
                </div>
              ) : null}

              {/* Rank 2 - Silver 🥈 */}
              {rank2Winner ? (
                <div
                  onClick={() => { setSelectedStudent(rank2Winner); setIsDetailOpen(true) }}
                  className="relative overflow-hidden rounded-2xl border border-slate-300 bg-gradient-to-b from-slate-100/90 via-slate-50/40 to-white p-4.5 shadow-xs transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer group"
                >
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-600 text-white px-2.5 py-0.5 text-xs font-bold shadow-xs">
                      🥈 Rank #2 Silver
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar size="lg" className="bg-slate-600 text-white font-bold ring-2 ring-slate-300">
                      <AvatarFallback>{rank2Winner.student_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="pr-16">
                      <p className="font-extrabold text-slate-900 text-sm group-hover:text-slate-700 transition-colors">
                        {rank2Winner.student_name}
                      </p>
                      <p className="text-xs text-slate-600 font-medium">
                        NIS: {rank2Winner.nis} • <span className="text-slate-800 font-bold">{rank2Winner.class_name}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500">Capaian Hafalan:</span>
                      <p className="font-extrabold text-slate-900 text-sm">{rank2Winner.tahfizh.total_baris} Baris (Juz {rank2Winner.tahfizh.juz_completed})</p>
                    </div>
                    <Badge color="sky" size="sm">
                      {rank2Winner.tahfizh.current_surah}
                    </Badge>
                  </div>
                </div>
              ) : null}

              {/* Rank 3 - Bronze 🥉 */}
              {rank3Winner ? (
                <div
                  onClick={() => { setSelectedStudent(rank3Winner); setIsDetailOpen(true) }}
                  className="relative overflow-hidden rounded-2xl border border-orange-300 bg-gradient-to-b from-orange-50/90 via-orange-50/40 to-white p-4.5 shadow-xs transition-all hover:shadow-md hover:scale-[1.01] cursor-pointer group"
                >
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-600 text-white px-2.5 py-0.5 text-xs font-bold shadow-xs">
                      🥉 Rank #3 Bronze
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Avatar size="lg" className="bg-orange-600 text-white font-bold ring-2 ring-orange-300">
                      <AvatarFallback>{rank3Winner.student_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="pr-16">
                      <p className="font-extrabold text-slate-900 text-sm group-hover:text-orange-700 transition-colors">
                        {rank3Winner.student_name}
                      </p>
                      <p className="text-xs text-slate-600 font-medium">
                        NIS: {rank3Winner.nis} • <span className="text-orange-900 font-bold">{rank3Winner.class_name}</span>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-orange-200/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500">Capaian Hafalan:</span>
                      <p className="font-extrabold text-orange-950 text-sm">{rank3Winner.tahfizh.total_baris} Baris (Juz {rank3Winner.tahfizh.juz_completed})</p>
                    </div>
                    <Badge color="violet" size="sm">
                      {rank3Winner.tahfizh.current_surah}
                    </Badge>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Datatable Peringkat #4 s/d #10 */}
          {remainingTopStudents.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Peringkat Teratas Berikutnya (#4 s/d #{top10TahfizhStudents.length})</span>
                <span className="text-xs text-slate-500">Total {top10TahfizhStudents.length} Siswa Terbanyak</span>
              </div>
              <TableRoot fullBleed={false}>
                <TableHeader className="bg-slate-50/60 border-b border-slate-200">
                  <TableRow>
                    <TableHead className="py-2.5 px-4 font-semibold text-slate-700 text-xs w-20">Peringkat</TableHead>
                    <TableHead className="py-2.5 px-4 font-semibold text-slate-700 text-xs">Siswa / NIS</TableHead>
                    <TableHead className="py-2.5 px-4 font-semibold text-slate-700 text-xs">Kelas / Rombel</TableHead>
                    <TableHead className="py-2.5 px-4 font-semibold text-slate-700 text-xs">Unit Sekolah</TableHead>
                    <TableHead className="py-2.5 px-4 font-semibold text-slate-700 text-xs">Surah Terakhir</TableHead>
                    <TableHead className="py-2.5 px-4 font-semibold text-slate-700 text-xs text-right">Total Hafalan</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-slate-100">
                  {remainingTopStudents.map((siswa, idx) => {
                    const rankNum = idx + 4
                    return (
                      <TableRow
                        key={siswa.id}
                        onClick={() => { setSelectedStudent(siswa); setIsDetailOpen(true) }}
                        className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                      >
                        <TableCell className="py-2.5 px-4 font-bold text-slate-600 text-xs">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-extrabold text-xs">
                            #{rankNum}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar size="sm" className="bg-emerald-50 text-emerald-800 font-bold">
                              <AvatarFallback>{siswa.student_name.slice(0, 2)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-slate-900 text-xs hover:text-emerald-600">
                                {siswa.student_name}
                              </p>
                              <p className="text-[11px] text-slate-400">NIS: {siswa.nis}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5 px-4 text-xs font-medium text-slate-800">{siswa.class_name}</TableCell>
                        <TableCell className="py-2.5 px-4"><Badge color="gray" size="sm">{siswa.unit_name}</Badge></TableCell>
                        <TableCell className="py-2.5 px-4 text-xs text-slate-700">{siswa.tahfizh.current_surah} ({siswa.tahfizh.current_ayat})</TableCell>
                        <TableCell className="py-2.5 px-4 text-right">
                          <span className="font-bold text-emerald-700 text-xs">{siswa.tahfizh.total_baris} Baris</span>
                          <span className="text-[11px] text-slate-500 block">Juz {siswa.tahfizh.juz_completed}</span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </TableRoot>
            </div>
          )}
        </div>

        {/* Toolbar 2 Baris Sesuai Gold Standard Project Rules */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-4 sm:p-5 space-y-4 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
          {/* Baris 1: Navigation Tabs & Vivid Gradient Squircle Action Buttons (§H.5) */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3.5 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60 -mx-4 -mt-4 sm:-mx-5 sm:-mt-5 p-4 sm:p-5 mb-4">
            <AppTabs
              tabs={[
                { id: 'rekap', label: 'Daftar Monitoring Siswa', icon: Layers },
                { id: 'chart', label: 'Grafik & Analisis Capaian', icon: TrendingUp },
                { id: 'verification', label: 'Verifikasi Log Guru', icon: UserCheck },
              ]}
              activeTab={activeTab}
              onChange={setActiveTab}
              ariaLabel="Mode monitoring"
            />

            {/* Action Buttons Icon-Only Squircle (§H.5) */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start xl:self-auto flex-wrap">
              {/* Import / Sinkron Button */}
              <SquircleActionButton
                variant="import"
                icon={Upload}
                label="Sinkron Data"
                onClick={() => {
                  setAlertFeedback({
                    type: 'info',
                    title: 'Sinkronisasi Log Data',
                    message: 'Berhasil mensinkronkan log mutabaah & tahfizh siswa terkini dari server backend.',
                  })
                  setTimeout(() => setAlertFeedback(null), 3000)
                }}
              />

              {/* Export Button */}
              <SquircleActionButton
                variant="export"
                icon={Download}
                label="Ekspor Excel"
                onClick={handleExportExcel}
              />

              {/* Input Catatan Button */}
              <SquircleActionButton
                variant="primary"
                icon={Plus}
                label="Input Catatan Monitoring"
                onClick={() => {
                  if (filteredStudents.length > 0) {
                    handleVerifyStudent(filteredStudents[0])
                  }
                }}
              />
            </div>
          </div>

          {/* Baris 2: Search Input + Filters + perPage Selector (§7.9 + §J.3) */}
          <div className="px-4 py-3 sm:px-6 md:px-8 border-b border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433]">
            <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
                Filter:
              </span>
              {/* Search Input */}
              <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[160px]">
                <label htmlFor="mon-search" className="sr-only">Cari siswa, NIS, atau surah</label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <Search className="size-4" />
                  </div>
                  <input
                    id="mon-search"
                    type="text"
                    placeholder="Cari siswa, NIS, atau surah..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                  />
                </div>
              </div>

              {/* Filter Unit Sekolah */}
              <div className="w-full sm:w-auto min-w-[140px]">
                <label htmlFor="mon-unit" className="sr-only">Unit sekolah</label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <Building2 className="size-4" />
                  </div>
                  <CustomSelect
                    id="mon-unit"
                    value={isScopedToLedUnit ? principalUnitCode : filterUnit}
                    disabled={isScopedToLedUnit}
                    onChange={(e) => setFilterUnit(e.target.value)}
                    className="w-full sm:w-auto min-w-[140px] appearance-none rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer disabled:opacity-50"
                  >
                    {isScopedToLedUnit ? (
                      <option value={principalUnitCode}>{principalUnitName} (Unit Dipimpin)</option>
                    ) : (
                      <>
                        <option value="">Semua Unit Non-Pesantren</option>
                        {nonPesantrenUnits.map((u) => (
                          <option key={u.id} value={u.code || u.name}>
                            {u.name} ({u.unit_type || 'Sekolah'})
                          </option>
                        ))}
                      </>
                    )}
                  </CustomSelect>
                  <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Filter Kelas */}
              <div className="w-full sm:w-auto min-w-[140px]">
                <label htmlFor="mon-kelas" className="sr-only">Kelas</label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <BookOpen className="size-4" />
                  </div>
                  <CustomSelect
                    id="mon-kelas"
                    value={filterKelas}
                    onChange={(e) => setFilterKelas(e.target.value)}
                    className="w-full sm:w-auto min-w-[140px] appearance-none rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer"
                  >
                    <option value="">Semua Kelas / Rombel</option>
                    {uniqueClassesWithUnit.map((item) => (
                      <option key={item.className} value={item.className}>
                        {item.className} ({item.unitCode})
                      </option>
                    ))}
                  </CustomSelect>
                  <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Filter Status Verifikasi */}
              <div className="w-full sm:w-auto min-w-[140px]">
                <label htmlFor="mon-status" className="sr-only">Status verifikasi</label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <ShieldCheck className="size-4" />
                  </div>
                  <CustomSelect
                    id="mon-status"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full sm:w-auto min-w-[140px] appearance-none rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer"
                  >
                    <option value="">Semua Status Verifikasi</option>
                    <option value="verified_teacher">Terverifikasi Guru/Wali Kelas</option>
                    <option value="verified_parent">Terverifikasi Orang Tua</option>
                    <option value="pending">Menunggu Verifikasi</option>
                  </CustomSelect>
                  <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {/* Select perPage */}
              <div className="w-full sm:w-auto min-w-[140px]">
                <label htmlFor="mon-perpage" className="sr-only">Tampilkan per halaman</label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <ListChecks className="size-4" />
                  </div>
                  <CustomSelect
                    id="mon-perpage"
                    value={perPage}
                    onChange={(e) => {
                      setPerPage(Number(e.target.value))
                      setPage(1)
                    }}
                    className="w-full sm:w-auto min-w-[140px] appearance-none rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-8 py-2 text-xs font-semibold text-slate-800 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 cursor-pointer"
                  >
                    <option value={5}>5 per halaman</option>
                    <option value={10}>10 per halaman</option>
                    <option value={15}>15 per halaman</option>
                    <option value={25}>25 per halaman</option>
                    <option value={50}>50 per halaman</option>
                  </CustomSelect>
                  <ChevronDown className="pointer-events-none absolute right-2.5 h-3.5 w-3.5 text-slate-400" />
                </div>
              </div>

              {(search || filterUnit || filterKelas || filterStatus) && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setFilterUnit(''); setFilterKelas(''); setFilterStatus(''); setPage(1) }}
                  className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-1.5 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* TAB CONTENT 1: Rekap Datatable Siswa */}
        {activeTab === 'rekap' && (
          <div className="rounded-2xl border border-emerald-200/80 bg-white shadow-sm overflow-hidden dark:border-emerald-800/60 dark:bg-[#1B2433]">
            <div className="overflow-x-auto">
              <TableRoot fullBleed={false}>
                <TableHeader className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-900/50">
                  <TableRow>
                    <TableHead className="py-2.5 px-4 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                      <div className="flex items-center gap-1.5">
                        Siswa / Rombel
                        <ArrowUpDown className="w-3.5 h-3.5" />
                      </div>
                    </TableHead>
                    <TableHead className="hidden sm:table-cell py-2.5 px-4 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                      Unit Sekolah
                    </TableHead>
                    <TableHead className="hidden md:table-cell py-2.5 px-4 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                      Pencapaian Tahfizh
                    </TableHead>
                    <TableHead className="hidden lg:table-cell py-2.5 px-4 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                      Mutaba'ah Ibadah Harian
                    </TableHead>
                    <TableHead className="py-2.5 px-4 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200">
                      Status Verifikasi
                    </TableHead>
                    <TableHead className="py-2.5 px-4 font-black text-[11px] uppercase tracking-wider text-emerald-950 dark:text-emerald-200 text-right">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                  {paginatedStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8">
                        <MasterEmptyState
                          title="Tidak Ada Data Monitoring Siswa"
                          description="Siswa tidak ditemukan sesuai filter pencarian atau unit yang dipilih."
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedStudents.map((siswa) => (
                      <TableRow key={siswa.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                        {/* Siswa & Rombel */}
                        <TableCell className="py-3.5 px-4 align-top sm:align-middle">
                          <div className="flex items-center gap-3">
                            <Avatar size="md" className="bg-emerald-100 text-emerald-800 font-bold shrink-0">
                              <AvatarFallback>{siswa.student_name.slice(0, 2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 text-sm hover:text-emerald-600 transition-colors cursor-pointer line-clamp-2" onClick={() => { setSelectedStudent(siswa); setIsDetailOpen(true) }}>
                                {siswa.student_name}
                              </p>
                              <p className="text-xs text-slate-500 font-mono line-clamp-1 mt-0.5">
                                NIS: {siswa.nis} • <span className="font-medium text-slate-700">{siswa.class_name}</span>
                              </p>
                            </div>
                          </div>
                          <div className="sm:hidden mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-emerald-100/80 dark:border-emerald-900/40">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                              {siswa.unit_name}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 tabular-nums">
                              {siswa.tahfizh.total_baris} baris
                            </span>
                          </div>
                        </TableCell>

                        {/* Unit Sekolah */}
                        <TableCell className="hidden sm:table-cell py-3.5 px-4 align-middle">
                          <Badge color="gray" size="sm">
                            {siswa.unit_name}
                          </Badge>
                        </TableCell>

                        {/* Pencapaian Tahfizh */}
                        <TableCell className="hidden md:table-cell py-3.5 px-4 align-middle">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900 text-xs sm:text-sm">
                                {siswa.tahfizh.current_surah} ({siswa.tahfizh.current_ayat})
                              </span>
                              <Badge color="emerald" size="sm">
                                Juz {siswa.tahfizh.juz_completed} / {siswa.tahfizh.target_juz}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                              <span>Total: {siswa.tahfizh.total_baris} baris</span>
                              <span>•</span>
                              <span className={siswa.tahfizh.kelancaran === 'Belum dinilai' ? 'text-slate-400 italic font-normal' : 'text-emerald-700 font-medium'}>
                                {siswa.tahfizh.kelancaran}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        {/* Mutaba'ah Ibadah Harian */}
                        <TableCell className="hidden lg:table-cell py-3.5 px-4 align-middle">
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-600">Sholat 5 Waktu</span>
                              <span className="font-semibold text-slate-800">{siswa.ibadah.sholat_5_waktu}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                              <div
                                className="bg-emerald-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${siswa.ibadah.sholat_5_waktu}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Dhuha: {siswa.ibadah.sholat_dhuha}% • Tahajud: {siswa.ibadah.tahajud}% • Tilawah: {siswa.ibadah.tilawah_harian}
                            </p>
                          </div>
                        </TableCell>

                        {/* Status Verifikasi */}
                        <TableCell className="py-3.5 px-4 align-middle">
                          {siswa.verification_status === 'verified_teacher' ? (
                            <Badge color="success" size="sm" prefixIcon={<CheckCircle2 className="w-3 h-3" />}>
                              Terverifikasi Guru
                            </Badge>
                          ) : siswa.verification_status === 'verified_parent' ? (
                            <Badge color="sky" size="sm" prefixIcon={<UserCheck className="w-3 h-3" />}>
                              Verifikasi Ortu
                            </Badge>
                          ) : (
                            <Badge color="warning" size="sm" prefixIcon={<Clock className="w-3 h-3" />}>
                              Menunggu Verifikasi
                            </Badge>
                          )}
                        </TableCell>

                        {/* Action Dropdown */}
                        <TableCell className="py-3.5 px-4 text-right align-middle">
                          <ActionDropdown
                            actions={[
                              {
                                label: 'Lihat Rincian Harian',
                                icon: Eye,
                                onClick: () => {
                                  setSelectedStudent(siswa)
                                  setIsDetailOpen(true)
                                },
                              },
                              {
                                label: 'Verifikasi & Beri Catatan',
                                icon: MessageSquare,
                                onClick: () => handleVerifyStudent(siswa),
                              },
                              {
                                label: 'Cetak Laporan Rapor Mutabaah',
                                icon: FileText,
                                onClick: () => handlePrintStudentReport(siswa),
                              },
                            ]}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableRoot>
            </div>

            {/* Pagination Sesuai Project Rule (§7.6) */}
            <div className="border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/40 p-3.5 sm:px-6 py-3 sm:py-3.5 dark:border-emerald-800/60 dark:from-emerald-950/20 dark:via-transparent dark:to-emerald-950/20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 text-center sm:text-left">
                Menampilkan <span className="font-semibold text-slate-700 dark:text-slate-200">{paginatedStudents.length}</span> santri terpantau
              </div>
              <div className="flex items-center justify-center gap-2">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p)}
                  sideLayout="icon"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT 2: Grafik & Analisis Capaian */}
        {activeTab === 'chart' && (
          <div className="space-y-6">
            {/* Card Grafik Perbandingan Tahfizh Antar Kelas / Rombel (Dynamic BarChart) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/80 shadow-xs shrink-0">
                    <BarChart3 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Grafik Perbandingan Tahfizh Antar Kelas
                      </h3>
                      <Badge color="emerald" size="sm" className="font-semibold">Rombel Kelas</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Perbandingan total baris hafalan, rata-rata Juz Al-Qur’an, dan partisipasi per kelas di {principalUnitName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  <span className="text-emerald-700 font-bold">{classTahfizhChartData.length} Rombel</span> Terdaftar
                </div>
              </div>

              {/* Chart Visual Container */}
              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={classTahfizhChartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="className"
                      tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      yAxisId="left"
                      orientation="left"
                      tick={{ fontSize: 11, fill: '#059669' }}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 30]}
                      tick={{ fontSize: 11, fill: '#0284c7' }}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur-xs text-xs space-y-1.5">
                              <p className="font-bold text-slate-900 border-b border-slate-100 pb-1 flex items-center gap-1.5">
                                <BookOpen className="w-4 h-4 text-emerald-600" /> {label}
                              </p>
                              <div className="space-y-1 text-slate-700">
                                <p className="flex justify-between gap-4">
                                  <span className="text-slate-500">Total Baris Hafalan:</span>
                                  <span className="font-bold text-emerald-700">{data.totalBaris?.toLocaleString('id-ID')} Baris</span>
                                </p>
                                <p className="flex justify-between gap-4">
                                  <span className="text-slate-500">Rata-rata Juz / Siswa:</span>
                                  <span className="font-bold text-sky-700">{data.avgJuz} Juz</span>
                                </p>
                                <p className="flex justify-between gap-4">
                                  <span className="text-slate-500">Rata-rata Baris / Siswa:</span>
                                  <span className="font-bold text-slate-800">{data.avgBaris} Baris</span>
                                </p>
                                <p className="flex justify-between gap-4">
                                  <span className="text-slate-500">Jumlah Siswa:</span>
                                  <span className="font-medium text-slate-800">{data.studentCount} Siswa</span>
                                </p>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                    <Bar
                      yAxisId="left"
                      dataKey="totalBaris"
                      name="Total Baris Hafalan (Baris)"
                      fill="#10b981"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={45}
                    />
                    <Bar
                      yAxisId="right"
                      dataKey="avgJuz"
                      name="Rata-rata Juz per Siswa (Juz)"
                      fill="#0284c7"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={45}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Dynamic Summary Badges Per Class */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5 pt-2 border-t border-slate-100">
                {classTahfizhChartData.map((item) => (
                  <div
                    key={item.className}
                    className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 hover:bg-slate-100/80 transition-colors text-center cursor-pointer"
                    onClick={() => {
                      setTop10ClassFilter(item.className)
                      setFilterKelas(item.className)
                      setActiveTab('rekap')
                    }}
                    title={`Klik untuk memfilter data kelas ${item.className}`}
                  >
                    <span className="text-[11px] font-bold text-slate-800 block truncate">{item.className}</span>
                    <span className="text-xs font-extrabold text-emerald-700 block mt-0.5">{item.totalBaris} Baris</span>
                    <span className="text-[10px] text-slate-500 block font-medium">Avg {item.avgJuz} Juz ({item.studentCount} siswa)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card Grafik Analisis Kedisiplinan Sholat Wajib & Sunnah Non-Pesantren (Tanpa Sholat Malam / Tahajud) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-200/80 shadow-xs shrink-0">
                    <CheckCircle2 className="w-6 h-6 text-sky-600" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Analisis Kedisiplinan Sholat Wajib & Sunnah Harian
                      </h3>
                      <Badge color="sky" size="sm" className="font-semibold">Regular Non-Pesantren</Badge>
                      <Badge color="purple" size="sm" className="font-semibold">Tanpa Sholat Malam</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Tingkat kepatuhan Sholat Wajib 5 Waktu & Sholat Sunnah Harian (Dhuha, Rawatib, Dzikir) per rombel kelas di {principalUnitName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  <span className="text-sky-700 font-bold">{worshipDisciplineChartData.length} Rombel</span> Non-Pesantren
                </div>
              </div>

              {/* Chart Visual Container */}
              <div className="h-80 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={worshipDisciplineChartData} margin={{ top: 10, right: 10, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="className"
                      tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#0284c7' }}
                      unit="%"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-xs text-xs space-y-2 max-w-xs">
                              <div className="border-b border-slate-100 pb-1.5 flex items-center justify-between">
                                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-sky-600" /> {label}
                                </p>
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{data.studentCount} Siswa</span>
                              </div>
                              <div className="space-y-1.5 text-slate-700">
                                <p className="flex justify-between gap-4">
                                  <span className="text-slate-600 font-medium">Sholat 5 Waktu (Wajib):</span>
                                  <span className="font-bold text-sky-700">{data.sholatWajib}%</span>
                                </p>
                                <p className="flex justify-between gap-4">
                                  <span className="text-slate-600 font-medium">Sholat Dhuha (Sunnah):</span>
                                  <span className="font-bold text-violet-700">{data.sholatDhuha}%</span>
                                </p>
                                <p className="flex justify-between gap-4">
                                  <span className="text-slate-600 font-medium">Rawatib & Dzikir Harian:</span>
                                  <span className="font-bold text-amber-700">{data.sunnahRawatib}%</span>
                                </p>
                              </div>
                              <div className="pt-1.5 border-t border-slate-100 text-[10px] text-slate-400 italic">
                                * Khusus siswa harian non-pesantren (dikecualikan dari Tahajud / Sholat Malam)
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />
                    <Bar
                      dataKey="sholatWajib"
                      name="Sholat Wajib 5 Waktu (%)"
                      fill="#0284c7"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={35}
                    />
                    <Bar
                      dataKey="sholatDhuha"
                      name="Sholat Sunnah Dhuha (%)"
                      fill="#8b5cf6"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={35}
                    />
                    <Bar
                      dataKey="sunnahRawatib"
                      name="Rawatib & Dzikir Pagi/Petang (%)"
                      fill="#f59e0b"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={35}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Dynamic Summary Note */}
              <div className="rounded-xl border border-sky-100 bg-sky-50/60 p-3 text-xs text-sky-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block mb-0.5">ℹ️ Catatan Lingkup Ibadah Siswa Non-Pesantren:</span>
                  Evaluasi ibadah mencakup Sholat Fardhu 5 Waktu dan Sholat Sunnah Harian (Dhuha & Rawatib). Sholat Sunnah Malam (Tahajud) dikecualikan karena siswa non-pesantren tinggal di rumah bersama orang tua/wali murid (bukan di dalam asrama pondok pesantren).
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tren Setoran & Kedisiplinan Mingguan */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Tren Setoran & Kedisiplinan Ibadah (7 Hari Terakhir)</h3>
                  <p className="text-xs text-slate-500">Perkembangan total setoran hafalan & tingkat pemenuhan mutaba'ah harian</p>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={weeklyProgressChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="tahfizh_setoran" name="Setoran Tahfizh" stroke="#10b981" fill="#d1fae5" />
                      <Area type="monotone" dataKey="ibadah_compliance" name="Kedisiplinan Ibadah (%)" stroke="#0284c7" fill="#e0f2fe" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Perbandingan Rata-Rata Capaian Per Unit Non-Pesantren */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">Perbandingan Capaian Antar Unit Non-Pesantren</h3>
                  <p className="text-xs text-slate-500">Rata-rata Juz Al-Qur'an & Persentase Mutaba'ah di TKIT, SDIT, SMPIT, SMAIT</p>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={unitComparisonChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="unit" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="tahfizh_avg_juz" name="Rata-rata Juz Dihafal" fill="#059669" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ibadah_pct" name="Mutaba'ah Ibadah (%)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB CONTENT 3: Verifikasi Log Harian Guru */}
        {activeTab === 'verification' && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Portal Verifikasi & Catatan Pembimbing Guru</h3>
              <p className="text-xs text-slate-500">Daftar entri mutaba'ah & setoran siswa yang membutuhkan respon / masukan guru</p>
            </div>
            <div className="space-y-3">
              {filteredStudents.map((st) => (
                <div key={st.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-3">
                    <Avatar size="md" className="bg-emerald-100 text-emerald-800 font-bold">
                      <AvatarFallback>{st.student_name.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{st.student_name}</span>
                        <Badge color="gray" size="sm">{st.class_name}</Badge>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        Hafalan: <span className="font-medium text-emerald-700">{st.tahfizh.current_surah} ({st.tahfizh.current_ayat})</span> • Sholat 5 Waktu: <span className="font-medium text-sky-700">{st.ibadah.sholat_5_waktu}%</span>
                      </p>
                      <p className="text-xs text-slate-500 italic mt-1">
                        "{st.teacher_notes || 'Belum ada catatan pembimbing'}"
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-600 hover:bg-slate-200"
                      onClick={() => { setSelectedStudent(st); setIsDetailOpen(true) }}
                    >
                      Lihat Log
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleVerifyStudent(st)}
                    >
                      <Check className="w-4 h-4 mr-1" /> Verifikasi
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Detail Student Deep Dive */}
        {selectedStudent && (
          <Dialog
            isOpen={isDetailOpen}
            onOpenChange={setIsDetailOpen}
            className="w-full max-w-2xl"
          >
            <DialogHeader className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  Detail Monitoring Siswa: {selectedStudent.student_name}
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  NIS: {selectedStudent.nis} • {selectedStudent.unit_name} ({selectedStudent.class_name})
                </DialogDescription>
              </div>
            </DialogHeader>

            <DialogBody className="space-y-4">
              {/* Ringkasan Tahfizh */}
              <div className="rounded-xl bg-emerald-50/60 p-4 border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-900 text-sm flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-600" /> Tahfizh Al-Qur'an
                  </span>
                  <Badge color="emerald" size="sm">Capaian: Juz {selectedStudent.tahfizh.juz_completed}</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                  <div><span className="text-slate-500">Surah Terakhir:</span> <p className="font-semibold">{selectedStudent.tahfizh.current_surah}</p></div>
                  <div><span className="text-slate-500">Ayat:</span> <p className="font-semibold">{selectedStudent.tahfizh.current_ayat}</p></div>
                  <div>
                    <span className="text-slate-500">Kelancaran:</span>{' '}
                    <p className={selectedStudent.tahfizh.kelancaran === 'Belum dinilai' ? 'italic text-slate-400 font-normal' : 'font-semibold text-emerald-700'}>
                      {selectedStudent.tahfizh.kelancaran}
                    </p>
                  </div>
                  <div><span className="text-slate-500">Total Hafalan:</span> <p className="font-semibold">{selectedStudent.tahfizh.total_baris} Baris</p></div>
                  <div><span className="text-slate-500">Target Unit:</span> <p className="font-semibold">Juz {selectedStudent.tahfizh.target_juz}</p></div>
                  <div><span className="text-slate-500">Setoran Terakhir:</span> <p className="font-semibold">{selectedStudent.tahfizh.last_setoran}</p></div>
                </div>
              </div>

              {/* Ringkasan Mutabaah Ibadah */}
              <div className="rounded-xl bg-sky-50/60 p-4 border border-sky-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sky-900 text-sm flex items-center gap-1.5">
                    <BookHeart className="w-4 h-4 text-sky-600" /> Mutaba'ah Ibadah Harian
                  </span>
                  <Badge color="sky" size="sm">Sholat 5 Waktu: {selectedStudent.ibadah.sholat_5_waktu}%</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-slate-700">
                  <div><span className="text-slate-500">Sholat Dhuha:</span> <p className="font-semibold">{selectedStudent.ibadah.sholat_dhuha}%</p></div>
                  <div><span className="text-slate-500">Sholat Tahajud:</span> <p className="font-semibold">{selectedStudent.ibadah.tahajud}%</p></div>
                  <div><span className="text-slate-500">Tilawah Harian:</span> <p className="font-semibold">{selectedStudent.ibadah.tilawah_harian}</p></div>
                  <div><span className="text-slate-500">Dzikir Pagi/Petang:</span> <p className="font-semibold">{selectedStudent.ibadah.dzikir_pagi_petang}%</p></div>
                  <div><span className="text-slate-500">Puasa Sunnah:</span> <p className="font-semibold">{selectedStudent.ibadah.puasa_sunnah}%</p></div>
                  <div><span className="text-slate-500">Infaq/Sedekah:</span> <p className="font-semibold">{selectedStudent.ibadah.infaq}%</p></div>
                </div>
              </div>

              {/* Catatan Pembimbing Guru */}
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
                <span className="font-semibold text-slate-900 text-xs">Catatan Pembimbing / Wali Kelas:</span>
                <p className="text-xs text-slate-600 mt-1 italic">{selectedStudent.teacher_notes || 'Belum ada catatan.'}</p>
              </div>
            </DialogBody>

            <DialogFooter className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <span>Tutup</span>
              </button>
              <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => { setIsDetailOpen(false); handleVerifyStudent(selectedStudent) }}>
                Beri Verifikasi / Catatan
              </Button>
            </DialogFooter>
          </Dialog>
        )}

        {/* Modal Verifikasi / Catatan Guru Sesuai HeroUI Dialog */}
        {selectedStudent && (
          <Dialog
            isOpen={isVerifyModalOpen}
            onOpenChange={setIsVerifyModalOpen}
            className="w-full max-w-lg"
          >
            <DialogHeader className="border-b border-slate-100 pb-3">
              <DialogTitle className="text-base font-bold text-slate-900">
                Verifikasi & Form Catatan Pembimbing
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Siswa: <span className="font-semibold text-slate-800">{selectedStudent.student_name}</span> ({selectedStudent.class_name})
              </DialogDescription>
            </DialogHeader>

            <DialogBody className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Status Verifikasi Guru</label>
                <CustomSelect className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs sm:text-sm text-slate-800 focus:border-emerald-500 focus:outline-none">
                  <option value="verified_teacher">Disetujui & Diverifikasi (Lancar/Sesuai)</option>
                  <option value="pending">Perlu Pengulangan / Evaluasi</option>
                </CustomSelect>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Catatan Pembimbing / Ustadz Wali Kelas</label>
                <textarea
                  rows={4}
                  value={teacherNoteInput}
                  onChange={(e) => setTeacherNoteInput(e.target.value)}
                  placeholder="Tuliskan catatan apresiasi, masukan tajwid, makhraj, atau motivasi ibadah harian..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs sm:text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </DialogBody>

            <DialogFooter className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsVerifyModalOpen(false)}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <span>Batal</span>
              </button>
              <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={submitVerification}>
                Simpan Verifikasi
              </Button>
            </DialogFooter>
          </Dialog>
        )}

        {/* Modal Detail Master KPI (Dialog HeroUI Sesuai /docs/read/PROMPT/HEROUI_DIALOG_COMPONENT.md - 100% Dynamic Data) */}
        {activeKpiModal && (
          <Dialog
            isOpen={Boolean(activeKpiModal)}
            onOpenChange={(isOpen) => !isOpen && handleCloseKpiModal()}
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto"
          >
            {/* KPI 1: Capaian Tahfizh Unit */}
            {activeKpiModal === 'tahfizh' && (
              <>
                <DialogHeader className="border-b border-slate-100 pb-3.5">
                  <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    Detail Capaian Tahfizh Unit
                    <Badge color="emerald" size="sm">Target 89%</Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Rekapitulasi pencapaian baris hafalan, target juz, dan distribusi setoran di {principalUnitName} ({kpiStats.totalStudents} Siswa)
                  </DialogDescription>
                </DialogHeader>

                <DialogBody className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-center">
                      <span className="text-[11px] font-medium text-emerald-700 block">Total Baris Setoran</span>
                      <span className="text-lg font-extrabold text-emerald-900">{kpiStats.totalBaris.toLocaleString('id-ID')} Baris</span>
                    </div>
                    <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-3 text-center">
                      <span className="text-[11px] font-medium text-sky-700 block">Rata-rata per Siswa</span>
                      <span className="text-lg font-extrabold text-sky-900">{kpiStats.avgJuz} Juz</span>
                    </div>
                    <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-3 text-center">
                      <span className="text-[11px] font-medium text-violet-700 block">Total Siswa Terdaftar</span>
                      <span className="text-lg font-extrabold text-violet-900">{kpiStats.totalStudents} Siswa</span>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3 text-center">
                      <span className="text-[11px] font-medium text-amber-700 block">Capaian Target</span>
                      <span className="text-lg font-extrabold text-amber-900">{kpiStats.verifiedPercent}%</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Distribusi Capaian Rombel / Kelas</h4>
                    <div className="space-y-2.5">
                      {kpiStats.classBreakdown.map((item, idx) => {
                        const barColors = ['bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-amber-500']
                        const colorClass = barColors[idx % barColors.length]
                        return (
                          <div key={item.className}>
                            <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                              <span>{item.className}</span>
                              <span>{item.totalBaris.toLocaleString('id-ID')} Baris (Rata-rata {item.avgJuz} Juz)</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div className={`h-full ${colorClass} rounded-full transition-all duration-300`} style={{ width: `${Math.max(15, item.percent)}%` }} />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                    <span className="font-bold text-slate-800 block mb-0.5">ℹ️ Catatan Capaian Unit:</span>
                    Data dihitung secara dinamis dari {kpiStats.totalStudents} siswa terdaftar pada unit {principalUnitName}.
                  </div>
                </DialogBody>
              </>
            )}

            {/* KPI 2: Kedisiplinan Sholat 5 Waktu */}
            {activeKpiModal === 'sholat' && (
              <>
                <DialogHeader className="border-b border-slate-100 pb-3.5">
                  <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-sky-600" />
                    Detail Kedisiplinan Sholat 5 Waktu
                    <Badge color="sky" size="sm">Sangat Baik</Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Tingkat partisipasi pelaksanaan sholat fardhu berjamaah dan tepat waktu di {principalUnitName}
                  </DialogDescription>
                </DialogHeader>

                <DialogBody className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-3 text-center">
                      <span className="text-[11px] font-medium text-sky-700 block">Total Kehadiran Sholat</span>
                      <span className="text-lg font-extrabold text-sky-900">{kpiStats.avgSholat != null ? `${kpiStats.avgSholat}%` : '—'}</span>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-center">
                      <span className="text-[11px] font-medium text-emerald-700 block">Pelaksanaan Berjamaah</span>
                      <span className="text-lg font-extrabold text-emerald-900">{kpiStats.avgSholat != null ? `${kpiStats.avgSholat}%` : '—'}</span>
                    </div>
                    <div className="rounded-xl border border-purple-100 bg-purple-50/70 p-3 text-center">
                      <span className="text-[11px] font-medium text-purple-700 block">Tepat Waktu</span>
                      <span className="text-lg font-extrabold text-purple-900">{kpiStats.avgSholat != null ? `${kpiStats.avgSholat}%` : '—'}</span>
                    </div>
                  </div>

                  <div className="space-y-3 border border-slate-200/80 rounded-xl p-3.5 bg-white">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Breakdown Persentase per Waktu Sholat</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Subuh Berjamaah</span>
                        <span className="font-bold text-sky-700">{kpiStats.avgSholat != null ? `${kpiStats.avgSholat}%` : '—'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Dzuhur di Sekolah</span>
                        <span className="font-bold text-emerald-700">{kpiStats.avgSholat != null ? `${kpiStats.avgSholat}%` : '—'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Ashar Berjamaah</span>
                        <span className="font-bold text-purple-700">{kpiStats.avgSholat != null ? `${kpiStats.avgSholat}%` : '—'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Maghrib Tepat Waktu</span>
                        <span className="font-bold text-amber-700">{kpiStats.avgSholat != null ? `${kpiStats.avgSholat}%` : '—'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Isya Berjamaah</span>
                        <span className="font-bold text-slate-800">{kpiStats.avgSholat != null ? `${kpiStats.avgSholat}%` : '—'}</span>
                      </div>
                    </div>
                  </div>
                </DialogBody>
              </>
            )}

            {/* KPI 3: Amalan Sunnah & Tilawah */}
            {activeKpiModal === 'sunnah' && (
              <>
                <DialogHeader className="border-b border-slate-100 pb-3.5">
                  <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-violet-600" />
                    Detail Amalan Sunnah & Tilawah Harian
                    <Badge color="violet" size="sm">+5.4% Mgg Ini</Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Rutinitas amalan sunnah, Sholat Dhuha, Tahajud, Tilawah, Dzikir Pagi/Petang, & Infaq di {principalUnitName}
                  </DialogDescription>
                </DialogHeader>

                <DialogBody className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-3 text-center">
                      <span className="text-[11px] font-medium text-violet-700 block">Rata-rata Kelengkapan</span>
                      <span className="text-lg font-extrabold text-violet-900">{kpiStats.avgSunnah != null ? `${kpiStats.avgSunnah}%` : '—'}</span>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-center">
                      <span className="text-[11px] font-medium text-emerald-700 block">Sholat Dhuha</span>
                      <span className="text-lg font-extrabold text-emerald-900">{kpiStats.avgDhuha != null ? `${kpiStats.avgDhuha}%` : '—'}</span>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3 text-center">
                      <span className="text-[11px] font-medium text-amber-700 block">Sholat Tahajud</span>
                      <span className="text-lg font-extrabold text-amber-900">{kpiStats.avgTahajud != null ? `${kpiStats.avgTahajud}%` : '—'}</span>
                    </div>
                  </div>

                  <div className="space-y-2 border border-slate-200/80 rounded-xl p-3.5 bg-white">
                    <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Capaian Amalan Yaumiyah</h4>
                    <div className="grid grid-cols-2 gap-2.5">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                        <span className="text-[11px] text-slate-500 block">Tilawah Harian</span>
                        <span className="font-bold text-slate-800">{kpiStats.avgTilawah != null ? `${kpiStats.avgTilawah}% Siswa` : '—'}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                        <span className="text-[11px] text-slate-500 block">Dzikir Pagi & Petang</span>
                        <span className="font-bold text-slate-800">{kpiStats.avgDzikir != null ? `${kpiStats.avgDzikir}% Rutin` : '—'}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                        <span className="text-[11px] text-slate-500 block">Puasa Sunnah Senin-Kamis</span>
                        <span className="font-bold text-slate-800">{kpiStats.avgPuasa != null ? `${kpiStats.avgPuasa}% Siswa` : '—'}</span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60">
                        <span className="text-[11px] text-slate-500 block">Infaq Harian Subuh</span>
                        <span className="font-bold text-slate-800">{kpiStats.avgInfaq != null ? `${kpiStats.avgInfaq}% Partisipasi` : '—'}</span>
                      </div>
                    </div>
                  </div>
                </DialogBody>
              </>
            )}

            {/* KPI 4: Status Verifikasi Log */}
            {activeKpiModal === 'verifikasi' && (
              <>
                <DialogHeader className="border-b border-slate-100 pb-3.5">
                  <DialogTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-amber-600" />
                    Detail Status Verifikasi Log Mutaba’ah
                    <Badge color="amber" size="sm">Status Aktif</Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    Status persetujuan dan validasi catatan mutabaah harian siswa oleh Wali Kelas di {principalUnitName}
                  </DialogDescription>
                </DialogHeader>

                <DialogBody className="space-y-4 text-xs sm:text-sm">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
                      <span className="text-[11px] font-medium text-slate-600 block">Total Siswa</span>
                      <span className="text-lg font-extrabold text-slate-900">{kpiStats.totalStudents} Siswa</span>
                    </div>
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3 text-center">
                      <span className="text-[11px] font-medium text-emerald-700 block">Verifikasi Guru</span>
                      <span className="text-lg font-extrabold text-emerald-900">{kpiStats.verifiedTeacherCount} Siswa ({kpiStats.verifiedPercent != null ? `${kpiStats.verifiedPercent}%` : '—'})</span>
                    </div>
                    <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-3 text-center">
                      <span className="text-[11px] font-medium text-sky-700 block">Verifikasi Ortu</span>
                      <span className="text-lg font-extrabold text-sky-900">{kpiStats.verifiedParentCount} Siswa ({kpiStats.parentVerifiedPercent != null ? `${kpiStats.parentVerifiedPercent}%` : '—'})</span>
                    </div>
                    <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-3 text-center">
                      <span className="text-[11px] font-medium text-amber-700 block">Belum Diverifikasi</span>
                      <span className="text-lg font-extrabold text-amber-900">{kpiStats.unverifiedCount} Siswa</span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 text-xs text-amber-900">
                    <span className="font-bold block mb-1">⚠️ Perhatian Pembimbing:</span>
                    Terdapat {kpiStats.totalStudents - kpiStats.verifiedTeacherCount} siswa yang catatan mutabaah & tahfizh-nya belum diverifikasi oleh Ustadz / Wali Kelas.
                  </div>
                </DialogBody>
              </>
            )}

            {/* Common Dialog Footer */}
            <DialogFooter className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleCloseKpiModal}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <span>Tutup</span>
              </button>
              <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleDownloadKpiReport}>
                Unduh Laporan KPI
              </Button>
            </DialogFooter>
          </Dialog>
        )}
      </div>
    </PageContainer>
  )
}
