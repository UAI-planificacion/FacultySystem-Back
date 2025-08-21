import { ApiProperty } from '@nestjs/swagger';

import {
	IsArray,
	IsBoolean,
	IsDate,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsString,
	ValidateNested
}				from 'class-validator';
import { Type }		from 'class-transformer';


/**
 * Interface representing the structure of Excel columns for subject import
 */
export interface IExcelSubject {
	id				: string;
	name			: string;
	startDate		: string[];
	endDate			: string[];
	students		: number;
	costCenterId	: string;
	isEnglish		: boolean;
	facultyId		: string;
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
	@Type( () => ExcelSubjectDto )
	subjects: ExcelSubjectDto[];

}


/**
 * DTO for individual subject from Excel data
 */
export class ExcelSubjectDto {

	@ApiProperty({
		description	: 'The id of the subject',
		example		: 'sub-1234567890',
	})
	@IsString()
	@IsNotEmpty()
	id: string;

	@ApiProperty({
		description	: 'The name of the subject',
		example		: 'Mathematics 101',
	})
	@IsString()
	@IsNotEmpty()
	name: string;

	@ApiProperty({
		description	: 'The start date of the subject as string array',
		example		: ['2025-08-01', '2025-09-01'],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	startDate: string[] = [];

	@ApiProperty({
		description	: 'The end date of the subject as string array',
		example		: ['2025-12-15', '2025-12-20'],
	})
	@IsOptional()
	@IsArray()
	@IsString({ each: true })
	endDate: string[] = [];

	@ApiProperty({
		description	: 'Number of students in the subject',
		example		: 30,
	})
	@IsInt()
	@IsNotEmpty()
	students: number;

	@ApiProperty({
		description	: 'The cost center ID for the subject',
		example		: 'CC-2025-MATH-101',
	})
	@IsString()
	@IsNotEmpty()
	costCenterId: string;

	@ApiProperty({
		description	: 'Is English subject',
		example		: true
	})
	@IsOptional()
	@IsBoolean()
	isEnglish?: boolean;

	@ApiProperty({
		description	: 'Faculty ID',
		example		: '01H9XKJ8WXKJ8WXKJ8WXKJ8WX'
	})
	@IsString()
	@IsNotEmpty()
	facultyId: string;

}