import React from 'react'
import {
 CalendarCheck,
 ChevronDown,
 ChevronRight,
 Database,
 Download,
 Eye,
 FileInput,
 FileSpreadsheet,
 Home,
 LayoutGrid,
 Pencil,
 Plus,
 Printer,
 RefreshCcw,
 RotateCcw,
 Star,
 Trash2,
 Upload,
} from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { Breadcrumbs } from '../ui/breadcrumbs'
import HeroUiFilterSelect from '../ui/HeroUiFilterSelect'
import { Tooltip } from '../ui/tooltip'
import {
 Button as HeroButton,
} from '@heroui/react'
import {
 AppBadge,
 AppButton,
 AppCard,
 AppDataTable,
 AppEmptyState,
 AppErrorState,
 AppFilterBar,
 AppModal,
 AppPageHeader,
 AppPagination,
 AppSearch,
 AppSkeleton,
 AppToolbar,
 ConfirmDialog,
 SummaryCard,
} from '../app'

export const masterStyles = {
 card: 'rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]',
 control: 'h-10 rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white text-xs font-semibold text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-900 dark:text-slate-200',
 label: 'mb-1.5 block text-sm font-semibold text-slate-800 dark:text-slate-100',
 error: 'mt-1.5 text-xs font-medium text-rose-600',
}

export function MasterDataPage({
 children,
 className = '',
 hideBreadcrumb = true,
 breadcrumbItems,
 breadcrumbPageTitle,
}) {
 const location = useLocation()

 const resolvedBreadcrumbs = React.useMemo(() => {
 if (breadcrumbItems && breadcrumbItems.length > 0) {
 return breadcrumbItems
 }
 const path = location.pathname
 if (path.includes('/akademik/jadwal')) {
 return [
 { href: '/dashboard/akademik', label: 'Akademik' },
 { label: 'Jadwal Pelajaran' },
 ]
 }
 if (path.includes('/orang-tua')) {
 return [
 { href: '/dashboard', label: 'Master Data' },
 { label: 'Orang Tua / Wali' },
 ]
 }
 const labelMap = {
 '/dashboard/students/unit-pendidikan': 'Unit Pendidikan',
 '/dashboard/master-jenis-unit': 'Jenis Unit',
 '/dashboard/master-tahun-ajaran': 'Tahun Ajaran',
 '/dashboard/master-subjects': 'Mata Pelajaran',
 '/dashboard/master/mata-pelajaran': 'Mata Pelajaran',
 '/dashboard/master-jabatan': 'Jabatan',
 '/dashboard/employees': 'Pegawai',
 '/dashboard/students': 'Buku Induk Siswa',
 '/dashboard/master/siswa': 'Buku Induk Siswa',
 '/dashboard/master/status-siswa': 'Status Siswa',
 }
 const label = labelMap[path] || 'Data Master'
 return [
 { href: '/dashboard', label: 'Master Data' },
 { label },
 ]
 }, [breadcrumbItems, location.pathname])

 return (
 <div className={`master-data-page space-y-6 pb-12 ${className}`}>
 {!hideBreadcrumb && (
 <Breadcrumbs
 items={resolvedBreadcrumbs}
 pageTitle={breadcrumbPageTitle}
 />
 )}
 {children}
 </div>
 )
}

export function MasterPageHeader({ title, description, actions, tone = 'default', icon: Icon, className = '' }) {
 return (
 <AppPageHeader
 variant={tone === 'brand' ? 'brand' : 'card'}
 icon={Icon}
 title={title}
 description={description}
 actions={actions && <MasterHeaderActions>{actions}</MasterHeaderActions>}
 className={`master-page-header ${className}`}
 />
 )
}

export function MasterHeaderActions({ children }) {
 return <div className="master-header-actions grid grid-cols-1 gap-2.5 sm:flex sm:flex-wrap sm:items-center">{children}</div>
}

// ── Tombol Aksi Berlabel (§H.3/§H.6 HeroUI_Pengaturan_Halaman) ──
// Bahasa visual = tombol submit modal: vivid gradient rounded-xl + ikon dalam
// wrapper putih/20. Varian secondary = slate outline netral (bukan cancel).
const actionIcons = {
  export: FileSpreadsheet,
  import: FileInput,
  primary: Plus,
  emerald: Plus,
  view: Eye,
  danger: Trash2,
  delete: Trash2,
  restore: RotateCcw,
  print: Printer,
  secondary: null,
}

const actionVariantClasses = {
  primary:
    'bg-[#059669] hover:bg-[#047857] dark:bg-[#18A972] dark:hover:bg-[#059669] text-white font-semibold shadow-xs border border-[#059669] dark:border-[#18A972]',
  emerald:
    'bg-[#059669] hover:bg-[#047857] dark:bg-[#18A972] dark:hover:bg-[#059669] text-white font-semibold shadow-xs border border-[#059669] dark:border-[#18A972]',
  view:
    'border border-emerald-200/80 dark:border-emerald-800/60 bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80 dark:border-emerald-800/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 shadow-xs font-semibold',
  export:
    'bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-xs',
  import:
    'bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow-xs',
  danger:
    'bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs border border-emerald-200/80 dark:border-emerald-800/60',
  delete:
    'bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs border border-emerald-200/80 dark:border-emerald-800/60',
  restore:
    'border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 shadow-xs font-semibold',
  success:
    'border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 shadow-xs font-semibold',
  print:
    'border border-emerald-200/80 dark:border-emerald-800/60 bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80 dark:border-emerald-800/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60 shadow-xs font-semibold',
  secondary:
    'border-2 border-emerald-300 dark:border-emerald-700/80 bg-white text-slate-700 shadow-xs hover:bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-emerald-950/30 font-semibold',
  neutral:
    'border-2 border-emerald-300 dark:border-emerald-700/80 bg-white text-slate-700 shadow-xs hover:bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-emerald-950/30 font-semibold',
}

export function MasterActionButton({ variant = 'primary', icon: CustomIcon, children, disabled = false, loading = false, onClick, onPress, className = '', ...props }) {
	const Icon = CustomIcon || actionIcons[variant] || actionIcons.primary
	const variantStyle = actionVariantClasses[variant] || actionVariantClasses.primary
	const isSolid = variant === 'primary' || variant === 'emerald' || variant === 'danger' || variant === 'delete'
	const isSecondary = variant === 'secondary' || variant === 'neutral'
	const isDisabled = disabled || loading
	return (
		<HeroButton
			onPress={onPress || onClick}
			onClick={onClick}
			isDisabled={isDisabled}
			className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${variantStyle} ${className}`}
			{...props}
		>
			{loading ? (
				<span className="size-3.5 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" aria-hidden="true" />
			) : (
				Icon && (
					<span className={`flex size-5 items-center justify-center rounded-lg ${isSolid ? 'bg-white/20' : isSecondary ? 'bg-slate-200/70 text-slate-600 dark:bg-slate-700 dark:text-slate-300' : 'bg-current/10 text-current'}`}>
						<Icon className="size-3.5" strokeWidth={2.2} />
					</span>
				)
			)}
			{children && <span>{children}</span>}
		</HeroButton>
	)
}

// ── Vivid Gradient Squircle (§H HeroUI_Pengaturan_Halaman — kontrak global) ──
const squircleVariants = {
	import: {
		icon: Upload,
		iconColor: 'text-sky-600 dark:text-sky-400',
		classes:
			'border border-sky-300 dark:border-sky-800 bg-sky-50 text-sky-700 hover:bg-sky-100/90 dark:bg-sky-950/60 dark:text-sky-300 shadow-2xs',
	},
	export: {
		icon: Download,
		iconColor: 'text-amber-600 dark:text-amber-400',
		classes:
			'border border-amber-300 dark:border-amber-800 bg-amber-50 text-amber-800 hover:bg-amber-100/90 dark:bg-amber-950/60 dark:text-amber-300 shadow-2xs',
	},
	print: {
		icon: Printer,
		iconColor: 'text-indigo-600 dark:text-indigo-400',
		classes:
			'border border-indigo-300 dark:border-indigo-800 bg-indigo-50 text-indigo-700 hover:bg-indigo-100/90 dark:bg-indigo-950/60 dark:text-indigo-300 shadow-2xs',
	},
	primary: {
		icon: Plus,
		iconColor: 'text-white',
		classes:
			'bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs',
		iconStrokeWidth: 2.5,
	},
	add: {
		icon: Plus,
		iconColor: 'text-white',
		classes:
			'bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs',
		iconStrokeWidth: 2.5,
	},
	create: {
		icon: Plus,
		iconColor: 'text-white',
		classes:
			'bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs',
		iconStrokeWidth: 2.5,
	},
	view: {
		icon: Eye,
		iconColor: 'text-sky-600 dark:text-sky-400',
		classes:
			'border border-sky-200 dark:border-sky-800 bg-sky-50 text-sky-700 hover:bg-sky-100/80 dark:bg-sky-950/60 dark:text-sky-300 shadow-2xs',
	},
	edit: {
		icon: Pencil,
		iconColor: 'text-amber-500 dark:text-amber-400',
		classes:
			'border border-amber-300 dark:border-amber-700 bg-amber-50 text-amber-800 hover:bg-amber-100/80 dark:bg-amber-950/60 dark:text-amber-300 shadow-2xs',
	},
	delete: {
		icon: Trash2,
		iconColor: 'text-rose-600 dark:text-rose-400',
		classes:
			'border border-rose-300 dark:border-rose-700 bg-rose-50 text-rose-700 hover:bg-rose-100/80 dark:bg-rose-950/60 dark:text-rose-300 shadow-2xs',
	},
	restore: {
		icon: RotateCcw,
		classes:
			'border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60',
	},
	setActive: {
		icon: Star,
		classes:
			'border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50 text-sky-700 hover:bg-sky-100/80 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-900/60',
	},
	neutral: {
		icon: Database,
		classes:
			'border-2 border-emerald-300 dark:border-emerald-700/80 bg-white text-slate-700 hover:bg-emerald-50/40 dark:border-emerald-800/60 dark:bg-[#1B2433] dark:text-slate-200 dark:hover:bg-emerald-950/30',
	},
	secondary: {
		icon: Database,
		iconColor: 'text-purple-600 dark:text-purple-400',
		classes:
			'border border-purple-200/90 dark:border-purple-800/80 bg-purple-50/70 text-purple-800 hover:bg-purple-100/90 dark:bg-purple-950/60 dark:text-purple-300 shadow-2xs',
	},
	sync: {
		icon: RotateCcw,
		classes:
			'border-2 border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-slate-900 dark:border-emerald-700 dark:text-emerald-400',
	},
	ghost: {
		icon: Database,
		classes:
			'border border-transparent bg-transparent text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-300 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300',
	},
	teal: {
		icon: LayoutGrid,
		classes:
			'border border-teal-300 dark:border-teal-700 bg-teal-50 text-teal-700 hover:bg-teal-100/80 dark:border-teal-800 dark:bg-teal-950/60 dark:text-teal-300',
	},
	cyan: {
		icon: CalendarCheck,
		classes:
			'border-2 border-emerald-300 bg-white text-emerald-700 hover:bg-emerald-50 dark:bg-slate-900 dark:border-emerald-700 dark:text-emerald-400',
	},
	violet: {
		icon: LayoutGrid,
		classes:
			'border border-violet-300 dark:border-violet-700 bg-violet-50 text-violet-700 hover:bg-violet-100/80 dark:border-violet-800 dark:bg-violet-950/60 dark:text-violet-300',
	},
	pink: {
		icon: FileSpreadsheet,
		classes:
			'border border-pink-300 dark:border-pink-700 bg-pink-50 text-pink-700 hover:bg-pink-100/80 dark:border-pink-800 dark:bg-pink-950/60 dark:text-pink-300',
	},
	// Alias lawas — dipetakan ke varian kanonis (§H). Jangan dipakai di kode baru.
	vividBlue: {
		icon: Database,
		classes:
			'border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50 text-sky-700 hover:bg-sky-100/80 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-900/60',
	},
	vividPurple: {
		icon: Printer,
		classes:
			'border border-emerald-200/80 dark:border-emerald-800/60 bg-indigo-50 text-indigo-700 hover:bg-indigo-100/80 dark:border-emerald-800/60 dark:bg-indigo-950/60 dark:text-indigo-300 dark:hover:bg-indigo-900/60',
	},
	vividSky: {
		icon: Upload,
		classes:
			'border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50 text-sky-700 hover:bg-sky-100/80 dark:border-emerald-800/60 dark:bg-sky-950/60 dark:text-sky-300 dark:hover:bg-sky-900/60',
	},
	vividAmber: {
		icon: Download,
		classes:
			'border border-amber-300 dark:border-amber-700 bg-amber-50 text-amber-800 hover:bg-amber-100/80 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
	},
	vividEmerald: {
		icon: Plus,
		classes:
			'bg-[#059669] hover:bg-[#047857] border border-[#059669] font-semibold',
		iconStrokeWidth: 2.5,
	},
}

const defaultSquircleLabels = {
	import: 'Import Data',
	export: 'Export Data',
	print: 'Cetak Data',
	primary: 'Tambah Data',
	view: 'Lihat Detail',
	edit: 'Ubah Data',
	delete: 'Hapus Data',
	restore: 'Pulihkan Data',
	setActive: 'Set Aktif',
	neutral: 'Kelola Data',
	secondary: 'Aksi Sekunder',
	sync: 'Sinkronisasi Data',
	ghost: 'Aksi',
	teal: 'Filter Data',
	cyan: 'Jadwal / Kalender',
	violet: 'Tampilan Grid',
	pink: 'Spreadsheet',
	vividBlue: 'Kelola Data',
	vividPurple: 'Cetak Data',
	vividSky: 'Import Data',
	vividAmber: 'Export Data',
	vividEmerald: 'Tambah Data',
}

export function SquircleActionButton({
	variant = 'primary',
	icon: CustomIcon,
	label,
	onClick,
	onPress,
	disabled = false,
	loading = false,
	className = '',
	iconOnly = true,
	showLabel = false,
	...props
}) {
	const config = squircleVariants[variant] || squircleVariants.primary
	const Icon = CustomIcon || config.icon
	const isDisabled = disabled || loading
	const effectiveLabel = label || props.title || defaultSquircleLabels[variant] || 'Aksi'
	const isPrimary = variant === 'primary' || variant === 'vividEmerald' || variant === 'create' || variant === 'add'
	const pressHandler = onPress || onClick
	const isIconOnly = iconOnly && !showLabel

	const buttonElement = isPrimary ? (
		<HeroButton
			onPress={pressHandler}
			isDisabled={isDisabled}
			aria-label={effectiveLabel}
			aria-busy={loading || undefined}
			title={effectiveLabel}
			className={cn(
				'inline-flex h-9 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-xs',
				isIconOnly ? 'w-9 p-0 shrink-0' : 'gap-1.5 px-4 text-xs whitespace-nowrap',
				className
			)}
			{...props}
		>
			{loading ? (
				<span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" aria-hidden="true" />
			) : (
				Icon && <Icon className={cn("size-4 shrink-0 stroke-[2.2] text-white", config.iconColor || "text-white")} />
			)}
			{!isIconOnly && <span className="text-white font-bold">{effectiveLabel}</span>}
		</HeroButton>
	) : (
		<HeroButton
			variant="light"
			onPress={pressHandler}
			isDisabled={isDisabled}
			aria-label={effectiveLabel}
			aria-busy={loading || undefined}
			title={effectiveLabel}
			className={cn(
				'inline-flex h-9 items-center justify-center rounded-xl font-medium transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:pointer-events-none shadow-2xs',
				isIconOnly ? 'w-9 p-0 shrink-0' : 'gap-1.5 px-3.5 text-sm whitespace-nowrap',
				config.classes,
				className
			)}
			{...props}
		>
			{loading ? (
				<span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
			) : (
				Icon && <Icon className={cn("size-4 shrink-0 stroke-[2.2]", config.iconColor)} />
			)}
			{!isIconOnly && <span>{effectiveLabel}</span>}
		</HeroButton>
	)

	return (
		<Tooltip content={effectiveLabel}>
			{buttonElement}
		</Tooltip>
	)
}

// ── Kartu Akses Cepat Horizontal (§H.7 HeroUI_Pengaturan_Halaman) ──
// Navigasi modul dashboard: kartu netral dengan aksen brand/semantic proporsional.
// Ikon squircle beraksen tone + judul kontras tinggi + subjudul sekunder.
const quickAccessTones = {
	emerald: {
		card: 'border-emerald-500/30 hover:border-emerald-500/60 !bg-emerald-100/90 hover:!bg-emerald-200/70 dark:border-emerald-600/40 dark:!bg-emerald-950/50 dark:hover:!bg-emerald-950/70',
		badge: '!bg-emerald-600 !text-white !border-emerald-600 shadow-xs dark:!bg-emerald-600 dark:!text-white',
		titleHover: 'group-hover:text-emerald-800 dark:group-hover:text-emerald-300',
	},
	sky: {
		card: 'border-sky-500/30 hover:border-sky-500/60 !bg-sky-100/90 hover:!bg-sky-200/70 dark:border-sky-600/40 dark:!bg-sky-950/50 dark:hover:!bg-sky-950/70',
		badge: '!bg-sky-600 !text-white !border-sky-600 shadow-xs dark:!bg-sky-600 dark:!text-white',
		titleHover: 'group-hover:text-sky-800 dark:group-hover:text-sky-300',
	},
	purple: {
		card: 'border-purple-500/30 hover:border-purple-500/60 !bg-purple-100/90 hover:!bg-purple-200/70 dark:border-purple-600/40 dark:!bg-purple-950/50 dark:hover:!bg-purple-950/70',
		badge: '!bg-purple-600 !text-white !border-purple-600 shadow-xs dark:!bg-purple-600 dark:!text-white',
		titleHover: 'group-hover:text-purple-800 dark:group-hover:text-purple-300',
	},
	amber: {
		card: 'border-amber-500/30 hover:border-amber-500/60 !bg-amber-100/90 hover:!bg-amber-200/70 dark:border-amber-600/40 dark:!bg-amber-950/50 dark:hover:!bg-amber-950/70',
		badge: '!bg-amber-600 !text-white !border-amber-600 shadow-xs dark:!bg-amber-600 dark:!text-white',
		titleHover: 'group-hover:text-amber-800 dark:group-hover:text-amber-300',
	},
	rose: {
		card: 'border-rose-500/30 hover:border-rose-500/60 !bg-rose-100/90 hover:!bg-rose-200/70 dark:border-rose-600/40 dark:!bg-rose-950/50 dark:hover:!bg-rose-950/70',
		badge: '!bg-rose-600 !text-white !border-rose-600 shadow-xs dark:!bg-rose-600 dark:!text-white',
		titleHover: 'group-hover:text-rose-800 dark:group-hover:text-rose-300',
	},
	teal: {
		card: 'border-teal-500/30 hover:border-teal-500/60 !bg-teal-100/90 hover:!bg-teal-200/70 dark:border-teal-600/40 dark:!bg-teal-950/50 dark:hover:!bg-teal-950/70',
		badge: '!bg-teal-600 !text-white !border-teal-600 shadow-xs dark:!bg-teal-600 dark:!text-white',
		titleHover: 'group-hover:text-teal-800 dark:group-hover:text-teal-300',
	},
	slate: {
		card: 'border-emerald-300 hover:border-slate-400 !bg-slate-100/90 hover:!bg-slate-200/70 dark:border-emerald-700/80 dark:!bg-slate-900/60 dark:hover:!bg-slate-900/80',
		badge: '!bg-slate-600 !text-white !border-slate-600 shadow-xs dark:!bg-slate-600 dark:!text-white',
		titleHover: 'group-hover:text-slate-800 dark:group-hover:text-slate-200',
	},
}

export function QuickAccessCard({
	icon: Icon,
	title,
	subtitle,
	onClick,
	tone = 'emerald',
	loading = false,
	layout = 'horizontal',
	className = '',
	...props
}) {
	const toneConfig = quickAccessTones[tone] || quickAccessTones.emerald
	const isVertical = layout === 'vertical'

	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={title}
			aria-busy={loading || undefined}
			className={`
				group min-w-0 rounded-2xl border-2 p-3 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer
				shadow-xs hover:shadow-md
				focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-emerald-400
				${isVertical ? 'flex flex-col items-center text-center gap-2.5 p-3.5 justify-center' : 'flex items-center gap-3 text-left'}
				${toneConfig.card}
				${className}
			`}
			{...props}
		>
			<span className={`flex size-11 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 shadow-xs ${toneConfig.badge}`}>
				{loading ? (
					<span className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />
				) : (
					Icon && <Icon className="size-5 text-white" strokeWidth={2.2} />
				)}
			</span>
			<span className={`min-w-0 ${isVertical ? 'w-full text-center' : 'flex-1 pr-1'}`}>
				<span className={`block text-xs font-extrabold text-slate-900 dark:text-slate-100 leading-tight transition-colors duration-150 ${toneConfig.titleHover}`}>
					{title}
				</span>
				{subtitle && (
					<span className="block text-[10px] font-medium text-slate-600 dark:text-slate-400 mt-1 leading-snug">
						{subtitle}
					</span>
				)}
			</span>
		</button>
	)
}

export function MasterStatsGrid({ children, className = '' }) {
 const childCount = React.Children.count(children)

 return (
 <section
 className={`master-stats-grid ${className}`}
 data-count={childCount > 6 ? 'many' : Math.max(childCount, 1)}
 >
 {children}
 </section>
 )
}

const statSchemeMap = {
 success: 'emerald',
 warning: 'amber',
 info: 'blue',
 danger: 'rose',
 neutral: 'slate',
}

export function MasterStatCard({
 icon: Icon,
 label,
 title,
 value,
 description,
 subtitle,
 badge = null,
 badgeVariant = 'info',
 variant = 'success',
 delay = 0,
 loading = false,
 onClick,
 active = false,
 className = '',
}) {
 return (
 <div className="master-stat-card ui-enter" style={{ animationDelay: `${delay}ms` }}>
 <SummaryCard
 icon={Icon}
 title={label || title}
 value={value}
 description={description || subtitle}
 badge={badge}
 badgeVariant={badgeVariant}
 colorScheme={statSchemeMap[variant] || 'emerald'}
 loading={loading}
 onClick={onClick}
 className={`${className} ${active ? 'ring-2 ring-emerald-600/80 shadow-md border-emerald-200/80 dark:border-emerald-800/60 dark:ring-emerald-400' : ''}`}
 />
 </div>
 )
}

export function MasterFilterBar({ search, filters, children }) {
 return (
 <AppFilterBar label={null} className="ui-enter">
 {search}
 {(filters || children) && (
 <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
 <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-600 dark:text-slate-300">
 <span className="text-[#059669] dark:text-[#18A972]">Filter:</span>
 </span>
 {filters || children}
 </div>
 )}
 </AppFilterBar>
 )
}

export function MasterSearchInput({ className = '', ...props }) {
 return <AppSearch className={className} {...props} />
}

export function MasterFilterSelect({
 className = '',
 children,
 value,
 onChange,
 disabled = false,
 placeholder = 'Pilih...',
 size = 'md',
 ...props
}) {
 const flattenOptions = (nodes) => {
 const result = []
 React.Children.forEach(nodes, (child) => {
 if (!child) return
 if (Array.isArray(child)) {
 result.push(...flattenOptions(child))
 } else if (React.isValidElement(child)) {
 if (child.type === React.Fragment) {
 result.push(...flattenOptions(child.props.children))
 } else if (child.type === 'option') {
 const optValue = child.props.value !== undefined ? String(child.props.value) : String(child.props.children ?? '')
 const optLabel = Array.isArray(child.props.children)
 ? child.props.children.join('')
 : String(child.props.children ?? optValue)
 result.push({ value: optValue, label: optLabel })
 }
 }
 })
 return result
 }

 const options = flattenOptions(children)
 const stringValue = value !== undefined && value !== null ? String(value) : ''

 return (
 <div className={`min-w-38 ${className}`}>
 <HeroUiFilterSelect
 id={props.id}
 value={stringValue}
 onChange={(nextVal) => onChange?.({ target: { value: nextVal } })}
 options={options}
 placeholder={placeholder}
 disabled={disabled}
 size={size}
 ariaLabel={props['aria-label'] || props.ariaLabel || placeholder}
 />
 </div>
 )
}

/**
 * Canonical list/CRUD data surface.
 *
 * `search` accepts an AppSearch element or an AppSearch props object.
 * `pagination` accepts `{ meta, page, onPageChange }` plus manual
 * AppPagination props. Table markup remains page-owned so migrations can keep
 * their domain-specific responsive cells without duplicating this shell.
 */
export function MasterDataSection({
 title,
 description,
 countLabel,
 search,
 filters,
 stackedFilters = false,
 onReset,
 resetLabel = 'Reset',
 resetDisabled = false,
 actions,
 isLoading = false,
 isError = false,
 errorTitle = 'Data gagal dimuat',
 errorMessage = 'Terjadi kesalahan saat mengambil data.',
 onRetry,
 isEmpty,
 emptyTitle = 'Data Tidak Ditemukan',
 emptyDescription = 'Belum ada data yang sesuai dengan kriteria.',
 emptyActionLabel,
 emptyActionOnClick,
 pagination,
 headingId,
 ariaLabel,
 className = '',
 toolbarClassName = '',
 tableClassName = '',
 children,
}) {
 const generatedHeadingId = React.useId().replaceAll(':', '')
 const resolvedHeadingId = headingId || `master-data-section-${generatedHeadingId}`
 const hasHeading = Boolean(title || description || (countLabel !== undefined && countLabel !== null))

 let searchNode = null
 if (React.isValidElement(search)) {
 searchNode = React.cloneElement(search, {
 className: `master-data-section__search ${search.props.className || ''}`,
 })
 } else if (search && typeof search === 'object') {
 const { onValueChange, onChange, className: searchClassName = '', ...searchProps } = search
 searchNode = (
 <AppSearch
 {...searchProps}
 className={`master-data-section__search ${searchClassName}`}
 onChange={onChange || (onValueChange ? (event) => onValueChange(event.target.value) : undefined)}
 />
 )
 }

 const filterNode = (filters || onReset) ? (
 <div className="master-data-section__filters">
 {filters}
 {onReset && (
 <AppButton
 type="button"
 variant="secondary"
 size="sm"
 icon={RefreshCcw}
 onClick={onReset}
 disabled={resetDisabled}
 className="master-data-section__reset"
 >
 {resetLabel}
 </AppButton>
 )}
 </div>
 ) : null

 const paginationNode = React.isValidElement(pagination) ? pagination : pagination && (
 <AppPagination
 {...pagination}
 currentPage={pagination.page ?? pagination.currentPage}
 onPageChange={pagination.onPageChange}
 meta={pagination.meta}
 />
 )

 return (
 <section
 className={`master-data-section ui-enter space-y-6 ${className}`}
 aria-labelledby={title ? resolvedHeadingId : undefined}
 aria-label={!title ? ariaLabel : undefined}
 >
 {hasHeading && (
 <header className="master-data-section__header flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between mb-4 pb-3.5 border-b border-emerald-200/80 dark:border-emerald-800/80">
 <div className="flex items-center gap-3 min-w-0">
 {title && <h2 id={resolvedHeadingId} className="master-data-section__title text-lg font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>}
 {countLabel !== undefined && countLabel !== null && (
 <AppBadge variant="success" className="master-data-section__count font-bold">{countLabel}</AppBadge>
 )}
 </div>
 {actions && (
 <div className="flex items-center gap-2 flex-wrap shrink-0">
 {actions}
 </div>
 )}
 </header>
 )}

 {(searchNode || filterNode || (!hasHeading && actions)) && (
 <div className={`master-data-section__toolbar ${stackedFilters ? 'master-data-section__toolbar--stacked' : ''} ${toolbarClassName}`}>
 <AppToolbar search={searchNode} filters={filterNode} actions={!hasHeading ? actions : null} stacked={stackedFilters} />
 </div>
 )}

 <AppDataTable
 embedded
 serverControlled
 showToolbar={false}
 showPagination={false}
 renderTable={() => children}
 isLoading={isLoading}
 isError={isError}
 errorTitle={errorTitle}
 errorMessage={errorMessage}
 onRetry={onRetry}
 isEmpty={isEmpty}
 emptyTitle={emptyTitle}
 emptyDescription={emptyDescription}
 emptyActionLabel={emptyActionLabel}
 emptyActionOnClick={emptyActionOnClick}
 tableContainerClassName={tableClassName}
 />

 {paginationNode && !isLoading && !isError && !isEmpty && (
 <div className="master-data-section__pagination">{paginationNode}</div>
 )}
 </section>
 )
}

export function MasterDataTable({ children, className = '', id, ...props }) {
 return (
 <AppCard id={id} noPadding className={`master-table ui-enter relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] ${className}`} {...props}>
 <div className="overflow-x-auto">{children}</div>
 </AppCard>
 )
}

const badgeVariantMap = {
 success: 'success',
 danger: 'danger',
 warning: 'warning',
 info: 'info',
 neutral: 'neutral',
}

export function MasterBadge({ variant = 'neutral', children, color, className = '' }) {
 return (
 <AppBadge
 variant={badgeVariantMap[variant] || 'neutral'}
 className={className}
 style={color ? { borderColor: color, color } : undefined}
 >
 {children}
 </AppBadge>
 )
}

export function MasterStatusBadge({ active, status, activeLabel = 'Aktif', inactiveLabel = 'Tidak Aktif' }) {
 const isCurrentlyActive = active !== undefined 
 ? Boolean(active) 
 : (status === true || String(status).toLowerCase() === 'aktif' || String(status).toLowerCase() === 'active')
 return (
 <AppBadge variant={isCurrentlyActive ? 'success' : 'danger'} dot>
 {isCurrentlyActive ? activeLabel : inactiveLabel}
 </AppBadge>
 )
}

export function MasterActionGroup({ children }) {
 return <div className="inline-flex items-center gap-2">{children}</div>
}

// ── Aksi Ikon Level Baris (§H.6):SELALU Alias ke SquircleActionButton ──
// Dilarang memakai IconButton/AppButton ghost-outlined untuk aksi baris.
const iconButtonVariantMap = {
	view: 'view',
	edit: 'edit',
	delete: 'delete',
	print: 'print',
	restore: 'restore',
	import: 'import',
	export: 'export',
}

const iconButtonDefaultLabels = {
	view: 'Lihat Detail',
	edit: 'Edit Data',
	delete: 'Hapus Data',
	print: 'Cetak Data',
	restore: 'Pulihkan Data',
	import: 'Import Data',
	export: 'Export Data',
}

/**
 * @param {Object} props
 * @param {string} [props.variant]
 * @param {any} [props.icon]
 * @param {string} [props.label]
 * @param {boolean} [props.loading]
 * @param {boolean} [props.disabled]
 * @param {string} [props.className]
 * @param {any} [props.onClick]
 * @param {any} [props.title]
 * @param {any} [props.children]
 */
export function MasterActionIconButton({ variant = 'view', icon = undefined, label = '', loading = false, ...props }) {
	const mapped = iconButtonVariantMap[variant] || 'view'
	return (
		<SquircleActionButton
			variant={mapped}
			icon={icon}
			label={label || iconButtonDefaultLabels[mapped] || 'Aksi'}
			loading={loading}
			{...props}
		/>
	)
}

export function MasterPagination({ meta = {}, page = 1, onPageChange }) {
 if (!(meta.total > 0)) return null
 return (
 <AppPagination
 meta={meta}
 currentPage={page}
 onPageChange={onPageChange}
 />
 )
}

function ModalShell({ isOpen, onClose, icon: Icon = Database, title, description, children, footer, maxWidth = 'max-w-5xl', hideCloseButton = false, ...rest }) {
  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      icon={Icon}
      title={title}
      description={description}
      footer={footer}
      maxWidth={maxWidth}
      hideCloseButton={hideCloseButton}
      {...rest}
    >
      {children}
    </AppModal>
  )
}

export function MasterFormModal(props) {
  return <ModalShell maxWidth="max-w-5xl" {...props} />
}

export function MasterDetailModal(props) {
  return <ModalShell maxWidth="max-w-5xl" {...props} />
}

export function MasterDeleteDialog({ isOpen, onClose, onConfirm, title = 'Hapus data?', description, isLoading = false }) {
 return (
 <ConfirmDialog
 isOpen={isOpen}
 onClose={onClose}
 onConfirm={onConfirm}
 title={title}
 message={description || 'Tindakan ini tidak dapat dibatalkan.'}
 action="delete"
 confirmLabel="Hapus"
 isDanger
 isLoading={isLoading}
 icon={Trash2}
 />
 )
}

export function MasterLoadingState({ label = 'Memuat data...' }) {
 return (
 <div className={`${masterStyles.card} p-4`}>
 <AppSkeleton variant="table" rows={4} cols={4} />
 <p className="mt-3 text-center text-sm font-medium text-emerald-700 dark:text-emerald-300">{label}</p>
 </div>
 )
}

export function MasterEmptyState({ title = 'Data Tidak Ditemukan', description = 'Belum ada data yang sesuai dengan kriteria.', action }) {
 return <AppEmptyState title={title} description={description} action={action} />
}

export function MasterErrorState({ title = 'Data gagal dimuat', description = 'Terjadi kesalahan saat mengambil data.', onRetry }) {
 return <AppErrorState title={title} description={description} onRetry={onRetry} />
}

export { default as PrintOptionModal } from './PrintOptionModal'
