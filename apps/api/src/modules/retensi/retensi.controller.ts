import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RetensiService } from './retensi.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@drms/shared';

@ApiTags('retensi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('retensi')
export class RetensiController {
    constructor(private readonly retensiService: RetensiService) { }

    @Get('mendekati-aktif-berakhir')
    @Roles(Role.USER_SETUM)
    getMendekatiAktifBerakhir(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.retensiService.getMendekatiAktifBerakhir(page, limit);
    }

    @Get('mendekati-musnah')
    @Roles(Role.USER_SETUM)
    getMendekatiMusnah(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.retensiService.getMendekatiMusnah(page, limit);
    }

    @Patch(':arsipId/set-tanggal')
    @Roles(Role.USER_SETUM)
    setTanggalManual(@Param('arsipId') arsipId: string, @Body() body: any) {
        return this.retensiService.setTanggalManual(arsipId, body.tanggalAktifBerakhir, body.tanggalInaktifBerakhir);
    }
}
