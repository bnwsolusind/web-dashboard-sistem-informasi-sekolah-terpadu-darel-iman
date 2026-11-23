import * as React from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { Card as HeroCard, Chip as HeroChip } from '@heroui/react'
import { ShieldCheck, Sparkles } from 'lucide-react'
import { cn } from '../../lib/utils'

const MotionHeroCard = motion.create(HeroCard)

const THEME_STYLES = {
  emerald: {
    container:
      '!border-2 !border-emerald-500/30 !bg-[#D5F2E3] shadow-md shadow-emerald-500/10 dark:!border-emerald-600/40 dark:!bg-[#112a22]',
    blobTop: 'hidden',
    blobBottom: 'hidden',
    iconBadge:
      'bg-emerald-600 text-white shadow-md border border-emerald-500/40 dark:border-emerald-600/50 dark:bg-emerald-600',
    roleTag:
      'bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50',
    actionBadge:
      'border border-emerald-300 dark:border-emerald-800 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    actionBadgeIcon: 'text-emerald-700 dark:text-emerald-400',
  },
  blue: {
    container:
      '!border-2 !border-sky-500/30 !bg-[#E0F2FE] shadow-md shadow-sky-500/10 dark:!border-sky-600/40 dark:!bg-[#0c2438]',
    blobTop: 'hidden',
    blobBottom: 'hidden',
    iconBadge:
      'bg-sky-600 text-white shadow-md border border-sky-500/40 dark:border-sky-600/50 dark:bg-sky-600',
    roleTag:
      'bg-sky-600 text-white shadow-xs border border-sky-500/40 dark:border-sky-600/50',
    actionBadge:
      'border border-sky-300/80 dark:border-sky-800 bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-200',
    actionBadgeIcon: 'text-sky-700 dark:text-sky-300',
  },
  rose: {
    container:
      '!border-2 !border-rose-500/30 !bg-[#FFE4E6] shadow-md shadow-rose-500/10 dark:!border-rose-600/40 dark:!bg-[#36111a]',
    blobTop: 'hidden',
    blobBottom: 'hidden',
    iconBadge:
      'bg-rose-600 text-white shadow-md border border-rose-500/40 dark:border-rose-600/50 dark:bg-rose-600',
    roleTag:
      'bg-rose-600 text-white shadow-xs border border-rose-500/40 dark:border-rose-600/50',
    actionBadge:
      'border border-rose-300/80 dark:border-rose-800 bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200',
    actionBadgeIcon: 'text-rose-700 dark:text-rose-300',
  },
  amber: {
    container:
      '!border-2 !border-amber-500/30 !bg-[#FEF3C7] shadow-md shadow-amber-500/10 dark:!border-amber-600/40 dark:!bg-[#36240d]',
    blobTop: 'hidden',
    blobBottom: 'hidden',
    iconBadge:
      'bg-amber-600 text-white shadow-md border border-amber-500/40 dark:border-amber-600/50 dark:bg-amber-600',
    roleTag:
      'bg-amber-600 text-white shadow-xs border border-amber-500/40 dark:border-amber-600/50',
    actionBadge:
      'border border-amber-300/80 dark:border-amber-800 bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200',
    actionBadgeIcon: 'text-amber-700 dark:text-amber-300',
  },
}

/**
 * Renders an icon from either a Component, an instantiated React element, or null
 */
function renderIcon(icon, className = 'size-6') {
  if (!icon) return null
  if (React.isValidElement(icon)) return icon
  if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null && icon.$$typeof)) {
    const IconComponent = icon
    return <IconComponent className={className} />
  }
  return null
}

/**
 * HeroUiHeader - Official Canonical Hero Header component built on HeroUI primitives.
 * Provides the signature emerald multi-tone gradient aesthetic, ambient glow blobs,
 * 3D squircle icon badge, HeroUI Chip role badges, and versatile action slots.
 */
export function HeroUiHeader({
  title,
  subtitle,
  description,
  icon,
  roleBadge,
  roleTag,
  tag,
  actionBadge,
  badge,
  actions,
  chips = [],
  theme = 'emerald',
  variants,
  className = '',
  printHidden = true,
  children,
  ...props
}) {
  const currentTheme = THEME_STYLES[theme] || THEME_STYLES.emerald
  const subtext = subtitle || description
  const primaryBadge = roleBadge || roleTag || tag
  const secondaryBadge = actionBadge || badge

  const CardComponent = variants ? MotionHeroCard : HeroCard
  const cardMotionProps = variants ? { variants } : {}

  return (
    <CardComponent
      className={cn(
        'relative overflow-hidden rounded-xl border p-5 sm:p-6 shadow-md',
        currentTheme.container,
        printHidden && 'print:hidden',
        className
      )}
      {...cardMotionProps}
      {...props}
    >
      {/* Dual Multi-Tone Ambient Glow Blobs */}
      <div
        className={cn(
          'pointer-events-none absolute -top-20 -right-20 h-56 w-56 rounded-full blur-3xl',
          currentTheme.blobTop
        )}
      />
      <div
        className={cn(
          'pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full blur-3xl',
          currentTheme.blobBottom
        )}
      />

      <div className="relative z-10 flex flex-col gap-3">
        {/* Top Header Row: Icon, Title & Role Tag on Left; Actions & Secondary Badge on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
          {/* Left: Icon Badge & Title Information */}
          <div className="flex items-center gap-3.5 sm:gap-4 min-w-0 flex-1">
            {icon && (
              <div
                className={cn(
                  'flex h-12 w-12 sm:size-14 shrink-0 items-center justify-center rounded-xl',
                  currentTheme.iconBadge
                )}
              >
                {renderIcon(icon, 'size-6 sm:size-7 text-white')}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                {title && (
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                    {title}
                  </h1>
                )}

                {/* Primary Role/Category Badge */}
                {primaryBadge && (
                  typeof primaryBadge === 'string' ? (
                    <HeroChip
                      color="success"
                      size="sm"
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold',
                        currentTheme.roleTag
                      )}
                    >
                      <ShieldCheck className="size-3.5 shrink-0" />
                      <span>{primaryBadge}</span>
                    </HeroChip>
                  ) : React.isValidElement(primaryBadge) ? (
                    primaryBadge
                  ) : typeof primaryBadge === 'object' && primaryBadge.text ? (
                    <HeroChip
                      color="success"
                      size="sm"
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-extrabold',
                        currentTheme.roleTag
                      )}
                    >
                      {renderIcon(primaryBadge.icon, 'size-3.5 shrink-0') || <ShieldCheck className="size-3.5 shrink-0" />}
                      <span>{primaryBadge.text}</span>
                    </HeroChip>
                  ) : null
                )}

                {/* Optional Extra Chips */}
                {Array.isArray(chips) &&
                  chips.map((chipItem, index) => {
                    if (typeof chipItem === 'string') {
                      return (
                        <HeroChip
                          key={index}
                          size="sm"
                          color="default"
                          className="rounded-full border border-emerald-300 dark:border-emerald-700 bg-white/70 text-xs font-bold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-200"
                        >
                          {chipItem}
                        </HeroChip>
                      )
                    }
                    if (React.isValidElement(chipItem)) {
                      return <React.Fragment key={index}>{chipItem}</React.Fragment>
                    }
                    if (chipItem && typeof chipItem === 'object') {
                      const iconNode = renderIcon(chipItem.icon, 'size-3 shrink-0')
                      return (
                        <HeroChip
                          key={index}
                          size="sm"
                          color={chipItem.color || 'success'}
                          className="inline-flex items-center gap-1 rounded-full text-xs font-bold"
                        >
                          {iconNode}
                          <span>{chipItem.label || chipItem.text}</span>
                        </HeroChip>
                      )
                    }
                    return null
                  })}
              </div>
            </div>
          </div>

          {/* Right: Actions or Secondary Highlight Badge */}
          {(actions || secondaryBadge) && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start sm:self-center">
              {secondaryBadge && (
                typeof secondaryBadge === 'string' ? (
                  <div
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-black shadow-2xs',
                      currentTheme.actionBadge
                    )}
                  >
                    <Sparkles className={cn('size-3.5', currentTheme.actionBadgeIcon)} />
                    <span>{secondaryBadge}</span>
                  </div>
                ) : React.isValidElement(secondaryBadge) ? (
                  secondaryBadge
                ) : typeof secondaryBadge === 'object' && secondaryBadge.text ? (
                  <div
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-black shadow-2xs',
                      currentTheme.actionBadge
                    )}
                  >
                    {renderIcon(secondaryBadge.icon, cn('size-3.5', currentTheme.actionBadgeIcon)) || (
                      <Sparkles className={cn('size-3.5', currentTheme.actionBadgeIcon)} />
                    )}
                    <span>{secondaryBadge.text}</span>
                  </div>
                ) : null
              )}

              {actions}
            </div>
          )}
        </div>

        {/* Bottom Full-Width Row: Subtext / Description spans horizontally across the card */}
        {subtext && (
          <p className="w-full text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed pt-1">
            {subtext}
          </p>
        )}
      </div>

      {children}
    </CardComponent>
  )
}

HeroUiHeader.propTypes = {
  title: PropTypes.node,
  subtitle: PropTypes.node,
  description: PropTypes.node,
  icon: PropTypes.oneOfType([PropTypes.elementType, PropTypes.element]),
  roleBadge: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object]),
  tag: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object]),
  actionBadge: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object]),
  badge: PropTypes.oneOfType([PropTypes.node, PropTypes.string, PropTypes.object]),
  actions: PropTypes.node,
  chips: PropTypes.array,
  theme: PropTypes.oneOf(['emerald', 'blue', 'rose', 'amber']),
  variants: PropTypes.object,
  className: PropTypes.string,
  printHidden: PropTypes.bool,
  children: PropTypes.node,
}

export default HeroUiHeader
