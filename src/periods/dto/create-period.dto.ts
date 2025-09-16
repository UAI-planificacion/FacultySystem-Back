import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsDate,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
}                       from 'class-validator';
import { Transform }    from 'class-transformer';


export class CreatePeriodDto {
    @ApiProperty({
        description: 'The unique identifier for the period (e.g., academic year and semester).',
        example: '2024-02',
        minLength: 3,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    id: string;

    @ApiProperty({
        description: 'The name of the period.',
        example: 'Second Semester 2024',
        minLength: 5,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(5)
    name: string;

    @ApiPropertyOptional({
        description: 'The start date of the period.',
        example: '2024-08-01T00:00:00.000Z',
        type: Date,
    })
    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    startDate?: Date;

    @ApiPropertyOptional({
        description: 'The end date of the period.',
        example: '2024-12-15T23:59:59.000Z',
        type: Date,
    })
    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    endDate?: Date;

    @ApiPropertyOptional({
        description: 'The opening date for period-related activities (e.g., enrollment).',
        example: '2024-07-15T00:00:00.000Z',
        type: Date,
    })
    @IsOptional()
    @Transform(({ value }) => new Date(value))
    @IsDate()
    openingDate?: Date;

    @ApiPropertyOptional({
        description: 'The closing date for period-related activities.',
        example: '2024-07-30T23:59:59.000Z',
        type: Date,
    })
    @IsOptional()
	@Transform(({ value }) => new Date(value))
    @IsDate()
    closingDate?: Date;

}
