import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsArray,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Length,
    Max,
    Min
}                   from 'class-validator';
import { $Enums }   from 'generated/prisma';


export class CreateMassiveSessionDto {

    @ApiProperty({
		enum        : $Enums.SessionName,
		description : 'Tipo de sesión: C (Cátedra), A (Ayudantía), T (Taller), L (Laboratorio)',
		example     : $Enums.SessionName.C
	})
    @IsEnum( $Enums.SessionName )
    session: $Enums.SessionName;


    @ApiProperty({
        type        : [Number],
        description : 'IDs de los módulos de día (combinación de día y módulo)',
        example     : [1, 2, 3]
    })
    @IsArray()
    @IsInt({ each: true })
    @Min( 1, { each: true })
    @Max( 1000, { each: true })
    dayModuleIds: number[];


    @ApiPropertyOptional({
        type        : String,
        description : 'ID de la sala asignada para la sesión',
        example     : 'A101'
    })
    @IsOptional()
    @IsString()
    @Length( 1, 10 )
    spaceId?: string;


    @ApiPropertyOptional({
        type        : String,
        description : 'ID del profesor asignado para la sesión',
        example     : 'PROF001'
    })
    @IsOptional()
    @IsString()
    @Length( 1, 10 )
    professorId?: string;

}
