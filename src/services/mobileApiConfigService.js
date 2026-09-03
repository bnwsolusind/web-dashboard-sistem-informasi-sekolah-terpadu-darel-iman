import { api } from './api'

export const DEFAULT_MOBILE_API_CONFIG = {
  platform: 'android',
  version: 1,
  theme: {
    primary_color: '#0E5C44',
    secondary_color: '#10B981',
    accent_color: '#3FBF75',
    background_color: '#F7F9FC',
    background_gradient_enabled: true,
    background_gradient_start: '#F7FCFA',
    background_gradient_end: '#EAF8F2',
    background_gradient_direction: 'diagonal',
    surface_color: '#FFFFFF',
    text_color: '#0F172A',
    muted_text_color: '#64748B',
    font_family: 'system',
    font_scale: 'normal',
    button_radius: 14,
    card_radius: 18,
    welcome_text: 'Selamat datang di SIMSIT Dar el-Iman',
    login_banner_url: '',
  },
  branding: {
    app_name: 'Sistem Manajemen Sekolah Terpadu',
    school_name: 'Yayasan Dar el-Iman',
    logo_url: null,
    logo_header_url: null,
    logo_login_url: null,
    logo_footer_url: null,
    splash_background_color: '#004B3A',
  },
  navigation: {
    style: 'bottom_tabs',
    show_labels: true,
    items: [
      { key: 'home', label: 'Beranda', icon: 'view-dashboard-outline', enabled: true, order: 1 },
      { key: 'notifications', label: 'Notifikasi', icon: 'bell-outline', enabled: true, order: 2 },
      { key: 'qr', label: 'QR Code', icon: 'qrcode-scan', enabled: true, order: 3 },
      { key: 'profile', label: 'Profil', icon: 'account-circle-outline', enabled: true, order: 4 },
      { key: 'more', label: 'Lainnya', icon: 'menu', enabled: true, order: 5 },
    ],
  },
  home_layout: {
    template: 'dashboard_default',
    sections: [
      { type: 'announcements', enabled: true, order: 1 },
      { type: 'quick_menu', enabled: true, order: 2 },
      { type: 'metrics', enabled: true, order: 3 },
      { type: 'schedule', enabled: true, order: 4 },
    ],
  },
  role_home_layouts: Object.fromEntries(
    Object.entries({
      super_admin: ['announcements', 'quick_menu', 'metrics', 'schedule'],
      foundation: ['metrics', 'announcements', 'schedule', 'quick_menu'],
      principal: ['metrics', 'schedule', 'announcements', 'quick_menu'],
      teacher: ['schedule', 'quick_menu', 'metrics', 'announcements'],
      parent: ['announcements', 'quick_menu', 'schedule', 'metrics'],
      student: ['schedule', 'quick_menu', 'announcements', 'metrics'],
      staff: ['quick_menu', 'metrics', 'announcements', 'schedule'],
    }).map(([role, sections]) => [
      role,
      {
        template: 'dashboard_default',
        sections: sections.map((type, index) => ({ type, enabled: true, order: index + 1 })),
      },
    ])
  ),
  features: {
    qr_login: true,
    qr_attendance: true,
    chat: true,
    notifications: true,
    tahfizh: true,
    mutabaah: true,
    cbt: true,
    school_info: true,
  },
  system: {
    min_app_version: '1.0.0',
    latest_app_version: '1.0.0',
    maintenance_mode: false,
    maintenance_message: 'Sistem sedang dalam pemeliharaan rutin. Silakan coba beberapa saat lagi.',
    force_update: false,
    update_url: 'https://play.google.com/store/apps/details?id=id.sch.dareliman.sims.mobile',
  },
}

const mergeConfig = (value = {}) => ({
  ...DEFAULT_MOBILE_API_CONFIG,
  ...value,
  theme: { ...DEFAULT_MOBILE_API_CONFIG.theme, ...(value.theme || {}) },
  branding: { ...DEFAULT_MOBILE_API_CONFIG.branding, ...(value.branding || {}) },
  navigation: { ...DEFAULT_MOBILE_API_CONFIG.navigation, ...(value.navigation || {}) },
  home_layout: { ...DEFAULT_MOBILE_API_CONFIG.home_layout, ...(value.home_layout || {}) },
  role_home_layouts: { ...DEFAULT_MOBILE_API_CONFIG.role_home_layouts, ...(value.role_home_layouts || {}) },
  features: { ...DEFAULT_MOBILE_API_CONFIG.features, ...(value.features || {}) },
  system: { ...DEFAULT_MOBILE_API_CONFIG.system, ...(value.system || {}) },
})

export const mobileApiConfigService = {
  getConfig: async () => mergeConfig((await api.get('/admin/mobile-config')).data?.data),
  saveConfig: async (config) => {
    const branding = { ...config.branding }
    delete branding.logo_url
    delete branding.fallback_logo_url
    delete branding.has_dedicated_logo_header
    delete branding.has_dedicated_logo_login
    delete branding.has_dedicated_logo_footer
    const theme = { ...config.theme }
    delete theme.has_dedicated_login_banner

    const payload = {
      theme,
      branding,
      navigation: config.navigation,
      home_layout: config.home_layout,
      role_home_layouts: config.role_home_layouts,
      features: config.features,
      system: config.system,
    }
    return mergeConfig((await api.put('/admin/mobile-config', payload)).data?.data)
  },
  uploadMedia: async (type, file) => {
    const formData = new FormData()
    formData.append('type', type)
    formData.append('file', file)
    const res = await api.post('/admin/mobile-config/media', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return mergeConfig(res.data?.data)
  },
  deleteMedia: async (type) => {
    const res = await api.delete(`/admin/mobile-config/media/${type}`)
    return mergeConfig(res.data?.data)
  },
}
