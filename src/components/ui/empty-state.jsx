import React from 'react'
import PropTypes from 'prop-types'
import { EmptyState as HeroEmptyState, Button as HeroButton } from '@heroui/react'
import { FaInbox } from 'react-icons/fa'
import { RefreshCcw } from 'lucide-react'

export function EmptyState({
 icon = <FaInbox className="text-4xl text-emerald-600/70" />,
 title = 'Belum Ada Data',
 description = 'Data yang Anda cari saat ini belum tersedia atau belum diinputkan ke sistem.',
 action,
 actionLabel,
 onAction,
}) {
 const isReset = typeof actionLabel === 'string' && actionLabel.toLowerCase().includes('reset')

 return (
 <HeroEmptyState className="flex flex-col items-center justify-center p-8 text-center rounded-xl border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/20 my-4 dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-emerald-100/80 text-emerald-700 shadow-xs dark:bg-emerald-900/60 dark:text-emerald-300">
 {icon}
 </div>
 <h4 className="text-base font-bold text-slate-800 dark:text-white leading-snug">{title}</h4>
 <p className="mt-1 text-xs text-slate-500 max-w-sm dark:text-slate-400">{description}</p>
 {action || (actionLabel && onAction && (
 <HeroButton
 size="sm"
 onPress={onAction}
 className={`mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-extrabold transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-2xs ${
 isReset
 ? 'bg-[#EDE9FE] text-[#7C3AED] hover:bg-[#DDD6FE] dark:bg-purple-950/60 dark:text-purple-300 dark:hover:bg-purple-900/80'
 : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500'
 }`}
 >
 {isReset && <RefreshCcw className="h-4 w-4" />}
 <span>{actionLabel}</span>
 </HeroButton>
 ))}
 </HeroEmptyState>
 )
}

EmptyState.propTypes = {
 icon: PropTypes.node,
 title: PropTypes.node,
 description: PropTypes.node,
 action: PropTypes.node,
 actionLabel: PropTypes.node,
 onAction: PropTypes.func,
}
