import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    login(@Body() dto: LoginDto) {
        return this.authService.login(dto.username, dto.password);
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    logout() {
        return { message: 'Logout berhasil' };
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    getProfile(@CurrentUser() user: any) {
        return this.authService.getProfile(user.sub);
    }

    @Post('refresh')
    @UseGuards(JwtAuthGuard)
    refresh(@CurrentUser() user: any) {
        return this.authService.login(user.username, '');
    }
}
