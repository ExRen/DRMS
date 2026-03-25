import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MasterService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    async findAllKodeKlasifikasi() {
        const cacheKey = 'master:kode-klasifikasi:all';
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;

        const data = await this.prisma.kodeKlasifikasi.findMany({ orderBy: [{ noUrut: 'asc' }, { kode: 'asc' }] });
        await this.cacheManager.set(cacheKey, data, 3600);
        return data;
    }

    async findOneKodeKlasifikasi(id: string) {
        return this.prisma.kodeKlasifikasi.findUnique({ where: { id } });
    }

    async searchKodeKlasifikasi(query: string) {
        return this.prisma.kodeKlasifikasi.findMany({
            where: {
                OR: [
                    { kode: { contains: query, mode: 'insensitive' } },
                    { jenisArsip: { contains: query, mode: 'insensitive' } },
                    { kategori: { contains: query, mode: 'insensitive' } },
                ],
            },
            take: 20,
        });
    }

    async createKodeKlasifikasi(data: any) {
        await this.cacheManager.del('master:kode-klasifikasi:all');
        return this.prisma.kodeKlasifikasi.create({ data });
    }

    async updateKodeKlasifikasi(id: string, data: any) {
        await this.cacheManager.del('master:kode-klasifikasi:all');
        return this.prisma.kodeKlasifikasi.update({ where: { id }, data });
    }

    async findAllUnitKerja() {
        const cacheKey = 'master:unit-kerja:all';
        const cached = await this.cacheManager.get(cacheKey);
        if (cached) return cached;

        const data = await this.prisma.unitKerja.findMany({
            include: { children: true, parent: true },
            orderBy: [{ level: 'asc' }, { kode: 'asc' }],
        });
        await this.cacheManager.set(cacheKey, data, 3600);
        return data;
    }

    async findOneUnitKerja(id: string) {
        return this.prisma.unitKerja.findUnique({ where: { id }, include: { children: true, parent: true, users: true } });
    }
}
