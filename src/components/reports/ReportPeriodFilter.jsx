import React, { useState } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { Calendar, RotateCcw, Check, RefreshCw, Eye, Printer, FileText, FileSpreadsheet } from 'lucide-react'
import { motion } from 'framer-motion'
import { Alert, AlertIndicator, AlertContent, AlertDescription } from '@/components/ui/alert'
import { DatePicker } from '@/components/ui/date-picker'

export function ReportPeriodFilter({
  period = 'year',
  startDate = '',
  endDate = '',
  onChange,
  onReset,
  onRefresh,
  onOpenPreview,
  onPrint,
  onExportPdf,
  onExportExcel,
  loading = false,
}) {
  const [selectedPeriod, setSelectedPeriod] = useState(period)
  const [customStart, setCustomStart] = useState(startDate)
  const [customEnd, setCustomEnd] = useState(endDate)
  const [errorMsg, setErrorMsg] = useState('')

  const handleApply = () => {
    setErrorMsg('')
    if (selectedPeriod === 'custom') {
      if (!customStart || !customEnd) {
        setErrorMsg('Tanggal mulai dan selesai wajib diisi untuk periode kustom.')
        return
      }
      if (new Date(customEnd) < new Date(customStart)) {
        setErrorMsg('Tanggal selesai tidak boleh lebih kecil dari tanggal mulai.')
        return
      }
    }

    if (onChange) {
      onChange({
        period: selectedPeriod,
        tanggal_mulai: selectedPeriod === 'custom' ? customStart : '',
        tanggal_selesai: selectedPeriod === 'custom' ? customEnd : '',
      })
    }
  }

  const handleReset = () => {
    setSelectedPeriod('year')
    setCustomStart('')
    setCustomEnd('')
    setErrorMsg('')
    if (onReset) onReset()
  }

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-[#1B2433] print:hidden space-y-4">
      {/* Baris 1: Header Filter & Action Buttons (Refresh, Preview, Cetak, PDF, Excel) */}
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-4 dark:border-slate-800/80 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2.5 text-sm font-extrabold text-slate-900 dark:text-white">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <Calendar className="h-4 w-4" />
          </div>
          <span>Filter Periode & Aksi Laporan</span>
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/90 bg-slate-100/80 px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition-colors hover:border-slate-300 hover:bg-slate-200/90 hover:text-slate-900 disabled:opacity-50 dark:border-slate-700/80 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-700/90 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-slate-600 dark:text-slate-300 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </motion.button>

          {/* Preview Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={onOpenPreview}
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200/90 bg-sky-50 px-3 py-1.5 text-xs font-bold text-sky-700 shadow-2xs transition-colors hover:border-sky-300 hover:bg-sky-100 hover:text-sky-800 dark:border-sky-800/60 dark:bg-sky-950/40 dark:text-sky-300 dark:hover:bg-sky-900/60 cursor-pointer"
          >
            <Eye className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
            <span>Preview</span>
          </motion.button>

          {/* Cetak Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={onPrint}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-2xs transition-colors hover:border-emerald-400 hover:bg-emerald-100 hover:text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300 dark:hover:bg-emerald-900/60 cursor-pointer"
          >
            <Printer className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Cetak</span>
          </motion.button>

          {/* PDF Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={onExportPdf}
            className="inline-flex items-center gap-1.5 rounded-xl border border-teal-300 bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-700 shadow-2xs transition-colors hover:border-teal-400 hover:bg-teal-100 hover:text-teal-800 dark:border-teal-800/60 dark:bg-teal-950/40 dark:text-teal-300 dark:hover:bg-teal-900/60 cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            <span>PDF</span>
          </motion.button>

          {/* Excel Button */}
          <motion.button
            type="button"
            whileHover={{ scale: 1.04, y: -1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={onExportExcel}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600 bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/30 dark:bg-emerald-600 dark:hover:bg-emerald-500 cursor-pointer"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-white" />
            <span>Excel</span>
          </motion.button>
        </div>
      </div>

      {errorMsg && (
        <div>
          <Alert status="error">
            <AlertIndicator />
            <AlertContent>
              <AlertDescription className="text-xs font-semibold">{errorMsg}</AlertDescription>
            </AlertContent>
          </Alert>
        </div>
      )}

      {/* Baris 2: Selection Form + Terapkan Periode & Reset */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end justify-between">
        <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Pilihan Periode
            </label>
            <CustomSelect
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-600 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 cursor-pointer"
            >
              <option value="today">Hari Ini</option>
              <option value="week">Minggu Ini</option>
              <option value="month">Bulan Ini</option>
              <option value="last_month">Bulan Lalu</option>
              <option value="semester">Semester Aktif</option>
              <option value="academic_year">Tahun Ajaran Aktif</option>
              <option value="year">Tahun Ini (2026)</option>
              <option value="custom">Periode Kustom...</option>
            </CustomSelect>
          </div>

          {selectedPeriod === 'custom' && (
            <>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tanggal Mulai
                </label>
                <DatePicker
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  inputClassName="px-3 py-2 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="mb-1 block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Tanggal Selesai
                </label>
                <DatePicker
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  inputClassName="px-3 py-2 text-xs font-semibold"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <motion.button
            type="button"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={handleApply}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-700/20 transition-colors hover:bg-emerald-800 cursor-pointer dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Terapkan Periode</span>
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800 cursor-pointer dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </motion.button>
        </div>
      </div>
    </div>
  )
}
