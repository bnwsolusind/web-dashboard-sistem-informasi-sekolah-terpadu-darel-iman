import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import {
  MessageSquare,
  Search,
  Send,
  Download,
  Eye,
  UserCheck,
  BookOpen,
  Filter,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ChevronLeft,
  Paperclip,
  Smile,
  ShieldCheck,
  Tag,
  Archive,
  Inbox,
  Users,
  UserPlus,
  Briefcase,
  Building2,
  Lock,
  Pin,
  Image as ImageIcon,
  FileText,
  AtSign,
  Mic,
  Plus,
  Phone,
  Video,
  MoreVertical,
  X,
  Minus
} from 'lucide-react'
import api from '../../services/api'
import { familyPortalService } from '../../services/familyPortalService'
import { educationUnitService } from '../../services/educationUnitService'

const CATEGORIES = [
  'Akademik',
  'Jadwal',
  'Materi',
  'Tugas',
  'Nilai',
  'Kehadiran',
  'Izin/Sakit',
  'Tahfizh',
  'Mutabaah',
  'Perilaku',
  'Lainnya'
]

const EMOJI_OPTIONS = ['👍', '🙏', '❤️', '👏', '😊', '💡']

const timeCache = new Map()
const formatMessageTime = (timestamp) => {
  if (!timestamp) return ''
  if (timeCache.has(timestamp)) return timeCache.get(timestamp)
  const date = new Date(timestamp)
  if (isNaN(date.getTime())) return String(timestamp)
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  const result = isToday
    ? date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  if (timeCache.size > 500) timeCache.clear()
  timeCache.set(timestamp, result)
  return result
}

// Memoized Chat Message Bubble to avoid re-rendering entire conversation stream on typing
const ChatMessageBubble = React.memo(function ChatMessageBubble({
  msg,
  isOwn,
  senderName,
  isFirstUnread,
  timeFormatted,
  onImageClick,
}) {
  return (
    <React.Fragment>
      {isFirstUnread && (
        <div className="flex items-center justify-center my-4 select-none">
          <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">
            — Belum Dibaca —
          </span>
        </div>
      )}

      <div className={`flex items-start gap-2.5 ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
        {!isOwn && (
          msg.sender_avatar || msg.sender_foto ? (
            <img
              src={msg.sender_avatar || msg.sender_foto}
              alt={senderName}
              className="h-8 w-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200/80 mt-0.5"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-xs font-black text-white shrink-0 shadow-2xs mt-0.5">
              {(senderName || 'P')[0]}
            </div>
          )
        )}

        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} max-w-[85%] sm:max-w-[78%]`}>
          {!isOwn && (
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 mb-1">
              {senderName}
            </span>
          )}

          <div className="flex items-end gap-2">
            <div
              className={`group relative rounded-2xl p-3 text-xs shadow-2xs ${
                isOwn
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/80 text-slate-900 dark:text-emerald-100 rounded-tr-xs'
                  : 'bg-slate-100/90 dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-xs'
              }`}
            >
              {/* Message Attachments */}
              {Array.isArray(msg.attachments) && msg.attachments.length > 0 && (
                <div className="mb-2 space-y-1.5">
                  {msg.attachments.map((att, attIdx) => {
                    const isImg = att.file_type === 'image' || (att.mime_type && att.mime_type.startsWith('image/'))
                    const fileUrl = att.url || (att.path ? (att.path.startsWith('http') ? att.path : `/storage/${att.path}`) : '')
                    if (isImg) {
                      return (
                        <div key={att.id || attIdx} className="relative group/att overflow-hidden rounded-xl border border-black/10 dark:border-white/10 max-w-[280px]">
                          <img
                            src={fileUrl}
                            alt={att.original_name || 'Lampiran'}
                            className="max-h-56 w-full object-cover cursor-pointer hover:scale-102 transition-transform duration-200"
                            onClick={() => onImageClick && onImageClick(fileUrl, att.original_name)}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/att:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none">
                            <span className="text-white text-xs font-bold flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-full pointer-events-auto cursor-pointer" onClick={() => onImageClick && onImageClick(fileUrl, att.original_name)}>
                              <Eye className="h-3.5 w-3.5" /> Lihat
                            </span>
                          </div>
                        </div>
                      )
                    }
                    return (
                      <a
                        key={att.id || attIdx}
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        download={att.original_name}
                        className="flex items-center gap-2.5 p-2 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition shadow-xs max-w-[280px]"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{att.original_name || 'Dokumen'}</p>
                          <p className="text-[10px] text-slate-400 font-medium">{att.formatted_size || (att.file_size ? `${(att.file_size / 1024).toFixed(0)} KB` : 'File')}</p>
                        </div>
                        <Download className="h-4 w-4 text-slate-400 hover:text-emerald-600 shrink-0" />
                      </a>
                    )
                  })}
                </div>
              )}

              {Boolean(msg.message && msg.message.trim()) && (
                <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
              )}

              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] text-slate-400 font-semibold">
                <span>{timeFormatted}</span>
                {isOwn && (
                  <CheckCheck className="h-3.5 w-3.5 text-emerald-600" />
                )}
              </div>

              {Array.isArray(msg.reactions) && msg.reactions.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {msg.reactions.map((r, rIdx) => (
                    <span
                      key={rIdx}
                      className="inline-flex items-center gap-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-700 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:text-slate-200 shadow-2xs"
                    >
                      <span>{r.reaction}</span>
                      <span>{r.count}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {msg.is_unread && (
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0 shadow-2xs mb-2" />
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  )
})

// Isolated Message Composer component: keeps typed text state isolated so typing never re-renders messages
const ChatMessageComposer = React.memo(function ChatMessageComposer({ onSend, sending, totalUnreadCount }) {
  const [text, setText] = useState('')
  const [category, setCategory] = useState('')
  const [stagedAttachment, setStagedAttachment] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const isImage = file.type.startsWith('image/')
    const previewUrl = isImage ? URL.createObjectURL(file) : null
    setStagedAttachment({
      file,
      name: file.name,
      size: (file.size / 1024 > 1024 ? (file.size / 1048576).toFixed(1) + ' MB' : (file.size / 1024).toFixed(0) + ' KB'),
      isImage,
      previewUrl,
    })
    e.target.value = ''
  }

  const removeAttachment = () => {
    if (stagedAttachment?.previewUrl) {
      URL.revokeObjectURL(stagedAttachment.previewUrl)
    }
    setStagedAttachment(null)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if ((!text.trim() && !stagedAttachment) || sending) return
    onSend(text, category, stagedAttachment?.file)
    setText('')
    setCategory('')
    if (stagedAttachment?.previewUrl) {
      URL.revokeObjectURL(stagedAttachment.previewUrl)
    }
    setStagedAttachment(null)
  }

  return (
    <div className="border-t border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 space-y-2 shrink-0">
      {/* Staged Attachment Preview Bar */}
      {stagedAttachment && (
        <div className="flex items-center gap-3 p-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80">
          {stagedAttachment.isImage ? (
            <img
              src={stagedAttachment.previewUrl}
              alt="Pratinjau"
              className="h-12 w-12 rounded-xl object-cover border border-emerald-300 dark:border-emerald-700 shadow-2xs"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-200/80 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
              <FileText className="h-6 w-6" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">{stagedAttachment.name}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{stagedAttachment.size} • Siap dikirim</p>
          </div>
          <button
            type="button"
            onClick={removeAttachment}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-100 hover:text-rose-600 transition cursor-pointer"
            title="Hapus Lampiran"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-2">
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          className="hidden"
        />

        {/* Curved Rounded Input Bar */}
        <div className="flex items-center gap-2 rounded-3xl border border-slate-200/90 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-1 shadow-inner">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={stagedAttachment ? "Tambah keterangan (opsional)..." : "Ketik pesan..."}
            className="h-9 flex-1 bg-transparent text-xs text-slate-900 dark:text-white outline-none placeholder:text-slate-400"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1 text-slate-400 hover:text-emerald-600 transition cursor-pointer"
            title="Lampirkan Gambar atau Berkas"
          >
            <Paperclip className="h-4.5 w-4.5" />
          </button>

          <button
            type="submit"
            disabled={(!text.trim() && !stagedAttachment) || sending}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-700 disabled:opacity-40 cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom Attachment Toolbar */}
        <div className="flex items-center justify-between text-slate-400 px-2 pt-0.5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline transition cursor-pointer"
            >
              <Paperclip className="h-3.5 w-3.5" /> Lampirkan Berkas
            </button>
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = "image/*";
                  fileInputRef.current.click();
                }
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-emerald-600 transition cursor-pointer"
            >
              <ImageIcon className="h-3.5 w-3.5" /> Foto
            </button>
            <button
              type="button"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = ".pdf,.doc,.docx,.xls,.xlsx,.txt";
                  fileInputRef.current.click();
                }
              }}
              className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-emerald-600 transition cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5" /> Dokumen
            </button>
          </div>

          {/* Unread Indicator Badge */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600">
            <span>{totalUnreadCount} belum dibaca</span>
            {totalUnreadCount > 0 && (
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            )}
          </div>
        </div>
      </form>
    </div>
  )
})

export default function ChatGuruWorkspace({
  mode = 'parent', // 'parent' | 'teacher' | 'employee'
  childId = '',
  childrenList = [],
  onSelectChild = () => {},
  hideHeader = false,
  isPopup = false
}) {
  const [tab, setTab] = useState(mode === 'employee' ? 'percakapan' : 'all') // 'percakapan' | 'directory' | 'all' | 'kepsek' | 'divisi_pendidikan' | 'homeroom' | 'subject' | 'unread'
  const [contacts, setContacts] = useState(() => {
    try {
      const cached = sessionStorage.getItem('chat_contacts_cache')
      return cached ? JSON.parse(cached) : []
    } catch { return [] }
  })
  const [directoryContacts, setDirectoryContacts] = useState(() => {
    try {
      const cached = sessionStorage.getItem('chat_directory_cache')
      return cached ? JSON.parse(cached) : []
    } catch { return [] }
  })
  const [selectedContact, setSelectedContact] = useState(null)
  const [dbUnits, setDbUnits] = useState([])

  const [messages, setMessages] = useState([])
  const [search, setSearch] = useState('')
  const [selectedUnit, setSelectedUnit] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  const [lightboxMedia, setLightboxMedia] = useState(null)
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false)
  const [showNewChatModal, setShowNewChatModal] = useState(false)
  const [groupName, setGroupName] = useState('')
  const [selectedGroupParticipants, setSelectedGroupParticipants] = useState([])
  const [isCreatingGroup, setIsCreatingGroup] = useState(false)
  const [showAnnouncement, setShowAnnouncement] = useState(true)

  const messagesEndRef = useRef(null)

  const currentUser = useMemo(() => {
    try {
      const raw = localStorage.getItem('school_erp_user') || sessionStorage.getItem('school_erp_user')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }, [])
  const currentUserId = currentUser?.id || currentUser?.user_id

  const getAvatarUrl = (item) => {
    if (!item) return null
    const photo = item.foto || item.photo || item.avatar || item.user?.avatar
    if (!photo || typeof photo !== 'string' || !photo.trim()) return null
    if (photo.startsWith('http://') || photo.startsWith('https://') || photo.startsWith('data:')) {
      return photo
    }
    const cleanPath = photo.replace(/^\/?(storage\/)?/, '')
    return `/storage/${cleanPath}`
  }

  const renderPresenceDot = (status, isOnline) => {
    const isActivelyOnline = isOnline || status === 'online'
    const isBusy = status === 'busy' || status === 'sibuk'

    if (isActivelyOnline) {
      return (
        <span
          title="Status: Online"
          className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse"
        />
      )
    }
    if (isBusy) {
      return (
        <span
          title="Status: Sibuk"
          className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-slate-900"
        />
      )
    }
    return (
      <span
        title="Status: Offline"
        className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600 ring-2 ring-white dark:ring-slate-900"
      />
    )
  }

  // Fetch unit pendidikan directly from PostgreSQL database
  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await api.get('/foundation/units').catch(() => educationUnitService.getAll())
        const raw = res?.data?.data || res?.data || res || []
        const list = Array.isArray(raw) ? raw : (Array.isArray(raw.data) ? raw.data : [])
        setDbUnits(list)
      } catch (err) {
        setDbUnits([])
      }
    }
    fetchUnits()
  }, [])

  const availableUnits = useMemo(() => {
    const map = new Map()

    dbUnits.forEach((u) => {
      const uName = u.name || u.nama_unit || u.nama
      const uId = u.id || u.unit_id
      if (uName) {
        const key = uId ? String(uId) : uName
        map.set(key, { id: key, name: uName })
      }
    })

    directoryContacts.forEach((c) => {
      const uName = c.unit_name || c.unit?.name
      const uId = c.unit_id || c.unit?.id
      if (uName && uName !== '-') {
        const key = uId ? String(uId) : uName
        if (!map.has(key)) {
          map.set(key, { id: key, name: uName })
        }
      }
    })

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [dbUnits, directoryContacts])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load Contacts or Teacher/Employee Conversations
  // Load Contacts or Teacher/Employee Conversations
  const fetchContacts = async (querySearch = search, unit = selectedUnit, status = selectedStatus) => {
    if (contacts.length === 0 && directoryContacts.length === 0) {
      setLoading(true)
    }
    setError('')
    try {
      if (mode === 'parent') {
        const res = await familyPortalService.chatContacts(childId).catch(() => ({ data: [] }))
        const list = res.data || []
        setContacts(list)
        if (list.length > 0 && !selectedContact) {
          setSelectedContact(list[0])
        }
      } else if (mode === 'employee') {
        const [convRes, dirRes] = await Promise.all([
          familyPortalService.employeeConversations().catch(() => ({ data: [] })),
          familyPortalService.employeeContacts(querySearch, unit, status).catch(() => ({ data: [] }))
        ])

        const extractArray = (res) => {
          if (!res) return []
          if (Array.isArray(res)) return res
          if (Array.isArray(res.data)) return res.data
          if (Array.isArray(res.data?.data)) return res.data.data
          return []
        }

        const convList = extractArray(convRes)
        const dirList = extractArray(dirRes)

        setContacts(convList)
        setDirectoryContacts(dirList)
        try {
          sessionStorage.setItem('chat_contacts_cache', JSON.stringify(convList))
          sessionStorage.setItem('chat_directory_cache', JSON.stringify(dirList))
        } catch {}

        const firstAvailable = convList.length > 0 ? convList[0] : (dirList.length > 0 ? dirList[0] : null)
        if (!selectedContact && firstAvailable) {
          setSelectedContact(firstAvailable)
        }
      } else {
        const res = await familyPortalService.teacherConversations()
        const list = res.data || []
        setContacts(list)
        if (!selectedContact && list.length > 0) {
          setSelectedContact(list[0])
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat daftar percakapan.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setSelectedContact(null)
    if (mode === 'employee') {
      setTab('percakapan')
    } else {
      setTab('all')
    }
    fetchContacts(search, selectedUnit, selectedStatus)
  }, [mode, childId])

  // Trigger fetchContacts when search or filter controls change
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContacts(search, selectedUnit, selectedStatus)
    }, 300)
    return () => clearTimeout(timer)
  }, [search, selectedUnit, selectedStatus])

  // Heartbeat Presence when workspace is active
  useEffect(() => {
    let isMounted = true
    const sendPresence = (status = 'online') => {
      familyPortalService.updatePresence(status).catch(() => {})
    }

    sendPresence('online')
    const presenceTimer = setInterval(() => {
      if (isMounted) sendPresence('online')
    }, 45000)

    const handleBeforeUnload = () => sendPresence('offline')
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      isMounted = false
      clearInterval(presenceTimer)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])

  // Load Messages for selected contact (supports silent background polling)
  const fetchMessages = async (silent = false) => {
    if (!selectedContact) return
    if (!silent) setMessagesLoading(true)
    try {
      const targetUserId = selectedContact.user_id || selectedContact.id
      let incoming = []
      if (mode === 'parent') {
        const res = await familyPortalService.chatMessages(targetUserId, childId).catch(() => ({ data: [] }))
        incoming = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      } else if (mode === 'employee') {
        const res = await familyPortalService.employeeMessages(targetUserId).catch(() => ({ data: [] }))
        incoming = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      } else {
        const parentUserId = selectedContact.parent_user_id || targetUserId
        const studentId = selectedContact.student_id || childId
        const res = await familyPortalService.teacherMessages(parentUserId, studentId).catch(() => ({ data: [] }))
        incoming = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : [])
      }

      setMessages((prev) => {
        if (silent && prev.length === incoming.length) {
          const lastPrev = prev[prev.length - 1]
          const lastInc = incoming[incoming.length - 1]
          if (
            lastPrev?.id === lastInc?.id &&
            lastPrev?.read_at === lastInc?.read_at &&
            lastPrev?.message === lastInc?.message &&
            (lastPrev?.reactions?.length || 0) === (lastInc?.reactions?.length || 0)
          ) {
            return prev // Zero re-render when identical
          }
        }
        return incoming
      })
    } catch (err) {
      if (!silent) {
        console.warn('Gagal memuat pesan percakapan:', err)
        setMessages([])
      }
    } finally {
      if (!silent) {
        setMessagesLoading(false)
        setTimeout(scrollToBottom, 100)
      }
    }
  }

  useEffect(() => {
    fetchMessages(false)
  }, [selectedContact, childId])

  // 1. Fast active message polling (1.5s) when conversation is open and tab is active
  useEffect(() => {
    if (!selectedContact) return
    const msgTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return
      fetchMessages(true)
    }, 2000)
    return () => clearInterval(msgTimer)
  }, [selectedContact, mode, childId])

  // 2. Slower contact list polling (15s) to avoid choking HTTP connections
  useEffect(() => {
    const contactTimer = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return
      fetchContacts(search, selectedUnit, selectedStatus)
    }, 30000)
    return () => clearInterval(contactTimer)
  }, [mode, childId, search, selectedUnit, selectedStatus])

  // Combined contacts for Employee mode
  const combinedEmployeeContacts = useMemo(() => {
    if (mode !== 'employee') return contacts

    const map = new Map()

    // Directory contacts
    directoryContacts.forEach((dirItem, idx) => {
      const uid = dirItem.user_id || dirItem.id || `dir_${idx}`
      map.set(uid, { ...dirItem })
    })

    // Active conversations
    contacts.forEach((convItem, idx) => {
      const uid = convItem.user_id || convItem.id || `conv_${idx}`
      const existing = map.get(uid)
      if (existing) {
        map.set(uid, {
          ...existing,
          ...convItem,
          is_online: existing.is_online ?? convItem.is_online,
          status: existing.status ?? convItem.status,
        })
      } else {
        map.set(uid, { ...convItem })
      }
    })

    const mergedList = Array.from(map.values())

    return mergedList.sort((a, b) => {
      if (a.last_message_at && b.last_message_at) {
        return new Date(b.last_message_at) - new Date(a.last_message_at)
      }
      if (a.last_message_at) return -1
      if (b.last_message_at) return 1
      return (a.name || '').localeCompare(b.name || '')
    })
  }, [mode, contacts, directoryContacts])

  const selectedUnitObj = useMemo(() => {
    if (!selectedUnit || selectedUnit === 'all') return null
    return availableUnits.find(
      (u) => String(u.id).toLowerCase() === String(selectedUnit).toLowerCase() ||
             u.name.toLowerCase() === String(selectedUnit).toLowerCase()
    )
  }, [availableUnits, selectedUnit])

  // Filter contacts by Tab, Search, Unit, & Status
  const filteredContacts = useMemo(() => {
    const activeSource =
      mode === 'employee'
        ? tab === 'directory'
          ? (directoryContacts.length > 0 ? directoryContacts : combinedEmployeeContacts)
          : combinedEmployeeContacts
        : contacts

    const query = (search || '').trim().toLowerCase()
    const targetUnit = (selectedUnit || '').trim().toLowerCase()
    const targetStatus = (selectedStatus || '').trim().toLowerCase()

    return activeSource.filter((item) => {
      // 1. Search Query Filter
      if (query) {
        const searchableStr = [
          item.name,
          item.nama_lengkap,
          item.nama_panggilan,
          item.position_name,
          item.position?.name,
          item.jabatan,
          item.role,
          item.unit_name,
          item.unit?.name,
          item.division_name,
          item.nip_niy,
          item.niy,
          item.nik,
          item.email,
          item.no_hp
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        if (!searchableStr.includes(query)) return false
      }

      // 2. Unit Filter
      if (targetUnit && targetUnit !== 'all') {
        const itemUnitName = (item.unit_name || item.unit?.name || '').toLowerCase()
        const itemUnitId = String(item.unit_id || item.unit?.id || '').toLowerCase()
        const selName = (selectedUnitObj?.name || targetUnit).toLowerCase()
        const selId = String(selectedUnitObj?.id || targetUnit).toLowerCase()

        const isMatch =
          itemUnitId === selId ||
          itemUnitId === targetUnit ||
          (selName && itemUnitName === selName) ||
          (selName.length > 2 && itemUnitName.includes(selName)) ||
          (itemUnitName.length > 2 && selName.includes(itemUnitName))

        if (!isMatch) return false
      }

      // 3. Status Filter
      if (targetStatus && targetStatus !== 'all') {
        const statusVal = String(item.status || '').toLowerCase()
        const isOnline = Boolean(item.is_online === true || statusVal === 'online')
        const isBusy = Boolean(statusVal === 'busy' || statusVal === 'sedang sibuk' || statusVal === 'sibuk')
        const isOffline = !isOnline && !isBusy

        if (targetStatus === 'online' && !isOnline) return false
        if (targetStatus === 'busy' && !isBusy) return false
        if (targetStatus === 'offline' && !isOffline) return false
      }

      // 4. Tab Scoping Filter
      if (mode === 'teacher') {
        if (tab === 'unread') return (item.unread_count || 0) > 0
        return true
      }
      if (tab === 'percakapan' || tab === 'all' || tab === 'directory') {
        return true
      }
      if (tab === 'kepsek') {
        const pos = (item.position_name || item.role || item.title || '').toLowerCase()
        return pos.includes('kepala') || pos.includes('kepsek') || pos.includes('waka') || pos.includes('principal')
      }
      if (tab === 'divisi_pendidikan') {
        const pos = (item.position_name || item.role || item.division_name || '').toLowerCase()
        return pos.includes('pendidikan') || pos.includes('divisi') || pos.includes('kurikulum') || pos.includes('kabid')
      }
      if (tab === 'unread') {
        return (item.unread_count || 0) > 0
      }

      return true
    })
  }, [contacts, combinedEmployeeContacts, directoryContacts, search, tab, mode, selectedUnit, selectedStatus])

  // Total Unread Across All Conversations
  const totalUnreadCount = useMemo(() => {
    return filteredContacts.reduce((acc, item) => acc + (item.unread_count || 0), 0)
  }, [filteredContacts])

  // Separate Unread vs All Conversations for Sidebar
  const unreadContacts = useMemo(() => {
    return filteredContacts.filter((item) => (item.unread_count || 0) > 0)
  }, [filteredContacts])

  // Find index of first unread message in current conversation for Unread Divider
  const firstUnreadMessageIndex = useMemo(() => {
    if (!selectedContact) return -1
    return messages.findIndex((msg) => {
      const isIncoming = msg.sender_user_id === (selectedContact.user_id || selectedContact.id)
      return isIncoming && !msg.read_at
    })
  }, [messages, selectedContact])

  // Handle Send Message (Optimistic UI with 0ms Perceived Latency)
  const handleSend = useCallback(async (text, category = '', file = null) => {
    if ((!text || !text.trim()) && !file) return
    if (!selectedContact || sending) return

    let fullText = (text || '').trim()
    if (category) {
      fullText = `[Kategori: ${category}]\n${fullText}`
    }

    const targetUserId = selectedContact.user_id || selectedContact.id
    const tempId = 'msg_temp_' + Date.now()

    const tempAttachments = file ? [{
      id: 'temp_att_' + Date.now(),
      url: URL.createObjectURL(file),
      original_name: file.name,
      file_type: file.type.startsWith('image/') ? 'image' : 'file',
      formatted_size: (file.size / 1024 > 1024 ? (file.size / 1048576).toFixed(1) + ' MB' : (file.size / 1024).toFixed(0) + ' KB')
    }] : []

    const optimisticMsg = {
      id: tempId,
      sender_user_id: currentUserId || 'own_user',
      recipient_user_id: targetUserId,
      message: fullText,
      attachments: tempAttachments,
      created_at: new Date().toISOString(),
      is_own: true,
      read_at: null
    }

    setMessages((prev) => [...prev, optimisticMsg])
    setTimeout(scrollToBottom, 30)

    setSending(true)
    try {
      if (mode === 'parent') {
        await familyPortalService.sendMessage(targetUserId, childId, fullText, file)
      } else if (mode === 'employee') {
        await familyPortalService.sendEmployeeMessage(targetUserId, fullText, file)
      } else {
        const parentUserId = selectedContact.parent_user_id || targetUserId
        const studentId = selectedContact.student_id || childId
        await familyPortalService.sendTeacherMessage(parentUserId, studentId, fullText, file)
      }
      fetchMessages(true)
    } catch (err) {
      setError('Gagal mengirim pesan.')
      fetchMessages(true)
    } finally {
      setSending(false)
    }
  }, [selectedContact, sending, currentUserId, mode, childId, scrollToBottom, fetchMessages])

  // Handle Reaction Toggle
  const handleToggleReaction = async (messageId, reactionEmoji) => {
    try {
      await familyPortalService.addReaction(messageId, reactionEmoji)
      fetchMessages()
    } catch (err) {}
  }

  // Handle Create Group Conversation
  const handleCreateGroup = async (e) => {
    e.preventDefault()
    if (!groupName.trim() || selectedGroupParticipants.length === 0 || isCreatingGroup) return

    setIsCreatingGroup(true)
    try {
      const res = await familyPortalService.createGroupConversation(groupName.trim(), selectedGroupParticipants)
      if (res?.data) {
        setSelectedContact(res.data)
        setShowNewChatModal(false)
        setGroupName('')
        setSelectedGroupParticipants([])
        fetchContacts()
      }
    } catch (err) {
      alert('Gagal membuat grup percakapan.')
    } finally {
      setIsCreatingGroup(false)
    }
  }

  return (
    <div
      className={`flex flex-col overflow-hidden ${
        isPopup
          ? 'h-full w-full bg-white dark:bg-slate-900'
          : 'rounded-[22px] border border-emerald-500/20 bg-white shadow-xl dark:border-emerald-800/40 dark:bg-slate-900 min-h-[620px] lg:h-[720px]'
      }`}
    >
      {/* 1. MAIN CONTAINER HEADER WITH GRADIENT (Matching Reference UI) */}
      {!hideHeader && (
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 px-5 py-3.5 text-white shadow-md">
          <div className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-md border border-white/20 text-white shadow-inner">
                <MessageSquare className="h-5 w-5 text-emerald-100" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                  <span>Chat Antar Pegawai</span>
                </h2>
                <p className="text-xs font-medium text-emerald-100/90">
                  Ruang Diskusi Sekolah • Direct &amp; Group Perpesanan Terpadu
                </p>
              </div>
            </div>

            {/* Header Right Action Icons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Minimize Window"
              >
                <Minus className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title="Tutup"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN WORKSPACE GRID LAYOUT (2 Columns: Left = Contacts List & Filters, Right = Chat Page) */}
      <div
        className={`grid flex-1 min-h-0 overflow-hidden ${
          isPopup ? 'grid-cols-1 md:grid-cols-[330px_1fr] h-full' : 'grid-cols-1 md:grid-cols-[340px_1fr]'
        }`}
      >
        {/* LEFT SIDEBAR: SEARCH & CONVERSATION LIST (Column 1) */}
        <aside
          className={`flex flex-col border-r border-slate-200/80 dark:border-slate-800 h-full min-h-0 overflow-hidden ${
            mobileDetailOpen ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* SEARCH BAR, FILTERS & TABS TOOLBAR IN COLUMN 1 (Zero Shifting) */}
          <div className="p-3 border-b border-slate-200/80 dark:border-slate-800 space-y-2.5 bg-white dark:bg-slate-900 shrink-0">
            {/* ROW 1: SEARCH INPUT & RESET BUTTON */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    tab === 'directory'
                      ? 'Cari nama, NIP/NIY, unit...'
                      : tab === 'kepsek'
                      ? 'Cari Kepsek...'
                      : tab === 'divisi_pendidikan'
                      ? 'Cari Div. Pendidikan...'
                      : 'Cari percakapan...'
                  }
                  className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50/80 pl-9 pr-3 text-xs font-medium outline-none focus:border-emerald-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {selectedUnit !== 'all' || selectedStatus !== 'all' || search.trim() !== '' ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedUnit('all')
                    setSelectedStatus('all')
                    setSearch('')
                  }}
                  className="flex h-9 items-center gap-1 rounded-xl border border-amber-500/40 bg-amber-50 px-2.5 text-xs font-bold text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300 shadow-2xs transition cursor-pointer shrink-0"
                  title="Reset Filter"
                >
                  <Filter className="h-3.5 w-3.5" />
                  <span className="text-[11px]">Reset</span>
                </button>
              ) : null}
            </div>

            {/* ROW 2: UNIT & STATUS FILTER DROPDOWNS (2 Equal Columns - ZERO SHIFTING) */}
            <div className="grid grid-cols-2 gap-2">
              <select
                value={selectedUnit}
                onChange={(e) => {
                  const val = e.target.value
                  setSelectedUnit(val)
                  fetchContacts(search, val, selectedStatus)
                }}
                className="h-8 w-full rounded-xl border border-slate-200/90 bg-slate-50/80 px-2 text-[11px] font-bold text-slate-700 shadow-2xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer truncate"
              >
                <option value="all">Semua Unit</option>
                {availableUnits.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => {
                  const val = e.target.value
                  setSelectedStatus(val)
                  fetchContacts(search, selectedUnit, val)
                }}
                className="h-8 w-full rounded-xl border border-slate-200/90 bg-slate-50/80 px-2 text-[11px] font-bold text-slate-700 shadow-2xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer truncate"
              >
                <option value="all">Status: Semua</option>
                <option value="online">Status: Online</option>
                <option value="busy">Status: Sibuk</option>
                <option value="offline">Status: Offline</option>
              </select>
            </div>

            {/* ROW 3: CATEGORY TABS PILLS */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5 select-none">
              {mode === 'teacher' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setTab('all')}
                    className={`rounded-lg px-3 py-1 text-[11px] font-extrabold transition cursor-pointer whitespace-nowrap ${
                      tab === 'all'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Semua Orang Tua
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab('unread')}
                    className={`rounded-lg px-3 py-1 text-[11px] font-extrabold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      tab === 'unread'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <span>Belum Dibaca</span>
                    {totalUnreadCount > 0 && (
                      <span className="rounded-full bg-rose-500 px-1.5 py-0.2 text-[9px] font-black text-white">
                        {totalUnreadCount}
                      </span>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setTab('percakapan')}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition cursor-pointer whitespace-nowrap ${
                      tab === 'percakapan'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Percakapan
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab('directory')}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition cursor-pointer whitespace-nowrap ${
                      tab === 'directory'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Pegawai
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab('kepsek')}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition cursor-pointer whitespace-nowrap ${
                      tab === 'kepsek'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Kepsek
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab('divisi_pendidikan')}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition cursor-pointer whitespace-nowrap ${
                      tab === 'divisi_pendidikan'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    Divisi
                  </button>

                  <button
                    type="button"
                    onClick={() => setTab('unread')}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-extrabold transition cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                      tab === 'unread'
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <span>Belum Dibaca</span>
                    {totalUnreadCount > 0 && (
                      <span className="rounded-full bg-blue-500 px-1 py-0.2 text-[9px] font-black text-white">
                        {totalUnreadCount}
                      </span>
                    )}
                  </button>
                </>
              )}
            </div>

            {/* ROW 4: TOTAL COUNTER SUMMARY */}
            <div className="flex items-center justify-between text-[10px] font-extrabold text-slate-400 uppercase tracking-wider px-0.5 pt-0.5">
              <span>
                {tab === 'directory'
                  ? 'Total Pegawai: '
                  : tab === 'kepsek'
                  ? 'Total Kepsek: '
                  : tab === 'divisi_pendidikan'
                  ? 'Total Div. Pendidikan: '
                  : tab === 'unread'
                  ? 'Total Belum Dibaca: '
                  : 'Total Percakapan: '}
                <strong className="font-black text-emerald-700 dark:text-emerald-400">{filteredContacts.length}</strong>
              </span>
            </div>
          </div>

          {/* CONVERSATION LIST WITH UNREAD & ALL SECTIONS */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3.5 scroll-smooth">
            {loading ? (
              <div className="space-y-2.5 p-1">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
                ))}
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <AlertCircle className="mx-auto mb-2 h-7 w-7 text-rose-500" />
                <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
                <button
                  type="button"
                  onClick={fetchContacts}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition shadow-xs cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Coba Lagi
                </button>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                <Inbox className="mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p className="font-bold">
                  {tab === 'directory'
                    ? 'Belum ada kontak pegawai'
                    : tab === 'kepsek'
                    ? 'Tidak ada kontak Kepala Sekolah'
                    : tab === 'divisi_pendidikan'
                    ? 'Tidak ada kontak Divisi Pendidikan'
                    : tab === 'unread'
                    ? 'Tidak ada pesan belum dibaca'
                    : 'Belum ada percakapan aktif'}
                </p>
                <p className="mt-1 text-[11px]">
                  {tab === 'directory'
                    ? 'Kontak pegawai yang dapat Anda hubungi akan tampil di sini.'
                    : tab === 'unread'
                    ? 'Semua pesan dari pegawai telah Anda baca.'
                    : 'Pilih pegawai dari daftar kontak untuk memulai percakapan.'}
                </p>
                {tab === 'percakapan' && directoryContacts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setTab('directory')}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition cursor-pointer"
                  >
                    <Users className="h-3.5 w-3.5" />
                    Lihat Daftar Pegawai ({directoryContacts.length})
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* SECTION 1: BELUM DIBACA (If any unread messages exist) */}
                {unreadContacts.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 px-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                      <span>BELUM DIBACA</span>
                      <span className="flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-blue-600 px-1 text-[9px] font-black text-white">
                        {unreadContacts.length}
                      </span>
                    </div>

                    {unreadContacts.map((contact) => {
                      const contactId = contact.user_id || contact.id
                      const isSelected = selectedContact && (selectedContact.user_id === contactId || selectedContact.id === contactId)
                      const isOnline = contact.is_online || contact.status === 'online'

                      return (
                        <div
                          key={'unread_' + contactId}
                          onClick={() => {
                            setSelectedContact(contact)
                            setMobileDetailOpen(true)
                          }}
                          className={`group relative flex w-full items-center justify-between gap-3 rounded-2xl p-2.5 transition-all duration-200 cursor-pointer ${
                            isSelected
                              ? 'border border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 dark:border-emerald-600 shadow-xs'
                              : 'bg-blue-50/60 hover:bg-blue-50 dark:bg-blue-950/20 border border-blue-100/70 dark:border-blue-900/30'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <div className="relative shrink-0">
                              {contact.type === 'group' ? (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white font-bold shadow-2xs">
                                  <Users className="h-4.5 w-4.5" />
                                </div>
                              ) : getAvatarUrl(contact) ? (
                                <img
                                  src={getAvatarUrl(contact)}
                                  alt={contact.name}
                                  className="h-10 w-10 rounded-full object-cover shadow-2xs ring-1 ring-slate-200"
                                  onError={(e) => {
                                    e.target.style.display = 'none'
                                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
                                  }}
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-xs font-black text-white shadow-2xs">
                                  {(contact.name || 'P')[0]}
                                </div>
                              )}
                              {contact.type !== 'group' && renderPresenceDot(contact.status, isOnline)}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="truncate text-xs font-black text-slate-900 dark:text-white">
                                  {contact.name}
                                </h4>
                                <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                  {formatMessageTime(contact.last_message_at)}
                                </span>
                              </div>
                              <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                                {contact.last_message || contact.subtitle || 'Belum ada pesan'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {contact.unread_count > 0 && (
                              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow-2xs">
                                {contact.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* SECTION 2: SEMUA PERCAKAPAN */}
                <div className="space-y-1.5 pt-1">
                  <div className="px-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    SEMUA PERCAKAPAN
                  </div>

                  {filteredContacts.map((contact) => {
                    const contactId = contact.user_id || contact.id
                    const isSelected = selectedContact && (selectedContact.user_id === contactId || selectedContact.id === contactId)
                    const isOnline = contact.is_online || contact.status === 'online'

                    const displayName = mode === 'teacher'
                      ? (contact.parent_name || contact.name || 'Orang Tua Murid')
                      : (contact.name || contact.nama_lengkap || contact.nama_panggilan || contact.nama || 'Pegawai')
                    const displaySub = mode === 'teacher'
                      ? (contact.last_message || (contact.student_name ? `Wali dari ${contact.student_name} (${contact.class_name || '-'})` : 'Pesan Orang Tua'))
                      : (contact.last_message || contact.subtitle || contact.position_name || contact.position?.name || contact.jabatan || 'Staf Pegawai')

                    return (
                      <div
                        key={'all_' + contactId}
                        onClick={() => {
                          setSelectedContact(contact)
                          setMobileDetailOpen(true)
                        }}
                        className={`group relative flex w-full items-center justify-between gap-3 rounded-2xl p-2.5 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'border border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 dark:border-emerald-600 shadow-2xs'
                            : 'border border-transparent bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div className="relative shrink-0">
                            {contact.type === 'group' ? (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-white font-bold shadow-2xs">
                                <Users className="h-4.5 w-4.5" />
                              </div>
                            ) : getAvatarUrl(contact) ? (
                              <img
                                src={getAvatarUrl(contact)}
                                alt={displayName}
                                className="h-10 w-10 rounded-full object-cover shadow-2xs ring-1 ring-slate-200"
                                onError={(e) => {
                                  e.target.style.display = 'none'
                                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
                                }}
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-xs font-black text-white shadow-2xs">
                                {displayName[0]}
                              </div>
                            )}
                            {contact.type !== 'group' && renderPresenceDot(contact.status, isOnline)}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="truncate text-xs font-black text-slate-900 dark:text-white">
                                {displayName}
                              </h4>
                              <span className="text-[10px] font-bold text-slate-400 shrink-0">
                                {formatMessageTime(contact.last_message_at)}
                              </span>
                            </div>

                            <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                              {displaySub}
                            </p>
                          </div>
                        </div>

                        {/* Right: Unread Badge or Read Checkmark */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {contact.unread_count > 0 ? (
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[10px] font-black text-white shadow-2xs">
                              {contact.unread_count}
                            </span>
                          ) : (
                            <CheckCheck className="h-4 w-4 text-emerald-600" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* SIDEBAR FOOTER: + PERCAKAPAN BARU BUTTON */}
          <div className="p-3 border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setShowNewChatModal(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-50/80 px-4 py-2.5 text-xs font-extrabold text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100/90 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 transition shadow-2xs cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Percakapan Baru
            </button>
          </div>
        </aside>

        {/* RIGHT AREA: ACTIVE CHAT DETAIL WORKSPACE (Column 2) */}
        <main
          className={`flex flex-col bg-white dark:bg-slate-900 h-full min-h-0 overflow-hidden ${
            mobileDetailOpen ? 'flex' : 'hidden md:flex'
          }`}
        >
          {selectedContact ? (
            <>
              {/* CHAT DETAIL HEADER */}
              <div className="flex items-center justify-between border-b border-slate-200/80 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 shadow-2xs shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setMobileDetailOpen(false)}
                    className={`rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 ${
                      isPopup ? 'flex' : 'lg:hidden'
                    }`}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  <div className="relative">
                    {selectedContact.type === 'group' ? (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-700 text-white font-bold shadow-2xs">
                        <Users className="h-5 w-5" />
                      </div>
                    ) : getAvatarUrl(selectedContact) ? (
                      <img
                        src={getAvatarUrl(selectedContact)}
                        alt={selectedContact.name}
                        className="h-10 w-10 rounded-full object-cover shadow-2xs ring-1 ring-slate-200"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
                        }}
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 text-xs font-black text-white shadow-2xs">
                        {(selectedContact.name || 'P')[0]}
                      </div>
                    )}
                    {selectedContact.type !== 'group' && renderPresenceDot(selectedContact.status, selectedContact.is_online || selectedContact.status === 'online')}
                  </div>

                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span>{mode === 'teacher' ? (selectedContact.parent_name || selectedContact.name || 'Orang Tua Murid') : (selectedContact.name || selectedContact.nama_lengkap || 'Pegawai')}</span>
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {selectedContact.type === 'group'
                        ? `${selectedContact.members_count || selectedContact.participants?.length || 1} anggota`
                        : mode === 'teacher'
                          ? (selectedContact.student_name ? `Wali dari ${selectedContact.student_name} • ${selectedContact.class_name || '-'}` : (selectedContact.role_label || 'Pesan Orang Tua'))
                          : `${selectedContact.position_name || selectedContact.role || 'Staf Pegawai'} ${selectedContact.unit_name ? '• ' + selectedContact.unit_name : ''}`}
                    </p>
                  </div>
                </div>

                {/* Header Action Icons */}
                <div className="flex items-center gap-1">
                  <button type="button" className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" title="Cari dalam chat">
                    <Search className="h-4.5 w-4.5" />
                  </button>
                  <button type="button" className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" title="Panggilan Suara">
                    <Phone className="h-4.5 w-4.5" />
                  </button>
                  <button type="button" className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" title="Panggilan Video">
                    <Video className="h-4.5 w-4.5" />
                  </button>
                  <button type="button" className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                    <MoreVertical className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              {/* PINNED ANNOUNCEMENT BANNER (Matching Reference UI) */}
              {showAnnouncement && selectedContact.announcement && (
                <div className="mx-4 mt-3 bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-2.5 px-3.5 flex items-center justify-between gap-3 text-xs text-emerald-950 dark:text-emerald-200 font-medium shadow-2xs select-none shrink-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <Pin className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="truncate text-slate-700 dark:text-slate-300 font-medium">
                      <strong className="font-extrabold text-emerald-900 dark:text-emerald-200">Pengumuman:</strong> {selectedContact.announcement}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAnnouncement(false)}
                    className="ml-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200 px-3 py-1 text-[11px] font-bold shrink-0 transition cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              )}

              {/* CHAT MESSAGES STREAM */}
              <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 scroll-smooth">
                {/* Day Divider */}
                <div className="flex items-center justify-center my-3">
                  <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                    — Hari ini —
                  </span>
                </div>

                {messagesLoading ? (
                  <div className="flex min-h-[200px] items-center justify-center">
                    <RefreshCw className="h-6 w-6 animate-spin text-emerald-600" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="my-12 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      <Sparkles className="h-6 w-6" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Mulai percakapan santun &amp; produktif
                    </h4>
                    <p className="mx-auto mt-1 max-w-sm text-[11px] text-slate-400">
                      Tulis pesan di bawah untuk memulai koordinasi pekerjaan atau diskusi internal.
                    </p>
                  </div>
                ) : (
                  messages.map((msg, index) => {
                    const targetUserId = selectedContact?.user_id || selectedContact?.id
                    const isOwn = Boolean(
                      msg.is_own ||
                      (currentUserId && String(msg.sender_user_id) === String(currentUserId)) ||
                      (targetUserId && String(msg.sender_user_id) !== String(targetUserId))
                    )
                    const senderName = isOwn ? 'Anda' : (msg.sender_name || selectedContact?.name || 'Pengirim')
                    const isFirstUnread = Boolean(msg.is_unread || index === firstUnreadMessageIndex)
                    const timeFormatted = formatMessageTime(msg.created_at || msg.created_at_time)

                    return (
                      <ChatMessageBubble
                        key={msg.id || index}
                        msg={msg}
                        isOwn={isOwn}
                        senderName={senderName}
                        isFirstUnread={isFirstUnread}
                        timeFormatted={timeFormatted}
                        onImageClick={(url, name) => setLightboxMedia({ url, name })}
                      />
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* 4. BOTTOM MESSAGE COMPOSER (Isolated State: Zero Re-render Lag while Typing) */}
              <ChatMessageComposer
                onSend={handleSend}
                sending={sending}
                totalUnreadCount={totalUnreadCount}
              />
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-slate-400">
              <MessageSquare className="mb-3 h-12 w-12 text-slate-300 dark:text-slate-600" />
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Pilih Percakapan
              </h3>
              <p className="mt-1 max-w-xs text-xs text-slate-400">
                Pilih pegawai atau staf di sebelah kiri untuk membuka pesan.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* MODAL: + PERCAKAPAN BARU (Direct or Group Chat) */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="h-4 w-4 text-emerald-600" /> Buat Percakapan / Grup Baru
              </h3>
              <button onClick={() => setShowNewChatModal(false)} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Grup (Opsional jika Chat 1-on-1):
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Contoh: Rapat Divisi Pendidikan"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilih Anggota Pegawai:
                </label>
                <div className="max-h-64 overflow-y-auto rounded-xl border border-slate-200 p-2 dark:border-slate-800 space-y-1 scroll-smooth">
                  {directoryContacts.map((emp) => {
                    const empId = emp.user_id || emp.id
                    const isChecked = selectedGroupParticipants.includes(empId)

                    return (
                      <div
                        key={empId}
                        onClick={() => {
                          if (!groupName.trim()) {
                            // Direct Chat
                            setSelectedContact(emp)
                            setShowNewChatModal(false)
                            setMobileDetailOpen(true)
                          } else {
                            // Toggle for Group
                            setSelectedGroupParticipants((prev) =>
                              prev.includes(empId) ? prev.filter((id) => id !== empId) : [...prev, empId]
                            )
                          }
                        }}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 ${
                          isChecked ? 'bg-emerald-50 dark:bg-emerald-950/40' : ''
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{emp.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{emp.position_name || 'Staf Pegawai'}</p>
                        </div>
                        {groupName.trim() && (
                          <input type="checkbox" checked={isChecked} onChange={() => {}} className="accent-emerald-600" />
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
                >
                  Batal
                </button>
                {groupName.trim() && (
                  <button
                    type="submit"
                    disabled={selectedGroupParticipants.length === 0 || isCreatingGroup}
                    className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 disabled:opacity-40 cursor-pointer"
                  >
                    Buat Grup
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Image Lightbox Modal */}
      {lightboxMedia && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setLightboxMedia(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-slate-950 p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-2 text-white border-b border-white/10">
              <span className="text-xs font-bold truncate max-w-xs">{lightboxMedia.name || 'Pratinjau Foto'}</span>
              <div className="flex items-center gap-2">
                <a
                  href={lightboxMedia.url}
                  download={lightboxMedia.name}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 rounded-lg hover:bg-white/10 text-white transition"
                  title="Unduh"
                >
                  <Download className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setLightboxMedia(null)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white transition cursor-pointer"
                  title="Tutup"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center p-2">
              <img
                src={lightboxMedia.url}
                alt={lightboxMedia.name}
                className="max-h-[75vh] max-w-full rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
