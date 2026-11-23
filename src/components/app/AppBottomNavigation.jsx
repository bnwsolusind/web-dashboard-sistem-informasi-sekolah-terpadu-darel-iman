import React from 'react'
import { NavLink } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { cn } from '../../lib/utils'

/**
 * AppBottomNavigation - canonical mobile bottom navigation.
 *
 * items: [{ to, label, icon, end?, show? }] — menu berbasis route (NavLink).
 * actionCenter: { icon, onClick, ariaLabel, show? } — tombol aksi tengah (FAB-style).
 * onOpenNotifications: fn — tombol notifikasi (bell) dengan unread badge.
 * unreadCount: jumlah notifikasi belum dibaca.
 * className: override wrapper.
 *
 * Visibility menu harus berasal dari permission/auth state pemanggil,
 * bukan dihardcode di sini.
 */
export default function AppBottomNavigation({
 items = [],
 actionCenter,
 onOpenNotifications,
 unreadCount = 0,
 className = '',
}) {
 return (
 <nav
 className={cn(
 'app-bottom-nav fixed bottom-0 inset-x-0 z-40 flex items-center justify-around border-t border-emerald-200/80 bg-white/95 px-2 py-2 shadow-lg backdrop-blur-md lg:hidden dark:border-emerald-800/60 dark:bg-slate-900/95 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))]',
 className
 )}
 >
 {items.map((item) => {
 if (item.show === false) return null
 return (
 <NavLink
 key={item.to + (item.label || '')}
 to={item.to}
 end={item.end}
 className={({ isActive }) =>
 cn(
 'flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition min-h-[44px] px-2 min-w-[44px]',
 isActive ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
 )
 }
 >
 {item.icon && <item.icon className="h-5 w-5" aria-hidden="true" />}
 <span className="truncate max-w-[76px] sm:max-w-[100px] text-center leading-tight tracking-tight" title={item.label}>{item.label}</span>
 </NavLink>
 )
 })}

 {actionCenter && actionCenter.show !== false && (
 <button
 type="button"
 onClick={actionCenter.onClick}
 aria-label={actionCenter.ariaLabel}
 className="flex h-9 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md active:scale-95 transition border border-emerald-200/80 dark:border-emerald-800/60 px-4 text-sm font-medium"
 >
 {actionCenter.icon && <actionCenter.icon className="h-5 w-5" aria-hidden="true" />}
 </button>
 )}

 {onOpenNotifications && (
 <button
 type="button"
 onClick={onOpenNotifications}
 className="relative flex flex-col items-center justify-center gap-1 text-[10px] font-semibold text-slate-400 min-h-[44px] px-2 min-w-[44px]"
 >
 <Bell className="h-5 w-5" aria-hidden="true" />
 {unreadCount > 0 && (
 <span className="absolute top-1 right-1/2 flex h-4 min-w-4 translate-x-3 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
 {unreadCount > 9 ? '9+' : unreadCount}
 </span>
 )}
 <span>Notifikasi</span>
 </button>
 )}
 </nav>
 )
}
