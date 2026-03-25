# PROJECT TREE
# DRMS PT ASABRI (Persero)
# Monorepo: Turborepo + Next.js 14 + NestJS + Prisma

---

## DAFTAR ISI

1. [Gambaran Monorepo](#1-gambaran-monorepo)
2. [Root Level Structure](#2-root-level-structure)
3. [apps/web — Frontend Next.js](#3-appsweb--frontend-nextjs)
4. [apps/api — Backend NestJS](#4-appsapi--backend-nestjs)
5. [packages/database — Prisma](#5-packagesdatabase--prisma)
6. [packages/shared — Type Sharing](#6-packagesshared--type-sharing)
7. [docker/ — Container Config](#7-docker--container-config)
8. [Penjelasan File-File Kritis](#8-penjelasan-file-file-kritis)

---

## 1. Gambaran Monorepo

```
Kenapa Monorepo?
┌─────────────────────────────────────────────────────────────┐
│ Frontend & Backend berbagi banyak type yang sama:           │
│  - Interface Arsip, UsulMusnah, PerpanjanganRetensi         │
│  - Enum StatusArsip, Role, KondisiFisik                     │
│  - Konstanta (mis: format kode klasifikasi)                 │
│                                                             │
│ Tanpa monorepo: type harus didefinisikan DUA KALI           │
│   → potensi tidak sinkron → bug yang sulit dilacak          │
│                                                             │
│ Dengan monorepo: type didefinisikan di packages/shared      │
│   → dipakai oleh apps/web DAN apps/api                     │
│   → TypeScript error langsung terdeteksi                   │
└─────────────────────────────────────────────────────────────┘

Build System: Turborepo
┌─────────────────────────────────────────────────────────────┐
│ Turborepo memahami dependency graph antar packages:         │
│                                                             │
│  packages/shared ◄── apps/web                              │
│  packages/shared ◄── apps/api                              │
│  packages/database ◄── apps/api                            │
│                                                             │
│ Build order otomatis:                                       │
│  1. packages/shared (build dulu)                           │
│  2. packages/database (build dulu)                         │
│  3. apps/api (build setelah database siap)                 │
│  4. apps/web (build paralel dengan api, setelah shared)    │
│                                                             │
│ Caching: hasil build di-cache — rebuild hanya file berubah │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Root Level Structure

```
drms-asabri/
│
├── apps/                           # Aplikasi yang bisa di-deploy
│   ├── web/                        # Frontend: Next.js 14
│   └── api/                        # Backend: NestJS
│
├── packages/                       # Shared packages (tidak di-deploy sendiri)
│   ├── database/                   # Prisma schema, migrations, seed
│   └── shared/                     # Types, enums, constants bersama
│
├── docker/                         # Docker & infrastructure config
│   ├── docker-compose.yml          # Development: Postgres + Redis + MinIO
│   ├── docker-compose.prod.yml     # Production override
│   └── nginx/
│       └── nginx.conf              # Reverse proxy: routing web & api
│
├── .github/                        # CI/CD workflows
│   └── workflows/
│       ├── ci.yml                  # Lint + Test + Build check
│       └── deploy.yml              # Deploy ke server production
│
├── turbo.json                      # Turborepo pipeline configuration
├── package.json                    # Root workspace package.json
├── pnpm-workspace.yaml             # pnpm workspace definition
├── .env.example                    # Template semua environment variables
├── .env                            # Actual env (JANGAN commit ke git)
├── .gitignore
├── .eslintrc.js                    # Shared ESLint config
├── .prettierrc                     # Shared Prettier config
└── tsconfig.base.json              # Base TypeScript config (di-extend apps)
```

---

## 3. apps/web — Frontend Next.js

```
apps/web/
│
├── src/
│   │
│   ├── app/                              # Next.js 14 App Router
│   │   │
│   │   ├── (auth)/                       # Route group: halaman tanpa layout utama
│   │   │   ├── layout.tsx                # Layout minimal (hanya centered card)
│   │   │   └── login/
│   │   │       ├── page.tsx              # Halaman login (form username + password AD)
│   │   │       └── loading.tsx           # Skeleton saat proses login
│   │   │
│   │   ├── (dashboard)/                  # Route group: halaman yang butuh auth
│   │   │   ├── layout.tsx                # Layout utama: Sidebar + Navbar + Content area
│   │   │   │
│   │   │   ├── page.tsx                  # Dashboard utama — infografis & summary
│   │   │   ├── loading.tsx               # Skeleton dashboard
│   │   │   │
│   │   │   ├── arsip/                    # Manajemen arsip
│   │   │   │   │
│   │   │   │   ├── aktif/                # Arsip status AKTIF
│   │   │   │   │   ├── page.tsx          # Daftar arsip aktif (table + filter + search)
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   ├── create/
│   │   │   │   │   │   └── page.tsx      # Form input arsip baru
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── page.tsx      # Detail arsip aktif
│   │   │   │   │       └── edit/
│   │   │   │   │           └── page.tsx  # Edit arsip (hanya sebelum inaktif)
│   │   │   │   │
│   │   │   │   ├── inaktif/              # Arsip status INAKTIF
│   │   │   │   │   ├── page.tsx          # Daftar arsip inaktif
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   ├── pindah/
│   │   │   │   │   │   └── page.tsx      # Form pemindahan ke record center (Setum)
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── page.tsx      # Detail arsip inaktif + lokasi simpan
│   │   │   │   │
│   │   │   │   └── musnah/               # Arsip musnah (read-only history)
│   │   │   │       ├── page.tsx          # Daftar arsip musnah
│   │   │   │       └── [id]/
│   │   │   │           └── page.tsx      # Detail + timeline proses pemusnahan
│   │   │   │
│   │   │   ├── usul-musnah/              # Workflow pemusnahan arsip
│   │   │   │   ├── page.tsx              # Daftar usul musnah (filter by status)
│   │   │   │   ├── loading.tsx
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx          # Form pengajuan usul musnah
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx          # Detail usul musnah + timeline approval
│   │   │   │       └── review/
│   │   │   │           └── page.tsx      # Halaman review + approve/reject (Kadiv/Setum)
│   │   │   │
│   │   │   ├── perpanjangan/             # Workflow perpanjangan retensi
│   │   │   │   ├── page.tsx              # Daftar pengajuan perpanjangan
│   │   │   │   ├── create/
│   │   │   │   │   └── page.tsx          # Form pengajuan perpanjangan
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx          # Detail perpanjangan
│   │   │   │       └── review/
│   │   │   │           └── page.tsx      # Review perpanjangan (Setum)
│   │   │   │
│   │   │   ├── monitoring/               # Khusus User Setum
│   │   │   │   ├── page.tsx              # Overview monitoring semua arsip
│   │   │   │   ├── retensi/
│   │   │   │   │   └── page.tsx          # Monitor arsip mendekati masa retensi
│   │   │   │   └── lokasi/
│   │   │   │       └── page.tsx          # Monitor & input lokasi simpan
│   │   │   │
│   │   │   ├── notifikasi/
│   │   │   │   └── page.tsx              # Halaman semua notifikasi user
│   │   │   │
│   │   │   ├── audit-log/                # Khusus User Setum
│   │   │   │   └── page.tsx              # Tabel audit trail seluruh sistem
│   │   │   │
│   │   │   └── profil/
│   │   │       └── page.tsx              # Profil user yang sedang login
│   │   │
│   │   ├── api/                          # Next.js Route Handlers (API internal)
│   │   │   └── auth/
│   │   │       └── [...nextauth]/
│   │   │           └── route.ts          # NextAuth.js handler
│   │   │
│   │   ├── globals.css                   # Global CSS + Tailwind directives
│   │   ├── layout.tsx                    # Root layout (font, metadata, providers)
│   │   └── not-found.tsx                 # Custom 404 page
│   │
│   ├── components/                       # Reusable UI components
│   │   │
│   │   ├── ui/                           # Komponen dasar dari shadcn/ui
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── form.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── skeleton.tsx
│   │   │   ├── tooltip.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── pagination.tsx
│   │   │   ├── tabs.tsx
│   │   │   ├── alert.tsx
│   │   │   └── separator.tsx
│   │   │
│   │   ├── layout/                       # Komponen layout utama
│   │   │   ├── Sidebar.tsx               # Sidebar navigasi (responsive + collapsible)
│   │   │   ├── Navbar.tsx                # Top navbar: user info + notif bell + logout
│   │   │   ├── Breadcrumb.tsx            # Dynamic breadcrumb sesuai route
│   │   │   └── PageHeader.tsx            # Header halaman: judul + action buttons
│   │   │
│   │   ├── arsip/                        # Komponen spesifik domain arsip
│   │   │   ├── ArsipTable.tsx            # Tabel arsip dengan sort, filter, pagination
│   │   │   ├── ArsipForm.tsx             # Form create/edit arsip
│   │   │   ├── ArsipDetail.tsx           # Card detail arsip (semua field)
│   │   │   ├── ArsipStatusBadge.tsx      # Badge berwarna sesuai status arsip
│   │   │   ├── RetensiCountdown.tsx      # Countdown/progress bar masa retensi
│   │   │   ├── KodeKlasifikasiSelect.tsx # Searchable select kode klasifikasi
│   │   │   ├── FileUpload.tsx            # Komponen upload file digitasi arsip
│   │   │   ├── FilePreview.tsx           # Preview file (PDF/gambar)
│   │   │   └── LokasiSimpanForm.tsx      # Form input lokasi simpan (Setum only)
│   │   │
│   │   ├── workflow/                     # Komponen workflow approval
│   │   │   ├── ApprovalTimeline.tsx      # Visual timeline status approval
│   │   │   ├── ApprovalActions.tsx       # Tombol Setujui/Tolak + textarea alasan
│   │   │   ├── UsulMusnahForm.tsx        # Form pengajuan usul musnah
│   │   │   └── PerpanjanganForm.tsx      # Form pengajuan perpanjangan retensi
│   │   │
│   │   ├── dashboard/                    # Komponen dashboard & analytics
│   │   │   ├── StatCard.tsx              # Card angka statistik (Total Arsip, dll)
│   │   │   ├── ArsipStatusChart.tsx      # Pie/Donut chart distribusi status
│   │   │   ├── ArsipTrendChart.tsx       # Line chart tren arsip per bulan
│   │   │   ├── UsulMusnahTable.tsx       # Tabel usul musnah di dashboard
│   │   │   └── RetensiAlertList.tsx      # List arsip mendekati masa retensi
│   │   │
│   │   └── common/                       # Komponen umum
│   │       ├── DataTable.tsx             # Generic reusable table dengan fitur lengkap
│   │       ├── SearchInput.tsx           # Input pencarian dengan debounce
│   │       ├── FilterPanel.tsx           # Panel filter (status, tahun, unit kerja)
│   │       ├── ConfirmDialog.tsx         # Dialog konfirmasi aksi destruktif
│   │       ├── EmptyState.tsx            # Tampilan ketika data kosong
│   │       ├── LoadingSpinner.tsx        # Spinner loading
│   │       └── ErrorBoundary.tsx         # Error boundary component
│   │
│   ├── hooks/                            # Custom React Hooks
│   │   ├── useArsip.ts                   # Hook CRUD arsip (react-query)
│   │   ├── useKodeKlasifikasi.ts         # Hook fetch kode klasifikasi
│   │   ├── useUsulMusnah.ts              # Hook workflow usul musnah
│   │   ├── usePerpanjangan.ts            # Hook workflow perpanjangan
│   │   ├── useDashboard.ts              # Hook data dashboard
│   │   ├── useNotifikasi.ts             # Hook fetch & mark-read notifikasi
│   │   ├── useAuth.ts                   # Hook session & auth state
│   │   ├── useFileUpload.ts             # Hook upload file ke API
│   │   └── useDebounce.ts               # Hook debounce untuk search input
│   │
│   ├── lib/                              # Utilities & configurations
│   │   ├── api.ts                        # Axios instance dengan interceptors
│   │   │                                 # (auto-attach JWT, handle 401 → redirect login)
│   │   ├── auth.ts                       # NextAuth.js configuration
│   │   ├── query-client.ts               # React Query client configuration
│   │   └── utils.ts                      # Helper functions (cn, format date, dll)
│   │
│   ├── store/                            # Zustand global state
│   │   ├── authStore.ts                  # State user yang sedang login
│   │   ├── notifStore.ts                 # State notifikasi (unread count)
│   │   └── uiStore.ts                    # State UI (sidebar collapsed, dll)
│   │
│   ├── types/                            # Frontend-specific types
│   │   ├── api.types.ts                  # Response shapes dari API
│   │   └── form.types.ts                 # Form input types
│   │
│   └── middleware.ts                     # Next.js middleware: proteksi route
│                                         # (redirect ke /login jika tidak ada session)
│
├── public/
│   ├── logo-asabri.png
│   ├── favicon.ico
│   └── fonts/                            # Self-hosted fonts (jika tidak pakai CDN)
│
├── next.config.ts                        # Next.js configuration
├── tailwind.config.ts                    # Tailwind CSS configuration
├── postcss.config.js
├── tsconfig.json                         # Extends dari tsconfig.base.json di root
├── .eslintrc.js
└── package.json
```

---

## 4. apps/api — Backend NestJS

```
apps/api/
│
├── src/
│   │
│   ├── main.ts                           # Entry point aplikasi NestJS
│   │                                     # Konfigurasi: CORS, Swagger, Global pipes,
│   │                                     # Global filters, Port listening
│   │
│   ├── app.module.ts                     # Root AppModule
│   │                                     # Import semua feature modules
│   │
│   ├── modules/                          # Feature Modules (per domain bisnis)
│   │   │
│   │   ├── auth/                         # Autentikasi via LDAP + JWT
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.controller.ts        # POST /auth/login, POST /auth/logout
│   │   │   ├── auth.service.ts           # Logic: verify LDAP, create/update user, issue JWT
│   │   │   ├── dto/
│   │   │   │   └── login.dto.ts          # { username: string, password: string }
│   │   │   ├── strategies/
│   │   │   │   ├── ldap.strategy.ts      # Passport strategy: verify ke LDAP server
│   │   │   │   └── jwt.strategy.ts       # Passport strategy: verify JWT token
│   │   │   └── guards/
│   │   │       ├── jwt-auth.guard.ts     # Guard: cek JWT valid
│   │   │       └── roles.guard.ts        # Guard: cek role user sesuai decorator
│   │   │
│   │   ├── users/                        # Manajemen data user (sync dari AD)
│   │   │   ├── users.module.ts
│   │   │   ├── users.controller.ts       # GET /users, GET /users/:id, PATCH /users/:id/role
│   │   │   ├── users.service.ts
│   │   │   └── dto/
│   │   │       └── update-user.dto.ts    # { role?: Role, isActive?: boolean }
│   │   │
│   │   ├── arsip/                        # Core: CRUD Arsip
│   │   │   ├── arsip.module.ts
│   │   │   ├── arsip.controller.ts       # Semua endpoint /arsip/*
│   │   │   ├── arsip.service.ts          # Business logic + kalkulasi retensi
│   │   │   └── dto/
│   │   │       ├── create-arsip.dto.ts
│   │   │       ├── update-arsip.dto.ts
│   │   │       └── filter-arsip.dto.ts   # Query params: status, unitKerjaId, tahun, dll
│   │   │
│   │   ├── retensi/                      # Kalkulasi & monitoring jadwal retensi
│   │   │   ├── retensi.module.ts
│   │   │   ├── retensi.controller.ts     # GET /retensi/mendekati-berakhir, dll
│   │   │   ├── retensi.service.ts        # hitungTanggalRetensi(), getArsipMendekatiRetensi()
│   │   │   └── retensi.scheduler.ts      # @Cron('0 23 * * *') — jalankan setiap 23:00
│   │   │                                 # - Update status AKTIF → INAKTIF
│   │   │                                 # - Generate notifikasi H-30
│   │   │
│   │   ├── lokasi-simpan/                # Input & update lokasi fisik arsip (Setum)
│   │   │   ├── lokasi-simpan.module.ts
│   │   │   ├── lokasi-simpan.controller.ts # POST /lokasi-simpan, PATCH /lokasi-simpan/:id
│   │   │   ├── lokasi-simpan.service.ts
│   │   │   └── dto/
│   │   │       └── create-lokasi-simpan.dto.ts
│   │   │
│   │   ├── usul-musnah/                  # Workflow pemusnahan arsip
│   │   │   ├── usul-musnah.module.ts
│   │   │   ├── usul-musnah.controller.ts
│   │   │   ├── usul-musnah.service.ts    # Orchestrate 2-step approval
│   │   │   └── dto/
│   │   │       ├── create-usul-musnah.dto.ts
│   │   │       ├── approve-usul-musnah.dto.ts  # { penilaian: string }
│   │   │       └── reject-usul-musnah.dto.ts   # { alasan: string }
│   │   │
│   │   ├── perpanjangan-retensi/         # Workflow perpanjangan retensi
│   │   │   ├── perpanjangan-retensi.module.ts
│   │   │   ├── perpanjangan-retensi.controller.ts
│   │   │   ├── perpanjangan-retensi.service.ts
│   │   │   └── dto/
│   │   │       ├── create-perpanjangan.dto.ts
│   │   │       └── review-perpanjangan.dto.ts
│   │   │
│   │   ├── storage/                      # Upload & download file (MinIO)
│   │   │   ├── storage.module.ts
│   │   │   ├── storage.controller.ts     # POST /storage/upload, GET /storage/presign/:key
│   │   │   └── storage.service.ts        # MinIO SDK wrapper
│   │   │                                 # uploadFile(), getPresignedUrl(), deleteFile()
│   │   │
│   │   ├── notifikasi/                   # Sistem notifikasi in-app
│   │   │   ├── notifikasi.module.ts
│   │   │   ├── notifikasi.controller.ts  # GET /notifikasi, PATCH /notifikasi/:id/read
│   │   │   │                             # PATCH /notifikasi/read-all
│   │   │   └── notifikasi.service.ts     # createNotifikasi(), getUnreadCount()
│   │   │
│   │   ├── dashboard/                    # Agregasi data untuk halaman dashboard
│   │   │   ├── dashboard.module.ts
│   │   │   ├── dashboard.controller.ts   # GET /dashboard/summary, GET /dashboard/chart
│   │   │   └── dashboard.service.ts      # Query agregasi + caching Redis
│   │   │
│   │   ├── audit-log/                    # Baca audit trail
│   │   │   ├── audit-log.module.ts
│   │   │   ├── audit-log.controller.ts   # GET /audit-log (hanya Setum)
│   │   │   └── audit-log.service.ts      # createLog(), getLogs() dengan filter
│   │   │
│   │   └── master/                       # Data master (read-mostly)
│   │       ├── master.module.ts
│   │       ├── master.controller.ts      # GET /master/kode-klasifikasi
│   │       │                             # GET /master/unit-kerja
│   │       └── master.service.ts         # Dengan Redis caching (data jarang berubah)
│   │
│   ├── common/                           # Shared utilities untuk seluruh API
│   │   │
│   │   ├── decorators/
│   │   │   ├── roles.decorator.ts        # @Roles(Role.USER_SETUM)
│   │   │   └── current-user.decorator.ts # @CurrentUser() — inject user dari JWT payload
│   │   │
│   │   ├── interceptors/
│   │   │   ├── audit-log.interceptor.ts  # Otomatis log setiap mutasi (POST/PATCH/DELETE)
│   │   │   ├── transform.interceptor.ts  # Standarisasi response format
│   │   │   └── cache.interceptor.ts      # Cache response GET ke Redis
│   │   │
│   │   ├── filters/
│   │   │   └── http-exception.filter.ts  # Standarisasi error response format
│   │   │
│   │   ├── pipes/
│   │   │   ├── validation.pipe.ts        # Global validation dengan class-validator
│   │   │   └── parse-pagination.pipe.ts  # Parse & validasi query params pagination
│   │   │
│   │   └── interfaces/
│   │       ├── paginated-result.interface.ts  # { data[], total, page, limit }
│   │       └── api-response.interface.ts      # { success, data, message, meta }
│   │
│   └── prisma/                           # Prisma integration
│       ├── prisma.module.ts              # Global module (tersedia di seluruh app)
│       └── prisma.service.ts             # Extends PrismaClient, handle onModuleInit
│
├── test/                                 # Test files
│   ├── app.e2e-spec.ts                   # End-to-end tests
│   └── jest-e2e.json
│
├── nest-cli.json                         # NestJS CLI configuration
├── tsconfig.json                         # Extends tsconfig.base.json
├── tsconfig.build.json                   # Build-time tsconfig (exclude test files)
├── .eslintrc.js
└── package.json
```

---

## 5. packages/database — Prisma

```
packages/database/
│
├── prisma/
│   │
│   ├── schema.prisma                     # Schema utama (lihat database.md)
│   │
│   ├── migrations/                       # Auto-generated oleh `prisma migrate dev`
│   │   ├── 20250123000001_init/
│   │   │   └── migration.sql
│   │   ├── 20250123000002_add_master_data/
│   │   │   └── migration.sql
│   │   └── migration_lock.toml           # Lock file (JANGAN edit manual)
│   │
│   └── seed/                             # Data awal yang di-inject saat setup
│       ├── index.ts                      # Seed runner — memanggil semua seed
│       ├── kode-klasifikasi.seed.ts      # 200+ kode dari BRS (PR, MN, MB, dll)
│       ├── unit-kerja.seed.ts            # Hirarki unit kerja ASABRI
│       └── user-admin.seed.ts            # User admin awal (Setum) untuk onboarding
│
├── generated/                            # AUTO-GENERATED — jangan edit manual
│   └── client/                           # Prisma Client yang di-generate
│       ├── index.js
│       ├── index.d.ts
│       └── ...
│
└── package.json
```

---

## 6. packages/shared — Type Sharing

```
packages/shared/
│
├── src/
│   │
│   ├── types/                            # Interface & type definitions
│   │   ├── arsip.types.ts                # IArsip, IArsipWithRelations, ILokasiSimpan
│   │   ├── user.types.ts                 # IUser, IJwtPayload
│   │   ├── usul-musnah.types.ts          # IUsulMusnah, IUsulMusnahWithRelations
│   │   ├── perpanjangan.types.ts         # IPerpanjanganRetensi
│   │   ├── dashboard.types.ts            # IDashboardSummary, IChartData
│   │   ├── kode-klasifikasi.types.ts     # IKodeKlasifikasi
│   │   ├── notifikasi.types.ts           # INotifikasi
│   │   └── api-response.types.ts         # IPaginatedResponse<T>, IApiResponse<T>
│   │
│   ├── enums/                            # Enum values (selaras dengan Prisma enums)
│   │   ├── role.enum.ts                  # enum Role { USER, USER_APPROVAL, USER_SETUM }
│   │   ├── status-arsip.enum.ts          # enum StatusArsip { AKTIF, INAKTIF, ... }
│   │   ├── kondisi-fisik.enum.ts         # enum KondisiFisik { BAIK, RUSAK, ... }
│   │   ├── tingkat-perkembangan.enum.ts  # enum TingkatPerkembangan { ASLI, SALINAN }
│   │   ├── status-approval.enum.ts       # enum StatusApproval { PENDING, DISETUJUI, DITOLAK }
│   │   └── jenis-notifikasi.enum.ts      # enum JenisNotifikasi { ... }
│   │
│   └── constants/                        # Konstanta yang digunakan di kedua sisi
│       ├── retensi.constants.ts          # HARI_NOTIF_SEBELUM_RETENSI = 30
│       ├── pagination.constants.ts       # DEFAULT_PAGE_SIZE = 20, MAX_PAGE_SIZE = 100
│       └── file.constants.ts             # MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES
│
├── index.ts                              # Re-export semua dari src/
└── package.json
```

---

## 7. docker/ — Container Config

```
docker/
│
├── docker-compose.yml                    # Development environment
│   # Services:
│   # - postgres:15-alpine  (port 5432)
│   # - redis:7-alpine       (port 6379)
│   # - minio/minio          (port 9000 API, 9001 Console)
│
├── docker-compose.prod.yml               # Production overrides
│   # Perbedaan dari dev:
│   # - Tidak expose port langsung ke host
│   # - Tambahkan health checks
│   # - Persistent volumes dengan nama spesifik
│   # - Resource limits (memory, CPU)
│
└── nginx/
    └── nginx.conf
    # Konfigurasi reverse proxy:
    # - /         → http://web:3000     (Next.js frontend)
    # - /api/     → http://api:4000     (NestJS backend)
    # - /minio/   → http://minio:9000   (File storage, hanya internal)
    # - SSL termination (jika production)
    # - Rate limiting
    # - Gzip compression
```

---

## 8. Penjelasan File-File Kritis

### `turbo.json` — Build Pipeline
```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "outputs": []
    },
    "db:generate": {
      "cache": false
    }
  }
}
```

### `package.json` (Root) — Workspace Scripts
```json
{
  "name": "drms-asabri",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "db:generate": "turbo run db:generate",
    "db:migrate": "cd packages/database && npx prisma migrate dev",
    "db:seed": "cd packages/database && npx ts-node prisma/seed/index.ts",
    "db:studio": "cd packages/database && npx prisma studio",
    "docker:dev": "docker-compose -f docker/docker-compose.yml up -d"
  },
  "devDependencies": {
    "turbo": "latest",
    "typescript": "^5.0.0",
    "prettier": "^3.0.0",
    "eslint": "^8.0.0"
  }
}
```

### `pnpm-workspace.yaml`
```yaml
packages:
  - "apps/*"
  - "packages/*"
```

### `.env.example` — Semua Environment Variables
```bash
# ── PostgreSQL ──────────────────────────────────────────────────────────
DATABASE_URL="postgresql://drms_user:password@localhost:5432/drms_asabri"

# ── NestJS / JWT ────────────────────────────────────────────────────────
NODE_ENV="development"
API_PORT=4000
JWT_SECRET="ganti-dengan-random-string-minimal-32-karakter"
JWT_EXPIRY="8h"                        # Session expires setelah 8 jam

# ── LDAP / Active Directory ASABRI ─────────────────────────────────────
LDAP_URL="ldap://ad.asabri.co.id:389"
LDAP_BIND_DN="CN=svc-drms,OU=ServiceAccounts,DC=asabri,DC=co,DC=id"
LDAP_BIND_CREDENTIALS="password-service-account"
LDAP_SEARCH_BASE="OU=Karyawan,DC=asabri,DC=co,DC=id"
LDAP_USERNAME_ATTRIBUTE="sAMAccountName"
LDAP_DISPLAY_NAME_ATTRIBUTE="displayName"
LDAP_EMAIL_ATTRIBUTE="mail"

# ── MinIO (File Storage) ────────────────────────────────────────────────
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY="minio-access-key"
MINIO_SECRET_KEY="minio-secret-key"
MINIO_BUCKET_NAME="drms-arsip"
MINIO_PRESIGNED_URL_EXPIRY=3600        # 1 jam (dalam detik)

# ── Redis (Cache & Session) ─────────────────────────────────────────────
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""                      # Kosong jika development
REDIS_TTL_SECONDS=3600                 # Cache TTL default: 1 jam

# ── Next.js Frontend ────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ganti-dengan-random-string-berbeda"

# ── Notifikasi ──────────────────────────────────────────────────────────
NOTIF_HARI_SEBELUM_RETENSI=30         # H-30 kirim notifikasi
CRON_RETENSI_JAM="23"                 # Jam berapa cron job jalan (23:00)

# ── Email (Opsional — untuk notifikasi email) ───────────────────────────
SMTP_HOST="smtp.asabri.co.id"
SMTP_PORT=587
SMTP_USER="drms-noreply@asabri.co.id"
SMTP_PASS="smtp-password"
```

### `src/middleware.ts` (Next.js) — Route Protection
```typescript
// Middleware ini berjalan di Edge Runtime sebelum setiap request.
// Proteksi: semua route di (dashboard) group hanya bisa diakses
// jika ada session valid. Jika tidak → redirect ke /login.

export { default } from 'next-auth/middleware';

export const config = {
  matcher: [
    '/((?!login|api/auth|_next/static|_next/image|favicon.ico).*)',
  ],
};
```

### `src/main.ts` (NestJS) — Bootstrap Application
```typescript
// Entry point NestJS — konfigurasi global di sini
// sebelum aplikasi mulai menerima request:
// - CORS: izinkan request dari Next.js origin
// - Swagger: dokumentasi API otomatis di /api/docs
// - Global Pipes: validasi DTO otomatis
// - Global Filters: standarisasi error response
// - Global Interceptors: transform response + audit log
```

---

## Catatan Penting untuk Developer

```
KONVENSI PENAMAAN
─────────────────
Files     : kebab-case (create-arsip.dto.ts)
Classes   : PascalCase (CreateArsipDto)
Functions : camelCase (hitungTanggalRetensi)
Variables : camelCase (arsipAktif)
Constants : UPPER_SNAKE_CASE (MAX_FILE_SIZE_BYTES)
DB Tables : snake_case (unit_kerja, kode_klasifikasi)
DB Columns: snake_case (tanggal_aktif_berakhir)

IMPORT ORDER (ESLint enforced)
──────────────────────────────
1. Node.js built-ins (path, fs)
2. External libraries (@nestjs/*, next, react)
3. Internal packages (@drms/shared, @drms/database)
4. Relative imports (./service, ../dto)

BRANCH STRATEGY
───────────────
main       → Production-ready
develop    → Integration branch
feature/*  → Fitur baru
hotfix/*   → Bug fix mendesak di production
```
