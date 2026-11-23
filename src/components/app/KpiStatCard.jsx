import * as React from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Info, ChevronRight, Database, ArrowUpRight, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'

const toneVariants = {
  emerald: {
    cardBg: 'border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-b from-[#E6F8F3] via-[#E6F8F3]/30 to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-emerald-500',
    iconBg: 'bg-emerald-600 text-white shadow-xs',
    titleColor: 'text-emerald-800 dark:text-emerald-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#D1FAE5] text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60',
    subColor: 'text-emerald-700 dark:text-emerald-400',
    ctaColor: 'text-emerald-700 dark:text-emerald-400',
    divider: 'border-emerald-100 dark:border-emerald-900/60',
  },
  slate: {
    cardBg: 'border-emerald-300 dark:border-emerald-700/80 bg-gradient-to-b from-slate-100/70 via-slate-50/30 to-white dark:from-slate-900/60 dark:via-slate-900 dark:to-slate-950 hover:border-emerald-500',
    iconBg: 'bg-emerald-700 text-white shadow-xs',
    titleColor: 'text-slate-800 dark:text-slate-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60',
    subColor: 'text-slate-700 dark:text-slate-400',
    ctaColor: 'text-slate-700 dark:text-slate-400',
    divider: 'border-emerald-100/80 dark:border-emerald-800/60',
  },
  amber: {
    cardBg: 'border-amber-300 dark:border-amber-700/80 bg-gradient-to-b from-[#FEF3C7]/70 via-[#FEF3C7]/20 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-amber-500',
    iconBg: 'bg-amber-500 text-white shadow-xs',
    titleColor: 'text-amber-800 dark:text-amber-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#FEF3C7] text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60',
    subColor: 'text-amber-700 dark:text-amber-400',
    ctaColor: 'text-amber-700 dark:text-amber-400',
    divider: 'border-amber-100 dark:border-amber-900/60',
  },
  rose: {
    cardBg: 'border-rose-300 dark:border-rose-700/80 bg-gradient-to-b from-[#FFE4E6]/70 via-[#FFE4E6]/20 to-white dark:from-rose-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-rose-500',
    iconBg: 'bg-rose-500 text-white shadow-xs',
    titleColor: 'text-rose-800 dark:text-rose-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#FFE4E6] text-rose-900 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/60',
    subColor: 'text-rose-700 dark:text-rose-400',
    ctaColor: 'text-rose-700 dark:text-rose-400',
    divider: 'border-rose-100 dark:border-rose-900/60',
  },
  sky: {
    cardBg: 'border-sky-300 dark:border-sky-700/80 bg-gradient-to-b from-[#E0F2FE]/70 via-[#E0F2FE]/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-sky-500',
    iconBg: 'bg-sky-600 text-white shadow-xs',
    titleColor: 'text-sky-800 dark:text-sky-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60',
    subColor: 'text-sky-700 dark:text-sky-400',
    ctaColor: 'text-sky-700 dark:text-sky-400',
    divider: 'border-sky-100 dark:border-sky-900/60',
  },
  blue: {
    cardBg: 'border-blue-300 dark:border-blue-700/80 bg-gradient-to-b from-[#E0F2FE]/70 via-[#E0F2FE]/20 to-white dark:from-sky-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-blue-500',
    iconBg: 'bg-sky-600 text-white shadow-xs',
    titleColor: 'text-sky-800 dark:text-sky-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#E0F2FE] text-sky-900 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200/80 dark:border-sky-800/60',
    subColor: 'text-sky-700 dark:text-sky-400',
    ctaColor: 'text-sky-700 dark:text-sky-400',
    divider: 'border-sky-100 dark:border-sky-900/60',
  },
  indigo: {
    cardBg: 'border-indigo-300 dark:border-indigo-700/80 bg-gradient-to-b from-[#E0E7FF]/70 via-[#E0E7FF]/20 to-white dark:from-indigo-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-indigo-500',
    iconBg: 'bg-indigo-600 text-white shadow-xs',
    titleColor: 'text-indigo-800 dark:text-indigo-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#E0E7FF] text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800/60',
    subColor: 'text-indigo-700 dark:text-indigo-400',
    ctaColor: 'text-indigo-700 dark:text-indigo-400',
    divider: 'border-indigo-100 dark:border-indigo-900/60',
  },
  violet: {
    cardBg: 'border-violet-300 dark:border-violet-700/80 bg-gradient-to-b from-[#F3E8FF]/70 via-[#F3E8FF]/20 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-violet-500',
    iconBg: 'bg-purple-600 text-white shadow-xs',
    titleColor: 'text-purple-800 dark:text-purple-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60',
    subColor: 'text-purple-700 dark:text-purple-400',
    ctaColor: 'text-purple-700 dark:text-purple-400',
    divider: 'border-purple-100 dark:border-purple-900/60',
  },
  purple: {
    cardBg: 'border-purple-300 dark:border-purple-700/80 bg-gradient-to-b from-[#F3E8FF]/70 via-[#F3E8FF]/20 to-white dark:from-purple-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-purple-500',
    iconBg: 'bg-purple-600 text-white shadow-xs',
    titleColor: 'text-purple-800 dark:text-purple-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#F3E8FF] text-purple-900 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/60',
    subColor: 'text-purple-700 dark:text-purple-400',
    ctaColor: 'text-purple-700 dark:text-purple-400',
    divider: 'border-purple-100 dark:border-purple-900/60',
  },
  teal: {
    cardBg: 'border-teal-300 dark:border-teal-700/80 bg-gradient-to-b from-[#CCFBF1]/70 via-[#CCFBF1]/20 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-teal-500',
    iconBg: 'bg-teal-600 text-white shadow-xs',
    titleColor: 'text-teal-800 dark:text-teal-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60',
    subColor: 'text-teal-700 dark:text-teal-400',
    ctaColor: 'text-teal-700 dark:text-teal-400',
    divider: 'border-teal-100 dark:border-teal-900/60',
  },
  cyan: {
    cardBg: 'border-cyan-300 dark:border-cyan-700/80 bg-gradient-to-b from-[#CCFBF1]/70 via-[#CCFBF1]/20 to-white dark:from-teal-950/40 dark:via-slate-900 dark:to-slate-950 hover:border-cyan-500',
    iconBg: 'bg-teal-600 text-white shadow-xs',
    titleColor: 'text-teal-800 dark:text-teal-300',
    valueColor: 'text-slate-900 dark:text-white',
    badgeBg: 'bg-[#CCFBF1] text-teal-900 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800/60',
    subColor: 'text-teal-700 dark:text-teal-400',
    ctaColor: 'text-teal-700 dark:text-teal-400',
    divider: 'border-teal-100 dark:border-teal-900/60',
  },
}
export function KpiStatCard({
  title,
  label,
  value,
  subtitle,
  description,
  subtext,
  icon: Icon,
  tone = 'emerald',
  variant,
  badge,
  tag,
  trend,
  trendText,
  footerAction,
  footerLabel,
  ctaText,
  className,
  onClick,
  card,
  active = false,
  isActive = false,
  enableModal = false,
  modalTitle,
  modalData,
  modalContent,
  modalWidth,
  ...props
}) {
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const effectiveTone = variant || tone || card?.tone || 'emerald'
  const currentTone = toneVariants[effectiveTone] || toneVariants.emerald
  const effectiveTitle = card?.title || title || label
  const effectiveSubtitle = card?.subtext || subtitle || description || subtext || (trendText ? `${trend ? trend + ' ' : ''}${trendText}` : '')
  const effectiveBadge = card?.badgeText || badge || tag
  const EffectiveIcon = card?.icon || Icon
  const effectiveValue = card?.formattedValue ?? card?.value ?? value ?? '0'
  const hasCustomClick = Boolean(onClick || card?.onClick)
  const isClickable = hasCustomClick || Boolean(enableModal)
  const handleClick = (e) => {
    if (hasCustomClick) {
      const fn = onClick || card?.onClick
      fn(e)
    } else if (enableModal) {
      setIsModalOpen(true)
    }
  }
  const isCardActive = active || isActive

  const leftFooterText = footerLabel || footerAction?.label || ctaText || card?.ctaText || card?.footerLabel || (isClickable ? 'Lihat Rincian' : (effectiveSubtitle || 'Statistik'))
  const rightFooterText = footerAction?.ctaText || 'Detail'

  return (
    <>
    <motion.article
      whileHover={isClickable ? { scale: 1.02, y: -2 } : undefined}
      whileTap={isClickable ? { scale: 0.98 } : undefined}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      data-slot="kpi-card"
      onClick={handleClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleClick?.(e)
              }
            }
          : undefined
      }
      className={cn(
        'group relative overflow-hidden rounded-[22px] border-2 p-4 sm:p-5 shadow-xs transition-all duration-200 flex flex-col justify-between h-full',
        currentTone.cardBg,
        isClickable ? 'cursor-pointer hover:shadow-md' : 'cursor-default',
        isCardActive && 'ring-2 ring-emerald-500 shadow-md',
        className
      )}
      {...props}
    >
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-3">
          {EffectiveIcon ? (
            <div className={cn('flex size-12 items-center justify-center rounded-2xl border border-white/30 shadow-md shrink-0', currentTone.iconBg)}>
              <EffectiveIcon className="size-5 text-white" />
            </div>
          ) : <div />}
          <div className="flex flex-col items-end gap-0.5">
            <span className={cn('text-[10px] font-extrabold uppercase tracking-wider', currentTone.titleColor)}>
              {effectiveTitle}
            </span>
            {effectiveBadge && (
              <span className={cn('inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold shadow-2xs', currentTone.badgeBg)}>
                {effectiveBadge}
              </span>
            )}
          </div>
        </div>
        <strong className={cn('text-3xl sm:text-4xl font-black tabular-nums tracking-tight block my-1', currentTone.valueColor)}>
          {typeof effectiveValue === 'number' ? effectiveValue.toLocaleString('id-ID') : effectiveValue}
        </strong>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium truncate block">
          {effectiveSubtitle || 'Lihat Rincian'}
        </p>
      </div>

      <div className={cn('flex items-center justify-between text-xs font-bold pt-2.5 mt-3 border-t', currentTone.divider)}>
        <span className={cn('truncate font-bold flex-1 pr-2', currentTone.subColor)}>
          {leftFooterText}
        </span>
        <span
          onClick={(e) => {
            if (footerAction?.onClick) {
              e.stopPropagation()
              footerAction.onClick(e)
            }
          }}
          className={cn(
            'inline-flex items-center gap-1 font-extrabold group-hover:translate-x-0.5 transition-transform shrink-0',
            currentTone.ctaColor,
            (isClickable || footerAction?.onClick) && 'cursor-pointer'
          )}
        >
          {rightFooterText} &rarr;
        </span>
      </div>
    </motion.article>

    {/* POP UP DRILLDOWN MODAL HARMONIZED */}
    <AnimatePresence>
      {isModalOpen && (
        <div
          className="overlay modal fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="kpi-modal-title"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false)
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className={cn(
              "modal-dialog font-sans my-auto w-full",
              modalWidth || (modalData && modalData.length > 5 ? "max-w-2xl" : "max-w-lg")
            )}
          >
            <div className="modal-content flex max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-modal border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-surface-dark-inner dark:shadow-black/60">
              {/* Top Accent Gradient Bar */}
              <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600 shrink-0" />

              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-emerald-200/80 bg-white px-5 sm:px-6 py-4 sm:py-5 shrink-0 dark:border-emerald-800/60 dark:bg-surface-dark-inner">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("flex size-11 items-center justify-center rounded-2xl shadow-md shrink-0 text-white", currentTone.iconBg)}>
                    {EffectiveIcon ? <EffectiveIcon className="size-5 text-white" /> : <Info className="size-5 text-white" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 id="kpi-modal-title" className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight truncate">
                        {modalTitle || effectiveTitle}
                      </h3>
                      {effectiveBadge ? (
                        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-2xs", currentTone.badgeBg)}>
                          <Sparkles className="size-3" /> {effectiveBadge}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100/90 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/60 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider shadow-2xs">
                          <Sparkles className="size-3" /> Terpadu
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
                      Rincian Metrik & Integrasi Real-Time
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="size-9 flex items-center justify-center rounded-xl bg-emerald-50 hover:bg-rose-50 hover:text-rose-600 text-slate-400 hover:border-rose-200 dark:bg-emerald-950/40 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-all cursor-pointer active:scale-95 border border-emerald-200/80 dark:border-emerald-800/60 shadow-2xs shrink-0"
                  aria-label="Tutup modal"
                >
                  <X className="size-4" strokeWidth={2.2} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs bg-white dark:bg-surface-dark-inner text-slate-700 dark:text-slate-200">
                {/* Metric Summary Hero */}
                <div className={cn("rounded-2xl border-2 p-4", currentTone.cardBg)}>
                  <div className="flex items-center justify-between">
                    <span className={cn("text-xs font-bold uppercase tracking-wider", currentTone.titleColor)}>
                      {effectiveTitle}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      Live Sync
                    </span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className={cn("text-3xl sm:text-4xl font-black tabular-nums tracking-tight", currentTone.valueColor)}>
                      {typeof effectiveValue === 'number' ? effectiveValue.toLocaleString('id-ID') : effectiveValue}
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

                {/* Custom content or list breakdown */}
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
                      Indikator ini dihitung langsung dari data terdaftar di sistem. Gunakan tombol di bawah jika ingin menerapkan filter atau melihat rincian lebih lanjut pada tabel data.
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="border-t border-emerald-200/80 dark:border-emerald-800/60 px-5 sm:px-6 py-4 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 flex items-center justify-end gap-2.5 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-xs font-bold border-emerald-300 dark:border-emerald-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
                >
                  Tutup
                </Button>
                {footerAction?.onClick && (
                  <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    onClick={(e) => {
                      setIsModalOpen(false)
                      footerAction.onClick(e)
                    }}
                    className="rounded-xl px-4 py-2 text-xs font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-md shadow-emerald-600/20 cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <span>{footerAction.label || 'Terapkan Aksi'}</span>
                    <ChevronRight className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
    </>
  )
}

export function ModernKpiCard({
  icon: Icon,
  title,
  label,
  value,
  subtitle,
  subtext,
  description,
  tag,
  badge,
  tone = 'emerald',
  variant,
  ctaText,
  onClick,
  active = false,
  isActive = false,
  className = '',
  trend,
  trendText,
  card,
  enableModal = false,
  ...props
}) {
  return (
    <KpiStatCard
      icon={Icon || card?.icon}
      title={card?.title || title || label}
      value={card?.formattedValue ?? card?.value ?? value}
      description={card?.subtext || subtitle || subtext || description || (trendText ? `${trend ? trend + ' ' : ''}${trendText}` : undefined)}
      badge={card?.badgeText || badge || tag}
      tone={variant || tone || card?.tone || 'emerald'}
      ctaText={ctaText || card?.ctaText || card?.footerLabel}
      onClick={onClick || card?.onClick}
      className={className}
      active={active || isActive}
      trend={trend}
      trendText={trendText}
      card={card}
      enableModal={enableModal}
      {...props}
    />
  )
}

KpiStatCard.propTypes = {
  title: PropTypes.node,
  label: PropTypes.node,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.node,
  description: PropTypes.node,
  subtext: PropTypes.node,
  icon: PropTypes.elementType,
  tone: PropTypes.oneOf(['emerald', 'slate', 'amber', 'rose', 'sky', 'indigo', 'blue', 'violet', 'purple', 'teal', 'cyan']),
  variant: PropTypes.string,
  badge: PropTypes.node,
  tag: PropTypes.node,
  trend: PropTypes.shape({
    label: PropTypes.node,
    positive: PropTypes.bool,
  }),
  footerAction: PropTypes.shape({
    label: PropTypes.node,
    onClick: PropTypes.func,
  }),
  ctaText: PropTypes.node,
  className: PropTypes.string,
  onClick: PropTypes.func,
}

/**
 * KpiStatGrid - Grid layout container for KpiStatCards.
 */
export function KpiStatGrid({ children, columns = 4, className, ...props }) {
  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-5',
  }[columns] || 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

  return (
    <div className={cn('grid gap-4', colClass, className)} {...props}>
      {children}
    </div>
  )
}

KpiStatGrid.propTypes = {
  children: PropTypes.node.isRequired,
  columns: PropTypes.oneOf([2, 3, 4, 5]),
  className: PropTypes.string,
}

export default KpiStatCard
