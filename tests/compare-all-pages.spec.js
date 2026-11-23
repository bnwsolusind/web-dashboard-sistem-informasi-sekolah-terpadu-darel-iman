import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('visual-proof/compare-all-pages');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

const testRoutes = [
  { name: 'Dashboard', path: '/dashboard' },
  { name: 'Master Siswa', path: '/dashboard/master/siswa' },
  { name: 'Pegawai & Guru', path: '/dashboard/yayasan/pegawai-guru' },
  { name: 'Unit Pendidikan', path: '/dashboard/yayasan/unit-pendidikan' },
  { name: 'Tahfizh', path: '/dashboard/tahfizh' },
  { name: 'Keuangan Tagihan', path: '/dashboard/keuangan/tagihan-siswa' },
  { name: 'LMS Bank Soal', path: '/dashboard/lms/bank-soal' },
  { name: 'Laporan Absensi', path: '/dashboard/laporan-absensi' },
];

async function inspectRoute(page, routeName) {
  return await page.evaluate((rName) => {
    // 1. Primary Button
    const primaryBtn = document.querySelector('button.bg-emerald-600, [data-slot="button"][data-color="primary"], .button--primary, button[type="submit"]');
    // 2. Secondary Button
    const secondaryBtn = document.querySelector('button.border-slate-200, [data-slot="button"][data-variant="outline"], .button--secondary');
    // 3. KPI / Stat Card
    const kpiCards = Array.from(document.querySelectorAll('.rounded-2xl, .rounded-xl, [data-slot="card"], .card')).filter(el => {
      return el.querySelector('svg') && (el.innerText.match(/\d+/) || el.querySelector('.text-2xl, .text-xl'));
    });
    // 4. Table Header
    const tableHeader = document.querySelector('thead, th');
    // 5. Sidebar Active
    const sidebarActive = document.querySelector('aside.site-sidebar a.bg-emerald-600, aside.site-sidebar button.bg-emerald-600, aside a[class*="bg-emerald"], aside button[class*="bg-emerald"], aside [data-active="true"]');
    // 6. Canvas Background
    const canvasMain = document.querySelector('main, .app-main, #root, body');

    function getElData(el) {
      if (!el) return null;
      const s = window.getComputedStyle(el);
      const icon = el.querySelector('svg');
      const iconStyles = icon ? window.getComputedStyle(icon) : null;
      return {
        tag: el.tagName,
        text: el.innerText ? el.innerText.trim().slice(0, 30) : '',
        bg: s.backgroundColor,
        color: s.color,
        borderRadius: s.borderRadius,
        height: s.height,
        iconColor: iconStyles ? iconStyles.color : null
      };
    }

    const kpiData = kpiCards.slice(0, 3).map(c => {
      const iconBox = c.querySelector('div:has(svg), span:has(svg)');
      const icon = c.querySelector('svg');
      const boxStyle = iconBox ? window.getComputedStyle(iconBox) : null;
      const iconStyle = icon ? window.getComputedStyle(icon) : null;
      return {
        cardBg: window.getComputedStyle(c).backgroundColor,
        cardRadius: window.getComputedStyle(c).borderRadius,
        boxBg: boxStyle ? boxStyle.backgroundColor : null,
        boxRadius: boxStyle ? boxStyle.borderRadius : null,
        iconColor: iconStyle ? iconStyle.color : null
      };
    });

    return {
      routeName: rName,
      canvasBg: canvasMain ? window.getComputedStyle(canvasMain).backgroundColor : null,
      primaryBtn: getElData(primaryBtn),
      secondaryBtn: getElData(secondaryBtn),
      sidebarActive: getElData(sidebarActive),
      tableHeader: getElData(tableHeader),
      kpiCount: kpiCards.length,
      kpis: kpiData
    };
  }, routeName);
}

test.describe('Audit Seluruh Modul: Staging vs Local', () => {
  test.setTimeout(240000);

  test('Compare 8 Representative Core Modules', async ({ request, browser }) => {
    // 1. Dapatkan Token Local
    let localToken = '';
    let localUser = null;
    try {
      const loginRes = await request.post('http://127.0.0.1:8000/api/login', {
        data: { email: 'superadmin@dareliman.sch.id', password: 'SuperAdmin@2026!' }
      });
      if (loginRes.ok()) {
        const data = await loginRes.json();
        localToken = data.token || data.data?.token || data.access_token;
        localUser = data.user || data.data?.user;
      }
    } catch (e) {
      console.log('Local auth error:', e.message);
    }

    const localContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const localPage = await localContext.newPage();
    
    // Auth inject Local
    await localPage.goto('http://localhost:5173/masuk', { waitUntil: 'domcontentloaded' });
    if (localToken && localUser) {
      await localPage.evaluate(({ token, user }) => {
        localStorage.setItem('school_erp_token', token);
        localStorage.setItem('school_erp_user', JSON.stringify(user));
        localStorage.setItem('theme', 'light');
      }, { token: localToken, user: localUser });
    }

    // 2. Setup Staging Context
    const stagingContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const stagingPage = await stagingContext.newPage();
    await stagingPage.goto('https://demoedu.dareliman.sch.id/masuk', { waitUntil: 'domcontentloaded' });
    await stagingPage.fill('input[type="email"], input[name="email"], input[type="text"]', 'superadmin@dareliman.sch.id');
    await stagingPage.fill('input[type="password"]', 'SuperAdmin@2026!');
    await stagingPage.click('button[type="submit"]');
    await stagingPage.waitForTimeout(3000);

    const report = {
      local: {},
      staging: {}
    };

    // Loop through each route
    for (const r of testRoutes) {
      console.log(`Checking route: ${r.name} (${r.path}) ...`);

      // LOCAL
      try {
        await localPage.goto(`http://localhost:5173${r.path}`, { waitUntil: 'domcontentloaded' });
        await localPage.waitForTimeout(1500);
        await localPage.screenshot({ path: path.join(OUT_DIR, `local-${r.name.toLowerCase().replace(/\s+/g, '-')}.png`), fullPage: false });
        report.local[r.name] = await inspectRoute(localPage, r.name);
      } catch (err) {
        report.local[r.name] = { error: err.message };
      }

      // STAGING
      try {
        await stagingPage.goto(`https://demoedu.dareliman.sch.id${r.path}`, { waitUntil: 'domcontentloaded' });
        await stagingPage.waitForTimeout(1500);
        await stagingPage.screenshot({ path: path.join(OUT_DIR, `staging-${r.name.toLowerCase().replace(/\s+/g, '-')}.png`), fullPage: false });
        report.staging[r.name] = await inspectRoute(stagingPage, r.name);
      } catch (err) {
        report.staging[r.name] = { error: err.message };
      }
    }

    fs.writeFileSync(path.join(OUT_DIR, 'full_comparison_report.json'), JSON.stringify(report, null, 2));
    console.log('Full comparison across all modules completed!');
  });
});

