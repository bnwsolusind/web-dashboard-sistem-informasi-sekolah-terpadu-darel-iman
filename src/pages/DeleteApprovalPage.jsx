import {
  KpiStatCard
} from '../components/app'
import React, { useState, useEffect, useMemo } from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  ShieldAlert,
  ShieldCheck,
  Clock,
  Filter,
  RefreshCw,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Sparkles,
  Database,
  Trash2,
  X
} from 'lucide-react'
import {
  useToast
} from '../components/app/ToastProvider'

import PageContainer from '../components/app/PageContainer'
import AppModal from '../components/app/AppModal'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import {
  deleteRequestService
} from '../services/deleteRequestService'
import {
  Button
} from '@/components/ui/button'
import {
  Badge
} from '@/components/ui/badge'

const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: { staggerChildren: 0.08, delayChildren: 0.05 },
 },
}

const itemVariants = {
 hidden: { opacity: 0, y: 16 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { type: 'spring', stiffness: 350, damping: 26 },
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

export default function DeleteApprovalPage() {
 const toast = useToast()
 const [requests, setRequests] = useState([])
 const [loading, setLoading] = useState(true)
 const [statusFilter, setStatusFilter] = useState('pending')
 const [error, setError] = useState('')
 const [actionLoadingId, setActionLoadingId] = useState(null)

 // Harmonized Modals State
 const [approveConfirmModal, setApproveConfirmModal] = useState({ open: false, item: null })
 const [rejectionModal, setRejectionModal] = useState({ open: false, requestId: null, reason: '', item: null })

 const fetchRequests = async () => {
 setLoading(true)
 setError('')
 try {
 const res = await deleteRequestService.getDeleteRequests({ status: statusFilter !== 'all' ? statusFilter : undefined })
 setRequests(res?.data?.data || res?.data || [])
 } catch (err) {
 const errMsg = err?.response?.data?.message || 'Gagal memuat daftar permintaan penghapusan.'
 setError(errMsg)
 toast.error(errMsg)
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchRequests()
 }, [statusFilter])

 // KPI Metrics calculation
 const metrics = useMemo(() => {
 const total = requests.length
 const pending = requests.filter((r) => r.status === 'pending').length
 const approved = requests.filter((r) => r.status === 'approved').length
 const rejected = requests.filter((r) => r.status === 'rejected').length
 return { total, pending, approved, rejected }
 }, [requests])

 const handleOpenApprove = (item) => {
 setApproveConfirmModal({ open: true, item })
 }

 const handleConfirmApprove = async () => {
 const id = approveConfirmModal.item?.id
 if (!id) return
 setActionLoadingId(id)
 try {
 await deleteRequestService.approveDeleteRequest(id)
 toast.success('Permintaan penghapusan berhasil disetujui (soft deleted).')
 setApproveConfirmModal({ open: false, item: null })
 fetchRequests()
 } catch (err) {
 toast.error(err?.response?.data?.message || 'Gagal menyetujui penghapusan.')
 } finally {
 setActionLoadingId(null)
 }
 }

 const handleOpenReject = (item) => {
 setRejectionModal({ open: true, requestId: item.id, reason: '', item })
 }

 const handleRejectSubmit = async (e) => {
 e.preventDefault()
 if (!rejectionModal.reason.trim()) {
 toast.error('Alasan penolakan wajib diisi.')
 return
 }
 setActionLoadingId(rejectionModal.requestId)
 try {
 await deleteRequestService.rejectDeleteRequest(rejectionModal.requestId, rejectionModal.reason.trim())
 toast.success('Permintaan penghapusan berhasil ditolak.')
 setRejectionModal({ open: false, requestId: null, reason: '', item: null })
 fetchRequests()
 } catch (err) {
 toast.error(err?.response?.data?.message || 'Gagal menolak permintaan penghapusan.')
 } finally {
 setActionLoadingId(null)
 }
 }

 return (
 <PageContainer maxW="7xl">
 <motion.div
 variants={containerVariants}
 initial="hidden"
 animate="visible"
 className="space-y-6 pb-12"
 >
 {/* ── Breadcrumb ── */}
 <motion.div variants={itemVariants}>
 <AppBreadcrumb
 items={[
 { label: 'Pengaturan', href: '/dashboard/pengaturan' },
 { label: 'Persetujuan Penghapusan' },
 ]}
 />
 </motion.div>

 {/* ── Modern Hero Card ── */}
 <motion.div
 variants={itemVariants}
 className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden"
 >

 <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
 <div className="flex items-start gap-4 min-w-0">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 
            <ShieldAlert className="h-6 w-6 text-white" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2.5 flex-wrap">
 <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
 Persetujuan Penghapusan Data
 </h1>
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
 
                  <ShieldCheck className="h-3.5 w-3.5 text-white" />
 Superadmin Panel
 </span>
 </div>
 <p className="mt-1 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 w-full leading-relaxed">
 Tinjau dan verifikasi permohonan hapus data entitas penting dari seluruh unit. Penghapusan dieksekusi secara soft-delete teratur setelah disetujui Superadmin.
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
 <button
 type="button"
 onClick={fetchRequests}
 disabled={loading}
 className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] px-3.5 py-2 text-xs font-black text-emerald-900 hover:from-emerald-200 hover:to-teal-200 dark:border-emerald-800/60 dark:bg-[#1B2433] dark:text-emerald-200 shadow-2xs transition-all cursor-pointer"
 >
 <RefreshCw className={`h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
 <span>Segarkan Data</span>
 </button>
 </div>
 </div>
 </motion.div>

 {/* ── KPI Summary Cards ── */}
 <motion.div variants={itemVariants}>
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
 <ModernKpiCard
 icon={Database}
 label="Total Permohonan"
 subtext="Permohonan hapus terdata"
 value={metrics.total}
 tag={`${metrics.total} Item`}
 tone="blue"
 />
 <ModernKpiCard
 icon={Clock}
 label="Menunggu Review"
 subtext="Butuh tindakan persetujuan"
 value={metrics.pending}
 tag={`${metrics.pending} Menunggu`}
 tone="amber"
 />
 <ModernKpiCard
 icon={CheckCircle2}
 label="Telah Disetujui"
 subtext="Data berhasil di soft-delete"
 value={metrics.approved}
 tag={`${metrics.approved} Selesai`}
 tone="emerald"
 />
 <ModernKpiCard
 icon={XCircle}
 label="Permohonan Ditolak"
 subtext="Permohonan dibatalkan"
 value={metrics.rejected}
 tag={`${metrics.rejected} Ditolak`}
 tone="rose"
 />
 </div>
 </motion.div>

 {/* ── HeroUI Emerald Datatable Container ── */}
 <motion.div
 variants={itemVariants}
 className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white shadow-sm dark:bg-[#1B2433]"
 >
 {/* Toolbar Header */}
 <div className="p-4 sm:p-5 bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/80 dark:border-emerald-800/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
 <div className="flex items-center gap-2.5">
 <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 shadow-xs dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 shadow-sm">
 <FileText className="size-4 text-slate-600" />
 </div>
 <div>
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
 Daftar Permohonan Penghapusan
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
 Menampilkan {requests.length} permohonan sesuai filter aktif
 </p>
 </div>
 </div>

 {/* Filter Status Pills */}
 <div className="flex items-center gap-1.5 p-1 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 {[
 { id: 'pending', label: 'Menunggu' },
 { id: 'approved', label: 'Disetujui' },
 { id: 'rejected', label: 'Ditolak' },
 { id: 'all', label: 'Semua' },
 ].map((st) => (
 <button
 key={st.id}
 onClick={() => setStatusFilter(st.id)}
 className={`py-1 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
 statusFilter === st.id
 ? 'bg-emerald-600 text-white shadow-sm'
 : 'text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300'
 }`}
 >
 {st.label}
 </button>
 ))}
 </div>
 </div>

 {/* List Content */}
 <div className="p-4 sm:p-5">
 {loading ? (
 <div className="py-16 text-center text-slate-400">
 <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-3" />
 <p className="text-xs font-semibold">Memuat daftar permintaan penghapusan...</p>
 </div>
 ) : error ? (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/70 p-6 text-center text-xs font-medium text-rose-800 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300">
 {error}
 </div>
 ) : requests.length === 0 ? (
 <div className="py-16 text-center text-slate-400">
 <CheckCircle2 className="w-12 h-9 text-emerald-500 mx-auto mb-3 opacity-80" />
 <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
 Tidak ada permintaan penghapusan data.
 </p>
 <p className="text-xs text-slate-400 mt-1">
 Seluruh data aman atau tidak ada item dalam status ini.
 </p>
 </div>
 ) : (
 <div className="space-y-3.5">
 {requests.map((req) => (
 <div
 key={req.id}
 className="relative overflow-hidden rounded-xl border-2 border-emerald-200/80 bg-slate-50/50 p-4 sm:p-5 transition hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-white hover:shadow-md dark:border-emerald-800/60 dark:bg-slate-900/40 dark:hover:border-emerald-700/80 dark:hover:bg-[#1B2433] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
 >
 <div className="space-y-2 flex-1 min-w-0">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="py-0.5 px-2.5 bg-slate-200/80 text-slate-800 text-[10px] font-mono font-bold rounded-lg uppercase dark:bg-slate-800 dark:text-slate-200">
 Tabel: {req.target_table}
 </span>
 <span
 className={`py-0.5 px-2.5 rounded-lg text-[10px] font-extrabold capitalize ${
 req.status === 'pending'
 ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
 : req.status === 'approved'
 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300'
 : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
 }`}
 >
 {req.status === 'pending'
 ? 'Menunggu Review'
 : req.status === 'approved'
 ? 'Disetujui (Soft Deleted)'
 : 'Ditolak'}
 </span>
 </div>

 <div>
 <h4 className="text-base font-black text-slate-900 dark:text-white">
 {req.target_label || `ID Target: ${req.target_id}`}
 </h4>
 <div className="mt-1.5 rounded-xl bg-white dark:bg-slate-800/80 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 p-2.5 text-xs text-slate-700 dark:text-slate-300">
 <span className="font-bold text-slate-900 dark:text-white">Alasan Pemohon:</span> "{req.reason}"
 </div>
 </div>

 <div className="flex items-center gap-4 text-xs text-slate-400 font-medium pt-1 flex-wrap">
 <span className="flex items-center gap-1.5">
 <User className="w-3.5 h-3.5 text-emerald-600" />
 Diajukan oleh: <strong className="text-slate-700 dark:text-slate-200">{req.requester?.name || 'Admin'}</strong>
 </span>
 <span className="flex items-center gap-1.5">
 <Clock className="w-3.5 h-3.5 text-slate-400" />
 {new Date(req.created_at).toLocaleString('id-ID')}
 </span>
 </div>

 {req.rejection_reason && (
 <div className="text-xs text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 font-medium">
 <strong>Catatan Penolakan Superadmin:</strong> {req.rejection_reason}
 </div>
 )}
 </div>

 {/* Action Buttons for Superadmin */}
 {req.status === 'pending' && (
 <div className="flex items-center gap-2 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-emerald-200/80 dark:border-emerald-800/60">
 <button
 type="button"
 onClick={() => handleOpenReject(req)}
 disabled={actionLoadingId === req.id}
 className="flex-1 md:flex-initial py-2 px-3.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer dark:bg-rose-950/40 dark:text-rose-300 dark:border-emerald-800/60"
 >
 <XCircle className="w-4 h-4" />
 <span>Tolak</span>
 </button>

 <button
 type="button"
 onClick={() => handleOpenApprove(req)}
 disabled={actionLoadingId === req.id}
 className="flex-1 md:flex-initial py-2 px-4 bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white hover:from-emerald-700 hover:to-teal-700 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
 >
 <CheckCircle2 className="w-4 h-4" />
 <span>{actionLoadingId === req.id ? 'Memproses...' : 'Setujui Hapus'}</span>
 </button>
 </div>
 )}
 </div>
 ))}
 </div>
 )}
 </div>
 </motion.div>
 </motion.div>

 {/* ── Harmonized Approve Confirmation Modal ── */}
 <AppModal
 isOpen={approveConfirmModal.open}
 onClose={() => { if (!actionLoadingId) setApproveConfirmModal({ open: false, item: null }) }}
 disableBackdropClose={Boolean(actionLoadingId)}
 hideCloseButton={Boolean(actionLoadingId)}
 title="Konfirmasi Persetujuan Hapus"
 description="Otorisasi Penghapusan Data Superadmin"
 icon={CheckCircle2}
 maxWidth="max-w-md"
 zIndex="z-[70]"
 footer={
 <div className="flex w-full items-center justify-end gap-2.5">
 <button
 type="button"
 onClick={() => setApproveConfirmModal({ open: false, item: null })}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={handleConfirmApprove}
 disabled={Boolean(actionLoadingId)}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border-2 border-emerald-600 bg-emerald-600 px-5 text-xs font-black text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 active:scale-95 disabled:opacity-50 cursor-pointer"
 >
 {actionLoadingId ? 'Memproses...' : 'Ya, Setujui Hapus'}
 </button>
 </div>
 }
 >
 <div className="rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 p-3.5 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
 Apakah Anda yakin ingin <strong>MENYETUJUI</strong> penghapusan data ini?
 <div className="mt-2 font-bold text-slate-900 dark:text-white">
 Target: {approveConfirmModal.item?.target_label || `ID #${approveConfirmModal.item?.target_id}`}
 </div>
 <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-400 font-medium">
 Tabel: {approveConfirmModal.item?.target_table}
 </div>
 </div>
 </AppModal>

 {/* ── Harmonized Rejection Modal ── */}
 <AppModal
 isOpen={rejectionModal.open}
 onClose={() => { if (!actionLoadingId) setRejectionModal({ open: false, requestId: null, reason: '', item: null }) }}
 disableBackdropClose={Boolean(actionLoadingId)}
 hideCloseButton={Boolean(actionLoadingId)}
 variant="danger"
 title="Tolak Permintaan Hapus"
 description="Beri alasan resmi penolakan untuk admin pemohon"
 icon={XCircle}
 maxWidth="max-w-md"
 zIndex="z-[70]"
 footer={
 <div className="flex w-full items-center justify-end gap-2.5">
 <button
 type="button"
 onClick={() => setRejectionModal({ open: false, requestId: null, reason: '', item: null })}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border border-slate-300 bg-slate-200 px-4 text-xs font-black text-slate-700 transition-all hover:bg-slate-300 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
 >
 Batal
 </button>
 <button
 type="submit"
 form="delete-rejection-form"
 disabled={!rejectionModal.reason.trim() || Boolean(actionLoadingId)}
 className="inline-flex h-9.5 items-center justify-center rounded-xl border-2 border-rose-600 bg-rose-600 px-5 text-xs font-black text-white shadow-md shadow-rose-600/20 transition-all hover:bg-rose-700 active:scale-95 disabled:opacity-50 cursor-pointer"
 >
 {actionLoadingId ? 'Mengirim...' : 'Kirim Penolakan'}
 </button>
 </div>
 }
 >
 <form id="delete-rejection-form" onSubmit={handleRejectSubmit} className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
 Alasan Penolakan <span className="text-rose-500">*</span>
 </label>
 <textarea
 rows={3}
 value={rejectionModal.reason}
 onChange={(e) => setRejectionModal({ ...rejectionModal, reason: e.target.value })}
 placeholder="Tuliskan catatan alasan penolakan secara jelas..."
 className="w-full p-3.5 bg-white dark:bg-slate-900 text-xs font-bold text-slate-800 dark:text-slate-100 rounded-xl border-2 border-[#b6f6d9] dark:border-emerald-700/80 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 focus:outline-none leading-relaxed"
 required
 />
 </div>
 </form>
 </AppModal>
 </PageContainer>
 )
}
