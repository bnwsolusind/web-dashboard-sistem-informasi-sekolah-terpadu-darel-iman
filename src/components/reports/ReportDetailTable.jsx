import React from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { Eye, Search, Building2, Briefcase, Calendar, UserCheck, ArrowRightLeft as ArrowBothDirectionHorizontal2 } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { TableRoot, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from '@/components/ui/avatar'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card'

function getInitials(name) {
 if (!name) return 'SDM'
 const parts = name.trim().split(' ').filter(Boolean)
 if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
 return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getStatusKepegawaianBadgeProps(status) {
 if (!status) return { color: 'gray', className: 'bg-slate-100 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80' }
 const s = String(status).toLowerCase()
 if (s.includes('tetap')) {
 return { color: 'success', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60' }
 }
 if (s.includes('kontrak')) {
 return { color: 'blue', className: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-emerald-200/80 dark:border-emerald-800/60' }
 }
 if (s.includes('honorer')) {
 return { color: 'orange', className: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-emerald-200/80 dark:border-emerald-800/60' }
 }
 return { color: 'gray', className: 'bg-slate-100 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80' }
}

function getStatusAktifBadgeProps(status) {
 if (!status) return { color: 'success', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60' }
 const s = String(status).toLowerCase()
 if (s.includes('aktif') && !s.includes('non') && !s.includes('tidak')) {
 return { color: 'success', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60' }
 }
 return { color: 'error', className: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-emerald-200/80 dark:border-emerald-800/60' }
}

const COLUMN_WIDTHS = {
 nama: 'w-[34%]',
 unit: 'w-[28%]',
 status_kepegawaian: 'w-[22%]',
 tanggal_masuk: 'w-[16%]',
}

export function ReportDetailTable({
 title = 'Rincian Data Laporan',
 description = 'Daftar rincian data pembentuk angka laporan. Hanya aksi Lihat Detail yang tersedia.',
 columns = [],
 data = [],
 meta = null,
 search = '',
 perPage = 15,
 onSearchChange,
 onPerPageChange,
 onPageChange,
 onViewDetail,
 filters = {},
 onFilterChange,
}) {
 return (
 <Card className="border border-emerald-200/80 bg-white shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433]">
 {/* Baris 1: Header Title & Subtitle + Meta Badge */}
 <div className="flex flex-col justify-between gap-3 border-b border-emerald-100/80 px-5 py-4 dark:border-emerald-800/80 sm:flex-row sm:items-center sm:px-6 md:px-8">
 <div>
 <div className="flex items-center gap-2.5">
 <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{title}</h3>
 {meta?.total > 0 && (
 <Badge color="cyan" size="sm">
 {meta.total} Total Data
 </Badge>
 )}
 </div>
 <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
 </div>
 </div>

 {/* Baris 2: Search + Filter Dropdowns + PerPage Select */}
 <div className="flex flex-col gap-3 border-b border-emerald-100/80 px-5 py-3.5 dark:border-emerald-800/80 sm:flex-row sm:items-center sm:justify-between sm:px-6 md:px-8 print:hidden">
 {/* Search Input */}
 <div className="relative flex-1 max-w-sm">
 <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
 placeholder="Cari data nama, unit, ID..."
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 pl-9 pr-3.5 py-1.5 text-xs text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 dark:border-emerald-700/80 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-emerald-500"
 />
 </div>

 {/* Filter Dropdowns + PerPage Select */}
 <div className="flex flex-wrap items-center gap-2.5">
 {/* Jenis Filter */}
 {onFilterChange && filters?.jenis_sdm !== undefined && (
 <CustomSelect
 value={filters?.jenis_sdm || 'all'}
 onChange={(e) => onFilterChange({ jenis_sdm: e.target.value })}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition hover:border-emerald-300 dark:border-emerald-700/80 dark:bg-slate-900/60 dark:text-slate-200 cursor-pointer"
 >
 <option value="all">Semua Jenis SDM</option>
 <option value="guru">Guru / Pendidik</option>
 <option value="non-guru">Pegawai Non-Guru</option>
 </CustomSelect>
 )}

 {/* Status Kepegawaian Filter */}
 {onFilterChange && filters?.status_pegawai !== undefined && (
 <CustomSelect
 value={filters?.status_pegawai || 'all'}
 onChange={(e) => onFilterChange({ status_pegawai: e.target.value })}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 px-3 py-1.5 text-xs font-medium text-slate-700 outline-none transition hover:border-emerald-300 dark:border-emerald-700/80 dark:bg-slate-900/60 dark:text-slate-200 cursor-pointer"
 >
 <option value="all">Semua Status Pegawai</option>
 <option value="Tetap">Tetap</option>
 <option value="Kontrak">Kontrak</option>
 <option value="Honorer">Honorer</option>
 </CustomSelect>
 )}

 {/* PerPage Select Options (5, 10, 15, 25, 50, 100) */}
 <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
 <span className="hidden sm:inline font-medium">Tampilkan:</span>
 <CustomSelect
 value={perPage || 15}
 onChange={(e) => onPerPageChange && onPerPageChange(Number(e.target.value))}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/60 px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none transition hover:border-emerald-300 dark:border-emerald-700/80 dark:bg-slate-900/60 dark:text-slate-200 cursor-pointer"
 >
 <option value={5}>5 baris</option>
 <option value={10}>10 baris</option>
 <option value={15}>15 baris</option>
 <option value={25}>25 baris</option>
 <option value={50}>50 baris</option>
 <option value={100}>100 baris</option>
 </CustomSelect>
 </div>
 </div>
 </div>

 {/* Padded Container (Zero Horizontal Scroll/Shift) */}
 <div className="p-4 sm:p-6 md:p-8">
 <div className="overflow-hidden rounded-xl border border-emerald-200/80 shadow-2xs dark:border-emerald-800/60">
 <div className="w-full overflow-x-auto min-w-0 print:overflow-visible">
 <TableRoot className="w-full min-w-[640px] border-collapse" fullBleed={false}>
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <TableRow>
 {columns.map((col, idx) => (
 <TableHead
 key={idx}
 className={`px-4 py-3.5 text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100 ${COLUMN_WIDTHS[col.accessor] || 'w-auto'} ${
 col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
 }`}
 >
 <div className="inline-flex items-center gap-1.5 truncate">
 <span className="truncate">{col.header}</span>
 {col.sortable !== false && (
 <ArrowBothDirectionHorizontal2 className="h-3.5 w-3.5 opacity-50 hover:opacity-100 transition cursor-pointer shrink-0 text-emerald-600 dark:text-emerald-400" />
 )}
 </div>
 </TableHead>
 ))}
 <TableHead className="w-[10%] px-4 py-3.5 text-center text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-100 print:hidden">
 Aksi
 </TableHead>
 </TableRow>
 </TableHeader>

 <TableBody className="divide-y divide-emerald-100/80/80 bg-white dark:divide-emerald-900/40/60 dark:bg-[#111827]">
 {data.length === 0 ? (
 <TableRow>
 <TableCell colSpan={columns.length + 1} className="p-8 text-center text-slate-500">
 <div className="flex flex-col items-center justify-center space-y-2">
 <span className="text-sm font-semibold">Tidak ada data rinci untuk ditampilkan</span>
 <span className="text-xs text-slate-400">Coba sesuaikan pencarian atau filter pilihan Anda.</span>
 </div>
 </TableCell>
 </TableRow>
 ) : (
 data.map((row, rIdx) => (
 <TableRow
 key={rIdx}
 className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-all duration-150 group"
 >
 {/* 1. Nama / Pegawai / Siswa */}
 <TableCell className="px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-200 w-[34%]">
 <HoverCard>
 <HoverCardTrigger
 className="inline-flex items-center gap-3 cursor-pointer group/name text-left focus:outline-none w-full min-w-0"
 onClick={() => onViewDetail && onViewDetail(row)}
 >
 <Avatar size="sm" className="ring-2 ring-emerald-500/20 group-hover/name:ring-emerald-500 transition-all shadow-xs shrink-0">
 {row.foto_url && <AvatarImage src={row.foto_url} alt={row.nama} />}
 <AvatarFallback className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-extrabold text-xs">
 {getInitials(row.nama)}
 </AvatarFallback>
 <AvatarBadge status={row.status === 'Aktif' ? 'online' : 'offline'} size="sm" />
 </Avatar>

 <div className="flex flex-col min-w-0 flex-1">
 <div className="flex items-center gap-2">
 <span className="font-bold text-xs text-slate-900 dark:text-white group-hover/name:text-emerald-600 dark:group-hover/name:text-emerald-400 transition-colors truncate">
 {row.nama}
 </span>
 <Badge
 color={
 row.jenis_sdm === 'Guru' ? 'cyan' :
 row.jenis_kelamin === 'L' || row.jenis_kelamin === 'Laki-Laki' ? 'blue' :
 row.jenis_kelamin === 'P' || row.jenis_kelamin === 'Perempuan' ? 'pink' :
 'gray'
 }
 size="sm"
 className="shrink-0 text-[9px] px-1.5 py-0.2"
 >
 {row.jenis_sdm || (row.jenis_kelamin === 'L' ? 'Laki-Laki' : row.jenis_kelamin === 'P' ? 'Perempuan' : 'Siswa')}
 </Badge>
 </div>
 <span className="text-[10px] text-slate-400 font-mono truncate">
 {row.niy ? `NIY: ${row.niy}` : row.nis ? `NIS: ${row.nis}${row.nisn ? ` • NISN: ${row.nisn}` : ''}` : '-'}
 </span>
 </div>
 </HoverCardTrigger>

 <HoverCardContent side="top" align="start" className="w-80 p-4 border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433] rounded-xl shadow-xl space-y-3 z-50">
 <div className="flex items-center gap-3 pb-3 border-b border-emerald-100/80 dark:border-emerald-800/80">
 <Avatar size="lg" className="ring-2 ring-emerald-500/30 shrink-0">
 {row.foto_url && <AvatarImage src={row.foto_url} alt={row.nama} />}
 <AvatarFallback className="bg-emerald-600 text-white font-extrabold text-sm">
 {getInitials(row.nama)}
 </AvatarFallback>
 <AvatarBadge status={row.status === 'Aktif' ? 'online' : 'offline'} size="lg" />
 </Avatar>
 <div className="min-w-0 flex-1">
 <h4 className="font-extrabold text-xs text-slate-900 dark:text-white ">{row.nama}</h4>
 <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold font-mono mt-0.5">
 {row.niy ? `NIY: ${row.niy}` : row.nis ? `NIS: ${row.nis}${row.nisn ? ` • NISN: ${row.nisn}` : ''}` : '-'}
 </p>
 <div className="flex items-center gap-1.5 mt-1.5">
 <Badge color={row.jenis_sdm === 'Guru' ? 'cyan' : 'gray'} size="sm">
 {row.jenis_sdm || (row.jenis_kelamin === 'L' ? 'Laki-Laki' : 'Siswa')}
 </Badge>
 <Badge color={row.status === 'Aktif' ? 'success' : 'error'} size="sm">
 {row.status || 'Aktif'}
 </Badge>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-2 gap-2 text-xs">
 <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-[9px] font-bold text-slate-400 block uppercase">Unit Pendidikan</span>
 <span className="font-semibold text-slate-700 dark:text-slate-200 truncate block mt-0.5">{row.unit || '-'}</span>
 </div>
 <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-[9px] font-bold text-slate-400 block uppercase">{row.kelas ? 'Kelas / Rombel' : 'Status Pegawai'}</span>
 <span className="font-semibold text-slate-700 dark:text-slate-200 truncate block mt-0.5">{row.kelas ? `${row.kelas} (${row.rombel || '-'})` : (row.status_kepegawaian || '-')}</span>
 </div>
 <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-[9px] font-bold text-slate-400 block uppercase">{row.jenis_kelamin ? 'Jenis Kelamin' : 'Jabatan'}</span>
 <span className="font-semibold text-slate-700 dark:text-slate-200 truncate block mt-0.5">{row.jenis_kelamin || row.jabatan || '-'}</span>
 </div>
 <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60">
 <span className="text-[9px] font-bold text-slate-400 block uppercase">Tanggal Masuk</span>
 <span className="font-semibold text-slate-700 dark:text-slate-200 truncate block mt-0.5">{row.tanggal_masuk || '-'}</span>
 </div>
 </div>

 <Button
 variant="primary"
 size="xs"
 className="w-full justify-center text-xs font-bold py-2 mt-1"
 onClick={() => onViewDetail && onViewDetail(row)}
 >
 Lihat Detail Selengkapnya
 </Button>
 </HoverCardContent>
 </HoverCard>
 </TableCell>

 {/* 2. Unit & Jabatan / Kelas */}
 <TableCell className="px-4 py-3 text-xs text-slate-700 dark:text-slate-200 w-[28%]">
 <div className="flex flex-col min-w-0">
 <span className="font-bold text-slate-800 dark:text-white truncate">
 {row.unit || '-'}
 </span>
 <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
 {row.kelas ? `Kelas: ${row.kelas}${row.rombel ? ` (${row.rombel})` : ''}` : (row.jabatan || '-') + (row.divisi_mapel ? ` • ${row.divisi_mapel}` : '')}
 </span>
 </div>
 </TableCell>

 {/* 3. Status Kepegawaian / Status Siswa */}
 <TableCell className="px-4 py-3 text-xs w-[22%]">
 {(() => {
 const kepProps = getStatusKepegawaianBadgeProps(row.status_kepegawaian)
 const aktProps = getStatusAktifBadgeProps(row.status)
 return (
 <div className="flex items-center gap-1.5 flex-wrap">
 {row.status_kepegawaian && (
 <Badge
 color={kepProps.color}
 size="sm"
 className={`font-extrabold px-2.5 py-0.5 rounded-full text-xs shadow-2xs ${kepProps.className}`}
 >
 {row.status_kepegawaian}
 </Badge>
 )}
 <Badge
 color={aktProps.color}
 size="sm"
 className={`font-extrabold px-2.5 py-0.5 rounded-full text-xs shadow-2xs ${aktProps.className}`}
 >
 {row.status || 'Aktif'}
 </Badge>
 </div>
 )
 })()}
 </TableCell>

 {/* 4. Tanggal Masuk */}
 <TableCell className="px-4 py-3 text-xs text-slate-600 dark:text-slate-300 font-medium w-[16%] truncate">
 {row.tanggal_masuk || '-'}
 </TableCell>

 {/* 5. Aksi */}
 <TableCell className="px-4 py-3 text-center print:hidden w-[10%]">
 <Button
 variant="ghost"
 size="xs"
 onClick={() => onViewDetail && onViewDetail(row)}
 className="hover:scale-105 transition-transform duration-150"
 prefixIcon={<Eye className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />}
 >
 Lihat
 </Button>
 </TableCell>
 </TableRow>
 ))
 )}
 </TableBody>
 </TableRoot>
 </div>
 </div>
 </div>

 {/* Footer Pagination Container */}
 {meta && (
 <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-emerald-100/80 px-5 py-4 dark:border-emerald-800/60 sm:px-6 md:px-8 print:hidden">
 <span className="text-xs text-slate-500 dark:text-slate-400">
 Menampilkan <strong className="font-bold text-slate-700 dark:text-slate-200">{((meta.current_page - 1) * meta.per_page) + 1}</strong> - <strong className="font-bold text-slate-700 dark:text-slate-200">{Math.min(meta.current_page * meta.per_page, meta.total)}</strong> dari <strong className="font-bold text-slate-700 dark:text-slate-200">{meta.total}</strong> data
 </span>

 {meta.last_page > 1 && (
 <Pagination
 currentPage={meta.current_page}
 totalPages={meta.last_page}
 onPageChange={(p) => onPageChange && onPageChange(p)}
 sideLayout="full"
 variant="compact"
 />
 )}
 </div>
 )}
 </Card>
 )
}
