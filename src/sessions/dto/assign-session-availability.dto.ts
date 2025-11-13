import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
	IsOptional,
	IsString
} from 'class-validator';


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
