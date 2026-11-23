import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const API_URL = process.env.API_URL || 'http://localhost:8000';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const PROOF_DIR = path.resolve(process.cwd(), 'visual-proof');
const REPORT_FILE = path.join(PROOF_DIR, 'computed-css-report.json');

let computedResults = {};
if (fs.existsSync(REPORT_FILE)) {
  try {
    computedResults = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf-8'));
  } catch {}
}

const saveReport = () => {
  fs.writeFileSync(REPORT_FILE, JSON.stringify(computedResults, null, 2), 'utf-8');
};

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
  await page.waitForLoadState('networkidle');
};

const measureElement = async (page, locator) => {
  try {
    const count = await locator.count();
    if (count === 0) return null;
    return await locator.first().evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        height: cs.height,
        borderRadius: cs.borderRadius,
        maxWidth: cs.maxWidth,
        fontSize: cs.fontSize,
        fontWeight: cs.fontWeight,
        backgroundColor: cs.backgroundColor,
        color: cs.color,
        padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`
      };
    });
  } catch {
    return null;
  }
};

test.describe('Visual & Computed CSS Audit with Real Modals', () => {
  test.beforeAll(async () => {
    if (!fs.existsSync(PROOF_DIR)) {
      fs.mkdirSync(PROOF_DIR, { recursive: true });
    }
  });

  test.afterAll(async () => {
    saveReport();
    console.log(`\n>>> [COMPUTED_CSS_REPORT] Saved to ${REPORT_FILE}`);
  });

  test('01. Master Siswa - Modal Tambah Siswa', async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.goto(`${BASE_URL}/dashboard/master/siswa`);
    await page.waitForLoadState('networkidle');

    const tambahSiswaBtn = page.locator('button[aria-label="Tambah Siswa Baru"], button:has-text("Tambah Siswa")').first();
    await tambahSiswaBtn.waitFor({ state: 'visible', timeout: 10000 });
    await tambahSiswaBtn.click();

    const studentModalContent = page.locator('.modal-content, .modal-dialog').first();
    await studentModalContent.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(600);

    computedResults['01-master-siswa-modal'] = {
      primaryBtn: await measureElement(page, page.locator('.modal-footer button.bg-emerald-600, .modal-footer button:has-text("Selanjutnya"), .modal-footer button:has-text("Simpan")')),
      cancelBtn: await measureElement(page, page.locator('.modal-footer button:has-text("Batal")')),
      modalBox: await measureElement(page, studentModalContent),
      modalTitle: await measureElement(page, page.locator('.modal-title, .modal-header h2')),
      formLabel: await measureElement(page, page.locator('form label, .modal-content label')),
    };

    await page.screenshot({ path: path.join(PROOF_DIR, '01-master-siswa-modal.png'), fullPage: false });
    console.log('Saved screenshot: 01-master-siswa-modal.png');
    saveReport();
  });

  test('01b. Master Siswa - Modal Cetak Kartu Pelajar', async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.goto(`${BASE_URL}/dashboard/master/siswa`);
    await page.waitForLoadState('networkidle');

    const firstRowName = page.locator('table tbody tr:first-child td:nth-child(2), table tbody tr:first-child strong').first();
    await firstRowName.waitFor({ state: 'visible', timeout: 10000 });
    await firstRowName.click();
    await page.waitForTimeout(600);

    const cetakKartuFromDetail = page.locator('button:has-text("Cetak Kartu Siswa")').first();
    await cetakKartuFromDetail.waitFor({ state: 'visible', timeout: 10000 });
    await cetakKartuFromDetail.click();

    const cardModal = page.locator('section:has-text("Kartu Siswa (Pelajar)"), div.fixed.inset-0:has-text("Kartu Siswa") section').first();
    await cardModal.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(600);

    computedResults['01b-kartu-pelajar-modal'] = {
      primaryBtn: await measureElement(page, page.locator('header button.bg-emerald-600, button:has-text("Simpan Pilihan"), button:has-text("Download")')),
      cancelBtn: await measureElement(page, page.locator('button:has-text("Tutup"), button[aria-label="Tutup"]')),
      modalBox: await measureElement(page, cardModal),
      modalTitle: await measureElement(page, page.locator('header h2:has-text("Kartu Siswa (Pelajar)")')),
      formLabel: await measureElement(page, page.locator('label, .text-slate-700')),
    };

    await page.screenshot({ path: path.join(PROOF_DIR, '01b-kartu-pelajar-modal.png'), fullPage: false });
    console.log('Saved screenshot: 01b-kartu-pelajar-modal.png');
    saveReport();
  });

  test('02. Master Pegawai - Modal Tambah Pegawai', async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.goto(`${BASE_URL}/dashboard/employees`);
    await page.waitForLoadState('networkidle');

    const tambahPegawaiBtn = page.locator('button[aria-label="Tambah Pegawai Baru"], button:has-text("Tambah Pegawai")').first();
    await tambahPegawaiBtn.waitFor({ state: 'visible', timeout: 10000 });
    await tambahPegawaiBtn.click();

    const employeeModalContent = page.locator('.modal-content, .modal-dialog').first();
    await employeeModalContent.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(600);

    computedResults['02-master-pegawai-modal'] = {
      primaryBtn: await measureElement(page, page.locator('.modal-footer button.bg-emerald-600, .modal-footer button:has-text("Selanjutnya"), .modal-footer button:has-text("Simpan")')),
      cancelBtn: await measureElement(page, page.locator('.modal-footer button:has-text("Batal")')),
      modalBox: await measureElement(page, employeeModalContent),
      modalTitle: await measureElement(page, page.locator('header h2, .modal-header h2, h3:has-text("Pegawai")')),
      formLabel: await measureElement(page, page.locator('form label, .modal-content label')),
    };

    await page.screenshot({ path: path.join(PROOF_DIR, '02-master-pegawai-modal.png'), fullPage: false });
    console.log('Saved screenshot: 02-master-pegawai-modal.png');
    saveReport();
  });

  test('03. Tagihan Keuangan - Modal Terbitkan Tagihan Siswa', async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.goto(`${BASE_URL}/dashboard/keuangan/tagihan-siswa`);
    await page.waitForLoadState('networkidle');

    const terbitkanTagihanBtn = page.locator('button:has-text("Terbitkan Tagihan"), button:has-text("Tambah Tagihan")').first();
    await terbitkanTagihanBtn.waitFor({ state: 'visible', timeout: 10000 });
    await terbitkanTagihanBtn.click();

    const billModal = page.locator('div.fixed.inset-0:has-text("Terbitkan Tagihan Siswa") > div, div.fixed.inset-0:has-text("Terbitkan Tagihan") > div').first();
    await billModal.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(600);

    computedResults['03-tagihan-siswa-modal'] = {
      primaryBtn: await measureElement(page, page.locator('form button[type="submit"], button:has-text("Terbitkan Sekarang")')),
      cancelBtn: await measureElement(page, page.locator('form button:has-text("Batal")')),
      modalBox: await measureElement(page, billModal),
      modalTitle: await measureElement(page, page.locator('h3:has-text("Terbitkan Tagihan Siswa")')),
      formLabel: await measureElement(page, page.locator('form label')),
    };

    await page.screenshot({ path: path.join(PROOF_DIR, '03-tagihan-siswa-modal.png'), fullPage: false });
    console.log('Saved screenshot: 03-tagihan-siswa-modal.png');
    saveReport();
  });

  test('04. Laporan Absensi - Modal Print Preview / Cetak Laporan', async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.goto(`${BASE_URL}/dashboard/laporan-absensi`);
    await page.waitForLoadState('networkidle');

    const cetakLaporanBtn = page.locator('button:has-text("Cetak Laporan"), button[aria-label="Cetak Laporan"]').first();
    await cetakLaporanBtn.waitFor({ state: 'visible', timeout: 10000 });
    await cetakLaporanBtn.click();

    const printModal = page.locator('div[role="dialog"][aria-labelledby="print-option-modal-title"], div.fixed.inset-0:has-text("Kop") > div').first();
    await printModal.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(600);

    computedResults['04-laporan-absensi-print-modal'] = {
      primaryBtn: await measureElement(page, page.locator('button:has-text("Cetak Sekarang"), button:has-text("Cetak PDF")')),
      cancelBtn: await measureElement(page, page.locator('button:has-text("Batal")')),
      modalBox: await measureElement(page, page.locator('div[role="dialog"] > div, div.fixed.inset-0 > div > div').first()),
      modalTitle: await measureElement(page, page.locator('#print-option-modal-title, h3:has-text("Opsi Cetak & Unduh")')),
      formLabel: await measureElement(page, page.locator('div[role="dialog"] label, div.fixed.inset-0 label')),
    };

    await page.screenshot({ path: path.join(PROOF_DIR, '04-laporan-absensi-print-modal.png'), fullPage: false });
    console.log('Saved screenshot: 04-laporan-absensi-print-modal.png');
    saveReport();
  });

  test('05. Setoran Tahfizh - Modal Mushaf Al-Qur\'an', async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.goto(`${BASE_URL}/dashboard/tahfizh`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Take debug screenshot of tahfizh page
    await page.screenshot({ path: path.join(PROOF_DIR, '05-tahfizh-page-debug.png') });

    // Look for any dialog button or trigger
    const buttons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.textContent.trim(),
        ariaLabel: b.getAttribute('aria-label') || '',
        classes: b.className
      })).filter(b => b.text.length > 0 || b.ariaLabel.length > 0);
    });
    console.log('Tahfizh buttons found:', JSON.stringify(buttons.slice(0, 15), null, 2));

    // Click first button that contains "Pilih" or "Tambah" or "Cetak"
    const targetBtn = page.locator('button:has-text("Pilih Siswa"), button:has-text("Pilih"), button:has-text("Tambah Setoran"), button:has-text("Cetak")').first();
    if (await targetBtn.isVisible()) {
      await targetBtn.click();
      await page.waitForTimeout(1000);
    }

    const modal = page.locator('div[role="dialog"], div.fixed.inset-0, section.fixed').first();
    if (await modal.isVisible()) {
      computedResults['05-tahfizh-mushaf-modal'] = {
        primaryBtn: await measureElement(page, page.locator('.modal-footer button.bg-emerald-600, div[role="dialog"] button.bg-emerald-600, div[role="dialog"] button:has-text("Simpan"), div[role="dialog"] button:has-text("Pilih")')),
        cancelBtn: await measureElement(page, page.locator('.modal-footer button:has-text("Batal"), div[role="dialog"] button:has-text("Batal"), div[role="dialog"] button:has-text("Tutup")')),
        modalBox: await measureElement(page, modal),
        modalTitle: await measureElement(page, page.locator('div[role="dialog"] h2, div[role="dialog"] [class*="DialogTitle"], div[role="dialog"] h3, h2, h3')),
        formLabel: await measureElement(page, page.locator('div[role="dialog"] label, label')),
      };
      await page.screenshot({ path: path.join(PROOF_DIR, '05-tahfizh-mushaf-modal.png'), fullPage: false });
      console.log('Saved screenshot: 05-tahfizh-mushaf-modal.png');
      saveReport();
    }
  });

  test('06. Mutabaah - Drawer Tambah Template Agenda', async ({ page }) => {
    await loginAsSuperAdmin(page);
    await page.goto(`${BASE_URL}/dashboard/mutabaah/template-agenda`);
    await page.waitForLoadState('networkidle');

    const tambahTemplateBtn = page.locator('button:has-text("Tambah Template Agenda"), button:has-text("Tambah Template")').first();
    await tambahTemplateBtn.waitFor({ state: 'visible', timeout: 10000 });
    await tambahTemplateBtn.click();

    const templateDrawer = page.locator('form.modal-content, form.w-full.max-w-xl, div.fixed.inset-0:has-text("Mutaba’ah Yaumiyyah") form').first();
    await templateDrawer.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(600);

    computedResults['06-mutabaah-template-modal'] = {
      primaryBtn: await measureElement(page, page.locator('.modal-footer button.bg-emerald-600, .modal-footer button:has-text("Simpan")')),
      cancelBtn: await measureElement(page, page.locator('.modal-footer button:has-text("Batal"), .modal-footer button:has-text("Tutup")')),
      modalBox: await measureElement(page, templateDrawer),
      modalTitle: await measureElement(page, page.locator('.modal-title, header h2')),
      formLabel: await measureElement(page, page.locator('form label')),
    };

    await page.screenshot({ path: path.join(PROOF_DIR, '06-mutabaah-template-modal.png'), fullPage: false });
    console.log('Saved screenshot: 06-mutabaah-template-modal.png');
    saveReport();
  });
});
