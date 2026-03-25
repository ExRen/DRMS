import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { ArsipService } from './arsip.service';
import { CreateArsipDto, UpdateArsipDto, FilterArsipDto } from './dto/arsip.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Role } from '@drms/shared';

@ApiTags('arsip')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('arsip')
export class ArsipController {
    constructor(private readonly arsipService: ArsipService) { }

    @Get()
    findAll(@Query() filter: FilterArsipDto, @CurrentUser() user: any) {
        return this.arsipService.findAll(filter, user);
    }

    @Get(':id')
    findOne(@Param('id') id: string) { return this.arsipService.findOne(id); }

    @Post()
    create(@Body() dto: CreateArsipDto, @CurrentUser() user: any) {
        return this.arsipService.create(dto, user.sub, user.unitKerjaId);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateArsipDto, @CurrentUser() user: any) {
        return this.arsipService.update(id, dto, user.sub);
    }

    @Delete(':id')
    @Roles(Role.USER_SETUM)
    remove(@Param('id') id: string) { return this.arsipService.remove(id); }
}
