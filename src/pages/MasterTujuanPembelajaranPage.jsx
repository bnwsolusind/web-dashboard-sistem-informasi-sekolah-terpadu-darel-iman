import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import {
  KpiStatCard
} from '../components/app'
import CustomSelect from "../components/ui/CustomSelect"
import AppModal from '../components/app/AppModal'
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
  Target,
  BookOpen,
  Layers,
  Search,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  Upload,
  Plus,
  Trash2
} from 'lucide-react'
import CsvImportModal from '../components/master-data/CsvImportModal'
import ActionDropdown from '../components/app/ActionDropdown'
import Swal from '@/components/ui/compat/swal-heroui'
import {
  tujuanPembelajaranService
} from '../services/tujuanPembelajaranService'
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
import {
  getUnitJenjang
} from './MasterCapaianPembelajaranPage'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  useDebounce
} from '../hooks/useDebounce'
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
  MasterStatusBadge,
  MasterActionGroup,
  MasterActionIconButton,
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
  return (
    <AppModal
      isOpen={Boolean(isOpen && item)}
      onClose={() => !isSubmitting && onClose()}
      title="Hapus Tujuan Pembelajaran?"
      badge="Hapus Permanen"
      description="Tindakan ini tidak dapat dibatalkan."
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
            {isSubmitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span>Hapus TP</span>
          </button>
        </>
      }
    >
      {item && (
        <>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Apakah Anda yakin ingin menghapus Tujuan Pembelajaran ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-rose-50/50 p-3.5 dark:bg-rose-950/20">
            <p className="text-xs font-black text-rose-950 dark:text-rose-100">
              [{item?.kode_tp}] {item?.deskripsi_tp || item?.nama_tp}
            </p>
          </div>
        </>
      )}
    </AppModal>
  )
}

export default function MasterTujuanPembelajaranPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
 const [dataTp, setDataTp] = useState([])
 const [stats, setStats] = useState({
 total_tp: 0,
 total_tp_aktif: 0,
 total_cp: 0,
 cp_ber_tp: 0,
 })

 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [deleteItem, setDeleteItem] = useState(null)
 const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
 const [isDeleting, setIsDeleting] = useState(false)

 const handleExportCSV = () => {
 if (!dataTp || dataTp.length === 0) {
 Swal.fire({
 title: 'Data Masih Kosong',
 text: 'Tidak ada data Tujuan Pembelajaran untuk diekspor pada filter yang dipilih.',
 icon: 'info',
 confirmButtonText: 'Tutup',
 confirmButtonColor: '#059669',
 })
 return
 }
 const headers = ['NO', 'KODE TP', 'DESKRIPSI TUJUAN PEMBELAJARAN', 'CP INDUK', 'ALOKASI JP', 'STATUS']
 let csvStr = headers.join(',') + '\n'
 dataTp.forEach((row, i) => {
 const line = [
 i + 1,
 `"${row.kode_tp || ''}"`,
 `"${row.deskripsi_tp || ''}"`,
 `"${row.capaian_pembelajaran?.nama_cp || row.cp?.nama_cp || '-'}"`,
 `"${row.alokasi_waktu_jp || 0} JP"`,
 `"${row.status !== false ? 'Aktif' : 'Nonaktif'}"`,
 ].join(',')
 csvStr += line + '\n'
 })
 const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' })
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.href = url
 link.download = `export_tujuan_pembelajaran_${new Date().toISOString().slice(0, 10)}.csv`
 link.click()
 URL.revokeObjectURL(url)
 }

 const pageActions = (
 <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
 <SquircleActionButton variant="import" label="Import Data" onClick={() => setImportOpen(true)} />
 <SquircleActionButton variant="export" label="Export Data" onClick={handleExportCSV} />
 <SquircleActionButton variant="print" icon={Printer} label="Cetak Data" onClick={() => setIsPrintModalOpen(true)} />
 <SquircleActionButton variant="create" label="Tambah TP" onClick={() => handleOpenModal()} />
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

 // Master options for dependent dropdown
 const [units, setUnits] = useState([])
 const [tahunAjarans, setTahunAjarans] = useState([])
 const [kurikulums, setKurikulums] = useState([])
 const [subjects, setSubjects] = useState([])
 const [cpOptions, setCpOptions] = useState([])
 const [loadingCp, setLoadingCp] = useState(false)

 const [loading, setLoading] = useState(true)
 const [errorMsg, setErrorMsg] = useState('')
 const [successMsg, setSuccessMsg] = useState('')

 // Filters & Pagination
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [selectedCpFilter, setSelectedCpFilter] = useState('')
 const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
 const [page, setPage] = useState(1)
 const [pagination, setPagination] = useState({
 current_page: 1,
 last_page: 1,
 total: 0,
 per_page: 15,
 })

 // Modal State & Form Data
 const [modalOpen, setModalOpen] = useState(false)
 const [importOpen, setImportOpen] = useState(false)
 const [editingItem, setEditingItem] = useState(null)
 const [formSubmitting, setFormSubmitting] = useState(false)
 const [formData, setFormData] = useState({
 unit_pendidikan_id: '',
 tahun_ajaran_id: '',
 kurikulum_id: '',
 mata_pelajaran_id: '',
 cp_id: '',
 kode_tp: '',
 alokasi_waktu_jp: 2,
 deskripsi_tp: '',
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

 const loadInitialMasters = async () => {
 try {
 const [uRes, tRes, kRes, sRes, sStats] = await Promise.all([
 educationUnitService.getDaftar().catch(() => ({ data: [] })),
 tahunAjaranService.getDropdown().catch(() => []),
 masterKurikulumService.getDropdown().catch(() => []),
 subjectService.getDropdown().catch(() => ({ data: [] })),
 tujuanPembelajaranService.getStats().catch(() => null),
 ])

 const extractList = (res) => (Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [])

 setUnits(extractList(uRes))
 setTahunAjarans(extractList(tRes))
 setKurikulums(extractList(kRes))
 setSubjects(extractList(sRes))
 if (sStats) setStats(sStats)
 } catch (err) {
 console.error('Error loading master data:', err)
 }
 }

 const fetchDaftarTp = async () => {
 setLoading(true)
 setErrorMsg('')
 try {
 const response = await tujuanPembelajaranService.getDaftar({
 page,
 search: debouncedSearch,
 cp_id: selectedCpFilter,
 status: selectedStatusFilter,
 per_page: 15,
 })
 if (response?.data) {
 setDataTp(response.data)
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
 console.error('Error fetching TP data:', err)
 setErrorMsg('Gagal memuat data Tujuan Pembelajaran. Silakan coba lagi.')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 loadInitialMasters()
 }, [])

 useEffect(() => {
 fetchDaftarTp()
 }, [page, debouncedSearch, selectedCpFilter, selectedStatusFilter])

 // Dependent Dropdown Trigger: ketika Unit, Tahun, Kurikulum, atau Mata Pelajaran berubah
 useEffect(() => {
 if (!modalOpen) return

 const fetchFilteredCpOptions = async () => {
 setLoadingCp(true)
 try {
 const result = await capaianPembelajaranService.getDropdown({
 unit_pendidikan_id: formData.unit_pendidikan_id,
 tahun_ajaran_id: formData.tahun_ajaran_id,
 kurikulum_id: formData.kurikulum_id,
 mata_pelajaran_id: formData.mata_pelajaran_id,
 })
 setCpOptions(result)

 // Reset CP selection if current selected CP is not in new list
 if (result.length > 0) {
 const exists = result.some((cp) => cp.id === formData.cp_id)
 if (!exists) {
 setFormData((prev) => ({ ...prev, cp_id: result[0].id }))
 }
 } else {
 setFormData((prev) => ({ ...prev, cp_id: '' }))
 }
 } catch (err) {
 console.error('Error fetching dependent CP dropdown:', err)
 setCpOptions([])
 } finally {
 setLoadingCp(false)
 }
 }

 fetchFilteredCpOptions()
 }, [
 modalOpen,
 formData.unit_pendidikan_id,
 formData.tahun_ajaran_id,
 formData.kurikulum_id,
 formData.mata_pelajaran_id,
 ])

 // Dynamic Auto Generate Kode TP Preview
 useEffect(() => {
 if (editingItem) return

 const mapelObj = subjects.find((s) => s.id === formData.mata_pelajaran_id)
 const unitObj = units.find((u) => u.id === formData.unit_pendidikan_id)

 const kodeMapel = mapelObj?.kode_mapel || mapelObj?.code || 'MTK'
 const kodeUnit = unitObj?.code || unitObj?.level || 'SD'
 const seq = String(dataTp.length + 1).padStart(3, '0')

 const autoKode = `TP-${kodeMapel.toUpperCase()}-${kodeUnit.toUpperCase()}-${seq}`
 setFormData((prev) => ({ ...prev, kode_tp: autoKode }))
 }, [formData.mata_pelajaran_id, formData.unit_pendidikan_id, editingItem, dataTp.length])

 const handleOpenModal = (item = null) => {
 if (item) {
 setEditingItem(item)
 const cp = item.capaian_pembelajaran
 setFormData({
 unit_pendidikan_id: cp?.unit_pendidikan_id || (units[0]?.id ?? ''),
 tahun_ajaran_id: cp?.tahun_ajaran_id || (tahunAjarans[0]?.id ?? ''),
 kurikulum_id: cp?.kurikulum_id || (kurikulums[0]?.id ?? ''),
 mata_pelajaran_id: cp?.mata_pelajaran_id || (subjects[0]?.id ?? ''),
 cp_id: item.cp_id || '',
 kode_tp: item.kode_tp || '',
 alokasi_waktu_jp: item.alokasi_waktu_jp || 2,
 deskripsi_tp: item.deskripsi_tp || item.deskripsi || item.nama_tp || '',
 urutan: item.urutan || 1,
 status: item.status !== undefined ? item.status : true,
 })
 } else {
 setEditingItem(null)
 const defaultUnit = isGuru && teacherUnitIds.length > 0 ? teacherUnitIds[0] : (units[0]?.id ?? '')
 const defaultTahun = tahunAjarans[0]?.id ?? ''
 const matchingKur = resolveKurikulumForUnit(defaultUnit)
 const defaultKur = matchingKur.length > 0 ? matchingKur[0].id : (kurikulums[0]?.id ?? '')
 const matchingSub = resolveSubjectsForUnit(defaultUnit, defaultKur)
 const defaultMapel = matchingSub.length > 0 ? matchingSub[0].id : (subjects[0]?.id ?? '')

 setFormData({
 unit_pendidikan_id: defaultUnit,
 tahun_ajaran_id: defaultTahun,
 kurikulum_id: defaultKur,
 mata_pelajaran_id: defaultMapel,
 cp_id: '',
 kode_tp: '',
 alokasi_waktu_jp: 2,
 deskripsi_tp: '',
 urutan: dataTp.length + 1,
 status: true,
 })
 }
 setModalOpen(true)
 }

 const handleCloseModal = () => {
 setModalOpen(false)
 setEditingItem(null)
 }

 const handleSubmitForm = async (e) => {
 e.preventDefault()
 if (!formData.cp_id) {
 setErrorMsg('Capaian Pembelajaran (CP) harus dipilih dari database.')
 return
 }
 if (!formData.deskripsi_tp.trim()) {
 setErrorMsg('Deskripsi Tujuan Pembelajaran (TP) tidak boleh kosong.')
 return
 }

 setFormSubmitting(true)
 setErrorMsg('')
 try {
 if (editingItem) {
 await tujuanPembelajaranService.ubah({
 id: editingItem.id,
 payload: formData,
 })
 setSuccessMsg('Tujuan Pembelajaran berhasil diperbarui!')
 } else {
 await tujuanPembelajaranService.tambah(formData)
 setSuccessMsg('Tujuan Pembelajaran berhasil ditambahkan dengan Kode TP otomatis!')
 }
 handleCloseModal()
 fetchDaftarTp()
 loadInitialMasters()
 setTimeout(() => setSuccessMsg(''), 4000)
 } catch (err) {
 console.error('Error submitting form:', err)
 const msg = err.response?.data?.message || 'Gagal menyimpan TP. Pastikan CP terpilih dan aktif.'
 setErrorMsg(msg)
 } finally {
 setFormSubmitting(false)
 }
 }

 const handleConfirmHapus = async () => {
 if (!deleteItem) return
 setIsDeleting(true)
 try {
 await tujuanPembelajaranService.hapus(deleteItem.id)
 setSuccessMsg(`Tujuan Pembelajaran [${deleteItem.kode_tp}] berhasil dihapus.`)
 setIsDeleteModalOpen(false)
 setDeleteItem(null)
 fetchDaftarTp()
 loadInitialMasters()
 setTimeout(() => setSuccessMsg(''), 4000)
 } catch (err) {
 console.error('Error deleting TP:', err)
 setErrorMsg('Gagal menghapus data.')
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
 await tujuanPembelajaranService.tambah({
 unit_pendidikan_id: row.unit_pendidikan_id,
 tahun_ajaran_id: row.tahun_ajaran_id,
 kurikulum_id: row.kurikulum_id,
 mata_pelajaran_id: row.mata_pelajaran_id,
 cp_id: row.cp_id,
 kode_tp: row.kode_tp,
 deskripsi_tp: row.deskripsi_tp,
 alokasi_waktu_jp: Number(row.alokasi_waktu_jp || 2),
 urutan: Number(row.urutan || index + 1),
 status: !['0', 'false', 'nonaktif'].includes(String(row.status).toLowerCase()),
 })
 success += 1
 } catch (error) { failures.push(`baris ${index + 2}: ${error.response?.data?.message || 'gagal'}`) }
 }
 await fetchDaftarTp(); await loadInitialMasters()
 setSuccessMsg(`${success} TP berhasil diimpor${failures.length ? `, ${failures.length} gagal (${failures.slice(0, 3).join('; ')})` : '.'}`)
 }

  const tpColumns = useMemo(
    () => [
      {
        key: 'urutan',
        label: 'Urutan',
        className: 'w-20 text-center font-bold text-slate-500 dark:text-slate-400',
        render: (item) => `#${item.urutan ?? '-'}`
      },
      {
        key: 'kode_tp',
        label: 'Kode TP',
        className: 'w-36 font-semibold',
        render: (item) => (
          <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold border border-emerald-200/60 dark:border-emerald-800/60">
            {item.kode_tp}
          </span>
        )
      },
      {
        key: 'capaian_pembelajaran',
        label: 'Capaian Pembelajaran',
        className: 'hidden md:table-cell min-w-[200px]',
        render: (item) => (
          <div>
            <div className="font-semibold text-slate-800 dark:text-slate-100">
              {item.capaian_pembelajaran?.kode_cp || '-'}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
              {item.capaian_pembelajaran?.nama_cp || 'Tanpa CP'}
            </div>
          </div>
        )
      },
      {
        key: 'deskripsi_tp',
        label: 'Deskripsi TP',
        className: 'min-w-[240px]',
        render: (item) => (
          <p className="text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
            {item.deskripsi_tp}
          </p>
        )
      },
      {
        key: 'alokasi_waktu_jp',
        label: 'Alokasi',
        className: 'hidden lg:table-cell text-center w-28 font-semibold',
        render: (item) => (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {item.alokasi_waktu_jp ?? 2} JP
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
        title={item.kode_tp}
        subtitle={item.capaian_pembelajaran?.nama_cp || 'Tanpa CP'}
        statusBadge={<MasterStatusBadge active={item.status} />}
        fields={[
          { label: 'Deskripsi', value: item.deskripsi_tp },
          { label: 'CP', value: item.capaian_pembelajaran?.kode_cp || '-' },
          { label: 'Alokasi', value: `${item.alokasi_waktu_jp ?? 2} JP`, icon: Clock },
          { label: 'Urutan', value: `#${item.urutan ?? '-'}` }
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
 <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Tujuan Pembelajaran' }]} />
 )}
 <MasterDataPage className="tp-master-page" hideBreadcrumb={embedded || hideBreadcrumb}>
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title="Tujuan Pembelajaran (TP)"
 onPrint={() => {
 const rowsToPrint = Array.isArray(dataTp) ? dataTp : []
 printCleanTable({
 title: 'Laporan Data Tujuan Pembelajaran (TP)',
 subtitle: 'Daftar Tujuan Pembelajaran Sekolah Islam Terpadu',
 headers: ['NO', 'KODE TP', 'DESKRIPSI TUJUAN PEMBELAJARAN', 'CP INDUK', 'ALOKASI JP', 'STATUS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 row.kode_tp || '-',
 row.deskripsi_tp || '-',
 row.capaian_pembelajaran?.nama_cp || row.cp?.nama_cp || '-',
 `${row.alokasi_waktu_jp || 0} JP`,
 row.status !== false ? 'Aktif' : 'Nonaktif',
 ]),
 })
 }}
 onDownload={() => {
 const rowsToPrint = Array.isArray(dataTp) ? dataTp : []
 downloadPdfTable({
 title: 'Laporan Data Tujuan Pembelajaran (TP)',
 subtitle: 'Daftar Tujuan Pembelajaran Sekolah Islam Terpadu',
 headers: ['NO', 'KODE TP', 'DESKRIPSI TUJUAN PEMBELAJARAN', 'CP INDUK', 'ALOKASI JP', 'STATUS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 row.kode_tp || '-',
 row.deskripsi_tp || '-',
 row.capaian_pembelajaran?.nama_cp || row.cp?.nama_cp || '-',
 `${row.alokasi_waktu_jp || 0} JP`,
 row.status !== false ? 'Aktif' : 'Nonaktif',
 ]),
 filename: 'laporan_tujuan_pembelajaran.pdf',
 })
 }}
 />
 {/* Hero Section */}
        {!hidePageHeader && (
          <div className="mb-6">
            <HeroUiHeader
              title="Master Tujuan Pembelajaran (TP)"
              subtitle="Kelola Tujuan Pembelajaran (TP) berbasis relasi bertingkat: Unit → TA → Kurikulum → Mapel → CP → TP → Modul Ajar."
              badge="Tujuan Pembelajaran"
              icon={Target}
            />
          </div>
        )}

 <CsvImportModal open={importOpen} onClose={() => setImportOpen(false)} title="Tujuan Pembelajaran" onImport={handleImport} columns={[
 { key: 'unit_pendidikan_id' }, { key: 'tahun_ajaran_id' }, { key: 'kurikulum_id' }, { key: 'mata_pelajaran_id' }, { key: 'cp_id', required: true },
 { key: 'kode_tp', required: true, example: 'TP-MTK-01' }, { key: 'deskripsi_tp', required: true, example: 'Peserta didik mampu...' }, { key: 'alokasi_waktu_jp', example: '2' }, { key: 'urutan', example: '1' }, { key: 'status', example: '1' },
 ]} />

 {/* KPI Cards */}
 <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <KpiTintedCard icon={Target} label="Total Tujuan Pembelajaran" value={stats.total_tp ?? 0} subtext="Terdaftar di sistem" tone="emerald" />
 <KpiTintedCard icon={CheckCircle} label="TP Status Aktif" value={stats.total_tp_aktif ?? 0} subtext="Berfungsi aktif" tone="blue" />
 <KpiTintedCard icon={BookOpen} label="Total CP Terikat" value={stats.total_cp ?? 0} subtext="Capaian Pembelajaran" tone="amber" />
 <KpiTintedCard icon={Layers} label="CP Memiliki TP" value={stats.cp_ber_tp ?? 0} subtext="Sudah dilengkapi TP" tone="purple" />
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
            id="tabel-tujuan-pembelajaran"
            title="Data Tujuan Pembelajaran"
            icon={Target}
            iconClassName="bg-emerald-50 border border-emerald-200/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm"
            countLabel={`${Number(pagination.total || dataTp.length).toLocaleString('id-ID')} TP`}
            description="Data sesuai filter dan kewenangan pengguna."
            actions={pageActions}
            search={search}
            onSearchChange={(value) => {
              setSearch(value)
              setPage(1)
            }}
            searchPlaceholder="Cari kode TP, deskripsi tujuan pembelajaran, atau kata kunci..."
            filters={
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-2.5 w-full">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0 hidden sm:inline-block">
                  Filter:
                </span>

                {cpOptions && cpOptions.length > 0 && (
                  <CustomSelect
                    value={selectedCpFilter}
                    onChange={(e) => {
                      setSelectedCpFilter(e.target.value)
                      setPage(1)
                    }}
                    className="h-9 w-full sm:w-auto min-w-[160px] rounded-[14px] border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 text-xs font-semibold dark:border-emerald-700/80 dark:bg-[#111827] dark:text-slate-100"
                  >
                    <option value="">-- Semua Capaian (CP) --</option>
                    {cpOptions.map((cp) => (
                      <option key={cp.id} value={cp.id}>
                        {cp.kode_cp ? `${cp.kode_cp} - ${cp.nama_cp}` : cp.nama_cp}
                      </option>
                    ))}
                  </CustomSelect>
                )}

                <CustomSelect
                  value={selectedStatusFilter}
                  onChange={(e) => {
                    setSelectedStatusFilter(e.target.value)
                    setPage(1)
                  }}
                  className="h-9 w-full sm:w-auto min-w-[140px] rounded-[14px] border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 text-xs font-semibold dark:border-emerald-700/80 dark:bg-[#111827] dark:text-slate-100"
                >
                  <option value="">-- Semua Status --</option>
                  <option value="true">Aktif</option>
                  <option value="false">Nonaktif</option>
                </CustomSelect>

                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setSelectedCpFilter('')
                    setSelectedStatusFilter('')
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
            columns={tpColumns}
            data={dataTp}
            renderMobileCard={renderMobileCard}
            page={page}
            totalPages={pagination.last_page || 1}
            totalItems={pagination.total || dataTp.length}
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

 {/* Modal Form TP - Mengikuti urutan persis yang dipersyaratkan */}
      <AppModal
        isOpen={modalOpen}
        onClose={() => !formSubmitting && handleCloseModal()}
        title={editingItem ? 'Edit Tujuan Pembelajaran' : 'Tambah Tujuan Pembelajaran Baru'}
        badge={editingItem ? 'Perbarui' : 'TP Baru'}
        description="Lengkapi unit pendidikan, tahun ajaran, capaian pembelajaran, dan deskripsi TP."
        icon={Target}
        maxWidth="max-w-xl"
        disableBackdropClose={formSubmitting}
        hideCloseButton={formSubmitting}
        footer={
          <>
            <button
              type="button"
              disabled={formSubmitting}
              onClick={handleCloseModal}
              className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Batal</span>
            </button>
            <button
              type="submit"
              form="tujuan-pembelajaran-form"
              disabled={formSubmitting}
              className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {formSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>{formSubmitting ? 'Menyimpan...' : 'Simpan TP'}</span>
            </button>
          </>
        }
      >
        <form id="tujuan-pembelajaran-form" onSubmit={handleSubmitForm} className="space-y-4">
 {/* Field 1: Unit Pendidikan */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 1. Unit Pendidikan <span className="text-rose-500">*</span>
 </label>
 <CustomSelect
 value={formData.unit_pendidikan_id}
 onChange={(e) => setFormData({ ...formData, unit_pendidikan_id: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] dark:text-slate-100"
 required
 >
 <option value="">-- Pilih Unit Pendidikan --</option>
 {availableUnitsForModal.map((u) => (
 <option key={u.id} value={u.id}>
 {u.name || u.code}
 </option>
 ))}
 </CustomSelect>
 </div>

 {/* Field 2: Tahun Ajaran */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 2. Tahun Ajaran <span className="text-rose-500">*</span>
 </label>
 <CustomSelect
 value={formData.tahun_ajaran_id}
 onChange={(e) => setFormData({ ...formData, tahun_ajaran_id: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] dark:text-slate-100"
 required
 >
 <option value="">-- Pilih Tahun Ajaran --</option>
 {tahunAjarans.map((t) => (
 <option key={t.id} value={t.id}>
 {t.tahun || t.name}
 </option>
 ))}
 </CustomSelect>
 </div>

 {/* Field 3: Kurikulum */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 3. Kurikulum <span className="text-rose-500">*</span>
 </label>
 <CustomSelect
 value={formData.kurikulum_id}
 onChange={(e) => setFormData({ ...formData, kurikulum_id: e.target.value })}
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

 {/* Field 4: Mata Pelajaran */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 4. Mata Pelajaran <span className="text-rose-500">*</span>
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

 {/* Field 5: Dropdown CP (Database, Dependent Dropdown) */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
 <span>
 5. Capaian Pembelajaran (CP) <span className="text-rose-500">*</span>
 </span>
 {loadingCp && <span className="text-emerald-600 text-xs font-normal animate-pulse">Memuat CP DB...</span>}
 </label>
 <CustomSelect
 value={formData.cp_id}
 onChange={(e) => setFormData({ ...formData, cp_id: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] dark:text-slate-100"
 required
 >
 <option value="">-- Pilih CP (Ambil Data DB Status Aktif) --</option>
 {cpOptions.map((cp) => (
 <option key={cp.id} value={cp.id}>
 [{cp.kode_cp}] {cp.nama_cp}
 </option>
 ))}
 </CustomSelect>
 {cpOptions.length === 0 && !loadingCp && (
 <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
 * Belum ada CP Aktif di database untuk kriteria Unit/Tahun/Kurikulum/Mapel ini.
 </p>
 )}
 </div>

 {/* Field 6: Kode TP (Auto Generate) */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 6. Kode TP <span className="text-emerald-600 font-semibold">(Auto Generate)</span>
 </label>
 <input
 type="text"
 readOnly
 value={formData.kode_tp}
 className="w-full px-4 py-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-700/80 bg-emerald-50 dark:bg-emerald-950/40 text-sm font-mono font-bold text-[#059669] dark:text-[#10B981] cursor-not-allowed"
 />
 </div>

 {/* Field 7: Alokasi JP */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 7. Alokasi Waktu (JP)
 </label>
 <input
 type="number"
 min={1}
 value={formData.alokasi_waktu_jp}
 onChange={(e) => setFormData({ ...formData, alokasi_waktu_jp: parseInt(e.target.value) || 1 })}
 className="w-full px-4 py-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] dark:text-slate-100"
 />
 </div>

 {/* Field 8: Deskripsi TP */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 8. Deskripsi TP <span className="text-rose-500">*</span>
 </label>
 <textarea
 rows={3}
 placeholder="Masukkan uraian spesifik indikator Tujuan Pembelajaran..."
 value={formData.deskripsi_tp}
 onChange={(e) => setFormData({ ...formData, deskripsi_tp: e.target.value })}
 className="w-full px-4 py-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] dark:text-slate-100"
 required
 />
 </div>

 {/* Field 9 & 10: Urutan & Status */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 9. Urutan
 </label>
 <input
 type="number"
 min={1}
 value={formData.urutan}
 onChange={(e) => setFormData({ ...formData, urutan: parseInt(e.target.value) || 1 })}
 className="w-full px-4 py-2.5 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] dark:text-slate-100"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 10. Status
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

        </form>
      </AppModal>

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
