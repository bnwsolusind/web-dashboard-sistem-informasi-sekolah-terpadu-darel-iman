import React from 'react'
import { getUserRoleLevel, ROLE_LEVELS } from '../../auth/portalResolver'
import { useAuthStore } from '../../stores/authStore'

export default function PermissionGuard({ any = [], children, fallback = null }) {
 const user = useAuthStore((state) => state.user)
 const permissions = user?.permissions || []

 const isSuperAdmin = getUserRoleLevel(user) === ROLE_LEVELS.SUPER_ADMIN // Level 1
 const hasPermission = any.length === 0 || any.some((permission) => permissions.includes(permission))

 if (isSuperAdmin || hasPermission) {
 return children
 }

 return fallback
}
