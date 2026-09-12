import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  MessageCircle,
  MessageSquare,
  X,
  Minus,
  Maximize2,
  ChevronDown,
  Sparkles,
  Users,
  HeartHandshake
} from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { familyPortalService } from '../../services/familyPortalService'
import ChatGuruWorkspace from './ChatGuruWorkspace'
import { hasAnyRole, isParentRole, isStudentRole } from '../../auth/portalResolver'

export default function FloatingChatWidget() {
  const user = useAuthStore((state) => state.user)
  const roles = user?.roles || []
  const permissions = user?.permissions || []

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

  const isStudent = isStudentRole(roles) || roleStr.includes('siswa') || roleStr.includes('student')
  const isParent = isParentRole(roles) || roleStr.includes('orang') || roleStr.includes('parent')
  const isTeacher = roleNames.some((r) => ['Guru', 'Wali Kelas', 'Guru Pengajar', 'guru'].includes(r)) || roleStr.includes('guru') || roleStr.includes('walas')

  const canEmployeeChat =
    !isParent &&
    (Boolean(user?.is_superadmin) ||
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
      permissions.includes('chat.conversation.view') ||
      permissions.includes('chat.manage'))

  const isEmployee = canEmployeeChat && !isStudent
  const shouldRender = Boolean(user) && !isStudent && (isParent || isTeacher || isEmployee || canEmployeeChat)

  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [children, setChildren] = useState([])
  const [childId, setChildId] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  // Widget Mode: 'employee' | 'parent' | 'teacher'
  const defaultMode = isParent ? 'parent' : isTeacher ? 'teacher' : 'employee'
  const [widgetMode, setWidgetMode] = useState(defaultMode)

  useEffect(() => {
    if (isParent) {
      setWidgetMode('parent')
    } else if (isTeacher) {
      setWidgetMode('teacher')
    } else if (isEmployee) {
      setWidgetMode('employee')
    }
  }, [isEmployee, isParent, isTeacher])

  // Fetch children list for Parent Mode
  const loadChildren = useCallback(async () => {
    if (!isParent) return
    try {
      const res = await familyPortalService.children().catch(() => ({ data: [] }))
      const list = res?.data || []
      const validList = Array.isArray(list) ? list : []
      setChildren(validList)
      if (validList.length > 0 && !childId) {
        setChildId(validList[0].id)
      }
    } catch {
      setChildren([])
    }
  }, [isParent, childId])

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
      if (isTeacher && !isEmployee) {
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
    if (isParent) {
      loadChildren()
    }
  }, [isParent, loadChildren])

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
          className={`fixed right-3 sm:right-6 z-50 transition-all duration-300 transform origin-bottom-right flex flex-col overflow-hidden ${
            isMinimized
              ? 'bottom-6 w-auto max-w-[200px] h-12 px-3.5 rounded-full border border-emerald-500/60 bg-gradient-to-r from-[#0E5C44] via-[#187154] to-[#3FBF75] text-white shadow-2xl shadow-emerald-950/40 cursor-pointer hover:scale-105 active:scale-95'
              : 'bottom-20 w-[96vw] max-w-[940px] h-[640px] max-h-[calc(100vh-6.5rem)] rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-slate-900 shadow-2xl shadow-slate-950/25'
          }`}
          onClick={isMinimized ? () => setIsMinimized(false) : undefined}
        >
          {/* Header Pop-Up */}
          <div className="flex flex-col bg-gradient-to-r from-[#0E5C44] via-[#187154] to-[#3FBF75] text-white shadow-md select-none shrink-0">
            <div className={`flex items-center justify-between gap-2 px-3.5 ${isMinimized ? 'h-12 py-0' : 'py-3'}`}>
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <MessageSquare className="h-4 w-4 text-emerald-100" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white ring-2 ring-[#0E5C44]">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {!isMinimized && (
                  <div className="min-w-0">
                    <h3 className="truncate text-xs font-black tracking-wide text-white">
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
                    <select
                      value={childId}
                      onChange={(e) => setChildId(e.target.value)}
                      className="h-7 appearance-none rounded-lg border border-white/20 bg-white/10 pl-2 pr-6 text-[10px] font-bold text-white outline-none backdrop-blur hover:bg-white/20 [&>option]:text-slate-900"
                    >
                      {children.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.full_name.split(' ')[0]}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-1.5 top-2 h-3 w-3 text-white/80" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsMinimized((prev) => !prev)}
                  className="rounded-lg p-1 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
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
                  className="rounded-lg p-1 text-white/80 hover:bg-white/20 hover:text-white transition cursor-pointer"
                  title="Tutup Chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Mode Switcher Tabs inside Header for dual roles / employees */}
            {!isMinimized && (isEmployee || isTeacher) && isParent && (
              <div className="flex border-t border-white/10 bg-black/10 px-2 py-1 text-[11px] font-bold">
                <button
                  onClick={() => setWidgetMode('employee')}
                  className={`flex-1 py-1 text-center rounded-md transition ${
                    widgetMode === 'employee'
                      ? 'bg-white/20 text-white shadow-xs font-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  Chat Pegawai
                </button>
                <button
                  onClick={() => setWidgetMode(isTeacher ? 'teacher' : 'parent')}
                  className={`flex-1 py-1 text-center rounded-md transition ${
                    widgetMode !== 'employee'
                      ? 'bg-white/20 text-white shadow-xs font-black'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {isTeacher ? 'Chat Orang Tua' : 'Chat Guru'}
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

      {/* Floating Action Button (FAB) Bottom Right - Shown ONLY when closed or expanded */}
      {!isMinimized && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-50">
          <button
            type="button"
            onClick={toggleOpen}
            className="group relative flex items-center justify-center p-3.5 sm:p-4 rounded-full bg-gradient-to-r from-[#0E5C44] via-[#187154] to-[#3FBF75] text-white shadow-xl shadow-emerald-950/25 hover:shadow-2xl hover:shadow-emerald-700/40 hover:scale-108 active:scale-95 transition-all duration-300 cursor-pointer"
            title={isOpen ? 'Tutup Chat' : 'Buka Chat'}
          >
            {/* Animated Glow Halo */}
            <span className="absolute -inset-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 opacity-30 blur group-hover:opacity-60 transition duration-300" />

            <div className="relative flex items-center justify-center">
              {isOpen ? (
                <X className="h-6 w-6 transition-transform duration-300 rotate-90 group-hover:rotate-0" />
              ) : (
                <div className="relative">
                  <MessageCircle className="h-6 w-6 animate-pulse" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-white dark:ring-slate-900 animate-bounce">
                      {unreadCount}
                    </span>
                  )}
                </div>
              )}
            </div>
          </button>
        </div>
      )}
    </>
  )
}
