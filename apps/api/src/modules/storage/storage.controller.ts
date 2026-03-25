import { Controller, Get, Post, Delete, Param, UploadedFile, UseInterceptors, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { StorageService } from './storage.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role, MAX_FILE_SIZE_BYTES, ALLOWED_MIME_TYPES } from '@drms/shared';

@ApiTags('storage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('storage')
export class StorageController {
    constructor(private readonly storageService: StorageService) { }

    @Post('upload')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
    async upload(@UploadedFile() file: Express.Multer.File) {
        if (!file) throw new BadRequestException('File wajib diunggah');
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) throw new BadRequestException('Tipe file tidak diperbolehkan');
        const objectName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
        const key = await this.storageService.upload(file, objectName);
        return { key, originalName: file.originalname, contentType: file.mimetype, size: file.size };
    }

    @Get('download/:objectName')
    async download(@Param('objectName') objectName: string) {
        const url = await this.storageService.getPresignedUrl(objectName);
        return { url };
    }

    @Get('upload-url/:objectName')
    async getUploadUrl(@Param('objectName') objectName: string) {
        const url = await this.storageService.getPresignedUploadUrl(objectName);
        return { url };
    }

    @Delete(':objectName')
    @Roles(Role.USER_SETUM)
    async remove(@Param('objectName') objectName: string) {
        await this.storageService.delete(objectName);
        return { message: 'File dihapus' };
    }
}
