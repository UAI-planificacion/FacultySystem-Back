import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsEnum,
    IsArray,
    IsOptional,
    ArrayNotEmpty,
    ArrayMinSize
}                   from 'class-validator';
import { Type }     from 'class-transformer';
import { $Enums }   from "generated/prisma";



export class CalculateAvailabilityDto {

    @ApiProperty({
        description: 'Nombre de la sesión para calcular disponibilidad',
        enum: $Enums.SessionName,
        example: 'C',
    })
    @IsEnum($Enums.SessionName, { message: 'session debe ser un valor válido de SessionName' })
    session: $Enums.SessionName;


    @ApiPropertyOptional({
        description: 'Edificio para filtrar espacios (uno de los dos: building o spaceIds)',
        enum: $Enums.Building,
        example: 'PREGRADO_A',
    })
    @IsOptional()
    @IsEnum($Enums.Building, { message: 'building debe ser un valor válido de Building' })
    building?: $Enums.Building;


    @ApiPropertyOptional({
        description: 'IDs de espacios específicos (uno de los dos: building o spaceIds)',
        type: [String],
        example: ['space-id-1', 'space-id-2'],
    })
    @IsOptional()
    @IsArray({ message: 'spaceIds debe ser un array' })
    @ArrayNotEmpty({ message: 'spaceIds no puede estar vacío si se proporciona' })
    spaceIds?: string[];


    @ApiPropertyOptional({
        description: 'Tipo de espacio para filtrar (uno de los dos: spaceType o spaceSize)',
        enum: $Enums.SpaceType,
        example: 'ROOM',
    })
    @IsOptional()
    @IsEnum($Enums.SpaceType, { message: 'spaceType debe ser un valor válido de SpaceType' })
    spaceType?: $Enums.SpaceType;


    @ApiPropertyOptional({
        description: 'Tamaño de espacio para filtrar (uno de los dos: spaceType o spaceSize)',
        enum: $Enums.SizeValue,
        example: 'M',
    })
    @IsOptional()
    @IsEnum($Enums.SizeValue, { message: 'spaceSize debe ser un valor válido de SizeValue' })
    spaceSize?: $Enums.SizeValue;


    @ApiPropertyOptional({
        description: 'IDs de profesores para verificar disponibilidad',
        type: [String],
        example: ['prof-id-1', 'prof-id-2'],
    })
    @IsOptional()
    @IsArray({ message: 'professorIds debe ser un array' })
    professorIds?: string[];


    @ApiProperty({
        description: 'IDs de módulos de día para verificar disponibilidad',
        type: [Number],
        example: [1, 2, 3],
    })
    @IsArray({ message: 'dayModuleIds debe ser un array' })
    @ArrayNotEmpty({ message: 'dayModuleIds no puede estar vacío' })
    @ArrayMinSize(1, { message: 'dayModuleIds debe tener al menos un elemento' })
    @Type(() => Number)
    dayModuleIds: number[];

}
