import { ApiProperty, ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';
import {
    IsInt,
    IsString,
    IsOptional,
    Min,
    MaxLength,
    Max,
    Length,
}               from 'class-validator';
import { Type } from 'class-transformer';

import { CommunFilefsSectionDto }   from '@sections/dto/commun-fields.dto';
import { SizeDto }                  from '@sections/dto/fields/size.dto';


export class BasicSectionDto extends IntersectionType(
    SizeDto,
    CommunFilefsSectionDto 
) {

    @ApiPropertyOptional({
        description: 'Number of corrected registrants for the section.',
        example: 30,
        minimum: 0,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Corrected registrants must be an integer.' })
    @Min(0, { message: 'Corrected registrants cannot be negative.' })
    @Max( 1000, { message: 'Corrected registrants cannot exceed 1000.' } )
    correctedRegistrants?: number;

    @ApiPropertyOptional({
        description: 'Number of real registrants for the section.',
        example: 28,
        minimum: 0,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Real registrants must be an integer.' })
    @Min(0, { message: 'Real registrants cannot be negative.' })
    @Max( 1000, { message: 'Real registrants cannot exceed 1000.' } )
    realRegistrants?: number;

    @ApiPropertyOptional({
        description: 'Planned building for the section.',
        example: 'Building A',
        maxLength: 10,
    })
    @IsOptional()
    @IsString({ message: 'Planned building must be a string.' })
    @MaxLength(10)
    plannedBuilding?: string;

    @ApiPropertyOptional({
        description: 'Number of chairs available for the section.',
        example: 35,
        minimum: 0,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Chairs available must be an integer.' })
    @Min(0, { message: 'Chairs available cannot be negative.' })
    @Max( 100, { message: 'Chairs available cannot exceed 100.' } )
    chairsAvailable?: number;

    @ApiPropertyOptional({
        description: 'ID of the professor assigned to the section.',
        example: 'clqkf3z0j0000z987abcd1234',
    })
    @IsOptional()
    @IsString({ message: 'Professor ID must be a string.' })
    @Length( 1, 10 )
    professorId?: string;

    @ApiPropertyOptional({
        description: 'ID of the room assigned to the section.',
        example: 'clqkf4a1k0001z987efgh5678',
    })
    @IsOptional()
    @Length( 1, 20 )
    @IsString({ message: 'Room ID must be a string.' })
    roomId?: string;

    @ApiPropertyOptional({
        description: 'ID of the day-module (schedule slot) for the section.',
        example: 1,
    })
    @Type(() => Number)
    @IsInt({ message: 'DayModule ID must be an integer.' })
    @IsOptional()
    dayModuleId?: number;

}
