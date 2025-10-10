import { ApiPropertyOptional } from "@nestjs/swagger";

import {
    IsOptional,
    IsEnum,
    ValidateIf
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
    // @ValidateIf(( o ) => o.spaceType !== null && o.spaceType !== undefined )
    @IsEnum( $Enums.SpaceType )
    // spaceType?: $Enums.SpaceType | null;
    spaceType?: $Enums.SpaceType;

}
