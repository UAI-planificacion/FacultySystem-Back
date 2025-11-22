import {
    ArrayMinSize,
    ArrayNotEmpty,
    ArrayUnique,
    IsArray,
    IsString,
} from "class-validator";

import { ApiProperty } from "@nestjs/swagger";


export class CleanSectionDto {

    @ApiProperty({
        description: 'An array of Section IDs to reset. All IDs must be unique.',
        example: ['1', '2', '3'],
        type: [String],
    })
    @IsArray()
    @ArrayNotEmpty()
    @ArrayMinSize( 1 )
    @ArrayUnique()
    @IsString({ each: true })
    ids: string[];

}
