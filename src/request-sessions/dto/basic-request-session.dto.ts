import { ApiProperty } from '@nestjs/swagger';

import {
    IsEnum,
    IsString,
}                   from 'class-validator';
import { $Enums }   from 'generated/prisma';

import { BasicRequestPlanningDto } from '@commons/dtos/request-planning.dto';


export class BasicRequestSessionDto extends BasicRequestPlanningDto {

    @ApiProperty({
        enum        : Object.values( $Enums.SessionName ),
        description : 'Type of space',
        example     : $Enums.SessionName.C
    })
    @IsEnum( $Enums.SessionName )
    @IsString()
    session: $Enums.SessionName;

}
