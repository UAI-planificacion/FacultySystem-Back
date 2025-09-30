import { ApiProperty } from '@nestjs/swagger';

import {
	IsArray,
	ValidateNested
}                                       from 'class-validator';
import { Type }                         from 'class-transformer';
import { Building, Size, SizeValue, SpaceType }    from 'generated/prisma';

import { BasicSubjectDto } from '@subjects/dto/basic-subject.dto';


/**
 * Interface representing the structure of Excel columns for subject import
 */
export interface IExcelSubject {
	id				: string;
	name			: string;
	facultyId		: string;
    spaceType       : SpaceType | undefined;
    spaceSizeId     : SizeValue | undefined;
    workshop        : number;
    lecture         : number;
    tutoringSession : number;
    laboratory      : number;
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
