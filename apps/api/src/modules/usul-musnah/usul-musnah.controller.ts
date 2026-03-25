import { Controller, Get, Post, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsulMusnahService } from './usul-musnah.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@drms/shared';

@ApiTags('usul-musnah')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('usul-musnah')
export class UsulMusnahController {
    constructor(private readonly usulMusnahService: UsulMusnahService) { }

    @Get()
    findAll(@Query() filter: any, @CurrentUser() user: any) { return this.usulMusnahService.findAll(filter, user); }

    @Get(':id')
    findOne(@Param('id') id: string) { return this.usulMusnahService.findOne(id); }

    @Post()
    create(@Body() dto: any, @CurrentUser() user: any) { return this.usulMusnahService.create(dto, user.sub); }

    @Post(':id/approve')
    @Roles(Role.USER_APPROVAL)
    approve(@Param('id') id: string, @CurrentUser() user: any, @Body('penilaianApproval') penilaian: string) { return this.usulMusnahService.approve(id, user.sub, penilaian); }

    @Post(':id/reject')
    @Roles(Role.USER_APPROVAL)
    reject(@Param('id') id: string, @CurrentUser() user: any, @Body('alasan') alasan: string) { return this.usulMusnahService.reject(id, user.sub, alasan); }

    @Post(':id/verify')
    @Roles(Role.USER_SETUM)
    verify(@Param('id') id: string, @CurrentUser() user: any, @Body('catatanSetum') catatan?: string) { return this.usulMusnahService.verify(id, user.sub, catatan); }

    @Post(':id/verify-reject')
    @Roles(Role.USER_SETUM)
    verifyReject(@Param('id') id: string, @CurrentUser() user: any, @Body('alasan') alasan: string) { return this.usulMusnahService.verifyReject(id, user.sub, alasan); }
}
