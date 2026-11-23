import React from 'react'
import EmptyState from './EmptyState'
import ErrorState from './ErrorState'
import { Activity, Clock } from 'lucide-react'
import { Avatar, AvatarFallback } from '../ui/avatar'

const getRoleBadgeProps = (roleStr) => {
  const r = (roleStr || '').toLowerCase()
  if (r.includes('super') || r.includes('admin')) {
    return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/40'
  }
  if (r.includes('guru') || r.includes('pengajar') || r.includes('teacher') || r.includes('kepala') || r.includes('kepsek')) {
    return 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border-sky-200/60 dark:border-sky-800/40'
  }
  if (r.includes('musyrif') || r.includes('pembina') || r.includes('asrama')) {
    return 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border-teal-200/60 dark:border-teal-800/40'
  }
  if (r.includes('ortu') || r.includes('orang tua') || r.includes('wali')) {
    return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/40'
  }
  if (r.includes('siswa') || r.includes('santri')) {
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/40'
  }
  return 'bg-slate-100 text-slate-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-700/80/40'
}

export default function ActivityFeed({
  title = 'Aktivitas Terbaru',
  activities = [],
  loading = false,
  emptyMessage = 'Belum ada aktivitas tercatat.',
  error = null,
  onRetry
}) {
  return (
    <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex size-8.5 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
          <Activity className="size-4 text-white" strokeWidth={2.2} />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{title}</h3>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-14 w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-14 w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-14 w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
      ) : error ? (
        <ErrorState message={error} onRetry={onRetry} />
      ) : activities.length === 0 ? (
        <EmptyState title="Belum Ada Aktivitas" message={emptyMessage} />
      ) : (
        <div className="space-y-3">
          {activities.map((item, idx) => {
            const userName = item.user?.name || item.userName || item.name || item.author
            const userRole = item.user?.role || item.userRole || item.role
            const hasUser = Boolean(userName)

            if (hasUser) {
              return (
                <div
                  key={item.id || idx}
                  className="flex items-start gap-3 p-3 rounded-xl border border-emerald-200/70 dark:border-emerald-800/70 bg-slate-50/60 dark:bg-slate-900/40 hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 hover:border-emerald-400/50 transition-all duration-200 group"
                >
                  <Avatar className="size-9 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300 font-black text-xs shrink-0 shadow-sm group-hover:scale-105 transition-transform mt-0.5">
                    <AvatarFallback>
                      {(userName || 'U').substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p
                        className="w-full font-extrabold text-slate-800 dark:text-slate-100 text-xs truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors"
                        title={userName}
                      >
                        {userName}
                      </p>
                      {userRole && (
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-bold border shrink-0 ${getRoleBadgeProps(userRole)}`}
                        >
                          {userRole}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      {item.title || item.description || item.action}
                    </p>
                    {item.subtitle && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{item.subtitle}</p>
                    )}
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="size-3 text-slate-400" />
                      {item.time || item.created_at || 'Baru saja'}
                    </span>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={item.id || idx}
                className="relative pl-6 py-2 rounded-xl hover:bg-emerald-50/60 dark:hover:bg-emerald-950/40 transition-colors group"
              >
                <div className="absolute left-1.5 top-3.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-600 dark:bg-emerald-400 group-hover:scale-125 transition-transform shadow-xs" />
                <div className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                  {item.title || item.description || item.action}
                </div>
                {item.subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.subtitle}</p>}
                <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-1">
                  <Clock className="size-3 text-slate-400" />
                  {item.time || item.created_at || 'Baru saja'}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
