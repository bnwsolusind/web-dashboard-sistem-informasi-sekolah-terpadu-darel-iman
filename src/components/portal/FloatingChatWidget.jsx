import React, { useState, useEffect, useCallback, useMemo } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { useQuery } from '@tanstack/react-query'
import {
 MessageCircle,
 MessageSquare,
 X,
 Minus,
 Maximize2,
 ChevronDown,
 Sparkles,
 Users,
 HeartHandshake,
 ChevronRight,
 PanelRightClose
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { familyPortalService } from '../../services/familyPortalService'
import ChatGuruWorkspace from './ChatGuruWorkspace'
import { hasAnyRole, isParentRole, isStudentRole, getUserRoleLevel, ROLE_LEVELS } from '../../auth/portalResolver'

export default function FloatingChatWidget() {
 const user = useAuthStore((state) => state.user)
 const roles = user?.roles || []
 const permissions = user?.permissions || []
 const userLevel = getUserRoleLevel(user)
 const policy = user?.access_policy || null

 const roleNames = useMemo(() => {
 return Array.isArray(roles)
 ? roles.map((r) => (typeof r === 'string' ? r : r?.name || ''))
 : []
 }, [roles])

 const roleStr = useMemo(() => {
 return [user?.role, user?.role?.name, user?.role_name, ...roleNames]
 .filter(Boolean)
 .join(' ')
 .toLowerCase()
 }, [user, roleNames])

 const isSuperAdmin =
 policy?.portal_group === 'super_admin' ||
 userLevel === ROLE_LEVELS.SUPER_ADMIN ||
 Boolean(user?.is_superadmin) ||
 roleNames.some((r) => ['Super Admin', 'super_admin', 'Superadmin'].includes(r)) ||
 roleStr.includes('super_admin') ||
 roleStr.includes('superadmin')

 const isTeacher =
 policy?.portal_group === 'teacher' ||
 userLevel === ROLE_LEVELS.GURU ||
 roleNames.some((r) => ['Guru', 'Wali Kelas', 'Guru Pengajar', 'guru'].includes(r)) ||
 roleStr.includes('guru') ||
 roleStr.includes('walas')

 const isParent = policy?.portal_group === 'parent' || userLevel === ROLE_LEVELS.ORANG_TUA || isParentRole(user || roles) || roleStr.includes('orang') || roleStr.includes('parent')

 const hasInternalRole =
 ['super_admin', 'admin', 'foundation', 'education', 'principal', 'waka', 'tu', 'operator', 'teacher', 'musyrif', 'staff'].includes(policy?.portal_group) ||
 userLevel <= ROLE_LEVELS.MUSYRIF || // Level 1 s/d 6 (Staf Internal)
 isSuperAdmin ||
 isTeacher ||
 roleStr.includes('super') ||
 roleStr.includes('admin') ||
 roleStr.includes('yayasan') ||
 roleStr.includes('pengurus') ||
 roleStr.includes('kepala') ||
 roleStr.includes('kepsek') ||
 roleStr.includes('pendidikan') ||
 /\b(tu|tata_usaha)\b/i.test(roleStr) ||
 roleStr.includes('pegawai') ||
 roleStr.includes('staf') ||
 permissions.includes('chat.manage')

 const canEmployeeChat = !isParent && hasInternalRole
 const isStaffOrTeacher = isSuperAdmin || canEmployeeChat || isTeacher
 const isPureStudent = (policy?.portal_group === 'student' || userLevel === ROLE_LEVELS.SISWA || isStudentRole(user || roles) || roleStr.includes('siswa') || roleStr.includes('student')) && !isStaffOrTeacher && !isParent

 const isEmployee = canEmployeeChat && !isPureStudent && !isParent
 const shouldRender = Boolean(user) && !isPureStudent && (isParent || isTeacher || isEmployee || isSuperAdmin)

 const [isOpen, setIsOpen] = useState(false)
 const [isMinimized, setIsMinimized] = useState(false)
 const [isDocked, setIsDocked] = useState(() => {
 try {
 const stored = localStorage.getItem('school_erp_chat_fab_docked')
 return stored === 'false' ? false : true
 } catch {
 return true
 }
 })
 const [childId, setChildId] = useState('')
 const [unreadCount, setUnreadCount] = useState(0)

 const toggleDock = (e) => {
 e.stopPropagation()
 setIsDocked((prev) => {
 const next = !prev
 try {
 localStorage.setItem('school_erp_chat_fab_docked', String(next))
 } catch { }
 return next
 })
 }

 // Widget Mode: 'employee' | 'parent' | 'teacher'
 const defaultMode = isParent && !isStaffOrTeacher ? 'parent' : isTeacher ? 'teacher' : 'employee'
 const [widgetMode, setWidgetMode] = useState(defaultMode)

 useEffect(() => {
 if (isParent && !isStaffOrTeacher) {
 setWidgetMode('parent')
 } else if (isTeacher) {
 setWidgetMode('teacher')
 } else if (isEmployee || isSuperAdmin) {
 setWidgetMode('employee')
 }
 }, [isEmployee, isParent, isTeacher, isSuperAdmin, isStaffOrTeacher])

 // Fetch children list for Parent Mode with React Query caching
 const { data: childrenQueryData } = useQuery({
 queryKey: ['portalChildren'],
 queryFn: () => familyPortalService.children().catch(() => ({ data: [] })),
 enabled: Boolean(isParent),
 staleTime: 1000 * 60 * 15,
 })

 const children = useMemo(() => {
 const list = childrenQueryData?.data || []
 return Array.isArray(list) ? list : []
 }, [childrenQueryData])

 useEffect(() => {
 if (children.length > 0 && !childId) {
 setChildId(children[0].id)
 }
 }, [children, childId])

 // Periodically check total unread messages across parent, teacher, and employee chats
 const checkUnread = useCallback(async () => {
 if (!shouldRender || isOpen || (typeof document !== 'undefined' && document.hidden)) return
 let total = 0
 try {
 if (isParent && childId) {
 const res = await familyPortalService.chatContacts(childId).catch(() => ({ data: [] }))
 const contacts = res.data || []
 total += contacts.reduce((sum, c) => sum + (c.unread_count || 0), 0)
 }
 if (isTeacher) {
 const res = await familyPortalService.teacherConversations().catch(() => ({ data: [] }))
 const conversations = res.data || []
 total += conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0)
 }
 if (isEmployee) {
 const res = await familyPortalService.employeeConversations().catch(() => ({ data: [] }))
 const empConvs = res.data || []
 total += empConvs.reduce((sum, c) => sum + (c.unread_count || 0), 0)
 }
 setUnreadCount(total)
 } catch {
 // Ignore background check error
 }
 }, [isParent, isTeacher, isEmployee, shouldRender, childId])

 useEffect(() => {
 checkUnread()
 const timer = setInterval(checkUnread, 30000)
 return () => clearInterval(timer)
 }, [checkUnread])

 if (!shouldRender) return null

 const toggleOpen = () => {
 setIsOpen((prev) => !prev)
 setIsMinimized(false)
 }

 const activeChild = children.find((c) => c.id === childId)

 return (
 <>
 {/* Pop-Up Window / Minimized Pill */}
 {isOpen && (
 <div
 className={`fixed right-3 sm:right-6 z-40 transition-all duration-300 transform origin-bottom-right flex flex-col overflow-hidden ${isMinimized
 ? 'bottom-6 w-auto max-w-[200px] h-12 px-3.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] shadow-2xl shadow-sm cursor-pointer hover:scale-105 active:scale-95'
 : 'bottom-20 w-[96vw] max-w-[940px] h-[640px] max-h-[calc(100vh-6.5rem)] rounded-xl border border-emerald-200/80 dark:border-emerald-800/90 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-950/25'
 }`}
 onClick={isMinimized ? () => setIsMinimized(false) : undefined}
 >
 {/* Header Pop-Up */}
 <div className="flex flex-col bg-white dark:bg-[#1B2433] shadow-md select-none shrink-0">
 <div className={`flex items-center justify-between gap-2 px-3.5 ${isMinimized ? 'h-12 py-0' : 'py-3'}`}>
 <div className="flex items-center gap-2.5 min-w-0">
 <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
 <MessageSquare className="h-4 w-4 text-emerald-100" />
 {unreadCount > 0 && (
 <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-[#059669]">
 {unreadCount}
 </span>
 )}
 </div>
 {!isMinimized && (
 <div className="min-w-0">
 <h3 className=" text-xs font-black tracking-wide text-white">
 {widgetMode === 'employee'
 ? 'Chat Antar Pegawai'
 : isTeacher
 ? 'Komunikasi Orang Tua'
 : 'Chat Guru & Wali Kelas'}
 </h3>
 <p className="truncate text-[10px] text-emerald-100/80 font-medium">
 {isParent
 ? activeChild
 ? `Anak: ${activeChild.full_name}`
 : 'Portal Orang Tua'
 : 'Ruang Diskusi Sekolah'}
 </p>
 </div>
 )}
 </div>

 {/* Actions: Child Switcher & Control Buttons */}
 <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
 {!isMinimized && isParent && children.length > 1 && widgetMode === 'parent' && (
 <div className="relative">
 <CustomSelect
 value={childId}
 onChange={(e) => setChildId(e.target.value)}
 className="h-7 appearance-none rounded-lg border border-emerald-200/20 bg-white/10 pl-2 pr-6 text-[10px] font-bold outline-none backdrop-blur hover:bg-white/20 [&>option]:text-slate-900"
 >
 {children.map((c) => (
 <option key={c.id} value={c.id}>
 {c.full_name.split(' ')[0]}
 </option>
 ))}
 </CustomSelect>
 <ChevronDown className="pointer-events-none absolute right-1.5 top-2 h-3 w-3 text-white/80" />
 </div>
 )}

 <button
 type="button"
 onClick={() => setIsMinimized((prev) => !prev)}
 className="rounded-lg p-1 /80 hover:bg-white/20 hover:text-white transition cursor-pointer"
 title={isMinimized ? 'Perbesar' : 'Kecilkan'}
 >
 {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
 </button>

 <button
 type="button"
 onClick={() => {
 setIsOpen(false)
 setIsMinimized(false)
 }}
 className="rounded-lg p-1 /80 hover:bg-white/20 hover:text-white transition cursor-pointer"
 title="Tutup Chat"
 >
 <X className="h-4 w-4" />
 </button>
 </div>
 </div>

 {/* Mode Switcher Tabs inside Header for dual roles / employees */}
 {!isMinimized && (isTeacher || isSuperAdmin || isEmployee || isParent) && (
 <div className="flex border-t border-emerald-200/10 bg-black/10 px-2 py-1 text-xs font-bold">
 <button
 type="button"
 onClick={() => setWidgetMode('employee')}
 className={`flex-1 py-1 text-center rounded-md transition cursor-pointer ${widgetMode === 'employee'
 ? 'bg-white/20 shadow-xs font-black'
 : 'text-white/70 hover:text-white'
 }`}
 >
 Chat Pegawai
 </button>
 <button
 type="button"
 onClick={() => setWidgetMode(isParent && !isTeacher && !isEmployee ? 'parent' : 'teacher')}
 className={`flex-1 py-1 text-center rounded-md transition cursor-pointer ${widgetMode !== 'employee'
 ? 'bg-white/20 shadow-xs font-black'
 : 'text-white/70 hover:text-white'
 }`}
 >
 {isParent && !isTeacher && !isEmployee ? 'Chat Guru' : 'Chat Orang Tua'}
 </button>
 </div>
 )}
 </div>

 {/* Body Content Chat Workspace */}
 {!isMinimized && (
 <div className="flex-1 min-h-0 overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 flex flex-col h-full">
 <ChatGuruWorkspace
 mode={widgetMode}
 childId={childId}
 childrenList={children}
 onSelectChild={setChildId}
 hideHeader={true}
 isPopup={true}
 />
 </div>
 )}
 </div>
 )}

 {/* Floating Action Button (FAB) Bottom Right or Docked Edge Tab */}
 {!isMinimized && (
 isDocked ? (
        <div className="fixed bottom-28 sm:bottom-24 right-0 z-40 transition-transform duration-300">
          <button
            type="button"
            onClick={() => {
              setIsDocked(false)
              setIsOpen(true)
            }}
            className="group flex items-center gap-1.5 pl-3 pr-2 py-2.5 rounded-l-2xl bg-gradient-to-r from-[#059669] to-teal-700 text-white shadow-xl shadow-emerald-950/20 hover:pl-4 transition-all duration-200 cursor-pointer border-y border-l border-emerald-400/40"
            title="Buka Chat Terpadu (Klik untuk membuka)"
          >
            <MessageCircle className="h-4.5 w-4.5 text-white group-hover:scale-110 transition-transform" />
            <span className="text-xs font-black tracking-wide pr-1 hidden xs:inline">Chat</span>
            {unreadCount > 0 && (
              <span className="flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>
      ) : (
        <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 group/fab">
          {/* Dock to Edge Button (Visible on FAB hover) */}
          <button
            type="button"
            onClick={toggleDock}
            className="absolute -top-2 -left-2 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-800 text-white border border-emerald-400/50 shadow-md opacity-0 group-hover/fab:opacity-100 transition-all duration-200 cursor-pointer scale-75 group-hover/fab:scale-100 text-xs font-medium"
            title="Sematkan ke tepi layar (agar tidak menghalangi)"
          >
            <PanelRightClose className="h-3 w-3" />
          </button>

          <button
            type="button"
            onClick={toggleOpen}
            className="group relative flex items-center justify-center p-3.5 sm:p-4 rounded-full bg-gradient-to-br from-[#059669] via-emerald-600 to-teal-700 text-white shadow-xl shadow-emerald-950/30 hover:shadow-2xl hover:shadow-emerald-900/40 hover:scale-105 active:scale-95 border border-emerald-400/40 transition-all duration-300 cursor-pointer"
            title={isOpen ? "Tutup Chat" : "Buka Chat"}
          >
            {/* Animated Glow Halo */}
            <span className="absolute -inset-1 rounded-full bg-emerald-500 opacity-40 blur group-hover:opacity-75 transition duration-300" />

            <div className="relative flex items-center justify-center">
              {isOpen ? (
                <X className="h-6 w-6 text-white transition-transform duration-300 rotate-90 group-hover:rotate-0" />
              ) : (
                <div className="relative">
                  <MessageCircle className="h-6 w-6 text-white animate-pulse" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-emerald-800 animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </div>
              )}
            </div>
          </button>
        </div>
 )
 )}
 </>
 )
}
