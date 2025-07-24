import { ApiProperty } from '@nestjs/swagger';

import { IsString, Length } from 'class-validator';


export class StaffCreateIdDTO {

    @ApiProperty({ 
        description : 'ID of the staff member creating the request',
        example     : '01H9XKJ8WXKJ8WXKJ8WXKJ8WX'
    })
    @IsString()
    @Length( 23, 28 )
    staffCreateId: string;

}
