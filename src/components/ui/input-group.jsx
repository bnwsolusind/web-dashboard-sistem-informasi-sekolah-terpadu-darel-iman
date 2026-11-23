import * as React from 'react'
import { cn } from '../../lib/utils'
import { Input } from './input'
import { TextArea } from './text-area'
import { Button } from './button'

export function InputGroup({ className, ...props }) {
 return (
 <div
 role="group"
 className={cn(
 'group flex w-full items-center rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-xl shadow-emerald-950/15 bg-white shadow-sm focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-emerald-500/20 dark:border-emerald-800/60 dark:bg-[#111827] transition-all',
 className
 )}
 {...props}
 />
 )
}

export function InputGroupInput({ className, ...props }) {
 return (
 <Input
 className={cn(
 'flex-1 border-none bg-transparent shadow-none focus:ring-0 focus:border-none rounded-none w-full min-w-0 px-3',
 className
 )}
 {...props}
 />
 )
}

export function InputGroupTextarea({ className, rows = 3, ...props }) {
 return (
 <TextArea
 rows={rows}
 className={cn(
 'flex-1 border-none bg-transparent shadow-none focus:ring-0 focus:border-none rounded-none w-full min-w-0 px-3 py-2',
 className
 )}
 {...props}
 />
 )
}

export function InputGroupAddon({ className, ...props }) {
 return (
 <div
 className={cn('flex items-center justify-center px-3 text-sm text-slate-500 shrink-0', className)}
 {...props}
 />
 )
}

export function InputGroupButton({ className, ...props }) {
 return <Button className={cn('rounded-none shrink-0', className)} {...props} />
}

export default {
 InputGroup,
 InputGroupInput,
 InputGroupTextarea,
 InputGroupAddon,
 InputGroupButton,
}
