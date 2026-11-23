import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const OUT_DIR = path.resolve('visual-proof/compare-local-vs-staging');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function inspectPage(page, name) {
  return await page.evaluate((pageName) => {
    const primaryBtn = document.querySelector('button.bg-emerald-600, button[type="submit"], [data-slot="button"][data-color="primary"], .button--primary');
    const outlineBtn = document.querySelector('button.border-slate-200, [data-slot="button"][data-variant="outline"], .button--secondary');
    const card = document.querySelector('.rounded-2xl, .rounded-xl, [data-slot="card"], .card');
    const pageMain = document.querySelector('main, .app-main, #root, body');
    const tableHeader = document.querySelector('thead, th');
    
    function getStyles(el) {
      if (!el) return null;
      const s = window.getComputedStyle(el);
      const icon = el.querySelector('svg');
      const iconColor = icon ? window.getComputedStyle(icon).color : null;
      return {
        tag: el.tagName,
        text: el.innerText ? el.innerText.trim().slice(0, 30) : '',
        bg: s.backgroundColor,
        color: s.color,
        borderRadius: s.borderRadius,
        height: s.height,
        boxShadow: s.boxShadow,
        iconColor: iconColor
      };
    }

    return {
      env: pageName,
      canvasBg: pageMain ? window.getComputedStyle(pageMain).backgroundColor : null,
      primaryButton: getStyles(primaryBtn),
      secondaryButton: getStyles(outlineBtn),
      card: getStyles(card),
      tableHeader: getStyles(tableHeader),
      title: document.title
    };
  }, name);
}

async function run() {
  const browser = await chromium.launch({ headless: true });
  const results = {};

  try {
    // 1. LOCAL LOGIN
    console.log('Testing LOCAL: http://localhost:5173/masuk ...');
    const localContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const localPage = await localContext.newPage();
    await localPage.goto('http://localhost:5173/masuk', { waitUntil: 'networkidle', timeout: 30000 });
    await localPage.screenshot({ path: path.join(OUT_DIR, '01-local-login.png'), fullPage: true });
    results.local_login = await inspectPage(localPage, 'Local Login');

    // Login LOCAL
    await localPage.fill('input[type="email"], input[name="email"], input[type="text"]', 'superadmin@dareliman.sch.id');
    await localPage.fill('input[type="password"]', 'password123');
    await Promise.all([
      localPage.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {}),
      localPage.click('button[type="submit"]')
    ]);
    await localPage.waitForTimeout(2000);

    // LOCAL DASHBOARD
    await localPage.screenshot({ path: path.join(OUT_DIR, '02-local-dashboard.png'), fullPage: false });
    results.local_dashboard = await inspectPage(localPage, 'Local Dashboard');

    // LOCAL SISWA
    await localPage.goto('http://localhost:5173/dashboard/master/siswa', { waitUntil: 'networkidle', timeout: 30000 });
    await localPage.waitForTimeout(2000);
    await localPage.screenshot({ path: path.join(OUT_DIR, '03-local-siswa.png'), fullPage: false });
    results.local_siswa = await inspectPage(localPage, 'Local Siswa');

  } catch (err) {
    console.error('Local error:', err.message);
    results.local_error = err.message;
  }

  try {
    // 2. STAGING LOGIN
    console.log('Testing STAGING: https://demoedu.dareliman.sch.id/masuk ...');
    const stagingContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const stagingPage = await stagingContext.newPage();
    await stagingPage.goto('https://demoedu.dareliman.sch.id/masuk', { waitUntil: 'networkidle', timeout: 30000 });
    await stagingPage.screenshot({ path: path.join(OUT_DIR, '01-staging-login.png'), fullPage: true });
    results.staging_login = await inspectPage(stagingPage, 'Staging Login');

    // Login STAGING
    await stagingPage.fill('input[type="email"], input[name="email"], input[type="text"]', 'superadmin@dareliman.sch.id');
    await stagingPage.fill('input[type="password"]', 'password123');
    await Promise.all([
      stagingPage.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {}),
      stagingPage.click('button[type="submit"]')
    ]);
    await stagingPage.waitForTimeout(2000);

    // STAGING DASHBOARD
    await stagingPage.screenshot({ path: path.join(OUT_DIR, '02-staging-dashboard.png'), fullPage: false });
    results.staging_dashboard = await inspectPage(stagingPage, 'Staging Dashboard');

    // STAGING SISWA
    await stagingPage.goto('https://demoedu.dareliman.sch.id/dashboard/master/siswa', { waitUntil: 'networkidle', timeout: 30000 });
    await stagingPage.waitForTimeout(2000);
    await stagingPage.screenshot({ path: path.join(OUT_DIR, '03-staging-siswa.png'), fullPage: false });
    results.staging_siswa = await inspectPage(stagingPage, 'Staging Siswa');

  } catch (err) {
    console.error('Staging error:', err.message);
    results.staging_error = err.message;
  }

  await browser.close();

  fs.writeFileSync(path.join(OUT_DIR, 'inspection_results.json'), JSON.stringify(results, null, 2));
  console.log('Comparison completed! Results written to inspection_results.json');
}

run();

