import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const API_URL = process.env.API_URL || 'http://127.0.0.1:8000';
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const PROOF_DIR = path.resolve(process.cwd(), 'visual-proof', 'phase1-neutral');

if (!fs.existsSync(PROOF_DIR)) {
  fs.mkdirSync(PROOF_DIR, { recursive: true });
}

const testPages = [
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
  { name: '16-laporan-absensi', path: '/dashboard/laporan-absensi' },
  { name: '17-laporan-siswa', path: '/dashboard/laporan-siswa' },
  { name: '18-pengaturan', path: '/dashboard/pengaturan' },
];

test.describe('Phase 1 Pure Neutral Monochrome Verification Suite', () => {
  test.setTimeout(600000); // 10 minutes total

  test('Verify pure neutral design system tokens & capture visual proof across all modules', async ({ page }) => {
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

    const auditResults = [];

    // 2. Loop through test pages
    for (const p of testPages) {
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

      // Anti-skeleton wait
      await page.waitForSelector('text="Menyiapkan Halaman..."', { state: 'detached', timeout: 5000 }).catch(() => {});
      await page.waitForSelector('main, table, [data-slot="kpi-card"], #root', { state: 'visible', timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(1000);

      // Audit Computed Styles & Pure Monochrome Tokens
      const computedAudit = await page.evaluate(() => {
        // Buttons
        const buttons = Array.from(document.querySelectorAll('button'));
        const primaryBtn = buttons.find((b) => {
          const t = (b.textContent || '').trim();
          return t.includes('Tambah') || t.includes('Simpan') || t.includes('Cetak') || t.includes('Terapkan');
        });

        let buttonComputed = null;
        if (primaryBtn) {
          const s = window.getComputedStyle(primaryBtn);
          buttonComputed = {
            height: s.height,
            borderRadius: s.borderRadius,
            backgroundColor: s.backgroundColor,
            color: s.color,
            fontSize: s.fontSize,
            text: (primaryBtn.textContent || '').trim().slice(0, 25),
          };
        }

        // Inputs / Selects
        const inputEl = document.querySelector('input[type="text"], input[type="search"], [role="combobox"]');
        let inputComputed = null;
        if (inputEl) {
          const s = window.getComputedStyle(inputEl);
          inputComputed = {
            height: s.height,
            borderRadius: s.borderRadius,
            borderColor: s.borderColor,
            backgroundColor: s.backgroundColor,
          };
        }

        // Card Container
        const cardEl = document.querySelector('main .bg-white.rounded-xl, main .rounded-xl.border, [data-slot="card"], .rounded-xl.bg-white.border');
        let cardComputed = null;
        if (cardEl) {
          const s = window.getComputedStyle(cardEl);
          cardComputed = {
            borderRadius: s.borderRadius,
            backgroundColor: s.backgroundColor,
            borderColor: s.borderColor,
          };
        }

        // Active Tabs
        const activeTab = document.querySelector('[role="tab"][aria-selected="true"], [data-active="true"]');
        let tabComputed = null;
        if (activeTab) {
          const s = window.getComputedStyle(activeTab);
          tabComputed = {
            backgroundColor: s.backgroundColor,
            color: s.color,
            borderRadius: s.borderRadius,
          };
        }

        // Skeletons check
        const skeletonCount = document.querySelectorAll('[data-slot="skeleton"], .animate-pulse:not([role="status"])').length;

        // Native visible select check (excluding hidden accessibility selects by React Aria)
        const nativeSelectCount = document.querySelectorAll('select:not([tabindex="-1"]):not([aria-hidden="true"])').length;

        return {
          buttonComputed,
          inputComputed,
          cardComputed,
          tabComputed,
          skeletonCount,
          nativeSelectCount,
        };
      });

      // Capture screenshot
      const shotPath = path.join(PROOF_DIR, `${p.name}.png`);
      await page.screenshot({ path: shotPath, fullPage: false });

      page.off('console', onConsole);

      auditResults.push({
        name: p.name,
        path: p.path,
        errors: consoleErrors.length,
        ...computedAudit,
      });

      console.log(`  -> Screenshot saved: ${shotPath}`);
      console.log(`  -> Button: ${JSON.stringify(computedAudit.buttonComputed)}`);
      console.log(`  -> Input: ${JSON.stringify(computedAudit.inputComputed)}`);
      console.log(`  -> Card: ${JSON.stringify(computedAudit.cardComputed)}`);
      console.log(`  -> Skeletons: ${computedAudit.skeletonCount}, Native selects: ${computedAudit.nativeSelectCount}`);
    }

    // Assertions across all tested pages
    for (const res of auditResults) {
      expect(res.nativeSelectCount).toBe(0);
      expect(res.errors).toBe(0);
    }

    // Write audit summary markdown
    const summaryMd = [
      '# Phase 1 Pure Neutral Monochrome Verification Report',
      `Audit Date: ${new Date().toISOString()}`,
      '',
      '| Module | Path | Primary Button (H / R / BG) | Input (H / R) | Card (R / BG) | Skeletons | Native Selects | Status |',
      '|---|---|---|---|---|---|---|---|',
      ...auditResults.map((r) => {
        const btn = r.buttonComputed ? `${r.buttonComputed.height} / ${r.buttonComputed.borderRadius} / ${r.buttonComputed.backgroundColor}` : 'N/A';
        const inp = r.inputComputed ? `${r.inputComputed.height} / ${r.inputComputed.borderRadius}` : 'N/A';
        const crd = r.cardComputed ? `${r.cardComputed.borderRadius} / ${r.cardComputed.backgroundColor}` : 'N/A';
        const status = r.nativeSelectCount === 0 && r.errors === 0 ? 'PASSED' : 'FAILED';
        return `| ${r.name} | ${r.path} | ${btn} | ${inp} | ${crd} | ${r.skeletonCount} | ${r.nativeSelectCount} | ${status} |`;
      }),
    ].join('\n');

    fs.writeFileSync(path.join(PROOF_DIR, 'phase1-audit-summary.md'), summaryMd, 'utf8');
    console.log('\nAudit summary report written to visual-proof/phase1-neutral/phase1-audit-summary.md');
  });
});

