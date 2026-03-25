import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { PerpanjanganRetensiService } from './perpanjangan-retensi.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@drms/shared';

@ApiTags('perpanjangan-retensi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('perpanjangan-retensi')
export class PerpanjanganRetensiController {
    constructor(private readonly perpService: PerpanjanganRetensiService) { }

    @Get()
    findAll(@Query() filter: any, @CurrentUser() user: any) { return this.perpService.findAll(filter, user); }

    @Get(':id')
    findOne(@Param('id') id: string) { return this.perpService.findOne(id); }

    @Post()
    create(@Body() dto: any, @CurrentUser() user: any) { return this.perpService.create(dto, user.sub); }

    @Post(':id/approve')
    @Roles(Role.USER_APPROVAL, Role.USER_SETUM)
    approve(@Param('id') id: string, @CurrentUser() user: any, @Body('catatan') catatan?: string) { return this.perpService.approve(id, user.sub, catatan); }

    @Post(':id/reject')
    @Roles(Role.USER_APPROVAL, Role.USER_SETUM)
    reject(@Param('id') id: string, @CurrentUser() user: any, @Body('alasan') alasan: string) { return this.perpService.reject(id, user.sub, alasan); }
}
