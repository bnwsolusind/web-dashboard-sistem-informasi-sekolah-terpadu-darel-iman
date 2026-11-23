import React from 'react'
import { Calendar, ShieldCheck, FileSpreadsheet } from 'lucide-react'
import { HeroUiHeader } from '../ui/HeroUiHeader'

export function ReportHeader({
  title,
  description,
  periodLabel,
  generatedAt,
}) {
  const formattedDate = generatedAt ? new Date(generatedAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) + ' WIB' : 'Baru saja'

  return (
    <HeroUiHeader
      icon={FileSpreadsheet}
      title={title}
      tag={{ text: 'Laporan Pengurus Yayasan • Read-Only', icon: ShieldCheck }}
      description={description}
      badge={{ text: periodLabel ? `Periode: ${periodLabel}` : `Diperbarui: ${formattedDate}`, icon: Calendar }}
      className="mb-6"
    />
  )
}
