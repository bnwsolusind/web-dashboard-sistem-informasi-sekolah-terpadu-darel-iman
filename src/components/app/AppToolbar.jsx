import React from 'react'

/**
 * AppToolbar - canonical toolbar (search + filter + aksi).
 * Susunan: [search (flex-1)] [filter] [actions]
 */
export default function AppToolbar({ search, filters, actions, children, stacked = false, className = '' }) {
 if (stacked) {
 return (
 <div className={`app-toolbar app-toolbar--stacked flex min-w-0 flex-col gap-3 ${className}`}>
 {search && <div className="app-toolbar__search w-full">{search}</div>}
 {filters && <div className="app-toolbar__filters w-full">{filters}</div>}
 {actions && <div className="app-toolbar__actions flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
 {children}
 </div>
 )
 }

 return (
 <div className={`app-toolbar flex min-w-0 flex-col gap-3 ${className}`}>
 <div className="app-toolbar__main flex min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
 {search && <div className="app-toolbar__search min-w-0 flex-1 lg:max-w-md">{search}</div>}
 {filters && <div className="app-toolbar__filters min-w-0 flex-1">{filters}</div>}
 </div>
 {actions && <div className="app-toolbar__actions flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
 {children}
 </div>
 )
}

