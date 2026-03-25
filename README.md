# DRMS — Document Retention Management System

> **Sistem Manajemen Retensi Dokumen** untuk PT ASABRI (Persero).  
> Mengelola siklus hidup arsip dari pencatatan, penyimpanan, retensi, hingga pemusnahan sesuai Jadwal Retensi Arsip (JRA).

---

## 📋 Daftar Isi

- [Arsitektur](#-arsitektur)
- [Tech Stack](#-tech-stack)
- [Fitur](#-fitur)
- [Prasyarat](#-prasyarat)
- [Instalasi & Setup](#-instalasi--setup)
- [Menjalankan Development Server](#-menjalankan-development-server)
- [Environment Variables](#-environment-variables)
- [Struktur Proyek](#-struktur-proyek)
- [Database Schema](#-database-schema)
- [API Modules](#-api-modules)
- [Scripts](#-scripts)

---

## 🏗 Arsitektur

```
┌──────────────────────────────────────────────────────────┐
│                     DRMS Monorepo                        │
│                   (pnpm + Turborepo)                     │
├────────────────────┬─────────────────────────────────────┤
│                    │                                     │
│   apps/web         │          apps/api                   │
│   (Next.js 14)     │          (NestJS 10)                │
│   - UI/Dashboard   │          - REST API                 │
│   - TailwindCSS    │          - JWT Auth                 │
│   - React Query    │          - LDAP Integration         │
│   - Zustand        │          - Swagger Docs             │
│                    │          - Cron Scheduler            │
├────────────────────┼─────────────────────────────────────┤
│                    │                                     │
│   packages/shared  │      packages/database              │
│   (Enums, Types,   │      (Prisma ORM)                   │
│    Constants)      │      - Schema & Migrations          │
│                    │      - Seed Data                    │
├────────────────────┴─────────────────────────────────────┤
│                  Infrastructure                          │
│   PostgreSQL 16  ·  Redis 7  ·  MinIO  ·  Nginx         │
│                 (Docker Compose)                         │
└──────────────────────────────────────────────────────────┘
```

---

## 🛠 Tech Stack

| Layer         | Teknologi                                                          |
|---------------|---------------------------------------------------------------------|
| **Frontend**  | Next.js 14, React 18, TailwindCSS 3, Zustand, React Query, Recharts |
| **Backend**   | NestJS 10, Passport (JWT + LDAP), Swagger/OpenAPI, node-cron        |
| **Database**  | PostgreSQL 16 via Prisma ORM 5                                      |
| **Storage**   | MinIO (S3-compatible object storage)                                |
| **Cache**     | Redis 7 via ioredis + cache-manager                                 |
| **Auth**      | LDAP/Active Directory + JWT                                         |
| **Monorepo**  | pnpm Workspaces + Turborepo                                        |
| **Infra**     | Docker Compose (Postgres, Redis, MinIO, Nginx)                      |

---

## ✨ Fitur

### Manajemen Arsip
- **CRUD Arsip Aktif** — Input, edit, detail, dan daftar arsip aktif dengan kode klasifikasi JRA
- **Arsip Inaktif** — Daftar dan detail arsip yang sudah melewati masa retensi aktif
- **Upload File Digital** — Unggah scan dokumen ke MinIO dengan presigned URL
- **Lokasi Penyimpanan Fisik** — Pencatatan rak, laci, boks, dan folder

### Retensi & Siklus Hidup
- **Otomatis Transisi Status** — Cron job harian memindahkan arsip AKTIF → INAKTIF → siap MUSNAH berdasarkan JRA
- **Perpanjangan Retensi** — Workflow pengajuan dan approval perpanjangan masa simpan
- **Monitoring Retensi** — Dashboard monitoring arsip yang mendekati batas retensi

### Pemusnahan Arsip
- **Usul Musnah** — Workflow pengajuan pemusnahan dengan nota dinas
- **Approval Berjenjang** — Persetujuan oleh USER_APPROVAL + verifikasi oleh USER_SETUM
- **Audit Trail** — Semua aksi terekam lengkap di audit log

### Sistem Pendukung
- **Dashboard** — Statistik dan grafik overview arsip (Recharts)
- **Notifikasi** — Pemberitahuan retensi berakhir, approval status, dll
- **Audit Log** — Pencatatan setiap perubahan data oleh siapa dan kapan
- **LDAP Authentication** — Login via Active Directory perusahaan
- **Role-Based Access Control** — 3 role: `USER`, `USER_APPROVAL`, `USER_SETUM`
- **Master Data** — Kode Klasifikasi (JRA) dan Unit Kerja (hierarkis)

---

## 📦 Prasyarat

- **Node.js** ≥ 20.0.0
- **pnpm** ≥ 8.0.0
- **Docker & Docker Compose** (untuk database, Redis, MinIO)

---

## 🚀 Instalasi & Setup

### 1. Clone repository

```bash
git clone https://github.com/<your-org>/drms.git
cd drms
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Setup environment variables

```bash
cp .env.example .env
```

Edit `.env` dan isi nilai yang sesuai (lihat [Environment Variables](#-environment-variables)).

### 4. Jalankan infrastructure (Docker)

```bash
pnpm docker:dev
```

Ini akan menjalankan:
- **PostgreSQL** pada port `5433`
- **Redis** pada port `6380`
- **MinIO** pada port `9000` (API) dan `9001` (Console)

### 5. Migrasi & seed database

```bash
# Generate Prisma Client
pnpm db:generate

# Jalankan migrasi
pnpm db:migrate:dev

# Seed data awal (Unit Kerja, Kode Klasifikasi, Admin user)
pnpm db:seed
```

---

## 💻 Menjalankan Development Server

```bash
# Jalankan semua apps sekaligus (API + Web)
pnpm dev
```

| Service       | URL                          |
|---------------|------------------------------|
| Web (Next.js) | http://localhost:3000         |
| API (NestJS)  | http://localhost:4000         |
| Swagger Docs  | http://localhost:4000/api/docs|
| MinIO Console | http://localhost:9001         |

---

## 🔐 Environment Variables

Semua environment variable didefinisikan di file `.env` pada root project.  
Lihat [`.env.example`](.env.example) untuk template lengkap.

| Variable                     | Deskripsi                                      | Wajib |
|-----------------------------|-------------------------------------------------|-------|
| `DATABASE_URL`              | PostgreSQL connection string                    | ✅    |
| `JWT_SECRET`                | Secret key untuk JWT token (min 32 karakter)    | ✅    |
| `JWT_EXPIRY`                | Durasi token JWT (default: `8h`)                | ❌    |
| `LDAP_URL`                  | URL server Active Directory                     | ✅*   |
| `LDAP_BIND_DN`              | Distinguished Name service account              | ✅*   |
| `LDAP_BIND_CREDENTIALS`     | Password service account LDAP                   | ✅*   |
| `LDAP_SEARCH_BASE`          | Base DN untuk pencarian user                    | ✅*   |
| `MINIO_ACCESS_KEY`          | Access key MinIO                                | ✅    |
| `MINIO_SECRET_KEY`          | Secret key MinIO                                | ✅    |
| `MINIO_ENDPOINT`            | Host MinIO (default: `localhost`)                | ❌    |
| `MINIO_PORT`                | Port MinIO (default: `9000`)                    | ❌    |
| `MINIO_BUCKET_NAME`         | Nama bucket (default: `drms-arsip`)             | ❌    |
| `REDIS_HOST`                | Host Redis (default: `localhost`)                | ❌    |
| `REDIS_PORT`                | Port Redis (default: `6380`)                    | ❌    |
| `NEXT_PUBLIC_API_URL`       | URL API untuk frontend                          | ❌    |
| `NEXTAUTH_SECRET`           | Secret untuk NextAuth.js                        | ✅    |
| `NOTIF_HARI_SEBELUM_RETENSI`| Hari sebelum retensi untuk kirim notifikasi     | ❌    |
| `CRON_RETENSI_SCHEDULE`     | Jadwal cron pengecekan retensi                  | ❌    |

> *\* LDAP variables wajib di production. Di `development` mode, LDAP verification di-skip.*

---

## 📁 Struktur Proyek

```
drms/
├── apps/
│   ├── api/                        # NestJS Backend
│   │   └── src/
│   │       ├── common/             # Guards, Decorators, Interceptors, Filters
│   │       ├── modules/
│   │       │   ├── arsip/          # CRUD arsip aktif/inaktif/musnah
│   │       │   ├── auth/           # Login LDAP + JWT
│   │       │   ├── audit-log/      # Pencatatan audit trail
│   │       │   ├── dashboard/      # Statistik & grafik
│   │       │   ├── lokasi-simpan/  # Lokasi penyimpanan fisik
│   │       │   ├── master/         # Kode Klasifikasi & Unit Kerja
│   │       │   ├── notifikasi/     # Sistem notifikasi
│   │       │   ├── perpanjangan-retensi/  # Workflow perpanjangan
│   │       │   ├── retensi/        # Scheduler & logic retensi
│   │       │   ├── storage/        # MinIO file upload/download
│   │       │   ├── users/          # Manajemen user & role
│   │       │   └── usul-musnah/    # Workflow pemusnahan
│   │       └── prisma/             # Prisma module (DI)
│   │
│   └── web/                        # Next.js Frontend
│       └── src/
│           ├── app/
│           │   ├── (app)/          # Authenticated pages
│           │   │   ├── arsip/      # Halaman arsip (aktif/inaktif/musnah)
│           │   │   ├── audit-log/  # Halaman audit log
│           │   │   ├── dashboard/  # Halaman dashboard
│           │   │   ├── monitoring/ # Monitoring lokasi & retensi
│           │   │   ├── notifikasi/ # Halaman notifikasi
│           │   │   ├── perpanjangan/ # Halaman perpanjangan retensi
│           │   │   └── usul-musnah/  # Halaman usul musnah
│           │   └── login/          # Halaman login
│           ├── hooks/              # Custom React hooks
│           ├── lib/                # API client, utilities
│           └── store/              # Zustand state management
│
├── packages/
│   ├── database/                   # Prisma ORM package
│   │   └── prisma/
│   │       ├── schema.prisma       # Database schema
│   │       ├── migrations/         # SQL migrations
│   │       └── seed/               # Seed data (Unit Kerja, Kode Klasifikasi, Admin)
│   │
│   └── shared/                     # Shared types & constants
│       └── src/
│           ├── constants/          # File, Pagination, Retensi constants
│           └── enums/              # Role, Status, Kondisi enums
│
├── docker/
│   ├── docker-compose.yml          # PostgreSQL, Redis, MinIO
│   └── nginx/nginx.conf            # Reverse proxy config
│
├── .env.example                    # Template environment variables
├── package.json                    # Root workspace config
├── pnpm-workspace.yaml             # pnpm workspace definition
├── turbo.json                      # Turborepo pipeline config
└── tsconfig.base.json              # Shared TypeScript config
```

---

## 🗄 Database Schema

Database menggunakan **PostgreSQL** dengan **Prisma ORM**. Model utama:

| Model                  | Deskripsi                                              |
|------------------------|--------------------------------------------------------|
| `UnitKerja`            | Unit organisasi (hierarkis, parent-child)               |
| `KodeKlasifikasi`     | Kode JRA dengan retensi aktif & inaktif (bulan)         |
| `User`                 | User yang login via LDAP, memiliki role & unit kerja    |
| `Arsip`                | Dokumen arsip dengan status siklus hidup                |
| `LokasiSimpan`         | Lokasi fisik penyimpanan (rak, laci, boks, folder)      |
| `UsulMusnah`           | Pengajuan pemusnahan arsip (approval berjenjang)        |
| `PerpanjanganRetensi`  | Pengajuan perpanjangan masa retensi                     |
| `AuditLog`             | Log perubahan data (siapa, kapan, apa)                  |
| `Notifikasi`           | Notifikasi in-app untuk user                            |

### Enum Status Arsip
```
AKTIF → INAKTIF → USUL_MUSNAH → MUSNAH
                → PERMANEN
```

---

## 🔌 API Modules

| Module                   | Endpoint Prefix           | Deskripsi                          |
|--------------------------|---------------------------|------------------------------------|
| Auth                     | `/api/auth`               | Login LDAP, JWT token, profile     |
| Users                    | `/api/users`              | CRUD user, role management         |
| Arsip                    | `/api/arsip`              | CRUD arsip, filter, pencarian      |
| Retensi                  | `/api/retensi`            | Monitoring & scheduler retensi     |
| Lokasi Simpan            | `/api/lokasi-simpan`      | CRUD lokasi penyimpanan fisik      |
| Usul Musnah              | `/api/usul-musnah`        | Workflow pemusnahan arsip          |
| Perpanjangan Retensi     | `/api/perpanjangan`       | Workflow perpanjangan retensi      |
| Storage                  | `/api/storage`            | Upload/download file via MinIO     |
| Notifikasi               | `/api/notifikasi`         | Daftar & read notifikasi           |
| Dashboard                | `/api/dashboard`          | Statistik arsip                    |
| Audit Log                | `/api/audit-log`          | Daftar log aktivitas               |
| Master                   | `/api/master`             | Kode Klasifikasi & Unit Kerja      |

Dokumentasi API lengkap tersedia di **Swagger UI**: `http://localhost:4000/api/docs`

---

## 📜 Scripts

Semua script dijalankan dari root project:

```bash
# Development
pnpm dev                  # Jalankan API + Web secara paralel
pnpm build                # Build semua packages

# Database
pnpm db:generate          # Generate Prisma Client
pnpm db:migrate:dev       # Jalankan migrasi (development)
pnpm db:migrate:deploy    # Jalankan migrasi (production)
pnpm db:seed              # Seed data awal
pnpm db:studio            # Buka Prisma Studio (GUI)
pnpm db:reset             # Reset database (⚠️ hapus semua data)

# Docker
pnpm docker:dev           # Start infrastructure containers
pnpm docker:down          # Stop infrastructure containers

# Quality
pnpm lint                 # Lint semua packages
pnpm test                 # Jalankan tests
```

---

## 📄 Lisensi

Private — Internal PT ASABRI (Persero)
