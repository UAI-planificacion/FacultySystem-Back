import { ApiProperty } from '@nestjs/swagger';

import { IsString, Length } from 'class-validator';


export class StaffUpdateIdDTO {

    @ApiProperty({
        description : 'ID of the staff member updating the request',
        example     : '01H9XKJ8WXKJ8WXKJ8WXKJ8WX'
    })
    @IsString()
    @Length( 23, 28 )
    staffUpdateId: string;

}
