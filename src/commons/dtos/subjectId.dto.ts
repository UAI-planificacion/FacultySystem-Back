import { ApiProperty } from '@nestjs/swagger';

import { IsString, Length } from 'class-validator';


export class SubjectIdDto {

    @ApiProperty({
        description : 'ID of the subject assigned to the section.',
        example     : 'MATH001',
    })
    @IsString({ message: 'Subject ID must be a string.' })
    @Length( 3, 10 )
    subjectId: string;

}
