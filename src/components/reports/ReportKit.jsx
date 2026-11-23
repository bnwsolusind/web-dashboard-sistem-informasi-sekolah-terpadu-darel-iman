import {
 BarChart3,
 Download,
 FileText,
 Printer,
 RefreshCw,
 SearchX,
 TrendingUp,
} from 'lucide-react'
import { MasterStatCard, MasterStatsGrid } from '../master-data'

const angka = (nilai) => new Intl.NumberFormat('id-ID').format(Number(nilai || 0))

export function ReportHeader({ title, description, onRefresh, onExport, eyebrow = 'Pusat Laporan', variant = 'default' }) {
 if (variant === 'white') {
 return (
 <header className="relative overflow-hidden rounded-xl border border-emerald-200/80 bg-white p-6 shadow-xs dark:border-emerald-800/60 dark:bg-[#1B2433] transition-all">
 <div className="flex flex-wrap items-start justify-between gap-4 relative z-10">
 <div className="max-w-2xl">
 <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
 <FileText size={14} /> {eyebrow}
 </div>
 <h1 className="mt-1.5 text-xl font-semibold tracking-tight text-slate-900 dark:text-white">
 {title}
 </h1>
 <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
 {description}
 </p>
 </div>
 <div className="flex flex-wrap items-center gap-2.5">
 {onRefresh && (
 <button
 type="button"
 className="inline-flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-emerald-50/40 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
 onClick={onRefresh}
 >
 <RefreshCw size={15} /> Muat Ulang
 </button>
 )}
 {onExport && (
 <button
 type="button"
 className="inline-flex items-center gap-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-emerald-50/40 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
 onClick={onExport}
 >
 <Download size={15} /> Export Excel
 </button>
 )}
 <button
 type="button"
 className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold shadow-xs transition dark:bg-emerald-500 dark: text-white border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 onClick={() => window.print()}
 >
 <Printer size={15} /> Cetak / PDF
 </button>
 </div>
 </div>
 </header>
 )
 }

 return (
 <header className="laporan-header">
 <div className="laporan-heading-copy">
 <div className="laporan-eyebrow"><FileText size={14} /> {eyebrow}</div>
 <h1>{title}</h1>
 <p>{description}</p>
 </div>
 <div className="panel-aksi-laporan">
 <button type="button" className="laporan-button" onClick={onRefresh}><RefreshCw size={16} /> Muat Ulang</button>
 {onExport && <button type="button" className="laporan-button" onClick={onExport}><Download size={16} /> Export Excel</button>}
 <button type="button" className="laporan-button laporan-button--primary" onClick={() => window.print()}><Printer size={16} /> Cetak / PDF</button>
 </div>
 <div className="laporan-hero-art" aria-hidden="true"><BarChart3 /></div>
 </header>
 )
}

export function ReportFilters({ children }) {
 return (
 <section className="laporan-filter-card">
 <div className="laporan-section-heading"><div><span>FILTER</span><h2>Filter Laporan</h2></div><small>Sesuaikan data yang ingin ditampilkan</small></div>
 <div className="laporan-filter">{children}</div>
 </section>
 )
}

export function ReportStats({ items }) {
 const defaultIcons = [BarChart3, TrendingUp, FileText, RefreshCw]
 const variants = ['success', 'info', 'warning', 'neutral']
 return (
 <MasterStatsGrid className={`laporan-kpis ${items.length === 5 ? 'laporan-kpis--five' : ''}`}>
 {items.map((item, index) => (
 <MasterStatCard
 key={item.label}
 icon={item.icon || defaultIcons[index % defaultIcons.length]}
 label={item.label}
 value={typeof item.value === 'string' ? item.value : angka(item.value)}
 description={item.note}
 variant={item.variant || variants[index % variants.length]}
 delay={40 + (index * 40)}
 />
 ))}
 </MasterStatsGrid>
 )
}

export function ReportTable({ columns, rows, empty = 'Belum ada data pada filter ini.', title = 'Rincian Data' }) {
 return (
 <section className="laporan-table-card">
 <div className="laporan-table-heading"><div><span>DATA LAPORAN</span><h2>{title}</h2></div><strong>{angka(rows.length)} data</strong></div>
 <div className="laporan-table-wrap">
 <table className="laporan-table">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300"><tr><th>No</th>{columns.map((column) => <th key={column.key}>{column.label}</th>)}</tr></thead>
 <tbody>
 {rows.length ? rows.map((row, index) => (
 <tr key={row.id || index}>
 <td className="laporan-row-number">{index + 1}</td>
 {columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : (row[column.key] ?? '-')}</td>)}
 </tr>
 )) : (
 <tr><td colSpan={columns.length + 1} className="laporan-empty"><SearchX size={28} /><strong>Data tidak ditemukan</strong><span>{empty}</span></td></tr>
 )}
 </tbody>
 </table>
 </div>
 </section>
 )
}

export function ReportState({ loading, error, children }) {
 if (loading) return <div className="laporan-state"><RefreshCw className="laporan-spin" size={24} /><strong>Memuat laporan</strong><span>Menyiapkan data terbaru...</span></div>
 if (error) return <div className="laporan-state laporan-state--error"><FileText size={24} /><strong>Laporan gagal dimuat</strong><span>{error}</span></div>
 return children
}

export function exportCsv(arg1, arg2, arg3) {
 let filename = 'export.csv'
 let columns = []
 let rows = []

 if (typeof arg1 === 'string' && Array.isArray(arg2) && Array.isArray(arg3)) {
 // Canonical: exportCsv(filename, columns, rows)
 filename = arg1
 columns = arg2
 rows = arg3
 } else if (Array.isArray(arg1) && typeof arg2 === 'string') {
 // Array of objects: exportCsv(rows, filename)
 rows = arg1
 filename = arg2
 if (rows.length > 0) {
 columns = Object.keys(rows[0]).map((key) => ({ key, label: key }))
 }
 } else if (typeof arg1 === 'string' && Array.isArray(arg2)) {
 // exportCsv(filename, rows)
 filename = arg1
 rows = arg2
 if (rows.length > 0) {
 columns = Object.keys(rows[0]).map((key) => ({ key, label: key }))
 }
 } else if (Array.isArray(arg1) && Array.isArray(arg2) && typeof arg3 === 'string') {
 // exportCsv(rows, columns, filename)
 rows = arg1
 columns = arg2
 filename = arg3
 }

 const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`
 const header = columns.map((column) => escape(column.label || column.key)).join(',')
 const body = rows.map((row) =>
 columns
 .map((column) =>
 escape(column.export ? column.export(row) : (row[column.key] ?? (typeof column === 'string' ? row[column] : '')))
 )
 .join(',')
 )
 const blob = new Blob([`\uFEFF${[header, ...body].join('\n')}`], { type: 'text/csv;charset=utf-8' })
 const url = URL.createObjectURL(blob)
 const link = document.createElement('a')
 link.href = url
 link.download = filename
 link.click()
 setTimeout(() => URL.revokeObjectURL(url), 1500)
}


