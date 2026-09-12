import { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import {
  Calculator,
  CheckCircle2,
  Plus,
  RefreshCcw,
  ShieldCheck,
  Eye,
  BookOpenCheck,
  Target,
  Layers,
  Globe,
  Building2,
  Printer,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  Check,
  Sliders,
  Sparkles,
  Archive,
  Send,
  Calendar,
  Pencil,
  Copy,
} from 'lucide-react'
import { assessmentFormulaService } from '../services/assessmentFormulaService'
import { useAuthStore } from '../stores/authStore'
import { printCleanTable, downloadPdfTable } from '../utils/printHelper'
import {
  ActionDropdown,
  AppBadge,
  AppButton,
  AppDrawer,
  PageContainer,
  AppBreadcrumb,
} from '../components/app'
import {
  MasterDataPage,
  MasterDataSection,
  MasterPageHeader,
  MasterStatsGrid,
  MasterStatCard,
  MasterFilterSelect,
  SquircleActionButton,
  PrintOptionModal,
} from '../components/master-data'

const EMPTY_OPTIONS = {
  units: [],
  classes: [],
  academic_years: [],
  semesters: [],
  component_catalog: {},
}

const TYPE_CONFIG = {
  academic: {
    label: 'Akademik',
    desc: 'Mata Pelajaran & Kurikulum Terpadu',
    badge: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300/60',
    icon: Calculator,
    dotColor: 'bg-sky-500',
  },
  tahfizh: {
    label: 'Tahfizh',
    desc: 'Hafalan, Tajwid & Mutabaah Al-Qur\'an',
    badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300/60',
    icon: BookOpenCheck,
    dotColor: 'bg-emerald-500',
  },
  mutabaah: {
    label: 'Mutaba\'ah',
    desc: 'Ibadah Harian & Karakter Islami',
    badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300/60',
    icon: Target,
    dotColor: 'bg-amber-500',
  },
}

const STATUS_CONFIG = {
  draft: { label: 'Draft', variant: 'neutral', tone: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  submitted: { label: 'Diajukan', variant: 'warning', tone: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
  approved: { label: 'Disetujui', variant: 'info', tone: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
  active: { label: 'Aktif', variant: 'success', tone: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
  archived: { label: 'Arsip', variant: 'danger', tone: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300' },
}

export default function AssessmentFormulaPage({
  embedded = false,
  hidePageHeader = false,
  hideBreadcrumb = false,
}) {
  const user = useAuthStore((state) => state.user)

  const permissions = useMemo(
    () => new Set((user?.permissions || []).map((p) => (typeof p === 'string' ? p : p?.name || ''))),
    [user]
  )

  const userRoles = useMemo(() => {
    if (!user) return []
    if (Array.isArray(user.roles)) return user.roles.map((r) => (typeof r === 'string' ? r : r?.name || ''))
    if (user.role) return [user.role]
    return []
  }, [user])

  const isSuperAdmin = useMemo(() => {
    if (!user) return true // fallback saat dev / auth mock
    return (
      Boolean(user?.is_superadmin) ||
      userRoles.length === 0 ||
      userRoles.some((r) => /super|admin|yayasan|pimpinan/i.test(r))
    )
  }, [user, userRoles])

  const can = (name) => isSuperAdmin || permissions.has(name) || permissions.has('*')

  // State List & Options
  const [items, setItems] = useState([])
  const [options, setOptions] = useState(EMPTY_OPTIONS)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [scopeFilter, setScopeFilter] = useState('')
  const [unitFilter, setUnitFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [yearFilter, setYearFilter] = useState('')

  // Modal & Drawer State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false)
  const [detailDrawerItem, setDetailDrawerItem] = useState(null)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)

  // Form State
  const [form, setForm] = useState({
    name: '',
    type: 'academic',
    scope: 'unit',
    education_unit_id: '',
    class_id: '',
    academic_year_id: '',
    semester_id: '',
    minimum_score: 75,
    rounding_precision: 2,
    components: [],
  })

  // Load Data
  const load = async () => {
    setLoading(true)
    try {
      const [listRes, optionRes] = await Promise.all([
        assessmentFormulaService.list({ per_page: 50 }),
        assessmentFormulaService.options(),
      ])
      setItems(listRes?.data?.data || [])
      const next = optionRes?.data || EMPTY_OPTIONS
      setOptions(next)

      // Set default form selections
      setForm((old) => ({
        ...old,
        education_unit_id: old.education_unit_id || next.units?.[0]?.id || '',
        academic_year_id:
          old.academic_year_id ||
          next.academic_years?.find((x) => x.is_active)?.id ||
          next.academic_years?.[0]?.id ||
          '',
        semester_id:
          old.semester_id ||
          next.semesters?.find((x) => x.is_active)?.id ||
          '',
      }))
    } catch {
      Swal.fire('Error', 'Pengaturan rumus penilaian belum berhasil dimuat.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Auto-fill components on type selection
  const selectType = (type) => {
    const catalog = options.component_catalog?.[type] || []
    const equal = catalog.length ? Math.floor(100 / catalog.length) : 0
    setForm((old) => ({
      ...old,
      type,
      components: catalog.map((c, i) => ({
        ...c,
        weight: i === catalog.length - 1 ? 100 - equal * (catalog.length - 1) : equal,
        aggregation: 'average',
      })),
    }))
  }

  const handleOpenAddModal = () => {
    setEditingItem(null)
    const defaultType = 'academic'
    const catalog = options.component_catalog?.[defaultType] || []
    const equal = catalog.length ? Math.floor(100 / catalog.length) : 0
    setForm({
      name: '',
      type: defaultType,
      scope: 'unit',
      education_unit_id: options.units?.[0]?.id || '',
      class_id: '',
      academic_year_id:
        options.academic_years?.find((x) => x.is_active)?.id ||
        options.academic_years?.[0]?.id ||
        '',
      semester_id: options.semesters?.find((x) => x.is_active)?.id || '',
      minimum_score: 75,
      rounding_precision: 2,
      components: catalog.map((c, i) => ({
        ...c,
        weight: i === catalog.length - 1 ? 100 - equal * (catalog.length - 1) : equal,
        aggregation: 'average',
      })),
    })
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (item) => {
    setEditingItem(item)
    setForm({
      name: item.name,
      type: item.type,
      scope: item.scope,
      education_unit_id: item.education_unit_id || options.units?.[0]?.id || '',
      class_id: item.class_id || '',
      academic_year_id: item.academic_year_id || '',
      semester_id: item.semester_id || '',
      minimum_score: Number(item.minimum_score ?? 75),
      rounding_precision: Number(item.rounding_precision ?? 2),
      components: (item.components || []).map((c) => ({ ...c })),
    })
    setIsModalOpen(true)
  }

  const handleDuplicateAsNewVersion = (item) => {
    setEditingItem(null)
    setForm({
      name: `${item.name} (Versi ${Number(item.version || 1) + 1})`,
      type: item.type,
      scope: item.scope,
      education_unit_id: item.education_unit_id || options.units?.[0]?.id || '',
      class_id: item.class_id || '',
      academic_year_id: item.academic_year_id || '',
      semester_id: item.semester_id || '',
      minimum_score: Number(item.minimum_score ?? 75),
      rounding_precision: Number(item.rounding_precision ?? 2),
      components: (item.components || []).map((c) => ({ ...c })),
    })
    setIsModalOpen(true)
  }

  // Real-time calculation of total weight
  const totalWeight = useMemo(() => {
    return (form.components || []).reduce((sum, item) => sum + Number(item.weight || 0), 0)
  }, [form.components])

  // Evenly distribute weights helper
  const handleDistributeEvenly = () => {
    if (!form.components || form.components.length === 0) return
    const count = form.components.length
    const equal = Math.floor(100 / count)
    const remainder = 100 - equal * count
    setForm((old) => ({
      ...old,
      components: old.components.map((c, i) => ({
        ...c,
        weight: i === 0 ? equal + remainder : equal,
      })),
    }))
  }

  const availableClasses = useMemo(() => {
    return (options.classes || []).filter(
      (item) => !form.education_unit_id || item.unit_pendidikan_id === form.education_unit_id
    )
  }, [options.classes, form.education_unit_id])

  // Filtered List
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        !search.trim() ||
        item.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.education_unit?.name?.toLowerCase().includes(search.toLowerCase())
      const matchType = !typeFilter || item.type === typeFilter
      const matchScope = !scopeFilter || item.scope === scopeFilter
      const matchUnit = !unitFilter || item.education_unit_id === unitFilter
      const matchStatus = !statusFilter || item.status === statusFilter
      const matchYear = !yearFilter || item.academic_year_id === yearFilter
      return matchSearch && matchType && matchScope && matchUnit && matchStatus && matchYear
    })
  }, [items, search, typeFilter, scopeFilter, unitFilter, statusFilter, yearFilter])

  // Statistics KPI
  const stats = useMemo(() => {
    const total = items.length
    const active = items.filter((x) => x.status === 'active').length
    const tahfizhMutabaah = items.filter((x) => ['tahfizh', 'mutabaah'].includes(x.type)).length
    const scores = items.map((x) => Number(x.minimum_score) || 75)
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 75
    return { total, active, tahfizhMutabaah, avgScore }
  }, [items])

  // Submit Draft
  const handleSubmitForm = async (e) => {
    e.preventDefault()
    if (totalWeight !== 100) {
      Swal.fire({
        icon: 'warning',
        title: 'Bobot Harus 100%',
        text: `Total bobot komponen saat ini adalah ${totalWeight}%. Harus tepat 100%.`,
        confirmButtonColor: '#0E5C44',
      })
      return
    }

    setBusy(true)
    try {
      const payload = {
        ...form,
        class_id: form.scope === 'class' ? form.class_id : null,
        education_unit_id: form.scope === 'global' ? null : form.education_unit_id,
        semester_id: form.semester_id || null,
      }

      if (editingItem) {
        await assessmentFormulaService.update(editingItem.id, payload)
        Swal.fire({
          icon: 'success',
          title: 'Perubahan Disimpan!',
          text: 'Formula rumus penilaian berhasil diperbarui.',
          timer: 2000,
          showConfirmButton: false,
        })
      } else {
        await assessmentFormulaService.create(payload)
        Swal.fire({
          icon: 'success',
          title: 'Draft Berhasil Dibuat!',
          text: 'Draft rumus penilaian telah tersimpan dan siap diajukan ke pimpinan.',
          timer: 2000,
          showConfirmButton: false,
        })
      }
      setIsModalOpen(false)
      setEditingItem(null)
      await load()
    } catch (err) {
      const respData = err.response?.data
      const errorMsg =
        respData?.message ||
        Object.values(respData?.errors || {})?.[0]?.[0] ||
        'Gagal menyimpan draft rumus penilaian.'
      Swal.fire('Error', errorMsg, 'error')
    } finally {
      setBusy(false)
    }
  }

  // Workflow Action Transition
  const handleTransition = async (item, action) => {
    const actionLabels = {
      submit: { title: 'Ajukan Rumus?', verb: 'mengajukan', confirm: 'Ya, Ajukan', color: '#0284c7' },
      approve: { title: 'Setujui Rumus Penilaian?', verb: 'menyetujui', confirm: 'Ya, Setujui', color: '#2563eb' },
      activate: {
        title: 'Aktifkan Rumus Penilaian?',
        verb: 'mengaktifkan (rumus aktif lama akan diarsipkan)',
        confirm: 'Ya, Aktifkan',
        color: '#0E5C44',
      },
      archive: { title: 'Arsipkan Rumus?', verb: 'mengarsipkan', confirm: 'Ya, Arsipkan', color: '#e11d48' },
    }

    const conf = actionLabels[action] || {
      title: 'Konfirmasi Perubahan Status',
      verb: 'memproses',
      confirm: 'Lanjutkan',
      color: '#0E5C44',
    }

    const res = await Swal.fire({
      title: conf.title,
      html: `Apakah Anda yakin ingin <b>${conf.verb}</b> rumus <b>"${item.name}"</b>?`,
      icon: action === 'archive' ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: conf.color,
      cancelButtonColor: '#64748b',
      confirmButtonText: conf.confirm,
      cancelButtonText: 'Batal',
    })

    if (res.isConfirmed) {
      setBusy(true)
      try {
        await assessmentFormulaService.transition(item.id, action)
        Swal.fire({
          icon: 'success',
          title: 'Status Diperbarui!',
          text: `Rumus penilaian berhasil di-${action}.`,
          timer: 1800,
          showConfirmButton: false,
        })
        await load()
      } catch (err) {
        Swal.fire('Gagal', err.response?.data?.message || 'Status rumus gagal diperbarui.', 'error')
      } finally {
        setBusy(false)
      }
    }
  }

  // Open Detail Drawer
  const handleOpenDetail = (item) => {
    setDetailDrawerItem(item)
    setIsDetailDrawerOpen(true)
  }

  // Action buttons header
  const pageActions = (
    <div className="flex items-center gap-2.5 flex-nowrap shrink-0 overflow-x-auto py-1">
      <SquircleActionButton
        variant="view"
        icon={Printer}
        label="Cetak Data"
        onClick={() => setIsPrintModalOpen(true)}
      />
      <SquircleActionButton
        variant="secondary"
        icon={RefreshCcw}
        label="Muat Ulang"
        onClick={load}
      />
      {can('assessment_formula.create') && (
        <SquircleActionButton
          variant="primary"
          icon={Plus}
          label="Tambah Draft Rumus"
          onClick={handleOpenAddModal}
        />
      )}
    </div>
  )

  const shouldHideBreadcrumb = embedded || hideBreadcrumb
  const shouldHideHeader = embedded || hidePageHeader

  return (
    <PageContainer maxW="7xl">
      {/* Print Option Modal */}
      <PrintOptionModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Rumus Penilaian"
        onPrint={() => {
          printCleanTable({
            title: 'Laporan Standar Rumus Penilaian Rapor',
            subtitle: 'Daftar Formula Bobot Akademik, Tahfizh & Mutabaah Sekolah Islam Terpadu',
            headers: ['NO', 'NAMA FORMULA', 'JENIS', 'CAKUPAN', 'UNIT / KELAS', 'BOBOT KOMPONEN', 'KKM', 'STATUS'],
            rows: filteredItems.map((r, i) => [
              i + 1,
              r.name,
              TYPE_CONFIG[r.type]?.label || r.type,
              r.scope.toUpperCase(),
              r.education_unit?.name || 'Global Yayasan',
              r.components?.map((c) => `${c.label}: ${c.weight}%`).join(', ') || '-',
              r.minimum_score || 75,
              r.status?.toUpperCase(),
            ]),
          })
        }}
        onDownload={() => {
          downloadPdfTable({
            title: 'Laporan Standar Rumus Penilaian Rapor',
            subtitle: 'Daftar Formula Bobot Akademik, Tahfizh & Mutabaah Sekolah Islam Terpadu',
            headers: ['NO', 'NAMA FORMULA', 'JENIS', 'CAKUPAN', 'UNIT / KELAS', 'BOBOT KOMPONEN', 'KKM', 'STATUS'],
            rows: filteredItems.map((r, i) => [
              i + 1,
              r.name,
              TYPE_CONFIG[r.type]?.label || r.type,
              r.scope.toUpperCase(),
              r.education_unit?.name || 'Global Yayasan',
              r.components?.map((c) => `${c.label}: ${c.weight}%`).join(', ') || '-',
              r.minimum_score || 75,
              r.status?.toUpperCase(),
            ]),
            filename: 'laporan_rumus_penilaian.pdf',
          })
        }}
      />

      {!shouldHideBreadcrumb && (
        <AppBreadcrumb
          items={[{ label: 'Master Data', href: '/dashboard' }, { label: 'Rumus Penilaian' }]}
        />
      )}

      <MasterDataPage hideBreadcrumb>
        {/* Modern Hero Header */}
        {!shouldHideHeader && (
          <MasterPageHeader
            tone="brand"
            icon={Calculator}
            title="Standar Rumus Penilaian Rapor"
            description="Konfigurasi dan standarisasi formula bobot nilai Akademik, Tahfizh Al-Qur'an, dan Mutaba'ah Ibadah secara terpadu."
            actions={pageActions}
          />
        )}

        {/* MasterStatsGrid (4 KPI Cards) */}
        <MasterStatsGrid>
          <MasterStatCard
            icon={Calculator}
            label="TOTAL FORMULA RUMUS"
            value={stats.total}
            description="Terdaftar di seluruh unit"
            variant="brand"
            loading={loading}
          />
          <MasterStatCard
            icon={CheckCircle2}
            label="RUMUS AKTIF"
            value={stats.active}
            description="Terkunci & digunakan di rapor"
            variant="success"
            loading={loading}
          />
          <MasterStatCard
            icon={BookOpenCheck}
            label="TAHFIZH & MUTABA'AH"
            value={stats.tahfizhMutabaah}
            description="Formula karakter & Quran"
            variant="info"
            loading={loading}
          />
          <MasterStatCard
            icon={Target}
            label="STANDAR KKM MINIMUM"
            value={stats.avgScore}
            description="Nilai tuntas kelulusan"
            variant="warning"
            loading={loading}
          />
        </MasterStatsGrid>

        {/* MasterDataSection with Emerald Datatable Container */}
        <MasterDataSection
          title="Daftar Versi Rumus Penilaian"
          description="Formula perhitungan angka rapor berdasarkan periode, jenis penilaian, dan cakupan tingkatan."
          countLabel={`${filteredItems.length} formula`}
          actions={pageActions}
          stackedFilters={true}
          search={{
            value: search,
            onValueChange: (val) => setSearch(val),
            placeholder: 'Cari nama formula rumus atau unit pendidikan...',
            'aria-label': 'Cari rumus penilaian',
          }}
          filters={
            <>
              {/* Filter Jenis */}
              <MasterFilterSelect
                aria-label="Filter Jenis"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">Semua Jenis (Akademik, Tahfizh, Mutaba'ah)</option>
                <option value="academic">Akademik (Mata Pelajaran)</option>
                <option value="tahfizh">Tahfizh (Al-Qur'an)</option>
                <option value="mutabaah">Mutaba'ah (Ibadah Harian)</option>
              </MasterFilterSelect>

              {/* Filter Cakupan */}
              <MasterFilterSelect
                aria-label="Filter Cakupan"
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value)}
              >
                <option value="">Semua Cakupan</option>
                <option value="global">Global Yayasan</option>
                <option value="unit">Unit Sekolah</option>
                <option value="class">Rombel Kelas</option>
              </MasterFilterSelect>

              {/* Filter Unit Pendidikan */}
              <MasterFilterSelect
                aria-label="Filter Unit"
                value={unitFilter}
                onChange={(e) => setUnitFilter(e.target.value)}
              >
                <option value="">Semua Unit Pendidikan</option>
                {(options.units || []).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </MasterFilterSelect>

              {/* Filter Status */}
              <MasterFilterSelect
                aria-label="Filter Status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="approved">Disetujui</option>
                <option value="submitted">Diajukan</option>
                <option value="draft">Draft</option>
                <option value="archived">Arsip</option>
              </MasterFilterSelect>
            </>
          }
          onReset={() => {
            setSearch('')
            setTypeFilter('')
            setScopeFilter('')
            setUnitFilter('')
            setStatusFilter('')
            setYearFilter('')
          }}
          resetDisabled={!search && !typeFilter && !scopeFilter && !unitFilter && !statusFilter && !yearFilter}
          isLoading={loading}
          isError={false}
          isEmpty={!loading && filteredItems.length === 0}
          emptyTitle="Belum Ada Rumus Penilaian"
          emptyDescription="Tidak ada rumus yang sesuai dengan kriteria filter. Tambahkan draft rumus baru untuk memulai."
          ariaLabel="Tabel Rumus Penilaian"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-emerald-950 font-black tracking-wider uppercase text-[11px] dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:text-emerald-300">
                <tr>
                  <th className="py-3.5 px-4 font-black">NAMA FORMULA & JENIS</th>
                  <th className="py-3.5 px-4 font-black">CAKUPAN & PERIODE</th>
                  <th className="py-3.5 px-4 font-black">DISTRIBUSI BOBOT KOMPONEN</th>
                  <th className="py-3.5 px-4 font-black text-center">KKM MINIMUM</th>
                  <th className="py-3.5 px-4 font-black text-center">STATUS</th>
                  <th className="py-3.5 px-4 font-black text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-[#1B2433]">
                {filteredItems.map((item) => {
                  const typeMeta = TYPE_CONFIG[item.type] || TYPE_CONFIG.academic
                  const statusMeta = STATUS_CONFIG[item.status] || STATUS_CONFIG.draft
                  const TypeIcon = typeMeta.icon

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors"
                    >
                      {/* Nama & Jenis */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                              item.type === 'academic'
                                ? 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300'
                                : item.type === 'tahfizh'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            <TypeIcon className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-black text-slate-900 dark:text-white text-sm">
                              {item.name}
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
                              <span
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black ${typeMeta.badge}`}
                              >
                                <span className={`h-1.5 w-1.5 rounded-full ${typeMeta.dotColor}`} />
                                {typeMeta.label}
                              </span>
                              <span className="text-[11px] text-slate-400 font-medium">
                                Versi {item.version || 1}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Cakupan & Periode */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-200">
                            {item.scope === 'global' ? (
                              <span className="inline-flex items-center gap-1 text-purple-700 dark:text-purple-400">
                                <Globe className="h-3.5 w-3.5" />
                                <span>Global Yayasan</span>
                              </span>
                            ) : item.scope === 'class' ? (
                              <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                                <Layers className="h-3.5 w-3.5" />
                                <span>{item.kelas?.nama_kelas || 'Rombel Khusus'}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-teal-700 dark:text-teal-400">
                                <Building2 className="h-3.5 w-3.5" />
                                <span>{item.education_unit?.name || 'Unit Sekolah'}</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                            <Calendar className="h-3 w-3" />
                            <span>
                              {item.academic_year?.name || '-'}{' '}
                              {item.semester?.name ? `(${item.semester.name})` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Distribusi Bobot Komponen */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="space-y-1.5 max-w-sm">
                          {/* Visual Tag Pills */}
                          <div className="flex flex-wrap gap-1">
                            {(item.components || []).map((comp) => (
                              <span
                                key={comp.key}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                              >
                                <span>{comp.label}:</span>
                                <span className="font-black text-emerald-600 dark:text-emerald-400">
                                  {comp.weight}%
                                </span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>

                      {/* Nilai KKM */}
                      <td className="py-3.5 px-4 align-top text-center">
                        <span className="inline-flex items-center justify-center rounded-xl bg-slate-100 px-3 py-1 font-mono text-xs font-black text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                          {Number(item.minimum_score ?? 75).toFixed(1)}
                        </span>
                        <div className="mt-1 text-[10px] text-slate-400">
                          Presisi {item.rounding_precision ?? 2} desimal
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 align-top text-center">
                        <AppBadge variant={statusMeta.variant} dot>
                          {statusMeta.label}
                        </AppBadge>
                      </td>

                      {/* Aksi & Workflow */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Detail Drawer Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(item)}
                            className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-2 text-slate-600 hover:bg-slate-100 hover:text-emerald-700 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-sm"
                            title="Lihat Detail Formula"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {/* Edit Button: Hanya untuk draft & submitted */}
                          {['draft', 'submitted'].includes(item.status) && can('assessment_formula.update') && (
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(item)}
                              className="inline-flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 p-2 text-amber-700 hover:bg-amber-100 transition dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300 shadow-sm"
                              title="Edit Draft Formula"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Buat Versi Baru (Klon): Untuk active & approved */}
                          {['active', 'approved'].includes(item.status) && can('assessment_formula.create') && (
                            <button
                              type="button"
                              onClick={() => handleDuplicateAsNewVersion(item)}
                              className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100 transition dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 shadow-sm"
                              title="Buat Versi Baru (Klon Rumus)"
                            >
                              <Copy className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Workflow Transition Buttons */}
                          {item.status === 'draft' && can('assessment_formula.submit') && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleTransition(item, 'submit')}
                              className="inline-flex items-center gap-1 rounded-xl bg-amber-500 px-2.5 py-1.5 text-xs font-black text-white hover:bg-amber-600 transition shadow-sm"
                              title="Ajukan ke Pimpinan"
                            >
                              <Send className="h-3 w-3" />
                              <span>Ajukan</span>
                            </button>
                          )}

                          {item.status === 'submitted' && can('assessment_formula.approve') && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleTransition(item, 'approve')}
                              className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-2.5 py-1.5 text-xs font-black text-white hover:bg-blue-700 transition shadow-sm"
                              title="Setujui Formula"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              <span>Setujui</span>
                            </button>
                          )}

                          {item.status === 'approved' && can('assessment_formula.activate') && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleTransition(item, 'activate')}
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1.5 text-xs font-black text-white hover:bg-emerald-700 transition shadow-sm"
                              title="Aktifkan Formula di Rapor"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Aktifkan</span>
                            </button>
                          )}

                          {item.status === 'active' && can('assessment_formula.archive') && (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleTransition(item, 'archive')}
                              className="inline-flex items-center gap-1 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 px-2 py-1.5 text-xs font-bold hover:bg-rose-100 transition dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900"
                              title="Arsipkan Formula"
                            >
                              <Archive className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </MasterDataSection>
      </MasterDataPage>

      {/* MODAL FORM TAMBAH DRAFT RUMUS */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-2xl overflow-hidden rounded-[22px] border-2 border-emerald-500/30 bg-white p-6 shadow-2xl dark:border-emerald-600/40 dark:bg-slate-900 animate-scaleUp">
            {/* Header Modal */}
            <div className="mb-5 flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-900/20">
                  <Calculator className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">
                    {editingItem ? 'Edit Draft Rumus Penilaian' : 'Buat Draft Rumus Penilaian'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editingItem ? `Mengubah draf rumus: ${editingItem.code}` : 'Formula bobot nilai rapor untuk kurikulum terpadu'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Row 1: Nama & Jenis */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nama Formula Rumus <span className="text-rose-500">*</span>
                  </label>
                  <input
                    required
                    placeholder="Contoh: Standar Nilai Akhir Semester SDIT"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-medium text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Jenis Penilaian <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) => selectType(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="academic">Akademik (Mata Pelajaran)</option>
                    <option value="tahfizh">Tahfizh (Al-Qur'an)</option>
                    <option value="mutabaah">Mutaba'ah (Ibadah Harian)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Cakupan & Unit */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tingkat Cakupan <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={form.scope}
                    onChange={(e) => setForm({ ...form, scope: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="unit">Unit Sekolah Tertentu</option>
                    <option value="class">Rombel Kelas Tertentu</option>
                    {can('assessment_formula.activate') && (
                      <option value="global">Global (Seluruh Yayasan)</option>
                    )}
                  </select>
                </div>

                {form.scope !== 'global' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Pilih Unit Pendidikan <span className="text-rose-500">*</span>
                    </label>
                    <select
                      required
                      value={form.education_unit_id}
                      onChange={(e) =>
                        setForm({ ...form, education_unit_id: e.target.value, class_id: '' })
                      }
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      {options.units.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Row 3: Kelas (jika scope=class), Tahun Ajaran, Semester */}
              <div className="grid gap-3 sm:grid-cols-3">
                {form.scope === 'class' && (
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Pilih Kelas
                    </label>
                    <select
                      required
                      value={form.class_id}
                      onChange={(e) => setForm({ ...form, class_id: e.target.value })}
                      className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="">Pilih Kelas</option>
                      {availableClasses.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.nama_kelas}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Tahun Ajaran <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={form.academic_year_id}
                    onChange={(e) => setForm({ ...form, academic_year_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {options.academic_years.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Semester
                  </label>
                  <select
                    value={form.semester_id}
                    onChange={(e) => setForm({ ...form, semester_id: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Semua Semester</option>
                    {options.semesters
                      .filter(
                        (s) =>
                          !form.academic_year_id || s.academic_year_id === form.academic_year_id
                      )
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Nilai KKM Minimum
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={form.minimum_score}
                    onChange={(e) =>
                      setForm({ ...form, minimum_score: Number(e.target.value) })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white p-2.5 text-xs font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Interaktive Weight Component Editor */}
              <div className="rounded-2xl border-2 border-emerald-500/20 bg-emerald-50/20 p-4 dark:border-emerald-900/50 dark:bg-slate-800/40">
                <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">
                      Rincian Bobot Komponen Penilaian
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Total pembobotan harus bernilai tepat 100%
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDistributeEvenly}
                      className="inline-flex items-center gap-1 rounded-lg border border-emerald-300 bg-white px-2.5 py-1 text-[11px] font-black text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:bg-slate-800 dark:text-emerald-300 transition"
                    >
                      <Sparkles className="h-3 w-3" />
                      <span>Bagi Rata</span>
                    </button>

                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black transition ${
                        totalWeight === 100
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300'
                      }`}
                    >
                      {totalWeight === 100 ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <AlertTriangle className="h-3 w-3" />
                      )}
                      <span>Total: {totalWeight}%</span>
                    </span>
                  </div>
                </div>

                <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                  {form.components.map((item, index) => (
                    <div
                      key={item.key}
                      className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800"
                    >
                      <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate">
                        {item.label}
                      </div>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.weight}
                          onChange={(e) => {
                            const components = [...form.components]
                            components[index] = { ...item, weight: Number(e.target.value) }
                            setForm({ ...form, components })
                          }}
                          className="w-full rounded-lg border border-slate-300 p-1.5 text-xs font-black text-emerald-700 dark:border-slate-600 dark:bg-slate-900 dark:text-emerald-300 focus:border-emerald-500 focus:outline-none"
                        />
                        <span className="text-xs font-bold text-slate-400">%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={busy || totalWeight !== 100}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-2.5 text-xs font-black text-white hover:opacity-95 transition disabled:opacity-50 shadow-md shadow-emerald-900/20"
                >
                  {editingItem ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  <span>{editingItem ? 'Simpan Perubahan' : 'Simpan Draft Rumus'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAIL DRAWER */}
      <AppDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        title={detailDrawerItem?.name || 'Detail Rumus Penilaian'}
        size="md"
      >
        {detailDrawerItem && (
          <div className="space-y-6 p-4">
            {/* Header Badge Card */}
            <div className="rounded-2xl border-2 border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 dark:bg-slate-900/60">
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-black ${
                    TYPE_CONFIG[detailDrawerItem.type]?.badge
                  }`}
                >
                  {TYPE_CONFIG[detailDrawerItem.type]?.label}
                </span>
                <AppBadge variant={STATUS_CONFIG[detailDrawerItem.status]?.variant} dot>
                  {STATUS_CONFIG[detailDrawerItem.status]?.label}
                </AppBadge>
              </div>
              <h3 className="mt-2 text-base font-black text-slate-900 dark:text-white">
                {detailDrawerItem.name}
              </h3>
              <p className="text-xs text-slate-500">
                {detailDrawerItem.scope.toUpperCase()} ·{' '}
                {detailDrawerItem.education_unit?.name || 'Seluruh Unit Yayasan'}
              </p>
            </div>

            {/* General Specs */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-2.5 text-xs">
              <h4 className="font-black text-slate-900 dark:text-white border-b pb-2">
                Informasi Cakupan & Target
              </h4>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Tahun Ajaran</span>
                <span className="font-bold">{detailDrawerItem.academic_year?.name || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Semester</span>
                <span className="font-bold">{detailDrawerItem.semester?.name || 'Semua Semester'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Nilai KKM Minimum</span>
                <span className="font-bold font-mono text-emerald-600">
                  {detailDrawerItem.minimum_score || 75.0}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Presisi Pembulatan</span>
                <span className="font-bold">{detailDrawerItem.rounding_precision || 2} Desimal</span>
              </div>
            </div>

            {/* Components Breakdown */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-black text-slate-900 dark:text-white">Komposisi Bobot Nilai</h4>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-black text-emerald-800">
                  100%
                </span>
              </div>

              <div className="space-y-2">
                {(detailDrawerItem.components || []).map((comp) => (
                  <div key={comp.key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {comp.label}
                      </span>
                      <span className="font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {comp.weight}%
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-600"
                        style={{ width: `${comp.weight}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Trail */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/50 space-y-2 text-[11px] text-slate-500">
              <h4 className="font-bold text-slate-700 dark:text-slate-300">
                Jejak Tata Kelola & Persetujuan
              </h4>
              <div>
                Dibuat oleh:{' '}
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {detailDrawerItem.creator?.name || 'Administrator'}
                </span>
              </div>
              {detailDrawerItem.approver && (
                <div>
                  Disetujui oleh:{' '}
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {detailDrawerItem.approver.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </AppDrawer>
    </PageContainer>
  )
}
