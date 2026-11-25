import { HeroUiHeader } from "../../components/ui/HeroUiHeader"
import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  Calendar,
  Eye,
  FileText,
  FileSpreadsheet,
  Megaphone,
  Plus,
  Printer,
  RefreshCcw,
  RotateCcw,
  School,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  X
} from 'lucide-react'
import {
  dashboardPemantauanService
} from '../../services/dashboardPemantauanService'
import {
  educationUnitService
} from '../../services/educationUnitService'
import PageContainer from '../../components/app/PageContainer'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import AppDataTable from '../../components/app/AppDataTable'
import ActionDropdown from '../../components/app/ActionDropdown'
import AppModal from '../../components/app/AppModal'
import PageToolbarActions from '../../components/app/PageToolbarActions'
import {
  useToast,
  KpiStatCard,
  AppBadge
} from '../../components/app'
import {
  SmartScrollFab
} from '../../components/common'
import HeroUiFilterSelect from '../../components/ui/HeroUiFilterSelect'
import {
  PrintOptionModal,
  SquircleActionButton
} from '../../components/master-data'
import {
  printCleanTable,
  downloadPdfTable
} from '../../utils/printHelper'
import useDebounce from '../../hooks/useDebounce'
import api from '../../services/api'
import {
  cn
} from '../../lib/utils'
import {
  Button
} from '@/components/ui/button'

const containerVariants = {
 hidden: { opacity: 0, y: 15 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { duration: 0.35, staggerChildren: 0.08 },
 },
}

const itemVariants = {
 hidden: { opacity: 0, y: 12 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
}

function extractCategory(info) {
 const meta = info?.data_tambahan || {}
 return info?.kategori || meta.kategori || info?.jenis || meta.tipe || info?.type || 'Pengumuman'
}

function formatFullDate(value) {
 if (!value) return 'Terbaru'
 const date = new Date(value)
 return Number.isNaN(date.getTime())
 ? 'Terbaru'
 : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
}

// ── TONE WARNA KARTU KPI KANONIK (SEPERTI MASTER JENIS UNIT) ─────────────────
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

export function FoundationInformationPage() {
 const toast = useToast()
 const [information, setInformation] = useState([])
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(false)

 const [activeTab, setActiveTab] = useState('all') // 'all' | 'pengumuman' | 'berita' | 'agenda'
 const [selectedTargetUnit, setSelectedTargetUnit] = useState('all')
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [page, setPage] = useState(1)
 const [perPage, setPerPage] = useState(10)

 const [selectedInfo, setSelectedInfo] = useState(null)
 const [isManageModalOpen, setIsManageModalOpen] = useState(false)
 const [isSubmittingInfo, setIsSubmittingInfo] = useState(false)
 const [printOptionModalOpen, setPrintOptionModalOpen] = useState(false)
 const [educationUnits, setEducationUnits] = useState([])
 const [infoForm, setInfoForm] = useState({
 judul: '',
 kategori: 'Pengumuman',
 isi: '',
 penulis: 'Humas Yayasan',
 target_unit: 'all',
 status: 'Dipublikasikan',
 })

 useEffect(() => {
 educationUnitService.getDaftar({ per_page: 100 })
 .then((res) => {
 const list = res?.data || res || []
 if (Array.isArray(list)) setEducationUnits(list)
 })
 .catch(() => {})
 }, [])

 const fetchInformation = useCallback(async (silent = false) => {
 if (!silent) setLoading(true)
 setError(false)
 try {
 const params = {
 search: debouncedSearch || undefined,
 per_page: 100,
 }
 const res = await api.get('/foundation/information', { params })
 const resData = res.data
 let list = []
 if (Array.isArray(resData)) {
 list = resData
 } else if (resData?.data) {
 list = Array.isArray(resData.data) ? resData.data : resData.data.data || []
 }
 setInformation(list)
 } catch (err) {
 console.error('Failed to fetch foundation information:', err)
 setError(true)
 } finally {
 setLoading(false)
 }
 }, [debouncedSearch])

 useEffect(() => {
 fetchInformation()
 }, [fetchInformation])

 const filteredInfo = useMemo(() => {
 return information.filter((info) => {
 const title = (info.judul_pengumuman || info.judul || info.title || '').toString().toLowerCase()
 const content = (info.isi_pengumuman || info.content || '').toString().toLowerCase()
 const type = extractCategory(info).toLowerCase()
 const unit = (info.target_unit || info.unit_pendidikan_name || info.unit_name || 'all').toString().toLowerCase()

 const matchesTab =
 activeTab === 'all' ||
 (activeTab === 'pengumuman' && type.includes('pengumuman')) ||
 (activeTab === 'berita' && (type.includes('berita') || type === 'news')) ||
 (activeTab === 'agenda' && (type.includes('agenda') || type === 'event'))

 const matchesUnit =
 selectedTargetUnit === 'all' ||
 unit === 'all' ||
 unit.includes(selectedTargetUnit.toLowerCase())

 const matchesSearch =
 !debouncedSearch.trim() ||
 title.includes(debouncedSearch.toLowerCase()) ||
 content.includes(debouncedSearch.toLowerCase())

 return matchesTab && matchesUnit && matchesSearch
 })
 }, [information, activeTab, selectedTargetUnit, debouncedSearch])

 const totalItems = filteredInfo.length
 const lastPage = Math.max(1, Math.ceil(totalItems / perPage))
 const paginatedInfo = filteredInfo.slice((page - 1) * perPage, page * perPage)

 const totalCount = information.length
 const pengumumanCount = information.filter((i) => extractCategory(i).toLowerCase().includes('pengumuman')).length
 const beritaCount = information.filter((i) => {
 const c = extractCategory(i).toLowerCase()
 return c.includes('berita') || c === 'news'
 }).length
 const agendaCount = information.filter((i) => {
 const c = extractCategory(i).toLowerCase()
 return c.includes('agenda') || c === 'event'
 }).length

 const categoryFilterOptions = useMemo(() => [
 { value: 'all', label: `Semua Kategori (${totalCount})` },
 { value: 'pengumuman', label: `Pengumuman Resmi (${pengumumanCount})` },
 { value: 'berita', label: `Berita & Kabar (${beritaCount})` },
 { value: 'agenda', label: `Agenda Terpadu (${agendaCount})` },
 ], [totalCount, pengumumanCount, beritaCount, agendaCount])

 const targetUnitFilterOptions = useMemo(() => [
 { value: 'all', label: 'Semua Sasaran Unit' },
 ...educationUnits.map((u) => ({
 value: u.name || u.code,
 label: u.name,
 })),
 ], [educationUnits])

 const perPageOptions = useMemo(() => [
 { value: '5', label: '5 per Halaman' },
 { value: '10', label: '10 per Halaman' },
 { value: '15', label: '15 per Halaman' },
 { value: '25', label: '25 per Halaman' },
 { value: '50', label: '50 per Halaman' },
 ], [])

 const modalCategoryOptions = useMemo(() => [
 { value: 'Pengumuman', label: 'Pengumuman Resmi' },
 { value: 'Berita', label: 'Berita Kegiatan Sekolah' },
 { value: 'Agenda', label: 'Agenda Terpadu' },
 { value: 'PPDB', label: 'PPDB & Pendaftaran' },
 { value: 'Akademik', label: 'Pengumuman Akademik' },
 { value: 'Prestasi', label: 'Capaian Prestasi' },
 ], [])

 const targetUnitModalOptions = useMemo(() => [
 { value: 'all', label: 'Seluruh Unit (Yayasan)' },
 ...educationUnits.map((u) => ({
 value: u.name || u.code,
 label: u.name,
 })),
 ], [educationUnits])

 const statusOptions = useMemo(() => [
 { value: 'Dipublikasikan', label: 'Dipublikasikan (Terbit Langsung)' },
 { value: 'Draft', label: 'Simpan sebagai Draft' },
 ], [])

 const handleRefresh = () => {
 setPage(1)
 fetchInformation(Boolean(information.length))
 }

 const handleResetFilter = () => {
 setSearch('')
 setActiveTab('all')
 setSelectedTargetUnit('all')
 setPerPage(10)
 setPage(1)
 }

 const columns = useMemo(() => [
 {
 header: 'No',
 className: 'w-[60px] text-center font-bold text-slate-400',
 render: (_, __, index) => (page - 1) * perPage + index + 1,
 },
 {
 header: 'Informasi & Pengumuman',
 sortable: true,
 sortKey: 'judul',
 render: (item) => (
 <div className="flex flex-col max-w-md">
 <span className="font-extrabold text-slate-900 dark:text-white line-clamp-1">
 {item.judul_pengumuman || item.judul || item.title || 'Informasi Resmi'}
 </span>
 <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
 {item.isi_pengumuman || item.content || '-'}
 </span>
 </div>
 ),
 },
 {
 header: 'Kategori',
 sortable: true,
 sortKey: 'kategori',
 className: 'text-center',
      render: (item) => {
        const cat = extractCategory(item)
        const variant = cat === 'Berita' ? 'purple' : cat === 'Agenda' ? 'warning' : cat === 'PPDB' ? 'info' : 'success'
        return (
          <AppBadge variant={variant} dot>
            {cat}
          </AppBadge>
        )
      },
 },
 {
 header: 'Sasaran Unit',
 render: (item) => (
 <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
 <School className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 <span>{item.target_unit || 'Seluruh Unit'}</span>
 </span>
 ),
 },
 {
 header: 'Penulis',
 sortable: true,
 sortKey: 'penulis',
 render: (item) => (
 <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
 <User className="size-3.5 text-slate-400 shrink-0" />
 <span>{item.penulis || 'Humas Yayasan'}</span>
 </span>
 ),
 },
 {
 header: 'Tanggal',
 sortable: true,
 sortKey: 'created_at',
 className: 'text-center',
 render: (item) => (
 <span className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
 <Calendar className="size-3.5 text-slate-400 shrink-0" />
 <span>{formatFullDate(item.created_at)}</span>
 </span>
 ),
 },
 {
 header: 'Aksi',
 className: 'w-[80px] text-center',
 render: (item) => (
 <ActionDropdown
 actions={[
 {
 label: 'Lihat Detail',
 icon: Eye,
 onClick: () => setSelectedInfo(item),
 },
 ]}
 />
 ),
 },
 ], [page, perPage])

 return (
 <PageContainer>
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
 {/* Breadcrumb Navigation Kanonik */}
 <motion.div variants={itemVariants} className="mb-4 print:hidden">
 <AppBreadcrumb
 items={[
 { label: 'Dashboard Utama', href: '/dashboard' },
 { label: 'Pengaturan', href: '/dashboard/pengaturan' },
 { label: 'Informasi Sekolah' },
 ]}
 />
 </motion.div>

 {/* Header Halaman Modern Hero Card (Kanonik HeroUI Emerald) */}
        <motion.div variants={itemVariants} className="print:hidden">
          <HeroUiHeader
            title="Pusat Informasi & Pengumuman Sekolah"
            subtitle="Publikasi pengumuman resmi, berita kegiatan sekolah, dan agenda terpadu di seluruh unit pendidikan yayasan."
            badge="Pusat Siar Resmi"
            icon={Megaphone}
            actions={
              <div className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-100 px-3.5 py-1.5 text-xs font-black text-emerald-900 dark:border-emerald-800/60 dark:bg-gradient-to-r dark:from-emerald-950 dark:to-teal-950 dark:text-emerald-200 shadow-2xs">
                <Sparkles className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Terhubung Real-Time</span>
              </div>
            }
          />
        </motion.div>

        {/* 4 Kartu KPI Modern (Kanonik Master Jenis Unit) */}
 <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <ModernKpiCard
 icon={FileText}
 label="TOTAL INFORMASI"
 value={totalCount}
 subtext="Semua kategori siaran sekolah"
 tag="SEMUA INFORMASI"
 tone="emerald"
 onClick={() => { setActiveTab('all'); setPage(1) }}
 />
 <ModernKpiCard
 icon={Megaphone}
 label="PENGUMUMAN"
 value={pengumumanCount}
 subtext="Pengumuman resmi yayasan & unit"
 tag="PENGUMUMAN"
 tone="teal"
 onClick={() => { setActiveTab('pengumuman'); setPage(1) }}
 />
 <ModernKpiCard
 icon={FileSpreadsheet}
 label="BERITA TERBIT"
 value={beritaCount}
 subtext="Kabar, liputan & artikel sekolah"
 tag="BERITA"
 tone="amber"
 onClick={() => { setActiveTab('berita'); setPage(1) }}
 />
 <ModernKpiCard
 icon={Calendar}
 label="AGENDA KEGIATAN"
 value={agendaCount}
 subtext="Agenda terencana mendatang"
 tag="AGENDA"
 tone="rose"
 onClick={() => { setActiveTab('agenda'); setPage(1) }}
 />
 </motion.div>

 {/* Datatable Container Terpadu dengan AppDataTable Kanonik */}
 <motion.div variants={itemVariants}>
 <AppDataTable
            id="tabel-informasi-sekolah"
            className="scroll-mt-6 rounded-2xl border-2 border-emerald-500/25 dark:border-emerald-600/35 shadow-md shadow-sm"
            fullBleed={true}
            headerClassName="bg-emerald-500/10 dark:bg-emerald-950/40 border-b border-emerald-500/20 dark:border-emerald-800/40 px-5 py-4 min-h-[72px]"
            title="Daftar Informasi & Pengumuman"
            countLabel={`${totalItems} Info`}
            icon={<Megaphone className="size-4.5 text-white" strokeWidth={2.2} />}
            iconClassName="!bg-emerald-600 !text-white !border-emerald-600 !rounded-xl !size-8.5 shadow-xs"
 description="Kelola publikasi siaran resmi, berita kegiatan, dan kalender agenda sekolah."
 icon={Megaphone}
 iconClassName="!size-8.5 !bg-emerald-600 !text-white shadow-sm shadow-emerald-600/30 rounded-xl flex items-center justify-center"
 actions={
 <PageToolbarActions
 onPrint={() => setPrintOptionModalOpen(true)}
 printLabel="Cetak & Export"
 onAdd={() => setIsManageModalOpen(true)}
 addLabel="Input Informasi Baru"
 />
 }
 columns={columns}
 data={paginatedInfo}
 keyField="id"
 isLoading={loading}
 isError={error}
 errorTitle="Data informasi gagal dimuat"
 errorMessage="Periksa koneksi atau coba muat ulang data."
 onRetry={handleRefresh}
 serverControlled
 search={search}
 onSearchChange={(val) => {
 setSearch(val)
 setPage(1)
 }}
 searchPlaceholder="Cari judul informasi, isi pengumuman, atau penulis..."
 filters={
 <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-2.5 w-full">
 <HeroUiFilterSelect
 value={activeTab}
 onChange={(val) => {
 setActiveTab(val)
 setPage(1)
 }}
 options={categoryFilterOptions}
 placeholder="Kategori Informasi"
 icon={Megaphone}
 ariaLabel="Filter Kategori Informasi"
 size="sm"
 className="w-full sm:w-auto min-w-[170px]"
 />

 <HeroUiFilterSelect
 value={selectedTargetUnit}
 onChange={(val) => {
 setSelectedTargetUnit(val)
 setPage(1)
 }}
 options={targetUnitFilterOptions}
 placeholder="Sasaran Unit Sekolah"
 icon={School}
 searchable={true}
 ariaLabel="Filter Sasaran Unit Sekolah"
 size="sm"
 className="w-full sm:w-auto min-w-[190px]"
 />

 <HeroUiFilterSelect
 value={String(perPage)}
 onChange={(val) => {
 setPerPage(Number(val))
 setPage(1)
 }}
 options={perPageOptions}
 placeholder="Tampilkan per Halaman"
 ariaLabel="Tampilkan per Halaman"
 size="sm"
 className="w-full sm:w-auto min-w-[140px]"
 />

 {(search || activeTab !== 'all' || selectedTargetUnit !== 'all' || perPage !== 10) && (
 <SquircleActionButton
 variant="delete"
 icon={RotateCcw}
 label="Reset"
 onClick={handleResetFilter}
 showLabel
 />
 )}
 </div>
 }
 page={page}
 totalPages={lastPage}
 totalItems={totalItems}
 onPageChange={setPage}
 />
 </motion.div>
 </motion.div>

 {/* Modal Detail Informasi (HeroUI Elevated Style) */}
 <AppModal
 isOpen={Boolean(selectedInfo)}
 onClose={() => setSelectedInfo(null)}
 icon={Megaphone}
 title="Detail Siaran Informasi"
 badge={selectedInfo ? extractCategory(selectedInfo) : undefined}
 description={selectedInfo ? formatFullDate(selectedInfo.created_at) : undefined}
 maxWidth="max-w-2xl"
 zIndex={70}
 footer={
 <div className="flex justify-end w-full">
 <button
 type="button"
 onClick={() => setSelectedInfo(null)}
 className="h-9.5 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-black text-xs transition-all active:scale-95 cursor-pointer"
 >
 Tutup
 </button>
 </div>
 }
 >
 {selectedInfo && (
 <div className="space-y-4 text-xs text-slate-700 dark:text-slate-200">
 <h2 className="text-lg font-black leading-snug text-slate-900 dark:text-white">
 {selectedInfo.judul_pengumuman || selectedInfo.judul || selectedInfo.title}
 </h2>

 <div className="flex items-center gap-3 border-y border-emerald-100/80 dark:border-emerald-800/60 py-2.5 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
 <span className="flex items-center gap-1">
 <User className="h-3.5 w-3.5 text-emerald-600" />
 Penulis: <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedInfo.penulis || 'Humas Yayasan'}</strong>
 </span>
 <span>•</span>
 <span className="flex items-center gap-1">
 <School className="h-3.5 w-3.5 text-emerald-600" />
 Sasaran: <strong className="text-slate-800 dark:text-slate-200 font-bold">{selectedInfo.target_unit || 'Seluruh Unit Sekolah'}</strong>
 </span>
 <span>•</span>
 <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 Terbit Resmi
 </span>
 </div>

 <div className="whitespace-pre-wrap leading-relaxed bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/80">
 {selectedInfo.isi_pengumuman || selectedInfo.content || 'Konten pengumuman sekolah.'}
 </div>
 </div>
 )}
 </AppModal>

 {/* Modal Input & Kelola Berita / Pengumuman (HeroUI Harmonized Batch Modal) */}
 <AppModal
 isOpen={isManageModalOpen}
 onClose={() => setIsManageModalOpen(false)}
 disableBackdropClose={isSubmittingInfo}
 hideCloseButton={isSubmittingInfo}
 icon={Megaphone}
 title="Input & Kelola Berita / Pengumuman"
 description="Publikasikan pengumuman resmi atau berita sekolah ke seluruh portal unit yayasan"
 maxWidth="max-w-2xl"
 zIndex={60}
 footer={
 <div className="flex items-center justify-end gap-2.5 w-full">
 <button
 type="button"
 disabled={isSubmittingInfo}
 onClick={() => setIsManageModalOpen(false)}
 className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-black transition-all active:scale-95 cursor-pointer disabled:opacity-50"
 >
 Batal
 </button>
 <button
 type="submit"
 form="manage-info-form"
 disabled={isSubmittingInfo}
 className="h-9.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white border-2 border-emerald-600 text-xs font-black shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
 >
 {isSubmittingInfo ? (
 <RefreshCcw className="h-4 w-4 animate-spin" />
 ) : (
 <Send className="h-4 w-4" />
 )}
 <span>{isSubmittingInfo ? 'Memproses...' : 'Simpan & Publikasikan'}</span>
 </button>
 </div>
 }
 >
 <form
 id="manage-info-form"
 onSubmit={async (e) => {
 e.preventDefault()
 if (!infoForm.judul.trim() || !infoForm.isi.trim()) {
 toast.warning('Form Belum Lengkap', 'Judul dan isi informasi/berita wajib diisi.')
 return
 }
 setIsSubmittingInfo(true)
 try {
 const payload = {
 judul_pengumuman: infoForm.judul,
 isi_pengumuman: infoForm.isi,
 kategori: infoForm.kategori,
 penulis: infoForm.penulis || 'Humas Yayasan',
 target_unit: infoForm.target_unit,
 status: infoForm.status,
 }
 try {
 await dashboardPemantauanService.tambahPengumumanSekolah(payload)
 } catch {
 // Fallback local update
 }

 const newItem = {
 id: `info-${Date.now()}`,
 judul_pengumuman: infoForm.judul,
 isi_pengumuman: infoForm.isi,
 kategori: infoForm.kategori,
 penulis: infoForm.penulis || 'Humas Yayasan',
 target_unit: infoForm.target_unit,
 created_at: new Date().toISOString(),
 status: infoForm.status,
 }

 setInformation((prev) => [newItem, ...prev])
 setIsManageModalOpen(false)
 setInfoForm({
 judul: '',
 kategori: 'Pengumuman',
 isi: '',
 penulis: 'Humas Yayasan',
 target_unit: 'all',
 status: 'Dipublikasikan',
 })

 toast.success('Informasi Berhasil Disimpan', 'Pengumuman / berita baru telah berhasil dipublikasikan.')
 } catch {
 toast.error('Gagal', 'Terjadi kesalahan saat menyimpan informasi.')
 } finally {
 setIsSubmittingInfo(false)
 }
 }}
 className="space-y-4"
 >
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 Kategori Informasi *
 </label>
 <HeroUiFilterSelect
 value={infoForm.kategori}
 onChange={(val) => setInfoForm((prev) => ({ ...prev, kategori: val }))}
 options={modalCategoryOptions}
 placeholder="Pilih Kategori"
 icon={Megaphone}
 className="w-full"
 ariaLabel="Pilih Kategori Informasi"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 Sasaran Unit Sekolah *
 </label>
 <HeroUiFilterSelect
 value={infoForm.target_unit}
 onChange={(val) => setInfoForm((prev) => ({ ...prev, target_unit: val }))}
 options={targetUnitModalOptions}
 placeholder="Pilih Sasaran Unit"
 icon={School}
 searchable={true}
 className="w-full"
 ariaLabel="Pilih Sasaran Unit Sekolah"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 Judul Informasi / Berita *
 </label>
 <input
 type="text"
 placeholder="Contoh: Penerimaan Peserta Didik Baru (PPDB) T.A. 2026/2027"
 value={infoForm.judul}
 onChange={(e) => setInfoForm((prev) => ({ ...prev, judul: e.target.value }))}
 className="w-full h-9 px-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 dark:border-emerald-800/60 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-200/80"
 required
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 Isi Informasi / Berita *
 </label>
 <textarea
 rows={4}
 placeholder="Tuliskan isi pengumuman atau berita secara lengkap..."
 value={infoForm.isi}
 onChange={(e) => setInfoForm((prev) => ({ ...prev, isi: e.target.value }))}
 className="w-full p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 dark:border-emerald-800/60 dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-200/80 leading-relaxed"
 required
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 Penulis / Penerbit
 </label>
 <input
 type="text"
 placeholder="Contoh: Humas Yayasan"
 value={infoForm.penulis}
 onChange={(e) => setInfoForm((prev) => ({ ...prev, penulis: e.target.value }))}
 className="w-full h-9 px-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 dark:border-emerald-800/60 dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-200/80"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
 Status Publikasi
 </label>
 <HeroUiFilterSelect
 value={infoForm.status}
 onChange={(val) => setInfoForm((prev) => ({ ...prev, status: val }))}
 options={statusOptions}
 placeholder="Pilih Status"
 className="w-full"
 ariaLabel="Pilih Status Publikasi"
 />
 </div>
 </div>
 </form>
 </AppModal>

 {/* Print / Export Modal */}
 <PrintOptionModal
 isOpen={printOptionModalOpen}
 onClose={() => setPrintOptionModalOpen(false)}
 title="Cetak & Export Informasi Sekolah"
 description="Pilih format cetak atau export dokumen resmi siaran informasi sekolah."
 onPrintPreview={() => {
 printCleanTable({
 title: 'Laporan Siaran Informasi & Pengumuman Sekolah',
 subtitle: 'Seluruh Unit Pendidikan Yayasan',
 headers: ['No', 'Judul Informasi', 'Kategori', 'Sasaran Unit', 'Penulis', 'Tanggal'],
 rows: filteredInfo.map((item, idx) => [
 idx + 1,
 item.judul_pengumuman || item.judul || item.title || '-',
 extractCategory(item),
 item.target_unit || 'Seluruh Unit',
 item.penulis || 'Humas Yayasan',
 formatFullDate(item.created_at),
 ]),
 })
 setPrintOptionModalOpen(false)
 }}
 onDownloadPdf={() => {
 downloadPdfTable({
 filename: `informasi-sekolah-${new Date().toISOString().slice(0, 10)}.pdf`,
 title: 'Laporan Siaran Informasi & Pengumuman Sekolah',
 subtitle: 'Seluruh Unit Pendidikan Yayasan',
 headers: ['No', 'Judul Informasi', 'Kategori', 'Sasaran Unit', 'Penulis', 'Tanggal'],
 rows: filteredInfo.map((item, idx) => [
 idx + 1,
 item.judul_pengumuman || item.judul || item.title || '-',
 extractCategory(item),
 item.target_unit || 'Seluruh Unit',
 item.penulis || 'Humas Yayasan',
 formatFullDate(item.created_at),
 ]),
 })
 setPrintOptionModalOpen(false)
 }}
 />

 {/* Smart Floating Scroll Navigator */}
 <SmartScrollFab targetId="tabel-informasi-sekolah" downTooltip="Langsung ke Tabel Informasi" />
 </PageContainer>
 )
}
export default FoundationInformationPage
