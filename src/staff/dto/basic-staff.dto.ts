import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, IsEnum, Length } from 'class-validator';
import { Role } from 'generated/prisma';


export class BasicStaffDto {

    @ApiProperty({
        description: 'The name of the staff member',
        example: 'John Doe',
    })
    @IsString()
    @IsNotEmpty()
    @Length(3, 100)
    name: string;

    @ApiProperty({
        description: 'The email of the staff member',
        example: 'john.doe@example.com',
    })
    @IsEmail()
    @IsNotEmpty()
    @Length(3, 100)
    email: string;

    @ApiProperty({
        description: 'The role of the staff member',
        enum: Role,
        example: Role.VIEWER,
    })
    @IsEnum(Role)
    @IsNotEmpty()
    role: Role;

}
