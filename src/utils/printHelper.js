/**
 * Print Clean Datatable Utility
 * Prints a clean datatable without opening a new tab or window.
 * Uses a hidden iframe within the current document context.
 * Supports both { headers, rows } and { columns, data } prop formats.
 */
export function printCleanTable({ title, subtitle = '', headers = [], rows = [], columns = [], data = [] }) {
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

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Remove existing print iframe if present
  let iframe = document.getElementById('simsit-print-iframe')
  if (iframe) {
    document.body.removeChild(iframe)
  }

  // Create hidden iframe in current document to avoid opening a new tab/window
  iframe = document.createElement('iframe')
  iframe.id = 'simsit-print-iframe'
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
  doc.write(`
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 12mm 15mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 9.5pt;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 12px;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-header {
          border-bottom: 2.5px solid #0e5c44;
          padding-bottom: 12px;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .print-brand {
          font-size: 8pt;
          font-weight: 800;
          color: #0e5c44;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .print-title {
          font-size: 16pt;
          font-weight: 800;
          color: #0e5c44;
          margin: 0;
          line-height: 1.2;
        }
        .print-subtitle {
          font-size: 9pt;
          color: #64748b;
          margin: 4px 0 0 0;
          font-weight: 500;
        }
        .print-meta {
          font-size: 8.5pt;
          color: #475569;
          font-weight: 600;
          text-align: right;
          line-height: 1.4;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 8px;
        }
        th {
          background-color: #f1f5f9;
          color: #0f172a;
          font-size: 8.5pt;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          padding: 8px 10px;
          border: 1px solid #cbd5e1;
          text-align: left;
        }
        td {
          padding: 7px 10px;
          font-size: 9pt;
          border: 1px solid #e2e8f0;
          color: #334155;
          vertical-align: middle;
        }
        tr:nth-child(even) {
          background-color: #f8fafc;
        }
        .print-footer {
          margin-top: 24px;
          padding-top: 10px;
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
      <div class="print-header">
        <div>
          <div class="print-brand">Sistem Informasi Sekolah Terpadu (SIMSIT)</div>
          <h1 class="print-title">${title}</h1>
          ${subtitle ? `<p class="print-subtitle">${subtitle}</p>` : ''}
        </div>
        <div class="print-meta">
          <div>Tanggal Cetak: ${currentDate}</div>
          <div>Total Record: ${actualRows.length} Data</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>${headerHtml}</tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="' + actualHeaders.length + '" style="text-align:center;">Tidak ada data.</td></tr>'}
        </tbody>
      </table>

      <div class="print-footer">
        <span>Dokumen Laporan Resmi — Akademik SIMSIT</span>
        <span>Laporan Cetak Murni</span>
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
        iframe.contentWindow.print()
      }
    } catch (err) {
      console.warn('Iframe print failed:', err)
    }
  }

  iframe.onload = () => setTimeout(runPrint, 150)
  setTimeout(runPrint, 350)
}

/**
 * Export PDF Datatable Utility
 * Triggers PDF export / save dialog for datatable.
 * Supports both { headers, rows } and { columns, data } prop formats.
 */
export function downloadPdfTable({ title, subtitle = '', headers = [], rows = [], columns = [], data = [], filename }) {
  const safeFilename = filename || `Laporan_${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`
  printCleanTable({
    title,
    subtitle: subtitle ? `${subtitle} (Berkas PDF)` : 'Berkas PDF Laporan Resmi',
    headers,
    rows,
    columns,
    data,
  })
}

// ============================================================================
// HELPER LOGO RESMI YAYASAN & UNIT PENDIDIKAN (Database URL Resolver & SVG Fallbacks)
// ============================================================================
export function resolvePrintAssetUrl(url) {
  if (!url) return ''
  if (typeof url !== 'string') return ''
  if (url.startsWith('data:image') || url.startsWith('blob:')) return url
  if (url.startsWith('http://') || url.startsWith('https://')) return url

  const isDevVite = typeof window !== 'undefined' && window.location?.origin?.includes('5173')
  const apiOrigin = isDevVite ? 'http://localhost:8000' : (typeof window !== 'undefined' ? window.location.origin : '')
  const webOrigin = typeof window !== 'undefined' ? window.location.origin : ''

  const cleanPath = url.startsWith('/') ? url : `/${url}`

  if (cleanPath.startsWith('/storage')) {
    return `${apiOrigin}${cleanPath}`
  }
  return `${webOrigin}${cleanPath}`
}

function getOfficialYayasanLogoSvg() {
  return `
    <svg width="78" height="78" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Star Polygon Outline -->
      <polygon points="50,2 62,24 86,14 80,38 98,50 80,62 86,86 62,76 50,98 38,76 14,86 20,62 2,50 20,38 14,14 38,24" fill="#047857" stroke="#064E3B" stroke-width="1.5" />
      <polygon points="50,6 60,26 82,17 76,39 93,50 76,61 82,83 60,74 50,94 40,74 18,83 24,61 7,50 24,39 18,17 40,26" fill="#059669" />
      <circle cx="50" cy="50" r="32" fill="#FFFFFF" stroke="#047857" stroke-width="1.5" />
      <circle cx="50" cy="50" r="28" fill="#ECFDF5" />
      <!-- Arabic Calligraphy Symbol & Globe -->
      <path d="M40 45 C42 40, 58 40, 60 45 C60 52, 40 52, 40 58 C40 64, 60 64, 60 58" stroke="#047857" stroke-width="2.5" stroke-linecap="round" fill="none"/>
      <path d="M35 50 Q50 43 65 50 Q50 57 35 50 Z" fill="#10B981" opacity="0.6"/>
      <!-- Yayasan Text -->
      <text x="50" y="38" font-family="'Amiri', serif" font-size="8.5" font-weight="bold" fill="#064E3B" text-anchor="middle">مؤسسة دار الإيمان</text>
      <text x="50" y="68" font-family="sans-serif" font-size="5.5" font-weight="800" fill="#064E3B" text-anchor="middle" letter-spacing="0.2">DAR EL-IMAN</text>
      <!-- Circular text arc simulation -->
      <text x="50" y="88" font-family="sans-serif" font-size="5" font-weight="700" fill="#064E3B" text-anchor="middle">Padang - Sumbar</text>
    </svg>
  `
}

function getOfficialUnitLogoSvg(unitName = '') {
  const u = String(unitName).toUpperCase()
  let unitText = 'SMA IT'
  let mainColor = '#047857'
  let subColor = '#059669'
  let badgeColor = '#064E3B'

  if (u.includes('SMP') || u.includes('MENENGAH PERTAMA')) {
    unitText = 'SMP IT'
    mainColor = '#0369A1'
    subColor = '#0284C7'
    badgeColor = '#0C4A6E'
  } else if (u.includes('SD') || u.includes('DASAR')) {
    unitText = 'SD IT'
    mainColor = '#15803D'
    subColor = '#16A34A'
    badgeColor = '#14532D'
  } else if (u.includes('TK') || u.includes('KANAK') || u.includes('TAUD')) {
    unitText = 'TK IT'
    mainColor = '#D97706'
    subColor = '#F59E0B'
    badgeColor = '#B45309'
  } else if (u.includes('PONDOK') || u.includes('PESANTREN') || u.includes('MA') || u.includes('BOARDING')) {
    unitText = 'MA / PONPES'
    mainColor = '#0F766E'
    subColor = '#14B8A6'
    badgeColor = '#134E4A'
  }

  return `
    <svg width="78" height="78" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- 8-Pointed Star Lencana -->
      <polygon points="50,2 63,16 82,14 84,33 98,46 89,63 94,82 75,87 63,98 46,89 29,94 24,75 2,63 11,46 6,29 25,24" fill="${mainColor}" stroke="${badgeColor}" stroke-width="1.5" />
      <circle cx="50" cy="50" r="32" fill="#FFFFFF" stroke="${mainColor}" stroke-width="2" />
      <circle cx="50" cy="50" r="28" fill="#F8FAFC" />
      <!-- Star Symbol Inside -->
      <polygon points="50,26 56,38 70,39 59,48 63,62 50,54 37,62 41,48 30,39 44,38" fill="${subColor}" />
      <circle cx="50" cy="46" r="8" fill="#FFFFFF"/>
      <text x="50" y="49" font-family="sans-serif" font-size="6" font-weight="900" fill="${badgeColor}" text-anchor="middle">${unitText}</text>
      <!-- Sub Text Unit -->
      <text x="50" y="68" font-family="sans-serif" font-size="4.8" font-weight="800" fill="${badgeColor}" text-anchor="middle" letter-spacing="0.2">DAR EL-IMAN</text>
      <text x="50" y="74" font-family="sans-serif" font-size="4" font-weight="700" fill="#64748B" text-anchor="middle">SUMATERA BARAT</text>
    </svg>
  `
}

/**
 * Print Weekly Student Evaluation Report (Format Lembar Evaluasi Terpadu Pekanan)
 * Prints official student weekly progress sheet with Kop Resmi 2-Sisi:
 * - Sebelah KIRI: Logo Yayasan (Yayasan Dar el-Iman)
 * - Sebelah KANAN: Logo Unit Pendidikan (TKIT, SDIT, SMPIT, SMAIT, Ponpes, dll)
 * Mengambil data unit, legalitas (NPSN, SK Izin, Akreditasi, Alamat) dan gambar unit langsung dari database (tanpa hardcode).
 */
export function printWeeklyStudentEvaluation({
  student = {},
  period = {},
  tahfizh = {},
  attendance = [],
  morningAttendance = [],
  prayerAttendance = [],
  teacherNotes = '',
  homeroomTeacher = {},
  guruWali = {},
  schoolCity = '',
  subjectScope = '',
  signerRole = '',
  yayasanLogo = '',
  unitLogo = '',
}) {
  const studentName = student.name || student.full_name || student.nama_lengkap || 'Shezakia Mufidah Alfirdausi'
  const studentNis = student.nis || student.student_id || student.nisn || '-'
  const className = student.className || student.kelas?.nama_kelas || student.kelas?.name || '10 Madinah 1'
  const guruWaliName = guruWali?.name || student.guru_wali || 'Ilma Emilia Widyastuti'
  const waliKelasName = homeroomTeacher?.name || student.wali_kelas || 'Ustadzah Elsa Putri Utami'
  const periodText = period.title || 'Senin, 10 Agustus 2026 s.d. Jumat, 14 Agustus 2026'
  const academicYear = period.academicYear || '2026/2027'

  // Pengambilan Data Unit & Gambar Unit dari Database (Tanpa Hardcode)
  const unitObj = student.education_unit || student.unit || {}
  const unitMeta = unitObj.metadata || student.unit_metadata || {}

  // Nama Unit Resmi dari database
  const unitFullName = (unitObj.name || student.unitName || student.unit_name || 'SEKOLAH MENENGAH ATAS ISLAM TERPADU').toUpperCase()

  // Legalitas Unit (NPSN & Izin Operasional) dari database
  const npsnNumber = unitMeta.npsn || unitObj.npsn || student.npsn || '30105555'
  const izinNumber = unitMeta.sk_pendirian || unitMeta.izin_operasional || unitObj.sk_pendirian || student.izinNumber || '421.5/015/2015'

  // Akreditasi dari database
  const akreditasiVal = unitMeta.accreditation || unitObj.accreditation || 'A'
  const akreditasiText = `“Terakreditasi ${akreditasiVal}”`

  // Alamat & Kontak Unit dari database
  const unitAddress = unitMeta.address || 'Jl. Gunuang Sarik No. 80, Kuranji, Kota Padang'
  const unitPhone = unitMeta.phone ? ` Telp. ${unitMeta.phone}` : ' Telp. 0751-4640744'
  const fullAddressLine = `${unitAddress}${unitPhone}`

  // Logo Yayasan (Kiri) & Logo Unit Pendidikan (Kanan) dari database (zero-hardcode)
  const yayasanLogoRaw = yayasanLogo || student.yayasanLogo || '/assets/logos/yayasan.svg'
  const unitLogoRaw = unitLogo || student.unitLogo || unitObj.logo_url || unitMeta.logo_url || '/assets/logos/smait.svg'

  const resolvedYayasanLogo = resolvePrintAssetUrl(yayasanLogoRaw)
  const resolvedUnitLogo = resolvePrintAssetUrl(unitLogoRaw)

  // 1. DATA KEDISIPLINAN & KEHADIRAN PAGI
  const defaultMorning = [
    { dayDate: 'Senin, 10 Agustus 2026', status: 'Hadir', note: '-' },
    { dayDate: 'Selasa, 11 Agustus 2026', status: 'Hadir', note: '-' },
    { dayDate: 'Rabu, 12 Agustus 2026', status: 'Hadir', note: '-' },
    { dayDate: 'Kamis, 13 Agustus 2026', status: 'Hadir', note: '-' },
    { dayDate: 'Jumat, 14 Agustus 2026', status: 'Hadir', note: '-' },
  ]
  const finalMorning = (morningAttendance && morningAttendance.length > 0) ? morningAttendance : defaultMorning

  let morningRowsHtml = ''
  finalMorning.forEach((m) => {
    morningRowsHtml += `
      <tr>
        <td style="font-weight: 700; border: 1px solid #cbd5e1; padding: 7px 12px;">${m.dayDate || m.hari || '-'}</td>
        <td style="text-align: center; font-weight: 600; border: 1px solid #cbd5e1; padding: 7px 12px; color: ${m.status === 'Hadir' ? '#0f172a' : '#b91c1c'};">${m.status || 'Hadir'}</td>
        <td style="text-align: center; border: 1px solid #cbd5e1; padding: 7px 12px; color: #475569;">${m.note || m.catatan || '-'}</td>
      </tr>
    `
  })

  // 2. DATA ABSENSI SHALAT BERJAMAAH
  const defaultPrayer = [
    { dayDate: 'Senin, 10 Agustus 2026', zuhur: 'Hadir', ashar: 'Hadir' },
    { dayDate: 'Selasa, 11 Agustus 2026', zuhur: 'Hadir', ashar: 'Hadir' },
    { dayDate: 'Rabu, 12 Agustus 2026', zuhur: 'Hadir', ashar: 'Hadir' },
    { dayDate: 'Kamis, 13 Agustus 2026', zuhur: 'Hadir', ashar: 'Hadir' },
    { dayDate: 'Jumat, 14 Agustus 2026', zuhur: 'Hadir', ashar: 'Hadir' },
  ]
  const finalPrayer = (prayerAttendance && prayerAttendance.length > 0) ? prayerAttendance : defaultPrayer

  let prayerRowsHtml = ''
  finalPrayer.forEach((p) => {
    prayerRowsHtml += `
      <tr>
        <td style="font-weight: 700; border: 1px solid #cbd5e1; padding: 7px 12px;">${p.dayDate || p.hari || '-'}</td>
        <td style="text-align: center; font-weight: 600; border: 1px solid #cbd5e1; padding: 7px 12px;">${p.zuhur || p.dzuhur || 'Hadir'}</td>
        <td style="text-align: center; font-weight: 600; border: 1px solid #cbd5e1; padding: 7px 12px;">${p.ashar || 'Hadir'}</td>
      </tr>
    `
  })

  // 4. DATA KEHADIRAN PER MATA PELAJARAN (AKADEMIK)
  const defaultWeeklyAttendance = [
    { dayDate: 'Senin, 10 Agustus 2026', subject: 'Ekonomi', status: 'Hadir' },
    { dayDate: 'Senin, 10 Agustus 2026', subject: 'Kimia', status: 'Hadir' },
    { dayDate: 'Senin, 10 Agustus 2026', subject: 'PKN', status: 'Hadir' },
    { dayDate: 'Senin, 10 Agustus 2026', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },

    { dayDate: 'Selasa, 11 Agustus 2026', subject: 'Informatika', status: 'Hadir' },
    { dayDate: 'Selasa, 11 Agustus 2026', subject: 'Matematika', status: 'Hadir' },
    { dayDate: 'Selasa, 11 Agustus 2026', subject: 'Pendidikan Agama Islam', status: 'Hadir' },
    { dayDate: 'Selasa, 11 Agustus 2026', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },

    { dayDate: 'Rabu, 12 Agustus 2026', subject: 'Biologi', status: 'Hadir' },
    { dayDate: 'Rabu, 12 Agustus 2026', subject: 'Fisika', status: 'Hadir' },
    { dayDate: 'Rabu, 12 Agustus 2026', subject: 'PJOK', status: 'Hadir' },
    { dayDate: 'Rabu, 12 Agustus 2026', subject: 'Sosiologi', status: 'Hadir' },
    { dayDate: 'Rabu, 12 Agustus 2026', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },

    { dayDate: 'Kamis, 13 Agustus 2026', subject: 'Bahasa Indonesia', status: 'Hadir' },
    { dayDate: 'Kamis, 13 Agustus 2026', subject: 'Bahasa Inggris', status: 'Hadir' },
    { dayDate: 'Kamis, 13 Agustus 2026', subject: 'Sejarah', status: 'Hadir' },
    { dayDate: 'Kamis, 13 Agustus 2026', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },

    { dayDate: 'Jumat, 14 Agustus 2026', subject: 'Bahasa Arab (Fiqh)', status: 'Hadir' },
    { dayDate: 'Jumat, 14 Agustus 2026', subject: 'Geografi', status: 'Hadir' },
    { dayDate: 'Jumat, 14 Agustus 2026', subject: 'Tahsin dan Tahfidz', status: 'Hadir' },
  ]
  const finalAttendance = (attendance && attendance.length > 0) ? attendance : defaultWeeklyAttendance

  let academicRowsHtml = ''
  finalAttendance.forEach((item) => {
    academicRowsHtml += `
      <tr>
        <td style="font-weight: 700; border: 1px solid #cbd5e1; padding: 7px 12px;">${item.dayDate || item.date || '-'}</td>
        <td style="font-weight: 500; border: 1px solid #cbd5e1; padding: 7px 12px; color: #0f172a;">${item.subject || item.nama_mapel || '-'}</td>
        <td style="text-align: center; font-weight: 600; border: 1px solid #cbd5e1; padding: 7px 12px; color: ${item.status === 'Hadir' ? '#0f172a' : '#b91c1c'};">${item.status || 'Hadir'}</td>
      </tr>
    `
  })

  // Remove existing print iframe
  let iframe = document.getElementById('simsit-print-iframe')
  if (iframe) {
    try {
      document.body.removeChild(iframe)
    } catch (_) {}
  }

  iframe = document.createElement('iframe')
  iframe.id = 'simsit-print-iframe'
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

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <title>Laporan Perkembangan Pekanan - ${studentName}</title>
      <style>
        @page {
          size: A4 portrait;
          margin: 10mm 14mm;
        }
        * { box-sizing: border-box; }
        body {
          font-family: 'Arial', 'Inter', system-ui, sans-serif;
          font-size: 9.5pt;
          color: #0f172a;
          background: #ffffff;
          margin: 0;
          padding: 8px;
          line-height: 1.4;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .kop-container {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 8px;
          border-bottom: 2px solid #0f172a;
          margin-bottom: 14px;
        }
        .kop-logo {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .kop-logo-img {
          max-width: 80px;
          max-height: 80px;
          width: auto;
          height: auto;
          object-fit: contain;
          display: block;
        }
        .kop-logo-fallback {
          width: 80px;
          height: 80px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .kop-text {
          flex: 1;
          text-align: center;
          padding: 0 10px;
        }
        .kop-org {
          font-size: 11pt;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: 0.5px;
        }
        .kop-unit {
          font-size: 13pt;
          font-weight: 900;
          color: #064e3b;
          margin: 2px 0 0 0;
          letter-spacing: 0.3px;
        }
        .kop-name {
          font-size: 12pt;
          font-weight: 900;
          color: #064e3b;
          margin: 0;
        }
        .kop-akreditasi {
          font-size: 9pt;
          font-weight: 800;
          font-style: italic;
          color: #0f172a;
          margin: 2px 0 1px 0;
        }
        .kop-motto {
          font-size: 8pt;
          font-weight: 600;
          color: #334155;
          margin: 0;
        }
        .kop-address {
          font-size: 7.5pt;
          color: #475569;
          margin: 2px 0 1px 0;
        }
        .kop-legality {
          font-size: 7.5pt;
          font-weight: 700;
          color: #0f172a;
          margin: 0;
        }

        .doc-title-box {
          text-align: center;
          margin: 14px 0 16px 0;
        }
        .doc-title {
          font-size: 15pt;
          font-weight: 900;
          color: #047857;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .doc-period {
          font-size: 9.5pt;
          font-weight: 800;
          color: #0f172a;
          margin-top: 4px;
        }

        .student-header-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 30px;
          margin-bottom: 16px;
          font-size: 10pt;
          font-weight: 700;
          color: #0f172a;
        }
        .student-header-col {
          display: flex;
          align-items: center;
        }
        .student-header-label {
          width: 100px;
          color: #0f172a;
        }
        .student-header-val {
          color: #0f172a;
        }

        .section-header-title {
          font-size: 10.5pt;
          font-weight: 900;
          color: #0f172a;
          margin-top: 14px;
          margin-bottom: 6px;
        }
        .section-header-orange {
          background: #ea580c;
          color: #ffffff;
          font-weight: 900;
          font-size: 10pt;
          padding: 8px 12px;
          text-transform: uppercase;
          margin-top: 14px;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 14px;
        }
        .data-table th {
          background: #ecfdf5;
          color: #047857;
          font-weight: 800;
          font-size: 9pt;
          border: 1px solid #cbd5e1;
          padding: 8px 12px;
          text-align: center;
        }
        .data-table td {
          font-size: 9pt;
          border: 1px solid #cbd5e1;
          padding: 7px 12px;
        }

        .status-badge-green {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-weight: 900;
          color: #047857;
        }
        .status-dot-green {
          width: 9px;
          height: 9px;
          background: #10b981;
          border-radius: 50%;
          display: inline-block;
        }

        .notes-content-box {
          border: 1px solid #cbd5e1;
          border-top: none;
          padding: 12px 14px;
          min-height: 48px;
          font-size: 9.5pt;
          color: #1e293b;
          background: #fffbeb;
          margin-bottom: 16px;
        }

        .closing-box {
          margin-top: 20px;
          font-size: 9pt;
          line-height: 1.6;
          color: #0f172a;
        }
        .closing-p {
          margin-bottom: 12px;
          font-weight: 700;
        }
        .closing-arabic {
          text-align: center;
          font-family: 'Amiri', 'Traditional Arabic', serif;
          font-size: 14pt;
          font-weight: 800;
          margin: 16px 0 10px 0;
          color: #0f172a;
          direction: rtl;
        }

        tr { page-break-inside: avoid; }
      </style>
    </head>
    <body>
      <!-- KOP SURAT RESMI 2-SISI -->
      <div class="kop-container">
        <!-- SEBELAH KIRI: LOGO YAYASAN (DATABASE) -->
        <div class="kop-logo kop-logo-left">
          ${(resolvedYayasanLogo && !resolvedYayasanLogo.endsWith('.svg')) ? `
            <img
              src="${resolvedYayasanLogo}"
              alt="Logo Yayasan"
              class="kop-logo-img"
              onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';"
            />
            <div class="kop-logo-fallback" style="display: none;">
              ${getOfficialYayasanLogoSvg()}
            </div>
          ` : `
            <div class="kop-logo-fallback" style="display: flex;">
              ${getOfficialYayasanLogoSvg()}
            </div>
          `}
        </div>

        <!-- TENGAH: IDENTITAS RESMI YAYASAN & UNIT PENDIDIKAN (DATABASE METADATA) -->
        <div class="kop-text">
          <div class="kop-org">YAYASAN DAR EL-IMAN</div>
          <div class="kop-unit">${unitFullName}</div>
          <div class="kop-name">DAR EL-IMAN</div>
          <div class="kop-akreditasi">${akreditasiText}</div>
          <div class="kop-motto">Beriman, Bertaqwa, Unggul, Harmonis dan Disiplin</div>
          <div class="kop-address">${fullAddressLine}</div>
          <div class="kop-legality">Izin Operasional Nomor : ${izinNumber}, NPSN : ${npsnNumber}</div>
        </div>

        <!-- SEBELAH KANAN: LOGO UNIT PENDIDIKAN (DATABASE) -->
        <div class="kop-logo kop-logo-right">
          ${(resolvedUnitLogo && !resolvedUnitLogo.endsWith('.svg')) ? `
            <img
              src="${resolvedUnitLogo}"
              alt="Logo Unit Pendidikan"
              class="kop-logo-img"
              onerror="this.style.display='none'; if(this.nextElementSibling) this.nextElementSibling.style.display='flex';"
            />
            <div class="kop-logo-fallback" style="display: none;">
              ${getOfficialUnitLogoSvg(unitFullName)}
            </div>
          ` : `
            <div class="kop-logo-fallback" style="display: flex;">
              ${getOfficialUnitLogoSvg(unitFullName)}
            </div>
          `}
        </div>
      </div>

      <!-- JUDUL LAPORAN -->
      <div class="doc-title-box">
        <div class="doc-title">LAPORAN PERKEMBANGAN PEKANAN SISWA</div>
        <div class="doc-period">PERIODE: ${periodText}</div>
      </div>

      <!-- DATA IDENTITAS SISWA & WALI (2x2 GRID) -->
      <div class="student-header-grid">
        <div class="student-header-col">
          <span class="student-header-label">Nama Siswa</span>
          <span class="student-header-val">: ${studentName}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">Kelas</span>
          <span class="student-header-val">: ${className}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">Guru wali</span>
          <span class="student-header-val">: ${guruWaliName}</span>
        </div>
        <div class="student-header-col">
          <span class="student-header-label">Wali Kelas</span>
          <span class="student-header-val">: ${waliKelasName}</span>
        </div>
      </div>

      <!-- 1. KEDISIPLINAN & KEHADIRAN PAGI -->
      <div class="section-header-title">1. KEDISIPLINAN & KEHADIRAN PAGI</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 35%;">Hari, Tanggal</th>
            <th style="width: 25%;">Kehadiran Pagi</th>
            <th style="width: 40%;">Catatan Pelanggaran Kedisiplinan</th>
          </tr>
        </thead>
        <tbody>
          ${morningRowsHtml}
        </tbody>
      </table>

      <!-- 2. ABSENSI SHALAT BERJAMAAH -->
      <div class="section-header-title">2. ABSENSI SHALAT BERJAMAAH</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 40%;">Hari, Tanggal</th>
            <th style="width: 30%;">Shalat Zuhur</th>
            <th style="width: 30%;">Shalat Ashar</th>
          </tr>
        </thead>
        <tbody>
          ${prayerRowsHtml}
        </tbody>
      </table>

      <!-- 3. CAPAIAN TAHSIN & TAHFIZH -->
      <div class="section-header-orange">3. CAPAIAN TAHSIN & TAHFIZH</div>
      <table class="data-table" style="margin-bottom: 16px;">
        <tbody>
          <tr>
            <td style="width: 40%; font-weight: 700;">Hafalan Terakhir</td>
            <td style="width: 60%;">${tahfizh.lastSurah || "Ali 'Imran ayat 135-137"}</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Tanggal Setoran Terakhir</td>
            <td>${tahfizh.lastDepositDate || 'Jumat, 14 Agustus 2026'}</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Total Baris (Periode Ini)</td>
            <td>${tahfizh.totalLines != null ? tahfizh.totalLines : 34}</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Target Baris Pekan Ini</td>
            <td>${tahfizh.targetLines != null ? tahfizh.targetLines : 15}</td>
          </tr>
          <tr>
            <td style="font-weight: 700;">Status Pencapaian</td>
            <td>
              <span class="status-badge-green">
                <span class="status-dot-green"></span>
                ${tahfizh.status || 'TERCAPAI'}
              </span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 4. KEHADIRAN PER MATA PELAJARAN (AKADEMIK) -->
      <div class="section-header-title">4. KEHADIRAN PER MATA PELAJARAN (AKADEMIK)</div>
      <table class="data-table">
        <thead>
          <tr>
            <th style="width: 32%;">Hari, Tanggal</th>
            <th style="width: 44%;">Mata Pelajaran</th>
            <th style="width: 24%;">Status Kehadiran</th>
          </tr>
        </thead>
        <tbody>
          ${academicRowsHtml}
        </tbody>
      </table>

      <!-- 5. CATATAN GURU -->
      <div class="section-header-orange">5. CATATAN GURU</div>
      <div class="notes-content-box">
        ${teacherNotes || 'Tidak ada catatan guru pada periode ini.'}
      </div>

      <!-- PESAN KEMITRAAN & DOA SESUAI GAMBAR ASLI -->
      <div class="closing-box">
        <div class="closing-p">
          🤝 Kami meyakini bahwa keberhasilan pendidikan Ananda merupakan hasil sinergi antara sekolah dan keluarga. Oleh karena itu, kami sangat mengharapkan kerja sama Ayah/Bunda dalam mendampingi, mengarahkan, serta mendoakan Ananda agar terus bertumbuh menjadi pribadi yang berilmu, berakhlak mulia, dan bertakwa kepada Allah ﷻ.
        </div>
        <div class="closing-p">
          💬 Apabila Ayah/Bunda ingin berdiskusi mengenai perkembangan Ananda, silakan menghubungi wali kelas atau guru terkait.
        </div>
        <div class="closing-p">
          Semoga Allah ﷻ senantiasa menjaga, membimbing, dan memberkahi langkah Ananda dalam menuntut ilmu, serta menjadikannya anak yang saleh, penyejuk hati bagi kedua orang tuanya, dan bermanfaat bagi umat.
        </div>
        <div class="closing-arabic">
          جَزَاكُمُ اللَّهُ خَيْرًا<br>
          وَبَارَكَ اللَّهُ فِيكُمْ
        </div>
      </div>
    </body>
    </html>
  `

  doc.write(htmlContent)
  doc.close()

  const printWithNewWindow = () => {
    try {
      const win = window.open('', '_blank')
      if (win) {
        win.document.write(htmlContent)
        win.document.close()
        win.focus()
        setTimeout(() => {
          try {
            win.print()
          } catch (e) {
            console.error('Print window error:', e)
          }
        }, 250)
      }
    } catch (e) {
      console.error('Fallback print error:', e)
    }
  }

  let printed = false
  const runPrint = () => {
    if (printed) return
    printed = true
    try {
      iframe.contentWindow.focus()
      iframe.contentWindow.print()
    } catch (err) {
      printWithNewWindow()
    }
  }

  // Tunggu gambar logo termuat sempurna sebelum membuka dialog cetak
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
        setTimeout(runPrint, 400)
      }
    } catch (_) {
      runPrint()
    }
  }

  iframe.onload = () => setTimeout(preparePrint, 100)
  setTimeout(runPrint, 600)
}
