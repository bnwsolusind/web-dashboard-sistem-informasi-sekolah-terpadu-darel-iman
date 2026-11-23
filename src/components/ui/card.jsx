import * as React from 'react'
import PropTypes from 'prop-types'
import { Card as HeroCard } from '@heroui/react'
import { cn } from '../../lib/utils'

export const Card = React.forwardRef(({ className, children, ...props }, ref) => (
  <HeroCard ref={ref} className={cn('relative overflow-hidden rounded-container border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-card-dark', className)} {...props}>
    {children}
  </HeroCard>
))
Card.displayName = 'Card'

export const CardHeader = React.forwardRef(({ className, children, ...props }, ref) => (
  <HeroCard.Header ref={ref} className={cn('flex flex-row items-center justify-between gap-3 p-4 md:p-5 border-b border-emerald-200/80 dark:border-emerald-800/60 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent', className)} {...props}>
    {children}
  </HeroCard.Header>
))
CardHeader.displayName = 'CardHeader'

export const CardTitle = React.forwardRef(({ className, children, ...props }, ref) => (
  <HeroCard.Title ref={ref} className={cn('text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight', className)} {...props}>
    {children}
  </HeroCard.Title>
))
CardTitle.displayName = 'CardTitle'

export const CardDescription = React.forwardRef(({ className, children, ...props }, ref) => (
  <HeroCard.Description ref={ref} className={cn('text-xs sm:text-sm font-normal text-slate-500 dark:text-slate-400 mt-0.5', className)} {...props}>
    {children}
  </HeroCard.Description>
))
CardDescription.displayName = 'CardDescription'

export const CardAction = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center gap-2', className)} {...props}>
    {children}
  </div>
))
CardAction.displayName = 'CardAction'

export const CardContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <HeroCard.Content ref={ref} className={cn('p-4 md:p-5 text-sm text-slate-700 dark:text-slate-200', className)} {...props}>
    {children}
  </HeroCard.Content>
))
CardContent.displayName = 'CardContent'

export const CardFooter = React.forwardRef(({ className, children, ...props }, ref) => (
  <HeroCard.Footer ref={ref} className={cn('flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/60 p-4 bg-gradient-to-r from-emerald-50/50 via-teal-50/30 to-emerald-50/50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900', className)} {...props}>
    {children}
  </HeroCard.Footer>
))
CardFooter.displayName = 'CardFooter'

Card.propTypes = { className: PropTypes.string, children: PropTypes.node }
CardHeader.propTypes = { className: PropTypes.string, children: PropTypes.node }
CardTitle.propTypes = { className: PropTypes.string, children: PropTypes.node }
CardDescription.propTypes = { className: PropTypes.string, children: PropTypes.node }
CardAction.propTypes = { className: PropTypes.string, children: PropTypes.node }
CardContent.propTypes = { className: PropTypes.string, children: PropTypes.node }
CardFooter.propTypes = { className: PropTypes.string, children: PropTypes.node }

export default Card
