import React from 'react'
import { RefreshCw } from 'lucide-react'
import { Alert, AlertIndicator, AlertContent, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export function ReportErrorState({ onRetry, error, title, description }) {
 const status = error?.response?.status || error?.status || (typeof error === 'number' ? error : null)
 const serverMessage = error?.response?.data?.message || error?.message || (typeof error === 'string' ? error : '')

 let computedTitle = title || 'Laporan Tidak Dapat Dimuat'
 let computedDesc = description || serverMessage || 'Terjadi kesalahan pengolahan data pada server. Silakan coba kembali beberapa saat lagi.'
 let alertStatus = 'error'

 if (status === 401) {
 computedTitle = title || 'Sesi Berakhir'
 computedDesc = description || 'Sesi autentikasi Anda telah berakhir. Silakan muat ulang atau masuk kembali.'
 alertStatus = 'warning'
 } else if (status === 403) {
 computedTitle = title || 'Akses Dibatasi'
 computedDesc = description || serverMessage || 'Anda tidak memiliki hak akses untuk melihat data laporan pada cakupan unit ini.'
 alertStatus = 'warning'
 } else if (status === 404) {
 computedTitle = title || 'Data / Endpoint Tidak Ditemukan'
 computedDesc = description || serverMessage || 'Data laporan atau endpoint yang diminta tidak ditemukan di server.'
 alertStatus = 'info'
 } else if (status === 422) {
 computedTitle = title || 'Parameter Filter Tidak Valid'
 computedDesc = description || serverMessage || 'Filter atau parameter laporan yang dikirimkan tidak sesuai format yang diharapkan.'
 alertStatus = 'warning'
 } else if (status === 500) {
 computedTitle = title || 'Kesalahan Server Internal'
 computedDesc = description || serverMessage || 'Terjadi kegagalan pemrosesan data internal pada server. Silakan hubungi administrator.'
 alertStatus = 'error'
 } else if (typeof navigator !== 'undefined' && !navigator.onLine || error?.code === 'ERR_NETWORK') {
 computedTitle = title || 'Koneksi Terputus'
 computedDesc = description || 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda lalu coba lagi.'
 alertStatus = 'error'
 }

 return (
 <div className="py-6">
 <Alert status={alertStatus}>
 <AlertIndicator />
 <AlertContent>
 <AlertTitle>{computedTitle}</AlertTitle>
 <AlertDescription>
 {computedDesc}
 </AlertDescription>
 {onRetry && (
 <div className="mt-4">
 <Button size="sm" variant={alertStatus === 'error' ? 'danger' : 'primary'} appearance="outline" onClick={onRetry} prefixIcon={<RefreshCw className="h-4 w-4" />}>
 Coba Lagi
 </Button>
 </div>
 )}
 </AlertContent>
 </Alert>
 </div>
 )
}
