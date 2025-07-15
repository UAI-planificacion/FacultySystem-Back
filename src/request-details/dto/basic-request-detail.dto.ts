import { ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Length,
    Max,
    Min
}               from 'class-validator';
import { Type } from 'class-transformer';

import { Level, Size, SpaceType, Building } from 'generated/prisma';


export class BasicRequestDetailDto {

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
    @Length( 0, 3 )
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
        enum        : Object.values( Level ),
        default     : Level.PREGRADO,
        description : 'Education level'
    })
    @IsOptional()
    @IsString()
    @IsEnum( Level )
    level: Level = Level.PREGRADO;

    @ApiPropertyOptional({ description: 'Professor ID' })
    @IsOptional()
    @IsString()
    @Length( 0, 30 )
    professorId?: string;

}
