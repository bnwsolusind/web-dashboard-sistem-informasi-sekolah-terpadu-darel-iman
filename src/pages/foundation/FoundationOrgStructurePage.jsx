import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  Award,
  BadgeCheck,
  Building2,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  Network,
  RefreshCcw,
  ShieldAlert,
  UserCheck,
  Users,
  UsersRound
} from 'lucide-react'
import api from '../../services/api'
import AppBreadcrumb from '../../components/app/AppBreadcrumb'
import {
  MasterActionButton,
  MasterBadge,
  MasterDataPage,
  MasterEmptyState,
  MasterErrorState,
  MasterFilterBar,
  MasterFilterSelect,
  MasterPageHeader,
  MasterSearchInput,
  MasterStatCard,
  MasterStatsGrid,
  masterStyles
} from '../../components/master-data'
import {
  PersonIdentityCell
} from '../../components/ui/PersonIdentityCell'
import KpiDetailDrawer from '../../components/KpiDetailDrawer'
import {
  FoundationExportModal
} from '../../components/foundation/FoundationExportModal'
import {
  SmartScrollFab
} from '../../components/common'

export function FoundationOrgStructurePage() {
  const [units, setUnits] = useState([])
  const [selectedUnit, setSelectedUnit] = useState('all')
  const [structureData, setStructureData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [search, setSearch] = useState('')

  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null)
  const [selectedDetailType, setSelectedDetailType] = useState('pegawai')
  const [showExport, setShowExport] = useState(false)

  // Fetch unit list
  useEffect(() => {
    api.get('/foundation/units')
      .then((res) => {
        const raw = res.data?.data || res.data || []
        setUnits(Array.isArray(raw) ? raw : [])
      })
      .catch(() => {})
  }, [])

  // Fetch structure data
  const fetchStructure = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setIsFetching(true)
    setError(false)

    try {
      const params = { unit_id: selectedUnit !== 'all' ? selectedUnit : undefined }
      const res = await api.get('/foundation/structure', { params })
      setStructureData(res.data?.data || null)
    } catch (err) {
      console.error('Failed to fetch foundation structure:', err)
      setError(true)
    } finally {
      setLoading(false)
      setIsFetching(false)
    }
  }, [selectedUnit])

  useEffect(() => {
    fetchStructure()
  }, [fetchStructure])

  const handleRefresh = () => {
    fetchStructure(Boolean(structureData))
  }

  const handleOpenDetail = (emp) => {
    const isGuru = (emp.position?.nama_jabatan || emp.jabatan || '').toLowerCase().includes('guru')
    setSelectedDetailType(isGuru ? 'guru' : 'pegawai')
    setSelectedEmployeeId(emp.id)
  }

  // Filter levels and positions based on search term
  const filteredLevels = useMemo(() => {
    if (!structureData?.levels) return []
    if (!search.trim()) return structureData.levels

    const term = search.toLowerCase()
    return structureData.levels.map((lvl) => {
      const matchingPositions = lvl.positions.filter((pos) => {
        const posNameMatches = (pos.name || '').toLowerCase().includes(term)
        const empMatches = (pos.employees || []).some(
          (e) => (e.nama_lengkap || '').toLowerCase().includes(term) || (e.niy || '').toLowerCase().includes(term)
        )
        return posNameMatches || empMatches
      })
      return { ...lvl, positions: matchingPositions }
    }).filter((lvl) => lvl.positions.length > 0)
  }, [structureData, search])

  const totalPositions = structureData?.total_positions || 0
  const totalLevels = structureData?.levels?.length || 0

  const totalFilledPositions = useMemo(() => {
    if (!structureData?.levels) return 0
    return structureData.levels.reduce((acc, lvl) => {
      return acc + lvl.positions.reduce((pAcc, pos) => pAcc + (pos.total_employees > 0 ? 1 : 0), 0)
    }, 0)
  }, [structureData])

  const totalAssignedEmployees = useMemo(() => {
    if (!structureData?.levels) return 0
    return structureData.levels.reduce((acc, lvl) => {
      return acc + lvl.positions.reduce((pAcc, pos) => pAcc + pos.total_employees, 0)
    }, 0)
  }, [structureData])

  // Export rows mapping
  const exportRows = useMemo(() => {
    if (!structureData?.levels) return []
    const rows = []
    let no = 1
    structureData.levels.forEach((lvl) => {
      lvl.positions.forEach((pos) => {
        if (pos.employees && pos.employees.length > 0) {
          pos.employees.forEach((emp) => {
            rows.push({
              No: no++,
              Level: lvl.title,
              'Nama Jabatan': pos.name,
              'Satuan Kerja': pos.satuan_kerja || 'Unit Pendidikan',
              'Nama Pejabat': emp.nama_lengkap || '-',
              'NIY / NIK': emp.niy || '-',
              'Unit Kerja': emp.unit_name || pos.unit?.name || 'Semua Unit',
              'Atasan Langsung': pos.atasan_nama || '-',
              Status: emp.status || 'Aktif',
            })
          })
        } else {
          rows.push({
            No: no++,
            Level: lvl.title,
            'Nama Jabatan': pos.name,
            'Satuan Kerja': pos.satuan_kerja || 'Unit Pendidikan',
            'Nama Pejabat': 'Belum Diisi',
            'NIY / NIK': '-',
            'Unit Kerja': pos.unit?.name || 'Semua Unit',
            'Atasan Langsung': pos.atasan_nama || '-',
            Status: 'Kosong',
          })
        }
      })
    })
    return rows
  }, [structureData])

  return (
    <MasterDataPage hideBreadcrumb className="foundation-org-structure-page">
      <div className="mb-4 print:hidden">
        <AppBreadcrumb items={[{ label: 'Yayasan', href: '/dashboard/yayasan' }, { label: 'Struktur Organisasi' }]} />
      </div>

      <MasterPageHeader
        title="Struktur Organisasi Unit Pendidikan"
        description="Bagan hirarki struktur jabatan & pejabat pengampu pada tiap Unit Pendidikan secara terstruktur."
        tone="brand"
        icon={Network}
        actions={(
          <>
            <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-extrabold px-3 py-2 text-[10px] border border-emerald-300/80 dark:border-emerald-700/60">
              <ShieldAlert className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              Mode Monitoring • Akses Read-Only
            </span>
            <MasterActionButton variant="export" icon={FileSpreadsheet} onClick={() => setShowExport(true)}>
              Export Struktur
            </MasterActionButton>
          </>
        )}
      />

      <MasterStatsGrid>
        <MasterStatCard icon={Network} label="Total Jabatan" value={totalPositions} description="Posisi dalam hirarki" variant="success" delay={40} />
        <MasterStatCard icon={BadgeCheck} label="Jabatan Terisi" value={totalFilledPositions} description="Memiliki pejabat pengampu" variant="info" delay={80} />
        <MasterStatCard icon={UsersRound} label="Total Pejabat" value={totalAssignedEmployees} description="Pegawai bertugas" variant="warning" delay={120} />
        <MasterStatCard icon={Building2} label="Tingkat Hirarki" value={`${totalLevels} Level`} description="Strata tingkatan organisasi" variant="neutral" delay={160} />
      </MasterStatsGrid>

      <MasterFilterBar
        search={<MasterSearchInput placeholder="Cari nama jabatan, pejabat, atau NIY..." value={search} onChange={(e) => setSearch(e.target.value)} />}
        filters={
          <>
            <MasterFilterSelect value={selectedUnit} onChange={(e) => setSelectedUnit(e.target.value)} aria-label="Filter unit pendidikan">
              <option value="all">Semua Unit Pendidikan</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.code}
                </option>
              ))}
            </MasterFilterSelect>
            <button
              type="button"
              onClick={handleRefresh}
              aria-label="Muat ulang data"
              title="Muat ulang"
              className="inline-flex h-9 w-10 items-center justify-center rounded-xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-[#1B2433] text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 shadow-xs transition cursor-pointer"
            >
              <RefreshCcw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </>
        }
      />

      {error ? (
        <MasterErrorState
          title="Struktur organisasi gagal dimuat"
          description="Terjadi kesalahan saat mengambil data hirarki organisasi dari server."
          onRetry={handleRefresh}
        />
      ) : loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((lvl) => (
            <div key={lvl} className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] animate-pulse p-6">
              <div className="h-6 w-48 rounded-xl bg-emerald-50 dark:bg-emerald-950/40" />
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2].map((i) => (
                  <div key={i} className="h-28 rounded-xl bg-emerald-50 dark:bg-emerald-950/40" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : filteredLevels.length === 0 ? (
        <MasterEmptyState
          title="Struktur Organisasi Tidak Ditemukan"
          description="Ubah filter pencarian atau pilih unit pendidikan lain untuk menampilkan bagan organisasi."
        />
      ) : (
        <div id="bagan-struktur-organisasi" className="space-y-8 scroll-mt-6">
          {filteredLevels.map((lvlGroup) => (
            <section
              key={lvlGroup.level}
              className="relative overflow-hidden rounded-[22px] border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-emerald-500/10 dark:bg-[#1B2433] p-5 sm:p-6"
            >
              <div className="flex items-center justify-between border-b border-emerald-200/80 dark:border-emerald-800/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 font-mono text-xs font-black text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 shadow-xs">
                    L{lvlGroup.level}
                  </span>
                  <div>
                    <h2 className="text-base font-black text-emerald-950 dark:text-emerald-100">{lvlGroup.title}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {lvlGroup.positions.length} Jabatan pada tingkat ini
                    </p>
                  </div>
                </div>
                <span className="rounded-xl bg-emerald-100 dark:bg-emerald-950/60 px-3 py-1 text-xs font-black text-emerald-900 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60">
                  Level {lvlGroup.level}
                </span>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {lvlGroup.positions.map((pos) => {
                  const isFilled = pos.total_employees > 0
                  return (
                    <div
                      key={pos.id}
                      className={`group relative flex flex-col justify-between rounded-xl border-2 p-4 transition-all duration-200 hover:shadow-md ${
                        isFilled
                          ? 'border-emerald-200/90 bg-white hover:border-emerald-400 dark:border-emerald-800/80 dark:bg-[#151D2A] dark:hover:border-emerald-600 shadow-xs'
                          : 'border-dashed border-amber-300 dark:border-amber-700/70 bg-amber-50/30 dark:bg-amber-950/15'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className="inline-block h-3.5 w-3.5 rounded-full shadow-xs"
                            style={{ backgroundColor: pos.warna || '#10B981' }}
                            title={`Kode: ${pos.code}`}
                          />
                          <MasterBadge variant={isFilled ? 'success' : 'warning'} size="sm">
                            {isFilled ? `${pos.total_employees} Pejabat` : 'Kosong'}
                          </MasterBadge>
                        </div>

                        <h3 className="mt-2 text-sm font-black text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                          {pos.name}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {pos.satuan_kerja || 'Unit Pendidikan'} • {pos.unit?.name || 'Seluruh Unit'}
                        </p>

                        <div className="mt-3.5 space-y-2 border-t border-emerald-200/80 dark:border-emerald-800/60 pt-3">
                          {isFilled ? (
                            pos.employees.map((emp) => (
                              <button
                                key={emp.id}
                                type="button"
                                onClick={() => handleOpenDetail(emp)}
                                className="w-full text-left transition hover:opacity-80 cursor-pointer"
                              >
                                <PersonIdentityCell
                                  src={emp.foto}
                                  name={emp.nama_lengkap}
                                  subtitle={`NIY: ${emp.niy || '-'}`}
                                />
                              </button>
                            ))
                          ) : (
                            <div className="flex items-center gap-2 py-1 text-xs text-amber-700 dark:text-amber-400">
                              <UserCheck className="h-4 w-4 shrink-0 text-amber-500" />
                              <span className="italic">Belum ada pejabat yang ditugaskan</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-emerald-200/80 dark:border-emerald-800/60 pt-2.5 text-[10px] text-slate-400">
                        <span>Atasan: <strong className="font-bold text-slate-700 dark:text-slate-300">{pos.atasan_nama}</strong></span>
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-700 dark:group-hover:text-emerald-300" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      <KpiDetailDrawer
        type={selectedDetailType}
        id={selectedEmployeeId}
        isOpen={Boolean(selectedEmployeeId)}
        onClose={() => setSelectedEmployeeId(null)}
      />

      <FoundationExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        title="Struktur Organisasi Unit Pendidikan"
        rows={exportRows}
        filename="Struktur_Organisasi_Yayasan"
      />

      {/* Smart Floating Scroll Navigator */}
      <SmartScrollFab targetId="bagan-struktur-organisasi" downTooltip="Langsung ke Struktur Organisasi" />
    </MasterDataPage>
  )
}
