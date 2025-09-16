import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
} from 'class-validator';


export enum DayNameDto {
    Lunes       = 'Lunes',
    Martes      = 'Martes',
    Miercoles   = 'Miercoles',
    Jueves      = 'Jueves',
    Viernes     = 'Viernes',
    Sabado      = 'Sabado',
    Domingo     = 'Domingo',
}


export class CreateDayDto {
    @ApiProperty({
        description: 'The name of the day.',
        enum: DayNameDto,
        example: DayNameDto.Lunes,
    })
    @IsNotEmpty()
    @IsEnum(DayNameDto)
    name: DayNameDto;

    @ApiPropertyOptional({
        description: 'An optional short name or abbreviation for the day (e.g., "Lun").',
        example: 'Lun',
        maxLength: 5,
    })
    @IsOptional()
    @IsString()
    @MaxLength(5)
    shortName?: string;

    @ApiPropertyOptional({
        description: 'An optional medium-length name for the day (e.g., "Lunes").',
        example: 'Lunes',
        maxLength: 10,
    })
    @IsOptional()
    @IsString()
    @MaxLength(10)
    mediumName?: string;
}

