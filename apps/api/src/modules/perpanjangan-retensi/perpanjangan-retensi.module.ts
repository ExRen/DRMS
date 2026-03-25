import { Module } from '@nestjs/common';
import { PerpanjanganRetensiService } from './perpanjangan-retensi.service';
import { PerpanjanganRetensiController } from './perpanjangan-retensi.controller';
import { NotifikasiModule } from '../notifikasi/notifikasi.module';

@Module({
    imports: [NotifikasiModule],
    controllers: [PerpanjanganRetensiController],
    providers: [PerpanjanganRetensiService],
    exports: [PerpanjanganRetensiService],
})
export class PerpanjanganRetensiModule { }
