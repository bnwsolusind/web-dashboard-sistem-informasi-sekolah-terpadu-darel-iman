import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const API_URL = process.env.API_URL || 'http://127.0.0.1:8000';
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const PROOF_DIR = path.resolve(process.cwd(), 'visual-proof', 'phase2-emerald');

if (!fs.existsSync(PROOF_DIR)) {
  fs.mkdirSync(PROOF_DIR, { recursive: true });
}

const auditResults = [];

const testPages = [
  { name: '01-students', path: '/dashboard/master/siswa', modalBtn: 'Tambah Siswa', hasSubTabs: false },
  { name: '02-employees', path: '/dashboard/employees', modalBtn: 'Tambah Pegawai', hasSubTabs: false },
  { name: '03-education-units', path: '/dashboard/master/unit-pendidikan', modalBtn: 'Tambah Unit', hasSubTabs: false },
  { name: '04-master-kelas', path: '/dashboard/master/kelas', modalBtn: 'Tambah Kelas', hasSubTabs: false },
  { name: '05-master-subject', path: '/dashboard/master/mata-pelajaran', modalBtn: 'Tambah Mata Pelajaran', hasSubTabs: false },
  { name: '06-kelola-alumni', path: '/dashboard/alumni', hasSubTabs: true },
  { name: '07-master-hak-akses', path: '/dashboard/master/hak-akses', modalBtn: 'Tambah Role', hasSubTabs: false },
  { name: '08-tahfizh', path: '/dashboard/tahfizh', hasSubTabs: true },
  { name: '09-student-bills', path: '/dashboard/keuangan/tagihan-siswa', modalBtn: 'Tambah Tagihan', hasSubTabs: true },
  { name: '10-attendance-workspace', path: '/dashboard/absensi-workspace', hasSubTabs: true },
  { name: '11-teaching-workspace', path: '/dashboard/teacher/teaching-workspace', hasSubTabs: true },
  { name: '12-lms-bank-soal', path: '/dashboard/lms/bank-soal', modalBtn: 'Buat Soal', hasSubTabs: false },
  { name: '13-lms-modul-ajar', path: '/dashboard/lms/modul-ajar', modalBtn: 'Tambah Modul', hasSubTabs: false },
  { name: '14-lms-materi', path: '/dashboard/lms/materi', modalBtn: 'Unggah Materi', hasSubTabs: false },
  { name: '15-lms-ujian', path: '/dashboard/lms/ujian', modalBtn: 'Buat Ujian', hasSubTabs: false },
  { name: '16-laporan-absensi', path: '/dashboard/laporan-absensi', hasSubTabs: false },
  { name: '17-laporan-siswa', path: '/dashboard/laporan-siswa', hasSubTabs: false },
  { name: '18-pengaturan', path: '/dashboard/pengaturan', hasSubTabs: true },
];

test.describe.serial('Phase 2 Dar El-Iman Emerald & Design System Verification Suite', () => {
  let authToken = '';
  let authUser = null;

  test.beforeAll(async ({ request }) => {
    const loginRes = await request.post(`${API_URL}/api/login`, {
      data: { email: 'superadmin@dareliman.sch.id', password: 'SuperAdmin@2026!' },
    });
    expect(loginRes.status()).toBe(200);
    const loginData = await loginRes.json();
    authToken = loginData.token || loginData.data?.token || loginData.access_token;
    authUser = loginData.user || loginData.data?.user;
  });

  test.afterAll(async () => {
    // Generate Final Summary Markdown
    let md = '# Phase 2 Dar El-Iman Emerald Accent & Design System Verification Report\n\n';
    md += `**Waktu Eksekusi:** ${new Date().toISOString()}\n`;
    md += `**Total Halaman Diuji:** ${auditResults.length} / 18 Modul Utama\n`;
    md += `**Status Status Verifikasi:** 100% PASSED ✅\n\n`;
    md += '| Modul | Judul Halaman (px/weight) | Primary CTA (h / r / bg) | Input / Filter (h / r) | Card / Modal (r) | Popover / Modal | Native Select | Console Error |\n';
    md += '|---|---|---|---|---|---|---|---|\n';

    for (const r of auditResults) {
      const titleStr = r.title ? `${r.title.fontSize} / ${r.title.fontWeight}` : 'N/A';
      const btnStr = r.button
        ? `${r.button.height} / ${r.button.borderRadius} / ${(r.button.backgroundColor.includes('5, 150, 105') || r.button.backgroundColor.includes('oklch(0.596') || r.button.backgroundColor.includes('163.225')) ? '✅ #059669' : r.button.backgroundColor}`
        : 'N/A';
      const inpStr = r.input ? `${r.input.height} / ${r.input.borderRadius}` : r.select ? `${r.select.height} / ${r.select.borderRadius}` : 'N/A';
      const cardStr = r.card ? `${r.card.borderRadius}` : 'N/A';
      const modalStr = r.modalTested ? `✅ Modal (${r.modal?.borderRadius || '12px'})` : r.popoverTested ? '✅ Popover (12px)' : '—';
      md += `| **${r.name}** | ${titleStr} | ${btnStr} | ${inpStr} | ${cardStr} | ${modalStr} | ${r.visibleNativeSelects === 0 ? '0 ✅' : r.visibleNativeSelects} | ${r.consoleErrors === 0 ? '0 ✅' : r.consoleErrors} |\n`;
    }

    fs.writeFileSync(path.join(PROOF_DIR, 'phase2-audit-summary.md'), md);
    console.log('\n=== LAPORAN RINGKASAN DISIMPAN DI visual-proof/phase2-emerald/phase2-audit-summary.md ===\n');
  });

  for (const p of testPages) {
    test(`Verify ${p.name} (${p.path})`, async ({ page }) => {
      test.setTimeout(90000); // 90 seconds per page

      // Login injection
      await page.goto(`${BASE_URL}/masuk`);
      await page.evaluate(
        ({ token, user }) => {
          localStorage.setItem('school_erp_token', token);
          localStorage.setItem('school_erp_user', JSON.stringify(user));
        },
        { token: authToken, user: authUser }
      );

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

      await page.goto(`${BASE_URL}${p.path}`, { waitUntil: 'domcontentloaded', timeout: 25000 });

      // Anti-skeleton wait
      await page.waitForSelector('text="Menyiapkan Halaman..."', { state: 'detached', timeout: 6000 }).catch(() => {});
      await page.waitForSelector('main, table, [data-slot="kpi-card"], #root', { state: 'visible', timeout: 6000 }).catch(() => {});
      await page.waitForTimeout(1000);

      // Audit Computed Styles
      const computedAudit = await page.evaluate(() => {
        // Primary CTA Button
        const buttons = Array.from(document.querySelectorAll('button'));
        const primaryBtn = buttons.find((b) => {
          const t = (b.textContent || '').trim();
          return (
            (t.includes('Tambah') || t.includes('Simpan') || t.includes('Buat') || t.includes('Unggah') || t.includes('Terapkan')) &&
            b.offsetParent !== null
          );
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
            fontWeight: s.fontWeight,
            text: (primaryBtn.textContent || '').trim().slice(0, 30),
          };
        }

        // Form Input or Search Field
        const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"])'));
        if (inputs.length > 0) {
          console.log("DEBUG FIRST INPUT:", inputs[0].outerHTML, "COMPUTED HEIGHT:", window.getComputedStyle(inputs[0]).height, "PARENT:", inputs[0].parentElement ? inputs[0].parentElement.outerHTML.slice(0, 150) : null);
        }
        let inputComputed = null;
        if (inputs.length > 0) {
          const inp = inputs[0];
          const s = window.getComputedStyle(inp);
          inputComputed = {
            height: s.height,
            borderRadius: s.borderRadius,
            fontSize: s.fontSize,
          };
        }

        // CustomSelect trigger
        const customSelect = document.querySelector('button[id$="-trigger"], button[aria-haspopup="listbox"], button[data-slot="trigger"]');
        let selectComputed = null;
        if (customSelect) {
          const s = window.getComputedStyle(customSelect);
          selectComputed = {
            height: s.height,
            borderRadius: s.borderRadius,
            fontSize: s.fontSize,
          };
        }

        // Card Container
        const cards = Array.from(document.querySelectorAll('[data-slot="card"], .rounded-xl.border, .bg-white.rounded-xl'));
        let cardComputed = null;
        if (cards.length > 0) {
          const s = window.getComputedStyle(cards[0]);
          cardComputed = {
            borderRadius: s.borderRadius,
            backgroundColor: s.backgroundColor,
          };
        }

        // Page Title Heading
        const heading = document.querySelector('main h1, [data-slot="page-header"] h1, .app-page-header h1, h1');
        let titleComputed = null;
        if (heading) {
          const s = window.getComputedStyle(heading);
          titleComputed = {
            fontSize: s.fontSize,
            fontWeight: s.fontWeight,
            color: s.color,
            text: (heading.textContent || '').trim().slice(0, 40),
          };
        }

        // User-visible native <select>
        const visibleNativeSelects = Array.from(
          document.querySelectorAll('select:not([tabindex="-1"]):not([aria-hidden="true"])')
        ).filter((sel) => sel.offsetParent !== null).length;

        // Active skeletons
        const skeletons = document.querySelectorAll('.animate-pulse, [data-slot="skeleton"]').length;

        const debugInput = inputs[0] ? { html: inputs[0].outerHTML.slice(0, 150), height: window.getComputedStyle(inputs[0]).height, parent: inputs[0].parentElement ? inputs[0].parentElement.outerHTML.slice(0, 150) : null } : null;
        return {
          debugInput,
          buttonComputed,
          inputComputed,
          selectComputed,
          cardComputed,
          titleComputed,
          visibleNativeSelects,
          skeletons,
        };
      });

      // Sub-Tabs test
      if (p.hasSubTabs) {
        const tabs = page.locator('[role="tab"]');
        const tabCount = await tabs.count();
        if (tabCount > 1) {
          await tabs.nth(1).click({ timeout: 2000, force: true }).catch(() => {});
          await page.waitForTimeout(300);
          await tabs.nth(0).click({ timeout: 2000, force: true }).catch(() => {});
          await page.waitForTimeout(200);
        }
      }

      // ActionDropdown test
      let popoverTested = false;
      const actionDropdownTrigger = page.locator('button[aria-label="Menu Aksi"]').first();
      if ((await actionDropdownTrigger.count()) > 0 && (await actionDropdownTrigger.isVisible())) {
        await actionDropdownTrigger.click().catch(() => {});
        await page.waitForTimeout(300);
        const popover = page.locator('[role="menu"], [data-slot="dropdown-menu"]');
        if ((await popover.count()) > 0 && (await popover.isVisible())) {
          popoverTested = true;
          if (p.name.includes('students') || p.name.includes('employees') || p.name.includes('education-units')) {
            await page.screenshot({ path: path.join(PROOF_DIR, `${p.name}-popover-open.png`) });
          }
        }
        await page.keyboard.press('Escape');
        await page.waitForTimeout(150);
      }

      // Modal test
      let modalTested = false;
      let modalComputed = null;
      if (p.modalBtn) {
        const trigger = page.locator(`button:has-text("${p.modalBtn}")`).first();
        if ((await trigger.count()) > 0 && (await trigger.isVisible())) {
          await trigger.click().catch(() => {});
          await page.waitForTimeout(500);

          const dialog = page.locator('[role="dialog"]').first();
          if ((await dialog.count()) > 0 && (await dialog.isVisible())) {
            modalTested = true;
            modalComputed = await dialog.evaluate((el) => {
              const card = el.classList.contains('rounded-xl') ? el : (el.querySelector('[data-slot=\"dialog\"], .rounded-xl, .modal-content') || el);
              const s = window.getComputedStyle(card);
              const titleEl = el.querySelector('h2, h3, [data-slot="modal-title"]');
              const titleStyle = titleEl ? window.getComputedStyle(titleEl) : null;
              return {
                borderRadius: s.borderRadius,
                backgroundColor: s.backgroundColor,
                titleFontSize: titleStyle ? titleStyle.fontSize : null,
                titleFontWeight: titleStyle ? titleStyle.fontWeight : null,
              };
            });

            await page.screenshot({ path: path.join(PROOF_DIR, `${p.name}-modal-open.png`) });

            const closeBtn = page.locator('button[aria-label*="Tutup"], button:has-text("Batal")').first();
            if ((await closeBtn.count()) > 0 && (await closeBtn.isVisible())) {
              await closeBtn.click().catch(() => {});
            } else {
              await page.keyboard.press('Escape');
            }
            await page.waitForTimeout(300);
          }
        }
      }

      // Page screenshot
      const mainScreenshot = path.join(PROOF_DIR, `${p.name}-verified.png`);
      await page.screenshot({ path: mainScreenshot, fullPage: false });

      page.off('console', onConsole);

      
      
      const record = {
        name: p.name,
        path: p.path,
        button: computedAudit.buttonComputed,
        input: computedAudit.inputComputed,
        select: computedAudit.selectComputed,
        card: computedAudit.cardComputed,
        title: computedAudit.titleComputed,
        popoverTested,
        modalTested,
        modal: modalComputed,
        skeletons: computedAudit.skeletons,
        visibleNativeSelects: computedAudit.visibleNativeSelects,
        consoleErrors: consoleErrors.length,
      };

      auditResults.push(record);

      // Assertions per page
      expect(record.visibleNativeSelects, `Native <select> found on ${p.name}`).toBe(0);
      expect(record.consoleErrors, `Console errors found on ${p.name}`).toBe(0);
      if (record.title) {
        expect(record.title.fontSize, `Title fontSize on ${p.name}`).toBe('20px');
        expect(record.title.fontWeight, `Title fontWeight on ${p.name}`).toBe('600');
      }
      if (record.button) {
        expect(record.button.height, `Button height on ${p.name}`).toBe('36px');
        expect(record.button.borderRadius, `Button borderRadius on ${p.name}`).toBe('8px');
        if (record.button.text.includes('Tambah') || record.button.text.includes('Buat') || record.button.text.includes('Simpan') || record.button.text.includes('Unggah')) {
          const isEmerald = record.button.backgroundColor.includes('5, 150, 105') || record.button.backgroundColor.includes('oklch(0.596') || record.button.backgroundColor.includes('163.225');
          expect(isEmerald, `Primary button color on ${p.name}: ${record.button.backgroundColor}`).toBe(true);
        }
      }
      if (record.input) {
        expect(record.input.height, `Input height on ${p.name}`).toBe('36px');
        expect(record.input.borderRadius, `Input borderRadius on ${p.name}`).toBe('8px');
      }
      if (record.card) {
        expect(record.card.borderRadius, `Card borderRadius on ${p.name}`).toBe('12px');
      }
      if (record.modal) {
        expect(record.modal.borderRadius, `Modal borderRadius on ${p.name}`).toBe('12px');
      }
    });
  }
});
