import {
  useMemo,
  useState,
  useEffect
} from 'react'
import {
  Navigate
} from 'react-router-dom'
import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Clock3,
  Users,
  Upload,
  BookOpen,
  Building2,
  School,
  GraduationCap,
  Bookmark,
  UserCheck,
  Target,
  AlertTriangle,
  AlertCircle,
  Search,
  Filter,
  RefreshCcw,
  LayoutGrid,
  Table as TableIcon,
  Eye,
  Pencil,
  Trash2,
  Sparkles,
  Calendar,
  Printer,
  Download,
  Plus,
  X,
  FileSpreadsheet,
  ShieldCheck,
  Layers,
  Coffee
} from 'lucide-react'
import {
  AnimatePresence,
  motion
} from 'framer-motion'
import {
  cn
} from '../lib/utils'
import {
  useAuthStore
} from '../stores/authStore'
import {
  hasAnyRole,
  getUserRoleLevel,
  ROLE_LEVELS,
  ROLES,
  isRestrictedToTeacherWorkspace
} from '../auth/portalResolver'
import {
  scheduleService
} from '../services/scheduleService'
import {
  educationUnitService
} from '../services/educationUnitService'
import {
  tahunAjaranService
} from '../services/tahunAjaranService'
import {
  printCleanTable,
  downloadPdfTable,
  printMatrixSchedule
} from '../utils/printHelper'
import {
  parseSpreadsheetFile,
  downloadSpreadsheetTemplate
} from '../utils/spreadsheetParser'
import {
  downloadFileFromApi
} from '../utils/exportUtils'
import {
  ActionDropdown,
  AppBadge,
  useToast,
  AppButton,
  AppModal,
  AppEmptyState,
  AppErrorState,
  AppSearch,
  AppSkeleton,
  AppTabs,
  MobileDataCard,
  PersonIdentityCell,
  AppBreadcrumb,
  KpiStatCard,
  PageToolbarActions
} from '../components/app'
import {
  Pagination
} from '../components/ui/pagination'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import HeroUiHeader from '../components/ui/HeroUiHeader'
import {
  MasterDataPage,
  MasterActionButton,
  MasterFilterSelect,
  MasterFormModal,
  SquircleActionButton
} from '../components/master-data'

// ── 1. DEFINISI TONE WARNA KARTU KPI MODERN (HEROUI GOLD STANDARD) ──
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

// ── 2. SUB-KOMPONEN KARTU KPI MODERN ──
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

// ── HARMONIZED DELETE MODAL ──
function HarmonizedDeleteModal({ isOpen, onClose, onConfirm, item, isSubmitting }) {
  return (
    <AppModal
      isOpen={Boolean(isOpen && item)}
      onClose={() => !isSubmitting && onClose()}
      title="Hapus Jadwal Pelajaran?"
      badge="Hapus Permanen"
      description="Apakah Anda yakin ingin menghapus jadwal mengajar ini? Tindakan ini tidak dapat dibatalkan."
      icon={Trash2}
      variant="danger"
      maxWidth="max-w-md"
      zIndex={70}
      disableBackdropClose={isSubmitting}
      hideCloseButton={isSubmitting}
      bodyClassName="space-y-4"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
          >
            <X className="size-4" strokeWidth={2} />
            <span>Batal</span>
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="h-9.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border-2 border-rose-600 shadow-md shadow-rose-600/20 disabled:opacity-50"
          >
            {isSubmitting ? <RefreshCcw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span>Hapus Jadwal</span>
          </button>
        </>
      }
    >
      {item && (
        <>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Apakah Anda yakin ingin menghapus jadwal mengajar ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-rose-50/50 p-3.5 dark:bg-rose-950/20">
            <p className="text-xs font-black text-rose-950 dark:text-rose-100">
              {item?.subject?.name || item?.mata_pelajaran?.nama_mapel || 'Mata Pelajaran'} • {item?.school_class?.nama_kelas || item?.kelas?.nama_kelas || 'Kelas'}
            </p>
            <p className="text-xs text-rose-800/80 dark:text-rose-300/80 mt-0.5">
              Guru: {item?.teacher?.nama_lengkap || item?.guru?.nama_lengkap || '-'}
            </p>
          </div>
        </>
      )}
    </AppModal>
  )
}


const DAYS_MAP = [
 { id: 1, name: 'Senin' },
 { id: 2, name: 'Selasa' },
 { id: 3, name: 'Rabu' },
 { id: 4, name: 'Kamis' },
 { id: 5, name: 'Jumat' },
 { id: 6, name: 'Sabtu' },
 { id: 7, name: 'Minggu' },
]

const emptyForm = {
 unit_pendidikan_id: '',
 kelas_id: '',
 employee_id: '',
 subject_id: '',
 activity_type: 'kbm', // 'kbm' | 'routine' | 'break'
 activity_name: '',
 academic_year_id: '',
 semester_id: '',
 day_of_week: 1,
 time_start: '07:30',
 time_end: '09:00',
 week_type: 'all',
 is_active: true,
 notes: '',
}

const pickError = (error, fallback) => {
 const errors = error.response?.data?.errors
 if (errors) {
 const firstKey = Object.keys(errors)[0]
 return Array.isArray(errors[firstKey]) ? errors[firstKey][0] : errors[firstKey]
 }
 return error.response?.data?.message || fallback
}

const formatTime = (value) => value?.slice(0, 5) || '--:--'
const subjectName = (item) => item?.nama_mapel || item?.name || 'Mata Pelajaran'

const getActivityTitle = (item) => {
 if (item?.activity_type && item?.activity_type !== 'kbm') {
 return item?.activity_name || 'Kegiatan Sekolah'
 }
 return subjectName(item?.subject)
}

export default function MasterSchedulePage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false }) {
 const queryClient = useQueryClient()
 const [page, setPage] = useState(1)
 const [search, setSearch] = useState('')

 // ── AUTH & ROLE SCOPING ──
 const authUser = useAuthStore((state) => state.user)
 const userRoles = useMemo(() => {
 if (!authUser) return []
 const raw = authUser.roles || (authUser.role ? [authUser.role] : []) || authUser.role_names || []
 const list = Array.isArray(raw) ? raw : [raw]
 return list.map((r) => (typeof r === 'string' ? r : r?.name || r?.role_name || r?.nama || ''))
 }, [authUser])

 const authLevel = useMemo(() => getUserRoleLevel(authUser), [authUser])
 const isSuperAdminOrYayasan = authLevel <= ROLE_LEVELS.YAYASAN // Level 1-2
 const isDivisiPendidikan = useMemo(() => {
 if (isSuperAdminOrYayasan) return false
 return (
 authLevel === ROLE_LEVELS.DIVISI_PENDIDIKAN ||
 hasAnyRole(userRoles, ROLES.DIVISI) ||
 userRoles.some((r) => /divisi|bidang[\s_]*pendidikan|pengawasan[\s_]*akademik/i.test(r))
 )
 }, [authLevel, userRoles, isSuperAdminOrYayasan])

 // Multi-unit supervision: Super Admin, Yayasan, and Divisi Pendidikan
 const canSelectUnit = isSuperAdminOrYayasan || isDivisiPendidikan

 const isGuru = useMemo(
 () => isRestrictedToTeacherWorkspace(authUser, '/dashboard/akademik/jadwal'),
 [authUser]
 )
 const isTu = useMemo(() => authLevel === ROLE_LEVELS.OPERATOR || authLevel === ROLE_LEVELS.TATA_USAHA || userRoles.some(r => /tata[\s_]*usaha|tu|staf[\s_]*tu|admin[\s_]*tu/i.test(r)), [authLevel, userRoles])
 const isKepsek = useMemo(() => {
 if (canSelectUnit) return false
 return authLevel === ROLE_LEVELS.KEPALA_SEKOLAH || userRoles.some((r) => /kepala[\s_]*sekolah|kepsek/i.test(r))
 }, [authLevel, userRoles, canSelectUnit])

 const canManage = useMemo(() => !isGuru && (authLevel <= ROLE_LEVELS.KEPALA_SEKOLAH || isTu), [isGuru, authLevel, isTu]) // Level <= 4 & TU (Level 3)

 // Resolusi unit_id guru / TU / Kepala Sekolah dari profil user
 const userUnitId = useMemo(() => {
 if (!authUser) return null
 const candidates = [
 authUser?.unit_id,
 authUser?.unit_pendidikan_id,
 authUser?.education_unit_id,
 authUser?.unit?.id,
 authUser?.education_unit?.id,
 authUser?.employee?.unit_id,
 authUser?.employee?.unit_pendidikan_id,
 authUser?.employee?.education_unit_id,
 authUser?.school_info?.id,
 ].filter(Boolean)
 return candidates.length > 0 ? String(candidates[0]) : null
 }, [authUser])
 const guruUnitId = userUnitId

 // Resolusi employee_id guru dari profil user
 const guruEmployeeId = useMemo(() => {
 if (!authUser) return null
 const candidates = [
 authUser?.employee_id,
 authUser?.employee?.id,
 ].filter(Boolean)
 return candidates.length > 0 ? String(candidates[0]) : null
 }, [authUser])

 // Filters
 const [unitFilter, setUnitFilter] = useState(() => (!canSelectUnit && userUnitId ? String(userUnitId) : ''))
 const [programTypeFilter, setProgramTypeFilter] = useState('') // '' | 'fullday' | 'boarding'
 const [yearFilter, setYearFilter] = useState('')
 const [semesterFilter, setSemesterFilter] = useState('')
 const [subjectFilter, setSubjectFilter] = useState('')
 const [classFilter, setClassFilter] = useState('')
 const [dayFilter, setDayFilter] = useState('')
 const [teacherFilter, setTeacherFilter] = useState('')
 const [statusFilter, setStatusFilter] = useState('')
 const [conflictOnlyFilter, setConflictOnlyFilter] = useState(false)
 const [liveConflictChecking, setLiveConflictChecking] = useState(false)
 const [liveConflicts, setLiveConflicts] = useState([])

 // View state
 const [viewMode, setViewMode] = useState('table') // 'table' | 'weekly'
 const [selectedWeeklyDay, setSelectedWeeklyDay] = useState(new Date().getDay() || 1)

 // Modals & Drawers
 const [modal, setModal] = useState(false)
 const [editing, setEditing] = useState(null)
 const [deleteItem, setDeleteItem] = useState(null)
 const [showImportModal, setShowImportModal] = useState(false)
 const [importFile, setImportFile] = useState(null)
 const [importPreviewData, setImportPreviewData] = useState([])
 const [isImporting, setIsImporting] = useState(false)
 const [importFailures, setImportFailures] = useState([])
 const [showExportModal, setShowExportModal] = useState(false)
 const [exportFormat, setExportFormat] = useState('xlsx')
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [printFormatMode, setPrintFormatMode] = useState('matrix') // 'matrix' (Matriks Mingguan A4 Landscape) | 'table' (Rekap Log Baris)
 const [printTeacherFilter, setPrintTeacherFilter] = useState('')
 const [printKelasFilter, setPrintKelasFilter] = useState('')
 const [isGeneratingMatrix, setIsGeneratingMatrix] = useState(false)
 const [detailDrawerItem, setDetailDrawerItem] = useState(null)
 // Global Toast
 const { pushToast } = useToast()

 // Form State & Validation
 const [form, setForm] = useState(emptyForm)
 const [formErrors, setFormErrors] = useState({})
 const [conflictWarning, setConflictWarning] = useState('')
 const [isDirty, setIsDirty] = useState(false)

 // Availability State (Rincian Hari Kosong & Rekomendasi Jam Bebas Bentrok)
 const [availabilityData, setAvailabilityData] = useState(null)
 const [availabilityLoading, setAvailabilityLoading] = useState(false)

 // Live debounced conflict check saat modal dibuka dan form diubah
 useEffect(() => {
 if (!modal) {
 setLiveConflicts([])
 setConflictWarning('')
 return
 }

 const { academic_year_id, semester_id, day_of_week, time_start, time_end, employee_id, kelas_id } = form

 if (!academic_year_id || !semester_id || !day_of_week || !time_start || !time_end || (!employee_id && !kelas_id)) {
 setLiveConflicts([])
 setConflictWarning('')
 return
 }

 const timer = setTimeout(async () => {
 try {
 setLiveConflictChecking(true)
 const payload = {
 academic_year_id,
 semester_id,
 day_of_week: Number(day_of_week),
 time_start: time_start.slice(0, 5),
 time_end: time_end.slice(0, 5),
 employee_id: employee_id || undefined,
 kelas_id: kelas_id || undefined,
 ignore_id: editing?.id || undefined,
 }
 const res = await scheduleService.checkConflict(payload)
 if (res?.has_conflict && Array.isArray(res.conflicts) && res.conflicts.length > 0) {
 setLiveConflicts(res.conflicts)
 setConflictWarning(res.conflicts.map((c) => c.message).join(' • '))
 } else {
 setLiveConflicts([])
 setConflictWarning('')
 }
 } catch {
 // Abaikan error jaringan saat pengecekan live
 } finally {
 setLiveConflictChecking(false)
 }
 }, 350)

 return () => clearTimeout(timer)
 }, [
 modal,
 form.academic_year_id,
 form.semester_id,
 form.day_of_week,
 form.time_start,
 form.time_end,
 form.employee_id,
 form.kelas_id,
 editing?.id,
 ])

 // Live fetch availability data saat kelas / guru / tahun ajaran berubah
 useEffect(() => {
 if (!modal) {
 setAvailabilityData(null)
 return
 }

 const { academic_year_id, semester_id, employee_id, kelas_id, day_of_week } = form
 let isCancelled = false

 const timer = setTimeout(async () => {
 try {
 setAvailabilityLoading(true)
 const res = await scheduleService.getAvailability({
 academic_year_id: academic_year_id || undefined,
 semester_id: semester_id || undefined,
 employee_id: employee_id || undefined,
 kelas_id: kelas_id || undefined,
 day_of_week: day_of_week ? Number(day_of_week) : undefined,
 ignore_id: editing?.id || undefined,
 })
 if (!isCancelled) {
 setAvailabilityData(res)
 }
 } catch {
 // Abaikan error jaringan availability
 } finally {
 if (!isCancelled) {
 setAvailabilityLoading(false)
 }
 }
 }, 200)

 return () => {
 isCancelled = true
 clearTimeout(timer)
 }
 }, [
 modal,
 form.academic_year_id,
 form.semester_id,
 form.employee_id,
 form.kelas_id,
 form.day_of_week,
 editing?.id,
 ])

 // Fetch Options
 const { data: options = {}, isLoading: optionsLoading } = useQuery({
 queryKey: ['schedule-options'],
 queryFn: scheduleService.getOptions,
 })

 // Inisialisasi filter scope guru, TU, atau Kepala Sekolah saat role sudah diketahui
 useEffect(() => {
 if (isGuru) {
 if (guruUnitId) setUnitFilter(guruUnitId)
 if (guruEmployeeId) setTeacherFilter(guruEmployeeId)
 } else if (!canSelectUnit && userUnitId) {
 setUnitFilter(String(userUnitId))
 }
 }, [isGuru, canSelectUnit, guruUnitId, userUnitId, guruEmployeeId])


 // Fetch Units for dropdown filter & dependent form
 const { data: unitsResponse = {} } = useQuery({
 queryKey: ['education-units-all'],
 queryFn: () => educationUnitService.getAll(),
 })
 const unitsList = unitsResponse.data || []

 // Fetch Fallback Academic Years if needed
 const { data: tahunAjaranFallback = [] } = useQuery({
 queryKey: ['academic-years-dropdown-fallback'],
 queryFn: tahunAjaranService.getDropdown,
 })

 // Derived Tahun Ajaran Options
 const tahunAjaranList = useMemo(() => {
 const fromOpts =
 options.tahun_ajaran ||
 options.tahunAjaran ||
 options.academic_years ||
 options.academic_year
 if (Array.isArray(fromOpts) && fromOpts.length > 0) return fromOpts
 if (Array.isArray(tahunAjaranFallback) && tahunAjaranFallback.length > 0) return tahunAjaranFallback
 return []
 }, [options, tahunAjaranFallback])

 // Derived unit options combining options.kelas, options.guru & unitsList
 const unitOptions = useMemo(() => {
 if (unitsList.length > 0) return unitsList
 const map = new Map()
 ; (options.kelas || []).forEach((k) => {
 if (k.unitPendidikan || k.unit_pendidikan) {
 const u = k.unitPendidikan || k.unit_pendidikan
 map.set(u.id, u)
 }
 })
 return Array.from(map.values())
 }, [unitsList, options.kelas])

 // Filtered unit options berdasarkan pilihan programTypeFilter (Fullday vs Boarding)
 const filteredUnitOptions = useMemo(() => {
 if (!programTypeFilter) return unitOptions
 return unitOptions.filter((u) => {
 const isBoarding =
 u.program_type === 'boarding' ||
 u.metadata?.is_boarding === true ||
 String(u.level || '').toLowerCase().includes('ponpes')
 return programTypeFilter === 'boarding' ? isBoarding : !isBoarding
 })
 }, [unitOptions, programTypeFilter])

 // Active unit object for print modal, branding, and academic configuration
 const activeUnitObj = useMemo(() => {
 const targetId = (isGuru || isTu) && userUnitId ? userUnitId : unitFilter
 return (
 unitOptions.find((u) => String(u.id) === String(targetId)) ||
 unitOptions[0] ||
 null
 )
 }, [unitOptions, isGuru, isTu, userUnitId, unitFilter])

 // Effective Day filter: in weekly view mode, use selectedWeeklyDay; in table view mode, use dayFilter
 const effectiveDayFilter = viewMode === 'weekly' ? selectedWeeklyDay : dayFilter

 // Query Schedule List
 const { data: response = {}, isLoading, isError, refetch } = useQuery({
 queryKey: [
 'schedules',
 page,
 search,
 unitFilter,
 programTypeFilter,
 yearFilter,
 semesterFilter,
 subjectFilter,
 classFilter,
 effectiveDayFilter,
 teacherFilter,
 statusFilter,
 conflictOnlyFilter,
 viewMode,
 ],
 queryFn: () =>
 scheduleService.getDaftar({
 page,
 per_page: viewMode === 'weekly' ? 24 : 10,
 search,
 unit_pendidikan_id: unitFilter || undefined,
 program_type: programTypeFilter || undefined,
 academic_year_id: yearFilter || undefined,
 semester_id: semesterFilter || undefined,
 subject_id: subjectFilter || undefined,
 kelas_id: classFilter || undefined,
 day_of_week: effectiveDayFilter || undefined,
 employee_id: teacherFilter || undefined,
 is_active: statusFilter || undefined,
 conflict_only: conflictOnlyFilter ? true : undefined,
 }),
 })

 const items = response.data || []
 const meta = response.meta || {}
 const stats = response.statistik || {}

 // Guru Picker Modal State
 const [guruPickerOpen, setGuruPickerOpen] = useState(false)
 const [guruSearchText, setGuruSearchText] = useState('')

 // Filtered Dependent Options for Form
 const filteredSemesters = useMemo(() => {
 const list = options.semester || []
 if (!form.academic_year_id) return list
 const filtered = list.filter(
 (s) => s.academic_year_id === form.academic_year_id
 )
 return filtered.length > 0 ? filtered : list
 }, [options.semester, form.academic_year_id])

 const filteredKelas = useMemo(() => {
 const list = options.kelas || []
 if (list.length === 0) return []
 const filtered = list.filter((k) => {
 const matchUnit = !form.unit_pendidikan_id || k.unit_pendidikan_id === form.unit_pendidikan_id
 const matchYear = !form.academic_year_id || k.tahun_ajaran_id === form.academic_year_id
 const matchSemester = !form.semester_id || k.semester_id === form.semester_id
 return matchUnit && matchYear && matchSemester
 })
 if (filtered.length > 0) return filtered

 // Fallback: match unit & year if semester is empty
 const matchUnitYear = list.filter((k) => {
 const matchUnit = !form.unit_pendidikan_id || k.unit_pendidikan_id === form.unit_pendidikan_id
 const matchYear = !form.academic_year_id || k.tahun_ajaran_id === form.academic_year_id
 return matchUnit && matchYear
 })
 if (matchUnitYear.length > 0) return matchUnitYear

 // Fallback: match unit only
 const matchUnitOnly = list.filter((k) => !form.unit_pendidikan_id || k.unit_pendidikan_id === form.unit_pendidikan_id)
 if (matchUnitOnly.length > 0) return matchUnitOnly

 return list
 }, [options.kelas, form.unit_pendidikan_id, form.academic_year_id, form.semester_id])

 const filteredGuru = useMemo(() => {
 const list = options.all_guru || options.guru || []
 if (!form.unit_pendidikan_id) return list
 const filtered = list.filter((g) => g.unit_id === form.unit_pendidikan_id)
 return filtered.length > 0 ? filtered : list
 }, [options.all_guru, options.guru, form.unit_pendidikan_id])

 const filteredGuruInPicker = useMemo(() => {
 const list = filteredGuru
 if (!guruSearchText.trim()) return list
 const q = guruSearchText.toLowerCase()
 return list.filter(
 (g) =>
 g.nama_lengkap?.toLowerCase().includes(q) ||
 g.niy?.toLowerCase().includes(q) ||
 g.nik?.toLowerCase().includes(q)
 )
 }, [filteredGuru, guruSearchText])

 const filteredSubjects = useMemo(() => {
 const list = options.mata_pelajaran || []
 if (!form.unit_pendidikan_id) return list
 const filtered = list.filter((m) => !m.unit_pendidikan_id || m.unit_pendidikan_id === form.unit_pendidikan_id)
 return filtered.length > 0 ? filtered : list
 }, [options.mata_pelajaran, form.unit_pendidikan_id])

 // ── Opsi Guru & Mata Pelajaran Terikat (Cascading Turunan & Hanya Guru dengan Jadwal Nyata) ──
 const filterSubjectOptions = useMemo(() => {
 let list = options.mata_pelajaran || []
 if (unitFilter) {
 list = list.filter((m) => !m.unit_pendidikan_id || m.unit_pendidikan_id === unitFilter)
 }
 if (teacherFilter) {
 const direct = list.filter((m) => Array.isArray(m.guru_ids) && m.guru_ids.includes(teacherFilter))
 if (direct.length > 0) return direct
 }
 return list
 }, [options.mata_pelajaran, unitFilter, teacherFilter])

 const filterTeacherOptions = useMemo(() => {
 // HANYA guru yang benar-benar memiliki jadwal pelajaran aktif di database (Zero Non-Teaching / Kosong)
 let list = (options.guru || []).filter((g) => {
 if (g.has_schedule !== undefined) return Boolean(g.has_schedule)
 return true
 })
 if (unitFilter) {
 list = list.filter((g) => !unitFilter || String(g.unit_id) === String(unitFilter))
 }
 if (subjectFilter) {
 const direct = list.filter((g) => Array.isArray(g.subject_ids) && g.subject_ids.includes(subjectFilter))
 if (direct.length > 0) return direct
 }
 return list
 }, [options.guru, unitFilter, subjectFilter])

 // ── HERO UI FILTER DROPDOWN OPTIONS ──
 const heroUnitFilterOptions = useMemo(() => {
 return [
 { value: '', label: 'Semua Unit' },
 ...filteredUnitOptions.map((u) => {
 const isBoarding =
 u.program_type === 'boarding' ||
 u.metadata?.is_boarding === true ||
 String(u.level || '').toLowerCase().includes('ponpes')
 return {
 value: String(u.id),
 label: u.name || u.nama,
 badge: isBoarding ? 'Boarding' : 'Full Day',
 subtext: isBoarding ? 'Boarding School (Pesantren)' : 'Full Day School',
 }
 }),
 ]
 }, [filteredUnitOptions])

 const heroProgramTypeOptions = useMemo(
 () => [
 { value: '', label: 'Semua Program' },
 { value: 'fullday', label: 'Full Day School', badge: 'Full Day' },
 { value: 'boarding', label: 'Boarding School (Pesantren)', badge: 'Boarding' },
 ],
 []
 )

 const heroDayOptions = useMemo(
 () => [
 { value: '', label: 'Semua Hari' },
 ...DAYS_MAP.map((item) => ({
 value: String(item.id),
 label: item.name,
 })),
 ],
 []
 )

 const heroTeacherOptions = useMemo(() => {
 return [
 { value: '', label: subjectFilter ? 'Semua Guru Mapel Ini' : 'Semua Guru' },
 ...filterTeacherOptions.map((item) => ({
 value: String(item.id),
 label: item.nama_lengkap,
 subtext: item.nip ? `NIP: ${item.nip}` : (item.niy ? `NIY: ${item.niy}` : undefined),
 })),
 ]
 }, [filterTeacherOptions, subjectFilter])

 const heroSubjectOptions = useMemo(() => {
 return [
 { value: '', label: teacherFilter ? 'Semua Mapel Guru Ini' : 'Semua Mata Pelajaran' },
 ...filterSubjectOptions.map((item) => ({
 value: String(item.id),
 label: item.nama_mapel || item.nama || item.name,
 subtext: item.kode_mapel || item.code ? `Kode: ${item.kode_mapel || item.code}` : undefined,
 })),
 ]
 }, [filterSubjectOptions, teacherFilter])

 const heroStatusOptions = useMemo(
 () => [
 { value: '', label: 'Semua Status' },
 { value: '1', label: 'Jadwal Aktif', badge: 'Aktif' },
 { value: '0', label: 'Jadwal Nonaktif', badge: 'Nonaktif' },
 ],
 []
 )

 const printKelasOptions = useMemo(
 () => [
 { value: '', label: 'Kelas Aktif / Paling Atas di Unit' },
 ...(options.kelas || []).map((k) => ({
 value: String(k.id),
 label: `${k.nama_kelas || k.kode_kelas || 'Kelas'} ${k.jenjang ? `(${k.jenjang})` : ''}`,
 })),
 ],
 [options.kelas]
 )

 const printTeacherOptions = useMemo(
 () => [
 { value: '', label: 'Semua Guru (Seluruh Jadwal Terfilter)' },
 ...filterTeacherOptions.map((g) => ({
 value: String(g.id),
 label: `${g.nama_lengkap || g.nama} ${g.niy ? `(NIY ${g.niy})` : ''}`,
 })),
 ],
 [filterTeacherOptions]
 )

 const formUnitOptions = useMemo(() => {
 const list = unitOptions.filter(
 (item) => !(isGuru || isTu) || !userUnitId || String(item.id) === String(userUnitId)
 )
 const res = []
 if (!(isGuru || isTu)) {
 res.push({ value: '', label: 'Semua Unit (Lintas Unit)' })
 }
 list.forEach((item) => {
 res.push({
 value: String(item.id),
 label: item.name || item.nama,
 })
 })
 return res
 }, [unitOptions, isGuru, isTu, userUnitId])

 const formAcademicYearOptions = useMemo(() => {
 return [
 { value: '', label: 'Pilih Tahun Ajaran' },
 ...(tahunAjaranList || []).map((item) => ({
 value: String(item.id),
 label: `${item.name || item.tahun_ajaran || item.nama} ${item.is_active ? '(Aktif)' : ''}`.trim(),
 badge: item.is_active ? 'Aktif' : undefined,
 })),
 ]
 }, [tahunAjaranList])

 const formSemesterOptions = useMemo(() => {
 if (!form.academic_year_id) {
 return [{ value: '', label: 'Pilih Thn Ajaran Dulu' }]
 }
 return [
 { value: '', label: 'Pilih Semester' },
 ...filteredSemesters.map((item) => ({
 value: String(item.id),
 label: `${item.name} ${item.is_active ? '(Aktif)' : ''}`.trim(),
 badge: item.is_active ? 'Aktif' : undefined,
 })),
 ]
 }, [form.academic_year_id, filteredSemesters])

 const formKelasOptions = useMemo(() => {
 return [
 { value: '', label: filteredKelas.length === 0 ? 'Tidak ada kelas sesuai filter' : 'Pilih Kelas / Rombel' },
 ...filteredKelas.map((item) => ({
 value: String(item.id),
 label: item.nama_kelas,
 subtext: item.unitPendidikan?.name || item.unit_pendidikan?.name || undefined,
 })),
 ]
 }, [filteredKelas])

 const formGuruOptions = useMemo(() => {
 return [
 { value: '', label: filteredGuru.length === 0 ? 'Tidak ada guru sesuai unit' : 'Pilih Guru Pengampu' },
 ...filteredGuru.map((item) => ({
 value: String(item.id),
 label: item.nama_lengkap,
 subtext: item.niy ? `NIY: ${item.niy}` : (item.nip ? `NIP: ${item.nip}` : undefined),
 })),
 ]
 }, [filteredGuru])

 const formSubjectOptions = useMemo(() => {
 return [
 { value: '', label: filteredSubjects.length === 0 ? 'Tidak ada mapel sesuai unit' : 'Pilih Mata Pelajaran' },
 ...filteredSubjects.map((item) => ({
 value: String(item.id),
 label: subjectName(item),
 subtext: item.kode_mapel || item.code ? `Kode: ${item.kode_mapel || item.code}` : undefined,
 })),
 ]
 }, [filteredSubjects])

 const formPembinaOptions = useMemo(() => {
 return [
 { value: '', label: '-- Tanpa Guru Khusus (Umum / Mandiri) --' },
 ...filteredGuru.map((item) => ({
 value: String(item.id),
 label: item.nama_lengkap,
 subtext: item.niy ? `NIY: ${item.niy}` : undefined,
 })),
 ]
 }, [filteredGuru])

 // Save Mutation
 const saveMutation = useMutation({
 mutationFn: (payload) =>
 editing ? scheduleService.ubah({ id: editing.id, payload }) : scheduleService.tambah(payload),
 onSuccess: (result) => {
 pushToast('Berhasil Disimpan', result.message || 'Jadwal pelajaran berhasil diperbarui.', 'success')
 setModal(false)
 setIsDirty(false)
 queryClient.invalidateQueries({ queryKey: ['schedules'] })
 },
 onError: (error) => {
 const errMsg = pickError(error, 'Periksa kembali kelengkapan data dan potensi bentrok jadwal.')
 setConflictWarning(errMsg)
 if (error.response?.data?.errors) {
 setFormErrors(error.response.data.errors)
 }
 },
 })

 // Delete Mutation
 const deleteMutation = useMutation({
 mutationFn: scheduleService.hapus,
 onSuccess: (result) => {
 pushToast('Jadwal Terhapus', result.message || 'Jadwal pelajaran telah dihapus.', 'success')
 if (detailDrawerItem) setDetailDrawerItem(null)
 setDeleteItem(null)
 queryClient.invalidateQueries({ queryKey: ['schedules'] })
 },
 onError: (error) => {
 pushToast('Gagal', pickError(error, 'Jadwal gagal dihapus.'), 'error')
 setDeleteItem(null)
 },
 })

 // Open Form Handlers
 const openAdd = () => {
 const activeYear = (tahunAjaranList || []).find((item) => item.is_active)
 const yearId = activeYear?.id || tahunAjaranList?.[0]?.id || ''
 const activeSemester = (options.semester || []).find(
 (item) => item.is_active && item.academic_year_id === yearId
 )
 setEditing(null)
 setFormErrors({})
 setConflictWarning('')
 setIsDirty(false)
 setForm({
 ...emptyForm,
 unit_pendidikan_id: (isGuru || isTu) && userUnitId ? userUnitId : (unitFilter || ''),
 academic_year_id: yearId,
 semester_id:
 activeSemester?.id ||
 options.semester?.find((item) => item.academic_year_id === yearId)?.id ||
 '',
 })
 setModal(true)
 }

 const openEdit = (item) => {
 setEditing(item)
 setFormErrors({})
 setConflictWarning('')
 setIsDirty(false)

 // Detect unit_pendidikan_id from item's class or subject or employee
 const detectedUnitId =
 item.kelas?.unit_pendidikan_id ||
 item.subject?.unit_pendidikan_id ||
 item.employee?.unit_id ||
 ''

 setForm({
 unit_pendidikan_id: detectedUnitId,
 kelas_id: item.kelas_id || item.school_class_id || '',
 employee_id: item.employee_id || item.teacher_id || '',
 subject_id: item.subject_id || '',
 activity_type: item.activity_type || 'kbm',
 activity_name: item.activity_name || '',
 academic_year_id: item.academic_year_id || '',
 semester_id: item.semester_id || '',
 day_of_week: item.day_of_week || 1,
 time_start: item.time_start?.slice(0, 5) || '07:30',
 time_end: item.time_end?.slice(0, 5) || '09:00',
 week_type: item.week_type || 'all',
 is_active: item.is_active ?? true,
 notes: item.metadata?.notes || '',
 })
 setModal(true)
 }

 // Handle Form Input Change with Dependent Dropdown Logic
 const handleFormChange = (field, value) => {
 setIsDirty(true)
 setFormErrors((prev) => ({ ...prev, [field]: null }))
 setConflictWarning('')

 setForm((prev) => {
 const updated = { ...prev, [field]: value }

 // If Unit changes: reset dependent fields if invalid for new unit
 if (field === 'unit_pendidikan_id') {
 if (value) {
 const validClass = (options.kelas || []).find(
 (k) => k.id === prev.kelas_id && k.unit_pendidikan_id === value
 )
 if (!validClass) updated.kelas_id = ''

 const validGuru = (options.guru || []).find(
 (g) => g.id === prev.employee_id && g.unit_id === value
 )
 if (!validGuru) updated.employee_id = ''

 const validSubject = (options.mata_pelajaran || []).find(
 (m) =>
 m.id === prev.subject_id &&
 (!m.unit_pendidikan_id || m.unit_pendidikan_id === value)
 )
 if (!validSubject) updated.subject_id = ''
 }
 }

 // If Tahun Ajaran changes: reset semester & kelas
 if (field === 'academic_year_id') {
 const validSemester = (options.semester || []).find(
 (s) => s.id === prev.semester_id && s.academic_year_id === value
 )
 if (!validSemester) {
 const firstSemester = (options.semester || []).find(
 (s) => s.academic_year_id === value
 )
 updated.semester_id = firstSemester?.id || ''
 }
 updated.kelas_id = ''
 }

 // If Kelas is selected directly: auto-populate unit, year, semester if empty
 if (field === 'kelas_id' && value) {
 const selectedKelas = (options.kelas || []).find((k) => String(k.id) === String(value))
 if (selectedKelas) {
 if (selectedKelas.unit_pendidikan_id) {
 updated.unit_pendidikan_id = selectedKelas.unit_pendidikan_id
 }
 if (selectedKelas.tahun_ajaran_id) {
 updated.academic_year_id = selectedKelas.tahun_ajaran_id
 }
 if (selectedKelas.semester_id) {
 updated.semester_id = selectedKelas.semester_id
 }
 }
 }

 return updated
 })
 }

 // Validate form client-side
 const validateClient = () => {
 const errors = {}
 if (!form.academic_year_id) errors.academic_year_id = 'Tahun Ajaran wajib dipilih.'
 if (!form.semester_id) errors.semester_id = 'Semester wajib dipilih.'
 if (!form.kelas_id) errors.kelas_id = 'Kelas / Rombel wajib dipilih.'

 const isKbm = (form.activity_type || 'kbm') === 'kbm'

 if (isKbm) {
 if (!form.employee_id) errors.employee_id = 'Guru Pengampu wajib dipilih.'
 if (!form.subject_id) errors.subject_id = 'Mata Pelajaran wajib dipilih.'
 } else {
 if (!form.activity_name?.trim()) {
 errors.activity_name = 'Nama kegiatan sekolah wajib diisi (contoh: Upacara Bendera, Dzikir Pagi, Waktu Istirahat, ISHOMA, dll.).'
 }
 }

 if (!form.day_of_week) errors.day_of_week = 'Hari wajib dipilih.'
 if (!form.time_start) errors.time_start = 'Jam mulai wajib diisi.'
 if (!form.time_end) errors.time_end = 'Jam selesai wajib diisi.'

 if (form.time_start && form.time_end && form.time_end <= form.time_start) {
 errors.time_end = 'Jam selesai harus lebih akhir dari jam mulai.'
 }

 setFormErrors(errors)
 return Object.keys(errors).length === 0
 }

 const submit = (event) => {
 event.preventDefault()
 if (!validateClient()) {
 return
 }

 const isKbm = (form.activity_type || 'kbm') === 'kbm'
 const payload = {
 kelas_id: form.kelas_id,
 employee_id: isKbm ? form.employee_id : (form.employee_id || null),
 subject_id: isKbm ? form.subject_id : null,
 activity_type: isKbm ? 'kbm' : 'activity',
 activity_name: !isKbm ? (form.activity_name?.trim() || null) : null,
 academic_year_id: form.academic_year_id,
 semester_id: form.semester_id,
 day_of_week: Number(form.day_of_week),
 time_start: form.time_start,
 time_end: form.time_end,
 week_type: form.week_type,
 is_active: form.is_active,
 }

 saveMutation.mutate(payload)
 }

 const remove = (item) => {
 setDeleteItem(item)
 }

 const resetFilters = () => {
 setSearch('')
 // Untuk role non-global (Kepala Sekolah, TU, Guru): kembalikan ke scope unit-nya sendiri
 setUnitFilter(!canSelectUnit && userUnitId ? String(userUnitId) : '')
 setProgramTypeFilter('')
 setYearFilter('')
 setSemesterFilter('')
 setSubjectFilter('')
 setClassFilter('')
 setDayFilter('')
 setTeacherFilter(isGuru && guruEmployeeId ? guruEmployeeId : '')
 setStatusFilter('')
 setConflictOnlyFilter(false)
 setPage(1)
 }

 const activeFilterCount = [
 // Untuk Guru & TU: unitFilter adalah scope wajib institusi tempat bertugas, bukan filter aktif yang bisa direset
 !(isGuru || isTu) ? unitFilter : null,
 !(isGuru || isTu) ? programTypeFilter : null,
 yearFilter,
 semesterFilter,
 subjectFilter,
 classFilter,
 dayFilter,
 !isGuru ? teacherFilter : null,
 statusFilter,
 conflictOnlyFilter ? 'conflict' : null,
 ].filter(Boolean).length


 // File Select for Harmonized Import Modal
 const handleFileSelect = async (e) => {
 const file = e.target.files?.[0]
 if (!file) return
 setImportFile(file)
 setImportFailures([])

 try {
 const rows = await parseSpreadsheetFile(file)
 setImportPreviewData(rows.slice(0, 10))
 } catch (err) {
 console.error('Failed to parse file preview', err)
 pushToast('Peringatan Format', err.message || 'Gagal membaca berkas spreadsheet.', 'error')
 setImportPreviewData([])
 }
 }

 // Process Import for Harmonized Import Modal
 const handleProcessImport = async () => {
 if (!importFile) return
 setIsImporting(true)
 setImportFailures([])
 try {
 const allRows = await parseSpreadsheetFile(importFile)
 if (allRows.length === 0) {
 pushToast('Peringatan', 'Berkas spreadsheet tidak memiliki baris data.', 'error')
 setIsImporting(false)
 return
 }

 let success = 0
 const failures = []
 for (let index = 0; index < allRows.length; index += 1) {
 const row = allRows[index]
 try {
 const payload = {
 ...row,
 academic_year_id: row.academic_year_id || yearFilter || undefined,
 semester_id: row.semester_id || semesterFilter || undefined,
 day_of_week: Number(row.day_of_week),
 time_start: String(row.time_start || '').trim().slice(0, 5),
 time_end: String(row.time_end || '').trim().slice(0, 5),
 is_active: !['0', 'false', 'nonaktif'].includes(String(row.is_active).toLowerCase()),
 }
 await scheduleService.tambah(payload)
 success += 1
 } catch (error) {
 const resData = error.response?.data
 let detailMsg = resData?.message || 'Data tidak valid'
 if (resData?.errors && typeof resData.errors === 'object') {
 const errList = Object.values(resData.errors).flat()
 if (errList.length > 0) {
 detailMsg = errList.join(' • ')
 }
 }
 failures.push({
 row: index + 2,
 message: detailMsg,
 data: row,
 })
 }
 }
 queryClient.invalidateQueries({ queryKey: ['schedules'] })
 setIsImporting(false)

 if (failures.length === 0) {
 setShowImportModal(false)
 setImportFile(null)
 setImportPreviewData([])
 setImportFailures([])
 pushToast('Import Berhasil', `${success} jadwal pelajaran berhasil diimport.`, 'success')
 } else {
 setImportFailures(failures)
 if (success > 0) {
 pushToast(
 'Import Sebagian Berhasil',
 `${success} jadwal berhasil, ${failures.length} baris gagal divalidasi. Periksa rincian pada banner di atas.`,
 'warning'
 )
 } else {
 pushToast(
 'Import Gagal',
 `Seluruh ${failures.length} baris data gagal divalidasi oleh server (Error 422). Periksa rincian pada banner merah di atas.`,
 'error'
 )
 }
 }
 } catch (err) {
 setIsImporting(false)
 pushToast('Gagal Impor', err.message || 'Gagal membaca berkas spreadsheet.', 'error')
 }
 }

 // Template Download for Harmonized Import Modal
 const handleDownloadTemplate = (type = 'xlsx') => {
 const sampleData = [
 {
 kelas_id: 'uuid-kelas',
 employee_id: 'uuid-guru',
 subject_id: 'uuid-mapel',
 academic_year_id: 'uuid-tahun-ajaran',
 semester_id: 'uuid-semester',
 day_of_week: '1',
 time_start: '07:30',
 time_end: '09:00',
 week_type: 'all',
 is_active: '1',
 },
 ]
 downloadSpreadsheetTemplate(sampleData, 'template_import_jadwal', type)
 }

 // Harmonized Batch Export Handler
 const handleProcessExport = async () => {
 setShowExportModal(false)

 if (exportFormat === 'pdf') {
 const allRows = Array.isArray(items) ? items : []
 if (allRows.length === 0) {
 pushToast('Peringatan', 'Tidak ada data jadwal untuk diekspor.', 'warning')
 return
 }
 downloadPdfTable({
 title: 'Laporan Data Jadwal Pelajaran',
 subtitle: 'Daftar Sesi Pelajaran & Jam Mengajar Sekolah Islam Terpadu',
 headers: ['NO', 'HARI & JAM', 'MATA PELAJARAN', 'KELAS & UNIT', 'GURU PENGAMPUL', 'PERIODE AKADEMIK', 'STATUS'],
 rows: allRows.map((row, i) => [
 i + 1,
 `${row.nama_hari || DAYS_MAP.find((d) => d.id === row.day_of_week)?.name || 'Senin'} (${formatTime(row.time_start)} - ${formatTime(row.time_end)})`,
 `${subjectName(row.subject) || row.activity_name || row.subject_name || '-'}${row.subject?.kode_mapel || row.subject?.code ? ` [${row.subject.kode_mapel || row.subject.code}]` : ''}`,
 `${row.kelas?.nama_kelas || row.school_class?.name || row.kelas_name || '-'}${row.kelas?.unit_pendidikan?.name || row.unit_name ? ` (${row.kelas?.unit_pendidikan?.name || row.unit_name})` : ''}`,
 `${row.employee?.nama_lengkap || row.teacher?.name || row.guru_name || '-'}${row.employee?.niy ? ` (NIY ${row.employee.niy})` : ''}`,
 `${row.academic_year?.name || row.tahun_ajaran_name || '-'}${row.semester?.name ? ` - ${row.semester.name}` : ''}`,
 row.is_active ? 'Aktif' : 'Nonaktif',
 ]),
 filename: `laporan_jadwal_${new Date().toISOString().slice(0, 10)}.pdf`,
 })
 pushToast('Export Berhasil', 'Dokumen PDF jadwal pelajaran berhasil diunduh.', 'success')
 return
 }

 // Excel (.xlsx, .xls) / CSV
 try {
 const params = {
 search: search || undefined,
 unit_pendidikan_id: unitFilter || undefined,
 program_type: programTypeFilter || undefined,
 academic_year_id: yearFilter || undefined,
 semester_id: semesterFilter || undefined,
 subject_id: subjectFilter || undefined,
 kelas_id: classFilter || undefined,
 day_of_week: effectiveDayFilter || undefined,
 employee_id: teacherFilter || undefined,
 is_active: statusFilter || undefined,
 }

 const res = await downloadFileFromApi(
 '/schedules/export',
 params,
 exportFormat,
 `export_jadwal_${new Date().toISOString().slice(0, 10)}`
 )

 if (res?.success) {
 pushToast('Export Berhasil', `Data jadwal berhasil diekspor ke format .${exportFormat.toUpperCase()}.`, 'success')
 return
 }

 // Fallback ke Client-Side via XLSX (SheetJS) jika API backend tidak merespons berkas binary
 if (items && items.length > 0) {
 const exportData = items.map((row, i) => ({
 'No': i + 1,
 'Hari': row.nama_hari || DAYS_MAP.find((d) => d.id === row.day_of_week)?.name || 'Senin',
 'Jam Mulai': row.time_start || row.start_time || '',
 'Jam Selesai': row.time_end || row.end_time || '',
 'Mata Pelajaran': subjectName(row.subject) || row.activity_name || row.subject_name || '-',
 'Kelas': row.kelas?.nama_kelas || row.school_class?.name || row.kelas_name || '-',
 'Unit': row.kelas?.unit_pendidikan?.name || row.unit_name || '-',
 'Guru Pengampu': row.employee?.nama_lengkap || row.teacher?.name || row.guru_name || '-',
 'Tahun Ajaran': row.academic_year?.name || row.tahun_ajaran_name || '-',
 'Semester': row.semester?.name || row.semester_name || '-',
 'Status': row.is_active ? 'Aktif' : 'Nonaktif',
 }))
 downloadSpreadsheetTemplate(
 exportData,
 `export_jadwal_${new Date().toISOString().slice(0, 10)}`,
 exportFormat,
 'Jadwal Pelajaran'
 )
 pushToast('Export Berhasil', `Data jadwal berhasil diekspor ke format .${exportFormat.toUpperCase()}.`, 'success')
 } else {
 pushToast('Error', 'Gagal mengunduh berkas ekspor jadwal.', 'error')
 }
 } catch (err) {
 console.error('Export schedule error:', err)
 // Ultimate fallback: XLSX client-side
 if (items && items.length > 0) {
 const exportData = items.map((row, i) => ({
 'No': i + 1,
 'Hari': row.nama_hari || DAYS_MAP.find((d) => d.id === row.day_of_week)?.name || 'Senin',
 'Jam Mulai': row.time_start || row.start_time || '',
 'Jam Selesai': row.time_end || row.end_time || '',
 'Mata Pelajaran': subjectName(row.subject) || row.activity_name || row.subject_name || '-',
 'Kelas': row.kelas?.nama_kelas || row.school_class?.name || row.kelas_name || '-',
 'Unit': row.kelas?.unit_pendidikan?.name || row.unit_name || '-',
 'Guru Pengampu': row.employee?.nama_lengkap || row.teacher?.name || row.guru_name || '-',
 'Tahun Ajaran': row.academic_year?.name || row.tahun_ajaran_name || '-',
 'Semester': row.semester?.name || row.semester_name || '-',
 'Status': row.is_active ? 'Aktif' : 'Nonaktif',
 }))
 downloadSpreadsheetTemplate(
 exportData,
 `export_jadwal_${new Date().toISOString().slice(0, 10)}`,
 exportFormat,
 'Jadwal Pelajaran'
 )
 pushToast('Export Berhasil', `Data jadwal berhasil diekspor ke format .${exportFormat.toUpperCase()}.`, 'success')
 } else {
 pushToast('Error', 'Gagal mengunduh berkas ekspor.', 'error')
 }
 }
 }

 // Matrix Print Execution Handler (Resmi A4 Landscape Full Day & Boarding)
 const handleExecuteMatrixPrint = async () => {
 try {
 setIsGeneratingMatrix(true)
 const targetKelasId = printKelasFilter || (classFilter && classFilter !== 'all' ? classFilter : '')
 const targetUnitId = (isGuru || isTu) && userUnitId ? userUnitId : (unitFilter && unitFilter !== 'all' ? unitFilter : (activeUnitObj?.id ? String(activeUnitObj.id) : ''))
 const matrixData = await scheduleService.getMatrix({
 kelas_id: targetKelasId,
 unit_id: targetUnitId,
 })

 if (!matrixData || !matrixData.kop) {
 pushToast('Peringatan', 'Data matriks jadwal tidak ditemukan.', 'warning')
 return
 }

 setIsPrintModalOpen(false)
 printMatrixSchedule(matrixData)
 pushToast('Siap Cetak', 'Dokumen Matriks Jadwal Pelajaran resmi telah dimuat ke printer.', 'success')
 } catch (err) {
 pushToast('Error', 'Gagal memproses data matriks jadwal: ' + (err?.message || 'Error server'), 'error')
 } finally {
 setIsGeneratingMatrix(false)
 }
 }

 // Print Execution Handler
 const handleExecutePrint = (mode = 'clean') => {
 setIsPrintModalOpen(false)
 const allRows = Array.isArray(items) ? items : []
 const printTeacher = (options.guru || []).find((g) => g.id === printTeacherFilter)
 const rowsToPrint = printTeacherFilter
 ? allRows.filter(
 (r) =>
 r.employee_id === printTeacherFilter ||
 r.employee?.id === printTeacherFilter ||
 r.teacher_id === printTeacherFilter
 )
 : allRows

 const printConfig = {
 title: printTeacher
 ? `Laporan Jadwal Pelajaran - ${printTeacher.nama_lengkap}`
 : 'Laporan Data Jadwal Pelajaran',
 subtitle: printTeacher
 ? `Jadwal Mengajar Guru: ${printTeacher.nama_lengkap}${printTeacher.niy ? ` (NIY ${printTeacher.niy})` : ''}`
 : 'Daftar Sesi Pelajaran & Jam Mengajar Sekolah Islam Terpadu',
 headers: ['NO', 'HARI & JAM', 'MATA PELAJARAN', 'KELAS & UNIT', 'GURU PENGAMPUL', 'PERIODE AKADEMIK', 'STATUS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 `${row.nama_hari || DAYS_MAP.find((d) => d.id === row.day_of_week)?.name || 'Senin'} (${formatTime(row.time_start)} - ${formatTime(row.time_end)})`,
 `${subjectName(row.subject) || row.subject_name || '-'}${row.subject?.kode_mapel || row.subject?.code ? ` [${row.subject.kode_mapel || row.subject.code}]` : ''}`,
 `${row.kelas?.nama_kelas || row.school_class?.name || row.kelas_name || '-'}${row.kelas?.unit_pendidikan?.name || row.unit_name ? ` (${row.kelas?.unit_pendidikan?.name || row.unit_name})` : ''}`,
 `${row.employee?.nama_lengkap || row.teacher?.name || row.guru_name || '-'}${row.employee?.niy ? ` (NIY ${row.employee.niy})` : ''}`,
 `${row.academic_year?.name || row.tahun_ajaran_name || '-'}${row.semester?.name ? ` - ${row.semester.name}` : ''}`,
 row.is_active ? 'Aktif' : 'Nonaktif',
 ]),
 }

 if (mode === 'pdf') {
 downloadPdfTable({
 ...printConfig,
 filename: printTeacher
 ? `jadwal_mengajar_${printTeacher.nama_lengkap.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`
 : 'laporan_jadwal_pelajaran.pdf',
 })
 pushToast('Dokumen PDF Siap', 'Berkas PDF jadwal pelajaran telah diunduh.', 'success')
 } else {
 printCleanTable(printConfig)
 }
 }

 // Weekly Grid Schedule Data Grouping
 const weeklyGridData = useMemo(() => {
 return items.filter((item) => (item.day_of_week ?? 1) === Number(selectedWeeklyDay))
 }, [items, selectedWeeklyDay])

  const pageActions = (
    <PageToolbarActions
      onPrint={() => setIsPrintModalOpen(true)}
      printLabel="Cetak Jadwal Pelajaran"
      onImport={canManage ? () => setShowImportModal(true) : undefined}
      importLabel="Import Data Jadwal"
      onExport={canManage ? () => setShowExportModal(true) : undefined}
      exportLabel="Export Data Jadwal"
      onAdd={canManage ? openAdd : undefined}
      addLabel="Tambah Jadwal Baru"
    />
  )

 // Guru dilarang mengakses halaman Master Jadwal Pelajaran (dialihkan ke Portal Guru)
 if (isGuru && !embedded) {
 return <Navigate to="/portal-guru/workspace?tab=jadwal" replace />
 }

 const shouldHideHeader = embedded || hidePageHeader

 return (
 <MasterDataPage
 className="schedule-master-page space-y-6"
 hideBreadcrumb={true}
 >
        {/* ══════════════════════════════════════════════════════════════════
            1. HARMONIZED PRINT OPTION MODAL (AppModal)
            ══════════════════════════════════════════════════════════════════ */}
        <AppModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          icon={Printer}
          title="Cetak Dokumen Resmi Jadwal"
          badge="A4 Landscape & Portrait"
          description="Pilih format dokumen cetak resmi (Matriks Mingguan atau Rekap Log)"
          maxWidth="max-w-lg"
          footer={
            <button
              type="button"
              onClick={() => setIsPrintModalOpen(false)}
              className="h-9.5 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Tutup</span>
            </button>
          }
        >
          {/* Tab Pemilih Format Dokumen */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl">
            <button
              type="button"
              onClick={() => setPrintFormatMode('matrix')}
              className={cn(
                'flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer active:scale-95',
                printFormatMode === 'matrix'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-100/60 dark:text-slate-300 dark:hover:bg-slate-800'
              )}
            >
              <LayoutGrid className="size-3.5" />
              <span>Matriks Mingguan (Resmi)</span>
            </button>

            <button
              type="button"
              onClick={() => setPrintFormatMode('table')}
              className={cn(
                'flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-black transition-all cursor-pointer active:scale-95',
                printFormatMode === 'table'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-100/60 dark:text-slate-300 dark:hover:bg-slate-800'
              )}
            >
              <TableIcon className="size-3.5" />
              <span>Rekap Tabel Baris</span>
            </button>
          </div>

          {printFormatMode === 'matrix' ? (
            /* ── FORMAT 1: MATRIKS MINGGUAN RESMI (A4 LANDSCAPE) ── */
            <div className="space-y-4">
              {/* Pilihan Rombel / Kelas */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    Pilih Rombel / Kelas Target
                  </label>
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    {activeUnitObj?.program_type === 'boarding' ? 'Boarding School' : 'Full Day School'}
                  </span>
                </div>
                <HeroUiFilterSelect
                  ariaLabel="Pilih Rombel / Kelas Target"
                  value={printKelasFilter}
                  onChange={(val) => setPrintKelasFilter(val)}
                  options={printKelasOptions}
                  placeholder="Kelas Aktif / Paling Atas di Unit"
                  icon={GraduationCap}
                  searchable
                  allowClear
                  className="w-full"
                  popoverWidth="w-full"
                  size="lg"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Mencetak tabel jadwal matriks mingguan (Senin s/d Sabtu) dengan Kop Surat Resmi Lembaga, identitas wali kelas, kepala sekolah, serta pembedaan otomatis Full Day vs Boarding School.
                </p>
              </div>

              {/* Callout Info Zero Hardcode */}
              <div className="rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-emerald-50/70 p-3.5 dark:bg-emerald-950/40">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="size-4.5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs text-emerald-950 dark:text-emerald-200 leading-snug">
                    <strong>Data Asli Database (Zero Hardcode):</strong> Slot waktu, mapel, guru, dan pengesahan diturunkan 100% dari database nyata unit. Slot kosong tampil bersih tanpa data karangan.
                  </div>
                </div>
              </div>

              {/* Tombol Cetak Matriks */}
              <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60">
                <button
                  type="button"
                  disabled={isGeneratingMatrix}
                  onClick={handleExecuteMatrixPrint}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-left transition-all duration-200 cursor-pointer shadow-md shadow-emerald-600/20 group text-white active:scale-[0.99] disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-white/20 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform border border-white/25">
                      <Printer className="size-4.5 text-white" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-white">
                        {isGeneratingMatrix ? 'Memuat Data Matriks...' : 'Cetak Matriks Jadwal Resmi (A4 Landscape)'}
                      </h5>
                      <p className="text-xs text-emerald-100">
                        Kop Surat Lembaga • Format Matriks Mingguan • Tanda Tangan Resmi
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          ) : (
            /* ── FORMAT 2: REKAP TABEL BARIS (A4 PORTRAIT) ── */
            <div className="space-y-4">
              {/* Teacher Scope Filter */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Filter Guru Pengampu (Opsional)
                </label>
                <HeroUiFilterSelect
                  ariaLabel="Filter Guru Pengampu"
                  value={printTeacherFilter}
                  onChange={(val) => setPrintTeacherFilter(val)}
                  options={printTeacherOptions}
                  placeholder="Semua Guru (Seluruh Jadwal Terfilter)"
                  icon={Users}
                  searchable
                  allowClear
                  className="w-full"
                  popoverWidth="w-full"
                  size="lg"
                />
                <p className="text-xs text-slate-400">
                  {printTeacherFilter
                    ? 'Mencetak jadwal khusus untuk guru terpilih.'
                    : 'Mencetak seluruh baris jadwal yang aktif pada filter saat ini.'}
                </p>
              </div>

              {/* Action Cards */}
              <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60 space-y-2.5">
                <button
                  type="button"
                  onClick={() => handleExecutePrint('clean')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-emerald-50/70 hover:bg-emerald-100/70 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Printer className="size-4.5" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-900 dark:text-white">Cetak Rekap Tabel (Print Clean)</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Tampilan cetak browser resmi tanpa artefak sidebar/navigasi</p>
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleExecutePrint('pdf')}
                  className="w-full flex items-center justify-between p-3.5 rounded-xl border-2 border-rose-300 dark:border-rose-800/70 bg-rose-50/70 hover:bg-rose-100/70 dark:bg-rose-950/30 dark:hover:bg-rose-900/40 text-left transition-all duration-200 cursor-pointer shadow-2xs hover:shadow-xs group"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
                      <Download className="size-4.5" strokeWidth={2.25} />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-slate-900 dark:text-white">Unduh Berkas PDF (.pdf)</h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Unduh dokumen jadwal pelajaran siap arsip dalam format PDF</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}
        </AppModal>

        {/* ══════════════════════════════════════════════════════════════════
            2. HARMONIZED BATCH EXPORT MODAL (AppModal)
            ══════════════════════════════════════════════════════════════════ */}
        <AppModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          icon={Download}
          title="Export Data Jadwal"
          badge="Unduh"
          description="Pilih format berkas untuk mengekspor data jadwal pelajaran"
          maxWidth="max-w-md"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
              >
                <X className="size-4" strokeWidth={2} />
                <span>Batal</span>
              </button>
              <button
                type="button"
                onClick={handleProcessExport}
                className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20"
              >
                <Download className="size-4 text-white" strokeWidth={2.25} />
                <span>Unduh Berkas</span>
              </button>
            </div>
          }
        >
          <div className="space-y-2.5">
            {[
              { value: 'xlsx', label: 'Excel (.xlsx)', desc: 'Format Microsoft Excel Modern (Disarankan)' },
              { value: 'xls', label: 'Excel Legacy (.xls)', desc: 'Format Microsoft Excel Standard 97-2003' },
              { value: 'csv', label: 'CSV (.csv)', desc: 'Format Comma-Separated Values universal' },
              { value: 'pdf', label: 'PDF (.pdf)', desc: 'Format Dokumen Cetak Resmi' },
            ].map((opt) => (
              <label
                key={opt.value}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3.5 transition-all',
                  exportFormat === opt.value
                    ? 'border-emerald-500 bg-emerald-50/70 shadow-xs ring-2 ring-emerald-500/20 dark:border-emerald-600 dark:bg-emerald-950/40'
                    : 'border-[#b6f6d9] dark:border-emerald-700/80 bg-emerald-50/20 hover:border-emerald-400 dark:hover:bg-emerald-950/30'
                )}
              >
                <input
                  type="radio"
                  name="export-fmt-schedule"
                  value={opt.value}
                  checked={exportFormat === opt.value}
                  onChange={() => setExportFormat(opt.value)}
                  className="accent-emerald-600 size-4"
                />
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{opt.label}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{opt.desc}</p>
                </div>
              </label>
            ))}

            {/* Active Scope Summary */}
            <div className="mt-3 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-emerald-50/40 p-3 dark:bg-emerald-950/20 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                <span>Total Data Terpilih:</span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400">
                  {Number(items?.length || 0).toLocaleString('id-ID')} Baris Jadwal
                </span>
              </div>
            </div>
          </div>
        </AppModal>

        {/* ══════════════════════════════════════════════════════════════════
            3. HARMONIZED BATCH IMPORT MODAL (AppModal)
            ══════════════════════════════════════════════════════════════════ */}
        <AppModal
          isOpen={showImportModal}
          onClose={() => { if (!isImporting) setShowImportModal(false) }}
          icon={Upload}
          title="Import Jadwal Pelajaran"
          badge="Batch Import"
          description="Unggah berkas spreadsheet (.csv) untuk impor jadwal pelajaran massal"
          maxWidth="max-w-xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <button
                type="button"
                disabled={isImporting}
                onClick={() => setShowImportModal(false)}
                className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
              >
                <X className="size-4" strokeWidth={2} />
                <span>Batal</span>
              </button>
              <button
                type="button"
                onClick={handleProcessImport}
                disabled={!importFile || isImporting}
                className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isImporting ? (
                  <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Upload className="size-4 text-white" strokeWidth={2.25} />
                )}
                <span>{isImporting ? 'Memproses Impor...' : 'Mulai Impor Data'}</span>
              </button>
            </div>
          }
        >
          <div className="space-y-4">
            {/* Error Banner Rincian Gagal Validasi Server */}
            {importFailures.length > 0 && (
              <div className="flex flex-col gap-2 rounded-xl border-2 border-rose-300 dark:border-rose-800/60 bg-rose-50/95 p-4 text-rose-900 dark:bg-rose-950/50 dark:text-rose-200 shadow-sm animate-fadeIn">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-xs text-rose-800 dark:text-rose-300 uppercase tracking-wide">
                    <AlertTriangle className="size-4.5 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span>Gagal Memvalidasi {importFailures.length} Baris Jadwal (Error 422)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setImportFailures([])}
                    className="text-xs font-bold text-rose-700 hover:text-rose-900 dark:text-rose-300 dark:hover:text-white underline cursor-pointer"
                  >
                    Tutup Banner
                  </button>
                </div>
                <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                  Server menolak data berikut karena tidak memenuhi syarat validasi (ID relasi tidak terdaftar, jadwal bentrok waktu/ruang/guru, atau format waktu tidak sesuai):
                </p>
                <div className="max-h-40 overflow-y-auto space-y-2 text-xs pr-1">
                  {importFailures.map((f, idx) => (
                    <div key={idx} className="rounded-xl border border-rose-200 dark:border-rose-800/60 bg-rose-50/50 p-2.5 dark:bg-slate-900/70 flex items-start gap-2">
                      <span className="font-bold text-rose-800 dark:text-rose-300 shrink-0 rounded bg-rose-100 dark:bg-rose-900/60 px-1.5 py-0.5 text-[10px]">
                        Baris {f.row}
                      </span>
                      <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{f.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Unduh Template Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-emerald-50/40 p-4 dark:bg-slate-900/40">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
                  <Download className="size-4.5 text-white" strokeWidth={2.2} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Unduh Format Berkas</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Gunakan template resmi agar kolom jadwal terpetakan otomatis</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate('xlsx')}
                  className="inline-flex items-center gap-1.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-emerald-100/70 hover:bg-emerald-200/70 text-emerald-800 px-3 py-1.5 text-xs font-bold transition-all dark:bg-emerald-950/40 dark:text-emerald-300 cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <div className="flex size-5 items-center justify-center rounded-md bg-emerald-600 text-white">
                    <Download className="size-3 text-white" strokeWidth={2.2} />
                  </div>
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadTemplate('csv')}
                  className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-slate-200/80 hover:bg-slate-300/80 text-slate-700 px-3 py-1.5 text-xs font-bold transition-all dark:bg-slate-800 dark:text-slate-200 cursor-pointer hover:scale-[1.02] active:scale-95"
                >
                  <div className="flex size-5 items-center justify-center rounded-md bg-slate-600 text-white">
                    <Download className="size-3 text-white" strokeWidth={2.2} />
                  </div>
                  <span>CSV</span>
                </button>
              </div>
            </div>

            {/* Dropzone Upload */}
            <label className="group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-400 dark:border-emerald-700 bg-emerald-50/40 p-6 text-center transition-all duration-200 hover:border-emerald-500 hover:bg-emerald-50/70 hover:shadow-xs dark:bg-slate-900/30 dark:hover:bg-emerald-950/20">
              <div className="mb-2.5 flex size-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-110">
                <FileSpreadsheet className="size-6 text-white" strokeWidth={2.2} />
              </div>
              <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                {importFile ? importFile.name : 'Pilih atau Tarik Berkas Jadwal (.xlsx, .xls, .csv) ke Sini'}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Mendukung format Excel Spreadsheet (.xlsx, .xls) dan CSV (.csv)
              </p>
              {importFile && (
                <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-bold text-emerald-700 border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                  <CheckCircle2 className="size-3.5" />
                  <span>{(importFile.size / 1024).toFixed(1)} KB · Berkas Siap Diunggah</span>
                </div>
              )}
              <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileSelect} className="hidden" />
            </label>

            {/* Guidance Banner */}
            <div className="rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-emerald-50/70 p-3.5 dark:bg-emerald-950/30 flex items-start gap-2.5">
              <ShieldCheck className="size-4.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                <p className="font-bold text-emerald-700 dark:text-emerald-300">Panduan Pengisian Berkas Impor:</p>
                <p>• Kolom <strong>kelas_id</strong>, <strong>employee_id</strong>, dan <strong>subject_id</strong> wajib berupa UUID unik terdaftar di sistem.</p>
                <p>• Jam <strong>time_start</strong> &amp; <strong>time_end</strong> wajib format <code>HH:mm</code> (contoh: <code>07:30</code> dan <code>09:00</code>).</p>
                <p>• Hari <strong>day_of_week</strong> diisi angka 1 (Senin) hingga 7 (Minggu).</p>
              </div>
            </div>

            {/* Table Preview */}
            {importPreviewData.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <span>Preview Data Berkas</span>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                      {importPreviewData.length} baris pertama
                    </span>
                  </p>
                </div>
                <div className="max-h-44 overflow-auto rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-emerald-50/20 shadow-2xs dark:bg-[#182232]">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
                      <tr>
                        {['Kelas ID', 'Guru ID', 'Mapel ID', 'Hari', 'Mulai', 'Selesai'].map((h) => (
                          <th key={h} className="px-3 py-2.5">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                      {importPreviewData.map((r, i) => (
                        <tr key={i} className="hover:bg-emerald-50/30 dark:hover:bg-emerald-950/30 transition-colors">
                          <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{r.kelas_id || '-'}</td>
                          <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{r.employee_id || '-'}</td>
                          <td className="px-3 py-2 font-mono text-slate-700 dark:text-slate-300 truncate max-w-[100px]">{r.subject_id || '-'}</td>
                          <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">{r.day_of_week || '-'}</td>
                          <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">{r.time_start || '-'}</td>
                          <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">{r.time_end || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </AppModal>

 {/* ── Breadcrumb Navigation ── */}
 {!(embedded || hideBreadcrumb) && (
 <div className="print:hidden">
 <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Jadwal Pelajaran' }]} />
 </div>
 )}

 {/* ── Modern Hero Header (HeroUI Standard) ── */}
      {!shouldHideHeader && (
        <HeroUiHeader
          title="Jadwal Pelajaran & Plot Mengajar"
          subtitle="Kelola alokasi jam mengajar guru, rombongan belajar, dan mata pelajaran terintegrasi akademik sekolah."
          icon={CalendarDays}
          roleTag="Plot Akademik"
          badge="Jadwal Terpadu"
          className="mb-6"
        />
      )}

 {/* ── Stats Summary Cards (Modern 5-Card Grid - HeroUI Gold Standard) ── */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
 <ModernKpiCard
 icon={CalendarDays}
 label="TOTAL JADWAL"
 value={isLoading ? '—' : Number(stats.total ?? meta.total ?? 0).toLocaleString('id-ID')}
 subtext="Sesi mengajar terdaftar"
 tag="Terdaftar"
 tone="emerald"
 />
 <ModernKpiCard
 icon={CheckCircle2}
 label="JADWAL AKTIF"
 value={isLoading ? '—' : Number(stats.aktif ?? (stats.total !== undefined ? stats.total - (stats.tidak_aktif ?? 0) : meta.total ?? 0)).toLocaleString('id-ID')}
 subtext="Siap digunakan presensi"
 tag="Aktif"
 tone="blue"
 />
 <ModernKpiCard
 icon={Clock3}
 label="NONAKTIF / ARSIP"
 value={isLoading ? '—' : Number(stats.tidak_aktif ?? 0).toLocaleString('id-ID')}
 subtext="Jadwal diarsipkan"
 tag="Arsip"
 tone="amber"
 />
 <ModernKpiCard
 icon={Users}
 label="GURU TERJADWAL"
 value={isLoading ? '—' : Number(stats.guru_terjadwal ?? 0).toLocaleString('id-ID')}
 subtext="Guru mengajar aktif"
 tag="Pengajar"
 tone="indigo"
 />
 <ModernKpiCard
 icon={AlertTriangle}
 label="JADWAL BENTROK"
 value={isLoading ? '—' : Number(stats.total_bentrok ?? 0).toLocaleString('id-ID')}
 subtext={(stats.total_bentrok ?? 0) > 0 ? "Klik filter jadwal bentrok" : "Semua slot jadwal aman"}
 tag={(stats.total_bentrok ?? 0) > 0 ? "Perhatian" : "Aman (0)"}
 tone={(stats.total_bentrok ?? 0) > 0 ? "rose" : "emerald"}
 onClick={() => {
 setConflictOnlyFilter((prev) => !prev)
 setPage(1)
 }}
 isClickable={true}
 />
 </div>

 {/* ── RADAR NOTICE BENTROK JADWAL ── */}
 {(conflictOnlyFilter || (stats.total_bentrok ?? 0) > 0) && (
 <div
 className={cn(
 'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 rounded-xl border-2 p-4.5 shadow-sm transition-all duration-200',
 (stats.total_bentrok ?? 0) > 0
 ? 'border-2 border-rose-300 dark:border-rose-800/80 bg-white dark:bg-[#1B2433] text-rose-950 dark:from-rose-950/40 dark:via-pink-950/20 dark:to-slate-900 dark:text-rose-200'
 : 'border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] text-emerald-950 dark:from-emerald-950/40 dark:to-slate-900 dark:text-emerald-200'
 )}
 >
 <div className="flex items-center gap-3.5">
 <div
 className={cn(
 'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl  shadow-md',
 (stats.total_bentrok ?? 0) > 0
 ? 'bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 shadow-sm'
 : 'bg-white dark:bg-[#1B2433] shadow-sm'
 )}
 >
 {(stats.total_bentrok ?? 0) > 0 ? (
 <AlertTriangle className="h-5.5 w-5.5" />
 ) : (
 <CheckCircle2 className="h-5.5 w-5.5" />
 )}
 </div>
 <div>
 <div className="flex items-center gap-2">
 <span
 className={cn(
 'rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider',
 (stats.total_bentrok ?? 0) > 0
 ? 'bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
 : 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
 )}
 >
 {(stats.total_bentrok ?? 0) > 0 ? 'Radar Peringatan' : 'Radar Keamanan'}
 </span>
 <p className="text-xs font-black">
 {(stats.total_bentrok ?? 0) > 0
 ? `Terdeteksi ${stats.total_bentrok} Jadwal Mengalami Bentrok Jam Operasional`
 : 'Seluruh Jadwal Pelajaran Aktif 100% Bebas Tabrakan Waktu'}
 </p>
 </div>
 <p className="text-xs font-medium opacity-85 mt-1">
 {(stats.total_bentrok ?? 0) > 0
 ? 'Terdapat guru atau kelas yang dijadwalkan pada hari dan jam yang bertabrakan. Silakan klik tombol filter di samping untuk meninjau dan merapikan slot.'
 : 'Sistem validasi backend memastikan tidak ada alokasi jam mengajar yang ganda antara guru, kelas, maupun ruangan.'}
 </p>
 </div>
 </div>
 <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
 {(stats.total_bentrok ?? 0) > 0 && (
 <button
 type="button"
 onClick={() => {
 setConflictOnlyFilter((prev) => !prev)
 setPage(1)
 }}
 className={cn(
 'rounded-xl px-4 py-2 text-xs font-black shadow-xs transition-all duration-150 cursor-pointer',
 conflictOnlyFilter
 ? 'bg-rose-700 text-white hover:bg-rose-800 dark:bg-rose-600 dark:hover:bg-rose-700'
 : 'bg-rose-100 text-rose-800 hover:bg-rose-200 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-900/60 dark:text-rose-200 dark:border-emerald-800/60'
 )}
 >
 {conflictOnlyFilter ? 'Tampilkan Semua Jadwal' : 'Filter Hanya Bentrok'}
 </button>
 )}
 </div>
 </div>
 )}

 {/* ── UNIFIED MASTER DATA CONTAINER (EMERALD DATATABLE CONTAINER) ── */}
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 {/* ── TOOLBAR 3-BARIS TERPADU (HeroUI Benchmark Standard) ── */}
 <div className="border-b border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50 px-4 py-4 sm:px-6 md:px-8 dark:border-emerald-800/60 dark:bg-[#1B2433] print:hidden">
 {/* Baris 1: Header Action Row */}
 <div className="flex flex-col gap-3.5 xl:flex-row xl:items-center xl:justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 pb-3.5">
 {/* Kiri: Icon Badge + Title + Count + Segmented Tab Bar */}
 <div className="flex flex-wrap items-center gap-3.5 min-w-0">
 <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-md shadow-xs border border-emerald-200/80 dark:border-emerald-800/60">
 <CalendarDays className="size-5.5 text-emerald-600" strokeWidth={2.2} />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2.5 flex-wrap">
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
 {viewMode === 'table' ? 'Daftar Jadwal & Plot Mengajar' : 'Matriks Mingguan Jadwal Pelajaran'}
 </h3>
 <span className="inline-flex items-center rounded-full bg-emerald-100/90 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-800">
 {Number(meta.total ?? 0).toLocaleString('id-ID')} jadwal
 </span>
 </div>
 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
 Filter jadwal pelajaran berdasarkan unit, periode akademik, guru, atau rombel.
 </p>
 </div>

 {/* ── TAB DAFTAR TABEL & MATRIKS MINGGUAN (POSISI DI CONTAINER DATATABLE) ── */}
 {/* ── TAB DAFTAR TABEL & MATRIKS MINGGUAN (STANDAR CANONICAL PILL SEGMENTED) ── */}
 <AppTabs
 tabs={[
 {
 id: 'table',
 label: 'Daftar Tabel',
 icon: TableIcon,
 badge: Number(meta.total ?? 0).toLocaleString('id-ID'),
 },
 {
 id: 'weekly',
 label: 'Matriks Mingguan',
 icon: LayoutGrid,
 badge: '7 Hari',
 },
 ]}
 activeTab={viewMode}
 onChange={setViewMode}
 ariaLabel="Mode Tampilan Jadwal"
 />
 </div>

 {/* Kanan: 4 Vivid Gradient Squircle Action Buttons */}
 <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
 {pageActions}
 </div>
 </div>

 {/* Baris 2: Full-width Search Input */}
 <div className="w-full min-w-0 pt-3">
 <AppSearch
 value={search}
 onChange={(e) => {
 setSearch(e.target.value)
 setPage(1)
 }}
 placeholder="Cari guru, mata pelajaran, atau nama kelas..."
 size="sm"
 />
 </div>

 {/* Baris 3: Filter Controls Horizontal */}
 <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full pt-3">
 {/* Filter Unit: Terkunci untuk Kepala Sekolah, Guru & TU; Dropdown untuk Divisi Pendidikan, Super Admin & Yayasan */}
 {!canSelectUnit ? (
 /* Badge unit terkunci (read-only) untuk role unit (Kepala Sekolah, Guru, TU) */
 <div className="inline-flex items-center gap-1.5 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 px-3 py-2 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 shrink-0" title={isKepsek ? 'Unit Pendidikan Kepala Sekolah' : (isTu ? 'Unit Kerja Tata Usaha' : 'Unit Anda')}>
 <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>
 {unitOptions.find((u) => String(u.id) === String(unitFilter))?.name ||
 unitOptions.find((u) => String(u.id) === String(unitFilter))?.nama ||
 authUser?.unit?.name ||
 authUser?.unit_name ||
 authUser?.employee?.unit?.name ||
 authUser?.metadata?.unit_name ||
 'Unit Terkunci'}
 </span>
 </div>
 ) : (
 <HeroUiFilterSelect
 ariaLabel="Filter Unit Pendidikan"
 value={unitFilter}
 onChange={(val) => {
 setUnitFilter(val)
 setClassFilter('')
 setTeacherFilter('')
 setSubjectFilter('')
 setPage(1)
 }}
 options={heroUnitFilterOptions}
 placeholder="Semua Unit"
 icon={Building2}
 searchable
 allowClear
 className="w-full sm:w-auto min-w-[170px]"
 popoverWidth="w-72"
 />
 )}

 {/* Filter Pembeda Program (Full Day vs Boarding) di sebelah Semua Unit */}
 {canSelectUnit && (
 <HeroUiFilterSelect
 ariaLabel="Filter Tipe Program"
 value={programTypeFilter}
 onChange={(val) => {
 const newVal = val
 setProgramTypeFilter(newVal)
 if (newVal && unitFilter) {
 const selUnit = unitOptions.find((u) => String(u.id) === String(unitFilter))
 const isBoarding =
 selUnit?.program_type === 'boarding' ||
 selUnit?.metadata?.is_boarding === true ||
 String(selUnit?.level || '').toLowerCase().includes('ponpes')
 if ((newVal === 'boarding' && !isBoarding) || (newVal === 'fullday' && isBoarding)) {
 setUnitFilter('')
 }
 }
 setClassFilter('')
 setTeacherFilter('')
 setSubjectFilter('')
 setPage(1)
 }}
 options={heroProgramTypeOptions}
 placeholder="Semua Program"
 icon={GraduationCap}
 allowClear
 className="w-full sm:w-auto min-w-[155px]"
 popoverWidth="w-64"
 />
 )}

 <HeroUiFilterSelect
 ariaLabel="Filter Hari Mengajar"
 value={dayFilter}
 onChange={(val) => {
 setDayFilter(val)
 setPage(1)
 }}
 options={heroDayOptions}
 placeholder="Semua Hari"
 icon={Calendar}
 allowClear
 className="w-full sm:w-auto min-w-[140px]"
 popoverWidth="w-48"
 />

 {/* Filter Guru: DISEMBUNYIKAN untuk role Guru (mereka hanya bisa lihat jadwal mereka sendiri) */}
 {!isGuru && (
 <HeroUiFilterSelect
 ariaLabel="Filter Guru"
 value={teacherFilter}
 onChange={(newTeacherId) => {
 setTeacherFilter(newTeacherId)
 if (newTeacherId && subjectFilter) {
 const targetSubj = (options.mata_pelajaran || []).find((m) => String(m.id) === String(subjectFilter))
 if (targetSubj && Array.isArray(targetSubj.guru_ids) && targetSubj.guru_ids.length > 0 && !targetSubj.guru_ids.includes(newTeacherId)) {
 setSubjectFilter('')
 }
 }
 setPage(1)
 }}
 options={heroTeacherOptions}
 placeholder={subjectFilter ? 'Semua Guru Mapel Ini' : 'Semua Guru'}
 icon={Users}
 searchable
 allowClear
 className="w-full sm:w-auto min-w-[170px]"
 popoverWidth="w-72"
 />
 )}

 <HeroUiFilterSelect
 ariaLabel="Filter Mata Pelajaran"
 value={subjectFilter}
 onChange={(newSubjectId) => {
 setSubjectFilter(newSubjectId)
 if (newSubjectId && teacherFilter) {
 const targetGuru = (options.guru || []).find((g) => String(g.id) === String(teacherFilter))
 if (targetGuru && Array.isArray(targetGuru.subject_ids) && targetGuru.subject_ids.length > 0 && !targetGuru.subject_ids.includes(newSubjectId)) {
 setTeacherFilter('')
 }
 }
 setPage(1)
 }}
 options={heroSubjectOptions}
 placeholder={teacherFilter ? 'Semua Mapel Guru Ini' : 'Semua Mata Pelajaran'}
 icon={BookOpen}
 searchable
 allowClear
 className="w-full sm:w-auto min-w-[180px]"
 popoverWidth="w-72"
 />

 <HeroUiFilterSelect
 ariaLabel="Filter Status"
 value={statusFilter}
 onChange={(val) => {
 setStatusFilter(val)
 setPage(1)
 }}
 options={heroStatusOptions}
 placeholder="Semua Status"
 icon={Layers}
 allowClear
 className="w-full sm:w-auto min-w-[145px]"
 popoverWidth="w-48"
 />

 {/* Quick Toggle: Hanya Bentrok */}
 <button
 type="button"
 onClick={() => {
 setConflictOnlyFilter((prev) => !prev)
 setPage(1)
 }}
 className={cn(
 'w-full sm:w-auto inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-150 shrink-0 cursor-pointer',
 conflictOnlyFilter
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-600 text-white shadow-xs'
 : (stats.total_bentrok ?? 0) > 0
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 text-rose-800 hover:bg-rose-100 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300'
 : 'border-emerald-200/80 bg-white text-slate-600 hover:bg-emerald-50/40 dark:border-emerald-700/80 dark:bg-slate-800/80 dark:text-slate-300'
 )}
 >
 <AlertTriangle
 className={cn(
 'size-3.5',
 conflictOnlyFilter
 ? 'text-white'
 : (stats.total_bentrok ?? 0) > 0
 ? 'text-rose-600 dark:text-rose-400'
 : 'text-slate-400'
 )}
 />
 <span>Hanya Bentrok</span>
 {(stats.total_bentrok ?? 0) > 0 && (
 <span
 className={cn(
 'rounded-full px-1.5 py-0.2 text-[10px] font-black',
 conflictOnlyFilter
 ? 'bg-white/20'
 : 'bg-rose-200 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
 )}
 >
 {stats.total_bentrok}
 </span>
 )}
 </button>

 {(Boolean(search) || activeFilterCount > 0) && (
 <button
 type="button"
 onClick={resetFilters}
 className="w-full sm:w-auto sm:ml-auto justify-center inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/80 px-3 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-950/60 transition-colors shrink-0 cursor-pointer"
 >
 <RefreshCcw className="size-3.5" />
 <span>Reset Filter</span>
 </button>
 )}
 </div>
 </div>

 {/* ── BODY CONTENT ── */}
 {isLoading ? (
 <div className="p-8 print:hidden">
 <AppSkeleton variant="table" rows={6} cols={7} />
 </div>
 ) : isError ? (
 <div className="p-8 print:hidden">
 <AppErrorState
 title="Gagal Memuat Jadwal"
 description="Terjadi kesalahan saat memuat data jadwal pelajaran. Silakan coba lagi."
 onRetry={refetch}
 compact
 />
 </div>
 ) : viewMode === 'weekly' ? (
 /* WEEKLY MATRIX GRID VIEW */
 <div className="p-5 space-y-5">
 {/* Canonical Days Tab Strip */}
 {/* Canonical Days Tab Strip */}
 <div
 role="tablist"
 aria-label="Filter Hari Jadwal"
 className="inline-flex w-full items-center gap-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 p-1.5 shadow-2xs overflow-x-auto no-scrollbar"
 >
 <div className="flex w-full gap-1.5 overflow-x-auto no-scrollbar">
 {DAYS_MAP.map((day) => {
 const dayCount =
 stats?.per_hari?.[day.id] ??
 stats?.per_hari?.[String(day.id)] ??
 items.filter((item) => (item.day_of_week ?? 1) === day.id).length
 const isDayActive = selectedWeeklyDay === day.id

 return (
 <button
 key={day.id}
 type="button"
 role="tab"
 aria-selected={isDayActive}
 onClick={() => {
 setSelectedWeeklyDay(day.id)
 setDayFilter(String(day.id))
 setPage(1)
 }}
 className={cn(
 'flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40 shrink-0',
 isDayActive
 ? 'bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white shadow-md shadow-xs scale-[1.01]'
 : 'border border-transparent text-slate-600 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 hover:bg-white/80 dark:hover:bg-slate-700/60 font-bold'
 )}
 >
 <Calendar className="size-3.5" />
 <span>{day.name}</span>
 <span
 className={cn(
 'rounded-full px-2 py-0.5 text-[10px] font-black',
 isDayActive
 ? 'bg-white/20'
 : 'bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
 )}
 >
 {dayCount}
 </span>
 </button>
 )
 })}
 </div>
 </div>

 {/* Grid of Schedules for Selected Day */}
 {weeklyGridData.length > 0 ? (
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {weeklyGridData.map((item) => (
 <div
 key={item.id}
 onClick={() => setDetailDrawerItem(item)}
 className="group relative cursor-pointer rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-4 shadow-xs transition-all duration-200 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:shadow-md hover:-translate-y-0.5 dark:border-emerald-800/60 dark:bg-[#1B2433]"
 >
 <div className="flex items-center justify-between text-xs text-emerald-700 font-bold dark:text-emerald-400">
 <span className="flex items-center gap-1 font-mono">
 <Clock className="h-3.5 w-3.5" />
 {formatTime(item.time_start)} – {formatTime(item.time_end)}
 </span>
 <div className="flex items-center gap-1.5">
 {item.has_conflict && (
 <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-black text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-emerald-200/80 dark:border-emerald-800/60">
 <AlertTriangle className="size-3 text-rose-600 dark:text-rose-400" />
 Bentrok
 </span>
 )}
 <AppBadge variant={item.is_active ? 'success' : 'neutral'} dot>
 {item.is_active ? 'Aktif' : 'Nonaktif'}
 </AppBadge>
 </div>
 </div>

 <div className="mt-2 flex items-center gap-1.5 flex-wrap">
 {item.activity_type && item.activity_type !== 'kbm' && (
 <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-black text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-emerald-200/80 dark:border-emerald-800/60">
 <Sparkles className="size-2.5 text-blue-600 dark:text-blue-400" />
 Kegiatan Non-KBM
 </span>
 )}
 <h4 className="text-sm font-extrabold text-slate-900 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
 {getActivityTitle(item)}
 </h4>
 </div>

 <div className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300">
 <p className="flex items-center gap-1.5 font-medium">
 <Building2 className="h-3.5 w-3.5 shrink-0 text-emerald-600/70 dark:text-emerald-400/70" />
 <span>
 {item.kelas?.nama_kelas || item.school_class?.name || 'Kelas'}
 {item.kelas?.unit_pendidikan?.name && (
 <span className="text-slate-400">
 {' '}
 · {item.kelas.unit_pendidikan.name}
 </span>
 )}
 </span>
 </p>
 <p className="flex items-center gap-1.5 font-medium">
 <Users className="h-3.5 w-3.5 shrink-0 text-emerald-600/70 dark:text-emerald-400/70" />
 <span>{item.employee?.nama_lengkap || item.teacher?.name || (item.activity_type && item.activity_type !== 'kbm' ? 'Umum / Mandiri' : 'Guru Pengampu')}</span>
 </p>
 </div>

 <div className="mt-3 flex items-center justify-between border-t border-emerald-200/80 pt-2.5 dark:border-emerald-800/60">
 <span className="text-xs font-semibold text-slate-400">
 {item.academic_year?.name || item.tahun_ajaran_name || '-'}
 </span>
 <span className="text-xs font-bold text-emerald-700 group-hover:underline dark:text-emerald-400">
 Detail →
 </span>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <div className="py-16 text-center text-xs text-slate-400">
 Tidak ada jadwal pelajaran pada hari {DAYS_MAP.find((d) => d.id === selectedWeeklyDay)?.name}.
 </div>
 )}
 </div>
 ) : items.length === 0 ? (
 <div className="p-8 print:hidden">
 <AppEmptyState
 title="Belum Ada Jadwal Pelajaran"
 description="Tidak ada jadwal yang sesuai dengan filter. Tambahkan jadwal baru atau sesuaikan kata kunci pencarian."
 actionLabel={activeFilterCount > 0 || search ? 'Reset Filter' : 'Tambah Jadwal'}
 onAction={activeFilterCount > 0 || search ? resetFilters : openAdd}
 />
 </div>
 ) : (
 /* TABLE & MOBILE DATA CARDS VIEW */
 <>
 {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full table-fixed text-left text-xs">
            <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
              <tr>
                <th className="w-[28%] p-4">MATA PELAJARAN / KEGIATAN</th>
                <th className="w-[20%] p-4">KELAS &amp; UNIT</th>
                <th className="w-[24%] p-4">GURU PENGAMPU / PEMBINA</th>
                <th className="w-[18%] p-4">HARI, JAM &amp; STATUS</th>
                <th className="w-[10%] p-4 text-right select-none"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-100/80 font-medium text-slate-700 dark:divide-emerald-900/40 dark:text-slate-200">
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="group border-b border-slate-50 dark:border-emerald-800/60 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all duration-200 cursor-pointer"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {item.activity_type && item.activity_type !== 'kbm' && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-black text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-emerald-200/80 dark:border-emerald-800/60">
                          <Sparkles className="size-2.5 text-blue-600 dark:text-blue-400" />
                          Non-KBM
                        </span>
                      )}
                      <span className="truncate font-bold text-slate-900 dark:text-white">
                        {getActivityTitle(item)}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-slate-400 mt-0.5">
                      {item.activity_type && item.activity_type !== 'kbm'
                        ? 'Agenda Sekolah'
                        : (item.subject?.kode_mapel || item.subject?.code || '-')}
                      {item.academic_year?.name && <span> • {item.academic_year.name} ({item.semester?.name || '-'})</span>}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="truncate font-semibold text-slate-800 dark:text-slate-100">
                      {item.kelas?.nama_kelas || item.school_class?.name || '-'}
                    </div>
                    <div className="text-xs text-slate-500 truncate">
                      {item.kelas?.unit_pendidikan?.name ||
                        item.kelas?.unit_pendidikan?.nama ||
                        item.school_class?.unit_pendidikan?.name ||
                        item.unit_pendidikan?.name ||
                        item.unit_name ||
                        '-'}
                    </div>
                  </td>
                  <td className="p-4">
                    <PersonIdentityCell
                      src={
                        item.employee?.photo_url ||
                        item.employee?.avatar_url ||
                        item.employee?.foto
                      }
                      name={item.employee?.nama_lengkap || item.teacher?.name || (item.activity_type && item.activity_type !== 'kbm' ? 'Umum / Mandiri' : '-')}
                      subtitle={
                        item.employee?.niy ? `NIY ${item.employee.niy}` : (item.activity_type && item.activity_type !== 'kbm' ? 'Pembina / Pendamping' : 'Guru pengampu')
                      }
                    />
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900 dark:text-white">
                      {item.nama_hari || DAYS_MAP.find((d) => d.id === item.day_of_week)?.name}
                    </div>
                    <div className="font-mono text-xs font-semibold text-emerald-800 dark:text-emerald-400">
                      {formatTime(item.time_start)} – {formatTime(item.time_end)}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      {item.has_conflict && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-black text-rose-700 dark:bg-rose-950/80 dark:text-rose-300 border border-emerald-200/80 dark:border-emerald-800/60">
                          <AlertTriangle className="size-3 text-rose-600 dark:text-rose-400" />
                          Bentrok
                        </span>
                      )}
                      <AppBadge variant={item.is_active ? 'success' : 'neutral'} dot>
                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                      </AppBadge>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end">
                      <ActionDropdown
                        onView={() => setDetailDrawerItem(item)}
                        onEdit={canManage ? () => openEdit(item) : undefined}
                        onDelete={canManage ? () => remove(item) : undefined}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

 {/* Mobile Data Cards View */}
 <div className="grid gap-3 p-4 md:hidden">
 {items.map((item) => (
 <MobileDataCard
 key={item.id}
 title={getActivityTitle(item)}
 subtitle={`${item.nama_hari || DAYS_MAP.find((d) => d.id === item.day_of_week)?.name} (${formatTime(item.time_start)}–${formatTime(item.time_end)})`}
 avatarSrc={
 item.employee?.photo_url ||
 item.employee?.avatar_url ||
 item.employee?.foto
 }
 badge={item.has_conflict ? 'Bentrok' : item.is_active ? 'Aktif' : 'Nonaktif'}
 badgeVariant={item.has_conflict ? 'danger' : item.is_active ? 'success' : 'neutral'}
 fields={[
 {
 label: 'Kelas & Unit',
 value: `${item.kelas?.nama_kelas || 'Kelas'} · ${item.kelas?.unit_pendidikan?.name || 'Unit'}`,
 icon: Building2,
 },
 {
 label: 'Guru Pengampu',
 value: item.employee?.nama_lengkap || item.teacher?.name || 'Guru',
 icon: Users,
 },
 ]}
 onView={() => setDetailDrawerItem(item)}
 onEdit={canManage ? () => openEdit(item) : undefined}
 onDelete={canManage ? () => remove(item) : undefined}
 />
 ))}
 </div>
 </>
 )}

 {/* ── PAGINATION BAR (Default 10 Data per Halaman) ── */}
 <div className="border-t border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 px-4 py-3 sm:px-6 md:px-8 dark:border-emerald-800/60 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
 Menampilkan baris ke <span className="font-bold text-emerald-800 dark:text-emerald-300">{items.length > 0 ? (page - 1) * 10 + 1 : 0}</span> sampai{' '}
 <span className="font-bold text-emerald-800 dark:text-emerald-300">{Math.min(page * 10, meta.total ?? 0)}</span> dari{' '}
 <span className="font-bold text-emerald-800 dark:text-emerald-300">{Number(meta.total ?? 0).toLocaleString('id-ID')}</span> jadwal
 </p>
 <Pagination
 currentPage={page}
 totalPages={Math.max(1, meta.last_page || Math.ceil((meta.total ?? 0) / 10))}
 onPageChange={setPage}
 sideLayout="icon"
 variant="default"
 />
 </div>
 </div>

 {/* DETAIL MODAL (CENTERED) */}
 <AppModal
 isOpen={Boolean(detailDrawerItem)}
 onClose={() => setDetailDrawerItem(null)}
 icon={CalendarDays}
 title="Detail Jadwal Pelajaran"
 description="Informasi lengkap alokasi waktu dan penugasan guru."
 maxWidth="max-w-xl"
 footer={
 <div className="flex items-center justify-end gap-2 w-full">
 <AppButton
 variant="secondary"
 size="sm"
 onClick={() => setDetailDrawerItem(null)}
 >
 Tutup
 </AppButton>
 {detailDrawerItem && (
 <>
 <AppButton
 variant="primary"
 size="sm"
 icon={Pencil}
 onClick={() => {
 const item = detailDrawerItem
 setDetailDrawerItem(null)
 openEdit(item)
 }}
 >
 Edit Jadwal
 </AppButton>
 <AppButton
 variant="destructive"
 size="sm"
 icon={Trash2}
 onClick={() => remove(detailDrawerItem)}
 >
 Hapus
 </AppButton>
 </>
 )}
 </div>
 }
 >
 {detailDrawerItem && (
 <div className="space-y-4 p-1">
 {/* Header Highlight Card */}
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <div className="flex items-center justify-between">
 <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
 {detailDrawerItem.nama_hari ||
 DAYS_MAP.find((d) => d.id === detailDrawerItem.day_of_week)?.name}
 </span>
 <AppBadge variant={detailDrawerItem.is_active ? 'success' : 'neutral'} dot>
 {detailDrawerItem.is_active ? 'Aktif' : 'Nonaktif'}
 </AppBadge>
 </div>
 <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white">
 {formatTime(detailDrawerItem.time_start)} – {formatTime(detailDrawerItem.time_end)} WIB
 </div>
 <div className="mt-1 flex items-center gap-2 flex-wrap">
 {detailDrawerItem.activity_type && detailDrawerItem.activity_type !== 'kbm' && (
 <span className="inline-flex items-center gap-1 rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-black text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-emerald-200/80 dark:border-emerald-800/60">
 <Sparkles className="size-2.5 text-blue-600 dark:text-blue-400" />
 Kegiatan Non-KBM
 </span>
 )}
 <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
 {getActivityTitle(detailDrawerItem)}
 </span>
 </div>
 </div>

 {/* Information Grid */}
 <div className="space-y-4 rounded-xl border border-emerald-200/80 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
 Informasi Penugasan
 </h4>

 <div className="grid grid-cols-2 gap-4 text-xs">
 <div>
 <span className="text-slate-400">Kelas / Rombel</span>
 <div className="mt-0.5 font-bold text-slate-800 dark:text-white">
 {detailDrawerItem.kelas?.nama_kelas || detailDrawerItem.school_class?.name || '-'}
 </div>
 </div>

 <div>
 <span className="text-slate-400">Unit Pendidikan</span>
 <div className="mt-0.5 font-bold text-slate-800 dark:text-white">
 {detailDrawerItem.kelas?.unit_pendidikan?.name || '-'}
 </div>
 </div>

 <div className="col-span-2 border-t border-emerald-200/80 pt-3 dark:border-emerald-800/60">
 <span className="text-slate-400">Guru Pengampu</span>
 <div className="mt-1">
 <PersonIdentityCell
 src={
 detailDrawerItem.employee?.photo_url ||
 detailDrawerItem.employee?.avatar_url
 }
 name={
 detailDrawerItem.employee?.nama_lengkap ||
 detailDrawerItem.teacher?.name ||
 '-'
 }
 subtitle={
 detailDrawerItem.employee?.niy
 ? `NIY ${detailDrawerItem.employee.niy}`
 : 'Guru Pengampu'
 }
 />
 </div>
 </div>

 <div className="border-t border-emerald-200/80 pt-3 dark:border-emerald-800/60">
 <span className="text-slate-400">Tahun Ajaran</span>
 <div className="mt-0.5 font-bold text-slate-800 dark:text-white">
 {detailDrawerItem.academic_year?.name || '-'}
 </div>
 </div>

 <div className="border-t border-emerald-200/80 pt-3 dark:border-emerald-800/60">
 <span className="text-slate-400">Semester</span>
 <div className="mt-0.5 font-bold text-slate-800 dark:text-white">
 {detailDrawerItem.semester?.name || '-'}
 </div>
 </div>

 <div className="col-span-2 border-t border-emerald-200/80 pt-3 dark:border-emerald-800/60">
 <span className="text-slate-400">Pola Minggu</span>
 <div className="mt-0.5 font-semibold text-slate-800 dark:text-white">
 {detailDrawerItem.week_type === 'odd'
 ? 'Minggu Ganjil'
 : detailDrawerItem.week_type === 'even'
 ? 'Minggu Genap'
 : 'Setiap Minggu'}
 </div>
 </div>
 </div>
 </div>
 </div>
 )}
 </AppModal>

 {/* FORM MODAL (TAMBAH / EDIT) - HERO UI STYLE 2-COLUMN */}
 <MasterFormModal
 isOpen={modal}
 onClose={() => setModal(false)}
 icon={CalendarDays}
 title={editing ? 'Edit Jadwal Pelajaran' : 'Tambah Jadwal Pelajaran'}
 badge={editing ? 'Update Data' : 'Jadwal Baru'}
 description="Lengkapi informasi akademik, rincian hari kosong, dan alokasi jam bebas bentrok."
 maxWidth="max-w-4xl"
 footer={
 <div className="flex items-center justify-between w-full">
 <div className="text-left">
 {liveConflicts.length > 0 ? (
 <span className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
 <AlertTriangle className="size-4 shrink-0" />
 <span>Jadwal bentrok ({liveConflicts.length})</span>
 </span>
 ) : liveConflictChecking ? (
 <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
 <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
 <span>Mengecek ketersediaan jam...</span>
 </span>
 ) : form.time_start && form.time_end ? (
 <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
 <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
 <span>Jam Bebas Bentrok Terpilih</span>
 </span>
 ) : null}
 </div>
 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={() => setModal(false)}
 className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
 >
 Batal
 </button>
 <button
 type="submit"
 form="schedule-form"
 disabled={saveMutation.isPending || liveConflicts.length > 0}
 className={cn(
 'h-9.5 rounded-xl px-5 text-xs font-black text-white active:scale-95 disabled:opacity-50 transition-all shadow-md',
 liveConflicts.length > 0
 ? 'bg-rose-600 cursor-not-allowed shadow-rose-600/20 border-2 border-rose-600'
 : 'bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-600 shadow-emerald-600/20 cursor-pointer'
 )}
 >
 {saveMutation.isPending
 ? 'Menyimpan...'
 : liveConflicts.length > 0
 ? 'Bentrok Terdeteksi'
 : editing
 ? 'Simpan Perubahan'
 : 'Simpan Jadwal'}
 </button>
 </div>
 </div>
 }
 >
 <form
 id="schedule-form"
 onSubmit={submit}
 className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-200"
 >
 {/* HERO UI HEADER BANNER */}
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">
 <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-emerald-400/20 blur-2xl pointer-events-none" />
 <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <span className="flex h-9 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm">
 <CalendarDays className="h-5 w-5" />
 </span>
 <div>
 <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
 Penjadwalan Kegiatan Akademik dan Mata Pelajaran
 </h3>
 <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
 {editing
 ? 'Perbarui alokasi sesi, rombel kelas, guru pengampu, serta jam KBM.'
 : 'Atur alokasi waktu mengajar, rombel kelas, serta guru pengampu bebas bentrok.'}
 </p>
 </div>
 </div>

 {/* Status Chips Ringkasan */}
 <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-center">
 {form.kelas_id && (
 <span className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/90 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-emerald-300 shadow-xs">
 {filteredKelas.find((k) => String(k.id) === String(form.kelas_id))?.nama_kelas || 'Kelas Terpilih'}
 </span>
 )}
 {form.employee_id && (
 <span className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/90 px-2.5 py-1 text-xs font-bold text-teal-800 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-teal-300 shadow-xs">
 {filteredGuru.find((g) => String(g.id) === String(form.employee_id))?.nama_lengkap || 'Guru Terpilih'}
 </span>
 )}
 </div>
 </div>
 </div>

 {/* Conflict Warning Banner */}
 {liveConflicts.length > 0 ? (
 <div className="flex flex-col gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/95 p-4 text-rose-900 dark:border-emerald-800/60 dark:bg-rose-950/50 dark:text-rose-200 shadow-sm animate-fadeIn">
 <div className="flex items-center gap-2 font-black text-xs text-rose-800 dark:text-rose-300 uppercase tracking-wide">
 <AlertTriangle className="size-4.5 text-rose-600 dark:text-rose-400 shrink-0" />
 <span>Terdeteksi {liveConflicts.length} Jadwal Bertabrakan (Bentrok)</span>
 </div>
 <div className="space-y-1.5 text-xs pl-6">
 {liveConflicts.map((c, idx) => (
 <div key={idx} className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/80 p-2.5 dark:border-emerald-800/60 dark:bg-slate-900/60">
 <span className="font-black text-rose-800 dark:text-rose-300 block mb-0.5">{c.title || 'Tabrakan Waktu'}:</span>
 <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{c.message}</p>
 </div>
 ))}
 </div>
 </div>
 ) : conflictWarning ? (
 <div className="flex items-start gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 p-4 text-rose-800 dark:border-emerald-800/60 dark:bg-rose-950/30 dark:text-rose-300">
 <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />
 <div className="text-xs">
 <strong className="block font-bold">Peringatan Bentrok / Validasi:</strong>
 <span>{conflictWarning}</span>
 </div>
 </div>
 ) : null}

 {/* GRUP 1: INFORMASI & PERIODE AKADEMIK */}
 <div className="space-y-4 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-emerald-50/30 p-4.5 sm:p-5 dark:bg-slate-900/40 shadow-xs">
 <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#059669] dark:text-[#10B981]">
 <Building2 className="h-4 w-4" />
 <span>1. Informasi & Periode Akademik</span>
 </h4>

 <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
 {/* Unit Pendidikan */}
 <div>
 <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
 <School className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Unit Pendidikan</span>
 </label>
 <HeroUiFilterSelect
 ariaLabel="Unit Pendidikan"
 value={form.unit_pendidikan_id}
 onChange={(val) => handleFormChange('unit_pendidikan_id', val)}
 options={formUnitOptions}
 placeholder="Pilih Unit Pendidikan"
 icon={School}
 searchable
 disabled={Boolean((isGuru || isTu) && userUnitId)}
 className="w-full"
 popoverWidth="w-full"
 size="md"
 />
 </div>

 {/* Tahun Ajaran */}
 <div>
 <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
 <Calendar className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Tahun Ajaran *</span>
 </label>
 <HeroUiFilterSelect
 ariaLabel="Tahun Ajaran"
 value={form.academic_year_id}
 onChange={(val) => handleFormChange('academic_year_id', val)}
 options={formAcademicYearOptions}
 placeholder="Pilih Tahun Ajaran"
 icon={Calendar}
 searchable
 required
 error={Boolean(formErrors.academic_year_id)}
 className="w-full"
 popoverWidth="w-full"
 size="md"
 />
 {formErrors.academic_year_id && (
 <p className="mt-1.5 text-xs font-medium text-rose-500">
 {formErrors.academic_year_id}
 </p>
 )}
 </div>

 {/* Semester */}
 <div>
 <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
 <Bookmark className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Semester *</span>
 </label>
 <HeroUiFilterSelect
 ariaLabel="Semester"
 value={form.semester_id}
 onChange={(val) => handleFormChange('semester_id', val)}
 options={formSemesterOptions}
 placeholder={!form.academic_year_id ? 'Pilih Thn Ajaran Dulu' : 'Pilih Semester'}
 icon={Bookmark}
 disabled={!form.academic_year_id}
 required
 error={Boolean(formErrors.semester_id)}
 className="w-full"
 popoverWidth="w-full"
 size="md"
 />
 {formErrors.semester_id && (
 <p className="mt-1.5 text-xs font-medium text-rose-500">
 {formErrors.semester_id}
 </p>
 )}
 </div>
 </div>
 </div>

 {/* GRUP 2: JENIS JADWAL & ALOKASI AKTIVITAS */}
 <div className="space-y-4 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-emerald-50/30 p-4.5 sm:p-5 dark:bg-slate-900/40 shadow-xs">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3">
 <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#059669] dark:text-[#10B981]">
 <BookOpen className="h-4 w-4" />
 <span>2. Jenis Jadwal & Penugasan</span>
 </h4>
 <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
 Pilih jenis KBM mata pelajaran atau kegiatan/aktivitas non-KBM
 </span>
 </div>

 {/* Selector Jenis Jadwal (2 Kategori Murni: KBM vs Kegiatan Non-KBM) */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-900/80 border border-emerald-200/80 dark:border-emerald-800/60">
 <button
 type="button"
 onClick={() => handleFormChange('activity_type', 'kbm')}
 className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${(form.activity_type || 'kbm') === 'kbm'
 ? 'bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white shadow-sm'
 : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:hover:bg-white/60 dark:hover:bg-slate-800/60'
 }`}
 >
 <BookOpen className="h-4 w-4 shrink-0" />
 <span>KBM Mata Pelajaran</span>
 </button>

 <button
 type="button"
 onClick={() => handleFormChange('activity_type', 'activity')}
 className={`flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-bold text-xs transition-all cursor-pointer ${form.activity_type !== 'kbm'
 ? 'bg-emerald-600 text-white shadow-xs'
 : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-100/60 dark:text-slate-400 dark:hover:bg-slate-800/60'
 }`}
 >
 <Sparkles className="h-4 w-4 shrink-0" />
 <span>Kegiatan Non-KBM (Aktivitas Sekolah)</span>
 </button>
 </div>

 <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-1">
 {/* Kelas / Rombel */}
 <div>
 <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
 <GraduationCap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Kelas / Rombel Target *</span>
 </label>
 <HeroUiFilterSelect
 ariaLabel="Kelas / Rombel Target"
 value={form.kelas_id}
 onChange={(val) => handleFormChange('kelas_id', val)}
 options={formKelasOptions}
 placeholder={filteredKelas.length === 0 ? 'Tidak ada kelas sesuai filter' : 'Pilih Kelas / Rombel'}
 icon={GraduationCap}
 searchable
 required
 error={Boolean(formErrors.kelas_id)}
 className="w-full"
 popoverWidth="w-full"
 size="md"
 />
 {formErrors.kelas_id && (
 <p className="mt-1.5 text-xs font-medium text-rose-500">
 {formErrors.kelas_id}
 </p>
 )}
 </div>

 {/* JIKA KEGIATAN NON-KBM: INPUT MANUAL BEBAS NAMA KEGIATAN */}
 {form.activity_type !== 'kbm' ? (
 <div>
 <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
 <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
 <span>Nama Kegiatan Sekolah * (Input Bebas)</span>
 </label>
 <input
 type="text"
 required
 value={form.activity_name || ''}
 onChange={(e) => handleFormChange('activity_name', e.target.value)}
 placeholder="Contoh: Upacara, Dzikir Pagi, Waktu Istirahat, ISHOMA, Senam, dll."
 className={`h-11 w-full rounded-xl border bg-slate-50/50 hover:bg-white focus:bg-white px-3.5 font-medium outline-none focus:border-blue-600 dark:border-emerald-700/80 dark:bg-[#111827] ${formErrors.activity_name ? 'border-rose-500' : 'border-emerald-200/80'
 }`}
 />
 {formErrors.activity_name && (
 <p className="mt-1.5 text-xs font-medium text-rose-500">
 {formErrors.activity_name}
 </p>
 )}
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-normal">
 Nama kegiatan bebas diisi (contoh: Upacara Bendera, Dzikir Pagi, Waktu Istirahat, ISHOMA, Senam Pagi, dll.).
 </p>
 </div>
 ) : (
 /* Guru Pengampu untuk KBM */
 <div>
 <div className="flex items-center justify-between mb-2">
 <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
 <UserCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Guru Pengampu *</span>
 </label>
 <button
 type="button"
 onClick={() => setGuruPickerOpen(true)}
 className="inline-flex items-center gap-1 text-xs font-bold text-[#059669] hover:text-emerald-700 dark:text-[#10B981] bg-emerald-50 hover:bg-emerald-100/90 dark:bg-emerald-950/50 px-2 py-0.5 rounded-lg border-2 border-emerald-300 dark:border-emerald-800/80 transition-all cursor-pointer"
 >
 <Search className="h-3 w-3" />
 <span>Cari & Pilih Guru</span>
 </button>
 </div>
 <HeroUiFilterSelect
 ariaLabel="Guru Pengampu"
 value={form.employee_id}
 onChange={(val) => handleFormChange('employee_id', val)}
 options={formGuruOptions}
 placeholder={filteredGuru.length === 0 ? 'Tidak ada guru sesuai unit' : 'Pilih Guru Pengampu'}
 icon={UserCheck}
 searchable
 required
 error={Boolean(formErrors.employee_id)}
 className="w-full"
 popoverWidth="w-full"
 size="md"
 />
 {formErrors.employee_id && (
 <p className="mt-1.5 text-xs font-medium text-rose-500">
 {formErrors.employee_id}
 </p>
 )}
 </div>
 )}

 {/* JIKA KBM: MATA PELAJARAN (WAJIB) */}
 {(!form.activity_type || form.activity_type === 'kbm') && (
 <div className="sm:col-span-2">
 <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
 <BookOpen className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span>Mata Pelajaran *</span>
 </label>
 <HeroUiFilterSelect
 ariaLabel="Mata Pelajaran"
 value={form.subject_id}
 onChange={(val) => handleFormChange('subject_id', val)}
 options={formSubjectOptions}
 placeholder={filteredSubjects.length === 0 ? 'Tidak ada mapel sesuai unit' : 'Pilih Mata Pelajaran'}
 icon={BookOpen}
 searchable
 required
 error={Boolean(formErrors.subject_id)}
 className="w-full"
 popoverWidth="w-full"
 size="md"
 />
 {formErrors.subject_id && (
 <p className="mt-1.5 text-xs font-medium text-rose-500">
 {formErrors.subject_id}
 </p>
 )}
 </div>
 )}

 {/* JIKA KEGIATAN NON-KBM: GURU PEMBINA / PENDAMPING / PENGAWAS (OPSIONAL) */}
 {form.activity_type !== 'kbm' && (
 <div className="sm:col-span-2">
 <div className="flex items-center justify-between mb-2">
 <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
 <UserCheck className="h-3.5 w-3.5 text-slate-600 dark:text-slate-400" />
 <span>Guru Pembina / Pendamping / Pengawas Piket (Opsional)</span>
 </label>
 <button
 type="button"
 onClick={() => setGuruPickerOpen(true)}
 className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-slate-900 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 transition-all cursor-pointer"
 >
 <Search className="h-3 w-3" />
 <span>Cari Guru</span>
 </button>
 </div>
 <HeroUiFilterSelect
 ariaLabel="Guru Pembina / Pendamping"
 value={form.employee_id || ''}
 onChange={(val) => handleFormChange('employee_id', val)}
 options={formPembinaOptions}
 placeholder="-- Tanpa Guru Khusus (Umum / Mandiri) --"
 icon={UserCheck}
 searchable
 allowClear
 className="w-full"
 popoverWidth="w-full"
 size="md"
 />
 </div>
 )}
 </div>
 </div>

 {/* GRUP 3: WAKTU, RINCIAN HARI KOSONG & REKOMENDASI JAM BEBAS BENTROK (2 KOLOM HERO UI) */}
 <div className="space-y-4 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 p-4.5 sm:p-5 dark:border-emerald-800/60 dark:bg-emerald-950/15 shadow-sm">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3">
 <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#059669] dark:text-[#10B981]">
 <Clock3 className="h-4 w-4" />
 <span>3. Waktu, Rincian Hari Kosong & Rekomendasi Jam</span>
 </h4>
 <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
 {availabilityLoading ? 'Memeriksa ketersediaan jadwal...' : 'Sinkron dengan jadwal kelas & guru'}
 </span>
 </div>

 {/* 2 KOLOM CONTAINER */}
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
 {/* ── KOLOM 1 (KIRI): RINCIAN HARI & INPUT MANUAL ── */}
 <div className="space-y-4">
 {/* Pemilihan Hari & Ketersediaan Slot */}
 <div className="rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-emerald-50/30 p-4 dark:bg-slate-900/40 shadow-xs">
 {/* Target Konteks KBM Realtime */}
 <div className="mb-3.5 flex flex-wrap items-center justify-between gap-2.5 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 p-2.5 sm:p-3 border border-emerald-200/80 dark:border-emerald-800/80">
 <div className="flex items-center gap-2.5 min-w-0">
 <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-xs">
 <Target className="h-4 w-4" />
 </span>
 <div className="min-w-0">
 <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-900 dark:text-emerald-300 block">
 Target Penjadwalan
 </span>
 <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate block">
 {form.kelas_id
 ? filteredKelas.find((k) => String(k.id) === String(form.kelas_id))?.nama_kelas
 : 'Pilih Kelas'}{' '}
 •{' '}
 {form.employee_id
 ? filteredGuru.find((g) => String(g.id) === String(form.employee_id))?.nama_lengkap
 : 'Pilih Guru'}
 </span>
 </div>
 </div>
 <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border-2 border-emerald-300 dark:border-emerald-800">
 Sinkronisasi Aktif
 </span>
 </div>

 <div className="flex items-center justify-between mb-3">
 <label className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
 <CalendarDays className="h-4 w-4 text-emerald-600" />
 <span>Rincian Hari KBM & Slot (Pilih Hari)</span>
 </label>
 <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
 Klik hari untuk memilih
 </span>
 </div>

 {/* Grid Hari: Senin s/d Sabtu (dan Minggu jika ada) */}
 <div className="grid grid-cols-3 gap-2.5">
 {DAYS_MAP.map((d) => {
 const isSelected = Number(form.day_of_week) === d.id
 const dayStat = availabilityData?.days?.find((item) => item.day_of_week === d.id)
 const isEmpty = dayStat ? dayStat.is_empty : false
 const count = dayStat ? dayStat.total_schedules : 0
 const status = dayStat?.status || (count === 0 ? 'empty' : count <= 3 ? 'partial' : 'busy')

 return (
 <button
 key={d.id}
 type="button"
 onClick={() => handleFormChange('day_of_week', d.id)}
 className={cn(
 'flex flex-col p-3 rounded-xl text-left border-2 transition-all cursor-pointer relative overflow-hidden',
 isSelected
 ? 'border-emerald-600 bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-500/30'
 : isEmpty
 ? 'border-[#b6f6d9] dark:border-emerald-800 bg-emerald-50/80 hover:bg-emerald-100/80 dark:bg-emerald-950/40 text-slate-800 dark:text-slate-200'
 : status === 'partial'
 ? 'border-[#b6f6d9] dark:border-emerald-800/60 bg-teal-50/50 hover:bg-teal-100/60 dark:bg-slate-900 text-slate-800 dark:text-slate-200'
 : 'border-slate-200 bg-slate-100/80 hover:bg-slate-200/70 dark:border-emerald-700/80 dark:bg-slate-900/60 text-slate-700 dark:text-slate-300'
 )}
 >
 <div className="flex items-center justify-between w-full">
 <span className={cn('text-xs font-black', isSelected ? 'text-white' : 'text-slate-900 dark:text-white')}>
 {d.name}
 </span>
 {isEmpty && (
 <span
 className={cn(
 'text-[8px] font-extrabold px-1.5 py-0.5 rounded-full',
 isSelected ? 'bg-white/20' : 'bg-emerald-600 text-white'
 )}
 >
 Kosong
 </span>
 )}
 </div>

 <div className="mt-2">
 <span
 className={cn(
 'block text-[10px] font-bold',
 isSelected
 ? 'text-emerald-100'
 : isEmpty
 ? 'text-emerald-700 dark:text-emerald-400'
 : 'text-slate-500 dark:text-slate-400'
 )}
 >
 {isEmpty ? '✨ 100% Bebas' : `${count} Sesi Terisi`}
 </span>
 </div>
 </button>
 )
 })}
 </div>

 {/* Notice Rincian Hari Kosong */}
 {availabilityData?.days && (
 <div className="mt-3 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300 bg-emerald-50/70 dark:bg-slate-900/80 p-2.5 sm:p-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 leading-relaxed">
 <Sparkles className="size-4 text-emerald-600 shrink-0 mt-0.5" />
 <span>
 <strong>Rekomendasi Hari:</strong>{' '}
 {availabilityData.days.filter((d) => d.is_empty).length > 0 ? (
 <>
 Hari{' '}
 <strong className="text-emerald-700 dark:text-emerald-400">
 {availabilityData.days.filter((d) => d.is_empty).map((d) => d.day_name).join(', ')}
 </strong>{' '}
 masih kosong sepenuhnya untuk kelas dan guru ini.
 </>
 ) : (
 'Semua hari sudah memiliki sesi, silakan gunakan slot jam kosong yang direkomendasikan di panel kanan.'
 )}
 </span>
 </div>
 )}
 </div>

 {/* Input Manual Jam Mulai & Selesai & Pola Minggu */}
 <div className="rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-emerald-50/30 p-4 dark:bg-slate-900/40 shadow-xs space-y-3.5">
 <div className="grid grid-cols-2 gap-3.5">
 {/* Jam Mulai */}
 <div>
 <label className="mb-1.5 flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-100">
 <Clock className="size-3 text-emerald-600" />
 <span>Jam Mulai *</span>
 </label>
 <input
 required
 type="time"
 value={form.time_start}
 onChange={(e) => handleFormChange('time_start', e.target.value)}
 className={`h-10 w-full rounded-xl border-2 bg-white px-3.5 font-mono text-xs font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80 dark:bg-slate-900 ${formErrors.time_start ? 'border-rose-500' : 'border-[#b6f6d9]'
 }`}
 />
 {formErrors.time_start && (
 <p className="mt-1 text-xs font-medium text-rose-500">
 {formErrors.time_start}
 </p>
 )}
 </div>

 {/* Jam Selesai */}
 <div>
 <label className="mb-1.5 flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-100">
 <Clock className="size-3 text-emerald-600" />
 <span>Jam Selesai *</span>
 </label>
 <input
 required
 type="time"
 value={form.time_end}
 onChange={(e) => handleFormChange('time_end', e.target.value)}
 className={`h-10 w-full rounded-xl border-2 bg-white px-3.5 font-mono text-xs font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:border-emerald-700/80 dark:bg-slate-900 ${formErrors.time_end ? 'border-rose-500' : 'border-[#b6f6d9]'
 }`}
 />
 {formErrors.time_end && (
 <p className="mt-1 text-xs font-medium text-rose-500">
 {formErrors.time_end}
 </p>
 )}
 </div>
 </div>

 {/* Pola Minggu */}
 <div>
 <label className="mb-1.5 flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-100">
 <Layers className="size-3 text-emerald-600" />
 <span>Pola Minggu</span>
 </label>
 <HeroUiFilterSelect
 value={form.week_type || 'all'}
 onChange={(val) => handleFormChange('week_type', val)}
 options={[
 { value: 'all', label: 'Setiap Minggu' },
 { value: 'odd', label: 'Minggu Ganjil' },
 { value: 'even', label: 'Minggu Genap' },
 ]}
 placeholder="Pilih Pola Minggu"
 icon={Layers}
 ariaLabel="Pola Minggu"
 size="md"
 className="w-full"
 />
 </div>

 {/* Live Status Jam Terpilih */}
 {form.time_start && form.time_end && liveConflicts.length === 0 ? (
 <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-300 text-xs font-bold">
 <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
 <span>✓ Jam {form.time_start} - {form.time_end} Aman & Bebas Bentrok</span>
 </div>
 ) : null}
 </div>
 </div>

 {/* ── KOLOM 2 (KANAN): REKOMENDASI JAM KOSONG (BEBAS BENTROK) ── */}
 <div className="rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-emerald-50/30 p-4 dark:bg-slate-900/40 shadow-xs space-y-4 h-full flex flex-col justify-between">
 <div>
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div>
 <h5 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
 <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
 <span>Rekomendasi Jam Kosong (Hari {DAYS_MAP.find((d) => d.id === Number(form.day_of_week))?.name || 'Terpilih'})</span>
 </h5>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
 Klik salah satu jam kosong di bawah untuk langsung mengisinya otomatis tanpa risiko bentrok.
 </p>
 </div>

 {availabilityLoading && (
 <span className="text-[10px] font-bold text-emerald-600 animate-pulse shrink-0">
 Memperbarui...
 </span>
 )}
 </div>

 {/* Chips Rekomendasi Jam Kosong */}
 {(() => {
 const currentDayDetail = availabilityData?.days?.find((d) => d.day_of_week === Number(form.day_of_week))
 const freeSlots = currentDayDetail?.free_slots || [
 { time_start: '07:30', time_end: '08:15', label: '07:30 - 08:15 (Sesi 1 • 45m)' },
 { time_start: '08:15', time_end: '09:00', label: '08:15 - 09:00 (Sesi 2 • 45m)' },
 { time_start: '07:30', time_end: '09:00', label: '07:30 - 09:00 (Blok Pagi • 90m)' },
 { time_start: '09:15', time_end: '10:00', label: '09:15 - 10:00 (Sesi 3 • 45m)' },
 { time_start: '10:00', time_end: '10:45', label: '10:00 - 10:45 (Sesi 4 • 45m)' },
 { time_start: '09:15', time_end: '10:45', label: '09:15 - 10:45 (Blok Duha • 90m)' },
 { time_start: '10:45', time_end: '11:30', label: '10:45 - 11:30 (Sesi 5 • 45m)' },
 { time_start: '13:00', time_end: '13:45', label: '13:00 - 13:45 (Sesi 6 • 45m)' },
 { time_start: '13:00', time_end: '14:30', label: '13:00 - 14:30 (Blok Siang • 90m)' },
 { time_start: '14:30', time_end: '15:15', label: '14:30 - 15:15 (Sesi 8 • 45m)' },
 ]

 return (
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-3">
 {freeSlots.map((slot, sIdx) => {
 const isCurrentFilled = form.time_start === slot.time_start && form.time_end === slot.time_end
 return (
 <button
 key={sIdx}
 type="button"
 onClick={() => {
 handleFormChange('time_start', slot.time_start)
 handleFormChange('time_end', slot.time_end)
 }}
 className={cn(
 'flex items-center justify-between p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border text-left',
 isCurrentFilled
 ? 'bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white border-slate-600 shadow-md ring-2 ring-emerald-500/50'
 : 'bg-emerald-50/70 hover:bg-emerald-100 text-emerald-950 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60'
 )}
 >
 <div className="flex items-center gap-2 min-w-0">
 {isCurrentFilled ? (
 <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
 ) : (
 <Clock className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 )}
 <span className="truncate">{slot.label || `${slot.time_start} - ${slot.time_end}`}</span>
 </div>
 {isCurrentFilled && (
 <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/20 shrink-0 ml-1.5">
 ✓ Terpilih
 </span>
 )}
 </button>
 )
 })}
 </div>
 )
 })()}
 </div>

 {/* Rincian Sesi Terisi (Occupied Slots) pada hari tersebut jika ada */}
 {(() => {
 const currentDayDetail = availabilityData?.days?.find((d) => d.day_of_week === Number(form.day_of_week))
 const occupied = currentDayDetail?.occupied_slots || []
 if (occupied.length === 0) {
 return (
 <div className="p-3 rounded-xl bg-emerald-50/70 border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
 <Sparkles className="size-4 text-emerald-600 shrink-0" />
 <span>Hari ini 100% kosong (bebas sesi). Seluruh rentang jam KBM siap digunakan.</span>
 </div>
 )
 }

 return (
 <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
 Jadwal Terisi pada Hari Ini ({occupied.length}):
 </span>
 <div className="flex flex-wrap gap-1.5">
 {occupied.map((occ, oIdx) => (
 <span
 key={oIdx}
 className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-800 dark:bg-rose-950/40 dark:border-emerald-800/60 dark:text-rose-300 text-xs font-medium"
 >
 <span className="font-mono font-bold text-[10px]">{occ.time_start} - {occ.time_end}</span>
 <span>: {occ.subject_name}</span>
 <span className="text-[10px] opacity-75">({occ.conflict_reason || occ.kelas_name})</span>
 </span>
 ))}
 </div>
 </div>
 )
 })()}
 </div>
 </div>
 </div>

 {/* GRUP 4: STATUS & OPTIONAL */}
 <div className="rounded-xl border border-emerald-200/80 bg-white p-4 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <label className="flex items-center gap-3 cursor-pointer">
 <input
 type="checkbox"
 checked={form.is_active}
 onChange={(e) => handleFormChange('is_active', e.target.checked)}
 className="h-4 w-4 rounded border-emerald-300 accent-[#059669] focus:ring-[#059669]"
 />
 <div>
 <span className="block text-xs font-bold text-slate-900 dark:text-white">
 Jadwal Aktif untuk Presensi
 </span>
 <span className="block text-xs font-medium text-slate-400">
 Jadwal aktif dapat langsung dipilih oleh guru saat penginputan absensi kelas.
 </span>
 </div>
 </label>
 </div>
 </form>
 </MasterFormModal>

 {/* Modal Interactive Picker Guru Pengampu */}
      <AppModal
        isOpen={guruPickerOpen}
        onClose={() => setGuruPickerOpen(false)}
        title="Pilih Guru Pengampu"
        badge="Direktori Guru"
        description="Cari & pilih guru pengajar jadwal ini"
        icon={Users}
        maxWidth="max-w-lg"
        zIndex={100}
        bodyClassName="space-y-4"
        footer={
          <div className="flex w-full justify-end">
            <button
              type="button"
              onClick={() => setGuruPickerOpen(false)}
              className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Tutup</span>
            </button>
          </div>
        }
      >
 <div className="relative">
 <Search className="absolute left-3.5 top-3 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={guruSearchText}
 onChange={(e) => setGuruSearchText(e.target.value)}
 placeholder="Cari nama guru atau NIY..."
 className="h-10 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white dark:bg-slate-900 pl-10 pr-4 text-xs font-bold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 dark:text-white"
 />
 </div>

 {/* Guru List Scroll */}
 <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
 {filteredGuruInPicker.length === 0 ? (
 <div className="py-8 text-center text-xs text-slate-500">
 Tidak ada data guru ditemukan untuk kata kunci "{guruSearchText}"
 </div>
 ) : (
 filteredGuruInPicker.map((guru) => {
 const isSelected = form.employee_id === guru.id
 return (
 <div
 key={guru.id}
 onClick={() => {
 handleFormChange('employee_id', guru.id)
 setGuruPickerOpen(false)
 }}
 className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${isSelected
 ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30'
 : 'border-emerald-100/80 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-slate-50 dark:border-emerald-800/60 dark:hover:bg-slate-800/40'
 }`}
 >
 <div className="flex items-center gap-3">
 <div className="h-9 w-10 rounded-xl bg-emerald-100 font-bold text-emerald-800 flex items-center justify-center text-sm shadow-sm">
 {guru.nama_lengkap?.charAt(0) || 'G'}
 </div>
 <div>
 <p className="text-xs font-bold text-slate-900 dark:text-white">{guru.nama_lengkap}</p>
 <p className="text-xs text-slate-500">
 {guru.niy ? `NIY: ${guru.niy}` : 'Guru Active'}
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={(e) => {
 e.stopPropagation()
 handleFormChange('employee_id', guru.id)
 setGuruPickerOpen(false)
 }}
 className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${isSelected
 ? 'bg-[#059669] text-white'
 : 'bg-slate-100 text-slate-700 hover:bg-[#059669] hover:text-white dark:bg-slate-800 dark:text-slate-200'
 }`}
 >
 {isSelected ? 'Terpilih' : 'Pilih Guru'}
 </button>
 </div>
 )
 })
 )}
 </div>
      </AppModal>

      <HarmonizedDeleteModal
        isOpen={Boolean(deleteItem)}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteMutation.mutate(deleteItem?.id)}
        item={deleteItem}
        isSubmitting={deleteMutation.isPending}
      />
 </MasterDataPage>
 )
}
