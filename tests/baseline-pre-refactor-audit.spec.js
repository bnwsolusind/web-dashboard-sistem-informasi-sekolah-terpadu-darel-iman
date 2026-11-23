import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const API_URL = process.env.API_URL || 'http://localhost:8000';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const PROOF_DIR = path.resolve(process.cwd(), 'visual-proof');
const AUDIT_JSON = path.join(PROOF_DIR, 'baseline-runtime-audit.json');

let routesToAudit = [];
try {
  const routesFile = path.resolve(process.cwd(), 'clean-160-routes.json');
  if (fs.existsSync(routesFile)) {
    routesToAudit = JSON.parse(fs.readFileSync(routesFile, 'utf8'));
  }
} catch (e) {
  console.error('Error loading routes list:', e.message);
}

test.describe('Baseline Pre-Refactor Runtime Audit (All Active Routes)', () => {
  test.setTimeout(1800000); // 30 minutes

  const loginAsSuperAdmin = async (page) => {
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

    await page.goto(`${BASE_URL}/dashboard`);
    await page.waitForLoadState('domcontentloaded');
  };

  test('Perform comprehensive DOM and Computed CSS baseline inspection on all routes', async ({ page }) => {
    if (!fs.existsSync(PROOF_DIR)) {
      fs.mkdirSync(PROOF_DIR, { recursive: true });
    }

    const pageErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('ws://') && !text.includes('WebSocket') && !text.includes('Failed to load resource')) {
          pageErrors.push(text);
        }
      }
    });

    await page.addInitScript(() => {
      window.print = () => {
        console.log('[SAFE PRINT STUB] window.print() called');
      };
    });

    await loginAsSuperAdmin(page);

    const auditResults = [];

    console.log(`\n========================================================`);
    console.log(`STARTING BASELINE AUDIT: ${routesToAudit.length} Active Routes`);
    console.log(`========================================================\n`);

    for (let i = 0; i < routesToAudit.length; i++) {
      const route = routesToAudit[i];
      const result = {
        index: i + 1,
        route,
        rawSelectCount: 0,
        customSelectCount: 0,
        rawInputCount: 0,
        rawButtonCount: 0,
        rawTableCount: 0,
        hasPopoverTrigger: false,
        popoverMetrics: null,
        hasModalTrigger: false,
        modalMetrics: null,
        errors: [],
        timestamp: new Date().toISOString(),
      };

      try {
        await page.goto(`${BASE_URL}${route}`, { timeout: 15000 });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(400);

        // 1. Inspect DOM Elements directly in page context
        const domStats = await page.evaluate(() => {
          const selects = Array.from(document.querySelectorAll('select'));
          const customSelects = Array.from(document.querySelectorAll('[data-slot="select-trigger"], button[aria-haspopup="listbox"]'));
          const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"])'));
          const rawInputs = inputs.filter((el) => !el.closest('[data-slot="input-wrapper"]') && !el.classList.contains('heroui-input'));
          const buttons = Array.from(document.querySelectorAll('button'));
          const rawButtons = buttons.filter((el) => !el.hasAttribute('data-slot') && !el.closest('[data-slot="button"]'));
          const tables = Array.from(document.querySelectorAll('table'));
          const rawTables = tables.filter((el) => !el.hasAttribute('data-slot') && !el.classList.contains('heroui-table'));

          return {
            selectsCount: selects.length,
            customSelectsCount: customSelects.length,
            rawInputsCount: rawInputs.length,
            rawButtonsCount: rawButtons.length,
            rawTablesCount: rawTables.length,
          };
        });

        result.rawSelectCount = domStats.selectsCount;
        result.customSelectCount = domStats.customSelectsCount;
        result.rawInputCount = domStats.rawInputsCount;
        result.rawButtonCount = domStats.rawButtonsCount;
        result.rawTableCount = domStats.rawTablesCount;

        // 2. Inspect Popover / Action Dropdown (if present)
        const actionTrigger = page.locator('table tbody tr:first-child button[aria-label="Menu Aksi"], button[aria-label="Menu Aksi"]').first();
        if (await actionTrigger.isVisible()) {
          result.hasPopoverTrigger = true;
          await actionTrigger.click();
          await page.waitForTimeout(400);

          const menuEl = page.locator('[role="menu"], [data-slot="menu"], .app-dropdown-portal').first();
          if (await menuEl.isVisible()) {
            const metrics = await menuEl.evaluate((el) => {
              const popoverContainer = el.closest('.rounded-xl, [data-slot="popover"], .app-dropdown-portal') || el.parentElement || el;
              const csContainer = window.getComputedStyle(popoverContainer);
              const firstItem = el.querySelector('[role="menuitem"], button');
              const deleteItem = el.querySelector('[role="menuitem"]:has-text("Hapus"), button:has-text("Hapus")');

              return {
                containerBorderRadius: csContainer.borderRadius,
                containerBgColor: csContainer.backgroundColor,
                firstItemIconColor: firstItem?.querySelector('svg') ? window.getComputedStyle(firstItem.querySelector('svg')).color : null,
                firstItemTextColor: firstItem?.querySelector('span') ? window.getComputedStyle(firstItem.querySelector('span')).color : null,
                deleteItemColor: deleteItem ? window.getComputedStyle(deleteItem.querySelector('span') || deleteItem).color : null,
              };
            });
            result.popoverMetrics = metrics;

            await page.keyboard.press('Escape');
            await page.waitForTimeout(150);
          }
        }

        // 3. Inspect Modal Trigger (if present)
        const modalBtn = page.locator('button:has-text("Tambah"), button:has-text("Export"), button:has-text("Import")').first();
        if (await modalBtn.isVisible()) {
          const btnText = (await modalBtn.textContent()) || '';
          if (!btnText.includes('Login') && !btnText.includes('Masuk')) {
            result.hasModalTrigger = true;
            await modalBtn.click();
            await page.waitForTimeout(400);

            const modalDialog = page.locator('[role="dialog"], [aria-modal="true"]').first();
            if (await modalDialog.isVisible()) {
              const mMetrics = await modalDialog.evaluate((el) => {
                const cs = window.getComputedStyle(el);
                const rect = el.getBoundingClientRect();
                const btn = el.querySelector('button');
                const btnCs = btn ? window.getComputedStyle(btn) : null;
                return {
                  width: `${Math.round(rect.width)}px`,
                  borderRadius: cs.borderRadius,
                  btnHeight: btnCs ? `${Math.round(parseFloat(btnCs.height))}px` : null,
                  btnBorderRadius: btnCs ? btnCs.borderRadius : null,
                };
              });
              result.modalMetrics = mMetrics;

              await page.keyboard.press('Escape');
              await page.waitForTimeout(200);
              const cancelBtn = page.locator('button:has-text("Batal"), button[aria-label="Tutup"]').first();
              if (await cancelBtn.isVisible()) {
                await cancelBtn.click();
                await page.waitForTimeout(150);
              }
            }
          }
        }

        console.log(`[${i + 1}/${routesToAudit.length}] ${route} -> rawInput: ${result.rawInputCount}, rawBtn: ${result.rawButtonCount}, rawTbl: ${result.rawTableCount}`);
      } catch (err) {
        console.warn(`[${i + 1}/${routesToAudit.length}] ${route} -> Error: ${err.message}`);
        result.errors.push(err.message);
      }

      auditResults.push(result);
    }

    fs.writeFileSync(AUDIT_JSON, JSON.stringify(auditResults, null, 2));
    console.log(`\nBaseline runtime audit saved to ${AUDIT_JSON}`);
  });
});

