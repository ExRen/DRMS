import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotifikasiService } from '../notifikasi/notifikasi.service';
import { JenisNotifikasi } from '@drms/shared';

@Injectable()
export class UsulMusnahService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly notifikasiService: NotifikasiService,
    ) { }

    async findAll(filter: any, user: { role: string; unitKerjaId: string }) {
        const where: any = {};
        if (filter.statusApproval) where.statusApproval = filter.statusApproval;
        if (user.role !== 'USER_SETUM') where.arsip = { unitKerjaId: user.unitKerjaId };

        const page = filter.page ?? 1;
        const limit = Math.min(filter.limit ?? 20, 100);
        const [data, total] = await this.prisma.$transaction([
            this.prisma.usulMusnah.findMany({
                where, include: { arsip: { include: { kodeKlasifikasi: true, unitKerja: true } }, diajukanOleh: { select: { nama: true } }, approvedOleh: { select: { nama: true } } },
                orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit,
            }),
            this.prisma.usulMusnah.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findOne(id: string) {
        const usul = await this.prisma.usulMusnah.findUnique({
            where: { id },
            include: {
                arsip: { include: { kodeKlasifikasi: true, unitKerja: true } },
                diajukanOleh: { select: { id: true, nama: true } },
                approvedOleh: { select: { id: true, nama: true } },
                verifikasiSetum: { select: { id: true, nama: true } },
            },
        });
        if (!usul) throw new NotFoundException('Usul musnah tidak ditemukan');
        return usul;
    }

    async create(dto: { arsipId: string; uraianSingkat?: string; fileNotaDinasKey?: string }, userId: string) {
        const arsip = await this.prisma.arsip.findUnique({ where: { id: dto.arsipId }, include: { kodeKlasifikasi: true } });
        if (!arsip) throw new NotFoundException('Arsip tidak ditemukan');
        if (arsip.status !== 'INAKTIF') throw new BadRequestException('Hanya arsip INAKTIF yang bisa diajukan usul musnah');
        if (arsip.kodeKlasifikasi.keterangan === 'PERMANEN') throw new BadRequestException('Arsip PERMANEN tidak bisa dimusnahkan');

        const existing = await this.prisma.usulMusnah.findFirst({
            where: { arsipId: dto.arsipId, OR: [{ statusApproval: 'PENDING' }, { statusApproval: 'DISETUJUI', statusVerifikasiSetum: 'PENDING' }] },
        });
        if (existing) throw new BadRequestException('Arsip ini sudah memiliki usul musnah aktif');

        const usul = await this.prisma.usulMusnah.create({
            data: { arsipId: dto.arsipId, uraianSingkat: dto.uraianSingkat, fileNotaDinasKey: dto.fileNotaDinasKey, masaSimpan: arsip.kodeKlasifikasi.retensiInaktifBulan, diajukanOlehId: userId },
        });

        await this.prisma.arsip.update({ where: { id: dto.arsipId }, data: { status: 'USUL_MUSNAH' } });

        // Notif ke USER_APPROVAL di unit kerja
        const approvers = await this.prisma.user.findMany({ where: { unitKerjaId: arsip.unitKerjaId, role: 'USER_APPROVAL', isActive: true } });
        for (const approver of approvers) {
            await this.notifikasiService.create({ userId: approver.id, jenis: JenisNotifikasi.USUL_MUSNAH_BARU, judul: 'Usul Musnah Baru', pesan: `Pengajuan pemusnahan arsip "${arsip.nomorBerkas}" membutuhkan persetujuan Anda.`, entityType: 'UsulMusnah', entityId: usul.id });
        }
        return usul;
    }

    async approve(id: string, userId: string, penilaian: string) {
        const usul = await this.prisma.usulMusnah.findUnique({ where: { id } });
        if (!usul) throw new NotFoundException();
        if (usul.statusApproval !== 'PENDING') throw new BadRequestException('Usul musnah bukan status PENDING');
        if (usul.diajukanOlehId === userId) throw new ForbiddenException('Tidak bisa approve usul sendiri');

        const updated = await this.prisma.usulMusnah.update({
            where: { id }, data: { statusApproval: 'DISETUJUI', approvedOlehId: userId, penilaianApproval: penilaian, tanggalApproval: new Date() },
        });

        // Notif ke Setum
        const setums = await this.prisma.user.findMany({ where: { role: 'USER_SETUM', isActive: true } });
        for (const setum of setums) {
            await this.notifikasiService.create({ userId: setum.id, jenis: JenisNotifikasi.VERIFIKASI_SETUM_DIBUTUHKAN, judul: 'Verifikasi Usul Musnah Dibutuhkan', pesan: `Usul musnah telah disetujui Tahap 1 dan membutuhkan verifikasi Setum.`, entityType: 'UsulMusnah', entityId: id });
        }
        await this.notifikasiService.create({ userId: usul.diajukanOlehId, jenis: JenisNotifikasi.USUL_MUSNAH_DISETUJUI, judul: 'Usul Musnah Disetujui Tahap 1', pesan: `Usul musnah Anda telah disetujui oleh Kadiv/Kabid. Menunggu verifikasi Setum.`, entityType: 'UsulMusnah', entityId: id });
        return updated;
    }

    async reject(id: string, userId: string, alasan: string) {
        const usul = await this.prisma.usulMusnah.findUnique({ where: { id } });
        if (!usul) throw new NotFoundException();

        await this.prisma.usulMusnah.update({ where: { id }, data: { statusApproval: 'DITOLAK', approvedOlehId: userId, penilaianApproval: alasan, tanggalApproval: new Date() } });
        await this.prisma.arsip.update({ where: { id: usul.arsipId }, data: { status: 'INAKTIF' } });
        await this.notifikasiService.create({ userId: usul.diajukanOlehId, jenis: JenisNotifikasi.USUL_MUSNAH_DITOLAK, judul: 'Usul Musnah Ditolak', pesan: `Usul musnah Anda telah ditolak. Alasan: ${alasan}`, entityType: 'UsulMusnah', entityId: id });
        return { message: 'Usul musnah ditolak' };
    }

    async verify(id: string, userId: string, catatan?: string) {
        const usul = await this.prisma.usulMusnah.findUnique({ where: { id } });
        if (!usul) throw new NotFoundException();
        if (usul.statusApproval !== 'DISETUJUI') throw new BadRequestException('Tahap 1 belum disetujui');

        await this.prisma.usulMusnah.update({ where: { id }, data: { statusVerifikasiSetum: 'DISETUJUI', verifikasiSetumId: userId, catatanSetum: catatan, tanggalVerifikasi: new Date() } });
        await this.prisma.arsip.update({ where: { id: usul.arsipId }, data: { status: 'MUSNAH' } });
        await this.notifikasiService.create({ userId: usul.diajukanOlehId, jenis: JenisNotifikasi.USUL_MUSNAH_DISETUJUI, judul: 'Arsip Telah Dimusnahkan', pesan: `Usul musnah Anda telah diverifikasi Setum. Arsip kini berstatus MUSNAH.`, entityType: 'UsulMusnah', entityId: id });
        return { message: 'Arsip dimusnahkan' };
    }

    async verifyReject(id: string, userId: string, alasan: string) {
        const usul = await this.prisma.usulMusnah.findUnique({ where: { id } });
        if (!usul) throw new NotFoundException();

        await this.prisma.usulMusnah.update({ where: { id }, data: { statusVerifikasiSetum: 'DITOLAK', verifikasiSetumId: userId, catatanSetum: alasan, tanggalVerifikasi: new Date() } });
        await this.prisma.arsip.update({ where: { id: usul.arsipId }, data: { status: 'INAKTIF' } });
        await this.notifikasiService.create({ userId: usul.diajukanOlehId, jenis: JenisNotifikasi.USUL_MUSNAH_DITOLAK, judul: 'Verifikasi Setum Ditolak', pesan: `Verifikasi Setum ditolak. Alasan: ${alasan}`, entityType: 'UsulMusnah', entityId: id });
        return { message: 'Verifikasi ditolak' };
    }
}
