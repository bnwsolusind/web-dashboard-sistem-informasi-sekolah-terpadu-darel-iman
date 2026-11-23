import React, { useState, useEffect, useMemo } from 'react'
import {
  useNavigate,
  Link
} from 'react-router-dom'
import {
  motion
} from 'framer-motion'
import {
  Calendar,
  Users,
  BookOpen,
  FileCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  FileText,
  Award,
  CalendarDays,
  RefreshCw,
  Sparkles,
  ChevronRight,
  GraduationCap,
  HeartHandshake,
  Bell,
  MessageSquare,
  ShieldCheck,
  Building2,
  BookmarkCheck,
  Heart,
  Copy,
  Check
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts'

import api from '../services/api'
import {
  equranService
} from '../services/equranService'
import {
  useAuthStore
} from '../stores/authStore'
import {
  usePengaturanStore
} from '../stores/pengaturanStore'
import {
  resolveFoundationName
} from '../utils/printHelper'

// Standard App Components
import {
  PageContainer,
  AppBreadcrumb,
  KpiStatCard
} from '../components/app'

// HeroUI Core UI Components
import {
  Button
} from '@/components/ui/button'
import {
  Badge
} from '@/components/ui/badge'
import {
  Alert,
  AlertTitle,
  AlertDescription
} from '@/components/ui/alert'

// Framer Motion Animation Variants
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

// Modern HeroUI Card Color Schemes
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

function ModernTeacherKpiCard({
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

// Doa & Dzikir Harian Standar Pendidik
const DEFAULT_TEACHER_DOAS = [
 {
 id: 'doa-belajar',
 nama: 'Doa Sebelum Mengajar & Menuntut Ilmu',
 grup: 'Adab Mengajar',
 ar: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي',
 tr: 'Rabbisy-syrahlii shadrii, wa yassirlii amrii, wahlul uqdatam-mil-lisaanii, yafqahuu qawlii.',
 idn: 'Ya Rabbku, lapangkanlah untukku dadaku, dan mudahkanlah untukku urusanku, dan lepaskanlah kekakuan dari lidahku, supaya mereka mengerti perkataanku.',
 tentang: 'Doa Nabi Musa AS (QS Thaha: 25-28) yang dianjurkan dibaca guru sebelum memulai pelajaran agar materi tersampaikan dengan jelas, hikmah, dan mudah dipahami murid.',
 tag: 'Pembuka KBM',
 },
 {
 id: 'doa-ilmu-bermanfaat',
 nama: 'Doa Memohon Ilmu yang Bermanfaat & Amal Diterima',
 grup: 'Doa Pagi',
 ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا، وَرِزْقًا طَيِّبًا، وَعَمَلًا مُتَقَبَّلًا',
 tr: 'Allaahumma innii as-aluka ilman naafi’an, wa rizqan thayyiban, wa ‘amalan mutaqabbalan.',
 idn: 'Ya Allah, sesungguhnya aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang halal dan baik, serta amalan yang diterima di sisi-Mu.',
 tentang: 'Dibaca Nabi Muhammad SAW setelah salam shalat Subuh (HR. Ibnu Majah no. 925). Bekal spiritual utama guru sebelum memasuki gerbang sekolah.',
 tag: 'Dzikir Pagi',
 },
 {
 id: 'doa-kemudahan',
 nama: 'Doa Menghadapi Kesulitan Murid & Masalah KBM',
 grup: 'Pengelolaan Kelas',
 ar: 'اللَّهُمَّ لاَ سَهْلَ إِلاَّ مَا جَعَلْتَهُ سَهْلاً وَأَنْتَ تَجْعَلُ الحَزْنَ إِذَا شِئْتَ سَهْلاً',
 tr: 'Allaahumma laa sahla illaa maa ja’altahu sahlan, wa anta taj’alul hazna idzaa syi’ta sahlan.',
 idn: 'Ya Allah, tidak ada kemudahan kecuali apa yang Engkau jadikan mudah. Dan Engkau menjadikan kesedihan/kesulitan, jika Engkau kehendaki, menjadi mudah.',
 tentang: 'Dibaca saat menghadapi dinamika siswa yang lambat paham, kesulitan manajemen kelas, atau tantangan asesmen (HR. Ibnu Hibban no. 327).',
 tag: 'Solusi KBM',
 },
 {
 id: 'doa-kafaratul-majelis',
 nama: 'Doa Penutup Majelis (Kafaratul Majelis)',
 grup: 'Doa Penutup',
 ar: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ',
 tr: 'Subhaanakallaahumma wa bihamdika, asyhadu allaa ilaaha illaa anta, astaghfiruka wa atuubu ilaik.',
 idn: 'Maha Suci Engkau ya Allah, dan dengan memuji-Mu aku bersaksi bahwa tidak ada sesembahan yang berhak disembah selain Engkau, aku memohon ampunan kepada-Mu dan bertaubat kepada-Mu.',
 tentang: 'Dibaca setiap selesai sesi KBM di kelas atau rapat majelis guru untuk melebur dosa dan kelalaian selama sesi.',
 tag: 'Penutup KBM',
 },
]

export default function TeacherMonitoringDashboardPage() {
 const navigate = useNavigate()
 const user = useAuthStore((state) => state.user)
 const pengaturan = usePengaturanStore((state) => state.pengaturan)
 const foundationName = resolveFoundationName(pengaturan)

 const [loading, setLoading] = useState(true)
 const [refreshing, setRefreshing] = useState(false)
 const [error, setError] = useState(null)
 const [dashboardData, setDashboardData] = useState(null)
 const [currentTime, setCurrentTime] = useState(new Date())

 // State Doa & Dzikir Harian Pendidik
 const [selectedDoaIdx, setSelectedDoaIdx] = useState(0)
 const [copiedDoa, setCopiedDoa] = useState(false)
 const [doaCollection, setDoaCollection] = useState(DEFAULT_TEACHER_DOAS)

 // Fetch Doa dinamis dari backend equranService
 useEffect(() => {
 let isMounted = true
 equranService.getDoas({ per_page: 8 })
 .then((res) => {
 if (!isMounted) return
 if (res?.data && Array.isArray(res.data) && res.data.length > 0) {
 const apiItems = res.data.slice(0, 4).map((item) => ({
 id: item.id,
 nama: item.nama,
 grup: item.grup || 'Doa Harian',
 ar: item.ar || '',
 tr: item.tr || '',
 idn: item.idn || '',
 tentang: item.tentang || '',
 tag: item.tag || 'Katalog Doa',
 }))
 setDoaCollection((prev) => {
 const names = new Set(prev.map((p) => p.nama))
 const filtered = apiItems.filter((p) => !names.has(p.nama))
 return [...prev, ...filtered]
 })
 }
 })
 .catch((err) => {
 console.warn('Menggunakan doa standar pendidik:', err)
 })
 return () => {
 isMounted = false
 }
 }, [])

 const handleCopyDoa = (text) => {
 if (!text) return
 if (navigator?.clipboard?.writeText) {
 navigator.clipboard.writeText(text)
 setCopiedDoa(true)
 setTimeout(() => setCopiedDoa(false), 2000)
 }
 }

 // Update clock every minute
 useEffect(() => {
 const timer = setInterval(() => setCurrentTime(new Date()), 60000)
 return () => clearInterval(timer)
 }, [])

 const fetchDashboardData = async (isManual = false) => {
 if (isManual) setRefreshing(true)
 else setLoading(true)
 setError(null)
 try {
 const res = await api.get('/teacher/dashboard')
 if (res.data?.success && res.data?.data) {
 setDashboardData(res.data.data)
 } else {
 setError('Gagal memuat data statistik dashboard guru.')
 }
 } catch (err) {
 console.error('Failed to fetch teacher dashboard data:', err)
 setError(err?.response?.data?.message || 'Terjadi kesalahan saat memuat data dashboard.')
 } finally {
 setLoading(false)
 setRefreshing(false)
 }
 }

 useEffect(() => {
 fetchDashboardData()
 }, [])

 const teacher = dashboardData?.teacher || {}
 const academicContext = dashboardData?.academic_context || {}
 const kpis = dashboardData?.kpi || {}
 const schedulesToday = dashboardData?.schedules_today || []
 const announcements = dashboardData?.announcements || []
 const teacherLogs = dashboardData?.teacher_attendance_logs || []

 // Check today's teacher check-in status from logs
 const todayLog = useMemo(() => {
 const todayStr = new Date().toISOString().split('T')[0]
 return teacherLogs.find((l) => l.date === todayStr) || null
 }, [teacherLogs])

 // Chart Data: Attendance Real distribution or empty state
 const attendanceChartData = useMemo(() => {
 if (dashboardData?.attendance_trend && Array.isArray(dashboardData.attendance_trend)) {
 return dashboardData.attendance_trend
 }
 if (dashboardData?.charts?.attendance_trend && Array.isArray(dashboardData.charts.attendance_trend)) {
 return dashboardData.charts.attendance_trend
 }
 if (Array.isArray(teacherLogs) && teacherLogs.length > 0) {
 const dayMap = {}
 teacherLogs.forEach((l) => {
 const d = l.day || l.hari || (l.date ? new Date(l.date).toLocaleDateString('id-ID', { weekday: 'long' }) : 'Hari Ini')
 if (!dayMap[d]) dayMap[d] = { name: d, hadir: 0, sakit: 0, izin: 0, alpa: 0 }
 const st = String(l.status || '').toLowerCase()
 if (st.includes('hadir')) dayMap[d].hadir++
 else if (st.includes('sakit')) dayMap[d].sakit++
 else if (st.includes('izin')) dayMap[d].izin++
 else if (st.includes('alpa') || st.includes('alpha')) dayMap[d].alpa++
 else dayMap[d].hadir++
 })
 return Object.values(dayMap)
 }
 return []
 }, [dashboardData, teacherLogs])

 // Chart Data: Assignment Status
 const assignmentStatusData = useMemo(() => {
 const pending = Number(kpis.pending_grading_count || 0)
 const graded = Number(kpis.graded_count || 0)
 if (pending === 0 && graded === 0) return []
 return [
 { name: 'Sudah Dinilai', value: graded, color: '#10B981' },
 { name: 'Perlu Dinilai', value: pending, color: '#F59E0B' },
 ]
 }, [kpis])

 const formattedDate = useMemo(() => {
 return currentTime.toLocaleDateString('id-ID', {
 weekday: 'long',
 day: 'numeric',
 month: 'long',
 year: 'numeric',
 })
 }, [currentTime])

 const formattedTime = useMemo(() => {
 return currentTime.toLocaleTimeString('id-ID', {
 hour: '2-digit',
 minute: '2-digit',
 })
 }, [currentTime])

 if (loading && !dashboardData) {
 return (
 <PageContainer maxW="7xl">
 <div className="space-y-6 animate-pulse pb-12">
 <div className="h-9 w-64 rounded-xl bg-emerald-50 dark:bg-emerald-950/40" />
 <div className="h-44 rounded-xl bg-emerald-50 dark:bg-emerald-950/40" />
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
 {[...Array(5)].map((_, i) => (
 <div key={i} className="h-36 rounded-xl bg-emerald-50 dark:bg-emerald-950/40" />
 ))}
 </div>
 <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
 <div className="h-96 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 lg:col-span-2" />
 <div className="h-96 rounded-xl bg-emerald-50 dark:bg-emerald-950/40" />
 </div>
 </div>
 </PageContainer>
 )
 }

 return (
 <PageContainer maxW="7xl">
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6 pb-12">
 {/* Breadcrumb Navigation Complying with HeroUI Standard */}
 <motion.div variants={itemVariants} className="print:hidden">
 <AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Dashboard Pendidik & Pembelajaran' }]} />
 </motion.div>

 {error && (
 <motion.div variants={itemVariants}>
 <Alert status="error" className="rounded-xl border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 dark:border-emerald-800/60 dark:bg-rose-950/40">
 <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
 <div>
 <AlertTitle className="text-rose-800 dark:text-rose-200">Koneksi Terganggu</AlertTitle>
 <AlertDescription className="text-rose-700 dark:text-rose-300 text-xs mt-0.5">{error}</AlertDescription>
 </div>
 </Alert>
 </motion.div>
 )}

 {/* 1. HEROUI MODERN HERO CARD (GOLD BENCHMARK) */}
 <motion.div
 variants={itemVariants}
 className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden"
 >
 {/* Dual Multi-tone Ambient Glow Accent */}

 <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
 <div className="flex items-start gap-4 min-w-0">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 
            <GraduationCap className="size-6 sm:size-7 text-white" />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2.5 flex-wrap">
 <span className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50">
 
                  <ShieldCheck className="h-3.5 w-3.5 text-white" />
 Portal Guru &amp; Pendidik
 </span>
 <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-extrabold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
 TA {academicContext.academic_year || '2026/2027'} ({academicContext.semester || 'Ganjil'})
 </span>
 </div>
 <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
 Ahlan wa Sahlan, {teacher.name || user?.name || 'Ustadz / Ustadzah'}
 </h1>
 <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
 {teacher.education_unit || 'Unit Pendidikan Terpadu'} • NIP/NIY: <span className="font-mono font-bold text-slate-900 dark:text-white">{teacher.nip_niy || '-'}</span>
 </p>
 </div>
 </div>

 {/* Live Clock & Attendance Check-In Status Pill */}
 <div className="flex flex-wrap items-center gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/80 p-3 backdrop-blur-md dark:border-emerald-800/60 dark:bg-slate-900/80 shadow-xs shrink-0">
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300">
 <Clock className="h-4.5 w-4.5" />
 </div>
 <div>
 <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Waktu Sekolah</div>
 <div className="text-xs font-black text-slate-800 dark:text-slate-100 font-mono">
 {formattedDate.split(',')[0]}, {formattedTime} WIB
 </div>
 </div>
 </div>

 <div className="h-7 w-px bg-slate-200 dark:bg-slate-700" />

 <div className="flex items-center gap-2.5">
 <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${todayLog ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'}`}>
 {todayLog ? <CheckCircle2 className="h-4.5 w-4.5" /> : <AlertCircle className="h-4.5 w-4.5" />}
 </div>
 <div>
 <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Presensi Guru</div>
 <div className="text-xs font-black text-slate-800 dark:text-slate-100">
 {todayLog ? (todayLog.check_in ? `Hadir (${todayLog.check_in})` : 'Hadir') : 'Belum Check-In'}
 </div>
 </div>
 </div>
 </div>
 </div>
 </motion.div>

 {/* 2. SOFT PASTEL SQUIRCLE ACTION TOOLBAR HEADER (BENCHMARK HEROUI) */}
 <motion.div
 variants={itemVariants}
 className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/95 dark:bg-card-dark shadow-sm print:hidden"
 >
 <div>
 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
 <Sparkles className="size-4 text-emerald-600" />
 Aksi Cepat &amp; Pintasan Mengajar
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Pintas cepat presensi harian, modul ajar, tugas LMS, dan jurnal tahfizh
 </p>
 </div>

 <div className="flex items-center gap-2 flex-wrap shrink-0">
 {/* Input Presensi - Emerald */}
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Input Presensi Kelas Hari Ini"
 onClick={() => navigate('/portal-guru/workspace?tab=presensi')}
 className="flex size-10 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
 >
 <CheckCircle2 className="size-5" />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 Input Presensi
 </div>
 </div>

 {/* Modul Ajar - Sky */}
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Buka Modul & Materi Ajar"
 onClick={() => navigate('/portal-guru/workspace?tab=materi')}
 className="flex size-10 items-center justify-center rounded-xl bg-sky-100/90 text-sky-700 hover:bg-sky-200 dark:bg-sky-950/60 dark:text-sky-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
 >
 <BookOpen className="size-5" />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 Modul &amp; Materi Ajar
 </div>
 </div>

 {/* Buat Tugas LMS - Amber */}
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Buka & Buat Tugas LMS"
 onClick={() => navigate('/portal-guru/workspace?tab=penugasan')}
 className="flex size-10 items-center justify-center rounded-xl bg-amber-100/90 text-amber-700 hover:bg-amber-200 dark:bg-amber-950/60 dark:text-amber-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
 >
 <FileText className="size-5" />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 Penugasan LMS
 </div>
 </div>

 {/* Jurnal Tahfizh - Indigo */}
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Jurnal Setoran Tahfizh Santri"
 onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
 className="flex size-10 items-center justify-center rounded-xl bg-indigo-100/90 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
 >
 <BookmarkCheck className="size-5" />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 Jurnal Tahfizh
 </div>
 </div>

 {/* Segarkan Data - Violet */}
 <div className="group relative inline-flex">
 <button
 type="button"
 title="Segarkan Data Real-Time"
 onClick={() => fetchDashboardData(true)}
 className="flex size-10 items-center justify-center rounded-xl bg-purple-100/90 text-purple-700 hover:bg-purple-200 dark:bg-purple-950/60 dark:text-purple-300 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs"
 >
 <RefreshCw className={`size-5 ${refreshing ? 'animate-spin' : ''}`} />
 </button>
 <div className="pointer-events-none absolute top-full left-1/2 mt-2 -translate-x-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 ease-out z-50 whitespace-nowrap rounded-lg bg-emerald-950/95 border border-emerald-700/60 px-2.5 py-1 text-xs font-bold shadow-xl text-emerald-100 dark:bg-emerald-900/90 dark:text-emerald-100">
 Segarkan Data
 </div>
 </div>

 {/* Tombol Workspace KBM Utama */}
 <Link
 to="/portal-guru/workspace"
 className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-card-dark px-4 py-2 text-xs font-black shadow-sm hover:from-emerald-700 hover:to-teal-800 transition cursor-pointer"
 >
 <Sparkles className="size-4" />
 <span>Workspace KBM</span>
 </Link>
 </div>
 </motion.div>

 {/* 3. 5 MASTER KPI STATS GRID (HEROUI CARD STANDARD) */}
 <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 items-stretch">
 <ModernTeacherKpiCard
 tag="KBM"
 title="Jadwal Mengajar"
 value={`${kpis.schedules_today_count ?? schedulesToday.length ?? 0} Sesi`}
 subtext={`${kpis.total_classes || 0} rombel aktif dibina`}
 icon={Calendar}
 tone="emerald"
 onClick={() => navigate('/portal-guru/workspace?tab=jadwal')}
 />
 <ModernTeacherKpiCard
 tag="SISWA"
 title="Santri Bimbingan"
 value={`${kpis.total_students ?? 30} Siswa`}
 subtext="Rombel aktif mengajar"
 icon={Users}
 tone="teal"
 onClick={() => navigate('/portal-guru/workspace?tab=presensi')}
 />
 <ModernTeacherKpiCard
 tag="LMS"
 title="Tugas Perlu Koreksi"
 value={`${kpis.pending_grading_count ?? 0} Berkas`}
 subtext={`${Number(kpis.graded_count || 0)} tugas telah dinilai`}
 icon={FileCheck}
 tone="amber"
 onClick={() => navigate('/portal-guru/workspace?tab=penilaian')}
 />
 <ModernTeacherKpiCard
 tag="QUR'AN"
 title="Setoran Tahfizh"
 value={`${kpis.tahfizh_today_count ?? 0} Santri`}
 subtext="Jurnal tasmi' harian"
 icon={BookmarkCheck}
 tone="indigo"
 onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
 />
 <ModernTeacherKpiCard
 tag="ADAB"
 title="Verifikasi Mutaba'ah"
 value={`${kpis.unverified_mutabaah_count ?? 0} Draft`}
 subtext="Amalan yaumiyyah santri"
 icon={HeartHandshake}
 tone="rose"
 onClick={() => navigate('/portal-guru/workspace?tab=catatan')}
 />
 </motion.div>

 {/* 4. AGENDA HARI INI & WIDGET EDUKASI (3 COLUMN LAYOUT) */}
 <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
 
 {/* Kolom Kiri (2 Kolom Lebar) */}
 <div className="lg:col-span-2 space-y-6">
 
 {/* Widget 1: Jadwal Mengajar Hari Ini */}
 <motion.div
 variants={itemVariants}
 className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark"
 >
 <div className="flex flex-wrap items-center justify-between gap-3 p-5 border-b border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50">
 <div>
 <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <CalendarDays className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
 Jadwal Mengajar Hari Ini
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Daftar jam pelajaran tatap muka Anda pada hari {formattedDate.split(',')[0]}
 </p>
 </div>
 <Link
 to="/portal-guru/workspace?tab=jadwal"
 className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 transition"
 >
 Lihat Jadwal Lengkap <ArrowRight className="h-3.5 w-3.5" />
 </Link>
 </div>

 <div className="p-5 space-y-3">
 {schedulesToday.length === 0 ? (
 <div className="py-12 text-center rounded-xl border border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/20">
 <Calendar className="mx-auto h-9 w-10 text-emerald-300 dark:text-emerald-600" />
 <p className="mt-2 text-xs font-bold text-slate-700 dark:text-slate-200">
 Tidak Ada Jadwal Mengajar Hari Ini
 </p>
 <p className="text-xs text-slate-400 mt-0.5">
 Anda dapat memeriksa jadwal pekanan atau merancang materi ajar di Workspace KBM.
 </p>
 </div>
 ) : (
 schedulesToday.map((sch, idx) => {
 const subjectName = sch.subject?.name || sch.subject?.nama_mapel || 'Mata Pelajaran'
 const className = sch.kelas?.name || sch.kelas?.nama_kelas || 'Rombel'
 const timeRange = `${sch.time_start || '08:00'} - ${sch.time_end || '09:20'}`
 
 const [sh, sm] = (sch.time_start || '00:00').split(':').map(Number)
 const [eh, em] = (sch.time_end || '00:00').split(':').map(Number)
 const curMin = currentTime.getHours() * 60 + currentTime.getMinutes()
 const isNow = curMin >= (sh * 60 + sm) && curMin <= (eh * 60 + em)
 const isPassed = curMin > (eh * 60 + em)

 return (
 <div
 key={sch.id || idx}
 className={`group relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border p-4 transition-all duration-200 ${
 isNow
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark dark:border-emerald-800/60 dark:bg-emerald-950/40 shadow-xs'
 : isPassed
 ? 'border-emerald-200/60 bg-slate-50/50 dark:border-emerald-800/60 dark:bg-slate-900/40 opacity-75'
 : 'border-emerald-200/80 bg-white hover:border-emerald-300 dark:hover:border-emerald-700/80 dark:border-emerald-700/80/80 dark:bg-slate-800/60'
 }`}
 >
 <div className="flex items-start gap-3.5">
 <div
 className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl font-black text-xs ${
 isNow
 ? 'bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm'
 : isPassed
 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
 : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300'
 }`}
 >
 #{idx + 1}
 </div>
 <div>
 <div className="flex flex-wrap items-center gap-2">
 <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
 {subjectName}
 </h3>
 <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 {className}
 </span>
 {isNow && (
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white animate-pulse">
 Sedang Berlangsung
 </span>
 )}
 </div>
 <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
 <span className="flex items-center gap-1 font-mono">
 <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> {timeRange} WIB
 </span>
 <span>•</span>
 <span>{sch.total_hours || 2} Jam Pelajaran</span>
 </div>
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0">
 <button
 type="button"
 onClick={() => navigate(`/portal-guru/workspace?tab=presensi&schedule_id=${sch.id}`)}
 className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition cursor-pointer ${
 isNow
 ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
 : 'border border-emerald-200/80 dark:border-emerald-800/60 bg-white text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-emerald-300'
 }`}
 >
 <FileCheck className="h-3.5 w-3.5" />
 <span>{isNow ? 'Input Presensi Sekarang' : 'Buka Presensi'}</span>
 </button>
 </div>
 </div>
 )
 })
 )}
 </div>
 </motion.div>

 {/* Widget 2: Kartu Doa & Dzikir Harian Pendidik (Yaumiyah) */}
 <motion.div
 variants={itemVariants}
 className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark p-5"
 >
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4">
 <div className="flex items-center gap-3">
 <div className="flex h-9 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border-2 border-emerald-300 dark:bg-emerald-950/60 dark:border-emerald-700/80 dark:text-emerald-300 shadow-sm">
 <Heart className="h-5 w-5" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h2 className="text-base font-black text-slate-900 dark:text-white">
 Doa &amp; Dzikir Harian Pendidik
 </h2>
 <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
 Yaumiyah
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Bimbingan doa berkah sebelum mengajar, dzikir pagi, dan penutup majelis ilmu
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2">
 <Link
 to="/dashboard/master-doa"
 className="inline-flex items-center gap-1 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-emerald-300 transition"
 >
 <BookOpen className="h-3.5 w-3.5" />
 Katalog Doa
 </Link>
 <Link
 to="/dashboard/master-quran-surah"
 className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition"
 >
 <Sparkles className="h-3.5 w-3.5" />
 Al-Qur'an 30 Juz
 </Link>
 </div>
 </div>

 {/* Tab Navigasi Pilihan Doa */}
 <div className="mt-4 flex flex-wrap gap-1.5 border-b border-emerald-200/80 dark:border-emerald-800/80 pb-3 dark:border-emerald-700/80/60">
 {doaCollection.map((item, idx) => (
 <button
 key={item.id || idx}
 type="button"
 onClick={() => setSelectedDoaIdx(idx)}
 className={`rounded-xl px-3 py-1.5 text-xs font-bold transition cursor-pointer ${
 selectedDoaIdx === idx
 ? 'bg-emerald-600 text-white shadow-sm'
 : 'bg-white/80 text-slate-600 hover:bg-emerald-50 hover:text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-slate-700'
 }`}
 >
 {item.nama.split('(')[0].trim()}
 </button>
 ))}
 </div>

 {/* Konten Doa Aktif */}
 {doaCollection[selectedDoaIdx] && (() => {
 const currentDoa = doaCollection[selectedDoaIdx]
 const fullShareText = `${currentDoa.nama}\n\n${currentDoa.ar}\n\nLatin:\n${currentDoa.tr}\n\nArtinya:\n"${currentDoa.idn}"\n\nFadhilah:\n${currentDoa.tentang}`
 return (
 <div className="mt-4 space-y-3">
 <div className="flex items-center justify-between">
 <span className="rounded-lg bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800 dark:bg-teal-950/70 dark:text-teal-300">
 {currentDoa.grup || 'Doa Harian'}
 </span>
 <button
 type="button"
 onClick={() => handleCopyDoa(fullShareText)}
 className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 transition cursor-pointer"
 title="Salin Teks Doa"
 >
 {copiedDoa ? (
 <>
 <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
 <span className="text-emerald-600 dark:text-emerald-400">Tersalin!</span>
 </>
 ) : (
 <>
 <Copy className="h-3.5 w-3.5" />
 <span>Salin Teks</span>
 </>
 )}
 </button>
 </div>

 {/* Teks Arab */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-emerald-50/50 p-4 dark:border-emerald-200/80 dark:border-emerald-800/80 dark:bg-emerald-950/20">
 <p className="text-right font-serif text-xl sm:text-2xl leading-loose font-normal text-slate-900 dark:text-white" dir="rtl">
 {currentDoa.ar}
 </p>
 </div>

 {/* Transliterasi & Terjemahan */}
 <div className="space-y-1.5 rounded-xl bg-white/80 p-3.5 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-slate-900/60 dark:border-emerald-800/60">
 <p className="text-xs italic text-emerald-800 dark:text-emerald-300 font-medium">
 "{currentDoa.tr}"
 </p>
 <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
 <span className="font-bold">Artinya: </span>{currentDoa.idn}
 </p>
 </div>

 {/* Fadhilah / Keutamaan Hadits */}
 {currentDoa.tentang && (
 <div className="flex items-start gap-2 rounded-xl bg-amber-50/80 p-2.5 text-xs text-amber-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/30 dark:text-amber-200 dark:border-emerald-800/60">
 <Sparkles className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
 <div>
 <span className="font-bold">Keutamaan &amp; Riwayat: </span>
 <span>{currentDoa.tentang}</span>
 </div>
 </div>
 )}
 </div>
 )
 })()}
 </motion.div>

 {/* Widget 3: Grafik Analitik Kehadiran Siswa */}
 <motion.div
 variants={itemVariants}
 className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark p-5"
 >
 <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/80 pb-4 dark:border-emerald-800/60">
 <div>
 <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
 Tren Kehadiran Siswa di Kelas Anda
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Monitoring persentase kehadiran santri sepekan terakhir
 </p>
 </div>
 <div className="flex items-center gap-3 text-xs font-semibold">
 <span className="flex items-center gap-1 text-emerald-600"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Hadir</span>
 <span className="flex items-center gap-1 text-amber-500"><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Sakit/Izin</span>
 <span className="flex items-center gap-1 text-rose-500"><span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Alpa</span>
 </div>
 </div>

 <div className="mt-4 h-64 w-full flex items-center justify-center">
 {attendanceChartData.length > 0 ? (
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={attendanceChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
 <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} />
 <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#64748B' }} domain={[0, 100]} />
 <Tooltip
 contentStyle={{
 backgroundColor: "#0F172A",
 borderRadius: '12px',
 border: 'none',
 color: '#FFF',
 fontSize: '11px',
 }}
 />
 <Bar dataKey="hadir" fill="#10B981" radius={[6, 6, 0, 0]} barSize={28} />
 <Bar dataKey="sakit" fill="#F59E0B" radius={[6, 6, 0, 0]} barSize={28} />
 <Bar dataKey="alpa" fill="#EF4444" radius={[6, 6, 0, 0]} barSize={28} />
 </BarChart>
 </ResponsiveContainer>
 ) : (
 <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-slate-400">
 <Calendar className="mb-2 h-8 w-8 text-emerald-300 dark:text-emerald-600" />
 <p className="font-semibold text-slate-500 dark:text-slate-400">Belum ada rekaman presensi mengajar</p>
 <p className="text-xs text-slate-400">Log kehadiran harian kelas akan ditampilkan di sini.</p>
 </div>
 )}
 </div>
 </motion.div>
 </div>

 {/* Kolom Kanan (1 Kolom Samping) */}
 <div className="space-y-6">
 
 {/* Widget 4: Status Penugasan LMS */}
 <motion.div
 variants={itemVariants}
 className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark p-5"
 >
 <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <FileCheck className="h-5 w-5 text-amber-500" />
 Status Koreksi Tugas
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Evaluasi tugas siswa yang perlu dinilai
 </p>

 <div className="mt-4 h-48 w-full flex items-center justify-center">
 {assignmentStatusData.length > 0 ? (
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={assignmentStatusData}
 innerRadius={50}
 outerRadius={75}
 paddingAngle={5}
 dataKey="value"
 >
 {assignmentStatusData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={entry.color} />
 ))}
 </Pie>
 <Tooltip
 contentStyle={{
 backgroundColor: "#0F172A",
 borderRadius: '12px',
 border: 'none',
 color: '#FFF',
 fontSize: '11px',
 }}
 />
 </PieChart>
 </ResponsiveContainer>
 ) : (
 <div className="flex flex-col items-center justify-center py-6 text-center text-xs text-slate-400">
 <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-400/80" />
 <p className="font-semibold text-slate-600 dark:text-slate-300">Semua tugas telah dinilai</p>
 <p className="text-xs text-slate-400">Tidak ada antrean koreksi tugas saat ini.</p>
 </div>
 )}
 </div>

 <div className="space-y-2 pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center justify-between text-xs font-semibold">
 <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
 <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Sudah Selesai Dinilai
 </span>
 <span className="font-mono font-bold text-slate-900 dark:text-white">{Number(kpis.graded_count || 0)} Tugas</span>
 </div>
 <div className="flex items-center justify-between text-xs font-semibold">
 <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
 <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Menunggu Pemeriksaan
 </span>
 <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
 {kpis.pending_grading_count || 0} Tugas
 </span>
 </div>
 </div>

 <div className="mt-4">
 <button
 type="button"
 onClick={() => navigate('/portal-guru/workspace?tab=penilaian')}
 className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-2.5 text-xs font-bold text-white shadow-sm transition cursor-pointer"
 >
 <FileText className="h-4 w-4" /> Buka Menu Penilaian
 </button>
 </div>
 </motion.div>

 {/* Widget 5: Papan Pengumuman Sekolah */}
 <motion.div
 variants={itemVariants}
 className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark p-5"
 >
 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/80 pb-3 dark:border-emerald-800/60">
 <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
 Pengumuman Sekolah
 </h2>
 </div>

 <div className="mt-3 space-y-3">
 {announcements.length === 0 ? (
 <p className="text-xs text-slate-400 py-4 text-center">Belum ada pengumuman terbaru.</p>
 ) : (
 announcements.slice(0, 3).map((item, idx) => (
 <div key={item.id || idx} className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/30 p-3 dark:border-emerald-800/60 dark:bg-slate-900/50">
 <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
 <Building2 className="h-3 w-3" /> {item.target_unit || foundationName}
 </div>
 <h4 className="mt-1 text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">
 {item.judul || 'Pengumuman Guru'}
 </h4>
 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
 {item.konten || item.isi || '-'}
 </p>
 </div>
 ))
 )}
 </div>
 </motion.div>

 {/* Widget 6: Pintasan Belajar & Ibadah */}
 <motion.div
 variants={itemVariants}
 className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark p-5"
 >
 <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
 Pintasan Belajar &amp; Ibadah
 </h3>
 <p className="text-xs text-slate-500 mt-0.5">
 Akses cepat modul pengajaran &amp; ibadah harian:
 </p>
 <div className="mt-3 grid grid-cols-2 gap-2">
 <button
 type="button"
 onClick={() => navigate('/portal-guru/workspace?tab=materi')}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-white p-2.5 text-left text-xs font-bold text-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/50 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
 >
 <BookOpen className="h-4 w-4 text-emerald-600 mb-1" />
 <span>Modul Ajar</span>
 </button>
 <button
 type="button"
 onClick={() => navigate('/portal-guru/workspace?tab=penugasan')}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-white p-2.5 text-left text-xs font-bold text-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/50 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
 >
 <FileText className="h-4 w-4 text-emerald-600 mb-1" />
 <span>Buat Tugas</span>
 </button>
 <button
 type="button"
 onClick={() => navigate('/portal-guru/workspace?tab=tahfizh')}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-white p-2.5 text-left text-xs font-bold text-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/50 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
 >
 <BookmarkCheck className="h-4 w-4 text-indigo-600 mb-1" />
 <span>Jurnal Tahfizh</span>
 </button>
 <button
 type="button"
 onClick={() => navigate('/portal-guru/workspace?tab=catatan')}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/80 bg-white p-2.5 text-left text-xs font-bold text-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/50 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
 >
 <MessageSquare className="h-4 w-4 text-rose-600 mb-1" />
 <span>Catat Siswa</span>
 </button>
 <button
 type="button"
 onClick={() => navigate('/dashboard/master-quran-surah')}
 className="col-span-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-card-dark p-2.5 text-left text-xs font-bold text-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/80 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center justify-between"
 >
 <div className="flex items-center gap-2">
 <BookOpen className="h-4 w-4 text-emerald-600" />
 <span>Al-Qur'an (114 Surah)</span>
 </div>
 <ChevronRight className="h-3.5 w-3.5 text-emerald-600" />
 </button>
 <button
 type="button"
 onClick={() => navigate('/dashboard/master-doa')}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 text-left text-xs font-bold text-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/50 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
 >
 <Heart className="h-4 w-4 text-rose-500 mb-1" />
 <span>Doa &amp; Dzikir</span>
 </button>
 <button
 type="button"
 onClick={() => navigate('/dashboard/master-jadwal-sholat')}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-2.5 text-left text-xs font-bold text-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700/80 hover:bg-emerald-50/50 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
 >
 <Clock className="h-4 w-4 text-sky-600 mb-1" />
 <span>Jadwal Sholat</span>
 </button>
 </div>
 </motion.div>

 </div>

 </div>

 </motion.div>
 </PageContainer>
 )
}
