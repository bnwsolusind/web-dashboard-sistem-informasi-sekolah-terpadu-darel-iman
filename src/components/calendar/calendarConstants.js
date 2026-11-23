import {
 UserPlus,
 FileCheck,
 BookOpen,
 GraduationCap,
 Award,
 Palmtree,
 Calendar as CalendarIcon,
 Sparkles,
 Tag,
} from 'lucide-react'

// Category Configuration & Presets (PPDB, Daftar Ulang, Ujian, Terima Rapor, KBM, Libur, Custom)
export const PRESET_CATEGORIES = {
 ppdb_buka: {
 label: 'Pembukaan Pendaftaran PPDB',
 defaultColor: 'sky',
 icon: UserPlus,
 defaultModule: '/dashboard/berita-informasi',
 },
 ppdb_ulang: {
 label: 'Daftar Ulang PPDB',
 defaultColor: 'teal',
 icon: FileCheck,
 defaultModule: '/dashboard/berita-informasi',
 },
 mulai_kbm: {
 label: 'Awal KBM / Semester Baru',
 defaultColor: 'emerald',
 icon: BookOpen,
 defaultModule: '/dashboard/master-kurikulum',
 },
 ujian: {
 label: 'Pelaksanaan Ujian / Asesmen (PTS/PAS/PAT)',
 defaultColor: 'purple',
 icon: GraduationCap,
 defaultModule: '/dashboard/lms/ujian',
 },
 terima_rapor: {
 label: 'Penerimaan Rapor & Laporan Belajar',
 defaultColor: 'indigo',
 icon: Award,
 defaultModule: '/dashboard/lms/rapor',
 },
 libur_sekolah: {
 label: 'Libur Sekolah & Tanggal Merah',
 defaultColor: 'rose',
 icon: Palmtree,
 defaultModule: '',
 },
 libur_semester: {
 label: 'Libur Semester & Kenaikan Kelas',
 defaultColor: 'amber',
 icon: CalendarIcon,
 defaultModule: '/dashboard/master-tahun-ajaran',
 },
 kegiatan: {
 label: 'Kegiatan & Acara Sekolah',
 defaultColor: 'cyan',
 icon: Sparkles,
 defaultModule: '/dashboard/berita-informasi',
 },
 custom: {
 label: '+ Kategori Custom (Kategori Bebas)',
 defaultColor: 'slate',
 icon: Tag,
 defaultModule: '',
 },
}

// Color Palette Map (Badge, Dot, Border CSS Classes)
export const COLOR_PALETTE = {
 emerald: {
 label: 'Hijau Zamrud',
 badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-700',
 cardBg: 'bg-emerald-50/90 border-emerald-300 text-emerald-950 dark:bg-emerald-950/60 dark:border-emerald-700 dark:text-emerald-200',
 dotBg: 'bg-emerald-500',
 border: 'border-emerald-500',
 hex: '#10B981',
 },
 rose: {
 label: 'Merah Rose',
 badgeBg: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-700',
 cardBg: 'bg-rose-50/90 border-rose-300/80 text-rose-950 dark:bg-rose-950/60 dark:border-rose-700 dark:text-rose-200',
 dotBg: 'bg-rose-500',
 border: 'border-rose-500',
 hex: '#F43F5E',
 },
 amber: {
 label: 'Oranye Amber',
 badgeBg: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-700',
 cardBg: 'bg-amber-50/90 border-amber-300/80 text-amber-950 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200',
 dotBg: 'bg-amber-500',
 border: 'border-amber-500',
 hex: '#F59E0B',
 },
 purple: {
 label: 'Ungu Violet',
 badgeBg: 'bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/80 dark:text-purple-300 dark:border-purple-700',
 cardBg: 'bg-purple-50/90 border-purple-300/80 text-purple-950 dark:bg-purple-950/60 dark:border-purple-700 dark:text-purple-200',
 dotBg: 'bg-purple-500',
 border: 'border-purple-500',
 hex: '#A855F7',
 },
 sky: {
 label: 'Biru Langit',
 badgeBg: 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950/80 dark:text-sky-300 dark:border-sky-700',
 cardBg: 'bg-sky-50/90 border-sky-300/80 text-sky-950 dark:bg-sky-950/60 dark:border-sky-700 dark:text-sky-200',
 dotBg: 'bg-sky-500',
 border: 'border-sky-500',
 hex: '#0EA5E9',
 },
 teal: {
 label: 'Hijau Laut (Teal)',
 badgeBg: 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-700',
 cardBg: 'bg-teal-50/90 border-teal-300/80 text-teal-950 dark:bg-teal-950/60 dark:border-teal-700 dark:text-teal-200',
 dotBg: 'bg-teal-500',
 border: 'border-teal-500',
 hex: '#14B8A6',
 },
 indigo: {
 label: 'Nila Indigo',
 badgeBg: 'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/80 dark:text-indigo-300 dark:border-indigo-700',
 cardBg: 'bg-indigo-50/90 border-indigo-300/80 text-indigo-950 dark:bg-indigo-950/60 dark:border-indigo-700 dark:text-indigo-200',
 dotBg: 'bg-indigo-500',
 border: 'border-indigo-500',
 hex: '#6366F1',
 },
 pink: {
 label: 'Merah Muda (Pink)',
 badgeBg: 'bg-pink-100 text-pink-900 border-pink-300 dark:bg-pink-950/80 dark:text-pink-300 dark:border-pink-700',
 cardBg: 'bg-pink-50/90 border-pink-300/80 text-pink-950 dark:bg-pink-950/60 dark:border-pink-700 dark:text-pink-200',
 dotBg: 'bg-pink-500',
 border: 'border-pink-500',
 hex: '#EC4899',
 },
 cyan: {
 label: 'Sian Cyan',
 badgeBg: 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950/80 dark:text-cyan-300 dark:border-cyan-700',
 cardBg: 'bg-cyan-50/90 border-cyan-300/80 text-cyan-950 dark:bg-cyan-950/60 dark:border-cyan-700 dark:text-cyan-200',
 dotBg: 'bg-cyan-500',
 border: 'border-cyan-500',
 hex: '#06B6D4',
 },
 slate: {
 label: 'Abu Slate',
 badgeBg: 'bg-slate-100 text-slate-900 border-emerald-300 dark:bg-slate-800 dark:text-slate-200 dark:border-emerald-700/80',
 cardBg: 'bg-slate-50/90 border-emerald-300 text-slate-950 dark:bg-slate-800/40 dark:border-emerald-700/80 dark:text-slate-200',
 dotBg: 'bg-slate-500',
 border: 'border-slate-500',
 hex: '#64748B',
 },
}

// Module shortcut options for LMS & Academic integration
export const MODULE_LINK_OPTIONS = [
 { value: '', label: 'Tanpa Tautan Modul' },
 { value: '/dashboard/master-tahun-ajaran', label: 'Master Tahun Ajaran' },
 { value: '/dashboard/master-kurikulum', label: 'Master Kurikulum Akademik' },
 { value: '/dashboard/lms/ujian', label: 'Modul LMS Ujian & CBT' },
 { value: '/dashboard/lms/penugasan', label: 'Modul LMS Pengumpulan Tugas' },
 { value: '/dashboard/lms/materi', label: 'Modul LMS Materi & Modul Ajar' },
 { value: '/dashboard/lms/rapor', label: 'Modul Rapor Akademik' },
 { value: '/dashboard/tahfizh', label: 'Modul Tahfizh & Mutabaah' },
 { value: '/dashboard/berita-informasi', label: 'Portal Berita & Pengumuman' },
]

// Target audience options
export const AUDIENCE_OPTIONS = [
 { value: 'Semua Civitas', label: 'Semua Civitas (Siswa, Orang Tua, Guru & Staf)' },
 { value: 'Siswa & Orang Tua', label: 'Khusus Siswa & Orang Tua' },
 { value: 'Guru & Tenaga Pendidik', label: 'Khusus Guru & Tenaga Pendidik' },
 { value: 'Staf & Operasional', label: 'Khusus Staf & Operasional' },
]
