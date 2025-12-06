import { IsArray, IsNotEmpty, IsString, ArrayMinSize } from 'class-validator';
import { ApiProperty }                                  from '@nestjs/swagger';

export class ChangeMassiveStatusDto {

	@ApiProperty({
		description : 'Array of section IDs to change status',
		example     : ['01HX5ZQXQXQXQXQXQXQXQXQX', '01HX5ZQXQXQXQXQXQXQXQXQXQY'],
		type        : [String],
	})
	@IsArray({ message: 'sectionIds must be an array' })
	@ArrayMinSize( 1, { message: 'sectionIds must contain at least one ID' })
	@IsString({ each: true, message: 'Each section ID must be a string' })
	@IsNotEmpty({ each: true, message: 'Section IDs cannot be empty' })
	sectionIds : string[];

}