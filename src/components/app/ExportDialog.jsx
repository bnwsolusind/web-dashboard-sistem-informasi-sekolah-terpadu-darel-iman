import React from 'react'
import { FileSpreadsheet } from 'lucide-react'
import ConfirmDialog from './ConfirmDialog'

/**
 * ExportDialog - canonical dialog konfirmasi export.
 * Pesan bawaan: "Export data sesuai filter yang dipilih?"
 */
export default function ExportDialog({ isOpen, onClose, onConfirm, title = 'Export Data?', format = 'CSV / Excel', isLoading = false }) {
 return (
 <ConfirmDialog
 isOpen={isOpen}
 onClose={onClose}
 onConfirm={onConfirm}
 title={title}
 action="export"
 confirmLabel={`Export ${format}`}
 isLoading={isLoading}
 icon={FileSpreadsheet}
 />
 )
}
