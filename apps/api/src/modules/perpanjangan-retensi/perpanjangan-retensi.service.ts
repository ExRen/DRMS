import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotifikasiService } from '../notifikasi/notifikasi.service';
import { JenisNotifikasi } from '@drms/shared';
import { addMonths } from 'date-fns';

@Injectable()
export class PerpanjanganRetensiService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notifikasiService: NotifikasiService,
    ) { }

    async findAll(filter: any, user: { role: string; unitKerjaId: string }) {
        const where: any = {};
        if (filter.status) where.status = filter.status;
        if (user.role !== 'USER_SETUM') where.arsip = { unitKerjaId: user.unitKerjaId };

        const page = filter.page ?? 1;
        const limit = Math.min(filter.limit ?? 20, 100);
        const [data, total] = await this.prisma.$transaction([
            this.prisma.perpanjanganRetensi.findMany({
                where, include: { arsip: { include: { kodeKlasifikasi: true, unitKerja: true } }, diajukanOleh: { select: { nama: true } }, approvedOleh: { select: { nama: true } } },
                orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit,
            }),
            this.prisma.perpanjanganRetensi.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findOne(id: string) {
        const perp = await this.prisma.perpanjanganRetensi.findUnique({
            where: { id }, include: { arsip: { include: { kodeKlasifikasi: true, unitKerja: true } }, diajukanOleh: { select: { id: true, nama: true } }, approvedOleh: { select: { id: true, nama: true } } },
        });
        if (!perp) throw new NotFoundException('Perpanjangan retensi tidak ditemukan');
        return perp;
    }

    async create(dto: { arsipId: string; durasiPerpanjanganBulan: number; alasanPerpanjangan: string }, userId: string) {
        const arsip = await this.prisma.arsip.findUnique({ where: { id: dto.arsipId } });
        if (!arsip) throw new NotFoundException('Arsip tidak ditemukan');
        if (arsip.status !== 'INAKTIF') throw new BadRequestException('Hanya arsip INAKTIF yang bisa diperpanjang');

        return this.prisma.perpanjanganRetensi.create({
            data: { arsipId: dto.arsipId, durasiPerpanjanganBulan: dto.durasiPerpanjanganBulan, alasanPerpanjangan: dto.alasanPerpanjangan, diajukanOlehId: userId },
        });
    }

    async approve(id: string, userId: string, catatan?: string) {
        const perp = await this.prisma.perpanjanganRetensi.findUnique({ where: { id }, include: { arsip: true } });
        if (!perp) throw new NotFoundException();
        if (perp.status !== 'PENDING') throw new BadRequestException('Status bukan PENDING');

        const baseTanggal = perp.arsip.tanggalInaktifBerakhir ?? new Date();
        const tanggalBaru = addMonths(baseTanggal, perp.durasiPerpanjanganBulan);

        await this.prisma.$transaction([
            this.prisma.perpanjanganRetensi.update({ where: { id }, data: { status: 'DISETUJUI', approvedOlehId: userId, catatanApproval: catatan, tanggalInaktifBaruBerakhir: tanggalBaru } }),
            this.prisma.arsip.update({ where: { id: perp.arsipId }, data: { tanggalInaktifBerakhir: tanggalBaru } }),
        ]);

        await this.notifikasiService.create({ userId: perp.diajukanOlehId, jenis: JenisNotifikasi.PERPANJANGAN_DISETUJUI, judul: 'Perpanjangan Retensi Disetujui', pesan: `Perpanjangan retensi arsip Anda telah disetujui.`, entityType: 'PerpanjanganRetensi', entityId: id });
        return { message: 'Perpanjangan disetujui' };
    }

    async reject(id: string, userId: string, alasan: string) {
        const perp = await this.prisma.perpanjanganRetensi.findUnique({ where: { id } });
        if (!perp) throw new NotFoundException();

        await this.prisma.perpanjanganRetensi.update({ where: { id }, data: { status: 'DITOLAK', approvedOlehId: userId, catatanApproval: alasan } });
        await this.notifikasiService.create({ userId: perp.diajukanOlehId, jenis: JenisNotifikasi.PERPANJANGAN_DITOLAK, judul: 'Perpanjangan Retensi Ditolak', pesan: `Perpanjangan retensi Anda ditolak. Alasan: ${alasan}`, entityType: 'PerpanjanganRetensi', entityId: id });
        return { message: 'Perpanjangan ditolak' };
    }
}
