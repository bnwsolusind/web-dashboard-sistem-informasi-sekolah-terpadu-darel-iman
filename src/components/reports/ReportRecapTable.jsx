import React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { TableRoot, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

export function ReportRecapTable({
 title = 'Rekapitulasi per Unit Pendidikan',
 description = 'Subtotal dan total per per-unit pendidikan di bawah yayasan.',
 columns = [],
 data = [],
 totalRow = null,
}) {
 if (!data || data.length === 0) return null

 return (
 <Card className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433]">
 <CardHeader className="pb-3">
 <CardTitle className="text-base font-bold text-slate-900 dark:text-white">{title}</CardTitle>
 {description && <CardDescription className="text-xs text-slate-500 dark:text-slate-400">{description}</CardDescription>}
 </CardHeader>
 <CardContent className="pt-0">
 <div className="overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
 <TableRoot>
 <TableHeader className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/60 dark:text-emerald-100 font-bold text-xs uppercase tracking-wider">
 <TableRow>
 {columns.map((col, idx) => (
 <TableHead
 key={idx}
 className={`p-3 font-extrabold text-slate-800 dark:text-slate-100 ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
 >
 {col.header}
 </TableHead>
 ))}
 </TableRow>
 </TableHeader>
 <TableBody className="divide-y divide-emerald-100/80 bg-white dark:divide-emerald-900/40 dark:bg-[#111827]">
 {data.map((row, rIdx) => (
 <TableRow key={rIdx} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
 {columns.map((col, cIdx) => {
 const rawVal = row[col.accessor]
 const formatted = col.format ? col.format(rawVal, row) : (typeof rawVal === 'number' ? rawVal.toLocaleString('id-ID') : rawVal)

 return (
 <TableCell
 key={cIdx}
 className={`p-3 text-slate-700 dark:text-slate-300 font-medium ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
 >
 {formatted ?? '-'}
 </TableCell>
 )
 })}
 </TableRow>
 ))}

 {totalRow && (
 <TableRow className="bg-emerald-50/80 font-bold text-slate-900 dark:bg-emerald-950/40 dark:text-emerald-600 border-t-2 border-slate-600">
 {columns.map((col, cIdx) => {
 const rawVal = totalRow[col.accessor]
 const formatted = col.format ? col.format(rawVal, totalRow) : (typeof rawVal === 'number' ? rawVal.toLocaleString('id-ID') : rawVal)

 return (
 <TableCell
 key={cIdx}
 className={`p-3 font-bold ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
 >
 {formatted ?? '-'}
 </TableCell>
 )
 })}
 </TableRow>
 )}
 </TableBody>
 </TableRoot>
 </div>
 </CardContent>
 </Card>
 )
}

