import {
  useState,
  useMemo
} from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient
} from '@tanstack/react-query'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  AlertTriangle,
  BarChart2,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Layers,
  Palette,
  Pencil,
  PieChart as PieIcon,
  Plus,
  Power,
  Printer,
  RefreshCcw,
  RotateCcw,
  Save,
  School,
  Search,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  X
} from 'lucide-react'
import {
  Download as Download1,
  Upload as Upload1
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import {
  jenisUnitService
} from '../services/jenisUnitService'
import {
  downloadFileFromApi
} from '../utils/exportUtils'
import {
  renderJenisUnitIcon
} from '../components/jenis-unit/JenisUnitTable'
import JenisUnitFormModal from '../components/jenis-unit/JenisUnitFormModal'
import JenisUnitDetailModal from '../components/jenis-unit/JenisUnitDetailModal'
import JenisUnitImportModal from '../components/jenis-unit/JenisUnitImportModal'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppModal from '../components/app/AppModal'
import AppDataTable from '../components/app/AppDataTable'
import ActionDropdown from '../components/app/ActionDropdown'
import AppBadge from '../components/app/AppBadge'
import {
  HeroUiHeader,
  useToast,
  KpiStatCard,
  PageToolbarActions
} from '../components/app'
import {
  MasterStatusBadge,
  PrintOptionModal
} from '../components/master-data'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import {
  printCleanTable,
  downloadPdfTable
} from '../utils/printHelper'
import {
  usePengaturanStore
} from '../stores/pengaturanStore'
import {
  useAuthStore
} from '../stores/authStore'
import {
  hasRoleLevel,
  ROLE_LEVELS,
  isFoundationUser
} from '../auth/portalResolver'
import {
  SmartScrollFab
} from '../components/common'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  cn
} from '../lib/utils'
import {
  Button
} from '@/components/ui/button'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger
} from '@/components/ui/hover-card'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../components/ui/table'

const JENJANG_LIST = ['PAUD', 'TK', 'SD', 'MI', 'SMP', 'MTs', 'SMA', 'MA', 'Pondok Pesantren', 'Mahad']

// ── DEFINISI TONE WARNA KARTU KPI MODERN ──────────────────────────────────────
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
    card: 'rounded-[22px] border-2 border-emerald-300 dark:border-emerald-800/80 bg-gradient-to-b from-slate-100/70 via-slate-50/30 to-white dark:from-slate-900/60 dark:via-slate-900 dark:to-slate-950 hover:border-emerald-200/80',
    glow: 'bg-slate-400/20 group-hover:bg-slate-400/30',
    iconBox: '!bg-slate-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-slate-600 !text-white shadow-xs rounded-full',
    tag: 'bg-emerald-50 text-slate-800 dark:bg-emerald-950/40 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    badgeBg: 'bg-emerald-50 text-slate-800 dark:bg-emerald-950/40 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    tagHeader: 'text-slate-800 dark:text-slate-300',
    title: 'text-slate-800 dark:text-slate-300',
    val: 'text-slate-900 dark:text-white',
    value: 'text-slate-900 dark:text-white',
    sub: 'text-slate-700 dark:text-slate-400 font-bold',
    subtext: 'text-slate-700 dark:text-slate-400 font-bold',
    cta: 'text-slate-700 dark:text-slate-400 font-bold',
    divider: 'border-emerald-100/80 dark:border-emerald-900/40/60',
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



const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: {
 staggerChildren: 0.08,
 delayChildren: 0.05,
 },
 },
}

const itemVariants = {
 hidden: { opacity: 0, y: 15 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { type: 'spring', stiffness: 350, damping: 25 },
 },
}

export default function MasterJenisUnitPendidikanPage() {
 const queryClient = useQueryClient()
 const sitePengaturan = usePengaturanStore((state) => state.pengaturan)
 const user = useAuthStore((state) => state.user)
 const isFoundation = isFoundationUser(user)
 const canManage = !isFoundation && hasRoleLevel(user, ROLE_LEVELS.OPERATOR)

 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [selectedStatusFilter, setSelectedStatusFilter] = useState('')
 const [selectedJenjangFilter, setSelectedJenjangFilter] = useState('')
 const [denganSampahFilter, setDenganSampahFilter] = useState('')
 const [perPage, setPerPage] = useState(10)
 const [page, setPage] = useState(1)

 // Modals & States
 const [isFormModalOpen, setIsFormModalOpen] = useState(false)
 const [selectedForEdit, setSelectedForEdit] = useState(null)
 const [pendingSavePayload, setPendingSavePayload] = useState(null)
 const [showSaveConfirmModal, setShowSaveConfirmModal] = useState(false)
 const [deleteTarget, setDeleteTarget] = useState(null)

 const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
 const [selectedForDetail, setSelectedForDetail] = useState(null)
 const [isImportModalOpen, setIsImportModalOpen] = useState(false)
 const [importResult, setImportResult] = useState(null)
 const [duplicateModalData, setDuplicateModalData] = useState(null)
 const [showExportModal, setShowExportModal] = useState(false)
 const [exportFormat, setExportFormat] = useState('xlsx')
 const [isExporting, setIsExporting] = useState(false)
 const [printOptionModalOpen, setPrintOptionModalOpen] = useState(false)
 const [activeKpiModal, setActiveKpiModal] = useState(null)
 const [kpiModalSearch, setKpiModalSearch] = useState('')

 // Toast Notifications
 const toast = useToast()
 const pushToast = (title, message = '', type = 'success') => {
 toast(title, message, type)
 }

 // Main Query
 const {
 data: responseData = {},
 isLoading,
 isFetching,
 isError,
 refetch,
 } = useQuery({
 queryKey: ['jenis-unit-list', page, perPage, debouncedSearch, selectedStatusFilter, selectedJenjangFilter, denganSampahFilter],
 queryFn: () =>
 jenisUnitService.getDaftar({
 page,
 per_page: perPage,
 search: debouncedSearch,
 status: selectedStatusFilter,
 jenjang: selectedJenjangFilter,
 dengan_sampah: denganSampahFilter,
 order_by: 'urutan',
 order_dir: 'asc',
 }),
 })

 const listData = responseData?.data || []
 const meta = responseData?.meta || {}
 const stats = responseData?.statistik || {}

 // Dedicated query for KPI Cards drill-down modal to ensure full dataset
 const { data: allJenisUnitResponse = {} } = useQuery({
 queryKey: ['all-jenis-unit-for-kpi'],
 queryFn: () => jenisUnitService.getDaftar({ per_page: 100, dengan_sampah: 'true' }),
 })
 const allListData = allJenisUnitResponse?.data || listData

 const activeCount = stats.aktif ?? 0
 const inactiveCount = stats.tidak_aktif ?? 0
 const deletedCount = stats.terhapus ?? 0
 const totalCount = stats.total ?? listData.length ?? 0

 // ── KPI Modal Drill-down Data ──────────────────────────────────────────
 const filteredKpiItems = useMemo(() => {
 if (!activeKpiModal) return []
 let base = allListData.length ? allListData : listData
 if (activeKpiModal === 'aktif') {
 base = base.filter((u) => !u.is_deleted && !u.terhapus && !u.deleted_at && (u.status === 'Aktif' || u.status === true || u.is_active))
 } else if (activeKpiModal === 'pasif') {
 base = base.filter((u) => !u.is_deleted && !u.terhapus && !u.deleted_at && (u.status === 'Nonaktif' || u.status === 'Tidak Aktif' || u.status === false || !u.is_active))
 } else if (activeKpiModal === 'sampah') {
 base = base.filter((u) => Boolean(u.is_deleted) || Boolean(u.terhapus) || Boolean(u.deleted_at))
 }
 if (kpiModalSearch.trim()) {
 const q = kpiModalSearch.toLowerCase()
 base = base.filter(
 (u) =>
 (u.nama_jenis || u.nama || u.name || '').toLowerCase().includes(q) ||
 (u.kode_jenis || u.kode || u.code || '').toLowerCase().includes(q) ||
 (u.jenjang || '').toLowerCase().includes(q)
 )
 }
 return base
 }, [activeKpiModal, allListData, listData, kpiModalSearch])

 // ── Chart Data Calculations ────────────────────────────────────────────
 const jenjangChartData = useMemo(() => {
 const counts = {}
 JENJANG_LIST.forEach((j) => {
 counts[j] = 0
 })
 listData.forEach((item) => {
 if (item.jenjang && counts[item.jenjang] !== undefined) {
 counts[item.jenjang] += 1
 }
 })
 return Object.keys(counts)
 .map((j) => ({ name: j, jumlah: counts[j] }))
 .filter((d) => d.jumlah > 0)
 }, [listData])

 const statusChartData = useMemo(() => {
 return [
 { name: 'Jenis Unit Aktif', value: activeCount, color: '#10B981' },
 { name: 'Tidak Aktif', value: inactiveCount, color: '#F59E0B' },
 { name: 'Terhapus / Arsip', value: deletedCount, color: '#F43F5E' },
 ].filter((d) => d.value > 0)
 }, [activeCount, inactiveCount, deletedCount])

 // ── Print & Export Handlers ────────────────────────────────────────────
 const handlePrintClean = () => {
 const orgName = (sitePengaturan?.school_name || sitePengaturan?.application_name || '').trim()
 printCleanTable({
 title: 'REKAPITULASI MASTER JENIS UNIT PENDIDIKAN',
 subtitle: `${orgName ? orgName + ' · ' : ''}Total Terdaftar: ${totalCount} Jenis Unit`,
 headers: ['NO', 'KODE JENIS', 'NAMA JENIS UNIT', 'SINGKATAN', 'JENJANG', 'URUTAN', 'STATUS'],
 rows: listData.map((item, index) => [
 index + 1,
 item.kode_jenis || '-',
 item.nama_jenis || '-',
 item.singkatan || '-',
 item.jenjang || '-',
 item.urutan ?? '-',
 item.is_deleted ? 'Terhapus' : item.status ? 'Aktif' : 'Tidak Aktif',
 ]),
 foundationName: orgName,
 systemLogo: sitePengaturan?.logo_url,
 })
 }

 const handleDownloadPdfTable = () => {
 const orgName = (sitePengaturan?.school_name || sitePengaturan?.application_name || '').trim()
 downloadPdfTable({
 title: 'REKAPITULASI MASTER JENIS UNIT PENDIDIKAN',
 filename: `rekap-jenis-unit-${new Date().toISOString().slice(0, 10)}.pdf`,
 subtitle: `${orgName ? orgName + ' · ' : ''}Total Terdaftar: ${totalCount} Jenis Unit`,
 headers: ['NO', 'KODE JENIS', 'NAMA JENIS UNIT', 'SINGKATAN', 'JENJANG', 'URUTAN', 'STATUS'],
 rows: listData.map((item, index) => [
 index + 1,
 item.kode_jenis || '-',
 item.nama_jenis || '-',
 item.singkatan || '-',
 item.jenjang || '-',
 item.urutan ?? '-',
 item.is_deleted ? 'Terhapus' : item.status ? 'Aktif' : 'Tidak Aktif',
 ]),
 foundationName: orgName,
 systemLogo: sitePengaturan?.logo_url,
 })
 }

 const paginationInfo = {
 total: meta.total ?? listData.length,
 from: meta.from ?? (listData.length ? (page - 1) * perPage + 1 : 0),
 to: meta.to ?? ((page - 1) * perPage + listData.length),
 last_page: meta.last_page ?? 1,
 current_page: meta.current_page ?? page,
 per_page: meta.per_page ?? perPage,
 }

 // Mutations with zero SweetAlert2
 const simpanMutation = useMutation({
 mutationFn: (payload) => jenisUnitService.tambah(payload),
 onSuccess: (res) => {
 queryClient.invalidateQueries({ queryKey: ['jenis-unit-list'] })
 queryClient.invalidateQueries({ queryKey: ['all-jenis-unit-for-kpi'] })
 setIsFormModalOpen(false)
 setShowSaveConfirmModal(false)
 setPendingSavePayload(null)
 pushToast('Berhasil Disimpan', res?.message || 'Jenis unit pendidikan baru berhasil ditambahkan.', 'success')
 },
 onError: (error) => {
 setShowSaveConfirmModal(false)
 pushToast('Gagal Menyimpan', error.response?.data?.message || 'Gagal menyimpan jenis unit pendidikan.', 'error')
 },
 })

 const ubahMutation = useMutation({
 mutationFn: ({ id, payload }) => jenisUnitService.ubah({ id, payload }),
 onSuccess: (res) => {
 queryClient.invalidateQueries({ queryKey: ['jenis-unit-list'] })
 queryClient.invalidateQueries({ queryKey: ['all-jenis-unit-for-kpi'] })
 setIsFormModalOpen(false)
 setSelectedForEdit(null)
 setShowSaveConfirmModal(false)
 setPendingSavePayload(null)
 pushToast('Berhasil Diperbarui', res?.message || 'Perubahan jenis unit pendidikan berhasil disimpan.', 'success')
 },
 onError: (error) => {
 setShowSaveConfirmModal(false)
 pushToast('Gagal Memperbarui', error.response?.data?.message || 'Gagal memperbarui jenis unit pendidikan.', 'error')
 },
 })

 const hapusMutation = useMutation({
 mutationFn: (id) => jenisUnitService.hapus(id),
 onSuccess: (res) => {
 queryClient.invalidateQueries({ queryKey: ['jenis-unit-list'] })
 queryClient.invalidateQueries({ queryKey: ['all-jenis-unit-for-kpi'] })
 setDeleteTarget(null)
 pushToast('Berhasil Dihapus', res?.message || 'Jenis unit pendidikan berhasil dihapus.', 'success')
 },
 onError: (error) => {
 setDeleteTarget(null)
 pushToast('Gagal Menghapus', error.response?.data?.message || 'Data yang sudah digunakan tidak dapat dihapus.', 'error')
 },
 })

 const pulihkanMutation = useMutation({
 mutationFn: (id) => jenisUnitService.pulihkan(id),
 onSuccess: (res) => {
 queryClient.invalidateQueries({ queryKey: ['jenis-unit-list'] })
 queryClient.invalidateQueries({ queryKey: ['all-jenis-unit-for-kpi'] })
 pushToast('Berhasil Dipulihkan', res?.message || 'Jenis unit pendidikan berhasil dipulihkan.', 'success')
 },
 onError: (error) => {
 pushToast('Gagal Memulihkan', error.response?.data?.message || 'Data gagal dipulihkan.', 'error')
 },
 })

 const importMutation = useMutation({
 mutationFn: (param) => {
 if (param && (param.file || param.rows || param.overwrite !== undefined)) {
 const form = new FormData()
 if (param.file) form.append('file', param.file)
 if (param.rows) form.append('data', JSON.stringify(param.rows))
 form.append('overwrite', param.overwrite ? '1' : '0')
 return jenisUnitService.prosesImport(form)
 }
 return jenisUnitService.prosesImport(param)
 },
 onSuccess: (res, vars) => {
 queryClient.invalidateQueries({ queryKey: ['jenis-unit-list'] })
 queryClient.invalidateQueries({ queryKey: ['all-jenis-unit-for-kpi'] })
 const resData = res?.data || {}
 const duplikatCount = resData.duplikat || 0
 const diperbaruiCount = resData.diperbarui || 0
 const berhasilCount = resData.berhasil || 0
 const totalCount = resData.total || 0
 const overwrite = vars?.overwrite || false

 if (duplikatCount > 0 || (diperbaruiCount > 0 && overwrite)) {
 const titleMsg = overwrite ? 'Impor Selesai (Data Ditimpa)' : 'Pemberitahuan Data Duplikat'
 const detailMsg = overwrite
 ? `${berhasilCount} baru, ${diperbaruiCount} berhasil ditimpa dari total ${totalCount} data.`
 : `${berhasilCount} berhasil, ${duplikatCount} data dilewati karena sudah ada.`
 pushToast(titleMsg, detailMsg, overwrite ? 'info' : 'warning')
 } else {
 pushToast('Import Data Berhasil', res?.message || `${berhasilCount} data jenis unit berhasil diimpor.`, 'success')
 }

 if (Array.isArray(resData.duplicates) && resData.duplicates.length > 0) {
 setDuplicateModalData(resData)
 }
 setIsImportModalOpen(false)
 setImportResult(null)
 },
 onError: (error) => {
 pushToast('Gagal Mengimpor', error.response?.data?.message || 'Gagal memproses impor data.', 'error')
 },
 })

 const handleOpenFormTambah = () => {
 if (!canManage) return
 setSelectedForEdit(null)
 setIsFormModalOpen(true)
 }

 const handleOpenFormEdit = (item) => {
 if (!canManage) return
 setSelectedForEdit(item)
 setIsFormModalOpen(true)
 }

 const handleOpenDetail = (item) => {
 setSelectedForDetail(item)
 setIsDetailModalOpen(true)
 }

 const handleFormSubmit = (payload) => {
 setPendingSavePayload(payload)
 setShowSaveConfirmModal(true)
 }

 const handleExecuteSave = () => {
 if (!pendingSavePayload) return
 if (selectedForEdit) {
 ubahMutation.mutate({
 id: selectedForEdit.id || selectedForEdit.uuid,
 payload: pendingSavePayload,
 })
 } else {
 simpanMutation.mutate(pendingSavePayload)
 }
 }

 const resetFilters = () => {
 setSearch('')
 setSelectedStatusFilter('')
 setSelectedJenjangFilter('')
 setDenganSampahFilter('')
 setPage(1)
 }

 const handleProcessExport = async () => {
 setIsExporting(true)
 setShowExportModal(false)
 try {
 await downloadFileFromApi(
 '/master/jenis-unit/export',
 {
 search: debouncedSearch,
 status: selectedStatusFilter,
 jenjang: selectedJenjangFilter,
 },
 exportFormat,
 'data_master_jenis_unit'
 )
 pushToast('Export Berhasil', 'Berkas data jenis unit sedang diunduh.', 'success')
 } catch {
 pushToast('Gagal Export', 'Terjadi kendala saat menyiapkan berkas ekspor.', 'error')
 } finally {
 setIsExporting(false)
 }
 }

 const tableIsLoading = isLoading || isFetching
 const filtersAreClear = !search && !selectedStatusFilter && !selectedJenjangFilter && !denganSampahFilter

 // Columns definition following HEROUI_TABLE_COMPONENT standard
  const columns = [
    {
      key: 'nama_jenis',
      label: 'Identitas Jenis Unit',
      className: 'w-[34%]',
      render: (row) => (
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600"
            style={{ borderColor: row.warna_badge ? `${row.warna_badge}40` : undefined }}
          >
            {renderJenisUnitIcon(row.icon, 'w-5 h-5')}
          </span>
          <span className="min-w-0 flex-1">
            <HoverCard>
              <HoverCardTrigger
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  handleOpenDetail(row)
                }}
                className="inline-block max-w-full truncate text-xs font-bold leading-5 text-slate-900 dark:text-white border-b border-dashed border-emerald-200/80 hover:border-[#059669] transition-colors cursor-pointer"
                title={row.nama_jenis}
              >
                {row.nama_jenis || '—'}
              </HoverCardTrigger>
              <HoverCardContent className="w-68 p-4 border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:border-emerald-800/60 dark:bg-card-dark shadow-xl rounded-xl">
                <div className="flex items-center gap-2.5 mb-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    {renderJenisUnitIcon(row.icon, 'w-5 h-5')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white ">{row.nama_jenis}</h4>
                    <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">{row.kode_jenis} ({row.singkatan || '-'})</p>
                  </div>
                </div>
                <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                  <p><strong className="text-slate-400 font-semibold">Jenjang:</strong> {row.jenjang || '-'}</p>
                  <p><strong className="text-slate-400 font-semibold">Urutan Tampil:</strong> {row.urutan ?? '-'}</p>
                  <p className="truncate"><strong className="text-slate-400 font-semibold">Keterangan:</strong> {row.keterangan || 'Tanpa keterangan'}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenDetail(row)}
                  className="w-full py-1.5 bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white text-[10px] font-extrabold uppercase tracking-wider rounded-xl transition-all hover:brightness-105 mt-3 cursor-pointer shadow-xs"
                >
                  Lihat Rincian Data
                </button>
              </HoverCardContent>
            </HoverCard>
            <span className="flex min-w-0 items-center gap-1.5 mt-0.5">
              <small className="truncate text-[10px] font-bold text-emerald-700 dark:text-emerald-400">{row.kode_jenis} · {row.singkatan || '-'}</small>
            </span>
          </span>
        </div>
      ),
    },
    {
      key: 'jenjang',
      label: 'Jenjang & Lingkup',
      className: 'w-[24%]',
      render: (row) => (
        <span className="inline-flex rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/60 px-2.5 py-1 text-[10px] font-black text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
          {row.jenjang || '—'}
        </span>
      ),
    },
    {
      key: 'visual_urutan',
      label: 'Visual & Urutan',
      className: 'w-[22%]',
      render: (row) => {
        const badgeColor = row.warna_badge || '#10B981'
        return (
          <div className="flex items-center gap-2">
            <span className="inline-block h-4 w-4 shrink-0 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs" style={{ backgroundColor: badgeColor }} />
            <span className="font-mono text-[10px] font-extrabold uppercase text-slate-500 dark:text-slate-400">{badgeColor}</span>
            <span className="text-slate-300 dark:text-slate-600">•</span>
            <span className="text-xs font-black tabular-nums text-slate-700 dark:text-slate-200">
              Urutan {row.urutan ?? '—'}
            </span>
          </div>
        )
      },
    },
    {
      key: 'status',
      label: 'Status',
      className: 'w-[12%] text-center',
      render: (row) =>
        row.is_deleted ? (
          <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-extrabold text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-emerald-200/80 dark:border-emerald-800/60">
            Terhapus
          </span>
        ) : (
          <MasterStatusBadge active={row.status} inactiveLabel="Tidak Aktif" />
        ),
    },
  ]

 const extraActions = ({ row }) => {
 if (row.is_deleted) {
 return (
 <button
 type="button"
 title="Pulihkan Data"
 onClick={(e) => {
 e.stopPropagation()
 pulihkanMutation.mutate(row.id || row.uuid)
 }}
 className="flex h-8 w-8 items-center justify-center rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 transition-colors cursor-pointer shadow-xs"
 >
 <RotateCcw className="h-4 w-4" />
 </button>
 )
 }
 return null
 }

 const renderMobileCard = ({ row, onView, onEdit, onDelete }) => (
 <div className={`rounded-xl border bg-white p-4 shadow-xs dark:bg-card-dark ${row.is_deleted ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/20' : 'border-emerald-200/80 dark:border-emerald-800/60'}`}>
 <div className="flex items-start gap-3">
 <span className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 {renderJenisUnitIcon(row.icon, 'w-5 h-5')}
 </span>
 <div className="min-w-0 flex-1">
 <div className="flex items-start justify-between gap-2">
 <div>
 <p className="text-sm font-black text-slate-900 dark:text-white">{row.nama_jenis}</p>
 <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">{row.kode_jenis} · {row.singkatan || '-'}</p>
 </div>
 {row.is_deleted ? (
 <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">Terhapus</span>
 ) : (
 <MasterStatusBadge active={row.status} inactiveLabel="Tidak Aktif" />
 )}
 </div>
 <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
 <span>Jenjang: {row.jenjang}</span>
 <span>Urutan: {row.urutan}</span>
 </div>
 </div>
 </div>
 <div className="mt-3 flex items-center justify-end gap-2 border-t border-emerald-200/80 pt-2.5 dark:border-emerald-800/60">
 {row.is_deleted && (
 <button
 type="button"
 onClick={() => pulihkanMutation.mutate(row.id || row.uuid)}
 className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
 >
 <RotateCcw className="h-3.5 w-3.5" />
 <span>Pulihkan</span>
 </button>
 )}
 <ActionDropdown
 onView={onView}
 onEdit={!row.is_deleted ? onEdit : undefined}
 onDelete={!row.is_deleted ? () => setDeleteTarget(row) : undefined}
 />
 </div>
 </div>
 )

 return (
 <PageContainer maxW="7xl">
 <motion.div
 initial="hidden"
 animate="visible"
 variants={containerVariants}
 className="space-y-6 pb-12"
 >
 {/* Breadcrumb */}
 <motion.div variants={itemVariants}>
 <AppBreadcrumb items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Jenis Unit Pendidikan' }]} />
 </motion.div>

 {/* Header Halaman Modern Hero Card */}
  <HeroUiHeader
    title="Master Jenis Unit Pendidikan"
    subtitle="Pengelolaan klasifikasi jenis unit sekolah (TK, SD, SMP, SMA, Ponpes, Ma'had), jenjang pendidikan, urutan tampilan, dan preferensi visual secara terpadu."
    icon={Layers}
    roleTag="Master Data"
    badge="Klasifikasi Unit"
  />

 {/* Modern Multi-Tone KPI Summary Cards */}
 <motion.div variants={itemVariants}>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernKpiCard
 icon={School}
 label="Total Jenis Unit"
 value={isLoading ? '...' : Number(totalCount).toLocaleString('id-ID')}
 tag={`${totalCount} Jenis`}
 subtext="Terdaftar di sistem"
 tone="emerald"
 onClick={() => {
 setKpiModalSearch('')
 setActiveKpiModal('total')
 }}
 />
 <ModernKpiCard
 icon={CheckCircle2}
 label="Jenis Unit Aktif"
 value={isLoading ? '...' : Number(activeCount).toLocaleString('id-ID')}
 tag={`${activeCount} Aktif`}
 subtext="Dapat digunakan di unit"
 tone="teal"
 onClick={() => {
 setKpiModalSearch('')
 setActiveKpiModal('aktif')
 }}
 />
 <ModernKpiCard
 icon={RotateCcw}
 label="Tidak Aktif"
 value={isLoading ? '...' : Number(inactiveCount).toLocaleString('id-ID')}
 tag={`${inactiveCount} Pasif`}
 subtext="Dinonaktifkan sementara"
 tone="amber"
 onClick={() => {
 setKpiModalSearch('')
 setActiveKpiModal('pasif')
 }}
 />
 <ModernKpiCard
 icon={Trash2}
 label="Data Terhapus"
 value={isLoading ? '...' : Number(deletedCount).toLocaleString('id-ID')}
 tag={`${deletedCount} Arsip`}
 subtext="Arsip di tempat sampah"
 tone="rose"
 onClick={() => {
 setKpiModalSearch('')
 setActiveKpiModal('sampah')
 }}
 />
 </div>
 </motion.div>

 {/* Visual Analytics Charts Section */}
 <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-stretch">
 {/* Grafik 1: Distribusi Jenjang Pendidikan */}
 <article className="overflow-hidden rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-xs dark:bg-card-dark flex flex-col justify-between h-full">
 <div>
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60">
 <div className="flex items-center gap-2">
 <BarChart2 className="size-5 text-emerald-600 dark:text-emerald-400" />
 <div>
 <h3 className="text-base font-black text-slate-900 dark:text-white">
 Distribusi Jenjang Pendidikan
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Jumlah jenis unit berdasarkan klasifikasi jenjang sekolah
 </p>
 </div>
 </div>
 <AppBadge variant="success" size="sm">
 {jenjangChartData.length} Jenjang
 </AppBadge>
 </div>

 <div className="h-64 w-full pt-2">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={jenjangChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
 <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700 }} stroke="#94A3B8" />
 <YAxis tick={{ fontSize: 11, fontWeight: 700 }} stroke="#94A3B8" />
 <Tooltip
 content={({ active, payload }) => {
 if (active && payload && payload.length) {
 const data = payload[0].payload
 return (
 <div className="rounded-xl border border-emerald-200/80 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
 <p className="text-xs font-bold text-emerald-400 mb-0.5">Jenjang: {data.name}</p>
 <p className="text-xs font-extrabold">Jumlah Jenis Unit: {data.jumlah}</p>
 </div>
 )
 }
 return null
 }}
 />
 <Bar dataKey="jumlah" name="Jumlah Jenis Unit" fill="#10B981" radius={[6, 6, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/80 flex items-center justify-between text-xs font-semibold text-slate-500">
 <span>Klasifikasi resmi Yayasan</span>
 <span className="text-emerald-600 dark:text-emerald-400 font-bold">Terstruktur</span>
 </div>
 </article>

 {/* Grafik 2: Komposisi Status Jenis Unit */}
 <article className="overflow-hidden rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-xs dark:bg-card-dark flex flex-col justify-between h-full">
 <div>
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60">
 <div className="flex items-center gap-2">
 <PieIcon className="size-5 text-teal-600 dark:text-teal-400" />
 <div>
 <h3 className="text-base font-black text-slate-900 dark:text-white">
 Komposisi Status Jenis Unit
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Perbandingan status jenis unit aktif, pasif, dan arsip terhapus
 </p>
 </div>
 </div>
 <AppBadge variant="info" size="sm">
 100% Data Synchronized
 </AppBadge>
 </div>

 <div className="h-64 w-full flex items-center justify-center">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={statusChartData}
 cx="50%"
 cy="50%"
 innerRadius={55}
 outerRadius={85}
 paddingAngle={3}
 dataKey="value"
 >
 {statusChartData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <Tooltip
 content={({ active, payload }) => {
 if (active && payload && payload.length) {
 const data = payload[0].payload
 return (
 <div className="rounded-xl border border-emerald-200/80 bg-slate-900/95 p-3 text-white shadow-xl backdrop-blur-sm">
 <p className="text-xs font-bold text-teal-400 mb-0.5">{data.name}</p>
 <p className="text-xs font-extrabold">Total: {data.value} item</p>
 </div>
 )
 }
 return null
 }}
 />
 <Legend
 formatter={(value, entry) => (
 <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
 {entry.payload.name} ({entry.payload.value})
 </span>
 )}
 />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </div>
 <div className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/80 flex items-center justify-between text-xs font-semibold text-slate-500">
 <span>Status Operasional Unit</span>
 <span className="text-teal-600 dark:text-teal-400 font-bold">Terverifikasi</span>
 </div>
 </article>
 </motion.div>

 {/* Datatable Container */}
 <motion.div variants={itemVariants}>
 <div id="tabel-jenis-unit" className="scroll-mt-6">
 <AppDataTable
 title="Daftar Jenis Unit Pendidikan"
 description="Kelola klasifikasi, jenjang, identitas visual, dan status jenis unit pendidikan."
 icon={Layers}
 iconClassName="bg-emerald-50 border-2 border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 border-2 border-emerald-300 dark:border-emerald-800"
 actions={
 <PageToolbarActions
 onPrint={() => setPrintOptionModalOpen(true)}
 onImport={canManage ? () => {
 setImportResult(null)
 setIsImportModalOpen(true)
 } : undefined}
 onExport={() => setShowExportModal(true)}
 primaryAction={canManage ? {
 label: "Tambah Jenis Unit",
 onClick: handleOpenFormTambah,
 } : null}
 />
 }
 columns={columns}
 data={listData}
 keyField="id"
 isLoading={tableIsLoading}
 isError={isError}
 errorTitle="Data jenis unit gagal dimuat"
 errorMessage="Periksa koneksi atau coba muat ulang data."
 onRetry={refetch}
 serverControlled
 search={search}
 onSearchChange={(val) => {
 setSearch(val)
 setPage(1)
 }}
 searchPlaceholder="Cari kode, nama jenis unit, atau singkatan..."
 filters={
 <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
 {/* Status filter */}
 <HeroUiFilterSelect
 value={selectedStatusFilter}
 onChange={(val) => {
 setSelectedStatusFilter(val)
 setPage(1)
 }}
 options={[
 { value: '', label: 'Semua Status' },
 { value: 'true', label: 'Aktif' },
 { value: 'false', label: 'Tidak Aktif' },
 ]}
 placeholder="Semua Status"
 icon={CheckCircle2}
 ariaLabel="Filter status jenis unit"
 size="sm"
 className="w-full sm:w-auto min-w-[140px]"
 />

 {/* Jenjang filter */}
 <HeroUiFilterSelect
 value={selectedJenjangFilter}
 onChange={(val) => {
 setSelectedJenjangFilter(val)
 setPage(1)
 }}
 options={[
 { value: '', label: 'Semua Jenjang' },
 ...JENJANG_LIST.map((jenjang) => ({ value: jenjang, label: jenjang })),
 ]}
 placeholder="Semua Jenjang"
 icon={GraduationCap}
 ariaLabel="Filter jenjang pendidikan"
 size="sm"
 className="w-full sm:w-auto min-w-[140px]"
 />

 {/* Cakupan data filter */}
 <HeroUiFilterSelect
 value={denganSampahFilter}
 onChange={(val) => {
 setDenganSampahFilter(val)
 setPage(1)
 }}
 options={[
 { value: '', label: 'Data Aktif' },
 { value: 'true', label: 'Termasuk Terhapus' },
 ]}
 placeholder="Data Aktif"
 icon={Tag}
 ariaLabel="Filter cakupan data jenis unit"
 size="sm"
 className="w-full sm:w-auto min-w-[140px]"
 />

 {/* Per Page filter */}
 <HeroUiFilterSelect
 value={perPage}
 onChange={(val) => {
 setPerPage(Number(val))
 setPage(1)
 }}
 options={[
 { value: '5', label: '5 per hal' },
 { value: '10', label: '10 per hal' },
 { value: '15', label: '15 per hal' },
 { value: '25', label: '25 per hal' },
 { value: '50', label: '50 per hal' },
 { value: '100', label: '100 per hal' },
 ]}
 placeholder="10 per hal"
 ariaLabel="Tampilkan per halaman"
 size="sm"
 className="w-full sm:w-auto min-w-[120px]"
 />

 {/* Reset button */}
 {!filtersAreClear && (
 <Button
 variant="ghost"
 appearance="outline"
 size="xs"
 onClick={resetFilters}
 className="w-full sm:w-auto sm:ml-auto justify-center h-9 px-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border-emerald-200/80 dark:border-emerald-800/60 flex items-center gap-1.5 rounded-xl cursor-pointer"
 >
 <RefreshCcw className="size-3.5" />
 <span>Reset</span>
 </Button>
 )}
 </div>
 }
 actionColumnLabel=""
 onRowClick={(row) => handleOpenDetail(row)}
 onView={(row) => handleOpenDetail(row)}
 canEdit={(row) => canManage && !row.is_deleted}
 canDelete={(row) => canManage && !row.is_deleted}
 onEdit={canManage ? ((row) => (!row.is_deleted ? handleOpenFormEdit(row) : undefined)) : undefined}
 onDelete={canManage ? ((row) => (!row.is_deleted ? setDeleteTarget(row) : undefined)) : undefined}
 extraActions={extraActions}
 renderMobileCard={renderMobileCard}
 showPagination
 page={paginationInfo.current_page}
 totalPages={paginationInfo.last_page}
 totalItems={paginationInfo.total}
 itemsPerPage={paginationInfo.per_page}
 onPageChange={(p) => setPage(p)}
 meta={paginationInfo}
 emptyTitle="Jenis unit tidak ditemukan"
 emptyDescription="Ubah pencarian atau filter, lalu coba kembali."
 hasActiveFilters={!filtersAreClear}
 onResetFilters={resetFilters}
 />
 </div>
 </motion.div>
 </motion.div>

 {/* Modals & Forms */}
 <JenisUnitFormModal
 isOpen={isFormModalOpen}
 onClose={() => {
 setIsFormModalOpen(false)
 setSelectedForEdit(null)
 }}
 onSubmit={handleFormSubmit}
 initialData={selectedForEdit}
 isSubmitting={simpanMutation.isPending || ubahMutation.isPending}
 />

 <JenisUnitDetailModal
 isOpen={isDetailModalOpen}
 onClose={() => setIsDetailModalOpen(false)}
 data={selectedForDetail}
 onEdit={() => {
 setIsDetailModalOpen(false)
 handleOpenFormEdit(selectedForDetail)
 }}
 />

 <JenisUnitImportModal
 isOpen={isImportModalOpen}
 onClose={() => {
 setIsImportModalOpen(false)
 setImportResult(null)
 }}
 onImport={(param) => importMutation.mutate(param)}
 isSubmitting={importMutation.isPending}
 result={importResult}
 />

      {/* ── MODAL HASIL IMPOR & PEMBERITAHUAN DATA DUPLIKAT ── */}
      <AppModal
        isOpen={Boolean(duplicateModalData)}
        onClose={() => setDuplicateModalData(null)}
        title="Hasil Impor & Pemberitahuan Data"
        badge={duplicateModalData ? `Total ${duplicateModalData.total} Data` : undefined}
        description="Ringkasan sinkronisasi dan status pemrosesan data jenis unit"
        icon={duplicateModalData?.diperbarui > 0 ? RefreshCcw : CheckCircle2}
        maxWidth="max-w-2xl"
        zIndex={70}
        disableBackdropClose
        bodyClassName="space-y-4 text-sm text-slate-700 dark:text-slate-200"
        footer={
          <div className="flex w-full justify-end">
            <button
              type="button"
              onClick={() => setDuplicateModalData(null)}
              className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20"
            >
              <span>Mengerti</span>
            </button>
          </div>
        }
      >
        {duplicateModalData && (
          <>
 {/* KPI Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 p-3 text-center dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Baru</p>
 <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{duplicateModalData.berhasil || 0}</p>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/50 p-3 text-center dark:border-emerald-800/60 dark:bg-amber-950/30">
 <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Ditimpa</p>
 <p className="text-lg font-black text-amber-700 dark:text-amber-300 mt-0.5">{duplicateModalData.diperbarui || 0}</p>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/50 p-3 text-center dark:border-emerald-800/60 dark:bg-sky-950/30">
 <p className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider">Dilewati</p>
 <p className="text-lg font-black text-sky-700 dark:text-sky-300 mt-0.5">{duplicateModalData.duplikat || 0}</p>
 </div>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 p-3 text-center dark:border-emerald-800/60 dark:bg-rose-950/30">
 <p className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">Gagal</p>
 <p className="text-lg font-black text-rose-700 dark:text-rose-300 mt-0.5">{duplicateModalData.gagal || 0}</p>
 </div>
 </div>

 {/* Duplicate / Updated Rows List */}
 {Array.isArray(duplicateModalData.duplicates) && duplicateModalData.duplicates.length > 0 && (
 <div className="space-y-2">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
 <span>Rincian Data Yang Sesuai / Terdeteksi Duplikat</span>
 <span className="text-xs text-slate-500 font-normal">
 {duplicateModalData.duplicates.length} item
 </span>
 </p>
 <div className="max-h-56 overflow-auto rounded-xl border border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-slate-900/60">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <tr>
 <th className="px-3.5 py-2.5">Baris</th>
 <th className="px-3.5 py-2.5">Kode Jenis</th>
 <th className="px-3.5 py-2.5">Nama Jenis Unit</th>
 <th className="px-3.5 py-2.5">Status</th>
 <th className="px-3.5 py-2.5">Keterangan</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-slate-800 text-xs">
 {duplicateModalData.duplicates.map((dup, idx) => (
 <tr key={idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <td className="px-3.5 py-2 font-mono text-slate-500">#{dup.baris || idx + 1}</td>
 <td className="px-3.5 py-2 font-mono font-semibold text-slate-900 dark:text-white">{dup.kode || '-'}</td>
 <td className="px-3.5 py-2 font-medium text-slate-700 dark:text-slate-200">{dup.nama || '-'}</td>
 <td className="px-3.5 py-2">
 <span className={cn(
 "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold",
 dup.status === 'Ditimpa'
 ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
 : "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300"
 )}>
 {dup.status}
 </span>
 </td>
 <td className="px-3.5 py-2 text-slate-500 dark:text-slate-400">{dup.keterangan || '-'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}
          </>
        )}
      </AppModal>


 {/* Print Option Modal */}
 <PrintOptionModal
 isOpen={printOptionModalOpen}
 onClose={() => setPrintOptionModalOpen(false)}
 onPrint={handlePrintClean}
 onDownload={handleDownloadPdfTable}
 title="Master Jenis Unit Pendidikan"
 />

 {/* ══════════════════════════════════════════════════════════════════
 HARMONIZED BATCH EXPORT MODAL
 ══════════════════════════════════════════════════════════════════ */}
      {/* ── HARMONIZED EXPORT MODAL ── */}
      <AppModal
        isOpen={showExportModal}
        onClose={() => !isExporting && setShowExportModal(false)}
        title="Export Data Jenis Unit"
        badge="Unduh Data"
        description="Pilih format berkas untuk mengekspor data sesuai filter aktif."
        icon={Download}
        maxWidth="max-w-lg"
        disableBackdropClose={isExporting}
        hideCloseButton={isExporting}
        bodyClassName="space-y-4"
        footer={
          <>
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
              disabled={isExporting}
              onClick={handleProcessExport}
              className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              <Download className="size-4" />
              <span>{isExporting ? 'Menyiapkan...' : 'Unduh Berkas'}</span>
            </button>
          </>
        }
      >
 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 {[
 ['xlsx', 'Excel (.xlsx)', FileSpreadsheet, 'Format spreadsheet modern Microsoft Excel.'],
 ['xls', 'Excel (.xls)', FileSpreadsheet, 'Format kompatibilitas Excel 97-2003.'],
 ['csv', 'CSV (.csv)', FileText, 'Format teks koma terpisah universal.'],
 ].map(([value, label, Icon, desc]) => (
 <button
 key={value}
 type="button"
 onClick={() => setExportFormat(value)}
 className={`rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer ${
 exportFormat === value
 ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 shadow-sm dark:border-emerald-800/60 dark:bg-emerald-950/40'
 : 'border-emerald-200/80 bg-white hover:border-emerald-300 dark:border-emerald-800/60 dark:bg-slate-900/40'
 }`}
 >
 <div className="flex items-center gap-2 mb-1.5">
 <Icon
 className={`size-4.5 ${
 exportFormat === value ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'
 }`}
 />
 <span className="text-xs font-black text-slate-900 dark:text-white">{label}</span>
 </div>
 <p className="text-[10px] text-slate-500 leading-snug">{desc}</p>
 </button>
 ))}
 </div>

 <div className="p-3.5 rounded-xl bg-amber-50/70 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/30 dark:border-emerald-800/60 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
 <p className="font-bold flex items-center gap-1.5 mb-0.5">
 <Sparkles className="size-3.5 text-amber-600 dark:text-amber-400" />
 Filter Ekspor Aktif
 </p>
 <p className="text-xs text-amber-800/90 dark:text-amber-300/80">
 Data yang diekspor akan mencakup seluruh entitas terfilter ({totalCount} record jenis unit).
 </p>
 </div>
      </AppModal>

      {/* ── HARMONIZED SAVE/UPDATE CONFIRMATION MODAL (z-[70]) ── */}
      <AppModal
        isOpen={Boolean(showSaveConfirmModal && pendingSavePayload)}
        onClose={() => !simpanMutation.isPending && !ubahMutation.isPending && setShowSaveConfirmModal(false)}
        title={selectedForEdit ? 'Konfirmasi Perubahan Data' : 'Konfirmasi Penyimpanan Data'}
        badge={selectedForEdit ? 'Update Data' : 'Jenis Unit Baru'}
        description={
          selectedForEdit
            ? 'Pastikan rincian data sudah sesuai sebelum diperbarui di sistem.'
            : 'Pastikan rincian data jenis unit baru sudah sesuai sebelum disimpan.'
        }
        icon={selectedForEdit ? Pencil : School}
        variant={selectedForEdit ? 'warning' : 'emerald'}
        maxWidth="max-w-md"
        zIndex={70}
        disableBackdropClose={simpanMutation.isPending || ubahMutation.isPending}
        hideCloseButton={simpanMutation.isPending || ubahMutation.isPending}
        bodyClassName="space-y-4 text-slate-700 dark:text-slate-200"
        footer={
          <>
            <button
              type="button"
              disabled={simpanMutation.isPending || ubahMutation.isPending}
              onClick={() => setShowSaveConfirmModal(false)}
              className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Batal</span>
            </button>
            <button
              type="button"
              disabled={simpanMutation.isPending || ubahMutation.isPending}
              onClick={handleExecuteSave}
              className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-emerald-600 shadow-md shadow-emerald-600/20 disabled:opacity-50"
            >
              {simpanMutation.isPending || ubahMutation.isPending ? (
                <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Save className="size-4" strokeWidth={2} />
              )}
              <span>
                {simpanMutation.isPending || ubahMutation.isPending
                  ? 'Menyimpan...'
                  : selectedForEdit
                    ? 'Ya, Perbarui Data'
                    : 'Ya, Simpan Jenis Unit'}
              </span>
            </button>
          </>
        }
      >
        {pendingSavePayload && (
          <>
 {/* Summary Card */}
 <div className="rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-xl bg-white dark:bg-slate-900 shadow-xs border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400">
 {renderJenisUnitIcon(pendingSavePayload.icon, 'size-5')}
 </div>
 <div className="min-w-0 flex-1">
 <p className="text-xs font-black text-slate-900 dark:text-white truncate">
 {pendingSavePayload.nama_jenis}
 </p>
 <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
 {pendingSavePayload.kode_jenis} · Jenjang {pendingSavePayload.jenjang}
 </p>
 </div>
 </div>
 </div>

 {/* Notice Box */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 p-3.5 dark:border-emerald-800/60 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-300">
 <p className="font-bold flex items-center gap-1.5 mb-1 text-slate-800 dark:text-slate-200">
 <Sparkles className="size-3.5 text-emerald-600" />
 Status Operasional: {pendingSavePayload.status ? 'Aktif' : 'Nonaktif'}
 </p>
 <p className="text-xs text-slate-500 leading-snug">
 Data jenis unit ini akan langsung disinkronkan ke master data yayasan.
 </p>
 </div>
          </>
        )}
      </AppModal>

      {/* ── HARMONIZED DELETE CONFIRMATION DIALOG (z-[70]) ── */}
      <AppModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => !hapusMutation.isPending && setDeleteTarget(null)}
        title="Hapus Jenis Unit"
        badge="Hapus Data"
        description="Konfirmasi penghapusan data jenis unit pendidikan."
        icon={Trash2}
        variant="danger"
        maxWidth="max-w-md"
        zIndex={70}
        disableBackdropClose={hapusMutation.isPending}
        hideCloseButton={hapusMutation.isPending}
        bodyClassName="space-y-4 text-slate-700 dark:text-slate-200"
        footer={
          <>
            <button
              type="button"
              disabled={hapusMutation.isPending}
              onClick={() => setDeleteTarget(null)}
              className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Batal</span>
            </button>
            <button
              type="button"
              disabled={hapusMutation.isPending}
              onClick={() => hapusMutation.mutate(deleteTarget.id || deleteTarget.uuid)}
              className="h-9.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-rose-600 shadow-md shadow-rose-600/20 disabled:opacity-50"
            >
              {hapusMutation.isPending ? (
                <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Trash2 className="size-4" />
              )}
              <span>{hapusMutation.isPending ? 'Menghapus...' : 'Ya, Hapus Data'}</span>
            </button>
          </>
        }
      >
        {deleteTarget && (
          <>
 {/* Summary Card */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 p-4 dark:border-emerald-800/60 dark:bg-rose-950/30">
 <p className="text-xs font-black text-rose-900 dark:text-rose-200">
 {deleteTarget.nama_jenis}
 </p>
 <p className="text-xs font-bold text-rose-700 dark:text-rose-400 mt-0.5">
 Kode: {deleteTarget.kode_jenis} · Jenjang: {deleteTarget.jenjang}
 </p>
 </div>

 {/* Danger Callout */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/80 p-3.5 text-xs text-rose-900 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-200 leading-relaxed">
 <p className="font-bold flex items-center gap-1.5 mb-1">
 <AlertTriangle className="size-3.5 text-rose-600" />
 Perhatian
 </p>
 <p className="text-xs text-rose-800 dark:text-rose-300">
 Data jenis unit yang sedang digunakan oleh unit sekolah aktif tidak dapat dihapus permanen.
 </p>
 </div>
          </>
        )}
      </AppModal>

      {/* ── KPI CARDS DRILL-DOWN MODAL ── */}
      <AppModal
        isOpen={Boolean(activeKpiModal)}
        onClose={() => setActiveKpiModal(null)}
        title={
          activeKpiModal === 'total'
            ? 'Analisis Total Jenis Unit Pendidikan'
            : activeKpiModal === 'aktif'
              ? 'Rincian Jenis Unit Pendidikan Aktif'
              : activeKpiModal === 'pasif'
                ? 'Rincian Jenis Unit Pendidikan Dinonaktifkan'
                : 'Rincian Jenis Unit Pendidikan di Arsip Sampah'
        }
        badge="Data Realtime"
        description={`Menampilkan ${filteredKpiItems.length} data jenis unit terfilter`}
        icon={
          activeKpiModal === 'total'
            ? School
            : activeKpiModal === 'aktif'
              ? CheckCircle2
              : activeKpiModal === 'pasif'
                ? RotateCcw
                : Trash2
        }
        maxWidth="max-w-4xl"
        subHeader={
          <div className="flex items-center gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 px-6 py-3 dark:bg-emerald-950/30">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
              <input
                type="text"
                value={kpiModalSearch}
                onChange={(e) => setKpiModalSearch(e.target.value)}
                placeholder="Cari kode, nama jenis unit, atau jenjang..."
                className="h-10 w-full rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 bg-white pl-10 pr-4 text-xs font-bold text-slate-800 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
            <span className="inline-flex items-center rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-black text-white shadow-xs">
              {filteredKpiItems.length} data
            </span>
          </div>
        }
        footer={
          <div className="flex w-full items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Menampilkan total {filteredKpiItems.length} jenis unit
            </span>
            <button
              type="button"
              onClick={() => setActiveKpiModal(null)}
              className="h-9.5 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Tutup</span>
            </button>
          </div>
        }
      >
 {filteredKpiItems.length === 0 ? (
 <div className="py-12 text-center">
 <p className="text-sm font-bold text-slate-500">Tidak ada data jenis unit yang cocok dengan kriteria ini.</p>
 </div>
 ) : (
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <TableRoot className="w-full text-left text-xs">
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <TableRow>
 
 <TableHead className="px-4 py-3">Kode & Nama Jenis Unit</TableHead>
 <TableHead className="px-4 py-3">Jenjang</TableHead>
 <TableHead className="px-4 py-3 text-center">Urutan</TableHead>
 <TableHead className="px-4 py-3 text-center">Status</TableHead>
 <TableHead className="px-4 py-3 text-right"></TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 font-medium text-slate-700 dark:divide-slate-800 dark:text-slate-300">
 {filteredKpiItems.map((item, idx) => (
 <TableRow key={item.id || item.uuid || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors">
 
 <TableCell className="px-4 py-3">
 <span className="block font-black text-slate-900 dark:text-white">{item.nama_jenis || item.nama || item.name || '-'}</span>
 <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">Kode: {item.kode_jenis || item.kode || item.code || '-'}</span>
 </TableCell>
 <TableCell className="px-4 py-3">
 <span className="inline-flex rounded-lg bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border-2 border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950 dark:border-emerald-800/60 dark:text-emerald-300">
 {item.jenjang || '-'}
 </span>
 </TableCell>
 <TableCell className="px-4 py-3 text-center font-bold tabular-nums">{item.urutan ?? '-'} tabular-nums</TableCell>
 <TableCell className="px-4 py-3 text-center">
 {item.is_deleted || item.terhapus || Boolean(item.deleted_at) ? (
 <span className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-emerald-200/80 dark:border-emerald-800/60">Terhapus</span>
 ) : (
 <span
 className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
 item.status === 'Aktif' || item.status === true || item.is_active
 ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:border-emerald-800'
 : 'bg-amber-100 text-amber-800 border-emerald-200/80'
 }`}
 >
 {item.status === 'Aktif' || item.status === true || item.is_active ? 'Aktif' : 'Tidak Aktif'}
 </span>
 )}
 </TableCell>
 <TableCell className="px-4 py-3 text-right">
 <button
 type="button"
 onClick={() => {
 setActiveKpiModal(null)
 handleOpenDetail(item)
 }}
 className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl border-2 border-emerald-300 dark:border-emerald-800 bg-emerald-50 text-emerald-700 font-extrabold hover:bg-emerald-100 transition-colors text-xs cursor-pointer shadow-2xs"
 >
 <Eye className="size-3.5" />
 <span>Rincian</span>
 </button>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </TableRoot>
 </div>
 )}
      </AppModal>

 {/* Smart Floating Scroll Navigator (Opsi A) */}
 <SmartScrollFab targetId="tabel-jenis-unit" downTooltip="Langsung ke Tabel Jenis Unit" />
 </PageContainer>
 )
}
