import { useState } from 'react'
import { FiAlertTriangle, FiFileText, FiX, FiSend } from 'react-icons/fi'
import { deleteRequestService } from '../../services/deleteRequestService'
import { Input } from '@/components/ui/input'
import { TextArea } from '@/components/ui/text-area'
import { Button } from '@/components/ui/button'
import AppModal from '../app/AppModal'

export default function DeleteRequestModal({
 isOpen,
 onClose,
 targetTable,
 targetId,
 targetLabel,
 educationUnitId,
 onSuccess,
}) {
 const [reason, setReason] = useState('')
 const [attachmentPath, setAttachmentPath] = useState('')
 const [loading, setLoading] = useState(false)
 const [error, setError] = useState('')

 if (!isOpen) return null

 const handleSubmit = async (e) => {
 e.preventDefault()
 if (!reason.trim()) return
 setLoading(true)
 setError('')

 try {
 await deleteRequestService.submitDeleteRequest({
 target_table: targetTable,
 target_id: targetId,
 target_label: targetLabel || `${targetTable} #${targetId}`,
 reason: reason.trim(),
 attachment_path: attachmentPath.trim() || null,
 education_unit_id: educationUnitId || null,
 })

 if (onSuccess) onSuccess()
 onClose()
 } catch (err) {
 const msg = err?.response?.data?.message || 'Gagal mengajukan permintaan penghapusan.'
 setError(msg)
 } finally {
 setLoading(false)
 }
 }

  return (
    <AppModal
      isOpen={true}
      onClose={() => !loading && onClose()}
      title="Ajukan Permintaan Penghapusan"
      badge="Persetujuan Superadmin"
      description="Kirim permintaan penghapusan data ke Superadmin"
      icon={FiAlertTriangle}
      variant="warning"
      maxWidth="max-w-xl"
      zIndex={80}
      disableBackdropClose={loading}
      hideCloseButton={loading}
      footer={
        <>
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="h-9.5 px-4 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700 disabled:opacity-50"
          >
            <FiX className="w-4 h-4" />
            <span>Batal</span>
          </button>
          <button
            type="submit"
            form="delete-request-modal-form"
            disabled={loading || !reason.trim()}
            className="h-9.5 px-5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-black inline-flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer border-2 border-rose-600 shadow-md shadow-rose-600/20 disabled:opacity-50"
          >
            <FiSend className="w-3.5 h-3.5" />
            <span>{loading ? 'Mengirim...' : 'Kirim Permintaan'}</span>
          </button>
        </>
      }
    >
      <form id="delete-request-modal-form" onSubmit={handleSubmit} className="space-y-4">
 <div className="bg-amber-50 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl p-3.5 text-xs text-amber-900 leading-relaxed">
 <p className="font-bold mb-1">Ketentuan Penghapusan Data (Role Admin):</p>
 <p>
 Sebagai Admin, Anda tidak dapat menghapus data secara langsung. Form ini akan mengirimkan permintaan persetujuan kepada <span className="font-semibold text-amber-950">Superadmin</span>. Data target tetap aktif hingga disetujui.
 </p>
 </div>

 <div className="bg-slate-50 p-3 rounded-xl border border-emerald-200/80 text-xs">
 <span className="text-slate-500 block font-medium">Data Target yang Akan Dihapus:</span>
 <span className="font-bold text-slate-800 text-sm">{targetLabel || `${targetTable} #${targetId}`}</span>
 </div>

 {error && (
 <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium">
 {error}
 </div>
 )}

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
 Alasan Penghapusan <span className="text-red-500">*</span>
 </label>
 <TextArea
 rows={3}
 value={reason}
 onChange={(e) => setReason(e.target.value)}
 placeholder="Tuliskan alasan lengkap mengapa data ini perlu dihapus..."
 required
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
 URL Dokumen Pendukung (Opsional)
 </label>
 <Input
 type="text"
 size="sm"
 value={attachmentPath}
 onChange={(e) => setAttachmentPath(e.target.value)}
 placeholder="https://... / path dokumen bukti"
 />
 </div>

      </form>
    </AppModal>
  )
}
