import { ApiProperty } from '@nestjs/swagger';

import {
	IsNumber,
	IsString
} from 'class-validator';


export class AssignSessionRegisteredDto {

	@ApiProperty({
		description : 'ID de la sección a actualizar',
		example     : '01HKXYZ123ABC456DEF789'
	})
	@IsString()
	sectionId : string;


	@ApiProperty({
		description : 'Número de estudiantes registrados en la sección',
		example     : 25
	})
	@IsNumber()
	registered : number;

}
