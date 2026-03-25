# SETUP & BOILERPLATE CODE
# DRMS PT ASABRI (Persero)
# Stack: Turborepo + Next.js 14 + NestJS + PostgreSQL + Prisma + MinIO + Redis

---

## DAFTAR ISI

1.  [Prasyarat Sistem](#1-prasyarat-sistem)
2.  [Inisialisasi Monorepo](#2-inisialisasi-monorepo)
3.  [Setup packages/shared](#3-setup-packagesshared)
4.  [Setup packages/database (Prisma)](#4-setup-packagesdatabase-prisma)
5.  [Setup apps/api (NestJS)](#5-setup-appsapi-nestjs)
6.  [Setup apps/web (Next.js)](#6-setup-appsweb-nextjs)
7.  [Setup Docker (PostgreSQL + Redis + MinIO)](#7-setup-docker-postgresql--redis--minio)
8.  [Setup Prisma Schema & Migration](#8-setup-prisma-schema--migration)
9.  [Boilerplate Code — NestJS Core](#9-boilerplate-code--nestjs-core)
10. [Boilerplate Code — Next.js Core](#10-boilerplate-code--nextjs-core)
11. [Perintah Menjalankan Aplikasi](#11-perintah-menjalankan-aplikasi)

---

## 1. Prasyarat Sistem

Pastikan semua tools berikut sudah terinstall sebelum memulai:

| Tool | Versi Minimum | Cek Versi |
|---|---|---|
| Node.js | 20.x LTS | `node --version` |
| pnpm | 8.x | `pnpm --version` |
| Docker Desktop | Latest | `docker --version` |
| Git | Latest | `git --version` |

```bash
# Install pnpm jika belum ada
npm install -g pnpm

# Install Turborepo secara global (opsional, bisa pakai npx)
pnpm install -g turbo
```

---

## 2. Inisialisasi Monorepo

### 2.1 Buat Struktur Folder

```bash
mkdir drms-asabri
cd drms-asabri

# Buat folder struktur monorepo
mkdir -p apps/web apps/api packages/database packages/shared docker/nginx
```

### 2.2 Root `package.json`

```json
// drms-asabri/package.json
{
  "name": "drms-asabri",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "db:generate": "pnpm --filter @drms/database prisma generate",
    "db:migrate:dev": "pnpm --filter @drms/database prisma migrate dev",
    "db:migrate:deploy": "pnpm --filter @drms/database prisma migrate deploy",
    "db:seed": "pnpm --filter @drms/database ts-node prisma/seed/index.ts",
    "db:studio": "pnpm --filter @drms/database prisma studio",
    "db:reset": "pnpm --filter @drms/database prisma migrate reset",
    "docker:dev": "docker compose -f docker/docker-compose.yml up -d",
    "docker:down": "docker compose -f docker/docker-compose.yml down"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.4.0",
    "prettier": "^3.2.0",
    "eslint": "^8.57.0",
    "@typescript-eslint/eslint-plugin": "^7.0.0",
    "@typescript-eslint/parser": "^7.0.0"
  },
  "engines": {
    "node": ">=20.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

### 2.3 `pnpm-workspace.yaml`

```yaml
# drms-asabri/pnpm-workspace.yaml
packages:
  - "apps/*"
  - "packages/*"
```

### 2.4 `turbo.json`

```json
// drms-asabri/turbo.json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": [".env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "db:generate": {
      "cache": false
    }
  }
}
```

### 2.5 `tsconfig.base.json`

```json
// drms-asabri/tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "paths": {
      "@drms/shared": ["../../packages/shared/src/index.ts"],
      "@drms/database": ["../../packages/database/generated/client"]
    }
  },
  "exclude": ["node_modules"]
}
```

### 2.6 `.prettierrc`

```json
// drms-asabri/.prettierrc
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "bracketSpacing": true,
  "arrowParens": "always"
}
```

### 2.7 `.gitignore`

```gitignore
# drms-asabri/.gitignore

# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
.next/
out/

# Environment — JANGAN PERNAH commit file ini
.env
.env.local
.env.*.local

# Prisma generated
packages/database/generated/

# Logs
*.log
logs/

# OS
.DS_Store
Thumbs.db

# Turborepo cache
.turbo/

# Test coverage
coverage/

# IDE
.vscode/
.idea/
```

### 2.8 `.env` (Copy dari `.env.example`)

```bash
# drms-asabri/.env

# ── PostgreSQL ─────────────────────────────────────────────────────────
DATABASE_URL="postgresql://drms_user:password@localhost:5432/drms_asabri"

# ── NestJS / JWT ───────────────────────────────────────────────────────
NODE_ENV="development"
API_PORT=4000
JWT_SECRET="drms-asabri-jwt-secret-ganti-di-production-min-32char"
JWT_EXPIRY="8h"

# ── LDAP / Active Directory ASABRI ────────────────────────────────────
LDAP_URL="ldap://ad.asabri.co.id:389"
LDAP_BIND_DN="CN=svc-drms,OU=ServiceAccounts,DC=asabri,DC=co,DC=id"
LDAP_BIND_CREDENTIALS="service-account-password"
LDAP_SEARCH_BASE="OU=Karyawan,DC=asabri,DC=co,DC=id"
LDAP_USERNAME_ATTRIBUTE="sAMAccountName"
LDAP_DISPLAY_NAME_ATTRIBUTE="displayName"
LDAP_EMAIL_ATTRIBUTE="mail"
LDAP_JABATAN_ATTRIBUTE="title"
LDAP_NIP_ATTRIBUTE="employeeID"

# ── MinIO ──────────────────────────────────────────────────────────────
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET_NAME="drms-arsip"
MINIO_PRESIGNED_EXPIRY_SECONDS=3600

# ── Redis ──────────────────────────────────────────────────────────────
REDIS_HOST="localhost"
REDIS_PORT=6379
REDIS_PASSWORD=""
REDIS_TTL_SECONDS=3600

# ── Next.js ────────────────────────────────────────────────────────────
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="drms-nextauth-secret-ganti-di-production"

# ── Aplikasi ───────────────────────────────────────────────────────────
NOTIF_HARI_SEBELUM_RETENSI=30
CRON_RETENSI_SCHEDULE="0 23 * * *"

# ── Email (Opsional) ───────────────────────────────────────────────────
SMTP_HOST="smtp.asabri.co.id"
SMTP_PORT=587
SMTP_USER="drms@asabri.co.id"
SMTP_PASS=""
```

---

## 3. Setup packages/shared

```bash
cd packages/shared
```

### `packages/shared/package.json`

```json
{
  "name": "@drms/shared",
  "version": "1.0.0",
  "private": true,
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint src --ext .ts"
  }
}
```

### `packages/shared/src/enums/role.enum.ts`

```typescript
export enum Role {
  USER = 'USER',
  USER_APPROVAL = 'USER_APPROVAL',
  USER_SETUM = 'USER_SETUM',
}
```

### `packages/shared/src/enums/status-arsip.enum.ts`

```typescript
export enum StatusArsip {
  AKTIF = 'AKTIF',
  INAKTIF = 'INAKTIF',
  USUL_MUSNAH = 'USUL_MUSNAH',
  MUSNAH = 'MUSNAH',
  PERMANEN = 'PERMANEN',
}
```

### `packages/shared/src/enums/status-approval.enum.ts`

```typescript
export enum StatusApproval {
  PENDING = 'PENDING',
  DISETUJUI = 'DISETUJUI',
  DITOLAK = 'DITOLAK',
}
```

### `packages/shared/src/enums/kondisi-fisik.enum.ts`

```typescript
export enum KondisiFisik {
  BAIK = 'BAIK',
  RUSAK = 'RUSAK',
  LENGKAP = 'LENGKAP',
  TIDAK_LENGKAP = 'TIDAK_LENGKAP',
}
```

### `packages/shared/src/enums/tingkat-perkembangan.enum.ts`

```typescript
export enum TingkatPerkembangan {
  ASLI = 'ASLI',
  SALINAN = 'SALINAN',
}
```

### `packages/shared/src/enums/jenis-notifikasi.enum.ts`

```typescript
export enum JenisNotifikasi {
  RETENSI_AKTIF_BERAKHIR = 'RETENSI_AKTIF_BERAKHIR',
  RETENSI_INAKTIF_BERAKHIR = 'RETENSI_INAKTIF_BERAKHIR',
  USUL_MUSNAH_BARU = 'USUL_MUSNAH_BARU',
  USUL_MUSNAH_DISETUJUI = 'USUL_MUSNAH_DISETUJUI',
  USUL_MUSNAH_DITOLAK = 'USUL_MUSNAH_DITOLAK',
  PERPANJANGAN_DISETUJUI = 'PERPANJANGAN_DISETUJUI',
  PERPANJANGAN_DITOLAK = 'PERPANJANGAN_DITOLAK',
  VERIFIKASI_SETUM_DIBUTUHKAN = 'VERIFIKASI_SETUM_DIBUTUHKAN',
}
```

### `packages/shared/src/constants/pagination.constants.ts`

```typescript
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
```

### `packages/shared/src/constants/file.constants.ts`

```typescript
export const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/tiff',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
```

### `packages/shared/src/constants/retensi.constants.ts`

```typescript
export const HARI_NOTIF_SEBELUM_RETENSI = 30;
export const RETENSI_KONDISIONAL = -1; // Flag untuk retensi yang tidak bisa diangkakan
```

### `packages/shared/src/index.ts`

```typescript
// Enums
export * from './enums/role.enum';
export * from './enums/status-arsip.enum';
export * from './enums/status-approval.enum';
export * from './enums/kondisi-fisik.enum';
export * from './enums/tingkat-perkembangan.enum';
export * from './enums/jenis-notifikasi.enum';

// Constants
export * from './constants/pagination.constants';
export * from './constants/file.constants';
export * from './constants/retensi.constants';
```

---

## 4. Setup packages/database (Prisma)

```bash
cd packages/database
```

### `packages/database/package.json`

```json
{
  "name": "@drms/database",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "db:generate": "prisma generate",
    "db:migrate:dev": "prisma migrate dev",
    "db:migrate:deploy": "prisma migrate deploy",
    "db:seed": "ts-node --project tsconfig.json prisma/seed/index.ts",
    "db:studio": "prisma studio",
    "db:reset": "prisma migrate reset"
  },
  "dependencies": {
    "@prisma/client": "^5.13.0"
  },
  "devDependencies": {
    "prisma": "^5.13.0",
    "ts-node": "^10.9.2",
    "typescript": "^5.4.0",
    "@types/node": "^20.0.0"
  }
}
```

### `packages/database/prisma/seed/index.ts`

```typescript
import { PrismaClient } from '../../generated/client';
import { seedUnitKerja } from './unit-kerja.seed';
import { seedKodeKlasifikasi } from './kode-klasifikasi.seed';
import { seedUserAdmin } from './user-admin.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Mulai seeding database...');

  console.log('  → Seeding unit kerja...');
  await seedUnitKerja(prisma);

  console.log('  → Seeding kode klasifikasi...');
  await seedKodeKlasifikasi(prisma);

  console.log('  → Seeding user admin awal...');
  await seedUserAdmin(prisma);

  console.log('✅ Seeding selesai!');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### `packages/database/prisma/seed/unit-kerja.seed.ts`

```typescript
import { PrismaClient } from '../../generated/client';

export async function seedUnitKerja(prisma: PrismaClient) {
  // Upsert agar aman dijalankan berkali-kali
  const divisiData = [
    { kode: 'DIV-SEKPER', nama: 'Sekretariat Perusahaan', level: 1 },
    { kode: 'DIV-SI', nama: 'Divisi Sistem Informasi', level: 1 },
    { kode: 'DIV-SDM', nama: 'Divisi Sumber Daya Manusia', level: 1 },
    { kode: 'DIV-KEU', nama: 'Divisi Keuangan', level: 1 },
    { kode: 'DIV-OPS', nama: 'Divisi Operasional', level: 1 },
    // Tambahkan seluruh unit kerja ASABRI sesuai struktur organisasi
  ];

  for (const divisi of divisiData) {
    await prisma.unitKerja.upsert({
      where: { kode: divisi.kode },
      update: { nama: divisi.nama },
      create: { ...divisi, parentId: null },
    });
  }

  // Bidang (Level 2) — ambil parentId dari Divisi yang sudah dibuat
  const sekper = await prisma.unitKerja.findUnique({ where: { kode: 'DIV-SEKPER' } });

  const bidangData = [
    { kode: 'BID-SETUM', nama: 'Bidang Sekretariat Umum', level: 2, parentId: sekper!.id },
    // Tambahkan bidang lainnya...
  ];

  for (const bidang of bidangData) {
    await prisma.unitKerja.upsert({
      where: { kode: bidang.kode },
      update: { nama: bidang.nama },
      create: bidang,
    });
  }
}
```

### `packages/database/prisma/seed/user-admin.seed.ts`

```typescript
import { PrismaClient } from '../../generated/client';

export async function seedUserAdmin(prisma: PrismaClient) {
  const setumUnit = await prisma.unitKerja.findUnique({ where: { kode: 'BID-SETUM' } });
  if (!setumUnit) throw new Error('Unit kerja BID-SETUM belum di-seed');

  await prisma.user.upsert({
    where: { adUsername: 'admin.drms' },
    update: {},
    create: {
      adUsername: 'admin.drms',
      nama: 'Administrator DRMS',
      email: 'admin.drms@asabri.co.id',
      role: 'USER_SETUM',
      unitKerjaId: setumUnit.id,
    },
  });
}
```

---

## 5. Setup apps/api (NestJS)

```bash
cd apps/api

# Install NestJS CLI jika belum ada
pnpm install -g @nestjs/cli
```

### `apps/api/package.json`

```json
{
  "name": "@drms/api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "nest build",
    "dev": "nest start --watch",
    "start": "node dist/main",
    "lint": "eslint src --ext .ts",
    "test": "jest",
    "test:e2e": "jest --config test/jest-e2e.json"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/jwt": "^10.2.0",
    "@nestjs/passport": "^10.0.3",
    "@nestjs/schedule": "^4.0.1",
    "@nestjs/swagger": "^7.3.0",
    "@nestjs/config": "^3.2.0",
    "@nestjs/cache-manager": "^2.2.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.1",
    "passport-ldapauth": "^3.0.1",
    "@prisma/client": "^5.13.0",
    "class-validator": "^0.14.1",
    "class-transformer": "^0.5.1",
    "minio": "^8.0.0",
    "ioredis": "^5.3.2",
    "cache-manager": "^5.4.0",
    "cache-manager-ioredis-yet": "^2.1.0",
    "multer": "^1.4.5",
    "date-fns": "^3.6.0",
    "@drms/shared": "workspace:*"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.3.0",
    "@nestjs/testing": "^10.3.0",
    "@types/multer": "^1.4.11",
    "@types/passport-jwt": "^4.0.1",
    "@types/passport-ldapauth": "^2.0.5",
    "ts-jest": "^29.1.2",
    "jest": "^29.7.0"
  }
}
```

### `apps/api/src/main.ts`

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // ── CORS ─────────────────────────────────────────────────────────────
  app.enableCors({
    origin: process.env.NEXTAUTH_URL ?? 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Global Prefix ─────────────────────────────────────────────────────
  app.setGlobalPrefix('api');

  // ── Global Pipes — validasi DTO otomatis ─────────────────────────────
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,          // Strip field yang tidak ada di DTO
      forbidNonWhitelisted: true, // Error jika ada field tidak dikenal
      transform: true,          // Auto-transform ke tipe yang benar (string→number)
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Global Filters ────────────────────────────────────────────────────
  app.useGlobalFilters(new HttpExceptionFilter());

  // ── Global Interceptors ───────────────────────────────────────────────
  app.useGlobalInterceptors(new TransformInterceptor());

  // ── Swagger ───────────────────────────────────────────────────────────
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('DRMS PT ASABRI API')
      .setDescription('Document and Record Management System — API Documentation')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
    logger.log('Swagger tersedia di: http://localhost:4000/api/docs');
  }

  const port = process.env.API_PORT ?? 4000;
  await app.listen(port);
  logger.log(`API berjalan di: http://localhost:${port}/api`);
}

bootstrap();
```

### `apps/api/src/app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ArsipModule } from './modules/arsip/arsip.module';
import { RetensiModule } from './modules/retensi/retensi.module';
import { LokasiSimpanModule } from './modules/lokasi-simpan/lokasi-simpan.module';
import { UsulMusnahModule } from './modules/usul-musnah/usul-musnah.module';
import { PerpanjanganRetensiModule } from './modules/perpanjangan-retensi/perpanjangan-retensi.module';
import { StorageModule } from './modules/storage/storage.module';
import { NotifikasiModule } from './modules/notifikasi/notifikasi.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AuditLogModule } from './modules/audit-log/audit-log.module';
import { MasterModule } from './modules/master/master.module';

@Module({
  imports: [
    // ── Config Global ─────────────────────────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),

    // ── Cron Jobs ─────────────────────────────────────────────────────
    ScheduleModule.forRoot(),

    // ── Redis Cache Global ────────────────────────────────────────────
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({
          host: process.env.REDIS_HOST ?? 'localhost',
          port: parseInt(process.env.REDIS_PORT ?? '6379'),
          password: process.env.REDIS_PASSWORD,
        }),
        ttl: parseInt(process.env.REDIS_TTL_SECONDS ?? '3600'),
      }),
    }),

    // ── Core ──────────────────────────────────────────────────────────
    PrismaModule,

    // ── Feature Modules ───────────────────────────────────────────────
    AuthModule,
    UsersModule,
    ArsipModule,
    RetensiModule,
    LokasiSimpanModule,
    UsulMusnahModule,
    PerpanjanganRetensiModule,
    StorageModule,
    NotifikasiModule,
    DashboardModule,
    AuditLogModule,
    MasterModule,
  ],
})
export class AppModule {}
```

### `apps/api/src/prisma/prisma.service.ts`

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@drms/database';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### `apps/api/src/prisma/prisma.module.ts`

```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Global — tersedia di seluruh app tanpa perlu import ulang
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### `apps/api/src/common/decorators/roles.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';
import { Role } from '@drms/shared';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

### `apps/api/src/common/decorators/current-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return data ? user?.[data] : user;
  },
);
```

### `apps/api/src/common/guards/roles.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@drms/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.includes(user.role);
  }
}
```

### `apps/api/src/common/filters/http-exception.filter.ts`

```typescript
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    if (status >= 500) {
      this.logger.error(`${request.method} ${request.url}`, (exception as Error).stack);
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: typeof message === 'object' ? (message as any).message : message,
    });
  }
}
```

### `apps/api/src/common/interceptors/transform.interceptor.ts`

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data: data?.data ?? data,
        message: data?.message,
        meta: data?.meta, // untuk pagination
      })),
    );
  }
}
```

### `apps/api/src/common/interceptors/audit-log.interceptor.ts`

```typescript
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogService } from '../../modules/audit-log/audit-log.service';

const MUTATING_METHODS = ['POST', 'PATCH', 'DELETE', 'PUT'];

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogService: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user, ip, headers } = request;

    if (!MUTATING_METHODS.includes(method) || !user) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(async (responseData) => {
        try {
          // Parse entity type dari URL (misal: /api/arsip/123 → entityType: 'Arsip')
          const urlParts = url.split('/').filter(Boolean);
          const entityType = urlParts[1] ? capitalize(urlParts[1].replace(/-/g, '')) : 'Unknown';
          const entityId = urlParts[2] ?? responseData?.data?.id ?? 'N/A';

          await this.auditLogService.create({
            userId: user.id,
            action: methodToAction(method, url),
            entityType,
            entityId,
            newValue: responseData?.data ?? null,
            ipAddress: ip,
            userAgent: headers['user-agent'],
          });
        } catch (e) {
          // Audit log gagal tidak boleh mengganggu response utama
          console.error('Audit log error:', e);
        }
      }),
    );
  }
}

function methodToAction(method: string, url: string): string {
  if (method === 'POST') return url.includes('approve') ? 'APPROVE' : 'CREATE';
  if (method === 'PATCH') return url.includes('reject') ? 'REJECT' : 'UPDATE';
  if (method === 'DELETE') return 'DELETE';
  return method;
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

### `apps/api/src/modules/auth/auth.service.ts`

```typescript
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import * as ldap from 'ldapjs';

export interface JwtPayload {
  sub: string;       // user.id
  username: string;  // adUsername
  role: string;
  unitKerjaId: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string) {
    // 1. Verifikasi ke LDAP/Active Directory
    const ldapUser = await this.verifyLdap(username, password);
    if (!ldapUser) throw new UnauthorizedException('Username atau password salah');

    // 2. Cari atau buat user lokal
    const user = await this.prisma.user.upsert({
      where: { adUsername: username },
      update: {
        nama: ldapUser.displayName ?? username,
        email: ldapUser.mail ?? `${username}@asabri.co.id`,
        jabatan: ldapUser.title,
        lastLoginAt: new Date(),
      },
      create: {
        adUsername: username,
        nama: ldapUser.displayName ?? username,
        email: ldapUser.mail ?? `${username}@asabri.co.id`,
        jabatan: ldapUser.title,
        nip: ldapUser.employeeID,
        // Unit kerja default — Setum akan assign ulang jika perlu
        unitKerjaId: await this.getDefaultUnitKerjaId(),
      },
      include: { unitKerja: true },
    });

    if (!user.isActive) {
      throw new UnauthorizedException('Akun Anda telah dinonaktifkan');
    }

    // 3. Generate JWT
    const payload: JwtPayload = {
      sub: user.id,
      username: user.adUsername,
      role: user.role,
      unitKerjaId: user.unitKerjaId,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        unitKerja: user.unitKerja,
      },
    };
  }

  private async verifyLdap(username: string, password: string): Promise<Record<string, any> | null> {
    return new Promise((resolve) => {
      const client = ldap.createClient({ url: process.env.LDAP_URL! });

      // Bind dengan service account
      client.bind(process.env.LDAP_BIND_DN!, process.env.LDAP_BIND_CREDENTIALS!, (bindErr) => {
        if (bindErr) {
          this.logger.error('LDAP bind error:', bindErr);
          client.destroy();
          return resolve(null);
        }

        // Cari user di AD
        const opts: ldap.SearchOptions = {
          filter: `(${process.env.LDAP_USERNAME_ATTRIBUTE}=${username})`,
          scope: 'sub',
          attributes: ['displayName', 'mail', 'title', 'employeeID', 'dn'],
        };

        client.search(process.env.LDAP_SEARCH_BASE!, opts, (searchErr, res) => {
          if (searchErr) { client.destroy(); return resolve(null); }

          let userEntry: ldap.SearchEntry | null = null;

          res.on('searchEntry', (entry) => { userEntry = entry; });

          res.on('end', () => {
            if (!userEntry) { client.destroy(); return resolve(null); }

            // Coba bind sebagai user dengan password yang diberikan
            client.bind((userEntry as any).dn, password, (authErr) => {
              client.destroy();
              if (authErr) return resolve(null);
              resolve((userEntry as any).pojo.attributes.reduce(
                (acc: any, attr: any) => ({ ...acc, [attr.type]: attr.values[0] }), {}
              ));
            });
          });
        });
      });
    });
  }

  private async getDefaultUnitKerjaId(): Promise<string> {
    const setum = await this.prisma.unitKerja.findFirst({
      where: { kode: 'BID-SETUM' },
    });
    if (!setum) throw new Error('Unit kerja default tidak ditemukan. Jalankan seed terlebih dahulu.');
    return setum.id;
  }
}
```

### `apps/api/src/modules/arsip/arsip.service.ts`

```typescript
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateArsipDto } from './dto/create-arsip.dto';
import { FilterArsipDto } from './dto/filter-arsip.dto';
import { StatusArsip, Role } from '@drms/shared';
import { addMonths } from 'date-fns';
import { RETENSI_KONDISIONAL } from '@drms/shared';

@Injectable()
export class ArsipService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateArsipDto, userId: string, userUnitKerjaId: string) {
    // Ambil kode klasifikasi untuk kalkulasi retensi
    const kodeKlas = await this.prisma.kodeKlasifikasi.findUnique({
      where: { id: dto.kodeKlasifikasiId },
    });
    if (!kodeKlas) throw new NotFoundException('Kode klasifikasi tidak ditemukan');

    // Kalkulasi tanggal retensi
    const { tanggalAktifBerakhir, tanggalInaktifBerakhir } =
      this.hitungTanggalRetensi(dto.tahun, kodeKlas.retensiAktifBulan, kodeKlas.retensiInaktifBulan, kodeKlas.keterangan);

    return this.prisma.arsip.create({
      data: {
        nomorBerkas: dto.nomorBerkas,
        kodeKlasifikasiId: dto.kodeKlasifikasiId,
        uraianInformasi: dto.uraianInformasi,
        tahun: dto.tahun,
        tingkatPerkembangan: dto.tingkatPerkembangan,
        kondisiFisik: dto.kondisiFisik,
        jumlahBerkas: dto.jumlahBerkas,
        catatan: dto.catatan,
        unitKerjaId: userUnitKerjaId, // Selalu milik unit kerja yang login
        tanggalAktifBerakhir,
        tanggalInaktifBerakhir,
        createdById: userId,
        // Lokasi simpan dibuat sekaligus (kosong dulu, diisi Setum nanti)
        lokasiSimpan: { create: {} },
      },
      include: {
        kodeKlasifikasi: true,
        unitKerja: true,
        lokasiSimpan: true,
        createdBy: { select: { nama: true } },
      },
    });
  }

  async findAll(filter: FilterArsipDto, user: { id: string; role: Role; unitKerjaId: string }) {
    const where: any = {};

    // User biasa hanya bisa lihat arsip unit kerjanya sendiri
    if (user.role === Role.USER || user.role === Role.USER_APPROVAL) {
      where.unitKerjaId = user.unitKerjaId;
    }

    if (filter.unitKerjaId) where.unitKerjaId = filter.unitKerjaId;
    if (filter.status) where.status = filter.status;
    if (filter.tahun) where.tahun = filter.tahun;
    if (filter.kodeKlasifikasiId) where.kodeKlasifikasiId = filter.kodeKlasifikasiId;

    if (filter.search) {
      where.OR = [
        { nomorBerkas: { contains: filter.search, mode: 'insensitive' } },
        { uraianInformasi: { contains: filter.search, mode: 'insensitive' } },
      ];
    }

    const page = filter.page ?? 1;
    const limit = filter.limit ?? 20;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.arsip.findMany({
        where,
        include: {
          kodeKlasifikasi: true,
          unitKerja: true,
          lokasiSimpan: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.arsip.count({ where }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const arsip = await this.prisma.arsip.findUnique({
      where: { id },
      include: {
        kodeKlasifikasi: true,
        unitKerja: true,
        lokasiSimpan: true,
        createdBy: { select: { id: true, nama: true } },
        updatedBy: { select: { id: true, nama: true } },
        usulMusnahs: {
          include: {
            diajukanOleh: { select: { nama: true } },
            approvedOleh: { select: { nama: true } },
            verifikasiSetum: { select: { nama: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        perpanjanganRetensi: {
          include: {
            diajukanOleh: { select: { nama: true } },
            approvedOleh: { select: { nama: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!arsip) throw new NotFoundException('Arsip tidak ditemukan');
    return arsip;
  }

  private hitungTanggalRetensi(
    tahun: number,
    retensiAktifBulan: number,
    retensiInaktifBulan: number,
    keterangan: string,
  ): { tanggalAktifBerakhir: Date | null; tanggalInaktifBerakhir: Date | null } {
    // Jika retensi kondisional (-1), tidak bisa dihitung otomatis
    if (retensiAktifBulan === RETENSI_KONDISIONAL) {
      return { tanggalAktifBerakhir: null, tanggalInaktifBerakhir: null };
    }

    const tanggalDasar = new Date(tahun, 0, 1); // 1 Januari tahun arsip
    const tanggalAktifBerakhir = addMonths(tanggalDasar, retensiAktifBulan);

    if (keterangan === 'PERMANEN' || retensiInaktifBulan === RETENSI_KONDISIONAL) {
      return { tanggalAktifBerakhir, tanggalInaktifBerakhir: null };
    }

    const tanggalInaktifBerakhir = addMonths(tanggalAktifBerakhir, retensiInaktifBulan);
    return { tanggalAktifBerakhir, tanggalInaktifBerakhir };
  }
}
```

### `apps/api/src/modules/retensi/retensi.scheduler.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotifikasiService } from '../notifikasi/notifikasi.service';
import { addDays } from 'date-fns';
import { JenisNotifikasi } from '@drms/shared';

@Injectable()
export class RetensiScheduler {
  private readonly logger = new Logger(RetensiScheduler.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notifikasiService: NotifikasiService,
  ) {}

  // Jalankan setiap hari pukul 23:00
  @Cron('0 23 * * *')
  async handleRetensiCheck() {
    this.logger.log('⏰ Cron retensi berjalan...');
    const today = new Date();
    const hariNotif = parseInt(process.env.NOTIF_HARI_SEBELUM_RETENSI ?? '30');

    await this.updateAktifKeInaktif(today);
    await this.kirimNotifikasiMendekatiAktif(today, hariNotif);
    await this.kirimNotifikasiMendekatiMusnah(today, hariNotif);

    this.logger.log('✅ Cron retensi selesai');
  }

  private async updateAktifKeInaktif(today: Date) {
    const result = await this.prisma.arsip.updateMany({
      where: {
        status: 'AKTIF',
        tanggalAktifBerakhir: { lte: today },
      },
      data: { status: 'INAKTIF' },
    });
    if (result.count > 0) {
      this.logger.log(`→ ${result.count} arsip diubah menjadi INAKTIF`);
    }
  }

  private async kirimNotifikasiMendekatiAktif(today: Date, hariNotif: number) {
    const targetDate = addDays(today, hariNotif);
    const arsipList = await this.prisma.arsip.findMany({
      where: {
        status: 'AKTIF',
        tanggalAktifBerakhir: { gte: today, lte: targetDate },
      },
      include: { unitKerja: { include: { users: true } } },
    });

    for (const arsip of arsipList) {
      for (const user of arsip.unitKerja.users) {
        await this.notifikasiService.create({
          userId: user.id,
          jenis: JenisNotifikasi.RETENSI_AKTIF_BERAKHIR,
          judul: 'Arsip Akan Memasuki Masa Inaktif',
          pesan: `Arsip "${arsip.nomorBerkas}" akan memasuki masa inaktif dalam ${hariNotif} hari.`,
          entityType: 'Arsip',
          entityId: arsip.id,
        });
      }
    }
  }

  private async kirimNotifikasiMendekatiMusnah(today: Date, hariNotif: number) {
    const targetDate = addDays(today, hariNotif);
    const arsipList = await this.prisma.arsip.findMany({
      where: {
        status: 'INAKTIF',
        tanggalInaktifBerakhir: { gte: today, lte: targetDate },
      },
      include: { unitKerja: true },
    });

    // Notif ke User Setum
    const setumUsers = await this.prisma.user.findMany({
      where: { role: 'USER_SETUM', isActive: true },
    });

    for (const arsip of arsipList) {
      for (const setum of setumUsers) {
        await this.notifikasiService.create({
          userId: setum.id,
          jenis: JenisNotifikasi.RETENSI_INAKTIF_BERAKHIR,
          judul: 'Arsip Inaktif Mendekati Masa Musnah',
          pesan: `Arsip "${arsip.nomorBerkas}" dari unit ${arsip.unitKerja.nama} siap dimusnahkan dalam ${hariNotif} hari.`,
          entityType: 'Arsip',
          entityId: arsip.id,
        });
      }
    }
  }
}
```

---

## 6. Setup apps/web (Next.js)

```bash
cd apps/web
```

### `apps/web/package.json`

```json
{
  "name": "@drms/web",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3000",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.3",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "next-auth": "^4.24.7",
    "axios": "^1.7.0",
    "@tanstack/react-query": "^5.40.0",
    "@tanstack/react-query-devtools": "^5.40.0",
    "zustand": "^4.5.2",
    "recharts": "^2.12.0",
    "date-fns": "^3.6.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.3.0",
    "lucide-react": "^0.379.0",
    "react-hook-form": "^7.51.5",
    "@hookform/resolvers": "^3.6.0",
    "zod": "^3.23.8",
    "@drms/shared": "workspace:*"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "typescript": "^5.4.0",
    "tailwindcss": "^3.4.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38"
  }
}
```

### `apps/web/next.config.ts`

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Disable ESLint saat build (jalankan terpisah di CI)
  eslint: { ignoreDuringBuilds: true },

  // Env yang di-expose ke browser
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },

  // Konfigurasi image domain jika ada gambar eksternal
  images: {
    domains: ['localhost'],
  },
};

export default nextConfig;
```

### `apps/web/src/lib/api.ts`

```typescript
import axios from 'axios';
import { getSession, signOut } from 'next-auth/react';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// Interceptor: inject JWT token dari NextAuth session
api.interceptors.request.use(async (config) => {
  const session = await getSession();
  if (session?.accessToken) {
    config.headers.Authorization = `Bearer ${session.accessToken}`;
  }
  return config;
});

// Interceptor: handle 401 → otomatis logout
api.interceptors.response.use(
  (response) => response.data, // Unwrap .data agar caller tidak perlu .data lagi
  async (error) => {
    if (error.response?.status === 401) {
      await signOut({ callbackUrl: '/login' });
    }
    return Promise.reject(error.response?.data ?? error);
  },
);

export default api;
```

### `apps/web/src/lib/auth.ts` (NextAuth Config)

```typescript
import NextAuth, { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import api from './api-server'; // Axios instance tanpa interceptor (server-side only)

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'LDAP',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null;

        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              username: credentials.username,
              password: credentials.password,
            }),
          });

          const result = await response.json();
          if (!response.ok || !result.success) return null;

          return {
            id: result.data.user.id,
            name: result.data.user.nama,
            email: result.data.user.email,
            accessToken: result.data.accessToken,
            role: result.data.user.role,
            unitKerja: result.data.user.unitKerja,
          };
        } catch {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.role = (user as any).role;
        token.unitKerja = (user as any).unitKerja;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      (session.user as any).role = token.role;
      (session.user as any).unitKerja = token.unitKerja;
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 }, // 8 jam
};
```

### `apps/web/src/middleware.ts`

```typescript
export { default } from 'next-auth/middleware';

// Semua route di luar /login dan /api/auth dilindungi
export const config = {
  matcher: ['/((?!login|api/auth|_next/static|_next/image|favicon.ico|logo-asabri.png).*)'],
};
```

### `apps/web/src/lib/utils.ts`

```typescript
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

// Tailwind class merger
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format tanggal ke "12 Januari 2024"
export function formatTanggal(date: Date | string | null): string {
  if (!date) return '-';
  return format(new Date(date), 'd MMMM yyyy', { locale: idLocale });
}

// Format relatif: "3 bulan lalu"
export function formatRelatif(date: Date | string | null): string {
  if (!date) return '-';
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: idLocale });
}

// Format ukuran file: "12.5 MB"
export function formatUkuranFile(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}
```

---

## 7. Setup Docker (PostgreSQL + Redis + MinIO)

### `docker/docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: drms-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: drms_user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: drms_asabri
      PGDATA: /var/lib/postgresql/data/pgdata
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U drms_user -d drms_asabri"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: drms-redis
    restart: unless-stopped
    command: redis-server --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  minio:
    image: minio/minio:latest
    container_name: drms-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"    # S3 API endpoint
      - "9001:9001"    # Web Console
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 20s
      retries: 3

volumes:
  postgres_data:
  redis_data:
  minio_data:
```

### `docker/nginx/nginx.conf`

```nginx
upstream web {
    server web:3000;
}

upstream api {
    server api:4000;
}

server {
    listen 80;
    server_name _;
    client_max_body_size 60M;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # Frontend — Next.js
    location / {
        proxy_pass http://web;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend — NestJS API
    location /api/ {
        proxy_pass http://api;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 8. Setup Prisma Schema & Migration

```bash
# 1. Pastikan Docker services berjalan
pnpm docker:dev

# 2. Generate Prisma client dari schema
pnpm db:generate

# 3. Jalankan migration pertama (buat semua tabel)
pnpm db:migrate:dev
# Saat diminta nama: "init_schema"

# 4. Seed data master (unit kerja, kode klasifikasi, user admin)
pnpm db:seed

# 5. Buka Prisma Studio untuk inspeksi data
pnpm db:studio
```

---

## 9. Boilerplate Code — NestJS Core

### Template Generic Controller

```typescript
// Template yang diikuti oleh SEMUA controller di apps/api
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@drms/shared';

@ApiTags('nama-modul')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('nama-modul')
export class NamaController {
  constructor(private readonly namaService: NamaService) {}

  @Get()
  findAll(@Query() filter: FilterDto, @CurrentUser() user: any) {
    return this.namaService.findAll(filter, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.namaService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateDto, @CurrentUser() user: any) {
    return this.namaService.create(dto, user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateDto, @CurrentUser() user: any) {
    return this.namaService.update(id, dto, user.id);
  }

  @Delete(':id')
  @Roles(Role.USER_SETUM) // Hanya Setum yang bisa delete
  remove(@Param('id') id: string) {
    return this.namaService.remove(id);
  }
}
```

### Template Generic DTO

```typescript
// Create DTO — selalu gunakan class-validator
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatusArsip } from '@drms/shared';

export class CreateArsipDto {
  @ApiProperty({ description: 'Nomor berkas arsip' })
  @IsString()
  @IsNotEmpty()
  nomorBerkas: string;

  @ApiProperty({ description: 'ID kode klasifikasi' })
  @IsString()
  @IsNotEmpty()
  kodeKlasifikasiId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  uraianInformasi?: string;

  @ApiProperty({ description: 'Tahun arsip' })
  @IsInt()
  @Min(1900)
  tahun: number;
}
```

---

## 10. Boilerplate Code — Next.js Core

### Template Custom Hook (React Query)

```typescript
// Template untuk hooks yang fetch data dari API
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from '@/components/ui/toast';

// Hook untuk GET list
export function useArsipList(filter: FilterArsipParams) {
  return useQuery({
    queryKey: ['arsip', filter],
    queryFn: () => api.get('/api/arsip', { params: filter }),
    staleTime: 30 * 1000, // 30 detik
  });
}

// Hook untuk GET single
export function useArsipDetail(id: string) {
  return useQuery({
    queryKey: ['arsip', id],
    queryFn: () => api.get(`/api/arsip/${id}`),
    enabled: Boolean(id),
  });
}

// Hook untuk CREATE
export function useCreateArsip() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateArsipDto) => api.post('/api/arsip', dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arsip'] });
      toast({ title: 'Arsip berhasil ditambahkan', variant: 'success' });
    },
    onError: (error: any) => {
      toast({ title: 'Gagal', description: error?.message, variant: 'destructive' });
    },
  });
}
```

### `apps/web/src/app/layout.tsx`

```typescript
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DRMS — PT ASABRI (Persero)',
  description: 'Sistem Pengelolaan Dokumen dan Arsip',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### `apps/web/src/app/providers.tsx`

```typescript
'use client';

import { SessionProvider } from 'next-auth/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        {children}
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </SessionProvider>
  );
}
```

---

## 11. Perintah Menjalankan Aplikasi

```bash
# ── SETUP PERTAMA KALI ────────────────────────────────────────────────

# 1. Clone & install dependencies
git clone <repo-url> drms-asabri
cd drms-asabri
pnpm install

# 2. Copy environment variables
cp .env.example .env
# Edit .env sesuai konfigurasi lokal / server ASABRI

# 3. Jalankan infrastruktur (PostgreSQL, Redis, MinIO)
pnpm docker:dev

# 4. Generate Prisma client
pnpm db:generate

# 5. Jalankan database migrations
pnpm db:migrate:dev

# 6. Seed data master
pnpm db:seed

# 7. Buat bucket MinIO
# Buka http://localhost:9001 (MinIO Console)
# Login: minioadmin / minioadmin
# Buat bucket baru bernama: drms-arsip


# ── DEVELOPMENT (SEHARI-HARI) ─────────────────────────────────────────

# Jalankan semua services sekaligus (web + api)
pnpm dev

# Jalankan hanya API
pnpm --filter @drms/api dev

# Jalankan hanya Web
pnpm --filter @drms/web dev

# Buka Prisma Studio (inspect database)
pnpm db:studio


# ── DATABASE ──────────────────────────────────────────────────────────

# Buat migration baru setelah mengubah schema.prisma
pnpm db:migrate:dev
# → Ketik nama migration saat diminta, misal: "tambah_kolom_catatan_arsip"

# Apply migration ke production/staging
pnpm db:migrate:deploy

# Reset database (HATI-HATI: hapus semua data!)
pnpm db:reset


# ── BUILD PRODUCTION ──────────────────────────────────────────────────

# Build semua apps
pnpm build

# Build hanya API
pnpm --filter @drms/api build

# Build hanya Web
pnpm --filter @drms/web build


# ── URL DEVELOPMENT ───────────────────────────────────────────────────
# Frontend (Next.js) : http://localhost:3000
# Backend (NestJS)   : http://localhost:4000/api
# Swagger Docs       : http://localhost:4000/api/docs
# Prisma Studio      : http://localhost:5555
# MinIO Console      : http://localhost:9001
# MinIO API          : http://localhost:9000
```
