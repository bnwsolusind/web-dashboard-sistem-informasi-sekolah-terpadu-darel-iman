import { useMemo, useState, useEffect } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Award,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Search,
  Loader2,
  School,
  Layers,
  CalendarDays,
  Sparkles,
  Star,
  X,
  FileText,
  BarChart2,
  MessageSquare,
} from 'lucide-react'
import { Button } from '../ui/button'

const getSubjectColor = (subjectName = '', subjectCode = '') => {
  const s = `${subjectName} ${subjectCode}`.toLowerCase()
  if (
    s.includes('agama') ||
    s.includes('pai') ||
    s.includes('tahfizh') ||
    s.includes('tahsin') ||
    s.includes('quran') ||
    s.includes('fiqih') ||
    s.includes('aqidah') ||
    s.includes('akhlak')
  ) {
    return {
      text: 'text-emerald-700 dark:text-emerald-300',
      pill: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
      dot: 'bg-emerald-500',
      accent: 'border-l-emerald-500',
      bar: 'bg-emerald-500',
    }
  }
  if (
    s.includes('matematika') ||
    s.includes('ipa') ||
    s.includes('fisika') ||
    s.includes('kimia') ||
    s.includes('biologi') ||
    s.includes('sains')
  ) {
    return {
      text: 'text-cyan-700 dark:text-cyan-300',
      pill: 'bg-cyan-50 text-cyan-800 border-cyan-200 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800',
      dot: 'bg-cyan-500',
      accent: 'border-l-cyan-500',
      bar: 'bg-cyan-500',
    }
  }
  if (
    s.includes('bahasa') ||
    s.includes('arab') ||
    s.includes('inggris') ||
    s.includes('indonesia')
  ) {
    return {
      text: 'text-purple-700 dark:text-purple-300',
      pill: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800',
      dot: 'bg-purple-500',
      accent: 'border-l-purple-500',
      bar: 'bg-purple-500',
    }
  }
  if (
    s.includes('ips') ||
    s.includes('sejarah') ||
    s.includes('sosiologi') ||
    s.includes('geografi') ||
    s.includes('ekonomi') ||
    s.includes('pkn') ||
    s.includes('pancasila')
  ) {
    return {
      text: 'text-amber-700 dark:text-amber-300',
      pill: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
      dot: 'bg-amber-500',
      accent: 'border-l-amber-500',
      bar: 'bg-amber-500',
    }
  }
  return {
    text: 'text-teal-700 dark:text-teal-300',
    pill: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800',
    dot: 'bg-teal-500',
    accent: 'border-l-teal-500',
    bar: 'bg-teal-500',
  }
}

const getLetterFromScore = (score, customScale = null) => {
  if (score == null || isNaN(score)) return '-'
  if (Array.isArray(customScale) && customScale.length > 0) {
    const matched = customScale.find((s) => score >= (s.min_score ?? s.min ?? 0))
    if (matched) return matched.grade || matched.letter || matched.predicate || '-'
  }
  if (score >= 90) return 'A'
  if (score >= 80) return 'B'
  if (score >= 70) return 'C'
  return 'D'
}

const getPredicateTheme = (letter = '') => {
  const l = String(letter).toUpperCase().trim()
  if (l.startsWith('A')) {
    return {
      label: `Predikat ${l}`,
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
      text: 'text-emerald-600 dark:text-emerald-400',
      bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    }
  }
  if (l.startsWith('B')) {
    return {
      label: `Predikat ${l}`,
      badge: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-400',
      bgLight: 'bg-blue-50 dark:bg-blue-950/40',
    }
  }
  if (l.startsWith('C')) {
    return {
      label: `Predikat ${l}`,
      badge: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
      text: 'text-amber-600 dark:text-amber-400',
      bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    }
  }
  if (l.startsWith('D')) {
    return {
      label: `Predikat ${l}`,
      badge: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
      text: 'text-rose-600 dark:text-rose-400',
      bgLight: 'bg-rose-50 dark:bg-rose-950/40',
    }
  }
  return {
    label: l && l !== '-' ? `Predikat ${l}` : 'Belum Ditentukan',
    badge: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    text: 'text-slate-600 dark:text-slate-400',
    bgLight: 'bg-slate-50 dark:bg-slate-800/40',
  }
}

export default function GradesWorkspace({
  grades = [],
  loading = false,
  student = null,
}) {
  const [draftSearch, setDraftSearch] = useState('')
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'tuntas' | 'belum_tuntas' | 'pred_{letter}'
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedDetail, setSelectedDetail] = useState(null)

  // Debounced search (350ms)
  useEffect(() => {
    const timer = setTimeout(() => setSearch(draftSearch), 350)
    return () => clearTimeout(timer)
  }, [draftSearch])

  const safeGrades = useMemo(() => {
    if (Array.isArray(grades)) return grades
    if (grades && Array.isArray(grades.items)) return grades.items
    if (grades && Array.isArray(grades.data)) return grades.data
    return []
  }, [grades])

  const summary = grades?.summary || {}
  const period = grades?.period || {}
  const publication = grades?.publication || {}

  // Calculate dynamic stats accurately from database records (zero hardcoded values)
  const stats = useMemo(() => {
    if (!safeGrades.length) {
      return {
        total: summary.total_subjects ?? 0,
        avg: summary.average_score ?? '-',
        max: summary.highest_score ?? '-',
        tuntas: summary.passed_subjects ?? 0,
        belumTuntas: summary.remedial_subjects ?? 0,
      }
    }

    let sum = 0
    let validScoreCount = 0
    let max = -Infinity
    let tuntasCount = 0
    let belumTuntasCount = 0

    safeGrades.forEach((g) => {
      const score = g.final_score != null ? parseFloat(g.final_score) : (g.score != null ? parseFloat(g.score) : null)
      if (score !== null && !isNaN(score)) {
        sum += score
        validScoreCount++
        if (score > max) max = score
      }

      const kkm = g.kkm != null ? parseFloat(g.kkm) : (g.subject?.kkm != null ? parseFloat(g.subject.kkm) : null)
      const isPassed = g.is_passed != null ? g.is_passed : (score !== null && kkm !== null ? score >= kkm : true)
      if (isPassed) tuntasCount++
      else belumTuntasCount++
    })

    const avg = validScoreCount > 0 ? (sum / validScoreCount).toFixed(1) : (summary.average_score ?? '-')
    const highest = max !== -Infinity ? max : (summary.highest_score ?? '-')

    return {
      total: safeGrades.length,
      avg: summary.average_score != null ? summary.average_score : avg,
      max: summary.highest_score != null ? summary.highest_score : highest,
      tuntas: summary.passed_subjects != null ? summary.passed_subjects : tuntasCount,
      belumTuntas: summary.remedial_subjects != null ? summary.remedial_subjects : belumTuntasCount,
    }
  }, [safeGrades, summary])

  // Extract distinct predicates strictly from existing records (no dummy/zero tabs)
  const availablePredicates = useMemo(() => {
    const set = new Set()
    safeGrades.forEach((g) => {
      const score = g.final_score ?? g.score
      const p = String(g.grade_letter || g.predicate || getLetterFromScore(score)).toUpperCase().trim()
      if (p && p !== '-') set.add(p)
    })
    return Array.from(set).sort()
  }, [safeGrades])

  // Dynamic filter tabs
  const filterTabs = useMemo(() => {
    const tabs = [
      { id: 'all', label: 'Semua Mapel', count: safeGrades.length },
      { id: 'tuntas', label: 'Tuntas KKM', count: stats.tuntas },
    ]
    if (stats.belumTuntas > 0) {
      tabs.push({ id: 'belum_tuntas', label: 'Perlu Penguatan', count: stats.belumTuntas })
    }
    availablePredicates.forEach((pred) => {
      const count = safeGrades.filter((g) => {
        const score = g.final_score ?? g.score
        const p = String(g.grade_letter || g.predicate || getLetterFromScore(score)).toUpperCase().trim()
        return p === pred
      }).length
      tabs.push({ id: `pred_${pred}`, label: `Predikat ${pred}`, count })
    })
    return tabs
  }, [safeGrades, stats, availablePredicates])

  // Extract distinct subjects
  const subjects = useMemo(() => {
    const list = safeGrades
      .map((g) => g.subject?.name || g.subject?.nama_mapel)
      .filter(Boolean)
    return Array.from(new Set(list))
  }, [safeGrades])

  // Filtered grades list
  const filteredGrades = useMemo(() => {
    return safeGrades.filter((g) => {
      const subjectName = g.subject?.name || g.subject?.nama_mapel || ''
      const subjectCode = g.subject?.code || g.subject?.kode_mapel || ''
      const score = g.final_score != null ? parseFloat(g.final_score) : (g.score != null ? parseFloat(g.score) : null)
      const kkm = g.kkm != null ? parseFloat(g.kkm) : (g.subject?.kkm != null ? parseFloat(g.subject.kkm) : null)
      const isTuntas = g.is_passed != null ? g.is_passed : (score !== null && kkm !== null ? score >= kkm : true)
      const pred = String(g.grade_letter || g.predicate || getLetterFromScore(score)).toUpperCase().trim()

      // Tab Filter
      if (activeTab === 'tuntas' && !isTuntas) return false
      if (activeTab === 'belum_tuntas' && isTuntas) return false
      if (activeTab.startsWith('pred_')) {
        const targetPred = activeTab.replace('pred_', '')
        if (pred !== targetPred) return false
      }

      // Subject Dropdown Filter
      if (selectedSubject && subjectName !== selectedSubject) return false

      // Search Query
      if (search.trim()) {
        const q = search.toLowerCase()
        const combined = `${subjectCode} ${subjectName} ${g.notes || ''} ${pred}`.toLowerCase()
        if (!combined.includes(q)) return false
      }

      return true
    })
  }, [safeGrades, activeTab, selectedSubject, search])

  const resetFilters = () => {
    setDraftSearch('')
    setSearch('')
    setActiveTab('all')
    setSelectedSubject('')
  }

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/25 bg-white p-12 text-center shadow-md shadow-emerald-500/5 dark:border-emerald-800/40 dark:bg-slate-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
        <h3 className="mt-4 text-base font-black text-slate-800 dark:text-white">Memuat Data Nilai Siswa...</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Sinkronisasi nilai capaian belajar, tugas harian, PTS, dan evaluasi hasil belajar ananda.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* 1. HEROUI MODERN HERO HEADER CARD */}
      <header className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
        <div className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-400/15 blur-3xl dark:from-emerald-500/15" />
        <div className="relative flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3.5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-600/30 ring-4 ring-white/60 dark:ring-slate-800/80">
              <Award className="h-6 w-6" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  Nilai & Capaian Belajar Siswa
                </h2>
                {(student?.unit_name || period?.unit_name) && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-black text-emerald-800 dark:text-emerald-300">
                    <School className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                    {student?.unit_name || period?.unit_name}
                  </span>
                )}
                {(student?.kelas?.nama_kelas || student?.kelas?.name || period?.class_name) && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-teal-500/30 bg-teal-500/15 px-2.5 py-0.5 text-[11px] font-black text-teal-800 dark:text-teal-300">
                    <Layers className="h-3 w-3 text-teal-600" />
                    {student?.kelas?.nama_kelas || student?.kelas?.name || period?.class_name}
                  </span>
                )}
                {(period?.semester || period?.academic_year) && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/15 px-2.5 py-0.5 text-[10px] font-black text-blue-800 dark:text-blue-300">
                    <CalendarDays className="h-3 w-3 text-blue-600" />
                    {[period?.semester, period?.academic_year].filter(Boolean).join(' · ')}
                  </span>
                )}
                {publication?.title && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-black text-amber-800 dark:text-amber-300">
                    <Sparkles className="h-3 w-3 text-amber-600" />
                    {publication.title}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 font-medium max-w-2xl">
                Transparansi evaluasi capaian kompetensi belajar, nilai tugas harian, ujian tengah semester (PTS), ujian akhir semester (PAS), dan ketuntasan KKM siswa.
              </p>
            </div>
          </div>

          {/* Quick Metrics KPI Counters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0">
            <div className="flex items-center gap-2 rounded-xl border border-emerald-300/60 bg-white/85 px-3.5 py-1.5 shadow-xs backdrop-blur-xs dark:border-emerald-800/60 dark:bg-slate-800/85">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 font-black text-[11px] dark:bg-emerald-950 dark:text-emerald-300">
                {stats.total}
              </span>
              <span className="text-xs font-black text-slate-700 dark:text-slate-200">Total Mapel</span>
            </div>
            {stats.avg !== '-' && (
              <div className="flex items-center gap-2 rounded-xl border border-amber-300/60 bg-white/85 px-3.5 py-1.5 shadow-xs backdrop-blur-xs dark:border-amber-800/60 dark:bg-slate-800/85">
                <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  Rata-rata: <span className="text-emerald-600 dark:text-emerald-400 font-black">{stats.avg}</span>
                </span>
              </div>
            )}
            {stats.max !== '-' && (
              <div className="flex items-center gap-2 rounded-xl border border-teal-300/60 bg-white/85 px-3.5 py-1.5 shadow-xs backdrop-blur-xs dark:border-teal-800/60 dark:bg-slate-800/85">
                <TrendingUp className="h-4 w-4 text-teal-600" />
                <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                  Tertinggi: <span className="text-teal-700 dark:text-teal-300 font-black">{stats.max}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. MASTER KPI STATS GRID (4 VIBRANT CARDS) */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {/* Card 1: Rata-rata Nilai */}
        <motion.div
          whileHover={{ y: -3 }}
          className="relative overflow-hidden rounded-[20px] border-2 border-emerald-500/25 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md dark:border-emerald-700/40 dark:bg-slate-900"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/15 to-teal-500/20 text-emerald-700 dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-300 ring-1 ring-emerald-500/30">
              <Award className="h-5 w-5" />
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.avg}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">Rata-rata Nilai</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Rata-rata seluruh capaian mapel</p>
        </motion.div>

        {/* Card 2: Nilai Tertinggi */}
        <motion.div
          whileHover={{ y: -3 }}
          className="relative overflow-hidden rounded-[20px] border-2 border-blue-500/25 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md dark:border-blue-700/40 dark:bg-slate-900"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600" />
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-sky-500/20 text-blue-700 dark:from-blue-950 dark:to-sky-950 dark:text-blue-300 ring-1 ring-blue-500/30">
              <TrendingUp className="h-5 w-5" />
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.max}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">Nilai Tertinggi</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Capaian skor tertinggi ananda</p>
        </motion.div>

        {/* Card 3: Mapel Tuntas KKM */}
        <motion.div
          whileHover={{ y: -3 }}
          className="relative overflow-hidden rounded-[20px] border-2 border-teal-500/25 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md dark:border-teal-700/40 dark:bg-slate-900"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600" />
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/15 to-emerald-500/20 text-teal-700 dark:from-teal-950 dark:to-emerald-950 dark:text-teal-300 ring-1 ring-teal-500/30">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.tuntas}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">Mapel Tuntas</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Memenuhi standar KKM mapel</p>
        </motion.div>

        {/* Card 4: Perlu Penguatan / Remedial */}
        <motion.div
          whileHover={{ y: -3 }}
          className="relative overflow-hidden rounded-[20px] border-2 border-rose-500/25 bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md dark:border-rose-700/40 dark:bg-slate-900"
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600" />
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/15 to-amber-500/20 text-rose-700 dark:from-rose-950 dark:to-amber-950 dark:text-rose-300 ring-1 ring-rose-500/30">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{stats.belumTuntas}</span>
          </div>
          <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">Perlu Penguatan</p>
          <p className="mt-0.5 text-[11px] text-slate-400">Di bawah KKM perlu remedial</p>
        </motion.div>
      </div>

      {/* 3. FILTER & PENCARIAN NILAI */}
      <section className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/20 bg-white p-4 sm:p-5 shadow-sm dark:border-emerald-800/40 dark:bg-slate-900" aria-label="Filter dan Pencarian Nilai">
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* Full-width Search Bar with Debounce */}
          <label className="relative flex-1">
            <span className="sr-only">Cari mata pelajaran atau nilai</span>
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <input
              type="text"
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              placeholder="Cari nama mata pelajaran, kode mapel, atau predikat nilai..."
              className="h-11 w-full rounded-xl border-2 border-emerald-200/80 bg-slate-50/70 pl-11 pr-4 text-xs font-medium outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/15 dark:border-emerald-900/60 dark:bg-slate-800 dark:focus:bg-slate-900"
            />
          </label>

          {/* Mata Pelajaran Dropdown */}
          <CustomSelect
            aria-label="Pilih Mata Pelajaran"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="h-11 rounded-xl border-2 border-emerald-200/80 bg-slate-50/70 px-3.5 text-xs font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 dark:border-emerald-900/60 dark:bg-slate-800 dark:text-slate-200"
          >
            <option value="">Semua Mapel ({subjects.length})</option>
            {subjects.map((sub) => (
              <option key={sub} value={sub}>
                {sub}
              </option>
            ))}
          </CustomSelect>

          {/* Reset Button */}
          <Button
            variant="ghost"
            appearance="outline"
            size="sm"
            onClick={resetFilters}
            className="h-11 border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 font-bold rounded-xl dark:border-slate-700"
          >
            Reset
          </Button>
        </div>

        {/* Dynamic Status & Predikat Filter Tab Pills (100% data-driven) */}
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-emerald-100/80 pt-3.5 dark:border-slate-800">
          {filterTabs.map(({ id, label, count }) => {
            const isActive = activeTab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/40 scale-[1.02]'
                    : 'bg-slate-100/80 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-black/10 text-slate-700 dark:bg-white/10 dark:text-slate-200'
                  }`}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* 4. GRADES CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredGrades.map((item, idx) => {
          const finalScore = item.final_score ?? item.score
          const kkm = item.kkm != null ? parseFloat(item.kkm) : (item.subject?.kkm != null ? parseFloat(item.subject.kkm) : null)
          const isTuntas = item.is_passed != null ? item.is_passed : (finalScore != null && kkm != null ? finalScore >= kkm : true)
          const predLetter = item.grade_letter || item.predicate || getLetterFromScore(finalScore)
          const predTheme = getPredicateTheme(predLetter)
          const subjectColor = getSubjectColor(item.subject?.name, item.subject?.code)

          return (
            <motion.div
              key={item.id || idx}
              whileHover={{ y: -3 }}
              className={`relative flex flex-col justify-between overflow-hidden rounded-[22px] border-2 border-emerald-500/20 bg-white p-5 shadow-sm transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 dark:border-emerald-800/40 dark:bg-slate-900 ${
                isTuntas ? 'border-l-4 border-l-emerald-500' : 'border-l-4 border-l-rose-500'
              }`}
            >
              {/* Top Accent Gradient Bar */}
              <div
                className={`absolute inset-x-0 top-0 h-1.5 ${
                  isTuntas
                    ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600'
                    : 'bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600'
                }`}
              />

              <div>
                {/* Header Row: Subject Code & Ketuntasan Badge */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-0.5 text-[11px] font-bold ${subjectColor.pill}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${subjectColor.dot}`} />
                    {item.subject?.code || item.subject?.kode_mapel || '-'}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                      isTuntas
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                        : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                    }`}
                  >
                    {isTuntas ? (
                      <>
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Tuntas KKM
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3 text-rose-600" /> Perlu Penguatan
                      </>
                    )}
                  </span>
                </div>

                {/* Subject Full Name */}
                <h3 className="mt-3 text-sm sm:text-base font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">
                  {item.subject?.name || item.subject?.nama_mapel || '-'}
                </h3>

                {/* Score & Predicate Highlight Box */}
                <div className="mt-3.5 rounded-2xl border border-emerald-200/80 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-emerald-50/70 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/20">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Nilai Akhir</p>
                      <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 leading-none mt-1">
                        {finalScore ?? '-'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`inline-flex items-center gap-1 rounded-xl border px-3 py-1 text-xs font-black shadow-2xs ${predTheme.badge}`}>
                        <Star className="h-3 w-3 fill-current" />
                        {predTheme.label}
                      </span>
                      {kkm != null && (
                        <p className="mt-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                          KKM: <b className="text-slate-800 dark:text-slate-200">{kkm}</b>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Relative Score Bar vs Scale 100 */}
                  {finalScore != null && (
                    <div className="mt-3 pt-2.5 border-t border-emerald-200/60 dark:border-emerald-800/50">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                        <span>Skala 0 - 100</span>
                        <span>{finalScore} / 100</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isTuntas ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-rose-500 to-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, finalScore))}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Score Component Breakdown (Tugas, PTS, PAS) */}
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-2 dark:border-slate-800 dark:bg-slate-800/40">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Tugas</p>
                    <p className="mt-0.5 text-xs font-black text-slate-800 dark:text-slate-200">
                      {item.score_assignment ?? '-'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-2 dark:border-slate-800 dark:bg-slate-800/40">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">PTS</p>
                    <p className="mt-0.5 text-xs font-black text-slate-800 dark:text-slate-200">
                      {item.score_mid ?? '-'}
                    </p>
                  </div>
                  <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-2 dark:border-slate-800 dark:bg-slate-800/40">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">PAS</p>
                    <p className="mt-0.5 text-xs font-black text-slate-800 dark:text-slate-200">
                      {item.score_final ?? '-'}
                    </p>
                  </div>
                </div>

                {/* Teacher Comment / Feedback Snippet */}
                {item.notes && (
                  <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 dark:border-slate-800 dark:bg-slate-800/60">
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic line-clamp-2">
                      "{item.notes}"
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button at bottom */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedDetail(item)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-400/80 bg-emerald-50 px-4 py-2.5 text-xs font-black text-emerald-800 hover:bg-emerald-100 transition-all shadow-xs dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300"
                >
                  <BarChart2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Lihat Rincian & Evaluasi Nilai</span>
                </button>
              </div>
            </motion.div>
          )
        })}

        {/* Empty State when no grades found */}
        {!filteredGrades.length && (
          <div className="col-span-full py-16 text-center rounded-[22px] border-2 border-dashed border-emerald-200 bg-emerald-50/30 p-8 dark:border-slate-800 dark:bg-slate-900/40">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Award className="h-7 w-7" />
            </div>
            <h4 className="mt-3 text-sm font-black text-slate-800 dark:text-white">Tidak Ada Data Nilai</h4>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Tidak ada data nilai yang sesuai dengan filter atau kata kunci pencarian. Coba reset filter untuk melihat seluruh nilai.
            </p>
            <Button
              variant="ghost"
              appearance="outline"
              size="sm"
              onClick={resetFilters}
              className="mt-4 rounded-xl border border-emerald-300 font-bold text-emerald-700 hover:bg-emerald-50"
            >
              Reset Filter
            </Button>
          </div>
        )}
      </div>

      {/* 5. HEROUI HARMONIZED GRADE DETAIL DRILL-DOWN MODAL */}
      <AnimatePresence>
        {selectedDetail && (() => {
          const detailFinal = selectedDetail.final_score ?? selectedDetail.score
          const detailKkm = selectedDetail.kkm != null ? parseFloat(selectedDetail.kkm) : (selectedDetail.subject?.kkm != null ? parseFloat(selectedDetail.subject.kkm) : null)
          const detailIsTuntas = selectedDetail.is_passed != null ? selectedDetail.is_passed : (detailFinal != null && detailKkm != null ? detailFinal >= detailKkm : true)
          const detailPred = selectedDetail.grade_letter || selectedDetail.predicate || getLetterFromScore(detailFinal)
          const detailPredTheme = getPredicateTheme(detailPred)
          const detailSubjectColor = getSubjectColor(selectedDetail.subject?.name, selectedDetail.subject?.code)

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-md">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-xl overflow-hidden rounded-[26px] border-2 border-emerald-500/30 bg-white shadow-2xl shadow-emerald-950/20 dark:border-emerald-700/50 dark:bg-slate-900"
              >
                {/* Top Accent Gradient Bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />

                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-slate-100 p-5 dark:border-slate-800">
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-600/30">
                      <Award className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] font-bold ${detailSubjectColor.pill}`}>
                          {selectedDetail.subject?.code || selectedDetail.subject?.kode_mapel || '-'}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black border ${
                            detailIsTuntas
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800'
                              : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800'
                          }`}
                        >
                          {detailIsTuntas ? <CheckCircle2 className="h-3 w-3 text-emerald-600" /> : <AlertTriangle className="h-3 w-3 text-rose-600" />}
                          {detailIsTuntas ? 'Tuntas KKM' : 'Perlu Penguatan'}
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-black text-slate-900 dark:text-white leading-snug">
                        {selectedDetail.subject?.name || selectedDetail.subject?.nama_mapel}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {[period?.semester, period?.academic_year].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedDetail(null)}
                    aria-label="Tutup modal"
                    className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="max-h-[68vh] overflow-y-auto p-5 space-y-4">
                  {/* Highlight Final Score Banner */}
                  <div className="rounded-2xl border-2 border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-950/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Nilai Akhir Rapor</p>
                        <p className="text-4xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                          {detailFinal ?? '-'}
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <span className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-black shadow-xs ${detailPredTheme.badge}`}>
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {detailPredTheme.label}
                        </span>
                        {detailKkm != null && (
                          <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                            Batas KKM: <b className="text-slate-800 dark:text-slate-200">{detailKkm}</b>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar Gauge */}
                    {detailFinal != null && (
                      <div className="mt-3.5 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                          <span>Ketercapaian Kompetensi</span>
                          <span>{detailFinal} / 100</span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900">
                          <div
                            className={`h-full rounded-full ${
                              detailIsTuntas ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-rose-500 to-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, detailFinal))}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Assessment Component Breakdown Cards */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Rincian Komponen Penilaian:
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-center dark:border-slate-800 dark:bg-slate-800/60">
                        <span className="flex h-8 w-8 mx-auto items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 mb-1.5">
                          <FileText className="h-4 w-4" />
                        </span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Tugas Harian</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                          {selectedDetail.score_assignment ?? '-'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-center dark:border-slate-800 dark:bg-slate-800/60">
                        <span className="flex h-8 w-8 mx-auto items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 mb-1.5">
                          <BarChart2 className="h-4 w-4" />
                        </span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Ujian Tengah (PTS)</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                          {selectedDetail.score_mid ?? '-'}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5 text-center dark:border-slate-800 dark:bg-slate-800/60">
                        <span className="flex h-8 w-8 mx-auto items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 mb-1.5">
                          <Award className="h-4 w-4" />
                        </span>
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Ujian Akhir (PAS)</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                          {selectedDetail.score_final ?? '-'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Teacher Evaluation & Comments */}
                  {selectedDetail.notes && (
                    <div className="rounded-2xl border border-emerald-200/80 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/60 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                        <MessageSquare className="h-4 w-4 text-emerald-600" />
                        <span>Catatan Umpan Balik Guru Pengampu:</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 italic leading-relaxed bg-white dark:bg-slate-850 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                        "{selectedDetail.notes}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/80 px-5 py-3.5 dark:border-slate-800 dark:bg-slate-800/60">
                  <span className="text-[11px] text-slate-500">
                    Dareliman Edu{student?.unit_name || period?.unit_name ? ` · ${student?.unit_name || period?.unit_name}` : ''}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    appearance="outline"
                    size="sm"
                    onClick={() => setSelectedDetail(null)}
                    className="rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                  >
                    Tutup
                  </Button>
                </div>
              </motion.div>
            </div>
          )
        })()}
      </AnimatePresence>
    </div>
  )
}
