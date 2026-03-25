import { Module } from '@nestjs/common';
import { UsulMusnahService } from './usul-musnah.service';
import { UsulMusnahController } from './usul-musnah.controller';
import { NotifikasiModule } from '../notifikasi/notifikasi.module';

@Module({
    imports: [NotifikasiModule],
    controllers: [UsulMusnahController],
    providers: [UsulMusnahService],
    exports: [UsulMusnahService],
})
export class UsulMusnahModule { }
