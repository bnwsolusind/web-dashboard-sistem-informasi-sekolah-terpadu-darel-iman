import { useEffect, useState, useMemo } from 'react'
import CustomSelect from '@/components/ui/CustomSelect'
import ActionDropdown from '../app/ActionDropdown'
import { useToast } from '../app'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
 Key,
 Plus,
 Search,
 X,
 UserCheck,
 UserX,
 GraduationCap,
 Briefcase,
 Users,
 ShieldCheck,
 CheckCircle2,
 Printer,
 FileText,
 CreditCard,
 Building2,
 Filter,
 Trash2,
 Sparkles,
 Lock,
 AlertTriangle,
 Info,
 ChevronLeft,
 ChevronRight,
 User,
 HeartHandshake,
 RotateCcw,
 Upload,
 Download,
 FileSpreadsheet,
 AlertCircle,
 Eye,
 EyeOff,
 Loader2,
} from 'lucide-react'
import { Chip as HeroChip, Button as HeroButton } from '@heroui/react'
import HeroUiFilterSelect from '../ui/HeroUiFilterSelect'
import { hakAksesService } from '../../services/hakAksesService'
import { employeeService } from '../../services/employeeService'
import { studentService } from '../../services/studentService'
import { educationUnitService } from '../../services/educationUnitService'
import api from '../../services/api'
import { useDebounce } from '../../hooks/useDebounce'
import { Pagination } from '../ui/pagination'
import { usePengaturanStore, resolveFoundationName } from '../../stores/pengaturanStore'
import { cn } from '../../lib/utils'

const DEFAULT_SYSTEM_ROLES = [
 'Super Admin',
 'Admin',
 'Pengurus Yayasan',
 'Kepala Sekolah',
 'Divisi Pendidikan',
 'Guru',
 'Musyrif',
 'Wali Kelas',
 'Tata Usaha',
 'Siswa',
 'Orang Tua',
]

const STANDALONE_ADMIN_ROLES = ['Super Admin', 'Admin', 'Pengurus Yayasan', 'Divisi Pendidikan']
const EMPLOYEE_ROLES = ['Guru', 'Pegawai', 'Wali Kelas', 'Guru Tahfizh', 'Pembimbing', 'Musyrif', 'Tata Usaha', 'Kepala Sekolah']
const STUDENT_ROLES = ['Siswa']
const PARENT_ROLES = ['Orang Tua']

const emptyForm = {
 name: '',
 email: '',
 phone: '',
 role: '',
 additional_roles: [],
 is_active: true,
 password: '',
 password_confirmation: '',
 person_type: 'standalone',
 person_id: null,
}

const getUserRoleName = (u) => {
 if (!u) return ''
 if (typeof u.role === 'string' && u.role.trim()) return u.role.trim()
 if (u.role?.name && typeof u.role.name === 'string') return u.role.name.trim()
 if (Array.isArray(u.roles) && u.roles.length > 0) {
 const r0 = u.roles[0]
 if (typeof r0 === 'string') return r0.trim()
 if (r0?.name && typeof r0.name === 'string') return r0.name.trim()
 if (r0?.slug && typeof r0.slug === 'string') return r0.slug.trim()
 }
 return ''
}

// ─────────────────────────────────────────────────────────────────
// MODAL CETAK KREDENSIAL AKUN & PASSWORD (WITH FILTERS)
// ─────────────────────────────────────────────────────────────────
function PrintCredentialsModal({ open, onClose, users = [] }) {
 const pengaturan = usePengaturanStore((state) => state.pengaturan)
 const foundationName = resolveFoundationName(pengaturan)
 const [filterUnit, setFilterUnit] = useState('semua')
 const [filterCategory, setFilterCategory] = useState('semua')
 const [printFormat, setPrintFormat] = useState('table') // 'table' | 'cards'

 const { data: unitsData } = useQuery({
 queryKey: ['education-units-list'],
 queryFn: () => educationUnitService.getDaftar({ per_page: 100 }),
 staleTime: 5 * 60 * 1000,
 })
 const educationUnits = useMemo(() => {
 const list = unitsData?.data || unitsData || []
 return Array.isArray(list) ? list : []
 }, [unitsData])

 if (!open) return null

 // Filtering users based on selected criteria
 const filteredUsers = users.filter((user) => {
 const roleName = getUserRoleName(user)
 const personType = user.person_type || (roleName === 'Siswa' ? 'student' : roleName === 'Orang Tua' ? 'parent' : 'employee')

 // Category Filter
 if (filterCategory === 'pegawai' && !(personType === 'employee' && !roleName.toLowerCase().includes('guru'))) return false
 if (filterCategory === 'guru' && !roleName.toLowerCase().includes('guru')) return false
 if (filterCategory === 'siswa' && !(personType === 'student' || roleName === 'Siswa')) return false
 if (filterCategory === 'orangtua' && !(personType === 'parent' || roleName === 'Orang Tua')) return false
 if (filterCategory === 'standalone' && personType !== 'standalone') return false

 // Unit Filter
 if (filterUnit !== 'semua') {
 const userUnitName = (user.unit?.name || user.unit?.nama || '').toLowerCase()
 if (!userUnitName.includes(filterUnit.toLowerCase())) return false
 }

 return true
 })

 const handlePrint = () => {
 const today = new Date().toLocaleDateString('id-ID', {
 day: 'numeric',
 month: 'long',
 year: 'numeric',
 })

 const categoryText =
 filterCategory === 'pegawai'
 ? 'Pegawai / Staf'
 : filterCategory === 'guru'
 ? 'Guru / Tenaga Pendidik'
 : filterCategory === 'siswa'
 ? 'Siswa / Santri'
 : filterCategory === 'orangtua'
 ? 'Orang Tua / Wali Murid'
 : filterCategory === 'standalone'
 ? 'Administrator Standalone'
 : 'Semua Kategori'

 const unitText = filterUnit === 'semua' ? 'Semua Unit Pendidikan' : filterUnit.toUpperCase()

 let contentHtml = ''

 if (printFormat === 'table') {
 contentHtml = `
 <table class="report-table">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th style="width: 5%; text-align: center;">NO</th>
 <th style="width: 25%;">NAMA LENGKAP PENGGUNA</th>
 <th style="width: 25%;">EMAIL / ID LOGIN</th>
 <th style="width: 15%;">ROLE PENUGASAN</th>
 <th style="width: 15%;">UNIT PENDIDIKAN</th>
 <th style="width: 15%; text-align: center;">PASSCODE / STATUS</th>
 </tr>
 </thead>
 <tbody>
 ${
 filteredUsers.length === 0
 ? '<tr><td colspan="6" style="text-align: center; padding: 20px;">Tidak ada data akun yang sesuai dengan kriteria filter.</td></tr>'
 : filteredUsers
 .map((u, idx) => {
 const rName = getUserRoleName(u) || 'Tanpa Role'
 const passDisplay = u.passcode || u.initial_password || '******** (Aktif)'
 return `
 <tr>
 <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
 <td><strong>${u.name}</strong></td>
 <td><code>${u.email}</code></td>
 <td>${rName}</td>
 <td>${u.unit?.name || u.unit?.nama || 'Yayasan / General'}</td>
 <td style="text-align: center; font-weight: bold; color: #0e5c44;">${passDisplay}</td>
 </tr>
 `
 })
 .join('')
 }
 </tbody>
 </table>
 `
 } else {
 contentHtml = `
 <div class="cards-grid">
 ${filteredUsers
 .map((u) => {
 const rName = getUserRoleName(u) || 'Tanpa Role'
 const passDisplay = u.passcode || u.initial_password || '********'
 return `
 <div class="card-item">
 <div class="card-header">
 <div class="card-title">SLIP AKUN LOGIN DARELIMAN EDU</div>
 <div class="card-subtitle">${foundationName}</div>
 </div>
 <div class="card-body">
 <div class="row"><span>Nama:</span> <strong>${u.name}</strong></div>
 <div class="row"><span>Email / User:</span> <code>${u.email}</code></div>
 <div class="row"><span>Password Awal:</span> <strong style="color: #0e5c44;">${passDisplay}</strong></div>
 <div class="row"><span>Role:</span> ${rName}</div>
 <div class="row"><span>Unit:</span> ${u.unit?.name || u.unit?.nama || 'Umum'}</div>
 </div>
 <div class="card-footer">
 Harap jaga kerahasiaan kata sandi Anda.
 </div>
 </div>
 `
 })
 .join('')}
 </div>
 `
 }

 const fullHtmlDocument = `
 <!DOCTYPE html>
 <html>
 <head>
 <title>Cetak Kredensial Akun Login Dareliman Edu</title>
 <style>
 @page { size: A4 portrait; margin: 15mm; }
 body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; color: #0f172a; margin: 0; padding: 0; }
 .header-kop { border-bottom: 2px solid #0e5c44; padding-bottom: 8px; margin-bottom: 12px; text-align: center; }
 .header-kop h2 { margin: 0; font-size: 16px; color: #0e5c44; font-weight: 800; text-transform: uppercase; }
 .header-kop h4 { margin: 2px 0 0 0; font-size: 12px; color: #1e293b; font-weight: 700; }
 .header-kop p { margin: 2px 0 0 0; font-size: 9px; color: #64748b; }
 
 .meta-info { display: flex; justify-content: space-between; margin-bottom: 12px; background: #f8fafc; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0; font-size: 10px; }
 .meta-info div { flex: 1; }

 .report-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
 .report-table th, .report-table td { border: 1px solid #cbd5e1; padding: 6px 8px; text-align: left; }
 .report-table th { background-color: #0e5c44; color: #ffffff; font-size: 10px; font-weight: 700; text-transform: uppercase; }
 .report-table tr:nth-child(even) { background-color: #f8fafc; }

 .cards-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
 .card-item { border: 1.5px solid #0e5c44; border-radius: 8px; overflow: hidden; page-break-inside: avoid; }
 .card-header { background: #0e5c44; color: #ffffff; padding: 6px 10px; }
 .card-title { font-weight: 800; font-size: 11px; }
 .card-subtitle { font-size: 9px; opacity: 0.9; }
 .card-body { padding: 10px 12px; font-size: 11px; }
 .card-body .row { display: flex; justify-content: space-between; padding: 3px 0; border-bottom: 1px dashed #e2e8f0; }
 .card-footer { background: #f1f5f9; padding: 5px 12px; font-size: 9px; text-align: center; color: #64748b; font-style: italic; }

 .ttd-section { margin-top: 30px; display: flex; justify-content: space-between; page-break-inside: avoid; }
 .ttd-box { text-align: center; width: 220px; }
 .ttd-space { height: 60px; }

 @media print {
 body { -webkit-print-color-adjust: exact; }
 }
 </style>
 </head>
 <body>
 <div class="header-kop">
 <h2>${foundationName.toUpperCase()}</h2>
 <h4>DARELIMAN EDU - SISTEM MANAJEMEN SEKOLAH TERPADU</h4>
 <p>${pengaturan?.address || 'Padang, Sumatera Barat'} • Telp: ${pengaturan?.phone || '-'} • Website: ${pengaturan?.website || '-'}</p>
 </div>

 <div style="text-align: center; margin-bottom: 12px;">
 <h3 style="margin: 0; font-size: 14px; text-transform: uppercase; color: #0f172a;">
 LAPORAN KREDENSIAL AKUN LOGIN &amp; PASSWORD PENGGUNA
 </h3>
 </div>

 <div class="meta-info">
 <div><strong>Kriteria Kategori:</strong> ${categoryText}</div>
 <div><strong>Unit Pendidikan:</strong> ${unitText}</div>
 <div><strong>Tanggal Cetak:</strong> ${today}</div>
 <div><strong>Total Akun:</strong> ${filteredUsers.length} Akun</div>
 </div>

 ${contentHtml}

 <div class="ttd-section">
 <div class="ttd-box">
 <p>Mengetahui,<br/><strong>Kepala Tata Usaha</strong></p>
 <div class="ttd-space"></div>
 <p>_______________________<br/>NIP. 19850112 201001 1 002</p>
 </div>
 <div class="ttd-box">
 <p>Padang, ${today}<br/><strong>Pengelola Sistem IT &amp; Akses</strong></p>
 <div class="ttd-space"></div>
 <p><strong>( _______________________ )</strong></p>
 </div>
 </div>
 </body>
 </html>
 `

 // Remove existing print iframe if any
 const existingFrame = document.getElementById('print-credentials-iframe')
 if (existingFrame) {
 existingFrame.remove()
 }

 // Create hidden iframe inside current page to trigger print without opening new tab
 const iframe = document.createElement('iframe')
 iframe.id = 'print-credentials-iframe'
 iframe.style.position = 'fixed'
 iframe.style.right = '0'
 iframe.style.bottom = '0'
 iframe.style.width = '0'
 iframe.style.height = '0'
 iframe.style.border = '0'
 document.body.appendChild(iframe)

 const doc = iframe.contentWindow.document
 doc.open()
 doc.write(fullHtmlDocument)
 doc.close()

 iframe.contentWindow.focus()
 setTimeout(() => {
 iframe.contentWindow.print()
 }, 250)
 }

 return (
 <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md overflow-y-auto">
 <div className="w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#1B2433] dark:border dark:border-emerald-800/60 my-6">
 {/* Modal Header */}
 <div className="flex items-center justify-between border-b border-emerald-100/80 dark:border-emerald-800/60 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 shadow-md shadow-sm">
 <Printer className="size-5" />
 </div>
 <div>
 <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>Cetak Kredensial Akun &amp; Password</span>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
 <Sparkles className="size-3" />
 Cetak / Slip
 </span>
 </h3>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
 Filter dan pratinjau data cetak secara langsung tanpa membuka tab browser baru.
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={onClose}
 className="rounded-xl p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 hover:text-slate-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors"
 >
 <X className="size-4" />
 </button>
 </div>

 {/* Modal Content / Filters & Live Preview */}
 <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 {/* Kriteria 1: Unit Pendidikan */}
 <div>
 <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
 <Building2 className="size-3.5 text-emerald-600" />
 <span>Kriteria 1: Unit Pendidikan</span>
 </label>
 <CustomSelect
 value={filterUnit}
 onChange={(e) => setFilterUnit(e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
 >
 <option value="semua">-- Semua Unit Pendidikan --</option>
 {educationUnits.map((u) => (
 <option key={u.id} value={u.name?.toLowerCase()}>
 {u.name}
 </option>
 ))}
 <option value="yayasan">Yayasan / General</option>
 </CustomSelect>
 </div>

 {/* Kriteria 2: Kategori Pengguna */}
 <div>
 <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
 <Filter className="size-3.5 text-emerald-600" />
 <span>Kriteria 2: Kategori Pengguna</span>
 </label>
 <CustomSelect
 value={filterCategory}
 onChange={(e) => setFilterCategory(e.target.value)}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
 >
 <option value="semua">-- Semua Kategori (Pegawai, Guru, Siswa, Ortu, Admin) --</option>
 <option value="pegawai">Pegawai / Staf Administrasi</option>
 <option value="guru">Guru / Tenaga Pendidik</option>
 <option value="siswa">Siswa / Santri</option>
 <option value="orangtua">Orang Tua / Wali Murid</option>
 <option value="standalone">Administrator Standalone</option>
 </CustomSelect>
 </div>
 </div>

 {/* Kriteria 3: Format Cetak */}
 <div>
 <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2">
 Format Tampilan Cetak:
 </label>
 <div className="grid grid-cols-2 gap-3">
 <button
 type="button"
 onClick={() => setPrintFormat('table')}
 className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
 printFormat === 'table'
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-sm'
 : 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700'
 }`}
 >
 <FileText className="size-4" />
 <span>1. Tabel Laporan A4</span>
 </button>
 <button
 type="button"
 onClick={() => setPrintFormat('cards')}
 className={`flex items-center justify-center gap-2 p-3 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
 printFormat === 'cards'
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-sm'
 : 'bg-slate-50 text-slate-700 dark:bg-slate-900 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-700/80 hover:bg-emerald-50 hover:text-emerald-700'
 }`}
 >
 <CreditCard className="size-4" />
 <span>2. Slip Kartu Individual</span>
 </button>
 </div>
 </div>

 {/* Live In-Modal Preview Box */}
 <div className="space-y-2 border-t border-emerald-100/80 dark:border-emerald-800/60 pt-3">
 <div className="flex items-center justify-between">
 <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Pratinjau Dokumen Cetak ({filteredUsers.length} Akun):
 </span>
 <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
 Live Preview
 </span>
 </div>

 <div className="max-h-48 overflow-y-auto rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-slate-50 dark:bg-slate-900 p-4 font-sans text-slate-800 dark:text-slate-100 text-xs space-y-3">
 <div className="text-center border-b border-emerald-200/80 dark:border-emerald-700/80 pb-2">
 <div className="font-black text-emerald-800 dark:text-emerald-400 text-sm">{foundationName.toUpperCase()}</div>
 <div className="font-bold text-slate-700 dark:text-slate-300 text-xs">LAPORAN KREDENSIAL AKUN LOGIN &amp; PASSWORD</div>
 <div className="text-[10px] text-slate-500">Unit: {filterUnit.toUpperCase()} | Category: {filterCategory}</div>
 </div>

 {printFormat === 'table' ? (
 <div className="overflow-x-auto">
 <table className="w-full text-left text-xs border-collapse">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr className="bg-emerald-800 text-white font-bold">
 <th className="p-1.5">NAMA</th>
 <th className="p-1.5">EMAIL / ID LOGIN</th>
 <th className="p-1.5">ROLE</th>
 <th className="p-1.5 text-center">PASSCODE</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-200/80 dark:divide-emerald-900/40">
 {filteredUsers.slice(0, 5).map((u, idx) => (
 <tr key={u.id || idx}>
 <td className="p-1.5 font-bold">{u.name}</td>
 <td className="p-1.5 font-mono">{u.email}</td>
 <td className="p-1.5">{getUserRoleName(u) || 'Role'}</td>
 <td className="p-1.5 text-center font-bold text-emerald-700 dark:text-emerald-400">********</td>
 </tr>
 ))}
 {filteredUsers.length > 5 && (
 <tr>
 <td colSpan={5} className="p-2 text-center text-[10px] italic text-slate-500">
 ... dan {filteredUsers.length - 5} akun lainnya akan disertakan saat cetak.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 ) : (
 <div className="grid grid-cols-2 gap-2">
 {filteredUsers.slice(0, 4).map((u, idx) => (
 <div key={u.id || idx} className="rounded-xl border border-emerald-600 bg-white dark:bg-slate-800 p-2 text-[10px]">
 <div className="font-extrabold text-emerald-800 dark:text-emerald-400 border-b pb-1">SLIP AKUN - {u.name}</div>
 <div className="mt-1 font-mono text-[9px] truncate">User: {u.email}</div>
 <div className="font-bold text-emerald-700">Pass: ********</div>
 </div>
 ))}
 </div>
 )}
 </div>
 </div>
 </div>

 {/* Modal Footer */}
 <div className="flex justify-end gap-2 border-t border-emerald-100/80 dark:border-emerald-800/60 bg-slate-50 dark:bg-slate-900 px-6 py-4">
 <button
 type="button"
 onClick={onClose}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 px-4 py-2 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={handlePrint}
 className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 dark:bg-emerald-50 dark:text-slate-900 dark: hover:from-emerald-700 hover:to-teal-700 px-5 py-2 text-xs font-extrabold shadow-md shadow-sm cursor-pointer transition-all text-white border border-emerald-600 h-9 text-sm font-medium"
 >
 <Printer className="size-3.5" />
 <span>Cetak / Print PDF Sekarang</span>
 </button>
 </div>
 </div>
 </div>
 )
}

function AccountModal({ open, user, roles = [], saving, onClose, onSave, roleOnly = false }) {
 const [method, setMethod] = useState('linked') // 'linked' (Tarik Data) vs 'manual' (Stand-Alone Admin)
 const [entityCategory, setEntityCategory] = useState('employee') // 'employee', 'student', 'parent'
 const [entitySearch, setEntitySearch] = useState('')
 const [selectedEntity, setSelectedEntity] = useState(null)
 const [dynamicEntities, setDynamicEntities] = useState([])
 const [loadingEntities, setLoadingEntities] = useState(false)

 const [form, setForm] = useState(emptyForm)
 const [formError, setFormError] = useState(null)
 const [showPassword, setShowPassword] = useState(false)
 const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
 const editing = Boolean(user?.id)

 // Fetch real entity list whenever entityCategory or open changes
 useEffect(() => {
 if (!open || editing) return
 setLoadingEntities(true)
 if (entityCategory === 'employee') {
 employeeService
 .getDaftar({ per_page: 50 })
 .then((res) => {
 const raw = res?.data?.data || res?.data || []
 if (Array.isArray(raw) && raw.length > 0) {
 const mapped = raw.map((item) => ({
 id: item.id,
 name: item.name || item.nama || item.full_name,
 code: item.niy ? `NIY: ${item.niy}` : item.nik ? `NIK: ${item.nik}` : `ID: ${item.id}`,
 unit: item.unit?.name || item.unit_name || 'Pegawai Sekolah',
 email: item.email || `${String(item.name).toLowerCase().replace(/\s+/g, '.')}@darel-iman.sch.id`,
 phone: item.no_hp || item.phone || '',
 defaultRole: 'Guru',
 }))
 setDynamicEntities(mapped)
 } else {
 setDynamicEntities([])
 }
 })
 .catch(() => setDynamicEntities([]))
 .finally(() => setLoadingEntities(false))
 } else if (entityCategory === 'student') {
 studentService
 .getDaftar({ per_page: 50 })
 .then((res) => {
 const raw = res?.data?.data || res?.data || []
 if (Array.isArray(raw) && raw.length > 0) {
 const mapped = raw.map((item) => ({
 id: item.id,
 name: item.full_name || item.nama || item.name,
 code: item.nisn ? `NISN: ${item.nisn}` : item.nis ? `NIS: ${item.nis}` : `ID: ${item.id}`,
 unit: item.kelas?.nama || item.unit?.name || 'Siswa Active',
 email: item.email || `${item.nisn || item.id}@siswa.darel-iman.sch.id`,
 phone: item.phone || item.no_hp || '',
 defaultRole: 'Siswa',
 }))
 setDynamicEntities(mapped)
 } else {
 setDynamicEntities([])
 }
 })
 .catch(() => setDynamicEntities([]))
 .finally(() => setLoadingEntities(false))
 } else if (entityCategory === 'parent') {
 api
 .get('/parents', { params: { per_page: 50 } })
 .then((res) => {
 const raw = res?.data?.data || res?.data || []
 if (Array.isArray(raw) && raw.length > 0) {
 const mapped = raw.map((item) => ({
 id: item.id,
 name: item.name || item.nama || item.father_name || item.mother_name || 'Orang Tua',
 code: item.nik ? `NIK: ${item.nik}` : `ID: ${item.id}`,
 unit: item.unit_name || 'Orang Tua / Wali',
 email: item.email || '',
 phone: item.phone || item.no_hp || '',
 defaultRole: 'Orang Tua',
 }))
 setDynamicEntities(mapped)
 } else {
 setDynamicEntities([])
 }
 })
 .catch(() => setDynamicEntities([]))
 .finally(() => setLoadingEntities(false))
 }
 }, [open, entityCategory, editing])

 // Filtered entity search
 const filteredEntities = useMemo(() => {
 if (!entitySearch) return dynamicEntities
 return dynamicEntities.filter(
 (e) =>
 e.name?.toLowerCase().includes(entitySearch.toLowerCase()) ||
 e.code?.toLowerCase().includes(entitySearch.toLowerCase()) ||
 e.unit?.toLowerCase().includes(entitySearch.toLowerCase())
 )
 }, [dynamicEntities, entitySearch])

 // Role options calculation depending on method and entityCategory
 const currentRoles = useMemo(() => {
 if (editing && user) {
 const userRole = getUserRoleName(user)
 const list = Array.from(
 new Set([
 userRole,
 ...(Array.isArray(roles) && roles.length > 0 ? roles : []),
 ...DEFAULT_SYSTEM_ROLES,
 ])
 ).filter(Boolean)
 return list
 }
 if (method === 'manual') {
 return Array.isArray(roles) && roles.length > 0
 ? Array.from(new Set([...STANDALONE_ADMIN_ROLES, ...roles, ...DEFAULT_SYSTEM_ROLES]))
 : DEFAULT_SYSTEM_ROLES
 }
 if (entityCategory === 'employee') return EMPLOYEE_ROLES
 if (entityCategory === 'student') return STUDENT_ROLES
 if (entityCategory === 'parent') return PARENT_ROLES
 return Array.isArray(roles) && roles.length > 0 ? roles : DEFAULT_SYSTEM_ROLES
 }, [editing, user, method, entityCategory, roles])

 // Sync Form State when Modal opens
 useEffect(() => {
 if (!open) return
 if (editing && user) {
 const userRoleName = getUserRoleName(user)
 const userRolesList = Array.isArray(user.roles)
 ? user.roles.map((r) => (typeof r === 'string' ? r : r?.name)).filter(Boolean)
 : []
 const extraRoles = userRolesList.filter((r) => r !== userRoleName)

 setForm({
 ...emptyForm,
 name: user.name || '',
 email: user.email || '',
 phone: user.phone || '',
 role: userRoleName || 'Guru',
 additional_roles: extraRoles,
 is_active: Boolean(user.is_active ?? true),
 person_type: user.person_type || 'standalone',
 person_id: user.person_id || null,
 password: '',
 password_confirmation: '',
 })
 setMethod('manual')
 } else {
 setForm({
 ...emptyForm,
 role: 'Guru',
 person_type: 'employee',
 password: '',
 password_confirmation: '',
 })
 setMethod('linked')
 setEntityCategory('employee')
 setSelectedEntity(null)
 setEntitySearch('')
 setShowPassword(false)
 setShowPasswordConfirm(false)
 }
 }, [open, user, editing])

 const handleSwitchMethod = (newMethod) => {
 setMethod(newMethod)
 if (newMethod === 'manual') {
 setSelectedEntity(null)
 setForm((prev) => ({
 ...prev,
 name: '',
 email: '',
 phone: '',
 role: 'Super Admin',
 person_type: 'standalone',
 person_id: null,
 }))
 } else {
 const defaultRole = entityCategory === 'employee' ? 'Guru' : entityCategory === 'student' ? 'Siswa' : 'Orang Tua'
 setForm((prev) => ({
 ...prev,
 role: defaultRole,
 person_type: entityCategory,
 }))
 }
 }

 const handleSwitchCategory = (cat) => {
 setEntityCategory(cat)
 setSelectedEntity(null)
 const defaultRole = cat === 'employee' ? 'Guru' : cat === 'student' ? 'Siswa' : 'Orang Tua'
 setForm((prev) => ({
 ...prev,
 role: defaultRole,
 person_type: cat,
 person_id: null,
 }))
 }

 if (!open) return null

 const handleSelectEntity = (entity) => {
 setSelectedEntity(entity)
 setForm((prev) => ({
 ...prev,
 name: entity.name,
 email: entity.email || prev.email,
 phone: entity.phone || prev.phone,
 role: entity.defaultRole || currentRoles[0],
 person_type: entityCategory,
 person_id: entity.id,
 }))
 }

 const change = (key, value) => setForm((current) => ({ ...current, [key]: value }))

 const submit = (event) => {
 event.preventDefault()
 setFormError(null)
 if (!editing && form.password !== form.password_confirmation) {
 setFormError('Password baru dan konfirmasi password harus sama.')
 return
 }

 if (editing && form.password) {
 if (form.password.length < 8) {
 setFormError('Password baru minimal 8 karakter.')
 return
 }
 if (form.password !== form.password_confirmation) {
 setFormError('Password baru dan konfirmasi password harus sama.')
 return
 }
 }

 if (!editing && method === 'linked' && !selectedEntity) {
 setFormError('Silakan pilih salah satu nama Pegawai/Guru, Siswa, atau Orang Tua dari daftar.')
 return
 }

 const payload = roleOnly
 ? { role: form.role }
 : editing
 ? {
 name: form.name,
 email: form.email,
 phone: form.phone || null,
 role: form.role,
 additional_roles: form.additional_roles || [],
 is_active: form.is_active,
 ...(form.password
 ? {
 password: form.password,
 password_confirmation: form.password_confirmation,
 }
 : {}),
 }
 : {
 ...form,
 creation_method: method,
 person_type: method === 'manual' ? 'standalone' : entityCategory,
 person_id: method === 'manual' ? null : selectedEntity?.id || null,
 employee_id: entityCategory === 'employee' ? selectedEntity?.id : null,
 student_id: entityCategory === 'student' ? selectedEntity?.id : null,
 parent_id: entityCategory === 'parent' ? selectedEntity?.id : null,
 }

 onSave(payload)
 }

 return (
 <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md overflow-y-auto">
 <form onSubmit={submit} className="w-full max-w-xl overflow-hidden rounded-xl bg-white shadow-2xl dark:bg-[#1B2433] dark:border dark:border-emerald-800/60 my-8">
 {/* Header */}
 <div className="flex items-center justify-between border-b border-emerald-100/80 dark:border-emerald-800/60 px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/70 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-700/80 dark:text-emerald-300 shadow-md shadow-sm">
 <ShieldCheck className="size-5" />
 </div>
 <div>
 <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
 <span>{roleOnly ? 'Edit Akun Unit' : editing ? 'Edit Akun Login' : 'Tambah Akun Login Baru'}</span>
 </h3>
 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
 {editing
 ? 'Perbarui informasi dan role akses akun login terdaftar.'
 : 'Pilih metode pembuatan akun: tarik dari data terdaftar atau input manual admin standalone.'}
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={onClose}
 className="rounded-xl p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-700 hover:text-slate-700 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300 transition-colors"
 >
 <X className="size-4" />
 </button>
 </div>

 {formError && (
 <div className="mx-6 mt-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300">
 <AlertTriangle className="size-4 shrink-0 text-amber-600" />
 <span>{formError}</span>
 </div>
 )}

 {/* Method Selector Tabs (Only when Creating New Account) */}
 {!editing && !roleOnly && (
 <div className="p-4 pb-0 bg-slate-50/70 dark:bg-slate-900/50 border-b border-emerald-100/80 dark:border-emerald-800/60">
 <label className="block text-xs font-extrabold text-slate-700 dark:text-slate-300 mb-2">
 Metode Pembuatan Akun:
 </label>
 <div className="grid grid-cols-2 gap-2">
 <button
 type="button"
 onClick={() => handleSwitchMethod('linked')}
 className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
 method === 'linked'
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-sm'
 : 'bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-700/80'
 }`}
 >
 <Briefcase className="size-3.5" />
 <span>1. Tarik Data Terdaftar</span>
 </button>
 <button
 type="button"
 onClick={() => handleSwitchMethod('manual')}
 className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer ${
 method === 'manual'
 ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-sm'
 : 'bg-white text-slate-600 hover:bg-slate-100 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-700/80'
 }`}
 >
 <ShieldCheck className="size-3.5" />
 <span>2. Manual (Admin Standalone)</span>
 </button>
 </div>
 </div>
 )}

 <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
 {/* METHOD 1: LINKED ENTITY LOOKUP */}
 {!editing && !roleOnly && method === 'linked' && (
 <div className="space-y-3.5 rounded-xl p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40">
 <label className="block text-xs font-extrabold text-emerald-900 dark:text-emerald-300">
 Langkah 1: Pilih Kategori Entitas Terdaftar
 </label>
 <div className="grid grid-cols-3 gap-2">
 <button
 type="button"
 onClick={() => handleSwitchCategory('employee')}
 className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
 entityCategory === 'employee'
 ? 'bg-emerald-600 text-white shadow-sm'
 : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-700/80 hover:bg-slate-50'
 }`}
 >
 <Briefcase className="size-4" />
 <span>Pegawai / Guru</span>
 </button>
 <button
 type="button"
 onClick={() => handleSwitchCategory('student')}
 className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
 entityCategory === 'student'
 ? 'bg-emerald-600 text-white shadow-sm'
 : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-700/80 hover:bg-slate-50'
 }`}
 >
 <GraduationCap className="size-4" />
 <span>Siswa</span>
 </button>
 <button
 type="button"
 onClick={() => handleSwitchCategory('parent')}
 className={`flex flex-col items-center gap-1 p-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
 entityCategory === 'parent'
 ? 'bg-emerald-600 text-white shadow-sm'
 : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-emerald-200/80 dark:border-emerald-700/80 hover:bg-slate-50'
 }`}
 >
 <Users className="size-4" />
 <span>Orang Tua / Wali</span>
 </button>
 </div>

 {/* Entity Search & Dropdown List */}
 <div className="space-y-2 pt-1">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
 Langkah 2: Cari &amp; Pilih Nama {entityCategory === 'employee' ? 'Pegawai / Guru' : entityCategory === 'student' ? 'Siswa' : 'Orang Tua'}
 </label>
 <div className="relative">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white size-3.5" />
 <input
 type="text"
 value={entitySearch}
 onChange={(e) => setEntitySearch(e.target.value)}
 placeholder={`Cari nama, ${entityCategory === 'employee' ? 'NIP/NIY' : entityCategory === 'student' ? 'NISN' : 'No. HP'}...`}
 className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 focus:outline-none focus:ring-2 focus:ring-emerald-600"
 />
 </div>

 <div className="max-h-40 overflow-y-auto rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-900 divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
 {loadingEntities ? (
 <div className="p-3 text-center text-xs text-slate-400">Memuat data entitas...</div>
 ) : filteredEntities.length === 0 ? (
 <div className="p-3 text-center text-xs text-slate-400">Data entitas tidak ditemukan.</div>
 ) : (
 filteredEntities.map((entity) => {
 const isSelected = selectedEntity?.id === entity.id
 return (
 <div
 key={entity.id}
 onClick={() => handleSelectEntity(entity)}
 className={`p-2.5 flex items-center justify-between text-xs cursor-pointer transition-colors ${
 isSelected
 ? 'bg-emerald-100/90 dark:bg-emerald-950/80 font-bold text-emerald-900 dark:text-emerald-200'
 : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
 }`}
 >
 <div>
 <div className="font-extrabold flex items-center gap-1.5">
 <span>{entity.name}</span>
 {isSelected && <CheckCircle2 className="text-emerald-600 size-3.5" />}
 </div>
 <div className="text-[10px] text-slate-500 dark:text-slate-400">
 {entity.code} • {entity.unit}
 </div>
 </div>
 <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
 Pilih
 </span>
 </div>
 )
 })
 )}
 </div>
 </div>
 </div>
 )}

 {/* FORM FIELDS */}
 <div className="grid gap-4 sm:grid-cols-2">
 <label className="sm:col-span-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Nama Pengguna
 <input
 required
 value={form.name}
 onChange={(e) => change('name', e.target.value)}
 placeholder="Masukkan nama pengguna"
 className="mt-1 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-600"
 />
 </label>

 <label className="sm:col-span-2 text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Username / Email Login
 <input
 required
 type="email"
 value={form.email}
 onChange={(e) => change('email', e.target.value)}
 placeholder="contoh@darel-iman.sch.id"
 className="mt-1 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-600"
 />
 </label>

 {!roleOnly && (
 <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Nomor HP / WhatsApp
 <input
 value={form.phone}
 onChange={(e) => change('phone', e.target.value)}
 placeholder="08123456789"
 className="mt-1 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-600"
 />
 </label>
 )}

 <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 Role Penugasan
 <CustomSelect
 required
 value={form.role}
 onChange={(e) => {
 const newRole = e.target.value
 change('role', newRole)
 if (form.additional_roles?.includes(newRole)) {
 change(
 'additional_roles',
 form.additional_roles.filter((r) => r !== newRole)
 )
 }
 }}
 className="mt-1 w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-900 px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
 >
 <option value="">-- Pilih Role --</option>
 {currentRoles.map((roleName) => (
 <option key={roleName} value={roleName}>
 {roleName}
 </option>
 ))}
 </CustomSelect>
 </label>

 {/* Opsi Peran Tambahan untuk Pegawai/Guru */}
 {(form.person_type === 'employee' || entityCategory === 'employee' || form.role === 'Guru') && (
 <div className="sm:col-span-2 rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3.5 dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <div className="flex items-center justify-between mb-1.5">
 <span className="text-xs font-extrabold text-emerald-950 dark:text-emerald-200">
 Tugas / Peran Tambahan (Modular Multi-Role)
 </span>
 <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-900/50 px-2 py-0.5 rounded-full">
 Opsional
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
 Pilih tugas rangkap untuk pegawai (misal: Guru Tahfizh, Pembimbing Mutaba'ah, Musyrif Asrama).
 </p>
 <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
 {EMPLOYEE_ROLES.filter((r) => r !== form.role && !['Kepala Sekolah', 'Tata Usaha'].includes(r)).map((r) => {
 const isChecked = form.additional_roles?.includes(r)
 return (
 <label
 key={r}
 onClick={() => {
 const currentExtra = form.additional_roles || []
 const updated = currentExtra.includes(r)
 ? currentExtra.filter((item) => item !== r)
 : [...currentExtra, r]
 change('additional_roles', updated)
 }}
 className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all select-none ${
 isChecked
 ? 'border-emerald-500 bg-white dark:bg-slate-900 text-emerald-900 dark:text-emerald-200 shadow-2xs'
 : 'border-emerald-200/80 bg-slate-50/50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 hover:bg-white'
 }`}
 >
 <input
 type="checkbox"
 checked={isChecked}
 onChange={() => {}}
 className="size-3.5 rounded text-emerald-600 focus:ring-emerald-500 pointer-events-none"
 />
 <span className="truncate">{r}</span>
 </label>
 )
 })}
 </div>
 </div>
 )}

 {!roleOnly && (
 <>
 <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 {editing ? (
 <span>
 Ubah Password <span className="font-normal text-slate-400">(Opsional, kosongkan jika tidak diubah)</span>
 </span>
 ) : (
 <span>
 Password Awal <span className="text-rose-500">*</span>
 </span>
 )}
 <div className="relative mt-1">
 <input
 required={!editing}
 minLength={8}
 type={showPassword ? 'text' : 'password'}
 value={form.password}
 onChange={(e) => change('password', e.target.value)}
 placeholder={editing ? 'Ketik password baru jika ingin mengubah...' : 'Minimal 8 karakter'}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-900 pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-600"
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 transition-colors"
 title={showPassword ? 'Sembunyikan password' : 'Lihat ketikan password'}
 >
 {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
 </button>
 </div>
 </label>
 <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
 {editing ? (
 <span>
 Konfirmasi Password Baru <span className="font-normal text-slate-400">(Jika password diisi)</span>
 </span>
 ) : (
 <span>
 Konfirmasi Password <span className="text-rose-500">*</span>
 </span>
 )}
 <div className="relative mt-1">
 <input
 required={!editing || Boolean(form.password)}
 minLength={8}
 type={showPasswordConfirm ? 'text' : 'password'}
 value={form.password_confirmation}
 onChange={(e) => change('password_confirmation', e.target.value)}
 placeholder={editing ? 'Ulangi password baru...' : 'Ulangi password awal'}
 className="w-full rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 bg-white dark:bg-slate-900 pl-3.5 pr-10 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-600"
 />
 <button
 type="button"
 onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 transition-colors"
 title={showPasswordConfirm ? 'Sembunyikan password' : 'Lihat ketikan password'}
 >
 {showPasswordConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
 </button>
 </div>
 </label>
 </>
 )}

 {!roleOnly && (
 <label className="sm:col-span-2 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 pt-1 cursor-pointer">
 <input
 type="checkbox"
 checked={form.is_active}
 onChange={(e) => change('is_active', e.target.checked)}
 className="size-4 rounded text-emerald-600 focus:ring-emerald-600 accent-emerald-600"
 />
 <span>Akun aktif dan diizinkan login ke portal</span>
 </label>
 )}
 </div>
 </div>

 {/* Footer */}
 <div className="flex justify-end gap-2 border-t border-emerald-100/80 dark:border-emerald-800/60 bg-slate-50 dark:bg-slate-900 px-6 py-4">
 <button
 type="button"
 onClick={onClose}
 className="rounded-xl border border-emerald-200/80 dark:border-emerald-700/80 px-4 py-2 text-xs font-extrabold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
 >
 Batal
 </button>
 <button
 disabled={saving}
 className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 dark:bg-slate-100 dark:text-slate-900 dark: hover:from-emerald-700 hover:to-teal-700 px-5 py-2 text-xs font-extrabold shadow-md shadow-sm disabled:opacity-50 cursor-pointer transition-all text-white border border-emerald-600 h-9 text-sm font-medium"
 >
 <ShieldCheck className="size-4" />
 <span>{saving ? 'Menyimpan...' : 'Simpan Akun Login'}</span>
 </button>
 </div>
 </form>
 </div>
 )
}



// ── RESET PASSWORD MODAL ───────────────────────────────────────────────────
function ResetPasswordModal({ isOpen, onClose, onConfirm, user, isSubmitting }) {
 const [password, setPassword] = useState('')
 const [passwordConfirmation, setPasswordConfirmation] = useState('')
 const [showPassword, setShowPassword] = useState(false)
 const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
 const [error, setError] = useState(null)

 useEffect(() => {
 if (isOpen) {
 setPassword('')
 setPasswordConfirmation('')
 setShowPassword(false)
 setShowPasswordConfirm(false)
 setError(null)
 }
 }, [isOpen])

 if (!isOpen || !user) return null

 const handleSubmit = (e) => {
 e.preventDefault()
 if (!password || password.length < 8) {
 setError('Password baru minimal harus 8 karakter.')
 return
 }
 if (password !== passwordConfirmation) {
 setError('Password dan konfirmasi harus sama.')
 return
 }
 setError(null)
 onConfirm({ password, password_confirmation: passwordConfirmation })
 }

 return (
 <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
 <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <form onSubmit={handleSubmit} className="p-6">
 <div className="flex items-center gap-3.5 mb-4">
 <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-md shadow-sm">
 <Key className="size-5" />
 </div>
 <div>
 <span className="inline-block rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
 Keamanan Akun
 </span>
 <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
 Reset Password {user.name}
 </h3>
 </div>
 </div>

 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
 Masukkan password baru untuk akun <strong>{user.email}</strong>.
 </p>

 {error && (
 <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
 <AlertTriangle className="size-4 shrink-0 text-rose-600" />
 <span>{error}</span>
 </div>
 )}

 <div className="space-y-3 mb-6">
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
 Password Baru
 </label>
 <div className="relative">
 <input
 type={showPassword ? 'text' : 'password'}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="Minimal 8 karakter..."
 className="w-full rounded-xl border border-emerald-200/80 pl-3.5 pr-10 py-2 text-xs font-medium dark:border-emerald-700/80 dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
 required
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 transition-colors"
 title={showPassword ? 'Sembunyikan password' : 'Lihat ketikan password'}
 >
 {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
 </button>
 </div>
 </div>
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
 Konfirmasi Password
 </label>
 <div className="relative">
 <input
 type={showPasswordConfirm ? 'text' : 'password'}
 value={passwordConfirmation}
 onChange={(e) => setPasswordConfirmation(e.target.value)}
 placeholder="Ulangi password baru..."
 className="w-full rounded-xl border border-emerald-200/80 pl-3.5 pr-10 py-2 text-xs font-medium dark:border-emerald-700/80 dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500"
 required
 />
 <button
 type="button"
 onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 transition-colors"
 title={showPasswordConfirm ? 'Sembunyikan password' : 'Lihat ketikan password'}
 >
 {showPasswordConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
 </button>
 </div>
 </div>
 </div>

 <div className="flex items-center justify-end gap-3">
 <button
 type="button"
 onClick={onClose}
 disabled={isSubmitting}
 className="rounded-xl border border-emerald-200/80 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-emerald-700/80 dark:text-slate-300 dark:hover:bg-slate-800 transition-all cursor-pointer"
 >
 Batal
 </button>
 <button
 type="submit"
 disabled={isSubmitting}
 className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-[#1B2433] px-5 py-2 text-xs font-bold shadow-md shadow-sm hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer"
 >
 <Key className="size-3.5" />
 <span>{isSubmitting ? 'Menyimpan...' : 'Reset Password'}</span>
 </button>
 </div>
 </form>
 </div>
 </div>
 )
}

// ── HARMONIZED DELETE MODAL ───────────────────────────────────────────────
function HarmonizedDeleteModal({ isOpen, onClose, onConfirm, user, isSubmitting }) {
 if (!isOpen || !user) return null
 return (
 <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
 <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] shadow-sm dark:border-emerald-800/60 dark:bg-[#1B2433]">
 <div className="p-6">
 <div className="flex items-center gap-3.5 mb-4">
 <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-600 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-400 shadow-md shadow-sm">
 <Trash2 className="size-6 text-emerald-600" />
 </div>
 <div>
 <span className="inline-block rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
 Hapus Akun
 </span>
 <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
 Hapus Akun {user.name}?
 </h3>
 </div>
 </div>
 <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
 Akun akan dikeluarkan dari semua sesi dan tidak dapat login lagi ke sistem.
 </p>
 <div className="flex items-center justify-end gap-3">
 <button
 type="button"
 onClick={onClose}
 disabled={isSubmitting}
 className="rounded-xl border border-emerald-200/80 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-emerald-700/80 dark:text-slate-300 dark:hover:bg-slate-800 transition-all cursor-pointer"
 >
 Batal
 </button>
 <button
 type="button"
 onClick={onConfirm}
 disabled={isSubmitting}
 className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-sm hover:brightness-105 disabled:opacity-50 transition-all cursor-pointer"
 >
 <Trash2 className="size-3.5" />
 <span>{isSubmitting ? 'Menghapus...' : 'Ya, Hapus Akun'}</span>
 </button>
 </div>
 </div>
 </div>
 </div>
 )
}

// ── HARMONIZED IMPORT MODAL ──────────────────────────────────────────────
function HarmonizedImportModal({
 isOpen,
 onClose,
 onSubmit,
 importFile,
 setImportFile,
 overwriteExisting,
 setOverwriteExisting,
 isImporting,
}) {
 if (!isOpen) return null

 return (
 <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
 <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white dark:bg-[#182232]/80 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#182232]">

 {/* Header */}
 <div className="flex items-center justify-between border-b border-emerald-100/80 p-5 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex size-11 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] shadow-md shadow-sky-500/20">
 <Upload className="size-5" />
 </div>
 <div>
 <h3 className="text-base font-bold text-slate-900 dark:text-white">
 Import Akun Pengguna
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Unggah berkas Excel (.xlsx, .xls) atau CSV data akun
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={onClose}
 className="flex size-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
 >
 <X className="size-4" />
 </button>
 </div>

 {/* Content */}
 <form onSubmit={onSubmit} className="p-6 space-y-4">
 {/* Download Template Card */}
 <div className="flex items-center justify-between rounded-xl border border-emerald-200/80 bg-slate-50/60 p-3.5 dark:border-emerald-800/60 dark:bg-slate-900/40">
 <div className="flex items-center gap-2.5">
 <FileSpreadsheet className="size-5 text-emerald-600 dark:text-emerald-400" />
 <div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
 Unduh Format Template
 </p>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Gunakan kolom: name, email, role, phone, password, is_active
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => hakAksesService.downloadUserTemplate()}
 className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 shadow-xs hover:bg-emerald-50 dark:border-emerald-700 dark:bg-slate-800 dark:text-emerald-300 dark:hover:bg-slate-700 transition cursor-pointer"
 >
 <Download className="size-3.5" />
 <span>Template CSV</span>
 </button>
 </div>

 {/* Dropzone */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
 Pilih Berkas Excel / CSV
 </label>
 <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-300/80 bg-sky-50/30 p-6 hover:bg-sky-50/60 dark:border-sky-800/60 dark:bg-sky-950/20 dark:hover:bg-sky-950/30 transition cursor-pointer">
 <input
 type="file"
 accept=".xlsx,.xls,.csv"
 onChange={(e) => setImportFile(e.target.files?.[0] || null)}
 className="hidden"
 />
 <FileSpreadsheet className="size-8 text-sky-600 dark:text-sky-400 mb-2" />
 {importFile ? (
 <div className="text-center">
 <p className="text-xs font-bold text-sky-700 dark:text-sky-300">
 {importFile.name}
 </p>
 <p className="text-[10px] text-slate-400 mt-0.5">
 {(importFile.size / 1024).toFixed(1)} KB — Klik untuk ganti berkas
 </p>
 </div>
 ) : (
 <div className="text-center">
 <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
 Klik atau seret berkas ke sini
 </p>
 <p className="text-[10px] text-slate-400 mt-0.5">
 Mendukung .xlsx, .xls, atau .csv (maksimal 5MB)
 </p>
 </div>
 )}
 </label>
 </div>

 {/* Opsi Timpa Data Jika Ada yang Sama */}
 <div
 className={cn(
 'rounded-xl border p-4 transition-all duration-200',
 overwriteExisting
 ? 'border-amber-300/80 bg-amber-50/70 dark:border-amber-700/60 dark:bg-amber-950/25'
 : 'border-emerald-200/80 bg-slate-50/50 dark:border-emerald-800/60 dark:bg-slate-900/30'
 )}
 >
 <label className="flex items-start gap-3 cursor-pointer select-none">
 <input
 type="checkbox"
 checked={overwriteExisting}
 onChange={(e) => setOverwriteExisting(e.target.checked)}
 className="mt-0.5 h-4.5 w-4.5 rounded-lg border-emerald-300 text-amber-600 focus:ring-amber-500 dark:border-emerald-700/80 dark:bg-slate-800 cursor-pointer"
 />
 <div className="flex-1 text-xs">
 <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
 <span>Timpa data jika email akun sudah terdaftar</span>
 {overwriteExisting ? (
 <span className="rounded-full bg-amber-200/80 px-2 py-0.5 text-[10px] font-extrabold text-amber-900 dark:bg-amber-900/80 dark:text-amber-200">
 Mode Timpa Aktif
 </span>
 ) : (
 <span className="rounded-full bg-sky-50 border border-sky-200/80 px-2 py-0.5 text-[10px] font-bold text-sky-700 dark:bg-sky-950/60 dark:text-sky-300">
 Lewati Duplikat
 </span>
 )}
 </span>
 <p className="mt-1 text-slate-500 dark:text-slate-400 leading-relaxed text-xs">
 Jika dicentang, akun dengan email yang sama akan diperbarui dengan data nama, telepon, peran, dan password terbaru. Jika tidak dicentang, baris duplikat akan dilewati dengan aman.
 </p>
 </div>
 </label>
 </div>

 {/* Actions */}
 <div className="flex items-center justify-end gap-3 pt-2">
 <button
 type="button"
 onClick={onClose}
 disabled={isImporting}
 className="rounded-xl border border-emerald-200/80 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:border-emerald-700/80 dark:text-slate-300 dark:hover:bg-slate-800 transition cursor-pointer"
 >
 Batal
 </button>
 <button
 type="submit"
 disabled={!importFile || isImporting}
 className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-[#1B2433] px-5 py-2 text-xs font-bold shadow-md shadow-sm hover:brightness-105 disabled:opacity-50 transition cursor-pointer"
 >
 <Upload className="size-3.5" />
 <span>{isImporting ? 'Memproses...' : 'Mulai Impor Akun'}</span>
 </button>
 </div>
 </form>
 </div>
 </div>
 )
}

// ── HARMONIZED DUPLICATE REPORT MODAL ──────────────────────────────────────
function HarmonizedDuplicateModal({ data, onClose }) {
 if (!data) return null

 const duplicates = data.duplicates || []

 return (
 <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
 <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white dark:bg-[#182232]/80 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#182232]">

 {/* Header */}
 <div className="flex items-center justify-between border-b border-emerald-100/80 p-5 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300 shadow-md shadow-sm">
 <AlertCircle className="size-5" />
 </div>
 <div>
 <h3 className="text-base font-bold text-slate-900 dark:text-white">
 Laporan Hasil Impor Akun Pengguna
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Ringkasan sinkronisasi dan status pemrosesan data akun pengguna
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={onClose}
 className="flex size-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
 >
 <X className="size-4" />
 </button>
 </div>

 {/* Body */}
 <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
 {/* KPI Cards */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
 <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3 text-center dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Baru</p>
 <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{data.berhasil || 0}</p>
 </div>
 <div className="rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 text-center dark:border-amber-800/60 dark:bg-amber-950/30">
 <p className="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">Ditimpa</p>
 <p className="text-lg font-black text-amber-700 dark:text-amber-300 mt-0.5">{data.diperbarui || 0}</p>
 </div>
 <div className="rounded-xl border border-sky-200/80 bg-sky-50/50 p-3 text-center dark:border-sky-800/60 dark:bg-sky-950/30">
 <p className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider">Dilewati</p>
 <p className="text-lg font-black text-sky-700 dark:text-sky-300 mt-0.5">{data.duplikat || 0}</p>
 </div>
 <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3 text-center dark:border-rose-800/60 dark:bg-rose-950/30">
 <p className="text-[10px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider">Gagal</p>
 <p className="text-lg font-black text-rose-700 dark:text-rose-300 mt-0.5">{data.gagal || 0}</p>
 </div>
 </div>

 {/* Details Table */}
 {duplicates.length > 0 && (
 <div className="space-y-2">
 <p className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
 <span>Rincian Data Yang Sesuai / Terdeteksi Duplikat</span>
 <span className="text-xs text-slate-500 font-normal">
 {duplicates.length} item
 </span>
 </p>
 <div className="max-h-56 overflow-auto rounded-xl border border-emerald-200/80 bg-white dark:border-emerald-800/60 dark:bg-slate-900/60">
 <table className="w-full text-left text-xs">
 <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 text-xs font-bold uppercase tracking-wider text-emerald-950 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 dark:border-emerald-800/80 dark:text-emerald-300">
 <tr>
 <th className="px-3.5 py-2.5">Baris</th>
 <th className="px-3.5 py-2.5">Email</th>
 <th className="px-3.5 py-2.5">Nama Akun</th>
 <th className="px-3.5 py-2.5">Status</th>
 <th className="px-3.5 py-2.5">Keterangan</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40 text-xs">
 {duplicates.map((dup, idx) => (
 <tr key={idx} className="hover:bg-emerald-50/40 transition-colors dark:hover:bg-emerald-950/30">
 <td className="px-3.5 py-2 font-mono text-slate-500">#{dup.baris || idx + 1}</td>
 <td className="px-3.5 py-2 font-mono font-semibold text-slate-900 dark:text-white">{dup.kode || '-'}</td>
 <td className="px-3.5 py-2 font-medium text-slate-700 dark:text-slate-200">{dup.nama || '-'}</td>
 <td className="px-3.5 py-2">
 <span
 className={cn(
 'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold',
 dup.status === 'Ditimpa'
 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
 : 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
 )}
 >
 {dup.status}
 </span>
 </td>
 <td className="px-3.5 py-2 text-slate-500 dark:text-slate-400">{dup.keterangan || '-'}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </div>

 {/* Footer */}
 <div className="flex items-center justify-end border-t border-emerald-100/80 bg-slate-50/50 px-6 py-3.5 dark:border-emerald-800/60 dark:bg-slate-900/30">
 <button
 type="button"
 onClick={onClose}
 className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-[#1B2433] px-5 py-2 text-xs font-bold shadow-md hover:from-emerald-700 hover:to-teal-800 transition cursor-pointer"
 >
 <span>Mengerti</span>
 </button>
 </div>
 </div>
 </div>
 )
}

function HarmonizedSyncResultModal({ data, onClose }) {
 if (!data) return null
 const totalBaru = data.total_baru || 0

 return (
 <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
 <div className="relative w-full max-w-md overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 shadow-2xl shadow-emerald-950/20 bg-white dark:bg-[#182232]/80 bg-white shadow-2xl shadow-sm dark:border-emerald-800/60 dark:bg-[#182232]">

 {/* Header */}
 <div className="flex items-center justify-between border-b border-emerald-100/80 p-5 dark:border-emerald-800/60">
 <div className="flex items-center gap-3">
 <div className="flex size-11 items-center justify-center rounded-xl bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300 shadow-md shadow-sm">
 <Sparkles className="size-5" />
 </div>
 <div>
 <h3 className="text-base font-bold text-slate-900 dark:text-white">
 Hasil Sinkronisasi Akun Otomatis
 </h3>
 <p className="text-xs text-slate-500 dark:text-slate-400">
 Pembaruan akun login terintegrasi untuk entitas terdaftar
 </p>
 </div>
 </div>
 <button
 type="button"
 onClick={onClose}
 className="flex size-8 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
 >
 <X className="size-4" />
 </button>
 </div>

 {/* Body */}
 <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
 {/* KPI Summary */}
 <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
 <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3 text-center dark:border-emerald-800/60 dark:bg-emerald-950/30">
 <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">Total Baru</p>
 <p className="text-lg font-black text-emerald-700 dark:text-emerald-300 mt-0.5">{totalBaru}</p>
 </div>
 <div className="rounded-xl border border-teal-200/80 bg-teal-50/50 p-3 text-center dark:border-teal-800/60 dark:bg-teal-950/30">
 <p className="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase tracking-wider">Pegawai/Guru</p>
 <p className="text-lg font-black text-teal-700 dark:text-teal-300 mt-0.5">{data.pegawai || 0}</p>
 </div>
 <div className="rounded-xl border border-sky-200/80 bg-sky-50/50 p-3 text-center dark:border-sky-800/60 dark:bg-sky-950/30">
 <p className="text-[10px] font-bold text-sky-800 dark:text-sky-300 uppercase tracking-wider">Siswa/Santri</p>
 <p className="text-lg font-black text-sky-700 dark:text-sky-300 mt-0.5">{data.siswa || 0}</p>
 </div>
 <div className="rounded-xl border border-violet-200/80 bg-violet-50/50 p-3 text-center dark:border-violet-800/60 dark:bg-violet-950/30">
 <p className="text-[10px] font-bold text-violet-800 dark:text-violet-300 uppercase tracking-wider">Orang Tua</p>
 <p className="text-lg font-black text-violet-700 dark:text-violet-300 mt-0.5">{data.orang_tua || 0}</p>
 </div>
 </div>

 <div className="rounded-xl border border-emerald-200/80 bg-slate-50/60 p-4 dark:border-emerald-800/60 dark:bg-slate-900/50 space-y-2 text-xs">
 <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold">
 <Info className="size-4 text-emerald-600 shrink-0" />
 <span>Ketentuan Akun Hasil Sinkronisasi:</span>
 </div>
 <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 pl-1">
 <li>
 Password Default Awal: <code className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded">{data.default_password || 'Password123!'}</code>
 </li>
 <li>
 Status Keamanan: <span className="font-semibold text-amber-700 dark:text-amber-400">Password Default (Wajib Ganti)</span>.
 </li>
 <li>
 Akun yang sudah ada sebelumnya <strong>aman dan tidak diubah</strong>.
 </li>
 </ul>
 </div>
 </div>

 {/* Footer */}
 <div className="flex items-center justify-end border-t border-emerald-100/80 bg-slate-50/50 px-6 py-3.5 dark:border-emerald-800/60 dark:bg-slate-900/30">
 <button
 type="button"
 onClick={onClose}
 className="inline-flex items-center gap-1.5 rounded-xl bg-white dark:bg-[#1B2433] px-5 py-2 text-xs font-bold shadow-md hover:from-emerald-700 hover:to-teal-800 transition cursor-pointer"
 >
 <span>Tutup &amp; Tinjau Daftar Akun</span>
 </button>
 </div>
 </div>
 </div>
 )
}

export default function UserAccountManagement({
 roles = [],
 unitId = '',
 canManageGlobalAccess = false,
 canManageUnitAccess = false,
}) {
 const queryClient = useQueryClient()
 const [search, setSearch] = useState('')
 const debouncedSearch = useDebounce(search, 350)
 const [page, setPage] = useState(1)
 const [categoryFilter, setCategoryFilter] = useState('semua')
 const [selectedUnitFilter, setSelectedUnitFilter] = useState(unitId || '')
 const [modalOpen, setModalOpen] = useState(false)
 const [selected, setSelected] = useState(null)
 const [printModalOpen, setPrintModalOpen] = useState(false)
 const [resetTargetUser, setResetTargetUser] = useState(null)
 const [deleteTargetUser, setDeleteTargetUser] = useState(null)
 const [isResetting, setIsResetting] = useState(false)
 const [isImportModalOpen, setIsImportModalOpen] = useState(false)
 const [importFile, setImportFile] = useState(null)
 const [overwriteExisting, setOverwriteExisting] = useState(false)
 const [duplicateModalData, setDuplicateModalData] = useState(null)
 const [isImporting, setIsImporting] = useState(false)
 const [isSyncing, setIsSyncing] = useState(false)
 const [syncResultModalData, setSyncResultModalData] = useState(null)

 const syncEntitiesMutation = useMutation({
 mutationFn: hakAksesService.syncEntities,
 onSuccess: (res) => {
 setIsSyncing(false)
 queryClient.invalidateQueries({ queryKey: ['hak-akses-users'] })
 queryClient.invalidateQueries({ queryKey: ['hak-akses-roles'] })
 const resData = res?.data || res || {}
 setSyncResultModalData(resData)
 toastSuccess('Sinkronisasi Selesai', res?.message || 'Akun pengguna berhasil disinkronkan.')
 },
 onError: (err) => {
 setIsSyncing(false)
 queryClient.invalidateQueries({ queryKey: ['hak-akses-users'] })
 queryClient.invalidateQueries({ queryKey: ['hak-akses-roles'] })
 const isNetworkTimeout =
 err?.message === 'Network Error' ||
 err?.code === 'ECONNABORTED' ||
 err?.message?.includes('timeout')
 const errorMsg = isNetworkTimeout
 ? 'Koneksi ke server terputus atau melebihi batas waktu (Timeout). Sebagian atau seluruh akun mungkin sudah berhasil dibuat, silakan muat ulang halaman.'
 : err?.response?.data?.message || err?.message || 'Gagal menyinkronkan akun.'
 toastError('Gagal Sinkronisasi', errorMsg)
 },
 })

 useEffect(() => {
 setSelectedUnitFilter(unitId || '')
 }, [unitId])

 const toast = useToast()
 const toastSuccess = (title, message) => toast.success(title, message)
 const toastError = (title, message) => toast.error(title, message)

 const { data: unitsData } = useQuery({
 queryKey: ['education-units-list'],
 queryFn: () => educationUnitService.getDaftar({ per_page: 100 }),
 staleTime: 5 * 60 * 1000,
 })
 const educationUnits = useMemo(() => {
 const list = unitsData?.data || unitsData || []
 return Array.isArray(list) ? list : []
 }, [unitsData])

 const { data = {}, isLoading } = useQuery({
 queryKey: ['hak-akses-users', debouncedSearch, page, selectedUnitFilter, categoryFilter],
 queryFn: () =>
 hakAksesService.getUsers({
 search: debouncedSearch,
 page,
 unit_id: selectedUnitFilter,
 category: categoryFilter,
 }),
 })

 const finish = (response) => {
 queryClient.invalidateQueries({ queryKey: ['hak-akses-users'] })
 queryClient.invalidateQueries({ queryKey: ['hak-akses-roles'] })
 setModalOpen(false)
 setSelected(null)
 setResetTargetUser(null)
 setDeleteTargetUser(null)

 const isStandalone = response?.data?.person_type === 'standalone' || response?.person_type === 'standalone'
 toastSuccess(
 'Akun Login Berhasil Disimpan',
 isStandalone
 ? 'Akun Administrator Mandiri (Standalone) telah dibuat dan langsung aktif.'
 : response?.message || 'Data akun login berhasil terhubung dengan data entitas terdaftar.'
 )
 }

 const fail = (error) =>
 toastError(
 'Gagal',
 error.response?.data?.message || Object.values(error.response?.data?.errors || {})[0]?.[0] || 'Operasi akun gagal.'
 )

 const create = useMutation({ mutationFn: hakAksesService.tambahUser, onSuccess: finish, onError: fail })
 const update = useMutation({ mutationFn: hakAksesService.ubahUser, onSuccess: finish, onError: fail })
 const remove = useMutation({ mutationFn: hakAksesService.hapusUser, onSuccess: finish, onError: fail })
 const roleOnly = canManageUnitAccess && !canManageGlobalAccess

 const save = (payload) =>
 selected
 ? update.mutate({ id: selected.id, payload })
 : canManageGlobalAccess && create.mutate(payload)

 const resetPassword = (user) => {
 setResetTargetUser(user)
 }

 const handleConfirmResetPassword = async (payload) => {
 if (!resetTargetUser) return
 setIsResetting(true)
 try {
 const response = await hakAksesService.resetPassword({ id: resetTargetUser.id, payload })
 finish(response)
 toastSuccess('Password Berhasil Direset', `Password akun untuk ${resetTargetUser.name} telah berhasil direset.`)
 } catch (error) {
 fail(error)
 } finally {
 setIsResetting(false)
 }
 }

 const deleteUser = (user) => {
 setDeleteTargetUser(user)
 }

 const handleConfirmDeleteUser = () => {
 if (!deleteTargetUser) return
 remove.mutate(deleteTargetUser.id)
 }

 const handleProcessImport = async (e) => {
 if (e) e.preventDefault()
 if (!importFile) {
 toastError('Berkas Belum Dipilih', 'Silakan pilih berkas Excel atau CSV terlebih dahulu.')
 return
 }
 setIsImporting(true)
 try {
 const formData = new FormData()
 formData.append('file', importFile)
 formData.append('overwrite', overwriteExisting ? '1' : '0')
 const res = await hakAksesService.importUsers(formData)
 const resData = res?.data || res || {}
 setIsImporting(false)
 setImportFile(null)
 setIsImportModalOpen(false)
 queryClient.invalidateQueries({ queryKey: ['hak-akses-users'] })
 queryClient.invalidateQueries({ queryKey: ['hak-akses-roles'] })

 const totalBerhasil = (resData.berhasil || 0) + (resData.diperbarui || 0)
 const msg = `Impor selesai. ${totalBerhasil} berhasil (${resData.berhasil || 0} baru, ${resData.diperbarui || 0} ditimpa), ${resData.duplikat || 0} duplikat dilewati, ${resData.gagal || 0} gagal.`
 if (resData.gagal > 0 && totalBerhasil === 0) {
 toastError('Import Gagal', msg)
 } else {
 toastSuccess('Import Berhasil', msg)
 }

 if ((resData.duplicates && resData.duplicates.length > 0) || (resData.errors && resData.errors.length > 0) || resData.diperbarui > 0 || resData.duplikat > 0) {
 setDuplicateModalData(resData)
 }
 } catch (err) {
 setIsImporting(false)
 const msg = err?.response?.data?.message || err.message || 'Gagal memproses impor data akun pengguna.'
 toastError('Import Gagal', msg)
 }
 }

 const users = data.data || []
 const meta = data.meta || {}

 return (
 <div className="space-y-4">


 {/* ── HEROUI EMERALD DATATABLE CONTAINER ─────────────────────────── */}
 <div className="relative overflow-hidden rounded-2xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-md shadow-sm dark:bg-[#1B2433]">
 {/* Toolbar Header (Baris 1: Judul, Status Count & Aksi) */}
 <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/90 dark:border-emerald-800/60 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="flex items-center gap-3">
 <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 border border-emerald-200/70 text-slate-700 dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300 shadow-md shadow-sm">
 <Users className="size-5" />
 </div>
 <div>
 <div className="flex items-center gap-2">
 <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
 Daftar Akun Pengguna
 </h2>
 <span className="inline-flex items-center rounded-full bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 text-[10px] font-black text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
 {meta.total || users.length} Akun
 </span>
 </div>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Kelola akun autentikasi login, keterikatan entitas, dan hak akses peran sistem.
 </p>
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto flex-wrap">
 {/* Tombol Sinkronisasi Akun Otomatis */}
 {canManageGlobalAccess && (
 <button
 type="button"
 disabled={isSyncing}
 onClick={() => {
 setIsSyncing(true)
 syncEntitiesMutation.mutate()
 }}
 className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300 bg-white dark:bg-[#1B2433] hover:from-emerald-100 hover:to-teal-100 text-emerald-800 dark:from-emerald-950/60 dark:to-teal-950/60 dark:border-emerald-700 dark:text-emerald-300 px-3.5 py-2 text-xs font-black transition-all shadow-xs hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-95 disabled:opacity-50"
 title="Tarik & perbarui akun login otomatis untuk seluruh pegawai, siswa, dan orang tua baru yang belum punya akun"
 >
 {isSyncing ? (
 <Loader2 className="size-3.5 animate-spin text-emerald-600" />
 ) : (
 <Sparkles className="size-3.5 text-emerald-600" />
 )}
 <span>{isSyncing ? 'Menyinkronkan...' : '⚡ Sinkronkan Akun Otomatis'}</span>
 </button>
 )}

 {/* Import Data Akun Button */}
 {canManageGlobalAccess && (
 <button
 type="button"
 onClick={() => {
 setImportFile(null)
 setOverwriteExisting(false)
 setIsImportModalOpen(true)
 }}
 className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-white dark:bg-[#1B2433] hover:from-sky-100 hover:to-blue-100 text-sky-700 dark:from-sky-950/50 dark:to-blue-950/50 dark:border-sky-800 dark:text-sky-300 px-3.5 py-2 text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-95"
 >
 <Upload className="size-3.5" />
 <span>Import Akun</span>
 </button>
 )}

 {/* Cetak Data Login Button */}
 <button
 type="button"
 onClick={() => setPrintModalOpen(true)}
 className="inline-flex items-center justify-center gap-2 rounded-xl border border-sky-200 bg-white dark:bg-[#1B2433] hover:from-sky-100 hover:to-blue-100 text-sky-700 dark:from-sky-950/50 dark:to-blue-950/50 dark:border-sky-800 dark:text-sky-300 px-3.5 py-2 text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer hover:scale-[1.02] active:scale-95"
 >
 <Printer className="size-3.5" />
 <span>Cetak Kredensial</span>
 </button>

 {canManageGlobalAccess && (
 <button
 type="button"
 onClick={() => {
 setSelected(null)
 setModalOpen(false)
 setTimeout(() => setModalOpen(true), 10)
 }}
 className="inline-flex items-center justify-center gap-2 rounded-xl bg-white dark:bg-[#1B2433] px-4 py-2 text-xs font-bold shadow-md shadow-sm hover:brightness-105 cursor-pointer hover:scale-[1.02] active:scale-95 transition-all"
 >
 <Plus className="size-3.5" />
 <span>Tambah Akun Baru</span>
 </button>
 )}
 </div>
 </div>

 {/* Toolbar Baris 2: Search Bar */}
 <div className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-emerald-200/80 dark:border-emerald-800/60 p-3 sm:p-4">
 <div className="relative w-full">
 <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-emerald-600 dark:text-emerald-400" />
 <input
 type="text"
 value={search}
 onChange={(e) => {
 setSearch(e.target.value)
 setPage(1)
 }}
 placeholder="Cari nama pengguna atau email login..."
 className="w-full pl-10 pr-10 py-2 rounded-xl border border-emerald-200/90 dark:border-emerald-800/60 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
 />
 {search && (
 <button
 type="button"
 onClick={() => {
 setSearch('')
 setPage(1)
 }}
 className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
 >
 <X className="size-3.5" />
 </button>
 )}
 </div>
 </div>

 {/* Toolbar Baris 3: Filter Bar (Hero UI Chips & Unit Selector) */}
 <div className="bg-white dark:bg-[#1B2433] border-b border-emerald-200/80 dark:border-emerald-800/60 p-3 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
 {/* Hero UI Chip Filter Kategori */}
 <div className="flex items-center gap-1.5 flex-wrap">
 <span className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
 <Filter className="size-3 text-emerald-600" />
 <span>Peran:</span>
 </span>

 {[
 { id: 'semua', label: 'Semua', icon: Users, color: 'default' },
 { id: 'orangtua', label: 'Orang Tua / Wali', icon: HeartHandshake, color: 'success' },
 { id: 'siswa', label: 'Siswa / Santri', icon: GraduationCap, color: 'primary' },
 { id: 'guru', label: 'Guru / Pendidik', icon: Briefcase, color: 'warning' },
 { id: 'pegawai', label: 'Pegawai / Staf', icon: Building2, color: 'default' },
 { id: 'standalone', label: 'Admin Standalone', icon: ShieldCheck, color: 'secondary' },
 ].map((cat) => {
 const Icon = cat.icon
 const isSelected = categoryFilter === cat.id
 return (
 <HeroChip
 key={cat.id}
 size="sm"
 variant={isSelected ? 'solid' : 'bordered'}
 color={isSelected ? cat.color : 'default'}
 onClick={() => {
 setCategoryFilter(cat.id)
 setPage(1)
 }}
 className={`inline-flex items-center gap-1.5 cursor-pointer font-bold transition-all text-xs select-none hover:scale-105 active:scale-95 ${
 isSelected
 ? 'shadow-xs ring-1 ring-emerald-500/30'
 : 'border-emerald-300 dark:border-emerald-700/80 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-emerald-500'
 }`}
 >
 <Icon className="size-3.5 shrink-0" />
 <span>{cat.label}</span>
 </HeroChip>
 )
 })}
 </div>

 {/* Filter Unit Pendidikan (Termasuk Unit Pendidikan Anak) */}
 <div className="flex items-center gap-2 shrink-0">
 <HeroUiFilterSelect
 value={selectedUnitFilter}
 onChange={(val) => {
 setSelectedUnitFilter(val)
 setPage(1)
 }}
 options={[
 { value: '', label: 'Semua Unit (Termasuk Unit Anak)' },
 ...educationUnits.map((u) => ({
 value: String(u.id),
 label: u.name || u.nama_unit || u.code,
 })),
 ]}
 placeholder="Semua Unit"
 icon={Building2}
 ariaLabel="Filter unit pendidikan akun"
 size="sm"
 searchable
 className="w-full sm:w-auto min-w-[200px]"
 />

 {(categoryFilter !== 'semua' || selectedUnitFilter !== '' || search) && (
 <HeroButton
 size="sm"
 variant="light"
 color="danger"
 onClick={() => {
 setCategoryFilter('semua')
 setSelectedUnitFilter('')
 setSearch('')
 setPage(1)
 }}
 className="text-xs font-bold gap-1 h-8 rounded-xl cursor-pointer"
 >
 <RotateCcw className="size-3" />
 <span>Reset</span>
 </HeroButton>
 )}
 </div>
 </div>

 {/* Datatable Table */}
 <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gradient-to-r from-emerald-100/90 via-teal-50/70 to-emerald-100/90 border-b-2 border-emerald-200/90 dark:from-emerald-950/90 dark:via-teal-950/70 dark:to-emerald-950/90 text-emerald-950 dark:text-emerald-200 font-extrabold uppercase tracking-wider text-xs">
                  <tr>
                    <th className="px-4 sm:px-6 py-3.5">PENGGUNA &amp; EMAIL</th>
                    <th className="px-4 py-3.5">PERAN &amp; ENTITAS</th>
                    <th className="px-4 py-3.5">KEAMANAN PASSWORD</th>
                    <th className="px-4 py-3.5 text-center">STATUS</th>
                    <th className="px-4 py-3.5 text-right w-16 sm:w-20 select-none"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-100/80 dark:divide-emerald-900/40">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-xs text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <div className="size-6 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                          <span>Memuat data akun pengguna...</span>
                        </div>
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-12 text-center text-xs text-slate-400">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Info className="size-8 text-slate-300 dark:text-slate-600" />
                          <span className="font-bold text-slate-600 dark:text-slate-300">Akun tidak ditemukan</span>
                          <span className="text-xs text-slate-400">Coba gunakan kata kunci pencarian yang lain.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => {
                      const roleDisplay = getUserRoleName(user) || 'Tanpa role'
                      const personType = user.person_type || (roleDisplay === 'Siswa' ? 'student' : roleDisplay === 'Orang Tua' ? 'parent' : 'employee')

                      return (
                        <tr key={user.id} className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20 transition-colors">
                          <td className="px-4 sm:px-6 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold text-xs shadow-xs">
                                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div className="min-w-0">
                                <p className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            <div className="flex flex-col gap-1 items-start">
                              <span className="inline-flex items-center rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 px-2 py-0.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                {roleDisplay}
                              </span>
                              {personType === 'standalone' ? (
                                <span className="text-[10px] text-amber-600 font-semibold">Standalone Admin</span>
                              ) : personType === 'student' ? (
                                <span className="text-[10px] text-sky-600 font-semibold">Siswa {user.unit?.nama ? `• ${user.unit.nama}` : ''}</span>
                              ) : personType === 'parent' ? (
                                <span className="text-[10px] text-violet-600 font-semibold">Orang Tua {user.unit?.nama ? `• ${user.unit.nama}` : ''}</span>
                              ) : (
                                <span className="text-[10px] text-emerald-600 font-semibold">Pegawai / Guru {user.unit?.nama ? `• ${user.unit.nama}` : ''}</span>
                              )}
                            </div>
                          </td>

                          <td className="px-4 py-3.5">
                            {user.must_change_password ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/80 dark:bg-amber-950/80 px-2.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300 border border-amber-300">
                                  <AlertTriangle className="size-3.5 text-amber-600 shrink-0" />
                                  <span>Password Default</span>
                                </span>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                                  <ShieldCheck className="size-3.5 text-emerald-600 shrink-0" />
                                  <span>Sudah Diganti</span>
                                </span>
                              </div>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-center">
                            {user.is_active ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                                <UserCheck className="size-3.5" />
                                <span>Aktif</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800">
                                <UserX className="size-3.5" />
                                <span>Nonaktif</span>
                              </span>
                            )}
                          </td>

                          <td className="px-4 py-3.5 text-right">
                            <div className="flex justify-end">
                              <ActionDropdown
                                onEdit={() => {
                                  setSelected(user)
                                  setModalOpen(true)
                                }}
                                onDelete={canManageGlobalAccess ? () => deleteUser(user) : undefined}
                                extraItems={
                                  canManageGlobalAccess || canManageUnitAccess
                                    ? [
                                        {
                                          label: 'Reset Password',
                                          icon: <Key className="size-4 text-amber-500" />,
                                          onClick: () => resetPassword(user),
                                        },
                                      ]
                                    : []
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
 </div>

 {/* Datatable Footer & HeroUI Pagination */}
 <div className="p-4 border-t border-emerald-100/80 dark:border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#1B2433]">
 <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
 Menampilkan <strong className="text-slate-800 dark:text-slate-200">{users.length}</strong> akun (Halaman {page} dari {meta.last_page || 1})
 </span>

 <Pagination
 currentPage={page}
 totalPages={meta.last_page || 1}
 onPageChange={(newPage) => setPage(newPage)}
 sideLayout="icon"
 variant="default"
 />
 </div>
 </div>

 {/* Modals */}
 <AccountModal
 open={modalOpen}
 user={selected}
 roles={roles}
 roleOnly={roleOnly}
 saving={create.isPending || update.isPending}
 onClose={() => {
 setModalOpen(false)
 setSelected(null)
 }}
 onSave={save}
 />

 <PrintCredentialsModal
 open={printModalOpen}
 onClose={() => setPrintModalOpen(false)}
 users={users}
 />

 <ResetPasswordModal
 isOpen={Boolean(resetTargetUser)}
 user={resetTargetUser}
 isSubmitting={isResetting}
 onClose={() => setResetTargetUser(null)}
 onConfirm={handleConfirmResetPassword}
 />

 <HarmonizedDeleteModal
 isOpen={Boolean(deleteTargetUser)}
 user={deleteTargetUser}
 isSubmitting={remove.isPending}
 onClose={() => setDeleteTargetUser(null)}
 onConfirm={handleConfirmDeleteUser}
 />

 <HarmonizedImportModal
 isOpen={isImportModalOpen}
 onClose={() => {
 setIsImportModalOpen(false)
 setImportFile(null)
 }}
 onSubmit={handleProcessImport}
 importFile={importFile}
 setImportFile={setImportFile}
 overwriteExisting={overwriteExisting}
 setOverwriteExisting={setOverwriteExisting}
 isImporting={isImporting}
 />

 <HarmonizedDuplicateModal
 data={duplicateModalData}
 onClose={() => setDuplicateModalData(null)}
 />

 <HarmonizedSyncResultModal
 data={syncResultModalData}
 onClose={() => setSyncResultModalData(null)}
 />
 </div>
 )
}
