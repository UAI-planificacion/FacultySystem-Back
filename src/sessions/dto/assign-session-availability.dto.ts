import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
	ArrayNotEmpty,
	IsArray,
	IsEnum,
	IsOptional,
	IsString,
	ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';


export class AssignSessionAvailabilityDto {

	@ApiProperty({
		description : 'ID de la sesión a actualizar',
		example     : '01HKXYZ123ABC456DEF789'
	})
	@IsString()
	sessionId   : string;


	@ApiPropertyOptional({
		description : 'ID del espacio a asignar cuando el tipo es space',
		example     : 'A101'
	})
	@IsOptional()
	@IsString()
	spaceId     ?: string;


	@ApiPropertyOptional({
		description : 'ID del profesor a asignar cuando el tipo es professor',
		example     : 'PROF001'
	})
	@IsOptional()
	@IsString()
	professorId ?: string;

}


export enum AssignAvailabilityType {
	space       = 'space',
	professor   = 'professor'
}


export class AssignSessionAvailabilityRequestDto {

	@ApiProperty({
		description : 'Tipo de asignación a ejecutar',
		enum        : AssignAvailabilityType,
		example     : AssignAvailabilityType.space
	})
	@IsEnum( AssignAvailabilityType )
	type        : AssignAvailabilityType;


	@ApiProperty({
		description : 'Listado de sesiones a actualizar con su disponibilidad seleccionada',
		type        : [AssignSessionAvailabilityDto]
	})
	@IsArray()
	@ArrayNotEmpty()
	@ValidateNested({ each: true })
	@Type( () => AssignSessionAvailabilityDto )
	assignments : AssignSessionAvailabilityDto[];

}
