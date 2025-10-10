import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';

import {
    IsArray,
    IsBoolean,
    IsOptional,
    IsString,
    Length,
    ValidateNested
}                   from 'class-validator';
import { Type }     from 'class-transformer';

import { ProfessorIdDto }   from '@commons/dtos/profesorId.dto';
import { SpaceSizeIdDto }   from '@commons/dtos/size.dto';
import { SpaceTypeDto }     from '@commons/dtos/space-type.dto';
import { DayModulesIdDto }   from '@commons/dtos/day-moduleid.dto';
// import { CreateModuleDayDto }   from '@request-sessions/dto/create-module-day.dto';


export class BasicRequestPlanningDto extends IntersectionType(
    ProfessorIdDto,
    SpaceSizeIdDto,
    SpaceTypeDto,
    DayModulesIdDto
) {

    @ApiPropertyOptional({
        description: 'Space ID',
        example    : '201-A'
    })
    @IsOptional()
    @IsString()
    @Length( 0, 255 )
    spaceId?: string;


    @ApiPropertyOptional({
        description : 'If the request is for English',
        default     : false
    })
    @IsOptional()
    @IsBoolean()
    isEnglish: boolean = false;


    @ApiPropertyOptional({
        description : 'If the request is for consecutive sessions',
        default     : false
    })
    @IsOptional()
    @IsBoolean()
    isConsecutive: boolean = false;


    @ApiPropertyOptional({
        description : 'If the request is for afternoon',
        default     : false
    })
    @IsOptional()
    @IsBoolean()
    isAfternoon: boolean = false;


    @ApiPropertyOptional({
        description: 'Additional description',
        example    : 'Additional description'
    })
    @IsOptional()
    @IsString()
    @Length( 0, 255 )
    description?: string;


    // @ApiPropertyOptional({
    //     enum        : Object.values( Building ),
    //     description : 'Building name or identifier'
    // })
    // @IsOptional()
    // @IsString()
    // @IsEnum( Building )
    // building?: Building;


    // @ApiPropertyOptional({
    //     description : 'Module days',
    //     isArray     : true,
    //     type        : [CreateModuleDayDto]
    // })
    // @IsArray()
    // @ValidateNested({ each: true })
    // @IsOptional()
    // @Type(() => CreateModuleDayDto)
    // moduleDays: CreateModuleDayDto[] = [];


    // @ApiPropertyOptional({
    //     description : 'Module days',
    //     isArray     : true,
    //     type        : [DayModulesIdDto]
    // })
    // @IsArray()
    // @ValidateNested({ each: true })
    // @IsOptional()
    // @Type(() => DayModulesIdDto)
    // dayModulesId :DayModulesIdDto[] = [];

}
