import { Module } from '@nestjs/common';
import { RetensiService } from './retensi.service';
import { RetensiController } from './retensi.controller';
import { RetensiScheduler } from './retensi.scheduler';
import { NotifikasiModule } from '../notifikasi/notifikasi.module';

@Module({
    imports: [NotifikasiModule],
    controllers: [RetensiController],
    providers: [RetensiService, RetensiScheduler],
    exports: [RetensiService],
})
export class RetensiModule { }
