import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Length,
    Max,
    Min
}               from 'class-validator';
import { Type } from 'class-transformer';

import { Nivel, Size, SpaceType }   from 'generated/prisma';
import { Building }                 from 'generated/prisma';


export class CreateRequestDetailDto {

    @ApiPropertyOptional({
        description : 'Minimum number of students',
        example     : 20
    })
    @IsOptional()
    @IsInt()
    @Min( 0 )
    @Max( 1000 )
    @Type( () => Number )
    minimum?: number;

    @ApiPropertyOptional({
        description : 'Maximum number of students',
        example     : 30
    })
    @IsOptional()
    @IsInt()
    @Min( 0 )
    @Max( 1000 )
    @Type( () => Number )
    maximum?: number;

    @ApiPropertyOptional({
        enum        : Object.values( SpaceType ),
        description : 'Type of space required'
    })
    @IsOptional()
    @IsString()
    @IsEnum( SpaceType )
    spaceType?: SpaceType;

    @ApiPropertyOptional({
        enum        : Object.values( Size ),
        description : 'Size of the space'
    })
    @IsOptional()
    @IsString()
    @IsEnum( Size )
    spaceSize?: Size;

    @ApiPropertyOptional({ description: 'Cost center ID' })
    @IsOptional()
    @IsString()
    @Length( 0, 255 )
    costCenterId?: string;

    @ApiPropertyOptional({
        description : 'If the request is for the afternoon',
        default     : false
    })
    @IsOptional()
    @IsBoolean()
    inAfternoon: boolean = false;

    @ApiPropertyOptional({
        enum        : Object.values( Building ),
        description : 'Building name or identifier'
    })
    @IsOptional()
    @IsString()
    @IsEnum( Building )
    building?: Building;

    @ApiPropertyOptional({ description: 'Additional description' })
    @IsOptional()
    @IsString()
    @Length( 0, 255 )
    description?: string;

    @ApiPropertyOptional({ description: 'Module ID' })
    @IsOptional()
    @IsUUID()
    moduleId?: string;

    @ApiPropertyOptional({
        type        : [String],
        description : 'Days of the week'
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    days: string[] = [];

    @ApiPropertyOptional({ description: 'Space ID' })
    @IsOptional()
    @IsString()
    @Length( 0, 255 )
    spaceId?: string;

    @ApiPropertyOptional({
        description : 'If this is a priority request',
        default     : false
    })
    @IsOptional()
    @IsBoolean()
    isPriority: boolean = false;

    @ApiPropertyOptional({ 
        enum        : Object.values( Nivel ),
        default     : Nivel.PREGRADO,
        description : 'Education level'
    })
    @IsOptional()
    @IsString()
    @IsEnum( Nivel )
    nivel: Nivel = Nivel.PREGRADO;

    @ApiPropertyOptional({ description: 'Professor ID' })
    @IsOptional()
    @IsString()
    @Length( 0, 26 )
    professorId?: string;

    @ApiProperty({ description: 'Request ID' })
    @IsString()
    @Length( 26, 26 )
    requestId: string;

}
