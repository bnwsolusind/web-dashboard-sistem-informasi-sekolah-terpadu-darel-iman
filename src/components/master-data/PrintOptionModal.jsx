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
import AppModal from '../app/AppModal'
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
  onClose = () => { },
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

  return (
    <AppModal
      isOpen={Boolean(isModalOpen)}
      onClose={onClose}
      title={`Opsi Cetak & Ekspor — ${title}`}
      badge="Cetak & PDF"
      description={subtitle || 'Pilih orientasi kertas, cakupan data, dan tindakan ekspor dokumen resmi.'}
      icon={Printer}
      maxWidth="max-w-2xl"
      zIndex={80}
      bodyClassName="space-y-4 text-xs text-slate-700 dark:text-slate-200"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-9.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center gap-1.5 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            <X className="size-4" strokeWidth={2} />
            <span>Batal</span>
          </button>
          <div className="flex flex-wrap items-center gap-2">
            {onExportExcel && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onExportExcel(orientation)
                }}
                className="h-9.5 px-4 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 dark:bg-slate-800 dark:text-emerald-300 text-xs font-black inline-flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="size-4 text-emerald-700 dark:text-emerald-400" strokeWidth={2} />
                <span>Ekspor Excel</span>
              </button>
            )}
            {(onDownload || onDownloadPdf) && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  const downloadAction = onDownload || onDownloadPdf
                  downloadAction && downloadAction(orientation)
                }}
                className="h-9.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black inline-flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-amber-600/20"
              >
                <Download className="size-4" strokeWidth={2} />
                <span>Unduh PDF</span>
              </button>
            )}
            {onPrint && (
              <button
                type="button"
                onClick={() => {
                  onClose()
                  onPrint(orientation)
                }}
                className="h-9.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-2 transition-all duration-200 active:scale-95 cursor-pointer shadow-md shadow-emerald-600/20"
              >
                <Printer className="size-4" strokeWidth={2} />
                <span>Cetak Dokumen</span>
              </button>
            )}
          </div>
        </div>
      }
    >
              {/* 1. Active Unit / Scope Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-emerald-200/80 dark:border-emerald-800/60">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-9 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 p-1 flex items-center justify-center shrink-0 shadow-2xs">
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
                <span className="shrink-0 px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-[#047857] dark:text-emerald-300 font-black text-[10px] tracking-wider uppercase border border-emerald-200/80 dark:border-emerald-800/60">
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
                          className={`flex items-start justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer text-left ${isSelected
                            ? 'border-[#047857] bg-emerald-50/80 text-[#047857] dark:bg-emerald-950/50 dark:border-emerald-800/60 shadow-xs ring-1 ring-[#047857]/30'
                            : 'border-emerald-200/80 dark:border-emerald-800/60 text-slate-600 dark:text-slate-300 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30'
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
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${orientation === 'portrait'
                      ? 'border-[#047857] bg-emerald-50/80 text-[#047857] dark:bg-emerald-950/50 dark:border-emerald-800/60 shadow-xs'
                      : 'border-emerald-200/80 dark:border-emerald-800/60 text-slate-600 dark:text-slate-300 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30'
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
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${orientation === 'landscape'
                      ? 'border-[#047857] bg-emerald-50/80 text-[#047857] dark:bg-emerald-950/50 dark:border-emerald-800/60 shadow-xs'
                      : 'border-emerald-200/80 dark:border-emerald-800/60 text-slate-600 dark:text-slate-300 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30'
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
                <div className="p-3.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                      <Layers className="size-3.5 text-emerald-600" />
                      <span>Pilih Kolom yang Ditampilkan</span>
                    </label>
                    <div className="flex items-center gap-2 text-xs">
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
                          className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition-colors text-left cursor-pointer ${isChecked
                            ? 'bg-white border-emerald-200/80 dark:border-emerald-800/60 text-emerald-900 dark:bg-slate-800 dark:border-emerald-800/60 dark:text-emerald-200 shadow-2xs'
                            : 'bg-slate-50/80 border-emerald-200/80 text-slate-500 dark:bg-slate-900 dark:border-emerald-800/60'
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
                <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 space-y-1">
                  <label className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-300">
                    <Users className="size-4 text-emerald-700 dark:text-emerald-400" />
                    <span>Filter Cetak Berdasarkan Guru Pengampu</span>
                  </label>
                  <Select
                    value={String(selectedTeacherId || '')}
                    onChange={(val) => onTeacherChange && onTeacherChange(String(val || ''))}
                  >
                    <SelectTrigger className="w-full h-10 px-3 text-xs font-semibold bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 rounded-xl dark:text-emerald-600 shadow-2xs">
                      <SelectValue placeholder="-- Semua Guru (Cetak Seluruh Data) --" />
                    </SelectTrigger>
                    <SelectContent className="z-50 max-h-60 overflow-y-auto bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl shadow-xl p-1">
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
                  className="w-full py-2 px-3 rounded-xl border border-dashed border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30 transition-colors cursor-pointer"
                >
                  <Eye className="size-3.5" />
                  <span>{showPreview ? 'Sembunyikan Pratinjau Dokumen' : 'Lihat Pratinjau Dokumen Resmi Cetak'}</span>
                </button>

                {showPreview && (
                  <div className="mt-2.5 p-4 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 bg-white dark:bg-slate-950 shadow-inner max-h-72 overflow-y-auto">
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
                      <div className="mt-3 overflow-x-auto rounded-xl border border-emerald-200/80 dark:border-emerald-800/60">
                        <table className="w-full text-[10px] text-left">
                          <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
                            <tr>
                              {previewHeaders.map((h, i) => (
                                <th key={i} className="px-2.5 py-1.5 whitespace-nowrap">{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
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
                          <div className="px-2.5 py-1.5 bg-emerald-50/40 dark:bg-slate-900/80 text-[10px] text-emerald-700 dark:text-emerald-400 font-medium italic text-center border-t border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60">
                            * Menampilkan 5 sampel dari total {previewRows.length} baris data terfilter pada dokumen cetak
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
    </AppModal>
  )
}

export default PrintOptionModal
