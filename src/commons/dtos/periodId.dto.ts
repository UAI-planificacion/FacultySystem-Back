import { ApiProperty } from '@nestjs/swagger';

import { IsString, Length } from 'class-validator';


export class PeriodIdDto {

    @ApiProperty({
        description : 'ID of the professor assigned to the section.',
        example     : '4031',
    })
    @IsString({ message: 'Professor ID must be a string.' })
    @Length( 3, 8 )
    periodId: string;

}
