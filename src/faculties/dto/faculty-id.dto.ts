import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsNotEmpty } from 'class-validator';


export class FacultyIdDto {

    @ApiProperty({
        description: 'The ID of the faculty',
        example: '01H8ZQN3Y4V5X6P7R9S0T1U2V3',
    })
    @IsString()
    @IsNotEmpty()
    facultyId: string;

}