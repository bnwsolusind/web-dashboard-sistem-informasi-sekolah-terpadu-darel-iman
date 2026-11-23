import * as React from 'react'
import PropTypes from 'prop-types'
import {
 Label as HeroLabel,
 Description as HeroDescription,
 FieldError as HeroFieldError,
} from '@heroui/react'
import { cn } from '../../lib/utils'

export function FieldLabel({ className, ...props }) {
 return (
 <HeroLabel
 className={cn('block text-xs font-bold text-slate-700 dark:text-slate-300 leading-none select-none mb-1.5', className)}
 {...props}
 />
 )
}

export function FieldDescription({ className, ...props }) {
 return (
 <HeroDescription
 className={cn('text-xs text-slate-500 dark:text-slate-400 mt-1', className)}
 {...props}
 />
 )
}

export function FieldError({ className, ...props }) {
 return (
 <HeroFieldError
 className={cn('text-xs font-semibold text-rose-500 dark:text-rose-400 mt-1', className)}
 {...props}
 />
 )
}

FieldLabel.propTypes = { className: PropTypes.string }
FieldDescription.propTypes = { className: PropTypes.string }
FieldError.propTypes = { className: PropTypes.string }
