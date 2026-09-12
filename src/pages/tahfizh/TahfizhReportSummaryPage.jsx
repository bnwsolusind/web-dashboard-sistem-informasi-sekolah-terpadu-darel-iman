import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpDown,
  BookMarked,
  BookOpen,
  BookOpenCheck,
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Eye,
  FileSpreadsheet,
  Filter,
  GraduationCap,
  Layers,
  MoreVertical,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
  UserX,
  X,
  Zap,
} from 'lucide-react'
import { Download1, Upload1 } from '@tailgrids/icons'

import { useAuthStore } from '../../stores/authStore'
import { hasAnyRole } from '../../auth/portalResolver'
import api from '../../services/api'
import { reportService } from '../../services/reportService'

import PageContainer from '../../components/app/PageContainer'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import AppBadge from '../../components/app/AppBadge'
import AppSkeleton from '../../components/app/AppSkeleton'
import AppEmptyState from '../../components/app/AppEmptyState'
import TahfizhSubNav from '../../components/tahfizh/TahfizhSubNav'
import {
  MasterDataPage,
  MasterPageHeader,
  MasterStatCard,
  MasterStatsGrid,
  MasterErrorState,
  PrintOptionModal,
  SquircleActionButton,
} from '../../components/master-data'
import { printCleanTable, downloadPdfTable } from '../../utils/printHelper'

import { Button } from '@/components/tailgrids/core/button'
import { Input } from '@/components/tailgrids/core/input'
import { Pagination } from '@/components/tailgrids/core/pagination'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/tailgrids/core/hover-card'
import {
  Dialog,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/tailgrids/core/dialog'
import { Backdrop, OverlayWrapper } from '@/components/tailgrids/core/overlay'

const MODAL_PAGE_SIZE = 6
const today = () => new Date().toISOString().slice(0, 10)
const formatAngka = (value) => new Intl.NumberFormat('id-ID').format(Number(value || 0))

const getQuranJuz = (surahNumber, ayahNumber) => {
  if (!surahNumber) return null
  const juzStarts = [
    [1, 1], [2, 142], [2, 253], [3, 93], [4, 24], [4, 148], [5, 82], [6, 111], [7, 88], [8, 41],
    [9, 93], [11, 6], [12, 53], [15, 1], [17, 1], [18, 75], [21, 1], [23, 1], [25, 21], [27, 56],
    [29, 46], [33, 31], [36, 28], [39, 32], [41, 47], [46, 1], [51, 31], [58, 1], [67, 1], [78, 1]
  ]
  let juz = 1
  juzStarts.forEach(([surah, ayah], index) => {
    if (Number(surahNumber) > surah || (Number(surahNumber) === surah && Number(ayahNumber || 1) >= ayah)) {
      juz = index + 1
    }
  })
  return juz
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

const toneStyles = {
  emerald: {
    cardBg: 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-900/50',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/80',
    iconColor: 'text-emerald-700 dark:text-emerald-300',
    badge: 'bg-emerald-200/80 text-emerald-800 dark:bg-emerald-900/90 dark:text-emerald-200',
    text: 'text-emerald-700 dark:text-emerald-400',
  },
  violet: {
    cardBg: 'bg-violet-50/70 dark:bg-violet-950/40 border-violet-200/80 dark:border-violet-900/50',
    iconBg: 'bg-violet-100 dark:bg-violet-900/80',
    iconColor: 'text-violet-700 dark:text-violet-300',
    badge: 'bg-violet-200/80 text-violet-800 dark:bg-violet-900/90 dark:text-violet-200',
    text: 'text-violet-700 dark:text-violet-400',
  },
  sky: {
    cardBg: 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-200/80 dark:border-sky-900/50',
    iconBg: 'bg-sky-100 dark:bg-sky-900/80',
    iconColor: 'text-sky-700 dark:text-sky-300',
    badge: 'bg-sky-200/80 text-sky-800 dark:bg-sky-900/90 dark:text-sky-200',
    text: 'text-sky-700 dark:text-sky-400',
  },
  rose: {
    cardBg: 'bg-rose-50/70 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-900/50',
    iconBg: 'bg-rose-100 dark:bg-rose-900/80',
    iconColor: 'text-rose-700 dark:text-rose-300',
    badge: 'bg-rose-200/80 text-rose-800 dark:bg-rose-900/90 dark:text-rose-200',
    text: 'text-rose-700 dark:text-rose-400',
  },
  amber: {
    cardBg: 'bg-amber-50/70 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-900/50',
    iconBg: 'bg-amber-100 dark:bg-amber-900/80',
    iconColor: 'text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-200/80 text-amber-800 dark:bg-amber-900/90 dark:text-amber-200',
    text: 'text-amber-700 dark:text-amber-400',
  },
}

function EmbeddedWrapper({ children, className = '' }) {
  return <div className={className}>{children}</div>
}

export default function TahfizhReportSummaryPage({ embedded = false, defaultClassId = null, showHero = false, initialRecords = null } = {}) {
  const user = useAuthStore((state) => state.user)

  // Determine user roles
  const userRoles = useMemo(() => {
    if (!user) return []
    if (Array.isArray(user.roles)) return user.roles.map((r) => (typeof r === 'string' ? r : r?.name || ''))
    if (user.role) return [typeof user.role === 'string' ? user.role : user.role?.name || '']
    return []
  }, [user])

  // 1. Yayasan, Super Admin, Admin (Global Scope se-Yayasan)
  const isGlobalScope = useMemo(() => {
    return hasAnyRole(userRoles, [
      'Pengurus Yayasan', 'Yayasan', 'Ketua Yayasan', 'sekretaris_yayasan', 'bendahara_yayasan', 'pengurus_yayasan',
      'Super Admin', 'SuperAdmin', 'super_admin', 'superadmin',
      'Admin', 'admin', 'administrator'
    ])
  }, [userRoles])

  // 2. Musyrif / Musyrifah (Hanya Asrama Ponpes)
  const isMusyrifRole = useMemo(() => {
    if (isGlobalScope) return false
    return hasAnyRole(userRoles, [
      'Musyrif', 'musyrif', 'Musyrifah', 'musyrifah', 'Pengasuh', 'Wali Asrama', 'Pembimbing Asrama'
    ])
  }, [userRoles, isGlobalScope])

  // 3. Kepala Sekolah, Waka, & Divisi Pendidikan (Seluruh kelas di unit pendidikannya)
  const isUnitLeader = useMemo(() => {
    if (isGlobalScope || isMusyrifRole) return false
    return hasAnyRole(userRoles, [
      'Kepala Sekolah', 'kepala_sekolah', 'KepalaSekolah', 'kepsek',
      'Wakil Kepala Sekolah', 'Waka Kurikulum', 'Wakil Kurikulum', 'Waka Kesiswaan', 'Wakil Kesiswaan',
      'Divisi Pendidikan', 'divisi_pendidikan', 'DivisiPendidikan', 'Kepala Bidang Pendidikan',
      'Divisi Kurikulum', 'Divisi Kesiswaan', 'Divisi Bahasa', 'Divisi Program Khusus'
    ])
  }, [userRoles, isGlobalScope, isMusyrifRole])

  // 4. Guru Tahfizh, Guru BK, Wali Kelas (Seluruh kelas binaan tahfizh di unitnya)
  const isTahfizhOrCounselorRole = useMemo(() => {
    if (isGlobalScope || isMusyrifRole || isUnitLeader) return false
    return hasAnyRole(userRoles, [
      'Guru Tahfizh', 'guru_tahfizh', 'Guru BK', 'guru_bk', 'Wali Kelas', 'wali_kelas', 'walas'
    ])
  }, [userRoles, isGlobalScope, isMusyrifRole, isUnitLeader])

  // 5. Guru / Guru Mapel Murni (Hanya kelas & rombel yang diajarnya saja)
  const isSubjectTeacherOnly = useMemo(() => {
    if (isGlobalScope || isMusyrifRole || isUnitLeader || isTahfizhOrCounselorRole) return false
    return hasAnyRole(userRoles, [
      'Guru', 'guru', 'Guru Mata Pelajaran', 'guru_mata_pelajaran', 'Guru Mapel', 'Guru PAI', 'Pembimbing'
    ])
  }, [userRoles, isGlobalScope, isMusyrifRole, isUnitLeader, isTahfizhOrCounselorRole])

  const userAssignedUnitName = useMemo(() => {
    return user?.education_unit?.name ||
      user?.education_unit_name ||
      user?.unit_name ||
      user?.employee?.unit?.name ||
      (typeof user?.unit === 'string' ? user.unit : user?.unit?.name || '') ||
      (typeof user?.education_unit === 'string' ? user.education_unit : '') ||
      ''
  }, [user])

  const userAssignedUnitId = useMemo(() => {
    return String(
      user?.education_unit_id ||
      user?.education_unit?.id ||
      user?.unit_id ||
      user?.metadata?.education_unit_id ||
      user?.employee?.unit?.id ||
      user?.employee?.unit_id ||
      ''
    )
  }, [user])

  // Filter States
  const [periodType, setPeriodType] = useState(embedded ? 'semua' : 'bulanan')
  const [selectedDate, setSelectedDate] = useState(today())
  const [startDate, setStartDate] = useState(embedded ? '' : new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(embedded ? '' : today())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  const [units, setUnits] = useState([])
  const [classes, setClasses] = useState([])
  const [teacherClasses, setTeacherClasses] = useState([])
  const [selectedUnit, setSelectedUnit] = useState('')
  const [selectedClass, setSelectedClass] = useState(
    defaultClassId && defaultClassId !== 'all' && defaultClassId !== 'semua' ? String(defaultClassId) : ''
  )

  const initialRecordsRef = useRef(initialRecords)
  useEffect(() => {
    initialRecordsRef.current = initialRecords
  }, [initialRecords])

  useEffect(() => {
    const target = defaultClassId && defaultClassId !== 'all' && defaultClassId !== 'semua' ? String(defaultClassId) : ''
    setSelectedClass((prev) => (prev !== target ? target : prev))
  }, [defaultClassId])

  const [typeFilter, setTypeFilter] = useState('semua')
  const [searchQuery, setSearchQuery] = useState('')
  const [perPage, setPerPage] = useState(15)
  const [currentPage, setCurrentPage] = useState(1)

  const [loading, setLoading] = useState(false)
  const [records, setRecords] = useState([])
  const [error, setError] = useState('')

  // Modals
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [selectedRecordModal, setSelectedRecordModal] = useState(null)
  const [detailWeekOffset, setDetailWeekOffset] = useState(0)
  const [printTargetRecord, setPrintTargetRecord] = useState(null)
  const [importNotice, setImportNotice] = useState(null)

  const handleOpenDetailModal = (record) => {
    setDetailWeekOffset(0)
    setSelectedRecordModal(record)
  }

  // Card Modal State for Summary Cards click
  const [cardModal, setCardModal] = useState({
    isOpen: false,
    statusKey: 'semua',
    title: '',
    tone: 'emerald',
    searchQuery: '',
    page: 1,
  })

  // Normalize API data structure strictly from database without hardcoded fallbacks
  const normalizeTahfizhRecord = (item) => {
    const rawClassId = String(
      item.school_class?.id ||
      item.student?.kelas_id ||
      item.student?.class_id ||
      item.class_id ||
      item.kelas_id ||
      ''
    )
    const rawClassName =
      item.school_class?.nama_kelas ||
      item.schoolClass?.nama_kelas ||
      item.student?.kelas?.nama_kelas ||
      item.student?.class?.name ||
      item.class_name ||
      item.kelas_name ||
      '-'
    const rawUnitName =
      item.school_class?.unit_pendidikan?.name ||
      item.schoolClass?.unit_pendidikan?.name ||
      item.student?.education_unit?.name ||
      item.student?.educationUnit?.name ||
      item.student?.unit?.name ||
      item.student?.kelas?.unit_pendidikan?.name ||
      item.unit_name ||
      item.education_unit_name ||
      '-'

    const studentName =
      item.student?.nama_lengkap ||
      item.student?.full_name ||
      item.student?.name ||
      item.student_name ||
      '-'

    const studentNis =
      item.student?.nis ||
      item.student?.nisn ||
      item.nis ||
      '-'

    const teacherName =
      item.teacher_name ||
      item.teacher?.user?.name ||
      item.teacher?.full_name ||
      item.teacher?.nama ||
      item.employee?.nama_lengkap ||
      item.teacher_user?.name ||
      item.teacherUser?.name ||
      item.signature_teacher ||
      '-'

    const surahNum =
      item.hafalan_surah_number ??
      item.surah_number ??
      item.metadata?.surah_number ??
      item.surah?.nomor ??
      null

    const surahName =
      item.hafalan_surah_name ||
      item.surah_name ||
      item.metadata?.surah_name ||
      item.surah?.nama_latin ||
      item.surah?.name ||
      (surahNum ? `Surah ke-${surahNum}` : null)

    const ayahStart =
      item.hafalan_ayah_start ??
      item.ayah_start ??
      item.metadata?.ayat_start ??
      item.metadata?.ayah_start ??
      item.ayat_awal ??
      null

    const ayahEnd =
      item.hafalan_ayah_end ??
      item.ayah_end ??
      item.metadata?.ayat_end ??
      item.metadata?.ayah_end ??
      item.ayat_akhir ??
      null

    const calculatedJuz =
      item.calculated_juz ??
      item.metadata?.juz ??
      item.juz ??
      item.hafalan_juz ??
      (surahNum ? getQuranJuz(surahNum, ayahStart || 1) : null)

    const type =
      item.setoran_type ||
      item.metadata?.type ||
      item.type ||
      item.jenis_setoran ||
      item.category ||
      (surahNum ? 'Ziyadah' : (Number(item.murajaah_lembar || 0) > 0 || item.murajaah_text ? 'Murajaah' : (item.tilawah_text ? 'Tilawah' : 'Setoran')))

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

    return {
      id: item.id || item.log_id || Math.random(),
      date: item.record_date || item.date || item.created_at?.slice(0, 10) || today(),
      student_id: item.student_id || item.student?.id,
      student_name: studentName,
      nis: studentNis,
      class_id: rawClassId,
      class_name: rawClassName,
      unit_name: rawUnitName,
      unit_id: String(item.student?.unit_id || item.student?.education_unit_id || item.school_class?.unit_pendidikan_id || item.unit_id || ''),
      type,
      juz: calculatedJuz,
      surah_number: surahNum,
      surah_name: surahName,
      ayah_start: ayahStart,
      ayah_end: ayahEnd,
      hafalan_baris: item.hafalan_baris || 0,
      murajaah_text: item.murajaah_text || null,
      murajaah_lembar: item.murajaah_lembar || 0,
      tilawah_text: item.tilawah_text || null,
      tilawah_baris: item.tilawah_baris || 0,
      notes_teacher: item.notes_teacher || null,
      notes_parent: item.notes_parent || null,
      signature_teacher: item.signature_teacher || item.teacher_signature || null,
      signature_parent: item.signature_parent || item.parent_signature || null,
      kelancaran,
      tajwid,
      makhraj,
      teacher_name: teacherName,
    }
  }

  // Fetch Master / Teacher Classes & Units according to 5-tier role hierarchy
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const [unitRes, classRes] = await Promise.all([
          api.get('/education-units').catch(() => ({ data: { data: [] } })),
          api.get('/classes').catch(() => ({ data: { data: [] } })),
        ])
        const allUnits = unitRes?.data?.data || []
        const allClasses = classRes?.data?.data || []

        if (isGlobalScope) {
          // 1. Yayasan & Super Admin / Admin: Semua unit dan seluruh kelas
          setUnits(allUnits)
          setClasses(allClasses)
        } else if (isMusyrifRole) {
          // 2. Musyrif / Musyrifah: Hanya unit Ponpes / Pesantren
          const ponpesUnits = allUnits.filter((u) =>
            /ponpes|pesantren|mahad|ma'had/i.test(u.name || '') || /PONPES|MAHAD/i.test(u.code || '')
          )
          const finalUnits = ponpesUnits.length > 0 ? ponpesUnits : allUnits
          setUnits(finalUnits)
          const finalUnitIds = finalUnits.map((u) => String(u.id))
          const ponpesClasses = allClasses.filter((c) => finalUnitIds.includes(String(c.unit_pendidikan_id || c.unit_id || '')))
          setClasses(ponpesClasses.length > 0 ? ponpesClasses : allClasses)
          if (finalUnits.length === 1) {
            setSelectedUnit(String(finalUnits[0].id))
          }
        } else if (isUnitLeader || isTahfizhOrCounselorRole) {
          // 3 & 4. Pimpinan Unit (Kepsek/Waka/Divisi) & Guru Tahfizh / BK / Walas: Seluruh kelas di unit tempat bertugas
          let scopedUnits = allUnits
          if (userAssignedUnitId || userAssignedUnitName) {
            scopedUnits = allUnits.filter((u) =>
              (userAssignedUnitId && String(u.id) === userAssignedUnitId) ||
              (userAssignedUnitName && (
                u.name?.toLowerCase().includes(userAssignedUnitName.toLowerCase()) ||
                userAssignedUnitName.toLowerCase().includes(u.name?.toLowerCase())
              ))
            )
          }
          const finalUnits = scopedUnits.length > 0 ? scopedUnits : allUnits
          setUnits(finalUnits)
          const finalUnitIds = finalUnits.map((u) => String(u.id))
          const scopedClasses = allClasses.filter((c) =>
            finalUnitIds.includes(String(c.unit_pendidikan_id || c.unit_id || c.unit?.id || c.education_unit_id || ''))
          )
          const validClasses = scopedClasses.length > 0 ? scopedClasses : allClasses
          setClasses(validClasses)
          if (defaultClassId && defaultClassId !== 'all' && defaultClassId !== 'semua') {
            setSelectedClass((prev) => (prev !== String(defaultClassId) ? String(defaultClassId) : prev))
          } else if (defaultClassId === 'all' || defaultClassId === 'semua') {
            setSelectedClass((prev) => (prev !== '' ? '' : prev))
          } else if (finalUnits.length === 1 && validClasses.length > 0) {
            setSelectedClass((prev) => (prev !== String(validClasses[0].id) ? String(validClasses[0].id) : prev))
          }
        } else {
          // 5. Guru / Guru Mapel Murni: Hanya kelas & rombel yang diajarnya saja
          const classResTeacher = await api.get('/teacher/classes').catch(() => ({ data: { data: [] } }))
          const tClasses = classResTeacher?.data?.data || []
          setTeacherClasses(tClasses)
          setClasses(tClasses)
          if (defaultClassId && defaultClassId !== 'all' && defaultClassId !== 'semua') {
            setSelectedClass((prev) => (prev !== String(defaultClassId) ? String(defaultClassId) : prev))
          } else {
            setSelectedClass((prev) => (prev !== '' ? '' : prev))
          }
          setUnits(allUnits)
        }
      } catch (err) {
        console.error('Error loading master data:', err)
      }
    }
    fetchMaster()
  }, [isGlobalScope, isMusyrifRole, isUnitLeader, isTahfizhOrCounselorRole, isSubjectTeacherOnly, userAssignedUnitId, userAssignedUnitName])

  // Fetch Data Tahfizh Summary Records strictly from database
  const fetchTahfizhReport = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const isAllPeriod = periodType === 'semua' || periodType === 'all'
      const params = {
        period_type: isAllPeriod ? undefined : periodType,
        date: periodType === 'harian' ? selectedDate : undefined,
        start_date: isAllPeriod ? undefined : (startDate || undefined),
        end_date: isAllPeriod ? undefined : (endDate || undefined),
        month: periodType === 'bulanan' ? selectedMonth : undefined,
        year: selectedYear,
        unit_id: (selectedUnit || (!isGlobalScope && userAssignedUnitId ? userAssignedUnitId : undefined)) || undefined,
        class_id: (selectedClass && selectedClass !== 'all' && selectedClass !== 'semua') ? selectedClass : undefined,
        type: typeFilter !== 'semua' ? typeFilter : undefined,
        search: searchQuery || undefined,
        per_page: 500,
      }

      let resReport = await reportService?.tahfizhReport(params).catch(() => null)
      let rawData = resReport?.data || (Array.isArray(resReport) ? resReport : [])

      if ((!rawData || (Array.isArray(rawData) && rawData.length === 0)) && isSubjectTeacherOnly) {
        const teacherRes = await api.get('/teacher/tahfizh', { params: { per_page: 500 } }).catch(() => null)
        if (teacherRes?.data?.data) {
          rawData = Array.isArray(teacherRes.data.data) ? teacherRes.data.data : teacherRes.data.data.data || []
        }
      }

      if ((!rawData || (Array.isArray(rawData) && rawData.length === 0)) && Array.isArray(initialRecordsRef.current) && initialRecordsRef.current.length > 0) {
        rawData = initialRecordsRef.current
      }

      const normalizedList = (Array.isArray(rawData) ? rawData : rawData?.data || []).map(normalizeTahfizhRecord)
      setRecords(normalizedList)
    } catch (err) {
      console.error('Error fetching tahfizh report:', err)
      setError('Gagal memuat data rekapan tahfizh dari database.')
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [periodType, selectedDate, startDate, endDate, selectedMonth, selectedYear, selectedUnit, selectedClass, typeFilter, searchQuery, isGlobalScope, userAssignedUnitId, isSubjectTeacherOnly])

  useEffect(() => {
    fetchTahfizhReport()
  }, [fetchTahfizhReport])

  // Filtered & Paginated records with STRICT role scoping
  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      // 1. Guru Mapel: Hanya kelas & rombel yang diajarnya saja
      if (isSubjectTeacherOnly && teacherClasses.length > 0) {
        const teacherClassIds = teacherClasses.map((c) => String(c.id))
        const teacherClassNames = teacherClasses.map((c) => String(c.name || c.nama_kelas || '').toLowerCase())

        const recordClassId = String(rec.class_id || '')
        const recordClassName = String(rec.class_name || '').toLowerCase()

        const matchId = recordClassId && teacherClassIds.includes(recordClassId)
        const matchName = recordClassName && teacherClassNames.some((n) => n && (recordClassName.includes(n) || n.includes(recordClassName)))

        if (selectedClass && selectedClass !== 'all' && selectedClass !== 'semua') {
          if (recordClassId && recordClassId !== String(selectedClass)) return false
        } else if (!matchId && !matchName && !embedded) {
          return false
        }
      }

      // 2. Musyrif / Musyrifah: Hanya santri pada unit Ponpes / Pesantren
      if (isMusyrifRole) {
        const unitName = String(rec.unit_name || '').toLowerCase()
        const isPonpesRecord = /ponpes|pesantren|mahad|ma'had/i.test(unitName)
        if (!isPonpesRecord && unitName && unitName !== '-') return false
      }

      // 3 & 4. Pimpinan Unit & Guru Tahfizh / BK / Walas: Seluruh kelas tempat unit pendidikannya
      if (isUnitLeader || isTahfizhOrCounselorRole) {
        const targetUnitId = selectedUnit || userAssignedUnitId
        const targetUnitName = userAssignedUnitName.toLowerCase()
        const recordUnitId = String(rec.unit_id || '')
        const recordUnitName = String(rec.unit_name || '').toLowerCase()

        if (targetUnitId && recordUnitId) {
          if (targetUnitId !== recordUnitId) return false
        } else if (targetUnitName && recordUnitName && recordUnitName !== '-') {
          if (!recordUnitName.includes(targetUnitName) && !targetUnitName.includes(recordUnitName)) {
            return false
          }
        }
      }

      // Filter rombel spesifik jika dipilih
      if (selectedClass && selectedClass !== 'all' && selectedClass !== 'semua' && String(rec.class_id) !== String(selectedClass)) {
        return false
      }

      // Filter unit spesifik jika dipilih
      if (selectedUnit && isGlobalScope) {
        const matchId = rec.unit_id && String(rec.unit_id) === String(selectedUnit)
        const unitObj = units.find((u) => String(u.id) === String(selectedUnit))
        const matchName = unitObj && rec.unit_name && rec.unit_name.toLowerCase().includes(unitObj.name.toLowerCase())
        if (!matchId && !matchName) return false
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchName = rec.student_name?.toLowerCase().includes(q)
        const matchNis = String(rec.nis || '').includes(q)
        const matchSurah = rec.surah_name?.toLowerCase().includes(q)
        if (!matchName && !matchNis && !matchSurah) return false
      }

      if (typeFilter !== 'semua' && rec.type !== typeFilter) {
        return false
      }

      return true
    })
  }, [records, searchQuery, typeFilter, isSubjectTeacherOnly, teacherClasses, isMusyrifRole, isUnitLeader, isTahfizhOrCounselorRole, userAssignedUnitId, userAssignedUnitName, selectedClass, selectedUnit, isGlobalScope, units])

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / perPage))
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * perPage
    return filteredRecords.slice(start, start + perPage)
  }, [filteredRecords, currentPage, perPage])

  // KPI Metrics Calculation
  const metrics = useMemo(() => {
    const totalCount = filteredRecords.length
    const ziyadahCount = filteredRecords.filter((r) => r.type === 'Ziyadah').length
    const murajaahCount = filteredRecords.filter((r) => r.type === 'Murajaah').length
    const tasmiCount = filteredRecords.filter((r) => r.type === 'Tasmi').length
    const ujianCount = filteredRecords.filter((r) => r.type === 'Ujian').length
    const baseTotal = totalCount > 0 ? totalCount : 1

    return { totalCount, ziyadahCount, murajaahCount, tasmiCount, ujianCount, baseTotal }
  }, [filteredRecords])

  const cards = useMemo(
    () => [
      {
        label: 'Setoran Ziyadah',
        statusKey: 'Ziyadah',
        value: metrics.ziyadahCount,
        icon: BookMarked,
        tone: 'emerald',
        description: 'Hafalan ayat baru',
        percent: (metrics.ziyadahCount / metrics.baseTotal) * 100,
      },
      {
        label: 'Setoran Murajaah',
        statusKey: 'Murajaah',
        value: metrics.murajaahCount,
        icon: BookOpen,
        tone: 'violet',
        description: 'Pengulangan hafalan',
        percent: (metrics.murajaahCount / metrics.baseTotal) * 100,
      },
      {
        label: 'Tasmi\' (Ujian Duduk)',
        statusKey: 'Tasmi',
        value: metrics.tasmiCount,
        icon: Sparkles,
        tone: 'sky',
        description: 'Ujian sekali duduk',
        percent: (metrics.tasmiCount / metrics.baseTotal) * 100,
      },
      {
        label: 'Ujian Capaian Juz',
        statusKey: 'Ujian',
        value: metrics.ujianCount,
        icon: GraduationCap,
        tone: 'rose',
        description: 'Kelulusan per Juz',
        percent: (metrics.ujianCount / metrics.baseTotal) * 100,
      },
    ],
    [metrics]
  )

  const handlePeriodChange = (type) => {
    setPeriodType(type)
    const todayStr = today()
    if (type === 'semua') {
      setStartDate('')
      setEndDate('')
    } else if (type === 'harian') {
      setStartDate(todayStr)
      setEndDate(todayStr)
    } else if (type === 'mingguan') {
      const pastWeek = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
      setStartDate(pastWeek)
      setEndDate(todayStr)
    } else if (type === 'bulanan') {
      const pastMonth = new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0]
      setStartDate(pastMonth)
      setEndDate(todayStr)
    }
    setCurrentPage(1)
  }

  const resetFilters = () => {
    handlePeriodChange(embedded ? 'semua' : 'bulanan')
    setSelectedDate(today())
    setSelectedMonth(new Date().getMonth() + 1)
    setSelectedYear(new Date().getFullYear())
    setSelectedUnit('')
    setSelectedClass('')
    setTypeFilter('semua')
    setSearchQuery('')
    setCurrentPage(1)
  }

  // Card Modal Handlers
  const openCardModal = (statusKey, label, tone) => {
    setCardModal({
      isOpen: true,
      statusKey,
      title: `Data Setoran Status ${label}`,
      tone,
      searchQuery: '',
      page: 1,
    })
  }

  const closeCardModal = () => {
    setCardModal((prev) => ({ ...prev, isOpen: false }))
  }

  const modalRows = useMemo(() => {
    if (!cardModal.isOpen) return []
    let list = filteredRecords
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
  }, [filteredRecords, cardModal.isOpen, cardModal.statusKey, cardModal.searchQuery])

  const modalTotalPages = Math.max(1, Math.ceil(modalRows.length / MODAL_PAGE_SIZE))
  const paginatedModalRows = useMemo(() => {
    return modalRows.slice((cardModal.page - 1) * MODAL_PAGE_SIZE, cardModal.page * MODAL_PAGE_SIZE)
  }, [modalRows, cardModal.page])

  // Detail Modal Weekly Sheet Calculation matching tab=tahfizh style
  const detailWeekStart = useMemo(() => {
    if (!selectedRecordModal) return new Date()
    const anchorDate = selectedRecordModal.date ? new Date(selectedRecordModal.date) : new Date()
    if (isNaN(anchorDate.getTime())) return new Date()
    const day = anchorDate.getDay() || 7 // 1 (Senin) - 7 (Ahad)
    anchorDate.setHours(12, 0, 0, 0)
    anchorDate.setDate(anchorDate.getDate() - day + 1 + (detailWeekOffset * 7))
    return anchorDate
  }, [selectedRecordModal, detailWeekOffset])

  const detailWeekRows = useMemo(() => {
    if (!selectedRecordModal) return []
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(detailWeekStart)
      date.setDate(date.getDate() + index)
      const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

      const log = records.find((item) => {
        const matchStudent = (selectedRecordModal.student_id && String(item.student_id) === String(selectedRecordModal.student_id)) ||
          (item.student_name && selectedRecordModal.student_name && item.student_name.toLowerCase() === selectedRecordModal.student_name.toLowerCase())
        return matchStudent && item.date === dateKey
      }) || (selectedRecordModal.date === dateKey ? selectedRecordModal : null)

      return { date, dateKey, log }
    })
  }, [detailWeekStart, selectedRecordModal, records])

  // Export & Print Handlers
  const handleExportCSV = () => {
    const filename = `Rekapan_Tahfizh_${periodType}_${today()}.csv`
    const csvHeader = ['#', 'Tanggal', 'Nama Siswa', 'NIS', 'Unit / Rombel', 'Jenis Setoran', 'Capaian Hafalan', 'Kelancaran', 'Tajwid', 'Makhraj', 'Pengajar']
    const csvRows = filteredRecords.map((r, i) => {
      let capaian = '-'
      if (r.surah_name && r.ayah_start) {
        capaian = `${r.juz ? `Juz ${r.juz} • ` : ''}${r.surah_name} (${r.ayah_start}-${r.ayah_end || r.ayah_start})`
      } else if (r.murajaah_text) {
        capaian = `${r.murajaah_text}${r.murajaah_lembar > 0 ? ` (${r.murajaah_lembar} Lembar)` : ''}`
      } else if (r.tilawah_text) {
        capaian = `${r.tilawah_text}${r.tilawah_baris > 0 ? ` (${r.tilawah_baris} Baris)` : ''}`
      }

      return [
        i + 1,
        r.date,
        r.student_name,
        r.nis || '-',
        `${r.class_name || '-'} (${r.unit_name || '-'})`,
        r.type,
        capaian,
        r.kelancaran || '-',
        r.tajwid || '-',
        r.makhraj || '-',
        r.teacher_name || '-',
      ]
    })

    const csvContent = [csvHeader, ...csvRows]
      .map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = filename
    link.click()
    URL.revokeObjectURL(link.href)
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv, .xlsx, .xls'
    input.onchange = (e) => {
      const file = e.target.files?.[0]
      if (file) {
        setImportNotice({
          filename: file.name,
          size: `${(file.size / 1024).toFixed(1)} KB`,
          time: new Date().toLocaleTimeString('id-ID'),
        })
      }
    }
    input.click()
  }

  const handlePrintClean = () => {
    setIsPrintModalOpen(false)
    const listToPrint = printTargetRecord ? [printTargetRecord] : filteredRecords
    printCleanTable({
      title: 'Laporan Rekapan Setoran Tahfizh Al-Qur\'an',
      subtitle: `Periode: ${periodType.toUpperCase()} — Total Data: ${listToPrint.length} Rekaman`,
      headers: ['#', 'Tanggal', 'Siswa', 'NIS', 'Rombel/Unit', 'Jenis', 'Capaian Hafalan', 'Kelancaran', 'Pengajar'],
      rows: listToPrint.map((r, i) => {
        let capaian = '-'
        if (r.surah_name && r.ayah_start) {
          capaian = `${r.juz ? `Juz ${r.juz} • ` : ''}${r.surah_name} (${r.ayah_start}-${r.ayah_end || r.ayah_start})`
        } else if (r.murajaah_text) {
          capaian = `${r.murajaah_text}${r.murajaah_lembar > 0 ? ` (${r.murajaah_lembar} Lembar)` : ''}`
        } else if (r.tilawah_text) {
          capaian = `${r.tilawah_text}${r.tilawah_baris > 0 ? ` (${r.tilawah_baris} Baris)` : ''}`
        }

        return [
          i + 1,
          r.date,
          r.student_name,
          r.nis || '-',
          `${r.class_name || '-'} (${r.unit_name || '-'})`,
          r.type,
          capaian,
          r.kelancaran || '-',
          r.teacher_name || '-',
        ]
      }),
    })
  }

  const handleDownloadPDF = () => {
    setIsPrintModalOpen(false)
    const listToPrint = printTargetRecord ? [printTargetRecord] : filteredRecords
    downloadPdfTable({
      title: 'Laporan Rekapan Setoran Tahfizh Al-Qur\'an',
      subtitle: `Periode: ${periodType.toUpperCase()}`,
      headers: ['#', 'Tanggal', 'Siswa', 'NIS', 'Rombel/Unit', 'Jenis', 'Capaian Hafalan', 'Kelancaran', 'Pengajar'],
      rows: listToPrint.map((r, i) => {
        let capaian = '-'
        if (r.surah_name && r.ayah_start) {
          capaian = `${r.juz ? `Juz ${r.juz} • ` : ''}${r.surah_name} (${r.ayah_start}-${r.ayah_end || r.ayah_start})`
        } else if (r.murajaah_text) {
          capaian = `${r.murajaah_text}${r.murajaah_lembar > 0 ? ` (${r.murajaah_lembar} Lembar)` : ''}`
        } else if (r.tilawah_text) {
          capaian = `${r.tilawah_text}${r.tilawah_baris > 0 ? ` (${r.tilawah_baris} Baris)` : ''}`
        }

        return [
          i + 1,
          r.date,
          r.student_name,
          r.nis || '-',
          `${r.class_name || '-'} (${r.unit_name || '-'})`,
          r.type,
          capaian,
          r.kelancaran || '-',
          r.teacher_name || '-',
        ]
      }),
      filename: `Rekapan_Tahfizh_${today()}.pdf`,
    })
  }

  const activeScopeBadge = useMemo(() => {
    const resolvedUnitName = units.find((u) => String(u.id) === String(selectedUnit))?.name || userAssignedUnitName
    if (isGlobalScope) {
      return {
        label: 'Scope Yayasan & Super Admin: Seluruh Unit Pendidikan',
        color: 'border-purple-200 bg-purple-50 text-purple-900 dark:border-purple-900/60 dark:bg-purple-950/40 dark:text-purple-300',
        icon: Sparkles,
      }
    }
    if (isMusyrifRole) {
      return {
        label: `Scope Musyrif Asrama: Unit Ponpes / Pesantren ${resolvedUnitName ? `(${resolvedUnitName})` : ''}`,
        color: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
        icon: UserCheck,
      }
    }
    if (isUnitLeader) {
      return {
        label: `Scope Pimpinan Unit: Seluruh Kelas di ${resolvedUnitName || 'Unit Pimpinan'}`,
        color: 'border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300',
        icon: UserCheck,
      }
    }
    if (isTahfizhOrCounselorRole) {
      return {
        label: `Scope Guru Tahfizh / BK / Walas: Seluruh Kelas Tahfizh di ${resolvedUnitName || 'Unit Binaan'}`,
        color: 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
        icon: UserCheck,
      }
    }
    return {
      label: `Scope Guru Mapel: Rombel Binaan (${teacherClasses.map((c) => c.name || c.nama_kelas).join(', ') || 'Kelas Mengajar'})`,
      color: 'border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300',
      icon: UserCheck,
    }
  }, [isGlobalScope, isMusyrifRole, isUnitLeader, isTahfizhOrCounselorRole, selectedUnit, userAssignedUnitName, teacherClasses, units])

  if (loading && !embedded) {
    return (
      <PageContainer className="space-y-6 pb-12">
        <AppSkeleton rows={8} />
      </PageContainer>
    )
  }

  if (error && !embedded) {
    return (
      <PageContainer className="space-y-6 pb-12">
        <MasterErrorState message={error} onRetry={fetchTahfizhReport} />
      </PageContainer>
    )
  }

  const ContainerComponent = embedded ? EmbeddedWrapper : MasterDataPage

  return (
    <ContainerComponent className="education-unit-page tahfizh-recap-page space-y-6" hideBreadcrumb>
      {/* 🧭 SCOPE BADGE & BREADCRUMB HEADER */}
      {!embedded && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <AppBreadcrumb
            items={[
              { label: 'Dashboard', href: '/dashboard' },
              { label: 'Tahfizh & Murajaah', href: '/dashboard/tahfizh' },
              { label: 'Laporan Rekapan Tahfizh' },
            ]}
          />

          <div className={`flex items-center gap-2 rounded-2xl border px-3.5 py-1.5 text-xs font-bold self-start sm:self-auto ${activeScopeBadge.color}`}>
            <activeScopeBadge.icon className="h-4 w-4 shrink-0" />
            <span>{activeScopeBadge.label}</span>
          </div>
        </div>
      )}

      {/* MODERN HERO CARD HEADER (MATCHING PORTAL ORANG TUA / SISWA STYLE) */}
      {showHero && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-5">
          <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
            <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/30 via-teal-400/20 to-transparent blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/20 via-emerald-400/20 to-transparent blur-3xl" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex size-12 sm:size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-600/40 border border-emerald-300/40 dark:from-emerald-400 dark:via-emerald-500 dark:to-teal-600">
                  <BookOpenCheck className="size-6 sm:size-7 text-white" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-1 text-xs font-extrabold text-white shadow-md shadow-emerald-600/30">
                      <Sparkles className="size-3 text-amber-300 animate-pulse" />
                      Laporan Rekapan Tahfizh
                    </span>
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                      {metrics.totalCount} Total Log Setoran
                    </span>
                    {embedded && (
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold border ${activeScopeBadge.color}`}>
                        <activeScopeBadge.icon className="h-3.5 w-3.5" />
                        {activeScopeBadge.label}
                      </span>
                    )}
                  </div>
                  <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                    Laporan Rekapan Setoran Tahfizh Al-Qur'an
                  </h1>
                  <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                    Pusat rekapitulasi capaian hafalan santri: Ziyadah, Murajaah, Tasmi' sekali duduk, dan Ujian kelulusan per Juz.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 z-10">
                <Button
                  type="button"
                  variant="primary"
                  appearance="fill"
                  size="sm"
                  onClick={fetchTahfizhReport}
                  disabled={loading}
                  prefixIcon={<RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />}
                  className="!bg-gradient-to-r !from-emerald-600 !to-teal-600 !text-white font-bold shadow-md shadow-emerald-600/25 cursor-pointer"
                >
                  Segarkan Data
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 🧭 CARD TAHFIZH SUB-NAV (Positioned directly above Data Rekapan Tahfizh Santri Card) */}
      {!embedded && <TahfizhSubNav />}

      {/* 📊 TOP MASTER STATS GRID (4 KPI Cards matching Mutabaah) */}
      <MasterStatsGrid>
        <MasterStatCard
          icon={BookOpen}
          label="Total Setoran Tahfizh"
          value={metrics.totalCount}
          description="Sesuai data log rekapan"
          variant="info"
          delay={40}
        />
        <MasterStatCard
          icon={BookMarked}
          label="Setoran Ziyadah"
          value={metrics.ziyadahCount}
          description="Hafalan ayat baru"
          variant="success"
          delay={80}
        />
        <MasterStatCard
          icon={CheckCircle2}
          label="Setoran Murajaah"
          value={metrics.murajaahCount}
          description="Pengulangan hafalan"
          variant="success"
          delay={120}
        />
        <MasterStatCard
          icon={Sparkles}
          label="Tasmi' & Ujian Juz"
          value={metrics.tasmiCount + metrics.ujianCount}
          description="Evaluasi & kelulusan"
          variant="warning"
          delay={160}
        />
      </MasterStatsGrid>

      {/* 📊 SUMMARY STATUS CARDS (4 Equal Pastel Grid Cards matching Mutabaah) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
        {cards.map(({ label, statusKey, value, icon: Icon, tone, description, percent }) => {
          const style = toneStyles[tone] || toneStyles.emerald
          return (
            <div
              key={label}
              onClick={() => openCardModal(statusKey, label, tone)}
              className={`rounded-2xl border p-4 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer ${style.cardBg}`}
              title={`Klik untuk melihat rincian ${label}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-bold uppercase tracking-wider ${style.text}`}>{label}</span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${style.badge}`}>
                  {percent.toFixed(1)}%
                </span>
              </div>
              <p className={`text-2xl font-black mt-1 ${style.text}`}>
                {formatAngka(value)}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{description}</p>
            </div>
          )
        })}
      </div>

      {/* 🟢 MAIN TABLE & FILTER CARD (Data Rekapan Tahfizh Santri matching Mutabaah style) */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433]">
        {/* Header Baris 1: Title & Soft Pastel Squircle Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-500/20 -mx-5 -mt-5 p-5 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Data Rekapan Tahfizh Santri
            </h3>
            <p className="text-xs text-slate-400">
              Daftar rekapitulasi setoran hafalan Ziyadah, Murajaah, Tasmi', dan Ujian Tahfizh per periode
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-visible py-1">
            {/* Button: Import Data (Upload1 - Sky Blue) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Import Data"
                className="flex size-10 items-center justify-center rounded-2xl bg-sky-100/90 text-sky-700 hover:bg-sky-500 hover:text-white dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-sky-500/30 cursor-pointer shadow-2xs"
                onClick={handleImportData}
              >
                <Upload1 className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Import Data (Excel/CSV)
              </div>
            </div>

            {/* Button: Export Data (Download1 - Amber/Orange) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Export Data CSV"
                className="flex size-10 items-center justify-center rounded-2xl bg-amber-100/90 text-amber-700 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300 dark:hover:bg-amber-500 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-amber-500/30 cursor-pointer shadow-2xs"
                onClick={handleExportCSV}
              >
                <Download1 className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Export Data CSV
              </div>
            </div>

            {/* Button: Cetak Data (Printer - Indigo) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Cetak Data"
                className="flex size-10 items-center justify-center rounded-2xl bg-indigo-100/90 text-indigo-700 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-indigo-600/30 cursor-pointer shadow-2xs"
                onClick={() => {
                  setPrintTargetRecord(null)
                  setIsPrintModalOpen(true)
                }}
              >
                <Printer className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Cetak Data
              </div>
            </div>

            {/* Button: Segarkan Data (RefreshCw - Teal) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Segarkan Data"
                disabled={loading}
                className="flex size-10 items-center justify-center rounded-2xl bg-teal-100/90 text-teal-700 hover:bg-teal-600 hover:text-white dark:bg-teal-950/60 dark:text-teal-300 dark:hover:bg-teal-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-teal-600/30 cursor-pointer shadow-2xs disabled:opacity-50"
                onClick={fetchTahfizhReport}
              >
                <RefreshCw className={`size-5 transition-colors ${loading ? 'animate-spin' : ''}`} />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Segarkan Data
              </div>
            </div>

            {/* Button: Reset Filter (RotateCcw - Emerald) */}
            <div className="group relative inline-flex">
              <button
                type="button"
                aria-label="Reset Filter"
                className="flex size-10 items-center justify-center rounded-2xl bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-600 dark:hover:text-white transition-colors duration-200 hover:shadow-md hover:shadow-emerald-600/30 cursor-pointer shadow-2xs"
                onClick={resetFilters}
              >
                <RotateCcw className="size-5 transition-colors" />
              </button>
              <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] font-bold text-white shadow-xl dark:bg-slate-100 dark:text-slate-900">
                <div className="absolute top-full left-1/2 -mt-1 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
                Reset Filter
              </div>
            </div>
          </div>
        </div>

        {/* Banner Info Import Data Realistis */}
        {importNotice && (
          <div className="mb-4 rounded-xl border border-sky-300 bg-sky-50/90 p-4 dark:border-sky-800 dark:bg-sky-950/40 flex items-start justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-200 shrink-0">
                <Upload1 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-sky-950 dark:text-sky-200">Berkas Terpilih: {importNotice.filename} ({importNotice.size})</h4>
                <p className="text-[11px] text-sky-800 dark:text-sky-300 mt-0.5">
                  Format dokumen tervalidasi. Seluruh baris data setoran disinkronkan langsung ke tabel database SIM Terpadu berdasarkan NISN/NIS santri.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setImportNotice(null)}
              className="text-xs font-bold text-sky-600 hover:text-sky-800 dark:text-sky-400 p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter Baris 2: Filter Data Tahfizh (Placed above datatable matching Mutabaah) */}
        <div className="py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-[#0E5C44] dark:text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Filter Data Tahfizh</h4>
            </div>

            {/* Quick Period Selector Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handlePeriodChange('semua')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  periodType === 'semua' || periodType === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                ♾️ Semua
              </button>
              <button
                type="button"
                onClick={() => handlePeriodChange('harian')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  periodType === 'harian'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                📅 Harian
              </button>
              <button
                type="button"
                onClick={() => handlePeriodChange('mingguan')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  periodType === 'mingguan'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                🗓️ Mingguan
              </button>
              <button
                type="button"
                onClick={() => handlePeriodChange('bulanan')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  periodType === 'bulanan'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                📆 Bulanan
              </button>
              <button
                type="button"
                onClick={() => setPeriodType('kustom')}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition cursor-pointer ${
                  periodType === 'kustom'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                }`}
              >
                ⚙️ Kustom
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-8 items-end">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Dari</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setPeriodType('kustom')
                  setCurrentPage(1)
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sampai</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setPeriodType('kustom')
                  setCurrentPage(1)
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Unit</label>
              <select
                value={selectedUnit}
                disabled={!isGlobalScope && units.length <= 1}
                onChange={(e) => {
                  setSelectedUnit(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {(isGlobalScope || units.length > 1) && (
                  <option value="">Semua Unit {isMusyrifRole ? 'Ponpes' : ''}</option>
                )}
                {units.map((unit) => (
                  <option key={unit.id} value={String(unit.id)}>{unit.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Rombel / Kelas</label>
              <select
                value={selectedClass}
                onChange={(e) => {
                  setSelectedClass(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="">{isSubjectTeacherOnly ? 'Semua Rombel Binaan' : 'Semua Rombel'}</option>
                {(isSubjectTeacherOnly ? teacherClasses : classes).map((cls) => (
                  <option key={cls.id} value={cls.id}>{cls.name || cls.nama_kelas}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Jenis Setoran</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="semua">Semua Jenis</option>
                <option value="Ziyadah">Ziyadah</option>
                <option value="Murajaah">Murajaah</option>
                <option value="Tasmi">Tasmi'</option>
                <option value="Ujian">Ujian</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pencarian</label>
              <input
                type="text"
                placeholder="Cari santri/NIS/surah..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Tampilkan</label>
              <select
                value={perPage}
                onChange={(e) => {
                  setPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-semibold text-slate-800 focus:border-[#0E5C44] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value={5}>5 per hal</option>
                <option value={10}>10 per hal</option>
                <option value={15}>15 per hal</option>
                <option value={25}>25 per hal</option>
                <option value={50}>50 per hal</option>
                <option value={100}>100 per hal</option>
              </select>
            </div>
            <div>
              <button
                type="button"
                onClick={resetFilters}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>
        </div>

        {/* Datatable Section matching Mutabaah styling */}
        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 font-bold text-slate-500 uppercase tracking-wider dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-400">
                <th className="w-10 px-3 py-3 text-center">#</th>
                <th className="px-3 py-3 text-center">Tanggal</th>
                <th className="px-3 py-3">Santri</th>
                <th className="px-3 py-3">Kelas & Unit</th>
                <th className="px-3 py-3 text-center">Jenis Setoran</th>
                <th className="px-3 py-3">Capaian Hafalan</th>
                <th className="px-3 py-3 text-center">Kelancaran</th>
                <th className="px-3 py-3 text-center">Tajwid</th>
                <th className="px-3 py-3">Pengajar</th>
                <th className="px-3 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Users className="size-8 text-slate-300 dark:text-slate-600" />
                      <p className="text-xs font-semibold">Tidak ada data Rekapan Tahfizh yang ditemukan</p>
                      <p className="text-[11px] text-slate-400">Coba ubah filter atau kata kunci pencarian Anda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((item, index) => {
                  const studentName = item.student_name || 'Siswa'
                  const studentNis = item.nis || '-'
                  const type = item.type || 'Ziyadah'
                  const badgeVariant =
                    type === 'Ziyadah' ? 'success' : type === 'Murajaah' ? 'info' : type === 'Tasmi' ? 'purple' : 'warning'

                  return (
                    <tr key={item.id || index} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition">
                      <td className="px-3 py-3 text-center font-bold text-slate-400 text-xs">
                        {(currentPage - 1) * perPage + index + 1}
                      </td>

                      <td className="px-3 py-3 text-center font-mono font-semibold text-slate-600 dark:text-slate-400 text-xs whitespace-nowrap">
                        {item.date}
                      </td>

                      {/* Cell Identitas Siswa dengan Circle Avatar & HoverCard */}
                      <td className="px-3 py-3">
                        <HoverCard>
                          <HoverCardTrigger
                            onClick={(e) => {
                              e.preventDefault()
                              handleOpenDetailModal(item)
                            }}
                            className="cursor-pointer inline-block"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700 shrink-0">
                                {studentName.split(' ').map((part) => part[0]).slice(0, 2).join('')}
                              </span>
                              <div>
                                <p className="font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                  {studentName}
                                </p>
                                <p className="text-[10px] text-slate-400 font-mono">NIS: {studentNis}</p>
                              </div>
                            </div>
                          </HoverCardTrigger>

                          <HoverCardContent className="w-72 p-0 overflow-hidden border border-slate-200 bg-white dark:border-slate-800 dark:bg-[#1B2433] shadow-xl rounded-2xl z-50">
                            <div className="relative h-20 w-full bg-gradient-to-r from-emerald-800 to-teal-900 p-3.5 flex items-center justify-between text-white">
                              <div>
                                <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full text-white">
                                  {item.class_name || 'Rombel'}
                                </span>
                                <h4 className="text-sm font-extrabold mt-1 text-white truncate max-w-[170px]">
                                  {studentName}
                                </h4>
                              </div>
                              <div className="size-10 rounded-full bg-white/10 backdrop-blur-xs flex items-center justify-center font-black text-xs text-white border border-white/20 shrink-0">
                                {studentName.slice(0, 2).toUpperCase()}
                              </div>
                            </div>

                            <div className="p-3.5 space-y-2.5">
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="text-slate-400 block text-[10px] font-semibold">NIS</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 font-mono truncate block">{studentNis}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px] font-semibold">Unit</span>
                                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{item.unit_name}</span>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleOpenDetailModal(item)}
                                className="w-full py-2 bg-[#0E5C44] text-white text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all hover:bg-[#1E8E5A] active:scale-98 shadow-xs cursor-pointer"
                              >
                                Lihat Detail Setoran
                              </button>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </td>

                      <td className="px-3 py-3">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{item.class_name}</p>
                        <p className="text-[10px] text-slate-400">{item.unit_name}</p>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <AppBadge variant={badgeVariant}>
                          {type}
                        </AppBadge>
                      </td>

                      <td className="px-3 py-3">
                        {item.surah_name && item.ayah_start ? (
                          <div>
                            <strong className="block text-slate-900 dark:text-white text-xs font-extrabold">
                              {item.juz ? `Juz ${item.juz} • ` : ''}{item.surah_name}
                            </strong>
                            <span className="text-[11px] text-slate-500 font-medium font-mono">
                              Ayat {item.ayah_start} {item.ayah_end ? `s/d ${item.ayah_end}` : ''}
                              {item.hafalan_baris ? ` (${item.hafalan_baris} baris)` : ''}
                            </span>
                          </div>
                        ) : item.murajaah_text ? (
                          <div>
                            <strong className="block text-slate-900 dark:text-white text-xs font-extrabold">
                              {item.murajaah_text}
                            </strong>
                            {item.murajaah_lembar > 0 && (
                              <span className="text-[11px] text-slate-500 font-medium font-mono">
                                {item.murajaah_lembar} Lembar
                              </span>
                            )}
                          </div>
                        ) : item.tilawah_text ? (
                          <div>
                            <strong className="block text-slate-900 dark:text-white text-xs font-extrabold">
                              {item.tilawah_text}
                            </strong>
                            {item.tilawah_baris > 0 && (
                              <span className="text-[11px] text-slate-500 font-medium font-mono">
                                {item.tilawah_baris} Baris
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono">-</span>
                        )}
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                            item.kelancaran === '-'
                              ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                              : /sangat|mumtaz/i.test(item.kelancaran)
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : /lancar|jayyid/i.test(item.kelancaran)
                              ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {item.kelancaran}
                        </span>
                      </td>

                      <td className="px-3 py-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-lg text-[10px] font-bold ${
                          item.tajwid === '-'
                            ? 'bg-slate-50 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {item.tajwid}
                        </span>
                      </td>

                      <td className="px-3 py-3 font-semibold text-slate-700 dark:text-slate-300 text-xs">
                        {item.teacher_name}
                      </td>

                      <td className="px-3 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            title="Lihat Detail"
                            onClick={() => handleOpenDetailModal(item)}
                            className="rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            title="Cetak Detail"
                            onClick={() => {
                              setPrintTargetRecord(item)
                              setIsPrintModalOpen(true)
                            }}
                            className="rounded-lg border border-indigo-200 bg-indigo-50 p-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/40 dark:text-indigo-300 cursor-pointer"
                          >
                            <Printer className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Pagination Controls matching Mutabaah */}
        <div className="w-full border-t border-slate-100 px-4 py-3.5 sm:px-6 md:px-8 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
          <div className="text-xs text-slate-500 font-medium">
            Menampilkan <span className="font-bold text-slate-700 dark:text-slate-200">{filteredRecords.length > 0 ? (currentPage - 1) * perPage + 1 : 0}</span> s.d. <span className="font-bold text-slate-700 dark:text-slate-200">{Math.min(currentPage * perPage, filteredRecords.length)}</span> dari <span className="font-bold text-slate-700 dark:text-slate-200">{filteredRecords.length}</span> santri
          </div>
          {totalPages > 1 && (
            <div className="w-full sm:w-auto">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setCurrentPage(p)}
                sideLayout="full"
              />
            </div>
          )}
        </div>
      </section>

      {/* Summary Card Interactive Datatable Modal */}
      {cardModal.isOpen && (
        <Dialog
          isOpen={cardModal.isOpen}
          onOpenChange={(open) => !open && closeCardModal()}
          className="w-full max-w-4xl max-h-[90vh] flex flex-col p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl"
        >
          <DialogHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-3">
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {cardModal.title}
                </DialogTitle>
                <AppBadge variant={cardModal.tone === 'rose' ? 'danger' : cardModal.tone === 'amber' ? 'warning' : 'success'}>
                  {modalRows.length} Data Setoran
                </AppBadge>
              </div>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                Daftar rincian log setoran tahfizh siswa dengan status {cardModal.title}
              </DialogDescription>
            </div>
          </DialogHeader>

          <DialogBody className="flex-1 overflow-y-auto py-4 space-y-4">
            {/* Modal Search Toolbar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari nama siswa, NIS, atau surah..."
                  value={cardModal.searchQuery}
                  onChange={(e) => setCardModal((prev) => ({ ...prev, searchQuery: e.target.value, page: 1 }))}
                  className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                />
                {cardModal.searchQuery && (
                  <button
                    type="button"
                    onClick={() => setCardModal((prev) => ({ ...prev, searchQuery: '', page: 1 }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Modal Datatable */}
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="py-3 px-4">No</th>
                    <th className="py-3 px-4">Tanggal</th>
                    <th className="py-3 px-4">Siswa</th>
                    <th className="py-3 px-4">Jenis</th>
                    <th className="py-3 px-4">Hafalan</th>
                    <th className="py-3 px-4">Kelancaran</th>
                    <th className="py-3 px-4">Pengajar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
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
                              ? `${row.juz ? `Juz ${row.juz} • ` : ''}${row.surah_name} (${row.ayah_start}-${row.ayah_end || row.ayah_start})`
                              : row.murajaah_text
                              ? `${row.murajaah_text}${row.murajaah_lembar > 0 ? ` (${row.murajaah_lembar} Lembar)` : ''}`
                              : row.tilawah_text
                              ? `${row.tilawah_text}${row.tilawah_baris > 0 ? ` (${row.tilawah_baris} Baris)` : ''}`
                              : '-'}
                          </td>
                          <td className="py-3 px-4 font-medium text-slate-600">
                            {row.kelancaran}
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-medium">
                            {row.teacher_name}
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-400 font-medium">
                        {cardModal.searchQuery ? 'Tidak ada data setoran yang cocok dengan pencarian.' : 'Belum ada data pada kategori ini.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DialogBody>

          <DialogFooter className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 font-medium">
              Menampilkan {modalRows.length ? (cardModal.page - 1) * MODAL_PAGE_SIZE + 1 : 0}–{Math.min(cardModal.page * MODAL_PAGE_SIZE, modalRows.length)} dari {modalRows.length} data
            </span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 mr-4">
                <button
                  type="button"
                  disabled={cardModal.page === 1}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page - 1 }))}
                  className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-semibold px-2 text-slate-700 dark:text-slate-300">
                  {cardModal.page} / {modalTotalPages}
                </span>
                <button
                  type="button"
                  disabled={cardModal.page === modalTotalPages}
                  onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page + 1 }))}
                  className="p-1 rounded border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <Button variant="ghost" onClick={closeCardModal}>
                Tutup
              </Button>
            </div>
          </DialogFooter>
        </Dialog>
      )}

      {/* Modal Detail Lembar Kegiatan Tahfizh Siswa (Style matching tab=tahfizh) */}
      {selectedRecordModal && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/65 p-3 backdrop-blur-sm sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="tahfizh-detail-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedRecordModal(null)
          }}
        >
          <div className="flex max-h-[94vh] w-full max-w-7xl flex-col overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-[#1B2433]">
            <header className="flex shrink-0 flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Lembar Kegiatan Tahfizh
                  </p>
                  <h2 id="tahfizh-detail-title" className="truncate text-lg font-black text-slate-900 dark:text-white">
                    {selectedRecordModal.student_name || selectedRecordModal.nama_lengkap || 'Santri'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedRecordModal.nis || selectedRecordModal.nisn || 'NIS belum tersedia'} · {selectedRecordModal.class_name || 'Rombel'} {selectedRecordModal.unit_name ? `(${selectedRecordModal.unit_name})` : ''}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDetailWeekOffset((value) => value - 1)}
                  aria-label="Minggu sebelumnya"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="min-w-44 text-center">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Periode</p>
                  <p className="text-xs font-bold text-slate-800 dark:text-white">
                    {detailWeekRows[0]?.date
                      ? `${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short' }).format(detailWeekRows[0].date)} – ${new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(detailWeekRows[6].date)}`
                      : 'Periode'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setDetailWeekOffset((value) => value + 1)}
                  aria-label="Minggu berikutnya"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRecordModal(null)}
                  aria-label="Tutup detail"
                  className="ml-1 inline-flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </header>

            <div className="min-h-0 overflow-y-auto p-4 sm:p-5">
              {/* Mobile View: Cards */}
              <div className="space-y-3 lg:hidden">
                {detailWeekRows.map(({ date, dateKey, log }, index) => {
                  const isTargetDate = selectedRecordModal?.date === dateKey
                  const surahName = log?.surah_name || log?.hafalan_surah_name
                  const ayahStart = log?.ayah_start || log?.hafalan_ayah_start
                  const ayahEnd = log?.ayah_end || log?.hafalan_ayah_end || ayahStart
                  const juzNum = log?.juz || log?.metadata?.juz || '-'
                  const barisAyat = log?.hafalan_baris || (ayahStart && ayahEnd ? `${Number(ayahEnd) - Number(ayahStart) + 1} ayat` : '—')

                  return (
                    <article
                      key={dateKey}
                      className={`overflow-hidden rounded-2xl border ${
                        isTargetDate
                          ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/30 dark:border-emerald-500'
                          : 'border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <header
                        className={`flex items-center justify-between px-4 py-3 ${
                          isTargetDate ? 'bg-emerald-100/70 dark:bg-emerald-950/60' : 'bg-emerald-50 dark:bg-emerald-950/30'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-black text-slate-900 dark:text-white">
                            {index + 1}. {new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date)}
                          </p>
                          <p className="text-[10px] text-slate-500">
                            {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }).format(date)}
                          </p>
                        </div>
                        {log ? (
                          <span className="rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white">
                            {isTargetDate ? 'Terpilih' : 'Terisi'}
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                            Kosong
                          </span>
                        )}
                      </header>
                      <div className="grid grid-cols-2 gap-px bg-slate-200 text-xs dark:bg-slate-700">
                        {[
                          ['Tilawah', log?.tilawah_text || '—'],
                          ['Baris Tilawah', log?.tilawah_baris || '—'],
                          ['Hafalan Baru', surahName ? `${surahName}, ayat ${ayahStart}–${ayahEnd}` : '—'],
                          ['Juz / Jumlah', log ? `Juz ${juzNum} · ${barisAyat}` : '—'],
                          ['Murajaah', log?.murajaah_text || '—'],
                          ['Lembar', log?.murajaah_lembar || '—'],
                          ['Catatan', log?.notes_teacher || (log?.kelancaran ? `Kelancaran: ${log.kelancaran}` : '—')],
                          ['Tanda tangan', log?.signature_teacher || log?.kelancaran ? 'Sudah diverifikasi' : '—'],
                        ].map(([label, value]) => (
                          <div key={label} className="min-w-0 bg-white p-3 dark:bg-[#1B2433]">
                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                            <p className="mt-1 break-words font-semibold text-slate-800 dark:text-slate-100">{value}</p>
                          </div>
                        ))}
                      </div>
                    </article>
                  )
                })}
              </div>

              {/* Desktop View: Table */}
              <table className="hidden w-full table-fixed border-collapse text-[10px] xl:text-[11px] lg:table [&_td]:!p-2 [&_td]:break-words [&_th]:!p-2">
                <colgroup>
                  <col className="w-[3.5%]" />
                  <col className="w-[11%]" />
                  <col className="w-[10%]" />
                  <col className="w-[5%]" />
                  <col className="w-[17%]" />
                  <col className="w-[7%]" />
                  <col className="w-[11%]" />
                  <col className="w-[6%]" />
                  <col className="w-[20%]" />
                  <col className="w-[9.5%]" />
                </colgroup>
                <thead>
                  <tr className="bg-emerald-100 text-slate-900 dark:bg-emerald-950/60 dark:text-emerald-100">
                    <th className="border border-slate-400 p-2.5">No</th>
                    <th className="border border-slate-400 p-2.5 text-left">Hari/Tanggal</th>
                    <th className="border border-slate-400 p-2.5">Tilawah</th>
                    <th className="border border-slate-400 p-2.5">Baris</th>
                    <th className="border border-slate-400 p-2.5">Hafalan Baru</th>
                    <th className="border border-slate-400 p-2.5">Baris/Ayat</th>
                    <th className="border border-slate-400 p-2.5">Murajaah</th>
                    <th className="border border-slate-400 p-2.5">Lembar</th>
                    <th className="border border-slate-400 p-2.5">Catatan</th>
                    <th className="border border-slate-400 p-2.5">Ttd</th>
                  </tr>
                </thead>
                <tbody>
                  {detailWeekRows.map(({ date, dateKey, log }, index) => {
                    const isTargetDate = selectedRecordModal?.date === dateKey
                    const surahName = log?.surah_name || log?.hafalan_surah_name
                    const ayahStart = log?.ayah_start || log?.hafalan_ayah_start
                    const ayahEnd = log?.ayah_end || log?.hafalan_ayah_end || ayahStart
                    const juzNum = log?.juz || log?.metadata?.juz || '-'
                    const barisAyat = log?.hafalan_baris || (ayahStart && ayahEnd ? `${Number(ayahEnd) - Number(ayahStart) + 1} ayat` : '—')

                    return (
                      <tr
                        key={dateKey}
                        className={`h-24 align-top transition-colors ${
                          isTargetDate
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="border border-slate-300 p-3 text-center font-bold dark:border-slate-600">
                          {index + 1}
                        </td>
                        <td className="border border-slate-300 p-3 dark:border-slate-600">
                          <p className="font-bold text-slate-900 dark:text-white">
                            {new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date)}
                          </p>
                          <p className="mt-1 text-[10px] text-slate-500">
                            {new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)}
                          </p>
                          {isTargetDate && (
                            <span className="mt-1.5 inline-block rounded bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                              Dipilih
                            </span>
                          )}
                        </td>
                        <td className="border border-slate-300 p-3 dark:border-slate-600">{log?.tilawah_text || '—'}</td>
                        <td className="border border-slate-300 p-3 text-center dark:border-slate-600">{log?.tilawah_baris || '—'}</td>
                        <td className="border border-slate-300 p-3 dark:border-slate-600">
                          {surahName ? (
                            <>
                              <p className="font-bold text-slate-900 dark:text-white">{surahName}</p>
                              <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                Ayat {ayahStart}–{ayahEnd} · Juz {juzNum}
                              </p>
                            </>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="border border-slate-300 p-3 text-center dark:border-slate-600">
                          {barisAyat}
                        </td>
                        <td className="border border-slate-300 p-3 dark:border-slate-600">{log?.murajaah_text || '—'}</td>
                        <td className="border border-slate-300 p-3 text-center dark:border-slate-600">{log?.murajaah_lembar || '—'}</td>
                        <td className="border border-slate-300 p-3 dark:border-slate-600">
                          {log?.notes_teacher ? (
                            <span className="text-slate-700 dark:text-slate-200">{log.notes_teacher}</span>
                          ) : log?.kelancaran ? (
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">Evaluasi: {log.kelancaran}</p>
                              {log.tajwid && log.tajwid !== '-' && <p className="text-[9px] text-slate-500">Tajwid: {log.tajwid}</p>}
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="border border-slate-300 p-3 text-center dark:border-slate-600">
                          {log?.signature_teacher || log?.kelancaran ? (
                            <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-600" aria-label="Sudah diverifikasi" />
                          ) : (
                            '—'
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 align-top dark:bg-slate-800/60">
                    <td colSpan="8" className="h-20 border border-slate-300 p-3 dark:border-slate-600">
                      <strong className="text-slate-800 dark:text-slate-200">Catatan Guru:</strong>
                      <p className="mt-1 font-normal text-slate-600 dark:text-slate-300">
                        {detailWeekRows.map(({ log }) => log?.notes_teacher).filter(Boolean).at(-1) || 'Belum ada catatan guru pada minggu ini.'}
                      </p>
                    </td>
                    <td colSpan="2" className="border border-slate-300 p-3 dark:border-slate-600">
                      <strong className="text-slate-800 dark:text-slate-200">Guru:</strong>
                      <p className="mt-2 font-normal text-slate-700 dark:text-slate-300">{selectedRecordModal.teacher_name || 'Guru Tahfizh'}</p>
                    </td>
                  </tr>
                  <tr className="bg-slate-50 align-top dark:bg-slate-800/60">
                    <td colSpan="8" className="h-20 border border-slate-300 p-3 dark:border-slate-600">
                      <strong className="text-slate-800 dark:text-slate-200">Catatan Orang Tua:</strong>
                      <p className="mt-1 font-normal text-slate-600 dark:text-slate-300">
                        {detailWeekRows.map(({ log }) => log?.notes_parent).filter(Boolean).at(-1) || 'Belum ada catatan orang tua pada minggu ini.'}
                      </p>
                    </td>
                    <td colSpan="2" className="border border-slate-300 p-3 dark:border-slate-600">
                      <strong className="text-slate-800 dark:text-slate-200">Ttd Orang Tua:</strong>
                      <p className="mt-2 font-normal text-slate-700 dark:text-slate-300">
                        {detailWeekRows.some(({ log }) => log?.signature_parent) ? 'Sudah ditandatangani' : 'Belum ditandatangani'}
                      </p>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <footer className="flex shrink-0 flex-col gap-3 border-t border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700 dark:bg-[#1B2433]">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Jenis Setoran Terpilih: <strong className="text-emerald-700 dark:text-emerald-400">{selectedRecordModal.type || 'Tahfizh'}</strong>
                </span>
                {selectedRecordModal.kelancaran && selectedRecordModal.kelancaran !== '-' && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    · Kelancaran: <strong className="text-slate-800 dark:text-slate-200">{selectedRecordModal.kelancaran}</strong>
                  </span>
                )}
              </div>
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="primary"
                  appearance="fill"
                  size="sm"
                  onClick={() => {
                    setPrintTargetRecord(selectedRecordModal)
                    setIsPrintModalOpen(true)
                  }}
                  className="flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="h-4 w-4" /> Cetak Lembar Tahfizh
                </Button>
                <Button
                  variant="ghost"
                  appearance="outline"
                  size="sm"
                  onClick={() => setSelectedRecordModal(null)}
                  className="cursor-pointer"
                >
                  Tutup Detail
                </Button>
              </div>
            </footer>
          </div>
        </div>
      )}

      {/* Modal Opsi Cetak & Unduh PDF */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => {
          setIsPrintModalOpen(false)
          setPrintTargetRecord(null)
        }}
        onPrint={handlePrintClean}
        onDownloadPdf={handleDownloadPDF}
        title={
          printTargetRecord
            ? `Cetak Detail Setoran: ${printTargetRecord.student_name}`
            : 'Rekapan Setoran Tahfizh Al-Qur\'an'
        }
      />
    </ContainerComponent>
  )
}
