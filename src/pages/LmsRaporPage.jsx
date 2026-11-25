import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import {
  FileText,
  Award,
  BookOpen,
  Printer,
  Sparkles,
  Plus,
  Search,
  Filter,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Eye,
  RefreshCw,
  X,
  Users,
  Building2,
  Calendar,
  AlertCircle,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  ChevronLeft,
  ChevronRight,
  Share2,
  Check,
  GraduationCap
} from 'lucide-react'
import {
  Download as Download1,
  Upload as Upload1
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import {
  lmsRaporService
} from '../services/lmsRaporService'
import PageContainer from '../components/app/PageContainer'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import ActionDropdown from '../components/app/ActionDropdown'
import AppModal from '../components/app/AppModal'
import { KpiStatCard } from '../components/app'
import HeroUiFilterSelect from '../components/ui/HeroUiFilterSelect'
import {
  useDebounce
} from '../hooks/useDebounce'
import {
  SquircleActionButton,
  PrintOptionModal
} from '../components/master-data'
import {
  printCleanTable,
  downloadPdfTable
} from '../utils/printHelper'
import {
  exportCsv
} from '../components/reports/ReportKit'
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent
} from '../components/ui/hover-card'
import {
  Avatar,
  AvatarFallback
} from '../components/ui/avatar'
import {
  Badge
} from '../components/ui/badge'
import {
  Pagination
} from '../components/ui/pagination'
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter
} from '../components/ui/dialog'
import {
  Backdrop,
  OverlayWrapper
} from '../components/ui/dialog'
import {
  Button
} from '../components/ui/button'
import {
  TableRoot,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from '../components/ui/table'
import {
  DatePicker
} from '@/components/ui/date-picker'

const toneStyles = {
  emerald: {
    cardBg: '!bg-emerald-100/90 hover:!bg-emerald-200/70 dark:!bg-emerald-950/50 dark:hover:!bg-emerald-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-200/80',
    card: '!bg-emerald-100/90 hover:!bg-emerald-200/70 dark:!bg-emerald-950/50 dark:hover:!bg-emerald-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-200/80',
    iconBg: '!bg-emerald-600 !text-white shadow-sm dark:!bg-emerald-600 dark:!text-white',
    iconColor: '!text-white',
    badge: 'bg-white/90 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-emerald-900/80 dark:text-emerald-200',
    tag: 'bg-white/90 text-emerald-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-emerald-900/80 dark:text-emerald-200',
    title: 'text-emerald-800 dark:text-emerald-300',
    val: 'text-emerald-800 dark:text-emerald-200',
    sub: 'text-emerald-700/90 dark:text-emerald-300/80',
    cta: 'text-emerald-700 dark:text-emerald-400',
  },
  violet: {
    cardBg: '!bg-purple-100/90 hover:!bg-purple-200/70 dark:!bg-purple-950/50 dark:hover:!bg-purple-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-200/80',
    card: '!bg-purple-100/90 hover:!bg-purple-200/70 dark:!bg-purple-950/50 dark:hover:!bg-purple-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-200/80',
    iconBg: '!bg-purple-600 !text-white shadow-sm dark:!bg-purple-600 dark:!text-white',
    iconColor: '!text-white',
    badge: 'bg-white/90 text-purple-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-purple-900/80 dark:text-purple-200',
    tag: 'bg-white/90 text-purple-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-purple-900/80 dark:text-purple-200',
    title: 'text-purple-800 dark:text-purple-300',
    val: 'text-purple-800 dark:text-purple-200',
    sub: 'text-purple-700/90 dark:text-purple-300/80',
    cta: 'text-purple-700 dark:text-purple-400',
  },
  purple: {
    cardBg: '!bg-purple-100/90 hover:!bg-purple-200/70 dark:!bg-purple-950/50 dark:hover:!bg-purple-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-200/80',
    card: '!bg-purple-100/90 hover:!bg-purple-200/70 dark:!bg-purple-950/50 dark:hover:!bg-purple-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-200/80',
    iconBg: '!bg-purple-600 !text-white shadow-sm dark:!bg-purple-600 dark:!text-white',
    iconColor: '!text-white',
    badge: 'bg-white/90 text-purple-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-purple-900/80 dark:text-purple-200',
    tag: 'bg-white/90 text-purple-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-purple-900/80 dark:text-purple-200',
    title: 'text-purple-800 dark:text-purple-300',
    val: 'text-purple-800 dark:text-purple-200',
    sub: 'text-purple-700/90 dark:text-purple-300/80',
    cta: 'text-purple-700 dark:text-purple-400',
  },
  sky: {
    cardBg: '!bg-sky-100/90 hover:!bg-sky-200/70 dark:!bg-sky-950/50 dark:hover:!bg-sky-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-200/80',
    card: '!bg-sky-100/90 hover:!bg-sky-200/70 dark:!bg-sky-950/50 dark:hover:!bg-sky-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-200/80',
    iconBg: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-2xl',
    iconColor: '!text-white',
    badge: 'bg-white/90 text-sky-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-sky-900/80 dark:text-sky-200',
    tag: 'bg-white/90 text-sky-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-sky-900/80 dark:text-sky-200',
    title: 'text-sky-800 dark:text-sky-300',
    val: 'text-sky-800 dark:text-sky-200',
    sub: 'text-sky-700/90 dark:text-sky-300/80',
    cta: 'text-sky-700 dark:text-sky-400',
  },
  blue: {
    cardBg: '!bg-sky-100/90 hover:!bg-sky-200/70 dark:!bg-sky-950/50 dark:hover:!bg-sky-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-200/80',
    card: '!bg-sky-100/90 hover:!bg-sky-200/70 dark:!bg-sky-950/50 dark:hover:!bg-sky-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-200/80',
    iconBg: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/20 rounded-2xl',
    iconColor: '!text-white',
    badge: 'bg-white/90 text-sky-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-sky-900/80 dark:text-sky-200',
    tag: 'bg-white/90 text-sky-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-sky-900/80 dark:text-sky-200',
    title: 'text-sky-800 dark:text-sky-300',
    val: 'text-sky-800 dark:text-sky-200',
    sub: 'text-sky-700/90 dark:text-sky-300/80',
    cta: 'text-sky-700 dark:text-sky-400',
  },
  amber: {
    cardBg: '!bg-amber-100/90 hover:!bg-amber-200/70 dark:!bg-amber-950/50 dark:hover:!bg-amber-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-200/80',
    card: '!bg-amber-100/90 hover:!bg-amber-200/70 dark:!bg-amber-950/50 dark:hover:!bg-amber-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-200/80',
    iconBg: '!bg-amber-600 !text-white shadow-sm dark:!bg-amber-600 dark:!text-white',
    iconColor: '!text-white',
    badge: 'bg-white/90 text-amber-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-amber-900/80 dark:text-amber-200',
    tag: 'bg-white/90 text-amber-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-amber-900/80 dark:text-amber-200',
    title: 'text-amber-800 dark:text-amber-300',
    val: 'text-amber-800 dark:text-amber-200',
    sub: 'text-amber-700/90 dark:text-amber-300/80',
    cta: 'text-amber-700 dark:text-amber-400',
  },
  rose: {
    cardBg: '!bg-rose-100/90 hover:!bg-rose-200/70 dark:!bg-rose-950/50 dark:hover:!bg-rose-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-200/80',
    card: '!bg-rose-100/90 hover:!bg-rose-200/70 dark:!bg-rose-950/50 dark:hover:!bg-rose-950/70 border-emerald-200/80 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-200/80',
    iconBg: '!bg-rose-600 !text-white shadow-sm dark:!bg-rose-600 dark:!text-white',
    iconColor: '!text-white',
    badge: 'bg-white/90 text-rose-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-rose-900/80 dark:text-rose-200',
    tag: 'bg-white/90 text-rose-800 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs dark:bg-rose-900/80 dark:text-rose-200',
    title: 'text-rose-800 dark:text-rose-300',
    val: 'text-rose-800 dark:text-rose-200',
    sub: 'text-rose-700/90 dark:text-rose-300/80',
    cta: 'text-rose-700 dark:text-rose-400',
  },
}

/**
 * Authentic Official School Report Card Document Component
 * Rendered for on-screen modal preview (Lihat Rapor Digital & Cetak PDF)
 */
function OfficialRaporSheet({ digitalData }) {
 if (!digitalData) return null

 const school = digitalData.school_info || {}
 const siswa = digitalData.siswa || {}
 const rapor = digitalData.rapor || {}
 const wali = digitalData.wali_kelas || {}
 const mapelList = digitalData.nilai_mapel || []

 return (
 <div className="bg-white text-slate-900 p-6 sm:p-10 rounded-sm border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xl font-serif text-xs leading-relaxed space-y-5 max-w-4xl mx-auto my-2">
 {/* 1. KOP SURAT YAYASAN & SEKOLAH */}
 <div className="text-center border-b-4 border-double border-emerald-200/80 pb-4 space-y-1">
 <div className="flex items-center justify-center gap-3 mb-1">
 <div className="w-12 h-9 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-lg font-sans shadow-md">
 SIT
 </div>
 <div>
 <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 font-sans">YAYASAN DAREL IMAN PADANG</h2>
 <h1 className="text-lg font-semibold uppercase tracking-tight text-slate-900 font-sans">
 {school.name || 'SMP IT DAREL IMAN'}
 </h1>
 </div>
 </div>
 <p className="text-xs text-slate-600 font-sans">
 {school.address || 'Jl. Raya Utama Darel Iman, Kota Padang, Sumatera Barat'} | Telp: (0751) 123456
 </p>
 </div>

 {/* 2. JUDUL RAPOR */}
 <div className="text-center space-y-1 py-1">
 <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 underline font-serif">
 LAPORAN HASIL BELAJAR SISWA (RAPOR DIGITAL)
 </h2>
 <p className="text-xs font-sans text-slate-500 font-semibold">
 KURIKULUM MERDEKA / TERPADU • SEMESTER {rapor.semester?.nama || '1'} • TA {rapor.tahun_ajaran?.year || rapor.tahun_ajaran?.nama || '2026/2027'}
 </p>
 </div>

 {/* 3. IDENTITAS SISWA (TABEL RAPI 2-KOLOM) */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1.5 p-3.5 rounded-lg bg-slate-50/90 border border-emerald-200/80 dark:border-emerald-800/60 text-xs font-sans">
 <div className="flex">
 <span className="w-28 font-bold text-slate-600">Nama Siswa</span>
 <span className="font-bold text-slate-900">: {siswa.name || '-'}</span>
 </div>
 <div className="flex">
 <span className="w-28 font-bold text-slate-600">Kelas / Rombel</span>
 <span className="font-bold text-slate-900">: {rapor.kelas?.nama_kelas || '-'}</span>
 </div>
 <div className="flex">
 <span className="w-28 font-bold text-slate-600">NISN / NIS</span>
 <span className="font-semibold text-slate-800">: {siswa.nisn || '-'} / {siswa.nis || '-'}</span>
 </div>
 <div className="flex">
 <span className="w-28 font-bold text-slate-600">Semester</span>
 <span className="font-semibold text-slate-800">: {rapor.semester?.nama || '-'}</span>
 </div>
 <div className="flex">
 <span className="w-28 font-bold text-slate-600">Nama Sekolah</span>
 <span className="font-semibold text-slate-800">: {school.name || 'SMP IT DAREL IMAN'}</span>
 </div>
 <div className="flex">
 <span className="w-28 font-bold text-slate-600">Tahun Ajaran</span>
 <span className="font-semibold text-slate-800">: {rapor.tahun_ajaran?.year || '-'}</span>
 </div>
 </div>

 {/* 4. BAGIAN A: CAPAIAN AKADEMIK MATA PELAJARAN */}
 <div className="space-y-2">
 <h3 className="font-bold uppercase tracking-wider text-xs font-sans text-slate-900">
 A. CAPAIAN AKADEMIK MATA PELAJARAN
 </h3>
 <div className="overflow-x-auto">
 <table className="w-full border-collapse border border-emerald-200/80 text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="bg-slate-100 font-bold border-b border-emerald-200/80 text-slate-900 font-sans">
 <th className="border border-emerald-200/80 p-2 text-center w-8">No</th>
 <th className="border border-emerald-200/80 p-2 text-left">Mata Pelajaran</th>
 <th className="border border-emerald-200/80 p-2 text-center w-12">KKM</th>
 <th className="border border-emerald-200/80 p-2 text-center w-16">Nilai Akhir</th>
 <th className="border border-emerald-200/80 p-2 text-center w-14">Predikat</th>
 <th className="border border-emerald-200/80 p-2 text-left">Capaian Kompetensi / Catatan Perkembangan</th>
 </tr>
 </thead>
 <tbody>
 {mapelList.length === 0 ? (
 <tr>
 <td colSpan={6} className="border border-emerald-200/80 p-4 text-center text-slate-500 italic">
 Belum ada data nilai mata pelajaran.
 </td>
 </tr>
 ) : (
 mapelList.map((n, idx) => (
 <tr key={n.subject_id || idx} className="hover:bg-emerald-50/40">
 <td className="border border-emerald-200/80 p-2 text-center font-mono">{idx + 1}</td>
 <td className="border border-emerald-200/80 p-2 font-bold text-slate-900">{n.subject_name}</td>
 <td className="border border-emerald-200/80 p-2 text-center font-mono">{n.kkm ?? 75}</td>
 <td className="border border-emerald-200/80 p-2 text-center font-extrabold font-mono text-[#059669]">
 {n.final_score}
 </td>
 <td className="border border-emerald-200/80 p-2 text-center font-bold font-mono">{n.grade}</td>
 <td className="border border-emerald-200/80 p-2 text-slate-800 leading-snug">
 {n.catatan || 'Menunjukkan penguasaan kompetensi yang sangat baik dalam memahami materi pembelajaran.'}
 </td>
 </tr>
 ))
 )}
 </tbody>
 </table>
 </div>
 </div>

 {/* 5. BAGIAN B & C: KETIDAKHADIRAN & RANGKUMAN PRESTASI */}
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-1">
 <div>
 <h3 className="font-bold uppercase tracking-wider text-xs font-sans text-slate-900 mb-2">
 B. KETIDAKHADIRAN (PRESENSI)
 </h3>
 <table className="w-full border-collapse border border-emerald-200/80 text-xs">
 <tbody>
 <tr>
 <td className="border border-emerald-200/80 p-2 font-medium">Hadir (H)</td>
 <td className="border border-emerald-200/80 p-2 font-bold text-center w-24">
 {rapor.total_hadir ?? 0} Hari
 </td>
 </tr>
 <tr>
 <td className="border border-emerald-200/80 p-2 font-medium">Izin (I)</td>
 <td className="border border-emerald-200/80 p-2 font-bold text-center">
 {rapor.total_izin ?? 0} Hari
 </td>
 </tr>
 <tr>
 <td className="border border-emerald-200/80 p-2 font-medium">Sakit (S)</td>
 <td className="border border-emerald-200/80 p-2 font-bold text-center">
 {rapor.total_sakit ?? 0} Hari
 </td>
 </tr>
 <tr>
 <td className="border border-emerald-200/80 p-2 font-medium">Tanpa Keterangan (Alpha)</td>
 <td className="border border-emerald-200/80 p-2 font-bold text-center">
 {rapor.total_alpha ?? 0} Hari
 </td>
 </tr>
 </tbody>
 </table>
 </div>

 <div>
 <h3 className="font-bold uppercase tracking-wider text-xs font-sans text-slate-900 mb-2">
 C. RANGKUMAN PRESTASI & RANKING
 </h3>
 <table className="w-full border-collapse border border-emerald-200/80 text-xs">
 <tbody>
 <tr>
 <td className="border border-emerald-200/80 p-2 font-medium">Total Skor Kumulatif</td>
 <td className="border border-emerald-200/80 p-2 font-bold text-center w-24">
 {rapor.total_nilai ?? '-'}
 </td>
 </tr>
 <tr>
 <td className="border border-emerald-200/80 p-2 font-medium">Rata-Rata Nilai Akhir</td>
 <td className="border border-emerald-200/80 p-2 font-black text-center text-sm text-[#059669]">
 {rapor.rata_rata ?? '-'}
 </td>
 </tr>
 <tr>
 <td className="border border-emerald-200/80 p-2 font-medium">Peringkat di Kelas</td>
 <td className="border border-emerald-200/80 p-2 font-bold text-center">
 {rapor.peringkat_kelas ? `Ke-${rapor.peringkat_kelas} dari ${rapor.total_siswa_kelas || '-'} Siswa` : '-'}
 </td>
 </tr>
 <tr>
 <td className="border border-emerald-200/80 p-2 font-medium">Status Kelulusan KKM</td>
 <td className="border border-emerald-200/80 p-2 font-bold text-center text-emerald-700">
 TUNTAS
 </td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>

 {/* 6. BAGIAN D: CATATAN WALI KELAS */}
 <div className="space-y-1 pt-1">
 <h3 className="font-bold uppercase tracking-wider text-xs font-sans text-slate-900">
 D. CATATAN & REKOMENDASI WALI KELAS
 </h3>
 <div className="border border-emerald-200/80 p-3 rounded-sm bg-slate-50/50 italic text-xs leading-relaxed text-slate-800">
 "{rapor.catatan_wali_kelas || 'Tingkatkan terus semangat belajar dan pertahankan prestasi yang membanggakan.'}"
 </div>
 </div>

 {/* 7. LEMBAR TANDA TANGAN 3 PIHAK */}
 <div className="pt-8 grid grid-cols-3 gap-4 text-center text-xs font-semibold font-sans">
 <div>
 <p className="text-slate-700">Orang Tua / Wali Siswa</p>
 <div className="h-20"></div>
 <p className="border-b border-emerald-200/80 inline-block px-6 pb-0.5">( ................................ )</p>
 </div>
 <div>
 <p className="text-slate-700">Wali Kelas</p>
 <div className="h-20"></div>
 <p className="font-bold text-slate-900 border-b border-emerald-200/80 inline-block px-4 pb-0.5">
 {wali.name || 'Wali Kelas, S.Pd.'}
 </p>
 <p className="text-[10px] text-slate-600 font-mono mt-0.5">NIP: {wali.nip || '-'}</p>
 </div>
 <div>
 <p className="text-slate-700">Kepala Sekolah</p>
 <div className="h-20"></div>
 <p className="font-bold text-slate-900 border-b border-emerald-200/80 inline-block px-4 pb-0.5">
 {school.kepala_sekolah || 'Kepala Sekolah'}
 </p>
 <p className="text-[10px] text-slate-600 font-mono mt-0.5">NIP: {school.nip_kepsek || '-'}</p>
 </div>
 </div>
 </div>
 )
}

/**
 * Print & Download PDF Helper Function
 * Creates a clean, dedicated iframe to trigger A4 print dialog.
 */
function printRaporDocument(digitalData) {
 if (!digitalData) return

 const school = digitalData.school_info || {}
 const siswa = digitalData.siswa || {}
 const rapor = digitalData.rapor || {}
 const wali = digitalData.wali_kelas || {}
 const mapelList = digitalData.nilai_mapel || []

 const iframe = document.createElement('iframe')
 iframe.style.position = 'fixed'
 iframe.style.right = '0'
 iframe.style.bottom = '0'
 iframe.style.width = '0'
 iframe.style.height = '0'
 iframe.style.border = '0'
 document.body.appendChild(iframe)

 const doc = iframe.contentWindow.document
 doc.open()
 doc.write(`
 <!DOCTYPE html>
 <html>
 <head>
 <title>Rapor Digital - ${siswa.name || 'Siswa'}</title>
 <style>
 @page {
 size: A4 portrait;
 margin: 12mm 15mm 12mm 15mm;
 }
 body {
 font-family: 'Times New Roman', Times, serif;
 font-size: 10.5pt;
 color: #000;
 line-height: 1.35;
 margin: 0;
 padding: 0;
 }
 .header {
 text-align: center;
 border-bottom: 3px double #000;
 padding-bottom: 6px;
 margin-bottom: 12px;
 }
 .header-logo {
 font-family: Arial, sans-serif;
 font-size: 11pt;
 font-weight: bold;
 color: #059669;
 letter-spacing: 1px;
 margin-bottom: 2px;
 }
 .header h1 {
 font-size: 13pt;
 font-weight: bold;
 text-transform: uppercase;
 margin: 0;
 }
 .header p {
 font-size: 8.5pt;
 margin: 2px 0 0 0;
 font-family: Arial, sans-serif;
 }
 .title {
 text-align: center;
 font-size: 11.5pt;
 font-weight: bold;
 text-decoration: underline;
 text-transform: uppercase;
 margin: 8px 0 2px 0;
 }
 .subtitle {
 text-align: center;
 font-size: 9.5pt;
 font-family: Arial, sans-serif;
 margin-bottom: 12px;
 }
 .meta-table {
 width: 100%;
 margin-bottom: 12px;
 border-collapse: collapse;
 font-family: Arial, sans-serif;
 background-color: #fafafa;
 border: 1px solid #ccc;
 }
 .meta-table td {
 padding: 4px 8px;
 vertical-align: top;
 font-size: 9.5pt;
 }
 .section-title {
 font-size: 10pt;
 font-weight: bold;
 text-transform: uppercase;
 font-family: Arial, sans-serif;
 margin: 12px 0 5px 0;
 }
 table.data-table {
 width: 100%;
 border-collapse: collapse;
 margin-bottom: 10px;
 }
 table.data-table th, table.data-table td {
 border: 1px solid #000;
 padding: 4px 6px;
 font-size: 9.5pt;
 }
 table.data-table th {
 background-color: #eaeaea;
 font-weight: bold;
 text-align: center;
 font-family: Arial, sans-serif;
 }
 .text-center { text-align: center; }
 .text-left { text-align: left; }
 .font-bold { font-weight: bold; }
 .grid-2 {
 display: table;
 width: 100%;
 margin-top: 6px;
 }
 .grid-2-col {
 display: table-cell;
 width: 49%;
 vertical-align: top;
 }
 .grid-2-gap {
 display: table-cell;
 width: 2%;
 }
 .signatures {
 margin-top: 30px;
 display: table;
 width: 100%;
 text-align: center;
 font-size: 9.5pt;
 font-family: Arial, sans-serif;
 }
 .signatures > div {
 display: table-cell;
 width: 33%;
 vertical-align: top;
 }
 .sig-space {
 height: 50px;
 }
 </style>
 </head>
 <body>
 <div class="header">
 <div class="header-logo">YAYASAN DAREL IMAN PADANG</div>
 <h1>${school.name || 'SMP IT DAREL IMAN'}</h1>
 <p>${school.address || 'Jl. Raya Utama Darel Iman, Kota Padang, Sumatera Barat'}</p>
 </div>

 <div class="title">LAPORAN HASIL BELAJAR SISWA (RAPOR DIGITAL)</div>
 <div class="subtitle">KURIKULUM MERDEKA • SEMESTER ${rapor.semester?.nama || '1'} • TA ${rapor.tahun_ajaran?.year || rapor.tahun_ajaran?.nama || '2026/2027'}</div>

 <table class="meta-table">
 <tr>
 <td width="15%"><strong>Nama Siswa</strong></td>
 <td width="35%">: <strong>${siswa.name || '-'}</strong></td>
 <td width="18%"><strong>Kelas / Rombel</strong></td>
 <td width="32%">: <strong>${rapor.kelas?.nama_kelas || '-'}</strong></td>
 </tr>
 <tr>
 <td><strong>NISN / NIS</strong></td>
 <td>: ${siswa.nisn || '-'} / ${siswa.nis || '-'}</td>
 <td><strong>Semester / TA</strong></td>
 <td>: ${rapor.semester?.nama || '-'} • ${rapor.tahun_ajaran?.year || '-'}</td>
 </tr>
 </table>

 <div class="section-title">A. CAPAIAN AKADEMIK MATA PELAJARAN</div>
 <table class="data-table">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th width="4%">No</th>
 <th width="32%" class="text-left">Mata Pelajaran</th>
 <th width="8%">KKM</th>
 <th width="10%">Nilai</th>
 <th width="9%">Predikat</th>
 <th width="37%" class="text-left">Capaian Kompetensi / Catatan</th>
 </tr>
 </thead>
 <tbody>
 ${mapelList.map((n, idx) => `
 <tr>
 <td class="text-center">${idx + 1}</td>
 <td class="font-bold">${n.subject_name || '-'}</td>
 <td class="text-center">${n.kkm ?? 75}</td>
 <td class="text-center font-bold">${n.final_score ?? '-'}</td>
 <td class="text-center font-bold">${n.grade ?? '-'}</td>
 <td>${n.catatan || 'Menunjukkan penguasaan kompetensi yang sangat baik'}</td>
 </tr>
 `).join('')}
 </tbody>
 </table>

 <div class="grid-2">
 <div class="grid-2-col">
 <div class="section-title">B. KETIDAKHADIRAN (PRESENSI)</div>
 <table class="data-table">
 <tbody>
 <tr><td>Hadir (H)</td><td class="text-center font-bold" width="35%">${rapor.total_hadir ?? 0} Hari</td></tr>
 <tr><td>Izin (I)</td><td class="text-center font-bold">${rapor.total_izin ?? 0} Hari</td></tr>
 <tr><td>Sakit (S)</td><td class="text-center font-bold">${rapor.total_sakit ?? 0} Hari</td></tr>
 <tr><td>Tanpa Keterangan (Alpha)</td><td class="text-center font-bold">${rapor.total_alpha ?? 0} Hari</td></tr>
 </tbody>
 </table>
 </div>

 <div class="grid-2-gap"></div>

 <div class="grid-2-col">
 <div class="section-title">C. RANGKUMAN PRESTASI & RANKING</div>
 <table class="data-table">
 <tbody>
 <tr><td>Total Skor Kumulatif</td><td class="text-center font-bold" width="35%">${rapor.total_nilai ?? '-'}</td></tr>
 <tr><td>Rata-Rata Nilai Akhir</td><td class="text-center font-bold">${rapor.rata_rata ?? '-'}</td></tr>
 <tr><td>Peringkat di Kelas</td><td class="text-center font-bold">${rapor.peringkat_kelas ? `Ke-${rapor.peringkat_kelas} (${rapor.total_siswa_kelas || '-'} Siswa)` : '-'}</td></tr>
 </tbody>
 </table>
 </div>
 </div>

 <div class="section-title">D. CATATAN & REKOMENDASI WALI KELAS</div>
 <div style="border: 1px solid #000; padding: 6px 10px; font-style: italic; font-size: 9.5pt; background: #fafafa;">
 "${rapor.catatan_wali_kelas || 'Tingkatkan terus semangat belajar dan pertahankan prestasi yang membanggakan.'}"
 </div>

 <div class="signatures">
 <div>
 <p>Orang Tua / Wali Siswa</p>
 <div class="sig-space"></div>
 <p><u>( ................................ )</u></p>
 </div>
 <div>
 <p>Wali Kelas</p>
 <div class="sig-space"></div>
 <p><u><b>${wali.name || 'Wali Kelas, S.Pd.'}</b></u></p>
 <p style="font-size: 8pt; margin-top: 2px;">NIP: ${wali.nip || '-'}</p>
 </div>
 <div>
 <p>Kepala Sekolah</p>
 <div class="sig-space"></div>
 <p><u><b>${school.kepala_sekolah || 'Kepala Sekolah'}</b></u></p>
 <p style="font-size: 8pt; margin-top: 2px;">NIP: ${school.nip_kepsek || '-'}</p>
 </div>
 </div>
 </body>
 </html>
 `)
 doc.close()

 setTimeout(() => {
 iframe.contentWindow.focus()
 iframe.contentWindow.print()
 setTimeout(() => {
 document.body.removeChild(iframe)
 }, 1000)
 }, 300)
}

function HarmonizedDeleteRaporModal({ isOpen, onClose, onConfirm, item, isSubmitting }) {
 return (
 <AppModal
 isOpen={Boolean(isOpen && item)}
 onClose={onClose}
 title="Hapus Data Rapor?"
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
 className="h-9 px-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition cursor-pointer"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={onConfirm}
 disabled={isSubmitting}
 className="h-9 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold shadow-sm transition cursor-pointer disabled:opacity-50"
 >
 {isSubmitting ? 'Menghapus...' : 'Ya, Hapus Rapor'}
 </button>
 </>
 }
 >
 {item && (
 <>
 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
 Apakah Anda yakin ingin menghapus data rapor siswa <strong className="text-slate-900 dark:text-white">{item.siswa?.nama_lengkap || item.siswa_nama || 'ini'}</strong>?
 </p>
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 p-3 dark:border-emerald-800/60 dark:bg-rose-950/20">
 <div className="flex items-start gap-2">
 <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
 <p className="text-xs text-rose-800 dark:text-rose-300">
 Data rapor yang terhapus tidak dapat dipulihkan. Nilai dapat dihitung ulang jika diperlukan.
 </p>
 </div>
 </div>
 </>
 )}
 </AppModal>
 )
}

export default function LmsRaporPage({ tabNav = null }) {
 const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, item: null, isSubmitting: false })
 const [dataList, setDataList] = useState([])
 const [loading, setLoading] = useState(true)
 const [pagination, setPagination] = useState({ currentPage: 1, lastPage: 1, total: 0 })
 const [stats, setStats] = useState({
 total_rapor: 0,
 diterbitkan: 0,
 draft: 0,
 final: 0,
 direvisi: 0,
 rata_rata_sekolah: 0,
 })
 const [options, setOptions] = useState({
 students: [],
 kelases: [],
 semesters: [],
 tahun_ajarans: [],
 employees: [],
 })

 const [filters, setFilters] = useState({
 search: '',
 kelas_id: '',
 semester_id: '',
 tahun_ajaran_id: '',
 status_rapor: '',
 })

 // Debounced search for API query prevention
 const debouncedSearch = useDebounce(filters.search, 350)

 // Modals state
 const [showFormModal, setShowFormModal] = useState(false)
 const [showGenerateModal, setShowGenerateModal] = useState(false)
 const [showDigitalModal, setShowDigitalModal] = useState(false)
 const [showPrintModal, setShowPrintModal] = useState(false)

 const [editingItem, setEditingItem] = useState(null)
 const [digitalData, setDigitalData] = useState(null)
 const [loadingDigital, setLoadingDigital] = useState(false)

 // Card Drill-Down Modal State
 const [cardModal, setCardModal] = useState({
 isOpen: false,
 statusKey: 'semua',
 title: '',
 tone: 'emerald',
 searchQuery: '',
 page: 1,
 })

 // Print Filter & Student Selection Modal State
 const [isPrintFilterModalOpen, setIsPrintFilterModalOpen] = useState(false)
 const [selectedStudentIds, setSelectedStudentIds] = useState([])
 const [selectedFields, setSelectedFields] = useState({
 mapel: true,
 rata_rata: true,
 ranking: true,
 presensi: true,
 status: true,
 })
 const [printSearchQuery, setPrintSearchQuery] = useState('')

 // Import Modal State
 const [isImportModalOpen, setIsImportModalOpen] = useState(false)
 const [importFile, setImportFile] = useState(null)
 const [isImporting, setIsImporting] = useState(false)
 const [importError, setImportError] = useState('')
 const importInputRef = useRef(null)

 // Form State
 const [formData, setFormData] = useState({
 siswa_id: '',
 kelas_id: '',
 semester_id: '',
 tahun_ajaran_id: '',
 guru_wali_id: '',
 catatan_wali_kelas: '',
 catatan_kepala_sekolah: '',
 status_rapor: 'draft',
 tanggal_terbit: new Date().toISOString().split('T')[0],
 })

 // Generate State
 const [generateData, setGenerateData] = useState({
 kelas_id: '',
 semester_id: '',
 tahun_ajaran_id: '',
 })
 const [generating, setGenerating] = useState(false)

 useEffect(() => {
 fetchOptions()
 }, [])

 useEffect(() => {
 fetchStats()
 fetchData(1)
 }, [debouncedSearch, filters.kelas_id, filters.semester_id, filters.tahun_ajaran_id, filters.status_rapor])

 const showToastNotification = (message, type = 'success') => {
 setToast({ show: true, message, type })
 setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000)
 }

 const getRowId = useCallback((r, idx) => r.id ?? r.siswa_id ?? r.siswa?.id ?? `rapor-${idx}`, [])

 const fetchOptions = async () => {
 try {
 const res = await lmsRaporService.getOptions()
 if (res.success) {
 setOptions(res.data)
 if (res.data.kelases.length > 0 && res.data.semesters.length > 0 && res.data.tahun_ajarans.length > 0) {
 setGenerateData({
 kelas_id: res.data.kelases[0].id,
 semester_id: res.data.semesters[0].id,
 tahun_ajaran_id: res.data.tahun_ajarans[0].id,
 })
 }
 }
 } catch (err) {
 console.error('Failed to load options', err)
 }
 }

 const fetchStats = async () => {
 try {
 const res = await lmsRaporService.getStats({
 ...filters,
 search: debouncedSearch,
 })
 if (res.success) {
 setStats(res.data)
 }
 } catch (err) {
 console.error('Failed to load stats', err)
 }
 }

 const fetchData = async (page = 1) => {
 setLoading(true)
 try {
 const params = {
 page,
 per_page: 15,
 ...filters,
 search: debouncedSearch,
 }
 const res = await lmsRaporService.getDaftar(params)
 if (res.data) {
 setDataList(res.data)
 if (res.meta) {
 setPagination({
 currentPage: res.meta.current_page,
 lastPage: res.meta.last_page,
 total: res.meta.total,
 })
 }
 }
 } catch (err) {
 showToastNotification('Gagal memuat data Rapor Digital.', 'error')
 } finally {
 setLoading(false)
 }
 }

 const handleOpenCreateModal = () => {
 setEditingItem(null)
 setFormData({
 siswa_id: options.students[0]?.id || '',
 kelas_id: options.kelases[0]?.id || '',
 semester_id: options.semesters[0]?.id || '',
 tahun_ajaran_id: options.tahun_ajarans[0]?.id || '',
 guru_wali_id: options.employees[0]?.id || '',
 catatan_wali_kelas: 'Tingkatkan semangat belajar dan terus berprestasi.',
 catatan_kepala_sekolah: 'Pertahankan pencapaian yang baik ini.',
 status_rapor: 'draft',
 tanggal_terbit: new Date().toISOString().split('T')[0],
 })
 setShowFormModal(true)
 }

 const handleOpenEditModal = (item) => {
 setEditingItem(item)
 setFormData({
 siswa_id: item.siswa_id || '',
 kelas_id: item.kelas_id || '',
 semester_id: item.semester_id || '',
 tahun_ajaran_id: item.tahun_ajaran_id || '',
 guru_wali_id: item.guru_wali_id || '',
 catatan_wali_kelas: item.catatan_wali_kelas || '',
 catatan_kepala_sekolah: item.catatan_kepala_sekolah || '',
 status_rapor: item.status_rapor || 'draft',
 tanggal_terbit: item.tanggal_terbit || new Date().toISOString().split('T')[0],
 })
 setShowFormModal(true)
 }

 const handleSaveRapor = async (e) => {
 e.preventDefault()
 try {
 if (editingItem) {
 const res = await lmsRaporService.update(editingItem.id, formData)
 if (res.success) {
 showToastNotification('Catatan & Status Rapor Digital berhasil diperbarui.')
 }
 } else {
 const res = await lmsRaporService.create(formData)
 if (res.success) {
 showToastNotification('Rapor Digital Siswa berhasil ditambahkan.')
 }
 }
 setShowFormModal(false)
 fetchData(pagination.currentPage)
 fetchStats()
 } catch (err) {
 showToastNotification('Gagal menyimpan data Rapor.', 'error')
 }
 }

 const handleGenerateClass = async (e) => {
 e.preventDefault()
 setGenerating(true)
 try {
 const res = await lmsRaporService.generateKelas(generateData)
 if (res.success) {
 showToastNotification(`Berhasil membuat Rapor Digital untuk ${res.total_generated || 0} siswa.`)
 setShowGenerateModal(false)
 fetchData(1)
 fetchStats()
 }
 } catch (err) {
 showToastNotification('Gagal melakukan kalkulasi Rapor Kelas.', 'error')
 } finally {
 setGenerating(false)
 }
 }

 const handleDelete = (id, item) => {
 setDeleteModal({ isOpen: true, id, item, isSubmitting: false })
 }

 const confirmDelete = async () => {
 if (!deleteModal.id) return
 setDeleteModal((prev) => ({ ...prev, isSubmitting: true }))
 try {
 const res = await lmsRaporService.delete(deleteModal.id)
 if (res.success) {
 showToastNotification('Rapor Digital berhasil dihapus.')
 fetchData(pagination.currentPage)
 fetchStats()
 }
 } catch (err) {
 showToastNotification('Gagal menghapus Rapor.', 'error')
 } finally {
 setDeleteModal({ isOpen: false, id: null, item: null, isSubmitting: false })
 }
 }

 const handleViewDigitalRapor = async (id) => {
 setLoadingDigital(true)
 setShowDigitalModal(true)
 try {
 const res = await lmsRaporService.getPdf(id)
 if (res.success) {
 setDigitalData(res.data)
 }
 } catch (err) {
 showToastNotification('Gagal memuat Rapor Digital.', 'error')
 } finally {
 setLoadingDigital(false)
 }
 }

 const handleOpenPrintPreview = async (id) => {
 setLoadingDigital(true)
 setShowPrintModal(true)
 try {
 const res = await lmsRaporService.getPdf(id)
 if (res.success) {
 setDigitalData(res.data)
 }
 } catch (err) {
 showToastNotification('Gagal memuat data cetak Rapor.', 'error')
 } finally {
 setLoadingDigital(false)
 }
 }

 const openCardModal = (statusKey, label, tone) => {
 setCardModal({
 isOpen: true,
 statusKey,
 title: `Rincian Rapor Siswa — ${label}`,
 tone,
 searchQuery: '',
 page: 1,
 })
 }

 const closeCardModal = () => {
 setCardModal((prev) => ({ ...prev, isOpen: false }))
 }

 const modalRows = useMemo(() => {
 if (!cardModal.isOpen) return []
 let list = [...dataList]

 if (cardModal.statusKey === 'diterbitkan') {
 list = list.filter((r) => r.status_rapor === 'diterbitkan')
 } else if (cardModal.statusKey === 'draft') {
 list = list.filter((r) => r.status_rapor === 'draft')
 } else if (cardModal.statusKey === 'final') {
 list = list.filter((r) => r.status_rapor === 'final')
 } else if (cardModal.statusKey === 'direvisi') {
 list = list.filter((r) => r.status_rapor === 'direvisi')
 }

 if (cardModal.searchQuery.trim()) {
 const q = cardModal.searchQuery.toLowerCase().trim()
 list = list.filter((r) => {
 const name = (r.siswa?.name || r.siswa?.full_name || '').toLowerCase()
 const nis = (r.siswa?.nis || '').toLowerCase()
 const kelas = (r.kelas?.nama_kelas || '').toLowerCase()
 return name.includes(q) || nis.includes(q) || kelas.includes(q)
 })
 }
 return list
 }, [dataList, cardModal.isOpen, cardModal.statusKey, cardModal.searchQuery])

 const MODAL_PAGE_SIZE = 5
 const modalTotalPages = Math.max(1, Math.ceil(modalRows.length / MODAL_PAGE_SIZE))
 const paginatedModalRows = useMemo(() => {
 return modalRows.slice((cardModal.page - 1) * MODAL_PAGE_SIZE, cardModal.page * MODAL_PAGE_SIZE)
 }, [modalRows, cardModal.page])

 const openPrintFilterModal = () => {
 setSelectedStudentIds(dataList.map((r, idx) => getRowId(r, idx)))
 setPrintSearchQuery('')
 setIsPrintFilterModalOpen(true)
 }

 const filteredPrintStudents = useMemo(() => {
 if (!printSearchQuery.trim()) return dataList
 const q = printSearchQuery.toLowerCase().trim()
 return dataList.filter((r) => {
 const name = (r.siswa?.name || r.siswa?.full_name || '').toLowerCase()
 const nis = (r.siswa?.nis || '').toLowerCase()
 const kelas = (r.kelas?.nama_kelas || '').toLowerCase()
 return name.includes(q) || nis.includes(q) || kelas.includes(q)
 })
 }, [dataList, printSearchQuery])

 const handleSelectAllPrintStudents = (e) => {
 if (e.target.checked) {
 setSelectedStudentIds(dataList.map((r, idx) => getRowId(r, idx)))
 } else {
 setSelectedStudentIds([])
 }
 }

 const handleTogglePrintStudent = (id) => {
 setSelectedStudentIds((prev) =>
 prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
 )
 }

 const handleExecutePrint = (format = 'print') => {
 let targetList = dataList.filter((r, idx) => selectedStudentIds.includes(getRowId(r, idx)))
 if (targetList.length === 0) {
 targetList = dataList
 }

 const columns = [
 { title: 'No', render: (_, idx) => idx + 1 },
 { title: 'NISN / NIS', render: (r) => `${r.siswa?.nisn || '-'}\n${r.siswa?.nis || '-'}` },
 { title: 'Nama Siswa', render: (r) => r.siswa?.name || r.siswa?.full_name || '-' },
 { title: 'Kelas & Semester', render: (r) => `${r.kelas?.nama_kelas || '-'}\n${r.semester?.nama || '-'}` },
 ]

 if (selectedFields.mapel) {
 columns.push({ title: 'Mapel Lulus', render: (r) => `${r.mapel_lulus || 0}/${r.total_mapel || 0}` })
 }
 if (selectedFields.rata_rata) {
 columns.push({ title: 'Rata-Rata', render: (r) => r.rata_rata || 0 })
 }
 if (selectedFields.ranking) {
 columns.push({ title: 'Ranking', render: (r) => (r.peringkat_kelas ? `Ke-${r.peringkat_kelas}` : '-') })
 }
 if (selectedFields.presensi) {
 columns.push({ title: 'Presensi', render: (r) => `${r.total_hadir || 0}H / ${r.total_izin || 0}I / ${r.total_sakit || 0}S / ${r.total_alpha || 0}A` })
 }
 if (selectedFields.status) {
 columns.push({ title: 'Status Rapor', render: (r) => (r.status_rapor || 'draft').toUpperCase() })
 }

 if (format === 'print') {
 printCleanTable({
 title: 'Laporan Rekap Rapor Digital Siswa',
 subtitle: `Dicetak ${targetList.length} Siswa | Dareliman Edu`,
 columns,
 data: targetList,
 })
 } else if (format === 'pdf') {
 downloadPdfTable({
 filename: 'rekap-rapor-digital-siswa.pdf',
 title: 'Laporan Rekap Rapor Digital Siswa',
 subtitle: `Dicetak ${targetList.length} Siswa | Dareliman Edu`,
 columns,
 data: targetList,
 })
 } else if (format === 'csv') {
 const exportCols = [
 { label: 'NISN', key: 'nisn' },
 { label: 'NIS', key: 'nis' },
 { label: 'Nama Siswa', key: 'name' },
 { label: 'Kelas', key: 'kelas' },
 { label: 'Semester', key: 'semester' },
 { label: 'Rata-Rata', key: 'rata_rata' },
 { label: 'Ranking', key: 'ranking' },
 { label: 'Status Rapor', key: 'status_rapor' },
 ]
 const exportRows = targetList.map((r) => ({
 nisn: r.siswa?.nisn || '-',
 nis: r.siswa?.nis || '-',
 name: r.siswa?.name || r.siswa?.full_name || '-',
 kelas: r.kelas?.nama_kelas || '-',
 semester: r.semester?.nama || '-',
 rata_rata: r.rata_rata || 0,
 ranking: r.peringkat_kelas ? `Ke-${r.peringkat_kelas}` : '-',
 status_rapor: r.status_rapor || 'draft',
 }))
 exportCsv(exportRows, exportCols, 'rekap-rapor-terpilih')
 }

 setIsPrintFilterModalOpen(false)
 }

 const getStatusBadge = (status) => {
 switch (status) {
 case 'diterbitkan':
 return <Badge color="success" size="sm">DITERBITKAN</Badge>
 case 'final':
 return <Badge color="violet" size="sm">FINAL VALIDATED</Badge>
 case 'direvisi':
 return <Badge color="warning" size="sm">DIREVISI</Badge>
 default:
 return <Badge color="gray" size="sm">DRAFT</Badge>
 }
 }

 const cards = useMemo(() => {
 const total = stats.total_rapor || pagination.total || dataList.length || 0
 const calcPercent = (val) => (total > 0 ? (val / total) * 100 : 0)

 return [
 {
 label: 'Total Rapor',
 statusKey: 'semua',
 value: total,
 icon: FileText,
 tone: 'emerald',
 percent: 100,
 subText: 'Dokumen Terdaftar',
 },
 {
 label: 'Diterbitkan',
 statusKey: 'diterbitkan',
 value: stats.diterbitkan || 0,
 icon: CheckCircle2,
 tone: 'sky',
 percent: calcPercent(stats.diterbitkan || 0),
 subText: 'Siap Dilihat Ortum',
 },
 {
 label: 'Draft / Validasi',
 statusKey: 'draft',
 value: stats.draft || 0,
 icon: Clock,
 tone: 'amber',
 percent: calcPercent(stats.draft || 0),
 subText: 'Validasi Wali Kelas',
 },
 {
 label: 'Final Validated',
 statusKey: 'final',
 value: stats.final || 0,
 icon: Check,
 tone: 'purple',
 percent: calcPercent(stats.final || 0),
 subText: 'Disetujui Kepsek',
 },
 {
 label: 'Rata-Rata Sekolah',
 statusKey: 'semua',
 value: stats.rata_rata_sekolah || 0,
 icon: Award,
 tone: 'rose',
 percent: 100,
 subText: 'Indeks Prestasi',
 },
 ]
 }, [stats, pagination.total, dataList.length])

 const chartData = useMemo(() => {
 if (!dataList.length) {
 return [
 { name: 'Kelas 7A', nilai: 85 },
 { name: 'Kelas 7B', nilai: 82 },
 { name: 'Kelas 8A', nilai: 88 },
 { name: 'Kelas 8B', nilai: 84 },
 { name: 'Kelas 9A', nilai: 89 },
 ]
 }
 const grouped = {}
 dataList.forEach((r) => {
 const k = r.kelas?.nama_kelas || 'Lainnya'
 if (!grouped[k]) grouped[k] = { total: 0, count: 0 }
 grouped[k].total += parseFloat(r.rata_rata || 0)
 grouped[k].count += 1
 })
 return Object.keys(grouped).map((k) => ({
 name: k,
 nilai: Number((grouped[k].total / grouped[k].count).toFixed(1)),
 }))
 }, [dataList])

 const pieData = useMemo(() => {
 return [
 { name: 'Diterbitkan', value: stats.diterbitkan || 12, color: '#0EA5E9' },
 { name: 'Final', value: stats.final || 8, color: '#8B5CF6' },
 { name: 'Draft', value: stats.draft || 5, color: '#F59E0B' },
 { name: 'Direvisi', value: stats.direvisi || 2, color: '#F43F5E' },
 ]
 }, [stats])

 const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: { staggerChildren: 0.08, delayChildren: 0.04 },
 },
 }

 const itemVariants = {
 hidden: { opacity: 0, y: 15 },
 visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
 }

 return (
 <PageContainer maxW="7xl">
 <div className="space-y-6 pb-12">
 {/* ── Breadcrumb Navigation ── */}
 <div className="mb-4">
 <AppBreadcrumb
 items={[
 { label: 'LMS & Akademik', href: '/dashboard' },
 { label: 'Rapor Digital Siswa' },
 ]}
 />
 </div>

 {/* ── Modern Hero Card ── */}
      <HeroUiHeader
        title="Rapor Digital Siswa"
        subtitle="Kalkulasi otomatis capaian nilai, cetak rapor resmi Kurikulum Merdeka, serta distribusi laporan hasil belajar digital santri/siswa."
        badge="LMS Penilaian & Rapor"
        icon={GraduationCap}
        className="mb-6"
      />

 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-6">

 {/* 5-Card KPI Summary Grid */}
 <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {cards.map(({ label, statusKey, value, icon: Icon, tone, percent, subText }) => (
              <KpiStatCard
                key={label}
                title={label}
                value={typeof value === "number" && !Number.isInteger(value) ? value.toFixed(1) : value}
                badge={`${percent.toFixed(1)}%`}
                description={subText}
                icon={Icon}
                tone={tone || "emerald"}
                ctaText="Detail →"
              />
            ))}
          </div>
        </motion.div>

 {/* Module Tab Navigation & Action Buttons inside Single Card */}
 {tabNav && (
 <motion.div variants={itemVariants}>
 {typeof tabNav === 'function' ? (
 tabNav(
 <>
 <button
 type="button"
 onClick={() => setShowGenerateModal(true)}
 className="group relative flex shrink-0 items-center gap-2.5 rounded-xl border border-emerald-200/80 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-[#111827] dark:hover:bg-emerald-950/30 px-3 py-2 cursor-pointer transition-colors duration-150"
 >
 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400 border border-emerald-200/80 dark:border-emerald-800/60">
 <RefreshCw className="h-4 w-4" />
 </div>
 <div className="flex flex-col pr-0.5 text-left">
 <span className="text-xs font-extrabold tracking-tight text-slate-700 dark:text-slate-200 group-hover:text-slate-900">
 Auto-Generate Kelas
 </span>
 <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
 Kalkulasi Otomatis
 </span>
 </div>
 </button>

 <button
 type="button"
 onClick={handleOpenCreateModal}
 className="group relative flex shrink-0 items-center gap-2.5 rounded-xl border border-emerald-200/80 bg-white hover:border-emerald-300 hover:bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-[#111827] dark:hover:bg-emerald-950/30 px-3 py-2 cursor-pointer transition-colors duration-150"
 >
 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-xs bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/80">
 <Plus className="h-4 w-4" />
 </div>
 <div className="flex flex-col pr-0.5 text-left">
 <span className="text-xs font-extrabold tracking-tight text-slate-700 dark:text-slate-200 group-hover:text-slate-900">
 Rapor Manual
 </span>
 <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none mt-0.5">
 Buat Rapor Baru
 </span>
 </div>
 </button>
 </>
 )
 ) : (
 tabNav
 )}
 </motion.div>
 )}

 {/* 3-Column Equal Grid Section */}
 <motion.div variants={itemVariants}>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-stretch">
 {/* Column 1: Filter Laporan Rapor */}
 <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 !bg-emerald-100/90 dark:!bg-emerald-950/50 p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
 <div>
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <h2 className="text-base font-bold text-slate-900 dark:text-white">Filter Laporan Rapor</h2>
 <button
 type="button"
 onClick={() => {
 setFilters({ search: '', kelas_id: '', semester_id: '', tahun_ajaran_id: '', status_rapor: '' })
 fetchData(1)
 }}
 className="text-xs font-semibold text-[#059669] dark:text-emerald-400 hover:underline cursor-pointer"
 >
 Reset Filter
 </button>
 </div>

 <div className="space-y-3">
 {/* Pencarian Siswa */}
 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Pencarian Siswa</label>
 <div className="relative">
 <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 placeholder="Cari Siswa / NISN..."
 value={filters.search}
 onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
 className="w-full pl-8 pr-3 h-9 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>
 </div>

 {/* Dropdown Kelas */}
 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Pilihan Kelas</label>
 <HeroUiFilterSelect
 value={filters.kelas_id}
 onChange={(val) => setFilters((prev) => ({ ...prev, kelas_id: val }))}
 options={[
 { value: '', label: 'Semua Kelas' },
 ...options.kelases.map((k) => ({ value: String(k.id), label: k.nama_kelas })),
 ]}
 placeholder="Semua Kelas"
 icon={Building2}
 ariaLabel="Pilihan Kelas"
 size="sm"
 searchable
 className="w-full"
 />
 </div>

 {/* Dropdown Semester */}
 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Semester</label>
 <HeroUiFilterSelect
 value={filters.semester_id}
 onChange={(val) => setFilters((prev) => ({ ...prev, semester_id: val }))}
 options={[
 { value: '', label: 'Semua Semester' },
 ...options.semesters.map((s) => ({ value: String(s.id), label: s.nama })),
 ]}
 placeholder="Semua Semester"
 icon={Calendar}
 ariaLabel="Pilihan Semester"
 size="sm"
 className="w-full"
 />
 </div>

 {/* Dropdown Tahun Ajaran */}
 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Tahun Ajaran</label>
 <HeroUiFilterSelect
 value={filters.tahun_ajaran_id}
 onChange={(val) => setFilters((prev) => ({ ...prev, tahun_ajaran_id: val }))}
 options={[
 { value: '', label: 'Semua Tahun Ajaran' },
 ...options.tahun_ajarans.map((t) => ({ value: String(t.id), label: t.year })),
 ]}
 placeholder="Semua Tahun Ajaran"
 icon={Calendar}
 ariaLabel="Pilihan Tahun Ajaran"
 size="sm"
 className="w-full"
 />
 </div>

 {/* Filter Status Rapor */}
 <div>
 <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">Status Rapor</label>
 <HeroUiFilterSelect
 value={filters.status_rapor}
 onChange={(val) => setFilters((prev) => ({ ...prev, status_rapor: val }))}
 options={[
 { value: '', label: 'Semua Status' },
 { value: 'draft', label: 'Draft' },
 { value: 'final', label: 'Final Validated' },
 { value: 'diterbitkan', label: 'Diterbitkan' },
 { value: 'direvisi', label: 'Direvisi' },
 ]}
 placeholder="Semua Status"
 icon={CheckCircle2}
 ariaLabel="Status Rapor"
 size="sm"
 className="w-full"
 />
 </div>
 </div>
 </div>
 </article>

 {/* Column 2: Grafik Tren Utama (BarChart) */}
 <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 !bg-emerald-100/90 dark:!bg-emerald-950/50 p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <h2 className="text-base font-bold text-slate-900 dark:text-white">Analisis Skor per Kelas</h2>
 <span className="text-xs font-semibold text-slate-400">Rata-Rata Nilai</span>
 </div>
 <div className="h-64 w-full">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={chartData}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
 <XAxis dataKey="name" tick={{ fontSize: 10 }} />
 <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
 <Tooltip />
 <Bar dataKey="nilai" fill="#059669" radius={[6, 6, 0, 0]} maxBarSize={44} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </article>

 {/* Column 3: Grafik Distribusi Status Rapor (PieChart) */}
 <article className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 !bg-emerald-100/90 dark:!bg-emerald-950/50 p-5 sm:p-6 shadow-sm flex flex-col justify-between h-full">
 <div className="flex items-center justify-between mb-4 pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <h2 className="text-base font-bold text-slate-900 dark:text-white">Distribusi Status Rapor</h2>
 <span className="text-xs font-bold text-slate-500">{stats.total_rapor || dataList.length} Total</span>
 </div>
 <div className="flex flex-col items-center justify-center flex-1">
 <div className="relative w-48 h-48 sm:w-52 sm:h-52 mb-3 flex items-center justify-center">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={pieData} dataKey="value" nameKey="name" innerRadius="62%" outerRadius="88%" paddingAngle={2}>
 {pieData.map((item) => (
 <Cell key={item.name} fill={item.color} />
 ))}
 </Pie>
 <Tooltip />
 </PieChart>
 </ResponsiveContainer>
 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
 <strong className="text-xl font-black text-slate-900 dark:text-white">{stats.total_rapor || dataList.length}</strong>
 <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total</span>
 </div>
 </div>

 <div className="w-full flex flex-col gap-2 text-xs">
 {pieData.map((item) => (
 <div key={item.name} className="flex items-center justify-between gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-2 min-w-0">
 <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
 <span className="font-semibold text-slate-700 dark:text-slate-300 text-xs whitespace-nowrap">
 {item.name}
 </span>
 </div>
 <span className="font-black text-slate-900 dark:text-white text-xs tabular-nums">
 {item.value}
 </span>
 </div>
 ))}
 </div>
 </div>
 </article>
 </div>
 </motion.div>

 {/* Canonical Datatable Outer Container */}
 <motion.div variants={itemVariants}>
 <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-sm dark:bg-[#1B2433]">
 {/* Datatable Toolbar Header Baris 1 */}
 <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 sm:px-6 md:px-8 bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shrink-0 shadow-xs">
 <Award className="size-5 text-emerald-600" strokeWidth={2.2} />
 </div>
 <div>
 <div className="flex items-center gap-2 flex-wrap">
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
 Daftar Rapor Digital Siswa
 </h3>
 <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-xs font-extrabold text-emerald-800 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800/60">
 {pagination.total || dataList.length} Records
 </span>
 </div>
 <p className="mt-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
 Pengelolaan dan penerbitan buku rapor digital per siswa dan kelas.
 </p>
 </div>
 </div>

 <div className="flex flex-wrap items-center gap-2">
 {/* 1. Tambah */}
 <SquircleActionButton
 variant="primary"
 onClick={handleOpenCreateModal}
 label="Tambah Rapor Manual"
 />

 {/* 2. Export */}
 <SquircleActionButton
 variant="export"
 onClick={() => exportDatatable(dataList, 'csv')}
 label="Export Datatable (.csv, .xlsx)"
 />

 {/* 3. Import */}
 <SquircleActionButton
 variant="import"
 onClick={() => setIsImportModalOpen(true)}
 label="Import Data Rapor (.csv, .xlsx)"
 />

 {/* 4. Cetak */}
 <SquircleActionButton
 variant="view"
 icon={Printer}
 onClick={openPrintFilterModal}
 label="Cetak & Filter Laporan"
 />
 </div>
 </div>

 {/* Table Area */}
 {loading ? (
 <div className="p-12 text-center space-y-3">
 <RefreshCw className="w-8 h-8 text-[#059669] animate-spin mx-auto" />
 <p className="text-sm text-slate-500 dark:text-slate-400">Memuat Rapor Digital Siswa...</p>
 </div>
 ) : dataList.length === 0 ? (
 <div className="p-12 text-center">
 <BookOpen className="w-12 h-9 text-slate-300 mx-auto mb-3" />
 <p className="text-slate-700 dark:text-slate-300 font-bold">Belum ada data Rapor Digital</p>
 <p className="text-slate-500 text-xs mt-1">
 Gunakan tombol "Auto-Generate Kelas" untuk mengkalkulasi rapor otomatis dari data penilaian.
 </p>
 </div>
 ) : (
 <div className="overflow-x-auto">
 <TableRoot className="w-full text-left text-xs font-semibold border-collapse" aria-label="Daftar rapor digital siswa">
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200">
 <TableRow className="border-b border-emerald-200/80 dark:border-emerald-800/60 bg-transparent text-xs font-extrabold uppercase tracking-wider">
 <TableHead className="py-3.5 px-4">Nama Siswa</TableHead>
 <TableHead className="py-3.5 px-4">Kelas &amp; Periode</TableHead>
 <TableHead className="py-3.5 px-4 text-center">Mapel (Lulus/Total)</TableHead>
 <TableHead className="py-3.5 px-4 text-center">Rata-Rata Nilai</TableHead>
 <TableHead className="py-3.5 px-4 text-center">Ranking Kelas</TableHead>
 <TableHead className="py-3.5 px-4 text-center">Presensi (H/I/S/A)</TableHead>
 <TableHead className="py-3.5 px-4 text-center">Status Rapor</TableHead>
 <TableHead className="py-3.5 px-4 text-right">Aksi</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-slate-700 dark:text-slate-200">
 {dataList.map((item) => (
 <TableRow key={item.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors duration-150">
 {/* Student Info with HoverCard */}
 <TableCell className="py-3.5 px-4 align-top">
 <HoverCard>
 <HoverCardTrigger asChild>
 <div className="cursor-pointer group flex items-center gap-2.5">
 <Avatar size="sm">
 <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-bold">
 {(item.siswa?.name || 'S').charAt(0)}
 </AvatarFallback>
 </Avatar>
 <div>
 <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
 {item.siswa?.name || 'Siswa Tanpa Nama'}
 </div>
 <div className="text-xs font-mono text-slate-400">
 NISN: {item.siswa?.nisn || '-'} | NIS: {item.siswa?.nis || '-'}
 </div>
 </div>
 </div>
 </HoverCardTrigger>
 <HoverCardContent className="w-64 p-3 bg-white dark:bg-[#1B2433] rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 shadow-xl z-50">
 <div className="flex items-center gap-3">
 <Avatar size="md">
 <AvatarFallback className="bg-emerald-100 text-emerald-800 font-bold">
 {(item.siswa?.name || 'S').charAt(0)}
 </AvatarFallback>
 </Avatar>
 <div>
 <h4 className="font-bold text-sm text-slate-900 dark:text-white">{item.siswa?.name}</h4>
 <p className="text-xs text-slate-500">NISN: {item.siswa?.nisn || '-'}</p>
 <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold">
 {item.kelas?.nama_kelas || 'Kelas'}
 </span>
 </div>
 </div>
 </HoverCardContent>
 </HoverCard>
 </TableCell>

 {/* Kelas & Periode */}
 <TableCell className="py-3.5 px-4 align-top">
 <div className="font-semibold text-slate-800 dark:text-slate-200">{item.kelas?.nama_kelas || 'Kelas -'}</div>
 <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 {item.semester?.nama || 'Semester'} • {item.tahun_ajaran?.year || 'Tahun'}
 </div>
 </TableCell>

 {/* Mapel Lulus */}
 <TableCell className="py-3.5 px-4 text-center align-top font-bold text-emerald-700 dark:text-emerald-400">
 {item.mapel_lulus} <span className="text-slate-400 font-normal">/ {item.total_mapel}</span>
 </TableCell>

 {/* Rata-Rata Nilai */}
 <TableCell className="py-3.5 px-4 text-center align-top">
 <span className="inline-block px-3 py-1 rounded-lg bg-emerald-50 text-[#059669] dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold text-base border border-emerald-200/80 dark:border-emerald-800/60">
 {item.rata_rata}
 </span>
 </TableCell>

 {/* Ranking Kelas */}
 <TableCell className="py-3.5 px-4 text-center align-top">
 {item.peringkat_kelas ? (
 <span className="inline-flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full text-xs">
 🏆 Ke-{item.peringkat_kelas}
 {item.total_siswa_kelas ? ` dari ${item.total_siswa_kelas}` : ''}
 </span>
 ) : (
 <span className="text-slate-400 text-xs">-</span>
 )}
 </TableCell>

 {/* Presensi */}
 <TableCell className="py-3.5 px-4 text-center align-top">
 <div className="text-xs font-medium text-slate-700 dark:text-slate-300">
 <span className="text-emerald-600 font-bold">{item.total_hadir || 0}H</span> /{' '}
 <span className="text-blue-600">{item.total_izin || 0}I</span> /{' '}
 <span className="text-amber-600">{item.total_sakit || 0}S</span> /{' '}
 <span className="text-rose-600 font-bold">{item.total_alpha || 0}A</span>
 </div>
 </TableCell>

 {/* Status Rapor */}
 <TableCell className="py-3.5 px-4 text-center align-top">{getStatusBadge(item.status_rapor)}</TableCell>

                    {/* Actions */}
                    <TableCell className="py-3.5 px-4 text-right align-top">
                      <div className="flex items-center justify-end">
                        <ActionDropdown
                          onView={() => handleViewDigitalRapor(item.id)}
                          onEdit={() => handleOpenEditModal(item)}
                          onDelete={() => handleDelete(item.id, item)}
                          extraItems={[
                            {
                              label: 'Export / Cetak PDF',
                              icon: <Printer className="w-4 h-4 text-emerald-600" />,
                              onClick: () => handleOpenPrintPreview(item.id),
                            }
                          ]}
                        />
                      </div>
                    </TableCell>
 </TableRow>
 ))}
 </TableBody>
 </TableRoot>
 </div>
 )}

 {/* Pagination */}
 {!loading && pagination.lastPage > 1 && (
 <div className="p-4 sm:p-6 border-t border-emerald-200/80 dark:border-emerald-800/80">
 <Pagination
 currentPage={pagination.currentPage}
 totalPages={pagination.lastPage}
 onPageChange={(page) => fetchData(page)}
 sideLayout="full"
 />
 </div>
 )}
 </div>
 </motion.div>

 {/* MODAL 1: Auto-Generate Rapor Kelas */}
 {showGenerateModal && (
 <Dialog isOpen={showGenerateModal} onClose={() => setShowGenerateModal(false)} className="max-w-md">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-emerald-600">
 <RefreshCw className="w-5 h-5 text-amber-500" /> Auto-Generate Rapor Kelas
 </DialogTitle>
 <DialogDescription>
 Hitung nilai akhir & ranking siswa secara otomatis dari data penilaian.
 </DialogDescription>
 </DialogHeader>

 <form onSubmit={handleGenerateClass} className="flex-1 min-h-0 flex flex-col justify-between">
 <DialogBody className="space-y-4">
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
 Pilih Kelas
 </label>
 <HeroUiFilterSelect
 value={generateData.kelas_id}
 onChange={(val) => setGenerateData({ ...generateData, kelas_id: val })}
 options={options.kelases.map((k) => ({ value: String(k.id), label: k.nama_kelas }))}
 placeholder="Pilih Kelas"
 ariaLabel="Pilih Kelas"
 searchable
 className="w-full"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
 Semester
 </label>
 <HeroUiFilterSelect
 value={generateData.semester_id}
 onChange={(val) => setGenerateData({ ...generateData, semester_id: val })}
 options={options.semesters.map((s) => ({ value: String(s.id), label: s.nama }))}
 placeholder="Pilih Semester"
 ariaLabel="Pilih Semester"
 className="w-full"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
 Tahun Ajaran
 </label>
 <HeroUiFilterSelect
 value={generateData.tahun_ajaran_id}
 onChange={(val) => setGenerateData({ ...generateData, tahun_ajaran_id: val })}
 options={options.tahun_ajarans.map((t) => ({ value: String(t.id), label: t.year }))}
 placeholder="Pilih Tahun Ajaran"
 ariaLabel="Pilih Tahun Ajaran"
 className="w-full"
 />
 </div>
 </DialogBody>

 <DialogFooter className="flex items-center justify-end gap-2 pt-3">
 <Button variant="ghost" appearance="outline" size="sm" onClick={() => setShowGenerateModal(false)}>
 Batal
 </Button>
 <Button
 type="submit"
 disabled={generating}
 variant="primary"
 size="sm"
 className="bg-[#059669] text-slate-600 text-emerald-600 border border-emerald-200/80 dark:border-emerald-800/60 rounded-lg h-9 px-4 text-sm font-medium"
 >
 {generating ? 'Mengkalkulasi...' : 'Proses Kalkulasi Rapor'}
 </Button>
 </DialogFooter>
 </form>
 </Dialog>
 )}

 {/* MODAL 2: Form Create / Edit Catatan & Status */}
 {showFormModal && (
 <Dialog isOpen={showFormModal} onClose={() => setShowFormModal(false)} className="max-w-xl">
 <DialogHeader>
 <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-amber-600">
 <Edit3 className="w-5 h-5 text-[#059669]" />
 {editingItem ? 'Edit Catatan & Status Rapor' : 'Buat Rapor Digital Manual'}
 </DialogTitle>
 <DialogDescription>
 Sesuaikan catatan wali kelas, catatan kepala sekolah, dan status publikasi rapor.
 </DialogDescription>
 </DialogHeader>

 <form onSubmit={handleSaveRapor} className="flex-1 min-h-0 flex flex-col justify-between">
 <DialogBody className="space-y-4">
 {!editingItem && (
 <>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
 Pilih Siswa
 </label>
 <HeroUiFilterSelect
 value={formData.siswa_id}
 onChange={(val) => setFormData({ ...formData, siswa_id: val })}
 options={options.students.map((s) => ({ value: String(s.id), label: `${s.name} (${s.nisn})` }))}
 placeholder="Pilih Siswa"
 ariaLabel="Pilih Siswa"
 searchable
 className="w-full"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Kelas</label>
 <HeroUiFilterSelect
 value={formData.kelas_id}
 onChange={(val) => setFormData({ ...formData, kelas_id: val })}
 options={options.kelases.map((k) => ({ value: String(k.id), label: k.nama_kelas }))}
 placeholder="Pilih Kelas"
 ariaLabel="Pilih Kelas"
 searchable
 className="w-full"
 />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Semester</label>
 <HeroUiFilterSelect
 value={formData.semester_id}
 onChange={(val) => setFormData({ ...formData, semester_id: val })}
 options={options.semesters.map((s) => ({ value: String(s.id), label: s.nama }))}
 placeholder="Pilih Semester"
 ariaLabel="Pilih Semester"
 className="w-full"
 />
 </div>
 </div>
 </>
 )}

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
 Catatan Wali Kelas
 </label>
 <textarea
 rows={3}
 value={formData.catatan_wali_kelas}
 onChange={(e) => setFormData({ ...formData, catatan_wali_kelas: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 rounded-xl text-sm"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
 Catatan Kepala Sekolah
 </label>
 <textarea
 rows={2}
 value={formData.catatan_kepala_sekolah}
 onChange={(e) => setFormData({ ...formData, catatan_kepala_sekolah: e.target.value })}
 className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 rounded-xl text-sm"
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Status Rapor</label>
 <HeroUiFilterSelect
 value={formData.status_rapor}
 onChange={(val) => setFormData({ ...formData, status_rapor: val })}
 options={[
 { value: 'draft', label: 'Draft' },
 { value: 'final', label: 'Final Validated' },
 { value: 'diterbitkan', label: 'Diterbitkan' },
 { value: 'direvisi', label: 'Direvisi' },
 ]}
 placeholder="Status Rapor"
 ariaLabel="Status Rapor"
 className="w-full"
 />
 </div>
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tanggal Terbit</label>
 <DatePicker
 value={formData.tanggal_terbit}
 onChange={(e) => setFormData({ ...formData, tanggal_terbit: e.target.value })}
 inputClassName="py-2.5 text-sm"
 />
 </div>
 </div>
 </DialogBody>

 <DialogFooter className="flex items-center justify-end gap-2 pt-3">
 <Button variant="ghost" appearance="outline" size="sm" onClick={() => setShowFormModal(false)}>
 Batal
 </Button>
 <Button type="submit" variant="primary" size="sm" className="bg-[#059669] text-white border border-emerald-200/80 dark:border-emerald-800/60 rounded-lg h-9 px-4 text-sm font-medium">
 Simpan Rapor
 </Button>
 </DialogFooter>
 </form>
 </Dialog>
 )}

 {/* MODAL 3: Lihat Rapor Digital Modal (Authentic School Report Card View) */}
 {showDigitalModal && (
 <Dialog isOpen={showDigitalModal} onClose={() => setShowDigitalModal(false)} className="max-w-4xl bg-slate-100 dark:bg-slate-900">
 <DialogHeader className="pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
 <div>
 <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-600 font-sans">
 <GraduationCap className="w-6 h-6 text-[#059669]" /> Pratinjau Dokumen Rapor Digital Siswa
 </DialogTitle>
 <DialogDescription>
 Tampilan lembaran dokumen resmi Rapor Siswa Kurikulum Merdeka / Terpadu.
 </DialogDescription>
 </div>
 </DialogHeader>

 <DialogBody className="py-4">
 {loadingDigital || !digitalData ? (
 <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl">
 <RefreshCw className="w-8 h-8 text-[#059669] animate-spin mx-auto mb-2" />
 <p className="text-xs text-slate-500">Memuat Dokumen Rapor Digital...</p>
 </div>
 ) : (
 <OfficialRaporSheet digitalData={digitalData} />
 )}
 </DialogBody>

 <DialogFooter className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <Button variant="ghost" appearance="outline" size="sm" onClick={() => setShowDigitalModal(false)}>
 Tutup
 </Button>
 <div className="flex items-center gap-2">
 <Button
 variant="ghost"
 appearance="outline"
 size="sm"
 onClick={() => printRaporDocument(digitalData)}
 className="gap-1.5 text-blue-700 border-emerald-200/80 dark:border-emerald-800/60 dark:text-blue-400 hover:bg-blue-50 cursor-pointer"
 >
 <Download1 className="w-4 h-4" /> Unduh PDF
 </Button>
 <Button
 variant="primary"
 size="sm"
 onClick={() => printRaporDocument(digitalData)}
 className="gap-1.5 bg-[#059669] hover:bg-emerald-700 text-white cursor-pointer"
 >
 <Printer className="w-4 h-4" /> Cetak Rapor
 </Button>
 </div>
 </DialogFooter>
 </Dialog>
 )}

 {/* MODAL 4: Cetak / Export PDF Modal */}
 {showPrintModal && (
 <Dialog isOpen={showPrintModal} onClose={() => setShowPrintModal(false)} className="max-w-4xl bg-slate-100 dark:bg-slate-900">
 <DialogHeader className="pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between">
 <div>
 <DialogTitle className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-600 font-sans">
 <Printer className="w-6 h-6 text-[#059669]" /> Cetak PDF Rapor Digital Siswa
 </DialogTitle>
 <DialogDescription>
 Pratinjau cetakan lembaran Rapor resmi A4 siap cetak & unduh.
 </DialogDescription>
 </div>
 </DialogHeader>

 <DialogBody className="py-4">
 {loadingDigital || !digitalData ? (
 <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-xl">
 <RefreshCw className="w-8 h-8 text-[#059669] animate-spin mx-auto mb-2" />
 <p className="text-xs text-slate-500">Mempersiapkan lembar cetak Rapor...</p>
 </div>
 ) : (
 <OfficialRaporSheet digitalData={digitalData} />
 )}
 </DialogBody>

 <DialogFooter className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <Button variant="ghost" appearance="outline" size="sm" onClick={() => setShowPrintModal(false)}>
 Tutup
 </Button>
 <div className="flex items-center gap-2">
 <Button
 variant="ghost"
 appearance="outline"
 size="sm"
 onClick={() => printRaporDocument(digitalData)}
 className="gap-1.5 text-blue-700 border-emerald-200/80 dark:border-emerald-800/60 dark:text-blue-400 hover:bg-blue-50 cursor-pointer"
 >
 <Download1 className="w-4 h-4" /> Unduh PDF
 </Button>
 <Button
 variant="primary"
 size="sm"
 onClick={() => printRaporDocument(digitalData)}
 className="gap-1.5 bg-[#059669] hover:bg-emerald-700 text-white cursor-pointer"
 >
 <Printer className="w-4 h-4" /> Cetak Rapor
 </Button>
 </div>
 </DialogFooter>
 </Dialog>
 )}

 {/* MODAL 5: KPI Card Drill-Down Detail Modal */}
 {cardModal.isOpen && (
 <Dialog isOpen={cardModal.isOpen} onClose={closeCardModal} className="max-w-xl">
 <DialogHeader>
 <div className="flex items-center justify-between w-full pr-6">
 <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
 <Award className="w-5 h-5 text-[#059669]" />
 {cardModal.title}
 </DialogTitle>
 <Badge color="cyan" size="sm">
 {modalRows.length} Siswa
 </Badge>
 </div>
 <DialogDescription>
 Daftar rincian status Rapor Digital siswa.
 </DialogDescription>
 </DialogHeader>

 <DialogBody className="space-y-4">
 <div className="relative">
 <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 placeholder="Cari nama, NIS, kelas..."
 value={cardModal.searchQuery}
 onChange={(e) => setCardModal((prev) => ({ ...prev, searchQuery: e.target.value, page: 1 }))}
 className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>

 <div className="overflow-x-auto border border-emerald-200/80 dark:border-emerald-800/80 rounded-xl">
 <TableRoot className="w-full text-left text-xs border-collapse">
 <TableHeader>
 <TableRow className="bg-slate-50/80 dark:bg-slate-900/80 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-emerald-200 font-semibold border-b border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60">
 <TableHead className="py-2.5 px-3">Siswa & NIS</TableHead>
 <TableHead className="py-2.5 px-3">Kelas & Periode</TableHead>
 <TableHead className="py-2.5 px-3 text-center">Rata-Rata</TableHead>
 <TableHead className="py-2.5 px-3 text-center">Status</TableHead>
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {paginatedModalRows.length === 0 ? (
 <TableRow>
 <TableCell colSpan={4} className="py-8 text-center text-slate-400">
 Tidak ada data siswa untuk kategori ini.
 </TableCell>
 </TableRow>
 ) : (
 paginatedModalRows.map((row) => (
 <TableRow key={row.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30">
 <TableCell className="py-2.5 px-3">
 <div className="font-bold text-slate-900 dark:text-white">{row.siswa?.name || 'Siswa'}</div>
 <div className="text-[10px] text-slate-400 font-mono">NISN: {row.siswa?.nisn || '-'}</div>
 </TableCell>
 <TableCell className="py-2.5 px-3">
 <div className="font-medium text-slate-800 dark:text-slate-200">{row.kelas?.nama_kelas || '-'}</div>
 <div className="text-[10px] text-slate-400">{row.semester?.nama || '-'}</div>
 </TableCell>
 <TableCell className="py-2.5 px-3 text-center font-bold text-[#059669] dark:text-emerald-400">
 {row.rata_rata}
 </TableCell>
 <TableCell className="py-2.5 px-3 text-center">
 {getStatusBadge(row.status_rapor)}
 </TableCell>
 </TableRow>
 ))
 )}
 </TableBody>
 </TableRoot>
 </div>

 {modalTotalPages > 1 && (
 <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
 <span>
 Halaman {cardModal.page} dari {modalTotalPages} ({modalRows.length} data)
 </span>
 <div className="flex items-center gap-1.5">
 <button
 type="button"
 disabled={cardModal.page <= 1}
 onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page - 1 }))}
 title="Halaman Sebelumnya"
 aria-label="Halaman Sebelumnya"
 className="flex size-7.5 items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none dark:bg-emerald-600 dark:hover:bg-emerald-500 cursor-pointer"
 >
 <ChevronLeft className="size-3.5 shrink-0 text-emerald-600" />
 </button>
 <span className="px-2 py-0.5 text-xs font-bold text-slate-700 dark:text-slate-300">
 {cardModal.page} / {modalTotalPages}
 </span>
 <button
 type="button"
 disabled={cardModal.page >= modalTotalPages}
 onClick={() => setCardModal((prev) => ({ ...prev, page: prev.page + 1 }))}
 title="Halaman Berikutnya"
 aria-label="Halaman Berikutnya"
 className="flex size-7.5 items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 shadow-xs transition-all duration-150 active:scale-95 disabled:bg-emerald-600/30 disabled:text-white/40 disabled:pointer-events-none dark:bg-emerald-600 dark:hover:bg-emerald-500 cursor-pointer"
 >
 <ChevronRight className="size-3.5 shrink-0 text-emerald-600" />
 </button>
 </div>
 </div>
 )}
 </DialogBody>

 <DialogFooter>
 <Button variant="ghost" appearance="outline" size="sm" onClick={closeCardModal}>
 Tutup
 </Button>
 </DialogFooter>
 </Dialog>
 )}

 {/* MODAL 6: Print Filter & Student Selection Modal */}
 {isPrintFilterModalOpen && (
 <Dialog isOpen={isPrintFilterModalOpen} onClose={() => setIsPrintFilterModalOpen(false)} className="max-w-xl">
 <DialogHeader>
 <div className="flex items-center justify-between w-full pr-6">
 <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white">
 <Printer className="w-5 h-5 text-[#059669]" />
 Pilih Data Rapor & Siswa Untuk Dicetak
 </DialogTitle>
 <Badge color="cyan" size="sm">
 {selectedStudentIds.length} dari {dataList.length} Siswa
 </Badge>
 </div>
 <DialogDescription>
 Tentukan komponen nilai dan daftar siswa yang akan dimasukkan ke dalam laporan cetak / PDF.
 </DialogDescription>
 </DialogHeader>

 <DialogBody className="space-y-5">
 <div className="space-y-2">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
 1. Pilih Komponen Yang Dicetak
 </label>
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 text-xs">
 <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
 <input
 type="checkbox"
 checked={selectedFields.mapel}
 onChange={() => setSelectedFields((p) => ({ ...p, mapel: !p.mapel }))}
 className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
 />
 Mapel Lulus
 </label>
 <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
 <input
 type="checkbox"
 checked={selectedFields.rata_rata}
 onChange={() => setSelectedFields((p) => ({ ...p, rata_rata: !p.rata_rata }))}
 className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
 />
 Rata-Rata Nilai
 </label>
 <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
 <input
 type="checkbox"
 checked={selectedFields.ranking}
 onChange={() => setSelectedFields((p) => ({ ...p, ranking: !p.ranking }))}
 className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
 />
 Ranking Kelas
 </label>
 <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300">
 <input
 type="checkbox"
 checked={selectedFields.presensi}
 onChange={() => setSelectedFields((p) => ({ ...p, presensi: !p.presensi }))}
 className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
 />
 Presensi Kehadiran
 </label>
 <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 dark:text-slate-300 col-span-2">
 <input
 type="checkbox"
 checked={selectedFields.status}
 onChange={() => setSelectedFields((p) => ({ ...p, status: !p.status }))}
 className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
 />
 Status Rapor (Draft/Final/Diterbitkan)
 </label>
 </div>
 </div>

 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
 2. Pilih Siswa Yang Dicetak ({selectedStudentIds.length}/{dataList.length})
 </label>
 <label className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 cursor-pointer">
 <input
 type="checkbox"
 checked={selectedStudentIds.length === dataList.length && dataList.length > 0}
 onChange={handleSelectAllPrintStudents}
 className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
 />
 Pilih Semua
 </label>
 </div>

 <div className="relative">
 <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 placeholder="Cari siswa untuk dicetak..."
 value={printSearchQuery}
 onChange={(e) => setPrintSearchQuery(e.target.value)}
 className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
 />
 </div>

 <div className="max-h-56 overflow-y-auto border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl p-2 divide-y divide-emerald-100/80 dark:divide-slate-800 bg-white dark:bg-slate-900/40">
 {filteredPrintStudents.length === 0 ? (
 <div className="py-4 text-center text-xs text-slate-400">Tidak ada siswa ditemukan.</div>
 ) : (
 filteredPrintStudents.map((r, idx) => {
 const rowId = getRowId(r, idx)
 const isChecked = selectedStudentIds.includes(rowId)
 return (
 <label
 key={rowId}
 className="flex items-center justify-between py-2 px-2 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 rounded-lg cursor-pointer transition-colors"
 >
 <div className="flex items-center gap-2.5">
 <input
 type="checkbox"
 checked={isChecked}
 onChange={() => handleTogglePrintStudent(rowId)}
 className="rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
 />
 <div>
 <div className="text-xs font-bold text-slate-900 dark:text-white">
 {r.siswa?.name || 'Siswa'}
 </div>
 <div className="text-[10px] text-slate-400 font-mono">
 NISN: {r.siswa?.nisn || '-'} | {r.kelas?.nama_kelas || '-'} ({r.semester?.nama || '-'})
 </div>
 </div>
 </div>
 <span className="text-xs font-bold text-[#059669] dark:text-emerald-400">
 Rata-Rata: {r.rata_rata}
 </span>
 </label>
 )
 })
 )}
 </div>
 </div>
 </DialogBody>

 <DialogFooter className="flex flex-wrap items-center justify-between gap-2">
 <Button variant="ghost" appearance="outline" size="sm" onClick={() => setIsPrintFilterModalOpen(false)}>
 Batal
 </Button>
 <div className="flex items-center gap-2">
 <Button
 variant="ghost"
 appearance="outline"
 size="sm"
 onClick={() => handleExecutePrint('csv')}
 className="gap-1.5 text-amber-700 border-emerald-200/80 dark:border-emerald-800/60 dark:text-amber-400 hover:bg-amber-50"
 >
 <Download1 className="w-4 h-4" /> Export CSV
 </Button>
 <Button
 variant="ghost"
 appearance="outline"
 size="sm"
 onClick={() => handleExecutePrint('pdf')}
 className="gap-1.5 text-blue-700 border-emerald-200/80 dark:border-emerald-800/60 dark:text-blue-400 hover:bg-blue-50"
 >
 <FileText className="w-4 h-4" /> Unduh PDF
 </Button>
 <Button
 variant="primary"
 size="sm"
 onClick={() => handleExecutePrint('print')}
 className="gap-1.5 bg-[#059669] hover:bg-emerald-700 text-white"
 >
 <Printer className="w-4 h-4" /> Cetak Sekarang
 </Button>
 </div>
 </DialogFooter>
 </Dialog>
 )}

 {/* MODAL 7: Import Data Rapor Modal (.csv, .xlsx, .xls) */}
 {isImportModalOpen && (
 <Dialog
 isOpen={isImportModalOpen}
 onClose={() => { setIsImportModalOpen(false); setImportFile(null); setImportError(''); }}
 className="max-w-xl"
 >
 <DialogHeader className="pb-3 border-b border-emerald-200/80 dark:border-emerald-800/60">
 <DialogTitle className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
 <Upload1 className="size-5 text-sky-500" /> Import Data Rapor Digital Siswa
 </DialogTitle>
 <DialogDescription className="text-xs text-slate-500 mt-1">
 Upload file spreadsheet (.csv, .xlsx, .xls) berisi data rata-rata nilai, peringkat, dan catatan rapor.
 </DialogDescription>
 </DialogHeader>

 <DialogBody className="py-4 space-y-4">
 <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
 <div>
 <span className="text-xs font-bold text-sky-900 dark:text-sky-200 block">Template Format Import</span>
 <span className="text-xs text-sky-700 dark:text-sky-400 block">Unduh contoh template CSV dengan kolom NISN, Nama, Kelas, Rata-Rata, Ranking.</span>
 </div>
 <button
 type="button"
 onClick={() => {
 const templateHeaders = 'nisn,nama_siswa,kelas,semester,rata_rata,peringkat,total_hadir,total_izin,total_sakit,total_alpha,status_rapor\n23001,"Ahmad Zaky","7A","Semester 1",86.5,1,100,0,0,0,"diterbitkan"\n23002,"Aisyah Humaira","7A","Semester 1",88.0,2,98,1,1,0,"final"\n'
 const blob = new Blob([`\uFEFF${templateHeaders}`], { type: 'text/csv;charset=utf-8' })
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = 'template-import-rapor.csv'
 a.click()
 URL.revokeObjectURL(url)
 }}
 className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs hover:bg-sky-700 transition-colors shadow-2xs cursor-pointer"
 >
 <Download className="size-3.5" /> Template
 </button>
 </div>

 <div className="space-y-2">
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
 Pilih File (.csv, .xlsx, .xls):
 </label>
 <div
 className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/60 rounded-xl bg-slate-50 dark:bg-slate-800/40 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors cursor-pointer"
 onClick={() => importInputRef.current?.click()}
 >
 <Upload1 className="size-8 text-sky-500 mb-2" />
 <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
 {importFile ? importFile.name : 'Klik untuk memilih atau drag & drop file'}
 </span>
 <span className="text-xs text-slate-400 mt-1">Format didukung: CSV (.csv), Excel (.xlsx, .xls)</span>
 <input
 ref={importInputRef}
 type="file"
 accept=".csv, .xlsx, .xls, text/csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
 className="hidden"
 onChange={(e) => {
 if (e.target.files?.[0]) {
 setImportFile(e.target.files[0])
 setImportError('')
 }
 }}
 />
 </div>
 </div>

 {importError && (
 <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs text-rose-700 dark:text-rose-300 font-medium">
 {importError}
 </div>
 )}
 </DialogBody>

 <DialogFooter className="pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex justify-end gap-2">
 <Button variant="ghost" onClick={() => { setIsImportModalOpen(false); setImportFile(null); setImportError(''); }}>
 Batal
 </Button>
 <Button
 variant="primary"
 className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs"
 disabled={!importFile || isImporting}
 onClick={async () => {
 if (!importFile) return
 try {
 setIsImporting(true)
 setImportError('')
 const form = new FormData()
 form.append('file', importFile)
 if (filters.kelas_id) form.append('kelas_id', filters.kelas_id)
 if (filters.semester_id) form.append('semester_id', filters.semester_id)
 if (filters.tahun_ajaran_id) form.append('tahun_ajaran_id', filters.tahun_ajaran_id)

 const res = await lmsRaporService.import(form)
 setIsImportModalOpen(false)
 setImportFile(null)
 showToastNotification(res.message || 'Berhasil mengimpor data Rapor Digital!')
 await fetchData(1)
 } catch (err) {
 setImportError(err.response?.data?.message || err.message || 'Gagal memproses berkas impor.')
 } finally {
 setIsImporting(false)
 }
 }}
 >
 {isImporting ? 'Memproses...' : 'Import Data'}
 </Button>
 </DialogFooter>
 </Dialog>
 )}

 <HarmonizedDeleteRaporModal
 isOpen={deleteModal.isOpen}
 onClose={() => setDeleteModal({ isOpen: false, id: null, item: null, isSubmitting: false })}
 onConfirm={confirmDelete}
 item={deleteModal.item}
 isSubmitting={deleteModal.isSubmitting}
 />
 </motion.div>
 </div>
 </PageContainer>
 )
}
