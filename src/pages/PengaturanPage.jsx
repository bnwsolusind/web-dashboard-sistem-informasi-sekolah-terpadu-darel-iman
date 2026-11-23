import { HeroUiHeader } from "../components/ui/HeroUiHeader"
import {
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  motion,
  AnimatePresence
} from 'framer-motion'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import PageContainer from '../components/app/PageContainer'
import AppModal from '../components/app/AppModal'
import AppTabs from '../components/app/AppTabs'
import {
  useToast
} from '../components/app'
import {
  AppWindow,
  CheckCircle2,
  Image,
  KeyRound,
  LayoutPanelLeft,
  Lock,
  Mail,
  Palette,
  Phone,
  RotateCcw,
  Save,
  Shield,
  ShieldCheck,
  Upload,
  UserCheck,
  Clock,
  Sliders,
  Calendar,
  Sparkles,
  Layers,
  AlertTriangle,
  Building,
  Globe,
  LifeBuoy,
  Plus,
  Pencil,
  Trash2,
  HelpCircle,
  FileText,
  ExternalLink,
  BookOpen,
  Tag,
  Download,
  MapPin,
  AlertCircle,
  CreditCard,
  Eye,
  EyeOff,
  Languages,
  Code2,
  Copy,
  FileJson,
  Check,
  School,
  X,
  Maximize2
} from 'lucide-react'
import {
  defaultPengaturan,
  usePengaturanStore,
  defaultLabels,
  INITIAL_FAQS,
  INITIAL_MANUALS
} from '../stores/pengaturanStore'
import {
  useAuthStore
} from '../stores/authStore'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from '../components/ui/select'
import {
  Checkbox
} from '../components/ui/checkbox'
import {
  Label
} from '../components/ui/label'
import {
  Button
} from '../components/ui/button'
import {
  Input
} from '../components/ui/input'

const colorFields = [
 ['sidebar_color', 'Warna Latar Sidebar'],
 ['sidebar_accent_color', 'Warna Aksen Logo & Icon'],
 ['header_color', 'Warna Header Topbar'],
 ['body_color', 'Warna Latar Body Halaman'],
]

const presetThemes = [
 {
 name: 'Zamrud Klasik (Default)',
 sidebar_color: '#059669',
 sidebar_accent_color: '#10B981',
 header_color: '#FFFFFF',
 header_style: 'light',
 sidebar_style: 'gradient',
 },
 {
 name: 'Ocean Blue',
 sidebar_color: '#0369A1',
 sidebar_accent_color: '#38BDF8',
 header_color: '#F0F9FF',
 header_style: 'solid',
 sidebar_style: 'gradient',
 },
 {
 name: 'Royal Violet',
 sidebar_color: '#6D28D9',
 sidebar_accent_color: '#A78BFA',
 header_color: '#F5F3FF',
 header_style: 'solid',
 sidebar_style: 'gradient',
 },
 {
 name: 'Midnight Dark',
 sidebar_color: '#1E293B',
 sidebar_accent_color: '#10B981',
 header_color: '#0F172A',
 header_style: 'solid',
 sidebar_style: 'solid',
 },
 {
 name: 'Sunset Amber',
 sidebar_color: '#78350F',
 sidebar_accent_color: '#F59E0B',
 header_color: '#FFFBEB',
 header_style: 'solid',
 sidebar_style: 'gradient',
 },
]



function HarmonizedActionModal({ isOpen, onClose, onConfirm, title, desc, confirmLabel, variant = 'danger' }) {
 if (!isOpen) return null
 const isDanger = variant === 'danger'
 return (
 <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 16 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.94, y: 16 }}
 transition={{ type: 'spring', damping: 25, stiffness: 350 }}
 className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] dark:border-emerald-800/60 dark:bg-[#1B2433] my-auto"
 >
 
 <button
 type="button"
 onClick={onClose}
 aria-label="Tutup modal"
 className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-xl bg-emerald-50 hover:bg-slate-200 text-emerald-700 hover:text-slate-800 dark:bg-emerald-950/40 dark:hover:bg-slate-700 dark:text-emerald-300 cursor-pointer transition-all active:scale-95 z-20 shadow-xs"
 >
 <X className="size-4" strokeWidth={2.2} />
 </button>

 <div className="p-5 sm:p-6">
 <div className="flex items-start gap-3.5 mb-4 pr-8">
 <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl  shadow-md ${
 isDanger
 ? 'bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 shadow-sm'
 : 'bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-sm'
 }`}>
 {isDanger ? <Trash2 className="h-6 w-6" /> : <RotateCcw className="h-6 w-6" />}
 </div>
 <div>
 <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
 isDanger
 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
 : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
 }`}>
 {isDanger ? 'Konfirmasi Hapus' : 'Konfirmasi Reset'}
 </span>
 <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5 leading-snug">{title}</h3>
 </div>
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
 {desc}
 </p>
 <div className={`rounded-xl border p-3 mb-6 ${
 isDanger
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 dark:border-emerald-800/60 dark:bg-rose-950/20'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 dark:border-emerald-800/60 dark:bg-emerald-950/20'
 }`}>
 <div className="flex items-start gap-2">
 {isDanger ? (
 <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
 ) : (
 <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
 )}
 <p className={`text-xs ${isDanger ? 'text-rose-800 dark:text-rose-300' : 'text-emerald-800 dark:text-emerald-300'}`}>
 {isDanger ? 'Data yang dihapus tidak dapat dipulihkan kembali dari daftar ini.' : 'Data konfigurasi akan dikembalikan sesuai pengaturan awal Dareliman Edu.'}
 </p>
 </div>
 </div>
 <div className="flex items-center justify-end gap-3">
 <button
 type="button"
 onClick={onClose}
 className="h-9 px-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition cursor-pointer"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={onConfirm}
 className={`h-10 px-5 rounded-xl text-xs font-extrabold text-white shadow-md transition cursor-pointer ${
 isDanger
 ? 'bg-white dark:bg-[#1B2433] hover:from-rose-700 hover:to-red-700 shadow-sm'
 : 'bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white hover:from-emerald-700 hover:to-teal-700 shadow-sm'
 }`}
 >
 {confirmLabel}
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )
}

function SaveConfirmModal({
 isOpen,
 onClose,
 onConfirm,
 isSaving,
 form,
 files,
 previews,
 onPreviewPhoto,
}) {
 if (!isOpen) return null

 const logoPreview = previews.logo || form.logo_url
 const faviconPreview = previews.favicon || form.favicon_url
 const hasNewLogo = Boolean(files.logo)
 const hasNewFavicon = Boolean(files.favicon)

 return (
 <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 16 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.94, y: 16 }}
 transition={{ type: 'spring', damping: 25, stiffness: 350 }}
 className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] dark:border-emerald-800/60 dark:bg-[#1B2433] my-auto"
 >

 <button
 type="button"
 onClick={onClose}
 disabled={isSaving}
 aria-label="Tutup dialog"
 className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 cursor-pointer transition-all active:scale-95 disabled:opacity-50 z-20 shadow-xs"
 >
 <X className="size-4" strokeWidth={2.2} />
 </button>

 <div className="p-5 sm:p-6 space-y-4">
 <div className="flex items-start gap-3.5 pr-8">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 
            <School className="h-6 w-6 text-white" />
 </div>
 <div className="min-w-0">
 <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
 <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60">
 <Sparkles className="size-3" />
 Konfirmasi Penyimpanan
 </span>
 <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300 border border-emerald-200/80 dark:border-emerald-800/60">
 Super Admin
 </span>
 </div>
 <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
 Simpan Pengaturan Sistem & Berkas Foto
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
 Pastikan data identitas sekolah, logo/foto, dan preferensi tema sudah sesuai sebelum diterapkan.
 </p>
 </div>
 </div>

 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/80 p-4 dark:border-emerald-800/80 dark:bg-slate-900/60 space-y-3">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2.5 border-b border-emerald-200/80 dark:border-emerald-800/70">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Nama Sekolah & Aplikasi</span>
 <span className="text-xs font-extrabold text-slate-900 dark:text-white sm:text-right truncate max-w-xs">
 {form.school_name || form.application_name || 'Dareliman Edu'}
 </span>
 </div>

 <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-emerald-200/80 dark:border-emerald-800/70">
 <div className="flex items-center gap-2.5 min-w-0">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Logo Resmi:</span>
 {logoPreview ? (
 <button
 type="button"
 onClick={() => onPreviewPhoto && onPreviewPhoto(logoPreview, 'Logo Resmi Sekolah')}
 className="group relative flex size-9 shrink-0 items-center justify-center rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-0.5 dark:border-emerald-800/60 dark:bg-slate-800 shadow-2xs hover:scale-105 transition-transform cursor-pointer"
 title="Klik untuk lihat pratinjau penuh"
 >
 <img src={logoPreview} alt="Logo" className="size-full rounded-lg object-contain" />
 <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity">
 <Eye className="size-3 text-emerald-600" />
 </div>
 </button>
 ) : (
 <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-[10px] font-black text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
 {form.logo_text || 'LOGO'}
 </div>
 )}
 <div className="min-w-0">
 <span className={`inline-block text-xs font-bold ${
 hasNewLogo
 ? 'text-teal-700 dark:text-teal-400'
 : logoPreview
 ? 'text-emerald-700 dark:text-emerald-400'
 : 'text-slate-500'
 }`}>
 {hasNewLogo ? '✓ Berkas Baru Siap Diunggah' : logoPreview ? '✓ Logo Terpasang' : 'Teks Fallback'}
 </span>
 {hasNewLogo && files.logo && (
 <p className="text-[10px] text-slate-400 truncate">
 {files.logo.name} ({(files.logo.size / 1024).toFixed(1)} KB)
 </p>
 )}
 </div>
 </div>
 {hasNewLogo && (
 <span className="shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-[9px] font-extrabold text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
 Upload Baru
 </span>
 )}
 </div>

 <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-emerald-200/80 dark:border-emerald-800/70">
 <div className="flex items-center gap-2.5 min-w-0">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">Favicon Browser:</span>
 {faviconPreview ? (
 <div className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-0.5 dark:border-emerald-800/60 dark:bg-slate-800 shadow-2xs">
 <img src={faviconPreview} alt="Favicon" className="size-full rounded object-contain" />
 </div>
 ) : (
 <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-[9px] font-black text-slate-600 dark:bg-emerald-950/60 dark:text-emerald-300">
 ICO
 </div>
 )}
 <span className={`text-xs font-bold ${
 hasNewFavicon
 ? 'text-teal-700 dark:text-teal-400'
 : faviconPreview
 ? 'text-emerald-700 dark:text-emerald-400'
 : 'text-slate-500'
 }`}>
 {hasNewFavicon ? '✓ Favicon Baru Siap Diunggah' : faviconPreview ? '✓ Favicon Terpasang' : 'Standar Sistem'}
 </span>
 </div>
 {hasNewFavicon && (
 <span className="shrink-0 rounded-full bg-teal-100 px-2 py-0.5 text-[9px] font-extrabold text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
 Upload Baru
 </span>
 )}
 </div>

 <div className="flex items-center justify-between gap-2">
 <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Palet Gaya & Warna</span>
 <div className="flex items-center gap-2">
 <div className="flex items-center gap-1.5">
 <span
 className="size-4.5 rounded-md border border-black/10 shadow-2xs"
 style={{ backgroundColor: form.sidebar_color || '#059669' }}
 title={`Sidebar: ${form.sidebar_color}`}
 />
 <span
 className="size-4.5 rounded-md border border-black/10 shadow-2xs"
 style={{ backgroundColor: form.sidebar_accent_color || '#10B981' }}
 title={`Aksen: ${form.sidebar_accent_color}`}
 />
 <span
 className="size-4.5 rounded-md border border-black/10 shadow-2xs"
 style={{ backgroundColor: form.header_color || '#FFFFFF' }}
 title={`Header: ${form.header_color}`}
 />
 </div>
 <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
 {form.sidebar_style || 'gradient'} / {form.header_style || 'solid'}
 </span>
 </div>
 </div>
 </div>

 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/70 p-3.5 text-xs font-medium leading-relaxed flex items-start gap-3 text-emerald-950 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-200">
 <div className="flex size-6 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-xs mt-0.5">
 <Sparkles className="size-3.5" />
 </div>
 <div className="flex-1 leading-relaxed text-xs">
 Perubahan identitas sekolah, berkas foto/logo resmi, dan tata warna akan disimpan ke server storage dan diterapkan secara instan ke seluruh antarmuka Dareliman Edu.
 </div>
 </div>

 <div className="flex items-center justify-end gap-2.5 pt-2">
 <Button
 type="button"
 variant="outline"
 onClick={onClose}
 disabled={isSaving}
 className="h-9 px-4 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white hover:bg-emerald-50/50 text-sm font-medium text-slate-700 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200 transition-colors cursor-pointer"
 >
 Batal
 </Button>
 <Button
 type="button"
 variant="primary"
 onClick={onConfirm}
 disabled={isSaving}
 className="h-9 px-4 rounded-lg bg-emerald-600 text-sm font-medium text-white shadow-xs text-white border border-emerald-200/80 dark:border-emerald-800/60"
 >
 {isSaving ? (
 <>
 <div className="size-4 animate-spin rounded-full border-2 border-emerald-200/80 border-t-transparent" />
 <span>Menyimpan ke Server...</span>
 </>
 ) : (
 <>
 <Save className="size-4" />
 <span>Ya, Simpan Pengaturan</span>
 </>
 )}
 </Button>
 </div>
 </div>
 </motion.div>
 </div>
 )
}

function HarmonizedStatusModal({ isOpen, onClose, type = 'success', title, message }) {
 if (!isOpen) return null

 const isSuccess = type === 'success'
 const isError = type === 'error'

 return (
 <div className="fixed inset-0 z-[75] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 16 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.94, y: 16 }}
 transition={{ type: 'spring', damping: 25, stiffness: 350 }}
 className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] dark:border-emerald-800/60 dark:bg-[#1B2433] my-auto"
 >
 <div
 className={`h-1.5 w-full ${
 isSuccess
 ? 'bg-white dark:bg-[#1B2433]'
 : isError
 ? 'bg-rose-600 hover:bg-rose-700 text-white'
 : 'bg-white dark:bg-[#1B2433]'
 }`}
 />

 <button
 type="button"
 onClick={onClose}
 aria-label="Tutup dialog"
 className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-xl bg-emerald-50 hover:bg-slate-200 text-emerald-700 hover:text-slate-800 dark:bg-emerald-950/40 dark:hover:bg-slate-700 dark:text-emerald-300 cursor-pointer transition-all active:scale-95 z-20 shadow-xs"
 >
 <X className="size-4" strokeWidth={2.2} />
 </button>

 <div className="p-5 sm:p-6 space-y-4">
 <div className="flex items-start gap-3.5 pr-8">
 <div
 className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl  shadow-md ${
 isSuccess
 ? 'bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shadow-xs'
 : isError
 ? 'bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 shadow-xs'
 : 'bg-white dark:bg-[#1B2433] shadow-cyan-500/30 border border-emerald-200/80 dark:border-emerald-800/60'
 }`}
 >
 {isSuccess ? (
 <CheckCircle2 className="h-6 w-6" />
 ) : isError ? (
 <AlertTriangle className="h-6 w-6" />
 ) : (
 <Sparkles className="h-6 w-6" />
 )}
 </div>
 <div>
 <span
 className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
 isSuccess
 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60'
 : isError
 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-emerald-200/80 dark:border-emerald-800/60'
 : 'bg-teal-100 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border border-emerald-200/80 dark:border-emerald-800/60'
 }`}
 >
 {isSuccess ? 'Penyimpanan Berhasil' : isError ? 'Penyimpanan Gagal' : 'Informasi Pengaturan'}
 </span>
 <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 leading-snug">
 {title}
 </h3>
 </div>
 </div>

 <div
 className={`rounded-xl border p-3.5 text-xs font-medium leading-relaxed ${
 isSuccess
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 text-emerald-950 dark:border-emerald-800/60 dark:bg-emerald-950/20 dark:text-emerald-200'
 : isError
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/60 text-rose-950 dark:border-emerald-800/60 dark:bg-rose-950/20 dark:text-rose-200'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-teal-50/60 text-teal-950 dark:border-emerald-800/60 dark:bg-teal-950/20 dark:text-teal-200'
 }`}
 >
 <p className="leading-relaxed">{message}</p>
 </div>

 {isSuccess && (
 <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-bold text-slate-600 dark:text-slate-300">
 <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 border border-emerald-200/80 dark:border-emerald-800/60">
 <Check className="size-3.5 text-emerald-600 shrink-0" strokeWidth={2.5} />
 <span className="truncate">Identitas & Logo</span>
 </div>
 <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 border border-emerald-200/80 dark:border-emerald-800/60">
 <Check className="size-3.5 text-emerald-600 shrink-0" strokeWidth={2.5} />
 <span className="truncate">Gaya & Tema Visual</span>
 </div>
 </div>
 )}

 <div className="flex items-center justify-end pt-2">
 <button
 type="button"
 onClick={onClose}
 className="h-9 px-5 rounded-lg bg-emerald-600 dark:bg-emerald-50 dark:text-slate-900 dark: hover:from-emerald-500 hover:to-teal-500 text-xs font-black shadow-sm transition active:scale-95 inline-flex items-center gap-2 cursor-pointer text-white border border-emerald-200/80 dark:border-emerald-800/60 text-sm font-medium"
 >
 <Check className="size-4" strokeWidth={2.5} />
 <span>OK, Mengerti</span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )
}

function PhotoPreviewModal({ isOpen, onClose, photoUrl, title }) {
 if (!isOpen || !photoUrl) return null

 return (
 <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
 <motion.div
 initial={{ opacity: 0, scale: 0.92 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.92 }}
 transition={{ type: 'spring', damping: 25, stiffness: 350 }}
 className="relative w-full max-w-lg overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] dark:border-emerald-800/60 dark:bg-[#1B2433] my-auto"
 >

 <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 px-5 py-3.5">
 <div className="flex items-center gap-2.5 min-w-0">
 <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300">
 <Image className="size-4" />
 </div>
 <div className="min-w-0">
 <h4 className="text-xs font-extrabold text-slate-900 dark:text-white ">
 {title || 'Pratinjau Foto / Logo'}
 </h4>
 <p className="text-[10px] text-slate-400 truncate">Resolusi Penuh • Media Asset</p>
 </div>
 </div>
 <button
 type="button"
 onClick={onClose}
 aria-label="Tutup pratinjau"
 className="size-8 flex items-center justify-center rounded-xl bg-emerald-50 hover:bg-slate-200 text-emerald-700 hover:text-slate-800 dark:bg-emerald-950/40 dark:hover:bg-slate-700 dark:text-emerald-300 cursor-pointer transition-all active:scale-95"
 >
 <X className="size-4" strokeWidth={2.2} />
 </button>
 </div>

 <div className="p-6 flex flex-col items-center justify-center bg-slate-50/70 dark:bg-slate-900/50 min-h-[260px]">
 <div className="relative max-h-[320px] max-w-full flex items-center justify-center p-3 rounded-xl bg-white dark:bg-slate-800/80 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-800/60 shadow-sm">
 <img
 src={photoUrl}
 alt={title || 'Pratinjau Foto'}
 className="max-h-[280px] w-auto max-w-full object-contain rounded-xl"
 />
 </div>
 </div>

 <div className="flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/60 px-5 py-3 bg-white dark:bg-[#1B2433]">
 <a
 href={photoUrl}
 target="_blank"
 rel="noopener noreferrer"
 download
 className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
 >
 <Download className="size-3.5" />
 <span>Unduh Berkas</span>
 </a>
 <button
 type="button"
 onClick={onClose}
 className="h-8.5 px-4 rounded-xl bg-emerald-50 hover:bg-slate-200 text-emerald-700 text-xs font-bold dark:bg-emerald-950/40 dark:hover:bg-slate-700 dark:text-slate-200 cursor-pointer transition"
 >
 Tutup
 </button>
 </div>
 </motion.div>
 </div>
 )
}

export default function PengaturanPage() {
 const toast = useToast()
 const user = useAuthStore((state) => state.user)

 const settings = usePengaturanStore((state) => state.pengaturan)
 const saveSettings = usePengaturanStore((state) => state.simpanPengaturan)
 const loadSettings = usePengaturanStore((state) => state.muatPengaturan)
 const previewSettings = usePengaturanStore((state) => state.previewPengaturan)

 // Confirmation Modal State
 const [confirmModal, setConfirmModal] = useState({
 isOpen: false,
 action: '',
 id: null,
 title: '',
 desc: '',
 confirmLabel: '',
 variant: 'danger',
 })

 // Otorisasi & Peran Pengguna (Strict Super Admin & Admin Check)
 const userRoles = useMemo(() => {
 if (!user) return []
 if (Array.isArray(user.roles)) return user.roles.map((r) => (typeof r === 'string' ? r : r.name || ''))
 if (user.role) return [typeof user.role === 'string' ? user.role : user.role.name || '']
 return []
 }, [user])

 const isSuperAdminOrAdmin = useMemo(() => {
 const rolesLower = userRoles.map((r) => String(r).toLowerCase().replace(/[\s_-]+/g, ''))
 return rolesLower.some((r) => ['superadmin', 'admin', 'super_admin'].includes(r))
 }, [userRoles])

 // Clear Navigation Tabs for System Management (Super Admin & Admin Only)
 const tabs = useMemo(() => {
 return [
 { id: 'identitas', label: 'Identitas Sekolah & Aplikasi', icon: Image },
 { id: 'tema', label: 'Style & Tema Website', icon: Palette },
 { id: 'sipdei', label: 'Integrasi SIPDEI & VA', icon: CreditCard },
 { id: 'labels', label: 'Kustomisasi Label (JSON)', icon: Languages },
 { id: 'bantuan_faq', label: 'Kelola Bantuan & FAQ', icon: LifeBuoy },
 { id: 'operasional', label: 'Operasional & Kebijakan', icon: Sliders },
 ]
 }, [])

 const [activeTab, setActiveTab] = useState('identitas')
 const [form, setForm] = useState(settings)
 const [files, setFiles] = useState({})
 const [previews, setPreviews] = useState({})
 const [saving, setSaving] = useState(false)
 const [showMapboxToken, setShowMapboxToken] = useState(false)
 const [showSipdeiKey, setShowSipdeiKey] = useState(false)
 const [statusModal, setStatusModal] = useState({
 isOpen: false,
 type: 'success',
 title: '',
 message: '',
 })
 const [isSaveConfirmOpen, setIsSaveConfirmOpen] = useState(false)
 const [previewPhotoModal, setPreviewPhotoModal] = useState({
 isOpen: false,
 url: '',
 title: '',
 })

 // Labels Customization States
 const [labelsSubTab, setLabelsSubTab] = useState('terminology') // 'terminology' | 'categories' | 'json'
 const [activeLabelCategory, setActiveLabelCategory] = useState('terminology')
 const [rawJsonText, setRawJsonText] = useState('')
 const [jsonError, setJsonError] = useState(null)
 const [copiedJson, setCopiedJson] = useState(false)

 // Sync rawJsonText when form.custom_labels updates
 useEffect(() => {
 if (form.custom_labels) {
 setRawJsonText(JSON.stringify(form.custom_labels, null, 2))
 } else {
 setRawJsonText(JSON.stringify(defaultLabels, null, 2))
 }
 }, [form.custom_labels])

 const handleUpdateLabel = (category, key, value) => {
 const currentLabels = form.custom_labels || defaultLabels
 const catObj = currentLabels[category] || {}
 const updated = {
 ...currentLabels,
 [category]: {
 ...catObj,
 [key]: value,
 },
 }
 update('custom_labels', updated)
 setRawJsonText(JSON.stringify(updated, null, 2))
 }

 const handleApplyTerminologyPreset = (presetKey) => {
 let presetTerminology = {}
 if (presetKey === 'pesantren') {
 presetTerminology = {
 siswa: 'Santri',
 siswa_plural: 'Santriwan / Santriwati',
 guru: 'Ustadz / Asatidz',
 guru_plural: 'Dewan Asatidz & Pembina',
 kelas: 'Halaqah / Rombel',
 sekolah: 'Pondok Pesantren',
 yayasan: 'Yayasan Pondok Pesantren',
 kepala_sekolah: "Mudir / Pimpinan Ma'had",
 wali_kelas: 'Musyrif / Musyrifah',
 asrama: 'Kobong / Asrama',
 musyrif: 'Musyrif Asrama',
 mata_pelajaran: 'Mata Pelajaran / Kitab',
 halaqah: "Halaqah Al-Qur'an",
 }
 } else if (presetKey === 'madrasah') {
 presetTerminology = {
 siswa: 'Peserta Didik',
 siswa_plural: 'Peserta Didik',
 guru: 'Tenaga Pendidik',
 guru_plural: 'Dewan Guru & Tenaga Kependidikan',
 kelas: 'Rombongan Belajar',
 sekolah: 'Madrasah',
 yayasan: 'Yayasan Pendidikan',
 kepala_sekolah: 'Kepala Madrasah',
 wali_kelas: 'Wali Kelas',
 asrama: 'Asrama Boarding',
 musyrif: 'Pembina Asrama',
 mata_pelajaran: 'Mata Pelajaran',
 halaqah: 'Kelas Tahfizh',
 }
 } else {
 presetTerminology = {
 siswa: 'Siswa',
 siswa_plural: 'Siswa / Santri',
 guru: 'Guru',
 guru_plural: 'Guru & Pendidik',
 kelas: 'Kelas / Rombel',
 sekolah: 'Sekolah / Madrasah',
 yayasan: 'Yayasan',
 kepala_sekolah: 'Kepala Sekolah',
 wali_kelas: 'Wali Kelas',
 asrama: 'Asrama / Pondok',
 musyrif: 'Musyrif / Pembina',
 mata_pelajaran: 'Mata Pelajaran',
 halaqah: 'Halaqah Tahfizh',
 }
 }

 let presetUjian = {}
 if (presetKey === 'pesantren') {
 presetUjian = {
 jenis_uh: 'Ikhtibar Dauri (Harian)',
 jenis_pts: 'Ikhtibar Nisfus Sanah',
 jenis_pas: 'Ikhtibar Nihayatus Sanah',
 singkatan_uh: 'Dauri',
 singkatan_pts: 'Nisfus Sanah',
 singkatan_pas: 'Nihayah',
 }
 } else if (presetKey === 'madrasah') {
 presetUjian = {
 jenis_uh: 'Asesmen Sumatif Lingkup Materi (ASLM)',
 jenis_pts: 'Asesmen Sumatif Tengah Semester (AStS)',
 jenis_pas: 'Asesmen Sumatif Akhir Semester (ASAS)',
 singkatan_uh: 'ASLM',
 singkatan_pts: 'AStS',
 singkatan_pas: 'ASAS',
 }
 } else {
 presetUjian = {
 jenis_uh: 'Ulangan Harian (UH)',
 jenis_pts: 'Penilaian Tengah Semester (PTS)',
 jenis_pas: 'Penilaian Akhir Semester (PAS)',
 singkatan_uh: 'UH',
 singkatan_pts: 'PTS',
 singkatan_pas: 'PAS',
 }
 }

 const currentLabels = form.custom_labels || defaultLabels
 const updated = {
 ...currentLabels,
 terminology: {
 ...currentLabels.terminology,
 ...presetTerminology,
 },
 ujian: {
 ...(currentLabels.ujian || defaultLabels.ujian),
 ...presetUjian,
 },
 }
 update('custom_labels', updated)
 setRawJsonText(JSON.stringify(updated, null, 2))
 setStatusModal({
 isOpen: true,
 type: 'info',
 title: 'Preset Diterapkan',
 message: `Terminologi institusi disesuaikan ke mode "${
 presetKey === 'pesantren' ? 'Pondok Pesantren' : presetKey === 'madrasah' ? 'Madrasah (Kemenag)' : 'Sekolah Umum'
 }". Klik "Simpan Pengaturan" di atas untuk menyimpan ke server.`,
 })
 }

 const handleRawJsonChange = (text) => {
 setRawJsonText(text)
 try {
 const parsed = JSON.parse(text)
 if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
 update('custom_labels', parsed)
 setJsonError(null)
 } else {
 setJsonError('Format JSON harus berupa objek (Object).')
 }
 } catch (e) {
 setJsonError(`Sintaks JSON belum valid: ${e.message}`)
 }
 }

 const handleCopyJson = () => {
 const text = rawJsonText || JSON.stringify(form.custom_labels || defaultLabels, null, 2)
 navigator.clipboard?.writeText(text)
 setCopiedJson(true)
 setTimeout(() => setCopiedJson(false), 2000)
 }

 const handleDownloadJson = () => {
 const text = JSON.stringify(form.custom_labels || defaultLabels, null, 2)
 const blob = new Blob([text], { type: 'application/json' })
 const url = URL.createObjectURL(blob)
 const a = document.createElement('a')
 a.href = url
 a.download = `dareliman-labels-${new Date().toISOString().slice(0, 10)}.json`
 a.click()
 URL.revokeObjectURL(url)
 }

 const handleUploadJson = (event) => {
 const file = event.target.files?.[0]
 if (!file) return
 const reader = new FileReader()
 reader.onload = (e) => {
 try {
 const parsed = JSON.parse(e.target.result)
 if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
 update('custom_labels', parsed)
 setRawJsonText(JSON.stringify(parsed, null, 2))
 setJsonError(null)
 setStatusModal({
 isOpen: true,
 type: 'success',
 title: 'File JSON Berhasil Dimuat',
 message: `Kamus label dari file "${file.name}" berhasil diimpor. Klik "Simpan Pengaturan" untuk menerapkan secara permanen.`,
 })
 } else {
 throw new Error('File JSON tidak berisi objek valid.')
 }
 } catch (err) {
 setStatusModal({
 isOpen: true,
 type: 'error',
 title: 'Gagal Membaca JSON',
 message: `File JSON tidak valid: ${err.message}`,
 })
 }
 }
 reader.readAsText(file)
 event.target.value = ''
 }

 const handleResetLabels = () => {
 update('custom_labels', defaultLabels)
 setRawJsonText(JSON.stringify(defaultLabels, null, 2))
 setJsonError(null)
 setStatusModal({
 isOpen: true,
 type: 'info',
 title: 'Label Dikembalikan ke Default',
 message: 'Kamus label telah direset ke teks bawaan sistem. Klik "Simpan Pengaturan" untuk menyimpan ke server.',
 })
 }

 // FAQ Modal & Editing States
 const [isFaqModalOpen, setIsFaqModalOpen] = useState(false)
 const [editingFaq, setEditingFaq] = useState(null)
 const [faqForm, setFaqForm] = useState({
 category: 'Akademik & LMS',
 question: '',
 answer: '',
 tags: '',
 actionUrl: '',
 actionLabel: '',
 })

 // Manual Book Modal & Editing States
 const [isManualModalOpen, setIsManualModalOpen] = useState(false)
 const [editingManual, setEditingManual] = useState(null)
 const [manualForm, setManualForm] = useState({
 title: '',
 version: 'v2.4 (2026)',
 size: '3.5 MB',
 format: 'PDF',
 target: 'Guru & Staf',
 desc: '',
 url: '#',
 })

 // Load Settings on Component Mount
 useEffect(() => {
 if (isSuperAdminOrAdmin) {
 loadSettings()
 }
 }, [isSuperAdminOrAdmin, loadSettings])

 useEffect(() => {
 if (isSuperAdminOrAdmin) {
 setForm(settings)
 }
 }, [isSuperAdminOrAdmin, settings])

 // Update Field Handler with Live Preview
 const update = (key, value) => {
 setForm((current) => {
 const next = { ...current, [key]: value }
 previewSettings(next)
 return next
 })
 }

 // Apply Preset Theme
 const applyPreset = (preset) => {
 setForm((current) => {
 const next = { ...current, ...preset }
 previewSettings(next)
 return next
 })
 }

 const previewLogo = previews.logo || form.logo_url
 const previewFavicon = previews.favicon || form.favicon_url

 const previewStyle = useMemo(
 () => ({
 '--preview-sidebar': form.sidebar_color || '#059669',
 '--preview-accent': form.sidebar_accent_color || '#10B981',
 '--preview-header': form.header_color || '#FFFFFF',
 '--preview-body': form.body_color || '#F2FBF7',
 }),
 [form]
 )

 const chooseFile = (type, event) => {
 const file = event.target.files?.[0]
 if (!file) return
 setFiles((current) => ({ ...current, [type]: file }))
 setPreviews((current) => ({ ...current, [type]: URL.createObjectURL(file) }))
 update(`remove_${type}`, false)
 }

 const removeAsset = (type) => {
 setFiles((current) => ({ ...current, [type]: null }))
 setPreviews((current) => ({ ...current, [type]: '' }))
 update(`${type}_url`, '')
 update(`remove_${type}`, true)
 }

 const reset = () => {
 setForm({
 ...defaultPengaturan,
 remove_logo: true,
 remove_favicon: true,
 custom_faqs: INITIAL_FAQS,
 custom_manuals: INITIAL_MANUALS,
 custom_labels: defaultLabels,
 })
 setFiles({})
 setPreviews({})
 setRawJsonText(JSON.stringify(defaultLabels, null, 2))
 previewSettings(defaultPengaturan)
 setStatusModal({
 isOpen: true,
 type: 'info',
 title: 'Reset Berhasil',
 message: 'Pengaturan tampilan, tema, dan label telah dikembalikan ke bawaan sistem.',
 })
 }

 // Submit School System Settings
 const submitSchoolSettings = async (event) => {
 if (event) event.preventDefault()
 setSaving(true)
 try {
 await saveSettings(form, files)
 setFiles({})
 setPreviews({})
 setIsSaveConfirmOpen(false)
 setStatusModal({
 isOpen: true,
 type: 'success',
 title: 'Pengaturan Berhasil Disimpan!',
 message: 'Identitas sekolah, berkas logo & foto resmi, tema visual, serta pengaturan operasional berhasil disimpan ke server.',
 })
 } catch (error) {
 const errors = error?.response?.data?.errors
 const message = errors 
 ? Object.values(errors).flat()[0] 
 : (error?.response?.data?.message || error?.message || 'Pengaturan belum dapat disimpan.')
 setIsSaveConfirmOpen(false)
 setStatusModal({
 isOpen: true,
 type: 'error',
 title: 'Gagal Menyimpan Pengaturan',
 message,
 })
 } finally {
 setSaving(false)
 }
 }

 // ─────────────────────────────────────────────────────────────────────────────
 // FAQ MANAGEMENT HANDLERS
 // ─────────────────────────────────────────────────────────────────────────────
 const openAddFaqModal = () => {
 setEditingFaq(null)
 setFaqForm({
 category: 'Akademik & LMS',
 question: '',
 answer: '',
 tags: '',
 actionUrl: '',
 actionLabel: '',
 })
 setIsFaqModalOpen(true)
 }

 const openEditFaqModal = (faq) => {
 setEditingFaq(faq)
 setFaqForm({
 category: faq.category || 'Akademik & LMS',
 question: faq.question || '',
 answer: faq.answer || '',
 tags: Array.isArray(faq.tags) ? faq.tags.join(', ') : faq.tags || '',
 actionUrl: faq.actionUrl || '',
 actionLabel: faq.actionLabel || '',
 })
 setIsFaqModalOpen(true)
 }

 const handleSaveFaq = (e) => {
 e.preventDefault()
 if (!faqForm.question.trim() || !faqForm.answer.trim()) {
 toast.warning('Form Belum Lengkap', 'Mohon isi Pertanyaan dan Jawaban Detail.')
 return
 }

 const newFaqItem = {
 id: editingFaq ? editingFaq.id : `faq-custom-${Date.now()}`,
 category: faqForm.category,
 question: faqForm.question.trim(),
 answer: faqForm.answer.trim(),
 tags: faqForm.tags
 .split(',')
 .map((t) => t.trim())
 .filter(Boolean),
 actionUrl: faqForm.actionUrl.trim() || null,
 actionLabel: faqForm.actionLabel.trim() || null,
 }

 let updatedFaqs = []
 const currentFaqs = form.custom_faqs || INITIAL_FAQS

 if (editingFaq) {
 updatedFaqs = currentFaqs.map((item) => (item.id === editingFaq.id ? newFaqItem : item))
 } else {
 updatedFaqs = [newFaqItem, ...currentFaqs]
 }

 update('custom_faqs', updatedFaqs)
 setIsFaqModalOpen(false)
 toast.success('Berhasil', editingFaq ? 'Topik FAQ berhasil diperbarui.' : 'Topik FAQ baru berhasil ditambahkan.')
 }

 const handleDeleteFaq = (id) => {
 const faq = (form.custom_faqs || INITIAL_FAQS).find((f) => f.id === id)
 setConfirmModal({
 isOpen: true,
 action: 'delete_faq',
 id,
 title: 'Hapus Topik FAQ?',
 desc: `Apakah Anda yakin ingin menghapus topik FAQ "${faq?.question || 'ini'}"? FAQ ini tidak akan tampil lagi pada halaman Bantuan & Panduan.`,
 confirmLabel: 'Ya, Hapus FAQ',
 variant: 'danger',
 })
 }

 const handleResetFaqs = () => {
 setConfirmModal({
 isOpen: true,
 action: 'reset_faq',
 id: null,
 title: 'Reset Semua FAQ?',
 desc: 'Seluruh daftar FAQ akan dikembalikan ke data standar bawaan Dareliman Edu.',
 confirmLabel: 'Ya, Reset FAQ',
 variant: 'emerald',
 })
 }

 // ─────────────────────────────────────────────────────────────────────────────
 // MANUAL BOOK MANAGEMENT HANDLERS
 // ─────────────────────────────────────────────────────────────────────────────
 const openAddManualModal = () => {
 setEditingManual(null)
 setManualForm({
 title: '',
 version: 'v2.4 (2026)',
 size: '3.5 MB',
 format: 'PDF',
 target: 'Guru & Staf Sekolah',
 desc: '',
 url: '#',
 })
 setIsManualModalOpen(true)
 }

 const openEditManualModal = (item) => {
 setEditingManual(item)
 setManualForm({
 title: item.title || '',
 version: item.version || '',
 size: item.size || '3.5 MB',
 format: item.format || 'PDF',
 target: item.target || '',
 desc: item.desc || '',
 url: item.url || '#',
 })
 setIsManualModalOpen(true)
 }

 const handleSaveManual = (e) => {
 e.preventDefault()
 if (!manualForm.title.trim() || !manualForm.desc.trim()) {
 toast.warning('Form Belum Lengkap', 'Mohon isi Judul Buku Panduan dan Deskripsi Ringkas.')
 return
 }

 const newManualItem = {
 id: editingManual ? editingManual.id : `manual-custom-${Date.now()}`,
 title: manualForm.title.trim(),
 version: manualForm.version.trim(),
 size: manualForm.size.trim(),
 format: manualForm.format.trim(),
 target: manualForm.target.trim(),
 desc: manualForm.desc.trim(),
 url: manualForm.url.trim() || '#',
 }

 let updatedManuals = []
 const currentManuals = form.custom_manuals || INITIAL_MANUALS

 if (editingManual) {
 updatedManuals = currentManuals.map((item) => (item.id === editingManual.id ? newManualItem : item))
 } else {
 updatedManuals = [...currentManuals, newManualItem]
 }

 update('custom_manuals', updatedManuals)
 setIsManualModalOpen(false)
 toast.success('Berhasil', editingManual ? 'Buku Panduan diperbarui.' : 'Buku Panduan baru ditambahkan.')
 }

 const handleDeleteManual = (id) => {
 const manual = (form.custom_manuals || INITIAL_MANUALS).find((m) => m.id === id)
 setConfirmModal({
 isOpen: true,
 action: 'delete_manual',
 id,
 title: 'Hapus Buku Panduan?',
 desc: `Apakah Anda yakin ingin menghapus buku panduan "${manual?.title || 'ini'}"? Buku panduan ini tidak akan dapat diunduh pengguna lagi.`,
 confirmLabel: 'Ya, Hapus Panduan',
 variant: 'danger',
 })
 }

 const executeConfirmAction = () => {
 if (confirmModal.action === 'delete_faq') {
 const currentFaqs = form.custom_faqs || INITIAL_FAQS
 const updated = currentFaqs.filter((f) => f.id !== confirmModal.id)
 update('custom_faqs', updated)
 toast.success('Terhapus', 'Topik FAQ telah dihapus.')
 } else if (confirmModal.action === 'reset_faq') {
 update('custom_faqs', INITIAL_FAQS)
 toast.success('Berhasil', 'Daftar FAQ dikembalikan ke versi bawaan.')
 } else if (confirmModal.action === 'delete_manual') {
 const currentManuals = form.custom_manuals || INITIAL_MANUALS
 const updated = currentManuals.filter((m) => m.id !== confirmModal.id)
 update('custom_manuals', updated)
 toast.success('Terhapus', 'Buku panduan telah dihapus.')
 }
 setConfirmModal({ isOpen: false, action: '', id: null, title: '', desc: '', confirmLabel: '', variant: 'danger' })
 }

 	// Strict 403 Forbidden Access Guard
 	if (!isSuperAdminOrAdmin) {
 		return (
 			<PageContainer maxW="7xl" className="space-y-6 pb-12">
 				<div className="p-6 max-w-3xl mx-auto space-y-4 pt-12">
 					<div className="p-8 bg-rose-50/90 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl dark:bg-rose-950/40 dark:border-emerald-800/60 text-rose-900 dark:text-rose-200 space-y-4 shadow-xl">
 						<div className="flex items-center gap-4">
 							<div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-lg shadow-sm">
 								<Shield className="w-7 h-7" />
 							</div>
 							<div>
 								<h2 className="text-xl font-black">Akses Ditolak (403 Forbidden)</h2>
 								<p className="text-xs sm:text-sm text-rose-700 dark:text-rose-300 mt-1 leading-relaxed">
 									Halaman Pengaturan Tampilan & Identitas Sistem <strong>HANYA</strong> dapat diakses oleh pengguna dengan kewenangan role <strong>Super Admin</strong> dan <strong>Admin Utama</strong>.
 								</p>
 							</div>
 						</div>
 						<div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 flex items-center justify-between">
 							<span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
 								Peran Anda saat ini: {userRoles.join(", ") || 'Pengguna Terdaftar'}
 							</span>
 							<Button variant="ghost" onClick={() => (window.location.href = '/dashboard')}>
 								Kembali ke Dashboard Utama
 							</Button>
 						</div>
 					</div>
 				</div>
 			</PageContainer>
 		)
 	}

 const currentFaqs = form.custom_faqs || INITIAL_FAQS
 const currentManuals = form.custom_manuals || INITIAL_MANUALS

 return (
 		<PageContainer maxW="7xl" className="space-y-6 pb-12">
 			<form onSubmit={(e) => { e.preventDefault(); setIsSaveConfirmOpen(true); }} className="space-y-6">
 				{/* 1. App Breadcrumb Navigation */}
 				<div className="mb-4">
 					<AppBreadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Pengaturan Tampilan & Identitas' }]} />
 				</div>

 {/* 2. HeroUI Modern Hero Card Header */}
      <HeroUiHeader
        title="Pengaturan Tampilan & Identitas Sistem"
        subtitle="Konfigurasi terpusat identitas sekolah, style & tema website, konten Bantuan & FAQ, serta preferensi operasional Dareliman Edu."
        badge="Akses Khusus Super Admin & Admin"
        icon={AppWindow}
        actions={
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={reset}
              className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white/80 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:text-slate-900 dark:border-emerald-800/60 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 shadow-2xs transition-all cursor-pointer"
            >
              <RotateCcw className="h-4 w-4 text-emerald-600 dark:text-slate-400" />
              <span>Reset Warna Semula</span>
            </Button>
            <Button
              type="button"
              variant="create"
              size="sm"
              disabled={saving}
              pending={saving}
              onClick={() => setIsSaveConfirmOpen(true)}
              className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Save className="h-4 w-4 text-white" />
              <span>{saving ? "Menyimpan..." : "Simpan Pengaturan"}</span>
            </Button>
          </div>
        }
      />

      {/* 3. Main Configuration Workspace Grid */}
 <div className={`grid gap-6 ${activeTab === 'identitas' || activeTab === 'tema' ? 'lg:grid-cols-[1fr_340px]' : 'grid-cols-1'}`}>
 <section className="w-full overflow-hidden rounded-[22px] border-2 border-emerald-200/80 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 {/* Navigation Tabs Bar */}
 <div className="border-b border-emerald-200/80 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-3 sm:p-4 dark:border-emerald-800/60">
 <AppTabs
 tabs={tabs}
 activeTab={activeTab}
 onChange={setActiveTab}
 ariaLabel="Kategori pengaturan sistem"
 />
 </div>

 <div className="p-6">
 {/* TAB 1: IDENTITAS SEKOLAH & APLIKASI */}
 {activeTab === 'identitas' && (
 <div className="space-y-6">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 p-4 text-xs dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <div className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-300">
 <Building className="h-4 w-4 text-emerald-700" />
 <span>Identitas Resmi Yayasan / Sekolah</span>
 </div>
 <p className="mt-1 text-xs text-emerald-800/80 dark:text-emerald-300/80">
 Informasi identitas ini digunakan pada header aplikasi, cetak laporan PDF, cetak kartu siswa, dan halaman publik.
 </p>
 </div>

 <div className="grid gap-5 md:grid-cols-2">
 <Field
 label="Nama Aplikasi"
 value={form.application_name}
 onChange={(v) => update('application_name', v)}
 icon={Globe}
 placeholder="Contoh: Sistem Manajemen Sekolah Terpadu"
 />
 <Field
 label="Nama Sekolah / Yayasan"
 value={form.school_name}
 onChange={(v) => update('school_name', v)}
 icon={Building}
 placeholder="Contoh: Yayasan Pendidikan Islam"
 />
 <Field
 label="Singkatan / Logo Teks (fallback)"
 value={form.logo_text}
 maxLength={20}
 onChange={(v) => update('logo_text', v)}
 placeholder="Contoh: YDE"
 />
 <Field
 label="Alamat Kantor / Yayasan (Kop Surat)"
 value={form.address || ''}
 onChange={(v) => update('address', v)}
 icon={MapPin}
 placeholder="Contoh: Jl. Belanti Barat No. 1, Khatib Sulaiman, Padang"
 />
 <Field
 label="No. Telepon Resmi Lembaga"
 value={form.phone || ''}
 onChange={(v) => update('phone', v)}
 icon={Phone}
 placeholder="Contoh: (0751) 7051234 atau 08123456789"
 />
 <Field
 label="Legalitas / SK Kemenkumham / No. AHU"
 value={form.sk_pendirian || ''}
 onChange={(v) => update('sk_pendirian', v)}
 icon={FileText}
 placeholder="Contoh: AHU-0012345.AH.01.04.2005"
 />
 <Field
 label="Website Resmi Lembaga"
 value={form.website || ''}
 onChange={(v) => update('website', v)}
 icon={Globe}
 placeholder="Contoh: https://dareliman.or.id"
 />
 <Field
 label="Email Resmi Lembaga"
 value={form.email || ''}
 onChange={(v) => update('email', v)}
 icon={Mail}
 placeholder="Contoh: sekretariat@dareliman.or.id"
 />
 <Field
 label="Slogan / Motto Lembaga"
 value={form.motto || ''}
 onChange={(v) => update('motto', v)}
 icon={Sparkles}
 placeholder="Contoh: Membina Generasi Rabbani Berakhlak Mulia"
 />
 <Field
 label="Teks Footer Halaman"
 value={form.footer_text}
 onChange={(v) => update('footer_text', v)}
 placeholder="Contoh: Jl. Pendidikan No. 1, Kota Padang"
 />

 {/* Informasi Rekening Bank Lembaga */}
 <div className="md:col-span-2 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-xs mb-3">
 <CreditCard className="h-4 w-4 text-emerald-600" />
 <span>Informasi Rekening Bank Pembayaran Lembaga (Portal Tagihan & Kwitansi)</span>
 </div>
 </div>
 <Field
 label="Nama Bank"
 value={form.bank_name || ''}
 onChange={(v) => update('bank_name', v)}
 placeholder="Contoh: Bank Syariah Indonesia (BSI)"
 />
 <Field
 label="Nomor Rekening Bank"
 value={form.bank_account_number || ''}
 onChange={(v) => update('bank_account_number', v)}
 placeholder="Contoh: 777-1234-567"
 />
 <div className="md:col-span-2">
 <Field
 label="Atas Nama Rekening Bank"
 value={form.bank_account_name || ''}
 onChange={(v) => update('bank_account_name', v)}
 placeholder="Contoh: Yayasan Dar El-Iman Padang"
 />
 </div>
 <Field
 label="Kode Biller / Institusi BSI Virtual Account"
 value={form.bsi_va_prefix || ''}
 onChange={(v) => update('bsi_va_prefix', v)}
 placeholder="Contoh: 9023 (Kode Kerjasama BSI)"
 />
 <div className="space-y-1">
 <Select
 value={form.bsi_va_format || '{PREFIX}{NIS}'}
 onValueChange={(val) => update('bsi_va_format', val)}
 >
 <SelectLabel>Format Formula Nomor VA BSI Siswa</SelectLabel>
 <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-emerald-200/80 dark:border-emerald-800/60">
 <SelectValue placeholder="Pilih format formula VA..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem id="{PREFIX}{NIS}">Kode Biller + NIS Siswa (Contoh: 9023 + NIS)</SelectItem>
 <SelectItem id="{PREFIX}{UNIT_CODE}{NIS}">Kode Biller + Kode Unit + NIS Siswa (Contoh: 9023 + 01 + NIS)</SelectItem>
 </SelectContent>
 </Select>
 </div>

 {/* Konfigurasi Cetak Kartu Pelajar & Pegawai */}
 <div className="md:col-span-2 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-xs mb-3">
 <FileText className="h-4 w-4 text-emerald-600" />
 <span>Konfigurasi Cetak Kartu Identitas (Pelajar & Pegawai)</span>
 </div>
 </div>
 <div className="md:col-span-2">
 <Field
 label="Motto / Catatan Kaki Kartu"
 value={form.card_footer_motto || ''}
 onChange={(v) => update('card_footer_motto', v)}
 placeholder="Contoh: Berakhlak Mulia, Cerdas, dan Mandiri"
 />
 </div>
 <div className="md:col-span-2 space-y-1">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
 Tata Tertib Belakang Kartu Pelajar / Siswa (Gunakan enter untuk baris baru)
 </label>
 <textarea
 rows={4}
 value={form.card_rules_student || ''}
 onChange={(e) => update('card_rules_student', e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3 text-xs text-slate-900 shadow-2xs focus:border-emerald-200/80 focus:outline-hidden dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 placeholder="1. Kartu ini adalah kartu identitas resmi..."
 />
 </div>
 <div className="md:col-span-2 space-y-1">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
 Tata Tertib Belakang Kartu Pegawai / Guru (Gunakan enter untuk baris baru)
 </label>
 <textarea
 rows={4}
 value={form.card_rules_employee || ''}
 onChange={(e) => update('card_rules_employee', e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3 text-xs text-slate-900 shadow-2xs focus:border-emerald-200/80 focus:outline-hidden dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 placeholder="1. Kartu ini adalah tanda pengenal resmi pegawai..."
 />
 </div>

 {/* Konfigurasi Integrasi Peta Digital (Mapbox) */}
 <div className="md:col-span-2 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 text-xs mb-1">
 <MapPin className="h-4 w-4 text-emerald-600" />
 <span>Konfigurasi Integrasi Peta Digital (Mapbox Access Token)</span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
 Token Mapbox resmi digunakan untuk merender layer peta interaktif, reverse-geocoding koordinat GPS, dan pencarian alamat siswa, pegawai, & unit pendidikan.
 </p>
 </div>
 <div className="md:col-span-2">
 <div className="space-y-1">
 <div className="flex items-center justify-between">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
 Mapbox Public Token (Mulai dengan 'pk.')
 </label>
 <button
 type="button"
 onClick={() => setShowMapboxToken(!showMapboxToken)}
 className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 cursor-pointer"
 >
 {showMapboxToken ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
 <span>{showMapboxToken ? 'Sembunyikan Token' : 'Lihat Token Lengkap'}</span>
 </button>
 </div>
 <div className="relative">
 <input
 type={showMapboxToken ? 'text' : 'password'}
 value={form.mapbox_token || ''}
 onChange={(e) => update('mapbox_token', e.target.value)}
 placeholder="pk.eyJ1Ijoi..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-3 pr-10 font-mono text-xs text-slate-900 shadow-2xs focus:border-emerald-200/80 focus:outline-hidden dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
 <KeyRound className="h-4 w-4" />
 </div>
 </div>
 <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5">
 <span>Status: {form.mapbox_token ? '✓ Token Terkonfigurasi' : 'Belum Dikonfigurasi (Menggunakan Fallback OSM)'}</span>
 {form.mapbox_token && !form.mapbox_token.startsWith('pk.') && (
 <span className="text-amber-600 font-semibold">Peringatan: Token Mapbox standar biasanya diawali dengan 'pk.'</span>
 )}
 </div>
 </div>
 </div>

 <AssetUpload
 label="Logo Resmi Sekolah (PNG / SVG)"
 accept="image/png,image/jpeg,image/webp,image/svg+xml"
 preview={previewLogo}
 fallback={form.logo_text}
 isNewFile={Boolean(files.logo)}
 onPreviewFull={(url, title) => setPreviewPhotoModal({ isOpen: true, url, title })}
 onChange={(e) => chooseFile('logo', e)}
 onRemove={() => removeAsset('logo')}
 />
 <AssetUpload
 label="Favicon Situs (ICO / PNG)"
 accept=".ico,image/png,image/jpeg,image/webp,image/svg+xml"
 preview={previewFavicon}
 fallback="ICO"
 isNewFile={Boolean(files.favicon)}
 onPreviewFull={(url, title) => setPreviewPhotoModal({ isOpen: true, url, title })}
 onChange={(e) => chooseFile('favicon', e)}
 onRemove={() => removeAsset('favicon')}
 />
 </div>
 </div>
 )}

 {/* TAB 2: STYLE & TEMA WEBSITE (HEADER, SIDEBAR, WARNA, TEMPLATE) */}
 {activeTab === 'tema' && (
 <div className="space-y-6">
 {/* Preset Warna Instan */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <span className="block text-xs font-extrabold text-emerald-900 dark:text-emerald-300 mb-2">
 Preset Tema Warna Instan (1-Klik)
 </span>
 <div className="flex flex-wrap items-center gap-2">
 {presetThemes.map((preset) => (
 <button
 key={preset.name}
 type="button"
 onClick={() => applyPreset(preset)}
 className="flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-200/80 hover:scale-[1.02] transition dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
 >
 <span
 className="h-3.5 w-3.5 rounded-full shadow-xs"
 style={{ backgroundColor: preset.sidebar_color }}
 />
 <span>{preset.name}</span>
 </button>
 ))}
 </div>
 </div>

 <div className="grid gap-6 md:grid-cols-2">
 <div className="space-y-4">
 <Select
 value={form.header_style || 'light'}
 onChange={(v) => update('header_style', String(v))}
 >
 <SelectLabel>Gaya Header Topbar</SelectLabel>
 <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-emerald-200/80 dark:border-emerald-800/60">
 <SelectValue placeholder="Pilih gaya header..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem id="light">Terang (White Clean)</SelectItem>
 <SelectItem id="solid">Warna Solid</SelectItem>
 <SelectItem id="transparent">Transparan (Glassmorphism)</SelectItem>
 </SelectContent>
 </Select>

 <label className="block space-y-2 text-xs font-bold text-slate-700 dark:text-slate-200">
 <span>Warna Header Utama</span>
 <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 dark:border-emerald-800/60 bg-slate-50 dark:bg-slate-900">
 <input
 type="color"
 value={form.header_color || '#FFFFFF'}
 onChange={(e) => update('header_color', e.target.value.toUpperCase())}
 className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
 />
 <input
 value={form.header_color || '#FFFFFF'}
 onChange={(e) => update('header_color', e.target.value)}
 pattern="^#[0-9A-Fa-f]{6}$"
 className="w-full bg-transparent font-mono text-xs outline-none uppercase font-bold"
 />
 </div>
 </label>
 </div>

 <div className="space-y-4">
 <Select
 value={form.sidebar_style || 'light'}
 onChange={(v) => update('sidebar_style', String(v))}
 >
 <SelectLabel>Gaya Latar Sidebar</SelectLabel>
 <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-emerald-200/80 dark:border-emerald-800/60">
 <SelectValue placeholder="Pilih gaya sidebar..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem id="light">Terang Clean (Standard White)</SelectItem>
 <SelectItem id="gradient">Gradasi Elegant</SelectItem>
 <SelectItem id="solid">Warna Solid</SelectItem>
 </SelectContent>
 </Select>

 <label className="block space-y-2 text-xs font-bold text-slate-700 dark:text-slate-200">
 <span>Warna Latar Sidebar</span>
 <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 dark:border-emerald-800/60 bg-slate-50 dark:bg-slate-900">
 <input
 type="color"
 value={form.sidebar_color || '#059669'}
 onChange={(e) => update('sidebar_color', e.target.value.toUpperCase())}
 className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
 />
 <input
 value={form.sidebar_color || '#059669'}
 onChange={(e) => update('sidebar_color', e.target.value)}
 pattern="^#[0-9A-Fa-f]{6}$"
 className="w-full bg-transparent font-mono text-xs outline-none uppercase font-bold"
 />
 </div>
 </label>
 </div>

 <label className="block space-y-2 text-xs font-bold text-slate-700 dark:text-slate-200">
 <span>Warna Aksen Logo & Icon Sidebar</span>
 <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 p-2.5 dark:border-emerald-800/60 bg-slate-50 dark:bg-slate-900">
 <input
 type="color"
 value={form.sidebar_accent_color || '#10B981'}
 onChange={(e) => update('sidebar_accent_color', e.target.value.toUpperCase())}
 className="h-9 w-12 cursor-pointer rounded-lg border-0 bg-transparent"
 />
 <input
 value={form.sidebar_accent_color || '#10B981'}
 onChange={(e) => update('sidebar_accent_color', e.target.value)}
 pattern="^#[0-9A-Fa-f]{6}$"
 className="w-full bg-transparent font-mono text-xs outline-none uppercase font-bold"
 />
 </div>
 </label>

 <Select
 value={form.sidebar_position || 'left'}
 onChange={(v) => update('sidebar_position', String(v))}
 >
 <SelectLabel>Posisi Sidebar Navigation</SelectLabel>
 <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-emerald-200/80 dark:border-emerald-800/60">
 <SelectValue placeholder="Pilih posisi sidebar..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem id="left">Sisi Kiri (Standard)</SelectItem>
 <SelectItem id="right">Sisi Kanan</SelectItem>
 </SelectContent>
 </Select>

 <Select
 value={form.template || 'modern'}
 onChange={(v) => update('template', String(v))}
 >
 <SelectLabel>Kerapatan Layout & UI Scaling</SelectLabel>
 <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-emerald-200/80 dark:border-emerald-800/60">
 <SelectValue placeholder="Pilih kerapatan template..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem id="modern">Modern (Standar HeroUI)</SelectItem>
 <SelectItem id="compact">Ringkas (High Data Density)</SelectItem>
 <SelectItem id="comfortable">Lapang (Spacious Padding)</SelectItem>
 </SelectContent>
 </Select>

 <div className="space-y-4 pt-1 md:col-span-2">
 <div className="flex items-center gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 p-3.5 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50">
 <Checkbox
 id="header_sticky"
 checked={Boolean(form.header_sticky)}
 onChange={(e) => update('header_sticky', e.target.checked)}
 />
 <Label
 htmlFor="header_sticky"
 className="cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200"
 >
 Header tetap di atas saat di-scroll (Sticky Header)
 </Label>
 </div>

 <div className="flex items-center gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 p-3.5 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50">
 <Checkbox
 id="sidebar_collapsed"
 checked={Boolean(form.sidebar_collapsed)}
 onChange={(e) => update('sidebar_collapsed', e.target.checked)}
 />
 <Label
 htmlFor="sidebar_collapsed"
 className="cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200"
 >
 Sidebar mengecil secara default (Collapsed Icon-Only)
 </Label>
 </div>
 </div>

 {/* PENGATURAN BREADCRUMB STANDAR HEROUI */}
 <div className="space-y-4 pt-4 border-t border-emerald-200/80 dark:border-emerald-800/60 md:col-span-2">
 <div className="flex items-center justify-between">
 <div>
 <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
 <Sliders className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <span>Gaya Navigasi Breadcrumbs (Jalur Navigasi)</span>
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Atur format pemisah (divider) dan tampilan ikon Beranda pada jalur navigasi seluruh halaman aplikasi.
 </p>
 </div>
 </div>

 <div className="grid gap-4 sm:grid-cols-2">
 <Select
 value={form.breadcrumb_divider || 'chevron'}
 onChange={(v) => update('breadcrumb_divider', String(v))}
 >
 <SelectLabel>Pemisah Breadcrumbs (Divider Type)</SelectLabel>
 <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-emerald-200/80 dark:border-emerald-800/60">
 <SelectValue placeholder="Pilih pemisah..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem id="chevron">Chevron (›) — Rekomendasi HeroUI</SelectItem>
 <SelectItem id="slash">Garis Miring (/) — Slash</SelectItem>
 <SelectItem id="dot">Titik Bulat (•) — Dot</SelectItem>
 </SelectContent>
 </Select>

 <div className="flex items-center gap-3 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 p-3.5 dark:border-emerald-800/60 bg-slate-50/50 dark:bg-slate-900/50">
 <Checkbox
 id="breadcrumb_show_home"
 checked={form.breadcrumb_show_home !== false}
 onChange={(e) => update('breadcrumb_show_home', e.target.checked)}
 />
 <Label
 htmlFor="breadcrumb_show_home"
 className="cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200"
 >
 Tampilkan Ikon Beranda di Awal Navigasi (Home Icon)
 </Label>
 </div>
 </div>

 {/* Live Preview Breadcrumbs */}
 <div className="rounded-xl border border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/30 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block mb-2">
 Pratinjau Langsung (Live Preview Breadcrumb):
 </span>
 <AppBreadcrumb
 dividerType={form.breadcrumb_divider || 'chevron'}
 homeTo={form.breadcrumb_show_home !== false ? '/dashboard' : null}
 items={[
 { label: 'Master Data', href: '/dashboard' },
 { label: 'Kelas & Rombel' },
 ]}
 className="mb-0"
 />
 </div>
 </div>
 </div>
 </div>
 )}

 {/* TAB 3: KUSTOMISASI LABEL & TERMINOLOGI (JSON) */}
 {activeTab === 'labels' && (
 <div className="space-y-8 w-full">
 {/* 1. Header Banner */}
 <div className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-5 sm:p-6 text-xs dark:border-emerald-800/60 dark:bg-emerald-950/30 shadow-2xs">
 <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5 w-full">
 <div className="flex items-center gap-4 min-w-0 flex-1">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 
            <Languages className="h-6 w-6 text-white" />
 </div>
 <div className="min-w-0 flex-1">
 <div className="flex items-center gap-3 flex-wrap">
 <span className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
 Kustomisasi Label & Bahasa (Format JSON)
 </span>
 <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600/15 px-3 py-1 text-xs font-black text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 shrink-0">
 <ShieldCheck className="h-3.5 w-3.5 text-white" />
 Akses Khusus Super Admin & Admin
 </span>
 </div>
 <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-4xl">
 Ubah istilah lembaga (misal: <strong className="font-bold text-emerald-800 dark:text-emerald-300">Siswa ➔ Santri</strong>, <strong className="font-bold text-emerald-800 dark:text-emerald-300">Guru ➔ Ustadz</strong>, <strong className="font-bold text-emerald-800 dark:text-emerald-300">Kelas ➔ Halaqah</strong>) atau sesuaikan seluruh teks antarmuka melalui formulir visual maupun langsung mengedit struktur kode JSON.
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap self-start xl:self-center">
 <Button
 type="button"
 variant="ghost"
 size="xs"
 onClick={handleResetLabels}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer transition-all shrink-0"
 title="Kembalikan semua label ke teks bawaan default"
 >
 <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
 <span>Reset Bawaan</span>
 </Button>
 <Button
 type="button"
 variant="ghost"
 size="xs"
 onClick={handleDownloadJson}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/80 px-3.5 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-2xs cursor-pointer transition-all shrink-0"
 title="Unduh seluruh kamus label ke file JSON"
 >
 <Download className="h-3.5 w-3.5 text-emerald-600" />
 <span>Unduh JSON</span>
 </Button>
 <label className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm transition-all cursor-pointer shrink-0">
 <Upload className="h-3.5 w-3.5" />
 <span>Impor File JSON</span>
 <input
 type="file"
 accept=".json,application/json"
 className="hidden"
 onChange={handleUploadJson}
 />
 </label>
 </div>
 </div>
 </div>

 {/* 2. Sub-Tabs Bar */}
 <div
 role="tablist"
 aria-label="Navigasi Sub-Tab Kustomisasi Label"
 className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-700/80 overflow-x-auto no-scrollbar max-w-full shrink-0 shadow-xs mb-2"
 >
 <button
 type="button"
 role="tab"
 aria-selected={labelsSubTab === 'terminology'}
 onClick={() => setLabelsSubTab('terminology')}
 className={
 labelsSubTab === 'terminology'
 ? 'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer shrink-0 select-none bg-emerald-600 text-white shadow-sm font-bold opacity-100'
 : 'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer shrink-0 select-none text-slate-600 dark:text-slate-300 opacity-70 hover:opacity-100 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 hover:text-emerald-900 dark:hover:text-emerald-200'
 }
 >
 <Sparkles className="h-4 w-4" />
 <span>Terminologi Lembaga & Preset</span>
 </button>

 <button
 type="button"
 role="tab"
 aria-selected={labelsSubTab === 'categories'}
 onClick={() => setLabelsSubTab('categories')}
 className={
 labelsSubTab === 'categories'
 ? 'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer shrink-0 select-none bg-emerald-600 text-white shadow-sm font-bold opacity-100'
 : 'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer shrink-0 select-none text-slate-600 dark:text-slate-300 opacity-70 hover:opacity-100 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 hover:text-emerald-900 dark:hover:text-emerald-200'
 }
 >
 <Layers className="h-4 w-4" />
 <span>Kategori Label Lengkap</span>
 </button>

 <button
 type="button"
 role="tab"
 aria-selected={labelsSubTab === 'json'}
 onClick={() => {
 setRawJsonText(JSON.stringify(form.custom_labels || defaultLabels, null, 2))
 setLabelsSubTab('json')
 }}
 className={
 labelsSubTab === 'json'
 ? 'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer shrink-0 select-none bg-emerald-600 text-white shadow-sm font-bold opacity-100'
 : 'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer shrink-0 select-none text-slate-600 dark:text-slate-300 opacity-70 hover:opacity-100 hover:bg-emerald-100/50 dark:hover:bg-emerald-950/40 hover:text-emerald-900 dark:hover:text-emerald-200'
 }
 >
 <Code2 className="h-4 w-4" />
 <span>Editor Kode JSON Langsung</span>
 </button>
 </div>

 {/* 3. Sub-Tab Content: 1. TERMINOLOGY & PRESETS */}
 {labelsSubTab === 'terminology' && (
 <div className="space-y-8">
 {/* Presets Cards */}
 <div>
 <div className="flex items-center justify-between mb-3.5">
 <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
 Preset Terminologi Cepat (1-Klik Terapkan)
 </span>
 <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
 Pilih gaya istilah sesuai jenis institusi Anda
 </span>
 </div>
 <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
 <button
 type="button"
 onClick={() => handleApplyTerminologyPreset('umum')}
 className="flex flex-col text-left rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 hover:border-emerald-300 dark:hover:border-emerald-200/80 hover:shadow-lg dark:border-emerald-800/60 dark:bg-slate-800 transition-all duration-200 cursor-pointer group"
 >
 <div className="flex items-center justify-between gap-2">
 <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
 Sekolah Umum (Default)
 </span>
 <span className="rounded-full bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-slate-700 dark:text-slate-300 shrink-0">
 Standar
 </span>
 </div>
 <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
 Siswa, Guru, Kelas, Sekolah, Kepala Sekolah, Wali Kelas.
 </p>
 </button>

 <button
 type="button"
 onClick={() => handleApplyTerminologyPreset('pesantren')}
 className="flex flex-col text-left rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-5 hover:border-emerald-300 dark:hover:border-emerald-200/80 hover:shadow-lg dark:border-emerald-800/60 dark:bg-slate-800 transition-all duration-200 cursor-pointer group"
 >
 <div className="flex items-center justify-between gap-2">
 <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400">
 Pondok Pesantren / Islamic Boarding
 </span>
 <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-700 dark:bg-teal-900/60 dark:text-teal-300 shrink-0">
 Populer
 </span>
 </div>
 <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
 Santri, Ustadz / Asatidz, Halaqah, Pondok Pesantren, Mudir, Musyrif.
 </p>
 </button>

 <button
 type="button"
 onClick={() => handleApplyTerminologyPreset('madrasah')}
 className="flex flex-col text-left rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 hover:border-emerald-300 dark:hover:border-emerald-200/80 hover:shadow-lg dark:border-emerald-800/60 dark:bg-slate-800 transition-all duration-200 cursor-pointer group sm:col-span-2 lg:col-span-1"
 >
 <div className="flex items-center justify-between gap-2">
 <span className="text-xs font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
 Madrasah (Kemenag)
 </span>
 <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-300 shrink-0">
 Kemenag
 </span>
 </div>
 <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
 Peserta Didik, Pendidik, Rombongan Belajar, Madrasah, Kepala Madrasah.
 </p>
 </button>
 </div>
 </div>

 {/* Field Grid for Terminology */}
 <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <div className="mb-4">
 <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
 Sesuaikan Istilah Mandiri (Terminology Fields)
 </span>
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
 Teks di bawah akan langsung digunakan sebagai sebutan baku pada judul tabel, kartu identitas, dan tombol aksi.
 </p>
 </div>

 <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
 <Field
 label="Istilah Siswa (Tunggal)"
 value={form.custom_labels?.terminology?.siswa || 'Siswa'}
 onChange={(v) => handleUpdateLabel('terminology', 'siswa', v)}
 placeholder="Contoh: Siswa / Santri / Murid"
 />
 <Field
 label="Istilah Siswa (Jamak)"
 value={form.custom_labels?.terminology?.siswa_plural || 'Siswa / Santri'}
 onChange={(v) => handleUpdateLabel('terminology', 'siswa_plural', v)}
 placeholder="Contoh: Siswa / Santriwan & Santriwati"
 />
 <Field
 label="Istilah Guru (Tunggal)"
 value={form.custom_labels?.terminology?.guru || 'Guru'}
 onChange={(v) => handleUpdateLabel('terminology', 'guru', v)}
 placeholder="Contoh: Guru / Pendidik / Ustadz"
 />
 <Field
 label="Istilah Guru (Jamak)"
 value={form.custom_labels?.terminology?.guru_plural || 'Guru & Pendidik'}
 onChange={(v) => handleUpdateLabel('terminology', 'guru_plural', v)}
 placeholder="Contoh: Dewan Guru / Dewan Asatidz"
 />
 <Field
 label="Istilah Kelas / Rombel"
 value={form.custom_labels?.terminology?.kelas || 'Kelas / Rombel'}
 onChange={(v) => handleUpdateLabel('terminology', 'kelas', v)}
 placeholder="Contoh: Kelas / Halaqah / Rombel"
 />
 <Field
 label="Istilah Lembaga / Sekolah"
 value={form.custom_labels?.terminology?.sekolah || 'Sekolah / Madrasah'}
 onChange={(v) => handleUpdateLabel('terminology', 'sekolah', v)}
 placeholder="Contoh: Sekolah / Pesantren / Madrasah"
 />
 <Field
 label="Istilah Kepala Sekolah"
 value={form.custom_labels?.terminology?.kepala_sekolah || 'Kepala Sekolah'}
 onChange={(v) => handleUpdateLabel('terminology', 'kepala_sekolah', v)}
 placeholder="Contoh: Kepala Sekolah / Mudir"
 />
 <Field
 label="Istilah Wali Kelas"
 value={form.custom_labels?.terminology?.wali_kelas || 'Wali Kelas'}
 onChange={(v) => handleUpdateLabel('terminology', 'wali_kelas', v)}
 placeholder="Contoh: Wali Kelas / Musyrif Kamar"
 />
 <Field
 label="Istilah Asrama / Pondok"
 value={form.custom_labels?.terminology?.asrama || 'Asrama / Pondok'}
 onChange={(v) => handleUpdateLabel('terminology', 'asrama', v)}
 placeholder="Contoh: Asrama / Kobong / Ma'had"
 />
 <Field
 label="Istilah Pembina / Musyrif"
 value={form.custom_labels?.terminology?.musyrif || 'Musyrif / Pembina'}
 onChange={(v) => handleUpdateLabel('terminology', 'musyrif', v)}
 placeholder="Contoh: Pembina / Musyrif"
 />
 <Field
 label="Istilah Mata Pelajaran"
 value={form.custom_labels?.terminology?.mata_pelajaran || 'Mata Pelajaran'}
 onChange={(v) => handleUpdateLabel('terminology', 'mata_pelajaran', v)}
 placeholder="Contoh: Mata Pelajaran / Kitab"
 />
 <Field
 label="Istilah Halaqah Tahfizh"
 value={form.custom_labels?.terminology?.halaqah || 'Halaqah Tahfizh'}
 onChange={(v) => handleUpdateLabel('terminology', 'halaqah', v)}
 placeholder="Contoh: Halaqah / Kelompok Tahfizh"
 />
 </div>
 </div>
 </div>
 )}

 {/* 4. Sub-Tab Content: 2. COMPLETE CATEGORIES */}
 {labelsSubTab === 'categories' && (
 <div className="space-y-6">
 {/* Category Selector Pills */}
 <div className="flex items-center gap-2.5 flex-wrap p-2 bg-slate-100/80 dark:bg-slate-800/70 rounded-xl border border-emerald-200/80 dark:border-emerald-800/70">
 {[
 { id: 'common', label: 'Tombol & Aksi Umum' },
 { id: 'navigation', label: 'Menu & Navigasi' },
 { id: 'students', label: 'Data Siswa / Santri' },
 { id: 'employees', label: 'Data Guru & Pegawai' },
 { id: 'attendance', label: 'Presensi Terpadu' },
 { id: 'tahfizh', label: 'Tahfizh Al-Qur\'an' },
 { id: 'mutabaah', label: 'Mutaba\'ah Yaumiyyah' },
 { id: 'ujian', label: 'Ujian & Kisi-Kisi LMS' },
 ].map((cat) => (
 <button
 key={cat.id}
 type="button"
 onClick={() => setActiveLabelCategory(cat.id)}
 className={`rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
 activeLabelCategory === cat.id
 ? 'bg-emerald-600 text-white shadow-sm'
 : 'bg-white text-slate-700 hover:bg-slate-200/70 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-2xs'
 }`}
 >
 {cat.label}
 </button>
 ))}
 </div>

 {/* Fields for the selected category */}
 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/70 p-5 sm:p-6 dark:border-emerald-800/60 dark:bg-slate-900/70 shadow-xs">
 <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
 {Object.entries(
 (form.custom_labels && form.custom_labels[activeLabelCategory]) ||
 defaultLabels[activeLabelCategory] ||
 {}
 ).map(([k, v]) => (
 <Field
 key={k}
 label={`[${k}]`}
 value={String(v ?? '')}
 onChange={(val) => handleUpdateLabel(activeLabelCategory, k, val)}
 placeholder={`Label untuk ${k}`}
 />
 ))}
 </div>
 </div>
 </div>
 )}

 {/* 5. Sub-Tab Content: 3. RAW JSON EDITOR */}
 {labelsSubTab === 'json' && (
 <div className="space-y-5">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
 <div>
 <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
 Editor Kode JSON Langsung
 </h4>
 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
 Setiap perubahan teks JSON akan divalidasi dan langsung disinkronkan ke formulir antarmuka.
 </p>
 </div>

 <div className="flex items-center gap-2.5">
 <Button
 type="button"
 variant="ghost"
 size="xs"
 onClick={() => {
 try {
 const parsed = JSON.parse(rawJsonText)
 setRawJsonText(JSON.stringify(parsed, null, 2))
 setJsonError(null)
 } catch (e) {
 setJsonError(`Tidak dapat merapikan format: ${e.message}`)
 }
 }}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer transition-all"
 >
 <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
 <span>Rapikan JSON</span>
 </Button>

 <Button
 type="button"
 variant="ghost"
 size="xs"
 onClick={handleCopyJson}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 shadow-2xs cursor-pointer transition-all"
 >
 {copiedJson ? (
 <>
 <Check className="h-3.5 w-3.5 text-emerald-600" />
 <span className="text-emerald-600">Disalin!</span>
 </>
 ) : (
 <>
 <Copy className="h-3.5 w-3.5 text-slate-500" />
 <span>Salin JSON</span>
 </>
 )}
 </Button>
 </div>
 </div>

 {jsonError && (
 <div className="flex items-center gap-2.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 p-3.5 text-xs font-semibold text-rose-800 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-200 shadow-xs">
 <AlertTriangle className="h-4 w-4 shrink-0 text-rose-600" />
 <span>{jsonError}</span>
 </div>
 )}

 <div className="relative rounded-xl border-2 border-emerald-200/80 bg-slate-950 p-2 shadow-inner">
 <div className="flex items-center justify-between border-b border-emerald-200/80 px-4 py-2.5 text-xs font-mono text-slate-400">
 <div className="flex items-center gap-2">
 <FileJson className="h-4 w-4 text-emerald-400" />
 <span className="text-emerald-400 font-bold">labels.json</span>
 </div>
 <span className={jsonError ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
 {jsonError ? '● Syntax Error' : '● Valid JSON'}
 </span>
 </div>
 <textarea
 value={rawJsonText}
 onChange={(e) => handleRawJsonChange(e.target.value)}
 rows={18}
 className="w-full bg-transparent p-4 sm:p-5 font-mono text-xs sm:text-sm text-emerald-300 placeholder-slate-600 focus:outline-hidden leading-relaxed resize-y selection:bg-emerald-900 selection:text-white min-h-[460px]"
 placeholder="Masukkan objek JSON konfigurasi label di sini..."
 spellCheck={false}
 />
 </div>
 </div>
 )}
 </div>
 )}

 {/* TAB 4: KELOLA BANTUAN & FAQ */}
 {activeTab === 'bantuan_faq' && (
 <div className="space-y-8">
 {/* FAQ SECTION */}
 <div className="space-y-4">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/80 pb-3">
 <div>
 <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
 <HelpCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
 <span>Kelola Daftar Pertanyaan & Solusi (FAQ)</span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Tambah, ubah, atau hapus konten panduan FAQ yang muncul di halaman <strong>/dashboard/bantuan</strong>.
 </p>
 </div>

 <div className="flex items-center gap-2">
 <button
 type="button"
 onClick={handleResetFaqs}
 className="h-9 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-slate-700 transition cursor-pointer"
 >
 Reset Standard
 </button>
 <button
 type="button"
 onClick={openAddFaqModal}
 className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white shadow-xs transition cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60"
 >
 <Plus className="h-4 w-4 stroke-[2.5]" />
 <span>Tambah FAQ Baru</span>
 </button>
 </div>
 </div>

 {/* FAQ Items List */}
 <div className="space-y-3">
 {currentFaqs.map((item, index) => (
 <div
 key={item.id || index}
 className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 p-4 dark:border-emerald-800/60 dark:bg-slate-900/60"
 >
 <div className="space-y-1 max-w-xl">
 <div className="flex items-center gap-2 flex-wrap">
 <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
 {item.category}
 </span>
 {item.actionLabel && (
 <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400">
 <ExternalLink className="h-3 w-3" /> {item.actionLabel}
 </span>
 )}
 </div>
 <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.question}</h4>
 <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
 {item.answer}
 </p>
 </div>

 <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
 <button
 type="button"
 onClick={() => openEditFaqModal(item)}
 className="inline-flex items-center gap-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
 >
 <Pencil className="h-3.5 w-3.5 text-emerald-600" />
 <span>Edit</span>
 </button>
 <button
 type="button"
 onClick={() => handleDeleteFaq(item.id)}
 className="inline-flex items-center gap-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-300 transition cursor-pointer"
 >
 <Trash2 className="h-3.5 w-3.5" />
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* MANUAL BOOKS SECTION */}
 <div className="space-y-4 pt-4 border-t border-emerald-200/80 dark:border-emerald-800/60">
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-emerald-200/80 dark:border-emerald-800/80 pb-3">
 <div>
 <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
 <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
 <span>Kelola Buku Panduan & PDF Manual Book</span>
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Kelola dokumen tautan panduan PDF yang dapat diunduh oleh pengguna.
 </p>
 </div>

 <button
 type="button"
 onClick={openAddManualModal}
 className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white shadow-xs transition cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60"
 >
 <Plus className="h-4 w-4 stroke-[2.5]" />
 <span>Tambah Panduan PDF</span>
 </button>
 </div>

 {/* Manuals List */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {currentManuals.map((item, index) => (
 <div
 key={item.id || index}
 className="flex flex-col justify-between rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/70 p-4 dark:border-emerald-800/60 dark:bg-slate-900/60"
 >
 <div className="space-y-2">
 <div className="flex items-center justify-between gap-2">
 <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
 {item.format || 'PDF'} • {item.size || '3.5 MB'}
 </span>
 <span className="text-[10px] font-semibold text-slate-400">{item.version}</span>
 </div>
 <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
 <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{item.desc}</p>
 <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400 block">
 Target: {item.target}
 </span>
 </div>

 <div className="mt-3 pt-3 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-end gap-2">
 <button
 type="button"
 onClick={() => openEditManualModal(item)}
 className="inline-flex items-center gap-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-slate-200 transition cursor-pointer"
 >
 <Pencil className="h-3.5 w-3.5 text-white" />
 <span>Edit</span>
 </button>
 <button
 type="button"
 onClick={() => handleDeleteManual(item.id)}
 className="inline-flex items-center gap-1 rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-emerald-800/60 dark:bg-rose-950/60 dark:text-rose-300 transition cursor-pointer"
 >
 <Trash2 className="h-3.5 w-3.5" />
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 )}

 {/* TAB INTEGRASI SIPDEI & VIRTUAL ACCOUNT */}
 {activeTab === 'sipdei' && (
 <div className="space-y-6">
 {/* Hero Card Status */}
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-500/30 !bg-[#D5F2E3] p-5 sm:p-6 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:!bg-[#112a22] print:hidden">
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div className="flex items-start gap-3.5">
 <div className="flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600">
 
            <CreditCard className="h-6 w-6 text-white" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:bg-emerald-500/30 dark:text-emerald-300">
 <Sparkles className="h-3 w-3" />
 Integrasi Ekosistem Keuangan
 </span>
 {form.sipdei_api_key ? (
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300">
 <CheckCircle2 className="h-3 w-3" />
 Token Aktif di Database
 </span>
 ) : (
 <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-extrabold text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
 <AlertCircle className="h-3 w-3" />
 Token Belum Diisi
 </span>
 )}
 </div>
 <h3 className="mt-1 text-base sm:text-lg font-black text-slate-900 dark:text-white">
 Konfigurasi API SIPDEI & Virtual Account (Nagari & BSI)
 </h3>
 <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed w-full">
 Kredensial disimpan langsung di database (<code className="font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/60 px-1 rounded">site_settings</code>) dan digunakan oleh server untuk memanggil <b>API Riwayat Tagihan Siswa</b> serta <b>API Pembuatan Virtual Account</b>. Super Admin dan Admin dapat memperbarui token sewaktu-waktu di form bawah ini.
 </p>
 </div>
 </div>
 </div>
 </div>

 {/* Form Fields */}
 <div className="rounded-xl border border-emerald-200/80 bg-white p-5 shadow-xs dark:border-emerald-800/60 dark:bg-slate-900 space-y-5">
 <div className="border-b border-emerald-200/80 dark:border-emerald-800/60 pb-3 dark:border-emerald-800/60">
 <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
 Parameter Koneksi Server-to-Server
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Pastikan URL dan API Key sesuai dengan kredensial yang diterbitkan oleh administrator pusat SIPDEI Yayasan.
 </p>
 </div>

 <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
 <div className="md:col-span-2">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
 Base URL Server SIPDEI *
 </label>
 <div className="relative">
 <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
 <input
 type="url"
 required
 value={form.sipdei_base_url || 'https://sipdei.dareliman.tech'}
 onChange={(e) => update('sipdei_base_url', e.target.value)}
 placeholder="https://sipdei.dareliman.tech"
 className="h-9 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none transition focus:border-emerald-200/80 focus:bg-white dark:border-emerald-800/60 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-emerald-200/80"
 />
 </div>
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
 URL dasar API partner SIPDEI (standar: <code className="font-mono text-emerald-600">https://sipdei.dareliman.tech</code>).
 </p>
 </div>

 <div className="md:col-span-2">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
 X-API-Key SIPDEI (Partner Secret Token) *
 </label>
 <div className="relative flex items-center">
 <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
 <input
 type={showSipdeiKey ? 'text' : 'password'}
 required
 value={form.sipdei_api_key || ''}
 onChange={(e) => update('sipdei_api_key', e.target.value)}
 placeholder="Masukkan token API Key dari SIPDEI..."
 className="h-9 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 pl-9 pr-24 font-mono text-xs font-bold text-slate-800 outline-none transition focus:border-emerald-200/80 focus:bg-white dark:border-emerald-800/60 dark:bg-slate-800/80 dark:text-slate-100 dark:focus:border-emerald-200/80"
 />
 <div className="absolute right-2 flex items-center gap-1">
 <button
 type="button"
 onClick={() => setShowSipdeiKey(!showSipdeiKey)}
 title={showSipdeiKey ? 'Sembunyikan Token' : 'Lihat Token'}
 className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 cursor-pointer"
 >
 {showSipdeiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
 </button>
 {form.sipdei_api_key && (
 <button
 type="button"
 onClick={() => {
 navigator.clipboard.writeText(form.sipdei_api_key)
 setStatusModal({
 isOpen: true,
 type: 'success',
 title: 'Token Tersalin',
 message: 'API Key SIPDEI berhasil disalin ke clipboard.',
 })
 }}
 title="Salin Token"
 className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-200/70 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 cursor-pointer"
 >
 <Copy className="h-4 w-4" />
 </button>
 )}
 </div>
 </div>
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
 Kunci otentikasi rahasia. Token ini hanya dapat diakses & diubah oleh akun <b>Super Admin</b> dan <b>Admin</b>.
 </p>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
 Cache TTL Riwayat Tagihan (Detik)
 </label>
 <div className="relative">
 <Clock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
 <input
 type="number"
 min={60}
 max={86400}
 value={form.sipdei_cache_ttl || 600}
 onChange={(e) => update('sipdei_cache_ttl', Number(e.target.value))}
 placeholder="600"
 className="h-9 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/50 pl-9 pr-3 text-xs font-medium text-slate-800 outline-none transition focus:border-emerald-200/80 focus:bg-white dark:border-emerald-800/60 dark:bg-slate-800/80 dark:text-slate-100"
 />
 </div>
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
 Standar: 600 detik (10 menit). Mencegah pembatasan <i>rate limit</i> SIPDEI (20 req/menit per NIS).
 </p>
 </div>
 </div>

 {/* Informational Box */}
 <div className="rounded-lg border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 p-4 text-xs dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <div className="flex items-start gap-2.5">
 <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
 <div className="space-y-1">
 <p className="font-bold text-emerald-900 dark:text-emerald-200">
 Endpoint yang Terhubung Otomatis:
 </p>
 <ul className="list-disc list-inside space-y-0.5 text-xs text-emerald-800 dark:text-emerald-300">
 <li><b>Inquiry Tagihan:</b> <code className="font-mono">GET /api/partner/tagihan-siswa/{'{nis_pembayaran}'}/riwayat</code></li>
 <li><b>Penerbitan VA:</b> <code className="font-mono">POST /api/partner/tagihan-siswa/{'{nis_pembayaran}'}/pembayaran-va</code> (Bank Nagari & BSI)</li>
 <li><b>Portal Terpadu:</b> Terintegrasi langsung untuk role <b>Orang Tua</b> dan <b>Siswa</b> di Web Dashboard & Mobile App.</li>
 </ul>
 </div>
 </div>
 </div>
 </div>
 </div>
 )}

 {/* TAB 4: OPERASIONAL & KEBIJAKAN SISTEM */}
 {activeTab === 'operasional' && (
 <div className="space-y-6">
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-blue-50/60 p-4 text-xs dark:border-emerald-800/60 dark:bg-blue-950/30">
 <div className="flex items-center gap-2 font-bold text-blue-900 dark:text-blue-300">
 <Sliders className="h-4 w-4 text-blue-700" />
 <span>Konfigurasi Operasional & Kebijakan Absensi / Tahfizh</span>
 </div>
 <p className="mt-1 text-xs text-blue-800/80 dark:text-blue-300/80">
 Atur tahun ajaran aktif, batas jam absensi digital gerbang, serta standar target hafalan.
 </p>
 </div>

 <div className="grid gap-5 md:grid-cols-2">
 <Select
 value={form.tahun_ajaran_aktif || '2026/2027'}
 onChange={(v) => update('tahun_ajaran_aktif', String(v))}
 >
 <SelectLabel>Tahun Ajaran Aktif (Default)</SelectLabel>
 <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-emerald-200/80 dark:border-emerald-800/60">
 <SelectValue placeholder="Pilih tahun ajaran..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem id="2025/2026">2025 / 2026</SelectItem>
 <SelectItem id="2026/2027">2026 / 2027</SelectItem>
 <SelectItem id="2027/2028">2027 / 2028</SelectItem>
 </SelectContent>
 </Select>

 <Select
 value={form.semester_aktif || 'Ganjil'}
 onChange={(v) => update('semester_aktif', String(v))}
 >
 <SelectLabel>Semester Aktif (Default)</SelectLabel>
 <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-emerald-200/80 dark:border-emerald-800/60">
 <SelectValue placeholder="Pilih semester..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem id="Ganjil">Semester Ganjil</SelectItem>
 <SelectItem id="Genap">Semester Genap</SelectItem>
 </SelectContent>
 </Select>

 <Field
 label="Jam Masuk Absensi Gerbang (HH:MM)"
 type="time"
 value={form.jam_masuk_gerbang || '07:15'}
 onChange={(v) => update('jam_masuk_gerbang', v)}
 icon={Clock}
 />

 <Field
 label="Jam Pulang Absensi Gerbang (HH:MM)"
 type="time"
 value={form.jam_pulang_gerbang || '15:30'}
 onChange={(v) => update('jam_pulang_gerbang', v)}
 icon={Clock}
 />

 <Field
 label="Toleransi Keterlambatan (Menit)"
 type="number"
 value={form.toleransi_keterlambatan_menit || '15'}
 onChange={(v) => update('toleransi_keterlambatan_menit', v)}
 placeholder="15"
 />

 <Field
 label="Target Hafalan Bawaan Santri (Juz / Sem.)"
 type="number"
 step="0.5"
 value={form.target_tahfizh_bawaan || '1.0'}
 onChange={(v) => update('target_tahfizh_bawaan', v)}
 placeholder="1.0"
 />
 </div>
 </div>
 )}
 </div>
 </section>

 {/* Live Preview Panel Sidebar - only active for identitas & tema */}
 {(activeTab === 'identitas' || activeTab === 'tema') && (
 <aside className="h-fit rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-5 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
 <Sparkles className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <span>Pratinjau Live Layout</span>
 </h3>
 <p className="mb-4 mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
 Perubahan gaya header, sidebar, dan warna akan langsung tercermin pada simulasi di bawah ini secara otomatis.
 </p>
 <div
 style={previewStyle}
 className="overflow-hidden rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-[var(--preview-body)] shadow-inner"
 >
 <div className={`flex h-56 ${form.sidebar_position === 'right' ? 'flex-row-reverse' : ''}`}>
 <div
 className="w-28 p-2.5 text-slate-800 relative overflow-hidden border-r border-emerald-200/80 transition-colors"
 style={{
 background:
 form.sidebar_style === 'light'
 ? '#FFFFFF'
 : form.sidebar_style === 'gradient'
 ? `linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 50%, #F1F5F9 100%)`
 : form.sidebar_color,
 color: '#334155',
 }}
 >
 <div className="mb-4 flex items-center gap-1.5">
 {previewLogo ? (
 <img src={previewLogo} className="h-6 w-6 rounded object-contain" alt="" />
 ) : (
 <span className="flex h-6 w-6 items-center justify-center rounded bg-[var(--preview-accent)] text-[8px] font-black text-white">
 {form.logo_text || 'YDE'}
 </span>
 )}
 <span className="truncate text-[7px] font-bold">{form.school_name || 'Dareliman Edu'}</span>
 </div>
 {[1, 2, 3, 4, 5].map((item) => (
 <div
 key={item}
 className={`mb-2 h-4 rounded-lg ${
 item === 1 ? 'bg-[var(--preview-accent)]' : 'bg-current opacity-15'
 }`}
 />
 ))}
 </div>
 <div className="flex-1">
 <div
 className="h-9 border-b border-black/5 flex items-center justify-between px-3"
 style={{
 backgroundColor:
 form.header_style === 'transparent' ? 'transparent' : form.header_color,
 }}
 >
 <div className="h-3 w-16 rounded bg-slate-300/60 dark:bg-slate-700/60" />
 <div className="h-5 w-5 rounded-full bg-emerald-500" />
 </div>
 <div className="p-3 space-y-2">
 <div className="h-8 rounded-xl bg-white/80 dark:bg-slate-800/80 border border-emerald-200/80 dark:border-emerald-800/60" />
 <div className="grid grid-cols-2 gap-2">
 <div className="h-16 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-emerald-200/80 dark:border-emerald-800/60" />
 <div className="h-16 rounded-xl bg-white/90 dark:bg-slate-800/90 border border-emerald-200/80 dark:border-emerald-800/60" />
 </div>
 </div>
 </div>
 </div>
 </div>
 </aside>
 )}
 </div>

 {/* MODAL EDIT & TAMBAH FAQ */}
 <AppModal
 isOpen={isFaqModalOpen}
 onClose={() => setIsFaqModalOpen(false)}
 title={editingFaq ? 'Ubah Topik FAQ Bantuan' : 'Tambah Topik FAQ Bantuan Baru'}
 description="Kelola pertanyaan umum dan solusi resmi untuk membantu pengguna sistem."
 icon={HelpCircle}
 maxWidth="max-w-xl"
 footer={
 <div className="flex items-center justify-end gap-3 w-full">
 <button
 type="button"
 onClick={() => setIsFaqModalOpen(false)}
 className="group inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 text-xs font-black text-white shadow-sm hover:from-rose-600 hover:to-red-800 active:scale-95 transition-all cursor-pointer"
 >
 <span className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <X className="size-3.5" strokeWidth={2.5} />
 </span>
 <span>Batal</span>
 </button>
 <button
 type="submit"
 form="faq-form"
 className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white shadow-xs active:scale-95 transition-all cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60"
 >
 <span className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <CheckCircle2 className="size-3.5" strokeWidth={2.5} />
 </span>
 <span>Simpan Topik FAQ</span>
 </button>
 </div>
 }
 >
 <form id="faq-form" onSubmit={handleSaveFaq} className="space-y-4 pt-1">
 <div>
 <Select
 value={faqForm.category || 'Akademik & LMS'}
 onValueChange={(val) => setFaqForm({ ...faqForm, category: val })}
 >
 <SelectLabel>Kategori Modul FAQ *</SelectLabel>
 <SelectTrigger className="w-full bg-slate-50 dark:bg-slate-900 border-emerald-200/80 dark:border-emerald-800/60">
 <SelectValue placeholder="Pilih kategori FAQ..." />
 </SelectTrigger>
 <SelectContent>
 <SelectItem id="Akademik & LMS">Akademik & LMS</SelectItem>
 <SelectItem id="Absensi Digital">Absensi Digital & Gerbang</SelectItem>
 <SelectItem id="Tahfizh & Mutabaah">Tahfizh & Mutabaah</SelectItem>
 <SelectItem id="Kesiswaan">Kesiswaan & Murid</SelectItem>
 <SelectItem id="Kepegawaian">SDM & Kepegawaian</SelectItem>
 <SelectItem id="Keamanan & Akun">Keamanan & Akun</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Judul Pertanyaan (FAQ) *
 </label>
 <input
 type="text"
 required
 placeholder="Contoh: Bagaimana cara mengunduh modul ajar LMS?"
 value={faqForm.question}
 onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-200/80 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Jawaban & Solusi Detail *
 </label>
 <textarea
 rows={4}
 required
 placeholder="Tuliskan langkah-langkah penyelesaian secara jelas..."
 value={faqForm.answer}
 onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-200/80 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Path URL Pintasan (Opsional)
 </label>
 <input
 type="text"
 placeholder="Contoh: /dashboard/profil-akun"
 value={faqForm.actionUrl}
 onChange={(e) => setFaqForm({ ...faqForm, actionUrl: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-200/80 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Label Tombol Pintasan (Opsional)
 </label>
 <input
 type="text"
 placeholder="Contoh: Buka Halaman Profil"
 value={faqForm.actionLabel}
 onChange={(e) => setFaqForm({ ...faqForm, actionLabel: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-200/80 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Kata Kunci Tag Pencarian (Pisah koma)
 </label>
 <input
 type="text"
 placeholder="Contoh: password, ganti, lupa, profil"
 value={faqForm.tags}
 onChange={(e) => setFaqForm({ ...faqForm, tags: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-200/80 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>
 </form>
 </AppModal>

 {/* MODAL EDIT & TAMBAH BUKU PANDUAN PDF */}
 <AppModal
 isOpen={isManualModalOpen}
 onClose={() => setIsManualModalOpen(false)}
 title={editingManual ? 'Ubah Buku Panduan PDF' : 'Tambah Buku Panduan PDF Baru'}
 description="Daftarkan tautan dan meta dokumen petunjuk operasional resmi sekolah."
 icon={BookOpen}
 maxWidth="max-w-xl"
 footer={
 <div className="flex items-center justify-end gap-3 w-full">
 <button
 type="button"
 onClick={() => setIsManualModalOpen(false)}
 className="group inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 text-xs font-black text-white shadow-sm hover:from-rose-600 hover:to-red-800 active:scale-95 transition-all cursor-pointer"
 >
 <span className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <X className="size-3.5" strokeWidth={2.5} />
 </span>
 <span>Batal</span>
 </button>
 <button
 type="submit"
 form="manual-form"
 className="inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-medium text-white shadow-xs active:scale-95 transition-all cursor-pointer border border-emerald-200/80 dark:border-emerald-800/60"
 >
 <span className="flex size-5 items-center justify-center rounded-lg bg-white/20">
 <CheckCircle2 className="size-3.5" strokeWidth={2.5} />
 </span>
 <span>Simpan Buku Panduan</span>
 </button>
 </div>
 }
 >
 <form id="manual-form" onSubmit={handleSaveManual} className="space-y-4 pt-1">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Judul Buku Panduan *
 </label>
 <input
 type="text"
 required
 placeholder="Contoh: Buku Panduan Guru & Wali Kelas 2026"
 value={manualForm.title}
 onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-200/80 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Versi Dokumen
 </label>
 <input
 type="text"
 placeholder="v2.4 (2026)"
 value={manualForm.version}
 onChange={(e) => setManualForm({ ...manualForm, version: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-200/80 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Ukuran & Format File
 </label>
 <input
 type="text"
 placeholder="3.5 MB • PDF"
 value={manualForm.size}
 onChange={(e) => setManualForm({ ...manualForm, size: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-200/80 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Target Peran Pengguna
 </label>
 <input
 type="text"
 placeholder="Contoh: Guru Mata Pelajaran, Wali Kelas, Kepsek"
 value={manualForm.target}
 onChange={(e) => setManualForm({ ...manualForm, target: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-200/80 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
 Deskripsi Ringkas Dokumen *
 </label>
 <textarea
 rows={3}
 required
 placeholder="Jelaskan secara singkat isi cakupan panduan ini..."
 value={manualForm.desc}
 onChange={(e) => setManualForm({ ...manualForm, desc: e.target.value })}
 className="w-full rounded-xl border border-emerald-200/80 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-200/80 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-100"
 />
 </div>
 </form>
 </AppModal>

 {/* Save Confirmation Modal */}
 <SaveConfirmModal
 isOpen={isSaveConfirmOpen}
 onClose={() => setIsSaveConfirmOpen(false)}
 onConfirm={submitSchoolSettings}
 isSaving={saving}
 form={form}
 files={files}
 previews={previews}
 onPreviewPhoto={(url, title) => setPreviewPhotoModal({ isOpen: true, url, title })}
 />

 {/* Fullscreen Photo/Logo Preview Modal */}
 <PhotoPreviewModal
 isOpen={previewPhotoModal.isOpen}
 onClose={() => setPreviewPhotoModal({ isOpen: false, url: '', title: '' })}
 photoUrl={previewPhotoModal.url}
 title={previewPhotoModal.title}
 />

 {/* Harmonized Status & Feedback Modal (HeroUI Standard) */}
 <HarmonizedStatusModal
 isOpen={statusModal.isOpen}
 onClose={() => setStatusModal((prev) => ({ ...prev, isOpen: false }))}
 type={statusModal.type}
 title={statusModal.title}
 message={statusModal.message}
 />

 {/* HeroUI Harmonized Action & Delete Confirmation Modal */}
 <HarmonizedActionModal
 isOpen={confirmModal.isOpen}
 onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
 onConfirm={executeConfirmAction}
 title={confirmModal.title}
 desc={confirmModal.desc}
 confirmLabel={confirmModal.confirmLabel}
 variant={confirmModal.variant}
 />


 			</form>
 		</PageContainer>
 )
}

function Field({ label, value = '', onChange, icon: Icon, isTextarea = false, ...props }) {
 return (
 <div className="block space-y-2 text-xs font-bold text-slate-700 dark:text-slate-200">
 <div className="flex items-center gap-1.5 min-w-0">
 {Icon && <Icon className="h-3.5 w-3.5 text-white shrink-0" />}
 <span className="truncate">{label}</span>
 </div>
 {isTextarea ? (
 <textarea
 rows={3}
 {...props}
 value={value}
 onChange={(e) => onChange(e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50 px-3.5 py-2.5 text-xs font-medium outline-none transition focus:border-emerald-200/80 focus:ring-2 focus:ring-emerald-600/20 dark:border-emerald-800/60 dark:bg-slate-900 leading-relaxed"
 />
 ) : (
 <Input
 {...props}
 value={value}
 onChange={(e) => onChange(e.target.value)}
 className="h-9 text-xs bg-slate-50 dark:bg-slate-900 border-emerald-200/80 dark:border-emerald-800/60"
 />
 )}
 </div>
 )
}

function AssetUpload({
 label,
 accept,
 preview,
 fallback,
 onChange,
 onRemove,
 onPreviewFull,
 isNewFile = false,
}) {
 return (
 <div className="space-y-2">
 <div className="flex items-center justify-between">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 {label}
 </label>
 {isNewFile && (
 <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-extrabold text-teal-800 dark:bg-teal-950/60 dark:text-teal-300">
 <Sparkles className="size-2.5" />
 Berkas Baru Siap Disimpan
 </span>
 )}
 </div>

 {preview ? (
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/40 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20 transition-all shadow-xs">
 <div className="flex flex-col sm:flex-row items-center gap-4">
 {/* Thumbnail */}
 <div
 onClick={() => onPreviewFull && onPreviewFull(preview, label)}
 className="group relative flex size-16 shrink-0 items-center justify-center rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-1.5 shadow-sm dark:bg-slate-800 cursor-pointer hover:border-emerald-300 dark:hover:border-emerald-200/80 transition"
 title="Klik untuk melihat pratinjau penuh"
 >
 <img
 src={preview}
 alt={label}
 className="size-full rounded-xl object-contain transition group-hover:scale-105"
 />
 <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity">
 <Maximize2 className="size-4 text-emerald-600" />
 </div>
 </div>

 {/* Info */}
 <div className="flex-1 min-w-0 text-center sm:text-left space-y-0.5">
 <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
 <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
 {label}
 </span>
 <span className="inline-flex items-center rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
 {isNewFile ? 'Siap Disimpan' : 'Terpasang'}
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 {isNewFile
 ? 'Berkas telah dipilih dan akan diperbarui saat Anda mengklik "Simpan Pengaturan".'
 : 'Berkas aktif di sistem server. Klik tombol di samping untuk mengganti atau menghapus.'}
 </p>
 </div>

 {/* Actions */}
 <div className="flex sm:flex-col items-center gap-2 shrink-0">
 <button
 type="button"
 onClick={() => onPreviewFull && onPreviewFull(preview, label)}
 className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800/60 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700 shadow-2xs transition cursor-pointer"
 >
 <Eye className="size-3.5" />
 <span>Lihat Foto</span>
 </button>

 <label className="inline-flex items-center gap-1.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white dark:bg-[#18A972] dark:hover:bg-[#059669] dark:text-white px-3 py-1.5 text-xs font-bold hover:from-emerald-500 hover:to-teal-500 shadow-2xs transition cursor-pointer">
 <Upload className="size-3.5" />
 <span>Ganti Berkas</span>
 <input type="file" accept={accept} onChange={onChange} className="hidden" />
 </label>

 <button
 type="button"
 onClick={onRemove}
 className="inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition cursor-pointer"
 >
 <Trash2 className="size-3 text-rose-500" />
 <span>Hapus</span>
 </button>
 </div>
 </div>
 </div>
 ) : (
 <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/40 p-5 text-center transition-all hover:border-emerald-300 dark:hover:border-emerald-200/80 hover:bg-emerald-50/70 dark:border-emerald-800/60 dark:bg-emerald-950/20 dark:hover:border-emerald-200/80 group">
 <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300 shadow-xs group-hover:scale-105 transition-transform">
 <Upload className="size-5" />
 </div>
 <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
 Klik untuk Unggah {label}
 </span>
 <span className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
 Format {accept.includes('.ico') ? 'ICO, PNG, WebP' : 'PNG, JPG, WebP, SVG'} (Maksimal 2 MB)
 </span>
 <input type="file" accept={accept} onChange={onChange} className="hidden" />
 </label>
 )}
 </div>
 )
}
