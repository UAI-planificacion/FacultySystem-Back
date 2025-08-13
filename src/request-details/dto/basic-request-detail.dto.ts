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
    Min,
    ValidateNested
}               from 'class-validator';
import {
    Size,
    SpaceType,
    Building
}               from 'generated/prisma';
import { Type } from 'class-transformer';

import { CreateModuleDayDto } from '@request-details/dto/create-module-day.dto';


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

    @ApiPropertyOptional({ description: 'Space ID' })
    @IsOptional()
    @IsString()
    @Length( 0, 255 )
    spaceId?: string;

    @ApiPropertyOptional({ description : '01H9XKJ8WXKJ8WXKJ8WXKJ8WX' })
    @IsOptional()
    @IsString()
    @Length( 24, 26 )
    gradeId?: string;

    @ApiPropertyOptional({ description: 'Professor ID' })
    @IsOptional()
    @IsString()
    @Length( 0, 30 )
    professorId?: string;

    @ApiPropertyOptional({
        description : 'Module days',
        isArray     : true,
        type        : [CreateModuleDayDto]
    })
    @IsArray()
    @ValidateNested({ each: true })
    @IsOptional()
    @Type(() => CreateModuleDayDto)
    moduleDays: CreateModuleDayDto[] = [];

}
