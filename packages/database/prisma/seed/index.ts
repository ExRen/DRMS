import { PrismaClient } from '../../generated/client';
import { seedUnitKerja } from './unit-kerja.seed';
import { seedKodeKlasifikasi } from './kode-klasifikasi.seed';
import { seedUserAdmin } from './user-admin.seed';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Mulai seeding database...');

    console.log('  → Seeding unit kerja...');
    await seedUnitKerja(prisma);

    console.log('  → Seeding kode klasifikasi...');
    await seedKodeKlasifikasi(prisma);

    console.log('  → Seeding user admin awal...');
    await seedUserAdmin(prisma);

    console.log('✅ Seeding selesai!');
}

main()
    .catch((e) => {
        console.error('❌ Error saat seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
