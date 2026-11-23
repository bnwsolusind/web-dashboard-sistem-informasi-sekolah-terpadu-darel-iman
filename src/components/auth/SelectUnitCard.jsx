import { useState, useEffect } from 'react'
import { FiSearch, FiCheck } from 'react-icons/fi'
import { FaGraduationCap, FaSchool, FaBookQuran, FaBuildingColumns } from 'react-icons/fa6'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertContent, AlertDescription, AlertIndicator } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { educationUnitService } from '../../services/educationUnitService'
import { usePengaturanStore } from '../../stores/pengaturanStore'
import { resolveFoundationName } from '../../utils/printHelper'

export default function SelectUnitCard({ onNavigate, disabled = false }) {
 const [selectedUnit, setSelectedUnit] = useState('')
 const [search, setSearch] = useState('')
 const [units, setUnits] = useState([])
 const [loading, setLoading] = useState(true)
 const [savedUnitName, setSavedUnitName] = useState(null)
 const pengaturan = usePengaturanStore((state) => state.pengaturan)
 const foundationName = resolveFoundationName(pengaturan)

 useEffect(() => {
 educationUnitService
 .getDaftar()
 .then((res) => {
 const raw = res?.data?.data || res?.data || []
 if (Array.isArray(raw) && raw.length > 0) {
 const mapped = raw.map((item) => ({
 id: String(item.id || item.code || item.name),
 name: item.name || item.nama_unit || item.code,
 fullName: item.full_name || item.nama_panjang || item.name || 'Unit Pendidikan',
 subtext: item.level ? `Jenjang: ${item.level}` : foundationName,
 icon: item.name?.toLowerCase().includes('tk')
 ? FaSchool
 : item.name?.toLowerCase().includes('sd')
 ? FaGraduationCap
 : item.name?.toLowerCase().includes('ponpes') || item.name?.toLowerCase().includes('pesantren')
 ? FaBookQuran
 : FaBuildingColumns,
 }))
 setUnits(mapped)
 setSelectedUnit(mapped[0].id)
 } else {
 setUnits([])
 setSelectedUnit('')
 }
 })
 .catch((err) => {
 console.error('Gagal memuat unit pendidikan:', err)
 setUnits([])
 setSelectedUnit('')
 })
 .finally(() => {
 setLoading(false)
 })
 }, [])

 const filtered = units.filter(
 (u) =>
 u.name.toLowerCase().includes(search.toLowerCase()) ||
 u.fullName.toLowerCase().includes(search.toLowerCase())
 )

 const handleSelect = () => {
 if (disabled) return
 const activeObj = units.find((u) => u.id === selectedUnit) || units[0]
 setSavedUnitName(activeObj.fullName || activeObj.name)
 setTimeout(() => {
 setSavedUnitName(null)
 if (onNavigate) onNavigate(7)
 }, 1500)
 }

 return (
 <Card
 className={`w-full rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white p-6 lg:p-8 shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433] space-y-6 ${
 disabled ? 'opacity-70 pointer-events-none' : ''
 }`}
 >
 {/* Header */}
 <div>
 <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center justify-between">
 <span>Pilih Unit Pendidikan</span>
 {disabled ? (
 <Badge color="warning" size="sm">
 🔒 Terkunci (Non-Aktif)
 </Badge>
 ) : (
 <Badge color="emerald" size="sm">
 Tersedia
 </Badge>
 )}
 </h2>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
 Tentukan unit sekolah aktif yang menjadi konteks kerja Anda saat ini.
 </p>
 </div>

 {savedUnitName && (
 <Alert status="success" className="rounded-xl">
 <AlertIndicator>
 <FiCheck className="w-4 h-4" />
 </AlertIndicator>
 <AlertContent>
 <AlertDescription>
 Unit aktif berhasil disetel ke <b>{savedUnitName}</b>
 </AlertDescription>
 </AlertContent>
 </Alert>
 )}

 {/* Search Input */}
 <div className="relative max-w-md">
 <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
 <FiSearch className="w-4 h-4" />
 </div>
 <input
 type="text"
 value={search}
 disabled={disabled}
 onChange={(e) => setSearch(e.target.value)}
 placeholder="Cari unit pendidikan..."
 className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 text-sm rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 dark:border-emerald-700/80 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all shadow-xs disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800"
 />
 </div>

 {/* Units Grid */}
 {units.length === 0 && !loading ? (
 <div className="text-center py-10 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-dashed border-emerald-200/80 dark:border-emerald-800/60 text-xs text-slate-400">
 Belum ada data unit pendidikan yang tersedia di sistem.
 </div>
 ) : (
 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 {filtered.map((unit) => {
 const isSelected = selectedUnit === unit.id
 const IconComp = unit.icon

 return (
 <div
 key={unit.id}
 onClick={() => !disabled && setSelectedUnit(unit.id)}
 className={`relative p-5 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 ${
 disabled ? 'cursor-not-allowed border-emerald-200/80 dark:border-emerald-800/60 bg-slate-50/80 dark:bg-slate-800/40' : 'cursor-pointer'
 } ${
 isSelected
 ? 'border-[#059669] dark:border-[#10B981] bg-emerald-50/40 dark:bg-emerald-950/30 shadow-xs ring-2 ring-emerald-600/20'
 : 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/40 shadow-xs'
 }`}
 >
 {/* Icon Badge */}
 <div
 className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-colors ${
 isSelected
 ? 'bg-[#059669] dark:bg-[#10B981] text-amber-300 dark:text-slate-900 shadow-sm'
 : 'bg-emerald-100/70 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
 }`}
 >
 <IconComp />
 </div>

 {/* Text */}
 <div className="flex-1 min-w-0">
 <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 ">
 {unit.name}
 </h4>
 <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{unit.subtext}</p>
 </div>

 {/* Selection Checkmark */}
 {isSelected && (
 <div className="w-6 h-6 rounded-full bg-[#059669] dark:bg-[#10B981] text-white dark:text-slate-900 flex items-center justify-center shrink-0 shadow-xs">
 <FiCheck className="w-3.5 h-3.5 stroke-[3]" />
 </div>
 )}
 </div>
 )
 })}
 </div>
 )}

 {/* Action Button */}
 <div className="flex justify-end pt-4 border-t border-emerald-100/80 dark:border-emerald-800/60 gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
 <Button type="button" variant="primary" size="md" disabled={disabled || !selectedUnit || units.length === 0} onClick={handleSelect}>
 Pilih Unit Ini
 </Button>
 </div>
 </Card>
 )
}
