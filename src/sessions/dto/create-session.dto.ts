import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsString } from 'class-validator';
import { BaseSessionDto } from '@sessions/dto/base-session.dto';


export class CreateSessionDto extends BaseSessionDto {

	@ApiProperty({
		type        : String,
		description : 'ID de la sección a la que pertenece la sesión',
		example     : '01HKXYZ123ABC456DEF789'
	})
	@IsString()
	sectionId: string;

}
