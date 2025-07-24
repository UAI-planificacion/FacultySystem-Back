import { ApiPropertyOptional } from '@nestjs/swagger';

import { IsOptional, IsString, Length } from 'class-validator';


export class StaffUpdateIdDTO {

    @ApiPropertyOptional({
        description : 'ID of the staff member creating the request',
        example     : '01H9XKJ8WXKJ8WXKJ8WXKJ8WX'
    })
    @IsString()
    @IsOptional()
    @Length( 23, 28 )
    staffUpdateId?: string;

}
