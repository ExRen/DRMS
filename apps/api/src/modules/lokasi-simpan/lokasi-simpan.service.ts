import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LokasiSimpanService {
    constructor(private readonly prisma: PrismaService) { }

    async findByArsipId(arsipId: string) {
        return this.prisma.lokasiSimpan.findUnique({ where: { arsipId }, include: { arsip: true } });
    }

    async create(data: { arsipId: string; nomorLaci?: string; nomorRak?: string; nomorBoks?: string; nomorFolder?: string; keterangan?: string }, setumId: string) {
        return this.prisma.lokasiSimpan.upsert({
            where: { arsipId: data.arsipId },
            update: { ...data, updatedBySetumId: setumId },
            create: { ...data, updatedBySetumId: setumId },
        });
    }

    async update(id: string, data: any, setumId: string) {
        return this.prisma.lokasiSimpan.update({ where: { id }, data: { ...data, updatedBySetumId: setumId } });
    }
}
