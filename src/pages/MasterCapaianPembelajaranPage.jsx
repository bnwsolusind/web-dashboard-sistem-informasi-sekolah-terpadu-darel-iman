import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import {
  KpiStatCard
} from '../components/app'
import CustomSelect from "../components/ui/CustomSelect"
import {
  useState,
  useEffect,
  useMemo,
  useCallback
} from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  BookOpen,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FileText,
  Upload,
  Plus,
  Search,
  Trash2
} from 'lucide-react'
import CsvImportModal from '../components/master-data/CsvImportModal'
import ActionDropdown from '../components/app/ActionDropdown'
import Swal from '@/components/ui/compat/swal-heroui'
import {
  capaianPembelajaranService
} from '../services/capaianPembelajaranService'
import {
  educationUnitService
} from '../services/educationUnitService'
import {
  tahunAjaranService
} from '../services/tahunAjaranService'
import {
  masterKurikulumService
} from '../services/masterKurikulumService'
import {
  subjectService
} from '../services/subjectService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  useAuthStore
} from '../stores/authStore'
import {
  Printer
} from 'lucide-react'
import {
  printCleanTable,
  downloadPdfTable
} from '../utils/printHelper'
import {
  MasterDataPage,
  MasterActionButton,
  MasterPageHeader,
  MasterStatsGrid,
  MasterStatCard,
  MasterFilterBar,
  MasterSearchInput,
  MasterFilterSelect,
  MasterStatusBadge,
  SquircleActionButton,
  PrintOptionModal
} from '../components/master-data'
import AppDataTable from '../components/app/AppDataTable'
import MobileDataCard from '../components/app/MobileDataCard'

const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 staggerChildren: 0.05,
 delayChildren: 0.02,
 },
 },
}

const itemVariants = {
 hidden: { opacity: 0, y: 12 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.35, ease: 'easeOut' },
 },
}

export const getUnitJenjang = (unit) => {
 if (!unit) return ''
 const level = String(unit.level || '').toUpperCase()
 const name = String(unit.name || '').toUpperCase()
 const code = String(unit.code || '').toUpperCase()
 const combined = `${level} ${name} ${code}`

 if (/TK|PAUD|TAUD|PLAYHOUSE|KB/i.test(combined)) return 'TK'
 if (/SD|MIT|MI |IBTIDAIYAH/i.test(combined)) return 'SD'
 if (/SMP|PONPES|PESANTREN|MTS|TSANAWIYAH/i.test(combined)) return 'SMP'
 if (/SMA|MAHAD|MA |ALIYAH|SMK/i.test(combined)) return 'SMA'
 return ''
}

export const FASE_OPTIONS_BY_JENJANG = {
 TK: [
 { value: 'Fase Fondasi', label: 'Fase Fondasi (PAUD / TK)' },
 ],
 SD: [
 { value: 'Fase A', label: 'Fase A (Kelas 1 - 2)' },
 { value: 'Fase B', label: 'Fase B (Kelas 3 - 4)' },
 { value: 'Fase C', label: 'Fase C (Kelas 5 - 6)' },
 ],
 SMP: [
 { value: 'Fase D', label: 'Fase D (Kelas 7 - 9)' },
 ],
 SMA: [
 { value: 'Fase E', label: 'Fase E (Kelas 10)' },
 { value: 'Fase F', label: 'Fase F (Kelas 11 - 12)' },
 ],
}

export const ALL_FASE_OPTIONS = [
 { value: 'Fase Fondasi', label: 'Fase Fondasi (PAUD / TK)' },
 { value: 'Fase A', label: 'Fase A (Kelas 1 - 2)' },
 { value: 'Fase B', label: 'Fase B (Kelas 3 - 4)' },
 { value: 'Fase C', label: 'Fase C (Kelas 5 - 6)' },
 { value: 'Fase D', label: 'Fase D (Kelas 7 - 9)' },
 { value: 'Fase E', label: 'Fase E (Kelas 10)' },
 { value: 'Fase F', label: 'Fase F (Kelas 11 - 12)' },
]

export const getDefaultFaseForJenjang = (jenjang) => {
 if (jenjang === 'TK') return { fase: 'Fase Fondasi', kelas_target: 'TK A' }
 if (jenjang === 'SD') return { fase: 'Fase A', kelas_target: 'Kelas 1' }
 if (jenjang === 'SMP') return { fase: 'Fase D', kelas_target: 'Kelas 7' }
 if (jenjang === 'SMA') return { fase: 'Fase E', kelas_target: 'Kelas 10' }
 return { fase: 'Fase A', kelas_target: 'Kelas 1' }
}

const MODERN_CARD_TONES = {
  emerald: {
    card: 'rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-b from-[#E6F8F3] via-[#E6F8F3]/30 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-emerald-400',
    glow: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
    iconBox: '!bg-emerald-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-emerald-600 !text-white shadow-xs rounded-full',
    tag: 'bg-[#D1FAE5] text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#D1FAE5] text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-emerald-800 dark:text-emerald-300',
    title: 'text-emerald-800 dark:text-emerald-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-emerald-700 dark:text-emerald-400 font-bold',
    subtext: 'text-emerald-700 dark:text-emerald-400 font-bold',
    cta: 'text-emerald-700 dark:text-emerald-400 font-bold',
    divider: 'border-emerald-100 dark:border-emerald-900/60',
  },
  blue: {
    card: 'rounded-[22px] border-2 border-sky-300 dark:border-sky-700/80 bg-gradient-to-b from-[#E0F2FE]/70 via-[#E0F2FE]/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-sky-400',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-2xl',
    iconGradient: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-2xl',
    tag: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-sky-800 dark:text-sky-300',
    title: 'text-sky-800 dark:text-sky-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-sky-700 dark:text-sky-400 font-bold',
    subtext: 'text-sky-700 dark:text-sky-400 font-bold',
    cta: 'text-sky-700 dark:text-sky-400 font-bold',
    divider: 'border-sky-100 dark:border-sky-900/60',
  },
  sky: {
    card: 'rounded-[22px] border-2 border-sky-300 dark:border-sky-700/80 bg-gradient-to-b from-[#E0F2FE]/70 via-[#E0F2FE]/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-sky-400',
    glow: 'bg-sky-400/20 group-hover:bg-sky-400/30',
    iconBox: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-2xl',
    iconGradient: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-2xl',
    tag: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-sky-800 dark:text-sky-300',
    title: 'text-sky-800 dark:text-sky-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-sky-700 dark:text-sky-400 font-bold',
    subtext: 'text-sky-700 dark:text-sky-400 font-bold',
    cta: 'text-sky-700 dark:text-sky-400 font-bold',
    divider: 'border-sky-100 dark:border-sky-900/60',
  },
  cyan: {
    card: 'rounded-[22px] border-2 border-teal-300 dark:border-teal-700/80 bg-gradient-to-b from-[#CCFBF1]/70 via-[#CCFBF1]/20 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-teal-400',
    glow: 'bg-teal-400/20 group-hover:bg-teal-400/30',
    iconBox: '!bg-teal-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-teal-600 !text-white shadow-xs rounded-full',
    tag: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-teal-800 dark:text-teal-300',
    title: 'text-teal-800 dark:text-teal-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-teal-700 dark:text-teal-400 font-bold',
    subtext: 'text-teal-700 dark:text-teal-400 font-bold',
    cta: 'text-teal-700 dark:text-teal-400 font-bold',
    divider: 'border-teal-100 dark:border-teal-900/60',
  },
  indigo: {
    card: 'rounded-[22px] border-2 border-indigo-300 dark:border-indigo-700/80 bg-gradient-to-b from-[#E0E7FF]/70 via-[#E0E7FF]/20 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-indigo-400',
    glow: 'bg-indigo-400/20 group-hover:bg-indigo-400/30',
    iconBox: '!bg-indigo-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-indigo-600 !text-white shadow-xs rounded-full',
    tag: 'bg-[#E0E7FF] text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#E0E7FF] text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-indigo-800 dark:text-indigo-300',
    title: 'text-indigo-800 dark:text-indigo-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-indigo-700 dark:text-indigo-400 font-bold',
    subtext: 'text-indigo-700 dark:text-indigo-400 font-bold',
    cta: 'text-indigo-700 dark:text-indigo-400 font-bold',
    divider: 'border-indigo-100 dark:border-indigo-900/60',
  },
  rose: {
    card: 'rounded-[22px] border-2 border-rose-300 dark:border-rose-700/80 bg-gradient-to-b from-[#FFE4E6]/70 via-[#FFE4E6]/20 to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-rose-400',
    glow: 'bg-rose-400/20 group-hover:bg-rose-400/30',
    iconBox: '!bg-rose-500 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-rose-500 !text-white shadow-xs rounded-full',
    tag: 'bg-[#FFE4E6] text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#FFE4E6] text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-rose-800 dark:text-rose-300',
    title: 'text-rose-800 dark:text-rose-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-rose-700 dark:text-rose-400 font-bold',
    subtext: 'text-rose-700 dark:text-rose-400 font-bold',
    cta: 'text-rose-700 dark:text-rose-400 font-bold',
    divider: 'border-rose-100 dark:border-rose-900/60',
  },
  amber: {
    card: 'rounded-[22px] border-2 border-amber-300 dark:border-amber-700/80 bg-gradient-to-b from-[#FEF3C7]/70 via-[#FEF3C7]/20 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-amber-400',
    glow: 'bg-amber-400/20 group-hover:bg-amber-400/30',
    iconBox: '!bg-amber-500 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-amber-500 !text-white shadow-xs rounded-full',
    tag: 'bg-[#FEF3C7] text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#FEF3C7] text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-amber-800 dark:text-amber-300',
    title: 'text-amber-800 dark:text-amber-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-amber-700 dark:text-amber-400 font-bold',
    subtext: 'text-amber-700 dark:text-amber-400 font-bold',
    cta: 'text-amber-700 dark:text-amber-400 font-bold',
    divider: 'border-amber-100 dark:border-amber-900/60',
  },
  violet: {
    card: 'rounded-[22px] border-2 border-purple-300 dark:border-purple-700/80 bg-gradient-to-b from-[#F3E8FF]/70 via-[#F3E8FF]/20 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-purple-400',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: '!bg-purple-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-purple-600 !text-white shadow-xs rounded-full',
    tag: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-purple-800 dark:text-purple-300',
    title: 'text-purple-800 dark:text-purple-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-purple-700 dark:text-purple-400 font-bold',
    subtext: 'text-purple-700 dark:text-purple-400 font-bold',
    cta: 'text-purple-700 dark:text-purple-400 font-bold',
    divider: 'border-purple-100 dark:border-purple-900/60',
  },
  purple: {
    card: 'rounded-[22px] border-2 border-purple-300 dark:border-purple-700/80 bg-gradient-to-b from-[#F3E8FF]/70 via-[#F3E8FF]/20 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-purple-400',
    glow: 'bg-purple-400/20 group-hover:bg-purple-400/30',
    iconBox: '!bg-purple-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-purple-600 !text-white shadow-xs rounded-full',
    tag: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-purple-800 dark:text-purple-300',
    title: 'text-purple-800 dark:text-purple-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-purple-700 dark:text-purple-400 font-bold',
    subtext: 'text-purple-700 dark:text-purple-400 font-bold',
    cta: 'text-purple-700 dark:text-purple-400 font-bold',
    divider: 'border-purple-100 dark:border-purple-900/60',
  },
  teal: {
    card: 'rounded-[22px] border-2 border-teal-300 dark:border-teal-700/80 bg-gradient-to-b from-[#CCFBF1]/70 via-[#CCFBF1]/20 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-teal-400',
    glow: 'bg-teal-400/20 group-hover:bg-teal-400/30',
    iconBox: '!bg-teal-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-teal-600 !text-white shadow-xs rounded-full',
    tag: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-teal-800 dark:text-teal-300',
    title: 'text-teal-800 dark:text-teal-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-teal-700 dark:text-teal-400 font-bold',
    subtext: 'text-teal-700 dark:text-teal-400 font-bold',
    cta: 'text-teal-700 dark:text-teal-400 font-bold',
    divider: 'border-teal-100 dark:border-teal-900/60',
  },
  slate: {
    card: 'rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80/80 bg-gradient-to-b from-slate-100/70 via-slate-50/30 to-white dark:from-slate-900/60 dark:via-slate-900 dark:to-slate-950 hover:border-slate-400',
    glow: 'bg-slate-400/20 group-hover:bg-slate-400/30',
    iconBox: '!bg-slate-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-slate-600 !text-white shadow-xs rounded-full',
    tag: 'bg-emerald-50 text-slate-800 dark:bg-emerald-950/40 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-700/80/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-emerald-50 text-slate-800 dark:bg-emerald-950/40 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-700/80/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-slate-800 dark:text-slate-300',
    title: 'text-slate-800 dark:text-slate-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-slate-700 dark:text-slate-400 font-bold',
    subtext: 'text-slate-700 dark:text-slate-400 font-bold',
    cta: 'text-slate-700 dark:text-slate-400 font-bold',
    divider: 'border-emerald-100/80 dark:border-emerald-800/60',
  },
}

function KpiTintedCard({
  icon: Icon,
  label,
  title,
  subtext,
  subtitle,
  value,
  tag,
  badge,
  tone = 'emerald',
  variant,
  ctaText,
  onClick,
  active = false,
  isActive = false,
  isLoading = false,
  className = '',
  ...props
}) {
  return (
    <KpiStatCard
      icon={Icon}
      title={title || label}
      value={isLoading ? '...' : (typeof value === 'number' ? value.toLocaleString('id-ID') : (value ?? 0))}
      description={subtitle || subtext}
      badge={badge || tag}
      tone={variant || tone || 'emerald'}
      ctaText={ctaText || (onClick ? 'Lihat Rincian' : 'Statistik')}
      onClick={onClick}
      className={className}
      active={active || isActive}
      {...props}
    />
  )
}

function HarmonizedDeleteModal({ isOpen, onClose, onConfirm, item, isSubmitting }) {
 if (!isOpen || !item) return null

 return (
 <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
 <motion.div
 initial={{ opacity: 0, scale: 0.94 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.94 }}
 className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]"
 >
 <div className="p-6">
 <div className="flex items-center gap-3.5 mb-4">
 <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 shadow-sm">
 <Trash2 className="h-6 w-6" />
 </div>
 <div>
 <span className="inline-block rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
 Hapus Permanen
 </span>
 <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5">
 Hapus Capaian Pembelajaran?
 </h3>
 </div>
 </div>

 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
 Apakah Anda yakin ingin menghapus Capaian Pembelajaran ini? Tindakan ini tidak dapat dibatalkan.
 </p>

 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 p-3.5 dark:border-emerald-800/60 dark:bg-rose-950/20 mb-5">
 <p className="text-xs font-black text-rose-950 dark:text-rose-100">
 [{item?.kode_cp}] {item?.nama_cp}
 </p>
 <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-0.5">
 Fase: {item?.fase || '-'} • Target: {item?.kelas_target || '-'} • Mapel: {item?.mata_pelajaran?.nama_mapel || item?.subject?.nama_mapel || '-'}
 </p>
 </div>

 <div className="flex items-center justify-end gap-3">
 <button
 type="button"
 onClick={onClose}
 disabled={isSubmitting}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-700/80 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-all cursor-pointer"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={onConfirm}
 disabled={isSubmitting}
 className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-xs font-bold text-white shadow-sm hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer"
 >
 {isSubmitting && <RefreshCw className="h-4 w-4 animate-spin" />}
 Hapus CP
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )
}

export default function MasterCapaianPembelajaranPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
 const [dataCp, setDataCp] = useState([])
 const [units, setUnits] = useState([])
 const [tahunAjarans, setTahunAjarans] = useState([])
 const [kurikulums, setKurikulums] = useState([])
 const [subjects, setSubjects] = useState([])
 const [stats, setStats] = useState({
 total_cp: 0,
 total_cp_aktif: 0,
 total_cp_nonaktif: 0,
 })

 const [loading, setLoading] = useState(true)
 const [errorMsg, setErrorMsg] = useState('')
 const [successMsg, setSuccessMsg] = useState('')

 // Filters & Pagination
 const [search, setSearch] = useState('')
 const [selectedUnit, setSelectedUnit] = useState('')
 const [selectedTahun, setSelectedTahun] = useState('')
 const [selectedKurikulum, setSelectedKurikulum] = useState('')
 const [selectedSubject, setSelectedSubject] = useState('')
 const [selectedStatus, setSelectedStatus] = useState('')
 const [page, setPage] = useState(1)
 const [pagination, setPagination] = useState({
 current_page: 1,
 last_page: 1,
 total: 0,
 per_page: 15,
 })
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [deleteItem, setDeleteItem] = useState(null)
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
 const [isDeleting, setIsDeleting] = useState(false)

 const handleExportCSV = () => {
 if (!dataCp || dataCp.length === 0) {
 Swal.fire({
 title: 'Data Masih Kosong',
 text: 'Tidak ada data Capaian Pembelajaran untuk diekspor pada filter yang dipilih.',
 icon: 'info',
 confirmButtonText: 'Tutup',
 confirmButtonColor: '#059669',
 })
 return
 }
 const headers = ['NO', 'KODE CP', 'NAMA CP', 'FASE & KELAS', 'MATA PELAJARAN', 'STATUS']
 let csvStr = headers.join(',') + '\n'
 dataCp.forEach((row, i) => {
 const line = [
 i + 1,
 `"${row.kode_cp || ''}"`,
 `"${row.nama_cp || ''}"`,
 `"${row.fase || ''} (${row.kelas_target || ''})"`,
 `"${row.mata_pelajaran?.nama_mapel || row.mata_pelajaran?.name || '-'}"`,
 `"${row.status !== false ? 'Aktif' : 'Nonaktif'}"`,
 ].join(',')
 csvStr += line + '\n'
 })
 const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' })
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.href = url
 link.download = `export_capaian_pembelajaran_${new Date().toISOString().slice(0, 10)}.csv`
 link.click()
 URL.revokeObjectURL(url)
 }

 const pageActions = (
 <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
 <SquircleActionButton variant="import" label="Import Data" onClick={() => setImportOpen(true)} />
 <SquircleActionButton variant="export" label="Export Data" onClick={handleExportCSV} />
 <SquircleActionButton variant="print" icon={Printer} label="Cetak Data" onClick={() => setIsPrintModalOpen(true)} />
 <SquircleActionButton variant="create" label="Tambah CP" onClick={() => handleOpenModal()} />
 </div>
 )

 // User Auth & Teacher Scoping
 const user = useAuthStore((state) => state.user)

 const userRoles = useMemo(() => {
 if (!user?.roles) return []
 return user.roles.map((r) => (typeof r === 'string' ? r : r.name || r.role_name || ''))
 }, [user])

 const isGuru = useMemo(() => {
 const rList = userRoles.map((r) => r.toLowerCase())
 const mainRole = String(user?.role || '').toLowerCase()
 return (
 rList.some((r) => r.includes('guru') || r.includes('wali_kelas') || r.includes('wali kelas')) ||
 mainRole.includes('guru')
 )
 }, [userRoles, user?.role])

 const teacherUnitIds = useMemo(() => {
 if (!user) return []
 const ids = []
 if (user.unit_id) ids.push(String(user.unit_id))
 if (user.unit_pendidikan_id) ids.push(String(user.unit_pendidikan_id))
 if (user.education_unit_id) ids.push(String(user.education_unit_id))
 if (user.unit?.id) ids.push(String(user.unit.id))
 if (user.school_info?.id) ids.push(String(user.school_info.id))
 if (Array.isArray(user.units)) {
 user.units.forEach((u) => ids.push(String(typeof u === 'object' ? u.id : u)))
 }
 if (Array.isArray(user.unit_ids)) {
 user.unit_ids.forEach((u) => ids.push(String(u)))
 }
 return Array.from(new Set(ids))
 }, [user])

 const teacherSubjectIds = useMemo(() => {
 if (!user) return []
 const ids = []
 const rawList =
 user.subject_ids ||
 user.subjects ||
 user.mata_pelajaran_ids ||
 user.mata_pelajaran ||
 user.teacher_subjects ||
 user.assigned_subjects ||
 []
 if (Array.isArray(rawList)) {
 rawList.forEach((s) => ids.push(String(typeof s === 'object' ? s.id : s)))
 }
 if (user.subject_id) ids.push(String(user.subject_id))
 if (user.mata_pelajaran_id) ids.push(String(user.mata_pelajaran_id))
 return Array.from(new Set(ids))
 }, [user])

 // Modal State
 const [modalOpen, setModalOpen] = useState(false)
 const [importOpen, setImportOpen] = useState(false)
 const [editingItem, setEditingItem] = useState(null)
 const [formSubmitting, setFormSubmitting] = useState(false)
 const [formData, setFormData] = useState({
 unit_pendidikan_id: '',
 tahun_ajaran_id: '',
 kurikulum_id: '',
 mata_pelajaran_id: '',
 kode_cp: '',
 nama_cp: '',
 deskripsi: '',
 fase: 'Fase A',
 kelas_target: 'Kelas 1',
 urutan: 1,
 status: true,
 })

 const availableUnitsForModal = useMemo(() => {
 if (isGuru && teacherUnitIds.length > 0) {
 const filtered = units.filter((u) => teacherUnitIds.includes(String(u.id)))
 return filtered.length > 0 ? filtered : units
 }
 return units
 }, [isGuru, teacherUnitIds, units])

 const resolveKurikulumForUnit = (unitId) => {
 if (!unitId) return kurikulums
 const currentUnit = units.find((u) => String(u.id) === String(unitId))
 const jenjang = getUnitJenjang(currentUnit)

 const direct = kurikulums.filter(
 (k) => String(k.unit_pendidikan_id) === String(unitId) || String(k.unit_id) === String(unitId)
 )
 const byJenjang = kurikulums.filter((k) => {
 if (!jenjang) return false
 const kJ = String(k.jenjang || '').toUpperCase()
 if (kJ === jenjang) return true
 if (jenjang === 'SMP' && (kJ.includes('SMP') || kJ.includes('PESANTREN'))) return true
 if (jenjang === 'SMA' && (kJ.includes('SMA') || kJ.includes('PESANTREN'))) return true
 const kText = `${k.nama_kurikulum || ''} ${k.kode_kurikulum || ''}`.toUpperCase()
 return kText.includes(jenjang)
 })
 const seen = new Set()
 const result = []
 ;[...direct, ...byJenjang].forEach((item) => {
 if (!seen.has(String(item.id))) {
 seen.add(String(item.id))
 result.push(item)
 }
 })
 return result.length > 0 ? result : kurikulums
 }

 const resolveSubjectsForUnit = (unitId, kurId) => {
 let list = subjects
 const currentUnit = units.find((u) => String(u.id) === String(unitId))
 const jenjang = getUnitJenjang(currentUnit)

 if (unitId) {
 const unitSubs = list.filter((s) => String(s.unit_pendidikan_id) === String(unitId))
 if (unitSubs.length > 0) {
 list = unitSubs
 } else if (jenjang) {
 const jSubs = list.filter((s) => {
 const str = `${s.kode_mapel || ''} ${s.nama_mapel || ''} ${s.code || ''} ${s.name || ''}`.toUpperCase()
 return str.includes(jenjang)
 })
 if (jSubs.length > 0) list = jSubs
 }
 }

 if (kurId) {
 const kurSubs = list.filter((s) => !s.kurikulum_id || String(s.kurikulum_id) === String(kurId))
 if (kurSubs.length > 0) {
 list = kurSubs
 }
 }

 if (isGuru && teacherSubjectIds.length > 0) {
 const guruSubs = list.filter((s) => teacherSubjectIds.includes(String(s.id)))
 if (guruSubs.length > 0) list = guruSubs
 }

 return list.length > 0 ? list : subjects
 }

 const availableKurikulumsForModal = useMemo(() => {
 const targetUnit = formData.unit_pendidikan_id || (isGuru && teacherUnitIds.length > 0 ? teacherUnitIds[0] : '')
 return resolveKurikulumForUnit(targetUnit)
 }, [kurikulums, formData.unit_pendidikan_id, isGuru, teacherUnitIds, units])

 const availableSubjectsForModal = useMemo(() => {
 const targetUnit = formData.unit_pendidikan_id || (isGuru && teacherUnitIds.length > 0 ? teacherUnitIds[0] : '')
 return resolveSubjectsForUnit(targetUnit, formData.kurikulum_id)
 }, [subjects, formData.unit_pendidikan_id, formData.kurikulum_id, isGuru, teacherUnitIds, teacherSubjectIds, units])

 const availableFasesForModal = useMemo(() => {
 const targetUnit = formData.unit_pendidikan_id || (isGuru && teacherUnitIds.length > 0 ? teacherUnitIds[0] : '')
 const currentUnit = units.find((u) => String(u.id) === String(targetUnit))
 const targetJenjang = getUnitJenjang(currentUnit)
 if (targetJenjang && FASE_OPTIONS_BY_JENJANG[targetJenjang]) {
 return FASE_OPTIONS_BY_JENJANG[targetJenjang]
 }
 return ALL_FASE_OPTIONS
 }, [units, formData.unit_pendidikan_id, isGuru, teacherUnitIds])

 const loadDropdownMasterData = async () => {
 try {
 const [uRes, tRes, kRes, sRes, sStats] = await Promise.all([
 educationUnitService.getDaftar().catch(() => ({ data: [] })),
 tahunAjaranService.getDropdown().catch(() => []),
 masterKurikulumService.getDropdown().catch(() => []),
 subjectService.getDropdown().catch(() => ({ data: [] })),
 capaianPembelajaranService.getStats().catch(() => null),
 ])

 const extractList = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [])

 setUnits(extractList(uRes))
 setTahunAjarans(extractList(tRes))
 setKurikulums(extractList(kRes))
 setSubjects(extractList(sRes))
 if (sStats) setStats(sStats)
 } catch (err) {
 console.error('Error loading dropdown masters:', err)
 }
 }

 const fetchDaftarCp = async () => {
 setLoading(true)
 setErrorMsg('')
 try {
 const response = await capaianPembelajaranService.getDaftar({
 page,
 search,
 unit_pendidikan_id: selectedUnit,
 tahun_ajaran_id: selectedTahun,
 kurikulum_id: selectedKurikulum,
 mata_pelajaran_id: selectedSubject,
 status: selectedStatus,
 per_page: 15,
 })
 if (response?.data) {
 setDataCp(response.data)
 if (response.meta) {
 setPagination({
 current_page: response.meta.current_page || 1,
 last_page: response.meta.last_page || 1,
 total: response.meta.total || 0,
 per_page: response.meta.per_page || 15,
 })
 }
 }
 } catch (err) {
 console.error('Error fetching CP data:', err)
 setErrorMsg('Gagal memuat data Capaian Pembelajaran. Silakan coba lagi.')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 loadDropdownMasterData()
 }, [])

 useEffect(() => {
 fetchDaftarCp()
 }, [page, search, selectedUnit, selectedTahun, selectedKurikulum, selectedSubject, selectedStatus])

 const handleOpenModal = (item = null) => {
 if (item) {
 setEditingItem(item)
 setFormData({
 unit_pendidikan_id: item.unit_pendidikan_id || '',
 tahun_ajaran_id: item.tahun_ajaran_id || '',
 kurikulum_id: item.kurikulum_id || '',
 mata_pelajaran_id: item.mata_pelajaran_id || '',
 kode_cp: item.kode_cp || '',
 nama_cp: item.nama_cp || '',
 deskripsi: item.deskripsi || '',
 fase: item.fase || 'Fase A',
 kelas_target: item.kelas_target || 'Kelas 1',
 urutan: item.urutan || 1,
 status: item.status !== undefined ? item.status : true,
 })
 } else {
 setEditingItem(null)
 const defaultUnit = isGuru && teacherUnitIds.length > 0
 ? teacherUnitIds[0]
 : (selectedUnit || (units.length > 0 ? units[0].id : ''))

 const currentUnit = units.find((u) => String(u.id) === String(defaultUnit))
 const jenjang = getUnitJenjang(currentUnit)
 const defaultFaseData = getDefaultFaseForJenjang(jenjang)

 const matchingKur = resolveKurikulumForUnit(defaultUnit)
 const defaultKur = selectedKurikulum && matchingKur.some((k) => String(k.id) === String(selectedKurikulum))
 ? selectedKurikulum
 : (matchingKur.length > 0 ? matchingKur[0].id : '')

 const matchingSub = resolveSubjectsForUnit(defaultUnit, defaultKur)
 const defaultSub = selectedSubject && matchingSub.some((s) => String(s.id) === String(selectedSubject))
 ? selectedSubject
 : (matchingSub.length > 0 ? matchingSub[0].id : (subjects.length > 0 ? subjects[0].id : ''))

 const defaultTahun = selectedTahun || (tahunAjarans.length > 0 ? tahunAjarans[0].id : '')

 setFormData({
 unit_pendidikan_id: defaultUnit,
 tahun_ajaran_id: defaultTahun,
 kurikulum_id: defaultKur,
 mata_pelajaran_id: defaultSub,
 kode_cp: `CP-MAPEL-${(pagination.total || dataCp.length) + 1}`,
 nama_cp: '',
 deskripsi: '',
 fase: defaultFaseData.fase,
 kelas_target: defaultFaseData.kelas_target,
 urutan: (pagination.total || dataCp.length) + 1,
 status: true,
 })
 }
 setModalOpen(true)
 }

 const handleUnitChangeInForm = (newUnitId) => {
 const currentUnit = units.find((u) => String(u.id) === String(newUnitId))
 const jenjang = getUnitJenjang(currentUnit)
 const defaultFaseData = getDefaultFaseForJenjang(jenjang)

 const matchingKur = resolveKurikulumForUnit(newUnitId)
 const newKurId = matchingKur.length > 0 ? matchingKur[0].id : ''

 const matchingSub = resolveSubjectsForUnit(newUnitId, newKurId)
 const newSubId = matchingSub.length > 0 ? matchingSub[0].id : ''

 setFormData((prev) => ({
 ...prev,
 unit_pendidikan_id: newUnitId,
 kurikulum_id: newKurId,
 mata_pelajaran_id: newSubId,
 fase: defaultFaseData.fase,
 kelas_target: defaultFaseData.kelas_target,
 }))
 }

 const handleKurikulumChangeInForm = (newKurId) => {
 const matchingSub = resolveSubjectsForUnit(formData.unit_pendidikan_id, newKurId)
 const currentSubValid = matchingSub.some((s) => String(s.id) === String(formData.mata_pelajaran_id))
 const newSubId = currentSubValid ? formData.mata_pelajaran_id : (matchingSub.length > 0 ? matchingSub[0].id : '')

 setFormData((prev) => ({
 ...prev,
 kurikulum_id: newKurId,
 mata_pelajaran_id: newSubId,
 }))
 }

 const handleCloseModal = () => {
 setModalOpen(false)
 setEditingItem(null)
 }

 const handleSubmitForm = async (e) => {
 e.preventDefault()
 if (!formData.kurikulum_id) {
 setErrorMsg('Kurikulum harus dipilih.')
 return
 }
 if (!formData.mata_pelajaran_id) {
 setErrorMsg('Mata Pelajaran harus dipilih.')
 return
 }
 if (!formData.kode_cp.trim() || !formData.nama_cp.trim()) {
 setErrorMsg('Kode dan Nama Capaian Pembelajaran wajib diisi.')
 return
 }

 setFormSubmitting(true)
 setErrorMsg('')
 try {
 if (editingItem) {
 await capaianPembelajaranService.ubah({
 id: editingItem.id,
 payload: formData,
 })
 setSuccessMsg('Capaian Pembelajaran berhasil diperbarui!')
 } else {
 await capaianPembelajaranService.tambah(formData)
 setSuccessMsg('Capaian Pembelajaran berhasil ditambahkan!')
 }
 handleCloseModal()
 fetchDaftarCp()
 loadDropdownMasterData()
 setTimeout(() => setSuccessMsg(''), 4000)
 } catch (err) {
 console.error('Error submitting CP form:', err)
 const msg = err.response?.data?.message || 'Gagal menyimpan data. Pastikan kolom diisi dengan benar.'
 setErrorMsg(msg)
 } finally {
 setFormSubmitting(false)
 }
 }

 const handleConfirmHapus = async () => {
 if (!deleteItem) return
 setIsDeleting(true)
 try {
 await capaianPembelajaranService.hapus(deleteItem.id)
 setSuccessMsg(`Capaian Pembelajaran [${deleteItem.kode_cp}] berhasil dihapus.`)
 setIsDeleteModalOpen(false)
 setDeleteItem(null)
 fetchDaftarCp()
 loadDropdownMasterData()
 setTimeout(() => setSuccessMsg(''), 4000)
 } catch (err) {
 console.error('Error deleting CP:', err)
 setErrorMsg('Gagal menghapus data Capaian Pembelajaran.')
 } finally {
 setIsDeleting(false)
 }
 }

 const handleImport = async (rows) => {
 const failures = []
 let success = 0
 for (let index = 0; index < rows.length; index += 1) {
 const row = rows[index]
 try {
 await capaianPembelajaranService.tambah({
 unit_pendidikan_id: row.unit_pendidikan_id,
 tahun_ajaran_id: row.tahun_ajaran_id,
 kurikulum_id: row.kurikulum_id,
 mata_pelajaran_id: row.mata_pelajaran_id,
 kode_cp: row.kode_cp,
 nama_cp: row.nama_cp,
 deskripsi: row.deskripsi || '',
 fase: row.fase || 'Fase A',
 kelas_target: row.kelas_target || 'Kelas 1',
 urutan: Number(row.urutan || index + 1),
 status: !['0', 'false', 'nonaktif'].includes(String(row.status).toLowerCase()),
 })
 success += 1
 } catch (error) { failures.push(`baris ${index + 2}: ${error.response?.data?.message || 'gagal'}`) }
 }
 await fetchDaftarCp(); await loadDropdownMasterData()
 setSuccessMsg(`${success} CP berhasil diimpor${failures.length ? `, ${failures.length} gagal (${failures.slice(0, 3).join('; ')})` : '.'}`)
 }

  const cpColumns = useMemo(
    () => [
      {
        key: 'urutan',
        label: 'Urutan',
        className: 'w-20 text-center font-bold text-slate-500 dark:text-slate-400',
        render: (item) => `#${item.urutan ?? '-'}`
      },
      {
        key: 'kode_cp',
        label: 'Kode CP',
        className: 'w-36 font-semibold',
        render: (item) => (
          <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold border border-emerald-200/60 dark:border-emerald-800/60">
            {item.kode_cp}
          </span>
        )
      },
      {
        key: 'nama_cp',
        label: 'Nama & Deskripsi CP',
        className: 'min-w-[240px]',
        render: (item) => (
          <div>
            <div className="font-bold text-slate-800 dark:text-slate-100">{item.nama_cp}</div>
            {item.deskripsi && (
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                {item.deskripsi}
              </p>
            )}
          </div>
        )
      },
      {
        key: 'kurikulum_mapel',
        label: 'Kurikulum & Mapel',
        className: 'hidden md:table-cell min-w-[180px]',
        render: (item) => (
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-100">
              {item.subject?.nama_mapel || item.subject?.name || '-'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {item.kurikulum?.nama_kurikulum || 'Tanpa Kurikulum'}
            </div>
          </div>
        )
      },
      {
        key: 'fase',
        label: 'Fase / Kelas',
        className: 'hidden lg:table-cell text-center w-32',
        render: (item) => (
          <span className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold">
            {item.fase || '-'} ({item.kelas_target || 'Semua'})
          </span>
        )
      },
      {
        key: 'status',
        label: 'Status',
        className: 'hidden sm:table-cell text-center w-28',
        render: (item) => <MasterStatusBadge active={item.status} />
      }
    ],
    []
  )

  const renderMobileCard = useCallback(
    (item) => (
      <MobileDataCard
        key={item.id}
        title={item.nama_cp}
        subtitle={item.subject?.nama_mapel || item.subject?.name || '-'}
        statusBadge={<MasterStatusBadge active={item.status} />}
        fields={[
          { label: 'Kode CP', value: item.kode_cp, icon: BookOpen },
          { label: 'Urutan', value: `#${item.urutan ?? '-'}` },
          { label: 'Kurikulum', value: item.kurikulum?.nama_kurikulum || 'Tanpa Kurikulum' },
          { label: 'Fase / Kelas', value: `${item.fase || '-'} (${item.kelas_target || 'Semua'})` }
        ]}
        onEdit={() => handleOpenModal(item)}
        onDelete={() => {
          setDeleteItem(item)
          setIsDeleteModalOpen(true)
        }}
      />
    ),
    [handleOpenModal]
  )

 return (
 <PageContainer maxW="7xl">
 {!(embedded || hideBreadcrumb) && (
 <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Capaian Pembelajaran' }]} />
 )}
 <MasterDataPage
 className="cp-master-page"
 hideBreadcrumb={embedded || hideBreadcrumb}
 >
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title="Capaian Pembelajaran (CP)"
 onPrint={() => {
 const rowsToPrint = Array.isArray(dataCp) ? dataCp : []
 printCleanTable({
 title: 'Laporan Data Capaian Pembelajaran (CP)',
 subtitle: 'Daftar Capaian Pembelajaran Sekolah Islam Terpadu',
 headers: ['NO', 'KODE CP', 'NAMA CAPAIAN PEMBELAJARAN', 'FASE / KELAS', 'MATA PELAJARAN', 'STATUS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 row.kode_cp || '-',
 row.nama_cp || '-',
 `${row.fase || '-'} (${row.kelas_target || '-'})`,
 row.mata_pelajaran?.nama_mapel || row.mata_pelajaran?.name || '-',
 row.status !== false ? 'Aktif' : 'Nonaktif',
 ]),
 })
 }}
 onDownload={() => {
 const rowsToPrint = Array.isArray(dataCp) ? dataCp : []
 downloadPdfTable({
 title: 'Laporan Data Capaian Pembelajaran (CP)',
 subtitle: 'Daftar Capaian Pembelajaran Sekolah Islam Terpadu',
 headers: ['NO', 'KODE CP', 'NAMA CAPAIAN PEMBELAJARAN', 'FASE / KELAS', 'MATA PELAJARAN', 'STATUS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 row.kode_cp || '-',
 row.nama_cp || '-',
 `${row.fase || '-'} (${row.kelas_target || '-'})`,
 row.mata_pelajaran?.nama_mapel || row.mata_pelajaran?.name || '-',
 row.status !== false ? 'Aktif' : 'Nonaktif',
 ]),
 filename: 'laporan_capaian_pembelajaran.pdf',
 })
 }}
 />
         {/* Hero Banner */}
        {!hidePageHeader && (
          <div className="mb-6">
            <HeroUiHeader
              title="Master Capaian Pembelajaran (CP)"
              subtitle="Kelola CP berbasis Kurikulum, Unit Pendidikan, dan Mapel sebagai fondasi utama TP & Modul Ajar."
              badge="Capaian Pembelajaran"
              icon={BookOpen}
            />
          </div>
        )}

 <CsvImportModal open={importOpen} onClose={() => setImportOpen(false)} title="Capaian Pembelajaran" onImport={handleImport} columns={[
 { key: 'unit_pendidikan_id' }, { key: 'tahun_ajaran_id' }, { key: 'kurikulum_id', required: true }, { key: 'mata_pelajaran_id', required: true },
 { key: 'kode_cp', required: true, example: 'CP-MTK-01' }, { key: 'nama_cp', required: true, example: 'Bilangan' }, { key: 'deskripsi' }, { key: 'fase', example: 'Fase A' }, { key: 'kelas_target', example: 'Kelas 1' }, { key: 'urutan', example: '1' }, { key: 'status', example: '1' },
 ]} />

 {/* Stats Cards */}
 <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
 <KpiTintedCard icon={BookOpen} label="Total Capaian Pembelajaran" value={stats.total_cp ?? 0} subtext="Terdaftar di sistem" tone="emerald" />
 <KpiTintedCard icon={CheckCircle} label="CP Status Aktif" value={stats.total_cp_aktif ?? 0} subtext="Siap digunakan" tone="blue" />
 <KpiTintedCard icon={AlertCircle} label="CP Nonaktif" value={stats.total_cp_nonaktif ?? 0} subtext="Arsip / Nonaktif" tone="amber" />
 </motion.div>

 {/* Tab Navigation Card (below KPI grid, above filter) */}
 {tabNav && (
 <motion.div variants={itemVariants}>
 {typeof tabNav === 'function' ? tabNav() : tabNav}
 </motion.div>
 )}

 {/* Notifications */}
 {successMsg && (
 <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <CheckCircle className="w-5 h-5 text-emerald-600" />
 <span className="text-sm font-semibold">{successMsg}</span>
 </div>
 <button onClick={() => setSuccessMsg('')} className="text-emerald-500 hover:text-emerald-700">
 <X className="w-4 h-4" />
 </button>
 </div>
 )}

 {errorMsg && (
 <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-800 dark:bg-rose-950/40 dark:border-emerald-800/60 dark:text-rose-300 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <AlertCircle className="w-5 h-5 text-rose-600" />
 <span className="text-sm font-semibold">{errorMsg}</span>
 </div>
 <button onClick={() => setErrorMsg('')} className="text-rose-500 hover:text-rose-700">
 <X className="w-4 h-4" />
 </button>
 </div>
 )}

        {/* ── Master Datatable Panel (AppDataTable) ── */}
        <motion.div variants={itemVariants}>
          <AppDataTable
            id="tabel-capaian-pembelajaran"
            title="Data Capaian Pembelajaran"
            icon={BookOpen}
            iconClassName="bg-emerald-50 border border-emerald-200/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm"
            countLabel={`${Number(pagination.total || dataCp.length).toLocaleString('id-ID')} CP`}
            description="Data sesuai filter dan kewenangan pengguna."
            actions={pageActions}
            search={search}
            onSearchChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            searchPlaceholder="Cari kode CP, nama capaian pembelajaran, atau deskripsi..."
            filters={
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5 w-full">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 hidden sm:inline-block">
                  Filter:
                </span>

                <CustomSelect
                  value={selectedUnit}
                  onChange={(e) => {
                    setSelectedUnit(e.target.value)
                    setPage(1)
                  }}
                  className="h-9 w-full sm:w-auto min-w-[140px] rounded-[14px] border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 text-xs font-semibold dark:border-emerald-700/80 dark:bg-[#111827] dark:text-slate-100"
                >
                  <option value="">-- Semua Unit --</option>
                  {units.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name || item.code}
                    </option>
                  ))}
                </CustomSelect>

                <CustomSelect
                  value={selectedTahun}
                  onChange={(e) => {
                    setSelectedTahun(e.target.value)
                    setPage(1)
                  }}
                  className="h-9 w-full sm:w-auto min-w-[140px] rounded-[14px] border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 text-xs font-semibold dark:border-emerald-700/80 dark:bg-[#111827] dark:text-slate-100"
                >
                  <option value="">-- Semua Tahun Ajaran --</option>
                  {tahunAjarans.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.tahun || item.name}
                    </option>
                  ))}
                </CustomSelect>

                <CustomSelect
                  value={selectedKurikulum}
                  onChange={(e) => {
                    setSelectedKurikulum(e.target.value)
                    setSelectedSubject('')
                    setPage(1)
                  }}
                  className="h-9 w-full sm:w-auto min-w-[140px] rounded-[14px] border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 text-xs font-semibold dark:border-emerald-700/80 dark:bg-[#111827] dark:text-slate-100"
                >
                  <option value="">-- Semua Kurikulum --</option>
                  {kurikulums.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.nama_kurikulum || item.kode_kurikulum}
                    </option>
                  ))}
                </CustomSelect>

                <CustomSelect
                  value={selectedSubject}
                  onChange={(e) => {
                    setSelectedSubject(e.target.value)
                    setPage(1)
                  }}
                  className="h-9 w-full sm:w-auto min-w-[140px] rounded-[14px] border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 text-xs font-semibold dark:border-emerald-700/80 dark:bg-[#111827] dark:text-slate-100"
                >
                  <option value="">-- Semua Mapel --</option>
                  {subjects
                    .filter((item) => {
                      if (selectedUnit && item.unit_pendidikan_id && String(item.unit_pendidikan_id) !== String(selectedUnit)) {
                        return false
                      }
                      if (selectedKurikulum && item.kurikulum_id && String(item.kurikulum_id) !== String(selectedKurikulum)) {
                        return false
                      }
                      return true
                    })
                    .map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nama_mapel || item.name}
                      </option>
                    ))}
                </CustomSelect>

                <CustomSelect
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value)
                    setPage(1)
                  }}
                  className="h-9 w-full sm:w-auto min-w-[130px] rounded-[14px] border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 text-xs font-semibold dark:border-emerald-700/80 dark:bg-[#111827] dark:text-slate-100"
                >
                  <option value="">-- Semua Status --</option>
                  <option value="aktif">Aktif</option>
                  <option value="tidak_aktif">Nonaktif</option>
                </CustomSelect>

                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setSelectedUnit('')
                    setSelectedTahun('')
                    setSelectedKurikulum('')
                    setSelectedSubject('')
                    setSelectedStatus('')
                    setPage(1)
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 h-9 w-full sm:w-auto sm:ml-auto rounded-[14px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
                  title="Reset Filter"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Reset</span>
                </button>
              </div>
            }
            columns={cpColumns}
            data={dataCp}
            renderMobileCard={renderMobileCard}
            page={page}
            totalPages={pagination.last_page || 1}
            totalItems={pagination.total || dataCp.length}
            itemsPerPage={pagination.per_page || 10}
            onPageChange={setPage}
            isLoading={loading}
            onEdit={(item) => handleOpenModal(item)}
            onDelete={(item) => {
              setDeleteItem(item)
              setIsDeleteModalOpen(true)
            }}
            actionColumnLabel="AKSI"
          />
        </motion.div>

 {/* Modal Form */}
 {modalOpen && (
 <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
 <div className="bg-white dark:bg-[#1B2433] w-full max-w-xl my-auto max-h-[calc(100dvh-2rem)] flex flex-col rounded-xl shadow-2xl border border-emerald-200/80 dark:border-emerald-800/60 overflow-hidden">
 <div className="bg-white dark:bg-[#1B2433] p-5 flex items-center justify-between shrink-0">
 <div className="flex items-center gap-3">
 <BookOpen className="w-6 h-6 text-emerald-200" />
 <h3 className="text-lg font-bold">
 {editingItem ? 'Edit Capaian Pembelajaran' : 'Tambah Capaian Pembelajaran Baru'}
 </h3>
 </div>
 <button onClick={handleCloseModal} className="text-emerald-100 hover:text-white p-1 rounded-lg">
 <X className="w-5 h-5" />
 </button>
 </div>

 <form onSubmit={handleSubmitForm} className="p-6 space-y-4 overflow-y-auto min-h-0 flex-1">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 Unit Pendidikan
 </label>
 <CustomSelect
 value={formData.unit_pendidikan_id}
 onChange={(e) => handleUnitChangeInForm(e.target.value)}
 className="w-full px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] dark:text-slate-100"
 >
 <option value="">-- Pilih Unit --</option>
 {availableUnitsForModal.map((u) => (
 <option key={u.id} value={u.id}>
 {u.name || u.code}
 </option>
 ))}
 </CustomSelect>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 Tahun Ajaran
 </label>
 <CustomSelect
 value={formData.tahun_ajaran_id}
 onChange={(e) => setFormData({ ...formData, tahun_ajaran_id: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] dark:text-slate-100"
 >
 <option value="">-- Pilih Tahun Ajaran --</option>
 {tahunAjarans.map((t) => (
 <option key={t.id} value={t.id}>
 {t.tahun || t.name}
 </option>
 ))}
 </CustomSelect>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 Kurikulum <span className="text-rose-500">*</span>
 </label>
 <CustomSelect
 value={formData.kurikulum_id}
 onChange={(e) => handleKurikulumChangeInForm(e.target.value)}
 className="w-full px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] dark:text-slate-100"
 required
 >
 <option value="">-- Pilih Kurikulum --</option>
 {availableKurikulumsForModal.map((k) => (
 <option key={k.id} value={k.id}>
 {k.nama_kurikulum || k.kode_kurikulum} {k.jenjang ? `(${k.jenjang})` : ''}
 </option>
 ))}
 </CustomSelect>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 Mata Pelajaran <span className="text-rose-500">*</span>
 </label>
 <CustomSelect
 value={formData.mata_pelajaran_id}
 onChange={(e) => setFormData({ ...formData, mata_pelajaran_id: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] dark:text-slate-100"
 required
 >
 <option value="">-- Pilih Mata Pelajaran --</option>
 {availableSubjectsForModal.map((s) => (
 <option key={s.id} value={s.id}>
 {s.nama_mapel || s.name} {s.kode_mapel || s.code ? `[${s.kode_mapel || s.code}]` : ''}
 </option>
 ))}
 </CustomSelect>
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 Kode CP <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 placeholder="Contoh: CP-MTK-SD-01"
 value={formData.kode_cp}
 onChange={(e) => setFormData({ ...formData, kode_cp: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] dark:text-slate-100"
 required
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 Fase <span className="text-slate-400 font-normal">(Kurikulum)</span>
 </label>
 <CustomSelect
 value={formData.fase}
 onChange={(e) => {
 const newFase = e.target.value
 let newKelas = formData.kelas_target
 if (newFase === 'Fase Fondasi') newKelas = 'TK A'
 else if (newFase === 'Fase A') newKelas = 'Kelas 1'
 else if (newFase === 'Fase B') newKelas = 'Kelas 3'
 else if (newFase === 'Fase C') newKelas = 'Kelas 5'
 else if (newFase === 'Fase D') newKelas = 'Kelas 7'
 else if (newFase === 'Fase E') newKelas = 'Kelas 10'
 else if (newFase === 'Fase F') newKelas = 'Kelas 11'
 setFormData({ ...formData, fase: newFase, kelas_target: newKelas })
 }}
 className="w-full px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] dark:text-slate-100"
 >
 {availableFasesForModal.map((f) => (
 <option key={f.value} value={f.value}>
 {f.label}
 </option>
 ))}
 </CustomSelect>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 Kelas Target
 </label>
 <input
 type="text"
 placeholder="Contoh: Kelas 1, TK A"
 value={formData.kelas_target}
 onChange={(e) => setFormData({ ...formData, kelas_target: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] dark:text-slate-100"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 Nama Capaian Pembelajaran (CP) <span className="text-rose-500">*</span>
 </label>
 <input
 type="text"
 placeholder="Masukkan nama / ringkasan Capaian Pembelajaran..."
 value={formData.nama_cp}
 onChange={(e) => setFormData({ ...formData, nama_cp: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] dark:text-slate-100"
 required
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 Deskripsi Lengkap CP
 </label>
 <textarea
 rows={3}
 placeholder="Deskripsi uraian kompetensi elemen CP..."
 value={formData.deskripsi}
 onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] dark:text-slate-100"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 Urutan
 </label>
 <input
 type="number"
 min={1}
 value={formData.urutan}
 onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 1 })}
 className="w-full px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] dark:text-slate-100"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 Status Aktivasi
 </label>
 <CustomSelect
 value={formData.status ? 'true' : 'false'}
 onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
 className="w-full px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] dark:text-slate-100"
 >
 <option value="true">Aktif</option>
 <option value="false">Nonaktif</option>
 </CustomSelect>
 </div>
 </div>

 <div className="sticky bottom-0 bg-white dark:bg-[#1B2433] pt-3 pb-1 -mx-6 px-6 flex items-center justify-end gap-3 border-t border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
 <button
 type="button"
 onClick={handleCloseModal}
 className="px-5 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition"
 >
 Batal
 </button>
 <button
 type="submit"
 disabled={formSubmitting}
 className="inline-flex items-center gap-2 bg-[#059669] hover:bg-[#1E8E5A] text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50"
 >
 {formSubmitting ? (
 <>
 <RefreshCw className="w-4 h-4 animate-spin" />
 Menyimpan...
 </>
 ) : (
 <>
 <Sparkles className="w-4 h-4" />
 Simpan CP
 </>
 )}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 <HarmonizedDeleteModal
 isOpen={isDeleteModalOpen}
 onClose={() => {
 setIsDeleteModalOpen(false)
 setDeleteItem(null)
 }}
 onConfirm={handleConfirmHapus}
 item={deleteItem}
 isSubmitting={isDeleting}
 />
 </motion.div>
 </MasterDataPage>
 </PageContainer>
 )
}
