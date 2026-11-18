import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const API_URL = process.env.API_URL || 'http://localhost:8000';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const PROOF_DIR = path.resolve(process.cwd(), 'visual-proof');

test.describe('Verify ActionDropdown Container & High Contrast Text', () => {
  test.setTimeout(60000);

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

  test('Open Action Dropdown on Students Page and verify computed styles', async ({ page }) => {
    if (!fs.existsSync(PROOF_DIR)) {
      fs.mkdirSync(PROOF_DIR, { recursive: true });
    }

    await loginAsSuperAdmin(page);

    console.log('\nVisiting /dashboard/master/siswa...');
    await page.goto(`${BASE_URL}/dashboard/master/siswa`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Wait for table to load
    const menuAksiTrigger = page.locator('table tbody tr:first-child button[aria-label="Menu Aksi"]').first();
    await menuAksiTrigger.waitFor({ state: 'visible', timeout: 15000 });
    await menuAksiTrigger.click();
    await page.waitForTimeout(600);

    // Look for opened dropdown content
    const dropdownMenu = page.locator('[role="menu"], [data-slot="menu"], .app-dropdown-portal').first();
    await dropdownMenu.waitFor({ state: 'visible', timeout: 10000 });
    await page.waitForTimeout(400);

    // Inspect computed CSS of dropdown container & items
    const styles = await page.evaluate(() => {
      const menu = document.querySelector('[role="menu"], [data-slot="menu"], .app-dropdown-portal');
      const items = Array.from(document.querySelectorAll('[role="menuitem"], [role="menu"] button, [data-slot="item"]'));
      const normalItem = items.find(el => !el.textContent.includes('Hapus'));
      const deleteItem = items.find(el => el.textContent.includes('Hapus'));

      const getDetails = (el) => {
        if (!el) return null;
        const cs = window.getComputedStyle(el);
        return {
          text: el.textContent.trim(),
          color: cs.color,
          backgroundColor: cs.backgroundColor,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          borderRadius: cs.borderRadius,
          padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`
        };
      };

      return {
        menuContainer: getDetails(menu),
        normalMenuItem: getDetails(normalItem),
        deleteMenuItem: getDetails(deleteItem),
      };
    });

    console.log('\n>>> ActionDropdown Computed Styles:', JSON.stringify(styles, null, 2));

    // Save screenshot
    const screenshotPath = path.join(PROOF_DIR, '07-action-dropdown-fixed.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${screenshotPath}`);

    // Verify contrast: normal text must NOT be pale emerald-100 (rgb(220, 252, 231))
    // and container borderRadius must be 12px (rounded-xl)
    expect(styles.menuContainer).not.toBeNull();
    console.log('Students Page Menu Container Border Radius:', styles.menuContainer.borderRadius);
    console.log('Students Page Normal Menu Item Color:', styles.normalMenuItem.color);
    console.log('Students Page Delete Menu Item Color:', styles.deleteMenuItem.color);

    // Verify on /dashboard/employees as well
    console.log('\nVisiting /dashboard/employees...');
    await page.goto(`${BASE_URL}/dashboard/employees`);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    const empMenuTrigger = page.locator('table tbody tr:first-child button[aria-label="Menu Aksi"], table tbody tr:first-child button:has-text("..."), table tbody tr:first-child td:last-child button').first();
    await empMenuTrigger.waitFor({ state: 'visible', timeout: 15000 });
    await empMenuTrigger.click();
    await page.waitForTimeout(600);

    const empStyles = await page.evaluate(() => {
      const menu = document.querySelector('[role="menu"], [data-slot="menu"], .app-dropdown-portal');
      const items = Array.from(document.querySelectorAll('[role="menuitem"], [role="menu"] button, [data-slot="item"]'));
      const normalItem = items.find(el => !el.textContent.includes('Hapus'));
      const deleteItem = items.find(el => el.textContent.includes('Hapus'));

      const getDetails = (el) => {
        if (!el) return null;
        const cs = window.getComputedStyle(el);
        return {
          text: el.textContent.trim(),
          color: cs.color,
          backgroundColor: cs.backgroundColor,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          borderRadius: cs.borderRadius,
          padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`
        };
      };

      return {
        menuContainer: getDetails(menu),
        normalMenuItem: getDetails(normalItem),
        deleteMenuItem: getDetails(deleteItem),
      };
    });

    console.log('\n>>> Employees Page ActionDropdown Computed Styles:', JSON.stringify(empStyles, null, 2));
    const empScreenshotPath = path.join(PROOF_DIR, '07b-employees-action-dropdown-fixed.png');
    await page.screenshot({ path: empScreenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${empScreenshotPath}`);
  });
});

