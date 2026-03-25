import { Controller, Get, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@drms/shared';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get()
    @Roles(Role.USER_SETUM)
    findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
        return this.usersService.findAll(page, limit);
    }

    @Get(':id')
    @Roles(Role.USER_SETUM)
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Patch(':id/role')
    @Roles(Role.USER_SETUM)
    updateRole(@Param('id') id: string, @Body('role') role: string) {
        return this.usersService.updateRole(id, role);
    }

    @Patch(':id/unit-kerja')
    @Roles(Role.USER_SETUM)
    updateUnitKerja(@Param('id') id: string, @Body('unitKerjaId') unitKerjaId: string) {
        return this.usersService.updateUnitKerja(id, unitKerjaId);
    }

    @Patch(':id/deactivate')
    @Roles(Role.USER_SETUM)
    deactivate(@Param('id') id: string, @CurrentUser() user: any) {
        return this.usersService.deactivate(id, user.sub);
    }

    @Patch(':id/activate')
    @Roles(Role.USER_SETUM)
    activate(@Param('id') id: string) {
        return this.usersService.activate(id);
    }
}
