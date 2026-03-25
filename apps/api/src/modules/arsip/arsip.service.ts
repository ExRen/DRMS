import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateArsipDto, UpdateArsipDto, FilterArsipDto } from './dto/arsip.dto';
import { Role } from '@drms/shared';
import { addMonths } from 'date-fns';
import { RETENSI_KONDISIONAL } from '@drms/shared';

@Injectable()
export class ArsipService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CreateArsipDto, userId: string, userUnitKerjaId: string) {
        const kodeKlas = await this.prisma.kodeKlasifikasi.findUnique({ where: { id: dto.kodeKlasifikasiId } });
        if (!kodeKlas) throw new NotFoundException('Kode klasifikasi tidak ditemukan');

        // Use tanggalArsip date if provided, fallback to tahun year
        const tanggalDasar = dto.tanggalArsip ? new Date(dto.tanggalArsip) : new Date(dto.tahun, 0, 1);
        const tahun = dto.tanggalArsip ? tanggalDasar.getFullYear() : dto.tahun;

        // Calculate retensi dates or use manual overrides
        let { tanggalAktifBerakhir, tanggalInaktifBerakhir } =
            this.hitungTanggalRetensi(tanggalDasar, kodeKlas.retensiAktifBulan, kodeKlas.retensiInaktifBulan, kodeKlas.keterangan);

        // Allow manual override of dates
        if (dto.tanggalAktifBerakhirManual) {
            tanggalAktifBerakhir = new Date(dto.tanggalAktifBerakhirManual);
        }
        if (dto.tanggalInaktifBerakhirManual) {
            tanggalInaktifBerakhir = new Date(dto.tanggalInaktifBerakhirManual);
        }

        // Extract lokasi simpan fields
        const lokasiData: any = {};
        if (dto.nomorLaci) lokasiData.nomorLaci = dto.nomorLaci;
        if (dto.nomorRak) lokasiData.nomorRak = dto.nomorRak;
        if (dto.nomorBoks) lokasiData.nomorBoks = dto.nomorBoks;
        if (dto.nomorFolder) lokasiData.nomorFolder = dto.nomorFolder;
        if (dto.keteranganLokasi) lokasiData.keterangan = dto.keteranganLokasi;

        return this.prisma.arsip.create({
            data: {
                nomorArsip: dto.nomorArsip,
                nomorBerkas: dto.nomorBerkas,
                kodeKlasifikasiId: dto.kodeKlasifikasiId,
                uraianInformasi: dto.uraianInformasi,
                tahun,
                tingkatPerkembangan: (dto.tingkatPerkembangan as any) ?? 'ASLI',
                kondisiFisik: (dto.kondisiFisik as any) ?? 'BAIK',
                jumlahBerkas: dto.jumlahBerkas ?? 1,
                catatan: dto.catatan,
                unitKerjaId: userUnitKerjaId,
                tanggalAktifBerakhir,
                tanggalInaktifBerakhir,
                fileDigitalKey: dto.fileDigitalKey,
                fileMimeType: dto.fileMimeType,
                fileUkuranBytes: dto.fileUkuranBytes,
                createdById: userId,
                lokasiSimpan: { create: lokasiData },
            },
            include: { kodeKlasifikasi: true, unitKerja: true, lokasiSimpan: true, createdBy: { select: { nama: true } } },
        });
    }

    async findAll(filter: FilterArsipDto, user: { id: string; role: string; unitKerjaId: string }) {
        const where: any = {};

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
        const limit = Math.min(filter.limit ?? 20, 100);

        const [data, total] = await this.prisma.$transaction([
            this.prisma.arsip.findMany({
                where,
                include: { kodeKlasifikasi: true, unitKerja: true, lokasiSimpan: true },
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
                kodeKlasifikasi: true, unitKerja: true, lokasiSimpan: true,
                createdBy: { select: { id: true, nama: true } },
                updatedBy: { select: { id: true, nama: true } },
                usulMusnahs: { include: { diajukanOleh: { select: { nama: true } }, approvedOleh: { select: { nama: true } }, verifikasiSetum: { select: { nama: true } } }, orderBy: { createdAt: 'desc' }, take: 5 },
                perpanjanganRetensi: { include: { diajukanOleh: { select: { nama: true } }, approvedOleh: { select: { nama: true } } }, orderBy: { createdAt: 'desc' } },
            },
        });
        if (!arsip) throw new NotFoundException('Arsip tidak ditemukan');
        return arsip;
    }

    async update(id: string, dto: UpdateArsipDto, userId: string) {
        const arsip = await this.prisma.arsip.findUnique({ where: { id }, include: { lokasiSimpan: true } });
        if (!arsip) throw new NotFoundException('Arsip tidak ditemukan');
        if (arsip.status !== 'AKTIF') throw new ForbiddenException('Arsip hanya bisa diedit saat berstatus AKTIF');

        // Build update data without lokasi fields
        const { nomorLaci, nomorRak, nomorBoks, nomorFolder, keteranganLokasi, tanggalAktifBerakhirManual, tanggalInaktifBerakhirManual, ...arsipData } = dto;

        const updateData: any = { ...arsipData, updatedById: userId };
        if (arsipData.tingkatPerkembangan) updateData.tingkatPerkembangan = arsipData.tingkatPerkembangan as any;
        if (arsipData.kondisiFisik) updateData.kondisiFisik = arsipData.kondisiFisik as any;

        // Handle manual date overrides
        if (tanggalAktifBerakhirManual) updateData.tanggalAktifBerakhir = new Date(tanggalAktifBerakhirManual);
        if (tanggalInaktifBerakhirManual) updateData.tanggalInaktifBerakhir = new Date(tanggalInaktifBerakhirManual);

        // Update lokasi simpan if provided
        if (nomorLaci !== undefined || nomorRak !== undefined || nomorBoks !== undefined || nomorFolder !== undefined || keteranganLokasi !== undefined) {
            const lokasiUpdate: any = {};
            if (nomorLaci !== undefined) lokasiUpdate.nomorLaci = nomorLaci;
            if (nomorRak !== undefined) lokasiUpdate.nomorRak = nomorRak;
            if (nomorBoks !== undefined) lokasiUpdate.nomorBoks = nomorBoks;
            if (nomorFolder !== undefined) lokasiUpdate.nomorFolder = nomorFolder;
            if (keteranganLokasi !== undefined) lokasiUpdate.keterangan = keteranganLokasi;

            if (arsip.lokasiSimpan) {
                await this.prisma.lokasiSimpan.update({ where: { id: arsip.lokasiSimpan.id }, data: lokasiUpdate });
            } else {
                await this.prisma.lokasiSimpan.create({ data: { arsipId: id, ...lokasiUpdate } });
            }
        }

        return this.prisma.arsip.update({
            where: { id },
            data: updateData,
            include: { kodeKlasifikasi: true, unitKerja: true, lokasiSimpan: true },
        });
    }

    async remove(id: string) {
        return this.prisma.arsip.update({ where: { id }, data: { status: 'MUSNAH' } });
    }

    private hitungTanggalRetensi(tanggalDasar: Date, retensiAktifBulan: number, retensiInaktifBulan: number, keterangan: string) {
        if (retensiAktifBulan === RETENSI_KONDISIONAL) return { tanggalAktifBerakhir: null, tanggalInaktifBerakhir: null };

        const tanggalAktifBerakhir = addMonths(tanggalDasar, retensiAktifBulan);

        if (keterangan === 'PERMANEN' || retensiInaktifBulan === RETENSI_KONDISIONAL) {
            return { tanggalAktifBerakhir, tanggalInaktifBerakhir: null };
        }

        return { tanggalAktifBerakhir, tanggalInaktifBerakhir: addMonths(tanggalAktifBerakhir, retensiInaktifBulan) };
    }
}
