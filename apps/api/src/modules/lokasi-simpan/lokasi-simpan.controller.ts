import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { LokasiSimpanService } from './lokasi-simpan.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@drms/shared';

@ApiTags('lokasi-simpan')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('lokasi-simpan')
export class LokasiSimpanController {
    constructor(private readonly lokasiSimpanService: LokasiSimpanService) { }

    @Get(':arsipId')
    findByArsipId(@Param('arsipId') arsipId: string) { return this.lokasiSimpanService.findByArsipId(arsipId); }

    @Post()
    @Roles(Role.USER_SETUM)
    create(@Body() data: any, @CurrentUser() user: any) { return this.lokasiSimpanService.create(data, user.sub); }

    @Patch(':id')
    @Roles(Role.USER_SETUM)
    update(@Param('id') id: string, @Body() data: any, @CurrentUser() user: any) { return this.lokasiSimpanService.update(id, data, user.sub); }
}
