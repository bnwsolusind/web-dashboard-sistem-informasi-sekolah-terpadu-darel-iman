import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('visual-proof/compare-local-vs-staging');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function inspectPage(page, name) {
  return await page.evaluate((pageName) => {
    // Primary Button (Tambah, Simpan, dll)
    const primaryBtn = document.querySelector('button.bg-emerald-600, [data-slot="button"][data-color="primary"], .button--primary, button[type="submit"]');
    // Secondary / Outline Button (Filter, Export, dll)
    const secondaryBtn = document.querySelector('button.border-slate-200, [data-slot="button"][data-variant="outline"], .button--secondary');
    // Card container
    const card = document.querySelector('.rounded-2xl, .rounded-xl, [data-slot="card"], .card, .bg-white.shadow-sm, .bg-white.shadow-md');
    // Canvas background
    const pageMain = document.querySelector('main, .app-main, [class*="bg-"]');
    // Table Header
    const tableHeader = document.querySelector('thead, th');
    // Active Sidebar item
    const sidebarActive = document.querySelector('.bg-emerald-600, .bg-slate-900, [data-active="true"]');
    // Icon inside button
    const primaryBtnIcon = primaryBtn ? primaryBtn.querySelector('svg') : null;
    const secondaryBtnIcon = secondaryBtn ? secondaryBtn.querySelector('svg') : null;

    function getStyles(el) {
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
        boxShadow: s.boxShadow,
        iconColor: iconStyles ? iconStyles.color : null
      };
    }

    return {
      env: pageName,
      canvasBg: pageMain ? window.getComputedStyle(pageMain).backgroundColor : null,
      primaryButton: getStyles(primaryBtn),
      primaryButtonIconColor: primaryBtnIcon ? window.getComputedStyle(primaryBtnIcon).color : null,
      secondaryButton: getStyles(secondaryBtn),
      secondaryButtonIconColor: secondaryBtnIcon ? window.getComputedStyle(secondaryBtnIcon).color : null,
      card: getStyles(card),
      tableHeader: getStyles(tableHeader),
      sidebarActive: getStyles(sidebarActive),
      title: document.title
    };
  }, name);
}

test.describe('Real Comparison: Local vs Staging', () => {
  test.setTimeout(180000);

  test('Compare Local and Staging Pages', async ({ request, browser }) => {
    const results = {};

    // 1. LOCAL API AUTH
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
      console.log('Local API error:', e.message);
    }

    // LOCAL BROWSER CONTEXT
    const localContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const localPage = await localContext.newPage();

    // 1A. Local Login
    console.log('Visiting Local Login: http://localhost:5173/masuk ...');
    await localPage.goto('http://localhost:5173/masuk', { waitUntil: 'domcontentloaded' });
    await localPage.waitForTimeout(1500);
    await localPage.screenshot({ path: path.join(OUT_DIR, '01-local-login.png'), fullPage: true });
    results.local_login = await inspectPage(localPage, 'Local Login');

    // Inject token to Local
    if (localToken && localUser) {
      await localPage.evaluate(({ token, user }) => {
        localStorage.setItem('school_erp_token', token);
        localStorage.setItem('school_erp_user', JSON.stringify(user));
        localStorage.setItem('theme', 'light');
      }, { token: localToken, user: localUser });
    }

    // 1B. Local Dashboard
    console.log('Visiting Local Dashboard: http://localhost:5173/dashboard ...');
    await localPage.goto('http://localhost:5173/dashboard', { waitUntil: 'domcontentloaded' });
    await localPage.waitForTimeout(2500);
    await localPage.screenshot({ path: path.join(OUT_DIR, '02-local-dashboard.png'), fullPage: false });
    results.local_dashboard = await inspectPage(localPage, 'Local Dashboard');

    // 1C. Local Siswa
    console.log('Visiting Local Siswa: http://localhost:5173/dashboard/master/siswa ...');
    await localPage.goto('http://localhost:5173/dashboard/master/siswa', { waitUntil: 'domcontentloaded' });
    await localPage.waitForTimeout(2500);
    await localPage.screenshot({ path: path.join(OUT_DIR, '03-local-siswa.png'), fullPage: false });
    results.local_siswa = await inspectPage(localPage, 'Local Siswa');


    // 2. STAGING BROWSER CONTEXT
    const stagingContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const stagingPage = await stagingContext.newPage();

    // 2A. Staging Login
    console.log('Visiting Staging Login: https://demoedu.dareliman.sch.id/masuk ...');
    await stagingPage.goto('https://demoedu.dareliman.sch.id/masuk', { waitUntil: 'domcontentloaded' });
    await stagingPage.waitForTimeout(1500);
    await stagingPage.screenshot({ path: path.join(OUT_DIR, '01-staging-login.png'), fullPage: true });
    results.staging_login = await inspectPage(stagingPage, 'Staging Login');

    // Attempt Login on Staging via UI
    console.log('Submitting login on Staging ...');
    await stagingPage.fill('input[type="email"], input[name="email"], input[type="text"]', 'superadmin@dareliman.sch.id');
    await stagingPage.fill('input[type="password"]', 'SuperAdmin@2026!');
    await stagingPage.click('button[type="submit"]');
    await stagingPage.waitForTimeout(4000);

    // 2B. Staging Dashboard
    console.log('Visiting Staging Dashboard: https://demoedu.dareliman.sch.id/dashboard ...');
    await stagingPage.goto('https://demoedu.dareliman.sch.id/dashboard', { waitUntil: 'domcontentloaded' });
    await stagingPage.waitForTimeout(2500);
    await stagingPage.screenshot({ path: path.join(OUT_DIR, '02-staging-dashboard.png'), fullPage: false });
    results.staging_dashboard = await inspectPage(stagingPage, 'Staging Dashboard');

    // 2C. Staging Siswa
    console.log('Visiting Staging Siswa: https://demoedu.dareliman.sch.id/dashboard/master/siswa ...');
    await stagingPage.goto('https://demoedu.dareliman.sch.id/dashboard/master/siswa', { waitUntil: 'domcontentloaded' });
    await stagingPage.waitForTimeout(2500);
    await stagingPage.screenshot({ path: path.join(OUT_DIR, '03-staging-siswa.png'), fullPage: false });
    results.staging_siswa = await inspectPage(stagingPage, 'Staging Siswa');

    fs.writeFileSync(path.join(OUT_DIR, 'inspection_results.json'), JSON.stringify(results, null, 2));
    console.log('All real comparisons saved!');
  });
});
