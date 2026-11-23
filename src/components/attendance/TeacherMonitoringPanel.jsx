import { useState, useMemo } from 'react'
import {
 Activity,
 BookOpen,
 Calendar,
 CalendarDays,
 Clock3,
 Filter,
 GraduationCap,
 Printer,
 Radio,
 RefreshCw,
 Users,
 Layers,
} from 'lucide-react'
import Swal from '@/components/ui/compat/swal-heroui'
import { AppDataTable } from '../app'
import { Card, CardHeader, CardTitle, CardDescription, CardAction, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertIndicator, AlertContent, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogBody, DialogFooter, DialogClose } from '@/components/ui/dialog'
import { Backdrop, OverlayWrapper } from '@/components/ui/overlay'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DatePicker } from '@/components/ui/date-picker'
import {
 Select,
 SelectTrigger,
 SelectValue,
 SelectContent,
 SelectItem,
} from '@/components/ui/select'
import { SquircleActionButton, PrintOptionModal } from '../master-data'
import CsvImportModal from '../master-data/CsvImportModal'
import { printCleanTable, downloadPdfTable } from '../../utils/printHelper'

const MONTHS = [
 { value: '1', label: 'Januari' },
 { value: '2', label: 'Februari' },
 { value: '3', label: 'Maret' },
 { value: '4', label: 'April' },
 { value: '5', label: 'Mei' },
 { value: '6', label: 'Juni' },
 { value: '7', label: 'Juli' },
 { value: '8', label: 'Agustus' },
 { value: '9', label: 'September' },
 { value: '10', label: 'Oktober' },
 { value: '11', label: 'November' },
 { value: '12', label: 'Desember' },
]

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
    iconBox: '!bg-sky-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-sky-600 !text-white shadow-xs rounded-full',
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
    iconBox: '!bg-sky-600 !text-white shadow-xs rounded-full',
    iconGradient: '!bg-sky-600 !text-white shadow-xs rounded-full',
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

const label = (value) =>
({
 online: 'Online',
 offline: 'Offline',
 hadir: 'Hadir',
 tepat_waktu: 'Hadir',
 terlambat: 'Terlambat',
 belum_presensi: 'Belum Presensi',
 izin: 'Izin',
 sakit: 'Sakit',
 absen: 'Absen',
 ready: 'Siap Mengajar',
 active: 'Sedang Mengajar',
 completed: 'Selesai Mengajar',
}[value] || value || '-')

// Custom Color Badge Renderers:
// Status Online: Hijau jika Online, Merah jika Offline
const renderOnlineBadge = (status) => {
 const isOnline = status === 'online' || status === 'hadir'
 if (isOnline) {
 return (
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60 shadow-2xs">
 <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
 Online
 </span>
 )
 }
 return (
 <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-extrabold text-rose-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950 dark:text-rose-300 dark:border-emerald-800/60 shadow-2xs">
 <span className="h-2 w-2 rounded-full bg-rose-500" />
 Offline
 </span>
 )
}

// Status Presensi: Hijau jika Hadir, Kuning jika Belum Presensi / Terlambat, Merah jika Absen, Sky jika Izin/Sakit
const renderAttendanceBadge = (status) => {
 const st = String(status || '').toLowerCase()

 if (['hadir', 'tepat_waktu', 'online'].includes(st)) {
 return (
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-extrabold text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60 shadow-2xs">
 <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
 Hadir
 </span>
 )
 }

 if (['belum_presensi', 'terlambat', 'ready'].includes(st)) {
 const labelText = st === 'terlambat' ? 'Terlambat' : 'Belum Presensi'
 return (
 <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-extrabold text-amber-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950 dark:text-amber-300 dark:border-emerald-800/60 shadow-2xs">
 <span className="h-1.5 w-1.5 rounded-full bg-amber-600 dark:bg-amber-400" />
 {labelText}
 </span>
 )
 }

 if (['izin', 'sakit'].includes(st)) {
 return (
 <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-extrabold text-sky-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-sky-950 dark:text-sky-300 dark:border-emerald-800/60 shadow-2xs">
 <span className="h-1.5 w-1.5 rounded-full bg-sky-600 dark:bg-sky-400" />
 {st === 'sakit' ? 'Sakit' : 'Izin'}
 </span>
 )
 }

 // Fallback / Offline / Absen
 return (
 <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-extrabold text-rose-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950 dark:text-rose-300 dark:border-emerald-800/60 shadow-2xs">
 <span className="h-1.5 w-1.5 rounded-full bg-rose-600 dark:bg-rose-400" />
 {st === 'absen' || st === 'alpa' || st === 'offline' ? 'Absen' : label(st)}
 </span>
 )
}

const formatDateTime = (value) =>
 value ? new Date(value).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) : '-'

const formatDateOnly = (value) =>
 value ? new Date(value).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-'

export default function TeacherMonitoringPanel({ data, loading, error, filters = {}, onFilterChange, onRetry }) {
 const [selectedTeacherRow, setSelectedTeacherRow] = useState(null)
 const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
 const [isImportModalOpen, setIsImportModalOpen] = useState(false)

 const summary = data?.summary || {}
 const rawRows = data?.rows || []
 const masterData = data?.master_data || {}
 const activePeriod = filters.period || 'harian'

 // Penggabungan (Aggregation) Data Guru yang Mengajar 2 Mapel atau Lebih
 const groupedTeacherRows = useMemo(() => {
 if (!rawRows || rawRows.length === 0) return []

 const teacherMap = new Map()

 rawRows.forEach((r) => {
 const teacherId = r.teacher?.id || r.teacher?.name || 'unknown'

 const scheduleItem = {
 id: r.schedule?.id || r.id,
 subject: r.schedule?.subject || '-',
 class: r.schedule?.class || '-',
 day_of_week: r.schedule?.day_of_week,
 nama_hari: r.schedule?.nama_hari || '-',
 time_start: r.schedule?.time_start,
 time_end: r.schedule?.time_end,
 attendance_status: r.attendance_status,
 attendance_at: r.attendance_at,
 teaching_status: r.teaching_status,
 session_started_at: r.session_started_at,
 session_completed_at: r.session_completed_at,
 period_stats: r.period_stats,
 }

 if (!teacherMap.has(teacherId)) {
 teacherMap.set(teacherId, {
 id: r.id,
 teacher: r.teacher,
 teacherName: r.teacher?.name || '',
 unit: r.unit,
 unitName: r.unit?.name || '',
 online_status: r.online_status,
 last_seen_at: r.last_seen_at,
 last_activity_at: r.last_activity_at,
 schedules: [scheduleItem],
 attendance_status: r.attendance_status,
 teaching_status: r.teaching_status,
 period_stats: r.period_stats ? { ...r.period_stats } : null,
 })
 } else {
 const existing = teacherMap.get(teacherId)
 existing.schedules.push(scheduleItem)

 if (['online', 'hadir'].includes(r.online_status)) existing.online_status = 'online'
 if (['hadir', 'tepat_waktu'].includes(r.attendance_status)) existing.attendance_status = 'hadir'
 if (r.teaching_status === 'active') existing.teaching_status = 'active'

 if (r.period_stats && existing.period_stats) {
 existing.period_stats.total_records += r.period_stats.total_records || 0
 existing.period_stats.total_hadir += r.period_stats.total_hadir || 0
 existing.period_stats.total_terlambat += r.period_stats.total_terlambat || 0
 existing.period_stats.total_belum_presensi += r.period_stats.total_belum_presensi || 0
 if (existing.period_stats.total_records > 0) {
 existing.period_stats.ketercapaian_persen = Math.round(
 ((existing.period_stats.total_hadir + existing.period_stats.total_terlambat) /
 existing.period_stats.total_records) *
 100
 )
 }
 }

 if (r.last_activity_at && new Date(r.last_activity_at) > new Date(existing.last_activity_at || 0)) {
 existing.last_activity_at = r.last_activity_at
 }
 }
 })

 return Array.from(teacherMap.values())
 }, [rawRows])

 const handlePeriodTabChange = (newPeriod) => {
 onFilterChange({
 ...filters,
 period: newPeriod,
 })
 }

 // 1. HANDLER CETAK TABLE IN-PLACE
 const handlePrintClean = () => {
 const headers = ['NO', 'GURU', 'UNIT PENDIDIKAN', 'JUMLAH MAPEL', 'DAFTAR MATA PELAJARAN & KELAS', 'STATUS PRESENSI', 'ONLINE']
 const rowsToPrint = groupedTeacherRows.map((r, i) => [
 i + 1,
 r.teacher?.name || '-',
 r.unit?.name || '-',
 `${r.schedules.length} Mapel`,
 r.schedules.map((s) => `${s.subject} (${s.class})`).join(', '),
 label(r.attendance_status),
 label(r.online_status),
 ])

 printCleanTable({
 title: `Laporan Data Pemantauan Guru Mengajar (${activePeriod.toUpperCase()})`,
 subtitle: data?.range
 ? `Rentang Tanggal: ${formatDateOnly(data.range.start_date)} s/d ${formatDateOnly(data.range.end_date)}`
 : `Tanggal: ${formatDateOnly(data?.date)}`,
 headers,
 rows: rowsToPrint,
 })
 }

 // 2. HANDLER UNDUH PDF
 const handleDownloadPdf = () => {
 const headers = ['NO', 'GURU', 'UNIT PENDIDIKAN', 'JUMLAH MAPEL', 'DAFTAR MATA PELAJARAN & KELAS', 'STATUS PRESENSI', 'ONLINE']
 const rowsToPrint = groupedTeacherRows.map((r, i) => [
 i + 1,
 r.teacher?.name || '-',
 r.unit?.name || '-',
 `${r.schedules.length} Mapel`,
 r.schedules.map((s) => `${s.subject} (${s.class})`).join(', '),
 label(r.attendance_status),
 label(r.online_status),
 ])

 downloadPdfTable({
 title: `Laporan Data Pemantauan Guru Mengajar (${activePeriod.toUpperCase()})`,
 subtitle: data?.range
 ? `Rentang Tanggal: ${formatDateOnly(data.range.start_date)} s/d ${formatDateOnly(data.range.end_date)}`
 : `Tanggal: ${formatDateOnly(data?.date)}`,
 headers,
 rows: rowsToPrint,
 filename: `laporan_monitoring_guru_${activePeriod}_${new Date().toISOString().slice(0, 10)}.pdf`,
 })
 }

 // 3. HANDLER EXPORT CSV
 const handleExportCSV = () => {
 if (!groupedTeacherRows || groupedTeacherRows.length === 0) {
 Swal.fire('Info', 'Tidak ada data pemantauan guru untuk diekspor.', 'info')
 return
 }
 const headers = ['NO', 'NAMA GURU', 'UNIT PENDIDIKAN', 'JUMLAH MAPEL', 'DAFTAR MAPEL & KELAS', 'STATUS ONLINE', 'STATUS PRESENSI', 'STATUS MENGAJAR', 'AKTIVITAS TERAKHIR']
 let csvStr = headers.join(',') + '\n'
 groupedTeacherRows.forEach((r, i) => {
 const mapelListStr = r.schedules.map((s) => `${s.subject} [${s.class}] (${s.nama_hari})`).join('; ')
 const line = [
 i + 1,
 `"${r.teacher?.name || ''}"`,
 `"${r.unit?.name || ''}"`,
 `"${r.schedules.length}"`,
 `"${mapelListStr}"`,
 `"${label(r.online_status)}"`,
 `"${label(r.attendance_status)}"`,
 `"${label(r.teaching_status)}"`,
 `"${formatDateTime(r.last_activity_at)}"`,
 ].join(',')
 csvStr += line + '\n'
 })
 const blob = new Blob([`\uFEFF${csvStr}`], { type: 'text/csv;charset=utf-8;' })
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.href = url
 link.download = `export_monitoring_guru_${activePeriod}_${new Date().toISOString().slice(0, 10)}.csv`
 document.body.appendChild(link)
 link.click()
 document.body.removeChild(link)
 URL.revokeObjectURL(url)
 Swal.fire({
 icon: 'success',
 title: 'Export Berhasil',
 text: `Data pemantauan guru (${groupedTeacherRows.length} guru) berhasil diekspor.`,
 timer: 2000,
 showConfirmButton: false,
 })
 }

 // 4. HANDLER IMPORT CSV
 const handleImportRows = (importedRows) => {
 Swal.fire({
 icon: 'success',
 title: 'Import Berhasil Dibaca',
 text: `${importedRows.length} data pemantauan mengajar berhasil dibaca dari berkas.`,
 })
 setIsImportModalOpen(false)
 }

 const importColumns = [
 { key: 'nama_guru', label: 'Nama Guru', example: 'Ustadz Ahmad' },
 { key: 'unit_pendidikan', label: 'Unit Pendidikan', example: 'SDIT Darel Iman' },
 { key: 'mata_pelajaran', label: 'Mata Pelajaran', example: 'Bahasa Arab' },
 { key: 'kelas', label: 'Kelas', example: 'Kelas V A' },
 { key: 'hari', label: 'Hari', example: 'Senin' },
 { key: 'jam_mulai', label: 'Jam Mulai', example: '07:30' },
 { key: 'jam_selesai', label: 'Jam Selesai', example: '08:40' },
 { key: 'status_presensi', label: 'Status Presensi', example: 'Hadir' },
 ]

 const tableColumns = useMemo(() => [
 {
 key: 'teacher',
 label: 'Guru & Unit Pendidikan',
 render: (row) => (
 <div
 onClick={(e) => {
 e.stopPropagation()
 setSelectedTeacherRow(row)
 }}
 className="flex items-center gap-3 cursor-pointer group/teacher"
 title="Klik untuk melihat detail lengkap"
 >
 <Avatar size="sm">
 <AvatarFallback className="bg-emerald-100 text-emerald-800 font-extrabold text-xs dark:bg-emerald-950 dark:text-emerald-300">
 {(row.teacher?.name || '?').slice(0, 2).toUpperCase()}
 </AvatarFallback>
 </Avatar>
 <div>
 <p className="font-bold text-slate-800 dark:text-slate-100 group-hover/teacher:text-emerald-600 transition-colors border-b border-dashed border-emerald-300 dark:border-emerald-700/80">
 {row.teacher?.name || '-'}
 </p>
 <div className="flex items-center gap-1.5 mt-0.5">
 <Badge color="sky" size="xs">
 {row.schedules.length} Mapel / Jadwal
 </Badge>
 {row.unit?.name && (
 <span className="text-[10px] font-semibold text-slate-500">{row.unit.name}</span>
 )}
 </div>
 </div>
 </div>
 ),
 },
 {
 key: 'schedules_summary',
 label: 'Mata Pelajaran yang Diajar',
 render: (row) => (
 <div className="space-y-1 cursor-pointer" onClick={() => setSelectedTeacherRow(row)}>
 {row.schedules.slice(0, 2).map((sch, idx) => (
 <div key={idx} className="flex items-center gap-1.5">
 <Badge color="cyan" size="xs">
 {sch.subject}
 </Badge>
 <span className="text-xs font-medium text-slate-500">
 ({sch.class})
 </span>
 </div>
 ))}
 {row.schedules.length > 2 && (
 <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
 +{row.schedules.length - 2} mapel lainnya...
 </span>
 )}
 </div>
 ),
 },
 {
 key: 'online_status',
 label: 'Online',
 render: (row) => renderOnlineBadge(row.online_status),
 },
 {
 key: 'attendance_status',
 label: 'Status Presensi',
 render: (row) => renderAttendanceBadge(row.attendance_status),
 },
 ...(activePeriod !== 'harian'
 ? [
 {
 key: 'period_stats',
 label: 'Rekap Periode',
 render: (row) => (
 <div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
 Hadir: {row.period_stats?.total_hadir ?? 0} / Total: {row.period_stats?.total_records ?? 0}
 </p>
 <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
 Ketercapaian: {row.period_stats?.ketercapaian_persen ?? 0}%
 </span>
 </div>
 ),
 },
 ]
 : [
 {
 key: 'last_activity_at',
 label: 'Aktivitas Terakhir',
 hideOnMobile: true,
 render: (row) => (
 <span className="text-xs font-semibold text-slate-500">
 {formatDateTime(row.last_activity_at)}
 </span>
 ),
 },
 ]),
 ], [activePeriod])

 return (
 <>
 {/* Modern Emerald Datatable Container */}
 <div className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-200/80 dark:border-emerald-800/80 bg-slate-50/50 dark:bg-slate-900/50 p-5">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 shadow-xs dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 shadow-sm">
 <Radio className="h-5 w-5 animate-pulse" />
 </div>
 <div>
 <h3 className="text-lg font-bold text-slate-900 dark:text-white">
 Monitoring Data Guru Mengajar
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Data real-time jadwal, presensi mengajar, aktivitas user, dan rekapitulasi periode ({activePeriod.toUpperCase()}). Server: {formatDateTime(data?.server_time)}
 </p>
 </div>
 </div>

 <div className="relative top-0 right-0 sm:static flex items-center gap-2">
 <SquircleActionButton
 variant="view"
 icon={Printer}
 label="Cetak"
 onClick={() => setIsPrintModalOpen(true)}
 />
 </div>
 </div>

 <div className="p-4 md:p-6 space-y-6">
 {/* FILTER PERIODE PILL TAB SWITCHER */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 p-4.5 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900/40 space-y-4">
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-100/80 dark:border-emerald-800/60 pb-3">
 <div className="flex items-center gap-2">
 <Filter className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-200">
 Filter Periode Monitoring
 </span>
 </div>

 <div className="flex flex-wrap rounded-xl bg-emerald-50 p-1 dark:bg-emerald-950/40">
 {[
 ['harian', 'Harian', Calendar],
 ['mingguan', 'Mingguan', CalendarDays],
 ['bulanan', 'Bulanan', CalendarDays],
 ['semester', 'Semester', GraduationCap],
 ['tahunan', 'Tahunan', GraduationCap],
 ].map(([id, labelText, Icon]) => (
 <button
 key={id}
 type="button"
 onClick={() => handlePeriodTabChange(id)}
 className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${activePeriod === id
 ? 'bg-emerald-600 shadow-sm dark:bg-emerald-500'
 : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
 }`}
 >
 <Icon className="h-3.5 w-3.5" />
 <span>{labelText}</span>
 </button>
 ))}
 </div>
 </div>

 {/* DYNAMIC FILTER INPUTS BASED ON PERIOD TYPE */}
 <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 items-end">
 {activePeriod === 'harian' && (
 <div>
 <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Pilih Tanggal</label>
 <DatePicker
 value={filters.date || new Date().toISOString().split('T')[0]}
 onChange={(e) => onFilterChange({ ...filters, date: e.target.value })}
 inputClassName="h-10 text-xs font-semibold"
 />
 </div>
 )}

 {activePeriod === 'mingguan' && (
 <>
 <div>
 <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Tanggal Mulai</label>
 <DatePicker
 value={filters.start_date || ''}
 onChange={(e) => onFilterChange({ ...filters, start_date: e.target.value })}
 inputClassName="h-10 text-xs font-semibold"
 />
 </div>
 <div>
 <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Tanggal Selesai</label>
 <DatePicker
 value={filters.end_date || ''}
 onChange={(e) => onFilterChange({ ...filters, end_date: e.target.value })}
 inputClassName="h-10 text-xs font-semibold"
 />
 </div>
 </>
 )}

 {activePeriod === 'bulanan' && (
 <>
 <div>
 <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Bulan</label>
 <Select
 value={String(filters.month || (new Date().getMonth() + 1))}
 onChange={(val) => onFilterChange({ ...filters, month: String(val) })}
 >
 <SelectTrigger className="h-10 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-xs font-semibold dark:border-emerald-700/80 dark:bg-slate-900 dark:text-emerald-600">
 <SelectValue placeholder="Pilih Bulan..." />
 </SelectTrigger>
 <SelectContent className="z-50 max-h-60 overflow-y-auto bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-xl p-1">
 {MONTHS.map((m) => (
 <SelectItem key={m.value} id={m.value} value={m.value} className="text-xs font-medium py-1.5">
 {m.label}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 <div>
 <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Tahun</label>
 <input
 type="number"
 value={filters.year || String(new Date().getFullYear())}
 onChange={(e) => onFilterChange({ ...filters, year: e.target.value })}
 placeholder="2026"
 className="h-10 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-xs font-semibold dark:border-emerald-700/80 dark:bg-slate-900 dark:text-white outline-none focus:border-emerald-600"
 />
 </div>
 </>
 )}

 {activePeriod === 'semester' && (
 <div>
 <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Semester</label>
 <Select
 value={String(filters.semester_id || '')}
 onChange={(val) => onFilterChange({ ...filters, semester_id: String(val) })}
 >
 <SelectTrigger className="h-10 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-xs font-semibold dark:border-emerald-700/80 dark:bg-slate-900 dark:text-slate-600">
 <SelectValue placeholder="-- Semester Aktif --" />
 </SelectTrigger>
 <SelectContent className="z-50 max-h-60 overflow-y-auto bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-xl p-1">
 <SelectItem id="" value="" className="text-xs font-medium py-1.5">-- Semester Aktif --</SelectItem>
 {(masterData.semesters || []).map((sem) => (
 <SelectItem key={sem.id} id={String(sem.id)} value={String(sem.id)} className="text-xs font-medium py-1.5">
 {sem.name} {sem.is_active ? '(Aktif)' : ''}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 )}

 {activePeriod === 'tahunan' && (
 <div>
 <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Tahun Ajaran</label>
 <Select
 value={String(filters.academic_year_id || '')}
 onChange={(val) => onFilterChange({ ...filters, academic_year_id: String(val) })}
 >
 <SelectTrigger className="h-10 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-xs font-semibold dark:border-emerald-700/80 dark:bg-slate-900 dark:text-white">
 <SelectValue placeholder="-- Tahun Ajaran Aktif --" />
 </SelectTrigger>
 <SelectContent className="z-50 max-h-60 overflow-y-auto bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-xl p-1">
 <SelectItem id="" value="" className="text-xs font-medium py-1.5">-- Tahun Ajaran Aktif --</SelectItem>
 {(masterData.academic_years || []).map((ay) => (
 <SelectItem key={ay.id} id={String(ay.id)} value={String(ay.id)} className="text-xs font-medium py-1.5">
 {ay.name} {ay.is_active ? '(Aktif)' : ''}
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 )}

 {/* FILTER UNIT PENDIDIKAN */}
 <div>
 <label className="mb-1 block text-xs font-semibold text-slate-600 dark:text-slate-300">Unit Pendidikan</label>
 <Select
 value={String(filters.unit_id || '')}
 onChange={(val) => onFilterChange({ ...filters, unit_id: String(val) })}
 >
 <SelectTrigger className="h-10 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 text-xs font-semibold dark:border-emerald-700/80 dark:bg-slate-900 dark:text-white">
 <SelectValue placeholder="-- Semua Unit Pendidikan --" />
 </SelectTrigger>
 <SelectContent className="z-50 max-h-60 overflow-y-auto bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-xl p-1">
 <SelectItem id="" value="" className="text-xs font-medium py-1.5">-- Semua Unit Pendidikan --</SelectItem>
 {(masterData.education_units || []).map((unit) => (
 <SelectItem key={unit.id} id={String(unit.id)} value={String(unit.id)} className="text-xs font-medium py-1.5">
 {unit.name} ({unit.code})
 </SelectItem>
 ))}
 </SelectContent>
 </Select>
 </div>
 </div>
 </div>

 {error ? (
 <Alert status="error">
 <AlertIndicator />
 <AlertContent>
 <AlertTitle>Gagal Memuat Monitoring Guru</AlertTitle>
 <AlertDescription>{error}</AlertDescription>
 <div className="mt-3">
 <Button size="sm" variant="danger" appearance="outline" onClick={onRetry} pending={loading}>
 Coba Lagi
 </Button>
 </div>
 </AlertContent>
 </Alert>
 ) : (
 <>
 {/* Modern KPI Summary Grid */}
 <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
 {[
 { key: 'scheduled_today', title: 'Total Guru', icon: Users, tone: 'blue', tag: 'Guru' },
 { key: 'checked_in', title: 'Sudah Presensi', icon: Clock3, tone: 'emerald', tag: 'Presensi' },
 { key: 'not_checked_in', title: 'Belum Presensi', icon: Activity, tone: 'amber', tag: 'Belum' },
 { key: 'late', title: 'Terlambat', icon: Clock3, tone: 'rose', tag: 'Terlambat' },
 { key: 'active', title: 'Sedang Mengajar', icon: Radio, tone: 'purple', tag: 'Mengajar' },
 { key: 'completed', title: 'Selesai / Capaian', icon: BookOpen, tone: 'cyan', tag: 'Selesai' },
 ].map(({ key, title, icon: Icon, tone, tag }) => {
 const t = MODERN_CARD_TONES[tone] || MODERN_CARD_TONES.emerald
 return (
 <div
 key={key}
 className={`group relative overflow-hidden rounded-[22px] border-2 p-4 sm:p-5 shadow-xs transition-all duration-200 text-left ${t.card}`}
 >
 <div className="flex items-center justify-between gap-1.5 mb-3">
 <div className={`flex size-11 items-center justify-center rounded-full shadow-xs shrink-0 ${t.iconBox}`}>
 <Icon className="size-5 text-white" />
 </div>
 <div className="flex flex-col items-end gap-0.5">
 <span className={`text-[10px] font-extrabold uppercase tracking-wider ${t.tagHeader || t.title}`}>{title}</span>
 <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs ${t.tag}`}>
 {tag}
 </span>
 </div>
 </div>
 <strong className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tabular-nums tracking-tight block my-1">{summary[key] ?? 0}</strong>
 <div className={`flex items-center justify-between text-xs font-bold pt-2.5 mt-3 border-t ${t.divider}`}>
 <span className={`font-bold leading-tight truncate flex-1 ${t.sub}`}>Jumlah Guru</span>
 <span className={`inline-flex items-center gap-1 font-extrabold ${t.cta}`}>Detail &rarr;</span>
 </div>
 </div>
 )
 })}
 </div>

 {/* TOOLBAR UTAMA TOMBOL AKSI DI ATAS DATATABLE */}
 <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200/80 bg-slate-50/80 p-3.5 dark:border-emerald-800/60 dark:bg-[#1B2433]/80">
 <div className="flex items-center gap-2">
 <Layers className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
 Aksi Data Monitoring Guru ({groupedTeacherRows.length} Guru)
 </span>
 </div>

 <div className="flex flex-wrap items-center gap-2 shrink-0">
 <SquircleActionButton
 variant="import"
 label="Import Data"
 onClick={() => setIsImportModalOpen(true)}
 />
 <SquircleActionButton
 variant="export"
 label="Export Data"
 onClick={handleExportCSV}
 />
 <SquircleActionButton
 variant="view"
 icon={Printer}
 label="Cetak Data"
 onClick={() => setIsPrintModalOpen(true)}
 />
 <Button
 variant="ghost"
 size="sm"
 onClick={onRetry}
 pending={loading}
 prefixIcon={<RefreshCw className="h-4 w-4" />}
 >
 Refresh
 </Button>
 </div>
 </div>

 {/* DATA TABLE MONITORED TEACHERS WITH EXPLICIT COLOR BADGES */}
 <AppDataTable
 title={`Data Ringkasan Guru Mengajar (${activePeriod.toUpperCase()})`}
 description={
 data?.range
 ? `Rentang Tanggal: ${formatDateOnly(data.range.start_date)} s/d ${formatDateOnly(data.range.end_date)} (Klik baris untuk melihat detail absensi per mapel & kelas)`
 : `Threshold online ${data?.presence_threshold_seconds || 90} detik; polling harian otomatis setiap 20 detik.`
 }
 columns={tableColumns}
 data={groupedTeacherRows}
 searchableKeys={['teacherName', 'unitName', 'online_status', 'attendance_status']}
 clientPagination={true}
 clientPageSize={15}
 isLoading={loading}
 isError={false}
 onRowClick={(row) => setSelectedTeacherRow(row)}
 onView={undefined}
 extraActions={undefined}
 emptyTitle="Belum ada data mengajar guru"
 emptyDescription="Tidak ada data jadwal atau presensi mengajar guru pada periode terpilih."
 density="compact"
 />
 </>
 )}
 </div>
 </div>

 {/* DETAIL MODAL LAPORAN ABSENSI REKAPITULASI PER MATA PELAJARAN GURU */}
 {selectedTeacherRow && (
 <OverlayWrapper isOpen={Boolean(selectedTeacherRow)} onOpenChange={(open) => !open && setSelectedTeacherRow(null)}>
 <Backdrop isOpen={Boolean(selectedTeacherRow)} onOpenChange={(open) => !open && setSelectedTeacherRow(null)} />
 <Dialog className="max-w-xl rounded-xl p-6 bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xl">
 <DialogHeader>
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 shrink-0">
 <BookOpen className="h-5 w-5" />
 </div>
 <div>
 <DialogTitle className="text-base font-bold text-slate-900 dark:text-emerald-600">
 Data Absensi Guru: {selectedTeacherRow.teacher?.name}
 </DialogTitle>
 <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
 Status rekapitulasi presensi mengajar secara rinci untuk masing-masing mata pelajaran ({activePeriod.toUpperCase()}).
 </DialogDescription>
 </div>
 </div>
 <DialogClose onClick={() => setSelectedTeacherRow(null)} />
 </DialogHeader>

 <DialogBody className="space-y-5 py-4">
 {/* RINGKASAN PROFIL GURU & UNIT */}
 <div className="grid gap-3 sm:grid-cols-3 text-xs bg-slate-50 p-3.5 rounded-xl dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60">
 <div>
 <span className="text-[10px] font-semibold text-slate-500 block">Nama Guru</span>
 <strong className="text-sm font-bold text-slate-900 dark:text-white">{selectedTeacherRow.teacher?.name || '-'}</strong>
 </div>
 <div>
 <span className="text-[10px] font-semibold text-slate-500 block">Unit Pendidikan</span>
 <strong className="text-sm font-bold text-slate-900 dark:text-white">{selectedTeacherRow.unit?.name || '-'}</strong>
 </div>
 <div>
 <span className="text-[10px] font-semibold text-slate-500 block">Status Online System</span>
 <div className="mt-0.5">
 {renderOnlineBadge(selectedTeacherRow.online_status)}
 </div>
 </div>
 </div>

 {/* RINCIAN ABSENSI & REKAPITULASI UNTUK MING-MASING MATA PELAJARAN */}
 <div>
 <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
 <BookOpen className="h-4 w-4 text-emerald-600" />
 Rekapitulasi Absensi Masing-Masing Mata Pelajaran ({selectedTeacherRow.schedules.length} Mapel)
 </h4>

 <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
 {selectedTeacherRow.schedules.map((sch, index) => {
 const schStats = sch.period_stats || null
 return (
 <div
 key={index}
 className="rounded-xl border border-emerald-200/80 bg-white p-4 dark:border-emerald-800/60 dark:bg-[#1B2433] space-y-3 shadow-2xs"
 >
 {/* MAPEL HEADER */}
 <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100/80 dark:border-emerald-800/60 pb-2.5">
 <div>
 <div className="flex items-center gap-2">
 <span className="text-sm font-extrabold text-slate-900 dark:text-white">
 {sch.subject || '-'}
 </span>
 <Badge color="cyan" size="xs">
 Kelas: {sch.class}
 </Badge>
 </div>
 <p className="text-xs font-semibold text-slate-500 mt-0.5">
 Jadwal Mengajar: {sch.nama_hari} ({sch.time_start?.slice(0, 5)}–{sch.time_end?.slice(0, 5)})
 </p>
 </div>

 <div>
 {renderAttendanceBadge(sch.attendance_status)}
 </div>
 </div>

 {/* STATISTIK REKAPITULASI PRESENSI UNTUK MAPEL INI */}
 <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
 <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 block">
 Status Rekapitulasi Presensi — {sch.subject} ({sch.class})
 </span>

 <div className="grid grid-cols-3 gap-2 text-center text-xs">
 <div className="rounded-lg bg-white p-2 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-slate-500 block text-[10px] font-semibold">Jumlah Hadir</span>
 <strong className="text-emerald-600 dark:text-emerald-400 text-sm font-black block mt-0.5">
 {schStats ? (schStats.total_hadir ?? 0) : (['hadir', 'tepat_waktu'].includes(sch.attendance_status) ? 1 : 0)}
 </strong>
 </div>

 <div className="rounded-lg bg-white p-2 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-slate-500 block text-[10px] font-semibold">Jumlah Izin</span>
 <strong className="text-amber-600 dark:text-amber-400 text-sm font-black block mt-0.5">
 {schStats ? (schStats.total_terlambat ?? 0) : (['izin', 'sakit', 'terlambat'].includes(sch.attendance_status) ? 1 : 0)}
 </strong>
 </div>

 <div className="rounded-lg bg-white p-2 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-slate-500 block text-[10px] font-semibold">Jumlah Absen</span>
 <strong className="text-rose-600 dark:text-rose-400 text-sm font-black block mt-0.5">
 {schStats ? (schStats.total_belum_presensi ?? 0) : (['belum_presensi', 'absen', 'offline'].includes(sch.attendance_status) ? 1 : 0)}
 </strong>
 </div>
 </div>
 </div>

 {/* DETAIL SESI MENGAJAR */}
 <div className="grid grid-cols-2 gap-2 text-xs">
 <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-900/50">
 <span className="text-[10px] font-semibold text-slate-500 block">Waktu Presensi (Check-in)</span>
 <span className="font-bold text-slate-800 dark:text-slate-200">
 {formatDateTime(sch.attendance_at)}
 </span>
 </div>

 <div className="rounded-xl bg-slate-50 p-2 dark:bg-slate-900/50">
 <span className="text-[10px] font-semibold text-slate-500 block">Status Sesi Mengajar</span>
 <div className="mt-0.5">
 {renderAttendanceBadge(sch.teaching_status)}
 </div>
 </div>

 <div className="col-span-2 rounded-xl bg-slate-50 p-2 dark:bg-slate-900/50 flex justify-between items-center text-xs">
 <span className="font-medium text-slate-500">Mulai / Selesai Sesi Mengajar:</span>
 <span className="font-bold text-slate-800 dark:text-slate-200">
 {formatDateTime(sch.session_started_at)} / {formatDateTime(sch.session_completed_at)}
 </span>
 </div>
 </div>
 </div>
 )
 })}
 </div>
 </div>
 </DialogBody>

 <DialogFooter className="pt-4 flex items-center justify-between border-t border-emerald-100/80 dark:border-emerald-800/60">
 <SquircleActionButton
 variant="view"
 icon={Printer}
 label="Cetak"
 onClick={() => {
 const headers = ['NO', 'MATA PELAJARAN', 'KELAS', 'HARI & JAM', 'HADIR', 'IZIN', 'ABSEN', 'PRESENSI']
 const rowsToPrint = selectedTeacherRow.schedules.map((s, idx) => {
 const st = s.period_stats
 return [
 idx + 1,
 s.subject || '-',
 s.class || '-',
 `${s.nama_hari} (${s.time_start?.slice(0, 5)}-${s.time_end?.slice(0, 5)})`,
 st ? (st.total_hadir ?? 0) : (['hadir', 'tepat_waktu'].includes(s.attendance_status) ? 1 : 0),
 st ? (st.total_terlambat ?? 0) : (['izin', 'sakit', 'terlambat'].includes(s.attendance_status) ? 1 : 0),
 st ? (st.total_belum_presensi ?? 0) : (['belum_presensi', 'absen', 'offline'].includes(s.attendance_status) ? 1 : 0),
 label(s.attendance_status),
 ]
 })
 printCleanTable({
 title: `Laporan Rekapitulasi Absensi Masing-Masing Mapel: ${selectedTeacherRow.teacher?.name}`,
 subtitle: `Unit: ${selectedTeacherRow.unit?.name || '-'} · Periode: ${activePeriod.toUpperCase()}`,
 headers,
 rows: rowsToPrint,
 })
 }}
 />
 <button
 type="button"
 onClick={() => setSelectedTeacherRow(null)}
 className="px-5 py-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition"
 >
 Tutup
 </button>
 </DialogFooter>
 </Dialog>
 </OverlayWrapper>
 )}

 {/* PRINT OPTION MODAL */}
 <PrintOptionModal
 isOpen={isPrintModalOpen}
 onClose={() => setIsPrintModalOpen(false)}
 title={`Pemantauan Guru (${activePeriod.toUpperCase()})`}
 onPrint={() => {
 handlePrintClean()
 setIsPrintModalOpen(false)
 }}
 onDownload={() => {
 handleDownloadPdf()
 setIsPrintModalOpen(false)
 }}
 />

 {/* CSV IMPORT MODAL */}
 <CsvImportModal
 open={isImportModalOpen}
 onClose={() => setIsImportModalOpen(false)}
 title={`Monitoring Guru (${activePeriod.toUpperCase()})`}
 columns={importColumns}
 onImport={handleImportRows}
 />
 </>
 )
}
