import React from 'react'
import AppBadge, { getStatusVariant } from './AppBadge'

/**
 * AppStatus - Canonical status indicator component.
 * Menampilkan badge status dengan semantic styling terpadu dan indikator dot.
 * @param {Object} props
 * @param {string} props.status - Status string (e.g. 'aktif', 'hadir', 'pending', 'gagal')
 * @param {string} [props.label] - Label tampilan (opsional, default ke status yang diformat)
 * @param {boolean} [props.dot=true] - Menampilkan indikator dot warna
 * @param {string} [props.className]
 */
export default function AppStatus({
  status,
  label,
  dot = true,
  className = '',
  ...props
}) {
  const displayLabel =
    label ||
    String(status || '')
      .replace(/[_-]/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())

  return (
    <AppBadge status={status} dot={dot} className={className} {...props}>
      {displayLabel}
    </AppBadge>
  )
}

export { getStatusVariant }

