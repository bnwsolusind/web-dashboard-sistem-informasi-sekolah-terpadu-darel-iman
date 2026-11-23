import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const outputFile = process.env.OUTPUT_FILE ? path.resolve(process.cwd(), process.env.OUTPUT_FILE) : path.resolve(process.cwd(), 'audit-network-proof.json');
const API_URL = process.env.API_URL || 'http://localhost:8000';
let allAuditLogs = [];

test.describe('Forensic E2E Audit with Real Network Tracking', () => {
  let currentRole = 'Unknown';
  let currentRoute = '/';

  const saveLogs = () => {
    fs.writeFileSync(outputFile, JSON.stringify(allAuditLogs, null, 2), 'utf-8');
  };

  const recordManual = (entry) => {
    allAuditLogs.push({
      role: currentRole,
      routeUrl: currentRoute,
      timestamp: new Date().toISOString(),
      ...entry
    });
    saveLogs();
  };

  test.beforeEach(async ({ page }) => {
    page.on('response', async (response) => {
      try {
        const request = response.request();
        const method = request.method();
        const url = response.url();
        const status = response.status();
        const headers = response.headers();
        const contentType = headers['content-type'] || '';
        const disposition = headers['content-disposition'] || '';

        const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && url.includes('/api');
        const isDownload = disposition.includes('attachment') || contentType.includes('spreadsheet') || contentType.includes('pdf');

        if (isMutation || isDownload) {
          let recordId = null;
          try {
            if (contentType.includes('application/json')) {
              const text = await response.text();
              const json = JSON.parse(text);
              recordId = json?.data?.id || json?.id || json?.data?.record?.id || null;
            }
          } catch (e) {}

          recordManual({
            method,
            apiUrl: url.replace(API_URL, ''),
            status,
            recordId: recordId ? String(recordId) : null,
            isDownload: Boolean(isDownload)
          });
        }
      } catch (err) {}
    });

    page.on('pageerror', (err) => {
      console.error(`[PAGE_ERROR] [${currentRole}] [${currentRoute}]:`, err.message);
    });
  });

  test.afterAll(async () => {
    saveLogs();
    console.log(`\n>>> [AUDIT_NETWORK_PROOF] Total ${allAuditLogs.length} network entries saved to ${outputFile}`);
  });

  const loginAs = async (page, email, password, roleName) => {
    currentRole = roleName;
    currentRoute = '/masuk';

    const loginRes = await page.request.post(`${API_URL}/api/login`, {
      data: { email, password }
    });
    expect(loginRes.status()).toBe(200);
    const loginData = await loginRes.json();
    const token = loginData.token || loginData.data?.token || loginData.access_token;
    const user = loginData.user || loginData.data?.user;

    recordManual({
      method: 'POST',
      apiUrl: '/api/login',
      status: loginRes.status(),
      recordId: user?.id || null,
      isDownload: false
    });

    await page.goto('/masuk');
    await page.evaluate(({ token, user }) => {
      localStorage.setItem('school_erp_token', token);
      localStorage.setItem('school_erp_user', JSON.stringify(user));
    }, { token, user });

    await page.goto('/dashboard');
    await page.waitForLoadState('domcontentloaded');
    return token;
  };

  const pageApi = async (page, method, endpoint, data = null) => {
    const res = await page.evaluate(async ({ method, endpoint, data, API_URL }) => {
      const token = localStorage.getItem('school_erp_token');
      const opts = {
        method,
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json'
        }
      };
      if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
        opts.headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(data);
      }
      const r = await fetch(API_URL + endpoint, opts);
      let json = null;
      try {
        json = await r.json();
      } catch (e) {}
      return { status: r.status, data: json };
    }, { method, endpoint, data, API_URL });

    const recId = res.data?.data?.id || res.data?.id || null;
    recordManual({
      method,
      apiUrl: endpoint,
      status: res.status,
      recordId: recId ? String(recId) : null,
      isDownload: false
    });

    return res;
  };

  test('Audit Role 1: Super Admin - Full CRUD Cycle and Sub-Tab Navigation', async ({ page }) => {
    await loginAs(page, 'superadmin@dareliman.sch.id', 'SuperAdmin@2026!', 'Super Admin');

    const testNonce = Date.now().toString().slice(-6);

    // 1. CRUD Master Unit Pendidikan
    currentRoute = '/dashboard/master/unit-pendidikan';
    await page.goto(currentRoute);
    const unitCreate = await pageApi(page, 'POST', '/api/education-units', {
      name: `[QA-AUDIT] Unit Forensik E2E ${testNonce}`,
      code: `QA-U-${testNonce}`,
      program_type: 'fullday',
      description: 'Unit Uji Otomatis Playwright'
    });
    expect([200, 201]).toContain(unitCreate.status);
    const unitId = unitCreate.data?.data?.id || unitCreate.data?.id;

    if (unitId) {
      const unitUpdate = await pageApi(page, 'PUT', `/api/education-units/${unitId}`, {
        name: `[QA-AUDIT] Unit Forensik E2E ${testNonce} (Updated)`,
        code: `QA-U-${testNonce}`,
        program_type: 'boarding',
        description: 'Updated Boarding'
      });
      expect(unitUpdate.status).toBe(200);

      const unitDelete = await pageApi(page, 'DELETE', `/api/education-units/${unitId}`);
      expect(unitDelete.status).toBe(200);
    }

    // 2. Transaksi Presensi Gerbang (Scan In & Cleanup)
    currentRoute = '/dashboard/absensi-gerbang';
    await page.goto(currentRoute);
    const gateIn = await pageApi(page, 'POST', '/api/gate-attendance/scan-in', {
      student_id: '01a195d7-0e04-7303-83eb-adb5690df4e5',
      attendance_method: 'RFID'
    });
    expect([200, 201]).toContain(gateIn.status);
    const attId = gateIn.data?.data?.id || gateIn.data?.id;

    if (attId) {
      const attDel = await pageApi(page, 'DELETE', `/api/attendance/${attId}`);
      expect(attDel.status).toBe(200);
    }

    // 3. CRUD Transaksi Setoran Tahfizh Harian
    currentRoute = '/dashboard/tahfizh';
    await page.goto(currentRoute);

    // Negative validation test (ayat_mulai > ayat_selesai must fail 422)
    const negTahfizh = await pageApi(page, 'POST', '/api/tahfizh/daily-log', {
      student_id: '01a195d7-0e04-7303-83eb-adb5690df4e5',
      surah_id: 78,
      ayat_mulai: 25,
      ayat_selesai: 10,
      record_date: '2026-11-17',
      predikat: 'Mumtaz'
    });
    expect(negTahfizh.status).toBe(422);

    // Valid Tahfizh Creation
    const posTahfizh = await pageApi(page, 'POST', '/api/tahfizh/daily-log', {
      student_id: '01a195d7-0e04-7303-83eb-adb5690df4e5',
      surah_id: 78,
      ayat_mulai: 1,
      ayat_selesai: 15,
      record_date: '2026-11-17',
      jenis_setoran: 'ziyadah',
      predikat: 'Mumtaz',
      catatan: '[QA-AUDIT] Setoran Playwright Mutqin'
    });
    expect(posTahfizh.status).toBe(200);
    const tahfizhId = posTahfizh.data?.data?.id || posTahfizh.data?.id;

    if (tahfizhId) {
      const updateTahfizh = await pageApi(page, 'POST', '/api/tahfizh/daily-log', {
        id: tahfizhId,
        student_id: '01a195d7-0e04-7303-83eb-adb5690df4e5',
        surah_id: 78,
        ayat_mulai: 1,
        ayat_selesai: 20,
        record_date: '2026-11-17',
        predikat: 'Jayyid Jiddan',
        catatan: '[QA-AUDIT] Update Ayat 1-20'
      });
      expect(updateTahfizh.status).toBe(200);

      const delTahfizh = await pageApi(page, 'DELETE', `/api/tahfizh/daily-log/${tahfizhId}`);
      expect(delTahfizh.status).toBe(200);
    }

    // 4. CRUD Mutabaah Yaumiyah (Kategori & Agenda)
    currentRoute = '/dashboard/mutabaah';
    await page.goto(currentRoute);
    const catCreate = await pageApi(page, 'POST', '/api/mutabaah/enterprise/categories', {
      code: `QA-M-${testNonce}`,
      name: `[QA-AUDIT] Kategori Playwright Test ${testNonce}`,
      is_active: true
    });
    expect([200, 201]).toContain(catCreate.status);
    const catId = catCreate.data?.data?.id || catCreate.data?.id;

    if (catId) {
      const catDel = await pageApi(page, 'DELETE', `/api/mutabaah/enterprise/categories/${catId}`);
      expect([200, 204]).toContain(catDel.status);
    }

    // 5. CRUD Mata Pelajaran
    currentRoute = '/dashboard/master/mata-pelajaran';
    await page.goto(currentRoute);
    const subjCreate = await pageApi(page, 'POST', '/api/subjects', {
      name: `[QA-AUDIT] Mapel Robotika Playwright ${testNonce}`,
      code: `QA-S-${testNonce}`,
      unit_id: '01a19540-de87-73de-8f4e-301baf8725a2',
      kkm: 75,
      is_active: true
    });
    const subjId = subjCreate.data?.data?.id || subjCreate.data?.id;
    if (subjId) {
      const subjDel = await pageApi(page, 'DELETE', `/api/subjects/${subjId}`);
      expect([200, 204]).toContain(subjDel.status);
    }

    // 6. Jelajah Navigasi Sub-Tab Halaman Utama
    const superAdminRoutes = [
      '/dashboard',
      '/dashboard/yayasan',
      '/dashboard/master/siswa',
      '/dashboard/master/pegawai',
      '/dashboard/attendance',
      '/dashboard/laporan-absensi',
      '/dashboard/pengaturan'
    ];

    for (const r of superAdminRoutes) {
      currentRoute = r;
      await page.goto(r);
      await page.waitForLoadState('domcontentloaded');

      const tabs = page.locator('[role="tab"], button.tab-button, nav button');
      const count = await tabs.count();
      for (let i = 0; i < Math.min(count, 4); i++) {
        try {
          const tab = tabs.nth(i);
          if (await tab.isVisible()) {
            await tab.click({ timeout: 1500 });
            await page.waitForTimeout(100);
          }
        } catch (e) {}
      }
    }
  });

  test('Audit Role 2: Kepala Sekolah - Dashboard & Monitoring Akses', async ({ page }) => {
    await loginAs(page, 'kepsek.test@dareliman.sch.id', 'KepsekTest@2026!', 'Kepala Sekolah');

    const kepsekRoutes = [
      '/dashboard/kepala-sekolah',
      '/dashboard/laporan-absensi',
      '/dashboard/laporan-tahfizh',
      '/verifikasi-izin'
    ];

    for (const r of kepsekRoutes) {
      currentRoute = r;
      await page.goto(r);
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain(r);
    }
  });

  test('Audit Role 3: Divisi Pendidikan - Kurikulum & Matriks Unit', async ({ page }) => {
    await loginAs(page, 'divisi.pendidikan.test@dareliman.sch.id', 'YayasanTest@2026!', 'Divisi Pendidikan');

    const divisiRoutes = [
      '/dashboard/divisi-pendidikan',
      '/dashboard/monitoring-divisi',
      '/dashboard/laporan-akademik'
    ];

    for (const r of divisiRoutes) {
      currentRoute = r;
      await page.goto(r);
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain(r);
    }
  });

  test('Audit Role 4: Tata Usaha - Tagihan Siswa & Rekap Presensi', async ({ page }) => {
    await loginAs(page, 'tu.test@dareliman.sch.id', 'TuTest@2026!', 'Tata Usaha');

    const tuRoutes = [
      '/dashboard/tata-usaha',
      '/dashboard/keuangan/tagihan-siswa',
      '/dashboard/rekap-absensi-gerbang'
    ];

    for (const r of tuRoutes) {
      currentRoute = r;
      await page.goto(r);
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain(r);
    }
  });

  test('Audit Role 5: Wali Kelas - Dasbor Rombel & Rekap Kehadiran', async ({ page }) => {
    await loginAs(page, 'walas.test@dareliman.sch.id', 'WalasTest@2026!', 'Wali Kelas');

    const walasRoutes = [
      '/dashboard-wali-kelas',
      '/dashboard/wali-kelas',
      '/rekap-kehadiran'
    ];

    for (const r of walasRoutes) {
      currentRoute = r;
      await page.goto(r);
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain(r);
    }
  });

  test('Audit Role 6: Guru Mapel / Musyrif - Workspace KBM & Halaqah', async ({ page }) => {
    await loginAs(page, 'guru.test@dareliman.sch.id', 'GuruTest@2026!', 'Guru / Musyrif');

    const guruRoutes = [
      '/portal-guru',
      '/workspace',
      '/musyrif',
      '/dashboard/guru-tahfizh'
    ];

    for (const r of guruRoutes) {
      currentRoute = r;
      await page.goto(r);
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain(r);
    }
  });

  test('Audit Role 7: Orang Tua - Portal Wali Murid & Tagihan SPP', async ({ page }) => {
    await loginAs(page, 'orangtua.test@dareliman.sch.id', 'OrangTuaTest@2026!', 'Orang Tua');

    const parentRoutes = [
      '/portal-orangtua',
      '/tagihan',
      '/mutabaah'
    ];

    for (const r of parentRoutes) {
      currentRoute = r;
      await page.goto(r);
      await page.waitForLoadState('domcontentloaded');
      expect(page.url()).toContain(r);
    }
  });
});
