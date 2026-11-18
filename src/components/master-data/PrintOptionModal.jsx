import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Printer,
  Download,
  Users,
  Eye,
  Compass,
  CheckCircle2,
  Building,
  X,
  Sparkles,
  FileSpreadsheet,
  CheckSquare,
  Square,
  Layers,
  FileText,
} from 'lucide-react'
import { useUnitStore } from '../../stores/unitStore'
import { useAuthStore } from '../../stores/authStore'
import { resolveUnitDetails, isCentralOrYayasanRole } from '../../utils/printHelper'
import { PrintHeader } from '../common/PrintHeader'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../ui/select'

/**
 * @param {Object} props
 * @param {boolean} [props.isOpen]
 * @param {boolean} [props.open]
 * @param {() => void} [props.onClose]
 * @param {Function} [props.onPrint]
 * @param {Function} [props.onDownload]
 * @param {Function} [props.onDownloadPdf]
 * @param {Function} [props.onExportExcel]
 * @param {string} [props.title]
 * @param {string} [props.subtitle]
 * @param {Array<any>} [props.teachersList]
 * @param {string} [props.selectedTeacherId]
 * @param {Function} [props.onTeacherChange]
 * @param {any} [props.activeUnit]
 * @param {Array<any>} [props.columnsList]
 * @param {any} [props.selectedColumns]
 * @param {Function} [props.onToggleColumn]
 * @param {Function} [props.onSelectAllColumns]
 * @param {Function} [props.onClearAllColumns]
 * @param {boolean} [props.defaultPreview]
 * @param {Array<any>} [props.previewHeaders]
 * @param {Array<any>} [props.previewRows]
 * @param {Array<any>} [props.reportTypes]
 * @param {any} [props.selectedReportType]
 * @param {Function} [props.onReportTypeChange]
 * @param {any} [props.children]
 */
export function PrintOptionModal({
  isOpen = false,
  open = false,
  onClose = () => {},
  onPrint = undefined,
  onDownload = undefined,
  onDownloadPdf = undefined,
  onExportExcel = undefined,
  title = 'Laporan',
  subtitle = '',
  teachersList = [],
  selectedTeacherId = '',
  onTeacherChange = undefined,
  activeUnit = null,
  columnsList = [],
  selectedColumns = undefined,
  onToggleColumn = undefined,
  onSelectAllColumns = undefined,
  onClearAllColumns = undefined,
  defaultPreview = false,
  previewHeaders = undefined,
  previewRows = undefined,
  reportTypes = undefined,
  selectedReportType = undefined,
  onReportTypeChange = undefined,
  children = null,
}) {
  const isModalOpen = isOpen ?? open ?? false
  const [orientation, setOrientation] = useState('portrait')
  const [showPreview, setShowPreview] = useState(defaultPreview)

  useEffect(() => {
    if (isModalOpen) {
      setShowPreview(defaultPreview)
    }
  }, [isModalOpen, defaultPreview])
  const storeActiveUnit = useUnitStore((s) => s.activeUnit)
  const user = useAuthStore((s) => s.user)

  const isCentral = isCentralOrYayasanRole(user)
  const userUnit = user?.unit || user?.employee?.unit?.name || null
  const effectiveUnit =
    activeUnit !== undefined && activeUnit !== null
      ? activeUnit
      : isCentral
      ? 'semua'
      : userUnit || storeActiveUnit
  const currentUnit = resolveUnitDetails(effectiveUnit, user)

  if (!isModalOpen) return null

  return (
    <AnimatePresence>
      <div
        role="dialog"
        tabIndex={-1}
        aria-modal="true"
        aria-labelledby="print-option-modal-title"
        className="fixed inset-0 z-[80] flex items-start sm:items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose()
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={`font-sans w-full ${showPreview ? 'max-w-4xl' : 'max-w-xl'} my-auto`}
        >
          <div className="relative flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-[#182232]">
            {/* Top Accent Gradient Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-950 shrink-0">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm shrink-0">
                  <Printer className="h-4.5 w-4.5 text-white" strokeWidth={2.25} />
                </div>
                <div>
                  <h3
                    id="print-option-modal-title"
                    className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2"
                  >
                    <span>Opsi &amp; Scope Cetak {title}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60">
                      <Sparkles className="size-3" />
                      Cetak &amp; PDF
                    </span>
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Pilih orientasi kertas, cakupan data, dan tindakan ekspor dokumen resmi.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup modal"
                className="size-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 transition-all cursor-pointer shrink-0 active:scale-95"
              >
                <X className="size-4" strokeWidth={2.2} />
              </button>
            </div>

            {/* Body */}
            <div className="min-h-0 flex-1 overflow-y-auto p-6 space-y-4">
              {/* 1. Active Unit / Scope Badge */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                    {currentUnit.isUnitScope !== false && currentUnit.logoUrl ? (
                      <img
                        src={currentUnit.logoUrl}
                        alt={currentUnit.unitType}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <Building className="size-4.5 text-emerald-600 dark:text-emerald-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      {currentUnit.isUnitScope !== false ? 'Unit Header Cetak' : 'Lingkup Dokumen Cetak'}
                    </div>
                    <div className="text-xs font-black text-[#047857] dark:text-emerald-400 truncate">
                      {currentUnit.isUnitScope !== false
                        ? currentUnit.name
                        : `Kop Tingkat Pusat — ${currentUnit.name || 'Yayasan'}`}
                    </div>
                  </div>
                </div>
                <span className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-[#047857] dark:text-emerald-300 font-black text-[10px] tracking-wider uppercase border border-emerald-300/60">
                  {currentUnit.isUnitScope !== false ? currentUnit.unitType : 'PUSAT / YAYASAN'}
                </span>
              </div>

              {/* 1.5 Pilihan Format/Model Laporan (Jika Disediakan) */}
              {Array.isArray(reportTypes) && reportTypes.length > 0 && (
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <FileText className="size-3.5 text-emerald-600" />
                    <span>Pilihan Format / Model Dokumen</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {reportTypes.map((rt) => {
                      const isSelected = selectedReportType === rt.id
                      return (
                        <button
                          key={rt.id}
                          type="button"
                          onClick={() => onReportTypeChange && onReportTypeChange(rt.id)}
                          className={`flex items-start justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer text-left ${
                            isSelected
                              ? 'border-[#047857] bg-emerald-50/80 text-[#047857] dark:bg-emerald-950/50 dark:border-emerald-500 shadow-xs ring-1 ring-[#047857]/30'
                              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                          }`}
                        >
                          <div className="flex flex-col pr-2 min-w-0">
                            <span className="font-extrabold truncate">{rt.label}</span>
                            {rt.description && (
                              <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                                {rt.description}
                              </span>
                            )}
                          </div>
                          {isSelected && <CheckCircle2 className="size-4 text-[#047857] shrink-0 mt-0.5" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {children}

              {/* 2. Orientation Selector */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-200">
                  <Compass className="size-3.5 text-emerald-600" />
                  <span>Orientasi Kertas A4</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setOrientation('portrait')}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      orientation === 'portrait'
                        ? 'border-[#047857] bg-emerald-50/80 text-[#047857] dark:bg-emerald-950/50 dark:border-emerald-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-4 h-5 border-2 border-current rounded-xs shrink-0" />
                      <span>Portrait (Tegak)</span>
                    </div>
                    {orientation === 'portrait' && <CheckCircle2 className="size-4 text-[#047857]" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setOrientation('landscape')}
                    className={`flex items-center justify-between p-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      orientation === 'landscape'
                        ? 'border-[#047857] bg-emerald-50/80 text-[#047857] dark:bg-emerald-950/50 dark:border-emerald-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-4 border-2 border-current rounded-xs shrink-0" />
                      <span>Landscape (Melebar)</span>
                    </div>
                    {orientation === 'landscape' && <CheckCircle2 className="size-4 text-[#047857]" />}
                  </button>
                </div>
              </div>

              {/* 3. Kolom Checklist (Jika Tersedia) */}
              {Array.isArray(columnsList) && columnsList.length > 0 && selectedColumns && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/50 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      <Layers className="size-3.5 text-emerald-600" />
                      <span>Pilih Kolom yang Ditampilkan</span>
                    </label>
                    <div className="flex items-center gap-2 text-[11px]">
                      {onSelectAllColumns && (
                        <button
                          type="button"
                          onClick={onSelectAllColumns}
                          className="font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          Pilih Semua
                        </button>
                      )}
                      {onSelectAllColumns && onClearAllColumns && <span className="text-slate-300">•</span>}
                      {onClearAllColumns && (
                        <button
                          type="button"
                          onClick={onClearAllColumns}
                          className="font-bold text-slate-500 dark:text-slate-400 hover:underline cursor-pointer"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 max-h-36 overflow-y-auto pr-1">
                    {columnsList.map((col) => {
                      const isChecked = selectedColumns.includes(col.key)
                      return (
                        <button
                          key={col.key}
                          type="button"
                          onClick={() => onToggleColumn && onToggleColumn(col.key)}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-[11px] font-semibold transition-colors text-left cursor-pointer ${
                            isChecked
                              ? 'bg-white border-emerald-300 text-emerald-900 dark:bg-slate-800 dark:border-emerald-700 dark:text-emerald-200 shadow-2xs'
                              : 'bg-slate-50/80 border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800'
                          }`}
                        >
                          {isChecked ? (
                            <CheckSquare className="size-3.5 text-emerald-600 shrink-0" />
                          ) : (
                            <Square className="size-3.5 text-slate-400 shrink-0" />
                          )}
                          <span className="truncate">{col.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* 4. Filter Guru (Jika Tersedia) */}
              {Array.isArray(teachersList) && teachersList.length > 0 && (
                <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    <Users className="size-4 text-emerald-700 dark:text-emerald-400" />
                    <span>Filter Cetak Berdasarkan Guru Pengampu</span>
                  </label>
                  <Select
                    value={String(selectedTeacherId || '')}
                    onChange={(val) => onTeacherChange && onTeacherChange(String(val || ''))}
                  >
                    <SelectTrigger className="w-full h-10 px-3 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl dark:text-white shadow-2xs">
                      <SelectValue placeholder="-- Semua Guru (Cetak Seluruh Data) --" />
                    </SelectTrigger>
                    <SelectContent className="z-50 max-h-60 overflow-y-auto bg-white dark:bg-[#1B2433] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1">
                      <SelectItem id="" value="" className="text-xs font-medium py-1.5">
                        -- Semua Guru (Cetak Seluruh Data) --
                      </SelectItem>
                      {teachersList.map((g) => (
                        <SelectItem key={g.id} id={String(g.id)} value={String(g.id)} className="text-xs font-medium py-1.5">
                          {g.nama_lengkap} {g.niy ? `(NIY ${g.niy})` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* 5. Live Visual Header Preview Toggle */}
              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowPreview(!showPreview)}
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                >
                  <Eye className="size-3.5" />
                  <span>{showPreview ? 'Sembunyikan Pratinjau Dokumen' : 'Lihat Pratinjau Dokumen Resmi Cetak'}</span>
                </button>

                {showPreview && (
                  <div className="mt-2.5 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 shadow-inner max-h-72 overflow-y-auto">
                    <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 text-center tracking-wider">
                      — Pratinjau Format Dokumen Resmi A4 —
                    </div>
                    <PrintHeader
                      unit={currentUnit}
                      title={title}
                      subtitle={subtitle}
                      showDivider={true}
                      showTitle={true}
                      className="scale-95 origin-top"
                    />

                    {Array.isArray(previewHeaders) && previewHeaders.length > 0 && Array.isArray(previewRows) && previewRows.length > 0 && (
                      <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-[10px] text-left">
                          <thead className="bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 font-bold border-b border-emerald-100 dark:border-emerald-800/80">
                            <tr>
                              {previewHeaders.map((h, i) => (
                                <th key={i} className="px-2.5 py-1.5 whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {previewRows.slice(0, 5).map((row, rIdx) => (
                              <tr key={rIdx} className={rIdx % 2 === 1 ? 'bg-slate-50/60 dark:bg-slate-900/40' : ''}>
                                {row.map((cell, cIdx) => (
                                  <td key={cIdx} className="px-2.5 py-1 whitespace-nowrap text-slate-700 dark:text-slate-300">
                                    {String(cell ?? '-')}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {previewRows.length > 5 && (
                          <div className="px-2.5 py-1.5 bg-emerald-50/40 dark:bg-slate-900/80 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium italic text-center border-t border-emerald-100 dark:border-emerald-900/40">
                            * Menampilkan 5 sampel dari total {previewRows.length} baris data terfilter pada dokumen cetak
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Footer dengan Tombol Standar */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50 shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium inline-flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
              >
                <X className="size-4" strokeWidth={2} />
                <span>Batal</span>
              </button>

              <div className="flex flex-wrap items-center gap-2">
                {/* Opsi Ekspor Excel/CSV jika disediakan */}
                {onExportExcel && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onExportExcel(orientation)
                    }}
                    className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium inline-flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
                  >
                    <FileSpreadsheet className="size-4 text-emerald-600" strokeWidth={2} />
                    <span>Ekspor Excel</span>
                  </button>
                )}

                {/* Opsi Unduh PDF */}
                {(onDownload || onDownloadPdf) && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      const downloadAction = onDownload || onDownloadPdf
                      downloadAction && downloadAction(orientation)
                    }}
                    className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium inline-flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Download className="size-4" strokeWidth={2} />
                    <span>Unduh PDF</span>
                  </button>
                )}

                {/* Opsi Cetak Dokumen */}
                {onPrint && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      onPrint(orientation)
                    }}
                    className="h-9 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium inline-flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
                  >
                    <Printer className="size-4" strokeWidth={2} />
                    <span>Cetak Dokumen</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PrintOptionModal
