import { ApiProperty } from '@nestjs/swagger';

import {
    IsString,
    Length,
} from 'class-validator';

import { BasicRequestDto } from '@requests/dto/basic-request.dto';


export class CreateRequestDto extends BasicRequestDto {

    @ApiProperty({ 
        description : 'ID of the staff member creating the request',
        example     : '01H9XKJ8WXKJ8WXKJ8WXKJ8WX'
    })
    @IsString()
    @Length( 26, 26 )
    staffCreateId: string;

}
