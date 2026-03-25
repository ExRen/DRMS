import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
    @ApiProperty({ description: 'Username Active Directory' })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({ description: 'Password Active Directory' })
    @IsString()
    @IsNotEmpty()
    password: string;
}
