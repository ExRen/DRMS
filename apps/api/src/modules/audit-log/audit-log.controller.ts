import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AuditLogService } from './audit-log.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@drms/shared';

@ApiTags('audit-log')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.USER_SETUM)
@Controller('audit-log')
export class AuditLogController {
    constructor(private readonly auditLogService: AuditLogService) { }

    @Get()
    findAll(@Query() filter: any) { return this.auditLogService.findAll(filter); }

    @Get(':id')
    findOne(@Param('id') id: string) { return this.auditLogService.findOne(id); }
}
