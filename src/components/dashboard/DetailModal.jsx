import React from 'react'
import { AppButton, AppModal, AppSearch } from '../app'

export default function DetailModal({
 isOpen,
 onClose,
 title,
 subtitle,
 children,
 searchTerm,
 onSearchChange,
 searchPlaceholder = 'Cari data...'
}) {
 return (
 <AppModal
 isOpen={isOpen}
 onClose={onClose}
 title={title}
 description={subtitle}
 maxWidth="max-w-4xl"
 footer={(
 <AppButton type="button" variant="secondary" size="sm" onClick={onClose}>
 Tutup
 </AppButton>
 )}
 >
 {onSearchChange !== undefined && (
 <div className="mb-4 flex items-center gap-3">
 <AppSearch
 value={searchTerm || ''}
 onChange={(e) => onSearchChange(e.target.value)}
 placeholder={searchPlaceholder}
 size="sm"
 />
 </div>
 )}

 <div className="max-h-[60vh] overflow-y-auto">{children}</div>
 </AppModal>
 )
}
