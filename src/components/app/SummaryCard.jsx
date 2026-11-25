import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, X, CheckCircle2, Info, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'
import AppBadge from './AppBadge'
import AppSkeleton from './AppSkeleton'
import { Button } from '../ui/button'
import AppModal from './AppModal'

const toneMap = {
  emerald: {
    cardBg: 'rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-b from-[#E6F8F3] via-[#E6F8F3]/30 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-emerald-400',
    iconBg: '!bg-emerald-600 !text-white shadow-md border border-white/30 rounded-xl',
    titleColor: 'text-emerald-800 dark:text-emerald-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#D1FAE5] text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    subColor: 'text-emerald-700 dark:text-emerald-400 font-bold',
    ctaColor: 'text-emerald-700 dark:text-emerald-400 font-bold',
    divider: 'border-emerald-100 dark:border-emerald-900/60',
  },
  blue: {
    cardBg: 'rounded-[22px] border-2 border-sky-300 dark:border-sky-700/80 bg-gradient-to-b from-[#E0F2FE]/70 via-[#E0F2FE]/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-sky-400',
    iconBg: 'bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 text-white shadow-md shadow-sky-600/20 rounded-2xl',
    titleColor: 'text-sky-800 dark:text-sky-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    subColor: 'text-sky-700 dark:text-sky-400 font-bold',
    ctaColor: 'text-sky-700 dark:text-sky-400 font-bold',
    divider: 'border-sky-100 dark:border-sky-900/60',
  },
  sky: {
    cardBg: 'rounded-[22px] border-2 border-sky-300 dark:border-sky-700/80 bg-gradient-to-b from-[#E0F2FE]/70 via-[#E0F2FE]/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-sky-400',
    iconBg: 'bg-gradient-to-br from-sky-500 via-sky-600 to-blue-700 text-white shadow-md shadow-sky-600/20 rounded-2xl',
    titleColor: 'text-sky-800 dark:text-sky-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    subColor: 'text-sky-700 dark:text-sky-400 font-bold',
    ctaColor: 'text-sky-700 dark:text-sky-400 font-bold',
    divider: 'border-sky-100 dark:border-sky-900/60',
  },
  violet: {
    cardBg: 'rounded-[22px] border-2 border-purple-300 dark:border-purple-700/80 bg-gradient-to-b from-[#F3E8FF]/70 via-[#F3E8FF]/20 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-purple-400',
    iconBg: '!bg-purple-600 !text-white shadow-md border border-white/30 rounded-xl',
    titleColor: 'text-purple-800 dark:text-purple-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    subColor: 'text-purple-700 dark:text-purple-400 font-bold',
    ctaColor: 'text-purple-700 dark:text-purple-400 font-bold',
    divider: 'border-purple-100 dark:border-purple-900/60',
  },
  purple: {
    cardBg: 'rounded-[22px] border-2 border-purple-300 dark:border-purple-700/80 bg-gradient-to-b from-[#F3E8FF]/70 via-[#F3E8FF]/20 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-purple-400',
    iconBg: '!bg-purple-600 !text-white shadow-md border border-white/30 rounded-xl',
    titleColor: 'text-purple-800 dark:text-purple-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    subColor: 'text-purple-700 dark:text-purple-400 font-bold',
    ctaColor: 'text-purple-700 dark:text-purple-400 font-bold',
    divider: 'border-purple-100 dark:border-purple-900/60',
  },
  amber: {
    cardBg: 'rounded-[22px] border-2 border-amber-300 dark:border-amber-700/80 bg-gradient-to-b from-[#FEF3C7]/70 via-[#FEF3C7]/20 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-amber-400',
    iconBg: '!bg-amber-500 !text-white shadow-md border border-white/30 rounded-xl',
    titleColor: 'text-amber-800 dark:text-amber-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#FEF3C7] text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    subColor: 'text-amber-700 dark:text-amber-400 font-bold',
    ctaColor: 'text-amber-700 dark:text-amber-400 font-bold',
    divider: 'border-amber-100 dark:border-amber-900/60',
  },
  rose: {
    cardBg: 'rounded-[22px] border-2 border-rose-300 dark:border-rose-700/80 bg-gradient-to-b from-[#FFE4E6]/70 via-[#FFE4E6]/20 to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-rose-400',
    iconBg: '!bg-rose-500 !text-white shadow-md border border-white/30 rounded-xl',
    titleColor: 'text-rose-800 dark:text-rose-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#FFE4E6] text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    subColor: 'text-rose-700 dark:text-rose-400 font-bold',
    ctaColor: 'text-rose-700 dark:text-rose-400 font-bold',
    divider: 'border-rose-100 dark:border-rose-900/60',
  },
  indigo: {
    cardBg: 'rounded-[22px] border-2 border-indigo-300 dark:border-indigo-700/80 bg-gradient-to-b from-[#E0E7FF]/70 via-[#E0E7FF]/20 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-indigo-400',
    iconBg: '!bg-indigo-600 !text-white shadow-md border border-white/30 rounded-xl',
    titleColor: 'text-indigo-800 dark:text-indigo-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#E0E7FF] text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    subColor: 'text-indigo-700 dark:text-indigo-400 font-bold',
    ctaColor: 'text-indigo-700 dark:text-indigo-400 font-bold',
    divider: 'border-indigo-100 dark:border-indigo-900/60',
  },
  slate: {
    cardBg: 'rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80/80 bg-gradient-to-b from-slate-100/70 via-slate-50/30 to-white dark:from-slate-900/60 dark:via-slate-900 dark:to-slate-950 hover:border-slate-400',
    iconBg: '!bg-slate-600 !text-white shadow-md border border-white/30 rounded-xl',
    titleColor: 'text-slate-800 dark:text-slate-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-emerald-50 text-slate-800 dark:bg-emerald-950/40 dark:text-slate-200 border border-emerald-200/80 dark:border-emerald-700/80/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    subColor: 'text-slate-700 dark:text-slate-400 font-bold',
    ctaColor: 'text-slate-700 dark:text-slate-400 font-bold',
    divider: 'border-emerald-100/80 dark:border-emerald-800/60',
  },
  teal: {
    cardBg: 'rounded-[22px] border-2 border-teal-300 dark:border-teal-700/80 bg-gradient-to-b from-[#CCFBF1]/70 via-[#CCFBF1]/20 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-teal-400',
    iconBg: '!bg-teal-600 !text-white shadow-md border border-white/30 rounded-xl',
    titleColor: 'text-teal-800 dark:text-teal-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    subColor: 'text-teal-700 dark:text-teal-400 font-bold',
    ctaColor: 'text-teal-700 dark:text-teal-400 font-bold',
    divider: 'border-teal-100 dark:border-teal-900/60',
  },
  cyan: {
    cardBg: 'rounded-[22px] border-2 border-teal-300 dark:border-teal-700/80 bg-gradient-to-b from-[#CCFBF1]/70 via-[#CCFBF1]/20 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-teal-400',
    iconBg: '!bg-teal-600 !text-white shadow-md border border-white/30 rounded-xl',
    titleColor: 'text-teal-800 dark:text-teal-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs',
    subColor: 'text-teal-700 dark:text-teal-400 font-bold',
    ctaColor: 'text-teal-700 dark:text-teal-400 font-bold',
    divider: 'border-teal-100 dark:border-teal-900/60',
  },
}

/**
 * SummaryCard - Canonical summary card (used for unit, program, rombel summary).
 */
export default function SummaryCard({
  icon: Icon,
  title,
  value,
  description,
  badge,
  badgeVariant = 'info',
  onClick,
  loading = false,
  accent = true,
  colorScheme,
  ctaText,
  footerLabel,
  className = '',
  enableModal = true,
  modalTitle,
  modalData,
  modalContent,
  modalWidth,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  if (loading) {
    return <AppSkeleton variant="card" className={cn('summary-card h-[90px] rounded-xl', className)} />
  }

  const tone = colorScheme ? toneMap[colorScheme] || toneMap.emerald : (accent ? toneMap.emerald : null)
  const hasCustomClick = typeof onClick === 'function'
  const isClickable = hasCustomClick || enableModal !== false

  return (
    <>
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={(e) => {
        if (hasCustomClick) onClick(e)
        if (!e.defaultPrevented && (enableModal === true || (!hasCustomClick && enableModal !== false))) setIsModalOpen(true)
      }}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      className={cn(
        'summary-card group flex flex-col justify-between overflow-hidden rounded-[22px] border-2 p-4 sm:p-5 shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30',
        tone ? tone.cardBg : 'border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-[#1B2433]',
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default',
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-3">
          {Icon ? (
            <div
              className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-xl border border-white/30 shadow-md transition-colors',
                tone ? tone.iconBg : (accent ? '!bg-emerald-600 !text-white' : '!bg-slate-600 !text-white')
              )}
            >
              <Icon className="size-5 text-white" />
            </div>
          ) : <div />}
          <div className="flex flex-col items-end gap-0.5">
            <span className={cn('text-[10px] font-extrabold uppercase tracking-wider', tone ? tone.titleColor : 'text-slate-500 dark:text-slate-400')}>
              {title}
            </span>
            {badge && (
              <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs', tone ? tone.badgeBg : 'bg-emerald-50 text-slate-800 dark:bg-emerald-950/40 dark:text-slate-200')}>
                {badge}
              </span>
            )}
          </div>
        </div>
        <strong className={cn('text-3xl sm:text-4xl font-black tabular-nums tracking-tight block my-1', tone ? tone.valueColor : 'text-slate-900 dark:text-white')}>
          {value ?? '—'}
        </strong>
        {description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate block">
            {description}
          </p>
        )}
      </div>

      <div className={cn('flex items-center justify-between text-xs font-bold pt-2.5 mt-3 border-t', tone ? tone.divider : 'border-emerald-100/80 dark:border-emerald-800/60')}>
        <span className={cn('font-bold leading-tight truncate flex-1', tone ? tone.subColor : 'text-slate-700 dark:text-slate-400')}>
          {footerLabel || ctaText || description || 'Lihat Rincian'}
        </span>
        <span className={cn('inline-flex items-center gap-1 font-extrabold group-hover:translate-x-0.5 transition-transform', tone ? tone.ctaColor : 'text-emerald-700 dark:text-emerald-400')}>
          Detail &rarr;
        </span>
      </div>
    </motion.div>

    {/* POP UP DRILLDOWN MODAL HARMONIZED */}
      <AppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle || title}
        badge={badge || 'Terpadu'}
        description="Rincian Metrik & Integrasi Real-Time"
        icon={Icon || Info}
        maxWidth={modalWidth || (modalData && modalData.length > 5 ? 'max-w-2xl' : 'max-w-lg')}
        zIndex={80}
        bodyClassName="space-y-4 text-xs text-slate-700 dark:text-slate-200"
        footer={
          <div className="flex w-full justify-end">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="h-9.5 px-5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-black inline-flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer border border-slate-300 dark:border-slate-700"
            >
              <X className="size-4" strokeWidth={2} />
              <span>Tutup</span>
            </button>
          </div>
        }
      >
                <div className={cn("rounded-2xl border-2 p-4", tone ? tone.cardBg : "border-emerald-300 bg-emerald-50/20")}>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-bold uppercase tracking-wider", tone ? tone.titleColor : "text-emerald-800")}>
                      {title}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      Live Sync
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className={cn("text-3xl sm:text-4xl font-black tabular-nums tracking-tight", tone ? tone.valueColor : "text-slate-900")}>
                      {value ?? '—'}
                    </span>
                    {badge && (
                      <span className="text-xs text-slate-500 font-medium">({badge})</span>
                    )}
                  </div>
                  {description && (
                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {description}
                    </p>
                  )}
                </div>

                {modalContent ? (
                  <div className="mt-2">{modalContent}</div>
                ) : modalData && modalData.length > 0 ? (
                  <div className="rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 overflow-hidden">
                    <div className="bg-emerald-50/70 dark:bg-emerald-950/50 px-4 py-2.5 border-b border-emerald-200/80 dark:border-emerald-800/60 text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                      Breakdown Data
                    </div>
                    <div className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 max-h-48 overflow-y-auto">
                      {modalData.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between px-4 py-2.5 hover:bg-emerald-50/30">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
                          <span className="font-bold text-slate-900 dark:text-white tabular-nums">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20 p-3.5">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>Klasifikasi Metrik</span>
                        <span className="font-bold text-slate-900 dark:text-white">{badge || 'Utama'}</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>Sumber Integritas</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">Database Realtime</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <span>Sinkronisasi Data</span>
                        <span className="font-medium text-slate-500">Aktif Otomatis</span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-dashed border-emerald-300 dark:border-emerald-700/80 p-3 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed bg-white/50 dark:bg-slate-900/30">
                      Indikator ini dihitung langsung dari data terdaftar di sistem. Gunakan tombol di bawah jika ingin menerapkan filter atau melihat rincian lebih lanjut pada tabel data.
                    </div>
                  </div>
                )}
      </AppModal>
    </>
  )
}
