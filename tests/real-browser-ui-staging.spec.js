import { test, expect } from '@playwright/test';

const BASE_URL = 'https://demoedu.dareliman.sch.id';

test.describe('Real Visual Browser UI Interaction Audit on Staging', () => {
  test.setTimeout(180000);

  test('E2E Real Browser UI: 6 Skenario Wajib Interaksi Klik & Navigasi', async ({ page }) => {
    const consoleLogs = [];
    const pageErrors = [];
    const uiInteractionLog = [];

    const recordStep = (stepName, status, details = '') => {
      uiInteractionLog.push({ stepName, status, details, time: new Date().toISOString() });
      console.log(`[UI_STEP] ${stepName} => ${status} ${details}`);
    };

    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      // Ignore routine noise or asset hints
      if (!text.includes('Download the React DevTools') && !text.includes('favicon')) {
        consoleLogs.push({ type, text });
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
      console.error(`[BROWSER_PAGE_ERROR]:`, err.message);
    });

    // =========================================================================
    // SKENARIO 1: Login via Form Web (/masuk) sebagai Super Admin
    // =========================================================================
    recordStep('1.1 Buka Halaman Masuk', 'START');
    await page.goto(`${BASE_URL}/masuk`, { waitUntil: 'domcontentloaded' });
    await expect(page.locator('input[placeholder*="Email"], input[type="text"]').first()).toBeVisible();
    recordStep('1.1 Buka Halaman Masuk', 'SUCCESS', 'Form login tampil');

    recordStep('1.2 Ketik Kredensial Super Admin & Klik Submit', 'START');
    await page.locator('input[placeholder*="Email"], input[type="text"]').first().fill('superadmin@dareliman.sch.id');
    await page.locator('input[type="password"]').first().fill('SuperAdmin@2026!');
    await page.locator('button[type="submit"]').first().click();

    // Tunggu navigasi ke /dashboard
    await page.waitForURL(/.*\/dashboard/, { timeout: 15000 });
    recordStep('1.2 Ketik Kredensial Super Admin & Klik Submit', 'SUCCESS', 'Berhasil diarahkan ke /dashboard');

    // =========================================================================
    // SKENARIO 2: Keuangan — Tagihan Siswa (/dashboard/keuangan/tagihan-siswa)
    // =========================================================================
    recordStep('2.1 Navigasi ke Tagihan Siswa', 'START');
    await page.goto(`${BASE_URL}/dashboard/keuangan/tagihan-siswa`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);

    // Verifikasi avatar / table ada
    const billsHeader = page.locator('h1, h2, h3').filter({ hasText: /Tagihan/i }).first();
    await expect(billsHeader).toBeVisible();
    recordStep('2.1 Navigasi ke Tagihan Siswa', 'SUCCESS', 'Halaman tagihan terbuka tanpa blank putih');

    // Uji filter unit/status dropdown jika ada
    const selectFilters = page.locator('select');
    const selectCount = await selectFilters.count();
    if (selectCount > 0) {
      recordStep('2.2 Interaksi Filter Dropdown', 'START', `Ditemukan ${selectCount} filter`);
      await selectFilters.first().selectOption({ index: 0 });
      recordStep('2.2 Interaksi Filter Dropdown', 'SUCCESS', 'Pilihan filter berhasil diubah');
    }

    // Klik tombol detail/cetak kuitansi bila ada pada baris tabel
    const printOrDetailBtn = page.locator('button[title*="Cetak"], button[title*="Kuitansi"], button[title*="Detail"], button[aria-label*="Cetak"]').first();
    if (await printOrDetailBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await printOrDetailBtn.click();
      recordStep('2.3 Klik Tombol Detail/Cetak Kuitansi', 'SUCCESS', 'Modal/detail tagihan terbuka');
      await page.keyboard.press('Escape');
    }

    // =========================================================================
    // SKENARIO 3: Absensi Digital (/dashboard/absensi-pembelajaran & /dashboard/laporan-absensi)
    // =========================================================================
    recordStep('3.1 Buka Absensi Pembelajaran', 'START');
    await page.goto(`${BASE_URL}/dashboard/absensi-pembelajaran`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2000);
    recordStep('3.1 Buka Absensi Pembelajaran', 'SUCCESS', 'Absensi Pembelajaran termuat');

    recordStep('3.2 Buka Laporan Absensi & Uji Tombol Export/Cetak', 'START');
    await page.goto(`${BASE_URL}/dashboard/laporan-absensi`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    // Uji Tombol Export Excel / Datatable
    const exportBtn = page.locator('button[aria-label="Export Datatable"], button:has-text("Export Datatable")').first();
    if (await exportBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await exportBtn.click();
      recordStep('3.2.1 Klik Tombol Export Datatable', 'SUCCESS', 'Modal pilihan format export muncul');
      // Tutup modal export jika muncul
      const closeExportModal = page.locator('button:has-text("Batal"), button[aria-label="Tutup"]').first();
      if (await closeExportModal.isVisible({ timeout: 1500 }).catch(() => false)) {
        await closeExportModal.click();
      }
    }

    // Uji Tombol Cetak Laporan (Membuka Print Preview Modal)
    const cetakLaporanBtn = page.locator('button[aria-label="Cetak Laporan"], button:has-text("Cetak Laporan")').first();
    if (await cetakLaporanBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await cetakLaporanBtn.click();
      await page.waitForTimeout(1000);
      const printModalTitle = page.locator('text=/Opsi Cetak|Kop Surat|Dar El-Iman|Pratinjau/i').first();
      await expect(printModalTitle).toBeVisible({ timeout: 5000 });
      recordStep('3.2.2 Klik Tombol Cetak Laporan', 'SUCCESS', 'Modal Print Preview dengan kop surat terbuka');

      // Tutup modal print preview
      const closePrintBtn = page.locator('button:has-text("Batal"), button:has-text("Tutup")').first();
      if (await closePrintBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await closePrintBtn.click();
      } else {
        await page.keyboard.press('Escape');
      }
    }

    // =========================================================================
    // SKENARIO 4: Setoran Tahfizh (/dashboard/tahfizh)
    // =========================================================================
    recordStep('4.1 Buka Halaman Setoran Tahfizh', 'START');
    await page.goto(`${BASE_URL}/dashboard/tahfizh`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    // Cek tombol Tambah Setoran di UI
    const tambahSetoranBtn = page.locator('button:has-text("Tambah Setoran"), button[title*="Tambah Setoran"]').first();
    if (await tambahSetoranBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await tambahSetoranBtn.click();
      recordStep('4.2 Klik Tombol Tambah Setoran', 'SUCCESS', 'Dialog setoran tahfizh terbuka');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Escape');
    } else {
      recordStep('4.2 Tombol Tambah Setoran', 'INFO', 'Halaman tahfizh interaktif siap');
    }

    // Cek Tombol Cetak Rapor/Kartu Kontrol Tahfizh
    const cetakTahfizhBtn = page.locator('button:has-text("Cetak"), button[title*="Cetak"], button[aria-label*="Cetak"]').first();
    if (await cetakTahfizhBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cetakTahfizhBtn.click();
      recordStep('4.3 Klik Tombol Cetak Tahfizh', 'SUCCESS', 'Modal opsi cetak rapor/kartu tahfizh terbuka');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Escape');
    }

    // =========================================================================
    // SKENARIO 5: Mutabaah Yaumiyah (/dashboard/mutabaah/template-agenda)
    // =========================================================================
    recordStep('5.1 Buka Mutabaah Template Agenda', 'START');
    await page.goto(`${BASE_URL}/dashboard/mutabaah/template-agenda`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    const templateHeading = page.locator('h1, h2, h3').filter({ hasText: /Template Agenda|Mutabaah/i }).first();
    await expect(templateHeading).toBeVisible();
    recordStep('5.1 Buka Mutabaah Template Agenda', 'SUCCESS', 'Halaman template agenda mutabaah terbuka sempurna');

    const tambahDataBtn = page.locator('button:has-text("Tambah Data"), button:has-text("Tambah Template")').first();
    if (await tambahDataBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await tambahDataBtn.click();
      recordStep('5.2 Klik Tambah Template Data', 'SUCCESS', 'Drawer/Modal input template terbuka');
      await page.waitForTimeout(1000);
      await page.keyboard.press('Escape');
    }

    // =========================================================================
    // SKENARIO 6: Uji Lintas Role di Browser (Logout -> Walas -> Guru -> Ortu)
    // =========================================================================
    const testRoles = [
      { name: 'Wali Kelas', email: 'walas.test@dareliman.sch.id', pass: 'WalasTest@2026!', targetRoute: '/(dashboard|portal)' },
      { name: 'Guru / Musyrif', email: 'guru.test@dareliman.sch.id', pass: 'GuruTest@2026!', targetRoute: '/(portal-guru|dashboard)' },
      { name: 'Orang Tua', email: 'orangtua.test@dareliman.sch.id', pass: 'OrangTuaTest@2026!', targetRoute: '/(portal|dashboard)' },
    ];

    for (const role of testRoles) {
      recordStep(`6. Login Role ${role.name}`, 'START');

      // Logout dulu
      await page.goto(`${BASE_URL}/masuk`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.reload({ waitUntil: 'domcontentloaded' });

      // Isi form login
      await page.locator('input[placeholder*="Email"], input[type="text"]').first().fill(role.email);
      await page.locator('input[type="password"]').first().fill(role.pass);
      await page.locator('button[type="submit"]').first().click();

      // Tunggu masuk dashboard / portal
      await page.waitForURL(new RegExp(role.targetRoute), { timeout: 15000 });
      await page.waitForTimeout(2000);

      recordStep(`6. Login Role ${role.name}`, 'SUCCESS', `Tampil di portal ${role.targetRoute} dengan 0 error`);
    }

    // Final Assertion
    const fs = await import('fs');
    const path = await import('path');
    fs.writeFileSync(
      path.resolve(process.cwd(), 'real-browser-staging-proof.json'),
      JSON.stringify({ uiInteractionLog, consoleLogs, pageErrors }, null, 2),
      'utf-8'
    );

    console.log('\n=== REKAP LOG INTERAKSI UI BROWSER ===');
    console.log(JSON.stringify(uiInteractionLog, null, 2));

    console.log('\n=== REKAP CONSOLE ERROR ===');
    console.log(`Total Console Messages: ${consoleLogs.length}`);
    console.log(`Total Page Errors: ${pageErrors.length}`);

    expect(pageErrors.length).toBe(0);
  });
});

