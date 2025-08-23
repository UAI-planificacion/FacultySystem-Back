import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
    Size,
    SpaceType,
    Building
} from 'generated/prisma';

import {
    IsArray,
    IsBoolean,
    IsDate,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString
}               from 'class-validator';
import { Type } from 'class-transformer';


export class BasicSubjectDto {

    @ApiProperty({
        description : 'The id of the subject',
        example     : 'sub-1234567890',
    })
    @IsString()
    @IsNotEmpty()
    id: string;

    @ApiProperty({
        description : 'The name of the subject',
        example     : 'Mathematics 101',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({
        description : 'The start date of the subject',
        example     : '2025-08-01T00:00:00.000Z',
    })
    @IsOptional()
    @IsArray()
    @IsDate({ each: true })
    @Type( () => Date )
    startDate: Date[] = [];

    @ApiPropertyOptional({
        description : 'The end date of the subject',
        example     : '2025-12-15T00:00:00.000Z',
    })
    @IsOptional()
    @IsArray()
    @IsDate({ each: true })
    @Type( () => Date )
    endDate: Date[] = [];

    @ApiProperty({
        description : 'Number of students in the subject',
        example     : 30,
    })
    @IsInt()
    @IsNotEmpty()
    students: number;

    @ApiProperty({
        description : 'The cost center ID for the subject',
        example     : 'CC-2025-MATH-101',
    })
    @IsString()
    @IsNotEmpty()
    costCenterId: string;

    @ApiPropertyOptional({
        description : 'Is English',
        example     : true
    })
    @IsOptional()
    @IsBoolean()
    isEnglish?: boolean;

    @ApiPropertyOptional({
        enum        : Object.values( Building ),
        description : 'Building name or identifier'
    })
    @IsOptional()
    @IsString()
    @IsEnum( Building )
    building?: Building;

    @ApiPropertyOptional({
        enum        : Object.values( SpaceType ),
        description : 'Type of space'
    })
    @IsOptional()
    @IsString()
    @IsEnum( SpaceType )
    spaceType?: SpaceType;

    @ApiPropertyOptional({
        enum        : Object.values( Size ),
        description : 'Size of the space'
    })
    @IsOptional()
    @IsString()
    @IsEnum( Size )
    spaceSize?: Size;

}
