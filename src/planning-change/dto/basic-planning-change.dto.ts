import { ApiProperty, ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';

import {
    IsEnum,
    IsOptional,
    IsString,
    Length,
}                   from 'class-validator';
import { $Enums }   from 'generated/prisma';

import { BasicRequestPlanningDto }  from '@commons/dtos/request-planning.dto';
import { DayModulesIdDto }          from '@commons/dtos/day-moduleid.dto';


export class BasicPlanningChangeDto extends IntersectionType(
    BasicRequestPlanningDto,
    DayModulesIdDto
) {

    @ApiProperty({
        description : 'Title of the planning change',
        example     : 'Planning change title'
    })
    @IsString()
    @Length( 2, 100 )
    title: string;


    @ApiPropertyOptional({
        enum        : Object.values( $Enums.Status ),
        description : 'Status of the planning change',
        example     : $Enums.Status.PENDING
    })
    @IsEnum( $Enums.Status )
    @IsOptional()
    status: $Enums.Status = $Enums.Status.PENDING;


    @ApiPropertyOptional({
        description: 'Session ID',
        example    : '01JCZZ14C9YNV6J4BNK9T1B3YP'
    })
    @IsString()
    @Length( 0, 27 )
    @IsOptional()
    sessionId?: string;


    @ApiPropertyOptional({
        description: 'Section ID',
        example    : '01JCZZ14C9YNV6J4BNK9T1B3YP'
    })
    @IsString()
    @Length( 0, 27 )
    @IsOptional()
    sectionId?: string;


    @ApiProperty({
        enum        : Object.values( $Enums.SessionName ),
        description : 'Session name',
        example     : $Enums.SessionName.C
    })
    @IsEnum( $Enums.SessionName )
    @IsOptional()
    sessionName?: $Enums.SessionName;


    @ApiProperty({
        enum        : Object.values( $Enums.Building ),
        description : 'Building name or identifier'
    })
    @IsEnum( $Enums.Building )
    @IsOptional()
    building?: $Enums.Building;

}
