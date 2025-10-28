import { ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';

import {
    IsBoolean,
    IsOptional,
    IsString,
    Length,
} from 'class-validator';

import { ProfessorIdDto }   from '@commons/dtos/profesorId.dto';
import { SpaceSizeIdDto }   from '@commons/dtos/size.dto';
import { SpaceTypeDto }     from '@commons/dtos/space-type.dto';


export class BasicRequestPlanningDto extends IntersectionType(
    ProfessorIdDto,
    SpaceSizeIdDto,
    SpaceTypeDto,
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
    inAfternoon: boolean = false;


    @ApiPropertyOptional({
        description: 'Additional description',
        example    : 'Additional description'
    })
    @IsOptional()
    @IsString()
    @Length( 0, 255 )
    description?: string;

}
