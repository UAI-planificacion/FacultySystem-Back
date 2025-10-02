import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsDate,
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

    @ApiProperty({
        description: 'The start date of the section.',
        example: '2025-01-01',
    })
    @Type(() => Date)
    @IsDate({ message: 'Section start date must be a valid date.' })
    @IsNotEmpty({ message: 'Section start date is required.' })
    startDate: Date;

    @ApiProperty({
        description: 'The end date of the section.',
        example: '2025-12-31',
    })
    @Type(() => Date)
    @IsDate({ message: 'Section end date must be a valid date.' })
    @IsNotEmpty({ message: 'Section end date is required.' })
    endDate: Date;

}
