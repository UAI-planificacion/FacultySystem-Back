import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import {
    IsInt,
    Min,
    Max,
    IsNotEmpty,
}               from 'class-validator';
import { Type } from 'class-transformer';

import { SpaceSizeIdDto }   from '@sections/dto/fields/size.dto';
import { ProfessorIdDto }   from '@sections/dto/fields/profesorId.dto';
import { SpaceTypeDto }     from '@sections/dto/fields/space-type.dto';


export class BasicSectionDto extends IntersectionType(
    SpaceSizeIdDto,
    ProfessorIdDto,
    SpaceTypeDto
) {

    // @ApiProperty({
    //     description: 'The code of the section.',
    //     example: 101,
    // })
    // @Type(() => Number)
    // @IsInt({ message: 'Section code must be an integer.' })
    // @Min(1, { message: 'Section code must be a positive integer.' })
    // @Max( 1000, { message: 'Section code cannot exceed 1000.' } )
    // @IsNotEmpty({ message: 'Section code is required.' })
    // code: number;

}
