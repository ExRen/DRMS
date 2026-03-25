import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(page = 1, limit = 20) {
        const [data, total] = await this.prisma.$transaction([
            this.prisma.user.findMany({
                include: { unitKerja: true },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.user.count(),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({ where: { id }, include: { unitKerja: true } });
        if (!user) throw new NotFoundException('User tidak ditemukan');
        return user;
    }

    async updateRole(id: string, role: string) {
        return this.prisma.user.update({ where: { id }, data: { role: role as any } });
    }

    async updateUnitKerja(id: string, unitKerjaId: string) {
        return this.prisma.user.update({ where: { id }, data: { unitKerjaId } });
    }

    async deactivate(id: string, currentUserId: string) {
        if (id === currentUserId) throw new ForbiddenException('Tidak bisa menonaktifkan diri sendiri');
        return this.prisma.user.update({ where: { id }, data: { isActive: false } });
    }

    async activate(id: string) {
        return this.prisma.user.update({ where: { id }, data: { isActive: true } });
    }
}
