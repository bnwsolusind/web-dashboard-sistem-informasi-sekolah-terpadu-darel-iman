import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Download, ExternalLink, FileText, Search, Video, Music, CheckCircle2, User } from 'lucide-react'
import { VideoEmbedPlayer, PdfDocumentViewer } from '../common/MateriMediaEmbed'

const cardStyle = 'rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900'

export default function MaterialsWorkspace({ materials = [], loading = false }) {
  const [search, setSearch] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [activeDetail, setActiveDetail] = useState(null)

  const safeMaterials = useMemo(() => {
    if (Array.isArray(materials)) return materials
    if (materials && Array.isArray(materials.data)) return materials.data
    return []
  }, [materials])

  const subjects = useMemo(() => {
    return Array.from(new Set(safeMaterials.map((m) => m.subject?.name || m.mata_pelajaran).filter(Boolean)))
  }, [safeMaterials])

  const types = useMemo(() => {
    return Array.from(new Set(safeMaterials.map((m) => m.tipe_materi || m.jenis_materi).filter(Boolean)))
  }, [safeMaterials])

  const filteredMaterials = useMemo(() => {
    return safeMaterials.filter((m) => {
      const title = m.judul || m.title || ''
      const content = m.konten || m.catatan || ''
      const subject = m.subject?.name || m.mata_pelajaran || ''
      const type = m.tipe_materi || m.jenis_materi || ''

      const searchMatch = !search || title.toLowerCase().includes(search.toLowerCase()) || content.toLowerCase().includes(search.toLowerCase())
      const subjectMatch = !selectedSubject || subject === selectedSubject
      const typeMatch = !selectedType || type === selectedType

      return searchMatch && subjectMatch && typeMatch
    })
  }, [safeMaterials, search, selectedSubject, selectedType])

  return (
    <div className="space-y-5">
      {/* Header Toolbar */}
      <div className={cardStyle}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Materi Pembelajaran</h2>
            <p className="mt-1 text-xs text-slate-500">Materi, modul, dan media pembelajaran publik yang telah diterbitkan guru.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari materi..."
                className="h-9 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>

            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">Semua Mapel</option>
              {subjects.map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs outline-none dark:border-slate-700 dark:bg-slate-800"
            >
              <option value="">Semua Jenis</option>
              {types.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Materi */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredMaterials.map((item, idx) => (
          <motion.article
            key={item.id || idx}
            whileHover={{ y: -3 }}
            className="flex flex-col rounded-[18px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <BookOpen className="h-5 w-5" />
              </span>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {item.tipe_materi || item.jenis_materi || 'Materi'}
              </span>
            </div>

            <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              {item.subject?.name || item.mata_pelajaran || 'Mata Pelajaran'}
            </p>
            <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">{item.judul || item.title}</h3>
            <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500">
              {item.konten || item.catatan || 'Materi pembelajaran dari guru pengampu.'}
            </p>

            <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-[11px] text-slate-400 dark:border-slate-800">
              <User className="h-3.5 w-3.5 text-slate-400" />
              <span>{item.guru?.nama_lengkap || item.teacher?.name || 'Guru'}</span>
            </div>

            {/* Media list / Download */}
            {(item.media || []).length > 0 && (
              <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                {item.media.map((med) => (
                  <a
                    key={med.id}
                    href={med.url_eksternal || med.path_file}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl bg-slate-50 p-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:bg-slate-800 dark:text-emerald-400"
                  >
                    <span className="truncate">{med.nama_file || 'Lampiran File'}</span>
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                ))}
              </div>
            )}

            <button
              onClick={() => setActiveDetail(item)}
              className="mt-auto pt-4 text-left text-xs font-bold text-[#0E5C44] hover:underline"
            >
              Baca Selengkapnya →
            </button>
          </motion.article>
        ))}

        {!filteredMaterials.length && (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            <BookOpen className="mx-auto mb-3 h-10 w-10 text-slate-300" />
            Belum ada materi pembelajaran yang memenuhi kriteria.
          </div>
        )}
      </div>

      {/* Modal Detail Materi */}
      {activeDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4">
          <div className="w-full max-w-3xl rounded-[18px] bg-white p-6 shadow-2xl dark:bg-slate-900 max-h-[85vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                  {activeDetail.subject?.name || activeDetail.mata_pelajaran}
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{activeDetail.judul || activeDetail.title}</h3>
              </div>
              <button
                onClick={() => setActiveDetail(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Video Embed if available */}
            {activeDetail.video && (
              <div className="my-4">
                <VideoEmbedPlayer
                  url={activeDetail.video}
                  title={`Video: ${activeDetail.judul || activeDetail.title}`}
                />
              </div>
            )}

            {/* PDF Embed if available */}
            {(activeDetail.file || (activeDetail.tipe_materi === 'dokumen' && activeDetail.path_file)) && (
              <div className="my-4">
                <PdfDocumentViewer
                  url={activeDetail.file || activeDetail.path_file}
                  title={`Dokumen: ${activeDetail.judul || activeDetail.title}`}
                  height="450px"
                />
              </div>
            )}

            <div className="my-4 space-y-4 text-xs leading-6 text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {activeDetail.konten || activeDetail.catatan || activeDetail.isi || 'Konten materi komplit.'}
            </div>

            {(activeDetail.media || []).length > 0 && (
              <div className="border-t border-slate-100 pt-4 dark:border-slate-800">
                <h4 className="mb-2 text-xs font-bold">Lampiran Media</h4>
                <div className="space-y-2">
                  {activeDetail.media.map((med) => (
                    <a
                      key={med.id}
                      href={med.url_eksternal || med.path_file}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-xs font-bold text-emerald-700 hover:bg-emerald-50 dark:bg-slate-800 dark:text-emerald-300"
                    >
                      <span>{med.nama_file || 'Media Pembelajaran'}</span>
                      <Download className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
