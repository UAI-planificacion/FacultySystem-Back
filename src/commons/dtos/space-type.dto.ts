import { ApiPropertyOptional } from "@nestjs/swagger";

import {
    IsOptional,
    IsEnum,
}                   from "class-validator";
import { $Enums }   from "generated/prisma";


export class SpaceTypeDto {

    @ApiPropertyOptional({
        description : 'Type of space',
        enum        : Object.values( $Enums.SpaceType ),
        example     : $Enums.SpaceType.ROOM,
        nullable    : true
    })
    @IsOptional()
    @IsEnum( $Enums.SpaceType )
    spaceType?: $Enums.SpaceType;

}
