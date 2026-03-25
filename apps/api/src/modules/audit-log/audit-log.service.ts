import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditLogService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(filter: any) {
        const where: any = {};
        if (filter.userId) where.userId = filter.userId;
        if (filter.action) where.action = filter.action;
        if (filter.entityType) where.entityType = filter.entityType;
        if (filter.startDate || filter.endDate) {
            where.createdAt = {};
            if (filter.startDate) where.createdAt.gte = new Date(filter.startDate);
            if (filter.endDate) where.createdAt.lte = new Date(filter.endDate);
        }

        const page = filter.page ?? 1;
        const limit = Math.min(filter.limit ?? 20, 100);

        const [data, total] = await this.prisma.$transaction([
            this.prisma.auditLog.findMany({
                where, include: { user: { select: { id: true, nama: true, role: true } } },
                orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit,
            }),
            this.prisma.auditLog.count({ where }),
        ]);
        return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
    }

    async findOne(id: string) {
        return this.prisma.auditLog.findUnique({
            where: { id }, include: { user: { select: { id: true, nama: true, role: true } } },
        });
    }
}
