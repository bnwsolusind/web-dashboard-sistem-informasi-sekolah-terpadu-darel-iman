import React from 'react'
import { cn } from '../../lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'

/**
 * AppCard - canonical card (surface konten standar).
 * Satu-satunya card wrapper yang dipakai seluruh halaman.
 *
 * variant:
 * - 'default' : kartu putih standar
 * - 'section' : kartu bagian halaman (dengan header + actions)
 */
export default function AppCard({
 variant = 'default',
 icon: Icon,
 title,
 description,
 actions,
 noPadding = false,
 className = '',
 contentClassName = '',
 id,
 children,
 ...props
}) {
  return (
    <Card id={id} className={cn('shadow-xs dark:bg-card-dark', className)} {...props}>
 {(title || actions || Icon) && (
 <CardHeader className="flex flex-row items-center justify-between gap-3 p-4 md:p-5">
 <div className="flex min-w-0 items-center gap-3">
 {Icon && (
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#059669]/10 text-[#059669] dark:bg-[#10B981]/20 dark:text-[#10B981]">
 <Icon className="h-5 w-5" />
 </div>
 )}
 <div className="min-w-0">
 {title && <CardTitle className={cn(variant === 'section' ? 'text-base font-semibold' : 'text-lg font-semibold')}>{title}</CardTitle>}
 {description && <CardDescription className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</CardDescription>}
 </div>
 </div>
 {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
 </CardHeader>
 )}
 <CardContent className="p-0">
 <div className={cn(!noPadding && 'p-4 md:p-5', noPadding && 'p-0', contentClassName)}>{children}</div>
 </CardContent>
 </Card>
 )
}

/**
 * SectionCard - alias semantic untuk AppCard bagian halaman.
 */
export function SectionCard(props) {
 return <AppCard {...props} variant="section" />
}
