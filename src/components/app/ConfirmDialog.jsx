import React from 'react'
import {
  Modal as HeroModal,
  Button as HeroButton,
  Spinner as HeroSpinner,
} from '@heroui/react'
import { AlertTriangle, CheckCircle2, Info, Trash2, X, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

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
  const finalConfirmLabel = confirmLabel || (isDelete ? 'Ya, Hapus Data' : action === 'create' ? 'Simpan Data' : action === 'update' ? 'Simpan Perubahan' : 'Ya, Lanjutkan')

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

  return (
    <HeroModal
      isOpen={Boolean(isOpen)}
      onOpenChange={handleOpenChange}
    >
      <HeroModal.Backdrop className="bg-slate-950/70 backdrop-blur-md fixed inset-0 z-[80] flex items-start sm:items-center justify-center p-3 sm:p-5 overflow-y-auto">
        <HeroModal.Container className="w-full flex items-center justify-center min-h-full my-auto">
          <HeroModal.Dialog className="relative w-full max-w-md my-auto max-h-[calc(100dvh-1.5rem)] flex flex-col overflow-hidden rounded-xl bg-white shadow-xl dark:bg-[#1B2433] border border-slate-200 dark:border-slate-800">
            {/* Top Accent Gradient Line */}
            <div
              className={cn(
                'h-1.5 w-full bg-gradient-to-r',
                accentColor === 'rose'
                  ? 'from-rose-500 via-rose-600 to-red-700'
                  : accentColor === 'amber'
                  ? 'from-amber-400 via-amber-500 to-orange-600'
                  : 'from-emerald-500 via-teal-400 to-emerald-600'
              )}
            />

            <HeroModal.Header className="flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-[#1B2433]">
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    'flex size-9 items-center justify-center rounded-lg text-white shadow-sm',
                    accentColor === 'rose'
                      ? 'bg-rose-600'
                      : accentColor === 'amber'
                      ? 'bg-amber-600'
                      : 'bg-emerald-600'
                  )}
                >
                  <IconComponent className="size-4.5 text-white" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">
                    {finalTitle}
                  </h3>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold border mt-0.5',
                      accentColor === 'rose'
                        ? 'bg-rose-50 text-rose-700 border-rose-200/80 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800/80'
                        : accentColor === 'amber'
                        ? 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800/80'
                        : 'bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/80'
                    )}
                  >
                    {isDelete ? 'Hapus Permanen' : action === 'update' ? 'Pembaruan Data' : 'Penyimpanan'}
                  </span>
                </div>
              </div>

              <HeroButton
                isIconOnly
                size="sm"
                isDisabled={isLoading}
                onPress={onClose}
                aria-label="Tutup dialog"
                className="size-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                <X className="size-4" strokeWidth={2.2} />
              </HeroButton>
            </HeroModal.Header>

            <HeroModal.Body className="p-6 space-y-4">
              <div
                className={cn(
                  'rounded-lg p-3.5 text-sm font-medium leading-relaxed border',
                  accentColor === 'rose'
                    ? 'border-rose-200/80 bg-rose-50/70 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300'
                    : accentColor === 'amber'
                    ? 'border-amber-200/80 bg-amber-50/70 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300'
                    : 'border-emerald-200/80 bg-emerald-50/70 text-emerald-950 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200'
                )}
              >
                {question}
              </div>
            </HeroModal.Body>

            <HeroModal.Footer className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/50 px-6 py-4 dark:border-slate-800 dark:bg-slate-900/50">
              <HeroButton
                variant="outline"
                size="sm"
                isDisabled={isLoading}
                onPress={onClose}
                className="h-9 px-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 text-sm font-medium cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {cancelLabel}
              </HeroButton>
              <HeroButton
                size="sm"
                isDisabled={isLoading}
                onPress={handleConfirmAction}
                className={cn(
                  'h-9 px-4 inline-flex items-center gap-2 rounded-lg text-white text-sm font-medium transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 shadow-xs',
                  accentColor === 'rose'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : accentColor === 'amber'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                )}
              >
                {isLoading ? (
                  <>
                    <HeroSpinner size="sm" className="size-3.5 text-white" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <span>{finalConfirmLabel}</span>
                )}
              </HeroButton>
            </HeroModal.Footer>
          </HeroModal.Dialog>
        </HeroModal.Container>
      </HeroModal.Backdrop>
    </HeroModal>
  )
}


