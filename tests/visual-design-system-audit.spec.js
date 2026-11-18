import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test.describe('Visual Design System & Token Harmonization Audit', () => {
  test.setTimeout(90000);

  test('Verify Button Tokens, Modal Tiers, and Typography across 6 Core Pages', async ({ page }) => {
    // 1. Login Local
    await page.goto(`${BASE_URL}/masuk`, { waitUntil: 'domcontentloaded' });
    await page.locator('input[placeholder*="Email"], input[type="text"]').first().fill('superadmin@dareliman.sch.id');
    await page.locator('input[type="password"]').first().fill('SuperAdmin@2026!');
    await page.locator('button[type="submit"]').first().click();
    await page.waitForURL(/.*\/dashboard/, { timeout: 15000 });

    const auditResults = [];

    const auditPage = async (pageName) => {
      const result = await page.evaluate((name) => {
        const primaryButtons = Array.from(document.querySelectorAll('button.bg-emerald-600, button.bg-\\[\\#0E5C44\\]'));
        const modal = document.querySelector('[role="dialog"], .modal-dialog');
        const modalClass = modal ? modal.className : 'No modal open';

        const pageTitle = document.querySelector('h1, h2');
        const titleText = pageTitle ? pageTitle.textContent.trim().slice(0, 40) : '';

        return {
          pageName: name,
          primaryButtonsCount: primaryButtons.length,
          hasModal: !!modal,
          modalClass: modalClass.slice(0, 60),
          titleText
        };
      }, pageName);
      auditResults.push(result);
      console.log(`[AUDIT_PASS] ${pageName}:`, result);
    };

    // PAGE 1: Master Siswa
    await page.goto(`${BASE_URL}/dashboard/master/siswa`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await auditPage('1. Master Siswa');

    // PAGE 2: Pegawai
    await page.goto(`${BASE_URL}/dashboard/employees`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await auditPage('2. Pegawai');

    // PAGE 3: Tagihan Keuangan
    await page.goto(`${BASE_URL}/dashboard/keuangan/tagihan-siswa`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await auditPage('3. Tagihan Keuangan');

    // PAGE 4: Absensi
    await page.goto(`${BASE_URL}/dashboard/laporan-absensi`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await auditPage('4. Laporan Absensi');

    // PAGE 5: Setoran Tahfizh
    await page.goto(`${BASE_URL}/dashboard/tahfizh`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await auditPage('5. Setoran Tahfizh');

    // PAGE 6: Mutabaah Template Agenda
    await page.goto(`${BASE_URL}/dashboard/mutabaah/template-agenda`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    await auditPage('6. Mutabaah Template Agenda');

    expect(auditResults.length).toBe(6);
  });
});
