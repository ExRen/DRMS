import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class NotifikasiService {
    constructor(private readonly prisma: PrismaService) { }

    async create(data: { userId: string; jenis: string; judul: string; pesan: string; entityType?: string; entityId?: string }) {
        return this.prisma.notifikasi.create({ data: { ...data, jenis: data.jenis as any } });
    }

    async findAll(userId: string, page = 1, limit = 20) {
        const [data, total] = await this.prisma.$transaction([
            this.prisma.notifikasi.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: Math.min(limit, 100),
            }),
            this.prisma.notifikasi.count({ where: { userId } }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async getUnreadCount(userId: string) {
        return this.prisma.notifikasi.count({ where: { userId, isRead: false } });
    }

    async markAsRead(id: string, userId: string) {
        return this.prisma.notifikasi.updateMany({ where: { id, userId }, data: { isRead: true } });
    }

    async markAllAsRead(userId: string) {
        return this.prisma.notifikasi.updateMany({ where: { userId, isRead: false }, data: { isRead: true } });
    }
}
