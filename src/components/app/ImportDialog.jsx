import React from 'react'
import { FileInput } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

/**
 * ImportDialog - canonical dialog konfirmasi import.
 * Pesan bawaan: "Import akan menambahkan atau memperbarui data."
 */
export default function ImportDialog({ isOpen, onClose, onConfirm, title = 'Import Data?', isLoading = false }) {
 return (
 <ConfirmDialog
 isOpen={isOpen}
 onClose={onClose}
 onConfirm={onConfirm}
 title={title}
 action="import"
 confirmLabel="Import Sekarang"
 isLoading={isLoading}
 icon={FileInput}
 />
 )
}
