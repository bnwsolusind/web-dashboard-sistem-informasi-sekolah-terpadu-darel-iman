import { AppButton, IconButton } from '../app'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
 GraduationCap,
 Sparkles,
 ChevronLeft,
 ChevronRight,
 ChevronDown,
 Save,
 X,
 ArrowLeft,
 ArrowRight,
 Upload,
 Trash2,
 AlertTriangle,
 User,
 UserCheck,
 Hash,
 MapPin,
 Phone,
 Mail,
 Building,
 Building2,
 Briefcase,
 Calendar,
 Users,
 BookOpen,
 ShieldCheck,
 CreditCard,
 HeartHandshake,
 School,
 Compass,
 Award,
 IdCard,
} from 'lucide-react'
import { getProvinsiList, getKotaOptions, getKecamatanOptions, getKelurahanOptions, getBirthPlaceOptions } from './wilayahData'
import AddressMap from './AddressMap'
import { DatePicker } from '@/components/ui/date-picker'
import HeroUiFilterSelect from '../ui/HeroUiFilterSelect'
import { educationUnitService } from '../../services/educationUnitService'
import { kelasService } from '../../services/kelasService'
import { tahunAjaranService } from '../../services/tahunAjaranService'
import { modaTransportasiService, FALLBACK_MODA_TRANSPORTASI } from '../../services/modaTransportasiService'
import { businessOptionService } from '../../services/businessOptionService'
import { studentStatusService } from '../../services/studentStatusService'
import { codeGeneratorService } from '../../services/codeGeneratorService'
import { api } from '../../services/api'
import { useProvinsiList, useKotaOptions, useKecamatanOptions, useKelurahanOptions } from '../../hooks/useWilayah'
import PersonAvatar, { resolveAvatarUrl } from '../ui/PersonAvatar'

const defaultForm = () => ({
 jenis_pendaftaran: 'baru', unit_asal_id: '',
 foto_url: '', no_pendaftaran: '', nik: '', no_registrasi_akta_lahir: '', no_kk: '', nis: '', nisn: '', full_name: '', birth_date: '', birth_place: '', gender: 'male', agama: 'Islam', email: '', anak_ke: '', jumlah_saudara: '', jumlah_saudara_tiri: '', berat_badan: '', tinggi_badan: '', riwayat_penyakit: '', kewarganegaraan: 'WNI', alamat_siswa: '', rt: '', rw: '', dusun: '', kelurahan: '', kecamatan: '', kode_pos: '', kota_kabupaten: '', provinsi: '', jenis_tempat_tinggal: '', jarak_tempuh_ke_sekolah: '', moda_transportasi: '', hobi: '', cita_cita: '', latitude: '', longitude: '',
 sekolah_asal: '', status_sekolah_asal: 'Formal', provinsi_sekolah_asal: '', kota_kab_sekolah_asal: '', kecamatan_sekolah_asal: '', kelurahan_sekolah_asal: '', nomor_hp_wa_sekolah_asal: '', nominal_spp: '', nominal_ortu_asuh: '', penerima_kps_pkh: 'tidak', apakah_punya_kip: 'tidak', apakah_layak_menerima_pip: 'tidak', alasan_menolak_pip: '',
 nik_ayah: '', nama_ayah: '', tempat_lahir_ayah: '', tgl_lahir_ayah: '', telfon_ayah: '', hp_ayah: '', pendidikan_terakhir_ayah: '', pekerjaan_ayah: '', instansi_pekerjaan_ayah: '', jabatan_pekerjaan_ayah: '', alamat_instansi_ayah: '', keahlian_ayah: '', penghasilan_ayah: '', alamat_ayah: '', nomor_wa_ayah: '', medsos_ayah: '',
 nik_ibu: '', nama_ibu: '', tempat_lahir_ibu: '', tgl_lahir_ibu: '', telfon_ibu: '', hp_ibu: '', pendidikan_terakhir_ibu: '', pekerjaan_ibu: '', instansi_pekerjaan_ibu: '', jabatan_pekerjaan_ibu: '', alamat_instansi_ibu: '', keahlian_ibu: '', penghasilan_ibu: '', alamat_ibu: '', nomor_wa_ibu: '', medsos_ibu: '',
 status_pernikahan_wali: '', tanggungan_anak_wali: '', nik_wali: '', nama_wali: '', tempat_lahir_wali: '', tgl_lahir_wali: '', telfon_wali: '', hp_wali: '', pendidikan_terakhir_wali: '', pekerjaan_wali: '', instansi_pekerjaan_wali: '', jabatan_pekerjaan_wali: '', alamat_instansi_wali: '', keahlian_wali: '', penghasilan_wali: '', alamat_wali: '', nomor_wa_wali: '', medsos_wali: '',
 unit_id: '', unit_pendidikan: '', no_va: '', va_bsi_bank: '', nis_pembayaran: '', tahun_ajaran_masuk: '', kelas_id: '', keterangan_kelas: '', tahun_ajaran_berjalan: '', status_siswa: 'aktif', status_orang_tua: 'Umum', niy_ortu_jika_pegawai: '', wali_kelas: '', niy_wali_kelas: '',
})

const toYesNo = (value) => {
 if (value === true || value === 1 || value === '1' || value === 'true' || value === 'ya') return 'ya'
 return 'tidak'
}

const toBoolean = (value) => toYesNo(value) === 'ya'

const formatRp = (val) => {
 if (val === null || val === undefined || val === '') return ''
 const digits = String(val).replace(/\D/g, '')
 return digits ? Number(digits).toLocaleString('id-ID') : ''
}

const cleanRp = (val) => {
 if (val === null || val === undefined || val === '') return ''
 return String(val).replace(/\D/g, '')
}

export const isPnsOccupation = (occ) => {
 if (!occ) return false
 const str = String(occ).toLowerCase()
 return str.includes('pegawai negeri') || str.includes('pns') || str.includes('asn')
}

const normalizeGender = (value) => {
 const g = String(value || '').trim().toLowerCase()
 if (g === 'female' || g === 'p' || g === 'perempuan' || g === 'akhwat') return 'female'
 return 'male'
}

const normalizeStudentDate = (value) => {
 if (!value || value === '-') return ''
 return String(value).slice(0, 10)
}

export const OCCUPATION_OPTIONS_AYAH = [
 'Pegawai Negeri',
 'Pegawai Swasta',
 'Pegawai BUMN',
 'Wiraswasta',
 'TNI / POLRI',
 'Petani / Peternak',
 'Buruh',
 'Tidak Bekerja',
 'Lainnya',
]

export const OCCUPATION_OPTIONS_IBU = [
 'Ibu Rumah Tangga',
 'Pegawai Negeri',
 'Pegawai Swasta',
 'Pegawai BUMN',
 'Wiraswasta',
 'TNI / POLRI',
 'Petani / Peternak',
 'Buruh',
 'Tidak Bekerja',
 'Lainnya',
]

export const OCCUPATION_OPTIONS_WALI = [
 'Pegawai Negeri',
 'Pegawai Swasta',
 'Pegawai BUMN',
 'Wiraswasta',
 'TNI / POLRI',
 'Petani / Peternak',
 'Buruh',
 'Tidak Bekerja',
 'Lainnya',
]

const Input = ({
  label,
  name,
  value,
  onChange,
  required = false,
  type = 'text',
  placeholder = '',
  isRupiah = false,
  icon: Icon,
  error,
  helperText,
  ...props
}) => (
  <div>
    <div className="flex items-center justify-between mb-1.5">
      <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {helperText && (
        <span className={`text-[10px] font-bold ${error ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'}`}>
          {helperText}
        </span>
      )}
    </div>
    {type === 'date' ? (
      <DatePicker
        name={name}
        value={value ?? ''}
        onChange={onChange}
        required={required}
        className="w-full"
        inputClassName={`py-2.5 text-xs font-semibold rounded-xl border-2 shadow-xs transition-colors ${
          error
            ? 'border-rose-300 dark:border-rose-800 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20'
            : 'border-emerald-300 dark:border-emerald-700/80 bg-white hover:border-emerald-400 focus:border-emerald-600 dark:bg-card-dark'
        }`}
        placeholder={placeholder || 'Pilih tanggal...'}
      />
    ) : (
      <div className="relative flex items-center">
        {Icon && (
          <div className="pointer-events-none absolute left-3.5 flex items-center text-emerald-600 dark:text-emerald-400">
            <Icon className="size-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        )}
        {isRupiah && (
          <span className={`absolute ${Icon ? 'left-9' : 'left-3.5'} text-xs font-extrabold text-emerald-700 select-none`}>
            Rp
          </span>
        )}
        <input
          type={type}
          name={name}
          value={value ?? ''}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          inputMode={isRupiah ? 'numeric' : undefined}
          className={`w-full rounded-xl border-2 py-2.5 text-xs font-semibold text-slate-800 placeholder:text-slate-400/80 transition-all duration-200 outline-none hover:border-emerald-400 focus:border-emerald-600 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 dark:bg-slate-900/50 dark:text-slate-100 dark:hover:border-emerald-500 dark:focus:border-emerald-400 dark:focus:bg-slate-900 dark:focus:ring-emerald-400/20 shadow-xs ${
            error
              ? 'border-rose-300 dark:border-rose-800 bg-rose-50/20 focus:border-rose-500 focus:ring-rose-500/20 dark:bg-rose-950/20'
              : 'bg-white border-emerald-300 dark:border-emerald-700/80 dark:bg-card-dark'
          } ${isRupiah ? (Icon ? 'pl-14 pr-4' : 'pl-10 pr-4') : (Icon ? 'pl-10 pr-4' : 'px-3.5')}`}
          {...props}
        />
      </div>
    )}
    {error && (
      <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
        <span>⚠</span> {error}
      </p>
    )}
  </div>
)
const Select = ({
 label,
 name,
 value,
 onChange,
 required = false,
 icon: Icon,
 options = [],
 disabled = false,
 placeholder = '-- Pilih --',
 error,
 helperText,
}) => {
 const safeOptions = Array.isArray(options)
 ? options
 : Array.isArray(options?.data)
 ? options.data
 : Array.isArray(options?.options)
 ? options.options
 : []

 const normalizedOptions = useMemo(() => {
 const list = [{ value: '', label: placeholder }]

 if (safeOptions.length === 0) {
 list.push({
 value: '__disabled_empty__',
 label: '(Belum ada data opsi master — kelola di Pengaturan)',
 disabled: true,
 })
 }

 safeOptions.forEach((opt, idx) => {
 if (typeof opt === 'string') {
 list.push({ value: opt, label: opt })
 } else {
 list.push({
 value: String(opt?.value ?? opt?.id ?? opt?.name ?? idx),
 label: String(opt?.label ?? opt?.name ?? opt?.value ?? ''),
 })
 }
 })

 if (
 value &&
 !list.some((o) => String(o.value) === String(value))
 ) {
 list.push({
 value: String(value),
 label: `${value} (Data Historis)`,
 })
 }

 return list
 }, [safeOptions, placeholder, value])

 const handleSelectChange = (val) => {
 if (val === '__disabled_empty__') return
 if (typeof onChange === 'function') {
 onChange({ target: { name, value: val } })
 }
 }

 return (
 <div>
 <div className="flex items-center justify-between mb-1.5">
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
 {label} {required && <span className="text-rose-500">*</span>}
 </label>
 {helperText && (
 <span className={`text-[10px] font-bold ${error ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400 dark:text-slate-500'}`}>
 {helperText}
 </span>
 )}
 </div>
 <HeroUiFilterSelect
 value={value ?? ''}
 onChange={handleSelectChange}
 options={normalizedOptions}
 placeholder={placeholder}
 icon={Icon}
 disabled={disabled}
 ariaLabel={label || name || 'Pilih opsi'}
 searchable={safeOptions.length > 7}
 size="md"
 className="w-full"
 />
 {error && (
 <p className="mt-1 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
 <span>⚠</span> {error}
 </p>
 )}
 </div>
 )
}

export default function StudentFormModal({
 isOpen,
 onClose,
 initialData,
 onSubmit,
 classes,
 units,
 userUnitId = '',
 isGlobalManager = true,
 isUnitManager = false,
}) {
 const [activeStep, setActiveStep] = useState(0)
 const [formData, setFormData] = useState(defaultForm())
 const [isUploading, setIsUploading] = useState(false)
 const [modalError, setModalError] = useState(null)
 const [activeUnits, setActiveUnits] = useState(() => (Array.isArray(units) && units.length > 0 ? units : []))
 const [activeClasses, setActiveClasses] = useState(() => (Array.isArray(classes) && classes.length > 0 ? classes : []))
 const [academicYears, setAcademicYears] = useState([])
 const [modaList, setModaList] = useState([])
 const [occupationList, setOccupationList] = useState([])
 const [residenceList, setResidenceList] = useState([])
 const [educationList, setEducationList] = useState([])
 const [maritalList, setMaritalList] = useState([])
 const [studentStatusList, setStudentStatusList] = useState([])
 const modalBodyRef = useRef(null)

 // Isolasi Unit: Kunci unit kerja jika bukan global manager atau adalah unit manager
 const isUnitLocked = (!isGlobalManager || isUnitManager) && Boolean(userUnitId)

 const steps = [
 { number: 1, id: 'pribadi', title: 'Informasi Pribadi', desc: 'Identitas & Alamat Siswa', icon: UserCheck },
 { number: 2, id: 'pendidikan', title: 'Pendidikan & Bantuan', desc: 'Sekolah Asal & SPP/PIP', icon: GraduationCap },
 { number: 3, id: 'ortu', title: 'Data Orang Tua', desc: 'Identitas Ayah & Ibu Kandung', icon: Users },
 { number: 4, id: 'wali', title: 'Data Wali Siswa', desc: 'Wali (Opsional)', icon: HeartHandshake },
 { number: 5, id: 'akademik', title: 'Akademik & Status', desc: 'Unit, Kelas & Status', icon: BookOpen },
 ]

 useEffect(() => {
 if (isOpen) {
 setActiveStep(0)
 setModalError(null)
 if (initialData) {
 const raw = initialData.raw || {}
 const meta = raw.metadata || initialData.metadata || {}
 const orangTua = meta.orang_tua || {}
 const parentRel = raw.parent || {}
 const resolvedStatusRaw =
 meta.akademik?.status_siswa ||
 meta.status_siswa ||
 (raw.is_active !== undefined ? (raw.is_active ? 'aktif' : 'nonaktif') : initialData.status)
 const normalizedStatus = String(resolvedStatusRaw || 'aktif').trim().toLowerCase()

 setFormData({
 id: initialData.id,
 foto_url: initialData.foto || meta.foto_url || '',
 no_pendaftaran: meta.no_pendaftaran || '',
 nik: meta.nik || '',
 no_registrasi_akta_lahir: meta.no_registrasi_akta_lahir || '',
 no_kk: meta.no_kk || '',
 nis: raw.nis || initialData.nis || meta.nis || '',
 nisn: raw.nisn || (initialData.nisn !== '-' ? initialData.nisn : '') || meta.nisn || '',
 full_name: raw.full_name || initialData.nama || meta.full_name || '',
 birth_date: normalizeStudentDate(raw.birth_date || initialData.birth_date || initialData.tanggalLahir || meta.birth_date),
 birth_place: raw.birth_place || (initialData.birth_place && initialData.birth_place !== '-' ? initialData.birth_place : '') || (initialData.tempatLahir && initialData.tempatLahir !== '-' ? initialData.tempatLahir : '') || meta.birth_place || '',
 gender: normalizeGender(raw.gender || meta.gender || initialData.gender),
 agama: meta.agama || 'Islam',
 email: meta.email || '',
 anak_ke: meta.anak_ke || '',
 jumlah_saudara: meta.jumlah_saudara || '',
 jumlah_saudara_tiri: meta.jumlah_saudara_tiri || '',
 berat_badan: meta.berat_badan || '',
 tinggi_badan: meta.tinggi_badan || '',
 riwayat_penyakit: meta.riwayat_penyakit || '',
 kewarganegaraan: meta.kewarganegaraan || 'WNI',
 alamat_siswa: initialData.raw?.address || meta.alamat_siswa || '',
 rt: meta.rt || '',
 rw: meta.rw || '',
 dusun: meta.dusun || '',
 kelurahan: meta.kelurahan || '',
 kecamatan: meta.kecamatan || '',
 kode_pos: meta.kode_pos || '',
 kota_kabupaten: meta.kota_kabupaten || '',
 provinsi: meta.provinsi || '',
 jenis_tempat_tinggal: meta.jenis_tempat_tinggal || '',
 jarak_tempuh_ke_sekolah: meta.jarak_tempuh_ke_sekolah || '',
 moda_transportasi: meta.moda_transportasi || '',
 hobi: meta.hobi || '',
 cita_cita: meta.cita_cita || '',
 latitude: meta.latitude || '',
 longitude: meta.longitude || '',

 sekolah_asal: meta.sekolah_asal || '',
 status_sekolah_asal: meta.status_sekolah_asal || 'Formal',
 provinsi_sekolah_asal: meta.provinsi_sekolah_asal || '',
 kota_kab_sekolah_asal: meta.kota_kab_sekolah_asal || '',
 kecamatan_sekolah_asal: meta.kecamatan_sekolah_asal || '',
 kelurahan_sekolah_asal: meta.kelurahan_sekolah_asal || '',
 nomor_hp_wa_sekolah_asal: meta.nomor_hp_wa_sekolah_asal || '',
 nominal_spp: formatRp(meta.nominal_spp || ''),
 nominal_ortu_asuh: formatRp(meta.nominal_ortu_asuh || ''),
 penerima_kps_pkh: toYesNo(meta.penerima_kps_pkh),
 apakah_punya_kip: toYesNo(meta.apakah_punya_kip),
 apakah_layak_menerima_pip: toYesNo(meta.apakah_layak_menerima_pip),
 alasan_menolak_pip: meta.alasan_menolak_pip || '',

 nik_ayah: meta.nik_ayah || orangTua.nik_ayah || '',
 nama_ayah: meta.nama_ayah || orangTua.nama_ayah || parentRel.father_name || '',
 tempat_lahir_ayah: meta.tempat_lahir_ayah || '',
 tgl_lahir_ayah: meta.tgl_lahir_ayah || '',
 telfon_ayah: meta.telfon_ayah || '',
 hp_ayah: meta.hp_ayah || orangTua.no_hp || parentRel.father_phone || '',
 pendidikan_terakhir_ayah: meta.pendidikan_terakhir_ayah || '',
 pekerjaan_ayah: meta.pekerjaan_ayah || '',
 instansi_pekerjaan_ayah: meta.instansi_pekerjaan_ayah || '',
 jabatan_pekerjaan_ayah: meta.jabatan_pekerjaan_ayah || '',
 alamat_instansi_ayah: meta.alamat_instansi_ayah || '',
 keahlian_ayah: meta.keahlian_ayah || '',
 penghasilan_ayah: formatRp(meta.penghasilan_ayah || ''),
 alamat_ayah: meta.alamat_ayah || '',
 nomor_wa_ayah: meta.nomor_wa_ayah || '',
 medsos_ayah: meta.medsos_ayah || '',

 nik_ibu: meta.nik_ibu || orangTua.nik_ibu || '',
 nama_ibu: meta.nama_ibu || orangTua.nama_ibu || parentRel.mother_name || '',
 tempat_lahir_ibu: meta.tempat_lahir_ibu || '',
 tgl_lahir_ibu: meta.tgl_lahir_ibu || '',
 telfon_ibu: meta.telfon_ibu || '',
 hp_ibu: meta.hp_ibu || parentRel.mother_phone || '',
 pendidikan_terakhir_ibu: meta.pendidikan_terakhir_ibu || '',
 pekerjaan_ibu: meta.pekerjaan_ibu || '',
 instansi_pekerjaan_ibu: meta.instansi_pekerjaan_ibu || '',
 jabatan_pekerjaan_ibu: meta.jabatan_pekerjaan_ibu || '',
 alamat_instansi_ibu: meta.alamat_instansi_ibu || '',
 keahlian_ibu: meta.keahlian_ibu || '',
 penghasilan_ibu: formatRp(meta.penghasilan_ibu || ''),
 alamat_ibu: meta.alamat_ibu || '',
 nomor_wa_ibu: meta.nomor_wa_ibu || '',
 medsos_ibu: meta.medsos_ibu || '',

 status_pernikahan_wali: meta.status_pernikahan_wali || '',
 tanggungan_anak_wali: meta.tanggungan_anak_wali || '',
 nik_wali: meta.nik_wali || orangTua.nik_wali || '',
 nama_wali: meta.nama_wali || orangTua.nama_wali || parentRel.guardian_name || '',
 tempat_lahir_wali: meta.tempat_lahir_wali || '',
 tgl_lahir_wali: meta.tgl_lahir_wali || '',
 telfon_wali: meta.telfon_wali || '',
 hp_wali: meta.hp_wali || parentRel.guardian_phone || '',
 pendidikan_terakhir_wali: meta.pendidikan_terakhir_wali || '',
 pekerjaan_wali: meta.pekerjaan_wali || '',
 instansi_pekerjaan_wali: meta.instansi_pekerjaan_wali || '',
 jabatan_pekerjaan_wali: meta.jabatan_pekerjaan_wali || '',
 alamat_instansi_wali: meta.alamat_instansi_wali || '',
 keahlian_wali: meta.keahlian_wali || '',
 penghasilan_wali: formatRp(meta.penghasilan_wali || ''),
 alamat_wali: meta.alamat_wali || '',
 nomor_wa_wali: meta.nomor_wa_wali || '',
 medsos_wali: meta.medsos_wali || '',

 unit_id: raw.unit_id || raw.education_unit_id || initialData.unit_id || initialData.unitId || meta.unit_id || '',
 unit_pendidikan: raw.education_unit?.name || initialData.unit || meta.unit_pendidikan || '',
 jenis_pendaftaran: meta.jenis_pendaftaran || (meta.unit_asal_id ? 'pindahan_internal' : (meta.sekolah_asal ? 'pindahan_eksternal' : 'baru')),
 unit_asal_id: meta.unit_asal_id || '',
 no_va: meta.no_va || meta.nis_pembayaran || '',
 va_bsi_bank: meta.va_bsi_bank || meta.bank_name || '',
 nis_pembayaran: meta.nis_pembayaran || meta.no_va || '',
 tahun_ajaran_masuk: meta.tahun_ajaran_masuk || '',
 kelas_id: raw.kelas_id || raw.class_id || initialData.kelas_id || initialData.kelasId || meta.kelas_id || '',
 keterangan_kelas: meta.keterangan_kelas || '',
 tahun_ajaran_berjalan: meta.tahun_ajaran_berjalan || '',
 status_siswa: normalizedStatus,
 status_orang_tua: meta.status_orang_tua || 'Umum',
 niy_ortu_jika_pegawai: meta.niy_ortu_jika_pegawai || '',
 wali_kelas: meta.wali_kelas || '',
 niy_wali_kelas: meta.niy_wali_kelas || '',
 })
 } else {
 const fresh = defaultForm()
 if (isUnitLocked && userUnitId) {
 fresh.unit_id = String(userUnitId)
 const allUnits = Array.isArray(activeUnits) && activeUnits.length > 0
 ? activeUnits
 : (Array.isArray(units) && units.length > 0 ? units : [])
 const found = allUnits.find((u) => String(u.id ?? u.unit_id ?? '') === String(userUnitId))
 if (found) {
 fresh.unit_pendidikan = found.name || found.nama || found.code || ''
 const unitMeta = found.metadata || {}
 fresh.va_bsi_bank = unitMeta.va_bank || unitMeta.bank_name || found.va_bank || 'Bank Syariah Indonesia (BSI)'
 }
 }
 setFormData(fresh)
 }
 }
 }, [isOpen, initialData, isUnitLocked, userUnitId, activeUnits, units])

 const setStepError = (title, message, stepIdx) => {
 setModalError({ title, message, stepIdx })
 if (modalBodyRef.current) {
 modalBodyRef.current.scrollTo({ top: 0, behavior: 'smooth' })
 }
 }

 const handleChange = (e) => {
 const { name, value } = e.target
 let finalValue = value

 // Filter strictly numbers (max 16 digits) for NIK & No KK fields
 if (['nik', 'no_kk', 'nik_ayah', 'nik_ibu', 'nik_wali'].includes(name)) {
 if (value && /\D/.test(value)) {
 setModalError({
 title: 'Input Hanya Angka',
 message: 'Kolom NIK / No. KK hanya dapat diisi angka tanpa huruf atau simbol (maksimal 16 digit).',
 })
 }
 finalValue = String(value).replace(/\D/g, '').slice(0, 16)
 }

 if (['nominal_spp', 'nominal_ortu_asuh', 'penghasilan_ayah', 'penghasilan_ibu', 'penghasilan_wali'].includes(name)) {
 const digits = String(value).replace(/\D/g, '')
 finalValue = digits ? Number(digits).toLocaleString('id-ID') : ''
 }

 if (name === 'unit_id') {
 const selectedUnitObj = activeUnits.find(u => {
 const val = typeof u === 'string' ? u : (u.id ?? u.unit_id ?? u.value ?? u.code ?? '')
 return String(val) === String(value)
 })
 const unitLabel = selectedUnitObj
 ? (typeof selectedUnitObj === 'string' ? selectedUnitObj : (selectedUnitObj.name || selectedUnitObj.nama || selectedUnitObj.code || value))
 : ''
 const unitMeta = selectedUnitObj?.metadata || {}
 const bankName = unitMeta.va_bank || unitMeta.bank_name || selectedUnitObj?.va_bank || ''
 setFormData(prev => ({
 ...prev,
 unit_id: value,
 unit_pendidikan: unitLabel,
 va_bsi_bank: prev.va_bsi_bank || bankName,
 kelas_id: '',
 wali_kelas: '',
 niy_wali_kelas: '',
 }))
 return
 }

 if (name === 'kelas_id') {
 const selectedClassObj = activeClasses.find(c => {
 const val = typeof c === 'string' ? c : (c.id ?? c.kelas_id ?? c.value ?? '')
 return String(val) === String(value)
 })
 const waliName = selectedClassObj
 ? (typeof selectedClassObj === 'string' ? '' : (selectedClassObj.wali_kelas || selectedClassObj.wali || selectedClassObj.teacher_name || ''))
 : ''
 const waliNiy = selectedClassObj
 ? (typeof selectedClassObj === 'string' ? '' : (selectedClassObj.niy_wali_kelas || selectedClassObj.wali_niy || selectedClassObj.teacher_niy || ''))
 : ''
 setFormData(prev => ({
 ...prev,
 kelas_id: value,
 wali_kelas: waliName,
 niy_wali_kelas: waliNiy,
 }))
 return
 }

 if (name === 'provinsi') {
 setFormData(prev => ({
 ...prev,
 provinsi: value,
 kota_kabupaten: '',
 kecamatan: '',
 kelurahan: '',
 }))
 return
 }

 if (name === 'kota_kabupaten') {
 setFormData(prev => ({
 ...prev,
 kota_kabupaten: value,
 kecamatan: '',
 kelurahan: '',
 }))
 return
 }

 if (name === 'kecamatan') {
 setFormData(prev => ({
 ...prev,
 kecamatan: value,
 kelurahan: '',
 }))
 return
 }

 if (name === 'provinsi_sekolah_asal') {
 setFormData(prev => ({
 ...prev,
 provinsi_sekolah_asal: value,
 kota_kab_sekolah_asal: '',
 kecamatan_sekolah_asal: '',
 kelurahan_sekolah_asal: '',
 }))
 return
 }

 if (name === 'kota_kab_sekolah_asal') {
 setFormData(prev => ({
 ...prev,
 kota_kab_sekolah_asal: value,
 kecamatan_sekolah_asal: '',
 kelurahan_sekolah_asal: '',
 }))
 return
 }

 if (name === 'kecamatan_sekolah_asal') {
 setFormData(prev => ({
 ...prev,
 kecamatan_sekolah_asal: value,
 kelurahan_sekolah_asal: '',
 }))
 return
 }

 setFormData(prev => ({ ...prev, [name]: finalValue }))
 }

 const handleAutoGenerateVa = () => {
 const rawNis = formData.nis || formData.no_pendaftaran || ''
 const cleanNis = String(rawNis).replace(/\D/g, '')
 if (!cleanNis) {
 setStepError(
 'NIS Siswa Kosong',
 'Mohon lengkapi NIS Siswa pada Langkah 1 terlebih dahulu untuk mengenerate No. Virtual Account.',
 0
 )
 return
 }

 const currentUnitObj = (activeUnits || []).find(u => {
 const val = typeof u === 'string' ? u : (u.id ?? u.unit_id ?? u.value ?? u.code ?? '')
 return String(val) === String(formData.unit_id)
 })
 const unitMeta = currentUnitObj?.metadata || {}
 const vaPrefix = unitMeta.va_prefix || unitMeta.va_code || currentUnitObj?.va_prefix || '9023'
 const bankName = unitMeta.va_bank || unitMeta.bank_name || currentUnitObj?.va_bank || formData.va_bsi_bank || 'Bank Syariah Indonesia (BSI)'

 const generatedVa = `${vaPrefix}${cleanNis}`
 setFormData(prev => ({
 ...prev,
 no_va: generatedVa,
 nis_pembayaran: generatedVa,
 va_bsi_bank: bankName,
 }))
 setModalError(null)
 }

 useEffect(() => {
 let isMounted = true
 const fetchDynamicOptions = async () => {
 try {
 const [occRes, resRes, eduRes, marRes, stuStatusRes] = await Promise.allSettled([
 businessOptionService.getDropdown('parent_occupation'),
 businessOptionService.getDropdown('residence_type'),
 businessOptionService.getDropdown('last_education'),
 businessOptionService.getDropdown('marital_status'),
 studentStatusService.getDropdown(),
 ])
 if (isMounted) {
 if (occRes.status === 'fulfilled' && Array.isArray(occRes.value?.data)) {
 setOccupationList(occRes.value.data.map(item => item.name || item.nama || item.label || item))
 }
 if (resRes.status === 'fulfilled' && Array.isArray(resRes.value?.data)) {
 setResidenceList(resRes.value.data.map(item => item.name || item.nama || item.label || item))
 }
 if (eduRes.status === 'fulfilled' && Array.isArray(eduRes.value?.data)) {
 setEducationList(eduRes.value.data.map(item => item.name || item.nama || item.label || item))
 }
 if (marRes.status === 'fulfilled' && Array.isArray(marRes.value?.data)) {
 setMaritalList(marRes.value.data.map(item => item.name || item.nama || item.label || item))
 }
 if (stuStatusRes.status === 'fulfilled' && Array.isArray(stuStatusRes.value?.data)) {
 setStudentStatusList(stuStatusRes.value.data.map(item => item.value ?? item.code ?? item.name ?? item.nama ?? item.label ?? item))
 }
 }
 } catch (err) {
 console.warn('Gagal memuat opsi status siswa dinamis:', err)
 }
 }
 fetchDynamicOptions()
 return () => { isMounted = false }
 }, [])

 const studentStatusOptions = useMemo(() => {
 if (studentStatusList && studentStatusList.length > 0) {
 return studentStatusList
 }
 return []
 }, [studentStatusList])

 const occupationOptionsAyah = useMemo(() => {
 return occupationList.length > 0 ? occupationList : OCCUPATION_OPTIONS_AYAH
 }, [occupationList])

 const occupationOptionsIbu = useMemo(() => {
 return occupationList.length > 0 ? occupationList : OCCUPATION_OPTIONS_IBU
 }, [occupationList])

 const occupationOptionsWali = useMemo(() => {
 return occupationList.length > 0 ? occupationList : OCCUPATION_OPTIONS_WALI
 }, [occupationList])

 useEffect(() => {
 if (isOpen && !initialData && formData.unit_id && !formData.nis) {
 codeGeneratorService.preview('student_nis', { unit_id: formData.unit_id })
 .then(res => {
 if (res?.preview_code) {
 setFormData(prev => ({
 ...prev,
 nis: prev.nis ? prev.nis : res.preview_code
 }))
 }
 })
 .catch(() => {})
 }
 }, [isOpen, initialData, formData.unit_id])

 useEffect(() => {
 let isMounted = true
 const fetchModa = async () => {
 try {
 const res = await modaTransportasiService.getAll()
 if (isMounted && res?.data && Array.isArray(res.data)) {
 setModaList(res.data.map(m => m.nama || m.name || m))
 }
 } catch (err) {
 console.warn('Gagal memuat moda transportasi:', err)
 }
 }
 fetchModa()
 return () => { isMounted = false }
 }, [])

 useEffect(() => {
 let isMounted = true
 const fetchMasters = async () => {
 try {
 const results = await Promise.allSettled([
 educationUnitService.getAll({ per_page: 100 }),
 kelasService.getAll({ per_page: 300 }),
 tahunAjaranService.getAll(),
 ])

 const uRes = results[0].status === 'fulfilled' ? results[0].value : null
 const cRes = results[1].status === 'fulfilled' ? results[1].value : null
 const tRes = results[2].status === 'fulfilled' ? results[2].value : null

 if (isMounted) {
 const rawUnits = uRes?.data?.data || uRes?.data || (Array.isArray(uRes) ? uRes : null)
 if (Array.isArray(rawUnits) && rawUnits.length > 0) {
 setActiveUnits(rawUnits)
 } else if (Array.isArray(units) && units.length > 0) {
 setActiveUnits(units)
 }

 const rawClasses = cRes?.data?.data || cRes?.data || (Array.isArray(cRes) ? cRes : null)
 if (Array.isArray(rawClasses) && rawClasses.length > 0) {
 setActiveClasses(rawClasses)
 } else if (Array.isArray(classes) && classes.length > 0) {
 setActiveClasses(classes)
 }

 const rawYears = tRes?.data?.data || tRes?.data || (Array.isArray(tRes) ? tRes : null)
 if (Array.isArray(rawYears) && rawYears.length > 0) {
 setAcademicYears(rawYears)
 const activeYearObj = rawYears.find(y => y.is_active) || rawYears[0]
 const activeYearName = activeYearObj?.name || activeYearObj?.tahun || activeYearObj?.tahun_ajaran || ''
 if (activeYearName) {
 setFormData(prev => ({
 ...prev,
 tahun_ajaran_masuk: prev.tahun_ajaran_masuk || activeYearName,
 tahun_ajaran_berjalan: prev.tahun_ajaran_berjalan || activeYearName,
 }))
 }
 }
 }
 } catch (err) {
 console.warn('Fallback data master form', err)
 if (isMounted) {
 if (Array.isArray(units) && units.length > 0) setActiveUnits(units)
 if (Array.isArray(classes) && classes.length > 0) setActiveClasses(classes)
 }
 }
 }
 fetchMasters()
 return () => { isMounted = false }
 }, [units, classes])

 const provQuery = useProvinsiList()
 const provList = provQuery?.data && Array.isArray(provQuery.data) && provQuery.data.length > 0
 ? provQuery.data
 : getProvinsiList()

 const kotaQuery = useKotaOptions(formData.provinsi)
 const kotaList = kotaQuery?.data && Array.isArray(kotaQuery.data) && kotaQuery.data.length > 0
 ? kotaQuery.data
 : getKotaOptions(formData.provinsi)

 const kecQuery = useKecamatanOptions(formData.kota_kabupaten, formData.provinsi)
 const kecList = kecQuery?.data && Array.isArray(kecQuery.data) && kecQuery.data.length > 0
 ? kecQuery.data
 : getKecamatanOptions(formData.kota_kabupaten)

 const kelQuery = useKelurahanOptions(formData.kecamatan, formData.kota_kabupaten, formData.provinsi)
 const kelList = kelQuery?.data && Array.isArray(kelQuery.data) && kelQuery.data.length > 0
 ? kelQuery.data
 : getKelurahanOptions(formData.kecamatan)

 const kotaSekolahQuery = useKotaOptions(formData.provinsi_sekolah_asal)
 const kotaSekolahList = kotaSekolahQuery?.data && Array.isArray(kotaSekolahQuery.data) && kotaSekolahQuery.data.length > 0
 ? kotaSekolahQuery.data
 : getKotaOptions(formData.provinsi_sekolah_asal)

 const kecSekolahQuery = useKecamatanOptions(formData.kota_kab_sekolah_asal, formData.provinsi_sekolah_asal)
 const kecSekolahList = kecSekolahQuery?.data && Array.isArray(kecSekolahQuery.data) && kecSekolahQuery.data.length > 0
 ? kecSekolahQuery.data
 : getKecamatanOptions(formData.kota_kab_sekolah_asal)

 const kelSekolahQuery = useKelurahanOptions(formData.kecamatan_sekolah_asal, formData.kota_kab_sekolah_asal, formData.provinsi_sekolah_asal)
 const kelSekolahList = kelSekolahQuery?.data && Array.isArray(kelSekolahQuery.data) && kelSekolahQuery.data.length > 0
 ? kelSekolahQuery.data
 : getKelurahanOptions(formData.kecamatan_sekolah_asal)

 const allUnitList = useMemo(() => {
 if (Array.isArray(activeUnits) && activeUnits.length > 0) return activeUnits
 if (Array.isArray(units) && units.length > 0) return units
 return []
 }, [activeUnits, units])

 const resolvedUnits = useMemo(() => {
 if (isUnitLocked) {
 const scoped = allUnitList.filter((u) => String(u.id ?? u.unit_id ?? '') === String(userUnitId))
 return scoped.length > 0 ? scoped : (userUnitId ? [{ id: userUnitId, name: 'Unit Pengguna' }] : allUnitList)
 }
 return allUnitList
 }, [allUnitList, isUnitLocked, userUnitId])

 const unitOptions = useMemo(() => {
 return resolvedUnits.map((u) => {
 if (typeof u === 'string') return { label: u, value: u }
 return {
 label: u.name || u.nama || u.code || 'Unit',
 value: String(u.id ?? u.unit_id ?? u.value ?? u.code ?? ''),
 }
 }).filter((u) => u.value !== '')
 }, [resolvedUnits])

 // Opsi seluruh unit yayasan untuk unit asal pindahan internal
 const allUnitOptions = useMemo(() => {
 return allUnitList.map((u) => {
 if (typeof u === 'string') return { label: u, value: u }
 return {
 label: u.name || u.nama || u.code || 'Unit',
 value: String(u.id ?? u.unit_id ?? u.value ?? u.code ?? ''),
 }
 }).filter((u) => u.value !== '')
 }, [allUnitList])

 const filteredClasses = (activeClasses || []).filter(c => {
 if (!formData.unit_id) return true
 if (typeof c === 'string') return true
 const classUnitId = c.unit_id ?? c.unitId ?? (c.unit ? c.unit.id : null)
 return !classUnitId || String(classUnitId) === String(formData.unit_id)
 })

 const classOptions = filteredClasses.map(c => {
 if (typeof c === 'string') return { label: c, value: c }
 return {
 label: c.nama_kelas || c.name || c.nama || 'Kelas',
 value: String(c.id ?? c.kelas_id ?? c.value ?? ''),
 }
 }).filter(c => c.value !== '')

 const academicYearOptions = academicYears.map(y => {
 if (typeof y === 'string') return { label: y, value: y }
 return {
 label: y.tahun || y.name || y.tahun_ajaran || 'Tahun Ajaran',
 value: y.tahun || y.name || y.tahun_ajaran || String(y.id || ''),
 }
 })

 const modaOptions = modaList.map(m => {
 if (typeof m === 'string') return { label: m, value: m }
 return {
 label: m.nama || m.name || 'Moda',
 value: m.nama || m.name || String(m.id || ''),
 }
 })

 const handleFileUpload = async (e) => {
 const file = e.target.files?.[0]
 if (!file) return

 if (!file.type.startsWith('image/')) {
 setModalError({
 title: 'Format Berkas Salah',
 message: 'Mohon unggah berkas gambar dengan format JPG, PNG, atau WEBP.',
 })
 return
 }

 if (file.size > 2 * 1024 * 1024) {
 setModalError({
 title: 'Ukuran Foto Terlalu Besar',
 message: 'Ukuran foto maksimal adalah 2MB. Silakan pilih foto dengan resolusi lebih kecil.',
 })
 return
 }

 try {
 setIsUploading(true)
 const data = new FormData()
 data.append('file', file)
 const response = await api.post('/upload', data, {
 headers: { 'Content-Type': 'multipart/form-data' }
 })

 const rawUrl = response.data?.url || response.data?.data?.url || ''
 const resolved = resolveAvatarUrl(rawUrl)
 setFormData(prev => ({ ...prev, foto_url: resolved }))
 setModalError(null)
 } catch (err) {
 console.warn('Upload endpoint error, fallback to Base64:', err)
 const reader = new FileReader()
 reader.onload = (e) => {
 setFormData(prev => ({ ...prev, foto_url: e.target.result }))
 }
 reader.readAsDataURL(file)
 } finally {
 setIsUploading(false)
 }
 }

 const handleRemoveFoto = () => {
 setFormData(prev => ({ ...prev, foto_url: '' }))
 }

 const handleMapLocationChange = (coords) => {
 setFormData(prev => ({
 ...prev,
 latitude: coords.lat,
 longitude: coords.lng,
 }))
 }

 const handleMapAddressSelect = (addressDetails) => {
 setFormData(prev => {
 const next = { ...prev }
 if (addressDetails.address && !prev.alamat_siswa) next.alamat_siswa = addressDetails.address
 if (addressDetails.kelurahan) next.kelurahan = addressDetails.kelurahan
 if (addressDetails.kecamatan) next.kecamatan = addressDetails.kecamatan
 if (addressDetails.kota_kabupaten) next.kota_kabupaten = addressDetails.kota_kabupaten
 if (addressDetails.provinsi) next.provinsi = addressDetails.provinsi
 if (addressDetails.kode_pos) next.kode_pos = addressDetails.kode_pos
 return next
 })
 }

 const validateStep = (stepIdx) => {
 if (stepIdx === 0) {
 const nikTrimmed = String(formData.nik || '').trim()
 if (!nikTrimmed || nikTrimmed.length !== 16 || !/^\d{16}$/.test(nikTrimmed)) {
 setStepError(
 'Validasi NIK Siswa Gagal',
 `Field NIK Siswa wajib diisi tepat 16 digit angka. (Jumlah digit saat ini: ${nikTrimmed.length} digit)`,
 0
 )
 return false
 }

 const kkTrimmed = String(formData.no_kk || '').trim()
 if (!kkTrimmed || kkTrimmed.length !== 16 || !/^\d{16}$/.test(kkTrimmed)) {
 setStepError(
 'Validasi No. KK Gagal',
 `Field Nomor Kartu Keluarga (KK) wajib diisi tepat 16 digit angka. (Jumlah digit saat ini: ${kkTrimmed.length} digit)`,
 0
 )
 return false
 }
 }

 if (stepIdx === 2) {
 const nikAyah = String(formData.nik_ayah || '').trim()
 if (nikAyah && (nikAyah.length !== 16 || !/^\d{16}$/.test(nikAyah))) {
 setStepError(
 'Validasi NIK Ayah Gagal',
 `Field NIK Ayah harus tepat 16 digit angka. (Jumlah digit saat ini: ${nikAyah.length} digit)`,
 2
 )
 return false
 }

 const nikIbu = String(formData.nik_ibu || '').trim()
 if (nikIbu && (nikIbu.length !== 16 || !/^\d{16}$/.test(nikIbu))) {
 setStepError(
 'Validasi NIK Ibu Gagal',
 `Field NIK Ibu harus tepat 16 digit angka. (Jumlah digit saat ini: ${nikIbu.length} digit)`,
 2
 )
 return false
 }
 }

 if (stepIdx === 3) {
 const nikWali = String(formData.nik_wali || '').trim()
 if (nikWali && (nikWali.length !== 16 || !/^\d{16}$/.test(nikWali))) {
 setStepError(
 'Validasi NIK Wali Gagal',
 `Field NIK Wali harus tepat 16 digit angka. (Jumlah digit saat ini: ${nikWali.length} digit)`,
 3
 )
 return false
 }
 }

 setModalError(null)
 return true
 }

 const handleStepClick = (targetIdx) => {
 if (targetIdx > activeStep) {
 for (let i = activeStep; i < targetIdx; i++) {
 if (!validateStep(i)) {
 setActiveStep(i)
 return
 }
 }
 }
 setModalError(null)
 setActiveStep(targetIdx)
 }

 const handleNextStep = () => {
 if (!validateStep(activeStep)) return
 setModalError(null)
 setActiveStep(prev => prev + 1)
 }

 const handleSave = (e) => {
 if (e) e.preventDefault()

 // Validasi seluruh langkah sebelum submit ke dialog konfirmasi
 for (let i = 0; i < steps.length; i++) {
 if (!validateStep(i)) {
 setActiveStep(i)
 return
 }
 }

 const payload = {
 id: formData.id,
 nis: formData.nis,
 full_name: formData.full_name,
 gender: formData.gender,
 birth_place: formData.birth_place,
 birth_date: formData.birth_date,
 address: formData.alamat_siswa,
 unit_id: formData.unit_id || null,
 kelas_id: formData.kelas_id || null,
 is_active: formData.status_siswa === 'aktif',
 metadata: { ...formData }
 }
 delete payload.metadata.id
 delete payload.metadata.full_name
 delete payload.metadata.gender
 delete payload.metadata.birth_place
 delete payload.metadata.birth_date
 delete payload.metadata.kelas_id
 delete payload.metadata.unit_id
 delete payload.metadata.is_active
 delete payload.metadata.address
 payload.metadata.penerima_kps_pkh = toBoolean(formData.penerima_kps_pkh)
 payload.metadata.apakah_punya_kip = toBoolean(formData.apakah_punya_kip)
 payload.metadata.apakah_layak_menerima_pip = toBoolean(formData.apakah_layak_menerima_pip)
 payload.metadata.nominal_spp = cleanRp(formData.nominal_spp)
 payload.metadata.nominal_ortu_asuh = cleanRp(formData.nominal_ortu_asuh)
 payload.metadata.penghasilan_ayah = cleanRp(formData.penghasilan_ayah)
 payload.metadata.penghasilan_ibu = cleanRp(formData.penghasilan_ibu)
 payload.metadata.penghasilan_wali = cleanRp(formData.penghasilan_wali)
 payload.metadata.foto_url = formData.foto_url || ''
 payload.metadata.nama_ayah = formData.nama_ayah || ''
 payload.metadata.hp_ayah = formData.hp_ayah || ''
 payload.metadata.nama_ibu = formData.nama_ibu || ''
 payload.metadata.hp_ibu = formData.hp_ibu || ''
 payload.metadata.nama_wali = formData.nama_wali || ''
 payload.metadata.hp_wali = formData.hp_wali || ''
 payload.metadata.orang_tua = {
 ...(formData.orang_tua || {}),
 nama_ayah: formData.nama_ayah || '',
 nama_ibu: formData.nama_ibu || '',
 nama_wali: formData.nama_wali || '',
 no_hp: formData.hp_ayah || formData.hp_ibu || formData.hp_wali || '',
 }
 onSubmit(payload)
 }

 const getProps = (name) => ({
 value: formData[name] ?? '',
 onChange: handleChange,
 })

 if (!isOpen) return null

 return (
 <div className="overlay modal fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-5 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
 <motion.div
 initial={{ opacity: 0, scale: 0.94, y: 14 }}
 animate={{ opacity: 1, scale: 1, y: 0 }}
 exit={{ opacity: 0, scale: 0.95, y: 10 }}
 transition={{ type: 'spring', stiffness: 400, damping: 28 }}
 className="modal-dialog font-sans my-auto w-full max-w-6xl py-2 sm:py-0"
 >
 <div className="modal-content flex max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] flex-col overflow-hidden rounded-3xl border-2 border-emerald-300 dark:border-emerald-700/80 bg-white shadow-2xl shadow-emerald-950/20 dark:bg-[#182232] shadow-sm dark:border-emerald-800/60 dark:bg-[#182232] dark:shadow-black/60">

 {/* Top Accent Gradient Bar */}

 {/* Modal Header — Clean Top with Icon Badge & Title */}
 <div className="modal-header flex shrink-0 items-center justify-between border-b border-emerald-100/80 bg-white px-4 py-3 sm:px-6 sm:py-4 dark:border-emerald-800/60 dark:bg-slate-950">
 <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
 <div className="flex size-9 sm:size-10 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-200/80 dark:border-emerald-800/60 p-2 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300 shrink-0">
 <GraduationCap className="size-4 sm:size-5" />
 </div>
 <div className="min-w-0">
 <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
 <h2 className="modal-title text-lg font-semibold tracking-tight text-slate-900 dark:text-white ">
 {initialData ? 'Edit Data Siswa' : 'Tambah Siswa Baru'}
 </h2>
 <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60 shrink-0">
 <Sparkles className="size-3" /> {initialData ? 'Update Data' : 'Siswa Baru'}
 </span>
 </div>
 <p className="mt-0.5 text-xs sm:text-xs text-slate-500 dark:text-slate-400 truncate">
 Langkah {activeStep + 1} dari 5 · {steps[activeStep]?.desc || steps[activeStep]?.title}
 </p>
 </div>
 </div>
 <IconButton icon={X} variant="ghost" size="sm" onClick={onClose} aria-label="Tutup modal" />
 </div>

 {/* Step Wizard Indicator (Standardized Horizontal Bar) */}
 <div className="shrink-0 border-b border-emerald-100/80 bg-slate-50/70 p-2 sm:px-6 dark:border-emerald-800/60 dark:bg-slate-900/50">
 <div className="grid grid-cols-5 gap-1 sm:gap-2">
 {steps.map((step, idx) => {
 const isActive = activeStep === idx
 const isDone = activeStep > idx
 const StepIcon = step.icon
 return (
 <button
 key={step.id || idx}
 type="button"
 onClick={() => handleStepClick(idx)}
 className={`flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg py-2 px-1 sm:px-2 text-[10px] sm:text-xs font-extrabold transition-all duration-200 cursor-pointer min-w-0 ${
 isActive
 ? 'bg-emerald-600 text-white shadow-xs border border-emerald-500/40 dark:border-emerald-600/50'
 : isDone
 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 hover:bg-emerald-100/80 border border-emerald-200/80 dark:border-emerald-800/60'
 : 'bg-white text-slate-400 border border-emerald-200/80 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800/60 dark:border-emerald-700/80/60 dark:text-slate-500'
 }`}
 >
 <StepIcon className={`size-3.5 shrink-0 ${isActive ? 'text-white' : isDone ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
 <span className="truncate hidden sm:inline">{step.title}</span>
 <span className="truncate sm:hidden">{idx + 1}</span>
 </button>
 )
 })}
 </div>
 </div>

 {/* Form Content Area */}
 <div ref={modalBodyRef} className="min-h-0 flex-1 overflow-y-auto bg-white p-5 sm:p-6 dark:bg-[#182232]">
 {/* In-Modal Alert Banner */}
 {modalError && (
 <div className="mb-5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-rose-50/90 p-4 text-xs text-rose-800 dark:border-emerald-800/60 dark:bg-rose-950/50 dark:text-rose-300 flex items-start justify-between gap-3 shadow-xs animate-in fade-in duration-200">
 <div className="flex items-start gap-3">
 <div className="flex size-7 items-center justify-center rounded-xl bg-rose-50 border border-emerald-200/80 dark:border-emerald-800/60 text-rose-600 dark:bg-rose-950/60 dark:border-emerald-800/60 dark:text-rose-400 shadow-xs shrink-0 mt-0.5">
 <AlertTriangle className="size-4" strokeWidth={2.2} />
 </div>
 <div>
 <h4 className="font-black text-rose-950 dark:text-rose-200 text-xs sm:text-sm">{modalError.title}</h4>
 <p className="mt-0.5 text-xs text-rose-800 dark:text-rose-300 font-medium leading-relaxed">{modalError.message}</p>
 </div>
 </div>
 <button
 type="button"
 onClick={() => setModalError(null)}
 className="rounded-lg p-1 text-rose-400 hover:bg-rose-100/60 hover:text-rose-700 dark:hover:bg-rose-900/40 transition cursor-pointer"
 aria-label="Tutup peringatan"
 >
 <X className="size-4" />
 </button>
 </div>
 )}

 <div className="mb-5">
 <h3 className="text-sm font-bold text-slate-900 dark:text-white">{steps[activeStep].title}</h3>
 <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{steps[activeStep].desc}. Pastikan data yang dimasukkan sudah benar.</p>
 </div>

 <form id="student-main-form" onSubmit={handleSave} className="space-y-6">

 {/* STEP 1: INFORMASI PRIBADI */}
 {activeStep === 0 && (
 <div className="space-y-6">
 {/* Upload Foto Box - Sesuai HeroUI Dropzone Standar */}
 <div>
 <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-2">Foto Profil Siswa</label>
 {formData.foto_url ? (
 <div className="flex items-center gap-4 p-3.5 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/60 dark:bg-emerald-950/40 dark:border-emerald-800/60">
 <PersonAvatar
 src={formData.foto_url}
 name={formData.full_name}
 size="detail"
 className="h-16 w-16 shrink-0 border border-emerald-200/80 dark:border-emerald-800/60 shadow-sm"
 />
 <div>
 <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Foto Siswa Berhasil Diunggah</p>
 <p className="text-xs text-slate-500 dark:text-slate-400">Digunakan untuk kartu pelajar & kelengkapan administrasi.</p>
 <button
 type="button"
 onClick={handleRemoveFoto}
 className="text-xs font-bold text-rose-600 hover:underline mt-1 inline-flex items-center gap-1 cursor-pointer"
 >
 <Trash2 className="size-3.5" /> Hapus Foto & Upload Ulang
 </button>
 </div>
 </div>
 ) : (
 <label className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/20 p-5 text-center hover:bg-emerald-50/35 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer transition-all dark:border-emerald-800/60 dark:bg-slate-900/30">
 <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-white dark:bg-[#1B2433] border border-emerald-200/80 dark:border-emerald-800/60 text-[#059669] dark:from-emerald-950/60 dark:to-teal-950/40 dark:border-emerald-800/60 dark:text-[#10B981]">
 <Upload className="size-5" strokeWidth={2.2} />
 </div>
 <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
 {isUploading ? 'Mengunggah...' : 'Upload Foto Siswa'}
 </span>
 <span className="text-xs text-slate-400 mt-0.5">PNG, JPG atau WEBP (Maksimal 2MB)</span>
 <input
 type="file"
 accept="image/*"
 onChange={handleFileUpload}
 className="hidden"
 />
 </label>
 )}
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Input label="Nama Lengkap Siswa" name="full_name" required icon={User} placeholder="Contoh: Fathir Ahmad" {...getProps('full_name')} />
 <Select
 label="Unit Pendidikan"
 name="unit_id"
 required
 icon={School}
 options={unitOptions}
 disabled={isUnitLocked}
 helperText={isUnitLocked ? 'Terkunci sesuai unit kerja Anda' : undefined}
 {...getProps('unit_id')}
 />
 <Input label="NIS" name="nis" required icon={Hash} placeholder="Nomor Induk Siswa" {...getProps('nis')} />
 <Input label="NISN" name="nisn" required icon={Hash} placeholder="10 Digit NISN" {...getProps('nisn')} />
 <Input
 label="NIK Siswa"
 name="nik"
 required
 icon={IdCard}
 placeholder="16 Digit NIK Siswa"
 maxLength={16}
 helperText={`${(formData.nik || '').length}/16 digit (Wajib 16 digit)`}
 error={formData.nik && formData.nik.length !== 16 ? `NIK harus 16 digit (${formData.nik.length}/16)` : undefined}
 {...getProps('nik')}
 />
 <Input label="No Pendaftaran" name="no_pendaftaran" icon={Hash} placeholder="PDK-2024-001" {...getProps('no_pendaftaran')} />
 <Input
 label="No Kartu Keluarga (KK)"
 name="no_kk"
 required
 icon={IdCard}
 placeholder="16 Digit No KK"
 maxLength={16}
 helperText={`${(formData.no_kk || '').length}/16 digit (Wajib 16 digit)`}
 error={formData.no_kk && formData.no_kk.length !== 16 ? `No KK harus 16 digit (${formData.no_kk.length}/16)` : undefined}
 {...getProps('no_kk')}
 />
 <Input label="No Registrasi Akta Lahir" name="no_registrasi_akta_lahir" icon={Hash} placeholder="No Akta Lahir" {...getProps('no_registrasi_akta_lahir')} />
 <Select label="Tempat Lahir" name="birth_place" icon={MapPin} options={getBirthPlaceOptions(formData.birth_place)} {...getProps('birth_place')} />
 <Input label="Tanggal Lahir" name="birth_date" type="date" icon={Calendar} {...getProps('birth_date')} />
 <Select label="Jenis Kelamin" name="gender" required icon={User} options={[{label:'Laki-laki', value:'male'}, {label:'Perempuan', value:'female'}]} {...getProps('gender')} />
 <Select label="Agama" name="agama" icon={ShieldCheck} options={['Islam','Kristen','Katolik','Hindu','Buddha','Konghucu']} {...getProps('agama')} />
 <Input label="Email Siswa (Opsional)" name="email" type="email" icon={Mail} placeholder="siswa@sekolah.sch.id" {...getProps('email')} />
 <Select label="Kewarganegaraan" name="kewarganegaraan" icon={MapPin} options={['WNI','WNA']} {...getProps('kewarganegaraan')} />
 <Input label="Anak Ke" name="anak_ke" type="number" min="1" icon={Users} {...getProps('anak_ke')} />
 <Input label="Jumlah Saudara" name="jumlah_saudara" type="number" min="0" icon={Users} {...getProps('jumlah_saudara')} />
 <Input label="Jumlah Saudara Tiri" name="jumlah_saudara_tiri" type="number" min="0" icon={Users} {...getProps('jumlah_saudara_tiri')} />
 <Input label="Berat Badan (kg)" name="berat_badan" type="number" min="0" step="0.1" icon={Hash} {...getProps('berat_badan')} />
 <Input label="Tinggi Badan (cm)" name="tinggi_badan" type="number" min="0" step="0.1" icon={Hash} {...getProps('tinggi_badan')} />
 <Input label="Riwayat Penyakit" name="riwayat_penyakit" icon={AlertTriangle} placeholder="Tulis jika ada" {...getProps('riwayat_penyakit')} />
 <Input label="Hobi" name="hobi" icon={Sparkles} placeholder="Contoh: Membaca" {...getProps('hobi')} />
 <Input label="Cita-cita" name="cita_cita" icon={Award} placeholder="Contoh: Dokter" {...getProps('cita_cita')} />
 </div>

 <hr className="border-emerald-100/80 dark:border-emerald-800/60 my-4" />

 <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Alamat & Tempat Tinggal</h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <div className="sm:col-span-2">
 <Input label="Alamat Lengkap" name="alamat_siswa" icon={MapPin} placeholder="Jl. Khatib Sulaiman No. 10..." {...getProps('alamat_siswa')} />
 </div>
 <Select label="Provinsi" name="provinsi" icon={MapPin} options={provList} {...getProps('provinsi')} />
 <Select label="Kota / Kabupaten" name="kota_kabupaten" icon={MapPin} options={kotaList.length > 0 ? kotaList : [formData.kota_kabupaten].filter(Boolean)} {...getProps('kota_kabupaten')} />
 {kecList.length > 0 ? (
 <Select label="Kecamatan" name="kecamatan" icon={MapPin} options={kecList} {...getProps('kecamatan')} />
 ) : (
 <Input label="Kecamatan" name="kecamatan" icon={MapPin} placeholder={formData.kota_kabupaten ? "Ketik kecamatan..." : "Pilih Kota/Kabupaten dulu"} {...getProps('kecamatan')} />
 )}
 {kelList.length > 0 ? (
 <Select label="Kelurahan / Desa" name="kelurahan" icon={MapPin} options={kelList} {...getProps('kelurahan')} />
 ) : (
 <Input label="Kelurahan / Desa" name="kelurahan" icon={MapPin} placeholder={formData.kecamatan ? "Ketik kelurahan..." : "Pilih Kecamatan dulu"} {...getProps('kelurahan')} />
 )}
 <Input label="RT" name="rt" icon={Hash} placeholder="001" {...getProps('rt')} />
 <Input label="RW" name="rw" icon={Hash} placeholder="002" {...getProps('rw')} />
 <Input label="Dusun" name="dusun" icon={MapPin} placeholder="Nama dusun" {...getProps('dusun')} />
 <Input label="Kode Pos" name="kode_pos" icon={Hash} placeholder="25114" {...getProps('kode_pos')} />
 <Select label="Jenis Tempat Tinggal" name="jenis_tempat_tinggal" icon={Building} options={residenceList} {...getProps('jenis_tempat_tinggal')} />
 <Input label="Jarak Tempuh ke Sekolah" name="jarak_tempuh_ke_sekolah" icon={Compass} placeholder="Contoh: 3 km" {...getProps('jarak_tempuh_ke_sekolah')} />
 <Select
 label="Moda Transportasi"
 name="moda_transportasi"
 icon={Compass}
 placeholder="-- Pilih Moda Transportasi --"
 options={modaOptions}
 {...getProps('moda_transportasi')}
 />
 </div>

 <hr className="border-emerald-100/80 dark:border-emerald-800/60 my-4" />

 {/* Peta Alamat Interaktif */}
 <AddressMap
 latitude={formData.latitude}
 longitude={formData.longitude}
 onLocationChange={handleMapLocationChange}
 onAddressSelect={handleMapAddressSelect}
 />
 </div>
 )}

 {/* STEP 2: PENDIDIKAN & BANTUAN */}
 {activeStep === 1 && (
 <div className="space-y-6">
 {/* Selector Jenis Pendaftaran Siswa (Prioritas 2) */}
 <div className="rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-[#1B2433] p-4 sm:p-5 dark:border-emerald-800/60 dark:from-emerald-950/40 dark:via-teal-950/20 dark:to-slate-900 shadow-sm">
 <div className="flex items-center justify-between mb-3">
 <div>
 <label className="block text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-wider">
 Jenis Pendaftaran Siswa <span className="text-rose-500">*</span>
 </label>
 <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
 Tentukan klasifikasi masuk siswa untuk pemetaan data pokok dan riwayat mutasi
 </p>
 </div>
 <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300">
 <Sparkles className="size-3" />
 <span>Klasifikasi Siswa</span>
 </span>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
 {[
 { id: 'baru', label: 'Siswa Baru (Reguler)', desc: 'Peserta didik baru masuk TP berjalan / PPDB', icon: UserCheck, tone: 'emerald' },
 { id: 'pindahan_eksternal', label: 'Pindahan Eksternal', desc: 'Pindah masuk dari sekolah luar yayasan', icon: School, tone: 'blue' },
 { id: 'pindahan_internal', label: 'Pindahan Internal', desc: 'Mutasi antar unit internal yayasan', icon: Building2, tone: 'amber' },
 ].map((item) => {
 const isSelected = (formData.jenis_pendaftaran || 'baru') === item.id
 const Icon = item.icon
 return (
 <button
 type="button"
 key={item.id}
 onClick={() => handleChange({ target: { name: 'jenis_pendaftaran', value: item.id } })}
 className={`flex items-start gap-3 p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
 isSelected
 ? 'border-emerald-200/80 dark:border-emerald-800/60 bg-white dark:bg-slate-900 shadow-md ring-2 ring-emerald-500/25 dark:border-emerald-800/60'
 : 'border-emerald-200/80 bg-white/70 hover:bg-white dark:border-emerald-800/60 dark:bg-slate-900/50 hover:border-emerald-300'
 }`}
 >
 <div className={`p-2 rounded-xl shrink-0 ${
 isSelected
 ? 'bg-slate-100 border border-emerald-200/80 text-slate-700 shadow-xs dark:bg-slate-800 dark:border-emerald-700/80 dark:text-slate-300'
 : 'bg-slate-100 text-slate-500 dark:bg-sky-950/60 dark:text-sky-300'
 }`}>
 <Icon className="size-4" />
 </div>
 <div className="flex-1 min-w-0">
 <p className={`text-xs font-bold leading-tight ${isSelected ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}`}>
 {item.label}
 </p>
 <p className="text-[10.5px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
 {item.desc}
 </p>
 </div>
 </button>
 )
 })}
 </div>

 {/* Jika Pindahan Internal: Tampilkan field Unit Asal */}
 {formData.jenis_pendaftaran === 'pindahan_internal' && (
 <div className="mt-4 pt-4 border-t border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60">
 <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-emerald-200/80 dark:border-emerald-800/60 dark:bg-amber-950/30 dark:border-emerald-800/60 mb-3">
 <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
 <p className="text-xs text-amber-800 dark:text-amber-300 font-medium leading-relaxed">
 Siswa tercatat sebagai <strong>Pindahan Internal Yayasan</strong>. Pilih unit pendidikan asal siswa di bawah ini untuk menghubungkan histori kesiswaan.
 </p>
 </div>
 <Select
 label="Unit Pendidikan Asal (Internal Yayasan)"
 name="unit_asal_id"
 required
 icon={School}
 options={allUnitOptions}
 placeholder="-- Pilih Unit Pendidikan Asal --"
 {...getProps('unit_asal_id')}
 />
 </div>
 )}
 </div>

 <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
 {formData.jenis_pendaftaran === 'pindahan_eksternal' ? 'Data Sekolah Asal (Luar Yayasan)' : 'Riwayat Sekolah Sebelumnya (Opsional)'}
 </h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Input
 label="Nama Sekolah Asal"
 name="sekolah_asal"
 icon={School}
 required={formData.jenis_pendaftaran === 'pindahan_eksternal'}
 placeholder={formData.jenis_pendaftaran === 'pindahan_eksternal' ? "Contoh: SD Negeri 01 Padang" : "Nama sekolah/madrasah/TK sebelumnya"}
 {...getProps('sekolah_asal')}
 />
 <Select label="Status Sekolah Asal" name="status_sekolah_asal" icon={Building} options={['Formal', 'Tidak Formal']} {...getProps('status_sekolah_asal')} />
 <Select
 label="Provinsi Sekolah Asal"
 name="provinsi_sekolah_asal"
 icon={MapPin}
 placeholder="-- Pilih Provinsi Sekolah Asal --"
 options={provList}
 {...getProps('provinsi_sekolah_asal')}
 />
 <Select
 label="Kota / Kab Sekolah Asal"
 name="kota_kab_sekolah_asal"
 icon={MapPin}
 disabled={!formData.provinsi_sekolah_asal}
 placeholder={formData.provinsi_sekolah_asal ? "-- Pilih Kota / Kabupaten --" : "Pilih Provinsi Dulu"}
 options={kotaSekolahList}
 {...getProps('kota_kab_sekolah_asal')}
 />
 <Select
 label="Kecamatan Sekolah Asal"
 name="kecamatan_sekolah_asal"
 icon={MapPin}
 disabled={!formData.kota_kab_sekolah_asal}
 placeholder={formData.kota_kab_sekolah_asal ? "-- Pilih Kecamatan --" : "Pilih Kota/Kab Dulu"}
 options={kecSekolahList}
 {...getProps('kecamatan_sekolah_asal')}
 />
 <Select
 label="Kelurahan Sekolah Asal"
 name="kelurahan_sekolah_asal"
 icon={MapPin}
 disabled={!formData.kecamatan_sekolah_asal}
 placeholder={formData.kecamatan_sekolah_asal ? "-- Pilih Kelurahan --" : "Pilih Kecamatan Dulu"}
 options={kelSekolahList}
 {...getProps('kelurahan_sekolah_asal')}
 />
 <Input label="No HP / WA Sekolah Asal" name="nomor_hp_wa_sekolah_asal" icon={Phone} placeholder="08xx-xxxx-xxxx" {...getProps('nomor_hp_wa_sekolah_asal')} />
 </div>

 <hr className="border-emerald-100/80 dark:border-emerald-800/60 my-4" />

 <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Administrasi Bantuan</h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Input label="Nominal SPP" name="nominal_spp" isRupiah icon={CreditCard} placeholder="500.000" {...getProps('nominal_spp')} />
 <Input label="Nominal Bantuan Ortu Asuh" name="nominal_ortu_asuh" isRupiah icon={CreditCard} placeholder="0" {...getProps('nominal_ortu_asuh')} />
 <Select label="Penerima KPS / PKH" name="penerima_kps_pkh" icon={ShieldCheck} options={['ya', 'tidak']} {...getProps('penerima_kps_pkh')} />
 <Select label="Apakah Punya KIP?" name="apakah_punya_kip" icon={CreditCard} options={['ya', 'tidak']} {...getProps('apakah_punya_kip')} />
 <Select label="Apakah Layak Menerima PIP?" name="apakah_layak_menerima_pip" icon={CreditCard} options={['ya', 'tidak']} {...getProps('apakah_layak_menerima_pip')} />
 <div className="sm:col-span-2">
 <Input label="Alasan Menolak PIP (Jika ada)" name="alasan_menolak_pip" icon={AlertTriangle} placeholder="Ditolak / Sudah Mampu" {...getProps('alasan_menolak_pip')} />
 </div>
 </div>
 </div>
 )}

 {/* STEP 3: DATA ORANG TUA */}
 {activeStep === 2 && (
 <div className="space-y-6">
 <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 border-b border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 pb-2">Ayah Kandung</h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Input
 label="NIK Ayah"
 name="nik_ayah"
 icon={IdCard}
 placeholder="16 Digit NIK Ayah"
 maxLength={16}
 helperText={`${(formData.nik_ayah || '').length}/16 digit`}
 error={formData.nik_ayah && formData.nik_ayah.length !== 16 ? `NIK Ayah harus 16 digit (${formData.nik_ayah.length}/16)` : undefined}
 {...getProps('nik_ayah')}
 />
 <Input label="Nama Ayah Kandung" name="nama_ayah" icon={User} placeholder="Nama Ayah" {...getProps('nama_ayah')} />
 <Select label="Tempat Lahir Ayah" name="tempat_lahir_ayah" icon={MapPin} options={getBirthPlaceOptions(formData.tempat_lahir_ayah)} {...getProps('tempat_lahir_ayah')} />
 <Input label="Tanggal Lahir Ayah" name="tgl_lahir_ayah" type="date" icon={Calendar} {...getProps('tgl_lahir_ayah')} />
 <Input label="Telepon Ayah" name="telfon_ayah" icon={Phone} placeholder="Nomor telepon rumah" {...getProps('telfon_ayah')} />
 <Input label="No HP / WA Ayah" name="hp_ayah" icon={Phone} placeholder="08xx-xxxx-xxxx" {...getProps('hp_ayah')} />
 <Select label="Pendidikan Terakhir Ayah" name="pendidikan_terakhir_ayah" icon={GraduationCap} options={educationList} {...getProps('pendidikan_terakhir_ayah')} />
 <Select
 label="Pekerjaan Ayah"
 name="pekerjaan_ayah"
 icon={Briefcase}
 placeholder="-- Pilih Pekerjaan Ayah --"
 options={occupationOptionsAyah}
 {...getProps('pekerjaan_ayah')}
 />
 {isPnsOccupation(formData.pekerjaan_ayah) && (
 <>
 <Input label="Instansi Pekerjaan Ayah" name="instansi_pekerjaan_ayah" icon={Building2} placeholder="Contoh: Dinas Pendidikan / Kementerian" {...getProps('instansi_pekerjaan_ayah')} />
 <Input label="Jabatan Pekerjaan Ayah" name="jabatan_pekerjaan_ayah" icon={Briefcase} placeholder="Contoh: Staf / Kepala Seksi" {...getProps('jabatan_pekerjaan_ayah')} />
 <Input label="Alamat Instansi Ayah" name="alamat_instansi_ayah" icon={MapPin} placeholder="Contoh: Jl. Jenderal Sudirman No. 1" {...getProps('alamat_instansi_ayah')} />
 </>
 )}
 <Input label="Keahlian Ayah" name="keahlian_ayah" icon={Sparkles} {...getProps('keahlian_ayah')} />
 <Input label="Penghasilan Ayah" name="penghasilan_ayah" isRupiah icon={CreditCard} placeholder="5.000.000" {...getProps('penghasilan_ayah')} />
 <Input label="Alamat Ayah" name="alamat_ayah" icon={MapPin} {...getProps('alamat_ayah')} />
 <Input label="Nomor WA Ayah" name="nomor_wa_ayah" icon={Phone} placeholder="08xx-xxxx-xxxx" {...getProps('nomor_wa_ayah')} />
 <Input label="Media Sosial Ayah" name="medsos_ayah" icon={User} placeholder="Contoh: @akun" {...getProps('medsos_ayah')} />
 </div>

 <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 border-b border-emerald-200/80 dark:border-emerald-800/80 dark:border-emerald-800/60 pb-2 pt-2">Ibu Kandung</h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Input
 label="NIK Ibu"
 name="nik_ibu"
 icon={IdCard}
 placeholder="16 Digit NIK Ibu"
 maxLength={16}
 helperText={`${(formData.nik_ibu || '').length}/16 digit`}
 error={formData.nik_ibu && formData.nik_ibu.length !== 16 ? `NIK Ibu harus 16 digit (${formData.nik_ibu.length}/16)` : undefined}
 {...getProps('nik_ibu')}
 />
 <Input label="Nama Ibu Kandung" name="nama_ibu" icon={User} placeholder="Nama Ibu" {...getProps('nama_ibu')} />
 <Select label="Tempat Lahir Ibu" name="tempat_lahir_ibu" icon={MapPin} options={getBirthPlaceOptions(formData.tempat_lahir_ibu)} {...getProps('tempat_lahir_ibu')} />
 <Input label="Tanggal Lahir Ibu" name="tgl_lahir_ibu" type="date" icon={Calendar} {...getProps('tgl_lahir_ibu')} />
 <Input label="Telepon Ibu" name="telfon_ibu" icon={Phone} placeholder="Nomor telepon rumah" {...getProps('telfon_ibu')} />
 <Input label="No HP / WA Ibu" name="hp_ibu" icon={Phone} placeholder="08xx-xxxx-xxxx" {...getProps('hp_ibu')} />
 <Select label="Pendidikan Terakhir Ibu" name="pendidikan_terakhir_ibu" icon={GraduationCap} options={educationList} {...getProps('pendidikan_terakhir_ibu')} />
 <Select
 label="Pekerjaan Ibu"
 name="pekerjaan_ibu"
 icon={Briefcase}
 placeholder="-- Pilih Pekerjaan Ibu --"
 options={occupationOptionsIbu}
 {...getProps('pekerjaan_ibu')}
 />
 {isPnsOccupation(formData.pekerjaan_ibu) && (
 <>
 <Input label="Instansi Pekerjaan Ibu" name="instansi_pekerjaan_ibu" icon={Building2} placeholder="Contoh: Puskesmas / RSUD / Dinas" {...getProps('instansi_pekerjaan_ibu')} />
 <Input label="Jabatan Pekerjaan Ibu" name="jabatan_pekerjaan_ibu" icon={Briefcase} placeholder="Contoh: Bidan / Staf Administrasi" {...getProps('jabatan_pekerjaan_ibu')} />
 <Input label="Alamat Instansi Ibu" name="alamat_instansi_ibu" icon={MapPin} placeholder="Contoh: Jl. Khatib Sulaiman No. 5" {...getProps('alamat_instansi_ibu')} />
 </>
 )}
 <Input label="Keahlian Ibu" name="keahlian_ibu" icon={Sparkles} {...getProps('keahlian_ibu')} />
 <Input label="Penghasilan Ibu" name="penghasilan_ibu" isRupiah icon={CreditCard} placeholder="0" {...getProps('penghasilan_ibu')} />
 <Input label="Alamat Ibu" name="alamat_ibu" icon={MapPin} {...getProps('alamat_ibu')} />
 <Input label="Nomor WA Ibu" name="nomor_wa_ibu" icon={Phone} placeholder="08xx-xxxx-xxxx" {...getProps('nomor_wa_ibu')} />
 <Input label="Media Sosial Ibu" name="medsos_ibu" icon={User} placeholder="Contoh: @akun" {...getProps('medsos_ibu')} />
 </div>
 </div>
 )}

 {/* STEP 4: DATA WALI */}
 {activeStep === 3 && (
 <div className="space-y-6">
 <div className="bg-slate-50 dark:bg-slate-900/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-xl p-4 text-xs text-slate-600 dark:text-slate-300">
 Isi data di bawah ini hanya jika siswa tinggal bersama wali (selain ayah/ibu kandung).
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Select label="Status Pernikahan Wali" name="status_pernikahan_wali" icon={Users} options={maritalList} {...getProps('status_pernikahan_wali')} />
 <Input label="Tanggungan Anak Wali" name="tanggungan_anak_wali" type="number" min="0" icon={Users} {...getProps('tanggungan_anak_wali')} />
 <Input
 label="NIK Wali"
 name="nik_wali"
 icon={IdCard}
 placeholder="16 Digit NIK Wali"
 maxLength={16}
 helperText={`${(formData.nik_wali || '').length}/16 digit`}
 error={formData.nik_wali && formData.nik_wali.length !== 16 ? `NIK Wali harus 16 digit (${formData.nik_wali.length}/16)` : undefined}
 {...getProps('nik_wali')}
 />
 <Input label="Nama Wali Siswa" name="nama_wali" icon={User} placeholder="Nama Wali" {...getProps('nama_wali')} />
 <Select label="Tempat Lahir Wali" name="tempat_lahir_wali" icon={MapPin} options={getBirthPlaceOptions(formData.tempat_lahir_wali)} {...getProps('tempat_lahir_wali')} />
 <Input label="Tanggal Lahir Wali" name="tgl_lahir_wali" type="date" icon={Calendar} {...getProps('tgl_lahir_wali')} />
 <Input label="Telepon Wali" name="telfon_wali" icon={Phone} placeholder="Nomor telepon rumah" {...getProps('telfon_wali')} />
 <Input label="No HP / WA Wali" name="hp_wali" icon={Phone} placeholder="08xx-xxxx-xxxx" {...getProps('hp_wali')} />
 <Select label="Pendidikan Terakhir Wali" name="pendidikan_terakhir_wali" icon={GraduationCap} options={educationList} {...getProps('pendidikan_terakhir_wali')} />
 <Select
 label="Pekerjaan Wali"
 name="pekerjaan_wali"
 icon={Briefcase}
 placeholder="-- Pilih Pekerjaan Wali --"
 options={occupationOptionsWali}
 {...getProps('pekerjaan_wali')}
 />
 {isPnsOccupation(formData.pekerjaan_wali) && (
 <>
 <Input label="Instansi Pekerjaan Wali" name="instansi_pekerjaan_wali" icon={Building2} placeholder="Nama Instansi / Kantor" {...getProps('instansi_pekerjaan_wali')} />
 <Input label="Jabatan Pekerjaan Wali" name="jabatan_pekerjaan_wali" icon={Briefcase} placeholder="Jabatan di Instansi" {...getProps('jabatan_pekerjaan_wali')} />
 <Input label="Alamat Instansi Wali" name="alamat_instansi_wali" icon={MapPin} placeholder="Alamat Instansi" {...getProps('alamat_instansi_wali')} />
 </>
 )}
 <Input label="Keahlian Wali" name="keahlian_wali" icon={Sparkles} {...getProps('keahlian_wali')} />
 <Input label="Penghasilan Wali" name="penghasilan_wali" isRupiah icon={CreditCard} placeholder="0" {...getProps('penghasilan_wali')} />
 <div className="sm:col-span-2">
 <Input label="Alamat Wali" name="alamat_wali" icon={MapPin} placeholder="Alamat lengkap wali..." {...getProps('alamat_wali')} />
 </div>
 <Input label="Nomor WA Wali" name="nomor_wa_wali" icon={Phone} placeholder="08xx-xxxx-xxxx" {...getProps('nomor_wa_wali')} />
 <Input label="Media Sosial Wali" name="medsos_wali" icon={User} placeholder="Contoh: @akun" {...getProps('medsos_wali')} />
 </div>
 </div>
 )}

 {/* STEP 5: AKADEMIK & STATUS */}
 {activeStep === 4 && (
 <div className="space-y-6">
 <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Penempatan Unit & Kelas</h4>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
 <Select
 label="Unit Pendidikan"
 name="unit_id"
 required
 icon={School}
 options={unitOptions}
 disabled={isUnitLocked}
 helperText={isUnitLocked ? 'Terkunci sesuai unit kerja Anda' : undefined}
 {...getProps('unit_id')}
 />
 <Select label="Pilih Kelas" name="kelas_id" icon={Building} options={classOptions} {...getProps('kelas_id')} />
 {/* Sinergi Virtual Account Bank Syariah Indonesia (BSI) */}
 <div className="sm:col-span-2 rounded-xl border border-emerald-200/80 dark:border-emerald-800/60 bg-emerald-50/50 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/20">
 <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
 <div className="flex items-center gap-2">
 <CreditCard className="size-4 text-emerald-600 dark:text-emerald-400" />
 <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">
 Nomor Virtual Account Bank Syariah Indonesia (VA BSI)
 </h5>
 </div>
 <button
 type="button"
 onClick={handleAutoGenerateVa}
 className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition border border-emerald-200/80 dark:border-emerald-800/60 h-9 text-sm font-medium"
 >
 <Sparkles className="size-3.5" />
 Generate Otomatis VA
 </button>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
 <Input
 label="No. Virtual Account (VA BSI)"
 name="no_va"
 icon={CreditCard}
 placeholder="Contoh: 9023xxxxxxxx"
 {...getProps('no_va')}
 />
 <Input
 label="NIS Pembayaran (Sinkron)"
 name="nis_pembayaran"
 icon={Hash}
 placeholder="NIS Pembayaran"
 {...getProps('nis_pembayaran')}
 />
 </div>
 <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
 Nomor VA BSI ini dapat dibayar orang tua via BSI Mobile, ATM BSI, maupun transfer antar bank (Kode Bank BSI: 451).
 </p>
 </div>
 <Select
 label="Tahun Ajaran Masuk"
 name="tahun_ajaran_masuk"
 icon={Calendar}
 placeholder="-- Pilih Tahun Ajaran Masuk --"
 options={academicYearOptions}
 {...getProps('tahun_ajaran_masuk')}
 />
 <Input label="Keterangan Kelas" name="keterangan_kelas" icon={BookOpen} placeholder="Contoh: Kelas reguler pagi" {...getProps('keterangan_kelas')} />
 <Select
 label="Tahun Ajaran Berjalan"
 name="tahun_ajaran_berjalan"
 icon={Calendar}
 placeholder="-- Pilih Tahun Ajaran Berjalan --"
 options={academicYearOptions}
 {...getProps('tahun_ajaran_berjalan')}
 />
 <Select label="Status Siswa" name="status_siswa" icon={ShieldCheck} options={studentStatusOptions} {...getProps('status_siswa')} />
 <Select label="Status Orang Tua" name="status_orang_tua" icon={Users} options={['Umum', 'Pegawai']} {...getProps('status_orang_tua')} />
 <Input label="NIY Ortu (Jika Pegawai)" name="niy_ortu_jika_pegawai" icon={Hash} placeholder="NIY Pegawai" {...getProps('niy_ortu_jika_pegawai')} />
 <Input label="Wali Kelas" name="wali_kelas" readOnly icon={User} placeholder="Terisi dari data kelas" {...getProps('wali_kelas')} />
 <Input label="NIY Wali Kelas" name="niy_wali_kelas" readOnly icon={Hash} placeholder="Terisi dari data kelas" {...getProps('niy_wali_kelas')} />
 </div>
 </div>
 )}

 </form>
 </div>

 {/* Modal Footer — Canonical Unified Actions */}
 <div className="modal-footer flex shrink-0 items-center justify-between border-t border-emerald-100/80 bg-white px-4 py-3 sm:px-6 sm:py-4 dark:border-emerald-800/60 dark:bg-slate-950 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] sm:pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
 <AppButton variant="ghost" size="md" icon={X} onClick={onClose}>Batal</AppButton>

 <div className="flex items-center gap-2 sm:gap-2.5">
 {activeStep > 0 && (
 <AppButton variant="outline" size="md" icon={ArrowLeft} onClick={() => setActiveStep(prev => prev - 1)}>Kembali</AppButton>
 )}

 {activeStep < steps.length - 1 ? (
 <AppButton variant="primary" size="md" onClick={handleNextStep}><span>Selanjutnya</span><ArrowRight className="size-4 ml-1.5" strokeWidth={2} /></AppButton>
 ) : (
 <AppButton variant="primary" size="md" icon={Save} type="submit" form="student-main-form">Simpan Data</AppButton>
 )}
 </div>
 </div>

 </div>
 </motion.div>
 </div>
 )
}
