import React from 'react'
import { cn } from '../../lib/utils'
import {
 DropdownMenu,
 DropdownMenuContent,
 DropdownMenuItem,
 DropdownMenuSeparator,
 DropdownMenuTrigger,
} from '../ui/dropdown'
import {
 Eye,
 MoreVertical as MenuMeatballs1,
 Pencil as Pencil1,
 Trash2 as Trash1,
 Clock as ClockThree,
} from 'lucide-react'
import { Tooltip } from '../ui/tooltip'
import { useAuthStore } from '../../stores/authStore'
import { hasAnyRole, getUserRoleLevel, ROLE_LEVELS } from '../../auth/portalResolver'

/**
 * ActionDropdown - Canonical action menu for table rows and card items based on HeroUI DropdownMenu.
 */
export default function ActionDropdown({
 onView,
 onEdit,
 onDelete,
 onHistory,
 viewPermission,
 editPermission,
 deletePermission,
 historyPermission,
 extraItems = [],
 customActions = [],
 trigger,
}) {
 const user = useAuthStore((state) => state.user)
 const roles = user?.roles || (user?.role ? [user.role] : [])
 const permissions = user?.permissions || []
 const isSuperAdmin = getUserRoleLevel(user) === ROLE_LEVELS.SUPER_ADMIN // Level 1

 const checkPerm = (requiredPerm) => {
 if (!requiredPerm || isSuperAdmin) return true
 if (Array.isArray(requiredPerm)) {
 return requiredPerm.some((p) => permissions.includes(p))
 }
 return permissions.includes(requiredPerm)
 }

 const canView = onView && checkPerm(viewPermission)
 const canEdit = onEdit && checkPerm(editPermission)
 const canHistory = onHistory && checkPerm(historyPermission)
 const rawExtras = extraItems.length > 0 ? extraItems : customActions
 const filteredExtraItems = rawExtras.filter(
 (item) => !item.permission || checkPerm(item.permission)
 )
 const canDelete = onDelete && checkPerm(deletePermission)

 const exec = (fn) => {
 if (typeof fn === 'function') {
 setTimeout(() => {
 fn()
 }, 10)
 }
 }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Menu Aksi"
        className="flex size-8 items-center justify-center rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
      >
        <Tooltip content="Menu Aksi">
          <span className="flex items-center justify-center size-full">
            {trigger || <MenuMeatballs1 className="size-4 text-white" />}
          </span>
        </Tooltip>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-52 p-1 border-0 border-none shadow-none space-y-1 bg-transparent">
        {canView && (
          <DropdownMenuItem
            onAction={() => exec(onView)}
            className="group cursor-pointer font-bold text-xs text-slate-700 hover:bg-sky-50/80 hover:text-sky-900 dark:text-slate-200 dark:hover:bg-sky-950/50 dark:hover:text-sky-300 px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 transition-colors"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 border border-sky-200/90 dark:bg-sky-950/60 dark:border-sky-800/80 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition-transform shadow-2xs">
              <Eye className="size-3.5" strokeWidth={2.2} />
            </span>
            <span className="font-bold text-xs">Lihat Data</span>
          </DropdownMenuItem>
        )}
        {canEdit && (
          <DropdownMenuItem
            onAction={() => exec(onEdit)}
            className="group cursor-pointer font-bold text-xs text-slate-700 hover:bg-amber-50/80 hover:text-amber-900 dark:text-slate-200 dark:hover:bg-amber-950/50 dark:hover:text-amber-300 px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 transition-colors"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 border border-amber-200/90 dark:bg-amber-950/60 dark:border-amber-800/80 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform shadow-2xs">
              <Pencil1 className="size-3.5" strokeWidth={2.2} />
            </span>
            <span className="font-bold text-xs">Edit Data</span>
          </DropdownMenuItem>
        )}
        {canHistory && (
          <DropdownMenuItem
            onAction={() => exec(onHistory)}
            className="group cursor-pointer font-bold text-xs text-slate-700 hover:bg-indigo-50/80 hover:text-indigo-900 dark:text-slate-200 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300 px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 transition-colors"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-50 border border-indigo-200/90 dark:bg-indigo-950/60 dark:border-indigo-800/80 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform shadow-2xs">
              <ClockThree className="size-3.5" strokeWidth={2.2} />
            </span>
            <span className="font-bold text-xs">Riwayat</span>
          </DropdownMenuItem>
        )}
        {filteredExtraItems.map((item, idx) => {
          const isDanger = item.isDanger || item.danger
          const labelLower = (item.label || "").toLowerCase()

          let badgeBg = "bg-teal-50 border-teal-200/90 text-teal-600 dark:bg-teal-950/60 dark:border-teal-800/80 dark:text-teal-400"
          let hoverClass = "hover:bg-emerald-50/80 hover:text-emerald-900 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300"

          if (isDanger) {
            badgeBg = "bg-rose-50 border-rose-200/90 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800/80 dark:text-rose-400"
            hoverClass = "hover:bg-rose-50/80 hover:text-rose-900 dark:hover:bg-rose-950/50 dark:hover:text-rose-300"
          } else if (labelLower.includes("chat") || labelLower.includes("pesan") || labelLower.includes("wa") || labelLower.includes("kontak")) {
            badgeBg = "bg-emerald-50 border-emerald-200/90 text-emerald-600 dark:bg-emerald-950/60 dark:border-emerald-800/80 dark:text-emerald-400"
            hoverClass = "hover:bg-emerald-50/80 hover:text-emerald-900 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300"
          } else if (labelLower.includes("cetak") || labelLower.includes("print") || labelLower.includes("kartu") || labelLower.includes("unduh")) {
            badgeBg = "bg-indigo-50 border-indigo-200/90 text-indigo-600 dark:bg-indigo-950/60 dark:border-indigo-800/80 dark:text-indigo-400"
            hoverClass = "hover:bg-indigo-50/80 hover:text-indigo-900 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-300"
          } else if (labelLower.includes("pindah") || labelLower.includes("mutasi") || labelLower.includes("transfer")) {
            badgeBg = "bg-purple-50 border-purple-200/90 text-purple-600 dark:bg-purple-950/60 dark:border-purple-800/80 dark:text-purple-400"
            hoverClass = "hover:bg-purple-50/80 hover:text-purple-900 dark:hover:bg-purple-950/50 dark:hover:text-purple-300"
          } else if (labelLower.includes("status") || labelLower.includes("detail") || labelLower.includes("lihat")) {
            badgeBg = "bg-sky-50 border-sky-200/90 text-sky-600 dark:bg-sky-950/60 dark:border-sky-800/80 dark:text-sky-400"
            hoverClass = "hover:bg-sky-50/80 hover:text-sky-900 dark:hover:bg-sky-950/50 dark:hover:text-sky-300"
          } else if (labelLower.includes("export") || labelLower.includes("download") || labelLower.includes("excel")) {
            badgeBg = "bg-amber-50 border-amber-200/90 text-amber-600 dark:bg-amber-950/60 dark:border-amber-800/80 dark:text-amber-400"
            hoverClass = "hover:bg-amber-50/80 hover:text-amber-900 dark:hover:bg-amber-950/50 dark:hover:text-amber-300"
          }

          let renderedIcon = null
          if (React.isValidElement(item.icon)) {
            renderedIcon = React.cloneElement(item.icon, {
              className: cn("size-3.5 shrink-0 stroke-[2.2]", item.icon.props?.className),
            })
          } else if (item.icon) {
            renderedIcon = React.createElement(item.icon, {
              className: "size-3.5 shrink-0 stroke-[2.2]",
            })
          }

          return (
            <DropdownMenuItem
              key={idx}
              onAction={() => exec(item.onClick)}
              className={cn(
                "group cursor-pointer font-bold text-xs px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 transition-colors",
                isDanger
                  ? "text-rose-600 hover:bg-rose-50/80 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-300"
                  : "text-slate-700 dark:text-slate-200",
                !isDanger && hoverClass
              )}
            >
              <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-lg border group-hover:scale-105 transition-transform shadow-2xs", badgeBg)}>
                {renderedIcon}
              </span>
              <span className={cn("font-bold text-xs", isDanger ? "text-rose-600 group-hover:text-rose-700" : "text-slate-700 group-hover:text-slate-900 dark:text-slate-200 dark:group-hover:text-white")}>
                {item.label}
              </span>
            </DropdownMenuItem>
          )
        })}
        {canDelete && (
          <>
            {(canView || canEdit || canHistory || filteredExtraItems.length > 0) && (
              <DropdownMenuSeparator className="-mx-1 my-1 border-emerald-200/80 dark:border-emerald-800/60" />
            )}
            <DropdownMenuItem
              onAction={() => exec(onDelete)}
              className="group cursor-pointer font-bold text-xs text-rose-600 hover:bg-rose-50/80 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-300 px-2.5 py-1.5 rounded-xl flex items-center gap-2.5 transition-colors"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-rose-50 border border-rose-200/90 dark:bg-rose-950/60 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 group-hover:scale-105 transition-transform shadow-2xs">
                <Trash1 className="size-3.5" strokeWidth={2.2} />
              </span>
              <span className="text-rose-600 group-hover:text-rose-700 font-bold text-xs">Hapus</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { ActionDropdown as AppTableActions }
