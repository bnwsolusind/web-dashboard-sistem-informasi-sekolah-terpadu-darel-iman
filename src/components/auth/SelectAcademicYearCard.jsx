import { useState, useEffect } from 'react'
import { FiCalendar, FiCheckCircle } from 'react-icons/fi'
import { tahunAjaranService } from '../../services/tahunAjaranService'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertContent, AlertDescription, AlertIndicator } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import HeroUiFilterSelect from '../ui/HeroUiFilterSelect'

export default function SelectAcademicYearCard({ onNavigate, disabled = false }) {
 const [year, setYear] = useState('')
 const [semester, setSemester] = useState('Ganjil')
 const [academicYears, setAcademicYears] = useState([])
 const [isLoading, setIsLoading] = useState(true)
 const [savedNotice, setSavedNotice] = useState(null)

 useEffect(() => {
 setIsLoading(true)
 tahunAjaranService
 .getDaftar()
 .then((res) => {
 const data = res?.data?.data || res?.data || []
 if (Array.isArray(data) && data.length > 0) {
 setAcademicYears(data)
 const activeYear = data.find((y) => y.is_active || y.status === 'Aktif') || data[0]
 setYear(activeYear.nama || activeYear.tahun_ajaran || '')
 } else {
 setAcademicYears([])
 }
 })
 .catch((err) => {
 console.error('Gagal memuat tahun ajaran:', err)
 setAcademicYears([])
 })
 .finally(() => {
 setIsLoading(false)
 })
 }, [])

 const handleContinue = () => {
 if (disabled) return
 setSavedNotice(`Tahun Ajaran Aktif berhasil disetel ke: ${year} (${semester})`)
 setTimeout(() => {
 setSavedNotice(null)
 if (onNavigate) onNavigate(8)
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
 <span>Pilih Tahun Ajaran</span>
 {disabled && (
 <Badge color="warning" size="sm">
 🔒 Terkunci (Non-Aktif)
 </Badge>
 )}
 </h2>
 <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
 {disabled
 ? 'Tahun ajaran aktif terikat pada sistem dan tidak dapat diubah.'
 : 'Tentukan tahun ajaran dan semester aktif yang digunakan untuk rekapitulasi data.'}
 </p>
 </div>

 {savedNotice && (
 <Alert status="success" className="rounded-xl">
 <AlertIndicator>
 <FiCheckCircle className="w-4 h-4" />
 </AlertIndicator>
 <AlertContent>
 <AlertDescription>{savedNotice}</AlertDescription>
 </AlertContent>
 </Alert>
 )}

 {/* Inputs Grid */}
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
 Tahun Ajaran
 </label>
 <HeroUiFilterSelect
 value={year}
 disabled={disabled || isLoading || academicYears.length === 0}
 onChange={(val) => setYear(val)}
 options={
 isLoading
 ? [{ value: '', label: 'Memuat tahun ajaran...' }]
 : academicYears.length === 0
 ? [{ value: '', label: 'Tidak ada tahun ajaran tersedia' }]
 : academicYears.map((ay) => ({
 value: String(ay.nama || ay.tahun_ajaran),
 label: String(ay.nama || ay.tahun_ajaran),
 }))
 }
 placeholder="Pilih Tahun Ajaran"
 ariaLabel="Tahun Ajaran"
 size="md"
 className="w-full"
 />
 </div>

 <div>
 <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
 Semester
 </label>
 <HeroUiFilterSelect
 value={semester}
 disabled={disabled}
 onChange={(val) => setSemester(val)}
 options={[
 { value: 'Ganjil', label: 'Ganjil' },
 { value: 'Genap', label: 'Genap' },
 ]}
 placeholder="Pilih Semester"
 ariaLabel="Semester"
 size="md"
 className="w-full"
 />
 </div>
 </div>

 {/* Summary Card */}
 <div className="bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl p-5 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs space-y-4">
 <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-2">
 <FiCalendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
 <span>Informasi Tahun Ajaran Aktif</span>
 </h3>

 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-xl p-4 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs">
 <div>
 <span className="text-xs text-slate-400 block font-medium">Tahun Ajaran</span>
 <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{year || '-'}</span>
 </div>

 <div>
 <span className="text-xs text-slate-400 block font-medium">Semester</span>
 <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{semester}</span>
 </div>

 <div>
 <span className="text-xs text-slate-400 block font-medium">Periode</span>
 <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
 {(() => {
 if (!year) return '-'
 const parts = year.split('/')
 const startY = parts[0]
 const endY = parts[1] || startY
 return semester === 'Genap'
 ? `Januari ${endY} - Juni ${endY}`
 : `Juli ${startY} - Desember ${startY}`
 })()}
 </span>
 </div>

 <div>
 <span className="text-xs text-slate-400 block font-medium mb-0.5">Status</span>
 <Badge color="success" size="sm" prefixIcon={FiCheckCircle}>
 Aktif
 </Badge>
 </div>
 </div>
 </div>

 {/* Action Button */}
 <div className="flex justify-end pt-4 border-t border-emerald-100/80 dark:border-emerald-800/60 gap-1.5 sm:gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
 <Button type="button" variant="primary" size="md" disabled={disabled || !year || academicYears.length === 0} onClick={handleContinue}>
 Lanjutkan
 </Button>
 </div>
 </Card>
 )
}
