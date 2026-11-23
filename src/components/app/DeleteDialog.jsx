import React from 'react'
import ConfirmDialog from './ConfirmDialog'
import { Trash2 } from 'lucide-react'

/**
 * DeleteDialog - canonical dialog hapus.
 * Pesan bawaan: "Data yang dihapus tidak dapat dikembalikan."
 */
export default function DeleteDialog({
 isOpen,
 onClose,
 onConfirm,
 title = 'Hapus Data?',
 isLoading = false,
}) {
 return (
 <ConfirmDialog
 isOpen={isOpen}
 onClose={onClose}
 onConfirm={onConfirm}
 title={title}
 action="delete"
 confirmLabel="Hapus"
 isDanger
 isLoading={isLoading}
 icon={Trash2}
 />
 )
}

DeleteDialog.WARNING = 'Data yang dihapus tidak dapat dikembalikan.'
