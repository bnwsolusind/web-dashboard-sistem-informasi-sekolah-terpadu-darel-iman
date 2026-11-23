import React from 'react'
import { AppErrorState } from '../app'

export default function ErrorState({
 title = 'Gagal Memuat Data',
 message = 'Terjadi kesalahan koneksi atau pengolahan data.',
 onRetry
}) {
 return (
 <AppErrorState title={title} description={message} onRetry={onRetry} />
 )
}
