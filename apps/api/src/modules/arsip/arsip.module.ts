import { Module } from '@nestjs/common';
import { ArsipService } from './arsip.service';
import { ArsipController } from './arsip.controller';

@Module({
    controllers: [ArsipController],
    providers: [ArsipService],
    exports: [ArsipService],
})
export class ArsipModule { }
