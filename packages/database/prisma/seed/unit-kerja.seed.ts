import { PrismaClient } from '../../generated/client';

export async function seedUnitKerja(prisma: PrismaClient) {
    const divisiData = [
        { kode: 'DIV-SEKPER', nama: 'Sekretariat Perusahaan', level: 1 },
        { kode: 'DIV-SI', nama: 'Divisi Sistem Informasi', level: 1 },
        { kode: 'DIV-SDM', nama: 'Divisi Sumber Daya Manusia', level: 1 },
        { kode: 'DIV-KEU', nama: 'Divisi Keuangan', level: 1 },
        { kode: 'DIV-OPS', nama: 'Divisi Operasional', level: 1 },
        { kode: 'DIV-HKM', nama: 'Divisi Hukum', level: 1 },
        { kode: 'DIV-INV', nama: 'Divisi Investasi', level: 1 },
        { kode: 'DIV-MR', nama: 'Divisi Manajemen Risiko', level: 1 },
        { kode: 'DIV-AI', nama: 'Divisi Audit Internal', level: 1 },
    ];

    for (const divisi of divisiData) {
        await prisma.unitKerja.upsert({
            where: { kode: divisi.kode },
            update: { nama: divisi.nama },
            create: { ...divisi, parentId: null },
        });
    }

    // Bidang (Level 2)
    const sekper = await prisma.unitKerja.findUnique({ where: { kode: 'DIV-SEKPER' } });
    const divSi = await prisma.unitKerja.findUnique({ where: { kode: 'DIV-SI' } });
    const divSdm = await prisma.unitKerja.findUnique({ where: { kode: 'DIV-SDM' } });
    const divKeu = await prisma.unitKerja.findUnique({ where: { kode: 'DIV-KEU' } });
    const divOps = await prisma.unitKerja.findUnique({ where: { kode: 'DIV-OPS' } });

    const bidangData = [
        { kode: 'BID-SETUM', nama: 'Bidang Sekretariat Umum', level: 2, parentId: sekper!.id },
        { kode: 'BID-HUMAS', nama: 'Bidang Hubungan Masyarakat', level: 2, parentId: sekper!.id },
        { kode: 'BID-INFRA', nama: 'Bidang Infrastruktur TI', level: 2, parentId: divSi!.id },
        { kode: 'BID-APPDEV', nama: 'Bidang Pengembangan Aplikasi', level: 2, parentId: divSi!.id },
        { kode: 'BID-ORGSDM', nama: 'Bidang Organisasi & SDM', level: 2, parentId: divSdm!.id },
        { kode: 'BID-DIKLAT', nama: 'Bidang Pendidikan & Pelatihan', level: 2, parentId: divSdm!.id },
        { kode: 'BID-AKTVA', nama: 'Bidang Akuntansi', level: 2, parentId: divKeu!.id },
        { kode: 'BID-TREAS', nama: 'Bidang Treasury', level: 2, parentId: divKeu!.id },
        { kode: 'BID-PELAYANAN', nama: 'Bidang Pelayanan', level: 2, parentId: divOps!.id },
        { kode: 'BID-KEPESERTAAN', nama: 'Bidang Kepesertaan', level: 2, parentId: divOps!.id },
    ];

    for (const bidang of bidangData) {
        await prisma.unitKerja.upsert({
            where: { kode: bidang.kode },
            update: { nama: bidang.nama },
            create: bidang,
        });
    }
}
