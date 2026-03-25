import { Module } from '@nestjs/common';
import { LokasiSimpanService } from './lokasi-simpan.service';
import { LokasiSimpanController } from './lokasi-simpan.controller';

@Module({
    controllers: [LokasiSimpanController],
    providers: [LokasiSimpanService],
    exports: [LokasiSimpanService],
})
export class LokasiSimpanModule { }
