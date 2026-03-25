import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get('summary')
    getSummary(@CurrentUser() user: any) { return this.dashboardService.getSummary(user); }

    @Get('chart/retensi')
    getChartRetensi() { return this.dashboardService.getChartRetensi(); }

    @Get('chart/per-unit-kerja')
    getChartPerUnitKerja() { return this.dashboardService.getChartPerUnitKerja(); }

    @Get('aktivitas-terakhir')
    getAktivitasTerakhir() { return this.dashboardService.getAktivitasTerakhir(); }
}
