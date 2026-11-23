import React from 'react'
import PropTypes from 'prop-types'
import {
 Alert as HeroAlert,
} from '@heroui/react'
import {
 CheckCircle2,
 AlertTriangle,
 AlertCircle,
 Info,
 X,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const mapHeroStatus = (status, variant) => {
 const key = status || variant
 switch (key) {
 case 'primary':
 case 'success':
 return 'success'
 case 'warning':
 return 'warning'
 case 'error':
 case 'danger':
 case 'destructive':
 return 'danger'
 case 'info':
 return 'accent'
 case 'default':
 default:
 return 'default'
 }
}

const getDefaultIcon = (status) => {
 switch (status) {
 case 'success':
 return <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
 case 'warning':
 return <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
 case 'danger':
 return <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0" />
 case 'accent':
 return <Info className="h-5 w-5 text-sky-600 dark:text-sky-400 shrink-0" />
 default:
 return <Info className="h-5 w-5 text-slate-500 dark:text-slate-400 shrink-0" />
 }
}

export function Alert({
 variant = 'default',
 status,
 children,
 className,
 onClose,
 showIcon = true,
 icon: CustomIcon,
 ...props
}) {
 const resolvedStatus = mapHeroStatus(status, variant)

 return (
 <HeroAlert
 status={resolvedStatus}
 className={cn(
 'relative flex w-full items-start gap-3 rounded-xl p-4 text-sm transition-all duration-150',
 resolvedStatus === 'success' && 'border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/70 text-emerald-950 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-200',
 resolvedStatus === 'warning' && 'border border-emerald-200/80 dark:border-emerald-800/60 bg-amber-50/70 text-amber-950 dark:border-emerald-800/60 dark:bg-amber-950/30 dark:text-amber-200',
 resolvedStatus === 'danger' && 'border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/70 text-rose-950 dark:border-emerald-800/60 dark:bg-rose-950/30 dark:text-rose-200',
 resolvedStatus === 'accent' && 'border border-emerald-200/80 dark:border-emerald-800/60 bg-sky-50/70 text-sky-950 dark:border-emerald-800/60 dark:bg-sky-950/30 dark:text-sky-200',
 resolvedStatus === 'default' && 'border border-emerald-200/80 bg-slate-50/70 text-slate-900 dark:border-emerald-800/60 dark:bg-slate-900/40 dark:text-slate-100',
 className
 )}
 {...props}
 >
 {showIcon && (
 <HeroAlert.Indicator className="shrink-0 mt-0.5">
 {CustomIcon ? (
 React.isValidElement(CustomIcon) ? CustomIcon : <CustomIcon className="h-5 w-5 shrink-0" />
 ) : (
 getDefaultIcon(resolvedStatus)
 )}
 </HeroAlert.Indicator>
 )}
 <HeroAlert.Content className="flex-1 min-w-0 text-sm leading-relaxed">
 {children}
 </HeroAlert.Content>
 {onClose && (
 <button
 type="button"
 onClick={onClose}
 aria-label="Tutup notifikasi"
 className="ml-auto -mr-1 -mt-1 inline-flex size-7 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
 >
 <X className="h-4 w-4" />
 </button>
 )}
 </HeroAlert>
 )
}

Alert.propTypes = {
 variant: PropTypes.oneOf(['default', 'primary', 'info', 'success', 'warning', 'error', 'danger', 'destructive']),
 status: PropTypes.oneOf(['default', 'success', 'warning', 'error', 'info', 'danger', 'accent']),
 children: PropTypes.node,
 className: PropTypes.string,
 onClose: PropTypes.func,
 showIcon: PropTypes.bool,
 icon: PropTypes.oneOfType([PropTypes.element, PropTypes.elementType]),
}

export function AlertTitle({ className, children, ...props }) {
 return (
 <HeroAlert.Title className={cn('text-sm font-bold leading-tight mb-1', className)} {...props}>
 {children}
 </HeroAlert.Title>
 )
}

AlertTitle.propTypes = { className: PropTypes.string, children: PropTypes.node }

export function AlertDescription({ className, children, ...props }) {
 return (
 <HeroAlert.Description className={cn('text-xs text-slate-600 dark:text-slate-300 leading-normal', className)} {...props}>
 {children}
 </HeroAlert.Description>
 )
}

export function AlertContent({ className, children, ...props }) {
 return (
 <div className={cn('flex-1 min-w-0 text-sm leading-relaxed', className)} {...props}>
 {children}
 </div>
 )
}

export function AlertIndicator({ className, children, ...props }) {
 return (
 <div className={cn('shrink-0 mt-0.5', className)} {...props}>
 {children}
 </div>
 )
}

AlertDescription.propTypes = { className: PropTypes.string, children: PropTypes.node }
AlertContent.propTypes = { className: PropTypes.string, children: PropTypes.node }
AlertIndicator.propTypes = { className: PropTypes.string, children: PropTypes.node }

export function CRUDNotificationAlerts({ className = 'space-y-3' }) {
 return (
 <div className={className}>
 <Alert status="default">
 <span>Pemberitahuan Sistem: Harap periksa kembali kelengkapan formulir sebelum mengonfirmasi tindakan.</span>
 </Alert>
 <Alert status="success">
 <span>Perubahan Sukses! Data berhasil diperbarui dan tersimpan dengan benar di sistem.</span>
 </Alert>
 <Alert status="accent">
 <span>Penghapusan Sukses! Data telah berhasil dihapus dari sistem.</span>
 </Alert>
 <Alert status="success">
 <span>Penyimpanan Sukses! Data baru berhasil ditambahkan dan tersimpan di database.</span>
 </Alert>
 <Alert status="warning">
 <span>Penghapusan Gagal! Data tidak dapat dihapus karena masih terhubung dengan catatan lain.</span>
 </Alert>
 <Alert status="danger">
 <span>Penyimpanan / Perubahan Gagal! Terjadi kesalahan saat memproses data. Silakan coba lagi.</span>
 </Alert>
 </div>
 )
}

export default Alert
