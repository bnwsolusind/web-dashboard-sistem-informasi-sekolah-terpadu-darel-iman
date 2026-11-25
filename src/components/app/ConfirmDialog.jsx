import React from 'react'
import {
  Modal as HeroModal,
  Button as HeroButton,
  Spinner as HeroSpinner,
} from '@heroui/react'
import { AlertTriangle, CheckCircle2, Info, Trash2, X, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'
import AppModal from './AppModal'

const CONFIRM_QUESTIONS = {
  create: 'Apakah Anda yakin ingin menambahkan data baru ini ke dalam sistem?',
  update: 'Apakah Anda yakin ingin menyimpan perubahan pada data ini?',
  delete: 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini bersifat permanen dan data tidak dapat dikembalikan.',
  import: 'Import akan menambahkan atau memperbarui data.',
  export: 'Export data sesuai filter yang dipilih?',
  approve: 'Setujui data ini?',
  assign: 'Yakin menetapkan data ini?',
  custom: 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
}

/**
 * ConfirmDialog - canonical HeroUI Modal dialog konfirmasi.
 * WAJIB muncul sebelum seluruh aksi CRUD dijalankan.
 *
 * action: create | update | delete | import | export | approve | assign | custom
 * isDanger: mengubah tombol konfirmasi menjadi merah (destructive)
 */
export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Batal',
  isLoading = false,
  isDanger = false,
  action = 'custom',
  icon: IconProps,
}) {
  if (!isOpen) return null

  const isDelete = action === 'delete' || isDanger
  const question = message ?? CONFIRM_QUESTIONS[action] ?? CONFIRM_QUESTIONS.custom

  const defaultTitle = isDelete
    ? 'Konfirmasi Hapus Data'
    : action === 'create'
    ? 'Konfirmasi Simpan Data'
    : action === 'update'
    ? 'Konfirmasi Ubah Data'
    : 'Konfirmasi Tindakan'

  const finalTitle = title || defaultTitle
  const finalConfirmLabel = confirmLabel || (isDelete ? 'Ya, Hapus Permanen' : action === 'create' ? 'Simpan Data' : action === 'update' ? 'Simpan Perubahan' : 'Ya, Lanjutkan')

  const IconComponent = IconProps || (isDelete ? Trash2 : action === 'create' ? CheckCircle2 : action === 'update' ? Sparkles : Info)

  const handleOpenChange = (open) => {
    if (!open && onClose && !isLoading) onClose()
  }

  const handleConfirmAction = async (e) => {
    e?.preventDefault?.()
    if (isLoading) return
    if (onConfirm) {
      await onConfirm()
    }
  }

  const accentColor = isDelete ? 'rose' : action === 'update' ? 'amber' : 'emerald'

  const modalVariant = isDelete ? 'danger' : action === 'update' ? 'warning' : 'emerald'
  return (
    <AppModal
      isOpen={Boolean(isOpen)}
      onClose={() => !isLoading && onClose()}
      title={finalTitle}
      badge={isDelete ? 'Hapus Permanen' : action === 'update' ? 'Pembaruan Data' : 'Penyimpanan'}
      icon={IconComponent}
      variant={modalVariant}
      maxWidth="max-w-md"
      zIndex={80}
      disableBackdropClose={isLoading}
      hideCloseButton={isLoading}
      bodyClassName="space-y-4"
      footer={
        <>
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
          >
            <X className="size-4" strokeWidth={2} />
            <span>{cancelLabel}</span>
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={cn(
              'h-9.5 px-5 rounded-xl text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 shadow-md disabled:opacity-50',
              isDelete
                ? 'bg-rose-600 hover:bg-rose-700 border-rose-600 shadow-rose-600/20'
                : action === 'update'
                  ? 'bg-amber-600 hover:bg-amber-700 border-amber-600 shadow-amber-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 border-emerald-600 shadow-emerald-600/20'
            )}
          >
            <span>{isLoading ? 'Memproses...' : finalConfirmLabel}</span>
          </button>
        </>
      }
    >
              <div
                className={cn(
                  'rounded-2xl p-4 text-xs sm:text-sm font-medium leading-relaxed border',
                  accentColor === 'rose'
                    ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/70 text-rose-950 dark:bg-rose-950/30 dark:text-rose-200'
                    : accentColor === 'amber'
                    ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/70 text-amber-950 dark:bg-amber-950/30 dark:text-amber-200'
                    : 'border-emerald-200/80 dark:border-emerald-900/60 bg-emerald-50/70 text-emerald-950 dark:bg-emerald-950/30 dark:text-emerald-200'
                )}
              >
                {question}
              </div>
    </AppModal>
  )
}
