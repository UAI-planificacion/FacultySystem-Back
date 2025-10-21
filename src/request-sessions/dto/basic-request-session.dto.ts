import { ApiProperty } from '@nestjs/swagger';

import { IsEnum }   from 'class-validator';
import { $Enums }   from 'generated/prisma';

import { BasicRequestPlanningDto } from '@commons/dtos/request-planning.dto';


export class BasicRequestSessionDto extends BasicRequestPlanningDto {

    @ApiProperty({
        enum        : Object.values( $Enums.SessionName ),
        description : 'Type of space',
        example     : $Enums.SessionName.C
    })
    @IsEnum( $Enums.SessionName )
    session: $Enums.SessionName;


    @ApiProperty({
        enum        : Object.values( $Enums.Building ),
        description : 'Building name or identifier'
    })
    @IsEnum( $Enums.Building )
    building: $Enums.Building;

}
