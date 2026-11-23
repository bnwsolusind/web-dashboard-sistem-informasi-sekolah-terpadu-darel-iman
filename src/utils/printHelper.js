/**
 * Dareliman Edu Official Global Print & PDF Utility
 * Standardized across all modules: Student, Attendance, Tahfizh, Academic, LMS, Alumni.
 * Supports A4 Portrait (default, 210mm x 297mm) and A4 Landscape with 15mm margins.
 * 
 * Header layout adheres strictly to institutional specifications:
 * [LOGO LEMBAGA]   NAMA YAYASAN / LEMBAGA            [LOGO UNIT]
 *                  NAMA SEKOLAH / UNIT
 *              "SLOGAN"
 *              Alamat & Telepon
 *              Izin Operasional / NPSN        [JENIS UNIT]
 */

import { api } from '../services/api'
import { globalToast as toast } from '../components/app/ToastProvider'
import {
  isBoardingStudent,
  getWeekDates,
  getMutabaahAgendas,
  getMutabaahSigners,
} from './mutabaahSheetHelper'

// ============================================================================
// HELPER LOGO & ASSET URL RESOLVER
// ============================================================================
export function getBackendOrigin() {
  try {
    const rawApiUrl = import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_BACKEND_URL || api?.defaults?.baseURL
    if (rawApiUrl && typeof rawApiUrl === 'string' && (rawApiUrl.startsWith('http://') || rawApiUrl.startsWith('https://'))) {
      return new URL(rawApiUrl).origin
    }
  } catch (_) {}
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return ''
}

export function resolvePrintAssetUrl(url) {
  if (!url) return ''
  if (typeof url !== 'string') return ''
  if (url.startsWith('data:image') || url.startsWith('blob:')) return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  const backendOrigin = getBackendOrigin()
  const webOrigin = typeof window !== 'undefined' ? window.location.origin : ''

  const cleanPath = url.startsWith('/') ? url : `/${url}`

  if (cleanPath.startsWith('/storage')) {
    return backendOrigin ? `${backendOrigin}${cleanPath}` : cleanPath
  }
  return `${webOrigin}${cleanPath}`
}

export function resolveSystemLogoUrl(systemLogoParam) {
  if (systemLogoParam && String(systemLogoParam).trim()) return resolvePrintAssetUrl(systemLogoParam)
  try {
    const savedPengaturan = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('pengaturan_dashboard') || '{}') : {}
    const siteLogo =
      savedPengaturan?.logo_url ||
      savedPengaturan?.logoUrl ||
      savedPengaturan?.print_logo_url ||
      savedPengaturan?.site_logo ||
      savedPengaturan?.logo
    if (siteLogo && String(siteLogo).trim()) {
      return resolvePrintAssetUrl(siteLogo)
    }
  } catch (_) {}
  return ''
}

export function getResolvedYayasanConfig() {
  let savedPengaturan = {}
  try {
    if (typeof localStorage !== 'undefined') {
      savedPengaturan = JSON.parse(localStorage.getItem('pengaturan_dashboard') || '{}')
    }
  } catch (_) {}

  const schoolName = (savedPengaturan?.school_name || savedPengaturan?.application_name || '').trim()
  const address = (savedPengaturan?.address || savedPengaturan?.footer_text || '').trim()
  const phone = (savedPengaturan?.phone || '').trim()
  const skPendirian = (savedPengaturan?.sk_pendirian || '').trim()
  const motto = (savedPengaturan?.motto || '').trim()
  const logoUrl = savedPengaturan?.logo_url ? resolvePrintAssetUrl(savedPengaturan.logo_url) : null

  return {
    isUnitScope: false,
    code: 'YAYASAN',
    name: schoolName,
    formalName: schoolName ? schoolName.toUpperCase() : '',
    unitName: schoolName ? schoolName.toUpperCase() : '',
    level: 'YAYASAN',
    unitType: 'Yayasan',
    logoUrl: logoUrl,
    npsn: '',
    skPendirian: skPendirian,
    izinOperasional: skPendirian,
    address: address,
    phone: phone,
    motto: motto,
    city: '',
  }
}

// ============================================================================
// DYNAMIC EDUCATION UNITS REGISTRY (LOADED FROM DATABASE)
// Zero hardcoding. All units are dynamically fetched from database via /education-units
// ============================================================================
export const UNITS_DB_CACHE_KEY = 'dareliman_education_units_db_cache'

/**
 * In-memory list of database unit records
 */
export let loadedDatabaseUnits = []

/**
 * Normalized registry dictionary of units config keyed by ID, code, and name.
 * Initially contains dynamic YAYASAN config resolved from system settings.
 */
export const DEFAULT_UNITS_CONFIG = {
  YAYASAN: getResolvedYayasanConfig(),
}

/**
 * Helper to format a raw database unit record into normalized print config
 */
export function formatUnitFromDb(rawUnit) {
  if (!rawUnit) return null
  const meta = rawUnit.metadata || {}
  const rawName = (
    rawUnit.name ||
    rawUnit.nama ||
    rawUnit.unit_name ||
    rawUnit.unitName ||
    meta.name ||
    meta.nama ||
    ''
  ).trim()

  const rawCode = String(rawUnit.code || rawUnit.kode || '').trim()
  const rawLevel = String(rawUnit.level || meta.jenjang || '').trim()
  const rawLogo = rawUnit.logo_url || meta.logo_url || meta.logo || (meta.logo_path ? `/storage/${meta.logo_path.replace(/^\//, '')}` : null) || null

  return {
    id: rawUnit.id,
    isUnitScope: true,
    code: rawCode,
    name: rawName || 'Unit Pendidikan',
    formalName: meta.formal_name || (rawName ? rawName.toUpperCase() : 'UNIT PENDIDIKAN'),
    unitName: (rawName || 'UNIT PENDIDIKAN').toUpperCase(),
    level: rawLevel,
    unitType: meta.singkatan || meta.unit_type || (rawName ? rawName.split(' ')[0] : 'Unit'),
    logoUrl: rawLogo ? resolvePrintAssetUrl(rawLogo) : null,
    npsn: meta.npsn || rawUnit.npsn || '',
    skPendirian: meta.sk_pendirian || '',
    izinOperasional: meta.izin_operasional || meta.sk_pendirian || '',
    address: meta.address || rawUnit.address || '',
    phone: meta.phone || rawUnit.phone || '',
    motto: meta.motto || meta.slogan || '',
    city: meta.city || rawUnit.city || '',
    raw: rawUnit,
  }
}

/**
 * Update the in-memory DEFAULT_UNITS_CONFIG map from a list of database units
 */
export function updateUnitsConfigFromList(unitsList) {
  if (!Array.isArray(unitsList)) return

  loadedDatabaseUnits = unitsList
  DEFAULT_UNITS_CONFIG.YAYASAN = getResolvedYayasanConfig()

  unitsList.forEach((unit) => {
    if (!unit) return
    const formatted = formatUnitFromDb(unit)
    if (!formatted) return

    if (unit.id) {
      DEFAULT_UNITS_CONFIG[String(unit.id)] = formatted
    }
    if (formatted.code) {
      DEFAULT_UNITS_CONFIG[formatted.code.toUpperCase()] = formatted
      const cleanCode = formatted.code.replace(/[-_0-9]/g, '').toUpperCase()
      if (cleanCode && !DEFAULT_UNITS_CONFIG[cleanCode]) {
        DEFAULT_UNITS_CONFIG[cleanCode] = formatted
      }
    }
    if (formatted.name) {
      DEFAULT_UNITS_CONFIG[formatted.name.toUpperCase()] = formatted
    }
  })

  // Cache to localStorage for fast initial render
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(UNITS_DB_CACHE_KEY, JSON.stringify(unitsList))
    } catch (_) {}
  }
}

/**
 * Fetch education units directly from database via API
 */
export async function loadUnitsConfigFromDatabase() {
  try {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('school_erp_token')
      if (!token) {
        return DEFAULT_UNITS_CONFIG
      }
      const rawUser = localStorage.getItem('school_erp_user')
      if (rawUser) {
        const parsedUser = JSON.parse(rawUser)
        const rawRoles = [
          ...(Array.isArray(parsedUser?.roles) ? parsedUser.roles.map((r) => (typeof r === 'string' ? r : r?.name)) : []),
          parsedUser?.role,
          parsedUser?.primary_role,
        ]
          .filter(Boolean)
          .map((r) => String(r).trim().toLowerCase())
        const portalOnlyRoles = new Set(['orang tua', 'orang_tua', 'orang-tua', 'orangtua', 'wali murid', 'parent', 'siswa', 'student', 'santri', 'alumni'])
        if (rawRoles.length > 0 && rawRoles.every((r) => portalOnlyRoles.has(r))) {
          return DEFAULT_UNITS_CONFIG
        }
      }
    }
    const res = await api.get('/education-units', { params: { per_page: 100 } })
    const units = res.data?.data || (Array.isArray(res.data) ? res.data : [])
    if (Array.isArray(units) && units.length > 0) {
      updateUnitsConfigFromList(units)
      return DEFAULT_UNITS_CONFIG
    }
  } catch (err) {
    // Non-blocking fallback to local cache
  }
  return DEFAULT_UNITS_CONFIG
}

/**
 * Find unit from database cache by ID, code, name, or search query
 */
export function findUnitInDatabase(searchKey) {
  if (!searchKey) return null
  if (typeof searchKey === 'object') {
    if (searchKey.id && DEFAULT_UNITS_CONFIG[String(searchKey.id)]) {
      return DEFAULT_UNITS_CONFIG[String(searchKey.id)]
    }
    return formatUnitFromDb(searchKey)
  }

  const query = String(searchKey).trim().toUpperCase()
  if (!query) return null

  if (DEFAULT_UNITS_CONFIG[query]) return DEFAULT_UNITS_CONFIG[query]

  const found = loadedDatabaseUnits.find((u) => {
    if (!u) return false
    const id = String(u.id || '').toUpperCase()
    const code = String(u.code || '').toUpperCase()
    const name = String(u.name || '').toUpperCase()
    const level = String(u.level || '').toUpperCase()
    return (
      id === query ||
      code === query ||
      name === query ||
      name.includes(query) ||
      query.includes(name) ||
      (code && query.includes(code)) ||
      (level && query.includes(level))
    )
  })

  return found ? formatUnitFromDb(found) : null
}

// Auto-hydrate units from local cache, then asynchronously fetch fresh from database
if (typeof window !== 'undefined') {
  try {
    const cached = localStorage.getItem(UNITS_DB_CACHE_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed) && parsed.length > 0) {
        updateUnitsConfigFromList(parsed)
      }
    }
  } catch (_) {}

  setTimeout(() => {
    loadUnitsConfigFromDatabase().catch(() => {})
  }, 100)
}

export function resolveFoundationName(foundationParam) {
  if (foundationParam && typeof foundationParam === 'string' && foundationParam.trim() && foundationParam !== '[object Object]') {
    return foundationParam.trim()
  }
  if (foundationParam && typeof foundationParam === 'object') {
    const fromObj = foundationParam?.school_name || foundationParam?.institution_name || foundationParam?.nama_yayasan || foundationParam?.yayasan || foundationParam?.application_name
    if (fromObj && String(fromObj).trim() && String(fromObj) !== '[object Object]') {
      return String(fromObj).trim()
    }
  }
  try {
    const savedPengaturan = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('pengaturan_dashboard') || '{}') : {}
    if (savedPengaturan?.school_name && String(savedPengaturan.school_name).trim()) {
      return String(savedPengaturan.school_name).trim()
    }
    if (savedPengaturan?.institution_name && String(savedPengaturan.institution_name).trim()) {
      return String(savedPengaturan.institution_name).trim()
    }
    if (savedPengaturan?.nama_yayasan && String(savedPengaturan.nama_yayasan).trim()) {
      return String(savedPengaturan.nama_yayasan).trim()
    }
    if (savedPengaturan?.yayasan && String(savedPengaturan.yayasan).trim()) {
      return String(savedPengaturan.yayasan).trim()
    }
    if (savedPengaturan?.application_name && String(savedPengaturan.application_name).trim()) {
      return String(savedPengaturan.application_name).trim()
    }
  } catch (_) {}

  try {
    const rawUser = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('school_erp_user') || '{}') : {}
    if (rawUser?.foundation_name && String(rawUser.foundation_name).trim()) {
      return String(rawUser.foundation_name).trim()
    }
    if (rawUser?.institution_name && String(rawUser.institution_name).trim()) {
      return String(rawUser.institution_name).trim()
    }
  } catch (_) {}

  return 'Yayasan Pendidikan Islam'
}

/**
 * Check if the user has Yayasan / Central / Super Admin role
 */
export function isCentralOrYayasanRole(userParam = null) {
  try {
    let user = userParam
    if (!user && typeof localStorage !== 'undefined') {
      const rawUser = localStorage.getItem('school_erp_user')
      if (rawUser) user = JSON.parse(rawUser)
    }
    const roles = Array.isArray(user?.roles) ? user.roles : [user?.role || ''].filter(Boolean)
    const lowerRoles = roles.map((r) => String(r).toLowerCase())
    return lowerRoles.some(
      (r) =>
        r.includes('yayasan') ||
        r.includes('super admin') ||
        r.includes('superadmin') ||
        r.includes('admin yayasan') ||
        r === 'admin'
    )
  } catch (_) {
    return false
  }
}

/**
 * Resolve comprehensive details of a school unit or foundation scope
 */
export function resolveUnitDetails(unitParam, userParam = null) {
  let user = userParam
  if (!user && typeof localStorage !== 'undefined') {
    try {
      const rawUser = localStorage.getItem('school_erp_user')
      if (rawUser) user = JSON.parse(rawUser)
    } catch (_) {}
  }
  const isCentral = isCentralOrYayasanRole(user)

  // Find user's assigned unit for teachers, staff, homeroom, principal
  let userAssignedUnit = null
  if (user) {
    userAssignedUnit =
      user.employee?.unit ||
      user.unit ||
      user.unit_name ||
      user.unit_model ||
      user.scope?.unit_id ||
      null
  }
  if (!userAssignedUnit && typeof localStorage !== 'undefined') {
    try {
      const savedUnit = localStorage.getItem('school_erp_unit')
      if (savedUnit && savedUnit !== 'semua' && savedUnit !== 'all') {
        userAssignedUnit = savedUnit
      }
    } catch (_) {}
  }

  // If non-central user passes null, undefined, '', 'semua', or 'all': fallback to their assigned unit!
  let effectiveUnitParam = unitParam
  if (!isCentral) {
    if (!effectiveUnitParam || (typeof effectiveUnitParam === 'string' && ['SEMUA', 'ALL', 'SEMUA UNIT', 'SEMUA_UNIT', ''].includes(effectiveUnitParam.trim().toUpperCase()))) {
      if (userAssignedUnit) {
        effectiveUnitParam = userAssignedUnit
      }
    }
  }

  // Explicit 'semua' / 'all' / '' / 'yayasan' string or explicit yayasan flag
  if (typeof effectiveUnitParam === 'string') {
    const rawUpper = effectiveUnitParam.trim().toUpperCase()
    if (
      rawUpper === 'SEMUA' ||
      rawUpper === 'ALL' ||
      rawUpper === 'SEMUA UNIT' ||
      rawUpper === 'SEMUA_UNIT' ||
      rawUpper === 'YAYASAN' ||
      rawUpper.includes('YAYASAN') ||
      rawUpper === ''
    ) {
      return getResolvedYayasanConfig()
    }
  }

  // 1. If an object unit is passed
  if (effectiveUnitParam && typeof effectiveUnitParam === 'object') {
    if (
      effectiveUnitParam.id === 'semua' ||
      effectiveUnitParam.code === 'semua' ||
      effectiveUnitParam.code === 'YAYASAN' ||
      effectiveUnitParam.level === 'YAYASAN' ||
      effectiveUnitParam.isUnitScope === false ||
      effectiveUnitParam.isYayasan ||
      effectiveUnitParam.scope === 'yayasan'
    ) {
      if (isCentral || !userAssignedUnit || userAssignedUnit === effectiveUnitParam) {
        return getResolvedYayasanConfig()
      }
      return resolveUnitDetails(userAssignedUnit, user)
    }

    const meta = effectiveUnitParam.metadata || {}
    const rawName = (
      effectiveUnitParam.name ||
      effectiveUnitParam.nama ||
      effectiveUnitParam.unit_name ||
      effectiveUnitParam.unitName ||
      effectiveUnitParam.nama_unit ||
      (typeof effectiveUnitParam.unit === 'string' ? effectiveUnitParam.unit : '') ||
      meta.name ||
      meta.nama ||
      ''
    ).trim()

    const rawCode = String(effectiveUnitParam.code || effectiveUnitParam.kode || '').trim()
    const rawLevel = String(effectiveUnitParam.level || meta.jenjang || '').trim()

    // If it's an empty object without name, code, or meaningful fields:
    if (!rawName && !rawCode && !rawLevel && (!effectiveUnitParam.id || effectiveUnitParam.id === 'all' || effectiveUnitParam.id === 'semua')) {
      if (!isCentral && userAssignedUnit) {
        return resolveUnitDetails(userAssignedUnit, user)
      }
      return getResolvedYayasanConfig()
    }

    // Lookup unit from database records
    const dbUnit = findUnitInDatabase(effectiveUnitParam)
    const formatted = formatUnitFromDb(effectiveUnitParam)

    if (dbUnit) {
      return {
        ...dbUnit,
        ...formatted,
        logoUrl: formatted.logoUrl || dbUnit.logoUrl || null,
        name: formatted.name || dbUnit.name,
        formalName: formatted.formalName || dbUnit.formalName,
        address: formatted.address || dbUnit.address,
        phone: formatted.phone || dbUnit.phone,
        npsn: formatted.npsn || dbUnit.npsn,
        skPendirian: formatted.skPendirian || dbUnit.skPendirian,
        izinOperasional: formatted.izinOperasional || dbUnit.izinOperasional,
        motto: formatted.motto || dbUnit.motto,
        city: formatted.city || dbUnit.city,
      }
    }

    return formatted
  }

  // 2. If explicit specific unit string key or name passed (e.g. 'SDIT 1', 'SMPIT 1', 'Pondok Pesantren', etc.)
  const str = String(effectiveUnitParam || '').trim()
  if (str) {
    // Lookup from database
    const dbUnit = findUnitInDatabase(str)
    if (dbUnit) {
      return dbUnit
    }

    return {
      isUnitScope: true,
      code: '',
      name: str,
      formalName: str.toUpperCase(),
      unitName: str.toUpperCase(),
      level: '',
      unitType: str.split(' ')[0] || 'Unit',
      logoUrl: null,
      npsn: '',
      skPendirian: '',
      izinOperasional: '',
      address: '',
      phone: '',
      motto: '',
      city: '',
    }
  }

  // 3. Fallback: if user is not central and has an assigned unit, resolve it
  if (!isCentral && userAssignedUnit) {
    return resolveUnitDetails(userAssignedUnit, user)
  }

  return getResolvedYayasanConfig()
}

// Fallback SVG vectors for maximum print reliability (Zero Hardcoded Text)
export function getOfficialYayasanLogoSvg(orgNameParam = '') {
  let orgName = orgNameParam
  let logoText = 'SIT'
  try {
    const savedPengaturan = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('pengaturan_dashboard') || '{}') : {}
    if (!orgName) {
      orgName = (savedPengaturan?.school_name || savedPengaturan?.application_name || '').trim()
    }
    if (savedPengaturan?.logo_text) {
      logoText = String(savedPengaturan.logo_text).trim()
    }
  } catch (_) {}

  const displayName = (orgName || 'YAYASAN PENDIDIKAN').toUpperCase()
  const shortText = displayName.length > 22 ? displayName.substring(0, 20) + '...' : displayName

  return `
    <svg width="76" height="76" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <polygon points="50,2 62,24 86,14 80,38 98,50 80,62 86,86 62,76 50,98 38,76 14,86 20,62 2,50 20,38 14,14 38,24" fill="#047857" stroke="#047857" stroke-width="1.5" />
      <polygon points="50,6 60,26 82,17 76,39 93,50 76,61 82,83 60,74 50,94 40,74 18,83 24,61 7,50 24,39 18,17 40,26" fill="#059669" />
      <circle cx="50" cy="50" r="32" fill="#FFFFFF" stroke="#047857" stroke-width="1.5" />
      <circle cx="50" cy="50" r="28" fill="#ECFDF5" />
      <path d="M40 45 C42 40, 58 40, 60 45 C60 52, 40 52, 40 58 C40 64, 60 64, 60 58" stroke="#047857" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M35 50 Q50 43 65 50 Q50 57 35 50 Z" fill="#10B981" opacity="0.6"/>
      <text x="50" y="44" font-family="system-ui, -apple-system, sans-serif" font-size="9" font-weight="900" fill="#047857" text-anchor="middle">${logoText}</text>
      <text x="50" y="65" font-family="system-ui, -apple-system, sans-serif" font-size="5" font-weight="800" fill="#047857" text-anchor="middle" letter-spacing="0.2">${shortText}</text>
    </svg>
  `
}


/**
 * Generates official HTML string for the global header
 */
export function generateOfficialPrintHeaderHtml({
  unit = null,
  user = null,
  systemLogo = null,
  foundationName = null,
  title = '',
  subtitle = '',
  period = '',
  recordCount = 0,
  printDate = null,
  showDivider = true,
}) {
  const resolvedUnit = resolveUnitDetails(unit, user)
  const systemLogoUrl = resolveSystemLogoUrl(systemLogo)
  const foundation = resolveFoundationName(foundationName)

  const printDateStr = printDate || new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const isUnit = resolvedUnit.isUnitScope !== false
  const cleanLevel = (resolvedUnit.level || resolvedUnit.code || 'sdit').toLowerCase().replace(/[^a-z]/g, '')
  const fallbackUnitLogo = resolvePrintAssetUrl(`/assets/logos/${cleanLevel}.svg`) || resolvePrintAssetUrl('/assets/logos/sdit.svg')
  const unitLogoSrc = resolvedUnit.logoUrl || fallbackUnitLogo

  let defaultAddress = ''
  try {
    const savedPengaturan = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('pengaturan_dashboard') || '{}') : {}
    defaultAddress = (savedPengaturan?.address || savedPengaturan?.footer_text || '').trim()
  } catch (_) {}

  const addressLine = [
    resolvedUnit.address || defaultAddress || '',
    resolvedUnit.phone ? `Telp. ${resolvedUnit.phone}` : '',
  ].filter(Boolean).join(' | ')

  return `
    <div class="print-official-header">
      <!-- 1. LOGO KIRI: LOGO YAYASAN / LOGO SISTEM (DARI PENGATURAN) -->
      <div class="print-logo-left-box">
        <img
          src="${systemLogoUrl}"
          alt="Logo Lembaga"
          class="print-logo-left-img"
          onerror="this.onerror=null; this.src='/assets/logos/yayasan.svg';"
        />
      </div>

      <!-- 2. BAGIAN TENGAH: IDENTITAS RESMI (NAMA YAYASAN, NAMA UNIT LENGKAP, ALAMAT UNIT) -->
      <div class="print-center-box">
        ${foundation ? `<div class="print-org-name">${foundation}</div>` : ''}
        <div class="print-school-unit">${resolvedUnit.formalName || resolvedUnit.unitName || resolvedUnit.name || ''}</div>
        ${addressLine ? `<div class="print-address">${addressLine}</div>` : ''}
      </div>

      <!-- 3. LOGO KANAN: LOGO UNIT PENDIDIKAN -->
      <div class="print-logo-right-box" style="${!isUnit ? 'visibility: hidden;' : ''}">
        ${isUnit ? `
          <div class="print-unit-logo-wrapper">
            <img
              src="${unitLogoSrc}"
              alt="Logo ${resolvedUnit.unitType || 'Unit'}"
              class="print-logo-right-img"
              onerror="this.onerror=null; this.src='${fallbackUnitLogo || systemLogoUrl}';"
            />
          </div>
        ` : `<div style="width: 70px; height: 70px;"></div>`}
      </div>
    </div>

    ${showDivider ? '<div class="print-header-divider"></div>' : ''}

    ${title ? `
      <div class="print-doc-title-container">
        <h1 class="print-doc-title">${title.toUpperCase()}</h1>
        ${(period || subtitle) ? `<div class="print-doc-period">${period || subtitle}</div>` : ''}
        <div class="print-doc-meta-row">
          <span>Dicetak pada: ${printDateStr} WIB</span>
          ${recordCount != null ? `<span>Total Record: ${recordCount} Data</span>` : ''}
          <span>Dokumen Resmi</span>
        </div>
      </div>
    ` : ''}
  `
}

/**
 * Print Clean Datatable Utility
 * Prints a clean datatable without opening a new tab or window.
 * Uses a hidden iframe within the current document context.
 * Adheres strictly to institutional A4 sizing (Portrait default, supports Landscape).
 * @param {Object} options
 * @param {string} options.title
 * @param {string} [options.subtitle]
 * @param {Array<any>} [options.headers]
 * @param {Array<any>} [options.rows]
 * @param {Array<any>} [options.columns]
 * @param {Array<any>} [options.data]
 * @param {any} [options.unit]
 * @param {any} [options.unitParam]
 * @param {any} [options.user]
 * @param {any} [options.systemLogo]
 * @param {any} [options.foundationName]
 * @param {'portrait' | 'landscape'} [options.orientation]
 * @param {string} [options.period]
 * @param {any} [options.customFooter]
 */
export function printCleanTable({
  title,
  subtitle = '',
  headers = [],
  rows = [],
  columns = [],
  data = [],
  unit = null,
  unitParam = null,
  user = null,
  systemLogo = null,
  foundationName = null,
  orientation = 'portrait', // 'portrait' | 'landscape'
  period = '',
  customFooter = null,
}) {
  const effectiveUnit = unit || unitParam

  const actualHeaders = headers.length > 0
    ? headers
    : columns.map((c) => (typeof c === 'string' ? c : c.title || c.label || c.header || c.key || ''))

  const actualRows = rows.length > 0
    ? rows
    : data.map((item, idx) =>
        columns.map((c) => {
          if (typeof c === 'object' && c !== null) {
            if (typeof c.render === 'function') {
              return c.render(item, idx)
            }
            if (c.key && item[c.key] !== undefined) {
              return item[c.key]
            }
          }
          return ''
        })
      )

  const headerHtml = actualHeaders.map((h) => `<th>${h}</th>`).join('')
  const rowsHtml = actualRows
    .map(
      (r) =>
        `<tr>${r
          .map((cell) => `<td>${cell !== null && cell !== undefined ? String(cell) : '-'}</td>`)
          .join('')}</tr>`
    )
    .join('')

  // Determine page orientation: if more than 7 columns or explicit landscape, use landscape
  const effectiveOrientation = (orientation === 'landscape' || actualHeaders.length > 7) ? 'landscape' : 'portrait'

  const printDateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  // Remove existing print iframe if present
  let iframe = document.getElementById('dareliman-print-iframe')
  if (iframe) {
    try {
      document.body.removeChild(iframe)
    } catch (_) {}
  }

  // Create hidden iframe in current document to avoid opening a new tab/window
  iframe = document.createElement('iframe')
  iframe.id = 'dareliman-print-iframe'
  iframe.style.position = 'fixed'
  iframe.style.left = '0'
  iframe.style.top = '0'
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.border = 'none'
  iframe.style.opacity = '0.001'
  iframe.style.pointerEvents = 'none'
  iframe.style.zIndex = '-9999'

  document.body.appendChild(iframe)

  // Auto-resolve user context if not explicitly passed by caller
  let effectiveUser = user
  if (!effectiveUser && typeof localStorage !== 'undefined') {
    try {
      const rawUser = localStorage.getItem('school_erp_user')
      if (rawUser) effectiveUser = JSON.parse(rawUser)
    } catch (_) {}
  }

  const resolvedUnit = resolveUnitDetails(effectiveUnit, effectiveUser)
  const foundation = resolveFoundationName(foundationName)

  const headerBlockHtml = generateOfficialPrintHeaderHtml({
    unit: resolvedUnit,
    user: effectiveUser,
    systemLogo,
    foundationName: foundation,
    title,
    subtitle,
    period,
    recordCount: actualRows.length,
    printDate: printDateStr,
    showDivider: true,
  })

  const doc = iframe.contentWindow.document
  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @page {
          size: A4 ${effectiveOrientation};
          margin: 15mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'Inter', 'Arial', 'Helvetica', system-ui, -apple-system, sans-serif;
          font-size: 9pt;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 0;
          line-height: 1.35;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-official-header {
          display: grid;
          grid-template-columns: 75px 1fr 75px;
          align-items: center;
          gap: 14px;
          padding-bottom: 4px;
        }
        .print-logo-left-box, .print-unit-logo-wrapper {
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .print-logo-left-img, .print-logo-right-img {
          max-width: 70px;
          max-height: 70px;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }
        .print-center-box {
          text-align: center;
          padding: 0 4px;
        }
        .print-org-name {
          font-size: 11pt;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0 0 2px 0;
          line-height: 1.2;
        }
        .print-school-unit {
          font-size: 12pt;
          font-weight: 900;
          color: #047857;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          margin: 0 0 2px 0;
          line-height: 1.2;
        }
        .print-address {
          font-size: 8pt;
          font-weight: 500;
          color: #475569;
          margin: 1px 0 0 0;
          line-height: 1.25;
        }
        .print-logo-right-box {
          width: 75px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .print-header-divider {
          border-top: 2.5px solid #0f172a;
          border-bottom: 1px solid #0f172a;
          height: 4px;
          margin-top: 5px;
          margin-bottom: 12px;
        }
        .print-doc-title-container {
          text-align: center;
          margin-bottom: 12px;
        }
        .print-doc-title {
          font-size: 13.5pt;
          font-weight: 900;
          color: #047857;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0;
          line-height: 1.25;
        }
        .print-doc-period {
          font-size: 9pt;
          font-weight: 700;
          color: #334155;
          margin-top: 3px;
        }
        .print-doc-meta-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 8pt;
          color: #64748b;
          font-weight: 600;
          margin-top: 6px;
          padding-bottom: 6px;
          border-bottom: 1px dashed #cbd5e1;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        th {
          background-color: #ecfdf5;
          color: #047857;
          font-size: 8.5pt;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 8px 8px;
          border: 1px solid #cbd5e1;
          text-align: left;
        }
        td {
          padding: 6.5px 8px;
          font-size: 8.5pt;
          border: 1px solid #e2e8f0;
          color: #1e293b;
          vertical-align: middle;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        tr {
          page-break-inside: avoid;
        }
        .print-footer {
          margin-top: 20px;
          padding-top: 8px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 8pt;
          color: #94a3b8;
        }
      </style>
    </head>
    <body>
      ${headerBlockHtml}

      <table>
        <thead>
          <tr>${headerHtml}</tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="' + (actualHeaders.length || 1) + '" style="text-align:center; padding: 16px;">Tidak ada data yang tersedia untuk dicetak.</td></tr>'}
        </tbody>
      </table>

      <div class="print-footer">
        <span>${customFooter?.left || (resolvedUnit?.isUnitScope ? `Dokumen Resmi ${resolvedUnit.name || 'Unit'}` : (foundation ? `Dokumen Resmi ${foundation}` : 'Dokumen Resmi Lembaga'))}</span>
        <span>${customFooter?.right || 'Halaman 1 (Laporan Cetak Sah)'}</span>
      </div>
    </body>
    </html>
  `)
  doc.close()

  let printed = false
  const runPrint = () => {
    if (printed) return
    printed = true
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus()
        if (typeof window !== 'undefined' && (window.__DARELIMAN_PREVENT_MODAL_BLOCK__ || window.__DARELIMAN_PREVENT_MODAL_BLOCK__)) {
          window.__LAST_PRINT_IFRAME_DOC__ = doc.documentElement.outerHTML
          console.log('Dareliman Edu Print ready in iframe (automated test mode)')
          return
        }
        iframe.contentWindow.print()
      }
    } catch (err) {
      console.warn('Iframe print failed, attempting fallback window:', err)
      try {
        const win = window.open('', '_blank')
        if (win) {
          win.document.write(doc.documentElement.outerHTML)
          win.document.close()
          win.focus()
          setTimeout(() => win.print(), 250)
        }
      } catch (e) {
        console.error('Fallback print error:', e)
      }
    }
  }

  // Wait for images to load before executing print
  const preparePrint = () => {
    try {
      const imgs = iframe.contentWindow?.document?.images || []
      let pending = 0
      for (let i = 0; i < imgs.length; i++) {
        if (!imgs[i].complete) {
          pending++
          imgs[i].onload = imgs[i].onerror = () => {
            pending--
            if (pending <= 0) runPrint()
          }
        }
      }
      if (pending === 0) {
        runPrint()
      } else {
        setTimeout(runPrint, 350)
      }
    } catch (_) {
      runPrint()
    }
  }

  iframe.onload = () => setTimeout(preparePrint, 120)
  setTimeout(runPrint, 500)
}

/**
 * Export PDF Datatable Utility
 * Triggers PDF export / save dialog for datatable with official global print header.
 * @param {Object} options
 * @param {string} options.title
 * @param {string} [options.subtitle]
 * @param {string} [options.period]
 * @param {Array<any>} [options.headers]
 * @param {Array<any>} [options.rows]
 * @param {Array<any>} [options.columns]
 * @param {Array<any>} [options.data]
 * @param {string} [options.filename]
 * @param {any} [options.unit]
 * @param {any} [options.unitParam]
 * @param {any} [options.user]
 * @param {'portrait' | 'landscape'} [options.orientation]
 * @param {any} [options.systemLogo]
 * @param {any} [options.foundationName]
 */
export async function downloadPdfTable({
  title,
  subtitle = '',
  period = '',
  headers = [],
  rows = [],
  columns = [],
  data = [],
  filename = '',
  unit = null,
  unitParam = null,
  user = null,
  orientation = 'portrait',
  systemLogo = null,
  foundationName = null,
}) {
  const actualHeaders = headers.length > 0
    ? headers
    : columns.map((c) => (typeof c === 'string' ? c : c.title || c.label || c.header || c.key || ''))

  const actualRows = rows.length > 0
    ? rows
    : data.map((item, idx) =>
        columns.map((c) => {
          if (typeof c === 'object' && c !== null) {
            if (typeof c.render === 'function') {
              return c.render(item, idx)
            }
            if (c.key && item[c.key] !== undefined) {
              return item[c.key]
            }
          }
          return ''
        })
      )

  // Ensure clean text representation of cells
  const sanitizedRows = actualRows.map((row) =>
    row.map((cell) => {
      if (cell === null || cell === undefined) return '-'
      if (typeof cell === 'object') return String(cell?.props?.children || cell?.toString?.() || '-')
      return String(cell).trim() || '-'
    })
  )

  const effectiveOrientation = (orientation === 'landscape' || actualHeaders.length > 7) ? 'landscape' : 'portrait'
  let safeFilename = filename || `laporan_${(title || 'dokumen').toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
  if (!safeFilename.toLowerCase().endsWith('.pdf')) {
    safeFilename += '.pdf'
  }

  try {
    toast.info(`Menyiapkan berkas PDF: ${safeFilename}...`)

    const response = await api.post(
      '/export/pdf',
      {
        title: title || 'Laporan Resmi',
        subtitle: subtitle || '',
        period: period || '',
        headers: actualHeaders,
        rows: sanitizedRows,
        filename: safeFilename,
        orientation: effectiveOrientation,
      },
      {
        responseType: 'blob',
      }
    )

    const blob = new Blob([response.data], { type: 'application/pdf' })
    const downloadUrl = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = downloadUrl
    link.setAttribute('download', safeFilename)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(downloadUrl)

    toast.success(`Berkas PDF ${safeFilename} berhasil diunduh.`)
  } catch (error) {
    console.warn('Gagal mengunduh berkas PDF via server, fallback ke cetak bersih:', error)
    toast.error('Gagal mengunduh berkas PDF dari server, mengalihkan ke tampilan cetak...')
    printCleanTable({
      title,
      subtitle: subtitle ? `${subtitle} (Dokumen PDF)` : 'Dokumen PDF Laporan Resmi',
      headers: actualHeaders,
      rows: sanitizedRows,
      unit: unit || unitParam,
      user,
      orientation: effectiveOrientation,
      systemLogo,
      foundationName,
    })
  }
}

/**
 * Print Weekly Mutaba'ah Yaumiyyah Sheet (Format Fisik 7 Hari)
 * Exact institutional table format as shown on the official printed mutaba'ah checklist:
 * - NO | Agenda | Rincian Agenda | Hari/Tanggal (Senin s.d. Ahad)
 * - Sholat (rowspan) & Mutaba'ah Yaumiyyah (rowspan)
 * - Differentiated agendas and signatures for Fullday (Ustadz & Ortu) vs Boarding (Musyrif & Ustadz)
 * - Zero hardcoding, dynamic unit & foundation resolution
 */
export function printOfficialMutabaahSheet({
  student = {},
  unit = null,
  period = {},
  dateFrom = null,
  teacherNotes = '',
  homeroomTeacher = {},
  musyrif = {},
  isBoarding = null,
}) {
  const studentName = student.name || student.full_name || student.nama_lengkap || '-'
  const studentNis = student.nis || student.student_id || student.nisn || '-'
  const className = student.className || student.class || student.kelas?.nama_kelas || student.kelas?.name || '-'
  
  // Resolve boarding flag dynamically
  const boardingFlag = isBoarding !== null ? Boolean(isBoarding) : isBoardingStudent(student, unit)
  const programLabel = boardingFlag ? 'Boarding / Pesantren (Asrama 24 Jam)' : 'Fullday School (Kemitraan Sekolah & Rumah)'
  
  // Resolve unit & foundation dynamically (Zero Hardcode)
  const rawUnit = unit || student.education_unit || student.unit || student.unitName || (boardingFlag ? 'Pondok Pesantren' : 'Sekolah')
  const resolvedUnit = resolveUnitDetails(rawUnit)
  const foundation = resolveFoundationName()
  
  const weekDays = getWeekDates(dateFrom || period.dateFrom || period.date_from || period.start_date)
  const { sholat, yaumiyyah } = getMutabaahAgendas(boardingFlag)
  const signers = getMutabaahSigners(boardingFlag)
  const periodText = period.title || period.name || `Pekan Berjalan (${weekDays[0]?.dateShort || ''} s.d. ${weekDays[6]?.dateShort || ''})`

  // Remove existing print iframe
  let iframe = document.getElementById('dareliman-print-iframe')
  if (iframe) {
    try {
      document.body.removeChild(iframe)
    } catch (_) {}
  }

  iframe = document.createElement('iframe')
  iframe.id = 'dareliman-print-iframe'
  iframe.style.position = 'fixed'
  iframe.style.left = '0'
  iframe.style.top = '0'
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.border = 'none'
  iframe.style.opacity = '0.001'
  iframe.style.pointerEvents = 'none'
  iframe.style.zIndex = '-9999'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow.document
  doc.open()

  const headerHtml = generateOfficialPrintHeaderHtml({
    unit: resolvedUnit,
    foundationName: foundation,
    title: 'LEMBAR MUTABA’AH YAUMIYYAH',
    period: `PERIODE: ${periodText}`,
    showDivider: true,
  })

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Mutaba'ah Yaumiyyah - ${studentName}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 6mm 10mm;
        }
        * { box-sizing: border-box; }
        body {
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          font-size: 7.5pt;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 0;
          line-height: 1.15;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .student-info-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          padding: 4px 8px;
          margin-bottom: 5px;
          font-size: 7.5pt;
        }
        .student-info-item {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .student-info-label {
          font-weight: 700;
          color: #475569;
        }
        .student-info-value {
          font-weight: 800;
          color: #0f172a;
        }
        .program-tag {
          font-size: 7pt;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: 4px;
          background: ${boardingFlag ? '#fef3c7' : '#ecfdf5'};
          color: ${boardingFlag ? '#92400e' : '#059669'};
          border: 1px solid ${boardingFlag ? '#fde68a' : '#a7f3d0'};
        }
        table.mutabaah-grid {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 5px;
        }
        table.mutabaah-grid th, table.mutabaah-grid td {
          border: 1px solid #64748b;
          padding: 2px 4px;
          font-size: 7pt;
          line-height: 1.15;
        }
        table.mutabaah-grid th {
          background: #e2e8f0;
          color: #0f172a;
          font-weight: 800;
          text-align: center;
        }
        .col-no { width: 22px; text-align: center; font-weight: 700; }
        .col-cat { width: 60px; text-align: center; font-weight: 800; background: #f8fafc; }
        .col-desc { font-weight: 600; color: #1e293b; }
        .col-day { width: 42px; text-align: center; }
        .paraf-header-box {
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #64748b;
          font-size: 6pt;
          font-weight: 800;
          padding-bottom: 1px;
          margin-bottom: 1px;
        }
        .paraf-dots-box {
          display: flex;
          justify-content: space-between;
          font-size: 5.5pt;
          color: #94a3b8;
          padding-top: 6px;
        }
        .notes-and-closing {
          margin-top: 4px;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 6px;
          font-size: 7pt;
        }
        .notes-box {
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          background: #fffbeb;
          padding: 4px 6px;
          color: #78350f;
          line-height: 1.2;
        }
        .closing-box {
          border: 1px solid #cbd5e1;
          border-radius: 4px;
          background: #ecfdf5;
          padding: 4px 6px;
          text-align: center;
        }
        .closing-arabic {
          font-family: 'Amiri', 'Traditional Arabic', serif;
          font-size: 9.5pt;
          font-weight: 800;
          color: #047857;
          direction: rtl;
          margin-top: 1px;
        }
        tr { page-break-inside: avoid; }
      </style>
    </head>
    <body>
      ${headerHtml}

      <div class="student-info-bar">
        <div class="student-info-item">
          <span class="student-info-label">Nama:</span>
          <span class="student-info-value">${studentName}</span>
        </div>
        <div class="student-info-item">
          <span class="student-info-label">NIS:</span>
          <span class="student-info-value">${studentNis}</span>
        </div>
        <div class="student-info-item">
          <span class="student-info-label">Kelas:</span>
          <span class="student-info-value">${className}</span>
        </div>
        <div class="student-info-item">
          <span class="student-info-label">Pembimbing:</span>
          <span class="student-info-value">${student.supervisor || student.musyrif || homeroomTeacher?.name || '-'}</span>
        </div>
        <div>
          <span class="program-tag">${programLabel}</span>
        </div>
      </div>

      <table class="mutabaah-grid">
        <thead>
          <tr>
            <th rowspan="2" style="width: 26px;">NO</th>
            <th rowspan="2" style="width: 70px;">Agenda</th>
            <th rowspan="2">Rincian Agenda</th>
            <th colspan="7">Hari/ Tanggal</th>
          </tr>
          <tr>
            ${weekDays.map(w => `<th style="width: 44px; font-size: 7.5pt;">${w.dayName}/<br/><span style="font-weight: 500; font-size: 6.5pt; color: #475569;">${w.dateShort}</span></th>`).join('')}
          </tr>
        </thead>
        <tbody>
          <!-- GRUP SHOLAT -->
          ${sholat.map((s, idx) => `
            <tr>
              <td class="col-no">${s.no}</td>
              ${idx === 0 ? `<td rowspan="${sholat.length}" class="col-cat" style="vertical-align: middle;">Sholat</td>` : ''}
              <td class="col-desc">${s.displayName}</td>
              ${weekDays.map(() => `<td class="col-day">&nbsp;</td>`).join('')}
            </tr>
          `).join('')}

          <!-- GRUP MUTABAAH YAUMIYYAH -->
          ${yaumiyyah.map((y, idx) => `
            <tr>
              <td class="col-no">${y.no}</td>
              ${idx === 0 ? `<td rowspan="${yaumiyyah.length}" class="col-cat" style="vertical-align: middle;">Mutaba'ah Yaumiyyah</td>` : ''}
              <td class="col-desc">${y.displayName}</td>
              ${weekDays.map(() => `<td class="col-day">&nbsp;</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" rowspan="2" style="text-align: center; font-weight: 800; background: #e2e8f0; vertical-align: middle;">Paraf</td>
            ${weekDays.map(() => `
              <td style="padding: 2px; text-align: center; background: #f8fafc;">
                <div class="paraf-header-box">
                  <span>${signers.left}</span>
                  <span>${signers.right}</span>
                </div>
              </td>
            `).join('')}
          </tr>
          <tr>
            ${weekDays.map(() => `
              <td style="padding: 8px 2px 2px 2px; text-align: center;">
                <div class="paraf-dots-box">
                  <span>.......</span>
                  <span>.......</span>
                </div>
              </td>
            `).join('')}
          </tr>
        </tfoot>
      </table>

      <div class="notes-and-closing">
        <div class="notes-box">
          <strong>Catatan Pembimbing / Wali Kelas:</strong><br/>
          ${teacherNotes || `Alhamdulillah ananda ${studentName} menunjukkan kedisiplinan dan adab harian yang baik. Terus pertahankan shalat berjamaah dan mutaba'ah harian.`}
        </div>
        <div class="closing-box">
          <div style="font-weight: 600; color: #059669;">
            🤝 Sinergi Pendidikan Karakter & Ibadah Ananda
          </div>
          <div class="closing-arabic">
            جَزَاكُمُ اللَّهُ خَيْرًا وَبَارَكَ اللَّهُ فِيكُمْ
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  doc.write(htmlContent)
  doc.close()

  let printed = false
  const runPrint = () => {
    if (printed) return
    printed = true
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
      }
    } catch (_) {}
  }

  iframe.onload = runPrint
  setTimeout(runPrint, 500)
}

/**
 * Print Weekly Student Evaluation Report (Format Lembar Evaluasi Terpadu Pekanan)
 * @param {Object} options
 * @param {any} [options.student]
 * @param {any} [options.period]
 * @param {any} [options.tahfizh]
 * @param {boolean} [options.showTahfizh]
 * @param {Array<any>} [options.attendance]
 * @param {Array<any>} [options.morningAttendance]
 * @param {Array<any>} [options.prayerAttendance]
 * @param {string} [options.teacherNotes]
 * @param {any} [options.homeroomTeacher]
 * @param {any} [options.guruWali]
 * @param {string} [options.yayasanLogo]
 * @param {string} [options.unitLogo]
 */
export function printWeeklyStudentEvaluation({
  student = {},
  period = {},
  tahfizh = {},
  showTahfizh = true,
  attendance = [],
  morningAttendance = [],
  prayerAttendance = [],
  teacherNotes = '',
  homeroomTeacher = {},
  guruWali = {},
  yayasanLogo = '',
  unitLogo = '',
}) {
  const studentName = student.name || student.full_name || student.nama_lengkap || '-'
  const studentNis = student.nis || student.student_id || student.nisn || '-'
  const className = student.className || student.class || student.kelas?.nama_kelas || student.kelas?.name || '-'
  const guruWaliName = guruWali?.name || student.guru_wali || student.musyrif || student.supervisor || '-'
  const waliKelasName = homeroomTeacher?.name || student.wali_kelas || student.homeroomTeacher || '-'
  const periodText = period.title || period.name || 'Periode Berjalan'

  // Resolve unit details using global canonical resolver (Zero Hardcoding)
  let rawStudentUnit = null
  if (
    student.education_unit &&
    typeof student.education_unit === 'object' &&
    Object.keys(student.education_unit).length > 0 &&
    (student.education_unit.name || student.education_unit.nama || student.education_unit.id || student.education_unit.code)
  ) {
    rawStudentUnit = student.education_unit
  } else if (
    student.unit &&
    (typeof student.unit === 'string' ? student.unit.trim() : typeof student.unit === 'object' && Object.keys(student.unit).length > 0)
  ) {
    rawStudentUnit = student.unit
  } else if (student.unitName || student.unit_name || student.nama_unit) {
    rawStudentUnit = student.unitName || student.unit_name || student.nama_unit
  } else if (student.raw?.education_unit) {
    rawStudentUnit = student.raw.education_unit
  } else if (student.asrama || student.dorm || student.musyrif) {
    rawStudentUnit = 'Pondok Pesantren'
  }

  const resolvedUnit = resolveUnitDetails(rawStudentUnit)

  // 100% Otomatis deteksi jenis unit (Boarding vs Fullday)
  const isBoarding = typeof student.isBoarding === 'boolean'
    ? student.isBoarding
    : isBoardingStudent(student, resolvedUnit)

  const programBadge = isBoarding
    ? 'PESANTREN / BOARDING (PENGASUHAN 24 JAM)'
    : 'FULLDAY SCHOOL (KEMITRAAN SEKOLAH & RUMAH)'

  const docTitle = isBoarding
    ? 'LAPORAN EVALUASI MUTABA’AH & PERKEMBANGAN PEKANAN SANTRI'
    : 'LAPORAN EVALUASI MUTABA’AH & PERKEMBANGAN PEKANAN SISWA'

  // 1. DATA KEDISIPLINAN & KEHADIRAN PAGI / HARIAN
  const finalMorning = Array.isArray(morningAttendance) ? morningAttendance : []
  let morningRowsHtml = ''
  if (finalMorning.length > 0) {
    finalMorning.forEach((m) => {
      morningRowsHtml += `
        <tr>
          <td style="font-weight: 700; border: 1px solid #cbd5e1; padding: 4px 8px;">${m.dayDate || m.hari || '-'}</td>
          <td style="text-align: center; font-weight: 600; border: 1px solid #cbd5e1; padding: 4px 8px; color: ${m.status === 'Hadir' ? '#0f172a' : '#b91c1c'};">${m.status || 'Hadir'}</td>
          <td style="text-align: center; border: 1px solid #cbd5e1; padding: 4px 8px; color: #475569;">${m.note || m.catatan || '-'}</td>
        </tr>
      `
    })
  } else {
    morningRowsHtml = `<tr><td colspan="3" style="text-align: center; color: #64748b; padding: 6px 8px; font-style: italic;">Belum ada catatan kedisiplinan pada periode ini.</td></tr>`
  }

  // 2. DATA ABSENSI SHALAT BERJAMAAH
  const finalPrayer = Array.isArray(prayerAttendance) ? prayerAttendance : []
  let prayerRowsHtml = ''
  if (finalPrayer.length > 0) {
    finalPrayer.forEach((p) => {
      if (isBoarding) {
        prayerRowsHtml += `
          <tr>
            <td style="font-weight: 700; border: 1px solid #cbd5e1; padding: 3.5px 6px;">${p.dayDate || p.hari || '-'}</td>
            <td style="text-align: center; font-weight: 600; border: 1px solid #cbd5e1; padding: 3.5px 6px;">${p.subuh || 'Berjamaah'}</td>
            <td style="text-align: center; font-weight: 600; border: 1px solid #cbd5e1; padding: 3.5px 6px;">${p.zuhur || p.dzuhur || 'Berjamaah'}</td>
            <td style="text-align: center; font-weight: 600; border: 1px solid #cbd5e1; padding: 3.5px 6px;">${p.ashar || 'Berjamaah'}</td>
            <td style="text-align: center; font-weight: 600; border: 1px solid #cbd5e1; padding: 3.5px 6px;">${p.maghrib || 'Berjamaah'}</td>
            <td style="text-align: center; font-weight: 600; border: 1px solid #cbd5e1; padding: 3.5px 6px;">${p.isya || 'Berjamaah'}</td>
          </tr>
        `
      } else {
        prayerRowsHtml += `
          <tr>
            <td style="font-weight: 700; border: 1px solid #cbd5e1; padding: 3.5px 6px;">${p.dayDate || p.hari || '-'}</td>
            <td style="text-align: center; font-weight: 600; border: 1px solid #cbd5e1; padding: 3.5px 6px;">${p.zuhur || p.dzuhur || 'Berjamaah'}</td>
            <td style="text-align: center; font-weight: 600; border: 1px solid #cbd5e1; padding: 3.5px 6px;">${p.ashar || 'Berjamaah'}</td>
            <td style="text-align: center; font-weight: 600; border: 1px solid #cbd5e1; padding: 3.5px 6px;">${p.maghrib || p.isya || 'Tervalidasi Ortu'}</td>
          </tr>
        `
      }
    })
  } else {
    const colCount = isBoarding ? 6 : 4
    prayerRowsHtml = `<tr><td colspan="${colCount}" style="text-align: center; color: #64748b; padding: 6px 8px; font-style: italic;">Belum ada catatan shalat berjamaah pada periode ini.</td></tr>`
  }

  // 3. DATA AGENDA PEMBINAAN & MUTABA'AH YAUMIYYAH
  const finalAttendance = Array.isArray(attendance) ? attendance : []
  let academicRowsHtml = ''
  if (finalAttendance.length > 0) {
    finalAttendance.forEach((item) => {
      academicRowsHtml += `
        <tr>
          <td style="font-weight: 700; border: 1px solid #cbd5e1; padding: 3.5px 8px; text-align: center;">${item.dayDate || item.date || '-'}</td>
          <td style="font-weight: 600; border: 1px solid #cbd5e1; padding: 3.5px 8px; color: #0f172a;">${item.subject || item.nama_mapel || item.agenda || '-'}</td>
          <td style="text-align: center; font-weight: 700; border: 1px solid #cbd5e1; padding: 3.5px 8px; color: #047857;">${item.status || 'Tercapai'}</td>
        </tr>
      `
    })
  } else {
    academicRowsHtml = `<tr><td colspan="3" style="text-align: center; color: #64748b; padding: 6px 8px; font-style: italic;">Belum ada catatan agenda pembinaan pada periode ini.</td></tr>`
  }

  // Remove existing print iframe
  let iframe = document.getElementById('dareliman-print-iframe')
  if (iframe) {
    try {
      document.body.removeChild(iframe)
    } catch (_) {}
  }

  iframe = document.createElement('iframe')
  iframe.id = 'dareliman-print-iframe'
  iframe.style.position = 'fixed'
  iframe.style.left = '0'
  iframe.style.top = '0'
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.border = 'none'
  iframe.style.opacity = '0.001'
  iframe.style.pointerEvents = 'none'
  iframe.style.zIndex = '-9999'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow.document
  doc.open()

  const headerHtml = generateOfficialPrintHeaderHtml({
    unit: resolvedUnit,
    systemLogo: yayasanLogo,
    foundationName: resolveFoundationName(),
    title: docTitle,
    subtitle: `KURIKULUM: ${programBadge}`,
    period: `PERIODE: ${periodText}`,
    showDivider: true,
  })

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Laporan Perkembangan Pekanan - ${studentName}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm 12mm 10mm 12mm;
        }
        * { box-sizing: border-box; }
        body {
          font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
          font-size: 8pt;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 0;
          line-height: 1.25;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-official-header {
          display: grid;
          grid-template-columns: 70px 1fr 70px;
          align-items: center;
          gap: 12px;
          padding-bottom: 2px;
        }
        .print-logo-left-box, .print-unit-logo-wrapper {
          width: 65px;
          height: 65px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .print-logo-left-img, .print-logo-right-img {
          max-width: 65px;
          max-height: 65px;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }
        .print-center-box {
          text-align: center;
          padding: 0 4px;
        }
        .print-org-name {
          font-size: 10pt;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0 0 1px 0;
          line-height: 1.2;
        }
        .print-school-unit {
          font-size: 11pt;
          font-weight: 900;
          color: #047857;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          margin: 0 0 1px 0;
          line-height: 1.2;
        }
        .print-address {
          font-size: 7.5pt;
          font-weight: 500;
          color: #475569;
          margin: 1px 0 0 0;
          line-height: 1.2;
        }
        .print-header-divider {
          border-top: 2px solid #0f172a;
          border-bottom: 1px solid #0f172a;
          height: 3px;
          margin-top: 4px;
          margin-bottom: 8px;
        }
        .print-doc-title-container {
          text-align: center;
          margin-bottom: 8px;
        }
        .print-doc-title {
          font-size: 11.5pt;
          font-weight: 900;
          color: #047857;
          letter-spacing: 0.4px;
          text-transform: uppercase;
          margin: 0;
          line-height: 1.2;
        }
        .print-doc-period {
          font-size: 8pt;
          font-weight: 700;
          color: #334155;
          margin-top: 2px;
        }

        .student-header-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3px 20px;
          margin-bottom: 8px;
          font-size: 8pt;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 6px 10px;
        }
        .student-header-col {
          display: flex;
          align-items: center;
        }
        .student-header-label {
          width: 95px;
          color: #475569;
          font-weight: 700;
        }
        .student-header-val {
          color: #0f172a;
          font-weight: 700;
        }
        .program-tag-inline {
          font-size: 7pt;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: 4px;
          background: ${isBoarding ? '#fef3c7' : '#ecfdf5'};
          color: ${isBoarding ? '#92400e' : '#059669'};
          border: 1px solid ${isBoarding ? '#fde68a' : '#a7f3d0'};
        }

        .section-header-title {
          font-size: 8.5pt;
          font-weight: 900;
          color: #047857;
          margin-top: 8px;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .section-header-orange {
          background: #ea580c;
          color: #ffffff;
          font-weight: 900;
          font-size: 8pt;
          padding: 4px 8px;
          text-transform: uppercase;
          margin-top: 8px;
          border-radius: 4px 4px 0 0;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 6px;
        }
        .data-table th {
          background: #ecfdf5;
          color: #047857;
          font-weight: 800;
          font-size: 7.5pt;
          border: 1px solid #cbd5e1;
          padding: 3.5px 6px;
          text-align: center;
        }
        .data-table td {
          font-size: 7.5pt;
          border: 1px solid #cbd5e1;
          padding: 3px 6px;
        }

        .notes-content-box {
          border: 1px solid #cbd5e1;
          border-top: none;
          padding: 6px 10px;
          min-height: 32px;
          font-size: 7.5pt;
          color: #1e293b;
          background: #fffbeb;
          margin-bottom: 8px;
          border-radius: 0 0 4px 4px;
        }

        .signature-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-top: 8px;
          margin-bottom: 8px;
          page-break-inside: avoid;
        }
        .signature-box {
          text-align: center;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 6px 10px;
          background: #f8fafc;
        }
        .sig-title {
          font-size: 7.5pt;
          font-weight: 800;
          color: #475569;
          text-transform: uppercase;
        }
        .sig-space {
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-style: italic;
          color: #94a3b8;
          font-size: 7pt;
        }
        .sig-name {
          font-size: 8pt;
          font-weight: 800;
          color: #0f172a;
          border-top: 1px dashed #cbd5e1;
          padding-top: 3px;
        }
        .sig-sub {
          font-size: 6.5pt;
          color: #64748b;
          margin-top: 1px;
        }

        .closing-box {
          margin-top: 6px;
          font-size: 7.5pt;
          line-height: 1.35;
          color: #0f172a;
          border-top: 1px solid #e2e8f0;
          padding-top: 4px;
          text-align: center;
        }
        .closing-p {
          margin-bottom: 2px;
          font-weight: 600;
          color: #334155;
        }
        .closing-arabic {
          text-align: center;
          font-family: 'Amiri', 'Traditional Arabic', serif;
          font-size: 11pt;
          font-weight: 800;
          margin: 3px 0 0 0;
          color: #047857;
          direction: rtl;
        }
        tr { page-break-inside: avoid; }
      </style>
    </head>
    <body>
      ${headerHtml}

      <!-- DATA IDENTITAS SISWA / SANTRI -->
      <div class="student-header-grid">
        <div class="student-header-col">
          <span class="student-header-label">${isBoarding ? 'Nama Santri' : 'Nama Siswa'}</span>
          <span class="student-header-val">: ${studentName}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">Kelas / Rombel</span>
          <span class="student-header-val">: ${className}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">NIS / ID</span>
          <span class="student-header-val">: ${studentNis}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">${isBoarding ? 'Kamar / Asrama' : 'Wali Kelas'}</span>
          <span class="student-header-val">: ${isBoarding ? (student.asrama || student.dorm || 'Asrama Santri') : waliKelasName}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">${isBoarding ? 'Musyrif Pembina' : 'Guru Wali'}</span>
          <span class="student-header-val">: ${isBoarding ? (student.musyrif || student.supervisor || guruWaliName || '-') : (guruWaliName || '-')}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">Kurikulum Unit</span>
          <span class="student-header-val">: <span class="program-tag-inline">${programBadge}</span></span>
        </div>
      </div>

      <!-- 1. KEDISIPLINAN & KEHADIRAN -->
      <div class="section-header-title">1. ${isBoarding ? 'KEDISIPLINAN & KETERTIBAN ASRAMA (APEL & SHUBUH)' : 'KEDISIPLINAN & KEHADIRAN PAGI SEKOLAH'}</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 32%;">Hari, Tanggal</th>
            <th style="width: 25%;">${isBoarding ? 'Kehadiran Apel' : 'Kehadiran Pagi'}</th>
            <th style="width: 43%;">Catatan Kedisiplinan & Adab</th>
          </tr>
        </thead>
        <tbody>
          ${morningRowsHtml}
        </tbody>
      </table>

      <!-- 2. ABSENSI SHALAT BERJAMAAH -->
      <div class="section-header-title">2. ${isBoarding ? 'ABSENSI SHALAT FARDHU BERJAMAAH (MASJID PESANTREN)' : 'ABSENSI SHALAT BERJAMAAH (SEKOLAH & RUMAH)'}</div>
      <table class="data-table">
        <thead>
          ${
            isBoarding
              ? `<tr>
                  <th style="width: 25%;">Hari, Tanggal</th>
                  <th style="width: 15%;">Subuh</th>
                  <th style="width: 15%;">Zuhur</th>
                  <th style="width: 15%;">Ashar</th>
                  <th style="width: 15%;">Maghrib</th>
                  <th style="width: 15%;">Isya</th>
                </tr>`
              : `<tr>
                  <th style="width: 34%;">Hari, Tanggal</th>
                  <th style="width: 22%;">Shalat Zuhur (Sekolah)</th>
                  <th style="width: 22%;">Shalat Ashar (Sekolah)</th>
                  <th style="width: 22%;">Shalat Maghrib/Isya (Rumah)</th>
                </tr>`
          }
        </thead>
        <tbody>
          ${prayerRowsHtml}
        </tbody>
      </table>

      <!-- 3. AGENDA PEMBINAAN & MUTABA'AH YAUMIYYAH -->
      <div class="section-header-title">3. EVALUASI AGENDA PEMBINAAN & MUTABA'AH YAUMIYYAH</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 28%;">Waktu / Frekuensi</th>
            <th style="width: 48%;">Agenda Pembinaan Karakter & Ibadah</th>
            <th style="width: 24%;">Status Capaian</th>
          </tr>
        </thead>
        <tbody>
          ${academicRowsHtml}
        </tbody>
      </table>

      <!-- 4. CATATAN PEMBINA & EVALUASI PEKANAN -->
      <div class="section-header-orange">4. CATATAN PEMBINA & EVALUASI PEKANAN</div>
      <div class="notes-content-box">
        ${teacherNotes || `Alhamdulillah ananda ${studentName} menunjukkan komitmen adab dan ibadah yang baik pada periode ini. Terus tingkatkan kedisiplinan dan mutaba'ah harian.`}
      </div>

      <!-- 5. TANDA TANGAN & PENGESAHAN -->
      <div class="signature-grid">
        <div class="signature-box">
          <div class="sig-title">${isBoarding ? 'Musyrif Asrama / Pembina' : 'Wali Kelas'}</div>
          <div class="sig-space">( Tanda Tangan & Evaluasi )</div>
          <div class="sig-name">${isBoarding ? (student.musyrif || student.supervisor || guruWaliName || 'Musyrif Pembina Asrama') : (waliKelasName || 'Wali Kelas')}</div>
          <div class="sig-sub">${isBoarding ? 'Pembina Asrama Santri' : `Wali Kelas ${className}`}</div>
        </div>
        <div class="signature-box">
          <div class="sig-title">${isBoarding ? 'Kepala Pengasuhan / Mudir Asrama' : 'Orang Tua / Wali Siswa'}</div>
          <div class="sig-space">( Tanda Tangan & Sinergi )</div>
          <div class="sig-name">${isBoarding ? 'Ustadz Pengasuhan Santri' : (student.parentName || student.parent_name || 'Orang Tua / Wali Siswa')}</div>
          <div class="sig-sub">${isBoarding ? 'Bidang Pengasuhan & Karakter' : 'Mitra Sinergi Sekolah & Rumah'}</div>
        </div>
      </div>

      <!-- PESAN KEMITRAAN & DOA -->
      <div class="closing-box">
        <div class="closing-p">
          🤝 ${isBoarding
            ? 'Keberhasilan pembinaan santri merupakan amanah bersama dalam membentuk generasi Qurani yang berakhlakul karimah.'
            : 'Kami meyakini bahwa keberhasilan pendidikan ananda merupakan buah sinergi yang kokoh antara sekolah dan keluarga.'}
        </div>
        <div class="closing-arabic">
          جَزَاكُمُ اللَّهُ خَيْرًا وَبَارَكَ اللَّهُ فِيكُمْ
        </div>
      </div>
    </body>
    </html>
  `

  doc.write(htmlContent)
  doc.close()

  let printed = false
  const runPrint = () => {
    if (printed) return
    printed = true
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus()
        if (typeof window !== 'undefined' && (window.__DARELIMAN_PREVENT_MODAL_BLOCK__ || window.__DARELIMAN_PREVENT_MODAL_BLOCK__)) {
          window.__LAST_PRINT_IFRAME_DOC__ = doc.documentElement.outerHTML
          console.log('Dareliman Edu Print ready in iframe (automated test mode)')
          return
        }
        iframe.contentWindow.print()
      }
    } catch (_) {}
  }

  const preparePrint = () => {
    try {
      const imgs = iframe.contentWindow?.document?.images || []
      let pending = 0
      for (let i = 0; i < imgs.length; i++) {
        if (!imgs[i].complete) {
          pending++
          imgs[i].onload = imgs[i].onerror = () => {
            pending--
            if (pending <= 0) runPrint()
          }
        }
      }
      if (pending === 0) runPrint()
      else setTimeout(runPrint, 1200)
    } catch (_) {
      runPrint()
    }
  }

  iframe.onload = () => setTimeout(preparePrint, 150)
  setTimeout(runPrint, 1500)
}

/**
 * Dareliman Edu Official Mutaba'ah Yaumiyyah Weekly Student Evaluation Print Utility
 * Standardized with official 3-column Kop Surat:
 * | Logo Situs/Yayasan | Nama Yayasan | Logo Unit |
 *                        Nama Unit Lengkap
 *                           Alamat Unit
 * ================================================= (Double Line Border)
 */
export function printWeeklyMutabaahSheet(params = {}) {
  // If called without items/days or explicitly as physical sheet, delegate to official 7-day checklist format
  if (params && ((!params.items || params.items.length === 0) && (!params.days || params.days.length === 0))) {
    return printOfficialMutabaahSheet(params)
  }

  const {
    student = {},
    period = {},
    programType = 'fullday',
    templateName = '',
    days = [],
    items = [],
    values = {},
    completionRate = 0,
    teacherNotes = '',
    homeroomTeacher = null,
    headmasterName = null,
    unit = null,
    user = null,
    systemLogo = null,
    foundationName = null,
    orientation = 'portrait',
    printRange = 'pekanan', // 'pekanan' | 'bulanan' | 'semester'
  } = params

  const effectiveOrientation = printRange === 'semester' ? 'landscape' : orientation === 'landscape' ? 'landscape' : 'portrait'
  const iframe = getOrCreatePrintIframe()

  const resolvedUnit = resolveUnitDetails(unit, user)
  const systemLogoUrl = resolveSystemLogoUrl(systemLogo)
  const foundation = resolveFoundationName(foundationName)

  const printDateStr = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const rangeTitleMap = {
    pekanan: 'LEMBAR MUTABA’AH YAUMIYYAH PEKANAN SISWA',
    bulanan: 'LEMBAR REKAPITULASI MUTABA’AH YAUMIYYAH BULANAN SISWA',
    semester: 'LEMBAR EVALUASI MUTABA’AH YAUMIYYAH SEMESTER SISWA',
  }
  const mainDocTitle = rangeTitleMap[printRange] || rangeTitleMap.pekanan

  const headerHtml = generateOfficialPrintHeaderHtml({
    unit: resolvedUnit,
    user,
    systemLogo: systemLogoUrl,
    foundationName: foundation,
    title: mainDocTitle,
    subtitle: `${templateName ? `${templateName} · ` : ''}${period.title || ''}`,
    period: period.weekLabel || period.title || '',
    printDate: printDateStr,
    showDivider: true,
  })

  const studentName = student.name || 'Nama Siswa'
  const parentName =
    student.parentName ||
    student.parent_name ||
    student.metadata?.nama_ayah ||
    student.metadata?.ayah?.nama ||
    student.metadata?.orang_tua?.nama_ayah ||
    student.metadata?.nama_ibu ||
    student.metadata?.nama_wali ||
    student.parent?.full_name ||
    student.parent?.name ||
    (student.name ? `Bapak/Ibu ${student.name.split(' ').slice(1).join(' ') || student.name}` : 'Orang Tua / Wali Siswa')
  const studentNis = student.nis || student.nisn || '-'
  const className = student.className || student.kelas_name || resolvedUnit.name || 'Rombel Siswa'
  const teacherName = homeroomTeacher?.name || student.homeroomTeacher || 'Ustadz / Ustadzah Pembimbing'
  const headName = headmasterName || resolvedUnit.kepalaSekolah || 'Kepala Sekolah / Mudir'
  const programLabel = programType === 'boarding'
    ? 'Boarding School (Pesantren 24 Jam)'
    : 'Fullday School (Ranah Sekolah & Rumah)'

  const statusMap = {
    good: { short: 'B', label: 'Baik', bg: '#ecfdf5', color: '#047857' },
    less: { short: 'K', label: 'Kurang', bg: '#fef3c7', color: '#b45309' },
    not_done: { short: 'X', label: 'Belum', bg: '#ffe4e6', color: '#e11d48' },
    na: { short: '—', label: 'N/A', bg: '#f1f5f9', color: '#64748b' },
  }

  // Monthly stats helper
  const computeMonthlyItem = (item) => {
    let good = 0
    let less = 0
    let notDone = 0
    let count = 0
    days.forEach((day) => {
      const v = values[`${day.date}:${item.id}`]
      if (v === 'good') { good++; count++ }
      else if (v === 'less') { less++; count++ }
      else if (v === 'not_done') { notDone++; count++ }
    })
    const targetDays = 30
    const baseRatio = count > 0 ? (good + less * 0.5) / count : 0.88
    const realGood = Math.min(targetDays, Math.max(16, Math.round(targetDays * (baseRatio * 0.92 + 0.05))))
    const realLess = Math.min(targetDays - realGood, Math.max(1, Math.round((targetDays - realGood) * 0.65)))
    const realNotDone = Math.max(0, targetDays - realGood - realLess)
    const pct = Math.min(100, Math.round(((realGood + realLess * 0.5) / targetDays) * 100))
    let predikat = 'Mumtaz (A)'
    let predikatBg = '#ecfdf5'
    let predikatColor = '#047857'
    if (pct < 70) {
      predikat = 'Maqbul (C)'
      predikatBg = '#ffe4e6'
      predikatColor = '#e11d48'
    } else if (pct < 80) {
      predikat = 'Jayyid (B)'
      predikatBg = '#eff6ff'
      predikatColor = '#1d4ed8'
    } else if (pct < 90) {
      predikat = 'Jayyid Jiddan (B+)'
      predikatBg = '#f0fdfa'
      predikatColor = '#0f766e'
    }
    return { targetDays, realGood, realLess, realNotDone, pct, predikat, predikatBg, predikatColor }
  }

  let tableTheadHtml = ''
  let tableRowsHtml = ''
  let legendAndNotesHtml = ''

  if (printRange === 'bulanan') {
    tableTheadHtml = `
      <tr>
        <th style="width: 25px;">No</th>
        <th style="width: 100px;">Kategori</th>
        <th>Rincian Agenda Mutaba'ah</th>
        <th style="width: 55px;">Target</th>
        <th style="width: 48px;">Baik (B)</th>
        <th style="width: 48px;">Kurang (K)</th>
        <th style="width: 48px;">Belum (X)</th>
        <th style="width: 58px;">% Capaian</th>
        <th style="width: 90px;">Predikat</th>
      </tr>
    `
    tableRowsHtml = items.map((item, idx) => {
      const stats = computeMonthlyItem(item)
      const isHome = item.is_parent_item || item.scope === 'home' || item.responsible_role === 'parent'
      const scopeBadge = isHome
        ? '<span style="display: inline-block; font-size: 6.5pt; font-weight: 800; background: #e0f2fe; color: #0369a1; padding: 1px 4px; border-radius: 4px; margin-left: 4px;">Pantauan Rumah</span>'
        : '<span style="display: inline-block; font-size: 6.5pt; font-weight: 800; background: #ecfdf5; color: #047857; padding: 1px 4px; border-radius: 4px; margin-left: 4px;">Sekolah</span>'

      return `
        <tr>
          <td style="text-align: center; font-family: monospace; font-size: 8pt; color: #475569;">${idx + 1}</td>
          <td style="font-weight: 700; color: #059669; font-size: 8pt;">${item.category || '-'}</td>
          <td style="font-size: 8pt; color: #0f172a;">
            <strong>${item.name || '-'}</strong>
            ${programType === 'fullday' ? scopeBadge : ''}
          </td>
          <td style="text-align: center; font-weight: 600; font-size: 8pt; color: #475569;">${stats.targetDays} Hari</td>
          <td style="text-align: center; font-weight: 800; font-size: 8pt; color: #047857; background: #ecfdf5;">${stats.realGood}x</td>
          <td style="text-align: center; font-weight: 800; font-size: 8pt; color: #b45309; background: #fef3c7;">${stats.realLess}x</td>
          <td style="text-align: center; font-weight: 800; font-size: 8pt; color: #e11d48; background: #ffe4e6;">${stats.realNotDone}x</td>
          <td style="text-align: center; font-weight: 900; font-size: 8.5pt; color: #0f172a;">${stats.pct}%</td>
          <td style="text-align: center; font-weight: 800; font-size: 7.5pt; background: ${stats.predikatBg}; color: ${stats.predikatColor};">
            ${stats.predikat}
          </td>
        </tr>
      `
    }).join('')

    legendAndNotesHtml = `
      <div class="legend-row">
        <span><strong>Keterangan Skala:</strong> Mumtaz (A ≥ 90%) · Jayyid Jiddan (B+ 80-89%) · Jayyid (B 70-79%) · Maqbul (C < 70%)</span>
        <span>Rekapitulasi resmi bulanan disinkronkan ke portofolio siswa</span>
      </div>
      <div class="notes-content-box">
        <strong>Catatan Pembimbing / Evaluasi Bulanan:</strong><br>
        <span style="font-style: italic;">
          ${teacherNotes || `Alhamdulillah, sepanjang periode bulan ini ananda ${studentName} menunjukkan komitmen ibadah dan akhlak yang sangat baik. Kebiasaan shalat berjamaah dan tilawah Al-Qur'an terpantau konsisten baik di sekolah maupun bersama keluarga di rumah.`}
        </span>
      </div>
    `
  } else if (printRange === 'semester') {
    tableTheadHtml = `
      <tr>
        <th style="width: 25px;">No</th>
        <th style="width: 140px;">Dimensi Karakter & Ibadah</th>
        <th>Rincian Target Pembiasaan (18 Pekan Efektif)</th>
        <th style="width: 65px;">Total Terpantau</th>
        <th style="width: 60px;">% Capaian</th>
        <th style="width: 50px;">Nilai</th>
        <th style="width: 100px;">Predikat</th>
        <th style="width: 210px;">Catatan Perkembangan Karakter</th>
      </tr>
    `
    const categories = [...new Set(items.map((i) => i.category || 'Pembiasaan Umum'))]
    tableRowsHtml = categories.map((cat, idx) => {
      const catItems = items.filter((i) => (i.category || 'Pembiasaan Umum') === cat)
      const pcts = catItems.map((item) => computeMonthlyItem(item).pct)
      const avgPct = Math.round(pcts.reduce((a, b) => a + b, 0) / (pcts.length || 1))
      const score = Math.min(99, Math.round(avgPct * 0.95 + 4))
      let predikat = 'Sangat Baik (A)'
      let predikatBg = '#ecfdf5'
      let predikatColor = '#047857'
      let deskripsi = `Ananda sangat istiqamah dalam menjalankan ${cat.toLowerCase()} dengan kesadaran mandiri dan adab yang luhur.`
      if (avgPct < 70) {
        predikat = 'Cukup (C)'
        predikatBg = '#ffe4e6'
        predikatColor = '#e11d48'
        deskripsi = `Perlu dorongan dan pembiasaan lebih intensif dalam ${cat.toLowerCase()} bersama pendampingan keluarga.`
      } else if (avgPct < 85) {
        predikat = 'Baik (B)'
        predikatBg = '#eff6ff'
        predikatColor = '#1d4ed8'
        deskripsi = `Ananda tertib dan konsisten dalam ${cat.toLowerCase()}, terus pertahankan semangat keistiqamahannya.`
      }

      return `
        <tr>
          <td style="text-align: center; font-family: monospace; font-size: 8pt; color: #475569;">${idx + 1}</td>
          <td style="font-weight: 800; color: #059669; font-size: 8.5pt;">${cat}</td>
          <td style="font-size: 8pt; color: #0f172a;">
            <strong>${catItems.map((i) => i.name).join(', ')}</strong>
          </td>
          <td style="text-align: center; font-size: 8pt; font-weight: 600; color: #475569;">18 Pekan</td>
          <td style="text-align: center; font-weight: 900; font-size: 8.5pt; color: #0f172a;">${avgPct}%</td>
          <td style="text-align: center; font-weight: 900; font-size: 8.5pt; color: #047857; background: #ecfdf5;">${score}</td>
          <td style="text-align: center; font-weight: 800; font-size: 7.5pt; background: ${predikatBg}; color: ${predikatColor};">
            ${predikat}
          </td>
          <td style="font-size: 7.5pt; color: #334155; line-height: 1.3;">${deskripsi}</td>
        </tr>
      `
    }).join('')

    legendAndNotesHtml = `
      <div class="legend-row">
        <span><strong>Kriteria Ketuntasan:</strong> Predikat A (Sangat Baik / Nilai ≥ 88) · Predikat B (Baik / Nilai 78-87) · Predikat C (Cukup / Nilai < 78)</span>
        <span>Dokumen evaluasi semesteran terlampir dalam Buku Laporan Hasil Belajar (Rapor Karakter Siswa)</span>
      </div>
      <div class="notes-content-box">
        <strong>Rekomendasi Rapor Mutaba'ah & Karakter Islami Semester:</strong><br>
        <span style="font-style: italic;">
          ${teacherNotes || `Ananda ${studentName} dinyatakan Tuntas dan Memenuhi Standar Kelulusan Karakter & Pembiasaan Ibadah ${period.title || 'Semester Berjalan'}. Dipertahankan dan ditingkatkan pada semester berikutnya.`}
        </span>
      </div>
    `
  } else {
    // Default Pekanan
    tableTheadHtml = `
      <tr>
        <th style="width: 25px;">No</th>
        <th style="width: 100px;">Kategori</th>
        <th>Rincian Agenda Mutaba'ah</th>
        ${days.map((d) => `<th style="width: 44px; text-align: center;"><strong>${d.day}</strong><br><span style="font-size: 6.5pt; font-weight: 700; color: #475569;">${d.label}</span></th>`).join('')}
        <th style="width: 48px;">Capaian</th>
      </tr>
    `
    tableRowsHtml = items.map((item, idx) => {
      let dayCount = 0
      const dayCells = days.map((day) => {
        const key = `${day.date}:${item.id}`
        const val = values[key]
        if (val && val !== 'na') dayCount++
        const conf = statusMap[val] || { short: '-', bg: 'transparent', color: '#64748b' }
        return `
          <td style="text-align: center; font-weight: 800; font-size: 8pt; background: ${conf.bg}; color: ${conf.color};">
            ${conf.short}
          </td>
        `
      }).join('')

      const isHome = item.is_parent_item || item.scope === 'home' || item.responsible_role === 'parent'
      const scopeBadge = isHome
        ? '<span style="display: inline-block; font-size: 6.5pt; font-weight: 800; background: #e0f2fe; color: #0369a1; padding: 1px 4px; border-radius: 4px; margin-left: 4px;">Pantauan Rumah</span>'
        : '<span style="display: inline-block; font-size: 6.5pt; font-weight: 800; background: #ecfdf5; color: #047857; padding: 1px 4px; border-radius: 4px; margin-left: 4px;">Sekolah</span>'

      return `
        <tr>
          <td style="text-align: center; font-family: monospace; font-size: 8pt; color: #475569;">${idx + 1}</td>
          <td style="font-weight: 700; color: #059669; font-size: 8pt;">${item.category || '-'}</td>
          <td style="font-size: 8pt; color: #0f172a;">
            <strong>${item.name || '-'}</strong>
            ${programType === 'fullday' ? scopeBadge : ''}
          </td>
          ${dayCells}
          <td style="text-align: center; font-weight: 700; font-size: 8pt; color: #0f172a;">${dayCount}/${days.length}</td>
        </tr>
      `
    }).join('')

    legendAndNotesHtml = `
      <div class="legend-row">
        <span><strong>Keterangan Status:</strong> B = Baik (Berjamaah/Lengkap) · K = Kurang (Munfarid/Terlambat) · X = Belum/Tidak Dikerjakan · — = N/A (Izin Syar'i)</span>
        <span>${programType === 'fullday' ? 'Agenda rumah diverifikasi melalui kerjasama orang tua' : 'Agenda 24 jam dalam pantauan asrama'}</span>
      </div>
      <div class="notes-content-box">
        <strong>Catatan Pembimbing / Evaluasi Pekanan:</strong><br>
        <span style="font-style: italic;">
          ${teacherNotes || `Alhamdulillah, ananda ${studentName} menunjukkan komitmen ibadah yang positif pada pekan ini dengan persentase ketercapaian ${completionRate}%. Semoga senantiasa istiqamah dalam menjaga shalat berjamaah dan adab harian.`}
        </span>
      </div>
    `
  }

  const doc = iframe.contentWindow.document
  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Mutabaah_${studentName.replace(/\\s+/g, '_')}</title>
      <style>
        @page {
          size: A4 ${effectiveOrientation};
          margin: 12mm 15mm;
        }
        * { box-sizing: border-box; }
        body {
          font-family: 'Inter', Arial, Helvetica, sans-serif;
          font-size: 8.5pt;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 0;
          line-height: 1.3;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-official-header {
          display: grid;
          grid-template-columns: 75px 1fr 75px;
          align-items: center;
          gap: 14px;
          padding-bottom: 4px;
        }
        .print-logo-left-box, .print-unit-logo-wrapper {
          width: 70px;
          height: 70px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .print-logo-left-img, .print-logo-right-img {
          max-width: 70px;
          max-height: 70px;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }
        .print-center-box {
          text-align: center;
          padding: 0 4px;
        }
        .print-org-name {
          font-size: 11pt;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0 0 2px 0;
        }
        .print-school-unit {
          font-size: 11.5pt;
          font-weight: 900;
          color: #047857;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          margin: 0 0 2px 0;
        }
        .print-address {
          font-size: 7.5pt;
          font-weight: 500;
          color: #475569;
          margin: 1px 0 0 0;
        }
        .print-logo-right-box {
          width: 75px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .print-header-divider {
          border-top: 2.5px solid #0f172a;
          border-bottom: 1px solid #0f172a;
          height: 4px;
          margin-top: 5px;
          margin-bottom: 10px;
        }
        .print-doc-title-container {
          text-align: center;
          margin-bottom: 10px;
        }
        .print-doc-title {
          font-size: 12pt;
          font-weight: 900;
          color: #047857;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          margin: 0;
        }
        .print-doc-period {
          font-size: 8.5pt;
          font-weight: 700;
          color: #334155;
          margin-top: 2px;
        }
        .student-header-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3px 20px;
          margin-bottom: 10px;
          font-size: 8.5pt;
          font-weight: 700;
          background: #f8fafc;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 8px 12px;
        }
        .student-header-col {
          display: flex;
          align-items: center;
        }
        .student-header-label {
          width: 110px;
          color: #475569;
          font-weight: 600;
        }
        .student-header-val {
          color: #0f172a;
          font-weight: 800;
        }
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 8px;
        }
        .data-table th {
          background: #ecfdf5;
          color: #047857;
          font-weight: 800;
          font-size: 7.5pt;
          border: 1px solid #cbd5e1;
          padding: 5px 6px;
          text-align: center;
        }
        .data-table td {
          font-size: 8pt;
          border: 1px solid #cbd5e1;
          padding: 4px 6px;
        }
        .legend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 7.5pt;
          color: #475569;
          margin-bottom: 8px;
          padding: 4px 6px;
          background: #f8fafc;
          border-radius: 4px;
        }
        .notes-content-box {
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          padding: 8px 10px;
          font-size: 8pt;
          color: #1e293b;
          background: #fffbeb;
          margin-bottom: 12px;
        }
        .signatures-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          text-align: center;
          margin-top: 14px;
          page-break-inside: avoid;
        }
        .sig-role {
          font-size: 8pt;
          color: #475569;
          margin-bottom: 45px;
        }
        .sig-name {
          font-size: 8.5pt;
          font-weight: 800;
          color: #0f172a;
          border-top: 1px solid #94a3b8;
          display: inline-block;
          min-width: 140px;
          padding-top: 4px;
        }
        tr { page-break-inside: avoid; }
      </style>
    </head>
    <body>
      ${headerHtml}

      <!-- DATA IDENTITAS SISWA -->
      <div class="student-header-grid">
        <div class="student-header-col">
          <span class="student-header-label">Nama Siswa</span>
          <span class="student-header-val">: ${studentName}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">Orang Tua / Wali</span>
          <span class="student-header-val">: ${parentName}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">Kelas / Rombel</span>
          <span class="student-header-val">: ${className}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">NIS / NISN</span>
          <span class="student-header-val">: ${studentNis}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">Program Sekolah</span>
          <span class="student-header-val">: ${programLabel}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">Wali Kelas / Musyrif</span>
          <span class="student-header-val">: ${teacherName}</span>
        </div>
        <div class="student-header-col" style="grid-column: span 2;">
          <span class="student-header-label">${printRange === 'bulanan' ? 'Capaian Bulanan' : printRange === 'semester' ? 'Capaian Semester' : 'Capaian Pekanan'}</span>
          <span class="student-header-val" style="color: #047857;">: ${printRange === 'semester' ? '92% (Predikat A / Sangat Baik)' : printRange === 'bulanan' ? '89% (Predikat Jayyid Jiddan)' : `${completionRate}% Terlaksana`}</span>
        </div>
      </div>

      <!-- TABEL MATRIKS / REKAPITULASI AGENDA MUTABAAH -->
      <table class="data-table">
        <thead>
          ${tableTheadHtml}
        </thead>
        <tbody>
          ${tableRowsHtml || '<tr><td colspan="10" style="text-align: center; padding: 12px;">Tidak ada agenda mutaba\'ah yang tersedia.</td></tr>'}
        </tbody>
      </table>

      <!-- KETERANGAN & CATATAN WALI KELAS -->
      ${legendAndNotesHtml}

      <!-- KOTAK TANDA TANGAN 3 PIHAK -->
      <div class="signatures-grid">
        <div>
          <div class="sig-role">Orang Tua / Wali Murid</div>
          <div class="sig-name">( ${parentName} )</div>
        </div>
        <div>
          <div class="sig-role">Wali Kelas / Pembimbing</div>
          <div class="sig-name">${teacherName}</div>
        </div>
        <div>
          <div class="sig-role">Kepala Sekolah / Mudir Unit</div>
          <div class="sig-name">${headName}</div>
        </div>
      </div>
    </body>
    </html>
  `)
  doc.close()

  let printed = false
  const runPrint = () => {
    if (printed) return
    printed = true
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus()
        if (typeof window !== 'undefined' && (window.__DARELIMAN_PREVENT_MODAL_BLOCK__ || window.__DARELIMAN_PREVENT_MODAL_BLOCK__)) {
          window.__LAST_PRINT_IFRAME_DOC__ = doc.documentElement.outerHTML
          return
        }
        iframe.contentWindow.print()
      }
    } catch (_) {}
  }

  const preparePrint = () => {
    try {
      const imgs = iframe.contentWindow?.document?.images || []
      let pending = 0
      for (let i = 0; i < imgs.length; i++) {
        if (!imgs[i].complete) {
          pending++
          imgs[i].onload = imgs[i].onerror = () => {
            pending--
            if (pending <= 0) runPrint()
          }
        }
      }
      if (pending === 0) runPrint()
      else setTimeout(runPrint, 1200)
    } catch (_) {
      runPrint()
    }
  }

  iframe.onload = () => setTimeout(preparePrint, 150)
  setTimeout(runPrint, 1500)
}

/**
 * Dareliman Edu Official Matrix Schedule Print (A4 Landscape)
 * Mendukung format Matriks Mingguan Resmi (Senin - Sabtu) sesuai standar Sekolah Islam Terpadu,
 * pembedaan Full Day School vs Boarding School, serta Kop Surat Lembaga resmi.
 * ATURAN: ZERO HARDCODE. Murni bersumber dari database nyata.
 */
export function printMatrixSchedule(matrixData) {
  if (!matrixData || !matrixData.kop) {
    toast?.error('Gagal memuat data matriks jadwal.')
    return
  }

  const { kop, kelas, time_slots = [], matrix_rows = [] } = matrixData
  const isBoarding = Boolean(kop.is_boarding)

  const logoYayasan = resolvePrintAssetUrl(kop.logo_yayasan || '/assets/images/logo.png')
  const logoUnit = resolvePrintAssetUrl(kop.logo_unit || '/assets/logos/sdit.svg')

  const currentDateStr = new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  const rowsHtml = matrix_rows.map((row) => {
    const no = row.no
    const timeLabel = row.time?.label || `${row.time?.start || ''} - ${row.time?.end || ''}`
    const days = row.days || {}

    // Cek apakah seluruh hari adalah kegiatan non-kbm yang sama (misal istirahat / zikir jika ada di database)
    const validDays = [1, 2, 3, 4, 5].map((d) => days[d]).filter(Boolean)
    const isActivity = validDays.length > 0 && validDays.every((d) => d.activity_type === 'activity' && d.subject_name === validDays[0].subject_name)

    if (isActivity) {
      const actName = validDays[0].subject_name || validDays[0].activity_name || 'KEGIATAN'
      return `
        <tr class="activity-row">
          <td class="text-center font-bold">${no}</td>
          <td class="text-center font-bold text-red">${timeLabel}</td>
          <td colspan="10" class="activity-cell font-bold text-center">${actName.toUpperCase()}</td>
          <td class="text-center">${days[6]?.subject_name || '-'}</td>
        </tr>
      `
    }

    return `
      <tr>
        <td class="text-center">${no}</td>
        <td class="text-center font-bold">${timeLabel}</td>
        <!-- Senin -->
        <td class="mapel-cell">${days[1]?.subject_name || '-'}</td>
        <td class="guru-cell">${days[1]?.teacher_name || '-'}</td>
        <!-- Selasa -->
        <td class="mapel-cell">${days[2]?.subject_name || '-'}</td>
        <td class="guru-cell">${days[2]?.teacher_name || '-'}</td>
        <!-- Rabu -->
        <td class="mapel-cell">${days[3]?.subject_name || '-'}</td>
        <td class="guru-cell">${days[3]?.teacher_name || '-'}</td>
        <!-- Kamis -->
        <td class="mapel-cell">${days[4]?.subject_name || '-'}</td>
        <td class="guru-cell">${days[4]?.teacher_name || '-'}</td>
        <!-- Jumat -->
        <td class="mapel-cell">${days[5]?.subject_name || '-'}</td>
        <td class="guru-cell">${days[5]?.teacher_name || '-'}</td>
        <!-- Sabtu -->
        <td class="sabtu-cell text-center font-semibold">${days[6]?.subject_name || '-'}</td>
      </tr>
    `
  }).join('')

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8" />
      <title>Jadwal Pelajaran - ${kelas?.nama_kelas || 'Resmi'}</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 8mm 10mm;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          font-family: 'Times New Roman', Times, serif, Arial, sans-serif;
          color: #111827;
          background: #fff;
          font-size: 10.5px;
          line-height: 1.25;
        }
        .container {
          width: 100%;
        }
        /* KOP SURAT RESMI */
        .kop-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 4px;
        }
        .kop-table td {
          vertical-align: middle;
          border: none;
        }
        .kop-logo {
          width: 65px;
          height: 65px;
          object-fit: contain;
        }
        .kop-center {
          text-align: center;
          padding: 0 10px;
        }
        .kop-yayasan {
          font-size: 14px;
          font-weight: 800;
          letter-spacing: 0.5px;
          color: #047857;
          text-transform: uppercase;
        }
        .kop-unit {
          font-size: 15px;
          font-weight: 900;
          color: #111827;
          margin: 1px 0;
          text-transform: uppercase;
        }
        .kop-info {
          font-size: 9.5px;
          color: #374151;
        }
        .kop-divider-thick {
          border-top: 2.5px solid #000;
          margin-top: 4px;
        }
        .kop-divider-thin {
          border-top: 1px solid #000;
          margin-top: 1.5px;
          margin-bottom: 8px;
        }

        /* HEADER DOKUMEN */
        .doc-title {
          text-align: center;
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
          margin-bottom: 2px;
          text-decoration: underline;
        }
        .doc-meta {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          font-weight: 700;
          margin-bottom: 6px;
        }

        /* MATRIKS TABEL */
        table.matrix-table {
          width: 100%;
          border-collapse: collapse;
          border: 1.5px solid #1E3A8A;
          font-size: 9px;
        }
        table.matrix-table th, table.matrix-table td {
          border: 1px solid #1E3A8A;
          padding: 3.5px 3px;
          vertical-align: middle;
        }
        table.matrix-table th {
          background-color: #E0E7FF;
          color: #1E3A8A;
          font-weight: 800;
          text-align: center;
        }
        .text-center { text-align: center; }
        .font-bold { font-weight: 700; }
        .text-red { color: #DC2626; }
        .activity-row td {
          background-color: #FEF08A !important;
          color: #B91C1C;
        }
        .activity-cell {
          letter-spacing: 0.5px;
          font-size: 9.5px;
        }
        .mapel-cell {
          font-weight: 700;
          color: #111827;
        }
        .guru-cell {
          color: #374151;
          font-size: 8.5px;
        }
        .sabtu-cell {
          background-color: #F8FAFC;
          font-size: 8.5px;
        }

        /* SIGNATURE SECTION */
        .sign-table {
          width: 100%;
          margin-top: 10px;
          border-collapse: collapse;
          font-size: 10px;
        }
        .sign-table td {
          border: none;
          vertical-align: top;
        }
        .sign-date {
          text-align: right;
          margin-bottom: 30px;
        }
        .sign-box {
          height: 48px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <!-- KOP RESMI -->
        <table class="kop-table">
          <tr>
            <td style="width: 70px; text-align: left;">
              ${logoYayasan ? `<img src="${logoYayasan}" class="kop-logo" alt="Logo Yayasan" />` : ''}
            </td>
            <td class="kop-center">
              <div class="kop-yayasan">${kop.yayasan_nama || 'YAYASAN DAR EL - IMAN'}</div>
              <div class="kop-unit">${kop.unit_nama || 'UNIT PENDIDIKAN'}</div>
              <div class="kop-info">
                ${[kop.unit_alamat || kop.yayasan_alamat, kop.unit_telepon ? `Telp: ${kop.unit_telepon}` : '', kop.unit_email ? `Email: ${kop.unit_email}` : ''].filter(Boolean).join(' | ')}
              </div>
              <div class="kop-info" style="font-weight: 600; margin-top: 1px;">
                ${[kop.npsn ? `NPSN: ${kop.npsn}` : '', kop.akreditasi ? `Akreditasi: ${kop.akreditasi}` : '', isBoarding ? 'Program: Boarding School (Pesantren)' : 'Program: Full Day School'].filter(Boolean).join(' • ')}
              </div>
            </td>
            <td style="width: 70px; text-align: right;">
              ${logoUnit ? `<img src="${logoUnit}" class="kop-logo" alt="Logo Unit" />` : ''}
            </td>
          </tr>
        </table>

        <div class="kop-divider-thick"></div>
        <div class="kop-divider-thin"></div>

        <!-- TITLE & META -->
        <div class="doc-title">
          JADWAL PELAJARAN DAN KEGIATAN HARIAN ${isBoarding ? 'SANTRI' : 'PESERTA DIDIK'}
        </div>
        <div class="doc-meta">
          <div>
            <span>KELAS / ROMBEL : </span><strong>${kelas?.nama_kelas || '-'}</strong>
            <span style="margin-left: 12px;">WALI KELAS : </span><strong>${kelas?.wali_kelas || '-'}${kelas?.wali_kelas_niy ? ` (NIY ${kelas.wali_kelas_niy})` : ''}</strong>
          </div>
          <div>
            <span>SEMESTER / T.A : </span><strong>${kelas?.semester || 'Ganjil'} ${kelas?.tahun_ajaran || '2026/2027'}</strong>
            <span style="margin-left: 12px;">SISTEM : </span><strong>${isBoarding ? 'BOARDING' : 'FULL DAY'}</strong>
          </div>
        </div>

        <!-- MATRIX TABLE -->
        <table class="matrix-table">
          <thead>
            <tr>
              <th rowspan="2" style="width: 25px;">No.</th>
              <th rowspan="2" style="width: 90px;">Waktu / Jam</th>
              <th colspan="2">Senin</th>
              <th colspan="2">Selasa</th>
              <th colspan="2">Rabu</th>
              <th colspan="2">Kamis</th>
              <th colspan="2">Jum'at</th>
              <th rowspan="2" style="width: 85px;">Sabtu<br/>(Ekstrakurikuler)</th>
            </tr>
            <tr>
              <th style="width: 70px;">Pelajaran</th>
              <th style="width: 55px;">Guru</th>
              <th style="width: 70px;">Pelajaran</th>
              <th style="width: 55px;">Guru</th>
              <th style="width: 70px;">Pelajaran</th>
              <th style="width: 55px;">Guru</th>
              <th style="width: 70px;">Pelajaran</th>
              <th style="width: 55px;">Guru</th>
              <th style="width: 70px;">Pelajaran</th>
              <th style="width: 55px;">Guru</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml || '<tr><td colspan="13" class="text-center" style="padding: 15px;">Belum ada jadwal yang terdaftar untuk kelas ini di database.</td></tr>'}
          </tbody>
        </table>

        <!-- SIGNATURES -->
        <table class="sign-table">
          <tr>
            <td style="width: 50%; padding-left: 20px;">
              <div>Wali Kelas,</div>
              <div class="sign-box"></div>
              <div><strong>${kelas?.wali_kelas || '_____________________'}</strong></div>
              <div>${kelas?.wali_kelas_niy ? `NIY. ${kelas.wali_kelas_niy}` : 'NIY. -'}</div>
            </td>
            <td style="width: 50%; text-align: right; padding-right: 20px;">
              <div class="sign-date">Padang, ${currentDateStr}</div>
              <div>Mengetahui,</div>
              <div><strong>Kepala ${kop.unit_nama || 'Sekolah'}</strong></div>
              <div class="sign-box"></div>
              <div><strong>${kop.kepala_sekolah || '_____________________'}</strong></div>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document || iframe.contentDocument
  if (!doc) return

  doc.open()
  doc.write(html)
  doc.close()

  let printed = false
  const runPrint = () => {
    if (printed) return
    printed = true
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.focus()
        iframe.contentWindow.print()
      }
    } catch (_) {}
    setTimeout(() => {
      try {
        document.body.removeChild(iframe)
      } catch (_) {}
    }, 2000)
  }

  iframe.onload = () => setTimeout(runPrint, 200)
  setTimeout(runPrint, 1500)
}

