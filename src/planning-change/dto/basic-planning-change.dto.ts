import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsEnum,
    IsOptional,
    IsString,
    Length,
}                   from 'class-validator';
import { $Enums }   from 'generated/prisma';

import { BasicRequestPlanningDto }  from '@commons/dtos/request-planning.dto';


export class BasicPlanningChangeDto extends BasicRequestPlanningDto {

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


    @ApiProperty({
        enum        : Object.values( $Enums.SessionName ),
        description : 'Session name',
        example     : $Enums.SessionName.C
    })
    @IsEnum( $Enums.SessionName )
    sessionName: $Enums.SessionName;

}
