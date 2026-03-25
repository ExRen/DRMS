# DATABASE ARCHITECTURE
# DRMS PT ASABRI (Persero)
# Tech: PostgreSQL + Prisma ORM

---

## DAFTAR ISI

1. [Prinsip Desain Database](#1-prinsip-desain-database)
2. [Gambaran Relasi Antar Tabel](#2-gambaran-relasi-antar-tabel)
3. [Enum Definitions](#3-enum-definitions)
4. [Schema Prisma Lengkap](#4-schema-prisma-lengkap)
5. [Penjelasan Per Tabel](#5-penjelasan-per-tabel)
6. [Index Strategy](#6-index-strategy)
7. [Seed Data Structure](#7-seed-data-structure)
8. [Migration Strategy](#8-migration-strategy)
9. [Query Patterns Utama](#9-query-patterns-utama)

---

## 1. Prinsip Desain Database

### 1.1 Kenapa PostgreSQL?
- Support JSON column untuk `oldValue`/`newValue` di audit log
- Full-text search untuk pencarian arsip (tanpa perlu Elasticsearch)
- Reliable untuk workload enterprise BUMN
- ACID compliance penuh — kritis untuk workflow approval yang multi-step

### 1.2 Kenapa Prisma?
- Type-safety end-to-end: schema Prisma men-generate TypeScript types secara otomatis
- Migration system yang deterministik dan dapat di-rollback
- Prisma Studio untuk inspeksi data saat development
- Query builder yang aman dari SQL injection by default

### 1.3 Keputusan Desain Utama

| Keputusan | Alasan |
|---|---|
| Retensi disimpan dalam **bulan** (bukan tahun) | BRS memiliki kondisi retensi "Selama Masih Digunakan" dan "2 Tahun Setelah Tidak Berlaku" — satuan bulan (integer) lebih fleksibel untuk kalkulasi |
| `tanggalAktifBerakhir` & `tanggalInaktifBerakhir` di-store di tabel `Arsip` | Pre-computation — agar query dashboard tidak perlu join + kalkulasi setiap saat; cukup pakai index |
| `UsulMusnah` punya dua kolom approval terpisah | BRS mendefinisikan dua aktor berbeda: Kadiv/Kabid (approval bisnis) dan Setum (verifikasi administrasi) |
| `User` disimpan lokal setelah login LDAP | AD adalah sumber kebenaran autentikasi; tabel lokal hanya sebagai cache untuk kebutuhan relasi FK di database |
| `KodeKlasifikasi` sebagai tabel master terpisah | 200+ kode dari BRS harus di-seed dan dijadikan referensi untuk kalkulasi retensi otomatis |
| `LokasiSimpan` sebagai tabel terpisah (one-to-one) | Lokasi fisik diisi oleh aktor berbeda (Setum) dan bisa berubah tanpa menyentuh data induk arsip; audit trail lebih bersih |
| `fileDigitalKey` bukan URL | URL di MinIO bersifat presigned dan expired — yang disimpan adalah key/path-nya, URL di-generate on-the-fly |

---

## 2. Gambaran Relasi Antar Tabel

```
┌─────────────────────────────────────────────────────────────────────┐
│                         MASTER DATA                                  │
│                                                                      │
│  ┌──────────────┐        ┌──────────────────────┐                   │
│  │  UnitKerja   │        │   KodeKlasifikasi    │                   │
│  │──────────────│        │──────────────────────│                   │
│  │ id (PK)      │        │ id (PK)              │                   │
│  │ kode         │        │ kode (UNIQUE)        │                   │
│  │ nama         │        │ kategori             │                   │
│  │ parentId(FK) │◄──┐    │ jenisArsip           │                   │
│  └──────┬───────┘   │    │ retensiAktifBulan    │                   │
│         │ self-ref  │    │ retensiInaktifBulan  │                   │
│         └───────────┘    │ keterangan           │                   │
│                          └──────────┬───────────┘                   │
└──────────────────────────────────── │ ───────────────────────────── ┘
                                      │
┌─────────────────────────────────────│───────────────────────────────┐
│                      USER MANAGEMENT│                                │
│                                     │                                │
│  ┌──────────────────────────┐       │                                │
│  │          User            │       │                                │
│  │──────────────────────────│       │                                │
│  │ id (PK)                  │       │                                │
│  │ adUsername (UNIQUE)      │       │                                │
│  │ nama                     │       │                                │
│  │ email (UNIQUE)           │       │                                │
│  │ role [USER/APPROVAL/SETUM│       │                                │
│  │ unitKerjaId (FK)─────────┼──►UnitKerja                           │
│  └──────────┬───────────────┘       │                                │
└─────────────│─────────────────────── │ ──────────────────────────── ┘
              │                        │
┌─────────────│────────────────────────│──────────────────────────────┐
│             │    CORE: ARSIP         │                               │
│             │                        │                               │
│  ┌──────────▼────────────────────────▼──────────────────────┐       │
│  │                         Arsip                            │       │
│  │──────────────────────────────────────────────────────────│       │
│  │ id (PK)                                                  │       │
│  │ nomorArsip                                               │       │
│  │ nomorBerkas                                              │       │
│  │ kodeKlasifikasiId (FK) ──────────►KodeKlasifikasi        │       │
│  │ uraianInformasi                                          │       │
│  │ tahun                                                    │       │
│  │ tingkatPerkembangan [ASLI/SALINAN]                       │       │
│  │ kondisiFisik [BAIK/RUSAK/LENGKAP/TIDAK_LENGKAP]          │       │
│  │ jumlahBerkas                                             │       │
│  │ status [AKTIF/INAKTIF/USUL_MUSNAH/MUSNAH/PERMANEN]       │       │
│  │ unitKerjaId (FK) ──────────►UnitKerja                    │       │
│  │ tanggalAktifBerakhir  ◄── kalkulasi otomatis             │       │
│  │ tanggalInaktifBerakhir ◄── kalkulasi otomatis            │       │
│  │ fileDigitalKey (MinIO path)                              │       │
│  │ createdById (FK) ──────────►User                         │       │
│  │ updatedById (FK) ──────────►User                         │       │
│  └───┬──────────────────────────────────────────────────────┘       │
│      │                                                               │
│      │ one-to-one          one-to-many        one-to-many           │
│      │                                                               │
│  ┌───▼──────────┐   ┌──────────────────┐  ┌──────────────────────┐ │
│  │ LokasiSimpan │   │   UsulMusnah     │  │ PerpanjanganRetensi  │ │
│  │──────────────│   │──────────────────│  │──────────────────────│ │
│  │ id (PK)      │   │ id (PK)          │  │ id (PK)              │ │
│  │ arsipId (FK) │   │ arsipId (FK)     │  │ arsipId (FK)         │ │
│  │ nomorLaci    │   │ fileNotaDinasKey │  │ durasiPerpanjangan   │ │
│  │ nomorRak     │   │ uraianSingkat    │  │ alasanPerpanjangan   │ │
│  │ nomorBoks    │   │ masaSimpan       │  │ status               │ │
│  │ nomorFolder  │   │ statusApproval   │  │ approvedOlehId (FK)  │ │
│  └──────────────┘   │ approvedOlehId  │  │ diajukanOlehId (FK)  │ │
│                     │ penilaian...    │  │ tanggalInaktifBaru   │ │
│                     │ statusVerifSetum│  └──────────────────────┘ │
│                     │ verifikasiSetum │                             │
│                     │ diajukanOlehId  │                             │
│                     └──────────────── ┘                             │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                        SISTEM PENDUKUNG                              │
│                                                                      │
│  ┌──────────────────────────┐   ┌──────────────────────────────┐   │
│  │        AuditLog          │   │         Notifikasi           │   │
│  │──────────────────────────│   │──────────────────────────────│   │
│  │ id (PK)                  │   │ id (PK)                      │   │
│  │ userId (FK) ────►User    │   │ userId (FK) ────►User        │   │
│  │ action                   │   │ jenis                        │   │
│  │ entityType               │   │ judul                        │   │
│  │ entityId                 │   │ pesan                        │   │
│  │ oldValue (JSON)          │   │ isRead                       │   │
│  │ newValue (JSON)          │   │ entityType                   │   │
│  │ ipAddress                │   │ entityId                     │   │
│  │ userAgent                │   └──────────────────────────────┘   │
│  └──────────────────────────┘                                       │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 3. Enum Definitions

```prisma
// ─── Role User ────────────────────────────────────────────────────────────
enum Role {
  USER           // Seluruh karyawan — bisa input arsip dan pencarian
  USER_APPROVAL  // Kadiv & Kabid — bisa approve usul musnah
  USER_SETUM     // Staf Sekretariat Umum — full access termasuk verifikasi
}

// ─── Status Siklus Hidup Arsip ────────────────────────────────────────────
enum StatusArsip {
  AKTIF          // Arsip baru dibuat, masih dalam masa retensi aktif
  INAKTIF        // Masa retensi aktif habis, sudah dipindah ke record center
  USUL_MUSNAH    // Unit kerja sudah mengajukan pemusnahan, pending approval
  MUSNAH         // Sudah disetujui dua pihak dan dianggap musnah di sistem
  PERMANEN       // Keterangan retensi = PERMANEN, tidak bisa masuk alur musnah
}

// ─── Tingkat Perkembangan Dokumen ─────────────────────────────────────────
enum TingkatPerkembangan {
  ASLI           // Dokumen asli / original
  SALINAN        // Dokumen salinan / fotokopi
}

// ─── Kondisi Fisik Arsip ──────────────────────────────────────────────────
enum KondisiFisik {
  BAIK
  RUSAK
  LENGKAP
  TIDAK_LENGKAP
}

// ─── Keterangan Akhir Retensi ─────────────────────────────────────────────
enum KeteranganRetensi {
  PERMANEN       // Setelah masa inaktif: disimpan permanen, tidak dimusnahkan
  MUSNAH         // Setelah masa inaktif: dimusnahkan
}

// ─── Status pada Alur Approval ────────────────────────────────────────────
enum StatusApproval {
  PENDING        // Belum ada tindakan dari approver
  DISETUJUI      // Disetujui oleh approver
  DITOLAK        // Ditolak, arsip dikembalikan ke status sebelumnya
}

// ─── Jenis Notifikasi ─────────────────────────────────────────────────────
enum JenisNotifikasi {
  RETENSI_AKTIF_BERAKHIR      // H-30 sebelum arsip aktif berakhir
  RETENSI_INAKTIF_BERAKHIR    // H-30 sebelum arsip inaktif siap musnah
  USUL_MUSNAH_BARU            // Ada pengajuan baru untuk di-approve
  USUL_MUSNAH_DISETUJUI       // Notif ke pengaju bahwa usulnya disetujui
  USUL_MUSNAH_DITOLAK         // Notif ke pengaju bahwa usulnya ditolak
  PERPANJANGAN_DISETUJUI      // Notif ke pengaju bahwa perpanjangan disetujui
  PERPANJANGAN_DITOLAK        // Notif ke pengaju bahwa perpanjangan ditolak
  VERIFIKASI_SETUM_DIBUTUHKAN // Notif ke Setum bahwa ada yg butuh verifikasi
}
```

---

## 4. Schema Prisma Lengkap

```prisma
// =============================================================================
// FILE: packages/database/prisma/schema.prisma
// =============================================================================

generator client {
  provider        = "prisma-client-js"
  output          = "../generated/client"
  previewFeatures = ["fullTextSearch", "fullTextIndex"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =============================================================================
// ENUMS
// =============================================================================

enum Role {
  USER
  USER_APPROVAL
  USER_SETUM
}

enum StatusArsip {
  AKTIF
  INAKTIF
  USUL_MUSNAH
  MUSNAH
  PERMANEN
}

enum TingkatPerkembangan {
  ASLI
  SALINAN
}

enum KondisiFisik {
  BAIK
  RUSAK
  LENGKAP
  TIDAK_LENGKAP
}

enum KeteranganRetensi {
  PERMANEN
  MUSNAH
}

enum StatusApproval {
  PENDING
  DISETUJUI
  DITOLAK
}

enum JenisNotifikasi {
  RETENSI_AKTIF_BERAKHIR
  RETENSI_INAKTIF_BERAKHIR
  USUL_MUSNAH_BARU
  USUL_MUSNAH_DISETUJUI
  USUL_MUSNAH_DITOLAK
  PERPANJANGAN_DISETUJUI
  PERPANJANGAN_DITOLAK
  VERIFIKASI_SETUM_DIBUTUHKAN
}

// =============================================================================
// MASTER DATA
// =============================================================================

/// Hirarki unit kerja PT ASABRI (Persero).
/// Self-referencing: Divisi → Bidang → Sub-bidang.
/// Digunakan untuk menentukan kepemilikan arsip dan routing approval.
model UnitKerja {
  id       String  @id @default(cuid())
  kode     String  @unique
  nama     String
  level    Int     @default(1) // 1=Divisi, 2=Bidang, 3=Sub-bidang
  isActive Boolean @default(true)

  // Self-referencing untuk hirarki
  parentId String?
  parent   UnitKerja?  @relation("UnitKerjaHirarki", fields: [parentId], references: [id])
  children UnitKerja[] @relation("UnitKerjaHirarki")

  // Relasi ke entitas lain
  users  User[]
  arsips Arsip[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([parentId])
  @@map("unit_kerja")
}

/// Tabel master kode klasifikasi arsip beserta jadwal retensinya.
/// Di-seed dari data BRS halaman 9–58 (200+ entri).
/// Ini adalah JANTUNG kalkulasi retensi otomatis.
///
/// Catatan retensiAktifBulan:
/// - Nilai positif = jumlah bulan normal
/// - Nilai -1 = kondisional (mis: "Selama Masih Digunakan"),
///   ditangani oleh business logic khusus di retensi.service.ts
///
/// Catatan catatanRetensiAktif / catatanRetensiInaktif:
/// - Teks asli dari BRS untuk kondisi retensi yang tidak bisa
///   direpresentasikan sebagai angka murni (ditampilkan sebagai
///   tooltip informatif di UI)
model KodeKlasifikasi {
  id      String @id @default(cuid())
  kode    String @unique // Contoh: "PR.01.01", "TU.07.01"

  // Kategori besar (Nomor urut di BRS, mis: 1 = PR, 8 = TU)
  noUrut    Int
  kategori  String // Contoh: "PERENCANAAN STRATEGIS"

  // Sub-kategori (mis: "PR.01" = "Rencana Jangka Panjang Perusahaan")
  subKategori String?

  // Deskripsi jenis arsip (mis: "Penyusunan RJPP")
  jenisArsip String

  // Deskripsi dokumen apa saja yang termasuk (mis: "Nota Dinas, Kajian")
  komponenDokumen String?

  // Retensi dalam BULAN (-1 = kondisional)
  retensiAktifBulan    Int
  retensiInaktifBulan  Int

  // Keterangan akhir siklus hidup
  keterangan KeteranganRetensi

  // Teks asli kondisi retensi dari BRS (untuk tooltip UI)
  catatanRetensiAktif    String?
  catatanRetensiInaktif  String?

  arsips Arsip[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([noUrut])
  @@index([kategori])
  @@map("kode_klasifikasi")
}

// =============================================================================
// USER MANAGEMENT
// =============================================================================

/// User disimpan lokal setelah pertama kali autentikasi via LDAP/Active Directory.
/// Active Directory = sumber kebenaran autentikasi.
/// Tabel ini = cache data user untuk kebutuhan relasi FK di PostgreSQL.
///
/// Flow: Login → LDAP verify → Jika berhasil, cari/create user lokal →
///       Generate JWT → JWT digunakan untuk semua request berikutnya.
model User {
  id          String  @id @default(cuid())
  adUsername  String  @unique // SAMAccountName dari Active Directory
  nama        String
  email       String  @unique
  jabatan     String?
  nip         String? @unique // Nomor Induk Pegawai
  role        Role    @default(USER)
  isActive    Boolean @default(true)

  unitKerjaId String
  unitKerja   UnitKerja @relation(fields: [unitKerjaId], references: [id])

  // Relasi ke aktivitas user (sebagai kreator/modifier)
  arsipDibuat  Arsip[] @relation("ArsipCreatedBy")
  arsipDiupdate Arsip[] @relation("ArsipUpdatedBy")

  // Relasi ke workflow
  usulDiajukan     UsulMusnah[]          @relation("UsulDiajukanOleh")
  usulApproved     UsulMusnah[]          @relation("UsulApprovedOleh")
  usulVerifikasiSetum UsulMusnah[]       @relation("UsulVerifikasiSetum")
  perpDiajukan     PerpanjanganRetensi[] @relation("PerpanjanganDiajukan")
  perpApproved     PerpanjanganRetensi[] @relation("PerpanjanganApproved")

  // Sistem pendukung
  auditLogs    AuditLog[]
  notifikasis  Notifikasi[]

  lastLoginAt DateTime?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([unitKerjaId])
  @@index([role])
  @@map("users")
}

// =============================================================================
// CORE: ARSIP
// =============================================================================

/// Tabel utama — setiap baris mewakili SATU berkas arsip.
/// Ini adalah tabel paling central dalam seluruh sistem.
///
/// Field tanggalAktifBerakhir dan tanggalInaktifBerakhir
/// dikalkulasi otomatis saat arsip dibuat berdasarkan:
/// tanggalDasar = 1 Januari tahun arsip
/// tanggalAktifBerakhir = tanggalDasar + retensiAktifBulan
/// tanggalInaktifBerakhir = tanggalAktifBerakhir + retensiInaktifBulan
/// (null jika keterangan = PERMANEN)
model Arsip {
  id           String @id @default(cuid())
  nomorArsip   String? // Auto-generate atau manual, sesuai SOP
  nomorBerkas  String

  kodeKlasifikasiId String
  kodeKlasifikasi   KodeKlasifikasi @relation(fields: [kodeKlasifikasiId], references: [id])

  uraianInformasi String? @db.Text
  tahun           Int     // Tahun arsip dibuat/terbit (bukan tahun input)

  tingkatPerkembangan TingkatPerkembangan @default(ASLI)
  kondisiFisik        KondisiFisik        @default(BAIK)
  jumlahBerkas        Int                 @default(1)

  status StatusArsip @default(AKTIF)

  unitKerjaId String
  unitKerja   UnitKerja @relation(fields: [unitKerjaId], references: [id])

  // ── Kalkulasi Retensi (Pre-computed & Stored) ───────────────────────────
  tanggalAktifBerakhir    DateTime?
  tanggalInaktifBerakhir  DateTime? // null jika keterangan = PERMANEN

  // ── File Digital ─────────────────────────────────────────────────────────
  // Path/key di MinIO, bukan URL langsung.
  // Format: "arsip/{tahun}/{kodeKlasifikasi}/{uuid}.{ext}"
  // Contoh: "arsip/2024/PR.01.01/arsip-abc123.pdf"
  fileDigitalKey  String?
  fileMimeType    String? // Contoh: "application/pdf", "image/jpeg"
  fileUkuranBytes Int?    // Ukuran file dalam bytes

  // ── Catatan Tambahan ─────────────────────────────────────────────────────
  catatan String? @db.Text

  // ── Audit Fields ─────────────────────────────────────────────────────────
  createdById String
  createdBy   User   @relation("ArsipCreatedBy", fields: [createdById], references: [id])
  updatedById String?
  updatedBy   User?  @relation("ArsipUpdatedBy", fields: [updatedById], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // ── Relasi ke Proses Lanjutan ─────────────────────────────────────────────
  lokasiSimpan        LokasiSimpan?
  usulMusnahs         UsulMusnah[]
  perpanjanganRetensi PerpanjanganRetensi[]

  // ── Indexes ───────────────────────────────────────────────────────────────
  // Indexes dipilih berdasarkan query patterns yang paling sering digunakan:
  @@index([status])                   // Filter by status (paling sering)
  @@index([unitKerjaId])              // Filter by unit kerja
  @@index([kodeKlasifikasiId])        // Filter by kode klasifikasi
  @@index([tahun])                    // Filter by tahun
  @@index([tanggalAktifBerakhir])     // Cron job: monitoring retensi aktif
  @@index([tanggalInaktifBerakhir])   // Cron job: monitoring retensi inaktif
  @@index([status, unitKerjaId])      // Compound: filter status + unit kerja
  @@index([status, tanggalAktifBerakhir]) // Dashboard: arsip aktif akan segera habis

  @@map("arsip")
}

/// Lokasi simpan fisik arsip.
/// Diisi oleh User Setum setelah arsip berstatus INAKTIF.
/// Relasi one-to-one dengan Arsip.
///
/// Skema pengisian field:
/// Arsip AKTIF di Unit Kerja → nomorLaci + nomorFolder (laci meja)
/// Arsip INAKTIF di Record Center → nomorRak + nomorBoks + nomorFolder
model LokasiSimpan {
  id      String @id @default(cuid())
  arsipId String @unique
  arsip   Arsip  @relation(fields: [arsipId], references: [id], onDelete: Cascade)

  // Lokasi di unit kerja (arsip aktif)
  nomorLaci   String?

  // Lokasi di record center (arsip inaktif)
  nomorRak    String?
  nomorBoks   String?
  nomorFolder String?

  keterangan String? @db.Text

  // Siapa Setum yang terakhir mengupdate lokasi ini
  updatedBySetumId String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("lokasi_simpan")
}

// =============================================================================
// WORKFLOW: PEMUSNAHAN ARSIP
// =============================================================================

/// Proses usul musnah memiliki DUA tahap approval bertingkat:
///
/// TAHAP 1 — Approval Kadiv/Kabid Unit Kerja:
///   Menilai dari sisi operasional apakah arsip memang sudah tidak dibutuhkan.
///   Field: statusApproval, approvedOlehId, penilaianApproval, tanggalApproval
///
/// TAHAP 2 — Verifikasi Setum:
///   Memverifikasi kelengkapan administrasi pemusnahan.
///   Field: statusVerifikasiSetum, verifikasiSetumId, catatanSetum, tanggalVerifikasi
///
/// Arsip baru benar-benar berstatus MUSNAH setelah KEDUANYA menyetujui.
///
/// Jika Tahap 1 DITOLAK → kembali ke INAKTIF, UsulMusnah ini di-archive.
/// Jika Tahap 2 DITOLAK → kembali ke INAKTIF, UsulMusnah ini di-archive.
model UsulMusnah {
  id      String @id @default(cuid())
  arsipId String
  arsip   Arsip  @relation(fields: [arsipId], references: [id])

  // Eviden — file nota dinas sebagai dasar pengajuan
  fileNotaDinasKey String? // Key di MinIO

  uraianSingkat String? @db.Text
  masaSimpan    Int     // Dalam bulan, diambil dari KodeKlasifikasi.retensiInaktifBulan

  // ── Tahap 1: Approval Kadiv/Kabid ────────────────────────────────────────
  statusApproval    StatusApproval @default(PENDING)
  approvedOlehId    String?
  approvedOleh      User?          @relation("UsulApprovedOleh", fields: [approvedOlehId], references: [id])
  penilaianApproval String?        @db.Text
  tanggalApproval   DateTime?

  // ── Tahap 2: Verifikasi Setum ─────────────────────────────────────────────
  statusVerifikasiSetum StatusApproval @default(PENDING)
  verifikasiSetumId     String?
  verifikasiSetum       User?          @relation("UsulVerifikasiSetum", fields: [verifikasiSetumId], references: [id])
  catatanSetum          String?        @db.Text
  tanggalVerifikasi     DateTime?

  // ── Pengaju ───────────────────────────────────────────────────────────────
  diajukanOlehId String
  diajukanOleh   User   @relation("UsulDiajukanOleh", fields: [diajukanOlehId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([arsipId])
  @@index([statusApproval])
  @@index([statusVerifikasiSetum])
  @@index([statusApproval, statusVerifikasiSetum]) // Dashboard Setum
  @@map("usul_musnah")
}

// =============================================================================
// WORKFLOW: PERPANJANGAN RETENSI
// =============================================================================

/// Diajukan ketika arsip yang sudah memasuki masa inaktif
/// masih dibutuhkan oleh unit kerja melebihi jadwal retensi standar.
///
/// Jika DISETUJUI:
///   tanggalInaktifBerakhir di tabel Arsip diupdate ke
///   tanggalInaktifBerakhir + durasiPerpanjanganBulan.
///
/// Jika DITOLAK:
///   Arsip tetap dengan tanggal retensi semula dan proses
///   pemusnahan dapat berjalan normal.
///
/// Satu arsip bisa mengajukan perpanjangan lebih dari satu kali
/// (one-to-many dari Arsip).
model PerpanjanganRetensi {
  id      String @id @default(cuid())
  arsipId String
  arsip   Arsip  @relation(fields: [arsipId], references: [id])

  durasiPerpanjanganBulan Int    // Berapa bulan ingin diperpanjang
  alasanPerpanjangan      String @db.Text

  status StatusApproval @default(PENDING)

  approvedOlehId String?
  approvedOleh   User?   @relation("PerpanjanganApproved", fields: [approvedOlehId], references: [id])
  catatanApproval String? @db.Text

  // Dikalkulasi saat disetujui:
  // tanggalInaktifBaruBerakhir = Arsip.tanggalInaktifBerakhir + durasiPerpanjanganBulan
  tanggalInaktifBaruBerakhir DateTime?

  diajukanOlehId String
  diajukanOleh   User   @relation("PerpanjanganDiajukan", fields: [diajukanOlehId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([arsipId])
  @@index([status])
  @@map("perpanjangan_retensi")
}

// =============================================================================
// SISTEM PENDUKUNG
// =============================================================================

/// Audit log otomatis — setiap mutasi pada data penting dicatat.
/// Di-generate oleh AuditLogInterceptor di NestJS secara otomatis.
/// Tidak pernah di-delete (append-only table).
///
/// Memenuhi kebutuhan akuntabilitas dan transparansi yang disebut di BRS.
model AuditLog {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id])

  // Tipe aksi
  action String
  // Nilai yang valid: CREATE | UPDATE | DELETE | APPROVE | REJECT |
  //                  VERIFY | DOWNLOAD | LOGIN | LOGOUT

  // Entity yang terdampak
  entityType String
  // Nilai yang valid: Arsip | UsulMusnah | PerpanjanganRetensi |
  //                  LokasiSimpan | User | KodeKlasifikasi

  entityId String

  // Snapshot sebelum dan sesudah perubahan
  // Disimpan sebagai JSON untuk fleksibilitas
  oldValue Json?
  newValue Json?

  // Konteks request
  ipAddress String?
  userAgent String?

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([entityType, entityId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_log")
}

/// Notifikasi in-app untuk setiap user.
/// Di-generate oleh:
/// 1. Cron job harian (retensi berakhir)
/// 2. Event-driven setelah approval/rejection
///
/// Dipaginate saat diambil — tidak pernah di-delete,
/// hanya di-mark sebagai isRead.
model Notifikasi {
  id     String @id @default(cuid())
  userId String
  user   User   @relation(fields: [userId], references: [id])

  jenis  JenisNotifikasi
  judul  String
  pesan  String          @db.Text
  isRead Boolean         @default(false)

  // Deep link ke entity terkait
  // Digunakan frontend untuk navigasi saat notifikasi diklik
  entityType String? // Contoh: "Arsip", "UsulMusnah"
  entityId   String? // ID dari entity tersebut

  createdAt DateTime @default(now())

  @@index([userId, isRead])        // Fetch unread notif user
  @@index([userId, createdAt])     // Fetch notif terbaru user
  @@map("notifikasi")
}
```

---

## 5. Penjelasan Per Tabel

### 5.1 `unit_kerja`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (CUID) | PK |
| kode | String UNIQUE | Kode singkat unit (mis: "DIV-SI") |
| nama | String | Nama lengkap unit kerja |
| level | Int | 1=Divisi, 2=Bidang, 3=Sub-bidang |
| isActive | Boolean | Soft-delete pattern |
| parentId | String? FK | Referensi ke unit kerja induk |

### 5.2 `kode_klasifikasi`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (CUID) | PK |
| kode | String UNIQUE | Format: "AB.00.00" (mis: "PR.01.01") |
| noUrut | Int | Nomor urut kategori besar (1=PR, 2=MN, …) |
| kategori | String | Nama kategori besar |
| subKategori | String? | Nama sub-kategori |
| jenisArsip | String | Deskripsi jenis arsip |
| komponenDokumen | String? | Daftar dokumen penyusun |
| retensiAktifBulan | Int | Masa retensi aktif dalam bulan (-1=kondisional) |
| retensiInaktifBulan | Int | Masa retensi inaktif dalam bulan (-1=kondisional) |
| keterangan | Enum | PERMANEN atau MUSNAH |
| catatanRetensiAktif | String? | Teks kondisi dari BRS (untuk tooltip UI) |
| catatanRetensiInaktif | String? | Teks kondisi dari BRS (untuk tooltip UI) |

### 5.3 `users`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (CUID) | PK internal |
| adUsername | String UNIQUE | SAMAccountName dari AD |
| nama | String | Nama lengkap |
| email | String UNIQUE | Email corporate |
| jabatan | String? | Jabatan dari AD |
| nip | String? UNIQUE | Nomor Induk Pegawai |
| role | Enum | USER / USER_APPROVAL / USER_SETUM |
| isActive | Boolean | Jika AD account di-disable, set false |
| unitKerjaId | String FK | FK ke unit_kerja |
| lastLoginAt | DateTime? | Tracking aktivitas login terakhir |

### 5.4 `arsip`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (CUID) | PK |
| nomorArsip | String? | Nomor arsip per SOP perusahaan |
| nomorBerkas | String | Nomor berkas wajib diisi |
| kodeKlasifikasiId | String FK | FK ke kode_klasifikasi |
| uraianInformasi | Text? | Deskripsi isi arsip |
| tahun | Int | Tahun terbit arsip |
| tingkatPerkembangan | Enum | ASLI / SALINAN |
| kondisiFisik | Enum | BAIK / RUSAK / LENGKAP / TIDAK_LENGKAP |
| jumlahBerkas | Int | Default: 1 |
| status | Enum | AKTIF / INAKTIF / USUL_MUSNAH / MUSNAH / PERMANEN |
| unitKerjaId | String FK | FK ke unit_kerja |
| tanggalAktifBerakhir | DateTime? | Pre-computed: kapan jadi inaktif |
| tanggalInaktifBerakhir | DateTime? | Pre-computed: kapan siap musnah (null=PERMANEN) |
| fileDigitalKey | String? | Key file di MinIO |
| fileMimeType | String? | MIME type file |
| fileUkuranBytes | Int? | Ukuran file |
| catatan | Text? | Catatan tambahan |
| createdById | String FK | FK ke users (pembuat) |
| updatedById | String? FK | FK ke users (pengupdate terakhir) |

### 5.5 `lokasi_simpan`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (CUID) | PK |
| arsipId | String UNIQUE FK | FK ke arsip (one-to-one) |
| nomorLaci | String? | Lokasi di unit kerja (arsip aktif) |
| nomorRak | String? | Lokasi di record center (arsip inaktif) |
| nomorBoks | String? | Lokasi di record center |
| nomorFolder | String? | Nomor folder |
| keterangan | Text? | Catatan lokasi |
| updatedBySetumId | String? | Setum yang terakhir update |

### 5.6 `usul_musnah`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (CUID) | PK |
| arsipId | String FK | FK ke arsip |
| fileNotaDinasKey | String? | Key file nota dinas di MinIO |
| uraianSingkat | Text? | Alasan pengajuan pemusnahan |
| masaSimpan | Int | Masa simpan dalam bulan |
| statusApproval | Enum | PENDING / DISETUJUI / DITOLAK (Tahap 1) |
| approvedOlehId | String? FK | Kadiv/Kabid yang approve |
| penilaianApproval | Text? | Catatan dari Kadiv/Kabid |
| tanggalApproval | DateTime? | Waktu approval Tahap 1 |
| statusVerifikasiSetum | Enum | PENDING / DISETUJUI / DITOLAK (Tahap 2) |
| verifikasiSetumId | String? FK | Setum yang verifikasi |
| catatanSetum | Text? | Catatan dari Setum |
| tanggalVerifikasi | DateTime? | Waktu verifikasi Tahap 2 |
| diajukanOlehId | String FK | User yang mengajukan |

### 5.7 `perpanjangan_retensi`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (CUID) | PK |
| arsipId | String FK | FK ke arsip |
| durasiPerpanjanganBulan | Int | Berapa bulan diperpanjang |
| alasanPerpanjangan | Text | Wajib diisi |
| status | Enum | PENDING / DISETUJUI / DITOLAK |
| approvedOlehId | String? FK | User Setum yang approve |
| catatanApproval | Text? | Catatan dari approver |
| tanggalInaktifBaruBerakhir | DateTime? | Dikalkulasi saat disetujui |
| diajukanOlehId | String FK | User yang mengajukan |

### 5.8 `audit_log`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (CUID) | PK |
| userId | String FK | FK ke users |
| action | String | CREATE / UPDATE / DELETE / APPROVE / REJECT / VERIFY / DOWNLOAD / LOGIN / LOGOUT |
| entityType | String | Arsip / UsulMusnah / PerpanjanganRetensi / dll |
| entityId | String | ID entity yang terdampak |
| oldValue | Json? | State sebelum perubahan |
| newValue | Json? | State sesudah perubahan |
| ipAddress | String? | IP address client |
| userAgent | String? | Browser/device info |
| createdAt | DateTime | Timestamp (append-only, tidak ada updatedAt) |

### 5.9 `notifikasi`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | String (CUID) | PK |
| userId | String FK | FK ke users (penerima) |
| jenis | Enum | Jenis notifikasi |
| judul | String | Judul notifikasi (singkat) |
| pesan | Text | Isi pesan lengkap |
| isRead | Boolean | Default: false |
| entityType | String? | Tipe entity terkait (deep link) |
| entityId | String? | ID entity terkait (deep link) |

---

## 6. Index Strategy

```
Index dirancang berdasarkan query patterns dari BRS:

QUERY PATTERN                          → INDEX YANG DIBUTUHKAN
─────────────────────────────────────────────────────────────────────
"Tampilkan arsip aktif unit kerja X"  → (status, unitKerjaId)
"Cari arsip by kode klasifikasi"      → (kodeKlasifikasiId)
"Arsip yang akan inaktif bulan depan" → (status, tanggalAktifBerakhir)
"Arsip inaktif siap dimusnahkan"      → (tanggalInaktifBerakhir)
"Usul musnah pending approval"        → (statusApproval)
"Usul musnah pending verifikasi Setum"→ (statusApproval, statusVerifikasiSetum)
"Notifikasi belum dibaca user X"      → (userId, isRead)
"Audit log entity tertentu"           → (entityType, entityId)
```

---

## 7. Seed Data Structure

```typescript
// packages/database/prisma/seed/kode-klasifikasi.ts
// Total: 200+ entri dari BRS halaman 9–58

export const kodeKlasifikasiData = [
  // ── 1. PR — PERENCANAAN STRATEGIS ──────────────────────────────────────
  {
    kode: "PR",
    noUrut: 1,
    kategori: "PERENCANAAN STRATEGIS",
    subKategori: null,
    jenisArsip: "PERENCANAAN STRATEGIS",
    komponenDokumen: null,
    retensiAktifBulan: 0,
    retensiInaktifBulan: 0,
    keterangan: "MUSNAH",
    catatanRetensiAktif: null,
    catatanRetensiInaktif: null,
  },
  {
    kode: "PR.01",
    noUrut: 1,
    kategori: "PERENCANAAN STRATEGIS",
    subKategori: "Rencana Jangka Panjang Perusahaan (RJPP)",
    jenisArsip: "Rencana Jangka Panjang Perusahaan (RJPP)",
    komponenDokumen: null,
    retensiAktifBulan: 0,
    retensiInaktifBulan: 0,
    keterangan: "PERMANEN",
    catatanRetensiAktif: null,
    catatanRetensiInaktif: null,
  },
  {
    kode: "PR.01.01",
    noUrut: 1,
    kategori: "PERENCANAAN STRATEGIS",
    subKategori: "Rencana Jangka Panjang Perusahaan (RJPP)",
    jenisArsip: "Penyusunan RJPP",
    komponenDokumen: null,
    retensiAktifBulan: 24,   // 2 Tahun Setelah Diperbarui
    retensiInaktifBulan: 60, // 5 Tahun
    keterangan: "PERMANEN",
    catatanRetensiAktif: "2 Tahun Setelah Diperbarui",
    catatanRetensiInaktif: "5 Tahun",
  },
  {
    kode: "PR.01.02",
    noUrut: 1,
    kategori: "PERENCANAAN STRATEGIS",
    subKategori: "Rencana Jangka Panjang Perusahaan (RJPP)",
    jenisArsip: "Revisi RJPP",
    komponenDokumen: null,
    retensiAktifBulan: 24,   // 2 Tahun Setelah Diperbarui
    retensiInaktifBulan: 60, // 5 Tahun
    keterangan: "PERMANEN",
    catatanRetensiAktif: "2 Tahun Setelah Diperbarui",
    catatanRetensiInaktif: "5 Tahun",
  },
  // ... (200+ entri mengikuti pola yang sama dari BRS halaman 9–58)
  // Semua kode dari PR, MN, MB, HK, PH, MR, AI, TU, HM, SL, TI, BJ, AS, RT, SM, AK, KU, KM

  // ── 8. TU — TATA USAHA ─────────────────────────────────────────────────
  {
    kode: "TU.07.01",
    noUrut: 8,
    kategori: "TATA USAHA",
    subKategori: "Pelaksanaan Rapat",
    jenisArsip: "Rapat Umum Pemegang Saham",
    komponenDokumen: "Undangan Rapat, Bahan Paparan RUPS, Daftar Hadir RUPS, Risalah RUPS",
    retensiAktifBulan: 24,
    retensiInaktifBulan: 48,
    keterangan: "PERMANEN",
    catatanRetensiAktif: "2 Tahun",
    catatanRetensiInaktif: "4 Tahun",
  },
  // ...
];

// packages/database/prisma/seed/unit-kerja.ts
export const unitKerjaData = [
  // Level 1 — Divisi
  { kode: "DIV-SEKPER", nama: "Sekretariat Perusahaan", level: 1, parentId: null },
  { kode: "DIV-SI", nama: "Divisi Sistem Informasi", level: 1, parentId: null },
  // Level 2 — Bidang (parentId mengacu ke Divisi)
  { kode: "BID-SETUM", nama: "Bidang Sekretariat Umum", level: 2, parentId: "DIV-SEKPER" },
  // ... lengkap sesuai struktur organisasi ASABRI
];
```

---

## 8. Migration Strategy

```bash
# Development: generate migration dari schema changes
npx prisma migrate dev --name "nama_migrasi"

# Production: apply pending migrations
npx prisma migrate deploy

# Reset database development (HATI-HATI — menghapus semua data)
npx prisma migrate reset

# Seed data master setelah migration
npx prisma db seed

# Inspect schema di browser
npx prisma studio
```

### Naming Convention Migration Files
```
migrations/
├── 20250123000001_init_schema/
│   └── migration.sql
├── 20250123000002_add_unit_kerja/
│   └── migration.sql
├── 20250123000003_add_kode_klasifikasi/
│   └── migration.sql
└── 20250123000004_add_arsip_core/
    └── migration.sql
```

---

## 9. Query Patterns Utama

```typescript
// ── 1. Ambil arsip aktif milik unit kerja dengan pagination ──────────────
const arsipAktif = await prisma.arsip.findMany({
  where: {
    unitKerjaId: userUnitKerjaId,
    status: 'AKTIF',
  },
  include: {
    kodeKlasifikasi: true,
    lokasiSimpan: true,
    createdBy: { select: { nama: true } },
  },
  orderBy: { createdAt: 'desc' },
  skip: (page - 1) * limit,
  take: limit,
});

// ── 2. Cron job: Arsip yang hari ini masuk masa retensi ──────────────────
const today = new Date();
const arsipBaruInaktif = await prisma.arsip.findMany({
  where: {
    status: 'AKTIF',
    tanggalAktifBerakhir: { lte: today },
  },
});

// ── 3. Dashboard: Jumlah arsip per status per unit kerja ─────────────────
const summary = await prisma.arsip.groupBy({
  by: ['status', 'unitKerjaId'],
  _count: { id: true },
});

// ── 4. Arsip inaktif mendekati musnah (H-30) ─────────────────────────────
const thirtyDaysFromNow = addDays(new Date(), 30);
const arsipMendekatiMusnah = await prisma.arsip.findMany({
  where: {
    status: 'INAKTIF',
    tanggalInaktifBerakhir: {
      gte: new Date(),
      lte: thirtyDaysFromNow,
    },
  },
  include: { unitKerja: true, kodeKlasifikasi: true },
});

// ── 5. Usul musnah pending (untuk dashboard Setum) ───────────────────────
const usulPending = await prisma.usulMusnah.findMany({
  where: {
    statusApproval: 'DISETUJUI',      // Sudah lolos Tahap 1
    statusVerifikasiSetum: 'PENDING', // Belum diverifikasi Setum
  },
  include: {
    arsip: {
      include: { unitKerja: true, kodeKlasifikasi: true }
    },
    diajukanOleh: { select: { nama: true } },
  },
  orderBy: { createdAt: 'asc' }, // FIFO
});

// ── 6. Full-text search arsip ─────────────────────────────────────────────
const searchResult = await prisma.arsip.findMany({
  where: {
    OR: [
      { nomorBerkas: { contains: keyword, mode: 'insensitive' } },
      { uraianInformasi: { contains: keyword, mode: 'insensitive' } },
      { kodeKlasifikasi: { jenisArsip: { contains: keyword, mode: 'insensitive' } } },
    ],
  },
  include: { kodeKlasifikasi: true, unitKerja: true },
});
```
