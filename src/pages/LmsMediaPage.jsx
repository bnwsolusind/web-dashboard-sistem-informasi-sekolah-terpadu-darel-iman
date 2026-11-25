import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import {
  KpiStatCard
} from '../components/app'
import {
  useState,
  useEffect,
  useMemo,
  useRef
} from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  FileText,
  Video,
  Music,
  Presentation,
  FileCode,
  Image as ImageIcon,
  Link as LinkIcon,
  Plus,
  Search,
  Edit3,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  X,
  Sparkles,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  Eye,
  FileUp,
  Clock,
  Layers,
  BookOpen,
  Download,
  PlayCircle,
  Info
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
import {
  lmsMediaService
} from '../services/lmsMediaService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import AppModal from '../components/app/AppModal'
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
import MobileDataCard from '../components/app/MobileDataCard'
import CsvImportModal from '../components/master-data/CsvImportModal'
import {
  TableRoot,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@/components/ui/table'
import ActionDropdown from '../components/app/ActionDropdown'
import {
  RotateCcw,
  Printer,
  Check
} from 'lucide-react'

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

function HarmonizedDeleteMediaModal({ isOpen, onClose, onConfirm, item, isSubmitting }) {
 return (
 <AppModal
 isOpen={Boolean(isOpen && item)}
 onClose={onClose}
 title="Hapus Media Pembelajaran?"
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
 className="h-9 px-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition cursor-pointer"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={onConfirm}
 disabled={isSubmitting}
 className="h-9 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm transition cursor-pointer disabled:opacity-50"
 >
 {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Media'}
 </button>
 </>
 }
 >
 {item && (
 <>
 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
 Apakah Anda yakin ingin menghapus media <strong className="text-slate-900 dark:text-white">"{item.nama_file}"</strong>?
 </p>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 p-3 dark:border-emerald-800/60 dark:bg-rose-950/20">
 <div className="flex items-start gap-2">
 <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
 <p className="text-xs text-rose-800 dark:text-rose-300">
 File media ini tidak akan dapat diakses oleh siswa atau guru yang terhubung ke materi terkait.
 </p>
 </div>
 </div>
 </>
 )}
 </AppModal>
 )
}

// ── HEROUI MODAL FORM SELECT DROPDOWN COMPONENT ──
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

export default function LmsMediaPage({ embedded = false, hideBreadcrumb = false, hidePageHeader = false, tabNav = null }) {
 const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null, isSubmitting: false })
 const [dataMedia, setDataMedia] = useState([])
 const [optionsMateri, setOptionsMateri] = useState([])
 const [tipeOptions, setTipeOptions] = useState([
 { id: 'pdf', nama: 'Dokumen PDF', icon: FileText, color: 'text-red-500 bg-red-50 dark:bg-red-950/40 border-red-200' },
 { id: 'video', nama: 'Video Pembelajaran', icon: Video, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40 border-emerald-200/80' },
 { id: 'audio', nama: 'Audio / Podcast', icon: Music, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/40 border-emerald-200/80' },
 { id: 'ppt', nama: 'Presentation / PPT', icon: Presentation, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-emerald-200/80' },
 { id: 'word', nama: 'Dokumen Word / Doc', icon: FileCode, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80' },
 { id: 'image', nama: 'Gambar / Infografis', icon: ImageIcon, color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/40 border-pink-200' },
 { id: 'link', nama: 'Tautan / Link URL', icon: LinkIcon, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40 border-emerald-200/80' },
 ])

 const [stats, setStats] = useState({
 total_media: 0,
 total_pdf: 0,
 total_video: 0,
 total_audio: 0,
 total_ppt: 0,
 total_word: 0,
 total_image: 0,
 total_link: 0,
 total_materi: 0,
 })

 // KPI Modal State
 const [kpiModalOpen, setKpiModalOpen] = useState(false)
 const [kpiModalCategory, setKpiModalCategory] = useState({
 title: '',
 items: [],
 })

 const [loading, setLoading] = useState(true)
 const [errorMsg, setErrorMsg] = useState('')
 const [successMsg, setSuccessMsg] = useState('')

 // Filters & Pagination
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [selectedMateri, setSelectedMateri] = useState('')
 const [selectedTipe, setSelectedTipe] = useState('')
 const [page, setPage] = useState(1)
 const [pagination, setPagination] = useState({
 current_page: 1,
 last_page: 1,
 total: 0,
 per_page: 15,
 })

 const filterMateriOptions = useMemo(() => [
 { value: '', label: 'Semua Materi Pembelajaran' },
 ...optionsMateri.map((mat) => ({
 value: String(mat.id),
 label: mat.modul_ajar?.judul_modul ? `${mat.judul} (${mat.modul_ajar.judul_modul})` : mat.judul,
 })),
 ], [optionsMateri])

 const filterTipeOptions = useMemo(() => [
 { value: '', label: 'Semua Tipe Media' },
 ...tipeOptions.map((opt) => ({
 value: opt.id,
 label: opt.nama,
 })),
 ], [tipeOptions])

 const modalMateriOptions = useMemo(() => [
 ...optionsMateri.map((mat) => ({
 value: String(mat.id),
 label: mat.modul_ajar?.judul_modul ? `${mat.judul} (${mat.modul_ajar.judul_modul})` : mat.judul,
 })),
 ], [optionsMateri])

 const modalTipeOptions = useMemo(() => [
 ...tipeOptions.map((opt) => ({
 value: opt.id,
 label: opt.nama,
 })),
 ], [tipeOptions])

 // Modal State
 const [modalOpen, setModalOpen] = useState(false)
 const [previewModalOpen, setPreviewModalOpen] = useState(false)
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [importOpen, setImportOpen] = useState(false)
 const [previewItem, setPreviewItem] = useState(null)
 const [editingItem, setEditingItem] = useState(null)
 const [formSubmitting, setFormSubmitting] = useState(false)
 const [selectedFile, setSelectedFile] = useState(null)

 const handleExportCSV = () => {
 const headers = ['NO', 'NAMA MEDIA', 'TIPE', 'MATERI', 'URL/BERKAS', 'DESKRIPSI', 'URUTAN']
 const rows = (dataMedia || []).map((m, i) => [
 i + 1,
 `"${(m.nama_file || '').replace(/"/g, '""')}"`,
 m.tipe_file || '',
 `"${(m.materi?.judul || '').replace(/"/g, '""')}"`,
 `"${(m.url_eksternal || m.file_url || '').replace(/"/g, '""')}"`,
 `"${(m.deskripsi || '').replace(/"/g, '""')}"`,
 m.urutan || 1,
 ])
 const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
 const encodedUri = encodeURI(csvContent)
 const link = document.createElement('a')
 link.setAttribute('href', encodedUri)
 link.setAttribute('download', `export_media_pembelajaran_${new Date().toISOString().slice(0, 10)}.csv`)
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 }

 const handleImport = async (parsedData) => {
 setSuccessMsg(`Berhasil mengimpor ${parsedData.length} data media pembelajaran.`)
 fetchDaftarMedia()
 }

 const pageActions = (
 <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
 <SquircleActionButton variant="import" label="Import Data" onClick={() => setImportOpen(true)} />
 <SquircleActionButton variant="export" label="Export Data" onClick={handleExportCSV} />
 <SquircleActionButton variant="print" icon={Printer} label="Cetak Data" onClick={() => setIsPrintModalOpen(true)} />
 <SquircleActionButton variant="primary" label="Tambah Media" onClick={() => handleOpenCreateModal()} />
 </div>
 )

 const [formData, setFormData] = useState({
 materi_id: '',
 nama_file: '',
 tipe_file: 'pdf',
 url_eksternal: '',
 ukuran_bytes: '',
 durasi_detik: '',
 deskripsi: '',
 urutan: 1,
 })

 const loadInitialOptionsAndStats = async () => {
 try {
 const [optRes, statsRes] = await Promise.all([
 lmsMediaService.getOptions(),
 lmsMediaService.getStats(),
 ])
 if (optRes?.data?.materi_options) {
 setOptionsMateri(optRes.data.materi_options)
 }
 if (statsRes?.data) {
 setStats(statsRes.data)
 }
 } catch (err) {
 console.error('Failed to load initial options and stats:', err)
 }
 }

 const computedStats = useMemo(() => {
 return {
 total_media: dataMedia.length,
 total_pdf: dataMedia.filter((m) => m.tipe_file === 'pdf').length,
 total_video: dataMedia.filter((m) => m.tipe_file === 'video').length,
 total_audio: dataMedia.filter((m) => m.tipe_file === 'audio').length,
 total_ppt: dataMedia.filter((m) => m.tipe_file === 'ppt').length,
 total_word: dataMedia.filter((m) => m.tipe_file === 'word' || m.tipe_file === 'doc').length,
 total_link: dataMedia.filter((m) => m.tipe_file === 'link' || !!m.url_eksternal).length,
 }
 }, [dataMedia])

 const handleOpenKpiModal = (type) => {
 let title = ''
 let items = []

 if (type === 'total') {
 title = 'Total Media Pembelajaran'
 items = dataMedia
 } else if (type === 'pdf') {
 title = 'Daftar Media Dokumen PDF'
 items = dataMedia.filter((m) => m.tipe_file === 'pdf')
 } else if (type === 'video') {
 title = 'Daftar Video Pembelajaran'
 items = dataMedia.filter((m) => m.tipe_file === 'video')
 } else if (type === 'audio') {
 title = 'Daftar Audio / Podcast'
 items = dataMedia.filter((m) => m.tipe_file === 'audio')
 } else if (type === 'ppt') {
 title = 'Daftar Slide Presentasi PPT'
 items = dataMedia.filter((m) => m.tipe_file === 'ppt')
 } else if (type === 'word') {
 title = 'Daftar Dokumen Office / Word'
 items = dataMedia.filter((m) => m.tipe_file === 'word' || m.tipe_file === 'doc')
 } else if (type === 'link') {
 title = 'Daftar Tautan URL / Link'
 items = dataMedia.filter((m) => m.tipe_file === 'link' || !!m.url_eksternal)
 }

 setKpiModalCategory({ title, items })
 setKpiModalOpen(true)
 }

 const fetchDaftarMedia = async () => {
 setLoading(true)
 setErrorMsg('')
 try {
 const response = await lmsMediaService.getDaftar({
 page,
 search: debouncedSearch,
 materi_id: selectedMateri,
 tipe_file: selectedTipe,
 per_page: 15,
 })
 if (response?.data) {
 setDataMedia(response.data)
 if (response.meta) {
 setPagination({
 current_page: response.meta.current_page || 1,
 last_page: response.meta.last_page || 1,
 total: response.meta.total || 0,
 per_page: response.meta.per_page || 15,
 })
 }
 if (response.statistik) {
 setStats(response.statistik)
 }
 }
 } catch (err) {
 setErrorMsg('Gagal memuat daftar Media Pembelajaran. Silakan coba lagi.')
 console.error(err)
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 loadInitialOptionsAndStats()
 }, [])

 useEffect(() => {
 fetchDaftarMedia()
 }, [page, debouncedSearch, selectedMateri, selectedTipe])

 const handleOpenCreateModal = () => {
 setEditingItem(null)
 setSelectedFile(null)
 setFormData({
 materi_id: optionsMateri[0]?.id || '',
 nama_file: '',
 tipe_file: 'pdf',
 url_eksternal: '',
 ukuran_bytes: '',
 durasi_detik: '',
 deskripsi: '',
 urutan: 1,
 })
 setModalOpen(true)
 }

 const handleOpenEditModal = (item) => {
 setEditingItem(item)
 setSelectedFile(null)
 setFormData({
 materi_id: item.materi_id || '',
 nama_file: item.nama_file || '',
 tipe_file: item.tipe_file || 'pdf',
 url_eksternal: item.url_eksternal || '',
 ukuran_bytes: item.ukuran_bytes || '',
 durasi_detik: item.durasi_detik || '',
 deskripsi: item.deskripsi || '',
 urutan: item.urutan || 1,
 })
 setModalOpen(true)
 }

 const handleOpenPreview = (item) => {
 setPreviewItem(item)
 setPreviewModalOpen(true)
 }

 const handleSubmitForm = async (e) => {
 e.preventDefault()
 if (!formData.materi_id) {
 setErrorMsg('Silakan pilih Materi Pembelajaran terlebih dahulu.')
 return
 }
 if (!formData.nama_file.trim()) {
 setErrorMsg('Nama file/media tidak boleh kosong.')
 return
 }

 setFormSubmitting(true)
 setErrorMsg('')
 try {
 const payload = new FormData()
 payload.append('materi_id', formData.materi_id)
 payload.append('nama_file', formData.nama_file)
 payload.append('tipe_file', formData.tipe_file)
 if (formData.url_eksternal) payload.append('url_eksternal', formData.url_eksternal)
 if (formData.durasi_detik) payload.append('durasi_detik', formData.durasi_detik)
 if (formData.deskripsi) payload.append('deskripsi', formData.deskripsi)
 if (formData.urutan) payload.append('urutan', formData.urutan)
 if (selectedFile) payload.append('file', selectedFile)

 if (editingItem) {
 await lmsMediaService.update(editingItem.id, payload)
 setSuccessMsg('Media Pembelajaran berhasil diperbarui.')
 } else {
 await lmsMediaService.create(payload)
 setSuccessMsg('Media Pembelajaran berhasil ditambahkan.')
 }

 setModalOpen(false)
 fetchDaftarMedia()
 setTimeout(() => setSuccessMsg(''), 4000)
 } catch (err) {
 const respData = err.response?.data
 if (respData?.errors) {
 const firstErr = Object.values(respData.errors)[0]?.[0]
 setErrorMsg(firstErr || 'Terjadi kesalahan pada validasi data.')
 } else {
 setErrorMsg(respData?.message || 'Gagal menyimpan Media Pembelajaran.')
 }
 } finally {
 setFormSubmitting(false)
 }
 }

 const handleDeleteItem = async (item) => {
 const confirmResult = await Swal.fire({
 title: 'Hapus Media Pembelajaran?',
 text: `Apakah Anda yakin ingin menghapus media "${item.nama_file}"? Berkas yang dihapus tidak dapat dipulihkan.`,
 icon: 'warning',
 showCancelButton: true,
 confirmButtonText: 'Ya, Hapus Media',
 cancelButtonText: 'Batal',
 confirmButtonColor: '#e11d48',
 })
 if (!confirmResult.isConfirmed) {
 return
 }
 try {
 await lmsMediaService.delete(item.id)
 setSuccessMsg('Media Pembelajaran berhasil dihapus.')
 fetchDaftarMedia()
 setTimeout(() => setSuccessMsg(''), 4000)
 } catch (err) {
 setErrorMsg('Gagal menghapus Media Pembelajaran.')
 }
 }

 const getTipeBadge = (tipe) => {
 switch (tipe?.toLowerCase()) {
 case 'pdf':
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border border-red-200/60">
 <FileText className="w-3.5 h-3.5" /> PDF
 </span>
 )
 case 'video':
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-emerald-200/80 dark:border-emerald-800/60">
 <Video className="w-3.5 h-3.5" /> Video
 </span>
 )
 case 'audio':
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-emerald-200/80 dark:border-emerald-800/60">
 <Music className="w-3.5 h-3.5" /> Audio
 </span>
 )
 case 'ppt':
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60">
 <Presentation className="w-3.5 h-3.5" /> PPT Slide
 </span>
 )
 case 'word':
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 <FileCode className="w-3.5 h-3.5" /> Word Doc
 </span>
 )
 case 'image':
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-pink-50 text-pink-700 dark:bg-pink-950/40 dark:text-pink-300 border border-emerald-200/80 dark:border-emerald-800/60">
 <ImageIcon className="w-3.5 h-3.5" /> Gambar
 </span>
 )
 case 'link':
 default:
 return (
 <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-emerald-200/80 dark:border-emerald-800/60">
 <LinkIcon className="w-3.5 h-3.5" /> Link URL
 </span>
 )
 }
 }


  // Canonical Columns for Media Pembelajaran
  const mediaColumns = useMemo(() => [
    {
      key: 'no',
      label: 'No',
      width: '6%',
      align: 'center',
      render: (_, idx) => (
        <span className="font-medium text-slate-400">
          {(pagination.current_page - 1) * pagination.per_page + idx + 1}
        </span>
      ),
    },
    {
      key: 'urutan',
      label: 'Urutan',
      width: '8%',
      align: 'center',
      render: (item) => (
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold text-xs">
          #{item?.urutan || 1}
        </span>
      ),
    },
    {
      key: 'nama_media',
      label: 'Nama Media / Lampiran',
      render: (item) => (
        <div>
          <div className="font-extrabold text-slate-900 dark:text-white line-clamp-1">{item?.judul || item?.nama_media}</div>
          {item?.deskripsi && (
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{item.deskripsi}</div>
          )}
          {item?.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 mt-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="size-3" />
              <span className="max-w-xs truncate">{item.url}</span>
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'tipe_media',
      label: 'Tipe Media',
      align: 'center',
      render: (item) => getTipeBadge(item?.tipe_media),
    },
    {
      key: 'materi',
      label: 'Materi Pembelajaran',
      render: (item) => (
        <div>
          <div className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{item?.materi?.judul_materi || '-'}</div>
          {item?.materi?.modul_ajar && (
            <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{item.materi.modul_ajar.judul_modul}</div>
          )}
        </div>
      ),
    },
    {
      key: 'ukuran_durasi',
      label: 'Ukuran / Durasi',
      align: 'center',
      render: (item) => (
        <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
          {item?.ukuran_formatted && <span className="block">{item.ukuran_formatted}</span>}
          {item?.durasi_formatted && (
            <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
              <Clock className="w-3 h-3" /> {item.durasi_formatted}
            </span>
          )}
          {!item?.ukuran_formatted && !item?.durasi_formatted && '-'}
        </div>
      ),
    },
  ], [pagination.current_page, pagination.per_page])

 return (
 <PageContainer maxW="7xl">
 {!(embedded || hideBreadcrumb) && (
 <AppBreadcrumb items={[{ label: 'LMS & Akademik', href: '/dashboard' }, { label: 'Media Pembelajaran' }]} />
 )}
 <div className="lms-media-page space-y-6">
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title="Media Pembelajaran"
 onPrint={() => {
 const rowsToPrint = Array.isArray(dataMedia) ? dataMedia : []
 printCleanTable({
 title: 'Laporan Data Media Pembelajaran',
 subtitle: 'Daftar Media Pembelajaran Sekolah Islam Terpadu',
 headers: ['NO', 'URUTAN', 'NAMA MEDIA', 'TIPE', 'MATERI PEMBELAJARAN', 'TAUTAN / BERKAS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 `#${row.urutan || 1}`,
 row.nama_file || '-',
 row.tipe_file || '-',
 row.materi?.judul || '-',
 row.url_eksternal || row.file_url || '-',
 ]),
 })
 }}
 onDownload={() => {
 const rowsToPrint = Array.isArray(dataMedia) ? dataMedia : []
 downloadPdfTable({
 title: 'Laporan Data Media Pembelajaran',
 subtitle: 'Daftar Media Pembelajaran Sekolah Islam Terpadu',
 headers: ['NO', 'URUTAN', 'NAMA MEDIA', 'TIPE', 'MATERI PEMBELAJARAN', 'TAUTAN / BERKAS'],
 rows: rowsToPrint.map((row, i) => [
 i + 1,
 `#${row.urutan || 1}`,
 row.nama_file || '-',
 row.tipe_file || '-',
 row.materi?.judul || '-',
 row.url_eksternal || row.file_url || '-',
 ]),
 filename: 'laporan_media_pembelajaran.pdf',
 })
 }}
 />

 <CsvImportModal
 open={importOpen}
 onClose={() => setImportOpen(false)}
 title="Media Pembelajaran"
 onImport={handleImport}
 columns={[
 { key: 'materi_id' },
 { key: 'nama_file', required: true, example: 'Video Tajwid Dasar' },
 { key: 'tipe_file', example: 'video' },
 { key: 'url_eksternal', example: 'https://youtube.com/...' },
 { key: 'deskripsi', example: 'Panduan tayangan...' },
 { key: 'urutan', example: '1' },
 ]}
 />
 {/* Hero Banner */}
      {!hidePageHeader && (
        <div className="mb-6">
          <HeroUiHeader
            title="Media Pembelajaran (Multi-Format)"
            subtitle="Kelola seluruh berkas dan sumber media pembelajaran terpadu (PDF, Video, Audio, Presentasi PPT, Dokumen Word, Gambar, & Link Eksternal)."
            badge="Modul LMS Terpadu"
            icon={Video}
            actions={
              <SquircleActionButton
                variant="primary"
                icon={Plus}
                label="Tambah Media Baru"
                onClick={handleOpenCreateModal}
              />
            }
          />
        </div>
      )}

      {/* Alert Messages */}
 {successMsg && (
 <div className="flex items-center justify-between p-4 rounded-[14px] bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-800 dark:bg-emerald-950/50 dark:border-emerald-800/60 dark:text-emerald-200 shadow-sm animate-fadeIn">
 <div className="flex items-center gap-3">
 <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 <p className="text-sm font-medium">{successMsg}</p>
 </div>
 <button onClick={() => setSuccessMsg('')} className="p-1 hover:bg-emerald-100 dark:hover:bg-emerald-900 rounded-lg">
 <X className="w-4 h-4" />
 </button>
 </div>
 )}

 {errorMsg && (
 <div className="flex items-center justify-between p-4 rounded-[14px] bg-red-50 border border-red-200 text-red-800 dark:bg-red-950/50 dark:border-red-800 dark:text-red-200 shadow-sm animate-fadeIn">
 <div className="flex items-center gap-3">
 <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
 <p className="text-sm font-medium">{errorMsg}</p>
 </div>
 <button onClick={() => setErrorMsg('')} className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded-lg">
 <X className="w-4 h-4" />
 </button>
 </div>
 )}

 {/* KPI Stats Cards */}
 <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
 <KpiTintedCard
 icon={Layers}
 label="Total"
 value={computedStats.total_media}
 subtext="Media Pembelajaran"
 tone="emerald"
 onClick={() => handleOpenKpiModal('total')}
 />
 <KpiTintedCard
 icon={FileText}
 label="PDF"
 value={computedStats.total_pdf}
 subtext="Dokumen PDF"
 tone="red"
 onClick={() => handleOpenKpiModal('pdf')}
 />
 <KpiTintedCard
 icon={Video}
 label="Video"
 value={computedStats.total_video}
 subtext="Video Pembelajaran"
 tone="blue"
 onClick={() => handleOpenKpiModal('video')}
 />
 <KpiTintedCard
 icon={Music}
 label="Audio"
 value={computedStats.total_audio}
 subtext="Podcast / Audio"
 tone="purple"
 onClick={() => handleOpenKpiModal('audio')}
 />
 <KpiTintedCard
 icon={Presentation}
 label="PPT"
 value={computedStats.total_ppt}
 subtext="Slide Presentasi"
 tone="amber"
 onClick={() => handleOpenKpiModal('ppt')}
 />
 <KpiTintedCard
 icon={FileCode}
 label="Word"
 value={computedStats.total_word}
 subtext="Dokumen Office"
 tone="emerald"
 onClick={() => handleOpenKpiModal('word')}
 />
 <KpiTintedCard
 icon={LinkIcon}
 label="Link"
 value={computedStats.total_link}
 subtext="Tautan Eksternal"
 tone="teal"
 onClick={() => handleOpenKpiModal('link')}
 />
 </motion.div>

 {/* Tab Navigation Card (below KPI grid) */}
 {tabNav && (
 <motion.div variants={itemVariants}>
 {typeof tabNav === 'function' ? tabNav() : tabNav}
 </motion.div>
 )}

 {/* DATA TABLE CONTAINER (Integrated 3-Baris Emerald Datatable) */}
 <motion.div variants={itemVariants}>
        <AppDataTable
          id="tabel-media-pembelajaran"
          title="Data Media Pembelajaran"
          subtitle="Daftar berkas dan sumber media pembelajaran terpadu."
          icon={Video}
          countLabel={`${pagination.total} Data`}
          actions={pageActions}
          search={search}
          onSearchChange={(e) => {
            setSearch(e.target.value)
            setPage(1)
          }}
          searchPlaceholder="Cari nama media, deskripsi, atau materi..."
          filters={
            <div className="flex flex-wrap items-center gap-2 w-full">
              <HeroUiFilterSelect
                value={selectedMateri}
                onChange={(val) => {
                  setSelectedMateri(val)
                  setPage(1)
                }}
                options={filterMateriOptions}
                placeholder="Semua Materi Pembelajaran"
                icon={BookOpen}
                searchable={true}
                popoverWidth="min-w-[260px]"
              />

              <HeroUiFilterSelect
                value={selectedTipe}
                onChange={(val) => {
                  setSelectedTipe(val)
                  setPage(1)
                }}
                options={filterTipeOptions}
                placeholder="Semua Tipe Media"
                icon={Layers}
                popoverWidth="min-w-[180px]"
              />

              {(search || selectedMateri || selectedTipe) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('')
                    setSelectedMateri('')
                    setSelectedTipe('')
                    setPage(1)
                  }}
                  className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-900 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors ml-auto cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Filter</span>
                </button>
              )}
            </div>
          }
          columns={mediaColumns}
          data={dataMedia}
          isLoading={loading}
          page={page}
          totalPages={pagination.last_page}
          onPageChange={setPage}
          onRowClick={(item) => handleOpenPreview(item)}
          onView={(item) => handleOpenPreview(item)}
          onEdit={(item) => handleOpenEditModal(item)}
          onDelete={(item) => handleDeleteItem(item)}
          renderMobileCard={(item) => (
            <MobileDataCard
              key={item?.id}
              title={item?.judul || item?.nama_media || 'Media Pembelajaran'}
              subtitle={item?.materi?.judul_materi || 'Materi Pembelajaran'}
              badge={getTipeBadge(item?.tipe_media)}
              fields={[
                { label: 'Urutan', value: `#${item?.urutan || 1}`, icon: Layers },
                { label: 'Ukuran', value: item?.ukuran_formatted || '-', icon: FileText },
                { label: 'Durasi', value: item?.durasi_formatted || '-', icon: Clock },
              ]}
              onView={() => handleOpenPreview(item)}
              onEdit={() => handleOpenEditModal(item)}
              onDelete={() => handleDeleteItem(item)}
            />
          )}
        />
 </motion.div>

 {/* KPI DETAIL MODAL */}
 <AppModal
 isOpen={kpiModalOpen}
 onClose={() => setKpiModalOpen(false)}
 title={kpiModalCategory.title}
 description={`Menampilkan ${kpiModalCategory.items.length} file media terdaftar`}
 icon={Layers}
 maxWidth="max-w-4xl"
 zIndex={50}
 footer={
 <button
 type="button"
 onClick={() => setKpiModalOpen(false)}
 className="px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-slate-200 text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors"
 >
 Tutup
 </button>
 }
 >
 {kpiModalCategory.items.length === 0 ? (
 <div className="py-12 text-center text-slate-400">
 <Layers className="w-12 h-9 mx-auto mb-3 opacity-30" />
 <p className="font-semibold text-sm">Tidak ada data media dalam kategori ini.</p>
 </div>
 ) : (
 <div className="overflow-x-auto rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 <TableRoot className="w-full text-left border-collapse">
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <TableRow>
 
 <TableHead className="py-3 px-4">Nama File / Judul</TableHead>
 <TableHead className="py-3 px-4">Tipe File</TableHead>
 <TableHead className="py-3 px-4">Materi Pembelajaran</TableHead>
 <TableHead className="py-3 px-4 text-right"></TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-sm">
 {kpiModalCategory.items.map((item, idx) => (
 <TableRow key={item.id || idx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 
 <TableCell className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-100">{item.nama_file}</TableCell>
 <TableCell className="py-3 px-4">{getTipeBadge(item.tipe_file)}</TableCell>
 <TableCell className="py-3 px-4 text-xs text-slate-600 dark:text-slate-300">
 {item.materi?.judul || 'Tanpa Judul Materi'}
 </TableCell>
 <TableCell className="py-3 px-4 text-right">
 <button
 onClick={() => {
 setKpiModalOpen(false)
 handleOpenPreviewModal(item)
 }}
 className="px-3 py-1.5 rounded-lg bg-emerald-50 text-[#059669] dark:bg-emerald-950/40 dark:text-emerald-300 font-semibold text-xs hover:bg-emerald-100 transition-colors"
 >
 Detail
 </button>
 </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </TableRoot>
 </div>
 )}
 </AppModal>

 {/* Modal Form Create / Edit */}
 <AppModal
 isOpen={modalOpen}
 onClose={() => setModalOpen(false)}
 title={editingItem ? 'Edit Media Pembelajaran' : 'Tambah Media Pembelajaran Baru'}
 description="Lengkapi detail media atau unggah file pendukung"
 icon={FileUp}
 maxWidth="max-w-2xl"
 zIndex={50}
 footer={
 <>
 <button
 type="button"
 onClick={() => setModalOpen(false)}
 className="px-5 py-2.5 rounded-[12px] border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors"
 >
 Batal
 </button>
 <button
 type="submit"
 form="lms-media-form"
 disabled={formSubmitting}
 className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#059669] hover:bg-[#1E8E5A] text-white font-bold text-sm rounded-[12px] shadow-md transition-all disabled:opacity-50"
 >
 {formSubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
 <span>{editingItem ? 'Simpan Perubahan' : 'Tambah Media'}</span>
 </button>
 </>
 }
 >
 <form id="lms-media-form" onSubmit={handleSubmitForm} className="space-y-5">
 <div>
 <HeroUiModalSelect
 label="Materi Pembelajaran"
 required
 icon={BookOpen}
 searchable={true}
 placeholder="-- Pilih Materi Pembelajaran --"
 value={formData.materi_id}
 onChange={(val) => setFormData({ ...formData, materi_id: val })}
 options={modalMateriOptions}
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 Nama File / Media <span className="text-red-500">*</span>
 </label>
 <input
 type="text"
 required
 placeholder="Contoh: Modul Panduan PDF Bab 1"
 value={formData.nama_file}
 onChange={(e) => setFormData({ ...formData, nama_file: e.target.value })}
 className="w-full px-4 py-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-900/60 border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-700/80 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
 />
 </div>

 <div>
 <HeroUiModalSelect
 label="Tipe Media"
 required
 icon={Layers}
 placeholder="-- Pilih Tipe Media --"
 value={formData.tipe_file}
 onChange={(val) => setFormData({ ...formData, tipe_file: val })}
 options={modalTipeOptions}
 />
 </div>
 </div>

 {/* Upload File Input */}
 <div className="p-4 rounded-[14px] bg-slate-50 dark:bg-slate-900/40 border border-dashed border-emerald-300 dark:border-emerald-700/80">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 Unggah Berkas File (Opsional)
 </label>
 <input
 type="file"
 onChange={(e) => setSelectedFile(e.target.files[0] || null)}
 className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-[#059669] file:text-white hover:file:bg-[#1E8E5A] cursor-pointer"
 />
 <span className="text-xs text-slate-400 mt-1 block">
 Mendukung PDF, Video (MP4/WebM), Audio (MP3), PPTX, DOCX, PNG/JPG (Maks 50MB)
 </span>
 </div>

 {/* External Link */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 Tautan Eksternal / URL (YouTube, Drive, Web, dll)
 </label>
 <div className="relative">
 <LinkIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
 <input
 type="url"
 placeholder="https://..."
 value={formData.url_eksternal}
 onChange={(e) => setFormData({ ...formData, url_eksternal: e.target.value })}
 className="w-full pl-10 pr-4 py-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-900/60 border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-700/80 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
 />
 </div>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 Durasi (Detik) - Untuk Audio/Video
 </label>
 <input
 type="number"
 min="0"
 placeholder="Contoh: 300 (5 menit)"
 value={formData.durasi_detik}
 onChange={(e) => setFormData({ ...formData, durasi_detik: e.target.value })}
 className="w-full px-4 py-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-900/60 border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-700/80 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 Urutan Tampil
 </label>
 <input
 type="number"
 min="1"
 value={formData.urutan}
 onChange={(e) => setFormData({ ...formData, urutan: e.target.value })}
 className="w-full px-4 py-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-900/60 border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-700/80 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
 Catatan / Deskripsi Penjelas
 </label>
 <textarea
 rows={3}
 placeholder="Keterangan isi file media atau instruksi pengajuan..."
 value={formData.deskripsi}
 onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
 className="w-full px-4 py-2.5 rounded-[12px] bg-slate-50 dark:bg-slate-900/60 border-2 border-[#b6f6d9] dark:border-emerald-800/60 dark:border-emerald-700/80 text-sm focus:outline-none focus:ring-2 focus:ring-[#059669]"
 />
 </div>
 </form>
 </AppModal>

 {/* Modal Preview Media */}
 <AppModal
 isOpen={Boolean(previewModalOpen && previewItem)}
 onClose={() => setPreviewModalOpen(false)}
 title={previewItem?.nama_file || 'Pratinjau Media'}
 icon={Eye}
 headerActions={previewItem ? getTipeBadge(previewItem.tipe_file) : null}
 maxWidth="max-w-3xl"
 zIndex={50}
 footer={
 previewItem ? (
 <div className="flex items-center justify-between w-full">
 {(previewItem.file_url || previewItem.url_eksternal) ? (
 <a
 href={previewItem.file_url || previewItem.url_eksternal}
 target="_blank"
 rel="noreferrer"
 className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#059669] text-white text-xs font-bold hover:bg-[#1E8E5A]"
 >
 <Download className="w-4 h-4" /> Buka / Unduh Berkas
 </a>
 ) : <div />}
 <button
 type="button"
 onClick={() => setPreviewModalOpen(false)}
 className="px-4 py-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 text-xs font-semibold text-slate-600 dark:text-slate-300"
 >
 Tutup
 </button>
 </div>
 ) : null
 }
 >
 {previewItem && (
 <>
 {/* Media Player / Embed Preview based on type */}
 {previewItem.tipe_file === 'image' && (previewItem.file_url || previewItem.url_eksternal) && (
 <div className="flex justify-center bg-slate-900/80 rounded-xl p-4">
 <img
 src={previewItem.file_url || previewItem.url_eksternal}
 alt={previewItem.nama_file}
 className="max-h-[400px] object-contain rounded-lg shadow-lg"
 />
 </div>
 )}

 {previewItem.tipe_file === 'video' && (
 <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center">
 {previewItem.url_eksternal?.includes('youtube.com') || previewItem.url_eksternal?.includes('youtu.be') ? (
 <iframe
 src={previewItem.url_eksternal.replace('watch?v=', 'embed/')}
 title={previewItem.nama_file}
 className="w-full h-full border-0"
 allowFullScreen
 />
 ) : previewItem.file_url ? (
 <video controls className="w-full h-full">
 <source src={previewItem.file_url} />
 Browser Anda tidak mendukung tag video.
 </video>
 ) : (
 <div className="text-center p-6 text-slate-400">
 <PlayCircle className="w-12 h-9 mx-auto text-blue-500 mb-2" />
 <p className="text-sm font-medium">Video Eksternal</p>
 <a
 href={previewItem.url_eksternal}
 target="_blank"
 rel="noreferrer"
 className="text-xs text-blue-400 underline mt-2 block"
 >
 Buka Video di Tab Baru
 </a>
 </div>
 )}
 </div>
 )}

 {previewItem.tipe_file === 'audio' && (
 <div className="p-6 rounded-xl bg-slate-900 text-white flex flex-col items-center gap-4">
 <Music className="w-12 h-9 text-purple-400" />
 <p className="text-sm font-semibold">{previewItem.nama_file}</p>
 <audio controls className="w-full max-w-md">
 <source src={previewItem.file_url || previewItem.url_eksternal} />
 Browser Anda tidak mendukung elemen audio.
 </audio>
 </div>
 )}

 {previewItem.tipe_file === 'pdf' && (previewItem.file_url || previewItem.url_eksternal) && (
 <div className="w-full h-[400px] rounded-xl overflow-hidden border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-emerald-50">
 <iframe
 src={previewItem.file_url || previewItem.url_eksternal}
 title={previewItem.nama_file}
 className="w-full h-full border-0"
 />
 </div>
 )}

 {/* General Info Card */}
 <div className="p-4 rounded-[14px] bg-slate-50 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2 text-sm">
 <div className="flex items-center justify-between text-xs text-slate-500">
 <span>Materi Pembelajaran:</span>
 <span className="font-bold text-slate-800 dark:text-slate-200">
 {previewItem.materi?.judul || '-'}
 </span>
 </div>
 {previewItem.deskripsi && (
 <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <p className="text-xs font-semibold text-slate-400 uppercase">Deskripsi / Catatan:</p>
 <p className="text-slate-700 dark:text-slate-300 mt-1">{previewItem.deskripsi}</p>
 </div>
 )}
 </div>
 </>
 )}
 </AppModal>
 </motion.div>
 </div>
 </PageContainer>
 )
}
