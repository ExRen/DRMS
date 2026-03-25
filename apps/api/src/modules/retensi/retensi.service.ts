import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { addDays } from 'date-fns';

@Injectable()
export class RetensiService {
    constructor(private readonly prisma: PrismaService) { }

    async getMendekatiAktifBerakhir(page = 1, limit = 20) {
        const today = new Date();
        const targetDate = addDays(today, 30);
        const where = { status: 'AKTIF' as any, tanggalAktifBerakhir: { gte: today, lte: targetDate } };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.arsip.findMany({
                where, include: { kodeKlasifikasi: true, unitKerja: true },
                orderBy: { tanggalAktifBerakhir: 'asc' }, skip: (page - 1) * limit, take: limit,
            }),
            this.prisma.arsip.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async getMendekatiMusnah(page = 1, limit = 20) {
        const today = new Date();
        const targetDate = addDays(today, 30);
        const where = { status: 'INAKTIF' as any, tanggalInaktifBerakhir: { gte: today, lte: targetDate } };

        const [data, total] = await this.prisma.$transaction([
            this.prisma.arsip.findMany({
                where, include: { kodeKlasifikasi: true, unitKerja: true },
                orderBy: { tanggalInaktifBerakhir: 'asc' }, skip: (page - 1) * limit, take: limit,
            }),
            this.prisma.arsip.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async setTanggalManual(arsipId: string, tanggalAktifBerakhir?: Date, tanggalInaktifBerakhir?: Date) {
        return this.prisma.arsip.update({
            where: { id: arsipId },
            data: { ...(tanggalAktifBerakhir && { tanggalAktifBerakhir }), ...(tanggalInaktifBerakhir && { tanggalInaktifBerakhir }) },
        });
    }
}
