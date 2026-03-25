import { IsString, IsNotEmpty, IsOptional, IsInt, Min, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArsipDto {
    @ApiProperty() @IsString() @IsNotEmpty() nomorBerkas: string;
    @ApiProperty() @IsString() @IsNotEmpty() kodeKlasifikasiId: string;
    @ApiPropertyOptional() @IsString() @IsOptional() uraianInformasi?: string;
    @ApiProperty() @IsInt() @Min(1900) tahun: number;
    @ApiPropertyOptional() @IsString() @IsOptional() tanggalArsip?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() tanggalAktifBerakhirManual?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() tanggalInaktifBerakhirManual?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() tingkatPerkembangan?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() kondisiFisik?: string;
    @ApiPropertyOptional() @IsInt() @IsOptional() jumlahBerkas?: number;
    @ApiPropertyOptional() @IsString() @IsOptional() catatan?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() nomorArsip?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() fileDigitalKey?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() fileMimeType?: string;
    @ApiPropertyOptional() @IsInt() @IsOptional() fileUkuranBytes?: number;
    // Lokasi Simpan
    @ApiPropertyOptional() @IsString() @IsOptional() nomorLaci?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() nomorRak?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() nomorBoks?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() nomorFolder?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() keteranganLokasi?: string;
}

export class UpdateArsipDto {
    @ApiPropertyOptional() @IsString() @IsOptional() nomorBerkas?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() uraianInformasi?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() tanggalAktifBerakhirManual?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() tanggalInaktifBerakhirManual?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() tingkatPerkembangan?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() kondisiFisik?: string;
    @ApiPropertyOptional() @IsInt() @IsOptional() jumlahBerkas?: number;
    @ApiPropertyOptional() @IsString() @IsOptional() catatan?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() fileDigitalKey?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() fileMimeType?: string;
    @ApiPropertyOptional() @IsInt() @IsOptional() fileUkuranBytes?: number;
    // Lokasi Simpan
    @ApiPropertyOptional() @IsString() @IsOptional() nomorLaci?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() nomorRak?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() nomorBoks?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() nomorFolder?: string;
    @ApiPropertyOptional() @IsString() @IsOptional() keteranganLokasi?: string;
}

export class FilterArsipDto {
    @ApiPropertyOptional() @IsOptional() status?: string;
    @ApiPropertyOptional() @IsOptional() unitKerjaId?: string;
    @ApiPropertyOptional() @IsOptional() kodeKlasifikasiId?: string;
    @ApiPropertyOptional() @IsOptional() @IsInt() tahun?: number;
    @ApiPropertyOptional() @IsOptional() search?: string;
    @ApiPropertyOptional() @IsOptional() @IsInt() page?: number;
    @ApiPropertyOptional() @IsOptional() @IsInt() limit?: number;
}
