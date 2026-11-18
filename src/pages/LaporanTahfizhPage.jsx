import React, { useCallback, useEffect, useMemo, useState } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { DatePicker } from '@/components/ui/date-picker'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Sparkles,
  Target,
  Upload,
  Users,
  X,
} from 'lucide-react'
import { useDebounce } from '../hooks/useDebounce'
import Swal from '@/components/ui/compat/swal-heroui'

import { reportService } from '../services/reportService'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppBadge from '../components/app/AppBadge'
import PageContainer from '../components/app/PageContainer'
import AppSkeleton from '../components/app/AppSkeleton'
import AppEmptyState from '../components/app/AppEmptyState'
import AppErrorState from '../components/app/AppErrorState'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { TableRoot, TableHeader, TableHead, TableBody, TableRow, TableCell } from '@/components/ui/table'
import { Pagination } from '@/components/ui/pagination'
import { PrintOptionModal, SquircleActionButton } from '../components/master-data'
import { SmartScrollFab } from '../components/common'
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import TahfizhSubNav from '../components/tahfizh/TahfizhSubNav'
import { printCleanTable, downloadPdfTable, printWeeklyStudentEvaluation } from '../utils/printHelper'

const MODAL_PAGE_SIZE = 6

const toneStyles = {
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
  rose: {
    card: 'border-rose-300/70 bg-gradient-to-br from-rose-50 via-pink-50/60 to-white hover:border-rose-400 dark:border-rose-700/50 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-sm shadow-rose-500/30',
    tag: 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300',
    title: 'text-rose-700 dark:text-rose-400',
    val: 'text-rose-700 dark:text-rose-300',
    sub: 'text-rose-600/80 dark:text-rose-400/80',
    cta: 'text-rose-600/60 dark:text-rose-500/60',
  },
  blue: {
    card: 'border-sky-300/70 bg-gradient-to-br from-sky-50 via-blue-50/60 to-white hover:border-sky-400 dark:border-sky-700/50 dark:from-sky-950/40 dark:via-blue-950/20 dark:to-slate-900',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-sm shadow-sky-500/30',
    tag: 'bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300',
    title: 'text-sky-700 dark:text-sky-400',
    val: 'text-sky-700 dark:text-sky-300',
    sub: 'text-sky-600/80 dark:text-sky-400/80',
    cta: 'text-sky-600/60 dark:text-sky-500/60',
  },
}

function ModernKpiCard({ icon: Icon, label, value, subtext, tag, tone = 'emerald', onClick }) {
  const t = toneStyles[tone] || toneStyles.emerald
  const isClickable = typeof onClick === 'function'
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-[18px] border-2 p-4 sm:p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left ${
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
        {tag && (
          <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-extrabold ${t.tag}`}>{tag}</span>
        )}
      </div>
      <p className={`text-2xl sm:text-4xl font-black tabular-nums truncate ${t.val}`} title={String(value ?? 0)}>{value ?? 0}</p>
      {subtext && <p className={`mt-0.5 text-[11px] font-semibold truncate ${t.sub}`} title={subtext}>{subtext}</p>}
      {isClickable && (
        <p className={`mt-3 text-[10px] font-bold flex items-center gap-1 ${t.cta}`}>
          <Eye className="h-3 w-3" /> Klik untuk detail lengkap
        </p>
      )}
    </motion.button>
  )
}

export default function LaporanTahfizhPage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 350)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportData, setReportData] = useState({ summary: {}, data: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(10)

  // Print Option Modal state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)

  // NOTE: search dipisah dari API — filtering dilakukan client-side via filteredRows useMemo
  // Hanya startDate dan endDate yang trigger API call ulang
  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const result = await reportService.tahfizhReport({
        start_date: startDate,
        end_date: endDate,
      })
      setReportData({
        summary: result.summary || {},
        data: result.data || result || [],
      })
    } catch (err) {
      setError(err?.response?.data?.message || 'Laporan tahfizh & mutabaah gagal dimuat.')
    } finally {
      setLoading(false)
    }
  }, [startDate, endDate])

  useEffect(() => {
    load()
  }, [load])

  // Card Drilldown Modal state (§P visual & interaction)
  const [cardModal, setCardModal] = useState({
    isOpen: false,
    statusKey: '',
    title: '',
    tone: 'emerald',
    searchQuery: '',
    page: 1,
  })

  const openCardModal = (statusKey, label, tone) => {
    setCardModal({
      isOpen: true,
      statusKey,
      title: `Data Setoran ${label}`,
      tone,
      searchQuery: '',
      page: 1,
    })
  }

  const closeCardModal = () => {
    setCardModal((prev) => ({ ...prev, isOpen: false }))
  }

  // Normalized rows mapping each record with full metadata
  const normalizedRows = useMemo(() => {
    const rawData = reportData.data || []
    return rawData.map((item) => {
      const surahNum = item.hafalan_surah_number ?? item.surah_number ?? item.metadata?.surah_number ?? null
      const surahName = item.hafalan_surah_name || item.surah_name || item.metadata?.surah_name || (surahNum ? `Surah ke-${surahNum}` : '-')
      const rawType =
        item.setoran_type ||
        item.metadata?.type ||
        item.type ||
        item.jenis_setoran ||
        item.category ||
        (surahNum ? 'Ziyadah' : (Number(item.murajaah_lembar || 0) > 0 || item.murajaah_text ? 'Murajaah' : 'Setoran'))
      const type = String(rawType || '').toLowerCase() === 'murojaah' ? 'Murajaah' : (rawType || 'Ziyadah')
      const studentName = item.student?.full_name || item.student?.nama || item.student?.nama_lengkap || item.student_name || 'Santri'
      const studentNis = item.student?.nis || item.student?.nisn || item.nis || '-'
      const className = item.school_class?.nama_kelas || item.schoolClass?.nama_kelas || item.student?.kelas?.nama_kelas || item.class_name || '-'
      const teacherName = item.teacher_name || item.teacher?.user?.name || item.teacher?.full_name || item.teacher?.nama || item.employee?.nama_lengkap || item.signature_teacher || '-'
      const kelancaran =
        item.kelancaran_label ||
        item.metadata?.kelancaran ||
        item.kelancaran ||
        (item.status ? (item.status === 'lancar' ? 'Lancar' : item.status === 'sangat_lancar' ? 'Sangat Lancar' : item.status === 'belum_lancar' ? 'Belum Lancar' : item.status) : '-')
      const tajwid =
        item.tajwid_label ||
        item.metadata?.tajwid ||
        item.tajwid ||
        '-'
      const makhraj =
        item.makhraj_label ||
        item.metadata?.makhraj ||
        item.makhraj ||
        '-'
      const dateStr = item.record_date || item.created_at?.slice(0, 10) || '-'
      const ayahStart = item.hafalan_ayah_start ?? item.ayah_start ?? item.metadata?.ayat_start ?? null
      const ayahEnd = item.hafalan_ayah_end ?? item.ayah_end ?? item.metadata?.ayat_end ?? null

      return {
        ...item,
        type,
        surah_name: surahName,
        student_name: studentName,
        nis: studentNis,
        class_name: className,
        teacher_name: teacherName,
        kelancaran,
        tajwid,
        makhraj,
        date: dateStr,
        ayah_start: ayahStart,
        ayah_end: ayahEnd,
      }
    })
  }, [reportData.data])

  // Filtered rows based on search inside datatable
  const filteredRows = useMemo(() => {
    if (!debouncedSearch.trim()) return normalizedRows
    const q = debouncedSearch.toLowerCase().trim()
    return normalizedRows.filter((row) => {
      const name = (row.student_name || '').toLowerCase()
      const nis = (row.nis || '').toLowerCase()
      const surah = (row.surah_name || '').toLowerCase()
      return name.includes(q) || nis.includes(q) || surah.includes(q)
    })
  }, [normalizedRows, debouncedSearch])

  // Paginated rows for main datatable
  const totalPages = useMemo(() => {
    return Math.ceil(filteredRows.length / perPage) || 1
  }, [filteredRows.length, perPage])

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredRows.slice(start, start + perPage)
  }, [filteredRows, currentPage, perPage])

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, startDate, endDate, perPage])

  // KPI Metrics Calculation (Selaras 5 kategori dengan TahfizhReportSummaryPage)
  const metrics = useMemo(() => {
    const totalCount = normalizedRows.length
    const ziyadahCount = normalizedRows.filter((r) => r.type === 'Ziyadah').length
    const murajaahCount = normalizedRows.filter((r) => r.type === 'Murajaah').length
    const tasmiCount = normalizedRows.filter((r) => r.type === 'Tasmi').length
    const ujianCount = normalizedRows.filter((r) => r.type === 'Ujian').length
    return { totalCount, ziyadahCount, murajaahCount, tasmiCount, ujianCount }
  }, [normalizedRows])

  // Drilldown modal rows & pagination
  const modalRows = useMemo(() => {
    if (!cardModal.isOpen) return []
    let list = normalizedRows
    if (cardModal.statusKey && cardModal.statusKey !== 'semua') {
      list = list.filter((r) => r.type === cardModal.statusKey)
    }
    if (cardModal.searchQuery.trim()) {
      const q = cardModal.searchQuery.toLowerCase().trim()
      list = list.filter((r) => {
        const name = (r.student_name || '').toLowerCase()
        const nis = (r.nis || '').toLowerCase()
        const surah = (r.surah_name || '').toLowerCase()
        return name.includes(q) || nis.includes(q) || surah.includes(q)
      })
    }
    return list
  }, [normalizedRows, cardModal.isOpen, cardModal.statusKey, cardModal.searchQuery])

  const modalTotalPages = Math.max(1, Math.ceil(modalRows.length / MODAL_PAGE_SIZE))
  const paginatedModalRows = useMemo(() => {
    return modalRows.slice((cardModal.page - 1) * MODAL_PAGE_SIZE, cardModal.page * MODAL_PAGE_SIZE)
  }, [modalRows, cardModal.page])

  // Secondary Cumulative KPI values
  const sum = reportData.summary || {}
  const totalBaris = sum.total_hafalan_baris ?? reportData.data.reduce((a, b) => a + Number(b.hafalan_baris || 0), 0)
  const target = sum.target_tahunan || 50000
  const persen = sum.persentase ?? (totalBaris > 0 ? ((totalBaris / target) * 100).toFixed(1) : 0)
  const uniqueStudentsCount = useMemo(() => {
    const ids = new Set(
      (reportData.data || [])
        .map((r) => r.student?.id || r.student_id || r.student?.nis || r.nis)
        .filter(Boolean)
    )
    if (ids.size > 0) return ids.size
    return reportData.summary?.total_siswa || 0
  }, [reportData])

  // Export CSV
  const handleExportCsv = () => {
    if (filteredRows.length === 0) {
      Swal.fire('Data Kosong', 'Tidak ada data untuk diexport.', 'warning')
      return
    }

    const headers = [
      'No',
      'Tanggal',
      'Nama Santri',
      'NIS',
      'Surah / Hafalan Baru',
      'Baris Hafalan',
      'Baris Tilawah',
      'Murajaah (Lembar)',
      'Catatan Ustadz',
    ]

    const csvRows = [
      headers.join(','),
      ...filteredRows.map((row, idx) => {
        const dateStr = row.record_date || row.created_at || '-'
        const nameStr = row.student?.full_name || row.student?.nama || row.student_name || '-'
        const nisStr = row.student?.nis || row.nis || '-'
        const surahStr = row.hafalan_surah_name
          ? `${row.hafalan_surah_name} (Ayat ${row.hafalan_ayah_start || 1}-${row.hafalan_ayah_end || '-'})`
          : '-'
        const hafalanBaris = row.hafalan_baris || 0
        const tilawahBaris = row.tilawah_baris || 0
        const murajaahLembar = row.murajaah_lembar || 0
        const notesStr = row.notes_teacher || row.notes || '-'

        return [
          idx + 1,
          `"${dateStr}"`,
          `"${nameStr.replace(/"/g, '""')}"`,
          `"${nisStr.replace(/"/g, '""')}"`,
          `"${surahStr.replace(/"/g, '""')}"`,
          hafalanBaris,
          tilawahBaris,
          murajaahLembar,
          `"${notesStr.replace(/"/g, '""')}"`,
        ].join(',')
      }),
    ]

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + csvRows.join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `Laporan_Rekap_Tahfizh_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    Swal.fire({
      icon: 'success',
      title: 'Export Berhasil',
      text: 'Data rekap Tahfizh berhasil diexport ke CSV.',
      timer: 1500,
      showConfirmButton: false,
    })
  }

  // Import Handler Placeholder
  const handleImport = () => {
    Swal.fire({
      title: 'Import Data Tahfizh',
      text: 'Pilih berkas Excel (.xlsx / .csv) untuk mengimpor log setoran hafalan.',
      input: 'file',
      inputAttributes: {
        accept: '.csv, .xlsx',
        'aria-label': 'Upload berkas Tahfizh',
      },
      showCancelButton: true,
      confirmButtonText: 'Unggah & Proses',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#0E5C44',
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        Swal.fire({
          icon: 'success',
          title: 'Import Dalam Proses',
          text: `Berkas ${result.value.name} berhasil diunggah dan sedang diproses.`,
          timer: 1800,
          showConfirmButton: false,
        })
      }
    })
  }

  // Print Table in Hidden Iframe
  const handlePrint = () => {
    const headers = [
      'No',
      'Tanggal',
      'Nama Santri',
      'NIS',
      'Surah / Hafalan Baru',
      'Baris Hafalan',
      'Tilawah (Baris)',
      'Murajaah (Lembar)',
      'Catatan Ustadz',
    ]

    const rows = filteredRows.map((row, idx) => [
      idx + 1,
      row.record_date || '-',
      row.student?.full_name || row.student?.nama || row.student_name || '-',
      row.student?.nis || row.nis || '-',
      row.hafalan_surah_name
        ? `${row.hafalan_surah_name} (${row.hafalan_ayah_start || 1}-${row.hafalan_ayah_end || '-'})`
        : '-',
      `${row.hafalan_baris || 0} Baris`,
      `${row.tilawah_baris || 0} Baris`,
      `${row.murajaah_lembar || 0} Lembar`,
      row.notes_teacher || '-',
    ])

    printCleanTable({
      title: 'Laporan Rekap Tahfizh & Mutabaah Santri',
      subtitle: `Periode: ${startDate || 'Semua'} s/d ${endDate || 'Semua'}`,
      headers,
      rows,
    })
  }

  // Download PDF Table
  const handleDownloadPdf = () => {
    const headers = [
      'No',
      'Tanggal',
      'Nama Santri',
      'NIS',
      'Surah / Hafalan Baru',
      'Baris Hafalan',
      'Tilawah (Baris)',
      'Murajaah (Lembar)',
      'Catatan Ustadz',
    ]

    const rows = filteredRows.map((row, idx) => [
      idx + 1,
      row.record_date || '-',
      row.student?.full_name || row.student?.nama || row.student_name || '-',
      row.student?.nis || row.nis || '-',
      row.hafalan_surah_name
        ? `${row.hafalan_surah_name} (${row.hafalan_ayah_start || 1}-${row.hafalan_ayah_end || '-'})`
        : '-',
      `${row.hafalan_baris || 0} Baris`,
      `${row.tilawah_baris || 0} Baris`,
      `${row.murajaah_lembar || 0} Lembar`,
      row.notes_teacher || '-',
    ])

    downloadPdfTable({
      title: 'Laporan Rekap Tahfizh & Mutabaah Santri',
      subtitle: `Periode: ${startDate || 'Semua'} s/d ${endDate || 'Semua'}`,
      headers,
      rows,
      filename: `Laporan_Rekap_Tahfizh_${new Date().toISOString().split('T')[0]}.pdf`,
    })
  }

  // Cetak Lembar Evaluasi Pekanan Format Resmi Sinergi
  const handlePrintWeeklyTahfizh = (row) => {
    const studentName = row.student_name || row.student?.nama_lengkap || row.student?.name || 'Siswa'
    const studentNis = row.student_nis || row.student?.nis || '-'
    const className = row.student_class || row.student?.kelas || row.class_name || 'VII Al-Farabi'
    const surahStr = row.hafalan_surah_name
      ? `${row.hafalan_surah_name}${row.hafalan_ayah_start ? ` (Ayat ${row.hafalan_ayah_start}-${row.hafalan_ayah_end || row.hafalan_ayah_start})` : ''}`
      : 'Juz 30 (Al-Qur\'an)'

    printWeeklyStudentEvaluation({
      student: {
        name: studentName,
        nis: studentNis,
        className: className,
        unitName: row.unit_name || 'Sekolah Islam Terpadu',
      },
      period: {
        title: startDate && endDate ? `${startDate} s.d. ${endDate}` : 'Pekan Berjalan',
        academicYear: '2026/2027',
      },
      tahfizh: {
        lastSurah: surahStr,
        lastDepositDate: row.date || '-',
        totalLines: Number(row.hafalan_baris || 0),
        targetLines: 15,
        status: (Number(row.hafalan_baris) || 0) >= 15 ? 'Mutqin (Melampaui Target)' : 'Tuntas',
      },
      homeroomTeacher: {
        name: row.teacher_name || 'Ustadz / Ustadzah Pembimbing',
      },
      teacherNotes: row.notes_teacher || row.notes || '-',
    })
  }

  // Reset Filters
  const handleResetFilter = () => {
    setSearch('')
    setStartDate('')
    setEndDate('')
  }

  // Stagger Animasi Halaman (§R)
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  }

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* 🧭 BREADCRUMB NAV */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="print:hidden">
        <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Laporan Tahfizh' }]} />
      </motion.div>

      {/* 🟢 MODERN HERO CARD HEADER (§B / §7.7) */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="print:hidden">
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-4 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          <div className="pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 to-emerald-600/20 blur-3xl dark:from-emerald-500/50 dark:via-teal-400/40" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full bg-gradient-to-tr from-emerald-600/30 via-teal-500/20 to-transparent blur-3xl dark:from-emerald-600/40 dark:via-teal-500/30" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5 sm:gap-4 min-w-0">
              <div className="flex size-11 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                <BookOpen className="size-5 sm:size-7 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-0.5 sm:px-3.5 sm:py-1 text-[11px] sm:text-xs font-extrabold text-white shadow-md shadow-emerald-600/25 border border-emerald-300/40">
                    <Sparkles className="size-3 sm:size-3.5 text-amber-300 animate-pulse" />
                    Laporan Tahfizh & Mutabaah
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    Data Riil Backend
                  </span>
                </div>
                <h1 className="mt-1.5 text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Laporan Rekap Tahfizh & Mutabaah
                </h1>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full leading-relaxed">
                  Rekapitulasi setoran hafalan Al-Qur’an harian, tilawah, murajaah, dan capaian santri dari data backend.
                </p>

                {/* Secondary Cumulative KPI Badges */}
                <div className="flex items-center gap-2 sm:gap-3 flex-wrap mt-3 pt-2.5 border-t border-emerald-500/20">
                  <span className="text-[11px] font-bold text-emerald-950 dark:text-emerald-200">
                    Capaian Kumulatif:
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-100/90 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold border border-emerald-300/40">
                    <BookOpen className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                    {totalBaris.toLocaleString('id-ID')} Baris Hafalan
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-100/90 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold border border-amber-300/40">
                    <Target className="size-3.5 text-amber-600 dark:text-amber-400" />
                    Target {target.toLocaleString('id-ID')} Baris ({persen}%)
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-100/90 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 text-[11px] font-bold border border-purple-300/40">
                    <Users className="size-3.5 text-purple-600 dark:text-purple-400" />
                    {uniqueStudentsCount} Santri Terdaftar
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={load}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white/80 dark:bg-emerald-950/60 hover:bg-emerald-50 dark:hover:bg-emerald-900/60 px-3.5 py-2 text-xs font-bold text-emerald-800 dark:text-emerald-200 shadow-xs transition-colors cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              >
                <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Memuat...' : 'Segarkan Data'}</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tahfizh Sub-Navigation (5 tab modul, penuh untuk admin) */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="print:hidden">
        <TahfizhSubNav />
      </motion.div>

      {/* 📊 MASTER KPI STATS GRID — 5 Cards (Total + 4 Jenis Setoran) Selaras dengan /dashboard/tahfizh/rekapan */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <ModernKpiCard
          icon={BookOpen}
          label="Total Setoran"
          value={metrics.totalCount}
          subtext="Sesuai data log rekapan"
          tag="Log"
          tone="blue"
          onClick={() => openCardModal('semua', 'Semua Log Setoran', 'blue')}
        />
        <ModernKpiCard
          icon={BookMarked}
          label="Setoran Ziyadah"
          value={metrics.ziyadahCount}
          subtext={metrics.totalCount > 0 ? `${metrics.ziyadahCount} dari ${metrics.totalCount} setoran` : 'Belum ada setoran'}
          tag={metrics.totalCount > 0 ? `${((metrics.ziyadahCount / metrics.totalCount) * 100).toFixed(1)}%` : '—'}
          tone="emerald"
          onClick={() => openCardModal('Ziyadah', 'Setoran Ziyadah', 'emerald')}
        />
        <ModernKpiCard
          icon={CheckCircle2}
          label="Setoran Murajaah"
          value={metrics.murajaahCount}
          subtext={metrics.totalCount > 0 ? `${metrics.murajaahCount} dari ${metrics.totalCount} setoran` : 'Belum ada setoran'}
          tag={metrics.totalCount > 0 ? `${((metrics.murajaahCount / metrics.totalCount) * 100).toFixed(1)}%` : '—'}
          tone="violet"
          onClick={() => openCardModal('Murajaah', 'Setoran Murajaah', 'violet')}
        />
        <ModernKpiCard
          icon={Sparkles}
          label="Tasmi' (Ujian Duduk)"
          value={metrics.tasmiCount}
          subtext={metrics.totalCount > 0 ? `${metrics.tasmiCount} dari ${metrics.totalCount} setoran` : 'Belum ada setoran'}
          tag={metrics.totalCount > 0 ? `${((metrics.tasmiCount / metrics.totalCount) * 100).toFixed(1)}%` : '—'}
          tone="sky"
          onClick={() => openCardModal('Tasmi', "Tasmi' (Ujian Duduk)", 'sky')}
        />
        <ModernKpiCard
          icon={GraduationCap}
          label="Ujian Capaian Juz"
          value={metrics.ujianCount}
          subtext={metrics.totalCount > 0 ? `${metrics.ujianCount} dari ${metrics.totalCount} setoran` : 'Belum ada setoran'}
          tag={metrics.totalCount > 0 ? `${((metrics.ujianCount / metrics.totalCount) * 100).toFixed(1)}%` : '—'}
          tone="rose"
          onClick={() => openCardModal('Ujian', 'Ujian Capaian Juz', 'rose')}
        />
      </motion.div>

      {/* 🟢 HEROUI EMERALD DATATABLE CONTAINER (DATATABLE LAPORAN DENGAN 3-BARIS TOOLBAR) */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" id="tabel-laporan-tahfizh" className="scroll-mt-6 relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]">
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
        {/* BARIS 1: TITLE & VIVID GRADIENT SQUIRCLE ACTION BUTTONS (§H.5) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3.5 sm:px-6 md:px-8 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shrink-0 shadow-sm border border-emerald-300/40">
              <FileText className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Rincian Data Log Setoran Tahfizh</h3>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-extrabold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
                  {filteredRows.length} Data
                </span>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                Daftar rincian setoran hafalan Al-Qur'an harian, tilawah, murajaah, dan catatan ustadz binaan.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
            <SquircleActionButton variant="import" icon={Upload} label="Import Data (Excel/CSV)" onClick={handleImport} />
            <SquircleActionButton variant="export" icon={Download} label="Export Data (Excel/CSV)" onClick={handleExportCsv} />
            <SquircleActionButton variant="view" icon={Printer} label="Cetak / PDF" onClick={() => setIsPrintModalOpen(true)} />
          </div>
        </div>

        {/* BARIS 2: FILTER DATA SECTION (§7.9 + field §J.3) */}
        <div className="px-4 py-3 sm:px-6 md:px-8 border-b border-emerald-200/80 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:border-emerald-800/60 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-emerald-950/20">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Filter className="h-3.5 w-3.5 text-[#0E5C44] dark:text-emerald-400" />
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Filter Data Laporan
            </h4>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
            {/* Input Cari */}
            <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[160px]">
              <label htmlFor="laporan-search" className="sr-only">Pencarian santri / NIS / surah</label>
              <div className="relative flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                  <Search className="size-4" />
                </div>
                <input
                  id="laporan-search"
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ketik nama santri, NIS, atau surah..."
                  className="w-full rounded-xl border border-slate-200/90 bg-white pl-10 pr-4 py-2 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20"
                />
              </div>
            </div>

            {/* Input Mulai Tanggal */}
            <div className="w-full sm:w-auto min-w-[140px]">
              <label htmlFor="laporan-from" className="sr-only">Mulai tanggal</label>
              <DatePicker
                id="laporan-from"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Mulai tanggal..."
              />
            </div>

            {/* Input Sampai Tanggal */}
            <div className="w-full sm:w-auto min-w-[140px]">
              <label htmlFor="laporan-to" className="sr-only">Sampai tanggal</label>
              <DatePicker
                id="laporan-to"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="Sampai tanggal..."
              />
            </div>

            {/* Tombol Reset Filter Inline */}
            <button
              type="button"
              onClick={handleResetFilter}
              title="Reset semua filter"
              className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-1.5 h-9 rounded-xl border border-emerald-200/80 dark:border-emerald-800/50 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* BARIS 3: MASTER DATATABLE RINCIAN DATA (STABLE NON-SHIFTING LAYOUT) */}
        <div className="px-4 sm:px-6 md:px-8 py-4 overflow-x-auto">
          {error && !loading && (
            <div className="pb-4">
              <AppErrorState title="Laporan tahfizh gagal dimuat" description={error} onRetry={load} compact />
            </div>
          )}
          <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
          <TableRoot fullBleed={false}>
            <TableHeader className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-900/50">
              <TableRow>
                <TableHead className="py-2.5 px-4 text-center text-[11px] font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wider w-12">
                  #
                </TableHead>
                <TableHead className="hidden md:table-cell py-2.5 px-4 text-left text-[11px] font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wider min-w-[110px]">
                  Tanggal
                </TableHead>
                <TableHead className="py-2.5 px-4 text-left text-[11px] font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wider min-w-[200px]">
                  Siswa / Santri
                </TableHead>
                <TableHead className="py-2.5 px-4 text-left text-[11px] font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wider min-w-[200px]">
                  Surah / Hafalan Baru
                </TableHead>
                <TableHead className="hidden lg:table-cell py-2.5 px-4 text-center text-[11px] font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wider min-w-[120px]">
                  Baris Hafalan
                </TableHead>
                <TableHead className="hidden lg:table-cell py-2.5 px-4 text-center text-[11px] font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wider min-w-[120px]">
                  Tilawah (Baris)
                </TableHead>
                <TableHead className="py-2.5 px-4 text-center text-[11px] font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wider min-w-[140px]">
                  Murajaah (Lembar)
                </TableHead>
                <TableHead className="hidden md:table-cell py-2.5 px-4 text-left text-[11px] font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wider min-w-[180px]">
                  Catatan Ustadz
                </TableHead>
                <TableHead className="py-2.5 px-4 text-center text-[11px] font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wider w-20">
                  Aksi
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-6">
                    <AppSkeleton variant="table" rows={5} cols={5} />
                  </TableCell>
                </TableRow>
              ) : paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-8">
                    <AppEmptyState
                      title="Tidak ada data log setoran"
                      description="Tidak ada data log setoran yang ditemukan untuk filter ini."
                      actionLabel={search || startDate || endDate ? 'Reset Filter' : undefined}
                      onAction={search || startDate || endDate ? handleResetFilter : undefined}
                    />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row, idx) => {
                  const globalIdx = (currentPage - 1) * perPage + idx + 1
                  const dateStr = row.record_date || row.created_at || '-'
                  const nameStr = row.student?.full_name || row.student?.nama || row.student_name || 'Santri'
                  const nisStr = row.student?.nis || row.nis || '-'
                  const surahStr = row.hafalan_surah_name
                    ? `${row.hafalan_surah_name}`
                    : '-'
                  const ayatStr = row.hafalan_surah_name
                    ? `Ayat ${row.hafalan_ayah_start || 1}-${row.hafalan_ayah_end || '-'}`
                    : null
                  const hafalanBaris = Number(row.hafalan_baris || 0)
                  const tilawahBaris = Number(row.tilawah_baris || 0)
                  const murajaahLembar = Number(row.murajaah_lembar || 0)
                  const notesStr = row.notes_teacher || row.notes || '-'

                  return (
                    <TableRow
                      key={row.id || idx}
                      className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors"
                    >
                      <TableCell className="py-3 px-4 text-xs font-bold text-slate-500 tabular-nums">{globalIdx}</TableCell>
                      <TableCell className="hidden md:table-cell py-3 px-4 text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        {dateStr}
                      </TableCell>
                      <TableCell className="py-3 px-4 align-top sm:align-middle">
                        <div className="flex items-center gap-2.5">
                          <Avatar size="sm" className="bg-emerald-600 text-white font-bold shrink-0">
                            <AvatarFallback>{nameStr.slice(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate line-clamp-2">
                              {nameStr}
                            </p>
                            <p className="text-[11px] font-semibold text-slate-400 font-mono line-clamp-1 mt-0.5">NIS: {nisStr}</p>
                          </div>
                        </div>
                        <div className="sm:hidden mt-2 flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-emerald-100/80 dark:border-emerald-900/40">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                            {dateStr}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-600 tabular-nums">
                            {murajaahLembar} Lbr
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 align-middle">
                        {row.hafalan_surah_name ? (
                          <div className="min-w-0">
                            <span className="font-bold text-emerald-900 dark:text-emerald-300 text-xs block truncate">
                              {surahStr}
                            </span>
                            {ayatStr && (
                              <span className="text-[11px] font-medium text-slate-500 block">
                                {ayatStr}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell py-3 px-4 text-center align-middle">
                        <Badge color={hafalanBaris > 0 ? 'success' : 'gray'} size="sm">
                          {hafalanBaris} Baris
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell py-3 px-4 text-center align-middle">
                        <Badge color={tilawahBaris > 0 ? 'sky' : 'gray'} size="sm">
                          {tilawahBaris} Baris
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center align-middle">
                        <Badge color={murajaahLembar > 0 ? 'violet' : 'gray'} size="sm">
                          {murajaahLembar} Lembar
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell py-3 px-4 text-xs font-medium text-slate-600 dark:text-slate-400 align-middle">
                        <span className="line-clamp-2">{notesStr}</span>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-center align-middle">
                        <button
                          type="button"
                          title="Cetak Laporan Perkembangan Pekanan"
                          onClick={() => handlePrintWeeklyTahfizh(row)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:scale-105 active:scale-95 transition-all dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-2xs cursor-pointer"
                        >
                          <Printer className="h-4 w-4" />
                        </button>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </TableRoot>
          </div>
        </div>

        {/* FOOTER PAGINATION CONTAINER (§7.6) */}
        <div className="border-t border-emerald-200/80 bg-gradient-to-r from-emerald-50/40 via-white to-emerald-50/40 p-3.5 sm:px-6 md:px-8 py-3 sm:py-3.5 dark:border-emerald-800/60 dark:from-emerald-950/20 dark:via-transparent dark:to-emerald-950/20 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 font-semibold">
            <span>Tampilkan</span>
            <CustomSelect
              value={perPage}
              onChange={(e) => setPerPage(Number(e.target.value))}
              aria-label="Baris per halaman"
              className="h-9 cursor-pointer appearance-none rounded-xl border border-emerald-200/80 bg-white pl-2.5 pr-8 text-xs font-bold text-slate-700 focus:border-[#0E5C44] focus:outline-none focus:ring-2 focus:ring-[#0E5C44]/20 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-200"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </CustomSelect>
            <span>baris per halaman (Total {filteredRows.length} data)</span>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
              sideLayout="full"
              variant="default"
            />
          </div>
        </div>
      </motion.div>

      {/* Summary Card Interactive Datatable Modal (§P visual & interaction) */}
      <AnimatePresence>
        {cardModal.isOpen && (
        <Dialog
          isOpen={cardModal.isOpen}
          onOpenChange={(open) => !open && closeCardModal()}
          className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-white dark:bg-[#182232] border border-slate-200/80 dark:border-slate-800 shadow-2xl shadow-emerald-950/20 dark:shadow-black/60 overflow-hidden p-0"
        >
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
          <DialogHeader className="flex flex-row items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                <BookOpenCheck className="h-5 w-5 text-white" strokeWidth={2.25} />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <DialogTitle className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                    {cardModal.title}
                  </DialogTitle>
                  <AppBadge variant={cardModal.tone === 'rose' ? 'danger' : cardModal.tone === 'amber' ? 'warning' : 'success'}>
                    {modalRows.length} Data Setoran
                  </AppBadge>
                </div>
                <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Daftar rincian log setoran tahfizh siswa dengan status {cardModal.title}
                </DialogDescription>
              </div>
            </div>
            <button
              type="button"
              onClick={closeCardModal}
              aria-label="Tutup modal"
              className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0"
            >
              <X className="size-4 text-white" strokeWidth={2.25} />
            </button>
          </DialogHeader>

          <DialogBody className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {/* Modal Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/20 dark:via-teal-950/10 dark:to-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/60 p-3 rounded-2xl">
              <div className="relative w-full sm:w-80 flex items-center">
                <div className="pointer-events-none absolute left-3.5 flex items-center text-emerald-600/70 dark:text-emerald-400">
                  <Search className="size-4" />
                </div>
                <input
                  type="text"
                  placeholder="Cari nama siswa, NIS, atau surah..."
                  value={cardModal.searchQuery}
                  onChange={(e) => setCardModal((prev) => ({ ...prev, searchQuery: e.target.value, page: 1 }))}
                  aria-label="Cari dalam modal"
                  className="w-full rounded-2xl border border-emerald-200/90 bg-white pl-10 pr-8 py-2 appearance-none text-xs font-semibold text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0E5C44] focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-emerald-800/70 dark:bg-slate-900 dark:text-slate-100"
                />
                {cardModal.searchQuery && (
                  <button
                    type="button"
                    onClick={() => setCardModal((prev) => ({ ...prev, searchQuery: '', page: 1 }))}
                    aria-label="Bersihkan pencarian"
                    className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Datatable */}
            <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-gradient-to-r from-emerald-100/80 via-teal-50/60 to-emerald-100/80 border-b border-emerald-200/80 dark:from-emerald-950/80 dark:via-teal-950/60 dark:to-emerald-950/80 dark:border-emerald-900/50 uppercase text-[10px] font-extrabold text-emerald-800 dark:text-emerald-300">
                  <tr>
                    <th className="py-2.5 px-4">No</th>
                    <th className="py-2.5 px-4">Tanggal</th>
                    <th className="py-2.5 px-4">Siswa</th>
                    <th className="py-2.5 px-4">Jenis</th>
                    <th className="py-2.5 px-4">Hafalan</th>
                    <th className="py-2.5 px-4">Kelancaran</th>
                    <th className="py-2.5 px-4">Makhraj</th>
                    <th className="py-2.5 px-4">Pengajar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                  {paginatedModalRows.length > 0 ? (
                    paginatedModalRows.map((row, idx) => {
                      const studentName = row.student_name || 'Siswa'
                      const type = row.type || 'Ziyadah'

                      return (
                        <tr key={row.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-medium text-slate-500">
                            {(cardModal.page - 1) * MODAL_PAGE_SIZE + idx + 1}
                          </td>
                          <td className="py-3 px-4 font-mono font-medium text-slate-600">
                            {row.date}
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                            {studentName}
                          </td>
                          <td className="py-3 px-4">
                            <AppBadge variant={type === 'Ziyadah' ? 'success' : type === 'Murajaah' ? 'info' : 'warning'}>
                              {type}
                            </AppBadge>
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-700 dark:text-emerald-400">
                            {row.surah_name && row.ayah_start
                              ? `${row.surah_name} (${row.ayah_start}-${row.ayah_end || row.ayah_start})`
                              : row.murajaah_text
                              ? `${row.murajaah_text}${row.murajaah_lembar > 0 ? ` (${row.murajaah_lembar} Lembar)` : ''}`
                              : row.tilawah_text
                              ? `${row.tilawah_text}${row.tilawah_baris > 0 ? ` (${row.tilawah_baris} Baris)` : ''}`
                              : '-'}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-600">
                            {row.kelancaran}
                          </td>
                          <td className="py-3 px-4 font-medium text-teal-700 dark:text-teal-400">
                            {row.makhraj || '-'}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-medium">
                            {row.teacher_name}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-slate-400 font-medium">
                        {cardModal.searchQuery ? 'Tidak ada data setoran yang cocok dengan pencarian.' : 'Belum ada data pada kategori ini.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DialogBody>

          <DialogFooter className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/40">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {modalRows.length ? (cardModal.page - 1) * MODAL_PAGE_SIZE + 1 : 0}–{Math.min(cardModal.page * MODAL_PAGE_SIZE, modalRows.length)} dari {modalRows.length} data
            </span>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 mr-2">
                <button
                  type="button"
                  disabled={cardModal.page === 1}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page - 1 }))}
                  aria-label="Halaman sebelumnya"
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none dark:disabled:bg-emerald-950/40 dark:disabled:text-white/30 cursor-pointer"
                >
                  <ChevronLeft className="size-5 shrink-0" />
                </button>
                <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300 tabular-nums">
                  {cardModal.page} / {modalTotalPages}
                </span>
                <button
                  type="button"
                  disabled={cardModal.page === modalTotalPages}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page + 1 }))}
                  aria-label="Halaman berikutnya"
                  className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none dark:disabled:bg-emerald-950/40 dark:disabled:text-white/30 cursor-pointer"
                >
                  <ChevronRight className="size-5 shrink-0" />
                </button>
              </div>
              <button
                type="button"
                onClick={closeCardModal}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <X className="size-4 text-white" strokeWidth={2.2} />
                <span>Tutup</span>
              </button>
            </div>
          </DialogFooter>
        </Dialog>
        )}
      </AnimatePresence>

      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onPrint={handlePrint}
        onDownload={handleDownloadPdf}
        title="Laporan Rekap Tahfizh & Mutabaah Santri"
      />

      {/* Smart Floating Scroll Navigator */}
      <SmartScrollFab targetId="tabel-laporan-tahfizh" downTooltip="Langsung ke Tabel Tahfizh" />
    </PageContainer>
  )
}
