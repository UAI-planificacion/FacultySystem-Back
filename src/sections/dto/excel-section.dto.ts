import { ApiProperty } from '@nestjs/swagger';

import {
	IsArray,
	ValidateNested
}                   from 'class-validator';
import { Type }     from 'class-transformer';
import { $Enums }   from 'generated/prisma';

import { CreateSectionDto } from '@sections/dto/create-section.dto';

/**
 * Interface representing the structure of Excel columns for section offer import
 */
export interface IExcelSection {
	periodId			: string;
	subjectId			: string;
	professorId			: string | undefined;
	spaceSizeId			: $Enums.SizeValue;
	spaceType			: $Enums.SpaceType;
	startDate			: Date | string;
	endDate				: Date | string;
	building			: $Enums.Building | undefined;
	laboratory			: number;
	lecture				: number;
	tutoringSession     : number;
	workshop			: number;
	numberOfSections	: number;
}

/**
 * DTO for bulk section offer creation from Excel import
 */
export class BulkCreateSectionDto {

	@ApiProperty({
		description	: 'Array of section offers to create in bulk',
		isArray		: true,
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type( () => CreateSectionDto )
	sections: CreateSectionDto[];

}
