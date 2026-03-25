# MODUL APLIKASI
# DRMS PT ASABRI (Persero)
# Dokumen: Spesifikasi Lengkap Semua Modul Backend (NestJS) & Frontend (Next.js)

---

## DAFTAR ISI

1.  [Peta Modul](#1-peta-modul)
2.  [Modul Auth](#2-modul-auth)
3.  [Modul Users](#3-modul-users)
4.  [Modul Master](#4-modul-master)
5.  [Modul Arsip](#5-modul-arsip)
6.  [Modul Lokasi Simpan](#6-modul-lokasi-simpan)
7.  [Modul Retensi](#7-modul-retensi)
8.  [Modul Usul Musnah](#8-modul-usul-musnah)
9.  [Modul Perpanjangan Retensi](#9-modul-perpanjangan-retensi)
10. [Modul Storage](#10-modul-storage)
11. [Modul Notifikasi](#11-modul-notifikasi)
12. [Modul Dashboard](#12-modul-dashboard)
13. [Modul Audit Log](#13-modul-audit-log)
14. [Halaman Frontend](#14-halaman-frontend)
15. [Matriks Hak Akses Per Modul](#15-matriks-hak-akses-per-modul)

---

## 1. Peta Modul

```
BACKEND MODULES (NestJS)
────────────────────────────────────────────────────────────────────────
 ┌──────────────────────────────────────────────────────────────────┐
 │  CORE FOUNDATION                                                 │
 │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
 │  │   PrismaDB  │  │   Config    │  │    Cache    │             │
 │  │  (Global)   │  │  (Global)   │  │   Redis     │             │
 │  └─────────────┘  └─────────────┘  └─────────────┘             │
 └──────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────────┐
 │  AUTENTIKASI & OTORISASI                                         │
 │  ┌─────────────┐  ┌─────────────┐                               │
 │  │    Auth     │  │    Users    │                               │
 │  │ LDAP + JWT  │  │  Sync AD   │                               │
 │  └─────────────┘  └─────────────┘                               │
 └──────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────────┐
 │  DATA MASTER                                                     │
 │  ┌──────────────────────────────────────────────────────────┐   │
 │  │   Master (KodeKlasifikasi + UnitKerja) — Read-mostly    │   │
 │  └──────────────────────────────────────────────────────────┘   │
 └──────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────────┐
 │  DOMAIN BISNIS UTAMA                                             │
 │                                                                  │
 │  ┌───────────┐                                                   │
 │  │   Arsip   │ ← MODUL PUSAT                                    │
 │  └─────┬─────┘                                                   │
 │        │                                                         │
 │    ┌───┴──────────────────────────────────────────────────┐     │
 │    │                                                       │     │
 │    ▼                   ▼                    ▼              │     │
 │ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │     │
 │ │ LokasiSimpan │  │   Retensi   │  │UsulMusnah    │      │     │
 │ │ (Setum only) │  │ + Scheduler │  │+ Perpanjangan│      │     │
 │ └──────────────┘  └──────────────┘  └──────────────┘      │     │
 │                                                             │     │
 └─────────────────────────────────────────────────────────────┘     │
 └──────────────────────────────────────────────────────────────────┘

 ┌──────────────────────────────────────────────────────────────────┐
 │  INFRASTRUKTUR & PENDUKUNG                                       │
 │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌─────────────┐  │
 │  │  Storage  │  │Notifikasi │  │ Dashboard │  │  AuditLog   │  │
 │  │  (MinIO)  │  │ (In-app)  │  │ (Aggregat)│  │ (Intercept) │  │
 │  └───────────┘  └───────────┘  └───────────┘  └─────────────┘  │
 └──────────────────────────────────────────────────────────────────┘

DEPENDENSI ANTAR MODUL
──────────────────────
Auth          → Users, PrismaService
Users         → PrismaService
Arsip         → PrismaService, Storage, Notifikasi, Retensi
Retensi       → PrismaService, Notifikasi  [+Scheduler]
LokasiSimpan  → PrismaService
UsulMusnah    → PrismaService, Notifikasi, AuditLog
Perpanjangan  → PrismaService, Notifikasi, AuditLog
Storage       → MinIO SDK
Notifikasi    → PrismaService
Dashboard     → PrismaService, CacheManager
AuditLog      → PrismaService
Master        → PrismaService, CacheManager
```

---

## 2. Modul Auth

**Lokasi:** `apps/api/src/modules/auth/`
**Tujuan:** Autentikasi user via LDAP/Active Directory dan penerbitan JWT untuk session.

### Endpoints

| Method | Path | Deskripsi | Auth |
|---|---|---|---|
| POST | `/api/auth/login` | Login dengan username & password AD | ❌ Public |
| POST | `/api/auth/logout` | Invalidate session (client-side) | ✅ JWT |
| GET | `/api/auth/me` | Data user yang sedang login | ✅ JWT |
| POST | `/api/auth/refresh` | Refresh JWT token | ✅ JWT |

### Request & Response

```
POST /api/auth/login
Body: { username: "nip12345", password: "***" }

Response 200:
{
  success: true,
  data: {
    accessToken: "eyJhbGci...",
    user: {
      id: "clx...",
      nama: "Budi Santoso",
      email: "budi@asabri.co.id",
      role: "USER",
      unitKerja: { id: "...", kode: "DIV-SI", nama: "Divisi Sistem Informasi" }
    }
  }
}

Response 401: Username atau password salah
Response 403: Akun dinonaktifkan
```

### Alur Login

```
Client → POST /auth/login
  → AuthService.login()
    → verifyLdap() — bind ke AD server, cari user, verify password
    → Jika sukses: prisma.user.upsert() — sync data ke DB lokal
    → jwtService.sign({ sub, username, role, unitKerjaId })
  → Return { accessToken, user }
```

### Guards yang Tersedia

| Guard | Deskripsi | Cara Pakai |
|---|---|---|
| `JwtAuthGuard` | Verifikasi JWT token pada setiap request | `@UseGuards(JwtAuthGuard)` |
| `RolesGuard` | Cek role user sesuai decorator `@Roles()` | Selalu berpasangan dengan JwtAuthGuard |

### JWT Payload

```typescript
interface JwtPayload {
  sub: string;         // user.id (primary key DB)
  username: string;    // adUsername dari Active Directory
  role: Role;          // USER | USER_APPROVAL | USER_SETUM
  unitKerjaId: string; // ID unit kerja user
  iat: number;         // Issued at (auto)
  exp: number;         // Expiry (auto, sesuai JWT_EXPIRY di .env)
}
```

---

## 3. Modul Users

**Lokasi:** `apps/api/src/modules/users/`
**Tujuan:** Manajemen data user yang tersimpan lokal (sync dari AD), termasuk assignment role dan unit kerja.

### Endpoints

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| GET | `/api/users` | Daftar semua user (dengan pagination & filter) | SETUM |
| GET | `/api/users/:id` | Detail user | SETUM |
| PATCH | `/api/users/:id/role` | Ubah role user | SETUM |
| PATCH | `/api/users/:id/unit-kerja` | Pindahkan user ke unit kerja lain | SETUM |
| PATCH | `/api/users/:id/deactivate` | Nonaktifkan user | SETUM |
| PATCH | `/api/users/:id/activate` | Aktifkan kembali user | SETUM |

### Business Rules

- Role awal user setelah login pertama kali selalu `USER`
- Hanya `USER_SETUM` yang bisa mengubah role dan unit kerja
- User tidak bisa menonaktifkan dirinya sendiri
- User yang dinonaktifkan tidak bisa login (meski AD account masih aktif)
- `adUsername` bersifat immutable — tidak bisa diubah setelah dibuat

---

## 4. Modul Master

**Lokasi:** `apps/api/src/modules/master/`
**Tujuan:** Menyediakan data referensi (kode klasifikasi dan unit kerja) yang digunakan di seluruh sistem. Data ini di-seed dari BRS dan jarang berubah.

### Endpoints

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| GET | `/api/master/kode-klasifikasi` | Daftar semua kode klasifikasi | ALL |
| GET | `/api/master/kode-klasifikasi/:id` | Detail satu kode klasifikasi | ALL |
| GET | `/api/master/kode-klasifikasi/search` | Cari kode klasifikasi (autocomplete) | ALL |
| GET | `/api/master/unit-kerja` | Daftar semua unit kerja (tree) | ALL |
| GET | `/api/master/unit-kerja/:id` | Detail unit kerja | ALL |
| POST | `/api/master/kode-klasifikasi` | Tambah kode klasifikasi baru | SETUM |
| PATCH | `/api/master/kode-klasifikasi/:id` | Update kode klasifikasi | SETUM |

### Caching Strategy

```
Semua endpoint GET di Master di-cache Redis selama 1 jam.
Cache di-invalidate otomatis ketika ada POST/PATCH.

Cache keys:
  "master:kode-klasifikasi:all"
  "master:kode-klasifikasi:search:{query}"
  "master:unit-kerja:all"
  "master:unit-kerja:tree"
```

### Response: GET `/api/master/kode-klasifikasi/search?q=perencanaan`

```json
{
  "success": true,
  "data": [
    {
      "id": "clx...",
      "kode": "PR.01.01",
      "kategori": "PERENCANAAN STRATEGIS",
      "jenisArsip": "Penyusunan RJPP",
      "retensiAktifBulan": 24,
      "retensiInaktifBulan": 60,
      "keterangan": "PERMANEN",
      "catatanRetensiAktif": "2 Tahun Setelah Diperbarui"
    }
  ]
}
```

---

## 5. Modul Arsip

**Lokasi:** `apps/api/src/modules/arsip/`
**Tujuan:** CRUD lengkap arsip, termasuk kalkulasi otomatis tanggal retensi dan pengelolaan file digital.

### Endpoints

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| GET | `/api/arsip` | Daftar arsip dengan filter & pagination | ALL |
| GET | `/api/arsip/:id` | Detail arsip beserta semua relasi | ALL |
| POST | `/api/arsip` | Buat arsip baru | ALL |
| PATCH | `/api/arsip/:id` | Update arsip (hanya saat AKTIF) | OWNER / SETUM |
| DELETE | `/api/arsip/:id` | Hapus arsip (soft-delete) | SETUM |
| GET | `/api/arsip/:id/download` | Get presigned URL download file digital | ALL |
| POST | `/api/arsip/:id/upload` | Upload file digital (digitasi) | ALL / SETUM |

### Query Parameters untuk GET `/api/arsip`

| Param | Tipe | Deskripsi |
|---|---|---|
| `status` | Enum | AKTIF / INAKTIF / USUL_MUSNAH / MUSNAH / PERMANEN |
| `unitKerjaId` | String | Filter by unit kerja (Setum bisa filter semua unit) |
| `kodeKlasifikasiId` | String | Filter by kode klasifikasi |
| `tahun` | Int | Filter by tahun arsip |
| `search` | String | Full-text search di nomorBerkas & uraianInformasi |
| `page` | Int | Halaman (default: 1) |
| `limit` | Int | Per halaman (default: 20, max: 100) |

### Business Rules

- Saat arsip dibuat, `tanggalAktifBerakhir` dan `tanggalInaktifBerakhir` dikalkulasi otomatis
- User `USER` dan `USER_APPROVAL` hanya bisa melihat arsip unit kerjanya sendiri
- User `USER_SETUM` bisa melihat semua arsip dari semua unit kerja
- Arsip hanya bisa di-edit selama berstatus `AKTIF`
- Arsip dengan status `MUSNAH` atau `PERMANEN` bersifat read-only
- File digital yang di-upload akan disimpan ke MinIO, bukan filesystem lokal
- Penghapusan arsip bersifat soft-delete (field `deletedAt`) — data tidak benar-benar hilang

### Kalkulasi Retensi (Detail)

```
INPUT:
  tahun = 2022
  retensiAktifBulan = 24   (2 tahun)
  retensiInaktifBulan = 60 (5 tahun)
  keterangan = "MUSNAH"

KALKULASI:
  tanggalDasar           = 1 Januari 2022
  tanggalAktifBerakhir   = 1 Januari 2022 + 24 bulan = 1 Januari 2024
  tanggalInaktifBerakhir = 1 Januari 2024 + 60 bulan = 1 Januari 2029

  Cron job: setiap 23:00
  → Jika tanggal hari ini ≥ tanggalAktifBerakhir → status: AKTIF → INAKTIF
  → Jika tanggal hari ini ≥ tanggalInaktifBerakhir → trigger notifikasi pemusnahan

KASUS KHUSUS:
  retensiAktifBulan = -1 (kondisional)
  → tanggalAktifBerakhir = null
  → tanggalInaktifBerakhir = null
  → Sistem tidak bisa otomatis, Setum harus update manual

  keterangan = "PERMANEN"
  → tanggalInaktifBerakhir = null (tidak pernah dimusnahkan)
  → Arsip berakhir sebagai status PERMANEN setelah masa inaktif
```

---

## 6. Modul Lokasi Simpan

**Lokasi:** `apps/api/src/modules/lokasi-simpan/`
**Tujuan:** Input dan update lokasi fisik arsip di unit kerja atau record center. Hanya bisa dioperasikan oleh User Setum.

### Endpoints

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| GET | `/api/lokasi-simpan/:arsipId` | Lihat lokasi simpan arsip | ALL |
| POST | `/api/lokasi-simpan` | Buat/set lokasi simpan baru | SETUM |
| PATCH | `/api/lokasi-simpan/:id` | Update lokasi simpan | SETUM |

### DTO

```typescript
class CreateLokasiSimpanDto {
  arsipId: string;          // FK ke arsip
  nomorLaci?: string;       // Arsip aktif di unit kerja
  nomorRak?: string;        // Arsip inaktif di record center
  nomorBoks?: string;
  nomorFolder?: string;
  keterangan?: string;
}
```

### Business Rules

- Setiap arsip hanya punya satu lokasi simpan (one-to-one)
- Lokasi dibuat kosong saat arsip pertama kali dibuat
- Setum mengisi `nomorLaci` & `nomorFolder` untuk arsip aktif
- Setum mengisi `nomorRak`, `nomorBoks`, `nomorFolder` untuk arsip inaktif di record center
- Setiap update lokasi dicatat di audit log beserta siapa Setum yang mengupdate

---

## 7. Modul Retensi

**Lokasi:** `apps/api/src/modules/retensi/`
**Tujuan:** Kalkulasi, monitoring, dan otomasi siklus hidup retensi arsip.

### Endpoints

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| GET | `/api/retensi/mendekati-aktif-berakhir` | Arsip aktif yang akan segera inaktif | SETUM |
| GET | `/api/retensi/mendekati-musnah` | Arsip inaktif yang mendekati pemusnahan | SETUM |
| PATCH | `/api/retensi/:arsipId/set-tanggal` | Set tanggal retensi manual (kondisional) | SETUM |

### Scheduler (Cron Job)

```
Schedule: Setiap hari pukul 23:00 WIB
Konfigurasi: CRON_RETENSI_SCHEDULE="0 23 * * *"

Urutan eksekusi:
  1. updateAktifKeInaktif()
     → Cari arsip: status=AKTIF, tanggalAktifBerakhir <= hari ini
     → updateMany status → INAKTIF
     → Log jumlah arsip yang diubah

  2. tandaiPermanen()
     → Cari arsip: status=INAKTIF, tanggalInaktifBerakhir=null,
                   kodeKlasifikasi.keterangan=PERMANEN
     → Jika belum ada usul musnah aktif → updateMany status → PERMANEN

  3. kirimNotifikasiH30AktifBerakhir()
     → Cari arsip: status=AKTIF, tanggalAktifBerakhir antara
                   hari ini dan H+30
     → Buat notifikasi untuk setiap user di unit kerja terkait
     → Skip jika notifikasi untuk arsip+user tersebut sudah ada hari ini

  4. kirimNotifikasiH30InaktifBerakhir()
     → Cari arsip: status=INAKTIF, tanggalInaktifBerakhir antara
                   hari ini dan H+30
     → Buat notifikasi untuk semua User Setum
```

### Business Rules

- Transisi status `AKTIF → INAKTIF` dilakukan oleh cron job, bukan manual
- Setum bisa set tanggal retensi manual untuk arsip kondisional (`retensiAktifBulan = -1`)
- Notifikasi H-30 hanya dikirim sekali per arsip per hari (cek duplikasi sebelum insert)

---

## 8. Modul Usul Musnah

**Lokasi:** `apps/api/src/modules/usul-musnah/`
**Tujuan:** Workflow pengajuan dan persetujuan pemusnahan arsip yang sudah melewati masa retensi inaktif. Dua tahap approval bertingkat.

### Endpoints

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| GET | `/api/usul-musnah` | Daftar usul musnah (filter by status) | ALL |
| GET | `/api/usul-musnah/:id` | Detail usul musnah + timeline | ALL |
| POST | `/api/usul-musnah` | Ajukan usul musnah | ALL |
| POST | `/api/usul-musnah/:id/approve` | Setujui (Tahap 1) | USER_APPROVAL |
| POST | `/api/usul-musnah/:id/reject` | Tolak (Tahap 1) | USER_APPROVAL |
| POST | `/api/usul-musnah/:id/verify` | Verifikasi Setum (Tahap 2 — setujui) | USER_SETUM |
| POST | `/api/usul-musnah/:id/verify-reject` | Tolak verifikasi Setum (Tahap 2) | USER_SETUM |
| POST | `/api/usul-musnah/:id/upload-nota` | Upload nota dinas | ALL |

### Alur State Machine

```
Arsip: status = INAKTIF, tanggalInaktifBerakhir terlewat

  Unit Kerja mengajukan UsulMusnah
  → Arsip.status = USUL_MUSNAH
  → UsulMusnah.statusApproval = PENDING
  → Notifikasi → semua USER_APPROVAL di unit kerja yang sama

  ┌─────────────────────────────────────────────────────────┐
  │ TAHAP 1: Kadiv / Kabid Unit Kerja                       │
  │                                                         │
  │  APPROVE → statusApproval = DISETUJUI                   │
  │            → Notifikasi → USER_SETUM                    │
  │            → Lanjut ke Tahap 2                         │
  │                                                         │
  │  REJECT  → statusApproval = DITOLAK                    │
  │            → Arsip.status = INAKTIF (dikembalikan)     │
  │            → Notifikasi → pengaju                      │
  └─────────────────────────────────────────────────────────┘

  ┌─────────────────────────────────────────────────────────┐
  │ TAHAP 2: User Setum — Verifikasi Administrasi           │
  │                                                         │
  │  VERIFY (Setujui) → statusVerifikasiSetum = DISETUJUI  │
  │                    → Arsip.status = MUSNAH             │
  │                    → fileDigitalKey di-delete dari MinIO│
  │                    → Notifikasi → pengaju              │
  │                                                         │
  │  VERIFY-REJECT    → statusVerifikasiSetum = DITOLAK    │
  │                    → Arsip.status = INAKTIF             │
  │                    → Notifikasi → pengaju              │
  └─────────────────────────────────────────────────────────┘
```

### Business Rules

- Hanya arsip dengan status `INAKTIF` yang bisa diajukan usul musnah
- Arsip dengan keterangan retensi `PERMANEN` tidak bisa diajukan usul musnah
- Satu arsip hanya bisa punya satu UsulMusnah aktif (status PENDING atau DISETUJUI)
- Jika UsulMusnah sebelumnya DITOLAK, unit kerja bisa mengajukan kembali
- Pengaju tidak bisa men-approve usulnya sendiri
- Setelah status arsip `MUSNAH`, data arsip tetap ada di DB (soft-delete) — hanya file digital yang dihapus dari MinIO
- Semua aksi approval/rejection otomatis dicatat di AuditLog

### DTO

```typescript
// Pengajuan
class CreateUsulMusnahDto {
  arsipId: string;
  uraianSingkat?: string;
  fileNotaDinasKey?: string; // Setelah upload via /storage/upload
}

// Approve Tahap 1
class ApproveUsulMusnahDto {
  penilaianApproval: string; // Wajib isi alasan/catatan
}

// Reject Tahap 1 atau 2
class RejectUsulMusnahDto {
  alasan: string; // Wajib isi alasan penolakan
}

// Verifikasi Setum (Tahap 2)
class VerifyUsulMusnahDto {
  catatanSetum?: string;
}
```

---

## 9. Modul Perpanjangan Retensi

**Lokasi:** `apps/api/src/modules/perpanjangan-retensi/`
**Tujuan:** Workflow pengajuan perpanjangan masa simpan arsip inaktif yang masih dibutuhkan melebihi jadwal standar.

### Endpoints

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| GET | `/api/perpanjangan-retensi` | Daftar pengajuan perpanjangan | ALL |
| GET | `/api/perpanjangan-retensi/:id` | Detail pengajuan | ALL |
| POST | `/api/perpanjangan-retensi` | Ajukan perpanjangan | ALL |
| POST | `/api/perpanjangan-retensi/:id/approve` | Setujui perpanjangan | USER_SETUM |
| POST | `/api/perpanjangan-retensi/:id/reject` | Tolak perpanjangan | USER_SETUM |

### Alur State Machine

```
Arsip: status = INAKTIF, tanggalInaktifBerakhir mendekati/terlewat

  Unit Kerja mengajukan PerpanjanganRetensi
  → PerpanjanganRetensi.status = PENDING
  → Notifikasi → semua USER_SETUM

  ┌─────────────────────────────────────────────────────────┐
  │ User Setum (hanya satu tahap)                           │
  │                                                         │
  │  APPROVE → status = DISETUJUI                           │
  │            → tanggalInaktifBaruBerakhir dikalkulasi:   │
  │              Arsip.tanggalInaktifBerakhir + durasi      │
  │            → Arsip.tanggalInaktifBerakhir diupdate      │
  │            → Notifikasi → pengaju                      │
  │                                                         │
  │  REJECT  → status = DITOLAK                            │
  │            → Arsip.tanggalInaktifBerakhir tidak berubah │
  │            → Proses pemusnahan dapat berjalan normal   │
  │            → Notifikasi → pengaju                      │
  └─────────────────────────────────────────────────────────┘
```

### Business Rules

- Hanya arsip dengan status `INAKTIF` yang bisa diperpanjang
- Arsip dengan status `USUL_MUSNAH` tidak bisa diajukan perpanjangan
- Satu arsip bisa mengajukan perpanjangan berkali-kali (riwayat tersimpan)
- Setum adalah single approver untuk perpanjangan (beda dengan UsulMusnah yang 2 tahap)
- Perpanjangan maks 5 tahun (60 bulan) per pengajuan — bisa diajukan lagi setelah habis

### DTO

```typescript
class CreatePerpanjanganRetensiDto {
  arsipId: string;
  durasiPerpanjanganBulan: number; // 1–60
  alasanPerpanjangan: string;      // Wajib diisi
}

class ReviewPerpanjanganDto {
  disetujui: boolean;
  catatanApproval?: string;
}
```

---

## 10. Modul Storage

**Lokasi:** `apps/api/src/modules/storage/`
**Tujuan:** Abstraksi upload, download, dan delete file digital (digitasi arsip) via MinIO S3-compatible storage.

### Endpoints

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| POST | `/api/storage/upload` | Upload file, return key | ALL |
| GET | `/api/storage/presign/:key` | Get presigned URL download (expire 1 jam) | ALL |
| DELETE | `/api/storage/delete/:key` | Hapus file | SETUM |

### Alur Upload File

```
1. Client → POST /api/storage/upload (multipart/form-data)
2. StorageService.upload(file)
   → Validasi: mime type allowed, ukuran < 50MB
   → Generate key: "arsip/{tahun}/{kode}/{uuid}.{ext}"
   → Upload ke MinIO bucket
   → Return: { key: "arsip/2024/PR.01.01/abc123.pdf", size, mimeType }
3. Client simpan key tersebut ke dalam dto CreateArsip atau UpdateArsip
4. Arsip tersimpan dengan fileDigitalKey = key dari storage
```

### Alur Download File

```
1. Client → GET /api/storage/presign/{key}
2. StorageService.getPresignedUrl(key)
   → MinIO.presignedGetObject(bucket, key, expiry=3600)
   → Return: { url: "http://minio/drms-arsip/arsip/...?X-Amz-Signature=..." }
3. Client redirect ke URL tersebut untuk download langsung
   → URL expire setelah 1 jam — tidak perlu backend jadi perantara
```

### Konvensi Penamaan Key

```
Format: arsip/{tahun}/{kodeKlasifikasi}/{uuid}.{ext}
Contoh: arsip/2024/PR.01.01/a1b2c3d4-e5f6-7890-abcd-ef1234567890.pdf
         arsip/2023/TU.07.01/f9e8d7c6-b5a4-3210-fedc-ba9876543210.docx
```

### Business Rules

- File di-upload SEBELUM arsip dibuat/diupdate — terpisah dari form arsip
- Jika arsip dimusnahkan (`MUSNAH`), file digital otomatis dihapus dari MinIO
- Hanya file PDF dan gambar yang diizinkan (konfigurasi di `ALLOWED_MIME_TYPES`)
- Ukuran maksimal 50 MB per file
- Key yang sudah di-upload tidak bisa di-overwrite; harus delete + upload ulang

---

## 11. Modul Notifikasi

**Lokasi:** `apps/api/src/modules/notifikasi/`
**Tujuan:** Sistem notifikasi in-app. Setiap user punya inbox notifikasi yang bisa dibaca dan di-mark sebagai sudah dibaca.

### Endpoints

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| GET | `/api/notifikasi` | Daftar notifikasi user saat ini | ALL |
| GET | `/api/notifikasi/unread-count` | Jumlah notifikasi belum dibaca | ALL |
| PATCH | `/api/notifikasi/:id/read` | Mark satu notifikasi sebagai dibaca | ALL |
| PATCH | `/api/notifikasi/read-all` | Mark semua notifikasi sebagai dibaca | ALL |

### Jenis Notifikasi & Trigger

| Jenis | Trigger | Penerima |
|---|---|---|
| `RETENSI_AKTIF_BERAKHIR` | Cron H-30 sebelum arsip jadi inaktif | Semua user di unit kerja terkait |
| `RETENSI_INAKTIF_BERAKHIR` | Cron H-30 sebelum arsip siap musnah | Semua USER_SETUM |
| `USUL_MUSNAH_BARU` | UsulMusnah dibuat | Semua USER_APPROVAL di unit kerja pengaju |
| `USUL_MUSNAH_DISETUJUI` | Tahap 1 disetujui | Pengaju + Semua USER_SETUM |
| `USUL_MUSNAH_DITOLAK` | Tahap 1 atau 2 ditolak | Pengaju |
| `VERIFIKASI_SETUM_DIBUTUHKAN` | Tahap 1 disetujui, Setum perlu aksi | Semua USER_SETUM |
| `PERPANJANGAN_DISETUJUI` | Perpanjangan disetujui Setum | Pengaju |
| `PERPANJANGAN_DITOLAK` | Perpanjangan ditolak Setum | Pengaju |

### Business Rules

- Notifikasi tidak dihapus, hanya di-mark isRead
- Paginate GET: default 20, max 100 per halaman
- `entityType` + `entityId` digunakan frontend untuk deep-link (klik notif → buka halaman terkait)
- Badge di navbar menampilkan unread count dari endpoint `/notifikasi/unread-count`

---

## 12. Modul Dashboard

**Lokasi:** `apps/api/src/modules/dashboard/`
**Tujuan:** Menyediakan data agregasi untuk halaman dashboard — statistik, chart, dan tabel ringkasan. Semua endpoint di-cache Redis.

### Endpoints

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| GET | `/api/dashboard/summary` | Ringkasan angka total arsip per status | ALL |
| GET | `/api/dashboard/chart/aktif` | Data chart arsip aktif per bulan/tahun | ALL |
| GET | `/api/dashboard/chart/inaktif` | Data chart arsip inaktif per periode | ALL |
| GET | `/api/dashboard/chart/musnah` | Data chart arsip musnah tahun berjalan | ALL |
| GET | `/api/dashboard/usul-musnah-pending` | Tabel usul musnah yang pending | ALL |
| GET | `/api/dashboard/retensi-alert` | Arsip mendekati masa retensi | ALL |

### Response: GET `/api/dashboard/summary`

```json
{
  "success": true,
  "data": {
    "totalArsipAktif": 1423,
    "totalArsipInaktif": 589,
    "totalUsulMusnahPending": 12,
    "totalArsipMusnah": 78,
    "totalArsipPermanen": 34,
    "arsipMendekatiInaktif": 45,
    "arsipMendekatiMusnah": 8
  }
}
```

### Response: GET `/api/dashboard/chart/aktif?period=monthly&tahun=2024`

```json
{
  "success": true,
  "data": [
    { "periode": "Jan 2024", "jumlah": 132 },
    { "periode": "Feb 2024", "jumlah": 145 },
    { "periode": "Mar 2024", "jumlah": 98 }
  ]
}
```

### Caching Strategy

```
Cache TTL: 5 menit (lebih pendek dari master data karena lebih dinamis)

Cache keys:
  "dashboard:summary:{userId}"          — Disesuaikan per user (unit kerja berbeda)
  "dashboard:chart:aktif:{filter}"
  "dashboard:chart:inaktif:{filter}"
  "dashboard:chart:musnah:{tahun}"
  "dashboard:usul-musnah-pending"       — Tidak per-user, sama untuk semua
  "dashboard:retensi-alert"

Cache di-invalidate saat:
  - Ada arsip baru dibuat/diupdate
  - Status arsip berubah (cron job atau approval)
```

### Business Rules

- User `USER` dan `USER_APPROVAL` hanya melihat data unit kerjanya sendiri
- User `USER_SETUM` melihat agregasi dari semua unit kerja
- Chart period bisa `monthly` (per bulan dalam satu tahun) atau `yearly` (per tahun)

---

## 13. Modul Audit Log

**Lokasi:** `apps/api/src/modules/audit-log/`
**Tujuan:** Pencatatan dan pembacaan jejak aktivitas semua user di sistem. Hanya bisa dibaca oleh User Setum.

### Endpoints

| Method | Path | Deskripsi | Role |
|---|---|---|---|
| GET | `/api/audit-log` | Daftar audit log dengan filter & pagination | SETUM |
| GET | `/api/audit-log/:entityType/:entityId` | Audit log untuk entity spesifik | SETUM |

### Query Parameters GET `/api/audit-log`

| Param | Tipe | Deskripsi |
|---|---|---|
| `userId` | String | Filter by user |
| `action` | String | CREATE / UPDATE / DELETE / APPROVE / REJECT / VERIFY / DOWNLOAD |
| `entityType` | String | Arsip / UsulMusnah / dll |
| `startDate` | Date | Filter dari tanggal |
| `endDate` | Date | Filter sampai tanggal |
| `page` | Int | Default: 1 |
| `limit` | Int | Default: 50 |

### Automatic Logging

```
AuditLogInterceptor (Global Interceptor) otomatis mencatat:

Method POST   → action: CREATE (atau APPROVE jika URL mengandung "approve")
Method PATCH  → action: UPDATE (atau REJECT jika URL mengandung "reject")
Method DELETE → action: DELETE

Entity yang dicatat:
  - POST/PATCH/DELETE /arsip                → entityType: "Arsip"
  - POST/PATCH /usul-musnah                 → entityType: "UsulMusnah"
  - POST/PATCH /perpanjangan-retensi        → entityType: "PerpanjanganRetensi"
  - PATCH /lokasi-simpan                   → entityType: "LokasiSimpan"
  - PATCH /users                           → entityType: "User"

Data yang dicatat:
  - userId: dari JWT payload
  - action: berdasarkan HTTP method + URL pattern
  - entityType & entityId: parse dari URL & response data
  - newValue: data dari response body
  - ipAddress: dari request headers
  - userAgent: dari request headers
```

### Business Rules

- Tabel audit_log bersifat append-only — tidak ada endpoint untuk update atau delete
- `oldValue` hanya tersedia untuk UPDATE action (perlu fetch data sebelum update)
- Audit log tidak di-cache (selalu fresh dari DB)
- Retention audit log: tidak ada batas — disimpan selamanya sesuai regulasi kearsipan

---

## 14. Halaman Frontend

**Lokasi:** `apps/web/src/app/`
**Tujuan:** Referensi halaman, komponen yang digunakan, dan hak akses per halaman.

### Daftar Halaman

| Route | Komponen Utama | Role | Deskripsi |
|---|---|---|---|
| `/login` | `LoginForm` | PUBLIC | Form login username + password AD |
| `/` | `Dashboard` | ALL | Infografis: chart + summary + tabel usul musnah |
| `/arsip/aktif` | `ArsipTable` + `FilterPanel` | ALL | Daftar arsip aktif dengan filter |
| `/arsip/aktif/create` | `ArsipForm` | ALL | Form input arsip baru |
| `/arsip/aktif/[id]` | `ArsipDetail` | ALL | Detail arsip aktif |
| `/arsip/aktif/[id]/edit` | `ArsipForm` | OWNER/SETUM | Edit arsip |
| `/arsip/inaktif` | `ArsipTable` | ALL | Daftar arsip inaktif |
| `/arsip/inaktif/[id]` | `ArsipDetail` + `LokasiSimpanForm` | ALL | Detail + lokasi simpan |
| `/arsip/inaktif/pindah` | Form Pemindahan | SETUM | Input lokasi fisik record center |
| `/arsip/musnah` | `ArsipTable` (read-only) | ALL | Riwayat arsip musnah |
| `/arsip/musnah/[id]` | `ArsipDetail` + Timeline | ALL | Detail + timeline pemusnahan |
| `/usul-musnah` | `UsulMusnahTable` | ALL | Daftar usul musnah |
| `/usul-musnah/create` | `UsulMusnahForm` | ALL | Ajukan usul musnah baru |
| `/usul-musnah/[id]` | Detail + `ApprovalTimeline` | ALL | Detail usul musnah |
| `/usul-musnah/[id]/review` | `ApprovalActions` | APPROVAL/SETUM | Form review + approve/reject |
| `/perpanjangan` | Tabel Perpanjangan | ALL | Daftar pengajuan perpanjangan |
| `/perpanjangan/create` | `PerpanjanganForm` | ALL | Ajukan perpanjangan retensi |
| `/perpanjangan/[id]` | Detail + Timeline | ALL | Detail pengajuan |
| `/perpanjangan/[id]/review` | `ApprovalActions` | SETUM | Review perpanjangan |
| `/monitoring` | Monitoring Overview | SETUM | Dashboard monitoring semua arsip |
| `/monitoring/retensi` | RetensiMonitor | SETUM | Arsip mendekati masa retensi |
| `/monitoring/lokasi` | LokasiMonitor | SETUM | Monitor & update lokasi simpan |
| `/notifikasi` | NotifikasiList | ALL | Semua notifikasi user |
| `/audit-log` | AuditLogTable | SETUM | Audit trail seluruh sistem |
| `/profil` | ProfilUser | ALL | Profil user yang sedang login |

### Aturan Visibilitas Menu Sidebar

```typescript
const menuItems = [
  {
    label: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    roles: ['USER', 'USER_APPROVAL', 'USER_SETUM'],
  },
  {
    label: 'Arsip Aktif',
    href: '/arsip/aktif',
    icon: FolderOpen,
    roles: ['USER', 'USER_APPROVAL', 'USER_SETUM'],
  },
  {
    label: 'Arsip Inaktif',
    href: '/arsip/inaktif',
    icon: Archive,
    roles: ['USER', 'USER_APPROVAL', 'USER_SETUM'],
  },
  {
    label: 'Usul Musnah',
    href: '/usul-musnah',
    icon: Trash2,
    roles: ['USER', 'USER_APPROVAL', 'USER_SETUM'],
  },
  {
    label: 'Perpanjangan Retensi',
    href: '/perpanjangan',
    icon: CalendarClock,
    roles: ['USER', 'USER_APPROVAL', 'USER_SETUM'],
  },
  {
    label: 'Monitoring',
    href: '/monitoring',
    icon: BarChart3,
    roles: ['USER_SETUM'], // Hanya Setum
  },
  {
    label: 'Audit Log',
    href: '/audit-log',
    icon: ClipboardList,
    roles: ['USER_SETUM'], // Hanya Setum
  },
];
```

---

## 15. Matriks Hak Akses Per Modul

```
KETERANGAN:
  ✅ = Akses penuh
  👁 = Hanya bisa lihat (read-only)
  🏠 = Hanya unit kerja sendiri
  ❌ = Tidak ada akses

╔══════════════════════════════╦═══════════════╦═════════════════╦═════════════════╗
║ FITUR / AKSI                 ║ USER          ║ USER_APPROVAL   ║ USER_SETUM      ║
╠══════════════════════════════╬═══════════════╬═════════════════╬═════════════════╣
║ LOGIN                        ║ ✅            ║ ✅              ║ ✅              ║
║ DASHBOARD — lihat summary    ║ ✅ (unit sdr) ║ ✅ (unit sdr)   ║ ✅ (semua unit) ║
╠══════════════════════════════╬═══════════════╬═════════════════╬═════════════════╣
║ ARSIP — buat baru            ║ ✅ 🏠         ║ ✅ 🏠           ║ ✅              ║
║ ARSIP — lihat list           ║ ✅ 🏠         ║ ✅ 🏠           ║ ✅ (semua)      ║
║ ARSIP — lihat detail         ║ ✅ 🏠         ║ ✅ 🏠           ║ ✅ (semua)      ║
║ ARSIP — edit (hanya AKTIF)   ║ ✅ 🏠         ║ ✅ 🏠           ║ ✅              ║
║ ARSIP — upload file digital  ║ ✅ 🏠         ║ ✅ 🏠           ║ ✅              ║
║ ARSIP — download file        ║ ✅ 🏠         ║ ✅ 🏠           ║ ✅              ║
║ ARSIP — hapus (soft-delete)  ║ ❌            ║ ❌              ║ ✅              ║
╠══════════════════════════════╬═══════════════╬═════════════════╬═════════════════╣
║ LOKASI SIMPAN — lihat        ║ ✅ 🏠         ║ ✅ 🏠           ║ ✅              ║
║ LOKASI SIMPAN — set/update   ║ ❌            ║ ❌              ║ ✅              ║
╠══════════════════════════════╬═══════════════╬═════════════════╬═════════════════╣
║ USUL MUSNAH — ajukan         ║ ✅ 🏠         ║ ✅ 🏠           ║ ✅              ║
║ USUL MUSNAH — lihat list     ║ ✅ 🏠         ║ ✅ 🏠           ║ ✅ (semua)      ║
║ USUL MUSNAH — approve Tah.1  ║ ❌            ║ ✅ 🏠           ║ ❌              ║
║ USUL MUSNAH — reject Tah.1   ║ ❌            ║ ✅ 🏠           ║ ❌              ║
║ USUL MUSNAH — verif Tah.2   ║ ❌            ║ ❌              ║ ✅              ║
║ USUL MUSNAH — tolak Tah.2   ║ ❌            ║ ❌              ║ ✅              ║
╠══════════════════════════════╬═══════════════╬═════════════════╬═════════════════╣
║ PERPANJANGAN — ajukan        ║ ✅ 🏠         ║ ✅ 🏠           ║ ✅              ║
║ PERPANJANGAN — lihat list    ║ ✅ 🏠         ║ ✅ 🏠           ║ ✅ (semua)      ║
║ PERPANJANGAN — approve       ║ ❌            ║ ❌              ║ ✅              ║
║ PERPANJANGAN — reject        ║ ❌            ║ ❌              ║ ✅              ║
╠══════════════════════════════╬═══════════════╬═════════════════╬═════════════════╣
║ MONITORING — lihat           ║ ❌            ║ ❌              ║ ✅              ║
║ AUDIT LOG — lihat            ║ ❌            ║ ❌              ║ ✅              ║
╠══════════════════════════════╬═══════════════╬═════════════════╬═════════════════╣
║ USERS — lihat list           ║ ❌            ║ ❌              ║ ✅              ║
║ USERS — ubah role            ║ ❌            ║ ❌              ║ ✅              ║
║ USERS — ubah unit kerja      ║ ❌            ║ ❌              ║ ✅              ║
║ USERS — nonaktifkan          ║ ❌            ║ ❌              ║ ✅              ║
╠══════════════════════════════╬═══════════════╬═════════════════╬═════════════════╣
║ MASTER — lihat kode klas.    ║ ✅            ║ ✅              ║ ✅              ║
║ MASTER — tambah/edit kode    ║ ❌            ║ ❌              ║ ✅              ║
║ NOTIFIKASI — lihat inbox     ║ ✅ (milik sdr)║ ✅ (milik sdr)  ║ ✅ (milik sdr)  ║
╚══════════════════════════════╩═══════════════╩═════════════════╩═════════════════╝
```

---

## Ringkasan Jumlah Modul

| # | Modul | Jenis | File Utama |
|---|---|---|---|
| 1 | Auth | Feature Module | auth.module, auth.service, auth.controller, strategies/, guards/ |
| 2 | Users | Feature Module | users.module, users.service, users.controller |
| 3 | Master | Feature Module | master.module, master.service, master.controller |
| 4 | Arsip | Feature Module (Core) | arsip.module, arsip.service, arsip.controller, dto/ |
| 5 | Lokasi Simpan | Feature Module | lokasi-simpan.module, lokasi-simpan.service, lokasi-simpan.controller |
| 6 | Retensi | Feature Module + Scheduler | retensi.module, retensi.service, retensi.controller, retensi.scheduler |
| 7 | Usul Musnah | Feature Module | usul-musnah.module, usul-musnah.service, usul-musnah.controller, dto/ |
| 8 | Perpanjangan Retensi | Feature Module | perpanjangan-retensi.module, perpanjangan-retensi.service, perpanjangan-retensi.controller |
| 9 | Storage | Service Module | storage.module, storage.service, storage.controller |
| 10 | Notifikasi | Feature Module | notifikasi.module, notifikasi.service, notifikasi.controller |
| 11 | Dashboard | Feature Module | dashboard.module, dashboard.service, dashboard.controller |
| 12 | Audit Log | Feature Module | audit-log.module, audit-log.service, audit-log.controller |
| 13 | Prisma | Global Module | prisma.module, prisma.service |
| **Total** | **13 modul backend** | | |
