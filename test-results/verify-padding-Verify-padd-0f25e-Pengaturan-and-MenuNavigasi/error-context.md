# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: verify-padding.spec.js >> Verify padding consistency between MobileApiConfig, Pengaturan, and MenuNavigasi
- Location: tests/verify-padding.spec.js:3:1

# Error details

```
Test timeout of 120000ms exceeded.
```

```
Error: page.waitForURL: Test timeout of 120000ms exceeded.
=========================== logs ===========================
waiting for navigation to "**/dashboard**" until "load"
============================================================
```

# Page snapshot

```yaml
- generic [ref=e5]:
  - generic [ref=e7]:
    - img "Logo YAYASAN DAR EL - IMAN" [ref=e8]
    - generic [ref=e9]:
      - generic [ref=e10]: Pusat Pendidikan Islam Terpadu
      - heading "YAYASAN DAR EL - IMAN" [level=2] [ref=e11]
      - paragraph [ref=e12]: Dareliman Edu
  - generic [ref=e13]:
    - generic [ref=e14]:
      - heading "Masuk ke Sistem Terpadu" [level=3] [ref=e15]
      - paragraph [ref=e16]: Superadmin, Admin, Pegawai, Guru, Siswa, dan Orang Tua
    - generic [ref=e17]:
      - generic [ref=e23]:
        - paragraph [ref=e24]: Username / Password Salah
        - text: Kredensial atau password/PIN tidak valid.
      - generic [ref=e25]:
        - generic [ref=e26]: Email, NIY, No. KK, NIS, NIK, Username, atau No. HP
        - textbox "Email / NIY / No. KK / NIS / NIK / No. HP" [ref=e28]: superadmin
      - generic [ref=e29]:
        - generic [ref=e30]: Password / PIN
        - generic [ref=e31]:
          - textbox "Masukkan Password / PIN" [ref=e32]: password
          - button [ref=e33]
      - generic [ref=e37]:
        - generic [ref=e38] [cursor=pointer]:
          - checkbox "Ingat saya" [ref=e39]
          - generic [ref=e40]: Ingat saya
        - button "Lupa password?" [ref=e41]
      - button "Masuk ke Sistem" [ref=e42] [cursor=pointer]
    - generic [ref=e43]:
      - paragraph [ref=e44]: atau gunakan autentikasi cepat
      - button "Scan QR ID Card Pegawai / Kartu Siswa" [ref=e45] [cursor=pointer]
    - generic [ref=e53]: © 2026 YAYASAN DAR EL - IMAN. Hak Cipta Dilindungi. Ver 2.1.0
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test('Verify padding consistency between MobileApiConfig, Pengaturan, and MenuNavigasi', async ({ page }) => {
  4  |   // Login first
  5  |   await page.goto('http://localhost:5173/masuk');
  6  |   await page.waitForSelector('input[name="login"], input[name="username"], input[type="text"]');
  7  |   await page.fill('input[name="login"], input[name="username"], input[type="text"]', 'superadmin');
  8  |   await page.fill('input[type="password"]', 'password');
  9  |   await page.click('button[type="submit"]');
> 10 |   await page.waitForURL('**/dashboard**');
     |              ^ Error: page.waitForURL: Test timeout of 120000ms exceeded.
  11 |   await page.waitForTimeout(1000);
  12 | 
  13 |   // 1. Visit Mobile API Config
  14 |   await page.goto('http://localhost:5173/dashboard/koneksi-api-mobile');
  15 |   await page.waitForSelector('main');
  16 |   await page.waitForTimeout(1500);
  17 |   const mobileApiBox = await page.evaluate(() => {
  18 |     const main = document.querySelector('main');
  19 |     const breadcrumb = document.querySelector('nav[aria-label="Breadcrumbs"], nav[aria-label="breadcrumb"], .mb-4');
  20 |     const heroCard = document.querySelector('div.rounded-\\[22px\\], .relative.overflow-hidden.rounded-\\[22px\\], section.relative');
  21 |     return {
  22 |       mainPaddingLeft: main ? window.getComputedStyle(main).paddingLeft : null,
  23 |       breadcrumbLeft: breadcrumb ? breadcrumb.getBoundingClientRect().left : null,
  24 |       heroLeft: heroCard ? heroCard.getBoundingClientRect().left : null,
  25 |     };
  26 |   });
  27 | 
  28 |   // 2. Visit Pengaturan
  29 |   await page.goto('http://localhost:5173/dashboard/pengaturan');
  30 |   await page.waitForSelector('main');
  31 |   await page.waitForTimeout(1500);
  32 |   const pengaturanBox = await page.evaluate(() => {
  33 |     const main = document.querySelector('main');
  34 |     const breadcrumb = document.querySelector('nav[aria-label="Breadcrumbs"], nav[aria-label="breadcrumb"], .mb-4');
  35 |     const heroCard = document.querySelector('div.relative.overflow-hidden.rounded-2xl, section.relative');
  36 |     return {
  37 |       mainPaddingLeft: main ? window.getComputedStyle(main).paddingLeft : null,
  38 |       breadcrumbLeft: breadcrumb ? breadcrumb.getBoundingClientRect().left : null,
  39 |       heroLeft: heroCard ? heroCard.getBoundingClientRect().left : null,
  40 |     };
  41 |   });
  42 | 
  43 |   // 3. Visit Menu Navigasi
  44 |   await page.goto('http://localhost:5173/dashboard/pengaturan/menu-navigasi');
  45 |   await page.waitForSelector('main');
  46 |   await page.waitForTimeout(1500);
  47 |   const menuNavigasiBox = await page.evaluate(() => {
  48 |     const main = document.querySelector('main');
  49 |     const breadcrumb = document.querySelector('nav[aria-label="Breadcrumbs"], nav[aria-label="breadcrumb"], .mb-4');
  50 |     const heroCard = document.querySelector('section.relative.overflow-hidden.rounded-2xl');
  51 |     return {
  52 |       mainPaddingLeft: main ? window.getComputedStyle(main).paddingLeft : null,
  53 |       breadcrumbLeft: breadcrumb ? breadcrumb.getBoundingClientRect().left : null,
  54 |       heroLeft: heroCard ? heroCard.getBoundingClientRect().left : null,
  55 |     };
  56 |   });
  57 | 
  58 |   console.log('BOX COMPARISON:', JSON.stringify({ mobileApiBox, pengaturanBox, menuNavigasiBox }, null, 2));
  59 | 
  60 |   expect(pengaturanBox.breadcrumbLeft).toBeCloseTo(mobileApiBox.breadcrumbLeft, 1);
  61 |   expect(menuNavigasiBox.breadcrumbLeft).toBeCloseTo(mobileApiBox.breadcrumbLeft, 1);
  62 |   expect(pengaturanBox.heroLeft).toBeCloseTo(mobileApiBox.heroLeft, 1);
  63 |   expect(menuNavigasiBox.heroLeft).toBeCloseTo(mobileApiBox.heroLeft, 1);
  64 | });
  65 | 
```