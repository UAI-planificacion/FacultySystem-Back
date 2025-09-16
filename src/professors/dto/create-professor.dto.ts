import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
    IsBoolean,
    IsEmail,
    IsNotEmpty,
    IsOptional,
    IsString,
    MinLength,
} from 'class-validator';


export class CreateProfessorDto {

    @ApiProperty({
        description: 'The unique identifier for the professor (e.g., employee ID or a unique code).',
        example: 'PROF001',
        minLength: 3,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    id: string;

    @ApiProperty({
        description: 'The full name of the professor.',
        example: 'Dr. Jane Doe',
        minLength: 3,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @ApiPropertyOptional({
        description: 'The email address of the professor. Must be a valid email format if provided.',
        example: 'jane.doe@example.com',
    })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiPropertyOptional({
        description: 'Indicates whether the professor is a mock professor (e.g., for testing purposes).',
        example: false,
    })
    @IsOptional()
    @IsBoolean()
    isMock: boolean = false;

}
