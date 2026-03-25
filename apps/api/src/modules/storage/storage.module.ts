import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { memoryStorage } from 'multer';

@Module({
    imports: [MulterModule.register({ storage: memoryStorage() })],
    controllers: [StorageController],
    providers: [StorageService],
    exports: [StorageService],
})
export class StorageModule { }
