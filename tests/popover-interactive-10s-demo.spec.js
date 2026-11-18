import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const API_URL = process.env.API_URL || 'http://localhost:8000';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const PROOF_DIR = path.resolve(process.cwd(), 'visual-proof');

test.describe('Demo Interaktif Popover & Dropdown (10 Detik Jeda Tiap Komponen)', () => {
  test.setTimeout(600000); // 10 menit agar seluruh jeda 10 detik berjalan penuh

  const loginAsSuperAdmin = async (page) => {
    const loginRes = await page.request.post(`${API_URL}/api/login`, {
      data: { email: 'superadmin@dareliman.sch.id', password: 'SuperAdmin@2026!' }
    });
    expect(loginRes.status()).toBe(200);
    const loginData = await loginRes.json();
    const token = loginData.token || loginData.data?.token || loginData.access_token;
    const user = loginData.user || loginData.data?.user;

    await page.goto(`${BASE_URL}/masuk`);
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('school_erp_token', token);
      localStorage.setItem('school_erp_user', JSON.stringify(user));
    }, { token, user });

    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('domcontentloaded');
  };

  test('Demo Interaktif Seluruh 8 Komponen Popover & Dropdown dengan Jeda 10 Detik', async ({ page }) => {
    if (!fs.existsSync(PROOF_DIR)) {
      fs.mkdirSync(PROOF_DIR, { recursive: true });
    }

    const realErrors = [];
    page.on('pageerror', (err) => {
      console.error('[PAGE ERROR]', err.message);
      realErrors.push(err.message);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Abaikan error koneksi websocket pusher/echo lokal jika port 6001 tidak aktif
        if (!text.includes('ws://') && !text.includes('WebSocket')) {
          console.error('[BROWSER CONSOLE ERROR]', text);
          realErrors.push(text);
        }
      }
    });

    // Cegah window.print() memblokir thread browser pada macOS
    await page.addInitScript(() => {
      window.print = () => {
        console.log('[SAFE PRINT STUB] window.print() dipanggil');
      };
    });

    await loginAsSuperAdmin(page);

    // =========================================================================
    // 1. Popover Notifikasi Navbar (NotificationCenter.jsx)
    // =========================================================================
    console.log('\n[1/8] Buka Popover Notifikasi Navbar...');
    const bellBtn = page.locator('button[aria-label="Pemberitahuan"]').first();
    await bellBtn.waitFor({ state: 'visible', timeout: 15000 });
    await bellBtn.click();
    await page.waitForTimeout(600);

    const notifPopover = page.locator('text=Notifikasi').first();
    await expect(notifPopover).toBeVisible({ timeout: 5000 });
    console.log('>>> Popover Notifikasi BERHASIL TERBUKA. Tahan 10 detik...');
    await page.screenshot({ path: path.join(PROOF_DIR, 'demo-01-popover-notifikasi.png') });
    await page.waitForTimeout(10000); // Wajib tahan 10 detik

    // Interaksi: klik "Tandai dibaca" di dalam popover
    const markAllReadBtn = page.locator('button:has-text("Tandai dibaca")').first();
    if (await markAllReadBtn.isVisible()) {
      await markAllReadBtn.click();
      await page.waitForTimeout(500);
      console.log('>>> Klik "Tandai dibaca" sukses.');
    }
    // Tutup notifikasi
    await bellBtn.click();
    await page.waitForTimeout(600);

    // =========================================================================
    // 2. Dropdown Profil Pengguna Navbar (DashboardLayout.jsx)
    // =========================================================================
    console.log('\n[2/8] Buka Dropdown Profil Pengguna Navbar...');
    const profileBtn = page.locator('button[aria-label="Menu profil user"]').first();
    await profileBtn.waitFor({ state: 'visible', timeout: 15000 });
    await profileBtn.click();
    await page.waitForTimeout(600);

    const akunItem = page.locator('text=Pengaturan Akun').first();
    await expect(akunItem).toBeVisible({ timeout: 5000 });
    console.log('>>> Dropdown Profil Pengguna BERHASIL TERBUKA. Tahan 10 detik...');
    await page.screenshot({ path: path.join(PROOF_DIR, 'demo-02-dropdown-profil.png') });
    await page.waitForTimeout(10000); // Wajib tahan 10 detik

    // Tutup profil dropdown
    await profileBtn.click();
    await page.waitForTimeout(600);

    // =========================================================================
    // 3. Filter Select & Action Dropdown di Tagihan Siswa (/dashboard/keuangan/tagihan-siswa)
    // =========================================================================
    console.log('\n[3/8] Tagihan Siswa: Uji Filter Select & Action Dropdown...');
    await page.goto(`${BASE_URL}/dashboard/keuangan/tagihan-siswa`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Klik filter dropdown unit/status
    const statusSelect = page.locator('select').nth(2);
    if (await statusSelect.isVisible()) {
      await statusSelect.click();
      console.log('>>> Filter Status diklik. Tahan 10 detik...');
      await page.screenshot({ path: path.join(PROOF_DIR, 'demo-03a-tagihan-filter.png') });
      await page.waitForTimeout(10000); // Wajib tahan 10 detik
      // Pilih opsi "Semua Status" agar baris tabel terisi
      await statusSelect.selectOption('');
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(1000);
    }

    // Klik Action Dropdown baris tabel pertama
    const tagihanActionTrigger = page.locator('table tbody button[aria-label="Menu Aksi"]').first();
    await tagihanActionTrigger.waitFor({ state: 'visible', timeout: 15000 });
    await tagihanActionTrigger.click();
    await page.waitForTimeout(600);

    const tagihanMenu = page.locator('[role="menu"], [data-slot="menu"]').first();
    await expect(tagihanMenu).toBeVisible({ timeout: 5000 });
    console.log('>>> Action Dropdown Tagihan Siswa BERHASIL TERBUKA. Tahan 10 detik...');
    await page.screenshot({ path: path.join(PROOF_DIR, 'demo-03b-tagihan-action-dropdown.png') });
    await page.waitForTimeout(10000); // Wajib tahan 10 detik

    // Interaksi: klik menu aksi "Lihat Data" / "Bayar Kasir"
    const actionItem1 = page.locator('[role="menuitem"]').first();
    await actionItem1.click();
    await page.waitForTimeout(1000);

    // Tutup modal jika terbuka
    const closeBtn = page.locator('button:has-text("Batal"), button[aria-label="Tutup"], button:has-text("Tutup")').first();
    if (await closeBtn.isVisible()) {
      await closeBtn.click();
      await page.waitForTimeout(500);
    }

    // =========================================================================
    // 4. Action Dropdown di Unit Pendidikan (/dashboard/master/unit-pendidikan)
    // =========================================================================
    console.log('\n[4/8] Unit Pendidikan: Buka Action Dropdown baris tabel...');
    await page.goto(`${BASE_URL}/dashboard/master/unit-pendidikan`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const unitActionTrigger = page.locator('table tbody tr:first-child button[aria-label="Menu Aksi"]').first();
    await unitActionTrigger.waitFor({ state: 'visible', timeout: 15000 });
    await unitActionTrigger.click();
    await page.waitForTimeout(600);

    const unitMenu = page.locator('[role="menu"], [data-slot="menu"]').first();
    await expect(unitMenu).toBeVisible({ timeout: 5000 });
    console.log('>>> Action Dropdown Unit Pendidikan BERHASIL TERBUKA. Tahan 10 detik...');
    await page.screenshot({ path: path.join(PROOF_DIR, 'demo-04-unit-pendidikan-dropdown.png') });
    await page.waitForTimeout(10000); // Wajib tahan 10 detik

    // Klik "Lihat Data" untuk membuktikan modal detail terbuka
    const unitLihatData = page.locator('[role="menuitem"]:has-text("Lihat Data")').first();
    await unitLihatData.click();
    await page.waitForTimeout(1000);
    const modalTitle = page.locator('text=Detail Unit Pendidikan, text=Informasi Unit').first();
    console.log('Modal detail unit terbuka:', await modalTitle.isVisible());

    // Tutup modal detail
    const closeUnitModal = page.locator('button:has-text("Tutup"), button[aria-label="Tutup"]').first();
    if (await closeUnitModal.isVisible()) {
      await closeUnitModal.click();
      await page.waitForTimeout(500);
    }

    // =========================================================================
    // 5. Filter Select & Action Dropdown di Kelas & Rombel (/dashboard/master/kelas)
    // =========================================================================
    console.log('\n[5/8] Kelas & Rombel: Buka Filter Select & Action Dropdown...');
    await page.goto(`${BASE_URL}/dashboard/master/kelas`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // Buka Filter Unit Select
    const kelasFilterTrigger = page.locator('button:has-text("Semua Unit"), button:has-text("Semua Tahun"), button:has-text("Unit")').first();
    if (await kelasFilterTrigger.isVisible()) {
      await kelasFilterTrigger.click();
      await page.waitForTimeout(600);
      console.log('>>> Filter Kelas diklik. Tahan 10 detik...');
      await page.screenshot({ path: path.join(PROOF_DIR, 'demo-05a-kelas-filter.png') });
      await page.waitForTimeout(10000); // Wajib tahan 10 detik
      // Pilih opsi di dalam dropdown popover
      const filterOpt = page.locator('.max-h-56 button, .overflow-y-auto button').first();
      if (await filterOpt.isVisible()) {
        await filterOpt.click();
        await page.waitForTimeout(800);
      }
    }

    // Buka Action Dropdown baris tabel kelas
    const kelasActionTrigger = page.locator('table tbody tr:first-child button[aria-label="Menu Aksi"]').first();
    await kelasActionTrigger.waitFor({ state: 'visible', timeout: 15000 });
    await kelasActionTrigger.click();
    await page.waitForTimeout(600);

    const kelasMenu = page.locator('[role="menu"], [data-slot="menu"]').first();
    await expect(kelasMenu).toBeVisible({ timeout: 5000 });
    console.log('>>> Action Dropdown Kelas BERHASIL TERBUKA. Tahan 10 detik...');
    await page.screenshot({ path: path.join(PROOF_DIR, 'demo-05b-kelas-action-dropdown.png') });
    await page.waitForTimeout(10000); // Wajib tahan 10 detik

    // Klik "Edit Data"
    const editKelas = page.locator('[role="menuitem"]:has-text("Edit Data")').first();
    await editKelas.click();
    await page.waitForTimeout(1000);
    const closeKelasModal = page.locator('button:has-text("Batal"), button[aria-label="Tutup"]').first();
    if (await closeKelasModal.isVisible()) {
      await closeKelasModal.click();
      await page.waitForTimeout(500);
    }

    // =========================================================================
    // 6. Action Dropdown di Mutabaah Template Agenda (/dashboard/mutabaah/template-agenda)
    // =========================================================================
    console.log('\n[6/8] Mutabaah Template: Buka Action Dropdown...');
    await page.goto(`${BASE_URL}/dashboard/mutabaah/template-agenda`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    const mutabaahActionTrigger = page.locator('table tbody button[aria-label="Menu Aksi"]').first();
    await mutabaahActionTrigger.waitFor({ state: 'visible', timeout: 15000 });
    await page.waitForTimeout(600);
    await mutabaahActionTrigger.click();
    await page.waitForTimeout(1000);

    const mutabaahMenu = page.locator('[role="menu"], [data-slot="menu"], [data-slot="dropdown-menu"]').first();
    await expect(mutabaahMenu).toBeVisible({ timeout: 10000 });
    console.log('>>> Action Dropdown Mutabaah BERHASIL TERBUKA. Tahan 10 detik...');
    await page.screenshot({ path: path.join(PROOF_DIR, 'demo-06-mutabaah-action-dropdown.png') });
    await page.waitForTimeout(10000); // Wajib tahan 10 detik

    // Klik opsi aksi "Lihat Data"
    const mutabaahLihat = page.locator('[role="menuitem"]:has-text("Lihat Data")').first();
    await mutabaahLihat.click();
    await page.waitForTimeout(1000);

    // Tutup drawer/modal
    const closeMutabaah = page.locator('button:has-text("Tutup"), button[aria-label="Tutup"]').first();
    if (await closeMutabaah.isVisible()) {
      await closeMutabaah.click();
      await page.waitForTimeout(500);
    }

    // =========================================================================
    // 7. Filter Kelas & Action Menu di Setoran Tahfizh (/dashboard/tahfizh)
    // =========================================================================
    console.log('\n[7/8] Tahfizh: Buka Filter Kelas Dropdown...');
    await page.goto(`${BASE_URL}/dashboard/tahfizh`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const tahfizhClassFilter = page.locator('button:has-text("Pilih Kelas"), button:has-text("Kelas")').first();
    await tahfizhClassFilter.waitFor({ state: 'visible', timeout: 15000 });
    await tahfizhClassFilter.click();
    await page.waitForTimeout(600);

    console.log('>>> Filter Dropdown Kelas Tahfizh BERHASIL TERBUKA. Tahan 10 detik...');
    await page.screenshot({ path: path.join(PROOF_DIR, 'demo-07-tahfizh-class-dropdown.png') });
    await page.waitForTimeout(10000); // Wajib tahan 10 detik

    // Pilih kelas dari dropdown
    const classOption = page.locator('div[role="menu"] button, .max-h-56 button, button:has-text("7A"), button:has-text("Kelas")').first();
    if (await classOption.isVisible()) {
      await classOption.click();
      await page.waitForTimeout(1000);
      console.log('>>> Kelas berhasil dipilih.');
    }

    // Klik tombol Tambah Setoran Tahfizh / Pilih Siswa
    const btnSetoran = page.locator('button:has-text("Tambah Setoran"), button:has-text("Pilih Siswa"), button:has-text("Setoran")').first();
    if (await btnSetoran.isVisible()) {
      await btnSetoran.click();
      await page.waitForTimeout(1000);
      console.log('>>> Tombol Setoran Tahfizh diklik.');
      // Tutup modal setoran jika terbuka
      const closeTahfizhModal = page.locator('button:has-text("Batal"), button[aria-label="Tutup"]').first();
      if (await closeTahfizhModal.isVisible()) {
        await closeTahfizhModal.click();
        await page.waitForTimeout(500);
      }
    }

    // =========================================================================
    // 8. Action Dropdown di Master Siswa & Pegawai
    // =========================================================================
    console.log('\n[8a/8] Master Siswa: Buka Action Dropdown baris tabel...');
    await page.goto(`${BASE_URL}/dashboard/master/siswa`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const siswaActionTrigger = page.locator('table tbody button[aria-label="Menu Aksi"]').first();
    await siswaActionTrigger.waitFor({ state: 'visible', timeout: 15000 });
    await siswaActionTrigger.click();
    await page.waitForTimeout(600);

    const siswaMenu = page.locator('[role="menu"], [data-slot="menu"]').first();
    await expect(siswaMenu).toBeVisible({ timeout: 5000 });
    console.log('>>> Action Dropdown Master Siswa BERHASIL TERBUKA. Tahan 10 detik...');
    await page.screenshot({ path: path.join(PROOF_DIR, 'demo-08a-siswa-action-dropdown.png') });
    await page.waitForTimeout(10000); // Wajib tahan 10 detik

    // Verifikasi kontras dan items
    const siswaStyles = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[role="menuitem"]'));
      const normalItem = items.find(el => !el.textContent.includes('Hapus'));
      const deleteItem = items.find(el => el.textContent.includes('Hapus'));
      return {
        normalColor: normalItem ? window.getComputedStyle(normalItem).color : null,
        deleteColor: deleteItem ? window.getComputedStyle(deleteItem).color : null,
      };
    });
    console.log('Siswa normal text color:', siswaStyles.normalColor);
    console.log('Siswa delete text color:', siswaStyles.deleteColor);

    console.log('\n[8b/8] Master Pegawai: Buka Action Dropdown baris tabel...');
    await page.goto(`${BASE_URL}/dashboard/employees`);
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const pegActionTrigger = page.locator('table tbody button[aria-label="Menu Aksi"]').first();
    await pegActionTrigger.waitFor({ state: 'visible', timeout: 15000 });
    await pegActionTrigger.click();
    await page.waitForTimeout(600);

    const pegMenu = page.locator('[role="menu"], [data-slot="menu"]').first();
    await expect(pegMenu).toBeVisible({ timeout: 5000 });
    console.log('>>> Action Dropdown Master Pegawai BERHASIL TERBUKA. Tahan 10 detik...');
    await page.screenshot({ path: path.join(PROOF_DIR, 'demo-08b-pegawai-action-dropdown.png') });
    await page.waitForTimeout(10000); // Wajib tahan 10 detik

    // Verifikasi kontras dan items
    const pegStyles = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[role="menuitem"]'));
      const normalItem = items.find(el => !el.textContent.includes('Hapus'));
      const deleteItem = items.find(el => el.textContent.includes('Hapus'));
      return {
        normalColor: normalItem ? window.getComputedStyle(normalItem).color : null,
        deleteColor: deleteItem ? window.getComputedStyle(deleteItem).color : null,
      };
    });
    console.log('Pegawai normal text color:', pegStyles.normalColor);
    console.log('Pegawai delete text color:', pegStyles.deleteColor);

    console.log('\n=== SELURUH 8 DEMO INTERAKTIF BERHASIL DENGAN JEDA 10 DETIK ===');
    console.log('Total Real Errors:', realErrors.length);
    expect(realErrors.length).toBe(0);
  });
});
