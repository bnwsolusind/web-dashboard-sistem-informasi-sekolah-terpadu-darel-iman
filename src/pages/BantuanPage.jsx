import React, { useState, useMemo, useEffect, useCallback } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import { Link, useNavigate } from 'react-router-dom'
import {
  HelpCircle,
  Search,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  FileText,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Send,
  Mail,
  Clock,
  UserCheck,
  GraduationCap,
  Users,
  Calendar,
  Download,
  AlertCircle,
  LifeBuoy,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  X,
  Lock,
  Layers,
  Award,
} from 'lucide-react'
import AppBreadcrumb from '../components/app/AppBreadcrumb'
import { resolveFoundationName } from '../utils/printHelper'
import AppModal from '../components/app/AppModal'
import { useToast } from '../components/app/ToastProvider'
import { usePengaturanStore, INITIAL_FAQS, INITIAL_MANUALS } from '../stores/pengaturanStore'
import { helpService } from '../services/helpService'

// CATEGORY TOPICS CONFIG
const BASE_CATEGORIES = [
  {
    id: 'all',
    name: 'Semua Panduan',
    icon: Layers,
    color: 'from-emerald-500 to-teal-600',
    desc: 'Seluruh koleksi dokumentasi & FAQ sistem',
  },
  {
    id: 'Kesiswaan',
    name: 'Kesiswaan & Murid',
    icon: GraduationCap,
    color: 'from-blue-500 to-indigo-600',
    desc: 'Data siswa, rombel, mutasi & alumni',
  },
  {
    id: 'Kepegawaian',
    name: 'SDM & Kepegawaian',
    icon: Users,
    color: 'from-purple-500 to-pink-600',
    desc: 'Data guru, staf, SK & hak akses',
  },
  {
    id: 'Akademik & LMS',
    name: 'Akademik & LMS',
    icon: BookOpen,
    color: 'from-amber-500 to-orange-600',
    desc: 'Modul ajar, CBT, bank soal & rapor',
  },
  {
    id: 'Absensi Digital',
    name: 'Absensi & Gerbang',
    icon: Calendar,
    color: 'from-cyan-500 to-blue-600',
    desc: 'Tap NFC gerbang, sholat & izin walas',
  },
  {
    id: 'Tahfizh & Mutabaah',
    name: 'Tahfizh & Mutabaah',
    icon: Award,
    color: 'from-emerald-600 to-green-700',
    desc: 'Setoran ziyadah, murajaah & jurnal',
  },
  {
    id: 'Keamanan & Akun',
    name: 'Keamanan & Akun',
    icon: ShieldCheck,
    color: 'from-rose-500 to-red-600',
    desc: 'Reset password, sesi & perizinan',
  },
]

export default function BantuanPage() {
  const navigate = useNavigate()
  const toast = useToast()

  // Settings and dynamic state
  const settings = usePengaturanStore((state) => state.pengaturan)
  const foundationName = resolveFoundationName(settings)
  const [dbFaqs, setDbFaqs] = useState([])
  const [loadingFaqs, setLoadingFaqs] = useState(true)

  const activeManuals = useMemo(() => {
    return settings.custom_manuals || INITIAL_MANUALS
  }, [settings.custom_manuals])

  const loadFaqs = useCallback(async () => {
    try {
      setLoadingFaqs(true)
      const res = await helpService.getFaqs()
      const list = Array.isArray(res?.faqs) ? res.faqs : []
      setDbFaqs(list.length > 0 ? list : (settings.custom_faqs || INITIAL_FAQS))
    } catch (_err) {
      setDbFaqs(settings.custom_faqs || INITIAL_FAQS)
    } finally {
      setLoadingFaqs(false)
    }
  }, [settings.custom_faqs])

  useEffect(() => {
    loadFaqs()
  }, [loadFaqs])

  const activeFaqs = dbFaqs

  // Dynamic Categories with Counts
  const categories = useMemo(() => {
    return BASE_CATEGORIES.map((cat) => {
      if (cat.id === 'all') {
        return { ...cat, count: activeFaqs.length }
      }
      return {
        ...cat,
        count: activeFaqs.filter((f) => f.category === cat.id).length,
      }
    })
  }, [activeFaqs])

  // State Management
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [openFaqId, setOpenFaqId] = useState('faq-1')
  const [helpfulVotes, setHelpfulVotes] = useState({})

  // Modal Ticket State
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false)
  const [ticketForm, setTicketForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Guru',
    category: 'Akademik & LMS',
    priority: 'Sedang',
    subject: '',
    description: '',
  })
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false)

  // Filtered FAQs Logic
  const filteredFaqs = useMemo(() => {
    return activeFaqs.filter((faq) => {
      const matchCategory = selectedCategory === 'all' || faq.category === selectedCategory

      const query = searchQuery.trim().toLowerCase()
      if (!query) return matchCategory

      const matchTitle = (faq.question || '').toLowerCase().includes(query)
      const matchAnswer = (faq.answer || '').toLowerCase().includes(query)
      const tagsList = Array.isArray(faq.tags) ? faq.tags : (faq.tags || '').split(',')
      const matchTags = tagsList.some((tag) => String(tag).toLowerCase().includes(query))

      return matchCategory && (matchTitle || matchAnswer || matchTags)
    })
  }, [activeFaqs, searchQuery, selectedCategory])

  // Voting handler
  const handleVote = async (faqId, voteType) => {
    if (helpfulVotes[faqId]) {
      toast.info('Anda sudah memberikan penilaian untuk panduan ini.')
      return
    }
    setHelpfulVotes((prev) => ({ ...prev, [faqId]: voteType }))
    try {
      await helpService.voteFaq(faqId, voteType)
      if (voteType === 'up') {
        toast.success('Terima kasih! Umpan balik Anda telah tersimpan.')
      } else {
        toast.warning('Terima kasih. Masukan Anda akan kami evaluasi untuk pembaruan panduan.')
      }
    } catch (_err) {
      // silent fallback
    }
  }

  // Handle Ticket Form Submit
  const handleTicketSubmit = async (e) => {
    e.preventDefault()
    if (!ticketForm.subject.trim() || !ticketForm.description.trim()) {
      toast.error('Mohon lengkapi Judul Kendala dan Deskripsi Tiket Bantuan.')
      return
    }

    try {
      setIsSubmittingTicket(true)
      const res = await helpService.submitTicket(ticketForm)
      const ticketNum = res?.data?.ticket_number || 'TKT-SEKOLAH'
      setIsTicketModalOpen(false)
      toast.success(`Tiket Bantuan #${ticketNum} berhasil dibuat! Tim Helpdesk IT ${foundationName} akan menghubungi Anda via WhatsApp/Email.`)
      setTicketForm({
        name: '',
        email: '',
        phone: '',
        role: 'Guru',
        category: 'Akademik & LMS',
        priority: 'Sedang',
        subject: '',
        description: '',
      })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Gagal mengirimkan tiket bantuan.')
    } finally {
      setIsSubmittingTicket(false)
    }
  }

  // Handle Download PDF
  const handleDownloadPdf = (title) => {
    toast.success(`Mengunduh ${title}...`)
  }

  return (
    <div className="min-h-screen bg-slate-50/70 p-4 sm:p-6 lg:p-8 dark:bg-[#0B1120] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* 1. App Breadcrumb */}
        <AppBreadcrumb items={[{ label: 'Bantuan & Panduan' }]} />

        {/* 2. Modern Hero Header Component (HeroUI Spec) */}
        <div className="relative overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-600/15 p-6 sm:p-8 shadow-md shadow-emerald-500/10 dark:border-emerald-600/40 dark:bg-gradient-to-r dark:from-emerald-950/70 dark:via-teal-950/50 dark:to-slate-900">
          {/* Ambient Glow Effects */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-gradient-to-br from-emerald-500/40 via-teal-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-gradient-to-tr from-teal-500/30 via-emerald-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/30">
                  <LifeBuoy className="h-5 w-5 stroke-[2.2]" />
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-sm">
                  <Sparkles className="h-3.5 w-3.5" /> Dareliman Edu Support Hub
                </span>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                  {settings.school_name || foundationName}
                </span>
              </div>

              <h1 className="text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl text-slate-900 dark:text-white">
                Pusat Bantuan & Panduan Pengguna
              </h1>

              <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                Dokumentasi terpadu, petunjuk penggunaan modul sekolah, solusi permasalahan umum, serta layanan pengajuan tiket support tim IT {foundationName}.
              </p>
            </div>

            {/* Action Badges / Support Quick Card */}
            <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setIsTicketModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/30 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] transition-all duration-200 cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 stroke-[2.2]" />
                <span>Kirim Tiket Support</span>
              </button>

              <a
                href="https://wa.me/628116660000?text=Halo%20Helpdesk%20IT%20Dareliman%20Edu,%20saya%20butuh%20bantuan"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-500/40 bg-white/80 px-5 py-3 text-xs sm:text-sm font-bold text-emerald-800 shadow-sm hover:bg-emerald-50 hover:text-emerald-900 dark:bg-slate-800/80 dark:text-emerald-300 dark:hover:bg-slate-800 active:scale-[0.98] transition-all duration-200"
              >
                <PhoneCall className="h-4 w-4 stroke-[2.2] text-emerald-600 dark:text-emerald-400" />
                <span>WhatsApp Helpdesk</span>
                <ExternalLink className="h-3 w-3 opacity-60" />
              </a>
            </div>
          </div>

          {/* Real-time Hero Search Bar */}
          <div className="relative mt-6 z-10">
            <div className="relative flex items-center">
              <Search className="absolute left-4 h-5 w-5 text-emerald-600 dark:text-emerald-400 pointer-events-none stroke-[2.2]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari topik bantuan (cth: reset password, absensi sholat, cetak rapor, setoran tahfizh, mutasi)..."
                className="w-full rounded-2xl border-2 border-emerald-500/30 bg-white/90 py-3.5 pl-12 pr-10 text-sm font-medium text-slate-800 shadow-lg shadow-emerald-500/5 transition-all placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/20 dark:border-emerald-600/40 dark:bg-slate-900/90 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-emerald-400 dark:focus:bg-slate-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick Search Suggestions */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
                <Sparkles className="h-3 w-3" /> Pencarian Cepat:
              </span>
              {['Reset Password', 'Absensi Sholat', 'Setoran Ziyadah', 'Cetak Rapor LMS', 'Verifikasi Izin', 'Mutasi Siswa'].map((keyword) => (
                <button
                  key={keyword}
                  type="button"
                  onClick={() => setSearchQuery(keyword)}
                  className="rounded-lg border border-emerald-500/25 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-600/30 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-emerald-950/60 dark:hover:text-emerald-300 transition-all cursor-pointer"
                >
                  {keyword}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Category Topic Cards Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
              <span>Kategori Topik & Panduan Modul</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Pilih kategori untuk memfilter FAQ
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const IconComp = cat.icon
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200 cursor-pointer ${isSelected
                    ? 'border-emerald-500 bg-emerald-50/80 shadow-md shadow-emerald-500/10 dark:border-emerald-500 dark:bg-emerald-950/40'
                    : 'border-slate-200/90 bg-white hover:border-emerald-400 hover:bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/90 dark:hover:border-emerald-600 dark:hover:bg-slate-800/80'
                    }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${cat.color} text-white shadow-sm group-hover:scale-105 transition-transform duration-200`}
                      >
                        <IconComp className="h-5 w-5 stroke-[2.2]" />
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                      >
                        {cat.count} Topik
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center text-xs font-bold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-1 transition-transform">
                    <span>Lihat Panduan</span>
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* 4. Interactive FAQ Accordion Section */}
        <div className="rounded-[22px] border-2 border-emerald-500/25 bg-white p-5 sm:p-6 shadow-md shadow-emerald-500/5 dark:border-emerald-600/35 dark:bg-[#1B2433] space-y-6">
          {/* FAQ Header & Filter Bar */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-emerald-500/15 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
                <span>Pertanyaan Sering Ditanyakan (FAQ)</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Menampilkan {filteredFaqs.length} artikel jawaban teknis dan solusi penggunaan sistem.
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Items List */}
          {filteredFaqs.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
                <AlertCircle className="h-7 w-7 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                Tidak ada FAQ yang cocok dengan "{searchQuery}"
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Coba gunakan kata kunci lain atau kirimkan tiket bantuan jika Anda tidak menemukan solusi yang dicari.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reset Pencarian</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFaqs.map((faq) => {
                const isOpen = openFaqId === faq.id
                return (
                  <div
                    key={faq.id}
                    className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden ${isOpen
                      ? 'border-emerald-500/50 bg-emerald-50/30 shadow-sm dark:border-emerald-500/40 dark:bg-emerald-950/20'
                      : 'border-slate-200/80 bg-white hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900/80 dark:hover:border-slate-700'
                      }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                      className="w-full flex items-center justify-between p-4 sm:p-5 text-left gap-4 cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${isOpen
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                        >
                          ?
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
                              {faq.category}
                            </span>
                          </div>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            {faq.question}
                          </h3>
                        </div>
                      </div>

                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-transform duration-200 ${isOpen ? 'bg-emerald-500 text-white rotate-180' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                      >
                        <ChevronDown className="h-4 w-4 stroke-[2.5]" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-emerald-500/15 p-4 sm:p-5 pt-3 bg-white/80 dark:bg-slate-900/90 space-y-4">
                        <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                          {faq.answer}
                        </div>

                        {/* Action Link & Feedback */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-slate-200/60 dark:border-slate-800">
                          {faq.actionUrl ? (
                            <button
                              type="button"
                              onClick={() => navigate(faq.actionUrl)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                            >
                              <span>{faq.actionLabel || 'Buka Halaman Modul'}</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          ) : (
                            <span />
                          )}

                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span>Apakah panduan ini membantu?</span>
                            <button
                              type="button"
                              onClick={() => handleVote(faq.id, 'up')}
                              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${helpfulVotes[faq.id] === 'up'
                                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold'
                                : 'border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
                                }`}
                            >
                              <ThumbsUp className="h-3.5 w-3.5" />
                              <span>Ya</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleVote(faq.id, 'down')}
                              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${helpfulVotes[faq.id] === 'down'
                                ? 'border-amber-500 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 font-bold'
                                : 'border-slate-200 hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800'
                                }`}
                            >
                              <ThumbsDown className="h-3.5 w-3.5" />
                              <span>Tidak</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* 5. Document Manual Downloads Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-600 dark:text-emerald-400 stroke-[2.2]" />
              <span>Buku Panduan & PDF Manual Pengguna</span>
            </h2>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Dokumen Resmi Dareliman Edu 2026
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeManuals.map((doc, idx) => (
              <div
                key={doc.id || idx}
                className="flex flex-col justify-between rounded-2xl border-2 border-emerald-500/20 bg-white p-5 shadow-sm hover:border-emerald-500/40 dark:border-emerald-600/30 dark:bg-[#1B2433] transition-all duration-200"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-extrabold text-red-700 dark:bg-red-950/80 dark:text-red-300">
                      <FileText className="h-3 w-3" /> {doc.format || 'PDF'} • {doc.size || '3.5 MB'}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                      {doc.version}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {doc.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {doc.desc}
                  </p>

                  <div className="pt-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Target: {doc.target}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    Unduh Dokumentasi
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(doc.title)}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Unduh PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Support Contacts & Layanan Direct Help Card */}
        <div className="rounded-[22px] border-2 border-emerald-500/30 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-6 text-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="lg:col-span-2 space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-500/30">
                <PhoneCall className="h-3.5 w-3.5" /> Layanan Bantuan Langsung Tim IT
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Masih Mengalami Kendala Operasional Dareliman Edu?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed w-full">
                Tim Support & Helpdesk IT {foundationName} siap membantu kendala teknis, pengurusan akun, perbaikan data master, dan konsultasi modul sekolah.
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald-400" />
                  <span>Senin - Sabtu (07.30 - 16.00 WIB)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-emerald-400" />
                  <span>{settings.email || (settings.website ? `support@${settings.website.replace(/^https?:\/\//, '')}` : '-')}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setIsTicketModalOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 active:scale-[0.98] transition-all cursor-pointer"
              >
                <MessageSquare className="h-4 w-4 stroke-[2.2]" />
                <span>Buat Tiket Support Baru</span>
              </button>

              <a
                href="https://wa.me/628116660000?text=Halo%20Helpdesk%20IT%20Dareliman%20Edu,%20saya%20butuh%20bantuan"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-sm font-bold text-emerald-300 hover:bg-slate-800 hover:text-emerald-200 transition-all"
              >
                <PhoneCall className="h-4 w-4 text-emerald-400" />
                <span>Hubungi WA Helpdesk IT</span>
              </a>
            </div>
          </div>
        </div>

        {/* 7. Modal Form Tiket Support */}
        <AppModal
          isOpen={isTicketModalOpen}
          onClose={() => setIsTicketModalOpen(false)}
          title="Kirim Tiket Support Bantuan IT"
          description={`Sampaikan kendala teknis atau pertanyaan Anda. Tim IT ${foundationName} akan merespons melalui WhatsApp atau email yang terdaftar.`}
          icon={LifeBuoy}
          maxWidth="max-w-xl"
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsTicketModalOpen(false)}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-red-700 px-4 py-2.5 text-xs font-black text-white shadow-md shadow-rose-950/20 hover:from-rose-600 hover:to-red-800 active:scale-95 transition-all cursor-pointer"
              >
                <span className="flex size-5 items-center justify-center rounded-lg bg-white/20">
                  <X className="size-3.5" strokeWidth={2.5} />
                </span>
                <span>Batal</span>
              </button>
              <button
                type="submit"
                form="support-ticket-form"
                disabled={isSubmittingTicket}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-700 px-5 py-2.5 text-xs font-black text-white shadow-md shadow-emerald-950/20 hover:from-emerald-600 hover:to-teal-800 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                <span className="flex size-5 items-center justify-center rounded-lg bg-white/20">
                  {isSubmittingTicket ? (
                    <RefreshCw className="size-3.5 animate-spin" />
                  ) : (
                    <Send className="size-3.5" strokeWidth={2.5} />
                  )}
                </span>
                <span>{isSubmittingTicket ? 'Mengirim Tiket...' : 'Kirim Tiket Support'}</span>
              </button>
            </div>
          }
        >
          <form id="support-ticket-form" onSubmit={handleTicketSubmit} className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masukkan nama Anda"
                  value={ticketForm.name}
                  onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  No. WhatsApp / HP *
                </label>
                <input
                  type="text"
                  required
                  placeholder="0812xxxxxxx"
                  value={ticketForm.phone}
                  onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Peran / Role Pengguna
                </label>
                <CustomSelect
                  value={ticketForm.role}
                  onChange={(e) => setTicketForm({ ...ticketForm, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="Guru">Guru Mata Pelajaran / Walas</option>
                  <option value="Musyrif">Musyrif / Guru Tahfizh</option>
                  <option value="TU / Admin">Staf TU / Operator IT</option>
                  <option value="Kepala Sekolah">Kepala Sekolah / Pengurus</option>
                  <option value="Orang Tua / Siswa">Orang Tua / Santri</option>
                </CustomSelect>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Kategori Kendala
                </label>
                <CustomSelect
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value })}
                  className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="Akademik & LMS">Akademik & LMS</option>
                  <option value="Absensi Digital">Absensi Digital & Gerbang</option>
                  <option value="Tahfizh & Mutabaah">Tahfizh & Mutabaah</option>
                  <option value="Keuangan & SPP">Keuangan & Administrasi</option>
                  <option value="Akun & Password">Akun & Password Sesi</option>
                  <option value="Lainnya">Lainnya</option>
                </CustomSelect>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Judul Kendala *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Tidak bisa akses menu input nilai rapor kelas 8A"
                value={ticketForm.subject}
                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Deskripsi Kendala Detail *
              </label>
              <textarea
                rows={4}
                required
                placeholder="Jelaskan kronologi kendala, pesan error yang muncul, atau halaman lokasi masalah..."
                value={ticketForm.description}
                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                className="w-full rounded-xl border border-slate-200/90 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </form>
        </AppModal>
      </div>
    </div>
  )
}
