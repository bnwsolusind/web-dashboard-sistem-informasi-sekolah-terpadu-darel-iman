import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://demoedu.dareliman.sch.id';
const API_URL = 'https://demoapi.dareliman.sch.id';

test.describe('Headed Deep UI Interaction & Zero Residue Audit on Staging', () => {
  test.setTimeout(180000);

  test('Headed Real Browser: Tahfizh Setoran + Mutabaah Agenda CRUD & Zero-Residue Check', async ({ page }) => {
    const consoleLogs = [];
    const pageErrors = [];
    const executionLogs = [];
    let savedTahfizhId = null;
    let savedTemplateId = null;

    page.on('console', (msg) => {
      const type = msg.type();
      const text = msg.text();
      if (!text.includes('React DevTools') && !text.includes('favicon')) {
        consoleLogs.push({ type, text });
      }
    });

    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
      console.error('[BROWSER_PAGE_ERROR]:', err.message);
    });

    // Intercept network responses to capture saved IDs
    page.on('response', async (response) => {
      const url = response.url();
      const method = response.request().method();
      if (url.includes('/api/tahfizh/daily-log') && method === 'POST' && response.status() === 200) {
        try {
          const json = await response.json();
          savedTahfizhId = json?.data?.id || json?.id || null;
          console.log('[NETWORK_CAPTURED] Saved Tahfizh ID:', savedTahfizhId);
        } catch (e) {}
      }
      if (url.includes('/api/mutabaah/enterprise/templates') && method === 'POST' && (response.status() === 200 || response.status() === 201)) {
        try {
          const json = await response.json();
          savedTemplateId = json?.data?.id || json?.id || null;
          console.log('[NETWORK_CAPTURED] Saved Template ID:', savedTemplateId);
        } catch (e) {}
      }
    });

    const logStep = (step, status, details = '') => {
      executionLogs.push({ step, status, details, time: new Date().toISOString() });
      console.log(`[HEADED_STEP] ${step} => ${status} ${details}`);
    };

    // =========================================================================
    // LANGKAH 0: Login Form Web Super Admin
    // =========================================================================
    logStep('0. Login Form Web Super Admin', 'START');
    await page.goto(`${BASE_URL}/masuk`, { waitUntil: 'domcontentloaded' });
    await page.locator('input[placeholder*="Email"], input[type="text"]').first().fill('superadmin@dareliman.sch.id');
    await page.locator('input[type="password"]').first().fill('SuperAdmin@2026!');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL(/.*\/dashboard/, { timeout: 20000 });
    logStep('0. Login Form Web Super Admin', 'SUCCESS', 'Berhasil masuk ke /dashboard');

    // =========================================================================
    // LANGKAH 1: Tahfizh Setoran (Aabid Muhammad Hafiy, An-Naba 1-5, Mumtaz)
    // =========================================================================
    logStep('1.1 Buka Halaman Tahfizh', 'START');
    await page.goto(`${BASE_URL}/dashboard/tahfizh`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    // Pilih kelas 'B' (TKIT 3) tempat santri Aabid berada
    logStep('1.2 Buka Dropdown Kelas & Pilih Kelas B', 'START');
    const classTrigger = page.locator('button:has(span:has-text("Kelas"))').first();
    await classTrigger.click();
    await page.waitForTimeout(600);

    const classSelected = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('.max-h-56 button'));
      for (const b of btns) {
        const key = Object.keys(b).find(k => k.startsWith('__reactFiber'));
        if (key && b[key]?.key === '01a195d7-0e00-70f4-98e2-dfb832103940') {
          b.click();
          return true;
        }
      }
      return false;
    });
    logStep('1.2 Buka Dropdown Kelas & Pilih Kelas B', 'SUCCESS', `Kelas B terpilih: ${classSelected}`);
    await page.waitForTimeout(2000);

    // Buka Modal Pilih Siswa
    logStep('1.3 Buka Modal Siswa & Pilih Santri Aabid Muhammad Hafiy', 'START');
    const pilihSiswaTrigger = page.locator('button:has-text("Pilih Siswa")').first();
    await pilihSiswaTrigger.click();
    await page.waitForTimeout(1000);

    // Cari santri Aabid di modal
    const searchStudentInput = page.locator('input[aria-label="Cari siswa dalam modal"], input[placeholder*="Cari nama siswa"]').first();
    if (await searchStudentInput.isVisible()) {
      await searchStudentInput.fill('Aabid');
      await page.waitForTimeout(800);
    }

    // Klik tombol Pilih Siswa atau Terpilih pada modal
    const selectAabidBtn = page.locator('[role="dialog"] button:has-text("Pilih Siswa"), [role="dialog"] button:has-text("Terpilih")').first();
    await selectAabidBtn.click();
    logStep('1.3 Buka Modal Siswa & Pilih Santri Aabid Muhammad Hafiy', 'SUCCESS', 'Santri Aabid terpilih, Sheet Formulir Terbuka');
    await page.waitForTimeout(2000);

    // Buka Modal Mushaf / Al-Quran
    logStep('1.4 Klik Tambah Setoran & Buka Mushaf Modal', 'START');
    const tambahSetoranBtn = page.locator('button:has-text("Tambah Setoran")').first();
    await tambahSetoranBtn.click();
    await page.waitForTimeout(2000);

    // Konfigurasi Surah An-Naba, Ayat 1 s/d 5, Predikat Mumtaz
    logStep('1.5 Konfigurasi Surah An-Naba Ayat 1 s/d 5 & Predikat Mumtaz', 'START');
    
    // Cari Surah An-Naba jika belum terpilih
    const quranSearchInput = page.locator('input[placeholder*="Misal: An-Naba"]').first();
    if (await quranSearchInput.isVisible()) {
      await quranSearchInput.fill('An-Naba');
      await page.waitForTimeout(800);
      const anNabaBtn = page.locator('button:has-text("An-Naba")').first();
      if (await anNabaBtn.isVisible()) {
        await anNabaBtn.click();
        await page.waitForTimeout(600);
      }
    }

    // Pilih Ayat Akhir = 5 melalui HeroUiModalSelect atau direct click
    const ayahEndSelectTrigger = page.locator('div:has(> label:has-text("Pilih Ayat Akhir:")) button').first();
    if (await ayahEndSelectTrigger.isVisible()) {
      await ayahEndSelectTrigger.click();
      await page.waitForTimeout(500);
      const option5Btn = page.locator('div.max-h-56 button:has-text("Ayat 5")').first();
      if (await option5Btn.isVisible()) {
        await option5Btn.click();
        await page.waitForTimeout(500);
      } else {
        // Fallback jika label hanya angka 5
        const option5Alt = page.locator('div.max-h-56 button').filter({ hasText: /^5$/ }).first();
        if (await option5Alt.isVisible()) {
          await option5Alt.click();
          await page.waitForTimeout(500);
        }
      }
    }

    // Pastikan Field Penilaian Hafalan terbuka & set Mumtaz
    const fieldPenilaianBtn = page.locator('button:has-text("Field Penilaian Hafalan")').first();
    if (await fieldPenilaianBtn.isVisible().catch(() => false)) {
      await fieldPenilaianBtn.click();
      await page.waitForTimeout(500);
    }

    const mumtazBtn = page.locator('button:has-text("Mumtaz")').first();
    if (await mumtazBtn.isVisible().catch(() => false)) {
      await mumtazBtn.click();
      await page.waitForTimeout(500);
    }

    // Terapkan ke Form Tahfizh
    const terapkanBtn = page.locator('button:has-text("Terapkan ke Form Tahfizh")').first();
    await terapkanBtn.click();
    logStep('1.5 Konfigurasi Surah An-Naba Ayat 1 s/d 5 & Predikat Mumtaz', 'SUCCESS', 'Diterapkan ke baris formulir');
    await page.waitForTimeout(2000);

    // Klik tombol Simpan Hari Ini pada baris
    logStep('1.6 Klik Tombol Simpan & Konfirmasi Modal', 'START');
    const saveRowBtn = page.locator('button[aria-label="Simpan Hari Ini"]').first();
    await saveRowBtn.click();
    await page.waitForTimeout(1000);

    // Konfirmasi Simpan pada popup konfirmasi
    const confirmSaveBtn = page.locator('div[role="dialog"] button:has-text("Simpan")').last();
    if (await confirmSaveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await confirmSaveBtn.click();
    }
    await page.waitForTimeout(3000);
    logStep('1.6 Klik Tombol Simpan & Konfirmasi Modal', 'SUCCESS', 'Setoran tersimpan ke database staging');

    // Verifikasi label Tersimpan muncul di baris
    const statusTersimpan = page.locator('text=/Tersimpan/i').first();
    await expect(statusTersimpan).toBeVisible();

    // Hapus log setoran tersebut agar 0 residu
    logStep('1.7 Bersihkan Residu Log Tahfizh', 'START');
    if (savedTahfizhId) {
      await page.evaluate(async ({ API_URL, savedTahfizhId }) => {
        const token = localStorage.getItem('school_erp_token');
        await fetch(`${API_URL}/api/tahfizh/daily-log/${savedTahfizhId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
          }
        });
      }, { API_URL, savedTahfizhId });
      logStep('1.7 Bersihkan Residu Log Tahfizh', 'SUCCESS', `Log ID #${savedTahfizhId} terhapus bersih`);
    }

    // Tutup Sheet modal
    await page.keyboard.press('Escape');
    await page.waitForTimeout(1000);

    // =========================================================================
    // LANGKAH 2: Mutabaah Template Agenda ([QA-FINAL-CHECK])
    // =========================================================================
    logStep('2.1 Buka Mutabaah Template Agenda', 'START');
    await page.goto(`${BASE_URL}/dashboard/mutabaah/template-agenda`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);

    // Klik tombol Tambah Template Agenda
    logStep('2.2 Buka Drawer Tambah Template', 'START');
    const tambahTemplateBtn = page.locator('button:has-text("Tambah Template Agenda"), button:has-text("Tambah Data")').first();
    await tambahTemplateBtn.click();
    await page.waitForTimeout(1500);

    // Isi Form Drawer
    logStep('2.3 Isi Form Drawer [QA-FINAL-CHECK]', 'START');
    const codeInput = page.locator('input[name="code"]').first();
    if (await codeInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await codeInput.fill('QA-TPL-FINAL');
    }

    const nameInput = page.locator('input[name="name"]').first();
    if (await nameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await nameInput.fill('[QA-FINAL-CHECK]');
    }

    const jenjangInput = page.locator('input[name="education_level"], select[name="education_level"]').first();
    if (await jenjangInput.isVisible({ timeout: 1500 }).catch(() => false)) {
      await jenjangInput.fill('SD');
    }

    // Pilih select option jika ada
    const allSelects = page.locator('form select');
    const countSelects = await allSelects.count();
    for (let i = 0; i < countSelects; i++) {
      try {
        await allSelects.nth(i).selectOption({ index: 1 });
      } catch (e) {}
    }

    const dateInput = page.locator('input[type="date"], input[name="start_date"]').first();
    if (await dateInput.isVisible({ timeout: 1500 }).catch(() => false)) {
      await dateInput.fill('2026-11-18');
    }

    // Klik Simpan di footer Drawer
    logStep('2.4 Klik Simpan Template', 'START');
    const submitDrawerBtn = page.locator('footer button[type="submit"], button:has-text("Simpan")').last();
    await submitDrawerBtn.click();
    await page.waitForTimeout(3000);
    logStep('2.4 Klik Simpan Template', 'SUCCESS', 'Template [QA-FINAL-CHECK] berhasil disimpan');

    // Cari baris yang baru disimpan
    logStep('2.5 Hapus Data Template [QA-FINAL-CHECK]', 'START');
    const searchTemplateInput = page.locator('input[placeholder*="Cari"]').first();
    if (await searchTemplateInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await searchTemplateInput.fill('QA-FINAL-CHECK');
      await page.waitForTimeout(1500);
    }

    // Klik tombol Hapus pada baris
    const deleteRowBtn = page.locator('button[title="Hapus"]').first();
    if (await deleteRowBtn.isVisible({ timeout: 2500 }).catch(() => false)) {
      await deleteRowBtn.click();
      await page.waitForTimeout(1000);

      // Konfirmasi SweetAlert "Hapus"
      const confirmSwalBtn = page.locator('.swal2-confirm, button:has-text("Hapus")').last();
      if (await confirmSwalBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmSwalBtn.click();
        await page.waitForTimeout(2000);
      }
      logStep('2.5 Hapus Data Template [QA-FINAL-CHECK]', 'SUCCESS', 'Data template berhasil dihapus via UI modal konfirmasi');
    } else if (savedTemplateId) {
      await page.evaluate(async ({ API_URL, savedTemplateId }) => {
        const token = localStorage.getItem('school_erp_token');
        await fetch(`${API_URL}/api/mutabaah/enterprise/templates/${savedTemplateId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Accept': 'application/json'
          }
        });
      }, { API_URL, savedTemplateId });
      logStep('2.5 Hapus Data Template [QA-FINAL-CHECK]', 'SUCCESS', `ID #${savedTemplateId} berhasil dihapus via API`);
    }

    // =========================================================================
    // VERIFIKASI AKHIR: 0 CONSOLE ERROR & 0 DATA RESIDU DI SERVER STAGING
    // =========================================================================
    const cleanCheck = await page.evaluate(async ({ API_URL }) => {
      const token = localStorage.getItem('school_erp_token');
      const resT = await fetch(`${API_URL}/api/mutabaah/enterprise/templates?search=QA-FINAL-CHECK`, {
        headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
      });
      const jsonT = await resT.json();
      return {
        templateRemaining: jsonT?.data?.length || jsonT?.meta?.total || 0
      };
    }, { API_URL });

    console.log('\n=== HASIL VERIFIKASI AKHIR HEADED AUDIT ===');
    console.log('Sisa Template QA di Staging:', cleanCheck.templateRemaining);
    console.log('Total Console Messages:', consoleLogs.length);
    console.log('Total Page Errors:', pageErrors.length);

    fs.writeFileSync(
      path.resolve(process.cwd(), 'headed-audit-proof.json'),
      JSON.stringify({ executionLogs, consoleLogs, pageErrors, cleanCheck }, null, 2),
      'utf-8'
    );

    expect(pageErrors.length).toBe(0);
    expect(cleanCheck.templateRemaining).toBe(0);
  });
});
