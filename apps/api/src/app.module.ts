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
            envFilePath: ['.env', '../../.env'],
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
                    password: process.env.REDIS_PASSWORD || undefined,
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
export class AppModule { }
