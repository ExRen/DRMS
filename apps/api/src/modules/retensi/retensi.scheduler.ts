import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { NotifikasiService } from '../notifikasi/notifikasi.service';
import { addDays } from 'date-fns';
import { JenisNotifikasi } from '@drms/shared';

@Injectable()
export class RetensiScheduler {
    private readonly logger = new Logger(RetensiScheduler.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly notifikasiService: NotifikasiService,
    ) { }

    @Cron('0 23 * * *')
    async handleRetensiCheck() {
        this.logger.log('⏰ Cron retensi berjalan...');
        const today = new Date();
        const hariNotif = parseInt(process.env.NOTIF_HARI_SEBELUM_RETENSI ?? '30');

        await this.updateAktifKeInaktif(today);
        await this.tandaiPermanen();
        await this.kirimNotifikasiMendekatiAktif(today, hariNotif);
        await this.kirimNotifikasiMendekatiMusnah(today, hariNotif);

        this.logger.log('✅ Cron retensi selesai');
    }

    private async updateAktifKeInaktif(today: Date) {
        const result = await this.prisma.arsip.updateMany({
            where: { status: 'AKTIF', tanggalAktifBerakhir: { lte: today } },
            data: { status: 'INAKTIF' },
        });
        if (result.count > 0) this.logger.log(`→ ${result.count} arsip diubah menjadi INAKTIF`);
    }

    private async tandaiPermanen() {
        const result = await this.prisma.arsip.updateMany({
            where: {
                status: 'INAKTIF',
                tanggalInaktifBerakhir: null,
                kodeKlasifikasi: { keterangan: 'PERMANEN' },
            },
            data: { status: 'PERMANEN' },
        });
        if (result.count > 0) this.logger.log(`→ ${result.count} arsip ditandai PERMANEN`);
    }

    private async kirimNotifikasiMendekatiAktif(today: Date, hariNotif: number) {
        const targetDate = addDays(today, hariNotif);
        const arsipList = await this.prisma.arsip.findMany({
            where: { status: 'AKTIF', tanggalAktifBerakhir: { gte: today, lte: targetDate } },
            include: { unitKerja: { include: { users: true } } },
        });

        for (const arsip of arsipList) {
            for (const user of arsip.unitKerja.users) {
                await this.notifikasiService.create({
                    userId: user.id,
                    jenis: JenisNotifikasi.RETENSI_AKTIF_BERAKHIR,
                    judul: 'Arsip Akan Memasuki Masa Inaktif',
                    pesan: `Arsip "${arsip.nomorBerkas}" akan memasuki masa inaktif dalam ${hariNotif} hari.`,
                    entityType: 'Arsip',
                    entityId: arsip.id,
                });
            }
        }
    }

    private async kirimNotifikasiMendekatiMusnah(today: Date, hariNotif: number) {
        const targetDate = addDays(today, hariNotif);
        const arsipList = await this.prisma.arsip.findMany({
            where: { status: 'INAKTIF', tanggalInaktifBerakhir: { gte: today, lte: targetDate } },
            include: { unitKerja: true },
        });

        const setumUsers = await this.prisma.user.findMany({ where: { role: 'USER_SETUM', isActive: true } });

        for (const arsip of arsipList) {
            for (const setum of setumUsers) {
                await this.notifikasiService.create({
                    userId: setum.id,
                    jenis: JenisNotifikasi.RETENSI_INAKTIF_BERAKHIR,
                    judul: 'Arsip Inaktif Mendekati Masa Musnah',
                    pesan: `Arsip "${arsip.nomorBerkas}" dari unit ${arsip.unitKerja.nama} siap dimusnahkan dalam ${hariNotif} hari.`,
                    entityType: 'Arsip',
                    entityId: arsip.id,
                });
            }
        }
    }
}
