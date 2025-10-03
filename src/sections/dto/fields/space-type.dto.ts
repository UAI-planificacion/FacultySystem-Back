import { ApiPropertyOptional } from "@nestjs/swagger";

import {
    IsOptional,
    IsString,
    IsEnum,
    ValidateIf
}                   from "class-validator";
import { $Enums }   from "generated/prisma";


export class SpaceTypeDto {

    @ApiPropertyOptional({
        enum        : Object.values( $Enums.SpaceType ),
        description : $Enums.SpaceType.ROOM,
        nullable    : true
    })
    @IsOptional()
    @ValidateIf(( o ) => o.spaceType !== null && o.spaceType !== undefined )
    @IsEnum( $Enums.SpaceType )
    spaceType?: $Enums.SpaceType | null;

}
