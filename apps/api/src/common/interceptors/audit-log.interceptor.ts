import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrismaService } from '../../prisma/prisma.service';

const MUTATING_METHODS = ['POST', 'PATCH', 'DELETE', 'PUT'];

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
    constructor(private readonly prisma: PrismaService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const request = context.switchToHttp().getRequest();
        const { method, url, user, ip, headers } = request;

        if (!MUTATING_METHODS.includes(method) || !user) {
            return next.handle();
        }

        return next.handle().pipe(
            tap(async (responseData) => {
                try {
                    const urlParts = url.split('/').filter(Boolean);
                    const entityType = urlParts[1] ? capitalize(urlParts[1].replace(/-/g, '')) : 'Unknown';
                    const entityId = urlParts[2] ?? responseData?.data?.id ?? 'N/A';

                    await this.prisma.auditLog.create({
                        data: {
                            userId: user.id ?? user.sub,
                            action: methodToAction(method, url),
                            entityType,
                            entityId: String(entityId),
                            newValue: responseData?.data ?? null,
                            ipAddress: ip,
                            userAgent: headers['user-agent'],
                        },
                    });
                } catch (e) {
                    console.error('Audit log error:', e);
                }
            }),
        );
    }
}

function methodToAction(method: string, url: string): string {
    if (method === 'POST') {
        if (url.includes('approve') || url.includes('verify')) return 'APPROVE';
        if (url.includes('reject')) return 'REJECT';
        return 'CREATE';
    }
    if (method === 'PATCH') return url.includes('reject') ? 'REJECT' : 'UPDATE';
    if (method === 'DELETE') return 'DELETE';
    return method;
}

function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
