import { ApiProperty } from "@nestjs/swagger";

import {
    IsInt,
    IsNotEmpty,
    Max,
    Min
}               from "class-validator";
import { Type } from "class-transformer";


export class CodeDto {

    @ApiProperty({
        description: 'The code of the section.',
        example: 101,
    })
    @Type(() => Number)
    @IsInt({ message: 'Section code must be an integer.' })
    @Min(1, { message: 'Section code must be a positive integer.' })
    @Max( 1000, { message: 'Section code cannot exceed 1000.' } )
    @IsNotEmpty({ message: 'Section code is required.' })
    code: number;

}
