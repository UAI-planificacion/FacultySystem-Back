import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { IsBoolean, IsEmail, IsOptional, IsString, Length } from 'class-validator';


export class CreateProfessorDto {

    @ApiProperty({
        description : 'Full name of the professor',
        example     : 'John Doe',
        minLength   : 2,
        maxLength   : 255
    })
    @IsString()
    @Length( 2, 255 )
    name: string;

    @ApiPropertyOptional({
        description : 'Email address of the professor',
        example     : 'john.doe@example.com',
        maxLength   : 255
    })
    @IsOptional()
    @IsEmail()
    @Length( 0, 255 )
    email?: string;

    @ApiPropertyOptional({
        description : 'Indicates if this is a mock professor',
        default     : false
    })
    @IsOptional()
    @IsBoolean()
    isMock: boolean = false;

}
