import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  useNavigate,
  useSearchParams
} from 'react-router-dom'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  Building2,
  Users,
  GraduationCap,
  FileCheck,
  AlertCircle,
  Award,
  FileSpreadsheet,
  BookOpen,
  Zap,
  LayoutGrid,
  CalendarCheck,
  ShieldCheck,
  Languages,
  Sparkles,
  ChevronUp,
  X,
  ExternalLink,
  RefreshCcw,
  RefreshCw
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts'

import {
  AppPageHeader,
  AppBreadcrumb,
  AppFilterBar,
  KpiCard,
  AppBadge,
  AppButton,
  SectionHeader,
  PageContainer,
  KpiStatCard,
  HeroUiHeader
} from '../components/app'
import { Tooltip as UiTooltip } from '../components/ui/tooltip'
import {
  SquircleActionButton
} from '../components/master-data'
import {
  Button
} from '../components/ui/button'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'

import ChartCard from '../components/dashboard/ChartCard'
import SkeletonDashboard from '../components/dashboard/SkeletonDashboard'
import ErrorState from '../components/dashboard/ErrorState'
import StudentAchievementRecapSection from '../components/dashboard/StudentAchievementRecapSection'
import DivisiPendidikanKpiModal from '../components/DivisiPendidikanKpiModal'

import SupervisiKbmSection from '../components/divisi/SupervisiKbmSection'
import KurasiBankSoalSection from '../components/divisi/KurasiBankSoalSection'
import MunaqasyahTahfizhSection from '../components/divisi/MunaqasyahTahfizhSection'
import PembiasaanBahasaSection from '../components/divisi/PembiasaanBahasaSection'
import PelatihanGuruSection from '../components/divisi/PelatihanGuruSection'
import ReviewLaporanBulananSection from '../components/divisi/ReviewLaporanBulananSection'
import RadarAkreditasiSection from '../components/divisi/RadarAkreditasiSection'
import DisciplineSupervisionSection from '../components/divisi/DisciplineSupervisionSection'
import {
  Scale
} from 'lucide-react'

import {
  managementDashboardService
} from '../services/managementDashboardService'
import {
  educationUnitService
} from '../services/educationUnitService'
import {
  useAuthStore
} from '../stores/authStore'
import {
  hasAnyRole,
  getUserRoleLevel,
  ROLE_LEVELS,
  ROLES
} from '../auth/portalResolver'

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

const WORKSPACE_MODULES = [
 {
 key: 'supervisi-kbm',
 label: 'Supervisi KBM',
 fullTitle: 'Supervisi Kelas & Pembelajaran (KBM)',
 tag: 'KBM',
 icon: GraduationCap,
 tone: 'emerald',
 subtext: 'Monitoring instrumen supervisi mengajar dan kinerja guru di kelas',
 },
 {
 key: 'kurasi-soal',
 label: 'Kurasi Soal',
 fullTitle: 'Kurasi Bank Soal & Kisi-Kisi Ujian',
 tag: 'UJIAN',
 icon: BookOpen,
 tone: 'purple',
 subtext: 'Validasi & penelaahan naskah soal ujian bersama antar unit',
 },
 {
 key: 'tahfizh-munaqasyah',
 label: 'Munaqasyah Tahfizh',
 fullTitle: 'Munaqasyah & Sertifikasi Tahfizh Santri',
 tag: 'TAHFIZH',
 icon: Award,
 tone: 'amber',
 subtext: 'Ujian kelayakan juz, tasmi akbar, dan penerbitan syahadah santri',
 },
 {
 key: 'bahasa-mufradat',
 label: 'Program Bahasa',
 fullTitle: 'Program Pembiasaan Bahasa (Arab & Inggris)',
 tag: 'BILINGUAL',
 icon: Languages,
 tone: 'sky',
 subtext: 'Distribusi mufradat mingguan dan pengawasan pembiasaan bilingual',
 },
 {
 key: 'pelatihan-guru',
 label: 'Pelatihan Guru',
 fullTitle: 'Pelatihan Guru & Upgrading SDM Pendidik',
 tag: 'UPGRADING',
 icon: Sparkles,
 tone: 'pink',
 subtext: 'Rekap jam pelatihan pendidik (JP) dan workshop kurikulum terpadu',
 },
 {
 key: 'revisi-laporan',
 label: 'Review Laporan',
 fullTitle: 'Review Laporan Bulanan Kepala Sekolah',
 tag: 'AUDIT',
 icon: FileCheck,
 tone: 'rose',
 subtext: 'Verifikasi, catatan perbaikan, dan persetujuan laporan bulanan kepsek',
 },
 {
 key: 'radar-akreditasi',
 label: 'Radar Akreditasi',
 fullTitle: 'Radar Akreditasi & 8 Standar Nasional',
 tag: 'STANDAR',
 icon: ShieldCheck,
 tone: 'cyan',
 subtext: 'Pemetaan kesiapan instrumen akreditasi 8 SNP di seluruh unit',
 },
 {
 key: 'supervisi-disiplin',
 label: 'Supervisi Disiplin',
 fullTitle: 'Supervisi Kepatuhan Tata Tertib & Benchmarking Lintas Unit',
 tag: 'DISIPLIN',
 icon: Scale,
 tone: 'emerald',
 subtext: 'Benchmarking rasio kepatuhan adab santri, audit penanganan SP, dan 4 kluster tata tertib TU',
 },
]

const MODULE_THEMES = {
 emerald: {
 inactive: 'bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-950 border-emerald-300/80 hover:border-emerald-300 dark:hover:border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-800/60 dark:hover:bg-emerald-900/60 shadow-xs shadow-sm',
 iconInactive: 'text-emerald-600 dark:text-emerald-400',
 iconBgInactive: 'bg-emerald-100/80 dark:bg-emerald-900/60',
 active: 'bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white ring-2 ring-emerald-400 shadow-sm scale-[1.02]',
 badgeInactive: 'bg-emerald-200/70 text-emerald-900 dark:bg-emerald-900/80 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800/60',
 badgeActive: 'bg-white/25 border border-emerald-200/30',
 topStripe: 'from-emerald-500 via-teal-400 to-emerald-600',
 heroIcon: 'from-emerald-500 via-emerald-600 to-teal-700 shadow-sm',
 },
 purple: {
 inactive: 'bg-purple-50/90 hover:bg-purple-100/90 text-purple-950 border-purple-300/80 hover:border-emerald-300 dark:hover:border-emerald-200/80 dark:bg-purple-950/40 dark:text-purple-200 dark:border-emerald-800/60 dark:hover:bg-purple-900/60 shadow-xs shadow-sm',
 iconInactive: 'text-purple-600 dark:text-purple-400',
 iconBgInactive: 'bg-purple-100/80 dark:bg-purple-900/60',
 active: 'bg-white dark:bg-card-dark ring-2 ring-purple-400 shadow-sm scale-[1.02]',
 badgeInactive: 'bg-purple-200/70 text-purple-900 dark:bg-purple-900/80 dark:text-purple-200 border border-emerald-200/80 dark:border-emerald-800/60',
 badgeActive: 'bg-white/25 border border-emerald-200/30',
 topStripe: 'from-purple-500 via-violet-400 to-indigo-600',
 heroIcon: 'from-purple-500 via-violet-600 to-indigo-700 shadow-sm',
 },
 amber: {
 inactive: 'bg-amber-50/90 hover:bg-amber-100/90 text-amber-950 border-emerald-200/80 hover:border-emerald-300 dark:hover:border-emerald-200/80 dark:bg-amber-950/40 dark:text-amber-200 dark:border-emerald-800/60 dark:hover:bg-amber-900/60 shadow-xs shadow-sm',
 iconInactive: 'text-amber-600 dark:text-amber-400',
 iconBgInactive: 'bg-amber-100/80 dark:bg-amber-900/60',
 active: 'bg-white dark:bg-card-dark ring-2 ring-amber-400 shadow-sm scale-[1.02]',
 badgeInactive: 'bg-amber-200/70 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200 border border-emerald-200/80 dark:border-emerald-800/60',
 badgeActive: 'bg-white/25 border border-emerald-200/30',
 topStripe: 'from-amber-500 via-orange-400 to-amber-600',
 heroIcon: 'from-amber-500 via-orange-600 to-amber-700 shadow-sm',
 },
 sky: {
 inactive: 'bg-sky-50/90 hover:bg-sky-100/90 text-sky-950 border-sky-300/80 hover:border-emerald-300 dark:hover:border-emerald-200/80 dark:bg-sky-950/40 dark:text-sky-200 dark:border-emerald-800/60 dark:hover:bg-sky-900/60 shadow-xs shadow-sky-500/5',
 iconInactive: 'text-sky-600 dark:text-sky-400',
 iconBgInactive: 'bg-sky-100/80 dark:bg-sky-900/60',
 active: 'bg-white dark:bg-card-dark ring-2 ring-sky-400 shadow-md shadow-sky-500/35 scale-[1.02]',
 badgeInactive: 'bg-sky-200/70 text-sky-900 dark:bg-sky-900/80 dark:text-sky-200 border border-emerald-200/80 dark:border-emerald-800/60',
 badgeActive: 'bg-white/25 border border-emerald-200/30',
 topStripe: 'from-sky-500 via-blue-400 to-indigo-600',
 heroIcon: 'from-sky-500 via-blue-600 to-indigo-700 shadow-sky-600/30',
 },
 pink: {
 inactive: 'bg-pink-50/90 hover:bg-pink-100/90 text-pink-950 border-pink-300/80 hover:border-emerald-300 dark:hover:border-emerald-200/80 dark:bg-pink-950/40 dark:text-pink-200 dark:border-emerald-800/60 dark:hover:bg-pink-900/60 shadow-xs shadow-pink-500/5',
 iconInactive: 'text-pink-600 dark:text-pink-400',
 iconBgInactive: 'bg-pink-100/80 dark:bg-pink-900/60',
 active: 'bg-white dark:bg-card-dark ring-2 ring-pink-400 shadow-md shadow-pink-500/35 scale-[1.02]',
 badgeInactive: 'bg-pink-200/70 text-pink-900 dark:bg-pink-900/80 dark:text-pink-200 border border-emerald-200/80 dark:border-emerald-800/60',
 badgeActive: 'bg-white/25 border border-emerald-200/30',
 topStripe: 'from-pink-500 via-rose-400 to-red-500',
 heroIcon: 'from-pink-500 via-rose-600 to-red-600 shadow-pink-600/30',
 },
 rose: {
 inactive: 'bg-rose-50/90 hover:bg-rose-100/90 text-rose-950 border-emerald-200/80 hover:border-emerald-300 dark:hover:border-emerald-200/80 dark:bg-rose-950/40 dark:text-rose-200 dark:border-emerald-800/60 dark:hover:bg-rose-900/60 shadow-xs shadow-sm',
 iconInactive: 'text-rose-600 dark:text-rose-400',
 iconBgInactive: 'bg-rose-100/80 dark:bg-rose-900/60',
 active: 'bg-white dark:bg-card-dark ring-2 ring-rose-400 shadow-sm scale-[1.02]',
 badgeInactive: 'bg-rose-200/70 text-rose-900 dark:bg-rose-900/80 dark:text-rose-200 border border-emerald-200/80 dark:border-emerald-800/60',
 badgeActive: 'bg-white/25 border border-emerald-200/30',
 topStripe: 'from-rose-500 via-red-400 to-rose-600',
 heroIcon: 'from-rose-500 via-rose-600 to-red-700 shadow-sm',
 },
 cyan: {
 inactive: 'bg-cyan-50/90 hover:bg-cyan-100/90 text-cyan-950 border-cyan-300/80 hover:border-emerald-300 dark:hover:border-emerald-200/80 dark:bg-cyan-950/40 dark:text-cyan-200 dark:border-emerald-800/60 dark:hover:bg-cyan-900/60 shadow-xs shadow-cyan-500/5',
 iconInactive: 'text-cyan-600 dark:text-cyan-400',
 iconBgInactive: 'bg-cyan-100/80 dark:bg-cyan-900/60',
 active: 'bg-white dark:bg-card-dark ring-2 ring-cyan-400 shadow-md shadow-cyan-500/35 scale-[1.02]',
 badgeInactive: 'bg-cyan-200/70 text-cyan-900 dark:bg-cyan-900/80 dark:text-cyan-200 border border-emerald-200/80 dark:border-emerald-800/60',
 badgeActive: 'bg-white/25 border border-emerald-200/30',
 topStripe: 'from-teal-500 via-cyan-400 to-blue-500',
 heroIcon: 'from-teal-500 via-cyan-600 to-blue-700 shadow-cyan-600/30',
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

export default function DivisiPendidikanDashboardPage() {
 const navigate = useNavigate()
 const [searchParams, setSearchParams] = useSearchParams()
 const [loading, setLoading] = useState(true)
 const [error, setError] = useState(null)
 const [data, setData] = useState(null)

 // Role Access & Multi-Unit Scope Handling
 const user = useAuthStore((state) => state.user)
 const userRoles = useMemo(() => {
 if (!user) return []
 if (Array.isArray(user.roles)) return user.roles.map((r) => (typeof r === 'string' ? r : r.name || ''))
 if (user.role) return [typeof user.role === 'string' ? user.role : user.role.name || '']
 return []
 }, [user])
 const userLevel = useMemo(() => getUserRoleLevel(user), [user])
 const isSuperAdminOrYayasan = userLevel <= ROLE_LEVELS.YAYASAN

 // Divisi Pendidikan can access and filter all units (or specific unit)
 const isDivisiPendidikan = useMemo(() => {
 if (isSuperAdminOrYayasan) return false
 return (
 userLevel === ROLE_LEVELS.DIVISI_PENDIDIKAN ||
 hasAnyRole(userRoles, ROLES.DIVISI) ||
 userRoles.some((r) => /divisi|bidang[\s_]*pendidikan|pengawasan[\s_]*akademik/i.test(r))
 )
 }, [userLevel, userRoles, isSuperAdminOrYayasan])

 // Can choose 'Semua Unit' and any education unit: Super Admin, Yayasan, Admin, and Divisi Pendidikan
 const canSelectUnit = isSuperAdminOrYayasan || isDivisiPendidikan
 const userUnitId = user?.unit_id || user?.education_unit_id || user?.employee?.unit_id || user?.metadata?.education_unit_id || user?.metadata?.unit_id || ''

 const [selectedUnitFilter, setSelectedUnitFilter] = useState(() => (!canSelectUnit && userUnitId ? String(userUnitId) : ''))

 useEffect(() => {
 if (!canSelectUnit && userUnitId && selectedUnitFilter !== String(userUnitId)) {
 setSelectedUnitFilter(String(userUnitId))
 }
 }, [canSelectUnit, userUnitId])

 // Units list pre-fetching with context fallback
 const [unitsList, setUnitsList] = useState([])

 useEffect(() => {
 educationUnitService.getDaftar({ per_page: 100 })
 .then((res) => {
 const items = res?.data || res || []
 if (Array.isArray(items)) setUnitsList(items)
 })
 .catch((e) => console.warn('Gagal memuat daftar unit pendidikan:', e))
 }, [])

 const allUnits = useMemo(() => {
 if (Array.isArray(data?.context?.units) && data.context.units.length > 0) {
 return data.context.units
 }
 return unitsList
 }, [data?.context?.units, unitsList])

 // In-Page Workspace State
 const tabParam = searchParams.get('tab') || ''
 const [activeWorkspaceTab, setActiveWorkspaceTab] = useState(tabParam)
 const workspaceRef = useRef(null)

 // Sync state if search param in URL changes
 useEffect(() => {
 if (tabParam !== activeWorkspaceTab) {
 setActiveWorkspaceTab(tabParam)
 }
 }, [tabParam])

 // State for KPI Pop-up Modal
 const [selectedKpiType, setSelectedKpiType] = useState(null)
 const [isKpiModalOpen, setIsKpiModalOpen] = useState(false)

 const handleKpiCardClick = (type) => {
 setSelectedKpiType(type)
 setIsKpiModalOpen(true)
 }

 const handleSelectTab = (key) => {
 setActiveWorkspaceTab(key)
 if (key) {
 setSearchParams({ tab: key }, { replace: true })
 setTimeout(() => {
 workspaceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
 }, 100)
 } else {
 const nextParams = new URLSearchParams(searchParams)
 nextParams.delete('tab')
 setSearchParams(nextParams, { replace: true })
 }
 }

 const moduleOptions = useMemo(() => [
 {
 value: '',
 label: 'Ringkasan Dashboard Saja (Tutup Workspace)',
 subtext: 'Tutup panel in-page dan fokus pada metrik KPI utama',
 },
 ...WORKSPACE_MODULES.map((m) => ({
 value: m.key,
 label: m.fullTitle,
 subtext: m.subtext,
 badge: m.tag,
 })),
 ], [])

 const fetchDashboard = async (unitId = selectedUnitFilter) => {
 setLoading(true)
 setError(null)
 try {
 const params = {}
 if (unitId && unitId !== 'all') {
 params.unit_id = unitId
 }
 const res = await managementDashboardService.getDivisiPendidikan(params)
 if (res && res.data) {
 setData(res.data)
 } else {
 setError('Format respon server tidak valid.')
 }
 } catch (err) {
 console.error('Failed to load Divisi Pendidikan dashboard:', err)
 setError(err.response?.data?.message || 'Gagal memuat data dashboard Divisi Pendidikan.')
 } finally {
 setLoading(false)
 }
 }

 useEffect(() => {
 fetchDashboard(selectedUnitFilter)
 }, [selectedUnitFilter])

 if (loading && !data) return <SkeletonDashboard />
 if (error && !data) return <ErrorState message={error} onRetry={fetchDashboard} />

 const kpis = data?.kpis || {}
 const context = data?.context || {}
 const charts = data?.charts || {}
 const tables = data?.tables || {}

 const formatNumber = (num) => (num !== undefined && num !== null ? Number(num).toLocaleString('id-ID') : '0')

 const activeModuleMeta = WORKSPACE_MODULES.find((m) => m.key === activeWorkspaceTab)

 return (
 <PageContainer maxW="7xl">
 <div className="mb-4 print:hidden">
 <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Divisi Pendidikan' }]} />
 </div>

 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
        {/* Header Halaman Modern Hero Card HeroUI */}
        <motion.div variants={itemVariants} className="print:hidden">
          <HeroUiHeader
            icon={GraduationCap}
            title="Dashboard Divisi Pendidikan"
            tag={{ text: 'Pengawasan Akademik SIT', icon: ShieldCheck }}
            description="Pusat analisis kinerja kurikulum, pemantauan unit pendidikan, rasio SDM/Siswa, dan pengawasan pelaporan akademik terpadu."
            actions={
              <div className="flex items-center gap-2">
                <UiTooltip content="Segarkan Data Monitoring">
                  <button
                    type="button"
                    onClick={() => fetchDashboard(selectedUnit)}
                    disabled={loading}
                    aria-label="Segarkan Data Monitoring"
                    className="size-9 flex items-center justify-center p-0 rounded-xl border-2 border-emerald-300/80 bg-white dark:bg-slate-900 text-emerald-800 dark:text-emerald-300 shadow-2xs hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={loading ? "size-4 animate-spin text-emerald-700" : "size-4 text-emerald-700 dark:text-emerald-300"} />
                  </button>
                </UiTooltip>
              </div>
            }
          />
        </motion.div>

 {/* Unit Scope Filter Bar with Hero UI Dropdown */}
 <motion.div
 variants={itemVariants}
 className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark p-4 shadow-sm dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-[#1B2433]"
 >
 <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border-2 border-emerald-300 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-700/80 dark:text-emerald-300 shadow-sm">
 <Building2 className="h-4.5 w-4.5" />
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
 Cakupan Analisis Unit Pendidikan
 </h3>
 <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold border ${
 selectedUnitFilter
 ? 'bg-emerald-100 text-emerald-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800/60'
 : 'bg-teal-100 text-teal-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-teal-950 dark:text-teal-300 dark:border-emerald-800/60'
 }`}>
 {selectedUnitFilter
 ? (allUnits.find((u) => String(u.id) === String(selectedUnitFilter))?.name || 'Unit Terpilih')
 : 'Semua Unit Pendidikan (Agregat Yayasan)'}
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 {canSelectUnit
 ? 'Pilih unit pendidikan spesifik atau tampilkan rekap agregat seluruh unit SIT.'
 : 'Akses terbatas sesuai wewenang unit pendidikan Anda.'}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
 <div className="w-full sm:w-72">
 <HeroUiFilterSelect
 label=""
 placeholder="Pilih Unit Pendidikan..."
 value={selectedUnitFilter}
 onChange={(val) => {
 if (canSelectUnit) {
 setSelectedUnitFilter(val)
 }
 }}
 disabled={!canSelectUnit}
 options={[
 { value: '', label: 'Semua Unit Pendidikan', subtext: 'Agregat seluruh unit pendidikan SIT' },
 ...allUnits.map((u) => ({
 value: String(u.id),
 label: u.name || u.nama,
 subtext: u.code || u.level || 'Unit Pendidikan',
 })),
 ]}
 />
 </div>

 {canSelectUnit && selectedUnitFilter && (
 <Button
 variant="outline"
 size="sm"
 onClick={() => setSelectedUnitFilter('')}
 className="h-9 shrink-0 gap-1.5 rounded-xl border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 hover:bg-emerald-100/60 dark:border-emerald-800/60 dark:text-emerald-300 dark:hover:bg-emerald-900/40 text-xs font-bold cursor-pointer"
 >
 <RefreshCcw className="h-3.5 w-3.5" />
 Reset Filter
 </Button>
 )}
 </div>
 </div>
 </motion.div>

 {/* KPI Cards Grid (Interactive Pop-up Modal on Click) */}
 <motion.section variants={itemVariants} className="space-y-2.5">
 <SectionHeader title="Kinerja & Evaluasi Pelaporan Akademik" subtitle="Ringkasan pemantauan unit, kepegawaian, dan pelaporan bulanan (Klik kartu untuk melihat detail pop-up)" />
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
 <ModernKpiCard
 title="Unit Dipantau"
 value={formatNumber(kpis.unit_monitored?.total)}
 subtext={selectedUnitFilter ? (allUnits.find((u) => String(u.id) === String(selectedUnitFilter))?.name || '1 Unit Terpilih') : `${formatNumber(kpis.unit_monitored?.total)} Unit Pendidikan Aktif`}
 icon={Building2}
 tone="emerald"
 tag={selectedUnitFilter ? '1 UNIT' : `${kpis.unit_monitored?.total || 15} UNIT`}
 onClick={() => handleKpiCardClick('unit_monitored')}
 />
 <ModernKpiCard
 title="Total Siswa Dipantau"
 value={formatNumber(kpis.total_siswa?.total)}
 subtext="Total siswa terdaftar"
 icon={Users}
 tone="sky"
 tag="SISWA"
 onClick={() => handleKpiCardClick('total_siswa')}
 />
 <ModernKpiCard
 title="Total Guru Pengajar"
 value={formatNumber(kpis.total_guru?.total)}
 subtext="Tenaga pendidik SIT"
 icon={GraduationCap}
 tone="purple"
 tag="GURU"
 onClick={() => handleKpiCardClick('total_guru')}
 />
 <ModernKpiCard
 title="Laporan Bulanan Masuk"
 value={formatNumber(kpis.laporan_bulanan_masuk?.total)}
 subtext="Laporan terverifikasi lengkap"
 icon={FileCheck}
 tone="teal"
 tag="LENGKAP"
 onClick={() => handleKpiCardClick('laporan_bulanan_masuk')}
 />
 <ModernKpiCard
 title="Laporan Belum Masuk"
 value={formatNumber(kpis.laporan_bulanan_belum?.total)}
 subtext="Menunggu submission unit"
 icon={AlertCircle}
 tone="rose"
 tag="PENDING"
 onClick={() => handleKpiCardClick('laporan_bulanan_belum')}
 />
 <ModernKpiCard
 title="Prestasi Siswa Terverifikasi"
 value={formatNumber(kpis.total_prestasi?.total)}
 subtext="Capaian prestasi siswa"
 icon={Award}
 tone="amber"
 tag="PRESTASI"
 onClick={() => handleKpiCardClick('total_prestasi')}
 />
 </div>
 </motion.section>

 {/* Akses Cepat Divisi Pendidikan & Hero UI Dropdown Selector */}
 <motion.section variants={itemVariants} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:bg-card-dark">
 <div className="flex flex-col gap-4">
 {/* Baris Atas: Info Header, Badges & Hero UI Dropdown Selector */}
 <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/50 dark:via-teal-950/20 dark:to-transparent -mx-5 -mt-5 mb-4 sm:-mx-6 sm:-mt-6 p-4 sm:p-5">
 <div className="space-y-1.5">
 <div className="flex items-center gap-2">
 <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-600/15 text-emerald-700 dark:bg-emerald-400/20 dark:text-emerald-300">
 <LayoutGrid className="h-3.5 w-3.5" />
 </span>
 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Akses Cepat Divisi Pendidikan</h3>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Pilih modul langsung di bawah untuk membuka panel instrumen kerja di halaman yang sama
 </p>
 {/* Detail Chips (Tahun Ajaran, Semester, Scope, Unit) */}
 <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
 <AppBadge variant="success" size="sm">
 {context.tahun_ajaran ? `Tahun Ajaran ${context.tahun_ajaran.nama}` : 'Tahun Ajaran 2026/2027'}
 </AppBadge>
 <AppBadge variant="info" size="sm">
 {context.semester ? `Semester ${context.semester.nama}` : 'Semester Ganjil'}
 </AppBadge>
 <AppBadge variant="purple" size="sm">
 Scope: Pengawasan Akademik
 </AppBadge>
 <AppBadge variant={selectedUnitFilter ? 'emerald' : 'sky'} size="sm">
 {selectedUnitFilter
 ? `Unit: ${allUnits.find((u) => String(u.id) === String(selectedUnitFilter))?.name || 'Unit Terpilih'}`
 : 'Semua Unit Pendidikan'}
 </AppBadge>
 </div>
 </div>

 {/* Dropdown List dengan Style Hero UI */}
 <div className="w-full lg:w-96 shrink-0 space-y-1">
 <label className="block text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
 Navigasi Modul (Hero UI Dropdown)
 </label>
 <HeroUiFilterSelect
 value={activeWorkspaceTab || ''}
 onChange={(val) => handleSelectTab(val)}
 options={moduleOptions}
 placeholder="Pilih Modul Workspace..."
 icon={LayoutGrid}
 searchable={true}
 allowClear={true}
 size="md"
 className="w-full"
 />
 </div>
 </div>

 {/* Baris Bawah: Pintasan Tombol Cepat In-Page */}
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
 Pintasan Cepat Modul (In-Page Trigger):
 </span>
 {activeWorkspaceTab && (
 <button
 type="button"
 onClick={() => handleSelectTab('')}
 className="inline-flex items-center gap-1 text-xs font-extrabold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
 >
 <X className="size-3" />
 Tutup Panel Workspace
 </button>
 )}
 </div>

 <div className="flex flex-wrap items-center gap-2 py-1">
 {WORKSPACE_MODULES.map((tab) => {
 const isActive = activeWorkspaceTab === tab.key
 const Icon = tab.icon
 const theme = MODULE_THEMES[tab.tone] || MODULE_THEMES.emerald
 return (
 <button
 key={tab.key}
 type="button"
 onClick={() => handleSelectTab(isActive ? '' : tab.key)}
 className={`group relative inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-black transition-all duration-200 cursor-pointer border ${
 isActive
 ? theme.active
 : theme.inactive
 }`}
 >
 <span className={`flex size-6 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-110 ${
 isActive ? 'bg-white/20' : theme.iconBgInactive
 }`}>
 <Icon className={`size-3.5 shrink-0 ${isActive ? 'text-white' : theme.iconInactive}`} />
 </span>
 <span className="tracking-tight">{tab.label}</span>
 <span className={`text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md transition-colors ${
 isActive ? theme.badgeActive : theme.badgeInactive
 }`}>
 {tab.tag}
 </span>
 {isActive && (
 <span className="size-1.5 rounded-full bg-white animate-pulse" />
 )}
 </button>
 )
 })}
 </div>
 </div>
 </div>
 </motion.section>

 {/* IN-PAGE WORKSPACE PANEL (Dirender langsung di halaman yang sama) */}
 <div ref={workspaceRef} />
 <AnimatePresence mode="wait">
 {activeWorkspaceTab && (
 <motion.section
 key={activeWorkspaceTab}
 initial={{ opacity: 0, y: 16, scale: 0.99 }}
 animate={{ opacity: 1, y: 0, scale: 1 }}
 exit={{ opacity: 0, y: -16, scale: 0.99 }}
 transition={{ duration: 0.25 }}
 className="relative overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 sm:p-6 shadow-xl shadow-sm dark:border-emerald-800/60 dark:bg-card-dark"
 >
 {/* Dynamic Top Gradient Stripe per Module */}

 {/* Header In-Page Workspace Panel */}
 <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 mb-5 border-b border-emerald-200/80 dark:border-emerald-800/80">
 <div className="flex items-start gap-3">
                  <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${(MODULE_THEMES[activeModuleMeta?.tone] || MODULE_THEMES.emerald).heroIcon} text-white shadow-md border-0`}>
 {activeModuleMeta?.icon && React.createElement(activeModuleMeta.icon, { className: 'size-5.5 text-white' })}
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
 {activeModuleMeta?.fullTitle}
 </h2>
 <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${(MODULE_THEMES[activeModuleMeta?.tone] || MODULE_THEMES.emerald).badgeInactive}`}>
 In-Page Workspace: {activeModuleMeta?.tag}
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 {activeModuleMeta?.subtext}
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
 <Button
 size="sm"
 variant="outline"
 onClick={() => handleSelectTab('')}
 className="text-xs font-bold rounded-xl border-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 text-slate-600 dark:text-slate-300 cursor-pointer"
 >
 <ChevronUp className="size-3.5 mr-1 text-slate-500" />
 Tutup Panel
 </Button>
 </div>
 </div>

 {/* Active Workspace Component */}
 <div className="relative z-10">
 {activeWorkspaceTab === 'supervisi-kbm' && <SupervisiKbmSection onDataMutate={fetchDashboard} />}
 {activeWorkspaceTab === 'kurasi-soal' && <KurasiBankSoalSection onDataMutate={fetchDashboard} />}
 {activeWorkspaceTab === 'tahfizh-munaqasyah' && <MunaqasyahTahfizhSection onDataMutate={fetchDashboard} />}
 {activeWorkspaceTab === 'bahasa-mufradat' && <PembiasaanBahasaSection onDataMutate={fetchDashboard} />}
 {activeWorkspaceTab === 'pelatihan-guru' && <PelatihanGuruSection onDataMutate={fetchDashboard} />}
 {activeWorkspaceTab === 'revisi-laporan' && <ReviewLaporanBulananSection onDataMutate={fetchDashboard} />}
 {activeWorkspaceTab === 'radar-akreditasi' && <RadarAkreditasiSection onDataMutate={fetchDashboard} />}
 {activeWorkspaceTab === 'supervisi-disiplin' && <DisciplineSupervisionSection />}
 </div>
 </motion.section>
 )}
 </AnimatePresence>

 {/* Rekapitulasi Prestasi Siswa Lintas Unit */}
 <motion.div variants={itemVariants}>
 <StudentAchievementRecapSection
 achievements={tables.rekap_prestasi || []}
 title="Rekapitulasi Prestasi Siswa Lintas Unit"
 subtitle="Monitoring capaian Tahfizh Al-Qur’an, Santri Pesantren, Sepakbola/Olahraga, dan Lomba Pembelajaran seluruh unit dipantau"
 onRefresh={fetchDashboard}
 />
 </motion.div>

 {/* Chart Section */}
 <motion.section variants={itemVariants} className="space-y-3">
 <SectionHeader title="Rasio SDM & Kesiswaan (Perbandingan Gender)" subtitle="Analisis demografi jenis kelamin SDM/Pegawai dan Siswa lintas unit sekolah" />
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
 {/* Chart 1: Rasio SDM */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 shadow-md shadow-emerald-500/10 dark:bg-card-dark">
 <div className="relative z-10 flex flex-col justify-between h-full">
 <div className="flex items-center justify-between mb-3 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/50 dark:via-teal-950/20 dark:to-transparent -mx-5 -mt-5 p-4 sm:p-5">
 <div>
 <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Rasio SDM (Pegawai & Guru) - Gender</h4>
 <p className="text-xs text-slate-500 dark:text-slate-400">Perbandingan jumlah pegawai Laki-laki dan Perempuan per unit</p>
 </div>
 <span className="rounded-lg bg-emerald-50 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
 SDM
 </span>
 </div>
 <div className="h-64 w-full pt-2">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={charts.sdm_gender || []}>
 <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
 <XAxis dataKey="name" stroke="#888888" fontSize={11} />
 <YAxis stroke="#888888" fontSize={11} />
 <Tooltip />
 <Bar dataKey="laki_laki" fill="#059669" name="Laki-laki" radius={[6, 6, 0, 0]} />
 <Bar dataKey="perempuan" fill="#8B5CF6" name="Perempuan" radius={[6, 6, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>

 {/* Chart 2: Rasio Siswa */}
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white p-5 shadow-md shadow-emerald-500/10 dark:bg-card-dark">
 <div className="relative z-10 flex flex-col justify-between h-full">
 <div className="flex items-center justify-between mb-3 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent dark:from-emerald-950/50 dark:via-teal-950/20 dark:to-transparent -mx-5 -mt-5 p-4 sm:p-5">
 <div>
 <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">Rasio Kesiswaan (Siswa) - Gender</h4>
 <p className="text-xs text-slate-500 dark:text-slate-400">Perbandingan jumlah siswa Laki-laki dan Perempuan per unit</p>
 </div>
 <span className="rounded-lg bg-sky-50 px-2.5 py-0.5 text-[10px] font-extrabold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
 Siswa
 </span>
 </div>
 <div className="h-64 w-full pt-2">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={charts.siswa_gender || []}>
 <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
 <XAxis dataKey="name" stroke="#888888" fontSize={11} />
 <YAxis stroke="#888888" fontSize={11} />
 <Tooltip />
 <Bar dataKey="laki_laki" fill="#0EA5E9" name="Laki-laki" radius={[6, 6, 0, 0]} />
 <Bar dataKey="perempuan" fill="#F43F5E" name="Perempuan" radius={[6, 6, 0, 0]} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </div>
 </div>
 </motion.section>

 {/* KPI Detail Pop-up Modal */}
 <DivisiPendidikanKpiModal
 type={selectedKpiType}
 isOpen={isKpiModalOpen}
 unitId={selectedUnitFilter}
 onClose={() => setIsKpiModalOpen(false)}
 />
 </motion.div>
 </PageContainer>
 )
}
