import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import {
  KpiStatCard
} from '../components/app'
import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  useNavigate
} from 'react-router-dom'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  FileText,
  BookOpen,
  Target,
  Award,
  Plus,
  Search,
  Edit3,
  Trash2,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  RefreshCw,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Layers,
  CheckSquare,
  ChevronDown,
  Check,
  School,
  Lock
} from 'lucide-react'
import {
  lmsKisiKisiService
} from '../services/lmsKisiKisiService'
import {
  subjectService
} from '../services/subjectService'
import {
  useAuthStore
} from '../stores/authStore'
import {
  useUnitStore
} from '../stores/unitStore'
import {
  usePengaturanStore
} from '../stores/pengaturanStore'
import ActionDropdown from '../components/app/ActionDropdown'
import AppModal from '../components/app/AppModal'
import LmsKpiDetailModal from '../components/lms/LmsKpiDetailModal'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  printCleanTable,
  downloadPdfTable
} from '../utils/printHelper'
import {
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'
import AppDataTable from '../components/app/AppDataTable'
import { PageToolbarActions } from '../components/app/PageToolbarActions'
import MobileDataCard from '../components/app/MobileDataCard'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../components/ui/table'
import CsvImportModal from '../components/master-data/CsvImportModal'
import {
  RotateCcw,
  Printer
} from 'lucide-react'

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05, delayChildren: 0.02 } } }
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } } }

// ── PALET WARNA RESMI MODERN KPI CARDS ──
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

function ModernKpiCard({
  icon: Icon,
  title,
  label,
  value,
  subtitle,
  subtext,
  description,
  tag,
  badge,
  tone = 'emerald',
  variant,
  ctaText,
  onClick,
  active = false,
  isActive = false,
  className = '',
  trend,
  trendText,
  card,
  ...props
}) {
  return (
    <KpiStatCard
      icon={Icon || card?.icon}
      title={card?.title || title || label}
      value={card?.formattedValue ?? card?.value ?? value}
      description={card?.subtext || subtitle || subtext || description || (trendText ? `${trend ? trend + ' ' : ''}${trendText}` : undefined)}
      badge={card?.badgeText || badge || tag}
      tone={variant || tone || card?.tone || 'emerald'}
      ctaText={ctaText || card?.ctaText || card?.footerLabel}
      onClick={onClick || card?.onClick}
      className={className}
      active={active || isActive}
      trend={trend}
      trendText={trendText}
      card={card}
      {...props}
    />
  )
}

function SoalProgressBar({ current, target }) {
 const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0
 const color = pct >= 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-400' : 'bg-rose-400'
 const textColor = pct >= 100 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-rose-500'
 return (
 <div className="w-full">
 <div className="flex items-center justify-between mb-1">
 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">{current}/{target} soal</span>
 <span className={`text-[10px] font-black ${textColor}`}>{pct}%</span>
 </div>
 <div className="h-1.5 w-full rounded-full bg-emerald-50 dark:bg-slate-700 overflow-hidden">
 <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
 </div>
 </div>
 )
}

const normalizeArray = (v) => { if (Array.isArray(v)) return v; if (Array.isArray(v?.data)) return v.data; return [] }
const getSubjectLabel = (s) => s?.label || s?.nama_mapel || s?.nama || s?.name || s?.kode_mapel || 'Mata Pelajaran'
const getJenisBadgeColor = (j) => {
 switch (j) {
 case 'UH': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300'
 case 'PTS': case 'UTS': return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-300'
 case 'PAS': case 'UAS': return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300'
 case 'CBT': return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-300'
 default: return 'bg-slate-100 text-slate-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700/80'
 }
}
function HarmonizedDeleteModal({ isOpen, onClose, onConfirm, item, isSubmitting }) {
 const cnt = item?.ujian_count || 0
 return (
 <AppModal
 isOpen={Boolean(isOpen && item)}
 onClose={onClose}
 title="Hapus Kisi-kisi?"
 badge="Hapus Permanen"
 icon={Trash2}
 variant="danger"
 maxWidth="max-w-md"
 zIndex={70}
 disableBackdropClose={isSubmitting}
 footer={
 <>
 <button
 type="button"
 onClick={onClose}
 disabled={isSubmitting}
 className="h-9 px-4 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white text-xs font-bold text-slate-700 hover:bg-white hover:bg-emerald-50/60 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={onConfirm}
 disabled={isSubmitting}
 className="h-9 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm transition cursor-pointer disabled:opacity-50"
 >
 {isSubmitting ? 'Menghapus...' : 'Ya, Hapus'}
 </button>
 </>
 }
 >
 {item && (
 <>
 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
 Apakah Anda yakin ingin menghapus kisi-kisi <strong className="text-slate-900 dark:text-white">"{item.judul_kisi || 'ini'}"</strong>?
 </p>
 {cnt > 0 && (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 p-3 dark:border-emerald-800/60 dark:bg-rose-950/20">
 <div className="flex items-start gap-2">
 <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
 <p className="text-xs text-rose-800 dark:text-rose-300">
 Perhatian: Kisi-kisi ini masih dipakai di {cnt} ujian aktif. Menghapus data ini dapat berdampak pada konfigurasi ujian terkait.
 </p>
 </div>
 </div>
 )}
 </>
 )}
 </AppModal>
 )
}

// ── HEROUI MODAL SELECT DROPDOWN COMPONENT ──
function HeroUiModalSelect({
 label,
 value,
 onChange,
 options = [],
 placeholder = '-- Pilih Opsi --',
 disabled = false,
 required = false,
 helperText = '',
 icon: IconComponent = null,
 searchable = false,
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
 return options.filter(
 (opt) =>
 (opt.label && String(opt.label).toLowerCase().includes(q)) ||
 (opt.subtext && String(opt.subtext).toLowerCase().includes(q))
 )
 }, [options, search, searchable])

 return (
 <div className="relative w-full" ref={containerRef}>
 {label && (
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
 {label} {required && <span className="text-rose-500">*</span>}
 </label>
 )}

 {/* Button Trigger HeroUI */}
 <button
 type="button"
 disabled={disabled}
 onClick={() => {
 if (!disabled) {
 setIsOpen((prev) => !prev)
 setSearch('')
 }
 }}
 className={`w-full flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition-all duration-200 text-left cursor-pointer ${
 disabled
 ? 'bg-slate-100 dark:bg-slate-800/60 border-emerald-200/80 dark:border-emerald-800/60 text-slate-400 cursor-not-allowed'
 : isOpen
 ? 'border-[#059669] bg-white ring-4 ring-[#059669]/12 dark:border-[#10B981] dark:bg-slate-900 dark:ring-[#10B981]/20 text-slate-800 dark:text-slate-100 shadow-sm'
 : 'border-emerald-200/80 bg-slate-50/50 hover:bg-white hover:border-emerald-300 dark:border-emerald-700/80/80 dark:bg-slate-900/50 dark:hover:bg-slate-900 dark:hover:border-emerald-600/80 text-slate-800 dark:text-slate-100'
 }`}
 >
 <div className="flex items-center gap-2 truncate">
 {IconComponent && (
 <IconComponent className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
 )}
 {selectedOption ? (
 <span className="truncate">{selectedOption.label}</span>
 ) : (
 <span className="text-slate-400 dark:text-slate-500 truncate">{placeholder}</span>
 )}
 </div>
 <ChevronDown
 className={`size-4 text-slate-400 dark:text-slate-500 shrink-0 transition-transform duration-200 ${
 isOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
 }`}
 />
 </button>

 {/* Dropdown Popover Panel HeroUI */}
 <AnimatePresence>
 {isOpen && (
 <motion.div
 initial={{ opacity: 0, scale: 0.96, y: -4 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.96, y: -4 }}
 transition={{ duration: 0.15, ease: 'easeOut' }}
 className="absolute left-0 right-0 top-full mt-1.5 z-[90] overflow-hidden rounded-xl border border-emerald-200/80 bg-white/95 backdrop-blur-md shadow-2xl dark:border-emerald-700/80/80 dark:bg-[#182232]/95"
 >
 {/* Search Input jika searchable */}
 {searchable && options.length > 5 && (
 <div className="p-2 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="relative">
 <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Ketik untuk mencari..."
 className="w-full rounded-lg border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-slate-50/60 pl-8 pr-2.5 py-1.5 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#059669] focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-100"
 autoFocus
 />
 </div>
 </div>
 )}

 {/* List options */}
 <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
 {filteredOptions.length === 0 ? (
 <div className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">
 Tidak ada data yang cocok
 </div>
 ) : (
 filteredOptions.map((opt) => {
 const isSelected = String(opt.value) === String(value)
 return (
 <button
 key={opt.value}
 type="button"
 disabled={opt.disabled}
 onClick={() => {
 onChange(opt.value)
 setIsOpen(false)
 }}
 className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-colors text-left cursor-pointer ${
 isSelected
 ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
 : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
 }`}
 >
 <div className="truncate pr-2">
 <div>{opt.label}</div>
 {opt.subtext && (
 <div className="text-[10px] text-slate-400 font-normal">{opt.subtext}</div>
 )}
 </div>
 {isSelected && (
 <Check className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
 )}
 </button>
 )
 })
 )}
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {helperText && (
 <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
 {helperText}
 </p>
 )}
 </div>
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
 popoverWidth = 'min-w-[180px]',
 searchable = false,
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
 opt.label && String(opt.label).toLowerCase().includes(q)
 )
 }, [options, search, searchable])

 return (
 <div className={`relative ${className}`} ref={containerRef}>
 <button
 type="button"
 onClick={() => {
 setIsOpen((prev) => !prev)
 setSearch('')
 }}
 className={`h-9 w-full sm:w-auto min-w-[140px] flex items-center justify-between gap-2 rounded-lg border px-3 text-xs font-semibold transition-all duration-200 cursor-pointer ${
 isOpen
 ? 'border-[#059669] bg-white ring-2 ring-[#059669]/15 dark:border-[#10B981] dark:bg-[#111827] dark:ring-[#10B981]/20 text-slate-900 dark:text-white shadow-xs'
 : value !== '' && value !== undefined && value !== null
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 text-emerald-900 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-200'
 : 'border-emerald-200/80 bg-white text-slate-800 hover:border-emerald-300 dark:border-emerald-700/80 dark:bg-[#111827] dark:text-slate-100 dark:hover:border-emerald-600/80'
 }`}
 >
 <div className="flex items-center gap-1.5 truncate">
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
 initial={{ opacity: 0, scale: 0.96, y: -4 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.96, y: -4 }}
 transition={{ duration: 0.15, ease: 'easeOut' }}
 className={`absolute left-0 top-full mt-1.5 z-[90] ${popoverWidth} overflow-hidden rounded-xl border border-emerald-200/80 bg-white/95 backdrop-blur-md shadow-2xl dark:border-emerald-700/80/80 dark:bg-[#182232]/95`}
 >
 {searchable && options.length > 5 && (
 <div className="p-2 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="relative">
 <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Cari..."
 className="w-full rounded-lg border-2 border-[#b6f6d9] dark:border-emerald-800/60 bg-slate-50/60 pl-8 pr-2.5 py-1 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-[#059669] focus:outline-none dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-100"
 autoFocus
 />
 </div>
 </div>
 )}

 <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5">
 {filteredOptions.length === 0 ? (
 <div className="px-3 py-3 text-center text-xs text-slate-400 dark:text-slate-500">
 Tidak ada data
 </div>
 ) : (
 filteredOptions.map((opt) => {
 const isSelected = String(opt.value) === String(value)
 return (
 <button
 key={opt.value}
 type="button"
 onClick={() => {
 onChange(opt.value)
 setIsOpen(false)
 }}
 className={`w-full flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors text-left cursor-pointer ${
 isSelected
 ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold'
 : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300'
 }`}
 >
 <span className="truncate pr-2">{opt.label}</span>
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

export default function LmsKisiKisiPage({ embedded, hidePageHeader, tabNav, onNavigateToBankSoal }) {
 const navigate = useNavigate()
 const user = useAuthStore((s) => s.user)
 const activeUnit = useUnitStore((s) => s.activeUnit)
 const customLabels = usePengaturanStore((s) => s.customLabels)
 const ujianLabels = customLabels?.ujian || {}

 const getJenisLabel = (j) => {
 switch (j) {
 case 'UH': return ujianLabels.singkatan_uh || 'UH'
 case 'PTS': case 'UTS': return ujianLabels.singkatan_pts || 'PTS'
 case 'PAS': case 'UAS': return ujianLabels.singkatan_pas || 'PAS'
 case 'CBT': return ujianLabels.singkatan_cbt || 'CBT'
 case 'Remedial': return ujianLabels.singkatan_remedial || 'Remedial'
 default: return j || '-'
 }
 }

 const getJenisFullName = (j) => {
 switch (j) {
 case 'UH': return ujianLabels.jenis_uh || 'Ulangan Harian (UH)'
 case 'PTS': case 'UTS': return ujianLabels.jenis_pts || 'Penilaian Tengah Semester (PTS)'
 case 'PAS': case 'UAS': return ujianLabels.jenis_pas || 'Penilaian Akhir Semester (PAS)'
 case 'CBT': return ujianLabels.jenis_cbt || 'Computer Based Test (CBT)'
 case 'Remedial': return ujianLabels.jenis_remedial || 'Ujian Remedial'
 default: return j || '-'
 }
 }

 const getKognitifLabel = (k) => {
 if (!k) return ''
 if (k.startsWith('C1')) return ujianLabels.kognitif_c1 || k
 if (k.startsWith('C2')) return ujianLabels.kognitif_c2 || k
 if (k.startsWith('C3')) return ujianLabels.kognitif_c3 || k
 if (k.startsWith('C4')) return ujianLabels.kognitif_c4 || k
 if (k.startsWith('C5')) return ujianLabels.kognitif_c5 || k
 if (k.startsWith('C6')) return ujianLabels.kognitif_c6 || k
 return k
 }

 const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, item: null, isSubmitting: false })

 const handleGoToBankSoal = (item) => {
 if (item?.id) {
 sessionStorage.setItem('bankSoal_prefill_kisi_id', item.id)
 sessionStorage.setItem('bankSoal_prefill_kisi_judul', item.judul_kisi || '')
 sessionStorage.setItem('bankSoal_prefill_mapel_id', item.mata_pelajaran_id || '')
 }
 if (typeof onNavigateToBankSoal === 'function') {
 onNavigateToBankSoal(item)
 return
 }
 navigate(`/dashboard/lms/bank-soal?kisi_id=${item?.id || ''}`)
 }

 const userUnitId = useMemo(() => {
 const c = [user?.unit_id, user?.unit_pendidikan_id, user?.education_unit_id, user?.unit?.id, user?.education_unit?.id, user?.unit_pendidikan?.id, user?.employee?.unit_id, user?.employee?.unit_pendidikan_id, user?.employee?.education_unit_id, user?.school_info?.id].filter(Boolean)
 return c.length > 0 ? String(c[0]) : null
 }, [user])

 const userEmployeeId = useMemo(() => {
 const c = [user?.employee_id, user?.employee?.id, user?.unit?.employee_id].filter(Boolean)
 return c.length > 0 ? String(c[0]) : null
 }, [user])

 const userRoles = useMemo(() => {
 const rawRoles = user?.roles || []
 return rawRoles.map((r) => (typeof r === 'string' ? r : r?.name || '')).filter(Boolean)
 }, [user])

 const isSuperAdminOrYayasan = useMemo(() => {
 return userRoles.some((r) => ['super_admin', 'Super Admin', 'super-admin', 'yayasan', 'Yayasan', 'pengurus_yayasan', 'ketua_yayasan'].includes(r))
 }, [userRoles])

 const isDivisiPendidikan = useMemo(() => {
 return userRoles.some((r) => ['Divisi Pendidikan', 'divisi_pendidikan', 'divisi-pendidikan', 'Kepala Bidang Pendidikan', 'kepala_bidang_pendidikan', 'Divisi Kurikulum', 'Divisi Kesiswaan'].includes(r))
 }, [userRoles])

 const canSelectUnit = isSuperAdminOrYayasan || isDivisiPendidikan
 const userUnitName = user?.unit_name || user?.employee?.unit?.nama_unit || user?.employee?.unit?.name || 'Unit Anda'

 const isAdminOrKurikulum = useMemo(() => {
 const normalized = userRoles.map((r) => r.toLowerCase().replace(/[\s_-]+/g, ''))
 return normalized.some((r) =>
 ['superadmin', 'yayasan', 'ketuayayasan', 'pengurusyayasan', 'sekretarisyayasan', 'bendaharayayasan', 'kepalasekolah', 'tatausaha', 'tu', 'divisipendidikan', 'wakakurikulum', 'kurikulum'].includes(r)
 )
 }, [userRoles])

 const currentTeacherName = useMemo(() => {
 return user?.employee?.nama_lengkap || user?.name || user?.username || 'Anda'
 }, [user])

 const [dataList, setDataList] = useState([])
 const [loading, setLoading] = useState(true)
 const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
 const [stats, setStats] = useState({ total: 0, aktif: 0, nonaktif: 0, total_soal_target: 0, uh: 0, pts: 0, pas: 0 })
 const [loadingOptions, setLoadingOptions] = useState(false)
 const [options, setOptions] = useState({ subjects: [], kurikulum: [], kelas: [], semesters: [], tahun_ajaran: [], guru: [], capaian_pembelajaran: [], tujuan_pembelajaran: [], jenis_ujian_options: [], level_kognitif_options: [], units: [] })
 const [selectedUnit, setSelectedUnit] = useState(canSelectUnit ? '' : (userUnitId ? String(userUnitId) : ''))
 const [filters, setFilters] = useState({ search: '', mata_pelajaran_id: '', jenis_ujian: '', status: '', kelas_id: '', semester_id: '' })
 const [searchInput, setSearchInput] = useState('')
 const debouncedSearch = useDebounce(searchInput, 350)

 useEffect(() => {
 setFilters((p) => ({ ...p, search: debouncedSearch }))
 }, [debouncedSearch])

 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [kpiModalKey, setKpiModalKey] = useState(null)
 const [importOpen, setImportOpen] = useState(false)
 const [showModal, setShowModal] = useState(false)
 const [editingItem, setEditingItem] = useState(null)
 const [viewingItem, setViewingItem] = useState(null)
 const [rowDetailItem, setRowDetailItem] = useState(null)
 const [showRowDetailModal, setShowRowDetailModal] = useState(false)
 const [distribusiError, setDistribusiError] = useState('')
 const [formData, setFormData] = useState({
 judul_kisi: '', mata_pelajaran_id: '', cp_id: '', tp_id: '', kurikulum_id: '',
 kelas_id: '', semester_id: '', tahun_ajaran_id: '', guru_id: '',
 jenis_ujian: '', jumlah_soal: 20, alokasi_waktu_menit: 60,
 kompetensi_dasar: '', level_kognitif: '',
 distribusi_bobot: {}, status: true,
 })

 useEffect(() => { fetchStats(); fetchOptions() }, [userUnitId, activeUnit, selectedUnit])
 useEffect(() => { fetchData(1) }, [filters, userUnitId, activeUnit, selectedUnit])

 // Auto-set default jenis_ujian dan level_kognitif dari opsi pertama backend
 useEffect(() => {
 if (options.jenis_ujian_options.length > 0 && !formData.jenis_ujian) {
 setFormData((p) => ({ ...p, jenis_ujian: options.jenis_ujian_options[0].id }))
 }
 }, [options.jenis_ujian_options])

 useEffect(() => {
 if (options.level_kognitif_options.length > 0 && !formData.level_kognitif) {
 setFormData((p) => ({ ...p, level_kognitif: options.level_kognitif_options[0].id }))
 }
 }, [options.level_kognitif_options])

 const showNotification = (msg, type = 'success') => {
 setToast({ show: true, message: msg, type })
 setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
 }

 const fetchData = async (page = 1) => {
 setLoading(true)
 try {
 const params = { page, per_page: 10, ...filters }
 const effectiveUnit = canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined)
 if (effectiveUnit) params.unit_pendidikan_id = effectiveUnit
 if (activeUnit) params.jenjang = activeUnit
 const response = await lmsKisiKisiService.getDaftar(params)
 if (response?.data) {
 let raw = Array.isArray(response.data) ? response.data : (response.data?.data || [])
 let filtered = raw.filter((item) => {
 if (!item) return false
 const iUnit = item.unit_pendidikan_id || item.unit_id || item.mata_pelajaran?.unit_pendidikan_id
 if (!canSelectUnit && userUnitId && iUnit) return String(iUnit) === String(userUnitId)
 if (canSelectUnit && selectedUnit && iUnit) return String(iUnit) === String(selectedUnit)
 return true
 })
 setDataList(filtered)
 setPagination({ currentPage: response.meta?.current_page || 1, lastPage: response.meta?.last_page || 1, total: response.meta?.total || filtered.length })
 }
 } catch (err) { console.error('Gagal mengambil data kisi-kisi:', err); showNotification('Gagal memuat data kisi-kisi ujian.', 'error') }
 finally { setLoading(false) }
 }

 const fetchStats = async () => {
 try {
 const params = {}
 const effectiveUnit = canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined)
 if (effectiveUnit) params.unit_pendidikan_id = effectiveUnit
 if (activeUnit) params.jenjang = activeUnit
 const res = await lmsKisiKisiService.getStats(params)
 if (res?.data) setStats(res.data)
 } catch (err) { console.error('Gagal stats:', err) }
 }

 const fetchOptions = async (mapelId = null, cpId = null) => {
 setLoadingOptions(true)
 try {
 const params = {}
 const effectiveUnit = canSelectUnit ? (selectedUnit || undefined) : (userUnitId || undefined)
 if (effectiveUnit) params.unit_pendidikan_id = effectiveUnit
 if (activeUnit) params.jenjang = activeUnit
 if (mapelId) params.mata_pelajaran_id = mapelId
 if (cpId) params.cp_id = cpId

 const resOpts = await lmsKisiKisiService.getOptions(params)
 const resData = resOpts?.data?.data ?? resOpts?.data ?? resOpts ?? {}

 const rawSubjects = resData.subjects ?? resData.mata_pelajaran ?? resData.mata_pelajarans
 const subjects = normalizeArray(rawSubjects).filter((s) => {
 if (!s) return false
 const sU = s.unit_pendidikan_id || s.unit_id
 if (!canSelectUnit && userUnitId && sU) return String(sU) === String(userUnitId)
 if (canSelectUnit && selectedUnit && sU) return String(sU) === String(selectedUnit)
 return true
 })

 const rawKelas = resData.kelas
 const kelas = normalizeArray(rawKelas).filter((k) => {
 if (!k) return false
 const kU = k.unit_pendidikan_id || k.unit_id
 if (!canSelectUnit && userUnitId && kU) return String(kU) === String(userUnitId)
 if (canSelectUnit && selectedUnit && kU) return String(kU) === String(selectedUnit)
 return true
 })

 setOptions((prev) => ({
 ...prev,
 units: resData.units !== undefined ? normalizeArray(resData.units) : prev.units,
 subjects: rawSubjects !== undefined ? subjects : prev.subjects,
 kurikulum: resData.kurikulum !== undefined ? normalizeArray(resData.kurikulum) : prev.kurikulum,
 kelas: rawKelas !== undefined ? kelas : prev.kelas,
 semesters: resData.semesters !== undefined ? normalizeArray(resData.semesters) : prev.semesters,
 tahun_ajaran: resData.tahun_ajaran !== undefined ? normalizeArray(resData.tahun_ajaran) : prev.tahun_ajaran,
 guru: resData.guru !== undefined ? normalizeArray(resData.guru) : prev.guru,
 capaian_pembelajaran: (resData.capaian_pembelajaran !== undefined || resData.cp !== undefined) ? normalizeArray(resData.capaian_pembelajaran ?? resData.cp) : prev.capaian_pembelajaran,
 tujuan_pembelajaran: (resData.tujuan_pembelajaran !== undefined || resData.tp !== undefined) ? normalizeArray(resData.tujuan_pembelajaran ?? resData.tp) : prev.tujuan_pembelajaran,
 jenis_ujian_options: resData.jenis_ujian_options !== undefined ? normalizeArray(resData.jenis_ujian_options) : prev.jenis_ujian_options,
 level_kognitif_options: resData.level_kognitif_options !== undefined ? normalizeArray(resData.level_kognitif_options) : prev.level_kognitif_options,
 }))
 } catch (err) { console.error('Gagal opsi:', err) }
 finally { setLoadingOptions(false) }
 }

 const handleMataPelajaranChange = async (mapelId) => {
 setFormData((p) => ({ ...p, mata_pelajaran_id: mapelId, cp_id: '', tp_id: '' }))
 setOptions((p) => ({ ...p, capaian_pembelajaran: [], tujuan_pembelajaran: [] }))
 if (!mapelId) return
 await fetchOptions(mapelId, null)
 }

 const handleCpChange = async (cpId) => {
 const selectedCp = options.capaian_pembelajaran.find((c) => String(c.id) === String(cpId))
 setFormData((p) => ({
 ...p,
 cp_id: cpId,
 tp_id: '',
 kompetensi_dasar: p.kompetensi_dasar || selectedCp?.deskripsi || selectedCp?.nama_cp || p.kompetensi_dasar,
 }))
 setOptions((p) => ({ ...p, tujuan_pembelajaran: [] }))
 if (!cpId) return
 await fetchOptions(formData.mata_pelajaran_id, cpId)
 }

 const handleDistribusiChange = (key, val) => {
 const updated = { ...formData.distribusi_bobot, [key]: Number(val) }
 const total = (updated.pg || 0) + (updated.isian || 0) + (updated.esai || 0)
 setDistribusiError(total !== 100 ? `Total bobot harus 100%. Saat ini: ${total}%` : '')
 setFormData((p) => ({ ...p, distribusi_bobot: updated }))
 }

 const handleOpenModal = (item = null) => {
 setDistribusiError('')
 if (item) {
 setEditingItem(item)
 setFormData({
 judul_kisi: item.judul_kisi || '', mata_pelajaran_id: item.mata_pelajaran_id || '',
 cp_id: item.cp_id || '', tp_id: item.tp_id || '', kurikulum_id: item.kurikulum_id || '',
 kelas_id: item.kelas_id || '', semester_id: item.semester_id || '',
 tahun_ajaran_id: item.tahun_ajaran_id || '', guru_id: item.guru_id || userEmployeeId || '',
 jenis_ujian: item.jenis_ujian || '', jumlah_soal: item.jumlah_soal || 20,
 alokasi_waktu_menit: item.alokasi_waktu_menit || 60, kompetensi_dasar: item.kompetensi_dasar || '',
 level_kognitif: item.level_kognitif || '',
 distribusi_bobot: item.distribusi_bobot || {},
 status: item.status !== undefined ? item.status : true,
 })
 fetchOptions(item.mata_pelajaran_id || null, item.cp_id || null)
 } else {
 setEditingItem(null)
 setFormData({
 judul_kisi: '', mata_pelajaran_id: '', cp_id: '', tp_id: '',
 kurikulum_id: '', kelas_id: '', semester_id: '', tahun_ajaran_id: '',
 guru_id: userEmployeeId || '',
 jenis_ujian: '',
 jumlah_soal: 20, alokasi_waktu_menit: 60, kompetensi_dasar: '',
 level_kognitif: '', distribusi_bobot: {}, status: true,
 })
 fetchOptions(null, null)
 }
 setShowModal(true)
 }

 const handleSubmit = async (e) => {
 e.preventDefault()
 if (!formData.judul_kisi?.trim()) {
 showNotification('Judul Kisi-kisi Ujian wajib diisi.', 'error')
 return
 }
 if (!formData.mata_pelajaran_id) {
 showNotification('Mata Pelajaran wajib dipilih.', 'error')
 return
 }
 if (!formData.jenis_ujian) {
 showNotification('Jenis Ujian wajib dipilih.', 'error')
 return
 }
 const { pg = 0, isian = 0, esai = 0 } = formData.distribusi_bobot || {}
 const totalBobot = pg + isian + esai
 if (totalBobot > 0 && totalBobot !== 100) { setDistribusiError(`Total bobot harus 100%. Saat ini: ${totalBobot}%`); return }
 try {
 const payload = {
 ...formData,
 guru_id: (!isAdminOrKurikulum && userEmployeeId) ? userEmployeeId : formData.guru_id,
 }
 if (editingItem) { await lmsKisiKisiService.update(editingItem.id, payload); showNotification('Kisi-kisi Ujian berhasil diperbarui.') }
 else { await lmsKisiKisiService.create(payload); showNotification('Kisi-kisi Ujian berhasil dibuat.') }
 setShowModal(false); fetchData(pagination.currentPage); fetchStats()
 } catch (err) { showNotification(err?.response?.data?.message || 'Gagal menyimpan kisi-kisi ujian.', 'error') }
 }

 const handleDelete = (id, item) => {
 setDeleteModal({ isOpen: true, id, item, isSubmitting: false })
 }

 const confirmDelete = async () => {
 if (!deleteModal.id) return
 setDeleteModal((prev) => ({ ...prev, isSubmitting: true }))
 try {
 await lmsKisiKisiService.delete(deleteModal.id)
 showNotification('Kisi-kisi Ujian berhasil dihapus.')
 fetchData(pagination.currentPage)
 fetchStats()
 } catch (err) {
 showNotification('Gagal menghapus kisi-kisi.', 'error')
 } finally {
 setDeleteModal({ isOpen: false, id: null, item: null, isSubmitting: false })
 }
 }

 const handleDuplicate = async (id) => {
 try { await lmsKisiKisiService.duplicate(id); showNotification('Kisi-kisi Ujian berhasil diduplikasi.'); fetchData(pagination.currentPage); fetchStats() }
 catch (err) { showNotification('Gagal menduplikasi.', 'error') }
 }

 const handleExportCSV = () => {
 if (!dataList.length) return
 const headers = ['Judul Kisi-kisi', 'Mapel', 'Jenis Ujian', 'Jumlah Soal', 'Soal Tersedia', 'Status']
 const rows = dataList.map((i) => [`"${(i.judul_kisi || '').replace(/"/g, '""')}"`, `"${(i.mata_pelajaran?.name || '').replace(/"/g, '""')}"`, i.jenis_ujian || '-', i.jumlah_soal || 0, i.bank_soal_count ?? 0, i.status ? 'Aktif' : 'Nonaktif'])
 const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
 const link = document.createElement('a'); link.href = encodeURI(csv); link.download = `kisi_kisi_ujian_${new Date().toISOString().slice(0, 10)}.csv`; document.body.appendChild(link); link.click(); document.body.removeChild(link)
 }

 const resetFilters = () => {
 if (canSelectUnit) setSelectedUnit('')
 setSearchInput('')
 setFilters({ search: '', mata_pelajaran_id: '', jenis_ujian: '', status: '', kelas_id: '', semester_id: '' })
 fetchData(1)
 }
 const hasActiveFilter = Boolean((canSelectUnit && selectedUnit) || filters.search || filters.mata_pelajaran_id || filters.jenis_ujian || filters.status || filters.kelas_id || filters.semester_id || searchInput)

 const dropdownCls = 'h-9 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-xs font-semibold text-slate-700 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-[#111827] dark:text-slate-100 transition-all'
 const inputCls = 'w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-600 outline-none transition'
 const labelCls = 'block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5'


  // Canonical Columns for Kisi-kisi Ujian
  const kisiKisiColumns = useMemo(() => [
    {
      key: 'judul_kisi',
      label: 'Judul & Mata Pelajaran',
      render: (item) => {
        const ujianCount = item?.ujian_count ?? 0
        return (
          <div>
            <div className="font-semibold text-slate-800 dark:text-white leading-snug">{item?.judul_kisi}</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">{item?.mata_pelajaran?.name || 'Mata Pelajaran N/A'}</div>
            {(item?.kelas || item?.semester) && (
              <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                {item.kelas && <span>{item.kelas.nama_kelas || item.kelas.tingkat}</span>}
                {item.kelas && item.semester && <span>·</span>}
                {item.semester && <span>{item.semester.nama_semester || item.semester.name}</span>}
              </div>
            )}
            {ujianCount > 0 && (
              <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-amber-50 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/30">
                <ShieldAlert className="w-2.5 h-2.5 text-amber-500" />
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">Dipakai di {ujianCount} ujian</span>
              </div>
            )}
          </div>
        )
      },
    },
    {
      key: 'cp_tp',
      label: 'Capaian (CP / TP)',
      width: '180px',
      render: (item) => (
        <div>
          {item?.cp ? (
            <div className="inline-block px-2 py-0.5 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-md text-xs font-medium mb-1 border border-emerald-200/80 dark:border-emerald-800/60">
              {item.cp.kode_cp ? `CP: ${item.cp.kode_cp}` : item.cp.nama_cp}
            </div>
          ) : <div className="text-xs text-slate-400 italic">CP belum ditentukan</div>}
          {item?.tp && <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">TP: {item.tp.kode_tp || item.tp.nama_tp}</div>}
        </div>
      ),
    },
    {
      key: 'jenis_ujian',
      label: 'Jenis & Kognitif',
      render: (item) => (
        <div>
          <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getJenisBadgeColor(item?.jenis_ujian)}`}>
            {getJenisLabel(item?.jenis_ujian)}
          </span>
          {item?.level_kognitif && (
            <div className="text-[10px] text-slate-400 mt-1">
              {getKognitifLabel(item.level_kognitif)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'jumlah_soal',
      label: 'Soal / Durasi',
      render: (item) => (
        <div>
          <div className="font-bold text-slate-800 dark:text-white text-sm">{item?.jumlah_soal} Soal</div>
          <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /><span>{item?.alokasi_waktu_menit} Menit</span></div>
        </div>
      ),
    },
    {
      key: 'kelengkapan',
      label: 'Kelengkapan Soal',
      width: '140px',
      render: (item) => {
        const bankCount = item?.bank_soal_count ?? 0
        return (
          <div>
            <SoalProgressBar current={bankCount} target={item?.jumlah_soal || 0} />
            {bankCount < (item?.jumlah_soal || 0) && (
              <button
                type="button"
                data-no-rowclick
                onClick={(e) => { e.stopPropagation(); handleGoToBankSoal(item) }}
                className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                <Plus className="w-3 h-3" />Tambah Soal<ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (item) => (
        item?.status
          ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-full text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Aktif</span>
          : <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-500 dark:bg-sky-950/60 dark:text-sky-300 rounded-full text-xs font-medium"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Nonaktif</span>
      ),
    },
  ], [options])

 return (
 <PageContainer maxW="7xl">
 {/* Breadcrumb Terpadu */}
 {!embedded && (
 <div className="mb-4">
 <AppBreadcrumb
 items={[
 { label: 'LMS', href: '/dashboard/lms' },
 { label: 'Kisi-kisi Ujian', href: '/dashboard/lms/kisi-kisi' },
 ]}
 pageTitle="Kisi-kisi Ujian"
 />
 </div>
 )}

 <div className="lms-kisi-kisi-page space-y-6 pb-12">
 {/* Modern Hero Header Card */}
        {!embedded && !hidePageHeader && (
          <div className="mb-6">
            <HeroUiHeader
              title="Kisi-kisi Ujian (Exam Blueprint)"
              subtitle="Cetak biru penyelarasan CP, TP, dan Taksonomi Bloom — fondasi utama sebelum menyusun Bank Soal & CBT."
              badge="Evaluasi & Penilaian LMS"
              icon={FileText}
            />
          </div>
        )}

 {/* Modern Multi-Tone KPI Summary Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
 <ModernKpiCard
 icon={FileText}
 label="Total Kisi-kisi"
 value={stats.total}
 tag="Semua"
 subtext={`${stats.aktif} Status Aktif`}
 tone="emerald"
 active={filters.jenis_ujian === '' && filters.status === ''}
 onClick={() => setKpiModalKey('total')}
 />
 <ModernKpiCard
 icon={Target}
 label="Target Butir Soal"
 value={stats.total_soal_target}
 tag="Target Soal"
 subtext="Soal direncanakan"
 tone="blue"
 onClick={() => setKpiModalKey('target_soal')}
 />
 <ModernKpiCard
 icon={BookOpen}
 label={`Kisi-kisi ${getJenisLabel('UH')}`}
 value={stats.uh}
 tag="Ulangan Harian"
 subtext={getJenisFullName('UH')}
 tone="purple"
 active={filters.jenis_ujian === 'UH'}
 onClick={() => setKpiModalKey('uh')}
 />
 <ModernKpiCard
 icon={Award}
 label={`${getJenisLabel('PTS')} & ${getJenisLabel('PAS')}`}
 value={(stats.pts || 0) + (stats.pas || 0)}
 tag="Ujian Semester"
 subtext="Asesmen Berkala"
 tone="amber"
 active={filters.jenis_ujian === 'PTS'}
 onClick={() => setKpiModalKey('pts_pas')}
 />
 </div>

 {/* Tab Nav (if provided) */}
 {tabNav && <div>{typeof tabNav === 'function' ? tabNav() : tabNav}</div>}

 {/* Master Datatable Panel (Canonical Emerald Datatable Container) */}
        <AppDataTable
          id="tabel-kisi-kisi-ujian"
          title="Daftar Kisi-kisi Ujian"
          subtitle="Indikator kelengkapan butir soal aktual vs target ditampilkan di setiap baris."
          icon={FileText}
          countLabel={`${pagination.total} Total`}
          actions={
            <PageToolbarActions
              onImport={() => setImportOpen(true)}
              onExport={handleExportCSV}
              onPrint={() => setIsPrintModalOpen(true)}
              primaryAction={{
                label: 'Buat Kisi-kisi Baru',
                onClick: () => handleOpenModal(),
              }}
            />
          }
          search={searchInput}
          onSearchChange={(e) => setSearchInput(e.target.value)}
          searchPlaceholder="Cari judul kisi-kisi, indikator CP/TP, KD, atau level kognitif..."
          filters={
            <div className="flex flex-wrap items-center gap-2 w-full">
              {canSelectUnit ? (
                <HeroUiFilterSelect
                  value={selectedUnit}
                  onChange={(val) => setSelectedUnit(val)}
                  placeholder={`Semua Unit (${options.units?.length || 'SIT'})`}
                  icon={School}
                  popoverWidth="min-w-[220px]"
                  searchable={options.units?.length > 5}
                  options={[
                    { value: '', label: `Semua Unit (${options.units?.length || 'SIT'})` },
                    ...(options.units || []).map((u) => ({ value: String(u.id), label: u.name || u.nama_unit })),
                  ]}
                />
              ) : (
                <div
                  title="Terkunci: Menampilkan data khusus unit wewenang Anda"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-200"
                >
                  <School className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>{userUnitName}</span>
                  <Lock className="size-3 text-emerald-500 ml-0.5 opacity-80" />
                </div>
              )}

              <HeroUiFilterSelect
                value={filters.mata_pelajaran_id}
                onChange={(val) => setFilters((p) => ({ ...p, mata_pelajaran_id: val }))}
                placeholder="Semua Mata Pelajaran"
                icon={BookOpen}
                popoverWidth="min-w-[240px]"
                searchable
                options={[
                  { value: '', label: 'Semua Mata Pelajaran' },
                  ...options.subjects.map((s) => ({ value: s.id, label: getSubjectLabel(s) })),
                ]}
              />

              <HeroUiFilterSelect
                value={filters.jenis_ujian}
                onChange={(val) => setFilters((p) => ({ ...p, jenis_ujian: val }))}
                placeholder="Semua Jenis Ujian"
                icon={Target}
                popoverWidth="min-w-[220px]"
                options={[
                  { value: '', label: 'Semua Jenis Ujian' },
                  ...(options.jenis_ujian_options.length > 0
                    ? options.jenis_ujian_options.map((j) => ({ value: j.id, label: getJenisFullName(j.id) || j.nama }))
                    : [
                        { value: 'UH', label: getJenisFullName('UH') },
                        { value: 'PTS', label: getJenisFullName('PTS') },
                        { value: 'PAS', label: getJenisFullName('PAS') },
                        { value: 'CBT', label: getJenisFullName('CBT') },
                        { value: 'Remedial', label: getJenisFullName('Remedial') },
                      ]),
                ]}
              />

              <HeroUiFilterSelect
                value={filters.kelas_id}
                onChange={(val) => setFilters((p) => ({ ...p, kelas_id: val }))}
                placeholder="Semua Kelas"
                icon={Layers}
                popoverWidth="min-w-[170px]"
                options={[
                  { value: '', label: 'Semua Kelas' },
                  ...options.kelas.map((k) => ({ value: k.id, label: k.nama_kelas || k.tingkat || k.nama })),
                ]}
              />

              <HeroUiFilterSelect
                value={filters.semester_id}
                onChange={(val) => setFilters((p) => ({ ...p, semester_id: val }))}
                placeholder="Semua Semester"
                popoverWidth="min-w-[160px]"
                options={[
                  { value: '', label: 'Semua Semester' },
                  ...options.semesters.map((s) => ({ value: s.id, label: s.name || s.nama || s.nama_semester })),
                ]}
              />

              <HeroUiFilterSelect
                value={filters.status}
                onChange={(val) => setFilters((p) => ({ ...p, status: val }))}
                placeholder="Semua Status"
                popoverWidth="min-w-[150px]"
                options={[
                  { value: '', label: 'Semua Status' },
                  { value: '1', label: 'Aktif' },
                  { value: '0', label: 'Nonaktif' },
                ]}
              />

              {hasActiveFilter && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-emerald-600 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 transition-colors ml-auto font-medium"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>
          }
          columns={kisiKisiColumns}
          data={dataList}
          isLoading={loading}
          page={pagination.currentPage}
          totalPages={pagination.lastPage}
          onPageChange={fetchData}
          onRowClick={(item) => {
            setRowDetailItem(item)
            setShowRowDetailModal(true)
          }}
          onView={(item) => {
            setViewingItem(item)
            setShowRowDetailModal(true)
            setRowDetailItem(item)
          }}
          onEdit={(item) => handleOpenModal(item)}
          onDelete={(item) => handleDelete(item.id, item)}
          extraItems={(item) => [
            { label: 'Duplikasi Kisi-kisi', icon: Copy, onClick: () => handleDuplicate(item?.id) },
            { label: 'Buat Soal dari Kisi ini', icon: ChevronRight, onClick: () => handleGoToBankSoal(item) },
          ]}
          renderMobileCard={(item) => {
            const bankCount = item?.bank_soal_count ?? 0
            return (
              <MobileDataCard
                key={item?.id}
                title={item?.judul_kisi || 'Kisi-kisi'}
                subtitle={`${item?.mata_pelajaran?.name || 'Mata Pelajaran N/A'} • ${getJenisLabel(item?.jenis_ujian)}`}
                badge={item?.status ? 'Aktif' : 'Nonaktif'}
                badgeVariant={item?.status ? 'success' : 'neutral'}
                fields={[
                  { label: 'Kelas', value: item?.kelas?.nama_kelas || item?.kelas?.tingkat || '-', icon: Layers },
                  { label: 'Jumlah Soal', value: `${bankCount}/${item?.jumlah_soal || 0} Soal`, icon: Target },
                  { label: 'Durasi', value: `${item?.alokasi_waktu_menit || 0} Menit`, icon: Clock },
                ]}
                onView={() => {
                  setViewingItem(item)
                  setShowRowDetailModal(true)
                  setRowDetailItem(item)
                }}
                onEdit={() => handleOpenModal(item)}
                onDelete={() => handleDelete(item.id, item)}
                extraActions={[
                  { label: 'Duplikasi Kisi-kisi', icon: Copy, onClick: () => handleDuplicate(item?.id) },
                  { label: 'Buat Soal dari Kisi ini', icon: ChevronRight, onClick: () => handleGoToBankSoal(item) },
                ]}
              />
            )
          }}
        />

 {/* Row Detail Modal */}
 <AppModal
 isOpen={Boolean(showRowDetailModal && rowDetailItem)}
 onClose={() => setShowRowDetailModal(false)}
 title={rowDetailItem?.judul_kisi || 'Detail Kisi-kisi'}
 description={`${rowDetailItem?.mata_pelajaran?.name || '-'} · ${rowDetailItem?.jenis_ujian || '-'}`}
 icon={FileText}
 maxWidth="max-w-lg"
 zIndex={50}
 footer={
 rowDetailItem ? (
 <div className="flex items-center justify-between gap-3 w-full">
 <button type="button" onClick={() => setShowRowDetailModal(false)} className="px-4 py-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-slate-600 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">Tutup</button>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => { setShowRowDetailModal(false); handleGoToBankSoal(rowDetailItem) }}
 className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer">
 <Plus className="w-3.5 h-3.5" />Buat Soal
 </button>
 <button type="button" onClick={() => { setShowRowDetailModal(false); handleDelete(rowDetailItem.id, rowDetailItem) }}
 className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold hover:bg-rose-100 transition-colors">
 <Trash2 className="w-3.5 h-3.5" />Hapus
 </button>
 <button type="button" onClick={() => { setShowRowDetailModal(false); handleOpenModal(rowDetailItem) }}
 className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#059669] text-white text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-sm">
 <Edit3 className="w-3.5 h-3.5" />Edit Data
 </button>
 </div>
 </div>
 ) : null
 }
 >
 {rowDetailItem && (
 <>
 <div className="flex flex-wrap gap-2">
 <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${getJenisBadgeColor(rowDetailItem.jenis_ujian)}`}>
 {getJenisFullName(rowDetailItem.jenis_ujian)}
 </span>
 {rowDetailItem.status
 ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/60"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Aktif</span>
 : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-sky-950/60 dark:text-sky-300 border border-emerald-200/80 dark:border-emerald-800/60"><span className="w-1.5 h-1.5 rounded-full bg-slate-400" />Nonaktif</span>
 }
 {(rowDetailItem.ujian_count || 0) > 0 && (
 <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-emerald-200/80 dark:border-emerald-800/60"><ShieldAlert className="w-3 h-3" />Dipakai di {rowDetailItem.ujian_count} ujian</span>
 )}
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="bg-purple-50 dark:bg-purple-950/30 rounded-xl p-3"><p className="text-[10px] font-semibold text-purple-400 uppercase tracking-wider">Target Soal</p><p className="text-sm font-bold text-purple-700 dark:text-purple-400 mt-0.5">{rowDetailItem.jumlah_soal} Soal</p></div>
 <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3"><p className="text-[10px] font-semibold text-blue-400 uppercase tracking-wider">Soal Tersedia</p><p className="text-sm font-bold text-blue-700 dark:text-blue-400 mt-0.5">{rowDetailItem.bank_soal_count ?? 0} Soal</p></div>
 <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3"><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Waktu</p><p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{rowDetailItem.alokasi_waktu_menit} Menit</p></div>
 <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3"><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Level Kognitif</p><p className="text-xs font-semibold text-slate-800 dark:text-white mt-0.5">{getKognitifLabel(rowDetailItem.level_kognitif) || '-'}</p></div>
 </div>
 <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-3 border border-emerald-200/80 dark:border-emerald-800/60">
 <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-2">Kelengkapan Bank Soal</p>
 <SoalProgressBar current={rowDetailItem.bank_soal_count ?? 0} target={rowDetailItem.jumlah_soal || 0} />
 </div>
 {rowDetailItem.distribusi_bobot && (
 <div className="rounded-xl p-3 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-800/40">
 <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Distribusi Bobot Soal</p>
 <div className="flex items-center gap-4">
 {Object.entries(rowDetailItem.distribusi_bobot).map(([k, v]) => (
 <div key={k} className="text-center"><p className="text-[10px] text-slate-400 uppercase">{k}</p><p className="text-sm font-bold text-slate-700 dark:text-slate-200">{v}%</p></div>
 ))}
 </div>
 </div>
 )}
 {rowDetailItem.cp && (
 <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-3 border border-emerald-200/80 dark:border-emerald-800/60">
 <p className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider mb-1">Capaian Pembelajaran (CP)</p>
 <p className="text-xs text-slate-700 dark:text-slate-300">{rowDetailItem.cp.kode_cp ? `[${rowDetailItem.cp.kode_cp}] ` : ''}{rowDetailItem.cp.nama_cp}</p>
 </div>
 )}
 {rowDetailItem.tp && (
 <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3 border border-emerald-200/80 dark:border-emerald-800/60">
 <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider mb-1">Tujuan Pembelajaran (TP)</p>
 <p className="text-xs text-slate-700 dark:text-slate-300">{rowDetailItem.tp.kode_tp ? `[${rowDetailItem.tp.kode_tp}] ` : ''}{rowDetailItem.tp.nama_tp || rowDetailItem.tp.deskripsi}</p>
 </div>
 )}
 {rowDetailItem.kompetensi_dasar && (
 <div><p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Indikator / KD</p>
 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800 p-3 rounded-xl">{rowDetailItem.kompetensi_dasar}</p>
 </div>
 )}
 </>
 )}
 </AppModal>

 {/* Create/Edit Modal */}
 <AppModal
 isOpen={showModal}
 onClose={() => setShowModal(false)}
 title={editingItem ? 'Edit Kisi-kisi Ujian' : 'Buat Kisi-kisi Ujian Baru'}
 description={editingItem ? 'Perbarui rincian capaian pembelajaran & sebaran soal' : 'Definisikan kisi-kisi dan distribusi bobot soal ujian'}
 icon={FileText}
 maxWidth="max-w-2xl"
 zIndex={50}
 footer={
 <>
 <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl hover:bg-slate-200 transition">Batal</button>
 <button type="submit" form="lms-kisi-kisi-form" disabled={!!distribusiError} className="px-5 py-2.5 bg-[#059669] text-white text-sm font-semibold rounded-lg transition shadow-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-200/80 dark:border-emerald-800/60 h-9">
 {editingItem ? 'Simpan Perubahan' : 'Buat Kisi-kisi'}
 </button>
 </>
 }
 >
 <form id="lms-kisi-kisi-form" onSubmit={handleSubmit} className="space-y-5">
 <div><label className={labelCls}>Judul Kisi-kisi Ujian *</label>
 <input type="text" required placeholder="Contoh: Kisi-kisi PTS Gasal Matematika Kelas 8" value={formData.judul_kisi} onChange={(e) => setFormData({ ...formData, judul_kisi: e.target.value })} className={inputCls} /></div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HeroUiModalSelect
 label="Mata Pelajaran"
 required
 value={formData.mata_pelajaran_id}
 onChange={(val) => handleMataPelajaranChange(val)}
 placeholder="-- Pilih Mata Pelajaran --"
 icon={BookOpen}
 searchable
 options={options.subjects.map((s) => ({ value: s.id, label: getSubjectLabel(s) }))}
 />
 <HeroUiModalSelect
 label="Jenis Ujian"
 required
 value={formData.jenis_ujian}
 onChange={(val) => setFormData((p) => ({ ...p, jenis_ujian: val }))}
 placeholder="-- Pilih Jenis Ujian --"
 icon={Target}
 options={
 options.jenis_ujian_options.length > 0
 ? options.jenis_ujian_options.map((j) => ({ value: j.id, label: getJenisFullName(j.id) || j.nama }))
 : [
 { value: 'UH', label: getJenisFullName('UH') },
 { value: 'PTS', label: getJenisFullName('PTS') },
 { value: 'PAS', label: getJenisFullName('PAS') },
 { value: 'CBT', label: getJenisFullName('CBT') },
 { value: 'Remedial', label: getJenisFullName('Remedial') },
 ]
 }
 />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div>
 <HeroUiModalSelect
 label="Capaian Pembelajaran (CP)"
 value={formData.cp_id}
 disabled={!formData.mata_pelajaran_id}
 onChange={(val) => handleCpChange(val)}
 placeholder={
 !formData.mata_pelajaran_id
 ? 'Pilih mapel terlebih dahulu'
 : loadingOptions
 ? 'Memuat CP...'
 : options.capaian_pembelajaran.length > 0
 ? '-- Pilih CP (Opsional) --'
 : 'Belum ada master CP untuk mapel ini'
 }
 icon={Layers}
 searchable
 options={options.capaian_pembelajaran.map((cp) => ({
 value: cp.id,
 label: cp.label || (cp.kode_cp ? `[${cp.kode_cp}] ${cp.nama_cp}` : cp.nama_cp),
 }))}
 />
 {formData.mata_pelajaran_id && options.capaian_pembelajaran.length === 0 && !loadingOptions && (
 <p className="mt-1 text-[10px] text-amber-600 dark:text-amber-400">Master CP belum tersedia untuk mapel ini. Anda dapat langsung mengisikan indikator kompetensi pada kolom uraian di bawah.</p>
 )}
 </div>
 <div>
 <HeroUiModalSelect
 label="Tujuan Pembelajaran (TP)"
 value={formData.tp_id}
 disabled={!formData.cp_id}
 onChange={(val) => setFormData((p) => ({ ...p, tp_id: val }))}
 placeholder={
 !formData.cp_id
 ? 'Pilih CP terlebih dahulu'
 : loadingOptions
 ? 'Memuat TP...'
 : options.tujuan_pembelajaran.length > 0
 ? '-- Pilih TP (Opsional) --'
 : 'Belum ada TP untuk CP ini (Opsional)'
 }
 icon={CheckSquare}
 searchable
 options={options.tujuan_pembelajaran.map((tp) => ({
 value: tp.id,
 label: tp.label || (tp.kode_tp ? `[${tp.kode_tp}] ${tp.nama_tp}` : tp.nama_tp),
 }))}
 />
 </div>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <HeroUiModalSelect
 label="Kelas"
 value={formData.kelas_id}
 onChange={(val) => setFormData((p) => ({ ...p, kelas_id: val }))}
 placeholder="-- Pilih Kelas --"
 options={options.kelas.map((k) => ({
 value: k.id,
 label: k.nama_kelas || k.tingkat || k.nama,
 }))}
 />
 <HeroUiModalSelect
 label="Semester"
 value={formData.semester_id}
 onChange={(val) => setFormData((p) => ({ ...p, semester_id: val }))}
 placeholder="-- Pilih Semester --"
 options={options.semesters.map((s) => ({
 value: s.id,
 label: s.name || s.nama || s.nama_semester,
 }))}
 />
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div><label className={labelCls}>Jumlah Soal Target *</label>
 <input type="number" required min="1" value={formData.jumlah_soal} onChange={(e) => setFormData({ ...formData, jumlah_soal: parseInt(e.target.value) || 0 })} className={inputCls} /></div>
 <div><label className={labelCls}>Alokasi Waktu (Menit) *</label>
 <input type="number" required min="5" value={formData.alokasi_waktu_menit} onChange={(e) => setFormData({ ...formData, alokasi_waktu_menit: parseInt(e.target.value) || 0 })} className={inputCls} /></div>
 </div>
 <HeroUiModalSelect
 label="Level Kognitif Bloom"
 value={formData.level_kognitif}
 onChange={(val) => setFormData((p) => ({ ...p, level_kognitif: val }))}
 placeholder="-- Pilih Level Kognitif --"
 options={options.level_kognitif_options.map((l) => ({
 value: l.id,
 label: getKognitifLabel(l.nama || l.id) || l.nama,
 }))}
 />
 <div>
 <label className={labelCls}>Distribusi Bobot Soal <span className="text-slate-400 font-normal normal-case">(Total harus = 100%)</span></label>
 <div className="grid grid-cols-3 gap-3">
 {[{ key: 'pg', label: 'Pilihan Ganda (%)' }, { key: 'isian', label: 'Isian (%)' }, { key: 'esai', label: 'Esai (%)' }].map(({ key, label }) => (
 <div key={key}>
 <label className="block text-[10px] font-semibold text-slate-400 mb-1">{label}</label>
 <input type="number" min="0" max="100" value={formData.distribusi_bobot?.[key] ?? 0} onChange={(e) => handleDistribusiChange(key, e.target.value)}
 className={`w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border rounded-xl text-sm text-center font-semibold outline-none focus:ring-2 transition ${distribusiError ? 'border-rose-300 focus:ring-rose-400/30' : 'border-emerald-200/80 dark:border-emerald-700/80 focus:ring-emerald-500/40 focus:border-emerald-600'}`} />
 </div>
 ))}
 </div>
 {distribusiError
 ? <div className="mt-2 flex items-center gap-1.5 text-rose-600 dark:text-rose-400"><AlertTriangle className="w-3.5 h-3.5" /><p className="text-xs font-medium">{distribusiError}</p></div>
 : (() => { const tot = (formData.distribusi_bobot?.pg || 0) + (formData.distribusi_bobot?.isian || 0) + (formData.distribusi_bobot?.esai || 0); return tot > 0 ? <p className="mt-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">✓ Total: {tot}% {tot === 100 ? '— Valid' : ''}</p> : <p className="mt-1 text-[10px] text-slate-400">Kosongkan jika tidak ingin mengatur distribusi bobot</p> })()}
 </div>
 <div>
 {isAdminOrKurikulum ? (
 <HeroUiModalSelect
 label="Guru Penyusun"
 value={formData.guru_id}
 onChange={(val) => setFormData((p) => ({ ...p, guru_id: val }))}
 placeholder="-- Pilih Guru --"
 searchable
 options={options.guru.map((g) => ({
 value: g.id,
 label: `${g.nama_lengkap || g.name || g.nama}${String(g.id) === String(userEmployeeId) ? ' (Anda)' : ''}`,
 }))}
 />
 ) : (
 <div>
 <label className={labelCls}>Guru Penyusun</label>
 <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 rounded-xl text-sm font-semibold text-emerald-700 dark:text-slate-200">
 <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
 <span className="truncate">{currentTeacherName} (Akun Anda)</span>
 </div>
 </div>
 )}
 </div>
 <div><label className={labelCls}>Uraian Indikator / Kompetensi Dasar</label>
 <textarea rows="3" placeholder="Tuliskan materi pokok atau indikator pencapaian..." value={formData.kompetensi_dasar} onChange={(e) => setFormData({ ...formData, kompetensi_dasar: e.target.value })} className={`${inputCls} resize-none`} /></div>
 <div className="flex items-center gap-3 pt-1">
 <label className={labelCls + ' mb-0'}>Status</label>
 <button type="button" onClick={() => setFormData((p) => ({ ...p, status: !p.status }))}
 className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.status ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
 <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${formData.status ? 'translate-x-6' : 'translate-x-1'}`} />
 </button>
 <span className={`text-xs font-semibold ${formData.status ? 'text-emerald-600' : 'text-slate-400'}`}>{formData.status ? 'Aktif' : 'Nonaktif'}</span>
 </div>
 </form>
 </AppModal>

 <PrintOptionModal isOpen={isPrintModalOpen} onClose={() => setIsPrintModalOpen(false)}
 title="Opsi Cetak Data Kisi-kisi Ujian" subtitle="Pilih metode pencetakan atau unduh cetak biru kisi-kisi"
 onPrintClean={() => { printCleanTable({ title: 'Laporan Kisi-kisi Ujian', data: dataList, columns: [{ header: 'Judul', accessor: (r) => r.judul_kisi || '-' }, { header: 'Mapel', accessor: (r) => getSubjectLabel(r.mata_pelajaran) }, { header: 'Jenis Ujian', accessor: (r) => r.jenis_ujian || '-' }, { header: 'Target Soal', accessor: (r) => r.jumlah_soal || 0 }, { header: 'Soal Tersedia', accessor: (r) => r.bank_soal_count ?? 0 }, { header: 'Status', accessor: (r) => r.status ? 'Aktif' : 'Nonaktif' }] }); setIsPrintModalOpen(false) }}
 onDownloadPdf={() => { downloadPdfTable({ title: 'Laporan Kisi-kisi Ujian', data: dataList, columns: [{ header: 'Judul', accessor: (r) => r.judul_kisi || '-' }, { header: 'Mapel', accessor: (r) => getSubjectLabel(r.mata_pelajaran) }, { header: 'Jenis Ujian', accessor: (r) => r.jenis_ujian || '-' }, { header: 'Target Soal', accessor: (r) => r.jumlah_soal || 0 }, { header: 'Soal Tersedia', accessor: (r) => r.bank_soal_count ?? 0 }, { header: 'Status', accessor: (r) => r.status ? 'Aktif' : 'Nonaktif' }], filename: `laporan_kisi_kisi_ujian_${new Date().toISOString().slice(0, 10)}.pdf` }); setIsPrintModalOpen(false) }} />
 <CsvImportModal isOpen={importOpen} onClose={() => setImportOpen(false)} title="Import Data Kisi-kisi Ujian" onImport={(file) => showNotification(`File ${file.name} berhasil diproses.`)} templateFields={['judul_kisi', 'mata_pelajaran_id', 'jenis_ujian', 'jumlah_soal', 'alokasi_waktu_menit', 'status']} />

 <HarmonizedDeleteModal
 isOpen={deleteModal.isOpen}
 onClose={() => setDeleteModal({ isOpen: false, id: null, item: null, isSubmitting: false })}
 onConfirm={confirmDelete}
 item={deleteModal.item}
 isSubmitting={deleteModal.isSubmitting}
 />

 {/* ── KPI Quick View Pop-up Modal (10/page + Pagination) ── */}
 {(() => {
   const allRows = Array.isArray(dataList) ? dataList : []
   const filterByKpi = (list) => {
     if (kpiModalKey === 'target_soal') return [...list].sort((a, b) => Number(b.jumlah_soal || 0) - Number(a.jumlah_soal || 0))
     if (kpiModalKey === 'uh') return list.filter((r) => String(r.jenis_ujian || '').toUpperCase() === 'UH')
     if (kpiModalKey === 'pts_pas') return list.filter((r) => ['PTS', 'PAS'].includes(String(r.jenis_ujian || '').toUpperCase()))
     return list
   }
   const metaMap = {
     total: { title: 'Rincian Total Kisi-kisi Ujian', badge: `${stats.total || allRows.length} Kisi-kisi` },
     target_soal: { title: 'Rincian Target Butir Soal Kisi-kisi', badge: `${stats.total_soal_target || 0} Soal` },
     uh: { title: `Rincian Kisi-kisi ${getJenisLabel('UH')}`, badge: `${stats.uh || 0} Kisi-kisi` },
     pts_pas: { title: `Rincian Kisi-kisi ${getJenisLabel('PTS')} & ${getJenisLabel('PAS')}`, badge: `${(stats.pts || 0) + (stats.pas || 0)} Kisi-kisi` },
   }
   const meta = kpiModalKey ? metaMap[kpiModalKey] : null
   return (
     <LmsKpiDetailModal
       isOpen={Boolean(kpiModalKey && meta)}
       onClose={() => setKpiModalKey(null)}
       icon={FileText}
       title={meta?.title || 'Rincian Kisi-kisi Ujian'}
       badge={meta?.badge}
       rows={filterByKpi(allRows)}
       fetchRows={async () => {
         const res = await lmsKisiKisiService.getDaftar({ per_page: 200 })
         const raw = Array.isArray(res?.data) ? res.data : res?.data?.data || []
         return filterByKpi(raw)
       }}
       searchPlaceholder="Cari judul kisi-kisi, mata pelajaran, atau jenis ujian..."
       searchFilter={(r, q) =>
         [r.judul_kisi, getSubjectLabel(r.mata_pelajaran), r.jenis_ujian]
           .filter(Boolean)
           .join(' ')
           .toLowerCase()
           .includes(q)
       }
       emptyText="Tidak ada data kisi-kisi pada kategori ini."
       columns={[
         {
           header: 'Judul Kisi-kisi',
           render: (r) => <div className="font-extrabold text-slate-900 dark:text-white">{r.judul_kisi || '-'}</div>,
         },
         {
           header: 'Mata Pelajaran',
           render: (r) => <div className="font-semibold text-indigo-700 dark:text-indigo-300">{getSubjectLabel(r.mata_pelajaran)}</div>,
         },
         {
           header: 'Jenis',
           align: 'center',
           render: (r) => <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-extrabold">{r.jenis_ujian || '-'}</span>,
         },
         {
           header: 'Target Soal',
           align: 'center',
           render: (r) => <span className="font-black text-emerald-700 dark:text-emerald-400 tabular-nums">{r.jumlah_soal || 0}</span>,
         },
         {
           header: 'Status',
           align: 'center',
           render: (r) => (
             <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${r.status ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
               {r.status ? 'Aktif' : 'Nonaktif'}
             </span>
           ),
         },
       ]}
     />
   )
 })()}
 </div>
 </PageContainer>
 )
}
