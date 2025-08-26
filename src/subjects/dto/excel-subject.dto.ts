import { ApiProperty } from '@nestjs/swagger';

import {
	IsArray,
	ValidateNested
}                                       from 'class-validator';
import { Type }                         from 'class-transformer';
import { Building, Size, SpaceType }    from 'generated/prisma';

import { BasicSubjectDto } from '@subjects/dto/basic-subject.dto';


/**
 * Interface representing the structure of Excel columns for subject import
 */
export interface IExcelSubject {
	id				: string;
	name			: string;
	startDate		: string[] | Date[];
	endDate			: string[] | Date[];
	students		: number;
	costCenterId	: string;
	isEnglish		: boolean;
	facultyId		: string;
    building?       : Building | undefined;
    spaceType?      : SpaceType | undefined;
    spaceSize?      : Size |undefined;
}


/**
 * DTO for bulk subject creation from Excel import
 */
export class BulkCreateSubjectDto {

	@ApiProperty({
		description	: 'Array of subjects to create in bulk',
		isArray		: true,
	})
	@IsArray()
	@ValidateNested({ each: true })
	@Type( () => BasicSubjectDto )
	subjects: BasicSubjectDto[];

}
