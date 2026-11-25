'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import AppModal from './AppModal'
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

  const modalVariant = type === 'delete' ? 'danger' : type === 'update' ? 'warning' : 'emerald'
  return (
    <AppModal
      isOpen={isOpen}
      onClose={() => !isLoading && handleClose()}
      title={finalTitle}
      badge={type === 'delete' ? 'Hapus Permanen' : type === 'update' ? 'Perubahan Data' : 'Konfirmasi'}
      icon={Icon}
      variant={modalVariant}
      maxWidth="max-w-md"
      zIndex={70}
      disableBackdropClose={isLoading}
      hideCloseButton={isLoading}
      bodyClassName="space-y-3"
      footer={
        <>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleClose}
            className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
          >
            <X className="size-4" strokeWidth={2} />
            <span>{cancelText}</span>
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleConfirm}
            className={`h-9.5 px-5 rounded-xl text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 shadow-md disabled:opacity-50 ${
              type === 'delete'
                ? 'bg-rose-600 hover:bg-rose-700 border-rose-600 shadow-rose-600/20'
                : type === 'update'
                  ? 'bg-amber-600 hover:bg-amber-700 border-amber-600 shadow-amber-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600 shadow-emerald-600/20'
            }`}
          >
            <span>{isLoading ? 'Memproses...' : finalConfirmText}</span>
          </button>
        </>
      }
    >
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

    </AppModal>
  )
}

export default CrudConfirmDialog
