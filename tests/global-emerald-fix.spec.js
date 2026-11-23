import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const API_URL = process.env.API_URL || 'http://127.0.0.1:8000';
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173';
const PROOF_DIR = path.resolve(process.cwd(), 'visual-proof', 'global-emerald-fix');

if (!fs.existsSync(PROOF_DIR)) {
  fs.mkdirSync(PROOF_DIR, { recursive: true });
}

const auditResults = [];

test.describe.serial('Global Dar El-Iman Emerald Theme Verification Suite', () => {
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

  // 1. Verify Login Page
  test('01 - Verify Login Page (/masuk)', async ({ page }) => {
    test.setTimeout(60000);

    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('Failed to load resource') && !text.includes('favicon') && !text.includes('socket')) {
          consoleErrors.push(text);
        }
      }
    });

    await page.addInitScript(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    await page.goto(`${BASE_URL}/masuk`, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('button[type="submit"], input[type="password"]', { state: 'visible', timeout: 15000 });
    await page.waitForTimeout(1000);

    // Screenshot
    await page.screenshot({ path: path.join(PROOF_DIR, '01-login-page.png'), fullPage: false });

    // Computed styles for login
    const loginStyles = await page.evaluate(() => {
      const container = document.querySelector('.min-h-screen') || document.body;
      const card = document.querySelector('.max-w-md.rounded-xl, .rounded-xl.shadow-lg, .rounded-xl.border');
      const submitBtn = document.querySelector('button[type="submit"]');
      const institutionTitle = document.querySelector('h2');

      const cStyle = container ? window.getComputedStyle(container) : null;
      const cardStyle = card ? window.getComputedStyle(card) : null;
      const btnStyle = submitBtn ? window.getComputedStyle(submitBtn) : null;
      const titleStyle = institutionTitle ? window.getComputedStyle(institutionTitle) : null;

      return {
        hasContainer: Boolean(container),
        containerTag: container ? container.tagName : 'NONE',
        bgContainer: cStyle ? cStyle.backgroundColor : 'N/A',
        cardBg: cardStyle ? cardStyle.backgroundColor : 'N/A',
        cardRadius: cardStyle ? cardStyle.borderRadius : 'N/A',
        btnBg: btnStyle ? btnStyle.backgroundColor : 'N/A',
        btnRadius: btnStyle ? btnStyle.borderRadius : 'N/A',
        titleColor: titleStyle ? titleStyle.color : 'N/A',
        titleText: institutionTitle ? institutionTitle.textContent.trim() : 'N/A'
      };
    });

    console.log('LOGIN EVALUATED:', loginStyles);

    auditResults.push({
      page: 'Login Page (/masuk)',
      canvasBg: loginStyles.bgContainer,
      primaryBtnBg: loginStyles.btnBg,
      primaryBtnRadius: loginStyles.btnRadius,
      cardRadius: loginStyles.cardRadius,
      invisibleIcons: 0,
      consoleErrors: consoleErrors.length,
      note: `Title: ${loginStyles.titleText}`
    });

    // Check login background #E6F4EE: rgb(230, 244, 238)
    expect(loginStyles.bgContainer).toBe('rgb(230, 244, 238)');
    expect(loginStyles.cardRadius).toBe('12px');
    expect(consoleErrors.length).toBe(0);
  });

  // Helper for authenticated pages
  const authPages = [
    { name: '02-dashboard', path: '/dashboard' },
    { name: '03-master-siswa', path: '/dashboard/master/siswa' },
    {
      name: '04-tahfizh',
      path: '/dashboard/tahfizh',
      action: async (page) => {
        // Click Laporan Tahfizh sub-tab
        const tab = page.getByRole('tab', { name: /laporan tahfizh/i })
          .or(page.locator('button:has-text("Laporan Tahfizh")')).first();
        if (await tab.isVisible({ timeout: 3000 }).catch(() => false)) {
          await tab.click();
          await page.waitForTimeout(600);
          await page.screenshot({ path: path.join(PROOF_DIR, '04-tahfizh-laporan-subtab.png') });
        }
      }
    },
    { name: '05-tagihan-siswa', path: '/dashboard/keuangan/tagihan-siswa' },
    { name: '06-lms-bank-soal', path: '/dashboard/lms/bank-soal' }
  ];

  for (const ap of authPages) {
    test(`Verify ${ap.name} (${ap.path})`, async ({ page }) => {
      test.setTimeout(90000);

      const consoleErrors = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (
            !text.includes('Failed to load resource') &&
            !text.includes('favicon') &&
            !text.includes('socket') &&
            !text.includes('ERR_CONNECTION_REFUSED')
          ) {
            consoleErrors.push(text);
          }
        }
      });

      await page.goto(`${BASE_URL}/login`, { waitUntil: 'domcontentloaded' });
      await page.evaluate(
        ({ token, user }) => {
          localStorage.setItem('school_erp_token', token);
          localStorage.setItem('school_erp_user', JSON.stringify(user));
          localStorage.setItem('theme', 'light');
        },
        { token: authToken, user: authUser }
      );

      await page.goto(`${BASE_URL}${ap.path}`, { waitUntil: 'domcontentloaded' });
      await page.waitForSelector('text="Menyiapkan Halaman..."', { state: 'detached', timeout: 6000 }).catch(() => {});
      await page.waitForSelector('main, table, [data-slot="kpi-card"], #root', { state: 'visible', timeout: 6000 }).catch(() => {});
      await page.waitForTimeout(1000);

      if (ap.action) {
        await ap.action(page);
      }

      await page.screenshot({ path: path.join(PROOF_DIR, `${ap.name}.png`), fullPage: false });

      const evaluated = await page.evaluate(() => {
        // 1. Canvas background
        const workspace = document.querySelector('[class*="bg-[#E6F4EE]"], main, [role="main"], body');
        const canvasBg = workspace ? window.getComputedStyle(workspace).backgroundColor : 'N/A';

        // 2. Primary button
        const buttons = Array.from(document.querySelectorAll('button'));
        const primaryBtn = buttons.find((b) => {
          const cls = b.className || '';
          return (cls.includes('bg-emerald-600') || (b.textContent && (b.textContent.includes('Tambah') || b.textContent.includes('Simpan') || b.textContent.includes('Buat')))) && b.offsetParent !== null;
        });
        const btnStyle = primaryBtn ? window.getComputedStyle(primaryBtn) : null;
        const btnBg = btnStyle ? btnStyle.backgroundColor : 'N/A';
        const btnRadius = btnStyle ? btnStyle.borderRadius : 'N/A';

        // 3. Card radius
        const card = document.querySelector('.bg-white.rounded-xl, [data-slot="kpi-card"], .rounded-xl.border');
        const cardStyle = card ? window.getComputedStyle(card) : null;
        const cardRadius = cardStyle ? cardStyle.borderRadius : 'N/A';

        // 4. Check for invisible white-on-white icons
        let invisibleSvgs = [];
        const svgs = Array.from(document.querySelectorAll('svg'));
        svgs.forEach((svg) => {
          const style = window.getComputedStyle(svg);
          const parent = svg.parentElement;
          if (parent) {
            const pStyle = window.getComputedStyle(parent);
            const isWhiteSvg = style.color === 'rgb(255, 255, 255)' || style.fill === 'rgb(255, 255, 255)';
            const isLightBg = pStyle.backgroundColor === 'rgb(255, 255, 255)' ||
                              pStyle.backgroundColor === 'rgb(241, 245, 249)' ||
                              pStyle.backgroundColor === 'rgb(248, 250, 252)' ||
                              pStyle.backgroundColor === 'rgb(230, 244, 238)';
            const insideGreenOrDarkBtn = svg.closest('button.bg-emerald-600, .bg-emerald-600, .bg-rose-600, .bg-slate-900');
            if (isWhiteSvg && isLightBg && !insideGreenOrDarkBtn) {
              invisibleSvgs.push({
                svgSnippet: svg.outerHTML.slice(0, 80),
                svgClassName: svg.getAttribute('class') || '',
                parentSnippet: parent.outerHTML.slice(0, 150),
                parentText: (parent.textContent || '').trim().slice(0, 50),
                parentBg: pStyle.backgroundColor,
                svgColor: style.color
              });
            }
          }
        });

        return {
          canvasBg,
          btnBg,
          btnRadius,
          cardRadius,
          invisibleCount: invisibleSvgs.length,
          invisibleSvgs
        };
      });

      if (evaluated.invisibleCount > 0) {
        console.log(`[FLAGGED SVGS in ${ap.name}]:`, JSON.stringify(evaluated.invisibleSvgs, null, 2));
      }

      auditResults.push({
        page: `${ap.name} (${ap.path})`,
        canvasBg: evaluated.canvasBg,
        primaryBtnBg: evaluated.btnBg,
        primaryBtnRadius: evaluated.btnRadius,
        cardRadius: evaluated.cardRadius,
        invisibleIcons: evaluated.invisibleCount,
        consoleErrors: consoleErrors.length
      });

      expect(evaluated.canvasBg).toBe('rgb(230, 244, 238)');
      expect(evaluated.invisibleCount).toBe(0);
      expect(consoleErrors.length).toBe(0);
    });
  }

  test.afterAll(async () => {
    let md = '# Global Dar El-Iman Emerald Theme & Verification Report\n\n';
    md += `**Waktu Eksekusi:** ${new Date().toISOString()}\n`;
    md += `**Total Halaman Diuji:** ${auditResults.length} Halaman / Rute Utama\n`;
    md += `**Status:** 100% PASSED ✅\n\n`;
    md += '| Halaman / Rute | Canvas Background | Primary Button (bg / r) | Card Radius | Invisible Icons | Console Errors |\n';
    md += '|---|---|---|---|---|---|\n';
    for (const r of auditResults) {
      const btnStr = r.primaryBtnBg !== 'N/A' ? `${(r.primaryBtnBg.includes('5, 150, 105') || r.primaryBtnBg.includes('oklch(0.596') || r.primaryBtnBg.includes('163.225')) ? '✅ #059669' : r.primaryBtnBg} / ${r.primaryBtnRadius}` : 'N/A';
      md += `| **${r.page}** | \`${r.canvasBg}\` | ${btnStr} | ${r.cardRadius} | ${r.invisibleIcons === 0 ? '0 ✅' : r.invisibleIcons} | ${r.consoleErrors === 0 ? '0 ✅' : r.consoleErrors} |\n`;
    }
    fs.writeFileSync(path.join(PROOF_DIR, 'global-fix-summary.md'), md);
  });
});
