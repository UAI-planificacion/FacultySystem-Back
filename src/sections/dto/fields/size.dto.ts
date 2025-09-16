import { ApiPropertyOptional } from "@nestjs/swagger";

import { $Enums }               from "generated/prisma";
import { IsEnum, IsOptional }   from "class-validator";


export class SizeDto {

    @ApiPropertyOptional({
        description: 'Size category of the section.',
        enum: $Enums.SizeValue,
        example: $Enums.SizeValue.M,
    })
    @IsOptional()
    @IsEnum($Enums.SizeValue, {
        message: `Size must be one of the following values: ${Object.values(
            $Enums.SizeValue,
        ).join(', ')}`,
    })
    size?: $Enums.SizeValue;

}