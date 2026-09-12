import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, User, Calendar, Tag, Search, Filter } from 'lucide-react'
import { Button } from '../tailgrids/core/button'
import { Badge } from '../tailgrids/core/badge'
import { Card } from '../tailgrids/core/card'
import api from '../../services/api'

const formatDate = (val) => val ? new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium' }).format(new Date(val)) : '-'

const CATEGORY_MAP = [
  { id: 'Semua', label: 'Semua', pastelColor: 'bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300' },
  { id: 'Akademik', label: 'Akademik', pastelColor: 'bg-blue-100/90 text-blue-700 hover:bg-blue-600 hover:text-white dark:bg-blue-950/60 dark:text-blue-300' },
  { id: 'Perilaku', label: 'Perilaku', pastelColor: 'bg-purple-100/90 text-purple-700 hover:bg-purple-600 hover:text-white dark:bg-purple-950/60 dark:text-purple-300' },
  { id: 'Kedisiplinan', label: 'Kedisiplinan', pastelColor: 'bg-sky-100/90 text-sky-700 hover:bg-sky-500 hover:text-white dark:bg-sky-950/60 dark:text-sky-300' },
  { id: 'Prestasi', label: 'Prestasi', pastelColor: 'bg-rose-100/90 text-rose-700 hover:bg-rose-600 hover:text-white dark:bg-rose-950/60 dark:text-rose-300' },
  { id: 'Konseling', label: 'Konseling', pastelColor: 'bg-violet-100/90 text-violet-700 hover:bg-violet-600 hover:text-white dark:bg-violet-950/60 dark:text-violet-300' },
  { id: 'Tahfizh', label: 'Tahfizh', pastelColor: 'bg-emerald-100/90 text-emerald-700 hover:bg-emerald-600 hover:text-white dark:bg-emerald-950/60 dark:text-emerald-300' },
  { id: 'Ibadah', label: 'Ibadah', pastelColor: 'bg-amber-100/90 text-amber-700 hover:bg-amber-500 hover:text-white dark:bg-amber-950/60 dark:text-amber-300' },
  { id: 'Kesehatan', label: 'Kesehatan', pastelColor: 'bg-indigo-100/90 text-indigo-700 hover:bg-indigo-600 hover:text-white dark:bg-indigo-950/60 dark:text-indigo-300' },
]

export default function TeacherCommentsWorkspace({ comments = [], loading = false, childId, isParent = false, onSigned }) {
  const [selectedCategory, setSelectedCategory] = useState('Semua')
  const [search, setSearch] = useState('')
  const [replyingId, setReplyingId] = useState(null)
  const [followUp, setFollowUp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const safeComments = useMemo(() => {
    if (Array.isArray(comments)) return comments
    if (comments && Array.isArray(comments.data)) return comments.data
    return []
  }, [comments])

  const filteredComments = useMemo(() => {
    return safeComments.filter((item) => {
      const note = item.content || item.note || item.notes || item.catatan || ''
      const teacher = item.teacher?.full_name || item.teacher?.nama_lengkap || item.teacher?.name || ''
      const category = item.category || item.kategori || 'Akademik'

      const categoryMatch = selectedCategory === 'Semua' || category.toLowerCase() === selectedCategory.toLowerCase()
      const searchMatch = !search || note.toLowerCase().includes(search.toLowerCase()) || teacher.toLowerCase().includes(search.toLowerCase())

      return categoryMatch && searchMatch
    })
  }, [safeComments, selectedCategory, search])

  const signNote = async (item) => {
    if (!childId || submitting) return
    setSubmitting(true)
    setSubmitError('')
    try {
      await api.post(`/portal/student-notes/${item.id}/sign`, {
        child_id: childId,
        ...(followUp.trim() ? { follow_up: followUp.trim() } : {}),
      })
      setReplyingId(null)
      setFollowUp('')
      await onSigned?.()
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Catatan belum berhasil ditandatangani.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header Toolbar Card */}
      <Card className="p-5 border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 rounded-[20px]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Buku Penghubung & Catatan Guru</h2>
            <p className="mt-0.5 text-xs text-slate-500">Catatan resmi komunikasi dan pemantauan perkembangan siswa antara guru, wali kelas, dan orang tua.</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari catatan / nama guru..."
              className="h-9 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
            />
          </div>
        </div>

        {/* Category Filters TailGrids Buttons */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {CATEGORY_MAP.map(({ id, label, pastelColor }) => {
            const isActive = selectedCategory === id
            return (
              <Button
                key={id}
                type="button"
                variant={isActive ? 'primary' : 'ghost'}
                appearance={isActive ? 'fill' : 'outline'}
                size="xs"
                onClick={() => setSelectedCategory(id)}
                className={`cursor-pointer transition-all duration-200 font-bold shrink-0 ${
                  isActive
                    ? '!bg-[#0E5C44] !text-white shadow-md shadow-emerald-900/20 ring-2 ring-emerald-500/40 scale-[1.02]'
                    : `${pastelColor} border-transparent`
                }`}
              >
                {label}
              </Button>
            )
          })}
        </div>
      </Card>

      {/* List Komentar Cards */}
      <div className="space-y-4">
        {filteredComments.map((item, idx) => (
          <motion.div
            key={item.id || idx}
            whileHover={{ y: -2 }}
          >
            <Card className="p-5 border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 rounded-[20px]">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    <User className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.teacher?.full_name || item.teacher?.nama_lengkap || item.teacher?.name || 'Guru Pengampu'}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {item.teacher?.subject?.name || item.subject?.name || 'Guru Pelajaran / Wali Kelas'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge color="success" size="sm" className="font-extrabold">
                    {item.category || item.kategori || 'Akademik'}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {formatDate(item.date || item.created_at)}
                  </span>
                </div>
              </div>

              <h3 className="mt-4 text-sm font-black text-slate-900 dark:text-white">{item.title || 'Catatan Guru'}</h3>
              <p className="mt-2 text-xs leading-6 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                {item.content || item.note || item.notes || item.catatan || 'Tidak ada isi catatan.'}
              </p>
              {item.follow_up && <div className="mt-3 rounded-xl bg-slate-50 p-3 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"><span className="font-black">Tindak lanjut orang tua:</span> {item.follow_up}</div>}
              {isParent && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                <Badge color={item.signature_status === 'signed' ? 'success' : item.signature_status === 'signed_updated' ? 'warning' : 'gray'} size="sm">
                  {item.signature_status === 'signed' ? 'Sudah ditandatangani' : item.signature_status === 'signed_updated' ? 'Perlu tanda tangan ulang' : 'Belum ditandatangani'}
                </Badge>
                {item.signature_status !== 'signed' && <Button type="button" size="xs" onClick={() => { setReplyingId(item.id); setFollowUp(item.follow_up || ''); setSubmitError('') }}>Tanggapi & Tanda Tangan</Button>}
              </div>}
              {replyingId === item.id && <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900 dark:bg-emerald-950/20">
                <textarea value={followUp} onChange={(e) => setFollowUp(e.target.value)} maxLength={5000} rows={3} placeholder="Tulis tindak lanjut orang tua (opsional)..." className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-900" />
                {submitError && <p className="mt-2 text-xs font-bold text-rose-600">{submitError}</p>}
                <div className="mt-3 flex justify-end gap-2"><Button type="button" variant="ghost" size="xs" disabled={submitting} onClick={() => { setReplyingId(null); setFollowUp('') }}>Batal</Button><Button type="button" size="xs" disabled={submitting} onClick={() => signNote(item)}>{submitting ? 'Menyimpan...' : 'Setujui & Tanda Tangan'}</Button></div>
              </div>}
            </Card>
          </motion.div>
        ))}

        {!filteredComments.length && (
          <Card className="p-16 text-center text-xs text-slate-400 border border-dashed border-slate-300 dark:border-slate-700 rounded-[20px]">
            <MessageCircle className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            Belum ada catatan buku penghubung untuk kategori ini.
          </Card>
        )}
      </div>
    </div>
  )
}
