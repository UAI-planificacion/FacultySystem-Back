import { ApiProperty, ApiPropertyOptional, IntersectionType } from '@nestjs/swagger';

import {
    IsEnum,
    IsOptional,
    IsString,
    IsInt,
    IsBoolean,
    Min,
    Max,
    MaxLength,
    Length
}                           from 'class-validator';
import { Transform, Type }  from 'class-transformer';
import { $Enums }           from 'generated/prisma';
import { PeriodIdDto } from '@app/sections/dto/fields/periodId.dto';


export class CreateSessionDto {

	@ApiProperty({
		enum        : $Enums.SessionName,
		description : 'Tipo de sesión: C (Cátedra), A (Ayudantía), T (Taller), L (Laboratorio)',
		example     : $Enums.SessionName.C
	})
	@IsEnum( $Enums.SessionName )
	name: $Enums.SessionName;


	@ApiPropertyOptional({
		type        : String,
		description : 'Sala asignada para la sesión',
		example     : 'A101'
	})
	@IsOptional()
	@IsString()
	spaceId?: string;


	// @ApiProperty({
	// 	type        : String,
	// 	description : 'ID de la sección a la que pertenece la sesión',
	// 	example     : '01HKXYZ123ABC456DEF789'
	// })
	// @IsString()
	// sectionId: string;


	@ApiPropertyOptional({
		type        : String,
        description : 'ID of the professor assigned to the section.',
		example     : 'PROF001'
	})
	@IsOptional()
    @IsString({ message: 'Professor ID must be a string.' })
    @Length( 1, 10 )
	professorId?: string;


	@ApiPropertyOptional({
		type        : Number,
        description: 'ID of the day-module (schedule slot) for the section.',
		example     : 1,
		minimum     : 1
	})
	@IsOptional()
    @IsInt({ message: 'DayModule ID must be an integer.' })
    @Min( 1, { message: 'DayModule ID cannot be negative.' })
    @Max( 100000, { message: 'DayModule ID cannot exceed 1000.' } )
	@Transform(({ value }) => parseInt( value ))
	dayModuleId?: number;


	// @ApiPropertyOptional({
	// 	enum        : $Enums.SizeValue,
	// 	description : 'Tamaño del espacio requerido para la sesión',
	// 	example     : $Enums.SizeValue.M
	// })
	// @IsOptional()
	// @IsEnum( $Enums.SizeValue )
	// size?: $Enums.SizeValue;


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
	// @Transform(({ value }) => {
	// 	if ( typeof value === 'string' ) {
	// 		return value.toLowerCase() === 'true';
	// 	}
	// 	return Boolean( value );
	// })
	isEnglish: boolean = false;

}
