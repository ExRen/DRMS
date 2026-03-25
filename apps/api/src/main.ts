import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
    const logger = new Logger('Bootstrap');
    const app = await NestFactory.create(AppModule);

    // ── CORS ─────────────────────────────────────────────────────────────
    app.enableCors({
        origin: process.env.NEXTAUTH_URL ?? 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });

    // ── Global Prefix ─────────────────────────────────────────────────────
    app.setGlobalPrefix('api');

    // ── Global Pipes — validasi DTO otomatis ─────────────────────────────
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: { enableImplicitConversion: true },
        }),
    );

    // ── Global Filters ────────────────────────────────────────────────────
    app.useGlobalFilters(new HttpExceptionFilter());

    // ── Global Interceptors ───────────────────────────────────────────────
    app.useGlobalInterceptors(new TransformInterceptor());

    // ── Swagger ───────────────────────────────────────────────────────────
    if (process.env.NODE_ENV !== 'production') {
        const config = new DocumentBuilder()
            .setTitle('DRMS PT ASABRI API')
            .setDescription('Document and Record Management System — API Documentation')
            .setVersion('1.0')
            .addBearerAuth()
            .build();
        const document = SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api/docs', app, document);
        logger.log('Swagger tersedia di: http://localhost:4000/api/docs');
    }

    const port = process.env.API_PORT ?? 4000;
    await app.listen(port);
    logger.log(`API berjalan di: http://localhost:${port}/api`);
}

bootstrap();
