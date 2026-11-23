'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 CheckCircle2,
 AlertTriangle,
 Trash2,
 Pencil,
 PlusCircle,
 X,
 Sparkles,
 RefreshCw,
 Info,
} from 'lucide-react'

/**
 * CrudConfirmDialog - Harmonized HeroUI UI Standard Confirmation Modal (z-[70])
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Is dialog open
 * @param {function} props.onOpenChange - Open state change handler
 * @param {function} props.onClose - Close handler
 * @param {'create'|'update'|'delete'|'custom'} props.type - Action type
 * @param {string} [props.title] - Modal title
 * @param {string} [props.description] - Modal description / details
 * @param {string} [props.entityName] - Highlighted entity name
 * @param {string} [props.entityDetails] - Sub-details text or code
 * @param {string} [props.notice] - Callout / warning notice
 * @param {string} [props.confirmText] - Confirm button label
 * @param {string} [props.cancelText] - Cancel button label
 * @param {function} props.onConfirm - Confirm callback
 * @param {boolean} [props.isLoading=false] - Loading state for confirm action
 */
export function CrudConfirmDialog({
 isOpen,
 onOpenChange,
 onClose,
 type = 'create',
 title,
 description,
 entityName,
 entityDetails,
 notice,
 confirmText,
 cancelText = 'Batal',
 onConfirm,
 isLoading = false,
}) {
 const handleClose = () => {
 if (isLoading) return
 if (onOpenChange) onOpenChange(false)
 if (onClose) onClose()
 }

 const handleConfirm = async (e) => {
 e?.preventDefault()
 if (isLoading) return
 if (onConfirm) {
 await onConfirm()
 }
 }

 if (!isOpen) return null

 // Defaults configuration
 let topBarGradient = 'from-emerald-500 via-teal-400 to-emerald-600'
 let borderColor = 'border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20'
 let iconBadgeBg = 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-600/25 border-0'
 let IconComponent = PlusCircle
 let tagLabel = 'Data Baru'
 let defaultTitle = 'Konfirmasi Simpan Data'
 let defaultDesc = 'Pastikan data yang Anda masukkan telah valid dan sesuai sebelum menyimpan ke sistem.'
 let defaultBtnText = 'Ya, Simpan Data'
 let confirmBtnBg = 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/25 border-0'

 if (type === 'update') {
 topBarGradient = 'from-amber-400 via-amber-500 to-orange-500'
 borderColor = 'border-2 border-amber-300 dark:border-amber-700/80 shadow-2xl shadow-amber-950/20'
 iconBadgeBg = 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-white shadow-md shadow-amber-600/25 border-0'
 IconComponent = Pencil
 tagLabel = 'Update Data'
 defaultTitle = 'Konfirmasi Pembaruan Data'
 defaultDesc = 'Apakah Anda yakin ingin menyimpan pembaruan data ini? Perubahan akan langsung diterapkan.'
 defaultBtnText = 'Ya, Perbarui Data'
 confirmBtnBg = 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/25 border-0'
 } else if (type === 'delete') {
 topBarGradient = 'from-rose-500 via-rose-600 to-red-700'
 borderColor = 'border-2 border-rose-300 dark:border-rose-700/80 shadow-2xl shadow-rose-950/20'
 iconBadgeBg = 'bg-gradient-to-br from-rose-500 via-rose-600 to-red-700 text-white shadow-md shadow-rose-600/25 border-0'
 IconComponent = Trash2
 tagLabel = 'Hapus Permanen'
 defaultTitle = 'Hapus Data Permanen?'
 defaultDesc = 'Tindakan ini tidak dapat dibatalkan. Seluruh data terkait akan dihapus secara permanen dari sistem.'
 defaultBtnText = 'Ya, Hapus Permanen'
 confirmBtnBg = 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/25 border-0'
 } else if (type === 'custom') {
 topBarGradient = 'from-blue-500 via-indigo-500 to-violet-600'
 iconBadgeBg = 'bg-white dark:bg-surface-dark-inner shadow-sm border-emerald-200/80 dark:border-emerald-800/60'
 IconComponent = Info
 tagLabel = 'Tindakan'
 defaultTitle = 'Konfirmasi Tindakan'
 defaultDesc = 'Apakah Anda yakin ingin melanjutkan tindakan ini?'
 defaultBtnText = 'Konfirmasi'
 confirmBtnBg = 'bg-white dark:bg-surface-dark-inner border-emerald-200/80 dark:border-emerald-800/60 shadow-sm'
 }

 const finalTitle = title || defaultTitle
 const finalDesc = description || defaultDesc
 const finalConfirmText = confirmText || defaultBtnText

 return (
 <AnimatePresence>
 <div
 role="dialog"
 tabIndex={-1}
 aria-modal="true"
 aria-labelledby="crud-confirm-title"
 className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
 onMouseDown={(e) => {
 if (e.target === e.currentTarget && !isLoading) handleClose()
 }}
 >
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 12 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
				className={`w-full max-w-md overflow-hidden rounded-3xl border-2 bg-white shadow-2xl shadow-emerald-950/20 ${borderColor} dark:bg-card-dark`}
 >
 {/* Top Accent Gradient Bar */}
				<div className={`h-1.5 w-full bg-gradient-to-r ${topBarGradient} shrink-0`} />
 <div className="p-6">
 {/* Header Icon + Titles */}
 <div className="flex items-center gap-3 mb-4">
 <div
 className={`flex size-11 shrink-0 items-center justify-center rounded-2xl shadow-md ${iconBadgeBg}`}
 >
 <IconComponent className="size-5 text-white" strokeWidth={2.2} />
 </div>
 <div className="min-w-0">
 <div className="flex items-center gap-2">
 <h4 id="crud-confirm-title" className="text-sm font-black text-slate-900 dark:text-white ">
 {finalTitle}
 </h4>
 <span
 className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
 type === 'delete'
 ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
 : type === 'update'
 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
 : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
 }`}
 >
 {type === 'delete' ? (
 <AlertTriangle className="size-2.5" />
 ) : (
 <Sparkles className="size-2.5" />
 )}
 {tagLabel}
 </span>
 </div>
 <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
 {type === 'delete'
 ? 'Konfirmasi tindakan destruktif'
 : type === 'update'
 ? 'Simpan perubahan data ke database'
 : 'Tambahkan data baru ke sistem'}
 </p>
 </div>
 </div>

 {/* Entity Details Card (Jika Ada) */}
 {entityName && (
 <div
 className={`rounded-xl border p-3.5 space-y-1 mb-3 ${
 type === 'delete'
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/50 dark:border-emerald-800/60 dark:bg-rose-950/20'
 : type === 'update'
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/50 dark:border-emerald-800/60 dark:bg-amber-950/20'
 : 'border-emerald-200/80 bg-slate-50/60 dark:border-emerald-800/60 dark:bg-slate-900/50'
 }`}
 >
 <p className="text-xs font-black text-slate-800 dark:text-slate-100 truncate">{entityName}</p>
 {entityDetails && (
 <p className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">
 {entityDetails}
 </p>
 )}
 </div>
 )}

 {/* Description */}
 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
 {finalDesc}
 </p>

 {/* Notice Callout (Jika Ada) */}
 {notice && (
 <div
 className={`mt-3 rounded-xl p-3 text-xs font-semibold flex items-start gap-2 border ${
 type === 'delete'
 ? 'bg-rose-50/80 text-rose-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-rose-950/40 dark:text-rose-300 dark:border-emerald-800/60'
 : 'bg-amber-50/80 text-amber-800 border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/40 dark:text-amber-300 dark:border-emerald-800/60'
 }`}
 >
 <AlertTriangle className="size-4 shrink-0 mt-0.5" />
 <span>{notice}</span>
 </div>
 )}

 {/* Footer Buttons */}
 <div className="mt-6 flex items-center justify-end gap-2.5">
 {type === 'delete' ? (
 <button
 type="button"
 disabled={isLoading}
 onClick={handleClose}
 className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xl shadow-emerald-950/15 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:border-emerald-700/80 dark:bg-slate-800 dark:text-slate-200 px-4 py-2.5 text-xs font-extrabold transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer disabled:opacity-50"
 >
 <div className="flex size-4.5 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
 <X className="size-3 text-current" strokeWidth={2.2} />
 </div>
 <span>{cancelText}</span>
 </button>
 ) : (
 <button
 type="button"
 disabled={isLoading}
 onClick={handleClose}
 className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 px-4 py-2.5 text-xs font-extrabold border border-emerald-200/80 dark:border-emerald-800/60 transition-all duration-200 hover:scale-[1.03] active:scale-95 cursor-pointer shadow-sm disabled:opacity-50"
 >
 <div className="flex size-4.5 items-center justify-center rounded-lg bg-white/20">
 <X className="size-3 text-rose-600" strokeWidth={2.2} />
 </div>
 <span>{cancelText}</span>
 </button>
 )}

 <button
 type="button"
 disabled={isLoading}
 onClick={handleConfirm}
 className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-extrabold border transition-all duration-200 hover:scale-[1.03] active:scale-95 shadow-md cursor-pointer disabled:opacity-50 ${confirmBtnBg}`}
 >
 {isLoading ? (
 <span className="size-4 animate-spin rounded-full border-2 border-emerald-200/80 border-t-transparent" />
 ) : (
 <div className="flex size-4.5 items-center justify-center rounded-lg bg-white/20">
 {type === 'delete' ? (
 <Trash2 className="size-3 text-rose-600" strokeWidth={2.2} />
 ) : (
 <CheckCircle2 className="size-3 text-amber-600" strokeWidth={2.2} />
 )}
 </div>
 )}
 <span>{isLoading ? 'Memproses...' : finalConfirmText}</span>
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 </AnimatePresence>
 )
}

export default CrudConfirmDialog
