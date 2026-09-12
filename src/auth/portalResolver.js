/**
 * portalResolver.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Sumber tunggal kebenaran untuk:
 *   1. Grup role (ROLES) yang dipakai di seluruh aplikasi
 *   2. Helper predicate functions berdasarkan dokumen Hak Akses SIT
 *   3. Resolusi default portal berdasarkan role pengguna
 * ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// § 1. KONSTANTA GRUP ROLE
// Diimpor di mana pun agar tidak perlu menulis ulang array panjang.
// Setiap grup mencerminkan tingkatan akses di dokumen hak akses SIT.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Kumpulan grup role terstruktur.
 *
 * TINGKATAN (sesuai dokumen hak akses SIT):
 *   1 — SUPER_ADMIN  : Akses penuh sistem, semua fitur tanpa pembatasan
 *   1b— ADMIN        : Admin operasional, manajemen data & hak akses
 *   2 — YAYASAN      : Monitoring multi-unit, laporan lintas unit (read-heavy)
 *   3 — DIVISI       : Koordinasi akademik, terkunci per unit pendidikan
 *   4 — KEPALA_SEKOLAH: Pimpinan unit, monitoring + input per unit
 *   5 — WAKA         : Koordinator bidang di bawah Kepala Sekolah
 *   6 — TATA_USAHA   : Operasional administrasi & absensi harian
 *   7 — GURU         : Pengajaran, setoran hafalan, mutabaah
 *   8 — ORANG_TUA    : Portal wali murid, izin & pemantauan anak
 *   8 — SISWA        : Portal peserta didik
 *   8 — ALUMNI       : Portal alumni & tracer study
 */
export const ROLES = {
  /** Tingkat 1 — Akses penuh sistem */
  SUPER_ADMIN: ['Super Admin', 'Superadmin', 'super_admin'],

  /** Tingkat 1b — Admin operasional */
  ADMIN: ['Admin'],

  /**
   * Tingkat 2 — Yayasan.
   * Monitoring multi-unit, akses laporan lintas unit.
   */
  YAYASAN: [
    'Yayasan',
    'Ketua Yayasan', 'ketua_yayasan',
    'Pengurus Yayasan', 'pengurus_yayasan',
    'Sekretaris Yayasan', 'sekretaris_yayasan',
    'Bendahara Yayasan', 'bendahara_yayasan',
  ],

  /**
   * Tingkat 3 — Divisi Pendidikan & semua sub-divisi.
   * Dokumen: "Div. Pendidikan"
   * Koordinasi akademik, input monitoring, terkunci per unit.
   */
  DIVISI: [
    'Kepala Bidang Pendidikan',
    'Divisi Pendidikan', 'divisi_pendidikan',
    'Divisi Kurikulum',
    'Divisi Kesiswaan',
    'Divisi Bahasa',
    'Divisi Program Khusus',
  ],

  /**
   * Tingkat 4 — Kepala Sekolah.
   * Dokumen: "Kepsek"
   * Pimpinan unit pendidikan, monitoring & input seluruh divisi unit-nya.
   */
  KEPALA_SEKOLAH: ['Kepala Sekolah', 'kepala_sekolah', 'kepsek'],

  /**
   * Tingkat 5 — Wakil Kepala Sekolah.
   * Koordinator bidang (kurikulum & kesiswaan) di bawah Kepala Sekolah.
   */
  WAKA: [
    'Wakil Kepala Sekolah',
    'Waka Kurikulum', 'Wakil Kurikulum', 'waka_kurikulum',
    'Waka Kesiswaan', 'Wakil Kesiswaan', 'waka_kesiswaan',
  ],

  /**
   * Tingkat 6 — Tenaga Kependidikan.
   * Dokumen: "TU"
   * Operasional administrasi, absensi digital, rekap kehadiran.
   */
  TATA_USAHA: ['Tata Usaha', 'TU', 'tu', 'tata_usaha', 'Operator', 'operator'],

  /**
   * Tingkat 7 — Tenaga Pendidik (semua jenis guru & pembimbing).
   * Dokumen: "Guru"
   * Input setoran tahfizh, mutabaah yaumiyah, rekap hafalan, dll.
   * Musyrif & Musyrifah termasuk di sini untuk akses tahfizh & asrama.
   */
  GURU: [
    'Guru', 'guru',
    'Guru Mata Pelajaran', 'guru_mata_pelajaran',
    'Guru PAI',
    'Guru Tahfizh', 'guru_tahfizh',
    'Guru BK', 'guru_bk',
    'Wali Kelas', 'walas', 'wali_kelas',
    'Musyrif', 'musyrif',
    'Musyrifah',
    'Musyrif / Musyrifah',
    'Pembimbing',
  ],

  /**
   * Pembimbing / Pengasuh Asrama (Keasramaan).
   * Menangani ibadah 24 jam, kamar santri, kedisiplinan, & perizinan.
   */
  MUSYRIF: [
    'Musyrif', 'musyrif',
    'Musyrifah', 'musyrifah',
    'Musyrif / Musyrifah',
    'Pengasuh', 'Wali Asrama', 'Pembimbing Asrama',
  ],

  /**
   * Tingkat 8 — Orang Tua / Wali Murid.
   * Dokumen: "Orang Tua & Siswa"
   * Portal orang tua, absensi barcode, izin/sakit, pantau hafalan anak.
   */
  ORANG_TUA: ['Orang Tua', 'orang_tua', 'Orangtua', 'Wali Murid', 'parent'],

  /**
   * Tingkat 8 — Siswa / Peserta Didik.
   * Portal siswa, lihat hafalan & mutabaah sendiri.
   */
  SISWA: ['Siswa', 'siswa', 'student'],

  /** Tingkat 8 — Alumni */
  ALUMNI: ['Alumni', 'alumni'],
}

// ─────────────────────────────────────────────────────────────────────────────
// § 2. PORTAL ROUTES (untuk resolveDefaultPortal)
// ─────────────────────────────────────────────────────────────────────────────

const PORTAL_ROUTES = new Set([
  '/dashboard',
  '/dashboard/pemantauan',
  '/dashboard/yayasan',
  '/dashboard/divisi-pendidikan',
  '/dashboard/kepala-sekolah',
  '/dashboard/waka-kurikulum',
  '/dashboard/waka-kesiswaan',
  '/dashboard/tata-usaha',
  '/dashboard/wali-kelas',
  '/dashboard/guru-tahfizh',
  '/dashboard/musyrif',
  '/dashboard/guru-bk',
  '/dashboard/operator',
  '/portal-guru',
  '/portal-orangtua',
  '/portal-siswa',
  '/portal/alumni',
])

/**
 * Peta role → route default.
 * Urutan penting: role tingkatan lebih tinggi harus lebih awal.
 * Role spesifik (Guru Tahfizh, Wali Kelas) didahulukan sebelum role umum (Guru).
 */
const ROLE_ROUTES = [
  // Tingkat 1 — Super Admin
  { roles: ROLES.SUPER_ADMIN, route: '/dashboard' },
  // Tingkat 1b — Admin
  { roles: ROLES.ADMIN, route: '/dashboard/pemantauan' },
  // Tingkat 2 — Yayasan
  { roles: ROLES.YAYASAN, route: '/dashboard/yayasan' },
  // Tingkat 3 — Divisi Pendidikan (semua sub-divisi)
  { roles: ROLES.DIVISI, route: '/dashboard/divisi-pendidikan' },
  // Tingkat 4 — Kepala Sekolah
  { roles: ROLES.KEPALA_SEKOLAH, route: '/dashboard/kepala-sekolah' },
  // Tingkat 5a — Waka Kurikulum
  { roles: ['Wakil Kepala Sekolah', 'Waka Kurikulum', 'Wakil Kurikulum', 'waka_kurikulum'], route: '/dashboard/waka-kurikulum' },
  // Tingkat 5b — Waka Kesiswaan
  { roles: ['Waka Kesiswaan', 'Wakil Kesiswaan', 'waka_kesiswaan'], route: '/dashboard/waka-kesiswaan' },
  // Tingkat 6a — Tata Usaha
  { roles: ['Tata Usaha', 'TU', 'tu', 'tata_usaha'], route: '/dashboard/tata-usaha' },
  // Tingkat 6b — Operator
  { roles: ['Operator', 'operator'], route: '/dashboard/operator' },
  // Tingkat 7 — Guru spesialisasi (urutan spesifik → umum)
  { roles: ['Guru Tahfizh', 'guru_tahfizh'], route: '/dashboard/guru-tahfizh' },
  { roles: ['Musyrif', 'musyrif', 'Musyrifah', 'Musyrif / Musyrifah'], route: '/dashboard/musyrif' },
  { roles: ['Guru BK', 'guru_bk'], route: '/dashboard/guru-bk' },
  { roles: ['Wali Kelas', 'walas', 'wali_kelas'], route: '/dashboard/wali-kelas' },
  // Tingkat 7b — Guru umum
  { roles: ['Guru', 'guru', 'Guru Mata Pelajaran', 'guru_mata_pelajaran', 'Guru PAI', 'Pembimbing'], route: '/dashboard' },
  // Tingkat 8 — Pengguna Eksternal
  { roles: ROLES.ORANG_TUA, route: '/portal-orangtua' },
  { roles: ROLES.SISWA, route: '/portal-siswa' },
  { roles: ROLES.ALUMNI, route: '/portal/alumni' },
]

// ─────────────────────────────────────────────────────────────────────────────
// § 3. CORE UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

/** Normalisasi role ke string lowercase tanpa spasi/underscore/dash */
export const normalizeRole = (role) => {
  if (!role) return ''
  if (typeof role === 'object') {
    role = role.name || role.nama || role.role || role.guard_name || ''
  }
  return String(role).toLowerCase().replace(/[\s_-]+/g, '')
}

/** Cek apakah pengguna memiliki setidaknya satu dari role yang diizinkan */
export const hasAnyRole = (roles = [], allowedRoles = []) => {
  const current = roles.map(normalizeRole)
  return allowedRoles.some((role) => current.includes(normalizeRole(role)))
}

// ─────────────────────────────────────────────────────────────────────────────
// § 4. HELPER PREDICATE — MANAJEMEN AKSES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Global Access Manager — kelola data seluruh unit pendidikan.
 * Termasuk: Super Admin, Admin, Pengurus Yayasan
 */
export const isGlobalAccessManager = (roles = []) =>
  hasAnyRole(roles, [...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.YAYASAN])

/**
 * Unit Access Manager — kelola data unit sendiri saja.
 * Termasuk: Divisi Pendidikan (semua sub-divisi), Kepala Sekolah, Tata Usaha
 */
export const isUnitAccessManager = (roles = []) =>
  hasAnyRole(roles, [...ROLES.DIVISI, ...ROLES.KEPALA_SEKOLAH, ...ROLES.TATA_USAHA])

// ─────────────────────────────────────────────────────────────────────────────
// § 5. HELPER PREDICATE — BERDASARKAN DOKUMEN HAK AKSES SIT
// Setiap fungsi mencerminkan kolom "Hak Akses" di dokumen yang dilampirkan.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * § 1 Dashboard Monitoring Kepala Sekolah
 * "Kepsek & Divisi"
 * Fitur: Monitoring Kehadiran, Input Monitoring Divisi, Input Laporan Bulanan,
 *        Rekapitulasi Prestasi Siswa
 */
export const isKepsekOrDivisi = (roles = []) =>
  hasAnyRole(roles, [...ROLES.KEPALA_SEKOLAH, ...ROLES.DIVISI])

/**
 * § 2 Sistem Absensi Digital
 * "TU, Kepsek"
 * Fitur: Absensi Digital Siswa, Rekap Otomatis Keterlambatan,
 *        Rekap Otomatis Ketidakhadiran
 */
export const isTuOrKepsek = (roles = []) =>
  hasAnyRole(roles, [...ROLES.TATA_USAHA, ...ROLES.KEPALA_SEKOLAH])

/**
 * § 3 Sistem Tahfizh & Mutabaah
 * "Kepsek, Div. Pendidikan, Guru"
 * Fitur: Input Setoran Tahfizh, Rekap Harian/Mingguan/Bulanan/Tahunan,
 *        Mutabaah Yaumiyah, Perhitungan Tercapai/Tidak, Total Hafalan
 */
export const isKepsekDivisiOrGuru = (roles = []) =>
  hasAnyRole(roles, [...ROLES.KEPALA_SEKOLAH, ...ROLES.DIVISI, ...ROLES.GURU])

/**
 * Orang Tua & Siswa
 * Fitur: Absensi Barcode/Kartu, Izin/Sakit, Laporan Hafalan & Target
 */
export const isOrangTuaOrSiswa = (roles = []) =>
  hasAnyRole(roles, [...ROLES.ORANG_TUA, ...ROLES.SISWA])

/** Tenaga Pendidik semua jenis (termasuk Musyrif & Wali Kelas) */
export const isTeacherRole = (roles = []) =>
  hasAnyRole(roles, ROLES.GURU)

/** Musyrif / Pembimbing Asrama */
export const isMusyrifRole = (roles = []) =>
  hasAnyRole(roles, ROLES.MUSYRIF)

/** Orang Tua / Wali Murid */
export const isParentRole = (roles = []) =>
  hasAnyRole(roles, ROLES.ORANG_TUA)

/** Siswa / Peserta Didik */
export const isStudentRole = (roles = []) =>
  hasAnyRole(roles, ROLES.SISWA)

// ─────────────────────────────────────────────────────────────────────────────
// § 6. RESOLVE DEFAULT PORTAL
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolusi workspace utama berdasarkan role pengguna.
 * Redirect dari API hanya dipakai sebagai fallback untuk akun
 * yang belum memiliki pemetaan role di client.
 */
export const resolveDefaultPortal = (source = {}) => {
  const user = source.user?.data || source.user || source
  const roles = Array.isArray(user.roles) ? user.roles : user.role ? [user.role] : []
  const roleRoute = ROLE_ROUTES.find(({ roles: allowedRoles }) => hasAnyRole(roles, allowedRoles))?.route

  if (roleRoute) return roleRoute

  const explicitRoute = source.default_redirect || user.default_redirect
  return PORTAL_ROUTES.has(explicitRoute) ? explicitRoute : '/dashboard'
}

// ─────────────────────────────────────────────────────────────────────────────
// § 7. TIER KONFIGURASI ROLE AKSES
// Matriks tingkatan yang menentukan SIAPA bisa mengubah konfigurasi ROLE SIAPA.
// Digunakan di MasterHakAksesPage untuk menampilkan badge tier dan enforce
// scope akses editor (global vs per-unit).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ROLE_TIERS — Konfigurasi default role akses & siapa yang bisa mengubahnya.
 *
 * Properti setiap tier:
 *   - roles        : role-role yang termasuk dalam tier ini
 *   - label        : nama tampilan di UI
 *   - description  : deskripsi singkat tanggung jawab tier
 *   - color        : warna badge UI
 *   - scope        : 'global' | 'unit' | 'external'
 *   - canEditBy    : role-role yang diizinkan mengubah permission/assignment tier ini
 *   - canEditScope : 'global' | 'own_unit'
 *   - isProtected  : true = tidak bisa dihapus/dinonaktifkan
 */
export const ROLE_TIERS = [
  {
    id: 'system',
    label: 'Sistem',
    description: 'Akses penuh tanpa pembatasan — tidak dapat dibatasi oleh siapapun',
    color: 'red',
    scope: 'global',
    roles: [...ROLES.SUPER_ADMIN],
    canEditBy: [...ROLES.SUPER_ADMIN],
    canEditScope: 'global',
    isProtected: true,
  },
  {
    id: 'admin',
    label: 'Admin Sistem',
    description: 'Manajemen data global, hak akses, dan konfigurasi sistem',
    color: 'purple',
    scope: 'global',
    roles: [...ROLES.ADMIN],
    canEditBy: [...ROLES.SUPER_ADMIN],
    canEditScope: 'global',
    isProtected: false,
  },
  {
    id: 'foundation',
    label: 'Yayasan',
    description: 'Monitoring multi-unit, laporan lintas unit (baca saja)',
    color: 'blue',
    scope: 'global',
    roles: [...ROLES.YAYASAN],
    canEditBy: [...ROLES.SUPER_ADMIN, ...ROLES.ADMIN],
    canEditScope: 'global',
    isProtected: false,
  },
  {
    id: 'unit_leader',
    label: 'Pimpinan Unit',
    description: 'Kepala Sekolah & Divisi Pendidikan — monitoring & input per unit sendiri',
    color: 'emerald',
    scope: 'unit',
    roles: [...ROLES.KEPALA_SEKOLAH, ...ROLES.DIVISI],
    canEditBy: [...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.YAYASAN],
    canEditScope: 'global',
    isProtected: false,
  },
  {
    id: 'unit_coordinator',
    label: 'Koordinator Unit',
    description: 'Waka Kurikulum & Waka Kesiswaan — koordinator bidang di bawah Kepala Sekolah',
    color: 'sky',
    scope: 'unit',
    roles: [...ROLES.WAKA],
    canEditBy: [...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.YAYASAN, ...ROLES.KEPALA_SEKOLAH],
    canEditScope: 'own_unit',
    isProtected: false,
  },
  {
    id: 'unit_staff',
    label: 'Staf Operasional',
    description: 'Tata Usaha & Operator — administrasi harian, absensi digital',
    color: 'amber',
    scope: 'unit',
    roles: [...ROLES.TATA_USAHA],
    canEditBy: [...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.YAYASAN, ...ROLES.KEPALA_SEKOLAH, ...ROLES.DIVISI],
    canEditScope: 'own_unit',
    isProtected: false,
  },
  {
    id: 'educator',
    label: 'Tenaga Pendidik',
    description: 'Guru, Wali Kelas, Guru Tahfizh, Musyrif — mengajar, hafalan, mutabaah',
    color: 'teal',
    scope: 'unit',
    roles: [...ROLES.GURU],
    canEditBy: [...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.YAYASAN, ...ROLES.KEPALA_SEKOLAH, ...ROLES.DIVISI],
    canEditScope: 'own_unit',
    isProtected: false,
  },
  {
    id: 'external',
    label: 'Pengguna Eksternal',
    description: 'Orang Tua, Siswa, Alumni — portal mandiri, tidak terkait unit',
    color: 'gray',
    scope: 'external',
    roles: [...ROLES.ORANG_TUA, ...ROLES.SISWA, ...ROLES.ALUMNI],
    canEditBy: [...ROLES.SUPER_ADMIN, ...ROLES.ADMIN],
    canEditScope: 'global',
    isProtected: false,
  },
]

/**
 * Ambil tier untuk nama role tertentu.
 * @param {string} roleName
 * @returns {object|null}
 */
export const getTierForRole = (roleName) => {
  if (!roleName) return null
  return ROLE_TIERS.find((tier) => hasAnyRole([roleName], tier.roles)) || null
}

/**
 * Cek apakah pengguna (userRoles) boleh mengubah konfigurasi role tertentu.
 *
 * Aturan:
 *   - Super Admin selalu boleh
 *   - Role lain hanya boleh jika terdaftar di tier.canEditBy
 *   - Scope 'own_unit': hanya berlaku pada pegawai di unit sendiri (divalidasi backend)
 *
 * @param {string[]} userRoles - role pengguna yang sedang login
 * @param {string}   targetRoleName - nama role yang ingin diubah
 * @returns {{ allowed: boolean, scope: 'global'|'own_unit'|null }}
 */
export const canEditRole = (userRoles = [], targetRoleName = '') => {
  if (hasAnyRole(userRoles, ROLES.SUPER_ADMIN)) {
    return { allowed: true, scope: 'global' }
  }
  const tier = getTierForRole(targetRoleName)
  if (!tier || !hasAnyRole(userRoles, tier.canEditBy)) {
    return { allowed: false, scope: null }
  }
  const isGlobalEditor = hasAnyRole(userRoles, [...ROLES.SUPER_ADMIN, ...ROLES.ADMIN, ...ROLES.YAYASAN])
  return { allowed: true, scope: isGlobalEditor ? 'global' : 'own_unit' }
}

/**
 * Ambil semua tier yang bisa diedit oleh pengguna tertentu.
 * Berguna untuk memfilter tampilan di MasterHakAksesPage.
 *
 * @param {string[]} userRoles
 * @returns {Array<{ tier: object, scope: 'global'|'own_unit' }>}
 */
export const getEditableTiers = (userRoles = []) => {
  if (hasAnyRole(userRoles, ROLES.SUPER_ADMIN)) {
    return ROLE_TIERS.map((tier) => ({ tier, scope: 'global' }))
  }
  const isGlobalEditor = hasAnyRole(userRoles, [...ROLES.ADMIN, ...ROLES.YAYASAN])
  return ROLE_TIERS
    .filter((tier) => hasAnyRole(userRoles, tier.canEditBy))
    .map((tier) => ({ tier, scope: isGlobalEditor ? 'global' : 'own_unit' }))
}
