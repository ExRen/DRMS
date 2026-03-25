import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { MasterService } from './master.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@drms/shared';

@ApiTags('master')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('master')
export class MasterController {
    constructor(private readonly masterService: MasterService) { }

    @Get('kode-klasifikasi')
    findAllKodeKlasifikasi() { return this.masterService.findAllKodeKlasifikasi(); }

    @Get('kode-klasifikasi/search')
    searchKodeKlasifikasi(@Query('q') query: string) { return this.masterService.searchKodeKlasifikasi(query); }

    @Get('kode-klasifikasi/:id')
    findOneKodeKlasifikasi(@Param('id') id: string) { return this.masterService.findOneKodeKlasifikasi(id); }

    @Post('kode-klasifikasi')
    @Roles(Role.USER_SETUM)
    createKodeKlasifikasi(@Body() data: any) { return this.masterService.createKodeKlasifikasi(data); }

    @Patch('kode-klasifikasi/:id')
    @Roles(Role.USER_SETUM)
    updateKodeKlasifikasi(@Param('id') id: string, @Body() data: any) { return this.masterService.updateKodeKlasifikasi(id, data); }

    @Get('unit-kerja')
    findAllUnitKerja() { return this.masterService.findAllUnitKerja(); }

    @Get('unit-kerja/:id')
    findOneUnitKerja(@Param('id') id: string) { return this.masterService.findOneUnitKerja(id); }
}
