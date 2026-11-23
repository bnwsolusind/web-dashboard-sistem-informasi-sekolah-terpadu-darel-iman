import { test, expect } from '@playwright/test';

const TEST_EMAIL = process.env.TEST_SUPERADMIN_EMAIL || process.env.TEST_USER || 'superadmin@dareliman.sch.id';
const TEST_PASSWORD = process.env.TEST_SUPERADMIN_PASSWORD || process.env.TEST_PASSWORD || '';

test('Verify padding consistency between MobileApiConfig, Pengaturan, and MenuNavigasi', async ({ page }) => {
  if (!TEST_PASSWORD) {
    test.skip(!TEST_PASSWORD, 'TEST_PASSWORD tidak diset pada environment testing');
    return;
  }
  // Login first
  await page.goto('/masuk');
  await page.waitForSelector('input[name="login"], input[name="username"], input[type="text"]');
  await page.fill('input[name="login"], input[name="username"], input[type="text"]', TEST_EMAIL);
  await page.fill('input[type="password"]', TEST_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard**');
  await page.waitForTimeout(1000);

  // 1. Visit Mobile API Config
  await page.goto('http://localhost:5173/dashboard/koneksi-api-mobile');
  await page.waitForSelector('main');
  await page.waitForTimeout(1500);
  const mobileApiBox = await page.evaluate(() => {
    const main = document.querySelector('main');
    const breadcrumb = document.querySelector('nav[aria-label="Breadcrumbs"], nav[aria-label="breadcrumb"], .mb-4');
    const heroCard = document.querySelector('div.rounded-\\[22px\\], .relative.overflow-hidden.rounded-\\[22px\\], section.relative');
    return {
      mainPaddingLeft: main ? window.getComputedStyle(main).paddingLeft : null,
      breadcrumbLeft: breadcrumb ? breadcrumb.getBoundingClientRect().left : null,
      heroLeft: heroCard ? heroCard.getBoundingClientRect().left : null,
    };
  });

  // 2. Visit Pengaturan
  await page.goto('http://localhost:5173/dashboard/pengaturan');
  await page.waitForSelector('main');
  await page.waitForTimeout(1500);
  const pengaturanBox = await page.evaluate(() => {
    const main = document.querySelector('main');
    const breadcrumb = document.querySelector('nav[aria-label="Breadcrumbs"], nav[aria-label="breadcrumb"], .mb-4');
    const heroCard = document.querySelector('div.relative.overflow-hidden.rounded-2xl, section.relative');
    return {
      mainPaddingLeft: main ? window.getComputedStyle(main).paddingLeft : null,
      breadcrumbLeft: breadcrumb ? breadcrumb.getBoundingClientRect().left : null,
      heroLeft: heroCard ? heroCard.getBoundingClientRect().left : null,
    };
  });

  // 3. Visit Menu Navigasi
  await page.goto('http://localhost:5173/dashboard/pengaturan/menu-navigasi');
  await page.waitForSelector('main');
  await page.waitForTimeout(1500);
  const menuNavigasiBox = await page.evaluate(() => {
    const main = document.querySelector('main');
    const breadcrumb = document.querySelector('nav[aria-label="Breadcrumbs"], nav[aria-label="breadcrumb"], .mb-4');
    const heroCard = document.querySelector('section.relative.overflow-hidden.rounded-2xl');
    return {
      mainPaddingLeft: main ? window.getComputedStyle(main).paddingLeft : null,
      breadcrumbLeft: breadcrumb ? breadcrumb.getBoundingClientRect().left : null,
      heroLeft: heroCard ? heroCard.getBoundingClientRect().left : null,
    };
  });

  console.log('BOX COMPARISON:', JSON.stringify({ mobileApiBox, pengaturanBox, menuNavigasiBox }, null, 2));

  expect(pengaturanBox.breadcrumbLeft).toBeCloseTo(mobileApiBox.breadcrumbLeft, 1);
  expect(menuNavigasiBox.breadcrumbLeft).toBeCloseTo(mobileApiBox.breadcrumbLeft, 1);
  expect(pengaturanBox.heroLeft).toBeCloseTo(mobileApiBox.heroLeft, 1);
  expect(menuNavigasiBox.heroLeft).toBeCloseTo(mobileApiBox.heroLeft, 1);
});
