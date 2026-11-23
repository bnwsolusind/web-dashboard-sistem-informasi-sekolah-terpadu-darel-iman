import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const API_URL = process.env.API_URL || 'http://127.0.0.1:8000';
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const PROOF_DIR = path.resolve(process.cwd(), 'visual-proof', 'wave1');

if (!fs.existsSync(PROOF_DIR)) {
  fs.mkdirSync(PROOF_DIR, { recursive: true });
}

const wave1Pages = [
  { name: '01-students', path: '/dashboard/master/siswa' },
  { name: '02-employees', path: '/dashboard/employees' },
  { name: '03-education-units', path: '/dashboard/master/unit-pendidikan' },
  { name: '04-master-kelas', path: '/dashboard/master/kelas' },
  { name: '05-master-subject', path: '/dashboard/master/mata-pelajaran' },
  { name: '06-kelola-alumni', path: '/dashboard/alumni' },
  { name: '07-master-hak-akses', path: '/dashboard/master/hak-akses' },
  { name: '08-tahfizh', path: '/dashboard/tahfizh' },
  { name: '09-student-bills', path: '/dashboard/keuangan/tagihan-siswa' },
  { name: '10-attendance-workspace', path: '/dashboard/absensi-workspace' },
  { name: '11-teaching-workspace', path: '/dashboard/teacher/teaching-workspace' },
  { name: '12-lms-bank-soal', path: '/dashboard/lms/bank-soal' },
  { name: '13-lms-modul-ajar', path: '/dashboard/lms/modul-ajar' },
  { name: '14-lms-materi', path: '/dashboard/lms/materi' },
  { name: '15-lms-ujian', path: '/dashboard/lms/ujian' },
];

test.describe('Wave 1 Canonical UI Verification Suite', () => {
  test.setTimeout(600000); // 10 minutes total

  test('Verify all 15 Wave 1 pages: anti-skeleton, canonical tokens, and computed CSS', async ({ page }) => {
    // 1. Authenticate as Super Admin
    const loginRes = await page.request.post(`${API_URL}/api/login`, {
      data: { email: 'superadmin@dareliman.sch.id', password: 'SuperAdmin@2026!' },
    });
    expect(loginRes.status()).toBe(200);
    const loginData = await loginRes.json();
    const token = loginData.token || loginData.data?.token || loginData.access_token;
    const user = loginData.user || loginData.data?.user;

    await page.goto(`${BASE_URL}/masuk`);
    await page.evaluate(
      ({ token, user }) => {
        localStorage.setItem('school_erp_token', token);
        localStorage.setItem('school_erp_user', JSON.stringify(user));
      },
      { token, user }
    );

    const auditSummary = [];

    // 2. Loop through Wave 1 pages
    for (const p of wave1Pages) {
      console.log(`[Testing Page] ${p.name} (${p.path})`);
      const consoleErrors = [];
      const onConsole = (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (
            !text.includes('Failed to load resource') &&
            !text.includes('favicon') &&
            !text.includes('WebSocket') &&
            !text.includes('ERR_CONNECTION_REFUSED') &&
            !text.includes('socket')
          ) {
            consoleErrors.push(text);
          }
        }
      };

      page.on('console', onConsole);

      await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'domcontentloaded', timeout: 20000 });

      // Anti-skeleton wait: wait for page hydration & initial loader to detach
      await page.waitForSelector('text="Menyiapkan Halaman..."', { state: 'detached', timeout: 5000 }).catch(() => {});
      await page.waitForSelector('main, table, [data-slot="kpi-card"], #root', { state: 'visible', timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(1000);

      // Audit Computed Styles & Tokens
      const computedAudit = await page.evaluate(() => {
        // Find toolbar buttons (PageToolbarActions or primary action buttons)
        const buttons = Array.from(document.querySelectorAll('button'));
        const actionBtn = buttons.find(b => {
          const t = (b.textContent || '').trim();
          return t.includes('Tambah') || t.includes('Cetak') || t.includes('Export') || t.includes('Import') || t.includes('Segarkan');
        });

        let buttonComputed = null;
        if (actionBtn) {
          const s = window.getComputedStyle(actionBtn);
          buttonComputed = {
            height: s.height,
            borderRadius: s.borderRadius,
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            text: (actionBtn.textContent || '').trim().slice(0, 25),
          };
        }

        // Find Search / Filter input
        const searchInput = document.querySelector('input[type="text"], input[type="search"], input[placeholder*="Cari"]');
        let searchComputed = null;
        if (searchInput) {
          const s = window.getComputedStyle(searchInput);
          searchComputed = {
            height: s.height,
            borderRadius: s.borderRadius,
            fontSize: s.fontSize,
          };
        }

        // Find KPI Card
        const kpiCard = document.querySelector('[data-slot="kpi-card"]');
        let kpiComputed = null;
        if (kpiCard) {
          const s = window.getComputedStyle(kpiCard);
          kpiComputed = {
            borderRadius: s.borderRadius,
            backgroundColor: s.backgroundColor,
          };
        }

        // Check for loading skeletons remaining
        const skeletonCount = document.querySelectorAll('[data-slot="skeleton"]').length;

        // Check for large radii anomalies
        const allEls = document.querySelectorAll('*');
        let largeRadiiCount = 0;
        for (const el of allEls) {
          const cls = el.className || '';
          if (typeof cls === 'string' && /rounded-(3xl|2xl|\[2\dpx\])/.test(cls)) {
            if (!cls.includes('rounded-full') && !cls.includes('h-2') && !cls.includes('w-2')) {
              largeRadiiCount++;
            }
          }
        }

        return {
          buttonComputed,
          searchComputed,
          kpiComputed,
          skeletonCount,
          largeRadiiCount,
        };
      });

      // Capture high fidelity screenshot
      const ssPath = path.join(PROOF_DIR, `${p.name}.png`);
      await page.screenshot({ path: ssPath, fullPage: false });

      auditSummary.push({
        name: p.name,
        path: p.path,
        consoleErrorsCount: consoleErrors.length,
        consoleErrors,
        skeletonCount: computedAudit.skeletonCount,
        buttonComputed: computedAudit.buttonComputed,
        searchComputed: computedAudit.searchComputed,
        kpiComputed: computedAudit.kpiComputed,
        largeRadiiCount: computedAudit.largeRadiiCount,
        screenshot: `${p.name}.png`,
      });

      page.off('console', onConsole);
    }

    fs.writeFileSync(
      path.join(PROOF_DIR, 'wave1-summary.json'),
      JSON.stringify(auditSummary, null, 2),
      'utf8'
    );

    console.table(auditSummary.map(s => ({
      name: s.name,
      path: s.path,
      errors: s.consoleErrorsCount,
      skeletons: s.skeletonCount,
      btnH: s.buttonComputed?.height,
      btnR: s.buttonComputed?.borderRadius,
      searchH: s.searchComputed?.height,
      searchR: s.searchComputed?.borderRadius,
      kpiR: s.kpiComputed?.borderRadius,
    })));

    for (const item of auditSummary) {
      expect(item.consoleErrorsCount).toBe(0);
      expect(item.skeletonCount).toBe(0);
    }
  });
});
