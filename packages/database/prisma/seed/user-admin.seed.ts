import { PrismaClient } from '../../generated/client';

export async function seedUserAdmin(prisma: PrismaClient) {
    const setumUnit = await prisma.unitKerja.findUnique({ where: { kode: 'BID-SETUM' } });
    if (!setumUnit) throw new Error('Unit kerja BID-SETUM belum di-seed');

    await prisma.user.upsert({
        where: { adUsername: 'admin.drms' },
        update: {},
        create: {
            adUsername: 'admin.drms',
            nama: 'Administrator DRMS',
            email: 'admin.drms@asabri.co.id',
            role: 'USER_SETUM',
            unitKerjaId: setumUnit.id,
        },
    });
}
