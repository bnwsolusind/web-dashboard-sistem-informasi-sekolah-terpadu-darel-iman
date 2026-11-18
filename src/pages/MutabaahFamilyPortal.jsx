import { useEffect, useState, useMemo, useRef } from 'react'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BookHeart, Building2, Check, CheckCircle2, ChevronDown, ChevronLeft, ChevronRight, Clock3,
  Download, Edit3, History, MessageSquareText, Printer, RotateCcw, Search,
  Signature, UserRound, Users, X, XCircle,
  Sparkles,
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
import { mutabaahService } from '../services/mutabaahService'
import MutabaahSubNav from '../components/mutabaah/MutabaahSubNav'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import PageContainer from '../components/app/PageContainer'
import AppSkeleton from '../components/app/AppSkeleton'
import AppEmptyState from '../components/app/AppEmptyState'
import AppErrorState from '../components/app/AppErrorState'
import {
  MasterActionButton,
  MasterActionIconButton,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'
import { useAuthStore } from '../stores/authStore'
import { hasRoleLevel, ROLE_LEVELS } from '../auth/portalResolver'
import { downloadPdfTable, printCleanTable } from '../utils/printHelper'
import { DatePicker } from '@/components/ui/date-picker'
import './MutabaahFamilyPortal.css'

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
}

export const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
}

const today = () => new Date().toLocaleDateString('en-CA')
const statusMeta = {
  good: { label: 'Baik', bg: 'bg-emerald-100 dark:bg-emerald-950/60', text: 'text-emerald-700 dark:text-emerald-300', icon: CheckCircle2 },
  less: { label: 'Kurang', bg: 'bg-amber-100 dark:bg-amber-950/60', text: 'text-amber-700 dark:text-amber-300', icon: Clock3 },
  not_done: { label: 'Belum', bg: 'bg-rose-100 dark:bg-rose-950/60', text: 'text-rose-700 dark:text-rose-300', icon: XCircle },
  na: { label: 'N/A', bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-500 dark:text-slate-400', icon: Clock3 },
}

// ── MODERN CARD TONES (§C Tailgrids_Pengaturan_Halaman) ──
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
  blue: {
    card: 'border-blue-300/70 bg-gradient-to-br from-blue-50 via-cyan-50/60 to-white hover:border-blue-400 dark:border-blue-700/50 dark:from-blue-950/40 dark:via-cyan-950/20 dark:to-slate-900',
    glow: 'bg-blue-400/20 group-hover:bg-blue-400/30',
    iconBox: 'bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-sm shadow-blue-500/30',
    tag: 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300',
    title: 'text-blue-700 dark:text-blue-400',
    val: 'text-blue-700 dark:text-blue-300',
    sub: 'text-blue-600/80 dark:text-blue-400/80',
    cta: 'text-blue-600/60 dark:text-blue-500/60',
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

function ModernKpiCard({ icon: Icon, label, value, subtext, tag, tone = 'emerald' }) {
  const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`group relative overflow-hidden rounded-[18px] border-2 p-5 shadow-xs transition-[border-color,box-shadow] duration-150 text-left cursor-default hover:shadow-md ${t.card}`}
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
      <p className={`text-4xl font-black tabular-nums truncate ${t.val}`} title={String(value ?? 0)}>{value ?? 0}</p>
      {subtext && <p className={`mt-0.5 text-[11px] font-semibold truncate ${t.sub}`} title={subtext}>{subtext}</p>}
    </motion.div>
  )
}

// ── HEROUI FILTER BAR SELECT DROPDOWN COMPONENT ──
function HeroUiFilterSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Pilih...',
  icon: IconComponent = null,
  className = '',
  popoverWidth = 'min-w-[200px]',
  searchable = false,
  ariaLabel = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false)
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

  const hasValue = value !== '' && value !== undefined && value !== null

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev)
            setSearch('')
          }
        }}
        className={`h-9 sm:h-10 w-full flex items-center justify-between gap-2 rounded-xl border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${isOpen
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
            {selectedOption ? (
              <>
                <span>{selectedOption.label}</span>
                {selectedOption.subtext && (
                  <span className="ml-1.5 opacity-75 font-normal text-[11px]">
                    ({selectedOption.subtext})
                  </span>
                )}
              </>
            ) : (
              placeholder
            )}
          </span>
        </div>
        <ChevronDown
          className={`size-3.5 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
            }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -4 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={`absolute left-0 top-full mt-1.5 z-[90] ${popoverWidth} overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-1.5 shadow-xl shadow-slate-900/10 dark:shadow-black/40`}
          >
            {searchable && options.length > 5 && (
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

            <div className="max-h-56 overflow-y-auto space-y-0.5">
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
                      className={`w-full flex items-center justify-between rounded-xl px-2.5 py-1.5 text-xs font-semibold transition-colors text-left cursor-pointer ${isSelected
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700/60'
                        }`}
                    >
                      <div className="truncate pr-2">
                        <div className="truncate font-semibold">{opt.label}</div>
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

export default function MutabaahFamilyPortal({ mode }) {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []
  const isStaff = hasRoleLevel(user, ROLE_LEVELS.MUSYRIF) // Level 1 s/d 7 (Staf Internal Sekolah)

  const [date, setDate] = useState(today)
  const [studentId, setStudentId] = useState('')
  const [unitId, setUnitId] = useState('')
  const [classId, setClassId] = useState('')
  const [search, setSearch] = useState('')
  const [signatureOpen, setSignatureOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [printModalOpen, setPrintModalOpen] = useState(false)

  // Master options (units, classes) for staff filtering
  const optionsQuery = useQuery({
    queryKey: ['mutabaah-portal-options'],
    queryFn: () => mutabaahService.options(),
    enabled: isStaff,
  })

  // Children query
  const children = useQuery({
    queryKey: ['parent-mutabaah-children', unitId, classId, search],
    queryFn: () => mutabaahService.parentChildren({ unit_id: unitId, class_id: classId, search }),
    enabled: mode === 'parent' || isStaff,
  })

  const unitOptions = useMemo(() => {
    const list = (optionsQuery.data?.units || []).map((u) => ({
      value: String(u.id),
      label: u.name,
    }))
    return [{ value: '', label: 'Semua Unit' }, ...list]
  }, [optionsQuery.data?.units])

  const santriOptions = useMemo(() => {
    return (children.data || []).map((child) => ({
      value: String(child.id),
      label: child.name,
      subtext: `Kelas ${child.class_name || '-'} (${child.unit || '-'})`,
    }))
  }, [children.data])

  useEffect(() => {
    if (!studentId && children.data?.[0]?.id) setStudentId(children.data[0].id)
  }, [children.data, studentId])

  const enabled = mode === 'student' || Boolean(studentId)
  const overview = useQuery({
    queryKey: ['family-mutabaah', mode, studentId, date],
    queryFn: () => (mode === 'parent' || isStaff ? mutabaahService.parentMutabaah(studentId, { date }) : mutabaahService.studentMutabaah({ date })),
    enabled,
    placeholderData: keepPreviousData,
  })

  const history = useQuery({
    queryKey: ['family-mutabaah-history', mode, studentId],
    queryFn: () => (mode === 'parent' || isStaff ? mutabaahService.parentHistory(studentId) : mutabaahService.studentMutabaahHistory()),
    enabled,
  })

  const data = overview.data

  const changeDay = (offset) => {
    const current = new Date(`${date}T12:00:00`)
    current.setDate(current.getDate() + offset)
    setDate(current.toLocaleDateString('en-CA'))
  }

  const sign = useMutation({
    mutationFn: ({ id, payload }) => mutabaahService.parentSignature(id, payload),
    onSuccess: (result) => {
      setSignatureOpen(false)
      queryClient.invalidateQueries({ queryKey: ['family-mutabaah'] })
      Swal.fire({ icon: 'success', title: 'Paraf tersimpan', text: result.message, timer: 1500, showConfirmButton: false })
    },
    onError: showError,
  })

  const updateNote = useMutation({
    mutationFn: ({ notes }) => mutabaahService.finalizeStudent({ student_id: studentId, supervisor_notes: notes }),
    onSuccess: (result) => {
      setNoteOpen(false)
      queryClient.invalidateQueries({ queryKey: ['family-mutabaah'] })
      Swal.fire({ icon: 'success', title: 'Catatan tersimpan', text: result?.message || 'Catatan pembimbing berhasil diperbarui.', timer: 1500, showConfirmButton: false })
    },
    onError: showError,
  })

  const handlePrint = (type) => {
    setPrintModalOpen(false)
    const activeStudent = children.data?.find((c) => String(c.id) === String(studentId)) || data?.student
    const studentName = activeStudent?.name || 'Santri'

    const columns = [
      { key: 'category', label: 'Kategori' },
      { key: 'name', label: 'Nama Agenda' },
      { key: 'status_label', label: 'Status' },
      { key: 'notes', label: 'Catatan' },
    ]

    const rows = (data?.today?.details || []).map((item) => ({
      category: item.category || '-',
      name: item.name || '-',
      status_label: statusMeta[item.status_value]?.label || 'Belum',
      notes: item.notes || '-',
    }))

    const payload = {
      title: `Laporan Mutaba'ah - ${studentName}`,
      subtitle: `Tanggal: ${new Date(`${date}T12:00:00`).toLocaleDateString('id-ID', { dateStyle: 'full' })}`,
      headers: columns.map((c) => c.label),
      rows: rows.map((r) => columns.map((c) => String(r[c.key] || '-'))),
    }

    if (type === 'clean') {
      printCleanTable(payload)
    } else {
      downloadPdfTable({ ...payload, filename: `Mutabaah_${studentName}_${date}.pdf` })
    }
  }

  return (
    <PageContainer className="space-y-6 pb-12">
      {/* BREADCRUMB NAV (§W) */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="print:hidden">
        <AppBreadcrumb
          items={[
            { label: 'Dashboard', href: '/dashboard' },
            { label: 'Mutaba’ah Yaumiyyah', href: '/dashboard/mutabaah' },
            { label: 'Monitoring Orang Tua' },
          ]}
        />
      </motion.div>

      {/* MODERN HERO CARD HEADER (§B / §7.7 Vivid Emerald Responsive Hero) */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="print:hidden">
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
                    {isStaff ? 'Supervisi Sekolah' : 'Portal Orang Tua'}
                  </span>
                  <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
                    Mutaba’ah Keluarga
                  </span>
                </div>
                <h1 className="mt-1.5 text-lg sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  Monitoring Mutaba’ah Yaumiyyah
                </h1>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 w-full leading-relaxed">
                  {isStaff
                    ? 'Pantau pembiasaan ibadah harian seluruh santri, cek status paraf orang tua, dan beri catatan supervisi pembimbing.'
                    : 'Pantau pembiasaan ibadah harian santri, rekap mingguan/bulanan, dan berikan paraf persetujuan.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-100 via-emerald-50 to-teal-100 px-3 py-1.5 sm:px-3.5 sm:py-2 text-[11px] sm:text-xs font-black text-emerald-900 dark:border-emerald-700 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Users className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="tabular-nums">{children.data?.length || (data?.student ? 1 : 0)} Santri Terhubung</span>
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 📊 KPI CARDS GRID (§C + §7.3) */}
      <motion.div variants={itemVariants} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ModernKpiCard
          icon={Users}
          label="Total Santri Terhubung"
          value={children.data?.length || (data?.student ? 1 : 0)}
          subtext={isStaff ? 'Santri terpilih / binaan' : 'Anak terdaftar di portal'}
          tag="Terhubung"
          tone="blue"
        />
        <ModernKpiCard
          icon={CheckCircle2}
          label="Pencapaian Hari Ini"
          value={`${Math.round(data?.today?.score || 0)}%`}
          subtext="Capaian amalan ibadah harian"
          tag="Harian"
          tone="emerald"
        />
        <ModernKpiCard
          icon={Signature}
          label="Status Paraf Ortu"
          value={data?.today?.signature ? 'Sudah Diparaf' : 'Menunggu Paraf'}
          subtext={data?.today?.signature ? `Jenis: ${data.today.signature.signature_status}` : 'Belum dikonfirmasi ortu'}
          tag="Paraf"
          tone={data?.today?.signature ? 'emerald' : 'amber'}
        />
        <ModernKpiCard
          icon={History}
          label="Riwayat Mutabaah"
          value={history.data?.rows?.data?.length || 0}
          subtext="Hari difinalisasi tersimpan"
          tag="Riwayat"
          tone="blue"
        />
      </motion.div>

      {/* 🧭 SUB NAV */}
      <MutabaahSubNav />

      {/* 🟢 MAIN WORKSPACE CARD (ANIMATED CONTAINER §K) */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433] space-y-5"
      >
        <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
        {/* BARIS 1: TITLE & ACTION BUTTONS (§H.5) */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3.5 sm:px-6 md:px-8 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-b border-emerald-200/90 dark:border-emerald-800/60">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shrink-0 shadow-sm border border-emerald-300/40">
              <BookHeart className="size-5" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                {isStaff ? 'Supervisi & Monitoring Sekolah' : 'Portal Monitoring Orang Tua'}
              </span>
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-0.5">Monitoring Mutaba’ah Yaumiyyah</h1>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-0.5">
                {isStaff
                  ? 'Pantau pembiasaan ibadah harian seluruh santri, cek status paraf orang tua, dan beri catatan supervisi pembimbing.'
                  : 'Pantau pembiasaan ibadah harian santri, rekap mingguan/bulanan, dan berikan paraf persetujuan.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
            {/* PRINT BUTTON */}
            <SquircleActionButton variant="view" icon={Printer} label="Cetak Data" onClick={() => setPrintModalOpen(true)} />

            {/* EXPORT BUTTON */}
            <SquircleActionButton variant="export" icon={Download} label="Export PDF" onClick={() => handlePrint('pdf')} />

            {/* MUSYRIF / STAFF NOTE ACTION BUTTON */}
            {isStaff && data?.today && (
              <SquircleActionButton variant="edit" icon={Edit3} label="Edit Catatan Pembimbing" onClick={() => setNoteOpen(true)} />
            )}

            {/* PARAF ACTION BUTTON */}
            {mode === 'parent' && data?.today && (
              <SquircleActionButton variant="primary" icon={Signature} label="Beri Paraf Ortu" onClick={() => setSignatureOpen(true)} />
            )}
          </div>
        </motion.div>

        {/* BARIS 2: CONTROLS & FILTERS (§7.9 flex-wrap + field §J.3) */}
        <motion.div variants={itemVariants} className="px-4 py-3 sm:px-6 md:px-8 border-b border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433]">
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
              Filter:
            </span>
            {/* UNIT FILTER */}
            {isStaff && optionsQuery.data?.units?.length > 0 && (
              <div className="w-full sm:w-auto min-w-[160px]">
                <label className="sr-only">Unit pendidikan</label>
                <HeroUiFilterSelect
                  value={unitId}
                  onChange={(val) => setUnitId(val)}
                  options={unitOptions}
                  placeholder="Semua Unit"
                  icon={Building2}
                  ariaLabel="Unit pendidikan"
                  popoverWidth="min-w-[200px]"
                />
              </div>
            )}

            {/* INPUT PENCARIAN NAMA SANTRI / NIS */}
            {isStaff && (
              <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[160px]">
                <label htmlFor="portal-search" className="sr-only">Cari santri</label>
                <div className="relative flex items-center">
                  <div className="pointer-events-none absolute left-3.5 flex items-center text-slate-400 dark:text-slate-500">
                    <Search className="size-4" />
                  </div>
                  <input
                    id="portal-search"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Cari Nama Santri / NIS..."
                    className="w-full h-9 sm:h-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-slate-100 dark:hover:border-slate-600"
                  />
                </div>
              </div>
            )}

            {/* SANTRI SELECT DROPDOWN */}
            <div className="w-full sm:w-auto sm:flex-1 sm:min-w-[220px]">
              <label className="sr-only">Pilih santri</label>
              <HeroUiFilterSelect
                value={studentId}
                onChange={(val) => setStudentId(val)}
                options={santriOptions}
                placeholder={
                  !children.data?.length
                    ? children.isLoading
                      ? 'Memuat data santri...'
                      : '-- Tidak Ada Data Santri --'
                    : '-- Pilih Santri --'
                }
                icon={UserRound}
                ariaLabel="Pilih santri"
                popoverWidth="min-w-[280px] sm:w-96"
                searchable
                disabled={children.isLoading || !children.data?.length}
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => changeDay(-1)}
                aria-label="Hari sebelumnya"
                className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="size-5 shrink-0" />
              </button>
              <label htmlFor="portal-date" className="sr-only">Tanggal</label>
              <DatePicker
                id="portal-date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-40"
                inputClassName="py-2 text-xs font-semibold"
              />
              <button
                type="button"
                onClick={() => changeDay(1)}
                aria-label="Hari berikutnya"
                className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
              >
                <ChevronRight className="size-5 shrink-0" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setDate(today())
                setUnitId('')
                setClassId('')
                setSearch('')
              }}
              className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-1.5 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <RotateCcw className="size-3.5" /> Reset
            </button>
          </div>
        </motion.div>

        {/* LOADING & ERROR STATES (§U.1) */}
        {(overview.isLoading || children.isLoading) && <AppSkeleton variant="card" className="h-40" />}
        {overview.isError && <AppErrorState title="Data mutabaah gagal dimuat" description="Silakan periksa koneksi dan coba kembali." onRetry={() => overview.refetch()} compact />}

        {/* CONTENT WITH STAGGERED ITEM VARIANTS */}
        {!overview.isLoading && data && (
          <motion.div variants={containerVariants} className="space-y-5">
            {/* STUDENT SUMMARY HEADER CARD */}
            <motion.div variants={itemVariants}>
              <StudentSummary data={data} />
            </motion.div>

            {/* REKAP MINGGUAN & BULANAN GRID */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ProgressCard title="Rekap Mingguan" data={data.weekly} />
              <ProgressCard title="Rekap Bulanan" data={data.monthly} />
            </motion.div>

            {/* AGENDA HARI INI */}
            {data.today ? (
              <>
                <motion.div variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-700/80 dark:bg-[#1B2433]">
                  <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/10 blur-2xl dark:bg-emerald-400/15" />
                  <div className="flex items-center justify-between mb-4 pb-3.5 border-b border-emerald-200/90 dark:border-emerald-800/60">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm border border-emerald-300/40">
                        <BookHeart className="size-5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Agenda Mutabaah Hari Ini</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(`${data.date}T12:00:00`).toLocaleDateString('id-ID', { dateStyle: 'full' })}
                        </p>
                      </div>
                    </div>
                    <ProgressRing value={Number(data.today.score || 0)} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {data.today.details.map((item) => {
                      const meta = statusMeta[item.status_value] || statusMeta.na
                      const StatusIcon = meta.icon
                      return (
                        <motion.div
                          key={item.id}
                          whileHover={{ y: -2, scale: 1.02 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                          className="flex items-start gap-3 p-3 rounded-xl border border-emerald-100 bg-slate-50/70 hover:border-emerald-300 dark:border-emerald-900/40 dark:bg-slate-900/40"
                        >
                          <div className={`p-2 rounded-xl shrink-0 ${meta.bg} ${meta.text}`}>
                            <StatusIcon className="size-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">{item.category}</span>
                            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{item.name}</h4>
                            {item.notes && <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{item.notes}</p>}
                          </div>
                          <span className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.bg} ${meta.text}`}>
                            {meta.label}
                          </span>
                        </motion.div>
                      )
                    })}
                  </div>
                </motion.div>

                {/* CATATAN MUSYRIF / SUPERVISI */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5 dark:border-amber-900/50 dark:bg-amber-950/20 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white shadow-sm shrink-0">
                      <MessageSquareText className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 dark:text-white">Catatan Pembimbing / Musyrif / Kepala Sekolah</h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        {data.today.notes || 'Belum ada catatan pembimbing untuk hari ini.'}
                      </p>
                    </div>
                  </div>
                  {isStaff && (
                    <MasterActionIconButton variant="edit" label="Edit Catatan" onClick={() => setNoteOpen(true)} />
                  )}
                </motion.div>

                {/* PARAF ORANG TUA (STATUS & CONFIRMATION) */}
                <motion.div variants={itemVariants} className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/50 dark:bg-emerald-950/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 shrink-0">
                      <Signature className="size-6" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Paraf Persetujuan Orang Tua</h4>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300/80 mt-0.5">
                        {data.today.signature
                          ? `Diparaf pada ${new Date(data.today.signature.signed_at).toLocaleString('id-ID')} · Status: ${data.today.signature.signature_status}`
                          : 'Menunggu konfirmasi dan paraf dari Orang Tua'}
                      </p>
                      {data.today.signature?.comment && (
                        <p className="text-xs text-emerald-800 dark:text-emerald-200 font-medium italic mt-1">
                          Pesan Ortu: "{data.today.signature.comment}"
                        </p>
                      )}
                    </div>
                  </div>

                  {mode === 'parent' && (
                    <MasterActionButton variant="primary" icon={Signature} onClick={() => setSignatureOpen(true)}>
                      {data.today.signature ? 'Perbarui Paraf' : 'Beri Paraf Persetujuan'}
                    </MasterActionButton>
                  )}
                </motion.div>
              </>
            ) : (
              <AppEmptyState
                title="Belum ada hasil hari ini"
                description="Hasil mutabaah akan tampil setelah pembimbing/musyrif mencatat amalan santri."
              />
            )}

            {/* RIWAYAT HARIAN TIMELINE */}
            <motion.div variants={itemVariants}>
              <HistoryTimeline rows={history.data?.rows?.data || []} />
            </motion.div>
          </motion.div>
        )}

        {/* MODAL PARAF ORANG TUA (WITH ANIMATE PRESENCE SPRING POPUP) */}
        <AnimatePresence>
          {signatureOpen && data?.today && (
            <SignatureSheet
              close={() => setSignatureOpen(false)}
              submit={(payload) => sign.mutate({ id: data.today.id, payload })}
              saving={sign.isPending}
            />
          )}
        </AnimatePresence>

        {/* MODAL CATATAN PEMBIMBING (WITH ANIMATE PRESENCE SPRING POPUP) */}
        <AnimatePresence>
          {noteOpen && data?.today && (
            <NoteSheet
              close={() => setNoteOpen(false)}
              initialNote={data.today.notes || ''}
              submit={(notes) => updateNote.mutate({ notes })}
              saving={updateNote.isPending}
            />
          )}
        </AnimatePresence>

        {/* MODAL CETAK DATA (§Q — prop onPrint/onDownload, bukan onPrintClean) */}
        {printModalOpen && (
          <PrintOptionModal
            isOpen={printModalOpen}
            onClose={() => setPrintModalOpen(false)}
            onPrint={() => handlePrint('clean')}
            onDownload={() => handlePrint('pdf')}
            title="Laporan Mutaba'ah Santri"
            subtitle={`Tanggal: ${new Date(`${date}T12:00:00`).toLocaleDateString('id-ID', { dateStyle: 'full' })}`}
          />
        )}
      </motion.section>
    </PageContainer>
  )
}

function StudentSummary({ data }) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="rounded-2xl border border-emerald-200/80 bg-white p-5 shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433] flex items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3.5">
        {data.student.photo ? (
          <img src={data.student.photo} alt={data.student.name} className="h-12 w-12 rounded-2xl object-cover border border-slate-200" />
        ) : (
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 font-bold text-sm dark:bg-emerald-950 dark:text-emerald-300">
            {data.student.name?.slice(0, 2)?.toUpperCase() || <UserRound className="size-6" />}
          </div>
        )}
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Profil Santri</span>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">{data.student.name}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            NIS: {data.student.nis} · Kelas: {data.student.class_name || '-'} · Unit: {data.student.unit || '-'}
          </p>
        </div>
      </div>

      <div className="shrink-0">
        <ProgressRing value={Number(data.today?.score || 0)} />
      </div>
    </motion.div>
  )
}

function ProgressCard({ title, data }) {
  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className="rounded-2xl border border-emerald-200/80 bg-white p-5 shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433]"
    >
      <div className="flex items-center justify-between border-b border-emerald-200/80 pb-3 dark:border-emerald-800/60 mb-3">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</h4>
        <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{data.score}%</span>
      </div>
      <p className="text-[11px] text-slate-400 mb-3">{data.days} hari tercatat dalam periode</p>
      <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          <span>Baik</span>
          <p className="text-xs font-black mt-0.5">{data.good}</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-2 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
          <span>Kurang</span>
          <p className="text-xs font-black mt-0.5">{data.less}</p>
        </div>
        <div className="rounded-xl bg-rose-50 p-2 text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          <span>Belum</span>
          <p className="text-xs font-black mt-0.5">{data.not_done}</p>
        </div>
        <div className="rounded-xl bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          <span>N/A</span>
          <p className="text-xs font-black mt-0.5">{data.na}</p>
        </div>
      </div>
    </motion.div>
  )
}

function ProgressRing({ value }) {
  const rounded = Math.round(value)
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl bg-emerald-50 px-3.5 py-2 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-900/50">
      <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{rounded}%</span>
      <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">Skor Total</span>
    </div>
  )
}

function HistoryTimeline({ rows }) {
  return (
    <div className="rounded-2xl border border-emerald-200/80 bg-white p-5 shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433]">
      <div className="flex items-center gap-2.5 border-b border-emerald-200/80 pb-3 dark:border-emerald-800/60 mb-4">
        <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-sm shrink-0">
          <History className="size-4" />
        </div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Riwayat Mutabaah Harian</h3>
      </div>
      <div className="space-y-2.5">
        {rows.map((row) => (
          <motion.div
            key={row.id}
            whileHover={{ x: 3 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="flex items-center justify-between p-3 rounded-xl border border-emerald-100 bg-slate-50/70 hover:border-emerald-300 dark:border-emerald-900/40 dark:bg-slate-900/40 text-xs"
          >
            <div className="flex items-center gap-3">
              <span className={`size-2.5 rounded-full ${row.parent_signed ? 'bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950' : 'bg-slate-300 dark:bg-slate-600'}`} />
              <div>
                <b className="block font-bold text-slate-800 dark:text-slate-200">
                  {new Date(row.activity_date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                </b>
                <p className="text-[10px] text-slate-400">
                  Baik {row.good_count} · Kurang {row.less_count} · Belum {row.not_done_count} · N/A {row.na_count}
                </p>
                {row.supervisor_notes && (
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 italic">"{row.supervisor_notes}"</p>
                )}
              </div>
            </div>
            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{row.score || 0}%</span>
          </motion.div>
        ))}
        {!rows.length && <AppEmptyState title="Belum ada riwayat" description="Belum ada riwayat mutabaah yang difinalisasi." />}
      </div>
    </div>
  )
}

function SignatureSheet({ close, submit, saving }) {
  const [status, setStatus] = useState('approved')
  const [comment, setComment] = useState('')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Fade Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onMouseDown={close}
      />

      {/* Modal with Spring Physics Pop-up (§R) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60 overflow-hidden"
      >
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                <Signature className="h-5 w-5 text-white" strokeWidth={2.25} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#0E5C44] dark:text-emerald-400 uppercase tracking-wider">Konfirmasi Orang Tua</span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Paraf Mutaba’ah Yaumiyyah</h3>
              </div>
            </div>
            <button type="button" onClick={close} aria-label="Tutup modal" className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0">
              <X className="size-4 text-white" strokeWidth={2.25} />
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); submit({ signature_status: status, comment: comment || null, device_info: { platform: navigator.platform, app: 'Dareliman Edu Web' } }) }} className="space-y-4">
            <div className="space-y-2">
              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${status === 'approved' ? 'border-[#0E5C44] bg-emerald-50/50 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-700'}`}>
                <input type="radio" value="approved" checked={status === 'approved'} onChange={(e) => setStatus(e.target.value)} className="mt-0.5 text-emerald-600 focus:ring-emerald-500" />
                <div>
                  <b className="block text-xs text-slate-900 dark:text-white">Setujui & Beri Paraf</b>
                  <small className="text-[10px] text-slate-400">Saya telah memeriksa hasil mutabaah harian anak.</small>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${status === 'clarification_requested' ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30' : 'border-slate-200 dark:border-slate-700'}`}>
                <input type="radio" value="clarification_requested" checked={status === 'clarification_requested'} onChange={(e) => setStatus(e.target.value)} className="mt-0.5 text-amber-600 focus:ring-amber-500" />
                <div>
                  <b className="block text-xs text-slate-900 dark:text-white">Minta Klarifikasi</b>
                  <small className="text-[10px] text-slate-400">Memerlukan penjelaskan lebih lanjut dari pembimbing.</small>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${status === 'unable_to_verify' ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30' : 'border-slate-200 dark:border-slate-700'}`}>
                <input type="radio" value="unable_to_verify" checked={status === 'unable_to_verify'} onChange={(e) => setStatus(e.target.value)} className="mt-0.5 text-rose-600 focus:ring-rose-500" />
                <div>
                  <b className="block text-xs text-slate-900 dark:text-white">Tidak Dapat Memverifikasi</b>
                  <small className="text-[10px] text-slate-400">Data belum dapat saya pastikan kebenarannya.</small>
                </div>
              </label>
            </div>

            <div>
              <label htmlFor="paraf-note" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Catatan Tambahan (Opsional)</label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3.5 top-3 flex items-center text-slate-400 dark:text-slate-500">
                  <MessageSquareText className="size-4" />
                </div>
                <textarea
                  id="paraf-note"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="Tuliskan pesan untuk pembimbing..."
                  className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 resize-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={close}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                  <X className="size-3.5 text-white" strokeWidth={2.2} />
                </div>
                <span>Batal</span>
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-md shadow-emerald-500/20"
              >
                {saving ? (
                  <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                    <Signature className="size-3.5 text-white" strokeWidth={2.2} />
                  </div>
                )}
                <span>{saving ? 'Menyimpan...' : 'Konfirmasi Paraf'}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

function NoteSheet({ close, initialNote, submit, saving }) {
  const [note, setNote] = useState(initialNote)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with Fade Animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        onMouseDown={close}
      />

      {/* Modal with Spring Physics Pop-up (§R) */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-emerald-950/20 dark:border-slate-800 dark:bg-[#182232] dark:shadow-black/60 overflow-hidden"
      >
        <div className="h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />
        <div className="p-5 sm:p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/20 border border-emerald-300/30">
                <MessageSquareText className="h-5 w-5 text-white" strokeWidth={2.25} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[#0E5C44] dark:text-emerald-400 uppercase tracking-wider">Supervisi Sekolah</span>
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">Edit Catatan Pembimbing / Musyrif</h3>
              </div>
            </div>
            <button type="button" onClick={close} aria-label="Tutup modal" className="size-9 flex items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-md shadow-rose-500/20 cursor-pointer shrink-0">
              <X className="size-4 text-white" strokeWidth={2.25} />
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); submit(note) }} className="space-y-4">
            <div>
              <label htmlFor="note-text" className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">Pesan / Evaluasi Musyrif untuk Santri & Orang Tua</label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3.5 top-3 flex items-center text-slate-400 dark:text-slate-500">
                  <MessageSquareText className="size-4" />
                </div>
                <textarea
                  id="note-text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={1000}
                  rows={4}
                  placeholder="Tuliskan evaluasi amalan ibadah santri hari ini..."
                  className="w-full rounded-xl border border-slate-200/90 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 hover:border-slate-300 focus:border-[#0E5C44] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#0E5C44]/12 dark:border-slate-700/80 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-slate-600 dark:focus:border-[#3FBF75] dark:focus:bg-slate-900 dark:focus:ring-[#3FBF75]/20 resize-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-slate-100 pt-4 dark:border-slate-800">
              <button
                type="button"
                onClick={close}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white px-4 py-2.5 text-xs font-extrabold border border-rose-300/40 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer"
              >
                <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                  <X className="size-3.5 text-white" strokeWidth={2.2} />
                </div>
                <span>Batal</span>
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white px-5 py-2.5 text-xs font-extrabold border border-emerald-300/40 hover:scale-[1.03] transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-md shadow-emerald-500/20"
              >
                {saving ? (
                  <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <div className="flex size-5 items-center justify-center rounded-lg bg-white/20 text-white">
                    <CheckCircle2 className="size-3.5 text-white" strokeWidth={2.2} />
                  </div>
                )}
                <span>{saving ? 'Menyimpan...' : 'Simpan Catatan'}</span>
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

function showError(error) {
  Swal.fire({ icon: 'error', title: 'Tidak dapat menyimpan', text: error?.response?.data?.message || 'Terjadi kesalahan.', confirmButtonColor: '#0E5C44' })
}
