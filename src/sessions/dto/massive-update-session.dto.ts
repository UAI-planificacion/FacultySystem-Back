import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

import {
    IsArray,
    IsBoolean,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Length,
    Max,
    MaxLength,
    Min
}                   from "class-validator";
import { Type }     from "class-transformer";
import { $Enums }   from "generated/prisma";


export class MassiveUpdateSessionDto {

    @ApiProperty({
		type        : Array,
		description : 'IDs of the sessions to update.',
		example     : ['SESS001', 'SESS002']
	})
    @IsArray()
    @IsString({ each: true })
    ids: string[]


    @ApiPropertyOptional({
		enum        : $Enums.SessionName,
		description : 'Tipo de sesión: C (Cátedra), A (Ayudantía), T (Taller), L (Laboratorio)',
		example     : $Enums.SessionName.C
	})
	@IsEnum( $Enums.SessionName )
    @IsOptional()
	name?: $Enums.SessionName;


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
		type        : String,
        description : 'ID of the space assigned to the section.',
		example     : 'SPACE001'
	})
	@IsOptional()
    @IsString({ message: 'Space ID must be a string.' })
    @Length( 1, 10 )
	spaceId?: string;


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
	isEnglish?: boolean;

}
