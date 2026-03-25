import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';

@Injectable()
export class StorageService {
    private minioClient: Minio.Client;
    private bucketName: string;
    private readonly logger = new Logger(StorageService.name);

    constructor(private readonly configService: ConfigService) {
        this.minioClient = new Minio.Client({
            endPoint: this.configService.get('MINIO_ENDPOINT', 'localhost'),
            port: parseInt(this.configService.get('MINIO_PORT', '9000')),
            useSSL: this.configService.get('MINIO_USE_SSL', 'false') === 'true',
            accessKey: this.configService.getOrThrow('MINIO_ACCESS_KEY'),
            secretKey: this.configService.getOrThrow('MINIO_SECRET_KEY'),
        });
        this.bucketName = this.configService.get('MINIO_BUCKET_NAME', 'drms-arsip');
    }

    async upload(file: Express.Multer.File, objectName: string): Promise<string> {
        await this.ensureBucket();
        await this.minioClient.putObject(this.bucketName, objectName, file.buffer, file.size, {
            'Content-Type': file.mimetype,
        });
        this.logger.log(`File uploaded: ${objectName}`);
        return objectName;
    }

    async getPresignedUrl(objectName: string): Promise<string> {
        const expiry = parseInt(this.configService.get('MINIO_PRESIGNED_EXPIRY_SECONDS', '3600'));
        return this.minioClient.presignedGetObject(this.bucketName, objectName, expiry);
    }

    async getPresignedUploadUrl(objectName: string): Promise<string> {
        return this.minioClient.presignedPutObject(this.bucketName, objectName, 3600);
    }

    async delete(objectName: string): Promise<void> {
        await this.minioClient.removeObject(this.bucketName, objectName);
        this.logger.log(`File deleted: ${objectName}`);
    }

    private async ensureBucket() {
        const exists = await this.minioClient.bucketExists(this.bucketName);
        if (!exists) {
            await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
            this.logger.log(`Bucket created: ${this.bucketName}`);
        }
    }
}
