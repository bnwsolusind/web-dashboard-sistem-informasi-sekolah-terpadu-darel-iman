/**
 * Utility modul penerjemah Izin Akses (Permissions) & Modul ke Bahasa Indonesia.
 * Didesain khusus untuk mengubah kode permission teknis (seperti academic.curriculum.create)
 * menjadi Bahasa Indonesia yang ringkas, jelas, dan mudah dipahami oleh pengguna.
 */

export const PERMISSION_MODULE_LABELS = {
  academic: 'Akademik & Kurikulum',
  activity: 'Kegiatan & Aktivitas',
  alumni: 'Data Alumni',
  approval: 'Persetujuan (Approval)',
  asrama: 'Pengelolaan Asrama',
  attendance: 'Presensi Umum',
  attendance_correction: 'Koreksi Presensi',
  attendance_device: 'Mesin / Perangkat Presensi',
  attendance_follow_up: 'Tindak Lanjut Absensi',
  attendance_permission: 'Izin / Sakit Presensi',
  attendance_report: 'Laporan Presensi',
  audit: 'Log Audit Sistem',
  bk: 'Bimbingan Konseling (BK)',
  cbt: 'Ujian Online (CBT)',
  chat: 'Pesan & Komunikasi',
  dashboard: 'Akses Dashboard',
  divisi: 'Pengelolaan Divisi',
  employee: 'Data Pegawai & Guru',
  foundation: 'Pengawasan Yayasan',
  gate_attendance: 'Presensi Gerbang Sekolah',
  grades: 'Pengaturan Penilaian',
  homeroom_attendance: 'Presensi Wali Kelas',
  jabatan: 'Master Jabatan',
  kehadiran: 'Kehadiran Siswa',
  kesiswaan: 'Kesiswaan & Prestasi',
  lesson_attendance: 'Presensi Jam Pelajaran',
  lms: 'Learning Management System (LMS)',
  master: 'Master Data Utama',
  mutabaah: 'Mutabaah & Yaumiyah',
  notification: 'Notifikasi Sistem',
  parent: 'Portal Orang Tua',
  pembelajaran: 'Modul Pembelajaran',
  permission: 'Master Izin Akses',
  portal: 'Portal Akses Utama',
  report: 'Pusat Laporan',
  role: 'Master Peran (Role)',
  sekolah: 'Informasi & Profil Sekolah',
  setting: 'Pengaturan Aplikasi',
  sistem: 'Pengaturan & Hak Akses Sistem',
  student: 'Fitur & Portal Siswa',
  student_attendance: 'Presensi Harian Siswa',
  tahfizh: 'Tahfizh Al-Qur\'an',
  teacher: 'Fitur & Peran Guru',
  teacher_monitoring: 'Monitoring Pengajar',
  teacher_presence: 'Status Presensi Guru',
  teaching_attendance: 'Presensi Mengajar Guru',
  teaching_session: 'Sesi Jam Kelas',
  unit: 'Master Unit Sekolah',
  user: 'Manajemen Akun User',
  worship_attendance: 'Presensi Ibadah / Sholat',
}

export const PERMISSION_LABELS = {
  // ACADEMIC (23 Izin)
  'academic.curriculum.create': 'Membuat Kurikulum Akademik',
  'academic.curriculum.delete': 'Menghapus Kurikulum Akademik',
  'academic.curriculum.update': 'Mengubah Kurikulum Akademik',
  'academic.curriculum.view': 'Melihat Kurikulum Akademik',
  'academic.grade.create': 'Input / Membuat Nilai Akademik',
  'academic.grade.finalize': 'Finalisasi & Mengunci Nilai Akademik',
  'academic.grade.publish': 'Publikasi Nilai Akademik',
  'academic.grade.update': 'Mengubah Nilai Akademik',
  'academic.grade.view': 'Melihat Nilai Akademik',
  'assessment_formula.view': 'Melihat Pengaturan Rumus Penilaian',
  'assessment_formula.create': 'Membuat Draft Rumus Penilaian',
  'assessment_formula.update': 'Mengubah Draft Rumus Penilaian',
  'assessment_formula.submit': 'Mengajukan Rumus Penilaian',
  'assessment_formula.approve': 'Menyetujui Rumus Penilaian',
  'assessment_formula.activate': 'Mengaktifkan Rumus Penilaian',
  'assessment_formula.archive': 'Mengarsipkan Rumus Penilaian',
  'academic.manage': 'Mengelola Seluruh Modul Akademik',
  'academic.rapor.create': 'Membuat / Generasi Rapor Siswa',
  'academic.rapor.publish': 'Publikasi Rapor Siswa',
  'academic.rapor.update': 'Mengubah Data Rapor Siswa',
  'academic.rapor.view': 'Melihat Rapor Siswa',
  'academic.schedule.create': 'Membuat Jadwal Pelajaran',
  'academic.schedule.delete': 'Menghapus Jadwal Pelajaran',
  'academic.schedule.update': 'Mengubah Jadwal Pelajaran',
  'academic.schedule.view': 'Melihat Jadwal Pelajaran',
  'academic.subject.create': 'Menambah Mata Pelajaran',
  'academic.subject.delete': 'Menghapus Mata Pelajaran',
  'academic.subject.update': 'Mengubah Mata Pelajaran',
  'academic.subject.view': 'Melihat Daftar Mata Pelajaran',
  'academic.view': 'Melihat Ringkasan Modul Akademik',

  // ACTIVITY
  'activity.view': 'Melihat Kegiatan & Aktivitas Sekolah',

  // ALUMNI
  'alumni.tracer_study.create': 'Membuat Survei Tracer Study',
  'alumni.update_own': 'Mengubah Data Profil Alumni Sendiri',
  'alumni.view': 'Melihat Data Alumni Sekolah',

  // APPROVAL
  'approval.manage': 'Mengelola Persetujuan & Approval',

  // ASRAMA
  'asrama.activity.manage': 'Mengelola Kegiatan Asrama',
  'asrama.activity.view': 'Melihat Kegiatan Asrama',

  // ATTENDANCE
  'attendance.homeroom.dashboard': 'Dashboard Presensi Wali Kelas',
  'attendance.manage': 'Mengelola Seluruh Presensi',
  'attendance.student.view_own': 'Melihat Presensi Siswa Sendiri',
  'attendance.teacher.dashboard': 'Dashboard Presensi Guru',
  'attendance.view': 'Melihat Laporan Presensi',

  // ATTENDANCE CORRECTION
  'attendance_correction.cancel': 'Membatalkan Koreksi Presensi',
  'attendance_correction.create': 'Membuat Koreksi Presensi',
  'attendance_correction.review': 'Review & Persetujuan Koreksi Presensi',
  'attendance_correction.view': 'Melihat Riwayat Koreksi Presensi',

  // ATTENDANCE DEVICE
  'attendance_device.manage': 'Mengelola Mesin/Perangkat Presensi',
  'attendance_device.receive_event': 'Menerima Log Event Mesin Presensi',
  'attendance_device.view': 'Melihat Daftar Mesin Presensi',

  // ATTENDANCE FOLLOW UP
  'attendance_follow_up.close': 'Menutup Tindak Lanjut Absensi',
  'attendance_follow_up.complete': 'Menyelesaikan Tindak Lanjut Absensi',
  'attendance_follow_up.create': 'Membuat Catatan Tindak Lanjut Absensi',
  'attendance_follow_up.update': 'Mengubah Catatan Tindak Lanjut Absensi',
  'attendance_follow_up.view': 'Melihat Daftar Tindak Lanjut Absensi',

  // ATTENDANCE PERMISSION
  'attendance_permission.cancel': 'Membatalkan Permohonan Izin/Sakit',
  'attendance_permission.create': 'Membuat Permohonan Izin/Sakit',
  'attendance_permission.review': 'Review & Persetujuan Izin Presensi',
  'attendance_permission.submit': 'Mengajukan Izin Presensi',
  'attendance_permission.update': 'Mengubah Permohonan Izin Presensi',
  'attendance_permission.view': 'Melihat Semua Izin Presensi',
  'attendance_permission.view_own': 'Melihat Izin Presensi Sendiri',

  // ATTENDANCE REPORT
  'attendance_report.export': 'Mengekspor Laporan Presensi',
  'attendance_report.view': 'Melihat Laporan Rekap Presensi',

  // AUDIT
  'audit.view': 'Melihat Log Audit Sistem',

  // BK
  'bk.counseling.create': 'Membuat Catatan Konseling BK',
  'bk.counseling.update': 'Mengubah Catatan Konseling BK',
  'bk.counseling.view': 'Melihat Riwayat Konseling BK',

  // CBT
  'cbt.manage': 'Mengelola Ujian Online (CBT)',

  // CHAT
  'chat.analytics.view': 'Melihat Analitik Chat',
  'chat.configuration.manage': 'Mengelola Konfigurasi Chat',
  'chat.conversation.archive': 'Mengarsip Percakapan Chat',
  'chat.conversation.create': 'Membuat Obrolan/Grup Chat',
  'chat.conversation.view': 'Melihat Daftar Percakapan Chat',
  'chat.homeroom.view': 'Melihat Chat Grup Wali Kelas',
  'chat.manage': 'Mengelola Saluran Chat',
  'chat.message.attachment': 'Mengirim Berkas Lampiran Chat',
  'chat.message.read': 'Membaca Pesan Chat',
  'chat.message.send': 'Mengirim Pesan Chat',
  'chat.message.view': 'Melihat Riwayat Pesan Chat',
  'chat.subject_teacher.view': 'Melihat Chat Guru Mapel',

  // DASHBOARD
  'dashboard.divisi-pendidikan.view': 'Dashboard Divisi Pendidikan',
  'dashboard.guru-bk.view': 'Dashboard Guru BK',
  'dashboard.guru-tahfizh.view': 'Dashboard Guru Tahfizh',
  'dashboard.guru.view': 'Dashboard Guru Pengajar',
  'dashboard.kepala-sekolah.view': 'Dashboard Kepala Sekolah',
  'dashboard.manage': 'Mengelola Modul Dashboard',
  'dashboard.operator.view': 'Dashboard Operator Sekolah',
  'dashboard.pemantauan.kelola': 'Mengelola Modul Pemantauan Dashboard',
  'dashboard.pemantauan.lihat': 'Melihat Pemantauan Dashboard',
  'dashboard.super-admin.view': 'Dashboard Super Admin',
  'dashboard.tata-usaha.view': 'Dashboard Tata Usaha',
  'dashboard.view': 'Melihat Dashboard Umum',
  'dashboard.waka-kesiswaan.view': 'Dashboard Waka Kesiswaan',
  'dashboard.waka-kurikulum.view': 'Dashboard Waka Kurikulum',

  // DIVISI
  'divisi.laporan_bulanan': 'Mengelola & Lihat Laporan Bulanan Divisi',
  'divisi.monitoring': 'Pemantauan Kegiatan & Kinerja Divisi',

  // EMPLOYEE
  'employee.create': 'Menambah Data Pegawai/Guru',
  'employee.delete': 'Menghapus Data Pegawai',
  'employee.export': 'Mengekspor Data Pegawai',
  'employee.import': 'Mengimpor Data Pegawai',
  'employee.update': 'Mengubah Data Pegawai',
  'employee.view': 'Melihat Data Pegawai',
  'employee.view_all': 'Melihat Seluruh Pegawai Semua Unit',

  // FOUNDATION
  'foundation.alumni.view': 'Melihat Alumni (Yayasan)',
  'foundation.dashboard.view': 'Dashboard Eksekutif Yayasan',
  'foundation.employee.view': 'Melihat Pegawai Semua Unit (Yayasan)',
  'foundation.graduation.view': 'Melihat Kelulusan Siswa (Yayasan)',
  'foundation.information.view': 'Melihat Pengumuman Yayasan',
  'foundation.notification.read': 'Membaca Notifikasi Yayasan',
  'foundation.notification.read_all': 'Tandai Baca Semua Notifikasi Yayasan',
  'foundation.notification.view': 'Melihat Notifikasi Yayasan',
  'foundation.profile.change_password': 'Ubah Password Profil Yayasan',
  'foundation.profile.update': 'Mengubah Profil Yayasan',
  'foundation.profile.view': 'Melihat Profil Yayasan',
  'foundation.report.export': 'Mengekspor Laporan Konsolidasi Yayasan',
  'foundation.report.view': 'Melihat Laporan Eksekutif Yayasan',
  'foundation.student.view': 'Melihat Siswa Semua Unit (Yayasan)',
  'foundation.student_mutation.view': 'Melihat Mutasi Siswa (Yayasan)',
  'foundation.student_new.view': 'Melihat Siswa Baru (Yayasan)',
  'foundation.teacher.view': 'Melihat Guru Semua Unit (Yayasan)',
  'foundation.unit.view': 'Melihat Unit Sekolah (Yayasan)',

  // GATE ATTENDANCE
  'gate_attendance.config': 'Konfigurasi Gerbang Presensi',
  'gate_attendance.scan': 'Scan Presensi Gerbang Sekolah',
  'gate_attendance.view': 'Melihat Log Presensi Gerbang',

  // GRADES
  'grades.manage': 'Mengelola Pembobotan & Sistem Nilai',

  // HOMEROOM ATTENDANCE
  'homeroom_attendance.dashboard': 'Dashboard Presensi Wali Kelas',
  'homeroom_attendance.export': 'Mengekspor Laporan Presensi Kelas Ampu',
  'homeroom_attendance.follow_up': 'Tindak Lanjut Absensi oleh Wali Kelas',
  'homeroom_attendance.verify_permission': 'Verifikasi Izin/Sakit oleh Wali Kelas',
  'homeroom_attendance.view': 'Melihat Presensi Kelas Ampu',

  // JABATAN
  'jabatan.create': 'Menambah Jabatan Pegawai',
  'jabatan.delete': 'Menghapus Jabatan Pegawai',
  'jabatan.edit': 'Mengubah Jabatan Pegawai',
  'jabatan.export': 'Mengekspor Data Master Jabatan',
  'jabatan.import': 'Mengimpor Data Master Jabatan',
  'jabatan.view': 'Melihat Daftar Master Jabatan',

  // KEHADIRAN
  'kehadiran.siswa.absensi_digital': 'Input Absensi Digital Siswa',
  'kehadiran.siswa.barcode_kartu': 'Cetak & Scan Barcode Kartu Siswa',
  'kehadiran.siswa.izin_sakit': 'Pencatatan Izin/Sakit Siswa',
  'kehadiran.siswa.monitoring': 'Monitoring Kehadiran Siswa Real-Time',
  'kehadiran.siswa.rekap_keterlambatan': 'Rekapitulasi Keterlambatan Siswa',
  'kehadiran.siswa.rekap_ketidakhadiran': 'Rekapitulasi Ketidakhadiran Siswa',

  // KESISWAAN
  'kesiswaan.achievement.create': 'Menambah Prestasi Siswa',
  'kesiswaan.achievement.update': 'Mengubah Prestasi Siswa',
  'kesiswaan.achievement.view': 'Melihat Data Prestasi Siswa',
  'kesiswaan.alumni_tujuan_lanjut': 'Mencatat Kelanjutan Studi Alumni',
  'kesiswaan.catatan_siswa': 'Mengelola Catatan Perilaku Siswa',
  'kesiswaan.data_lengkap_siswa': 'Akses Detail Data Lengkap Siswa',
  'kesiswaan.kelas_rombel': 'Pengaturan Rombel Siswa',
  'kesiswaan.kelulusan_per_tahun': 'Melihat Kelulusan Per Tahun',
  'kesiswaan.kelulusan_per_unit': 'Melihat Kelulusan Per Unit',
  'kesiswaan.laporan_masuk_keluar': 'Melihat Laporan Mutasi Masuk/Keluar',
  'kesiswaan.penugasan_siswa': 'Mengatur Pembagian Kelas Siswa',
  'kesiswaan.rekap_prestasi': 'Melihat & Ekspor Rekap Prestasi',
  'kesiswaan.violation.create': 'Mencatat Pelanggaran Siswa',
  'kesiswaan.violation.update': 'Mengubah Catatan Pelanggaran Siswa',
  'kesiswaan.violation.view': 'Melihat Poin Pelanggaran Siswa',

  // LESSON ATTENDANCE
  'lesson_attendance.barcode_scan': 'Scan Barcode Presensi Mapel',
  'lesson_attendance.cancel': 'Membatalkan Sesi Presensi Mapel',
  'lesson_attendance.correct': 'Koreksi Presensi Mapel',
  'lesson_attendance.create': 'Input Presensi Jam Pelajaran',
  'lesson_attendance.export': 'Mengekspor Presensi Jam Pelajaran',
  'lesson_attendance.face_scan': 'Scan Wajah Presensi Mapel',
  'lesson_attendance.finalize': 'Finalisasi Presensi Jam Pelajaran',
  'lesson_attendance.fingerprint_scan': 'Scan Sidik Jari Presensi Mapel',
  'lesson_attendance.manual': 'Input Manual Presensi Mapel',
  'lesson_attendance.qr_scan': 'Scan QR Presensi Mapel',
  'lesson_attendance.scan_logs.view': 'Melihat Log Scan Presensi Mapel',
  'lesson_attendance.session.close': 'Menutup Sesi Jam Pelajaran',
  'lesson_attendance.session.start': 'Memulai Sesi Jam Pelajaran',
  'lesson_attendance.unlock': 'Buka Kunci Sesi Presensi Mapel',
  'lesson_attendance.update': 'Mengubah Presensi Jam Pelajaran',
  'lesson_attendance.view': 'Melihat Rekap Presensi Mapel',
  'lesson_attendance.view_own': 'Melihat Presensi Mapel Sendiri',

  // LMS
  'lms.manage': 'Mengelola Modul LMS',
  'lms.view': 'Melihat Materi & Kelas LMS',

  // MASTER
  'master.create': 'Menambah Data Master',
  'master.delete': 'Menghapus Data Master',
  'master.update': 'Mengubah Data Master',
  'master.view': 'Melihat Data Master',

  // MUTABAAH
  'mutabaah.agenda.create': 'Membuat Agenda Mutabaah',
  'mutabaah.agenda.delete': 'Menghapus Agenda Mutabaah',
  'mutabaah.agenda.manage': 'Mengelola Agenda Mutabaah',
  'mutabaah.agenda.restore': 'Pemulihan Agenda Mutabaah Terhapus',
  'mutabaah.agenda.update': 'Mengubah Agenda Mutabaah',
  'mutabaah.agenda.view': 'Melihat Agenda Mutabaah',
  'mutabaah.approve': 'Menyetujui Isian Mutabaah Siswa',
  'mutabaah.category.create': 'Membuat Kategori Mutabaah',
  'mutabaah.category.delete': 'Menghapus Kategori Mutabaah',
  'mutabaah.category.restore': 'Pemulihan Kategori Mutabaah Terhapus',
  'mutabaah.category.update': 'Mengubah Kategori Mutabaah',
  'mutabaah.category.view': 'Melihat Kategori Mutabaah',
  'mutabaah.create': 'Menambah Entri Mutabaah',
  'mutabaah.daily.finalize': 'Finalisasi Mutabaah Harian',
  'mutabaah.daily.input': 'Input Mutabaah Harian',
  'mutabaah.daily.reopen': 'Buka Kembali Mutabaah Harian',
  'mutabaah.daily.update': 'Mengubah Mutabaah Harian',
  'mutabaah.daily.view': 'Melihat Mutabaah Harian',
  'mutabaah.dashboard.view': 'Melihat Dashboard Mutabaah',
  'mutabaah.delete': 'Menghapus Entri Mutabaah',
  'mutabaah.export': 'Mengekspor Data Mutabaah',
  'mutabaah.import': 'Mengimpor Data Mutabaah',
  'mutabaah.input': 'Input Data Mutabaah',
  'mutabaah.parent.monitor': 'Orang Tua Memantau Mutabaah Anak',
  'mutabaah.parent.sign': 'Paraf Digital Orang Tua pada Mutabaah',
  'mutabaah.print': 'Mencetak Laporan Mutabaah',
  'mutabaah.recap.view': 'Melihat Rekap Mutabaah',
  'mutabaah.report.export': 'Mengekspor Laporan Mutabaah',
  'mutabaah.report.view': 'Melihat Laporan Mutabaah',
  'mutabaah.restore': 'Pemulihan Mutabaah Terhapus',
  'mutabaah.supervisor.create': 'Menambah Supervisor Mutabaah',
  'mutabaah.supervisor.delete': 'Menghapus Supervisor Mutabaah',
  'mutabaah.supervisor.update': 'Mengubah Supervisor Mutabaah',
  'mutabaah.supervisor.view': 'Melihat Supervisor Mutabaah',
  'mutabaah.template.assign': 'Penugasan Template Mutabaah',
  'mutabaah.template.create': 'Membuat Template Mutabaah',
  'mutabaah.template.delete': 'Menghapus Template Mutabaah',
  'mutabaah.template.update': 'Mengubah Template Mutabaah',
  'mutabaah.template.view': 'Melihat Template Mutabaah',
  'mutabaah.update': 'Mengubah Data Mutabaah',
  'mutabaah.view': 'Melihat Data Mutabaah',

  // NOTIFICATION
  'notification.manage': 'Mengelola Notifikasi Sistem',

  // PARENT
  'parent.assignment.view': 'Orang Tua Melihat Tugas Anak',
  'parent.attendance.view': 'Orang Tua Melihat Presensi Anak',
  'parent.child.view': 'Orang Tua Melihat Profil Anak',
  'parent.grade.view': 'Orang Tua Melihat Nilai Anak',
  'parent.mutabaah.view': 'Orang Tua Melihat Mutabaah Anak',
  'parent.notification.view': 'Orang Tua Melihat Notifikasi',
  'parent.permission.create': 'Orang Tua Mengajukan Izin Anak',
  'parent.portal.view': 'Akses Portal Orang Tua',
  'parent.tahfizh.view': 'Orang Tua Melihat Tahfizh Anak',

  // PEMBELAJARAN
  'pembelajaran.bank_soal': 'Mengelola & Akses Bank Soal',
  'pembelajaran.jadwal_pelajaran': 'Mengelola Jadwal Pelajaran',
  'pembelajaran.kalender_pendidikan': 'Mengelola Kalender Pendidikan',
  'pembelajaran.kisi_kisi_ujian': 'Mengelola Kisi-Kisi Ujian',
  'pembelajaran.kurikulum.create': 'Membuat Kurikulum Pembelajaran',
  'pembelajaran.kurikulum.delete': 'Menghapus Kurikulum Pembelajaran',
  'pembelajaran.kurikulum.edit': 'Mengubah Kurikulum Pembelajaran',
  'pembelajaran.kurikulum.export': 'Mengekspor Kurikulum Pembelajaran',
  'pembelajaran.kurikulum.import': 'Mengimpor Kurikulum Pembelajaran',
  'pembelajaran.kurikulum.restore': 'Pemulihan Kurikulum Terhapus',
  'pembelajaran.kurikulum.view': 'Melihat Kurikulum Pembelajaran',
  'pembelajaran.materi': 'Mengelola Materi Pembelajaran',

  // PERMISSION
  'permission.manage': 'Mengelola Master Izin Akses (Permissions)',

  // PORTAL
  'portal.view': 'Akses Portal Utama',

  // REPORT
  'report.academic.export': 'Mengekspor Laporan Akademik',
  'report.academic.view': 'Melihat Laporan Akademik',
  'report.attendance.export': 'Mengekspor Laporan Presensi',
  'report.attendance.view': 'Melihat Laporan Presensi',
  'report.cross_unit.export': 'Mengekspor Laporan Lintas Unit',
  'report.cross_unit.view': 'Melihat Laporan Lintas Unit',
  'report.export': 'Mengekspor Berbagai Laporan',
  'report.student.export': 'Mengekspor Laporan Kesiswaan',
  'report.student.view': 'Melihat Laporan Kesiswaan',
  'report.tahfizh.export': 'Mengekspor Laporan Tahfizh',
  'report.tahfizh.view': 'Melihat Laporan Tahfizh',
  'report.view': 'Melihat Pusat Laporan Sistem',

  // ROLE
  'role.manage': 'Mengelola Master Peran (Roles)',

  // SEKOLAH
  'sekolah.data_pribadi_siswa': 'Akses Data Pribadi Siswa',
  'sekolah.informasi_sekolah': 'Akses Informasi & Profil Sekolah',

  // SETTING
  'setting.manage': 'Mengelola Pengaturan Aplikasi',

  // SISTEM
  'sistem.hak_akses': 'Pengaturan Hak Akses & Role Sistem',
  'sistem.master_data': 'Mengelola Master Data Sistem',
  'sistem.pengaturan': 'Pengaturan Konfigurasi Teknis Sistem',

  // STUDENT
  'student.assignment.view': 'Siswa Melihat Tugas',
  'student.attendance.view': 'Siswa Melihat Presensi Sendiri',
  'student.create': 'Menambah Data Siswa',
  'student.delete': 'Menghapus Data Siswa',
  'student.export': 'Mengekspor Data Siswa',
  'student.grade.view': 'Siswa Melihat Nilai Sendiri',
  'student.import': 'Mengimpor Data Siswa',
  'student.material.view': 'Siswa Melihat Materi Pelajaran',
  'student.mutabaah.create': 'Siswa Mengisi Mutabaah Harian',
  'student.mutabaah.view': 'Siswa Melihat Mutabaah Sendiri',
  'student.notification.view': 'Siswa Melihat Notifikasi',
  'student.portal.view': 'Akses Portal Siswa',
  'student.profile.view': 'Siswa Melihat Profil Sendiri',
  'student.submission.create': 'Siswa Mengumpulkan Tugas',
  'student.submission.update': 'Siswa Memperbarui Kumpul Tugas',
  'student.tahfizh.view': 'Siswa Melihat Tahfizh Sendiri',
  'student.update': 'Mengubah Data Siswa',
  'student.view': 'Melihat Data Siswa',
  'student.view_all': 'Melihat Seluruh Siswa Semua Unit',
  'student.view_own': 'Melihat Profil Siswa Milik Sendiri',

  // STUDENT ATTENDANCE
  'student_attendance.daily.create': 'Catat Presensi Harian Siswa',
  'student_attendance.daily.export': 'Mengekspor Presensi Harian Siswa',
  'student_attendance.daily.scan': 'Scan Presensi Harian Siswa',
  'student_attendance.daily.update': 'Mengubah Presensi Harian Siswa',
  'student_attendance.daily.verify': 'Verifikasi Presensi Harian Siswa',
  'student_attendance.daily.view': 'Melihat Presensi Harian Siswa',
  'student_attendance.lesson.correct.approve': 'Disetujui Koreksi Presensi Mapel',
  'student_attendance.lesson.correct.request': 'Pengajuan Koreksi Presensi Mapel',
  'student_attendance.lesson.create': 'Catat Presensi Jam Pelajaran Siswa',
  'student_attendance.lesson.export': 'Mengekspor Presensi Jam Pelajaran Siswa',
  'student_attendance.lesson.finalize': 'Finalisasi Presensi Jam Pelajaran Siswa',
  'student_attendance.lesson.view': 'Melihat Presensi Jam Pelajaran Siswa',
  'student_attendance.permission.cancel': 'Batalkan Izin Presensi Siswa',
  'student_attendance.permission.create': 'Buat Pengajuan Izin Presensi Siswa',
  'student_attendance.permission.update': 'Mengubah Izin Presensi Siswa',
  'student_attendance.view_own': 'Melihat Presensi Siswa Sendiri',

  // TAHFIZH
  'tahfizh.deposit.create': 'Input Setoran Hafalan Qur\'an',
  'tahfizh.deposit.finalize': 'Finalisasi Setoran Hafalan Qur\'an',
  'tahfizh.deposit.update': 'Mengubah Setoran Hafalan Qur\'an',
  'tahfizh.deposit.view': 'Melihat Daftar Setoran Hafalan',
  'tahfizh.hafalan_terbanyak': 'Melihat Rekap Hafalan Terbanyak',
  'tahfizh.hitung_baris': 'Perhitungan Jumlah Baris Hafalan',
  'tahfizh.input_setoran_harian': 'Input Setoran Tahfizh Harian',
  'tahfizh.laporan_target': 'Melihat Laporan Target Hafalan',
  'tahfizh.monitoring_target': 'Monitoring Target Hafalan',
  'tahfizh.mutabaah_yaumiyah': 'Catatan Mutabaah Tilawah & Muraja\'ah',
  'tahfizh.perhitungan_tercapai': 'Kalkulasi Pencapaian Target Tahfizh',
  'tahfizh.rekap_bulanan': 'Rekapitulasi Tahfizh Bulanan',
  'tahfizh.rekap_harian': 'Rekapitulasi Tahfizh Harian',
  'tahfizh.rekap_mingguan': 'Rekapitulasi Tahfizh Mingguan',
  'tahfizh.rekap_tahunan': 'Rekapitulasi Tahfizh Tahunan',
  'tahfizh.total_hafalan': 'Melihat Total Hafalan Al-Qur\'an',

  // TEACHER
  'teacher.assignment.create': 'Guru Membuat Tugas',
  'teacher.assignment.delete': 'Guru Menghapus Tugas',
  'teacher.assignment.update': 'Guru Mengedit Tugas',
  'teacher.assignment.view': 'Guru Melihat Tugas',
  'teacher.attendance.create': 'Guru Mengabsen Siswa',
  'teacher.attendance.update': 'Guru Mengedit Absensi Siswa',
  'teacher.attendance.view': 'Guru Melihat Absensi Siswa',
  'teacher.dashboard.view': 'Dashboard Guru',
  'teacher.grade.create': 'Guru Menginput Nilai',
  'teacher.grade.update': 'Guru Mengedit Nilai',
  'teacher.grade.view': 'Guru Melihat Rekap Nilai',
  'teacher.material.create': 'Guru Mengunggah Materi',
  'teacher.material.delete': 'Guru Menghapus Materi',
  'teacher.material.update': 'Guru Memperbarui Materi',
  'teacher.material.view': 'Guru Melihat Materi',
  'teacher.mutabaah.create': 'Guru Menginput Mutabaah Siswa',
  'teacher.mutabaah.update': 'Guru Mengedit Mutabaah Siswa',
  'teacher.mutabaah.view': 'Guru Melihat Mutabaah Siswa',
  'teacher.schedule.view': 'Guru Melihat Jadwal Mengajar',
  'teacher.student_note.create': 'Guru Membuat Catatan Siswa',
  'teacher.student_note.update': 'Guru Mengubah Catatan Siswa',
  'teacher.student_note.view': 'Guru Melihat Catatan Siswa',
  'teacher.submission.view': 'Guru Menilai Pengumpulan Tugas',
  'teacher.tahfizh.create': 'Guru Menginput Setoran Tahfizh',
  'teacher.tahfizh.update': 'Guru Mengedit Setoran Tahfizh',
  'teacher.tahfizh.view': 'Guru Melihat Setoran Tahfizh',

  // TEACHER MONITORING
  'teacher_monitoring.view': 'Monitoring Keaktifan Guru Mengajar',

  // TEACHER PRESENCE
  'teacher_presence.heartbeat': 'Status Heartbeat Presensi Guru',

  // TEACHING ATTENDANCE
  'teaching_attendance.scan': 'Scan Jam Mengajar Guru',
  'teaching_attendance.view_own': 'Guru Melihat Jam Mengajar Sendiri',

  // TEACHING SESSION
  'teaching_session.close': 'Menutup Sesi Jam Kelas',
  'teaching_session.start': 'Memulai Sesi Jam Kelas',

  // UNIT
  'unit.create': 'Menambah Unit Sekolah',
  'unit.delete': 'Menghapus Unit Sekolah',
  'unit.update': 'Mengubah Unit Sekolah',
  'unit.view': 'Melihat Unit Sekolah',
  'unit.view_all': 'Melihat Seluruh Unit Sekolah',

  // USER
  'user.manage': 'Mengelola Akun Pengguna (User)',

  // WORSHIP ATTENDANCE
  'worship_attendance.export': 'Mengekspor Laporan Presensi Ibadah',
  'worship_attendance.private_status.view': 'Melihat Status Halangan Ibadah',
  'worship_attendance.scan': 'Scan Presensi Sholat Berjamaah',
  'worship_attendance.session.manage': 'Mengelola Sesi Ibadah/Sholat',
  'worship_attendance.template.manage': 'Mengelola Template Presensi Ibadah',
  'worship_attendance.verify': 'Verifikasi Presensi Ibadah Siswa',
  'worship_attendance.view': 'Melihat Rekap Presensi Ibadah',
}

/**
 * Mengambil nama modul dalam Bahasa Indonesia.
 */
export function getModulLabel(modulKey) {
  if (!modulKey) return 'Lainnya'
  const key = String(modulKey).toLowerCase().trim()
  return PERMISSION_MODULE_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
}

/**
 * Mengambil label izin akses dalam Bahasa Indonesia.
 * Jika key belum ada di kamus, akan diproses menggunakan pemeta otomatis yang pintar.
 */
export function getPermissionLabel(permKey) {
  if (!permKey) return ''
  const key = String(permKey).trim()
  if (PERMISSION_LABELS[key]) return PERMISSION_LABELS[key]

  // Dynamic Fallback Formatter
  const parts = key.split('.')
  const actionMap = {
    create: 'Membuat',
    add: 'Menambah',
    update: 'Mengubah',
    edit: 'Mengedit',
    delete: 'Menghapus',
    destroy: 'Menghapus',
    view: 'Melihat',
    show: 'Melihat',
    manage: 'Mengelola',
    publish: 'Publikasi',
    finalize: 'Finalisasi',
    export: 'Mengekspor',
    import: 'Mengimpor',
    scan: 'Pindaian Scan',
    cancel: 'Membatalkan',
    review: 'Meninjau',
    submit: 'Mengajukan',
    verify: 'Verifikasi',
    restore: 'Memulihkan',
  }
  const lastPart = parts[parts.length - 1].toLowerCase()
  const actionText = actionMap[lastPart] || (lastPart.charAt(0).toUpperCase() + lastPart.slice(1))

  const entityParts = parts.slice(0, -1)
  const entityText = entityParts.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/_/g, ' ')).join(' ')

  return `${actionText} ${entityText}`.trim()
}
