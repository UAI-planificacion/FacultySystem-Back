import { ApiProperty, ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';

import {
    IsNotEmpty,
    IsDate,
    IsOptional,
    IsEnum,
}                   from 'class-validator';
import { Type }     from 'class-transformer';
import { $Enums }   from 'generated/prisma';

import { SpaceSizeIdDto }   from '@commons/dtos/size.dto';
import { ProfessorIdDto }   from '@commons/dtos/profesorId.dto';
import { SpaceTypeDto }     from '@commons/dtos/space-type.dto';


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


    @ApiPropertyOptional({
        description: 'The building of the section.',
        example: $Enums.Building.PREGRADO_A,
    })
    @IsOptional()
    @IsEnum($Enums.Building, { message: 'Section building must be a valid building.' })
    building?: $Enums.Building;

}
