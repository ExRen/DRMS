import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
    constructor(
        private readonly prisma: PrismaService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    async getSummary(user: { role: string; unitKerjaId: string }) {
        const where = user.role === 'USER_SETUM' ? {} : { unitKerjaId: user.unitKerjaId };

        const [totalArsip, arsipAktif, arsipInaktif, arsipMusnah, arsipPermanen, usulMusnahPending, perpanjanganPending] = await this.prisma.$transaction([
            this.prisma.arsip.count({ where }),
            this.prisma.arsip.count({ where: { ...where, status: 'AKTIF' } }),
            this.prisma.arsip.count({ where: { ...where, status: 'INAKTIF' } }),
            this.prisma.arsip.count({ where: { ...where, status: 'MUSNAH' } }),
            this.prisma.arsip.count({ where: { ...where, status: 'PERMANEN' } }),
            this.prisma.usulMusnah.count({ where: { statusApproval: 'PENDING' } }),
            this.prisma.perpanjanganRetensi.count({ where: { status: 'PENDING' } }),
        ]);

        return { totalArsip, arsipAktif, arsipInaktif, arsipMusnah, arsipPermanen, usulMusnahPending, perpanjanganPending };
    }

    async getChartRetensi() {
        const data = await this.prisma.arsip.groupBy({
            by: ['status'],
            _count: { id: true },
        });
        return data.map((d) => ({ status: d.status, count: d._count.id }));
    }

    async getChartPerUnitKerja() {
        const units = await this.prisma.unitKerja.findMany({
            where: { level: 1 },
            include: { _count: { select: { arsips: true } } },
        });
        return units.map((u) => ({ nama: u.nama, kode: u.kode, count: u._count.arsips }));
    }

    async getAktivitasTerakhir() {
        return this.prisma.auditLog.findMany({
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { nama: true } } },
        });
    }
}
