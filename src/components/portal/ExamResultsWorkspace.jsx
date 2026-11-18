import { useMemo, useState, useEffect } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award,
  CheckCircle2,
  FileText,
  BarChart3,
  Lock,
  Printer,
  Loader2,
  Sparkles,
  BookOpen,
  Calendar,
  Layers,
  Search,
  RotateCcw,
  Download,
  AlertCircle,
  Clock,
  UserCheck,
  Check,
  GraduationCap,
  FileSpreadsheet,
} from 'lucide-react'
import {
  Card as HeroCard,
  Chip as HeroChip,
  Button as HeroButton,
} from '@heroui/react'
import useDebounce from '../../hooks/useDebounce'
import { cn } from '../../lib/utils'
import { printWeeklyStudentEvaluation } from '../../utils/printHelper'

const formatDate = (val) => {
  if (!val) return '-'
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date(val))
  } catch {
    return String(val)
  }
}

export default function ExamResultsWorkspace({
  resultsData = null,
  reports = [],
  loading = false,
  student = null,
}) {
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'ujian' | 'tugas' | 'rapor' | 'evaluasi'

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 350)
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'tuntas' | 'belum_tuntas'

  // Resolusi data siswa aktif secara dinamis (Zero Hardcode)
  const activeStudent = student || resultsData?.student || null

  const isBoarding = useMemo(() => {
    if (typeof activeStudent?.program === 'string') return activeStudent.program === 'boarding'
    if (activeStudent?.is_pesantren !== undefined) return Boolean(activeStudent.is_pesantren)
    const unit = (
      activeStudent?.unit_name ||
      activeStudent?.education_unit?.name ||
      activeStudent?.unit_code ||
      ''
    ).toLowerCase()
    return unit.includes('pesantren') || unit.includes('ponpes') || unit.includes('asrama')
  }, [activeStudent])

  const currentAcademicYear = useMemo(() => {
    if (activeStudent?.academic_year) return activeStudent.academic_year
    if (activeStudent?.tahun_ajaran) return activeStudent.tahun_ajaran
    if (activeStudent?.kelas?.academic_year) return activeStudent.kelas.academic_year
    if (activeStudent?.academic_year_name) return activeStudent.academic_year_name
    const now = new Date()
    const year = now.getFullYear()
    const isOdd = now.getMonth() >= 6
    return isOdd ? `${year}/${year + 1}` : `${year - 1}/${year}`
  }, [activeStudent])

  // Normalisasi data dari API backend
  const cbtResults = useMemo(() => {
    if (Array.isArray(resultsData?.cbt_results)) return resultsData.cbt_results
    return []
  }, [resultsData])

  const assignmentResults = useMemo(() => {
    if (Array.isArray(resultsData?.assignment_results)) return resultsData.assignment_results
    return []
  }, [resultsData])

  const grades = useMemo(() => {
    if (Array.isArray(resultsData?.grades)) return resultsData.grades
    return []
  }, [resultsData])

  const reportsList = useMemo(() => {
    if (Array.isArray(reports)) return reports
    return []
  }, [reports])

  // Metrik KPI ringkasan yang dihitung secara dinamis
  const stats = useMemo(() => {
    const totalCompleted =
      resultsData?.summary?.total_completed ?? (cbtResults.length + assignmentResults.length)

    let avgScore = '-'
    if (resultsData?.summary?.average_score !== undefined && resultsData?.summary?.average_score !== null) {
      avgScore = Math.round(Number(resultsData.summary.average_score))
    } else {
      const validScores = [...cbtResults, ...assignmentResults]
        .map((r) => r.score)
        .filter((s) => typeof s === 'number' && !isNaN(s))
      if (validScores.length > 0) {
        avgScore = Math.round(validScores.reduce((acc, curr) => acc + curr, 0) / validScores.length)
      }
    }

    const tuntasCount = [...cbtResults, ...assignmentResults].filter(
      (r) => r.status_tuntas === 'Tuntas' || (r.kkm != null && r.score != null && r.score >= r.kkm)
    ).length

    return { totalCompleted, avgScore, tuntasCount }
  }, [resultsData, cbtResults, assignmentResults])

  // Gabungkan seluruh evaluasi
  const allList = useMemo(() => {
    return [
      ...cbtResults.map((c) => ({ ...c, itemType: 'ujian' })),
      ...assignmentResults.map((a) => ({ ...a, itemType: 'tugas' })),
      ...grades.map((g) => ({ ...g, itemType: 'rapor_komponen' })),
    ]
  }, [cbtResults, assignmentResults, grades])

  // Daftar data per tab aktif
  const currentTabItems = useMemo(() => {
    if (activeTab === 'ujian') return allList.filter((i) => i.itemType === 'ujian')
    if (activeTab === 'tugas') return allList.filter((i) => i.itemType === 'tugas')
    if (activeTab === 'rapor') return reportsList.map((r) => ({ ...r, itemType: 'rapor' }))
    if (activeTab === 'evaluasi') return []
    return allList
  }, [activeTab, allList, reportsList])

  // Ekstrak daftar mata pelajaran unik dinamis dengan Jadwal Pelajaran (ClassSchedule) sebagai acuan utama
  const availableSubjects = useMemo(() => {
    // 1. Acuan Utama: Jadwal Pelajaran Resmi Siswa dari backend
    if (Array.isArray(resultsData?.official_subjects) && resultsData.official_subjects.length > 0) {
      return [...resultsData.official_subjects].sort((a, b) => a.localeCompare(b))
    }

    // 2. Fallback: Ekstrak dari daftar item asesmen
    const set = new Set()
    const targetSource = activeTab === 'all' ? allList : currentTabItems
    targetSource.forEach((item) => {
      const subj = item.subject || item.mata_pelajaran
      if (subj && typeof subj === 'string' && subj.trim()) {
        set.add(subj.trim())
      }
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [resultsData?.official_subjects, activeTab, allList, currentTabItems])

  // Reset selectedSubject jika tab berganti dan subjek tidak tersedia di tab tersebut
  useEffect(() => {
    if (selectedSubject !== 'all' && !availableSubjects.includes(selectedSubject)) {
      setSelectedSubject('all')
    }
  }, [availableSubjects, selectedSubject])

  // Filter data berdasarkan search, mata pelajaran, dan status ketuntasan
  const filteredItems = useMemo(() => {
    return currentTabItems.filter((item) => {
      // 1. Status Filter
      if (statusFilter !== 'all') {
        const isTuntas =
          item.status_tuntas === 'Tuntas' ||
          (item.kkm != null && item.score != null && item.score >= item.kkm)
        if (statusFilter === 'tuntas' && !isTuntas) return false
        if (statusFilter === 'belum_tuntas' && isTuntas) return false
      }

      // 2. Subject Filter (pencocokan fleksibel antara acuan jadwal dengan varian label asesmen)
      if (selectedSubject !== 'all') {
        const itemSubj = String(item.subject || item.mata_pelajaran || '').trim().toLowerCase()
        const targetSubj = selectedSubject.trim().toLowerCase()
        if (itemSubj !== targetSubj && !itemSubj.includes(targetSubj) && !targetSubj.includes(itemSubj)) {
          return false
        }
      }

      // 3. Search Query Debounced
      if (debouncedSearch.trim()) {
        const query = debouncedSearch.toLowerCase().trim()
        const title = String(item.title || item.semester?.name || '').toLowerCase()
        const subject = String(item.subject || item.mata_pelajaran || '').toLowerCase()
        const teacher = String(item.teacher || item.guru || '').toLowerCase()
        const notes = String(item.notes || '').toLowerCase()

        if (
          !title.includes(query) &&
          !subject.includes(query) &&
          !teacher.includes(query) &&
          !notes.includes(query)
        ) {
          return false
        }
      }

      return true
    })
  }, [currentTabItems, statusFilter, selectedSubject, debouncedSearch])

  const hasActiveFilters =
    statusFilter !== 'all' || selectedSubject !== 'all' || searchQuery.trim() !== ''

  const handleResetFilters = () => {
    setStatusFilter('all')
    setSelectedSubject('all')
    setSearchQuery('')
  }

  // Handle cetak lembar evaluasi
  const handlePrintEvaluation = () => {
    const eduUnit = activeStudent?.education_unit || (typeof activeStudent?.unit === 'object' ? activeStudent.unit : null)
    printWeeklyStudentEvaluation({
      student: {
        ...activeStudent,
        name: activeStudent?.name || activeStudent?.full_name || activeStudent?.nama_lengkap || (isBoarding ? 'Santri' : 'Siswa'),
        nis: activeStudent?.nis || activeStudent?.nisn || activeStudent?.student_id || '-',
        className: activeStudent?.kelas?.nama_kelas || activeStudent?.className || '-',
        unit: eduUnit?.name || activeStudent?.unit_name || activeStudent?.unit || 'Unit Sekolah',
        unitName: eduUnit?.name || activeStudent?.unit_name || activeStudent?.unit || 'Unit Sekolah',
        education_unit: eduUnit || ((activeStudent?.unit_name || activeStudent?.unit) ? { name: activeStudent.unit_name || activeStudent.unit } : null),
      },
      period: {
        title: resultsData?.period_title || 'Periode Berjalan',
        academicYear: resultsData?.academic_year || activeStudent?.academic_year?.name || activeStudent?.tahun_ajaran || `Tahun Ajaran ${currentAcademicYear}`,
      },
      tahfizh: {
        lastSurah: activeStudent?.tahfizh?.last_surah || resultsData?.tahfizh?.last_surah || '-',
        lastDepositDate: activeStudent?.tahfizh?.last_deposit_date || resultsData?.tahfizh?.last_deposit_date || '-',
        totalLines: activeStudent?.tahfizh?.total_lines ?? resultsData?.tahfizh?.total_lines ?? 0,
        targetLines: activeStudent?.tahfizh?.target_lines ?? resultsData?.tahfizh?.target_lines ?? 0,
        status: activeStudent?.tahfizh?.status || resultsData?.tahfizh?.status || '-',
      },
      attendance: activeStudent?.weekly_attendance || resultsData?.weekly_attendance || [],
      teacherNotes: activeStudent?.teacher_notes || resultsData?.teacher_notes || 'Tidak ada catatan guru pada periode ini.',
      homeroomTeacher: {
        name: activeStudent?.kelas?.wali_kelas?.name || activeStudent?.wali_kelas?.nama || activeStudent?.homeroom_teacher || '-',
      },
      guruWali: {
        name: activeStudent?.guru_wali?.nama || activeStudent?.guru_wali?.name || activeStudent?.wali_kelas?.nama || '-',
      },
      schoolCity: eduUnit?.metadata?.city || eduUnit?.city || eduUnit?.kota || activeStudent?.city || '',
    })
  }

  if (loading) {
    return (
      <HeroCard className="relative overflow-hidden rounded-[24px] border-2 border-emerald-500/20 bg-white p-12 shadow-sm dark:border-emerald-800/40 dark:bg-slate-900">
        <div className="flex flex-col items-center justify-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-extrabold text-slate-700 dark:text-slate-300">
            Memuat Rekapitulasi Hasil Belajar & Rapor...
          </p>
        </div>
      </HeroCard>
    )
  }

  return (
    <div className="space-y-6">
      {/* 1. HERO HEADER CONTAINER TERPADU (HERO UI CARD) */}
      <HeroCard className="relative overflow-hidden rounded-[24px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-indigo-600/15 p-5 sm:p-7 shadow-lg shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
        {/* Dual Multi-tone Ambient Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-emerald-500/35 via-teal-400/25 to-transparent blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-gradient-to-tl from-indigo-500/35 via-emerald-400/25 to-transparent blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[.06] text-emerald-600 dark:text-emerald-500 [background-image:radial-gradient(circle_at_2px_2px,currentColor_1.5px,transparent_0)] [background-size:24px_24px]"
        />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-700 text-white shadow-xl shadow-emerald-600/20">
              <Award className="h-7 w-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <HeroChip
                  size="sm"
                  variant="flat"
                  className="font-extrabold text-[10.5px] bg-emerald-500/20 border border-emerald-500/30 text-emerald-900 dark:text-emerald-300"
                >
                  <Sparkles className="h-3 w-3 text-emerald-600 mr-1 inline" />
                  Rekapitulasi Nilai & Hasil Belajar
                </HeroChip>

                <HeroChip
                  size="sm"
                  variant="flat"
                  className={cn(
                    'font-black text-[10px]',
                    isBoarding
                      ? 'bg-indigo-100 text-indigo-800 border border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                  )}
                >
                  {isBoarding ? 'Boarding / Pesantren' : 'Full Day'}
                </HeroChip>

                <HeroChip
                  size="sm"
                  variant="flat"
                  className="font-bold text-[10.5px] bg-white/80 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                >
                  <Calendar className="h-3 w-3 text-teal-600 mr-1 inline" />
                  Tahun Ajaran {currentAcademicYear}
                </HeroChip>

                {stats.avgScore !== '-' && (
                  <HeroChip
                    size="sm"
                    variant="flat"
                    className="font-black text-[10px] bg-white/80 text-emerald-900 border border-emerald-300 dark:bg-slate-800 dark:text-emerald-300 dark:border-slate-700"
                  >
                    Rata-rata Nilai: {stats.avgScore}
                  </HeroChip>
                )}
              </div>

              <h1 className="mt-1.5 text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeStudent?.full_name
                  ? `Hasil Belajar & Rapor — ${activeStudent.full_name}`
                  : isBoarding
                  ? 'Hasil Belajar & Rapor Santri'
                  : 'Hasil Belajar & Rapor Siswa'}
              </h1>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 max-w-2xl">
                Pantau hasil penilaian ujian CBT, lembar evaluasi berkala, tugas pembelajaran, serta buku rapor resmi ananda secara transparan.
              </p>
            </div>
          </div>

          {/* Action CTA: Cetak Lembar Evaluasi Perkembangan */}
          <div className="flex items-center gap-3 shrink-0">
            <HeroButton
              size="md"
              onPress={handlePrintEvaluation}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Cetak Lembar Evaluasi / PDF</span>
            </HeroButton>
          </div>
        </div>
      </HeroCard>

      {/* 2. DYNAMIC 5 KPI STATS CARDS (HERO UI CARDS) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {/* Card 1: Rata-rata Skor */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
          <HeroCard className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-4.5 shadow-xs transition-all hover:shadow-md dark:border-emerald-700/40 dark:bg-slate-900">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-500/15 via-teal-500/5 to-transparent blur-xl"
            />
            <div className="relative flex items-center justify-between gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-500/20">
                <Award className="h-5 w-5" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {stats.avgScore}
              </span>
            </div>
            <p className="relative mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
              Rata-rata Skor
            </p>
            <p className="relative mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Seluruh asesmen semester ini
            </p>
          </HeroCard>
        </motion.div>

        {/* Card 2: Ujian CBT Selesai */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
          <HeroCard className="relative overflow-hidden rounded-[22px] border-2 border-sky-500/25 bg-white p-4.5 shadow-xs transition-all hover:shadow-md dark:border-sky-700/40 dark:bg-slate-900">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-sky-500/15 via-blue-500/5 to-transparent blur-xl"
            />
            <div className="relative flex items-center justify-between gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-blue-700 text-white shadow-md shadow-sky-500/20">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {cbtResults.length}
              </span>
            </div>
            <p className="relative mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
              Ujian CBT Selesai
            </p>
            <p className="relative mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Sesi ujian terselesaikan
            </p>
          </HeroCard>
        </motion.div>

        {/* Card 3: Tugas Terkumpul */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
          <HeroCard className="relative overflow-hidden rounded-[22px] border-2 border-amber-500/25 bg-white p-4.5 shadow-xs transition-all hover:shadow-md dark:border-amber-700/40 dark:bg-slate-900">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-amber-500/15 via-orange-500/5 to-transparent blur-xl"
            />
            <div className="relative flex items-center justify-between gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-500/20">
                <FileText className="h-5 w-5" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {assignmentResults.length}
              </span>
            </div>
            <p className="relative mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
              Tugas KBM Terkumpul
            </p>
            <p className="relative mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Dari penugasan guru
            </p>
          </HeroCard>
        </motion.div>

        {/* Card 4: Status Tuntas */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
          <HeroCard className="relative overflow-hidden rounded-[22px] border-2 border-indigo-500/25 bg-white p-4.5 shadow-xs transition-all hover:shadow-md dark:border-indigo-700/40 dark:bg-slate-900">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500/15 via-purple-500/5 to-transparent blur-xl"
            />
            <div className="relative flex items-center justify-between gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-700 text-white shadow-md shadow-indigo-500/20">
                <BarChart3 className="h-5 w-5" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {stats.tuntasCount}
              </span>
            </div>
            <p className="relative mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
              Status Tuntas (KKM)
            </p>
            <p className="relative mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Mencapai standar KKM
            </p>
          </HeroCard>
        </motion.div>

        {/* Card 5: Buku Rapor Terbit */}
        <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.18 }} className="col-span-2 sm:col-span-1">
          <HeroCard className="relative overflow-hidden rounded-[22px] border-2 border-teal-500/25 bg-white p-4.5 shadow-xs transition-all hover:shadow-md dark:border-teal-700/40 dark:bg-slate-900">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-gradient-to-br from-teal-500/15 via-emerald-500/5 to-transparent blur-xl"
            />
            <div className="relative flex items-center justify-between gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-emerald-700 text-white shadow-md shadow-teal-500/20">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {reportsList.length}
              </span>
            </div>
            <p className="relative mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">
              Buku Rapor Terbit
            </p>
            <p className="relative mt-0.5 text-[11px] font-medium text-slate-400 dark:text-slate-500">
              Dokumen rapor resmi
            </p>
          </HeroCard>
        </motion.div>
      </div>

      {/* 3. WORKSPACE CONTAINER (HERO UI CARD) */}
      <HeroCard className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/20 bg-white p-5 sm:p-6 shadow-xs dark:border-emerald-800/40 dark:bg-slate-900">
        {/* Navigation / Filter Toolbar Terpadu */}
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 dark:border-slate-800">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Rekapitulasi Evaluasi & Rapor Belajar
                </h3>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Pantau hasil penilaian ujian, tugas, lembar evaluasi berkala, dan buku rapor resmi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <HeroChip
                size="sm"
                variant="flat"
                className="font-bold text-[11px] bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
              >
                <GraduationCap className="h-3 w-3 mr-1 inline text-emerald-600" />
                {activeStudent?.kelas?.nama_kelas || activeStudent?.class_name || 'Seluruh Kelas'}
              </HeroChip>
            </div>
          </div>

          {/* Segmented Tab Navigation Bar (Stabil, zero layout shift) */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'Semua Hasil', count: allList.length },
              { id: 'ujian', label: 'Ujian CBT', count: cbtResults.length },
              { id: 'tugas', label: 'Tugas KBM', count: assignmentResults.length },
              { id: 'rapor', label: 'Buku Rapor', count: reportsList.length },
              { id: 'evaluasi', label: 'Lembar Evaluasi Berkala', count: null },
            ].map(({ id, label, count }) => {
              const isActive = activeTab === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    setActiveTab(id)
                    handleResetFilters()
                  }}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 sm:flex-1 text-center select-none',
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white shadow-xs font-extrabold ring-1 ring-emerald-500/30'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                  )}
                >
                  <span>{label}</span>
                  {count !== null && (
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-extrabold',
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                      )}
                    >
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* FILTER & SEARCH TOOLBAR (Untuk tab non-evaluasi) */}
          {activeTab !== 'evaluasi' && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-3.5 sm:p-4 dark:border-emerald-900/30 dark:bg-slate-800/40 space-y-3.5">
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-12 items-center">
                {/* Search Box */}
                <div className="relative lg:col-span-5">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Cari judul asesmen, mapel, guru pengampu..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/90 bg-white py-2 pl-9 pr-8 text-xs font-medium text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:placeholder-slate-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Mata Pelajaran Dinamis */}
                <div className="relative lg:col-span-4">
                  <BookOpen className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <CustomSelect
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-slate-200/90 bg-white py-2 pl-9 pr-8 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="all">Semua Mata Pelajaran ({availableSubjects.length})</option>
                    {availableSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </CustomSelect>
                </div>

                {/* Filter Status Ketuntasan */}
                <div className="relative lg:col-span-3 flex items-center gap-2">
                  <CustomSelect
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/90 bg-white py-2 px-3 text-xs font-semibold text-slate-700 focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
                  >
                    <option value="all">Semua Ketuntasan</option>
                    <option value="tuntas">Tuntas (Mencapai KKM)</option>
                    <option value="belum_tuntas">Belum Tuntas / Remedial</option>
                  </CustomSelect>

                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 p-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/60 dark:text-rose-300 cursor-pointer shrink-0"
                      title="Reset Filter"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Indikator Jumlah Data */}
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Menampilkan <span className="font-extrabold text-emerald-700 dark:text-emerald-300">{filteredItems.length}</span> dari {currentTabItems.length} hasil evaluasi
              </div>
            </div>
          )}
        </div>

        {/* 4. KONTEN TAB HASIL EVALUASI */}
        {activeTab === 'evaluasi' ? (
          /* TAB LEMBAR EVALUASI BERKALA (DENGAN TEMA TERSINKRONISASI) */
          <div className="mt-6 space-y-6">
            {/* Header Action Bar Lembar Evaluasi */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Laporan Perkembangan {isBoarding ? 'Santri' : 'Siswa'} Terpadu
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {resultsData?.period_title || `Lembar Evaluasi Perkembangan ${isBoarding ? 'Santri' : 'Siswa'}`}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  <span>{isBoarding ? 'Santri' : 'Siswa'}: </span>
                  <strong className="text-slate-800 dark:text-slate-200">
                    {activeStudent?.full_name || activeStudent?.name || 'Ananda'}
                  </strong>
                  <span className="mx-1.5">·</span>
                  <span>Kelas: {activeStudent?.kelas?.nama_kelas || activeStudent?.className || '-'}</span>
                </p>
              </div>

              <HeroButton
                size="sm"
                onPress={handlePrintEvaluation}
                className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 text-white text-xs font-black rounded-xl shadow-md hover:scale-[1.01] cursor-pointer self-start sm:self-auto gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Lembar Evaluasi / PDF</span>
              </HeroButton>
            </div>

            {/* Bagian Capaian Tahsin & Tahfizh */}
            <div className="rounded-2xl overflow-hidden border border-emerald-200/90 dark:border-emerald-800/80 shadow-xs">
              <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white px-4 py-3 font-black text-xs uppercase tracking-wide flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Capaian Tahsin & Tahfizh Al-Qur'an</span>
              </div>
              <div className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs bg-white dark:bg-slate-900">
                <div className="grid grid-cols-1 md:grid-cols-2 p-3.5 hover:bg-emerald-50/30 dark:hover:bg-slate-800/50">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Setoran Surat Terakhir</span>
                  <span className="font-black text-slate-900 dark:text-white">
                    {activeStudent?.tahfizh?.last_surah || resultsData?.tahfizh?.last_surah || '-'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 p-3.5 hover:bg-emerald-50/30 dark:hover:bg-slate-800/50">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Tanggal Setoran Terakhir</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {activeStudent?.tahfizh?.last_deposit_date || resultsData?.tahfizh?.last_deposit_date || '-'}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 p-3.5 hover:bg-emerald-50/30 dark:hover:bg-slate-800/50">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Total Baris Setoran (Periode Ini)</span>
                  <span className="font-black text-emerald-700 dark:text-emerald-400">
                    {activeStudent?.tahfizh?.total_lines ?? resultsData?.tahfizh?.total_lines ?? '-'} Baris
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 p-3.5 hover:bg-emerald-50/30 dark:hover:bg-slate-800/50">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Target Baris Pekan Ini</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {activeStudent?.tahfizh?.target_lines ?? resultsData?.tahfizh?.target_lines ?? '-'} Baris
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 p-3.5 hover:bg-emerald-50/30 dark:hover:bg-slate-800/50">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Status Capaian Target</span>
                  <span className="inline-flex items-center gap-2 font-black text-emerald-600 dark:text-emerald-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    {activeStudent?.tahfizh?.status || resultsData?.tahfizh?.status || 'Tercapai'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bagian Catatan & Rekomendasi Guru */}
            <div className="rounded-2xl overflow-hidden border border-emerald-200/90 dark:border-emerald-800/80 shadow-xs">
              <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 text-white px-4 py-3 font-black text-xs uppercase tracking-wide flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Catatan Perkembangan & Rekomendasi Guru</span>
              </div>
              <div className="p-4 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {activeStudent?.teacher_notes || resultsData?.teacher_notes || 'Alhamdulillah ananda menunjukkan perkembangan belajar yang positif, berakhlak mulia, dan tekun dalam mengikuti pembelajaran.'}
              </div>
            </div>

            {/* Pesan Kemitraan Sinergi Sekolah & Orang Tua */}
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-slate-800/50 border border-emerald-200/70 dark:border-emerald-800/50 text-xs space-y-3">
              <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                🤝 <strong>Kemitraan Pendidikan:</strong> Kami meyakini bahwa keberhasilan pendidikan Ananda merupakan hasil sinergi harmonis antara pihak sekolah dan keluarga. Mari bersama mendampingi, mengarahkan, serta mendoakan Ananda agar terus bertumbuh menjadi pribadi yang berilmu amaliah dan berakhlak mulia.
              </p>
              <p className="font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                💬 <strong>Konsultasi & Diskusi:</strong> Apabila Ayah/Bunda ingin berdiskusi mengenai perkembangan ananda, silakan menghubungi wali kelas atau guru bimbingan konseling melalui fitur Chat Guru.
              </p>
              <p className="text-center font-bold text-sm text-emerald-700 dark:text-emerald-400 pt-1 font-serif">
                جَزَاكُمُ اللَّهُ خَيْرًا وَبَارَكَ اللَّهُ فِيكُمْ
              </p>
            </div>
          </div>
        ) : (
          /* LIST HASIL EVALUASI & RAPOR (HERO UI GRID CARDS) */
          <div className="mt-6">
            {activeTab === 'rapor' ? (
              /* Tampilan Khusus Buku Rapor */
              <div className="grid gap-4 md:grid-cols-2">
                {filteredItems.map((report) => (
                  <motion.div
                    key={report.id}
                    whileHover={{ y: -2 }}
                    className="relative overflow-hidden rounded-[20px] border-2 border-emerald-200/90 bg-white p-5 shadow-xs hover:shadow-md dark:border-emerald-800/80 dark:bg-slate-900"
                  >
                    <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-600" />
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-100 px-2.5 py-0.5 text-[10px] font-black uppercase text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <FileSpreadsheet className="h-3 w-3" />
                          Buku Rapor Resmi
                        </span>
                        <h4 className="mt-2 text-base font-black text-slate-900 dark:text-white">
                          {report.judul_rapor || `Laporan Hasil Belajar — ${report.semester?.name || 'Semester Aktif'}`}
                        </h4>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                          Kelas: {report.kelas?.nama_kelas || activeStudent?.kelas?.nama_kelas || '-'} · Wali Kelas: {report.waliKelas?.nama_lengkap || report.wali_kelas?.nama || 'Wali Kelas'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Diterbitkan: {formatDate(report.tanggal_terbit || report.created_at)}
                        </p>
                      </div>

                      <a
                        href={`/api/portal/reports/${report.id}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:shadow-md transition-all cursor-pointer shrink-0"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Unduh PDF</span>
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* Tampilan Hasil Ujian CBT, Tugas KBM & Rapor Komponen */
              <div className="grid gap-4 md:grid-cols-2">
                {filteredItems.map((item, idx) => {
                  const isUjian = item.itemType === 'ujian'
                  const isTugas = item.itemType === 'tugas'
                  const isTuntas =
                    item.status_tuntas === 'Tuntas' ||
                    (item.kkm != null && item.score != null && item.score >= item.kkm)

                  return (
                    <motion.div
                      key={item.id || idx}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.15 }}
                      className={cn(
                        'relative overflow-hidden rounded-[20px] border-2 p-5 shadow-xs transition-all hover:shadow-md bg-white dark:bg-slate-900',
                        isTuntas
                          ? 'border-emerald-200/90 dark:border-emerald-800/80 hover:border-emerald-400'
                          : 'border-amber-200/90 dark:border-amber-800/80 hover:border-amber-400'
                      )}
                    >
                      {/* Top Status Gradient Stripe */}
                      <div
                        className={cn(
                          'absolute left-0 right-0 top-0 h-1.5',
                          isTuntas
                            ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600'
                            : 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600'
                        )}
                      />

                      <div className="flex flex-col justify-between h-full gap-3">
                        <div>
                          {/* Top Tag & Status Chip */}
                          <div className="flex items-start justify-between gap-2">
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 truncate max-w-[200px]">
                              <BookOpen className="h-3 w-3 shrink-0" />
                              <span className="truncate">
                                {item.subject || item.mata_pelajaran || 'Mata Pelajaran'}
                              </span>
                            </span>

                            <HeroChip
                              size="sm"
                              variant="flat"
                              className={cn(
                                'font-black text-[10px] border px-2 py-0.5',
                                isUjian
                                  ? 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-800'
                                  : isTugas
                                  ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                                  : 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800'
                              )}
                            >
                              {isUjian ? 'Ujian CBT' : isTugas ? 'Tugas KBM' : 'Komponen Rapor'}
                            </HeroChip>
                          </div>

                          {/* Judul Asesmen */}
                          <h4 className="mt-2.5 text-base font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
                            {item.title}
                          </h4>

                          {/* Guru & Tanggal Penyelesaian */}
                          <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                            <span>{item.teacher || 'Guru Pengampu'}</span>
                            <span className="mx-1.5">·</span>
                            <span>Selesai: {formatDate(item.date || item.created_at)}</span>
                          </p>

                          {/* Catatan Guru jika ada */}
                          {item.notes && (
                            <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50/80 p-2.5 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300 italic">
                              <span className="font-bold not-italic text-slate-500">Catatan Guru: </span>
                              "{item.notes}"
                            </div>
                          )}
                        </div>

                        {/* Nilai Skor & Status Ketuntasan */}
                        <div className="mt-2 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                          <div className="space-y-0.5 min-w-[120px]">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                              Standar KKM: {item.kkm ?? '-'}
                            </span>
                            {item.correct != null && (
                              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                                Benar: {item.correct} · Salah: {item.wrong} · Kosong: {item.empty}
                              </div>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            {item.is_published !== false && item.score != null ? (
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-black border shrink-0',
                                    isTuntas
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                                      : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800'
                                  )}
                                >
                                  {isTuntas ? (
                                    <>
                                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                                      Tuntas
                                    </>
                                  ) : (
                                    <>
                                      <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                                      Remedial
                                    </>
                                  )}
                                </span>
                                <span className="text-2xl font-black text-slate-900 dark:text-white shrink-0">
                                  {item.score}
                                </span>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                <Lock className="h-3.5 w-3.5" /> Menunggu Rilis
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {filteredItems.length === 0 && (
              <div className="py-16 text-center text-xs text-slate-400 dark:text-slate-500 space-y-2">
                <Award className="mx-auto h-12 w-12 text-emerald-300 dark:text-emerald-700" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  Belum Ada Hasil Penilaian
                </p>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  {hasActiveFilters
                    ? 'Tidak ada penilaian yang sesuai dengan kriteria filter pencarian.'
                    : `Belum ada data evaluasi atau laporan nilai pada kategori ini untuk ${activeStudent?.full_name ? `ananda ${activeStudent.full_name}` : 'siswa'}.`}
                </p>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Filter Pencarian
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </HeroCard>
    </div>
  )
}
