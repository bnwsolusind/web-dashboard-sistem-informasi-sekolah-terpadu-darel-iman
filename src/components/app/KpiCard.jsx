import React, { useState } from 'react'
import { ArrowUpRight, ArrowDownRight, Minus, AlertCircle, RefreshCw, X, CheckCircle2, Info, ChevronRight, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '../../lib/utils'
import AppSkeleton from './AppSkeleton'
import { Button } from '../ui/button'
import AppModal from './AppModal'

function Sparkline({ data = [], color = '#10B981', className = '' }) {
  if (!Array.isArray(data) || data.length < 2) return null
  const w = 96
  const h = 28
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const points = data
    .map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - 3 - ((v - min) / range) * (h - 6)).toFixed(1)}`)
    .join(' ')
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={cn('h-7 w-24', className)} aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const colorMap = {
  emerald: 'bg-[#059669] dark:bg-[#10B981]',
  blue: 'bg-sky-500 dark:bg-sky-400',
  violet: 'bg-violet-500 dark:bg-violet-400',
  amber: 'bg-amber-500 dark:bg-amber-400',
  rose: 'bg-rose-500 dark:bg-rose-400',
  indigo: 'bg-indigo-500 dark:bg-indigo-400',
  slate: 'bg-emerald-700 text-white',
}

const bgMap = {
  emerald: 'bg-[#059669]/10 dark:bg-[#10B981]/10',
  blue: 'bg-sky-100 dark:bg-sky-900/30',
  violet: 'bg-violet-100 dark:bg-violet-900/30',
  amber: 'bg-amber-100 dark:bg-amber-900/30',
  rose: 'bg-rose-100 dark:bg-rose-900/30',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/30',
  slate: 'bg-slate-100 dark:bg-slate-800',
}

const toneMap = {
  emerald: {
    cardBg: 'rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-b from-[#E6F8F3] via-[#E6F8F3]/30 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-emerald-400',
    iconBg: 'bg-emerald-600 text-white shadow-xs',
    titleColor: 'text-emerald-800 dark:text-emerald-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#D1FAE5] text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60',
    subColor: 'text-emerald-700 dark:text-emerald-400',
    ctaColor: 'text-emerald-700 dark:text-emerald-400',
    divider: 'border-emerald-100 dark:border-emerald-900/60',
  },
  blue: {
    cardBg: 'rounded-[22px] border-2 border-sky-300 dark:border-sky-700/80 bg-gradient-to-b from-[#E0F2FE]/70 via-[#E0F2FE]/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-sky-400',
    iconBg: 'bg-sky-600 text-white shadow-xs',
    titleColor: 'text-sky-800 dark:text-sky-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60',
    subColor: 'text-sky-700 dark:text-sky-400',
    ctaColor: 'text-sky-700 dark:text-sky-400',
    divider: 'border-sky-100 dark:border-sky-900/60',
  },
  sky: {
    cardBg: 'rounded-[22px] border-2 border-sky-300 dark:border-sky-700/80 bg-gradient-to-b from-[#E0F2FE]/70 via-[#E0F2FE]/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-sky-400',
    iconBg: 'bg-sky-600 text-white shadow-xs',
    titleColor: 'text-sky-800 dark:text-sky-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60',
    subColor: 'text-sky-700 dark:text-sky-400',
    ctaColor: 'text-sky-700 dark:text-sky-400',
    divider: 'border-sky-100 dark:border-sky-900/60',
  },
  cyan: {
    cardBg: 'rounded-[22px] border-2 border-teal-300 dark:border-teal-700/80 bg-gradient-to-b from-[#CCFBF1]/70 via-[#CCFBF1]/20 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-teal-400',
    iconBg: 'bg-teal-600 text-white shadow-xs',
    titleColor: 'text-teal-800 dark:text-teal-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60',
    subColor: 'text-teal-700 dark:text-teal-400',
    ctaColor: 'text-teal-700 dark:text-teal-400',
    divider: 'border-teal-100 dark:border-teal-900/60',
  },
  violet: {
    cardBg: 'rounded-[22px] border-2 border-purple-300 dark:border-purple-700/80 bg-gradient-to-b from-[#F3E8FF]/70 via-[#F3E8FF]/20 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-purple-400',
    iconBg: 'bg-purple-600 text-white shadow-xs',
    titleColor: 'text-purple-800 dark:text-purple-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60',
    subColor: 'text-purple-700 dark:text-purple-400',
    ctaColor: 'text-purple-700 dark:text-purple-400',
    divider: 'border-purple-100 dark:border-purple-900/60',
  },
  purple: {
    cardBg: 'rounded-[22px] border-2 border-purple-300 dark:border-purple-700/80 bg-gradient-to-b from-[#F3E8FF]/70 via-[#F3E8FF]/20 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-purple-400',
    iconBg: 'bg-purple-600 text-white shadow-xs',
    titleColor: 'text-purple-800 dark:text-purple-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60',
    subColor: 'text-purple-700 dark:text-purple-400',
    ctaColor: 'text-purple-700 dark:text-purple-400',
    divider: 'border-purple-100 dark:border-purple-900/60',
  },
  amber: {
    cardBg: 'rounded-[22px] border-2 border-amber-300 dark:border-amber-700/80 bg-gradient-to-b from-[#FEF3C7]/70 via-[#FEF3C7]/20 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-amber-400',
    iconBg: 'bg-amber-500 text-white shadow-xs',
    titleColor: 'text-amber-800 dark:text-amber-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#FEF3C7] text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60',
    subColor: 'text-amber-700 dark:text-amber-400',
    ctaColor: 'text-amber-700 dark:text-amber-400',
    divider: 'border-amber-100 dark:border-amber-900/60',
  },
  rose: {
    cardBg: 'rounded-[22px] border-2 border-rose-300 dark:border-rose-700/80 bg-gradient-to-b from-[#FFE4E6]/70 via-[#FFE4E6]/20 to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-rose-400',
    iconBg: 'bg-rose-500 text-white shadow-xs',
    titleColor: 'text-rose-800 dark:text-rose-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#FFE4E6] text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60',
    subColor: 'text-rose-700 dark:text-rose-400',
    ctaColor: 'text-rose-700 dark:text-rose-400',
    divider: 'border-rose-100 dark:border-rose-900/60',
  },
  indigo: {
    cardBg: 'rounded-[22px] border-2 border-indigo-300 dark:border-indigo-700/80 bg-gradient-to-b from-[#E0E7FF]/70 via-[#E0E7FF]/20 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-indigo-400',
    iconBg: 'bg-indigo-600 text-white shadow-xs',
    titleColor: 'text-indigo-800 dark:text-indigo-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#E0E7FF] text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60',
    subColor: 'text-indigo-700 dark:text-indigo-400',
    ctaColor: 'text-indigo-700 dark:text-indigo-400',
    divider: 'border-indigo-100 dark:border-indigo-900/60',
  },
  slate: {
    cardBg: 'rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80/80 bg-gradient-to-b from-slate-100/70 via-slate-50/30 to-white dark:from-slate-900/60 dark:via-slate-900 dark:to-slate-950 hover:border-slate-400',
    iconBg: 'bg-emerald-700 text-white shadow-xs',
    titleColor: 'text-slate-800 dark:text-slate-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60',
    subColor: 'text-slate-700 dark:text-slate-400',
    ctaColor: 'text-slate-700 dark:text-slate-400',
    divider: 'border-emerald-100/80 dark:border-emerald-800/60',
  },
  teal: {
    cardBg: 'rounded-[22px] border-2 border-teal-300 dark:border-teal-700/80 bg-gradient-to-b from-[#CCFBF1]/70 via-[#CCFBF1]/20 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-teal-400',
    iconBg: 'bg-teal-600 text-white shadow-xs',
    titleColor: 'text-teal-800 dark:text-teal-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60',
    subColor: 'text-teal-700 dark:text-teal-400',
    ctaColor: 'text-teal-700 dark:text-teal-400',
    divider: 'border-teal-100 dark:border-teal-900/60',
  },
}
export default function KpiCard({
  title,
  label,
  value,
  icon: Icon,
  trend,
  trendType = 'up',
  trendText,
  badge,
  tag,
  badgeVariant = 'success',
  sparkline,
  onClick,
  colorScheme = 'emerald',
  tone: propTone,
  subtitle,
  subtext,
  description,
  ctaText,
  footerAction,
  loading = false,
  isError = false,
  errorMessage,
  onRetry,
  empty = false,
  className = '',
  progress,
  progressColorScheme,
  enableModal = true,
  modalTitle,
  modalData,
  modalContent,
  modalWidth,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const effectiveColorScheme = propTone || colorScheme || 'emerald'
  const progressColor = progressColorScheme ? (colorMap[progressColorScheme] || colorMap.emerald) : (colorMap[effectiveColorScheme] || colorMap.emerald)
  const clampedProgress = progress !== undefined && progress !== null ? Math.max(0, Math.min(100, Number(progress))) : null

  if (loading) {
    return <AppSkeleton variant="card" className={cn('h-[140px] rounded-xl', className)} />
  }

  if (isError) {
    return (
      <div className={cn('flex flex-col justify-between rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xl shadow-emerald-950/15 bg-rose-50/50 p-4 dark:border-emerald-800/60 dark:bg-rose-950/20', className)}>
        <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="text-xs font-bold truncate">{title || label || 'Gagal memuat KPI'}</span>
        </div>
        <p className="mt-1 text-xs text-slate-500 line-clamp-1">{errorMessage || 'Data tidak dapat diambil'}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2.5 inline-flex items-center gap-1 text-xs font-bold text-rose-700 hover:underline dark:text-rose-300"
          >
            <RefreshCw className="h-3 w-3" />
            Coba Lagi
          </button>
        )}
      </div>
    )
  }

  const hasCustomClick = typeof onClick === 'function'
  const isClickable = hasCustomClick || enableModal !== false
  const tone = toneMap[effectiveColorScheme] || toneMap.emerald
  const effectiveTitle = title || label || ''
  const effectiveSubtitle = subtitle || subtext || description
  const effectiveBadge = badge || tag

  const TrendIcon = trendType === 'down' ? ArrowDownRight : trendType === 'neutral' ? Minus : ArrowUpRight
  const trendColor = trendType === 'down' ? 'text-rose-600 dark:text-rose-400' : trendType === 'neutral' ? 'text-slate-600 dark:text-slate-400' : 'text-emerald-700 dark:text-emerald-400'

  const displayValue = empty || value === undefined || value === null ? '—' : value

  return (
    <>
    <div
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
                onClick(e)
              }
            }
          : undefined
      }
      title={isClickable ? 'Klik untuk melihat detail KPI' : undefined}
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-[22px] border-2 p-4 sm:p-5 shadow-xs transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/30',
        tone.cardBg,
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default',
        className
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-3">
          {Icon ? (
            <div className={cn('flex size-11 items-center justify-center rounded-full shadow-xs shrink-0', tone.iconBg)}>
              <Icon className="size-5 text-white" />
            </div>
          ) : <div />}
          <div className="flex flex-col items-end gap-0.5">
            <span className={cn('text-[10px] font-extrabold uppercase tracking-wider', tone.titleColor)}>
              {effectiveTitle}
            </span>
            {effectiveBadge && (
              <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs', tone.badgeBg)}>
                {effectiveBadge}
              </span>
            )}
          </div>
        </div>
        <strong className={cn('text-3xl sm:text-4xl font-black tabular-nums tracking-tight block my-1', tone.valueColor)}>
          {displayValue}
        </strong>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate block">
          {effectiveSubtitle || (trend ? (trendText || 'vs periode sebelumnya') : 'Lihat Rincian')}
        </p>
      </div>

      {clampedProgress !== null && (
        <div className="mt-2 pt-2 border-t border-emerald-200/80 dark:border-emerald-800/80">
          <div className="h-1.5 w-full rounded-full overflow-hidden bg-white/60 dark:bg-slate-800">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${clampedProgress}%`, backgroundColor: progressColor }}
            />
          </div>
          <p className="mt-1 text-[10px] font-bold text-right" style={{ color: progressColor }}>
            {clampedProgress}% progress
          </p>
        </div>
      )}

      <div className={cn('flex items-center justify-between text-xs font-bold pt-2.5 mt-3 border-t', tone.divider)}>
        <span className={cn('truncate font-bold flex-1', tone.subColor)}>
          {effectiveSubtitle || (trend ? (trendText || 'vs periode sebelumnya') : 'Lihat Rincian')}
        </span>
        {trend !== undefined && trend !== null ? (
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <span className={cn('inline-flex items-center gap-0.5 font-extrabold', trendColor)}>
              <TrendIcon className="size-3.5" />
              {trend}
            </span>
            {sparkline && <Sparkline data={sparkline} className="h-5 w-12 shrink-0 ml-1" />}
          </div>
        ) : (
          <span
            onClick={(e) => {
              if (footerAction?.onClick) {
                e.stopPropagation()
                footerAction.onClick(e)
              }
            }}
            className={cn('inline-flex items-center gap-1 font-extrabold group-hover:translate-x-0.5 transition-transform shrink-0', tone.ctaColor, footerAction?.onClick && 'cursor-pointer')}
          >
            {footerAction?.label || ctaText || 'Detail'} &rarr;
          </span>
        )}
      </div>
    </div>

    {/* POP UP DRILLDOWN MODAL HARMONIZED */}
      <AppModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle || effectiveTitle}
        badge={effectiveBadge || 'Terpadu'}
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
                <div className={cn("rounded-2xl border-2 p-4", tone.cardBg)}>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-bold uppercase tracking-wider", tone.titleColor)}>
                      {effectiveTitle}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      Live Sync
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className={cn("text-3xl sm:text-4xl font-black tabular-nums tracking-tight", tone.valueColor)}>
                      {displayValue}
                    </span>
                    {effectiveBadge && (
                      <span className="text-xs text-slate-500 font-medium">({effectiveBadge})</span>
                    )}
                  </div>
                  {effectiveSubtitle && (
                    <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300 font-medium">
                      {effectiveSubtitle}
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
                        <span className="font-bold text-slate-900 dark:text-white">{effectiveBadge || 'Utama'}</span>
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
                      Indikator ini dihitung langsung dari database aktif. Anda dapat melihat pratinjau maupun menerapkan filter melalui tombol di bawah.
                    </div>
                  </div>
                )}
      </AppModal>
    </>
  )
}
