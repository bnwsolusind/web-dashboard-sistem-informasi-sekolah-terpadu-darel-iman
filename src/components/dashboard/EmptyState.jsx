import React from 'react'
import { FolderOpen } from 'lucide-react'
import { AppEmptyState } from '../app'

export default function EmptyState({
 title = 'Belum Ada Data',
 message = 'Tidak ada data yang dapat ditampilkan untuk kriteria atau periode ini.',
 action
}) {
 return (
 <AppEmptyState icon={<FolderOpen className="h-7 w-7" />} title={title} description={message} action={action} />
 )
}
