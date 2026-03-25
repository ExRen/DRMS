import { Controller, Get, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { NotifikasiService } from './notifikasi.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('notifikasi')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('notifikasi')
export class NotifikasiController {
    constructor(private readonly notifikasiService: NotifikasiService) { }

    @Get()
    findAll(@CurrentUser() user: any, @Query('page') page?: string, @Query('limit') limit?: string) {
        return this.notifikasiService.findAll(user.sub, parseInt(page ?? '1', 10), parseInt(limit ?? '20', 10));
    }

    @Get('unread-count')
    getUnreadCount(@CurrentUser() user: any) { return this.notifikasiService.getUnreadCount(user.sub); }

    @Patch(':id/read')
    markAsRead(@Param('id') id: string, @CurrentUser() user: any) { return this.notifikasiService.markAsRead(id, user.sub); }

    @Patch('read-all')
    markAllAsRead(@CurrentUser() user: any) { return this.notifikasiService.markAllAsRead(user.sub); }
}
