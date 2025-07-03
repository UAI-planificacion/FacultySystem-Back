import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class BasicSubjectDto {

    @ApiProperty({
        description: 'The name of the subject',
        example: 'Mathematics 101',
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({
        description: 'The start date of the subject',
        example: '2025-08-01T00:00:00.000Z',
    })
    @IsDateString()
    @IsOptional()
    startDate?: Date;

    @ApiPropertyOptional({
        description: 'The end date of the subject',
        example: '2025-12-15T00:00:00.000Z',
    })
    @IsDateString()
    @IsOptional()
    endDate?: Date;

    @ApiProperty({
        description: 'Number of students in the subject',
        example: 30,
    })
    @IsInt()
    @IsNotEmpty()
    students: number;

    @ApiProperty({
        description: 'The cost center ID for the subject',
        example: 'CC-2025-MATH-101',
    })
    @IsString()
    @IsNotEmpty()
    costCenterId: string;

}
