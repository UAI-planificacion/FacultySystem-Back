import { ApiPropertyOptional } from "@nestjs/swagger";

import {
    IsOptional,
    IsString,
    IsEnum
}                   from "class-validator";
import { $Enums }   from "generated/prisma";


export class SpaceTypeDto {

    @ApiPropertyOptional({
        enum        : Object.values( $Enums.SpaceType ),
        description : $Enums.SpaceType.ROOM
    })
    @IsOptional()
    @IsString()
    @IsEnum( $Enums.SpaceType )
    spaceType?: $Enums.SpaceType;

}
