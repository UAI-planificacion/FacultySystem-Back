import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsEnum,
    IsOptional,
    IsString,
    IsInt,
    IsBoolean,
    Min,
    Max,
    MaxLength,
    Length,
    IsDate,
    IsNotEmpty
}                           from 'class-validator';
import { Transform, Type }  from 'class-transformer';
import { $Enums }           from 'generated/prisma';


export class BaseSessionDto {

	@ApiProperty({
		enum        : $Enums.SessionName,
		description : 'Tipo de sesión: C (Cátedra), A (Ayudantía), T (Taller), L (Laboratorio)',
		example     : $Enums.SessionName.C
	})
	@IsEnum( $Enums.SessionName )
	name: $Enums.SessionName;


	@ApiProperty({
		type        : String,
		description : 'Sala asignada para la sesión',
		example     : 'A101'
	})
	@IsString()
    @Length( 1, 50 )
    @IsOptional()
	spaceId?: string;


    @ApiPropertyOptional({
		type        : String,
        description : 'ID of the professor assigned to the section.',
		example     : 'PROF001'
	})
	@IsOptional()
    @IsString({ message: 'Professor ID must be a string.' })
    @Length( 1, 10 )
	professorId?: string;


	@ApiProperty({
		type        : Number,
        description: 'ID of the day-module (schedule slot) for the section.',
		example     : 1,
		minimum     : 1
	})
    @IsInt({ message: 'DayModule ID must be an integer.' })
    @Min( 1, { message: 'DayModule ID cannot be negative.' })
    @Max( 100000, { message: 'DayModule ID cannot exceed 1000.' } )
	@Transform(({ value }) => parseInt( value ))
	dayModuleId: number;


    @ApiPropertyOptional({
		type        : Number,
        description : 'Number of corrected registrants for the section.',
		example     : 25,
		minimum     : 0
	})
	@IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Corrected registrants must be an integer.' })
    @Min(0, { message: 'Corrected registrants cannot be negative.' })
    @Max( 1000, { message: 'Corrected registrants cannot exceed 1000.' } )
    correctedRegistrants?: number;


	@ApiPropertyOptional({
		type        : Number,
        description: 'Number of real registrants for the section.',
		example     : 23,
		minimum     : 0
	})
	@IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Real registrants must be an integer.' })
    @Min(0, { message: 'Real registrants cannot be negative.' })
    @Max( 1000, { message: 'Real registrants cannot exceed 1000.' } )
    realRegistrants?: number;


	@ApiPropertyOptional({
		type        : String,
		description : 'Edificio planificado para la sesión',
		example     : 'Edificio A'
	})
	@IsOptional()
    @IsString({ message: 'Planned building must be a string.' })
    @MaxLength(10)
	plannedBuilding?: string;


	@ApiPropertyOptional({
		type        : Number,
		description : 'Número de sillas disponibles en el espacio',
		example     : 30,
		minimum     : 0
	})
	@IsOptional()
    @Type(() => Number)
    @IsInt({ message: 'Chairs available must be an integer.' })
    @Min(0, { message: 'Chairs available cannot be negative.' })
    @Max( 100, { message: 'Chairs available cannot exceed 100.' } )
	chairsAvailable?: number;


	@ApiPropertyOptional({
		type        : Boolean,
		description : 'Indica si la sesión se imparte en inglés',
		example     : false,
		default     : false
	})
	@IsOptional()
	@IsBoolean()
	isEnglish: boolean = false;


    @ApiProperty({
        type        : String,
        description : 'Fecha de la sesión',
        example     : '2025-10-02'
    })
    @Type(() => Date)
    @IsDate({ message: 'Section end date must be a valid date.' })
    @IsNotEmpty({ message: 'Section end date is required.' })
    date: Date;

}
