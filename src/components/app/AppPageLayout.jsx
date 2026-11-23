import React from 'react'
import AppBreadcrumb from './AppBreadcrumb'

/**
 * AppPageLayout - canonical page wrapper.
 * Mengatur ruang vertikal + breadcrumb opsional + anak halaman.
 *
 * breadcrumb: array [{ label, to? }] | string. homeTo default '/dashboard'.
 */
export default function AppPageLayout({
 children,
 className = '',
 breadcrumb = null,
 breadcrumbLabel,
 hideBreadcrumb = false,
}) {
 const crumbs = (breadcrumb || (breadcrumbLabel ? [{ label: breadcrumbLabel }] : [])).map((crumb) =>
 typeof crumb === 'string' ? { label: crumb } : crumb
 )

 return (
 <div className={`space-y-6 pb-12 ${className}`}>
 {!hideBreadcrumb && <AppBreadcrumb items={crumbs} />}
 {children}
 </div>
 )
}
