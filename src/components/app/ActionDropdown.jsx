import React from 'react'
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
        className="flex size-8 items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-all duration-150 active:scale-95 cursor-pointer"
      >
        <Tooltip content="Menu Aksi">
          <span className="flex items-center justify-center size-full">
            {trigger || <MenuMeatballs1 className="size-4 text-white" />}
          </span>
        </Tooltip>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-44">
        {canView && (
          <DropdownMenuItem
            onAction={() => exec(onView)}
            className="cursor-pointer font-medium text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white px-3 py-2 rounded-lg flex items-center gap-2.5"
          >
            <Eye className="size-4 text-sky-500 shrink-0" />
            <span>Lihat Data</span>
          </DropdownMenuItem>
        )}
        {canEdit && (
          <DropdownMenuItem
            onAction={() => exec(onEdit)}
            className="cursor-pointer font-medium text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white px-3 py-2 rounded-lg flex items-center gap-2.5"
          >
            <Pencil1 className="size-4 text-amber-500 shrink-0" />
            <span>Edit Data</span>
          </DropdownMenuItem>
        )}
        {canHistory && (
          <DropdownMenuItem
            onAction={() => exec(onHistory)}
            className="cursor-pointer font-medium text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white px-3 py-2 rounded-lg flex items-center gap-2.5"
          >
            <ClockThree className="size-4 text-slate-400 shrink-0" />
            <span>Riwayat</span>
          </DropdownMenuItem>
        )}
        {filteredExtraItems.map((item, idx) => {
          const isDanger = item.isDanger || item.danger
          const iconClassName = `size-4 shrink-0 ${isDanger ? 'text-rose-500' : 'text-slate-500'}`
          const renderedIcon = React.isValidElement(item.icon)
            ? item.icon
            : item.icon
              ? React.createElement(item.icon, { className: iconClassName })
              : null
          return (
            <DropdownMenuItem
              key={idx}
              onAction={() => exec(item.onClick)}
              className={`cursor-pointer font-medium text-sm px-3 py-2 rounded-lg flex items-center gap-2.5 ${
                isDanger
                  ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white'
              }`}
            >
              {renderedIcon}
              <span>{item.label}</span>
            </DropdownMenuItem>
          )
        })}
        {canDelete && (
          <>
            {(canView || canEdit || canHistory || filteredExtraItems.length > 0) && (
              <DropdownMenuSeparator className="-mx-1.5 my-1.5 border-slate-200 dark:border-slate-800" />
            )}
            <DropdownMenuItem
              onAction={() => exec(onDelete)}
              className="cursor-pointer font-medium text-sm text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-300 px-3 py-2 rounded-lg flex items-center gap-2.5"
            >
              <Trash1 className="size-4 text-rose-500 shrink-0" />
              <span>Hapus</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
